const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const response = await axios.get('https://myanimelist.net/topanime.php?type=bypopularity', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': 'https://myanimelist.net/topanime.php?type=bypopularity'
      }
    });
    
    const $ = cheerio.load(response.data);
    const result = [];
    
    $('.ranking-list').each((_, el) => {
      const rank = $(el).find('.rank span').text().trim();
      const title = $(el).find('.title a').text().trim();
      const type = $(el).find('.information .type').text().trim();
      const score = $(el).find('.score span').text().trim();
      const members = $(el).find('.stats .members').text().trim().replace(' members', '');
      const link = $(el).find('.title a').attr('href') ? `https://myanimelist.net${$(el).find('.title a').attr('href')}` : '';
      const image = $(el).find('.image img').attr('data-src') || $(el).find('.image img').attr('src') || '';
      
      if (rank && title) {
        result.push({ rank, title, type, score, members, link, image });
      }
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};