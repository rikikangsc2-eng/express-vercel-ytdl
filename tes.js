const axios = require('axios');

module.exports = (req, res) => {
  const text = req.query.text;
  const payload = {
    type: "chat",
    messagesHistory: "18",
    id: "190462-70-0557-4a1d-a586-b57dcccs425",
    fun: "you",
    content: text || "Apa kabar"
  };

  axios.post('https://ai-chats.org/id/chat/send2/', payload, {
    headers: {
      'authority': 'ai-chats.org',
      'method': 'POST',
      'path': '/id/chat/send2/',
      'scheme': 'https',
      'Accept': 'application/json, text/event-stream',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Content-Length': JSON.stringify(payload).length,
      'Content-Type': 'application/json',
      'Cookie': '_csrf-front=85e571047b952eb186318f943f5eeda3bfe05cc1304a7423cf88704e5531fdb3a%3A2%3A%7Bi%3A0%3Bs%3A11%3A%22_csrf-front%22%3Bi%3A1%3Bs%3A2%3A%22oztuDx3aJvH_H8sgwvwqBBD0cD8bhfh_%22%3B%7D; _ga=GA1.1.1633966362.1742560922; _ga_46H1P6C2LK=GS1.1.1742560922.1.1.1742560952.0.0.0; cf_clearance=yqkLvM5PozKRvhT7SymcJNezmwjv70LCx3ewWrAttfw-1742560953-1.2.1.1-vrT_CaxGrBcwOQsCcqtb.jrE5BoSnRB.5rf4eDTvLDbpUgJSdXW1k65A1WJ0yu7YvvcL.JoXkK32x_Yfudc0Z1JfpLrqpajDqFpV0B3oWmn2GGRc7CynsgbMnrbyYynctwexzBO18HiN2ENwPtrZcITJC7qMOcER4ezltHihqtxjgK7g1ICFT_BGWhw_FaJGB8RLKep0SeVPX59f8YFojyUhIM.mD.f7CPSoMof4b_KZJHBRSNQH_Z6R_Lt8vY0bvhWd2z7eGeAQb0CbKcmwtb1.j2m7g7G0cTjitMDTiYoQZqbHZw1WKVIEy60GJTz1asiyt4wM64dE9IAmEVp.gitbkqN0gbqN1t6vFsjlEBNI',
      'Origin': 'https://ai-chats.org',
      'Referer': 'https://ai-chats.org/id/chat/',
      'Sec-Ch-Ua': '"Not A(Brand";v="8", "Chromium";v="132"',
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-Ua-Platform': '"Android"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
    }
  })
  .then(response => {
    res.json(response.data);
  })
  .catch(error => {
    res.status(500).json({ error: error.message });
  });
};
