import "regenerator-runtime/runtime";
import axios from 'axios';

export enum CrawlingMethod {
    HTML_SCRAPING,
    API,
}

export interface CrawlingMethodHtmlScraping {
    // css query used to identify the img elements we want to download
    cssQuery: string; 
    // search the image URL in a different attribute
    useCustomImgSrcAttribute?: string;
}

export interface CrawlingMethodApi {
    // function that calls the website's API and returns an array 
    // containing the URLs of the images we want to download
    callApi: (pageURL: string) => string[];
}

export interface WebsiteData {
    // all the possible base URLs of the website
    baseURLs: string[];
    // the avaliable methods of searching for the images in this website
    crawlingMethods: {
        htmlScraping?: CrawlingMethodHtmlScraping;
        api?: CrawlingMethodApi;
    };
    preferedCrawlingMethod: CrawlingMethod;
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