import React, { useState, useEffect, useCallback } from 'react';
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
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { s, sf, sh, sw } from '../../../utils/scale';
import {
  getRiderProfile,
  getRiderProfileById,
  getUserSession,
  saveRiderProfile, // Add this import
  RiderProfile,
  transformRiderProfileResult 
} from '../../../Services/BonjoyApi';
import { imageUrl } from '../../../constants/globalConst';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const DEFAULT_PROFILE_IMAGE = require('../../../assets/images/profile.png');

  // Fetch fresh profile data from API and update AsyncStorage
  const fetchFreshProfile = async () => {
    try {
      // 1. Get user session to get user ID
      const session = await getUserSession();
      if (!session) {
        console.log('No session found');
        setProfile(null);
        return;
      }

      console.log('Fetching fresh profile for user ID:', session.id);
      
      // 2. Fetch fresh profile from API using getRiderProfileById
      const response = await getRiderProfileById(session.id);
      
      console.log('API Response:', {
        success: response.data.success,
        message: response.data.message,
        dataLength: response.data.data?.results?.length
      });

      if (response.data.success && response.data.data.results && response.data.data.results.length > 0) {
        // Transform API response to RiderProfile format
        const apiProfile = transformRiderProfileResult(response.data.data.results[0]);
        console.log('Transformed profile from API:', apiProfile);
        
        // Set profile in state for UI
        setProfile(apiProfile);
        
        // ✅ CRITICAL: Update AsyncStorage with fresh data
        try {
          console.log("sanj 1", apiProfile)
          await saveRiderProfile(apiProfile);
          console.log('✅ Profile saved to AsyncStorage');
        } catch (storageError) {
          console.log('❌ Error saving to AsyncStorage:', storageError);
        }
        
        return apiProfile;
      } else {
        console.log('No profile data in API response');
        setProfile(null);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error fetching fresh profile:', {
        message: error.message,
        response: error.response?.data,
      });
      
      // Fallback to AsyncStorage if API fails
      try {
        const storedProfile = await getRiderProfile();
        console.log('Falling back to AsyncStorage profile:', storedProfile);
        setProfile(storedProfile);
        return storedProfile;
      } catch (storageError) {
        console.log('Error loading from AsyncStorage:', storageError);
        setProfile(null);
        return null;
      }
    }
  };

  // Load profile data (with optional refresh UI)
  const loadProfileData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Always fetch fresh data from API
      await fetchFreshProfile();
      
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

  // Refresh when screen is focused (coming back from edit)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Profile screen focused, refreshing data...');
      loadProfileData();
      
      return () => {
        console.log('Profile screen unfocused');
      };
    }, [])
  );

  // Also check route params for manual refresh trigger
  useEffect(() => {
    const params = route.params as { refresh?: boolean } || {};
    if (params.refresh) {
      console.log('🔄 Route params indicate refresh needed');
      loadProfileData(true);
      // Clear the param to avoid infinite loops
      navigation.setParams({ refresh: false });
    }
  }, [route.params]);

  // Manual refresh (pull-to-refresh)
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
          source={require('../../../assets/images/contact.png')}
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

  const profileImageSource = profile?.profileImage
    ? { uri: `${imageUrl}${profile.profileImage}` }
    : DEFAULT_PROFILE_IMAGE;

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
              source={require('../../../assets/icons/left_arrow.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <Image
              source={require('../../../assets/images/applogo.png')}
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
            {profile.fullName ? `${profile.fullName}` : 'No Name'}
          </Text>

          <View style={styles.avatarWrapper}>
            {profile.profileImage ? (
              <Image
                source={profileImageSource}
                style={styles.avatar}
                onError={() => console.log('Failed to load profile image')}
              />
            ) : (
              <Image
                source={require('../../../assets/images/contact.png')}
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
    width: sw(100),
    height: sw(100),
    borderRadius: s(55),
    borderWidth: s(3),
    borderColor: '#E0E7FF',
  },

  row: {
    flexDirection: 'row',
    paddingVertical: sh(5),
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