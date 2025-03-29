const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
    try {
        const url = 'https://toolbaz.com/image/ai-image-generator';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
                'Referer': 'https://toolbaz.com/image/ai-image-generator'
            }
        });

        const dom = new JSDOM(response.data);
        const scriptElements = dom.window.document.querySelectorAll('script');
        let captchaToken = '';
        
        scriptElements.forEach(script => {
            if (script.textContent.includes('turnstile.getResponse()')) {
                const match = script.textContent.match(/capcha_response=turnstile\.getResponse\(\);/);
                if (match) {
                    captchaToken = match[0];
                }
            }
        });

        if (!captchaToken) {
            return res.status(400).json({ error: 'Failed to retrieve captcha token' });
        }

        const apiResponse = await axios.post('https://data.toolbaz.com/img2.php', {
            text: 'Girl+sad',
            model: 'FLUX-1-schnell',
            capcha: captchaToken,
            size: '1024x1024'
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': '*/*'
            }
        });

        res.json(apiResponse.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
