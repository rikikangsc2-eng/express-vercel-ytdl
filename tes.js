const axios = require('axios');
const cheerio = require('cheerio');
const { URLSearchParams } = require('url');

module.exports = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Parameter query diperlukan' });
    }
    
    const baseUrl = 'https://ytmp3.ing/';
    const searchUrl = `${baseUrl}search`;
    
    const getResponse = await axios.get(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': baseUrl,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1'
      }
    });
    
    const $ = cheerio.load(getResponse.data);
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    
    if (!csrfToken) {
      return res.status(500).json({ success: false, error: 'Tidak dapat menemukan csrfmiddlewaretoken' });
    }
    
    const payload = new URLSearchParams();
    payload.append('csrfmiddlewaretoken', csrfToken);
    payload.append('query', query);
    
    const postResponse = await axios.post(searchUrl, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': baseUrl,
        'Accept': 'application/json, text/javascript, */*; q=0.01', // Target API biasanya JSON
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Origin': baseUrl.slice(0, -1), // Hapus trailing slash
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        // Cookie mungkin diperlukan, diambil dari getResponse headers 'set-cookie'
        'Cookie': getResponse.headers['set-cookie'] ? getResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ') : ''
      }
    });
    
    res.json({ success: true, data: postResponse.data });
    
  } catch (error) {
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.response) {
      statusCode = error.response.status || 500;
      errorMessage = `Error ${statusCode}: ${error.response.statusText || 'Kesalahan Server Internal'}`;
      // Anda bisa menambahkan detail dari error.response.data jika perlu untuk debugging internal
      // Jangan ekspos detail sensitif ke klien
      if (typeof error.response.data === 'string' && error.response.data.length < 500) { // Batasi panjang pesan
        errorMessage += ` - ${error.response.data}`;
      } else if (typeof error.response.data?.error === 'string') {
        errorMessage += ` - ${error.response.data.error}`;
      }
      
    } else if (error.request) {
      errorMessage = 'Tidak ada respons dari server setelah melakukan request.';
      statusCode = 504; // Gateway Timeout
    } else {
      errorMessage = `Kesalahan saat menyiapkan request: ${error.message}`;
    }
    
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};