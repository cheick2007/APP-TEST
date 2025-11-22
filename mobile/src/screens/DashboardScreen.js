import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { authAPI, factureAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [factures, setFactures] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    payees: 0,
    montantTotal: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données utilisateur
  useEffect(() => {
    loadUser();
  }, []);

  // Recharger les factures à chaque fois que l'écran est affiché
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadFactures();
      }
    }, [user])
  );

  const loadUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const loadFactures = async () => {
    try {
      const response = await factureAPI.getAll();
      if (response.success) {
        const facturesData = response.data;
        setFactures(facturesData);

        // Calculer les statistiques
        const stats = {
          total: facturesData.length,
          enAttente: facturesData.filter((f) => f.statut === 'en_attente').length,
          payees: facturesData.filter((f) => f.statut === 'payee').length,
          montantTotal: facturesData.reduce((sum, f) => sum + parseFloat(f.montant), 0),
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Erreur chargement factures:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFactures();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await authAPI.logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const isCommercant = user.role === 'commercant';
  const isFournisseur = user.role === 'fournisseur';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.userName}>{user.nom}</Text>
          <Text style={styles.userRole}>
            {isCommercant ? '🏪 Commerçant' : '📦 Fournisseur'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Factures</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.enAttente}</Text>
          <Text style={styles.statLabel}>En Attente</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.payees}</Text>
          <Text style={styles.statLabel}>Payées</Text>
        </View>
      </View>

      <View style={styles.montantCard}>
        <Text style={styles.montantLabel}>Montant Total</Text>
        <Text style={styles.montantValue}>
          {stats.montantTotal.toLocaleString('fr-FR')} FCFA
        </Text>
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>

        {isFournisseur && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateFacture')}
          >
            <Text style={styles.actionButtonIcon}>➕</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Créer une Facture</Text>
              <Text style={styles.actionButtonSubtitle}>
                Nouvelle facture pour un client
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('FactureList')}
        >
          <Text style={styles.actionButtonIcon}>📄</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Voir les Factures</Text>
            <Text style={styles.actionButtonSubtitle}>
              {isCommercant ? 'Factures reçues' : 'Factures émises'}
            </Text>
          </View>
        </TouchableOpacity>

        {isCommercant && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FactureList', { filter: 'en_attente' })}
          >
            <Text style={styles.actionButtonIcon}>💳</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Payer une Facture</Text>
              <Text style={styles.actionButtonSubtitle}>
                Factures en attente de paiement
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Factures récentes */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Factures Récentes</Text>
        {factures.slice(0, 5).map((facture) => (
          <TouchableOpacity
            key={facture.id}
            style={styles.factureCard}
            onPress={() => navigation.navigate('FactureDetail', { factureId: facture.id })}
          >
            <View style={styles.factureHeader}>
              <Text style={styles.factureNumero}>{facture.numero}</Text>
              <View style={[styles.statutBadge, styles[`statut_${facture.statut}`]]}>
                <Text style={styles.statutText}>
                  {facture.statut === 'en_attente'
                    ? 'En attente'
                    : facture.statut === 'payee'
                    ? 'Payée'
                    : 'Partielle'}
                </Text>
              </View>
            </View>
            <Text style={styles.factureMontant}>
              {parseFloat(facture.montant).toLocaleString('fr-FR')} FCFA
            </Text>
            <Text style={styles.facturePartie}>
              {isCommercant
                ? `De: ${facture.fournisseurNom}`
                : `Pour: ${facture.commercantNom}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userRole: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  montantCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  montantLabel: {
    fontSize: 16,
    color: '#666',
  },
  montantValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  recentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  factureCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  factureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  factureNumero: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statut_en_attente: {
    backgroundColor: '#ffc107',
  },
  statut_payee: {
    backgroundColor: '#28a745',
  },
  statut_partiellement_payee: {
    backgroundColor: '#17a2b8',
  },
  statutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  factureMontant: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  facturePartie: {
    fontSize: 14,
    color: '#666',
  },
});
