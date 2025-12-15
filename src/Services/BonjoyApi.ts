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
const USER_CONTACTS_KEY = 'USER_CONTACTS';

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
  profile_id: number;
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
  userContact: UserContact[];
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

/* ---------- USER CONTACTS ---------- */

export interface UserContact {
  id: number;
  userId: number;
  contactType?: string;
  relationship?: string;
  contactName: string;
  contactNumber: string;
  address?: string | null;
  is_primary?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserContactResponse {
  success: boolean;
  message: string;
  data: UserContact | UserContact[];
}

/* ======================================================
   SESSION HELPERS
====================================================== */

export const saveSession = async (
  token: string,
  user: UserSession
) => {
  console.log("token", token)
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
    USER_CONTACTS_KEY,
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

export const saveRiderProfile = async (profile: RiderProfile) => {
  if (!profile) {
    await AsyncStorage.removeItem(RIDER_PROFILE_KEY);
    return;
  }
  
  await AsyncStorage.setItem(RIDER_PROFILE_KEY, JSON.stringify(profile));
};

export const getRiderProfile = async (): Promise<RiderProfile | null> => {
  const data = await AsyncStorage.getItem(RIDER_PROFILE_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data) as RiderProfile;
  } catch {
    return null;
  }
};

/* ======================================================
   USER CONTACTS LOCAL STORAGE
====================================================== */

export const saveUserContacts = async (contacts: UserContact[]) => {
  if (!contacts || contacts.length === 0) {
    await AsyncStorage.removeItem(USER_CONTACTS_KEY);
    return;
  }
  
  await AsyncStorage.setItem(USER_CONTACTS_KEY, JSON.stringify(contacts));
};

export const getUserContacts = async (): Promise<UserContact[]> => {
  const data = await AsyncStorage.getItem(USER_CONTACTS_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data) as UserContact[];
  } catch {
    return [];
  }
};

/* ======================================================
   BUSINESS RULE (MANDATORY DATA)
====================================================== */

export const hasMandatoryProfileData = (profile: RiderProfile | null) => {
  if (!profile) return false;
  return !!profile.fullName && !!profile.gender && !!profile.city && !!profile.mobile;
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
  return config;
});

/* ======================================================
   RESPONSE INTERCEPTOR
====================================================== */

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearSession();
    }
    throw error;
  }
);

/* ======================================================
   AUTH APIS
====================================================== */

export const loginWithMobile = (mobile: string) =>
  api.post<LoginWithMobileResponse>('/loginWithMobile', { mobile });

export const verifyOtpAndLogin = async (mobile: string, otp: string): Promise<UserSession> => {
  const response = await api.post<VerifyOtpResponse>('/verifyOtpAndLogin', { mobile, otp });
  const { token, user } = response.data;
  await saveSession(token, user);
  return user;
};

export const logout = async () => {
  await clearSession();
};

/* ======================================================
   RIDER PROFILE APIS
====================================================== */

export const getAllRiderProfiles = (page: number, limit: number) =>
  api.get<GetAllRiderProfilesResponse>('/getAllRiderProfiles', { params: { page, limit } });

export const getRiderProfileById = (userId: number) =>
  api.get<RiderProfileDetailResponse>(`/getRiderProfileById/${userId}`);

export const createRiderProfile = async (formData: FormData): Promise<RiderProfile> => {
  const response = await api.post<CreateRiderProfileResponse>('/createRiderProfile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.data.success || !response.data.data?.[0]) {
    throw new Error(response.data.message || 'Failed to create profile');
  }

  const profile = response.data.data[0];
  await saveRiderProfile(profile);
  return profile;
};

export const updateRiderProfile = async (userId: number, formData: FormData): Promise<RiderProfile> => {
  console.log(`📤 Updating profile for user ID: ${userId}`);
  
  const response = await api.put<CreateRiderProfileResponse>(
    `/updateRiderProfile/${userId}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  console.log('📥 Update response:', {
    success: response.data.success,
    message: response.data.message,
    data: response.data.data
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update profile');
  }

  // Check if we have data in the response
  if (!response.data.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
    // Try to fetch the updated profile using getRiderProfileById
    console.log('No data in response, fetching updated profile...');
    try {
      const freshResponse = await getRiderProfileById(userId);
      if (freshResponse.data.success && freshResponse.data.data.results?.length > 0) {
        const transformedProfile = transformRiderProfileResult(freshResponse.data.data.results[0]);
        await saveRiderProfile(transformedProfile);
        return transformedProfile;
      }
    } catch (fetchError) {
      console.error('Failed to fetch updated profile:', fetchError);
    }
    
    // If we can't fetch, but update was successful, return a minimal profile
    const session = await getUserSession();
    const minimalProfile: RiderProfile = {
      id: 0,
      fullName: formData.get('fullName') as string || '',
      gender: formData.get('gender') as string || '',
      dob: formData.get('date_of_birth') as string || '',
      city: formData.get('city') as string || '',
      email: formData.get('email') as string || '',
      mobile: session?.mobile || '',
      userType: 'Rider',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    
    await saveRiderProfile(minimalProfile);
    return minimalProfile;
  }

  const updatedProfile = response.data.data[0];
  await saveRiderProfile(updatedProfile);
  return updatedProfile;
};

export const deleteRiderProfile = (id: number) =>
  api.delete<ApiResponse<null>>(`/deleteRiderProfile/${id}`);

export const getAllRiders = () =>
  api.get<ApiResponse<RiderProfile[]>>('/getAllRiders');

export const transformRiderProfileResult = (result: RiderProfileResult): RiderProfile => ({
  profile_id: result.id,
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
});

/* ======================================================
   USER CONTACTS APIS - FIXED VERSION
====================================================== */

// Helper function to handle API response consistently
const handleApiResponse = <T>(response: any, successMessage?: string): T => {
  console.log('API Response:', response.data);
  
  if (response.data.success) {
    return response.data.data;
  } else {
    const errorMessage = response.data.message || 'Operation failed';
    throw new Error(errorMessage);
  }
};

/**
 * Create a new user contact
 */
export const createUserContact = async (
  userId: number,
  contactType: string,
  contactName: string,
  contactNumber: string,
  is_primary: number,
  relationship: string
): Promise<UserContact> => {
  try {
    const payload = {
      userId,
      contactType,
      contactName,
      contactNumber,
      is_primary,
      relationship
    };

    console.log('Creating contact with payload:', payload);

    const response = await api.post('/createUserContact', payload);
    
    // Handle response based on the format you provided
    if (response.data.success && response.data.data) {
      const newContact = response.data.data;
      
      // Update local storage
      const existingContacts = await getUserContacts();
      const updatedContacts = [...existingContacts, newContact];
      await saveUserContacts(updatedContacts);
      
      return newContact;
    } else {
      throw new Error(response.data.message || 'Failed to create contact');
    }
  } catch (error: any) {
    console.error('Error in createUserContact:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Get all user contacts for the current user
 */
export const getAllUserContacts = async (): Promise<UserContact[]> => {
  try {
    const response = await api.get('/getAllUserContacts');
    
    console.log('Get all contacts response:', response.data);

    if (response.data.success && Array.isArray(response.data.data)) {
      const contacts = response.data.data;
      
      // Save to local storage
      await saveUserContacts(contacts);
      
      return contacts;
    } else {
      throw new Error(response.data.message || 'Failed to fetch contacts');
    }
  } catch (error: any) {
    console.error('Error in getAllUserContacts:', error);
    
    // Return local contacts as fallback
    try {
      const localContacts = await getUserContacts();
      return localContacts;
    } catch (localError) {
      console.error('Failed to get local contacts:', localError);
      throw error;
    }
  }
};

/**
 * Get user contact by ID
 */
export const getUserContactById = async (id: number): Promise<UserContact> => {
  try {
    console.log('Fetching contact with ID:', id);
    const response = await api.get(`/getUserContactById/${id}`);
    
    console.log('Get contact by ID response:', response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Contact not found');
    }
  } catch (error: any) {
    console.error('Error in getUserContactById:', error);
    
    // Try to find in local storage as fallback
    try {
      const localContacts = await getUserContacts();
      const foundContact = localContacts.find(contact => contact.id === id);
      
      if (foundContact) {
        return foundContact;
      }
    } catch (localError) {
      console.error('Failed to get local contacts:', localError);
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Update user contact
 */
export const updateUserContact = async (
  id: number,
  data: {
    relationship?: string;
    address?: string;
    is_primary?: number;
    contactName?: string;
    contactNumber?: string;
  }
): Promise<UserContact> => {
  try {
    console.log('Updating contact ID:', id, 'with data:', data);

    const response = await api.put(`/updateUserContact/${id}`, data);
    
    console.log('Update contact response:', response.data);

    if (response.data.success && response.data.data) {
      const updatedContact = response.data.data;
      
      // Update local storage
      const existingContacts = await getUserContacts();
      const updatedContacts = existingContacts.map(contact => 
        contact.id === id ? updatedContact : contact
      );
      await saveUserContacts(updatedContacts);
      
      return updatedContact;
    } else {
      throw new Error(response.data.message || 'Failed to update contact');
    }
  } catch (error: any) {
    console.error('Error in updateUserContact:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Delete user contact
 */
export const deleteUserContact = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Deleting contact ID:', id);

    const response = await api.delete(`/deleteUserContact/${id}`);
    
    console.log('Delete contact response:', response.data);

    if (response.data.success) {
      // Get the success message
      let successMessage = 'Contact deleted successfully';
      
      // Handle different message formats
      if (typeof response.data.message === 'string') {
        successMessage = response.data.message;
      } else if (response.data.message && typeof response.data.message.message === 'string') {
        successMessage = response.data.message.message;
      }

      // Update local storage
      const existingContacts = await getUserContacts();
      const updatedContacts = existingContacts.filter(contact => contact.id !== id);
      await saveUserContacts(updatedContacts);
      
      return { success: true, message: successMessage };
    } else {
      throw new Error(response.data.message || 'Failed to delete contact');
    }
  } catch (error: any) {
    console.error('Error in deleteUserContact:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Sync contacts from server to local storage
 */
export const syncUserContacts = async (): Promise<UserContact[]> => {
  try {
    const contacts = await getAllUserContacts();
    await saveUserContacts(contacts);
    return contacts;
  } catch (error) {
    console.error('Failed to sync contacts:', error);
    // Return local contacts as fallback
    return await getUserContacts();
  }
};

/**
 * Get emergency contacts for current user
 */
export const getEmergencyContacts = async (): Promise<UserContact[]> => {
  const allContacts = await getAllUserContacts();
  return allContacts.filter(contact => 
    contact.contactType === 'emergency'
  );
};

/**
 * Get primary contact for current user
 */
export const getPrimaryContact = async (): Promise<UserContact | null> => {
  const allContacts = await getAllUserContacts();
  const primary = allContacts.find(contact => contact.is_primary === 1);
  return primary || null;
};