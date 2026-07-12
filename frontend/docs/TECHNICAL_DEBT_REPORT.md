# Technical Debt Report

This document outlines the remaining technical debt in the SmartRecall frontend following the Phase 1A component migration. It is categorized by priority to guide future development phases.

---

## High Priority

### 1. Monolithic HomeScreen Architecture
**Problem**: Even with UI components extracted, `HomeScreen.js` remains a monolithic composition root (over 1000 lines). It conditionally renders all tabs (Dashboard, Search, Chat, Library) based on internal state (`activeTab`) rather than using a proper router.
**Impact**: High. It creates complex state dependencies, makes deep linking impossible, and degrades performance since all tabs mount within the same React context.
**Recommendation**: Implement `react-navigation` (Phase 1B). Replace the conditional rendering with a `BottomTabNavigator`.
**Priority**: High (Blocker for Phase 1B).

### 2. Lack of Global State Management (Prop Drilling)
**Problem**: State such as `notes`, `reminders`, `chatHistory`, and `searchQuery` are all hoisted to the top of `HomeScreen.js` and drilled down into render functions.
**Impact**: High. As tabs are split into distinct screens via React Navigation, passing this state via route params will be unscalable and anti-pattern.
**Recommendation**: While the user requested *no* new state libraries (e.g., Redux) unless justified, the migration to React Navigation *will* justify extracting `NotesContext` and `ChatContext` using standard React Context.
**Priority**: High (Required during Phase 1B).

---

## Medium Priority

### 3. Missing Frontend Unit and Integration Tests
**Problem**: There is no test suite (Jest/React Native Testing Library) to verify the behavior of the newly extracted Component Library or the API hooks.
**Impact**: Medium. Refactoring routing or business logic in the future relies entirely on manual verification, increasing the risk of regressions.
**Recommendation**: Introduce Jest and write snapshot tests for core UI components (`<Button>`, `<Card>`) and integration tests for `<AuthContext>`.
**Priority**: Medium.

### 4. Hardcoded Layout in Reusable Components
**Problem**: Some extracted components (like `<ChatInput>` or `<SearchInput>`) assume they are placed inside a specific flex container, relying on specific margins (`marginBottom: 16`) rather than letting the parent dictate positioning.
**Impact**: Medium. It slightly reduces reusability if these components are placed in different contexts (like a Modal).
**Recommendation**: Expose `style` or `containerStyle` props uniformly across all components and remove external-facing margins from their internal `StyleSheet` definitions.
**Priority**: Medium.

---

## Low Priority

### 5. Incomplete TypeScript Adoption
**Problem**: The frontend is written in vanilla JavaScript (JSX), relying heavily on implicit prop passing.
**Impact**: Low/Medium. It makes discovering component props difficult without reading the source file or `COMPONENT_LIBRARY.md`.
**Recommendation**: Incrementally migrate files to TypeScript (`.tsx`), starting with the `src/components` directory to define explicit interfaces for props.
**Priority**: Low.

### 6. Leftover Native UI Elements
**Problem**: `HomeScreen.js` still contains a few raw `<TouchableOpacity>` and `<TextInput>` tags that were not migrated because doing so might have altered precise layouts without a redesign.
**Impact**: Low. They function correctly and use the Theme, but bypass the reusable component wrappers.
**Recommendation**: Swap these out during the Phase 1B UI Redesign when minor layout shifts are acceptable.
**Priority**: Low.
