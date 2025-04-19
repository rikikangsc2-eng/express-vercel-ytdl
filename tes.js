const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const isPost = req.method === 'POST';
    const source = isPost ? req.body : req.query;
    const { system, prompt } = source;

    const allowedRoles = ['user', 'assistant'];
    const validSystem = typeof system === 'string';
    const validPrompt = Array.isArray(prompt) && prompt.every(
      p => p
        && allowedRoles.includes(p.role)
        && typeof p.content === 'string'
    );

    if (!validSystem || !validPrompt) {
      return res.status(400).json({
        error: 'Format salah cuy. Harus ada: \n  • system: "Example" (string)\n  • prompt: [{ role: "user|assistant", content: "..." }, ...]',
        allowedRoles
      });
    }

    const response = await axios({
      method: 'post',
      url: 'https://api.deepinfra.com/v1/openai/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'X-Deepinfra-Source': 'model-embed',
        'accept': 'text/event-stream',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://deepinfra.com/google/gemma-2-9b-it'
      },
      data: {
        model: 'google/gemma-2-9b-it',
        messages: [
          { role: 'system', content: system },
          ...prompt
        ],
        stream: true,
        stream_options: {
          include_usage: true,
          continuous_usage_stats: true
        }
      },
      responseType: 'stream'
    });

    let buffer = '';
    for await (const chunk of response.data) {
      buffer += chunk.toString();
    }

    const lines = buffer
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('data: '))
      .map(line => line.slice(6))
      .filter(line => line !== '[DONE]');

    let full = '';
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) full += delta;
      } catch {}
    }

    res.json({ text: full });
  } catch (err) {
    res.status(500).json({ error: 'Waduh, error cuy: ' + err.message });
  }
};
