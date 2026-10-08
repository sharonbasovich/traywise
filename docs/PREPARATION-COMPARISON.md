# Preparation comparison verification

Implemented on isolated branch `feat/compare-preparation-choices` from main `71d5b63`.

The planner compares 1×, 3× and 6× shortage penalties by calling the existing forecast function with the same report, date and pre-known event flag. These buttons and the integer slider update the same plan, graph, live status and export. Only an exact preset value is selected: 4× selects none. The demand forecast and residual band do not change with this preference. Scenario averages are historical-error estimates, not measured waste, financial savings or guaranteed future demand. Fictional sample labels remain visible.

Pending or failed imports, invalid dates and insufficient evidence hide the plan and comparisons and disable export. Failed imports retain the old dataset for inspection; a valid import or sample reset resumes planning. Existing in-flight export snapshots remain atomic.

## Verification

- `npm run check`: 25/25 tests passed on Windows, Node 22, including five new comparison tests. The existing model/property and export-race tests passed.
- `npm run test:browser`: 14/14 tests passed in Chromium, across 1440×1000 desktop and 390px iPhone-sized emulation, plus a 320px comparison check.
- Browser checks cover Enter/Space preset activation, visible keyboard focus, ArrowRight slider movement from 3× to arbitrary 4×, repeated choices, unchanged held-out metrics, actual JSON download parsing, date/event changes, a changed local dataset, fictional CSV roundtrip, invalid/insufficient import recovery, overflow and layout stability.
- Reduced-motion emulation confirms 0s transitions and zero active button animations. Normal emphasis uses 180ms transform/opacity; numbers update synchronously, with no counting animation. The selected label reserves its space.
- Engine `src/model.js` SHA-256: `3c1fffc956c5b167aa27ae86d77c5b04ca3aee3b27150be463a6d30262ef4d9b`. Its committed contents, evaluation protocol and fixtures are unchanged. Windows LF checkout was used for exact byte verification.
- Test server uses `fileURLToPath` and Playwright's environment option to support Windows as well as Unix.

Computed from the current source for September 21, 2026, no event:

| Shortage penalty | Preparation | Scenario-average surplus | Scenario-average shortfall | Forecast | Band |
| --- | --- | --- | --- | --- | --- |
| 1× | 104 | 3.3 | 3.5 | 103.7 | 92–115 |
| 3× | 113 | 9.4 | 0.6 | 103.7 | 92–115 |
| 6× | 114 | 10.2 | 0.4 | 103.7 | 92–115 |

These are regression expectations, not hard-coded UI outputs or new independent model validation.

## Actual browser screenshots

Captured by the passing Playwright suite; source pixels copied without modification. Desktop, mobile and 320px images were visually inspected.

- [Desktop, with keyboard focus](preparation-comparison-desktop.png)
- [Mobile, with keyboard focus](preparation-comparison-mobile.png)
- [320px comparison](preparation-comparison-320px.png)
- [Reduced motion](preparation-comparison-reduced-motion.png)

## Boundaries

Focused Chromium emulation and DOM tests do not establish real-kitchen validity, comprehensive accessibility, Safari behavior or physical-device behavior. Independent review remains required before merge. No roster, submission, Library, video or Devpost changes are included.
