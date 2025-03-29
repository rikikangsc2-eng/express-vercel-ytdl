const axios = require('axios'); const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const baseUrl = 'https://spowload.com/en'; const analyzeUrl = 'https://spowload.com/analyze';

// Step 1: Get the page and extract CSRF token
    const response = await axios.get(baseUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': baseUrl
        }
    });
    
    const dom = new JSDOM(response.data);
    const token = dom.window.document.querySelector('input[name="_token"]').value;
    
    // Step 2: Send POST request with track URL
    const trackUrl = 'https://open.spotify.com/intl-id/track/3wHU5wfyf0uw6TpiE98Jxn';
    const formData = new URLSearchParams();
    formData.append('_token', token);
    formData.append('trackUrl', trackUrl);
    
    const analyzeResponse = await axios.post(analyzeUrl, formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': baseUrl
        },
        maxRedirects: 0,
        validateStatus: status => status === 302 // Capture redirect response
    });
    
    // Step 3: Extract redirect URL
    const redirectedUrl = analyzeResponse.headers.location;
    
    res.json({ success: true, redirectedUrl });
} catch (error) {
    res.status(500).json({ success: false, error: error.message });
}

};

