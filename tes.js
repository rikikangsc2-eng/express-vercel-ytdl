// Import library yang dibutuhkan
const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  // 1. Ambil URL input dari query parameter
  const inputUrl = req.query.url;
  
  // Validasi input URL
  if (!inputUrl) {
    return res.status(400).json({ success: false, error: 'Parameter url diperlukan dalam query string.' });
  }
  
  try {
    // 2. Buat URL target untuk TubeNinja
    // Gunakan encodeURIComponent untuk memastikan URL input aman digunakan sebagai query parameter
    const targetUrl = `https://www.tubeninja.net/id/welcome?url=${encodeURIComponent(inputUrl)}`;
    
    // 3. Lakukan request GET ke TubeNinja menggunakan axios
    const response = await axios.get(targetUrl, {
      headers: {
        // Gunakan header yang sama seperti contoh curl untuk meniru browser
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
        'Referer': 'https://www.tubeninja.net/welcome',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br', // Biarkan axios menangani dekompresi
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 20000 // Tambahkan timeout (misal: 20 detik)
    });
    
    // 4. Parse HTML response menggunakan JSDOM
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // 5. Cari elemen utama yang berisi hasil
    const resultDiv = document.querySelector('#result');
    if (!resultDiv) {
      return res.status(404).json({ success: false, error: 'Konten hasil tidak ditemukan di halaman. URL mungkin tidak valid atau tidak didukung.' });
    }
    
    const movieDiv = resultDiv.querySelector('.row.movie');
    // Jika tidak ada div movie, cek pesan error umum dari TubeNinja
    if (!movieDiv) {
      const alertInfo = resultDiv.querySelector('.alert.alert-info');
      let errorMessage = 'Detail video tidak ditemukan di bagian hasil. Pastikan URL benar dan didukung.';
      if (alertInfo && alertInfo.textContent.includes('tidak dapat menemukan video apa pun')) {
        errorMessage = 'TubeNinja tidak dapat menemukan video dari URL yang diberikan.';
      } else if (alertInfo && alertInfo.textContent.includes('mendukung situs web ini')) {
        errorMessage = 'TubeNinja tidak mendukung pengunduhan dari situs web ini.';
      }
      return res.status(404).json({ success: false, error: errorMessage });
    }
    
    // 6. Ekstrak informasi yang dibutuhkan
    const titleElement = movieDiv.querySelector('.col-sm-8 h1.notopmargin');
    const title = titleElement ? titleElement.textContent.trim() : null;
    
    const thumbnailElement = movieDiv.querySelector('.col-sm-4 img.thumbnail');
    const thumbnail = thumbnailElement ? thumbnailElement.src : null;
    
    let duration = null;
    const durationIcon = movieDiv.querySelector('.col-sm-4 b i.fa-clock');
    if (durationIcon && durationIcon.parentElement.nextSibling && durationIcon.parentElement.nextSibling.nodeType === dom.window.Node.TEXT_NODE) {
      duration = durationIcon.parentElement.nextSibling.textContent.trim();
    }
    
    let views = null;
    const viewsIcon = movieDiv.querySelector('.col-sm-4 span.float-right b i.fa-eye');
    if (viewsIcon && viewsIcon.parentElement.nextSibling && viewsIcon.parentElement.nextSibling.nodeType === dom.window.Node.TEXT_NODE) {
      views = viewsIcon.parentElement.nextSibling.textContent.trim();
    }
    
    // Jika judul atau thumbnail tidak ditemukan, anggap gagal
    if (!title || !thumbnail) {
      return res.status(500).json({ success: false, error: 'Gagal mengekstrak detail penting (judul/thumbnail). Struktur halaman mungkin telah berubah.' });
    }
    
    
    const downloadLinks = [];
    const linkElements = movieDiv.querySelectorAll('.list-group a.list-group-item-action[download]');
    
    linkElements.forEach(link => {
      const url = link.href;
      const sizeElement = link.querySelector('small');
      const size = sizeElement ? sizeElement.textContent.trim() : null;
      
      let formatQuality = '';
      const iconElement = link.querySelector('i.fa-fw');
      if (iconElement) {
        let currentNode = iconElement.nextSibling;
        while (currentNode) {
          if (currentNode.nodeType === dom.window.Node.TEXT_NODE) { // Cari text node
            formatQuality += currentNode.textContent.trim();
          } else if (currentNode.nodeName === 'SMALL' || currentNode.nodeName === 'BUTTON') {
            break; // Berhenti jika bertemu tag <small> atau <button>
          }
          currentNode = currentNode.nextSibling;
        }
      }
      formatQuality = formatQuality.replace('|', '').trim() || 'Unknown'; // Bersihkan dan beri default
      
      if (url) {
        downloadLinks.push({
          url: url,
          formatQuality: formatQuality, // Menggabungkan format dan kualitas jika ada
          size: size
        });
      }
    });
    
    if (downloadLinks.length === 0) {
      return res.status(404).json({ success: false, error: 'Tidak ada tautan unduhan video (.mp4) yang ditemukan.' });
    }
    
    // 7. Kirim response JSON dengan data yang berhasil diekstrak
    res.status(200).json({
      success: true,
      data: {
        title: title,
        thumbnail: thumbnail,
        duration: duration,
        views: views,
        downloadLinks: downloadLinks
      }
    });
    
  } catch (error) {
    // Tangani berbagai jenis error
    console.error("Scraping Error:", error.message); // Log error detail di server
    let errorMessage = 'Terjadi kesalahan internal saat memproses permintaan Anda.';
    let statusCode = 500;
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorMessage = 'Permintaan ke TubeNinja timeout. Silakan coba lagi nanti.';
      statusCode = 504; // Gateway Timeout
    } else if (error.response) {
      // Error dari respons axios (misal: status 4xx, 5xx dari TubeNinja)
      errorMessage = `TubeNinja merespons dengan status error: ${error.response.status}. URL mungkin tidak valid atau ada masalah di sisi TubeNinja.`;
      statusCode = error.response.status >= 500 ? 502 : 400; // Bad Gateway or Bad Request
    } else if (error.request) {
      // Error request dibuat tapi tidak ada respons
      errorMessage = 'Tidak dapat menerima respons dari TubeNinja. Periksa koneksi atau coba lagi nanti.';
      statusCode = 503; // Service Unavailable
    } else if (error instanceof dom.window.DOMException) {
      // Error saat parsing JSDOM
      errorMessage = 'Gagal mem-parsing konten HTML dari TubeNinja. Struktur halaman mungkin tidak valid atau berubah.';
      statusCode = 500;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Tidak dapat terhubung ke server TubeNinja.';
      statusCode = 503; // Service Unavailable
    }
    
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};