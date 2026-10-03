# TrayWise judging proof matrix

Built for the ForgeHacks AI + Climate prompt released October 3, 2026. Original product source, UI and fictional data created for this entry; no earlier campaign core/fixtures/assets reused. Participant packet page 11: five equal 20% criteria, each scored 1–5 (25 total). Packet permits video or live link, but stricter current Devpost requires a public 2–4-minute video and accessible source. Deliver video + live + source.

| Criterion | Bounded claim | Concrete evidence | Current state |
|---|---|---|---|
| Real-world impact (20%) | Supports a kitchen's choice between surplus and unavailable portions | One service plan, penalty change and interpretable scenario estimates | Implemented; no real kitchen validation or measured savings |
| Technical implementation / AI (20%) | Learns calendar/event weights locally; compares with simple baselines | Ridge coefficients, fixed protocol, independent NumPy oracle across six fictional worlds, CSV/exact-label controls | Verified numerically; engine hash in export/report |
| Innovation (20%) | Combines explicit censored-demand handling with human-controlled loss and visible failure | Unknown stockouts excluded without invented labels; all candidate losses and independent shift failures visible | Implemented and development-tested; no unsupported “first-ever” claim |
| Execution / completeness (20%) | One complete local import → decision → evidence → export loop | 19 model/DOM/export-race tests, 5,509 independent assertions; invalid data/date recovery, atomic export, subpath CI browser suite | Browser suite authored but not yet run; independent UI source review passed; real-browser QA pending |
| Presentation / communication (20%) | A judge can understand the decision and limits within three minutes | Actual app footage, readable screenshots, three-minute narration, README and proof-linked evidence | Script prepared; actual footage/screenshots/public video not yet captured |

## Evidence identifiers
- E1: `src/model.js` SHA256 `3c1fffc956c5b167aa27ae86d77c5b04ca3aee3b27150be463a6d30262ef4d9b`
- E2: `docs/EVALUATION-REPORT.md`, preserving blind-first-run versus post-inspection regression, plus failure worlds
- E3: `test/model.test.js` and `test/ui.test.js`; latest local test receipt must be checked at release
- E4: `e2e/workflow.spec.js`; future real CI artifacts only, no claimed execution yet
- E5: `docs/DEMO-SCRIPT.md`; capture real UI, never a fabricated screenshot
- E6: first original commit `0908f18`, 2026-10-03 16:09:22 UTC

Do not claim actual food saved, carbon reduction, forecast guarantees, user testimonials or production readiness. Imported records are local. Synthetic benchmark results do not establish field performance. Judges test functionality, so screenshot polish cannot substitute for the working workflow.
