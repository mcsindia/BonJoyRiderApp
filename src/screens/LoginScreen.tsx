// src/screens/MobileVerificationScreen.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getFontFamily } from '../utils/fontFamily';
import { s, sf, sh, sw } from '../utils/scale';
import axios from 'axios';
import https from 'https';

const BOTTOM_IMAGE_HEIGHT = 200;
const OTP_LENGTH = 4;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const MobileVerificationScreen = () => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [countryCode, setCountryCode] = useState('IN'); // Default: India
  const [callingCode, setCallingCode] = useState('91');
  const [pickerVisible, setPickerVisible] = useState(false);

  const navigation = useNavigation<NavProp>();
  const otpRefs = useRef<TextInput[]>([]);

  // Only allow digits
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };



  // axios.get('https://bonjoy.in:5000/api/v1/getAllRiderProfiles?page=2&limit=10',
  //   {
  //     httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  //   }
  // )
  // .then(res => console.log(res.data))
  // .catch(err => console.log(err));

  // const response = axios.post(
  //   'https://bonjoy.in:5000/api/v1/loginWithMobile',
  //   {
  //     "mobile": '7648845208',
  //   },
  //   {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     timeout: 15000,
  //   }
  // );


  // console.log('✅ OTP API Responses:', response.data);
  
  const onNextPress = useCallback(() => {
    if (phone.length === 10) {
      setStep('OTP');
    }
  }, [phone]);

  const onOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const onVerifyPress = () => {
    if (isOtpComplete) {
      navigation.navigate('Onboarding');
    }
  };

  const onSelectCountry = (country: any) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] || '91');
    setPickerVisible(false);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.headerBg}>
            <Image
              source={require('../assets/images/scoorter.png')}
              style={styles.scooterImg}
              resizeMode="contain"
            />
          </View>

          {/* CARD */}
          <View style={styles.card}>
            {step === 'PHONE' && (
              <>
                <Text style={styles.title}>Enter Mobile number for verification</Text>

                <Text style={styles.subtitle}>
                  This number will be used for ride-related {'\n'}communication. You
                  will receive an SMS code for verification.
                </Text>

                {/* PHONE INPUT - WITH COUNTRY PICKER */}
                <View style={styles.phoneInputContainer}>
                  <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setPickerVisible(true)}
                  >
                    <CountryPicker
                      withFlag
                      withEmoji
                      countryCode={countryCode}
                      withCallingCode={false}
                      withFilter
                      visible={pickerVisible}
                      onSelect={onSelectCountry}
                      onClose={() => setPickerVisible(false)}
                      theme={{
                        fontFamily: getFontFamily('regular'),
                      }}
                    />
                    <Image style={styles.downArrow}
                    source={require('../assets/icons/down_arrow.png')}
                    />
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <View style={styles.codeAndInput}>
                    <Text style={styles.callingCode}>+{callingCode}</Text>
                    <TextInput
                      value={phone}
                      onChangeText={handlePhoneChange}
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="Mobile number"
                      placeholderTextColor="#9CA3AF"
                      style={styles.phoneInput}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, { opacity: phone.length === 10 ? 1 : 0.6 }]}
                  onPress={onNextPress}
                  disabled={phone.length !== 10}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'OTP' && (
              <>
                <Text style={styles.title}>Log in using the OTP sent to</Text>
                <Text style={styles.title}>+{callingCode}******{phone.slice(-4)}</Text>

                <View style={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={el => (otpRefs.current[index] = el!)}
                      value={digit}
                      onChangeText={val => onOtpChange(val, index)}
                      onKeyPress={({ nativeEvent }) => onOtpKeyPress(nativeEvent.key, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      style={styles.otpBox}
                      caretHidden={true}
                    />
                  ))}
                </View>

                <View style={styles.resendRow}>
                  <Text style={styles.resendText}>Didn’t get the OTP?</Text>
                  <TouchableOpacity onPress={() => setShowOtpDialog(true)}>
                    <Text style={styles.resendAction}>Resend again</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.button, { opacity: isOtpComplete ? 1 : 0.6 }]}
                  onPress={onVerifyPress}
                  disabled={!isOtpComplete}
                >
                  <Text style={styles.buttonText}>Verify</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* FIXED BOTTOM IMAGE */}
      <View pointerEvents="none" style={styles.absoluteBottom}>
        <Image
          source={require('../assets/images/bottombg.png')}
          style={styles.bottomImage}
          resizeMode="contain"
        />
      </View>

      {/* OTP Resent Modal */}
      <Modal visible={showOtpDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>OTP sent. It will reach you shortly</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowOtpDialog(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MobileVerificationScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: BOTTOM_IMAGE_HEIGHT + 40 },
  headerBg: {
    height: sh(280),
    backgroundColor: '#FFC533',
    borderBottomLeftRadius: s(32),
    borderBottomRightRadius: s(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scooterImg: { width: '78%', height: '78%' },
  card: {
    marginHorizontal: sw(20),
    marginTop: sh(-80),
    backgroundColor: '#FFF',
    borderRadius: s(24),
    padding: s(24),
    elevation: 6,
  },
  title: {
    fontSize: sf(20),
    color: '#0F172A',
    marginBottom: sh(10),
    fontFamily: getFontFamily('semiBold'),
  },
  subtitle: {
    fontSize: sf(10),
    color: '#AEAAAA',
    marginBottom: sh(24),
    fontFamily: getFontFamily('regular'),
    lineHeight: sf(22),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sh(50),
    borderRadius: s(30),
    borderWidth: 1.2,
    borderColor: '#B4CBFF',
    marginBottom: sh(24),
    backgroundColor: '#F8FAFC',
    paddingStart: sw(10)
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  downArrow: {
    fontSize: sf(14),
    color: '#6B7280',
    marginLeft: sw(4),
  },
  divider: {
    width: 1,
    height: sh(24),
    backgroundColor: '#D1D5DB',
    marginHorizontal: sh(12),
  },
  codeAndInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  callingCode: {
    fontSize: sf(18),
    fontWeight: '500',
    color: '#0F172A',
    fontFamily: getFontFamily('regular')
  },
  phoneInput: {
    flex: 1,
    fontSize: sf(18),
    color: '#0F172A',
    paddingVertical: 0,
    fontFamily: getFontFamily('regular'),
    textAlignVertical: 'center'
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sh(24),
  },
  otpBox: {
    width: sw(56),
    height: sh(56),
    borderRadius: s(12),
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    fontSize: sf(20),
    textAlign: 'center',
    fontFamily: getFontFamily('semiBold'),
  },
  resendRow: { flexDirection: 'row', marginBottom: 24, flex: 1, justifyContent: 'space-between' },
  resendText: {
    fontSize: sf(15),
    color: '#6B7280'
  },
  resendAction: {
    fontSize: sf(15),
    color: '#FBBF24',
    fontFamily: getFontFamily('semiBold')
  },
  button: {
    height: sh(56),
    backgroundColor: '#0F172A',
    borderRadius: s(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: sf(18),
    color: '#FFF',
    fontFamily: getFontFamily('semiBold'),
  },
  absoluteBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: BOTTOM_IMAGE_HEIGHT,
  },
  bottomImage: { width: '100%', height: '100%' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '82%',
    backgroundColor: '#FFF',
    borderRadius: s(24),
    padding: s(24),
    alignItems: 'center',
    elevation: 8,
  },
  modalText: {
    fontSize: sf(18),
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: sh(20),
    lineHeight: sh(24),
    fontFamily: getFontFamily('regular'),
  },
  modalButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: sw(36),
    paddingVertical: sh(12),
    borderRadius: s(24),
  },
  modalButtonText: {
    fontSize: sf(16),
    color: '#FFF',
    fontFamily: getFontFamily('semiBold'),
  },
});