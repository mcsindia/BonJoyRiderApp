import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import linking from './linkingConfig';
import { RootStackParamList } from './types';

import SplashScreen from '../screens/SplashScreen/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeNavigator from './HomeNavigator';
import EmergencyContacts from '../screens/HomeScreenContent/EmergencyContact';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name ='Login' component={LoginScreen} />
        <Stack.Screen name = 'Onboarding' component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeNavigator} />
        <Stack.Screen name= "EmergencyContacts" component = {EmergencyContacts} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;