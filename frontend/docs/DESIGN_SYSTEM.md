# Design System

Smart Recall uses a custom-built Design System heavily reliant on React Native style tokenization.

## Theme Architecture
All design tokens are centralized in `src/theme/index.js`. This file exports a single `theme` object containing semantic variables. 

Components should NEVER use hardcoded hex values or pixel spacing integers. Instead, they must import `theme` and reference its properties.

### Colors (`theme.colors`)
- **Backgrounds**: `background`, `surface`, `surfaceLight`
- **Text**: `textPrimary`, `textSecondary`, `textTertiary`, `textInverse`
- **Brand**: `primary`, `secondary`
- **Feedback**: `success`, `error`, `warning`

### Spacing (`theme.spacing`)
A 4-point grid system is utilized for margins and padding.
- `[1]`: 4px
- `[2]`: 8px
- `[3]`: 12px
- `[4]`: 16px
- `[6]`: 24px
- `[8]`: 32px

### Typography (`theme.typography`)
Standardized font sizes and line heights.
- `h1`, `h2`, `h3`
- `body`, `caption`

### Radii (`theme.radius`)
Border radiuses for components.
- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px

## Aesthetics
Smart Recall utilizes a modern, dark-mode-first "Glassmorphism" aesthetic.
- UI elements often use semi-transparent rgba backgrounds (e.g., `rgba(15, 23, 42, 0.6)`) to allow underlying elements to blur through.
- Soft gradients and subtle borders (`rgba(255, 255, 255, 0.05)`) provide depth without heavy shadows.
