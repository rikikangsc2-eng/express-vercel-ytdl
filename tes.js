const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const initialUrl = 'https://samehadaku.care/';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
      'Referer': initialUrl,
      'Accept-Encoding': 'gzip, deflate, br', // Added for --compressed equivalent
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
    };
    
    const initialResponse = await axios.get(initialUrl, { headers });
    let $ = cheerio.load(initialResponse.data);
    
    let baseDomain = '';
    const logoLinkElement = $('a > img[src*="Samehadaku-Logo.png"]').parent();
    
    if (logoLinkElement.length > 0) {
      baseDomain = logoLinkElement.attr('href');
    } else {
      // Fallback attempt if the structure changes slightly, check redirects
      if (initialResponse.request.res.responseUrl && initialResponse.request.res.responseUrl !== initialUrl) {
        const urlObject = new URL(initialResponse.request.res.responseUrl);
        baseDomain = `${urlObject.protocol}//${urlObject.hostname}`;
      } else {
        // Try finding any link pointing to a potential samehadaku domain if logo method fails
        $('a[href*="samehadaku."]').each((i, el) => {
          const potentialDomain = $(el).attr('href');
          if (potentialDomain && potentialDomain.startsWith('https://')) {
            try {
              const urlObject = new URL(potentialDomain);
              if (urlObject.hostname.includes('samehadaku')) {
                baseDomain = `${urlObject.protocol}//${urlObject.hostname}`;
                return false; // Stop iteration
              }
            } catch (e) {
              // Ignore invalid URLs
            }
          }
        });
      }
    }
    
    
    if (!baseDomain || !baseDomain.startsWith('http')) {
      throw new Error('Could not determine the base domain from ' + initialUrl);
    }
    
    // Ensure baseDomain doesn't end with a slash for consistency
    if (baseDomain.endsWith('/')) {
      baseDomain = baseDomain.slice(0, -1);
    }
    
    
    const targetUrl = `${baseDomain}/anime-terbaru/`;
    headers.Referer = targetUrl; // Update Referer
    
    const animeResponse = await axios.get(targetUrl, { headers });
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
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};