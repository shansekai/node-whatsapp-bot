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
    debugText: `(${name} - ${number}) mengirim pesan ${commandArgs} 📩`,
    debugImage: `(${name} - ${number}) mengirim gambar 📩`,
    wait: '_Tunggu sebentar ⏳_',
    done: '_Selesai ✅, ketik *#menu* buat kembali 🤖_',
    replyThanks: '_Iya sama - sama, ketik *#menu* buat kembali 🤖_',
    errFailed: '_Ada kesalahan teknis, ketik *#menu* buat kembali 🤖_',
    errImgNoCaption: '_Harus pakai caption, ketik *#menu* buat kembali 🤖_',
    errUnkCommand: '_Perintah tidak terdaftar, ketik *#menu* buat kembali 🤖_',
  };

  // debug all incoming message
  if (!isGroupMsg) {
    if (isMedia) {
      debug(msg.debugImage);
    } else {
      debug(msg.debugText);
    }
  }

  switch (command) {
    case '#sticker':
    case '#stiker':
      try {
        if (isMedia && type === 'image') {
          client.sendText(from, msg.wait);
          const mediaData = await decryptMedia(message);
          const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
          client.sendImageAsSticker(from, imageBase64);
          client.sendText(from, msg.done);
        }
        if (quotedMsg && quotedMsg.type === 'image') {
          client.sendText(from, msg.wait);
          const mediaData = await decryptMedia(quotedMsg);
          const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
          client.sendImageAsSticker(from, imageBase64);
          client.sendText(from, msg.done);
        }
      } catch (error) {
        client.sendText(from, msg.errFailed);
        console.log(error.message);
      }
      break;
    case '#menu':
      client.sendText(from, menu);
      break;
    case '#korona':
      try {
        client.sendText(from, msg.wait);
        client.sendText(from, await korona());
        client.sendText(from, msg.done);
      } catch (error) {
        client.sendText(from, msg.errFailed);
        console.log(error.message);
      }
      break;
    case '#quotes':
      try {
        client.sendText(from, msg.wait);
        client.sendText(from, quotes());
        client.sendText(from, msg.done);
      } catch (error) {
        client.sendText(from, msg.errFailed);
        console.log(error.message);
      }
      break;
    case '#wp':
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
          client.sendText(from, msg.errImgNoCaption);
        } else if (isThanks) {
          client.sendText(from, msg.replyThanks);
        } else {
          client.sendText(from, msg.errUnkCommand);
        }
      }
      break;
  }
};
