# Three-minute demo plan (draft before capture)

0:00–0:20 — Decision first. “How many lunches should this kitchen prepare tomorrow? Too many means leftovers. Too few means people leave without a meal. TrayWise makes that tradeoff inspectable.” Show actual recommendation workspace, labeled fictional sample.

0:20–0:50 — Data honesty. Load sample CSV and show known-demand and unknown sell-out counts. “Served is not always demand. When every prepared meal sells and requests weren't counted, we only know a lower bound. Those records do not become invented labels.” Show upload validation using a deliberately invalid file, then return to sample.

0:50–1:30 — Genuine local learning. Show trained ridge model and fixed chronological evaluation. “A small regularized model learns calendar and planned-event patterns, entirely on this device. A held-out period compares it with weekday median and recent average. If it loses, you see that too.” Use the actual measured numbers only.

1:30–2:15 — Human decision. Change tomorrow's known event flag; adjust shortage penalty. “This is a choice about the consequences of leftovers and unavailable meals. Increasing the shortage penalty cannot lower the recommended preparation. The uncertainty range describes past errors, not a guarantee.” Show expected surplus and shortage as model estimates, clearly separated from measured outcomes.

2:15–2:45 — Actionable export. Export the preparation record. Show the saved local JSON containing input data, model specification, decision weights, predictions and backtest so someone can reproduce it.

2:45–3:00 — Boundaries. “This is a fictional demonstration, not measured food or carbon savings. It plans one service and one menu category. Local history can miss sudden changes. The operator decides what to cook.”

Capture gate: actual app only, readable 1440×900 workspace plus 390px mobile evidence. Obtain browser screenshots and video through available supported browser tooling; do not fabricate UI or imply browser QA passed before capture. Final public video must be 2–4 minutes and play without login.
