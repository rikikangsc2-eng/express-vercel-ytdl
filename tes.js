const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.json({ success: false, error: 'URL parameter is required' });
    }
    
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36';
    const referer = 'https://saveinsta.cc/id/unduh-youtube';
    
    const tokenResponse = await axios.get('https://saveinsta.cc/api/get-token', {
      headers: {
        'User-Agent': userAgent,
        'Referer': referer
      }
    });
    
    const csrfToken = tokenResponse.data.csrfToken;
    if (!csrfToken) {
      throw new Error('Failed to retrieve CSRF token');
    }
    
    const analyzePayload = {
      q: url,
      moduleType: 'ytdl',
      action: 'analyzeYT',
      clientId: 'UgrqLVrToqEbXRf_eD8u' // Static based on example
    };
    
    const analyzeResponse = await axios.post('https://saveinsta.cc/api/yt/analyze', analyzePayload, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'sc-token': csrfToken,
        'User-Agent': userAgent,
        'Referer': referer
      }
    });
    
    if (analyzeResponse.data.code && analyzeResponse.data.code !== 204) {
      throw new Error(`Analyze API Error (${analyzeResponse.data.code}): ${analyzeResponse.data.message || 'Unknown error during analysis'}`);
    }
    
    const trackId = analyzeResponse.data.trackId;
    const cdn = analyzeResponse.data.cdn;
    
    if (!trackId || !cdn) {
      throw new Error('Failed to get trackId or cdn from analyze response');
    }
    
    const getVideoInfoPayload = {
      q: url,
      moduleType: 'ytdl',
      action: 'GetDataYT',
      trackId: trackId,
      cdn: cdn
    };
    
    const videoInfoResponse = await axios.post('https://saveinsta.cc/api/yt/getvideoinfo', getVideoInfoPayload, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'sc-token': csrfToken,
        'User-Agent': userAgent,
        'Referer': referer
      }
    });
    
    res.json({ success: true, data: videoInfoResponse.data });
    
  } catch (error) {
    let errorMessage = error.message;
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = `API Error: ${error.response.data.message}`;
    } else if (error.response && error.response.statusText) {
      errorMessage = `HTTP Error: ${error.response.status} ${error.response.statusText}`;
    }
    res.json({ success: false, error: errorMessage });
  }
};