const express = require('express');
const axios = require('axios');
const openaiTokenCounter = require('openai-gpt-token-counter');
const router = express.Router();
const API_ENDPOINT = 'https://copper-ambiguous-velvet.glitch.me/data';
const USER_AGENT = 'Mozilla/5.0';
const GEMMA_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMMA_MODEL_NAME = "gemma2-9b-it";
const API_KEY = "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";
const DEFAULT_GENERATION_CONFIG = { max_tokens: 512, stream: false, stop: null, temperature: 0.8, top_p: 0.9 };

const systemPrompt = (money, inventory, persona) => `
[ System Prompt ]
Kamu adalah Game Master untuk permainan kehidupan nyata. Tugasmu adalah membuat cerita petualangan yang realistis dan interaktif, mengisahkan perjalanan dari kesulitan menuju kesuksesan dengan mengatasi kesendirian. Berikut aturan main dan marker yang harus digunakan:
1. Setiap situasi permainan disajikan dalam bentuk narasi. Pemain dapat memilih jawaban dari opsi yang tersedia (A, B, C, D) atau menuliskan narasi teks mereka sendiri untuk melanjutkan cerita.
2. Manajemen inventori:
   - Menyimpan item: gunakan marker [itemSave=nama_item]
   - Menghapus item: gunakan marker [itemDelete=nama_item]
3. Manajemen uang:
   - Menyimpan uang: gunakan marker [moneySave=jumlah_uang]
4. Manajemen persona:
   - Menambahkan persona: gunakan marker [personaAdd=deskripsi_persona]
   - Menghapus persona: gunakan marker [personaDelete=deskripsi_persona]
5. Pemain dapat membeli atau menjual barang sesuai situasi yang diberikan dalam cerita.
6. Cerita harus mencerminkan realitas kehidupan dengan tantangan nyata dan perjalanan menuju kesuksesan, bukan fantasi.
7. Tulis pilihan dengan jelas, baik itu berupa opsi (A, B, C, D) atau narasi teks yang sesuai dengan situasi yang diberikan.
Live Data Pemain:
Money: ${money}
Inventory: ${inventory.length ? inventory.join(', ') : 'None'}
Persona: ${persona.length ? persona.join(', ') : 'None'}
`;

const apiGetData = async (dataType) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/${dataType}`, { headers: { 'User-Agent': USER_AGENT } });
    return response.data;
  } catch (e) {
    return { users: {} };
  }
};

const apiWriteData = async (dataType, data) => {
  try {
    await axios.post(`${API_ENDPOINT}/${dataType}`, data, { headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/json' } });
    return true;
  } catch (e) {
    return false;
  }
};

const manageTokenCount = (history) => {
  let msgs = history.filter(m => m.role !== "system"), total = openaiTokenCounter.chat(msgs, "gpt-4");
  while (total > 1024 && history.filter(m => m.role !== "system").length > 1) {
    for (let i = 0; i < history.length; i++) {
      if (history[i].role !== "system") {
        history.splice(i, 1);
        break;
      }
    }
    msgs = history.filter(m => m.role !== "system");
    total = openaiTokenCounter.chat(msgs, "gpt-4");
  }
  return history;
};

router.get('/rpg', async (req, res) => {
  const user = req.query.user;
  const text = req.query.q;
  if (!user || !text) {
    return res.send("Parameter 'user' dan 'q' diperlukan.");
  }
  let usersData = await apiGetData('users');
  if (!usersData.users[user]) {
    usersData.users[user] = { rpg: { history: [], money: 0, inventory: [], persona: [] } };
  } else if (!usersData.users[user].rpg) {
    usersData.users[user].rpg = { history: [], money: 0, inventory: [], persona: [] };
  } else {
    if (usersData.users[user].rpg.money === undefined) {
      usersData.users[user].rpg.money = 0;
    }
    if (!Array.isArray(usersData.users[user].rpg.inventory)) {
      usersData.users[user].rpg.inventory = [];
    }
    if (!Array.isArray(usersData.users[user].rpg.persona)) {
      usersData.users[user].rpg.persona = [];
    }
  }
  if (text.toLowerCase() === "reset") {
    usersData.users[user].rpg = { history: [], money: 0, inventory: [], persona: [] };
    await apiWriteData('users', usersData);
    return res.send("Data dan riwayat percakapan telah direset.");
  }
  if (text.toLowerCase() === "inv") {
    return res.send(`*Live Data:*\n*Money:* _${usersData.users[user].rpg.money}_\n*Inventory:* _${usersData.users[user].rpg.inventory.length ? usersData.users[user].rpg.inventory.join(', ') : 'None'}_\n*Persona:* _${usersData.users[user].rpg.persona.length ? usersData.users[user].rpg.persona.join(', ') : 'None'}_`);
  }
  const history = usersData.users[user].rpg.history;
  history.push({ role: "user", content: text });
  const updatedHistory = manageTokenCount(history);
  let messages = [{ role: "system", content: systemPrompt(usersData.users[user].rpg.money, usersData.users[user].rpg.inventory, usersData.users[user].rpg.persona) }];
  messages.push(...updatedHistory);
  let responseText;
  try {
    const response = await axios.post(GEMMA_API_URL, { model: GEMMA_MODEL_NAME, messages, ...DEFAULT_GENERATION_CONFIG }, { headers: { Authorization: `Bearer ${API_KEY}` } });
    responseText = response.data.choices[0].message.content;
    let modifiedResponse = responseText;
    const itemSaveRegex = /\[itemSave=([^\]]+)\]/g;
    const itemDeleteRegex = /\[itemDelete=([^\]]+)\]/g;
    const moneySaveRegex = /\[moneySave=([^\]]+)\]/g;
    const personaAddRegex = /\[personaAdd=([^\]]+)\]/g;
    const personaDeleteRegex = /\[personaDelete=([^\]]+)\]/g;
    let match;
    while ((match = itemSaveRegex.exec(modifiedResponse)) !== null) {
      const item = match[1].trim();
      if (!usersData.users[user].rpg.inventory.includes(item)) {
        usersData.users[user].rpg.inventory.push(item);
      }
    }
    modifiedResponse = modifiedResponse.replace(itemSaveRegex, "");
    while ((match = itemDeleteRegex.exec(modifiedResponse)) !== null) {
      const item = match[1].trim();
      usersData.users[user].rpg.inventory = usersData.users[user].rpg.inventory.filter(i => i !== item);
    }
    modifiedResponse = modifiedResponse.replace(itemDeleteRegex, "");
    while ((match = moneySaveRegex.exec(modifiedResponse)) !== null) {
      const amount = parseInt(match[1].trim());
      if (!isNaN(amount)) {
        usersData.users[user].rpg.money = (usersData.users[user].rpg.money || 0) + amount;
      }
    }
    modifiedResponse = modifiedResponse.replace(moneySaveRegex, "");
    while ((match = personaAddRegex.exec(modifiedResponse)) !== null) {
      const p = match[1].trim();
      if (!usersData.users[user].rpg.persona.includes(p)) {
        usersData.users[user].rpg.persona.push(p);
      }
    }
    modifiedResponse = modifiedResponse.replace(personaAddRegex, "");
    while ((match = personaDeleteRegex.exec(modifiedResponse)) !== null) {
      const p = match[1].trim();
      usersData.users[user].rpg.persona = usersData.users[user].rpg.persona.filter(pp => pp !== p);
    }
    modifiedResponse = modifiedResponse.replace(personaDeleteRegex, "");
    updatedHistory.push({ role: "assistant", content: modifiedResponse });
    usersData.users[user].rpg.history = updatedHistory;
    await apiWriteData('users', usersData);
    res.send(modifiedResponse);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      return res.send("Terlalu sering membuat permintaan dalam waktu dekat!");
    } else {
      return res.send(`API Error: ${error.message}`);
    }
  }
});

module.exports = router;