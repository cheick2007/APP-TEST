const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const { authMiddleware } = require('../middleware/auth');

// Toutes les routes sont protégées
router.use(authMiddleware);

// Routes des paiements
router.post('/payer', paiementController.payerFacture);
router.get('/historique', paiementController.getHistoriquePaiements);
router.get('/facture/:factureId', paiementController.getPaiementsByFacture);

module.exports = router;
