import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import UsernameScreen from '@screens/Auth/UsernameScreen';
import TabNavigator from '../navigation/TabNavigator';
import BoxInfoScreen from '@screens/BoxInfoScreen';
import EditProfile from '@screens/EditProfile';
import UpdateBoxScreen from '@screens/UpdateBoxScreen';




const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name='Username' component={UsernameScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="BoxInfoScreen" component={BoxInfoScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="UpdateBox" component={UpdateBoxScreen} />
    </Stack.Navigator>

  );
};

export default AppNavigator;