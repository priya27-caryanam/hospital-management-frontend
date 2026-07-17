/**
 * HMS API Service
 *
 * Centralised Axios instance with:
 *  - Base URL from config
 *  - Request interceptor: automatically attaches JWT Bearer token from AsyncStorage
 *  - Response interceptor: normalises errors into a consistent format
 *
 * All API methods are exported as named groups (authAPI, userAPI).
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '../constants/config';

// ─── Axios Instance ──────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach JWT token to every request (except login/register)

apiClient.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // If reading token fails, proceed without authorization header
      console.warn('[API] Failed to read auth token from storage:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Normalise error responses into a consistent structure

apiClient.interceptors.response.use(
  response => response,
  error => {
    let errorMessage = 'Something went wrong. Please try again.';

    if (error.response) {
      // Server responded with a non-2xx status
      const {data, status} = error.response;
      errorMessage =
        data?.message || data?.error || `Request failed with status ${status}`;
    } else if (error.request) {
      // Request was made but no response received (network issue)
      errorMessage =
        'Unable to reach the server. Please check your internet connection.';
    } else {
      // Something happened while setting up the request
      errorMessage = error.message || errorMessage;
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  },
);

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authAPI = {
  /**
   * Login to the system
   * POST /api/auth/login
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<AxiosResponse<AuthResponse>>}
   *   data: { token, role, userId, name, email }
   */
  login: (email, password) =>
    apiClient.post('/api/auth/login', {email, password}),

  /**
   * Register a new patient
   * POST /api/auth/register/patient
   */
  registerPatient: data => apiClient.post('/api/auth/register/patient', data),

  /**
   * Register a new doctor
   * POST /api/auth/register/doctor
   */
  registerDoctor: data => apiClient.post('/api/auth/register/doctor', data),

  /**
   * Register a new nurse
   * POST /api/auth/register/nurse
   */
  registerNurse: data => apiClient.post('/api/auth/register/nurse', data),

  /**
   * Register a new receptionist
   * POST /api/auth/register/receptionist
   */
  registerReceptionist: data =>
    apiClient.post('/api/auth/register/receptionist', data),
};

export default apiClient;
