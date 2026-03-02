
import * as cheerio from "cheerio";
import { chromium, Browser, BrowserContext, Page } from "playwright";
import * as crypto from "crypto";
import { Scholarship } from "../models/Scholarship.js";
import { ScholarshipRepository } from "../repositories/ScholarshipRepository.js";
import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";
import { GeminiIngestionService } from "./GeminiIngestionService.js";
import { ScholarshipSource } from "../models/ScholarshipSource.js";
import { StrategyManager } from "./scraping/StrategyManager.js";
import { AntiDetectionService } from "./common/AntiDetectionService.js";
import { IngestionMetrics } from "./common/IngestionMetrics.js";
import { VectorService } from "./VectorService.js";

export class ScholarshipDiscoveryService {
    private static isRunning = false;
    private static MAX_CONCURRENT_SOURCES = 3;

    static async discoverAll() {
        if (this.isRunning) return;
        this.isRunning = true;

        let browser: Browser | null = null;

        try {
            browser = await chromium.launch({
                headless: true,
                ...AntiDetectionService.getStealthOptions()
            });

            const sources = await ScholarshipSourceRepository.findAllActive();
            console.log(`Starting discovery for ${sources.length} sources...`);

            // Process sources with limited concurrency
            for (let i = 0; i < sources.length; i += this.MAX_CONCURRENT_SOURCES) {
                const chunk = sources.slice(i, i + this.MAX_CONCURRENT_SOURCES);
                await Promise.all(chunk.map(source => this.processSource(source, browser!)));
            }

        } catch (error) {
            console.error("discoverAll error:", error);
        } finally {
            if (browser) await browser.close();
            this.isRunning = false;
            console.log("Discovery cycle completed.");
        }
    }

    private static async processSource(source: ScholarshipSource, browser: Browser) {
        IngestionMetrics.startSession(source.domainName);
        const strategyManager = new StrategyManager(source.domainName);

        try {
            console.log(`[SOURCE] ${source.domainName} - Starting adaptive scrape...`);

            const result = await strategyManager.executeAdaptiveScrape(source.baseUrl, browser);
            IngestionMetrics.setLinksFound(source.domainName, result.links.length);

            // Fetch current domain scholarships to check for existance efficiently if needed
            // For now, we'll check individually in ingestScholarshipPage as requested in UPDATE POLICY

            for (const link of result.links.slice(0, 10)) {
                await this.ingestScholarshipPage(link, source.id, strategyManager, browser);
                await AntiDetectionService.getRandomDelay(3000, 7000);
            }

        } catch (error: any) {
            console.error(`processSource error (${source.domainName}):`, error.message);
            IngestionMetrics.increment(source.domainName, 'failedCount');
        } finally {
            IngestionMetrics.endSession(source.domainName);
            await source.update({ lastScraped: new Date() });
        }
    }

    private static async ingestScholarshipPage(
        url: string,
        sourceId: number,
        strategyManager: StrategyManager,
        browser: Browser
    ) {
        try {
            const existingScholarship = await Scholarship.findOne({ where: { originalUrl: url } });

            // Adaptive strategy selection for the page itself
            const result = await strategyManager.executeAdaptiveScrape(url, browser);
            const cleanText = result.text.replace(/\s+/g, " ").trim();
            const contentHash = crypto.createHash("md5").update(cleanText).digest("hex");

            if (existingScholarship) {
                if (existingScholarship.contentHash === contentHash) {
                    IngestionMetrics.logIngestion(url, result.strategy, 'SKIP', 'Unchanged content');
                    IngestionMetrics.increment(existingScholarship.sourceId ? 'source' : 'unknown', 'skippedDuplicates');
                    return;
                }
                console.log(`[UPDATE] Content changed for ${url}`);
            }

            // Extraction logic
            const $ = cheerio.load(result.html);
            const metadata = this.extractMetadata($);

            const foundDeadline =
                this.extractDeadlineFromJsonLd($) ||
                this.extractDeadlineContextual(cleanText);

            const normalizedDeadline = this.normalizeDate(foundDeadline);
            const deadlineValue = normalizedDeadline ? new Date(normalizedDeadline) : null;


            // if (!deadlineValue) {
            //     IngestionMetrics.logIngestion(url, result.strategy, 'SKIP', 'No deadline found');
            //     return;
            // }

            // if (deadlineValue < new Date()) {
            //     IngestionMetrics.logIngestion(url, result.strategy, 'SKIP', 'Expired');
            //     IngestionMetrics.increment('source', 'skippedExpired');
            //     return;
            // }

            const manualRequirements = this.extractRequirementsContextual(cleanText);
            const manualIntakeSeason = this.extractIntakeSeasonContextual(cleanText);
            const manualCountry = this.extractCountryContextual(cleanText, url);
            const regexData = this.quickRegex(cleanText);

            const title = (metadata.title || regexData.title || "Untitled").substring(0, 500);
            const description = (metadata.description || cleanText.substring(0, 800)).substring(0, 2000);

            if (title.length < 5 || description.length < 100) {
                IngestionMetrics.logIngestion(url, result.strategy, 'SKIP', 'Low quality');
                return;
            }

            // Upsert / Update
            const scholarshipData: any = {
                sourceId,
                title,
                description,
                amount: metadata.amount || regexData.amount || "Unknown",
                fundType: metadata.fundType || regexData.fundType || "Other",
                deadline: deadlineValue,
                degree_levels: regexData.degreeLevels.length ? regexData.degreeLevels : ["Other"],
                requirements: metadata.requirements || manualRequirements || null,
                intakeSeason: metadata.intakeSeason || manualIntakeSeason || null,
                country: metadata.country || manualCountry || null,
                originalUrl: url,
                contentHash,
            };

            // Embedding
            const vector = await VectorService.generateScholarshipEmbedding(scholarshipData);
            console.log("DEBUG: Vector Length is:", vector.length);
            scholarshipData.embedding = `[${vector.join(',')}]`; 
            if (existingScholarship?.id) {
                scholarshipData.id = existingScholarship.id;
            }

            await ScholarshipRepository.upsert(scholarshipData);

            IngestionMetrics.logIngestion(url, result.strategy, 'SUCCESS');
            // Find the source name for metrics
            const source = await ScholarshipSource.findByPk(sourceId);
            if (source) IngestionMetrics.increment(source.domainName, 'successfulIngestions');

        } catch (error: any) {
            console.error(`ingestScholarshipPage error (${url}):`, error.message);
            // Find source name for metrics if possible
            const source = await ScholarshipSource.findByPk(sourceId);
            if (source) IngestionMetrics.increment(source.domainName, 'failedCount');
        }
    }

    // ============================================================
    // CONTENT EXTRACTION (Utility methods kept from original)
    // ============================================================

    private static extractMetadata($: any) {
        const title =
            $('meta[property="og:title"]').attr("content") ||
            $('meta[name="twitter:title"]').attr("content") ||
            $("title").text() ||
            "";

        const description =
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="twitter:description"]').attr("content") ||
            $('meta[name="description"]').attr("content") ||
            "";

        let amount = $('meta[property="scholarship:amount"]').attr("content") || "";
        let fundType = $('meta[property="scholarship:type"]').attr("content") || "";
        let requirements = "";
        let intakeSeason = "";
        let country = $('meta[name="geo.region"]').attr("content") || $('meta[name="geo.placename"]').attr("content") || "";

        $('script[type="application/ld+json"]').each((_: any, el: any) => {
            try {
                const json = JSON.parse($(el).html() || "{}");
                const data = Array.isArray(json) ? json[0] : json;

                amount = amount || data.baseSalary?.value || data.amount;
                fundType = fundType || data.fundingType || data.category;
                requirements = requirements || data.eligibility || data.educationalRequirements;
                intakeSeason = intakeSeason || data.startDate || data.term;
                country = country || data.address?.addressCountry || data.location?.address?.addressCountry;
            } catch (e) { }
        });

        return {
            title: title?.trim(),
            description: description?.trim(),
            amount: amount?.toString(),
            fundType: fundType?.toString(),
            requirements: requirements?.toString(),
            intakeSeason: intakeSeason?.toString(),
            country: country?.toString()
        };
    }

    private static extractDeadlineFromJsonLd($: any): string | null {
        const scripts = $('script[type="application/ld+json"]');
        for (const el of scripts.toArray()) {
            try {
                const json = JSON.parse($(el).html() || "{}");
                const data = Array.isArray(json) ? json[0] : json;
                const fields = ["applicationDeadline", "endDate", "validThrough", "closingDate"];
                for (const field of fields) {
                    if (data[field]) return data[field];
                }
            } catch { }
        }
        return null;
    }

    private static extractDeadlineContextual(text: string): string | null {
        const regex = /(?:deadline|closing|apply by|due date|expires)[^.\n]{0,100}/gi;
        const matches = text.match(regex);
        if (!matches) return null;
        for (const segment of matches) {
            const date = this.findDateInText(segment);
            if (date) return date;
        }
        return null;
    }

    private static extractRequirementsContextual(text: string): string | null {
        const regex = /(?:eligibility|requirements|who can apply|criteria)[^.\n]{0,300}/gi;
        const match = text.match(regex);
        return match ? match[0].trim() : null;
    }

    private static extractIntakeSeasonContextual(text: string): string | null {
        const regex = /(?:intake|start date|commencement|academic year|session)[^.\n]{0,100}/gi;
        const matches = text.match(regex);
        if (!matches) return null;
        const seasons = ["Fall", "Spring", "Summer", "Winter", "Autumn"];
        for (const segment of matches) {
            for (const season of seasons) {
                if (segment.includes(season)) {
                    const yearMatch = segment.match(/\b20\d{2}\b/);
                    return yearMatch ? `${season} ${yearMatch[0]}` : season;
                }
            }
        }
        return null;
    }

    private static extractCountryContextual(text: string, baseUrl: string): string | null {
        try {
            const url = new URL(baseUrl);
            const domainParts = url.hostname.split('.');
            const tld = domainParts[domainParts.length - 1];
            if (tld && tld.length === 2 && tld !== 'com' && tld !== 'org' && tld !== 'net' && tld !== 'edu') {
                return tld.toUpperCase();
            }
        } catch { }

        const countryKeywords = ["USA", "United States", "UK", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "China", "Ethiopia"];
        for (const country of countryKeywords) {
            if (text.includes(country)) return country;
        }
        return null;
    }

    private static findDateInText(text: string): string | null {
        const patterns = [
            /\b\d{4}-\d{2}-\d{2}\b/,
            /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/,
            /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i,
        ];
        for (const p of patterns) {
            const m = text.match(p);
            if (m) return m[0];
        }
        return null;
    }

    private static normalizeDate(d: string | null): string | null {
        if (!d) return null;
        const parsed: any = new Date(d.replace(/(st|nd|rd|th)/gi, ""));
        if (isNaN(parsed.getTime())) return null;
        return parsed.toISOString().split("T")[0];
    }

    private static quickRegex(text: string) {
        const lower = text.toLowerCase();
        const degreeLevels: string[] = [];
        if (lower.match(/bachelor|undergraduate|B\.Sc|B\.A/i)) degreeLevels.push("Bachelor");
        if (lower.match(/master|postgraduate|M\.Sc|M\.A/i)) degreeLevels.push("Master");
        if (lower.match(/phd|doctorate|doctoral/i)) degreeLevels.push("PhD");
        if (lower.includes("diploma")) degreeLevels.push("Diploma");
        if (lower.includes("certificate")) degreeLevels.push("Certificate");
        const amountMatch = text.match(/(?:\$|€|£|USD|EUR)\s?\d{1,3}(?:[.,]\d{3})*/);
        return {
            degreeLevels,
            fundType: lower.includes("full") ? "Full Funding" : (lower.includes("partial") ? "Partial Funding" : "Other"),
            amount: amountMatch ? amountMatch[0] : null,
            title: text.split("\n")[0]
        };
    }
}