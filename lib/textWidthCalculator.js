const WHITESPACE = ' ';

class TextWidthCalculator {
  constructor(canvas, useExtendedMetrics = false) {
    this.useExtendedMetrics = useExtendedMetrics;
    this._initializeCanvasContext(canvas);
    this._initializeCache();
  }

  _initializeCanvasContext(canvas) {
    this.canvasContext = canvas.getContext('2d');
  }

  _initializeCache() {
    this.whitespaceCache = {};
  }

  // We calculate the width of whitespaces several times,
  // so it is more efficient to cache it according to font type.
  _whitespaceWidthFromCache(font) {
    let cachedWidth = this.whitespaceCache[font];
    if (typeof cachedWidth !== 'number') {
      cachedWidth = this._calculateWordWidth(WHITESPACE, font);
      this.whitespaceCache[font] = cachedWidth;
    }
    return cachedWidth;
  }

  _calculateWordWidth(word, font) {
    const defaultFont = '13px Courier, monospace';
    this.canvasContext.font = font || defaultFont;

    // measure the text
    const textMetrics = this.canvasContext.measureText(word);

    // default width metric
    let { width } = textMetrics;

    // When measuring the x-direction of a piece of text,
    // the sum of actualBoundingBoxLeft and actualBoundingBoxRight
    // can be wider than the width of the inline box (width), due to
    // slanted/italic fonts where characters overhang their advance width.
    // ref: https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics

    // It can therefore be useful to use the sum of actualBoundingBoxLeft
    // and actualBoundingBoxRight as a more accurate way to get the
    // absolute text width:
    if (this.useExtendedMetrics) {
      const supportExtendedMetrics = 'actualBoundingBoxLeft' in textMetrics && 'actualBoundingBoxRight' in textMetrics;
      if (!supportExtendedMetrics) {
        throw new Error('Extended properties of TextMetrics are not supported.');
      }

      const { actualBoundingBoxLeft, actualBoundingBoxRight } = textMetrics;
      width = Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight);
    }

    return width;
  }

  calculateWidth(word, font) {
    if (word === WHITESPACE) return this._whitespaceWidthFromCache(font);
    return this._calculateWordWidth(word, font);
  }
}

module.exports = TextWidthCalculator;
