/* eslint-disable no-console */
const { tz } = require('moment-timezone');

module.exports.debug = async (text) => {
  console.log(`${tz('Asia/Jakarta').format('LTS')} 🤖 => ${text}`);
};
