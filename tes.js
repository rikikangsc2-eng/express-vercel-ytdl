const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const { data } = await axios.get("https://myanimelist.net/topanime.php?type=bypopularity");
    const $ = cheerio.load(data);
    const anime = [];
    
    $(".information").each((_, element) => {
      const rank = $(element).find(".rank .text").text().trim();
      const title = $(element).find(".title").text().trim();
      const type = $(element).find(".type").text().trim();
      const score = $(element).find(".score-label").text().trim();
      const members = $(element).find(".icon-member").text().trim().replace(/\D/g, "");
      const link = $(element).next(".thumb").attr("href");
      const image = $(element).parent().next().attr("data-bg");
      
      if (rank && title && link) {
        anime.push({ rank, title, type, score, members, link, image });
      }
    });
    
    res.json(anime);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};