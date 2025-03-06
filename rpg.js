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

function generateEnemy(playerLevel) {
  const enemyTypes = [
    { name: 'Goblin', baseHp: 70, hpFactor: 15, baseAtk: 10, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 30, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Orc', baseHp: 80, hpFactor: 16, baseAtk: 11, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 35, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Troll', baseHp: 90, hpFactor: 18, baseAtk: 12, atkFactor: 4, baseDef: 6, defFactor: 2, baseExp: 40, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Serigala', baseHp: 75, hpFactor: 15, baseAtk: 10, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 30, expFactor: 10, baseGold: 15, goldFactor: 5 },
    { name: 'Bandit', baseHp: 70, hpFactor: 15, baseAtk: 9, atkFactor: 3, baseDef: 4, defFactor: 2, baseExp: 25, expFactor: 8, baseGold: 10, goldFactor: 4 },
    { name: 'Harpy', baseHp: 65, hpFactor: 14, baseAtk: 9, atkFactor: 3, baseDef: 4, defFactor: 2, baseExp: 25, expFactor: 8, baseGold: 10, goldFactor: 4 }
  ];
  const selected = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const enemyLevel = Math.max(1, Math.floor(Math.random() * playerLevel) + 1);
  const hp = selected.baseHp + enemyLevel * selected.hpFactor + Math.floor(Math.random() * 20);
  const atk = selected.baseAtk + enemyLevel * selected.atkFactor + Math.floor(Math.random() * 5);
  const def = selected.baseDef + enemyLevel * selected.defFactor + Math.floor(Math.random() * 3);
  const expReward = selected.baseExp + enemyLevel * selected.expFactor;
  const goldReward = Math.random() < 0.7 ? (selected.baseGold + enemyLevel * selected.goldFactor) : 0;
  return { name: selected.name, level: enemyLevel, hp, atk, def, expReward, goldReward };
}

function generateArtifact() {
  const artifacts = [
    { name: 'Jimat Keberuntungan', xp: 20 },
    { name: 'Medali Pahlawan', xp: 30 },
    { name: 'Amulet Kekuatan', xp: 25 },
    { name: 'Cincin Misterius', xp: 15 },
    { name: 'Kalung Legenda', xp: 35 }
  ];
  return artifacts[Math.floor(Math.random() * artifacts.length)];
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
    const recoverAmount = Math.floor(player.maxHp * 0.2);
    player.hp = Math.min(player.hp + recoverAmount, player.maxHp);
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
        responseMsg = 'HP kamu habis, tidak dapat memulai petualangan.';
      } else if (encounter) {
        responseMsg = 'Kamu sudah dalam petualangan. ketik `berhenti` untuk mengakhiri';
      } else {
        player.adventureStartGold = player.gold;
        player.adventureStartExp = player.exp;
        player.adventureArtifactCount = player.artifacts.length;
        const enemy = generateEnemy(player.level);
        room.rpgEncounter[user] = { type: 'battle', enemy };
        responseMsg = `*Petualangan dimulai!* Kamu bertemu dengan ${enemy.name} (Lvl ${enemy.level}, HP ${enemy.hp}). Ketik \`serang\` untuk melawan atau \`kabur\` untuk melarikan diri. Ketik \`berhenti\` untuk menghentikan petualangan.`;
      }
      break;
    case 'serang':
      if (!encounter || encounter.type !== 'battle') {
        responseMsg = 'Tidak ada musuh untuk diserang. Ketik `mulai` untuk memulai petualangan.';
      } else {
        let enemy = encounter.enemy;
        let rounds = 0;
        let battleLog = '';
        while (enemy.hp > 0 && player.hp > 0) {
          rounds++;
          let weaponBonus = player.equippedWeapon ? player.equippedWeapon.bonus : 0;
          let baseDamage = Math.max(player.atk + weaponBonus - enemy.def, 1);
          let damageUser = Math.floor(baseDamage * (Math.random() * 0.1 + 0.9));
          enemy.hp -= damageUser;
          battleLog += `*Serangan ${rounds}:* Kamu memberi damage *${damageUser}* pada ${enemy.name}. `;
          if (enemy.hp <= 0) break;
          let damageEnemy = Math.max(enemy.atk - player.def, 1);
          player.hp -= damageEnemy;
          battleLog += `*${enemy.name} menyerang* dan memberi damage *${damageEnemy}* padamu. `;
        }
        if (player.hp <= 0) {
          battleLog += `Kamu kalah dalam pertempuran setelah *${rounds} serangan*`;
          let goldEarned = player.gold - player.adventureStartGold;
          let expEarned = player.exp - player.adventureStartExp;
          let artifactsEarned = player.artifacts.slice(player.adventureArtifactCount).map(a => a.name).join(', ') || 'Tidak ada';
          battleLog += `\nPetualangan dihentikan karena HP habis. *Total pendapatan:* ${goldEarned} emas, ${expEarned} EXP, Artefak: ${artifactsEarned}.`;
          delete room.rpgEncounter[user];
        } else {
          battleLog += `Kamu mengalahkan ${enemy.name} dalam ${rounds} serangan. `;
          player.exp += enemy.expReward;
          player.gold += enemy.goldReward;
          if (player.equippedWeapon) {
            player.equippedWeapon.xp = (player.equippedWeapon.xp || 0) + 10;
            if (player.equippedWeapon.xp >= 100) {
              player.equippedWeapon.level += 1;
              player.equippedWeapon.xp -= 100;
              player.equippedWeapon.bonus += 1;
              battleLog += `Senjata naik level ke ${player.equippedWeapon.level}! `;
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
            let droppedWeapon = weaponStore[Math.floor(Math.random() * weaponStore.length)];
            let newWeapon = { id: droppedWeapon.id, name: droppedWeapon.name, level: 1, xp: 0, bonus: droppedWeapon.bonus, baseCost: droppedWeapon.costGold };
            player.inventory.push(newWeapon);
            battleLog += `*Kamu menemukan senjata ${newWeapon.name}!*`;
          }
          if (Math.random() < 0.3) {
            let artifact = generateArtifact();
            player.artifacts.push(artifact);
            battleLog += `*Kamu menemukan artefak ${artifact.name}!*`;
          }
          delete room.rpgEncounter[user];
          battleLog += `Ketik \`mulai\` untuk rintangan selanjutnya atau \`berhenti\` untuk menghentikan petualangan.`;
        }
        responseMsg = battleLog;
      }
      break;
    case 'kabur':
      if (!encounter || encounter.type !== 'battle') {
        responseMsg = 'Tidak ada musuh untuk dihindari. Ketik `mulai` untuk memulai petualangan.';
      } else {
        const enemy = generateEnemy(player.level);
        room.rpgEncounter[user] = { type: 'battle', enemy };
        responseMsg = `Kamu kabur dan melanjutkan ke rintangan selanjutnya Bertemu *${enemy.name} (Lvl ${enemy.level} - HP ${enemy.hp})* Ketik \`serang\` untuk melawan atau \`kabur\` untuk melarikan diri. Ketik \`berhenti\` untuk menghentikan petualangan.`;
      }
      break;
    case 'ambil':
      if (!encounter || encounter.type !== 'artifact') {
        responseMsg = 'Tidak ada artefak untuk diambil. Ketik `mulai` untuk memulai petualangan.';
      } else {
        if (Math.random() < 0.5) {
          let trapDamage = Math.floor(player.maxHp * (0.1 + Math.random() * 0.2));
          player.hp -= trapDamage;
          responseMsg = `*Artefak ternyata jebakan!* HP kamu berkurang ${trapDamage}. HP sekarang ${player.hp}.`;
        } else {
          let artifact = generateArtifact();
          player.artifacts.push(artifact);
          responseMsg = `Kamu berhasil mendapatkan artefak ${artifact.name}.`;
        }
        delete room.rpgEncounter[user];
      }
      break;
    case 'lanjut':
      if (!encounter || encounter.type !== 'artifact') {
        responseMsg = 'Tidak ada artefak untuk dilewati. Ketik `mulai` untuk memulai petualangan.';
      } else {
        const enemy = generateEnemy(player.level);
        room.rpgEncounter[user] = { type: 'battle', enemy };
        responseMsg = `Kamu melewati artefak dan melanjutkan petualangan. Bertemu ${enemy.name} (Lvl ${enemy.level}, HP ${enemy.hp}). Ketik \`serang\` untuk melawan atau \`kabur\` untuk melarikan diri. Ketik \`berhenti\` untuk menghentikan petualangan.`;
      }
      break;
    case 'berhenti':
      if (encounter) delete room.rpgEncounter[user];
      let goldEarned = player.gold - player.adventureStartGold;
      let expEarned = player.exp - player.adventureStartExp;
      let artifactsEarned = Array.isArray(player.artifacts) ? player.artifacts.slice(player.adventureArtifactCount).map(a => a.name).join(', ') || 'Tidak ada' : 'Tidak ada';
      responseMsg = `Petualangan dihentikan. Total pendapatan: *${goldEarned} emas* *${expEarned} EXP* *Artefak:* ${artifactsEarned}.`;
      break;
    case 'status':
      responseMsg = `Status Petualangan:\nLevel: ${player.level}\nEXP: ${player.exp}/${player.level * 100}\nHP: ${player.hp}/${player.maxHp}\nATK: ${player.atk}\nDEF: ${player.def}\nEmas: ${player.gold}\nInventory: ${player.inventory.length > 0 ? player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level})`).join(', ') : 'Kosong'}\nSenjata Dipakai: ${player.equippedWeapon ? player.equippedWeapon.name : 'Tidak ada'}\nArtefak: ${player.artifacts.length > 0 ? player.artifacts.map(a => a.name).join(', ') : 'Tidak ada'}\nKetik \`mulai\` untuk rintangan selanjutnya atau \`berhenti\` untuk menghentikan petualangan.`;
      break;
    case 'quest':
      if (!global.quest) global.quest = { deskripsi: 'Kalahkan 3 Goblin', target: 3, expReward: 50, goldReward: 20, timestamp: now };
      if (player.globalQuestProgress >= global.quest.target && !player.globalQuestCompleted) {
        player.exp += global.quest.expReward;
        player.gold += global.quest.goldReward;
        player.globalQuestCompleted = true;
        responseMsg = `Misi Global Selesai! *${global.quest.deskripsi}* Kamu mendapatkan *${global.quest.expReward} EXP* dan *${global.quest.goldReward} emas*`;
      } else {
        responseMsg = `Misi Global: ${global.quest.deskripsi}\nProgress: ${player.globalQuestProgress}/${global.quest.target}`;
      }
      break;
    case 'heal':
      if (player.hp >= player.maxHp) responseMsg = 'HP kamu sudah penuh.';
      else {
        let costGold = Math.ceil(((player.maxHp - player.hp) / player.maxHp) * 10);
        if (player.gold < costGold) responseMsg = `Emas tidak cukup. Butuh ${costGold} emas.`;
        else {
          player.gold -= costGold;
          player.hp = player.maxHp;
          responseMsg = `Heal berhasil dengan mengurangi *${costGold} emas*. HP kamu sekarang penuh. Ketik \`berhenti\` untuk menghentikan petualangan.`;
        }
      }
      break;
    case 'toko':
      if (args.length < 2) responseMsg = 'Perintah toko tidak valid. Gunakan: toko senjata';
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
          listMsg += 'Untuk membeli, ketik: `toko senjata [nomor]`';
          responseMsg = listMsg;
        } else if (args.length >= 3) {
          let weaponId = parseInt(args[2]);
          let selected = weaponStore.find(w => w.id === weaponId);
          if (!selected) responseMsg = 'Senjata tidak ditemukan.';
          else {
            if (player.gold < selected.costGold) responseMsg = `Emas tidak cukup. Butuh ${selected.costGold} emas.`;
            else {
              player.gold -= selected.costGold;
              let newWeapon = { id: selected.id, name: selected.name, level: 1, xp: 0, bonus: selected.bonus, baseCost: selected.costGold };
              player.inventory.push(newWeapon);
              responseMsg = `Pembelian berhasil: *${newWeapon.name}* telah ditambahkan ke inventory, Ketik \`pakai\` untuk memakainya`;
            }
          }
        }
      } else responseMsg = 'Perintah toko tidak valid.';
      break;
    case 'inv':
      responseMsg = `Inventory Senjata:\n${player.inventory.length === 0 ? "Kosong." : player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level}, XP:${w.xp}, Bonus:${w.bonus})`).join("\n")}\nArtefak: ${player.artifacts.length > 0 ? player.artifacts.map(a => a.name).join(', ') : 'Tidak ada'}`;
      break;
    case 'pakai':
      if (player.inventory.length === 0) responseMsg = 'Inventory kosong.';
      else {
        let index = parseInt(args[1]) - 1;
        if (isNaN(index) || index < 0 || index >= player.inventory.length) responseMsg = 'Indeks senjata tidak valid.';
        else {
          player.equippedWeapon = player.inventory[index];
          responseMsg = `Senjata ${player.equippedWeapon.name} telah dipakai.`;
        }
      }
      break;
    case 'jual':
      if (player.inventory.length === 0) responseMsg = 'Inventory kosong.';
      else {
        let index = parseInt(args[1]) - 1;
        if (isNaN(index) || index < 0 || index >= player.inventory.length) responseMsg = 'Indeks senjata tidak valid.';
        else {
          let weaponToSell = player.inventory.splice(index, 1)[0];
          let sellGold = Math.floor((weaponToSell.baseCost || 10) / 2);
          player.gold += sellGold;
          if (player.equippedWeapon && player.equippedWeapon.id === weaponToSell.id) player.equippedWeapon = null;
          responseMsg = `Senjata *${weaponToSell.name}* dijual dan mendapatkan *${sellGold} emas*`;
        }
      }
      break;
    case 'tempa':
      if (player.inventory.length === 0) responseMsg = 'Inventory kosong.';
      else if (player.artifacts.length < 1) responseMsg = 'Tidak ada artefak untuk menempa senjata.';
      else {
        let index = parseInt(args[1]) - 1;
        if (isNaN(index) || index < 0 || index >= player.inventory.length) responseMsg = 'Indeks senjata tidak valid.';
        else {
          let weaponToForge = player.inventory[index];
          player.artifacts.shift();
          weaponToForge.xp = (weaponToForge.xp || 0) + 20;
          responseMsg = `Artefak digunakan untuk menempa ${weaponToForge.name}. XP bertambah 20.`;
          if (weaponToForge.xp >= 100) {
            weaponToForge.level += 1;
            weaponToForge.xp -= 100;
            weaponToForge.bonus += 1;
            responseMsg += ` Senjata naik level ke ${weaponToForge.level}!`;
          }
        }
      }
      break;
    default:
      responseMsg = 'Perintah tidak dikenal. Gunakan: `mulai` `serang` `kabur*` `ambil` `lanjut` `berhenti` `status` `quest` `heal` `toko senjata` `inv` `pakai` `jual` `tempa`';
  }
  await apiWriteData('users', usersData);
  await apiWriteData('rooms', roomsData);
  res.send(responseMsg);
});
module.exports = router;