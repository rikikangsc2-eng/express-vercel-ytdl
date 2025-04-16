const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const inputUrl = req.query.url;
    if (!inputUrl) return res.status(400).json({ error: 'Link-nya mana cuy? Kasih dulu di ?url=' });
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': 'https://indown.io/tiktok-downloader/id'
    };
    
    const getPage = await axios.get('https://indown.io/tiktok-downloader/id', { headers });
    const $ = cheerio.load(getPage.data);
    const token = $('input[name="_token"]').val();
    const referer = $('input[name="referer"]').val();
    const locale = $('input[name="locale"]').val();
    const ip = $('input[name="i"]').val();
    
    if (!token || !referer || !locale || !ip) {
      return res.status(500).json({ error: 'Gagal ambil data form cuy, mungkin elemennya berubah' });
    }
    
    const formData = new URLSearchParams();
    formData.append('_token', token);
    formData.append('referer', referer);
    formData.append('locale', locale);
    formData.append('i', ip);
    formData.append('link', inputUrl);
    
    const postResponse = await axios.post('https://indown.io/download', formData, { headers });
    
    res.setHeader('Content-Type', 'text/html');
    res.send(postResponse.data);
  } catch (err) {
    res.status(500).json({ error: `Waduh bre, error: ${err.message}` });
  }
};