const wa = require('@open-wa/wa-automate');
const moment = require('moment-timezone');
const korona = require('./korona');

const debug = async (text) => {
	console.log(moment.tz('Asia/Jakarta').format() + text);
};

const start = async (client) => {
	debug(' => The bot has started');
	// force curr session
	client.onStateChanged((state) => {
		debug(' => 🛠 state changed - ' + state);
		if (state === 'CONFLICT') client.forceRefocus();
	});
	// handling message
	client.onMessage(async (message) => {
		const stickerMsg = ' => 🖼  someone made a sticker - ' + message.from + ' - ' + message.sender.pushname + ' - ' + message.chat.name;
		const generalMsg = ' => 📩 someone sent a message - ' + message.from + ' - ' + message.sender.pushname + ' - ' + message.chat.name;
		const waitSticker = 'Tunggu sebentar stiker lagi dibuat ⏳';
		const waitRequest = 'Tunggu sebentar data sedang di proses ⏳';
		// image with text #sticker
		if (message.type === 'image' && message.caption === '#sticker') {
			debug(stickerMsg);
			client.sendText(message.from, waitSticker);
			const mediaData = await wa.decryptMedia(message);
			const imageBase64 = `data:${message.mimetype};base64,${mediaData.toString('base64')}`;
			client.sendImageAsSticker(message.from, imageBase64);
		}
		// quoted image with text #sticker
		if (message.quotedMsg && message.quotedMsg.type === 'image' && message.body === '#sticker') {
			debug(stickerMsg);
			client.sendText(message.from, waitSticker);
			const mediaData = await wa.decryptMedia(message.quotedMsg);
			const imageBase64 = `data:${message.quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
			client.sendImageAsSticker(message.from, imageBase64);
		}
		// hello message
		if (message.body === '#hi' || message.body === '#hai' || message.body === '#halo' || message.body === '#hello') {
			debug(generalMsg);
			let botFeatureMsg = 'Hai 🙋🏻‍♂️, dibawah ini beberapa fitur yang bisa kalian gunakan\n\n';
			botFeatureMsg += '#sticker => Membuat stiker dari gambar 🖼\n';
			botFeatureMsg += '#korona => Data Korona Indonesia 🦠\n';
			client.sendText(message.from, botFeatureMsg);
		}
		// korona
		if (message.body === '#korona') {
			debug(generalMsg);
			client.sendText(message.from, waitRequest);
			client.sendText(message.from, await korona());
		}
	});
};

// start wa client
wa.create()
	.then((client) => start(client))
	.catch((error) => console.log(error));
