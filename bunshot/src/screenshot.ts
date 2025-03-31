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

    return {
      success: true,
      buffer,
      full_screenshot,
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