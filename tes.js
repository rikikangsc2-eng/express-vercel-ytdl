const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { url, type } = req.query;
    
    if (!url) {
      return res.json({ success: false, error: 'Parameter url diperlukan' });
    }
    
    const validTypes = ['mp3', 'mp3hd', 'mp4', 'mp4hd', 'mp42k', 'm4a', 'wav', '3gp', 'flv'];
    
    if (type && !validTypes.includes(type)) {
      return res.json({
        success: false,
        error: `Parameter type tidak valid. Tipe yang tersedia: ${validTypes.join(', ')}`,
        availableTypes: validTypes
      });
    }
    
    if (!type) {
      return res.json({
        success: false,
        error: `Parameter type diperlukan. Tipe yang tersedia: ${validTypes.join(', ')}`,
        availableTypes: validTypes
      });
    }
    
    const apiUrl = 'https://notube.net/en/api/json';
    const requestData = `url=${encodeURIComponent(url)}&ftype=${type}&client=app-125`;
    
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://notube.net/id/youtube-app-125',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (response.data && response.data.status === 'ok' && response.data.result) {
      res.json({ success: true, data: response.data.result });
    } else if (response.data && response.data.error) {
      res.json({ success: false, error: response.data.error });
    } else {
      res.json({ success: false, error: 'Gagal memproses permintaan atau format respons tidak dikenal.', details: response.data });
    }
    
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Server Error: ${error.response.status} - ${error.response.statusText}. Data: ${JSON.stringify(error.response.data || 'N/A')}`;
    } else if (error.request) {
      errorMessage = 'Tidak ada respons dari server setelah melakukan request.';
    }
    res.status(500).json({ success: false, error: errorMessage });
  }
};