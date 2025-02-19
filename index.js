  const express = require('express');
  const axios = require('axios');
  const ElevenLabs = require('elevenlabs-node');
  const app = express();
  const voice = new ElevenLabs({
    apiKey: "sk_a54cae176ba57e1e27fdc1860219a6cbdf777d0431127035",
    voiceId: "19zQpXlAQKHlcmXgXfLr"
  });
  app.get('/tts', async (req, res) => {
    const text = req.query.text || "mozzy is cool";
    try {
      const audioStream = await voice.textToSpeechStream({
        textInput: text,
        modelId: "eleven_multilingual_v2"
      });
      res.setHeader('Content-Type', 'audio/mpeg');
      audioStream.pipe(res);
    } catch (error) {
      try {
        const alternativeVoice = new ElevenLabs({
          apiKey: "sk_541d86e6f71ab1f1e7de7b5019cc475508e7ada24be56a2b",
          voiceId: "19zQpXlAQKHlcmXgXfLr"
        });
        const audioStream = await alternativeVoice.textToSpeechStream({
          textInput: text,
          modelId: "eleven_multilingual_v2"
        });
        res.setHeader('Content-Type', 'audio/mpeg');
        audioStream.pipe(res);
      } catch (alternativeError) {
        try {
          const fallbackApiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(text)}&model=miku`;
          const fallbackResponse = await axios.get(fallbackApiUrl);
          if (fallbackResponse.data && fallbackResponse.data.data && fallbackResponse.data.data.oss_url) {
            const ossUrl = fallbackResponse.data.data.oss_url;
            const ossResponse = await axios({
              method: 'get',
              url: ossUrl,
              responseType: 'stream'
            });
            res.setHeader('Content-Type', 'audio/mpeg');
            ossResponse.data.pipe(res);
          } else {
            res.status(500).send("Fallback API did not return audio URL");
          }
        } catch (fallbackError) {
          res.status(500).send("Error generating speech using fallback API");
        }
      }
    }
  });
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
