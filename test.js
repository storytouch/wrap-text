const assert = require('assert');
const test = require('testit');
const wrapText = require('./index');

let text;
let width;
let options;

test('wrapText()', () => {
  test('with a text without line breaks', () => {
    text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    test(`and width ${width}`, () => {
      width = 15;

      test(`all lines should have a maximum of ${width}`, () => {
        const result = wrapText(text, width);
        result.forEach((line) => assert(line.length <= width));
      });

      test('returns the expected lines', () => {
        const expectedLines = [
          'Lorem ipsum ',
          'dolor sit ',
          'amet, ',
          'consectetur ',
          'adipiscing ',
          'elit.',
        ];
        const result = wrapText(text, width);
        assert.deepEqual(result, expectedLines);
      });

      test('preserves the original text', () => {
        const result = wrapText(text, width);
        const reconstuctedText = result.join('');
        assert.deepEqual(reconstuctedText, text);
      });

      test('and the richOutput options is enabled', () => {
        options = { richOutput: true };

        test('returns each line with its expected offset and length', () => {
          const result = wrapText(text, width, options);
          result.forEach((entry) => {
            const textSubstr = text.substr(entry.offset, entry.length);
            assert.deepEqual(textSubstr, entry.line);
          });
        });
      });
    });
  });

  test('with a text with line breaks', () => {
    text = 'Lorem\nipsum dolor sit amet,\nconsectetur adipiscing \nelit.';

    test(`and width ${width}`, () => {
      width = 15;

      test(`all lines should have a maximum of ${width}`, () => {
        const result = wrapText(text, width);
        result.forEach((line) => assert(line.length <= width));
      });

      test('returns the expected lines', () => {
        const expectedLines = [
          'Lorem',
          'ipsum dolor ',
          'sit amet,',
          'consectetur ',
          'adipiscing ',
          'elit.',
        ];
        const result = wrapText(text, width);
        assert.deepEqual(result, expectedLines);
      });

      test('and the richOutput options is enabled', () => {
        options = { richOutput: true };

        test('allows to reconstruct the original input', () => {
          const result = wrapText(text, width, options);
          const reconstructedText = result.reduce((acc, entry) => {
            let fullText = acc;
            fullText += entry.line;
            if (entry.originalBreak) fullText += '\n';
            return fullText;
          }, '');
          assert.equal(reconstructedText, text);
        });
      });
    });
  });

  test('with words larger then the specified width', () => {
    text = 'A Loremipsum dolor sit\namet, consecteturadipiscing a elit.';
    width = 5;

    test(`all lines should have a maximum of ${width}`, () => {
      const result = wrapText(text, width);
      result.forEach((line) => assert(line.length <= width));
    });

    test('returns the expected lines', () => {
      // same lines produce by Broswer CSS break-word algorithm,
      // but does not trim lines
      const expectedLines = [
        'A ',
        'Lorem',
        'ipsum',
        ' ',
        'dolor',
        ' sit',
        'amet,',
        ' ',
        'conse',
        'ctetu',
        'radip',
        'iscin',
        'g a ',
        'elit.',
      ];
      const result = wrapText(text, width);
      assert.deepEqual(result, expectedLines);
    });
  });
});
