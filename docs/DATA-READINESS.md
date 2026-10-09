# Data readiness verification

Base: main `8eeeacdf0c345e86896e66b9587ce31470784019`. Branch: `feat/data-readiness`.

Before changing the UI, the actual local app was exercised in Chromium with these synthetic fixture recipes, starting January 1, 2026. Every service has prepared 110, served 100 and leftovers 10. These are UI regression fixtures, separate from the preserved independent evaluation worlds.

| Fixture | Observed known labels: train / calibration / holdout | Status | Current deficits |
| --- | --- | --- | --- |
| 48 complete-service rows | 28 / 9 / 11 | Insufficient | 0 / 1 / 0 |
| 50 complete-service rows | 30 / 10 / 10 | Ready | 0 / 0 / 0 |
| 60 rows, calibration rows 36–47 marked lower-bound | 36 / 0 / 12 | Insufficient | 0 / 10 / 0 |

The frozen engine sorts all service rows chronologically, allocates the first floor(60% of row count) to training, the next floor(20%) to calibration and the remainder to holdout, then counts known labels inside each block. Unknown-demand rows are not removed before splitting.

The new panel reads `eligibleCounts`, `splitDates` and `MODEL_SPEC.minLabels` from the existing evaluation. It shows the current block dates, known/required labels, per-block deficits and unknown-demand counts. Empty blocks say “No service rows.” The guidance tells operators to preserve lower bounds rather than invent or relabel demand, and explains why deficits do not translate into a fixed number of rows to add. A keyboard-accessible inspection button selects the Data tab and moves focus to it. Load status announces the short blocks.

Pending or invalid imports hide and clear old readiness cards; insufficient data hides the plan/comparisons and disables export. Valid data and sample reset restore the existing planner. No model, adapter, thresholds, selection, optimizer or evaluation changes are made. The existing generation guard continues to discard obsolete import completions.

## Checks

- `npm run check`: **31/31 passed** on Windows, Node 22.14.0; six new readiness tests plus all existing model, UI, comparison and atomic-export regressions.
- `npm run test:browser`: **22/22 passed** in Chromium; four new readiness workflows on both desktop and mobile projects, including 320/390px checks.
- Recovery: insufficient → valid → invalid → sample reset, plus invalid dates and one-row imports.
- Races: delayed success/failure after reset, older imports finishing after newer valid or insufficient imports; stale plans, errors, counts and exports remain unavailable or unchanged as appropriate.
- Keyboard: Enter/Space inspection, focus on the selected Data tab, Home back to Plan, visible focus and at least a 44px inspection target.
- Mobile: no horizontal page overflow at 320/390px; reduced-motion inspection shows zero animations. The panel introduces no motion.
- Export: the browser downloads and parses JSON from the 50-row fixture with its actual 30/10/10 evaluation and an arbitrary 4× preference.

## Frozen files

All files below are unchanged from the base revision. Local SHA-256 receipts:

| File | SHA-256 |
| --- | --- |
| src/model.js | 3c1fffc956c5b167aa27ae86d77c5b04ca3aee3b27150be463a6d30262ef4d9b |
| src/data.js | ee42b50228d32abe8ef1446e0553feeca368320ca569b8e349fff2e4de876897 |
| docs/EVALUATION-REPORT.md | 0cae9ec986493fc4d2befe9ffe33f2075c152c0e5c170456a73098ac05a23fa3 |
| data/fictional-kitchen.csv | c99c90802e13e7465348d3fb9e789d9f7113d29930fb08eb398b3d5ddc28703c |

## Actual browser screenshots

Copied from the local Chromium reproduction and passing Playwright suite without pixel modification; desktop, mobile and 320px views were visually inspected.

- [Before: generic unavailable-plan message, 48-row fixture](readiness-before-48.png)
- [After: 48-row deficit, desktop](readiness-48-desktop.png)
- [After: 48-row deficit, mobile](readiness-48-mobile.png)
- [After: unknown calibration block, desktop](readiness-60-desktop.png)
- [After: 320px, reduced motion and keyboard focus](readiness-320-reduced-motion.png)

These checks establish focused Chromium/DOM behavior, not real-kitchen validity, a comprehensive accessibility audit, physical-device/Safari coverage or new independent model validation. Meeting minimum counts does not establish forecast accuracy. Independent review is required before merge. No submission, roster, video or Devpost edits are included.
