import "regenerator-runtime/runtime";
import fetch from 'cross-fetch';
import cheerio from 'cheerio';

import { CrawlingMethod } from './CrawlingMethod';
import { detectWebsite, WebsiteData } from './WebsiteData';
import { url } from "inspector";

/** Searches for the data we need in a given HTML string and returns 
 * an array containing the URLs of all the images in the chapter */
async function readDataFromHtml(
    html: string, 
    cssQuery: string, 
    imgSrcAttribute: string
): Promise< Array<string> > {
    const $ = cheerio.load(html);
    const imageElements = $(cssQuery).toArray();
    if (imageElements.length === 0) {
        throw new CssQueryNotFound('CSS query returned no results');
    }

    return imageElements.map(image => {
        // checks if the element has the attribute we're looking for
        if (typeof image.attribs[imgSrcAttribute] === 'string') {
            const imgUrl = image.attribs[imgSrcAttribute];
            return imgUrl;
        }
        else {
            const errorMsg = `Attribute ${imgSrcAttribute} not found`;
            throw new SrcAttributeNotFound(errorMsg);
        }
    });    
}

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
            const scrapeData = websiteData.crawlingMethods.htmlScraping;
            const cssQuery = scrapeData.cssQuery;

            let imgSrcAttr = defaultImgSrcAttr;
            if (scrapeData.useCustomImgSrcAttribute) {
                imgSrcAttr = scrapeData.useCustomImgSrcAttribute;
            }
            
            let html = await downloadWebpage(url);
            images = await readDataFromHtml(html, cssQuery, imgSrcAttr);
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