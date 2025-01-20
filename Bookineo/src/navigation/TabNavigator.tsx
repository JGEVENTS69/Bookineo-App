import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MapPin, Heart, User, Plus, NavigationOff } from 'lucide-react-native';
import MapScreen from '../screens/MapScreen';
import AddBoxScreen from '@screens/AddBoxScreen';

// Définir chaque écran comme un composant React proper
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

const Visites = () => (
  <View style={styles.screen}>
    <Text>Visites</Text>
  </View>
);

// Composant personnalisé pour le bouton central
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.centerButtonContainer}
    onPress={onPress}
  >
    <View style={styles.centerButton}>
      <Plus color="#fff" size={28} />
    </View>
  </TouchableOpacity>
);

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Map') {
            return <MapPin color={color} size={size} />;
          } else if (route.name === 'Favorites') {
            return <Heart color={color} size={size} />;
          } else if (route.name === 'Profile') {
            return <User color={color} size={size} />;
          } else if (route.name === 'Visites') {
            return <NavigationOff color={color} size={size} />;
          }
          return null;
        },
        tabBarActiveTintColor: '#3a7c6a',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
          height: 85,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: '#3a7c6a', // Couleur de fond du header
        },
        headerTintColor: '#fff', // Couleur du texte et des icônes du header
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Tab.Screen
        name="Add"
        component={AddBoxScreen}
        options={{
          title: 'Ajouter une boîte à livres',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          )
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Tab.Screen name="Visites" component={Visites} options={{ title: 'Visites' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#3a7c6a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  tabButton: {
    alignItems: 'center',
  },
});

export default TabNavigator;
