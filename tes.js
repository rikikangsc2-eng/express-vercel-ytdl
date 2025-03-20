const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.query;

  try {
    // 1. Panggil API 1 untuk mendapatkan JWT token
    const api1Response = await axios.get('https://gptchatly.com/jwt-token', {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://gptchatly.com/chatgpt.html',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
      }
    });

    // Misalnya, token ada di api1Response.data.token
    // Pastikan Anda menyesuaikan property sesuai respons sebenarnya
    const token = api1Response.data.jwtToken; 

    // 2. Panggil API 2 dengan menyertakan token di header Authorization
    const api2Response = await axios.post(
      'https://gptchatly.com/felch-response',
      {
        // Payload sesuai dengan kebutuhan (past_conversations)
        past_conversations: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // 3. Kirim kembali hasil respons dari API 2
    return res.status(200).json(api2Response.data);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};