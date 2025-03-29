const axios = require('axios');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  try {
    const inputHTML = `<div class="ace_content" style="transform: translate(0px, 0px); width: 251.398px; height: 441px;"><div class="ace_layer ace_print-margin-layer"><div class="ace_print-margin" style="left: 772px; visibility: hidden;"></div></div><div class="ace_layer ace_marker-layer"><div class="ace_active-line" style="height: 19px; top: 0px; left: 0px; right: 0px;"></div></div><div class="ace_layer ace_text-layer" style="height: 1e+06px; margin: 0px 4px; transform: translate(0px, 0px);"><div class="ace_line_group" style="height: 19px; top: 0px;"><div class="ace_line" style="height: 19px;"></div></div></div><div class="ace_layer ace_marker-layer"></div><div class="ace_layer ace_cursor-layer ace_hidden-cursors"><div class="ace_cursor" style="display: block; transform: translate(4px, 0px); width: 10px; height: 19px; animation-duration: 1000ms;"></div></div><div class="ace_placeholder">Paste or type your data here....</div></div>`;
    const data = `input=${encodeURIComponent(inputHTML)}&type=javascript&renameVariables=on&renameGlobals=off&stringArray=on&stringArrayThreshold=75&deadCodeInjection=off&deadCodeThreshold=40&controlFlowFlattening=off&controlFlowThreshold=75&unicodeEscapeSequence=off&selfDefending=off&sourceMap=off&compact=on&identifierNamesGenerator=hexadecimal`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
      'Referer': 'https://codebeautify.org/javascript-obfuscator',
    };

    const response = await axios.post('https://codebeautify.org/javascript-obfuscator', data, { headers });
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const outputElement = document.querySelector('#output');

    if (outputElement) {
      res.send(outputElement.value);
    } else {
      res.status(500).send('Output element not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during scraping');
  }
};
