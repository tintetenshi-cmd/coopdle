(() => {
  const screenTitle = document.getElementById("screen-title");
  const screenMode = document.getElementById("screen-mode");
  const screenGame = document.getElementById("screen-game");

  const btnPlay = document.getElementById("btn-play");
  const btnSolo = document.getElementById("btn-solo");
  const btnCoop = document.getElementById("btn-coop");
  const btnBackToTitle = document.getElementById("btn-back-to-title");
  const btnBackToMode = document.getElementById("btn-back-to-mode");
  const btnNewGame = document.getElementById("btn-new-game");
  const btnSubmit = document.getElementById("btn-submit");
  const btnCopyLink = document.getElementById("btn-copy-link");

  const badgeMode = document.getElementById("badge-mode");
  const badgeRoom = document.getElementById("badge-room");

  const wordLengthSpan = document.getElementById("word-length");
  const attemptsSpan = document.getElementById("attempts");
  const maxAttemptsSpan = document.getElementById("max-attempts");

  const boardEl = document.getElementById("board");
  const inputGuess = document.getElementById("input-guess");
  const errorEl = document.getElementById("error");
  const infoEl = document.getElementById("info");
  const statusCurrentPlayer = document.getElementById("status-current-player");
  const shareContainer = document.getElementById("share-container");
  const shareUrlEl = document.getElementById("share-url");

  let ws = null;
  let currentRoomId = null;
  let playerId = null;
  let currentMode = null; // "solo" | "coop"
  let length = null;
  let maxAttempts = 6;
  let guesses = [];
  let attempts = 0;
  let status = "playing";
  let currentPlayerId = null;

  function showScreen(screen) {
    [screenTitle, screenMode, screenGame].forEach((s) => {
      s.classList.add("hidden");
    });
    screen.classList.remove("hidden");
  }

  function clearMessages() {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
    infoEl.textContent = "";
    infoEl.classList.add("hidden");
  }

  function showError(text) {
    errorEl.textContent = text;
    errorEl.classList.remove("hidden");
  }

  function showInfo(text) {
    infoEl.textContent = text;
    infoEl.classList.remove("hidden");
  }

  function updateStatusLine() {
    if (!currentMode) {
      statusCurrentPlayer.textContent = "";
      return;
    }
    if (status === "won") {
      statusCurrentPlayer.textContent = "Bravo ! Vous avez trouvé le mot.";
      return;
    }
    if (status === "lost") {
      statusCurrentPlayer.textContent =
        "Partie terminée. Lancez une nouvelle partie pour rejouer.";
      return;
    }
    if (currentMode === "solo") {
      statusCurrentPlayer.textContent =
        "Mode solo : faites vos 6 essais pour trouver le mot.";
    } else {
      if (!currentPlayerId) {
        statusCurrentPlayer.textContent = "En attente de joueurs...";
      } else if (currentPlayerId === playerId) {
        statusCurrentPlayer.textContent = "C'est votre tour de proposer un mot.";
      } else {
        statusCurrentPlayer.textContent =
          "C'est le tour de votre coéquipier. La grille se synchronise en temps réel.";
      }
    }
  }

  function renderBoard() {
    if (!length) {
      boardEl.innerHTML = "";
      return;
    }
    boardEl.style.gridTemplateRows = `repeat(${maxAttempts}, 1fr)`;

    boardEl.innerHTML = "";
    for (let row = 0; row < maxAttempts; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "board-row";
      rowEl.style.gridTemplateColumns = `repeat(${length}, 1fr)`;

      const guess = guesses[row];
      for (let col = 0; col < length; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        if (guess) {
          const letter = guess.guess[col] || "";
          cell.textContent = letter || "";
          const feedback = guess.feedback[col];
          if (feedback) {
            cell.classList.add(feedback);
          }
        }
        rowEl.appendChild(cell);
      }

      boardEl.appendChild(rowEl);
    }
  }

  function connectWebSocket(roomId) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}`;
    ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "join", roomId }));
      clearMessages();
    });

    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "joined") {
        playerId = msg.playerId;
        currentRoomId = msg.roomId;
        length = msg.length;
        maxAttempts = msg.maxAttempts;
        maxAttemptsSpan.textContent = maxAttempts.toString();
        wordLengthSpan.textContent = length.toString();
        attemptsSpan.textContent = "0";
        guesses = [];
        attempts = 0;
        status = "playing";
        currentPlayerId = null;
        renderBoard();
        updateStatusLine();
        if (currentMode === "coop") {
          prepareShareLink();
        }
      } else if (msg.type === "state") {
        length = msg.length;
        guesses = msg.guesses || [];
        attempts = msg.attempts || 0;
        maxAttempts = msg.maxAttempts || 6;
        status = msg.status || "playing";
        currentPlayerId = msg.currentPlayerId || null;
        wordLengthSpan.textContent = length.toString();
        attemptsSpan.textContent = attempts.toString();
        maxAttemptsSpan.textContent = maxAttempts.toString();
        renderBoard();
        updateStatusLine();
      } else if (msg.type === "error") {
        showError(msg.message || "Erreur.");
      } else if (msg.type === "reveal") {
        if (status === "won") {
          showInfo(`Mot trouvé : ${msg.word.toUpperCase()}`);
        } else {
          showInfo(`Le mot était : ${msg.word.toUpperCase()}`);
        }
      }
    });

    ws.addEventListener("close", () => {
      showInfo("Connexion perdue avec le serveur. Rafraîchissez la page.");
    });
  }

  function randomRoomId() {
    return Math.random().toString(36).slice(2, 8);
  }

  function startMode(mode, existingRoomId) {
    currentMode = mode;
    badgeMode.textContent = mode === "solo" ? "Mode solo" : "Mode coop";
    currentRoomId = existingRoomId || `${mode}-${randomRoomId()}`;
    badgeRoom.textContent = `Room : ${currentRoomId}`;
    attemptsSpan.textContent = "0";
    wordLengthSpan.textContent = "-";
    guesses = [];
    attempts = 0;
    status = "playing";
    clearMessages();
    updateStatusLine();
    renderBoard();

    if (mode === "coop") {
      shareContainer.classList.remove("hidden");
      prepareShareLink();
    } else {
      shareContainer.classList.add("hidden");
    }

    showScreen(screenGame);
    connectWebSocket(currentRoomId);
  }

  function prepareShareLink() {
    if (!currentRoomId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("room", currentRoomId);
    shareUrlEl.textContent = url.toString();
    shareContainer.classList.remove("hidden");
  }

  function handleGuessSubmit() {
    clearMessages();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      showError("Connexion au serveur en cours ou interrompue.");
      return;
    }
    if (!inputGuess.value.trim()) return;

    const guess = inputGuess.value.trim();
    ws.send(JSON.stringify({ type: "guess", guess }));
    inputGuess.value = "";
  }

  function sendNewGame() {
    clearMessages();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      showError("Impossible de lancer une nouvelle partie : pas de connexion.");
      return;
    }
    ws.send(JSON.stringify({ type: "newGame" }));
  }

  btnPlay.addEventListener("click", () => {
    showScreen(screenMode);
  });

  btnBackToTitle.addEventListener("click", () => {
    showScreen(screenTitle);
  });

  btnBackToMode.addEventListener("click", () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    showScreen(screenMode);
  });

  btnSolo.addEventListener("click", () => {
    startMode("solo");
  });

  btnCoop.addEventListener("click", () => {
    startMode("coop");
  });

  btnNewGame.addEventListener("click", () => {
    sendNewGame();
  });

  btnSubmit.addEventListener("click", () => {
    handleGuessSubmit();
  });

  inputGuess.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleGuessSubmit();
    }
  });

  btnCopyLink.addEventListener("click", async () => {
    if (!shareUrlEl.textContent) return;
    try {
      await navigator.clipboard.writeText(shareUrlEl.textContent);
      showInfo("Lien copié dans le presse-papiers.");
    } catch {
      showError("Impossible de copier le lien, copiez-le manuellement.");
    }
  });

  function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      currentMode = "coop";
      badgeMode.textContent = "Mode coop";
      startMode("coop", room);
    }
  }

  showScreen(screenTitle);
  initFromUrl();
})();

