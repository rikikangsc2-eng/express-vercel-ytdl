const express = require('express');
const axios = require('axios');
const ElevenLabs = require('elevenlabs-node');
const app = express();

const voice = new ElevenLabs({
  apiKey: "sk_2496699c1ca47e57043385c08716c39700150d2a2bbc4938",
  voiceId: "kuOK5r8Woz6lkWaMr8kx"
});

app.get('/top', async (req, res) => {
  try {
    const response = await axios.get(`https://api.screenshotmachine.com?key=5130b8&url=https%3A%2F%2Fexpress-vercel-ytdl.vercel.app%2Ftopuser&device=phone&dimension=480x300&format=jpg&cacheLimit=1&delay=0`, {responseType: 'arraybuffer'});
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
    body { background-color: #000; color: #0f0; font-family: 'Courier New', monospace; }
    h1 { color: #0f0; text-align: center; font-size: 24px; margin-top: 10px; }
    .table { width: 100%; margin: auto; border: 1px solid #0f0; }
    .table th, .table td { border: 1px solid #0f0; text-align: center; }
    .table thead th { background: #111; }
    .container { padding: 10px; max-width: 350px; margin: auto; }
    .error { color: red; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏆 3 SEPUH 🥶 🏆</h1>
    <table class="table table-dark">
      <thead>
        <tr><th>Rank</th><th>Username</th><th>Points</th></tr>
      </thead>
      <tbody>
        ${usersArray.length === 0 ? '<tr><td colspan="3">Tidak ada data</td></tr>' : 
          usersArray.map((user, index) => `
            <tr>
              <td>${index + 1}${index === 0 ? ' 👑' : index === 1 ? ' 🔥' : ' 😎'}</td>
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
    body { background-color: #000; color: #0f0; font-family: 'Courier New', monospace; text-align: center; }
    .error { color: red; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>🏆 TOP 3 USERS 🏆</h1>
  <p class="error">Gagal memuat data top users.</p>
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
