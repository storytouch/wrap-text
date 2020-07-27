const { getAlgorithm } = require('./lib');

const wrapText = (text, width, options = {}) => {
  // validates the input values
  if (!text || !Number.isInteger(width)) {
    throw new Error('Invalid arguments');
  }

  // edge case
  if (width < 1) width = 1;

  // merge options  with default values
  const defaultOptions = {
    browser: 'chrome',
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // perform the choosen algorithm
  const { browser } = mergedOptions;
  const algorithm = 'simple';

  const algorithmInstance = getAlgorithm(browser, algorithm);
  return algorithmInstance.perform(text, width, options);
};

const wrapTextRobust = (documentLines, types, options = {}) => {
  // validates the input values
  if (
    !documentLines
    || !types
    || !documentLines.constructor === Array
    || !types.constructor === Object
  ) {
    throw new Error('Invalid arguments');
  }

  // merge options  with default values
  const defaultOptions = {
    browser: 'chrome',
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // perform the choosen algorithm
  const { browser } = mergedOptions;
  const algorithm = 'robust';

  const algorithmInstance = getAlgorithm(browser, algorithm);
  return algorithmInstance.perform(documentLines, types, options);
};

exports.wrapText = wrapText;
exports.wrapTextRobust = wrapTextRobust;
