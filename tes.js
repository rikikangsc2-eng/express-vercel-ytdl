const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query parameter "q" is required' });
    }
    
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      }
    });
    
    const $ = cheerio.load(html);
    const initialStateScript = $('#initial-state').html();
    
    if (!initialStateScript) {
      return res.json({ success: false, error: 'Could not find initial state script on Spotify page. Structure might have changed.' });
    }
    
    let initialState;
    try {
      const decodedState = Buffer.from(initialStateScript, 'base64').toString('utf8');
      initialState = JSON.parse(decodedState);
    } catch (parseError) {
      return res.json({ success: false, error: 'Failed to decode or parse initial state data: ' + parseError.message });
    }
    
    const searchResultsRaw = initialState?.data?.searchV2?.searchData?.data;
    
    if (!searchResultsRaw) {
      return res.json({ success: false, error: 'Could not find search results within initial state data structure.' });
    }
    
    const results = {
      tracks: [],
      artists: [],
      albums: [],
      playlists: [],
      podcasts: [],
      episodes: [],
    };
    
    const processSection = (sectionData, type) => {
      if (!sectionData?.itemsV2) return [];
      return sectionData.itemsV2.map(itemWrapper => {
        const itemData = itemWrapper?.item?.data;
        if (!itemData || !itemData.uri || !itemData.name) return null;
        
        const uri = itemData.uri;
        const id = uri.split(':').pop();
        const typeName = itemData.__typename ? itemData.__typename.toLowerCase() : type;
        
        let extractedData = {
          id: id,
          type: typeName,
          name: itemData.name,
          uri: uri,
          link: `https://open.spotify.com/${typeName}/${id}`,
          image: null
        };
        
        let sources = null;
        if (itemData.albumOfTrack?.coverArt?.sources) {
          sources = itemData.albumOfTrack.coverArt.sources;
        } else if (itemData.coverArt?.sources) {
          sources = itemData.coverArt.sources;
        } else if (itemData.visuals?.avatarImage?.sources) {
          sources = itemData.visuals.avatarImage.sources;
        } else if (itemData.coverArtV2?.sources) { // Podcasts/Episodes might use this
          sources = itemData.coverArtV2.sources;
        }
        
        if (sources && sources.length > 0) {
          extractedData.image = sources.sort((a, b) => b.width - a.width)[0].url; // Get largest image
        }
        
        
        if (typeName === 'track' && itemData.artists?.items) {
          extractedData.artists = itemData.artists.items.map(a => ({ name: a.profile?.name, id: a.uri?.split(':').pop(), link: `https://open.spotify.com/artist/${a.uri?.split(':').pop()}` })).filter(a => a.id && a.name);
          extractedData.album = { name: itemData.albumOfTrack?.name, id: itemData.albumOfTrack?.uri?.split(':').pop(), link: `https://open.spotify.com/album/${itemData.albumOfTrack?.uri?.split(':').pop()}` };
        } else if (typeName === 'album' && itemData.artists?.items) {
          extractedData.artists = itemData.artists.items.map(a => ({ name: a.profile?.name, id: a.uri?.split(':').pop(), link: `https://open.spotify.com/artist/${a.uri?.split(':').pop()}` })).filter(a => a.id && a.name);
        } else if (typeName === 'playlist' && itemData.ownerV2?.data) {
          extractedData.owner = { name: itemData.ownerV2.data.name };
        } else if (typeName === 'podcast' && itemData.publisher?.name) {
          extractedData.publisher = itemData.publisher.name;
        } else if (typeName === 'episode' && itemData.podcastV2?.data) {
          extractedData.podcast = { name: itemData.podcastV2.data.name, id: itemData.podcastV2.data.uri?.split(':').pop(), link: `https://open.spotify.com/show/${itemData.podcastV2.data.uri?.split(':').pop()}` };
          extractedData.releaseDate = itemData.releaseDate?.isoString;
          extractedData.duration = itemData.duration?.totalMilliseconds;
        }
        
        
        return extractedData;
      }).filter(item => item !== null);
    };
    
    results.tracks = processSection(searchResultsRaw.tracks, 'track');
    results.artists = processSection(searchResultsRaw.artists, 'artist');
    results.albums = processSection(searchResultsRaw.albums, 'album');
    results.playlists = processSection(searchResultsRaw.playlists, 'playlist');
    results.podcasts = processSection(searchResultsRaw.podcasts, 'show'); // Spotify API often refers to podcasts as 'show'
    results.episodes = processSection(searchResultsRaw.episodes, 'episode');
    
    // Optionally extract top result if needed
    const topResultItem = searchResultsRaw.topResults?.itemsV2?.[0]?.item?.data;
    if (topResultItem) {
      const topResultProcessed = processSection({ itemsV2: [{ item: { data: topResultItem } }] }, topResultItem.__typename?.toLowerCase() || 'unknown');
      if (topResultProcessed.length > 0) {
        results.topResult = topResultProcessed[0];
      }
    }
    
    
    res.json({ success: true, data: results });
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        res.status(error.response.status).json({ success: false, error: `Spotify request failed: ${error.response.status} ${error.response.statusText}` });
      } else if (error.request) {
        res.status(504).json({ success: false, error: 'Spotify request made but no response received' });
      } else {
        res.status(500).json({ success: false, error: `Axios error: ${error.message}` });
      }
    }
    else {
      res.status(500).json({ success: false, error: `Server error: ${error.message}` });
    }
  }
};