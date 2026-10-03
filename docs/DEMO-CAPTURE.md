# Actual-demo capture, separate from the application

This optional, manually dispatched workflow records seven **silent raw Chromium videos**. It does not submit a demo, publish a video, change the app, or claim that the resulting footage has been visually reviewed.

## Run and retrieve

1. Review these capture-only files and publish them through the already-authorized repository workflow.
2. On GitHub, open **Actions → Capture TrayWise demo → Run workflow** on the reviewed branch. The workflow has only `workflow_dispatch`; ordinary pushes do not launch a capture. It uses a standard Ubuntu public-repository runner, the existing npm lockfile, and `contents: read`. No new secrets, credentials, paid marketplace service, deployment, or permission grant is used.
3. Download the `traywise-demo-RUN_ID-ATTEMPT` artifact from that exact run. A failed run also retains available raw videos and screenshots. Inspect `run.json`; every scene and media QA must pass before treating the capture as successful.
4. Review every raw video and screenshot. Source assertions and successful decode do not establish framing, legibility, aesthetic quality, or narration alignment.

The script only launches a browser inside this repository's GitHub Actions environment. Local review is browser-free:

```sh
npm ci --ignore-scripts
npm run check
node --check scripts/capture-demo.mjs
node scripts/capture-demo.mjs --verify-only
```

The original HTML, CSS, application, model, CSV, and evaluation report are checked against fixed SHA-256 values. A mismatch stops capture. Do not casually update those hashes to make a failing run green; review the changed source and revalidate the narration first. Node 22 and existing Actions major versions match the repository's established CI; application dependencies remain exactly resolved by the unchanged lockfile (Playwright 1.63.0). FFmpeg is supplied by the runner or the official Ubuntu package repository.

## What is recorded

- Actual, unmodified checked-out app served at `http://127.0.0.1:4173/traywise/` on the Actions runner, at 1920 × 1080. This is **not a recording of the live hosted deployment**. The run stores its checkout commit and the reviewed public baseline commit separately.
- Ordinary navigation, keyboard range changes, date entry, file import, export, and reload. No DOM value/style patches, routing mocks, fake cursor, custom report renderer, or replacement app screenshots.
- Real history rows: 2026-06-04 served 90, complete requests 128; 2026-06-15 served 97, lower-bound target unknown.
- All three evidence candidates, training-only selection, fixed chronological blocks, and ridge coverage 14/21.
- 2026-09-21, event off, leftover weight 1: shortage weights 1/3/6 yield 104/113/114. Assertions also retain warnings, unchanged holdout metrics, and the direction of the displayed surplus/shortfall tradeoff.
- The actual downloaded JSON, preserved byte-for-byte under `downloads/`. Its complete inputs, model specification, evaluation object (including splits/residuals), decision, engine hash, and canonical input hash are compared against the unchanged engine. The video briefly opens this actual file in Chromium's native viewer. That shot is a file viewer, not an in-app JSON feature.
- A clearly named `FICTIONAL-DEMO-111-services.csv` containing the first 111 rows of the published fictional sample. The native app truthfully labels this changed fixture `LOCAL CSV · USER-SUPPLIED COUNTS`; its filename identifies it as fictional. Reload must restore the original fictional source, 112 days, and an empty file input. The changed row count makes the reset observable. No personal CSV is used. Keep a plainly labeled fictional-data editorial caption over this import passage if needed; never replace the app's native label.
- The exact original evaluation report, served as **plain Markdown** in Chromium. It is not a fabricated rendered report or a new evaluation. The verified table contains no-signal selected recentMean MAE 27.7222 versus weekdayMedian 23.9722, and abrupt-shift 0/18 for all models. The original post-inspection regression disclosure is preserved.

## Artifact and editing contract

`videos/01-decision.webm` through `videos/07-next.webm` are independent raw scenes. Navigation and extra neutral holds are intentional. `screenshots/` contains actual viewport captures at named proof points; failures are retained with `FAILED` in their names. `run.json` and individual scene JSON files contain source URLs, claims, screenshots, approximate event timestamps, errors, media hashes, and FFprobe results. FFmpeg fully decodes every available clip and fails the run on media errors. Runtime assertions fail on wrong claims.

`narration-timing.json` is copied unchanged from the measured 175.875-second provisional narration manifest. Its sentence sample boundaries are for generated speech, not forced word alignment. Event timestamps in the footage are approximate wall-clock positions measured from page creation, not exact video frame offsets. Align by actual frames and screenshots, then segment captions for readability. In particular, the audit scene deliberately runs longer than its 19.3-second speech so an editor can retain the genuine download, JSON, import, and reload without speeding through proof.

Before any final release:

- Check every scene's actual images, disclosure visibility, export, and report legibility. If a frame is unreadable or a claim differs, fix the capture instructions or revise the narration; never patch the displayed application values.
- Keep “Synthetic evaluation; no field outcomes.” visible over the report shot. Do not describe the original report as a fresh CI benchmark.
- Keep the final disclosure: “Fictional demonstration. No measured food or carbon savings. AI-assisted build; narration generated locally with Kokoro-82M, stock Heart voice.” This is editorial text for the final video, not injected application UI.
- Listen to the complete narration and final mix. Verify captions against the actual final cuts. Raw capture/decode checks do not replace this review.
- Preserve the failed raw artifact if a run fails. Do not edit a failed state into an apparent successful interaction.
- Keep the completed video within the required 2–4 minutes. No audio is uploaded by this workflow; combine locally only after visual verification.
