const axios = require("axios");
const { JSDOM } = require("jsdom");

module.exports = async (req, res) => {
  try {
    const { data } = await axios.get("https://ligakorupsi.biz.id/");
    const dom = new JSDOM(data);
    const document = dom.window.document;
    const results = [];

    document.querySelectorAll("#korupsi-table tr").forEach((row) => {
      const columns = row.querySelectorAll("td");
      const rank = columns[0].textContent.trim();
      const company = columns[1].textContent.trim();
      const caseType = columns[2].textContent.trim();
      const amount = columns[3].textContent.trim();
      const trend = columns[4].textContent.trim();

      results.push({ rank, company, caseType, amount, trend });
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};