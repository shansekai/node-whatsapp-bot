/* eslint-disable no-console */
/* eslint-disable max-len */
const { decryptMedia } = require('@open-wa/wa-automate');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const { debug } = require('./debug');
const korona = require('./korona');
const quotes = require('./quotes');
const { menu } = require('./menu');
const { wallpaper } = require('./wallpaper');
const { getZodiak } = require('./zodiak');
const { ramalanCinta } = require('./ramalan');

module.exports.messageHandler = async (message, client) => {
  // eslint-disable-next-line object-curly-newline
  const { from, sender, caption, type, quotedMsg, mimetype, body, isMedia, chat, isGroupMsg } = await message;

  const commandArgs = caption || body || '';
  const command = commandArgs.toLowerCase().split(' ')[0];
  const args1 = commandArgs.split(' ')[1];
  const args2 = commandArgs.split(' ')[2];
  const args3 = commandArgs.split(' ')[3];
  const args4 = commandArgs.split(' ')[4];

  const phoneNumber = parsePhoneNumberFromString(from, 'ID');
  const number = phoneNumber ? phoneNumber.number : '';
  const name = sender.pushname || chat.name || sender.verifiedName || '';

  const stickerCreatedMsg = `(${name} - ${number}) membuat stiker 🚀`;
  const inMsg = `(${name} - ${number}) mengirim pesan ${command} 📩`;
  const inMsgImgNoCapt = `(${name} - ${number}) mengirim gambar tanpa caption 📩`;
  const waitStickerMsg = '_Tunggu sebentar stiker lagi dibuat ⏳_';
  const thxMsg = '_Iya sama - sama 🤖_';
  // const waitVidMsg = '_Video lagi di upload tunggu aja 🎥_';
  const waitDataMsg = '_Tunggu sebentar data lagi di proses ⏳_';
  const wrongMsg = '_Kayaknya ada yang salah, coba nanti lagi 🚴🏻_';
  const noCaptMsg = '_Pakai caption ya jangan gambar doang, ketik #menu 🤖_';
  const unkMsg = '_Yang bener dong coba ketik *#menu*, kalau ngasal nanti aku block lho 🤖_';
  const doneMsg = '_Tugas selesai 👌, buat liat semua menu bot ketik *#menu*, kalau mau share ke temen - temen kalian atau masukin ke grup juga boleh_';

  try {
    switch (command) {
      case '#sticker':
      case '#stiker':
        if (isMedia && type === 'image') {
          debug(inMsg);
          debug(stickerCreatedMsg);
          client.sendText(from, waitStickerMsg);
          const mediaData = await decryptMedia(message);
          const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
          client.sendImageAsSticker(from, imageBase64);
          client.sendText(from, doneMsg);
        }
        if (quotedMsg && quotedMsg.type === 'image') {
          debug(inMsg);
          debug(stickerCreatedMsg);
          client.sendText(from, waitStickerMsg);
          const mediaData = await decryptMedia(quotedMsg);
          const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
          client.sendImageAsSticker(from, imageBase64);
          client.sendText(from, doneMsg);
        }
        break;
      case '#menu':
        debug(inMsg);
        client.sendText(from, menu);
        break;
      case '#korona':
        debug(inMsg);
        client.sendText(from, waitDataMsg);
        client.sendText(from, await korona());
        client.sendText(from, doneMsg);
        break;
      case '#quotes':
        debug(inMsg);
        client.sendText(from, waitDataMsg);
        client.sendText(from, quotes());
        client.sendText(from, doneMsg);
        break;
      // case '#ig':
      //   debug(inMsg);
      //   client.sendText(from, waitDataMsg);
      //   await videoUrlLink.instagram.getInfo(args, async (error, info) => {
      //     if (error) {
      //       client.sendText(from, wrongMsg);
      //       console.log(error.message);
      //     } else {
      //       const url = info.list[0].video ? info.list[0].video : info.list[0].image;
      //       client.sendText(from, waitVidMsg);
      //       await client.sendFileFromUrl(from, url);
      //       client.sendText(from, doneMsg);
      //     }
      //   });
      //   break;
      case '#wp':
        debug(inMsg);
        client.sendText(from, waitDataMsg);
        wallpaper
          .then((result) => {
            client.sendFileFromUrl(from, result);
            client.sendText(from, doneMsg);
          })
          .catch((error) => {
            client.sendText(from, wrongMsg);
            console.log(error.message);
          });
        break;
      case '#zodiak':
        debug(inMsg);
        client.sendText(from, waitDataMsg);
        getZodiak(args1, args2)
          .then((result) => {
            client.sendText(from, result);
            client.sendText(from, doneMsg);
          })
          .catch((error) => {
            client.sendText(from, wrongMsg);
            console.log(error.message);
          });
        break;
      case '#ramalan':
        debug(inMsg);
        client.sendText(from, waitDataMsg);
        ramalanCinta(args1, args2, args3, args4)
          .then((result) => {
            client.sendText(from, result);
            client.sendText(from, doneMsg);
          })
          .catch((error) => {
            client.sendText(from, wrongMsg);
            console.log(error.message);
          });
        break;
      default:
        if (!isGroupMsg) {
          const thanks = ['terimakasi', 'makasi', 'thx', 'thank', 'trim', 'oke'];
          const isThanks = !!new RegExp(thanks.join('|')).test(commandArgs.toLowerCase());
          if (type === 'image' && !caption) {
            debug(inMsgImgNoCapt);
            client.sendText(from, noCaptMsg);
          } else if (isThanks) {
            debug(inMsg);
            client.sendText(from, thxMsg);
          } else {
            debug(inMsg);
            client.sendText(from, unkMsg);
          }
        }
        break;
    }
  } catch (error) {
    client.sendText(from, wrongMsg);
    console.log(error.message);
  }
};
