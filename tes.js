const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

async function getDownloadLink(videoId, tS, tH, cfToken, retries = 5, initialReferer) {
  if (retries <= 0) {
    throw new Error('Conversion timed out after multiple retries.');
  }
  
  const apiUrl = 'https://mp3api-d.ytjar.info/dl';
  const params = {
    id: videoId,
    s: tS,
    h: tH,
    t: '0'
  };
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
    'Referer': initialReferer, // Use the iframe URL as referer for the API call
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  if (cfToken && cfToken !== 'null') {
    headers['X-CFTOKEN'] = cfToken;
  }
  
  try {
    const response = await axios.get(apiUrl, { params, headers });
    const data = response.data;
    
    if (data.status === 'ok') {
      return data.link;
    } else if (data.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Wait slightly longer
      const nextToken = cfToken ? `${cfToken}.PROGRESS` : null; // Mimic client-side behavior if token exists
      return getDownloadLink(videoId, tS, tH, nextToken, retries - 1, initialReferer);
    } else if (data.status === 'fail') {
      if (data.msg === "Invalid Token" || data.msg === "Invalid Request") {
        throw new Error('Conversion failed: Invalid Token or Request (CAPTCHA may be required or parameters changed)');
      }
      throw new Error(`Conversion failed: ${data.msg || 'Unknown API error'}`);
    } else {
      throw new Error(`Unknown conversion status: ${data.status}`);
    }
  } catch (apiError) {
    if (apiError.response) {
      throw new Error(`API request failed with status ${apiError.response.status}: ${JSON.stringify(apiError.response.data) || apiError.message}`);
    } else if (apiError.request) {
      throw new Error(`API request failed: No response received. ${apiError.message}`);
    }
    throw new Error(`API request setup failed: ${apiError.message}`);
  }
}

module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ success: false, error: 'Missing, invalid, or non-HTTP URL parameter' });
    }
    
    const edunityBase = 'https://edunity.fr/';
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36';
    
    const initialResponse = await axios.get(edunityBase, {
      headers: { 'User-Agent': userAgent }
    });
    let $ = cheerio.load(initialResponse.data);
    
    const formAction = $('form.search-form').attr('action');
    if (!formAction) {
      return res.status(500).json({ success: false, error: 'Search form action not found on initial page' });
    }
    const postUrl = new URL(formAction, edunityBase).href;
    
    const postResponse = await axios.post(postUrl, `q=${encodeURIComponent(url)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent,
        'Referer': edunityBase
      },
      maxRedirects: 0, // Prevent automatic redirects if any
      validateStatus: function(status) {
        return status >= 200 && status < 400; // Accept redirects (3xx) as well if needed, but check location header later
      }
    });
    
    // Check for redirects manually if needed, or load the final page data
    $ = cheerio.load(postResponse.data);
    
    let iframeSrc = null;
    $('iframe').each((i, elem) => {
      const src = $(elem).attr('src');
      // Updated selector to be more specific based on observation or potential patterns
      if (src && (src.includes('/mp3/') || src.includes('ytjar.info') || src.includes('edunity.fr/embed/'))) {
        iframeSrc = src.startsWith('//') ? `https:${src}` : src; // Ensure protocol
        // Try to resolve relative URLs if necessary
        if (!iframeSrc.startsWith('http')) {
          try {
            iframeSrc = new URL(iframeSrc, postUrl).href;
          } catch (urlError) {
            iframeSrc = null; // Invalid relative URL
            return true; // Continue searching
          }
        }
        return false; // Stop iteration once found
      }
    });
    
    
    if (!iframeSrc) {
      return res.status(404).json({ success: false, error: 'MP3 iframe not found in search results' });
    }
    
    const iframeResponse = await axios.get(iframeSrc, {
      headers: {
        'User-Agent': userAgent,
        'Referer': postUrl // Referer is the page containing the iframe
      }
    });
    const iframeHtml = iframeResponse.data;
    
    const videoIdMatch = iframeHtml.match(/mp3Conversion\s*\(\s*['"]([^'"]+)['"]/);
    const tsMatch = iframeHtml.match(/window\.tS\s*=\s*['"]([^'"]+)['"]/);
    const thMatch = iframeHtml.match(/window\.tH\s*=\s*['"]([^'"]+)['"]/);
    const cfTokenMatch = iframeHtml.match(/window\.cfToken\s*=\s*(?:['"]([^'"]+)['"]|(null))/);
    
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    const tS = tsMatch ? tsMatch[1] : null;
    const tH = thMatch ? thMatch[1] : null;
    const cfToken = cfTokenMatch ? (cfTokenMatch[1] || cfTokenMatch[2]) : null; // Will be string token or literal 'null'
    
    
    if (!videoId || !tS || !tH) {
      let missing = [];
      if (!videoId) missing.push('videoId');
      if (!tS) missing.push('tS');
      if (!tH) missing.push('tH');
      return res.status(500).json({ success: false, error: `Could not extract required parameters from iframe: ${missing.join(', ')} missing` });
    }
    
    // Explicitly check if token is null, indicating potential CAPTCHA, but still attempt the call
    if (cfToken === 'null') {
      // Log this situation internally if needed, but don't fail immediately
      // Proceeding as the API might work without it sometimes, or fail gracefully later
    }
    
    
    const downloadLink = await getDownloadLink(videoId, tS, tH, cfToken, 5, iframeSrc); // Pass iframeSrc as referer
    
    res.json({ success: true, data: { downloadLink: downloadLink } });
    
  } catch (error) {
    const errorMessage = error.message || 'An unknown error occurred during scraping';
    const statusCode = (error.isAxiosError && error.response?.status) || res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
    // Avoid sending detailed internal stack traces or error objects
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};