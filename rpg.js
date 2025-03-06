const express = require('express');
const axios = require('axios');
const router = express.Router();
const API_ENDPOINT = 'https://copper-ambiguous-velvet.glitch.me/data';
const USER_AGENT = 'Mozilla/5.0';

const apiGetData = async (dataType) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/${dataType}`, { headers: { 'User-Agent': USER_AGENT } });
    return response.data;
  } catch (error) {
    return { users: {}, rooms: {} };
  }
};

const apiWriteData = async (dataType, data) => {
  try {
    await axios.post(`${API_ENDPOINT}/${dataType}`, data, { headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/json' } });
    return true;
  } catch (error) {
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
    users[user].rpg = { level: 1, exp: 0, hp: 100, maxHp: 100, atk: 10, def: 5, gold: 50, inventory: [], equippedWeapon: null, artifacts: [], globalQuestProgress: 0, globalQuestCompleted: false, lastRecovery: Date.now(), adventureStartGold: 0, adventureStartExp: 0, adventureArtifactCount: 0 };
  } else {
    if (!Array.isArray(users[user].rpg.artifacts)) {
      users[user].rpg.artifacts = [];
    }
  }
}

function generateMonster(playerLevel) {
  const monsters = [
    { name: 'Goblin', baseHp: 70, hpFactor: 15, baseAtk: 10, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 30, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Orc', baseHp: 80, hpFactor: 16, baseAtk: 11, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 35, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Troll', baseHp: 90, hpFactor: 18, baseAtk: 12, atkFactor: 4, baseDef: 6, defFactor: 2, baseExp: 40, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Serigala', baseHp: 75, hpFactor: 15, baseAtk: 10, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 30, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Bandit', baseHp: 70, hpFactor: 15, baseAtk: 9, atkFactor: 3, baseDef: 4, defFactor: 2, baseExp: 25, expFactor: 8, baseGold: 10, goldFactor: 4 },
    { name: 'Harpy', baseHp: 65, hpFactor: 14, baseAtk: 9, atkFactor: 3, baseDef: 4, defFactor: 2, baseExp: 25, expFactor: 8, baseGold: 10, goldFactor: 4 },
    { name: 'Zombie', baseHp: 85, hpFactor: 15, baseAtk: 10, atkFactor: 2, baseDef: 7, defFactor: 2, baseExp: 30, expFactor: 9, baseGold: 20, goldFactor: 4 },
    { name: 'Skeleton', baseHp: 60, hpFactor: 12, baseAtk: 8, atkFactor: 3, baseDef: 3, defFactor: 1, baseExp: 20, expFactor: 7, baseGold: 10, goldFactor: 3 },
    { name: 'Wraith', baseHp: 50, hpFactor: 10, baseAtk: 12, atkFactor: 4, baseDef: 2, defFactor: 1, baseExp: 35, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Dragonling', baseHp: 100, hpFactor: 20, baseAtk: 15, atkFactor: 5, baseDef: 10, defFactor: 3, baseExp: 50, expFactor: 15, baseGold: 30, goldFactor: 10 }
  ];
  const selected = monsters[Math.floor(Math.random() * monsters.length)];
  const level = Math.max(1, Math.floor(Math.random() * playerLevel) + 1);
  const hp = selected.baseHp + level * selected.hpFactor + Math.floor(Math.random() * 20);
  const atk = selected.baseAtk + level * selected.atkFactor + Math.floor(Math.random() * 5);
  const def = selected.baseDef + level * selected.defFactor + Math.floor(Math.random() * 3);
  const expReward = selected.baseExp + level * selected.expFactor;
  const goldReward = Math.random() < 0.7 ? (selected.baseGold + level * selected.goldFactor) : 0;
  return { name: selected.name, level, hp, atk, def, expReward, goldReward };
}

function generateVillain(playerLevel) {
  const villains = [
    { name: 'Bandit Raja', baseHp: 80, hpFactor: 14, baseAtk: 12, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 40, expFactor: 10, baseGold: 20, goldFactor: 5 },
    { name: 'Penjahat Misterius', baseHp: 70, hpFactor: 13, baseAtk: 11, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 35, expFactor: 9, baseGold: 18, goldFactor: 4 },
    { name: 'Pengkhianat', baseHp: 90, hpFactor: 16, baseAtk: 13, atkFactor: 4, baseDef: 7, defFactor: 3, baseExp: 45, expFactor: 10, baseGold: 25, goldFactor: 6 },
    { name: 'Pembunuh Bayaran', baseHp: 75, hpFactor: 15, baseAtk: 12, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 40, expFactor: 10, baseGold: 20, goldFactor: 5 },
    { name: 'Tukang Rampok', baseHp: 65, hpFactor: 12, baseAtk: 10, atkFactor: 3, baseDef: 4, defFactor: 2, baseExp: 30, expFactor: 8, baseGold: 15, goldFactor: 4 },
    { name: 'Pencuri', baseHp: 60, hpFactor: 10, baseAtk: 9, atkFactor: 3, baseDef: 4, defFactor: 1, baseExp: 25, expFactor: 7, baseGold: 12, goldFactor: 3 },
    { name: 'Perampok', baseHp: 80, hpFactor: 14, baseAtk: 11, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 40, expFactor: 10, baseGold: 18, goldFactor: 5 },
    { name: 'Pengacau', baseHp: 70, hpFactor: 13, baseAtk: 10, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 35, expFactor: 9, baseGold: 16, goldFactor: 4 },
    { name: 'Penyusup', baseHp: 65, hpFactor: 12, baseAtk: 10, atkFactor: 3, baseDef: 4, defFactor: 1, baseExp: 30, expFactor: 8, baseGold: 15, goldFactor: 4 },
    { name: 'Sang Pengkhianat', baseHp: 95, hpFactor: 16, baseAtk: 14, atkFactor: 4, baseDef: 8, defFactor: 3, baseExp: 50, expFactor: 12, baseGold: 28, goldFactor: 6 }
  ];
  const selected = villains[Math.floor(Math.random() * villains.length)];
  const level = Math.max(1, Math.floor(Math.random() * playerLevel) + 1);
  const hp = selected.baseHp + level * selected.hpFactor + Math.floor(Math.random() * 20);
  const atk = selected.baseAtk + level * selected.atkFactor + Math.floor(Math.random() * 5);
  const def = selected.baseDef + level * selected.defFactor + Math.floor(Math.random() * 3);
  const expReward = selected.baseExp + level * selected.expFactor;
  const goldReward = Math.random() < 0.7 ? (selected.baseGold + level * selected.goldFactor) : 0;
  return { name: selected.name, level, hp, atk, def, expReward, goldReward };
}

function generateArtifactEncounter() {
  const artifacts = [
    { name: 'Jimat Keberuntungan', xp: 20 },
    { name: 'Medali Pahlawan', xp: 30 },
    { name: 'Amulet Kekuatan', xp: 25 },
    { name: 'Cincin Misterius', xp: 15 },
    { name: 'Kalung Legenda', xp: 35 },
    { name: 'Totem Pemimpin', xp: 40 },
    { name: 'Arloji Ajaib', xp: 20 },
    { name: 'Batu Fajar', xp: 25 },
    { name: 'Gelang Satria', xp: 30 },
    { name: 'Pedang Purba', xp: 50 }
  ];
  return artifacts[Math.floor(Math.random() * artifacts.length)];
}

function generateEncounter(playerLevel) {
  const typeRoll = Math.random();
  if (typeRoll < 0.4) {
    return { type: 'battle', encounter: 'monster', enemy: generateMonster(playerLevel) };
  } else if (typeRoll < 0.8) {
    return { type: 'battle', encounter: 'villain', enemy: generateVillain(playerLevel) };
  } else {
    return { type: 'artifact', artifact: generateArtifactEncounter() };
  }
}

router.get('/rpg', async (req, res) => {
  const user = req.query.user;
  const inputText = req.query.query ? req.query.query.trim() : '';
  const roomId = req.query.room || 'default';
  const now = Date.now();
  const usersData = await apiGetData('users');
  const roomsData = await apiGetData('rooms');
  initializeUser(usersData.users, user);
  initializeRPG(usersData.users, user);
  const player = usersData.users[user].rpg;
  if (now - player.lastRecovery >= 1800000) {
    const recover = Math.floor(player.maxHp * 0.2);
    player.hp = Math.min(player.hp + recover, player.maxHp);
    player.lastRecovery = now;
  }
  if (!roomsData.rooms[roomId]) roomsData.rooms[roomId] = {};
  const room = roomsData.rooms[roomId];
  if (!room.rpgEncounter) room.rpgEncounter = {};
  let encounter = room.rpgEncounter[user];
  const args = inputText.split(' ');
  const cmd = args[0].toLowerCase();
  let responseMsg = '';
  switch (cmd) {
    case 'mulai':
      if (player.hp <= 0) {
        responseMsg = 'Yah, HP kamu habis! Tidak bisa mulai petualangan. Coba heal dulu!';
      } else if (encounter) {
        responseMsg = 'Kamu masih dalam petualangan seru! Ketik "berhenti" untuk mengakhiri petualangan ini.';
      } else {
        player.adventureStartGold = player.gold;
        player.adventureStartExp = player.exp;
        player.adventureArtifactCount = player.artifacts.length;
        const newEncounter = generateEncounter(player.level);
        room.rpgEncounter[user] = newEncounter;
        if (newEncounter.type === 'battle') {
          responseMsg = `Petualangan dimulai! Kamu menghadapi ${newEncounter.encounter} ${newEncounter.enemy.name} (Lvl ${newEncounter.enemy.level}, HP ${newEncounter.enemy.hp}). Pilih "serang" untuk menyerang, "kabur" untuk lari, atau "berhenti" untuk berhenti.`;
        } else {
          responseMsg = `Wah, kamu menemukan artefak: ${newEncounter.artifact.name}! Pilih "ambil" untuk mengambilnya atau "lanjut" untuk melewatinya dan lanjut petualangan. Ingat, bisa jadi ada jebakan! Atau ketik "berhenti" untuk keluar.`;
        }
      }
      break;
    case 'serang':
      if (!encounter || encounter.type !== 'battle') {
        responseMsg = 'Nih, tidak ada lawan untuk diserang. Ketik "mulai" untuk petualangan baru!';
      } else {
        let enemy = encounter.enemy;
        let rounds = 0;
        let battleLog = '';
        while (enemy.hp > 0 && player.hp > 0) {
          rounds++;
          let weaponBonus = player.equippedWeapon ? player.equippedWeapon.bonus : 0;
          let baseDamage = Math.max(player.atk + weaponBonus - enemy.def, 1);
          let damageToEnemy = Math.floor(baseDamage * (Math.random() * 0.1 + 0.9));
          enemy.hp -= damageToEnemy;
          battleLog += `Serangan ${rounds}: Kamu memberikan ${damageToEnemy} damage ke ${enemy.name}. `;
          if (enemy.hp <= 0) break;
          let damageToPlayer = Math.max(enemy.atk - player.def, 1);
          player.hp -= damageToPlayer;
          battleLog += `${enemy.name} membalas dengan ${damageToPlayer} damage. `;
        }
        if (player.hp <= 0) {
          battleLog += `Ups, kamu kalah setelah ${rounds} serangan. Total pendapatan: ${player.gold - player.adventureStartGold} emas, ${player.exp - player.adventureStartExp} EXP, Artefak: ${player.artifacts.slice(player.adventureArtifactCount).map(a => a.name).join(', ') || 'Tidak ada'}.`;
          delete room.rpgEncounter[user];
        } else {
          battleLog += `Mantap! Kamu mengalahkan ${enemy.name} dalam ${rounds} serangan. Dapatkan ${enemy.expReward} EXP dan ${enemy.goldReward} emas!`;
          player.exp += enemy.expReward;
          player.gold += enemy.goldReward;
          if (player.equippedWeapon) {
            player.equippedWeapon.xp = (player.equippedWeapon.xp || 0) + 10;
            if (player.equippedWeapon.xp >= 100) {
              player.equippedWeapon.level += 1;
              player.equippedWeapon.xp -= 100;
              player.equippedWeapon.bonus += 1;
              battleLog += ` Senjatamu naik level ke ${player.equippedWeapon.level}!`;
            }
          }
          if (Math.random() < 0.4) {
            const weaponStore = [
              { id: 1, name: "Pedang Kayu", costGold: 10, bonus: 2 },
              { id: 2, name: "Tombak", costGold: 15, bonus: 3 },
              { id: 3, name: "Kapak", costGold: 20, bonus: 4 },
              { id: 4, name: "Belati", costGold: 12, bonus: 2 },
              { id: 5, name: "Busur", costGold: 18, bonus: 3 },
              { id: 6, name: "Pedang Besi", costGold: 25, bonus: 5 },
              { id: 7, name: "Golok", costGold: 15, bonus: 3 },
              { id: 8, name: "Parang", costGold: 20, bonus: 4 },
              { id: 9, name: "Pedang Perak", costGold: 30, bonus: 6 },
              { id: 10, name: "Pedang Emas", costGold: 50, bonus: 10 }
            ];
            let drop = weaponStore[Math.floor(Math.random() * weaponStore.length)];
            let newWeapon = { id: drop.id, name: drop.name, level: 1, xp: 0, bonus: drop.bonus, baseCost: drop.costGold };
            player.inventory.push(newWeapon);
            battleLog += ` Kamu menemukan senjata baru: ${newWeapon.name}!`;
          }
          if (Math.random() < 0.3) {
            let art = generateArtifactEncounter();
            player.artifacts.push(art);
            battleLog += ` Dan kamu juga menemukan artefak: ${art.name}!`;
          }
          delete room.rpgEncounter[user];
          battleLog += ` Ketik "mulai" untuk tantangan berikutnya atau "berhenti" untuk keluar.`;
        }
        responseMsg = battleLog;
      }
      break;
    case 'kabur':
      if (!encounter || encounter.type !== 'battle') {
        responseMsg = 'Enggak ada musuh untuk dikejar. Coba ketik "mulai" untuk petualangan baru!';
      } else {
        const newEncounter = generateEncounter(player.level);
        if (newEncounter.type === 'artifact') {
          responseMsg = 'Kamu tidak bisa kabur saat menemukan artefak! Pilih "ambil" atau "lanjut".';
        } else {
          room.rpgEncounter[user] = newEncounter;
          responseMsg = `Kamu lari! Sekarang kamu menghadapi ${newEncounter.encounter} ${newEncounter.enemy.name} (Lvl ${newEncounter.enemy.level}, HP ${newEncounter.enemy.hp}). Pilih "serang", "kabur", atau "berhenti".`;
        }
      }
      break;
    case 'ambil':
      if (!encounter || encounter.type !== 'artifact') {
        responseMsg = 'Nggak ada artefak di sini. Coba ketik "mulai" untuk petualangan baru!';
      } else {
        if (Math.random() < 0.5) {
          let trap = Math.floor(player.maxHp * (0.1 + Math.random() * 0.2));
          player.hp -= trap;
          responseMsg = `Waduh, jebakan! HP kamu berkurang ${trap}. Sekarang HP: ${player.hp}.`;
        } else {
          let art = encounter.artifact;
          player.artifacts.push(art);
          responseMsg = `Mantap! Kamu mendapatkan artefak ${art.name}.`;
        }
        delete room.rpgEncounter[user];
      }
      break;
    case 'lanjut':
      if (!encounter || encounter.type !== 'artifact') {
        responseMsg = 'Tidak ada artefak untuk dilewati. Ketik "mulai" untuk petualangan baru!';
      } else {
        const newEncounter = generateEncounter(player.level);
        room.rpgEncounter[user] = newEncounter;
        if (newEncounter.type === 'battle') {
          responseMsg = `Kamu memilih untuk melewati artefak! Sekarang, kamu menghadapi ${newEncounter.encounter} ${newEncounter.enemy.name} (Lvl ${newEncounter.enemy.level}, HP ${newEncounter.enemy.hp}). Pilih "serang", "kabur", atau "berhenti".`;
        } else {
          responseMsg = `Masih ada artefak di depan! Pilih "ambil" untuk mengambilnya atau "lanjut" untuk melewatinya.`;
        }
      }
      break;
    case 'berhenti':
      if (encounter) delete room.rpgEncounter[user];
      let earnedGold = player.gold - player.adventureStartGold;
      let earnedExp = player.exp - player.adventureStartExp;
      let earnedArtifacts = Array.isArray(player.artifacts) ? player.artifacts.slice(player.adventureArtifactCount).map(a => a.name).join(', ') || 'Tidak ada' : 'Tidak ada';
      responseMsg = `Petualangan selesai! Total pendapatan: ${earnedGold} emas, ${earnedExp} EXP, Artefak: ${earnedArtifacts}.`;
      break;
    case 'status':
      responseMsg = `Status Petualangan:\nLevel: ${player.level}\nEXP: ${player.exp}/${player.level * 100}\nHP: ${player.hp}/${player.maxHp}\nATK: ${player.atk}\nDEF: ${player.def}\nEmas: ${player.gold}\nInventory: ${player.inventory.length ? player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level})`).join(', ') : 'Kosong'}\nSenjata Dipakai: ${player.equippedWeapon ? player.equippedWeapon.name : 'Tidak ada'}\nArtefak: ${player.artifacts.length ? player.artifacts.map(a => a.name).join(', ') : 'Tidak ada'}\nKetik "mulai" untuk petualangan baru atau "berhenti" untuk keluar.`;
      break;
    case 'quest':
      if (!global.quest) global.quest = { deskripsi: 'Kalahkan 3 Goblin', target: 3, expReward: 50, goldReward: 20, timestamp: now };
      if (player.globalQuestProgress >= global.quest.target && !player.globalQuestCompleted) {
        player.exp += global.quest.expReward;
        player.gold += global.quest.goldReward;
        player.globalQuestCompleted = true;
        responseMsg = `Misi global selesai! ${global.quest.deskripsi} - Dapat ${global.quest.expReward} EXP dan ${global.quest.goldReward} emas!`;
      } else {
        responseMsg = `Misi global: ${global.quest.deskripsi}\nProgress: ${player.globalQuestProgress}/${global.quest.target}`;
      }
      break;
    case 'heal':
      if (player.hp >= player.maxHp) responseMsg = 'HP kamu sudah penuh!';
      else {
        let cost = Math.ceil(((player.maxHp - player.hp) / player.maxHp) * 10);
        if (player.gold < cost) responseMsg = `Emas kamu kurang! Butuh ${cost} emas.`;
        else {
          player.gold -= cost;
          player.hp = player.maxHp;
          responseMsg = `Heal berhasil! HP kamu penuh sekarang dengan mengurangi ${cost} emas.`;
        }
      }
      break;
    case 'toko':
      if (args.length < 2) responseMsg = 'Perintah toko nggak valid. Gunakan: toko senjata';
      else if (args[1].toLowerCase() === 'senjata') {
        const weaponStore = [
          { id: 1, name: "Pedang Kayu", costGold: 10, bonus: 2 },
          { id: 2, name: "Tombak", costGold: 15, bonus: 3 },
          { id: 3, name: "Kapak", costGold: 20, bonus: 4 },
          { id: 4, name: "Belati", costGold: 12, bonus: 2 },
          { id: 5, name: "Busur", costGold: 18, bonus: 3 },
          { id: 6, name: "Pedang Besi", costGold: 25, bonus: 5 },
          { id: 7, name: "Golok", costGold: 15, bonus: 3 },
          { id: 8, name: "Parang", costGold: 20, bonus: 4 },
          { id: 9, name: "Pedang Perak", costGold: 30, bonus: 6 },
          { id: 10, name: "Pedang Emas", costGold: 50, bonus: 10 }
        ];
        if (args.length === 2) {
          let listMsg = 'Toko Senjata:\n';
          weaponStore.forEach(ws => { listMsg += `${ws.id}. ${ws.name} - ${ws.costGold} emas\n`; });
          listMsg += 'Untuk membeli, ketik: toko senjata [nomor]';
          responseMsg = listMsg;
        } else if (args.length >= 3) {
          let id = parseInt(args[2]);
          let selected = weaponStore.find(w => w.id === id);
          if (!selected) responseMsg = 'Senjata tidak ditemukan.';
          else {
            if (player.gold < selected.costGold) responseMsg = `Emas nggak cukup! Butuh ${selected.costGold} emas.`;
            else {
              player.gold -= selected.costGold;
              let newWeapon = { id: selected.id, name: selected.name, level: 1, xp: 0, bonus: selected.bonus, baseCost: selected.costGold };
              player.inventory.push(newWeapon);
              responseMsg = `Pembelian berhasil: ${newWeapon.name} masuk ke inventory. Ketik "pakai" untuk memakainya.`;
            }
          }
        }
      } else responseMsg = 'Perintah toko nggak valid.';
      break;
    case 'inv':
      responseMsg = `Inventory Senjata:\n${player.inventory.length === 0 ? "Kosong." : player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level}, XP:${w.xp}, Bonus:${w.bonus})`).join("\n")}\nArtefak: ${player.artifacts.length ? player.artifacts.map(a => a.name).join(', ') : 'Tidak ada'}`;
      break;
    case 'pakai':
      if (player.inventory.length === 0) responseMsg = 'Inventory kosong.';
      else {
        let idx = parseInt(args[1]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= player.inventory.length) responseMsg = 'Indeks senjata nggak valid.';
        else {
          player.equippedWeapon = player.inventory[idx];
          responseMsg = `Senjata ${player.equippedWeapon.name} sudah dipakai. Siap bertempur!`;
        }
      }
      break;
    case 'jual':
      if (player.inventory.length === 0) responseMsg = 'Inventory kosong.';
      else {
        let idx = parseInt(args[1]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= player.inventory.length) responseMsg = 'Indeks senjata nggak valid.';
        else {
          let soldWeapon = player.inventory.splice(idx, 1)[0];
          let sellGold = Math.floor((soldWeapon.baseCost || 10) / 2);
          player.gold += sellGold;
          if (player.equippedWeapon && player.equippedWeapon.id === soldWeapon.id) player.equippedWeapon = null;
          responseMsg = `Senjata ${soldWeapon.name} dijual, dapat ${sellGold} emas.`;
        }
      }
      break;
    case 'tempa':
      if (player.inventory.length === 0) responseMsg = 'Inventory kosong.';
      else if (player.artifacts.length < 1) responseMsg = 'Nggak ada artefak untuk menempa senjata.';
      else {
        let idx = parseInt(args[1]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= player.inventory.length) responseMsg = 'Indeks senjata nggak valid.';
        else {
          let weapon = player.inventory[idx];
          player.artifacts.shift();
          weapon.xp = (weapon.xp || 0) + 20;
          responseMsg = `Artefak dipakai menempa ${weapon.name}, XP bertambah 20.`;
          if (weapon.xp >= 100) {
            weapon.level += 1;
            weapon.xp -= 100;
            weapon.bonus += 1;
            responseMsg += ` Senjata naik level ke ${weapon.level}!`;
          }
        }
      }
      break;
    default:
      responseMsg = 'Perintah tidak dikenal. Coba: "mulai", "serang", "kabur", "ambil", "lanjut", "berhenti", "status", "quest", "heal", "toko senjata", "inv", "pakai", "jual", "tempa".';
  }
  await apiWriteData('users', usersData);
  await apiWriteData('rooms', roomsData);
  res.send(responseMsg);
});
module.exports = router;