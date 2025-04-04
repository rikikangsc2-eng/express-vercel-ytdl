const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url'); // Built-in Node.js module

const fetchDownloadUrl = async (id, tS, tH, cfToken) => {
  try {
    const apiUrl = 'https://mp3api-d.ytjar.info/dl';
    const response = await axios.get(apiUrl, {
      params: {
        id: id,
        s: tS,
        h: tH,
        t: '0'
      },
      headers: {
        'X-CFTOKEN': cfToken || '', // Pass token, even if null/placeholder
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Accept': '*/*',
        'Referer': `https://mp3api.ytjar.info/iframe/?vid=${id}` // Example referer, might need adjustment
      }
    });
    
    const data = response.data;
    
    if (data.status === 'ok') {
      return data.link;
    } else if (data.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Wait slightly longer
      const nextCfToken = cfToken && cfToken.endsWith('.PROGRESS') ? cfToken : (cfToken || '') + ".PROGRESS";
      return await fetchDownloadUrl(id, tS, tH, nextCfToken);
    } else if (data.status === "fail" && data.msg === "Invalid Token") {
      throw new Error('Invalid Cloudflare Token provided to API');
    } else {
      throw new Error(data.msg || 'API returned status "fail" or unknown status');
    }
  } catch (error) {
    let message = `API request failed: ${error.message}`;
    if (error.response && error.response.data && error.response.data.msg) {
      message += ` - API Message: ${error.response.data.msg}`;
    } else if (error.response && error.response.status) {
      message += ` - Status: ${error.response.status}`;
    }
    throw new Error(message);
  }
};


module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.json({ success: false, error: 'Missing URL parameter' });
    }
    
    const baseHeaders = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': 'https://edunity.fr/'
    };
    
    const initialResponse = await axios.get('https://edunity.fr/', { headers: baseHeaders });
    
    const $initial = cheerio.load(initialResponse.data);
    const form = $initial('form.search-form');
    if (!form.length) {
      return res.json({ success: false, error: 'Search form not found on initial page' });
    }
    
    const formAction = form.attr('action');
    if (!formAction) {
      return res.json({ success: false, error: 'Search form action not found' });
    }
    
    const postUrl = new URL(formAction, 'https://edunity.fr/').href;
    const postResponse = await axios.post(postUrl, `q=${encodeURIComponent(url)}`, {
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://edunity.fr/' // Referer for the POST is the initial page
      }
    });
    
    const $post = cheerio.load(postResponse.data);
    const iframe = $post('iframe[src*="mp3"]');
    
    if (!iframe.length || !iframe.attr('src')) {
      return res.json({ success: false, error: 'MP3 iframe element or src not found in search results' });
    }
    
    const iframeUrl = iframe.attr('src');
    if (!iframeUrl.startsWith('http')) {
      // Handle relative iframe URLs if necessary, though seems unlikely here
      return res.json({ success: false, error: `Invalid iframe src found: ${iframeUrl}` });
    }
    
    
    const iframeResponse = await axios.get(iframeUrl, {
      headers: {
        ...baseHeaders,
        'Referer': postUrl // Referer is the page containing the iframe
      }
    });
    const iframeHtml = iframeResponse.data;
    const $iframe = cheerio.load(iframeHtml);
    
    const cfTokenInput = $iframe('input[name="cf-turnstile-response"]');
    
    if (!cfTokenInput.length) {
      return res.json({ success: false, error: 'Cloudflare token input element (cf-turnstile-response) not found in iframe HTML.' });
    }
    
    const cfTokenStaticValue = cfTokenInput.val() || null; // Get static value, likely placeholder
    
    let videoId = null;
    let tS = null;
    let tH = null;
    
    $iframe('script').each((index, element) => {
      const scriptContent = $iframe(element).html();
      if (scriptContent) {
        if (!videoId) {
          const videoIdMatch = scriptContent.match(/mp3Conversion\s*\(\s*['"]([^'"]+)['"]/);
          if (videoIdMatch && videoIdMatch[1]) {
            videoId = videoIdMatch[1];
          }
        }
        if (!tS) {
          const tsMatch = scriptContent.match(/(?:window\.|var\s+)tS\s*=\s*['"]([^'"]+)['"]/);
          if (tsMatch && tsMatch[1]) {
            tS = tsMatch[1];
          }
        }
        if (!tH) {
          const thMatch = scriptContent.match(/(?:window\.|var\s+)tH\s*=\s*['"]([^'"]+)['"]/);
          if (thMatch && thMatch[1]) {
            tH = thMatch[1];
          }
        }
      }
    });
    
    if (!videoId || tS === null || tH === null) { // Check for null explicitly as they might be empty strings
      const missing = [];
      if (!videoId) missing.push('videoId');
      if (tS === null) missing.push('tS');
      if (tH === null) missing.push('tH');
      return res.json({ success: false, error: `Could not extract required parameters (${missing.join(', ')}) from iframe script using static analysis.` });
    }
    
    try {
      const downloadUrl = await fetchDownloadUrl(videoId, tS, tH, cfTokenStaticValue);
      res.json({ success: true, data: { downloadUrl: downloadUrl } });
    } catch (apiError) {
      let errorMessage = `API call failed: ${apiError.message}.`;
      if (apiError.message.includes('Invalid Token') || apiError.message.includes('Cloudflare')) {
        errorMessage += " This usually means the Cloudflare Turnstile challenge could not be solved by static scraping.";
      }
      res.json({ success: false, error: errorMessage });
    }
    
  } catch (error) {
    let detailedError = `General error: ${error.message}`;
    if (error.response) {
      detailedError += ` (Status: ${error.response.status})`;
    } else if (error.request) {
      detailedError += ` (No response received)`;
    }
    res.json({ success: false, error: detailedError });
  }
};