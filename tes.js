const { JSDOM } = require("jsdom"); const axios = require("axios"); const qs = require("querystring");

module.exports = async (req, res) => { try { let cookies = "";

const response = await axios.get("https://soundoftext.com/", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36",
            "Referer": "https://soundoftext.com/"
        }
    });
    
    if (response.headers["set-cookie"]) {
        cookies = response.headers["set-cookie"].join("; ");
    }
    
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const select = document.querySelector("select[name='voice']");
    const textarea = document.querySelector("textarea[name='text']");
    const submitButton = document.querySelector("input[type='submit']");
    
    if (!select || !textarea || !submitButton) {
        return res.json({ success: false, message: "Gagal menemukan elemen formulir" });
    }
    
    textarea.value = req.query.text || "Halo";
    select.value = "id-ID";
    
    submitButton.click();
    
    setTimeout(async () => {
        const newResponse = await axios.get("https://soundoftext.com/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36",
                "Referer": "https://soundoftext.com/",
                "Cookie": cookies
            }
        });
        
        const newDom = new JSDOM(newResponse.data);
        const newDocument = newDom.window.document;
        const downloadLink = newDocument.querySelector("a.card__action");
        
        if (downloadLink) {
            res.json({ success: true, url: downloadLink.href });
        } else {
            res.json({ success: false, message: "Gagal mendapatkan link download" });
        }
    }, 3000);
    
} catch (error) {
    res.json({ success: false, message: error.message });
}

};

