import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeNavigator from './HomeNavigator';

// Import all drawer screens
import ProfileScreen from '../screens/HomeScreenContent/profileScreenComponents/ProfileScreen';
import EditProfilePage from '../screens/HomeScreenContent/profileScreenComponents/EditProfilePage';
import EmergencyContactsScreen from '../screens/HomeScreenContent/emergencyContactComponent/EmergencyContactsScreen';
import AddEmergencyContactScreen from '../screens/HomeScreenContent/emergencyContactComponent/AddEmergencyContactScreen';
import EmergencyContactDetailScreen from '../screens/HomeScreenContent/emergencyContactComponent/EmergencyContactDetailScreen';

// Import placeholder screens for other drawer items
import DashboardScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import ElectricScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import RideHistoryScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import BonjoyMoneyScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import PaymentsScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import BonjoyCoinsScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import HelpSupportScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import SafetyPrivacyScreen from '../screens/HomeScreenContent/Others/TodoScreen';
import AboutScreen from '../screens/HomeScreenContent/Others/TodoScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Onboarding: undefined;
  Home: undefined;
  // Drawer screens
  Dashboard: undefined;
  Electric: undefined;
  RideHistory: undefined;
  BonjoyMoney: undefined;
  Payments: undefined;
  BonjoyCoins: undefined;
  EmergencyContacts: undefined;
  AddEmergencyContact: undefined;
  EmergencyContactDetail: { contactId: string };
  Profile: undefined;
  EditProfile: undefined;
  HelpSupport: undefined;
  SafetyPrivacy: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        {/* Main Home with Drawer and Tabs */}
        <Stack.Screen name="Home" component={HomeNavigator} />

        {/* Drawer Screens - These will open as separate screens without bottom tabs */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />

        <Stack.Screen name="Electric" component={ElectricScreen} />

        <Stack.Screen name="RideHistory" component={RideHistoryScreen} />

        <Stack.Screen name="BonjoyMoney" component={BonjoyMoneyScreen} />

        <Stack.Screen name="Payments" component={PaymentsScreen} />

        <Stack.Screen name="BonjoyCoins" component={BonjoyCoinsScreen} />

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

        <Stack.Screen name="Profile" component={ProfileScreen} />

        <Stack.Screen name="EditProfile" component={EditProfilePage} />

        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />

        <Stack.Screen name="SafetyPrivacy" component={SafetyPrivacyScreen} />

        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
