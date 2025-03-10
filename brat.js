const express = require('express')
const router = express.Router()

router.get('/brat', (req, res) => {
  const text = req.query.text || 'Brat'
  const type = req.query.type
  let background = ''
  let color = ''
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
<html>
<head>
  <meta charset="UTF-8">
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
    }
    #text-container {
      width: 100%;
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    /* Use inline-block so we can measure its size accurately */
    #text-span {
      display: inline-block;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  </style>
</head>
<body>
  <div id="text-container">
    <span id="text-span">${text}</span>
  </div>
  <script>
    // Fungsi untuk menyisipkan <br> agar teks terbagi secara merata
    function insertLineBreaks() {
      var textSpan = document.getElementById('text-span')
      var originalText = textSpan.innerText
      // Jika teks memiliki lebih dari satu kata, bagi ke dalam beberapa baris
      if (originalText.indexOf(' ') !== -1) {
        var words = originalText.split(' ')
        // Tentukan jumlah baris ideal berdasarkan akar kuadrat jumlah kata
        var linesCount = Math.ceil(Math.sqrt(words.length))
        // Bagi kata secara merata
        var wordsPerLine = Math.ceil(words.length / linesCount)
        var newText = ''
        for (var i = 0; i < words.length; i++) {
          newText += words[i]
          // Sisipkan <br> jika sudah mencapai jumlah kata per baris (kecuali baris terakhir)
          if ((i + 1) % wordsPerLine === 0 && (i + 1) !== words.length) {
            newText += '<br>'
          } else {
            newText += ' '
          }
        }
        textSpan.innerHTML = newText.trim()
      }
    }

    // Fungsi untuk mengubah ukuran font agar memenuhi kontainer tanpa terpotong
    function adjustFontSize() {
      var container = document.getElementById('text-container')
      var textSpan = document.getElementById('text-span')
      // Gunakan margin agar teks tidak menempel di tepi
      var availableWidth = container.clientWidth * 0.98
      var availableHeight = container.clientHeight * 0.98
      // Mulai dari ukuran font kecil
      textSpan.style.fontSize = '10px'
      var low = 1, high = 1000, fontSize

      while (low <= high) {
        fontSize = Math.floor((low + high) / 2)
        textSpan.style.fontSize = fontSize + 'px'
        var rect = textSpan.getBoundingClientRect()
        // Jika teks masih muat dalam area yang disediakan, naikkan ukuran font
        if (rect.width <= availableWidth && rect.height <= availableHeight) {
          low = fontSize + 1
        } else {
          high = fontSize - 1
        }
      }
      textSpan.style.fontSize = high + 'px'
    }

    // Saat halaman selesai dimuat, sisipkan baris dan atur ukuran font
    window.addEventListener('load', function() {
      insertLineBreaks()
      adjustFontSize()
    })
    // Juga sesuaikan ulang saat jendela diubah ukurannya
    window.addEventListener('resize', adjustFontSize)
  </script>
</body>
</html>
  `)
})

module.exports = router