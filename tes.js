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

async function fetchAudio(model_id, text, retries = 3) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${model_id}?allow_unauthenticated=1`;
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': getRandomUserAgent(),
    'Referer': 'https://elevenlabs.io/'
  };
  const data = {
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { speed: 1 }
  };
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(url, data, {
        headers,
        responseType: 'arraybuffer'
      });
      return response.data;
    } catch (error) {
      const raw = error?.response?.data;
      const message = raw instanceof Buffer ? raw.toString('utf8') : null;
      const isQuotaError = message?.includes('quota_exceeded');
      if (attempt < retries && isQuotaError) continue;
      throw error;
    }
  }
}

module.exports = async (req, res) => {
  const { model, text } = req.query;
  
  if (!model || !modelList[model.toLowerCase()]) {
    const models = Object.entries(modelList).map(([key, val]) => ({ name: key, id: val }));
    return res.json({ available_models: models });
  }
  
  try {
    const model_id = modelList[model.toLowerCase()];
    const audio = await fetchAudio(model_id, text || 'Apa kabar sayang');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (error) {
    let errorDetails = 'Unknown error occurred';
    if (error.response && error.response.data) {
      try {
        const buffer = error.response.data;
        const message = Buffer.isBuffer(buffer) ? buffer.toString('utf8') : JSON.stringify(buffer);
        const json = JSON.parse(message);
        errorDetails = json?.message || json?.detail || message;
      } catch {
        errorDetails = 'Failed to parse error response from ElevenLabs';
      }
    } else {
      errorDetails = error.message || 'No response from ElevenLabs';
    }
    
    res.status(500).json({
      error: 'Failed to fetch from ElevenLabs API',
      details: errorDetails
    });
  }
};