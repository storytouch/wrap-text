# wrap-text

A simple tool for wrapping words to the specified column width.

Main features:
 - It preserves existing line breaks 
 - It does not trim lines
 - Calculates the `y` position of each line

This means that you can reconstruct the input text exactly at it is.

#### Limitations
- It only works for monospace fonts so far.

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

### wrapText()

> ```ts
> wrapText(text: string, columns: number) => string[]
> wrapText(text: string, columns: number, options?: any) => any[]
> ```

This algorithm considers that all text have the same font characteristics, wrapping all its content into columns with a fixed and constant value defined by `column`.

* **text** The text itself. Newline characters `\n` are preserved.
* **columns** Number of columns to wrap the text into.
* **options**
  * **browser: string** Line break algorithms may differ from browser to browser. So far, only Google Chrome browser is supported. The default value is `chrome`.
  * **richOutput: boolean** Setting this option to `false`, an array of strings will be returned. When it is `true`, an array of objects is returned such as
      > ```ts
      > [{
      >   text: string,
      >   offset: number,
      >   length: number,
      >   originalBreak: boolean,
      > }]
      > ```
      * **text** The text content of the wrapped line.
      * **offset** The index of the first character of the line relative to the original text.
      * **length** Number of characters in the line.
      * **originalBreak** It is `true` when the line ends with a line break `\n` that was already in the original text.

#### Examples

```js
const wrapText = require('wrap-text');
const input = 'Lorem\nipsum dolor sit amet,\nconsectetur adipiscing \nelit.';

const output = wrapText(input, 15, { richOutput: true });
/* 
[
  'Lorem',
  'ipsum dolor ',
  'sit amet,',
  'consectetur ',
  'adipiscing ',
  'elit.'
]
*/

// or, with rich output
const output = wrapText(input, 15, { richOutput: true });
/* 
[
  { text: 'Lorem', offset: 0, length: 5, originalBreak: true },
  { text: 'ipsum dolor ', offset: 5, length: 12 },
  { text: 'sit amet,', offset: 17, length: 9, originalBreak: true },
  { text: 'consectetur ', offset: 26, length: 12 },
  { text: 'adipiscing ', offset: 38, length: 11, originalBreak: true },
  { text: 'elit.', offset: 49, length: 5 }
]
*/
```
### wrapTextRobust()

> ```ts
> wrapTextRobust(documentLines: any[], types: any[]) => string[]
> wrapTextRobust(documentLines: any[], types: Array<{[string]: any}>, options?: any) => any[]
> ```

This algorithm considers that all text have the same font characteristics, wrapping all its content into columns with a fixed and constant value defined by `column`.

* **documentLines** The input lines, structured by its type and further options, such as:
  * **text: string** The text of each line.
  * **type: string** The type of the lines. This type must match with one of the types defined in `types` parameter. All styles and properties used by the algorithm are based on the type definition. However, this properties can be overrided using specific values in each `documentLine`, as bellow.
  * **marginTop: number** Overrides the `marginTop` value defined by the associated `type` and applies it only to this line.
  * **marginBottom: number** Overrides the `marginBottom` value defined by the associated `type` and applies it only to this line. 
  * **lineHeight: number** Overrides the `lineHeight` value defined by the associated `type` and applies it only to this line. 
  * **visible: number** Overrides the `visible` value defined by the associated `type` and applies it only to this line. 
* **types** A HashMap with all type definitions used by `documentLines`:
  * **[key]: string** The HashMap key is the type name.
  * **marginTop: number** Top margin used  to calculate the `y0` position of each line. The `margin-top` is used only in the first wrapped line of each input line.
  * **marginBottom: number** Bottom margin used  to calculate the `y0` position of each line. The `margin-bottom` is used only in the last wrapped line of each input line.
  * **lineHeight: number** The height of each line of this type. 
  * **visible: number** When `visible` is `false`, lines of this type does not affect the `y0` calc of other lines.
* **options**
  * **browser: string** Line break algorithms may differ from browser to browser. So far, only Google Chrome browser is supported. The default value is `chrome`.
  * **richOutput: boolean** Setting this option to `false`, an array of strings will be returned. When it is `true`, an array of objects is returned such as
      > ```ts
      > [{
      >   text: string,
      >   type: string,
      >   offset: number,
      >   length: number,
      >   originalBreak: boolean,
      >   y0: number,
      >   height: number,
      >   parentIndex: number,
      >   visible: boolean,
      > }]
      > ```
      * **text** The text content of the wrapped line.
      * **type** The same type of the associated input line.
      * **offset** The index of the first character of the line relative to the original text.
      * **length** Number of characters in the line.
      * **originalBreak** It is `true` when the line ends with a line break `\n` that was already in the original text.
      * **y0** The `y-axis` position of the line origin.
      * **height** The line height.
      * **parentIndex** The index of the associated input line.
      * **visible** Whether the line is visible or not..

#### Examples

```js
const wrapText = require('wrap-text');

const types = {
  type_1: {
    width: 1,
    marginTop: 2,
    marginBottom: 10,
    lineHeight: 5,
  },
  type_2: {
    width: 9,
    marginTop: 4,
    lineHeight: 8,
  },
};

const documentLines = [{
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

const output = wrapTextRobust(documentLines, types);
/* 
[
  'a ',
  'b ',
  'c',
  'invisible',
  'd e',
]
*/

// or, with rich output
const output = wrapTextRobust(documentLines, types, { richOutput: true });
/* 
[
  {
    y0: 2,
    length: 2,
    text: 'a ',
    height: 5,
    offset: 0,
    parentIndex: 0,
    type: 'type_1',
    visible: true
  },
  {
    y0: 7,
    length: 2,
    text: 'b ',
    height: 5,
    offset: 2,
    parentIndex: 0,
    type: 'type_1',
    visible: true
  },
  {
    y0: 12,
    length: 1,
    text: 'c',
    height: 5,
    offset: 4,
    parentIndex: 0,
    type: 'type_1',
    visible: true
  },
  {
    y0: 27,
    length: 9,
    text: 'invisible',
    height: 8,
    offset: 6,
    parentIndex: 1,
    type: 'type_2',
    visible: false
  },
  {
    y0: 31,
    length: 3,
    text: 'd e',
    height: 8,
    offset: 16,
    parentIndex: 2,
    type: 'type_2',
    visible: true
  }
]
*/
```

## Related

- [wrap-ansi](https://github.com/chalk/wrap-ansi) - Wordwrap a string with ANSI escape codes
- [slice-ansi](https://github.com/chalk/slice-ansi) - Slice a string with ANSI escape codes

## Maintainers

- [Guilherme Gonçalves](https://github.com/ingoncalves)
- [Joas Souza](https://github.com/joassouza)
