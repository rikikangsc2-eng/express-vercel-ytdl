 const express = require('express')
 const router = express.Router()

 router.get('/brat', (req, res) => {
   const text = req.query.text || 'Brat'
   const type = req.query.type
   let theme = 'white' // default

   if (type === '1') {
     theme = 'green'
   } else if (type === '2') {
     theme = 'white'
   } else if (type === '3') {
     theme = 'black'
   } else if (type === '4') {
     theme = 'blue'
   }

   res.send(`
 <!DOCTYPE html>
 <html>
 <head>
   <meta charset="UTF-8">
   <title>Brat Generator</title>
   <style>
     /* Reset dasar */
     html, body {
       margin: 0;
       padding: 0;
       height: 100%;
     }
     /* Tema berdasarkan type */
     body.white {
       background-color: #ffffff;
       color: #000000;
       font-family: Arial, sans-serif;
       text-align: center;
     }
     body.green {
       background-color: #8ACF00;
       color: #000000;
       font-family: "Arial Narrow", sans-serif;
       text-align: center;
     }
     body.black {
       background-color: #000000;
       color: #ffffff;
       font-family: Arial, sans-serif;
       text-align: left;
     }
     body.blue {
       background-color: #0A00AD;
       color: #DE0100;
       font-family: "Compacta Black", sans-serif;
       text-transform: uppercase;
       text-align: center;
     }
     /* Kontainer teks */
     #text-container {
       width: 100%;
       height: 100%;
       padding: 20px;
       box-sizing: border-box;
       display: flex;
       align-items: center;
       justify-content: center;
     }
     /* Span teks */
     #text-span {
       display: inline-block;
       white-space: normal;
       word-wrap: break-word;
       overflow-wrap: break-word;
     }
   </style>
 </head>
 <body class="${theme}">
   <div id="text-container">
     <span id="text-span">${text}</span>
   </div>
   <script>
     // Fungsi untuk menyisipkan <br> agar teks terpisah merata
     function insertLineBreaks() {
       var textSpan = document.getElementById('text-span');
       var originalText = textSpan.innerText;
       if (originalText.indexOf(' ') !== -1) {
         var words = originalText.split(' ');
         var linesCount = Math.ceil(Math.sqrt(words.length));
         var wordsPerLine = Math.ceil(words.length / linesCount);
         var newText = '';
         for (var i = 0; i < words.length; i++) {
           newText += words[i];
           if ((i + 1) % wordsPerLine === 0 && (i + 1) !== words.length) {
             newText += '<br>';
           } else {
             newText += ' ';
           }
         }
         textSpan.innerHTML = newText.trim();
       }
     }
     // Fungsi untuk menyesuaikan ukuran font agar pas dengan kontainer
     function adjustFontSize() {
       var container = document.getElementById('text-container');
       var textSpan = document.getElementById('text-span');
       var availableWidth = container.clientWidth * 0.98;
       var availableHeight = container.clientHeight * 0.98;
       textSpan.style.fontSize = '10px';
       var low = 1, high = 1000, fontSize;
       while (low <= high) {
         fontSize = Math.floor((low + high) / 2);
         textSpan.style.fontSize = fontSize + 'px';
         var rect = textSpan.getBoundingClientRect();
         if (rect.width <= availableWidth && rect.height <= availableHeight) {
           low = fontSize + 1;
         } else {
           high = fontSize - 1;
         }
       }
       textSpan.style.fontSize = high + 'px';
     }
     window.addEventListener('load', function() {
       insertLineBreaks();
       adjustFontSize();
     });
     window.addEventListener('resize', adjustFontSize);
   </script>
 </body>
 </html>
   `)
 })

 module.exports = router