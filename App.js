/**
 * App.js — Root entry point for HMS React Native application
 *
 * Responsibilities:
 *  - Sets up GestureHandlerRootView (required by react-native-gesture-handler)
 *  - Renders the AppNavigator which contains all screen stacks
 *
 * @format
 */

import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
