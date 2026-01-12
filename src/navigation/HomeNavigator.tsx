import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DrawerContent from '../screens/HomeScreenContent/DrawerContent';
import HomeStack from './HomeStack';
import ProfileScreen from '../screens/HomeScreenContent/profileScreenComponents/ProfileScreen';

import { s, sf, sh, sw } from '../utils/scale';
import TodoScreen from '../screens/HomeScreenContent/Others/TodoScreen';

/* -------- Tab Icons -------- */

const homeIcon = require('../assets/tab-icons/home.png');
const FavouriteIcon = require('../assets/tab-icons/heart.png');
const profileIcon = require('../assets/tab-icons/user.png');
const walletIcon = require('../assets/tab-icons/wallet.png');
const historyIcon = require('../assets/tab-icons/discount.png');

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

/* ---------------- Bottom Tabs ---------------- */

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: sf(12) },

        tabBarActiveTintColor: '#F5B400',
        tabBarInactiveTintColor: '#111',

        tabBarStyle: {
          backgroundColor: '#FFF',
          height: sh(70),
          borderTopLeftRadius: s(20),
          borderTopRightRadius: s(20),
          elevation: 10,
          position: 'absolute',
        },

        tabBarIcon: ({ focused }) => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = homeIcon;
              break;
            case 'Favourite':
              icon = FavouriteIcon;
              break;
            case 'Profile':
              icon = profileIcon;
              break;
            case 'Wallet':
              icon = walletIcon;
              break;
            default:
              icon = historyIcon;
          }

          /* -------- HEXAGON WALLET (WORKING) -------- */
          if (route.name === 'Wallet') {
            return (
              <View style={styles.walletWrapper}>
                <View style={styles.hexagon}>
                  <View style={styles.hexagonBefore} />
                  <View style={styles.hexagonAfter} />

                  <Image
                    source={icon}
                    style={styles.walletIcon}
                  />
                </View>
              </View>
            );
          }

          return (
            <Image
              source={icon}
              style={[
                styles.tabIcon,
                focused && styles.activeTabIcon,
              ]}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Favourite" component={TodoScreen} />
      <Tab.Screen name="Wallet" component={TodoScreen} />
      <Tab.Screen name="history" component={TodoScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
      <Drawer.Screen
        name="HomeTabs"
        component={BottomTabNavigator}
      />
    </Drawer.Navigator>
  );
};

export default HomeNavigator;

/* ---------------- Styles ---------------- */

const HEX_WIDTH = sw(64);
const HEX_HEIGHT = sh(36);

const styles = StyleSheet.create({
  tabIcon: {
    width: sw(25),
    height: sh(25),
    resizeMode: 'contain'
  },

  activeTabIcon: {
    tintColor: '#F5B400',
  },

  /* -------- HEXAGON -------- */

  walletWrapper: {
    marginTop: sh(-30),
  },

  hexagon: {
    width: HEX_WIDTH,
    height: HEX_HEIGHT,
    backgroundColor: '#F5B400',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sw(10)
  },

  hexagonBefore: {
    position: 'absolute',
    top: -HEX_HEIGHT / 2,
    width: 0,
    height: 0,
    borderLeftWidth: HEX_WIDTH / 2,
    borderRightWidth: HEX_WIDTH / 2,
    borderBottomWidth: HEX_HEIGHT / 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F5B400',
  },

  hexagonAfter: {
    position: 'absolute',
    bottom: -HEX_HEIGHT / 2,
    width: 0,
    height: 0,
    borderLeftWidth: HEX_WIDTH / 2,
    borderRightWidth: HEX_WIDTH / 2,
    borderTopWidth: HEX_HEIGHT / 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F5B400',
  },

  walletIcon: {
    width: sw(26),
    height: sh(26),
    tintColor: '#000'
  },
});
