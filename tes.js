const axios = require('axios');
const { JSDOM } = require('jsdom');

const instance = axios.create({
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': 'https://johsteven.github.io/penghitung-wr/winlose.html'
    }
});

module.exports = async (req, res) => {
    try {
        const match = req.query.match;
        const wr = req.query.wr;
        
        if (!match || !wr) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const response = await instance.get('https://johsteven.github.io/penghitung-wr/winlose.html');
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        
        document.querySelector('#tMatch').value = match;
        document.querySelector('#tWr').value = wr;
        
        const formData = new URLSearchParams();
        formData.append('match', match);
        formData.append('wr', wr);
        
        const resultResponse = await instance.post('https://johsteven.github.io/penghitung-wr/winlose.html', formData.toString());
        const resultDom = new JSDOM(resultResponse.data);
        const resultDocument = resultDom.window.document;
        
        const resultText = resultDocument.querySelector('#resultText')?.innerHTML || 'Result not found';
        
        res.json({ result: resultText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
