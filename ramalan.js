/* eslint-disable no-console */
const axios = require('axios').default;
const cheerio = require('cheerio');
const qs = require('qs');

const ramalanCinta = (n1, t1, n2, t2) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => {
    const data = qs.stringify({
      nama1: n1,
      tanggal1: t1.split('-')[0],
      bulan1: t1.split('-')[1],
      tahun1: t1.split('-')[2],
      nama2: n2,
      tanggal2: t2.split('-')[0],
      bulan2: t2.split('-')[1],
      tahun2: t2.split('-')[2],
      submit: '+Submit!+',
    });
    const config = {
      method: 'post',
      url: 'http://www.primbon.com/ramalan_cinta.php',
      data,
    };
    axios(config)
      .then((response) => {
        const $ = cheerio.load(response.data);
        const result = {
          judul: $('#body > b:nth-child(1)').text(),
          nama1: $('#body > b:nth-child(4)').text(),
          tgl1: $('#body').contents()[9].data,
          nama2: $('#body > b:nth-child(8)').text(),
          tgl2: $('#body').contents()[15].data,
          positif: `${$('#body > b:nth-child(12)').text()}${$('#body').contents()[20].data}`,
          negatif: `${$('#body > b:nth-child(14)').text()}${$('#body').contents()[23].data}`,
          ramalan: $('#body').contents()[29].data.trim(),
        };
        // console.log(result);
        resolve(result);
      })
      .catch((error) => reject(error));
  });

module.exports.ramalanCinta = ramalanCinta;
