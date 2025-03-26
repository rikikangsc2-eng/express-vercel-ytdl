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
    const animeList = [];
    
    $('.information').each((i, el) => {
      const rank = $(el).find('.rank span.text').text().trim();
      const title = $(el).find('h2.title').text().trim();
      const type = $(el).find('.misc .type').text().trim();
      const score = $(el).find('.misc .score').text().replace(/\s+/g, ' ').trim();
      const members = $(el).find('.misc .member').text().replace(/\s+/g, ' ').trim();
      const link = $(el).next('.tile-unit').find('a.thumb').attr('href');
      const image = $(el).next('.tile-unit').attr('data-bg');
      
      if (rank && title) {
        animeList.push({ rank, title, type, score, members, link, image });
      }
    });
    
    res.json({ success: true, data: animeList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data' });
  }
};