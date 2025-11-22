const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

// Toutes les routes sont protégées
router.use(authMiddleware);

// Routes des notifications
router.get('/', notificationController.getNotifications);
router.put('/:id/lire', notificationController.marquerCommeLue);
router.put('/lire-toutes', notificationController.marquerToutesCommeLues);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
