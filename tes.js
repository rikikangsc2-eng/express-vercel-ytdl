const axios = require('axios');
const querystring = require('querystring');

module.exports = async (req, res) => {
  try {
    const targetUrl = 'https://id.ytmp3.mobi/v2/';
    const videoUrl = 'https://youtu.be/-ktlIHSOOmk?si=fLKNk60e2dM4Dpdz';
    
    const postData = querystring.stringify({
      video: videoUrl
    });
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': 'https://id.ytmp3.mobi/v2/'
    };
    
    const response = await axios.post(targetUrl, postData, {
      headers: headers
    });
    
    res.send(response.data);
    
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      const errorMessage = error.message || 'An unknown error occurred';
      const statusCode = error.code === 'ECONNREFUSED' ? 503 : (error.response ? error.response.status : 500);
      res.status(statusCode).json({ success: false, error: errorMessage });
    }
  }
};