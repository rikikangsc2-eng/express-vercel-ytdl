const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (req, res) => {
    try {
        const response = await axios.get('https://otakudesu.cloud/', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
                'Referer': 'https://otakudesu.cloud/'
            }
        });
        
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        
        const animeList = [];
        document.querySelectorAll('.detpost').forEach(item => {
            const episode = item.querySelector('.epz')?.textContent.trim();
            const day = item.querySelector('.epztipe')?.textContent.trim();
            const date = item.querySelector('.newnime')?.textContent.trim();
            const title = item.querySelector('.jdlflm')?.textContent.trim();
            const image = item.querySelector('.thumbz img')?.getAttribute('src');
            const link = item.querySelector('.thumb a')?.getAttribute('href');
            
            animeList.push({ episode, day, date, title, image, link });
        });
        
        res.json(animeList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};
