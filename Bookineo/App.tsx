import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Uniquement ici
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}