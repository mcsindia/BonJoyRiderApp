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

const { width, height } = Dimensions.get('window');
const SCREEN_COUNT = 3;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<NavProp>();

  // ----------- HOOKS MUST BE TOP-LEVEL ----------
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Status bar colors for each screen
  const statusBarColors = ['#FFFFFF', '#FCC737', '#FCC737'];

  // ------------- EFFECT FOR ANIMATION & STATUSBAR -------------
  useEffect(() => {
    // Set initial StatusBar
    StatusBar.setBackgroundColor(statusBarColors[0], true);
    StatusBar.setBarStyle('dark-content', true);

    // Timed status bar updates
    const timers = [
      setTimeout(() => {
        StatusBar.setBackgroundColor(statusBarColors[1], true);
        StatusBar.setBarStyle('light-content', true);
      }, 2000),
      setTimeout(() => {
        StatusBar.setBackgroundColor(statusBarColors[2], true);
      }, 4300),
    ];

    // Slide animation sequence
    Animated.sequence([
      Animated.delay(2000),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(slideAnim, {
        toValue: -width * 2,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
     
    });

    // Cleanup timers
    return () => timers.forEach(clearTimeout);
  }, []);

  // ------------- RENDERING -------------
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

          {/* 3rd Screen */}
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
                onPress={()=>{
                  navigation.replace('Home');
                }}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, overflow: 'hidden' },
  sliderContainer: { flexDirection: 'row', width: width * SCREEN_COUNT, height: '100%' },
  screen: { width, height: '100%' },
  firstSplashBg: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  secondSplashBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  thirdContainer: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' },
  thirdImageBox: { width: '100%', height: height * 0.75, justifyContent: 'center', alignItems: 'center' },
  thirdImage: { width: '100%', height: '100%', resizeMode: 'stretch' },
  buttonWrapper: { width: '100%', alignItems: 'center' },
  buttonImage: { width: '85%', height: 60, resizeMode: 'contain' },
  bottomWhite: { width: '100%', alignItems: 'center', marginTop: 20, flex: 1 },
  bottomSmallImg: { width: '70%', height: 50, resizeMode: 'contain' },
});
