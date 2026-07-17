/**
 * HMS AsyncStorage Helpers (storage.js)
 *
 * Provides typed wrappers around React Native AsyncStorage
 * for storing and retrieving JWT tokens and user session data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Config} from '../constants/config';

const {STORAGE_KEYS} = Config;

// ─── Token Management ────────────────────────────────────────────────────────

/**
 * Save JWT access token to AsyncStorage.
 * @param {string} token
 */
export const saveToken = async token => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('[Storage] Failed to save token:', error);
    throw error;
  }
};

/**
 * Retrieve JWT access token from AsyncStorage.
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('[Storage] Failed to get token:', error);
    return null;
  }
};

/**
 * Remove JWT access token from AsyncStorage.
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('[Storage] Failed to remove token:', error);
    throw error;
  }
};

// ─── User Data Management ────────────────────────────────────────────────────

/**
 * Save user profile data (non-sensitive) as JSON string.
 * @param {Object} userData - { name, email, role, userId }
 */
export const saveUserData = async userData => {
  try {
    const serialised = JSON.stringify(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, serialised);
    await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
  } catch (error) {
    console.error('[Storage] Failed to save user data:', error);
    throw error;
  }
};

/**
 * Retrieve user profile data from AsyncStorage.
 * @returns {Promise<Object|null>}
 */
export const getUserData = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('[Storage] Failed to get user data:', error);
    return null;
  }
};

/**
 * Check if the user is currently logged in.
 * @returns {Promise<boolean>}
 */
export const isLoggedIn = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return value === 'true';
  } catch (error) {
    console.error('[Storage] Failed to check login status:', error);
    return false;
  }
};

// ─── Session Management ───────────────────────────────────────────────────────

/**
 * Clear all HMS session data from AsyncStorage.
 * Called on logout.
 */
export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.IS_LOGGED_IN,
    ]);
  } catch (error) {
    console.error('[Storage] Failed to clear session data:', error);
    throw error;
  }
};
