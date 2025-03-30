const axios = require('axios');
const jsdom = require('jsdom');

module.exports = async (req, res) => {
  try {
    const initialResponse = await axios.get('https://nuelink.com/tools/ai-image-generator', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': 'https://nuelink.com/tools/ai-image-generator'
      },
      decompress: true
    });

    const dom = new jsdom.JSDOM(initialResponse.data);
    const xak = dom.window.document.querySelector('script').textContent.match(/var xak = "(.*?)"/)[1];
    const prompt = req.query.prompt || "Kitten , use Anime";

    const apiResponse = await axios.post(
      'https://tools.nuelink.com/api/ai/assist?action=IMAGE&prompt=' + encodeURIComponent(prompt),
      { action: 'TTI', prompt: prompt },
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'X-Api-Key': xak,
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
          'Referer': 'https://nuelink.com/tools/ai-image-generator'
        },
        decompress: true
      }
    );

    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

