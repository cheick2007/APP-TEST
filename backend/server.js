require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialiser l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger personnalisé
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const factureRoutes = require('./routes/factureRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const clientRoutes = require('./routes/clientRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/notifications', notificationRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de gestion de factures - Full Margin',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      factures: '/api/factures',
      paiements: '/api/paiements',
      clients: '/api/clients',
      notifications: '/api/notifications'
    }
  });
});

// Route pour l'export PDF (endpoint documenté pour le test)
app.get('/api/export/factures/:id/pdf', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint d\'export PDF (à implémenter)',
    note: 'Cette fonctionnalité serait implémentée avec une librairie comme pdfkit ou jspdf'
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log('\n🚀 =====================================');
  console.log(`   Serveur démarré sur le port ${PORT}`);
  console.log('   =====================================');
  console.log(`   📍 API: http://localhost:${PORT}`);
  console.log(`   📚 Docs: http://localhost:${PORT}/`);
  console.log('   =====================================\n');
});

module.exports = app;
