/**
 * apiHelpers.js
 *
 * Shared utilities for all module screens:
 *  - handleApiError: normalises errors and handles 401 → logout
 *  - formatDate / formatDateTime: consistent date display
 */

import {clearAll} from './storage';

// ─── 401 Aware Error Handler ──────────────────────────────────────────────────

/**
 * Call this inside every screen's catch block.
 * If the error is a 401 Unauthorized, clears storage and redirects to Login.
 *
 * @param {object} error  — Normalised error from Axios interceptor
 *   { message, status, data, originalError }
 * @param {object} navigation — React Navigation navigation object
 * @returns {{ message: string }} — Human-readable error message
 */
export const handleApiError = (error, navigation) => {
  if (error?.status === 401) {
    clearAll()
      .catch(() => {})
      .finally(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      });
    return {message: 'Session expired. Please login again.'};
  }
  return {
    message: error?.message || 'Something went wrong. Please try again.',
  };
};

// ─── Date Formatters ──────────────────────────────────────────────────────────

/**
 * Format a date string as "DD Mon YYYY" (e.g. "17 Jul 2026").
 * @param {string|null} dateString
 * @returns {string}
 */
export const formatDate = dateString => {
  if (!dateString) {
    return 'N/A';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString || 'N/A';
  }
};

/**
 * Format a datetime string as "DD Mon YYYY, HH:MM AM/PM".
 * @param {string|null} dateString
 * @returns {string}
 */
export const formatDateTime = dateString => {
  if (!dateString) {
    return 'N/A';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString || 'N/A';
  }
};

/**
 * Returns a status badge colour for appointment/billing statuses.
 * @param {string} status
 * @returns {{ bg: string, text: string }}
 */
export const getStatusColor = status => {
  switch ((status || '').toUpperCase()) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'PAID':
      return {bg: '#E8F5E9', text: '#2E7D32'};
    case 'SCHEDULED':
    case 'PENDING':
      return {bg: '#E3F2FD', text: '#1565C0'};
    case 'CONFIRMED':
      return {bg: '#F3E5F5', text: '#6A1B9A'};
    case 'CANCELLED':
      return {bg: '#FFEBEE', text: '#C62828'};
    case 'INACTIVE':
      return {bg: '#FFF3E0', text: '#E65100'};
    default:
      return {bg: '#ECEFF1', text: '#546E7A'};
  }
};
