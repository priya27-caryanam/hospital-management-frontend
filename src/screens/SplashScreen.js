/**
 * SplashScreen
 *
 * Displayed at app launch for 2.5 seconds.
 * Shows hospital logo, app name, tagline, and an animated pulse ring.
 * Automatically navigates to LoginScreen after the timeout.
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, StatusBar} from 'react-native';
import {SCREENS} from '../navigation/AppNavigator';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Config from '../constants/config';

const SplashScreen = ({navigation}) => {
  // ─── Animation refs ────────────────────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 1. Logo entrance animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Text fade-in (delayed)
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Continuous pulse ring animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.4,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulseLoop.start();

    // 4. Navigate to Welcome screen after splash duration
    const timer = setTimeout(() => {
      navigation.replace(SCREENS.WELCOME);
    }, Config.SPLASH_DURATION);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />

      {/* Background decorative circles */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      {/* Logo section */}
      <View style={styles.logoSection}>
        {/* Pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{scale: pulseScale}],
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Logo container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{scale: logoScale}],
              opacity: logoOpacity,
            },
          ]}>
          {/* Hospital cross symbol */}
          <View style={styles.crossVertical} />
          <View style={styles.crossHorizontal} />
          {/* Inner dot */}
          <View style={styles.crossDot} />
        </Animated.View>
      </View>

      {/* Text section */}
      <Animated.View
        style={[
          styles.textSection,
          {
            opacity: textOpacity,
            transform: [{translateY: taglineTranslateY}],
          },
        ]}>
        <Text style={styles.appName}>{Config.HOSPITAL_NAME}</Text>
        <View style={styles.divider} />
        <Text style={styles.appSubtitle}>Hospital Management System</Text>
        <Text style={styles.tagline}>{Config.HOSPITAL_TAGLINE}</Text>
      </Animated.View>

      {/* Bottom loading dots */}
      <Animated.View style={[styles.loadingSection, {opacity: textOpacity}]}>
        <LoadingDots />
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>v{Config.APP_VERSION}</Text>
    </View>
  );
};

// ─── Animated loading dots ────────────────────────────────────────────────────
const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = dot =>
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

    const loop = Animated.loop(
      Animated.stagger(200, [animate(dot1), animate(dot2), animate(dot3)]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={dotStyles.row}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[dotStyles.dot, {opacity: dot}]} />
      ))}
    </View>
  );
};

const dotStyles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentLight,
    marginHorizontal: 5,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircleTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  bgCircleBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossVertical: {
    position: 'absolute',
    width: 16,
    height: 52,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 52,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  crossDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extraBold,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 1,
    marginVertical: 12,
  },
  appSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  loadingSection: {
    marginTop: 60,
  },
  version: {
    position: 'absolute',
    bottom: 36,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
