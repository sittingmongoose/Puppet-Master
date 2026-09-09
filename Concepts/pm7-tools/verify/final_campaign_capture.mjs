#!/usr/bin/env node
/*
 * PMConcept7 final motion/evidence campaign.
 *
 * Captures the frames Chrome actually delivers through
 * Page.startScreencast(everyNthFrame=1) as lossless PNGs. The report calls
 * these "delivered compositor frames" deliberately: browser screencast
 * delivery is useful browser-concept evidence, but it is not a native Slint,
 * display-refresh, or old-hardware certification.
 *
 * Usage:
 *   node final_campaign_capture.mjs --file PMConcept7.html --outdir evidence \
 *     --modules /path/to/node_modules --server http://127.0.0.1:8741 \
 *     --chromium /usr/bin/google-chrome --campaign smoke|final \
 *     [--ffmpeg /explicit/ffmpeg] [--ffprobe /explicit/ffprobe] \
 *     [--ffmpeg-library-path /explicit/library/directory]
 *
 * The final campaign retains raw PNGs, frame hashes/index, scenario manifest,
 * action timing, console/network logs, and (when ffmpeg exists) a variable-
 * timing FFV1/MKV master plus H.264 review derivative. No source frames are
 * deleted. The review derivative is never represented as source FPS evidence.
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import {
  closeSync, constants as fsConstants, existsSync, fstatSync, lstatSync,
  mkdirSync, openSync, readFileSync, readSync, readdirSync, realpathSync,
  statSync, writeFileSync, promises as fsp
} from 'node:fs';
import { basename, dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) throw new Error(`unexpected positional argument: ${token}`);
    if (token === '--help' || token === '--validate-only' || token === '--self-test') {
      out[token.slice(2)] = true;
      continue;
    }
    const key = token.slice(2), value = argv[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`missing value for --${key}`);
    out[key] = value;
    i += 1;
  }
  return out;
}

function assertNoSymlinkComponents(inputPath, label) {
  const absolutePath = resolve(inputPath);
  const root = parse(absolutePath).root;
  let cursor = root;
  for (const component of relative(root, absolutePath).split(sep).filter(Boolean)) {
    cursor = join(cursor, component);
    const entry = lstatSync(cursor);
    if (entry.isSymbolicLink()) throw new Error(`${label} must not contain symlink path components: ${cursor}`);
  }
  if (realpathSync.native(absolutePath) !== absolutePath) {
    throw new Error(`${label} must resolve exactly to its requested absolute path: ${absolutePath}`);
  }
  return absolutePath;
}

function descriptorSha256(fd) {
  const hash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  let position = 0;
  for (;;) {
    const count = readSync(fd, buffer, 0, buffer.length, position);
    if (!count) break;
    hash.update(buffer.subarray(0, count));
    position += count;
  }
  return hash.digest('hex');
}

function fileStatIdentity(stat) {
  return {
    device: Number(stat.dev), inode: Number(stat.ino), mode: Number(stat.mode),
    size_bytes: Number(stat.size), mtime_ms: Number(stat.mtimeMs)
  };
}

function bindRegularFile(inputPath, { label, expectedSha256 = null, directExecutable = false } = {}) {
  const absolutePath = assertNoSymlinkComponents(inputPath, label);
  const noFollow = fsConstants.O_NOFOLLOW;
  if (!Number.isInteger(noFollow)) throw new Error('O_NOFOLLOW is required for final-campaign evidence binding');
  const fd = openSync(absolutePath, fsConstants.O_RDONLY | noFollow | (fsConstants.O_CLOEXEC || 0));
  try {
    const before = fstatSync(fd);
    if (!before.isFile()) throw new Error(`${label} must be a regular file: ${absolutePath}`);
    if (directExecutable && (before.mode & 0o111) === 0) throw new Error(`${label} is not executable: ${absolutePath}`);
    const magic = Buffer.alloc(4);
    const magicBytes = readSync(fd, magic, 0, magic.length, 0);
    if (directExecutable && (magicBytes !== 4 || magic[0] !== 0x7f || magic[1] !== 0x45 || magic[2] !== 0x4c || magic[3] !== 0x46)) {
      throw new Error(`${label} must be the direct ELF browser executable, not a script or wrapper: ${absolutePath}`);
    }
    const sha256 = descriptorSha256(fd);
    const after = fstatSync(fd);
    const initialStat = fileStatIdentity(before), hashedStat = fileStatIdentity(after);
    if (JSON.stringify(initialStat) !== JSON.stringify(hashedStat)) throw new Error(`${label} changed while it was hashed: ${absolutePath}`);
    if (expectedSha256 && sha256 !== expectedSha256) {
      throw new Error(`${label} hash mismatch: expected ${expectedSha256}, observed ${sha256}`);
    }
    return Object.freeze({
      label, requested_path: inputPath, absolute_path: absolutePath,
      real_path: realpathSync.native(absolutePath), sha256,
      expected_sha256: expectedSha256 || sha256,
      direct_executable: directExecutable,
      executable_kind: directExecutable ? 'elf' : null,
      initial_stat: initialStat
    });
  } finally {
    closeSync(fd);
  }
}

function revalidateRegularFile(binding) {
  const current = bindRegularFile(binding.absolute_path, {
    label: binding.label,
    expectedSha256: binding.expected_sha256,
    directExecutable: binding.direct_executable
  });
  const unchanged = current.sha256 === binding.sha256
    && JSON.stringify(current.initial_stat) === JSON.stringify(binding.initial_stat);
  if (!unchanged) throw new Error(`${binding.label} identity changed after binding: ${binding.absolute_path}`);
  return { ...current, unchanged };
}

const args = parseArgs(process.argv);
const usage = `Usage: node final_campaign_capture.mjs --file FILE --outdir DIR --modules NODE_MODULES
  [--server URL] [--chromium PATH] [--campaign smoke|final]
  [--target-fps 60] [--hold-ms MS] [--ffmpeg PATH] [--ffprobe PATH]
  [--ffmpeg-library-path DIR] [--validate-only]
  [--self-test]

Captures Chrome DevTools screencast frames at everyNthFrame=1. target-fps is a
requested/measurement target only; missing frames are never synthesized.`;
if (args.help === true) {
  console.log(usage);
  process.exit(0);
}
if (args['self-test'] === true) {
  console.log(JSON.stringify(runCadenceTruthSelfTest(), null, 2));
  process.exit(0);
}
for (const key of ['file', 'outdir', 'modules']) {
  if (!args[key]) {
    console.error(`missing --${key}`);
    process.exit(2);
  }
}

const campaign = args.campaign || 'smoke';
if (!['smoke', 'final'].includes(campaign)) throw new Error('--campaign must be smoke or final');
const outdir = resolve(args.outdir);
const framesDir = join(outdir, 'lossless-frames');
const requireRuntime = createRequire(join(resolve(args.modules), 'noop.js'));
const { chromium } = requireRuntime('playwright-core');
const playwrightVersion = requireRuntime('playwright-core/package.json').version;
const chromiumPath = args.chromium || '/opt/google/chrome/chrome';
const browserExecutableBinding = bindRegularFile(chromiumPath, {
  label: 'Chromium executable', directExecutable: true
});
const server = args.server ? args.server.replace(/\/$/, '') : null;
const inputPath = isAbsolute(args.file) ? args.file : resolve(args.file);
const target = /^https?:\/\//i.test(args.file) || /^file:/i.test(args.file)
  ? args.file
  : server
    ? `${server}/${args.file.replace(/^\//, '')}`
    : pathToFileURL(inputPath).href;
const sourcePath = /^file:/i.test(target)
  ? new URL(target)
  : (existsSync(inputPath) ? inputPath : null);
const sourceSha256 = sourcePath && existsSync(sourcePath)
  ? createHash('sha256').update(readFileSync(sourcePath)).digest('hex') : null;
const targetFps = Number(args['target-fps'] || 60);
if (!Number.isFinite(targetFps) || targetFps <= 0 || targetFps > 240) {
  throw new Error('--target-fps must be a finite number greater than 0 and no greater than 240');
}
const targetInterval = 1000 / targetFps;
const holdMs = Math.max(20, Number(args['hold-ms'] || (campaign === 'smoke' ? 180 : 280)));
if (!Number.isFinite(holdMs)) throw new Error('--hold-ms must be a finite number');

const RUNNER_PATH = fileURLToPath(import.meta.url);
const DENOMINATOR_PATH = fileURLToPath(new URL('./final_campaign_denominator.json', import.meta.url));
const DENOMINATOR_SCHEMA_PATH = fileURLToPath(new URL('./final_campaign_denominator.schema.json', import.meta.url));
const FINAL_DENOMINATOR_SHA256 = 'c7946c2a5fc6faf1b809ebcaec6715d3ae6d0c2be5a437e974c8d93b0cd4365d';
const FINAL_DENOMINATOR_SCHEMA_SHA256 = '6a0cccfef637eadc7e90040d74df30f7170df5616eec4819c5042d78b9089805';
const denominatorBinding = bindRegularFile(DENOMINATOR_PATH, {
  label: 'Final campaign denominator', expectedSha256: FINAL_DENOMINATOR_SHA256
});
const denominatorSchemaBinding = bindRegularFile(DENOMINATOR_SCHEMA_PATH, {
  label: 'Final campaign denominator schema', expectedSha256: FINAL_DENOMINATOR_SCHEMA_SHA256
});
const FINAL_DENOMINATOR_SEMANTIC_SHA256 = '2334cda45a023e7b00264175d92e18e6f653c48249de4ac88cc53d79d6b5f56a';
const EXACT_REQUIRED_WIDTHS = Object.freeze([320, 520, 680, 720, 750, 760, 860, 900, 960, 975, 980, 1180, 1200, 1280, 1440, 1700, 2200, 2500]);
const EXACT_SOURCE_REFS = Object.freeze([
  'Plans/Test_Capture_and_Motion_Evidence.md#TCME-007',
  'Plans/FinalGUISpec.md#F3-524',
  'Plans/Automated_Testing_System.md#ATS-039'
]);
function denominatorSemanticSha256(value) {
  const semantic = {};
  for (const key of ['target_fps', 'required_widths', 'source_refs', 'touched_modules', 'chapters']) semantic[key] = value[key];
  const encode = item => Array.isArray(item) ? `[${item.map(encode).join(',')}]`
    : item && typeof item === 'object' ? `{${Object.keys(item).sort().map(key => `${JSON.stringify(key)}:${encode(item[key])}`).join(',')}}`
      : JSON.stringify(item);
  return createHash('sha256').update(encode(semantic)).digest('hex');
}
function loadFinalCampaignDenominator() {
  const value = JSON.parse(readFileSync(denominatorBinding.absolute_path, 'utf8'));
  const ids = value.chapters?.map(row => row.id) || [];
  const actionIds = value.chapters?.flatMap(row => row.actions || []) || [];
  const moduleIds = value.touched_modules?.map(row => row.id) || [];
  const unique = rows => new Set(rows).size === rows.length;
  if (value.schema_id !== 'pm.pmconcept7.final_campaign_denominator.v1'
      || value.authority !== 'repo_owned_fixed_denominator' || value.target_fps !== 60
      || JSON.stringify(value.required_widths) !== JSON.stringify(EXACT_REQUIRED_WIDTHS)
      || JSON.stringify(value.source_refs) !== JSON.stringify(EXACT_SOURCE_REFS)
      || value.semantic_census_sha256 !== FINAL_DENOMINATOR_SEMANTIC_SHA256
      || denominatorSemanticSha256(value) !== FINAL_DENOMINATOR_SEMANTIC_SHA256
      || !Array.isArray(value.chapters) || value.chapters.length !== 14 || actionIds.length !== 189
      || !ids.includes('usage-ats039-motion') || !unique(ids) || !unique(actionIds)
      || !Array.isArray(value.touched_modules) || !moduleIds.includes('usage-workspace-motion') || !unique(moduleIds)) {
    throw new Error('repo-owned final campaign denominator is malformed or incomplete');
  }
  const chapterSet = new Set(ids);
  const moduleChapterSet = new Set(value.touched_modules.flatMap(row => row.chapter_ids || []));
  if (value.touched_modules.some(row => !Array.isArray(row.chapter_ids) || row.chapter_ids.some(id => !chapterSet.has(id)))
      || moduleChapterSet.size !== chapterSet.size || ids.some(id => !moduleChapterSet.has(id))) {
    throw new Error('final campaign denominator contains an unowned touched-module chapter');
  }
  return value;
}
const FINAL_CAMPAIGN_DENOMINATOR = Object.freeze(loadFinalCampaignDenominator());
const REQUIRED_WIDTHS = Object.freeze([...FINAL_CAMPAIGN_DENOMINATOR.required_widths]);
const FINAL_CAMPAIGN_CONTRACT = Object.freeze(FINAL_CAMPAIGN_DENOMINATOR.chapters.map(row => Object.freeze({
  ...row, capabilities: Object.freeze([...row.capabilities]), actions: Object.freeze([...row.actions])
})));
if (campaign === 'final' && targetFps !== FINAL_CAMPAIGN_DENOMINATOR.target_fps) {
  throw new Error(`--target-fps must be exactly ${FINAL_CAMPAIGN_DENOMINATOR.target_fps} for the final campaign`);
}
const REQUIRED_CAPABILITY_GROUPS = Object.freeze([
  'settings.transactions', 'settings.preferences', 'settings.transfer', 'server.identity',
  'remote.routes', 'remote.continuity', 'backup.full_server', 'backup.vault_scope',
  'backup.verification', 'backup.quarantine', 'restore.modes', 'browser.program',
  'test.capture', 'scm.forges', 'scm.origin', 'named_plan', 'performance', 'plugins.owner_projection',
  'onboarding.main', 'onboarding.branches', 'onboarding.owner_projection', 'onboarding.interruption', 'onboarding.reversal',
  'onboarding.retro_motion', 'onboarding.reduced_motion', 'guided_tour.owner_actions',
  'guided_tour.retro_motion', 'guided_tour.reduced_motion',
  'doctor.remediation', 'doctor.exact_return', 'hover.census', 'hover.grace',
  'hover.dynamic', 'hover.collision', 'hover.zoom', 'home.t48', 'home.float',
  'home.redock', 'home.resize', 'usage.drag_reorder', 'usage.pointer_resize',
  'usage.keyboard_resize', 'usage.reflow', 'usage.cancel_rollback',
  'usage.transaction_custody', 'usage.theme_motion', 'responsive.required_widths'
]);
const FINAL_SOURCE_TOKENS = Object.freeze([
  'window.PM7_SETTINGS_COMMANDS', 'window.PM12_KIMI', 'window.PM7_SYSTEMS_INTEGRATION',
  'window.PM7_PERFORMANCE_TEST_API', 'window.PM7_ONBOARDING_CINEMATIC',
  'window.PM7_GUIDED_TOUR', 'window.PM_HOVER_TAG_CONTROLLER', 'window.PM_HOME_WORKSPACE', 'window.PM7_USAGE', "Object.defineProperty(window,'PM7_PLUGIN_COMMANDS'",
  'PM7 T48: Home workspace authored-source refresh', 'data-action="doctor-open-owner"',
  'PM7 T43: live occupied-neighbor Usage resize preview',
  'data-action="run-backup"', 'data-action="start-restore"', 'data-action="open-capture-policy"',
  'data-action="preview-origin"', 'data-action="open-named-plan"', 'data-action="open-performance-evidence"'
]);

function finalContractInventory() {
  const chapterIds = FINAL_CAMPAIGN_CONTRACT.map(row => row.id);
  const actionIds = FINAL_CAMPAIGN_CONTRACT.flatMap(row => row.actions);
  const capabilities = [...new Set(FINAL_CAMPAIGN_CONTRACT.flatMap(row => row.capabilities))].sort();
  const duplicates = values => values.filter((value, index) => values.indexOf(value) !== index);
  const missingCapabilities = REQUIRED_CAPABILITY_GROUPS.filter(value => !capabilities.includes(value));
  const widthIds = FINAL_CAMPAIGN_CONTRACT.find(row => row.id === 'responsive-matrix')?.actions || [];
  const expectedWidthIds = REQUIRED_WIDTHS.map(width => `resize-${width}`);
  return {
    valid: duplicates(chapterIds).length === 0 && duplicates(actionIds).length === 0
      && missingCapabilities.length === 0 && JSON.stringify(widthIds) === JSON.stringify(expectedWidthIds),
    chapter_count: chapterIds.length,
    action_count: actionIds.length,
    capability_count: capabilities.length,
    touched_module_count: FINAL_CAMPAIGN_DENOMINATOR.touched_modules.length,
    touched_module_ids: FINAL_CAMPAIGN_DENOMINATOR.touched_modules.map(row => row.id),
    chapters: FINAL_CAMPAIGN_CONTRACT.map(row => ({ id: row.id, action_count: row.actions.length, capability_count: row.capabilities.length })),
    chapter_ids: chapterIds,
    action_ids: actionIds,
    capabilities,
    duplicate_chapters: [...new Set(duplicates(chapterIds))],
    duplicate_actions: [...new Set(duplicates(actionIds))],
    missing_capabilities: missingCapabilities,
    required_widths: REQUIRED_WIDTHS
  };
}
function finalImplementationInventory() {
  const helpers = [
    ['themes-motion', finalThemesChapter],
    ['settings-transactions', finalSettingsTransactionsChapter],
    ['settings-preferences-transfer', finalSettingsPreferencesChapter],
    ['server-remote-continuity', finalServerRemoteChapter],
    ['backup-restore', finalBackupRestoreChapter],
    ['browser-capture-scm', finalConsumersChapter],
    ['doctor-remediation-return', finalDoctorChapter],
    ['onboarding', finalOnboardingChapter],
    ['onboarding-retro-reduced', finalOnboardingMotionChapter],
    ['guided-tour', finalGuidedTourChapter],
    ['hover-tags', finalHoverChapter],
    ['usage-ats039-motion', finalUsageMotionChapter],
    ['home-t48-motion', finalHomeChapter],
    ['responsive-matrix', finalResponsiveChapter]
  ];
  const orchestrator = runFinal.toString();
  const rows = helpers.map(([chapterId, fn]) => ({
    chapter_id: chapterId,
    helper: fn.name,
    action_call_sites: (fn.toString().match(/\baction\(page,/g) || []).length,
    orchestrator_index: orchestrator.indexOf(`await ${fn.name}(page)`)
  }));
  const ordered = rows.every((row, index) => row.orchestrator_index >= 0 && (index === 0 || row.orchestrator_index > rows[index - 1].orchestrator_index));
  return {
    valid: rows.length === FINAL_CAMPAIGN_CONTRACT.length && ordered && rows.every(row => row.action_call_sites > 0),
    ordered,
    helpers: rows
  };
}
function targetSourceInventory() {
  if (!sourcePath || !existsSync(sourcePath)) {
    return { checked: false, valid: /^https?:\/\//i.test(target), reason: 'remote_target_not_read_during_validation', missing_tokens: [] };
  }
  const source = readFileSync(sourcePath, 'utf8');
  const missingTokens = FINAL_SOURCE_TOKENS.filter(token => !source.includes(token));
  return { checked: true, valid: missingTokens.length === 0, bytes: Buffer.byteLength(source), sha256: sourceSha256, required_token_count: FINAL_SOURCE_TOKENS.length, missing_tokens: missingTokens };
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function canonicalSha256(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}
const captureConfiguration = Object.freeze({
  schema_id: 'pm.capture.final_campaign_configuration.v1', campaign,
  target_fps: targetFps, capture_format: 'png', every_nth_frame: 1,
  spatial_downscaling: false, initial_viewport: { width: 1440, height: 900 },
  device_scale_factor: 1, locale: 'en-US', timezone_id: 'UTC',
  reduced_motion: 'no-preference', hold_ms: holdMs,
  denominator_sha256: denominatorBinding.sha256
});
const captureCommand = Object.freeze({ argv: [process.execPath, ...process.argv.slice(1)], cwd: process.cwd() });
const captureRunner = Object.freeze({ path: RUNNER_PATH, sha256: hashFile(RUNNER_PATH) });

if (existsSync(outdir) && readdirSync(outdir).length) {
  throw new Error(`refusing to overwrite non-empty evidence directory: ${outdir}`);
}
if (args['validate-only']) {
  const sourceResolvable = /^https?:\/\//i.test(target) || (sourcePath && existsSync(sourcePath));
  if (!sourceResolvable) throw new Error(`capture source is not resolvable: ${target}`);
  const validatedBrowser = revalidateRegularFile(browserExecutableBinding);
  revalidateRegularFile(denominatorBinding);
  revalidateRegularFile(denominatorSchemaBinding);
  const contractInventory = finalContractInventory();
  const implementationInventory = finalImplementationInventory();
  const sourceInventory = targetSourceInventory();
  if (!contractInventory.valid) throw new Error(`final campaign contract is incomplete: ${JSON.stringify(contractInventory)}`);
  if (!implementationInventory.valid) throw new Error(`final campaign implementation is incomplete: ${JSON.stringify(implementationInventory)}`);
  if (!sourceInventory.valid) throw new Error(`capture source is missing final-campaign contracts: ${JSON.stringify(sourceInventory)}`);
  console.log(JSON.stringify({
    valid: true, capture_started: false, campaign, target: redactUrl(target),
    requested_fps: targetFps, chromium: browserExecutableBinding.absolute_path,
    browser_executable_binding: validatedBrowser,
    denominator: { path: DENOMINATOR_PATH, sha256: denominatorBinding.sha256, schema_path: DENOMINATOR_SCHEMA_PATH, schema_sha256: denominatorSchemaBinding.sha256 },
    runner: captureRunner, command: captureCommand,
    configuration: captureConfiguration, configuration_sha256: canonicalSha256(captureConfiguration),
    evidence_directory_empty_or_absent: true,
    contract_inventory: contractInventory,
    implementation_inventory: implementationInventory,
    source_inventory: sourceInventory,
    cadence_truth_contract: {
      raw_usable_missing_nonfinite_nonmonotonic_censuses_required: true,
      strict_cdp_and_receiver_monotonicity_required: true,
      minimum_usable_timed_frames: 2,
      subset_derived_cadence_forbidden: true,
      null_cadence_success_forbidden: true,
      consecutive_identical_lossless_hash_estimate_required: true,
      complete_lossless_frame_hash_census_required_for_capture_admission: true,
      estimate_is_not_compositor_or_native_proof: true
    },
    evidence_boundary: 'Validation only; no browser capture, runtime action, owner mutation, native Slint, or production-runtime proof was performed.'
  }, null, 2));
  process.exit(0);
}
mkdirSync(framesDir, { recursive: true });

const report = {
  schema_id: 'pm.pmconcept7.final_capture_campaign.v1',
  started_at_utc: new Date().toISOString(),
  disposition: 'running',
  campaign,
  target: redactUrl(target),
  source_sha256: sourceSha256,
  chromium: browserExecutableBinding.absolute_path,
  target_fps: targetFps,
  capture_method: 'Chrome DevTools Page.startScreencast format=png everyNthFrame=1',
  evidence_boundary: 'Delivered compositor-frame browser evidence only; not native Slint, display-refresh, production-runtime, or old-hardware certification.',
  no_resampling_claim: true,
  denominator: {
    schema_id: FINAL_CAMPAIGN_DENOMINATOR.schema_id,
    path: DENOMINATOR_PATH,
    sha256: denominatorBinding.sha256,
    schema_path: DENOMINATOR_SCHEMA_PATH,
    schema_sha256: denominatorSchemaBinding.sha256
  },
  runner: captureRunner,
  command: captureCommand,
  configuration: captureConfiguration,
  configuration_sha256: canonicalSha256(captureConfiguration),
  browser_identity: null,
  scenarios: [],
  chapters: [],
  actions: [],
  runtime_errors: [],
  console_log: 'console-log.json',
  network_log: 'network-log.json',
  scenario_manifest: 'scenario-manifest.json',
  coverage_manifest: 'coverage-manifest.json',
  action_timing: 'action-timing.json',
  timing_report: 'timing-report.json',
  artifact_manifest: 'artifact-manifest.json',
  frame_index: 'frame-index.json',
  campaign_contract: campaign === 'final' ? finalContractInventory() : null,
  media: {},
  observations: {}
};
const consoleLog = [], networkLog = [], frames = [], pendingWrites = [], frameWriteFailures = [];
const monotonicOrigin = process.hrtime.bigint();
const monotonicMs = () => Number(process.hrtime.bigint() - monotonicOrigin) / 1e6;
let actionSerial = 0, chapter = null, captureStartedAt = 0;

function writePartial() {
  writeFileSync(join(outdir, 'campaign-report.partial.json'), JSON.stringify(report, null, 2) + '\n');
}
function safeError(error) { return String(error?.stack || error).slice(0, 3000); }
function hashFile(path) {
  const hash = createHash('sha256');
  const fd = openSync(path, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    for (;;) {
      const count = readSync(fd, buffer, 0, buffer.length, null);
      if (!count) break;
      hash.update(buffer.subarray(0, count));
    }
  } finally {
    closeSync(fd);
  }
  return hash.digest('hex');
}
function redactUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.username) parsed.username = '[redacted]';
    if (parsed.password) parsed.password = '[redacted]';
    if (parsed.search) parsed.search = '?[redacted]';
    if (parsed.hash) parsed.hash = '#[redacted]';
    return parsed.href;
  } catch (_error) {
    return String(value).slice(0, 2000);
  }
}
function percentile(sorted, p) {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return Number(sorted[index].toFixed(3));
}
function timestampCensus(frameRows, key) {
  const values = [];
  let missing = 0, nonfinite = 0;
  for (const row of frameRows) {
    const hasField = Object.prototype.hasOwnProperty.call(row, key);
    const value = row[key];
    if (!hasField || value === null || value === undefined) {
      missing += 1;
    } else if (typeof value !== 'number' || !Number.isFinite(value)) {
      nonfinite += 1;
    } else {
      values.push(value);
    }
  }
  let nonmonotonic = 0;
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] <= values[index - 1]) nonmonotonic += 1;
  }
  const rawCount = frameRows.length;
  const suppliedCount = rawCount - missing;
  const usableCount = values.length;
  const strictlyMonotonic = usableCount >= 2 && nonmonotonic === 0;
  const complete = usableCount === rawCount && missing === 0 && nonfinite === 0;
  return {
    values,
    report: {
      raw_frame_count: rawCount,
      raw_timestamp_field_count: suppliedCount,
      usable_timestamp_count: usableCount,
      missing_timestamp_count: missing,
      nonfinite_timestamp_count: nonfinite,
      nonmonotonic_interval_count: nonmonotonic,
      complete,
      at_least_two_usable_timestamps: usableCount >= 2,
      strictly_monotonic: strictlyMonotonic
    }
  };
}
function repeatedFrameEstimate(frameRows) {
  const validHash = value => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
  const hashes = frameRows.map(row => validHash(row.sha256) ? row.sha256 : null);
  let consecutiveIdentical = 0;
  let currentRun = hashes.length && hashes[0] ? 1 : 0;
  let longestRun = currentRun;
  for (let index = 1; index < hashes.length; index += 1) {
    if (hashes[index] && hashes[index - 1] && hashes[index] === hashes[index - 1]) {
      consecutiveIdentical += 1;
      currentRun += 1;
    } else {
      currentRun = hashes[index] ? 1 : 0;
    }
    longestRun = Math.max(longestRun, currentRun);
  }
  const usable = hashes.filter(Boolean);
  return {
    raw_frame_count: frameRows.length,
    usable_lossless_frame_hash_count: usable.length,
    missing_or_invalid_lossless_frame_hash_count: frameRows.length - usable.length,
    distinct_lossless_frame_hash_count: new Set(usable).size,
    consecutive_identical_hash_pair_count: consecutiveIdentical,
    estimated_repeated_frame_count: consecutiveIdentical,
    estimated_repeated_pair_fraction: frameRows.length > 1
      ? Number((consecutiveIdentical / (frameRows.length - 1)).toFixed(6)) : 0,
    longest_consecutive_identical_hash_run_frames: longestRun,
    hash_census_complete: usable.length === frameRows.length,
    estimate_basis: 'Consecutive equality of retained lossless PNG byte SHA-256 values. This is a repeated-delivered-frame estimate, not decoded-pixel equality, compositor/display presentation proof, or native Slint pacing evidence.'
  };
}
function computeCadenceObservations(frameRows, requestedFps) {
  const intervalTargetMs = 1000 / requestedFps;
  const cdp = timestampCensus(frameRows, 'cdp_timestamp_s');
  const receiver = timestampCensus(frameRows, 'received_monotonic_ms');
  const failureReasons = [];
  if (frameRows.length < 2) failureReasons.push('delivered_frame_count_below_two');
  for (const [prefix, census] of [['cdp', cdp.report], ['receiver', receiver.report]]) {
    if (census.missing_timestamp_count) failureReasons.push(`${prefix}_timestamp_missing`);
    if (census.nonfinite_timestamp_count) failureReasons.push(`${prefix}_timestamp_nonfinite`);
    if (census.nonmonotonic_interval_count) failureReasons.push(`${prefix}_timestamp_nonmonotonic`);
    if (!census.at_least_two_usable_timestamps) failureReasons.push(`${prefix}_usable_timestamp_count_below_two`);
    if (!census.complete) failureReasons.push(`${prefix}_timestamp_census_incomplete`);
  }
  const cadenceValid = failureReasons.length === 0
    && cdp.report.strictly_monotonic && receiver.report.strictly_monotonic;
  const cdpIntervals = [];
  const receiverIntervals = [];
  if (cadenceValid) {
    for (let index = 1; index < cdp.values.length; index += 1) {
      cdpIntervals.push((cdp.values[index] - cdp.values[index - 1]) * 1000);
      receiverIntervals.push(receiver.values[index] - receiver.values[index - 1]);
    }
  }
  const sortedCdpIntervals = [...cdpIntervals].sort((a, b) => a - b);
  const sortedReceiverIntervals = [...receiverIntervals].sort((a, b) => a - b);
  const durationMs = cadenceValid ? (cdp.values.at(-1) - cdp.values[0]) * 1000 : null;
  const receiverDurationMs = cadenceValid ? receiver.values.at(-1) - receiver.values[0] : null;
  const delayedThreshold = intervalTargetMs * 1.5;
  const droppedEquivalent = cadenceValid
    ? cdpIntervals.reduce((sum, interval) => sum + Math.max(0, Math.round(interval / intervalTargetMs) - 1), 0)
    : null;
  const intervalReport = (values, sorted) => ({
    p50: cadenceValid ? percentile(sorted, 0.50) : null,
    p95: cadenceValid ? percentile(sorted, 0.95) : null,
    p99: cadenceValid ? percentile(sorted, 0.99) : null,
    max: cadenceValid && values.length ? Number(Math.max(...values).toFixed(3)) : null
  });
  const repeatEstimate = repeatedFrameEstimate(frameRows);
  return {
    delivered_frame_count: frameRows.length,
    requested_fps: requestedFps,
    requested_interval_ms: Number(intervalTargetMs.toFixed(6)),
    cadence_claim_available: cadenceValid,
    cadence_valid: cadenceValid,
    capture_evidence_admissible: cadenceValid && repeatEstimate.hash_census_complete,
    cadence_failure_reasons: [...new Set(failureReasons)],
    cdp_timestamp_census: cdp.report,
    receiver_timestamp_census: receiver.report,
    first_to_last_cdp_ms: cadenceValid ? Number(durationMs.toFixed(3)) : null,
    first_to_last_receiver_ms: cadenceValid ? Number(receiverDurationMs.toFixed(3)) : null,
    delivered_fps: cadenceValid && durationMs > 0
      ? Number(((frameRows.length - 1) * 1000 / durationMs).toFixed(3)) : null,
    cdp_timestamp_fps: cadenceValid && durationMs > 0
      ? Number(((frameRows.length - 1) * 1000 / durationMs).toFixed(3)) : null,
    receiver_observed_fps: cadenceValid && receiverDurationMs > 0
      ? Number(((frameRows.length - 1) * 1000 / receiverDurationMs).toFixed(3)) : null,
    interval_ms: intervalReport(cdpIntervals, sortedCdpIntervals),
    receiver_interval_ms: intervalReport(receiverIntervals, sortedReceiverIntervals),
    delayed_interval_threshold_ms: Number(delayedThreshold.toFixed(3)),
    delayed_interval_count: cadenceValid ? cdpIntervals.filter(value => value > delayedThreshold).length : null,
    dropped_frame_equivalent_estimate: droppedEquivalent,
    repeated_frame_estimate: repeatEstimate,
    pacing_limitation: 'CDP screencast delivery intervals include capture/transport/encoding behavior and do not prove display presentation or native Slint pacing. Repeated-frame values are lossless-PNG hash estimates only.'
  };
}
function runCadenceTruthSelfTest() {
  const hashA = 'a'.repeat(64), hashB = 'b'.repeat(64), hashC = 'c'.repeat(64);
  const frame = (cdp, receiver, hash) => ({ cdp_timestamp_s: cdp, received_monotonic_ms: receiver, sha256: hash });
  const cases = [];
  const check = (condition, message) => { if (!condition) throw new Error(`cadence self-test failed: ${message}`); };
  const valid = computeCadenceObservations([
    frame(1, 100, hashA), frame(1.0167, 116.7, hashA), frame(1.0334, 133.4, hashB), frame(1.0501, 150.1, hashC)
  ], 60);
  check(valid.cadence_valid && valid.capture_evidence_admissible && valid.cdp_timestamp_census.usable_timestamp_count === 4, 'valid timing rejected');
  check(valid.repeated_frame_estimate.estimated_repeated_frame_count === 1, 'repeated-frame estimate mismatch');
  check(valid.repeated_frame_estimate.longest_consecutive_identical_hash_run_frames === 2, 'repeated run mismatch');
  cases.push({
    case: 'valid_complete_with_repeated_hash', pass: true,
    cadence_valid: valid.cadence_valid, capture_evidence_admissible: valid.capture_evidence_admissible,
    cdp_timestamp_census: valid.cdp_timestamp_census,
    receiver_timestamp_census: valid.receiver_timestamp_census,
    repeated_frame_estimate: valid.repeated_frame_estimate
  });

  const missing = computeCadenceObservations([frame(1, 100, hashA), frame(null, 116.7, hashB), frame(1.0334, 133.4, hashC)], 60);
  check(!missing.cadence_valid && !missing.capture_evidence_admissible && missing.cdp_timestamp_census.missing_timestamp_count === 1 && missing.delivered_fps === null, 'missing timestamp did not fail closed');
  cases.push({
    case: 'missing_cdp_timestamp', pass: true, failure_reasons: missing.cadence_failure_reasons,
    cadence_claim_available: missing.cadence_claim_available,
    cdp_timestamp_census: missing.cdp_timestamp_census
  });

  const malformed = computeCadenceObservations([frame(1, 100, hashA), frame('bad', Number.POSITIVE_INFINITY, hashB), frame(1.0334, 133.4, hashC)], 60);
  check(!malformed.cadence_valid && malformed.cdp_timestamp_census.nonfinite_timestamp_count === 1 && malformed.receiver_timestamp_census.nonfinite_timestamp_count === 1, 'malformed timestamps did not fail closed');
  cases.push({
    case: 'nonfinite_or_malformed_timestamps', pass: true, failure_reasons: malformed.cadence_failure_reasons,
    cadence_claim_available: malformed.cadence_claim_available,
    cdp_timestamp_census: malformed.cdp_timestamp_census,
    receiver_timestamp_census: malformed.receiver_timestamp_census
  });

  const nonmonotonic = computeCadenceObservations([frame(1, 100, hashA), frame(1.02, 120, hashB), frame(1.019, 119, hashC)], 60);
  check(!nonmonotonic.cadence_valid && nonmonotonic.cdp_timestamp_census.nonmonotonic_interval_count === 1 && nonmonotonic.receiver_timestamp_census.nonmonotonic_interval_count === 1, 'non-monotonic timestamps did not fail closed');
  cases.push({
    case: 'nonmonotonic_timestamps', pass: true, failure_reasons: nonmonotonic.cadence_failure_reasons,
    cadence_claim_available: nonmonotonic.cadence_claim_available,
    cdp_timestamp_census: nonmonotonic.cdp_timestamp_census,
    receiver_timestamp_census: nonmonotonic.receiver_timestamp_census
  });

  const single = computeCadenceObservations([frame(1, 100, hashA)], 60);
  check(!single.cadence_valid && single.delivered_fps === null && single.cdp_timestamp_census.at_least_two_usable_timestamps === false, 'single-frame timing did not fail closed');
  cases.push({
    case: 'single_frame', pass: true, failure_reasons: single.cadence_failure_reasons,
    cadence_claim_available: single.cadence_claim_available,
    cdp_timestamp_census: single.cdp_timestamp_census,
    receiver_timestamp_census: single.receiver_timestamp_census
  });

  const missingHash = computeCadenceObservations([frame(1, 100, hashA), frame(1.02, 120, null)], 60);
  check(missingHash.cadence_valid && !missingHash.capture_evidence_admissible && !missingHash.repeated_frame_estimate.hash_census_complete, 'hash census truth mismatch');
  cases.push({
    case: 'missing_lossless_frame_hash_is_reported', pass: true,
    capture_evidence_admissible: missingHash.capture_evidence_admissible,
    repeated_frame_estimate: missingHash.repeated_frame_estimate
  });
  return {
    schema_id: 'pm.capture.cadence_truth_self_test.v1',
    pass: true,
    browser_launched: false,
    capture_started: false,
    cases,
    evidence_boundary: 'Pure timing/hash fixtures only; no browser capture, compositor proof, native Slint proof, or production-runtime proof.'
  };
}
async function hold(page, ms = holdMs) { await page.waitForTimeout(ms); }
function need(condition, message, evidence = null) {
  if (condition) return evidence;
  const error = new Error(message);
  if (evidence !== null) error.evidence = evidence;
  throw error;
}
function chapterContract(id = chapter) {
  return FINAL_CAMPAIGN_CONTRACT.find(row => row.id === id) || null;
}
async function action(page, id, fn, options = {}) {
  if (campaign === 'final') {
    const contract = chapterContract();
    need(contract, `unregistered final campaign chapter: ${chapter}`);
    need(contract.actions.includes(id), `unregistered action ${id} in final campaign chapter ${chapter}`);
    need(!report.actions.some(row => row.chapter === chapter && row.id === id), `duplicate action ${id} in final campaign chapter ${chapter}`);
  }
  const row = {
    serial: ++actionSerial, id, chapter, started_ms: Number(monotonicMs().toFixed(3)),
    required: options.required !== false, disposition: 'running',
    capabilities: options.capabilities || chapterContract()?.capabilities || [],
    evidence_scope: options.evidenceScope || 'browser_concept',
    native_runtime_claim: false,
    production_runtime_claim: false
  };
  report.actions.push(row);
  try {
    row.result = await fn();
    row.disposition = 'captured';
  } catch (error) {
    row.disposition = options.required === false ? 'unavailable' : 'failed';
    row.error = safeError(error);
    if (row.disposition === 'failed') throw error;
  } finally {
    row.finished_ms = Number(monotonicMs().toFixed(3));
    row.elapsed_ms = Number((row.finished_ms - row.started_ms).toFixed(3));
  }
  await hold(page, options.holdMs);
  return row;
}
async function beginChapter(page, id, description) {
  if (campaign === 'final') need(chapterContract(id), `unregistered final campaign chapter: ${id}`);
  chapter = id;
  report.chapters.push({
    id, description, started_ms: Number(monotonicMs().toFixed(3)),
    capabilities: chapterContract(id)?.capabilities || [],
    required_action_ids: chapterContract(id)?.actions || []
  });
  await page.evaluate(({ id, description }) => {
    document.documentElement.dataset.captureChapter = id;
    window.dispatchEvent(new CustomEvent('pm7:capture-chapter', { detail: { id, description } }));
  }, { id, description });
  await hold(page, 80);
}
function finishChapter() {
  const row = report.chapters.findLast(item => item.id === chapter && !item.finished_ms);
  if (row) {
    row.finished_ms = Number(monotonicMs().toFixed(3));
    row.action_ids = report.actions.filter(item => item.chapter === chapter).map(item => item.id);
    row.failed_action_ids = report.actions.filter(item => item.chapter === chapter && item.disposition !== 'captured').map(item => item.id);
    if (campaign === 'final') {
      const contract = chapterContract();
      row.missing_action_ids = contract.actions.filter(id => !row.action_ids.includes(id));
      row.unexpected_action_ids = row.action_ids.filter(id => !contract.actions.includes(id));
      row.coverage_complete = row.missing_action_ids.length === 0 && row.unexpected_action_ids.length === 0 && row.failed_action_ids.length === 0;
      need(row.coverage_complete, `final campaign chapter ${chapter} did not close its exact action contract`, row);
    }
  }
}
async function setTheme(page, theme) {
  await page.evaluate(value => {
    document.documentElement.setAttribute('data-theme', value);
    try { localStorage.setItem('pm.theme', value); } catch (_error) {}
    window.dispatchEvent(new CustomEvent('pm7:capture-theme', { detail: { theme: value } }));
  }, theme);
}
async function setCaptureViewport(page, width, height) {
  await page.setViewportSize({ width, height });
  const observed = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, device_scale_factor: devicePixelRatio }));
  need(observed.width === width && observed.height === height && observed.device_scale_factor === 1,
    'Capture viewport/DPR did not settle exactly', { expected: { width, height, device_scale_factor: 1 }, observed });
  return observed;
}
async function openSettings(page, domain, workspace) {
  await page.evaluate(({ domain, workspace }) => {
    if (!window.PM7_SETTINGS_COMMANDS?.open) throw new Error('PM7 settings route API unavailable');
    window.PM7_SETTINGS_COMMANDS.open({ domain, workspace });
  }, { domain, workspace });
  await page.waitForFunction(({ domain, workspace }) => {
    const state = window.PM12_KIMI?.getState?.();
    return state?.domain === domain && state?.workspace === workspace;
  }, { domain, workspace }, { timeout: 20000 });
}
async function openSettingsHome(page) {
  await page.evaluate(() => {
    const tab = document.getElementById('tab-settings');
    if (!tab || !window.PM12_KIMI) throw new Error('Settings home API unavailable');
    tab.click();
    const state = window.PM12_KIMI.getState();
    window.PM12_KIMI.setState({ ...state, home: true, detailSetting: null });
  });
  await page.waitForFunction(() => document.getElementById('panel-settings')?.classList.contains('active') && window.PM12_KIMI?.getState?.().home === true, null, { timeout: 20000 });
}
async function openAllSettings(page) {
  const route = await page.evaluate(() => {
    const domains = window.PM12_DATA?.domains || [];
    for (const domain of domains) {
      const workspace = domain.workspaces?.find(item => item.id === 'all-settings' || item.type === 'all-settings' || item.virtualAllSettings === true);
      if (workspace) return { domain: domain.id, workspace: workspace.id };
    }
    return null;
  });
  if (!route) throw new Error('All Settings workspace is unavailable');
  return openSettings(page, route.domain, route.workspace);
}
async function waitOnboarding(page, expected) {
  await page.waitForFunction(value => {
    const snapshot = window.PM7_ONBOARDING_CINEMATIC?.snapshot?.();
    return snapshot && Object.entries(value).every(([key, wanted]) => snapshot[key] === wanted);
  }, expected, { timeout: 20000 });
}

async function closeTransient(page) {
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(24);
  }
}
async function dispatchSettingsAction(page, actionId, payload = {}) {
  return page.evaluate(({ actionId, payload }) => {
    if (!window.PM12_KIMI?.dispatchAction) throw new Error('Settings action dispatcher unavailable');
    return window.PM12_KIMI.dispatchAction(actionId, payload);
  }, { actionId, payload });
}
async function selectManagerTab(page, actionId, tab, stateKey, rootSelector) {
  await dispatchSettingsAction(page, actionId, { tab });
  await page.waitForFunction(({ tab, stateKey, rootSelector }) => {
    const state = window.PM12_KIMI?.getState?.();
    return state?.[stateKey] === tab && document.querySelector(`${rootSelector} [data-action="${stateKey === 'serverTab' ? 'server-tab' : stateKey === 'backupTab' ? 'backup-tab' : stateKey === 'projectSyncTab' ? 'project-sync-tab' : 'browser-scm-tab'}"][data-tab="${tab}"].active`);
  }, { tab, stateKey, rootSelector }, { timeout: 10000 });
}
async function portalText(page) {
  return page.locator('#pm-settings-portals').innerText().catch(() => '');
}
async function requirePortalTerms(page, terms) {
  const text = await portalText(page);
  const missing = terms.filter(term => !text.toLowerCase().includes(term.toLowerCase()));
  need(missing.length === 0, `portal omitted required concept-boundary terms: ${missing.join(', ')}`, { terms, missing, text: text.slice(0, 3000) });
  return { terms, text: text.slice(0, 3000), browser_projection_only: true, native_execution: 'not_performed' };
}

async function runSmoke(page) {
  report.scenarios.push({ id: 'smoke', intent: 'Bounded harness validation; not the final campaign.' });
  await beginChapter(page, 'smoke-boot', 'Boot and one theme transition');
  await action(page, 'boot-settle', async () => page.evaluate(() => ({
    pages: Boolean(window.PM_PAGES), settings: Boolean(window.PM7_SETTINGS_COMMANDS),
    onboarding: Boolean(window.PM7_ONBOARDING_CINEMATIC), hover: Boolean(window.PMHoverTag)
  })), { holdMs: 220 });
  await action(page, 'theme-friendly-light', () => setTheme(page, 'friendly-light'));
  await action(page, 'theme-friendly-dark', () => setTheme(page, 'friendly-dark'));
  await action(page, 'settings-home', () => openSettingsHome(page));
  await action(page, 'onboarding-welcome', () => page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC?.replay?.()), { required: false, holdMs: 480 });
  finishChapter();
}

async function finalThemesChapter(page) {
  await beginChapter(page, 'themes-motion', 'Eight themes, full and reduced motion');
  for (const theme of ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'basic-dark', 'basic-light']) {
    await action(page, `theme-${theme}`, async () => {
      await setTheme(page, theme);
      const active = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      need(active === theme, `theme did not apply: ${theme}`, { expected: theme, active });
      return { expected: theme, active };
    }, { holdMs: 180 });
  }
  await action(page, 'motion-reduced', () => page.evaluate(() => { document.documentElement.setAttribute('data-motion', 'reduced'); return { motion: document.documentElement.dataset.motion }; }));
  await action(page, 'motion-full', () => page.evaluate(() => { document.documentElement.setAttribute('data-motion', 'full'); return { motion: document.documentElement.dataset.motion }; }));
  await setTheme(page, 'friendly-dark');
  finishChapter();
}

async function finalSettingsTransactionsChapter(page) {
  await beginChapter(page, 'settings-transactions', 'Settings preview, apply, rollback, stale rejection, and export command bridge');
  await action(page, 'settings-transaction-preview', () => page.evaluate(() => {
    window.__PM7_CAPTURE_COMMANDS = [];
    window.PM_SETTINGS_RUNTIME_CONTEXT = {
      project_home_server_id: 'server:capture-home', execution_host_id: 'host:capture', execution_environment_id: 'env:capture',
      actor_ref: 'actor:capture', permission_snapshot_ref: 'permission:capture', topology_generation: 19,
      binding_sha256: 'b'.repeat(64), source_location_id: 'location:capture'
    };
    window.PM_DISPATCH_COMMAND = request => {
      window.__PM7_CAPTURE_COMMANDS.push(JSON.parse(JSON.stringify(request)));
      return { ok: true, terminal: true, status: 'accepted', result_receipt_ref: `capture:${request.command_id}` };
    };
    const response = window.PM7_SETTINGS_COMMANDS.preview({ expected_revision: 20, changes: [{ setting_id: 'general.visual.theme', value: 'Glass Dark' }] });
    if (response.mode !== 'host_result' || response.request?.command_id !== 'cmd.settings.transaction.preview') throw new Error('Settings preview bridge did not return the exact command envelope');
    return { response, production_owner_mutation: false, synthetic_dispatcher: true };
  }));
  await action(page, 'settings-transaction-apply', () => page.evaluate(() => {
    const response = window.PM7_SETTINGS_COMMANDS.apply({ expected_revision: 20, preview_receipt_ref: 'preview:capture:20' });
    if (response.mode !== 'host_result' || response.request?.command_id !== 'cmd.settings.transaction.apply') throw new Error('Settings apply bridge did not return the exact command envelope');
    return { response, production_owner_mutation: false, synthetic_dispatcher: true };
  }));
  await action(page, 'settings-transaction-rollback', () => page.evaluate(() => {
    const response = window.PM7_SETTINGS_COMMANDS.rollback({ expected_revision: 21, transaction_receipt_ref: 'transaction:capture:20' });
    if (response.mode !== 'host_result' || response.request?.command_id !== 'cmd.settings.transaction.rollback') throw new Error('Settings rollback bridge did not return the exact command envelope');
    return { response, production_owner_mutation: false, synthetic_dispatcher: true };
  }));
  await action(page, 'settings-transaction-stale-rejection', () => page.evaluate(() => {
    window.PM_DISPATCH_COMMAND = request => ({ ok: false, status: 'rejected', error_code: 'settings_revision_stale', expected_revision: request.expected_revision, effective_revision: 22, safe_user_message: 'Settings changed elsewhere. Refresh and preview again.' });
    const response = window.PM7_SETTINGS_COMMANDS.apply({ expected_revision: 19, preview_receipt_ref: 'preview:stale' });
    if (response.mode !== 'host_rejected' || response.result?.error_code !== 'settings_revision_stale') throw new Error('Stale Settings revision did not fail closed');
    return response;
  }));
  await action(page, 'settings-transaction-export-command', () => page.evaluate(() => {
    window.PM_DISPATCH_COMMAND = request => ({ ok: true, terminal: true, status: 'accepted', result_receipt_ref: `capture:${request.command_id}` });
    const response = window.PM7_SETTINGS_COMMANDS.export({ format: 'json', redact: true, include_credential_references: false });
    if (response.mode !== 'host_result' || response.request?.command_id !== 'cmd.settings.export' || response.request?.redact !== true) throw new Error('Settings export bridge did not retain redaction');
    return { response, production_owner_mutation: false, synthetic_dispatcher: true };
  }));
  finishChapter();
}

async function finalSettingsPreferencesChapter(page) {
  await beginChapter(page, 'settings-preferences-transfer', 'K3 preferences, persistence, reset, import/export, and virtualized inventory');
  await action(page, 'settings-home', () => openSettingsHome(page));
  await action(page, 'settings-theme-glass', () => page.evaluate(() => {
    delete window.PM_SETTINGS_REGISTRY;
    const ok = window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Glass Dark');
    const state = window.PM12_KIMI.getState(), paint = document.documentElement.dataset.theme;
    if (!ok || state.settings['general.visual.theme'] !== 'Glass Dark' || paint !== 'glass-dark') throw new Error('Glass theme Setting did not reach paint');
    return { setting: state.settings['general.visual.theme'], paint };
  }));
  for (const [id, value] of [['settings-glass-transparency-low', 0.35], ['settings-glass-transparency-high', 0.88]]) {
    await action(page, id, () => page.evaluate(alpha => {
      const ok = window.PM12_KIMI.setSettingFromHost('general.visual.glass-transparency', alpha);
      const paint = Number(document.documentElement.style.getPropertyValue('--glass-alpha'));
      if (!ok || paint !== alpha) throw new Error('Glass transparency Setting did not reach paint');
      return { alpha, paint };
    }, value));
  }
  for (const [id, value] of [['settings-tooltips-off', false], ['settings-tooltips-on', true]]) {
    await action(page, id, () => page.evaluate(enabled => {
      const ok = window.PM12_KIMI.setSettingFromHost('general.interaction.show-tooltips', enabled);
      window.PM_HOVER_TAG_CONTROLLER?.syncVisualSetting?.();
      const visual = window.PM_HOVER_TAG_CONTROLLER?.visualEnabled;
      if (!ok || visual !== enabled) throw new Error('Tooltip visual Setting did not reach the shared hover controller');
      return { enabled, accessibility_descriptions_retained: true, visual_enabled: visual };
    }, value));
  }
  for (const [id, value] of [['settings-reduced-motion-on', true], ['settings-reduced-motion-off', false]]) {
    await action(page, id, () => page.evaluate(reduced => {
      const ok = window.PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', reduced);
      const paint = document.documentElement.dataset.motion;
      if (!ok || paint !== (reduced ? 'reduced' : 'full')) throw new Error('Reduced Motion Setting did not reach paint');
      return { reduced, paint };
    }, value));
  }
  await action(page, 'settings-reset', () => page.evaluate(() => {
    const before = window.PM12_KIMI.getState().settings['general.visual.theme'];
    window.PM12_KIMI.reset();
    const after = window.PM12_KIMI.getState().settings['general.visual.theme'];
    if (before === after) throw new Error('Settings reset did not restore the project projection');
    return { before, after, project_projection_reset: true };
  }));
  await action(page, 'settings-transfer-open', async () => {
    await openSettings(page, 'system', 'settings-transfer');
    await page.locator('[data-action="settings-transfer-tab"][data-tab="import-export"]').click();
    return page.evaluate(() => ({ route: window.PM12_KIMI.getState().workspace, tab: window.PM12_KIMI.getState().settingsTransferTab }));
  });
  await action(page, 'settings-export-dialog', async () => { await page.locator('#pm-settings-root [data-action="export-settings"]').click(); const evidence = await requirePortalTerms(page, ['credential references', 'never secrets']); await closeTransient(page); return evidence; });
  await action(page, 'settings-import-dialog', async () => { await page.locator('#pm-settings-root [data-action="import-settings"]').click(); const evidence = await requirePortalTerms(page, ['validate', 'rollback']); await closeTransient(page); return evidence; });
  await action(page, 'settings-all-virtualized', async () => {
    await openAllSettings(page);
    return page.evaluate(() => {
      const model = JSON.parse(document.getElementById('pm7-settings-data')?.textContent || '{}');
      const total = Array.isArray(model.settings) ? model.settings.length : 0, mounted = document.querySelectorAll('[data-all-setting-id]').length, viewport = Boolean(document.querySelector('[data-all-settings-viewport]'));
      if (!(total > 100 && mounted > 0 && mounted < total && viewport)) throw new Error('All Settings is not model-backed and virtualized');
      return { total, mounted, viewport };
    });
  });
  finishChapter();
}

async function finalServerRemoteChapter(page) {
  await beginChapter(page, 'server-remote-continuity', 'Server identity, remote routes, migration, and reconnect/restart/sleep continuity');
  await openSettings(page, 'system', 'servers');
  for (const tab of ['claim', 'hosts', 'clients', 'deploy', 'backup', 'diagnostics']) {
    await action(page, `server-tab-${tab}`, async () => { await selectManagerTab(page, 'server-tab', tab, 'serverTab', '#workspace-servers'); return { tab }; }, { holdMs: 160 });
  }
  await action(page, 'server-claim-preview', async () => {
    await selectManagerTab(page, 'server-tab', 'claim', 'serverTab', '#workspace-servers');
    await page.locator('#workspace-servers [data-action="open-server-claim"]').first().click();
    const dialog = page.getByRole('dialog', { name: 'Claim existing server', exact: true }), identity = await dialog.innerText();
    need(['Host identity', 'Environment', 'Project authority', 'Verify before claim'].every(term => identity.includes(term)), 'Server claim omitted exact identity/trust fields', identity);
    await dialog.getByRole('button', { name: 'Preview claim', exact: true }).click();
    const body = await page.locator('body').innerText(); need(body.includes('No ownership changed'), 'Server claim preview omitted no-mutation boundary');
    await closeTransient(page); return { identity_fields_present: true, production_mutation: 'not_performed' };
  });
  await action(page, 'server-bootstrap-preview', async () => {
    await dispatchSettingsAction(page, 'open-server-bootstrap');
    const dialog = page.getByRole('dialog', { name: 'Bootstrap server', exact: true }), text = await dialog.innerText();
    need(/rollback/i.test(text) && /verify/i.test(text), 'Server bootstrap omitted rollback/verification fields', text);
    await dialog.getByRole('button', { name: 'Preview bootstrap', exact: true }).click();
    const body = await page.locator('body').innerText(); need(body.includes('No download, install, sync, or authority switch occurred'), 'Bootstrap preview omitted mutation boundary');
    await closeTransient(page); return { production_mutation: 'not_performed' };
  });
  await action(page, 'server-host-verification-preview', async () => {
    await selectManagerTab(page, 'server-tab', 'hosts', 'serverTab', '#workspace-servers');
    await page.locator('#workspace-servers [data-action="verify-server-host"]').first().click();
    const evidence = await requirePortalTerms(page, ['exact identity', 'trust and reachability', 'project/Vault topology', 'currentness receipt']);
    await closeTransient(page); return evidence;
  });
  await action(page, 'remote-project-route', async () => {
    await openSettings(page, 'projects', 'project-sync'); await selectManagerTab(page, 'project-sync-tab', 'remote', 'projectSyncTab', '#workspace-project-sync');
    return { route: 'projects/project-sync', tab: 'remote' };
  });
  for (const [id, actionId, payload] of [['remote-add-preview', 'add-ssh-remote', {}], ['remote-test-preview', 'test-ssh-remote', { id: 'nas' }], ['remote-toggle-preview', 'toggle-ssh-remote', { id: 'nas' }]]) {
    await action(page, id, async () => {
      const before = await page.evaluate(() => JSON.stringify(window.PM12_KIMI.getState().projectSync.remotes));
      await dispatchSettingsAction(page, actionId, payload); await hold(page, 80);
      const after = await page.evaluate(() => JSON.stringify(window.PM12_KIMI.getState().projectSync.remotes));
      need(before === after, `${actionId} mutated the concept fixture`); const text = await portalText(page); await closeTransient(page);
      return { action_id: actionId, state_unchanged: true, preview_text: text.slice(0, 1200), production_mutation: 'not_performed' };
    });
  }
  await action(page, 'remote-move-migration-preview', async () => {
    await selectManagerTab(page, 'project-sync-tab', 'move', 'projectSyncTab', '#workspace-project-sync');
    await dispatchSettingsAction(page, 'move-project'); await hold(page, 80);
    const text = await portalText(page); need(/rollback|authority/i.test(text), 'Project route migration preview omitted authority/rollback boundary', text);
    await closeTransient(page); return { preview_text: text.slice(0, 1600), production_mutation: 'not_performed' };
  });
  await action(page, 'remote-continuity-preview', async () => { await dispatchSettingsAction(page, 'test-project-sync'); const evidence = await requirePortalTerms(page, ['continuity', 'owner']); await closeTransient(page); return evidence; });
  await action(page, 'continuity-identity-reconnect-restart-sleep-route-migration', () => page.evaluate(() => {
    const transitions = ['reconnect', 'restart', 'sleep', 'route-migration', 'external-return'];
    const result = window.PM7_PERFORMANCE_TEST_API.probeIdentityContinuity(transitions), expected = ['operation_id', 'session_id', 'stream_id', 'upload_id'];
    if (!result.simulation_only || !expected.every(key => result.preserved.includes(key)) || result.requested.join('|') !== transitions.join('|')) throw new Error('Concept continuity probe did not preserve all identities');
    return { ...result, production_runtime: 'not_executed', native_certification: false };
  }));
  finishChapter();
}

async function finalBackupRestoreChapter(page) {
  await beginChapter(page, 'backup-restore', 'Full Server Backup, Vault scope, verification/quarantine, and restore modes');
  await action(page, 'backup-server-catalog-boundary', async () => {
    await openSettings(page, 'system', 'servers'); await selectManagerTab(page, 'server-tab', 'backup', 'serverTab', '#workspace-servers');
    const text = await page.locator('#workspace-servers').innerText();
    for (const term of ['Server Catalog', 'verification', 'crash-safe restore']) need(text.includes(term), `Server backup projection omitted ${term}`, text);
    return { requested_mode: 'full_server_catalog', availability: 'owner_unavailable_concept_preview', visible_boundary: text.slice(0, 2200), owner_feed: 'not_attached' };
  });
  await action(page, 'backup-selected-vaults-boundary', async () => {
    const text = await page.locator('#workspace-servers').innerText(); need(text.includes('selected or all Vault consistency'), 'Selected-Vault backup boundary is absent', text);
    return { requested_mode: 'selected_vaults', availability: 'owner_unavailable_concept_preview', control_exercised: 'server_backup_scope_boundary', production_backup: 'not_performed' };
  });
  await action(page, 'backup-all-vaults-boundary', async () => {
    const text = await page.locator('#workspace-servers').innerText(); need(text.includes('selected or all Vault consistency'), 'All-Vault backup boundary is absent', text);
    return { requested_mode: 'all_vaults', availability: 'owner_unavailable_concept_preview', control_exercised: 'server_backup_scope_boundary', production_backup: 'not_performed' };
  });
  await openSettings(page, 'system', 'backup');
  await action(page, 'backup-full-server-preview', async () => { await dispatchSettingsAction(page, 'run-backup'); const result = await requirePortalTerms(page, ['Full Server', 'Project and Vault consistency', 'No production receipt']); await closeTransient(page); return result; });
  await action(page, 'backup-verification-preview', async () => { await dispatchSettingsAction(page, 'verify-latest-backup'); const result = await requirePortalTerms(page, ['manifest', 'signatures', 'hashes', 'terminal verification receipt', 'No production receipt']); await closeTransient(page); return result; });
  await action(page, 'backup-test-restore-preview', async () => { await dispatchSettingsAction(page, 'verify-latest-backup'); const result = await requirePortalTerms(page, ['isolated restore test', 'compatibility', 'No production receipt']); await closeTransient(page); return result; });
  await action(page, 'backup-quarantine-boundary', () => page.evaluate(() => {
    const model = window.PM7_SYSTEMS_INTEGRATION.doctor_fixture_model();
    const visible = document.documentElement.innerHTML.includes('Verify, quarantine, test restore, selective restore');
    const row = model.scenarios.flatMap(item => item.rows || []).find(item => /quarantine/i.test(JSON.stringify(item))) || null;
    if (!visible && !row) throw new Error('Backup quarantine boundary is absent from the concept projection');
    return { quarantine_projection_present: true, production_quarantine: 'not_performed', row };
  }));
  const restorePreview = async (scope, destination) => {
    await openSettings(page, 'system', 'backup'); await selectManagerTab(page, 'backup-tab', 'restore', 'backupTab', '#workspace-backup');
    await dispatchSettingsAction(page, 'start-restore'); await page.waitForSelector('#pm-settings-portals select[name="scope"]');
    await page.locator('#pm-settings-portals select[name="scope"]').selectOption({ label: scope });
    await page.locator('#pm-settings-portals input[name="destination"]').fill(destination);
    await page.getByRole('button', { name: 'Review preview', exact: true }).click({ force: true });
    const result = await requirePortalTerms(page, [scope, destination, 'safety backup', 'Switch or roll back', 'No owner receipt', 'No data changed']);
    await closeTransient(page); return result;
  };
  await action(page, 'restore-full-preview', () => restorePreview('Full Server', 'Isolated verification location'));
  await action(page, 'restore-project-vault-preview', () => restorePreview('Project and Vault metadata', 'Isolated verification location'));
  await action(page, 'restore-selective-preview', () => restorePreview('Selected data families', 'Isolated verification location'));
  await action(page, 'restore-replacement-preview', () => restorePreview('Full Server', 'Replacement server staging'));
  for (const [id, tab] of [['backup-destinations', 'destinations'], ['backup-schedules', 'schedules'], ['backup-retention', 'retention'], ['backup-history', 'history']]) {
    await action(page, id, async () => { await selectManagerTab(page, 'backup-tab', tab, 'backupTab', '#workspace-backup'); return { tab, controls: await page.locator('#workspace-backup button').count() }; });
  }
  await action(page, 'backup-coverage-boundary', async () => {
    await selectManagerTab(page, 'backup-tab', 'overview', 'backupTab', '#workspace-backup'); await dispatchSettingsAction(page, 'view-backup-coverage');
    const result = await requirePortalTerms(page, ['Portable secrets require', 'Owner feed not attached', 'not a current backup projection']); await closeTransient(page); return result;
  });
  finishChapter();
}

async function finalConsumersChapter(page) {
  await beginChapter(page, 'browser-capture-scm', 'Browser/testing/capture, SCM/Origin, Named Plans, and performance projections');
  await openSettings(page, 'source', 'browser-scm');
  await action(page, 'systems-browser', async () => { await selectManagerTab(page, 'browser-scm-tab', 'browser', 'browserScmTab', '#workspace-browser-scm'); return { tab: 'browser' }; });
  await action(page, 'browser-program-boundary', () => page.evaluate(() => {
    const row = window.PM7_BROWSER_PROGRAM;
    if (!row?.projection_only || row.runtime_state !== 'runtime_unavailable' || row.auth_browser_session !== 'excluded' || row.execution_methods !== 0) throw new Error('Browser/AuthBrowser boundary drifted');
    return row;
  }));
  await action(page, 'systems-capture', async () => { await selectManagerTab(page, 'browser-scm-tab', 'capture', 'browserScmTab', '#workspace-browser-scm'); return { tab: 'capture' }; });
  await action(page, 'capture-policy', async () => { await dispatchSettingsAction(page, 'open-capture-policy'); const result = await requirePortalTerms(page, ['explicit', 'bounded', 'redacted', 'AuthBrowserSession', 'Never captured', 'Native certification']); await closeTransient(page); return result; });
  await action(page, 'systems-scm', async () => { await selectManagerTab(page, 'browser-scm-tab', 'scm', 'browserScmTab', '#workspace-browser-scm'); return { tab: 'scm' }; });
  await action(page, 'scm-owner-route', async () => {
    const text = await page.locator('#workspace-browser-scm').innerText();
    for (const term of ['Git', 'Jujutsu', 'GitHub', 'GitLab', 'Azure DevOps', 'Bitbucket']) need(text.includes(term), `SCM owner projection omitted ${term}`);
    await page.locator('#workspace-browser-scm [data-action="navigate"][data-domain="source"][data-workspace="source-manager"]').click();
    await page.waitForFunction(() => window.PM12_KIMI.getState().workspace === 'source-manager'); return { route: 'source/source-manager' };
  });
  await openSettings(page, 'source', 'browser-scm');
  await action(page, 'systems-origin', async () => { await selectManagerTab(page, 'browser-scm-tab', 'origin', 'browserScmTab', '#workspace-browser-scm'); return { tab: 'origin' }; });
  await action(page, 'origin-preview', async () => { await dispatchSettingsAction(page, 'preview-origin'); const result = await requirePortalTerms(page, ['Preview only', 'Optional', 'Local history', 'Preserved', 'Not created', 'No production receipt']); await closeTransient(page); return result; });
  await action(page, 'systems-plans', async () => { await selectManagerTab(page, 'browser-scm-tab', 'plans', 'browserScmTab', '#workspace-browser-scm'); return { tab: 'plans' }; });
  await action(page, 'named-plan-inspect', async () => { await dispatchSettingsAction(page, 'open-named-plan'); const result = await requirePortalTerms(page, ['Named Plan System', 'Owner feed', 'Not attached', 'Mutation', 'Unavailable']); await closeTransient(page); return result; });
  await action(page, 'systems-performance', async () => { await selectManagerTab(page, 'browser-scm-tab', 'performance', 'browserScmTab', '#workspace-browser-scm'); return { tab: 'performance' }; });
  await action(page, 'performance-evidence', async () => { await dispatchSettingsAction(page, 'open-performance-evidence'); const result = await requirePortalTerms(page, ['P50, P95, P99', '16.7 ms', 'Native certification', 'Separate execution required']); await closeTransient(page); return result; });
  await action(page, 'performance-dedup-stale-generation', () => page.evaluate(() => {
    const row = window.PM7_PERFORMANCE_TEST_API.probeDedupStaleGeneration();
    if (!row.simulation_only || !row.coalesced || !row.stale_generation_rejected || !row.operation_id_preserved) throw new Error('Dedup/stale-generation concept probe failed'); return row;
  }));
  await action(page, 'performance-admission-before-hydration', () => page.evaluate(() => {
    const row = window.PM7_PERFORMANCE_TEST_API.probeAdmissionBeforeHydration();
    if (!row.simulation_only || !row.auth_checked_before_hydration || !row.rate_checked_before_hydration || row.rejected_hydration_count !== 0) throw new Error('Admission-before-hydration concept probe failed'); return row;
  }));
  await action(page, 'systems-plugins', async () => {
    await openSettings(page, 'code', 'toolchain');
    await page.evaluate(() => {
      window.PM12_KIMI.dispatchAction('tool-tab', { tab: 'plugins' });
      window.PM12_KIMI.dispatchAction('tool-detail-tab', { kind: 'plugins', tab: 'overview' });
    });
    await page.waitForFunction(() => {
      const state = window.PM12_KIMI?.getState?.();
      return state?.toolTab === 'plugins' && state?.toolDetailTab?.plugins === 'overview'
        && document.querySelector('[data-plugin-owner-projection="true"]')?.dataset.productionRuntimeState === 'unavailable';
    });
    const row = await page.evaluate(() => ({
      commands: window.PM7_PLUGIN_COMMANDS?.map(item => item.id).sort() || [],
      owner_projection: document.querySelector('[data-plugin-owner-projection="true"]')?.dataset.productionRuntimeState || null,
      route: [window.PM12_KIMI.getState().domain, window.PM12_KIMI.getState().workspace],
      tab: window.PM12_KIMI.getState().toolDetailTab?.plugins || null
    }));
    need(row.commands.length === 12 && row.owner_projection === 'unavailable', 'Plugins owner projection or exact command census is absent', row);
    return row;
  });
  await action(page, 'plugins-progressive-tabs', async () => {
    const rows = [];
    for (const tab of ['overview', 'updates', 'access', 'evidence']) {
      await page.evaluate(selected => window.PM12_KIMI.dispatchAction('tool-detail-tab', { kind: 'plugins', tab: selected }), tab);
      await page.waitForFunction(selected => window.PM12_KIMI.getState().toolDetailTab?.plugins === selected
        && document.querySelector('.manager-tab.active[data-action="tool-detail-tab"]')?.dataset.tab === selected, tab);
      rows.push(await page.evaluate(() => ({
        tab: window.PM12_KIMI.getState().toolDetailTab?.plugins,
        controls: document.querySelectorAll('[data-command-id^="cmd.agent_plugin."]').length,
        projection: document.querySelector('[data-plugin-owner-projection="true"]')?.dataset.productionRuntimeState || null
      })));
      await hold(page, 180);
    }
    need(rows.every(row => row.controls > 0 && row.projection === 'unavailable'), 'A Plugins progressive tab lost its truthful owner projection', rows);
    return rows;
  });
  await action(page, 'plugins-unavailable-command', async () => {
    const before = await page.evaluate(() => JSON.stringify({
      plugins: window.PM12_KIMI.getState().toolchain?.plugins || null,
      selected: window.PM12_KIMI.getState().selectedTool?.plugins || null
    }));
    const control = page.locator('[data-command-id="cmd.agent_plugin.open_logs"]').first();
    await control.focus();
    await page.keyboard.press('Enter');
    const explanation = await requirePortalTerms(page, ['cmd.agent_plugin.open_logs', 'handler_unavailable', 'No native Plugins System handler is attached', 'EventRecord not emitted', 'Not dispatched']);
    const after = await page.evaluate(() => JSON.stringify({
      plugins: window.PM12_KIMI.getState().toolchain?.plugins || null,
      selected: window.PM12_KIMI.getState().selectedTool?.plugins || null
    }));
    need(before === after, 'Unavailable Plugins command mutated the concept fixture', { before, after });
    await closeTransient(page);
    return { ...explanation, state_unchanged: true, production_mutation: 'not_performed' };
  });
  await action(page, 'plugins-doctor-route', async () => {
    await openSettings(page, 'system', 'doctor');
    const before = await page.evaluate(() => ({
      checked_at: window.PM12_KIMI.getState().doctorCheckedAt || null,
      receipt: window.PM12_KIMI.getState().doctorReturnReceipt || null,
      plugins: window.PM12_KIMI.getState().toolchain?.plugins || null
    }));
    await page.locator('[data-check-id="doctor.plugin.conformance"]').click();
    await page.waitForFunction(() => {
      const state = window.PM12_KIMI.getState();
      return state.domain === 'code' && state.workspace === 'toolchain' && state.toolTab === 'plugins';
    });
    const after = await page.evaluate(() => {
      const state = window.PM12_KIMI.getState();
      return {
        route: [state.domain, state.workspace],
        tool_tab: state.toolTab,
        detail_tab: state.toolDetailTab?.plugins || null,
        context: state.doctorReturnContext || null,
        checked_at: state.doctorCheckedAt || null,
        receipt: state.doctorReturnReceipt || null,
        plugins: state.toolchain?.plugins || null,
        owner_projection: document.querySelector('[data-plugin-owner-projection="true"]')?.dataset.productionRuntimeState || null
      };
    });
    need(after.route.join('/') === 'code/toolchain' && after.tool_tab === 'plugins' && after.context?.checkId === 'doctor.plugin.conformance'
      && after.context?.ownerActionId?.startsWith('cmd.agent_plugin.') && after.context?.productionMutationDispatched === false
      && after.owner_projection === 'unavailable' && before.checked_at === after.checked_at
      && JSON.stringify(before.receipt) === JSON.stringify(after.receipt) && JSON.stringify(before.plugins) === JSON.stringify(after.plugins),
    'Doctor Plugins route changed owner state or lost exact return context', { before, after });
    return { before, after, production_mutation: 'not_performed' };
  });
  finishChapter();
}

async function finalDoctorChapter(page) {
  await beginChapter(page, 'doctor-remediation-return', 'Doctor cached projection, scoped recheck, owner remediation, and exact return');
  await action(page, 'doctor-open', () => openSettings(page, 'system', 'doctor'));
  await action(page, 'doctor-project-scope', () => page.locator('[data-action="doctor-scope"][data-scope="project"]').click());
  await action(page, 'doctor-recheck', async () => {
    await page.locator('[data-action="doctor-check-scope"]').click(); await page.waitForFunction(() => !window.PM12_KIMI.getState().doctorChecking, null, { timeout: 10000 });
    return { checked_at: await page.evaluate(() => window.PM12_KIMI.getState().doctorCheckedAt) };
  });
  await action(page, 'doctor-detail', async () => { await page.locator('[data-doctor-item="source-control"] [data-action="doctor-item-details"]').click(); return requirePortalTerms(page, ['Native runtime', 'Unavailable', 'Production owner feed', 'Not attached']); });
  await action(page, 'doctor-detail-close', () => closeTransient(page));
  await action(page, 'doctor-remediation-route', async () => {
    await page.locator('[data-doctor-item="source-control"] [data-action="doctor-open-owner"]').click();
    const state = await page.evaluate(() => window.PM12_KIMI.getState());
    need(state.workspace === 'browser-scm' && state.doctorReturnContext?.ownerActionId === 'cmd.source_control.status.refresh', 'Doctor did not preserve exact owner-command return context', state.doctorReturnContext);
    return { route: [state.domain, state.workspace], context: state.doctorReturnContext, production_mutation: 'not_performed' };
  });
  await action(page, 'doctor-exact-return', async () => {
    const response = await page.evaluate(() => {
      const ctx = window.PM12_KIMI.getState().doctorReturnContext;
      const request = { checkId: ctx.checkId, findingId: ctx.findingId, findingRevision: ctx.findingRevision, targetId: ctx.targetId,
        ownerActionId: ctx.ownerActionId, typedOwnerRouteId: ctx.typedOwnerRouteId, idempotencyKey: ctx.idempotencyKey,
        ownerResultRef: 'browser-concept-owner-result:capture', normalizedStatus: 'needs_attention', outcome: 'succeeded',
        baseOwnerGeneration: ctx.expectedOwnerGeneration, baseCacheGeneration: ctx.expectedCacheGeneration,
        ownerGeneration: ctx.expectedOwnerGeneration + 1, cacheGeneration: ctx.expectedCacheGeneration + 1, freshnessState: 'fresh' };
      const bridge = window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(request);
      return { bridge, receipt: window.PM12_KIMI.getState().doctorReturnReceipt };
    });
    await page.waitForFunction(() => window.PM12_KIMI.getState().workspace === 'doctor');
    need(response.receipt?.returnAccepted === true && response.receipt?.remediationResolved === false && response.receipt?.productionRuntimeState === 'unavailable', 'Doctor exact return was not accepted truthfully', response);
    return response;
  });
  await action(page, 'doctor-typed-owner-route', async () => {
    await page.locator('[data-doctor-item="project-authority"] [data-action="doctor-open-owner"]').click();
    await page.waitForFunction(() => {
      const state = window.PM12_KIMI.getState();
      return state.domain === 'projects' && state.workspace === 'project-sync';
    });
    const routed = await page.evaluate(() => ({
      route: [window.PM12_KIMI.getState().domain, window.PM12_KIMI.getState().workspace],
      context: window.PM12_KIMI.getState().doctorReturnContext || null
    }));
    need(routed.context?.remediationMode === 'typed_owner_route' && routed.context?.ownerActionId === null
      && routed.context?.typedOwnerRouteId === 'projects/project-sync' && routed.context?.routeOnlyConceptPreview === true
      && routed.context?.productionMutationDispatched === false, 'Doctor typed owner route lost its exact non-command boundary', routed);
    const returned = await page.evaluate(context => {
      window.PM7_SYSTEMS_INTEGRATION.return_to_doctor({
        checkId: context.checkId, findingId: context.findingId, findingRevision: context.findingRevision,
        targetId: context.targetId, ownerActionId: '', typedOwnerRouteId: context.typedOwnerRouteId,
        idempotencyKey: context.idempotencyKey, ownerResultRef: 'owner-result:project-authority:capture-blocked',
        normalizedStatus: 'blocked', outcome: 'succeeded', baseOwnerGeneration: context.expectedOwnerGeneration,
        baseCacheGeneration: context.expectedCacheGeneration, ownerGeneration: context.expectedOwnerGeneration + 1,
        cacheGeneration: context.expectedCacheGeneration + 1, freshnessState: 'fresh'
      });
      return { bridge: true };
    }, routed.context);
    await page.waitForFunction(() => window.PM12_KIMI.getState().workspace === 'doctor'
      && document.activeElement?.id === 'doctor-remediation-project-authority');
    const receipt = await page.evaluate(() => window.PM12_KIMI.getState().doctorReturnReceipt);
    need(receipt?.returnAccepted === true && receipt?.remediationResolved === false && receipt?.normalizedStatus === 'blocked'
      && receipt?.typedOwnerRouteId === 'projects/project-sync' && receipt?.ownerActionId === null
      && receipt?.productionMutationDispatched === false && receipt?.productionRuntimeState === 'unavailable',
    'Doctor typed owner route return was falsely promoted or lost its exact identity', { routed, returned, receipt });
    return { routed, returned, receipt };
  });
  await action(page, 'doctor-unavailable-remediation-boundary', async () => {
    await page.locator('[data-action="doctor-scope"][data-scope="integrations"]').click();
    const row = await page.locator('[data-doctor-item="auth-browser"] [data-action="doctor-open-owner"]').evaluate(node => ({ disabled: node.disabled || node.getAttribute('aria-disabled') === 'true', reason: node.dataset.disabledReason, mode: node.dataset.remediationMode, runtime: node.closest('[data-doctor-item]')?.dataset.productionRuntimeState }));
    need(row.disabled && row.mode === 'unavailable' && row.reason === 'human_only_policy_has_no_doctor_remediation' && row.runtime === 'unavailable', 'AuthBrowser Doctor remediation did not fail closed', row); return row;
  });
  finishChapter();
}

async function finalOnboardingChapter(page) {
  await beginChapter(page, 'onboarding', 'Simple cinematic onboarding, all branches, interruption, reversal, theme, resize, and completion');
  await action(page, 'onboarding-replay', () => page.evaluate(() => {
    if (!window.PM7_ONBOARDING_CINEMATIC) throw new Error('onboarding API unavailable');
    const api = window.PM7_ONBOARDING_CINEMATIC;
    api.setOwnerProjectionAdapter(null);
    return api.replay({ provider: true, origin: true });
  }), { holdMs: 1500 });
  await action(page, 'onboarding-start', async () => { await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click(); await waitOnboarding(page, { stage: 'simple_path' }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); }, { holdMs: 520 });
  await action(page, 'onboarding-other-options', async () => { await page.locator('[data-ui-action-id="ui.onboarding.more_ways"]:visible').click(); await waitOnboarding(page, { stage: 'simple_path', other_options: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  const previewBranch = async path => {
    await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.replay());
    await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click(); await waitOnboarding(page, { stage: 'simple_path' });
    if (path !== 'setup') await page.locator('[data-ui-action-id="ui.onboarding.more_ways"]:visible').click();
    await page.locator(`[data-ui-action-id="ui.onboarding.choose_simple_path"][data-path="${path}"]`).click(); await waitOnboarding(page, { stage: 'automatic_preparation', path });
    const snapshot = await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot());
    await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.back()); await waitOnboarding(page, { stage: 'simple_path', path }); return snapshot;
  };
  await action(page, 'onboarding-connect-branch', () => previewBranch('connect'));
  await action(page, 'onboarding-server-branch', () => previewBranch('server'));
  await action(page, 'onboarding-restore-branch', () => previewBranch('restore'));
  await action(page, 'onboarding-reverse', async () => {
    await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.replay()); await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click(); await waitOnboarding(page, { stage: 'simple_path' });
    await page.locator('[data-ui-action-id="ui.onboarding.more_ways"]:visible').click(); await page.locator('[data-ui-action-id="ui.onboarding.choose_simple_path"][data-path="restore"]').click(); await waitOnboarding(page, { stage: 'automatic_preparation', path: 'restore' });
    await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.back()); await waitOnboarding(page, { stage: 'simple_path', path: 'restore' }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot());
  }, { holdMs: 520 });
  await action(page, 'onboarding-preparation-failed', async () => {
    await page.evaluate(() => {
      const api = window.PM7_ONBOARDING_CINEMATIC;
      api.replay({ provider: true, origin: true });
      window.__pm7FinalCapturePreparationAdapter = api.conceptFixtures.createOwnerProjectionAdapter([
        { work_state: 'failed', progress_kind: 'none', human_phase: 'The setup owner could not complete this attempt', can_retry: true },
        { work_state: 'ready', progress_kind: 'none', human_phase: 'The setup owner reports this path is ready' }
      ]);
      if (!api.setOwnerProjectionAdapter(window.__pm7FinalCapturePreparationAdapter)) throw new Error('Onboarding owner-projection adapter was rejected');
    });
    await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click();
    await waitOnboarding(page, { stage: 'simple_path' });
    await page.locator('[data-ui-action-id="ui.onboarding.choose_simple_path"][data-path="setup"]').click();
    await waitOnboarding(page, { stage: 'automatic_preparation', path: 'setup' });
    const result = await page.evaluate(() => ({ state: window.PM7_ONBOARDING_CINEMATIC.snapshot(), adapter: window.__pm7FinalCapturePreparationAdapter.stats() }));
    need(result.state.automatic_preparation_projection?.work_state === 'failed' && result.state.automatic_preparation_projection?.can_retry === true && result.adapter.observe_calls === 1, 'Onboarding did not render the accepted retryable owner failure', result);
    return result;
  }, { holdMs: 520 });
  await action(page, 'onboarding-preparation-retry', async () => {
    const immediate = await page.evaluate(() => {
      const control = document.querySelector('#pm7-onboarding [data-preparation-action="retry"]');
      if (!control) throw new Error('Onboarding retry control unavailable');
      control.click();
      return { state: window.PM7_ONBOARDING_CINEMATIC.snapshot(), adapter: window.__pm7FinalCapturePreparationAdapter.stats() };
    });
    need(immediate.state.screen === 'preparing' && immediate.state.automatic_preparation_projection?.work_state === 'ready' && immediate.adapter.retry_calls === 1, 'Onboarding retry did not observe the same owner operation to ready', immediate);
    await waitOnboarding(page, { stage: 'first_project', path: 'setup' });
    const settled = await page.evaluate(() => ({ state: window.PM7_ONBOARDING_CINEMATIC.snapshot(), adapter: window.__pm7FinalCapturePreparationAdapter.stats() }));
    need(settled.adapter.fences.length === 2 && settled.adapter.fences[0].owner_operation_id === settled.adapter.fences[1].owner_operation_id && settled.adapter.fences[0].dedupe_key === settled.adapter.fences[1].dedupe_key, 'Onboarding retry duplicated or changed owner work identity', settled);
    return { immediate, settled };
  }, { holdMs: 520 });
  await action(page, 'onboarding-theme-during-transition', async () => {
    await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.replay()); await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click(); await setTheme(page, 'glass-light');
    await waitOnboarding(page, { stage: 'simple_path', open: true }); await hold(page, 520);
    const snapshot = await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); need(snapshot.motion === 'idle', 'Onboarding theme switch left a stale transition', snapshot); return snapshot;
  });
  await action(page, 'onboarding-resize-during-transition', async () => {
    await page.locator('[data-ui-action-id="ui.onboarding.choose_simple_path"][data-path="setup"]').click(); await setCaptureViewport(page, 520, 760);
    await waitOnboarding(page, { stage: 'automatic_preparation', open: true }); const box = await page.locator('#pm7-onboarding .pm7ob-card').boundingBox(); need(box && box.x >= 0 && box.width <= 520, 'Onboarding did not remain resize-safe', box);
    await setCaptureViewport(page, 1440, 900); return { resize_safe: true, narrow_box: box };
  });
  await action(page, 'onboarding-simple-path', async () => {
    await page.evaluate(() => {
      const api = window.PM7_ONBOARDING_CINEMATIC;
      api.replay({ provider: true, origin: true });
      window.__pm7FinalCapturePreparationAdapter = api.conceptFixtures.createOwnerProjectionAdapter([
        { work_state: 'pending', progress_kind: 'indeterminate', human_phase: 'Waiting for the setup owner' }
      ]);
      if (!api.setOwnerProjectionAdapter(window.__pm7FinalCapturePreparationAdapter)) throw new Error('Onboarding owner-projection adapter was rejected');
    }); await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click(); await waitOnboarding(page, { stage: 'simple_path' });
    await page.locator('[data-ui-action-id="ui.onboarding.choose_simple_path"][data-path="setup"]').click(); await waitOnboarding(page, { stage: 'automatic_preparation', path: 'setup' }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot());
  });
  await action(page, 'onboarding-prepare', async () => {
    const running = await page.evaluate(() => {
      const api = window.PM7_ONBOARDING_CINEMATIC;
      const projection = api.conceptFixtures.projection({ work_state: 'running', progress_kind: 'steps', completed_units: 2, total_units: 5, progress_source: 'measured', human_phase: 'The setup owner reports two of five checks' });
      return { projection, acceptance: api.acceptAutomaticPreparationProjection(projection), state: api.snapshot() };
    });
    need(running.acceptance.accepted === true && running.state.screen === 'preparing' && running.state.automatic_preparation_projection?.work_state === 'running' && running.projection.production_owner_work === false && running.projection.production_readiness === false, 'Onboarding measured owner projection was not accepted truthfully', running);
    await hold(page, 420);
    const ready = await page.evaluate(() => {
      const api = window.PM7_ONBOARDING_CINEMATIC;
      const projection = api.conceptFixtures.projection({ work_state: 'ready', progress_kind: 'none', human_phase: 'The setup owner reports this path is ready' });
      return { projection, acceptance: api.acceptAutomaticPreparationProjection(projection), state: api.snapshot() };
    });
    need(ready.acceptance.accepted === true && ready.state.screen === 'preparing' && ready.state.automatic_preparation_projection?.work_state === 'ready' && ready.projection.production_receipt_ref === null, 'Onboarding ready projection was falsely promoted or did not remain presentation-only', ready);
    await hold(page, 100);
    await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.settleAutomaticPreparationPresentation());
    await waitOnboarding(page, { stage: 'first_project', path: 'setup' });
    return { running, ready, settled: await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()) };
  });
  await action(page, 'onboarding-project-options', async () => { await page.locator('[data-ui-action-id="ui.onboarding.more_ways"][data-scope="project"]').click(); await waitOnboarding(page, { stage: 'first_project', project_options: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-provider-route', async () => { await page.locator('[data-ui-action-id="ui.onboarding.open_owner_flow"][data-owner-flow="provider"]').click(); await waitOnboarding(page, { stage: 'first_project', provider_route_opened: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-origin-route', async () => { await page.locator('[data-ui-action-id="ui.onboarding.open_owner_flow"][data-owner-flow="origin_preview"]').click(); await waitOnboarding(page, { stage: 'first_project', origin_preview_opened: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-interrupt', async () => { await page.locator('[data-ui-action-id="ui.onboarding.close"]:visible').click(); await waitOnboarding(page, { open: false, suspended: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-resume', async () => { await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.resume()); await waitOnboarding(page, { open: true, stage: 'first_project' }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-project', async () => { await page.locator('[data-ui-action-id="ui.onboarding.choose_first_project"].pm7ob-primary').click(); await waitOnboarding(page, { stage: 'ready' }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); }, { holdMs: 720 });
  await action(page, 'onboarding-tour-skip', async () => { await page.locator('[data-ui-action-id="ui.onboarding.finish"][data-start-tour="false"]').click(); await waitOnboarding(page, { open: false, completed: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  finishChapter();
}

async function finalOnboardingMotionChapter(page) {
  await beginChapter(page, 'onboarding-retro-reduced', 'Retro stepped choreography and Reduced Motion equivalence');
  await action(page, 'onboarding-retro-theme', () => setTheme(page, 'retro-dark'));
  await action(page, 'onboarding-retro-hero', async () => { await page.evaluate(() => { const api = window.PM7_ONBOARDING_CINEMATIC; api.setOwnerProjectionAdapter(null); return api.replay(); }); await waitOnboarding(page, { stage: 'welcome', open: true, reduced_motion: false }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); }, { holdMs: 1500 });
  await action(page, 'onboarding-retro-step', async () => { await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click(); await waitOnboarding(page, { stage: 'simple_path' }); await page.locator('[data-ui-action-id="ui.onboarding.choose_simple_path"][data-path="setup"]').click(); await waitOnboarding(page, { stage: 'automatic_preparation', path: 'setup' }); await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.back()); await waitOnboarding(page, { stage: 'simple_path', path: 'setup' }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); }, { holdMs: 520 });
  await action(page, 'onboarding-retro-skip', async () => { await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.skip()); await waitOnboarding(page, { open: false, skipped: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-reduced-enable', () => page.evaluate(() => { document.documentElement.setAttribute('data-motion', 'reduced'); return { motion: document.documentElement.dataset.motion }; }));
  await action(page, 'onboarding-reduced-path', async () => { await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.replay()); await waitOnboarding(page, { stage: 'welcome', open: true, reduced_motion: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-reduced-transition', async () => { await page.locator('#pm7-onboarding [data-ui-action-id="ui.onboarding.start"]:visible').click(); await waitOnboarding(page, { stage: 'simple_path', reduced_motion: true }); await page.locator('[data-ui-action-id="ui.onboarding.choose_simple_path"][data-path="setup"]').click(); await waitOnboarding(page, { stage: 'automatic_preparation', path: 'setup', reduced_motion: true }); await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.back()); await waitOnboarding(page, { stage: 'simple_path', path: 'setup', reduced_motion: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); }, { holdMs: 220 });
  await action(page, 'onboarding-reduced-skip', async () => { await page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.skip()); await waitOnboarding(page, { open: false, skipped: true }); return page.evaluate(() => window.PM7_ONBOARDING_CINEMATIC.snapshot()); });
  await action(page, 'onboarding-motion-restore', async () => { await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'full')); await setTheme(page, 'friendly-dark'); return { motion: await page.evaluate(() => document.documentElement.dataset.motion), theme: await page.evaluate(() => document.documentElement.dataset.theme) }; });
  finishChapter();
}

async function finalGuidedTourChapter(page) {
  await beginChapter(page, 'guided-tour', 'Deterministic local teacher, owner actions, widgets, interruption, reversal, and Planning Wizard handoff');
  await action(page, 'tour-start', () => page.evaluate(() => { if (!window.PM7_GUIDED_TOUR) throw new Error('guided tour API unavailable'); return window.PM7_GUIDED_TOUR.start({ source: 'capture-campaign' }); }), { holdMs: 560 });
  await action(page, 'tour-eli5', () => page.evaluate(() => window.PM7_GUIDED_TOUR.next()));
  for (const [id, command] of [['tour-panel-undock', 'cmd.panel.undock'], ['tour-panel-redock', 'cmd.panel.redock'], ['tour-panel-move', 'cmd.workspace_layout.move_surface'], ['tour-panel-resize', 'cmd.workspace_layout.resize_surface']]) {
    await action(page, id, () => page.evaluate(commandId => {
      const row = window.PM7_GUIDED_TOUR.target_adapter.perform(commandId);
      if (!['applied', 'no_change'].includes(row.status) || !row.owner_receipt) throw new Error(`Guided Tour owner action failed: ${commandId}`);
      return row;
    }, command), { holdMs: 220 });
  }
  await action(page, 'tour-widget-watch', () => page.evaluate(() => { window.PM7_GUIDED_TOUR.replay({ source: 'capture-widget', step: 'widget_workspace', recapture: false }); return window.PM7_GUIDED_TOUR.next(); }));
  for (const [id, command] of [['tour-widget-add', 'cmd.widget.add'], ['tour-widget-move', 'cmd.widget.move'], ['tour-widget-resize', 'cmd.widget.resize']]) {
    await action(page, id, () => page.evaluate(commandId => { const row = window.PM7_GUIDED_TOUR.target_adapter.perform(commandId); if (!['applied', 'no_change'].includes(row.status)) throw new Error(`Guided Tour widget action failed: ${commandId}`); return row; }, command));
  }
  await action(page, 'tour-interrupt-resume', async () => { await page.keyboard.press('Escape'); await hold(page, 180); const paused = await page.evaluate(() => window.PM7_GUIDED_TOUR.snapshot()); const resumed = await page.evaluate(() => window.PM7_GUIDED_TOUR.resume()); need(paused.status === 'paused' && resumed.open, 'Guided Tour pause/resume failed', { paused, resumed }); return { paused, resumed }; });
  await action(page, 'tour-reversal', () => page.evaluate(() => { const before = window.PM7_GUIDED_TOUR.snapshot(); const after = window.PM7_GUIDED_TOUR.back(); if (after.phase > before.phase) throw new Error('Guided Tour reversal advanced instead of reversing'); return { before, after }; }));
  await action(page, 'tour-planning-handoff', async () => { await page.evaluate(() => window.PM7_GUIDED_TOUR.replay({ source: 'capture-handoff', step: 'planning_wizard', recapture: false })); await page.locator('[data-ui-action-id="ui.guided_tour.restore_layout"]').click(); await page.waitForFunction(() => document.getElementById('panel-wizard')?.classList.contains('active')); return page.evaluate(() => window.PM7_GUIDED_TOUR.snapshot()); });
  await action(page, 'tour-retro-step', async () => {
    await setTheme(page, 'retro-dark');
    await page.evaluate(() => window.PM7_GUIDED_TOUR.replay({ source: 'capture-retro-motion' }));
    await page.locator('[data-ui-action-id="ui.guided_tour.next"]').click();
    const row = await page.evaluate(() => {
      const callout = document.querySelector('#pm7-guided-tour .pm7gt-callout'), style = getComputedStyle(callout);
      return { theme: document.documentElement.dataset.theme, animation_name: style.animationName, animation_duration: style.animationDuration, border_radius: style.borderRadius };
    });
    need(row.theme === 'retro-dark' && row.animation_name === 'pm7gt-retro-forward' && row.animation_duration === '0.14s' && row.border_radius === '0px', 'Guided Tour Retro motion lost its stepped no-scale treatment', row);
    return row;
  }, { holdMs: 280 });
  await action(page, 'tour-reduced-step', async () => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-motion', 'reduced');
      window.PM7_GUIDED_TOUR.replay({ source: 'capture-reduced-motion' });
    });
    await page.locator('[data-ui-action-id="ui.guided_tour.next"]').click();
    const row = await page.evaluate(() => {
      const root = document.getElementById('pm7-guided-tour'), callout = root.querySelector('.pm7gt-callout'), halo = root.querySelector('.pm7gt-halo'), control = root.querySelector('button');
      return { state: window.PM7_GUIDED_TOUR.snapshot(), callout_animation: getComputedStyle(callout).animationDuration, halo_transition: getComputedStyle(halo).transitionDuration, control_transition: getComputedStyle(control).transitionDuration };
    });
    need(row.state.reduced_motion && row.callout_animation === '0s' && row.halo_transition.split(',').every(value => value.trim() === '0s') && row.control_transition.split(',').every(value => value.trim() === '0s'), 'Guided Tour Reduced Motion retained choreography', row);
    return row;
  }, { holdMs: 120 });
  await action(page, 'tour-motion-restore', async () => {
    const skipped = await page.evaluate(() => {
      const result = window.PM7_GUIDED_TOUR.skip();
      document.documentElement.setAttribute('data-motion', 'full');
      return result;
    });
    await setTheme(page, 'friendly-dark');
    return { skipped, motion: await page.evaluate(() => document.documentElement.dataset.motion), theme: await page.evaluate(() => document.documentElement.dataset.theme) };
  });
  finishChapter();
}

async function finalHoverChapter(page) {
  await beginChapter(page, 'hover-tags', 'Global hover census, pointer/focus timing, dynamic state, collision, zoom, Glass, Retro, and reduced motion');
  await action(page, 'hover-census', () => page.evaluate(async () => { const census = await window.PM_HOVER_TAG_CONTROLLER.settle(document); if (!census.pass) throw new Error(`Global hover census failed with ${census.failures.length} findings`); return census.counts; }));
  await action(page, 'hover-fixture-bind', () => page.evaluate(async () => {
    document.getElementById('pm7-capture-hover-fixture')?.remove();
    const root = document.createElement('section'); root.id = 'pm7-capture-hover-fixture'; root.setAttribute('aria-label', 'Final campaign hover fixture'); root.style.cssText = 'position:fixed;inset:0;z-index:2147482500;pointer-events:none';
    root.innerHTML = '<button id="pm7ch-pin" title="Pin item" aria-pressed="false">Pin</button><button id="pm7ch-detail" data-pm-hover-label="Provider route" data-pm-hover-detail="Anthropic account · ready">Route</button><button id="pm7ch-disabled" disabled title="Unavailable export">Export</button><button id="pm7ch-tl" aria-label="Top left anchor">TL</button><button id="pm7ch-br" aria-label="Bottom right anchor">BR</button><div id="pm7ch-blank" data-pm-hover-exempt="decorative" aria-hidden="true"></div>';
    const positions = { 'pm7ch-pin':'left:80px;top:90px', 'pm7ch-detail':'left:210px;top:90px', 'pm7ch-disabled':'left:360px;top:90px', 'pm7ch-tl':'left:1px;top:1px', 'pm7ch-br':'right:1px;bottom:1px', 'pm7ch-blank':'left:50%;top:50%;width:40px;height:40px' };
    for (const [id, css] of Object.entries(positions)) { const node = root.querySelector('#' + id); node.style.cssText = `position:absolute;pointer-events:auto;${css}`; }
    root.querySelector('#pm7ch-pin').addEventListener('click', event => event.currentTarget.setAttribute('aria-pressed', event.currentTarget.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'));
    document.body.appendChild(root); const census = await window.PM_HOVER_TAG_CONTROLLER.settle(root); if (!census.pass) throw new Error('Hover campaign fixture failed binding census'); return census.counts;
  }));
  await action(page, 'hover-pointer-enter', async () => { await page.locator('#pm7ch-pin').hover(); return page.evaluate(() => ({ open: document.getElementById('pm-hover-tag-visual').dataset.open, label: document.querySelector('#pm-hover-tag-visual strong').textContent })); }, { holdMs: 300 });
  await action(page, 'hover-grace-exit', () => page.evaluate(() => {
    const anchor = document.getElementById('pm7ch-detail'), blank = document.getElementById('pm7ch-blank'), tag = document.getElementById('pm-hover-tag-visual'), ctl = window.PM_HOVER_TAG_CONTROLLER;
    ctl.open(anchor, 'pointer'); anchor.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, relatedTarget: blank }));
    return new Promise((resolve, reject) => { const samples = {}; setTimeout(() => { samples.at_100ms = tag.dataset.open; }, 100); setTimeout(() => { samples.at_190ms = tag.dataset.open; if (samples.at_100ms !== 'true' || samples.at_190ms !== 'false') reject(new Error('160ms departure grace drifted')); else resolve(samples); }, 190); });
  }));
  await action(page, 'hover-pointer-reentry', () => page.evaluate(() => {
    const anchor = document.getElementById('pm7ch-pin'), blank = document.getElementById('pm7ch-blank'), ctl = window.PM_HOVER_TAG_CONTROLLER;
    ctl.open(anchor, 'pointer'); anchor.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, relatedTarget: blank }));
    return new Promise((resolve, reject) => { setTimeout(() => anchor.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, relatedTarget: blank })), 100); setTimeout(() => { const row = { open: document.getElementById('pm-hover-tag-visual').dataset.open, key: ctl.activeModel?.key }; if (row.open !== 'true') reject(new Error('Pointer reentry did not cancel departure')); else resolve(row); }, 190); });
  }));
  await action(page, 'hover-anchor-transfer', () => page.evaluate(() => {
    const from = document.getElementById('pm7ch-pin'), to = document.getElementById('pm7ch-detail'), ctl = window.PM_HOVER_TAG_CONTROLLER;
    ctl.open(from, 'pointer'); from.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, relatedTarget: to })); to.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, relatedTarget: from })); ctl.refresh(to);
    const label = document.querySelector('#pm-hover-tag-visual strong').textContent; if (label !== 'Provider route') throw new Error('A-to-B hover transfer retained stale text'); return { label };
  }));
  await action(page, 'hover-keyboard-focus', async () => { await page.locator('#pm7ch-disabled').focus(); const row = await page.evaluate(() => ({ active: document.activeElement.id, open: document.getElementById('pm-hover-tag-visual').dataset.open })); need(row.active === 'pm7ch-disabled' && row.open === 'true', 'Keyboard focus did not open disabled-control hover tag', row); return row; });
  await action(page, 'hover-escape', async () => { await page.keyboard.press('Escape'); const row = await page.evaluate(() => ({ open: document.getElementById('pm-hover-tag-visual').dataset.open })); need(row.open === 'false', 'Escape did not close hover tag', row); return row; });
  await action(page, 'hover-dynamic-pin', () => page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, anchor = document.getElementById('pm7ch-pin'), rows = [];
    for (let index = 0; index < 3; index += 1) { ctl.open(anchor, 'focus'); ctl.refresh(anchor); rows.push({ pressed: anchor.getAttribute('aria-pressed'), label: ctl.activeModel?.primary }); if (index < 2) anchor.click(); }
    if (!rows[0].label.startsWith('Pin') || !rows[1].label.startsWith('Unpin') || !rows[2].label.startsWith('Pin')) throw new Error('Dynamic pin/unpin copy did not refresh'); return rows;
  }));
  await action(page, 'hover-disabled-reason', () => page.evaluate(() => {
    const node = document.getElementById('pm7ch-disabled'), row = { native_disabled: node.disabled, aria_disabled: node.getAttribute('aria-disabled'), tab_index: node.tabIndex, reason: document.getElementById(node.getAttribute('aria-describedby'))?.textContent };
    if (row.native_disabled || row.aria_disabled !== 'true' || row.tab_index < 0 || !row.reason) throw new Error('Disabled hover target is inaccessible'); return row;
  }));
  await action(page, 'hover-collision-clamp', async () => {
    const rows = [];
    for (const id of ['pm7ch-tl', 'pm7ch-br']) { await page.locator('#' + id).hover(); rows.push(await page.evaluate(() => { window.PM_HOVER_TAG_CONTROLLER.position(); const r = document.getElementById('pm-hover-tag-visual').getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: innerWidth, height: innerHeight, placement: document.getElementById('pm-hover-tag-visual').dataset.placement }; })); }
    need(rows.every(row => row.left >= 7.5 && row.top >= 7.5 && row.right <= row.width - 7.5 && row.bottom <= row.height - 7.5), 'Hover collision clamp escaped the viewport', rows); return rows;
  });
  await action(page, 'hover-rapid-traversal', () => page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, ids = ['pm7ch-pin', 'pm7ch-detail', 'pm7ch-disabled', 'pm7ch-tl', 'pm7ch-br'];
    for (let pass = 0; pass < 4; pass += 1) for (const id of ids) ctl.open(document.getElementById(id), 'pointer');
    const row = { active: ctl.activeModel?.key, expected: document.getElementById('pm7ch-br').dataset.pmHoverKey, open: document.getElementById('pm-hover-tag-visual').dataset.open };
    if (row.active !== row.expected || row.open !== 'true') throw new Error('Rapid hover traversal left stale state'); return row;
  }));
  await action(page, 'hover-zoom-reposition', () => page.evaluate(() => {
    document.body.style.zoom = '1.25'; const ctl = window.PM_HOVER_TAG_CONTROLLER; ctl.open(document.getElementById('pm7ch-br'), 'focus'); ctl.position(); const r = document.getElementById('pm-hover-tag-visual').getBoundingClientRect();
    const row = { css_zoom_probe: 1.25, left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: innerWidth, height: innerHeight, inside: r.left >= 7.5 && r.top >= 7.5 && r.right <= innerWidth - 7.5 && r.bottom <= innerHeight - 7.5 };
    document.body.style.zoom = ''; ctl.position(); if (!row.inside) throw new Error('Hover tag escaped viewport under the bounded Chrome CSS zoom probe'); return row;
  }));
  await action(page, 'hover-glass-transparency', () => page.evaluate(() => {
    const ctl = window.PM_HOVER_TAG_CONTROLLER, html = document.documentElement, anchor = document.getElementById('pm7ch-detail');
    html.dataset.theme = 'glass-dark'; html.style.setProperty('--glass-alpha', '.35'); ctl.open(anchor, 'focus'); const low = getComputedStyle(document.getElementById('pm-hover-tag-visual')).backgroundColor;
    html.style.setProperty('--glass-alpha', '.88'); const high = getComputedStyle(document.getElementById('pm-hover-tag-visual')).backgroundColor; if (low === high) throw new Error('Glass hover paint ignored live transparency'); return { low, high };
  }));
  await action(page, 'hover-retro', async () => { await setTheme(page, 'retro-dark'); await page.locator('#pm7ch-detail').hover(); return page.evaluate(() => ({ transition: getComputedStyle(document.getElementById('pm-hover-tag-visual')).transitionDuration, theme: document.documentElement.dataset.theme })); }, { holdMs: 220 });
  await action(page, 'hover-reduced', async () => { await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'reduced')); await page.locator('#pm7ch-detail').focus(); return page.evaluate(() => ({ duration: getComputedStyle(document.getElementById('pm-hover-tag-visual')).transitionDuration, reduced: window.PM_HOVER_TAG_CONTROLLER.reduced })); }, { holdMs: 120 });
  await action(page, 'hover-fixture-cleanup', () => page.evaluate(async () => {
    window.PM_HOVER_TAG_CONTROLLER.close(true); document.getElementById('pm7-capture-hover-fixture')?.remove(); document.documentElement.setAttribute('data-motion', 'full'); document.documentElement.style.removeProperty('--glass-alpha'); document.documentElement.dataset.theme = 'friendly-dark';
    const census = await window.PM_HOVER_TAG_CONTROLLER.settle(document); if (!census.pass) throw new Error('Global hover census failed after fixture cleanup'); return census.counts;
  }));
  finishChapter();
}

async function finalUsageMotionChapter(page) {
  await beginChapter(page, 'usage-ats039-motion', 'ATS-039 Usage drag, reorder, resize, reflow, cancellation, transaction, menu/context, and theme motion');
  const usageSnapshot = () => page.evaluate(() => {
    const api = window.PM7_USAGE, board = document.getElementById('pm7uBoard');
    const cards = [...(board?.querySelectorAll('.pm7u-card') || [])];
    return {
      order: cards.map(card => card.dataset.widget),
      layouts: cards.map(card => ({ id: card.dataset.widget, cols: Number(card.dataset.cols), rows: Number(card.dataset.rows) })),
      commands: api?.command_log?.length ?? -1, receipts: api?.receipt_log?.length ?? -1,
      events: api?.event_log?.length ?? -1, body_pointer_op: document.body.classList.contains('pm7u-pointer-op'),
      ghosts: document.querySelectorAll('body > .pm7u-ghost').length,
      reorder_placeholders: board?.querySelectorAll('.pm7u-reorder-placeholder').length ?? -1,
      resize_placeholders: board?.querySelectorAll('.pm7u-resize-placeholder').length ?? -1
    };
  });
  const firstDrag = () => page.locator('#pm7uBoard .pm7u-card .pm7u-drag').first();
  const firstResize = () => page.locator('#pm7uBoard .pm7u-card .pm7u-resize').first();
  const pointerMove = async (selector, dx, dy, commit = true) => {
    const handle = selector(), box = await handle.boundingBox(); need(box, 'Usage motion handle is not visible');
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx, y + dy, { steps: 10 }); await hold(page, 240);
    if (commit) await page.mouse.up(); else await page.keyboard.press('Escape');
    await hold(page, 260); return usageSnapshot();
  };
  await action(page, 'usage-open-settle', async () => {
    await page.evaluate(() => { window.PM_PAGES.go('usage'); window.PM7_USAGE?.rerender?.(); });
    await page.waitForFunction(() => document.getElementById('panel-usage')?.classList.contains('active') && document.querySelectorAll('#pm7uBoard .pm7u-card').length >= 3);
    const row = await usageSnapshot(); need(row.order.length >= 3 && row.commands >= 0 && row.receipts >= 0, 'Usage owner did not settle', row); return row;
  }, { holdMs: 420 });
  await action(page, 'usage-keyboard-reorder-commit', async () => {
    const before = await usageSnapshot(), handle = firstDrag(); await handle.focus();
    await page.keyboard.press('Enter'); await page.keyboard.press('ArrowRight'); await hold(page, 220); await page.keyboard.press('Enter'); await hold(page, 260);
    const after = await usageSnapshot(); need(JSON.stringify(after.order) !== JSON.stringify(before.order) && after.receipts === before.receipts + 1, 'Usage keyboard reorder did not settle exactly once', { before, after }); return { before, after };
  });
  await action(page, 'usage-keyboard-reorder-cancel', async () => {
    const before = await usageSnapshot(), handle = firstDrag(); await handle.focus();
    await page.keyboard.press('Enter'); await page.keyboard.press('ArrowRight'); await hold(page, 180); await page.keyboard.press('Escape'); await hold(page, 220);
    const after = await usageSnapshot(); need(JSON.stringify(after.order) === JSON.stringify(before.order) && after.receipts === before.receipts, 'Usage keyboard reorder cancellation mutated owner state', { before, after }); return { before, after };
  });
  await action(page, 'usage-pointer-reorder-preview-commit', async () => {
    const before = await usageSnapshot(), cards = page.locator('#pm7uBoard .pm7u-card');
    const targetBox = await cards.nth(1).boundingBox(); need(targetBox, 'Usage reorder target is unavailable');
    const handle = firstDrag(), box = await handle.boundingBox(); need(box, 'Usage reorder handle is unavailable');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width * .8, targetBox.y + targetBox.height * .75, { steps: 12 }); await hold(page, 280);
    const preview = await usageSnapshot(); need(preview.ghosts === 1 && preview.reorder_placeholders === 1, 'Usage pointer reorder preview did not paint its ghost and placeholder', preview);
    await page.mouse.up(); await hold(page, 300); const after = await usageSnapshot();
    need(JSON.stringify(after.order) !== JSON.stringify(before.order) && after.receipts === before.receipts + 1, 'Usage pointer reorder did not settle exactly once', { before, preview, after }); return { before, preview, after };
  });
  await action(page, 'usage-pointer-reorder-cancel', async () => {
    const before = await usageSnapshot(), preview = await pointerMove(firstDrag, 160, 120, false), after = await usageSnapshot();
    need(JSON.stringify(after.order) === JSON.stringify(before.order) && after.receipts === before.receipts && !after.body_pointer_op && !after.ghosts && !after.reorder_placeholders, 'Usage pointer reorder cancellation leaked or mutated', { before, preview, after }); return { before, preview, after };
  });
  await action(page, 'usage-keyboard-resize-commit', async () => {
    const before = await usageSnapshot(), handle = firstResize(); await handle.focus(); await page.keyboard.press('ArrowRight'); await hold(page, 300); const after = await usageSnapshot();
    need(JSON.stringify(after.layouts) !== JSON.stringify(before.layouts) && after.receipts === before.receipts + 1, 'Usage keyboard resize did not settle exactly once', { before, after }); return { before, after };
  });
  await action(page, 'usage-pointer-resize-live-preview-commit', async () => {
    const before = await usageSnapshot(); const handle = firstResize(), box = await handle.boundingBox(); need(box, 'Usage resize handle unavailable');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 45, { steps: 12 }); await hold(page, 280);
    const preview = await usageSnapshot(); need(preview.body_pointer_op && preview.resize_placeholders === 1, 'Usage live resize preview did not retain the transaction surface', preview);
    await page.mouse.up(); await hold(page, 320); const after = await usageSnapshot(); need(after.receipts === before.receipts + 1 && !after.body_pointer_op && !after.resize_placeholders, 'Usage pointer resize did not settle exactly once and cleanly', { before, preview, after }); return { before, preview, after };
  });
  await action(page, 'usage-pointer-resize-cancel', async () => {
    const before = await usageSnapshot(); await pointerMove(firstResize, -90, 45, false); const after = await usageSnapshot();
    need(JSON.stringify(after.layouts) === JSON.stringify(before.layouts) && after.receipts === before.receipts && !after.body_pointer_op && !after.resize_placeholders, 'Usage pointer resize cancellation mutated or leaked', { before, after }); return { before, after };
  });
  await action(page, 'usage-pointer-resize-owner-rejection', async () => page.evaluate(() => {
    const api = window.PM7_USAGE, card = document.querySelector('#pm7uBoard .pm7u-card'), item = api.widgetById(card.dataset.widget), before = api.layoutFor(item), prior = api.receipt_log.length;
    const reject = event => event.preventDefault(); window.addEventListener('pm:command-dispatch', reject, { capture:true, once:true });
    const preset = api.sizePresets(item).find(row => row.cols !== before.cols || row.rows !== before.rows); if (!preset) throw new Error('No Usage resize preset for owner rejection');
    const result = api.setLayout(item, preset.cols, preset.rows, 'cmd.widget.resize', 'capture-owner-rejection'), receipt = api.receipt_log.at(-1);
    if (result.cols !== before.cols || result.rows !== before.rows || api.receipt_log.length !== prior + 1 || receipt?.status !== 'rejected' || receipt?.result?.reason !== 'owner_rejected') throw new Error('Usage owner rejection did not roll back truthfully');
    return { before, result, receipt };
  }));
  await action(page, 'usage-pointer-resize-adapter-failure', async () => page.evaluate(() => {
    const api = window.PM7_USAGE, card = document.querySelector('#pm7uBoard .pm7u-card'), item = api.widgetById(card.dataset.widget), before = api.layoutFor(item), prior = api.receipt_log.length;
    const preset = api.sizePresets(item).find(row => row.cols !== before.cols || row.rows !== before.rows); if (!preset) throw new Error('No Usage resize preset for adapter failure');
    const original = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error('capture adapter failure'); };
    let result; try { result = api.setLayout(item, preset.cols, preset.rows, 'cmd.widget.resize', 'capture-adapter-failure'); } finally { Storage.prototype.setItem = original; }
    const receipt = api.receipt_log.at(-1); if (result.cols !== before.cols || result.rows !== before.rows || api.receipt_log.length !== prior + 1 || receipt?.status !== 'failed' || receipt?.result?.reason !== 'usage_workspace_write_failed') throw new Error('Usage adapter failure did not roll back truthfully');
    return { before, result, receipt };
  }));
  await action(page, 'usage-responsive-reflow', async () => {
    await setCaptureViewport(page, 760, 900); await hold(page, 320); const narrow = await page.locator('#pm7uBoard').evaluate(node => ({ client: node.clientWidth, scroll: node.scrollWidth, cards: node.querySelectorAll('.pm7u-card').length }));
    await setCaptureViewport(page, 1440, 900); await hold(page, 320); const wide = await page.locator('#pm7uBoard').evaluate(node => ({ client: node.clientWidth, scroll: node.scrollWidth, cards: node.querySelectorAll('.pm7u-card').length }));
    need(narrow.cards === wide.cards && narrow.scroll <= narrow.client && wide.scroll <= wide.client, 'Usage responsive reflow overflowed or remounted its census', { narrow, wide }); return { narrow, wide };
  });
  await action(page, 'usage-menu-drawer-context', async () => {
    await page.locator('#pm7uBoard .pm7u-card .pm7u-cardmenu').first().click(); await hold(page, 160);
    const menu = await page.evaluate(() => ({ open: document.getElementById('pm7uCardPop')?.classList.contains('open'), rows: document.querySelectorAll('#pm7uCardPop button').length })); need(menu.open && menu.rows, 'Usage card menu did not open', menu); await page.keyboard.press('Escape');
    await page.locator('#pm7UsageApp .pm7u-navbtn[data-room="context"]').click(); await hold(page, 220);
    const context = await page.evaluate(() => ({ room: document.getElementById('pm7UsageApp')?.dataset.room, context_cards: document.querySelectorAll('#pm7uBoard .pm7u-card[data-widget*="context"],#pm7uBoard .pm7u-card[data-widget*="ctx"]').length }));
    need(context.room === 'context' && context.context_cards > 0, 'Usage Context room did not become the visible owner projection', context);
    const drawerSeed = await page.evaluate(() => {
      const trigger = document.querySelector('.context-usage');
      if (!trigger || !window.PM7_CONTEXT?.openDetails) throw new Error('Chat context drawer owner is unavailable');
      window.PM7_CONTEXT.openDetails(trigger);
      const drawer = document.querySelector('.pm7ctx-drawer.open');
      return { open: Boolean(drawer), aria_hidden: drawer?.getAttribute('aria-hidden'), tab: drawer?.dataset.tab };
    });
    need(drawerSeed.open && drawerSeed.aria_hidden === 'false' && drawerSeed.tab === 'curated', 'Context details drawer did not open in its curated state', drawerSeed);
    await hold(page, 340); await page.locator('.pm7ctx-drawer.open [data-pm7ctx-tab="raw"]').click(); await hold(page, 180);
    const drawer = await page.evaluate(() => ({ open: Boolean(document.querySelector('.pm7ctx-drawer.open')), tab: document.querySelector('.pm7ctx-drawer.open')?.dataset.tab }));
    need(drawer.open && drawer.tab === 'raw', 'Context details drawer did not preserve its open/raw state', drawer);
    await page.locator('.pm7ctx-drawer.open [data-pm7ctx-close]').click(); await page.locator('#pm7UsageApp .pm7u-navbtn[data-room="overview"]').click();
    return { menu, context, drawer_seed: drawerSeed, drawer };
  });
  await action(page, 'usage-theme-transition', async () => { await setTheme(page, 'glass-dark'); await hold(page, 240); await setTheme(page, 'retro-dark'); await hold(page, 240); await setTheme(page, 'friendly-dark'); return page.evaluate(() => ({ theme: document.documentElement.dataset.theme, cards: document.querySelectorAll('#pm7uBoard .pm7u-card').length })); });
  await action(page, 'usage-cleanup-invariants', async () => {
    const row = await usageSnapshot(); need(!row.body_pointer_op && !row.ghosts && !row.reorder_placeholders && !row.resize_placeholders, 'Usage motion chapter leaked transient state', row); return row;
  });
  finishChapter();
}

async function finalHomeChapter(page) {
  await beginChapter(page, 'home-t48-motion', 'Dedicated T48/Home open, float, redock, resize, reduced-motion, and reset choreography');
  await action(page, 'home-open', async () => { await page.locator('#tab-dashboard').click(); await page.waitForFunction(() => document.getElementById('panel-dashboard')?.classList.contains('active')); return page.evaluate(() => ({ schema: window.PM_HOME_WORKSPACE.schema_id, layout: window.PM_HOME_WORKSPACE.layout.layout_version })); });
  await action(page, 'home-panel-open-animation', () => page.evaluate(() => { const result = window.PM_HOME_WORKSPACE.openPanel('editor_panel_3'), surface = window.PM_HOME_WORKSPACE.layout.surfaces.find(row => row.surface_instance_id === 'editor_panel_3'); if (!surface?.visible) throw new Error('T48 panel open failed'); return { result, surface }; }), { holdMs: 420 });
  await action(page, 'home-panel-float-animation', () => page.evaluate(() => { const result = window.PM_HOME_WORKSPACE.popOutPanel('editor_panel_3'), surface = window.PM_HOME_WORKSPACE.layout.surfaces.find(row => row.surface_instance_id === 'editor_panel_3'); if (surface?.host !== 'floating') throw new Error('T48 panel float failed'); return { result, surface }; }), { holdMs: 420 });
  await action(page, 'home-panel-redock-animation', () => page.evaluate(() => { const result = window.PM_HOME_WORKSPACE.moveSurface('editor_panel_3', 'home_main'), surface = window.PM_HOME_WORKSPACE.layout.surfaces.find(row => row.surface_instance_id === 'editor_panel_3'); if (surface?.host !== 'home_main') throw new Error('T48 panel redock failed'); return { result, surface }; }), { holdMs: 420 });
  await action(page, 'home-chat-float-redock-animation', async () => {
    const floated = await page.evaluate(() => { window.PM_HOME_WORKSPACE.popOutChat(); return window.PM_HOME_WORKSPACE.layout.surfaces.find(row => row.surface_instance_id === 'chat'); }); need(floated?.host === 'floating', 'T48 Chat float failed', floated); await hold(page, 340);
    const redocked = await page.evaluate(() => { window.PM_HOME_WORKSPACE.moveSurface('chat', 'dock_right'); return window.PM_HOME_WORKSPACE.layout.surfaces.find(row => row.surface_instance_id === 'chat'); }); need(redocked?.host === 'dock_right', 'T48 Chat redock failed', redocked); return { floated, redocked };
  }, { holdMs: 420 });
  await action(page, 'home-layout-resize-animation', async () => {
    const handle = page.locator('[data-pm-home-resizer]:visible').first(), box = await handle.boundingBox(); need(box, 'No visible T48 resize handle');
    const before = await page.evaluate(() => window.PM_HOME_WORKSPACE.command_log.length); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 48, box.y + box.height / 2 + 20, { steps: 8 }); await page.mouse.up(); await hold(page, 260);
    const after = await page.evaluate(() => ({ count: window.PM_HOME_WORKSPACE.command_log.length, command: window.PM_HOME_WORKSPACE.command_log.at(-1)?.command_id || null })); need(after.count > before && after.command === 'cmd.workspace_layout.resize_surface', 'T48 resize did not emit the canonical command', { before, after }); return after;
  }, { holdMs: 360 });
  await action(page, 'home-reduced-motion-boundary', () => page.evaluate(() => {
    document.documentElement.dataset.motion = 'reduced'; window.PM_HOME_WORKSPACE.openPanel('editor_panel_4'); const element = document.querySelector('[data-pm-home-surface="editor_panel_4"]'), style = element ? getComputedStyle(element) : null;
    const row = { animation_duration: style?.animationDuration || null, transition_duration: style?.transitionDuration || null, motion: document.documentElement.dataset.motion }; if (row.motion !== 'reduced') throw new Error('T48 reduced-motion state did not apply'); document.documentElement.dataset.motion = 'full'; return row;
  }), { holdMs: 120 });
  await action(page, 'home-layout-reset-animation', () => page.evaluate(() => {
    const result = window.PM_HOME_WORKSPACE.reset(), layout = window.PM_HOME_WORKSPACE.layout;
    if (layout.validation?.status !== 'valid' || layout.surfaces.some(row => row.host === 'floating')) throw new Error('T48 layout reset did not restore a valid nonfloating layout');
    return { result, validation: layout.validation, floating: layout.surfaces.filter(row => row.host === 'floating') };
  }), { holdMs: 420 });
  finishChapter();
}

async function finalResponsiveChapter(page) {
  await beginChapter(page, 'responsive-matrix', 'Every required physical width with K3 body/document overflow and visibility assertions');
  await openSettings(page, 'system', 'doctor');
  for (const width of REQUIRED_WIDTHS) {
    await action(page, `resize-${width}`, async () => {
      await setCaptureViewport(page, width, 900); await page.evaluate(() => window.PM7_SYSTEMS_INTEGRATION.sync_host()); await hold(page, 80);
      const row = await page.evaluate(expectedWidth => { const root = document.getElementById('pm-settings-root'), rect = root?.getBoundingClientRect(); return { width: expectedWidth, root_visible: Boolean(rect && rect.width > 0 && rect.height > 0), root_width: rect?.width || null, document_client: document.documentElement.clientWidth, document_scroll: document.documentElement.scrollWidth, body_client: document.body.clientWidth, body_scroll: document.body.scrollWidth }; }, width);
      need(row.root_visible && row.document_scroll <= row.document_client && row.body_scroll <= row.body_client, `Responsive K3 overflow or visibility failure at ${width}px`, row); return row;
    }, { holdMs: 240 });
  }
  finishChapter(); await setCaptureViewport(page, 1440, 900);
}

async function runFinal(page) {
  const contract = finalContractInventory(); need(contract.valid, 'Final campaign contract is incomplete', contract);
  report.scenarios.push(...FINAL_CAMPAIGN_CONTRACT.map(row => ({ id: row.id, intent: `Consolidated browser-concept evidence for ${row.capabilities.join(', ')}.`, capabilities: row.capabilities, required_action_ids: row.actions, evidence_boundary: 'Browser concept only; no production owner mutation or native Slint/runtime certification.' })));
  const boundary = await page.evaluate(() => ({
    settings: window.PM7_SETTINGS_COMMANDS?.schema_id || null,
    systems_simulation_only: window.PM7_SYSTEMS_INTEGRATION?.simulation_only,
    performance_simulation_only: window.PM7_PERFORMANCE_TEST_API?.concept_simulation_only,
    onboarding_simulation_only: window.PM7_ONBOARDING_CINEMATIC?.concept_simulation_only,
    guided_tour_simulation_only: window.PM7_GUIDED_TOUR?.concept_simulation_only,
    home: window.PM_HOME_WORKSPACE?.schema_id || null,
    hover_controller: Boolean(window.PM_HOVER_TAG_CONTROLLER),
    hover_slint_projection: window.PM_HOVER_TAG_CONTROLLER?.slint_projection?.schema_id || null
  }));
  need(boundary.settings === 'pm.settings.command_bridge.v1' && boundary.systems_simulation_only === true && boundary.performance_simulation_only === true && boundary.onboarding_simulation_only === true && boundary.guided_tour_simulation_only === true && Boolean(boundary.home) && boundary.hover_controller === true && boundary.hover_slint_projection === 'pm.hover_tag.slint_projection.v1', 'Final campaign APIs or truthful simulation boundaries are unavailable', boundary);
  report.api_boundary = boundary;
  await finalThemesChapter(page);
  await finalSettingsTransactionsChapter(page);
  await finalSettingsPreferencesChapter(page);
  await finalServerRemoteChapter(page);
  await finalBackupRestoreChapter(page);
  await finalConsumersChapter(page);
  await finalDoctorChapter(page);
  await finalOnboardingChapter(page);
  await finalOnboardingMotionChapter(page);
  await finalGuidedTourChapter(page);
  await finalHoverChapter(page);
  await finalUsageMotionChapter(page);
  await finalHomeChapter(page);
  await finalResponsiveChapter(page);
  const chapterIds = report.chapters.map(row => row.id), actionIds = report.actions.map(row => row.id), requiredChapterIds = FINAL_CAMPAIGN_CONTRACT.map(row => row.id), requiredActionIds = FINAL_CAMPAIGN_CONTRACT.flatMap(row => row.actions);
  report.coverage_summary = { complete: JSON.stringify(chapterIds) === JSON.stringify(requiredChapterIds) && requiredActionIds.every(id => actionIds.includes(id)) && report.actions.every(row => row.disposition === 'captured'), chapter_count: chapterIds.length, action_count: actionIds.length, required_chapter_count: requiredChapterIds.length, required_action_count: requiredActionIds.length, missing_chapters: requiredChapterIds.filter(id => !chapterIds.includes(id)), missing_actions: requiredActionIds.filter(id => !actionIds.includes(id)), failed_actions: report.actions.filter(row => row.disposition !== 'captured').map(row => row.id), blocked_native_controls: report.actions.filter(row => row.result?.production_runtime === 'not_executed' || row.result?.production_mutation === 'not_performed' || row.result?.production_backup === 'not_performed' || row.result?.native_execution === 'not_performed' || row.result?.owner_feed === 'not_attached' || String(row.result?.availability || '').startsWith('owner_unavailable')).map(row => row.id), evidence_boundary: report.evidence_boundary };
  need(report.coverage_summary.complete, 'Final campaign aggregate coverage is incomplete', report.coverage_summary);
}

function pngSize(bytes) {
  if (bytes.length < 24 || bytes.toString('ascii', 1, 4) !== 'PNG') return { width: null, height: null };
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
function shellQuoteForConcat(path) { return path.replace(/'/g, "'\\''"); }
function findExecutable(name) {
  if (args[name] && existsSync(args[name])) return args[name];
  const found = spawnSync('sh', ['-c', `command -v ${name}`], { encoding: 'utf8' });
  return found.status === 0 ? found.stdout.trim() : null;
}
function mediaEnvironment() {
  if (!args['ffmpeg-library-path']) return process.env;
  const prior = process.env.LD_LIBRARY_PATH || '';
  return { ...process.env, LD_LIBRARY_PATH: prior ? `${args['ffmpeg-library-path']}:${prior}` : args['ffmpeg-library-path'] };
}
function makeMedia(frameRows) {
  const ffmpeg = findExecutable('ffmpeg');
  const ffprobe = findExecutable('ffprobe');
  const mediaEnv = mediaEnvironment();
  report.media.ffmpeg = ffmpeg || null;
  if (!ffmpeg) {
    report.media.disposition = 'frames_only_ffmpeg_unavailable';
    report.media.residual = 'Lossless PNG source frames are retained. FFV1/MKV and review MP4 were not encoded because ffmpeg is unavailable.';
    return;
  }
  if (!frameRows.length) {
    report.media.disposition = 'no_frames';
    return;
  }
  const versionRun = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8', env: mediaEnv });
  const encoderRun = spawnSync(ffmpeg, ['-hide_banner', '-encoders'], { encoding: 'utf8', env: mediaEnv });
  const supportsFfv1 = encoderRun.status === 0 && /\bffv1\b/.test(encoderRun.stdout || '');
  report.media.encoder_identity = {
    sha256: existsSync(ffmpeg) ? hashFile(ffmpeg) : null,
    version_first_line: (versionRun.stdout || versionRun.stderr || '').split(/\r?\n/)[0] || null,
    ffv1_supported: supportsFfv1
  };
  if (!supportsFfv1) {
    report.media.disposition = 'ffv1_encoder_unavailable';
    report.media.residual = 'The selected encoder did not advertise FFV1; source PNG frames remain authoritative and no substitute codec was promoted.';
    return;
  }
  const concatPath = join(outdir, 'delivered-frames.ffconcat');
  const lines = ['ffconcat version 1.0'];
  for (let i = 0; i < frameRows.length; i += 1) {
    const row = frameRows[i], next = frameRows[i + 1];
    const durationMs = next ? Math.max(.001, (next.cdp_timestamp_s - row.cdp_timestamp_s) * 1000) : targetInterval;
    lines.push(`file '${shellQuoteForConcat(resolve(outdir, row.path))}'`);
    lines.push(`duration ${(durationMs / 1000).toFixed(6)}`);
  }
  writeFileSync(concatPath, lines.join('\n') + '\n');
  const maxWidth = Math.max(...frameRows.map(row => row.width || 1));
  const maxHeight = Math.max(...frameRows.map(row => row.height || 1));
  const evenWidth = maxWidth + (maxWidth % 2), evenHeight = maxHeight + (maxHeight % 2);
  const pad = `pad=${evenWidth}:${evenHeight}:(ow-iw)/2:(oh-ih)/2:color=black`;
  const master = join(outdir, 'pmconcept7-final-campaign-ffv1.mkv');
  const review = join(outdir, 'pmconcept7-final-campaign-review.mp4');
  const common = ['-y', '-hide_banner', '-loglevel', 'error', '-safe', '0', '-f', 'concat', '-i', concatPath, '-vf', pad, '-fps_mode', 'vfr'];
  const masterRun = spawnSync(ffmpeg, [...common, '-c:v', 'ffv1', '-level', '3', master], { encoding: 'utf8', env: mediaEnv });
  report.media.ffv1_master = {
    path: basename(master), success: masterRun.status === 0,
    sha256: masterRun.status === 0 && existsSync(master) ? hashFile(master) : null,
    bytes: masterRun.status === 0 && existsSync(master) ? statSync(master).size : null,
    stderr: masterRun.stderr?.slice(0, 3000) || ''
  };
  const reviewRun = spawnSync(ffmpeg, [...common, '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', review], { encoding: 'utf8', env: mediaEnv });
  report.media.review_mp4 = {
    path: basename(review), success: reviewRun.status === 0,
    sha256: reviewRun.status === 0 && existsSync(review) ? hashFile(review) : null,
    bytes: reviewRun.status === 0 && existsSync(review) ? statSync(review).size : null,
    derivative_timing_note: 'Variable-timing review derivative made from delivered source frames; not a source FPS claim.',
    stderr: reviewRun.stderr?.slice(0, 3000) || ''
  };
  if (masterRun.status === 0) {
    const probeArgs = ['-v', 'error', '-show_entries', 'format=format_name,duration,size:stream=index,codec_name,codec_long_name,pix_fmt,width,height', '-of', 'json', master];
    if (ffprobe) {
      const probeRun = spawnSync(ffprobe, probeArgs, { encoding: 'utf8', env: mediaEnv });
      let parsed = null;
      try { parsed = probeRun.status === 0 ? JSON.parse(probeRun.stdout) : null; } catch (_error) {}
      report.media.ffv1_master.probe = {
        ffprobe, ffprobe_sha256: existsSync(ffprobe) ? hashFile(ffprobe) : null,
        success: probeRun.status === 0, result: parsed,
        stderr: probeRun.stderr?.slice(0, 3000) || ''
      };
    } else {
      const probeRun = spawnSync(ffmpeg, ['-hide_banner', '-i', master, '-f', 'null', '-'], { encoding: 'utf8', env: mediaEnv });
      report.media.ffv1_master.probe = {
        ffprobe: null, success: probeRun.status === 0,
        fallback: 'ffmpeg decode/probe', stderr: probeRun.stderr?.slice(0, 5000) || ''
      };
    }
  }
  const probeProvesFfv1 = report.media.ffv1_master.probe?.success && (
    report.media.ffv1_master.probe?.result?.streams?.some(stream => stream.codec_name === 'ffv1')
    || /Video:\s*ffv1\b/.test(report.media.ffv1_master.probe?.stderr || '')
  );
  report.media.ffv1_master.probe_proves_ffv1 = Boolean(probeProvesFfv1);
  report.media.disposition = masterRun.status === 0 && reviewRun.status === 0 && probeProvesFfv1 ? 'encoded' : 'encode_or_probe_failed';
}

async function finalizeCapturedEvidence() {
  await Promise.allSettled(pendingWrites);
  for (const row of frames) {
    const path = join(outdir, row.path);
    if (!existsSync(path)) continue;
    const bytes = readFileSync(path);
    row.sha256 = createHash('sha256').update(bytes).digest('hex');
    row.bytes = bytes.length;
  }
  report.observations = computeCadenceObservations(frames, targetFps);
  if (!report.observations.cadence_valid && !report.runtime_errors.some(row => row.kind === 'cadence-truth')) {
    report.runtime_errors.push({
      at_ms: Number(monotonicMs().toFixed(3)),
      kind: 'cadence-truth',
      text: `Cadence evidence is incomplete or invalid: ${report.observations.cadence_failure_reasons.join(', ')}`,
      cadence_failure_reasons: report.observations.cadence_failure_reasons
    });
  }
  if (!report.observations.repeated_frame_estimate.hash_census_complete
      && !report.runtime_errors.some(row => row.kind === 'lossless-frame-hash-census')) {
    report.runtime_errors.push({
      at_ms: Number(monotonicMs().toFixed(3)),
      kind: 'lossless-frame-hash-census',
      text: 'One or more delivered frames lacks a valid retained lossless-PNG SHA-256; repeated-frame estimation and frame custody are incomplete.'
    });
  }
  const spatialFailures = frames.filter(row => row.full_resolution !== true);
  if (spatialFailures.length && !report.runtime_errors.some(row => row.kind === 'full-resolution-frame-census')) {
    report.runtime_errors.push({
      at_ms: Number(monotonicMs().toFixed(3)), kind: 'full-resolution-frame-census',
      text: `${spatialFailures.length} delivered frame(s) do not exactly match viewport x DPR dimensions`,
      first_failures: spatialFailures.slice(0, 20).map(row => ({ index: row.index, width: row.width, height: row.height, expected_width: row.expected_width, expected_height: row.expected_height }))
    });
  }
  writeFileSync(join(outdir, 'frame-index.json'), JSON.stringify({
    schema_id: 'pm.capture.delivered_compositor_frame_index.v1',
    source_sha256: sourceSha256, capture_method: report.capture_method,
    target_fps: targetFps, no_resampling_claim: true,
    denominator_sha256: report.denominator.sha256,
    configuration_sha256: report.configuration_sha256,
    full_resolution_census_complete: spatialFailures.length === 0,
    frames
  }, null, 2) + '\n');
  writeFileSync(join(outdir, 'console-log.json'), JSON.stringify(consoleLog, null, 2) + '\n');
  writeFileSync(join(outdir, 'network-log.json'), JSON.stringify(networkLog, null, 2) + '\n');
  writeFileSync(join(outdir, 'scenario-manifest.json'), JSON.stringify({
    schema_id: 'pm.capture.scenario_manifest.v1', campaign, target: redactUrl(target),
    source_sha256: sourceSha256, requested_fps: targetFps,
    denominator_sha256: report.denominator.sha256,
    configuration_sha256: report.configuration_sha256,
    capture_method: report.capture_method, evidence_boundary: report.evidence_boundary,
    no_resampling_claim: true, scenarios: report.scenarios, chapters: report.chapters
  }, null, 2) + '\n');
  writeFileSync(join(outdir, 'coverage-manifest.json'), JSON.stringify({
    schema_id: 'pm.capture.final_campaign_coverage.v1', campaign,
    evidence_boundary: report.evidence_boundary,
    source_sha256: sourceSha256,
    denominator_sha256: report.denominator.sha256,
    configuration_sha256: report.configuration_sha256,
    native_runtime_claim: false,
    production_runtime_claim: false,
    requested_fps: targetFps,
    no_resampling_claim: true,
    contract: campaign === 'final' ? finalContractInventory() : null,
    observed: report.coverage_summary || {
      complete: report.actions.every(row => row.disposition === 'captured'),
      chapter_count: report.chapters.length,
      action_count: report.actions.length
    },
    chapters: report.chapters.map(row => ({
      id: row.id, capabilities: row.capabilities || [],
      required_action_ids: row.required_action_ids || [], action_ids: row.action_ids || [],
      missing_action_ids: row.missing_action_ids || [], failed_action_ids: row.failed_action_ids || [],
      coverage_complete: row.coverage_complete ?? null
    })),
    blocked_or_projection_only_actions: report.actions.filter(row =>
      row.result?.production_runtime === 'not_executed'
      || row.result?.production_mutation === 'not_performed'
      || row.result?.production_backup === 'not_performed'
      || row.result?.native_execution === 'not_performed'
      || row.result?.owner_feed === 'not_attached'
      || String(row.result?.availability || '').startsWith('owner_unavailable')
    ).map(row => ({ id: row.id, chapter: row.chapter, result: row.result }))
  }, null, 2) + '\n');
  writeFileSync(join(outdir, 'action-timing.json'), JSON.stringify({
    schema_id: 'pm.capture.action_timing.v1', clock_domain: 'process.hrtime monotonic',
    source_sha256: sourceSha256, denominator_sha256: report.denominator.sha256,
    actions: report.actions
  }, null, 2) + '\n');
  writeFileSync(join(outdir, 'timing-report.json'), JSON.stringify({
    schema_id: 'pm.capture.delivered_frame_timing.v1', requested_fps: targetFps,
    source_sha256: sourceSha256, denominator_sha256: report.denominator.sha256,
    no_resampling_claim: true, clock_domain: 'Chrome DevTools screencast metadata timestamp',
    observations: report.observations
  }, null, 2) + '\n');
  if (frameWriteFailures.length) {
    report.media.disposition = 'frame_write_failed';
  } else if (!report.observations.repeated_frame_estimate.hash_census_complete) {
    report.media.disposition = 'lossless_frame_hash_census_invalid';
    report.media.residual = 'Media was not encoded because every delivered lossless PNG must have one valid SHA-256 before repeated-frame estimation and media derivation.';
  } else if (!report.observations.cadence_valid) {
    report.media.disposition = 'cadence_invalid';
    report.media.residual = 'Media was not encoded because complete, finite, strictly monotonic CDP and receiver timing for at least two delivered frames is required. No subset-derived or null cadence is promoted.';
  } else if (!report.media.disposition) {
    makeMedia(frames);
  }
  const artifactNames = [
    'frame-index.json', 'console-log.json', 'network-log.json',
    'scenario-manifest.json', 'coverage-manifest.json', 'action-timing.json', 'timing-report.json',
    report.media.ffv1_master?.success ? report.media.ffv1_master.path : null,
    report.media.review_mp4?.success ? report.media.review_mp4.path : null
  ].filter(Boolean);
  writeFileSync(join(outdir, 'artifact-manifest.json'), JSON.stringify({
    schema_id: 'pm.capture.artifact_manifest.v1', generated_at_utc: new Date().toISOString(),
    evidence_boundary: report.evidence_boundary,
    artifacts: artifactNames.map(name => {
      const path = join(outdir, name);
      return { path: name, bytes: statSync(path).size, sha256: hashFile(path) };
    })
  }, null, 2) + '\n');
  if (frameWriteFailures.length) {
    throw new Error(`${frameWriteFailures.length} lossless frame write(s) failed; media encoding was not attempted`);
  }
}

mkdirSync(outdir, { recursive: true });
writePartial();
let browser, cdp;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: browserExecutableBinding.real_path,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-background-timer-throttling', '--disable-renderer-backgrounding']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'no-preference'
  });
  await context.route('**/*', async route => {
    const url = route.request().url();
    const allowed = url.startsWith('data:') || url.startsWith('blob:') || url === 'about:blank'
      || (target.startsWith('file:') && url.startsWith('file:'))
      || (!target.startsWith('file:') && new URL(url).origin === new URL(target).origin);
    if (allowed) await route.continue();
    else await route.fulfill({ status: 204, contentType: 'text/plain', body: '' });
  });
  context.on('request', request => networkLog.push({ kind: 'request', at_ms: Number(monotonicMs().toFixed(3)), method: request.method(), resource_type: request.resourceType(), url: redactUrl(request.url()) }));
  context.on('response', response => networkLog.push({ kind: 'response', at_ms: Number(monotonicMs().toFixed(3)), status: response.status(), url: redactUrl(response.url()) }));
  context.on('requestfailed', request => networkLog.push({ kind: 'requestfailed', at_ms: Number(monotonicMs().toFixed(3)), url: redactUrl(request.url()), error: request.failure()?.errorText || null }));
  const page = await context.newPage();
  page.on('console', message => consoleLog.push({ at_ms: Number(monotonicMs().toFixed(3)), type: message.type(), text: message.text().slice(0, 2000) }));
  page.on('pageerror', error => report.runtime_errors.push({ at_ms: Number(monotonicMs().toFixed(3)), kind: 'pageerror', text: safeError(error) }));
  await page.addInitScript(() => {
    try { localStorage.setItem('pm.theme', 'friendly-dark'); } catch (_error) {}
  });
  await page.goto(target, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => Boolean(window.PM_PAGES && window.PM_DEMO && document.body), null, { timeout: 120000 });
  await page.evaluate(() => document.fonts?.ready);
  report.browser_identity = {
    product: browser.browserType().name(), version: browser.version(), channel: 'system_chrome',
    user_agent: await page.evaluate(() => navigator.userAgent),
    executable_path: browserExecutableBinding.absolute_path,
    executable_real_path: browserExecutableBinding.real_path,
    executable_sha256: browserExecutableBinding.sha256,
    executable_binding: browserExecutableBinding,
    playwright_version: playwrightVersion
  };
  await hold(page, 500);

  cdp = await context.newCDPSession(page);
  cdp.on('Page.screencastFrame', params => {
    const received = monotonicMs();
    cdp.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
    if (!captureStartedAt) return;
    const index = frames.length;
    const filename = `frame-${String(index).padStart(7, '0')}.png`;
    const path = join(framesDir, filename);
    const bytes = Buffer.from(params.data, 'base64');
    const size = pngSize(bytes);
    const viewportWidth = Number.isFinite(Number(params.metadata?.deviceWidth)) ? Number(params.metadata.deviceWidth) : null;
    const viewportHeight = Number.isFinite(Number(params.metadata?.deviceHeight)) ? Number(params.metadata.deviceHeight) : null;
    const deviceScaleFactor = 1;
    const expectedWidth = viewportWidth === null ? null : Math.round(viewportWidth * deviceScaleFactor);
    const expectedHeight = viewportHeight === null ? null : Math.round(viewportHeight * deviceScaleFactor);
    frames.push({
      index, path: relative(outdir, path), chapter,
      elapsed_ms: Number((received - captureStartedAt).toFixed(3)),
      received_monotonic_ms: received,
      cdp_timestamp_s: params.metadata?.timestamp ?? null,
      width: size.width, height: size.height,
      viewport_width: viewportWidth, viewport_height: viewportHeight,
      device_scale_factor: deviceScaleFactor,
      expected_width: expectedWidth, expected_height: expectedHeight,
      full_resolution: expectedWidth !== null && expectedHeight !== null && size.width === expectedWidth && size.height === expectedHeight,
      metadata: params.metadata || {}
    });
    pendingWrites.push(fsp.writeFile(path, bytes).catch(error => {
      const failure = { index, path: relative(outdir, path), error: safeError(error) };
      frameWriteFailures.push(failure);
      report.runtime_errors.push({ at_ms: Number(monotonicMs().toFixed(3)), kind: 'frame-write', ...failure });
    }));
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  captureStartedAt = monotonicMs();
  if (campaign === 'final') await runFinal(page); else await runSmoke(page);
  await hold(page, 300);
  await cdp.send('Page.stopScreencast');
  await hold(page, 100);
  await Promise.allSettled(pendingWrites);
  await cdp.detach();
  cdp = null;
  await finalizeCapturedEvidence();
  report.browser_identity.post_use_binding = revalidateRegularFile(browserExecutableBinding);
  report.browser_identity.executable_unchanged_after_capture = true;
  const actionOrRuntimeFailure = report.actions.some(row => row.disposition === 'failed') || report.runtime_errors.length;
  const finalMediaMissing = campaign === 'final' && report.media.disposition !== 'encoded';
  report.disposition = actionOrRuntimeFailure ? 'fail'
    : finalMediaMissing ? 'partial_media_encoder_unavailable'
      : 'captured_browser_concept_evidence';
  report.finished_at_utc = new Date().toISOString();
  report.review_status = 'pending_frame_review';
  writeFileSync(join(outdir, 'campaign-report.json'), JSON.stringify(report, null, 2) + '\n');
  if (actionOrRuntimeFailure || finalMediaMissing) process.exitCode = 1;
  await context.close();
} catch (error) {
  if (cdp) {
    await cdp.send('Page.stopScreencast').catch(() => {});
    await cdp.detach().catch(() => {});
    cdp = null;
  }
  report.disposition = 'fail';
  report.runtime_errors.push({ at_ms: Number(monotonicMs().toFixed(3)), kind: 'harness', text: safeError(error) });
  report.finished_at_utc = new Date().toISOString();
  await finalizeCapturedEvidence().catch(finalizeError => report.runtime_errors.push({
    at_ms: Number(monotonicMs().toFixed(3)), kind: 'evidence-finalize', text: safeError(finalizeError)
  }));
  writeFileSync(join(outdir, 'campaign-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.error(safeError(error));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
}

console.log(JSON.stringify({ disposition: report.disposition, outdir, frames: frames.length, media: report.media }, null, 2));
