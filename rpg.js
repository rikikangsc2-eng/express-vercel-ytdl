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
    users[user].rpg = { level: 1, exp: 0, hp: 100, maxHp: 100, atk: 10, def: 5, gold: 50, inventory: [], equippedWeapon: null, artifacts: 0, globalQuestProgress: 0, globalQuestCompleted: false, lastRecovery: Date.now(), adventureStartGold: 0, adventureStartExp: 0 };
  }
}
function generateMonster(level) {
  const monsters = ['Goblin', 'Orc', 'Troll', 'Serigala', 'Bandit', 'Harpy'];
  const name = monsters[Math.floor(Math.random() * monsters.length)];
  const hp = 70 + level * 15 + Math.floor(Math.random() * 20);
  const atk = 10 + level * 3 + Math.floor(Math.random() * 5);
  const def = 5 + level * 2 + Math.floor(Math.random() * 3);
  const expReward = 30 + level * 10;
  const goldReward = Math.random() < 0.7 ? (15 + level * 5) : 0;
  return { name, level, hp, atk, def, expReward, goldReward };
}
function generateVillain(level) {
  const villains = ['Penjahat', 'Bandit Licik', 'Pembunuh Bayaran'];
  const name = villains[Math.floor(Math.random() * villains.length)];
  const hp = 60 + level * 14 + Math.floor(Math.random() * 15);
  const atk = 9 + level * 3 + Math.floor(Math.random() * 4);
  const def = 4 + level * 2 + Math.floor(Math.random() * 2);
  const expReward = 25 + level * 8;
  const goldReward = Math.random() < 0.7 ? (10 + level * 4) : 0;
  return { name, level, hp, atk, def, expReward, goldReward };
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
  const encounter = room.rpgEncounter[user];
  const args = inputText.split(' ');
  const cmd = args[0].toLowerCase();
  let responseMsg = '';
  switch (cmd) {
    case 'mulai':
      if (encounter) {
        responseMsg = "*Kamu sudah dalam petualangan.*";
      } else {
        player.adventureStartGold = player.gold;
        player.adventureStartExp = player.exp;
        const rand = Math.random();
        if (rand < 0.7) {
          const monster = generateMonster(player.level);
          room.rpgEncounter[user] = { type: 'battle', enemy: monster };
          responseMsg = `*Petualangan dimulai!* Kamu bertemu dengan *${monster.name}* (Lvl *${monster.level}*, HP *${monster.hp}*). Ketik *serang* untuk melawan atau *kabur* untuk lari.`;
        } else if (rand < 0.85) {
          const villain = generateVillain(player.level);
          room.rpgEncounter[user] = { type: 'villain', enemy: villain };
          responseMsg = `*Petualangan dimulai!* Kamu bertemu dengan *${villain.name}* (Lvl *${villain.level}*, HP *${villain.hp}*). Ketik *serang* untuk melawan atau *kabur* untuk lari.`;
        } else {
          room.rpgEncounter[user] = { type: 'artifact' };
          responseMsg = "*Kamu menemukan artefak misterius!* Ketik *ambil* untuk mengambil, *lanjut* untuk melanjutkan tanpa mengambil, atau *berhenti* untuk menghentikan petualangan.";
        }
      }
      break;
    case 'serang':
      if (!encounter || (encounter.type !== 'battle' && encounter.type !== 'villain')) {
        responseMsg = "*Tidak ada musuh untuk diserang. Ketik *mulai* untuk memulai petualangan.*";
      } else {
        let enemy = encounter.enemy;
        let rounds = 0;
        let battleLog = "";
        while (enemy.hp > 0 && player.hp > 0) {
          rounds++;
          let weaponBonus = player.equippedWeapon ? player.equippedWeapon.bonus : 0;
          let baseDamage = Math.max(player.atk + weaponBonus - enemy.def, 1);
          let damageUser = Math.floor(baseDamage * (Math.random() * 0.1 + 0.9));
          enemy.hp -= damageUser;
          battleLog += `Serangan *${rounds}*: Kamu memberi damage *${damageUser}* pada *${enemy.name}*. `;
          if (enemy.hp <= 0) break;
          let damageEnemy = Math.max(enemy.atk - player.def, 1);
          player.hp -= damageEnemy;
          battleLog += `*${enemy.name}* menyerang dan memberi damage *${damageEnemy}* padamu. `;
        }
        if (player.hp <= 0) {
          battleLog += `Kamu kalah dalam pertempuran setelah *${rounds}* serangan.`;
          delete room.rpgEncounter[user];
        } else {
          battleLog += `Kamu mengalahkan *${enemy.name}* dalam *${rounds}* serangan. `;
          player.exp += enemy.expReward;
          player.gold += enemy.goldReward;
          if (player.equippedWeapon) {
            player.equippedWeapon.xp = (player.equippedWeapon.xp || 0) + 10;
            if (player.equippedWeapon.xp >= 100) {
              player.equippedWeapon.level += 1;
              player.equippedWeapon.xp -= 100;
              player.equippedWeapon.bonus += 1;
              battleLog += `Senjata naik level ke *${player.equippedWeapon.level}*! `;
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
            battleLog += `Kamu menemukan senjata *${newWeapon.name}*! `;
          }
          if (Math.random() < 0.3) {
            player.artifacts = (player.artifacts || 0) + 1;
            battleLog += `Kamu menemukan artefak! `;
          }
          delete room.rpgEncounter[user];
        }
        responseMsg = battleLog;
      }
      break;
    case 'kabur':
      if (!encounter || (encounter.type !== 'battle' && encounter.type !== 'villain')) {
        responseMsg = "*Tidak ada musuh untuk dikejar. Ketik *mulai* untuk memulai petualangan.*";
      } else {
        if (Math.random() < 0.5) {
          responseMsg = "*Kamu berhasil kabur dengan selamat.*";
          delete room.rpgEncounter[user];
        } else {
          let damageEnemy = Math.max(encounter.enemy.atk - player.def, 1);
          player.hp -= damageEnemy;
          responseMsg = `*Kabur gagal!* *${encounter.enemy.name}* menyerang dan memberi damage *${damageEnemy}*. HP kamu sekarang *${player.hp}*.`;
          if (player.hp <= 0) {
            responseMsg += " Kamu kalah karena HP habis.";
            delete room.rpgEncounter[user];
          }
        }
      }
      break;
    case 'ambil':
      if (!encounter || encounter.type !== 'artifact') {
        responseMsg = "*Tidak ada artefak untuk diambil.*";
      } else {
        if (Math.random() < 0.5) {
          let trapDamage = Math.floor(player.maxHp * (0.1 + Math.random() * 0.2));
          player.hp -= trapDamage;
          responseMsg = `*Artefak ternyata jebakan!* HP kamu berkurang *${trapDamage}*. HP sekarang *${player.hp}*.`;
        } else {
          player.artifacts = (player.artifacts || 0) + 1;
          responseMsg = "*Kamu berhasil mendapatkan artefak.*";
        }
        delete room.rpgEncounter[user];
      }
      break;
    case 'lanjut':
      if (!encounter || encounter.type !== 'artifact') {
        responseMsg = "*Tidak ada artefak untuk dilewati.*";
      } else {
        responseMsg = "*Kamu memutuskan untuk tidak mengambil artefak dan melanjutkan petualangan.*";
        delete room.rpgEncounter[user];
      }
      break;
    case 'berhenti':
      if (encounter) delete room.rpgEncounter[user];
      let goldEarned = player.gold - player.adventureStartGold;
      let expEarned = player.exp - player.adventureStartExp;
      responseMsg = `*Petualangan dihentikan.* Total pendapatan: *${goldEarned}* emas dan *${expEarned}* EXP.`;
      break;
    case 'status':
      responseMsg = `*Status Petualangan:*\n*Level:* ${player.level}\n*EXP:* ${player.exp}/${player.level * 100}\n*HP:* ${player.hp}/${player.maxHp}\n*ATK:* ${player.atk}\n*DEF:* ${player.def}\n*Emas:* ${player.gold}\n*Inventory:* ${player.inventory.length > 0 ? player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level})`).join(', ') : 'Kosong'}\n*Senjata Dipakai:* ${player.equippedWeapon ? player.equippedWeapon.name : 'Tidak ada'}\n*Artefak:* ${player.artifacts || 0}`;
      break;
    case 'quest':
      if (!global.quest) global.quest = { deskripsi: 'Kalahkan 3 Goblin', target: 3, expReward: 50, goldReward: 20, timestamp: now };
      if (player.globalQuestProgress >= global.quest.target && !player.globalQuestCompleted) {
        player.exp += global.quest.expReward;
        player.gold += global.quest.goldReward;
        player.globalQuestCompleted = true;
        responseMsg = `*Misi Global Selesai!* ${global.quest.deskripsi}. Kamu mendapatkan *${global.quest.expReward}* EXP dan *${global.quest.goldReward}* emas.`;
      } else {
        responseMsg = `*Misi Global:* ${global.quest.deskripsi}\n*Progress:* ${player.globalQuestProgress}/${global.quest.target}`;
      }
      break;
    case 'heal':
      if (player.hp >= player.maxHp) responseMsg = "*HP kamu sudah penuh.*";
      else {
        let costGold = Math.ceil(((player.maxHp - player.hp) / player.maxHp) * 10);
        if (player.gold < costGold) responseMsg = `*Emas tidak cukup.* Butuh *${costGold}* emas.`;
        else {
          player.gold -= costGold;
          player.hp = player.maxHp;
          responseMsg = `*Heal berhasil* dengan mengurangi *${costGold}* emas. HP kamu sekarang penuh.`;
        }
      }
      break;
    case 'toko':
      if (args.length < 2) responseMsg = "*Perintah toko tidak valid.* Gunakan: *toko senjata*";
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
          let listMsg = "*Toko Senjata:*\n";
          weaponStore.forEach(ws => { listMsg += `${ws.id}. ${ws.name} - *${ws.costGold}* emas\n`; });
          listMsg += "Untuk membeli, ketik: *toko senjata [nomor]*";
          responseMsg = listMsg;
        } else if (args.length >= 3) {
          let weaponId = parseInt(args[2]);
          let selected = weaponStore.find(w => w.id === weaponId);
          if (!selected) responseMsg = "*Senjata tidak ditemukan.*";
          else {
            if (player.gold < selected.costGold) responseMsg = `*Emas tidak cukup.* Butuh *${selected.costGold}* emas.`;
            else {
              player.gold -= selected.costGold;
              let newWeapon = { id: selected.id, name: selected.name, level: 1, xp: 0, bonus: selected.bonus, baseCost: selected.costGold };
              player.inventory.push(newWeapon);
              responseMsg = `*Pembelian berhasil:* ${newWeapon.name} telah ditambahkan ke inventory.`;
            }
          }
        }
      } else responseMsg = "*Perintah toko tidak valid.*";
      break;
    case 'inv':
      responseMsg = `*Inventory Senjata:*\n${player.inventory.length === 0 ? "Kosong." : player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level}, XP:${w.xp}, Bonus:${w.bonus})`).join("\n")}\n*Artefak:* ${player.artifacts || 0}`;
      break;
    case 'pakai':
      if (player.inventory.length === 0) responseMsg = "*Inventory kosong.*";
      else {
        let index = parseInt(args[1]) - 1;
        if (isNaN(index) || index < 0 || index >= player.inventory.length) responseMsg = "*Indeks senjata tidak valid.*";
        else {
          player.equippedWeapon = player.inventory[index];
          responseMsg = `*Senjata ${player.equippedWeapon.name} telah dipakai.*`;
        }
      }
      break;
    case 'jual':
      if (player.inventory.length === 0) responseMsg = "*Inventory kosong.*";
      else {
        let index = parseInt(args[1]) - 1;
        if (isNaN(index) || index < 0 || index >= player.inventory.length) responseMsg = "*Indeks senjata tidak valid.*";
        else {
          let weaponToSell = player.inventory.splice(index, 1)[0];
          let sellGold = Math.floor((weaponToSell.baseCost || 10) / 2);
          player.gold += sellGold;
          if (player.equippedWeapon && player.equippedWeapon.id === weaponToSell.id) player.equippedWeapon = null;
          responseMsg = `*Senjata ${weaponToSell.name} dijual* dan mendapatkan *${sellGold}* emas.`;
        }
      }
      break;
    case 'tempa':
      if (player.inventory.length === 0) responseMsg = "*Inventory kosong.*";
      else if (!player.artifacts || player.artifacts < 1) responseMsg = "*Tidak ada artefak untuk menempa senjata.*";
      else {
        let index = parseInt(args[1]) - 1;
        if (isNaN(index) || index < 0 || index >= player.inventory.length) responseMsg = "*Indeks senjata tidak valid.*";
        else {
          let weaponToForge = player.inventory[index];
          player.artifacts -= 1;
          weaponToForge.xp = (weaponToForge.xp || 0) + 20;
          responseMsg = `*Artefak digunakan untuk menempa ${weaponToForge.name}.* XP bertambah *20*.`;
          if (weaponToForge.xp >= 100) {
            weaponToForge.level += 1;
            weaponToForge.xp -= 100;
            weaponToForge.bonus += 1;
            responseMsg += ` Senjata naik level ke *${weaponToForge.level}*!`;
          }
        }
      }
      break;
    default:
      responseMsg = "Perintah tidak dikenal. Gunakan: `mulai` `serang` `kabur` `ambil` lanjut` `berhenti` `status` `quest` `heal` `toko senjata` `inv` `pakai` `jual` `tempa`";
  }
  await apiWriteData('users', usersData);
  await apiWriteData('rooms', roomsData);
  res.send(responseMsg);
});
module.exports = router