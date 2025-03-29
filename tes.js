const axios = require('axios'); const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const { data } = await axios.get('https://codebeautify.org/javascript-obfuscator', { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36', 'Referer': 'https://codebeautify.org/javascript-obfuscator' } });

const dom = new JSDOM(data);
    const document = dom.window.document;
    const aceContents = document.querySelectorAll('.ace_content');
    let kode = req.query.kode || "const contoh = 'contoh'";

    aceContents.forEach(el => {
        if (el.querySelector('.ace_placeholder')) {
            el.innerHTML = `<div class="ace_line">${kode}</div>`;
        }
    });

    res.send(dom.serialize());
} catch (error) {
    res.status(500).send('Error fetching data');
}

};

