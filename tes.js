const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt-nya mana bre?' });
  }
  
  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': 'https://on4t.com/free-chatgpt'
    };
    
    const response = await axios.get('https://on4t.com/free-chatgpt', {
      headers,
      decompress: true
    });
    
    const setCookie = response.headers['set-cookie'];
    if (!setCookie || setCookie.length === 0) {
      return res.status(500).json({ error: 'Gagal dapetin cookie cuy' });
    }
    
    const cookie = setCookie.map(c => c.split(';')[0]).join('; ');
    
    const $ = cheerio.load(response.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    
    if (!csrfToken) {
      return res.status(500).json({ error: 'CSRF token-nya ngilang bre' });
    }
    
    const payload = {
      input_text: prompt,
      toolname: 'helpful-assistant.'
    };
    
    const postHeaders = {
      'Accept': '*/*',
      'X-CSRF-TOKEN': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': headers['User-Agent'],
      'Referer': headers['Referer'],
      'Content-Type': 'application/json',
      'Cookie': cookie
    };
    
    const chatRes = await axios.post('https://on4t.com/chatgpt-process', payload, {
      headers: postHeaders,
      decompress: true
    });
    
    res.status(200).json(chatRes.data);
  } catch (err) {
    res.status(500).json({ error: `Waduh ada error bre: ${err.message}` });
  }
};