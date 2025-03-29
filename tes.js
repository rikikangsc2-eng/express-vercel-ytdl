const axios = require('axios'); const { JSDOM } = require('jsdom'); const qs = require('querystring');

module.exports = async (req, res) => { try { const url = 'https://ngl.link/NGL'; const userAgent = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36'; let cookies = '';

const { data, headers } = await axios.get(url, { headers: { 'User-Agent': userAgent } });
    if (headers['set-cookie']) {
        cookies = headers['set-cookie'].join('; ');
    }
    
    const dom = new JSDOM(data);
    const document = dom.window.document;
    
    const form = document.querySelector('textarea[name="question"]');
    if (!form) return res.status(500).json({ error: 'Form not found' });
    
    const formAction = url;
    const payload = { question: 'Test anonymous message' };
    
    const response = await axios.post(formAction, qs.stringify(payload), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': userAgent,
            'Cookie': cookies
        },
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
    });
    
    res.json({ message: 'Submitted', status: response.status, headers: response.headers.location || 'No Redirect' });
} catch (error) {
    res.status(500).json({ error: error.message });
}

};