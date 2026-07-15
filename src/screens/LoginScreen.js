/**
 * LoginScreen
 *
 * Admin authentication screen.
 *  - Email + Password fields with inline validation
 *  - Calls POST /api/v1/auth/login via authAPI
 *  - On success: stores JWT token & user data in AsyncStorage, navigates to AdminHome
 *  - On failure: displays API error message
 *  - "Don't have an account? Register" link → navigates to RegisterScreen
 */

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {authAPI} from '../services/api';
import {saveToken, saveUserData} from '../utils/storage';
import {validateLoginForm} from '../utils/validation';
import {SCREENS} from '../navigation/AppNavigator';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginScreen = ({navigation}) => {
  // ─── Form State ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ─── Animation refs ──────────────────────────────────────────────────────
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ─── Shake animation (called on validation failure) ───────────────────────
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 8, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -8, duration: 60, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 60, useNativeDriver: true}),
    ]).start();
  };

  // ─── Field-level validation on blur ──────────────────────────────────────
  const validateField = (field, value) => {
    const fieldErrors = validateLoginForm({
      email: field === 'email' ? value : email,
      password: field === 'password' ? value : password,
    });
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field] || undefined,
    }));
  };

  // ─── Login handler ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    // 1. Clear previous API error
    setApiError('');

    // 2. Validate form
    const formErrors = validateLoginForm({email, password});
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      triggerShake();
      return;
    }

    // 3. Call API
    setLoading(true);
    try {
      const response = await authAPI.login(email.trim(), password);
      const {data: apiData} = response.data; // { accessToken, tokenType, firstName, lastName, email, role }

      // 4. Persist JWT token and user profile
      await saveToken(apiData.accessToken);
      await saveUserData({
        firstName: apiData.firstName,
        lastName: apiData.lastName,
        email: apiData.email,
        role: apiData.role,
        tokenType: apiData.tokenType,
      });

      // 5. Navigate based on role (replace so user cannot go back to Login)
      if (apiData.role === 'ADMIN') {
        navigation.replace(SCREENS.ADMIN_HOME, {user: apiData});
      } else if (apiData.role === 'PATIENT') {
        navigation.replace(SCREENS.PATIENT_HOME, {user: apiData});
      } else {
        navigation.replace(SCREENS.ADMIN_HOME, {user: apiData});
      }
    } catch (err) {
      // Normalised error from response interceptor
      setApiError(err.message || 'Login failed. Please check your credentials.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ─── Navigate to Register ─────────────────────────────────────────────────
  const handleRegisterPress = () => {
    navigation.navigate(SCREENS.REGISTER);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Header Banner ── */}
          <View style={styles.header}>
            {/* Logo mark */}
            <View style={styles.headerLogoContainer}>
              <View style={styles.logoV} />
              <View style={styles.logoH} />
            </View>
            <Text style={styles.headerTitle}>MediCore HMS</Text>
            <Text style={styles.headerSubtitle}>Hospital Management System</Text>
          </View>

          {/* ── Form Card ── */}
          <Animated.View
            style={[styles.card, {transform: [{translateX: shakeAnim}]}]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to your account
            </Text>

            {/* API Error Banner */}
            {apiError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerIcon}>⚠️</Text>
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            ) : null}

            {/* Email */}
            <Input
              label="Email Address"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({...prev, email: undefined}));
                }
              }}
              onBlur={() => validateField('email', email)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Text style={styles.fieldIcon}>📧</Text>}
            />

            {/* Password */}
            <Input
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({...prev, password: undefined}));
                }
              }}
              onBlur={() => validateField('password', password)}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              leftIcon={<Text style={styles.fieldIcon}>🔒</Text>}
            />

            {/* Login button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={handleRegisterPress}
                hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Bottom tagline */}
          <Text style={styles.footerText}>
            Caring for Life, Committed to Excellence
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full-screen loading overlay */}
      <LoadingSpinner visible={loading} message="Signing in..." />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  // Header banner (blue area at top)
  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  headerLogoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoV: {
    position: 'absolute',
    width: 10,
    height: 34,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  logoH: {
    position: 'absolute',
    width: 34,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extraBold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Form card (white card overlapping header)
  card: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    marginHorizontal: 20,
    marginTop: -28,
    padding: 28,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: 24,
  },

  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorBannerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.error,
    lineHeight: 19,
  },

  // Field icons
  fieldIcon: {
    fontSize: 18,
  },

  // Login button
  loginButton: {
    marginTop: 8,
    width: '100%',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // Register link
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },

  // Footer
  footerText: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 32,
    letterSpacing: 0.3,
    paddingHorizontal: 24,
  },
});

export default LoginScreen;
