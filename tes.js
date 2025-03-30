const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
    try {
        const url = 'https://otakudesu.cloud/anime/medalist-sub-indo/';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
            'Referer': url
        };
        
        const response = await axios.get(url, { headers });
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        
        const image = document.querySelector('.fotoanime img')?.src || '';
        const details = {};
        document.querySelectorAll('.infozingle p').forEach(p => {
            const key = p.querySelector('b')?.textContent.replace(':', '').trim().toLowerCase();
            const value = p.textContent.replace(/^.*?:/, '').trim();
            if (key) details[key] = value;
        });
        
        const synopsis = Array.from(document.querySelectorAll('.sinopc p')).map(p => p.textContent).join(' ');
        const episodes = Array.from(document.querySelectorAll('span a[data-wpel-link="internal"]'))
            .filter(a => a.href.includes('/episode/'))
            .map(a => ({ episode: a.textContent.match(/\d+/)?.[0] || '', link: a.href }));
        
        res.json({ image, details, synopsis, episodes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to scrape data' });
    }
};
