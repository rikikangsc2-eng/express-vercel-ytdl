const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const initialResponse = await axios.get('https://tempmail.so/', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://tempmail.so/',
      },
      responseType: 'text',
      decompress: true
    });
    
    const cookies = initialResponse.headers['set-cookie'];
    const cookieString = cookies ? cookies.map(cookie => cookie.split(';')[0]).join('; ') : '';
    
    const requestTime = Date.now();
    const apiUrl = `https://tempmail.so/us/api/inbox?requestTime=${requestTime}&lang=us`;
    
    const apiResponse = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'X-Inbox-Lifespan': '600',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://tempmail.so/',
        'Cookie': cookieString
      },
      responseType: 'json',
      decompress: true
    });
    
    res.json({ success: true, data: apiResponse.data });
    
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      errorMessage = 'Tidak ada respons diterima dari server.';
    }
    res.json({ success: false, error: errorMessage });
  }
};