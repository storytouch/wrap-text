const assert = require('assert');
const test = require('testit');
const ChromeRobustTextWrapper = require('../../lib/chromeRobustTextWrapper');
const complexTextFixture = require('../fixtures/complex-text.json');

let documentLines;
let types;
let options;

const subject = (...args) => {
  const algorithm = new ChromeRobustTextWrapper();
  return algorithm.perform(...args);
};

test('ChromeRobustTextWrapper', () => {
  // produce the same output of Chrome CSS break-word algorithm,
  // but does not trim lines
  test('with a text with only one line type', () => {
    types = {
      any_type: {
        width: 120,
        marginTop: 7,
        lineHeight: 5,
      },
    };

    documentLines = [{
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      type: 'any_type',
    }];

    test('all lines should have a maximum of the type width + 1 whitespace', () => {
      const result = subject(documentLines, types);
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
      const result = subject(documentLines, types);
      assert.deepEqual(result, expectedLines);
    });

    test('preserves the original text', () => {
      const result = subject(documentLines, types);
      const reconstuctedText = result.join('');
      const originalText = documentLines.map((entry) => entry.text).join('\n');
      assert.deepEqual(reconstuctedText, originalText);
    });

    test('and the richOutput options is enabled', () => {
      options = { richOutput: true };

      test('returns each line with its expected offset and length', () => {
        const result = subject(documentLines, types, options);
        result.forEach((entry) => {
          const sourceDocumentLine = documentLines[entry.parentIndex];
          const { text } = sourceDocumentLine;
          const textSubstr = text.substr(entry.offset, entry.length);
          assert.deepEqual(entry.text, textSubstr);
        });
      });

      test('returns the expected position of each line', () => {
        const expectedY0 = [7, 12, 17, 22, 27];
        const result = subject(documentLines, types, options);
        assert.deepEqual(result.map((entry) => entry.y0), expectedY0);
      });
    });
  });

  test('with a text with many line types', () => {
    types = {
      type_1: {
        width: 10,
        marginTop: 2,
        marginBottom: 10,
        lineHeight: 5,
        font: '300 15px Roboto, sans-serif',
        fontConfig: {
          family: 'Roboto',
          weight: '300',
          style: 'normal',
          path: '/usr/src/app/test/fixtures/fonts/Roboto/Roboto-Light.ttf',
        },
      },
      type_2: {
        columns: 9,
        marginTop: 4,
        lineHeight: 8,
      },
    };

    documentLines = [{
      text: 'a b c',
      type: 'type_1',
    }, {
      text: 'invisible',
      type: 'type_2',
      visible: false,
    }, {
      text: 'd e',
      type: 'type_2',
    }];

    options = {
      richOutput: true,
    };

    test('returns the expected lines', () => {
      const expectedLines = [
        'a ',
        'b ',
        'c',
        'invisible',
        'd e',
      ];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.text), expectedLines);
    });

    test('returns the expected parent index each line', () => {
      const expectedIndexes = [0, 0, 0, 1, 2];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.parentIndex), expectedIndexes);
    });

    test('returns the expected position of each line', () => {
      const expectedY0 = [2, 7, 12, 27, 31];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.y0), expectedY0);
    });

    test('returns each line with its expected offset and length', () => {
      const allText = documentLines
        .map((entry) => entry.text)
        .join('\n');
      const result = subject(documentLines, types, options);
      result.forEach((entry) => {
        const textSubstr = allText.substr(entry.offset, entry.length);
        assert.deepEqual(entry.text, textSubstr);
      });
    });
  });

  test('with a complex text', () => {
    const { expectedOutput } = complexTextFixture;
    types = complexTextFixture.types;
    documentLines = complexTextFixture.documentLines;
    options = { richOutput: true };

    test('produces the expected lines', () => {
      const result = subject(documentLines, types, options);
      result.forEach((entry, index) => {
        const expectedOutputText = expectedOutput[index].text;
        assert.deepEqual(entry.text, expectedOutputText);
      });
    });

    test('preserves the original text of each line', () => {
      const result = subject(documentLines, types, options);
      documentLines.forEach((documentLine, index) => {
        const reconstuctedText = result
          .filter((entry) => entry.parentIndex === index)
          .map((entry) => entry.text)
          .join('');
        assert.deepEqual(reconstuctedText, documentLine.text);
      });
    });

    test('returns each line with its expected offset and length', () => {
      const allText = documentLines
        .map((entry) => entry.text)
        .join('\n');
      const result = subject(documentLines, types, options);
      result.forEach((entry) => {
        const textSubstr = allText.substr(entry.offset, entry.length);
        assert.deepEqual(entry.text, textSubstr);
      });
    });

    test('calcutates the expected position of each line', () => {
      const result = subject(documentLines, types, options);
      result.forEach((entry, index) => {
        const expectedY0 = expectedOutput[index].y0;
        assert.deepEqual(entry.y0, expectedY0);
      });
    });
  });
});
