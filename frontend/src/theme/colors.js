/**
 * src/theme/colors.js
 * Professional, calm AI-productivity palette.
 * Supports light and dark modes.
 */

const baseColors = {
  // Brand
  primary: '#8b5cf6', // Soft purple
  secondary: '#c084fc', // Lighter purple
  
  // Accents
  aiAccent: '#6366f1', // Indigo for AI operations
  searchAccent: '#3b82f6', // Blue for search
  
  // Status
  success: '#10b981', // Emerald
  warning: '#f59e0b', // Amber
  error: '#f87171', // Soft Red
  info: '#3b82f6', // Blue
  reminder: '#f59e0b', // Amber
  
  // Tag Categories (Softened for premium feel)
  tags: {
    study: '#60a5fa', // Blue
    work: '#818cf8', // Indigo
    health: '#34d399', // Emerald
    finance: '#fbbf24', // Amber
    personal: '#f472b6', // Pink
    other: '#a78bfa', // Purple
  }
};

export const lightTheme = {
  ...baseColors,
  mode: 'light',
  
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  cardGlass: 'rgba(255, 255, 255, 0.75)',
  
  border: '#e2e8f0',
  borderGlass: 'rgba(0, 0, 0, 0.05)',
  
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',
  
  iconPrimary: '#334155',
  iconSecondary: '#94a3b8',
  
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  // Translucent Semantic Tokens
  primarySubtle: 'rgba(139, 92, 246, 0.1)',
  primaryOverlay: 'rgba(139, 92, 246, 0.2)',
  successOverlay: 'rgba(16, 185, 129, 0.1)',
  warningOverlay: 'rgba(245, 158, 11, 0.1)',
  errorOverlay: 'rgba(248, 113, 113, 0.1)',
  surfaceOverlay: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(0, 0, 0, 0.05)',
  glassBackground: 'rgba(0, 0, 0, 0.02)',
  modalOverlay: 'rgba(0, 0, 0, 0.4)',
  cardOverlay: 'rgba(255, 255, 255, 0.75)',
};

export const darkTheme = {
  ...baseColors,
  mode: 'dark',
  
  // Much deeper, calmer dark mode instead of pure black
  background: '#0b0f19', 
  surface: '#111827',
  card: 'rgba(30, 41, 59, 0.45)', // The glass effect used in original design
  cardGlass: 'rgba(30, 41, 59, 0.45)',
  
  border: '#334155',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textInverse: '#ffffff', // primary buttons always have white text
  
  iconPrimary: '#f8fafc',
  iconSecondary: '#94a3b8',
  
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Translucent Semantic Tokens
  primarySubtle: 'rgba(139, 92, 246, 0.15)',
  primaryOverlay: 'rgba(139, 92, 246, 0.3)',
  successOverlay: 'rgba(16, 185, 129, 0.15)',
  warningOverlay: 'rgba(245, 158, 11, 0.15)',
  errorOverlay: 'rgba(239, 68, 68, 0.15)',
  surfaceOverlay: 'rgba(11, 15, 25, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
  glassBackground: 'rgba(255, 255, 255, 0.03)',
  modalOverlay: 'rgba(20, 17, 55, 0.97)', // specific dark violet overlay used in the app
  cardOverlay: 'rgba(30, 41, 59, 0.45)',
};

// Default export uses darkTheme to match the current original app state
export default darkTheme;
