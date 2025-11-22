const { query } = require('../config/database');

// Ajouter un client (pour les fournisseurs)
exports.addClient = async (req, res) => {
  try {
    const { nom, email, telephone, adresse } = req.body;
    const userId = req.user.id;

    if (!nom) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }

    const result = await query(
      'INSERT INTO clients (nom, email, telephone, adresse, userId) VALUES (?, ?, ?, ?, ?)',
      [nom, email || null, telephone || null, adresse || null, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Client ajouté avec succès',
      data: {
        id: result.insertId,
        nom,
        email,
        telephone
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du client'
    });
  }
};

// Obtenir tous les clients d'un utilisateur
exports.getClients = async (req, res) => {
  try {
    const userId = req.user.id;

    const clients = await query(
      'SELECT * FROM clients WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    res.json({
      success: true,
      data: clients
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir un client par ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const clients = await query(
      'SELECT * FROM clients WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    res.json({
      success: true,
      data: clients[0]
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone, adresse } = req.body;
    const userId = req.user.id;

    // Vérifier que le client appartient à l'utilisateur
    const clients = await query(
      'SELECT * FROM clients WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    await query(
      'UPDATE clients SET nom = ?, email = ?, telephone = ?, adresse = ? WHERE id = ?',
      [nom, email, telephone, adresse, id]
    );

    res.json({
      success: true,
      message: 'Client mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que le client appartient à l'utilisateur
    const clients = await query(
      'SELECT * FROM clients WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    await query('DELETE FROM clients WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Client supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
