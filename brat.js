const express = require('express')
const router = express.Router()

router.get('/brat', (req, res) => {
  const text = req.query.text || 'Hai saya suka dengan eva'
  const type = req.query.type
  let background = ''
  let color = ''
  
  // Warna dasar & warna teks berdasarkan parameter
  if (type === '1') {
    background = 'green'
    color = 'white'
  } else if (type === '2') {
    background = 'white'
    color = 'black'
  } else if (type === '3') {
    background = 'black'
    color = 'white'
  } else if (type === '4') {
    background = 'cyan'
    color = 'white'
  } else {
    background = 'white'
    color = 'black'
  }
  
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Brat Generator</title>
  <style>
    html, body {
      margin: 0; 
      padding: 0; 
      height: 100%;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${background};
      color: ${color};
      /* Hilangkan margin default pada body agar benar-benar penuh */
    }
    #text-container {
      /* Kontainer utama, lebar & tinggi penuh */
      width: 100%;
      height: 100%;
      /* Sedikit padding agar teks tidak menempel di tepi */
      padding: 20px;
      box-sizing: border-box;
      
      /* Letakkan teks di kiri atas */
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      /* Atur agar wrap otomatis */
      overflow-wrap: break-word;
      text-align: left;
    }
    #text-span {
      /* Inline-block agar mudah diukur ukurannya */
      display: inline-block;
      /* Boleh pakai white-space normal juga */
      white-space: normal;
    }
  </style>
</head>
<body>
  <div id="text-container">
    <span id="text-span">${text}</span>
  </div>
  <script>
    // Fungsi pencarian biner untuk mencari font-size terbesar yang muat di #text-container
    function adjustFontSize() {
      const container = document.getElementById('text-container')
      const textSpan = document.getElementById('text-span')

      // Ambil dimensi kontainer
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      // Mulai dengan fontSize paling kecil agar perhitungan benar
      textSpan.style.fontSize = '10px'

      let low = 1
      let high = 1000
      let bestFit = 10

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        textSpan.style.fontSize = mid + 'px'

        const rect = textSpan.getBoundingClientRect()
        // Periksa apakah masih muat di dalam kontainer
        if (rect.width <= containerWidth && rect.height <= containerHeight) {
          bestFit = mid
          low = mid + 1
        } else {
          high = mid - 1
        }
      }

      // Set fontSize terbesar yang muat
      textSpan.style.fontSize = bestFit + 'px'
    }

    // Panggil saat load dan saat resize
    window.addEventListener('load', adjustFontSize)
    window.addEventListener('resize', adjustFontSize)
  </script>
</body>
</html>
  `)
})

module.exports = router