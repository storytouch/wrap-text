const ChromeTextWrapper = require('./lib/chromeTextWrapper');

const wrapText = (text, width, options = {}) => {
  const defaultOptions = {
    browser: 'chrome',
    richOutput: false,
  };

  options = {
    ...defaultOptions,
    ...options,
  };

  // edge case
  if (width < 1) width = 1;

  let textWrapperAlgorithm;
  switch (options.browser) {
    case 'chrome':
      textWrapperAlgorithm = new ChromeTextWrapper(options);
      break;
    default:
      throw new Error('Browser not compatible yet');
  }

  return textWrapperAlgorithm.perform(text, width);
};

module.exports = wrapText;
