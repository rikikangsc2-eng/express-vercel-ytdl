const express = require('express');
const axios = require('axios');
const ElevenLabs = require('elevenlabs-node');
const rpg = require('./brat');
const app = express();
const sskey = ['5130b8', 'c87ac1', '21a5cf', '047eff'][Math.floor(Math.random() * 4)];

app.use(rpg);
const voice = new ElevenLabs({
  apiKey: "sk_2496699c1ca47e57043385c08716c39700150d2a2bbc4938",
  voiceId: "kuOK5r8Woz6lkWaMr8kx"
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

app.get('/khodam', async (req, res) => {
  const { nama } = req.query;
  if (!nama) {
    return res.status(400).send('Parameter nama diperlukan');
  }

  // URL target untuk API Khodam dengan parameter nama yang di-encode
  const targetUrl = `https://express-vercel-ytdl.vercel.app/khodam-mentah?nama=Nirsaaaaaaa${encodeURIComponent(nama)}`;

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
    const response = await axios.get(`https://api.screenshotmachine.com?key=${sskey}&url=https%3A%2F%2Fexpress-vercel-ytdl.vercel.app%2Ftopuser&device=phone&dimension=480x300&format=jpg&cacheLimit=1&delay=1`, {responseType: 'arraybuffer'});
    const data = response.data;
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(data, 'base64'));
  } catch (error) {
    res.status(500).send("Error mengambil screenshot");
  }
});

app.get('/topuser', async (req, res) => {
  try {
    const response = await axios.get('https://copper-ambiguous-velvet.glitch.me/data/users', {
      headers: { 'User-Agent': 'TopUsersApp/1.0' }
    });
    const data = response.data;

    if (!data || !data.users) throw new Error('Data tidak ditemukan');

    const usersObj = data.users;
    let usersArray = Object.keys(usersObj).map(username => ({
      username: username,
      name: usersObj[username].name || username,
      points: usersObj[username].points || 0
    }));

    usersArray.sort((a, b) => b.points - a.points);
    usersArray = usersArray.slice(0, 3);

    res.send(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Top Users</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { 
      background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8WX4UeBThhIm1D6dqiiXXv2IYtrNzdcOvtAY_bLqD9vldLRap-pcpcQ&s=10') no-repeat center center fixed; 
      background-size: cover;
      font-family: 'Poppins', sans-serif;
      color: #fff;
      text-align: center;
    }
    .container {
      background: rgba(0, 0, 0, 0.8);
      border-radius: 15px;
      padding: 20px;
      max-width: 400px;
      margin: auto;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
    }
    h1 {
      color: #0f0;
      font-size: 28px;
      text-shadow: 0 0 8px #0f0;
      margin-bottom: 20px;
    }
    .table {
      margin-top: 10px;
      border-radius: 10px;
      overflow: hidden;
    }
    .table th {
      background-color: #111;
      color: #0f0;
    }
    .table tr {
      transition: 0.3s;
    }
    .table tr:hover {
      background-color: rgba(0, 255, 0, 0.3);
      transform: scale(1.05);
    }
    .rank-icon {
      font-size: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏆 3 SEPUH 🥶 🏆</h1>
    <table class="table table-dark table-hover">
      <thead>
        <tr><th>Rank</th><th>Username</th><th>Points</th></tr>
      </thead>
      <tbody>
        ${usersArray.length === 0 ? '<tr><td colspan="3">Tidak ada data</td></tr>' : 
          usersArray.map((user, index) => `
            <tr>
              <td><span class="rank-icon">${index + 1}${index === 0 ? ' 👑' : index === 1 ? ' 🔥' : ' 😎'}</span></td>
              <td>${user.name}</td>
              <td>${user.points}</td>
            </tr>`).join('')
        }
      </tbody>
    </table>
  </div>
</body>
</html>
    `);
  } catch (error) {
    res.send(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Top Users</title>
  <style>
    body { 
      background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8WX4UeBThhIm1D6dqiiXXv2IYtrNzdcOvtAY_bLqD9vldLRap-pcpcQ&s=10') no-repeat center center fixed; 
      background-size: cover;
      font-family: 'Poppins', sans-serif;
      color: #fff;
      text-align: center;
    }
    .error-container {
      background: rgba(0, 0, 0, 0.8);
      border-radius: 15px;
      padding: 20px;
      max-width: 400px;
      margin: auto;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
    }
    h1 {
      color: #f00;
      font-size: 28px;
      text-shadow: 0 0 8px #f00;
    }
    p {
      font-size: 18px;
      font-weight: bold;
      color: #ff4d4d;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>❌ ERROR ❌</h1>
    <p>Gagal memuat data top users.</p>
  </div>
</body>
</html>
    `);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
