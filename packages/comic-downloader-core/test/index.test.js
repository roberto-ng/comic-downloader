const { 
    downloadWebpage, 
    detectWebsite, 
    WebsiteIsNotSupported,

    downloadComic,
} = require('../dist/index');


test('test downloadWebpage', async () => {
    let body = await downloadWebpage('https://duckduckgo.com/');
    expect(typeof body).toBe('string');
    expect(body.length > 0).toBe(true);
});

test('test detectWebsite', () => {
    const url1 = 'https://duckduckgo.com/aaaaa/1111/gggg';
    const url2 = 'https://tapas.io/91418973429174/aefaef/';
    expect(() => detectWebsite(url1)).toThrow(WebsiteIsNotSupported);
    expect(() => detectWebsite(url2)).not.toThrow();
});

test('test downloadComic', async () => {
    const url = 'https://tapas.io/episode/1123711';
    const res = await downloadComic(url);

    expect(res.websiteData.name).toBe('Tapas');
    expect(res.images.length > 0).toBe(true);
});