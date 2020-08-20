/* eslint-disable no-console */
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('koneksi db sukses');
});

const contactSchema = new mongoose.Schema({}, { strict: false });
const Contacts = mongoose.model('Contacts', contactSchema);

module.exports.Contacts = Contacts;
