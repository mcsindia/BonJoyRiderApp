import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import EmergencyContacts from '../screens/HomeScreenContent/EmergencyContactsScreen';
import ProfileScreen from '../screens/HomeScreenContent/ProfileScreen';
import EditProfilePage from '../screens/HomeScreenContent/EditProfilePage';
import AddEmergencyContactScreen from '../screens/HomeScreenContent/emergencyContactComponent/AddEmergencyContactScreen';
import EmergencyContactDetailScreen from '../screens/HomeScreenContent/emergencyContactComponent/EmergencyContactDetailScreen';
import EmergencyContactsScreen from '../screens/HomeScreenContent/EmergencyContactsScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  EmergencyContacts: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfilePage} />
      <Stack.Screen 
  name="EmergencyContacts" 
  component={EmergencyContactsScreen} 
/>
<Stack.Screen 
  name="AddEmergencyContact" 
  component={AddEmergencyContactScreen} 
/>
<Stack.Screen 
  name="EmergencyContactDetail" 
  component={EmergencyContactDetailScreen} 
/>

    </Stack.Navigator>
  );
};

export default HomeStack;
