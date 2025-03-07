const express = require('express');
const axios = require('axios');
const router = express.Router();
const API_ENDPOINT = 'https://copper-ambiguous-velvet.glitch.me/data';
const USER_AGENT = 'Mozilla/5.0';
const apiGetData = async (dataType) => { try { const response = await axios.get(`${API_ENDPOINT}/${dataType}`, { headers: { 'User-Agent': USER_AGENT } }); return response.data; } catch(e) { return { users: {} }; } };
const apiWriteData = async (dataType, data) => { try { await axios.post(`${API_ENDPOINT}/${dataType}`, data, { headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/json' } }); return true; } catch(e) { return false; } };
function initializeUser(users, user) { if (!users[user]) { users[user] = { points: 0, harian: { value: 0, expires: Date.now() + 86400000 } }; } else { if (!users[user].harian) { users[user].harian = { value: 0, expires: Date.now() + 86400000 }; } } }
function initializeRPG(users, user) {
  if (!users[user].rpg) {
    users[user].rpg = { level: 1, exp: 0, hp: 120, maxHp: 120, atk: 12, def: 7, gold: 60, inventory: [], equippedWeapon: { id: 0, name: "Wooden Sword", level: 1, xp: 0, bonus: 2, baseCost: 10 }, artifacts: [], books: [], currentEncounter: null, globalQuestProgress: 0, globalQuestCompleted: false, lastRecovery: Date.now(), lastHealTime: 0, lastEksplorTime: 0, lastLatihanTime: 0, adventureStartGold: 0, adventureStartExp: 0, adventureArtifactCount: 0 };
  } else { if (!Array.isArray(users[user].rpg.artifacts)) users[user].rpg.artifacts = []; if (!Array.isArray(users[user].rpg.books)) users[user].rpg.books = []; }
}
const monsterList = [
  { name: 'Goblin', baseHp: 70, hpFactor: 15, baseAtk: 10, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 30 },
  { name: 'Orc', baseHp: 80, hpFactor: 16, baseAtk: 11, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 35 },
  { name: 'Troll', baseHp: 100, hpFactor: 18, baseAtk: 12, atkFactor: 4, baseDef: 7, defFactor: 3, baseExp: 40 },
  { name: 'Slime', baseHp: 60, hpFactor: 10, baseAtk: 8, atkFactor: 2, baseDef: 4, defFactor: 1, baseExp: 25 },
  { name: 'Imp', baseHp: 50, hpFactor: 12, baseAtk: 9, atkFactor: 3, baseDef: 3, defFactor: 1, baseExp: 20 }
];
function generateMonster(playerLevel) {
  const selected = monsterList[Math.floor(Math.random() * monsterList.length)];
  const level = Math.max(1, Math.floor(Math.random() * playerLevel) + 1);
  const hp = selected.baseHp + level * selected.hpFactor + Math.floor(Math.random() * 20);
  const atk = selected.baseAtk + level * selected.atkFactor + Math.floor(Math.random() * 5);
  const def = selected.baseDef + level * selected.defFactor + Math.floor(Math.random() * 3);
  const expReward = selected.baseExp + level * 10;
  return { name: selected.name, level, hp, atk, def, expReward };
}
const villainList = [
  { name: 'Bandit Raja', baseHp: 80, hpFactor: 14, baseAtk: 12, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 40 },
  { name: 'Penjahat Misterius', baseHp: 70, hpFactor: 13, baseAtk: 11, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 35 },
  { name: 'Pengkhianat', baseHp: 90, hpFactor: 16, baseAtk: 13, atkFactor: 4, baseDef: 7, defFactor: 3, baseExp: 45 },
  { name: 'Pembunuh Bayaran', baseHp: 75, hpFactor: 15, baseAtk: 12, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 40 },
  { name: 'Pencuri', baseHp: 60, hpFactor: 10, baseAtk: 9, atkFactor: 3, baseDef: 4, defFactor: 1, baseExp: 25 }
];
function generateVillain(playerLevel) {
  const selected = villainList[Math.floor(Math.random() * villainList.length)];
  const level = Math.max(1, Math.floor(Math.random() * playerLevel) + 1);
  const hp = selected.baseHp + level * selected.hpFactor + Math.floor(Math.random() * 20);
  const atk = selected.baseAtk + level * selected.atkFactor + Math.floor(Math.random() * 5);
  const def = selected.baseDef + level * selected.defFactor + Math.floor(Math.random() * 3);
  const expReward = selected.baseExp + level * 10;
  return { name: selected.name, level, hp, atk, def, expReward };
}
const artifactStore = [
  { id: 1, name: 'Cincin Sang Fajar', costGold: 10, upgradeValue: 15 },
  { id: 2, name: 'Medali Bayangan', costGold: 15, upgradeValue: 22 },
  { id: 3, name: 'Amulet Kemenangan', costGold: 20, upgradeValue: 30 },
  { id: 4, name: 'Gelang Angkasa', costGold: 25, upgradeValue: 35 },
  { id: 5, name: 'Kalung Kehidupan', costGold: 30, upgradeValue: 45 },
  { id: 6, name: 'Pedang Legenda', costGold: 35, upgradeValue: 50 },
  { id: 7, name: 'Permata Surya', costGold: 40, upgradeValue: 55 },
  { id: 8, name: 'Batu Waktu', costGold: 45, upgradeValue: 60 },
  { id: 9, name: 'Topeng Misteri', costGold: 50, upgradeValue: 65 },
  { id: 10, name: 'Jimat Keabadian', costGold: 55, upgradeValue: 70 },
  { id: 11, name: 'Talisman Nirwana', costGold: 60, upgradeValue: 75 },
  { id: 12, name: 'Totem Penguasa', costGold: 65, upgradeValue: 80 },
  { id: 13, name: 'Mahkota Bintang', costGold: 70, upgradeValue: 85 },
  { id: 14, name: 'Tongkat Surga', costGold: 75, upgradeValue: 90 },
  { id: 15, name: 'Permata Abadi', costGold: 80, upgradeValue: 100 }
];
function generateArtifactEncounter() { let index = Math.floor(Math.pow(Math.random(), 2) * artifactStore.length); return { ...artifactStore[index] }; }
const bookNames = [ "Grimoire of the Eternal Flame", "Codex of the Celestial Oracle", "Tome of Mystic Whispers", "Chronicle of the Forgotten Realms", "Manual of the Arcane Arts", "Scripture of Divine Light", "Annals of the Shadow Realm", "Book of Abyssal Echoes", "Volume of Silent Dawn", "Ledger of Cosmic Truths", "Register of the Timeless One", "Diaries of the Wandering Sage", "Memoirs of the Storm Bringer", "Journal of Lunar Prophecy", "Records of the Starborne" ];
const moveList = [ "Flame Strike", "Celestial Burst", "Mystic Wind", "Shadow Slash", "Divine Smite", "Abyssal Grasp", "Solar Flare", "Lunar Eclipse", "Storm Call", "Cosmic Ray", "Arcane Surge", "Ethereal Wave", "Phantom Rush", "Spectral Blade", "Temporal Shift" ];
function getRandomMoves(n) { let shuffled = moveList.slice(); for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; } return shuffled.slice(0, n); }
const resourceList = [ { type: 'buah', name: 'Buah Ajaib' }, { type: 'sungai', name: 'Sungai Berkah' }, { type: 'danau', name: 'Danau Ajaib' }, { type: 'pohon', name: 'Pohon Sakti' }, { type: 'gua', name: 'Gua Mistis' }, { type: 'hutan', name: 'Hutan Sunyi' }, { type: 'padang', name: 'Padang Ilahi' }, { type: 'reruntuhan', name: 'Reruntuhan Kuno' }, { type: 'kuil', name: 'Kuil Rahasia' }, { type: 'pegunungan', name: 'Pegunungan Perkasa' } ];
function generateEncounterBattle(playerLevel) { return Math.random() < 0.5 ? { type: 'battle', encounter: 'monster', enemy: generateMonster(playerLevel) } : { type: 'battle', encounter: 'villain', enemy: generateVillain(playerLevel) }; }
function generateEncounterResource() { return Math.random() < 0.8 ? (() => { let res = resourceList[Math.floor(Math.random() * resourceList.length)]; return { type: 'resource', resourceType: res.type, name: res.name }; })() : (() => { let randomBookName = bookNames[Math.floor(Math.random() * bookNames.length)]; let book = { name: randomBookName, moves: getRandomMoves(3) }; return { type: 'resource', resourceType: 'kitab', book: book }; })(); }
function calculateWinChance(player, enemy) { return Math.min(100, Math.floor((player.hp / (enemy.hp + 1)) * 100)); }
function checkPlayerLevelUp(player, log) { while (player.exp >= player.level * 100) { player.exp -= player.level * 100; player.level++; player.maxHp += 10; player.atk += 2; player.def += 1; if (player.hp > player.maxHp) player.hp = player.maxHp; log += `\n*Level Up!* Level sekarang: ${player.level} (MaxHP+10, ATK+2, DEF+1)`; } return log; }
function processBattle(player) {
  let enemy = player.currentEncounter.enemy, log = `> Pertempuran Dimulai\n`, startHP = player.hp, rounds = 0;
  while (enemy.hp > 0 && player.hp > 0) {
    rounds++;
    let bonus = player.equippedWeapon ? Number(player.equippedWeapon.bonus) : 0;
    let maxDmg = Math.max(player.atk + bonus - enemy.def, 1);
    let dmg = Math.floor(maxDmg * (Math.random() * 0.1 + 0.9));
    if (player.books && player.books.length > 0 && Math.random() < 0.3) {
      let book = player.books[Math.floor(Math.random() * player.books.length)];
      let move = book.moves[Math.floor(Math.random() * book.moves.length)];
      let extra = Math.floor(Math.random() * 11) + 5;
      dmg += extra;
      log += `\`Jurus:\` Pakai _${move}_ dari ${book.name} (+${extra} dmg).\n`;
    }
    enemy.hp -= dmg;
    log += `\`Serangan ${rounds}:\` Beri ${dmg} dmg ke ${enemy.name}.\n`;
    if (enemy.hp <= 0) break;
    let dmgP = Math.max(enemy.atk - player.def, 1);
    player.hp -= dmgP;
    log += `${enemy.name} balas +${dmgP} dmg.\n`;
  }
  if (player.hp <= 0) { log += `_Kalah setelah ${rounds} serangan._\nPendapatan: *${player.gold - player.adventureStartGold}* emas, *${player.exp - player.adventureStartExp}* EXP, Artefak: ${player.artifacts.slice(player.adventureArtifactCount).map(a => a.name).join(', ') || 'Tidak ada'}.`; }
  else { log += `*Menang!* Kalah ${enemy.name} dalam ${rounds} serangan.\n`; if (Math.random() < 0.6) { if (Math.random() < 0.15) { let td = Math.floor(player.maxHp * 0.1); player.hp = Math.max(player.hp - td, 0); log += `~Jebakan emas: -${td} HP.\n`; } else { let gold = Math.floor(Math.random() * (35 - 10 + 1)) + 10; player.gold += gold; log += `Dapat ${gold} emas.\n`; } } if (Math.random() < 0.4) { if (Math.random() < 0.15) { let td = Math.floor(player.maxHp * 0.05); player.hp = Math.max(player.hp - td, 0); log += `~Jebakan artefak: -${td} HP.\n`; } else { let art = generateArtifactEncounter(); player.artifacts.push(art); log += `Dapat artefak: ${art.name} (XP+${art.upgradeValue}).\n`; } } player.exp += enemy.expReward; log += `Dapat ${enemy.expReward} EXP.\n`; let lost = startHP - player.hp; let rec = Math.floor(lost * (0.5 + Math.random() * 0.3)); player.hp = Math.min(player.hp + rec, player.maxHp); log += `Pulihkan ${rec} HP.\n`; log = checkPlayerLevelUp(player, log); }
  player.currentEncounter = null; return log;
}
function processResource(player, action) {
  let enc = player.currentEncounter, msg = '';
  if (enc.resourceType === 'kitab') { player.books.push(enc.book); msg = `Pelajari ${enc.book.name}: jurus ${enc.book.moves.join(', ')}.`; }
  else if (enc.resourceType === 'pohon') { player.atk += 2; msg = `Pohon Sakti: ATK +2 permanen.`; }
  else if (enc.resourceType === 'gua') { if (Math.random() < 0.5) { let bg = Math.floor(Math.random() * 21) + 10; player.gold += bg; msg = `Harta di ${enc.name}: ${bg} emas.`; } else { let tr = Math.floor(player.maxHp * 0.1); player.hp = Math.max(player.hp - tr, 0); msg = `Jebakan di ${enc.name}: -${tr} HP.`; } }
  else if (enc.resourceType === 'hutan') { player.exp += 20; msg = `Hutan Sunyi: +20 EXP.`; }
  else if (enc.resourceType === 'padang') { player.atk += 1; msg = `Padang Ilahi: ATK +1 permanen.`; }
  else if (enc.resourceType === 'reruntuhan') { let gf = Math.floor(Math.random() * 16) + 10; player.gold += gf; msg = `Reruntuhan Kuno: ${gf} emas.`; }
  else if (enc.resourceType === 'kuil') { if (Math.random() < 0.5) { let art = generateArtifactEncounter(); player.artifacts.push(art); msg = `Kuil Rahasia: artefak ${art.name} (XP+${art.upgradeValue}).`; } else { let be = 30; player.exp += be; msg = `Kuil Rahasia: +${be} EXP.`; } }
  else if (enc.resourceType === 'pegunungan') { if (Math.random() < 0.5) { let bg = Math.floor(Math.random() * 26) + 15; player.gold += bg; msg = `Pegunungan: deposit emas ${bg}.`; } else { player.def += 1; msg = `Pegunungan: DEF +1 permanen.`; } }
  else { if (Math.random() < 0.2) { let pn = Math.floor(player.maxHp * (0.1 + Math.random() * 0.1)); player.hp = Math.max(player.hp - pn, 0); msg = `~Beracun: -${pn} HP.~`; } else { let ha = Math.floor(player.maxHp * (0.2 + Math.random() * 0.6)); player.hp = Math.min(player.hp + ha, player.maxHp); msg = `Pulihkan ${ha} HP.`; } }
  player.currentEncounter = null; return msg;
}
function processLatihan(player) {
  let now = Date.now();
  if (now - player.lastLatihanTime < 1800000) return `Latihan on cooldown.`;
  if (player.books.length === 0) return `Tidak ada buku untuk latihan.`;
  player.books.pop();
  player.atk += 3;
  player.lastLatihanTime = now;
  return `Latihan sukses. ATK +3 permanen.`;
}
function processHeal(player) {
  let now = Date.now();
  if (now - player.lastHealTime < 300000) return `Heal on cooldown.`;
  player.hp = player.maxHp;
  player.lastHealTime = now;
  return `Heal sukses. HP penuh.`;
}
function processMisi(player) {
  if (player.currentEncounter) return `Encounter sudah aktif.`;
  player.adventureStartGold = player.gold;
  player.adventureStartExp = player.exp;
  let enc = generateEncounterBattle(player.level);
  player.currentEncounter = enc;
  let wc = calculateWinChance(player, enc.enemy);
  return `> Misi\nHadapi ${enc.encounter} ${enc.enemy.name} (Lvl ${enc.enemy.level}, HP ${enc.enemy.hp}).\nHP: ${player.hp}/${player.maxHp} | Peluang Menang: ${wc}%\nKetik _serang_ untuk menyerang atau _kabur_ untuk kabur.`;
}
function processEksplor(player) {
  let now = Date.now();
  if (now - player.lastEksplorTime < 600000) return `Eksplorasi on cooldown.`;
  if (player.currentEncounter) return `Encounter sudah aktif.`;
  player.adventureStartGold = player.gold;
  player.adventureStartExp = player.exp;
  let enc = generateEncounterResource();
  player.currentEncounter = enc;
  return enc.resourceType === 'kitab' ? `> Eksplor\nTemukan ${enc.book.name}. Ketik _ambil_ untuk mempelajari jurus atau _lewati_ untuk melewati.` : `> Eksplor\nTemukan ${enc.name}. Ketik _ambil_ untuk mengambil atau _lewati_ untuk melewati.`;
}
function processLewati(player) { player.currentEncounter = null; return `Encounter dilewati.`; }
function processSerang(player) { return player.currentEncounter && player.currentEncounter.type === 'battle' ? processBattle(player) : `Tidak ada pertarungan aktif.`; }
function processKabur(player) { if (!player.currentEncounter || player.currentEncounter.type !== 'battle') return `Tidak ada pertarungan aktif.`; player.currentEncounter = null; return `Kabur sukses.`; }
function processRestart(usersData, user) {
  usersData.users[user].rpg = { level: 1, exp: 0, hp: 120, maxHp: 120, atk: 12, def: 7, gold: 60, inventory: [], equippedWeapon: { id: 0, name: "Wooden Sword", level: 1, xp: 0, bonus: 2, baseCost: 10 }, artifacts: [], books: [], currentEncounter: null, globalQuestProgress: 0, globalQuestCompleted: false, lastRecovery: Date.now(), lastHealTime: 0, lastEksplorTime: 0, lastLatihanTime: 0, adventureStartGold: 0, adventureStartExp: 0, adventureArtifactCount: 0 };
  return `> Game Restarted\nData RPG direset.`;
}
router.get('/rpg', async (req, res) => {
  const user = req.query.user;
  const inputText = req.query.query ? req.query.query.trim() : '';
  const now = Date.now();
  const usersData = await apiGetData('users');
  initializeUser(usersData.users, user);
  initializeRPG(usersData.users, user);
  const player = usersData.users[user].rpg;
  let recover = Math.floor((player.maxHp - player.hp) * 0.2);
  if (now - player.lastRecovery >= 1800000) { player.hp = Math.min(player.hp + recover, player.maxHp); player.lastRecovery = now; }
  let args = inputText.split(' ');
  let cmd = args[0].toLowerCase(), responseMsg = '';
  switch (cmd) {
    case 'misi':
      responseMsg = processMisi(player);
      break;
    case 'eksplor':
      responseMsg = processEksplor(player);
      break;
    case 'serang':
      responseMsg = processSerang(player);
      break;
    case 'kabur':
      responseMsg = processKabur(player);
      break;
    case 'ambil':
      if (!player.currentEncounter || player.currentEncounter.type !== 'resource') responseMsg = `Tidak ada resource untuk diambil.`;
      else { responseMsg = processResource(player, 'ambil'); player.lastEksplorTime = now; }
      break;
    case 'lewati':
      if (!player.currentEncounter || player.currentEncounter.type !== 'resource') responseMsg = `Tidak ada resource untuk dilewati.`;
      else { responseMsg = processLewati(player); }
      break;
    case 'latihan':
      responseMsg = processLatihan(player);
      break;
    case 'heal':
      responseMsg = processHeal(player);
      break;
    case 'toko':
      if (args.length < 2) responseMsg = `Gunakan: toko artefak [nomor] [jumlah]`;
      else if (args[1].toLowerCase() === 'artefak') {
        if (args.length === 2) { let listMsg = `> Toko Artefak\n`; artifactStore.forEach(art => { listMsg += `\`${art.id}\`. ${art.name} - *${art.costGold}* emas, XP bonus: *${art.upgradeValue}*\n`; }); listMsg += `Untuk membeli: toko artefak [nomor] [jumlah]`; responseMsg = listMsg; }
        else if (args.length >= 3) { let id = parseInt(args[2]); let quantity = args.length >= 4 ? parseInt(args[3]) : 1; let selected = artifactStore.find(a => a.id === id); if (!selected) responseMsg = `Artefak tidak ditemukan.`; else { let totalCost = selected.costGold * quantity; if (player.gold < totalCost) responseMsg = `Emas nggak cukup! Butuh *${totalCost}* emas.`; else { player.gold -= totalCost; for (let i = 0; i < quantity; i++) { player.artifacts.push({ name: selected.name, xp: selected.upgradeValue }); } responseMsg = `Pembelian berhasil: *${quantity}* ${selected.name} masuk ke inventory artefak.`; } } }
      } else responseMsg = `Perintah toko tidak valid.`;
      break;
    case 'inv':
      responseMsg = `> Inventory\nSenjata:\n${player.inventory.length === 0 ? "Kosong." : player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level}, XP:${w.xp}, Bonus:${w.bonus})`).join('\n')}\n\nArtefak:\n${player.artifacts.length ? player.artifacts.map((a, i) => `${i + 1}. ${a.name} (XP:${a.xp})`).join('\n') : "Tidak ada"}\n\nKitab:\n${player.books.length ? player.books.map((b, i) => `${i + 1}. ${b.name}`).join('\n') : "Tidak ada"}`;
      break;
    case 'pakai':
      if (player.inventory.length === 0) responseMsg = `Inventory senjata kosong.`;
      else { let idx = parseInt(args[1]) - 1; if (isNaN(idx) || idx < 0 || idx >= player.inventory.length) responseMsg = `Indeks senjata tidak valid.`; else { player.equippedWeapon = player.inventory[idx]; if (player.equippedWeapon.xp == null) player.equippedWeapon.xp = 0; responseMsg = `Senjata *${player.equippedWeapon.name}* sudah dipakai.`; } }
      break;
    case 'jual':
      if (player.inventory.length === 0) responseMsg = `Inventory senjata kosong.`;
      else { let idx = parseInt(args[1]) - 1; if (isNaN(idx) || idx < 0 || idx >= player.inventory.length) responseMsg = `Indeks senjata tidak valid.`; else { let soldWeapon = player.inventory.splice(idx, 1)[0]; let sellGold = Math.floor((soldWeapon.baseCost || 10) / 2); player.gold += sellGold; if (player.equippedWeapon && player.equippedWeapon.id === soldWeapon.id) player.equippedWeapon = null; responseMsg = `Senjata *${soldWeapon.name}* dijual, dapat *${sellGold}* emas.`; } }
      break;
    case 'tempa':
      if (!player.equippedWeapon) responseMsg = `Kamu harus memakai senjata terlebih dahulu untuk menempa.`;
      else if (player.artifacts.length === 0) responseMsg = `Inventory artefak kosong.`;
      else { if (args.length < 3) responseMsg = `Gunakan: tempa [nomor artefak] [jumlah]`; else { let artIdx = parseInt(args[1]) - 1; let qty = parseInt(args[2]); if (isNaN(artIdx) || artIdx < 0 || artIdx >= player.artifacts.length) responseMsg = `Indeks artefak tidak valid.`; else if (isNaN(qty) || qty < 1) responseMsg = `Jumlah artefak tidak valid.`; else { let selectedArtifact = player.artifacts[artIdx]; let count = player.artifacts.filter(a => a.name === selectedArtifact.name).length; if (count < qty) responseMsg = `Kamu tidak memiliki cukup artefak *${selectedArtifact.name}*.`; else { let removed = 0; player.artifacts = player.artifacts.filter(a => { if (a.name === selectedArtifact.name && removed < qty) { removed++; return false; } return true; }); let currentXp = Number(player.equippedWeapon.xp) || 0; currentXp += qty * selectedArtifact.xp; player.equippedWeapon.xp = currentXp; let forgeMsg = `XP senjata bertambah *${qty * selectedArtifact.xp}*.`; while (player.equippedWeapon.xp >= 100) { player.equippedWeapon.xp -= 100; player.equippedWeapon.level++; player.equippedWeapon.bonus++; forgeMsg += ` Senjata naik level ke *${player.equippedWeapon.level}*!`; } responseMsg = forgeMsg; } } } break };
    case 'restart':
      if (args[1] && args[1].toLowerCase() === 'y') responseMsg = processRestart(usersData, user);
      else responseMsg = `Konfirmasi restart: ketik _restart y_ untuk reset data RPG.`;
      break;
    default:
      responseMsg = "Perintah tidak dikenal. Coba: `misi`, `eksplor`, `serang`, `kabur`, `ambil`, `lewati`, `latihan`, `heal`, `toko` `artefak`, `inv`, `pakai`, `jual`, `tempa`, `restart`.";
  }
  await apiWriteData('users', usersData);
  res.send(responseMsg);
});
module.exports = router;