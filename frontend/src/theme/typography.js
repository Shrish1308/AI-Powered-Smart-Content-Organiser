/**
 * src/theme/typography.js
 * Standardized typography scale.
 */
import { Platform } from 'react-native';

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const typography = {
  display: {
    fontFamily,
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  body: {
    fontFamily,
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  label: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  caption: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  button: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
};
