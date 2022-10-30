import puppeteer from 'puppeteer';
import sharp from 'sharp';

import { logger } from './logger';

const defaultResolution: string[] = ['1200x900', '1920x1080'];
const defaultDelay: number = 2;

const chrome_path = process.env.CHROME_PATH;

export type JobData = {
    id: string;
    url: string;
    viewport: `${number}x${number}`;
    scales: `${number}`[];
};

export type JobResultData = {
    images: Record<string, string | Buffer>;
    favicon?: string;
};

export const screenshot = async (job: JobData): Promise<JobResultData> => {
    // if (!resolutions) resolutions = defaultResolution;

    // if (!delay) delay = defaultDelay;

    const browser = await puppeteer.launch(
        chrome_path
            ? {
                  executablePath: chrome_path,
                  args: ['--no-sandbox'],
              }
            : {}
    );

    const page = await browser.newPage();

    await page.goto(job.url, {
        waitUntil: 'networkidle0',
    });

    const outputImages: Record<string, string | Buffer> = {};

    const [width, height] = job.viewport.split('x').map(Number);
    const ratio = height / width;

    await page.setViewport({ width, height });

    const buffer = await page.screenshot({
        type: 'webp',
        encoding: 'binary',
        fullPage: false,
    });

    outputImages['root'] = buffer;

    for (const resizeScale of job.scales) {
        const scaleW = Number.parseInt(resizeScale);
        const scaleH = Math.floor(scaleW * ratio);

        const data = await sharp(buffer).resize(scaleW, scaleH).toBuffer();

        outputImages[scaleW] = data;
    }

    /** Capture Favicon */
    let faviconUrl = await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        const faviconElement = document.querySelector('link[rel*="icon"]');

        return faviconElement && faviconElement.getAttribute('href');
    });

    try {
        if (faviconUrl) {
            logger.debug('Found favicon', faviconUrl);
            faviconUrl = new URL(faviconUrl, job.url).toString();
        }
    } catch {
        logger.error('Unable to load favicon from url', faviconUrl, job.url);
    }

    await page.close();
    await browser.close();

    return {
        images: outputImages,
        favicon: faviconUrl || undefined,
    };
};
