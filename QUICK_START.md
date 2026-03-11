# 🚀 Quick Start - Déploiement en 5 minutes

## Option 1 : Render (Le plus simple)

```bash
# 1. Initialiser Git
git init
git add .
git commit -m "Initial commit"

# 2. Créer un dépôt sur GitHub
# Allez sur github.com → New repository → coop-wordle

# 3. Pousser le code
git remote add origin https://github.com/VOTRE_USERNAME/coop-wordle.git
git branch -M main
git push -u origin main

# 4. Déployer sur Render
# → Allez sur render.com
# → New + → Web Service
# → Connectez votre dépôt
# → Create Web Service
# → Attendez 2-3 minutes
# → C'est prêt ! 🎉
```

**Votre app sera sur :** `https://coop-wordle-XXXX.onrender.com`

---

## Option 2 : Heroku

```bash
# 1. Installer Heroku CLI
# Téléchargez depuis heroku.com

# 2. Login et déployer
heroku login
heroku create coop-wordle
git push heroku main
heroku open
```

---

## Option 3 : Railway

```bash
# 1. Pousser sur GitHub (voir Option 1, étapes 1-3)

# 2. Déployer sur Railway
# → Allez sur railway.app
# → New Project → Deploy from GitHub
# → Sélectionnez votre dépôt
# → Déploiement automatique ! 🚀
```

---

## ✅ Vérification Post-Déploiement

Testez ces fonctionnalités :
- [ ] Page d'accueil charge
- [ ] Mode solo fonctionne
- [ ] Mode coop fonctionne
- [ ] Chat fonctionne
- [ ] Le singe apparaît 🐵
- [ ] Idle game fonctionne
- [ ] Effets visuels fonctionnent

---

## 🎉 C'est tout !

Votre application est maintenant en ligne et accessible au monde entier !

Partagez le lien et amusez-vous ! 🐵
