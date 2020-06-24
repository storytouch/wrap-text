# wrap-text

A simple tool for wrapping words to the specified column width.

Main features:
 - It preserves existing line breaks 
 - It does not trim lines

This means that you can reconstruct the input text exactly at it is.

## Install

```
$ npm install https://github.com/storytouch/wrap-text.git
```

## Usage

```js
const wrapText = require('wrap-text');

const input  = 'Lorem\nipsum dolor sit amet,\nconsectetur adipiscing \nelit.';
const output = wrapText(input, 15);

/* output
[
  'Lorem',
  'ipsum dolor ',
  'sit amet,',
  'consectetur ',
  'adipiscing ',
  'elit.',
]
*/
```

## API

### wrapText(string, columns, options?)

Wrap words to the specified column width.

#### string

Type: `string`

The text itself. Newline `\n` characters are preserved.

#### columns

Type: `number`

Number of columns to wrap the text to.

#### options

Type: `object`

##### richOutput

Type: `boolean`\
Default: `false`

Setting this to `true`, the `offset`, `length`, and `originalBreak` (if any) of each line are also returned.

E.g.:

```js

const input = 'Lorem\nipsum dolor sit amet,\nconsectetur adipiscing \nelit.';
const output = wrapText(input, 15, { richOutput: true });

/* output
[
  { line: 'Lorem', offset: 0, length: 5, originalBreak: true },
  { line: 'ipsum dolor ', offset: 5, length: 12 },
  { line: 'sit amet,', offset: 17, length: 9, originalBreak: true },
  { line: 'consectetur ', offset: 26, length: 12 },
  { line: 'adipiscing ', offset: 38, length: 11, originalBreak: true },
  { line: 'elit.', offset: 49, length: 5 }
]
*/
```

## Related

- [wrap-ansi](https://github.com/chalk/wrap-ansi) - Wordwrap a string with ANSI escape codes
- [slice-ansi](https://github.com/chalk/slice-ansi) - Slice a string with ANSI escape codes

## Maintainers

- [Guilherme Gonçalves](https://github.com/ingoncalves)
- [Joas Souza](https://github.com/joassouza)
