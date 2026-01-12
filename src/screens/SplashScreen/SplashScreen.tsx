import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { sh, s } from '../../utils/scale';

import {
  getUserSession,
  getRiderProfile,
  hasMandatoryProfileData,
} from '../../Services/BonjoyApi';

const { width, height } = Dimensions.get('window');
const SCREEN_COUNT = 2; // Reduced from 3 to 2 since we merged first and second screens

type NavDecision = 'HOME' | 'ONBOARDING' | 'NONE';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

const SplashScreen = () => {
  const navigation = useNavigation<NavProp>();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 🔒 Holds navigation decision without causing re-render
  const navDecisionRef = useRef<NavDecision>('NONE');

  /* =====================================================
     PARALLEL DATA FETCH (START IMMEDIATELY)
  ====================================================== */

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [session, profile] = await Promise.all([
          getUserSession(),
          getRiderProfile(),
        ]);

        if (!mounted) return;

        if (hasMandatoryProfileData(profile)) {
          navDecisionRef.current = 'HOME';
        } else if (session) {
          navDecisionRef.current = 'ONBOARDING';
        }
      } catch {
        navDecisionRef.current = 'NONE';
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     SPLASH ANIMATION (CONTROLLED)
  ====================================================== */

  useEffect(() => {
    StatusBar.setBackgroundColor('#FFFFFF', true);
    StatusBar.setBarStyle('dark-content', true);

    // Combined first and second screen (3s total)
    const combinedTimer = setTimeout(() => {
      // 🔴 CHECK NAVIGATION DECISION AFTER 3 SECONDS
      if (navDecisionRef.current === 'HOME') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        return;
      }

      if (navDecisionRef.current === 'ONBOARDING') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
        return;
      }

      // 🔴 Only slide to final screen if no auto navigation
      Animated.timing(slideAnim, {
        toValue: -width, // Now we only have 2 screens, so slide to -width (second screen)
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 3000); // Combined timer: 3000ms (3 seconds)

    return () => {
      clearTimeout(combinedTimer);
    };
  }, [navigation]);

  /* =====================================================
     UI
  ====================================================== */

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.sliderContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* 1st Screen (Combined first and second) */}
          <View style={styles.screen}>
            {/* Show gradient from the beginning, but start with opacity animation */}
            <LinearGradient
              colors={['#FCC737', '#EE8421']}
              style={styles.combinedSplashBg}
            >
              <Image
                source={require('../../assets/images/new_splash.png')}
                style={styles.fullImage}
              />
            </LinearGradient>
          </View>

          {/* 2nd Screen (Login screen - ONLY if needed) */}
          <View style={styles.screen}>
            <View style={styles.thirdContainer}>
              <View style={styles.thirdImageBox}>
                <Image
                  source={require('../../assets/images/splash2.png')}
                  style={styles.thirdImage}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.buttonWrapper}
                onPress={() => navigation.replace('Login')}
              >
                <Image
                  source={require('../../assets/images/splashbutton.png')}
                  style={styles.buttonImage}
                />
              </TouchableOpacity>

              <View style={styles.bottomWhite}>
                <Image
                  source={require('../../assets/images/splashimg3.png')}
                  style={styles.bottomSmallImg}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, overflow: 'hidden' },
  sliderContainer: {
    flexDirection: 'row',
    width: width * SCREEN_COUNT,
    height: '100%',
  },
  screen: { width, height: '100%' },
  combinedSplashBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  thirdContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  thirdImageBox: {
    width: '100%',
    height: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thirdImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  buttonImage: {
    width: '85%',
    height: sh(60),
    resizeMode: 'contain',
  },
  bottomWhite: {
    width: '100%',
    alignItems: 'center',
    marginTop: s(20),
    flex: 1,
  },
  bottomSmallImg: {
    width: '70%',
    height: sh(50),
    resizeMode: 'contain',
  },
});