const axios = require('axios'); const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const text = req.query.text || "Halo"; const voice = "id-ID";

const response = await axios.get('https://soundoftext.com/', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': 'https://soundoftext.com/'
        }
    });
    
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const formData = new URLSearchParams();
    formData.append('voice', voice);
    formData.append('text', text);
    
    const submitResponse = await axios.post('https://soundoftext.com/sounds', formData.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': 'https://soundoftext.com/'
        }
    });
    
    const soundId = submitResponse.data.id;
    const downloadUrl = `https://files.soundoftext.com/${soundId}.mp3`;
    
    res.json({ success: true, text, voice, downloadUrl });
} catch (error) {
    res.status(500).json({ success: false, error: error.message });
}

};

