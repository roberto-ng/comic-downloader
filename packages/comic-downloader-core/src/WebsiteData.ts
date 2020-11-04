import "regenerator-runtime/runtime";
import axios from 'axios';

import { CrawlingMethod } from './CrawlingMethod';
import { tapasData } from './websites';

export const websites = [
    tapasData,
];

export interface CrawlingMethodHtmlScraping {
    // css query used to identify the img elements we want to download
    cssQuery: string; 
    // search the image URL in a different attribute
    useCustomImgSrcAttribute?: string;
}

export interface CrawlingMethodApi {
    // function that calls the website's API and returns an array 
    // containing the URLs of the images we want to download
    callApi: (pageURL: string) => Array<string>;
}

export interface WebsiteData {
    name: string;
    // all the possible base URLs of the website
    baseURLs: Array<string>;
    // the avaliable methods of searching for the images in this website
    crawlingMethods: {
        htmlScraping?: CrawlingMethodHtmlScraping;
        api?: CrawlingMethodApi;
    };
    preferedCrawlingMethod: CrawlingMethod;
}

export class WebsiteIsNotSupported extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WebsiteIsNotSupported";
    }
}

export function getBaseUrl(url: string): string {
    let urlData = new URL(url);
    return urlData.hostname;
}

export async function downloadWebpage(url: string): Promise<string> {
    let res = await axios.get(url);
    let body = await res.data;
    return body;
}

export function detectWebsite(url: string): WebsiteData {
    const baseUrl = getBaseUrl(url);
    for (const website of websites) {
        if (website.baseURLs.includes(baseUrl)) {
            return website;
        }
    }

    const errorMsg = `Website ${baseUrl} is not suported`;
    throw new WebsiteIsNotSupported(errorMsg);
}