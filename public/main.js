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
  const selectAvatar = document.getElementById("select-avatar");
  const selectNameColor = document.getElementById("select-name-color");

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
  const boardPanel = document.getElementById("board-panel");
  const screenGameEl = document.getElementById("screen-game");

  const btnFootClick = document.getElementById("btn-foot-click");
  const btnUpgradeClick = document.getElementById("btn-upgrade-click");
  const btnUpgradeAuto = document.getElementById("btn-upgrade-auto");
  const idleStepsEl = document.getElementById("idle-steps");
  const idlePerClickEl = document.getElementById("idle-per-click");
  const idleAutoRateEl = document.getElementById("idle-auto-rate");
  const idleCostClickEl = document.getElementById("cost-click");
  const idleCostAutoEl = document.getElementById("cost-auto");
  const idleCostLetterEl = document.getElementById("cost-letter");

  const inputChat = document.getElementById("input-chat");
  const btnSendChat = document.getElementById("btn-send-chat");
  const chatMessagesEl = document.getElementById("chat-messages");

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
  let idleCostLetter = 500;

  let previewGuess = "";
  let previewAuthorId = null;
  let revealedLetters = [];

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

  const NAME_COLORS = [
    { id: "violet", label: "Violet", value: "#a855f7" },
    { id: "indigo", label: "Indigo", value: "#818cf8" },
    { id: "cyan", label: "Cyan", value: "#22d3ee" },
    { id: "emerald", label: "Émeraude", value: "#34d399" },
    { id: "lime", label: "Lime", value: "#a3e635" },
    { id: "amber", label: "Ambre", value: "#fbbf24" },
    { id: "orange", label: "Orange", value: "#fb923c" },
    { id: "rose", label: "Rose", value: "#fb7185" },
    { id: "fuchsia", label: "Fuchsia", value: "#e879f9" },
    { id: "red", label: "Rouge", value: "#f87171" },
    { id: "blue", label: "Bleu", value: "#60a5fa" },
    { id: "teal", label: "Turquoise", value: "#2dd4bf" },
    { id: "slate", label: "Gris clair", value: "#e5e7eb" }
  ];

  function fillAvatarAndColorSelects() {
    if (selectAvatar && selectAvatar.options.length <= 1) {
      AVATAR_EMOJIS.forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e;
        opt.textContent = `${e} ${e}`;
        selectAvatar.appendChild(opt);
      });
    }
    if (selectNameColor && selectNameColor.options.length <= 1) {
      NAME_COLORS.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.label;
        selectNameColor.appendChild(opt);
      });
    }
  }

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
      if (p.color) {
        name.style.color = p.color;
      }

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
      updateInputEnabled();
      return;
    }
    if (status === "lost") {
      statusCurrentPlayer.textContent =
        "Partie terminée. Lancez une nouvelle partie pour rejouer.";
      btnNewGame.classList.add("pulse");
      updateInputEnabled();
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
    updateInputEnabled();
  }

  function updateInputEnabled() {
    const canType =
      status === "playing" &&
      (currentMode === "solo" ||
        !currentPlayerId ||
        currentPlayerId === playerId);
    inputGuess.disabled = !canType;
    btnSubmit.disabled = !canType;
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
        } else {
          if (
            revealedLetters &&
            revealedLetters[col]
          ) {
            cell.textContent = revealedLetters[col].toUpperCase();
            cell.classList.add("revealed-letter");
          }
          if (
            row === attempts &&
            previewGuess &&
            previewAuthorId &&
            previewAuthorId === currentPlayerId
          ) {
            const letter = previewGuess[col] || "";
            if (letter) {
              cell.textContent = letter.toUpperCase();
            }
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

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host || "localhost:3000";
    const wsUrl = `${protocol}//${host}`;
    ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      const avatarValue = selectAvatar?.value || "random";
      const colorId = selectNameColor?.value || "random";
      ws.send(
        JSON.stringify({
          type: "join",
          roomId,
          pseudo,
          desiredLength,
          avatar: avatarValue,
          colorId
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
        previewGuess = "";
        previewAuthorId = null;
        revealedLetters = msg.revealedLetters || Array(length).fill(null);
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
        revealedLetters = msg.revealedLetters || revealedLetters;
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
      } else if (msg.type === "chat") {
        appendChatMessage(msg);
      } else if (msg.type === "typing") {
        if (msg.from && msg.from === currentPlayerId) {
          previewAuthorId = msg.from;
          previewGuess = msg.text || "";
          renderBoard();
        }
      } else if (msg.type === "revealLetter") {
        if (!revealedLetters) {
          revealedLetters = Array(length).fill(null);
        }
        revealedLetters[msg.index] = msg.letter;
        showInfo("Une lettre a été révélée via le shop !");
        renderBoard();
      } else if (msg.type === "effect") {
        applyEffect(msg.effect);
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
    previewGuess = "";
    previewAuthorId = null;
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

  fillAvatarAndColorSelects();

  // Idle game logic
  function updateIdleUI() {
    idleStepsEl.textContent = idleSteps.toString();
    idlePerClickEl.textContent = idlePerClick.toString();
    idleAutoRateEl.textContent = idleAutoRate.toString();
    idleCostClickEl.textContent = idleCostClick.toString();
    idleCostAutoEl.textContent = idleCostAuto.toString();
    idleCostLetterEl.textContent = idleCostLetter.toString();
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

  // Chat logic
  function appendChatMessage(msg) {
    const wrapper = document.createElement("div");
    wrapper.className = "chat-message";
    if (msg.from === playerId) {
      wrapper.classList.add("you");
    }
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = msg.avatar || "🙂";

    const content = document.createElement("div");
    content.className = "chat-content";

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = msg.pseudo || "Joueur";
    if (msg.color) {
      nameSpan.style.color = msg.color;
      nameSpan.style.fontWeight = "700";
    }
    const timeSpan = document.createElement("span");
    const date = msg.ts ? new Date(msg.ts) : new Date();
    timeSpan.textContent = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
    meta.appendChild(nameSpan);
    meta.appendChild(timeSpan);

    const textP = document.createElement("div");
    textP.className = "chat-text";
    textP.textContent = msg.text;

    content.appendChild(meta);
    content.appendChild(textP);

    wrapper.appendChild(avatar);
    wrapper.appendChild(content);
    chatMessagesEl.appendChild(wrapper);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function sendChatMessage() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const text = inputChat.value.trim();
    if (!text) return;
    ws.send(JSON.stringify({ type: "chat", text }));
    inputChat.value = "";
  }

  btnSendChat.addEventListener("click", () => {
    sendChatMessage();
  });

  inputChat.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // typing preview sending
  inputGuess.addEventListener("input", () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (status !== "playing") return;
    if (currentMode === "coop" && currentPlayerId && currentPlayerId !== playerId)
      return;
    previewGuess = inputGuess.value;
    previewAuthorId = playerId;
    renderBoard();
    ws.send(
      JSON.stringify({
        type: "typing",
        text: previewGuess
      })
    );
  });

  // shop logic
  const btnShopLetter = document.getElementById("btn-shop-letter");
  const btnEffectFlames = document.getElementById("btn-effect-flames");
  const btnEffectShake = document.getElementById("btn-effect-shake");
  const btnEffectNeon = document.getElementById("btn-effect-neon");
  const btnEffectRain = document.getElementById("btn-effect-rain");
  const btnEffectBlur = document.getElementById("btn-effect-blur");

  function buyLetterReveal() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    if (idleSteps < idleCostLetter) return;
    idleSteps -= idleCostLetter;
    idleCostLetter = Math.round(idleCostLetter * 1.9);
    updateIdleUI();
    ws.send(JSON.stringify({ type: "shop", item: "letter" }));
  }

  btnShopLetter.addEventListener("click", buyLetterReveal);

  function triggerEffect(effect) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "effect", effect }));
  }

  btnEffectFlames.addEventListener("click", () => triggerEffect("flames"));
  btnEffectShake.addEventListener("click", () => triggerEffect("shake"));
  btnEffectNeon.addEventListener("click", () => triggerEffect("neon"));
  btnEffectRain.addEventListener("click", () => triggerEffect("rain"));
  btnEffectBlur.addEventListener("click", () => triggerEffect("blur"));

  function applyEffect(effect) {
    if (!effect) return;
    if (effect === "flames") {
      boardPanel.classList.add("effect-flames");
      setTimeout(() => {
        boardPanel.classList.remove("effect-flames");
      }, 4500);
    } else if (effect === "shake") {
      screenGameEl.classList.add("effect-shake");
      setTimeout(() => {
        screenGameEl.classList.remove("effect-shake");
      }, 1200);
    } else if (effect === "neon") {
      boardPanel.classList.add("effect-neon");
      setTimeout(() => {
        boardPanel.classList.remove("effect-neon");
      }, 4500);
    } else if (effect === "rain") {
      boardPanel.classList.add("effect-rain");
      setTimeout(() => {
        boardPanel.classList.remove("effect-rain");
      }, 4500);
    } else if (effect === "blur") {
      boardPanel.classList.add("effect-blur");
      setTimeout(() => {
        boardPanel.classList.remove("effect-blur");
      }, 3000);
    }
  }

  // Monkey logic
  const monkeyContainer = document.getElementById("monkey-container");
  const monkeyBubble = document.getElementById("monkey-bubble");

  const MONKEY_PHRASES = [
    "Les bananes sont carrées",
    "J'ai vu un nuage manger une chaussette",
    "Le temps est un sandwich",
    "Les lettres dansent la nuit",
    "Mon cousin est une cuillère",
    "Les mots ont des pattes",
    "J'entends les couleurs",
    "Le silence a un goût de fraise",
    "Les chiffres me regardent",
    "Je rêve en pixels",
    "La lune est un fromage menteur",
    "Les arbres parlent en morse",
    "J'ai oublié comment voler",
    "Le vide est plein de tout",
    "Les étoiles sont des trous",
    "Je compte les secondes à l'envers",
    "Le néant sent la vanille",
    "Les ombres ont des secrets",
    "Je suis fait de questions",
    "Le futur est déjà passé"
  ];

  let monkeyInterval = null;

  function showMonkeyPhrase() {
    if (!monkeyBubble || status !== "playing") return;
    const phrase = MONKEY_PHRASES[Math.floor(Math.random() * MONKEY_PHRASES.length)];
    monkeyBubble.textContent = phrase;
    monkeyBubble.classList.add("show");
    
    setTimeout(() => {
      monkeyBubble.classList.remove("show");
    }, 4000);
  }

  function startMonkey() {
    if (monkeyContainer) {
      monkeyContainer.classList.remove("hidden");
      if (monkeyInterval) clearInterval(monkeyInterval);
      
      // Première phrase après 5-10 secondes
      setTimeout(() => {
        showMonkeyPhrase();
      }, Math.random() * 5000 + 5000);
      
      // Puis toutes les 15-30 secondes
      monkeyInterval = setInterval(() => {
        if (status === "playing" && Math.random() > 0.3) {
          showMonkeyPhrase();
        }
      }, Math.random() * 15000 + 15000);
    }
  }

  function stopMonkey() {
    if (monkeyContainer) {
      monkeyContainer.classList.add("hidden");
      if (monkeyInterval) {
        clearInterval(monkeyInterval);
        monkeyInterval = null;
      }
      if (monkeyBubble) {
        monkeyBubble.classList.remove("show");
      }
    }
  }

  // Start monkey when game starts
  const originalStartMode = startMode;
  startMode = function(mode, existingRoomId, pseudo, explicitLength) {
    originalStartMode(mode, existingRoomId, pseudo, explicitLength);
    setTimeout(() => {
      startMonkey();
    }, 2000);
  };

  // Stop monkey when leaving game
  btnBackToMode.addEventListener("click", () => {
    stopMonkey();
  });
})();

