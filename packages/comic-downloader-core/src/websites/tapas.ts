import { WebsiteData, CrawlingMethod } from '../WebsiteData';

const tapasData: WebsiteData = {
    baseURLs: ['tapas.io'],
    preferedCrawlingMethod: CrawlingMethod.HTML_SCRAPING,
    crawlingMethods: {
        htmlScraping: {
            cssQuery: 'div.js-episode-viewer img.content__img',
            useCustomImgSrcAttribute: 'data-src',
        }
    },
};

export default tapasData;