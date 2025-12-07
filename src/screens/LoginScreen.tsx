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
import {fontFamilies} from '../constants/fonts'

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getFontFamily } from '../utils/fontFamily';

const BOTTOM_IMAGE_HEIGHT = 200;
const OTP_LENGTH = 4;
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const MobileVerificationScreen = () => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const navigation = useNavigation<NavProp>();

  const otpRefs = useRef<TextInput[]>([]);

  const callingCode = '91';

  // ✅ Only allow digits for phone
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const onNextPress = useCallback(() => {
    if (phone.length === 10) {
      setStep('OTP');
    }
  }, [phone]);

  const onOtpChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Move to next if digit entered
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // Go to previous box if current is empty and backspace pressed
      otpRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const onVerifyPress = () => {
    if (isOtpComplete) {
      navigation.navigate('Onboarding');
    }
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
                <Text style={styles.title}>
                  Enter Mobile number for verification
                </Text>

                <Text style={styles.subtitle}>
                  This number will be used for ride-related communication. You
                  will receive an SMS code for verification.
                </Text>

                <View style={styles.phoneInputContainer}>
                  <Text style={styles.callingCode}>🇮🇳 +{callingCode}</Text>
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

                <Text style={styles.subtitle}>+91******{phone.slice(-4)}</Text>
            
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
                    <Text style={styles.resendAction}> Resend again</Text>
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

      <Modal visible={showOtpDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>
              OTP sent. It will reach you shortly
            </Text>

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

  scrollContent: {
    paddingBottom: BOTTOM_IMAGE_HEIGHT + 40,
  },

  headerBg: {
    height: 280,
    backgroundColor: '#FFC533',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scooterImg: { width: '78%', height: '78%' },

  card: {
    marginHorizontal: 20,
    marginTop: -80,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    elevation: 6,
  },

  title: {
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 10,
    fontFamily: getFontFamily( 'bold'),
  },

  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    fontFamily: getFontFamily( 'regular'),
  },

  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    marginBottom: 24,
  },

  callingCode: {
    fontSize: 16,
    marginRight: 10,
    fontFamily: getFontFamily( 'semiBold'),
  },

  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: getFontFamily( 'regular'),
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  otpBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    fontSize: 20,
    fontFamily: getFontFamily( 'medium'),
  },

  resendRow: { flexDirection: 'row', marginBottom: 24 },

  resendText: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: getFontFamily( 'regular'),
  },

  resendAction: {
    fontSize: 15,
    color: '#FBBF24',
    fontFamily: getFontFamily( 'semiBold'),
  },

  button: {
    height: 56,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: getFontFamily( 'semiBold'),
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
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },

  modalText: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: getFontFamily( 'regular'),
  },

  modalButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
  },

  modalButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: getFontFamily( 'semiBold'),
  },
});
