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
    algorithm: 'simple',
    richOutput: false,
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  // perform the choosen algorithm
  const {
    browser,
    algorithm,
  } = mergedOptions;

  const algorithmInstance = getAlgorithm(browser, algorithm);
  return algorithmInstance.perform(text, width, options);
};

module.exports = wrapText;
