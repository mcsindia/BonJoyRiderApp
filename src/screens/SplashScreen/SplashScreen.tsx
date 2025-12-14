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
const SCREEN_COUNT = 3;

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

    // 1️⃣ First screen (2s)
    const firstTimer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // 2️⃣ Second screen (2s)
        setTimeout(() => {
          // 🔴 BEFORE 3RD SCREEN — DECIDE NAVIGATION
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

          // 3️⃣ Only slide to 3rd screen if no auto navigation
          Animated.timing(slideAnim, {
            toValue: -width * 2,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 2000);
      });
    }, 2000);

    return () => {
      clearTimeout(firstTimer);
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
          {/* 1st Screen */}
          <View style={styles.screen}>
            <View style={styles.firstSplashBg}>
              <Image
                source={require('../../assets/images/splash1.png')}
                style={styles.fullImage}
              />
            </View>
          </View>

          {/* 2nd Screen */}
          <View style={styles.screen}>
            <LinearGradient
              colors={['#FCC737', '#EE8421']}
              style={styles.secondSplashBg}
            >
              <Image
                source={require('../../assets/images/splash.png')}
                style={styles.fullImage}
              />
            </LinearGradient>
          </View>

          {/* 3rd Screen (ONLY if needed) */}
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
  firstSplashBg: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  secondSplashBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
