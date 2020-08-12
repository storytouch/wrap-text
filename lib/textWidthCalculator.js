const WHITESPACE = ' ';

class TextWidthCalculator {
  constructor(canvas) {
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
    const { width } = textMetrics;

    return width;
  }

  calculateWidth(word, font) {
    if (word === WHITESPACE) return this._whitespaceWidthFromCache(font);
    return this._calculateWordWidth(word, font);
  }
}

module.exports = TextWidthCalculator;
