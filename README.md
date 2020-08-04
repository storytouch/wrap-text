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
const { wrapText } = require('wrap-text');

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
  * **browser: string** Line-breaking algorithms may differ from browser to browser. So far, only the Google Chrome browser is supported. The default value is `chrome`.
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
const { wrapText } = require('wrap-text');
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

This algorithm allows multiple font characteristics, but only monospaced. Each font property, such as width, margins, and line-height, is mapped to a defined type.

* **documentLines** The input lines, structured by its content, type, and further options, such as:
  * **text: string** The line text. It is required.
  * **type: string** The line type. This type must match with one of the types defined in the `types` parameter. All styles and properties used by the algorithm are based on the type definition. However, these properties can be overridden using specific values in each `documentLine`, as bellow. It is required.
  * **[other options]** All options defined in `types` can be overridden in the scope of the line (except `fontConfig`). In that case, those specific options will apply only to the respective line. It is optional.
* **types** A HashMap with all type definitions used by `documentLines`:
  * **[key]: string** The HashMap key is the type name. It is required.
  * **columns** Number of characters per line. This is recommended for monospace fonts, as it does not use complex calculations (drawing and measuring text on a canvas). If you intend to use non-monospaced fonts, use `width`.
  * **width** Maximum line width in pixels. It is used especially for non-monospaced fonts. For monospace fonts, use `columns`.
  * **marginTop: number** Top margin used to calculate the position of each line. The `margin-top` is used only in the first wrapped line of each input line. It is optional.
  * **marginBottom: number** Bottom margin used to calculate the position of each line. The `margin-bottom` is used only in the last wrapped line of each input line. It is optional.
  * **lineHeight: number** The height of each line of this type. It is optional.
  * **visible: number** When `visible` is `false`, lines of this type do not affect the position of other lines. It is optional.
  * **font: string** The font to be applied to the text, using the [`CanvasRenderingContext2D.font`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) format. It is optional. The default value is `13px Courier, monospace`.
  * **fontConfig: any** If you want to use external fonts, you should specify its location and properties. It is optional. These options are used in [`registerFont`](https://github.com/Automattic/node-canvas#registerfont) method. With the exception of the `path`, all other properties with properties resemble the CSS properties that are specified in `@font-face rules`. You must specify at least `family`. The`weight` and `style` are optional and default to `normal`.
      * **path: string** The `.ttf` file path.
      * **family: string** The font family name. E.g.: `Roboto`, `Comic Sans`.
      * **weight: string** The font weight. E.g.: `bold`, `300`.
      * **style: string** The font style. E.g.: `italic`.
* **options**
  * **browser: string** Line-breaking algorithms may differ from browser to browser. So far, only the Google Chrome browser is supported. The default value is `chrome`.
  * **richOutput: boolean** Setting this option to `false`, an array of strings will be returned. When it is `true`, an array of objects is returned such as
      > ```ts
      > [{
      >   height: number,
      >   length: number,
      >   marginBottom: number,
      >   marginTop: number,
      >   offset: number,
      >   originalBreak: boolean,
      >   parentIndex: number,
      >   text: string,
      >   type: string,
      >   visible: boolean,
      >   width: number,
      >   y0: number,
      > }]
      > ```
      * **height** The line height.
      * **length** Number of characters in the line.
      * **marginBottom** The line margin-bottom.
      * **marginTop** The line margin-top.
      * **offset** The index of the first character of the line relative to the original text.
      * **originalBreak** It is `true` when the line ends with a line break `\n` that was already in the original text.
      * **parentIndex** The index of the associated input line.
      * **text** The text content of the wrapped line.
      * **type** The same type of the associated input line.
      * **visible** Whether the line is visible or not.
      * **width** The line width.
      * **y0** The `y-axis` position of the line origin. If the line is not visible, this value will be `-1`.

#### Examples

```js
const { wrapTextRobust } = require('wrap-text');

const types = {
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
      path: '/path/of/my/fonts/Roboto-Light.ttf',
    },
  },
  type_2: {
    columns: 9,
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
    height: 5,
    length: 2,
    marginTop: 2,
    marginBottom: 0,
    offset: 0,
    width: 12,
    y0: 0,
    parentIndex: 0,
    text: 'a ',
    type: 'type_1',
    visible: true
  },
  {
    height: 5,
    length: 2,
    marginTop: 0,
    marginBottom: 0,
    offset: 2,
    width: 12,
    y0: 7,
    parentIndex: 0,
    text: 'b ',
    type: 'type_1',
    visible: true
  },
  {
    height: 5,
    length: 1,
    marginTop: 0,
    marginBottom: 10,
    offset: 4,
    width: 8,
    y0: 12,
    parentIndex: 0,
    text: 'c',
    type: 'type_1',
    visible: true
  },
  {
    height: 0,
    length: 9,
    marginTop: 0,
    marginBottom: 0,
    offset: 6,
    width: 9,
    y0: -1,
    parentIndex: 1,
    text: 'invisible',
    type: 'type_2',
    visible: false
  },
  {
    height: 8,
    length: 3,
    marginTop: 4,
    marginBottom: 0,
    offset: 16,
    width: 3,
    y0: 27,
    parentIndex: 2,
    text: 'd e',
    type: 'type_2',
    visible: true
  }
]
*/
```

## Benchmark

A simple benchmark test with 2k input lines producing 38k output lines was performed considering two configurations: using `columns` (no need to render the font) and using `width` (needs to render the text with the font inside a canvas). The test was also run on Node.js and Browser (Google Chrome). Here are some preliminary results:

```
Running on Node.js
==================
using column:   197.645ms
using width : 15671.907ms

Running on Browser
==================
using column:  67.528ms
using width : 534.700ms
```

## Related

- [wrap-ansi](https://github.com/chalk/wrap-ansi) - Wordwrap a string with ANSI escape codes
- [slice-ansi](https://github.com/chalk/slice-ansi) - Slice a string with ANSI escape codes

## Maintainers

- [Guilherme Gonçalves](https://github.com/ingoncalves)
- [Joas Souza](https://github.com/joassouza)
