# Backend - Application de Gestion de Factures

API RESTful pour la gestion et le paiement de factures fournisseurs via mobile money.

## 🛠️ Technologies Utilisées

- **Node.js** + **Express** - Serveur API
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- MySQL (v8 ou supérieur)
- npm ou yarn

## 🚀 Installation

### Étape 1 : Installer les dépendances

```bash
cd backend
npm install
```

### Étape 2 : Configuration de l'environnement

1. Copier le fichier `.env.example` vers `.env`:
```bash
cp .env.example .env
```

2. Modifier le fichier `.env` avec vos informations:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=facture_db
DB_PORT=3306

JWT_SECRET=changez_moi_par_un_secret_securise_123456
JWT_EXPIRE=7d

PORT=3000
NODE_ENV=development
```

### Étape 3 : Créer la base de données

```bash
npm run setup-db
```

Cette commande va :
- Créer la base de données
- Créer toutes les tables nécessaires
- Configurer les relations

### Étape 4 : Démarrer le serveur

**Mode développement** (avec rechargement automatique):
```bash
npm run dev
```

**Mode production**:
```bash
npm start
```

Le serveur démarre sur : `http://localhost:3000`

## 📡 Endpoints API

### Authentification

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "motDePasse": "motdepasse123",
  "telephone": "+2250123456789",
  "role": "commercant"  // ou "fournisseur"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "motDePasse": "motdepasse123"
}
```

Réponse:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nom": "Jean Dupont",
      "email": "jean@example.com",
      "role": "commercant"
    }
  }
}
```

#### Profil utilisateur
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### Factures

#### Créer une facture (Fournisseur uniquement)
```http
POST /api/factures
Authorization: Bearer {token}
Content-Type: application/json

{
  "montant": 50000,
  "dateEmission": "2024-01-15",
  "dateEcheance": "2024-02-15",
  "description": "Fourniture de matériel informatique",
  "commercantId": 2
}
```

#### Lister toutes les factures
```http
GET /api/factures
Authorization: Bearer {token}

# Filtrer par statut
GET /api/factures?statut=en_attente
GET /api/factures?statut=payee
```

#### Détails d'une facture
```http
GET /api/factures/{id}
Authorization: Bearer {token}
```

#### Mettre à jour une facture
```http
PUT /api/factures/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "montant": 55000,
  "description": "Description mise à jour"
}
```

#### Supprimer une facture
```http
DELETE /api/factures/{id}
Authorization: Bearer {token}
```

### Paiements

#### Payer une facture
```http
POST /api/paiements/payer
Authorization: Bearer {token}
Content-Type: application/json

{
  "factureId": 1,
  "montant": 25000,
  "telephone": "+2250123456789"
}
```

Réponse (simulation Mobile Money):
```json
{
  "success": true,
  "message": "Paiement effectué avec succès",
  "data": {
    "paiementId": 1,
    "reference": "MM1705847239123",
    "montant": 25000,
    "nouveauStatut": "partiellement_payee",
    "montantRestant": 25000
  }
}
```

#### Historique des paiements
```http
GET /api/paiements/historique
Authorization: Bearer {token}
```

#### Paiements d'une facture
```http
GET /api/paiements/facture/{factureId}
Authorization: Bearer {token}
```

### Clients

#### Ajouter un client
```http
POST /api/clients
Authorization: Bearer {token}
Content-Type: application/json

{
  "nom": "Restaurant Le Palmier",
  "email": "contact@lepalmier.com",
  "telephone": "+2250198765432",
  "adresse": "Abidjan, Cocody"
}
```

#### Lister les clients
```http
GET /api/clients
Authorization: Bearer {token}
```

### Notifications

#### Obtenir les notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Marquer comme lue
```http
PUT /api/notifications/{id}/lire
Authorization: Bearer {token}
```

#### Marquer toutes comme lues
```http
PUT /api/notifications/lire-toutes
Authorization: Bearer {token}
```

## 🏗️ Architecture du Code

```
backend/
├── config/
│   └── database.js          # Configuration MySQL
├── controllers/
│   ├── authController.js    # Logique d'authentification
│   ├── factureController.js # Gestion des factures
│   ├── paiementController.js # Gestion des paiements
│   ├── clientController.js  # Gestion des clients
│   └── notificationController.js
├── middleware/
│   └── auth.js              # Middleware JWT
├── routes/
│   ├── authRoutes.js
│   ├── factureRoutes.js
│   ├── paiementRoutes.js
│   ├── clientRoutes.js
│   └── notificationRoutes.js
├── server.js                 # Point d'entrée
├── setup-database.js         # Script de configuration DB
├── package.json
└── .env                      # Variables d'environnement
```

## 🔒 Sécurité

- Mots de passe hachés avec bcryptjs (10 rounds)
- Authentification JWT avec expiration
- Validation des entrées utilisateur
- Protection CORS configurée
- Variables sensibles dans .env

## 💳 Simulation Mobile Money

Le paiement Mobile Money est actuellement simulé:
- Délai de 2 secondes pour simuler le traitement
- 95% de taux de succès
- Génération d'une référence unique

Pour une vraie intégration, remplacer la fonction `simulerMobileMoney` dans `paiementController.js` par les appels aux APIs de:
- Orange Money
- MTN Mobile Money
- Moov Money

## 🧪 Test de l'API

### Avec cURL:

```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test User","email":"test@test.com","motDePasse":"test123","role":"commercant"}'

# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","motDePasse":"test123"}'
```

### Avec Postman ou Thunder Client:

1. Importer la collection d'endpoints ci-dessus
2. Créer une variable d'environnement `token`
3. Tester chaque endpoint

## 📊 Modèle de Données

### Users
- id, nom, email, motDePasse, telephone, role, createdAt, updatedAt

### Factures
- id, numero, montant, dateEmission, dateEcheance, description, statut, fournisseurId, commercantId, montantPaye

### Paiements
- id, montant, date, mode, reference, telephone, factureId, statut

### Clients
- id, nom, email, telephone, adresse, userId

### Notifications
- id, type, contenu, lu, userId, createdAt

## 🚀 Améliorations Futures

- [ ] Vraie intégration Mobile Money (Orange, MTN, Moov)
- [ ] Export PDF des factures (pdfkit)
- [ ] Export CSV des données
- [ ] Rate limiting pour la sécurité
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
- [ ] Gestion des pièces jointes
- [ ] Envoi d'emails automatiques
- [ ] Webhooks pour les événements

## 📝 Notes pour le Test

- Code commenté et structuré selon MVC
- Gestion des erreurs complète
- Endpoints RESTful standards
- Sécurité implémentée (hash, JWT)
- Base de données normalisée
- Simulation Mobile Money fonctionnelle

## 👤 Auteur

**Craj - Full Margin**

Test technique de recrutement - Développeur Frontend & Backend
