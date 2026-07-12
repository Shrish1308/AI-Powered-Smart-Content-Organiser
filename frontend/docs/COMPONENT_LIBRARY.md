# Component Library

## `<MemoryCard>`
**Purpose**:
Reusable card for displaying saved memories and semantic search results.

**Props**:
- `item` (Object): The memory object containing content, summary, tags, and category.
- `onPress` (Function): Callback executed when the card is tapped.

**Variants**:
- Default (flat card layout)

**Used In**:
- `HomeScreen.js` (Library tab, Search tab)

**Future Planned Usage**:
- Pinned Memories
- Recent Memories
- Shared Memories list

---

## `<EmptyState>`
**Purpose**:
Reusable empty state indicator for lists and screens that have no content.

**Props**:
- `iconName` (String): Ionicons icon name (default: `'folder-open-outline'`)
- `message` (String): Text message to display
- `style` (Object): Optional overrides

**Variants**:
- N/A

**Used In**:
- `HomeScreen.js` (Library tab, Search tab, Reminders tab)

**Future Planned Usage**:
- Empty Chat states
- Empty notification states

---

## `<TagChip>`
**Purpose**:
Small visual indicator for `#tags`.

**Props**:
- `tag` (String): The tag text to display
- `style` (Object): Optional overrides

**Variants**:
- N/A

**Used In**:
- `<MemoryCard>`
- Detail overlay

**Future Planned Usage**:
- Filter selection chips
- Creation forms

---

## `<CategoryBadge>`
**Purpose**:
Displays the high-level category of a memory (e.g., Study, Work).

**Props**:
- `category` (String): The category text
- `style` (Object): Optional overrides

**Variants**:
- N/A

**Used In**:
- `<MemoryCard>`
- Detail overlay

**Future Planned Usage**:
- Dashboard statistical charts
- Note creation categories

---

## `<ReminderCard>`
**Purpose**:
Reusable card and compact layout for displaying upcoming and completed reminders/nudges.

**Props**:
- `item` (Object): The reminder object containing message, status, and reminder_date.
- `onComplete` (Function): Callback executed when the checkbox is tapped.
- `variant` (String): Layout style, either `'default'` or `'compact'`.

**Variants**:
- `default` (used in the dedicated Reminders tab, includes category badge and styling overlays for completion).
- `compact` (used in dashboard summary panels with stripped-down styling).

**Used In**:
- `HomeScreen.js` (Dashboard tab, Reminders tab)

**Future Planned Usage**:
- Push notification quick-actions
- Push notification logs

---

## `<ChatBubble>`
**Purpose**:
Reusable visual container for rendering conversational RAG messages.

**Props**:
- `item` (Object): The message object containing `sender` ('user' or 'ai') and `message`.

**Variants**:
- User bubble (right-aligned, primary color)
- AI bubble (left-aligned, dark semi-transparent, includes AI avatar)

**Used In**:
- `HomeScreen.js` (Chat tab)

**Future Planned Usage**:
- Collaborative sharing chats
- System broadcast messages

---

## `<ChatInput>`
**Purpose**:
Encapsulated chat prompt input, containing the text field and send button.

**Props**:
- `value` (String): Current input value.
- `onChangeText` (Function): Update handler.
- `onSubmit` (Function): Submit handler.
- `isLoading` (Boolean): Disables the input and shows a spinner if true.
- `disabled` (Boolean): Forces disabled state.

**Variants**:
- N/A

**Used In**:
- `HomeScreen.js` (Chat tab)

**Future Planned Usage**:
- Commenting on shared notes

---

## `<ModalContainer>`
**Purpose**:
Reusable overlay wrapper that standardizes the dark translucent background and bottom-sheet glassmorphism card for dialogs and detail views.

**Props**:
- `children` (Node): The modal content.
- `style` (Object): Optional overrides for the inner card (e.g., height).

**Variants**:
- N/A

**Used In**:
- `HomeScreen.js` (Detail Overlay, Share Modal)

**Future Planned Usage**:
- Settings overlays
- Add Note modal

---

## `<ModalHeader>`
**Purpose**:
Standardized header for modals and overlays, containing a left content area and a right close button.

**Props**:
- `children` (Node): Content for the left side of the header.
- `onClose` (Function): If provided, renders a close (X) button that triggers the callback.

**Variants**:
- N/A

**Used In**:
- `HomeScreen.js` (Detail Overlay, Share Modal)

**Future Planned Usage**:
- Settings overlays
- Add Note modal

---

## `<BottomNavigation>`
**Purpose**:
Reusable tab bar for top-level app navigation, adhering to the standard bottom navigation pattern.

**Props**:
- `activeTab` (String): The currently selected tab ID.
- `onTabPress` (Function): Callback fired when a tab is pressed, returning the tab ID.

**Variants**:
- N/A

**Used In**:
- `HomeScreen.js`

**Future Planned Usage**:
- Cross-screen persistent navigation wrapper (when migrating to React Navigation).
