const axios = require("axios");
const { JSDOM } = require("jsdom");

module.exports = async (req, res) => {
  try {
    const { data } = await axios.get("https://ligakorupsi.biz.id/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
      }
    });
    
    const dom = new JSDOM(data);
    const document = dom.window.document;
    const results = [];
    
    document.querySelectorAll("#korupsi-table tr").forEach(row => {
      const columns = row.querySelectorAll("td");
      if (columns.length >= 5) {
        results.push({
          rank: columns[0].textContent.trim(),
          company: columns[1].textContent.trim(),
          caseType: columns[2].textContent.trim(),
          amount: columns[3].textContent.trim(),
          trend: columns[4].textContent.trim()
        });
      }
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data", details: error.message });
  }
};