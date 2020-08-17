const TextWidthCalculator = require('./textWidthCalculator');

class ChromeRobustTextWrapper {
  constructor() {
    this.outputLines = [];
    this.offset = 0;
    this.documentHeight = 0;
    this.buffer = {
      text: '',
      width: 0,
      marginTop: 0,
    };
  }

  /* The element type structure.
   * @typedef {Object} ElementStyle
   * @property {number} width - Number of characters per line of this element type.
   * @property {number} [lineHeight] - The lineHeight of this element.
   * @property {number} [marginTop] - The marginTop of this element.
   * @property {number} [marginBottom] - The marginBottom of this element.
   * @property {boolean} visible - Is this type is visible, then the height is incremented.
   */

  /* The output format.
   * @typedef {Object} RichOutputLine
   * @property {string} text - The line text
   * @property {number} length - Number of characters of this lines.
   * @property {number} y0 - The y-axis origin of this line.
   * @property {number} height - The height of this line.
   * @property {number} totalHeight - The total height of this line, including its margins.
   * @property {number} marginTop - The margin-top of this line.
   * @property {number} marginBottom - The margin-bottom of this line.
   * @property {string} type - The same type of the original line.
   * @property {number} parentIndex - The index of the original line.
   * @property {number} index - The index of the wrapped line.
   * @property {boolean} visible - If this line is visible or not.
   * @property {number} offset - The index relative to the original text
   * of the first character of this line.
   */

  /*
   * Performs the text wrap considering multiple
   * types of lines. It means that the width is not
   * constant, instead it depends on the line type.
   *
   * @param {Object[]} documentLines - Input lines structure.
   * @param {string} documentLines[].text - Line text.
   * @param {string} documentLines[].type - Line type.
   * @param {number} [documentLines[].marginTop] - The marginTop of this line.
   * @param {number} [documentLines[].marginBottom] - The marginBottom of this line.
   * @param {boolean} [documentLines[].visible] - The visibility of this line.
   * @param {Object.<string, ElementStyle>} types - Mapping of line type to the line style.
   * @param {Object} [options] - User options.
   * @param {boolean} [options.richOutput] - Enables/Disables the rich output.
   * @returns {(string[]|RichOutputLine[])}
   *
   * Example:
   *
   *   documentLines: [{
   *     text: "Lorem impsum",
   *     type: "heading",
   *   }, {
   *     text: "dolor sit",
   *     type: "gereral",
   *     marginTop: 10
   *   }, {
   *     text: "dolor sit",
   *     type: "gereral",
   *     visible: false
   *   }]
   *
   *   types: {
   *     heading: {
   *       width: 4,
   *       lineHeight: 16,
   *       marginTop: 16
   *     },
   *     general: {
   *       width: 10,
   *       lineHeight: 16,
   *       marginBottom: 4
   *     },
   *   }
  */
  perform(documentLines, types, options = {}) {
    this.documentLines = documentLines;

    this.setOptions({ ...options, types });
    this.initializeWidthCalculator();

    this.documentLines.forEach((documentLine, index) => {
      const context = this.createContext(index);
      this.processLine(context);
    });

    return this.buildOutput();
  }

  processLine(context) {
    const { text } = context;

    this.applyMarginTop(context);

    // preserves existing line breaks
    const inputLines = text.split('\n');
    inputLines.forEach((inputLine, inputLineIndex) => {
      if (inputLine.length === 0) {
        this.appendNewLine(context);
      } else {
        const words = inputLine.split(' ');
        words.forEach((word, wordIndex) => {
          const isLastWord = wordIndex === words.length - 1;
          this.appendWord(word, context);
          if (isLastWord) {
            // if the word is the last one
            this.appendNewLine(context);
          } else {
            this.appendWhitespace(context);
          }
        });
      }

      // mark existing line breaks
      this.offset += 1;
      if (inputLineIndex < inputLines.length - 1) { // skip the end of text
        this.outputLines[this.outputLines.length - 1].originalBreak = true;
      }
    });

    this.applyMarginBottom(context);
  }

  // adds a new output line
  appendNewLine(context) {
    const {
      parentIndex,
      type,
      visible,
    } = context;

    const { text } = this.buffer;
    const dimensions = this.calculateLineDimensions(context);
    const index = this.outputLines.length;

    this.outputLines.push({
      ...dimensions,
      index,
      parentIndex,
      text,
      type,
      visible,
    });

    // increment the line height
    this.applyHeight(context);

    // clears the buffer
    this.clearBuffer();
  }

  // adds a word into the last output line
  appendWord(word, context) {
    // column-size driven or font-size driven
    const { width, columns } = context;
    const maxWidth = columns || width;

    const wordWidth = this.getWordWidth(word, context);

    // if a word is larger than the specified width
    if (wordWidth > maxWidth) {
      const subWords = this.chunkWord(word);
      subWords.forEach((subWord) => this.appendWord(subWord, context));
    } else {
      if (wordWidth + this.buffer.width > maxWidth) {
        this.appendNewLine(context);
      }
      this.addWordToBuffer(word, wordWidth);
    }
  }

  appendWhitespace(context) {
    const whitespace = ' ';
    const whitespaceWidth = this.getWordWidth(whitespace, context);
    this.addWordToBuffer(whitespace, whitespaceWidth);
  }

  getWordWidth(word, context) {
    // if the width is defined by the number of columns
    const { columns } = context;
    if (columns > 0) return word.length;

    // else, calculates the width based on the font size
    const { font } = context;
    const width = this.textWidthCalculator.calculateWidth(word, font);

    return width;
  }

  addWordToBuffer(word, wordWidth) {
    this.buffer.text += word;
    this.buffer.width += wordWidth;
    this.offset += word.length;
  }

  clearBuffer() {
    this.buffer.text = '';
    this.buffer.width = 0;
    this.buffer.marginTop = 0;
  }

  buildOutput() {
    const { richOutput } = this.options;
    return richOutput
      ? this.outputLines
      : this.outputLines.map((entry) => entry.text);
  }

  chunkWord(str) {
    return str.split('');
  }

  createContext(index) {
    const documentLine = this.documentLines[index];
    const { type } = documentLine;
    const style = this.getElementStyle(type);
    return {
      ...style,
      ...documentLine,
      parentIndex: index,
    };
  }

  getElementStyle(elemenType) {
    const { types } = this.options;
    const elementStyle = types[elemenType];

    const defaultStyle = {
      lineHeight: 0,
      marginBottom: 0,
      marginTop: 0,
      visible: true,
      width: 1,
    };

    return {
      ...defaultStyle,
      ...elementStyle,
    };
  }

  calculateLineDimensions(context) {
    const {
      lineHeight,
      visible,
    } = context;

    const {
      text,
      width,
      marginTop,
    } = this.buffer;

    const offset = this.offset - text.length;
    const y0 = visible ? this.documentHeight : -1;
    const height = visible ? lineHeight : 0;
    const totalHeight = height + marginTop; // margin bottom may be updated latter

    return {
      height,
      length: text.length,
      marginBottom: 0, // this value may be updated in the next iteration
      marginTop,
      offset,
      totalHeight,
      width,
      y0,
    };
  }

  applyHeight(context) {
    const {
      lineHeight,
      visible,
    } = context;

    const {
      marginTop,
    } = this.buffer;

    if (visible) {
      this.documentHeight += lineHeight;
      this.documentHeight += marginTop;
    }
  }

  applyMarginTop(context) {
    const {
      marginTop,
      visible,
    } = context;

    if (visible) {
      // apply this margin to the next appended line
      this.buffer.marginTop = marginTop;
    }
  }

  applyMarginBottom(context) {
    const {
      marginBottom,
      visible,
    } = context;

    if (visible) {
      this.documentHeight += marginBottom;

      // update last line
      const lastLine = this.outputLines[this.outputLines.length - 1];
      lastLine.marginBottom = marginBottom;
      lastLine.totalHeight += marginBottom;
    }
  }

  setOptions(options) {
    const defaultOptions = {
      richOutput: false,
    };

    this.options = {
      ...defaultOptions,
      ...options,
    };
  }

  initializeWidthCalculator() {
    const { canvas } = this.options;
    this.textWidthCalculator = new TextWidthCalculator(canvas);
  }
}

module.exports = ChromeRobustTextWrapper;
