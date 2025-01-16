import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Heart, User } from 'lucide-react-native'; // Import des icônes Lucide
import MapScreen from '../screens/MapScreen';

// Écrans fictifs (à remplacer par tes écrans réels)
const FavoritesScreen = () => (
  <View style={styles.screen}>
    <Text>Favoris</Text>
  </View>
);
const ProfileScreen = () => (
  <View style={styles.screen}>
    <Text>Profil</Text>
  </View>
);

// Création du Tab Navigator
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Détermine quelle icône afficher en fonction de l'onglet
          if (route.name === 'Map') {
            return <MapPin color={color} size={size} />;
          } else if (route.name === 'Favorites') {
            return <Heart color={color} size={size} />;
          } else if (route.name === 'Profile') {
            return <User color={color} size={size} />;
          }
        },
        tabBarActiveTintColor: '#3a7c6a', // Couleur active
        tabBarInactiveTintColor: 'gray',  // Couleur inactive
        tabBarStyle: {
          backgroundColor: '#fff', // Fond blanc
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;