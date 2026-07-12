# Architectural Component Decisions

## SearchInput
**Reason**:
The search bar existed in multiple places with duplicated styling and loading logic, heavily tied to inline styles.

**Decision**:
Extracted into a reusable `<SearchInput>` component.

**Benefits**:
- Consistent search styling across the app.
- Centralizes loading spinner and keyboard behavior.
- Clean layout files by removing inline views.

**Future**:
- May support advanced filtering toggles, voice search, or inline AI suggestions.

---

## MemoryCard
**Reason**:
The note/memory card was duplicated verbatim in the Library tab (`renderLibrary`) and the Search tab (`renderSearch`). Both had identical layouts for titles, tags, and categories.

**Decision**:
Extracted into `<MemoryCard>` which internally uses the `<Card>`, `<CategoryBadge>`, and `<TagChip>` components.

**Benefits**:
- Reduces over 60 lines of duplicated code.
- Ensures all memory list items look identical regardless of where they are rendered.
- Makes it trivial to add new actions (like swipe-to-delete) in one centralized file.

**Future**:
- Might support compact versions or interactive quick-actions directly on the card.

---

## EmptyState
**Reason**:
Empty state messaging was duplicated across the library, search, and reminders sections, using manual icons, colors, and margins.

**Decision**:
Created `<EmptyState>` to standardize icon sizing and text typography.

**Benefits**:
- Drastically cleans up ternary operators in `HomeScreen`.
- Enforces brand styling for empty data.

**Future**:
- Could include standard "Call to Action" buttons (e.g., "Create your first note!").

---

## ReminderCard
**Reason**:
Reminder layouts were duplicated between the dashboard's "Upcoming Nudges" summary and the dedicated Reminders tab. Both manually hardcoded checkmark logic, strikethrough logic for completed items, and date formatting.

**Decision**:
Extracted into a reusable `<ReminderCard>` component with two variants (`default` and `compact`).

**Benefits**:
- Unifies the logic for checking off reminders.
- Standardizes the appearance of completed reminders across all screens.
- Keeps `HomeScreen.js` clean by removing complex inline ternary operators for `textDecorationLine: 'line-through'`.

**Future**:
- Can be expanded to support "Snooze" actions or priority flag indicators.

---

## ChatBubble
**Reason**:
The AI and user chat bubbles were hardcoded directly in `HomeScreen.js`, mixing complex layout styles for left/right alignment, avatars, and message colors.

**Decision**:
Extracted into a `<ChatBubble>` component that determines its styling internally based on the `item.sender` prop.

**Benefits**:
- Drastically cleans up the `FlatList` render method in `HomeScreen.js`.
- Ensures conversational UI is consistent and easily reusable on a dedicated chat screen if one is ever built.

**Future**:
- Can support timestamps, markdown rendering, or source citations within the bubble.

---

## ChatInput
**Reason**:
The chat input bar was a raw `TextInput` grouped with a `TouchableOpacity`, carrying its own complex inline styles for disabled states.

**Decision**:
Created `<ChatInput>` to wrap the `TextInput`, loading spinner, and disabled logic.

**Benefits**:
- Removes magic spacing and hardcoded rgba backgrounds from `HomeScreen`.
- Encapsulates the `trim()` logic for disabling the send button.

**Future**:
- Could support attachments or voice dictation.

---

## ModalContainer & ModalHeader
**Reason**:
The detail view overlay and the external share modal duplicated heavy inline styling for their absolute positioned backgrounds, glassmorphism containers, and header layout (including the close button).

**Decision**:
Created `<ModalContainer>` to abstract the absolute positioning and translucent overlay, and `<ModalHeader>` to abstract the horizontal header layout and close button.

**Benefits**:
- Removes duplicate absolute positioning logic from `HomeScreen.js`.
- Ensures all future modals adhere to the same border radiuses and overlay opacities defined in the Design System.

**Future**:
- Can be extended with React Native `Modal` primitives or `react-native-modal` if better native accessibility is required.

---

## BottomNavigation
**Reason**:
The `HomeScreen.js` contained a duplicated `tabBar` and `tabItem` layout using inline definitions and raw color strings.

**Decision**:
Created `<BottomNavigation>` to encapsulate the tab logic, icons, label rendering, and `activeTab` styling into a single reusable component.

**Benefits**:
- Decouples the visual rendering of the tab bar from `HomeScreen.js`.
- Facilitates a future migration to `react-navigation` (Phase 1B) where `<BottomNavigation>` can be swapped into a `tabBar` prop.

**Future**:
- Will be integrated into React Navigation's `BottomTabNavigator` during Phase 1B.
