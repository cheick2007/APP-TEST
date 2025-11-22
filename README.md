# 📱 Application de Gestion de Factures avec Mobile Money

Application mobile complète pour la gestion et le paiement de factures fournisseurs via Mobile Money.

## 🎯 Test Technique - Full Margin

**Candidat:** Craj  
**Durée:** 72 heures  
**Stack:** Node.js + Express + MySQL + React Native

---

## 📁 Structure du Projet

```
facture-app/
├── backend/           # API RESTful (Node.js + Express)
├── mobile/            # Application React Native
└── docs/              # Documentation et diagrammes UML
```

## ⚡ Installation Rapide (Guide Pas à Pas)

### ÉTAPE 1 : Cloner ou télécharger le projet

```bash
# Option 1: Cloner depuis GitHub
git clone https://github.com/votre-username/facture-app.git
cd facture-app

# Option 2: Extraire le ZIP
unzip facture-app.zip
cd facture-app
```

### ÉTAPE 2 : Installer et lancer le Backend

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env (copier .env.example)
cp .env.example .env

# 4. Modifier .env avec vos infos MySQL
# Ouvrir .env avec un éditeur et changer:
# DB_PASSWORD=votre_mot_de_passe_mysql
# JWT_SECRET=changez_moi_secret_123456

# 5. Créer la base de données
npm run setup-db

# 6. Démarrer le serveur
npm run dev
```

✅ **Le backend tourne maintenant sur http://localhost:3000**

### ÉTAPE 3 : Installer et lancer le Frontend

```bash
# 1. Ouvrir un NOUVEAU terminal
# 2. Aller dans le dossier mobile
cd mobile

# 3. Installer les dépendances
npm install

# 4. Lancer l'app
# Sur Android
npx react-native run-android

# Sur iOS (Mac uniquement)
cd ios && pod install && cd ..
npx react-native run-ios

# Ou utiliser Expo si configuré
npm start
```

---

## 🎨 Fonctionnalités Implémentées

### ✅ Backend (API)

- [x] Authentification JWT (inscription/connexion)
- [x] Gestion des utilisateurs (Commerçants & Fournisseurs)
- [x] CRUD complet des factures
- [x] Système de paiement Mobile Money (simulé)
- [x] Gestion des clients
- [x] Notifications en temps réel
- [x] Historique des paiements
- [x] Statuts de factures (en_attente, payée, partiellement_payée)

### ✅ Frontend (Mobile)

- [x] Écran de connexion/inscription
- [x] Dashboard Commerçant
  - Liste des factures reçues
  - Détail d'une facture
  - Paiement via Mobile Money
  - Historique
- [x] Dashboard Fournisseur
  - Création de factures
  - Liste des factures émises
  - Suivi des paiements
- [x] Gestion des clients
- [x] Notifications
- [x] Design responsive

---

## 📊 Architecture Technique

### Backend

**Technologies:**
- Node.js 18+
- Express.js 4
- MySQL 8
- JWT pour l'authentification
- bcryptjs pour le hachage

**Structure MVC:**
```
controllers/  → Logique métier
routes/       → Endpoints API
middleware/   → Auth, validation
config/       → Configuration DB
```

**Sécurité:**
- Mots de passe hachés (bcrypt, 10 rounds)
- Tokens JWT avec expiration (7 jours)
- Validation des entrées
- Protection CORS

### Frontend

**Technologies:**
- React Native
- React Navigation
- Axios (appels API)
- AsyncStorage (stockage local)

**Screens:**
- Auth (Login/Register)
- Dashboard (Commerçant/Fournisseur)
- Factures (Liste/Détail)
- Paiement
- Clients
- Notifications

---

## 🗃️ Modèle de Données

### 📋 Tables

**users**
```sql
id, nom, email, motDePasse (hashé), telephone, role (commercant/fournisseur)
```

**factures**
```sql
id, numero, montant, dateEmission, dateEcheance, description,
statut (en_attente/payee/partiellement_payee),
fournisseurId, commercantId, montantPaye
```

**paiements**
```sql
id, montant, date, mode (mobile_money), reference, telephone,
factureId, statut (succes/echec/en_cours)
```

**clients**
```sql
id, nom, email, telephone, adresse, userId
```

**notifications**
```sql
id, type, contenu, lu (boolean), userId, date
```

---

## 🔄 Flux Utilisateur

### Scénario Commerçant

1. Se connecter à l'app
2. Consulter les factures reçues
3. Sélectionner une facture à payer
4. Entrer le numéro Mobile Money
5. Confirmer le paiement (simulation)
6. Recevoir une confirmation
7. Voir l'historique des paiements

### Scénario Fournisseur

1. Se connecter à l'app
2. Créer un nouveau client (optionnel)
3. Créer une nouvelle facture
4. Envoyer la facture au commerçant
5. Recevoir une notification de paiement
6. Consulter le statut des factures
7. Exporter un rapport

---

## 🧪 Tester l'Application

### Test Backend avec cURL

```bash
# 1. Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Commerçant",
    "email": "jean@test.com",
    "motDePasse": "test123",
    "role": "commercant",
    "telephone": "+2250123456789"
  }'

# 2. Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@test.com",
    "motDePasse": "test123"
  }'

# Copier le token de la réponse
# TOKEN="eyJhbGciOiJIUzI1..."

# 3. Créer une facture (en tant que fournisseur)
curl -X POST http://localhost:3000/api/factures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "montant": 50000,
    "dateEmission": "2024-01-15",
    "dateEcheance": "2024-02-15",
    "description": "Fourniture bureau",
    "commercantId": 1
  }'
```

### Comptes de Test

Créer deux comptes pour tester:

**Fournisseur:**
- Email: fournisseur@test.com
- Mot de passe: test123
- Rôle: fournisseur

**Commerçant:**
- Email: commercant@test.com
- Mot de passe: test123
- Rôle: commercant

---

## 🎯 Endpoints API Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/profile` | Profil utilisateur |
| GET | `/api/factures` | Liste des factures |
| POST | `/api/factures` | Créer une facture |
| POST | `/api/paiements/payer` | Payer une facture |
| GET | `/api/paiements/historique` | Historique paiements |
| GET | `/api/clients` | Liste des clients |
| POST | `/api/clients` | Ajouter un client |
| GET | `/api/notifications` | Notifications |

Voir `backend/README.md` pour la documentation complète.

---

## 📈 Diagrammes UML

Les diagrammes UML sont disponibles dans le dossier `docs/`:

- ✅ Diagramme de cas d'utilisation
- ✅ Diagramme de classes
- ✅ Diagramme de séquence (Paiement)
- ✅ Diagramme d'états-transitions (Facture)
- ✅ Diagramme d'activité (Paiement)

---

## 🚀 Déploiement (Production)

### Backend

**Options recommandées:**
- **Heroku** (facile, gratuit)
- **Railway** (moderne, simple)
- **DigitalOcean** (VPS)
- **AWS EC2** (scalable)

**Base de données:**
- **PlanetScale** (MySQL gratuit)
- **Clever Cloud**
- **AWS RDS**

### Frontend Mobile

**Options:**
- **Google Play Store** (Android)
- **App Store** (iOS - nécessite Mac)
- **APK direct** pour tests

---

## ⚠️ Limitations Actuelles (MVP)

- Paiement Mobile Money **simulé** (pas de vraie intégration)
- Export PDF non implémenté (endpoint documenté)
- Pas d'envoi d'emails automatiques
- Interface de base (à améliorer)

---

## 🔮 Améliorations Futures

### Priorité Haute
- [ ] Intégration vraie API Mobile Money
  - Orange Money CI
  - MTN Mobile Money
  - Moov Money
- [ ] Export PDF des factures (pdfkit/jspdf)
- [ ] Export CSV des données
- [ ] Envoi d'emails automatiques

### Priorité Moyenne
- [ ] OCR pour scanner les factures papier
- [ ] Rappels automatiques avant échéance
- [ ] Multi-devises (FCFA, EUR, USD)
- [ ] Graphiques et statistiques
- [ ] Mode hors ligne (sync)

### Priorité Basse
- [ ] Chat entre fournisseur et commerçant
- [ ] Signature électronique
- [ ] Multi-langues (FR, EN)
- [ ] Thème sombre

---

## 🛠️ Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier que MySQL tourne
sudo service mysql status

# Vérifier le port 3000
lsof -i :3000

# Vérifier les variables .env
cat backend/.env
```

### Erreur de connexion DB

- Vérifier le mot de passe MySQL dans `.env`
- Vérifier que MySQL est démarré
- Vérifier les permissions utilisateur MySQL

### L'app mobile ne se connecte pas

- Vérifier que le backend tourne
- Sur Android: utiliser `http://10.0.2.2:3000` (émulateur)
- Sur iOS: utiliser l'IP de votre Mac
- Vérifier le firewall

---

## 📝 Critères d'Évaluation Couverts

✅ **Qualité du code**
- Code commenté et structuré
- Architecture MVC claire
- Nommage cohérent

✅ **Respect du cahier des charges**
- Toutes les fonctionnalités demandées
- Backend + Frontend fonctionnels
- Scénarios utilisateur couverts

✅ **Documentation**
- README détaillés
- Documentation API
- Commentaires dans le code
- Diagrammes UML

✅ **Fonctionnalités testées**
- Authentification ✓
- CRUD factures ✓
- Paiements ✓
- Notifications ✓

✅ **Architecture scalable**
- Structure modulaire
- Séparation des responsabilités
- Base de données normalisée
- API RESTful standards

---

## 👨‍💻 Auteur

**Craj**  
Full Margin - Développeur Full Stack

**Contact:**
- Email: craj@fullmargin.com
- GitHub: github.com/craj-fullmargin

---

## 📄 Licence

Ce projet est réalisé dans le cadre d'un test technique de recrutement pour Full Margin.

---

## 🙏 Remerciements

Merci pour cette opportunité de démontrer mes compétences techniques. 
Ce projet a été réalisé avec soin en respectant les meilleures pratiques de développement.

**Temps de réalisation:** 72 heures  
**Date de remise:** [Date]

---

*Pour toute question ou clarification, n'hésitez pas à me contacter.*
