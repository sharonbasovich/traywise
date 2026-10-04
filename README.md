# TrayWise
### Enough for lunch. Room for uncertainty.

A local meal-preparation planner built from scratch for **ForgeHacks 2026 · AI + Climate** after the October 3 prompt release. One kitchen, one menu category, one daily service. The operator chooses how heavily to penalize unavailable portions versus leftovers, and sees a concrete preparation quantity with its assumptions.

**This is a prototype with fictional demo data. It does not claim measured food or carbon savings, validated real-world performance, or guaranteed forecast coverage.** No ordering, payments, external AI API, user-data upload, analytics, remote fonts or runtime package CDN.

## Published demo and submission

- [Live app](https://sharonbasovich.github.io/traywise/)
- [Public 2-minute 8-second demo video](https://www.youtube.com/watch?v=_MeyNt9_Swo)
- [ForgeHacks submission](https://devpost.com/software/traywise), verified submitted October 4, 2026 at 01:09 UTC in **AI + Climate**

## Run

Requires Node.js 20+.

```sh
npm install
npm test
npm start
# Open http://localhost:4173
```

The app itself is plain HTML/CSS/JavaScript with no runtime dependencies. Fitting and inference execute in the browser. `server.js` serves local assets with a restrictive Content Security Policy (`connect-src 'none'`). Imported files stay in tab memory. Exported records are downloaded locally. Reload discards imports and restores the fictional sample.

## One useful loop

1. Inspect the clearly labeled fictional history or import your own CSV.
2. Review known-demand versus lower-bound counts.
3. Pick the next service date and a genuinely pre-known event flag.
4. Choose a shortage-penalty preference (leftover penalty is 1). The planner minimizes loss across historical-error scenarios. Increasing shortage penalty cannot lower preparation for fixed scenarios.
5. Inspect all three candidates on the fixed chronological holdout, including failures.
6. Export JSON containing input rows, canonical CSV SHA-256, model specification, fitted coefficients/scaling, selection origins, split dates, residuals, per-day held-out results, and the chosen decision.

## CSV contract

Required columns: `date,prepared,served,leftovers,observation_status`.
Optional: `requested_count,event`. Download the sample CSV from the app.

- Date is a unique real `YYYY-MM-DD` date. Rows are sorted chronologically; missing dates are never filled with zero demand.
- Counts are whole numbers from 0 through 100,000. `served <= prepared`; `leftovers = prepared - served`.
- `complete_requests`: `requested_count` is required and at least `served`. It confirms all recorded requests across the full service, including unserved requests. This is the exact target, even when it exceeds preparation. It does not measure latent appetite, deterred customers or absent people.
- `complete_service`: `requested_count` must be absent, `served < prepared`, and the operator explicitly assures full service observation with no availability constraint. Target is served.
- `lower_bound`: requested count absent, target unknown, lower bound served. Includes uncertain/partial service and sold-out days without complete request counts. These rows remain visible and are excluded from fit and exact error metrics.
- `event` is 0 or 1 and must be known before service. An absent column defaults to 0, meaning no event information, not proven absence.
- Up to 2,000 rows and 1 MB. Donations, spoilage, staff meals and other flows need a richer future accounting model.

## Genuine learning, with frozen evaluation

Protocol v1 is fixed before independent hidden evaluation. Rows split chronologically **60% train / 20% calibration / remainder holdout**, before excluding unknown targets. Minimum exact labels: **28 / 10 / 10**. Underpowered imports show an insufficient-evidence state rather than a preparation recommendation.

Candidates:
- Ridge regression with λ = 5, unpenalized intercept, Tuesday–Sunday indicators (Monday reference), numeric calendar-day trend standardized using all training rows, and pre-known event flag. Coefficients are learned locally by solving regularized least squares.
- Same-weekday median, falling back to overall median with fewer than two weekday observations.
- Mean of the last seven known training labels.

Expanding-window predictions on the final up-to-14 known training rows select by MAE using only strictly earlier rows. Ties favor weekday median, then recent mean, then ridge. All three candidates are then fit on the train block only and stay frozen. No holdout-based winner replacement or parameter tuning.

Each candidate gets its own signed calibration residual bank. The nominal 80% absolute-residual band uses rank `ceil((m+1)*0.8)` and rounds integer endpoints outward. Reported coverage is observed coverage on known-label holdout, not a future guarantee; time dependence, shifts and censoring can invalidate simple interpretations.

Preparation scenarios are `max(0, forecast + signed calibration residual)`. The chosen nonnegative integer minimizes average `cOver * surplus + cUnder * shortfall`; equal losses choose the lowest integer. These scenarios are historical-error scenarios, not a calibrated probability law. No financial or emissions units are implied. The UI warns on trend extrapolation, unseen flags, low held-out coverage, and selected-model losses.

## Independent evidence and limitations

A separate evaluator froze synthetic fixtures and a NumPy oracle before seeing implementation outputs. The original frozen engine matched the oracle across six worlds. This includes adverse findings: abrupt-shift coverage was 0/18 for every model, and the train-selected recent mean lost to weekday median in a no-signal world. These failures are part of the evidence, not removed or retuned away.

An independent adversarial audit then found a floating-point quantile/tie edge case. The optimizer was corrected to inspect integer neighbors of every scenario plus zero. Follow-on runs are explicitly **post-inspection regression**, not fresh untouched validation. The complete preserved evaluator report is in `docs/EVALUATION-REPORT.md` and linked in the evidence view.

Verified application revision: 20 development tests passed (9 model/property tests, 8 DOM/security/presentation tests and 3 independent export-race regression tests), plus 5,509 independent adversarial assertions and independent NumPy reproduction across six worlds. DOM tests cover keyboard tabs, invalid-date recovery, unchanged metrics during penalty adjustment, malicious filename handling, failed imports, and sample provenance after CSV roundtrip. The same application revision also passed 4 real Chromium browser tests across desktop and mobile viewports; actual screenshots were captured and visually inspected. This is focused workflow and responsive-layout coverage, not a comprehensive accessibility audit or real-device/Safari validation. The public demo video is recorded and linked above.

## Repository map

- `src/model.js`: pure deterministic validation, labels, fits, selection, evaluation and optimizer
- `src/data.js`: strict CSV adapter and original seeded fictional sample
- `src/app.js`: local-only UI, safe DOM rendering, reproducible export
- `src/style.css`, `index.html`: responsive, keyboard-navigable workspace
- `test/`: development and property tests
- `docs/PROOF-MATRIX.md`, `docs/DEMO-SCRIPT.md`: original claim-to-evidence plan and three-minute planning script; the published 2-minute 8-second production is linked above

## Submission boundaries

Selected track: **AI + Climate**. AI-assisted coding is disclosed; application core, UI and demonstration data were created for this entry after prompt release. No previous campaign core code, fixture or visual asset is reused. Submitted as a solo entry by Sharon Basovich. The source, [live app](https://sharonbasovich.github.io/traywise/), and [public demo video](https://www.youtube.com/watch?v=_MeyNt9_Swo) are published. [Devpost](https://devpost.com/software/traywise) confirmed the ForgeHacks submission on October 4, 2026 at 01:09 UTC. AI-generated narration was used in the video.

## Browser verification and hosting

All links and assets are relative, including modules and evaluation-report link, for a GitHub Pages project path such as `/traywise/`. A CSP meta tag preserves the no-network policy on static hosting; the local server also sends CSP and nosniff headers. The plot uses inline style properties only; scripts remain same-origin-only, with no inline script allowance.

The authored CI suite runs Chromium desktop (1440px) and mobile (iPhone-sized viewport) against the served `/traywise/` path. It checks real file import/download, keyboard tabs, no unexpected network requests, no runtime page errors, invalid/underpowered state recovery, overflow and actual screenshots. The [application verification run](https://github.com/sharonbasovich/traywise/actions/runs/37145335839) passed all 20 development tests and 4 browser tests on published commit `33c89a81d57e7f88d16b59f4aa01e959506ffc67`. The run logs explicitly record both totals. [Pages deployment](https://github.com/sharonbasovich/traywise/actions/runs/37145335023) succeeded for the same commit. These receipts establish that application revision; later capture-tooling and documentation updates do not constitute new model validation. The numerical engine remains frozen at SHA-256 `3c1fffc956c5b167aa27ae86d77c5b04ca3aee3b27150be463a6d30262ef4d9b`.

```sh
npx playwright install --with-deps chromium
npm run test:browser
```

These commands reproduce the browser checks. `.github/workflows/verify.yml` preserves browser reports and actual screenshots as CI artifacts.

The deployed preview was also smoke-tested for planning tradeoffs, evidence/data tabs, keyboard navigation, invalid-date guarding and recovery. Its export action reported a download, but the cloud browser capture timed out; the deployed JSON payload was not inspected. The CI export test independently parsed and checked the downloaded JSON. A presentation-only ordinal regression covers `91st` and the `11th`–`13th` exceptions without changing the numerical engine.
