const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL query parameter is required' });
  }
  
  const userAgent = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36';
  const referer = 'https://products.aspose.app/html/conversion/html-to-image';
  const baseApiUrl = 'https://api.products.aspose.app/html/api';
  
  try {
    const filesPayload = { fileUrl: url };
    const filesHeaders = {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': userAgent,
      'Referer': referer,
    };
    
    const filesResponse = await axios.post(`${baseApiUrl}/files`, filesPayload, { headers: filesHeaders });
    
    if (!filesResponse.data || !Array.isArray(filesResponse.data) || filesResponse.data.length === 0) {
      throw new Error('Failed to process URL in files API');
    }
    
    const fileInfo = filesResponse.data[0];
    
    const conversionPayload = {
      inputFormat: 'html',
      outputFormat: 'jpg',
      files: [fileInfo]
    };
    const conversionHeaders = {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
      'Referer': referer,
    };
    
    const startConversionResponse = await axios.post(`${baseApiUrl}/conversion`, conversionPayload, { headers: conversionHeaders });
    
    if (!startConversionResponse.data || !startConversionResponse.data.id) {
      throw new Error('Failed to start conversion');
    }
    
    const conversionId = startConversionResponse.data.id;
    let status = startConversionResponse.data.status;
    let conversionResult;
    let attempts = 0;
    const maxAttempts = 30; // Limit polling attempts (e.g., 30 attempts * 2 seconds = 60 seconds timeout)
    
    const checkHeaders = {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': userAgent,
      'Referer': referer,
    };
    
    while ((status === 'pending' || status === 'running') && attempts < maxAttempts) {
      await sleep(2000); // Wait 2 seconds before checking again
      attempts++;
      const statusResponse = await axios.get(`${baseApiUrl}/conversion?id=${conversionId}`, { headers: checkHeaders });
      if (!statusResponse.data) {
        throw new Error('Failed to get conversion status');
      }
      status = statusResponse.data.status;
      conversionResult = statusResponse.data;
    }
    
    if (status !== 'completed') {
      throw new Error(`Conversion failed or timed out. Status: ${status}`);
    }
    
    if (!conversionResult || !conversionResult.file || !conversionResult.file.hRef) {
      throw new Error('Conversion completed but no file reference found.');
    }
    
    const fileUri = conversionResult.file.hRef;
    const finalFileUrl = `${baseApiUrl}/files?uri=${encodeURIComponent(fileUri)}`;
    
    const imageResponse = await axios({
      method: 'get',
      url: finalFileUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': userAgent,
        'Referer': referer,
      }
    });
    
    res.setHeader('Content-Type', 'image/jpeg');
    imageResponse.data.pipe(res);
    
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error.response) {
      // Error from Axios request (API returned error)
      errorMessage = `API Error: ${error.response.status} ${error.response.statusText}. ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // Error from Axios request (no response received)
      errorMessage = `Network Error: No response received from API. ${error.message}`;
    } else {
      // Other errors (setup, logic, etc.)
      errorMessage = error.message;
    }
    // Set status code based on error type if possible, otherwise default to 500
    const statusCode = error.response ? error.response.status : (error.request ? 504 : 500);
    // Ensure status code is in valid range
    const finalStatusCode = (statusCode >= 400 && statusCode < 600) ? statusCode : 500;
    
    res.status(finalStatusCode).json({ success: false, error: errorMessage });
  }
};