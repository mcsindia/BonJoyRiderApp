import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import EmergencyContacts from '../screens/HomeScreenContent/EmergencyContact';
import ProfileScreen from '../screens/HomeScreenContent/ProfileScreen';
import EditProfilePage from '../screens/HomeScreenContent/EditProfilePage';

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
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfilePage} />
    </Stack.Navigator>
  );
};

export default HomeStack;
