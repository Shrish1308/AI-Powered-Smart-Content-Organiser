# Smart Recall Roadmap

## Phase 1A: Frontend Foundation (Current)
- Establish reusable component library.
- Migrate existing monolithic screens (`LoginScreen`, `RegisterScreen`, `HomeScreen`) to use reusable components without changing behavior.
- Consolidate inline styling into a global `theme` object.
- Generate comprehensive living documentation.

## Phase 1B: Navigation Refactor
- Abstract `App.js` navigation stack into a dedicated `src/navigation/RootNavigator.js`.
- Separate Auth stack from App stack.

## Phase 2: UI Redesign (Future)
- Once the structural foundation is secure, apply premium visual upgrades (animations, layout shifts, icon updates).
## Phase 3: Offline Support
- Integrate local caching (SQLite / MMKV) so users can view and write notes while disconnected.
- Create a sync engine to reconcile offline notes with the FastAPI backend when connection is restored.

## Future Enhancements
- **Team Collaboration**: Shared workspaces and team memory.
- **Share Intent (Native)**: Direct sharing of links and text from external applications into Smart Recall.
  - *Status*: Removed from MVP
  - *Priority*: Low (Possible post-Version-1 enhancement)
