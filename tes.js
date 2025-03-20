const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.query;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt tidak boleh kosong' });
  }
  
  try {
    // Mendapatkan JWT Token dari API 1
    const api1Response = await axios.get('https://gptchatly.com/jwt-token', {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/json',
        'Referer': 'https://gptchatly.com/chatgpt.html',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
      }
    });
    
    if (!api1Response.data || !api1Response.data.jwtToken) {
      return res.status(500).json({ error: 'Gagal mendapatkan JWT Token dari API 1', response: api1Response.data });
    }
    
    const token = api1Response.data.jwtToken;
    
    // Mengirim permintaan ke API 2 dengan token yang didapatkan
    const api2Response = await axios.post(
      'https://gptchatly.com/felch-response',
      {
        past_conversations: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Accept': '*/*',
          'Accept-Encoding': 'identity',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Referer': 'https://gptchatly.com/chatgpt.html',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
        }
      }
    );
    
    return res.status(200).json(api2Response.data);
  } catch (error) {
    // Menangani error dengan lebih rinci
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Error pada API ${error.response.config.url}`,
        status: error.response.status,
        message: error.response.data
      });
    } else if (error.request) {
      return res.status(500).json({
        error: 'Tidak ada respons dari server',
        details: error.request
      });
    } else {
      return res.status(500).json({
        error: 'Terjadi kesalahan pada server',
        message: error.message
      });
    }
  }
};