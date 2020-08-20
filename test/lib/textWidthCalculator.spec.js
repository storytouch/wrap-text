const assert = require('assert');
const test = require('testit');

const { createCanvas } = require('../utils/canvas');
const TextWidthCalculator = require('../../lib/textWidthCalculator');

const MEASUREMENT_ERROR_TOLERANCE = 2.0; // in pixels

const getMeasurementError = (estimation, reference) => (
  Math.abs(estimation - reference)
);

test('TextWidthCalculator', () => {
  test('calculateWidth()', () => {
    let word;
    let font;
    let canvas;
    let useExtendedMetrics;

    const subject = (_canvas, _word, _font, _useExtendedMetrics) => {
      const calculator = new TextWidthCalculator(_canvas, _useExtendedMetrics);
      return calculator.calculateWidth(_word, _font);
    };

    test('with default font', () => {
      word = 'Hello';
      font = null;
      canvas = createCanvas();

      test('returns the expected width within a tolerance', () => {
        const reference = 39.05712890625;
        const result = subject(canvas, word, font);
        const error = getMeasurementError(result, reference);
        assert(error < MEASUREMENT_ERROR_TOLERANCE);
      });
    });

    test('with a custom font', () => {
      const fonts = [{
        family: 'Roboto',
        weight: '300',
        style: 'normal',
        path: '/usr/src/app/test/fixtures/fonts/Roboto/Roboto-Light.ttf',
      }];

      word = 'Hello';
      font = '300 14px Roboto, sans-serif';
      canvas = createCanvas(fonts);

      test('returns the expected width within a tolerance', () => {
        const reference = 31;
        const result = subject(canvas, word, font);
        const error = getMeasurementError(result, reference);
        assert(error < MEASUREMENT_ERROR_TOLERANCE);
      });

      test('using extented metrics', () => {
        useExtendedMetrics = true;

        test('returns the expected width within a tolerance', () => {
          const reference = 31;
          const result = subject(canvas, word, font, useExtendedMetrics);
          const error = getMeasurementError(result, reference);
          assert(error < MEASUREMENT_ERROR_TOLERANCE);
        });

        test('and when the canvas does not support extended metrics', () => {
          const mockedCanvas2DContext = {
            measureText: (text) => {
              const realContext = canvas.getContext('2d');
              const realMetrics = realContext.measureText(text);
              const { width } = realMetrics;
              return { width };
            },
          };

          const mockedCanvas = createCanvas(fonts);
          mockedCanvas.getContext = () => mockedCanvas2DContext;

          test('throws an error', () => {
            assert.throws(() => subject(mockedCanvas, word, font, useExtendedMetrics),
              Error, 'Extended properties of TextMetrics are not supported.');
          });
        });
      });
    });
  });
});
