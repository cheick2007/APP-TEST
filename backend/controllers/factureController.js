const { query } = require('../config/database');

// Créer une nouvelle facture (Fournisseur)
exports.createFacture = async (req, res) => {
  try {
    const { montant, dateEmission, dateEcheance, description, commercantId } = req.body;
    const fournisseurId = req.user.id;

    // Vérifier que l'utilisateur est un fournisseur
    if (req.user.role !== 'fournisseur') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les fournisseurs peuvent créer des factures'
      });
    }

    // Validation des champs
    if (!montant || !dateEmission || !dateEcheance || !commercantId) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
      });
    }

    // Générer un numéro de facture unique
    const numero = `FACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Insérer la facture
    const result = await query(
      `INSERT INTO factures (numero, montant, dateEmission, dateEcheance, description, fournisseurId, commercantId, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente')`,
      [numero, montant, dateEmission, dateEcheance, description || '', fournisseurId, commercantId]
    );

    // Créer une notification pour le commerçant
    await query(
      'INSERT INTO notifications (type, contenu, userId) VALUES (?, ?, ?)',
      ['nouvelle_facture', `Vous avez reçu une nouvelle facture de ${montant} FCFA`, commercantId]
    );

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: {
        id: result.insertId,
        numero,
        montant,
        dateEmission,
        dateEcheance,
        statut: 'en_attente'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la facture'
    });
  }
};

// Obtenir toutes les factures de l'utilisateur
exports.getFactures = async (req, res) => {
  try {
    const userId = req.user.id;
    const { statut } = req.query;

    let sql = `
      SELECT f.*, 
             fou.nom as fournisseurNom, 
             com.nom as commercantNom
      FROM factures f
      JOIN users fou ON f.fournisseurId = fou.id
      JOIN users com ON f.commercantId = com.id
      WHERE (f.fournisseurId = ? OR f.commercantId = ?)
    `;
    
    const params = [userId, userId];

    // Filtrer par statut si demandé
    if (statut) {
      sql += ' AND f.statut = ?';
      params.push(statut);
    }

    sql += ' ORDER BY f.createdAt DESC';

    const factures = await query(sql, params);

    res.json({
      success: true,
      data: factures
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures'
    });
  }
};

// Obtenir une facture par ID
exports.getFactureById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const factures = await query(
      `SELECT f.*, 
              fou.nom as fournisseurNom, fou.email as fournisseurEmail, fou.telephone as fournisseurTel,
              com.nom as commercantNom, com.email as commercantEmail, com.telephone as commercantTel
       FROM factures f
       JOIN users fou ON f.fournisseurId = fou.id
       JOIN users com ON f.commercantId = com.id
       WHERE f.id = ? AND (f.fournisseurId = ? OR f.commercantId = ?)`,
      [id, userId, userId]
    );

    if (factures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    // Récupérer les paiements associés
    const paiements = await query(
      'SELECT * FROM paiements WHERE factureId = ? ORDER BY date DESC',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...factures[0],
        paiements
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour une facture
exports.updateFacture = async (req, res) => {
  try {
    const { id } = req.params;
    const { montant, dateEcheance, description } = req.body;
    const userId = req.user.id;

    // Vérifier que la facture appartient au fournisseur
    const factures = await query(
      'SELECT * FROM factures WHERE id = ? AND fournisseurId = ?',
      [id, userId]
    );

    if (factures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée ou non autorisée'
      });
    }

    // Ne peut pas modifier une facture déjà payée
    if (factures[0].statut === 'payee') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier une facture déjà payée'
      });
    }

    // Mettre à jour
    await query(
      'UPDATE factures SET montant = ?, dateEcheance = ?, description = ? WHERE id = ?',
      [montant || factures[0].montant, dateEcheance || factures[0].dateEcheance, description || factures[0].description, id]
    );

    res.json({
      success: true,
      message: 'Facture mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Supprimer une facture
exports.deleteFacture = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la facture appartient au fournisseur
    const factures = await query(
      'SELECT * FROM factures WHERE id = ? AND fournisseurId = ?',
      [id, userId]
    );

    if (factures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée ou non autorisée'
      });
    }

    // Ne peut pas supprimer une facture déjà payée
    if (factures[0].statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une facture déjà payée'
      });
    }

    await query('DELETE FROM factures WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
