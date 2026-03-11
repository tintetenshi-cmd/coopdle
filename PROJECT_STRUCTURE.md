# 📁 Structure du Projet

```
coop-wordle/
│
├── 📄 server.js                    # Serveur Node.js + WebSocket
├── 📄 package.json                 # Dépendances et scripts
├── 📄 package-lock.json            # Versions exactes des dépendances
├── 📄 render.yaml                  # Configuration Render
├── 📄 .gitignore                   # Fichiers à ignorer par Git
│
├── 📁 public/                      # Fichiers statiques (frontend)
│   ├── 📄 index.html              # Page HTML principale
│   ├── 📄 main.js                 # JavaScript client (optimisé)
│   └── 📄 style.css               # Styles CSS (avec singe 🐵)
│
└── 📁 docs/                        # Documentation
    ├── 📄 README.md               # Guide principal
    ├── 📄 DEPLOYMENT_GUIDE.md     # Guide de déploiement détaillé
    ├── 📄 QUICK_START.md          # Démarrage rapide
    ├── 📄 READY_TO_DEPLOY.md      # Checklist de déploiement
    ├── 📄 OPTIMIZATIONS.md        # Détails des optimisations
    ├── 📄 TEST_REPORT.md          # Rapport de tests
    └── 📄 PROJECT_STRUCTURE.md    # Ce fichier
```

---

## 📄 Description des Fichiers

### Backend

**server.js** (400 lignes)
- Serveur Express
- WebSocket pour temps réel
- Gestion des rooms
- Logique du jeu Wordle
- Optimisé pour performance

### Frontend

**public/index.html** (290 lignes)
- Structure HTML complète
- Écrans : titre, mode, jeu
- Grille de jeu
- Chat
- Idle game
- Singe mystérieux 🐵

**public/main.js** (900 lignes)
- Logique client complète
- WebSocket client
- Gestion des états
- Animations et effets
- Singe avec phrases aléatoires
- Optimisé (debounce, gestion erreurs)

**public/style.css** (880 lignes)
- Design noir/violet
- Responsive
- Animations
- Effets visuels (flammes, shake, néon, etc.)
- Styles du singe

### Configuration

**package.json**
```json
{
  "name": "coop-wordle",
  "version": "1.0.0",
  "engines": { "node": ">=18.0.0" },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "ws": "^8.18.0"
  }
}
```

**render.yaml**
```yaml
services:
  - type: web
    name: coop-wordle
    env: node
    plan: free
    buildCommand: "npm install"
    startCommand: "node server.js"
```

**.gitignore**
- node_modules/
- .env
- Fichiers temporaires
- Fichiers IDE

---

## 📊 Statistiques du Code

| Fichier | Lignes | Taille | Description |
|---------|--------|--------|-------------|
| server.js | ~400 | 12 KB | Backend optimisé |
| main.js | ~900 | 28 KB | Frontend optimisé |
| style.css | ~880 | 18 KB | Styles complets |
| index.html | ~290 | 10 KB | Structure HTML |
| **TOTAL** | **~2470** | **~68 KB** | Code source |

---

## 🎯 Fonctionnalités par Fichier

### server.js
- ✅ Gestion des rooms
- ✅ WebSocket temps réel
- ✅ Validation des mots
- ✅ Tour par tour
- ✅ Chat
- ✅ Shop (révéler lettres)
- ✅ Effets visuels broadcast
- ✅ Nettoyage automatique

### main.js
- ✅ Interface utilisateur
- ✅ WebSocket client
- ✅ Rendu de la grille
- ✅ Gestion des tours
- ✅ Chat en direct
- ✅ Idle game
- ✅ Shop client
- ✅ Singe mystérieux 🐵
- ✅ Effets visuels
- ✅ Debounce typing

### style.css
- ✅ Design responsive
- ✅ Thème noir/violet
- ✅ Animations
- ✅ Effets visuels
- ✅ Styles du singe
- ✅ Mobile-friendly

---

## 🔧 Technologies Utilisées

### Backend
- Node.js (>=18)
- Express.js (serveur web)
- ws (WebSocket)

### Frontend
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript ES6+ (Vanilla)

### Déploiement
- Render (recommandé)
- Heroku
- Railway

---

## 📦 Dépendances

### Production
```json
{
  "express": "^4.21.2",  // Serveur web
  "ws": "^8.18.0"        // WebSocket
}
```

### Développement
```json
{
  "nodemon": "^3.1.7"    // Auto-reload
}
```

**Taille totale :** ~5 MB (avec node_modules)

---

## 🚀 Commandes Disponibles

```bash
# Installation
npm install

# Développement (auto-reload)
npm run dev

# Production
npm start

# Test syntaxe
node -c server.js
node -c public/main.js
```

---

## 📝 Documentation

| Fichier | Description |
|---------|-------------|
| README.md | Guide principal et présentation |
| DEPLOYMENT_GUIDE.md | Guide de déploiement complet |
| QUICK_START.md | Démarrage rapide (5 min) |
| READY_TO_DEPLOY.md | Checklist avant déploiement |
| OPTIMIZATIONS.md | Détails des optimisations |
| TEST_REPORT.md | Rapport de tests (62/62) |
| PROJECT_STRUCTURE.md | Structure du projet (ce fichier) |

---

## ✅ Prêt pour le Déploiement

Tous les fichiers sont en place et optimisés !

Voir [QUICK_START.md](QUICK_START.md) pour déployer en 5 minutes.

🎉 Bon déploiement ! 🚀
