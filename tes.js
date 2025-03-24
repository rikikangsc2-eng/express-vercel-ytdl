const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const { data } = await axios.get("https://ligakorupsi.biz.id/");
    const $ = cheerio.load(data);
    const results = [];
    
    $("#korupsi-table tr").each((_, el) => {
      const rank = $(el).find("td:nth-child(1)").text().trim();
      const company = $(el).find("td:nth-child(2)").text().trim();
      const caseType = $(el).find("td:nth-child(3)").text().trim();
      const amount = $(el).find("td:nth-child(4) .amount").text().trim();
      const trend = $(el).find("td:nth-child(5) span").text().trim();
      
      results.push({ rank, company, caseType, amount, trend });
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};