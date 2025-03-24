const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar }));

async function convertAudio(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    await client.get('https://ytmp3.ing/');

    const api1Response = await client.post(
      'https://ytmp3.ing/audio',
      `url=${encodeURIComponent(url)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://ytmp3.ing',
          'Referer': 'https://ytmp3.ing/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
        }
      }
    );
    
    res.json(api1Response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = convertAudio;