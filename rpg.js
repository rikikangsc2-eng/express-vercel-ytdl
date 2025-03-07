const express = require('express');
const axios = require('axios');
const router = express.Router();
const API_ENDPOINT = 'https://copper-ambiguous-velvet.glitch.me/data';
const USER_AGENT = 'Mozilla/5.0';
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
function initializeUser(users, user) {
  if (!users[user]) {
    users[user] = { points: 0, harian: { value: 0, expires: Date.now() + 86400000 } };
  } else {
    if (!users[user].harian) users[user].harian = { value: 0, expires: Date.now() + 86400000 };
  }
}
function initializeRPG(users, user) {
  if (!users[user].rpg) {
    users[user].rpg = { level: 1, exp: 0, hp: 120, maxHp: 120, atk: 12, def: 7, gold: 60, inventory: [], equippedWeapon: { id: 0, name: "Wooden Sword", level: 1, xp: 0, bonus: 2, baseCost: 10 } };
  }
}
router.get('/rpg', async (req, res) => {
  res.send("sedang di kerjakan");
});
router.get('/contoh', async (req, res) => {
  const usersData = await apiGetData('users');
  initializeUser(usersData.users, "contohUser");
  initializeRPG(usersData.users, "contohUser");
  usersData.users["contohUser"].rpg.test = "ini contoh";
  await apiWriteData('users', usersData);
  const newData = await apiGetData('users');
  res.send("Contoh Write and Read Data: " + JSON.stringify(newData.users["contohUser"]));
});
module.exports = router;