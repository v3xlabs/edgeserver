import puppeteer, { Browser } from "puppeteer";
import config from "./config";
import { ScreenshotResult } from "./types";

export async function takeScreenshot(url: string): Promise<ScreenshotResult> {
  let browser: Browser | null = null;
  try {
    // Ensure URL has protocol
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    console.log(`Taking screenshot of ${url}`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    // Create a new page
    const page = await browser.newPage();

    console.log("Screenshot size", config.screenshot.width, config.screenshot.height);
    
    // Set viewport size
    await page.setViewport({
      width: config.screenshot.width,
      height: config.screenshot.height,
    });

    // force light mode
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);

    // Navigate to the URL with timeout from config
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: config.screenshot.timeout,
    });

    // Take a screenshot
    const buffer = await page.screenshot({
      type: "webp",
      quality: config.screenshot.quality,
      // fullPage: true,
      clip: {
        width: config.screenshot.width,
        height: config.screenshot.height,
        x: 0,
        y: 0,
      }
    });

    const full_screenshot= await page.screenshot({
      type: "webp",
      quality: config.screenshot.quality,
      fullPage: true,
    });

    // get the favicon of the page as a buffer
    // get it from the browser not from the html meta tags
    const favicon = await page.evaluate(() => {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        return favicon.getAttribute('href');
      }
      return null;
    });

    console.log("Favicon", favicon);

    const faviconUrl = favicon ? new URL(favicon, url).toString() : null;

    console.log("Favicon URL", faviconUrl);

    const faviconFileExtension = faviconUrl ? faviconUrl.split('.').pop() : null;

    // fetch favicon to buffer plz
    const faviconBuffer = faviconUrl ? await fetch(faviconUrl).then(res => res.arrayBuffer()).catch(e => {
      console.error("Error fetching favicon", e);
      return null;
    }).then(buffer => buffer) : null;
    const faviconBufferRaw: Buffer | null = faviconBuffer ? Buffer.from(faviconBuffer) : null;

    console.log("Favicon Buffer", faviconBufferRaw?.length);

    return {
      success: true,
      buffer,
      full_screenshot,
      favicon: faviconBufferRaw as any,
      faviconType: faviconFileExtension ?? undefined,
    };
  } catch (error) {
    console.error(`Error taking screenshot of ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 