/* eslint-disable no-console */
const { create, decryptMedia } = require('@open-wa/wa-automate');
const { tz } = require('moment-timezone');
const korona = require('./korona');
const quotes = require('./quotes');

const debug = async (text) => {
  console.log(tz('Asia/Jakarta').format() + text);
};

const messageHandler = async (message, client) => {
  // eslint-disable-next-line object-curly-newline
  const { from, sender, caption, type, quotedMsg, mimetype, body, isMedia } = await message;
  const keyword = caption || body || '';

  const madeStickerMessage = ` => 👨🏻‍🎨 stiker dibuat - ${from} - ${sender.pushname}`;
  const incomingMessage = ` => 📩 ada yang kirim pesan ${keyword} - ${from} - ${sender.pushname}`;
  const waitingForStickerMessage = '_Tunggu sebentar stiker lagi dibuat ⏳_';
  const waitingForRequestsMessage = '_Tunggu sebentar data lagi di proses ⏳_';
  const somethingWrongMessage = '_Kayaknya ada yang salah, coba nanti lagi 🚴🏻_';

  const menuMessage = `Hai 🙋🏻‍♂️, ini daftar menu yang bisa kalian gunakan disini
  
  *#sticker*
  _Bikin stiker dari gambar 🖼, kirim gambar dan beri caption atau bisa juga quote/reply dari gambar yang sudah ada di chat/group_
  
  *#korona*
  _Data korona Indonesia 🦠, data realtime dan terupdate dari sumber terpercaya_
  
  *#quotes*
  _Random quotes Bahasa Indonesia 🔖_
  
  ** Kalau ada masalah atau mau request fitur bisa chat disini, kalau beruntung bakal dibalas admin`;

  const completeMessage = '_Tugas selesai 👌, buat liat semua menu bot ketik *#menu*, kalau mau share ke temen - temen kalian atau masukin ke grup juga boleh_';

  try {
    // eslint-disable-next-line default-case
    switch (keyword.toLowerCase()) {
      case '#sticker':
        if (isMedia && type === 'image') {
          debug(incomingMessage);
          debug(madeStickerMessage);
          client.sendText(from, waitingForStickerMessage);
          const mediaData = await decryptMedia(message);
          const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
          await client.sendImageAsSticker(from, imageBase64);
          await client.sendText(from, completeMessage);
        }
        if (quotedMsg && quotedMsg.type === 'image') {
          debug(incomingMessage);
          debug(madeStickerMessage);
          client.sendText(from, waitingForStickerMessage);
          const mediaData = await decryptMedia(quotedMsg);
          const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
          await client.sendImageAsSticker(from, imageBase64);
          await client.sendText(from, completeMessage);
        }
        break;
      case '#menu':
        debug(incomingMessage);
        await client.sendText(from, menuMessage);
        break;
      case '#korona':
        debug(incomingMessage);
        await client.sendText(from, waitingForRequestsMessage);
        await client.sendText(from, await korona());
        await client.sendText(from, completeMessage);
        break;
      case '#quotes':
        debug(incomingMessage);
        await client.sendText(from, waitingForRequestsMessage);
        await client.sendText(from, await quotes());
        await client.sendText(from, completeMessage);
        break;
    }
  } catch (error) {
    await client.sendText(from, somethingWrongMessage);
    debug(` => ${error.message}`);
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
