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
import {clearAll, getUserData} from '../utils/storage';
import {SCREENS} from '../navigation/AppNavigator';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Config from '../constants/config';
import DashboardCard from '../components/common/DashboardCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

const ReceptionistDashboardScreen = ({navigation, route}) => {
  const [userData, setUserData] = useState(route?.params?.user || null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(
    () => {
      if (!userData) {
        getUserData()
          .then(data => {
            if (data) {
              setUserData(data);
            }
          })
          .catch(() => {});
      }

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await clearAll();
            navigation.replace(SCREENS.LOGIN);
          } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

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

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />
      <LoadingSpinner visible={loggingOut} message="Logging out..." />

      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoMark}>
            <View style={styles.crossV} />
            <View style={styles.crossH} />
          </View>
          <View>
            <Text style={styles.headerHospitalName}>
              {Config.HOSPITAL_NAME}
            </Text>
            <Text style={styles.headerTagline}>Receptionist Portal</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutEmoji}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }>
        <Animated.View
          style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeGreeting}>{getGreeting()},</Text>
              <Text style={styles.welcomeName}>
                {userData?.name || 'Receptionist'} 👤
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>RECEPTIONIST</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.quickActionsRow}>
                <QuickAction
                  icon="👤"
                  label="My Profile"
                  onPress={() =>
                    navigation.navigate(SCREENS.RECEPTIONIST_PROFILE, {
                      receptionistId: userData?.userId,
                    })
                  }
                />
                <QuickAction
                  icon="📅"
                  label="Book Appt"
                  onPress={() => navigation.navigate(SCREENS.BOOK_APPOINTMENT)}
                />
                <QuickAction
                  icon="🏥"
                  label="Search Patient"
                  onPress={() => navigation.navigate(SCREENS.PATIENT_SEARCH)}
                />
                <QuickAction
                  icon="🩺"
                  label="Symptoms"
                  onPress={() => navigation.navigate(SCREENS.SYMPTOMS_LIST)}
                />
              </View>
            </ScrollView>
          </View>

          {/* Stat Placeholders */}
          <Text style={styles.sectionTitle}>Front Desk Stats</Text>
          <View style={styles.grid}>
            <DashboardCard
              title="Today's Bookings"
              value="--"
              icon="📅"
              color={Colors.cardAppointment}
              style={styles.gridCard}
            />
            <DashboardCard
              title="Registered Patients"
              value="--"
              icon="🏥"
              color={Colors.cardPatient}
              style={styles.gridCard}
            />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Note</Text>
            <Text style={styles.infoText}>
              Front desk registration volume, waiting list metrics, and billing
              indicators will be sync'd dynamically when corresponding API hooks
              are enabled.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMark: {
    width: 32,
    height: 32,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossV: {
    width: 6,
    height: 18,
    backgroundColor: Colors.primary,
    position: 'absolute',
    borderRadius: 2,
  },
  crossH: {
    width: 18,
    height: 6,
    backgroundColor: Colors.primary,
    position: 'absolute',
    borderRadius: 2,
  },
  headerHospitalName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerTagline: {
    fontSize: FontSize.xs,
    color: Colors.primaryExtraLight,
    fontWeight: FontWeight.medium,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutEmoji: {
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      android: {elevation: 4},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: Colors.primaryExtraLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  quickActionsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 20,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  quickActionsRow: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 20,
    ...Platform.select({
      android: {elevation: 2},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  infoTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default ReceptionistDashboardScreen;
