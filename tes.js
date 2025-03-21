const axios = require('axios');

module.exports = async (req, res) => {
  const payload = {
    text: req.query.text || "Apaan sih jangan sok asik",
    font: "default",
    color: "#000000",
    size: "28"
  };
  
  try {
    const response = await axios.post('https://lemon-write.vercel.app/api/generate-book', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36'
      }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
};