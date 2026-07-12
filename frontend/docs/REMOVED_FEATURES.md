# Removed Features

This document tracks features that were intentionally removed from the Smart Recall project, along with the reasoning and status.

## Share Intent

**Status:** Removed
**Version:** Current Version
**Reason:** 
Reduce maintenance burden. The feature was partially implemented but lacked native configuration, creating unreachable UI and dead code. It introduced unnecessary native dependency overhead for the MVP.

**Files Removed:**
- None (No files were exclusively dedicated to this feature; logic was embedded).

**Files Modified:**
- `src/screens/HomeScreen.js` (Removed `useShareIntent` hooks, states, `handleSaveSharedContent`, `handleCancelShare`, `renderShareModal`, and related JSX).

**Dependencies Removed:**
- None (The `expo-share-intent` dependency was already missing from `package.json`, causing the feature to silently fail).

**Replacement:**
- Manual URL entry
- Manual text entry

**Can Be Reintroduced:** Yes
**Priority:** Low

**Notes:**
The backend already supports manual content ingestion using the existing `POST /api/notes` endpoint. Users can copy/paste links and text manually.
