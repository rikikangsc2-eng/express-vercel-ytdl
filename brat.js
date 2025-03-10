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
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      white-space: normal;
      word-wrap: break-word;
      padding: 10px;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="text-container">${text}</div>
  <script>
    function adjustFontSize() {
      var container = document.getElementById('text-container')
      var availableWidth = window.innerWidth
      var availableHeight = window.innerHeight
      container.style.fontSize = '10px'
      var low = 1, high = 1000, fontSize
      while (low <= high) {
        fontSize = Math.floor((low + high) / 2)
        container.style.fontSize = fontSize + 'px'
        var rect = container.getBoundingClientRect()
        if (rect.width <= availableWidth && rect.height <= availableHeight) {
          low = fontSize + 1
        } else {
          high = fontSize - 1
        }
      }
      container.style.fontSize = high + 'px'
    }
    window.addEventListener('resize', adjustFontSize)
    adjustFontSize()
  </script>
</body>
</html>
  `)
})

module.exports = router