const cloudscraper = require('cloudscraper');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });
    
    const api1Response = await cloudscraper.post({
      uri: 'https://ytmp3.ing/audio',
      formData: { url },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://ytmp3.ing',
        'Referer': 'https://ytmp3.ing/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    
    let filenameMatch = api1Response.match(/filename="([^"]+)"/);
    if (!filenameMatch) return res.status(400).send('Error: Could not find the title API 1');
    
    const filename = filenameMatch[1];
    if (!filename) return res.status(400).send('Error: Could not extract title from filename API 1');
    
    const api2Response = await cloudscraper.post({
      uri: 'https://v1.ytmp3.ing/download',
      json: { format: 'MP3', filename },
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://ytmp3.ing',
        'Referer': 'https://ytmp3.ing/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    
    res.json(api2Response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};