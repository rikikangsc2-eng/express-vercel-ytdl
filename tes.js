const axios = require('axios'); const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const text = req.query.text || ''; if (!text) return res.status(400).json({ error: 'Text is required' });

const response = await axios.post(
        'https://soundoftext.com/',
        new URLSearchParams({
            engine: 'Google',
            text,
            voice: 'id-ID'
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
                'Referer': 'https://soundoftext.com/'
            }
        }
    );

    const dom = new JSDOM(response.data);
    const downloadLink = dom.window.document.querySelector('a.card__action');
    
    if (!downloadLink) return res.status(500).json({ error: 'Failed to retrieve audio URL' });
    
    res.json({ audio_url: downloadLink.href });
} catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
}

};

