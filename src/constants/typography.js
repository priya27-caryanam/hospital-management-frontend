/**
 * HMS Typography System
 * Consistent font sizes, weights, and line heights
 */

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,
  hero: 42,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  extraWide: 1.5,
};

// Prebuilt text style combinations
export const TextStyles = {
  hero: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extraBold,
    letterSpacing: LetterSpacing.tight,
  },
  h1: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
  },
  h2: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
  },
  h3: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semiBold,
  },
  h4: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semiBold,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
  },
  bodyMedium: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wide,
  },
  button: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.wide,
  },
};

export default {FontSize, FontWeight, LineHeight, LetterSpacing, TextStyles};
