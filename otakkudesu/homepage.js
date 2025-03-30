const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
    try {
        const response = await axios.get('https://anime-indo.lol/', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
                'Referer': 'https://anime-indo.lol/'
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        const animeList = [];
        
        document.querySelectorAll('.menu .list-anime').forEach(anime => {
            const title = anime.querySelector('p')?.textContent.trim();
            const episode = anime.querySelector('.eps')?.textContent.trim();
            const image = anime.querySelector('img')?.getAttribute('data-original') || anime.querySelector('img')?.src;
            const link = anime.parentElement.href;
            
            if (title && episode && image && link) {
                animeList.push({ title, episode, image, link });
            }
        });

        res.json({ success: true, data: animeList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
