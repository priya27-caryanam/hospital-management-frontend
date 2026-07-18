/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
import renderer from 'react-test-renderer';

// Mock SplashScreen to avoid infinite loop animations during Jest run
jest.mock('../src/screens/SplashScreen', () => {
  const React = require('react');
  const View = require('react-native').View;
  return () => <View testID="SplashScreen" />;
});

it('renders correctly', () => {
  renderer.create(<App />);
});
