import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

/* ======================================================
   DATA MODELS (Keep exactly the same)
====================================================== */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

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
   STORAGE KEYS
====================================================== */

const USER_KEY = 'USER_SESSION';
const RIDER_PROFILE_KEY = 'RIDER_PROFILE';
const USER_CONTACTS_KEY = 'USER_CONTACTS';

/* ======================================================
   STORAGE HELPERS (Keep exactly the same)
====================================================== */

export const saveSession = async (token: string, user: UserSession) => {
  console.log("token", token);
  await AsyncStorage.multiSet([
    ['AUTH_TOKEN', token],
    [USER_KEY, JSON.stringify(user)],
  ]);
};

export const clearSession = async () => {
  await AsyncStorage.multiRemove([
    'AUTH_TOKEN',
    USER_KEY,
    RIDER_PROFILE_KEY,
    USER_CONTACTS_KEY,
  ]);
};

export const getAuthToken = async () => AsyncStorage.getItem('AUTH_TOKEN');

export const getUserSession = async (): Promise<UserSession | null> => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

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

export const hasMandatoryProfileData = (profile: RiderProfile | null) => {
  if (!profile) return false;
  return !!profile.fullName && !!profile.gender && !!profile.city && !!profile.mobile;
};

/* ======================================================
   AUTH APIS (Keep exactly the same)
====================================================== */

export const loginWithMobile = (mobile: string) =>
  apiClient.post<LoginWithMobileResponse>('/loginWithMobile', { mobile });

export const verifyOtpAndLogin = async (mobile: string, otp: string): Promise<UserSession> => {
  const response = await apiClient.post<VerifyOtpResponse>('/verifyOtpAndLogin', { mobile, otp });
  const { token, user } = response.data;
  await saveSession(token, user);
  return user;
};

export const logout = async () => {
  await clearSession();
};

/* ======================================================
   RIDER PROFILE APIS (Keep exactly the same)
====================================================== */

export const getAllRiderProfiles = (page: number, limit: number) =>
  apiClient.get<GetAllRiderProfilesResponse>('/getAllRiderProfiles', { params: { page, limit } });

export const getRiderProfileById = (userId: number) =>
  apiClient.get<RiderProfileDetailResponse>(`/getRiderProfileById/${userId}`);

export const createRiderProfile = async (formData: FormData): Promise<RiderProfile> => {
  const response = await apiClient.upload<CreateRiderProfileResponse>('/createRiderProfile', formData);
  
  if (!response.data.success || !response.data.data?.[0]) {
    throw new Error(response.data.message || 'Failed to create profile');
  }
  
  const profile = response.data.data[0];
  await saveRiderProfile(profile);
  return profile;
};

export const updateRiderProfile = async (userId: number, formData: FormData): Promise<RiderProfile> => {
  console.log(`📤 Updating profile for user ID: ${userId}`);
  
  const response = await apiClient.put<CreateRiderProfileResponse>(
    `/updateRiderProfile/${userId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  
  console.log('📥 Update response:', {
    success: response.data.success,
    message: response.data.message,
    data: response.data.data
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update profile');
  }
  
  if (!response.data.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
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
  apiClient.delete<ApiResponse<null>>(`/deleteRiderProfile/${id}`);

export const getAllRiders = () =>
  apiClient.get<ApiResponse<RiderProfile[]>>('/getAllRiders');

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
   USER CONTACTS APIS (Keep exactly the same)
====================================================== */

export const createUserContact = async (
  userId: number,
  contactType: string,
  contactName: string,
  contactNumber: string,
  is_primary: number,
  relationship: string
): Promise<UserContact> => {
  try {
    const payload = { userId, contactType, contactName, contactNumber, is_primary, relationship };
    console.log('Creating contact with payload:', payload);
    
    const response = await apiClient.post('/createUserContact', payload);
    
    if (response.data.success && response.data.data) {
      const newContact = response.data.data;
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

export const getAllUserContacts = async (): Promise<UserContact[]> => {
  try {
    const response = await apiClient.get('/getAllUserContacts');
    console.log('Get all contacts response:', response.data);
    
    if (response.data.success && Array.isArray(response.data.data)) {
      const contacts = response.data.data;
      await saveUserContacts(contacts);
      return contacts;
    } else {
      throw new Error(response.data.message || 'Failed to fetch contacts');
    }
  } catch (error: any) {
    console.error('Error in getAllUserContacts:', error);
    try {
      const localContacts = await getUserContacts();
      return localContacts;
    } catch (localError) {
      console.error('Failed to get local contacts:', localError);
      throw error;
    }
  }
};

export const getUserContactById = async (id: number): Promise<UserContact> => {
  try {
    console.log('Fetching contact with ID:', id);
    const response = await apiClient.get(`/getUserContactById/${id}`);
    console.log('Get contact by ID response:', response.data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Contact not found');
    }
  } catch (error: any) {
    console.error('Error in getUserContactById:', error);
    try {
      const localContacts = await getUserContacts();
      const foundContact = localContacts.find(contact => contact.id === id);
      if (foundContact) return foundContact;
    } catch (localError) {
      console.error('Failed to get local contacts:', localError);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

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
    const response = await apiClient.put(`/updateUserContact/${id}`, data);
    console.log('Update contact response:', response.data);
    
    if (response.data.success && response.data.data) {
      const updatedContact = response.data.data;
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

export const deleteUserContact = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Deleting contact ID:', id);
    const response = await apiClient.delete(`/deleteUserContact/${id}`);
    console.log('Delete contact response:', response.data);
    
    if (response.data.success) {
      let successMessage = 'Contact deleted successfully';
      if (typeof response.data.message === 'string') {
        successMessage = response.data.message;
      } else if (response.data.message && typeof response.data.message.message === 'string') {
        successMessage = response.data.message.message;
      }
      
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

export const syncUserContacts = async (): Promise<UserContact[]> => {
  try {
    const contacts = await getAllUserContacts();
    await saveUserContacts(contacts);
    return contacts;
  } catch (error) {
    console.error('Failed to sync contacts:', error);
    return await getUserContacts();
  }
};

export const getEmergencyContacts = async (): Promise<UserContact[]> => {
  const allContacts = await getAllUserContacts();
  return allContacts.filter(contact => contact.contactType === 'emergency');
};

export const getPrimaryContact = async (): Promise<UserContact | null> => {
  const allContacts = await getAllUserContacts();
  const primary = allContacts.find(contact => contact.is_primary === 1);
  return primary || null;
};

/* ======================================================
   DEFAULT EXPORT (Keep exactly the same structure)
====================================================== */

const BonjoyApi = {
  // Auth functions
  loginWithMobile,
  verifyOtpAndLogin,
  logout,
  
  // Session functions
  saveSession,
  clearSession,
  getAuthToken,
  getUserSession,
  
  // Profile functions
  getAllRiderProfiles,
  getRiderProfileById,
  createRiderProfile,
  updateRiderProfile,
  deleteRiderProfile,
  getAllRiders,
  transformRiderProfileResult,
  
  // Local storage functions
  saveRiderProfile,
  getRiderProfile,
  saveUserContacts,
  getUserContacts,
  
  // Contact functions
  createUserContact,
  getAllUserContacts,
  getUserContactById,
  updateUserContact,
  deleteUserContact,
  syncUserContacts,
  getEmergencyContacts,
  getPrimaryContact,
  
  // Utility functions
  hasMandatoryProfileData,
};

export default BonjoyApi;