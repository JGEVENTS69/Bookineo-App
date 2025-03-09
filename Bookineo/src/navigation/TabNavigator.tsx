import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Settings } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MapPin, Heart, User, SettingsIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import MapScreen from '../screens/MapScreen';
import AddBoxScreen from '@screens/AddBoxScreen';
import BoxInfoScreen from '@screens/BoxInfoScreen';
import CustomTabBarButton from '../components/CustomTabBarButton';
import FavorisScreen from '@screens/FavorisScreen';
import ProfileScreen from '@screens/ProfileScreen';
import EditProfile from '@screens/EditProfile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const MapStack = ({ navigation }) => {
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const routeName = e.data.state.routes[e.data.state.index]?.name;
      if (routeName === 'MapScreen') {
        navigation.setOptions({ tabBarLabel: 'Carte' });
      } else if (routeName === 'BoxInfoScreen') {
        navigation.setOptions({ tabBarLabel: 'Détails de la boîte' });
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ title: 'Carte', headerShown: true }}
      />
      <Stack.Screen
        name="BoxInfoScreen"
        component={BoxInfoScreen}
        options={{ title: 'Détails de la boîte', headerShown: true }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Map') {
            return <MapPin color={color} size={size} />;
          } else if (route.name === 'Favorites') {
            return <Heart color={color} size={size} />;
          } else if (route.name === 'Profil') {
            return <User color={color} size={size} />;
          } else if (route.name === 'Setting') {
            return <SettingsIcon color={color} size={size} />;
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
        },
      })}
    >
      <Tab.Screen name="Map" component={MapStack} options={{ headerShown: false }} />
      <Tab.Screen name="Favorites" component={FavorisScreen} options={{ title: 'Favoris' }} />
      <Tab.Screen
        name="Add"
        component={AddBoxScreen}
        options={{
          title: 'Ajouter une boîte',
          tabBarIcon: () => null,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Tab.Screen name="Setting" component={EditProfile} options={{ title: 'Paramètres' }} />
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