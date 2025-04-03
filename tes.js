const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const targetUrl = req.query.url || req.body.url || 'https://nirkyy.koyeb.app';
    
    const initialResponse = await axios.get('https://pdfcrowd.com/html-to-image/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://pdfcrowd.com/html-to-image/'
      }
    });
    
    const $ = cheerio.load(initialResponse.data);
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    const iasValue = $('input[name="ias"]').val();
    
    if (!csrfToken) {
      throw new Error('CSRF token not found');
    }
    if (iasValue === undefined || iasValue === null) {
      throw new Error('IAS value not found');
    }
    
    
    const payload = {
      "csrfmiddlewaretoken": csrfToken,
      "conversion_source": "uri",
      "src": targetUrl,
      "output_format": "jpg",
      "img_screenshot_width": "1024",
      "img_auto_height": "on",
      "img_block_ads": "on",
      "img_enable_remove_zindex": "off",
      "img_main_content_only": "off",
      "img_readability_enhancements": "on",
      "_dontcare": "",
      "ias": iasValue
    };
    
    const convertResponse = await axios.post('https://pdfcrowd.com/form/json/convert/uri/v2/', payload, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://pdfcrowd.com/html-to-image/',
        'Content-Type': 'application/json' // Based on the example payload structure
      }
    });
    
    if (convertResponse.data && convertResponse.data.uri) {
      convertResponse.data.result_url = `https://pdfcrowd.com${convertResponse.data.uri}`;
      convertResponse.data.result_inline_url = `https://pdfcrowd.com${convertResponse.data.inline_uri}`;
    }
    
    
    res.json({ success: true, data: convertResponse.data });
    
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
    }
    res.json({ success: false, error: errorMessage });
  }
};