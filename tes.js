const axios = require('axios'); const cheerio = require('cheerio');

module.exports = async (req, res) => { try { const url = 'https://id.m.wikipedia.org/wiki/Special:Random'; const { data } = await axios.get(url); const $ = cheerio.load(data);

const title = $('span.mw-page-title-main').text().trim() || "";
    const description = $('p').first().text().trim() || "";
    const image = $('figure.mw-default-size img').attr('src');
    
    res.json({
        title,
        description,
        image: image ? `https:${image}` : null
    });
} catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data' });
}

};

