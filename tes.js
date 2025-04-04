const axios = require('axios');
const { JSDOM } = require('jsdom');
const cheerio = require('cheerio');

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
        'X-CFTOKEN': cfToken,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36'
      }
    });
    
    const data = response.data;
    
    if (data.status === 'ok') {
      return data.link;
    } else if (data.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const nextCfToken = cfToken.endsWith('.PROGRESS') ? cfToken : cfToken + '.PROGRESS';
      return await fetchDownloadUrl(id, tS, tH, nextCfToken);
    } else if (data.status === "fail" && data.msg === "Invalid Token") {
      throw new Error('Invalid Cloudflare Token, retrying might be needed or token expired.');
    }
    else {
      throw new Error(data.msg || 'Failed to get download link from API');
    }
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
};


module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.json({ success: false, error: 'Missing URL parameter' });
    }
    
    const initialResponse = await axios.get('https://edunity.fr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://edunity.fr/'
      }
    });
    
    const initialDom = new JSDOM(initialResponse.data);
    const form = initialDom.window.document.querySelector('form.search-form');
    if (!form) {
      return res.json({ success: false, error: 'Search form not found on initial page' });
    }
    
    const formAction = form.getAttribute('action');
    if (!formAction) {
      return res.json({ success: false, error: 'Search form action not found' });
    }
    
    const postUrl = new URL(formAction, 'https://edunity.fr/').href;
    const postResponse = await axios.post(postUrl, `q=${encodeURIComponent(url)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://edunity.fr/'
      }
    });
    
    const postDom = new JSDOM(postResponse.data);
    const iframe = Array.from(postDom.window.document.querySelectorAll('iframe'))
      .find(frame => frame.src && frame.src.includes('mp3'));
    
    if (!iframe || !iframe.src) {
      return res.json({ success: false, error: 'MP3 iframe not found in search results' });
    }
    
    const iframeUrl = iframe.src;
    
    const iframeResponse = await axios.get(iframeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': postUrl
      }
    });
    const iframeHtml = iframeResponse.data;
    const $ = cheerio.load(iframeHtml);
    
    const cfTokenInput = $('input[name="cf-turnstile-response"]');
    const cfToken = cfTokenInput.val();
    if (!cfToken) {
      return res.json({ success: false, error: 'Cloudflare token not found in iframe' });
    }
    
    let videoId = null;
    let tS = null;
    let tH = null;
    
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent) {
        const mp3ConversionMatch = scriptContent.match(/mp3Conversion\(['"](.*?)['"],/);
        if (mp3ConversionMatch && mp3ConversionMatch[1]) {
          videoId = mp3ConversionMatch[1];
        }
        
        const tsMatch = scriptContent.match(/var\s+tS\s*=\s*['"](.*?)['"];/);
        if (tsMatch && tsMatch[1]) {
          tS = tsMatch[1];
        }
        const thMatch = scriptContent.match(/var\s+tH\s*=\s*['"](.*?)['"];/);
        if (thMatch && thMatch[1]) {
          tH = thMatch[1];
        }
      }
    });
    
    
    if (!videoId || !tS || !tH) {
      return res.json({ success: false, error: 'Could not extract required parameters (videoId, tS, tH) from iframe script' });
    }
    
    const downloadUrl = await fetchDownloadUrl(videoId, tS, tH, cfToken);
    
    res.json({ success: true, data: { downloadUrl: downloadUrl } });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};