const axios = require('axios')
const { JSDOM } = require('jsdom')
module.exports = async (req, res) => {
  const match = req.query.match
  const wr = req.query.wr
  const url = 'https://johsteven.github.io/penghitung-wr/winlose.html'
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': url
      }
    })
    const dom = new JSDOM(response.data, { runScripts: "dangerously", resources: "usable" })
    await new Promise(r => dom.window.document.addEventListener("DOMContentLoaded", r))
    dom.window.document.querySelector("#tMatch").value = match
    dom.window.document.querySelector("#tWr").value = wr
    dom.window.document.querySelector("#hasil").click()
    await new Promise(r => setTimeout(r, 500))
    const resultText = dom.window.document.querySelector("#resultText").textContent
    res.json({ result: resultText })
  } catch (e) {
    res.status(500).json({ error: e.toString() })
  }
}
