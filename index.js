const express = require('express');
const axios = require('axios');
const ElevenLabs = require('elevenlabs-node');
const app = express();

const voice = new ElevenLabs({
  apiKey: "sk_2496699c1ca47e57043385c08716c39700150d2a2bbc4938",
  voiceId: "kuOK5r8Woz6lkWaMr8kx"
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
      points: usersObj[username].points || 0
    }));

    usersArray.sort((a, b) => b.points - a.points);
    usersArray = usersArray.slice(0, 10);

    res.send(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Top Users</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #121212; color: #f1f1f1; }
    h1 { color: #ffc107; }
    .table thead th { border-bottom: 2px solid #ffc107; }
    .spinner-container { display: flex; justify-content: center; align-items: center; height: 150px; }
  </style>
</head>
<body>
  <div class="container py-5">
    <h1 class="text-center mb-4">Top Users</h1>
    <div id="alert" class="alert alert-danger d-none" role="alert">Gagal memuat data top users.</div>
    <div class="table-responsive">
      <table class="table table-dark table-hover">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Username</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody id="user-table">
          ${usersArray.length === 0 ? '<tr><td colspan="3" class="text-center">Tidak ada data top users</td></tr>' : 
            usersArray.map((user, index) => `
              <tr>
                <th scope="row">${index + 1}${index === 0 ? ' 👑' : index === 1 ? ' 🔥' : index === 2 ? ' 😎' : ''}</th>
                <td>${user.username}</td>
                <td>${user.points}</td>
              </tr>`).join('')
          }
        </tbody>
      </table>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-5">
    <h1 class="text-center mb-4">Top Users</h1>
    <div class="alert alert-danger" role="alert">Gagal memuat data top users.</div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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
