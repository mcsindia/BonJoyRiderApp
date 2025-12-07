import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://'], // your app scheme
  config: {
    screens: {
      Splash: 'splash',
      Onboarding: 'onboarding',
      Login: 'login',
      Home: 'home',
      EmergencyContacts: 'emergencycontacts'
    },
  },
};

export default linking;
