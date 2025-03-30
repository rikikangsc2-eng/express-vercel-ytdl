const axios = require('axios')
const { JSDOM } = require('jsdom')
module.exports = async (req, res) => {
  try {
    const match = req.query.match
    const wr = req.query.wr
    const response = await axios.get('https://johsteven.github.io/penghitung-wr/winlose.html', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': 'https://johsteven.github.io/penghitung-wr/winlose.html'
      }
    })
    const dom = new JSDOM(response.data, {
      runScripts: "dangerously",
      resources: "usable"
    })
    await new Promise(resolve => {
      dom.window.document.addEventListener("DOMContentLoaded", resolve)
    })
    dom.window.document.getElementById('tMatch').value = match
    dom.window.document.getElementById('tWr').value = wr
    dom.window.document.getElementById('hasil').click()
    await new Promise(resolve => setTimeout(resolve, 1000))
    const result = dom.window.document.getElementById('resultText').innerHTML
    res.send(result)
  } catch (error) {
    res.status(500).send(error.toString())
  }
}
