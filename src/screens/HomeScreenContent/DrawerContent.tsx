import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
} from 'react-native';

import { getFontFamily } from '../../utils/fontFamily';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, sf, sh, sw } from '../../utils/scale';

// ✅ SESSION & PROFILE HELPERS
import {
  getRiderProfile,
  logout,
  RiderProfile,
} from '../../Services/BonjoyApi';
import { imageUrl } from '../../constants/globalConst';

const { width } = Dimensions.get('window');

const DEFAULT_PROFILE_IMAGE = require('../../assets/images/profile.png');

const DrawerContent = ({ navigation }: any) => {
  const [profile, setProfile] = useState<RiderProfile | null>(null);

  /* =====================================================
     LOAD USER PROFILE
  ====================================================== */

  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = await getRiderProfile();
      setProfile(savedProfile);
    };

    loadProfile();
  }, []);

  /* =====================================================
     NAVIGATION
  ====================================================== */

  const closeAndNavigate = (screen: string) => {
    navigation.closeDrawer();
    navigation.navigate('HomeTabs', {
      screen: 'Home',
      params: {
        screen: screen,
      },
    });
  };

  /* =====================================================
     SIGN OUT
  ====================================================== */

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Splash' }],
            });
          },
        },
      ]
    );
  };

  /* =====================================================
     PROFILE IMAGE SOURCE
  ====================================================== */

  const profileImageSource =
    profile?.profileImage
      ? { uri: `${imageUrl}${profile.profileImage}` }
      : DEFAULT_PROFILE_IMAGE;

  return (
    <SafeAreaView style={styles.container}>
      {/* YELLOW HEADER */}
      <Image
        source={require('../../assets/images/drawer_bg.png')}
        style={styles.headerBg}
        resizeMode="stretch"
      />

      {/* PROFILE SECTION */}
      <View style={styles.profileSection}>
        <Image source={profileImageSource} style={styles.avatar} />

        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {profile?.fullName || 'User'}
          </Text>

          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => closeAndNavigate('Profile')}
          >
            <Text style={styles.viewProfileText}>
              View Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MENU */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('Dashboard')}
        >
          <Image
            source={require('../../assets/images/home_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('')}
        >
          <Image
            source={require('../../assets/images/contact_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Electric</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('')}
        >
          <Image
            source={require('../../assets/images/contact_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Ride History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('')}
        >
          <Image
            source={require('../../assets/images/contact_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Bonjoy Money</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('')}
        >
          <Image
            source={require('../../assets/images/contact_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('')}
        >
          <Image
            source={require('../../assets/images/contact_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Bonjoy Coins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('EmergencyContacts')}
        >
          <Image
            source={require('../../assets/images/contact_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Emergency contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('Profile')}
        >
          <Image
            source={require('../../assets/images/personal_account_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Personal Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('HelpSupport')}
        >
          <Image
            source={require('../../assets/images/support_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Help / Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('SafetyPrivacy')}
        >
          <Image
            source={require('../../assets/images/safty_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>Safety & Privacy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => closeAndNavigate('About')}
        >
          <Image
            source={require('../../assets/images/about_drawer.png')}
            style={styles.icon}
          />
          <Text style={styles.menuText}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Image
          source={require('../../assets/images/logout_drawer.png')}
          style={styles.icon}
        />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
      </View>

      {/* SIGN OUT */}
     
    </SafeAreaView>
  );
};

export default DrawerContent;

/* ================= STYLES (UNCHANGED) ================= */

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
  profileInfo: { flex: 1 },
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
    paddingVertical: sh(8),
    borderBottomWidth: s(1),
    borderBottomColor: '#E2E8F0',
  },
  icon: {
    width: sw(20),
    height: sh(20),
    tintColor: '#1F2937',
    marginRight: sw(16),
  },
  menuText: {
    fontSize: sf(14),
    color: '#1F2937',
    fontFamily: getFontFamily('regular'),
  },
  signOutText: {
    fontSize: sf(14),
    color: '#1F2937',
    fontFamily: getFontFamily('regular'),
  },
});
