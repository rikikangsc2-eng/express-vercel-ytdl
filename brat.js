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
  res.send(`<html><head><meta charset="UTF-8"></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:${background};color:${color};"><div>${text}</div></body></html>`)
})
module.exports = router