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
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getFontFamily } from '../utils/fontFamily';
import { RootStackParamList } from '../navigation/types';
import { s, sf, sh, sw } from '../utils/scale';

import {
  updateRiderProfile,
  getUserSession,
  getRiderProfile,
  hasMandatoryProfileData,
} from '../Services/BonjoyApi';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const FIELD_HEIGHT = 44;

const STATES = ['Rajasthan'];
const CITIES: Record<string, string[]> = {
  Rajasthan: ['Kota', 'Ajmer', 'Jaipur']
};

const GENDERS = ['Male', 'Female', 'Other'];

const OnboardingScreen = () => {
  const navigation = useNavigation<NavProp>();

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
  const [showDOB, setShowDOB] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     AUTO NAVIGATION IF MANDATORY DATA EXISTS
  ====================================================== */

  useEffect(() => {
    const init = async () => {
      const profile = await getRiderProfile();
      if (hasMandatoryProfileData(profile)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }

      // Prefill mobile from OTP session
      const session = await getUserSession();
      if (session?.mobile) {
        setMobile(session.mobile);
      }
    };

    init();
  }, [navigation]);

  /* ---------------- VALIDATIONS ---------------- */

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
      formData.append('remark', 'Onboarding completed');

      await updateRiderProfile(session.id, formData);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../assets/images/profile_bg.png')}
          style={styles.headerBg}
        />

        <Text style={styles.headerText}>Complete Your Profile</Text>

        <View style={styles.card}>
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
              <Image source={require('../assets/icons/down_arrow.png')} />
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
              <Image source={require('../assets/icons/calendar.png')} />
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
            />
          </View>

          {/* Mobile (Mandatory) */}
          <View style={styles.requiredWrapper}>
            <View style={styles.mobileRow}>
              <Image
                source={require('../assets/icons/india_flag.png')}
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
              <Image source={require('../assets/icons/down_arrow.png')} />
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
              <Image source={require('../assets/icons/down_arrow.png')} />
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
            >
              <Text style={styles.saveText}>
                {loading ? 'Saving...' : 'Save & Continue'}
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

export default OnboardingScreen;

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { paddingBottom: 80 },
  headerBg: {
    width: '100%',
    height: sh(150),
    position: 'absolute',
    top: 0,
    resizeMode: 'stretch',
  },
  headerText: {
    marginTop: sh(50),
    fontSize: sf(20),
    fontFamily: getFontFamily('medium'),
    textAlign: 'center',
    color: '#111827',
  },
  card: {
    marginTop: sh(20),
    backgroundColor: '#FFF',
    borderRadius: s(24),
    padding: s(24),
    elevation: s(5),
    marginHorizontal: sw(20),
  },
  mandatoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(16),
  },
  dot: {
    width: sw(8),
    height: sh(8),
    borderRadius: s(4),
    backgroundColor: '#EF4444',
    marginRight: sw(8),
  },
  mandatoryText: {
    fontSize: sf(14),
    color: '#6B7280',
  },
  requiredWrapper: {
    borderRightWidth: sw(4),
    borderRightColor: '#FF8484',
    borderRadius: s(10),
    marginBottom: sh(12),
    backgroundColor: '#FF8484',
  },
  commonWrapper: { marginBottom: sh(12) },
  input: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: s(8),
    paddingHorizontal: sh(16),
    fontSize: sf(15),
    backgroundColor: '#F9FAFB',
  },
  dropdown: {
    height: FIELD_HEIGHT,
    borderWidth: sw(1),
    borderColor: '#E5E7EB',
    borderRadius: s(8),
    paddingHorizontal: sh(10),
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: { fontSize: sf(15), color: '#111827' },
  placeholder: { color: '#9CA3AF' },
  mobileRow: {
    height: FIELD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: s(8),
    paddingHorizontal: sh(12),
  },
  flag: { width: sw(22), height: sh(14), marginRight: sw(8) },
  code: { fontSize: sf(15), fontWeight: '600', marginRight: sw(8) },
  mobileInput: { flex: 1, fontSize: sf(15) },
  textArea: {
    height: sh(80),
    paddingTop: sh(12),
    textAlignVertical: 'top',
  },
  buttonRow: { flexDirection: 'row', marginTop: sh(24) },
  saveBtn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: sw(12),
    borderRadius: s(14),
  },
  saveText: {
    color: '#FFF',
    fontSize: sf(16),
    textAlign: 'center',
    fontWeight: '600',
  },
});
