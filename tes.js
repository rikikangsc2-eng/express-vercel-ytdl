const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.json({ error: 'Missing URL parameter' });
    }

    const commonHeaders = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': 'https://edunity.fr/'
    };

    const initialResponse = await axios.get('https://edunity.fr/', {
      headers: {
        ...commonHeaders,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    const initialDom = new JSDOM(initialResponse.data);
    const form = initialDom.window.document.querySelector('form.search-form');
    if (!form) {
      return res.json({ error: 'Search form not found on initial page' });
    }

    const formAction = form.getAttribute('action');
    if (!formAction) {
      return res.json({ error: 'Search form action not found' });
    }

    const postUrl = new URL(formAction, 'https://edunity.fr/').href;
    const postResponse = await axios.post(postUrl, `q=${encodeURIComponent(url)}`, {
      headers: {
        ...commonHeaders,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    const postDom = new JSDOM(postResponse.data);
    const iframe = Array.from(postDom.window.document.querySelectorAll('iframe'))
      .find(frame => frame.src && frame.src.includes('mp3')); // Added check for frame.src existence

    if (!iframe || !iframe.src) { // Ensure iframe and its src exist
      return res.json({ error: 'MP3 iframe or iframe src not found' });
    }

    const iframeUrl = iframe.src;

    // Fetch content from the iframe source
    const iframeResponse = await axios.get(iframeUrl, {
        headers: commonHeaders // Use common headers, adjust if needed
    });

    // Parse the iframe's HTML content
    const iframeDom = new JSDOM(iframeResponse.data);

    // Find the download button link
    const downloadLinkElement = iframeDom.window.document.querySelector('a#downloadButton.progress-button'); // More specific selector based on HTML 

    if (!downloadLinkElement || !downloadLinkElement.href) {
      // Fallback or refined search if the primary selector fails
      // You might need to inspect the iframe content more closely if this still fails
      const alternativeLink = iframeDom.window.document.querySelector('#container a.progress-button'); // Example alternative
      if (!alternativeLink || !alternativeLink.href) {
          return res.json({ error: 'Download link not found inside the iframe content' });
      }
      res.send({ url: alternativeLink.href });

    } else {
       res.send({ url: downloadLinkElement.href });
    }


  } catch (error) {
    console.error('Error occurred:', error); // Log the error server-side for debugging
    res.status(500).json({ error: error.message }); // Send a 500 status for server errors
  }
};
