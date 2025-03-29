const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
    try {
        const url = 'https://spowload.com/en';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': 'https://spowload.com/en'
        };
        
        const response = await axios.get(url, { headers });
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        const form = document.querySelector('#Form');
        const action = form.getAttribute('action');
        const token = document.querySelector('input[name="_token"]').value;
        
        const trackUrl = 'https://open.spotify.com/intl-id/track/3wHU5wfyf0uw6TpiE98Jxn';
        const formData = `_token=${token}&trackUrl=${encodeURIComponent(trackUrl)}`;
        
        const postHeaders = { ...headers, 'Cookie': response.headers['set-cookie']?.join('; ') };
        
        const postResponse = await axios.post(action, formData, { headers: postHeaders });
        const redirectUrl = postResponse.request.res.responseUrl;
        
        const trackPageResponse = await axios.get(redirectUrl, { headers: postHeaders });
        const trackDom = new JSDOM(trackPageResponse.data);
        const trackDocument = trackDom.window.document;
        
        const downloadButton = trackDocument.querySelector('a[data-url]');
        const downloadUrl = downloadButton ? downloadButton.getAttribute('data-url') : null;
        
        res.json({ downloadUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
