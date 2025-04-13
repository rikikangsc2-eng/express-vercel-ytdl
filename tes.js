const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  const url = 'https://kuronime.biz/nonton-kamen-rider-gavv-episode-30/';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
    'Referer': 'https://kuronime.biz/nonton-kamen-rider-gavv-episode-30/#',
    'Accept-Encoding': 'gzip, deflate, br'
  };
  
  try {
    const response = await axios.get(url, { headers: headers, responseType: 'text' });
    
    if (response.status !== 200) {
      return res.status(response.status).json({ error: `Failed to fetch URL: ${response.statusText}` });
    }
    const html = response.data;
    
    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true
    });
    
    await new Promise(resolve => {
      let resolved = false;
      const resolveOnce = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      dom.window.addEventListener('load', resolveOnce);
      setTimeout(resolveOnce, 5000);
    });
    
    const document = dom.window.document;
    const data = {};
    
    data.title = document.querySelector('h1.entry-title')?.textContent.trim() || null;
    data.episode = document.querySelector('span.epx')?.textContent.trim() || null;
    data.updated_date = document.querySelector('span.updated')?.textContent.trim() || null;
    
    const seriesLinkElement = document.querySelector('span.year a');
    data.series_info = {
      name: seriesLinkElement?.textContent.trim() || null,
      link: seriesLinkElement?.href || null,
    };
    
    const iframeElement = document.querySelector('iframe#iframedc');
    data.video_source = iframeElement?.src || null;
    if ((!data.video_source || data.video_source === 'about:blank') && iframeElement?.dataset.src) {
      data.video_source = iframeElement.dataset.src;
    }
    
    const thumbElement = document.querySelector('div.tb img');
    data.thumbnail = thumbElement?.dataset.src || thumbElement?.src || null;
    
    data.description = document.querySelector('div.bixbox.infx')?.textContent.trim() || null;
    
    data.download_links = [];
    let downloadContainer = document.querySelector('#linksDDLContainer');
    if (!downloadContainer || downloadContainer.children.length === 0) {
      downloadContainer = document.querySelector('div.soraddl');
    }
    const downloadLinkElements = downloadContainer ? downloadContainer.querySelectorAll('a') : [];
    downloadLinkElements.forEach(node => {
      const linkText = node.textContent.trim();
      const linkHref = node.href;
      if (linkText && linkHref && linkHref !== '#' && !linkHref.startsWith('javascript:')) {
        data.download_links.push({
          text: linkText,
          url: linkHref
        });
      }
    });
    
    data.recommendations = [];
    const recommendationElements = document.querySelectorAll('div.listupd article.bs');
    recommendationElements.forEach(node => {
      const titleElement = node.querySelector('h4');
      const linkElement = node.querySelector('a');
      const imgElement = node.querySelector('div.limit img');
      
      const recTitle = titleElement?.textContent.trim() || null;
      const recLink = linkElement?.href || null;
      const recThumb = imgElement?.dataset.src || imgElement?.src || null;
      
      if (recTitle && recLink) {
        data.recommendations.push({
          title: recTitle,
          link: recLink,
          thumbnail: recThumb
        });
      }
    });
    
    res.json(data);
    
  } catch (error) {
    console.error('Scraping Error:', error);
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
};