const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: 'Parameter url diperlukan' });

        const response = await axios.get('https://musicaldown.com/id', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
                'Referer': 'https://musicaldown.com/id'
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        
        const form = document.querySelector('#submit-form');
        if (!form) return res.status(500).json({ error: 'Form tidak ditemukan' });
        
        const formData = new URLSearchParams();
        document.querySelectorAll('input[type="hidden"]').forEach(input => {
            formData.append(input.name, input.value);
        });
        
        formData.append('link_url', url);

        const postResponse = await axios.post('https://musicaldown.com/id/download', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
                'Referer': 'https://musicaldown.com/id'
            }
        });

        const downloadDom = new JSDOM(postResponse.data);
        const downloadLinks = Array.from(downloadDom.window.document.querySelectorAll('a.download')).map(a => ({
            text: a.textContent.trim(),
            href: a.href
        }));

        if (downloadLinks.length === 0) return res.status(500).json({ error: 'Link unduhan tidak ditemukan' });
        res.json({ downloadLinks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
