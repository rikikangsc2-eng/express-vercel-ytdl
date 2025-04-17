const axios = require('axios');

const apiKey = 'AIzaSyBPgX5x1Xl3tfT1uxn_r4Q_7JN2NXMhWYs';

module.exports = async (req, res) => {
  try {
    const userInput = req.query.q;
    const systemInput = req.query.system || '';

    if (!userInput) {
      return res.status(400).json({ error: 'Masukin input dong cuy (parameter ?q kosong)' });
    }

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
      responseMimeType: 'text/plain',
    };

    const data = {
      generationConfig,
      contents: [
        {
          role: 'system',
          parts: [
            { text: systemInput }
          ]
        },
        {
          role: 'user',
          parts: [
            { text: userInput }
          ]
        }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent?key=${apiKey}`;

    let response;
    try {
      response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Gagal request ke API Gemini cuy:', err.response?.data || err.message);
      return res.status(502).json({
        error: 'Gagal dapet respon dari Gemini cuy',
        details: err.response?.data || err.message
      });
    }

    if (!response.data || !response.data.candidates) {
      return res.status(500).json({
        error: 'Respon dari Gemini kosong cuy',
        raw: response.data
      });
    }

    const outputText = response.data.candidates[0]?.content?.parts[0]?.text || 'Ga ada jawaban cuy';

    res.status(200).json({ result: outputText });
  } catch (error) {
    console.error('Error gak ketebak cuy:', error);
    res.status(500).json({ error: 'Ada yang salah cuy (error gak ketebak)', details: error.message });
  }
};