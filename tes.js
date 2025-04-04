const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json({ success: false, error: "Parameter 'query' diperlukan" });
    }
    
    const initialUrl = 'https://ytmp3.ing/';
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36';
    
    const initialResponse = await axios.get(initialUrl, {
      headers: {
        'User-Agent': userAgent,
        'Referer': initialUrl,
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
      }
    });
    
    const $ = cheerio.load(initialResponse.data);
    const csrfToken = $('form.download-form input[name="csrfmiddlewaretoken"]').val();
    
    if (!csrfToken) {
      return res.json({ success: false, error: "Tidak dapat menemukan csrfmiddlewaretoken" });
    }
    
    const cookies = initialResponse.headers['set-cookie'];
    let cookieString = '';
    if (cookies) {
      cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    }
    
    const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const searchPage = await axios.get(videoUrl, { headers: { 'User-Agent': userAgent } });
    const $search = cheerio.load(searchPage.data);
    const firstVideo = $search('a#video-title').first().attr('href');
    
    if (!firstVideo) {
      return res.json({ success: false, error: "Video tidak ditemukan" });
    }
    
    const payload = {
      url: `https://www.youtube.com${firstVideo}`
    };
    
    const audioResponse = await axios.post('https://ytmp3.ing/audio', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
        'User-Agent': userAgent,
        'Referer': initialUrl,
        'Origin': 'https://ytmp3.ing',
        'Cookie': cookieString
      }
    });
    
    const { url, filename } = audioResponse.data;
    
    res.json({
      success: true,
      data: {
        url: Buffer.from(url, 'base64').toString('utf-8'),
        filename
      }
    });
    
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = "Tidak ada respons dari server";
    }
    res.json({ success: false, error: errorMessage });
  }
};