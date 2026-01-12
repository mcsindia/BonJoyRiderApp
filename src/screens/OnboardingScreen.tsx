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
  BackHandler,
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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const STATES = ['Rajasthan'];
const CITIES: Record<string, string[]> = {
  Rajasthan: ['Kota', 'Ajmer', 'Jaipur'],
};

const GENDERS = ['Male', 'Female'];

const OnboardingScreen = () => {
  const navigation = useNavigation<NavProp>();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showDOB, setShowDOB] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const session = await getUserSession();
      if (session?.mobile) {
        setMobile(session.mobile);
      }
    };

    init();
  }, [navigation]);

  const validateAndSubmit = async () => {
    if (loading) return;

    if (!fullName.trim())
      return Alert.alert('Missing Field', 'Full Name is mandatory');

    if (!mobile)
      return Alert.alert('Missing Field', 'Mobile number is mandatory');

    if (!stateVal) return Alert.alert('Missing Field', 'State is mandatory');

    if (!city) return Alert.alert('Missing Field', 'City is mandatory');

    try {
      setLoading(true);

      const session = await getUserSession();
      if (!session) {
        Alert.alert('Session Expired', 'Please login again');
        return;
      }

      const formData = new FormData();

      formData.append('fullName', fullName);
      formData.append('mobile', mobile);
      formData.append('city', city);
      formData.append('gender', gender);

      if (dob) formData.append('dob', dob.toISOString().split('T')[0]);
      if (email) formData.append('email', email);
      if (pinCode) formData.append('pinCode', pinCode);

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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                BackHandler.exitApp();
              }
            }}
          >
            <Image
              source={require('../assets/images/back_icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.container}>
          {/* SECTION TITLE */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>User Details</Text>
            <Text style={styles.required}>* Required Fields</Text>
          </View>
          <Text style={styles.subTitle}>Add your details to proceed...</Text>

          {/* FULL NAME */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Type here"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* GENDER */}
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            {GENDERS.map(item => (
              <TouchableOpacity
                key={item}
                style={styles.genderItem}
                onPress={() => setGender(item)}
              >
                <View
                  style={[styles.radio, gender === item && styles.radioActive]}
                />
                <Text style={styles.genderText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* DOB */}
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDOB(true)}
          >
            <Text style={!dob ? styles.placeholder : styles.value}>
              {dob ? dob.toLocaleDateString('en-IN') : 'DD/MM/YYYY'}
            </Text>
            <Image
              source={require('../assets/icons/calendar.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* EMAIL */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="@"
            value={email}
            onChangeText={setEmail}
          />

          {/* MOBILE */}
          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.mobileBox}>
            <Image
              source={require('../assets/icons/india_flag.png')}
              style={styles.flag}
            />
            <Text style={styles.code}>+91</Text>
            <TextInput
              style={styles.mobileInput}
              value={mobile}
              editable={false}
            />
          </View>

          {/* STATE */}
          <Text style={styles.label}>State *</Text>
          <TouchableOpacity
            style={styles.input}
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
                })),
              )
            }
          >
            <Text style={!stateVal ? styles.placeholder : styles.value}>
              {stateVal || 'Select'}
            </Text>
            <Image
              source={require('../assets/icons/down_arrow.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* CITY */}
          <Text style={styles.label}>City *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => {
              if (!stateVal) return Alert.alert('Info', 'Select state first');

              Alert.alert(
                'Select City',
                '',
                (CITIES[stateVal] || []).map(c => ({
                  text: c,
                  onPress: () => setCity(c),
                })),
              );
            }}
          >
            <Text style={!city ? styles.placeholder : styles.value}>
              {city || 'Select'}
            </Text>
            <Image
              source={require('../assets/icons/down_arrow.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* PIN */}
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pincode"
            keyboardType="number-pad"
            value={pinCode}
            onChangeText={setPinCode}
            maxLength={6}
          />
        </View>
      </ScrollView>

      {/* BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={validateAndSubmit}>
          <Text style={styles.saveText}>
            {loading ? 'Saving...' : 'Save & Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DATE PICKER */}
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
                style={styles.doneBtn}
                onPress={() => setShowDOB(false)}
              >
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        ))}
    </SafeAreaView>
  );
};

export default OnboardingScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(16),
    justifyContent: 'space-between',
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: getFontFamily('medium'),
    color: '#111',
  },

  container: {
    paddingHorizontal: sw(20),
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: sh(12),
  },
  sectionTitle: {
    fontSize: sf(16),
    fontFamily: getFontFamily('semiBold'),
  },
  required: {
    color: '#EF4444',
    fontSize: sf(12),
  },
  subTitle: {
    color: '#6B7280',
    marginBottom: sh(16),
    fontSize: sf(12),
    fontFamily: getFontFamily('regular'),
  },

  label: {
    marginTop: sh(14),
    marginBottom: sh(6),
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: getFontFamily('regular'),
  },

  placeholder: { color: '#9CA3AF' },
  value: { color: '#111' },
  icon: { width: sw(18), height: sh(18), resizeMode: 'stretch' },

  genderRow: {
    flexDirection: 'row',
    marginTop: sh(4),
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: sw(20),
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 6,
  },
  radioActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B',
  },
  genderText: { fontSize: sf(14), fontFamily: getFontFamily('regular') },

  mobileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F9FAFB',
  },
  flag: { width: 22, height: 14 },
  code: { marginHorizontal: 8, fontWeight: '600' },
  mobileInput: { flex: 1 },

  bottomBar: {
    padding: 16,
  },
  saveBtn: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  doneBtn: {
    backgroundColor: '#111',
    padding: 14,
  },
  doneText: {
    color: '#FFF',
    textAlign: 'center',
  },
});
