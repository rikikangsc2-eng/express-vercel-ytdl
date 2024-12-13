const express = require('express');
const axios = require('axios');
const app = express();
const gTTS = require('node-gtts')('id');

app.use(express.json());

app.get('/tts', (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).send('Query parameter "text" is required');
    }

    try {
        gTTS.stream(text)
            .on('error', (err) => {
                console.error('Error synthesizing text:', err);
                res.status(500).send('Error synthesizing text');
            })
            .pipe(res.set('Content-Type', 'audio/mpeg'));
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('Unexpected error');
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