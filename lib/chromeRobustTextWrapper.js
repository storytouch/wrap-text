class ChromeRobustTextWrapper {
  constructor() {
    this.lineBuffer = '';
    this.outputLines = [];
    this.offset = 0;
    this.height = 0;
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
   * @property {string} line - The line text
   * @property {number} length - Number of characters of this lines.
   * @property {number} y0 - The y-axis origin of this line.
   * @property {number} height - The height of this line.
   * @property {string} type - The same type of the original line.
   * @property {string} parentIndex - The index of the original line.
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
    this.setOptions({ ...options, types });
    this.documentLines = documentLines;
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
            this.appendWhitespace();
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
      lineHeight,
      parentIndex,
      type,
      visible,
    } = context;

    this.outputLines.push({
      y0: this.height,
      length: this.lineBuffer.length,
      line: this.lineBuffer,
      height: lineHeight,
      offset: this.offset - this.lineBuffer.length,
      parentIndex,
      type,
      visible,
    });

    // increment the line height
    this.applyHeight(context);

    // clears the buffer
    this.lineBuffer = '';
  }

  // adds a word into the last output line
  appendWord(word, context) {
    const { width } = context;

    // if a word is larger than the specified width
    if (word.length > width) {
      const subWords = this.chunkWord(word, width);
      subWords.forEach((subWord) => this.appendWord(subWord, context));
    } else {
      if (word.length + this.lineBuffer.length > width) {
        this.appendNewLine(context);
      }

      this.lineBuffer += word;
      this.offset += word.length;
    }
  }

  appendWhitespace() {
    this.lineBuffer += ' ';
    this.offset += 1;
  }

  buildOutput() {
    const { richOutput } = this.options;
    return richOutput
      ? this.outputLines
      : this.outputLines.map((entry) => entry.line);
  }

  // split a word every $size characters.
  chunkWord(str, size) {
    return str.match(new RegExp(`.{1,${size}}`, 'g'));
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

  applyHeight(context) {
    const {
      lineHeight,
      visible,
    } = context;

    if (visible) {
      this.height += (lineHeight || 0);
    }
  }

  applyMarginTop(context) {
    const {
      marginTop,
      visible,
    } = context;

    if (visible) {
      this.height += (marginTop || 0);
    }
  }

  applyMarginBottom(context) {
    const {
      marginBottom,
      visible,
    } = context;

    if (visible) {
      this.height += (marginBottom || 0);
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
}

module.exports = ChromeRobustTextWrapper;
