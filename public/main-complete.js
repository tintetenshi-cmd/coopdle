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
    
    // Gacha System State
    let gachaSystem = {
        money: 1000, // Start with some money
        inventory: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
            mythic: 0,
            exotic: 0,
            radiant: 0
        },
        totalItems: 0,
        hintCost: 1000,
        lastDailyBonus: 0 // Timestamp for daily bonus
    };
    
    // Gacha rarities configuration
    const gachaRarities = {
        common: { 
            probability: 30, 
            color: '#808080', 
            price: 1, 
            icon: '⚪', 
            variants: ['Épée Commune', 'Bouclier Basique', 'Casque Simple', 'Gants Usés', 'Bottes Trouées', 'Cape Déchirée', 'Anneau Terne', 'Collier Cassé', 'Bracelet Rouillé', 'Ceinture Usagée']
        },
        uncommon: { 
            probability: 25, 
            color: '#00FF00', 
            price: 3, 
            icon: '🟢', 
            variants: ['Épée Verte', 'Bouclier Renforcé', 'Casque Brillant', 'Gants Solides', 'Bottes Neuves', 'Cape Verte', 'Anneau Vert', 'Collier Solide']
        },
        rare: { 
            probability: 18, 
            color: '#0080FF', 
            price: 10, 
            icon: '🔵', 
            variants: ['Épée Bleue', 'Bouclier Magique', 'Casque Enchanté', 'Gants Magiques', 'Bottes Rapides', 'Cape Bleue']
        },
        epic: { 
            probability: 12, 
            color: '#AA00FF', 
            price: 50, 
            icon: '🟣', 
            variants: ['Épée Violette', 'Bouclier Épique', 'Casque Royal', 'Gants Épiques', 'Bottes Volantes']
        },
        legendary: { 
            probability: 7, 
            color: '#FFAA00', 
            price: 100, 
            icon: '🟠', 
            variants: ['Épée Légendaire', 'Bouclier Doré', 'Casque Divin', 'Gants Dorés']
        },
        mythic: { 
            probability: 4, 
            color: '#FF0000', 
            price: 250, 
            icon: '🔴', 
            variants: ['Épée Mythique', 'Bouclier Sanglant', 'Casque Démoniaque']
        },
        exotic: { 
            probability: 2.5, 
            color: 'linear-gradient(to right, #0080FF, #00FF00)', 
            price: 500, 
            icon: '🌈', 
            variants: ['Épée Arc-en-ciel', 'Bouclier Prismatique']
        },
        radiant: { 
            probability: 1.5, 
            color: 'linear-gradient(to right, #AA00FF, #FF0000)', 
            price: 1000, 
            icon: '✨', 
            variants: ['Épée Radieuse', 'Bouclier Cosmique']
        }
    };
    
    // Load gacha system from localStorage
    const savedGacha = localStorage.getItem('coopdle-gacha');
    if (savedGacha) {
        try {
            const parsed = JSON.parse(savedGacha);
            gachaSystem = { ...gachaSystem, ...parsed };
        } catch (e) {
            console.log('Could not load gacha system data');
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
        fieldLength: document.getElementById("field-length"),
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
        // Game result elements
        gameResult: document.getElementById("game-result"),
        gameResultIntegrated: document.getElementById("game-result-integrated"),
        resultIcon: document.getElementById("result-icon"),
        resultIconIntegrated: document.getElementById("result-icon-integrated"),
        resultText: document.getElementById("result-text"),
        resultTextIntegrated: document.getElementById("result-text-integrated"),
        btnNewGameHighlight: document.getElementById("btn-new-game-highlight"),
        btnNewGameIntegrated: document.getElementById("btn-new-game-integrated"),
        
        // Chat
        chatPanel: document.getElementById("chat-panel"),
        chatMessages: document.getElementById("chat-messages"),
        inputChat: document.getElementById("input-chat"),
        btnSendChat: document.getElementById("btn-send-chat"),
        
        // Players
        participantsList: document.getElementById("participants-list"),
        
        // Gacha System
        gachaMoney: document.getElementById("gacha-money"),
        gachaTotalItems: document.getElementById("gacha-total-items"),
        btnOpenCase: document.getElementById("btn-open-case"),
        btnBuyHint: document.getElementById("btn-buy-hint"),
        hintCost: document.getElementById("hint-cost"),
        btnShowInventory: document.getElementById("btn-show-inventory"),
        
        // Gacha Modal
        gachaModal: document.getElementById("gacha-modal"),
        gachaClose: document.getElementById("gacha-close"),
        gachaOpeningBar: document.getElementById("gacha-opening-bar"),
        gachaResult: document.getElementById("gacha-result"),
        gachaResultItem: document.getElementById("gacha-result-item"),
        gachaSellItem: document.getElementById("gacha-sell-item"),
        
        // Inventory Modal
        inventoryModal: document.getElementById("inventory-modal"),
        inventoryClose: document.getElementById("inventory-close"),
        inventoryMoney: document.getElementById("inventory-money"),
        inventoryTotal: document.getElementById("inventory-total"),
        inventoryGrid: document.getElementById("inventory-grid"),
        
        // Drop Rates Modal
        btnDropRates: document.getElementById("btn-drop-rates"),
        dropRatesModal: document.getElementById("drop-rates-modal"),
        dropRatesClose: document.getElementById("drop-rates-close"),
        dropRatesChart: document.getElementById("drop-rates-chart"),
        dropRatesTableBody: document.getElementById("drop-rates-table-body"),
        
        // Cementix elements
        cementixPanel: document.getElementById("cementix-panel"),
        cementixInput: document.getElementById("cementix-input"),
        cementixSubmit: document.getElementById("cementix-submit"),
        cementixAttempts: document.getElementById("cementix-attempts"),
        
        // Alphabet elements
        alphabetGrid: document.getElementById("alphabet-grid")
    };
    
    // Cementix state
    let cementixAttempts = [];
    let alphabetState = {};
    
    console.log('📋 All required elements found, initializing...');
    
    // === MESSAGES DE BIENVENUE ===
    
    const welcomeMessages = [
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
    
    function getRandomWelcomeMessage() {
        return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    }
    
    function addSystemMessage(text, timestamp) {
        if (!elements.chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message welcome-message';
        
        const time = new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageEl.innerHTML = `
            <div class="chat-avatar">🔥</div>
            <div class="chat-content">
                <div class="chat-meta">
                    <span class="chat-author system-author">🔥 Système</span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-text welcome-text">${text} 🔥</div>
            </div>
        `;
        
        elements.chatMessages.appendChild(messageEl);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
    
    function addWelcomeMessage(pseudo, avatar, color) {
        if (!elements.chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message welcome-message';
        
        const time = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const welcomePhrase = getRandomWelcomeMessage();
        
        messageEl.innerHTML = `
            <div class="chat-avatar">${avatar}</div>
            <div class="chat-content">
                <div class="chat-meta">
                    <span class="chat-author system-author">🔥 Système</span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-text welcome-text">
                    <span class="player-name" style="color: ${color || '#e2e8f0'}">${pseudo}</span> a rejoint la partie ! ${welcomePhrase} 🔥
                </div>
            </div>
        `;
        
        elements.chatMessages.appendChild(messageEl);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
    
    // === FONCTIONS UTILITAIRES ===
    
    // === GACHA SYSTEM FUNCTIONS ===
    
    function saveGachaSystem() {
        localStorage.setItem('coopdle-gacha', JSON.stringify(gachaSystem));
    }
    
    function updateGachaUI() {
        if (elements.gachaMoney) elements.gachaMoney.textContent = Math.floor(gachaSystem.money);
        if (elements.gachaTotalItems) elements.gachaTotalItems.textContent = gachaSystem.totalItems;
        if (elements.inventoryMoney) elements.inventoryMoney.textContent = Math.floor(gachaSystem.money);
        if (elements.inventoryTotal) elements.inventoryTotal.textContent = gachaSystem.totalItems;
        
        // Update hint cost display
        if (elements.hintCost) elements.hintCost.textContent = gachaSystem.hintCost;
        
        // Update hint button state and appearance
        if (elements.btnBuyHint) {
            const canAfford = gachaSystem.money >= gachaSystem.hintCost;
            const canUse = gameState.status === 'playing';
            const isEnabled = canAfford && canUse;
            
            elements.btnBuyHint.disabled = !isEnabled;
            
            // Visual feedback for affordability
            if (!canAfford) {
                elements.btnBuyHint.style.opacity = '0.5';
                elements.btnBuyHint.style.cursor = 'not-allowed';
                elements.btnBuyHint.title = `Pas assez d'argent (${Math.floor(gachaSystem.money)}$ / ${gachaSystem.hintCost}$)`;
            } else if (!canUse) {
                elements.btnBuyHint.style.opacity = '0.7';
                elements.btnBuyHint.style.cursor = 'not-allowed';
                elements.btnBuyHint.title = 'Disponible uniquement pendant une partie';
            } else {
                elements.btnBuyHint.style.opacity = '1';
                elements.btnBuyHint.style.cursor = 'pointer';
                elements.btnBuyHint.title = `Acheter un indice pour ${gachaSystem.hintCost}$`;
            }
        }
    }
    
    function getRandomItem() {
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const [rarity, config] of Object.entries(gachaRarities)) {
            cumulative += config.probability;
            if (random <= cumulative) {
                const variantIndex = Math.floor(Math.random() * config.variants.length);
                return {
                    rarity: rarity,
                    name: config.variants[variantIndex],
                    icon: config.icon,
                    color: config.color,
                    price: config.price
                };
            }
        }
        
        // Fallback to common
        return {
            rarity: 'common',
            name: gachaRarities.common.variants[0],
            icon: gachaRarities.common.icon,
            color: gachaRarities.common.color,
            price: gachaRarities.common.price
        };
    }
    
    function generateGachaItems(count = 25) {
        const items = [];
        for (let i = 0; i < count; i++) {
            items.push(getRandomItem());
        }
        return items;
    }
    
    function createGachaItemElement(item, isWinning = false) {
        const itemEl = document.createElement('div');
        itemEl.className = `gacha-item rarity-${item.rarity}`;
        if (isWinning) itemEl.classList.add('winning');
        
        itemEl.innerHTML = `
            <div class="gacha-item-icon">${item.icon}</div>
            <div class="gacha-item-name">${item.name}</div>
            <div class="gacha-item-rarity">${item.rarity}</div>
        `;
        
        // Apply color to the item name and rarity
        const nameEl = itemEl.querySelector('.gacha-item-name');
        const rarityEl = itemEl.querySelector('.gacha-item-rarity');
        
        if (item.color.includes('gradient')) {
            // For gradient colors (Exotic and Radiant)
            nameEl.style.background = item.color;
            nameEl.style.webkitBackgroundClip = 'text';
            nameEl.style.webkitTextFillColor = 'transparent';
            nameEl.style.backgroundClip = 'text';
            
            rarityEl.style.background = item.color;
            rarityEl.style.webkitBackgroundClip = 'text';
            rarityEl.style.webkitTextFillColor = 'transparent';
            rarityEl.style.backgroundClip = 'text';
        } else {
            // For solid colors
            nameEl.style.color = item.color;
            rarityEl.style.color = item.color;
        }
        
        return itemEl;
    }
    
    function playGachaAnimation(items, winningIndex) {
        return new Promise((resolve) => {
            const bar = elements.gachaOpeningBar;
            const container = bar.parentElement;
            bar.innerHTML = '';
            
            // Create items
            items.forEach((item, index) => {
                const itemEl = createGachaItemElement(item, index === winningIndex);
                bar.appendChild(itemEl);
            });
            
            // Calculate positions more accurately
            let itemWidth = 100; // 90px + 10px gap (desktop)
            
            // Adjust for mobile
            if (window.innerWidth <= 600) {
                itemWidth = 70; // 60px + 10px gap (mobile)
            } else if (window.innerWidth <= 400) {
                itemWidth = 60; // 50px + 10px gap (très petit mobile)
            }
            
            const containerWidth = container.offsetWidth;
            const containerCenter = containerWidth / 2;
            
            // Position the bar so the winning item will be centered under the selector
            const startPosition = containerCenter + (items.length * itemWidth / 2);
            const endPosition = containerCenter - (winningIndex * itemWidth) - (itemWidth / 2);
            
            bar.style.transform = `translateX(${startPosition}px)`;
            bar.style.transition = 'none';
            
            // Play tick sounds during animation
            let tickInterval;
            const playTick = () => {
                // Simple tick sound using Web Audio API
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                } catch (e) {
                    // Fallback: no sound
                }
            };
            
            tickInterval = setInterval(playTick, 100);
            
            setTimeout(() => {
                bar.style.transition = 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                bar.style.transform = `translateX(${endPosition}px)`;
                
                setTimeout(() => {
                    clearInterval(tickInterval);
                    
                    // Play winning sound
                    try {
                        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
                        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
                        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
                        
                        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.5);
                    } catch (e) {
                        // Fallback: no sound
                    }
                    
                    resolve(items[winningIndex]);
                }, 4000);
            }, 100);
        });
    }
    
    function showGachaResult(item) {
        const resultItem = elements.gachaResultItem;
        const resultIcon = resultItem.querySelector('.gacha-result-icon');
        const resultName = resultItem.querySelector('.gacha-result-name');
        const resultRarity = resultItem.querySelector('.gacha-result-rarity');
        const resultValue = resultItem.querySelector('.gacha-result-value');
        
        resultIcon.textContent = item.icon;
        resultIcon.style.color = item.color;
        resultName.textContent = item.name;
        resultRarity.textContent = item.rarity;
        
        // Apply color to both name and rarity
        if (item.color.includes('gradient')) {
            // For gradient colors (Exotic and Radiant)
            resultName.style.background = item.color;
            resultName.style.webkitBackgroundClip = 'text';
            resultName.style.webkitTextFillColor = 'transparent';
            resultName.style.backgroundClip = 'text';
            resultName.style.color = 'transparent';
            
            resultRarity.style.background = item.color;
            resultRarity.style.webkitBackgroundClip = 'text';
            resultRarity.style.webkitTextFillColor = 'transparent';
            resultRarity.style.backgroundClip = 'text';
            resultRarity.style.color = 'transparent';
        } else {
            // For solid colors
            resultName.style.color = item.color;
            resultName.style.background = 'none';
            resultName.style.webkitBackgroundClip = 'initial';
            resultName.style.webkitTextFillColor = 'initial';
            resultName.style.backgroundClip = 'initial';
            
            resultRarity.style.color = item.color;
            resultRarity.style.background = 'none';
            resultRarity.style.webkitBackgroundClip = 'initial';
            resultRarity.style.webkitTextFillColor = 'initial';
            resultRarity.style.backgroundClip = 'initial';
        }
        
        resultValue.textContent = `${item.price}$`;
        
        elements.gachaResult.classList.remove('hidden');
        elements.gachaSellItem.classList.remove('hidden');
        
        // Store current item for selling
        elements.gachaSellItem.currentItem = item;
    }
    
    function openGachaCase() {
        if (elements.gachaModal.classList.contains('hidden')) {
            elements.gachaModal.classList.remove('hidden');
            elements.gachaResult.classList.add('hidden');
            elements.gachaSellItem.classList.add('hidden');
            
            // Generate items and determine winner
            const items = generateGachaItems(25);
            const winningIndex = Math.floor(items.length / 2); // Middle item wins
            const winningItem = getRandomItem(); // Get actual random winning item
            items[winningIndex] = winningItem;
            
            // Play animation
            playGachaAnimation(items, winningIndex).then((item) => {
                // Add to inventory
                gachaSystem.inventory[item.rarity]++;
                gachaSystem.totalItems++;
                saveGachaSystem();
                updateGachaUI();
                
                // Show result
                showGachaResult(item);
            });
        }
    }
    
    function sellGachaItem(item) {
        if (item && gachaSystem.inventory[item.rarity] > 0) {
            gachaSystem.inventory[item.rarity]--;
            gachaSystem.totalItems--;
            gachaSystem.money += item.price;
            saveGachaSystem();
            updateGachaUI();
            updateInventoryDisplay();
            
            // Close gacha modal
            elements.gachaModal.classList.add('hidden');
        }
    }
    
    function updateInventoryDisplay() {
        if (!elements.inventoryGrid) return;
        
        elements.inventoryGrid.innerHTML = '';
        
        Object.entries(gachaRarities).forEach(([rarity, config]) => {
            const count = gachaSystem.inventory[rarity] || 0;
            
            const groupEl = document.createElement('div');
            groupEl.className = 'inventory-rarity-group';
            groupEl.innerHTML = `
                <div class="inventory-rarity-header">
                    <span class="inventory-rarity-name" style="color: ${config.color}">${config.icon} ${rarity}</span>
                    <span class="inventory-rarity-count">${count}</span>
                </div>
                <div class="inventory-rarity-actions">
                    <button class="inventory-sell-btn" data-rarity="${rarity}" ${count === 0 ? 'disabled' : ''}>
                        Vendre 1 (${config.price}$)
                    </button>
                    <button class="inventory-sell-btn" data-rarity="${rarity}" data-all="true" ${count === 0 ? 'disabled' : ''}>
                        Tout vendre (${count * config.price}$)
                    </button>
                </div>
            `;
            
            elements.inventoryGrid.appendChild(groupEl);
        });
        
        // Add event listeners for sell buttons
        elements.inventoryGrid.querySelectorAll('.inventory-sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rarity = e.target.dataset.rarity;
                const sellAll = e.target.dataset.all === 'true';
                const config = gachaRarities[rarity];
                const count = gachaSystem.inventory[rarity] || 0;
                
                if (count > 0) {
                    if (sellAll) {
                        gachaSystem.money += count * config.price;
                        gachaSystem.totalItems -= count;
                        gachaSystem.inventory[rarity] = 0;
                    } else {
                        gachaSystem.money += config.price;
                        gachaSystem.totalItems--;
                        gachaSystem.inventory[rarity]--;
                    }
                    
                    saveGachaSystem();
                    updateGachaUI();
                    updateInventoryDisplay();
                }
            });
        });
    }
    
    function buyHintWithGacha() {
        if (gachaSystem.money >= gachaSystem.hintCost && gameState.status === 'playing' && ws) {
            const oldCost = gachaSystem.hintCost;
            gachaSystem.money -= gachaSystem.hintCost;
            gachaSystem.hintCost = Math.floor(gachaSystem.hintCost * 1.5); // Augmentation plus significative
            
            ws.send(JSON.stringify({
                type: 'shop',
                item: 'letter'
            }));
            
            saveGachaSystem();
            updateGachaUI();
            
            // Show feedback message
            if (elements.info) {
                elements.info.textContent = `💡 Indice acheté pour ${oldCost}$ ! Prochain indice : ${gachaSystem.hintCost}$`;
                elements.info.classList.remove('hidden');
                setTimeout(() => {
                    elements.info.classList.add('hidden');
                }, 3000);
            }
            
            console.log(`✅ Hint purchased for ${oldCost}$! Next hint will cost ${gachaSystem.hintCost}$`);
        } else {
            // Show error message
            let errorMsg = '';
            if (gachaSystem.money < gachaSystem.hintCost) {
                errorMsg = `💰 Pas assez d'argent ! Il vous faut ${gachaSystem.hintCost}$ (vous avez ${Math.floor(gachaSystem.money)}$)`;
            } else if (gameState.status !== 'playing') {
                errorMsg = '🎮 Les indices ne sont disponibles que pendant une partie !';
            } else {
                errorMsg = '❌ Impossible d\'acheter un indice maintenant';
            }
            
            if (elements.error) {
                elements.error.textContent = errorMsg;
                elements.error.classList.remove('hidden');
                setTimeout(() => {
                    elements.error.classList.add('hidden');
                }, 3000);
            }
        }
    }
    
    // === DROP RATES MODAL ===
    function showDropRatesModal() {
        if (elements.dropRatesModal) {
            elements.dropRatesModal.classList.add('show');
            generateDropRatesTable();
            animateDropRatesTable();
        }
    }
    
    function hideDropRatesModal() {
        if (elements.dropRatesModal) {
            elements.dropRatesModal.classList.remove('show');
        }
    }
    
    function generateDropRatesTable() {
        if (!elements.dropRatesTableBody) return;
        
        elements.dropRatesTableBody.innerHTML = '';
        
        // Convert gachaRarities to array format for easier handling
        const dropRates = Object.entries(gachaRarities).map(([key, config]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            percent: config.probability,
            color: config.color,
            price: config.price,
            icon: config.icon
        }));
        
        dropRates.forEach((rarity, index) => {
            const row = document.createElement('tr');
            row.className = 'drop-rates-row';
            row.style.animationDelay = `${index * 0.1}s`;
            
            // Handle gradient colors for exotic and radiant
            let colorStyle = '';
            if (rarity.color.includes('gradient')) {
                colorStyle = `background: ${rarity.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
            } else {
                colorStyle = `color: ${rarity.color};`;
            }
            
            row.innerHTML = `
                <td class="rarity-icon">${rarity.icon}</td>
                <td class="rarity-name" style="${colorStyle}">${rarity.name}</td>
                <td class="rarity-percent" style="${colorStyle}">
                    <span class="percent-counter" data-target="${rarity.percent}">0</span>%
                </td>
                <td>
                    <div class="rarity-bar-container">
                        <div class="rarity-bar" style="background: ${rarity.color};" data-width="${rarity.percent}"></div>
                    </div>
                </td>
                <td class="rarity-price">${rarity.price}$</td>
            `;
            
            elements.dropRatesTableBody.appendChild(row);
        });
    }
    
    function animateDropRatesTable() {
        // Animate percentage counters
        const counters = elements.dropRatesTableBody.querySelectorAll('.percent-counter');
        counters.forEach((counter, index) => {
            const target = parseFloat(counter.dataset.target);
            let current = 0;
            const increment = target / 60; // 60 frames for 1 second animation
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = current.toFixed(1);
            }, 16); // ~60fps
        });
        
        // Animate bars
        const bars = elements.dropRatesTableBody.querySelectorAll('.rarity-bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                const width = parseFloat(bar.dataset.width);
                bar.style.width = `${Math.min(width * 3, 100)}%`; // Scale for visual effect
            }, index * 100);
        });
    }
    
    // Debug functions for testing
    window.addGachaMoney = function(amount = 5000) {
        gachaSystem.money += amount;
        saveGachaSystem();
        updateGachaUI();
        console.log(`💰 Added ${amount}$ to gacha! Total: ${gachaSystem.money}$`);
    };
    
    window.resetGachaSystem = function() {
        localStorage.removeItem('coopdle-gacha');
        location.reload();
    };
    
    // === ALPHABET FUNCTIONS ===
    
    function initAlphabet() {
        if (!elements.alphabetGrid) return;
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        elements.alphabetGrid.innerHTML = '';
        
        letters.forEach(letter => {
            const letterEl = document.createElement('div');
            letterEl.className = 'alphabet-letter unused';
            letterEl.textContent = letter;
            letterEl.dataset.letter = letter.toLowerCase();
            elements.alphabetGrid.appendChild(letterEl);
        });
        
        // Initialize alphabet state
        alphabetState = {};
        letters.forEach(letter => {
            alphabetState[letter.toLowerCase()] = 'unused';
        });
    }
    
    function updateAlphabetFromWordle() {
        if (!elements.board) return;
        
        // Get all cells with feedback
        const cells = elements.board.querySelectorAll('.cell');
        cells.forEach(cell => {
            const letter = cell.textContent.toLowerCase();
            if (letter && cell.classList.contains('correct')) {
                updateAlphabetLetter(letter, 'correct');
            } else if (letter && (cell.classList.contains('absent') || cell.classList.contains('present'))) {
                if (alphabetState[letter] !== 'correct') {
                    updateAlphabetLetter(letter, 'absent');
                }
            }
        });
    }
    
    function updateAlphabetFromCementix(word) {
        // Ne plus mettre à jour l'alphabet depuis Cementix
        // L'alphabet ne doit refléter que les lettres du Wordle
    }
    
    function updateAlphabetLetter(letter, state) {
        if (!elements.alphabetGrid) return;
        
        const letterEl = elements.alphabetGrid.querySelector(`[data-letter="${letter}"]`);
        if (!letterEl) return;
        
        // Update state (correct takes priority over absent)
        if (state === 'correct' || alphabetState[letter] !== 'correct') {
            alphabetState[letter] = state;
            letterEl.className = `alphabet-letter ${state}`;
        }
    }
    
    // === CEMENTIX FUNCTIONS ===
    
    function getHeatEmoji(score) {
        if (score <= 20) return '🧊';
        if (score <= 40) return '❄️';
        if (score <= 60) return '🙂';
        if (score <= 80) return '🔥';
        if (score <= 95) return '🔥🔥';
        return '🔥🔥🔥';
    }
    
    function getScoreClass(score) {
        if (score <= 20) return 'score-cold';
        if (score <= 40) return 'score-cool';
        if (score <= 60) return 'score-warm';
        if (score <= 80) return 'score-hot';
        return 'score-burning';
    }
    
    function sortCementixAttempts() {
        // Trier par score décroissant, puis par timestamp décroissant (plus récent en premier)
        cementixAttempts.sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score; // Score décroissant
            }
            return b.timestamp - a.timestamp; // Plus récent en premier
        });
    }
    
    function renderCementixAttempts() {
        if (!elements.cementixAttempts) return;
        
        elements.cementixAttempts.innerHTML = '';
        
        if (cementixAttempts.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'cementix-empty';
            emptyMsg.textContent = 'Aucune tentative...';
            elements.cementixAttempts.appendChild(emptyMsg);
            return;
        }
        
        cementixAttempts.forEach(attempt => {
            const attemptEl = document.createElement('div');
            attemptEl.className = 'cementix-attempt-compact';
            
            const emoji = getHeatEmoji(attempt.score);
            const scoreClass = getScoreClass(attempt.score);
            
            attemptEl.innerHTML = `
                <div class="cementix-attempt-player-compact">${attempt.pseudo}</div>
                <div class="cementix-attempt-word-compact">${attempt.word}</div>
                <div class="cementix-attempt-score-compact ${scoreClass}">${attempt.score}/100</div>
                <div class="cementix-attempt-emoji-compact">${emoji}</div>
            `;
            
            elements.cementixAttempts.appendChild(attemptEl);
        });
    }
    
    function addCementixAttempt(pseudo, word, score, timestamp) {
        // Ajouter à la liste
        cementixAttempts.push({
            pseudo,
            word,
            score,
            timestamp
        });
        
        // Award money for good Cementix scores (only for current player)
        if (pseudo === gameState.pseudo) {
            let moneyReward = 0;
            if (score >= 90) moneyReward = 50;      // Excellent score
            else if (score >= 75) moneyReward = 25; // Good score
            else if (score >= 50) moneyReward = 10; // Decent score
            else if (score >= 25) moneyReward = 5;  // Fair score
            
            if (moneyReward > 0) {
                gachaSystem.money += moneyReward;
                saveGachaSystem();
                updateGachaUI();
            }
        }
        
        // Limiter à 100 tentatives max
        if (cementixAttempts.length > 100) {
            cementixAttempts = cementixAttempts.slice(0, 100);
        }
        
        // Trier et re-render
        sortCementixAttempts();
        renderCementixAttempts();
        
        // Ne plus mettre à jour l'alphabet depuis Cementix
        // updateAlphabetFromCementix(word);
    }
    
    function submitCementixWord() {
        if (!elements.cementixInput || !ws) return;
        
        const word = elements.cementixInput.value.trim().toLowerCase();
        if (!word) return;
        
        // Basic validation
        if (word.length < 2 || word.length > 20) {
            showError('Le mot doit faire entre 2 et 20 lettres');
            return;
        }
        
        if (!/^[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+$/.test(word)) {
            showError('Le mot ne doit contenir que des lettres');
            return;
        }
        
        ws.send(JSON.stringify({
            type: 'cementix',
            word: word
        }));
        
        elements.cementixInput.value = '';
    }
    
    function initCementixEmpty() {
        if (!elements.cementixAttempts) return;
        
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'cementix-empty';
        emptyMsg.textContent = 'Aucune tentative pour le moment...';
        elements.cementixAttempts.appendChild(emptyMsg);
    }
    
    function showGameResult(won, word) {
        // Use integrated result instead of modal
        if (!elements.gameResultIntegrated) return;
        
        // Award money for participating
        let moneyReward = 0;
        if (won) {
            moneyReward = 100 + (word.length * 20); // Base 100$ + 20$ per letter
            if (elements.resultIconIntegrated) elements.resultIconIntegrated.textContent = '🎉';
            if (elements.resultTextIntegrated) elements.resultTextIntegrated.textContent = `Partie gagnée ! +${moneyReward}$`;
        } else {
            moneyReward = 25 + (word.length * 5); // Consolation prize: 25$ + 5$ per letter
            if (elements.resultIconIntegrated) elements.resultIconIntegrated.textContent = '😞';
            if (elements.resultTextIntegrated) elements.resultTextIntegrated.textContent = `Partie perdue ! Le mot était : ${word.toUpperCase()} (+${moneyReward}$)`;
        }
        
        // Add money to gacha system
        gachaSystem.money += moneyReward;
        saveGachaSystem();
        updateGachaUI();
        
        elements.gameResultIntegrated.classList.remove('hidden');
        
        // Hide old modal if it exists
        if (elements.gameResult) {
            elements.gameResult.classList.add('hidden');
        }
    }
    
    function hideGameResult() {
        if (elements.gameResultIntegrated) {
            elements.gameResultIntegrated.classList.add('hidden');
        }
        if (elements.gameResult) {
            elements.gameResult.classList.add('hidden');
        }
    }
    
    function calculateClickReward() {
        // This function is no longer used in gacha system
        return 1;
    }
    
    function showCoinAnimation(x, y, amount) {
        // This function is no longer used in gacha system
        const coinEl = document.createElement('div');
        coinEl.className = 'coin-animation';
        coinEl.textContent = `+${amount}$`;
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
        
        // Update alphabet from Wordle results
        updateAlphabetFromWordle();
    }
    
    // === GESTION DU CHAT ===
    
    function clearChat() {
        if (elements.chatMessages) {
            elements.chatMessages.innerHTML = '';
        }
    }
    
    function addChatMessage(from, pseudo, avatar, color, text, timestamp, special67 = false) {
        if (!elements.chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        
        // Appliquer l'effet spécial si le serveur l'indique
        if (special67) {
            messageEl.classList.add('lightning-67');
        }
        
        const time = new Date(timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Remplacer "67" par une version stylée si l'effet spécial est activé
        let styledText = text;
        if (special67) {
            styledText = text.replace(/67/g, '<span class="number-67">67</span>');
        }
        
        messageEl.innerHTML = `
            <div class="chat-avatar">${avatar}</div>
            <div class="chat-content">
                <div class="chat-meta">
                    <span class="chat-author" style="color: ${color || '#e2e8f0'}">${pseudo}</span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-text">${styledText}</div>
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
            li.className = 'player-item-vertical';
            
            if (player.id === playerId) {
                li.classList.add('you');
            }
            if (player.id === gameState.currentPlayerId) {
                li.classList.add('current');
            }
            
            li.innerHTML = `
                <div class="player-avatar-vertical">${player.avatar}</div>
                <div class="player-name-vertical" style="color: ${player.color || '#e2e8f0'}">${player.pseudo}</div>
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
                const previousAttempts = gameState.attempts || 0;
                
                gameState.length = data.length;
                gameState.guesses = data.guesses || [];
                gameState.attempts = data.attempts || 0;
                gameState.maxAttempts = data.maxAttempts || 6;
                gameState.status = data.status || 'playing';
                gameState.currentPlayerId = data.currentPlayerId;
                gameState.players = data.players || [];
                gameState.revealedLetters = data.revealedLetters || [];
                
                // Award money for valid guess attempts (only if attempts increased)
                if (gameState.attempts > previousAttempts && gameState.status === 'playing') {
                    const moneyReward = 10; // Small reward for each valid guess
                    gachaSystem.money += moneyReward;
                    saveGachaSystem();
                    updateGachaUI();
                }
                
                if (elements.attempts) elements.attempts.textContent = gameState.attempts;
                if (elements.wordLength) elements.wordLength.textContent = gameState.length;
                
                updateBoard();
                updatePlayersList();
                updateCurrentPlayerStatus();
                break;
                
            case 'chat':
                addChatMessage(data.from, data.pseudo, data.avatar, data.color, data.text, data.ts, data.special67);
                break;
                
            case 'systemMessage':
                addSystemMessage(data.text, data.ts);
                break;
                
            case 'cementix':
                addCementixAttempt(data.pseudo, data.word, data.score, data.ts);
                break;
                
            case 'reveal':
                hideGameResult(); // Hide any existing result
                if (gameState.status === 'won') {
                    showGameResult(true, data.word);
                } else if (gameState.status === 'lost') {
                    showGameResult(false, data.word);
                }
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
    
    // === GESTION DU JEU ===
    
    function setupGameLayout(mode) {
        if (!elements.gameContainer || !elements.chatPanel || !elements.cementixPanel) return;
        
        if (mode === 'solo') {
            // En mode solo, masquer le chat et ajuster le layout
            elements.chatPanel.style.display = 'none';
            elements.gameContainer.classList.add('solo-mode');
            if (elements.btnCopyRoomLink) elements.btnCopyRoomLink.classList.add('hidden');
            // Afficher Cementix en mode solo aussi
            elements.cementixPanel.style.display = 'block';
        } else {
            // En mode coop, afficher le chat et Cementix
            elements.chatPanel.style.display = 'flex';
            elements.gameContainer.classList.remove('solo-mode');
            if (elements.btnCopyRoomLink) elements.btnCopyRoomLink.classList.remove('hidden');
            elements.cementixPanel.style.display = 'block';
        }
        
        // Initialize empty state for Cementix
        initCementixEmpty();
        
        // Initialize alphabet
        initAlphabet();
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
        hideGameResult();
        
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
        console.log('🔄 Starting new game - reloading page for fresh start');
        
        // Clear any saved game state
        localStorage.removeItem('coopdle-game-state');
        
        // Reload the page to start fresh
        window.location.reload();
    }
    
    // === IDLE GAME ===
    
    function initGachaSystem() {
        console.log('🎰 Initializing gacha system...');
        console.log('💰 Initial gacha state:', gachaSystem);
        
        // Check for daily bonus
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (now - gachaSystem.lastDailyBonus > oneDayMs) {
            gachaSystem.money += 500; // Daily bonus
            gachaSystem.lastDailyBonus = now;
            saveGachaSystem();
            console.log('🎁 Daily bonus awarded: +500$');
        }
        
        updateGachaUI();
        
        // Open case button
        if (elements.btnOpenCase) {
            console.log('✅ Open case button found, adding click handler');
            elements.btnOpenCase.addEventListener('click', () => {
                openGachaCase();
            });
        } else {
            console.error('❌ Open case button not found!');
        }
        
        // Buy hint button
        if (elements.btnBuyHint) {
            console.log('✅ Hint button found, adding click handler');
            elements.btnBuyHint.addEventListener('click', () => {
                buyHintWithGacha();
            });
        } else {
            console.error('❌ Hint button not found!');
        }
        
        // Show inventory button
        if (elements.btnShowInventory) {
            console.log('✅ Inventory button found, adding click handler');
            elements.btnShowInventory.addEventListener('click', () => {
                elements.inventoryModal.classList.remove('hidden');
                updateInventoryDisplay();
            });
        } else {
            console.error('❌ Inventory button not found!');
        }
        
        // Drop rates button
        if (elements.btnDropRates) {
            console.log('✅ Drop rates button found, adding click handler');
            elements.btnDropRates.addEventListener('click', () => {
                showDropRatesModal();
            });
        } else {
            console.error('❌ Drop rates button not found!');
        }
        
        // Gacha modal close button
        if (elements.gachaClose) {
            elements.gachaClose.addEventListener('click', () => {
                elements.gachaModal.classList.add('hidden');
            });
        }
        
        // Inventory modal close button
        if (elements.inventoryClose) {
            elements.inventoryClose.addEventListener('click', () => {
                elements.inventoryModal.classList.add('hidden');
            });
        }
        
        // Drop rates modal close button
        if (elements.dropRatesClose) {
            elements.dropRatesClose.addEventListener('click', () => {
                hideDropRatesModal();
            });
        }
        
        // Sell item button in gacha modal
        if (elements.gachaSellItem) {
            elements.gachaSellItem.addEventListener('click', () => {
                if (elements.gachaSellItem.currentItem) {
                    sellGachaItem(elements.gachaSellItem.currentItem);
                }
            });
        }
        
        // Close modals on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                elements.gachaModal.classList.add('hidden');
                elements.inventoryModal.classList.add('hidden');
                hideDropRatesModal();
            }
        });
        
        // Close modals on background click
        elements.gachaModal.addEventListener('click', (e) => {
            if (e.target === elements.gachaModal) {
                elements.gachaModal.classList.add('hidden');
            }
        });
        
        elements.inventoryModal.addEventListener('click', (e) => {
            if (e.target === elements.inventoryModal) {
                elements.inventoryModal.classList.add('hidden');
            }
        });
        
        if (elements.dropRatesModal) {
            elements.dropRatesModal.addEventListener('click', (e) => {
                if (e.target === elements.dropRatesModal) {
                    hideDropRatesModal();
                }
            });
        }
        
        console.log('🎰 Gacha system initialization complete!');
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
            if (elements.fieldLength) {
                elements.fieldLength.style.display = 'none'; // Masquer les options de config
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
        } else {
            // Mode normal, afficher les options de configuration
            if (elements.fieldLength) {
                elements.fieldLength.style.display = 'block';
            }
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
        
        if (elements.btnNewGameHighlight) {
            elements.btnNewGameHighlight.addEventListener('click', () => {
                hideGameResult();
                startNewGame();
            });
        }
        
        if (elements.btnNewGameIntegrated) {
            elements.btnNewGameIntegrated.addEventListener('click', () => {
                hideGameResult();
                startNewGame();
            });
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
        
        // Cementix
        if (elements.cementixSubmit) {
            elements.cementixSubmit.addEventListener('click', submitCementixWord);
        }
        
        if (elements.cementixInput) {
            elements.cementixInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitCementixWord();
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
        initGachaSystem();
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