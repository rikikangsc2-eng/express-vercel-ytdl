const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  try {
    const targetUrl = req.query.url || 'http://www.cnbc.com';
    
    const response = await axios.post(
      'https://urltoscreenshot.com/',
      `url=${encodeURIComponent(targetUrl)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
          'Referer': 'https://urltoscreenshot.com/'
        }
      }
    );
    
    const dom = new JSDOM(response.data);
    const screenshotImg = dom.window.document.querySelector('#demo_screenshot_image img');
    
    if (!screenshotImg) {
      return res.status(500).json({ error: 'Gagal mengambil screenshot' });
    }
    
    const imageUrl = screenshotImg.getAttribute('src');
    
    res.json({ screenshot: imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan', details: error.message });
  }
};