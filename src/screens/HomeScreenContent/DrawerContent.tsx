// src/screens/HomeScreenContent/DrawerContent.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

import { getFontFamily } from '../../utils/fontFamily';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

import { s, sf, sh, sw } from '../../utils/scale';

const DrawerContent = ({ navigation }: any) => {
  const closeAndNavigate = (screen: string) => {
    navigation.closeDrawer();
  navigation.navigate('HomeTabs', {
    screen: 'Home',
    params: {
      screen: screen,
    },
  });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* YELLOW HEADER WITH PROFILE */}
      <Image
        source={require('../../assets/images/drawer_bg.png')} // 👈 YOUR PNG HERE
        style={styles.headerBg}
        resizeMode='stretch'
      />
      <View style={styles.profileSection}>
      
        <Image
           source={require('../../assets/images/profile.png')}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Sachin Parekh</Text>
          <TouchableOpacity style={styles.viewProfileBtn}
          onPress={ ()=>  closeAndNavigate('Profile')}>
            <Text style={styles.viewProfileText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MENU ITEMS */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('Dashboard')}>
          <Image
            source={require('../../assets/images/home_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('EmergencyContacts')}>
          <Image
            source={require('../../assets/images/contact_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Emergency contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('PersonalProfile')}>
          <Image
            source={require('../../assets/images/personal_account_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Personal Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('HelpSupport')}>
          <Image
            source={require('../../assets/images/support_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Help / Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('SafetyPrivacy')}>
          <Image
            source={require('../../assets/images/safty_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Safety & Privacy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('About')}>
          <Image
            source={require('../../assets/images/about_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>About</Text>
        </TouchableOpacity>
      </View>

      {/* SIGN OUT */}
      <TouchableOpacity style={styles.signOut} onPress={() => navigation.closeDrawer()}>
        <Image
          source={require('../../assets/images/logout_drawer.png')}
          style={styles.icon}
        />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DrawerContent;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: sh(10),
  },

  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: sh(180),
    width: '100%',
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: s(20),
  },

  avatar: {
    width: sw(60),
    height: sh(60),
    borderRadius: s(30),
    marginHorizontal: sw(12),
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: sf(18),
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: getFontFamily('bold'),
  },

  viewProfileBtn: {
    backgroundColor: '#111827',
    borderRadius: s(8),
    paddingHorizontal: sw(12),
    paddingVertical: sh(6),
    marginTop: sh(8),
    alignSelf: 'flex-start',
  },

  viewProfileText: {
    color: '#FFFFFF',
    fontSize: sf(14),
    fontWeight: '600',
    fontFamily: getFontFamily('semiBold'),
  },

  menu: {
    paddingTop: sh(40),
    paddingBottom: sh(16),
    paddingHorizontal: sw(20),
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(16),
    borderBottomWidth: s(1),
    borderBottomColor: '#E2E8F0',
  },

  icon: {
    width: sw(24),
    height: sh(24),
    tintColor: '#1F2937',
    marginRight: sw(16),
  },

  menuText: {
    fontSize: sf(16),
    color: '#1F2937',
    fontFamily: getFontFamily('regular'),
  },

  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sh(16),
    borderTopWidth: s(1),
    borderTopColor: '#E2E8F0',
    marginTop: 'auto',
    marginStart: sw(20),
  },

  signOutText: {
    fontSize: sf(16),
    color: '#1F2937',
    fontFamily: getFontFamily('regular'),
  },
});