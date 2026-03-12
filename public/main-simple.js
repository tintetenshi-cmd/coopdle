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
        titleScreen.classList.remove('hidden');
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
        screenMode: document.getElementById("screen-mode"),
        screenGame: document.getElementById("screen-game"),
        btnPlay: document.getElementById("btn-play"),
        btnSolo: document.getElementById("btn-solo"),
        btnCoop: document.getElementById("btn-coop"),
        btnBackToTitle: document.getElementById("btn-back-to-title"),
        btnBackToMode: document.getElementById("btn-back-to-mode"),
        inputPseudo: document.getElementById("input-pseudo"),
        selectLength: document.getElementById("select-length"),
        selectAvatar: document.getElementById("select-avatar"),
        selectNameColor: document.getElementById("select-name-color"),
        badgeMode: document.getElementById("badge-mode"),
        badgeRoom: document.getElementById("badge-room"),
        errorEl: document.getElementById("error"),
        infoEl: document.getElementById("info")
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
    
    // Event listeners
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

    if (elements.btnSolo) {
        elements.btnSolo.addEventListener("click", () => {
            console.log('🎯 Solo mode selected');
            showScreen(elements.screenGame);
            if (elements.badgeMode) elements.badgeMode.textContent = "Mode Solo";
        });
    }

    if (elements.btnCoop) {
        elements.btnCoop.addEventListener("click", () => {
            console.log('👥 Coop mode selected');
            showScreen(elements.screenGame);
            if (elements.badgeMode) elements.badgeMode.textContent = "Mode Coop";
        });
    }
    
    // Afficher l'écran de titre
    showScreen(elements.screenTitle);
    
    console.log('🎉 App initialization complete!');
    
    // Test d'affichage après 1 seconde
    setTimeout(() => {
        console.log('🔍 Final display check...');
        console.log('Title screen display:', elements.screenTitle?.style.display);
        console.log('Body background:', window.getComputedStyle(document.body).background);
        
        // Force finale si nécessaire
        if (elements.screenTitle) {
            elements.screenTitle.style.display = 'flex';
            elements.screenTitle.style.visibility = 'visible';
            elements.screenTitle.style.opacity = '1';
            console.log('🔧 Final force applied to title screen');
        }
    }, 1000);
});

console.log('📜 Script loaded successfully');