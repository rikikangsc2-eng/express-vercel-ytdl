const axios = require('axios');

const modelList = {
  brian: 'nPczCjzI2devNBz1zQrb',
  alice: 'Xb7hH8MSUJpSbSDYk0k2',
  bill: 'pqHfZKP75CvOlQylNhV4'
};

function getRandomUserAgent() {
  const locales = ['en-US', 'id-ID', 'en-GB', 'en', 'id'];
  const locale = locales[Math.floor(Math.random() * locales.length)];
  
  const androidDevices = ['SM-G991B', 'Pixel 6', 'RMX2185', 'Redmi Note 10', 'CPH1909'];
  const androidVersion = ['10', '11', '12', '13'];
  const androidDevice = androidDevices[Math.floor(Math.random() * androidDevices.length)];
  const androidVer = androidVersion[Math.floor(Math.random() * androidVersion.length)];
  
  const chromeVersion = `${Math.floor(100 + Math.random() * 40)}.0.${Math.floor(4000 + Math.random() * 2000)}.${Math.floor(100 + Math.random() * 300)}`;
  const safariVersion = `${Math.floor(14 + Math.random() * 3)}.0`;
  
  const userAgents = [
    `Mozilla/5.0 (Linux; Android ${androidVer}; ${androidDevice}; ${locale}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/537.36`,
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64; ${locale}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; ${locale}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safariVersion} Safari/605.1.15`,
    `Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X; ${locale}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safariVersion} Mobile/15E148 Safari/604.1`,
    `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:${Math.floor(90 + Math.random() * 20)}.0) Gecko/20100101 Firefox/${Math.floor(90 + Math.random() * 20)}.0`
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

module.exports = async (req, res) => {
  const { model = 'brian', text = 'Apa kabar sayang' } = req.query;
  const model_id = modelList[model.toLowerCase()] || modelList['brian'];
  const userAgent = getRandomUserAgent();
  
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${model_id}?allow_unauthenticated=1`,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { speed: 1 }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Referer': 'https://elevenlabs.io/'
        },
        responseType: 'arraybuffer'
      }
    );
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch from ElevenLabs API',
      details: error?.response?.data || error.message
    });
  }
};