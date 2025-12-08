// src/services/riderService.ts

import { GET, POST, PUT, DELETE } from '@/network/centralNetwork';
import { getAccessToken, refreshAccessToken, clearTokens } from './authService';

const BASE_URL = 'https://bonjoy.in:5000/api/v1';

/* -------------------------------------------------------
   Wrapper with JWT retry
------------------------------------------------------- */
const withAuth = async (apiCall: (token: string) => Promise<any>) => {
  try {
    const token = await getAccessToken();
    if (!token) throw new Error('Unauthorized');

    return await apiCall(token);
  } catch (err: any) {
    if (err.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        return await apiCall(newToken);
      } catch {
        await clearTokens();
        throw new Error('Session expired');
      }
    }
    throw err;
  }
};

/* -------------------------------------------------------
   Rider Profile APIs
------------------------------------------------------- */

export const getAllRiderProfiles = (params: {
  page: number;
  limit: number;
  name?: string;
  preferredPaymentMethod?: string;
}) =>
  withAuth(token =>
    GET(`${BASE_URL}/getAllRiderProfiles`, params, { token })
  );

export const getRiderProfileById = (id: number | string) =>
  withAuth(token =>
    GET(`${BASE_URL}/getRiderProfileById/${id}`, undefined, { token })
  );

export const createRiderProfile = (formData: FormData) =>
  withAuth(token =>
    POST(`${BASE_URL}/createRiderProfile`, formData, { token })
  );

export const updateRiderProfile = (id: number | string, formData: FormData) =>
  withAuth(token =>
    PUT(`${BASE_URL}/updateRiderProfile/${id}`, formData, { token })
  );

export const deleteRiderProfile = (id: number | string) =>
  withAuth(token =>
    DELETE(`${BASE_URL}/deleteRiderProfile/${id}`, undefined, { token })
  );

/* -------------------------------------------------------
   Rider Master API
------------------------------------------------------- */

export const getAllRiders = () =>
  withAuth(token =>
    GET(`${BASE_URL}/getAllRiders`, undefined, { token })
  );
