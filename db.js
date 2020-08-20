/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { debug } = require('./src/debug');

dotenv.config();

const url = process.env.MONGO_URL;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('koneksi db sukses');
});

const contactSchema = new mongoose.Schema({}, { strict: false });
const Contacts = mongoose.model('Contacts', contactSchema, 'contacts');

const saveContact = async (contact) => {
  const isExists = await Contacts.exists({ 'contact.id': contact.id });
  if (!isExists) {
    const newContacts = new Contacts(contact);
    await newContacts.save((err, doc) => {
      if (err) debug(`kontak ${doc.contact.id} sudah ada di db`);
      debug(`kontak ${doc.contact.id} berhasil disimpan ke db`);
    });
  }
};

module.exports.saveContact = saveContact;
