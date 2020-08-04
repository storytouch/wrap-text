const { registerFont, createCanvas } = require('canvas');

const WHITESPACE = ' ';

class TextWidthCalculator {
  constructor(fonts = []) {
    this._initializeFonts(fonts);
    this._initializeCanvas();
    this._initializeCache();
  }

  _initializeFonts(fonts) {
    fonts.forEach((font) => {
      const { path: fontPath, ...fontProps } = font;
      registerFont(fontPath, fontProps);
    });
  }

  _initializeCanvas() {
    this.canvas = createCanvas(0, 0);
    this.canvasContext = this.canvas.getContext('2d');
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
