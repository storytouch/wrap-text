const ChromeSimpleTextWrapper = require('./chromeSimpleTextWrapper');

// supported browsers
const CHROME_BROWSER = 'chrome';

// implemented algorithms
const SIMPLE_ALGORITHM = 'simple';

const ALGORITHMS = {
  [CHROME_BROWSER]: {
    [SIMPLE_ALGORITHM]: ChromeSimpleTextWrapper,
  },
};

const getAlgorithm = (browser, algorithm) => {
  const browserSelection = ALGORITHMS[browser];
  if (!browserSelection) throw new Error('Browser not compatible yet');

  const AlgorithmClass = browserSelection[algorithm];
  if (!AlgorithmClass) throw new Error('Algorithm does not found');

  return new AlgorithmClass();
};

exports.getAlgorithm = getAlgorithm;
