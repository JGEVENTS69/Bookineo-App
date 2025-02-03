import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Uniquement ici
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';
import { configureReanimatedLogger } from 'react-native-reanimated';




configureReanimatedLogger({
  // Vous pouvez ajuster ces paramètres selon vos besoins
  logLevel: 'error', // ou 'warn' pour réduire la verbosité
  colorScheme: 'light', // ou 'dark'
  strict: false,
});

export default function App() {
  return (
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
  );
}