const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Alicia AI Chat</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body {
                    font-family: sans-serif;
                }
            </style>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 class="text-2xl font-bold mb-4 text-center">Ngobrol sama Alicia AI</h1>
                <div id="chatbox" class="h-64 overflow-y-auto border border-gray-300 p-4 rounded mb-4">
                </div>
                <div class="flex">
                    <input type="text" id="userInput" class="flex-grow border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ketik pesanmu...">
                    <button id="sendButton" class="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Kirim</button>
                </div>
                 <div id="error-message" class="text-red-500 mt-2 hidden"></div>
            </div>

            <script>
                const userInput = document.getElementById('userInput');
                const sendButton = document.getElementById('sendButton');
                const chatbox = document.getElementById('chatbox');
                const errorMessage = document.getElementById('error-message');

                sendButton.addEventListener('click', sendMessage);
                userInput.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        sendMessage();
                    }
                });

                async function sendMessage() {
                    const message = userInput.value.trim();
                    if (!message) return;

                    appendMessage('Kamu', message, 'user');

                    userInput.value = '';

                    try {
                        const response = await axios.post('/api/chat', {
                            messages: [{ role: 'user', content: message }]
                        });

                        appendMessage('Alicia AI', response.data.response, 'ai');
                         errorMessage.classList.add('hidden');

                    } catch (error) {
                        console.error('Error fetching from API:', error);
                        let displayMessage = 'Waduh, ada error nih pas ngobrol sama Alicia AI. Coba lagi ya, cuy!';
                        if (error.response && error.response.data && error.response.data.error) {
                            displayMessage = error.response.data.error;
                        }
                        errorMessage.textContent = displayMessage;
                        errorMessage.classList.remove('hidden');
                        appendMessage('Sistem', 'Gagal mendapatkan balasan.', 'system');
                    }
                }

                function appendMessage(sender, text, type) {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('mb-2', 'p-2', 'rounded-lg');

                    if (type === 'user') {
                        messageElement.classList.add('bg-blue-100', 'self-end', 'text-right');
                        messageElement.innerHTML = \`<span class="font-bold">\${sender}:</span> \${text}\`;
                    } else if (type === 'ai') {
                         messageElement.classList.add('bg-green-100', 'self-start', 'text-left');
                         messageElement.innerHTML = \`<span class="font-bold">\${sender}:</span> \${text}\`;
                    } else if (type === 'system') {
                        messageElement.classList.add('bg-red-100', 'text-center', 'text-sm');
                         messageElement.innerHTML = \`<span class="font-bold">\${sender}:</span> \${text}\`;
                    }

                    chatbox.appendChild(messageElement);
                    chatbox.scrollTop = chatbox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

router.post('/chat', async (req, res) => {
    const userMessages = req.body.messages;

    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
        return res.status(400).json({ error: 'Payload messages tidak valid, cuy!' });
    }

    const messagesPayload = [{ role: "system", content: "Kamu adalah Alicia AI" }, ...userMessages];

    try {
        const deepinfraApiUrl = 'https://api.deepinfra.com/v1/openai/chat/completions';
        const apiKey = process.env.DEEPINFRA_API_KEY;

        if (!apiKey) {
             console.error('DEEPINFRA_API_KEY environment variable not set.');
             return res.status(500).json({ error: 'API Key DeepInfra belum diset di environment variable, cuy!' });
        }

        const response = await axios({
            method: 'post',
            url: deepinfraApiUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-Deepinfra-Source': 'model-embed',
                'accept': 'text/event-stream',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
                'Referer': 'https://deepinfra.com/google/gemma-2-9b-it',
                 'Authorization': `Bearer ${apiKey}`
            },
            data: {
                model: 'google/gemma-2-9b-it',
                messages: messagesPayload,
                stream: true,
                stream_options: { include_usage: true, continuous_usage_stats: true }
            },
            responseType: 'stream'
        });

        let accumulatedContent = '';

        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    if (data === '[DONE]') {
                    } else {
                        try {
                            const json = JSON.parse(data);
                            if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
                                accumulatedContent += json.choices[0].delta.content;
                            }
                        } catch (e) {
                        }
                    }
                }
            }
        });

        response.data.on('end', () => {
            res.json({ response: accumulatedContent });
        });

        response.data.on('error', (err) => {
             console.error('Stream error from DeepInfra API:', err);
             if (!res.headersSent) {
                res.status(500).json({ error: 'Ada masalah saat nerima data stream dari API DeepInfra, cuy!' });
             }
        });

         req.on('close', () => {
             if (response.data && !response.data.complete) {
                 console.log('Client disconnected before API response finished.');
             }
         });


    } catch (error) {
        console.error('Error calling DeepInfra API:', error.message);
        if (!res.headersSent) {
            if (error.response) {
                console.error('DeepInfra API responded with status:', error.response.status);
                 res.status(error.response.status).json({ error: `API DeepInfra bales error nih, cuy! Status: ${error.response.status}` });
            } else if (error.request) {
                 console.error('No response received from DeepInfra API:', error.request);
                 res.status(500).json({ error: 'Gak ada respon dari API DeepInfra, cuy! Mungkin jaringannya putus?' });
            } else {
                 console.error('Error setting up request to DeepInfra API:', error.message);
                 res.status(500).json({ error: `Ada error pas nyiapin request ke API DeepInfra, cuy! ${error.message}` });
            }
        }
    }
});


module.exports = router;

