import { CrawlingMethod } from '../CrawlingMethod';
import { WebsiteData } from '../WebsiteData';

export const tapasData: WebsiteData = {
    name: 'Tapas',
    baseURLs: ['tapas.io'],
    preferedCrawlingMethod: CrawlingMethod.HTML_SCRAPING,
    crawlingMethods: {
        htmlScraping: {
            cssQuery: 'div.js-episode-viewer img.content__img',
            useCustomImgSrcAttribute: 'data-src',
        }
    },
};