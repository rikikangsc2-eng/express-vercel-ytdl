const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  const url = 'https://codebeautify.org/javascript-obfuscator';
  const inputData = 'const contoh = \'contoh\'';
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User -Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': url
      }
    });
    
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const inputElement = document.querySelector('.ace_content');
    inputElement.textContent = inputData;
    
    const formData = new URLSearchParams();
    formData.append('input', inputElement.textContent);
    
    const obfuscateResponse = await axios.post(url, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User -Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'Referer': url
      }
    });
    
    const outputDom = new JSDOM(obfuscateResponse.data);
    const output = outputDom.window.document.querySelector('.ace_content').innerHTML;
    
    res.send(output);
  } catch (error) {
    res.status(500).send('An Error Was Encountered');
  }
};