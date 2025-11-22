import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { authAPI } from '../services/api';

// Import des écrans
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FactureListScreen from '../screens/FactureListScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await authAPI.isAuthenticated();
    setIsAuthenticated(authenticated);
    setLoading(false);
  };

  if (loading) {
    return null; // ou un écran de chargement
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Écrans d'authentification */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Inscription',
            headerBackTitleVisible: false,
          }}
        />

        {/* Écrans principaux */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Tableau de Bord',
            headerLeft: null, // Désactive le bouton retour
          }}
        />
        <Stack.Screen
          name="FactureList"
          component={FactureListScreen}
          options={{ title: 'Mes Factures' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
