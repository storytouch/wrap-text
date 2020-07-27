const assert = require('assert');
const test = require('testit');

const TextWidthCalculator = require('../../lib/textWidthCalculator');

const MEASUREMENT_ERROR_TOLERANCE = 2.0; // in pixels

const getMeasurementError = (estimation, reference) => (
  Math.abs(estimation - reference)
);

test('TextWidthCalculator', () => {
  test('calculateWidth()', () => {
    let word;
    let font;
    let fonts;

    const subject = (_fonts, _word, _font) => {
      const calculator = new TextWidthCalculator(_fonts);
      return calculator.calculateWidth(_word, _font);
    };

    test('with default font', () => {
      word = 'Hello';
      font = null;
      fonts = [];

      test('returns the expected width within a tolerance', () => {
        const reference = 39.05712890625;
        const result = subject(fonts, word, font);
        const error = getMeasurementError(result, reference);
        assert(error < MEASUREMENT_ERROR_TOLERANCE);
      });
    });

    test('with a custom font', () => {
      word = 'Hello';
      font = '300 14px Roboto, sans-serif';
      fonts = [{
        family: 'Roboto',
        weight: '300',
        style: 'normal',
        path: '/usr/src/app/test/fixtures/fonts/Roboto/Roboto-Light.ttf',
      }];

      test('returns the expected width within a tolerance', () => {
        const reference = 32.47995483875275;
        const result = subject(fonts, word, font);
        const error = getMeasurementError(result, reference);
        assert(error < MEASUREMENT_ERROR_TOLERANCE);
      });
    });
  });
});
