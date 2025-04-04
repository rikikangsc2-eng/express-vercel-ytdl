const axios = require('axios'); const jsdom = require('jsdom'); const { JSDOM } = jsdom;

module.exports = async (req, res) => { try { const url = 'https://y2meta.tube/id1/'; const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36', 'Referer': url };

const response = await axios.get(url, { headers });
    const dom = new JSDOM(response.data);
    const form = dom.window.document.querySelector('#search-form');
    
    if (!form) {
        return res.json({ error: 'Form not found on the page' });
    }
    
    const formAction = form.action;
    const postUrl = new URL(formAction, url).href;
    
    const postData = new URLSearchParams();
    postData.append('query', 'https://youtu.be/-ktlIHSOOmk?si=fLKNk60e2dM4Dpdz');
    
    const postResponse = await axios.post(postUrl, postData.toString(), { headers });
    
    res.send(postResponse.data);
} catch (error) {
    res.json({ error: error.message });
}

};

