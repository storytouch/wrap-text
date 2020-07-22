const ChromeSimpleTextWrapper = require('./chromeSimpleTextWrapper');
const ChromeRobustTextWrapper = require('./chromeRobustTextWrapper');

// supported browsers
const CHROME_BROWSER = 'chrome';

// implemented algorithms
const SIMPLE_ALGORITHM = 'simple';
const ROBUST_ALGORITHM = 'robust';

const ALGORITHMS = {
  [CHROME_BROWSER]: {
    [SIMPLE_ALGORITHM]: ChromeSimpleTextWrapper,
    [ROBUST_ALGORITHM]: ChromeRobustTextWrapper,
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
