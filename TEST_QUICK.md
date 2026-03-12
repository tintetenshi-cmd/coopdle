# 🧪 Test Rapide - Vérification

## 🚀 Après avoir déployé la correction

### 1. Test de Base
Ouvrez : https://coopdle.onrender.com

**Vous devriez voir :**
- ✅ Page avec titre "Coopdle"
- ✅ Bouton "Jouer"
- ✅ Pas de page blanche

### 2. Test Console (IMPORTANT)
1. Appuyez sur **F12**
2. Allez dans **Console**
3. Rafraîchissez la page (**Ctrl+R**)

**Vous devriez voir ces messages :**
```
DOM loaded, starting app...
All required elements found, initializing...
All elements found, setting up app...
Setting up event listeners...
App initialization complete!
```

**Si vous voyez ces messages → ✅ SUCCÈS !**

### 3. Test Fonctionnel
1. Cliquez sur **"Jouer"**
2. Entrez un pseudo
3. Cliquez sur **"Solo"**

**Vous devriez :**
- ✅ Arriver sur l'écran de jeu
- ✅ Voir "Mode solo" en haut
- ✅ Voir la grille de jeu

---

## ❌ Si Ça Ne Marche Pas

### Page Toujours Blanche
→ Vérifiez que les fichiers sont bien déployés :
- F12 → Network → Rafraîchir
- Vérifiez que `main.js` et `index.html` sont 200 OK

### Erreurs dans la Console
→ Copiez le message d'erreur exact et cherchez dans EMERGENCY_FIX.md

### Serveur ne Répond Pas
→ Attendez 30 secondes (réveil du serveur gratuit)

---

## 📋 Checklist Rapide

- [ ] Page se charge (pas blanche)
- [ ] Console montre les messages de succès
- [ ] Bouton "Jouer" fonctionne
- [ ] Mode solo accessible
- [ ] Pas d'erreurs rouges dans la console

**Si tous les points sont ✅ → Votre app fonctionne ! 🎉**

---

## 🔄 Commandes de Déploiement

Si vous n'avez pas encore déployé :

```bash
git add public/main.js public/index.html
git commit -m "EMERGENCY FIX: Page blanche corrigée"
git push origin main
```

Attendez 2-3 minutes puis testez !