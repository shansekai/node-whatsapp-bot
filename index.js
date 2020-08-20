/* eslint-disable max-len */
/* eslint-disable no-console */
const { create } = require('@open-wa/wa-automate');
const { messageHandler } = require('./messageHandler');
const { debug } = require('./src/debug');

const start = async (client) => {
  debug('The bot has started');
  client.onStateChanged((state) => {
    debug(`state changed - ${state.toLowerCase()} 🚑`);
    if (state === 'CONFLICT') client.forceRefocus();
  });
  // handle unread message after downtime
  const unreadMessages = await client.getAllUnreadMessages();
  unreadMessages.forEach((element) => {
    messageHandler(element, client);
  });
  // handle live message
  client.onMessage((message) => {
    messageHandler(message, client);
  });
};

const options = {
  headless: false,
  cacheEnabled: false,
};

if (process.platform === 'darwin') options.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (process.platform === 'linux') options.executablePath = '/usr/bin/google-chrome-stable';
if (process.platform === 'win32' || process.platform === 'win64') options.executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

create(options)
  .then(async (client) => start(client))
  .catch((error) => console.log(error));
