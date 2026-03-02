import { chromium } from 'playwright';

(async () => {
    console.log("Launching browser...");
    try {
        const browser = await chromium.launch({ headless: true });
        console.log("Browser launched.");
        const page = await browser.newPage();
        console.log("Page created.");
        await browser.close();
        console.log("Browser closed. Playwright works.");
    } catch (e) {
        console.error("Playwright error:", e);
    }
})();
