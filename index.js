/* eslint-disable no-console */
const { create, decryptMedia } = require('@open-wa/wa-automate');
const { tz } = require('moment-timezone');
const korona = require('./korona');
const quotes = require('./quotes');
const menu = require('./menu');
const { instaImage } = require('./instagram');

const debug = async (text) => {
  console.log(tz('Asia/Jakarta').format() + text);
};

const messageHandler = async (message, client) => {
  // eslint-disable-next-line object-curly-newline
  const { from, sender, caption, type, quotedMsg, mimetype, body, isMedia } = await message;

  let keyword = caption || body || '';
  keyword = keyword.toLowerCase();

  const madeStickerMessage = ` => 👨🏻‍🎨 stiker dibuat - ${from} - ${sender.pushname}`;
  const incomingMessage = ` => 📩 ada yang kirim pesan ${keyword} - ${from} - ${sender.pushname}`;
  const waitingForStickerMessage = '_Tunggu sebentar stiker lagi dibuat ⏳_';
  const waitingForRequestsMessage = '_Tunggu sebentar data lagi di proses ⏳_';
  const somethingWrongMessage = '_Kayaknya ada yang salah, coba nanti lagi 🚴🏻_';
  const completeMessage = '_Tugas selesai 👌, buat liat semua menu bot ketik *#menu*, kalau mau share ke temen - temen kalian atau masukin ke grup juga boleh_';

  try {
    if (keyword.startsWith('#sticker') || keyword.startsWith('#stiker')) {
      if (isMedia && type === 'image') {
        debug(incomingMessage);
        debug(madeStickerMessage);
        client.sendText(from, waitingForStickerMessage);
        const mediaData = await decryptMedia(message);
        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
        client.sendImageAsSticker(from, imageBase64);
        client.sendText(from, completeMessage);
      }
      if (quotedMsg && quotedMsg.type === 'image') {
        debug(incomingMessage);
        debug(madeStickerMessage);
        client.sendText(from, waitingForStickerMessage);
        const mediaData = await decryptMedia(quotedMsg);
        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
        client.sendImageAsSticker(from, imageBase64);
        client.sendText(from, completeMessage);
      }
    } else if (keyword.startsWith('#menu')) {
      debug(incomingMessage);
      client.sendText(from, menu);
    } else if (keyword.startsWith('#korona')) {
      debug(incomingMessage);
      client.sendText(from, waitingForRequestsMessage);
      client.sendText(from, await korona());
      client.sendText(from, completeMessage);
    } else if (keyword.startsWith('#quotes')) {
      debug(incomingMessage);
      client.sendText(from, waitingForRequestsMessage);
      client.sendText(from, quotes());
      client.sendText(from, completeMessage);
    } else if (keyword.startsWith('#ig')) {
      debug(incomingMessage);
      client.sendText(from, waitingForRequestsMessage);
      const igUrl = keyword.split(' ')[1];
      console.log(await instaImage(igUrl));
      // client.sendImage(from, await instaImage(url));
      // client.sendText(from, completeMessage);
    }
  } catch (error) {
    console.log(error);
    // await client.sendText(from, somethingWrongMessage);
    // debug(` => ${error}`);
  }
};

const start = async (client) => {
  debug(' => The bot has started');
  // force current session
  client.onStateChanged((state) => {
    debug(` => 🛠 state changed - ${state}`);
    if (state === 'CONFLICT') client.forceRefocus();
  });
  // handling message
  client.onMessage(async (message) => {
    messageHandler(message, client);
  });
};

// start wa client
create()
  .then(async (client) => start(client))
  .catch((error) => console.log(error));
