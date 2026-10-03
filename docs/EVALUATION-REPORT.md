# TrayWise independent evaluation

Initial sealed engine SHA256: `9acabdda0e0a559c882605b67a6de1ff24a3956e841e5668d3298b97d326d620`
First sealed run: 2026-10-03T16:15:20.331Z

Six synthetic worlds were generated and frozen separately before the builder engine was fit. The evaluator independently implemented ridge fitting and scoring in NumPy; the application uses JavaScript. There were zero differences in model selection, point predictions, MAE/RMSE, interval mean width, preparation quantities, or asymmetric loss within 1e-8 numeric tolerance. These are fictional benchmark results, not real kitchen validation or measured resource savings.

| Synthetic case | Model | MAE | Covered/known holdout | Mean loss (1:3) |
|---|---|---:|---:|---:|
| constant | weekdayMedian (selected) | 0.0000 | 18/18 | 0.0000 |
| constant | recentMean | 0.0000 | 18/18 | 0.0000 |
| constant | ridge | 0.0000 | 18/18 | 0.0000 |
| seasonal_event | weekdayMedian | 12.2500 | 17/18 | 8.7222 |
| seasonal_event | recentMean | 9.9841 | 16/18 | 16.4444 |
| seasonal_event | ridge (selected) | 4.4594 | 17/18 | 7.7222 |
| no_signal | weekdayMedian | 23.9722 | 16/18 | 41.7222 |
| no_signal | recentMean (selected) | 27.7222 | 15/18 | 35.8333 |
| no_signal | ridge | 22.6968 | 16/18 | 36.0556 |
| abrupt_shift | weekdayMedian (selected) | 34.4722 | 0/18 | 97.1667 |
| abrupt_shift | recentMean | 34.0000 | 0/18 | 87.0000 |
| abrupt_shift | ridge | 37.3859 | 0/18 | 96.1667 |
| censored_mix | weekdayMedian (selected) | 6.7667 | 14/15 | 13.2667 |
| censored_mix | recentMean | 13.1905 | 14/15 | 18.4000 |
| censored_mix | ridge | 8.0347 | 14/15 | 12.1333 |
| unseen_event | weekdayMedian (selected) | 15.9167 | 12/18 | 44.2222 |
| unseen_event | recentMean | 17.1270 | 11/18 | 41.3333 |
| unseen_event | ridge | 15.8083 | 11/18 | 42.5000 |

## What the failures mean
- The seasonal/event case rewards the learned features, but the model does not universally beat baselines.
- The training-only selector loses on held-out no-signal data. It is not retrospectively swapped to the holdout winner.
- The abrupt-shift case gives 0/18 interval coverage for every model. Historical residuals can completely miss a changed regime.
- Unseen events have weak coverage (11–12/18). Human review and warnings matter.
- Censored-row metrics exclude unknown outcomes. Censoring is often related to high demand, so these metrics need not represent all service days. Latent synthetic gold is never used as if it were an observed operational target.

## Additional adversarial audit
A random-case test found a floating-rank tie bug in preparation optimization after the sealed benchmark: cOver=1, cUnder=.2 and 18 scenarios produced a rank calculation of 3.0000000000000004; ceil selected the next rank. Q=22 had the same loss as Q=17, but violated the promised smallest-Q tie rule. Builder patched the optimizer to evaluate floor/ceil integer candidates for every scenario, plus zero. Post-inspection engine SHA256 `3c1fffc956c5b167aa27ae86d77c5b04ca3aee3b27150be463a6d30262ef4d9b` passes all 5,509 independent adversarial assertions and all 9 builder development tests. All six frozen worlds still match the independent oracle. Original first-run results are retained; this patched rerun is explicitly regression evidence after inspection, not a fresh blind benchmark.

## Provenance
Protocol SHA256: 676f1409f923d29b976a3c393fa8d9b592f28266c0684447e6331e982a1b06da
Fixture SHA256: 609a677b351c61f4aaf1d5efb5178e39e9b1f8be210771fa1c9e60e9e3ebffe5
Independent oracle SHA256: 5c788e5d5c187f93778bb19e678939f08ae50146704a4cc1fae3deab6844690d
All material created after the 2026-10-03 official kickoff; synthetic fixture code contains no prior campaign runtime.
