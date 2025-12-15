import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
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
  Alert,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { getFontFamily } from '../utils/fontFamily';
import { s, sf, sh, sw } from '../utils/scale';

// ✅ APIs
import {
  loginWithMobile,
  verifyOtpAndLogin,
  getUserSession,
  getRiderProfileById,
  saveRiderProfile,
  hasMandatoryProfileData,
  transformRiderProfileResult, // Add this export to your API service
  type RiderProfile,
} from '../Services/BonjoyApi';

const BOTTOM_IMAGE_HEIGHT = 200;
const OTP_LENGTH = 4;
const RESEND_TIMER_SECONDS = 30;

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

/* =====================================================
   HELPER FUNCTIONS
====================================================== */

/**
 * Extracts and transforms rider profile from API response
 */
const extractRiderProfile = async (
  userId: number
): Promise<RiderProfile | null> => {
  try {
    const response = await getRiderProfileById(userId);
    const profileResult = response.data?.data?.results?.[0];
    
    if (!profileResult) {
      console.log('No profile found for user ID:', userId);
      return null;
    }

    // Transform the API response to match RiderProfile interface
    return transformRiderProfileResult(profileResult);
  } catch (error) {
    console.error('Error fetching rider profile:', error);
    throw error;
  }
};

/**
 * Handles successful authentication and navigation
 */
const handleSuccessfulAuth = async (
  userId: number,
  navigation: NavProp
): Promise<void> => {
  try {
    const profile = await extractRiderProfile(userId);
    
    if (profile) {
      console.log("sanj 2", profile)
      await saveRiderProfile(profile);
      
      const shouldGoToHome = hasMandatoryProfileData(profile);
      console.log('Navigation decision:', {
        hasProfile: !!profile,
        hasMandatoryData: shouldGoToHome,
        profileFields: {
          fullName: !!profile.fullName,
          gender: !!profile.gender,
          city: !!profile.city,
          mobile: !!profile.mobile,
        },
      });

      navigation.reset({
        index: 0,
        routes: [
          {
            name: shouldGoToHome ? 'Home' : 'Onboarding',
          },
        ],
      });
    } else {
      // No profile exists, go to onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }
  } catch (error) {
    console.error('Auth flow error:', error);
    // On error, go to onboarding to create profile
    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  }
};

const MobileVerificationScreen = () => {
  const navigation = useNavigation<NavProp>();

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill('')
  );
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  const otpRefs = useRef<TextInput[]>([]);
  const resendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* =====================================================
     AUTO LOGIN CHECK (APP RELAUNCH CASE)
  ====================================================== */

  useEffect(() => {
    const checkExistingSession = async () => {
      const session = await getUserSession();
      
      if (session) {
        await handleSuccessfulAuth(session.id, navigation);
      }
    };

    checkExistingSession();
  }, [navigation]);

  /* =====================================================
     HELPERS
  ====================================================== */

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) setPhone(cleaned);
  };

  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_TIMER_SECONDS);

    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
    }

    resendIntervalRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          resendIntervalRef.current && clearInterval(resendIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /* =====================================================
     SEND OTP
  ====================================================== */

  const onNextPress = useCallback(async () => {
    if (phone.length !== 10 || loading) return;

    try {
      setLoading(true);
      await loginWithMobile(phone);
      setStep('OTP');
      setOtp(Array(OTP_LENGTH).fill(''));
      startResendTimer();
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert(
        'Error',
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [phone, loading, startResendTimer]);

  /* =====================================================
     OTP INPUT
  ====================================================== */

  const onOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(d => d !== '');

  /* =====================================================
     VERIFY OTP
  ====================================================== */

  const onVerifyPress = async () => {
    if (!isOtpComplete || loading) return;

    try {
      setLoading(true);
      const otpValue = otp.join('');

      // 1️⃣ Verify OTP & create session
      const user = await verifyOtpAndLogin(phone, otpValue);
      console.log('User authenticated:', user);

      // 2️⃣ Handle post-auth flow
      await handleSuccessfulAuth(user.id, navigation);
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Invalid OTP', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESEND OTP
  ====================================================== */

  const onResendOtpPress = useCallback(async () => {
    if (resendTimer > 0 || loading) return;

    try {
      setLoading(true);
      await loginWithMobile(phone);
      startResendTimer();
      setShowOtpDialog(true);
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  }, [phone, resendTimer, loading, startResendTimer]);

  /* =====================================================
     CLEANUP
  ====================================================== */

  useEffect(() => {
    return () => {
      resendIntervalRef.current && clearInterval(resendIntervalRef.current);
    };
  }, []);

  const onSelectCountry = (country: any) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] || '91');
    setPickerVisible(false);
  };

  /* =====================================================
     UI
  ====================================================== */

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBg}>
            <Image
              source={require('../assets/images/scoorter.png')}
              style={styles.scooterImg}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            {step === 'PHONE' && (
              <>
                <Text style={styles.title}>
                  Enter Mobile number for verification
                </Text>

                <Text style={styles.subtitle}>
                  This number will be used for ride-related{'\n'}
                  communication. You will receive an SMS
                  code for verification.
                </Text>

                <View style={styles.phoneInputContainer}>
                  <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setPickerVisible(true)}
                  >
                    <CountryPicker
                      withFlag
                      withEmoji
                      countryCode={countryCode}
                      visible={pickerVisible}
                      onSelect={onSelectCountry}
                      onClose={() => setPickerVisible(false)}
                    />
                    <Image
                      style={styles.downArrow}
                      source={require('../assets/icons/down_arrow.png')}
                    />
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <View style={styles.codeAndInput}>
                    <Text style={styles.callingCode}>
                      +{callingCode}
                    </Text>
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
                  style={[
                    styles.button,
                    { opacity: phone.length === 10 ? 1 : 0.6 },
                  ]}
                  onPress={onNextPress}
                  disabled={phone.length !== 10 || loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Please wait...' : 'Next'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'OTP' && (
              <>
                <Text style={styles.title}>
                  Log in using the OTP sent to
                </Text>
                <Text style={styles.title}>
                  +{callingCode}******{phone.slice(-4)}
                </Text>

                <View style={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={el => (otpRefs.current[index] = el!)}
                      value={digit}
                      onChangeText={val => onOtpChange(val, index)}
                      onKeyPress={({ nativeEvent }) =>
                        onOtpKeyPress(nativeEvent.key, index)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      style={styles.otpBox}
                      caretHidden
                    />
                  ))}
                </View>

                <View style={styles.resendRow}>
                  <Text style={styles.resendText}>
                    Didn't get the OTP?
                  </Text>
                  <TouchableOpacity
                    onPress={onResendOtpPress}
                    disabled={resendTimer > 0}
                  >
                    <Text style={styles.resendAction}>
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : 'Resend again'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { opacity: isOtpComplete ? 1 : 0.6 },
                  ]}
                  onPress={onVerifyPress}
                  disabled={!isOtpComplete || loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <View pointerEvents="none" style={styles.absoluteBottom}>
        <Image
          source={require('../assets/images/bottombg.png')}
          style={styles.bottomImage}
          resizeMode="contain"
        />
      </View>

      <Modal visible={showOtpDialog} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>
              OTP sent. It will reach you shortly
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowOtpDialog(false)}
            >
              <Text style={styles.modableButtonText}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MobileVerificationScreen;

/* ================= STYLES ================= */
// Styles remain the same...
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
    paddingStart: sw(10),
  },
  countrySelector: { flexDirection: 'row', alignItems: 'center' },
  downArrow: { marginLeft: sw(4) },
  divider: {
    width: 1,
    height: sh(24),
    backgroundColor: '#D1D5DB',
    marginHorizontal: sh(12),
  },
  codeAndInput: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  callingCode: { fontSize: sf(18), color: '#0F172A' },
  phoneInput: { flex: 1, fontSize: sf(18), color: '#0F172A' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  otpBox: {
    width: sw(56),
    height: sh(56),
    borderRadius: s(12),
    borderWidth: 1.2,
    borderColor: '#D1D5DB',
    fontSize: sf(20),
  },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: sh(15)},
  resendText: { fontSize: sf(15), color: '#6B7280' },
  resendAction: { fontSize: sf(15), color: '#FBBF24' },
  button: {
    height: sh(56),
    backgroundColor: '#0F172A',
    borderRadius: s(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: sf(18), color: '#FFF' },
  absoluteBottom: { position: 'absolute', bottom: 0, width: '100%' },
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
  },
  modalText: { fontSize: sf(18), color: '#4B5563' },
  modalButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: sw(36),
    paddingVertical: sh(12),
    borderRadius: s(24),
    marginTop: sh(20),
  },
  modableButtonText: { fontSize: sf(16), color: '#FFF' },
});