const axios = require("axios");
const querystring = require("querystring");

module.exports = async (req, res) => {
  try {
    const data = querystring.stringify({
      from: "id_ID",
      to: "en_US",
      text: "Kamu orang mana?",
      platform: "dp"
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest"
    };

    const response = await axios.post(
      "https://lingvanex.com/translation/translate",
      data,
      { headers }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};