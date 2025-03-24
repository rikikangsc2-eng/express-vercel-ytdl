const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    const api1Response = await axios.post('https://ytmp3.ing/audio', `url=${encodeURIComponent(url)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://ytmp3.ing',
        'Referer': 'https://ytmp3.ing/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36' 
      }
    });
    
    let filenameMatch;
    
    if (typeof api1Response.data === 'string') {
      filenameMatch = api1Response.data.match(/filename="([^"]+)"/);
    }
    
    if (!filenameMatch) {
      return res.status(400).send('Error: Could not find the title API 1');
    }
    
    const filename = filenameMatch[1] ? filenameMatch[1] : null;
    
    if (!filename) {
      return res.status(400).send('Error: Could not extract title from filename API 1');
    }
    
    
    const api2Payload = {
      "format": "MP3",
      "filename": filename
    }
    
    const api2Response = await axios.post('https://v1.ytmp3.ing/download', api2Payload, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://ytmp3.ing',
        'Referer': 'https://ytmp3.ing/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
      }
    });
    
    res.json(api2Response.data);
    
  } catch (error) {
    console.error(error);
    
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data, message: "Error from external API", });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response received', message: "No response received from external API" });
    } else {
      return res.status(500).json({ error: error.message, message: "Request setup error" });
    }
  }
};