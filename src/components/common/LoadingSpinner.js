/**
 * LoadingSpinner — Full-screen loading overlay
 *
 * Props:
 *  visible  {boolean} — Whether to display the overlay
 *  message  {string}  — Optional loading message text
 *  overlay  {boolean} — Whether to show a dark semi-transparent backdrop
 */

import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet, Modal} from 'react-native';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const LoadingSpinner = ({
  visible = true,
  message = 'Please wait...',
  overlay = true,
}) => {
  if (!visible) {
    return null;
  }

  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color={Colors.primary} />
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </View>
      </Modal>
    );
  }

  // Inline (non-overlay) spinner
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    minWidth: 180,
    shadowColor: Colors.shadowDark,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  inline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
