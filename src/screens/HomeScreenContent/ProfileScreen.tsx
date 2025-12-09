import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s, sf, sh, sw } from '../../utils/scale';

const ProfileScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('HomeMain')}>
            <Image
              source={require('../../assets/icons/left_arrow.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <Image
              source={require('../../assets/images/applogo.png')}
              style={styles.logo}
            />

            <View>
              <Text style={styles.welcomeText}>Welcome to Bon Joy</Text>
              <Text style={styles.subText}>
                Making every trip safe, simple, and joyful
              </Text>
            </View>
          </View>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.card}>
          <Text style={styles.userName}>Mr. Nikhil Singh</Text>

          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../assets/images/contact.png')}
              style={styles.avatar}
            />
          </View>

          <ProfileRow label="Name" value="Nikhil Singh" />
          <ProfileRow label="Phone No." value="+91 ******6297" />
          <ProfileRow label="Email" value="nikhil@kconsole.com" />
          <ProfileRow label="Gender" value="Male" />
          <ProfileRow label="Age" value="25 years" />
          <ProfileRow label="State" value="Madhya Pradesh" />
          <ProfileRow label="City" value="Bhopal" />

          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: sh(40) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

/* ---------------------------------- */
/* REUSABLE ROW                       */
/* ---------------------------------- */
const ProfileRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

/* ---------------------------------- */
/* STYLES                             */
/* ---------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* HEADER */
  header: {
    backgroundColor: '#FFC42E',
    paddingHorizontal: sw(16),
    paddingVertical: sh(20),
    borderBottomLeftRadius: s(28),
    borderBottomRightRadius: s(28),
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: sh(150),
  },

  menuIcon: {
    width: sw(10),
    height: sh(20),
    tintColor: '#000',
    marginBottom: sh(12),
    marginTop: sh(8),
  },

  logoRow: {
    flexDirection: 'row',
  },

  logo: {
    width: sw(36),
    height: sh(36),
    marginLeft: sw(25),
  },

  welcomeText: {
    fontSize: sf(18),
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
  },

  subText: {
    fontSize: sf(12),
    color: '#1F2937',
    marginLeft: sh(12),
  },

  /* CARD */
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: sw(16),
    marginTop: sh(-50),
    borderRadius: s(24),
    padding: s(20),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 5,
  },

  userName: {
    textAlign: 'center',
    fontSize: sf(18),
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: sh(12),
  },

  avatarWrapper: {
    alignItems: 'center',
    marginVertical: sh(12),
  },

  avatar: {
    width: sw(110),
    height: sw(110),
    borderRadius: s(55),
    borderWidth: s(3),
    borderColor: '#E0E7FF',
  },

  row: {
    flexDirection: 'row',
    paddingVertical: sh(12),
    borderBottomWidth: s(1),
    borderBottomColor: '#F1F5F9',
  },

  label: {
    color: '#334155',
    fontSize: sf(14),
  },

  value: {
    color: '#0F172A',
    fontSize: sf(14),
    fontWeight: '600',
  },
  valueContainer: {
    flex: 0.7,
  },
  labelContainer: {
    flex: 0.3,
  },
  editBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: sh(12),
    paddingHorizontal: sw(32),
    borderRadius: s(16),
    marginTop: sh(24),
    alignSelf: 'center',
  },

  editText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontWeight: '600',
  },
});
