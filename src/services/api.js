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
      const token = await AsyncStorage.getItem(
        Config.STORAGE_KEYS.AUTH_TOKEN,
      );
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
        data?.message ||git branch
        data?.error ||
        `Request failed with status ${status}`;
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
   * Admin Login
   * POST /api/v1/auth/login
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<ApiResponse<LoginResponse>>}
   *   data: { accessToken, tokenType, firstName, lastName, email, role }
   */
  login: (email, password) =>
    apiClient.post('/api/v1/auth/login', {email, password}),
};

// ─── User API ────────────────────────────────────────────────────────────────

export const userAPI = {
  /**
   * Register a new staff user (Admin only)
   * POST /api/v1/users/register
   *
   * @param {Object} data
   * @param {string} data.firstName
   * @param {string} data.lastName
   * @param {string} data.email
   * @param {string} data.password
   * @param {string} data.phoneNumber   — Indian format: ^[6-9]\d{9}$
   * @param {string} data.dateOfBirth   — ISO date string: 'YYYY-MM-DD'
   * @param {string} data.gender        — 'MALE' | 'FEMALE' | 'OTHER'
   * @param {string} data.role          — 'DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'PHARMACIST' | 'LAB_TECHNICIAN' | 'ACCOUNTANT'
   * @returns {Promise<ApiResponse<UserResponse>>}
   */
  registerUser: data => apiClient.post('/api/v1/users/register', data),
};

export default apiClient;
