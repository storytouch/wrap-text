class ChromeRobustTextWrapper {
  constructor() {
    this.lineBuffer = '';
    this.outputLines = [];
    this.offset = 0;
  }

  /* The output format.
   * @typedef {Object} RichOutputLine
   * @property {string} line - The line text
   * @property {number} length - Number of characters of this lines.
   * @property {string} type - The same type of the original line.
   * @property {string} parentIndex - The index of the original line.
   * @property {number} offset - The index relative to the original text
   *                             of the first character of this line.
   */

  /*
   * Performs the text wrap considering multiple
   * types of lines. It means that the width is not
   * constant, instead it depends on the line type.
   *
   * @param {Object[]} documentLines - Input lines structure.
   * @param {string} documentLines[].text - Line text.
   * @param {string} documentLines[].type - Line type.
   * @param {Object.<string, number>} widthPerType - Mapping of line type to line width.
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
   *   }]
   *
   *   widthPerType: {
   *     "heading": 4,
   *     "general": 10,
   *   }
  */
  perform(documentLines, widthPerType, options = {}) {
    this.setOptions({ ...options, widthPerType });
    this.documentLines = documentLines;
    this.documentLines.forEach((documentLine, documentLineIndex) => {
      this.processLine(documentLine, documentLineIndex);
    });
    return this.buildOutput();
  }

  processLine(documentLine, documentLineIndex) {
    const { type, text } = documentLine;
    const width = this.getTypeWidth(type);

    // preserves existing line breaks
    const inputLines = text.split('\n');
    inputLines.forEach((inputLine, inputLineIndex) => {
      if (inputLine.length === 0) {
        this.appendNewLine(documentLineIndex);
      } else {
        const words = inputLine.split(' ');
        words.forEach((word, wordIndex) => {
          const isLastWord = wordIndex === words.length - 1;
          this.appendWord(word, width, documentLineIndex);
          if (isLastWord) {
            // if the word is the last one
            this.appendNewLine(documentLineIndex);
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
  }

  // adds a new output line
  appendNewLine(documentLineIndex) {
    this.outputLines.push({
      line: this.lineBuffer,
      offset: this.offset - this.lineBuffer.length,
      length: this.lineBuffer.length,
      type: this.documentLines[documentLineIndex].type,
      parentIndex: documentLineIndex,
    });
    this.lineBuffer = '';
  }

  // adds a word into the last output line
  appendWord(word, width, documentLineIndex) {
    // if a word is larger than the specified width
    if (word.length > width) {
      const subWords = this.chunkWord(word, width);
      subWords.forEach((subWord) => this.appendWord(subWord, width, documentLineIndex));
    } else {
      if (word.length + this.lineBuffer.length > width) {
        this.appendNewLine(documentLineIndex);
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

  getTypeWidth(type) {
    const { widthPerType } = this.options;
    const width = widthPerType[type];
    return width > 0 ? width : 1;
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
