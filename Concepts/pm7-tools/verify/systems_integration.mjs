/* PMConcept7 T46 Settings/Doctor/system-consumer browser verification.
 *
 * This is browser-concept evidence only.  It deliberately does not certify
 * native Slint, production owners, runtime wiring, or old-hardware behavior.
 *
 * Usage:
 *   node systems_integration.mjs \
 *     --file /absolute/path/to/PMConcept7.html \
 *     --outdir /absolute/path/to/evidence-directory \
 *     --modules /path/containing/node_modules/playwright-core \
 *     --chromium /usr/bin/google-chrome \
 *     --expected-artifact-sha256 <sha256> --expected-verifier-sha256 <sha256> \
 *     --expected-helper-sha256 <sha256>
 *
 * Screenshots are written inside the evidence directory only when a check fails.
 */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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
const EXPECTED_DOCTOR_LOCAL_ACTIONS = ['ui.doctor.open', 'ui.doctor.open_details', 'ui.doctor.open_logs', 'ui.doctor.open_receipt', 'ui.doctor.open_remediation', 'ui.doctor.refresh_visible', 'ui.doctor.run_check'];
const CONSUMER_AUDIT_SCHEMA = 'pm.pm7_consumer_audit.v1';
const EXPECTED_CONSUMER_LOCAL_ACTION_COUNT = 39;
const EXPECTED_CONSUMER_COMMAND_MEMBERSHIP_COUNT = 103;
const EXPECTED_CONSUMER_COMMAND_IDENTITY_COUNT = 102;
const EXPECTED_CONSUMER_LOCAL_ACTION_IDS_SHA256 = 'c312f11bf5fb43ffb1c2d165b04de4e67a0acf55fbad6a1bacafd0f5c008427c';
const EXPECTED_CONSUMER_COMMAND_MEMBERSHIPS_SHA256 = '2bf2329159401fa36bd60dd35a6726318234ff3bd8a598efb8b707d6e2abf0fa';
const EXPECTED_CONSUMER_COMMAND_IDENTITIES_SHA256 = '7b9c698e4579708898f4c770898fbf71e99107eda2831d285e878ad4c37bfc0f';
const EXPECTED_PROTECTED_LOCAL_ACTION_IDS = ['ui.auth_session.close_secure_browser', 'ui.auth_session.copy_device_code', 'ui.auth_session.open_details'];
const EXPECTED_RETAINED_ONBOARDING_LOCAL_ACTION_IDS = ['ui.onboarding.back', 'ui.onboarding.close', 'ui.onboarding.defer', 'ui.onboarding.finish', 'ui.onboarding.next', 'ui.onboarding.open_details', 'ui.onboarding.skip', 'ui.onboarding.start'];
const EXPECTED_RETAINED_PROJECT_SYNC_LOCAL_ACTION_IDS = ['ui.settings.project_sync.client.inspect', 'ui.settings.project_sync.location.preview_add', 'ui.settings.project_sync.location.preview_edit', 'ui.settings.project_sync.project.preview_move'];
const EXPECTED_VISIBLE_COMMAND_IDS = [
  'cmd.auth_profile.rename', 'cmd.doctor.export_report', 'cmd.execution_host.capabilities.refresh',
  'cmd.execution_host.register', 'cmd.execution_host.test', 'cmd.goal.pause',
  'cmd.project.duplicate_configuration', 'cmd.project.duplicate_with_history',
  'cmd.project.move.preflight', 'cmd.project.move.start', 'cmd.project.source_location.add',
  'cmd.project.source_location.update', 'cmd.source_control.workspace.create',
  'cmd.source_control.workspace.switch', 'cmd.update.app.automatic.set_enabled',
  'cmd.update.app.check', 'cmd.update.app.rollback'
];
const EXPECTED_EXACT_EXISTING_COMMAND_IDS = ['cmd.integration.connection.open_details', 'cmd.source_control.status.refresh'];
const EXPECTED_PLUGIN_COMMAND_IDS = [
  'cmd.agent_plugin.scan', 'cmd.agent_plugin.install', 'cmd.agent_plugin.update',
  'cmd.agent_plugin.enable', 'cmd.agent_plugin.disable', 'cmd.agent_plugin.reload',
  'cmd.agent_plugin.remove', 'cmd.agent_plugin.validate', 'cmd.agent_plugin.review_changes',
  'cmd.agent_plugin.rollback', 'cmd.agent_plugin.open_details', 'cmd.agent_plugin.open_logs'
].sort();
const EXPECTED_EXISTING_SERVER_OWNER_COMMAND_IDS = [
  'cmd.client.pair.approve', 'cmd.client.pair.cancel', 'cmd.client.pair.reject',
  'cmd.client.pair.start', 'cmd.client.revoke', 'cmd.server.bootstrap.start'
].sort();
const LIVE_AUTHORED_BINDING_KEYS = new Set(['systems_source', 'systems_verifier', 'generated_artifact']);
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

function jsonDigest(value) {
  return sha256Bytes(Buffer.from(JSON.stringify(value), 'utf8'));
}

function compactLocalAction(row) {
  return {
    action_id: row.action_id,
    actionable_disposition: row.actionable_disposition,
    required_routes: {
      central_catalog: row.required_routes.central_catalog,
      palette_or_api: row.required_routes.palette_or_api,
      headless_dispatch: row.required_routes.headless_dispatch,
      settings: row.required_routes.settings,
      onboarding: row.required_routes.onboarding,
      doctor: row.required_routes.doctor,
      owner_gui_consumers: row.required_routes.owner_gui_consumers,
      synthetic_one_control_per_command_required: row.required_routes.synthetic_one_control_per_command_required
    }
  };
}

function compactCommandMembership(row) {
  return {
    origin: row.origin,
    command_id: row.command_id,
    membership_index: row.membership_index,
    required_routes: {
      central_catalog: row.required_routes.central_catalog,
      palette_or_api: row.required_routes.palette_or_api,
      headless_dispatch: row.required_routes.headless_dispatch,
      settings: row.required_routes.settings,
      onboarding: row.required_routes.onboarding,
      doctor: row.required_routes.doctor,
      owner_gui_consumers: row.required_routes.owner_gui_consumers,
      synthetic_one_control_per_command_required: row.required_routes.synthetic_one_control_per_command_required
    }
  };
}

function schemaPointerStatus(row) {
  const pointerText = String(row?.typed_contract_refs || '').split(' (', 1)[0];
  const match = pointerText.match(/^(Plans\/[^#]+)#\/\$defs\/([^\s]+)$/);
  if (!match) return { action_id: row?.action_id || null, pointer: pointerText, resolved: false, reason: 'typed_contract_ref_unparseable', missing_defs: [] };
  const schemaPath = resolve(repoRoot, match[1]);
  const requiredDefs = match[2].split('|');
  if (!existsSync(schemaPath)) return { action_id: row.action_id, pointer: pointerText, schema_path: schemaPath, resolved: false, reason: 'schema_file_missing', missing_defs: requiredDefs };
  try {
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
    const missingDefs = requiredDefs.filter(definition => !schema?.$defs?.[definition]);
    return { action_id: row.action_id, pointer: pointerText, schema_path: schemaPath, resolved: missingDefs.length === 0, reason: missingDefs.length ? 'schema_defs_missing' : 'exact_schema_pointer_present', missing_defs: missingDefs };
  } catch (error) {
    return { action_id: row.action_id, pointer: pointerText, schema_path: schemaPath, resolved: false, reason: `schema_parse_failed:${String(error)}`, missing_defs: requiredDefs };
  }
}

function validateConsumerAudit(auditPath) {
  const errors = [];
  if (!existsSync(auditPath)) return { pass: false, schema_pointers_pass: false, errors: [`missing consumer audit: ${auditPath}`], path: auditPath, local_actions: [], command_memberships: [], schema_pointer_statuses: [] };
  let bytes;
  let audit;
  try {
    bytes = readFileSync(auditPath);
    audit = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    return { pass: false, schema_pointers_pass: false, errors: [`invalid consumer audit: ${String(error)}`], path: auditPath, local_actions: [], command_memberships: [], schema_pointer_statuses: [] };
  }
  if (audit.schema_id !== CONSUMER_AUDIT_SCHEMA) errors.push(`schema_id must be ${CONSUMER_AUDIT_SCHEMA}`);
  const localRows = Array.isArray(audit.typed_local_actions) ? audit.typed_local_actions : [];
  const commandRows = Array.isArray(audit.command_memberships) ? audit.command_memberships : [];
  const commandIds = [...new Set(commandRows.map(row => row.command_id))].sort();
  if (localRows.length !== EXPECTED_CONSUMER_LOCAL_ACTION_COUNT || new Set(localRows.map(row => row.action_id)).size !== EXPECTED_CONSUMER_LOCAL_ACTION_COUNT) errors.push('typed-local-action denominator or uniqueness mismatch');
  if (commandRows.length !== EXPECTED_CONSUMER_COMMAND_MEMBERSHIP_COUNT) errors.push('command-membership denominator mismatch');
  if (commandIds.length !== EXPECTED_CONSUMER_COMMAND_IDENTITY_COUNT) errors.push('command identity-union denominator mismatch');
  const origins = Object.fromEntries(['adjudicated_new', 'egolite_retained', 'existing_alias_target'].map(origin => [origin, commandRows.filter(row => row.origin === origin).length]));
  if (JSON.stringify(origins) !== JSON.stringify({ adjudicated_new: 86, egolite_retained: 6, existing_alias_target: 11 })) errors.push('command-membership origin breakdown mismatch');
  const localDigest = jsonDigest(localRows.map(row => row.action_id).sort());
  const membershipDigest = jsonDigest(commandRows.map(row => [row.origin, row.command_id]).sort());
  const identityDigest = jsonDigest(commandIds);
  if (localDigest !== EXPECTED_CONSUMER_LOCAL_ACTION_IDS_SHA256) errors.push('consumer local-action membership digest mismatch');
  if (membershipDigest !== EXPECTED_CONSUMER_COMMAND_MEMBERSHIPS_SHA256) errors.push('consumer command-membership digest mismatch');
  if (identityDigest !== EXPECTED_CONSUMER_COMMAND_IDENTITIES_SHA256) errors.push('consumer command identity-union digest mismatch');
  for (const row of localRows) {
    if (!row?.action_id?.startsWith('ui.') || row.required_routes?.central_catalog !== 'excluded_local_action' || row.required_routes?.headless_dispatch !== 'not_a_domain_command' || row.required_routes?.synthetic_one_control_per_command_required !== false) errors.push(`${row?.action_id || '<unknown>'}: local route classification drifted`);
  }
  for (const row of commandRows) {
    if (!row?.command_id?.startsWith('cmd.') || row.required_routes?.central_catalog !== 'required' || row.required_routes?.headless_dispatch !== 'available_through_canonical_dispatch; no PM7 control required' || row.required_routes?.synthetic_one_control_per_command_required !== false) errors.push(`${row?.origin || '<unknown>'}:${row?.command_id || '<unknown>'}: command route classification drifted`);
  }
  const gapRows = localRows.filter(row => row.actionable_disposition !== 'no_authored_identity_gap; retain owner-local typed boundary');
  if (gapRows.length !== 31) errors.push(`typed-local-action gap denominator ${gapRows.length} != 31`);
  const protectedRows = localRows.filter(row => row.actionable_disposition === 'implement_only_in_protected_human_auth_surface; do_not_add_general_PM7_or_agent_control').map(row => row.action_id).sort();
  if (JSON.stringify(protectedRows) !== JSON.stringify([...EXPECTED_PROTECTED_LOCAL_ACTION_IDS].sort())) errors.push('protected human-only local-action membership mismatch');
  const schemaPointerStatuses = localRows.map(schemaPointerStatus);
  return {
    pass: errors.length === 0,
    schema_pointers_pass: schemaPointerStatuses.every(row => row.resolved),
    errors,
    path: auditPath,
    sha256: sha256Bytes(bytes),
    audit,
    local_actions: localRows.map(compactLocalAction),
    command_memberships: commandRows.map(compactCommandMembership),
    command_ids: commandIds,
    origins,
    digests: { local_action_ids_sha256: localDigest, command_memberships_sha256: membershipDigest, command_identity_union_sha256: identityDigest },
    schema_pointer_statuses: schemaPointerStatuses,
    unresolved_schema_pointer_actions: schemaPointerStatuses.filter(row => !row.resolved).map(row => row.action_id),
    typed_local_action_gaps: gapRows.map(row => row.action_id)
  };
}

function parseSourceConsumerRows(source, startMarker, endMarker, prefix) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) return [];
  return source.slice(start, end).split('\n').map(line => line.trim().replace(/,$/, '')).filter(line => line.startsWith(prefix)).map(line => JSON.parse(line));
}

function validateConsumerSource(source, auditValidation) {
  const errors = [];
  const localRaw = parseSourceConsumerRows(source, 'const PM7_SERVER_GAP_LOCAL_ACTION_ROWS=', 'const PM7_SERVER_GAP_COMMAND_MEMBERSHIPS=', '["ui.');
  const commandRaw = parseSourceConsumerRows(source, 'const PM7_SERVER_GAP_COMMAND_MEMBERSHIPS=', 'const PM7_SERVER_GAP_VISIBLE_COMMAND_IDS=', '["');
  const expectedLocalRaw = auditValidation.local_actions.map(row => [row.action_id, row.actionable_disposition, row.required_routes.settings, row.required_routes.onboarding, row.required_routes.doctor, row.required_routes.owner_gui_consumers]);
  const expectedCommandRaw = auditValidation.command_memberships.map(row => [row.origin, row.command_id, row.required_routes.palette_or_api, row.required_routes.settings, row.required_routes.onboarding, row.required_routes.doctor, row.required_routes.owner_gui_consumers]);
  if (JSON.stringify(localRaw) !== JSON.stringify(expectedLocalRaw)) errors.push('authored source local-action projection differs from all 39 audit rows');
  if (JSON.stringify(commandRaw) !== JSON.stringify(expectedCommandRaw)) errors.push('authored source command projection differs from all 103 audit memberships');
  const paletteMatch = source.match(/PM7_SERVER_GAP_PALETTE_REQUIRED_LOCAL_ACTION_IDS=Object\.freeze\(\[([^\]]*)\]\)/);
  const sourcePaletteRequired = paletteMatch ? [...paletteMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1]).sort() : [];
  const expectedPaletteRequired = auditValidation.local_actions.filter(row => row.required_routes.palette_or_api === 'required').map(row => row.action_id).sort();
  if (JSON.stringify(sourcePaletteRequired) !== JSON.stringify(expectedPaletteRequired)) errors.push('authored source local-action palette/API classification differs from audit');
  for (const [label, expected] of [
    ['RETAINED_PROJECT_SYNC_LOCAL_ACTION_IDS', EXPECTED_RETAINED_PROJECT_SYNC_LOCAL_ACTION_IDS],
    ['PROTECTED_LOCAL_ACTION_IDS', EXPECTED_PROTECTED_LOCAL_ACTION_IDS],
    ['RETAINED_ONBOARDING_LOCAL_ACTION_IDS', EXPECTED_RETAINED_ONBOARDING_LOCAL_ACTION_IDS],
    ['VISIBLE_COMMAND_IDS', EXPECTED_VISIBLE_COMMAND_IDS],
    ['EXACT_EXISTING_COMMAND_IDS', EXPECTED_EXACT_EXISTING_COMMAND_IDS]
  ]) {
    const match = source.match(new RegExp(`PM7_SERVER_GAP_${label}=Object\\.freeze\\(\\[([^\\]]*)\\]\\)`));
    const actual = match ? [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]).sort() : [];
    if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) errors.push(`authored source ${label} exact membership mismatch`);
  }
  for (const actionId of EXPECTED_PROTECTED_LOCAL_ACTION_IDS) {
    if (source.includes(`pm7ConsumerButton('local','${actionId}'`) || source.includes(`data-ui-action-id="${actionId}"`)) errors.push(`${actionId}: protected human-only action mounted in ordinary PM7`);
  }
  const expectedVisibleLocalActions = auditValidation.local_actions.map(row => row.action_id).filter(id => !EXPECTED_PROTECTED_LOCAL_ACTION_IDS.includes(id) && !EXPECTED_RETAINED_ONBOARDING_LOCAL_ACTION_IDS.includes(id));
  for (const actionId of expectedVisibleLocalActions) {
    if (!source.includes(`pm7ConsumerButton('local','${actionId}'`) && !source.includes(`pm7TypedConsumerResult(el,'local','${actionId}'`)) errors.push(`${actionId}: no exact visible local-action-to-typed-emitter binding`);
  }
  for (const commandId of EXPECTED_VISIBLE_COMMAND_IDS) {
    if (!source.includes(`pm7ConsumerButton('command','${commandId}'`) && !source.includes(`pm7TypedConsumerResult(el,'command','${commandId}'`)) errors.push(`${commandId}: no exact visible command-to-typed-emitter binding`);
  }
  for (const digest of Object.values(auditValidation.digests || {})) if (!source.includes(digest)) errors.push(`authored source missing audit digest ${digest}`);
  const simulationTokens = ["concept_simulation_only:true", "native_binding:false", "handler_unavailable:true", "event_record:'not_emitted'", "runtime_receipt:'not_issued'", "production_mutation_dispatched:false", "exact_return:exactReturn", 'catalog_and_headless_dispatch_require_no_synthetic_PM7_control'];
  if (!simulationTokens.every(token => source.includes(token))) errors.push('authored source typed request/result or no-synthetic-control boundary incomplete');
  return { pass: errors.length === 0, errors, local_rows: localRaw.length, command_memberships: commandRaw.length, palette_required_local_actions: sourcePaletteRequired };
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
  const uniqueIds = new Set(ids);
  if (ids.some(id => typeof id !== 'string' || !id)) errors.push('every action_id must be a nonempty string');
  if (uniqueIds.size !== ids.length) errors.push('duplicate action_id');
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
  const doctorRows = actions.filter(row => EXPECTED_DOCTOR_LOCAL_ACTIONS.includes(row?.action_id)).sort((a, b) => a.action_id.localeCompare(b.action_id));
  if (JSON.stringify(doctorRows.map(row => row.action_id)) !== JSON.stringify([...EXPECTED_DOCTOR_LOCAL_ACTIONS].sort())) errors.push('Doctor local-action exact membership mismatch');
  for (const row of doctorRows) {
    if (row.kind !== 'local_ui' || row.disposition !== 'no-command' || row.browser_availability !== 'present_in_current_authored_source' || row.open_reason !== 'local_browser_action_only_no_production_command') errors.push(`${row.action_id}: Doctor local-action source disposition is not closed`);
  }
  const declaredNative = Array.isArray(manifest.native_only_cases) ? manifest.native_only_cases.map(row => row.case_id).sort() : [];
  if (JSON.stringify(declaredNative) !== JSON.stringify([...EXPECTED_NATIVE_ONLY_CASES].sort())) errors.push('native-only case census mismatch');
  for (const row of manifest.native_only_cases || []) {
    if (row.status !== 'not_run' || typeof row.residual !== 'string' || !row.residual) errors.push(`${row.case_id || '<unknown>'}: native-only case must be not_run with residual`);
  }
  const bindings = manifest.bindings && typeof manifest.bindings === 'object' ? manifest.bindings : {};
  const bindingStatuses = {};
  const exactLivePaths = {
    systems_source: 'Concepts/pm7-tools/systems_integration_source.py',
    systems_verifier: 'Concepts/pm7-tools/verify/systems_integration.mjs',
    generated_artifact: 'Concepts/PMConcept7.html'
  };
  for (const key of ['actionable_closure', 'systems_source', 'systems_verifier', 'performance_source', 'performance_verifier', 'generated_artifact']) {
    const binding = bindings[key];
    if (!binding || typeof binding.path !== 'string' || !binding.path || typeof binding.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(binding.sha256)) {
      errors.push(`binding ${key} missing path/sha256`);
      continue;
    }
    if (exactLivePaths[key] && binding.path !== exactLivePaths[key]) errors.push(`binding ${key} path must remain ${exactLivePaths[key]}`);
    const boundPath = resolve(repoRoot, binding.path);
    if (!existsSync(boundPath)) {
      errors.push(`binding ${key} path missing: ${binding.path}`);
      bindingStatuses[key] = { path: binding.path, declared_sha256: binding.sha256, actual_sha256: null, current_binding_mode: LIVE_AUTHORED_BINDING_KEYS.has(key) ? 'live_content_receipt' : 'manifest_pin', pass: false };
      continue;
    }
    const actualSha256 = sha256Bytes(readFileSync(boundPath));
    const liveAuthored = LIVE_AUTHORED_BINDING_KEYS.has(key);
    bindingStatuses[key] = { path: binding.path, declared_sha256: binding.sha256, actual_sha256: actualSha256, current_binding_mode: liveAuthored ? 'live_content_receipt' : 'manifest_pin', pass: liveAuthored || actualSha256 === binding.sha256 };
    if (!liveAuthored && actualSha256 !== binding.sha256) errors.push(`binding ${key} hash mismatch: ${binding.path}`);
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
    binding_statuses: bindingStatuses,
    manifest
  };
}

function validateCurrentAuthoringBindings({ targetPath, targetBytes, buildReportPath, impactValidation, consumerValidation }) {
  const errors = [];
  const systemsSourcePath = resolve(repoRoot, 'Concepts/pm7-tools/systems_integration_source.py');
  const systemsVerifierPath = scriptPath;
  const current = {
    impact_manifest: { path: impactValidation.path, sha256: impactValidation.sha256 || null },
    consumer_audit: { path: consumerValidation.path, sha256: consumerValidation.sha256 || null },
    systems_source: { path: systemsSourcePath, sha256: sha256Bytes(readFileSync(systemsSourcePath)) },
    systems_verifier: { path: systemsVerifierPath, sha256: sha256Bytes(readFileSync(systemsVerifierPath)) },
    generated_artifact: { path: targetPath, sha256: targetBytes ? sha256Bytes(targetBytes) : null },
    build_report: { path: buildReportPath, sha256: null }
  };
  let buildReport = null;
  if (!targetPath || !targetBytes) errors.push('live authored binding requires a local browser target');
  if (!buildReportPath || !existsSync(buildReportPath)) errors.push(`current build report missing: ${buildReportPath || '<unset>'}`);
  else {
    try {
      const buildReportBytes = readFileSync(buildReportPath);
      current.build_report.sha256 = sha256Bytes(buildReportBytes);
      buildReport = JSON.parse(buildReportBytes.toString('utf8'));
    } catch (error) {
      errors.push(`current build report invalid: ${String(error)}`);
    }
  }
  const systemsTransform = buildReport?.build_provenance?.authored_transform_sources_used?.find(row => row.path === 'Concepts/pm7-tools/systems_integration_source.py');
  if (buildReport) {
    if (buildReport.gates_all_pass !== true) errors.push('current build report gates_all_pass is not true');
    if (buildReport.output_sha256 !== current.generated_artifact.sha256) errors.push('current build report output hash differs from exercised browser target');
    if (!systemsTransform) errors.push('current build report lacks the T46 authored source provenance row');
    else if (systemsTransform.sha256 !== current.systems_source.sha256) errors.push('current build report T46 source hash differs from the current authored source');
  }
  const receiptInputs = Object.fromEntries(Object.entries(current).map(([key, value]) => [key, value.sha256]));
  return {
    pass: errors.length === 0,
    errors,
    current,
    authoring_set_sha256: jsonDigest(receiptInputs),
    build_report_summary: buildReport ? {
      gates_all_pass: buildReport.gates_all_pass === true,
      output_sha256: buildReport.output_sha256 || null,
      systems_source_provenance: systemsTransform || null
    } : null,
    declared_lineage_bindings: impactValidation.binding_statuses || {}
  };
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
const artifactPath = resolve(args.file);
const evidencePath = join(resolve(args.outdir), 'systems-integration-results.json');
const input = args.file;
const requireFromRuntime = createRequire(join(args.modules, 'noop.js'));
const { chromium } = requireFromRuntime('playwright-core');
const provenanceRun = await prepareProvenanceRun({
  verifierUrl: import.meta.url,
  artifactPath,
  expectedArtifactSha256: args['expected-artifact-sha256'],
  expectedVerifierSha256: args['expected-verifier-sha256'],
  expectedHelperSha256: args['expected-helper-sha256'],
  modulesPath: args.modules,
  chromiumPath: args.chromium,
  command: cli,
  effectiveConfig: {
    verifier: 'systems_integration',
    artifact_path: artifactPath,
    outdir: resolve(args.outdir),
    context_profiles: [
      '1440x900,dpr1,en-US,UTC,dark',
      '1440x900,dpr1,en-US,UTC,dark,reduced-motion'
    ],
    timeout_ms: 180000,
    service_workers: 'block',
    certification_mode: true
  }
});
mkdirSync(args.outdir, { recursive: true });

const impactManifestPath = resolve(join(scriptDir, 'actionable_closure_impact_manifest.json'));
const impactValidation = validateImpactManifest(impactManifestPath);
const consumerAuditPath = resolve(join(repoRoot, 'scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/pm7-consumer-audit/pm7-consumer-audit.json'));
const consumerValidation = validateConsumerAudit(consumerAuditPath);
const systemsSourcePath = resolve(repoRoot, 'Concepts/pm7-tools/systems_integration_source.py');
const systemsSource = readFileSync(systemsSourcePath, 'utf8');
const consumerSourceValidation = validateConsumerSource(systemsSource, consumerValidation);
const sourceCommands = [...new Set(systemsSource.match(/cmd\.[a-z0-9_.-]+/g) || [])].filter(id => !id.endsWith('.')).sort();
const pluginRegistryBand = systemsSource.split("const PM7_PLUGIN_COMMANDS=Object.freeze([", 2)[1]?.split(']);', 1)[0] || '';
const pluginRegistryIds = [...new Set([...pluginRegistryBand.matchAll(/\{id:'(cmd\.agent_plugin\.[a-z0-9_.-]+)'/g)].map(match => match[1]))].sort();
const pluginRegistryExact = JSON.stringify(pluginRegistryIds) === JSON.stringify(EXPECTED_PLUGIN_COMMAND_IDS);
const declaredCommandIds = new Set([...(impactValidation.action_ids || []), ...(consumerValidation.command_ids || []), ...pluginRegistryIds, ...EXPECTED_EXISTING_SERVER_OWNER_COMMAND_IDS]);
const implicitSourceCommands = sourceCommands.filter(id => !declaredCommandIds.has(id));
const sourceDoctorActions = [...new Set([...systemsSource.matchAll(/data-ui-action-id="(ui\.doctor\.[a-z0-9_.-]+)"/g)].map(match => match[1]))].sort();
const expectedDoctorActions = [...EXPECTED_DOCTOR_LOCAL_ACTIONS].sort();
const doctorActionMarkupExact = JSON.stringify(sourceDoctorActions) === JSON.stringify(expectedDoctorActions);
const doctorLocalHandlersPresent = ["case 'doctor-open-summary'", "case 'doctor-item-details'", "case 'doctor-item-logs'", "case 'doctor-item-receipt'", "case 'doctor-open-owner'", "case 'doctor-scope'", "case 'doctor-check-scope'"].every(token => systemsSource.includes(token));
const doctorEvidenceGuardsPresent = ['maxRows:3,maxBytes:1024', 'maxRows:1,maxBytes:2048', 'data-load-trigger="explicit_local_action"', 'data-redaction-state="${projection.redactionState}"', 'data-currentness-state="${projection.currentnessState}"'].every(token => systemsSource.includes(token));
const inventedDoctorCommands = sourceCommands.filter(id => (id === 'cmd.doctor' || id.startsWith('cmd.doctor.')) && id !== 'cmd.doctor.export_report');
const sourceSelfCheck = {
  schema_id: 'pm.pmconcept7.actionable_closure_impact_self_check.v1',
  verifier: 'systems_integration',
  pass: impactValidation.pass && consumerValidation.pass && consumerValidation.schema_pointers_pass && consumerSourceValidation.pass && pluginRegistryExact && implicitSourceCommands.length === 0 && doctorActionMarkupExact && doctorLocalHandlersPresent && doctorEvidenceGuardsPresent && inventedDoctorCommands.length === 0,
  manifest: { path: impactManifestPath, sha256: impactValidation.sha256 || null, errors: impactValidation.errors },
  consumer_audit: { path: consumerAuditPath, sha256: consumerValidation.sha256 || null, errors: consumerValidation.errors, digests: consumerValidation.digests, exact_source_projection: consumerSourceValidation },
  consumer_census: { typed_local_actions: consumerValidation.local_actions.length, typed_local_action_gaps: consumerValidation.typed_local_action_gaps.length, command_memberships: consumerValidation.command_memberships.length, command_identities: consumerValidation.command_ids.length, origins: consumerValidation.origins },
  consumer_schema_pointers: { pass: consumerValidation.schema_pointers_pass, unresolved_action_ids: consumerValidation.unresolved_schema_pointer_actions, rows: consumerValidation.schema_pointer_statuses },
  census: { actions: impactValidation.actions_total || 0, local_actions: impactValidation.local_actions || 0, commands: impactValidation.commands || 0 },
  implicit_source_commands: implicitSourceCommands,
  plugin_command_registry: { expected: EXPECTED_PLUGIN_COMMAND_IDS, actual: pluginRegistryIds, exact: pluginRegistryExact },
  retained_existing_server_owner_commands: EXPECTED_EXISTING_SERVER_OWNER_COMMAND_IDS,
  doctor_local_action_markup: { expected: expectedDoctorActions, actual: sourceDoctorActions, exact: doctorActionMarkupExact },
  doctor_local_handlers_present: doctorLocalHandlersPresent,
  doctor_evidence_guards_present: doctorEvidenceGuardsPresent,
  invented_doctor_commands: inventedDoctorCommands,
  native_only_cases: impactValidation.native_only_cases || []
};

const target = provenanceRun.artifactUrl();
const targetPath = artifactPath;
const sourceBytes = readFileSync(artifactPath);
const currentBuildReportPath = resolve(join(dirname(targetPath), 'build_report.json'));
const currentAuthoringValidation = validateCurrentAuthoringBindings({ targetPath, targetBytes: sourceBytes, buildReportPath: currentBuildReportPath, impactValidation, consumerValidation });
const geometryManifestPath = resolve(join(scriptDir, '..', 'k3_geometry_manifest.json'));
if (!existsSync(geometryManifestPath)) throw new Error(`missing K3 geometry manifest: ${geometryManifestPath}`);
const geometryManifestBytes = readFileSync(geometryManifestPath);
const geometryManifest = JSON.parse(geometryManifestBytes.toString('utf8'));
if (geometryManifest.schema_id !== 'pm.pmconcept7.k3_geometry_manifest.v1') throw new Error(`unsupported K3 geometry manifest: ${geometryManifest.schema_id}`);
const widths = geometryManifest.required_widths_px;
if (!Array.isArray(widths) || widths.length !== 18 || widths.some(width => !Number.isFinite(width)) || new Set(widths).size !== widths.length) throw new Error('K3 geometry manifest required_widths_px must contain exactly 18 unique numeric widths');
const geometryTolerance = geometryManifest.verification?.wide_measurement_tolerance_px;
if (!(Number.isFinite(geometryTolerance) && geometryTolerance >= 0)) throw new Error('K3 geometry manifest must provide a nonnegative measurement tolerance');
if (geometryManifest.verification?.document_horizontal_overflow_allowed !== false || geometryManifest.verification?.native_slint_certification !== false) throw new Error('K3 geometry manifest browser/no-overflow claim boundary drifted');
const geometrySelectors = geometryManifest.continuous_structure;
for (const key of ['root', 'rail', 'topbar', 'workspace_tabs', 'manager', 'portal_root']) {
  if (typeof geometrySelectors?.[key] !== 'string' || !geometrySelectors[key]) throw new Error(`K3 geometry manifest missing selector ${key}`);
}
const themes = ['friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'basic-light', 'basic-dark', 'glass-dark', 'glass-light'];
const humanStatuses = ['Ready', 'Ready with limits', 'Needs attention', 'Waiting for you', 'Checking', 'Managed externally', 'Unavailable', 'Blocked', 'Interrupted', 'Recovered', 'Stale', 'Unknown'];
const scopes = {
  all: ['server-trust', 'remote-route', 'backup-recovery', 'project-authority', 'source-control', 'auth-browser', 'provider-route', 'provider-cli', 'optional-capabilities', 'storage-integrity', 'performance', 'named-plans', 'plugin-manifest-resolution', 'plugin-conformance', 'plugin-containment', 'plugin-supply-chain', 'plugin-permission-review', 'plugin-runtime-bounds', 'plugin-rollback-health', 'plugin-promoted-routine'],
  server: ['server-trust', 'remote-route', 'backup-recovery'],
  project: ['project-authority', 'source-control'],
  integrations: ['auth-browser', 'provider-route', 'provider-cli', 'plugin-manifest-resolution', 'plugin-conformance', 'plugin-containment', 'plugin-supply-chain', 'plugin-permission-review'],
  runtime: ['optional-capabilities', 'storage-integrity', 'performance', 'named-plans', 'plugin-runtime-bounds', 'plugin-rollback-health', 'plugin-promoted-routine']
};
const doctorCoverageExpected = {
  'DOC-005': ['optional_off_unused_healthy', 'selected_task_requirement_blocks'],
  'DOC-008': ['exact_return_route', 'exact_focus_restore', 'currentness_fence', 'fresh_owner_result_required'],
  'DOC-013': ['sqlite_detected_blocked', 'sqlite_never_available'],
  'DOC-020': ['server_discovery', 'identity_dedupe', 'claim_pairing', 'trusted_client', 'endpoint_currentness'],
  'DOC-021': ['tailscale', 'headscale', 'serve', 'funnel', 'nginx', 'traefik', 'remote_link_direct', 'remote_link_relay', 'remote_link_e2e', 'remote_link_pairing', 'manual_endpoint', 'route_failover', 'route_resumption'],
  'DOC-022': ['route_health_independent', 'unused_optional_route_non_degrading'],
  'DOC-023': ['identity_mismatch_security', 'public_unclaimed_security', 'unsafe_public_surface_security', 'untrusted_proxy_headers_security'],
  'DOC-024': ['auth_url_redaction', 'auth_code_redaction', 'pairing_credential_redaction', 'recovery_credential_redaction', 'pre_auth_credential_redaction', 'relay_credential_redaction', 'private_key_redaction', 'access_key_redaction', 'sensitive_project_path_redaction']
};
const redactionClasses = ['auth_url', 'auth_code', 'pairing_credential', 'recovery_credential', 'pre_auth_credential', 'relay_credential', 'private_key', 'access_key', 'sensitive_project_path'];

function expectedK3Geometry(hostWidth) {
  const wide = geometryManifest.wide_geometry;
  if (hostWidth >= wide.minimum_host_width_px) {
    return { railWidthPx: wide.rail_width_px, topbarHeightPx: wide.topbar_height_px, band: 'wide', behavior: 'persistent wide rail' };
  }
  const band = geometryManifest.responsive_geometry.find(row => hostWidth >= row.minimum_host_width_px && hostWidth <= row.maximum_host_width_px);
  if (!band) throw new Error(`K3 geometry manifest does not cover Settings host width ${hostWidth}`);
  return { railWidthPx: band.rail_width_px, topbarHeightPx: band.topbar_height_px, band: `${band.minimum_host_width_px}-${band.maximum_host_width_px}`, behavior: band.behavior };
}

function closePx(actual, expected) {
  return Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= geometryTolerance;
}

mkdirSync(dirname(evidencePath), { recursive: true });
const screenshotDir = join(dirname(evidencePath), `${evidencePath.split('/').pop().replace(/\.json$/i, '')}-failures`);
const report = {
  schema_id: 'pm.pmconcept7.systems_integration_browser_verification.v1',
  disposition: 'fail',
  certification_boundary: { ...BROWSER_ONLY_BOUNDARY },
  execution_boundary: { ...BROWSER_ONLY_BOUNDARY },
  target: input,
  target_url: target,
  target_sha256: provenanceRun.envelope.artifact.sha256,
  provenance: provenanceRun.envelope,
  action_impact_manifest: impactManifestPath,
  action_impact_manifest_sha256: impactValidation.sha256 || null,
  action_impact_manifest_validation: {
    pass: impactValidation.pass,
    errors: impactValidation.errors,
    binding_statuses: impactValidation.binding_statuses,
    actions_total: impactValidation.actions_total || 0,
    local_actions: impactValidation.local_actions || 0,
    commands: impactValidation.commands || 0
  },
  current_authored_binding: currentAuthoringValidation,
  consumer_audit: consumerAuditPath,
  consumer_audit_sha256: consumerValidation.sha256 || null,
  consumer_audit_validation: {
    pass: consumerValidation.pass,
    errors: consumerValidation.errors,
    typed_local_actions: consumerValidation.local_actions.length,
    typed_local_action_gaps: consumerValidation.typed_local_action_gaps.length,
    command_memberships: consumerValidation.command_memberships.length,
    command_identities: consumerValidation.command_ids.length,
    origins: consumerValidation.origins,
    digests: consumerValidation.digests,
    schema_pointers_pass: consumerValidation.schema_pointers_pass,
    unresolved_schema_pointer_actions: consumerValidation.unresolved_schema_pointer_actions,
    schema_pointer_statuses: consumerValidation.schema_pointer_statuses
  },
  native_only_cases: impactValidation.native_only_cases || [],
  geometry_manifest: geometryManifestPath,
  geometry_manifest_sha256: createHash('sha256').update(geometryManifestBytes).digest('hex'),
  deterministic_context: {
    viewport_height: 900,
    device_scale_factor: 1,
    locale: 'en-US',
    timezone_id: 'UTC',
    color_scheme: 'dark',
    external_requests_blocked: true,
    physical_widths: widths,
    themes,
    reduced_motion_case: true
  },
  checks: [],
  findings: [],
  runtime_errors: [],
  failure_screenshots: []
};

let page;
let screenshotSequence = 0;
function stableValue(value) {
  if (value === undefined) return null;
  return value;
}
async function record(id, pass, evidence, options = {}) {
  const row = { id, pass: Boolean(pass), evidence: stableValue(evidence) };
  report.checks.push(row);
  if (pass) return row;
  const finding = {
    id,
    severity: options.severity || 'error',
    summary: options.summary || `Verification failed: ${id}`,
    reproduction: options.reproduction || `Open ${input} and repeat check ${id}.`,
    evidence: stableValue(evidence)
  };
  if (options.screenshot !== false && page && !page.isClosed()) {
    mkdirSync(screenshotDir, { recursive: true });
    const name = `${String(++screenshotSequence).padStart(2, '0')}-${id.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}.png`;
    const path = join(screenshotDir, name);
    try {
      await page.screenshot({ path, fullPage: false });
      finding.screenshot = path;
      report.failure_screenshots.push(path);
    } catch (error) {
      finding.screenshot_error = String(error);
    }
  }
  report.findings.push(finding);
  return row;
}

const { browser } = await provenanceRun.launchChromium(chromium);

async function makeContext(caseId, options = {}) {
  const contextConfig = {
    viewport: options.viewport || { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
    serviceWorkers: 'block',
    acceptDownloads: false
  };
  const context = await browser.newContext(contextConfig);
  await context.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('pm.theme', 'friendly-dark');
    } catch (_error) {}
  });
  const guard = await provenanceRun.attachContext(context, { case_id: caseId, context_config: contextConfig });
  const currentPage = await context.newPage();
  guard.instrumentPage(currentPage);
  currentPage.on('console', message => {
    if (message.type() === 'error') report.runtime_errors.push({ kind: 'console', text: message.text().slice(0, 1000) });
  });
  currentPage.on('pageerror', error => report.runtime_errors.push({ kind: 'pageerror', text: String(error).slice(0, 1000) }));
  await guard.gotoBound(currentPage, {
    navigation_id: `${caseId}:initial`,
    url: provenanceRun.artifactUrl({ case: caseId }),
    wait_until: 'load',
    timeout_ms: 180000
  });
  await currentPage.waitForFunction(() => Boolean(window.PM12_KIMI && window.PM7_SYSTEMS_INTEGRATION && window.PM_PAGES), null, { timeout: 120000 });
  /* The artifact intentionally opens first-run onboarding on every clean
     browser profile. Close it through its public UI contract so it does not
     intercept the independent Settings matrix; replay is tested later. */
  await currentPage.evaluate(() => window.PM7_ONBOARDING_CINEMATIC?.skip?.());
  await currentPage.evaluate(() => document.fonts.ready);
  await currentPage.waitForTimeout(300);
  return { context, page: currentPage, guard };
}

async function openSettingsRoute(domain, workspace) {
  /* Activate the host first, then route after its lifecycle reload settles.
     PM7_SETTINGS_COMMANDS.open intentionally performs both synchronously, but
     the concept host's panel-activation callback can reload the prior project
     state on the next task. Keeping the two observable actions ordered avoids
     racing that host callback. */
  await page.locator('#tab-settings').click({ force: true });
  await page.waitForTimeout(100);
  await page.evaluate(({ domain, workspace }) => window.PM12_KIMI.navigate(domain, workspace), { domain, workspace });
  await page.waitForFunction(({ domain, workspace }) => {
    const state = window.PM12_KIMI?.getState?.();
    return document.getElementById('panel-settings')?.classList.contains('active') && state?.domain === domain && state?.workspace === workspace;
  }, { domain, workspace }, { timeout: 20000 });
  await page.waitForTimeout(80);
}

try {
  const main = await makeContext('main-matrix');
  page = main.page;

  await record('source.actionable_closure_self_check', sourceSelfCheck.pass, sourceSelfCheck, {
    summary: 'The authored systems source, consumer audit, or actionable-closure identities failed the preserved source self-check.',
    screenshot: false
  });
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
  await record('impact.manifest_target_hash_binding', currentAuthoringValidation.pass && report.target_sha256 === currentAuthoringValidation.current.generated_artifact.sha256, {
    target_sha256: report.target_sha256,
    current_authored_binding: currentAuthoringValidation,
    manifest_declared_artifact_sha256: impactValidation.bindings?.generated_artifact?.sha256 || null,
    manifest_sha256: impactValidation.sha256 || null
  }, {
    summary: 'The browser target is not bound to the current authored T46 source and adjacent passing scratch-build provenance.'
  });
  await record('impact.native_only_residuals_not_run', EXPECTED_NATIVE_ONLY_CASES.every(caseId => {
    const row = (impactValidation.native_only_cases || []).find(item => item.case_id === caseId);
    return row?.status === 'not_run' && Boolean(row?.residual);
  }), impactValidation.native_only_cases || [], {
    summary: 'A hardware, WAN, security, or mid-operation fault-injection case was omitted or promoted above not_run.'
  });

  await record('consumer_audit.exact_39_local_103_memberships', consumerValidation.pass && consumerValidation.local_actions.length === EXPECTED_CONSUMER_LOCAL_ACTION_COUNT && consumerValidation.typed_local_action_gaps.length === 31 && consumerValidation.command_memberships.length === EXPECTED_CONSUMER_COMMAND_MEMBERSHIP_COUNT && consumerValidation.command_ids.length === EXPECTED_CONSUMER_COMMAND_IDENTITY_COUNT, {
    audit: consumerAuditPath,
    audit_sha256: consumerValidation.sha256 || null,
    errors: consumerValidation.errors,
    typed_local_actions: consumerValidation.local_actions.length,
    typed_local_action_gaps: consumerValidation.typed_local_action_gaps.length,
    command_memberships: consumerValidation.command_memberships.length,
    command_identities: consumerValidation.command_ids.length,
    origins: consumerValidation.origins,
    digests: consumerValidation.digests
  }, {
    summary: 'The PM7 consumer audit is not the exact 39-local-action, 103-membership, 102-command-identity denominator.'
  });
  await record('consumer_audit.authored_source_exact_projection', consumerSourceValidation.pass && consumerSourceValidation.local_rows === 39 && consumerSourceValidation.command_memberships === 103, consumerSourceValidation, {
    summary: 'The authored systems source does not preserve every exact local-action and command-membership route classification from the audit.'
  });
  await record('consumer_audit.live_schema_pointer_resolution', consumerValidation.schema_pointers_pass, {
    pass: consumerValidation.schema_pointers_pass,
    unresolved_action_ids: consumerValidation.unresolved_schema_pointer_actions,
    rows: consumerValidation.schema_pointer_statuses
  }, {
    summary: 'One or more typed local-action schema pointers do not resolve to exact live canonical request/result definitions.',
    screenshot: false
  });

  const boot = await page.evaluate(() => ({
    systems: window.PM7_SYSTEMS_INTEGRATION,
    apiVersion: window.PM12_KIMI.version,
    diagnostics: window.PM12_KIMI.audit()
  }));
  await record('boot.contract', boot.systems?.schema_id === 'pm.pmconcept7.systems_projection.v1' && boot.systems?.simulation_only === true && boot.systems?.production_runtime_state === 'unavailable' && boot.systems?.native_runtime_state === 'unavailable', boot, {
    summary: 'T46 systems integration API did not boot as a simulation-only projection.'
  });

  const consumerRuntime = await page.evaluate(() => {
    const api = window.PM7_SERVER_GAP_CONSUMERS;
    return api ? {
      schema_id: api.schema_id,
      local_actions: api.local_actions,
      command_memberships: api.command_memberships,
      retained_project_sync_local_action_ids: api.retained_project_sync_local_action_ids,
      palette_required_local_action_ids: api.palette_required_local_action_ids,
      visible_local_action_ids: api.visible_local_action_ids,
      protected_local_action_ids: api.protected_local_action_ids,
      retained_onboarding_local_action_ids: api.retained_onboarding_local_action_ids,
      external_schema_pointer_ids: api.external_schema_pointer_ids,
      visible_command_ids: api.visible_command_ids,
      exact_existing_command_ids: api.exact_existing_command_ids,
      digests: api.digests,
      concept_simulation_only: api.concept_simulation_only,
      native_binding: api.native_binding,
      production_handler_status: api.production_handler_status,
      headless_disposition: api.headless_disposition,
      protected_dom_controls: [...document.querySelectorAll('[data-ui-action-id]')].filter(node => api.protected_local_action_ids.includes(node.dataset.uiActionId)).map(node => node.outerHTML)
    } : null;
  });
  const expectedVisibleLocalActions = consumerValidation.local_actions.map(row => row.action_id).filter(id => !EXPECTED_PROTECTED_LOCAL_ACTION_IDS.includes(id) && !EXPECTED_RETAINED_ONBOARDING_LOCAL_ACTION_IDS.includes(id)).sort();
  const expectedPaletteRequiredLocalActions = consumerValidation.local_actions.filter(row => row.required_routes.palette_or_api === 'required').map(row => row.action_id).sort();
  const exactRuntimeProjection = consumerRuntime?.schema_id === 'pm.pmconcept7.server_gap_consumer_closure.v1'
    && JSON.stringify(consumerRuntime.local_actions) === JSON.stringify(consumerValidation.local_actions)
    && JSON.stringify(consumerRuntime.command_memberships) === JSON.stringify(consumerValidation.command_memberships)
    && JSON.stringify([...consumerRuntime.palette_required_local_action_ids].sort()) === JSON.stringify(expectedPaletteRequiredLocalActions)
    && JSON.stringify([...consumerRuntime.retained_project_sync_local_action_ids].sort()) === JSON.stringify([...EXPECTED_RETAINED_PROJECT_SYNC_LOCAL_ACTION_IDS].sort())
    && JSON.stringify([...consumerRuntime.visible_local_action_ids].sort()) === JSON.stringify(expectedVisibleLocalActions)
    && JSON.stringify([...consumerRuntime.protected_local_action_ids].sort()) === JSON.stringify([...EXPECTED_PROTECTED_LOCAL_ACTION_IDS].sort())
    && JSON.stringify([...consumerRuntime.retained_onboarding_local_action_ids].sort()) === JSON.stringify([...EXPECTED_RETAINED_ONBOARDING_LOCAL_ACTION_IDS].sort())
    && JSON.stringify([...consumerRuntime.visible_command_ids].sort()) === JSON.stringify([...EXPECTED_VISIBLE_COMMAND_IDS].sort())
    && JSON.stringify([...consumerRuntime.exact_existing_command_ids].sort()) === JSON.stringify([...EXPECTED_EXACT_EXISTING_COMMAND_IDS].sort())
    && JSON.stringify(consumerRuntime.digests) === JSON.stringify(consumerValidation.digests)
    && consumerRuntime.concept_simulation_only === true && consumerRuntime.native_binding === false
    && consumerRuntime.production_handler_status === 'handler_unavailable'
    && consumerRuntime.headless_disposition === 'catalog_and_headless_dispatch_require_no_synthetic_PM7_control'
    && consumerRuntime.protected_dom_controls.length === 0;
  await record('consumer_audit.runtime_exact_projection_and_protected_absence', exactRuntimeProjection, {
    expected: {
      local_actions: consumerValidation.local_actions,
      command_memberships: consumerValidation.command_memberships,
      visible_local_action_ids: expectedVisibleLocalActions,
      protected_local_action_ids: EXPECTED_PROTECTED_LOCAL_ACTION_IDS,
      visible_command_ids: EXPECTED_VISIBLE_COMMAND_IDS,
      digests: consumerValidation.digests
    },
    actual: consumerRuntime
  }, {
    summary: 'The runtime projection differs from the audit or mounts a protected human-only action in ordinary PM7.'
  });

  const primaryPage = page;
  const consumerSurfaceCase = await makeContext('consumer-surfaces');
  page = consumerSurfaceCase.page;
  const visibleLocalSet = new Set(expectedVisibleLocalActions);
  const visibleCommandSet = new Set(EXPECTED_VISIBLE_COMMAND_IDS);
  const observedVisibleControls = [];
  const observedEmissions = new Map();
  async function inspectCurrentConsumerSurface(surface) {
    const rows = await page.evaluate(({ surface, localIds, commandIds, protectedIds }) => {
      const wantedLocal = new Set(localIds), wantedCommand = new Set(commandIds), protectedSet = new Set(protectedIds);
      return [...document.querySelectorAll('#pm-settings-root [data-ui-action-id],#pm-settings-root [data-command-id]')].map((node, index) => {
        const kind = node.dataset.commandId ? 'command' : 'local';
        const identity = kind === 'command' ? node.dataset.commandId : node.dataset.uiActionId;
        if (!wantedLocal.has(identity) && !wantedCommand.has(identity) && !protectedSet.has(identity)) return null;
        return {
          surface,
          index,
          kind,
          identity,
          action: node.dataset.action || '',
          availability: node.dataset.availability || '',
          disabled_reason: node.dataset.disabledReason || '',
          production_handler_status: node.dataset.productionHandlerStatus || '',
          exact_return: node.dataset.exactReturn || '',
          concept_simulation_only: node.dataset.conceptSimulationOnly || '',
          native_binding: node.dataset.nativeBinding || '',
          event_record: node.dataset.eventRecord || '',
          runtime_receipt: node.dataset.runtimeReceipt || '',
          production_mutation_dispatched: node.dataset.productionMutationDispatched || '',
          aria_disabled: node.getAttribute('aria-disabled'),
          protected: protectedSet.has(identity),
          text: (node.textContent || '').trim()
        };
      }).filter(Boolean);
    }, { surface, localIds: expectedVisibleLocalActions, commandIds: EXPECTED_VISIBLE_COMMAND_IDS, protectedIds: EXPECTED_PROTECTED_LOCAL_ACTION_IDS });
    observedVisibleControls.push(...rows);
  }

  await openSettingsRoute('ai', 'providers');
  await inspectCurrentConsumerSurface('ai/providers');
  await openSettingsRoute('system', 'doctor');
  await inspectCurrentConsumerSurface('system/doctor');
  await openSettingsRoute('system', 'servers');
  await inspectCurrentConsumerSurface('system/servers');
  for (const tab of await page.locator('[data-action="server-tab"]').evaluateAll(nodes => [...new Set(nodes.map(node => node.dataset.tab).filter(Boolean))])) {
    await page.locator(`[data-action="server-tab"][data-tab="${tab}"]`).first().click({ force: true });
    await page.waitForTimeout(30);
    await inspectCurrentConsumerSurface(`system/servers#${tab}`);
  }
  await openSettingsRoute('memory', 'goals');
  await inspectCurrentConsumerSurface('memory/goals');
  const activeGoalsTab = page.locator('[data-action="goal-tab"][data-tab="active"]').first();
  if (await activeGoalsTab.count()) {
    await activeGoalsTab.click({ force: true });
    await page.waitForTimeout(30);
    await inspectCurrentConsumerSurface('memory/goals#active');
  }
  for (const goalId of await page.locator('[data-action="select-active-goal"]').evaluateAll(nodes => nodes.map(node => node.dataset.goal).filter(Boolean))) {
    if (await page.locator('[data-command-id="cmd.goal.pause"]').count()) break;
    await page.locator(`[data-action="select-active-goal"][data-goal="${goalId}"]`).first().click({ force: true });
    await page.waitForTimeout(30);
    await inspectCurrentConsumerSurface(`memory/goals#${goalId}`);
  }
  await openSettingsRoute('projects', 'project-sync');
  await inspectCurrentConsumerSurface('projects/project-sync');
  for (const tab of ['locations', 'clients', 'move']) {
    const tabControl = page.locator(`[data-action="project-sync-tab"][data-tab="${tab}"]`).first();
    if (await tabControl.count()) {
      await tabControl.click({ force: true });
      await page.waitForTimeout(30);
      await inspectCurrentConsumerSurface(`projects/project-sync#${tab}`);
    }
  }
  await openSettingsRoute('source', 'source-manager');
  await inspectCurrentConsumerSurface('source/source-manager');
  const worktreeTab = page.locator('[data-action="source-tab"][data-tab="worktrees"]').first();
  if (await worktreeTab.count()) {
    await worktreeTab.click({ force: true });
    await page.waitForTimeout(30);
    await inspectCurrentConsumerSurface('source/source-manager#worktrees');
  }
  await openSettingsRoute('system', 'updates');
  await inspectCurrentConsumerSurface('system/updates');
  const updateHistoryTab = page.locator('[data-action="updates-tab"][data-tab="history"]').first();
  if (await updateHistoryTab.count()) {
    await updateHistoryTab.click({ force: true });
    await page.waitForTimeout(30);
    await inspectCurrentConsumerSurface('system/updates#history');
  }

  const projectedEmissions = await page.evaluate(({ localIds, commandIds }) => {
    const api = window.PM7_SERVER_GAP_CONSUMERS;
    return [...localIds.map(identity => ({ identity, emission: api.project_typed_result('local', identity) })), ...commandIds.map(identity => ({ identity, emission: api.project_typed_result('command', identity) }))];
  }, { localIds: expectedVisibleLocalActions, commandIds: EXPECTED_VISIBLE_COMMAND_IDS });
  for (const row of projectedEmissions) observedEmissions.set(row.identity, { surface: 'typed_contract_projection', ...row.emission });

  const observedVisibleLocalIds = [...new Set(observedVisibleControls.filter(row => row.kind === 'local' && !row.protected).map(row => row.identity))].sort();
  const observedVisibleCommandIds = [...new Set(observedVisibleControls.filter(row => row.kind === 'command').map(row => row.identity))].sort();
  const protectedControls = observedVisibleControls.filter(row => row.protected);
  const invalidControlMetadata = observedVisibleControls.filter(row => !row.protected && !(
    (row.kind === 'command'
      ? row.availability === 'handler_unavailable' && row.disabled_reason === 'handler_unavailable'
      : ['concept_local_controller_available', 'available', 'unavailable'].includes(row.availability)
        && (row.availability === 'unavailable' ? row.disabled_reason !== 'none' : row.disabled_reason === 'none'))
    && row.production_handler_status === 'handler_unavailable'
    && row.exact_return === 'initiating_route_focus_identity_currentness'
    && row.concept_simulation_only === 'true'
    && row.native_binding === 'false'
    && row.event_record === 'not_emitted'
    && row.runtime_receipt === 'not_issued'
    && row.production_mutation_dispatched === 'false'
  ));
  await record('consumer_audit.visible_control_exact_census_and_metadata', JSON.stringify(observedVisibleLocalIds) === JSON.stringify(expectedVisibleLocalActions) && JSON.stringify(observedVisibleCommandIds) === JSON.stringify([...EXPECTED_VISIBLE_COMMAND_IDS].sort()) && protectedControls.length === 0 && invalidControlMetadata.length === 0, {
    expected_local_ids: expectedVisibleLocalActions,
    observed_local_ids: observedVisibleLocalIds,
    expected_command_ids: [...EXPECTED_VISIBLE_COMMAND_IDS].sort(),
    observed_command_ids: observedVisibleCommandIds,
    protected_controls: protectedControls,
    invalid_control_metadata: invalidControlMetadata,
    controls: observedVisibleControls
  }, {
    summary: 'A visible applicable server-gap control is missing, protected, or lacks exact availability/disabled/return/simulation metadata.'
  });

  const emissionRows = [...observedEmissions.entries()].map(([identity, emission]) => ({ identity, ...emission }));
  const missingEmissionIds = [...expectedVisibleLocalActions, ...EXPECTED_VISIBLE_COMMAND_IDS].filter(identity => !observedEmissions.has(identity));
  const invalidEmissions = emissionRows.filter(row => {
    const kind = visibleCommandSet.has(row.identity) ? 'command' : visibleLocalSet.has(row.identity) ? 'local' : null;
    const expectedAvailability = kind === 'command' ? 'handler_unavailable' : 'concept_local_controller_available';
    const expectedReason = kind === 'command' ? 'handler_unavailable' : 'none';
    return !kind || row.request?.schema_id !== 'pm.pmconcept7.typed_consumer_request.v1' || row.result?.schema_id !== 'pm.pmconcept7.typed_consumer_result.v1'
      || row.request?.action_kind !== kind || row.result?.action_kind !== kind
      || row.request?.action_id !== row.identity || row.result?.action_id !== row.identity
      || row.request?.availability !== expectedAvailability || row.result?.availability !== expectedAvailability
      || row.request?.disabled_reason !== expectedReason || row.result?.disabled_reason !== expectedReason
      || JSON.stringify(row.request?.exact_return) !== JSON.stringify(row.result?.exact_return)
      || row.request?.concept_simulation_only !== true || row.result?.concept_simulation_only !== true
      || row.request?.native_binding !== false || row.result?.native_binding !== false
      || row.result?.handler_unavailable !== true || row.result?.event_record !== 'not_emitted'
      || row.result?.runtime_receipt !== 'not_issued' || row.result?.production_mutation_dispatched !== false
      || row.result?.outcome !== (kind === 'command' ? 'handler_unavailable' : 'concept_projection_opened');
  });
  await record('consumer_audit.visible_control_typed_request_result_exhaustive', missingEmissionIds.length === 0 && invalidEmissions.length === 0, {
    missing_identity_emissions: missingEmissionIds,
    invalid_emissions: invalidEmissions,
    emissions: emissionRows
  }, {
    summary: 'A visible applicable server-gap control did not emit its exact typed request/result without fabricated mutation, EventRecord, native binding, or runtime receipt.'
  });
  await consumerSurfaceCase.context.close();
  page = primaryPage;

  const closureModel = await page.evaluate(() => window.PM7_SYSTEMS_INTEGRATION.doctor_fixture_model());
  await record('doctor.closure_model_boundary', closureModel?.schemaId === 'pm.doctor.browser_concept_closure_model.v1' && closureModel?.browserProjectionOnly === true && closureModel?.productionRuntimeState === 'unavailable' && closureModel?.nativeRuntimeState === 'unavailable' && closureModel?.productionOwnerFeedAttached === false, closureModel, {
    summary: 'Doctor closure data is not an explicit browser-only, native/production-unavailable model.'
  });
  const actualStatusCatalog = await page.evaluate(() => window.PM7_SYSTEMS_INTEGRATION.doctor_status_catalog());
  await record('doctor.human_status_catalog', JSON.stringify(actualStatusCatalog) === JSON.stringify(humanStatuses) && new Set(actualStatusCatalog).size === humanStatuses.length, { expected: humanStatuses, actual: actualStatusCatalog }, {
    summary: 'Doctor did not expose the exact ordered human-readable status catalog.'
  });
  for (const [requirement, expected] of Object.entries(doctorCoverageExpected)) {
    const actual = [...new Set(closureModel.scenarios.filter(row => row.requirements.includes(requirement)).flatMap(row => row.coverage))].sort();
    await record(`doctor.coverage.${requirement.toLowerCase()}`, JSON.stringify(actual) === JSON.stringify([...expected].sort()), { requirement, expected: [...expected].sort(), actual }, {
      summary: `${requirement} is missing an exact Doctor closure model tag.`
    });
  }
  const optionalUnused = closureModel.scenarios.find(row => row.id === 'doc005-unused');
  const optionalRequired = closureModel.scenarios.find(row => row.id === 'doc005-required');
  await record('doctor.optional_off_selected_task_semantics', optionalUnused?.overallStatus === 'healthy' && optionalUnused.rows.length === 3 && optionalUnused.rows.every(row => !row.configured && !row.selectedTaskRequired && !row.usedBySelectedTask && row.applicability === 'optional_off' && row.status === 'healthy' && row.impact === 'none') && optionalRequired?.overallStatus === 'blocked' && optionalRequired.rows.every(row => row.selectedTaskRequired && row.usedBySelectedTask && row.applicability === 'required_missing' && row.status === 'blocked' && row.impact === 'blocks_selected_action'), { unused: optionalUnused, required: optionalRequired }, {
    summary: 'Optional-Off fixtures did not distinguish unused healthy state from a selected-task requirement.'
  });
  const remediationScenario = closureModel.scenarios.find(row => row.id === 'doc008-return');
  await record('doctor.remediation_context_model', remediationScenario?.returnContext?.returnRoute?.join('/') === 'system/doctor' && remediationScenario?.returnContext?.returnScope === 'project' && remediationScenario?.returnContext?.returnFocusId === 'doctor-remediation-source-control' && remediationScenario?.returnContext?.remediationMode === 'owner_command_route' && remediationScenario?.returnContext?.ownerActionId === 'cmd.source_control.status.refresh' && remediationScenario?.returnContext?.typedOwnerRouteId === null && remediationScenario?.returnContext?.idempotencyKey === 'doctor-remediation:source-control:3:14:27' && remediationScenario?.returnContext?.expectedOwnerGeneration === 14 && remediationScenario?.returnContext?.expectedCacheGeneration === 27 && remediationScenario?.returnContext?.ownerResultRefRequired === true && JSON.stringify(remediationScenario?.returnContext?.normalizedStatuses) === JSON.stringify(['healthy', 'needs_attention', 'blocked']) && remediationScenario?.returnContext?.freshOwnerResultRequired === true && remediationScenario?.returnContext?.restoreOnlyOnCurrentnessMatch === true, remediationScenario, {
    summary: 'Doctor remediation model omitted exact return, focus, or currentness context.'
  });
  const sqliteScenario = closureModel.scenarios.find(row => row.id === 'doc013-sqlite');
  const sqliteRow = sqliteScenario?.rows.find(row => row.id === 'sqlite-detected');
  await record('doctor.sqlite_blocked_never_available', sqliteScenario?.overallStatus === 'blocked' && sqliteRow?.support === 'unsupported' && sqliteRow?.status === 'blocked' && sqliteRow?.applicability === 'required_missing' && sqliteRow?.effective.toLowerCase().includes('sqlite') && !sqliteRow?.effective.toLowerCase().includes('available'), sqliteScenario, {
    summary: 'SQLite detection was not modeled as blocked and unsupported.'
  });
  const serverScenario = closureModel.scenarios.find(row => row.id === 'doc020-server');
  const serverRowIds = serverScenario?.rows.map(row => row.id).sort() || [];
  await record('doctor.server_discovery_domain_model', JSON.stringify(serverRowIds) === JSON.stringify(['endpoint-currentness', 'server-dedupe', 'server-discovery', 'server-pairing', 'trusted-client']) && serverScenario.rows.find(row => row.id === 'server-discovery')?.effective.includes('without trust') && serverScenario.rows.find(row => row.id === 'endpoint-currentness')?.status === 'stale', serverScenario, {
    summary: 'Server discovery, identity dedupe, claim/pairing, trusted Client, or endpoint-currentness fixture is absent.'
  });
  const remoteScenario = closureModel.scenarios.find(row => row.id === 'doc021-remote');
  const headscaleRows = remoteScenario?.rows.filter(row => row.id.startsWith('headscale-')) || [];
  const remoteRowIds = new Set(remoteScenario?.rows.map(row => row.id) || []);
  const remoteRequiredRows = ['tailscale-serve', 'tailscale-funnel', 'headscale-serve', 'headscale-funnel', 'nginx', 'traefik', 'remote-link-direct', 'remote-link-relay', 'remote-link-e2e', 'manual-endpoint', 'route-continuity'];
  await record('doctor.remote_access_domain_model', remoteRequiredRows.every(id => remoteRowIds.has(id)) && headscaleRows.length === 2 && headscaleRows.every(row => row.requested.includes('Headscale 0.29.3') && row.effective === 'Unsupported; effective capability false' && row.support === 'unsupported' && row.status === 'blocked') && remoteScenario?.currentnessSource === 'scratchpad/pm-integration-20260831/audits/official-capability-revalidation-20260831.md', remoteScenario, {
    summary: 'Remote Access model omitted a route family or failed to retain current Headscale Serve/Funnel unsupported state.'
  });
  const routeHealth = closureModel.scenarios.find(row => row.id === 'doc022-independent');
  const unusedRoute = routeHealth?.rows.find(row => row.id === 'optional-unused-route');
  await record('doctor.independent_route_health', routeHealth?.overallStatus === 'healthy' && routeHealth?.overallImpact === 'none' && unusedRoute?.configured === true && unusedRoute?.selectedTaskRequired === false && unusedRoute?.usedBySelectedTask === false && unusedRoute?.status === 'needs_attention' && unusedRoute?.impact === 'none', routeHealth, {
    summary: 'An unused optional route incorrectly degraded aggregate Server health or lost its own finding.'
  });
  const securityScenario = closureModel.scenarios.find(row => row.id === 'doc023-security');
  const criticalRows = securityScenario?.rows.filter(row => row.securityCritical) || [];
  await record('doctor.security_findings_unmasked', securityScenario?.overallStatus === 'blocked' && securityScenario?.overallImpact === 'security_critical' && securityScenario?.rows.some(row => row.id === 'healthy-private-route' && row.status === 'healthy') && criticalRows.length === 4 && criticalRows.every(row => row.status === 'blocked' && row.impact === 'security_critical'), securityScenario, {
    summary: 'A healthy route masked identity/public/proxy security-critical findings.'
  });
  const redactionScenario = closureModel.scenarios.find(row => row.id === 'doc024-redaction');
  const actualRedactionClasses = redactionScenario?.redactionRows.map(row => row.secretClass).sort() || [];
  const serializedClosure = JSON.stringify(closureModel);
  const leakedPatterns = [
    /https?:\/\/[^\s"]*[?&](?:code|token|key)=/i,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    /(?:\/Users\/|\/home\/|[A-Za-z]:\\\\)/,
    /\b(?:tskey|token|credential)[-_][A-Za-z0-9]{8,}\b/i
  ].filter(pattern => pattern.test(serializedClosure)).map(pattern => String(pattern));
  await record('doctor.remote_diagnostic_redaction', JSON.stringify(actualRedactionClasses) === JSON.stringify([...redactionClasses].sort()) && redactionScenario?.redactionRows.every(row => ['redacted', 'withheld'].includes(row.outputState) && row.displayValue === '[REDACTED]' && row.sourceValuePersisted === false) && leakedPatterns.length === 0, { expectedClasses: [...redactionClasses].sort(), actualClasses: actualRedactionClasses, rows: redactionScenario?.redactionRows, leakedPatterns }, {
    summary: 'Remote diagnostic model omitted a sensitive class, retained source bytes, or exposed a secret/path-shaped value.'
  });

  await openSettingsRoute('system', 'doctor');
  await page.waitForFunction(() => {
    const controls = [...document.querySelectorAll('[data-ui-action-id^="ui.doctor."]')];
    return controls.length > 0 && controls.every(control => control.getAttribute('data-pm-hover-bound') === 'true' && Boolean(control.getAttribute('aria-describedby')));
  }, null, { timeout: 20000 });
  const cached = await page.evaluate(() => ({
    items: [...document.querySelectorAll('[data-doctor-item]')].map(node => node.dataset.doctorItem),
    runtimeStates: [...document.querySelectorAll('[data-doctor-item]')].map(node => node.dataset.productionRuntimeState),
    projections: [...document.querySelectorAll('[data-doctor-item]')].map(node => {
      const control = node.querySelector('[data-action="doctor-open-owner"]');
      return {
        id: node.dataset.doctorItem,
        label: node.querySelector('.doctor-state')?.textContent.trim() || '',
        statusDataState: node.querySelector('.doctor-state')?.dataset.state || '',
        statusColor: node.querySelector('.doctor-state') ? getComputedStyle(node.querySelector('.doctor-state')).color : '',
        statusBackground: node.querySelector('.doctor-state') ? getComputedStyle(node.querySelector('.doctor-state')).backgroundColor : '',
        copy: node.querySelector('.doctor-item-copy')?.textContent.trim() || '',
        meta: node.querySelector('.doctor-item-meta')?.textContent.trim() || '',
        remediationMode: control?.dataset.remediationMode || '',
        commandId: control?.dataset.ownerCommandId || '',
        typedOwnerRouteId: control?.dataset.typedOwnerRouteId || '',
        ownerCommandState: control?.dataset.ownerCommandState || node.dataset.ownerCommandState || '',
        checkId: control?.dataset.checkId || '',
        findingId: control?.dataset.findingId || '',
        findingRevision: Number(control?.dataset.findingRevision),
        targetId: control?.dataset.targetId || '',
        ownerRoute: control?.dataset.ownerRoute || '',
        returnRoute: control?.dataset.returnRoute || '',
        returnScope: control?.dataset.returnScope || '',
        ownerGeneration: Number(control?.dataset.ownerGeneration),
        cacheGeneration: Number(control?.dataset.cacheGeneration),
        idempotencyKey: control?.dataset.idempotencyKey || '',
        inboundRouteActionStamped: control?.hasAttribute('data-route-ui-action-id') || false,
        availability: control?.dataset.availability || '',
        disabled: Boolean(control?.disabled || control?.getAttribute('aria-disabled') === 'true'),
        disabledReason: control?.dataset.disabledReason || '',
        controlText: control?.textContent.trim() || '',
        localActionIds: [...node.querySelectorAll('[data-ui-action-id^="ui.doctor."]')].map(item => item.dataset.uiActionId).sort(),
        detailsCount: node.querySelectorAll('[data-ui-action-id="ui.doctor.open_details"]').length,
        logsCount: node.querySelectorAll('[data-ui-action-id="ui.doctor.open_logs"]').length,
        receiptCount: node.querySelectorAll('[data-ui-action-id="ui.doctor.open_receipt"]').length,
        remediationCount: node.querySelectorAll('[data-ui-action-id="ui.doctor.open_remediation"]').length,
        contextId: node.dataset.contextId || '',
        checkCost: node.dataset.checkCost || '',
        detailsRef: node.dataset.detailsRef || '',
        logsRef: node.dataset.logsRef || '',
        receiptRef: node.dataset.receiptRef || '',
        domainIds: (node.dataset.doctorDomainIds || '').split(/\s+/).filter(Boolean),
        freshnessState: node.dataset.freshnessState || '',
        currentnessState: node.dataset.currentnessState || '',
        lastKnownResult: node.dataset.lastKnownResult || '',
        currentReadiness: node.dataset.currentReadiness || '',
        recoveryDivergenceReason: node.dataset.recoveryDivergenceReason || '',
        projectId: control?.dataset.projectId || '',
        namedPlanId: control?.dataset.namedPlanId || '',
        providerId: control?.dataset.providerId || '',
        providerRouteId: control?.dataset.providerRouteId || '',
        settingsManagerId: control?.dataset.settingsManagerId || '',
        settingsDetailId: control?.dataset.settingsDetailId || ''
      };
    }),
    checking: window.PM12_KIMI.getState().doctorChecking,
    checkedAt: window.PM12_KIMI.getState().doctorCheckedAt || null,
    evidenceViewCount: document.querySelectorAll('[data-doctor-evidence-view]').length,
    text: document.querySelector('#pm-settings-root')?.innerText || '',
    openActions: [...document.querySelectorAll('[data-ui-action-id="ui.doctor.open"]')].map(node => ({ id: node.id, action: node.dataset.action, hoverBound: node.dataset.pmHoverBound, describedBy: node.getAttribute('aria-describedby') })),
    doctorActionIds: [...new Set([...document.querySelectorAll('[data-ui-action-id^="ui.doctor."]')].map(node => node.dataset.uiActionId))].sort(),
    hoverBindingsComplete: [...document.querySelectorAll('[data-ui-action-id^="ui.doctor."]')].every(node => node.dataset.pmHoverBound === 'true' && Boolean(node.getAttribute('aria-describedby')))
  }));
  await record('doctor.cached_first_paint', JSON.stringify(cached.items) === JSON.stringify(scopes.all) && !cached.checking, cached, {
    summary: 'Doctor did not paint its cached all-scope projection before a user recheck.'
  });
  await record('doctor.rendered_production_unavailable', cached.runtimeStates.length === scopes.all.length && cached.runtimeStates.every(state => state === 'unavailable'), cached.runtimeStates, {
    summary: 'A rendered Doctor fixture failed to disclose that production runtime is unavailable.'
  });
  await record('doctor.rendered_statuses_use_catalog', cached.projections.length === scopes.all.length && cached.projections.every(row => actualStatusCatalog.includes(row.label)), { catalog: actualStatusCatalog, rendered: cached.projections.map(row => ({ id: row.id, label: row.label })) }, {
    summary: 'A rendered Doctor row used a human status outside the exact catalog.'
  });
  const manifestDoctorActions = (impactValidation.manifest?.actions || []).filter(row => row.action_id?.startsWith('ui.doctor.')).map(row => row.action_id).sort();
  const expectedDoctorActions = ['ui.doctor.open', 'ui.doctor.open_details', 'ui.doctor.open_logs', 'ui.doctor.open_receipt', 'ui.doctor.open_remediation', 'ui.doctor.refresh_visible', 'ui.doctor.run_check'].sort();
  const expectedDoctorWorkspaceActions = [...expectedDoctorActions, 'ui.doctor.copy_diagnostics'].sort();
  await record('impact.doctor_local_action_exact_membership', JSON.stringify(manifestDoctorActions) === JSON.stringify(expectedDoctorActions), { expected: expectedDoctorActions, actual: manifestDoctorActions }, {
    summary: 'The impact manifest does not contain the exact seven local Doctor actions.'
  });
  await record('doctor.local_action_markup_and_hover_exact', JSON.stringify(cached.doctorActionIds) === JSON.stringify(expectedDoctorWorkspaceActions) && cached.openActions.length === 1 && cached.openActions[0].id === 'doctor-open-cached-summary' && cached.openActions[0].action === 'doctor-open-summary' && cached.hoverBindingsComplete, { canonical_doctor_actions: expectedDoctorActions, audited_server_gap_action: 'ui.doctor.copy_diagnostics', expected_workspace_actions: expectedDoctorWorkspaceActions, actual: cached.doctorActionIds, openActions: cached.openActions, hoverBindingsComplete: cached.hoverBindingsComplete }, {
    summary: 'The Doctor workspace lacks the exact seven canonical Doctor actions plus the audited copy-diagnostics local action, cached-summary entry, or shared hover/focus bindings.'
  });

  const doctorLocalState = () => page.evaluate(() => {
    const current = window.PM12_KIMI.getState();
    return {
      route: [current.domain, current.workspace],
      scope: current.doctorScope || 'all',
      checking: Boolean(current.doctorChecking),
      checkedAt: current.doctorCheckedAt || null,
      returnContext: current.doctorReturnContext || null,
      returnReceipt: current.doctorReturnReceipt || null,
      returnRejected: current.doctorReturnRejected || null,
      findings: [...document.querySelectorAll('[data-doctor-item]')].map(node => ({ id: node.dataset.doctorItem, state: node.querySelector('.doctor-state')?.textContent.trim() || '' }))
    };
  });
  const closeDoctorEvidence = async focusId => {
    await page.click('.drawer-wrap [data-action="close-overlay"]');
    await page.waitForFunction(id => document.activeElement?.id === id, focusId, { timeout: 5000 });
    await page.waitForTimeout(320);
  };

  const summaryBefore = await doctorLocalState();
  await page.click('#doctor-open-cached-summary');
  await page.waitForSelector('[data-doctor-evidence-view="summary"]');
  const summaryView = await page.evaluate(() => {
    const view = document.querySelector('[data-doctor-evidence-view="summary"]');
    return { cachedOnly: view?.dataset.cachedOnly, ownerProbeDispatched: view?.dataset.ownerProbeDispatched, productionMutationDispatched: view?.dataset.productionMutationDispatched, productionRuntimeState: view?.dataset.productionRuntimeState, drawerText: view?.closest('.drawer')?.innerText || '' };
  });
  await closeDoctorEvidence('doctor-open-cached-summary');
  const summaryAfter = await doctorLocalState();
  await record('doctor.open_reads_cached_summary_only', summaryView.cachedOnly === 'true' && summaryView.ownerProbeDispatched === 'false' && summaryView.productionMutationDispatched === 'false' && summaryView.productionRuntimeState === 'unavailable' && /Owner feed\s+Not attached/i.test(summaryView.drawerText) && JSON.stringify(summaryAfter) === JSON.stringify(summaryBefore) && await page.evaluate(() => document.activeElement?.id === 'doctor-open-cached-summary'), { before: summaryBefore, view: summaryView, after: summaryAfter }, {
    summary: 'ui.doctor.open did not remain a cached-only, focus-stable local view or implied owner work/production mutation.'
  });

  const logsBefore = await doctorLocalState();
  await page.click('#doctor-logs-server-trust');
  await page.waitForSelector('[data-doctor-evidence-view="logs"]');
  const logsView = await page.evaluate(() => {
    const view = document.querySelector('[data-doctor-evidence-view="logs"]');
    const rows = [...(view?.querySelectorAll('[data-doctor-evidence-row]') || [])].map(node => node.textContent.trim());
    const renderedBytes = new TextEncoder().encode(rows.join('\n')).byteLength;
    return { rows, renderedBytes, declaredRenderedBytes: Number(view?.dataset.renderedBytes), maxRows: Number(view?.dataset.maxRows), maxBytes: Number(view?.dataset.maxBytes), totalRows: Number(view?.dataset.totalRows), truncated: view?.dataset.truncated, continuationState: view?.dataset.continuationState, redactionState: view?.dataset.redactionState, currentnessState: view?.dataset.currentnessState, findingId: view?.dataset.findingId, findingRevision: Number(view?.dataset.findingRevision), ownerGeneration: Number(view?.dataset.ownerGeneration), cacheGeneration: Number(view?.dataset.cacheGeneration), loadTrigger: view?.dataset.loadTrigger, productionRuntimeState: view?.dataset.productionRuntimeState, productionMutationDispatched: view?.dataset.productionMutationDispatched, text: view?.innerText || '' };
  });
  await closeDoctorEvidence('doctor-logs-server-trust');
  const logsAfter = await doctorLocalState();
  const forbiddenEvidencePatterns = [/https?:\/\//i, /-----BEGIN [A-Z ]*PRIVATE KEY-----/i, /(?:\/Users\/|\/home\/|[A-Za-z]:\\\\)/, /\b(?:tskey|token|credential)[-_][A-Za-z0-9]{8,}\b/i];
  await record('doctor.logs_lazy_bounded_redacted_focus_stable', cached.evidenceViewCount === 0 && logsView.loadTrigger === 'explicit_local_action' && logsView.rows.length > 0 && logsView.rows.length <= logsView.maxRows && logsView.maxRows === 3 && logsView.renderedBytes === logsView.declaredRenderedBytes && logsView.renderedBytes <= logsView.maxBytes && logsView.maxBytes === 1024 && logsView.totalRows > logsView.rows.length && logsView.truncated === 'true' && logsView.continuationState === 'unavailable_production_owner_feed' && logsView.redactionState === 'applied_before_render' && logsView.currentnessState === 'cached_browser_fixture' && logsView.findingId === 'finding:server-trust:fixture' && logsView.findingRevision === 4 && logsView.ownerGeneration === 41 && logsView.cacheGeneration === 52 && logsView.productionRuntimeState === 'unavailable' && logsView.productionMutationDispatched === 'false' && logsView.text.includes('[REDACTED]') && forbiddenEvidencePatterns.every(pattern => !pattern.test(logsView.text)) && JSON.stringify(logsAfter) === JSON.stringify(logsBefore) && await page.evaluate(() => document.activeElement?.id === 'doctor-logs-server-trust'), { before: logsBefore, view: logsView, after: logsAfter, eagerEvidenceViewCount: cached.evidenceViewCount }, {
    summary: 'ui.doctor.open_logs was eager, unbounded, unredacted, stale-identity-blind, state-mutating, or failed same-row focus restoration.'
  });

  const receiptBefore = await doctorLocalState();
  await page.click('#doctor-receipt-server-trust');
  await page.waitForSelector('[data-doctor-evidence-view="receipt"]');
  const receiptView = await page.evaluate(() => {
    const view = document.querySelector('[data-doctor-evidence-view="receipt"]');
    const rows = [...(view?.querySelectorAll('[data-doctor-evidence-row]') || [])].map(node => node.textContent.trim());
    const renderedBytes = new TextEncoder().encode(rows.join('\n')).byteLength;
    return { rows, renderedBytes, declaredRenderedBytes: Number(view?.dataset.renderedBytes), maxRows: Number(view?.dataset.maxRows), maxBytes: Number(view?.dataset.maxBytes), truncated: view?.dataset.truncated, redactionState: view?.dataset.redactionState, currentnessState: view?.dataset.currentnessState, findingId: view?.dataset.findingId, findingRevision: Number(view?.dataset.findingRevision), ownerGeneration: Number(view?.dataset.ownerGeneration), cacheGeneration: Number(view?.dataset.cacheGeneration), loadTrigger: view?.dataset.loadTrigger, productionRuntimeState: view?.dataset.productionRuntimeState, productionMutationDispatched: view?.dataset.productionMutationDispatched, text: view?.innerText || '' };
  });
  await closeDoctorEvidence('doctor-receipt-server-trust');
  const receiptAfter = await doctorLocalState();
  await record('doctor.receipt_lazy_exact_currentness_focus_stable', cached.evidenceViewCount === 0 && receiptView.loadTrigger === 'explicit_local_action' && receiptView.rows.length === 1 && receiptView.rows.length <= receiptView.maxRows && receiptView.maxRows === 1 && receiptView.renderedBytes === receiptView.declaredRenderedBytes && receiptView.renderedBytes <= receiptView.maxBytes && receiptView.maxBytes === 2048 && receiptView.truncated === 'false' && receiptView.redactionState === 'references_only' && receiptView.currentnessState === 'unavailable' && receiptView.findingId === 'finding:server-trust:fixture' && receiptView.findingRevision === 4 && receiptView.ownerGeneration === 41 && receiptView.cacheGeneration === 52 && receiptView.productionRuntimeState === 'unavailable' && receiptView.productionMutationDispatched === 'false' && /no exact current owner receipt/i.test(receiptView.text) && forbiddenEvidencePatterns.every(pattern => !pattern.test(receiptView.text)) && JSON.stringify(receiptAfter) === JSON.stringify(receiptBefore) && await page.evaluate(() => document.activeElement?.id === 'doctor-receipt-server-trust'), { before: receiptBefore, view: receiptView, after: receiptAfter, eagerEvidenceViewCount: cached.evidenceViewCount }, {
    summary: 'ui.doctor.open_receipt was eager, unbounded, currentness-blind, state-mutating, or failed same-row focus restoration.'
  });
  await record('doctor.one_remediation_three_evidence_routes', cached.projections.length > 0 && cached.projections.every(row => row.detailsCount === 1 && row.logsCount === 1 && row.receiptCount === 1 && row.remediationCount === 1), cached.projections.map(row => ({ id: row.id, actions: row.localActionIds, details: row.detailsCount, logs: row.logsCount, receipt: row.receiptCount, remediation: row.remediationCount })), {
    summary: 'Every Doctor finding must expose exactly one Details, Logs, Receipt, and canonical-owner remediation control.'
  });
  await record('doctor.normalized_finding_evidence_contract', cached.projections.length > 0 && cached.projections.every(row => row.checkId && row.findingId && row.contextId && row.checkCost && row.detailsRef && row.logsRef && row.receiptRef), cached.projections.map(row => ({ id: row.id, checkId: row.checkId, findingId: row.findingId, contextId: row.contextId, checkCost: row.checkCost, detailsRef: row.detailsRef, logsRef: row.logsRef, receiptRef: row.receiptRef })), {
    summary: 'A Doctor row is missing normalized context/check-cost or independent Details/Logs/Receipt references.'
  });
  const expectedDoctorDomains = ['browser', 'containers', 'host_environment', 'integrations', 'plans', 'plugins', 'project', 'provider_generation', 'resource_pressure', 'scm_worktrees', 'security', 'server', 'source_location', 'storage_migration', 'testing_capture', 'transport', 'usage_freshness', 'vault'].sort();
  const registeredDoctorDomains = await page.evaluate(() => window.PM7_SYSTEMS_INTEGRATION.doctor_domain_catalog());
  const actualDoctorDomains = [...new Set(cached.projections.flatMap(row => row.domainIds))].sort();
  await record('doctor.distinct_domain_catalog', JSON.stringify(actualDoctorDomains) === JSON.stringify(expectedDoctorDomains) && JSON.stringify([...registeredDoctorDomains].sort()) === JSON.stringify(expectedDoctorDomains) && cached.projections.every(row => row.domainIds.length > 0), { expected: expectedDoctorDomains, registered: registeredDoctorDomains, rendered: actualDoctorDomains, rows: cached.projections.map(row => ({ id: row.id, domainIds: row.domainIds })) }, {
    summary: 'Doctor does not expose the exact distinct 18-domain catalog required by DOC-012/DOC-019.'
  });
  const projectAuthority = cached.projections.find(row => row.id === 'project-authority');
  const performanceProjection = cached.projections.find(row => row.id === 'performance');
  const externalProjection = cached.projections.find(row => row.id === 'auth-browser');
  const readyProjection = cached.projections.find(row => row.id === 'optional-capabilities');
  const falseGreenRows = cached.projections.filter(row => row.label === 'Ready' && /owner feed required|no owner projection|owner projection unavailable/i.test(`${row.copy} ${row.meta}`));
  await record('doctor.no_false_green_without_owner_feed', projectAuthority?.label === 'Unknown' && /Project Sync and Backbone owner feed/i.test(projectAuthority.copy) && /cannot establish Project or Vault currentness/i.test(projectAuthority.copy) && /Unknown/i.test(projectAuthority.meta) && /No owner projection/i.test(projectAuthority.meta) && falseGreenRows.length === 0, { projectAuthority, falseGreenRows }, {
    summary: 'Doctor presented an ownerless or unavailable projection as Ready.'
  });
  await record('doctor.idle_and_neutral_status_truth', performanceProjection?.label === 'Unknown' && performanceProjection?.statusDataState === 'attention' && /Not run/.test(performanceProjection.meta) && !/Checking/.test(`${performanceProjection.label} ${performanceProjection.meta}`) && externalProjection?.label === 'Managed externally' && externalProjection?.statusDataState === 'external' && externalProjection?.statusColor !== readyProjection?.statusColor && Boolean(externalProjection?.statusBackground), { performanceProjection, externalProjection, readyProjection }, {
    summary: 'Doctor showed an idle performance check as running or styled Managed externally as Ready.'
  });

  const commandRows = cached.projections.filter(row => row.remediationMode === 'owner_command_route');
  const typedRouteRows = cached.projections.filter(row => row.remediationMode === 'typed_owner_route');
  const unavailableRows = cached.projections.filter(row => row.remediationMode === 'unavailable');
  const browserPluginCommandIds = await page.evaluate(() => (window.PM7_PLUGIN_COMMANDS || []).map(row => row.id).sort());
  const pluginRegistryExact = JSON.stringify(browserPluginCommandIds) === JSON.stringify(EXPECTED_PLUGIN_COMMAND_IDS);
  const admittedDoctorCommandIds = new Set([...(impactValidation.action_ids || []), ...(consumerValidation.command_ids || []), ...browserPluginCommandIds]);
  const implicitDoctorCommands = commandRows.map(row => row.commandId).filter(Boolean).filter(commandId => !admittedDoctorCommandIds.has(commandId));
  await record('impact.no_implicit_doctor_commands', pluginRegistryExact && implicitDoctorCommands.length === 0, { observed: commandRows.map(row => row.commandId).filter(Boolean), impact_manifest_commands: (impactValidation.action_ids || []).filter(id => id.startsWith('cmd.')), consumer_audit_commands: consumerValidation.command_ids, plugin_registry: browserPluginCommandIds, plugin_registry_exact: pluginRegistryExact, implicit: implicitDoctorCommands }, {
    summary: 'A Doctor remediation command is absent from the exact impact, consumer-audit, or canonical twelve-command Plugins System registries.'
  });
  const namedPlanCommandRow = commandRows.find(row => row.id === 'named-plans');
  const pluginDoctorRows = cached.projections.filter(row => row.checkId.startsWith('doctor.plugin.'));
  const exactDomMetadata = cached.projections.every(row => row.checkId && row.findingId && Number.isInteger(row.findingRevision) && row.findingRevision > 0 && row.targetId && row.ownerRoute.split('/').length === 2 && row.returnRoute === 'system/doctor' && row.returnScope === 'all' && row.domainIds.length > 0 && row.freshnessState && row.currentnessState && row.lastKnownResult && row.currentReadiness && row.recoveryDivergenceReason && Number.isInteger(row.ownerGeneration) && row.ownerGeneration >= 0 && Number.isInteger(row.cacheGeneration) && row.cacheGeneration >= 0 && row.idempotencyKey === `doctor-remediation:${row.id}:${row.findingRevision}:${row.ownerGeneration}:${row.cacheGeneration}` && !row.inboundRouteActionStamped);
  await record('doctor.remediation_mode_census_and_dom_contract', commandRows.length === 15 && typedRouteRows.length === 1 && unavailableRows.length === 4 && pluginDoctorRows.length === 8 && pluginDoctorRows.every(row => EXPECTED_PLUGIN_COMMAND_IDS.includes(row.commandId) && row.ownerRoute === 'code/toolchain') && namedPlanCommandRow?.commandId === 'cmd.named_plan.open' && namedPlanCommandRow?.ownerRoute === 'source/browser-scm' && exactDomMetadata && commandRows.every(row => row.commandId && !row.typedOwnerRouteId && row.ownerCommandState === 'available' && row.availability === 'available' && !row.disabled && row.controlText === 'Open owner') && typedRouteRows.every(row => !row.commandId && row.typedOwnerRouteId === row.ownerRoute && row.ownerCommandState === 'unavailable' && row.availability === 'available' && !row.disabled && row.controlText === 'Open route') && unavailableRows.every(row => !row.commandId && !row.typedOwnerRouteId && row.ownerCommandState === 'unavailable' && row.availability === 'unavailable' && row.disabled && Boolean(row.disabledReason) && row.controlText === 'Owner unavailable'), { census: { owner_command_route: commandRows.length, typed_owner_route: typedRouteRows.length, unavailable: unavailableRows.length, plugin_doctor_rows: pluginDoctorRows.length }, namedPlanCommandRow, commandRows, typedRouteRows, unavailableRows, exactDomMetadata }, {
    summary: 'Doctor remediationMode census, enablement, exact metadata, or outbound-control route identity drifted.'
  });
  await record('doctor.named_plan_exact_owner_target', namedPlanCommandRow?.commandId === 'cmd.named_plan.open' && namedPlanCommandRow?.targetId === namedPlanCommandRow?.namedPlanId && Boolean(namedPlanCommandRow?.projectId) && Boolean(namedPlanCommandRow?.namedPlanId) && !namedPlanCommandRow?.typedOwnerRouteId, namedPlanCommandRow || null, {
    summary: 'Named Plan remediation must use cmd.named_plan.open with exact project_id and named_plan_id or remain disabled.'
  });
  const providerCliRow = cached.projections.find(row => row.id === 'provider-cli');
  await record('doctor.provider_cli_exact_settings_target', providerCliRow?.commandId === 'cmd.settings.open' && providerCliRow?.ownerRoute === 'ai/providers' && providerCliRow?.targetId === providerCliRow?.providerRouteId && Boolean(providerCliRow?.projectId) && Boolean(providerCliRow?.providerId) && providerCliRow?.settingsManagerId === 'providers' && providerCliRow?.settingsDetailId === 'provider-cli:cli-example' && providerCliRow?.remediationCount === 1 && providerCliRow?.logsCount === 1 && providerCliRow?.receiptCount === 1, providerCliRow || null, {
    summary: 'The missing-provider-CLI finding does not route only to the exact provider Settings target with independent evidence controls.'
  });
  const historyAxes = await page.evaluate(() => ({
    rows: [...document.querySelectorAll('[data-doctor-item]')].map(node => ({
      id: node.dataset.doctorItem,
      lastKnown: node.dataset.lastKnownResult || '',
      currentReadiness: node.dataset.currentReadiness || '',
      freshnessState: node.dataset.freshnessState || '',
      currentnessState: node.dataset.currentnessState || '',
      recoveryReason: node.dataset.recoveryDivergenceReason || ''
    })),
    persistentWork: document.querySelector('[data-doctor-work-id][data-viewer-attached="true"]')?.getAttribute('data-doctor-work-id') || null,
    workProjection: window.PM7_SYSTEMS_INTEGRATION.doctor_work_projection()
  }));
  const historyRowsComplete = historyAxes.rows.length === scopes.all.length && historyAxes.rows.every(row => row.lastKnown && row.currentReadiness && ['aging', 'stale', 'unknown'].includes(row.freshnessState) && ['cached_generation_fenced', 'owner_currentness_unavailable'].includes(row.currentnessState) && row.recoveryReason);
  const divergentHistoryRows = historyAxes.rows.filter(row => row.recoveryReason !== 'none');
  await record('doctor.history_currentness_split', historyRowsComplete && divergentHistoryRows.length > 0, { ...historyAxes, divergentHistoryRows }, {
    summary: 'Recovered/interrupted history is not rendered separately from current readiness and its divergence reason.'
  });
  const attachedWork = historyAxes.workProjection;
  await openSettingsRoute('system', 'backup');
  const detachedWork = await page.evaluate(() => window.PM7_SYSTEMS_INTEGRATION.doctor_work_projection());
  await openSettingsRoute('system', 'doctor');
  const reattachedWork = await page.evaluate(() => window.PM7_SYSTEMS_INTEGRATION.doctor_work_projection());
  await record('doctor.view_detach_work_identity_exposed', Boolean(historyAxes.persistentWork) && attachedWork?.work_id === historyAxes.persistentWork && attachedWork?.viewer_attached === true && attachedWork?.owner_work_cancelled === false && detachedWork?.work_id === attachedWork.work_id && detachedWork?.viewer_attached === false && detachedWork?.owner_work_cancelled === false && reattachedWork?.work_id === attachedWork.work_id && reattachedWork?.viewer_attached === true && reattachedWork?.join_on_reopen === true && reattachedWork?.concept_simulation_only === true && reattachedWork?.native_binding === false, { domWorkId: historyAxes.persistentWork, attachedWork, detachedWork, reattachedWork }, {
    summary: 'Doctor does not expose a persistent browser-only work identity for close/hide/reopen continuation checks.'
  });

  const unavailableDispatch = await page.evaluate(() => {
    const before = window.PM12_KIMI.getState();
    window.PM12_KIMI.dispatchAction('doctor-open-owner', { id: 'auth-browser' });
    const after = window.PM12_KIMI.getState();
    return { beforeRoute: [before.domain, before.workspace], afterRoute: [after.domain, after.workspace], context: after.doctorReturnContext || null, rejected: after.doctorReturnRejected || null };
  });
  await record('doctor.unavailable_dispatch_fail_closed', unavailableDispatch.beforeRoute.join('/') === 'system/doctor' && unavailableDispatch.afterRoute.join('/') === 'system/doctor' && unavailableDispatch.context === null && unavailableDispatch.rejected === 'human_only_policy_has_no_doctor_remediation', unavailableDispatch, {
    summary: 'A programmatic dispatch reached an unavailable Doctor owner route or created return context.'
  });

  await page.evaluate(() => window.PM12_KIMI.dispatchAction('doctor-open-owner', { id: 'project-authority' }));
  await page.waitForTimeout(80);
  const routeOnlyDispatch = await page.evaluate(() => ({
    route: [window.PM12_KIMI.getState().domain, window.PM12_KIMI.getState().workspace],
    context: window.PM12_KIMI.getState().doctorReturnContext || null
  }));
  const projectControl = typedRouteRows.find(row => row.id === 'project-authority');
  await record('doctor.typed_owner_route_full_context', routeOnlyDispatch.route.join('/') === 'projects/project-sync' && routeOnlyDispatch.context?.remediationMode === 'typed_owner_route' && routeOnlyDispatch.context?.checkId === projectControl?.checkId && routeOnlyDispatch.context?.findingId === projectControl?.findingId && routeOnlyDispatch.context?.findingRevision === projectControl?.findingRevision && routeOnlyDispatch.context?.targetId === projectControl?.targetId && routeOnlyDispatch.context?.ownerActionId === null && routeOnlyDispatch.context?.typedOwnerRouteId === projectControl?.typedOwnerRouteId && routeOnlyDispatch.context?.ownerRoute?.join('/') === projectControl?.ownerRoute && routeOnlyDispatch.context?.returnRoute?.join('/') === projectControl?.returnRoute && routeOnlyDispatch.context?.returnScope === 'all' && routeOnlyDispatch.context?.returnFocusId === 'doctor-remediation-project-authority' && routeOnlyDispatch.context?.expectedOwnerGeneration === projectControl?.ownerGeneration && routeOnlyDispatch.context?.expectedCacheGeneration === projectControl?.cacheGeneration && routeOnlyDispatch.context?.idempotencyKey === projectControl?.idempotencyKey && routeOnlyDispatch.context?.ownerResultRequired === true && routeOnlyDispatch.context?.routeOnlyConceptPreview === true && routeOnlyDispatch.context?.productionMutationDispatched === false && routeOnlyDispatch.context?.browserProjectionOnly === true && !('settingsRouteUiActionId' in routeOnlyDispatch.context), routeOnlyDispatch, {
    summary: 'A typed Doctor owner route lost its exact route, return, generation, or idempotency context.'
  });
  await page.evaluate(context => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor({
    checkId: context.checkId,
    findingId: context.findingId,
    findingRevision: context.findingRevision,
    targetId: context.targetId,
    ownerActionId: '',
    typedOwnerRouteId: context.typedOwnerRouteId,
    idempotencyKey: context.idempotencyKey,
    ownerResultRef: 'owner-result:project-authority:blocking-fixture',
    normalizedStatus: 'blocked',
    outcome: 'succeeded',
    baseOwnerGeneration: context.expectedOwnerGeneration,
    baseCacheGeneration: context.expectedCacheGeneration,
    ownerGeneration: context.expectedOwnerGeneration + 1,
    cacheGeneration: context.expectedCacheGeneration + 1,
    freshnessState: 'fresh'
  }), routeOnlyDispatch.context);
  await page.waitForFunction(() => window.PM12_KIMI.getState().domain === 'system' && window.PM12_KIMI.getState().workspace === 'doctor' && document.activeElement?.id === 'doctor-remediation-project-authority', null, { timeout: 5000 });
  const typedBlockedReturn = await page.evaluate(() => {
    const state = window.PM12_KIMI.getState();
    return { receipt: state.doctorReturnReceipt || null, rejected: state.doctorReturnRejected || null, context: state.doctorReturnContext || null, itemState: document.querySelector('[data-doctor-item="project-authority"] .doctor-state')?.textContent.trim() || null };
  });
  await record('doctor.typed_route_blocked_return_non_green', typedBlockedReturn.receipt?.returnAccepted === true && typedBlockedReturn.receipt?.remediationResolved === false && typedBlockedReturn.receipt?.normalizedStatus === 'blocked' && typedBlockedReturn.receipt?.typedOwnerRouteId === 'projects/project-sync' && typedBlockedReturn.receipt?.ownerActionId === null && typedBlockedReturn.receipt?.ownerResultRef === 'owner-result:project-authority:blocking-fixture' && typedBlockedReturn.receipt?.productionMutationDispatched === false && typedBlockedReturn.receipt?.browserProjectionOnly === true && typedBlockedReturn.receipt?.productionRuntimeState === 'unavailable' && typedBlockedReturn.itemState === 'Blocked' && !typedBlockedReturn.rejected && !typedBlockedReturn.context, typedBlockedReturn, {
    summary: 'A fresh exact blocked typed-route result failed to return or was falsely promoted to Ready.'
  });
  await openSettingsRoute('system', 'doctor');
  await page.waitForTimeout(750);
  const idleAfterStartup = await page.evaluate(() => ({ checking: window.PM12_KIMI.getState().doctorChecking, checkedAt: window.PM12_KIMI.getState().doctorCheckedAt || null }));
  await record('doctor.no_startup_sweep', !idleAfterStartup.checking && idleAfterStartup.checkedAt === cached.checkedAt, { before: cached.checkedAt, after: idleAfterStartup }, {
    summary: 'Doctor performed or recorded a sweep without an explicit Check Again action.'
  });

  for (const [scope, expected] of Object.entries(scopes)) {
    await page.locator(`[data-action="doctor-scope"][data-scope="${scope}"]`).click({ force: true });
    await page.waitForTimeout(50);
    const actual = await page.locator('[data-doctor-item]').evaluateAll(nodes => nodes.map(node => node.dataset.doctorItem));
    await record(`doctor.scope.${scope}`, JSON.stringify(actual) === JSON.stringify(expected), { expected, actual }, {
      summary: `Doctor scope ${scope} did not show exactly its owned cached checks.`
    });
  }

  await page.locator('[data-action="doctor-scope"][data-scope="server"]').click({ force: true });
  await page.locator('[data-doctor-item="remote-route"] [data-action="doctor-item-details"]').click({ force: true });
  await page.waitForTimeout(80);
  const remoteDetailText = await page.locator('#pm-settings-portals').innerText();
  const remoteDetailTerms = ['Lazy browser-concept model detail', 'Native runtime', 'Unavailable', 'Production owner feed', 'Not attached', 'DOC-021', 'Headscale Serve', 'Unsupported; effective capability false', 'NGINX reverse proxy', 'Traefik reverse proxy', 'Remote Link direct', 'Remote Link relay', 'Route failover and resumption', 'DOC-022', 'Broken unused optional route', 'DOC-023', 'Server identity mismatch', 'Public unclaimed setup exposure', 'Unsafe public product surface', 'Untrusted proxy headers', 'DOC-024', 'Authentication URL', '[REDACTED]', 'Sensitive Project path'];
  await record('doctor.lazy_remote_model_rows', remoteDetailTerms.every(term => remoteDetailText.includes(term)), { required: remoteDetailTerms, text: remoteDetailText.slice(0, 12000) }, {
    summary: 'Lazy Doctor details omitted remote route, security dominance, currentness, or redaction model rows.'
  });
  await page.keyboard.press('Escape');

  await page.locator('[data-action="doctor-scope"][data-scope="project"]').click({ force: true });
  const priorCheck = await page.evaluate(() => window.PM12_KIMI.getState().doctorCheckedAt || null);
  await page.locator('[data-action="doctor-check-scope"]').click({ force: true });
  const checking = await page.evaluate(() => ({
    scope: window.PM12_KIMI.getState().doctorScope,
    checking: window.PM12_KIMI.getState().doctorChecking,
    items: [...document.querySelectorAll('[data-doctor-item]')].map(node => ({ id: node.dataset.doctorItem, state: node.querySelector('.doctor-state')?.textContent.trim() })),
    route: [window.PM12_KIMI.getState().domain, window.PM12_KIMI.getState().workspace],
    dialogs: document.querySelectorAll('.modal.visible, .drawer.visible').length
  }));
  await page.waitForFunction(prior => !window.PM12_KIMI.getState().doctorChecking && (window.PM12_KIMI.getState().doctorCheckedAt || null) !== prior, priorCheck, { timeout: 5000 });
  const completedCheck = await page.evaluate(prior => {
    const state = window.PM12_KIMI.getState();
    return { scope: state.doctorScope, checkedAtPresent: Boolean(state.doctorCheckedAt), checkedAtChanged: (state.doctorCheckedAt || null) !== prior, route: [state.domain, state.workspace] };
  }, priorCheck);
  await record('doctor.scoped_recheck_owner_boundary', checking.scope === 'project' && checking.checking && checking.items.length === scopes.project.length && checking.items.every(row => row.state === 'Checking') && checking.route.join('/') === 'system/doctor' && checking.dialogs === 0 && completedCheck.scope === 'project' && completedCheck.route.join('/') === 'system/doctor', { during: checking, after: completedCheck }, {
    summary: 'Doctor Check Again was not selected-scope-only or crossed its no-private-repair boundary.'
  });

  await page.locator('[data-doctor-item="source-control"] [data-action="doctor-item-details"]').click({ force: true });
  await page.waitForTimeout(80);
  const detail = await page.evaluate(() => {
    const portal = document.getElementById('pm-settings-portals');
    return { text: portal?.innerText || '', doctorRoute: [window.PM12_KIMI.getState().domain, window.PM12_KIMI.getState().workspace] };
  });
  const detailTerms = ['Lazy browser-concept model detail', 'Status', 'Severity', 'Reason', 'Owner', 'Target', 'Freshness', 'Confidence', 'Requested', 'Effective', 'Capability', 'Remediation mode', 'Owner command route', 'Owner command', 'cmd.source_control.status.refresh', 'Owner route', 'source/browser-scm', 'Native runtime', 'Unavailable', 'Production owner feed', 'Not attached', 'DOC-008', 'Exact return', 'doctor-remediation-source-control'];
  await record('doctor.lazy_detail_metadata', detailTerms.every(term => detail.text.includes(term)), { required: detailTerms, text: detail.text.slice(0, 2500) }, {
    summary: 'Doctor lazy detail omitted required provenance or requested/effective metadata.'
  });
  await page.keyboard.press('Escape');
  await page.locator('[data-doctor-item="project-authority"] [data-action="doctor-item-details"]').click({ force: true });
  await page.waitForTimeout(50);
  const typedDetailText = await page.locator('#pm-settings-portals').innerText();
  await record('doctor.typed_route_detail_truth', ['Remediation mode', 'Typed owner route', 'projects/project-sync', 'Owner route'].every(term => typedDetailText.includes(term)) && !typedDetailText.includes('settings.doctor.remediation.open'), { text: typedDetailText.slice(0, 1800) }, {
    summary: 'Doctor typed-route details omitted their explicit owner-route identity or exposed the inbound Settings action.'
  });
  await page.keyboard.press('Escape');
  await page.locator('[data-action="doctor-scope"][data-scope="integrations"]').click({ force: true });
  await page.locator('[data-doctor-item="auth-browser"] [data-action="doctor-item-details"]').click({ force: true });
  await page.waitForTimeout(50);
  const unavailableDetailText = await page.locator('#pm-settings-portals').innerText();
  await record('doctor.unavailable_detail_truth', ['Remediation mode', 'Unavailable', 'Unavailable reason', 'human_only_policy_has_no_doctor_remediation'].every(term => unavailableDetailText.includes(term)), { text: unavailableDetailText.slice(0, 1800) }, {
    summary: 'Doctor unavailable details omitted the exact fail-closed reason.'
  });
  await page.keyboard.press('Escape');
  await openSettingsRoute('system', 'doctor');
  await page.locator('[data-action="doctor-scope"][data-scope="project"]').click({ force: true });
  const ownerControl = await page.locator('[data-doctor-item="source-control"] [data-action="doctor-open-owner"]').evaluate(node => ({
    id: node.id,
    uiActionId: node.dataset.uiActionId,
    inboundRouteActionStamped: node.hasAttribute('data-route-ui-action-id'),
    remediationMode: node.dataset.remediationMode,
    checkId: node.dataset.checkId,
    findingId: node.dataset.findingId,
    commandId: node.dataset.ownerCommandId,
    typedOwnerRouteId: node.dataset.typedOwnerRouteId,
    findingRevision: Number(node.dataset.findingRevision),
    targetId: node.dataset.targetId,
    ownerRoute: node.dataset.ownerRoute,
    returnRoute: node.dataset.returnRoute,
    returnScope: node.dataset.returnScope,
    ownerGeneration: Number(node.dataset.ownerGeneration),
    cacheGeneration: Number(node.dataset.cacheGeneration),
    idempotencyKey: node.dataset.idempotencyKey,
    availability: node.dataset.availability,
    disabledReason: node.dataset.disabledReason || null
  }));
  await page.evaluate(() => window.PM12_KIMI.dispatchAction('doctor-open-owner', { id: 'source-control' }));
  await page.waitForTimeout(80);
  const activeReturnContext = await page.evaluate(() => window.PM12_KIMI.getState().doctorReturnContext || null);
  const routed = await page.evaluate(() => ({ domain: window.PM12_KIMI.getState().domain, workspace: window.PM12_KIMI.getState().workspace }));
  await record('doctor.command_route_full_context', ownerControl.id === 'doctor-remediation-source-control' && ownerControl.uiActionId === 'ui.doctor.open_remediation' && !ownerControl.inboundRouteActionStamped && ownerControl.remediationMode === 'owner_command_route' && ownerControl.commandId === 'cmd.source_control.status.refresh' && ownerControl.typedOwnerRouteId === '' && ownerControl.findingRevision === 3 && ownerControl.ownerGeneration === 14 && ownerControl.cacheGeneration === 27 && ownerControl.availability === 'available' && routed.domain === 'source' && routed.workspace === 'browser-scm' && activeReturnContext?.checkId === ownerControl.checkId && activeReturnContext?.findingId === ownerControl.findingId && activeReturnContext?.findingRevision === ownerControl.findingRevision && activeReturnContext?.targetId === ownerControl.targetId && activeReturnContext?.ownerActionId === ownerControl.commandId && activeReturnContext?.typedOwnerRouteId === null && activeReturnContext?.ownerRoute?.join('/') === ownerControl.ownerRoute && activeReturnContext?.returnRoute?.join('/') === ownerControl.returnRoute && activeReturnContext?.returnScope === ownerControl.returnScope && activeReturnContext?.returnFocusId === ownerControl.id && activeReturnContext?.expectedOwnerGeneration === ownerControl.ownerGeneration && activeReturnContext?.expectedCacheGeneration === ownerControl.cacheGeneration && activeReturnContext?.idempotencyKey === ownerControl.idempotencyKey && activeReturnContext?.ownerResultRequired === true && activeReturnContext?.routeOnlyConceptPreview === false && activeReturnContext?.productionMutationDispatched === false && activeReturnContext?.browserProjectionOnly === true, { control: ownerControl, routed, context: activeReturnContext }, {
    summary: 'Doctor command remediation lost exact owner-action, route, return, generation, or idempotency context.'
  });

  const validOwnerReturn = (control, normalizedStatus, ownerResultRef, overrides = {}) => ({
    checkId: control.checkId,
    findingId: control.findingId,
    findingRevision: control.findingRevision,
    targetId: control.targetId,
    ownerActionId: control.commandId,
    typedOwnerRouteId: '',
    idempotencyKey: control.idempotencyKey,
    ownerResultRef,
    normalizedStatus,
    outcome: 'succeeded',
    baseOwnerGeneration: control.ownerGeneration,
    baseCacheGeneration: control.cacheGeneration,
    ownerGeneration: control.ownerGeneration + 1,
    cacheGeneration: control.cacheGeneration + 1,
    freshnessState: 'fresh',
    ...overrides
  });
  const readRejectedReturn = () => page.evaluate(() => {
    const state = window.PM12_KIMI.getState();
    return { route: [state.domain, state.workspace], rejected: state.doctorReturnRejected || null, context: state.doctorReturnContext || null, receipt: state.doctorReturnReceipt || null };
  });

  await page.evaluate(payload => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(payload), validOwnerReturn(ownerControl, 'healthy', ''));
  await page.waitForTimeout(80);
  const missingResultReturn = await readRejectedReturn();
  await record('doctor.remediation_return_rejects_missing_result', missingResultReturn.route.join('/') === 'source/browser-scm' && missingResultReturn.rejected === 'owner_result_missing' && missingResultReturn.context?.idempotencyKey === ownerControl.idempotencyKey && !missingResultReturn.receipt, missingResultReturn, {
    summary: 'Doctor accepted a return without a nonempty owner-result reference or lost its context.'
  });

  await page.evaluate(payload => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(payload), validOwnerReturn(ownerControl, 'Healthy', 'owner-result:source-control:unnormalized-fixture'));
  await page.waitForTimeout(80);
  const statusRejectedReturn = await readRejectedReturn();
  await record('doctor.remediation_return_rejects_unnormalized_status', statusRejectedReturn.route.join('/') === 'source/browser-scm' && statusRejectedReturn.rejected === 'owner_result_status_invalid' && statusRejectedReturn.context?.idempotencyKey === ownerControl.idempotencyKey && !statusRejectedReturn.receipt, statusRejectedReturn, {
    summary: 'Doctor accepted an owner result whose status was not in the normalized result vocabulary.'
  });

  await page.evaluate(payload => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(payload), validOwnerReturn(ownerControl, 'healthy', 'owner-result:source-control:identity-fixture', { ownerActionId: 'cmd.source_control.wrong' }));
  await page.waitForTimeout(80);
  const identityRejectedReturn = await readRejectedReturn();
  await record('doctor.remediation_return_rejects_identity_mismatch', identityRejectedReturn.route.join('/') === 'source/browser-scm' && identityRejectedReturn.rejected === 'owner_result_identity_mismatch' && identityRejectedReturn.context?.findingId === ownerControl.findingId && identityRejectedReturn.context?.idempotencyKey === ownerControl.idempotencyKey && !identityRejectedReturn.receipt, identityRejectedReturn, {
    summary: 'Doctor accepted a result for the wrong owner action or lost exact return context.'
  });

  await page.evaluate(payload => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(payload), validOwnerReturn(ownerControl, 'healthy', 'owner-result:source-control:idempotency-fixture', { idempotencyKey: `${ownerControl.idempotencyKey}:wrong` }));
  await page.waitForTimeout(80);
  const idempotencyRejectedReturn = await readRejectedReturn();
  await record('doctor.remediation_return_rejects_idempotency_mismatch', idempotencyRejectedReturn.route.join('/') === 'source/browser-scm' && idempotencyRejectedReturn.rejected === 'owner_result_identity_mismatch' && idempotencyRejectedReturn.context?.idempotencyKey === ownerControl.idempotencyKey && !idempotencyRejectedReturn.receipt, idempotencyRejectedReturn, {
    summary: 'Doctor accepted a result with the wrong idempotency key or lost exact return context.'
  });

  await page.evaluate(payload => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(payload), validOwnerReturn(ownerControl, 'healthy', 'owner-result:source-control:stale-fixture', { baseOwnerGeneration: ownerControl.ownerGeneration - 1 }));
  await page.waitForTimeout(80);
  const currentnessRejectedReturn = await readRejectedReturn();
  await record('doctor.remediation_return_rejects_currentness_mismatch', currentnessRejectedReturn.route.join('/') === 'source/browser-scm' && currentnessRejectedReturn.rejected === 'owner_result_currentness_mismatch' && currentnessRejectedReturn.context?.expectedOwnerGeneration === ownerControl.ownerGeneration && currentnessRejectedReturn.context?.expectedCacheGeneration === ownerControl.cacheGeneration && !currentnessRejectedReturn.receipt, currentnessRejectedReturn, {
    summary: 'Doctor accepted a stale generation or freshness result or lost exact return context.'
  });

  await page.evaluate(payload => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(payload), validOwnerReturn(ownerControl, 'needs_attention', 'owner-result:source-control:attention-fixture'));
  await page.waitForFunction(focusId => {
    const state = window.PM12_KIMI.getState();
    return state.domain === 'system' && state.workspace === 'doctor' && document.activeElement?.id === focusId;
  }, ownerControl.id, { timeout: 5000 });
  const attentionReturn = await page.evaluate(focusId => {
    const state = window.PM12_KIMI.getState();
    const item = document.querySelector('[data-doctor-item="source-control"]');
    const control = document.getElementById(focusId);
    return { route: [state.domain, state.workspace], scope: state.doctorScope, focusedId: document.activeElement?.id || null, receipt: state.doctorReturnReceipt || null, context: state.doctorReturnContext || null, rejected: state.doctorReturnRejected || null, itemState: item?.querySelector('.doctor-state')?.textContent.trim() || null, ownerGeneration: Number(control?.dataset.ownerGeneration), cacheGeneration: Number(control?.dataset.cacheGeneration) };
  }, ownerControl.id);
  await record('doctor.fresh_attention_return_accepted_unresolved', attentionReturn.route.join('/') === 'system/doctor' && attentionReturn.scope === 'project' && attentionReturn.focusedId === ownerControl.id && attentionReturn.receipt?.returnAccepted === true && attentionReturn.receipt?.remediationResolved === false && attentionReturn.receipt?.normalizedStatus === 'needs_attention' && attentionReturn.receipt?.ownerResultRef === 'owner-result:source-control:attention-fixture' && attentionReturn.receipt?.idempotencyKey === ownerControl.idempotencyKey && attentionReturn.receipt?.findingRevision === ownerControl.findingRevision && attentionReturn.receipt?.baseOwnerGeneration === ownerControl.ownerGeneration && attentionReturn.receipt?.baseCacheGeneration === ownerControl.cacheGeneration && attentionReturn.receipt?.ownerGeneration === ownerControl.ownerGeneration + 1 && attentionReturn.receipt?.cacheGeneration === ownerControl.cacheGeneration + 1 && attentionReturn.receipt?.freshnessState === 'fresh' && attentionReturn.receipt?.productionMutationDispatched === false && attentionReturn.receipt?.productionRuntimeState === 'unavailable' && !attentionReturn.context && !attentionReturn.rejected && attentionReturn.itemState === 'Needs attention' && attentionReturn.ownerGeneration === ownerControl.ownerGeneration + 1 && attentionReturn.cacheGeneration === ownerControl.cacheGeneration + 1, attentionReturn, {
    summary: 'Doctor failed to return an exact fresh needs-attention result or falsely promoted it to Ready.'
  });

  const healthyControl = await page.locator('[data-doctor-item="source-control"] [data-action="doctor-open-owner"]').evaluate(node => ({
    id: node.id,
    checkId: node.dataset.checkId,
    findingId: node.dataset.findingId,
    findingRevision: Number(node.dataset.findingRevision),
    targetId: node.dataset.targetId,
    commandId: node.dataset.ownerCommandId,
    idempotencyKey: node.dataset.idempotencyKey,
    ownerGeneration: Number(node.dataset.ownerGeneration),
    cacheGeneration: Number(node.dataset.cacheGeneration)
  }));
  await page.evaluate(() => window.PM12_KIMI.dispatchAction('doctor-open-owner', { id: 'source-control' }));
  await page.evaluate(payload => window.PM7_SYSTEMS_INTEGRATION.return_to_doctor(payload), validOwnerReturn(healthyControl, 'healthy', 'owner-result:source-control:healthy-fixture'));
  await page.waitForFunction(focusId => window.PM12_KIMI.getState().domain === 'system' && window.PM12_KIMI.getState().workspace === 'doctor' && document.activeElement?.id === focusId, healthyControl.id, { timeout: 5000 });
  const healthyReturn = await page.evaluate(focusId => {
    const state = window.PM12_KIMI.getState();
    return { receipt: state.doctorReturnReceipt || null, context: state.doctorReturnContext || null, rejected: state.doctorReturnRejected || null, focusedId: document.activeElement?.id || null, itemState: document.querySelector('[data-doctor-item="source-control"] .doctor-state')?.textContent.trim() || null };
  }, healthyControl.id);
  await record('doctor.explicit_fresh_healthy_may_ready', healthyReturn.receipt?.returnAccepted === true && healthyReturn.receipt?.remediationResolved === true && healthyReturn.receipt?.normalizedStatus === 'healthy' && healthyReturn.receipt?.ownerResultRef === 'owner-result:source-control:healthy-fixture' && healthyReturn.receipt?.productionMutationDispatched === false && healthyReturn.receipt?.browserProjectionOnly === true && healthyReturn.receipt?.productionRuntimeState === 'unavailable' && healthyReturn.focusedId === healthyControl.id && healthyReturn.itemState === 'Ready' && !healthyReturn.context && !healthyReturn.rejected, healthyReturn, {
    summary: 'Doctor did not reserve Ready for an explicit fresh healthy owner result.'
  });

  const tabExpectations = {
    browser: ['PM-native Browser', 'AuthBrowserSession', 'human-only', 'non-recordable', 'non-inspectable', 'Unavailable'],
    capture: ['Test Capture', 'explicit', 'bounded', 'redacted', 'AuthBrowserSession', 'Never captured', 'Native Slint'],
    scm: ['Source Control', 'Git', 'Jujutsu', 'GitHub', 'GitLab', 'Azure DevOps', 'Bitbucket', 'Human AuthBrowser handoff'],
    origin: ['Cursor Origin Preview', 'Preview insertion', 'Optional', 'Human-only', 'Rollback'],
    plans: ['Named Plans', 'Named Plan System', 'Planning Wizard'],
    performance: ['Truthful responsive work', 'ObservableWork', 'Browser evidence', 'Never promoted to native certification']
  };
  await openSettingsRoute('source', 'browser-scm');
  for (const [tab, expected] of Object.entries(tabExpectations)) {
    await page.evaluate(selected => window.PM12_KIMI.dispatchAction('browser-scm-tab', { tab: selected }), tab);
    await page.waitForTimeout(30);
    const text = await page.locator('#workspace-browser-scm').innerText();
    const tabState = await page.evaluate(() => ({ model: window.PM12_KIMI.getState().browserScmTab || null, active: document.querySelector('#workspace-browser-scm [data-action="browser-scm-tab"].active')?.getAttribute('data-tab') || null }));
    await record(`consumers.${tab}`, expected.every(term => text.includes(term)) && tabState.model === tab && tabState.active === tab, { requestedTab: tab, tabState, expected, text: text.slice(0, 3000) }, {
      summary: `${tab} consumer omitted a required owner or safety boundary.`
    });
  }

  const consumerTabTypes = await page.locator('#workspace-browser-scm [data-action="browser-scm-tab"]').evaluateAll(nodes => nodes.map(node => ({
    tab: node.dataset.tab,
    action: node.dataset.action,
    uiActionId: node.dataset.uiActionId || null
  })));
  await record('actions.consumer_tab_typed_attributes', consumerTabTypes.length === Object.keys(tabExpectations).length && consumerTabTypes.every(row => row.action && row.uiActionId), consumerTabTypes, {
    summary: 'Browser/Capture/SCM/Origin/Named Plans/performance tabs lack typed UI action identifiers.'
  });

  await page.evaluate(() => window.PM12_KIMI.dispatchAction('open-performance-evidence'));
  await page.waitForTimeout(30);
  const performanceEvidence = await page.locator('#pm-settings-portals').innerText();
  await record('consumers.performance_evidence_detail', ['P50, P95, P99', '16.7 ms', 'Native certification', 'Separate execution required'].every(term => performanceEvidence.includes(term)), { text: performanceEvidence.slice(0, 2000) }, {
    summary: 'Performance evidence detail omitted percentile or native-certification boundaries.'
  });
  await page.keyboard.press('Escape');

  const typedActionSource = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const expected = {
      'doctor-scope': 'ui.doctor.refresh_visible',
      'doctor-check-scope': 'ui.doctor.run_check',
      'doctor-item-details': 'ui.doctor.open_details',
      'doctor-open-owner': 'ui.doctor.open_remediation',
      'open-capture-policy': 'ui.capture.policy.inspect',
      'preview-origin': 'ui.origin.preview.open',
      'open-named-plan': 'ui.named_plan.inspect',
      'open-planning-wizard': 'ui.planning_wizard.open',
      'open-performance-evidence': 'ui.performance.evidence.inspect',
      'replay-onboarding': 'settings.onboarding.run_again',
      'start-guided-tour': 'settings.guided_tour.replay'
    };
    return Object.fromEntries(Object.entries(expected).map(([action, uiActionId]) => [action, {
      uiActionId,
      actionPresent: html.includes(`data-action="${action}"`),
      typedIdPresent: html.includes(`data-ui-action-id="${uiActionId}"`)
    }]));
  });
  const missingTyped = Object.entries(typedActionSource).filter(([, row]) => !row.actionPresent || !row.typedIdPresent).map(([action, row]) => ({ action, ...row }));
  await record('actions.typed_ui_attributes', missingTyped.length === 0, { controls: typedActionSource, missing: missingTyped }, {
    summary: 'One or more T46 command/UI controls lack a typed data-ui-action-id attribute.'
  });

  await openSettingsRoute('system', 'backup');
  const backupText = await page.locator('#workspace-backup').innerText();
  const backupRequired = ['Server configuration', 'Databases and durable owner records', 'Project and Vault metadata', 'Histories and receipts', 'Ordinary secret bytes', 'Excluded; references only', 'Binaries, caches, active processes, PTYs, live browser state, reconstructable payloads', 'Excluded by default'];
  await record('backup.rendered_inclusion_exclusion', backupRequired.every(term => backupText.includes(term)), { required: backupRequired, text: backupText.slice(0, 5000) }, {
    summary: 'Rendered Full Server Backup overview does not show the exact inclusion/exclusion boundary.'
  });
  await page.evaluate(() => window.PM12_KIMI.dispatchAction('view-backup-coverage'));
  await page.waitForTimeout(50);
  const coverageText = await page.locator('#pm-settings-portals').innerText();
  await record('backup.portable_secret_boundary', coverageText.includes('Portable secrets require a separately encrypted user-controlled recovery envelope') && coverageText.includes('Owner feed not attached') && coverageText.includes('not a current backup projection'), { text: coverageText.slice(0, 3000) }, {
    summary: 'Backup detail did not disclose portable-secret handling and currentness limits.'
  });
  await page.keyboard.press('Escape');
  await openSettingsRoute('system', 'servers');
  await page.evaluate(() => window.PM12_KIMI.dispatchAction('server-tab', { tab: 'backup' }));
  const serverBackupText = await page.locator('#workspace-servers').innerText();
  const serverTabState = await page.evaluate(() => ({ model: window.PM12_KIMI.getState().serverTab || null, active: document.querySelector('#workspace-servers [data-action="server-tab"].active')?.getAttribute('data-tab') || null }));
  const staleTerms = ['owner indexes', 'raw credentials', 'disposable caches'];
  await record('backup.server_consumer_copy', serverTabState.model === 'backup' && serverTabState.active === 'backup' && backupRequired.slice(0, 6).every(term => serverBackupText.includes(term)) && staleTerms.every(term => !serverBackupText.toLowerCase().includes(term)), { requestedTab: 'backup', tabState: serverTabState, stale_terms: staleTerms, text: serverBackupText.slice(0, 3000) }, {
    summary: 'Server Full Server Backup tab is inert or retains stale inclusion/exclusion copy.',
    reproduction: `Open ${input}; Settings > System > Servers & Environments > Full Server Backup; inspect the description and policy rows.`
  });

  await openSettingsRoute('system', 'doctor');
  const replayControls = await page.evaluate(() => [...document.querySelectorAll('[data-action="replay-onboarding"], [data-action="start-guided-tour"]')].map(node => ({
    action: node.dataset.action,
    uiActionId: node.dataset.uiActionId,
    text: node.textContent.trim()
  })));
  const moduleAvailability = await page.evaluate(() => ({
    onboarding: Boolean(window.PM7_ONBOARDING_CINEMATIC && typeof window.PM7_ONBOARDING_CINEMATIC.replay === 'function'),
    tour: Boolean(window.PM7_GUIDED_TOUR && typeof window.PM7_GUIDED_TOUR.start === 'function')
  }));
  await record('settings.replay_tour_routes', replayControls.length === 2 && replayControls.every(row => row.uiActionId) && moduleAvailability.onboarding && moduleAvailability.tour, { controls: replayControls, availability: moduleAvailability }, {
    summary: 'Settings replay/tour routes are missing typed actions or truthfully mounted handlers.'
  });

  const storedChatBefore = await page.evaluate(() => {
    const home = window.PM_HOME_WORKSPACE;
    const surface = home?.layout?.surfaces?.find(row => row.surface_instance_id === 'chat');
    return surface ? JSON.parse(JSON.stringify(surface)) : null;
  });
  const widthRows = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.PM7_SYSTEMS_INTEGRATION.sync_host());
    const row = await page.evaluate(async ({ widthValue, selectors }) => {
      const nextFrame = () => new Promise(resolveFrame => requestAnimationFrame(resolveFrame));
      const snapshot = () => {
        const shell = document.querySelector('.app-shell');
        const settingsShell = document.querySelector(`${selectors.root} .pm-shell`);
        const panel = document.getElementById('panel-settings');
        const root = document.querySelector(selectors.root);
        const rail = document.querySelector(selectors.rail);
        const topbar = document.querySelector(selectors.topbar);
        const workspaceTabs = document.querySelector(selectors.workspace_tabs);
        const manager = document.querySelector(selectors.manager);
        const portalRoot = document.querySelector(selectors.portal_root);
        const chat = document.getElementById('chatPanel');
        const home = window.PM_HOME_WORKSPACE;
        const storedChat = home?.layout?.surfaces?.find(item => item.surface_instance_id === 'chat');
        const rect = node => node ? node.getBoundingClientRect() : null;
        const style = node => node ? getComputedStyle(node) : null;
        const visible = node => {
          if (!node) return false;
          const box = rect(node), css = style(node);
          return css.display !== 'none' && css.visibility !== 'hidden' && box.width > 0 && box.height > 0;
        };
        const rootRect = rect(root), railRect = rect(rail), topbarRect = rect(topbar), panelRect = rect(panel);
        const rootStyle = style(root), railStyle = style(rail), settingsShellStyle = style(settingsShell);
        return {
          viewportWidth: widthValue,
          shellWidth: rect(shell)?.width ?? null,
          hostWidth: panelRect?.width ?? null,
          rootWidth: rootRect?.width ?? null,
          rootLeft: rootRect?.left ?? null,
          railWidth: railRect?.width ?? null,
          railLeft: railRect?.left ?? null,
          railRight: railRect?.right ?? null,
          railPosition: railStyle?.position ?? null,
          railTransform: railStyle?.transform ?? null,
          railDisplay: railStyle?.display ?? null,
          railOpen: Boolean(settingsShell?.classList.contains('rail-open')),
          topbarHeight: topbarRect?.height ?? null,
          rootRailToken: Number.parseFloat(rootStyle?.getPropertyValue('--k3-rail-w') || ''),
          rootTopbarToken: Number.parseFloat(rootStyle?.getPropertyValue('--k3-topbar-h') || ''),
          settingsShellColumns: settingsShellStyle?.gridTemplateColumns ?? null,
          rootVisible: visible(root),
          topbarVisible: visible(topbar),
          workspaceTabsVisible: visible(workspaceTabs),
          managerVisible: visible(manager),
          portalRootPresent: Boolean(portalRoot),
          focusHost: document.body.classList.contains('pm7-settings-focus-host'),
          chatDisplay: style(chat)?.display ?? null,
          hostProjection: window.PM7_SYSTEMS_INTEGRATION?.host_projection?.() || null,
          storedChat: storedChat ? JSON.parse(JSON.stringify(storedChat)) : null,
          overflow: {
            documentClient: document.documentElement.clientWidth,
            documentScroll: document.documentElement.scrollWidth,
            bodyClient: document.body.clientWidth,
            bodyScroll: document.body.scrollWidth
          }
        };
      };
      const stableKeys = ['hostWidth', 'rootWidth', 'railWidth', 'topbarHeight'];
      const sameGeometry = (left, right) => stableKeys.every(key => Number.isFinite(left[key]) && Number.isFinite(right[key]) && Math.abs(left[key] - right[key]) <= .75);
      let previous = snapshot(), first = previous, second = previous, stablePairs = 0, settled = false;
      const trace = [{ frame: 0, hostWidth: previous.hostWidth, rootWidth: previous.rootWidth, rootLeft: previous.rootLeft, railWidth: previous.railWidth, topbarHeight: previous.topbarHeight, focusHost: previous.focusHost }];
      for (let frame = 1; frame <= 48; frame += 1) {
        await nextFrame();
        const current = snapshot();
        trace.push({ frame, hostWidth: current.hostWidth, rootWidth: current.rootWidth, rootLeft: current.rootLeft, railWidth: current.railWidth, topbarHeight: current.topbarHeight, focusHost: current.focusHost });
        if (sameGeometry(previous, current)) stablePairs += 1;
        else stablePairs = 0;
        first = previous;
        second = current;
        if (stablePairs >= 2) { settled = true; break; }
        previous = current;
      }
      return { width: widthValue, first, second, settlement: { settled, framesObserved: trace.length, stablePairs, trace } };
    }, { widthValue: width, selectors: geometrySelectors });
    widthRows.push(row);
    const measured = row.second;
    const expected = Number.isFinite(measured.hostWidth) ? expectedK3Geometry(measured.hostWidth) : { railWidthPx: null, topbarHeightPx: null, band: 'invalid_host_width', behavior: null };
    const stable = row.settlement?.settled === true && ['hostWidth', 'rootWidth', 'railWidth', 'topbarHeight'].every(key => closePx(row.first[key], measured[key]));
    const finitePositiveHost = [measured.hostWidth, measured.rootWidth, measured.topbarHeight].every(value => Number.isFinite(value) && value > 0);
    const sharedVisibleGeometry = finitePositiveHost && measured.rootVisible && measured.topbarVisible && measured.workspaceTabsVisible && measured.managerVisible && measured.portalRootPresent && closePx(measured.rootWidth, measured.hostWidth) && closePx(measured.rootRailToken, expected.railWidthPx) && closePx(measured.rootTopbarToken, expected.topbarHeightPx) && closePx(measured.topbarHeight, expected.topbarHeightPx);
    const persistentRail = expected.railWidthPx > 0 && closePx(measured.railWidth, expected.railWidthPx) && !['absolute', 'fixed'].includes(measured.railPosition) && measured.railLeft >= measured.rootLeft - geometryTolerance && measured.railRight <= measured.rootLeft + measured.rootWidth + geometryTolerance;
    const mobileRail = expected.railWidthPx === 0 && measured.railWidth > 0 && ['absolute', 'fixed'].includes(measured.railPosition) && !measured.railOpen && measured.railTransform !== 'none' && measured.railRight <= measured.rootLeft + geometryTolerance;
    await record(`width.${width}.stable_two_frame_geometry`, stable, { expected, ...row }, {
      summary: `Settings geometry did not reach two consecutive stable frame pairs within the bounded resize-settlement window at ${width}px.`
    });
    await record(`width.${width}.no_document_overflow`, measured.overflow.documentScroll <= measured.overflow.documentClient, { expected, ...row }, {
      summary: `Document horizontally overflows at physical width ${width}px.`,
      reproduction: `Open ${input}; enter Settings; set the physical viewport to ${width}x900; compare document scrollWidth to clientWidth.`
    });
    await record(`width.${width}.no_body_overflow`, measured.overflow.bodyScroll <= measured.overflow.bodyClient, { expected, ...row }, {
      summary: `Body horizontally overflows at physical width ${width}px.`,
      reproduction: `Open ${input}; enter Settings; set the physical viewport to ${width}x900; compare body scrollWidth to clientWidth.`
    });
    await record(`width.${width}.k3_manifest_geometry`, sharedVisibleGeometry && (persistentRail || mobileRail), { expected, sharedVisibleGeometry, persistentRail, mobileRail, ...row }, {
      summary: `Measured Settings-host geometry does not match the K3 manifest band at ${width}px.`
    });
    if (expected.railWidthPx === 0) {
      await record(`width.${width}.mobile_rail_off_canvas`, mobileRail, { expected, ...row }, {
        summary: `The K3 mobile rail was not out of flow and off canvas at ${width}px.`
      });
    }
    const shouldSuppress = Boolean(measured.hostProjection?.settings_active && measured.hostProjection?.shell_width > 0 && measured.hostProjection?.projected_with_chat < measured.hostProjection?.threshold);
    await record(`width.${width}.settings_chat_suppression`, measured.focusHost === shouldSuppress && (!measured.focusHost || measured.chatDisplay === 'none') && JSON.stringify(measured.storedChat) === JSON.stringify(storedChatBefore), { expectedSuppression: shouldSuppress, expected, ...row }, {
      summary: `Settings focus-host Chat behavior or stored Chat layout changed at ${width}px.`,
      reproduction: `Open ${input}; enter Settings with a saved Chat layout; resize the physical app host to ${width}px.`
    });
  }
  await record('width.k3_required_width_census', widthRows.length === widths.length && widthRows.length === 18 && JSON.stringify(widthRows.map(row => row.width)) === JSON.stringify(widths), { manifestWidths: widths, measuredWidths: widthRows.map(row => row.width) }, {
    summary: 'The K3 verifier did not measure every manifest-required physical width.'
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  const themeRows = [];
  for (const theme of themes) {
    const row = await page.evaluate(async selected => {
      document.documentElement.setAttribute('data-theme', selected);
      localStorage.setItem('pm.theme', selected);
      await new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
      const root = document.getElementById('pm-settings-root');
      const topbar = document.querySelector('#panel-settings .topbar');
      return {
        theme: document.documentElement.getAttribute('data-theme'),
        rootVisible: Boolean(root && getComputedStyle(root).visibility !== 'hidden' && root.getBoundingClientRect().width > 0),
        topbarBackground: topbar ? getComputedStyle(topbar).backgroundColor : null,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    }, theme);
    themeRows.push(row);
    await record(`theme.${theme}`, row.theme === theme && row.rootVisible && row.documentOverflow <= 0, row, {
      summary: `Settings did not remain visible and overflow-free in theme ${theme}.`
    });
  }

  const reduced = await makeContext('reduced-motion', { reducedMotion: true });
  const reducedPage = reduced.page;
  page = reducedPage;
  await reducedPage.evaluate(() => window.PM7_SETTINGS_COMMANDS.open({ domain: 'system', workspace: 'doctor' }));
  await reducedPage.waitForSelector('[data-doctor-item="server-trust"]');
  const motion = await reducedPage.evaluate(() => {
    const item = document.querySelector('.doctor-item');
    const scope = document.querySelector('.doctor-scope');
    const card = document.querySelector('.systems-contract-card');
    const snapshot = node => node ? { animationName: getComputedStyle(node).animationName, animationDuration: getComputedStyle(node).animationDuration, transitionDuration: getComputedStyle(node).transitionDuration } : null;
    return { media: matchMedia('(prefers-reduced-motion: reduce)').matches, item: snapshot(item), scope: snapshot(scope), card: snapshot(card) };
  });
  const durationSeconds = value => Number.parseFloat(value) * (String(value).trim().endsWith('ms') ? 0.001 : 1);
  const noMotion = row => !row || ((row.animationName === 'none' || durationSeconds(row.animationDuration) <= 0.001) && row.transitionDuration.split(',').every(value => durationSeconds(value) <= 0.001));
  await record('reduced_motion.systems_surfaces', motion.media && noMotion(motion.item) && noMotion(motion.scope) && noMotion(motion.card), motion, {
    summary: 'T46 systems surfaces retain animation or transition time under reduced motion.'
  });
  await reduced.context.close();
  page = main.page;

  await record('runtime.console_and_page_errors', report.runtime_errors.length === 0, report.runtime_errors, {
    summary: 'Console or page errors occurred during the T46 systems integration matrix.',
    screenshot: false
  });
  await main.context.close();
} catch (error) {
  report.runtime_errors.push({ kind: 'harness', text: String(error?.stack || error) });
  await record('harness.completed', false, { error: String(error?.stack || error) }, {
    summary: 'Systems integration verifier did not complete its matrix.'
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
await record('evidence_identity_and_browser_native_boundary',
  JSON.stringify(report.provenance.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
    JSON.stringify(report.certification_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY) &&
    JSON.stringify(report.execution_boundary) === JSON.stringify(BROWSER_ONLY_BOUNDARY),
  {
    provenance_boundary: report.provenance.certification_boundary,
    certification_boundary: report.certification_boundary,
    execution_boundary: report.execution_boundary
  }, {
    summary: 'The evidence boundary differs from the exact shared browser-concept-only boundary.',
    screenshot: false
  });
await record('shared_provenance_runtime_clean', report.runtime_errors.length === 0 && report.provenance.runtime_errors.count === 0, {
  verifier: report.runtime_errors,
  provenance: report.provenance.runtime_errors
}, {
  summary: 'The verifier or shared provenance envelope observed runtime errors.',
  screenshot: false
});
const failed = report.checks.filter(check => !check.pass).length;
report.summary = { total: report.checks.length, passed: report.checks.length - failed, failed, runtime_errors: report.runtime_errors.length };
report.disposition = failed === 0 && report.runtime_errors.length === 0 ? 'browser_checks_passed' : 'browser_findings_present';
writeFileSync(evidencePath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ disposition: report.disposition, evidence: evidencePath, summary: report.summary }));
process.exitCode = report.disposition === 'browser_checks_passed' ? 0 : 1;
