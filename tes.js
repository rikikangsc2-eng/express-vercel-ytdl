 const axios = require('axios');
 const cheerio = require('cheerio');
 const { URLSearchParams } = require('url');
 
 module.exports = async (req, res) => {
   try {
     const { query } = req.query;
     
     if (!query) {
       return res.json({ success: false, error: "Parameter 'query' diperlukan" });
     }
     
     const initialUrl = 'https://ytmp3.ing/';
     const searchUrl = 'https://ytmp3.ing/search';
     const userAgent = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36';
     
     const initialResponse = await axios.get(initialUrl, {
       headers: {
         'User-Agent': userAgent,
         'Referer': initialUrl,
         'Accept-Encoding': 'gzip, deflate, br',
         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
       }
     });
     
     const $ = cheerio.load(initialResponse.data);
     const csrfToken = $('form.download-form input[name="csrfmiddlewaretoken"]').val();
     
     if (!csrfToken) {
       return res.json({ success: false, error: "Tidak dapat menemukan csrfmiddlewaretoken" });
     }
     
     const params = new URLSearchParams();
     params.append('csrfmiddlewaretoken', csrfToken);
     params.append('query', query);
     
     const searchResponse = await axios.post(searchUrl, params, {
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'User-Agent': userAgent,
         'Referer': initialUrl,
         'Accept-Encoding': 'gzip, deflate, br',
         'Accept': '*/*',
         'Origin': 'https://ytmp3.ing'
       }
     });
     
     res.json({ success: true, data: searchResponse.data });
     
   } catch (error) {
     let errorMessage = error.message;
     if (error.response) {
       errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
       
     } else if (error.request) {
       errorMessage = "Tidak ada respons dari server";
     }
     res.json({ success: false, error: errorMessage });
   }
 };