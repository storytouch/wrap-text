const DEFAULT_OPTIONS = {
  richOutput: false,
};

const wrapText = (text, width, options = {}) => {
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const outputLines = [];
  let offset = 0;
  let outputLine = '';

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
    if (word.length + outputLine.length > width) {
      appendNewLine(outputLine);
    }

    outputLine += word;
    offset += word.length;
  };

  // split a word every $size characters.
  const chunkWord = (str, size) => str.match(new RegExp(`.{1,${size}}`, 'g'));

  // preserves existing line breaks
  const inputLines = text.split('\n');
  inputLines.forEach((inputLine, inputLineIndex) => {
    if (inputLine.length === 0) {
      outputLines.push({ line: '', offset });
      offset += 1;
    } else {
      const words = inputLine.split(' ');
      words.forEach((word, wordIndex) => {
        const wordToAppend = wordIndex === words.length - 1
          ? word
          : `${word} `;

        // if a word is larger than the specified width
        if (wordToAppend.length > width) {
          const subWords = chunkWord(wordToAppend, width);
          subWords.forEach((subWord) => appendWord(subWord));
        } else {
          appendWord(wordToAppend);
        }

        if (wordIndex === words.length - 1) {
          // if the word is the last one
          appendNewLine(outputLine);
        }
      });
    }

    // mark existing line breaks
    offset += 1;
    if (inputLineIndex < inputLines.length - 1) { // skip the end of text
      outputLines[outputLines.length - 1].originalBreak = true;
    }
  });

  if (!mergedOptions.richOutput) {
    return outputLines.map((entry) => entry.line);
  }

  return outputLines;
};

module.exports = wrapText;
