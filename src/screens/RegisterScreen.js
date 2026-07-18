/**
 * RegisterScreen
 *
 * Supports both:
 *  1. Patient Self-Registration (navigated from Login Screen, isAdminRegister = false)
 *  2. Admin Staff Registration (navigated from Admin Dashboard, isAdminRegister = true)
 *
 * Form fields match the respective backend DTOs exactly.
 */

import React, {useState, useEffect} from 'react';
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

import {authAPI, departmentAPI} from '../services/api';
import {localDB} from '../utils/localDB';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Config from '../constants/config';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ─── Dropdown Picker Component (inline, no third-party dependency) ────────────
const DropdownPicker = ({
  label,
  value,
  options,
  onSelect,
  error,
  placeholder,
}) => {
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
  selectorError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
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

const STAFF_ROLES = [
  {label: 'Doctor', value: 'DOCTOR'},
  {label: 'Nurse', value: 'NURSE'},
  {label: 'Receptionist', value: 'RECEPTIONIST'},
];

const SHIFTS = [
  {label: 'Morning', value: 'MORNING'},
  {label: 'Evening', value: 'EVENING'},
  {label: 'Night', value: 'NIGHT'},
];

const BLOOD_GROUPS = [
  {label: 'A+', value: 'A+'},
  {label: 'A-', value: 'A-'},
  {label: 'B+', value: 'B+'},
  {label: 'B-', value: 'B-'},
  {label: 'AB+', value: 'AB+'},
  {label: 'AB-', value: 'AB-'},
  {label: 'O+', value: 'O+'},
  {label: 'O-', value: 'O-'},
];

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisterScreen = ({navigation, route}) => {
  const isAdminRegister = route?.params?.isAdminRegister || false;

  // ─── Form State ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    gender: '',
    role: isAdminRegister ? 'DOCTOR' : 'PATIENT',
    // Patient details
    dateOfBirth: '',
    bloodGroup: '',
    height: '',
    weight: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    // Staff details
    departmentId: '',
    qualification: '',
    experience: '',
    specialization: '',
    consultationFee: '',
    licenseNumber: '',
    shift: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState([]);

  // Load departments for Doctor/Nurse dropdowns
  useEffect(
    () => {
      if (isAdminRegister) {
        departmentAPI
          .getAll()
          .then(res => {
            const list = Array.isArray(res.data) ? res.data : [];
            setDepartments(
              list.map(d => ({
                label: d.departmentName || d.name || `Dept ${d.id}`,
                value: String(d.id),
              })),
            );
          })
          .catch(() => {
            // If fetch fails, user can still type ID manually
            setDepartments([]);
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdminRegister],
  );

  // ─── Field update helper ────────────────────────────────────────────────────
  const updateField = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
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

    // 1. Validate Form Fields locally based on active role
    const valErrors = {};
    if (!form.firstName.trim()) {
      valErrors.firstName = 'First name is required';
    }
    if (!form.lastName.trim()) {
      valErrors.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      valErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email.trim())) {
      valErrors.email = 'Invalid email format';
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!form.mobile.trim()) {
      valErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(form.mobile.trim())) {
      valErrors.mobile = 'Must be 10 digits and start with 6-9';
    }

    if (!form.gender) {
      valErrors.gender = 'Gender is required';
    }

    const pwdRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!form.password) {
      valErrors.password = 'Password is required';
    } else if (!pwdRegex.test(form.password)) {
      valErrors.password =
        'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char';
    }

    if (form.password !== form.confirmPassword) {
      valErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (form.role === 'PATIENT') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!form.dateOfBirth.trim()) {
        valErrors.dateOfBirth = 'Date of birth is required';
      } else if (!dateRegex.test(form.dateOfBirth.trim())) {
        valErrors.dateOfBirth = 'Must be in YYYY-MM-DD format';
      }

      if (!form.bloodGroup) {
        valErrors.bloodGroup = 'Blood group is required';
      }

      if (!form.address.trim()) {
        valErrors.address = 'Address is required';
      }
      if (!form.city.trim()) {
        valErrors.city = 'City is required';
      }
      if (!form.state.trim()) {
        valErrors.state = 'State is required';
      }
      if (!form.pincode.trim()) {
        valErrors.pincode = 'Pincode is required';
      }

      if (!form.emergencyContact.trim()) {
        valErrors.emergencyContact = 'Emergency contact is required';
      } else if (!mobileRegex.test(form.emergencyContact.trim())) {
        valErrors.emergencyContact = 'Must be 10 digits and start with 6-9';
      }
    } else if (form.role === 'DOCTOR') {
      if (!form.departmentId.trim()) {
        valErrors.departmentId = 'Department ID is required';
      } else if (isNaN(form.departmentId.trim())) {
        valErrors.departmentId = 'Must be a number';
      }

      if (!form.qualification.trim()) {
        valErrors.qualification = 'Qualification is required';
      }

      if (!form.experience.trim()) {
        valErrors.experience = 'Experience is required';
      } else if (isNaN(form.experience.trim())) {
        valErrors.experience = 'Must be a number';
      }

      if (!form.specialization.trim()) {
        valErrors.specialization = 'Specialization is required';
      }

      if (!form.consultationFee.trim()) {
        valErrors.consultationFee = 'Consultation fee is required';
      } else if (isNaN(form.consultationFee.trim())) {
        valErrors.consultationFee = 'Must be a number';
      }

      if (!form.licenseNumber.trim()) {
        valErrors.licenseNumber = 'License number is required';
      }
    } else if (form.role === 'NURSE') {
      if (!form.qualification.trim()) {
        valErrors.qualification = 'Qualification is required';
      }

      if (!form.experience.trim()) {
        valErrors.experience = 'Experience is required';
      } else if (isNaN(form.experience.trim())) {
        valErrors.experience = 'Must be a number';
      }

      if (!form.departmentId.trim()) {
        valErrors.departmentId = 'Department ID is required';
      } else if (isNaN(form.departmentId.trim())) {
        valErrors.departmentId = 'Must be a number';
      }

      if (!form.shift) {
        valErrors.shift = 'Shift is required';
      }
    } else if (form.role === 'RECEPTIONIST') {
      if (!form.qualification.trim()) {
        valErrors.qualification = 'Qualification is required';
      }
      if (!form.shift) {
        valErrors.shift = 'Shift is required';
      }
    }

    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    // 2. Dispatch payload
    setLoading(true);
    try {
      if (form.role === 'PATIENT') {
        const payload = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          password: form.password,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth.trim(),
          bloodGroup: form.bloodGroup,
          height: form.height.trim() ? parseFloat(form.height.trim()) : null,
          weight: form.weight.trim() ? parseFloat(form.weight.trim()) : null,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          emergencyContact: form.emergencyContact.trim(),
        };
        let response = null;
        try {
          response = await authAPI.registerPatient(payload);
        } catch (apiErr) {
          console.warn('[RegisterPatient API Error, saving locally only]:', apiErr);
        }
        await localDB.addPatient({
          ...payload,
          id: response?.data?.id || Date.now(),
        });
        setSuccessMessage('Patient registered successfully! 🎉');
      } else if (form.role === 'DOCTOR') {
        const payload = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          password: form.password,
          gender: form.gender,
          departmentId: parseInt(form.departmentId.trim(), 10),
          qualification: form.qualification.trim(),
          experience: parseInt(form.experience.trim(), 10),
          specialization: form.specialization.trim(),
          consultationFee: parseFloat(form.consultationFee.trim()),
          licenseNumber: form.licenseNumber.trim(),
        };
        let response = null;
        try {
          response = await authAPI.registerDoctor(payload);
        } catch (apiErr) {
          console.warn('[RegisterDoctor API Error, saving locally only]:', apiErr);
        }
        await localDB.addDoctor({
          ...payload,
          id: response?.data?.id || Date.now(),
        });
        setSuccessMessage('Doctor registered successfully! 🎉');
      } else if (form.role === 'NURSE') {
        const payload = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          password: form.password,
          gender: form.gender,
          qualification: form.qualification.trim(),
          experience: parseInt(form.experience.trim(), 10),
          departmentId: parseInt(form.departmentId.trim(), 10),
          shift: form.shift,
        };
        let response = null;
        try {
          response = await authAPI.registerNurse(payload);
        } catch (apiErr) {
          console.warn('[RegisterNurse API Error, saving locally only]:', apiErr);
        }
        await localDB.addNurse({
          ...payload,
          id: response?.data?.id || Date.now(),
        });
        setSuccessMessage('Nurse registered successfully! 🎉');
      } else if (form.role === 'RECEPTIONIST') {
        const payload = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          password: form.password,
          gender: form.gender,
          qualification: form.qualification.trim(),
          shift: form.shift,
        };
        let response = null;
        try {
          response = await authAPI.registerReceptionist(payload);
        } catch (apiErr) {
          console.warn('[RegisterReceptionist API Error, saving locally only]:', apiErr);
        }
        await localDB.addReceptionist({
          ...payload,
          id: response?.data?.id || Date.now(),
        });
        setSuccessMessage('Receptionist registered successfully! 🎉');
      }

      // Reset form fields
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        gender: '',
        role: isAdminRegister ? 'DOCTOR' : 'PATIENT',
        dateOfBirth: '',
        bloodGroup: '',
        height: '',
        weight: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        emergencyContact: '',
        departmentId: '',
        qualification: '',
        experience: '',
        specialization: '',
        consultationFee: '',
        licenseNumber: '',
        shift: '',
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />
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
            <Text style={styles.pageTitle}>
              {isAdminRegister ? 'Register Staff' : 'Register Patient'}
            </Text>
            <Text style={styles.pageSubtitle}>
              {isAdminRegister
                ? 'Add new medical professionals'
                : 'Create a new patient account'}
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
          {isAdminRegister && (
            <>
              <SectionHeader title="Staff Role Selection" icon="⚙️" />
              <DropdownPicker
                label="Select Role"
                value={form.role}
                options={STAFF_ROLES}
                onSelect={val => updateField('role', val)}
                placeholder="Select role"
                error={errors.role}
              />
              <View style={styles.sectionDivider} />
            </>
          )}

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
            value={form.mobile}
            onChangeText={text => updateField('mobile', text)}
            placeholder="10-digit Indian mobile (e.g. 9876543210)"
            keyboardType="phone-pad"
            error={errors.mobile}
            leftIcon={<Text style={styles.fieldIcon}>📱</Text>}
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

          {/* ── Patient Specific Fields ── */}
          {form.role === 'PATIENT' && (
            <>
              <View style={styles.sectionDivider} />
              <SectionHeader title="Patient Medical & Contact Info" icon="🩺" />

              <Input
                label="Date of Birth"
                value={form.dateOfBirth}
                onChangeText={text => updateField('dateOfBirth', text)}
                placeholder="YYYY-MM-DD (e.g. 1990-05-15)"
                keyboardType="numeric"
                error={errors.dateOfBirth}
                leftIcon={<Text style={styles.fieldIcon}>🎂</Text>}
              />

              <DropdownPicker
                label="Blood Group"
                value={form.bloodGroup}
                options={BLOOD_GROUPS}
                onSelect={val => updateField('bloodGroup', val)}
                placeholder="Select blood group"
                error={errors.bloodGroup}
              />

              <Input
                label="Height (cm)"
                value={form.height}
                onChangeText={text => updateField('height', text)}
                placeholder="e.g. 175"
                keyboardType="numeric"
                error={errors.height}
                leftIcon={<Text style={styles.fieldIcon}>📏</Text>}
              />

              <Input
                label="Weight (kg)"
                value={form.weight}
                onChangeText={text => updateField('weight', text)}
                placeholder="e.g. 70"
                keyboardType="numeric"
                error={errors.weight}
                leftIcon={<Text style={styles.fieldIcon}>⚖️</Text>}
              />

              <Input
                label="Address"
                value={form.address}
                onChangeText={text => updateField('address', text)}
                placeholder="Enter street address"
                error={errors.address}
                leftIcon={<Text style={styles.fieldIcon}>🏠</Text>}
              />

              <Input
                label="City"
                value={form.city}
                onChangeText={text => updateField('city', text)}
                placeholder="Enter city"
                error={errors.city}
                leftIcon={<Text style={styles.fieldIcon}>🌆</Text>}
              />

              <Input
                label="State"
                value={form.state}
                onChangeText={text => updateField('state', text)}
                placeholder="Enter state"
                error={errors.state}
                leftIcon={<Text style={styles.fieldIcon}>📍</Text>}
              />

              <Input
                label="Pincode"
                value={form.pincode}
                onChangeText={text => updateField('pincode', text)}
                placeholder="Enter 6-digit pin code"
                keyboardType="numeric"
                error={errors.pincode}
                leftIcon={<Text style={styles.fieldIcon}>📮</Text>}
              />

              <Input
                label="Emergency Contact Number"
                value={form.emergencyContact}
                onChangeText={text => updateField('emergencyContact', text)}
                placeholder="10-digit emergency phone number"
                keyboardType="phone-pad"
                error={errors.emergencyContact}
                leftIcon={<Text style={styles.fieldIcon}>🚨</Text>}
              />
            </>
          )}

          {/* ── Doctor Specific Fields ── */}
          {form.role === 'DOCTOR' && (
            <>
              <View style={styles.sectionDivider} />
              <SectionHeader
                title="Doctor Qualifications & License"
                icon="🎓"
              />

              {departments.length > 0 ? (
                <DropdownPicker
                  label="Department"
                  value={form.departmentId}
                  options={departments}
                  onSelect={val => updateField('departmentId', val)}
                  placeholder="Select department"
                  error={errors.departmentId}
                />
              ) : (
                <Input
                  label="Department ID (Numeric)"
                  value={form.departmentId}
                  onChangeText={text => updateField('departmentId', text)}
                  placeholder="e.g. 1"
                  keyboardType="numeric"
                  error={errors.departmentId}
                  leftIcon={<Text style={styles.fieldIcon}>🏢</Text>}
                />
              )}

              <Input
                label="Qualification"
                value={form.qualification}
                onChangeText={text => updateField('qualification', text)}
                placeholder="e.g. MBBS, MD"
                error={errors.qualification}
                leftIcon={<Text style={styles.fieldIcon}>📜</Text>}
              />

              <Input
                label="Experience (Years)"
                value={form.experience}
                onChangeText={text => updateField('experience', text)}
                placeholder="e.g. 8"
                keyboardType="numeric"
                error={errors.experience}
                leftIcon={<Text style={styles.fieldIcon}>⏳</Text>}
              />

              <Input
                label="Specialization"
                value={form.specialization}
                onChangeText={text => updateField('specialization', text)}
                placeholder="e.g. Cardiology"
                error={errors.specialization}
                leftIcon={<Text style={styles.fieldIcon}>🎯</Text>}
              />

              <Input
                label="Consultation Fee (INR)"
                value={form.consultationFee}
                onChangeText={text => updateField('consultationFee', text)}
                placeholder="e.g. 500"
                keyboardType="numeric"
                error={errors.consultationFee}
                leftIcon={<Text style={styles.fieldIcon}>💵</Text>}
              />

              <Input
                label="License Number"
                value={form.licenseNumber}
                onChangeText={text => updateField('licenseNumber', text)}
                placeholder="Enter medical license number"
                error={errors.licenseNumber}
                leftIcon={<Text style={styles.fieldIcon}>💳</Text>}
              />
            </>
          )}

          {/* ── Nurse Specific Fields ── */}
          {form.role === 'NURSE' && (
            <>
              <View style={styles.sectionDivider} />
              <SectionHeader title="Nurse details" icon="🩺" />

              <Input
                label="Qualification"
                value={form.qualification}
                onChangeText={text => updateField('qualification', text)}
                placeholder="e.g. B.Sc Nursing"
                error={errors.qualification}
                leftIcon={<Text style={styles.fieldIcon}>📜</Text>}
              />

              <Input
                label="Experience (Years)"
                value={form.experience}
                onChangeText={text => updateField('experience', text)}
                placeholder="e.g. 4"
                keyboardType="numeric"
                error={errors.experience}
                leftIcon={<Text style={styles.fieldIcon}>⏳</Text>}
              />

              {departments.length > 0 ? (
                <DropdownPicker
                  label="Department"
                  value={form.departmentId}
                  options={departments}
                  onSelect={val => updateField('departmentId', val)}
                  placeholder="Select department"
                  error={errors.departmentId}
                />
              ) : (
                <Input
                  label="Department ID (Numeric)"
                  value={form.departmentId}
                  onChangeText={text => updateField('departmentId', text)}
                  placeholder="e.g. 1"
                  keyboardType="numeric"
                  error={errors.departmentId}
                  leftIcon={<Text style={styles.fieldIcon}>🏢</Text>}
                />
              )}

              <DropdownPicker
                label="Work Shift"
                value={form.shift}
                options={SHIFTS}
                onSelect={val => updateField('shift', val)}
                placeholder="Select shift"
                error={errors.shift}
              />
            </>
          )}

          {/* ── Receptionist Specific Fields ── */}
          {form.role === 'RECEPTIONIST' && (
            <>
              <View style={styles.sectionDivider} />
              <SectionHeader title="Receptionist details" icon="🖥️" />

              <Input
                label="Qualification"
                value={form.qualification}
                onChangeText={text => updateField('qualification', text)}
                placeholder="e.g. Graduate"
                error={errors.qualification}
                leftIcon={<Text style={styles.fieldIcon}>📜</Text>}
              />

              <DropdownPicker
                label="Work Shift"
                value={form.shift}
                options={SHIFTS}
                onSelect={val => updateField('shift', val)}
                placeholder="Select shift"
                error={errors.shift}
              />
            </>
          )}

          <View style={styles.sectionDivider} />

          {/* Account Security */}
          <SectionHeader title="Account Security" icon="🔑" />

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
            <Text style={styles.backText}>← Back to Login</Text>
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
