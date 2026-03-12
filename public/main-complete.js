console.log('🚀 Starting Complete Coopdle...');

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, starting app...');
    
    // === VARIABLES GLOBALES ===
    let ws = null;
    let currentRoomId = null;
    let playerId = null;
    let currentMode = null;
    let gameState = {
        word: '',
        length: 0,
        attempts: 0,
        maxAttempts: 6,
        guesses: [],
        status: 'playing',
        currentPlayerId: null,
        players: [],
        revealedLetters: []
    };
    
    // Idle Game State
    let idleGame = {
        coins: 0,
        totalCoins: 0,
        clickPower: 1,
        autoRate: 0,
        upgrades: {
            clickLevel: 0,
            autoLevel: 0
        },
        costs: {
            click: 10,
            auto: 50,
            hint: 1000
        }
    };
    
    // Load idle game from localStorage
    const savedIdle = localStorage.getItem('coopdle-idle');
    if (savedIdle) {
        try {
            const parsed = JSON.parse(savedIdle);
            idleGame = { ...idleGame, ...parsed };
        } catch (e) {
            console.log('Could not load idle game data');
        }
    }
    
    // === ÉLÉMENTS DOM ===
    const elements = {
        // Screens
        screenTitle: document.getElementById("screen-title"),
        screenMode: document.getElementById("screen-mode"),
        screenGame: document.getElementById("screen-game"),
        
        // Navigation buttons
        btnPlay: document.getElementById("btn-play"),
        btnSolo: document.getElementById("btn-solo"),
        btnCoop: document.getElementById("btn-coop"),
        btnBackToTitle: document.getElementById("btn-back-to-title"),
        btnBackToMode: document.getElementById("btn-back-to-mode"),
        btnNewGame: document.getElementById("btn-new-game"),
        btnCopyRoomLink: document.getElementById("btn-copy-room-link"),
        btnJoinRoom: document.getElementById("btn-join-room"),
        
        // Mode selection
        inputPseudo: document.getElementById("input-pseudo"),
        inputRoomCode: document.getElementById("input-room-code"),
        selectLength: document.getElementById("select-length"),
        selectAvatar: document.getElementById("select-avatar"),
        selectNameColor: document.getElementById("select-name-color"),
        fieldRoomCode: document.getElementById("field-room-code"),
        modeButtonsMain: document.getElementById("mode-buttons-main"),
        modeButtonsJoin: document.getElementById("mode-buttons-join"),
        
        // Game UI
        gameContainer: document.querySelector(".game-container"),
        badgeMode: document.getElementById("badge-mode"),
        badgeRoom: document.getElementById("badge-room"),
        wordLength: document.getElementById("word-length"),
        attempts: document.getElementById("attempts"),
        maxAttempts: document.getElementById("max-attempts"),
        board: document.getElementById("board"),
        inputGuess: document.getElementById("input-guess"),
        btnSubmit: document.getElementById("btn-submit"),
        errorEl: document.getElementById("error"),
        infoEl: document.getElementById("info"),
        statusCurrentPlayer: document.getElementById("status-current-player"),
        
        // Chat
        chatPanel: document.getElementById("chat-panel"),
        chatMessages: document.getElementById("chat-messages"),
        inputChat: document.getElementById("input-chat"),
        btnSendChat: document.getElementById("btn-send-chat"),
        
        // Players
        participantsList: document.getElementById("participants-list"),
        
        // Idle Game
        idleCoins: document.getElementById("idle-coins"),
        idlePerClick: document.getElementById("idle-per-click"),
        idleAutoRate: document.getElementById("idle-auto-rate"),
        idleTotal: document.getElementById("idle-total"),
        btnFootClick: document.getElementById("btn-foot-click"),
        btnUpgradeClick: document.getElementById("btn-upgrade-click"),
        btnUpgradeAuto: document.getElementById("btn-upgrade-auto"),
        btnBuyHint: document.getElementById("btn-buy-hint"),
        costClick: document.getElementById("cost-click"),
        costAuto: document.getElementById("cost-auto"),
        costHint: document.getElementById("cost-hint")
    };
    
    console.log('📋 All required elements found, initializing...');
    
    // === FONCTIONS UTILITAIRES ===
    
    function saveIdleGame() {
        localStorage.setItem('coopdle-idle', JSON.stringify(idleGame));
    }
    
    function updateIdleUI() {
        if (elements.idleCoins) elements.idleCoins.textContent = Math.floor(idleGame.coins);
        if (elements.idlePerClick) elements.idlePerClick.textContent = idleGame.clickPower;
        if (elements.idleAutoRate) elements.idleAutoRate.textContent = idleGame.autoRate;
        if (elements.idleTotal) elements.idleTotal.textContent = Math.floor(idleGame.totalCoins);
        
        // Update costs
        if (elements.costClick) elements.costClick.textContent = idleGame.costs.click;
        if (elements.costAuto) elements.costAuto.textContent = idleGame.costs.auto;
        if (elements.costHint) elements.costHint.textContent = idleGame.costs.hint;
        
        // Update button states
        if (elements.btnUpgradeClick) {
            elements.btnUpgradeClick.disabled = idleGame.coins < idleGame.costs.click;
        }
        if (elements.btnUpgradeAuto) {
            elements.btnUpgradeAuto.disabled = idleGame.coins < idleGame.costs.auto;
        }
        if (elements.btnBuyHint) {
            elements.btnBuyHint.disabled = idleGame.coins < idleGame.costs.hint || gameState.status !== 'playing';
        }
    }
    
    function showCoinAnimation(x, y, amount) {
        const coinEl = document.createElement('div');
        coinEl.className = 'coin-animation';
        coinEl.textContent = `+${amount}`;
        coinEl.style.left = x + 'px';
        coinEl.style.top = y + 'px';
        document.body.appendChild(coinEl);
        
        setTimeout(() => {
            if (coinEl.parentNode) {
                coinEl.parentNode.removeChild(coinEl);
            }
        }, 1000);
    }
    
    function showScreen(targetScreen) {
        console.log('🔄 Changing screen to:', targetScreen?.id);
        
        // Cacher tous les écrans
        [elements.screenTitle, elements.screenMode, elements.screenGame].forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
            }
        });
        
        // Afficher l'écran cible
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            console.log('✅ Screen shown:', targetScreen.id);
        }
    }
    
    function showError(message) {
        if (elements.errorEl) {
            elements.errorEl.textContent = message;
            elements.errorEl.classList.remove('hidden');
            setTimeout(() => {
                elements.errorEl.classList.add('hidden');
            }, 3000);
        }
    }
    
    function showInfo(message) {
        if (elements.infoEl) {
            elements.infoEl.textContent = message;
            elements.infoEl.classList.remove('hidden');
            setTimeout(() => {
                elements.infoEl.classList.add('hidden');
            }, 3000);
        }
    }
    
    // === GESTION DU PLATEAU DE JEU ===
    
    function createBoard() {
        if (!elements.board) return;
        
        elements.board.innerHTML = '';
        elements.board.style.gridTemplateRows = `repeat(${gameState.maxAttempts}, 1fr)`;
        
        for (let row = 0; row < gameState.maxAttempts; row++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'board-row';
            rowEl.style.gridTemplateColumns = `repeat(${gameState.length}, 1fr)`;
            
            for (let col = 0; col < gameState.length; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                rowEl.appendChild(cell);
            }
            
            elements.board.appendChild(rowEl);
        }
    }
    
    function updateBoard() {
        if (!elements.board) return;
        
        // Clear all cells first
        const cells = elements.board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Fill in guesses
        gameState.guesses.forEach((guess, rowIndex) => {
            for (let col = 0; col < guess.guess.length; col++) {
                const cell = elements.board.querySelector(`[data-row="${rowIndex}"][data-col="${col}"]`);
                if (cell) {
                    cell.textContent = guess.guess[col].toUpperCase();
                    cell.classList.add(guess.feedback[col]);
                    cell.classList.add('pop');
                }
            }
        });
        
        // Show revealed letters
        if (gameState.revealedLetters) {
            gameState.revealedLetters.forEach((letter, index) => {
                if (letter) {
                    // Find empty cells in this column and mark them as revealed
                    for (let row = gameState.attempts; row < gameState.maxAttempts; row++) {
                        const cell = elements.board.querySelector(`[data-row="${row}"][data-col="${index}"]`);
                        if (cell && !cell.textContent) {
                            cell.textContent = letter.toUpperCase();
                            cell.classList.add('revealed');
                            break;
                        }
                    }
                }
            });
        }
    }
    
    // === GESTION DU CHAT ===
    
    function clearChat() {
        if (elements.chatMessages) {
            elements.chatMessages.innerHTML = '';
        }
    }
    
    function addChatMessage(from, pseudo, avatar, color, text, timestamp) {
        if (!elements.chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        
        const time = new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageEl.innerHTML = `
            <div class="chat-avatar">${avatar}</div>
            <div class="chat-content">
                <div class="chat-meta">
                    <span class="chat-author" style="color: ${color || '#e2e8f0'}">${pseudo}</span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-text">${text}</div>
            </div>
        `;
        
        elements.chatMessages.appendChild(messageEl);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
    
    function sendChatMessage() {
        if (!elements.inputChat || !ws) return;
        
        const text = elements.inputChat.value.trim();
        if (!text) return;
        
        ws.send(JSON.stringify({
            type: 'chat',
            text: text
        }));
        
        elements.inputChat.value = '';
    }
    
    // === GESTION DES JOUEURS ===
    
    function updatePlayersList() {
        if (!elements.participantsList) return;
        
        elements.participantsList.innerHTML = '';
        
        gameState.players.forEach(player => {
            const li = document.createElement('li');
            li.className = 'player-item';
            
            if (player.id === playerId) {
                li.classList.add('you');
            }
            if (player.id === gameState.currentPlayerId) {
                li.classList.add('current');
            }
            
            li.innerHTML = `
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-name" style="color: ${player.color || '#e2e8f0'}">${player.pseudo}</div>
            `;
            
            elements.participantsList.appendChild(li);
        });
    }
    
    // === WEBSOCKET ===
    
    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('🔗 WebSocket connected');
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };
        
        ws.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    function handleWebSocketMessage(data) {
        switch (data.type) {
            case 'joined':
                playerId = data.playerId;
                gameState.length = data.length;
                gameState.maxAttempts = data.maxAttempts;
                gameState.revealedLetters = data.revealedLetters || [];
                gameState.players = data.players || [];
                
                if (elements.wordLength) elements.wordLength.textContent = gameState.length;
                if (elements.maxAttempts) elements.maxAttempts.textContent = gameState.maxAttempts;
                
                createBoard();
                updatePlayersList();
                showInfo('Connecté à la partie !');
                break;
                
            case 'state':
                gameState.length = data.length;
                gameState.guesses = data.guesses || [];
                gameState.attempts = data.attempts || 0;
                gameState.maxAttempts = data.maxAttempts || 6;
                gameState.status = data.status || 'playing';
                gameState.currentPlayerId = data.currentPlayerId;
                gameState.players = data.players || [];
                gameState.revealedLetters = data.revealedLetters || [];
                
                if (elements.attempts) elements.attempts.textContent = gameState.attempts;
                if (elements.wordLength) elements.wordLength.textContent = gameState.length;
                
                updateBoard();
                updatePlayersList();
                updateCurrentPlayerStatus();
                break;
                
            case 'chat':
                addChatMessage(data.from, data.pseudo, data.avatar, data.color, data.text, data.ts);
                break;
                
            case 'reveal':
                showInfo(`Le mot était : ${data.word.toUpperCase()}`);
                break;
                
            case 'revealLetter':
                if (!gameState.revealedLetters) gameState.revealedLetters = [];
                gameState.revealedLetters[data.index] = data.letter;
                updateBoard();
                showInfo(`Lettre révélée : ${data.letter.toUpperCase()} à la position ${data.index + 1}`);
                break;
                
            case 'error':
                showError(data.message);
                break;
        }
    }
    
    function updateCurrentPlayerStatus() {
        if (!elements.statusCurrentPlayer) return;
        
        if (gameState.status !== 'playing') {
            elements.statusCurrentPlayer.textContent = gameState.status === 'won' ? '🎉 Partie gagnée !' : '😞 Partie perdue...';
            return;
        }
        
        const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
        if (currentPlayer) {
            if (currentPlayer.id === playerId) {
                elements.statusCurrentPlayer.textContent = '🎯 C\'est votre tour !';
            } else {
                elements.statusCurrentPlayer.textContent = `⏳ Tour de ${currentPlayer.pseudo}`;
            }
        } else {
            elements.statusCurrentPlayer.textContent = '';
        }
    }
    
    // === IDLE GAME ===
    
    function initIdleGame() {
        updateIdleUI();
        
        // Auto-clicker
        setInterval(() => {
            if (idleGame.autoRate > 0) {
                idleGame.coins += idleGame.autoRate;
                idleGame.totalCoins += idleGame.autoRate;
                updateIdleUI();
                saveIdleGame();
            }
        }, 1000);
        
        // Foot click handler
        if (elements.btnFootClick) {
            elements.btnFootClick.addEventListener('click', (e) => {
                const earned = idleGame.clickPower;
                idleGame.coins += earned;
                idleGame.totalCoins += earned;
                
                // Show animation
                const rect = elements.btnFootClick.getBoundingClientRect();
                showCoinAnimation(
                    rect.left + rect.width / 2,
                    rect.top,
                    earned
                );
                
                updateIdleUI();
                saveIdleGame();
            });
        }
        
        // Upgrade click power
        if (elements.btnUpgradeClick) {
            elements.btnUpgradeClick.addEventListener('click', () => {
                if (idleGame.coins >= idleGame.costs.click) {
                    idleGame.coins -= idleGame.costs.click;
                    idleGame.upgrades.clickLevel++;
                    idleGame.clickPower++;
                    idleGame.costs.click = Math.floor(idleGame.costs.click * 1.5);
                    updateIdleUI();
                    saveIdleGame();
                }
            });
        }
        
        // Upgrade auto-clicker
        if (elements.btnUpgradeAuto) {
            elements.btnUpgradeAuto.addEventListener('click', () => {
                if (idleGame.coins >= idleGame.costs.auto) {
                    idleGame.coins -= idleGame.costs.auto;
                    idleGame.upgrades.autoLevel++;
                    idleGame.autoRate++;
                    idleGame.costs.auto = Math.floor(idleGame.costs.auto * 2);
                    updateIdleUI();
                    saveIdleGame();
                }
            });
        }
        
        // Buy hint
        if (elements.btnBuyHint) {
            elements.btnBuyHint.addEventListener('click', () => {
                if (idleGame.coins >= idleGame.costs.hint && gameState.status === 'playing' && ws) {
                    idleGame.coins -= idleGame.costs.hint;
                    idleGame.costs.hint = Math.floor(idleGame.costs.hint * 1.2);
                    
                    ws.send(JSON.stringify({
                        type: 'shop',
                        item: 'letter'
                    }));
                    
                    updateIdleUI();
                    saveIdleGame();
                }
            });
        }
    }
    
    // === GESTION DU JEU ===
    
    function setupGameLayout(mode) {
        if (!elements.gameContainer || !elements.chatPanel) return;
        
        if (mode === 'solo') {
            // En mode solo, masquer le chat et ajuster le layout
            elements.chatPanel.style.display = 'none';
            elements.gameContainer.classList.add('solo-mode');
            if (elements.btnCopyRoomLink) elements.btnCopyRoomLink.classList.add('hidden');
        } else {
            // En mode coop, afficher le chat
            elements.chatPanel.style.display = 'flex';
            elements.gameContainer.classList.remove('solo-mode');
            if (elements.btnCopyRoomLink) elements.btnCopyRoomLink.classList.remove('hidden');
        }
    }
    
    function copyRoomLink() {
        if (!currentRoomId) return;
        
        const url = `${window.location.origin}${window.location.pathname}?room=${currentRoomId}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showInfo('Lien de la room copié !');
            }).catch(() => {
                fallbackCopyTextToClipboard(url);
            });
        } else {
            fallbackCopyTextToClipboard(url);
        }
    }
    
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showInfo('Lien de la room copié !');
        } catch (err) {
            showError('Impossible de copier le lien');
        }
        
        document.body.removeChild(textArea);
    }
    
    function submitGuess() {
        if (!elements.inputGuess || !ws) return;
        
        const guess = elements.inputGuess.value.trim().toLowerCase();
        if (!guess) return;
        
        if (guess.length !== gameState.length) {
            showError(`Le mot doit faire ${gameState.length} lettres`);
            return;
        }
        
        ws.send(JSON.stringify({
            type: 'guess',
            guess: guess
        }));
        
        elements.inputGuess.value = '';
    }
    
    function joinRoom(roomId, mode) {
        if (!ws || !elements.inputPseudo) return;
        
        const pseudo = elements.inputPseudo.value.trim() || 'Joueur';
        const desiredLength = parseInt(elements.selectLength?.value) || 0;
        const avatar = elements.selectAvatar?.value || 'random';
        const colorId = elements.selectNameColor?.value || 'random';
        
        currentRoomId = roomId;
        currentMode = mode;
        
        // Clear chat when joining a new room
        clearChat();
        
        ws.send(JSON.stringify({
            type: 'join',
            roomId: roomId,
            pseudo: pseudo,
            desiredLength: desiredLength === 0 ? undefined : desiredLength,
            avatar: avatar === 'random' ? undefined : avatar,
            colorId: colorId === 'random' ? undefined : colorId
        }));
        
        if (elements.badgeMode) elements.badgeMode.textContent = mode === 'solo' ? 'Mode Solo' : 'Mode Coop';
        if (elements.badgeRoom) elements.badgeRoom.textContent = `Room: ${roomId}`;
        
        setupGameLayout(mode);
        showScreen(elements.screenGame);
        
        // Update URL for coop mode
        if (mode === 'coop') {
            const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
            window.history.pushState({ roomId }, '', newUrl);
        }
    }
    
    function startNewGame() {
        if (!ws) return;
        
        ws.send(JSON.stringify({
            type: 'newGame'
        }));
    }
    
    // === INITIALISATION DES SELECTS ===
    
    function fillSelects() {
        // Avatar emojis
        const avatarEmojis = [
            "🦶", "🦄", "🐉", "🦖", "🦕", "🐙", "🦑", "🦈", "🐬", "🦭",
            "🐳", "🐋", "🐊", "🐍", "🦂", "🕷️", "🦇", "🦊", "🐺", "🐯",
            "🦁", "🐮", "🐷", "🐸", "🐵", "🦍", "🦧", "🐧", "🐦", "🦚",
            "🦜", "🦢", "🦩", "🐢", "🦋", "🐝", "🪲", "🪳", "🦀", "🦞",
            "🦐", "🐼", "🐱", "🐶", "🐰", "🦝", "🦓", "🦒", "🦘", "🦥",
            "🦦", "🦨", "🐲", "👾", "🤖", "👻", "💀", "🎃", "😺", "😈"
        ];
        
        if (elements.selectAvatar) {
            avatarEmojis.forEach(emoji => {
                const option = document.createElement('option');
                option.value = emoji;
                option.textContent = emoji;
                elements.selectAvatar.appendChild(option);
            });
        }
        
        // Name colors
        const nameColors = {
            violet: "Violet",
            indigo: "Indigo", 
            cyan: "Cyan",
            emerald: "Émeraude",
            lime: "Citron vert",
            amber: "Ambre",
            orange: "Orange",
            rose: "Rose",
            fuchsia: "Fuchsia",
            red: "Rouge",
            blue: "Bleu",
            teal: "Sarcelle"
        };
        
        if (elements.selectNameColor) {
            Object.entries(nameColors).forEach(([key, label]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = label;
                elements.selectNameColor.appendChild(option);
            });
        }
    }
    
    // === INITIALISATION DES URL PARAMS ===
    
    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        
        if (roomParam) {
            // Si on a un paramètre room, pré-remplir le code et montrer l'interface de join
            if (elements.inputRoomCode) {
                elements.inputRoomCode.value = roomParam;
            }
            if (elements.fieldRoomCode) {
                elements.fieldRoomCode.style.display = 'block';
            }
            if (elements.modeButtonsMain) {
                elements.modeButtonsMain.classList.add('hidden');
            }
            if (elements.modeButtonsJoin) {
                elements.modeButtonsJoin.classList.remove('hidden');
            }
            
            // Aller directement à l'écran de mode
            showScreen(elements.screenMode);
            return true;
        }
        return false;
    }
    
    // === EVENT LISTENERS ===
    
    function setupEventListeners() {
        // Navigation
        if (elements.btnPlay) {
            elements.btnPlay.addEventListener('click', () => {
                showScreen(elements.screenMode);
            });
        }
        
        if (elements.btnBackToTitle) {
            elements.btnBackToTitle.addEventListener('click', () => {
                // Reset URL when going back to title
                window.history.pushState({}, '', window.location.pathname);
                showScreen(elements.screenTitle);
            });
        }
        
        if (elements.btnBackToMode) {
            elements.btnBackToMode.addEventListener('click', () => {
                showScreen(elements.screenMode);
            });
        }
        
        // Copy room link
        if (elements.btnCopyRoomLink) {
            elements.btnCopyRoomLink.addEventListener('click', copyRoomLink);
        }
        
        // Mode selection
        if (elements.btnSolo) {
            elements.btnSolo.addEventListener('click', () => {
                const roomId = 'solo-' + Math.random().toString(36).slice(2, 8);
                joinRoom(roomId, 'solo');
            });
        }
        
        if (elements.btnCoop) {
            elements.btnCoop.addEventListener('click', () => {
                const roomId = 'coop-' + Math.random().toString(36).slice(2, 8);
                joinRoom(roomId, 'coop');
            });
        }
        
        if (elements.btnJoinRoom) {
            elements.btnJoinRoom.addEventListener('click', () => {
                const roomCode = elements.inputRoomCode?.value.trim();
                if (!roomCode) {
                    showError('Veuillez entrer un code de room');
                    return;
                }
                joinRoom(roomCode, 'coop');
            });
        }
        
        // Game actions
        if (elements.btnSubmit) {
            elements.btnSubmit.addEventListener('click', submitGuess);
        }
        
        if (elements.inputGuess) {
            elements.inputGuess.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitGuess();
                }
            });
        }
        
        if (elements.btnNewGame) {
            elements.btnNewGame.addEventListener('click', startNewGame);
        }
        
        // Chat
        if (elements.btnSendChat) {
            elements.btnSendChat.addEventListener('click', sendChatMessage);
        }
        
        if (elements.inputChat) {
            elements.inputChat.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
        
        console.log('✅ Event listeners setup complete');
    }
    
    // === INITIALISATION PRINCIPALE ===
    
    function initApp() {
        console.log('🎮 All elements found, setting up app...');
        
        setupEventListeners();
        fillSelects();
        initIdleGame();
        connectWebSocket();
        
        // Check URL params first
        if (!checkUrlParams()) {
            // Show title screen only if no URL params
            showScreen(elements.screenTitle);
        }
        
        console.log('🎉 App initialization complete!');
    }
    
    // Démarrer l'application
    initApp();
});

console.log('📜 Complete script loaded successfully');