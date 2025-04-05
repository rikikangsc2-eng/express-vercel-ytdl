const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({ success: false, error: 'Parameter query (q) diperlukan' });
    }
    
    const searchResponse = await axios.get('https://nirkyy.koyeb.app/api/v1/youtube-search', {
      params: { query }
    });
    
    if (!searchResponse.data || !searchResponse.data.success || !Array.isArray(searchResponse.data.data)) {
      return res.json({ success: false, error: 'Gagal melakukan pencarian YouTube atau format respons tidak valid' });
    }
    
    const videos = searchResponse.data.data;
    
    const filteredVideos = videos.filter(video => {
      if (!video.duration || typeof video.duration !== 'string') {
        return false;
      }
      const parts = video.duration.split(':');
      if (parts.length < 2 || parts.length > 3) {
        return false;
      }
      let durationInSeconds = 0;
      if (parts.length === 3) { // HH:MM:SS
        durationInSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      } else { // MM:SS
        durationInSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
      return !isNaN(durationInSeconds) && durationInSeconds < 600; // Kurang dari 10 menit (600 detik)
    });
    
    if (filteredVideos.length === 0) {
      return res.json({ success: false, error: 'Tidak ada video ditemukan dengan durasi di bawah 10 menit' });
    }
    
    const targetUrl = filteredVideos[0].url;
    
    const saveTubeResponse = await axios.get('https://nirkyy.koyeb.app/api/v1/savetube', {
      params: {
        url: targetUrl,
        format: 'mp3'
      }
    });
    
    if (!saveTubeResponse.data || !saveTubeResponse.data.success || !saveTubeResponse.data.data || !saveTubeResponse.data.data.download) {
      return res.json({ success: false, error: 'Gagal mendapatkan link download dari Savetube atau format respons tidak valid' });
    }
    
    const downloadUrl = saveTubeResponse.data.data.download;
    const audioTitle = saveTubeResponse.data.data.title || 'audio';
    
    const audioStreamResponse = await axios.get(downloadUrl, {
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', 'audio/mpeg');
    audioStreamResponse.data.pipe(res);
    
    audioStreamResponse.data.on('error', (streamError) => {
      if (!res.headersSent) {
        res.json({ success: false, error: `Error saat streaming audio: ${streamError.message}` });
      } else {
        // Jika header sudah terkirim, kita tidak bisa mengirim JSON lagi
        // Cukup log error di server jika perlu, atau coba akhiri response
        console.error('Stream error after headers sent:', streamError);
        res.end();
      }
    });
    
    res.on('close', () => {
      // Hentikan stream jika koneksi client ditutup
      if (audioStreamResponse.data && typeof audioStreamResponse.data.destroy === 'function') {
        audioStreamResponse.data.destroy();
      }
    });
    
    
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan internal';
    if (error.response) {
      errorMessage = `Error dari API: ${error.response.status} - ${JSON.stringify(error.response.data) || error.message}`;
    } else if (error.request) {
      errorMessage = `Tidak ada respons diterima: ${error.message}`;
    } else {
      errorMessage = `Error konfigurasi request: ${error.message}`;
    }
    if (!res.headersSent) {
      res.json({ success: false, error: errorMessage });
    } else {
      console.error('Error after headers sent:', error);
    }
  }
};