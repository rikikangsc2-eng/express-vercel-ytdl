const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    try {
        const url = 'https://id.m.wikipedia.org/wiki/Special:Random';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        const title = $('span.mw-page-title-main').text().trim() || "";
        const description = $('p')
            .map((i, el) => $(el).text().trim().replace(/\[\d+\]/g, ''))
            .get()
            .filter(text => text.length > 0)
            .join('\n\n') || "";
        
        const images = $('figure.mw-default-size img')
            .map((i, el) => `https:${$(el).attr('src')}`)
            .get();
        
        res.json({
            title,
            description,
            images
        });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data' });
    }
};
