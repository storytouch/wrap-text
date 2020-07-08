const ChromeDefaultTextWrapper = require('./chromeDefaultTextWrapper');

// supported browsers
const CHROME_BROWSER = 'chrome';

// implemented algorithms
const DEFAULT_ALGORITHM = 'default';

const ALGORITHMS = {
  [CHROME_BROWSER]: {
    [DEFAULT_ALGORITHM]: ChromeDefaultTextWrapper,
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
