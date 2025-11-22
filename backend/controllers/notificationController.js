const { query } = require('../config/database');

// Obtenir toutes les notifications de l'utilisateur
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await query(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
      [userId]
    );

    // Compter les non lues
    const nonLues = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND lu = FALSE',
      [userId]
    );

    res.json({
      success: true,
      data: {
        notifications,
        nonLues: nonLues[0].count
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Marquer une notification comme lue
exports.marquerCommeLue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la notification appartient à l'utilisateur
    const notifications = await query(
      'SELECT * FROM notifications WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    await query(
      'UPDATE notifications SET lu = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Marquer toutes les notifications comme lues
exports.marquerToutesCommeLues = async (req, res) => {
  try {
    const userId = req.user.id;

    await query(
      'UPDATE notifications SET lu = TRUE WHERE userId = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      'DELETE FROM notifications WHERE id = ? AND userId = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification supprimée'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
