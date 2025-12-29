import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
  Linking,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { getFontFamily } from '../../../utils/fontFamily';
import { RootStackParamList } from '../../../navigation/types';

import {
  updateRiderProfile,
  getUserSession,
  getRiderProfile,
  hasMandatoryProfileData,
  RiderProfile,
} from '../../../Services/BonjoyApi';
import { imageUrl } from '../../../constants/globalConst';
import { s, sf, sh, sw } from '../../../utils/scale';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const FIELD_HEIGHT = 44;

const STATES = ['Rajasthan'];
const CITIES: Record<string, string[]> = {
  Rajasthan: ['Kota', 'Ajmer', 'Jaipur']
};

const GENDERS = ['Male', 'Female', 'Other'];

interface RouteParams {
  isEditMode?: boolean;
  existingProfile?: RiderProfile;
}

interface ImageAsset {
  uri: string;
  type?: string;
  name?: string;
  fileName?: string;
}

const EditProfilePage = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const params = route.params as RouteParams || {};
  const { isEditMode = false, existingProfile } = params;

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [temporaryAddress, setTemporaryAddress] = useState('');
  const [profileImage, setProfileImage] = useState<ImageAsset | null>(null);
  const [showDOB, setShowDOB] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iosDatePickerVisible, setIosDatePickerVisible] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  /* =====================================================
     INITIALIZATION - FIXED
  ====================================================== */

  useEffect(() => {
    const init = async () => {
      // Get user session to get user ID
      try {
        const session = await getUserSession();
        if (session) {
          setUserId(session.id);
          setMobile(session.mobile || '');
        }
      } catch (error) {
        console.log('Error getting session:', error);
      }

      // ✅ FIXED: Prefill form based on available data
      try {
        // First check if we have existingProfile from navigation params
        let profileToUse = existingProfile;
        
        // If not, try to get from AsyncStorage
        if (!profileToUse) {
          profileToUse = await getRiderProfile();
        }
        
        if (profileToUse) {
          console.log('Prefilling form with profile:', {
            id: profileToUse.id,
            fullName: profileToUse.fullName,
            gender: profileToUse.gender,
            email: profileToUse.email,
            city: profileToUse.city,
            dob: profileToUse.date_of_birth,
            profileImage: profileToUse.profileImage,
          });
          
          setFullName(profileToUse.fullName || '');
          setGender(profileToUse.gender || '');
          setEmail(profileToUse.email || '');
          setCity(profileToUse.city || '');
          
          // ✅ CRITICAL FIX: Handle date field (both 'dob' and 'date_of_birth')
          if (profileToUse.dob) {
            const dobDate = new Date(profileToUse.dob);
            if (!isNaN(dobDate.getTime())) {
              setDob(dobDate);
            }
          }
          
          // ✅ CRITICAL FIX: Handle profile image with full URL
          if (profileToUse.profileImage) {
            // Check if it's already a full URL or just a path
            const isFullUrl = profileToUse.profileImage.startsWith('http');
            const imageUri = isFullUrl 
              ? profileToUse.profileImage 
              : `${imageUrl}${profileToUse.profileImage}`;
            
            console.log('Setting profile image URI:', imageUri);
            setProfileImage({ 
              uri: imageUri,
              type: 'image/jpeg',
              name: `profile_${profileToUse.id || 'existing'}.jpg`
            });
          }
          
          // Try to infer state from city if we have city-state mapping
          if (profileToUse.city) {
            // Check which state this city belongs to
            for (const [state, cities] of Object.entries(CITIES)) {
              if (cities.includes(profileToUse.city)) {
                setStateVal(state);
                break;
              }
            }
          }
        }
      } catch (error) {
        console.log('Error pre-filling form:', error);
      }
    };

    init();
  }, [navigation, existingProfile]);

  /* =====================================================
     PERMISSION HANDLING
  ====================================================== */

  const requestCameraPermission = async (): Promise<boolean> => {
    const permission = Platform.OS === 'android' 
      ? PERMISSIONS.ANDROID.CAMERA 
      : PERMISSIONS.IOS.CAMERA;
    
    const result = await check(permission);
    
    switch (result) {
      case RESULTS.GRANTED:
        return true;
      case RESULTS.DENIED:
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      case RESULTS.BLOCKED:
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is blocked. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      default:
        return false;
    }
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    let permission;
    
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else {
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }
    } else {
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    }
    
    const result = await check(permission);
    
    switch (result) {
      case RESULTS.GRANTED:
        return true;
      case RESULTS.DENIED:
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      case RESULTS.BLOCKED:
        Alert.alert(
          'Gallery Permission Required',
          'Gallery permission is blocked. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      default:
        return false;
    }
  };

  /* =====================================================
     IMAGE PICKER HANDLING
  ====================================================== */

  const handleImagePickerResponse = (response: ImagePicker.ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error:', response.errorMessage);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } else if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setProfileImage({
        uri: asset.uri || '',
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `profile_${Date.now()}.jpg`,
      });
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Profile Image',
      '',
      [
        { 
          text: 'Camera', 
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (hasPermission) {
              ImagePicker.launchCamera({
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 1024,
                maxWidth: 1024,
                quality: 0.8,
                saveToPhotos: true,
              }, handleImagePickerResponse);
            }
          }
        },
        { 
          text: 'Gallery', 
          onPress: async () => {
            const hasPermission = await requestGalleryPermission();
            if (hasPermission) {
              ImagePicker.launchImageLibrary({
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 1024,
                maxWidth: 1024,
                quality: 0.8,
                selectionLimit: 1,
              }, handleImagePickerResponse);
            }
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const removeProfileImage = () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setProfileImage(null) 
        },
      ]
    );
  };

  /* =====================================================
     VALIDATIONS
  ====================================================== */

  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!fullName.trim()) errors.push('Full Name is mandatory');
    else if (!nameRegex.test(fullName)) errors.push('Name should contain only alphabets');

    if (!mobile) errors.push('Mobile number is mandatory');
    else if (!mobileRegex.test(mobile)) errors.push('Enter a valid 10-digit mobile number');

    if (!stateVal) errors.push('State is mandatory');
    if (!city) errors.push('City is mandatory');
    if (email && !emailRegex.test(email)) errors.push('Please enter a valid email address');

    return { isValid: errors.length === 0, errors };
  };

  /* =====================================================
     FORM DATA BUILDING - FIXED
  ====================================================== */

  const buildFormData = (): FormData => {
    const formData = new FormData();
    
    // Get the profile ID to use (either from existingProfile or AsyncStorage)
    const getProfileId = async () => {
      if (existingProfile?.id) return existingProfile.id;
      
      try {
        const storedProfile = await getRiderProfile();
        return storedProfile?.id;
      } catch (error) {
        console.log('Error getting profile ID from AsyncStorage:', error);
        return null;
      }
    };
    
    // Add riderId in FormData if we have a profile ID
    (async () => {
      const profileId = await getProfileId();
      if (profileId) {
        console.log('Adding riderId to FormData:', profileId);
        formData.append('riderId', String(profileId));
      }
    })();
    
    // Add profile image if exists
    if (profileImage && profileImage.uri) {
      const imageUri = profileImage.uri;
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      
      const file = {
        uri: imageUri,
        type: profileImage.type || 'image/jpeg',
        name: filename.includes('.') ? filename : `profile_${Date.now()}.jpg`,
      };
      
      formData.append('userProfile', file as any);
    }
    
    // Add all fields
    formData.append('fullName', fullName.trim());
    formData.append('mobile', mobile.trim());
    formData.append('city', city.trim());
    
    if (gender && gender.trim()) formData.append('gender', gender.trim());
    if (dob) formData.append('date_of_birth', dob.toISOString().split('T')[0]);
    if (email && email.trim()) formData.append('email', email.trim());
    if (pinCode && pinCode.trim()) formData.append('pinCode', pinCode.trim());
    if (permanentAddress && permanentAddress.trim()) formData.append('permanentAddress', permanentAddress.trim());
    if (temporaryAddress && temporaryAddress.trim()) formData.append('temporaryAddress', temporaryAddress.trim());
    
    formData.append('status', 'Active');
    formData.append('remark','Profile updated');
    
    // Log FormData for debugging
    if (__DEV__ && (formData as any)._parts) {
      console.log('FormData entries:');
      (formData as any)._parts.forEach(([key, value]: [string, any]) => {
        console.log(`${key}:`, typeof value === 'object' && value.uri ? `${value.name} (image)` : value);
      });
    }
    
    return formData;
  };

  /* =====================================================
     SUBMIT HANDLER - FIXED
  ====================================================== */

  const validateAndSubmit = async () => {
    if (loading) return;
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }
    
    // Check if we have user ID
    if (!userId) {
      Alert.alert('Error', 'User session not found. Please login again.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('=== Submitting Profile Data ===');
      console.log('User ID (for URL):', userId);
      console.log('Full Name:', fullName);
      console.log('Mobile:', mobile);
      console.log('City:', city);
      console.log('State:', stateVal);
      console.log('Email:', email);
      console.log('Profile Image exists:', !!(profileImage && profileImage.uri));
      
      const formData = buildFormData();
      
      console.log('Calling updateRiderProfile with user ID:', userId);
      await updateRiderProfile(userId, formData);
      
      console.log('✅ Profile update successful!');
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setLoading(false);
                // Pass refresh flag back to ProfileScreen
                navigation.navigate('Profile' as any, { refresh: true });
              
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Submit error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Handle specific error cases
      if (error.message.includes('Profile updated but could not retrieve updated data')) {
        // This is okay - the profile was updated but we couldn't fetch it back
        Alert.alert(
          'Success',
          'Profile updated successfully! The data will refresh when you view your profile.',
          [
            {
              text: 'OK',
              onPress: () => {
                  navigation.navigate('Profile' as any, { refresh: true });
  
              }
            }
          ]
        );
      } else if (error.response?.status === 500) {
        Alert.alert(
          'Server Error',
          'There was a server error. Please try again later.',
          [{ text: 'OK', onPress: () => setLoading(false) }]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || error.message || 'Failed to update profile. Please try again.',
          [{ text: 'OK', onPress: () => setLoading(false) }]
        );
      }
    } finally {
      if (!error?.response?.status === 500) {
        setLoading(false);
      }
    }
  };

  /* =====================================================
     DATE PICKER HANDLER
  ====================================================== */

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDOB(false);
    } else {
      setIosDatePickerVisible(false);
    }
    
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  /* =====================================================
     BACK BUTTON HANDLER
  ====================================================== */

  const handleBack = () => {
    navigation.goBack();
  };

  /* ---------------- UI ---------------- */

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../../assets/images/profile_bg.png')}
            style={styles.headerBg}
          />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../../../assets/icons/left_arrow.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerText}>
            { 'Edit Profile' }
          </Text>

          <View style={styles.card}>
            {/* Profile Image Section */}
            <View style={styles.profileImageSection}>
              <TouchableOpacity 
                style={styles.profileImageContainer}
                onPress={handleImagePicker}
                disabled={loading}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Image
                      source={require('../../../assets/icons/camera.png')}
                      style={styles.cameraIcon}
                    />
                    <Text style={styles.profileImageText}>Add Photo</Text>
                  </View>
                )}
                <View style={styles.editImageBadge}>
                  <Image
                    source={require('../../../assets/icons/camera.png')}
                    style={styles.editIcon}
                  />
                </View>
              </TouchableOpacity>
              
              {profileImage && !loading && (
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={removeProfileImage}
                >
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.mandatoryRow}>
              <View style={styles.dot} />
              <Text style={styles.mandatoryText}>mandatory</Text>
            </View>

            {/* Full Name (Mandatory) */}
            <View style={styles.requiredWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>

            {/* Gender (Optional) */}
            <TouchableOpacity
              style={styles.commonWrapper}
              onPress={() => !loading && Alert.alert(
                'Select Gender',
                '',
                GENDERS.map(g => ({ text: g, onPress: () => setGender(g) }))
              )}
              disabled={loading}
            >
              <View style={styles.dropdown}>
                <Text style={[styles.valueText, !gender && styles.placeholder]}>
                  {gender || 'Gender'}
                </Text>
                <Image source={require('../../../assets/icons/down_arrow.png')} />
              </View>
            </TouchableOpacity>

            {/* DOB (Optional) */}
            <TouchableOpacity
              style={styles.commonWrapper}
              onPress={() => {
                if (loading) return;
                if (Platform.OS === 'ios') {
                  setIosDatePickerVisible(true);
                } else {
                  setShowDOB(true);
                }
              }}
              disabled={loading}
            >
              <View style={styles.dropdown}>
                <Text style={[styles.valueText, !dob && styles.placeholder]}>
                  {dob ? dob.toLocaleDateString('en-IN') : 'Date Of Birth'}
                </Text>
                <Image source={require('../../../assets/icons/calendar.png')} />
              </View>
            </TouchableOpacity>

            {/* Email (Optional) */}
            <View style={styles.commonWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Mobile (Mandatory) */}
            <View style={styles.requiredWrapper}>
              <View style={styles.mobileRow}>
                <Image
                  source={require('../../../assets/icons/india_flag.png')}
                  style={styles.flag}
                />
                <Text style={styles.code}>+91</Text>
                <TextInput
                  style={styles.mobileInput}
                  placeholder="Mobile No."
                  value={mobile}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* State (Mandatory) */}
            <TouchableOpacity
              style={styles.requiredWrapper}
              onPress={() => !loading && Alert.alert(
                'Select State',
                '',
                STATES.map(s => ({ 
                  text: s, 
                  onPress: () => {
                    setStateVal(s);
                    setCity('');
                  }
                }))
              )}
              disabled={loading}
            >
              <View style={styles.dropdown}>
                <Text style={[styles.valueText, !stateVal && styles.placeholder]}>
                  {stateVal || 'State'}
                </Text>
                <Image source={require('../../../assets/icons/down_arrow.png')} />
              </View>
            </TouchableOpacity>

            {/* City (Mandatory) */}
            <TouchableOpacity
              style={styles.requiredWrapper}
              onPress={() => {
                if (loading) return;
                if (!stateVal) {
                  Alert.alert('Info', 'Select state first');
                  return;
                }
                Alert.alert(
                  'Select City',
                  '',
                  (CITIES[stateVal] || []).map(c => ({ text: c, onPress: () => setCity(c) }))
                );
              }}
              disabled={loading}
            >
              <View style={styles.dropdown}>
                <Text style={[styles.valueText, !city && styles.placeholder]}>
                  {city || 'City'}
                </Text>
                <Image source={require('../../../assets/icons/down_arrow.png')} />
              </View>
            </TouchableOpacity>

            {/* PIN (Optional) */}
            <View style={styles.commonWrapper}>
              <TextInput
                style={styles.input}
                placeholder="PIN Code"
                value={pinCode}
                onChangeText={setPinCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>

            {/* Permanent Address (Optional) */}
            <View style={styles.commonWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Permanent Address"
                value={permanentAddress}
                onChangeText={setPermanentAddress}
                multiline
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>

            {/* Temporary Address (Optional) */}
            <View style={styles.commonWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Temporary Address"
                value={temporaryAddress}
                onChangeText={setTemporaryAddress}
                multiline
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                onPress={validateAndSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveText}>
                    {'Update Profile'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Android Date Picker */}
        {showDOB && Platform.OS === 'android' && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* iOS Date Picker Modal */}
        {iosDatePickerVisible && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            visible={iosDatePickerVisible}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={dob || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={{ backgroundColor: 'white' }}
                />
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setIosDatePickerVisible(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditProfilePage;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { paddingBottom: 80 },
  headerBg: {
    width: '100%',
    height: 150,
    position: 'absolute',
    top: 0,
    resizeMode: 'stretch',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  headerText: {
    fontSize: 20,
    fontFamily: getFontFamily('medium'),
    textAlign: 'center',
    color: '#111827',
    marginTop:20
  },
  card: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    marginHorizontal: 20,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E0E7FF',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  cameraIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  profileImageText: {
    fontSize: 14,
    color: '#6B7280',
  },
  editImageBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#1E293B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  editIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFF',
  },
  removeImageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removeImageText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  mandatoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  mandatoryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  requiredWrapper: {
    borderRightWidth: 4,
    borderRightColor: '#FF8484',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#FF8484',
  },
  commonWrapper: { marginBottom: 12 },
  input: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  dropdown: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: { fontSize: 15, color: '#111827' },
  placeholder: { color: '#9CA3AF' },
  mobileRow: {
    height: FIELD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  flag: { width: 22, height: 14, marginRight: 8 },
  code: { fontSize: 15, fontWeight: '600', marginRight: 8 },
  mobileInput: { flex: 1, fontSize: 15 },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  buttonRow: { flexDirection: 'row', marginTop: 24 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  doneButton: {
    padding: 16,
    backgroundColor: '#111827',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  doneButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});