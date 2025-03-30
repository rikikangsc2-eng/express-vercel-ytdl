const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (req, res) => {
    try {
        const { match, wr } = req.query;
        if (!match || !wr) return res.status(400).json({ error: 'Missing parameters' });

        const url = 'https://johsteven.github.io/penghitung-wr/winlose.html';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': url
        };

        const response = await axios.get(url, { headers });
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        document.querySelector('#tMatch').value = match;
        document.querySelector('#tWr').value = wr;
        document.querySelector('#hasil').click();

        setTimeout(() => {
            const resultText = document.querySelector('#resultText')?.innerHTML || 'No result found';
            res.json({ result: resultText });
        }, 2000);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
};
