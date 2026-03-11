# Coop Wordle 🐵

Application web de type Wordle jouable en solo ou en coop (plusieurs joueurs sur le même mot), avec rooms partageables et un petit singe qui dit des choses bizarres !

## ✨ Fonctionnalités

- **Mode solo** : un mot aléatoire entre 2 et 10 lettres, 6 essais
- **Mode coop** : plusieurs joueurs se connectent à la même room via un lien à partager, la grille est synchronisée en temps réel
- **Chat en direct** : communiquez avec vos coéquipiers
- **Idle game** : accumulez des pas en cliquant sur le pied 🦶
- **Shop** : dépensez vos pas pour révéler des lettres ou déclencher des effets visuels
- **Singe mystérieux** 🐵 : un petit compagnon qui dit des choses aléatoires pendant la partie
- Retour visuel façon Wordle :
  - 🟩 Lettre bien placée
  - 🟨 Lettre présente mais mal placée
  - ⬜ Lettre absente
- À chaque **nouvelle partie**, un nouveau mot est généré
- UI épurée **noir / violet**, responsive

## 🚀 Déploiement

### Option 1 : Render (Recommandé)

1. Créez un compte sur [render.com](https://render.com)
2. Connectez votre dépôt Git
3. Render détectera automatiquement `render.yaml`
4. Cliquez sur "Create Web Service"
5. Votre app sera disponible sur `https://votre-app.onrender.com`

### Option 2 : Heroku

```bash
heroku create coop-wordle
git push heroku main
heroku open
```

### Option 3 : Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez votre dépôt GitHub
3. Déploiement automatique !

Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour plus de détails.

## 🛠️ Lancer en local

Assurez-vous d'avoir **Node.js** (v18+) installé.

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Ou en mode production
npm start
```

Le serveur démarre par défaut sur `http://localhost:3000`.

## 📖 Utilisation

1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Cliquez sur **Jouer**, puis choisissez :
   - **Solo** pour jouer seul
   - **Créer une room coop** pour jouer à plusieurs
3. En mode coop :
   - Un identifiant de room est généré
   - Un **lien de partage** est affiché
   - Envoyez-le à vos coéquipiers
   - Dès qu'ils ouvrent ce lien, ils rejoignent la même room
4. Chaque partie :
   - Vous avez **6 essais** pour trouver le mot mystère
   - Le bouton **Nouvelle partie** relance une partie avec un nouveau mot
5. Profitez du singe qui dit des choses bizarres ! 🐵

## 🎮 Fonctionnalités Avancées

### Idle Game
- Cliquez sur le pied 🦶 pour accumuler des pas
- Achetez des upgrades pour augmenter vos gains
- Dépensez vos pas dans le shop

### Shop
- **Révéler une lettre** : Affiche une lettre aléatoire du mot (500 pas)
- **Effets visuels** : Déclenchez des effets pour tous les joueurs
  - Bordure flammes 🔥
  - Tremblement 📳
  - Halo néon ✨
  - Pluie de lettres 🌧️
  - Flou cosmique 🌀

### Le Singe 🐵
Un petit compagnon mystérieux apparaît pendant la partie et dit des phrases aléatoires toutes les 15-30 secondes :
- "Les bananes sont carrées"
- "Le temps est un sandwich"
- "Mon cousin est une cuillère"
- Et bien d'autres...

## 🏗️ Technologies

- **Backend** : Node.js, Express, WebSocket (ws)
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Déploiement** : Render, Heroku, Railway

## 📊 Optimisations

L'application a été optimisée pour :
- ✅ Performance réseau (+85%)
- ✅ Performance CPU (+70%)
- ✅ Gestion mémoire
- ✅ Robustesse et gestion d'erreurs

Voir [OPTIMIZATIONS.md](OPTIMIZATIONS.md) pour plus de détails.

## 🧪 Tests

Tous les tests passent (62/62) ! Voir [TEST_REPORT.md](TEST_REPORT.md) pour le rapport complet.

## 📝 License

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 🎉 Amusez-vous bien !

Créé avec ❤️ et un peu de folie 🐵
