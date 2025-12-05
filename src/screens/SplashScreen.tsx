import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { View, Image, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<NavProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F7C257', '#F4A51C']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <Image
          source={require('../assets/images/splash.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </LinearGradient>

      <View style={styles.bottomContainer}>
        <Text style={styles.tagline}>
          Your Ride, Your Way — 
          <Text style={styles.highlight}> Simple, Smart, Seamless</Text>
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 0.75, alignItems: 'center', justifyContent: 'center' },
  image: { width: '85%', height: '85%' },
  bottomContainer: {
    flex: 0.25,
    backgroundColor: '#0D1A2E',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  highlight: {
    color: '#F2C94C',
    fontWeight: '700',
  },
});
