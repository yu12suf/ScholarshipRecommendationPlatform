export class TextCleaner {
    static clean(text: string): string {
        if (!text) return "";

        return text
            // 1. Remove HTML tags
            .replace(/<[^>]*>?/gm, ' ')
            
            // 2. Remove specific "Garbage" patterns from scrapers
            .replace(/\(adsbygoogle.*?\)\.push\(\{\}\);/gi, '') 
            .replace(/\d+[KMB]?\sFollowers.*?\d+\sFollowing/gi, '') 
            .replace(/See Instagram photos and videos/gi, '')
            .replace(/Follow us on (Twitter|Facebook|Instagram|LinkedIn)/gi, '')

            // 3. Remove URLs (they don't help with matching)
            .replace(/https?:\/\/\S+/gi, '')

            // 4. Normalize Whitespace (The most important part!)
            // Turns multiple spaces/newlines into a single ' '
            .replace(/\s+/g, ' ')
            
            .trim();
    }

    /**
     * Prepares text for Gemini (Max 8000 chars)
     */
    static prepare(text: string): string {
        const cleaned = this.clean(text);
        // We cut at 8000 characters because that fits safely 
        // within Gemini's 2048 token limit (1 token ≈ 4 chars)
        return cleaned.substring(0, 8000);
    }
}