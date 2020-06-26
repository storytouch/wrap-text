const DEFAULT_OPTIONS = {
  browser: 'chrome',
  richOutput: false,
};

const wrapText = (text, width, options = {}) => {
  options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // TODO implement the algorithms of other browsers
  if (options.browser !== 'chrome') {
    throw new Error('Browser not compatible yet');
  }

  // edge case
  if (width < 1) width = 1;

  const outputLines = [];
  let offset = 0;
  let outputLine = '';

  // split a word every $size characters.
  const chunkWord = (str, size) => str.match(new RegExp(`.{1,${size}}`, 'g'));

  // adds a new output line
  const appendNewLine = (lineText) => {
    outputLines.push({
      line: lineText,
      offset: offset - lineText.length,
      length: lineText.length,
    });
    outputLine = '';
  };

  // adds a word into the last output line
  const appendWord = (word) => {
    // if a word is larger than the specified width
    if (word.length > width) {
      const subWords = chunkWord(word, width);
      subWords.forEach((subWord) => appendWord(subWord));
    } else {
      if (word.length + outputLine.length > width) {
        appendNewLine(outputLine);
      }

      outputLine += word;
      offset += word.length;
    }
  };

  const appendWhitespace = () => {
    outputLine += ' ';
    offset += 1;
  };

  // preserves existing line breaks
  const inputLines = text.split('\n');
  inputLines.forEach((inputLine, inputLineIndex) => {
    if (inputLine.length === 0) {
      outputLines.push({ line: '', offset });
      offset += 1;
    } else {
      const words = inputLine.split(' ');
      words.forEach((word, wordIndex) => {
        const isLastWord = wordIndex === words.length - 1;

        appendWord(word);

        if (isLastWord) {
          // if the word is the last one
          appendNewLine(outputLine);
        } else {
          appendWhitespace();
        }
      });
    }

    // mark existing line breaks
    offset += 1;
    if (inputLineIndex < inputLines.length - 1) { // skip the end of text
      outputLines[outputLines.length - 1].originalBreak = true;
    }
  });

  if (!options.richOutput) {
    return outputLines.map((entry) => entry.line);
  }

  return outputLines;
};

module.exports = wrapText;
