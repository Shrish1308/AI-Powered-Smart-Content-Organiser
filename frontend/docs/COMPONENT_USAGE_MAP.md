# Component Usage Map

This document tracks all reusable components in the SmartRecall frontend, explaining their purpose, current usage, and dependencies. It acts as an audit log to prevent duplicate UI logic and over-abstraction.

---

### `<Screen>`
**Purpose**: Root layout wrapper providing safe area handling, keyboard avoiding behavior, and base background colors.
**Current Usage**: `HomeScreen.js`, `LoginScreen.js`, `RegisterScreen.js`
**Future Planned Usage**: All future top-level screen components.
**Dependencies**: `react-native-safe-area-context`, `theme.colors.background`
**Related Components**: None

---

### `<Card>`
**Purpose**: Standardized container for grouped content. Supports `glass`, `flat`, and `elevated` variants.
**Current Usage**: `HomeScreen.js` (Dashboard sections, search results, memory items), `LoginScreen.js`, `RegisterScreen.js`
**Future Planned Usage**: Settings panels, detailed analytics cards.
**Dependencies**: `theme.colors.cardOverlay`, `theme.colors.glassBorder`
**Related Components**: `<MemoryCard>`, `<ReminderCard>`

---

### `<Button>`
**Purpose**: Primary interactive touch target with variants for `primary`, `secondary`, `ghost`, and `danger`. Includes built-in loading states.
**Current Usage**: `LoginScreen.js`, `RegisterScreen.js` (Auth buttons), `HomeScreen.js` (Save/Action buttons)
**Future Planned Usage**: Settings actions, dialog confirmations.
**Dependencies**: `theme.colors.primary`, `ActivityIndicator`
**Related Components**: `<BottomNavigation>`

---

### `<TextInputBase>`
**Purpose**: Core input field wrapper with standard focus borders, placeholder styling, and optional icons.
**Current Usage**: `LoginScreen.js`, `RegisterScreen.js`
**Future Planned Usage**: Generic text inputs in future forms (e.g. Add Note).
**Dependencies**: `theme.colors.inputBackground`, `@expo/vector-icons`
**Related Components**: `<SearchInput>`, `<ChatInput>`

---

### `<SearchInput>`
**Purpose**: Semantic search bar handling specific placeholder animations and submit logic.
**Current Usage**: `HomeScreen.js` (Search tab)
**Future Planned Usage**: Embedded search inside modal dialogs if needed.
**Dependencies**: `<TextInputBase>`, `theme.colors.primary`
**Related Components**: `<TextInputBase>`

---

### `<MemoryCard>`
**Purpose**: Domain-specific display for a saved "Memory" or Note, rendering semantic proximity and tags.
**Current Usage**: `HomeScreen.js` (Library tab)
**Future Planned Usage**: Note detail views, timeline views.
**Dependencies**: `<Card>`, `theme.colors`
**Related Components**: `<Card>`, `<TagChip>`

---

### `<ReminderCard>`
**Purpose**: Domain-specific card for active alerts/reminders with date formatting and completion checkboxes.
**Current Usage**: `HomeScreen.js` (Dashboard tab, Reminders tab)
**Future Planned Usage**: Notification history view.
**Dependencies**: `<Card>`, `theme.colors.warning`
**Related Components**: `<Card>`

---

### `<BottomNavigation>`
**Purpose**: Encapsulates the global tab routing bar, icons, and active state styling.
**Current Usage**: `HomeScreen.js`
**Future Planned Usage**: Will be replaced/integrated with React Navigation `BottomTabNavigator` in Phase 1B.
**Dependencies**: `theme.colors.glassBorder`, `theme.colors.primary`
**Related Components**: None

---

### `<ChatBubble>` & `<ChatInput>`
**Purpose**: Handles RAG prompt submission and displays AI/User message formatting.
**Current Usage**: `HomeScreen.js` (AI Chat tab)
**Future Planned Usage**: Fullscreen dedicated chat mode.
**Dependencies**: `theme.colors.primary`, `theme.colors.cardOverlay`
**Related Components**: `<TextInputBase>`

---

### `<ModalContainer>` & `<ModalHeader>`
**Purpose**: Standardized absolute positioning and glassmorphism overlay container for dialogs.
**Current Usage**: `HomeScreen.js` (Detail View Overlay)
**Future Planned Usage**: Settings overlays, generic confirm dialogs.
**Dependencies**: `theme.colors.modalOverlay`, `theme.radius`
**Related Components**: `<Card>`

---

### `<StatusMessage>` & `<EmptyState>`
**Purpose**: Standardized banners for errors/success and empty data feedback.
**Current Usage**: `LoginScreen.js`, `RegisterScreen.js`, `HomeScreen.js`
**Future Planned Usage**: All error boundary and empty list fallbacks.
**Dependencies**: `theme.colors.errorOverlay`, `theme.colors.successOverlay`
**Related Components**: None
