# Coop Wordle

Application web de type Wordle jouable en solo ou en coop (plusieurs joueurs sur le même mot), avec rooms partageables.

## Fonctionnalités

- Mode **solo** : un mot aléatoire entre 2 et 10 lettres, 6 essais.
- Mode **coop** : plusieurs joueurs se connectent à la même room via un lien à partager, la grille est synchronisée.
- Retour visuel façon Wordle :
  - lettre bien placée,
  - lettre présente mais mal placée,
  - lettre absente.
- À chaque **nouvelle partie**, un nouveau mot est généré.
- UI épurée **noir / violet**, responsive.

## Lancer le projet

Assurez-vous d'avoir **Node.js** installé.

```bash
cd c:\Users\MALE\Projets\Cursor
npm install
npm run dev
```

Le serveur démarre par défaut sur `http://localhost:3000`.

## Hébergement en ligne (Render)

Ce projet contient un fichier `render.yaml` pour un déploiement automatique sur [Render](https://render.com).

Étapes minimales :

1. Crée un dépôt Git (ex. sur GitHub) avec ce projet.
2. Crée un compte gratuit sur Render, clique sur **New > Web Service** puis choisis ton dépôt.
3. Render détectera automatiquement `render.yaml` et configurera le service ; clique sur **Create Web Service** puis attends la fin du build.

Tu obtiendras une URL publique du type `https://coop-wordle.onrender.com` accessible par n’importe qui sur Internet.

## Utilisation

- Ouvrez `http://localhost:3000` dans votre navigateur.
- Cliquez sur **Jouer**, puis choisissez :
  - **Solo** pour jouer seul.
  - **Coop** pour créer une room coopérative.
- En mode coop :
  - Un identifiant de room est généré.
  - Un **lien de partage** est affiché ; envoyez-le à votre coéquipier.
  - Dès qu'il ouvre ce lien, il rejoint la même room et voit la même grille.
- Chaque partie :
  - Vous avez **6 essais** pour trouver le mot mystère.
  - Le bouton **Nouvelle partie** relance une partie dans la même room avec un nouveau mot.

