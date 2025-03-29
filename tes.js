const axios = require('axios'); const cheerio = require('cheerio');

module.exports = async (req, res) => { try { const url = 'https://id.m.wikipedia.org/wiki/Special:Random'; const { data } = await axios.get(url); const $ = cheerio.load(data);

const title = $('span.mw-page-title-main').text().trim();
    const paragraph = $('p').first().text().trim();
    
    res.json({ title, paragraph });
} catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data' });
}

};

