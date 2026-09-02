/* PMConcept7 full-thread performance browser-concept verifier.
 *
 * This verifier covers the browser-applicable projection of every workload in
 * the 19-scenario packet matrix and routes all 85 retained topic identifiers
 * to either browser checks or an explicit native/static/hardware boundary.
 * Browser timings are prototype evidence only. They do not certify native
 * Slint, compositor, server, network, storage, package, or hardware behavior.
 *
 * Usage:
 *   node full_thread_performance.mjs \
 *     --file /absolute/path/to/PMConcept7.html \
 *     --outdir /absolute/path/to/evidence-directory \
 *     --modules /path/containing/node_modules/playwright-core \
 *     --chromium /usr/bin/google-chrome \
 *     --expected-artifact-sha256 <sha256> --expected-verifier-sha256 <sha256> \
 *     --expected-helper-sha256 <sha256>
 *
 * `--self-check` is a separate noncertifying static mode. It never launches a
 * browser and cannot emit passing browser provenance admission.
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BROWSER_ONLY_BOUNDARY,
  assertProvenanceAdmission,
  parseStrictVerifierArgs,
  prepareProvenanceRun
} from './browser_verifier_provenance.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = dirname(scriptPath);
const repoRoot = resolve(scriptDir, '../../..');
const IMPACT_SCHEMA = 'pm.pmconcept7.actionable_closure_impact_manifest.v1';
const EXPECTED_LOCAL_ACTION_COUNT = 28;
const EXPECTED_COMMAND_COUNT = 77;
const EXPECTED_LOCAL_ACTION_IDS_SHA256 = '3237861b88f4d910cf3d044bea55600035d6f8b1f9851ae1835d2c3cc5f879c2';
const EXPECTED_COMMAND_IDS_SHA256 = 'e523542845feb0781f0bb8da4c16501ded8dad0cc3b6788ef6028077484b297e';
const EXPECTED_ALL_ACTION_IDS_SHA256 = '6ad4ed609656ad3476b61e7324be82133f937a21498da0e981086ae03955e30b';
const EXPECTED_NATIVE_ONLY_CASES = ['PERF-010', 'TST-005', 'TST-006', 'TST-007'];
const EXPECTED_PLUGIN_COMMAND_IDS = [
  'cmd.agent_plugin.disable', 'cmd.agent_plugin.enable', 'cmd.agent_plugin.install',
  'cmd.agent_plugin.open_details', 'cmd.agent_plugin.open_logs', 'cmd.agent_plugin.reload',
  'cmd.agent_plugin.remove', 'cmd.agent_plugin.review_changes', 'cmd.agent_plugin.rollback',
  'cmd.agent_plugin.scan', 'cmd.agent_plugin.update', 'cmd.agent_plugin.validate'
].sort();
const REQUIRED_ACTION_FIELDS = [
  'action_id', 'kind', 'disposition', 'canonical_owner', 'source_anchor',
  'return_or_currentness_owner', 'browser_availability', 'production_schema_status',
  'production_handler_status', 'production_permission_status', 'production_receipt_event_status',
  'production_wiring_status', 'open_reason'
];
const ALLOWED_ACTION_DISPOSITIONS = new Set(['existing', 'revised', 'alias', 'new-candidate', 'no-command']);

function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function actionIdDigest(ids) {
  return sha256Bytes(Buffer.from(`${[...ids].sort().join('\n')}\n`, 'utf8'));
}

function validateImpactManifest(manifestPath) {
  const errors = [];
  if (!existsSync(manifestPath)) return { pass: false, errors: [`missing impact manifest: ${manifestPath}`], path: manifestPath };
  let bytes;
  let manifest;
  try {
    bytes = readFileSync(manifestPath);
    manifest = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    return { pass: false, errors: [`invalid impact manifest: ${String(error)}`], path: manifestPath };
  }
  if (manifest.schema_id !== IMPACT_SCHEMA) errors.push(`schema_id must be ${IMPACT_SCHEMA}`);
  const actions = Array.isArray(manifest.actions) ? manifest.actions : [];
  if (!Array.isArray(manifest.actions)) errors.push('actions must be an array');
  const ids = actions.map(row => row?.action_id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate action_id');
  if (ids.some(id => typeof id !== 'string' || !id)) errors.push('every action_id must be a nonempty string');
  const locals = actions.filter(row => row?.kind === 'local_ui');
  const commands = actions.filter(row => row?.kind === 'canonical_command');
  if (locals.length !== EXPECTED_LOCAL_ACTION_COUNT) errors.push(`local action count ${locals.length} != ${EXPECTED_LOCAL_ACTION_COUNT}`);
  if (commands.length !== EXPECTED_COMMAND_COUNT) errors.push(`command count ${commands.length} != ${EXPECTED_COMMAND_COUNT}`);
  if (actions.length !== EXPECTED_LOCAL_ACTION_COUNT + EXPECTED_COMMAND_COUNT) errors.push(`total action count ${actions.length} != 105`);
  if (actionIdDigest(locals.map(row => row.action_id)) !== EXPECTED_LOCAL_ACTION_IDS_SHA256) errors.push('local action exact-membership digest mismatch');
  if (actionIdDigest(commands.map(row => row.action_id)) !== EXPECTED_COMMAND_IDS_SHA256) errors.push('command exact-membership digest mismatch');
  if (actionIdDigest(ids) !== EXPECTED_ALL_ACTION_IDS_SHA256) errors.push('combined action exact-membership digest mismatch');
  for (const row of actions) {
    for (const field of REQUIRED_ACTION_FIELDS) if (!(field in (row || {})) || typeof row[field] !== 'string' || !row[field]) errors.push(`${row?.action_id || '<unknown>'}: missing ${field}`);
    if (!ALLOWED_ACTION_DISPOSITIONS.has(row?.disposition)) errors.push(`${row?.action_id || '<unknown>'}: invalid disposition`);
    if (typeof row?.action_id === 'string' && (row.action_id.includes('*') || row.action_id.endsWith('.') || row.action_id === 'cmd.onboarding' || row.action_id.startsWith('cmd.onboarding.'))) errors.push(`${row.action_id}: wildcard, family root, or cmd.onboarding token forbidden`);
    if (row?.kind === 'local_ui' && (!row.action_id.startsWith('ui.') || row.disposition !== 'no-command')) errors.push(`${row?.action_id}: local UI row must be ui.* and no-command`);
    if (row?.kind === 'canonical_command' && (!row.action_id.startsWith('cmd.') || row.disposition === 'no-command')) errors.push(`${row?.action_id}: command row must be cmd.* and not no-command`);
  }
  const declaredNative = Array.isArray(manifest.native_only_cases) ? manifest.native_only_cases.map(row => row.case_id).sort() : [];
  if (JSON.stringify(declaredNative) !== JSON.stringify([...EXPECTED_NATIVE_ONLY_CASES].sort())) errors.push('native-only case census mismatch');
  for (const row of manifest.native_only_cases || []) {
    if (row.status !== 'not_run' || typeof row.residual !== 'string' || !row.residual) errors.push(`${row.case_id || '<unknown>'}: native-only case must be not_run with residual`);
  }
  const bindings = manifest.bindings && typeof manifest.bindings === 'object' ? manifest.bindings : {};
  for (const key of ['actionable_closure', 'systems_source', 'systems_verifier', 'performance_source', 'performance_verifier', 'generated_artifact']) {
    const binding = bindings[key];
    if (!binding || typeof binding.path !== 'string' || !binding.path || typeof binding.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(binding.sha256)) {
      errors.push(`binding ${key} missing path/sha256`);
      continue;
    }
    const boundPath = resolve(repoRoot, binding.path);
    if (!existsSync(boundPath)) errors.push(`binding ${key} path missing: ${binding.path}`);
    else if (sha256Bytes(readFileSync(boundPath)) !== binding.sha256) errors.push(`binding ${key} hash mismatch: ${binding.path}`);
  }
  return {
    pass: errors.length === 0,
    errors,
    path: manifestPath,
    sha256: sha256Bytes(bytes),
    schema_id: manifest.schema_id,
    actions_total: actions.length,
    local_actions: locals.length,
    commands: commands.length,
    action_ids: ids,
    native_only_cases: manifest.native_only_cases || [],
    bindings,
    manifest
  };
}

const selfCheckArgs = process.argv.slice(2);
if (selfCheckArgs.includes('--self-check')) {
  const staticArgs = selfCheckArgs.filter(token => token !== '--self-check');
  let staticImpactManifestPath = resolve(join(scriptDir, 'actionable_closure_impact_manifest.json'));
  if (staticArgs.length === 2 && staticArgs[0] === '--action-impact-manifest' && staticArgs[1] && !staticArgs[1].startsWith('--')) {
    staticImpactManifestPath = resolve(staticArgs[1]);
  } else if (staticArgs.length !== 0) {
    throw new Error('static mode accepts only --self-check and optional --action-impact-manifest <path>');
  }
  const impactValidation = validateImpactManifest(staticImpactManifestPath);
  const performanceSource = readFileSync(resolve(repoRoot, 'Concepts/pm7-tools/full_thread_performance_source.py'), 'utf8');
  const sourceCommands = [...new Set(performanceSource.match(/cmd\.[a-z0-9_.-]+/g) || [])].filter(id => !id.endsWith('.')).sort();
  const sourceActions = [...new Set(performanceSource.match(/ui\.[a-z0-9_.-]+/g) || [])].filter(id => !id.endsWith('.')).sort();
  const manifestIds = new Set(impactValidation.action_ids || []);
  const implicitSourceCommands = sourceCommands.filter(id => !manifestIds.has(id));
  const implicitSourceActions = sourceActions.filter(id => !manifestIds.has(id));
  const result = {
    schema_id: 'pm.pmconcept7.actionable_closure_impact_self_check.v1',
    verifier: 'full_thread_performance',
    evidence_class: 'noncertifying_static_self_check',
    browser_concept_exercised: false,
    provenance_admission_eligible: false,
    provenance: null,
    browser_admission: { pass: false, failures: ['static_mode_not_browser_admissible'] },
    pass: impactValidation.pass && implicitSourceCommands.length === 0 && implicitSourceActions.length === 0,
    manifest: { path: staticImpactManifestPath, sha256: impactValidation.sha256 || null, errors: impactValidation.errors },
    census: { actions: impactValidation.actions_total || 0, local_actions: impactValidation.local_actions || 0, commands: impactValidation.commands || 0 },
    implicit_source_commands: implicitSourceCommands,
    implicit_source_actions: implicitSourceActions,
    native_only_cases: impactValidation.native_only_cases || []
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.pass ? 0 : 1);
}

const digest = value => /^[0-9a-f]{64}$/.test(value);
const cli = parseStrictVerifierArgs(process.argv, {
  file: { required: true },
  outdir: { required: true },
  modules: { required: true },
  chromium: { required: true },
  'expected-artifact-sha256': { required: true, validate: digest },
  'expected-verifier-sha256': { required: true, validate: digest },
  'expected-helper-sha256': { required: true, validate: digest }
});
const args = cli.parsed_args;
const input = args.file;
const artifactPath = resolve(args.file);
const evidencePath = join(resolve(args.outdir), 'full-thread-performance-results.json');
const sampleCount = 240;
const impactManifestPath = resolve(join(scriptDir, 'actionable_closure_impact_manifest.json'));
const impactValidation = validateImpactManifest(impactManifestPath);
mkdirSync(args.outdir, { recursive: true });

let chromium;
let provenanceRun;
try {
  const requireFromRuntime = createRequire(join(args.modules, 'noop.js'));
  ({ chromium } = requireFromRuntime('playwright-core'));
  provenanceRun = await prepareProvenanceRun({
    verifierUrl: import.meta.url,
    artifactPath,
    expectedArtifactSha256: args['expected-artifact-sha256'],
    expectedVerifierSha256: args['expected-verifier-sha256'],
    expectedHelperSha256: args['expected-helper-sha256'],
    modulesPath: args.modules,
    chromiumPath: args.chromium,
    command: cli,
    effectiveConfig: {
      verifier: 'full_thread_performance',
      artifact_path: artifactPath,
      outdir: resolve(args.outdir),
      context_profiles: [
        '1440x900,dpr1,en-US,UTC,dark',
        '1440x900,dpr1,en-US,UTC,dark,reduced-motion'
      ],
      raf_samples: sampleCount,
      timeout_ms: 180000,
      service_workers: 'block',
      certification_mode: true
    }
  });
} catch (error) {
  const failure = {
    schema_id: 'pm.pmconcept7.full_thread_performance_provenance_failure.v1',
    disposition: 'provenance_preparation_failed',
    generated_at_utc: new Date().toISOString(),
    certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
    execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
    command: cli,
    error: { kind: 'provenance-preparation', text: String(error?.stack || error) },
    provenance: provenanceRun?.envelope || null
  };
  writeFileSync(evidencePath, `${JSON.stringify(failure, null, 2)}\n`);
  console.log(JSON.stringify({ disposition: failure.disposition, evidence: evidencePath }));
  process.exit(1);
}
const target = provenanceRun.artifactUrl();

const GOVERNOR_STATES = ['admitted', 'queued', 'admitted-degraded', 'permission-blocked', 'resource-blocked', 'cancelled'];
const COMMAND_STATES = ['accepted', 'acknowledged', 'executing', 'succeeded', 'failed', 'cancelled', 'rejected', 'terminal-unknown'];
const WORK_STATES = [
  'accepted', 'queued', 'starting', 'running', 'waiting', 'retrying', 'reconnecting', 'backgrounded',
  'degraded', 'stalled', 'committing', 'verifying', 'testing-route', 'migrating-route', 'rolling-back',
  'completed', 'failed', 'cancelled', 'recovery-required'
];

const TOPIC_TSV = String.raw`OPT-001|RPCS3-style profile-first optimization ladder|Perf benchmarks
OPT-002|Eliminate work before LTO/PGO/SIMD/assembly|End-to-end profile evidence
OPT-003|Runtime-dispatched provider/diff/hash/terminal/image kernels|Portable equivalence and measured win
OPT-004|Power, idle wakeups, thermal, process-tree measurement|Idle/thermal/soak matrix
CON-001|Many logical tasks are not one OS thread/process each|1/10/50/200 logical workload
CON-002|Seven execution lanes and protected interactive reserve|Saturation pause/stop tests
CON-003|RuntimeResourceGovernor sole owner|DRY owner and permit tests
CON-004|Home Server coordination plus host-local lease enforcement|Stale/infeasible lease tests
CON-005|Prevent Tokio/Rayon/Tantivy/CEF pool multiplication|Thread/process census
CON-006|Physical-core/SMT adaptive behavior and waves|Old Xeon scaling
CPU-001|Older Ivy Bridge/Haswell/Xeon full desktop launch support|Legacy hardware matrix
CPU-002|Portable x86-64 plus SSE4.2/AVX/AVX2/optional AVX-512 dispatch|Compatibility and equivalence
CPU-003|Capability-based modern Intel/AMD and AArch64 paths|Cross-architecture fixtures
MAC-001|Apple Silicon QoS and native arm64 helpers|QoS responsiveness
MAC-002|Thermal/Low Power/unified memory adaptation|Pressure tests
MAC-003|FSEvents/APFS clones/ScreenCaptureKit/Accelerate|Platform integration tests
MAC-004|Optional macOS 27 Apple Linux Execution Environment|Feature-detected environment tests
WIN-001|Windows completion I/O, watcher/USN, EcoQoS, ETW|Windows instrumentation matrix
WIN-002|Native Windows complete; WSL optional and separate|WSL Off and multi-distro tests
LNX-001|Linux epoll/inotify/PSI/cgroups/compatibility floor|Linux pressure matrix
LNX-002|Remote/NFS/SMB bounded reconciliation|Remote source tests
START-001|Progressive startup and cached-to-live reconciliation|Cold/warm launch
UI-001|Same-frame acknowledgement and truthful pending shells|Input/action latency
UI-002|Virtualization, stable deltas, frame batching, cancellation|Long-list/stream tests
GIT-001|Incremental shared repository state and bounded Git processes|Repository workloads
MEM-001|Hot/warm/cold inactive shells|Inactive Project/Plan memory
MEM-002|Byte-bounded queues/caches/process pools|Pressure/shedding tests
MEM-003|Avoid duplicate representations and use blob refs|Retained-object audit
MEM-004|Deterministic pressure-response order|Degradation tests
SIZE-001|Separate PM core/CEF/tool/symbol size budgets|CI size gates
STO-001|Absolute SQLite prohibition|Dependency/file/schema scan
STO-002|seglog/redb/Tantivy/content-addressed storage direction|Storage contracts
STO-003|Short transactions/lazy indexes/recovery observability|Crash/rebuild tests
LOAD-001|ObservableWork shared state/progress contract|Operation-state fixtures
LOAD-002|Precise loading/wait UI and reduced motion|GUI state tests
PROV-001|Demand-driven capability provisioning|LSP/media/test provisioning
PROV-002|Global/Project Auto/On/Off policy|Policy inheritance tests
PROV-003|Coalesced exact-host/environment installation and continuation|Dedup/stale continuation
PROV-004|Provider CLIs not bundled but explicitly downloadable in all deployments|Native/WSL/container install tests
PROV-005|Provider install/auth separation and official source|Security/provenance tests
PROV-006|CEF bundled core exception|Packaging validation
PRV-001|Cached provider catalog and zero unconfigured startup probes|Provider startup fixture
PRV-002|Provider readiness separate from Usage/price/settlement|Unknown/stale state tests
BRW-001|PM-native CEF BrowserAction/Program/Expert Program|Browser command/runtime tests
BRW-002|Multi-agent isolated sessions/pages and mutation fencing|Collision/takeover tests
BRW-003|Protected AuthBrowserSession|No-content/no-recording tests
BRW-004|Generic browser/desktop/device capture and crash-safe recording|Capture matrix
BRW-005|No PM Playwright architecture; project dependency only|Prohibited-token scan
REN-001|Renderer bakeoff remains evidence-gated|Cross-platform visual/perf matrix
REN-002|Safe UI/software renderer is recovery, not headless testing|Failure/recovery tests
SRV-001|Server-first one Home Server/canonical writer/physical Vault|Authority/isolation tests
SRV-002|Standalone/container/Kubernetes are full Execution Hosts|No desktop-worker tests
SRV-003|Immutable image plus persistent Tool Store/profile/Vault|Redeploy persistence
SRV-004|LAN/Tailscale/Funnel/reverse-proxy endpoint semantics|Ingress/security tests
SRV-005|Goal owner epoch, Resume Here, fencing, recreation|Handoff/late-write tests
SRV-006|Project Move/backups/app and content updates|Rollback/recovery tests
THR-001|Durable thread.spawn/request/await/branch|Ordering/idempotency tests
THR-002|Compact task-relevant prompt projections|Prompt-size/privacy tests
PM7-001|Basic Dark and Chat open factory defaults|Factory/persistence matrix
PM7-002|Only Panel 1 visible with seven merged file tabs|Editor layout tests
PM7-003|Move workspace preview and hidden automation session to Panel 1|Browser/session tests
PM7-004|Migrate untouched factory state; preserve customization|Migration/recovery tests
PM7-005|Edit authored pipeline and rebuild, never generated HTML directly|Build/hash/smoke evidence
PLAN-001|Immutable named end-to-end Plan aggregate|Schema/lineage tests
PLAN-002|Create/name/switch Plans without disruption|Concurrent flow tests
PLAN-003|One PRD per Plan and scoped Planning state|Revision isolation
PLAN-004|Orchestrator All Active plus seven preserved tabs|Scope/navigation tests
PLAN-005|Exact Approve And Build behavior and per-lineage idempotency|Launch/rebind tests
PLAN-006|Project-first/Plan fairness and provider constraints|Scheduling tests
PLAN-007|Worktree/port/container/browser/device isolation and overlap detection|Collision matrix
PLAN-008|Plan lineage on all lifecycle records/deep links/receipts|Referential integrity
SET-001|Left Activity Bar and inactive-panel efficiency|Shell layout tests
SET-002|Settings compact summaries/lazy manager hydration|825+ search tests
SET-003|Full manager coverage and simple independent Project settings|Coverage manifest
ONB-001|Installation/Server Bootstrap/Product Onboarding separation|Flow-state tests
ONB-002|Provider/search/Free Models/first Project/New Plan setup|Onboarding matrix
DOC-001|Doctor cached health aggregation and canonical remediation|Freshness/deep-link tests
DOC-002|Doctor projections across Server/Plan/provider/browser/storage/security|Projection coverage
CMD-001|Existing command/alias inventory before IDs|Action census
CMD-002|Typed command/idempotency/fencing/event/receipt/navigation contract|Wiring fixtures
DRY-001|One canonical owner/handler per semantic system/action|DRY audit
PLANUNIT-001|Canonical owner/consumer PlanUnits and migrations|Plan index validation
TEST-001|Cross-platform performance/failure/recovery/visual matrix|Benchmark evidence
GOV-001|Docs stable before indexes/shards/evidence; Spec Lock last|Governance gates
PROC-001|One Goal, subagents, parent-only writer, preserve concurrent changes|Work item and self-audit report`;

const TOPICS = TOPIC_TSV.trim().split('\n').map(line => {
  const [topic_id, topic, acceptance_surface] = line.split('|');
  return { topic_id, topic, acceptance_surface };
});

const SCENARIOS = [
  ['PERF-S01', 'cold/warm launch and cached-to-live reconciliation', 'browser_partial', ['startup.cold_warm_shell', 'startup.cached_first_no_probe_storm', 'refresh.cached_content_retained']],
  ['PERF-S02', '1/10/50/200 logical threads and many named Plans across Projects', 'native_runtime_required', []],
  ['PERF-S03', 'fragmented multi-provider streams, terminals, logs, diffs, hashing, indexing', 'native_runtime_required', []],
  ['PERF-S04', 'full desktop on Ivy Bridge, Xeon E5, and modern Intel/AMD Windows/Linux', 'hardware_matrix_required', []],
  ['PERF-S05', 'Apple Silicon normal, Low Power, thermal pressure, and unified-memory load', 'hardware_matrix_required', []],
  ['PERF-S06', 'native Windows, several WSL environments, WSL restart and path mapping', 'platform_matrix_required', []],
  ['PERF-S07', 'native macOS plus optional Apple Linux environment', 'platform_matrix_required', []],
  ['PERF-S08', 'Linux/container/TrueNAS/Unraid/Kubernetes full Execution Host work', 'platform_runtime_required', []],
  ['PERF-S09', 'Settings summaries, 825+ search, and one manager lazy hydration', 'browser_applicable', ['settings.virtualized_100_plus_records', 'refresh.cached_content_retained']],
  ['PERF-S10', '100 detected installations collapsed to compact human cards', 'browser_applicable', ['installations.hundred_record_compaction']],
  ['PERF-S11', 'provider CLI install/auth/update/rollback on native, WSL, and immutable Tool Store', 'native_runtime_required', []],
  ['PERF-S12', 'Project capability Auto/On/Off provisioning and stale continuation rejection', 'browser_partial', ['continuation.dedup_and_stale_generation']],
  ['PERF-S13', 'multiple browser sessions/pages/recorders and user/automation/AuthBrowser isolation', 'browser_partial', ['security.auth_browser_isolation', 'continuation.hidden_paint_owner_identity']],
  ['PERF-S14', 'renderer matrix on themes, older GPU, VM/RDP, Wayland/X11', 'browser_partial', ['pacing.raf_percentiles', 'presentation.reduced_motion']],
  ['PERF-S15', 'physical Project Vault, Move, backup/restore, Goal Resume Here and fencing', 'native_runtime_required', []],
  ['PERF-S16', 'low memory/disk/network, package lock, crash, Server restart, Client disconnect', 'browser_partial', ['governor.low_resource_projection', 'continuation.identity_across_returns', 'interaction.saturation_acknowledgement']],
  ['PERF-S17', '24-hour soak, idle wakeups, process-tree RSS, cache shedding, no SQLite', 'native_soak_and_static_scan_required', []],
  ['PERF-S18', 'PM core, CEF, and on-demand tool installed-size budgets', 'packaging_ci_required', []],
  ['PERF-S19', 'command/wiring/DRY/PlanUnit/governance currentness', 'static_governance_required', []]
].map(([scenario_id, scenario, evidence_scope, check_ids]) => ({ scenario_id, scenario, evidence_scope, check_ids }));

const TOPIC_CHECKS = {
  'CON-002': ['interaction.saturation_acknowledgement'],
  'CON-003': ['truth.axes_separate', 'governor.low_resource_projection'],
  'CON-004': ['continuation.dedup_and_stale_generation'],
  'START-001': ['startup.cold_warm_shell', 'startup.cached_first_no_probe_storm', 'refresh.cached_content_retained'],
  'UI-001': ['interaction.same_frame_acknowledgement', 'interaction.saturation_acknowledgement'],
  'UI-002': ['settings.virtualized_100_plus_records', 'continuation.interruption_and_reversal', 'continuation.hidden_paint_owner_identity'],
  'LOAD-001': ['truth.axes_separate', 'truth.observable_work_all_states', 'truth.no_fake_percentage_or_synced'],
  'LOAD-002': ['truth.wait_reason_and_controls', 'presentation.reduced_motion'],
  'MEM-001': ['continuation.hidden_paint_owner_identity'],
  'MEM-002': ['interaction.saturation_acknowledgement'],
  'MEM-004': ['governor.low_resource_projection'],
  'PROV-001': ['governor.low_resource_projection'],
  'PROV-002': ['settings.manager_route_available'],
  'PROV-003': ['continuation.dedup_and_stale_generation'],
  'PROV-005': ['truth.provider_readiness_usage_separate'],
  'PRV-001': ['startup.cached_first_no_probe_storm'],
  'PRV-002': ['truth.provider_readiness_usage_separate'],
  'BRW-001': ['browser.native_program_contract_exposed'],
  'BRW-002': ['continuation.dedup_and_stale_generation'],
  'BRW-003': ['security.auth_browser_isolation'],
  'BRW-004': ['pacing.raf_percentiles'],
  'REN-001': ['pacing.raf_percentiles'],
  'REN-002': ['evidence.browser_native_hardware_boundary'],
  'SRV-004': ['security.auth_rate_admission_before_hydration'],
  'SRV-005': ['continuation.identity_across_returns'],
  'THR-001': ['continuation.identity_across_returns', 'continuation.interruption_and_reversal'],
  'PM7-001': ['factory.basic_dark_and_chat'],
  'PM7-002': ['factory.panel_one_only'],
  'PM7-003': ['factory.workspace_and_automation_panel_one'],
  'PM7-004': ['factory.customization_survives_reload'],
  'PLAN-002': ['continuation.interruption_and_reversal'],
  'PLAN-006': ['truth.axes_separate', 'interaction.saturation_acknowledgement'],
  'PLAN-007': ['continuation.dedup_and_stale_generation'],
  'PLAN-008': ['continuation.identity_across_returns'],
  'SET-001': ['continuation.hidden_paint_owner_identity'],
  'SET-002': ['settings.virtualized_100_plus_records', 'refresh.cached_content_retained'],
  'SET-003': ['settings.manager_route_available'],
  'ONB-001': ['onboarding.owner_flow_separation'],
  'ONB-002': ['onboarding.simple_flow_available'],
  'DOC-001': ['refresh.cached_content_retained', 'doctor.owner_routed', 'doctor.no_private_mutation'],
  'DOC-002': ['doctor.projection_scope'],
  'CMD-001': ['actions.performance_control_typed'],
  'CMD-002': ['actions.performance_control_typed', 'truth.axes_separate'],
  'TEST-001': ['pacing.raf_percentiles', 'evidence.browser_native_hardware_boundary']
};

const BROWSER_PREFIXES = new Set(['START', 'UI', 'LOAD', 'PRV', 'BRW', 'REN', 'PM7', 'SET', 'ONB', 'DOC', 'CMD', 'TEST']);
const STATIC_PREFIXES = new Set(['SIZE', 'STO', 'GOV', 'PLANUNIT', 'PROC', 'DRY']);
const STATIC_TOPIC_IDS = new Set(['BRW-005', 'PM7-005']);

mkdirSync(dirname(evidencePath), { recursive: true });
const failureDir = join(dirname(evidencePath), `${basename(evidencePath).replace(/\.json$/i, '')}-failures`);
const report = {
  schema_id: 'pm.pmconcept7.full_thread_performance_browser_verification.v1',
  disposition: 'browser_findings_present',
  generated_at_utc: new Date().toISOString(),
  target: input,
  target_url: target,
  target_sha256: provenanceRun.envelope.artifact.sha256,
  provenance: provenanceRun.envelope,
  action_impact_manifest: impactManifestPath,
  action_impact_manifest_sha256: impactValidation.sha256 || null,
  action_impact_manifest_validation: {
    pass: impactValidation.pass,
    errors: impactValidation.errors,
    actions_total: impactValidation.actions_total || 0,
    local_actions: impactValidation.local_actions || 0,
    commands: impactValidation.commands || 0
  },
  native_only_cases: impactValidation.native_only_cases || [],
  actionable_closure_residuals: [
    {
      case_id: 'TST-002',
      status: 'not_run',
      residual: 'The required 18-width x 8-theme x full/reduced-motion browser matrix and corresponding native campaign are not executed by this focused verifier run.',
      required_browser_cells: 18 * 8 * 2
    },
    {
      case_id: 'TST-004',
      status: 'not_run',
      residual: 'The complete exact-SHA scale campaign remains not_run until all bounded-list families, all core action acknowledgements, quiescence, and startup-count assertions execute without timeout.'
    }
  ],
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  deterministic_context: {
    viewport: { width: 1440, height: 900 },
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'UTC',
    color_scheme: 'dark',
    external_requests_blocked: true,
    requested_raf_samples: sampleCount,
    target_frame_ms: 16.7
  },
  checks: [],
  findings: [],
  measurements: {},
  scenario_coverage: [],
  topic_coverage: [],
  runtime_errors: [],
  failure_screenshots: []
};

let page = null;
let screenshotIndex = 0;
async function record(id, pass, evidence, options = {}) {
  const row = { id, pass: Boolean(pass), evidence: evidence === undefined ? null : evidence };
  report.checks.push(row);
  if (row.pass) return row;
  const finding = {
    id,
    severity: options.severity || 'error',
    summary: options.summary || `Verification failed: ${id}`,
    boundary: options.boundary || 'browser_concept',
    reproduction: options.reproduction || `Open ${input} and repeat ${id}.`,
    evidence: row.evidence
  };
  if (options.screenshot !== false && page && !page.isClosed()) {
    mkdirSync(failureDir, { recursive: true });
    const file = join(failureDir, `${String(++screenshotIndex).padStart(2, '0')}-${id.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}.png`);
    try {
      await page.screenshot({ path: file, fullPage: false });
      finding.screenshot = file;
      report.failure_screenshots.push(file);
    } catch (error) {
      finding.screenshot_error = String(error);
    }
  }
  report.findings.push(finding);
  return row;
}

function normalizeToken(value) {
  return String(value || '').toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]+/g, '').replace(/-+/g, '-');
}
function percentile(values, quantile) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * quantile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}
function fixed(value) {
  return value == null ? null : Number(value.toFixed(3));
}

let browser;
try {
  ({ browser } = await provenanceRun.launchChromium(chromium));
} catch (error) {
  report.runtime_errors.push({ kind: 'browser-launch', text: String(error?.stack || error) });
  try { report.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
  catch (finalizeError) {
    report.runtime_errors.push({ kind: 'provenance-post-launch-failure', text: String(finalizeError?.stack || finalizeError) });
    report.provenance = provenanceRun.envelope;
  }
  report.summary = { checks_total: 0, checks_passed: 0, checks_failed: 0, runtime_errors: report.runtime_errors.length };
  report.disposition = 'browser_findings_present';
  writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ disposition: report.disposition, evidence: evidencePath, summary: report.summary }));
  process.exit(1);
}

async function makeContext(caseId, options = {}) {
  const contextConfig = {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
    serviceWorkers: 'block',
    acceptDownloads: false
  };
  const context = await browser.newContext(contextConfig);
  await context.addInitScript(marker => {
    let initialized = false;
    try { initialized = sessionStorage.getItem(marker) === 'cleared'; } catch (_error) {}
    if (initialized) return;
    try { localStorage.clear(); } catch (_error) {}
    try { sessionStorage.clear(); } catch (_error) {}
    try { sessionStorage.setItem(marker, 'cleared'); } catch (_error) {}
  }, '__pm_full_thread_performance_context_initialized_v1__');
  const guard = await provenanceRun.attachContext(context, { case_id: caseId, context_config: contextConfig });
  const currentPage = await context.newPage();
  guard.instrumentPage(currentPage);
  currentPage.on('console', message => {
    if (message.type() === 'error') report.runtime_errors.push({ kind: 'console', text: message.text().slice(0, 1000) });
  });
  currentPage.on('pageerror', error => report.runtime_errors.push({ kind: 'pageerror', text: String(error).slice(0, 1000) }));
  const navigationStart = Date.now();
  await guard.gotoBound(currentPage, {
    navigation_id: `${caseId}:initial`,
    url: provenanceRun.artifactUrl({ case: caseId }),
    wait_until: 'load',
    timeout_ms: 180000
  });
  await currentPage.waitForFunction(() => Boolean(window.PM12_KIMI && window.PM7_SYSTEMS_INTEGRATION), null, { timeout: 120000 });
  await currentPage.evaluate(() => window.PM7_ONBOARDING_CINEMATIC?.skip?.());
  await currentPage.evaluate(() => document.fonts.ready);
  await currentPage.waitForTimeout(120);
  return { context, page: currentPage, guard, load_wall_ms: Date.now() - navigationStart };
}

async function openSettings(domain, workspace) {
  await page.evaluate(({ domain, workspace }) => {
    if (!window.PM7_SETTINGS_COMMANDS?.open) throw new Error('PM7 settings route API unavailable');
    window.PM7_SETTINGS_COMMANDS.open({ domain, workspace });
  }, { domain, workspace });
  await page.waitForFunction(({ domain, workspace }) => {
    const state = window.PM12_KIMI?.getState?.();
    return document.getElementById('panel-settings')?.classList.contains('active') && state?.domain === domain && state?.workspace === workspace;
  }, { domain, workspace }, { timeout: 20000 });
}

async function openPerformance() {
  await openSettings('source', 'browser-scm');
  await page.locator('[data-action="browser-scm-tab"][data-tab="performance"]').click({ force: true });
  await page.waitForFunction(() => window.PM12_KIMI?.getState?.().browserScmTab === 'performance' && Boolean(document.querySelector('#workspace-browser-scm .systems-contract-card')));
}

async function openAllSettings() {
  const route = await page.evaluate(() => {
    for (const domain of window.PM12_DATA?.domains || []) {
      const workspace = domain.workspaces?.find(item => item.id === 'all-settings' || item.type === 'all-settings' || item.virtualAllSettings === true);
      if (workspace) return { domain: domain.id, workspace: workspace.id };
    }
    return null;
  });
  if (!route) throw new Error('All Settings workspace is unavailable');
  await openSettings(route.domain, route.workspace);
  return route;
}

async function measureTabAcknowledgement(tab) {
  await page.evaluate(selected => {
    const control = document.querySelector(`[data-action="browser-scm-tab"][data-tab="${selected}"]`);
    window.__pmPerfAck = null;
    if (!control) return;
    control.addEventListener('click', () => {
      const inputAt = performance.now();
      window.__pmPerfAck = { input_at_ms: inputAt, requested_tab: selected, first_frame_seen: false };
      requestAnimationFrame(frameAt => {
        const observedAt = performance.now();
        const state = window.PM12_KIMI?.getState?.();
        const active = document.querySelector('#workspace-browser-scm [data-action="browser-scm-tab"].active')?.getAttribute('data-tab') || null;
        Object.assign(window.__pmPerfAck, {
          first_frame_seen: true,
          first_frame_timestamp_ms: frameAt,
          raf_observed_at_ms: observedAt,
          input_to_raf_observed_ms: observedAt - inputAt,
          state_at_first_frame: state?.browserScmTab || null,
          active_at_first_frame: active,
          model_acknowledged_on_first_frame: state?.browserScmTab === selected,
          dom_acknowledged_on_first_frame: active === selected,
          acknowledged_on_first_frame: state?.browserScmTab === selected && active === selected
        });
      });
    }, { once: true });
  }, tab);
  await page.locator(`[data-action="browser-scm-tab"][data-tab="${tab}"]`).click({ force: true });
  await page.waitForFunction(() => Boolean(window.__pmPerfAck?.first_frame_seen));
  return page.evaluate(() => window.__pmPerfAck);
}

try {
  const main = await makeContext('main-performance');
  page = main.page;
  await record('impact.manifest_exact_membership', impactValidation.pass && impactValidation.actions_total === 105 && impactValidation.local_actions === 28 && impactValidation.commands === 77, {
    manifest: impactManifestPath,
    manifest_sha256: impactValidation.sha256 || null,
    errors: impactValidation.errors,
    actions_total: impactValidation.actions_total || 0,
    local_actions: impactValidation.local_actions || 0,
    commands: impactValidation.commands || 0
  }, {
    summary: 'The action-impact manifest is missing, stale, malformed, or does not contain the exact 28 local actions and 77 commands.'
  });
  const expectedArtifactHash = impactValidation.bindings?.generated_artifact?.sha256 || null;
  await record('impact.manifest_target_hash_binding', Boolean(report.target_sha256 && expectedArtifactHash && report.target_sha256 === expectedArtifactHash), {
    target_sha256: report.target_sha256,
    expected_artifact_sha256: expectedArtifactHash,
    manifest_sha256: impactValidation.sha256 || null
  }, {
    summary: 'The browser target is not the exact artifact pinned by the action-impact manifest.'
  });
  await record('impact.native_only_residuals_not_run', EXPECTED_NATIVE_ONLY_CASES.every(caseId => {
    const row = (impactValidation.native_only_cases || []).find(item => item.case_id === caseId);
    return row?.status === 'not_run' && Boolean(row?.residual);
  }), impactValidation.native_only_cases || [], {
    summary: 'A hardware, WAN, security, or mid-operation fault-injection case was omitted or promoted above not_run.'
  });
  const boot = await page.evaluate(loadWall => ({
    load_wall_ms: loadWall,
    settings: Boolean(window.PM12_KIMI),
    systems: window.PM7_SYSTEMS_INTEGRATION || null,
    navigation: performance.getEntriesByType('navigation').map(row => ({ dom_content_loaded_ms: row.domContentLoadedEventEnd, load_event_ms: row.loadEventEnd }))[0] || null,
    resources: performance.getEntriesByType('resource').length
  }), main.load_wall_ms);
  await record('evidence.browser_native_hardware_boundary', boot.systems?.simulation_only === true &&
    JSON.stringify(report.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
    report.certification_boundary.native_runtime_exercised === false &&
    report.certification_boundary.native_slint_certified === false &&
    report.certification_boundary.production_runtime_certified === false, boot, {
    summary: 'The artifact or verifier does not retain an explicit browser-concept versus native/hardware boundary.'
  });

  const factoryAtBoot = await page.evaluate(() => {
    const layout = window.PM_HOME_WORKSPACE?.layout || null;
    const surfaces = Array.isArray(layout?.surfaces) ? layout.surfaces : [];
    const visibleEditors = surfaces.filter(row => row.surface_kind === 'editor_panel' && row.visible).map(row => row.surface_instance_id);
    const chat = surfaces.find(row => row.surface_kind === 'chat') || null;
    const panelOne = surfaces.find(row => row.surface_instance_id === 'editor_panel_1') || null;
    const preview = document.getElementById('browserPreviewTab');
    const automation = document.getElementById('automationBrowserTab');
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      chat_visible: chat?.visible === true,
      visible_editor_panels: visibleEditors,
      panel_one_browser_active: panelOne?.domain_ref?.browser_active === true,
      panel_one_file_tabs: document.querySelectorAll('#editorPane1 .tab[data-file],#editorPane1 [data-file-id]').length,
      preview_in_panel_one: Boolean(preview?.closest('#editorPane1')),
      automation_in_panel_one: Boolean(automation?.closest('#editorPane1')),
      automation_hidden: Boolean(automation && getComputedStyle(automation).display === 'none'),
      layout_schema: layout?.schema_id || null
    };
  });

  await openSettings('system', 'doctor');
  const startup = await page.evaluate(() => ({
    checking: Boolean(window.PM12_KIMI.getState().doctorChecking),
    checked_at: window.PM12_KIMI.getState().doctorCheckedAt || null,
    item_ids: [...document.querySelectorAll('[data-doctor-item]')].map(node => node.dataset.doctorItem),
    titles: [...document.querySelectorAll('[data-doctor-item] .doctor-item-title')].map(node => node.textContent.trim())
  }));
  await page.waitForTimeout(650);
  const startupLater = await page.evaluate(() => ({ checking: Boolean(window.PM12_KIMI.getState().doctorChecking), checked_at: window.PM12_KIMI.getState().doctorCheckedAt || null }));
  await record('startup.cached_first_no_probe_storm', startup.item_ids.length >= 10 && startup.titles.length === startup.item_ids.length && !startup.checking && !startupLater.checking && startup.checked_at === startupLater.checked_at, { first: startup, after_650ms: startupLater }, {
    summary: 'Cached Doctor content was absent at first paint or startup launched an unrequested sweep.'
  });

  const cachedBefore = startup;
  await page.locator('[data-action="doctor-check-scope"]').click({ force: true });
  const cachedDuring = await page.evaluate(() => ({
    checking: Boolean(window.PM12_KIMI.getState().doctorChecking),
    item_ids: [...document.querySelectorAll('[data-doctor-item]')].map(node => node.dataset.doctorItem),
    titles: [...document.querySelectorAll('[data-doctor-item] .doctor-item-title')].map(node => node.textContent.trim()),
    states: [...document.querySelectorAll('[data-doctor-item] .doctor-state')].map(node => node.textContent.trim())
  }));
  await page.waitForFunction(() => !window.PM12_KIMI.getState().doctorChecking, null, { timeout: 5000 });
  await record('refresh.cached_content_retained', cachedDuring.checking && JSON.stringify(cachedDuring.item_ids) === JSON.stringify(cachedBefore.item_ids) && JSON.stringify(cachedDuring.titles) === JSON.stringify(cachedBefore.titles) && cachedDuring.states.every(value => value === 'Checking'), { before: cachedBefore, during: cachedDuring }, {
    summary: 'A refresh removed cached content or failed to expose truthful in-progress state.'
  });

  const doctorMeta = await page.evaluate(() => ({
    scopes: [...document.querySelectorAll('[data-action="doctor-scope"]')].map(node => node.dataset.scope),
    local_action_ids: [...new Set([...document.querySelectorAll('[data-ui-action-id^="ui.doctor."]')].map(node => node.dataset.uiActionId))].sort(),
    plugin_command_ids: Array.isArray(window.PM7_PLUGIN_COMMANDS)
      ? [...new Set(window.PM7_PLUGIN_COMMANDS.map(row => row?.id).filter(Boolean))].sort()
      : [],
    owner_controls: [...new Set(document.querySelectorAll('[data-action="doctor-open-owner"],[data-ui-action-id="ui.doctor.open_remediation"]'))].map(node => ({
      id: node.dataset.id || node.closest('[data-doctor-item]')?.dataset.doctorItem || null,
      command: node.dataset.ownerCommandId || null,
      typed_owner_route_id: node.dataset.typedOwnerRouteId || null,
      owner_command_state: node.dataset.ownerCommandState || null,
      owner_route: node.dataset.ownerRoute || null,
      action: node.dataset.uiActionId || null,
      dispatch_action: node.dataset.action || null,
      route_action: node.dataset.routeUiActionId || null,
      remediation_mode: node.dataset.remediationMode || null,
      availability: node.dataset.availability || null,
      disabled: Boolean(node.disabled),
      aria_disabled: node.getAttribute('aria-disabled'),
      disabled_reason: node.dataset.disabledReason || null,
      production_runtime_state: node.closest('[data-doctor-item]')?.dataset.productionRuntimeState || null
    }))
  }));
  const allowedRemediationModes = new Set(['owner_command_route', 'typed_owner_route', 'unavailable']);
  const observedRemediationModes = new Set(doctorMeta.owner_controls.map(row => row.remediation_mode));
  const commandRoutes = doctorMeta.owner_controls.filter(row => row.remediation_mode === 'owner_command_route');
  const typedRoutes = doctorMeta.owner_controls.filter(row => row.remediation_mode === 'typed_owner_route');
  const unavailableRoutes = doctorMeta.owner_controls.filter(row => row.remediation_mode === 'unavailable');
  const doctorModesPass = doctorMeta.owner_controls.length >= 10 &&
    doctorMeta.owner_controls.every(row => row.action === 'ui.doctor.open_remediation' && row.dispatch_action === 'doctor-open-owner' && allowedRemediationModes.has(row.remediation_mode) && row.production_runtime_state === 'unavailable') &&
    [...allowedRemediationModes].every(mode => observedRemediationModes.has(mode)) &&
    commandRoutes.length > 0 && commandRoutes.every(row => Boolean(row.command && row.owner_route) && !row.typed_owner_route_id && row.owner_command_state === 'available' && row.availability === 'available' && !row.disabled) &&
    typedRoutes.length > 0 && typedRoutes.every(row => !row.command && Boolean(row.typed_owner_route_id && row.owner_route) && row.typed_owner_route_id === row.owner_route && row.owner_command_state === 'unavailable' && row.availability === 'available' && !row.disabled) &&
    unavailableRoutes.length > 0 && unavailableRoutes.every(row => !row.command && !row.typed_owner_route_id && row.owner_command_state === 'unavailable' && row.availability === 'unavailable' && row.disabled && row.aria_disabled === 'true' && Boolean(row.disabled_reason));
  await record('doctor.owner_routed', doctorModesPass, {
    allowed_remediation_modes: [...allowedRemediationModes],
    observed_remediation_modes: [...observedRemediationModes],
    command_routes: commandRoutes,
    typed_routes: typedRoutes,
    unavailable_routes: unavailableRoutes,
    all_controls: doctorMeta.owner_controls
  }, {
    summary: 'Doctor remediation controls do not preserve their explicit command, route-only, unavailable, typed-action, or disabled-reason contracts.'
  });

  const doctorRouteProbeIds = {
    command: commandRoutes.map(row => row.id).filter(Boolean),
    typed: typedRoutes.map(row => row.id).filter(Boolean),
    unavailable: unavailableRoutes.map(row => row.id).filter(Boolean)
  };
  const doctorRouteProbe = await page.evaluate(({ command, typed, unavailable }) => {
    const clone = value => value == null ? null : JSON.parse(JSON.stringify(value));
    const state = () => window.PM12_KIMI?.getState?.() || {};
    const openDoctor = () => window.PM7_SETTINGS_COMMANDS?.open?.({ domain: 'system', workspace: 'doctor' });
    const dispatch = id => window.PM12_KIMI?.dispatchAction?.('doctor-open-owner', { id });
    if (!command.length || !typed.length || !unavailable.length) return { available: false, ids: { command, typed, unavailable } };

    const routeProbes = ids => ids.map(id => {
      openDoctor();
      dispatch(id);
      const current = state();
      return { id, route: [current.domain, current.workspace], context: clone(current.doctorReturnContext) };
    });
    const unavailableProbes = unavailable.map(id => {
      openDoctor();
      const contextBefore = clone(state().doctorReturnContext);
      dispatch(id);
      const current = state();
      return {
        id,
        route: [current.domain, current.workspace],
        rejected: current.doctorReturnRejected || null,
        receipt: clone(current.doctorReturnReceipt),
        context_before: contextBefore,
        context_after: clone(current.doctorReturnContext)
      };
    });
    return { available: true, ids: { command, typed, unavailable }, command: routeProbes(command), typed: routeProbes(typed), unavailable: unavailableProbes };
  }, doctorRouteProbeIds);
  const noPrivateMutation = doctorRouteProbe.available &&
    doctorRouteProbe.command.length === commandRoutes.length && doctorRouteProbe.command.every(row =>
      row.context?.remediationMode === 'owner_command_route' && Boolean(row.context.ownerActionId) &&
      row.context.typedOwnerRouteId === null && row.context.routeOnlyConceptPreview === false &&
      row.context.productionMutationDispatched === false && row.context.browserProjectionOnly === true &&
      row.route.join('/') === row.context.ownerRoute?.join('/')) &&
    doctorRouteProbe.typed.length === typedRoutes.length && doctorRouteProbe.typed.every(row =>
      row.context?.remediationMode === 'typed_owner_route' && row.context.ownerActionId === null && row.context.typedOwnerRouteId === row.context.ownerRoute?.join('/') &&
      row.context.routeOnlyConceptPreview === true && row.context.productionMutationDispatched === false &&
      row.context.browserProjectionOnly === true && row.route.join('/') === row.context.ownerRoute?.join('/')) &&
    doctorRouteProbe.unavailable.length === unavailableRoutes.length && doctorRouteProbe.unavailable.every(row =>
      Boolean(row.rejected) && row.context_after === null && row.receipt === null && row.route.join('/') === 'system/doctor');
  await record('doctor.no_private_mutation', noPrivateMutation, doctorRouteProbe, {
    summary: 'Doctor executed or implied a private mutation instead of routing to the named owner or rejecting an unavailable action.'
  });
  await record('doctor.projection_scope', ['all', 'server', 'project', 'integrations', 'runtime'].every(scope => doctorMeta.scopes.includes(scope)), doctorMeta, {
    summary: 'Doctor does not expose every retained owner-projection scope.'
  });
  const expectedDoctorLocalActions = ['ui.doctor.open', 'ui.doctor.open_details', 'ui.doctor.open_logs', 'ui.doctor.open_receipt', 'ui.doctor.open_remediation', 'ui.doctor.refresh_visible', 'ui.doctor.run_check'].sort();
  const manifestDoctorLocalActions = (impactValidation.manifest?.actions || []).filter(row => row.action_id?.startsWith('ui.doctor.')).map(row => row.action_id).sort();
  await record('impact.doctor_local_action_exact_membership', JSON.stringify(manifestDoctorLocalActions) === JSON.stringify(expectedDoctorLocalActions), { expected: expectedDoctorLocalActions, actual: manifestDoctorLocalActions }, {
    summary: 'The impact manifest does not contain the exact seven local Doctor actions.'
  });
  await record('interaction.doctor_action_surface_complete', expectedDoctorLocalActions.every(actionId => actionId === 'ui.doctor.open' || doctorMeta.local_action_ids.includes(actionId)), { expected: expectedDoctorLocalActions, observed_in_doctor_surface: doctorMeta.local_action_ids, open_route_contract: 'cmd.settings.open -> system/doctor' }, {
    summary: 'The Doctor surface does not expose every required local evidence/check/remediation action for same-frame measurement.'
  });
  const pluginRegistryExact = JSON.stringify(doctorMeta.plugin_command_ids) === JSON.stringify(EXPECTED_PLUGIN_COMMAND_IDS);
  const declaredDoctorCommandIds = new Set([...(impactValidation.action_ids || []), ...(pluginRegistryExact ? doctorMeta.plugin_command_ids : [])]);
  const implicitDoctorCommands = doctorMeta.owner_controls.map(row => row.command).filter(Boolean).filter(commandId => !declaredDoctorCommandIds.has(commandId));
  await record('impact.no_implicit_doctor_commands', pluginRegistryExact && implicitDoctorCommands.length === 0, {
    observed: doctorMeta.owner_controls.map(row => row.command).filter(Boolean),
    action_impact_manifest_ids: [...impactValidation.action_ids || []],
    expected_plugin_registry: EXPECTED_PLUGIN_COMMAND_IDS,
    observed_plugin_registry: doctorMeta.plugin_command_ids,
    plugin_registry_exact: pluginRegistryExact,
    implicit: implicitDoctorCommands
  }, {
    summary: 'A Doctor remediation command is absent from both the exact action-impact manifest and the exact immutable Plugins System registry.'
  });

  await openPerformance();
  const performanceSurface = await page.evaluate(() => {
    const host = document.getElementById('workspace-browser-scm');
    const text = host?.innerText || '';
    const normalizedTokens = new Set(text.split(/[\s,;:()]+/).map(value => value.toLowerCase().replace(/[_.]+/g, '-').replace(/[^a-z0-9-]+/g, '')).filter(Boolean));
    const progress = [...(host?.querySelectorAll('[role="progressbar"],progress,[aria-valuenow]') || [])].map(node => ({
      role: node.getAttribute('role'), value: node.getAttribute('aria-valuenow') || node.value || null,
      max: node.getAttribute('aria-valuemax') || node.max || null, kind: node.dataset.progressKind || null
    }));
    return {
      text,
      normalized_tokens: [...normalizedTokens],
      axes: ['Governor decision', 'Command outcome', 'ObservableWork'].map(label => ({ label, present: text.toLowerCase().includes(label.toLowerCase()) })),
      ui_action_ids: [...(host?.querySelectorAll('[data-action="open-performance-evidence"]') || [])].map(node => node.dataset.uiActionId || null),
      percent_tokens: text.match(/\b\d+(?:\.\d+)?\s*%/g) || [],
      routine_synced: /\bsynced\b/i.test(text),
      progress,
      observable_work_rows: [...(host?.querySelectorAll('[data-observable-work-fixture]') || [])].map(node => ({
        id: node.getAttribute('data-observable-work-id'),
        state: node.getAttribute('data-work-state'),
        wait_reason: node.getAttribute('data-wait-reason'),
        reevaluation: node.getAttribute('data-reevaluation-condition'),
        can_cancel: node.getAttribute('data-can-cancel'),
        can_retry: node.getAttribute('data-can-retry'),
        denominator: node.getAttribute('data-progress-denominator')
      })),
      governor_outcome_rows: [...(host?.querySelectorAll('[data-governor-outcome]') || [])].map(node => ({
        outcome: node.getAttribute('data-governor-outcome'),
        work_id: node.getAttribute('data-observable-work-id'),
        reason: node.getAttribute('data-outcome-reason'),
        reevaluation: node.getAttribute('data-reevaluation-condition')
      })),
      bounded_list_families: [...new Set([...(host?.querySelectorAll('[data-bounded-list-family]') || [])].map(node => node.getAttribute('data-bounded-list-family')))].sort()
    };
  });
  const tokenSet = new Set(performanceSurface.normalized_tokens.map(normalizeToken));
  const missingGovernor = GOVERNOR_STATES.filter(value => !tokenSet.has(value));
  const missingCommand = COMMAND_STATES.filter(value => !tokenSet.has(value));
  const missingWork = WORK_STATES.filter(value => !tokenSet.has(value));
  await record('truth.axes_separate', performanceSurface.axes.every(row => row.present), { axes: performanceSurface.axes, required_state_axes: { governor: GOVERNOR_STATES, command: COMMAND_STATES, observable_work: WORK_STATES } }, {
    summary: 'Governor decision, command outcome, and ObservableWork are not rendered as three distinct axes.'
  });
  await record('truth.governor_all_states', missingGovernor.length === 0, { required: GOVERNOR_STATES, missing: missingGovernor }, {
    summary: 'The browser-applicable performance surface omits one or more GovernorDecision states.'
  });
  await record('truth.command_outcome_all_states', missingCommand.length === 0, { required: COMMAND_STATES, missing: missingCommand }, {
    summary: 'The browser-applicable performance surface omits one or more CommandOutcome states.'
  });
  await record('truth.observable_work_all_states', missingWork.length === 0, { required: WORK_STATES, missing: missingWork }, {
    summary: 'The performance surface omits one or more retained ObservableWork states.'
  });
  await record('truth.no_fake_percentage_or_synced', performanceSurface.percent_tokens.length === 0 && !performanceSurface.routine_synced && performanceSurface.progress.every(row => row.max || row.kind === 'indeterminate'), {
    percentages: performanceSurface.percent_tokens,
    routine_synced: performanceSurface.routine_synced,
    progress_controls: performanceSurface.progress
  }, { summary: 'Performance work uses a denominator-free percentage, routine “Synced”, or an untyped progress control.' });
  await record('truth.wait_reason_and_controls', /wait reason/i.test(performanceSurface.text) && /reevaluation/i.test(performanceSurface.text) && /cancel/i.test(performanceSurface.text) && /retry/i.test(performanceSurface.text), { text: performanceSurface.text.slice(0, 4000) }, {
    summary: 'Waiting work does not expose typed reason, reevaluation condition, and valid cancel/retry controls.'
  });
  await record('actions.performance_control_typed', performanceSurface.ui_action_ids.length === 1 && performanceSurface.ui_action_ids[0] === 'ui.performance.evidence.inspect', performanceSurface.ui_action_ids, {
    summary: 'The performance evidence action is absent, duplicated, or untyped.'
  });
  const requiredWorkFixtureStates = ['queued', 'running', 'waiting', 'cancel-requested', 'terminal-unknown', 'recovery-required', 'completed'].sort();
  const actualWorkFixtureStates = [...new Set(performanceSurface.observable_work_rows.map(row => row.state).filter(Boolean))].sort();
  const truthfulWaitingRows = performanceSurface.observable_work_rows.filter(row => row.state === 'waiting').every(row => row.wait_reason && row.reevaluation && ['true', 'false'].includes(row.can_cancel) && ['true', 'false'].includes(row.can_retry));
  await record('truth.observable_work_fixture_rows', JSON.stringify(actualWorkFixtureStates) === JSON.stringify(requiredWorkFixtureStates) && truthfulWaitingRows, { expected: requiredWorkFixtureStates, actual: actualWorkFixtureStates, rows: performanceSurface.observable_work_rows }, {
    summary: 'The performance surface lacks the exact truthful ObservableWork fixture rows, wait reasons, reevaluation, or control availability.'
  });
  const requiredGovernorOutcomes = [...GOVERNOR_STATES].sort();
  const actualGovernorOutcomes = [...new Set(performanceSurface.governor_outcome_rows.map(row => row.outcome).filter(Boolean))].sort();
  await record('governor.six_outcome_rows', JSON.stringify(actualGovernorOutcomes) === JSON.stringify(requiredGovernorOutcomes) && performanceSurface.governor_outcome_rows.every(row => row.work_id && row.reason), { expected: requiredGovernorOutcomes, actual: actualGovernorOutcomes, rows: performanceSurface.governor_outcome_rows }, {
    summary: 'Governor vocabulary is not backed by six explicit affected-work outcome rows with stable identity and reasons.'
  });
  const requiredBoundedListFamilies = ['findings', 'history', 'logs', 'provider', 'receipts'].sort();
  await record('lists.required_family_contracts', JSON.stringify(performanceSurface.bounded_list_families) === JSON.stringify(requiredBoundedListFamilies), { expected: requiredBoundedListFamilies, actual: performanceSurface.bounded_list_families }, {
    summary: 'Provider, findings, logs, receipts, and history are not all exposed through explicit bounded-list contracts.'
  });

  const ack = await measureTabAcknowledgement('browser');
  const ackBack = await measureTabAcknowledgement('performance');
  const firstFrameAcknowledged = row => row.first_frame_seen
    && Number.isFinite(row.raf_observed_at_ms)
    && Number.isFinite(row.input_to_raf_observed_ms)
    && row.input_to_raf_observed_ms >= 0
    && row.model_acknowledged_on_first_frame
    && row.dom_acknowledged_on_first_frame;
  await record('interaction.same_frame_acknowledgement', firstFrameAcknowledged(ack) && firstFrameAcknowledged(ackBack), { outbound: ack, return: ackBack }, {
    summary: 'A performance tab action was not visible in model and DOM by the first animation frame.'
  });

  await page.evaluate(() => {
    const fixture = document.createElement('div');
    fixture.id = 'pm-performance-saturation-fixture';
    fixture.setAttribute('aria-hidden', 'true');
    fixture.style.cssText = 'position:fixed;right:0;bottom:0;width:64px;height:64px;overflow:hidden;pointer-events:none;opacity:.02;contain:strict;z-index:-1';
    fixture.innerHTML = '<i></i>'.repeat(1600);
    document.body.appendChild(fixture);
    let frame = 0;
    const tick = () => {
      if (!fixture.isConnected) return;
      fixture.style.transform = `translateX(${frame++ % 2}px)`;
      window.__pmSaturationFrame = requestAnimationFrame(tick);
    };
    window.__pmSaturationFrame = requestAnimationFrame(tick);
  });
  const saturatedAcks = [];
  for (let index = 0; index < 8; index += 1) saturatedAcks.push(await measureTabAcknowledgement(index % 2 ? 'performance' : 'browser'));
  await page.evaluate(() => {
    cancelAnimationFrame(window.__pmSaturationFrame || 0);
    document.getElementById('pm-performance-saturation-fixture')?.remove();
  });
  await record('interaction.saturation_acknowledgement', saturatedAcks.every(row => row.acknowledged_on_first_frame), { browser_only_stress_proxy: true, rows: saturatedAcks }, {
    summary: 'An interactive tab action missed the first frame under the bounded browser stress proxy.',
    boundary: 'browser_stress_proxy_only'
  });

  const allSettingsRoute = await openAllSettings();
  await page.waitForSelector('[data-all-settings-viewport]');
  const virtualBefore = await page.evaluate(() => {
    const count = document.querySelector('[data-all-settings-count]')?.textContent || '';
    const numbers = [...count.matchAll(/\d+/g)].map(match => Number(match[0]));
    const ids = [...document.querySelectorAll('[data-all-setting-id]')].map(node => node.dataset.allSettingId);
    return { count, total: numbers.at(-1) || 0, mounted: ids.length, ids };
  });
  await page.locator('[data-all-settings-viewport]').evaluate(node => { node.scrollTop = node.scrollHeight; node.dispatchEvent(new Event('scroll')); });
  await page.waitForTimeout(120);
  const virtualAfter = await page.evaluate(() => ({
    mounted: document.querySelectorAll('[data-all-setting-id]').length,
    ids: [...document.querySelectorAll('[data-all-setting-id]')].map(node => node.dataset.allSettingId),
    scroll_top: document.querySelector('[data-all-settings-viewport]')?.scrollTop || 0
  }));
  await record('settings.virtualized_100_plus_records', virtualBefore.total >= 100 && virtualBefore.mounted > 0 && virtualBefore.mounted < 100 && virtualAfter.mounted < 100 && virtualAfter.scroll_top > 0 && JSON.stringify(virtualBefore.ids) !== JSON.stringify(virtualAfter.ids), { route: allSettingsRoute, before: virtualBefore, after: virtualAfter }, {
    summary: 'The 100+ Settings catalog is absent, fully mounted, or fails to swap its bounded visible window.'
  });
  await record('settings.manager_route_available', virtualBefore.total >= 825, virtualBefore, {
    summary: 'The complete project Settings manager/search route is unavailable or below the retained inventory floor.',
    screenshot: false
  });

  await openSettings('source', 'browser-scm');
  const installationCompaction = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('[data-installation-id],[data-provider-id],.provider-card,.installation-card')];
    return {
      declared_total: Number(document.querySelector('[data-installation-total]')?.getAttribute('data-installation-total') || 0),
      mounted_cards: candidates.length,
      compact_cards: candidates.filter(node => node.getBoundingClientRect().height <= 160).length,
      virtualization_owner: document.querySelector('[data-installation-virtualized]')?.getAttribute('data-installation-virtualized') || null
    };
  });
  await record('installations.hundred_record_compaction', installationCompaction.declared_total >= 100 && installationCompaction.mounted_cards > 0 && installationCompaction.mounted_cards < installationCompaction.declared_total && installationCompaction.compact_cards === installationCompaction.mounted_cards, installationCompaction, {
    summary: 'No observable 100-installation compact-card/virtualization fixture is exposed; explanatory copy is not performance evidence.'
  });

  await page.locator('[data-action="browser-scm-tab"][data-tab="browser"]').click({ force: true });
  const auth = await page.locator('#workspace-browser-scm').innerText();
  await record('security.auth_browser_isolation', ['AuthBrowserSession', 'human-only', 'non-recordable', 'non-inspectable', 'unavailable to agents'].every(term => auth.toLowerCase().includes(term.toLowerCase())), { text: auth.slice(0, 3000) }, {
    summary: 'The Browser consumer omits a retained AuthBrowserSession isolation negative.'
  });

  const browserProgramContract = await page.evaluate(() => {
    const artifactText = document.body?.innerText || '';
    const actionPane = document.getElementById('pm6BrowserActionsPane');
    const descriptor = window.PM7_BROWSER_PROGRAM;
    const binding = Object.getOwnPropertyDescriptor(window, 'PM7_BROWSER_PROGRAM');
    const prerequisites = Array.isArray(descriptor?.prerequisites) ? [...descriptor.prerequisites] : null;
    const executableMethodNames = descriptor && typeof descriptor === 'object'
      ? Object.keys(descriptor).filter(key => typeof descriptor[key] === 'function')
      : [];
    return {
      browser_action_log_exposed: Boolean(actionPane && actionPane.querySelector('.pm6-browser-action-row')),
      browser_action_term_exposed: artifactText.includes('BrowserAction'),
      browser_program_term_exposed: artifactText.includes('Browser Program'),
      expert_browser_program_term_exposed: artifactText.includes('Expert Browser Program'),
      descriptor_present: Boolean(descriptor && typeof descriptor === 'object'),
      descriptor_frozen: Boolean(descriptor && Object.isFrozen(descriptor)),
      binding_immutable: Boolean(binding && binding.writable === false && binding.configurable === false),
      projection_only: descriptor?.projection_only ?? null,
      runtime_state: descriptor?.runtime_state ?? null,
      native_cef_executed: descriptor?.native_cef_executed ?? null,
      ordinary_browser_only: descriptor?.ordinary_browser_only ?? null,
      auth_browser_session: descriptor?.auth_browser_session ?? null,
      prerequisites,
      prerequisites_frozen: Boolean(descriptor?.prerequisites && Object.isFrozen(descriptor.prerequisites)),
      execution_methods: descriptor?.execution_methods ?? null,
      raw_protocol_access: descriptor?.raw_protocol_access ?? null,
      arbitrary_page_code: descriptor?.arbitrary_page_code ?? null,
      executable_method_names: executableMethodNames,
      boundary: 'projection_only ordinary_browser_only descriptor; runtime_unavailable; native CEF not executed'
    };
  });
  await record('browser.native_program_contract_exposed', browserProgramContract.browser_action_term_exposed
    && browserProgramContract.browser_program_term_exposed
    && browserProgramContract.expert_browser_program_term_exposed
    && browserProgramContract.descriptor_present === true
    && browserProgramContract.descriptor_frozen === true
    && browserProgramContract.binding_immutable === true
    && browserProgramContract.projection_only === true
    && browserProgramContract.runtime_state === 'runtime_unavailable'
    && browserProgramContract.native_cef_executed === false
    && browserProgramContract.ordinary_browser_only === true
    && browserProgramContract.auth_browser_session === 'excluded'
    && JSON.stringify(browserProgramContract.prerequisites) === JSON.stringify(['policy', 'capability', 'explicit_user_action'])
    && browserProgramContract.prerequisites_frozen === true
    && browserProgramContract.execution_methods === 0
    && browserProgramContract.raw_protocol_access === false
    && browserProgramContract.arbitrary_page_code === false
    && browserProgramContract.executable_method_names.length === 0, browserProgramContract, {
    summary: 'BRW-001 remains fail-closed: the artifact lacks the exact immutable, non-executable BrowserAction, Browser Program, and Expert Browser Program projection boundary.',
    boundary: 'browser_concept_contract_exposure'
  });

  await page.locator('[data-action="browser-scm-tab"][data-tab="performance"]').click({ force: true });
  const hiddenIdentityBefore = await page.evaluate(() => ({
    work_id: document.querySelector('#workspace-browser-scm [data-observable-work-id]')?.getAttribute('data-observable-work-id') || null,
    cancellation_count: document.querySelectorAll('#workspace-browser-scm [data-work-cancelled="true"]').length,
    performance_cards: document.querySelectorAll('#workspace-browser-scm .systems-contract-card').length
  }));
  await page.locator('[data-action="browser-scm-tab"][data-tab="browser"]').click({ force: true });
  const hiddenIdentityAfter = await page.evaluate(previous => ({
    work_id: document.querySelector(`[data-observable-work-id="${CSS.escape(previous || '')}"]`)?.getAttribute('data-observable-work-id') || null,
    performance_cards: [...document.querySelectorAll('#workspace-browser-scm .systems-contract-card h3')].filter(node => node.textContent.trim() === 'Truthful responsive work').length,
    cancellation_count: document.querySelectorAll('[data-work-cancelled="true"]').length
  }), hiddenIdentityBefore.work_id);
  await record('continuation.hidden_paint_owner_identity', hiddenIdentityBefore.performance_cards > 0 && hiddenIdentityBefore.work_id && hiddenIdentityAfter.work_id === hiddenIdentityBefore.work_id && hiddenIdentityAfter.performance_cards === 0 && hiddenIdentityAfter.cancellation_count === hiddenIdentityBefore.cancellation_count, { before: hiddenIdentityBefore, after: hiddenIdentityAfter }, {
    summary: 'Hidden/offscreen paint suppression is not paired with an observable durable owner-work identity proving that viewer removal did not cancel work.'
  });

  const continuationProbe = await page.evaluate(async () => {
    const api = window.PM7_PERFORMANCE_TEST_API;
    if (!api || typeof api.probeDedupStaleGeneration !== 'function') return { available: false };
    const value = await api.probeDedupStaleGeneration();
    return { available: true, value };
  });
  await record('continuation.dedup_and_stale_generation', continuationProbe.available && continuationProbe.value?.coalesced === true && continuationProbe.value?.stale_generation_rejected === true && continuationProbe.value?.operation_id_preserved === true, continuationProbe, {
    summary: 'No observable deterministic dedup/stale-generation probe proves coalescing, rejection, and operation identity.'
  });
  const returnProbe = await page.evaluate(async () => {
    const api = window.PM7_PERFORMANCE_TEST_API;
    if (!api || typeof api.probeIdentityContinuity !== 'function') return { available: false };
    const value = await api.probeIdentityContinuity(['reconnect', 'restart', 'sleep', 'external-return']);
    return { available: true, value };
  });
  await record('continuation.identity_across_returns', returnProbe.available && ['operation_id', 'session_id', 'stream_id', 'upload_id'].every(key => returnProbe.value?.preserved?.includes(key)) && returnProbe.value?.stale_generation_rejected === true, returnProbe, {
    summary: 'No observable concept probe preserves operation/session/stream/upload identities across reconnect, restart, sleep, and external return.'
  });
  const admissionProbe = await page.evaluate(async () => {
    const api = window.PM7_PERFORMANCE_TEST_API;
    if (!api || typeof api.probeAdmissionBeforeHydration !== 'function') return { available: false };
    const value = await api.probeAdmissionBeforeHydration();
    return { available: true, value };
  });
  await record('security.auth_rate_admission_before_hydration', admissionProbe.available && admissionProbe.value?.auth_checked_before_hydration === true && admissionProbe.value?.rate_checked_before_hydration === true && admissionProbe.value?.rejected_hydration_count === 0, admissionProbe, {
    summary: 'No observable probe proves authentication and rate admission occur before expensive hydration.'
  });

  const lowResource = await page.evaluate(() => {
    const api = window.PM7_GUIDED_TOUR;
    if (!api?.start || !api?.snapshot) return { available: false };
    const started = api.start({ source: 'performance-verifier', low_resource_profile: true });
    const snapshot = api.snapshot();
    api.skip?.();
    return { available: true, started, snapshot };
  });
  await record('governor.low_resource_projection', lowResource.available && lowResource.started?.low_resource_profile === true && lowResource.snapshot?.low_resource_profile === true, lowResource, {
    summary: 'The live-shell concept does not expose its low-resource projection through an observable state.'
  });

  const reversal = await page.evaluate(() => {
    const api = window.PM7_GUIDED_TOUR;
    if (!api?.start || !api?.snapshot || !api?.back || !api?.resume) return { available: false };
    const started = api.start({ source: 'performance-verifier', step: 'shell_navigation' });
    const before = api.snapshot();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    const interrupted = api.snapshot();
    const resumed = api.resume();
    const reversed = api.back();
    api.skip?.();
    return { available: true, started, before, interrupted, resumed, reversed };
  });
  await record('continuation.interruption_and_reversal', reversal.available && reversal.interrupted?.status === 'paused' && reversal.interrupted?.open === false && reversal.resumed?.open === true && reversal.reversed !== false, reversal, {
    summary: 'The live-shell flow did not expose interruption, resume, and reversal as observable state transitions.'
  });

  const onboarding = await page.evaluate(() => {
    const api = window.PM7_ONBOARDING_CINEMATIC;
    if (!api?.replay || !api?.snapshot) return { available: false };
    const replay = api.replay({ provider: true, origin: true });
    const actions = [...document.querySelectorAll('#pm7-onboarding [data-ui-action-id]')].map(node => node.dataset.uiActionId);
    const text = document.getElementById('pm7-onboarding')?.innerText || '';
    api.skip?.();
    return { available: true, replay, actions, text };
  });
  await record('onboarding.simple_flow_available', onboarding.available && onboarding.replay?.screen === 'welcome' && onboarding.actions.includes('ui.onboarding.start') && onboarding.text.includes('Get Started'), onboarding, {
    summary: 'The simple Product Onboarding entry state is not observably mounted.'
  });
  await record('onboarding.owner_flow_separation', onboarding.available && !/installation grid|diagnostic dashboard|provider matrix/i.test(onboarding.text), { text: onboarding.text?.slice(0, 2000) }, {
    summary: 'Product Onboarding exposes advanced owner configuration instead of a simple owner-flow handoff.'
  });

  await openSettings('system', 'doctor');
  const providerTruth = await page.evaluate(() => {
    const item = document.querySelector('[data-doctor-item="provider-route"]');
    return item ? { text: item.innerText, status: item.querySelector('.doctor-state')?.textContent.trim() || null } : null;
  });
  await record('truth.provider_readiness_usage_separate', Boolean(providerTruth && /Provider route/.test(providerTruth.text) && !/usage ready|price ready|settled/i.test(providerTruth.text)), providerTruth, {
    summary: 'Provider readiness is absent or conflated with Usage, price, or settlement.'
  });

  await record('factory.basic_dark_and_chat', factoryAtBoot.theme === 'basic-dark' && factoryAtBoot.chat_visible, factoryAtBoot, {
    summary: 'The untouched factory state is not Basic Dark with Chat visible.'
  });
  await record('factory.panel_one_only', factoryAtBoot.visible_editor_panels.length === 1 && factoryAtBoot.visible_editor_panels[0] === 'editor_panel_1' && factoryAtBoot.panel_one_file_tabs >= 7, factoryAtBoot, {
    summary: 'The untouched factory state does not expose only Panel 1 with at least seven merged file tabs.'
  });
  await record('factory.workspace_and_automation_panel_one', factoryAtBoot.preview_in_panel_one && factoryAtBoot.automation_in_panel_one && factoryAtBoot.automation_hidden, factoryAtBoot, {
    summary: 'Workspace preview and hidden automation session are not both owned by Panel 1.'
  });

  const customizationBefore = await page.evaluate(() => {
    const projectId = window.PM7_SETTINGS_TOME?.project?.()?.id || null;
    const storageKey = projectId ? `pm7:settings:tome-tabs:v1:${encodeURIComponent(projectId)}` : null;
    const accepted = window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Friendly Light');
    const projection = storageKey ? JSON.parse(localStorage.getItem(storageKey) || 'null') : null;
    return {
      accepted,
      project_id: projectId,
      storage_key: storageKey,
      theme: document.documentElement.getAttribute('data-theme'),
      model_value: window.PM12_KIMI.getState()?.settings?.['general.visual.theme'] || null,
      stored_value: projection?.settings?.['general.visual.theme'] || null
    };
  });
  const warmReloadStarted = Date.now();
  await main.guard.reloadBound(page, {
    navigation_id: 'main-performance:warm-reload',
    wait_until: 'load',
    timeout_ms: 180000
  });
  await page.waitForFunction(() => Boolean(window.PM12_KIMI && window.PM7_SYSTEMS_INTEGRATION));
  const warmReloadWallMs = Date.now() - warmReloadStarted;
  const customizationAfter = await page.evaluate(storageKey => {
    const projection = storageKey ? JSON.parse(localStorage.getItem(storageKey) || 'null') : null;
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      model_value: window.PM12_KIMI.getState()?.settings?.['general.visual.theme'] || null,
      stored_value: projection?.settings?.['general.visual.theme'] || null,
      systems_ready: Boolean(window.PM7_SYSTEMS_INTEGRATION)
    };
  }, customizationBefore.storage_key);
  await record('factory.customization_survives_reload', customizationBefore.accepted === true
    && Boolean(customizationBefore.project_id)
    && customizationBefore.model_value === 'Friendly Light'
    && customizationBefore.stored_value === 'Friendly Light'
    && customizationAfter.model_value === 'Friendly Light'
    && customizationAfter.stored_value === 'Friendly Light'
    && customizationAfter.theme === 'friendly-light', { before: customizationBefore, after: customizationAfter }, {
    summary: 'A saved non-factory theme did not survive reload.'
  });
  await record('startup.cold_warm_shell', Number.isFinite(boot.load_wall_ms) && boot.load_wall_ms > 0 && warmReloadWallMs > 0 && customizationAfter.systems_ready, { cold_wall_ms: boot.load_wall_ms, warm_reload_wall_ms: warmReloadWallMs, threshold_claim: null, boundary: 'browser shell timing only' }, {
    summary: 'Cold/warm browser shell timing or the warm-ready projection could not be observed.', boundary: 'browser_shell_only'
  });

  const pacing = await page.evaluate(samples => new Promise(resolvePacing => {
    const times = [];
    const tick = now => {
      times.push(now);
      if (times.length >= samples + 1) resolvePacing(times);
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), sampleCount);
  const intervals = pacing.slice(1).map((value, index) => value - pacing[index]).filter(value => value > 0 && Number.isFinite(value));
  const pacingResult = {
    sample_count: intervals.length,
    p50_ms: fixed(percentile(intervals, 0.50)),
    p95_ms: fixed(percentile(intervals, 0.95)),
    p99_ms: fixed(percentile(intervals, 0.99)),
    worst_ms: fixed(Math.max(...intervals)),
    delayed_over_20ms: intervals.filter(value => value > 20).length,
    delayed_over_33_4ms: intervals.filter(value => value > 33.4).length,
    dropped_frame_equivalent: intervals.reduce((total, value) => total + Math.max(0, Math.round(value / 16.7) - 1), 0),
    target_frame_ms: 16.7,
    certification: 'browser-rAF prototype evidence only'
  };
  report.measurements.raf_frame_pacing = pacingResult;
  await record('pacing.raf_percentiles', intervals.length === sampleCount && pacingResult.p95_ms <= 33.4 && pacingResult.p99_ms <= 50.1 && pacingResult.worst_ms <= 100, pacingResult, {
    summary: 'Browser rAF pacing exceeded the provisional prototype envelope.',
    boundary: 'browser_raf_only'
  });

  const reducedCase = await makeContext('reduced-motion', { reducedMotion: true });
  const reduced = await reducedCase.page.evaluate(() => {
    window.PM7_SETTINGS_COMMANDS.open({ domain: 'source', workspace: 'browser-scm' });
    window.PM12_KIMI.dispatchAction('browser-scm-tab', { tab: 'performance' });
    const nodes = [...document.querySelectorAll('#workspace-browser-scm .systems-contract-card')];
    return {
      media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      nodes: nodes.map(node => ({ animation: getComputedStyle(node).animationDuration, transition: getComputedStyle(node).transitionDuration }))
    };
  });
  const immediateDuration = value => String(value).split(',').every(part => {
    const token = part.trim().toLowerCase();
    const numeric = Number.parseFloat(token);
    if (!Number.isFinite(numeric)) return false;
    const milliseconds = token.endsWith('ms') ? numeric : token.endsWith('s') ? numeric * 1000 : numeric;
    return milliseconds <= 1;
  });
  await record('presentation.reduced_motion', reduced.media && reduced.nodes.length > 0 && reduced.nodes.every(row => immediateDuration(row.animation) && immediateDuration(row.transition)), reduced, {
    summary: 'Performance surfaces retain animation/transition durations above the 1ms immediate threshold under reduced motion.'
  });
  await reducedCase.context.close();
  page = main.page;

  await record('runtime.console_and_page_errors', report.runtime_errors.length === 0, report.runtime_errors, {
    summary: 'Console or page errors occurred during the performance matrix.', screenshot: false
  });
  await main.context.close();
} catch (error) {
  report.runtime_errors.push({ kind: 'harness', text: String(error?.stack || error) });
  await record('harness.completed', false, { error: String(error?.stack || error) }, {
    summary: 'The full-thread performance verifier did not complete.', screenshot: false
  });
} finally {
  try { await provenanceRun.finalizeBeforeBrowserClose(browser); }
  catch (error) { report.runtime_errors.push({ kind: 'provenance-pre-close', text: String(error?.stack || error) }); }
  try { await browser.close(); }
  catch (error) { report.runtime_errors.push({ kind: 'browser-close', text: String(error?.stack || error) }); }
  try { report.provenance = await provenanceRun.finalizeAfterBrowserClose(); }
  catch (error) {
    report.runtime_errors.push({ kind: 'provenance-post-close', text: String(error?.stack || error) });
    report.provenance = provenanceRun.envelope;
  }

  let provenanceAdmissionError = null;
  try { assertProvenanceAdmission(report.provenance); }
  catch (error) { provenanceAdmissionError = String(error?.stack || error); }
  await record('shared_browser_provenance_admission', provenanceAdmissionError === null && report.provenance.admission?.pass === true, {
    admission: report.provenance.admission,
    error: provenanceAdmissionError,
    artifact: report.provenance.artifact,
    verifier: report.provenance.verifier,
    helper: report.provenance.helper,
    browser: report.provenance.browser,
    command: report.provenance.command,
    navigation_count: report.provenance.navigations?.length,
    network: report.provenance.network,
    certification_boundary: report.provenance.certification_boundary
  }, {
    summary: 'The shared immutable browser-provenance envelope was not admitted.',
    screenshot: false
  });
  await record('evidence.exact_browser_only_boundary',
    JSON.stringify(report.provenance.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(report.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
      JSON.stringify(report.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY),
    {
      provenance_boundary: report.provenance.certification_boundary,
      certification_boundary: report.certification_boundary,
      execution_boundary: report.execution_boundary
    }, {
      summary: 'The report boundary differs from the exact shared browser-concept-only boundary.',
      screenshot: false
    });
  await record('shared_provenance_runtime_clean', report.runtime_errors.length === 0 && report.provenance.runtime_errors.count === 0, {
    verifier: report.runtime_errors,
    provenance: report.provenance.runtime_errors
  }, {
    summary: 'The verifier or shared provenance envelope observed runtime errors.',
    screenshot: false
  });

  const checksById = new Map(report.checks.map(row => [row.id, row]));
  report.scenario_coverage = SCENARIOS.map(row => {
    const checks = row.check_ids.map(id => checksById.get(id) || { id, pass: false, absent: true });
    let status;
    if (!row.check_ids.length) status = row.evidence_scope;
    else if (checks.every(check => check.pass)) status = row.evidence_scope === 'browser_applicable' ? 'browser_checks_passed' : 'browser_partial_checks_passed';
    else status = 'browser_findings_present';
    return { ...row, status, checks: checks.map(check => ({ id: check.id, pass: Boolean(check.pass), absent: Boolean(check.absent) })) };
  });

  report.topic_coverage = TOPICS.map(topic => {
    const prefix = topic.topic_id.split('-')[0];
    const checkIds = TOPIC_CHECKS[topic.topic_id] || [];
    const checks = checkIds.map(id => checksById.get(id) || { id, pass: false, absent: true });
    let evidence_scope;
    let status;
    if (checkIds.length) {
      evidence_scope = 'pm7_browser_applicable';
      status = checks.every(check => check.pass) ? 'browser_checks_passed' : 'browser_findings_present';
    } else if (STATIC_PREFIXES.has(prefix) || STATIC_TOPIC_IDS.has(topic.topic_id)) {
      evidence_scope = 'static_governance_or_ci_required';
      status = 'not_certified_by_browser_verifier';
    } else if (BROWSER_PREFIXES.has(prefix)) {
      evidence_scope = 'pm7_browser_semantic_without_dedicated_check';
      status = 'browser_finding_missing_topic_probe';
    } else {
      evidence_scope = 'native_runtime_platform_or_hardware_required';
      status = 'not_certified_by_browser_verifier';
    }
    return { ...topic, evidence_scope, status, check_ids: checkIds, checks: checks.map(check => ({ id: check.id, pass: Boolean(check.pass), absent: Boolean(check.absent) })) };
  });

  const failed = report.checks.filter(check => !check.pass).length;
  const missingTopicProbes = report.topic_coverage.filter(row => row.status === 'browser_finding_missing_topic_probe').length;
  const browserScenarioFindings = report.scenario_coverage.filter(row => row.status === 'browser_findings_present').length;
  report.summary = {
    checks_total: report.checks.length,
    checks_passed: report.checks.length - failed,
    checks_failed: failed,
    scenarios_total: report.scenario_coverage.length,
    scenario_browser_findings: browserScenarioFindings,
    topics_total: report.topic_coverage.length,
    topics_with_browser_checks: report.topic_coverage.filter(row => row.check_ids.length > 0).length,
    topics_missing_browser_probe: missingTopicProbes,
    topics_explicitly_routed_outside_browser: report.topic_coverage.filter(row => row.status === 'not_certified_by_browser_verifier').length,
    runtime_errors: report.runtime_errors.length
  };
  const exactCensus = report.scenario_coverage.length === 19 && report.topic_coverage.length === 85;
  report.disposition = failed === 0 && missingTopicProbes === 0 && browserScenarioFindings === 0 && report.runtime_errors.length === 0 && exactCensus
    ? 'browser_checks_passed_with_native_boundaries_open'
    : 'browser_findings_present';
  writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ disposition: report.disposition, evidence: evidencePath, summary: report.summary }));
  process.exitCode = report.disposition === 'browser_checks_passed_with_native_boundaries_open' ? 0 : 1;
}
