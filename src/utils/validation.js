/**
 * HMS Form Validation Utilities (validation.js)
 *
 * Pure functions that validate form fields and return
 * human-readable error messages or null when valid.
 */

// ─── Individual Field Validators ─────────────────────────────────────────────

/**
 * Validate an email address.
 * @param {string} email
 * @returns {string|null} Error message or null if valid.
 */
export const validateEmail = email => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate a password (min 8 characters as required by backend).
 * @param {string} password
 * @returns {string|null}
 */
export const validatePassword = password => {
  if (!password || password === '') {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
};

/**
 * Validate that a confirm-password field matches the original password.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null}
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword === '') {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Validate an Indian mobile phone number.
 * Must start with 6–9 and be exactly 10 digits.
 * Regex from backend: ^[6-9]\d{9}$
 * @param {string} phone
 * @returns {string|null}
 */
export const validatePhone = phone => {
  if (!phone || phone.trim() === '') {
    return 'Mobile number is required';
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.trim())) {
    return 'Enter a valid 10-digit Indian mobile number';
  }
  return null;
};

/**
 * Validate a required text field (not empty).
 * @param {string} value
 * @param {string} fieldName - Human-readable field label for the error message.
 * @returns {string|null}
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate a date of birth string in YYYY-MM-DD format.
 * @param {string} dateString
 * @returns {string|null}
 */
export const validateDateOfBirth = dateString => {
  if (!dateString || dateString.trim() === '') {
    return 'Date of birth is required';
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return 'Date must be in YYYY-MM-DD format';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Please enter a valid date';
  }
  if (date >= new Date()) {
    return 'Date of birth cannot be in the future';
  }
  return null;
};

// ─── Composite Form Validators ───────────────────────────────────────────────

/**
 * Validate the Login form.
 * @param {{ email: string, password: string }} fields
 * @returns {{ email?: string, password?: string }} Error object (empty = valid)
 */
export const validateLoginForm = ({email, password}) => {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) {
    errors.email = emailError;
  }
  if (passwordError) {
    errors.password = passwordError;
  }
  return errors;
};

/**
 * Validate the Register form.
 * @param {Object} fields
 * @returns {Object} Error object keyed by field name (empty object = all valid)
 */
export const validateRegisterForm = fields => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    phoneNumber,
    dateOfBirth,
    gender,
    role,
  } = fields;

  const errors = {};

  const firstNameError = validateRequired(firstName, 'First name');
  if (firstNameError) {
    errors.firstName = firstNameError;
  }

  const lastNameError = validateRequired(lastName, 'Last name');
  if (lastNameError) {
    errors.lastName = lastNameError;
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  const phoneError = validatePhone(phoneNumber);
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }

  const dobError = validateDateOfBirth(dateOfBirth);
  if (dobError) {
    errors.dateOfBirth = dobError;
  }

  if (!gender) {
    errors.gender = 'Please select a gender';
  }

  if (!role) {
    errors.role = 'Please select a role';
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (confirmError) {
    errors.confirmPassword = confirmError;
  }

  return errors;
};
