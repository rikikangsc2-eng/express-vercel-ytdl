const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

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
        stream: req.body.stream || true,
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
res.status(response.status).json(JSON.parse(response.data));
  } catch (error) {
    console.error(error);
    res.status(error.response?.status || 500).send(error.response?.data || { error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));