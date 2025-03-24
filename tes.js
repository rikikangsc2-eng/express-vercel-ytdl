const axios = require('axios')
const cheerio = require('cheerio')
module.exports = async (req, res) => {
  try {
    const { data: html } = await axios.get('https://www.jadwaltv.net/channel/antv')
    const $ = cheerio.load(html)
    const result = []
    $('tr.jklIv').each((i, el) => {
      const time = $(el).find('td').first().text().trim()
      const program = $(el).find('td').last().text().trim()
      result.push({ time, program })
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}