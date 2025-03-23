const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const getRandomCdn = async (initialHeaders) => {
      const response = await axios.get('https://media.savetube.me/api/random-cdn', {
        headers: initialHeaders,
      });
      return response.data.cdn;
    };
    
    const initialHeaders = {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Connection': 'keep-alive',
      'Host': 'media.savetube.me',
      'Origin': 'https://ytmp3.ski',
      'Referer': 'https://ytmp3.ski/',
      'Sec-Ch-Ua': '"Not A(Brand";v="8", "Chromium";v="132"',
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-Ua-Platform': '"Android"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
    };
    
    const cdn1 = await getRandomCdn(initialHeaders);
    
    const infoHeaders = {
      'authority': cdn1,
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'origin': 'https://ytmp3.ski',
      'referer': 'https://ytmp3.ski/',
      'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
    };
    
    const infoResponse = await axios.post(`https://${cdn1}/v2/info`, { url }, { headers: infoHeaders });
    
    if (!infoResponse.data || !infoResponse.data.data) {
      return res.status(404).json({ error: 'Data not found or invalid response from info API' });
    }
    
    // Ini bagian penting: decode/parse string 'data'
    let decodedInfo;
    try {
      //Coba decode Base64, lalu decode URI, kemudian parse sebagai JSON.
      decodedInfo = JSON.parse(decodeURIComponent(Buffer.from(infoResponse.data.data, 'base64').toString('utf8')));
      
    } catch (parseError) {
      console.error("Error parsing 'data' from infoResponse:", parseError);
      return res.status(500).json({ error: 'Failed to parse data from info API' });
    }
    
    
    const key = decodedInfo.qualityList?.[128]?.key;
    
    if (!key) {
      return res.status(404).json({ error: 'Key not found in qualityList' });
    }
    
    const cdn2 = await getRandomCdn(initialHeaders);
    
    const downloadHeaders = {
      'authority': cdn2,
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'origin': 'https://ytmp3.ski',
      'referer': 'https://ytmp3.ski/',
      'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
    };
    
    const downloadResponse = await axios.post(`https://${cdn2}/download`, {
      quality: '128',
      key: key, // Gunakan key yang didapat dari decodedInfo
      downloadType: 'audio',
    }, { headers: downloadHeaders, responseType: 'stream' });
    
    res.setHeader('Content-Type', 'audio/mpeg'); // Atau sesuaikan dengan jenis file yang diunduh
    downloadResponse.data.pipe(res);
    
  } catch (error) {
    console.error(error);
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = error.response.data.error || `API Error: ${error.response.status} - ${error.response.statusText}`;
        statusCode = error.response.status;
      } else if (error.request) {
        errorMessage = 'No response received from the server';
      }
    }
    res.status(statusCode).json({ error: errorMessage });
  }
};