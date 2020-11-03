const { downloadWebpage } = require('../dist/index');

/*
test('test mul function', () => {
    expect(mul(5, 3)).toBe(15);
});
*/

test('test download page', async () => {
    let body = await downloadWebpage('https://duckduckgo.com/');
    expect(typeof body).toBe('string');
    expect(body.length > 0).toBe(true);
});