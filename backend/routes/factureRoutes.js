const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const { authMiddleware } = require('../middleware/auth');

// Toutes les routes sont protégées
router.use(authMiddleware);

// Routes des factures
router.post('/', factureController.createFacture);
router.get('/', factureController.getFactures);
router.get('/:id', factureController.getFactureById);
router.put('/:id', factureController.updateFacture);
router.delete('/:id', factureController.deleteFacture);

module.exports = router;
