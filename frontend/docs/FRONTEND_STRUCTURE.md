# Frontend Structure

The frontend is a React Native Expo application organized into a modular, component-driven hierarchy.

## Directory Layout

```
frontend/
├── assets/          # Static images, splash screens, and app icons
├── docs/            # Living documentation (Architecture, UI reports, etc.)
├── src/
│   ├── components/  # Reusable UI components (The Component Library)
│   │   ├── buttons/ # Reusable button variants
│   │   ├── cards/   # Standardized card layouts (MemoryCard, ReminderCard)
│   │   ├── chat/    # AI chat bubbles and inputs
│   │   ├── data/    # Data visualization components (TagChip, CategoryBadge)
│   │   ├── feedback/# Status messaging, loading states, and Empty states
│   │   ├── inputs/  # Forms, text inputs, and search bars
│   │   └── layout/  # Structural components (Screen wrappers, Headers)
│   ├── context/     # React Context providers (AuthContext)
│   ├── screens/     # Top-level screen components (Login, Register, Home)
│   ├── theme/       # Global design tokens (colors, spacing, typography)
│   ├── constants/   # Hardcoded app configuration (API base URLs)
│   └── utils/       # Helper functions and business logic utilities
├── App.js           # Application entry point and navigation root
├── app.json         # Expo configuration
├── package.json     # Node dependencies
└── README.md        # Basic setup instructions
```

## Component Library Paradigm
The `src/components/` folder serves as a centralized Design System. Screens (`src/screens/`) should primarily be composed of these reusable components rather than utilizing local, inline React Native primitives (`<View>`, `<Text>`). 

This architecture ensures a uniform user experience and makes global theme changes trivial.
