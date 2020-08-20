/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const url = process.env.MONGO_URL;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('koneksi db sukses');
});

const chatSchema = new mongoose.Schema({}, { strict: false });
const Chats = mongoose.model('Chats', chatSchema, 'chats');

module.exports = { Chats };
