const axios = require('axios'); const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const url = 'https://ngl.link/NGL'; const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36', 'Referer': url };

const response = await axios.get(url, { headers });
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const formData = new URLSearchParams();
    formData.append('question', 'Hai apa kabar');

    const submitUrl = url + document.querySelector('form').getAttribute('action');
    const submitResponse = await axios.post(submitUrl, formData.toString(), {
        headers: { ...headers, 'Content-Length': formData.toString().length }
    });

    const redirectUrl = submitResponse.headers.location || 'No Redirect Found';
    res.json({ redirectUrl });
} catch (error) {
    res.status(500).json({ error: error.message });
}

};

