/**
 * Button — Reusable primary action button
 *
 * Props:
 *  title       {string}   — Button label
 *  onPress     {function} — Press handler
 *  loading     {boolean}  — Shows ActivityIndicator when true
 *  disabled    {boolean}  — Disables the button
 *  variant     {string}   — 'primary' | 'outline' | 'ghost' | 'danger'
 *  size        {string}   — 'sm' | 'md' | 'lg'
 *  style       {object}   — Extra container styles
 *  textStyle   {object}   — Extra text styles
 *  icon        {node}     — Optional icon element to render before label
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const isDisabled = disabled || loading;

  // Resolve height & padding by size
  const sizeStyle = sizes[size] || sizes.md;

  // Resolve appearance by variant
  const variantStyle = variants[variant] || variants.primary;
  const variantTextStyle = variantTexts[variant] || variantTexts.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        sizeStyle.container,
        variantStyle,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? Colors.primary
              : Colors.white
          }
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles.text,
              sizeStyle.text,
              variantTextStyle,
              isDisabled && styles.disabledText,
              textStyle,
            ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Size Configs ─────────────────────────────────────────────────────────────
const sizes = {
  sm: {
    container: {height: 40, paddingHorizontal: 16, borderRadius: 10},
    text: {fontSize: FontSize.sm},
  },
  md: {
    container: {height: 52, paddingHorizontal: 24, borderRadius: 14},
    text: {fontSize: FontSize.md},
  },
  lg: {
    container: {height: 58, paddingHorizontal: 32, borderRadius: 16},
    text: {fontSize: FontSize.lg},
  },
};

// ─── Variant Configs ──────────────────────────────────────────────────────────
const variants = {
  primary: {
    backgroundColor: Colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {elevation: 6},
    }),
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.primaryExtraLight,
  },
  danger: {
    backgroundColor: Colors.error,
    ...Platform.select({
      ios: {
        shadowColor: Colors.error,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {elevation: 4},
    }),
  },
};

const variantTexts = {
  primary: {color: Colors.white},
  outline: {color: Colors.primary},
  ghost: {color: Colors.primary},
  danger: {color: Colors.white},
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button;
