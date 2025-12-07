import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

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

  const [showDatePicker, setShowDatePicker] = useState(false);

  const genders = ['Male', 'Female', 'Other'];
  const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh'];

  const citiesMap: Record<string, string[]> = {
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
    Karnataka: ['Bangalore', 'Mysore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore'],
    Delhi: ['New Delhi'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur'],
  };

  const showOptions = (title: string, options: string[], onSelect: (v: string) => void) => {
    Alert.alert(
      title,
      '',
      options.map(item => ({
        text: item,
        onPress: () => onSelect(item),
      })),
      { cancelable: true }
    );
  };

  const handleSave = () => {
    if (
      !fullName ||
      !gender ||
      !dob ||
      !mobile ||
      !stateVal ||
      !city ||
      !pinCode ||
      !permanentAddress
    ) {
      Alert.alert('Error', 'Please fill all mandatory fields');
      return;
    }

    navigation.replace('Home');
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.header}>Complete Your Profile</Text>

        <View style={styles.formCard}>

          {/* Mandatory label */}
          <View style={styles.mandatoryRow}>
            <View style={styles.mandatoryDot} />
            <Text style={styles.mandatoryText}>mandatory</Text>
          </View>

          {/* Full Name */}
          <View style={styles.requiredWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#6B7280"
            />
            <View style={styles.requiredBar} />
          </View>

          {/* Gender */}
          <TouchableOpacity
            style={styles.requiredWrapper}
            onPress={() => showOptions('Gender', genders, setGender)}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.dropdownText, !gender && styles.placeholder]}>
                {gender || 'Gender'}
              </Text>
              <Text style={styles.icon}>⌄</Text>
            </View>
            <View style={styles.requiredBar} />
          </TouchableOpacity>

          {/* DOB */}
          <TouchableOpacity
            style={styles.requiredWrapper}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.dropdownText, !dob && styles.placeholder]}>
                {dob ? formatDate(dob) : 'Date Of Birth'}
              </Text>
              <Text style={styles.icon}>📅</Text>
            </View>
            <View style={styles.requiredBar} />
          </TouchableOpacity>

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#6B7280"
          />

          {/* Mobile */}
          <View style={styles.requiredWrapper}>
            <View style={styles.mobileContainer}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.code}>+91</Text>
              <TextInput
                style={styles.mobileInput}
                placeholder="Mobile No."
                value={mobile}
                onChangeText={setMobile}
                keyboardType="number-pad"
                maxLength={10}
                placeholderTextColor="#6B7280"
              />
            </View>
            <View style={styles.requiredBar} />
          </View>

          {/* State */}
          <TouchableOpacity
            style={styles.requiredWrapper}
            onPress={() => showOptions('State', states, setStateVal)}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.dropdownText, !stateVal && styles.placeholder]}>
                {stateVal || 'State'}
              </Text>
              <Text style={styles.icon}>⌄</Text>
            </View>
            <View style={styles.requiredBar} />
          </TouchableOpacity>

          {/* City */}
          <TouchableOpacity
            style={styles.requiredWrapper}
            onPress={() => {
              if (!stateVal) {
                Alert.alert('Info', 'Please select state first');
                return;
              }
              showOptions('City', citiesMap[stateVal] || [], setCity);
            }}
          >
            <View style={styles.dropdown}>
              <Text style={[styles.dropdownText, !city && styles.placeholder]}>
                {city || 'City'}
              </Text>
              <Text style={styles.icon}>⌄</Text>
            </View>
            <View style={styles.requiredBar} />
          </TouchableOpacity>

          {/* PIN */}
          <TextInput
            style={styles.input}
            placeholder="PIN Code"
            value={pinCode}
            onChangeText={setPinCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor="#6B7280"
          />

          {/* Permanent Address */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Permanent Address"
            value={permanentAddress}
            onChangeText={setPermanentAddress}
            multiline
            placeholderTextColor="#6B7280"
          />

          {/* Temporary Address */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Temporary Address"
            value={temporaryAddress}
            onChangeText={setTemporaryAddress}
            multiline
            placeholderTextColor="#6B7280"
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={() => {}}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        Platform.OS === 'android' ? (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            onChange={(_, d) => {
              setShowDatePicker(false);
              if (d) setDob(d);
            }}
          />
        ) : (
          <Modal transparent animationType="slide">
            <View style={styles.dateModal}>
              <DateTimePicker
                value={dob || new Date()}
                mode="date"
                display="spinner"
                onChange={(_, d) => d && setDob(d)}
              />
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.doneText}>Done</Text>
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
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20, paddingBottom: 80 },
  
    header: {
      fontSize: 26,
      fontWeight: '700',
      textAlign: 'center',
      color: '#0F172A',
      marginBottom: 24,
    },
  
    formCard: {
      backgroundColor: '#fff',
      borderRadius: 28,
      padding: 24,
      elevation: 6,
    },
  
    mandatoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    mandatoryDot: { width: 8, height: 8, backgroundColor: '#F87171', borderRadius: 4, marginRight: 8 },
    mandatoryText: { fontSize: 14, color: '#6B7280' },
  
    requiredWrapper: { position: 'relative', marginBottom: 16 },
    requiredBar: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 6,
      backgroundColor: '#F87171',
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
  
    input: {
      backgroundColor: '#EEF2FF',
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
    },
  
    dropdown: {
      backgroundColor: '#EEF2FF',
      borderRadius: 12,
      padding: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  
    dropdownText: { fontSize: 16, color: '#0F172A' },
    placeholder: { color: '#9CA3AF' },
    icon: { fontSize: 16, color: '#6B7280' },
  
    mobileContainer: {
      backgroundColor: '#EEF2FF',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    flag: { fontSize: 16, marginRight: 6 },
    code: { fontSize: 16, marginRight: 10 },
    mobileInput: { flex: 1, fontSize: 16 },
  
    textArea: { height: 90, textAlignVertical: 'top' },
  
    buttonRow: { flexDirection: 'row', marginTop: 24 },
    saveButton: {
      flex: 1,
      backgroundColor: '#0F172A',
      padding: 14,
      borderRadius: 14,
      marginRight: 8,
    },
    clearButton: {
      flex: 1,
      backgroundColor: '#EFF6FF',
      padding: 14,
      borderRadius: 14,
      marginLeft: 8,
    },
    saveText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
    clearText: { color: '#1E40AF', textAlign: 'center', fontWeight: '600' },
  
    dateModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    doneBtn: { backgroundColor: '#0F172A', padding: 16 },
    doneText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 18 },
  });
  