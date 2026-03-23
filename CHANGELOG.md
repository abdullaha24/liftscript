# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0.0] - 2026-03-23

### Added
- SVG circular rest timer on the Journal screen with dynamic color transitions (Green -> Orange -> Red).
- High-fidelity visual states for completed, warning, and missed sets during workout logging.
- Subdued CSS bounce animation triggers when sets are completed interactively.
- Cosmetic PR Modal Overlay notification that smoothly presents new records without blocking data commits.
- robust `db.js` wrapper with atomic save endpoints and automated local DB backup generation logic.
- Robust, math-driven progression engine in `progression.js` with comprehensive Vitest coverage.

### Changed
- Shifted architecture to a CSS-class-first paradigm, drastically expanding `globals.css` with a comprehensive neo-retro dark mode design system (primary neon lime `#CCFF00`, accent pink `#FF007F`).
- Global typography updated to use non-blocking Google Fonts: `Archivo Black` for headers and `DM Sans` for readable body text.
- Re-architected Auth Form into a centered card layout with neon glowing borders.
- Program Setup flow restructured: Segmented visual progress bar added intrinsically to the wizard shell.
- Split Selector templates restyled into interactable stacked cards with distinct hover scales.
- Day Builder exercises mapped onto compact number inputs bounded by pink left-sidebar card highlights.
- Journal screen shifted to a sticky header displaying the program progress pill and a fixed-bottom "Finish Workout" action bar.
- Refactored `JournalRunner` logic and cleaned up a hidden `O(N*M)` nested view lookup performance snag.
