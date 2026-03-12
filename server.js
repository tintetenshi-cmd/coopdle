const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static frontend
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// ----- Word / room logic -----

function calculateSemanticProximity(word, targetWord) {
  // Algorithme de proximité sémantique amélioré
  const w1 = word.toLowerCase().trim();
  const w2 = targetWord.toLowerCase().trim();
  
  // Si c'est le même mot, score maximum
  if (w1 === w2) return 100;
  
  // Base de données sémantique étendue avec scores calibrés
  const semanticDatabase = {
    // Animaux
    'chat': {
      'animal': 85, 'félin': 95, 'miaou': 90, 'ronron': 88, 'souris': 75, 
      'chien': 70, 'mammifère': 80, 'domestique': 82, 'poil': 65, 'griffes': 78
    },
    'chien': {
      'animal': 85, 'canin': 95, 'aboie': 90, 'fidèle': 88, 'os': 85,
      'chat': 70, 'mammifère': 80, 'domestique': 82, 'queue': 75, 'loyal': 87
    },
    'oiseau': {
      'animal': 85, 'voler': 92, 'plume': 90, 'nid': 88, 'chanter': 85,
      'aile': 90, 'bec': 88, 'ciel': 75, 'arbre': 70, 'œuf': 82
    },
    
    // Maison et habitat
    'maison': {
      'toit': 88, 'porte': 85, 'fenêtre': 85, 'habiter': 90, 'foyer': 92,
      'mur': 80, 'chambre': 82, 'cuisine': 78, 'salon': 78, 'famille': 75
    },
    'appartement': {
      'maison': 85, 'logement': 90, 'habiter': 88, 'immeuble': 85, 'loyer': 80,
      'chambre': 82, 'cuisine': 78, 'balcon': 75, 'voisin': 70
    },
    
    // Éléments naturels
    'eau': {
      'liquide': 95, 'boire': 88, 'mer': 85, 'rivière': 90, 'pluie': 85,
      'océan': 88, 'lac': 87, 'source': 85, 'humide': 80, 'transparent': 70
    },
    'feu': {
      'flamme': 95, 'chaud': 90, 'brûler': 92, 'rouge': 75, 'chaleur': 88,
      'incendie': 85, 'allumette': 80, 'fumée': 82, 'cendre': 78, 'danger': 70
    },
    'terre': {
      'sol': 90, 'planète': 85, 'jardin': 80, 'plante': 75, 'agriculture': 82,
      'boue': 78, 'sable': 75, 'pierre': 70, 'racine': 77, 'creuser': 80
    },
    
    // Objets du quotidien
    'livre': {
      'lire': 95, 'page': 90, 'histoire': 85, 'auteur': 88, 'papier': 82,
      'roman': 87, 'bibliothèque': 85, 'mot': 80, 'écrire': 83, 'savoir': 78
    },
    'voiture': {
      'rouler': 90, 'route': 85, 'essence': 88, 'volant': 92, 'roue': 90,
      'conduire': 88, 'transport': 85, 'garage': 80, 'vitesse': 82, 'frein': 85
    },
    'téléphone': {
      'appeler': 95, 'communication': 88, 'portable': 85, 'sonner': 90, 'numéro': 85,
      'conversation': 82, 'message': 80, 'contact': 83, 'écran': 75, 'batterie': 70
    },
    
    // Nourriture
    'pain': {
      'manger': 85, 'boulangerie': 90, 'farine': 88, 'croûte': 85, 'mie': 87,
      'beurre': 80, 'sandwich': 82, 'petit-déjeuner': 78, 'four': 75, 'blé': 83
    },
    'pomme': {
      'fruit': 95, 'rouge': 80, 'arbre': 85, 'manger': 82, 'sucré': 78,
      'poire': 85, 'verger': 88, 'vitamine': 75, 'croquer': 83, 'jus': 80
    },
    
    // Couleurs
    'rouge': {
      'couleur': 95, 'sang': 85, 'feu': 80, 'rose': 82, 'orange': 78,
      'cerise': 85, 'tomate': 80, 'passion': 75, 'danger': 70, 'amour': 72
    },
    'bleu': {
      'couleur': 95, 'ciel': 88, 'mer': 85, 'eau': 80, 'froid': 75,
      'vert': 78, 'océan': 87, 'calme': 70, 'paix': 72, 'nuit': 68
    },
    
    // Émotions et concepts abstraits
    'amour': {
      'cœur': 90, 'sentiment': 88, 'passion': 85, 'tendresse': 87, 'affection': 90,
      'famille': 80, 'couple': 85, 'bonheur': 82, 'joie': 78, 'haine': 25
    },
    'joie': {
      'bonheur': 92, 'rire': 88, 'sourire': 85, 'plaisir': 83, 'fête': 80,
      'content': 87, 'gai': 85, 'tristesse': 15, 'mélancolie': 20, 'euphorie': 88
    }
  };
  
  // Vérification directe dans la base sémantique
  if (semanticDatabase[w2] && semanticDatabase[w2][w1]) {
    return semanticDatabase[w2][w1];
  }
  if (semanticDatabase[w1] && semanticDatabase[w1][w2]) {
    return semanticDatabase[w1][w2];
  }
  
  // Calcul de similarité orthographique comme fallback
  let score = 0;
  
  // Bonus pour les lettres communes (pondéré)
  const letters1 = w1.split('');
  const letters2 = w2.split('');
  const commonLetters = letters1.filter(letter => letters2.includes(letter));
  const letterSimilarity = (commonLetters.length / Math.max(letters1.length, letters2.length)) * 25;
  score += letterSimilarity;
  
  // Bonus pour la longueur similaire
  const lengthDiff = Math.abs(w1.length - w2.length);
  const lengthBonus = Math.max(0, 15 - lengthDiff * 2);
  score += lengthBonus;
  
  // Bonus pour les préfixes communs (plus important)
  let prefixMatch = 0;
  for (let i = 0; i < Math.min(w1.length, w2.length); i++) {
    if (w1[i] === w2[i]) prefixMatch++;
    else break;
  }
  score += prefixMatch * 4;
  
  // Bonus pour les suffixes communs
  let suffixMatch = 0;
  for (let i = 1; i <= Math.min(w1.length, w2.length); i++) {
    if (w1[w1.length - i] === w2[w2.length - i]) suffixMatch++;
    else break;
  }
  score += suffixMatch * 3;
  
  // Détection de racines communes (français)
  const commonRoots = [
    ['mang', 'aliment', 'nourr'], // alimentation
    ['boir', 'liquid', 'eau'], // boisson
    ['march', 'cours', 'all'], // mouvement
    ['parl', 'dit', 'mot'], // parole
    ['regard', 'voir', 'œil'], // vision
    ['écout', 'entend', 'oreill'], // audition
  ];
  
  for (const roots of commonRoots) {
    const hasRoot1 = roots.some(root => w1.includes(root));
    const hasRoot2 = roots.some(root => w2.includes(root));
    if (hasRoot1 && hasRoot2) {
      score += 20;
      break;
    }
  }
  
  // Pénalité pour les mots très différents
  if (letterSimilarity < 10 && lengthDiff > 3) {
    score *= 0.7;
  }
  
  // Assurer que le score reste dans la plage 1-100
  return Math.min(100, Math.max(1, Math.round(score)));
}

// Tests de calibration
function testSemanticProximity() {
  const tests = [
    // Très proches (80-100)
    ['chat', 'félin', 95],
    ['chien', 'canin', 95],
    ['eau', 'liquide', 95],
    ['livre', 'lire', 95],
    
    // Proches (60-80)
    ['chat', 'animal', 85],
    ['maison', 'toit', 88],
    ['voiture', 'rouler', 90],
    
    // Moyennement proches (40-60)
    ['chat', 'chien', 70],
    ['eau', 'feu', 30],
    
    // Éloignés (1-40)
    ['chat', 'voiture', 15],
    ['livre', 'eau', 10]
  ];
  
  console.log('=== Tests de proximité sémantique ===');
  tests.forEach(([w1, w2, expected]) => {
    const score = calculateSemanticProximity(w1, w2);
    const diff = Math.abs(score - expected);
    console.log(`${w1} ↔ ${w2}: ${score}/100 (attendu: ${expected}, diff: ${diff})`);
  });
}

// Lancer les tests au démarrage du serveur
testSemanticProximity();

const MIN_LEN = 2;
const MAX_LEN = 10;
const MAX_ATTEMPTS = 6;

/** Simple demo dictionary with words from 2 to 10 letters */
const DICTIONARY = [
  "un",
  "oui",
  "non",
  "jeu",
  "mot",
  "code",
  "test",
  "noir",
  "violet",
  "piano",
  "route",
  "salut",
  "fusion",
  "cooper",
  "cursor",
  "projet",
  "serveur",
  "console",
  "ordinateur",
  "developp",
  "interface"
].map((w) => w.toLowerCase());

function wordsOfLength(len) {
  return DICTIONARY.filter((w) => w.length === len);
}

function pickRandomWord(lengthOverride) {
  let length = lengthOverride;
  if (
    typeof length !== "number" ||
    Number.isNaN(length) ||
    length < MIN_LEN ||
    length > MAX_LEN
  ) {
    length = Math.floor(Math.random() * (MAX_LEN - MIN_LEN + 1)) + MIN_LEN;
  }

  const candidates = wordsOfLength(length);
  const pool = candidates.length > 0 ? candidates : DICTIONARY;
  const word = pool[Math.floor(Math.random() * pool.length)];
  return word;
}

/** rooms: roomId -> { word, length, attempts, guesses, maxAttempts, players, currentPlayerIndex, status, revealedLetters } */
const rooms = new Map();

function createOrResetRoom(roomId, lengthOverride) {
  const word = pickRandomWord(lengthOverride);
  const room = {
    id: roomId,
    word,
    length: word.length,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    guesses: [],
    players: [],
    currentPlayerIndex: 0,
    status: "playing", // "playing" | "won" | "lost"
    revealedLetters: Array(word.length).fill(null)
  };
  rooms.set(roomId, room);
  return room;
}

function cleanupEmptyRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.players = room.players.filter((p) => p.ws.readyState === WebSocket.OPEN);
  if (room.players.length === 0) {
    rooms.delete(roomId);
  }
}

function broadcastRoomState(room) {
  const payload = {
    type: "state",
    roomId: room.id,
    length: room.length,
    guesses: room.guesses,
    attempts: room.attempts,
    maxAttempts: room.maxAttempts,
    status: room.status,
    currentPlayerId:
      room.players.length > 0
        ? room.players[room.currentPlayerIndex % room.players.length]?.id
        : null,
    players: room.players.map((p) => ({
      id: p.id,
      pseudo: p.pseudo,
      avatar: p.avatar,
      color: p.color
    })),
    revealedLetters: room.revealedLetters
  };

  const data = JSON.stringify(payload);
  // Filter out closed connections before broadcasting
  room.players = room.players.filter((p) => {
    if (p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(data);
      return true;
    }
    return false;
  });
}

function evaluateGuess(word, guess) {
  const result = [];
  const secret = word.split("");
  const g = guess.split("");

  const used = Array(secret.length).fill(false);

  // First pass: correct positions
  for (let i = 0; i < g.length; i++) {
    if (g[i] === secret[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  // Second pass: present (wrong place) or absent
  for (let i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;
    let found = false;
    for (let j = 0; j < secret.length; j++) {
      if (!used[j] && g[i] === secret[j]) {
        used[j] = true;
        found = true;
        break;
      }
    }
    result[i] = found ? "present" : "absent";
  }

  return result;
}

function makeClientId() {
  return Math.random().toString(36).slice(2, 10);
}

const AVATAR_EMOJIS = [
  "🦶",
  "🦄",
  "🐉",
  "🦖",
  "🦕",
  "🐙",
  "🦑",
  "🦈",
  "🐬",
  "🦭",
  "🐳",
  "🐋",
  "🐊",
  "🐍",
  "🦂",
  "🕷️",
  "🦇",
  "🦊",
  "🐺",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🦍",
  "🦧",
  "🐧",
  "🐦",
  "🦚",
  "🦜",
  "🦢",
  "🦩",
  "🐢",
  "🦋",
  "🐝",
  "🪲",
  "🪳",
  "🦀",
  "🦞",
  "🦐",
  "🐼",
  "🐱",
  "🐶",
  "🐰",
  "🦝",
  "🦓",
  "🦒",
  "🦘",
  "🦥",
  "🦦",
  "🦨",
  "🐲",
  "👾",
  "🤖",
  "👻",
  "💀",
  "🎃",
  "😺",
  "😈",
  "🥷",
  "🧙‍♂️",
  "🧙‍♀️",
  "🧛‍♂️",
  "🧛‍♀️",
  "🧟‍♂️",
  "🧟‍♀️",
  "🧞‍♂️",
  "🧞‍♀️",
  "🧚‍♂️",
  "🧚‍♀️",
  "🧜‍♂️",
  "🧜‍♀️",
  "🧠",
  "💎",
  "🔥",
  "⚡",
  "🌙",
  "⭐",
  "🌈",
  "🍕",
  "🍣",
  "🍩",
  "🍪",
  "🧁",
  "🥨",
  "🧋",
  "☕",
  "🎧",
  "🎮",
  "🕹️",
  "🎲",
  "🧩",
  "🛸",
  "🚀",
  "🏎️",
  "🧨",
  "🎆"
];

const NAME_COLORS = {
  violet: "#a855f7",
  indigo: "#818cf8",
  cyan: "#22d3ee",
  emerald: "#34d399",
  lime: "#a3e635",
  amber: "#fbbf24",
  orange: "#fb923c",
  rose: "#fb7185",
  fuchsia: "#e879f9",
  red: "#f87171",
  blue: "#60a5fa",
  teal: "#2dd4bf",
  slate: "#e5e7eb"
};

function randomAvatar() {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

function randomNameColor() {
  const values = Object.values(NAME_COLORS);
  return values[Math.floor(Math.random() * values.length)];
}

function revealRandomLetter(room) {
  if (!room || !room.word) return null;
  const available = [];
  for (let i = 0; i < room.length; i++) {
    if (!room.revealedLetters || !room.revealedLetters[i]) {
      available.push(i);
    }
  }
  if (available.length === 0) return null;
  const index = available[Math.floor(Math.random() * available.length)];
  const letter = room.word[index];
  if (!room.revealedLetters) {
    room.revealedLetters = Array(room.length).fill(null);
  }
  room.revealedLetters[index] = letter;
  return { index, letter };
}

wss.on("connection", (ws) => {
  let currentRoomId = null;
  const clientId = makeClientId();

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (error) {
      console.error("Invalid JSON received:", error);
      return;
    }

    if (msg.type === "join") {
      const { roomId, pseudo, desiredLength, avatar, colorId } = msg;
      if (!roomId || typeof pseudo !== "string" || !pseudo.trim()) return;

      currentRoomId = roomId;
      let room = rooms.get(roomId);
      if (!room) {
        const lengthOverride = Number.isFinite(desiredLength)
          ? desiredLength
          : undefined;
        room = createOrResetRoom(roomId, lengthOverride);
      }

      if (!room.players.find((p) => p.id === clientId)) {
        const chosenAvatar =
          typeof avatar === "string" && AVATAR_EMOJIS.includes(avatar)
            ? avatar
            : randomAvatar();
        const chosenColor =
          typeof colorId === "string" && colorId !== "random" && NAME_COLORS[colorId]
            ? NAME_COLORS[colorId]
            : randomNameColor();
        room.players.push({
          id: clientId,
          ws,
          pseudo: pseudo.trim().slice(0, 16),
          avatar: chosenAvatar,
          color: chosenColor
        });
      }

      ws.send(
        JSON.stringify({
          type: "joined",
          roomId: room.id,
          playerId: clientId,
          length: room.length,
          maxAttempts: room.maxAttempts,
          revealedLetters: room.revealedLetters || Array(room.length).fill(null),
          players: room.players.map((p) => ({
            id: p.id,
            pseudo: p.pseudo,
            avatar: p.avatar,
            color: p.color
          }))
        })
      );
      
      // Send system message to all players when someone joins
      const systemMessages = [
        "les cuillères chantent l'hymne des cornichons perdus",
        "alerte rouge : les chaussettes ont pris le contrôle du grille-pain",
        "transmission interceptée depuis la dimension des parapluies violets",
        "les pixels se rebellent contre la tyrannie des écrans plats",
        "protocole banane activé : les singes cosmiques approchent",
        "erreur 404 : la logique s'est échappée par la fenêtre du 12ème étage",
        "les lettres de l'alphabet complotent avec les chiffres impairs",
        "détection d'une invasion de fourmis quantiques dans le processeur",
        "les nuages digitaux pleuvent des codes binaires en chocolat",
        "alerte : les cactus virtuels ont développé une conscience collective",
        "signal reçu depuis la planète des chaussures qui parlent",
        "les électrons dansent la salsa avec les protons en colère",
        "anomalie détectée : les mots se transforment en papillons radioactifs",
        "les serveurs rêvent de moutons électriques qui mangent des câbles",
        "transmission urgente : les pixels ont formé un syndicat révolutionnaire"
      ];
      
      const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
      const joinMessage = `${pseudo.trim().slice(0, 16)} a rejoint la partie ! ${randomMessage}`;
      
      const systemPayload = JSON.stringify({
        type: "systemMessage",
        text: joinMessage,
        ts: Date.now()
      });
      
      room.players.forEach((p) => {
        if (p.ws.readyState === WebSocket.OPEN) {
          p.ws.send(systemPayload);
        }
      });
      
      broadcastRoomState(room);
      return;
    }

    if (msg.type === "newGame") {
      if (!currentRoomId) return;
      const existing = rooms.get(currentRoomId);
      const baseLength = existing ? existing.length : undefined;
      const room = createOrResetRoom(currentRoomId, baseLength);
      if (existing) {
        room.players = existing.players;
        room.currentPlayerIndex = existing.currentPlayerIndex || 0;
      }
      broadcastRoomState(room);
      return;
    }

    if (msg.type === "guess") {
      const { guess } = msg;
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room || room.status !== "playing") return;
      if (typeof guess !== "string") return;

      if (
        room.players.length > 0 &&
        room.players[room.currentPlayerIndex % room.players.length]?.id !==
          clientId
      ) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Ce n'est pas votre tour."
          })
        );
        return;
      }

      const normalized = guess.trim().toLowerCase();
      if (!normalized || normalized.length !== room.length) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Le mot doit faire ${room.length} lettres.`
          })
        );
        return;
      }

      if (room.attempts >= room.maxAttempts) return;

      const feedback = evaluateGuess(room.word, normalized);

      room.guesses.push({
        guess: normalized,
        feedback,
        by: clientId
      });
      room.attempts += 1;

      if (normalized === room.word) {
        room.status = "won";
      } else if (room.attempts >= room.maxAttempts) {
        room.status = "lost";
      }

      if (room.players.length > 0) {
        const currentIndex = room.players.findIndex((p) => p.id === clientId);
        if (currentIndex !== -1) {
          room.currentPlayerIndex = (currentIndex + 1) % room.players.length;
        } else {
          room.currentPlayerIndex =
            (room.currentPlayerIndex + 1) % room.players.length;
        }
      }

      broadcastRoomState(room);

      if (room.status !== "playing") {
        const reveal = {
          type: "reveal",
          word: room.word
        };
        const data = JSON.stringify(reveal);
        room.players.forEach((p) => {
          if (p.ws.readyState === WebSocket.OPEN) {
            p.ws.send(data);
          }
        });
      }
      return;
    }

    if (msg.type === "chat") {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;
      const sender = room.players.find((p) => p.id === clientId);
      const textRaw = typeof msg.text === "string" ? msg.text : "";
      const text = textRaw.trim().slice(0, 200);
      if (!text) return;
      
      // Détecter si le message contient "67" pour l'effet spécial
      const contains67 = text.includes('67');
      
      const payload = JSON.stringify({
        type: "chat",
        from: clientId,
        pseudo: sender?.pseudo || "Joueur",
        avatar: sender?.avatar || "🙂",
        color: sender?.color || null,
        text,
        ts: Date.now(),
        special67: contains67 // Ajouter l'indicateur pour l'effet spécial
      });
      
      room.players.forEach((p) => {
        if (p.ws.readyState === WebSocket.OPEN) {
          p.ws.send(payload);
        }
      });
      return;
    }

    if (msg.type === "typing") {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room || room.status !== "playing") return;
      const sender = room.players.find((p) => p.id === clientId);
      if (!sender) return;
      if (
        room.players.length > 0 &&
        room.players[room.currentPlayerIndex % room.players.length]?.id !==
          clientId
      ) {
        return;
      }
      const textRaw = typeof msg.text === "string" ? msg.text : "";
      const text = textRaw.trim().slice(0, room.length);
      
      const payload = JSON.stringify({
        type: "typing",
        from: clientId,
        pseudo: sender.pseudo,
        text
      });
      
      room.players.forEach((p) => {
        if (p.ws.readyState === WebSocket.OPEN && p.id !== clientId) {
          p.ws.send(payload);
        }
      });
      return;
    }

    if (msg.type === "shop") {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room || room.status !== "playing") return;
      const { item } = msg;
      if (item === "letter") {
        const revealed = revealRandomLetter(room);
        if (!revealed) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Toutes les lettres sont déjà révélées."
            })
          );
          return;
        }
        const data = JSON.stringify({
          type: "revealLetter",
          index: revealed.index,
          letter: revealed.letter
        });
        room.players.forEach((p) => {
          if (p.ws.readyState === WebSocket.OPEN) {
            p.ws.send(data);
          }
        });
      }
      return;
    }

    if (msg.type === "cementix") {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;
      
      const sender = room.players.find((p) => p.id === clientId);
      if (!sender) return;
      
      const word = typeof msg.word === "string" ? msg.word.trim().toLowerCase() : "";
      if (!word || word.length < 2 || word.length > 20) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Le mot doit faire entre 2 et 20 lettres."
        }));
        return;
      }
      
      // Vérifier que le mot ne contient que des lettres
      if (!/^[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+$/.test(word)) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Le mot ne doit contenir que des lettres."
        }));
        return;
      }
      
      // Calculer la proximité sémantique avec le mot cible
      const score = calculateSemanticProximity(word, room.word);
      
      const payload = JSON.stringify({
        type: "cementix",
        pseudo: sender.pseudo,
        word: word,
        score: score,
        ts: Date.now()
      });
      
      // Envoyer à tous les joueurs de la room
      room.players.forEach((p) => {
        if (p.ws.readyState === WebSocket.OPEN) {
          p.ws.send(payload);
        }
      });
      return;
    }
  });

  ws.on("close", () => {
    if (currentRoomId) {
      cleanupEmptyRoom(currentRoomId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});

