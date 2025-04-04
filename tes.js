const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => { try { const response = await axios.post('https://y2meta.tube/id1/search/', new URLSearchParams({ query: 'https://youtu.be/-ktlIHSOOmk?si=fLKNk60e2dM4Dpdz' }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36', 'Referer': 'https://y2meta.tube/id1/' } });
    res.send(response.data); } catch (error) { res.json({ error: error.message }); } };