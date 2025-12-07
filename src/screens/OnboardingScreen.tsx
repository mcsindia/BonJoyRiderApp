// src/screens/OnboardingScreen.tsx

import React, { useState } from 'react';
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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const FIELD_HEIGHT = 44;

const STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu'];
const CITIES: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune'],
  Karnataka: ['Bangalore', 'Mysore'],
  'Tamil Nadu': ['Chennai', 'Coimbatore'],
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

  /* ---------------- VALIDATIONS ---------------- */

  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;

  const validateAndSubmit = () => {
    if (!fullName.trim())
      return Alert.alert('Missing Field', 'Full Name is mandatory');

    if (!nameRegex.test(fullName))
      return Alert.alert('Invalid Name', 'Name should contain only alphabets');

    if (email && !emailRegex.test(email))
      return Alert.alert('Invalid Email', 'Please enter a valid email address');

    if (!mobile)
      return Alert.alert('Missing Field', 'Mobile number is mandatory');

    if (!mobileRegex.test(mobile))
      return Alert.alert('Invalid Mobile', 'Enter a valid 10-digit mobile number');

    if (!stateVal)
      return Alert.alert('Missing Field', 'State is mandatory');

    if (!city)
      return Alert.alert('Missing Field', 'City is mandatory');

    // ✅ All validation passed
    navigation.replace('Home');
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER IMAGE */}
        <Image
          source={require('../assets/images/profile_bg.png')}
          style={styles.headerBg}
        />

        {/* HEADER TEXT */}
        <Text style={styles.headerText}>Complete Your Profile</Text>

        {/* CARD */}
        <View style={styles.card}>
          {/* Mandatory Row */}
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

          {/* Gender */}
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

          {/* DOB */}
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

          {/* Email */}
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
                onChangeText={setMobile}
                keyboardType="number-pad"
                maxLength={10}
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

          {/* PIN */}
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

          {/* Permanent Address */}
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

          {/* Temporary Address */}
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

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={validateAndSubmit}>
              <Text style={styles.saveText}>Save & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setFullName('');
                setEmail('');
                setMobile('');
                setStateVal('');
                setCity('');
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* DATE PICKER */}
      {showDOB && (
        Platform.OS === 'android' ? (
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
        )
      )}
    </SafeAreaView>
  );
};

export default OnboardingScreen;



const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  container: {
    paddingBottom: 80,
  },

  headerBg: {
    width: '100%',
    height: 150,
    position: 'absolute',
    top: 0,
    resizeMode: 'stretch',
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
    backgroundColor: '#FF8484'
  },

  commonWrapper: {
    marginBottom: 12,
  },

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

  valueText: {
    fontSize: 15,
    color: '#111827',
  },

  placeholder: {
    color: '#9CA3AF',
  },

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

  code: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },

  mobileInput: {
    flex: 1,
    fontSize: 15,
  },

  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 8,
  },

  clearBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 8,
  },

  saveText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },

  clearText: {
    color: '#111827',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});
