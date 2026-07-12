# Architecture Decision Records (ADRs)

## ADR 001: Component-Driven Frontend Architecture
**Date**: 2026-07-12
**Status**: Accepted

**Context**:
The frontend previously utilized massive monolithic screen components (e.g., a 2,000+ line `HomeScreen.js`) with heavily duplicated inline `StyleSheet` blocks. Modifying a layout required hunting down identical CSS across multiple screens.

**Decision**:
We will implement a strict component-driven architecture using a centralized `src/components/` library and a global `src/theme/index.js` token system.

**Alternatives**:
- Adopting a utility-first CSS framework like NativeWind (Tailwind for React Native).
- Maintaining the monolithic structure.

**Benefits**:
- Drastically reduces file size and complexity of screen components.
- Enforces visual consistency across the app.
- Makes global styling changes (like introducing a Light Mode) achievable by swapping the `theme` object.

**Trade-offs**:
- Requires an initial heavy time investment to refactor existing monoliths.
- Developers must learn the custom component API instead of writing raw React Native primitives.

**Future Considerations**:
- If the component library grows too large, we may need to introduce Storybook for React Native to catalog them visually.
