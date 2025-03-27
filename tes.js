const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const query = req.query.q || 'Lv2 kara';
  const url = `https://samehadaku.mba/?s=${encodeURIComponent(query)}`;
  
  try {
    const { data } = await axios.get(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': url
      }
    });
    
    const $ = cheerio.load(data);
    const results = [];
    
    $('.animepost').each((_, el) => {
      const element = $(el).find('.animposx a');
      const title = element.attr('title');
      const link = element.attr('href');
      const image = element.find('img').attr('src');
      const type = element.find('.type').text().trim();
      const score = element.find('.score').text().trim();
      const synopsis = $(el).find('.stooltip .ttls').text().trim();
      const genres = [];
      
      $(el).find('.stooltip .genres a').each((_, genreEl) => {
        genres.push($(genreEl).text().trim());
      });
      
      results.push({ title, link, image, type, score, synopsis, genres });
    });
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data', error: error.message });
  }
};