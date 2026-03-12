// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, starting app...');
  
  // Vérifier que tous les éléments essentiels existent
  const requiredElements = [
    'screen-title', 'screen-mode', 'screen-game',
    'btn-play', 'btn-solo', 'btn-coop'
  ];
  
  for (const id of requiredElements) {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element manquant: ${id}`);
      return;
    }
  }
  
  console.log('All required elements found, initializing...');
  initializeApp();
});

function initializeApp() {
  try {
    // Variables globales
    let ws = null;
    let currentRoomId = null;
    let playerId = null;
    let currentMode = null;
    let length = null;
    let maxAttempts = 6;
    let guesses = [];
    let attempts = 0;
    let status = "playing";
    let currentPlayerId = null;
    let players = [];
    let currentRoomFromUrl = null;
    let revealedLetters = [];
    let previewGuess = "";
    let previewAuthorId = null;

    // Idle game state
    let idleSteps = 0;
    let idlePerClick = 1;
    let idleAutoRate = 0;
    let idleCostClick = 10;
    let idleCostAuto = 25;
    let idleCostLetter = 500;

    // Monkey state
    let monkeyInterval = null;

    // Récupérer tous les éléments DOM
    const elements = {
      screenTitle: document.getElementById("screen-title"),
      screenMode: document.getElementById("screen-mode"),
      screenGame: document.getElementById("screen-game"),
      btnPlay: document.getElementById("btn-play"),
      btnSolo: document.getElementById("btn-solo"),
      btnCoop: document.getElementById("btn-coop"),
      btnJoinRoom: document.getElementById("btn-join-room"),
      btnBackToTitle: document.getElementById("btn-back-to-title"),
      btnBackToMode: document.getElementById("btn-back-to-mode"),
      btnNewGame: document.getElementById("btn-new-game"),
      btnSubmit: document.getElementById("btn-submit"),
      btnCopyLink: document.getElementById("btn-copy-link"),
      badgeMode: document.getElementById("badge-mode"),
      badgeRoom: document.getElementById("badge-room"),
      modeTitle: document.getElementById("mode-title"),
      modeDescription: document.getElementById("mode-description"),
      modeButtonsMain: document.getElementById("mode-buttons-main"),
      modeButtonsJoin: document.getElementById("mode-buttons-join"),
      fieldLength: document.getElementById("field-length"),
      inputPseudo: document.getElementById("input-pseudo"),
      selectLength: document.getElementById("select-length"),
      selectAvatar: document.getElementById("select-avatar"),
      selectNameColor: document.getElementById("select-name-color"),
      wordLengthSpan: document.getElementById("word-length"),
      attemptsSpan: document.getElementById("attempts"),
      maxAttemptsSpan: document.getElementById("max-attempts"),
      boardEl: document.getElementById("board"),
      inputGuess: document.getElementById("input-guess"),
      errorEl: document.getElementById("error"),
      infoEl: document.getElementById("info"),
      statusCurrentPlayer: document.getElementById("status-current-player"),
      shareContainer: document.getElementById("share-container"),
      shareUrlEl: document.getElementById("share-url"),
      participantsList: document.getElementById("participants-list"),
      boardPanel: document.getElementById("board-panel"),
      screenGameEl: document.getElementById("screen-game"),
      btnFootClick: document.getElementById("btn-foot-click"),
      btnUpgradeClick: document.getElementById("btn-upgrade-click"),
      btnUpgradeAuto: document.getElementById("btn-upgrade-auto"),
      idleStepsEl: document.getElementById("idle-steps"),
      idlePerClickEl: document.getElementById("idle-per-click"),
      idleAutoRateEl: document.getElementById("idle-auto-rate"),
      idleCostClickEl: document.getElementById("cost-click"),
      idleCostAutoEl: document.getElementById("cost-auto"),
      idleCostLetterEl: document.getElementById("cost-letter"),
      inputChat: document.getElementById("input-chat"),
      btnSendChat: document.getElementById("btn-send-chat"),
      chatMessagesEl: document.getElementById("chat-messages"),
      monkeyContainer: document.getElementById("monkey-container"),
      monkeyBubble: document.getElementById("monkey-bubble")
    };

    // Vérifier que les éléments critiques existent
    const criticalElements = ['screenTitle', 'screenMode', 'screenGame', 'btnPlay'];
    for (const key of criticalElements) {
      if (!elements[key]) {
        console.error(`Element critique manquant: ${key}`);
        return;
      }
    }

    console.log('All elements found, setting up app...');

    // Constantes
    const AVATAR_EMOJIS = [
      "🦶", "🦄", "🐉", "🦖", "🦕", "🐙", "🦑", "🦈", "🐬", "🦭",
      "🐳", "🐋", "🐊", "🐍", "🦂", "🕷️", "🦇", "🦊", "🐺", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🦍", "🦧", "🐧", "🐦", "🦚",
      "🦜", "🦢", "🦩", "🐢", "🦋", "🐝", "🪲", "🪳", "🦀", "🦞",
      "🦐", "🐼", "🐱", "🐶", "🐰", "🦝", "🦓", "🦒", "🦘", "🦥",
      "🦦", "🦨", "🐲", "👾", "🤖", "👻", "💀", "🎃", "😺", "😈"
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

    // Fonctions utilitaires
    function showScreen(screen) {
      try {
        [elements.screenTitle, elements.screenMode, elements.screenGame].forEach((s) => {
          if (s) s.classList.add("hidden");
        });
        if (screen) screen.classList.remove("hidden");
      } catch (error) {
        console.error('Erreur showScreen:', error);
      }
    }

    function clearMessages() {
      try {
        if (elements.errorEl) {
          elements.errorEl.textContent = "";
          elements.errorEl.classList.add("hidden");
        }
        if (elements.infoEl) {
          elements.infoEl.textContent = "";
          elements.infoEl.classList.add("hidden");
        }
      } catch (error) {
        console.error('Erreur clearMessages:', error);
      }
    }

    function showError(text) {
      try {
        if (elements.errorEl) {
          elements.errorEl.textContent = text;
          elements.errorEl.classList.remove("hidden");
        }
      } catch (error) {
        console.error('Erreur showError:', error);
      }
    }

    function showInfo(text) {
      try {
        if (elements.infoEl) {
          elements.infoEl.textContent = text;
          elements.infoEl.classList.remove("hidden");
        }
      } catch (error) {
        console.error('Erreur showInfo:', error);
      }
    }

    // Initialiser les sélecteurs
    function fillAvatarAndColorSelects() {
      try {
        if (elements.selectAvatar && elements.selectAvatar.options.length <= 1) {
          AVATAR_EMOJIS.forEach((e) => {
            const opt = document.createElement("option");
            opt.value = e;
            opt.textContent = `${e} ${e}`;
            elements.selectAvatar.appendChild(opt);
          });
        }
        if (elements.selectNameColor && elements.selectNameColor.options.length <= 1) {
          NAME_COLORS.forEach((c) => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.label;
            elements.selectNameColor.appendChild(opt);
          });
        }
      } catch (error) {
        console.error('Erreur fillAvatarAndColorSelects:', error);
      }
    }

    // Fonction de démarrage simple
    function startMode(mode, existingRoomId, pseudo, explicitLength) {
      try {
        console.log('Starting mode:', mode);
        currentMode = mode;
        if (elements.badgeMode) {
          elements.badgeMode.textContent = mode === "solo" ? "Mode solo" : "Mode coop";
        }
        currentRoomId = existingRoomId || `${mode}-${Math.random().toString(36).slice(2, 8)}`;
        if (elements.badgeRoom) {
          elements.badgeRoom.textContent = `Room : ${currentRoomId}`;
        }
        
        clearMessages();
        showScreen(elements.screenGame);
        
        // Connecter WebSocket de manière sécurisée
        connectWebSocket(currentRoomId, pseudo || "Joueur", explicitLength);
      } catch (error) {
        console.error('Erreur startMode:', error);
        showError('Erreur lors du démarrage du jeu');
      }
    }

    // WebSocket sécurisé
    function connectWebSocket(roomId, pseudo, desiredLength) {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host || "localhost:3000";
        const wsUrl = `${protocol}//${host}`;
        
        console.log('Connecting to:', wsUrl);
        ws = new WebSocket(wsUrl);

        ws.addEventListener("open", () => {
          console.log('WebSocket connected');
          const avatarValue = elements.selectAvatar?.value || "random";
          const colorId = elements.selectNameColor?.value || "random";
          ws.send(JSON.stringify({
            type: "join",
            roomId,
            pseudo,
            desiredLength,
            avatar: avatarValue,
            colorId
          }));
          clearMessages();
        });

        ws.addEventListener("message", (event) => {
          try {
            const msg = JSON.parse(event.data);
            console.log('WebSocket message:', msg.type);
            
            if (msg.type === "joined") {
              playerId = msg.playerId;
              currentRoomId = msg.roomId;
              length = msg.length;
              maxAttempts = msg.maxAttempts;
              players = msg.players || [];
              revealedLetters = msg.revealedLetters || Array(length).fill(null);
              
              if (elements.maxAttemptsSpan) elements.maxAttemptsSpan.textContent = maxAttempts.toString();
              if (elements.wordLengthSpan) elements.wordLengthSpan.textContent = length.toString();
              if (elements.attemptsSpan) elements.attemptsSpan.textContent = "0";
              
              guesses = [];
              attempts = 0;
              status = "playing";
              currentPlayerId = null;
              previewGuess = "";
              previewAuthorId = null;
              
              console.log('Game initialized successfully');
            } else if (msg.type === "error") {
              showError(msg.message || "Erreur.");
            }
          } catch (error) {
            console.error("Erreur parsing WebSocket:", error);
          }
        });

        ws.addEventListener("close", () => {
          console.log('WebSocket disconnected');
          showInfo("Connexion perdue avec le serveur. Rafraîchissez la page.");
        });

        ws.addEventListener("error", (error) => {
          console.error('WebSocket error:', error);
          showError("Erreur de connexion au serveur.");
        });

      } catch (error) {
        console.error('Erreur connectWebSocket:', error);
        showError('Impossible de se connecter au serveur');
      }
    }

    // Event listeners sécurisés
    function setupEventListeners() {
      try {
        if (elements.btnPlay) {
          elements.btnPlay.addEventListener("click", () => {
            console.log('Play button clicked');
            showScreen(elements.screenMode);
          });
        }

        if (elements.btnBackToTitle) {
          elements.btnBackToTitle.addEventListener("click", () => {
            console.log('Back to title clicked');
            showScreen(elements.screenTitle);
          });
        }

        if (elements.btnBackToMode) {
          elements.btnBackToMode.addEventListener("click", () => {
            console.log('Back to mode clicked');
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.close();
            }
            showScreen(elements.screenMode);
          });
        }

        if (elements.btnSolo) {
          elements.btnSolo.addEventListener("click", () => {
            console.log('Solo button clicked');
            const pseudo = elements.inputPseudo?.value?.trim() || "Solo";
            startMode("solo", null, pseudo, null);
          });
        }

        if (elements.btnCoop) {
          elements.btnCoop.addEventListener("click", () => {
            console.log('Coop button clicked');
            const pseudo = elements.inputPseudo?.value?.trim();
            if (!pseudo) {
              showError("Choisissez un pseudo avant de créer une room.");
              return;
            }
            const rawLen = parseInt(elements.selectLength?.value || "0", 10);
            const explicitLength = Number.isFinite(rawLen) && rawLen > 0 ? rawLen : null;
            startMode("coop", null, pseudo, explicitLength);
          });
        }

        console.log('Event listeners setup complete');
      } catch (error) {
        console.error('Erreur setupEventListeners:', error);
      }
    }

    // Initialisation URL
    function initFromUrl() {
      try {
        const params = new URLSearchParams(window.location.search);
        const room = params.get("room");
        if (room) {
          currentRoomFromUrl = room;
          if (elements.modeTitle) elements.modeTitle.textContent = "Rejoindre une room coop";
          if (elements.modeDescription) elements.modeDescription.textContent = "Entrez votre pseudo pour rejoindre la room existante.";
          if (elements.fieldLength) elements.fieldLength.classList.add("hidden");
          if (elements.modeButtonsMain) elements.modeButtonsMain.classList.add("hidden");
          if (elements.modeButtonsJoin) elements.modeButtonsJoin.classList.remove("hidden");
          showScreen(elements.screenMode);
        }
      } catch (error) {
        console.error('Erreur initFromUrl:', error);
      }
    }

    // Démarrage de l'application
    try {
      console.log('Setting up event listeners...');
      setupEventListeners();
      
      console.log('Filling selects...');
      fillAvatarAndColorSelects();
      
      console.log('Initializing from URL...');
      initFromUrl();
      
      if (!currentRoomFromUrl) {
        console.log('Showing title screen...');
        showScreen(elements.screenTitle);
        
        // Debug CSS
        setTimeout(() => {
          console.log('=== DEBUG CSS ===');
          console.log('Title screen element:', elements.screenTitle);
          console.log('Title screen classes:', elements.screenTitle?.className);
          console.log('Title screen computed style display:', window.getComputedStyle(elements.screenTitle).display);
          console.log('Title screen computed style opacity:', window.getComputedStyle(elements.screenTitle).opacity);
          console.log('Title screen computed style visibility:', window.getComputedStyle(elements.screenTitle).visibility);
          console.log('App div:', document.getElementById('app'));
          console.log('Body style:', document.body.style.cssText);
        }, 100);
      }
      
      console.log('App initialization complete!');
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      // Afficher au moins la page d'accueil en cas d'erreur
      if (elements.screenTitle) {
        showScreen(elements.screenTitle);
      }
    }

  } catch (error) {
    console.error('Erreur critique dans initializeApp:', error);
    // En dernier recours, afficher un message d'erreur
    document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Erreur de chargement</h1><p>Veuillez rafraîchir la page.</p><p>Erreur: ' + error.message + '</p></div>';
  }
}