/**
 * src/theme/index.js
 * Central export for the Smart Recall Design System.
 */
import { lightTheme, darkTheme } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { animation } from './animation';
import { zIndex } from './zIndex';

export const theme = {
  colors: darkTheme, // Defaulting to dark theme for now
  typography,
  spacing,
  radius,
  shadows,
  animation,
  zIndex,
};

export default theme;
