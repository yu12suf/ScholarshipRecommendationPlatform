import { Browser } from 'playwright';
import {
    ScrapingResult,
    ScrapingStrategy,
    StaticStrategy,
    APIStrategy,
    BrowserStrategy,
    BrowserProxyStrategy,
    StrategyType
} from './ScrapingStrategy.js';
import { IngestionMetrics } from '../common/IngestionMetrics.js';

export class StrategyManager {
    private strategies: ScrapingStrategy[];
    private sourceName: string;

    constructor(sourceName: string) {
        this.sourceName = sourceName;
        this.strategies = [
            new StaticStrategy(),
            new APIStrategy(),
            new BrowserStrategy(),
            new BrowserProxyStrategy()
        ];
    }

    async executeAdaptiveScrape(url: string, browser?: Browser): Promise<ScrapingResult> {
        let lastError: Error | null = null;

        for (const strategy of this.strategies) {
            try {
                console.log(`[STRATEGY: ${strategy.type}] Attempting ${url}...`);
                const result = await strategy.execute(url, browser);

                // Validate: must have links or substantial text, AND not be a redirect to a block page
                const hasContent = result.links.length > 0 || result.text.length > 500;
                const isBlockRedirect = result.links.some(l =>
                    l.includes('cloudflare.com') || l.includes('captcha')
                );

                if (hasContent && !isBlockRedirect) {
                    IngestionMetrics.updateStrategy(this.sourceName, strategy.type);
                    console.log(`[STRATEGY: ${strategy.type}] ✓ Success for ${url} (${result.links.length} links, ${result.text.length} chars)`);
                    return result;
                }

                console.warn(`[STRATEGY: ${strategy.type}] Returned insufficient content for ${url}`);
            } catch (error: any) {
                lastError = error;
                console.warn(`[STRATEGY: ${strategy.type}] failed for ${url}: ${error.message}`);
                continue;
            }
        }

        throw lastError || new Error(`All strategies failed for ${url}`);
    }
}
