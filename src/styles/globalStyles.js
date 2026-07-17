/**
 * HMS Global Styles (globalStyles.js)
 *
 * Shared StyleSheet objects reused across multiple screens and components.
 * Import individual named exports as needed.
 */

import {StyleSheet, Platform} from 'react-native';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';

// ─── Layout ───────────────────────────────────────────────────────────────────

export const layoutStyles = StyleSheet.create({
  flex1: {flex: 1},
  center: {justifyContent: 'center', alignItems: 'center'},
  row: {flexDirection: 'row', alignItems: 'center'},
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentPadding: {
    paddingHorizontal: 24,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

// ─── Card ─────────────────────────────────────────────────────────────────────

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardSmall: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

// ─── Typography ───────────────────────────────────────────────────────────────

export const textStyles = StyleSheet.create({
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  captionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.textMuted,
  },
  labelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  errorText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.error,
    marginTop: 4,
  },
  linkText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textLink,
  },
});

// ─── Form ─────────────────────────────────────────────────────────────────────

export const formStyles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  inputRowFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
});

// ─── Divider / Separator ──────────────────────────────────────────────────────

export const dividerStyles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  dividerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerLabel: {
    paddingHorizontal: 12,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});

// ─── Header ───────────────────────────────────────────────────────────────────

export const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
});
