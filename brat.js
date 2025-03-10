const express = require('express')
const router = express.Router()

router.get('/brat', (req, res) => {
  const text = req.query.text || ''
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

  res.send(`<html>
<head>
  <meta viweport="width=device-width, initial-scale=1.0">
  <meta charset="UTF-8">
  <style>
    body {margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:${background}; color:${color};}
    #text-container {text-align:center;}
  </style>
</head>
<body>
  <div id="text-container">${text}</div>
  <script>
    function adjustFontSize() {
      var container = document.getElementById('text-container')
      var length = container.innerText.length
      if (!length) return
      var scale = Math.sqrt(window.innerWidth * window.innerHeight)
      var fontSize = scale / (length / 2)
      var maxFontSize = window.innerHeight * 0.5
      if (fontSize > maxFontSize) fontSize = maxFontSize
      container.style.fontSize = fontSize + 'px'
    }
    window.addEventListener('resize', adjustFontSize)
    adjustFontSize()
  </script>
</body>
</html>`)
})

module.exports = router