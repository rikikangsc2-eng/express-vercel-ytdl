const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    
    const getPage = await axios.get('https://on4t.com/tiktok-video-download', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://on4t.com/tiktok-video-download'
      }
    });
    
    const $ = cheerio.load(getPage.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!csrfToken) {
      return res.status(500).json({ error: 'Gagal mengambil CSRF token dari halaman' });
    }
    
    const response = await axios.post(
      'https://on4t.com/tiktok-video-download',
      new URLSearchParams({ link: url }).toString(),
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          'Referer': 'https://on4t.com/tiktok-video-download#inner-result',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    if (!response.data) {
      return res.status(500).json({ error: 'Respons dari server kosong' });
    }
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan: ' + error.message });
  }
};