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

function pickRandomWord() {
  const length = Math.floor(Math.random() * (MAX_LEN - MIN_LEN + 1)) + MIN_LEN;
  const candidates = wordsOfLength(length);
  const pool = candidates.length > 0 ? candidates : DICTIONARY;
  const word = pool[Math.floor(Math.random() * pool.length)];
  return word;
}

/** rooms: roomId -> { word, length, attempts, guesses, maxAttempts, players, currentPlayerIndex } */
const rooms = new Map();

function createOrResetRoom(roomId) {
  const word = pickRandomWord();
  const room = {
    id: roomId,
    word,
    length: word.length,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    guesses: [],
    players: [],
    currentPlayerIndex: 0,
    status: "playing" // "playing" | "won" | "lost"
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
        : null
  };

  const data = JSON.stringify(payload);
  room.players.forEach((p) => {
    if (p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(data);
    }
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

wss.on("connection", (ws) => {
  let currentRoomId = null;
  let clientId = makeClientId();

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === "join") {
      const { roomId } = msg;
      if (!roomId) return;

      currentRoomId = roomId;
      let room = rooms.get(roomId);
      if (!room) {
        room = createOrResetRoom(roomId);
      }

      if (!room.players.find((p) => p.id === clientId)) {
        room.players.push({ id: clientId, ws });
      }

      ws.send(
        JSON.stringify({
          type: "joined",
          roomId: room.id,
          playerId: clientId,
          length: room.length,
          maxAttempts: room.maxAttempts
        })
      );
      broadcastRoomState(room);
      return;
    }

    if (msg.type === "newGame") {
      if (!currentRoomId) return;
      const room = createOrResetRoom(currentRoomId);
      broadcastRoomState(room);
      return;
    }

    if (msg.type === "guess") {
      const { guess } = msg;
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room || room.status !== "playing") return;
      if (typeof guess !== "string") return;

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

