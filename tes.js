const axios = require('axios');
const cheerio = require('cheerio');
const { Buffer } = require('buffer'); // Modul bawaan Node.js

module.exports = async (req, res) => {
  try {
    const { url: youtubeUrl } = req.query;

    if (!youtubeUrl) {
      return res.json({ success: false, error: "Parameter 'url' diperlukan" });
    }

    // Validasi sederhana untuk URL YouTube
    try {
      new URL(youtubeUrl);
      if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
         throw new Error('URL tidak valid');
      }
    } catch (e) {
       return res.json({ success: false, error: "Format URL YouTube tidak valid" });
    }


    const initialUrl = 'https://ytmp3.ing/';
    const audioApiUrl = 'https://ytmp3.ing/audio';
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36';

    const initialResponse = await axios.get(initialUrl, {
      headers: {
        'User-Agent': userAgent,
        'Referer': initialUrl,
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
      }
    });

    const $ = cheerio.load(initialResponse.data);
    const csrfToken = $('form.download-form input[name="csrfmiddlewaretoken"]').val();

    if (!csrfToken) {
      return res.json({ success: false, error: "Tidak dapat menemukan csrfmiddlewaretoken" });
    }

    const cookies = initialResponse.headers['set-cookie'];
    let cookieString = '';
    if (cookies) {
      cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    } else {
        return res.json({ success: false, error: "Tidak dapat menemukan cookie sesi" });
    }


    const audioApiResponse = await axios.post(audioApiUrl,
      { url: youtubeUrl }, // Payload sebagai JSON
      {
        headers: {
          'X-CSRFToken': csrfToken,
          'User-Agent': userAgent,
          'Referer': initialUrl,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': 'application/json, text/javascript, */*; q=0.01', // Accept JSON
          'Content-Type': 'application/json', // Content-Type JSON
          'Origin': 'https://ytmp3.ing',
          'Cookie': cookieString,
          'X-Requested-With': 'XMLHttpRequest' // Biasanya diperlukan untuk AJAX request
        }
      }
    );

    if (audioApiResponse.status !== 200 || typeof audioApiResponse.data !== 'object' || !audioApiResponse.data.url || !audioApiResponse.data.filename) {
        return res.json({ success: false, error: "Respons tidak valid dari API audio" });
    }

    const { url: encodedDownloadUrl, filename } = audioApiResponse.data;

    // Decode Base64 URL
    let decodedDownloadUrl;
    try {
        decodedDownloadUrl = Buffer.from(encodedDownloadUrl, 'base64').toString('utf-8');
    } catch (decodeError) {
        return res.json({ success: false, error: "Gagal mendekode URL download" });
    }

    // Pada titik ini, kita memiliki URL tunnel/proxy dan nama file.
    // Mengembalikan URL ini ke client adalah pendekatan yang paling stabil.
    // Mencoba request ke /download akan lebih kompleks karena bisa berupa stream atau redirect.
    res.json({
        success: true,
        data: {
            filename: filename,
            downloadUrl: decodedDownloadUrl // Ini adalah URL tunnel/proxy
            // Client dapat mengakses URL ini langsung untuk memulai download
        }
    });

  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText}. Data: ${JSON.stringify(error.response.data || {})}`;
    } else if (error.request) {
      errorMessage = "Tidak ada respons dari server ytmp3.ing";
    }
    res.status(500).json({ success: false, error: errorMessage });
  }
};