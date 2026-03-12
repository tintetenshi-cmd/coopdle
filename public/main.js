console.log('🚀 Starting Coopdle...');

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded');
    
    // Forcer l'affichage immédiatement
    document.body.style.display = 'flex';
    document.body.style.minHeight = '100vh';
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'flex';
        app.style.width = '100%';
        app.style.height = '100vh';
        console.log('✅ App container styled');
    }
    
    const titleScreen = document.getElementById('screen-title');
    if (titleScreen) {
        titleScreen.style.display = 'flex';
        titleScreen.style.position = 'absolute';
        titleScreen.style.width = '100%';
        titleScreen.style.height = '100%';
        titleScreen.style.alignItems = 'center';
        titleScreen.style.justifyContent = 'center';
        titleScreen.clasove('hidden');
        console.log('✅ Title screen forced visible');
    }
    
    // Variables globales simplifiées
    let ws = null;
    let currentRoomId = null;
    let playerId = null;
    let currentMode = null;
    let currentRoomFromUrl = null;
    
    // Récupérer les éléments
    const elements = {
        screenTitle: document.getElementById("screen-title"),
        screenMode: do"),
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
        inputChat: document.getElementById("input-chat"),
        btnSendChat: document.getElementById("btn-send-chat"),
        chatMessagesEl: document.getElementById("chat-messages")
    };
    
    console.log('📋 Elements found:', Object.keys(elements).filter(key => elements[key]).length);
    
    // Fonction pour changer d'écran
    function showScreen(targetScreen) {
        console.log('🔄 Changing screen to:', targetScreen?.id);
        
        // Cacher tous les écrans
        [elements.screenTitle, elements.screenMode, elements.screenGame].forEach(screen => {
            if (screen) {
                screen.style.display = 'none';
                screen.classList.add('hidden');
            }
        });
        
        // Afficher l'écran cible
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            targetScreen.style.position = 'absolute';
            targetScreen.style.width = '100%';
            targetScreen.style.height = '100%';
            targetScreen.style.alignItems = 'center';
            targetScreen.style.justifyContent = 'center';
            targetScreen.classList.remove('hidden');
            console.log('✅ Screen shown:', targetScreen.id);
        }
    }
    
    // Fonction pour afficher les messages
    function showError(text) {
        console.error('❌ Error:', text);
        if (elements.errorEl) {
            elements.errorEl.textContent = text;
            elements.errorEl.style.display = 'block';
            elements.errorEl.classList.remove('hidden');
        }
        alert('Erreur: ' + text); // Fallback
    }
    
    function showInfo(text) {
        console.log('ℹ️ Info:', text);
        if (elements.infoEl) {
            elements.infoEl.textContent = text;
            elements.infoEl.style.display = 'block';
            elements.infoEl.classList.remove('hidden');
        }
    }
    
    function clearMessages() {
        if (elements.errorEl) {
            elements.errorEl.style.display = 'none';
            elements.errorEl.classList.add('hidden');
        }
        if (elements.infoEl) {
            elements.infoEl.style.display = 'none';
            elements.infoEl.classList.add('hidden');
        }
    }
    
    // Remplir les sélecteurs
    function fillSelects() {
        const avatars = ["🦶", "🦄", "🐉", "🦖", "🐵", "🎮", "🚀", "⭐", "🔥", "💎"];
        const colors = [
            { id: "violet", label: "Violet" },
            { id: "blue", label: "Bleu" },
            { id: "green", label: "Vert" },
            { id: "red", label: "Rouge" },
            { id: "orange", label: "Orange" }
        ];
        
        if (elements.selectAvatar) {
            avatars.forEach(emoji => {
                const opt = document.createElement("option");
                opt.value = emoji;
                opt.textContent = `${emoji} ${emoji}`;
                elements.selectAvatar.appendChild(opt);
            });
        }
        
        if (elements.selectNameColor) {
            colors.forEach(color => {
                const opt = document.createElement("option");
                opt.value = color.id;
                opt.textContent = color.label;
                elements.selectNameColor.appendChild(opt);
            });
        }
        
        console.log('✅ Selects filled');
    }
    
    // WebSocket simplifié
    function connectWebSocket(roomId, pseudo, desiredLength) {
        console.log('🔌 Connecting WebSocket...', roomId);
        
        try {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }

            const protocol = w" : "ws:";
            const host = window.location.host || "localhost:3000";
            const wsUrl = `${protocol}//${host}`;
            
            console.log('🔗 WebSocket URL:', wsUrl);
            ws = new WebSocket(wsUrl);

            ws.addEventListener("open", () => {
                console.log('✅ WebSocket connected');
                ws.send(JSON.stringify({
                    type: "join",
                    roomId,
                    pseudo,
                    desiredLength,
          avatar: elements.selectAvatar?.value || "🎮",
                    colorId: elements.selectNameColor?.value || "blue"
                }));
                clearMessages();
                showInfo('Connexion établie !');
            });

            ws.addEventListener("message", (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    console.log('📨 WebSocket message:', msg.type);
                    
                    if (msg.t) {
                        playerId = msg.playerId;
                        currentRoomId = msg.roomId;
                        
                        if (elements.wordLengthSpan) elements.wordLengthSpan.textContent = msg.length || "5";
                        if (elements.maxAttemptsSpan) elements.maxAttemptsSpan.textContent = msg.maxAttempts || "6";
                        if (elements.attemptsSpan) elements.attemptsSpan.textContent = "0";
                        
       té à la room ${currentRoomId} !`);
                        console.log('✅ Game joined successfully');
                        
                    } else if (msg.type === "error") {
                        showError(msg.message || "Erreur du serveur");
                    } else if (msg.type === "reveal") {
                        showInfo(`Le mot était : ${msg.word?.toUpperCase()}`);
                    }
                } catch (error) {
                    consolr);
                }
            });

            ws.addEventListener("close", () => {
                console.log('🔌 WebSocket disconnected');
                showInfo("Connexion fermée. Rafraîchissez pour reconnecter.");
            });

            ws.addEventListener("error", (error) => {
                console.error('❌ WebSocket error:', error);
                showError("Erreur de connexion WebSocket");
            });

        } catch (error) {
       led:', error);
            showError('Impossible de se connecter au serveur');
        }
    }
    
    // Fonction de démarrage du jeu
    function startMode(mode, existingRoomId, pseudo, explicitLength) {
        console.log('🎯 Starting mode:', mode);
        
        try {
            currentMode = mode;
            if (elements.badgeMode) {
                elements.badgeMode.textContent = mode === "solo" ? "Mode Solo" : "Mode Coop";
            }
            
        }-${Math.random().toString(36).slice(2, 8)}`;
            if (elements.badgeRoom) {
                elements.badgeRoom.textContent = `Room: ${currentRoomId}`;
            }
            
            clearMessages();
            showScreen(elements.screenGame);
            
            // Connecter WebSocket
            connectWebSocket(currentRoomId, pseudo || "Joueur", explicitLength);
            
            console.log('✅ Mode started successfully');
            
        } catch (error) {
           error('❌ Start mode error:', error);
            showError('Erreur lors du démarrage du jeu');
        }
    }
    
    // Event listeners
    function setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        if (elements.btnPlay) {
            elements.btnPlay.addEventListener("click", () => {
                console.log('🎮 Play button clicked');
                showScreen(elements.screenMode);
            });
        }

        if (elements.btnBackToTitle) {
            elements.btnBackToTitle.addEventListener("click", () => {
                console.log('⬅️ Back to title');
                showScreen(elements.screenTitle);
            });
        }

        if (elements.btnBackToMode) {
            elements.btnBackToMode.addEventListener("click", () => {
                console.log('⬅️ Back to mode');
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                showScreen(elements.screenMode);
            });
        }

        if (elements.btnSolo) {
            elements.btnSolo.addEventListener("click", () => {
                console.log('🎯 Solo mode selected');
                const pseudo = elements.inputPseudo?.value?.trim() || "Solo";
                startMode("solo", null, pseudo, null);
            });
        }

        if (elements.btnCoop) {
            elements.btnCoop.addEventListener("click", () => {
                console.log('👥 Coop mode selected');
                const pseudtPseudo?.value?.trim();
                if (!pseudo) {
                    showError("Entrez un pseudo pour créer une room coop !");
                    return;
                }
                const rawLen = parseInt(elements.selectLength?.value || "0", 10);
                const explicitLength = rawLen > 0 ? rawLen : null;
                startMode("coop", null, pseudo, explicitLength);
            });
        }

        if (elements.btnSubmit) {
            elements.btnSubmit.addEventListener("click", () => {
                const guess = elements.inputGuess?.value?.trim();
                if (!guess) return;
                
                console.log('📝 Submitting guess:', guess);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "guess", guess }));
                    elements.inputGuess.value = "";
                } else {
                    showError("Pas de connexion au serveur");
                }
            });
        }

        if (elements.inputGuess) {
            elements.inputGuess.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    elements.btnSubmit?.click();
                }
            });
        }

        if (elements.btnNewGame) {
            elements.btnNewGame.addEventListener("click", () => {
                console.log('🔄 New game requested');
                if (ws && ws.readyState === WebSocket.OPEN) {
             gify({ type: "newGame" }));
                } else {
                    showError("Pas de connexion au serveur");
                }
            });
        }
        
        console.log('✅ Event listeners setup complete');
    }
    
    // Initialisation depuis l'URL
    function initFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const room = params.get("room");
        if (room) {
            console.log('🔗 Room from URL:', room);
            currentRoomFromUrl = room;
            if (elements.modeTitle) elements.modeTitle.textContent = "Rejoindre une room coop";
            if (elements.modeDescription) elements.modeDescription.textContent = "Entrez votre pseudo pour rejoindre la room.";
            if (elements.fieldLength) elements.fieldLength.style.display = 'none';
            if (elements.modeButtonsMain) elements.modeButtonsMain.style.display = 'none';
            if (elements.modeButtonsJoin) {
                elements.modeButtonsJoin.style.display = 'flex';
                elements.modeButtonsJoin.classList.remove('hidden');
            }
            showScreen(elements.screenMode);
        }
    }
    
    // Initialisation principale
    try {
        console.log('🚀 Initializing app...');
        
        setupEventListeners();
        fillSelects();
        initFromUrl();
        
        if (!currentRoomFromUrl) {
            showScreen(elements.screenTitle);
        }
        
        console.log('🎉 App initialization complete!');
        
        // Test d'affichage après 1 seconde
        setTimeout(() => {
            console.log('🔍 Final display check...');
            console.log('Title screen display:', elements.screenTitle?.style.display);
            console.log('Title screen classes:', elements.screenTitle?.className);
            console.log('Body background:', window.getComputedStyle(document.body).background);
            
            // Force finale si nécessaire
            if (elements.screenTitle && !currentRoomFromUrl) {
                elements.screenTitle.style.display = 'flex';
                elements.screenTitle.style.visibility = 'visible';
                elements.screenTitle.style.opacity = '1';
                console.log('🔧 Final force applied to title screen');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Critical initialization error:', error);
        document.body.innerHTML = `
            <div style=hite; font-family: Arial; text-align: center; padding: 20px;">
                <div>
                    <h1>🚨 Erreur de Chargement</h1>
                    <p>Une erreur s'est produite lors du chargement de l'application.</p>
                    <p><strong>Erreur:</strong> ${error.message}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;">
         îchir la Page
                    </button>
                </div>
            </div>
        `;
    }
});

console.log('📜 Script loaded successfully');