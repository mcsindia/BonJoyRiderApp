// src/services/authService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { POST } from '../services/centralNetwork';

const BASE_URL = 'https://bonjoy.in:5000/api/v1';

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const REFRESH_TOKEN = 'REFRESH_TOKEN';

/* -------------------------------------------------------
   Token Storage
------------------------------------------------------- */

export const setTokens = async (access: string, refresh?: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN, access);
  if (refresh) await AsyncStorage.setItem(REFRESH_TOKEN, refresh);
};

export const getAccessToken = async () =>
  AsyncStorage.getItem(ACCESS_TOKEN);

export const clearTokens = async () =>
  AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN]);

/* -------------------------------------------------------
   Auth APIs
------------------------------------------------------- */

export const loginWithMobile = async (mobile: string) => {
  return POST(`${BASE_URL}/loginWithMobile`, { mobile });
};

export const verifyOtpAndLogin = async (
  mobile: string,
  otp: string
) => {
  const res:any = await POST(`${BASE_URL}/verifyOtpAndLogin`, { mobile, otp });

  // assumes backend returns tokens
  await setTokens(res.accessToken, res.refreshToken);
  return res;
};

/* -------------------------------------------------------
   Auto Token Refresh
------------------------------------------------------- */

export const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN);
  if (!refreshToken) throw new Error('Session expired');

  const res:any = await POST(`${BASE_URL}/refreshToken`, {
    refreshToken,
  });

  await setTokens(res.accessToken);
  return res.accessToken;
};
