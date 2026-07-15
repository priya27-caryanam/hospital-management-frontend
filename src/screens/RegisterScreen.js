/**
 * RegisterScreen
 *
 * Admin-only screen to create staff accounts.
 *
 * Form fields (matching backend RegisterUserRequest DTO exactly):
 *   firstName, lastName, email, phoneNumber, dateOfBirth (YYYY-MM-DD),
 *   gender (MALE/FEMALE/OTHER), role, password, confirmPassword
 *
 * API: POST /api/v1/users/register
 * Requires JWT Bearer token (injected via axios interceptor).
 *
 * Note: confirmPassword is a UI-only field — NOT sent to backend.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {userAPI} from '../services/api';
import {validateRegisterForm} from '../utils/validation';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Config from '../constants/config';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ─── Dropdown Picker Component (inline, no third-party dependency) ────────────
const DropdownPicker = ({label, value, options, onSelect, error, placeholder}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  return (
    <View style={pickerStyles.wrapper}>
      {label ? <Text style={pickerStyles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[
          pickerStyles.selector,
          isOpen && pickerStyles.selectorOpen,
          error && pickerStyles.selectorError,
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}>
        <Text
          style={[
            pickerStyles.selectorText,
            !value && pickerStyles.placeholderText,
          ]}>
          {selectedLabel || placeholder}
        </Text>
        <Text style={pickerStyles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {error ? <Text style={pickerStyles.errorText}>{error}</Text> : null}

      {/* Options modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={pickerStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}>
          <View style={pickerStyles.modalCard}>
            <Text style={pickerStyles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    pickerStyles.option,
                    item.value === value && pickerStyles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsOpen(false);
                  }}>
                  <Text
                    style={[
                      pickerStyles.optionText,
                      item.value === value && pickerStyles.optionTextSelected,
                    ]}>
                    {item.label}
                  </Text>
                  {item.value === value ? (
                    <Text style={pickerStyles.checkmark}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  wrapper: {marginBottom: 16},
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'space-between',
  },
  selectorOpen: {borderColor: Colors.primary, borderWidth: 2},
  selectorError: {borderColor: Colors.error, backgroundColor: Colors.errorLight},
  selectorText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  placeholderText: {color: Colors.textMuted},
  chevron: {fontSize: 12, color: Colors.textMuted, marginLeft: 8},
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 5,
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%',
    maxHeight: 380,
    overflow: 'hidden',
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  optionSelected: {backgroundColor: Colors.primaryExtraLight},
  optionText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  checkmark: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({title, icon}) => (
  <View style={sectionStyles.row}>
    <View style={sectionStyles.iconBg}>
      <Text style={sectionStyles.icon}>{icon}</Text>
    </View>
    <Text style={sectionStyles.title}>{title}</Text>
    <View style={sectionStyles.line} />
  </View>
);

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  icon: {fontSize: 16},
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
    marginRight: 12,
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.divider,
    borderRadius: 1,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisterScreen = ({navigation}) => {
  // ─── Form State ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ─── Field update helper ────────────────────────────────────────────────────
  const updateField = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
    // Clear error for this field on change
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
    setApiError('');
    setSuccessMessage('');
  };

  // ─── Submit handler ─────────────────────────────────────────────────────────
  const handleRegister = async () => {
    setApiError('');
    setSuccessMessage('');

    // 1. Validate
    const formErrors = validateRegisterForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // 2. Build backend payload (exclude confirmPassword)
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber: form.phoneNumber.trim(),
      dateOfBirth: form.dateOfBirth.trim(), // Backend expects LocalDate: "YYYY-MM-DD"
      gender: form.gender,
      role: form.role,
    };

    setLoading(true);
    try {
      await userAPI.registerUser(payload);

      // 3. Show success and reset form
      setSuccessMessage('Staff account created successfully! 🎉');
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        role: '',
        password: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ── Page header ── */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderIcon}>
            <Text style={styles.pageHeaderEmoji}>👤</Text>
          </View>
          <View style={styles.pageHeaderText}>
            <Text style={styles.pageTitle}>Register Staff</Text>
            <Text style={styles.pageSubtitle}>
              Create a new hospital staff account
            </Text>
          </View>
        </View>

        {/* ── Feedback banners ── */}
        {apiError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.bannerIcon}>⚠️</Text>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.bannerIcon}>✅</Text>
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        ) : null}

        {/* ── Form card ── */}
        <View style={styles.card}>

          {/* Personal Information */}
          <SectionHeader title="Personal Information" icon="👤" />

          {/* First Name */}
          <Input
            label="First Name"
            value={form.firstName}
            onChangeText={text => updateField('firstName', text)}
            placeholder="Enter first name"
            autoCapitalize="words"
            error={errors.firstName}
            leftIcon={<Text style={styles.fieldIcon}>🏷️</Text>}
          />

          {/* Last Name */}
          <Input
            label="Last Name"
            value={form.lastName}
            onChangeText={text => updateField('lastName', text)}
            placeholder="Enter last name"
            autoCapitalize="words"
            error={errors.lastName}
            leftIcon={<Text style={styles.fieldIcon}>🏷️</Text>}
          />

          {/* Email */}
          <Input
            label="Email Address"
            value={form.email}
            onChangeText={text => updateField('email', text)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Text style={styles.fieldIcon}>📧</Text>}
          />

          {/* Mobile Number */}
          <Input
            label="Mobile Number"
            value={form.phoneNumber}
            onChangeText={text => updateField('phoneNumber', text)}
            placeholder="10-digit Indian mobile (e.g. 9876543210)"
            keyboardType="phone-pad"
            error={errors.phoneNumber}
            leftIcon={<Text style={styles.fieldIcon}>📱</Text>}
          />

          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            value={form.dateOfBirth}
            onChangeText={text => updateField('dateOfBirth', text)}
            placeholder="YYYY-MM-DD (e.g. 1990-05-15)"
            keyboardType="numeric"
            error={errors.dateOfBirth}
            leftIcon={<Text style={styles.fieldIcon}>🎂</Text>}
          />

          {/* Gender dropdown */}
          <DropdownPicker
            label="Gender"
            value={form.gender}
            options={Config.GENDERS}
            onSelect={val => updateField('gender', val)}
            placeholder="Select gender"
            error={errors.gender}
          />

          {/* Divider */}
          <View style={styles.sectionDivider} />

          {/* Role & Security */}
          <SectionHeader title="Role & Security" icon="🔑" />

          {/* Role dropdown */}
          <DropdownPicker
            label="Role"
            value={form.role}
            options={Config.ROLES}
            onSelect={val => updateField('role', val)}
            placeholder="Select staff role"
            error={errors.role}
          />

          {/* Password */}
          <Input
            label="Password"
            value={form.password}
            onChangeText={text => updateField('password', text)}
            placeholder="Min. 8 characters"
            secureTextEntry
            error={errors.password}
            leftIcon={<Text style={styles.fieldIcon}>🔒</Text>}
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={text => updateField('confirmPassword', text)}
            placeholder="Re-enter password"
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon={<Text style={styles.fieldIcon}>🔐</Text>}
          />

          {/* Register button */}
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitButton}
          />

          {/* Back to login */}
          <TouchableOpacity
            style={styles.backRow}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 8, bottom: 8}}>
            <Text style={styles.backText}>
              ← Back to Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <LoadingSpinner visible={loading} message="Creating account..." />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Page header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pageHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {elevation: 5},
    }),
  },
  pageHeaderEmoji: {fontSize: 24},
  pageHeaderText: {flex: 1},
  pageTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Feedback banners
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  bannerIcon: {fontSize: 16, marginRight: 8},
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.error,
    lineHeight: 19,
  },
  successBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.success,
    lineHeight: 19,
  },

  // Form card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {elevation: 4},
    }),
  },

  sectionDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
    marginBottom: 20,
  },

  fieldIcon: {fontSize: 18},

  submitButton: {
    width: '100%',
    marginTop: 8,
  },

  backRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  backText: {
    fontSize: FontSize.base,
    color: Colors.textLink,
    fontWeight: FontWeight.medium,
  },

  bottomPadding: {
    height: 32,
  },
});

export default RegisterScreen;
