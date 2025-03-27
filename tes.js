const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  try {
    const trackUrl = 'https://open.spotify.com/intl-id/track/1hlHeIZ36Idpr57xPI8OCD';
    const baseUrl = 'https://spowload.com/en';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
      'Referer': baseUrl
    };
    
    // Step 1: Dapatkan halaman utama dan ambil CSRF token
    const initialResponse = await axios.get(baseUrl, { headers });
    const dom = new JSDOM(initialResponse.data);
    const document = dom.window.document;
    
    const csrfToken = document.querySelector('input[name="_token"]')?.value;
    if (!csrfToken) throw new Error('CSRF token not found');
    
    const formAction = document.querySelector('form')?.action || baseUrl;
    const cookies = initialResponse.headers['set-cookie']?.join('; ') || '';
    
    headers['Cookie'] = cookies;
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    const data = new URLSearchParams();
    data.append('_token', csrfToken);
    data.append('trackUrl', trackUrl);
    
    // Step 2: Submit form dengan track URL untuk mendapatkan redirect
    const submitResponse = await axios.post(formAction, data, {
      headers,
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    
    const redirectUrl = submitResponse.headers.location;
    if (!redirectUrl) throw new Error('Redirect URL not found');
    
    // Step 3: Akses halaman hasil convert
    const redirectResponse = await axios.get(redirectUrl, { headers });
    const redirectDom = new JSDOM(redirectResponse.data);
    const redirectDocument = redirectDom.window.document;
    
    // Cek apakah tombol convert ada
    const convertButton = redirectDocument.querySelector(`button[id="1hlHeIZ36Idpr57xPI8OCD"]`);
    if (!convertButton) throw new Error('Convert button not found');
    
    // Step 4: Kirim permintaan untuk menekan tombol convert
    const convertUrl = redirectUrl.replace('/spotify/', '/api/convert/');
    const convertResponse = await axios.post(convertUrl, data, { headers });
    
    const finalDom = new JSDOM(convertResponse.data);
    const finalDocument = finalDom.window.document;
    
    // Step 5: Ambil link download
    const downloadLink = finalDocument.querySelector('a[data-url]')?.getAttribute('data-url');
    if (!downloadLink) throw new Error('Download link not found');
    
    res.json({ downloadUrl: downloadLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};