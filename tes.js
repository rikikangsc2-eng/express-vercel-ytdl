const axios = require('axios');
const { Readable } = require('stream');

module.exports = async (req, res) => {
  const text = req.query.text || 'The fungus among us.';
  const payload = {
    voice: "en_female_f08_salut_damour",
    text: text
  };
  
  try {
    const response = await axios.post(
      'https://www.acethinker.com/tiktok-tts/tiktok-tts.php',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
          'Referer': 'https://www.acethinker.com/text-to-speech'
        }
      }
    );
    
    if (response.data && response.data.audio) {
      const audioBuffer = Buffer.from(response.data.audio, 'base64');
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Content-Disposition', 'inline; filename="tts.mp3"');
      
      Readable.from(audioBuffer).pipe(res);
    } else {
      res.status(500).json({ error: 'Invalid API response' });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch audio',
      details: error.response ? error.response.data : error.message
    });
  }
};