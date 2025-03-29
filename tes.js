const axios = require('axios'); const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const { data } = await axios.get('https://www.jadwaltv.net/jadwal-sepakbola'); const dom = new JSDOM(data); const document = dom.window.document; const rows = document.querySelectorAll('tr.jklIv'); const matches = [];

rows.forEach(row => {
        const columns = row.querySelectorAll('td');
        if (columns.length === 4) {
            matches.push({
                date: columns[0].textContent.trim(),
                time: columns[1].textContent.trim(),
                match: columns[2].textContent.trim(),
                league: columns[3].textContent.trim()
            });
        }
    });
    
    res.json(matches);
} catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
}

};

