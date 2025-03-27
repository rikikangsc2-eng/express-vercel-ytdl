const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  try {
    const url = 'https://spowload.com/en';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
      'Referer': 'https://spowload.com/en'
    };
    
    const response = await axios.get(url, { headers });
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const csrfToken = document.querySelector('input[name="_token"]')?.value;
    if (!csrfToken) throw new Error('CSRF token not found');
    
    const formAction = document.querySelector('form')?.action || url;
    const inputName = document.querySelector('input[name="trackUrl"]');
    if (!inputName) throw new Error('Input field not found');
    
    const data = new URLSearchParams();
    data.append('_token', csrfToken);
    data.append(inputName.name, 'https://open.spotify.com/intl-id/track/1hlHeIZ36Idpr57xPI8OCD');
    
    const cookies = response.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    
    headers['Cookie'] = cookieHeader;
    
    const submitResponse = await axios.post(formAction, data, {
      headers,
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    
    const redirectUrl = submitResponse.headers.location;
    if (!redirectUrl) throw new Error('Redirect URL not found');
    
    res.redirect(redirectUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};