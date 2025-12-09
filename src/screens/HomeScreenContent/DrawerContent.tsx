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

const DrawerContent = ({ navigation }: any) => {
  const closeAndNavigate = (screen: string) => {
    navigation.closeDrawer();
    if (screen !== 'Home') {
      navigation.navigate(screen);
    }
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
          <TouchableOpacity style={styles.viewProfileBtn}>
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
    paddingTop: 10
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    width: '100%'
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: getFontFamily('bold'),
  },
  viewProfileBtn: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: getFontFamily('semiBold'),
  },
  menu: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#1F2937',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: getFontFamily('regular'),
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 'auto',
    marginStart: 20
  },
  signOutText: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: getFontFamily('regular'),
  },
});