const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  };
  
  try {
    const detailUrl = req.query.detail;
    const streamUrl = req.query.stream;
    
    if (detailUrl) {
      const headers = { ...commonHeaders, 'Referer': detailUrl };
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
      
    } else if (streamUrl) {
      const headers = { ...commonHeaders, 'Referer': streamUrl }; // Using streamUrl as Referer might be needed
      const response = await axios.get(streamUrl, { headers });
      const $ = cheerio.load(response.data);
      
      const iframeSrc = $('#player_embed .pframe iframe').attr('src');
      
      if (iframeSrc) {
        res.json({ success: true, data: { streamUrl: iframeSrc } });
      } else {
        res.json({ success: false, error: 'Stream iframe source not found' });
      }
      
    } else {
      const initialUrl = 'https://samehadaku.care/';
      let headers = { ...commonHeaders, 'Referer': initialUrl };
      
      const initialResponse = await axios.get(initialUrl, { headers, timeout: 15000 });
      let $ = cheerio.load(initialResponse.data);
      
      let baseDomain = '';
      const logoLinkElement = $('a > img[src*="Samehadaku-Logo.png"]').parent();
      
      if (logoLinkElement.length > 0) {
        baseDomain = logoLinkElement.attr('href');
      } else {
        const responseUrl = initialResponse.request?.res?.responseUrl;
        if (responseUrl && responseUrl !== initialUrl) {
          try {
            const urlObject = new URL(responseUrl);
            baseDomain = `${urlObject.protocol}//${urlObject.hostname}`;
          } catch (e) {
            // ignore parse error
          }
        }
        if (!baseDomain || !baseDomain.startsWith('http')) {
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
          throw new Error(`Could not determine the base domain from ${initialUrl} or response URL: ${initialResponse.request?.res?.responseUrl}`);
        }
        if (!baseDomain || !baseDomain.startsWith('http')) {
          throw new Error(`Could not determine the base domain from ${initialUrl}`);
        }
      }
      
      if (baseDomain.endsWith('/')) {
        baseDomain = baseDomain.slice(0, -1);
      }
      
      const targetUrl = `${baseDomain}/anime-terbaru/`;
      headers.Referer = baseDomain + '/';
      const animeResponse = await axios.get(targetUrl, { headers, timeout: 15000 });
      $ = cheerio.load(animeResponse.data);
      
      const animeList = [];
      $('ul li[itemscope][itemtype="http://schema.org/CreativeWork"]').each((index, element) => {
        const titleElement = $(element).find('.dtla h2.entry-title a');
        const title = titleElement.attr('title') || titleElement.text();
        const link = titleElement.attr('href');
        const image = $(element).find('.thumb a img.npws').attr('src');
        const episodeElement = $(element).find('.dtla span:contains("Episode")');
        const episode = episodeElement.text().replace(/Episode\s*/i, '').trim(); // More robust extraction
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
    let statusCode = 500; // Default status code
    
    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.message}`;
      statusCode = error.response.status;
    } else if (error.request) {
      errorMessage = `No response received: ${error.message}`;
      statusCode = 504; // Gateway Timeout might be appropriate
    } else if (error instanceof URIError || error.message.includes('Invalid URL')) {
      errorMessage = `Invalid URL provided: ${error.message}`;
      statusCode = 400; // Bad Request
    } else if (error.message.includes('Could not determine the base domain')) {
      errorMessage = error.message;
      statusCode = 500;
    }
    
    // Ensure status code is within the valid range
    if (statusCode < 400 || statusCode >= 600) {
      statusCode = 500;
    }
    
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};