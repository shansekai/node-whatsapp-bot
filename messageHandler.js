/* eslint-disable no-console */
/* eslint-disable max-len */
const { decryptMedia } = require('@open-wa/wa-automate');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const { debug } = require('./src/debug');
const korona = require('./src/korona');
const quotes = require('./src/quotes');
const { menu } = require('./src/menu');
const { wallpaper } = require('./src/wallpaper');
const { getZodiak } = require('./src/zodiak');
const { ramalanCinta } = require('./src/ramalan');

module.exports.messageHandler = async (message, client) => {
  // eslint-disable-next-line object-curly-newline
  const { from, sender, caption, type, quotedMsg, mimetype, body, isMedia, chat, isGroupMsg } = await message;

  const commandArgs = caption || body || '';
  const command = commandArgs.toLowerCase().split(' ')[0] || '';
  const args1 = commandArgs.split(' ')[1];
  const args2 = commandArgs.split(' ')[2];
  const args3 = commandArgs.split(' ')[3];
  const args4 = commandArgs.split(' ')[4];

  const phoneNumber = parsePhoneNumberFromString(from, 'ID');
  const number = phoneNumber ? phoneNumber.number : '';
  const name = sender.pushname || chat.name || sender.verifiedName || '';

  const msg = {
    debugSticker: `(${name} - ${number}) membuat stiker 🚀`,
    debugText: `(${name} - ${number}) mengirim pesan ${command} 📩`,
    debugImageNoCaption: `(${name} - ${number}) mengirim gambar tanpa caption 📩`,
    wait: '_Tunggu sebentar ⏳_',
    done: '_Selesai ✅, ketik *#menu* buat kembali 🤖_',
    replyThanks: '_Iya sama - sama, ketik *#menu* buat kembali 🤖_',
    errFailed: '_Ada kesalahan teknis, ketik *#menu* buat kembali 🤖_',
    errImgNoCaption: '_Harus pakai caption, ketik *#menu* buat kembali 🤖_',
    errUnkCommand: '_Perintah tidak terdaftar, ketik *#menu* buat kembali 🤖_',
  };

  try {
    switch (command) {
      case '#sticker':
      case '#stiker':
        if (isMedia && type === 'image') {
          debug(msg.debugText);
          debug(msg.debugSticker);
          client.sendText(from, msg.wait);
          const mediaData = await decryptMedia(message);
          const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
          client.sendImageAsSticker(from, imageBase64);
          client.sendText(from, msg.done);
        }
        if (quotedMsg && quotedMsg.type === 'image') {
          debug(msg.debugText);
          debug(msg.debugSticker);
          client.sendText(from, msg.wait);
          const mediaData = await decryptMedia(quotedMsg);
          const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
          client.sendImageAsSticker(from, imageBase64);
          client.sendText(from, msg.done);
        }
        break;
      case '#menu':
        debug(msg.debugText);
        client.sendText(from, menu);
        break;
      case '#korona':
        debug(msg.debugText);
        client.sendText(from, msg.wait);
        client.sendText(from, await korona());
        client.sendText(from, msg.done);
        break;
      case '#quotes':
        debug(msg.debugText);
        client.sendText(from, msg.wait);
        client.sendText(from, quotes());
        client.sendText(from, msg.done);
        break;
      case '#wp':
        debug(msg.debugText);
        client.sendText(from, msg.wait);
        wallpaper
          .then((result) => {
            client.sendFileFromUrl(from, result);
            client.sendText(from, msg.done);
          })
          .catch((error) => {
            client.sendText(from, msg.errFailed);
            console.log(error.message);
          });
        break;
      case '#zodiak':
        debug(msg.debugText);
        client.sendText(from, msg.wait);
        getZodiak(args1, args2)
          .then((result) => {
            client.sendText(from, result);
            client.sendText(from, msg.wait);
          })
          .catch((error) => {
            client.sendText(from, msg.errFailed);
            console.log(error.message);
          });
        break;
      case '#ramalan':
        debug(msg.debugText);
        client.sendText(from, msg.wait);
        ramalanCinta(args1, args2, args3, args4)
          .then((result) => {
            client.sendText(from, result);
            client.sendText(from, msg.done);
          })
          .catch((error) => {
            client.sendText(from, msg.errFailed);
            console.log(error.message);
          });
        break;
      default:
        if (!isGroupMsg) {
          const thanks = ['terimakasi', 'makasi', 'thx', 'thank', 'trim', 'oke'];
          const isThanks = !!new RegExp(thanks.join('|')).test(commandArgs.toLowerCase());
          if (type === 'image' && !caption) {
            debug(msg.errImgNoCaption);
            client.sendText(from, msg.errImgNoCaption);
          } else if (isThanks) {
            debug(msg.debugText);
            client.sendText(from, msg.replyThanks);
          } else {
            debug(msg.debugText);
            client.sendText(from, msg.errUnkCommand);
          }
        }
        break;
    }
  } catch (error) {
    client.sendText(from, msg.errFailed);
    console.log(error.message);
  }
};
