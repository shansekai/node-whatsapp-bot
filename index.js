/* eslint-disable max-len */
/* eslint-disable no-console */
const { create } = require('@open-wa/wa-automate');
const { messageHandler } = require('./messageHandler');
const { debug } = require('./src/debug');
const { Contacts } = require('./db');

const start = async (client) => {
  debug('The bot has started');
  client.onStateChanged((state) => {
    debug(`state changed - ${state.toLowerCase()} 🚑`);
    if (state === 'CONFLICT') client.forceRefocus();
  });
  // backup all chat to db
  const allChats = await client.getAllChats();
  allChats.forEach(async (element) => {
    const isExists = await Contacts.exists({ id: element.id });
    if (!isExists) {
      const newContacts = new Contacts(element);
      newContacts.save((err, doc) => {
        if (err) debug('kontak gagal bisa disimpan');
        debug(`kontak ${doc.id} berhasil disimpan ke db`);
      });
    }
  });
  // handle unread message after downtime
  // const unreadMessages = await client.getAllUnreadMessages();
  // unreadMessages.forEach((element) => {
  //   messageHandler(element, client);
  // });
  // handle live message
  // client.onMessage(async (message) => {
  //   messageHandler(message, client);
  // });
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
