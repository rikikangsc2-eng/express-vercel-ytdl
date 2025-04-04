const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const detailUrl = req.query.detail;
    
    if (detailUrl) {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': detailUrl,
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
      };
      
      const response = await axios.get(detailUrl, { headers });
      const $ = cheerio.load(response.data);
      
      const details = {};
      const infox = $('.infox');
      details.title = infox.find('h3.anim-detail').text().replace('Detail Anime ', '').trim();
      
      infox.find('.spe span').each((i, el) => {
        const spanText = $(el).text().trim();
        const keyText = $(el).find('b').text().trim();
        let valueText = spanText.replace(keyText, '').trim();
        
        if (keyText) {
          const key = keyText.toLowerCase().replace(':', '').trim();
          const linkElement = $(el).find('a');
          if (linkElement.length > 0) {
            details[key] = {
              text: linkElement.text().trim(),
              link: linkElement.attr('href')
            };
          } else {
            details[key] = valueText;
          }
        } else if (spanText.includes(':')) { 
          const parts = spanText.split(':');
          if (parts.length > 1) {
            const key = parts[0].toLowerCase().trim();
            details[key] = parts[1].trim();
          }
        }
      });
      
      const episodes = [];
      $('ul li:has(.epsright):has(.epsleft)').each((index, element) => {
        const episodeNumber = $(element).find('.epsright .eps a').text().trim();
        const episodeLink = $(element).find('.epsright .eps a').attr('href');
        const episodeTitle = $(element).find('.epsleft .lchx a').text().trim();
        const episodeDate = $(element).find('.epsleft .date').text().trim();
        
        if (episodeNumber && episodeLink && episodeTitle && episodeDate) {
          episodes.push({
            number: episodeNumber,
            link: episodeLink,
            title: episodeTitle,
            date: episodeDate,
          });
        }
      });
      
      
      res.json({ success: true, data: { details, episodes } });
      
    } else {
      const initialUrl = 'https://samehadaku.care/';
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': initialUrl,
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
      };
      
      const initialResponse = await axios.get(initialUrl, { headers, timeout: 15000 });
      let $ = cheerio.load(initialResponse.data);
      
      let baseDomain = '';
      const logoLinkElement = $('a > img[src*="Samehadaku-Logo.png"]').parent();
      
      if (logoLinkElement.length > 0) {
        baseDomain = logoLinkElement.attr('href');
      } else {
        if (initialResponse.request?.res?.responseUrl && initialResponse.request.res.responseUrl !== initialUrl) {
          const urlObject = new URL(initialResponse.request.res.responseUrl);
          baseDomain = `${urlObject.protocol}//${urlObject.hostname}`;
        } else {
          $('a[href*="samehadaku."]').each((i, el) => {
            const potentialDomain = $(el).attr('href');
            if (potentialDomain && potentialDomain.startsWith('https://')) {
              try {
                const urlObject = new URL(potentialDomain);
                if (urlObject.hostname.includes('samehadaku')) {
                  baseDomain = `${urlObject.protocol}//${urlObject.hostname}`;
                  return false;
                }
              } catch (e) {
                // Ignore invalid URLs
              }
            }
          });
        }
      }
      
      
      if (!baseDomain || !baseDomain.startsWith('http')) {
        try {
          const urlObject = new URL(initialResponse.request?.res?.responseUrl || initialUrl);
          baseDomain = `${urlObject.protocol}//${urlObject.hostname}`;
        } catch (e) {
          throw new Error('Could not determine the base domain from ' + initialUrl + ' and response URL.');
        }
        if (!baseDomain || !baseDomain.startsWith('http')) {
          throw new Error('Could not determine the base domain from ' + initialUrl);
        }
      }
      
      if (baseDomain.endsWith('/')) {
        baseDomain = baseDomain.slice(0, -1);
      }
      
      
      const targetUrl = `${baseDomain}/anime-terbaru/`;
      headers.Referer = baseDomain + '/'; // Set Referer to base domain for this request
      const animeResponse = await axios.get(targetUrl, { headers, timeout: 15000 });
      $ = cheerio.load(animeResponse.data);
      
      const animeList = [];
      $('ul li[itemscope][itemtype="http://schema.org/CreativeWork"]').each((index, element) => {
        const titleElement = $(element).find('.dtla h2.entry-title a');
        const title = titleElement.attr('title') || titleElement.text();
        const link = titleElement.attr('href');
        const image = $(element).find('.thumb a img.npws').attr('src');
        const episode = $(element).find('.dtla span:contains("Episode") author').text().trim();
        const released = $(element).find('.dtla span:contains("Released on")').text().replace('Released on:', '').trim();
        
        if (title && link && image && episode && released) {
          animeList.push({
            title,
            link,
            image,
            episode,
            released,
          });
        }
      });
      
      res.json({ success: true, data: animeList });
    }
    
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.message}`;
    } else if (error.request) {
      errorMessage = `No response received: ${error.message}`;
    }
    res.status(500).json({ success: false, error: errorMessage });
  }
};