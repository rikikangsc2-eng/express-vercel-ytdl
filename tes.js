const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "Parameter 'url' diperlukan" });
    }
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
      'Referer': 'https://urltoscreenshot.com/',
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    
    // 1. Request halaman awal untuk mendapatkan cookie (jika tersedia)
    const initialResponse = await axios.get('https://urltoscreenshot.com/', { headers });
    
    // Ambil cookie jika tersedia, jika tidak biarkan kosong
    const cookies = initialResponse.headers['set-cookie'] ? initialResponse.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';
    
    // 2. Kirim URL ke input form
    const formData = new URLSearchParams();
    formData.append('demo_screenshot_url', targetUrl);
    formData.append('submit', 'Capture');
    
    await axios.post('https://urltoscreenshot.com/', formData.toString(), {
      headers: { ...headers, 'Cookie': cookies }
    });
    
    // 3. Ambil kembali halaman setelah submit
    const finalResponse = await axios.get('https://urltoscreenshot.com/', {
      headers: { ...headers, 'Cookie': cookies }
    });
    
    // 4. Parse HTML untuk mendapatkan URL gambar screenshot
    const dom = new JSDOM(finalResponse.data);
    const imageElement = dom.window.document.querySelector('#demo_screenshot_image img');
    
    if (!imageElement) {
      return res.status(404).json({ error: "Gambar screenshot tidak ditemukan" });
    }
    
    const screenshotUrl = `https://urltoscreenshot.com/${imageElement.getAttribute('src')}`;
    
    // 5. Kirim hasil ke client
    res.json({ screenshot: screenshotUrl });
    
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan", details: error.message });
  }
};