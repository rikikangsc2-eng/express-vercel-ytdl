const axios = require('axios');
const { parse } = require('node-html-parser');

module.exports = async (req, res) => {
  try {
    const userPrompt = req.query.prompt;
    if (!userPrompt) {
      return res.status(400).json({ error: 'Parameter prompt-nya mana cuy?' });
    }
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': 'https://imageprompt.org/image-prompt-generator',
    };
    
    const oldCookie = '_ga=GA1.1.1215784472.1744943796; google_oauth_state=%7B%22state%22%3A%22UyYMuyB2YsnqpvqMOGN_PIVscREoTzUx1SPH8fFvLD4%22%2C%22redirectUri%22%3A%22%2Fimage-prompt-generator%22%2C%22initial_referer%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%7D; code_verifier=Ndn0fIfjupYSFBxQ-d-LNREWaIFd5D8qsFiYBT37gAw; auth_session=0cpj931cz1ul42j8wc7psurq6g5qcdit3a4m9zin; _ga_5BZKBZ4NTB=GS1.1.1744943795.1.1.1744944446.0.0.0';
    
    const cookieResp = await axios.get('https://imageprompt.org/image-prompt-generator', {
      headers: {
        ...headers,
        Cookie: oldCookie,
      }
    });
    
    const setCookie = cookieResp.headers['set-cookie'];
    if (!setCookie || setCookie.length === 0) {
      return res.status(500).json({ error: 'Gagal dapetin cookie baru cuy' });
    }
    
    const newCookies = setCookie.map(c => c.split(';')[0]).join('; ');
    
    const apiResp = await axios.post('https://imageprompt.org/api/ai/prompts/magic-enhance', {
      userPrompt: userPrompt,
      page: 'image-prompt-generator'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': headers['User-Agent'],
        'Referer': headers['Referer'],
        'Cookie': newCookies
      }
    });
    
    res.json(apiResp.data);
    
  } catch (err) {
    console.error('Error cuy:', err.message);
    res.status(500).json({ error: 'Ada error cuy, cek lagi prompt atau koneksi lo' });
  }
};