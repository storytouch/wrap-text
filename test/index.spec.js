const assert = require('assert');
const test = require('testit');
const wrapText = require('..');

let text;
let width;
let options;

test('wrapText()', () => {
  // produce the same output of Chrome CSS break-word algorithm,
  // but does not trim lines
  test('Chrome Browser', () => {
    options = { browser: 'chrome' };

    test('with a text without line breaks', () => {
      text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

      test('and width 15', () => {
        width = 15;

        test('all lines should have a maximum of 15 + 1 whitespace', () => {
          const result = wrapText(text, width);
          result.forEach((line) => assert(line.length <= (width + 1)));
        });

        test('returns the expected lines', () => {
          const expectedLines = [
            'Lorem ipsum ',
            'dolor sit amet, ',
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
      text = 'Lorem\nipsum dolor sit amet,\nconsectetur adipiscing \n\nelit.';

      test('and width 15', () => {
        width = 15;

        test('all lines should have a maximum of 15 + 1 whitespace', () => {
          const result = wrapText(text, width);
          result.forEach((line) => assert(line.length <= (width + 1)));
        });

        test('returns the expected lines', () => {
          const expectedLines = [
            'Lorem',
            'ipsum dolor sit ',
            'amet,',
            'consectetur ',
            'adipiscing ',
            '',
            'elit.',
          ];
          const result = wrapText(text, width);
          assert.deepEqual(result, expectedLines);
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

    test('with a word larger then the specified width', () => {
      text = 'Loremipsum';
      width = 5;

      test('all lines should have a maximum of 5 + 1 whitespace', () => {
        const result = wrapText(text, width);
        result.forEach((line) => assert(line.length <= (width + 1)));
      });

      test('returns the expected lines', () => {
        const expectedLines = [
          'Lorem',
          'ipsum',
        ];
        const result = wrapText(text, width);
        assert.deepEqual(result, expectedLines);
      });
    });

    test('with words larger then the specified width', () => {
      text = 'A Loremipsum dolor sit\namet, consecteturadipiscing a elit.';
      width = 5;

      test('all lines should have a maximum of 5 + 1 whitespace', () => {
        const result = wrapText(text, width);
        result.forEach((line) => assert(line.length <= (width + 1)));
      });

      test('returns the expected lines', () => {
        const expectedLines = [
          'A ',
          'Lorem',
          'ipsum ',
          'dolor ',
          'sit',
          'amet, ',
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

    test('another case #1', () => {
      text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget maximus libero. Quisque ornare, massa id eleifend viverra, massa lectus tristique eros, id sagittis est quam malesuada odio. Nam suscipit neque nec enim semper euismod. Maecenas eu dui viverra, laoreet ligula vitae, sodales dolor. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Duis quis augue turpis. Proin quis quam velit.';
      width = 61;

      test('all lines should have a maximum of 61 + 1 whitespace', () => {
        const result = wrapText(text, width);
        result.forEach((line) => assert(line.length <= (width + 1)));
      });

      test('returns the expected lines', () => {
        const expectedLines = [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ',
          'eget maximus libero. Quisque ornare, massa id eleifend ',
          'viverra, massa lectus tristique eros, id sagittis est quam ',
          'malesuada odio. Nam suscipit neque nec enim semper euismod. ',
          'Maecenas eu dui viverra, laoreet ligula vitae, sodales dolor. ',
          'Vestibulum ante ipsum primis in faucibus orci luctus et ',
          'ultrices posuere cubilia curae; Duis quis augue turpis. Proin ',
          'quis quam velit.',
        ];
        const result = wrapText(text, width);
        assert.deepEqual(result, expectedLines);
      });
    });

    test('another case #2', () => {
      text = 'Quisque convallis dolor felis, sed venenatis mi sagittis rutrum. Nam vel ligula aliquam, tempus augue ac, iaculis nisl.';
      width = 61;

      test('all lines should have a maximum of 61 + 1 whitespace', () => {
        const result = wrapText(text, width);
        result.forEach((line) => assert(line.length <= (width + 1)));
      });

      test('returns the expected lines', () => {
        const expectedLines = [
          'Quisque convallis dolor felis, sed venenatis mi sagittis ',
          'rutrum. Nam vel ligula aliquam, tempus augue ac, iaculis ',
          'nisl.',
        ];
        const result = wrapText(text, width);
        assert.deepEqual(result, expectedLines);
      });
    });
  });
});
