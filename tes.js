const axios = require('axios'); const jsdom = require('jsdom'); const { JSDOM } = jsdom;

module.exports = async (req, res) => { try { const url = req.query.url; if (!url) { return res.json({ error: 'Missing URL parameter' }); }

const response = await axios.get('https://edunity.fr/', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
            'Referer': 'https://edunity.fr/'
        }
    });

    const dom = new JSDOM(response.data);
    const form = dom.window.document.querySelector('form.search-form');
    if (!form) {
        return res.json({ error: 'Form not found' });
    }

    const formAction = form.getAttribute('action');
    if (!formAction) {
        return res.json({ error: 'Form action not found' });
    }

    const postUrl = new URL(formAction, 'https://edunity.fr/').href;
    const postResponse = await axios.post(postUrl, `q=${encodeURIComponent(url)}`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
            'Referer': 'https://edunity.fr/'
        }
    });

    const postDom = new JSDOM(postResponse.data);
    const iframe = Array.from(postDom.window.document.querySelectorAll('iframe'))
        .find(frame => frame.src.includes('mp3'));
    
    if (!iframe) {
        return res.json({ error: 'MP3 iframe not found' });
    }

    res.send({ iframe: iframe.outerHTML });
} catch (error) {
    res.json({ error: error.message });
}

};

