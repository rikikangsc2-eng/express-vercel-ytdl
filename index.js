const express = require('express');
const axios = require('axios');
const app = express();
const googleTTS = require('google-tts-api');

app.use(express.json());

app.get('/music', async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).send('Query parameter "id" is required');
    }

    try {
        const response = await axios.get(
            `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`,
            {
                headers: {
                    'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
                    'x-rapidapi-key': '222ac7fb8bmsh0cb23acb6003932p1bfcadjsne797ba726a04'
                }
            }
        );

         const audioUrl = response.data.link;

        const audioResponse = await axios.get(audioUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.260 Mobile Safari/537.36',
                'Referer': 'https://youtube-mp36.p.rapidapi.com'
            }
        });
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename=audio.mp3');
        audioResponse.data.pipe(res);

    } catch (err) {
        console.error('Error fetching song:', err);
        res.status(500).send('Error fetching song');
    }
});

app.get('/tts', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).send('Query parameter "text" is required');
    }

    try {
        const audioChunks = await googleTTS.getAllAudioBase64(text, {
            lang: 'id',
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
            splitPunct: ',.?',
        });

        const mergedAudio = audioChunks.map(chunk => chunk.base64).join('');
        const audioBuffer = Buffer.from(mergedAudio, 'base64');

        res.set('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
    } catch (err) {
        console.error('Error synthesizing text:', err);
        res.status(500).send('Error synthesizing text');
    }
});

app.post('/llm', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        messages: req.body.messages || [],
        model: req.body.model || 'llama3-8b-8192',
        temperature: req.body.temperature || 1,
        max_tokens: req.body.max_tokens || 1024,
        top_p: req.body.top_p || 1,
        stream: req.body.stream || false,
        stop: req.body.stop || null
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer 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'
        }
      }
    );
res.setHeader('Content-Type', 'appication/json');
res.status(response.status).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(error.response?.status || 500).send(error.response?.data || { error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));