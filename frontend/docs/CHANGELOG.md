# Changelog

## Phase 1A: Frontend Architecture & Design System Foundation

### Added
- **Design System (`src/theme/`)**:
  - `colors.js`: Standardized light and dark mode color palettes.
  - `spacing.js`: Standardized multiples (4, 8, 12, 16, etc).
  - `typography.js`: Standardized fonts, weights, and line heights.
  - `radius.js`: Standardized border radius presets.
  - `shadows.js`: Platform-agnostic shadow profiles.
  - `animation.js` & `zIndex.js`: Stacking contexts and transition timings.
  - `index.js`: Main theme exporter.
- **Component Library (`src/components/`)**:
  - `Screen.js`: Layout component handling SafeArea and KeyboardAvoidingView.
  - `Card.js`: Reusable container with `glass`, `solid`, and `flat` variants.
  - `Button.js`: Reusable button supporting `primary`, `secondary`, `outlined`, and `ghost` variants with built-in loading states.
  - `TextInputBase.js`: Unified text input with icon support and error validation states.
  - `StatusMessage.js`: Unified feedback banner for success/error/warning messages.
  - `Header.js`, `Section.js`, `Divider.js`: Basic layout structural components.
- **Constants & Utilities**:
  - `src/constants/config.js`: Centralized environment variables (`API_BASE_URL`).
  - `src/utils/helpers.js`: Shared utility functions (e.g., text truncation, email validation).

### Changed
- **`LoginScreen.js` Migration**:
  - Replaced over 100 lines of duplicated styling and magic numbers.
  - Integrated `Screen`, `Card`, `TextInputBase`, `StatusMessage`, and `Button` components.
  - Replaced hardcoded `#8b5cf6` and `rgba` values with `theme.colors`.
- **`RegisterScreen.js` Migration**:
  - Analyzed and identified duplicated layouts matching `LoginScreen.js`.
  - Removed duplicated `<SafeAreaView>`, `<KeyboardAvoidingView>`, and manual `<View>` wrappers.
  - Integrated `Screen`, `Card`, `TextInputBase`, `StatusMessage` (for both error and success), and `Button` components.
  - Removed massive duplicated StyleSheet block at the bottom of the file (150+ lines deleted).
- **`HomeScreen.js` Layout Migration**:
  - Replaced the root wrapper with `<Screen safeArea={true} keyboardAvoiding={false}>`.
  - Extracted the main custom header layout to utilize the reusable `<Header>` component.
  - Swapped out raw dashboard `<View>` glass containers with the `<Card variant="glass">` component.
  - Replaced hardcoded status colors with `theme.colors.success` and `theme.colors.warning`.
- **`HomeScreen.js` Search Migration**:
  - Created `SearchInput.js` reusable component to encapsulate the text input and search button logic.
  - Replaced raw `searchBarContainer` inline layout with the `<SearchInput>` component.
  - Replaced `TouchableOpacity` wrappers for search results with the reusable `<Card variant="flat">` layout.
- **`HomeScreen.js` Memory List Migration**:
  - Created `<MemoryCard>`, `<CategoryBadge>`, and `<TagChip>` components to encapsulate memory list items.
  - Created `<EmptyState>` component to standardize empty feedback across the app.
  - Replaced duplicated flatlist item rendering in the Library tab with `<MemoryCard>`.
  - Replaced inline empty state views with `<EmptyState>`.
- **`HomeScreen.js` Reminders Migration**:
  - Created `<ReminderCard>` component with `default` and `compact` variants.
  - Replaced inline reminder dashboard wrappers with `<ReminderCard variant="compact">`.
  - Replaced the Reminders tab `FlatList` items with `<ReminderCard variant="default">`.
  - Replaced the empty reminders state with the reusable `<EmptyState>` component.
- **`HomeScreen.js` AI Chat Migration**:
  - Created `<ChatBubble>` component to encapsulate AI and user message rendering.
  - Created `<ChatInput>` component to handle RAG prompt submission, disabled states, and loaders.
  - Replaced raw inline chat UI elements in `HomeScreen.js` with the new reusable components.
- **`HomeScreen.js` Modals & Overlays Migration**:
  - Created `<ModalContainer>` and `<ModalHeader>` reusable components.
  - Migrated the detail view overlay and the external share modal to use the new modal components, removing duplicated absolute positioning logic.
- **`HomeScreen.js` Bottom Navigation Migration**:
  - Created `<BottomNavigation>` reusable component to encapsulate tab routing UI.
  - Replaced inline `tabBar` JSX and styles in `HomeScreen.js` with the new component.
- **Phase 1A Consistency Audit (Completed)**:
  - Extended Design System with semantic translucent color tokens (e.g. `primarySubtle`, `warningOverlay`).
  - Purged unused `StyleSheet` entries from `HomeScreen.js` and removed hardcoded RGBA values.
  - Created `COMPONENT_USAGE_MAP.md`, `PHASE1A_COMPLETION_REPORT.md`, `TECHNICAL_DEBT_REPORT.md`, and `PHASE1B_PREPARATION.md`.
- **Documentation Overhaul**:
  - Generated full documentation suite: `PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `FRONTEND_STRUCTURE.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE_DECISIONS.md`, `API_REFERENCE.md`, `CONTRIBUTING.md`, `INDEX.md`, `DECISION_INDEX.md`, `PROJECT_HISTORY.md`, `ROADMAP.md`.

### Deprecated
- Inline styles containing `margin`, `padding`, and hardcoded hex values in `LoginScreen` and `RegisterScreen`.

### Security & Architecture
- Extracted raw `API_BASE_URL` strings into a central constant, laying the groundwork for environment variables.
- Separated business logic (AuthContext) from presentation logic by standardizing the UI inputs.
