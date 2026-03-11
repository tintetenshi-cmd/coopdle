(() => {
  const screenTitle = document.getElementById("screen-title");
  const screenMode = document.getElementById("screen-mode");
  const screenGame = document.getElementById("screen-game");

  const btnPlay = document.getElementById("btn-play");
  const btnSolo = document.getElementById("btn-solo");
  const btnCoop = document.getElementById("btn-coop");
  const btnJoinRoom = document.getElementById("btn-join-room");
  const btnBackToTitle = document.getElementById("btn-back-to-title");
  const btnBackToMode = document.getElementById("btn-back-to-mode");
  const btnNewGame = document.getElementById("btn-new-game");
  const btnSubmit = document.getElementById("btn-submit");
  const btnCopyLink = document.getElementById("btn-copy-link");

  const badgeMode = document.getElementById("badge-mode");
  const badgeRoom = document.getElementById("badge-room");

  const modeTitle = document.getElementById("mode-title");
  const modeDescription = document.getElementById("mode-description");
  const modeButtonsMain = document.getElementById("mode-buttons-main");
  const modeButtonsJoin = document.getElementById("mode-buttons-join");
  const fieldLength = document.getElementById("field-length");
  const inputPseudo = document.getElementById("input-pseudo");
  const selectLength = document.getElementById("select-length");

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
  const participantsList = document.getElementById("participants-list");

  const btnFootClick = document.getElementById("btn-foot-click");
  const btnUpgradeClick = document.getElementById("btn-upgrade-click");
  const btnUpgradeAuto = document.getElementById("btn-upgrade-auto");
  const idleStepsEl = document.getElementById("idle-steps");
  const idlePerClickEl = document.getElementById("idle-per-click");
  const idleAutoRateEl = document.getElementById("idle-auto-rate");
  const idleCostClickEl = document.getElementById("cost-click");
  const idleCostAutoEl = document.getElementById("cost-auto");

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
  let players = [];

  let currentRoomFromUrl = null;

  // idle game state
  let idleSteps = 0;
  let idlePerClick = 1;
  let idleAutoRate = 0;
  let idleCostClick = 10;
  let idleCostAuto = 25;

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

  function renderParticipants() {
    participantsList.innerHTML = "";
    players.forEach((p) => {
      const li = document.createElement("li");
      li.className = "participant";
      if (p.id === playerId) {
        li.classList.add("you");
      }
      if (p.id === currentPlayerId) {
        li.classList.add("current");
      }

      const avatar = document.createElement("div");
      avatar.className = "participant-avatar";
      avatar.textContent = p.avatar || "🙂";

      const name = document.createElement("span");
      name.className = "participant-name";
      name.textContent = p.pseudo || "Joueur";

      li.appendChild(avatar);
      li.appendChild(name);
      participantsList.appendChild(li);
    });
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
      btnNewGame.classList.add("pulse");
      return;
    }
    if (status === "lost") {
      statusCurrentPlayer.textContent =
        "Partie terminée. Lancez une nouvelle partie pour rejouer.";
      btnNewGame.classList.add("pulse");
      return;
    }
    btnNewGame.classList.remove("pulse");

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

      if (row === guesses.length - 1 && guess) {
        rowEl.classList.add("pop");
      }

      boardEl.appendChild(rowEl);
    }
  }

  function connectWebSocket(roomId, pseudo, desiredLength) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}`;
    ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      ws.send(
        JSON.stringify({
          type: "join",
          roomId,
          pseudo,
          desiredLength
        })
      );
      clearMessages();
    });

    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "joined") {
        playerId = msg.playerId;
        currentRoomId = msg.roomId;
        length = msg.length;
        maxAttempts = msg.maxAttempts;
        players = msg.players || [];
        maxAttemptsSpan.textContent = maxAttempts.toString();
        wordLengthSpan.textContent = length.toString();
        attemptsSpan.textContent = "0";
        guesses = [];
        attempts = 0;
        status = "playing";
        currentPlayerId = null;
        renderBoard();
        renderParticipants();
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
        players = msg.players || players;
        wordLengthSpan.textContent = length.toString();
        attemptsSpan.textContent = attempts.toString();
        maxAttemptsSpan.textContent = maxAttempts.toString();
        renderBoard();
        renderParticipants();
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

  function startMode(mode, existingRoomId, pseudo, explicitLength) {
    currentMode = mode;
    badgeMode.textContent = mode === "solo" ? "Mode solo" : "Mode coop";
    currentRoomId = existingRoomId || `${mode}-${randomRoomId()}`;
    badgeRoom.textContent = `Room : ${currentRoomId}`;
    attemptsSpan.textContent = "0";
    wordLengthSpan.textContent = "-";
    guesses = [];
    attempts = 0;
    status = "playing";
    players = [];
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
    const lengthValue =
      typeof explicitLength === "number" && explicitLength > 0
        ? explicitLength
        : null;
    connectWebSocket(currentRoomId, pseudo || "Joueur", lengthValue);
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
    if (currentPlayerId && currentPlayerId !== playerId) {
      showError("Ce n'est pas votre tour.");
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
    startMode("solo", null, inputPseudo.value.trim() || "Solo", null);
  });

  btnCoop.addEventListener("click", () => {
    const pseudo = inputPseudo.value.trim();
    if (!pseudo) {
      showError("Choisissez un pseudo avant de créer une room.");
      return;
    }
    const rawLen = parseInt(selectLength.value, 10);
    const explicitLength =
      Number.isFinite(rawLen) && rawLen > 0 ? rawLen : null;
    startMode("coop", null, pseudo, explicitLength);
  });

  btnJoinRoom.addEventListener("click", () => {
    const pseudo = inputPseudo.value.trim();
    if (!pseudo) {
      showError("Entrez un pseudo pour rejoindre la room.");
      return;
    }
    if (!currentRoomFromUrl) {
      showError("Room invalide.");
      return;
    }
    startMode("coop", currentRoomFromUrl, pseudo, null);
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
      currentRoomFromUrl = room;
      modeTitle.textContent = "Rejoindre une room coop";
      modeDescription.textContent =
        "Entrez votre pseudo pour rejoindre la room existante.";
      fieldLength.classList.add("hidden");
      modeButtonsMain.classList.add("hidden");
      modeButtonsJoin.classList.remove("hidden");
      showScreen(screenMode);
    }
  }

  initFromUrl();
  if (!currentRoomFromUrl) {
    showScreen(screenTitle);
  }

  // Idle game logic
  function updateIdleUI() {
    idleStepsEl.textContent = idleSteps.toString();
    idlePerClickEl.textContent = idlePerClick.toString();
    idleAutoRateEl.textContent = idleAutoRate.toString();
    idleCostClickEl.textContent = idleCostClick.toString();
    idleCostAutoEl.textContent = idleCostAuto.toString();
  }

  btnFootClick.addEventListener("click", () => {
    idleSteps += idlePerClick;
    updateIdleUI();
  });

  btnUpgradeClick.addEventListener("click", () => {
    if (idleSteps < idleCostClick) return;
    idleSteps -= idleCostClick;
    idlePerClick += 1;
    idleCostClick = Math.round(idleCostClick * 1.6);
    updateIdleUI();
  });

  btnUpgradeAuto.addEventListener("click", () => {
    if (idleSteps < idleCostAuto) return;
    idleSteps -= idleCostAuto;
    idleAutoRate += 1;
    idleCostAuto = Math.round(idleCostAuto * 1.8);
    updateIdleUI();
  });

  setInterval(() => {
    if (idleAutoRate > 0) {
      idleSteps += idleAutoRate;
      updateIdleUI();
    }
  }, 1000);

  updateIdleUI();
})();

