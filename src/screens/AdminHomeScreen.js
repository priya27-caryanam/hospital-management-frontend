/**
 * AdminHomeScreen
 *
 * Main dashboard for the Admin after successful login.
 *
 * Displays:
 *  - Custom header with hospital name, notification icon, and logout button
 *  - Admin profile card (name, role, email from stored user data)
 *  - Welcome message
 *  - 2-column grid of 6 dashboard stat cards (all set to placeholders per active APIs)
 *  - Bottom navigation placeholder bar
 *
 * Logout: clears AsyncStorage and replaces navigation to LoginScreen.
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {clearAll, getUserData, getToken} from '../utils/storage';
import {departmentAPI} from '../services/api';
import {localDB} from '../utils/localDB';
import {SCREENS} from '../navigation/AppNavigator';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Config from '../constants/config';
import DashboardCard from '../components/common/DashboardCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ─── Dashboard card configuration ─────────────────────────────────────────────
const DASHBOARD_CARDS = [
  {
    id: 'doctors',
    title: 'Total Doctors',
    icon: '👨‍⚕️',
    color: Colors.cardDoctor,
  },
  {
    id: 'patients',
    title: 'Total Patients',
    icon: '🏥',
    color: Colors.cardPatient,
  },
  {
    id: 'appointments',
    title: 'Total Appointments',
    icon: '📅',
    color: Colors.cardAppointment,
  },
  {
    id: 'staff',
    title: 'Total Staff',
    icon: '👨‍💼',
    color: Colors.cardStaff,
  },
  {
    id: 'departments',
    title: 'Departments',
    icon: '🏢',
    color: Colors.cardDepartment,
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: '📊',
    color: Colors.cardReports,
  },
];

// ─── Bottom nav tab config ─────────────────────────────────────────────────────
const NAV_TABS = [
  {id: 'home', label: 'Home', icon: '🏠'},
  {id: 'patients', label: 'Patients', icon: '🏥'},
  {id: 'appointments', label: 'Appointments', icon: '📅'},
  {id: 'reports', label: 'Reports', icon: '📊'},
  {id: 'settings', label: 'Settings', icon: '⚙️'},
];

// ─── Quick Action Item ─────────────────────────────────────────────────────────
const QuickAction = ({icon, label, onPress}) => (
  <TouchableOpacity
    style={quickStyles.item}
    onPress={onPress}
    activeOpacity={0.8}>
    <View style={quickStyles.iconBg}>
      <Text style={quickStyles.icon}>{icon}</Text>
    </View>
    <Text style={quickStyles.label} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

const quickStyles = StyleSheet.create({
  item: {
    alignItems: 'center',
    width: 80,
    marginHorizontal: 4,
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...Platform.select({
      android: {elevation: 2},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  icon: {fontSize: 24},
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminHomeScreen = ({navigation, route}) => {
  const [userData, setUserData] = useState(route?.params?.user || null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Dashboard counts (all set to '--' placeholders as per current backend capability)
  const [counts, setCounts] = useState({
    doctors: '--',
    patients: '--',
    appointments: '--',
    staff: '--',
    departments: '--',
    reports: '--',
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Greeting animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Fetch dashboard stats from active backend endpoints and local DB fallback
  const fetchDashboardData = async () => {
    setError(null);
    try {
      // 1. Verify token exists
      const token = await getToken();
      if (!token) {
        await clearAll();
        navigation.replace(SCREENS.LOGIN);
        return;
      }

      // Read from local storage DB
      const localDoctors = await localDB.getDoctors();
      const localPatients = await localDB.getPatients();
      const localAppointments = await localDB.getAppointments();
      const localStaff = await localDB.getStaff();
      const localDepartments = await localDB.getDepartments();
      const localBills = await localDB.getBills();

      // Combine with backend departments if available
      let deptCount = localDepartments.length;
      try {
        const response = await departmentAPI.getAll();
        if (response?.data && Array.isArray(response.data)) {
          const backendDepts = response.data;
          const allDeptIds = new Set([
            ...localDepartments.map(d => String(d.id)),
            ...backendDepts.map(d => String(d.id))
          ]);
          deptCount = allDeptIds.size;
        }
      } catch (e) {
        console.log('[AdminHome] API Departments load skipped, using local count');
      }

      setCounts({
        doctors: localDoctors.length,
        patients: localPatients.length,
        appointments: localAppointments.length,
        staff: localStaff.length,
        departments: deptCount,
        reports: localBills.length,
      });
    } catch (err) {
      console.error('[AdminHome] Error:', err);
      setError(err.message || 'Unable to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(
    () => {
      // Load user data from storage if not passed via route params
      if (!userData) {
        getUserData().then(data => {
          if (data) {
            setUserData(data);
          }
        });
      }

      // Load data on focus to auto-refresh when navigating back
      const unsubscribe = navigation.addListener('focus', () => {
        fetchDashboardData();
      });

      fetchDashboardData();

      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();

      return unsubscribe;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData, navigation],
  );

  // ─── Logout handler ──────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await clearAll();
              navigation.replace(SCREENS.LOGIN);
            } catch (logoutErr) {
              console.error('[AdminHome] Logout error:', logoutErr);
              navigation.replace(SCREENS.LOGIN);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Placeholder actions
  const handlePlaceholderPress = moduleName => {
    Alert.alert(
      'Feature Under Construction',
      `The "${moduleName}" module placeholder is active. This feature will be integrated once backend APIs become available.`,
      [{text: 'Understood', style: 'default'}],
    );
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'System Notifications',
      'You are all caught up! There are no new administrative alerts at this time.',
      [{text: 'OK', style: 'default'}],
    );
  };

  // ─── Greeting based on time of day ───────────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    }
    if (hour < 17) {
      return 'Good Afternoon';
    }
    return 'Good Evening';
  };

  const displayName = userData?.name || 'Admin';
  const displayRole = userData?.role || 'ADMIN';
  const displayEmail = userData?.email || '';

  // Format role for display
  const formatRole = role =>
    role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());

  // ─── Conditional Rendering: Dashboard Coming Soon for non-ADMIN roles ────
  if (userData && userData.role !== 'ADMIN') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primaryDark}
        />

        {/* Custom Header for non-ADMIN placeholder view */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Hospital logo mark */}
            <View style={styles.headerLogoMark}>
              <View style={styles.crossV} />
              <View style={styles.crossH} />
            </View>
            <View>
              <Text style={styles.headerHospitalName}>
                {Config.HOSPITAL_NAME}
              </Text>
              <Text style={styles.headerTagline}>Portal Access</Text>
            </View>
          </View>

          {/* Logout button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Coming Soon Message Center */}
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonIcon}>🏥</Text>
          <Text style={styles.comingSoonTitle}>Dashboard Coming Soon</Text>
          <Text style={styles.comingSoonSubtitle}>Welcome, {displayName}!</Text>
          <Text style={styles.comingSoonDescription}>
            The portal dashboard for the {formatRole(displayRole)} role is
            currently under development and will be released in the next update.
          </Text>
          <TouchableOpacity
            style={styles.comingSoonLogoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}>
            <Text style={styles.comingSoonLogoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCardPress = cardId => {
    switch (cardId) {
      case 'doctors':
        navigation.navigate(SCREENS.DOCTORS_BY_DEPT, {
          departmentId: null,
          departmentName: 'All Doctors',
        });
        break;
      case 'patients':
        navigation.navigate(SCREENS.PATIENT_SEARCH);
        break;
      case 'appointments':
        navigation.navigate(SCREENS.ALL_APPOINTMENTS);
        break;
      case 'staff':
        navigation.navigate(SCREENS.STAFF_LIST);
        break;
      case 'departments':
        navigation.navigate(SCREENS.DEPT_LIST);
        break;
      case 'reports':
        navigation.navigate(SCREENS.REPORTS_LIST);
        break;
      default:
        break;
    }
  };

  // ─── Admin View ───
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />

      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Hospital logo mark */}
          <View style={styles.headerLogoMark}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <View>
            <Text style={styles.headerHospitalName}>
              {Config.HOSPITAL_NAME}
            </Text>
            <Text style={styles.headerTagline}>Admin Dashboard</Text>
          </View>
        </View>

        {/* Right side buttons */}
        <View style={styles.headerRight}>
          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationPress}
            activeOpacity={0.8}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          {/* Logout button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        {/* ── Admin Profile Card ── */}
        <Animated.View
          style={[
            styles.profileCard,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.onlineDot} />
          </View>

          {/* Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {formatRole(displayRole)}
              </Text>
            </View>
            {displayEmail ? (
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            ) : null}
          </View>
        </Animated.View>

        {/* ── Welcome message ── */}
        <Animated.View
          style={[
            styles.welcomeSection,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={styles.greeting}>
            {getGreeting()}, {displayName.split(' ')[0]}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Here&apos;s your hospital overview for today.
          </Text>

          {/* Date chip */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>
              📅{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </Animated.View>

        {/* ── Error Banner ── */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchDashboardData}>
              <Text style={styles.retryButtonText}>Tap to Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Dashboard Cards ── */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsGrid}>
          {DASHBOARD_CARDS.map(card => {
            const countValue = counts[card.id] ?? '--';
            return (
              <DashboardCard
                key={card.id}
                title={card.title}
                count={countValue}
                icon={card.icon}
                color={card.color}
                onPress={() => handleCardPress(card.id)}
                style={styles.gridCard}
              />
            );
          })}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickActionsRow}>
              <QuickAction
                icon="➕"
                label="Register Staff"
                onPress={() =>
                  navigation.navigate(SCREENS.REGISTER, {isAdminRegister: true})
                }
              />
              <QuickAction
                icon="🏢"
                label="Departments"
                onPress={() => navigation.navigate(SCREENS.DEPT_LIST)}
              />
              <QuickAction
                icon="👨‍⚕️"
                label="Doctors"
                onPress={() =>
                  navigation.navigate(SCREENS.DOCTORS_BY_DEPT, {
                    departmentId: null,
                    departmentName: 'All Departments',
                  })
                }
              />
              <QuickAction
                icon="🏥"
                label="Patients"
                onPress={() => navigation.navigate(SCREENS.PATIENT_SEARCH)}
              />
              <QuickAction
                icon="📅"
                label="Appointments"
                onPress={() => navigation.navigate(SCREENS.BOOK_APPOINTMENT)}
              />
              <QuickAction
                icon="💊"
                label="Prescriptions"
                onPress={() => navigation.navigate(SCREENS.ADD_PRESCRIPTION)}
              />
              <QuickAction
                icon="💰"
                label="Billing"
                onPress={() => navigation.navigate(SCREENS.GENERATE_BILL)}
              />
              <QuickAction
                icon="🩺"
                label="Symptoms"
                onPress={() => navigation.navigate(SCREENS.SYMPTOMS_LIST)}
              />
              <QuickAction
                icon="👩‍⚕️"
                label="Nurses"
                onPress={() => navigation.navigate(SCREENS.PATIENT_SEARCH)}
              />
            </View>
          </ScrollView>
        </View>

        {/* ── Recent Activity placeholder ── */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityPlaceholder}>
            <Text style={styles.activityIcon}>📋</Text>
            <Text style={styles.activityEmptyTitle}>No recent activity</Text>
            <Text style={styles.activityEmptySubtitle}>
              Activity will appear here as you use the system.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Bottom Navigation Placeholder ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navTab}
            onPress={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'home') {
                handlePlaceholderPress(tab.label);
              }
            }}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.navIcon,
                tab.id === activeTab && styles.navIconActive,
              ]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                tab.id === activeTab && styles.navLabelActive,
              ]}>
              {tab.label}
            </Text>
            {tab.id === activeTab && <View style={styles.navActiveIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <LoadingSpinner
        visible={loading && counts.doctors === '--'}
        message="Loading dashboard..."
      />
      <LoadingSpinner visible={loggingOut} message="Signing out..." />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...Platform.select({
      android: {elevation: 6},
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  crossV: {
    position: 'absolute',
    width: 6,
    height: 20,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  crossH: {
    position: 'absolute',
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  headerHospitalName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerTagline: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoutIcon: {fontSize: 14, marginRight: 5},
  logoutText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.white,
  },

  // Scroll
  scroll: {flex: 1},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Profile card
  profileCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      android: {elevation: 6},
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileInfo: {flex: 1},
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  profileEmail: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },

  // Welcome section
  welcomeSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateBadgeText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // Error Banner
  errorContainer: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: FontWeight.medium,
    flex: 1,
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  // Section labels
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  // Dashboard cards grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  gridCard: {
    width: '46%',
    marginHorizontal: '2%',
    marginBottom: 12,
  },

  // Quick Actions
  quickActionsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },

  // Activity
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 8,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  activityPlaceholder: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  activityIcon: {fontSize: 40, marginBottom: 12},
  activityEmptyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  activityEmptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSpacer: {height: 24},

  // Bottom navigation bar
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingTop: 8,
    ...Platform.select({
      android: {elevation: 12},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 2,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  navActiveIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  // Coming Soon Screen styles
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
  },
  comingSoonIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
  },
  comingSoonLogoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
    }),
  },
  comingSoonLogoutButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
});

export default AdminHomeScreen;
