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
} from 'react-native';

import { getFontFamily } from '../utils/fontFamily';

const FIELD_HEIGHT = 44;

const OnboardingScreen = () => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [temporaryAddress, setTemporaryAddress] = useState('');

  const onPressMock = (label: string) => {
    console.log(label, 'clicked');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER IMAGE */}
        <Image
          source={require('../assets/images/profile_bg.png')}
          style={styles.headerBg}
        />

        {/* HEADER TEXT ON IMAGE */}
        <Text style={styles.headerText}>Complete Your Profile</Text>

        {/* CARD */}
        <View style={styles.card}>
          {/* Mandatory Row */}
          <View style={styles.mandatoryRow}>
            <View style={styles.dot} />
            <Text style={styles.mandatoryText}>mandatory</Text>
          </View>

          {/* Full Name */}
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
            onPress={() => onPressMock('Gender')}
            activeOpacity={0.7}
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
            onPress={() => onPressMock('DOB')}
            activeOpacity={0.7}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.valueText, !dob && styles.placeholder]}>
                {dob || 'Date Of Birth'}
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

          {/* Mobile */}
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
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* State */}
          <TouchableOpacity
            style={styles.requiredWrapper}
            onPress={() => onPressMock('State')}
            activeOpacity={0.7}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.valueText, !stateVal && styles.placeholder]}>
                {stateVal || 'State'}
              </Text>
              <Image source={require('../assets/icons/down_arrow.png')} />
            </View>
          </TouchableOpacity>

          {/* City */}
          <TouchableOpacity
            style={styles.requiredWrapper}
            onPress={() => onPressMock('City')}
            activeOpacity={0.7}
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
              placeholderTextColor="#9CA3AF"
            />{' '}
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
              style={[styles.input]}
              placeholder="Temporary Address"
              value={temporaryAddress}
              onChangeText={setTemporaryAddress}
              multiline
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveText}>Save & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
