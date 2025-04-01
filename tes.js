const axios = require('axios'); const jsdom = require('jsdom'); const { JSDOM } = jsdom;

module.exports = async (req, res) => { try { const { url } = req.query; if (!url) return res.status(400).json({ error: 'Parameter url diperlukan' });

const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://musicaldown.com/id'
    };

    const session = await axios.get('https://musicaldown.com/id', { headers });
    const dom = new JSDOM(session.data);
    const document = dom.window.document;
    const cookies = session.headers['set-cookie'].join('; ');
    
    const formData = new URLSearchParams();
    document.querySelectorAll('input[type="hidden"]').forEach(input => {
        formData.append(input.name, input.value);
    });
    formData.append('link_url', url);

    const postResponse = await axios.post('https://musicaldown.com/id/download', formData, {
        headers: { ...headers, Cookie: cookies }
    });

    const downloadDom = new JSDOM(postResponse.data);
    res.send(downloadDom)
} catch (error) {
    res.status(500).json({ error: error.message });
}

};