const axios = require('axios');

module.exports = async (req, res) => {
  const text = req.query.text || "The fungus among us.";
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://www.acethinker.com/tiktok-tts/tiktok-tts.php',
      data: { voice: "en_female_f08_salut_damour", text },
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36"
      },
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send(error.toString());
  }
};