const axios = require('axios');
const { JSDOM } = require('jsdom');
const { URLSearchParams } = require('url');

module.exports = async (req, res) => {
    const instagramUrl = req.query.url;

    if (!instagramUrl) {
        return res.status(400).json({
            status: 'error',
            message: 'Parameter URL Instagram diperlukan (contoh: ?url=INSTAGRAM_URL)'
        });
    }

    try {
        const targetUrl = 'https://snapsave.app/action.php?lang=id';
        const refererUrl = 'https://snapsave.app/id/download-video-instagram';

        const params = new URLSearchParams();
        params.append('url', instagramUrl);

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
                'Referer': refererUrl,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', // Ditambahkan header Accept
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8', // Ditambahkan header Accept-Language
                'Origin': 'https://snapsave.app', // Ditambahkan header Origin
                'Sec-Fetch-Dest': 'iframe',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Upgrade-Insecure-Requests': '1',
            },
            // Penting untuk menangani potensi error dari server target
            validateStatus: function (status) {
                return status >= 200 && status < 500; // Terima status 2xx, 3xx, 4xx
            }
        };

        const response = await axios.post(targetUrl, params.toString(), config);

        // Cek jika response bukan HTML atau ada error dari SnapSave
        if (response.status >= 400 || !response.headers['content-type']?.includes('text/html')) {
             // Coba parsing jika mungkin ada pesan error di body HTML
             try {
                const domError = new JSDOM(response.data);
                const alertElement = domError.window.document.querySelector('.notification.is-warning#alert');
                if (alertElement && alertElement.textContent.trim()) {
                    return res.status(404).json({ // Atau 400 tergantung konteks errornya
                        status: 'error',
                        message: `SnapSave Error: ${alertElement.textContent.trim()}`
                    });
                }
             } catch (parseError) {
                 // Abaikan jika parsing gagal, lanjut ke error umum
             }

            return res.status(response.status === 404 ? 404 : 500).json({ // Berikan status 404 jika target not found, selain itu 500
                status: 'error',
                message: `Gagal mengambil data dari SnapSave. Status: ${response.status}. URL mungkin tidak valid atau server sedang bermasalah.`
            });
        }

        const htmlContent = response.data;
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        // Cari semua link download
        const downloadLinks = [];
        const downloadButtons = document.querySelectorAll('.download-items__btn a.button.is-success'); // Selector lebih spesifik

        if (downloadButtons.length === 0) {
             // Cek lagi pesan error spesifik jika tidak ada tombol download
             const alertElement = document.querySelector('.notification.is-warning#alert');
             if (alertElement && alertElement.textContent.trim()) {
                 return res.status(404).json({
                     status: 'error',
                     message: `SnapSave Error: ${alertElement.textContent.trim()}`
                 });
             }
            return res.status(404).json({
                status: 'error',
                message: 'Tidak ada link download yang ditemukan. URL mungkin tidak valid atau tidak mengandung video/foto.'
            });
        }

        downloadButtons.forEach(button => {
            const link = button.getAttribute('href');
            if (link) {
                downloadLinks.push(link);
            }
        });

        if (downloadLinks.length === 0) {
             return res.status(404).json({
                status: 'error',
                message: 'Link download ditemukan tetapi href kosong. Terjadi kesalahan saat parsing.'
            });
        }


        res.status(200).json({
            status: 'success',
            source_url: instagramUrl,
            download_links: downloadLinks
        });

    } catch (error) {
        console.error("Scraping Error:", error); // Log error di server untuk debugging

        // Tangani error axios secara spesifik
        if (error.response) {
            // Request dibuat dan server merespon dengan status code di luar range 2xx
             res.status(500).json({ // Error internal server karena masalah di sisi kita atau target
                status: 'error',
                message: `Error response dari server target: ${error.response.status} - ${error.response.statusText}`
             });
        } else if (error.request) {
            // Request dibuat tapi tidak ada response diterima
            res.status(503).json({ // Service Unavailable
                status: 'error',
                message: 'Tidak ada respons dari server SnapSave. Cek koneksi atau status server target.'
             });
        } else {
            // Error lain saat setup request atau parsing JSDOM
            res.status(500).json({
                status: 'error',
                message: `Terjadi kesalahan internal: ${error.message}`
            });
        }
    }
};