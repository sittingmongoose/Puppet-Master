/* Pure/adversarial provenance-v2 self-test. No browser is launched. Invalid
 * envelopes are re-sealed before admission so rejection proves deep semantics. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { closeSync, fstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  BROWSER_ONLY_BOUNDARY, REQUIRED_POLICY_PROBES, __test,
  assertProvenanceAdmission, classifyRequestUrl, createDurableFailureSink,
  parseStrictVerifierArgs, provenanceAdmissionFailures
} from './browser_verifier_provenance.mjs';

const D = Object.freeze({ artifact: 'a'.repeat(64), verifier: 'b'.repeat(64), helper: 'c'.repeat(64), node: 'd'.repeat(64), browser: 'e'.repeat(64), launcher: 'f'.repeat(64), pwIndex: '1'.repeat(64), pwPackage: '2'.repeat(64), network: '3'.repeat(64), download: '4'.repeat(64) });
const sha256 = value => createHash('sha256').update(value).digest('hex');
const canonicalBytes = __test.canonicalBytes;
const clone = structuredClone;
const results = [];
let invalidEnvelopeDenominator = 0;
const exactIndependentAttackIds = [];
async function test(name, callback) { try { await callback(); results.push({ name, pass: true }); } catch (error) { results.push({ name, pass: false, error: String(error?.stack || error) }); } }
function mustReject(callback, pattern = /./) { assert.throws(callback, pattern); }
function statRow(size = 128, mode = 0o100755, inode = 17) { return { device: 7, inode, mode, size_bytes: size, mtime_ns: '1789000000000000000', ctime_ns: '1789000000000000001' }; }
function binding(label, digest, resolvedPath, { size = 128, executable = false, inode = 17 } = {}) {
  const stat = statRow(size, executable ? 0o100755 : 0o100400, inode);
  return { label, source_kind: ['artifact', 'node_executable', 'browser_executable'].includes(label) ? 'inherited_descriptor' : 'secure_path', requested_path: resolvedPath, resolved_path: resolvedPath, sha256: digest, expected_sha256: digest, executable_kind: executable ? 'elf' : null, is_regular_file: true, leaf_symlink: false, ancestor_symlink_count: 0, ancestor_chain_sha256: '5'.repeat(64), initial_stat: clone(stat), post_use_stat: clone(stat), post_use_sha256: digest, unchanged: true };
}
function treeBinding(label, root, rows) {
  const core = { schema_id: 'pm.browser_verifier_tree_manifest.v1', rows: rows.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'mode'))), file_count: rows.filter(row => row.kind === 'file').length, directory_count: rows.filter(row => row.kind === 'directory').length };
  const digest = sha256(canonicalBytes(core));
  return { label, root, manifest_schema_id: core.schema_id, manifest_rows: clone(rows), manifest_sha256: digest, expected_manifest_sha256: digest, file_count: core.file_count, directory_count: core.directory_count, post_use_manifest_sha256: digest, post_use_file_count: core.file_count, post_use_directory_count: core.directory_count, unchanged: true };
}
function processIdentity(executable, pid) { return { pid, proc_exe_path: executable.resolved_path, sha256: executable.sha256, stat: clone(executable.initial_stat), matches_pinned_descriptor: true }; }
const strictOptions = Object.freeze({
  file: { required: true }, outdir: { required: true }, modules: { required: true }, chromium: { required: true },
  'expected-artifact-sha256': { required: true, validate: value => /^[0-9a-f]{64}$/.test(value) },
  'expected-verifier-sha256': { required: true, validate: value => /^[0-9a-f]{64}$/.test(value) },
  'expected-helper-sha256': { required: true, validate: value => /^[0-9a-f]{64}$/.test(value) },
  'provenance-launch-receipt': { required: true },
  'expected-launch-receipt-sha256': { required: true, validate: value => /^[0-9a-f]{64}$/.test(value) }
});
function baseArgv(extra = []) { return ['/usr/bin/node', '/fixture/verifier.mjs', '--file', '/fixture/artifact.html', '--outdir', '/fixture/out', '--modules', '/fixture/stage/node_modules', '--chromium', '/fixture/browser-package/chrome', '--expected-artifact-sha256', D.artifact, '--expected-verifier-sha256', D.verifier, '--expected-helper-sha256', D.helper, '--provenance-launch-receipt', '/fixture/stage/launch-receipt.json', '--expected-launch-receipt-sha256', D.launcher, ...extra]; }
function commandFixture() {
  const parsed = clone(parseStrictVerifierArgs(baseArgv(), { options: strictOptions, allowSyntheticProcessIdentity: true }));
  const { normalized_config: _ignored, ...command } = parsed;
  return { ...command, normalized_effective_config: { verifier: 'selftest', artifact_path: '/fixture/artifact.html', outdir: '/fixture/out', service_workers: 'block', certification_mode: true } };
}
function request(sequence, caseId, probe, navigationId, url, decision = 'allow', reason = 'exact_immutable_artifact', resourceType = 'document') {
  const blocked = decision !== 'allow';
  return { sequence, case_id: caseId, probe, navigation_id: navigationId, decision, reason, method: resourceType === 'websocket' ? 'WEBSOCKET' : 'GET', url, resource_type: resourceType, navigation: resourceType === 'document', abort_error: blocked ? 'blockedbyclient' : null, observed_failure_error: blocked ? (resourceType === 'websocket' ? 'websocket_route_closed' : 'net::ERR_BLOCKED_BY_CLIENT') : null, correlated: blocked };
}
function seal(envelope) { envelope.admission = { pass: true, failures: [], envelope_sha256: null }; envelope.admission.envelope_sha256 = sha256(canonicalBytes(envelope)); return envelope; }
function cleanEnvelope() {
  const artifact = binding('artifact', D.artifact, '/fixture/artifact.html', { size: 128, inode: 1 });
  const nodeExecutable = binding('node_executable', D.node, '/usr/bin/node-real', { size: 4096, executable: true, inode: 2 });
  const browserExecutable = binding('browser_executable', D.browser, '/fixture/browser-package/chrome', { size: 8192, executable: true, inode: 3 });
  const pwRows = [{ path: 'index.js', kind: 'file', mode: 0o100400, size_bytes: 44, sha256: D.pwIndex }, { path: 'package.json', kind: 'file', mode: 0o100400, size_bytes: 55, sha256: D.pwPackage }];
  const browserRows = [{ path: 'chrome', kind: 'file', mode: 0o100755, size_bytes: 8192, sha256: D.browser }];
  const origin = 'http://127.0.0.1:43123', artifactPath = `/artifact/${D.artifact}.html`, mainUrl = `${origin}${artifactPath}?case=case-a`, probeUrl = `${origin}${artifactPath}?case=provenance-policy-probe`, redirectUrl = `${origin}/__pm_provenance/token/redirect`, downloadUrl = `${origin}/__pm_provenance/token/download`;
  const requests = [
    request(1, 'case-a', false, 'case-a:initial', mainUrl), request(2, 'provenance-policy-probe', true, 'provenance-policy-probe:bootstrap', probeUrl),
    request(3, 'provenance-policy-probe', true, null, 'http://example.invalid/pm7-provenance', 'block', 'origin_mismatch', 'fetch'),
    request(4, 'provenance-policy-probe', true, null, 'https://example.invalid/pm7-provenance', 'block', 'origin_mismatch', 'fetch'),
    request(5, 'provenance-policy-probe', true, null, `http://127.0.0.1.invalid:43123${artifactPath}`, 'block', 'origin_mismatch', 'fetch'),
    request(6, 'provenance-policy-probe', true, null, `http://127.0.0.1:43124${artifactPath}`, 'block', 'origin_mismatch', 'fetch'),
    request(7, 'provenance-policy-probe', true, null, redirectUrl, 'allow', 'bounded_probe_endpoint', 'fetch'),
    request(8, 'provenance-policy-probe', true, null, 'https://example.invalid/pm7-provenance-redirect-target', 'block', 'origin_mismatch', 'fetch'),
    request(9, 'provenance-policy-probe', true, null, `${origin}/escape`, 'block', 'unmanifested_same_origin_path', 'fetch'),
    request(10, 'provenance-policy-probe', true, null, 'ws://127.0.0.1:43123/pm7-provenance', 'blocked', 'websocket_not_allowed', 'websocket'),
    request(11, 'provenance-policy-probe', true, null, 'wss://example.invalid/pm7-provenance', 'blocked', 'websocket_not_allowed', 'websocket'),
    request(12, 'provenance-policy-probe', true, null, 'https://example.invalid/pm7-eventsource', 'block', 'origin_mismatch', 'eventsource'),
    request(13, 'provenance-policy-probe', true, null, `${origin}/__pm_provenance/unmanifested-service-worker.js`, 'block', 'unmanifested_same_origin_path', 'serviceworker'),
    request(14, 'provenance-policy-probe', true, null, downloadUrl, 'allow', 'bounded_probe_endpoint', 'document')
  ];
  const responses = [
    { sequence: 1, case_id: 'case-a', probe: false, navigation_id: 'case-a:initial', request_sequence: 1, url: mainUrl, status: 200, resource_type: 'document', navigation: true },
    { sequence: 2, case_id: 'provenance-policy-probe', probe: true, navigation_id: 'provenance-policy-probe:bootstrap', request_sequence: 2, url: probeUrl, status: 200, resource_type: 'document', navigation: true },
    { sequence: 3, case_id: 'provenance-policy-probe', probe: true, navigation_id: null, request_sequence: 7, url: redirectUrl, status: 302, resource_type: 'fetch', navigation: false },
    { sequence: 4, case_id: 'provenance-policy-probe', probe: true, navigation_id: null, request_sequence: 14, url: downloadUrl, status: 200, resource_type: 'document', navigation: true }
  ];
  const transportLedger = [
    { sequence: 1, method: 'GET', host: '127.0.0.1:43123', url: artifactPath + '?case=case-a', pathname: artifactPath, kind: 'artifact', status: 200, navigation_id: 'case-a:initial', served_sha256: D.artifact },
    { sequence: 2, method: 'GET', host: '127.0.0.1:43123', url: artifactPath + '?case=provenance-policy-probe', pathname: artifactPath, kind: 'artifact', status: 200, navigation_id: 'provenance-policy-probe:bootstrap', served_sha256: D.artifact },
    { sequence: 3, method: 'GET', host: '127.0.0.1:43123', url: '/__pm_provenance/token/redirect', pathname: '/__pm_provenance/token/redirect', kind: 'probe_redirect', status: 302, navigation_id: null, served_sha256: null },
    { sequence: 4, method: 'GET', host: '127.0.0.1:43123', url: '/__pm_provenance/token/download', pathname: '/__pm_provenance/token/download', kind: 'probe_download', status: 200, navigation_id: null, served_sha256: D.download }
  ];
  const navigation = (caseId, probe, navigationId, url, req, res, server) => ({ case_id: caseId, probe, navigation_id: navigationId, requested_url: url, request_url: url, final_url: url, main_frame: true, status: 200, redirect_chain: [], content_type: 'text/html', content_encoding: null, content_length_header: '128', body_size_bytes: 128, body_sha256: D.artifact, expected_artifact_sha256: D.artifact, hash_match: true, exact_url_policy: true, immutable_server_header_match: true, network_request_sequence: req, network_response_sequence: res, server_request_sequence: server });
  const probeReceipts = [
    ['cross_origin_http', 3, null, 'blocked'], ['cross_origin_https', 4, null, 'blocked'], ['origin_prefix_confusion', 5, null, 'blocked'], ['alternate_port', 6, null, 'blocked'], ['redirect', 8, 3, 'blocked'], ['encoded_traversal', 9, null, 'blocked'], ['userinfo_host_confusion', null, null, 'blocked'], ['file_url', null, null, 'blocked'], ['websocket', 10, null, 'blocked'], ['websocket_secure', 11, null, 'blocked'], ['eventsource', 12, null, 'blocked'], ['service_worker', 13, null, 'contained'], ['download', null, 4, 'contained']
  ].map(([name, route, server, decision]) => ({ name, evidence_class: __test.PROBE_CLASSES[name], decision, reason: name + '_proof', url: name + ':fixture', route_sequence: route, server_sequence: server, browser_error: ['userinfo_host_confusion', 'file_url', 'service_worker', 'download'].includes(name) ? 'contained by browser policy' : null, correlated: true }));
  const environment = { HOME: '/fixture/out', LANG: 'C.UTF-8', PATH: '/usr/bin:/bin', TZ: 'UTC' };
  const launchArgs = ['--enable-automation', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking', '--disable-component-update', '--disable-domain-reliability', '--disable-sync', '--metrics-recording-only', '--no-first-run', '--no-default-browser-check'];
  const envelope = {
    schema_id: 'pm.browser_verifier_provenance.v2', schema_version: '2.0.0',
    launcher: { receipt_binding: binding('launch_receipt', D.launcher, '/fixture/stage/launch-receipt.json', { size: 999, inode: 4 }), launcher_pid: 4141, live_parent_bound: true, nonce_bound: true, network_namespace_bound: true, launcher_process_sha256: D.node },
    artifact, verifier: binding('verifier', D.verifier, '/fixture/verifier.mjs', { size: 1000, inode: 5 }), helper: binding('provenance_helper', D.helper, '/fixture/browser_verifier_provenance.mjs', { size: 2000, inode: 6 }),
    node: { executable: nodeExecutable, process_identity: processIdentity(nodeExecutable, 4241) },
    playwright: { package_tree: treeBinding('playwright_package_tree', '/fixture/stage/node_modules/playwright-core', pwRows), package_version: '1.58.0', loaded_modules: [{ path: 'index.js', sha256: D.pwIndex, size_bytes: 44 }] },
    browser: { executable: browserExecutable, package_tree: treeBinding('browser_package_tree', '/fixture/browser-package', browserRows), direct_executable_binding: true, cli_version_text: 'Google Chrome 140.0.7339.0', cli_version: '140.0.7339.0', browser_type: 'chromium', playwright_runtime_version: '140.0.7339.0', cdp_product: 'Chrome/140.0.7339.0', cdp_revision: 'r1', cdp_js_version: '14.0', cdp_protocol_version: '1.3', cdp_user_agent: 'fixture', cdp_command_line: ['/proc/self/fd/9', '--enable-automation'], cdp_browser_pid: 4242, process_identity: processIdentity(browserExecutable, 4242), network_namespace: 'net:[42]', version_consistent: true, executable_unchanged_after_run: true, launch_options: { headless: true, executablePath: '/proc/self/fd/9', env: environment, args: launchArgs }, environment_keys: Object.keys(environment).sort(), environment_sha256: sha256(canonicalBytes(environment)) },
    command: commandFixture(),
    transport: { kind: 'helper_owned_defensive_copy_rehash_each_response', bind_address: '127.0.0.1', port: 43123, origin, artifact_pathname: artifactPath, artifact_url: origin + artifactPath, probe_redirect_path: '/__pm_provenance/token/redirect', probe_redirect_url: redirectUrl, probe_download_path: '/__pm_provenance/token/download', probe_download_url: downloadUrl, artifact_sha256: D.artifact, artifact_size_bytes: 128, content_encoding: null, cache_policy: 'no-store', request_ledger: transportLedger, integrity_failure: null, closed: true },
    contexts: [
      { case_id: 'case-a', probe: false, helper_created: true, attached_before_page: true, effective_context: { viewport: { width: 1280, height: 800 }, serviceWorkers: 'block', acceptDownloads: false }, effective_context_sha256: null, navigation_count: 1, blocked_count: 0, runtime_error_count: 0 },
      { case_id: 'provenance-policy-probe', probe: true, helper_created: true, attached_before_page: true, effective_context: { serviceWorkers: 'block', acceptDownloads: false }, effective_context_sha256: null, navigation_count: 1, blocked_count: 8, runtime_error_count: 0 }
    ],
    navigations: [navigation('case-a', false, 'case-a:initial', mainUrl, 1, 1, 1), navigation('provenance-policy-probe', true, 'provenance-policy-probe:bootstrap', probeUrl, 2, 2, 2)],
    observed_main_frame_navigations: [{ case_id: 'case-a', probe: false, sequence: 1, navigation_id: 'case-a:initial', url: mainUrl }, { case_id: 'provenance-policy-probe', probe: true, sequence: 2, navigation_id: 'provenance-policy-probe:bootstrap', url: probeUrl }],
    network: { requests, responses, blocked_attempts: [], unmanifested_same_origin: [], request_failures: [], http_errors: [], escape_attempts: [], policy_probe: { attempted: REQUIRED_POLICY_PROBES.length, receipts: probeReceipts }, os_egress: { evidence_class: 'independently_verified_os_process_boundary', receipt_id: 'fixture-boundary', receipt_sha256: D.network, enforcement: 'linux_network_namespace_firewall', enforced: true, loopback_allowed: true, loopback_only: true, non_loopback_egress_denied: true, network_namespace: 'net:[42]', namespace_matches_process: true, helper_enforced: false } },
    runtime_errors: { count: 0, samples: [] }, finalization: { state: 'complete', pre_close: true, browser_closed: true, transport_closed: true, failed_stage: null, failure: null }, certification_boundary: clone(BROWSER_ONLY_BOUNDARY), admission: { pass: true, failures: [], envelope_sha256: null }
  };
  for (const row of envelope.contexts) row.effective_context_sha256 = sha256(canonicalBytes(row.effective_context));
  return seal(envelope);
}
function reSealedInvalid(mutator) { const envelope = cleanEnvelope(); mutator(envelope); seal(envelope); invalidEnvelopeDenominator += 1; const failures = provenanceAdmissionFailures(envelope); assert.ok(failures.length > 0, `mutation ${invalidEnvelopeDenominator} admitted`); mustReject(() => assertProvenanceAdmission(envelope), /admission/i); }
function exactIndependentAttack(id, mutator, { reseal = true } = {}) { const envelope = cleanEnvelope(); mutator(envelope); if (reseal) seal(envelope); const failures = provenanceAdmissionFailures(envelope); assert.ok(failures.length > 0, `independent attack admitted: ${id}`); mustReject(() => assertProvenanceAdmission(envelope), /admission|finalized|schema|boundary|binding|identity|navigation|network|transport|context/i); exactIndependentAttackIds.push(id); }

await test('strict argv accepts exact pair form and produces a bound parser receipt', () => { const value = parseStrictVerifierArgs(baseArgv(), { options: strictOptions, allowSyntheticProcessIdentity: true }); assert.equal(value.unknown_args.length, 0); assert.equal(value.duplicate_args.length, 0); assert.match(value.parser_receipt_sha256, /^[0-9a-f]{64}$/); });
await test('strict argv rejects unknown, duplicate, positional, equals, missing, NUL, and malformed digest inputs', () => {
  const synthetic = options => ({ options, allowSyntheticProcessIdentity: true });
  mustReject(() => parseStrictVerifierArgs([...baseArgv(), '--unknown', 'x'], synthetic(strictOptions)), /unknown/i);
  mustReject(() => parseStrictVerifierArgs([...baseArgv(), '--file', '/other'], synthetic(strictOptions)), /duplicate/i);
  mustReject(() => parseStrictVerifierArgs([...baseArgv(), 'position'], synthetic(strictOptions)), /positional|malformed/i);
  mustReject(() => parseStrictVerifierArgs([...baseArgv(), '--file=x'], synthetic(strictOptions)), /positional|malformed/i);
  mustReject(() => parseStrictVerifierArgs(baseArgv().slice(0, -1), synthetic(strictOptions)), /missing|unsafe/i);
  const nul = baseArgv(); nul[nul.length - 1] = 'x\0y'; mustReject(() => parseStrictVerifierArgs(nul, synthetic(strictOptions)), /unsafe/i);
  const bad = baseArgv(); bad[bad.indexOf(D.artifact)] = 'A'.repeat(64); mustReject(() => parseStrictVerifierArgs(bad, synthetic(strictOptions)), /invalid/i);
});
await test('real parser mode rejects a synthetic executing identity', () => mustReject(() => parseStrictVerifierArgs(baseArgv(), strictOptions), /argv\[0\]|ENOENT|executing/i));
await test('secure path binding rejects ancestor symlink, leaf symlink, non-regular leaf, and wrong digest', () => {
  const root = mkdtempSync(join(tmpdir(), 'pm-prov-path-'));
  try { const real = join(root, 'real'); mkdirSync(real); const file = join(real, 'fixture.bin'); writeFileSync(file, 'immutable'); const digest = sha256(readFileSync(file)); const alias = join(root, 'alias'); symlinkSync(real, alias, 'dir'); mustReject(() => __test.secureReadPath('ancestor-attack', join(alias, 'fixture.bin'), digest), /ancestor symlink/i); const leaf = join(real, 'leaf-link'); symlinkSync(file, leaf, 'file'); mustReject(() => __test.secureReadPath('leaf-attack', leaf, digest), /symlink|regular/i); mustReject(() => __test.secureReadPath('directory-attack', real, digest), /regular file/i); mustReject(() => __test.secureReadPath('wrong-digest', file, '9'.repeat(64)), /mismatch/i); } finally { rmSync(root, { recursive: true, force: true }); }
});
await test('tree manifest rejects an ancestor symlink and retains exact file identity', () => {
  const root = mkdtempSync(join(tmpdir(), 'pm-prov-tree-'));
  try { const real = join(root, 'real'); mkdirSync(real); writeFileSync(join(real, 'a.js'), 'a'); const manifest = __test.treeManifest(real); assert.equal(manifest.file_count, 1); assert.equal(manifest.rows[0].sha256, sha256(Buffer.from('a'))); const alias = join(root, 'alias'); symlinkSync(real, alias, 'dir'); mustReject(() => __test.treeManifest(alias), /ancestor symlink|tree root/i); } finally { rmSync(root, { recursive: true, force: true }); }
});
await test('retained descriptor binding detects an ABA pathname swap without reading attacker bytes', () => {
  const root = mkdtempSync(join(tmpdir(), 'pm-prov-descriptor-'));
  let descriptor = null;
  try {
    const path = join(root, 'browser.bin'), originalPath = join(root, 'browser.original'), attackPath = join(root, 'browser.attack');
    writeFileSync(path, 'ORIGINAL-EXECUTABLE-BYTES'); descriptor = openSync(path, 'r');
    const stat = fstatSync(descriptor, { bigint: true }), rowStat = { device: Number(stat.dev), inode: Number(stat.ino), mode: Number(stat.mode), size_bytes: Number(stat.size), mtime_ns: String(stat.mtimeNs), ctime_ns: String(stat.ctimeNs) }, digest = sha256(Buffer.from('ORIGINAL-EXECUTABLE-BYTES'));
    const launcherRow = { label: 'fixture_descriptor', requested_path: path, absolute_path: path, sha256: digest, expected_sha256: digest, stat: rowStat, inherited_fd: descriptor };
    const bound = __test.descriptorBinding('fixture_descriptor', descriptor, launcherRow);
    renameSync(path, originalPath); writeFileSync(path, 'ATTACKER-BYTES'); assert.notEqual(sha256(readFileSync(path)), digest);
    renameSync(path, attackPath); renameSync(originalPath, path);
    assert.equal(sha256(bound.bytes), digest); assert.equal(bound.revalidate(), false); assert.equal(bound.record.post_use_sha256, digest);
  } finally { if (descriptor !== null) closeSync(descriptor); rmSync(root, { recursive: true, force: true }); }
});
await test('immutable transport owns a defensive copy and rehashes every response', async () => {
  const original = Buffer.from('<html>original</html>'), digest = sha256(original), server = await __test.startImmutableServer(original, digest);
  try { original.fill(0x78); const response = await fetch(server.artifact_url + '?case=immutable', { headers: { 'x-pm7-navigation-id': 'immutable:initial' } }); const body = Buffer.from(await response.arrayBuffer()); assert.equal(sha256(body), digest); assert.equal(response.headers.get('x-pm7-artifact-sha256'), digest); assert.notEqual(sha256(original), digest); assert.equal(server.request_ledger.length, 1); } finally { await server.close(); }
});
await test('request classifier denies intrinsic, scheme, origin, port, prefix, userinfo, traversal, and non-navigation attacks', () => {
  const transport = { origin: 'http://127.0.0.1:43123', port: 43123, artifact_pathname: `/artifact/${D.artifact}.html`, probe_redirect_path: '/probe/redirect', probe_download_path: '/probe/download' };
  const attacks = ['data:text/html,x', 'blob:http://127.0.0.1:43123/x', 'javascript:alert(1)', 'file:///etc/passwd', 'ws://127.0.0.1:43123/x', 'wss://example.invalid/x', 'http://example.invalid/x', 'https://example.invalid/x', `http://127.0.0.1.invalid:43123${transport.artifact_pathname}`, `http://127.0.0.1:43124${transport.artifact_pathname}`, `http://127.0.0.1:43123@evil.invalid${transport.artifact_pathname}`, `${transport.origin}/artifact/%2e%2e/escape`, `${transport.origin}${transport.artifact_pathname}.evil`];
  for (const url of attacks) assert.equal(classifyRequestUrl(url, transport, { requireNavigation: true, isNavigationRequest: true }).decision, 'block', url);
  assert.equal(classifyRequestUrl(`${transport.origin}${transport.artifact_pathname}?case=ok`, transport, { requireNavigation: true, isNavigationRequest: true }).decision, 'allow');
  assert.equal(classifyRequestUrl(`${transport.origin}${transport.artifact_pathname}?case=ok`, transport, { requireNavigation: true, isNavigationRequest: false }).decision, 'block');
});
await test('durable failure sink writes an exact atomic browser-only failure receipt', () => {
  const root = mkdtempSync(join(tmpdir(), 'pm-prov-failure-'));
  try { const sink = createDurableFailureSink({ outdir: root, verifier: 'selftest' }), recorded = sink.record('preparation', new Error('fixture failure')), receipt = JSON.parse(readFileSync(recorded.path, 'utf8')); assert.equal(receipt.status, 'failed'); assert.equal(receipt.stage, 'preparation'); assert.deepEqual(receipt.certification_boundary, BROWSER_ONLY_BOUNDARY); assert.equal(sha256(readFileSync(recorded.path)), recorded.receipt_sha256); } finally { rmSync(root, { recursive: true, force: true }); }
});
await test('clean deeply bound and sealed v2 envelope admits', () => assert.equal(assertProvenanceAdmission(cleanEnvelope()), true));
await test('29 re-sealed adversarial envelopes fail closed on semantics', () => {
  const mutations = [
    row => { row.extra = true; }, row => { row.artifact.sha256 = '9'.repeat(64); row.artifact.expected_sha256 = row.artifact.sha256; row.artifact.post_use_sha256 = row.artifact.sha256; }, row => { row.artifact.post_use_stat.inode += 1; }, row => { row.artifact.ancestor_symlink_count = 1; }, row => { row.verifier.leaf_symlink = true; }, row => { row.helper.unchanged = false; }, row => { row.node.process_identity.pid = 0; }, row => { row.node.process_identity.sha256 = D.browser; }, row => { row.playwright.package_tree.manifest_rows[0].sha256 = D.browser; }, row => { row.playwright.loaded_modules[0].sha256 = D.browser; }, row => { row.browser.package_tree.manifest_rows = []; }, row => { row.browser.executable.resolved_path = '/outside/chrome'; }, row => { row.browser.cdp_browser_pid += 1; }, row => { row.browser.cdp_command_line = ['/unbound/chrome']; }, row => { row.browser.version_consistent = false; }, row => { row.browser.launch_options.env.POISON = '1'; row.browser.environment_keys.push('POISON'); row.browser.environment_keys.sort(); row.browser.environment_sha256 = sha256(canonicalBytes(row.browser.launch_options.env)); }, row => { row.command.raw_argv.push('--file', '/duplicate'); }, row => { row.command.normalized_effective_config.certification_mode = false; }, row => { row.launcher.live_parent_bound = false; }, row => { row.contexts[0].helper_created = false; }, row => { row.contexts[0].effective_context.acceptDownloads = true; row.contexts[0].effective_context_sha256 = sha256(canonicalBytes(row.contexts[0].effective_context)); }, row => { row.navigations[0].body_sha256 = D.browser; }, row => { row.network.responses[0].request_sequence = 2; }, row => { row.transport.request_ledger[0].navigation_id = 'other:initial'; }, row => { row.network.policy_probe.receipts.pop(); row.network.policy_probe.attempted -= 1; }, row => { row.network.policy_probe.receipts[0].correlated = false; }, row => { row.network.os_egress.non_loopback_egress_denied = false; }, row => { row.transport.request_ledger.push({ sequence: 5, method: 'GET', host: '127.0.0.1:43123', url: '/denied', pathname: '/denied', kind: 'denied', status: 404, navigation_id: null, served_sha256: null }); }, row => { row.certification_boundary.native_slint_certified = true; }
  ];
  assert.equal(mutations.length, 29); for (const mutate of mutations) reSealedInvalid(mutate);
});
await test('all 29 exact independent-audit invalid-envelope attacks now reject', () => {
  const attacks = [
    ['missing_helper_binding', row => { delete row.helper; }],
    ['missing_schema_identity', row => { delete row.schema_id; delete row.schema_version; }],
    ['false_embedded_admission', row => { row.admission = { pass: false, failures: ['not_finalized'], envelope_sha256: null }; }, { reseal: false }],
    ['missing_embedded_admission', row => { delete row.admission; }, { reseal: false }],
    ['caller_owned_transport', row => { row.transport.kind = 'caller_owned_untrusted_server'; }],
    ['missing_transport', row => { delete row.transport; }],
    ['missing_contexts', row => { delete row.contexts; }],
    ['service_workers_allowed', row => { row.contexts[0].effective_context.serviceWorkers = 'allow'; row.contexts[0].effective_context_sha256 = sha256(canonicalBytes(row.contexts[0].effective_context)); }],
    ['downloads_allowed', row => { row.contexts[0].effective_context.acceptDownloads = true; row.contexts[0].effective_context_sha256 = sha256(canonicalBytes(row.contexts[0].effective_context)); }],
    ['missing_observed_navigation_ledger', row => { delete row.observed_main_frame_navigations; }],
    ['observed_navigation_url_mismatch', row => { row.observed_main_frame_navigations[0].url = 'https://evil.invalid/'; }],
    ['navigation_exact_url_policy_false', row => { row.navigations[0].exact_url_policy = false; }],
    ['navigation_server_header_false', row => { row.navigations[0].immutable_server_header_match = false; }],
    ['navigation_wrong_body_size', row => { row.navigations[0].body_size_bytes = 999; }],
    ['navigation_wrong_content_length', row => { row.navigations[0].content_length_header = '999'; }],
    ['navigation_external_requested_url', row => { row.navigations[0].requested_url = 'https://evil.invalid/start'; }],
    ['navigation_external_final_url', row => { row.navigations[0].final_url = 'https://evil.invalid/final'; }],
    ['duplicate_navigation_id', row => { row.navigations.push(clone(row.navigations[0])); row.contexts[0].navigation_count = 2; }],
    ['external_success_response_ledger', row => { row.network.requests.push(request(15, 'case-a', false, null, 'https://evil.invalid/', 'allow', 'exact_immutable_artifact', 'fetch')); row.network.responses.push({ sequence: 5, case_id: 'case-a', probe: false, navigation_id: null, request_sequence: 15, url: 'https://evil.invalid/', status: 200, resource_type: 'fetch', navigation: false }); }],
    ['missing_network_cleanliness_arrays', row => { row.network = { policy_probe: clone(row.network.policy_probe), os_egress: clone(row.network.os_egress) }; }],
    ['extra_unrecognized_probe_receipt', row => { row.network.policy_probe.receipts.push({ name: 'not_required', evidence_class: 'route_abort', decision: 'blocked', reason: 'invented', url: 'https://evil.invalid/', route_sequence: 3, server_sequence: null, browser_error: null, correlated: true }); }],
    ['contradictory_duplicate_probe_receipt', row => { row.network.policy_probe.receipts.push(clone(row.network.policy_probe.receipts[0])); }],
    ['pure_policy_receipts_claim_browser_correlation', row => { for (const probe of row.network.policy_probe.receipts) probe.correlation_surface = 'invented_pure_policy'; }],
    ['empty_command_identity', row => { row.command = { raw_argv: [], parsed_args: {}, normalized_effective_config: {}, unknown_args: [], duplicate_args: [] }; }],
    ['command_argv_config_disagreement', row => { row.command.raw_argv = ['--file', '/evil.html']; row.command.parsed_args = { file: '/other.html' }; row.command.normalized_effective_config = { artifact_path: '/third.html', outdir: '/fixture/out', service_workers: 'block', certification_mode: true }; }],
    ['forged_browser_version_consistency_boolean', row => { row.browser.cli_version = '1.0.0.0'; row.browser.playwright_runtime_version = '2.0.0.0'; row.browser.cdp_product = 'Chrome/3.0.0.0'; row.browser.version_consistent = true; }],
    ['browser_executable_wrapper_kind', row => { row.browser.executable.executable_kind = 'wrapper_or_unknown'; }],
    ['browser_leaf_symlink_claim', row => { row.browser.executable.leaf_symlink = true; }],
    ['file_binding_missing_real_path', row => { for (const value of [row.artifact, row.verifier, row.helper, row.node.executable, row.browser.executable]) delete value.resolved_path; }]
  ];
  assert.equal(attacks.length, 29);
  for (const [id, mutate, options] of attacks) exactIndependentAttack(id, mutate, options);
  assert.equal(exactIndependentAttackIds.length, 29);
});
await test('arbitrary malformed envelopes fail closed without validator exceptions', () => { for (const value of [null, {}, [], { schema_id: 'x' }, { ...cleanEnvelope(), network: null }, { ...cleanEnvelope(), navigations: [null] }]) { const failures = provenanceAdmissionFailures(value); assert.ok(Array.isArray(failures) && failures.length > 0); } });

const failures = results.filter(row => !row.pass);
if (typeof process.env.PM_PROVENANCE_SELFTEST_ENVELOPE === 'string' && process.env.PM_PROVENANCE_SELFTEST_ENVELOPE) writeFileSync(process.env.PM_PROVENANCE_SELFTEST_ENVELOPE, JSON.stringify(cleanEnvelope(), null, 2) + '\n');
console.log(JSON.stringify({ schema_id: 'pm.browser_verifier_provenance_selftest.v2', browser_launched: false, tests: results.length, passed: results.length - failures.length, failed: failures.length, resealed_invalid_envelope_denominator: invalidEnvelopeDenominator, exact_independent_invalid_envelope_denominator: exactIndependentAttackIds.length, exact_independent_attack_ids: exactIndependentAttackIds, required_policy_probe_denominator: REQUIRED_POLICY_PROBES.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
