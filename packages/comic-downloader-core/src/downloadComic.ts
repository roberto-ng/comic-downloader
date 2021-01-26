import "regenerator-runtime/runtime";
import fetch from 'cross-fetch';

import { CrawlingMethod } from './CrawlingMethod';
import { detectWebsite, WebsiteData } from './WebsiteData';
import { readDataFromHtml } from './htmlScraping';

export async function downloadWebpage(url: string): Promise<string> {
    const res = await fetch(url);
    const body = await res.text();
    return body;
}

export async function downloadComic(url: string): Promise<DownloadComicResult> {
    const defaultImgSrcAttr = 'src';
    const websiteData = detectWebsite(url);
    let images: Array<string> = [];

    switch (websiteData.preferedCrawlingMethod) {
        case CrawlingMethod.HTML_SCRAPING:
            const htmlScraping = websiteData.crawlingMethods.htmlScraping;
            const cssQuery = htmlScraping.cssQuery;

            let imgSrcAttr = defaultImgSrcAttr;
            if (htmlScraping.useCustomImgSrcAttribute) {
                imgSrcAttr = htmlScraping.useCustomImgSrcAttribute;
            }
            
            let html = await downloadWebpage(url);
            images = readDataFromHtml(html, cssQuery, imgSrcAttr);
            break;

        default:
            throw new InvalidCrawlingMethod('Invalid crawling method');
    }

    return {
        websiteData,
        images,
    };
}

export interface DownloadComicResult {
    websiteData: WebsiteData;
    images: Array<string>;
}

export class SrcAttributeNotFound extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "SrcAttributeNotFound";
    }
}
                        
export class CssQueryNotFound extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "CssQueryNotFound";
    }
}

export class InvalidCrawlingMethod extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "InvalidCrawlingMethod";
    }
}