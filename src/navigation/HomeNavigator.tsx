import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';

import DrawerContent from '../screens/HomeScreenContent/DrawerContent';
import HomeStack from './HomeStack';
import ProfileScreen from '../screens/HomeScreenContent/ProfileScreen';

import { s, sf, sh, sw } from '../utils/scale';
import EditProfilePage from '../screens/HomeScreenContent/EditProfilePage';
// tab icons
const homeIcon = require('../assets/tab-icons/home.png');
const bikeIcon = require('../assets/tab-icons/bike.png');
const profileIcon = require('../assets/tab-icons/account.png');
const walletIcon = require('../assets/tab-icons/wallet.png');
const supportIcon = require('../assets/tab-icons/support.png');

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

/* ---------------- Bottom Tabs ---------------- */

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F344F',
          paddingBottom: 10,
        },
        tabBarIcon: () => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = homeIcon;
              break;
            case 'Bike':
              icon = bikeIcon;
              break;
            case 'Profile':
              icon = profileIcon;
              break;
            case 'Wallet':
              icon = walletIcon;
              break;
            default:
              icon = supportIcon;
          }

          return <Image source={icon} style={styles.tabIcon} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Bike" component={ProfileScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Wallet" component={ProfileScreen} />
      <Tab.Screen name="Support" component={ProfileScreen} />
      
    </Tab.Navigator>
  );
};

/* ---------------- Drawer ---------------- */

const HomeNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerStyle={{ width: sw(280) }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="HomeTabs" component={BottomTabNavigator} />
    </Drawer.Navigator>
  );
};

export default HomeNavigator;

const styles = StyleSheet.create({
  tabIcon: {
    width: sw(24),
    height: sh(24),
    resizeMode: 'contain',
  },
});
