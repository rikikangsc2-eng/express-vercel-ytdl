const express = require('express');
const axios = require('axios');
const router = express.Router();
const API_ENDPOINT = 'https://copper-ambiguous-velvet.glitch.me/data';
const USER_AGENT = 'Mozilla/5.0';

// Fungsi untuk mendapatkan data dari API
const apiGetData = async (dataType) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/${dataType}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    return response.data;
  } catch (error) {
    return { users: {}, rooms: {} };
  }
};

// Fungsi untuk menulis data ke API
const apiWriteData = async (dataType, data) => {
  try {
    await axios.post(`${API_ENDPOINT}/${dataType}`, data, {
      headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/json' }
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Inisialisasi user
function initializeUser(users, user) {
  if (!users[user]) {
    users[user] = { points: 0, harian: { value: 0, expires: Date.now() + 86400000 } };
  } else {
    if (!users[user].harian)
      users[user].harian = { value: 0, expires: Date.now() + 86400000 };
  }
}

// Inisialisasi RPG untuk user dengan stat yang lebih menguntungkan
function initializeRPG(users, user) {
  if (!users[user].rpg) {
    users[user].rpg = {
      level: 1,
      exp: 0,
      hp: 120,
      maxHp: 120,
      atk: 12,
      def: 7,
      gold: 60,
      inventory: [],
      equippedWeapon: null,
      artifacts: [],
      books: [],
      globalQuestProgress: 0,
      globalQuestCompleted: false,
      lastRecovery: Date.now(),
      adventureStartGold: 0,
      adventureStartExp: 0,
      adventureArtifactCount: 0
    };
  } else {
    if (!Array.isArray(users[user].rpg.artifacts))
      users[user].rpg.artifacts = [];
    if (!Array.isArray(users[user].rpg.books))
      users[user].rpg.books = [];
  }
}

// Daftar monster (15 jenis bisa ditambahkan)
function generateMonster(playerLevel) {
  const monsters = [
    { name: 'Goblin', baseHp: 70, hpFactor: 15, baseAtk: 10, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 30 },
    { name: 'Orc', baseHp: 80, hpFactor: 16, baseAtk: 11, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 35 },
    // Tambahkan jenis monster lainnya jika diperlukan
  ];
  const selected = monsters[Math.floor(Math.random() * monsters.length)];
  const level = Math.max(1, Math.floor(Math.random() * playerLevel) + 1);
  const hp = selected.baseHp + level * selected.hpFactor + Math.floor(Math.random() * 20);
  const atk = selected.baseAtk + level * selected.atkFactor + Math.floor(Math.random() * 5);
  const def = selected.baseDef + level * selected.defFactor + Math.floor(Math.random() * 3);
  const expReward = selected.baseExp + level * 10;
  return { name: selected.name, level, hp, atk, def, expReward };
}

// Daftar penjahat (villain)
function generateVillain(playerLevel) {
  const villains = [
    { name: 'Bandit Raja', baseHp: 80, hpFactor: 14, baseAtk: 12, atkFactor: 3, baseDef: 6, defFactor: 2, baseExp: 40 },
    { name: 'Penjahat Misterius', baseHp: 70, hpFactor: 13, baseAtk: 11, atkFactor: 3, baseDef: 5, defFactor: 2, baseExp: 35 },
    // Tambahkan jenis villain lainnya jika diperlukan
  ];
  const selected = villains[Math.floor(Math.random() * villains.length)];
  const level = Math.max(1, Math.floor(Math.random() * playerLevel) + 1);
  const hp = selected.baseHp + level * selected.hpFactor + Math.floor(Math.random() * 20);
  const atk = selected.baseAtk + level * selected.atkFactor + Math.floor(Math.random() * 5);
  const def = selected.baseDef + level * selected.defFactor + Math.floor(Math.random() * 3);
  const expReward = selected.baseExp + level * 10;
  return { name: selected.name, level, hp, atk, def, expReward };
}

// Daftar artefak dengan nama kreatif; artefak yang lebih mahal memberikan XP upgrade lebih besar
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

// Fungsi untuk menghasilkan artefak sebagai drop encounter
// Menggunakan pembobotan agar artefak yang lebih murah lebih sering muncul
function generateArtifactEncounter() {
  let index = Math.floor(Math.pow(Math.random(), 2) * artifactStore.length);
  return { ...artifactStore[index] };
}

// Daftar nama kitab kreatif
const bookNames = [
  "Grimoire of the Eternal Flame",
  "Codex of the Celestial Oracle",
  "Tome of Mystic Whispers",
  "Chronicle of the Forgotten Realms",
  "Manual of the Arcane Arts",
  "Scripture of Divine Light",
  "Annals of the Shadow Realm",
  "Book of Abyssal Echoes",
  "Volume of Silent Dawn",
  "Ledger of Cosmic Truths",
  "Register of the Timeless One",
  "Diaries of the Wandering Sage",
  "Memoirs of the Storm Bringer",
  "Journal of Lunar Prophecy",
  "Records of the Starborne"
];

// Daftar jurus untuk kitab
const moveList = [
  "Flame Strike", "Celestial Burst", "Mystic Wind", "Shadow Slash", "Divine Smite", "Abyssal Grasp",
  "Solar Flare", "Lunar Eclipse", "Storm Call", "Cosmic Ray", "Arcane Surge", "Ethereal Wave",
  "Phantom Rush", "Spectral Blade", "Temporal Shift"
];

// Fungsi helper untuk mengambil n jurus acak dari moveList
function getRandomMoves(n) {
  let shuffled = moveList.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

// Fungsi untuk menghasilkan encounter
function generateEncounter(playerLevel) {
  let r = Math.random();
  if (r < 0.4) {
    return { type: 'battle', encounter: 'monster', enemy: generateMonster(playerLevel) };
  } else if (r < 0.7) {
    return { type: 'battle', encounter: 'villain', enemy: generateVillain(playerLevel) };
  } else if (r < 0.9) {
    // Encounter resource: Buah atau Sungai
    let resourceType = Math.random() < 0.5 ? 'buah' : 'sungai';
    let name = resourceType === 'buah' ? 'Buah Ajaib' : 'Sungai Berkah';
    return { type: 'resource', resourceType: resourceType, name: name };
  } else {
    // Encounter resource: Kitab Kuno
    let randomBookName = bookNames[Math.floor(Math.random() * bookNames.length)];
    let book = { name: randomBookName, moves: getRandomMoves(3) };
    return { type: 'resource', resourceType: 'kitab', book: book };
  }
}

// Quest global sederhana (misalnya, bunuh 1 monster atau kunjungi 1 tempat)
if (!global.quest) {
  if (Math.random() < 0.5)
    global.quest = { type: 'kill', target: 'Goblin', expReward: 50, goldReward: 20, completed: false };
  else
    global.quest = { type: 'visit', target: 'Sungai Berkah', expReward: 30, goldReward: 15, completed: false };
}

// Fungsi sederhana untuk menghitung peluang menang (dapat disesuaikan lagi)
function calculateWinChance(player, enemy) {
  let chance = Math.min(100, Math.floor((player.hp / (enemy.hp + 1)) * 100));
  return chance;
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
        responseMsg = `*Yah, HP kamu habis!* Tidak bisa mulai petualangan. Coba heal dulu!`;
      } else if (encounter) {
        responseMsg = `Kamu masih dalam petualangan seru! Ketik _berhenti_ untuk mengakhiri petualangan ini.`;
      } else {
        player.adventureStartGold = player.gold;
        player.adventureStartExp = player.exp;
        player.adventureArtifactCount = player.artifacts.length;
        const newEncounter = generateEncounter(player.level);
        room.rpgEncounter[user] = newEncounter;
        if (newEncounter.type === 'battle') {
          responseMsg = `> Petualangan Dimulai\n*Kamu menghadapi ${newEncounter.encounter} ${newEncounter.enemy.name} (Lvl ${newEncounter.enemy.level}, HP ${newEncounter.enemy.hp}).*\nPilih _serang_ untuk menyerang, _kabur_ untuk lari, atau _berhenti_ untuk keluar.`;
        } else if (newEncounter.type === 'resource') {
          if (newEncounter.resourceType === 'buah' || newEncounter.resourceType === 'sungai') {
            responseMsg = `> Petualangan Dimulai\n*Kamu menemukan ${newEncounter.name}.*\nKetik _ambil_ untuk memanfaatkannya.`;
          } else if (newEncounter.resourceType === 'kitab') {
            responseMsg = `> Petualangan Dimulai\n*Kamu menemukan ${newEncounter.book.name}.*\nKetik _ambil_ untuk mengambil kitab dan mempelajari jurusnya.`;
          }
        }
      }
      break;

    case 'serang':
      if (!encounter || encounter.type !== 'battle') {
        responseMsg = `Nih, tidak ada lawan untuk diserang. Ketik _mulai_ untuk petualangan baru!`;
      } else {
        let enemy = encounter.enemy;
        let winChance = calculateWinChance(player, enemy);
        let battleLog = `> Pertempuran Dimulai\n*HP Kamu:* ${player.hp}/${player.maxHp}\n*Peluang Menang:* ${winChance}%\n`;
        let startHP = player.hp;
        let rounds = 0;
        while (enemy.hp > 0 && player.hp > 0) {
          rounds++;
          let weaponBonus = player.equippedWeapon ? player.equippedWeapon.bonus : 0;
          let maxDamage = Math.max(player.atk + weaponBonus - enemy.def, 1);
          let damageToEnemy = Math.floor(maxDamage * (Math.random() * 0.1 + 0.9));
          enemy.hp -= damageToEnemy;
          battleLog += `\`Serangan ${rounds}:\` Kamu memberikan *${damageToEnemy}* damage ke ${enemy.name}.\n`;
          if (enemy.hp <= 0) break;
          let damageToPlayer = Math.max(enemy.atk - player.def, 1);
          player.hp -= damageToPlayer;
          battleLog += `${enemy.name} membalas dengan *${damageToPlayer}* damage.\n`;
        }
        if (player.hp <= 0) {
          battleLog += `_Ups, kamu kalah setelah ${rounds} serangan._\n`;
          battleLog += `Total pendapatan: *${player.gold - player.adventureStartGold}* emas, *${player.exp - player.adventureStartExp}* EXP, Artefak: ${player.artifacts.slice(player.adventureArtifactCount).map(a => a.name).join(', ') || 'Tidak ada'}.`;
          delete room.rpgEncounter[user];
        } else {
          battleLog += `*Mantap!* Kamu mengalahkan ${enemy.name} dalam ${rounds} serangan.\n`;
          // Hadiah emas: 60% peluang mendapatkan emas (10-35) dengan kemungkinan jebakan 15%
          if (Math.random() < 0.6) {
            if (Math.random() < 0.15) {
              let trapDamage = Math.floor(player.maxHp * 0.1);
              player.hp = Math.max(player.hp - trapDamage, 0);
              battleLog += `~Jebakan emas!~ Kamu terkena trap dan kehilangan *${trapDamage}* HP.\n`;
            } else {
              let goldEarned = Math.floor(Math.random() * (35 - 10 + 1)) + 10;
              player.gold += goldEarned;
              battleLog += `Kamu mendapatkan *${goldEarned}* emas!\n`;
            }
          }
          // Hadiah artefak: 40% peluang dengan kemungkinan jebakan 15%
          if (Math.random() < 0.4) {
            if (Math.random() < 0.15) {
              let trapDamage = Math.floor(player.maxHp * 0.05);
              player.hp = Math.max(player.hp - trapDamage, 0);
              battleLog += `~Jebakan artefak!~ Kamu kehilangan *${trapDamage}* HP.\n`;
            } else {
              let art = generateArtifactEncounter();
              player.artifacts.push(art);
              battleLog += `Kamu menemukan artefak: *${art.name}* (XP +${art.upgradeValue})!\n`;
            }
          }
          // Jika pemain memiliki kitab, ada peluang aktifkan jurus acak
          if (player.books && player.books.length > 0 && Math.random() < 0.3) {
            let book = player.books[Math.floor(Math.random() * player.books.length)];
            let moveChance = Math.random();
            if (moveChance < 0.33) {
              battleLog += `Kamu menggunakan jurus _${book.moves[0]}_ dari ${book.name}!\n`;
            } else if (moveChance < 0.66) {
              battleLog += `Kamu menggunakan jurus _${book.moves[1]}_ dari ${book.name}!\n`;
            } else {
              battleLog += `Kamu menggunakan jurus _${book.moves[2]}_ dari ${book.name}!\n`;
            }
          }
          player.exp += enemy.expReward;
          battleLog += `Kamu mendapatkan *${enemy.expReward}* EXP!\n`;
          // Pemulihan HP: pulihkan 50%-80% dari HP yang hilang
          let lostHP = startHP - player.hp;
          let recovery = Math.floor(lostHP * (0.5 + Math.random() * 0.3));
          player.hp = Math.min(player.hp + recovery, player.maxHp);
          battleLog += `Setelah kemenangan, kamu memulihkan *${recovery}* HP.\n`;
          battleLog += `Ketik _mulai_ untuk tantangan berikutnya atau _berhenti_ untuk keluar.`;
          delete room.rpgEncounter[user];
          responseMsg = battleLog;
        }
      }
      break;

    case 'kabur':
      if (!encounter || encounter.type !== 'battle') {
        responseMsg = `Enggak ada musuh untuk dikejar. Coba ketik _mulai_ untuk petualangan baru!`;
      } else {
        const newEncounter = generateEncounter(player.level);
        if (newEncounter.type !== 'battle') {
          responseMsg = `Kamu tidak bisa kabur saat menghadapi non-pertempuran! Pilih _ambil_ atau _berhenti_.`;
        } else {
          room.rpgEncounter[user] = newEncounter;
          responseMsg = `Kamu lari! Sekarang kamu menghadapi ${newEncounter.encounter} ${newEncounter.enemy.name} (Lvl ${newEncounter.enemy.level}, HP ${newEncounter.enemy.hp}).\nPilih _serang_, _kabur_, atau _berhenti_.`;
        }
      }
      break;

    case 'ambil':
      if (!encounter) {
        responseMsg = `Tidak ada yang bisa diambil. Ketik _mulai_ untuk petualangan baru!`;
      } else {
        if (encounter.type === 'artifact') {
          // Jika encounter artefak (meski jarang terjadi, karena drop artefak terjadi saat serang)
          if (Math.random() < 0.5) {
            let trap = Math.floor(player.maxHp * (0.1 + Math.random() * 0.2));
            player.hp = Math.max(player.hp - trap, 0);
            responseMsg = `~Jebakan!~ HP kamu berkurang *${trap}*. Sekarang HP: *${player.hp}*.`;
          } else {
            let art = encounter.artifact;
            player.artifacts.push(art);
            responseMsg = `Mantap! Kamu mendapatkan artefak *${art.name}* (XP +${art.upgradeValue}).`;
          }
          delete room.rpgEncounter[user];
        } else if (encounter.type === 'resource') {
          if (encounter.resourceType === 'buah' || encounter.resourceType === 'sungai') {
            if (Math.random() < 0.2) {
              let poison = Math.floor(player.maxHp * (0.1 + Math.random() * 0.1));
              player.hp = Math.max(player.hp - poison, 0);
              responseMsg = `~Beracun!~ ${encounter.name} ternyata beracun. HP kamu berkurang *${poison}*.`;
            } else {
              let healAmount = Math.floor(player.maxHp * (0.2 + Math.random() * 0.6));
              player.hp = Math.min(player.hp + healAmount, player.maxHp);
              responseMsg = `Mantap! ${encounter.name} menyembuhkan HP kamu sebanyak *${healAmount}* HP.`;
            }
            delete room.rpgEncounter[user];
          } else if (encounter.resourceType === 'kitab') {
            player.books.push(encounter.book);
            responseMsg = `Kamu mempelajari *${encounter.book.name}* dan mempelajari jurus: ${encounter.book.moves.join(', ')}.`;
            delete room.rpgEncounter[user];
          }
        } else {
          responseMsg = `Tidak ada yang bisa diambil.`;
        }
      }
      break;

    case 'lanjut':
      if (!encounter) {
        responseMsg = `Tidak ada petualangan yang sedang berlangsung. Ketik _mulai_ untuk memulai petualangan baru!`;
      } else {
        const newEncounter = generateEncounter(player.level);
        room.rpgEncounter[user] = newEncounter;
        if (newEncounter.type === 'battle') {
          responseMsg = `Kamu memilih untuk lanjut petualangan! Sekarang, kamu menghadapi ${newEncounter.encounter} ${newEncounter.enemy.name} (Lvl ${newEncounter.enemy.level}, HP ${newEncounter.enemy.hp}).\nPilih _serang_, _kabur_, atau _berhenti_.`;
        } else if (newEncounter.type === 'resource') {
          if (newEncounter.resourceType === 'buah' || newEncounter.resourceType === 'sungai') {
            responseMsg = `Kamu menemukan ${newEncounter.name}. Ketik _ambil_ untuk memanfaatkannya.`;
          } else if (newEncounter.resourceType === 'kitab') {
            responseMsg = `Kamu menemukan *${newEncounter.book.name}*. Ketik _ambil_ untuk mempelajarinya.`;
          }
        }
      }
      break;

    case 'berhenti':
      if (encounter) delete room.rpgEncounter[user];
      let earnedGold = player.gold - player.adventureStartGold;
      let earnedExp = player.exp - player.adventureStartExp;
      let earnedArtifacts = player.artifacts.slice(player.adventureArtifactCount).map(a => a.name).join(', ') || 'Tidak ada';
      responseMsg = `> Petualangan Selesai\nTotal pendapatan: *${earnedGold}* emas, *${earnedExp}* EXP, Artefak: ${earnedArtifacts}.`;
      break;

    case 'status':
      responseMsg = `> Status Petualangan\nLevel: *${player.level}*\nEXP: *${player.exp}* / ${player.level * 100}\nHP: *${player.hp}* / ${player.maxHp}\nATK: *${player.atk}*\nDEF: *${player.def}*\nEmas: *${player.gold}*\nInventory Senjata: ${player.inventory.length ? player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level})`).join(', ') : 'Kosong'}\nSenjata Dipakai: ${player.equippedWeapon ? player.equippedWeapon.name : 'Tidak ada'}\nArtefak: ${player.artifacts.length ? player.artifacts.map(a => a.name).join(', ') : 'Tidak ada'}\nKitab: ${player.books.length ? player.books.map(b => b.name).join(', ') : 'Tidak ada'}\nKetik _mulai_ untuk petualangan baru atau _berhenti_ untuk keluar.`;
      break;

    case 'quest':
      if (!global.quest) {
        global.quest = { type: 'kill', target: 'Goblin', expReward: 50, goldReward: 20, completed: false };
      }
      if (global.quest.completed) {
        responseMsg = `Quest sudah selesai: *${global.quest.type === 'kill' ? 'Kalahkan ' + global.quest.target : 'Kunjungi ' + global.quest.target}*.`;
      } else {
        responseMsg = `> Quest\n${global.quest.type === 'kill' ? 'Kalahkan 1 ' + global.quest.target : 'Kunjungi ' + global.quest.target}\nReward: *${global.quest.expReward}* EXP, *${global.quest.goldReward}* emas.`;
      }
      break;

    case 'heal':
      if (player.hp >= player.maxHp)
        responseMsg = `HP kamu sudah penuh!`;
      else {
        let cost = Math.ceil(((player.maxHp - player.hp) / player.maxHp) * 10);
        if (player.gold < cost)
          responseMsg = `Emas kamu kurang! Butuh *${cost}* emas.`;
        else {
          player.gold -= cost;
          player.hp = player.maxHp;
          responseMsg = `Heal berhasil! HP kamu penuh sekarang dengan mengurangi *${cost}* emas.`;
        }
      }
      break;

    case 'toko':
      // Toko artefak: gunakan perintah "toko artefak [nomor] [jumlah]"
      if (args.length < 2) {
        responseMsg = `Perintah toko tidak valid. Gunakan: toko artefak`;
      } else if (args[1].toLowerCase() === 'artefak') {
        if (args.length === 2) {
          let listMsg = `> Toko Artefak\n`;
          artifactStore.forEach(art => {
            listMsg += `\`${art.id}\`. ${art.name} - *${art.costGold}* emas, XP bonus: *${art.upgradeValue}*\n`;
          });
          listMsg += `Untuk membeli, ketik: toko artefak [nomor] [jumlah]`;
          responseMsg = listMsg;
        } else if (args.length >= 3) {
          let id = parseInt(args[2]);
          let quantity = args.length >= 4 ? parseInt(args[3]) : 1;
          let selected = artifactStore.find(a => a.id === id);
          if (!selected)
            responseMsg = `Artefak tidak ditemukan.`;
          else {
            let totalCost = selected.costGold * quantity;
            if (player.gold < totalCost)
              responseMsg = `Emas nggak cukup! Butuh *${totalCost}* emas.`;
            else {
              player.gold -= totalCost;
              for (let i = 0; i < quantity; i++) {
                // Beli artefak dan masukkan ke inventory; XP bonus sesuai artefak
                player.artifacts.push({ name: selected.name, xp: selected.upgradeValue });
              }
              responseMsg = `Pembelian berhasil: *${quantity}* ${selected.name} masuk ke inventory artefak.`;
            }
          }
        }
      } else {
        responseMsg = `Perintah toko tidak valid.`;
      }
      break;

    case 'inv':
      responseMsg = `> Inventory\nSenjata:\n${player.inventory.length === 0 ? "Kosong." : player.inventory.map((w, i) => `${i + 1}. ${w.name} (Lvl:${w.level}, XP:${w.xp}, Bonus:${w.bonus})`).join("\n")}\n\nArtefak:\n${player.artifacts.length ? player.artifacts.map((a, i) => `${i + 1}. ${a.name} (XP:${a.xp})`).join("\n") : "Tidak ada"}\n\nKitab:\n${player.books.length ? player.books.map((b, i) => `${i + 1}. ${b.name}`).join("\n") : "Tidak ada"}`;
      break;

    case 'pakai':
      if (player.inventory.length === 0)
        responseMsg = `Inventory senjata kosong.`;
      else {
        let idx = parseInt(args[1]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= player.inventory.length)
          responseMsg = `Indeks senjata tidak valid.`;
        else {
          player.equippedWeapon = player.inventory[idx];
          responseMsg = `Senjata *${player.equippedWeapon.name}* sudah dipakai. Siap bertempur!`;
        }
      }
      break;

    case 'jual':
      if (player.inventory.length === 0)
        responseMsg = `Inventory senjata kosong.`;
      else {
        let idx = parseInt(args[1]) - 1;
        if (isNaN(idx) || idx < 0 || idx >= player.inventory.length)
          responseMsg = `Indeks senjata tidak valid.`;
        else {
          let soldWeapon = player.inventory.splice(idx, 1)[0];
          let sellGold = Math.floor((soldWeapon.baseCost || 10) / 2);
          player.gold += sellGold;
          if (player.equippedWeapon && player.equippedWeapon.id === soldWeapon.id)
            player.equippedWeapon = null;
          responseMsg = `Senjata *${soldWeapon.name}* dijual, dapat *${sellGold}* emas.`;
        }
      }
      break;

    case 'tempa':
      // Upgrade senjata dengan artefak; hanya berlaku untuk senjata yang sedang dipakai
      if (!player.equippedWeapon) {
        responseMsg = `Kamu harus memakai senjata terlebih dahulu untuk menempa.`;
      } else if (player.artifacts.length === 0) {
        responseMsg = `Inventory artefak kosong.`;
      } else {
        if (args.length < 3) {
          responseMsg = `Perintah tempa tidak valid. Gunakan: tempa [nomor artefak] [jumlah]`;
        } else {
          let artIdx = parseInt(args[1]) - 1;
          let qty = parseInt(args[2]);
          if (isNaN(artIdx) || artIdx < 0 || artIdx >= player.artifacts.length) {
            responseMsg = `Indeks artefak tidak valid.`;
          } else if (isNaN(qty) || qty < 1) {
            responseMsg = `Jumlah artefak tidak valid.`;
          } else {
            let selectedArtifact = player.artifacts[artIdx];
            let count = player.artifacts.filter(a => a.name === selectedArtifact.name).length;
            if (count < qty) {
              responseMsg = `Kamu tidak memiliki cukup artefak *${selectedArtifact.name}*.`;
            } else {
              let removed = 0;
              player.artifacts = player.artifacts.filter(a => {
                if (a.name === selectedArtifact.name && removed < qty) {
                  removed++;
                  return false;
                }
                return true;
              });
              let totalXP = qty * selectedArtifact.xp;
              player.equippedWeapon.xp = (player.equippedWeapon.xp || 0) + totalXP;
              responseMsg = `Artefak *${selectedArtifact.name}* digunakan menempa senjata. XP senjata bertambah *${totalXP}*.\n`;
              if (player.equippedWeapon.xp >= 100) {
                player.equippedWeapon.level = (player.equippedWeapon.level || 1) + 1;
                player.equippedWeapon.xp -= 100;
                player.equippedWeapon.bonus = (player.equippedWeapon.bonus || 0) + 1;
                responseMsg += `Senjata naik level ke *${player.equippedWeapon.level}*!`;
              }
            }
          }
        }
      }
      break;

    default:
      responseMsg = `Perintah tidak dikenal. Coba: \`mulai\`, \`serang\`, \`kabur\`, \`ambil\`, \`lanjut\`, \`berhenti\`, \`status\`, \`quest\`, \`heal\`, \`toko artefak\`, \`inv\`, \`pakai\`, \`jual\`, \`tempa\`.`;
  }

  await apiWriteData('users', usersData);
  await apiWriteData('rooms', roomsData);
  res.send(responseMsg);
});

module.exports = router;