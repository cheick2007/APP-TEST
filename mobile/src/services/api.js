import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL du backend - CHANGE SI NÉCESSAIRE
// Sur émulateur Android : http://10.0.2.2:3000
// Sur device physique : http://TON_IP:3000
const API_URL = 'https://app-test-production-2005.up.railway.app/api';

// Instance axios avec configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Erreur du serveur (4xx, 5xx)
      throw error.response.data;
    } else if (error.request) {
      // Pas de réponse du serveur
      throw { success: false, message: 'Impossible de contacter le serveur' };
    } else {
      // Autre erreur
      throw { success: false, message: error.message };
    }
  }
);

// ============================================
// AUTHENTIFICATION
// ============================================

export const authAPI = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.success && response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Connexion
  login: async (email, motDePasse) => {
    const response = await api.post('/auth/login', { email, motDePasse });
    if (response.success && response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Déconnexion
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Vérifier si connecté
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};

// ============================================
// FACTURES
// ============================================

export const factureAPI = {
  // Obtenir toutes les factures
  getAll: async (statut = null) => {
    const url = statut ? `/factures?statut=${statut}` : '/factures';
    return await api.get(url);
  },

  // Obtenir une facture par ID
  getById: async (id) => {
    return await api.get(`/factures/${id}`);
  },

  // Créer une facture (fournisseur)
  create: async (factureData) => {
    return await api.post('/factures', factureData);
  },

  // Mettre à jour une facture
  update: async (id, factureData) => {
    return await api.put(`/factures/${id}`, factureData);
  },

  // Supprimer une facture
  delete: async (id) => {
    return await api.delete(`/factures/${id}`);
  },
};

// ============================================
// PAIEMENTS
// ============================================

export const paiementAPI = {
  // Payer une facture
  payer: async (factureId, montant, telephone) => {
    return await api.post('/paiements/payer', {
      factureId,
      montant,
      telephone,
    });
  },

  // Historique des paiements
  getHistorique: async () => {
    return await api.get('/paiements/historique');
  },

  // Paiements d'une facture
  getByFacture: async (factureId) => {
    return await api.get(`/paiements/facture/${factureId}`);
  },
};

// ============================================
// CLIENTS
// ============================================

export const clientAPI = {
  // Obtenir tous les clients
  getAll: async () => {
    return await api.get('/clients');
  },

  // Ajouter un client
  create: async (clientData) => {
    return await api.post('/clients', clientData);
  },

  // Mettre à jour un client
  update: async (id, clientData) => {
    return await api.put(`/clients/${id}`, clientData);
  },

  // Supprimer un client
  delete: async (id) => {
    return await api.delete(`/clients/${id}`);
  },
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationAPI = {
  // Obtenir toutes les notifications
  getAll: async () => {
    return await api.get('/notifications');
  },

  // Marquer comme lue
  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/lire`);
  },

  // Marquer toutes comme lues
  markAllAsRead: async () => {
    return await api.put('/notifications/lire-toutes');
  },
};

export default api;
