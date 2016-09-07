/**
 * JavaScript implementation of Material UI colours
 *
 * @see https://github.com/muicss/mui/blob/master/src/sass/mui/_colors.scss
 *
 * @package: postcss.sassy.config
 * @author:  pospi <sam@everledger.io>
 * @since:   2016-09-07
 * @flow
 */

const MUIColors = require('./MUIColorMap');

const quoteTrim = (val) => val.replace(/^('|")(.*?)('|")$/, '$2');

function MUIColor(key1, key2 = '500') {
  key1 = quoteTrim(key1);
  key2 = quoteTrim(key2);

  if (MUIColors[key1] === undefined) {
    throw new Error(`Color '${key1}' not found.`);
  }
  if (typeof MUIColors[key1] === 'string') {
    return MUIColors[key1];
  }
  if (MUIColors[key1] === undefined || MUIColors[key1][key2] === undefined) {
    throw new Error(`Color '${key1}'.'${key2}' not found.`);
  }
  return MUIColors[key1][key2];
}

module.exports = {
  'mui-color': MUIColor,
};
