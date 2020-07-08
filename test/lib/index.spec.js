const assert = require('assert');
const test = require('testit');

const { getAlgorithm } = require('../../lib');

const ChromeDefaultTextWrapper = require('../../lib/chromeDefaultTextWrapper');

let browser;
let algorithm;

test('getAlgorithm()', () => {
  test('with CHROME BROWSER', () => {
    browser = 'chrome';

    test('and DEFAULT algorithm', () => {
      algorithm = 'default';

      test('returns an instance of ChromeDefaultTextWrapper', () => {
        const result = getAlgorithm(browser, algorithm);
        assert(result instanceof ChromeDefaultTextWrapper);
      });
    });

    test('with an unsupported algorithm', () => {
      algorithm = 'an_unsupported_algorithm';

      test('throws an error', () => {
        assert.throws(() => getAlgorithm(browser, algorithm));
      });
    });
  });

  test('with an unsupported Browser', () => {
    browser = 'an_unsupported_browser';

    test('and default algorithm', () => {
      algorithm = 'default';

      test('throws an error', () => {
        assert.throws(() => getAlgorithm(browser, algorithm));
      });
    });
  });
});
