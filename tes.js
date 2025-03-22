const axios = require('axios');

async function chat(req, res) {
    try {
        const userText = req.query.text;

        const startSessionResponse = await axios.post('https://zerogptai.org/wp-json/mwai/v1/start_session', {}, {
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Content-Type': 'application/json',
                'Origin': 'https://zerogptai.org',
                'Referer': 'https://zerogptai.org/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
            }
        });

        const sessionId = startSessionResponse.data.sessionId;
        const nonce = startSessionResponse.data.restNonce;

        const chatPayload = {
            botId: "default",
            customId: null,
            session: sessionId,
            chatId: "hm7r0jnen",
            contextId: 39,
            messages: [
                {
                    id: "Owjycjcdj4d",
                    role: "assistant",
                    content: userText,
                    who: "AI",
                    timestamp: Date.now()
                }
            ],
            newMessage: userText,
            newField: null,
            stream: false
        };

        const chatResponse = await axios.post('https://zerogptai.org/wp-json/mwai-ui/v1/chats/submit', chatPayload, {
            headers: {
                'Accept': 'text/event-stream',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Content-Type': 'application/json',
                'Origin': 'https://zerogptai.org',
                'Referer': 'https://zerogptai.org/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
                'X-Wp-Nonce': nonce
            }
        });

        res.json(chatResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = chat;