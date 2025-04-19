const express = require('express');
const axios = require('axios');
const ElevenLabs = require('elevenlabs-node');
const rpg = require('./brat');
const test = require('./tes.js')
const app = express();

const listKey = ['5130b8', 'c87ac1'];
const randomKey = () => listKey[Math.floor(Math.random() * listKey.length)];
const sskey = randomKey();

app.use('/api',require('./deepinfra.js'));
app.use(rpg);
const voice = new ElevenLabs({
  apiKey: "sk_2496699c1ca47e57043385c08716c39700150d2a2bbc4938",
  voiceId: "kuOK5r8Woz6lkWaMr8kx"
});

app.get('/otakudesu',require('./otakkudesu/homepage.js'))
app.get('/tes',test)
app.get('/alicia', require('./alicia.js'))

app.get('/stream', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter: q' });
    }

    const response = await axios.get(
      `https://layarwibu.com/server-url?serverId=${encodeURIComponent(query)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36',
          'Referer': `https://layarwibu.com/server-url?serverId=${encodeURIComponent(
              query
          )}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/brats', async (req, res) => {
  const {
    text,
    host
  } = req.query;

  if (!text) {
    return res.status(400).json({
      error: "Text parameter is required"
    });
  }

  const BASE_URLS = {
    1: "https://brat.caliphdev.com/api/brat?text=",
    2: "https://wudysoft-api.hf.space/brat?text=",
    3: "https://aqul-brat.hf.space/?text=",
    4: "https://siputzx-bart.hf.space/?q=",
    5: "https://wudysoft-api.hf.space/brat/v2?text=",
    6: "https://qyuunee-brat.hf.space/?q=",
    7: "https://fgsi-brat.hf.space/?text="
  };
  const totalHosts = Object.keys(BASE_URLS).length;
  const hostInt = host ? parseInt(host) : 1;

  if (hostInt < 1 || hostInt > totalHosts) {
    return res.status(400).json({
      error: `Host must be between 1 and ${totalHosts}.`
    });
  }

  const BASE_URL = BASE_URLS[hostInt];
  const url = `${BASE_URL}${encodeURIComponent(text)}`;

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });
    const imageBuffer = Buffer.from(response.data);
    console.log("Query processing complete!");
    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(imageBuffer);
  } catch (error) {
    console.error("Error processing query:", error);
    return res.status(500).json({
      error: "Failed to process the request"
    });
  }
});


app.get('/khodam-mentah', async (req, res) => {
    try {
        const nama = req.query.nama || 'Pengguna';
        const response = await axios.get('https://raw.githubusercontent.com/SazumiVicky/cek-khodam/refs/heads/main/khodam/list.txt');
        const khodamList = response.data.split('\n').filter(k => k.trim() !== '');

        if (khodamList.length === 0) {
            return res.status(500).send('Data khodam tidak tersedia.');
        }

        const randomKhodam = khodamList[Math.floor(Math.random() * khodamList.length)];

        const htmlResponse = `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cek Khodam</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
            <style>
                body {
                    background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHCJs_iGwp6gFGaAM9hps67-SXl9Q5xlH3gk8nRKAzNF8Fs2SjpqM3QkGH&s=10') no-repeat center center fixed;
                    background-size: cover;
                }
            </style>
        </head>
        <body class="flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-50 text-white">
            <div class="text-center">
                <h1 class="text-4xl font-extrabold">
                    Cek <span class="text-red-500">Khodam</span>
                </h1>
                <p class="text-lg font-semibold">by <span class="text-yellow-500">@NirKyy</span></p>
            </div>
            <div class="mt-8 bg-black bg-opacity-70 p-6 rounded-lg text-center">
                <p class="text-lg font-semibold">Khodam <span class="bg-red-700 px-2 py-1 rounded-md font-bold">${nama}</span> Adalah...</p>
                <p class="text-4xl font-extrabold mt-4 text-pink-500">
                    <span class="text-yellow-400">✨</span>${randomKhodam}<span class="text-yellow-400">✨</span>
                </p>
            </div>
        </body>
        </html>
        `;

        res.send(htmlResponse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengambil data khodam.');
    }
});

app.get('/kcckn', (req, res) => {
  const nama1 = req.query.nama1 || "Nama1";
  const nama2 = req.query.nama2 || "Nama2";
  const namesHTML = `Persentase kecocokan <span class="font-bold text-pink-400">${nama1}</span> & <span class="font-bold text-pink-400">${nama2}</span>`;
  const randomValue = Math.floor(Math.random() * 100) + 1;
  const percentText = randomValue + "%";
  let bucket = Math.round(randomValue / 10) * 10;
  if (bucket < 10) bucket = 10;
  if (bucket > 100) bucket = 100;
  const responses = {
    10: [
      "Hmm, ini kayaknya nggak cocok deh, coba deketin lagi.",
      "Yah, sepertinya chemistry kalian kurang, tapi siapa tahu bisa berkembang.",
      "Cuma 10%, mungkin bukan jodoh tapi masih bisa jadi teman.",
      "Low key vibes-nya belum nyambung, santai aja dulu.",
      "Duh, pas 10% nih. Mungkin kalian butuh waktu untuk ngeklik."
    ],
    20: [
      "20%? Masih perlu effort biar makin klop.",
      "Kurang greget, tapi bisa jadi awal yang lucu.",
      "Sedikit lagi biar terasa chemistry yang nyata.",
      "20% tuh, masih ada ruang buat improvement.",
      "Belum menyala, tapi tetap ada potensi."
    ],
    30: [
      "30% artinya ada secercah harapan, asal jangan dipaksain.",
      "Lumayan, tapi belum cukup menyala.",
      "Cukup receh, bisa jadi bahan candaan.",
      "Ada potensi, asal diberi waktu.",
      "Mulai terlihat, tapi masih jauh dari ideal."
    ],
    40: [
      "40%? Lumayan lah, coba kenalan lebih dalam.",
      "Mendekati, tapi belum klik total.",
      "Bisa dibilang setengah-setengah, coba lagi!",
      "Masih butuh pemanasan, tapi ada peluang.",
      "Cukup menarik, asal jangan dipaksain."
    ],
    50: [
      "50/50, namanya juga adil, bisa jadi menarik.",
      "Seimbang, ada plus minusnya masing-masing.",
      "Setengah jalan, bisa makin mantep kalo diberi kesempatan.",
      "Lumayan, tapi perlu usaha lebih.",
      "Bisa jadi, asal kalian mau mencoba."
    ],
    60: [
      "60% artinya udah lumayan, coba deketin lebih santai.",
      "Ada chemistry, tapi belum full on.",
      "Menjanjikan, asal jangan dibuat ribet.",
      "Udah mulai asik, keep it casual aja.",
      "Lumayan banget, boleh dicoba."
    ],
    70: [
      "70%? Wah, udah lumayan keren nih!",
      "Mendekati jodoh, coba eksplor lebih dalam.",
      "Asik, chemistry kalian keliatan!",
      "Cocok, tapi santai aja dulu.",
      "Udah deket, tinggal makin deket lagi."
    ],
    80: [
      "80% tuh, udah hampir sempurna!",
      "Keren, chemistry kalian terasa banget.",
      "Udah jodoh deh, asal dijaga aja.",
      "Cocok banget, vibes positif terus!",
      "Udah klik, tinggal terusin aja."
    ],
    90: [
      "90%? Mantap, kalian tuh kayak destinasi jodoh!",
      "Hampir sempurna, vibes kalian luar biasa.",
      "Cocok parah, tinggal polesan dikit aja.",
      "Udah kayak soulmate, terusin aja!",
      "Gokil, chemistry kalian hampir nggak terbantahkan."
    ],
    100: [
      "100%! Wah, bener-bener serasi!",
      "Jodoh banget, udah kayak kisah dongeng.",
      "Sempurna, kalian tuh destiny yang nyata.",
      "Udah jelas, chemistry kalian on fire!",
      "Tak terbantahkan, kalian memang dibuat untuk bersama."
    ]
  };
  const chosenResponse = responses[bucket][Math.floor(Math.random() * responses[bucket].length)];
  res.send(`
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body class="bg-gray-800 flex items-center justify-center min-h-screen">
      <div id="card" class="bg-gray-700 p-8 rounded-lg shadow-lg text-center text-white max-w-md mx-auto">
        <h1 class="text-2xl font-bold mb-2">Cupid Meter</h1>
        <p id="names" class="text-lg mb-4">${namesHTML}</p>
        <div class="flex items-center justify-center mb-4">
          <i class="fas fa-heart text-pink-500 text-6xl"></i>
          <span id="percent" class="text-6xl font-bold ml-4">${percentText}</span>
        </div>
        <p id="response" class="text-sm">${chosenResponse}</p>
      </div>
    </body>
    </html>
  `);
});


app.get('/kecocokan', async (req, res) => {
  const { nama1, nama2 } = req.query;
  if (!nama1 || !nama2) {
    return res.status(400).send('Parameter nama1 dan nama2 diperlukan');
  }

  const targetUrl = `https://express-vercel-ytdl.vercel.app/kcckn?nama1=${encodeURIComponent(nama1)}&nama2=${encodeURIComponent(nama2)}`;

  const params = new URLSearchParams({
    key: sskey,
    url: targetUrl,
    _rsc: '1iwkq',
    device: 'phone',
    dimension: '480x650',
    format: 'jpg',
    cacheLimit: '14',
    delay: '1000',
    zoom: '200'
  });

  const imageUrl = `https://api.screenshotmachine.com/?${params.toString()}`;

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': response.data.length
    });
    res.end(response.data);
  } catch (error) {
    console.error("Gagal mengambil gambar:", error);
    res.status(500).send('Gagal mengambil gambar dari API screenshot.');
  }
});

app.get('/arti', async (req, res) => {
  const { nama } = req.query;
  if (!nama) {
    return res.status(400).send('Parameter nama diperlukan');
  }

  // URL target untuk API Khodam dengan parameter nama yang di-encode
  const targetUrl = `https://express-vercel-ytdl.vercel.app/artinama?nama=${encodeURIComponent(nama)}`;

  // Membangun query string untuk API screenshotmachine
  const params = new URLSearchParams({
    key: sskey,
    url: targetUrl,
    _rsc: '1iwkq',
    device: 'phone',
    dimension: '480x650',
    format: 'jpg',
    cacheLimit: '14',
    delay: '1000',
    zoom: '200'
  });

  const imageUrl = `https://api.screenshotmachine.com/?${params.toString()}`;

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': response.data.length
    });
    res.end(response.data);
  } catch (error) {
    console.error("Gagal mengambil gambar:", error);
    res.status(500).send('Gagal mengambil gambar dari API screenshot.');
  }
});

app.get('/khodam', async (req, res) => {
  const { nama } = req.query;
  if (!nama) {
    return res.status(400).send('Parameter nama diperlukan');
  }

  // URL target untuk API Khodam dengan parameter nama yang di-encode
  const targetUrl = `https://express-vercel-ytdl.vercel.app/khodam-mentah?nama=${encodeURIComponent(nama)}`;

  // Membangun query string untuk API screenshotmachine
  const params = new URLSearchParams({
    key: sskey,
    url: targetUrl,
    _rsc: '1iwkq',
    device: 'phone',
    dimension: '480x440',
    format: 'jpg',
    cacheLimit: '14',
    delay: '1000',
    zoom: '200'
  });

  const imageUrl = `https://api.screenshotmachine.com/?${params.toString()}`;

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': response.data.length
    });
    res.end(response.data);
  } catch (error) {
    console.error("Gagal mengambil gambar:", error);
    res.status(500).send('Gagal mengambil gambar dari API screenshot.');
  }
});

app.get('/tulis', async (req, res) => {
  const { text, type } = req.query;
  if (!text || !type) {
    return res.status(400).send('Missing required parameters');
  }

  // Membangun URL target tanpa spasi ekstra dan melakukan encoding parameter
  const targetUrl = `https://express-vercel-ytdl.vercel.app/brat?type=${encodeURIComponent(type)}&text=${encodeURIComponent(text)}`;

  try {
    const screenshotUrl = `https://api.screenshotmachine.com?key=${sskey}&url=${encodeURIComponent(targetUrl)}&device=phone&dimension=500x500`;
    const response = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    console.error("Error retrieving screenshot:", error);
    res.status(500).send("Error mengambil screenshot");
  }
});

app.get('/top', async (req, res) => {
  try {
    const response = await axios.get(`https://api.screenshotmachine.com?key=${sskey}&url=https%3A%2F%2Fexpress-vercel-ytdl.vercel.app%2Ftopuser&device=phone&dimension=500x700&format=jpg&cacheLimit=1&delay=1`, {responseType: 'arraybuffer'});
    const data = response.data;
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(data, 'base64'));
  } catch (error) {
    res.status(500).send("Error mengambil screenshot");
  }
});
app.get('/topuser', async (req, res) => {
  try {
    // Ambil data dari endpoint
    const response = await axios.get('https://copper-ambiguous-velvet.glitch.me/data/users', {
      headers: { 'User-Agent': 'TopUsersApp/1.0' }
    });
    const data = response.data;

    if (!data || !data.users) throw new Error('Data tidak ditemukan');

    // Siapkan array user
    const usersObj = data.users;
    let usersArray = Object.keys(usersObj).map(username => ({
      username,
      name: usersObj[username].name || username,
      points: usersObj[username].points || 0
    }));

    // Urutkan dan ambil 5 besar
    usersArray.sort((a, b) => b.points - a.points);
    usersArray = usersArray.slice(0, 5);

    // Fungsi format points (1k, 2k, dsb.)
    const formatPoints = (points) => {
      if (points >= 1000) {
        return (points / 1000).toFixed(1) + 'k';
      }
      return points;
    };

    // Siapkan style peringkat
    const styles = [
      { bg: 'bg-yellow-100', text: 'text-yellow-500', icon: 'fas fa-crown', rankClass: 'rank-1-name' },
      { bg: 'bg-red-100', text: 'text-red-500', icon: 'fas fa-medal', rankClass: 'rank-2-name' },
      { bg: 'bg-blue-100', text: 'text-blue-500', icon: 'fas fa-trophy', rankClass: 'rank-3-name' },
      { bg: 'bg-gray-100', text: 'text-gray-400', icon: '', rankClass: 'rank-4-name' },
      { bg: 'bg-gray-100', text: 'text-gray-600', icon: '', rankClass: 'rank-5-name' }
    ];

    // Generate HTML
    let rowsHtml = '';
    usersArray.forEach((user, index) => {
      const displayName = user.name.toUpperCase();
      const formattedPoints = formatPoints(user.points);

      const { bg, text, icon, rankClass } = styles[index];

      rowsHtml += `
        <div class="mb-4 p-4 rounded-md shadow-sm flex items-center justify-between ${bg} min-w-0">
          <!-- Bagian Kiri: Icon dan Nama -->
          <div class="flex items-center flex-1 min-w-0">
            <div class="text-2xl font-bold ${text} mr-4">
              ${icon ? `<i class="${icon}"></i>` : index + 1}
            </div>
            <div class="text-xl sm:text-2xl font-bold ${rankClass} truncate min-w-0">
              ${displayName}
            </div>
          </div>
          <!-- Bagian Kanan: Poin -->
          <div class="text-2xl font-bold text-gray-800 ml-2">
            ${formattedPoints}
          </div>
        </div>`;
    });

    // Kirim tampilan HTML
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Leaderboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet"/>
  <style>
    /* Rank 1 (Api) */
    .rank-1-name {
      text-shadow: 2px 2px 4px rgba(255, 165, 0, 0.8), -2px -2px 4px rgba(255, 69, 0, 0.8);
      animation: fire-effect 0.5s infinite alternate;
    }
    @keyframes fire-effect {
      from { color: #ff8c00; }
      to { color: #ff4500; }
    }
    /* Rank 2 & 3 (3D effect) */
    .rank-2-name, .rank-3-name { text-shadow: 1px 1px 2px #000; }
    /* Rank 4 */
    .rank-4-name { color: #555; }
    /* Rank 5 (Coret) */
    .rank-5-name { color: #777; text-decoration: line-through wavy #333; }
  </style>
</head>
<body class="bg-gray-200">
  <div class="max-w-md mx-auto mt-10 rounded-lg shadow-xl overflow-hidden">
    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-center">
      <img alt="Logo" class="w-14 h-14 mr-4 rounded-full shadow-md" src="https://NirKyy.koyeb.app/example.jpg"/>
      <h1 class="text-lg sm:text-2xl font-bold text-center">
        <span class="block">Top Point Tertinggi</span>
        <span class="block">Alicia Games</span>
      </h1>
    </div>
    <div class="bg-white p-6">
      ${rowsHtml}
    </div>
  </div>
</body>
</html>`);
  } catch (error) {
    // Jika error, tampilkan halaman error
    res.send(`<!DOCTYPE html>
<html lang="en">
 <head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Leaderboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #f8d7da; font-family: sans-serif; }
    .error-container { background: #f5c6cb; padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 400px; text-align: center; }
    h1 { color: #721c24; font-size: 24px; }
    p { color: #721c24; }
  </style>
 </head>
 <body>
  <div class="error-container">
    <h1>❌ ERROR ❌</h1>
    <p>Gagal memuat data top users.</p>
  </div>
 </body>
</html>`);
  }
});

app.get('/tts', async (req, res) => {
  const text = req.query.text || "mozzy is cool";
  try {
    const audioStream = await voice.textToSpeechStream({
      textInput: text,
      stability: 0.5,
      similarityBoost: 0.7,
      modelId: "eleven_multilingual_v2"
    });
    res.setHeader('Content-Type', 'audio/mpeg');
    audioStream.pipe(res);
  } catch (error) {
    const fallbackApiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(text)}&model=miku`;
    try {
      const fallbackResponse = await axios.get(fallbackApiUrl);
      if (fallbackResponse.data && fallbackResponse.data.data && fallbackResponse.data.data.oss_url) {
        const ossUrl = fallbackResponse.data.data.oss_url;
        const ossResponse = await axios({ method: 'get', url: ossUrl, responseType: 'stream' });
        res.setHeader('Content-Type', 'audio/mpeg');
        ossResponse.data.pipe(res);
      } else {
        res.status(500).send("Fallback API tidak mengembalikan URL audio");
      }
    } catch (fallbackError) {
      res.status(500).send("Error dalam menghasilkan suara menggunakan fallback API");
    }
  }
});

app.get('/artinama', async (req, res) => {
    const { nama } = req.query;
    if (!nama) {
        return res.status(400).send("Nama parameter is required");
    }

    try {
        const response = await axios.get(`https://api.siputzx.my.id/api/primbon/artinama?nama=${nama}`);
        const data = response.data.data;

        res.send(`
        <html>
        <head>
            <title>Arti Nama ${data.nama}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
        </head>
        <body class="bg-white text-gray-900">
            <div class="max-w-screen-lg mx-auto p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google logo" class="w-24 h-auto">
                    </div>
                    <div class="flex items-center space-x-2">
                        <img src="https://nirkyy.koyeb.app/logo.jpg" alt="User profile picture" class="w-6 h-6 rounded-full">
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex items-center border border-gray-300 rounded-full px-4 py-2">
                        <i class="fas fa-search text-gray-500"></i>
                        <input type="text" class="ml-2 w-full outline-none" value="arti nama ${data.nama}">
                        <i class="fas fa-times text-gray-500"></i>
                        <i class="fas fa-microphone text-blue-500 ml-2"></i>
                    </div>
                </div>
                <div class="flex space-x-4 mt-4 text-sm text-gray-600">
                    <a href="#" class="border-b-2 border-black pb-1">Semua</a>
                    <a href="#">Gambar</a>
                    <a href="#">Shopping</a>
                    <a href="#">Berita</a>
                    <a href="#">Video</a>
                </div>
                <div class="mt-4">
                    <div class="flex items-center space-x-2">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuy9ucswKvd8dPqg9CvrmJiEH5ngED9xLgrQ&s" alt="AI Summary Icon" class="w-4 h-4">
                        <span class="font-medium">Ringkasan AI</span>
                    </div>
                    <div class="flex items-center space-x-2 mt-2">
                        <button class="flex items-center space-x-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            <i class="fas fa-volume-up"></i>
                            <span>Dengarkan</span>
                        </button>
                    </div>
                    <p class="mt-2">Nama "<span class="bg-blue-100">${data.nama}</span>" memiliki arti:</p>
                    <p class="mt-2">${data.arti.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="mt-4">
                    <p class="font-medium">Catatan:</p>
                    <p class="mt-2">${data.catatan}</p>
                </div>
            </div>
        </body>
        </html>
        `);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
