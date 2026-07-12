# Contributing to Smart Recall

Thank you for your interest in contributing to Smart Recall!

## Core Principles
1. **Component First**: Never write inline `StyleSheet` logic for visual primitives. If you need a button, card, or input, use the `src/components/` library. If the component doesn't exist, build it as a generic, reusable element first.
2. **Theme Driven**: Never hardcode colors or spacing. Use the `theme` object exported from `src/theme/index.js`.
3. **Living Documentation**: This repository treats documentation as code. If you introduce a new component, update `COMPONENT_LIBRARY.md` and `COMPONENT_DECISIONS.md`. If you change architecture, create an ADR in `ARCHITECTURE_DECISIONS.md`.

## Development Setup
1. Ensure you have Node.js and npm installed.
2. Clone the repository.
3. Run `npm install` in the `frontend/` directory.
4. Ensure the FastAPI backend is running and update `src/constants/api.js` to point to your local IP address.
5. Run `npm run dev` to start Expo.

## Pull Request Process
1. Ensure your code passes all linting rules (if configured).
2. Verify that no UI components were duplicated.
3. Verify that the living documentation (`docs/`) has been updated to reflect your changes.
4. Provide a clear PR description detailing *why* the change was made, not just *what* was changed.
