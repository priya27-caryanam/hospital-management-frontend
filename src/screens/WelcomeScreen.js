/**
 * WelcomeScreen — Hospital Landing Home Page
 *
 * This is the landing screen of the hospital management system app.
 * Displays:
 *  - Hospital branding, logo, and tagline
 *  - Main hero banner welcoming users
 *  - Key hospital features/services (Emergency, Consultation, Pharmacy, Lab, etc.)
 *  - Contact information (Quick access)
 *  - A prominent call-to-action button: "Access Portal" (navigates to LoginScreen)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {SCREENS} from '../navigation/AppNavigator';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Config from '../constants/config';
import Button from '../components/common/Button';

// ─── Service Card Component ──────────────────────────────────────────────────
const ServiceCard = ({icon, title, desc}) => (
  <View style={serviceStyles.card}>
    <View style={serviceStyles.iconBg}>
      <Text style={serviceStyles.icon}>{icon}</Text>
    </View>
    <View style={serviceStyles.textContainer}>
      <Text style={serviceStyles.title}>{title}</Text>
      <Text style={serviceStyles.desc}>{desc}</Text>
    </View>
  </View>
);

const serviceStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryExtraLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

// ─── Main Screen Component ───────────────────────────────────────────────────
const WelcomeScreen = ({navigation}) => {
  const handlePortalAccess = () => {
    navigation.navigate(SCREENS.LOGIN);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLogoContainer}>
          <View style={styles.logoV} />
          <View style={styles.logoH} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{Config.HOSPITAL_NAME}</Text>
          <Text style={styles.headerTagline}>{Config.HOSPITAL_TAGLINE}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Hero Banner ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContent}>
            <Text style={styles.heroWelcome}>Welcome to MediCore</Text>
            <Text style={styles.heroTitle}>Your Health is Our Top Priority</Text>
            <Text style={styles.heroDesc}>
              Providing world-class healthcare services with state-of-the-art
              facilities and expert medical professionals.
            </Text>
          </View>
          <View style={styles.heroDecoration}>
            <Text style={styles.heroEmoji}>🏥</Text>
          </View>
        </View>

        {/* ── Key Services ── */}
        <Text style={styles.sectionTitle}>Our Facilities & Services</Text>
        <View style={styles.servicesContainer}>
          <ServiceCard
            icon="🚨"
            title="24/7 Emergency Care"
            desc="Immediate medical attention with specialized trauma care unit."
          />
          <ServiceCard
            icon="👨‍⚕️"
            title="Expert Consultations"
            desc="Consult with top specialists across multiple departments."
          />
          <ServiceCard
            icon="💊"
            title="Pharmacy Services"
            desc="In-house 24/7 pharmacy with home delivery facilities."
          />
          <ServiceCard
            icon="🔬"
            title="Diagnostics & Labs"
            desc="Advanced imaging and pathology laboratory for accurate tests."
          />
        </View>

        {/* ── Contact Info ── */}
        <Text style={styles.sectionTitle}>Contact & Location</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <View>
              <Text style={styles.contactLabel}>Emergency Helpline</Text>
              <Text style={styles.contactValue}>+91 1800-123-4567</Text>
            </View>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📍</Text>
            <View style={styles.contactTextWrapper}>
              <Text style={styles.contactLabel}>Hospital Location</Text>
              <Text style={styles.contactValue} numberOfLines={2}>
                123 Healthcare Boulevard, Medical Zone, Pune - 411001
              </Text>
            </View>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📧</Text>
            <View>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>info@medicorehospital.com</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Bottom Call-To-Action Button ── */}
      <View style={styles.bottomCtaContainer}>
        <Text style={styles.ctaPrompt}>
          Are you a patient or hospital staff member?
        </Text>
        <Button
          title="Login to Portal"
          onPress={handlePortalAccess}
          icon={<Text style={styles.buttonIcon}>🔑</Text>}
          style={styles.ctaButton}
        />
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoV: {
    position: 'absolute',
    width: 6,
    height: 22,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  logoH: {
    position: 'absolute',
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerTagline: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroTextContent: {
    flex: 1.3,
    zIndex: 2,
  },
  heroWelcome: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: 8,
    lineHeight: 26,
  },
  heroDesc: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  heroDecoration: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heroEmoji: {
    fontSize: 72,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  servicesContainer: {
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    fontSize: 22,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  contactLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  contactValue: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semiBold,
    marginTop: 2,
  },
  contactTextWrapper: {
    flex: 1,
  },
  bottomSpacer: {
    height: 100, // Make room for the floating absolute bottom button container
  },
  bottomCtaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  ctaPrompt: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaButton: {
    width: '100%',
  },
  buttonIcon: {
    fontSize: 16,
  },
});

export default WelcomeScreen;
