const axios = require('axios'); 
const jsdom = require('jsdom'); const { JSDOM } = jsdom;

module.exports = async (req, res) => { try { const response = await axios.get('https://musicaldown.com/id', { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36', 'Referer': 'https://musicaldown.com/id' } });

const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const form = document.querySelector('#submit-form');
    if (!form) return res.status(500).send('Form not found');
    
    const _fix = document.querySelector('input[name="_fix"]').value;
    const _bEqyS = document.querySelector('input[name="_bEqyS"]').value;
    const verify = document.querySelector('input[name="verify"]').value;
    
    const postResponse = await axios.post('https://musicaldown.com/id/download', new URLSearchParams({
        _fix,
        _bEqyS,
        verify,
        link_url: "https://vm.tiktok.com/ZSjBQ6t9g/"
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
            'Referer': 'https://musicaldown.com/id'
        }
    });
    
    const postDom = new JSDOM(postResponse.data);
    const downloadLink = postDom.window.document.querySelector('a.btn');
    
    if (downloadLink) {
        res.redirect(downloadLink.href);
    } else {
        res.status(500).send('Download link not found');
    }
} catch (error) {
    res.status(500).send('Error occurred');
}

};