const axios = require('axios');

module.exports = async (req, res) => {
    try {
        const axiosRes = await axios.post(
            'https://api.deepinfra.com/v1/openai/chat/completions',
            req.body,
            {
                headers: {
                    ...req.headers,
                },
                responseType: 'stream'
            }
        );
        
        res.writeHead(axiosRes.status, axiosRes.headers);
        axiosRes.data.pipe(res);
    } catch (err) {
        res.writeHead(err.response?.status || 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: `Gagal cuy: ${err.message}`
        }));
    }
};