/**
 * HMS App Configuration
 *
 * API_BASE_URL notes:
 *  - Android Emulator  → use 'http://10.0.2.2:8080'  (maps to host's localhost)
 *  - iOS Simulator     → use 'http://localhost:8080'
 *  - Physical Device   → replace with your machine's local IP, e.g. 'http://192.168.1.10:8080'
 */

export const Config = {
  // ─── API ──────────────────────────────────────────────────────────────────
  API_BASE_URL: 'http://10.0.2.2:8080',  // Android emulator default
  API_TIMEOUT: 15000,                     // 15 seconds

  // ─── App Info ─────────────────────────────────────────────────────────────
  APP_NAME: 'MediCore HMS',
  APP_VERSION: '1.0.0',
  HOSPITAL_NAME: 'MediCore Hospital',
  HOSPITAL_TAGLINE: 'Caring for Life, Committed to Excellence',

  // ─── AsyncStorage Keys ────────────────────────────────────────────────────
  STORAGE_KEYS: {
    AUTH_TOKEN: '@hms_auth_token',
    USER_DATA: '@hms_user_data',
    IS_LOGGED_IN: '@hms_is_logged_in',
  },

  // ─── Splash Screen ────────────────────────────────────────────────────────
  SPLASH_DURATION: 2500, // ms

  // ─── Roles ────────────────────────────────────────────────────────────────
  ROLES: [
    {label: 'Doctor', value: 'DOCTOR'},
    {label: 'Receptionist', value: 'RECEPTIONIST'},
    {label: 'Nurse', value: 'NURSE'},
    {label: 'Pharmacist', value: 'PHARMACIST'},
    {label: 'Lab Technician', value: 'LAB_TECHNICIAN'},
    {label: 'Accountant', value: 'ACCOUNTANT'},
  ],

  // ─── Genders ──────────────────────────────────────────────────────────────
  GENDERS: [
    {label: 'Male', value: 'MALE'},
    {label: 'Female', value: 'FEMALE'},
    {label: 'Other', value: 'OTHER'},
  ],
};

export default Config;
