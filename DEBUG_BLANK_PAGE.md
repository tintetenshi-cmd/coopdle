# 🐛 Diagnostic : Page Blanche

## Problème Identifié et Corrigé

Le problème était que les fonctions `startMonkey()` et `stopMonkey()` étaient appelées avant d'être définies, causant une erreur JavaScript qui bloquait toute l'application.

### ✅ Corrections Appliquées

1. **Supprimé l'appel prématuré** dans `startMode()`
2. **Déplacé l'appel** dans le callback WebSocket `joined`
3. **Simplifié** l'appel à `stopMonkey()`

---

## 🔍 Comment Vérifier si Votre App Fonctionne

### 1. Ouvrir la Console du Navigateur

1. Allez sur https://coopdle.onrender.com
2. Appuyez sur **F12** (ou clic droit → Inspecter)
3. Allez dans l'onglet **Console**
4. Regardez s'il y a des erreurs en rouge

### 2. Erreurs Courantes

**Si vous voyez :**
```
Uncaught ReferenceError: startMonkey is not defined
```
→ C'était le problème ! Maintenant corrigé.

**Si vous voyez :**
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```
→ Le serveur ne répond pas. Attendez 30 secondes (réveil).

**Si vous voyez :**
```
WebSocket connection failed
```
→ Vérifiez que vous êtes sur HTTPS (pas HTTP).

---

## 🚀 Déployer les Corrections

Pour mettre à jour votre app sur Render :

```bash
# 1. Ajouter les changements
git add public/main.js

# 2. Commit
git commit -m "Fix: Correction page blanche - ordre des fonctions"

# 3. Pousser
git push origin main
```

Render redéploiera automatiquement en 2-3 minutes.

---

## 🧪 Tester Localement Avant de Déployer

```bash
# Démarrer le serveur
npm start

# Ouvrir dans le navigateur
# http://localhost:3000

# Ouvrir la console (F12)
# Vérifier qu'il n'y a pas d'erreurs
```

---

## 📋 Checklist de Diagnostic

Si la page est toujours blanche après le redéploiement :

### Étape 1 : Console du Navigateur
- [ ] Ouvrir F12 → Console
- [ ] Noter toutes les erreurs en rouge
- [ ] Copier le message d'erreur complet

### Étape 2 : Onglet Network
- [ ] F12 → Network
- [ ] Rafraîchir la page (Ctrl+R)
- [ ] Vérifier que tous les fichiers se chargent (200 OK)
- [ ] Vérifier : index.html, main.js, style.css

### Étape 3 : Logs Render
- [ ] Aller sur render.com
- [ ] Ouvrir votre service
- [ ] Cliquer sur "Logs"
- [ ] Vérifier qu'il n'y a pas d'erreurs

---

## 🔧 Autres Causes Possibles

### 1. Fichiers Non Déployés
**Symptôme :** Erreur 404 pour main.js ou style.css

**Solution :**
```bash
# Vérifier que les fichiers sont bien commités
git status

# Si des fichiers ne sont pas commités
git add public/
git commit -m "Ajout des fichiers manquants"
git push origin main
```

### 2. Erreur de Build
**Symptôme :** Le déploiement échoue sur Render

**Solution :**
- Vérifier les logs de build sur Render
- Vérifier que `npm install` fonctionne localement
- Vérifier la version de Node.js (>=18)

### 3. Port Incorrect
**Symptôme :** Le serveur ne démarre pas

**Solution :**
Vérifier dans `server.js` :
```javascript
const PORT = process.env.PORT || 3000;
```
✅ C'est correct !

### 4. WebSocket Non Configuré
**Symptôme :** L'app charge mais ne se connecte pas

**Solution :**
Vérifier dans `main.js` :
```javascript
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
```
✅ C'est correct !

---

## 🎯 Prochaines Étapes

1. **Déployez les corrections** (commandes ci-dessus)
2. **Attendez 2-3 minutes** (temps de build)
3. **Rafraîchissez** https://coopdle.onrender.com
4. **Ouvrez la console** (F12) pour vérifier
5. **Testez l'application**

---

## 📞 Si le Problème Persiste

### Informations à Collecter

1. **Message d'erreur exact** de la console (F12)
2. **Logs Render** (sur render.com → Logs)
3. **Onglet Network** (F12 → Network) - quels fichiers échouent ?

### Test de Diagnostic Rapide

Ouvrez la console et tapez :
```javascript
console.log("Test 1:", typeof screenTitle);
console.log("Test 2:", typeof startMonkey);
console.log("Test 3:", document.getElementById("screen-title"));
```

Si vous voyez `undefined` pour l'un d'eux, c'est là qu'est le problème.

---

## ✅ Résumé des Corrections

| Problème | Solution | Fichier |
|----------|----------|---------|
| `startMonkey` appelé trop tôt | Déplacé dans callback WebSocket | main.js |
| Ordre de déclaration | Fonctions définies avant utilisation | main.js |
| Check `typeof` inutile | Simplifié les appels | main.js |

---

## 🎉 Après la Correction

Votre application devrait :
- ✅ Afficher la page d'accueil
- ✅ Permettre de jouer en solo/coop
- ✅ Afficher le singe 🐵 après 5-10 secondes
- ✅ Fonctionner sans erreurs dans la console

---

**Déployez les corrections et testez ! 🚀**
