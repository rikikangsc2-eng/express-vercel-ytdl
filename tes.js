const axios = require('axios');
const cheerio = require('cheerio');
const querystring = require('querystring');

module.exports = async (req, res) => {
  try {
    const { html, format = 'jpg', width = 1024, autoHeight = true, readability = true, blockAds = true } = req.query;
    
    if (!html) {
      return res.json({ success: false, error: 'Parameter "html" diperlukan' });
    }
    
    const initialUrl = 'https://pdfcrowd.com/html-to-image/#convert_by_input';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': initialUrl
    };
    
    const initialResponse = await axios.get(initialUrl, { headers });
    const $initial = cheerio.load(initialResponse.data);
    
    const csrfToken = $initial('input[name="csrfmiddlewaretoken"]').val();
    const ias = $initial('input[name="ias"]').val();
    
    if (!csrfToken || !ias) {
      return res.json({ success: false, error: 'Gagal mengambil token CSRF atau IAS dari halaman awal.' });
    }
    
    const postData = {
      csrfmiddlewaretoken: csrfToken,
      conversion_source: 'content',
      src: html,
      output_format: format,
      img_screenshot_width: width,
      img_auto_height: autoHeight ? 'on' : '',
      img_readability_enhancements: readability ? 'on' : '',
      img_block_ads: blockAds ? 'on' : '',
      ias: ias,
      _dontcare: ''
    };
    
    const postHeaders = {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest', // Pdfcrowd sering menggunakan ini untuk AJAX
      'Accept': 'text/html, */*; q=0.01', // Header Accept yang umum untuk XHR
      'Origin': 'https://pdfcrowd.com',
    };
    
    const convertUrl = 'https://pdfcrowd.com/form/pdf/convert/content/'; // Sesuaikan URL berdasarkan sumber input
    
    const convertResponse = await axios.post(convertUrl, querystring.stringify(postData), { headers: postHeaders });
    
    const $result = cheerio.load(convertResponse.data);
    
    const downloadLink = $result('.result-download').attr('href');
    const errorDetail = $result('.conv-error-pane .error-detail').text().trim();
    
    if (errorDetail) {
      return res.json({ success: false, error: `Pdfcrowd Error: ${errorDetail}` });
    }
    
    if (downloadLink) {
      const fullDownloadUrl = `https://pdfcrowd.com${downloadLink}`;
      res.json({ success: true, data: { downloadUrl: fullDownloadUrl } });
    } else {
      const progressVisible = $result('.conv-in-progress-pane').css('display') !== 'none';
      if (progressVisible) {
        return res.json({ success: false, error: 'Konversi masih berlangsung atau gagal memuat hasil. Coba lagi.' });
      }
      return res.json({ success: false, error: 'Gagal menemukan tautan unduhan dalam respons.' });
    }
    
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText}. ${error.message}`;
    }
    res.status(error.response?.status || 500).json({ success: false, error: errorMessage });
  }
};