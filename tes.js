const axios = require('axios');

module.exports = async (req, res) => {
  const query = req.query.q || "Aku dah lupa tak ingat lagi"; // Gunakan query dari request atau default
  const limit = req.query.limit || "5";
  const offset = req.query.offset || "0";
  const numberOfTopResults = req.query.numberOfTopResults || "5";
  const type = 'track'; // Tipe pencarian adalah track
  
  // Ambil API Key dari environment variable jika ada, atau gunakan yang dari contoh (tidak disarankan untuk produksi)
  const apiKey = process.env.RAPIDAPI_KEY || "222ac7fb8bmsh0cb23acb6003932p1bfcadjsne797ba726a04";
  const apiHost = "spotify23.p.rapidapi.com";
  
  const options = {
    method: 'GET',
    url: `https://${apiHost}/search/`,
    params: {
      q: query,
      type: type,
      offset: offset,
      limit: limit,
      numberOfTopResults: numberOfTopResults
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': 'https://rapidapi.com/', // Referer umum saja
      'accept': 'application/json',
      // Header spesifik rapidapi mungkin tidak selalu diperlukan jika auth via x-rapidapi-key
      // 'csrf-token': 'vQJvxOzH-5-tV3_wCCSkJazzeYvu9UW3Hu6w',
      // 'rapid-client': 'hub-service',
      // 'x-correlation-id': '9fabae2f-88b8-4e7d-bbe0-f8251b2a6c2d',
      // 'x-rapidapi-ua': 'RapidAPI-Playground',
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost
    }
  };
  
  try {
    const response = await axios.request(options);
    res.json({ success: true, data: response.data });
  } catch (error) {
    // Tangani error dari axios, termasuk response error dari API
    const errorResponse = { success: false, error: error.message };
    if (error.response) {
      errorResponse.statusCode = error.response.status;
      errorResponse.details = error.response.data; // Sertakan detail error dari API jika ada
    }
    res.status(error.response?.status || 500).json(errorResponse);
  }
};