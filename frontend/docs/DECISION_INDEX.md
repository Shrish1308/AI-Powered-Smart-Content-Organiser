# Decision Index

This document organizes and indexes all architectural and component-level decisions made during the development of Smart Recall.

## Architecture Decisions
*For full details on these decisions, see [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md).*

- **ADR 001**: Component-Driven Frontend Architecture
- **[ADR-004: UI Component Standardization](ARCHITECTURE_DECISIONS.md#adr-004-ui-component-standardization)**
  - Replacing inline monolithic styles with an atomic component library and global theme.
- **[ADR-005: Removal of Share Intent Feature](ARCHITECTURE_DECISIONS.md#adr-005-removal-of-share-intent-feature)**
  - Decommissioning the native Share Intent integration to reduce MVP complexity and eliminate dead UI/native code overhead.

## Component Decisions
*For full details on these decisions, see [COMPONENT_DECISIONS.md](./COMPONENT_DECISIONS.md).*

- **SearchInput**: Extracted to encapsulate search bar styling and loading state.
- **MemoryCard**: Extracted to unify the note card layout between the Search and Library tabs.
- **EmptyState**: Extracted to standardize "no data found" messaging across all tabs.
- **ReminderCard**: Extracted to unify reminder nudges and standardize checkbox completion logic.
- **ChatBubble**: Extracted to standardize user and AI message styling.
- **ChatInput**: Extracted to centralize prompt submission layout and keyboard states.

## Future Decisions (Pending)
- State Management: Should we introduce Redux or Zustand, or is React Context sufficient for auth and local state?
- Local Storage Persistence: Should we use SQLite for offline RAG capabilities?
