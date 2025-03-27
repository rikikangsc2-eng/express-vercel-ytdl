const axios = require('axios');
const qs = require('querystring');

const getNonce = async () => {
  try {
    const response = await axios.get('https://chatgptfree.ai/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36'
      }
    });
    
    const match = response.data.match(/"_wpnonce"\s*:\s*"([^"]+)"/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

module.exports = async (req, res) => {
  try {
    const _wpnonce = await getNonce();
    if (!_wpnonce) throw new Error('Gagal mendapatkan _wpnonce');
    
    const payload = {
      _wpnonce,
      post_id: "6",
      url: "https%3A%2F%2Fchatgptfree.ai",
      action: "wpaicg_chat_shortcode_message",
      message: "Kamu+siapa+kenal+aku+ngga+",
      bot_id: "0",
      chatbot_identity: "shortcode",
      wpaicg_chat_client_id: "SqzxF7dTKz",
      wpaicg_chat_history: "%5B%7B%22text%22%3A%22Human%3A+Kamu+siapa+kenal+aku+ngga%22%7D%5D",
      chat_id: "1281"
    };
    
    const response = await axios.post(
      'https://chatgptfree.ai/wp-admin/admin-ajax.php',
      qs.stringify(payload),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36'
        },
        responseType: 'arraybuffer'
      }
    );
    
    res.setHeader('Content-Type', 'text/event-stream;charset=UTF-8');
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};