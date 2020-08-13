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
  const madeStickerMessage = ` => 🛠 stickers made - ${from} - ${sender.pushname}`;
  const incomingMessage = ` => 📩 someone sent a message - ${from} - ${sender.pushname}`;
  const waitingForStickerMessage = 'Tunggu sebentar stiker lagi dibuat ⏳';
  const waitingForRequestsMessage = 'Tunggu sebentar data sedang di proses ⏳';
  const somethingWrongMessage = 'Sepertinya ada yang salah, coba beberapa saat lagi 🚴🏻';
  let botFeatureMsg = 'Hai 🙋🏻‍♂️, dibawah ini beberapa fitur yang bisa kalian gunakan\n\n';
  botFeatureMsg += '#sticker => Membuat stiker dari gambar 🖼\n';
  botFeatureMsg += '#korona => Data Korona Indonesia 🦠\n';
  const completeMessage = 'Tugas selesai 👌, untuk melihat semua fitur bot ketik #menu / #help / #halo / #hai';
  const keyword = caption || body || '';
  try {
    // eslint-disable-next-line default-case
    switch (keyword.toLowerCase()) {
      case '#sticker':
      case '#stiker':
        if (isMedia && type === 'image') {
          debug(madeStickerMessage);
          client.sendText(from, waitingForStickerMessage);
          const mediaData = await decryptMedia(message);
          const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
          await client.sendImageAsSticker(from, imageBase64);
          await client.sendText(from, completeMessage);
        }
        if (quotedMsg && quotedMsg.type === 'image') {
          debug(madeStickerMessage);
          client.sendText(from, waitingForStickerMessage);
          const mediaData = await decryptMedia(quotedMsg);
          const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
          await client.sendImageAsSticker(from, imageBase64);
          await client.sendText(from, completeMessage);
        }
        break;
      case '#hai':
      case '#halo':
      case '#menu':
      case '#help':
        debug(incomingMessage);
        await client.sendText(from, botFeatureMsg);
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
