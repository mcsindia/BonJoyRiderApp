import axios, {
    AxiosError,
    AxiosInstance,
  } from 'axios';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  /* ======================================================
     CONFIG
  ====================================================== */
  
  const BASE_URL = 'https://bonjoy.in/api/v1';
  const TIMEOUT = 15000;
  
  /* ======================================================
     STORAGE KEYS
  ====================================================== */
  
  const AUTH_TOKEN_KEY = 'AUTH_TOKEN';
  const USER_KEY = 'USER_SESSION';
  const RIDER_PROFILE_KEY = 'RIDER_PROFILE';
  
  /* ======================================================
     DATA MODELS (TS Data Classes)
  ====================================================== */
  
  /* ---------- COMMON ---------- */
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }
  
  /* ---------- AUTH ---------- */
  
  export interface LoginWithMobileRequest {
    mobile: string;
  }
  
  export interface LoginWithMobileResponse {
    success: boolean;
    message: string;
  }
  
  export interface VerifyOtpRequest {
    mobile: string;
    otp: string;
  }
  
  export interface UserSession {
    id: number;
    mobile: string;
    userType: 'Rider' | string;
  }
  
  export interface VerifyOtpResponse {
    success: boolean;
    message: string;
    token: string;
    user: UserSession;
  }
  
  /* ---------- RIDER ---------- */
  
  export interface RiderUser {
    id: number;
    email: string | null;
    mobile: string;
    userType: string;
    status: string;
  }
  
  export interface RiderProfileResult {
    id: number;
    userId: number;
    fullName: string;
    gender: string;
    profileImage: string | null;
    city: string;
    preferredPaymentMethod: string | null;
    date_of_birth: string | null;
    createdAt: string;
    updatedAt: string;
    User: RiderUser;
  }
  
  export interface RiderProfileDetailData {
    results: RiderProfileResult[];
    userContact: any[]; // Adjust this type if userContact has a specific structure
  }
  
  export interface RiderProfileDetailResponse {
    success: boolean;
    message: string;
    data: RiderProfileDetailData;
  }
  
  export interface RiderProfile {
    id: number;
    fullName: string;
    gender: string;
    dob: string;
    city: string;
    profileImage?: string;
    email: string;
    mobile: string;
    userType: string;
    status: string;
    remark?: string;
    createdAt: string;
  }
  
  export interface CreateRiderProfileResponse {
    success: boolean;
    message: string;
    data: RiderProfile[];
  }
  
  export interface GetAllRiderProfilesResponse {
    success: boolean;
    message: string;
    data: RiderProfile[];
    page: number;
    limit: number;
    total: number;
  }
  
  /* ======================================================
     SESSION HELPERS
  ====================================================== */
  
  export const saveSession = async (
    token: string,
    user: UserSession
  ) => {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  };
  
  export const clearSession = async () => {
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      USER_KEY,
      RIDER_PROFILE_KEY,
    ]);
  };
  
  export const getAuthToken = async () =>
    AsyncStorage.getItem(AUTH_TOKEN_KEY);
  
  export const getUserSession = async (): Promise<UserSession | null> => {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  };
  
  /* ======================================================
     RIDER PROFILE LOCAL STORAGE
  ====================================================== */
  
  export const saveRiderProfile = async (
    profile: RiderProfile
  ) => {
    await AsyncStorage.setItem(
      RIDER_PROFILE_KEY,
      JSON.stringify(profile)
    );
  };
  
  export const getRiderProfile = async (): Promise<RiderProfile | null> => {
    const data = await AsyncStorage.getItem(RIDER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  };
  
  /* ======================================================
     BUSINESS RULE (MANDATORY DATA)
  ====================================================== */
  
  export const hasMandatoryProfileData = (
    profile: RiderProfile | null
  ) => {
    if (!profile) return false;
  
    return (
      !!profile.fullName &&
      !!profile.gender &&
      !!profile.city &&
      !!profile.mobile
    );
  };
  
  /* ======================================================
     AXIOS INSTANCE
  ====================================================== */
  
  const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
  });
  
  /* ======================================================
     REQUEST INTERCEPTOR
  ====================================================== */
  
  api.interceptors.request.use(async config => {
    const token = await getAuthToken();
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
    console.log('➡️ API REQUEST', {
      url: config.url,
      method: config.method,
      payload: config.data || config.params,
    });
  
    return config;
  });
  
  /* ======================================================
     RESPONSE INTERCEPTOR
  ====================================================== */
  
  api.interceptors.response.use(
    response => {
      console.log('✅ API RESPONSE', response.data);
      return response;
    },
    async (error: AxiosError) => {
      console.log('❌ API ERROR', error.response?.data);
  
      if (error.response?.status === 401) {
        await clearSession();
      }
  
      throw error;
    }
  );
  
  /* ======================================================
     AUTH APIS
  ====================================================== */
  
  /**
   * STEP 1: Send OTP
   */
  export const loginWithMobile = (mobile: string) =>
    api.post<LoginWithMobileResponse>('/loginWithMobile', {
      mobile,
    });
  
  /**
   * STEP 2: Verify OTP & Create Session
   */
  export const verifyOtpAndLogin = async (
    mobile: string,
    otp: string
  ): Promise<UserSession> => {
    const response = await api.post<VerifyOtpResponse>(
      '/verifyOtpAndLogin',
      { mobile, otp }
    );
  
    const { token, user } = response.data;
  
    await saveSession(token, user);
  
    return user;
  };
  
  /**
   * Logout
   */
  export const logout = async () => {
    await clearSession();
  };
  
  /* ======================================================
     RIDER PROFILE APIS
  ====================================================== */
  
  export const getAllRiderProfiles = (
    page: number,
    limit: number
  ) =>
    api.get<GetAllRiderProfilesResponse>(
      '/getAllRiderProfiles',
      { params: { page, limit } }
    );
  
  export const getRiderProfileById = (id: number) =>
    api.get<RiderProfileDetailResponse>(
      `/getRiderProfileById/${id}`
    );
  
  export const createRiderProfile = async (
    formData: FormData
  ): Promise<RiderProfile> => {
    const response = await api.post<CreateRiderProfileResponse>(
      '/createRiderProfile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  
    const profile = response.data.data[0];
    await saveRiderProfile(profile);
  
    return profile;
  };
  
  /**
   * ✅ UPDATED: Update Rider Profile
   * - Handles new response format
   * - Saves updated profile locally
   */
  export const updateRiderProfile = async (
    id: number,
    formData: FormData
  ): Promise<RiderProfile> => {
    const response = await api.put<CreateRiderProfileResponse>(
      `/updateRiderProfile/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  
    const updatedProfile = response.data.data[0];
  
    await saveRiderProfile(updatedProfile);
  
    return updatedProfile;
  };
  
  export const deleteRiderProfile = (id: number) =>
    api.delete<ApiResponse<null>>(
      `/deleteRiderProfile/${id}`
    );
  
  /* ======================================================
     RIDERS
  ====================================================== */
  
  export const getAllRiders = () =>
    api.get<ApiResponse<RiderProfile[]>>(
      '/getAllRiders'
    );

    export const transformRiderProfileResult = (
        result: RiderProfileResult
      ): RiderProfile => ({
        id: result.id,
        fullName: result.fullName || '',
        gender: result.gender || '',
        dob: result.date_of_birth || '',
        city: result.city || '',
        profileImage: result.profileImage || undefined,
        email: result.User?.email || '',
        mobile: result.User?.mobile || '',
        userType: result.User?.userType || '',
        status: result.User?.status || '',
        createdAt: result.createdAt || '',
        // Add other fields if needed
        remark: result.remark || undefined,
      });