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

// ─── Department API ──────────────────────────────────────────────────────────

export const departmentAPI = {
  /** GET /api/departments — List all departments */
  getAll: () => apiClient.get('/api/departments'),

  /** GET /api/departments/{id} */
  getById: id => apiClient.get(`/api/departments/${id}`),

  /** POST /api/departments (ADMIN) */
  create: data => apiClient.post('/api/departments', data),

  /** PUT /api/departments/{id} (ADMIN) */
  update: (id, data) => apiClient.put(`/api/departments/${id}`, data),

  /** DELETE /api/departments/{id} (ADMIN) */
  deleteById: id => apiClient.delete(`/api/departments/${id}`),

  // Legacy aliases kept for backward-compatibility with ManageDepartmentsScreen
  createDepartment: data => apiClient.post('/api/departments', data),
  getDepartmentById: id => apiClient.get(`/api/departments/${id}`),
};

// ─── Doctor API ───────────────────────────────────────────────────────────────

export const doctorAPI = {
  /** GET /api/doctors/{id} */
  getById: id => apiClient.get(`/api/doctors/${id}`),

  /** GET /api/doctors/department/{departmentId} */
  getByDepartment: departmentId =>
    apiClient.get(`/api/doctors/department/${departmentId}`),
};

// ─── Patient API ──────────────────────────────────────────────────────────────

export const patientAPI = {
  /** GET /api/patients/{id} */
  getById: id => apiClient.get(`/api/patients/${id}`),

  /** GET /api/patients/search?query=... */
  search: query => apiClient.get('/api/patients/search', {params: {query}}),
};

// ─── Appointment API ──────────────────────────────────────────────────────────

export const appointmentAPI = {
  /** POST /api/appointments */
  book: data => apiClient.post('/api/appointments', data),

  /** GET /api/appointments/{id} */
  getById: id => apiClient.get(`/api/appointments/${id}`),

  /** GET /api/appointments/patient/{patientId} */
  getByPatient: patientId =>
    apiClient.get(`/api/appointments/patient/${patientId}`),

  /** GET /api/appointments/doctor/{doctorId} */
  getByDoctor: doctorId =>
    apiClient.get(`/api/appointments/doctor/${doctorId}`),

  /** PUT /api/appointments/{id}/status */
  updateStatus: (id, status) =>
    apiClient.put(`/api/appointments/${id}/status`, {status}),
};

// ─── Billing API ──────────────────────────────────────────────────────────────

export const billingAPI = {
  /** POST /api/billings */
  generate: data => apiClient.post('/api/billings', data),

  /** GET /api/billings/appointment/{appointmentId} */
  getByAppointment: appointmentId =>
    apiClient.get(`/api/billings/appointment/${appointmentId}`),

  /** PUT /api/billings/{id}/pay */
  pay: id => apiClient.put(`/api/billings/${id}/pay`),
};

// ─── Prescription API ─────────────────────────────────────────────────────────

export const prescriptionAPI = {
  /** POST /api/prescriptions */
  add: data => apiClient.post('/api/prescriptions', data),

  /** GET /api/prescriptions/appointment/{appointmentId} */
  getByAppointment: appointmentId =>
    apiClient.get(`/api/prescriptions/appointment/${appointmentId}`),
};

// ─── Symptoms API ─────────────────────────────────────────────────────────────

export const symptomsAPI = {
  /** GET /api/symptoms */
  getAll: () => apiClient.get('/api/symptoms'),

  /** POST /api/symptoms */
  add: data => apiClient.post('/api/symptoms', data),

  /** POST /api/symptoms/suggest */
  suggest: data => apiClient.post('/api/symptoms/suggest', data),
};

// ─── Nurse API ────────────────────────────────────────────────────────────────

export const nurseAPI = {
  /** GET /api/nurses/{id} */
  getById: id => apiClient.get(`/api/nurses/${id}`),

  /** GET /api/nurses/{nurseId}/assigned-patients */
  getAssignedPatients: nurseId =>
    apiClient.get(`/api/nurses/${nurseId}/assigned-patients`),
};

// ─── Receptionist API ─────────────────────────────────────────────────────────

export const receptionistAPI = {
  /** GET /api/receptionists/{id} */
  getById: id => apiClient.get(`/api/receptionists/${id}`),
};

export default apiClient;
