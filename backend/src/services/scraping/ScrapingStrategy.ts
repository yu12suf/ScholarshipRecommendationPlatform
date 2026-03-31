import axios from 'axios';
import * as cheerio from 'cheerio';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { AntiDetectionService } from '../common/AntiDetectionService.js';

export type StrategyType = 'STATIC' | 'API' | 'BROWSER' | 'BROWSER_PROXY';

export interface ScrapingResult {
    html: string;
    text: string;
    links: string[];
    strategy: StrategyType;
}

export interface ScrapingStrategy {
    type: StrategyType;
    execute(url: string, context?: any): Promise<ScrapingResult>;
}

// ============================================================
// Blocked-page detection: Cloudflare, CAPTCHA, etc.
// ============================================================
const BLOCKED_INDICATORS = [
    'cloudflare',
    'just a moment',
    'checking your browser',
    'ray id',
    'access denied',
    'please verify you are a human',
    'captcha',
    'blocked',
    'forbidden',
];

function isBlockedPage(text: string): boolean {
    const lower = text.toLowerCase();
    // A real scholarship page should have substantial content.
    // Cloudflare challenge pages are short and contain specific keywords.
    if (lower.length < 500) {
        return BLOCKED_INDICATORS.some(indicator => lower.includes(indicator));
    }
    return false;
}

// ============================================================
// 1. STATIC STRATEGY (Axios + Cheerio)
// ============================================================
export class StaticStrategy implements ScrapingStrategy {
    type: StrategyType = 'STATIC';

    async execute(url: string): Promise<ScrapingResult> {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': AntiDetectionService.getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 30000
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const text = $('body').text();

        // Detect Cloudflare or other block pages in static response
        if (isBlockedPage(text)) {
            throw new Error('Blocked by protection (Cloudflare/CAPTCHA)');
        }

        const links: string[] = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                try {
                    const absoluteUrl = new URL(href, url).toString();
                    links.push(absoluteUrl);
                } catch { }
            }
        });

        return { html, text, links, strategy: this.type };
    }
}

// ============================================================
// 2. API STRATEGY (Detect JSON endpoints)
// ============================================================
export class APIStrategy implements ScrapingStrategy {
    type: StrategyType = 'API';

    // Common API path patterns seen on scholarship aggregator sites
    private static API_PATTERNS = ['/api/', '/v1/', '/v2/', '/graphql', '/rest/', '/data/'];

    async execute(url: string): Promise<ScrapingResult> {
        // Step 1: Try the URL directly with Accept: application/json
        const directResult = await this.tryDirectJsonRequest(url);
        if (directResult) return directResult;

        // Step 2: Probe common API paths derived from the base URL
        const probeResult = await this.probeCommonApiPaths(url);
        if (probeResult) return probeResult;

        throw new Error('Not an API endpoint');
    }

    private async tryDirectJsonRequest(url: string): Promise<ScrapingResult | null> {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': AntiDetectionService.getRandomUserAgent()
                },
                timeout: 15000,
                validateStatus: () => true
            });

            const contentType = response.headers['content-type'] || '';
            if (contentType.includes('application/json') && response.status === 200) {
                return {
                    html: JSON.stringify(response.data),
                    text: JSON.stringify(response.data),
                    links: this.extractLinksFromJson(response.data),
                    strategy: this.type
                };
            }
        } catch { }
        return null;
    }

    private async probeCommonApiPaths(url: string): Promise<ScrapingResult | null> {
        const parsedUrl = new URL(url);
        const baseDomain = `${parsedUrl.protocol}//${parsedUrl.host}`;

        for (const pattern of APIStrategy.API_PATTERNS) {
            try {
                const probeUrl = `${baseDomain}${pattern}`;
                const response = await axios.get(probeUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': AntiDetectionService.getRandomUserAgent()
                    },
                    timeout: 10000,
                    validateStatus: (status) => status < 500
                });

                const contentType = response.headers['content-type'] || '';
                if (contentType.includes('application/json') && response.status === 200) {
                    console.log(`[API] Discovered API endpoint at ${probeUrl}`);
                    return {
                        html: JSON.stringify(response.data),
                        text: JSON.stringify(response.data),
                        links: this.extractLinksFromJson(response.data),
                        strategy: this.type
                    };
                }
            } catch { }
        }
        return null;
    }

    private extractLinksFromJson(data: any): string[] {
        const links: string[] = [];
        const stringified = JSON.stringify(data);
        const urlRegex = /https?:\/\/[^\s"']+/g;
        let match;
        while ((match = urlRegex.exec(stringified)) !== null) {
            links.push(match[0]);
        }
        return [...new Set(links)];
    }
}

// ============================================================
// 3. BROWSER STRATEGY (Playwright - Headless)
// ============================================================
export class BrowserStrategy implements ScrapingStrategy {
    type: StrategyType = 'BROWSER';

    async execute(url: string, browser?: Browser): Promise<ScrapingResult> {
        const localBrowser = browser || await chromium.launch({ headless: true });
        const context = await localBrowser.newContext({
            userAgent: AntiDetectionService.getRandomUserAgent(),
            ...AntiDetectionService.getStealthOptions()
        });
        const page = await context.newPage();

        try {
            // Navigate to the page
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for dynamic content to appear (API-loaded sites like mastersportal)
            // Try to catch any XHR/fetch responses that look like API data
            try {
                await page.waitForResponse(
                    response => response.url().includes('/api/') && response.status() === 200,
                    { timeout: 15000 }
                );
            } catch {
                // No API response detected — that's fine, page may not use one
            }

            // Wait for meaningful content to render
            try {
                await page.waitForFunction(
                    () => (document.body?.innerText || '').length > 1000,
                    { timeout: 20000 }
                );
            } catch {
                // Page may have less content — proceed anyway
            }

            // Small extra wait for any late-loading JS
            await page.waitForTimeout(3000);

            const html = await page.content();
            const text = await page.evaluate(() => document.body.innerText);

            // Detect if we landed on a block page
            if (isBlockedPage(text)) {
                throw new Error('Blocked by Cloudflare/CAPTCHA in browser');
            }

            const links = await page.evaluate(() => {
                const keywords = ['scholarship', 'grant', 'fellowship', 'apply', 'program', 'fund'];
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => (a as HTMLAnchorElement).href)
                    .filter(href => {
                        if (!href.startsWith('http')) return false;
                        const lower = href.toLowerCase();
                        return keywords.some(k => lower.includes(k));
                    });
            });

            return { html, text, links, strategy: this.type };
        } finally {
            await context.close();
            if (!browser) await localBrowser.close();
        }
    }
}

// ============================================================
// 4. BROWSER + PROXY STRATEGY (Placeholder for protected sites)
// ============================================================
export class BrowserProxyStrategy implements ScrapingStrategy {
    type: StrategyType = 'BROWSER_PROXY';

    async execute(url: string, browser?: Browser): Promise<ScrapingResult> {
        console.log(`[PROXY] Attempting to scrape ${url} via proxy...`);

        // In production, you would configure a real proxy here:
        // const localBrowser = await chromium.launch({
        //     headless: true,
        //     proxy: {
        //         server: 'http://proxy-server:port',
        //         username: 'user',
        //         password: 'pass'
        //     }
        // });

        // For now, try headed mode as a last resort (some sites allow headed browsers)
        const headedBrowser = await chromium.launch({ headless: false });
        const context = await headedBrowser.newContext({
            userAgent: AntiDetectionService.getRandomUserAgent(),
            ...AntiDetectionService.getStealthOptions()
        });
        const page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait longer for Cloudflare challenges to resolve in headed mode
            await page.waitForTimeout(8000);

            // Wait for content
            try {
                await page.waitForFunction(
                    () => (document.body?.innerText || '').length > 1000,
                    { timeout: 25000 }
                );
            } catch { }

            const html = await page.content();
            const text = await page.evaluate(() => document.body.innerText);

            if (isBlockedPage(text)) {
                throw new Error('Still blocked even with proxy/headed browser');
            }

            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => (a as HTMLAnchorElement).href)
                    .filter(href => href.startsWith('http'));
            });

            return { html, text, links, strategy: this.type };
        } finally {
            await context.close();
            await headedBrowser.close();
        }
    }
}
