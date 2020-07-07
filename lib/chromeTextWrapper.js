class ChromeTextWrapper {
  constructor(options) {
    this.options = options;
    this.lineBuffer = '';
    this.outputLines = [];
    this.offset = 0;
  }

  perform(text, width) {
    // preserves existing line breaks
    const inputLines = text.split('\n');
    inputLines.forEach((inputLine, inputLineIndex) => {
      if (inputLine.length === 0) {
        this.appendNewLine();
      } else {
        const words = inputLine.split(' ');
        words.forEach((word, wordIndex) => {
          const isLastWord = wordIndex === words.length - 1;

          this.appendWord(word, width);

          if (isLastWord) {
            // if the word is the last one
            this.appendNewLine();
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

    return this.buildOutput();
  }

  buildOutput() {
    const { richOutput } = this.options;
    return richOutput
      ? this.outputLines
      : this.outputLines.map((entry) => entry.line);
  }

  // adds a new output line
  appendNewLine() {
    this.outputLines.push({
      line: this.lineBuffer,
      offset: this.offset - this.lineBuffer.length,
      length: this.lineBuffer.length,
    });
    this.lineBuffer = '';
  }

  // adds a word into the last output line
  appendWord(word, width) {
    // if a word is larger than the specified width
    if (word.length > width) {
      const subWords = this.chunkWord(word, width);
      subWords.forEach((subWord) => this.appendWord(subWord, width));
    } else {
      if (word.length + this.lineBuffer.length > width) {
        this.appendNewLine();
      }

      this.lineBuffer += word;
      this.offset += word.length;
    }
  }

  appendWhitespace() {
    this.lineBuffer += ' ';
    this.offset += 1;
  }

  // split a word every $size characters.
  chunkWord(str, size) {
    return str.match(new RegExp(`.{1,${size}}`, 'g'));
  }
}

module.exports = ChromeTextWrapper;
