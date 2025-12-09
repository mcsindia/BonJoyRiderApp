import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import EmergencyContacts from '../screens/HomeScreenContent/EmergencyContact';

export type HomeStackParamList = {
  HomeMain: undefined;
  EmergencyContacts: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContacts} />
    </Stack.Navigator>
  );
};

export default HomeStack;
