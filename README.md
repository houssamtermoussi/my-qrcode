# MY qrcode

Application web pour **générer, enregistrer, télécharger et gérer des QR codes**.
Vous saisissez un titre et un contenu (lien, texte, e-mail ou Wi-Fi) : le serveur génère l'image du QR code, l'enregistre dans une base de données MySQL et l'affiche dans un historique.

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Technologies utilisées](#technologies-utilisées)
3. [Structure du projet](#structure-du-projet)
4. [Prérequis](#prérequis)
5. [Installation pas à pas](#installation-pas-à-pas)
6. [Lancer l'application](#lancer-lapplication)
7. [Utiliser l'application](#utiliser-lapplication)
8. [API du backend](#api-du-backend)
9. [Scripts disponibles](#scripts-disponibles)
10. [Problèmes fréquents](#problèmes-fréquents)
11. [Contribuer](#contribuer)

---

## Fonctionnalités

- Génération de QR codes de 4 types : **URL**, **Texte**, **E-mail**, **Wi-Fi**
- Aperçu en direct du QR code généré
- Téléchargement du QR code au format **PNG**
- Copie du contenu du QR code dans le presse-papiers
- Historique de tous les QR codes enregistrés dans **MySQL**
- Suppression d'un QR code de l'historique
- Création automatique de la table `qrcodes` au premier lancement

## Technologies utilisées

| Partie    | Technologies                                          |
| --------- | ----------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS, Axios       |
| Backend   | Node.js, Express 5, `qrcode`, `mysql2`, `dotenv`      |
| Base de données | MySQL (ou MariaDB)                              |

## Structure du projet

```
my-qrcode/
├── package.json            # Scripts pour lancer frontend + backend ensemble
├── backend/                # API Express (port 3000)
│   ├── server.js           # Point d'entrée du serveur
│   ├── .env.example        # Modèle de configuration à copier en .env
│   ├── config/db.js        # Connexion à MySQL
│   ├── controllers/        # Logique des routes (créer, lister, supprimer)
│   ├── models/qrModel.js   # Requêtes SQL + création de la table
│   ├── routes/qrRoutes.js  # Définition des routes /api/qr
│   ├── middleware/         # Logger des requêtes
│   └── utils/              # Fonctions utilitaires
└── frontend/               # Interface React (port 5173)
    ├── index.html
    └── src/
        ├── App.tsx         # Interface principale
        └── services/api.ts # Appels vers l'API du backend
```

## Prérequis

Avant de commencer, installez sur votre machine :

- [**Git**](https://git-scm.com/downloads)
- [**Node.js**](https://nodejs.org/) version **20.19 ou plus récente** (la version LTS est recommandée). `npm` est installé avec Node.js.
- [**MySQL**](https://dev.mysql.com/downloads/) (ou [MariaDB](https://mariadb.org/download/)), ou un outil comme XAMPP / WAMP / MAMP qui inclut MySQL.

Vérifiez les installations dans un terminal :

```bash
git --version
node --version
npm --version
mysql --version
```

## Installation pas à pas

### Étape 1 : Cloner le dépôt GitHub

```bash
git clone https://github.com/houssamtermoussi/my-qrcode.git
cd my-qrcode
```

> Vous pouvez aussi cliquer sur le bouton vert **Code** puis **Download ZIP** sur GitHub, et décompresser le dossier.

### Étape 2 : Installer les dépendances

Une seule commande installe les dépendances de la racine, du backend et du frontend :

```bash
npm run install:all
```

<details>
<summary>Ou installer chaque partie manuellement</summary>

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

</details>

### Étape 3 : Créer la base de données MySQL

Démarrez MySQL, puis connectez-vous :

```bash
mysql -u root -p
```

Créez la base de données :

```sql
CREATE DATABASE myqrcode_db;
EXIT;
```

> La table `qrcodes` est créée **automatiquement** par le backend, vous n'avez pas besoin de la créer vous-même.

### Étape 4 : Configurer les variables d'environnement

Copiez le fichier modèle dans le dossier `backend` :

```bash
cp backend/.env.example backend/.env
```

> Sous Windows (invite de commandes) : `copy backend\.env.example backend\.env`

Ouvrez `backend/.env` et remplacez les valeurs par celles de votre MySQL :

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=myqrcode_db
```

| Variable      | Description                               | Valeur par défaut |
| ------------- | ----------------------------------------- | ----------------- |
| `PORT`        | Port du serveur backend                   | `3000`            |
| `DB_HOST`     | Adresse du serveur MySQL                  | `localhost`       |
| `DB_USER`     | Utilisateur MySQL                         | `root`            |
| `DB_PASSWORD` | Mot de passe MySQL                        | —                 |
| `DB_NAME`     | Nom de la base de données                 | `myqrcode_db`     |

> Le fichier `.env` contient vos mots de passe : il est ignoré par Git et ne doit **jamais** être publié sur GitHub.

## Lancer l'application

Depuis la racine du projet, lancez le backend et le frontend en même temps :

```bash
npm run dev
```

Vous devriez voir dans le terminal :

```
QR Code Backend Server is active!
Listening on: http://localhost:3000
MySQL connected
...
Local:   http://localhost:5173/
```

Ouvrez ensuite votre navigateur sur **http://localhost:5173**.

<details>
<summary>Lancer le backend et le frontend dans deux terminaux séparés</summary>

Terminal 1 (backend) :

```bash
cd backend
npm run dev
```

Terminal 2 (frontend) :

```bash
cd frontend
npm run dev
```

</details>

> Le frontend communique avec le backend sur `http://localhost:3000/api/qr`. Si vous changez le `PORT` du backend, modifiez aussi `API_BASE_URL` dans `frontend/src/services/api.ts`.

## Utiliser l'application

1. **Donner un titre** au QR code dans le champ *QR Label / Title* (par exemple : `Mon portfolio`).
2. **Choisir le type** de QR code : `URL`, `Text`, `Email` ou `Wi-Fi`.
3. **Saisir le contenu** selon le type choisi :

   | Type    | Exemple de contenu                          |
   | ------- | ------------------------------------------- |
   | URL     | `https://example.com`                       |
   | Texte   | `Bonjour tout le monde !`                   |
   | E-mail  | `hello@example.com`                         |
   | Wi-Fi   | `WIFI:S:NomDuReseau;T:WPA;P:MotDePasse;;`   |

   > Pour le Wi-Fi : `S` = nom du réseau, `T` = type de sécurité (`WPA`, `WEP` ou `nopass`), `P` = mot de passe.

4. Cliquer sur **Generate & Save to Database**. Le QR code apparaît dans la zone **Live Preview**.
5. Dans l'aperçu, vous pouvez :
   - **Download PNG** : télécharger l'image du QR code ;
   - **Copy Value** : copier le contenu du QR code.
6. La section **Database History** affiche tous les QR codes enregistrés :
   - cliquer sur une carte pour l'afficher dans l'aperçu ;
   - icône de téléchargement pour récupérer le PNG ;
   - icône de corbeille pour le supprimer ;
   - bouton d'actualisation pour recharger la liste depuis la base de données.

## API du backend

URL de base : `http://localhost:3000/api/qr`

| Méthode  | Route          | Description                         |
| -------- | -------------- | ----------------------------------- |
| `GET`    | `/api/qr`      | Lister tous les QR codes            |
| `POST`   | `/api/qr`      | Créer et enregistrer un QR code     |
| `DELETE` | `/api/qr/:id`  | Supprimer un QR code par son `id`   |

Exemple de création avec `curl` :

```bash
curl -X POST http://localhost:3000/api/qr \
  -H "Content-Type: application/json" \
  -d '{"title": "Mon site", "type": "url", "content": "https://example.com"}'
```

Réponse :

```json
{
  "success": true,
  "message": "QR Code created successfully",
  "data": {
    "id": 1,
    "title": "Mon site",
    "type": "url",
    "content": "https://example.com",
    "qr_image": "data:image/png;base64,...",
    "created_at": "2026-10-12T16:30:00.000Z"
  }
}
```

## Scripts disponibles

| Où          | Commande              | Action                                              |
| ----------- | --------------------- | --------------------------------------------------- |
| Racine      | `npm run install:all` | Installe toutes les dépendances                     |
| Racine      | `npm run dev`         | Lance le backend et le frontend ensemble            |
| `backend/`  | `npm run dev`         | Lance le backend avec rechargement auto (nodemon)   |
| `backend/`  | `npm start`           | Lance le backend en mode normal                     |
| `frontend/` | `npm run dev`         | Lance le frontend en mode développement             |
| `frontend/` | `npm run build`       | Crée la version de production dans `frontend/dist`  |
| `frontend/` | `npm run preview`     | Prévisualise la version de production               |
| `frontend/` | `npm run lint`        | Vérifie le code avec ESLint                         |

## Problèmes fréquents

**Le message « Could not connect to the backend database » s'affiche**
- Vérifiez que le backend tourne bien sur `http://localhost:3000`.
- Vérifiez que MySQL est démarré.
- Vérifiez les informations de connexion dans `backend/.env`.

**`ER_BAD_DB_ERROR` : la base de données n'existe pas**
- Créez-la avec `CREATE DATABASE myqrcode_db;` (voir l'étape 3).

**`ER_ACCESS_DENIED_ERROR` : accès refusé**
- L'utilisateur ou le mot de passe MySQL dans `backend/.env` est incorrect.

**`ECONNREFUSED` sur le port 3306**
- MySQL n'est pas démarré, ou il écoute sur un autre port/adresse.

**`EADDRINUSE` : le port 3000 ou 5173 est déjà utilisé**
- Fermez l'application qui utilise ce port, ou changez `PORT` dans `backend/.env` (et `API_BASE_URL` dans `frontend/src/services/api.ts`).

**Erreur au lancement de Vite**
- Vérifiez votre version de Node.js avec `node --version` (20.19 minimum).

## Contribuer

1. Forkez le dépôt sur GitHub.
2. Créez une branche : `git checkout -b ma-fonctionnalite`
3. Faites vos modifications puis commitez : `git commit -m "Ajout de ma fonctionnalité"`
4. Poussez la branche : `git push origin ma-fonctionnalite`
5. Ouvrez une **Pull Request** sur GitHub.
