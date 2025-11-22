# 🎯 GUIDE D'INSTALLATION ULTRA-SIMPLE

## ⚠️ AVANT DE COMMENCER

Tu vas créer ce projet en 3 GRANDES ÉTAPES:
1. ✅ Installer le Backend (le serveur)
2. ✅ Installer le Frontend (l'app mobile) 
3. ✅ Tester que tout marche

---

## 📋 CE QU'IL TE FAUT SUR TON PC

Vérifie que tu as installé:
- [ ] Node.js (version 18 ou plus) → https://nodejs.org
- [ ] MySQL (version 8) → https://dev.mysql.com/downloads/installer/
- [ ] Git → https://git-scm.com/downloads
- [ ] VS Code (ou un autre éditeur) → https://code.visualstudio.com

**Test si c'est installé:**
```bash
node --version     # Doit afficher: v18.x.x ou plus
npm --version      # Doit afficher: 9.x.x ou plus
mysql --version    # Doit afficher: 8.x.x
git --version      # Doit afficher: 2.x.x
```

Si un de ces trucs ne marche pas → **INSTALLE-LE D'ABORD** avant de continuer !

---

## 🚀 ÉTAPE 1 : INSTALLER LE BACKEND (30 minutes)

### 1.1 - Télécharger le code

**Option A: Depuis ce dossier (si tu l'as déjà)**
```bash
# Ouvre ton terminal
# Va dans le dossier du projet
cd /chemin/vers/facture-app-starter
```

**Option B: Créer à partir de zéro**
```bash
# Crée un nouveau dossier
mkdir facture-app
cd facture-app

# Copie tous les fichiers du backend que je t'ai donné
```

### 1.2 - Installer les packages Node.js

```bash
# Va dans le dossier backend
cd backend

# Installe TOUT ce qui est nécessaire (ça va télécharger plein de trucs)
npm install

# Attends que ça finisse (2-3 minutes)
# Tu vas voir plein de lignes défiler, c'est NORMAL
```

✅ **Résultat attendu:** Un nouveau dossier `node_modules` est créé

### 1.3 - Configurer MySQL

**A. Démarre MySQL sur ton PC**

Windows:
```bash
# Ouvre les Services Windows et démarre MySQL
# OU
net start MySQL
```

Mac:
```bash
mysql.server start
```

Linux:
```bash
sudo service mysql start
```

**B. Crée un fichier .env**

```bash
# Copie le fichier exemple
cp .env.example .env

# Ouvre .env avec ton éditeur
# Sur Windows:
notepad .env

# Sur Mac/Linux:
nano .env
```

**C. Change ces lignes dans .env:**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TON_MOT_DE_PASSE_MYSQL    ← CHANGE ICI !
DB_NAME=facture_db
DB_PORT=3306

JWT_SECRET=mon_super_secret_123456789   ← Change aussi ici
JWT_EXPIRE=7d

PORT=3000
NODE_ENV=development
```

**Important:**
- Remplace `TON_MOT_DE_PASSE_MYSQL` par ton vrai mot de passe MySQL
- Sauvegarde et ferme le fichier

### 1.4 - Créer la base de données

```bash
# Lance cette commande magique qui crée TOUT
npm run setup-db
```

✅ **Tu dois voir:**
```
🔧 Configuration de la base de données...
✅ Connexion à MySQL réussie
✅ Base de données facture_db créée
✅ Table users créée
✅ Table clients créée
✅ Table factures créée
✅ Table paiements créée
✅ Table notifications créée
🎉 Base de données configurée avec succès!
```

❌ **Si tu vois une erreur:**
- Vérifie que MySQL est démarré
- Vérifie ton mot de passe dans .env
- Vérifie que le port 3306 est libre

### 1.5 - Démarrer le serveur

```bash
# Lance le serveur
npm run dev
```

✅ **Tu dois voir:**
```
🚀 =====================================
   Serveur démarré sur le port 3000
   =====================================
   📍 API: http://localhost:3000
   📚 Docs: http://localhost:3000/
   =====================================
```

**TEST: Ouvre ton navigateur et va sur:**
```
http://localhost:3000
```

Tu dois voir un message JSON avec "success": true

✅ **BRAVO ! Le backend marche !** 

**LAISSE CETTE FENÊTRE OUVERTE** (le serveur tourne)

---

## 📱 ÉTAPE 2 : INSTALLER LE FRONTEND (1 heure)

### 2.1 - Ouvrir un NOUVEAU terminal

**Important:** Ne ferme PAS le terminal du backend !

**Ouvre un DEUXIÈME terminal** pour le frontend.

### 2.2 - Option A: React Native CLI (Plus complexe)

```bash
# Va dans le dossier mobile
cd /chemin/vers/facture-app/mobile

# Installe les dépendances
npm install

# Android
npx react-native run-android

# iOS (Mac uniquement)
cd ios && pod install && cd ..
npx react-native run-ios
```

### 2.2 - Option B: Expo (Plus simple - RECOMMANDÉ)

**Je vais te créer un projet Expo simple:**

```bash
# Dans un nouveau terminal
cd facture-app

# Crée un projet Expo
npx create-expo-app mobile

# Va dans le dossier
cd mobile

# Lance l'app
npm start
```

**Ensuite:**
1. Scanne le QR code avec ton téléphone
2. Télécharge "Expo Go" sur ton téléphone
3. L'app s'ouvre automatiquement

---

## 🧪 ÉTAPE 3 : TESTER QUE TOUT MARCHE

### Test 1: Inscription d'un utilisateur

**Dans un nouveau terminal:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test Commerçant",
    "email": "test@test.com",
    "motDePasse": "test123",
    "role": "commercant",
    "telephone": "+2250123456789"
  }'
```

✅ **Tu dois recevoir:**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "token": "eyJhbGci...",
    "user": {...}
  }
}
```

### Test 2: Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "motDePasse": "test123"
  }'
```

### Test 3: Avec Postman (Plus facile)

1. Télécharge Postman: https://www.postman.com/downloads/
2. Crée une collection "Facture App"
3. Teste chaque endpoint du README

---

## ❓ EN CAS DE PROBLÈME

### Le serveur ne démarre pas

```bash
# Vérifie que le port 3000 est libre
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# Si occupé, tue le processus ou change le PORT dans .env
```

### Erreur "Cannot connect to MySQL"

1. Vérifie que MySQL est démarré
2. Vérifie le mot de passe dans .env
3. Essaye de te connecter manuellement:
```bash
mysql -u root -p
# Entre ton mot de passe
```

### Erreur "npm install" échoue

```bash
# Supprime node_modules et recommence
rm -rf node_modules
npm cache clean --force
npm install
```

### Le frontend ne se connecte pas au backend

1. Vérifie que le backend tourne (http://localhost:3000)
2. Change l'URL dans le code mobile:
   - Android émulateur: `http://10.0.2.2:3000`
   - iPhone: `http://TON_IP:3000` (trouve ton IP avec `ipconfig`)

---

## 📝 CHECKLIST FINALE

Avant de soumettre ton projet, vérifie:

- [ ] Le backend démarre sans erreur
- [ ] La base de données est créée
- [ ] Tu peux t'inscrire et te connecter
- [ ] Les factures se créent
- [ ] Les paiements fonctionnent
- [ ] Le frontend affiche les données
- [ ] Le code est commenté
- [ ] Le README est à jour
- [ ] Les diagrammes UML sont inclus
- [ ] Tout est sur GitHub ou dans un ZIP

---

## 🎉 TU AS FINI !

Félicitations ! Ton application fonctionne !

**Pour soumettre:**

1. Crée un repo GitHub privé ou public
2. Push tout ton code:
```bash
git init
git add .
git commit -m "Application de gestion de factures - MVP complet"
git remote add origin https://github.com/TON-USERNAME/facture-app.git
git push -u origin main
```

3. Partage le lien du repo

**OU**

1. Crée un ZIP de tout le dossier
2. Nomme-le: `CRAJ_FullMargin_DEVTEST.zip`
3. Envoie-le par email

---

## 💡 CONSEILS DERNIÈRE MINUTE

- **Code propre:** Commente ton code en français
- **Commits réguliers:** Commit toutes les 2-3 heures
- **Tests:** Teste chaque fonctionnalité
- **Documentation:** Explique tes choix techniques
- **Screenshots:** Prends des captures d'écran de l'app

**Questions ?** Relis les README dans chaque dossier.

**BONNE CHANCE !** 🚀
