const { mul } = require('../dist/index');

test('test mul function', () => {
    expect(mul(5, 3)).toBe(15);
});