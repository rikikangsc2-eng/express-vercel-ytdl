const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async (req, res) => {
  const match = req.query.match;
  const wr = req.query.wr;
  const url = 'https://johsteven.github.io/penghitung-wr/winlose.html';

  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const matchInput = document.getElementById('tMatch');
    const wrInput = document.getElementById('tWr');
    const hasilButton = document.getElementById('hasil');

    if (matchInput && wrInput && hasilButton) {
      matchInput.value = match;
      wrInput.value = wr;
      hasilButton.click();

      const resultTextElement = document.getElementById('resultText');
      if (resultTextElement) {
        const resultText = resultTextElement.innerHTML;
        res.status(200).send(resultText);
      } else {
        res.status(500).send('Failed to retrieve result text.');
      }
    } else {
      res.status(500).send('Failed to find input elements or button.');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred: ' + error.message);
  }
};

