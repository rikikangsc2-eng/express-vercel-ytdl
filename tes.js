const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const videoUrl = req.query.url;
    const getPage = await axios.get('https://on4t.com/tiktok-video-download', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://on4t.com/tiktok-video-download'
      }
    });
    
    const $ = cheerio.load(getPage.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    const postData = {
      link: videoUrl
    };
    
    const apiResponse = await axios.post('https://on4t.com/tiktok-video-download', postData, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://on4t.com/tiktok-video-download#inner-result'
      }
    });
    
    res.json(apiResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};