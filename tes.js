const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const videoUrl = req.query.url;
    if (!videoUrl) {
      return res.status(400).json({ error: 'URL parameter is missing' });
    }

    const getPage = await axios.get('https://on4t.com/tiktok-video-download', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://on4t.com/tiktok-video-download'
      }
    });
    getPage.throwIfCancellationRequested();

    const $ = cheerio.load(getPage.data);
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    if (!csrfToken) {
      return res.status(500).json({ error: 'Could not extract CSRF token' });
    }

    const postData = {
      link: videoUrl
    };

    const apiResponse = await axios.post('https://on4t.com/tiktok-video-download', postData, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://on4t.com/tiktok-video-download#inner-result'
      }
    });
    apiResponse.throwIfCancellationRequested();

    if (apiResponse.status !== 200) {
      return res.status(apiResponse.status).json({ error: `Failed to fetch data from API: ${apiResponse.statusText}` });
    }

    res.json(apiResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return res.status(error.response.status).json({ error: `Failed to fetch data: ${error.message}, Status: ${error.response.status}` });
      } else if (error.request) {
        return res.status(500).json({ error: `Failed to fetch data: No response received - ${error.message}` });
      } else {
        return res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
      }
    } else {
      return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
  }
};
