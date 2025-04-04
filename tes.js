const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const text = req.query.text;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Parameter text diperlukan.' });
    }
    
    if (text.length > 500) {
      return res.status(400).json({ success: false, error: 'Teks tidak boleh melebihi 500 karakter.' });
    }
    
    const apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9?allow_unauthenticated=1';
    const payload = {
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        speed: 1
      }
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://elevenlabs.io/'
    };
    
    const response = await axios.post(apiUrl, payload, {
      headers: headers,
      responseType: 'arraybuffer' // Penting untuk mendapatkan data audio sebagai buffer
    });
    
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
    res.setHeader('character-cost', response.headers['character-cost'] || 'unknown');
    res.setHeader('history-item-id', response.headers['history-item-id'] || 'not_stored');
    res.setHeader('request-id', response.headers['request-id'] || 'unknown');
    
    res.send(response.data);
    
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan internal server.';
    let statusCode = 500;
    
    if (error.response) {
      // Error dari response API ElevenLabs
      statusCode = error.response.status;
      try {
        // Coba parse error detail jika ada
        const errorData = JSON.parse(error.response.data.toString());
        errorMessage = errorData.detail?.message || error.response.statusText || 'Gagal menghubungi API ElevenLabs.';
      } catch (parseError) {
        errorMessage = error.response.statusText || 'Gagal menghubungi API ElevenLabs.';
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      errorMessage = 'Tidak ada respons dari server ElevenLabs.';
      statusCode = 504; // Gateway Timeout
    } else {
      // Error lainnya (misal: setup request)
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};