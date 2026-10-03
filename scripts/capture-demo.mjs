// Capture-only tooling. Never modifies the application, its DOM, or its results.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {chromium, expect} from '@playwright/test';
import {fictionalSample, parseCSV, toCSV} from '../src/data.js';
import {evaluate, forecast, MODEL_SPEC, PROTOCOL_VERSION} from '../src/model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);
const OUT = path.join(ROOT, 'demo-capture');
const BASE = 'http://127.0.0.1:4173/traywise/';
const VIEWPORT = {width: 1920, height: 1080};
const BASELINE_COMMIT = '33c89a81d57e7f88d16b59f4aa01e959506ffc67';
const TIMING = JSON.parse(await fs.readFile('scripts/demo-narration-timing.json', 'utf8'));
const HASHES = {
  'index.html': 'c42e2171eab5a9770f4852e12eac88573457080cb0485dbcdc828dc4fa4b8ee7',
  'src/app.js': 'b224ddcb670653a1f48c906f556eed14bb4bb0fcb2234b2ad6d6f5873bdf2bfd',
  'src/data.js': '36dcbf785c29a1245b38095f6e3c00090d3af228ada236c63694c83219e90fe5',
  'src/model.js': '3c1fffc956c5b167aa27ae86d77c5b04ca3aee3b27150be463a6d30262ef4d9b',
  'src/style.css': '3911de7038e20eccf0e8561b5c4a5f714bf24ed346b9b16b785238d1f8e4727a',
  'data/fictional-kitchen.csv': '33503ebd8f4362a1fc0eeb149060116626da60178e14389f0283d9b86c33126e',
  'docs/EVALUATION-REPORT.md': '505095a89ee1c735655049118ee95680bdf3df3c82178b917097521062aaee19',
};
const digest = value => createHash('sha256').update(value).digest('hex');
const writeJSON = (name, value) => fs.writeFile(path.join(OUT, name), JSON.stringify(value, null, 2) + '\n');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const sample = fictionalSample();
const report = evaluate(sample);
const originalReport = await fs.readFile('docs/EVALUATION-REPORT.md', 'utf8');
const expectedPlans = [1, 3, 6].map(c => forecast(report, '2026-09-21', 0, c));

function checkReport(text) {
  assert.match(text, /fictional benchmark results, not real kitchen validation or measured resource savings/);
  assert.match(text, /\| no_signal \| weekdayMedian \| 23\.9722 \|/);
  assert.match(text, /\| no_signal \| recentMean \(selected\) \| 27\.7222 \|/);
  for (const model of ['weekdayMedian (selected)', 'recentMean', 'ridge']) {
    const line = text.split('\n').find(line => line.startsWith(`| abrupt_shift | ${model} |`));
    assert.ok(line?.includes('| 0/18 |'), `${model} must disclose 0/18 coverage`);
  }
  assert.match(text, /regression evidence after inspection, not a fresh blind benchmark/);
}

function checkExport(record) {
  assert.equal(record.product, 'TrayWise');
  assert.equal(record.formatVersion, 1);
  assert.equal(record.isFictionalDemo, true);
  assert.equal(record.source, 'Fictional campus kitchen');
  assert.equal(record.protocolVersion, PROTOCOL_VERSION);
  assert.equal(record.engineSHA256, HASHES['src/model.js']);
  assert.deepEqual(record.inputs, sample);
  assert.equal(record.dataSHA256, digest(toCSV(record.inputs)));
  assert.deepEqual(record.modelSpec, MODEL_SPEC);
  assert.deepEqual(record.evaluation, report);
  assert.deepEqual(record.decision, {cOver: 1, cUnder: 6, ...expectedPlans[2]});
  assert.ok(record.limitations.includes('No measured food, carbon or financial savings.'));
}

// This branch exercises no browser and is safe for local syntax/pure-logic review.
async function verifyInputs() {
  for (const [file, expected] of Object.entries(HASHES)) {
    assert.equal(digest(await fs.readFile(file)), expected, `${file} differs from the reviewed capture source`);
  }
  const lock = JSON.parse(await fs.readFile('package-lock.json', 'utf8'));
  assert.equal(lock.packages['node_modules/@playwright/test'].version, '1.63.0');
  assert.deepEqual(parseCSV(await fs.readFile('data/fictional-kitchen.csv', 'utf8')), sample);
  assert.deepEqual(expectedPlans.map(p => p.quantity), [104, 113, 114]);
  assert.equal(report.selectedModel, 'ridge');
  assert.deepEqual(report.models.ridge.coverage, {covered: 14, eligible: 21});
  assert.equal(sample.find(r => r.date === '2026-06-04').served, 90);
  assert.equal(sample.find(r => r.date === '2026-06-04').target, 128);
  assert.equal(sample.find(r => r.date === '2026-06-04').observation_status, 'complete_requests');
  assert.equal(sample.find(r => r.date === '2026-06-15').served, 97);
  assert.equal(sample.find(r => r.date === '2026-06-15').target, null);
  assert.equal(sample.find(r => r.date === '2026-06-15').observation_status, 'lower_bound');
  assert.equal(TIMING.durationSeconds, 175.875);
  assert.deepEqual(TIMING.scenes.map(s => s.id), ['01-decision', '02-observations', '03-learning', '04-choice', '05-audit', '06-failures', '07-next']);
  for (const s of TIMING.scenes) assert.ok(s.endSeconds > s.startSeconds);
  checkReport(originalReport);
  const fixture = {
    product: 'TrayWise', formatVersion: 1, isFictionalDemo: true,
    source: 'Fictional campus kitchen', protocolVersion: PROTOCOL_VERSION,
    engineSHA256: HASHES['src/model.js'], modelSpec: MODEL_SPEC, inputs: sample,
    dataSHA256: digest(toCSV(sample)), evaluation: report,
    decision: {cOver: 1, cUnder: 6, ...expectedPlans[2]},
    limitations: ['No measured food, carbon or financial savings.'],
  };
  checkExport(fixture);
  assert.throws(() => checkExport({...fixture, decision: {...fixture.decision, quantity: 115}}));
  assert.throws(() => checkExport({...fixture, dataSHA256: '0'.repeat(64)}));
  assert.throws(() => checkReport(originalReport.replaceAll('| 0/18 |', '| 18/18 |')));
  console.log('PASS: source hashes, seven narration scenes, expected quantities/data/coverage/report and export validator (including rejection cases). No browser was launched.');
}

await verifyInputs();
if (process.argv.includes('--verify-only')) process.exit(0);
assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Actual capture is restricted to the authorized GitHub Actions runner. Use --verify-only locally.');
assert.equal(process.env.GITHUB_REPOSITORY, 'sharonbasovich/traywise');
assert.match(process.env.GITHUB_SHA || '', /^[0-9a-f]{40}$/);
await fs.mkdir(path.join(OUT, 'videos'), {recursive: true});
await fs.mkdir(path.join(OUT, 'screenshots'), {recursive: true});
await fs.mkdir(path.join(OUT, 'downloads'), {recursive: true});
await fs.copyFile('scripts/demo-narration-timing.json', path.join(OUT, 'narration-timing.json'));
await fs.copyFile('docs/EVALUATION-REPORT.md', path.join(OUT, 'EVALUATION-REPORT.md'));
const importName = 'FICTIONAL-DEMO-111-services.csv';
const importPath = path.join(OUT, importName);
await fs.writeFile(importPath, toCSV(sample.slice(0, -1)));
const run = {
  status: 'in progress', startedAt: new Date().toISOString(),
  capturedCheckout: process.env.GITHUB_SHA, reviewedBaselineCommit: BASELINE_COMMIT,
  runURL: `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  runAttempt: process.env.GITHUB_RUN_ATTEMPT, appURL: BASE,
  publicPreview: 'https://sharonbasovich.github.io/traywise/',
  reportPublicSource: `https://github.com/sharonbasovich/traywise/blob/${BASELINE_COMMIT}/docs/EVALUATION-REPORT.md`,
  provenance: 'Actual Chromium video of the unchanged checked-out app served on the Actions runner. Not a live-hosted-site capture. The report is its original plain Markdown; JSON is the actual downloaded file. No DOM patches, fake cursor, synthetic application screens, or audio are added.',
  viewport: VIEWPORT, sourceSHA256: HASHES, narrationDurationSeconds: TIMING.durationSeconds,
  timestampNote: 'Scene event times are elapsed wall-clock seconds from newPage creation, not frame-accurate media timestamps. Use screenshots and actual video frames when editing. Navigation and all recorded failures are retained.',
  scenes: [],
};
await writeJSON('run.json', run);
let browser;

async function frameWorkspace(page) {
  const box = await page.locator('.workspace').boundingBox();
  await page.mouse.move(1750, 500);
  await page.mouse.wheel(0, box.y - 18);
  await page.waitForTimeout(400);
  await expect(page.locator('#source-label')).toBeInViewport({ratio: 1});
}

async function app(page, penalty = 3) {
  const response = await page.goto(BASE, {waitUntil: 'networkidle'});
  assert.equal(response.status(), 200);
  await expect(page.locator('#source-label')).toHaveText('DEMO DATA · NOT REAL OUTCOMES');
  await page.locator('#date').fill('2026-09-21');
  await page.locator('#date').press('Tab');
  await page.locator('#event').uncheck();
  await setPenalty(page, penalty);
  await expect(page.locator('#date')).toHaveValue('2026-09-21');
  await expect(page.locator('#event')).not.toBeChecked();
  await expect(page.locator('#error')).toBeHidden();
  await frameWorkspace(page);
  await expect(page.locator('#quantity')).toBeInViewport({ratio: 1});
}

async function setPenalty(page, value) {
  const slider = page.locator('#penalty');
  await slider.focus();
  await slider.press('Home');
  for (let i = 1; i < value; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(value));
  await expect(page.locator('#quantity')).toHaveText(String(expectedPlans[[1, 3, 6].indexOf(value)].quantity));
}

async function recordScene(timing, action) {
  const scene = {id: timing.id, title: timing.title, narration: timing, status: 'in progress', events: [], pageErrors: [], failedRequests: []};
  run.scenes.push(scene);
  await writeJSON('run.json', run);
  let context, page, video;
  let zero = performance.now();
  const mark = async (name, claims = {}) => {
    const seconds = (performance.now() - zero) / 1000;
    const screenshot = `screenshots/${timing.id}-${String(scene.events.length + 1).padStart(2, '0')}-${name}.png`;
    await page.screenshot({path: path.join(OUT, screenshot)});
    scene.events.push({name, capturedAt: new Date().toISOString(), approximateRawSeconds: seconds, url: page.url(), screenshot, claims});
    await writeJSON('run.json', run);
    console.log(`${timing.id} ${seconds.toFixed(2)}s: ${name}`);
  };
  try {
    context = await browser.newContext({viewport: VIEWPORT, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'UTC', colorScheme: 'light', acceptDownloads: true, recordVideo: {dir: path.join(OUT, 'videos'), size: VIEWPORT}});
    zero = performance.now();
    page = await context.newPage();
    video = page.video();
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => scene.pageErrors.push(error.message));
    page.on('requestfailed', request => scene.failedRequests.push({url: request.url(), error: request.failure()?.errorText}));
    await action(page, mark, scene);
    assert.deepEqual(scene.pageErrors, [], 'Unexpected page errors');
    assert.deepEqual(scene.failedRequests, [], 'Unexpected failed requests');
    scene.status = 'passed';
  } catch (error) {
    scene.status = 'failed';
    scene.error = error.stack || String(error);
    if (page) try { await mark('FAILED', {error: scene.error}); await page.waitForTimeout(2000); } catch {}
    console.error(scene.error);
  } finally {
    scene.wallDurationSeconds = (performance.now() - zero) / 1000;
    try {
      if (context) await context.close();
      if (video) {
        const raw = await video.path();
        scene.video = `videos/${timing.id}.webm`;
        await fs.rename(raw, path.join(OUT, scene.video));
      }
    } catch (error) {
      scene.status = 'failed';
      scene.finalizationError = error.stack || String(error);
    }
    await writeJSON(`${timing.id}.json`, scene);
    await writeJSON('run.json', run);
  }
}

const actions = [
  async (page, mark) => {
    await app(page);
    await expect(page.locator('#forecast-warnings')).toBeInViewport({ratio: 1});
    await expect(page.locator('#forecast-warnings')).toContainText('No actual food or carbon savings have been measured');
    await mark('actual-plan', {quantity: 113, date: '2026-09-21', event: 0, fictional: true});
    await page.waitForTimeout(16000);
    await page.mouse.wheel(0, -2000);
    await page.waitForTimeout(500);
    await mark('actual-brand-and-tagline');
    await page.waitForTimeout(5000);
  },
  async (page, mark) => {
    await app(page);
    await page.locator('#tab-data').click();
    const exact = page.locator('#data-rows tr').filter({hasText: '2026-06-04'});
    await expect(exact.locator('td')).toHaveText(['2026-06-04', '90', '90', '0', 'complete requests', '128']);
    await exact.scrollIntoViewIfNeeded();
    await expect(exact).toBeInViewport({ratio: 1});
    await expect(page.locator('#source-label')).toBeInViewport({ratio: 1});
    await mark('complete-requests', {date: '2026-06-04', served: 90, target: 128, status: 'complete_requests'});
    await page.waitForTimeout(10000);
    const lower = page.locator('#data-rows tr').filter({hasText: '2026-06-15'});
    await expect(lower.locator('td')).toHaveText(['2026-06-15', '97', '97', '0', 'lower bound', 'Unknown; ≥97']);
    await lower.scrollIntoViewIfNeeded();
    await expect(lower).toBeInViewport({ratio: 1});
    await expect(page.locator('#source-label')).toBeInViewport({ratio: 1});
    await mark('lower-bound', {date: '2026-06-15', served: 97, target: null, lowerBound: 97});
    await page.waitForTimeout(19000);
  },
  async (page, mark) => {
    await app(page);
    await page.locator('#tab-evidence').click();
    await expect(page.locator('#metrics tr')).toHaveCount(3);
    await expect(page.locator('#metrics')).toContainText('Learned ridge model · selected');
    await expect(page.locator('#metrics')).toContainText('Same-weekday median');
    await expect(page.locator('#metrics')).toContainText('Recent-seven average');
    await expect(page.locator('#metrics .selected-row')).toContainText('14/21 (67%)');
    await expect(page.locator('#split-note')).toHaveText('Known labels: 63 train / 19 calibration / 21 holdout. Split dates are fixed before excluding unknown-demand rows.');
    await expect(page.locator('#panel-evidence .body-copy')).toContainText('Selection happens only inside training data');
    await expect(page.locator('#evidence-warning')).toBeInViewport({ratio: 1});
    await mark('three-models-and-fixed-holdout', {selected: 'ridge', coverage: '14/21', metrics: await page.locator('#metrics').innerText(), split: await page.locator('#split-note').innerText()});
    await page.waitForTimeout(7000);
    const details = page.getByText('Reproduce the learning and selection', {exact: true});
    await details.click();
    await details.scrollIntoViewIfNeeded();
    await mark('original-learning-details');
    await page.waitForTimeout(6000);
    await details.click();
    await frameWorkspace(page);
    await expect(page.locator('#metrics .selected-row')).toBeInViewport({ratio: 1});
    await mark('coverage-remains-fourteen-of-twenty-one', {coverage: '14/21'});
    await page.waitForTimeout(18000);
  },
  async (page, mark) => {
    await app(page, 1);
    const metrics = await page.locator('#metrics').textContent();
    let last = null;
    for (const [penalty, hold] of [[1, 7500], [3, 3500], [6, 19000]]) {
      await setPenalty(page, penalty);
      const shown = {penalty, quantity: Number(await page.locator('#quantity').innerText()), surplus: Number(await page.locator('#surplus').innerText()), shortfall: Number(await page.locator('#shortfall').innerText())};
      if (last) { assert.ok(shown.surplus >= last.surplus); assert.ok(shown.shortfall <= last.shortfall); }
      assert.equal(await page.locator('#metrics').textContent(), metrics);
      await expect(page.locator('#forecast-warnings')).toBeInViewport({ratio: 1});
      await expect(page.locator('#source-label')).toBeInViewport({ratio: 1});
      await expect(page.locator('#forecast-warnings')).toContainText('trend extrapolation may fail');
      await expect(page.locator('#forecast-warnings')).toContainText('14/21');
      await mark(`shortage-${penalty}`, {date: '2026-09-21', event: 0, leftoverWeight: 1, ...shown, warning: await page.locator('#forecast-warnings').innerText()});
      await page.waitForTimeout(hold);
      last = shown;
    }
  },
  async (page, mark, scene) => {
    await app(page, 6);
    await mark('before-real-download', {quantity: 114});
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#export').click(),
    ]);
    assert.equal(await download.failure(), null);
    assert.equal(download.suggestedFilename(), 'traywise-prep-2026-09-21.json');
    const destination = path.join(OUT, 'downloads', download.suggestedFilename());
    await download.saveAs(destination);
    const bytes = await fs.readFile(destination);
    const record = JSON.parse(bytes);
    checkExport(record);
    scene.download = {path: `downloads/${download.suggestedFilename()}`, sha256: digest(bytes), dataSHA256: record.dataSHA256, bytes: bytes.length, validated: true};
    await expect(page.locator('#status')).toHaveText('Preparation record downloaded.');
    await mark('download-validated', scene.download);
    await page.waitForTimeout(2000);
    await page.goto(pathToFileURL(destination).href);
    await expect(page.locator('body')).toContainText('TrayWise');
    await expect(page.locator('body')).toContainText(record.dataSHA256);
    await mark('actual-downloaded-json', {viewer: 'Chromium native file viewer; original JSON bytes, not an app screen', ...scene.download});
    await page.waitForTimeout(11000);
    await app(page);
    await page.locator('#csv').setInputFiles(importPath);
    await expect(page.locator('#source-name')).toHaveText(importName);
    await expect(page.locator('#days')).toHaveText('111');
    await expect(page.locator('#source-label')).toHaveText('LOCAL CSV · USER-SUPPLIED COUNTS');
    await mark('fictional-import-in-memory', {fixture: importName, source: 'First 111 rows of the published fictional sample; no personal CSV', rows: 111, nativeLabel: 'LOCAL CSV · USER-SUPPLIED COUNTS', disclosure: 'The app cannot infer provenance of a changed CSV. The filename explicitly identifies this fictional fixture.'});
    await page.waitForTimeout(5000);
    await page.reload({waitUntil: 'networkidle'});
    await expect(page.locator('#source-name')).toHaveText('Fictional campus kitchen');
    await expect(page.locator('#source-label')).toHaveText('DEMO DATA · NOT REAL OUTCOMES');
    await expect(page.locator('#days')).toHaveText('112');
    await expect(page.locator('#csv')).toHaveValue('');
    await frameWorkspace(page);
    await mark('reload-cleared-import', {rows: 112, source: 'Fictional campus kitchen', fileInput: 'empty'});
    await page.waitForTimeout(7000);
  },
  async (page, mark) => {
    const response = await page.goto(new URL('docs/EVALUATION-REPORT.md', BASE).href);
    assert.equal(response.status(), 200);
    assert.equal(digest(await response.body()), HASHES['docs/EVALUATION-REPORT.md']);
    checkReport(await page.locator('body').innerText());
    await mark('actual-plain-markdown-report', {format: 'Original published Markdown displayed as plain text by Chromium; not an app report UI', noSignal: {selected: 'recentMean', selectedMAE: 27.7222, weekdayMedianMAE: 23.9722}, abruptShift: '0/18 for all three models', requiredEditorialLabel: 'Synthetic evaluation; no field outcomes.'});
    await page.waitForTimeout(16000);
    await page.mouse.wheel(0, 380);
    await page.waitForTimeout(400);
    await mark('preserved-failures-and-post-inspection-disclosure');
    await page.waitForTimeout(9000);
  },
  async (page, mark) => {
    await app(page);
    await expect(page.locator('#forecast-warnings')).toBeInViewport({ratio: 1});
    await mark('closing-real-planning-loop', {fictional: true, noMeasuredSavings: true});
    await page.waitForTimeout(12000);
    await page.mouse.wheel(0, -2000);
    await page.waitForTimeout(400);
    await expect(page.locator('h1')).toContainText('Enough for lunch.');
    await expect(page.locator('#source-label')).toBeInViewport({ratio: 1});
    await mark('closing-original-tagline', {requiredEditorialDisclosure: 'Fictional demonstration. No measured food or carbon savings. AI-assisted build; narration generated locally with Kokoro-82M, stock Heart voice.'});
    await page.waitForTimeout(9000);
  },
];

try {
  for (let tries = 0; ; tries++) {
    try { assert.equal((await fetch(BASE, {signal: AbortSignal.timeout(2000)})).status, 200); break; }
    catch (error) { if (tries >= 40) throw error; await sleep(250); }
  }
  browser = await chromium.launch();
  run.browserVersion = browser.version();
  for (let i = 0; i < TIMING.scenes.length; i++) await recordScene(TIMING.scenes[i], actions[i]);
} catch (error) {
  run.fatalError = error.stack || String(error);
  run.status = 'failed';
  console.error(run.fatalError);
} finally {
  try { if (browser) await browser.close(); }
  catch (error) { run.fatalError = error.stack || String(error); run.status = 'failed'; }
  run.finishedAt = new Date().toISOString();
  await writeJSON('run.json', run);
}

// Decode every frame. Do not mistake the existence of a WebM for valid footage.
for (const scene of run.scenes) {
  try {
    const filename = path.join(OUT, scene.video);
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filename], {encoding: 'utf8'}));
    const stream = probe.streams.find(s => s.codec_type === 'video');
    assert.equal(stream.width, VIEWPORT.width);
    assert.equal(stream.height, VIEWPORT.height);
    assert.ok(Number(probe.format.duration) > 0);
    execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', filename, '-map', '0:v:0', '-f', 'null', '-'], {stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000});
    scene.mediaQA = {status: 'passed', durationSeconds: Number(probe.format.duration), width: stream.width, height: stream.height, codec: stream.codec_name, fullDecode: true, sha256: digest(await fs.readFile(filename))};
    if (scene.status === 'passed') assert.ok(scene.mediaQA.durationSeconds >= scene.narration.endSeconds - scene.narration.startSeconds, 'Raw clip is shorter than its narration');
    await writeJSON(`${scene.id}-ffprobe.json`, probe);
  } catch (error) {
    scene.status = 'failed';
    scene.mediaQA = {status: 'failed', error: error.stack || String(error)};
  }
  await writeJSON(`${scene.id}.json`, scene);
}
// A context-finalization error may leave a hash-named raw file. Preserve and inspect
// it too, while keeping the scene/run failed rather than inventing a successful cut.
run.unassignedVideos = [];
for (const name of await fs.readdir(path.join(OUT, 'videos'))) {
  if (!name.endsWith('.webm') || run.scenes.some(s => s.video === `videos/${name}`)) continue;
  const record = {path: `videos/${name}`};
  try {
    const filename = path.join(OUT, record.path);
    record.ffprobe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filename], {encoding: 'utf8'}));
    execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', filename, '-map', '0:v:0', '-f', 'null', '-'], {stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000});
    record.fullDecode = true;
  } catch (error) { record.fullDecode = false; record.error = error.stack || String(error); }
  run.unassignedVideos.push(record);
}
run.status = !run.fatalError && run.unassignedVideos.length === 0 && run.scenes.length === 7 && run.scenes.every(s => s.status === 'passed') ? 'passed' : 'failed';
run.finishedAt = new Date().toISOString();
await writeJSON('run.json', run);
console.log(`Capture ${run.status}. These are silent raw scenes, not a finished or submitted demo.`);
if (run.status !== 'passed') process.exitCode = 1;
