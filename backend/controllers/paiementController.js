const { query } = require('../config/database');

// Simulation de l'API Mobile Money
async function simulerMobileMoney(montant, telephone) {
  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simuler un succès aléatoire (95% de succès)
  const success = Math.random() < 0.95;
  
  if (success) {
    return {
      success: true,
      reference: `MM${Date.now()}${Math.floor(Math.random() * 10000)}`,
      message: 'Paiement Mobile Money réussi'
    };
  } else {
    return {
      success: false,
      message: 'Paiement échoué - Fonds insuffisants'
    };
  }
}

// Effectuer un paiement
exports.payerFacture = async (req, res) => {
  try {
    const { factureId, montant, telephone } = req.body;
    const userId = req.user.id;

    // Validation
    if (!factureId || !montant || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Vérifier que l'utilisateur est le commerçant de cette facture
    const factures = await query(
      'SELECT * FROM factures WHERE id = ? AND commercantId = ?',
      [factureId, userId]
    );

    if (factures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée ou non autorisée'
      });
    }

    const facture = factures[0];

    // Vérifier que la facture n'est pas déjà payée
    if (facture.statut === 'payee') {
      return res.status(400).json({
        success: false,
        message: 'Cette facture est déjà payée'
      });
    }

    // Vérifier que le montant ne dépasse pas ce qui reste à payer
    const restantAPayer = parseFloat(facture.montant) - parseFloat(facture.montantPaye || 0);
    if (parseFloat(montant) > restantAPayer) {
      return res.status(400).json({
        success: false,
        message: `Le montant ne peut pas dépasser ${restantAPayer} FCFA`
      });
    }

    // Simuler le paiement Mobile Money
    console.log(`🔄 Traitement du paiement Mobile Money de ${montant} FCFA...`);
    const resultatPaiement = await simulerMobileMoney(montant, telephone);

    if (!resultatPaiement.success) {
      return res.status(400).json({
        success: false,
        message: resultatPaiement.message
      });
    }

    // Enregistrer le paiement
    const paiementResult = await query(
      `INSERT INTO paiements (montant, mode, reference, telephone, factureId, statut) 
       VALUES (?, 'mobile_money', ?, ?, ?, 'succes')`,
      [montant, resultatPaiement.reference, telephone, factureId]
    );

    // Mettre à jour le montant payé et le statut de la facture
    const nouveauMontantPaye = parseFloat(facture.montantPaye || 0) + parseFloat(montant);
    let nouveauStatut = 'partiellement_payee';
    
    if (nouveauMontantPaye >= parseFloat(facture.montant)) {
      nouveauStatut = 'payee';
    }

    await query(
      'UPDATE factures SET montantPaye = ?, statut = ? WHERE id = ?',
      [nouveauMontantPaye, nouveauStatut, factureId]
    );

    // Créer une notification pour le fournisseur
    await query(
      'INSERT INTO notifications (type, contenu, userId) VALUES (?, ?, ?)',
      [
        'paiement_recu',
        `Paiement de ${montant} FCFA reçu pour la facture ${facture.numero}`,
        facture.fournisseurId
      ]
    );

    console.log(`✅ Paiement réussi - Référence: ${resultatPaiement.reference}`);

    res.json({
      success: true,
      message: 'Paiement effectué avec succès',
      data: {
        paiementId: paiementResult.insertId,
        reference: resultatPaiement.reference,
        montant: montant,
        nouveauStatut: nouveauStatut,
        montantRestant: parseFloat(facture.montant) - nouveauMontantPaye
      }
    });

  } catch (error) {
    console.error('Erreur lors du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du paiement'
    });
  }
};

// Obtenir l'historique des paiements
exports.getHistoriquePaiements = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let sql;
    let params;

    if (role === 'commercant') {
      // Pour le commerçant, ses paiements effectués
      sql = `
        SELECT p.*, f.numero as factureNumero, f.montant as factureMontant, 
               u.nom as fournisseurNom
        FROM paiements p
        JOIN factures f ON p.factureId = f.id
        JOIN users u ON f.fournisseurId = u.id
        WHERE f.commercantId = ?
        ORDER BY p.date DESC
      `;
      params = [userId];
    } else {
      // Pour le fournisseur, les paiements reçus
      sql = `
        SELECT p.*, f.numero as factureNumero, f.montant as factureMontant,
               u.nom as commercantNom
        FROM paiements p
        JOIN factures f ON p.factureId = f.id
        JOIN users u ON f.commercantId = u.id
        WHERE f.fournisseurId = ?
        ORDER BY p.date DESC
      `;
      params = [userId];
    }

    const paiements = await query(sql, params);

    res.json({
      success: true,
      data: paiements
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les paiements d'une facture spécifique
exports.getPaiementsByFacture = async (req, res) => {
  try {
    const { factureId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur a accès à cette facture
    const factures = await query(
      'SELECT * FROM factures WHERE id = ? AND (fournisseurId = ? OR commercantId = ?)',
      [factureId, userId, userId]
    );

    if (factures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    const paiements = await query(
      'SELECT * FROM paiements WHERE factureId = ? ORDER BY date DESC',
      [factureId]
    );

    res.json({
      success: true,
      data: paiements
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
