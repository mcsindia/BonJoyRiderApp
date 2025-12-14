import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { s, sf, sh, sw } from '../../utils/scale';
import { getRiderProfile, RiderProfile } from '../../Services/BonjoyApi';

const ProfileScreen = ({ navigation }: any) => {
  const route = useRoute();
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfileData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const storedProfile = await getRiderProfile();
      console.log('Loaded profile from storage:', storedProfile);
      setProfile(storedProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProfileData();
  }, []);

  // Handle refresh when coming back from edit screen
  useFocusEffect(
    React.useCallback(() => {
      const params = route.params as { refresh?: boolean } || {};
      if (params.refresh) {
        console.log('Refreshing profile data from edit...');
        loadProfileData(true);
        // Clear the refresh param to prevent infinite refreshes
        navigation.setParams({ refresh: false });
      }
    }, [route.params, navigation])
  );

  // Manual refresh
  const onRefresh = () => {
    loadProfileData(true);
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string): string => {
    if (!dob) return 'Not specified';
    
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} years`;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'Not specified';
    }
  };

  // Format phone number to show only last 4 digits
  const formatPhoneNumber = (phone: string): string => {
    if (!phone || phone.length < 4) return 'Not specified';
    return `+91 ******${phone.slice(-4)}`;
  };

  // Handle edit profile navigation
  const handleEditPress = () => {
    if (!profile) return;
    
    navigation.navigate('EditProfile', {
      isEditMode: true,
      existingProfile: profile,
    });
  };

  // Handle back to home navigation
  const handleBackPress = () => {
    navigation.navigate('HomeMain');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E293B" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Image
          source={require('../../assets/images/contact.png')}
          style={styles.errorImage}
        />
        <Text style={styles.errorTitle}>No Profile Found</Text>
        <Text style={styles.errorMessage}>
          Please complete your profile setup
        </Text>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.setupButtonText}>Setup Profile</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E293B']}
            tintColor="#1E293B"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
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
          <Text style={styles.userName}>
            {profile.fullName ? `Mr. ${profile.fullName}` : 'No Name'}
          </Text>

          <View style={styles.avatarWrapper}>
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                style={styles.avatar}
                onError={() => console.log('Failed to load profile image')}
              />
            ) : (
              <Image
                source={require('../../assets/images/contact.png')}
                style={styles.avatar}
              />
            )}
          </View>

          <ProfileRow label="Name" value={profile.fullName || 'Not specified'} />
          <ProfileRow 
            label="Phone No." 
            value={formatPhoneNumber(profile.mobile)} 
          />
          <ProfileRow label="Email" value={profile.email || 'Not specified'} />
          <ProfileRow label="Gender" value={profile.gender || 'Not specified'} />
          <ProfileRow label="Age" value={calculateAge(profile.dob)} />
          <ProfileRow 
            label="Status" 
            value={profile.status || 'Not specified'} 
            statusValue={profile.status}
          />
          <ProfileRow label="User Type" value={profile.userType || 'Not specified'} />
          <ProfileRow label="City" value={profile.city || 'Not specified'} />
          <ProfileRow label="Created" value={new Date(profile.createdAt).toLocaleDateString('en-IN') || 'Not specified'} />

          <TouchableOpacity 
            style={styles.editBtn}
            onPress={handleEditPress}
          >
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
/* REUSABLE ROW COMPONENT             */
/* ---------------------------------- */
interface ProfileRowProps {
  label: string;
  value: string;
  statusValue?: string;
}

const ProfileRow = ({ label, value, statusValue }: ProfileRowProps) => {
  const isStatus = label === 'Status';
  
  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        {isStatus && statusValue ? (
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: statusValue === 'Active' ? '#10B981' : 
                              statusValue === 'Inactive' ? '#EF4444' : 
                              '#6B7280' 
            }
          ]}>
            <Text style={styles.statusText}>{value}</Text>
          </View>
        ) : (
          <Text style={styles.value}>{value}</Text>
        )}
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

  /* LOADING STATE */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: sh(20),
    fontSize: sf(16),
    color: '#6B7280',
  },

  /* ERROR/NO DATA STATE */
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: sw(20),
  },
  errorImage: {
    width: sw(120),
    height: sw(120),
    marginBottom: sh(20),
    opacity: 0.6,
  },
  errorTitle: {
    fontSize: sf(20),
    fontWeight: '700',
    color: '#374151',
    marginBottom: sh(8),
  },
  errorMessage: {
    fontSize: sf(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: sh(30),
  },
  setupButton: {
    backgroundColor: '#1E293B',
    paddingVertical: sh(12),
    paddingHorizontal: sw(32),
    borderRadius: s(16),
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: sf(16),
    fontWeight: '600',
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

  statusBadge: {
    paddingHorizontal: sw(12),
    paddingVertical: sh(4),
    borderRadius: s(12),
    alignSelf: 'flex-start',
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: sf(12),
    fontWeight: '600',
  },

  valueContainer: {
    flex: 0.7,
    justifyContent: 'center',
  },
  
  labelContainer: {
    flex: 0.3,
    justifyContent: 'center',
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