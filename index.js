/* eslint-disable no-console */
const { create, decryptMedia } = require('@open-wa/wa-automate');
const { tz } = require('moment-timezone');
const korona = require('./korona');

const debug = async (text) => {
  console.log(tz('Asia/Jakarta').format() + text);
};

const messageHandler = async (message, client) => {
  // eslint-disable-next-line object-curly-newline
  const { from, sender, caption, type, quotedMsg, mimetype, body } = await message;
  const madeStickerMessage = ` => 🖼 someone made a sticker - ${from} - ${sender.pushname}`;
  const incomingMessage = ` => 📩 someone sent a message - ${from} - ${sender.pushname}`;
  const waitingForStickerMessage = 'Tunggu sebentar stiker lagi dibuat ⏳';
  const waitingForRequestsMessage = 'Tunggu sebentar data sedang di proses ⏳';
  const captionText = caption ? caption.toLowerCase() : '';
  const bodyText = body ? body.toLowerCase() : '';

  // image caption contain #sticker or #stiker
  if (captionText === '#sticker' || captionText === '#stiker') {
    // general message
    if (type === 'image') {
      debug(madeStickerMessage);
      client.sendText(from, waitingForStickerMessage);
      const mediaData = await decryptMedia(message);
      const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
      await client.sendImageAsSticker(from, imageBase64);
    }
    // quoted message
    if (quotedMsg.type === 'image') {
      debug(madeStickerMessage);
      client.sendText(from, waitingForStickerMessage);
      const mediaData = await decryptMedia(quotedMsg);
      const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
      await client.sendImageAsSticker(from, imageBase64);
    }
  }
  // info message
  if (bodyText === '#hai' || bodyText === '#halo') {
    debug(incomingMessage);
    let botFeatureMsg = 'Hai 🙋🏻‍♂️, dibawah ini beberapa fitur yang bisa kalian gunakan\n\n';
    botFeatureMsg += '#sticker => Membuat stiker dari gambar 🖼\n';
    botFeatureMsg += '#korona => Data Korona Indonesia 🦠\n';
    await client.sendText(from, botFeatureMsg);
  }
  // korona
  if (bodyText === '#korona') {
    debug(incomingMessage);
    await client.sendText(from, waitingForRequestsMessage);
    await client.sendText(from, await korona());
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
