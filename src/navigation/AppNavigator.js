/**
 * AppNavigator — Root navigation stack
 *
 * Stack order:
 *   Splash → Login → Register → AdminHome
 *
 * - Splash is shown first (no header)
 * - After login, user is replaced into AdminHome (cannot go back)
 * - Register is accessible from Login
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import Colors from '../constants/colors';
import {FontWeight, FontSize} from '../constants/typography';

const Stack = createNativeStackNavigator();

// ─── Screen Names (centralised to avoid typo bugs) ───────────────────────────
export const SCREENS = {
  SPLASH: 'Splash',
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',
  ADMIN_HOME: 'AdminHome',
};

// ─── Default header options for authenticated screens ─────────────────────────
const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: Colors.primary,
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontWeight: FontWeight.semiBold,
    fontSize: FontSize.lg,
  },
  headerBackTitleVisible: false,
  animation: 'slide_from_right',
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SCREENS.SPLASH}
        screenOptions={defaultScreenOptions}>

        {/* ── Splash ── */}
        <Stack.Screen
          name={SCREENS.SPLASH}
          component={SplashScreen}
          options={{headerShown: false}}
        />

        {/* ── Welcome ── */}
        <Stack.Screen
          name={SCREENS.WELCOME}
          component={WelcomeScreen}
          options={{headerShown: false}}
        />

        {/* ── Login ── */}
        <Stack.Screen
          name={SCREENS.LOGIN}
          component={LoginScreen}
          options={{headerShown: false}}
        />

        {/* ── Register ── */}
        <Stack.Screen
          name={SCREENS.REGISTER}
          component={RegisterScreen}
          options={{
            title: 'Register Staff',
            headerBackVisible: true,
          }}
        />

        {/* ── Admin Home ── */}
        <Stack.Screen
          name={SCREENS.ADMIN_HOME}
          component={AdminHomeScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
