import cheerio from 'cheerio';

/** Searches for the data we need in a given HTML string and returns 
 * an array containing the URLs of all the images in the chapter */
export function readDataFromHtml(
    html: string, 
    cssQuery: string, 
    imgSrcAttribute: string
): Array<string> {
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
