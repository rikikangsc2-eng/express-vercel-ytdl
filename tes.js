const axios = require("axios");

module.exports = async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({ error: "Parameter 'prompt' diperlukan" });
    }

    try {
        const checkPromptResponse = await axios.post(
            "https://api.yanzgpt.my.id/v1/check_prompt",
            { prompt },
            {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36"
                }
            }
        );

        if (!checkPromptResponse.data || checkPromptResponse.data.cmd !== "text_completion") {
            return res.status(400).json({ error: "Prompt tidak valid untuk text completion" });
        }

        const chatResponse = await axios.post(
            "https://api.yanzgpt.my.id/v1/chat",
            {
                messages: [{ role: "user", content: prompt }],
                images: null,
                model: "yanzgpt-revolution-25b-v3.5"
            },
            {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "authorization": "Bearer yzgpt-sc4tlKsMRdNMecNy",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36"
                }
            }
        );

        if (
            !chatResponse.data ||
            !chatResponse.data.choices ||
            chatResponse.data.choices.length === 0
        ) {
            return res.status(500).json({ error: "Gagal mendapatkan respon dari API chat" });
        }

        res.json({ response: chatResponse.data.choices[0].message.content });

    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({
                error: "Error dari API eksternal",
                details: error.response.data
            });
        } else if (error.request) {
            res.status(500).json({ error: "Tidak ada respon dari API eksternal" });
        } else {
            res.status(500).json({ error: "Terjadi kesalahan", details: error.message });
        }
    }
};