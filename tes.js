const axios = require('axios');
const { JSDOM } = require('jsdom');
const qs = require('querystring');

module.exports = async (req, res) => {
  try {
    const text = req.body.text || '';
    const voice = req.body.voice || 'id-ID';
    const data = qs.stringify({ voice, text });
    const response = await axios.post('https://soundoftext.com/', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': 'https://soundoftext.com/'
      }
    });
    const dom = new JSDOM(response.data);
    const audioLink = dom.window.document.querySelector('a.card__action')?.href;
    if (!audioLink) return res.status(500).send('Audio link not found');
    res.json({ audio: audioLink });
  } catch (err) {
    res.status(500).send(err.toString());
  }
};