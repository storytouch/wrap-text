/* eslint-disable no-console */
const { wrapTextRobust } = require('../../index.js');
const { createCanvas } = require('../utils/canvas');

const textFixture = require('../fixtures/benchmark-text.json').text;

const NUMBER_OF_INPUT_LINES = 2000;

const FONT_DRIVEN_TYPE = 'FONT_DRIVEN_TYPE';
const COLUMN_DRIVEN_TYPE = 'COLUMN_DRIVEN_TYPE';

const isRunningOnBrowser = typeof window !== 'undefined';

const printAgent = () => {
  if (isRunningOnBrowser) {
    console.log('Running on Browser');
  } else {
    console.log('Running on Node.js');
  }
  console.log('==================');
};

const generateLongText = (numberOfParagraphs, type) => {
  const documentLines = [];
  for (let i = 0; i < numberOfParagraphs; i += 1) {
    documentLines.push({
      text: textFixture,
      type,
    });
  }
  return documentLines;
};

const types = {
  [FONT_DRIVEN_TYPE]: {
    width: 549,
    font: '15px Courier, monospace',
  },
  [COLUMN_DRIVEN_TYPE]: {
    columns: 61,
  },
};

const canvas = isRunningOnBrowser
  ? document.createElement('canvas')
  : createCanvas();

const options = {
  canvas,
};

const performBenchmarkTest = (numberOfParagraphs, type) => {
  const documentLines = generateLongText(numberOfParagraphs, type);
  console.time(type);
  const output = wrapTextRobust(documentLines, types, options);
  console.log('Number of input lines: ', numberOfParagraphs);
  console.log('Number of output lines: ', output.length);
  console.timeEnd(type);
  console.log('');
};

printAgent();
performBenchmarkTest(NUMBER_OF_INPUT_LINES, COLUMN_DRIVEN_TYPE);
performBenchmarkTest(NUMBER_OF_INPUT_LINES, FONT_DRIVEN_TYPE);
