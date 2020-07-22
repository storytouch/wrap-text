const assert = require('assert');
const test = require('testit');

const { getAlgorithm } = require('../../lib');

const ChromeSimpleTextWrapper = require('../../lib/chromeSimpleTextWrapper');

let browser;
let algorithm;

test('getAlgorithm()', () => {
  test('with CHROME BROWSER', () => {
    browser = 'chrome';

    test('and SIMPLE algorithm', () => {
      algorithm = 'simple';

      test('returns an instance of ChromeSimpleTextWrapper', () => {
        const result = getAlgorithm(browser, algorithm);
        assert(result instanceof ChromeSimpleTextWrapper);
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

    test('and SIMPLE algorithm', () => {
      algorithm = 'simple';

      test('throws an error', () => {
        assert.throws(() => getAlgorithm(browser, algorithm));
      });
    });
  });
});
