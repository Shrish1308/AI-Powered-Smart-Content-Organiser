# Project History

## Milestones

### Version 0.1
**Initial MVP**
- Basic React Native Expo setup.
- Simple FastAPI backend.

↓

### Version 0.2
**Authentication**
- Integrated JWT auth and local `AsyncStorage` persistence.

↓

### Version 0.3
**Gemini Integration**
- Added Google Gemini API to the backend to automatically parse, summarize, and tag raw text dumps.

↓

### Version 0.4
**Semantic Search**
- Integrated HuggingFace `SentenceTransformers` and PostgreSQL `pgvector` to enable searching notes by meaning rather than keywords.

↓

### Version 0.5
**Reminder System**
- Created the ability to extract dates from notes and schedule active "Nudges" to alert the user.

↓

### Version 0.6
**Design System**
- Established a formal `theme/index.js` featuring centralized design tokens (colors, spacing, radiuses) and a dark-mode Glassmorphism aesthetic.

↓

### Version 0.7
**Reusable Component Library**
- Began decoupling inline styles from screens by introducing standard `<Screen>`, `<Card>`, `<Button>`, and `<TextInputBase>` components.

↓

### Version 0.8
**Incremental UI Migration (Phase 1A)**
- Phase 1A Setup (Completed)
  - Successfully moved `LoginScreen`, `RegisterScreen`, and `HomeScreen` onto a new unified Component Library without breaking business logic.
  - Incrementally migrated Structural Layout, Search UI, Memory List, Reminder Cards, AI Chat, Modals, and Bottom Navigation.

- Scope Reduction: Share Intent Removal (Completed)
  - Audited and intentionally decommissioned the dormant `expo-share-intent` code.
  - Simplified the frontend footprint to focus exclusively on core Smart Recall features (Manual notes, AI queries, Semantics).
