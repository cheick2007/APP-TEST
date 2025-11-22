# 📚 DOCUMENTATION COMPLÈTE DE L'API

**Base URL:** `http://localhost:3000/api`  
**Format:** JSON  
**Authentification:** JWT Bearer Token

---

## 🔐 AUTHENTIFICATION

### 1. Inscription (Register)

Créer un nouveau compte utilisateur.

**Endpoint:** `POST /auth/register`  
**Authentification:** Non requise

**Body:**
```json
{
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "motDePasse": "motdepasse123",
  "telephone": "+2250123456789",
  "role": "commercant"
}
```

**Champs:**
- `nom` (string, requis): Nom complet
- `email` (string, requis): Email unique
- `motDePasse` (string, requis): Min 6 caractères
- `telephone` (string, optionnel): Format international
- `role` (enum, requis): "commercant" ou "fournisseur"

**Réponse Success (201):**
```json
{
  "success": true,
  "message": "Inscription réussie",
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

**Erreurs possibles:**
- `400` - Email déjà utilisé
- `400` - Champs manquants
- `500` - Erreur serveur

---

### 2. Connexion (Login)

Se connecter avec un compte existant.

**Endpoint:** `POST /auth/login`  
**Authentification:** Non requise

**Body:**
```json
{
  "email": "jean@example.com",
  "motDePasse": "motdepasse123"
}
```

**Réponse Success (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nom": "Jean Dupont",
      "email": "jean@example.com",
      "role": "commercant",
      "telephone": "+2250123456789"
    }
  }
}
```

**Erreurs:**
- `401` - Email ou mot de passe incorrect
- `500` - Erreur serveur

---

### 3. Profil Utilisateur

Obtenir les informations de l'utilisateur connecté.

**Endpoint:** `GET /auth/profile`  
**Authentification:** ✅ Requise

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Jean Dupont",
    "email": "jean@example.com",
    "telephone": "+2250123456789",
    "role": "commercant",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Erreurs:**
- `401` - Token manquant ou invalide
- `404` - Utilisateur non trouvé

---

## 📄 FACTURES

### 1. Créer une Facture

Créer une nouvelle facture (Fournisseur uniquement).

**Endpoint:** `POST /factures`  
**Authentification:** ✅ Requise (Fournisseur)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "montant": 50000,
  "dateEmission": "2024-01-15",
  "dateEcheance": "2024-02-15",
  "description": "Fourniture de matériel informatique",
  "commercantId": 2
}
```

**Champs:**
- `montant` (number, requis): Montant en FCFA
- `dateEmission` (date, requis): Format YYYY-MM-DD
- `dateEcheance` (date, requis): Format YYYY-MM-DD
- `description` (string, optionnel): Description de la facture
- `commercantId` (number, requis): ID du commerçant destinataire

**Réponse Success (201):**
```json
{
  "success": true,
  "message": "Facture créée avec succès",
  "data": {
    "id": 1,
    "numero": "FACT-1705847239-123",
    "montant": 50000,
    "dateEmission": "2024-01-15",
    "dateEcheance": "2024-02-15",
    "statut": "en_attente"
  }
}
```

**Erreurs:**
- `400` - Champs manquants
- `403` - Seuls les fournisseurs peuvent créer des factures
- `404` - Commerçant non trouvé

---

### 2. Lister les Factures

Obtenir toutes les factures de l'utilisateur.

**Endpoint:** `GET /factures`  
**Authentification:** ✅ Requise

**Query Parameters (optionnels):**
- `statut` (string): Filtrer par statut
  - `en_attente`
  - `payee`
  - `partiellement_payee`

**Exemples:**
```
GET /api/factures
GET /api/factures?statut=en_attente
GET /api/factures?statut=payee
```

**Réponse Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero": "FACT-1705847239-123",
      "montant": 50000,
      "dateEmission": "2024-01-15",
      "dateEcheance": "2024-02-15",
      "description": "Fourniture matériel",
      "statut": "en_attente",
      "fournisseurId": 1,
      "commercantId": 2,
      "montantPaye": 0,
      "fournisseurNom": "Fournisseur ABC",
      "commercantNom": "Commerce XYZ",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "numero": "FACT-1705847240-456",
      "montant": 75000,
      "statut": "payee",
      "montantPaye": 75000,
      ...
    }
  ]
}
```

**Note:** 
- Un fournisseur voit les factures qu'il a créées
- Un commerçant voit les factures qu'il a reçues

---

### 3. Détails d'une Facture

Obtenir les détails complets d'une facture.

**Endpoint:** `GET /factures/{id}`  
**Authentification:** ✅ Requise

**Réponse Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero": "FACT-1705847239-123",
    "montant": 50000,
    "dateEmission": "2024-01-15",
    "dateEcheance": "2024-02-15",
    "description": "Fourniture matériel",
    "statut": "partiellement_payee",
    "montantPaye": 20000,
    "fournisseurNom": "Fournisseur ABC",
    "fournisseurEmail": "fournisseur@example.com",
    "fournisseurTel": "+2250123456789",
    "commercantNom": "Commerce XYZ",
    "commercantEmail": "commerce@example.com",
    "commercantTel": "+2250987654321",
    "paiements": [
      {
        "id": 1,
        "montant": 20000,
        "date": "2024-01-20T14:30:00.000Z",
        "mode": "mobile_money",
        "reference": "MM1705847239123",
        "telephone": "+2250987654321",
        "statut": "succes"
      }
    ]
  }
}
```

**Erreurs:**
- `404` - Facture non trouvée ou non autorisée

---

### 4. Mettre à Jour une Facture

Modifier une facture existante (Fournisseur uniquement).

**Endpoint:** `PUT /factures/{id}`  
**Authentification:** ✅ Requise (Fournisseur)

**Body:**
```json
{
  "montant": 55000,
  "dateEcheance": "2024-02-20",
  "description": "Description mise à jour"
}
```

**Note:** Seules les factures "en_attente" peuvent être modifiées.

**Réponse Success (200):**
```json
{
  "success": true,
  "message": "Facture mise à jour avec succès"
}
```

**Erreurs:**
- `400` - Impossible de modifier une facture payée
- `404` - Facture non trouvée

---

### 5. Supprimer une Facture

Supprimer une facture (Fournisseur uniquement).

**Endpoint:** `DELETE /factures/{id}`  
**Authentification:** ✅ Requise (Fournisseur)

**Note:** Seules les factures "en_attente" peuvent être supprimées.

**Réponse Success (200):**
```json
{
  "success": true,
  "message": "Facture supprimée avec succès"
}
```

**Erreurs:**
- `400` - Impossible de supprimer une facture payée
- `404` - Facture non trouvée

---

## 💳 PAIEMENTS

### 1. Payer une Facture

Effectuer un paiement sur une facture (Commerçant uniquement).

**Endpoint:** `POST /paiements/payer`  
**Authentification:** ✅ Requise (Commerçant)

**Body:**
```json
{
  "factureId": 1,
  "montant": 25000,
  "telephone": "+2250123456789"
}
```

**Champs:**
- `factureId` (number, requis): ID de la facture à payer
- `montant` (number, requis): Montant à payer
- `telephone` (string, requis): Numéro Mobile Money

**Processus:**
1. Validation de la facture
2. Simulation de paiement Mobile Money (2 secondes)
3. Mise à jour du statut de la facture
4. Notification au fournisseur

**Réponse Success (200):**
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

**Erreurs:**
- `400` - Facture déjà payée
- `400` - Montant supérieur au restant
- `400` - Paiement échoué (simulation)
- `404` - Facture non trouvée

---

### 2. Historique des Paiements

Obtenir l'historique des paiements.

**Endpoint:** `GET /paiements/historique`  
**Authentification:** ✅ Requise

**Réponse Success (200):**

**Pour un Commerçant (paiements effectués):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "montant": 25000,
      "date": "2024-01-20T14:30:00.000Z",
      "mode": "mobile_money",
      "reference": "MM1705847239123",
      "telephone": "+2250123456789",
      "statut": "succes",
      "factureNumero": "FACT-1705847239-123",
      "factureMontant": 50000,
      "fournisseurNom": "Fournisseur ABC"
    }
  ]
}
```

**Pour un Fournisseur (paiements reçus):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "montant": 25000,
      "date": "2024-01-20T14:30:00.000Z",
      "mode": "mobile_money",
      "reference": "MM1705847239123",
      "statut": "succes",
      "factureNumero": "FACT-1705847239-123",
      "factureMontant": 50000,
      "commercantNom": "Commerce XYZ"
    }
  ]
}
```

---

### 3. Paiements d'une Facture

Obtenir tous les paiements d'une facture spécifique.

**Endpoint:** `GET /paiements/facture/{factureId}`  
**Authentification:** ✅ Requise

**Réponse Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "montant": 20000,
      "date": "2024-01-20T14:30:00.000Z",
      "mode": "mobile_money",
      "reference": "MM1705847239123",
      "telephone": "+2250123456789",
      "statut": "succes"
    },
    {
      "id": 2,
      "montant": 30000,
      "date": "2024-01-25T10:15:00.000Z",
      "mode": "mobile_money",
      "reference": "MM1705847240456",
      "statut": "succes"
    }
  ]
}
```

---

## 👥 CLIENTS

### 1. Ajouter un Client

Ajouter un nouveau client (pour les fournisseurs).

**Endpoint:** `POST /clients`  
**Authentification:** ✅ Requise

**Body:**
```json
{
  "nom": "Restaurant Le Palmier",
  "email": "contact@lepalmier.com",
  "telephone": "+2250198765432",
  "adresse": "Abidjan, Cocody"
}
```

**Réponse Success (201):**
```json
{
  "success": true,
  "message": "Client ajouté avec succès",
  "data": {
    "id": 1,
    "nom": "Restaurant Le Palmier",
    "email": "contact@lepalmier.com",
    "telephone": "+2250198765432"
  }
}
```

---

### 2. Lister les Clients

Obtenir tous les clients d'un utilisateur.

**Endpoint:** `GET /clients`  
**Authentification:** ✅ Requise

**Réponse Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Restaurant Le Palmier",
      "email": "contact@lepalmier.com",
      "telephone": "+2250198765432",
      "adresse": "Abidjan, Cocody",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Détails d'un Client

**Endpoint:** `GET /clients/{id}`  
**Authentification:** ✅ Requise

---

### 4. Mettre à Jour un Client

**Endpoint:** `PUT /clients/{id}`  
**Authentification:** ✅ Requise

**Body:**
```json
{
  "nom": "Restaurant Le Palmier & Bar",
  "telephone": "+2250198765433"
}
```

---

### 5. Supprimer un Client

**Endpoint:** `DELETE /clients/{id}`  
**Authentification:** ✅ Requise

---

## 🔔 NOTIFICATIONS

### 1. Obtenir les Notifications

**Endpoint:** `GET /notifications`  
**Authentification:** ✅ Requise

**Réponse Success (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "nouvelle_facture",
        "contenu": "Vous avez reçu une nouvelle facture de 50000 FCFA",
        "lu": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "type": "paiement_recu",
        "contenu": "Paiement de 25000 FCFA reçu pour la facture FACT-123",
        "lu": true,
        "createdAt": "2024-01-20T14:30:00.000Z"
      }
    ],
    "nonLues": 1
  }
}
```

---

### 2. Marquer comme Lue

**Endpoint:** `PUT /notifications/{id}/lire`  
**Authentification:** ✅ Requise

**Réponse Success (200):**
```json
{
  "success": true,
  "message": "Notification marquée comme lue"
}
```

---

### 3. Tout Marquer comme Lu

**Endpoint:** `PUT /notifications/lire-toutes`  
**Authentification:** ✅ Requise

---

### 4. Supprimer une Notification

**Endpoint:** `DELETE /notifications/{id}`  
**Authentification:** ✅ Requise

---

## 📤 EXPORT (Endpoint Documenté)

### Export PDF d'une Facture

**Endpoint:** `GET /export/factures/{id}/pdf`  
**Authentification:** ✅ Requise

**Note:** Cette fonctionnalité est documentée mais non implémentée dans le MVP.  
Elle serait implémentée avec une librairie comme `pdfkit` ou `jspdf`.

**Réponse Actuelle (200):**
```json
{
  "success": true,
  "message": "Endpoint d'export PDF (à implémenter)",
  "note": "Cette fonctionnalité serait implémentée avec pdfkit ou jspdf"
}
```

**Implémentation Future:**
```javascript
// Générer un PDF avec:
// - En-tête avec logo
// - Informations facture
// - Tableau des détails
// - Total et statut
// - Footer avec conditions
```

---

## 🔧 CODES D'ERREUR

| Code | Signification |
|------|---------------|
| 200 | Success |
| 201 | Created (ressource créée) |
| 400 | Bad Request (erreur de validation) |
| 401 | Unauthorized (non authentifié) |
| 403 | Forbidden (pas les permissions) |
| 404 | Not Found (ressource non trouvée) |
| 500 | Internal Server Error |

**Format de réponse d'erreur:**
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

---

## 🧪 TESTER L'API

### Avec cURL

```bash
# 1. Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","email":"test@test.com","motDePasse":"test123","role":"commercant"}'

# 2. Connexion et récupérer le token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","motDePasse":"test123"}' \
  | jq -r '.data.token')

# 3. Utiliser le token
curl http://localhost:3000/api/factures \
  -H "Authorization: Bearer $TOKEN"
```

### Avec Postman

1. Créer une variable d'environnement `token`
2. Dans Login, ajouter un test:
```javascript
pm.environment.set("token", pm.response.json().data.token);
```
3. Dans toutes les autres requêtes, utiliser:
```
Authorization: Bearer {{token}}
```

### Avec JavaScript (Axios)

```javascript
// Configuration
const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Exemple de requête
axios.get(`${API_URL}/factures`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error(error.response.data);
});
```

---

## 📊 STATISTIQUES API

**Total endpoints:** 24  
**Endpoints publics:** 2 (register, login)  
**Endpoints protégés:** 22

**Ressources:**
- Auth: 3 endpoints
- Factures: 5 endpoints
- Paiements: 3 endpoints
- Clients: 5 endpoints
- Notifications: 4 endpoints
- Export: 1 endpoint

---

*Documentation maintenue par Craj - Full Margin*  
*Dernière mise à jour: Novembre 2024*
