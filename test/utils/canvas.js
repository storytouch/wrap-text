const {
  registerFont,
  createCanvas: createNodeCanvas,
} = require('canvas');

const registerFonts = (fonts) => {
  fonts.forEach((font) => {
    const { path: fontPath, ...fontProps } = font;
    registerFont(fontPath, fontProps);
  });
};

exports.createCanvas = (fonts = []) => {
  registerFonts(fonts);
  return createNodeCanvas(0, 0);
};
