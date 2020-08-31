const assert = require('assert');
const test = require('testit');
const ChromeRobustTextWrapper = require('../../lib/chromeRobustTextWrapper');
const complexTextFixture = require('../fixtures/complex-text.json');
const { createCanvas } = require('../utils/canvas');

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

    options = {
      canvas: createCanvas(),
    };

    test('all lines should have a maximum of the type width + 1 whitespace', () => {
      const result = subject(documentLines, types, options);
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
      const result = subject(documentLines, types, options);
      assert.deepEqual(result, expectedLines);
    });

    test('preserves the original text', () => {
      const result = subject(documentLines, types, options);
      const reconstuctedText = result.join('');
      const originalText = documentLines.map((entry) => entry.text).join('\n');
      assert.deepEqual(reconstuctedText, originalText);
    });

    test('and the richOutput options is enabled', () => {
      options = {
        richOutput: true,
        canvas: createCanvas(),
      };

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
        const expectedY0 = [0, 12, 17, 22, 27];
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

    const fonts = [{
      family: 'Roboto',
      weight: '300',
      style: 'normal',
      path: '/usr/src/app/test/fixtures/fonts/Roboto/Roboto-Light.ttf',
    }];

    // E.g: let's mark every type transition
    const marker = () => {
      let lastType = null;
      return (context, index) => {
        const currentType = context.type;
        const isTransition = index > 0 && currentType !== lastType;
        lastType = currentType;
        return {
          transition: isTransition,
        };
      };
    };

    options = {
      richOutput: true,
      canvas: createCanvas(fonts),
      marker: marker(),
    };

    test('returns the expected text of each line', () => {
      const expectedValues = [
        'a ',
        'b ',
        'c',
        'invisible',
        'd e',
      ];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.text), expectedValues);
    });

    test('returns the expected index of each line', () => {
      const expectedValues = [0, 1, 2, 3, 4];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.index), expectedValues);
    });

    test('returns the expected parent index each line', () => {
      const expectedValues = [0, 0, 0, 1, 2];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.parentIndex), expectedValues);
    });

    test('returns the expected position of each line', () => {
      const expectedValues = [0, 7, 12, -1, 27];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.y0), expectedValues);
    });

    test('returns the expected height of each line', () => {
      const expectedValues = [5, 5, 5, 0, 8];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.height), expectedValues);
    });

    test('returns the expected marginTop of each line', () => {
      const expectedValues = [2, 0, 0, 0, 4];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.marginTop), expectedValues);
    });

    test('returns the expected marginBottom of each line', () => {
      const expectedValues = [0, 0, 10, 0, 0];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.marginBottom), expectedValues);
    });

    test('returns the expected totalHeight of each line', () => {
      const expectedValues = [7, 5, 15, 0, 12];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.totalHeight), expectedValues);
    });

    test('allows to reconstruct the positions', () => {
      const result = subject(documentLines, types, options);
      const visibleLines = result.filter((line) => line.visible);
      let y = 0;
      for (let i = 0; i < visibleLines.length - 1; i += 1) {
        const line = visibleLines[i];
        const nextLine = visibleLines[i + 1];
        y += line.height + line.marginTop + line.marginBottom;
        assert.deepEqual(y, nextLine.y0);
      }
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

    test('returns the expected marker of each line', () => {
      const expectedValues = [false, false, false, true, false];
      const result = subject(documentLines, types, options);
      assert.deepEqual(result.map((entry) => entry.transition), expectedValues);
    });
  });

  test('with a complex text', () => {
    const { expectedOutput, fonts } = complexTextFixture;
    types = complexTextFixture.types;
    documentLines = complexTextFixture.documentLines;
    options = {
      richOutput: true,
      canvas: createCanvas(fonts),
    };

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

    test('allows to reconstruct the positions', () => {
      const result = subject(documentLines, types, options);
      let y = 0;
      for (let i = 0; i < result.length - 1; i += 1) {
        const line = result[i];
        const nextLine = result[i + 1];
        y += line.height + line.marginTop + line.marginBottom;
        assert.deepEqual(y, nextLine.y0);
      }
    });
  });
});
