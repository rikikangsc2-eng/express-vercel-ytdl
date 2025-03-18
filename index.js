const express = require('express');
const axios = require('axios');
const ElevenLabs = require('elevenlabs-node');
const rpg = require('./brat');
const app = express();

const listKey = ['5130b8', 'c87ac1', '21a5cf', '047eff', '09fd34'];
const randomKey = () => listKey[Math.floor(Math.random() * listKey.length)];
const sskey = randomKey();

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



app.get('/produk', async (req, res) => {
  const { nama, harga, gambar } = req.query;
  if (!nama) {
    return res.status(400).send('Parameter nama diperlukan');
  }

  // URL target untuk API Khodam dengan parameter nama yang di-encode
  const targetUrl = `https://express-vercel-ytdl.vercel.app/produk-mentah?nama=${encodeURIComponent(nama)}&harga=${encodeURIComponent(harga)}&gambar=${encodeURIComponent(gambar)}`;

  // Membangun query string untuk API screenshotmachine
  const params = new URLSearchParams({
    key: sskey,
    url: targetUrl,
    _rsc: '1iwkq',
    device: 'phone',
    dimension: '720x1280',
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

app.get('/produk-mentah', (req, res) => {
  const { nama, harga, gambar } = req.query;
  
  const responseHTML = `
    <html>  
     <head>  
      <script src="https://cdn.tailwindcss.com">  
      </script>  
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet"/>  
     </head>  
     <body class="flex items-center justify-center min-h-screen bg-gray-100">  
      <div class="max-w-xs bg-white rounded-lg shadow-md overflow-hidden">  
       <div class="relative">  
        <img alt="${nama}" class="w-full" height="800" src="${gambar}" width="600"/>  
        <div class="absolute bottom-0 left-0 right-0 flex justify-center mb-2">  
         <div class="flex space-x-1">  
          <span class="w-2.5 h-2.5 bg-white rounded-full">  
          </span>  
          <span class="w-2.5 h-2.5 bg-gray-400 rounded-full">  
          </span>  
          <span class="w-2.5 h-2.5 bg-gray-400 rounded-full">  
          </span>  
         </div>  
        </div>  
       </div>  
       <div class="p-4">  
        <h2 class="text-lg font-semibold text-gray-900">  
         ${nama}  
        </h2>  
        <p class="text-xl font-bold text-gray-900 mt-2">  
         ${harga}  
        </p>  
        <div class="flex items-center mt-4">  
         <img alt="Nirkyy logo" class="w-6 h-6" height="24" src="https://storage.googleapis.com/a1aa/image/n6JFeAHVacY7Z5iDO8klmreKUIulLgMvJBslkzj-efo.jpg" width="24"/>  
         <span class="ml-2 text-gray-600">  
          Nirkyy Indonesia  
         </span>  
        </div>  
       </div>  
      </div>  
     </body>  
    </html>`;
  
  res.send(responseHTML);
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
