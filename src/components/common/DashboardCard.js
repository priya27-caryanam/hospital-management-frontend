/**
 * DashboardCard — Admin home dashboard stat card
 *
 * Props:
 *  title      {string}   — Card label (e.g. "Doctors")
 *  count      {string|number} — Stat value shown prominently
 *  icon       {string}   — Emoji icon
 *  color      {string}   — Background color of the card header strip
 *  onPress    {function} — Optional press handler
 *  style      {object}   — Extra container styles
 */

import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet, Platform} from 'react-native';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const DashboardCard = ({
  title,
  count = '--',
  icon = '📋',
  color = Colors.primary,
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, style]}>
      {/* Colored accent strip at top */}
      <View style={[styles.accentStrip, {backgroundColor: color}]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 6,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.14,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  accentStrip: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  body: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  count: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default DashboardCard;
