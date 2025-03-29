const axios = require('axios'); const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const response = await axios.post('https://ngl.link/NGL', null, { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36', 'Referer': 'https://ngl.link/NGL' } });

const dom = new JSDOM(response.data);
    const form = dom.window.document.querySelector('textarea[name="question"]');
    const button = dom.window.document.querySelector('button.submit');

    if (!form || !button) {
        return res.status(500).send('Element not found');
    }
    
    const formData = new URLSearchParams();
    formData.append('question', 'Hello, this is a test message');

    await axios.post('https://ngl.link/NGL', formData.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': 'https://ngl.link/NGL'
        }
    });
    
    res.redirect('https://ngl.link/NGL');
} catch (error) {
    res.status(500).send('Error occurred');
}

};

