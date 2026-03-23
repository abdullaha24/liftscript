# TODOS

## Settings
- **Priority:** P3
- **Export Lifting Data to CSV**
  - **Why:** High user trust. Users want to own their data and have an escape hatch.
  - **Pros:** Enhances app reputation for "frictionless" portability.
  - **Cons:** Minor scope addition right now, so pushed post-launch.
  - **Context:** Add a button in Settings -> `/api/export` that strings together `SessionLog` and `RepLog` rows.
  - **Depends on:** The entire journaling loop being finished and stable.

## Navigation
- **Priority:** P2
- **Persistent Bottom Navigation Bar**
  - **Why:** No way to navigate between app sections today — users are trapped in `/journal` with no route to future pages (History, Settings).
  - **Pros:** Unlocks CSV export (above), History view, Settings page; makes the app feel complete.
  - **Cons:** Requires new route files and a shared nav component; moderate scope.
  - **Context:** Add a `<BottomNav>` component in `layout.js` wrapping children, with links to `/journal`, `/history`, `/settings`. The nav should use `usePathname()` to highlight the active route. Start with stubs for History/Settings that show "Coming soon." This is a prerequisite for all future pages.
  - **Effort:** M (~3–4 hrs)
  - **Depends on:** Visual overhaul (this PR) shipping first so nav inherits the design system.

## Completed
