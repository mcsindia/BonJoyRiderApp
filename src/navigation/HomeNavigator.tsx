// src/navigation/HomeNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/HomeScreenContent/ProfileScreen';
import DrawerContent from '../screens/HomeScreenContent/DrawerContent';

// Tab icons
const homeIcon = require('../assets/tab-icons/home.png');
const bikeIcon = require('../assets/tab-icons/bike.png');
const profileIcon = require('../assets/tab-icons/account.png');
const Wallet = require('../assets/tab-icons/wallet.png');
const supportIcon = require('../assets/tab-icons/support.png');

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === 'Home') {
            iconSource = focused ? homeIcon : homeIcon;
          } else if (route.name === 'Bike') {
            iconSource = focused ? bikeIcon : bikeIcon;
          } else if (route.name === 'Profile') {
            iconSource = focused ? profileIcon : profileIcon;
          } else if (route.name === 'Wallet') {
            iconSource = focused ? Wallet : Wallet;
          } else if (route.name === 'Support') {
            iconSource = focused ? supportIcon : supportIcon;
          }

          return <Image source={iconSource} style={styles.tabIcon} />;
        },
        tabBarActiveTintColor: '#0F172A', // optional: for label
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#1F344F',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 10
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bike" component={ProfileScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Wallet" component={ProfileScreen} />
      <Tab.Screen name="Support" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const HomeNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { width: 280, backgroundColor: '#fff' },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={BottomTabNavigator}
        options={{ title: 'Home' }}
      />
    </Drawer.Navigator>
  );
};

export default HomeNavigator;

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});