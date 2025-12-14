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
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { getFontFamily } from '../../utils/fontFamily';
import { RootStackParamList } from '../../navigation/types';

import {
  updateRiderProfile,
  getUserSession,
  getRiderProfile,
  hasMandatoryProfileData,
  RiderProfile,
} from '../../Services/BonjoyApi';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const FIELD_HEIGHT = 44;

const STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu'];
const CITIES: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune'],
  Karnataka: ['Bangalore', 'Mysore'],
  'Tamil Nadu': ['Chennai', 'Coimbatore'],
};

const GENDERS = ['Male', 'Female', 'Other'];

interface RouteParams {
  isEditMode?: boolean;
  existingProfile?: RiderProfile;
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
  const [profileImage, setProfileImage] = useState<any>(null);
  const [showDOB, setShowDOB] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     INITIALIZATION
  ====================================================== */

  useEffect(() => {
    const init = async () => {
      // If not in edit mode, check if we should auto-navigate
      if (!isEditMode) {
        const profile = await getRiderProfile();
        if (hasMandatoryProfileData(profile)) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
          return;
        }
      }

      // Prefill form based on mode
      if (isEditMode && existingProfile) {
        // Edit mode: Prefill with existing profile
        setFullName(existingProfile.fullName || '');
        setGender(existingProfile.gender || '');
        setEmail(existingProfile.email || '');
        setMobile(existingProfile.mobile || '');
        setCity(existingProfile.city || '');
        
        // Parse date of birth
        if (existingProfile.dob) {
          const dobDate = new Date(existingProfile.dob);
          if (!isNaN(dobDate.getTime())) {
            setDob(dobDate);
          }
        }
        
        // Set existing profile image if available
        if (existingProfile.profileImage) {
          setProfileImage({ uri: existingProfile.profileImage });
        }
      } else {
        // New onboarding: Prefill mobile from session
        const session = await getUserSession();
        if (session?.mobile) {
          setMobile(session.mobile);
        }
      }
    };

    init();
  }, [navigation, isEditMode, existingProfile]);

  /* =====================================================
     PERMISSION HANDLING
  ====================================================== */

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const permission = PERMISSIONS.ANDROID.CAMERA;
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
              { 
                text: 'Open Settings', 
                onPress: () => Linking.openSettings() 
              },
            ]
          );
          return false;
        default:
          return false;
      }
    } else if (Platform.OS === 'ios') {
      const permission = PERMISSIONS.IOS.CAMERA;
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
              { 
                text: 'Open Settings', 
                onPress: () => Linking.openSettings() 
              },
            ]
          );
          return false;
        default:
          return false;
      }
    }
    
    return false;
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      let permission;
      
      // For Android 13+ (API level 33+)
      if (Platform.Version >= 33) {
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else {
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
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
              { 
                text: 'Open Settings', 
                onPress: () => Linking.openSettings() 
              },
            ]
          );
          return false;
        default:
          return false;
      }
    } else if (Platform.OS === 'ios') {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const result = await check(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return true;
        case RESULTS.DENIED:
          const requestResult = await request(permission);
          return requestResult === RESULTS.GRANTED;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Photo Library Permission Required',
            'Photo library permission is blocked. Please enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => Linking.openSettings() 
              },
            ]
          );
          return false;
        default:
          return false;
      }
    }
    
    return false;
  };

  /* =====================================================
     PROFILE IMAGE HANDLING
  ====================================================== */

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
              takePhoto();
            }
          }
        },
        { 
          text: 'Gallery', 
          onPress: async () => {
            const hasPermission = await requestGalleryPermission();
            if (hasPermission) {
              pickImage();
            }
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const pickImage = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.8,
      selectionLimit: 1,
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setProfileImage({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `profile_${Date.now()}.jpg`,
        });
      }
    });
  };

  const takePhoto = () => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setProfileImage({
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `profile_${Date.now()}.jpg`,
        });
      }
    });
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

  /* =====================================================
     SUBMIT HANDLER
  ====================================================== */

  const validateAndSubmit = async () => {
    if (loading) return;
  
    /* ---- MANDATORY FIELD VALIDATION ONLY ---- */
  
    if (!fullName.trim())
      return Alert.alert('Missing Field', 'Full Name is mandatory');
  
    if (!nameRegex.test(fullName))
      return Alert.alert('Invalid Name', 'Name should contain only alphabets');
  
    if (!mobile)
      return Alert.alert('Missing Field', 'Mobile number is mandatory');
  
    if (!mobileRegex.test(mobile))
      return Alert.alert('Invalid Mobile', 'Enter a valid 10-digit mobile number');
  
    if (!stateVal)
      return Alert.alert('Missing Field', 'State is mandatory');
  
    if (!city)
      return Alert.alert('Missing Field', 'City is mandatory');
  
    /* ---- OPTIONAL FIELD VALIDATION (ONLY IF FILLED) ---- */
  
    if (email && !emailRegex.test(email))
      return Alert.alert('Invalid Email', 'Please enter a valid email address');
  
    try {
      setLoading(true);
  
      const session = await getUserSession();
      if (!session) {
        Alert.alert('Session Expired', 'Please login again');
        return;
      }
  
      const formData = new FormData();
  
      // Add profile image if selected - CORRECTED VERSION
      if (profileImage && profileImage.uri) {
        const imageUri = profileImage.uri;
        const imageName = imageUri.split('/').pop() || `profile_${Date.now()}.jpg`;
        const imageType = imageName.split('.').pop() || 'jpg';
        
        // CORRECTED: Use the proper format for React Native FormData
        formData.append('profileImage', {
          uri: imageUri,
          type: `image/${imageType}`,
          name: imageName,
        });
      }
  
      // Mandatory fields
      formData.append('fullName', fullName);
      formData.append('mobile', mobile);
      formData.append('city', city);
  
      // Optional fields (send only if filled)
      if (gender) formData.append('gender', gender);
      if (dob)
        formData.append(
          'dob',
          dob.toISOString().split('T')[0]
        );
      if (email) formData.append('email', email);
      if (pinCode) formData.append('pinCode', pinCode);
      if (permanentAddress)
        formData.append('permanentAddress', permanentAddress);
      if (temporaryAddress)
        formData.append('temporaryAddress', temporaryAddress);
  
      formData.append('status', 'Active');
      formData.append('remark', isEditMode ? 'Profile updated' : 'Onboarding completed');
  
      // Log the form data for debugging
      console.log('FormData being sent:', {
        fullName,
        mobile,
        city,
        gender,
        dob: dob?.toISOString().split('T')[0],
        email,
        pinCode,
        permanentAddress,
        temporaryAddress,
        hasImage: !!(profileImage && profileImage.uri),
        imageName: profileImage?.name,
      });
  
      await updateRiderProfile(session.id, formData);
  
      // Navigate back with refresh flag
      navigation.navigate('Profile', { refresh: true });
    } catch (error: any) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', `Failed to update profile. ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     BACK BUTTON HANDLER
  ====================================================== */

  const handleBack = () => {
    // Navigate back without refresh flag
    navigation.goBack();
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../../assets/images/profile_bg.png')}
          style={styles.headerBg}
        />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('../../assets/icons/left_arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerText}>
          {isEditMode ? 'Edit Profile' : 'Complete Your Profile'}
        </Text>

        <View style={styles.card}>
          {/* Profile Image Section */}
          <View style={styles.profileImageSection}>
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={handleImagePicker}
            >
              {profileImage ? (
                <Image
                  source={profileImage.uri ? { uri: profileImage.uri } : profileImage}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Image
                    source={require('../../assets/icons/camera.png')}
                    style={styles.cameraIcon}
                  />
                  <Text style={styles.profileImageText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.editImageBadge}>
                <Image
                  source={require('../../assets/icons/camera.png')}
                  style={styles.editIcon}
                />
              </View>
            </TouchableOpacity>
            
            {profileImage && (
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
            />
          </View>

          {/* Gender (Optional) */}
          <TouchableOpacity
            style={styles.commonWrapper}
            onPress={() =>
              Alert.alert(
                'Select Gender',
                '',
                GENDERS.map(g => ({
                  text: g,
                  onPress: () => setGender(g),
                }))
              )
            }
          >
            <View style={styles.dropdown}>
              <Text style={[styles.valueText, !gender && styles.placeholder]}>
                {gender || 'Gender'}
              </Text>
              <Image source={require('../../assets/icons/down_arrow.png')} />
            </View>
          </TouchableOpacity>

          {/* DOB (Optional) */}
          <TouchableOpacity
            style={styles.commonWrapper}
            onPress={() => setShowDOB(true)}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.valueText, !dob && styles.placeholder]}>
                {dob ? dob.toLocaleDateString('en-IN') : 'Date Of Birth'}
              </Text>
              <Image source={require('../../assets/icons/calendar.png')} />
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
            />
          </View>

          {/* Mobile (Mandatory) */}
          <View style={styles.requiredWrapper}>
            <View style={styles.mobileRow}>
              <Image
                source={require('../../assets/icons/india_flag.png')}
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
            onPress={() =>
              Alert.alert(
                'Select State',
                '',
                STATES.map(s => ({
                  text: s,
                  onPress: () => {
                    setStateVal(s);
                    setCity('');
                  },
                }))
              )
            }
          >
            <View style={styles.dropdown}>
              <Text style={[styles.valueText, !stateVal && styles.placeholder]}>
                {stateVal || 'State'}
              </Text>
              <Image source={require('../../assets/icons/down_arrow.png')} />
            </View>
          </TouchableOpacity>

          {/* City (Mandatory) */}
          <TouchableOpacity
            style={styles.requiredWrapper}
            onPress={() => {
              if (!stateVal)
                return Alert.alert('Info', 'Select state first');

              Alert.alert(
                'Select City',
                '',
                (CITIES[stateVal] || []).map(c => ({
                  text: c,
                  onPress: () => setCity(c),
                }))
              );
            }}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.valueText, !city && styles.placeholder]}>
                {city || 'City'}
              </Text>
              <Image source={require('../../assets/icons/down_arrow.png')} />
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
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={validateAndSubmit}
              disabled={loading}
            >
              <Text style={styles.saveText}>
                {loading ? 'Saving...' : isEditMode ? 'Update Profile' : 'Save & Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showDOB &&
        (Platform.OS === 'android' ? (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            onChange={(_, d) => {
              setShowDOB(false);
              if (d) setDob(d);
            }}
          />
        ) : (
          <Modal transparent>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <DateTimePicker
                value={dob || new Date()}
                mode="date"
                onChange={(_, d) => d && setDob(d)}
              />
              <TouchableOpacity
                style={{ padding: 16, backgroundColor: '#111827' }}
                onPress={() => setShowDOB(false)}
              >
                <Text style={{ color: '#FFF', textAlign: 'center' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        ))}
    </SafeAreaView>
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
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  headerText: {
    marginTop: 50,
    fontSize: 20,
    fontFamily: getFontFamily('medium'),
    textAlign: 'center',
    color: '#111827',
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
    opacity: 1,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});