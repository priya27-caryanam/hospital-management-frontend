/**
 * PatientHomeScreen
 *
 * Dashboard for Patient users after successful login.
 * Displays:
 *  - Custom header with hospital name, logo mark, and quick logout
 *  - Welcome Card (Good morning/afternoon/evening greeting with dynamic name)
 *  - Patient Profile Summary (demographic details formatted like a digital health card)
 *  - Upcoming Appointment Card (doctor details, date, time, and status badge)
 *  - Medical History Card (recent diagnoses, visits)
 *  - Prescription Card (active medications and instructions)
 *  - Interactive Action Buttons (Search Doctor, Book Appointment)
 *  - Bottom Navigation Placeholder
 *  - Logout Button (triggers clearAll() and navigates back to Login)
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
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PatientHomeScreen = ({navigation, route}) => {
  const [userData, setUserData] = useState(route?.params?.user || null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    // Load user data from storage if not passed via route params
    if (!userData) {
      getUserData().then(data => {
        if (data) {
          setUserData(data);
        }
      });
    }

    // Run entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, [userData, fadeAnim, slideAnim]);

  // ─── Logout logic ──────────────────────────────────────────────────────────
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
              console.error('[PatientHome] Logout error:', error);
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

  // ─── Time-based Greeting ───────────────────────────────────────────────────
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

  // Helper values
  const displayName = userData
    ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Patient'
    : 'Patient';
  const displayEmail = userData?.email || 'patient@medicore.com';
  const displayPhone = userData?.phoneNumber || 'Not provided';
  const displayDob = userData?.dateOfBirth || 'Not provided';
  const displayGender = userData?.gender
    ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1).toLowerCase()
    : 'Not provided';

  // ─── Quick action handlers ─────────────────────────────────────────────────
  const handleSearchDoctor = () => {
    Alert.alert('Search Doctor', 'Search specialist doctors feature is coming soon!');
  };

  const handleBookAppointment = () => {
    Alert.alert('Book Appointment', 'Online appointment booking schedule is coming soon!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoMark}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <View>
            <Text style={styles.headerHospitalName}>{Config.HOSPITAL_NAME}</Text>
            <Text style={styles.headerTagline}>Patient Portal</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerLogoutBtn} onPress={handleLogout}>
          <Text style={styles.headerLogoutEmoji}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
          
          {/* ── Welcome Card ── */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeGreeting}>{getGreeting()},</Text>
              <Text style={styles.welcomeName}>{displayName} 👋</Text>
              <Text style={styles.welcomeTip}>
                Tip: Drink at least 3 liters of water daily to maintain peak metabolic function and energy levels.
              </Text>
            </View>
            <View style={styles.welcomeIconBg}>
              <Text style={styles.welcomeEmoji}>❤️</Text>
            </View>
          </View>

          {/* ── Quick Action Buttons (2-Column) ── */}
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, {backgroundColor: Colors.primaryLight}]} 
              onPress={handleSearchDoctor}
              activeOpacity={0.85}>
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Search Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, {backgroundColor: Colors.accent}]} 
              onPress={handleBookAppointment}
              activeOpacity={0.85}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>

          {/* ── Patient Profile Summary ── */}
          <Text style={styles.sectionTitle}>Digital Health Card</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileCardLabel}>MEDICORE PATIENT IDENTIFICATION</Text>
              <View style={styles.profileActiveIndicator}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Name</Text>
                <Text style={styles.profileValue}>{displayName}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Email</Text>
                <Text style={styles.profileValue}>{displayEmail}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Mobile Number</Text>
                <Text style={styles.profileValue}>{displayPhone}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Date of Birth</Text>
                <Text style={styles.profileValue}>{displayDob}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Gender</Text>
                <Text style={styles.profileValue}>{displayGender}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Patient ID</Text>
                <Text style={styles.profileValue}>MC-2026-9481</Text>
              </View>
            </View>
          </View>

          {/* ── Upcoming Appointment Card ── */}
          <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
          <View style={styles.card}>
            <View style={styles.appointmentHeader}>
              <View style={styles.docAvatarBg}>
                <Text style={styles.docAvatar}>👨‍⚕️</Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.docName}>Dr. Anjali Sharma</Text>
                <Text style={styles.docSpecialty}>Cardiologist</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.appointmentTimeRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>DATE</Text>
                <Text style={styles.timeValue}>Mon, Jul 20, 2026</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>TIME</Text>
                <Text style={styles.timeValue}>10:30 AM</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>ROOM</Text>
                <Text style={styles.timeValue}>Clinic B-302</Text>
              </View>
            </View>
          </View>

          {/* ── Medical History Card ── */}
          <Text style={styles.sectionTitle}>Medical Records & Visits</Text>
          <View style={styles.card}>
            <View style={styles.recordItem}>
              <View style={styles.recordIconBg}>
                <Text style={styles.recordIcon}>📝</Text>
              </View>
              <View style={styles.recordDetails}>
                <Text style={styles.recordTitle}>Annual Health Checkup</Text>
                <Text style={styles.recordDoc}>Dr. Sameer Patil • General Medicine</Text>
                <Text style={styles.recordDate}>Completed on Jun 15, 2026</Text>
              </View>
            </View>
            
            <View style={styles.recordDivider} />

            <View style={styles.recordItem}>
              <View style={[styles.recordIconBg, {backgroundColor: Colors.infoLight}]}>
                <Text style={styles.recordIcon}>🔬</Text>
              </View>
              <View style={styles.recordDetails}>
                <Text style={styles.recordTitle}>Complete Blood Count (CBC) Lab</Text>
                <Text style={styles.recordDoc}>MediCore Diagnostics Laboratory</Text>
                <Text style={styles.recordDate}>Completed on Jun 15, 2026</Text>
              </View>
            </View>
          </View>

          {/* ── Prescription Card ── */}
          <Text style={styles.sectionTitle}>Active Prescriptions</Text>
          <View style={styles.card}>
            <View style={styles.prescriptionHeader}>
              <Text style={styles.prescriptionHeaderTitle}>Current Medications</Text>
              <Text style={styles.prescriptionRef}>Ref: RX-883012</Text>
            </View>
            <View style={styles.cardDivider} />
            
            <View style={styles.medicationRow}>
              <View style={styles.medIndicator}>
                <Text style={styles.medEmoji}>💊</Text>
              </View>
              <View style={styles.medDetails}>
                <Text style={styles.medName}>Metformin 500mg</Text>
                <Text style={styles.medInstruction}>1 tablet after dinner daily (Oral)</Text>
              </View>
              <Text style={styles.medDuration}>30 Days</Text>
            </View>

            <View style={styles.medDivider} />

            <View style={styles.medicationRow}>
              <View style={styles.medIndicator}>
                <Text style={styles.medEmoji}>💊</Text>
              </View>
              <View style={styles.medDetails}>
                <Text style={styles.medName}>Atorvastatin 10mg</Text>
                <Text style={styles.medInstruction}>1 tablet before bedtime daily (Oral)</Text>
              </View>
              <Text style={styles.medDuration}>30 Days</Text>
            </View>
          </View>

          {/* ── Logout Button ── */}
          <Button
            title="Log Out From Portal"
            onPress={handleLogout}
            style={styles.logoutBtn}
            type="secondary"
          />

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>

      {/* ── Bottom Navigation Placeholder ── */}
      <View style={styles.bottomNav}>
        {[
          {id: 'home', label: 'Home', icon: '🏠'},
          {id: 'appointments', label: 'Appointments', icon: '📅'},
          {id: 'records', label: 'Records', icon: '📝'},
          {id: 'settings', label: 'Settings', icon: '⚙️'},
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navTab}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.navIcon,
                activeTab === tab.id && styles.navIconActive,
              ]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                activeTab === tab.id && styles.navLabelActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <LoadingSpinner visible={loggingOut} message="Logging out..." />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 90, // Leave room for bottom navigation placeholder
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...Platform.select({
      android: {elevation: 6},
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  crossV: {
    position: 'absolute',
    width: 5,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  crossH: {
    position: 'absolute',
    width: 18,
    height: 5,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  headerHospitalName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerTagline: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  headerLogoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoutEmoji: {
    fontSize: 16,
  },

  // Welcome Card
  welcomeCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {elevation: 4},
    }),
  },
  welcomeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  welcomeGreeting: {
    fontSize: FontSize.base,
    color: Colors.accentLight,
    fontWeight: FontWeight.medium,
  },
  welcomeName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginTop: 2,
    marginBottom: 8,
  },
  welcomeTip: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  welcomeIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeEmoji: {
    fontSize: 22,
  },

  // Quick Action Buttons
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {elevation: 3},
    }),
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },

  // Titles
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Cards (General)
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {elevation: 2},
    }),
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },

  // Patient Profile / Health Card
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {elevation: 3},
    }),
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileCardLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  profileActiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  activeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  profileDivider: {
    height: 1.5,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileItem: {
    width: '48%',
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semiBold,
  },

  // Appointment Card Specific
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docAvatarBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docAvatar: {
    fontSize: 20,
  },
  appointmentInfo: {
    flex: 1,
  },
  docName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  docSpecialty: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: FontWeight.semiBold,
  },
  appointmentTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  timeValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    marginTop: 3,
  },

  // Medical History / Records Card
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recordIcon: {
    fontSize: 18,
  },
  recordDetails: {
    flex: 1,
  },
  recordTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  recordDoc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  recordDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  recordDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },

  // Prescription Card
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prescriptionHeaderTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  prescriptionRef: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medEmoji: {
    fontSize: 15,
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  medInstruction: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  medDuration: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  medDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },

  // Logout Button
  logoutBtn: {
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },

  // Bottom Navigation Placeholder
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 84 : 64,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {elevation: 12},
    }),
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});

export default PatientHomeScreen;
