const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const { data } = await axios.get('https://www.detik.com/terpopuler');
    const $ = cheerio.load(data);
    let results = [];
    
    $('article.list-content__item').each((_, el) => {
      const title = $(el).find('.media__title a').text().trim();
      const url = $(el).find('.media__title a').attr('href');
      const image = $(el).find('.media__image img').attr('src');
      const source = $(el).find('.media__date').text().trim();
      results.push({ title, url, image, source });
    });
    
    res.json({ status: 'success', data: results });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};