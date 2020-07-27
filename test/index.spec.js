const assert = require('assert');
const test = require('testit');

const { wrapText, wrapTextRobust } = require('..');

test('wrapText()', () => {
  test('with valid input arguments', () => {
    test('does not throw any error', () => {
      const result = wrapText('hello world', 4, { richOutput: true });
      assert(Array.isArray(result));
    });
  });

  test('with no options', () => {
    test('does not throw any error', () => {
      const result = wrapText('hello world', 4);
      assert(Array.isArray(result));
    });
  });

  test('with width lower than 1', () => {
    test('does not throw any error', () => {
      const result = wrapText('hello world', 0);
      assert(Array.isArray(result));
    });
  });

  test('with no arguments', () => {
    test('throws an error', () => {
      assert.throws(() => wrapText());
    });
  });

  test('with no text', () => {
    test('throws an error', () => {
      assert.throws(() => wrapText(null, 4));
    });
  });

  test('with no width', () => {
    test('throws an error', () => {
      assert.throws(() => wrapText('hello word'));
    });
  });

  test('with no Integer width', () => {
    test('throws an error', () => {
      assert.throws(() => wrapText('hello word', 'a'));
    });
  });
});

test('wrapTextRobust()', () => {
  let documentLines;
  let types;
  let options;

  test('with valid input arguments', () => {
    documentLines = [{
      text: 'hello world',
      type: 'example',
    }];

    types = {
      example: {
        width: 4,
      },
    };

    options = {
      richOutput: true,
    };

    test('does not throw any error', () => {
      const result = wrapTextRobust(documentLines, types, options);
      assert(Array.isArray(result));
    });
  });

  test('with no options', () => {
    test('does not throw any error', () => {
      const result = wrapTextRobust(documentLines, types);
      assert(Array.isArray(result));
    });
  });

  test('with no arguments', () => {
    test('throws an error', () => {
      assert.throws(() => wrapTextRobust());
    });
  });

  test('with no documentLines', () => {
    test('throws an error', () => {
      assert.throws(() => wrapTextRobust(null, types));
    });
  });

  test('with no types', () => {
    test('throws an error', () => {
      assert.throws(() => wrapTextRobust(documentLines));
    });
  });

  test('with non Array documentLines', () => {
    test('throws an error', () => {
      assert.throws(() => wrapTextRobust(documentLines[0], types));
    });
  });

  test('with non Hash types', () => {
    test('throws an error', () => {
      assert.throws(() => wrapTextRobust(documentLines[0], [types]));
    });
  });
});
