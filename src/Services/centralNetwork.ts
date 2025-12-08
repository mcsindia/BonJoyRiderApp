import AsyncStorage from '@react-native-async-storage/async-storage';

/* ======================================================
   CONFIG
====================================================== */

const BASE_URL = 'https://bonjoy.in:5000/api/v1';

const ACCESS_TOKEN = 'ACCESS_TOKEN';
const REFRESH_TOKEN = 'REFRESH_TOKEN';

/* ======================================================
   COMMON TYPES
====================================================== */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  isFormData?: boolean;
  requireAuth?: boolean;
}

/* ======================================================
   AUTH TYPES
====================================================== */

export interface LoginWithMobileRequest {
  mobile: string;
}

export interface LoginWithMobileResponse {
  message: string;
  success?: boolean;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: number;
    mobile: string;
  };
}

/* ======================================================
   RIDER TYPES
====================================================== */

export interface RiderProfile {
  id: number;
  riderId: number;
  fullName: string;
  gender: string;
  dob: string;
  email: string;
  city: string;
  preferredPaymentMethod: string;
  status: string;
  userProfile?: string;
}

export interface GetRidersResponse {
  data: RiderProfile[];
  page: number;
  limit: number;
  total: number;
}

/* ======================================================
   LOW LEVEL REQUEST (SINGLE CORE)
====================================================== */

const request = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    body,
    isFormData = false,
    requireAuth = false,
  } = options;

  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (requireAuth) {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  /* ✅ FULL REQUEST LOG */
  console.log('➡️ API REQUEST');
  console.log('URL:', url);
  console.log('METHOD:', method);
  console.log('HEADERS:', headers);
  console.log('BODY:', body);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body:
        method === 'GET' || method === 'DELETE'
          ? undefined
          : isFormData
          ? body
          : JSON.stringify(body),
    });

    const text = await response.text();
    console.log('⬅️ API RESPONSE:', text);

    const data: T = text ? JSON.parse(text) : ({} as T);

    if (!response.ok) {
      throw new Error(
        (data as any)?.message || 'Network request failed'
      );
    }

    return data;
  } catch (error: any) {
    console.error('❌ API ERROR:', error.message);
    throw error;
  }
};

/* ======================================================
   AUTH APIS
====================================================== */

export const loginWithMobile = (
  mobile: string
): Promise<LoginWithMobileResponse> => {
  return request<LoginWithMobileResponse>('/loginWithMobile', {
    method: 'POST',
    body: { mobile } as LoginWithMobileRequest,
  });
};

export const verifyOtpAndLogin = async (
  mobile: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  const response = await request<VerifyOtpResponse>(
    '/verifyOtpAndLogin',
    {
      method: 'POST',
      body: { mobile, otp } as VerifyOtpRequest,
    }
  );

  // ✅ Save tokens
  if (response.accessToken) {
    await AsyncStorage.setItem(ACCESS_TOKEN, response.accessToken);
  }

  if (response.refreshToken) {
    await AsyncStorage.setItem(
      REFRESH_TOKEN,
      response.refreshToken
    );
  }

  return response;
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN]);
};

/* ======================================================
   RIDER PROFILE APIS
====================================================== */

export const getAllRiderProfiles = (
  page: number,
  limit: number
): Promise<GetRidersResponse> => {
  return request<GetRidersResponse>(
    `/getAllRiderProfiles?page=${page}&limit=${limit}`,
    { requireAuth: true }
  );
};

export const getRiderProfileById = (
  id: number
): Promise<RiderProfile> => {
  return request<RiderProfile>(`/getRiderProfileById/${id}`, {
    requireAuth: true,
  });
};

export const createRiderProfile = (
  formData: FormData
): Promise<RiderProfile> => {
  return request<RiderProfile>('/createRiderProfile', {
    method: 'POST',
    body: formData,
    isFormData: true,
    requireAuth: true,
  });
};

export const updateRiderProfile = (
  id: number,
  formData: FormData
): Promise<RiderProfile> => {
  return request<RiderProfile>(
    `/updateRiderProfile/${id}`,
    {
      method: 'PUT',
      body: formData,
      isFormData: true,
      requireAuth: true,
    }
  );
};

export const deleteRiderProfile = (
  id: number
): Promise<{ message: string }> => {
  return request<{ message: string }>(
    `/deleteRiderProfile/${id}`,
    {
      method: 'DELETE',
      requireAuth: true,
    }
  );
};
