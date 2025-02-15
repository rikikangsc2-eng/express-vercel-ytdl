  const express = require('express');
  const axios = require('axios');
  const ElevenLabs = require('elevenlabs-node');

  const app = express();

  const voice = new ElevenLabs({
    apiKey: "sk_a54cae176ba57e1e27fdc1860219a6cbdf777d0431127035",
    voiceId: "kuOK5r8Woz6lkWaMr8kx"
  });

  app.get('/tts', async (req, res) => {
    // Mengambil teks dari query parameter atau menggunakan default "mozzy is cool"
    const text = req.query.text || "mozzy is cool";

    try {
      // Mencoba memanggil ElevenLabs API
      const audioStream = await voice.textToSpeechStream({
        textInput: text,
        modelId:         "eleven_multilingual_v2",       // The ElevenLabs Model ID
        stability:       0.5,                            // The stability for the converted speech
    similarityBoost: 0.5,                            // The similarity boost for the converted speech
    modelId:         "eleven_multilingual_v2",       // The ElevenLabs Model ID
    style:           1,                              // The style exaggeration for the converted speech
    speakerBoost:    true
      });
      res.setHeader('Content-Type', 'audio/mpeg');
      audioStream.pipe(res);
    } catch (error) {
      console.error("ElevenLabs error, gunakan fallback API:", error.message);

      // Jika terjadi error, gunakan fallback API
      const fallbackApiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(text)}&model=miku`;

      try {
        const fallbackResponse = await axios.get(fallbackApiUrl);
        if (
          fallbackResponse.data &&
          fallbackResponse.data.data &&
          fallbackResponse.data.data.oss_url
        ) {
          const ossUrl = fallbackResponse.data.data.oss_url;
          // Mengambil stream audio dari oss_url yang diberikan
          const ossResponse = await axios({
            method: 'get',
            url: ossUrl,
            responseType: 'stream'
          });
          res.setHeader('Content-Type', 'audio/mpeg');
          ossResponse.data.pipe(res);
        } else {
          res.status(500).send("Fallback API tidak mengembalikan URL audio");
        }
      } catch (fallbackError) {
        console.error("Fallback API error:", fallbackError.message);
        res.status(500).send("Error dalam menghasilkan suara menggunakan fallback API");
      }
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
