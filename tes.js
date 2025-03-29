const axios = require('axios'); const cheerio = require('cheerio');

module.exports = async (req, res) => { try { const { data } = await axios.get('https://www.jadwaltv.net/jadwal-sepakbola'); const $ = cheerio.load(data); const matches = [];

$('tr.jklIv').each((_, row) => {
        const columns = $(row).find('td');
        if (columns.length === 4) {
            matches.push({
                date: $(columns[0]).text().trim(),
                time: $(columns[1]).text().trim(),
                match: $(columns[2]).text().trim(),
                league: $(columns[3]).text().trim()
            });
        }
    });

    res.json(matches);
} catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
}

};

