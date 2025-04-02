const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({
      success: false,
      error: 'Parameter "url" diperlukan dalam query string.'
    });
  }
  
  try {
    // Validate URL format (basic check)
    new URL(targetUrl);
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: 'Format parameter "url" tidak valid.'
    });
  }
  
  const scrapeUrl = `https://www.tubeninja.net/welcome?url=${encodeURIComponent(targetUrl)}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
    'Referer': 'https://www.tubeninja.net/welcome',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br', // Axios handles decompression automatically
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"', // Example, adjust if needed
    'Sec-Ch-Ua-Mobile': '?1',
    'Sec-Ch-Ua-Platform': '"Android"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  };
  
  try {
    const response = await axios.get(scrapeUrl, {
      headers: headers,
      timeout: 15000 // Optional: add timeout in ms
    });
    
    if (response.status !== 200) {
      return res.status(response.status).json({
        success: false,
        error: `TubeNinja merespon dengan status code: ${response.status}`
      });
    }
    
    const html = response.data;
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const resultDiv = document.querySelector('#result');
    if (!resultDiv) {
      // Check if it's the main page asking for input again (maybe URL was invalid for tubeninja)
      const urlFormField = document.querySelector('#urlfield');
      if (urlFormField) {
        return res.status(404).json({
          success: false,
          error: 'TubeNinja tidak dapat memproses URL yang diberikan atau URL tidak valid/didukung.'
        });
      }
      // Otherwise, unknown structure
      return res.status(500).json({
        success: false,
        error: 'Gagal menemukan elemen #result pada halaman TubeNinja. Struktur mungkin telah berubah.'
      });
    }
    
    // Check for age restriction
    const agePrompt = resultDiv.querySelector('.age-prompt');
    if (agePrompt && !agePrompt.closest('.agelimit')?.classList.contains('hidden')) { // Check if agelimit class exists and is visible
      return res.status(403).json({
        success: false,
        error: 'Konten dibatasi usia. TubeNinja memerlukan interaksi manual untuk melanjutkan.'
      });
    }
    
    // --- Extract Data ---
    const titleElement = resultDiv.querySelector('h1.notopmargin');
    const title = titleElement ? titleElement.textContent.trim() : null;
    
    const thumbnailElement = resultDiv.querySelector('.col-sm-4 img.thumbnail');
    const thumbnail = thumbnailElement ? thumbnailElement.src : null;
    
    const descriptionElement = resultDiv.querySelector('.col-sm-8 .row > .col-sm-6.col-md-7 p');
    const description = descriptionElement ? descriptionElement.textContent.trim() : null;
    
    const downloadLinks = [];
    const linkElements = resultDiv.querySelectorAll('.list-group-item.list-group-item-action[download]');
    
    linkElements.forEach(el => {
      const url = el.href;
      const sizeElement = el.querySelector('small');
      const size = sizeElement ? sizeElement.textContent.trim() : null;
      
      // Attempt to extract quality/format description from text nodes
      let qualityFormat = '';
      el.childNodes.forEach(node => {
        if (node.nodeType === dom.window.Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text && text !== '|') { // Ignore empty text and simple separators
            qualityFormat += text + ' ';
          }
        }
      });
      // Further clean up common patterns if needed
      qualityFormat = qualityFormat.replace(/\s+/g, ' ').trim(); // Remove extra whitespace
      
      
      if (url) {
        downloadLinks.push({
          url: url,
          quality_format: qualityFormat || null, // Provide null if empty
          size: size
        });
      }
    });
    
    if (downloadLinks.length === 0 && !agePrompt) {
      // If no links and no age prompt, maybe it's a different kind of result or error
      const alertElement = document.querySelector('.alert.alert-danger');
      if (alertElement) {
        return res.status(404).json({
          success: false,
          error: `TubeNinja mengembalikan error: ${alertElement.textContent.trim()}`
        });
      }
      return res.status(404).json({
        success: false,
        error: 'Tidak ada link download yang dapat diekstrak dari halaman hasil TubeNinja.'
      });
    }
    
    res.json({
      success: true,
      data: {
        title: title,
        thumbnail: thumbnail,
        description: description,
        downloads: downloadLinks
      }
    });
    
  } catch (error) {
    console.error(`Error saat scraping ${scrapeUrl}:`, error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        success: false,
        error: `Gagal menghubungi TubeNinja: Server merespon dengan status ${error.response.status}`
      });
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      return res.status(504).json({
        success: false,
        error: 'Tidak ada respon dari server TubeNinja (Timeout atau masalah jaringan).'
      });
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      return res.status(502).json({
        success: false,
        error: `Tidak dapat terhubung ke host TubeNinja (${error.hostname}). Periksa koneksi jaringan atau nama domain.`
      });
    }
    else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({
        success: false,
        error: `Terjadi error saat memproses permintaan: ${error.message}`
      });
    }
  }
};