const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const url = "https://pdfcrowd.com/html-to-image/#convert_by_input";
    const apiUrl = "https://pdfcrowd.com/form/json/convert/html/v2/";
    
    const initialResponse = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36"
      }
    });
    
    const cookies = initialResponse.headers["set-cookie"];
    
    const $ = cheerio.load(initialResponse.data);
    const csrftoken = $("input[name='csrfmiddlewaretoken']").val();
    const ias = Math.floor(Math.random() * 1e10).toString();
    
    if (!csrftoken) {
      return res.status(500).json({ error: "CSRF token not found" });
    }
    
    console.log("CSRF Token:", csrftoken);
    
    const postData = new URLSearchParams({
      csrfmiddlewaretoken: csrftoken,
      conversion_source: "content",
      src: "<html>\n <body>\n Hello World!\n </body>\n</html>\n",
      output_format: "jpg",
      img_screenshot_width: "1024",
      img_auto_height: "on",
      img_block_ads: "on",
      img_enable_remove_zindex: "off",
      img_main_content_only: "off",
      img_readability_enhancements: "on",
      _dontcare: "",
      ias: ias
    });
    
    const headers = {
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookies ? cookies.join("; ") : ""
    };
    
    const screenshotResponse = await axios.post(apiUrl, postData.toString(), { headers });
    
    if (screenshotResponse.data && screenshotResponse.data.status === "ok") {
      return res.json({
        success: true,
        image_url: `https://pdfcrowd.com${screenshotResponse.data.uri}`,
        inline_url: `https://pdfcrowd.com${screenshotResponse.data.inline_uri}`,
        demo: screenshotResponse.data.demo,
        apiVersion: screenshotResponse.data.apiVersion
      });
    } else {
      return res.status(500).json({ error: "Failed to generate screenshot", details: screenshotResponse.data });
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};