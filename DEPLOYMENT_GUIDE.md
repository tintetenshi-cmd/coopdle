# 🚀 Guide de Déploiement - Coopdle

## ✅ Prérequis

Votre application est **prête pour le déploiement** ! Tous les tests sont passés et le code est optimisé.

---

## 📦 Option 1 : Déploiement sur Render (Recommandé)

### Avantages
- ✅ Gratuit
- ✅ Configuration automatique via `render.yaml`
- ✅ HTTPS inclus
- ✅ Déploiement automatique depuis Git
- ✅ Support WebSocket natif

### Étapes

#### 1. Préparer le dépôt Git

```bash
# Si pas encore initialisé
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Application Coopdle prête pour déploiement"

# Créer un dépôt sur GitHub/GitLab/Bitbucket
# Puis pousser le code
git remote add origin <URL_DE_VOTRE_DEPOT>
git branch -M main
git push -u origin main
```

#### 2. Déployer sur Render

1. Allez sur [render.com](https://render.com)
2. Créez un compte (gratuit)
3. Cliquez sur **"New +"** → **"Web Service"**
4. Connectez votre dépôt Git
5. Render détectera automatiquement `render.yaml`
6. Cliquez sur **"Create Web Service"**
7. Attendez 2-3 minutes pour le build

#### 3. Accéder à votre application

Render vous donnera une URL du type :
```
https://coop-wordle.onrender.com
```

**C'est tout ! 🎉**

---

## 📦 Option 2 : Déploiement sur Heroku

### Étapes

#### 1. Installer Heroku CLI
```bash
# Windows (avec Chocolatey)
choco install heroku-cli

# Ou télécharger depuis heroku.com
```

#### 2. Créer un fichier Procfile
```bash
echo "web: node server.js" > Procfile
```

#### 3. Déployer
```bash
# Login
heroku login

# Créer l'app
heroku create coop-wordle

# Pousser le code
git push heroku main

# Ouvrir l'app
heroku open
```

---

## 📦 Option 3 : Déploiement sur Railway

### Étapes

1. Allez sur [railway.app](https://railway.app)
2. Connectez votre dépôt GitHub
3. Railway détecte automatiquement Node.js
4. Déploiement automatique !

---

## 📦 Option 4 : Déploiement sur Vercel

⚠️ **Note** : Vercel est optimisé pour les sites statiques. Pour WebSocket, préférez Render ou Railway.

---

## 🔧 Configuration Post-Déploiement

### Variables d'environnement (optionnel)

Si vous voulez personnaliser le port :

```bash
# Sur Render (via dashboard)
PORT=3000

# Sur Heroku
heroku config:set PORT=3000
```

**Note** : Le port est automatiquement configuré par la plateforme.

---

## ✅ Vérifications Post-Déploiement

Une fois déployé, testez :

1. ✅ Page d'accueil charge
2. ✅ Mode solo fonctionne
3. ✅ Mode coop fonctionne
4. ✅ WebSocket connecté (chat, synchronisation)
5. ✅ Le singe apparaît et parle 🐵
6. ✅ Idle game fonctionne
7. ✅ Effets visuels fonctionnent

---

## 🌐 Partager votre application

Une fois déployée, partagez le lien :

```
https://votre-app.onrender.com
```

Vos amis peuvent :
- Jouer en solo
- Créer des rooms coop
- Partager des liens de room

---

## 📊 Monitoring (Gratuit sur Render)

Render vous donne accès à :
- Logs en temps réel
- Métriques de performance
- Historique des déploiements
- Redémarrage automatique en cas d'erreur

---

## 🔄 Mises à jour

Pour mettre à jour l'application :

```bash
# Faire vos modifications
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

Render redéploiera automatiquement ! 🚀

---

## ⚠️ Limitations du Plan Gratuit

### Render Free Tier
- ✅ 750 heures/mois (suffisant)
- ⚠️ L'app s'endort après 15 min d'inactivité
- ⚠️ Premier chargement peut prendre 30s
- ✅ Parfait pour un projet personnel/démo

### Solutions
- Utiliser un service de "ping" pour garder l'app active
- Passer au plan payant ($7/mois) pour 0 downtime

---

## 🎯 Checklist Finale

Avant de déployer, vérifiez :

- ✅ Code commité sur Git
- ✅ `package.json` présent
- ✅ `render.yaml` présent
- ✅ Pas de fichiers sensibles (`.env` dans `.gitignore`)
- ✅ Tests passés localement
- ✅ Port configuré via `process.env.PORT`

**Tout est OK ! Vous pouvez déployer ! 🚀**

---

## 🆘 Problèmes Courants

### WebSocket ne fonctionne pas
- Vérifiez que la plateforme supporte WebSocket
- Render/Railway/Heroku : ✅ OK
- Vercel : ❌ Pas recommandé

### L'app ne démarre pas
- Vérifiez les logs sur le dashboard
- Vérifiez que `npm start` fonctionne localement

### Erreur de build
- Vérifiez que `npm install` fonctionne localement
- Vérifiez la version de Node.js

---

## 📞 Support

Si vous avez des problèmes :
1. Consultez les logs sur le dashboard
2. Vérifiez que tout fonctionne en local
3. Consultez la documentation de la plateforme

---

## 🎉 Félicitations !

Votre application Coopdle est maintenant accessible au monde entier ! 🌍

Partagez le lien et amusez-vous bien ! 🐵
