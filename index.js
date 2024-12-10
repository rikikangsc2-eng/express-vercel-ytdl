const express = require("express");
const ytdl = require("@distube/ytdl-core");

const app = express();
const port = 3000;

app.get("/ytdl", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: "Parameter 'url' diperlukan." });
  }

  try {
    // Memeriksa apakah URL valid
    if (!ytdl.validateURL(videoUrl)) {
      return res.status(400).json({ error: "URL tidak valid." });
    }

    // Mengambil info video
    const videoInfo = await ytdl.getInfo(videoUrl);

    // Filter format untuk video dan audio
    const formats = videoInfo.formats;

    // Mengambil format video dengan audio
    const videoAndAudio = formats.find(
      (format) => format.hasAudio && format.hasVideo && format.container === "mp4"
    );

    // Mengambil format video only
    const videoOnly = formats.find(
      (format) => !format.hasAudio && format.hasVideo && format.container === "mp4"
    );

    // Mengambil format audio only
    const audioOnly = formats.find(
      (format) => format.hasAudio && !format.hasVideo && format.container === "webm"
    );

    // Respon JSON
    res.json({
      videoandaudio: videoAndAudio ? videoAndAudio.url : null,
      videoonly: videoOnly ? videoOnly.url : null,
      audioonly: audioOnly ? audioOnly.url : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});