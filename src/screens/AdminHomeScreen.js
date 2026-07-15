/**
 * AdminHomeScreen
 *
 * Main dashboard for the Admin after successful login.
 *
 * Displays:
 *  - Custom header with hospital name and logout button
 *  - Admin profile card (name, role, email from stored user data)
 *  - Welcome message
 *  - 2-column grid of 6 dashboard stat cards
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {clearAll, getUserData} from '../utils/storage';
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
    title: 'Doctors',
    count: '0',
    icon: '👨‍⚕️',
    color: Colors.cardDoctor,
  },
  {
    id: 'patients',
    title: 'Patients',
    count: '0',
    icon: '🏥',
    color: Colors.cardPatient,
  },
  {
    id: 'appointments',
    title: 'Appointments',
    count: '0',
    icon: '📅',
    color: Colors.cardAppointment,
  },
  {
    id: 'staff',
    title: 'Staff',
    count: '0',
    icon: '👨‍💼',
    color: Colors.cardStaff,
  },
  {
    id: 'departments',
    title: 'Departments',
    count: '0',
    icon: '🏢',
    color: Colors.cardDepartment,
  },
  {
    id: 'reports',
    title: 'Reports',
    count: '0',
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
  <TouchableOpacity style={quickStyles.item} onPress={onPress} activeOpacity={0.8}>
    <View style={quickStyles.iconBg}>
      <Text style={quickStyles.icon}>{icon}</Text>
    </View>
    <Text style={quickStyles.label} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

const quickStyles = StyleSheet.create({
  item: {
    alignItems: 'center',
    width: 72,
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

  // Greeting animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Load user data from storage if not passed via route params
    if (!userData) {
      getUserData().then(data => {
        if (data) {
          setUserData(data);
        }
      });
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            } catch (error) {
              console.error('[AdminHome] Logout error:', error);
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

  const displayName = userData
    ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Admin'
    : 'Admin';
  const displayRole = userData?.role || 'ADMIN';
  const displayEmail = userData?.email || '';

  // Format role for display
  const formatRole = role =>
    role
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

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

        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

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

        {/* ── Dashboard Cards ── */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsGrid}>
          {DASHBOARD_CARDS.map((card, index) => {
            const rowDelay = Math.floor(index / 2) * 100;
            return (
              <DashboardCard
                key={card.id}
                title={card.title}
                count={card.count}
                icon={card.icon}
                color={card.color}
                onPress={() => {
                  /* Navigate to respective module screen when built */
                }}
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
              <QuickAction icon="➕" label="Add Patient" onPress={() => {}} />
              <QuickAction icon="📋" label="New Appt." onPress={() => {}} />
              <QuickAction icon="👨‍⚕️" label="Add Doctor" onPress={() => {}} />
              <QuickAction icon="💊" label="Pharmacy" onPress={() => {}} />
              <QuickAction icon="🔬" label="Lab" onPress={() => {}} />
              <QuickAction icon="📈" label="Reports" onPress={() => {}} />
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
            onPress={() => setActiveTab(tab.id)}
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
});

export default AdminHomeScreen;
