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
        
        const getInputValue = (name) => {
            const input = document.querySelector(`input[name="${name}"]`);
            return input ? input.value : null;
        };

        const _fix = getInputValue('_fix');
        const _bEqyS = getInputValue('_bEqyS');
        const verify = getInputValue('verify');

        if (!_fix || !_bEqyS || !verify) {
            return res.status(500).json({ error: 'Elemen input hidden tidak ditemukan atau berubah' });
        }

        const postResponse = await axios.post('https://musicaldown.com/id/download', new URLSearchParams({
            _fix,
            _bEqyS,
            verify,
            link_url: url
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
                'Referer': 'https://musicaldown.com/id'
            }
        });

        const downloadDom = new JSDOM(postResponse.data);
        const downloadLink = downloadDom.window.document.querySelector('a.btn-download')?.href;

        if (!downloadLink) return res.status(500).json({ error: 'Link unduhan tidak ditemukan' });
        res.redirect(downloadLink);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
