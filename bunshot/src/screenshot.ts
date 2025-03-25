import puppeteer from "puppeteer";
import config from "./config";
import { ScreenshotResult } from "./types";

export async function takeScreenshot(url: string): Promise<ScreenshotResult> {
  let browser;
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
      fullPage: true,
    });

    return {
      success: true,
      buffer,
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