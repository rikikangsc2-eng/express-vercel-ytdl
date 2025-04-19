const axios = require('axios');
const cheerio = require('cheerio');

function getAdvancedFakeUserAgent() {
    const devices = [
        { os: 'Windows NT 10.0; Win64; x64', arch: '', type: 'desktop' },
        { os: 'Windows NT 6.1; WOW64', arch: '', type: 'desktop' },
        { os: 'Macintosh; Intel Mac OS X 10_15_7', arch: '', type: 'desktop' },
        { os: 'X11; Linux x86_64', arch: '', type: 'desktop' },
        { os: 'Linux; Android 11; Pixel 5', arch: '', type: 'mobile' },
        { os: 'Linux; Android 12; SM-G991B', arch: '', type: 'mobile' },
        { os: 'iPhone; CPU iPhone OS 15_2 like Mac OS X', arch: '', type: 'mobile' },
        { os: 'iPad; CPU OS 14_4 like Mac OS X', arch: '', type: 'tablet' }
    ];
    
    const browsers = ['Chrome', 'Firefox', 'Edge', 'Safari', 'Opera'];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const browser = browsers[Math.floor(Math.random() * browsers.length)];
    const major = Math.floor(Math.random() * 30) + 70;
    const minor = Math.floor(Math.random() * 10);
    const patch = Math.floor(Math.random() * 1000);
    
    if (browser === 'Chrome') {
        return `Mozilla/5.0 (${device.os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.${patch}.${minor} Safari/537.36`;
    } else if (browser === 'Firefox') {
        return `Mozilla/5.0 (${device.os}; rv:${major}.0) Gecko/20100101 Firefox/${major}.0`;
    } else if (browser === 'Edge') {
        return `Mozilla/5.0 (${device.os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.${patch}.${minor} Safari/537.36 Edg/${major}.0.${patch}.${minor}`;
    } else if (browser === 'Safari') {
        return `Mozilla/5.0 (${device.os}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${major}.0 Safari/605.1.15`;
    } else if (browser === 'Opera') {
        return `Mozilla/5.0 (${device.os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.${patch}.${minor} Safari/537.36 OPR/${major}.0.${patch}.${minor}`;
    }
}

module.exports = async (req, res) => {
    try {
        const payload = req.body;
        const originalUserAgent = req.headers['user-agent'] || 'No user-agent';
        const fakeUserAgent = getAdvancedFakeUserAgent();
        
        const response = await axios({
            method: 'post',
            url: 'https://api.deepinfra.com/v1/openai/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'X-Deepinfra-Source': 'model-embed',
                'accept': 'text/event-stream',
                'User-Agent': fakeUserAgent,
                'Referer': 'https://deepinfra.com/google/gemma-2-27b-it'
            },
            data: payload,
            responseType: 'stream'
        });
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('X-Original-User-Agent', originalUserAgent);
        res.setHeader('X-Fake-User-Agent', fakeUserAgent);
        
        response.data.on('data', (chunk) => {
            res.write(chunk);
        });
        
        response.data.on('end', () => {
            res.end();
        });
        
        response.data.on('error', (err) => {
            res.status(500).send('Error pas nerima stream cuy: ' + err.message);
        });
        
    } catch (err) {
        res.status(500).send('Gagal request ke Deepinfra cuy: ' + err.message);
    }
};