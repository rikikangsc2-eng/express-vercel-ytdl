const axios = require('axios');

module.exports = async (req, res) => {
  const { prompt } = req.query;

  try {
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

    const token = api1Response.data.jwtToken;

    const api2Response = await axios.post(
      'https://gptchatly.com/felch-response',
      {
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
          'Accept-Encoding': 'gzip, deflate, br',
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
    return res.status(500).json({ error: error.message });
  }
};