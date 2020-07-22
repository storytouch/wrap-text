const assert = require('assert');
const test = require('testit');
const ChromeRobustTextWrapper = require('../../lib/chromeRobustTextWrapper');
const etherpadDocumentFixture = require('../fixtures/etherpad-document.json');

let documentLines;
let widthPerType;
let options;

const subject = (...args) => {
  const algorithm = new ChromeRobustTextWrapper();
  return algorithm.perform(...args);
};

test('ChromeRobustTextWrapper', () => {
  // produce the same output of Chrome CSS break-word algorithm,
  // but does not trim lines
  test('with a text with only one line type', () => {
    widthPerType = {
      any_type: 15,
    };

    documentLines = [{
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      type: 'any_type',
    }];

    test('all lines should have a maximum of the type width + 1 whitespace', () => {
      const result = subject(documentLines, widthPerType);
      result.forEach((line) => assert(line.length <= 16));
    });

    test('returns the expected lines', () => {
      const expectedLines = [
        'Lorem ipsum ',
        'dolor sit amet, ',
        'consectetur ',
        'adipiscing ',
        'elit.',
      ];
      const result = subject(documentLines, widthPerType);
      assert.deepEqual(result, expectedLines);
    });

    test('preserves the original text', () => {
      const result = subject(documentLines, widthPerType);
      const reconstuctedText = result.join('');
      const originalText = documentLines.map((entry) => entry.text).join('\n');
      assert.deepEqual(reconstuctedText, originalText);
    });

    test('and the richOutput options is enabled', () => {
      options = { richOutput: true };

      test('returns each line with its expected offset and length', () => {
        const result = subject(documentLines, widthPerType, options);
        result.forEach((entry) => {
          const sourceDocumentLine = documentLines[entry.parentIndex];
          const { text } = sourceDocumentLine;
          const textSubstr = text.substr(entry.offset, entry.length);
          assert.deepEqual(entry.line, textSubstr);
        });
      });
    });
  });

  test('with a text with many line types', () => {
    widthPerType = etherpadDocumentFixture.widthPerType;
    documentLines = etherpadDocumentFixture.documentLines;
    options = { richOutput: true };

    test('produces the expected lines', () => {
      const result = subject(documentLines, widthPerType, options);
      const { expectedOutput } = etherpadDocumentFixture;
      result.forEach((entry, index) => {
        const expectedOutputText = expectedOutput[index].line;
        assert.deepEqual(entry.line, expectedOutputText);
      });
    });

    test('preserves the original text of each line', () => {
      const result = subject(documentLines, widthPerType, options);
      documentLines.forEach((documentLine, index) => {
        const reconstuctedText = result
          .filter((entry) => entry.parentIndex === index)
          .map((entry) => entry.line)
          .join('');
        assert.deepEqual(reconstuctedText, documentLine.text);
      });
    });

    test('returns each line with its expected offset and length', () => {
      const allText = documentLines
        .map((entry) => entry.text)
        .join('\n');
      const result = subject(documentLines, widthPerType, options);
      result.forEach((entry) => {
        const textSubstr = allText.substr(entry.offset, entry.length);
        assert.deepEqual(entry.line, textSubstr);
      });
    });
  });
});
