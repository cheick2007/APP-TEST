import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { factureAPI, authAPI } from '../services/api';

export default function FactureListScreen({ navigation, route }) {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(route.params?.filter || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadFactures();
  }, [filter]);

  const loadUser = async () => {
    const currentUser = await authAPI.getCurrentUser();
    setUser(currentUser);
  };

  const loadFactures = async () => {
    try {
      setLoading(true);
      const response = await factureAPI.getAll(filter);
      if (response.success) {
        setFactures(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFactures();
    setRefreshing(false);
  };

  const renderFacture = ({ item }) => {
    const isCommercant = user?.role === 'commercant';

    return (
      <TouchableOpacity
        style={styles.factureCard}
        onPress={() => navigation.navigate('FactureDetail', { factureId: item.id })}
      >
        <View style={styles.factureHeader}>
          <Text style={styles.factureNumero}>{item.numero}</Text>
          <View style={[styles.statutBadge, styles[`statut_${item.statut}`]]}>
            <Text style={styles.statutText}>
              {item.statut === 'en_attente'
                ? 'En attente'
                : item.statut === 'payee'
                ? 'Payée'
                : 'Partielle'}
            </Text>
          </View>
        </View>

        <Text style={styles.factureMontant}>
          {parseFloat(item.montant).toLocaleString('fr-FR')} FCFA
        </Text>

        {item.montantPaye > 0 && item.statut !== 'payee' && (
          <Text style={styles.montantPaye}>
            Payé: {parseFloat(item.montantPaye).toLocaleString('fr-FR')} FCFA
          </Text>
        )}

        <Text style={styles.facturePartie}>
          {isCommercant ? `De: ${item.fournisseurNom}` : `Pour: ${item.commercantNom}`}
        </Text>

        <View style={styles.factureDates}>
          <Text style={styles.factureDate}>
            Émise: {new Date(item.dateEmission).toLocaleDateString('fr-FR')}
          </Text>
          <Text style={styles.factureDate}>
            Échéance: {new Date(item.dateEcheance).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {item.description && (
          <Text style={styles.factureDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !filter && styles.filterButtonActive]}
          onPress={() => setFilter(null)}
        >
          <Text style={[styles.filterText, !filter && styles.filterTextActive]}>
            Toutes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'en_attente' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('en_attente')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'en_attente' && styles.filterTextActive,
            ]}
          >
            En attente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'payee' && styles.filterButtonActive]}
          onPress={() => setFilter('payee')}
        >
          <Text
            style={[styles.filterText, filter === 'payee' && styles.filterTextActive]}
          >
            Payées
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des factures */}
      <FlatList
        data={factures}
        renderItem={renderFacture}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune facture</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  factureCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
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
  montantPaye: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 5,
  },
  facturePartie: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  factureDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  factureDate: {
    fontSize: 12,
    color: '#999',
  },
  factureDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
