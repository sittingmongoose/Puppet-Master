/* PM7 browser-concept provenance v2.
 *
 * Certifying use requires browser_verifier_provenance_launcher.py. The external
 * launcher pins and stages Node/verifier/helper/Playwright/browser/artifact
 * denominators before Node starts, retains artifact/browser descriptors, and
 * binds an independently verified loopback-only OS network receipt. This helper
 * closes browser/runtime/transport/navigation admission without claiming native
 * Slint or production certification.
 */

import { createHash, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import {
  closeSync, constants as fsConstants, fstatSync, fsyncSync, lstatSync, openSync,
  readdirSync, readlinkSync, readSync, realpathSync, renameSync,
  writeFileSync
} from 'node:fs';
import { createServer } from 'node:http';
import { isAbsolute, join, parse as parsePath, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const BROWSER_ONLY_BOUNDARY = Object.freeze({
  evidence_class: 'deterministic_browser_concept_only',
  browser_concept_exercised: true,
  native_runtime_exercised: false,
  native_slint_certified: false,
  production_runtime_certified: false,
  production_receipt: null
});

export const REQUIRED_POLICY_PROBES = Object.freeze([
  'cross_origin_http', 'cross_origin_https', 'origin_prefix_confusion', 'alternate_port',
  'redirect', 'encoded_traversal', 'userinfo_host_confusion', 'file_url', 'websocket',
  'websocket_secure', 'eventsource', 'service_worker', 'download'
]);

const SCHEMA_ID = 'pm.browser_verifier_provenance.v2';
const SCHEMA_VERSION = '2.0.0';
const LAUNCH_RECEIPT_SCHEMA = 'pm.browser_verifier_provenance.launch_receipt.v2';
const NETWORK_BOUNDARY_SCHEMA = 'pm.browser_verifier_network_boundary.v1';
const FAILURE_SCHEMA = 'pm.browser_verifier_provenance.failure.v2';
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;
const CASE_PATTERN = /^[a-z0-9_-]{1,80}$/i;
const NAVIGATION_PATTERN = /^[a-z0-9_.:-]{1,160}$/i;
const BLOCKED_FAILURE_PATTERN = /net::ERR_BLOCKED_BY_CLIENT(?:\.Inspector)?$/;
const ACTIVE_INTRINSIC_PATTERN = /^(?:data|blob|javascript|filesystem):/i;
const PROBE_CLASSES = Object.freeze({
  cross_origin_http: 'route_abort', cross_origin_https: 'route_abort',
  origin_prefix_confusion: 'route_abort', alternate_port: 'route_abort',
  redirect: 'redirect_follow_route_abort', encoded_traversal: 'route_abort',
  userinfo_host_confusion: 'browser_pre_request_rejection', file_url: 'browser_pre_request_rejection',
  websocket: 'websocket_route_close', websocket_secure: 'websocket_route_close',
  eventsource: 'route_abort', service_worker: 'service_worker_blocked', download: 'download_contained'
});
const BROWSER_LAUNCH_ARGUMENTS = Object.freeze([
  '--enable-automation', '--disable-gpu', '--disable-dev-shm-usage',
  '--disable-background-networking', '--disable-component-update',
  '--disable-domain-reliability', '--disable-sync', '--metrics-recording-only',
  '--no-first-run', '--no-default-browser-check'
]);
const ISSUED_PARSER_RECEIPTS = new WeakMap();

function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function isDigest(value) { return typeof value === 'string' && DIGEST_PATTERN.test(value); }
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
  return value;
}
function canonicalBytes(value) { return Buffer.from(JSON.stringify(canonicalize(value))); }
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
function fail(message, details = null, stage = 'provenance') {
  const error = new Error(message); error.stage = stage;
  if (details !== null) error.details = details;
  return error;
}
function exactKeys(value, keys) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort()));
}
function stableObject(value) { return Object.fromEntries(Object.entries(value || {}).sort(([a], [b]) => a.localeCompare(b))); }
function assertSafeString(value, label) {
  if (typeof value !== 'string' || value.length === 0 || value.includes('\u0000')) throw fail(`${label} must be a non-empty NUL-free string`, null, 'argv');
}

/** Strict pair-form parser with executing Node/verifier identity binding. */
export function parseStrictVerifierArgs(argv, spec) {
  if (!Array.isArray(argv) || argv.length < 2) throw new TypeError('argv must include node and verifier entries');
  const wrapped = Boolean(spec?.options);
  const optionSpec = wrapped ? spec.options : spec;
  const aliases = wrapped ? (spec.aliases || {}) : {};
  const allowSynthetic = wrapped && spec.allowSyntheticProcessIdentity === true;
  if (!optionSpec || typeof optionSpec !== 'object' || Array.isArray(optionSpec)) throw new TypeError('argument spec must be an option map');
  if (!aliases || typeof aliases !== 'object' || Array.isArray(aliases) || Object.values(aliases).some(value => typeof value !== 'string')) throw new TypeError('argument aliases must be a string map');
  assertSafeString(argv[0], 'argv[0]'); assertSafeString(argv[1], 'argv[1]');
  let verifiedNodePath = null, verifiedVerifierPath = null;
  if (!allowSynthetic) {
    const argv0Real = realpathSync(isAbsolute(argv[0]) ? argv[0] : resolve(argv[0]));
    const processReal = realpathSync(process.execPath);
    if (argv0Real !== processReal) throw fail('argv[0] does not identify the executing Node binary', { argv0: argv0Real, process: processReal }, 'argv');
    const verifierAbsolute = isAbsolute(argv[1]) ? argv[1] : resolve(process.cwd(), argv[1]);
    const verifierLeaf = lstatSync(verifierAbsolute);
    if (verifierLeaf.isSymbolicLink() || !verifierLeaf.isFile()) throw fail('argv[1] must be a non-symlink regular verifier file', { verifier: verifierAbsolute }, 'argv');
    verifiedNodePath = processReal; verifiedVerifierPath = realpathSync(verifierAbsolute);
  }
  const rawArgv = argv.slice(2), parsed = {}, spelling = {}, unknownArgs = [], duplicateArgs = [];
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (typeof token !== 'string' || !token.startsWith('--') || token.length === 2 || token.includes('=')) throw fail(`unexpected positional or malformed argument: ${String(token)}`, { raw_argv: rawArgv }, 'argv');
    const requestedKey = token.slice(2), key = Object.hasOwn(aliases, requestedKey) ? aliases[requestedKey] : requestedKey;
    if (!Object.hasOwn(optionSpec, key)) { unknownArgs.push(requestedKey); throw fail(`unknown argument: --${requestedKey}`, { unknown_args: unknownArgs }, 'argv'); }
    if (Object.hasOwn(parsed, key)) { duplicateArgs.push(key); throw fail(`duplicate argument: --${requestedKey}`, { duplicate_args: duplicateArgs }, 'argv'); }
    const value = argv[index + 1];
    if (typeof value !== 'string' || value.length === 0 || value.startsWith('--') || value.includes('\u0000')) throw fail(`missing or unsafe value for --${requestedKey}`, null, 'argv');
    const row = optionSpec[key] || {};
    if (typeof row.validate === 'function' && !row.validate(value)) throw fail(`invalid value for --${requestedKey}`, null, 'argv');
    if (Array.isArray(row.enum) && !row.enum.includes(value)) throw fail(`invalid value for --${requestedKey}`, null, 'argv');
    parsed[key] = value; spelling[key] = requestedKey; index += 1;
  }
  const missing = Object.entries(optionSpec).filter(([, row]) => row?.required).map(([key]) => key).filter(key => !Object.hasOwn(parsed, key));
  if (missing.length) throw fail(`missing required arguments: ${missing.join(',')}`, { missing }, 'argv');
  const receiptCore = {
    argv0: argv[0], argv1: argv[1], raw_argv: rawArgv, parsed_args: parsed, option_spelling: spelling,
    normalized_config: stableObject(parsed), unknown_args: unknownArgs, duplicate_args: duplicateArgs,
    cwd: process.cwd(), node_argv0: process.execPath, verifier_argv0: argv[1]
  };
  const issued = deepFreeze({ ...receiptCore, parser_receipt_sha256: sha256(canonicalBytes(receiptCore)) });
  ISSUED_PARSER_RECEIPTS.set(issued, { synthetic: allowSynthetic, verified_node_path: verifiedNodePath, verified_verifier_path: verifiedVerifierPath });
  return issued;
}

function statRecord(stat) {
  return { device: Number(stat.dev), inode: Number(stat.ino), mode: Number(stat.mode), size_bytes: Number(stat.size), mtime_ns: String(stat.mtimeNs), ctime_ns: String(stat.ctimeNs) };
}
function sameStat(left, right) { return Boolean(left && right && ['device', 'inode', 'mode', 'size_bytes', 'mtime_ns', 'ctime_ns'].every(key => left[key] === right[key])); }
function executableKind(bytes) {
  if (bytes.length >= 4 && bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) return 'elf';
  if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) return 'pe';
  if (bytes.length >= 4 && ['feedface', 'feedfacf', 'cefaedfe', 'cffaedfe', 'cafebabe'].includes(bytes.subarray(0, 4).toString('hex'))) return 'mach-o';
  return 'wrapper_or_unknown';
}
function readDescriptorBytes(fd, stat = fstatSync(fd, { bigint: true })) {
  if (!stat.isFile()) throw fail('descriptor must identify a regular file', { fd }, 'binding');
  const size = Number(stat.size), bytes = Buffer.alloc(size); let offset = 0;
  while (offset < size) { const count = readSync(fd, bytes, offset, size - offset, offset); if (count <= 0) throw fail('short descriptor read', { fd, expected: size, received: offset }, 'binding'); offset += count; }
  if (!sameStat(statRecord(stat), statRecord(fstatSync(fd, { bigint: true })))) throw fail('descriptor changed while read', { fd }, 'binding');
  return bytes;
}
function pathComponents(absolutePath) {
  const root = parsePath(absolutePath).root, pieces = absolutePath.slice(root.length).split(sep).filter(Boolean), rows = []; let current = root;
  for (const piece of pieces.slice(0, -1)) {
    current = resolve(current, piece); const row = lstatSync(current, { bigint: true });
    if (row.isSymbolicLink()) throw fail('ancestor symlink is forbidden', { path: current }, 'binding');
    if (!row.isDirectory()) throw fail('ancestor is not a directory', { path: current }, 'binding');
    rows.push({ path: current, stat: statRecord(row) });
  }
  return rows;
}
function secureReadPath(label, requestedPath, expectedSha256, { directExecutable = false } = {}) {
  assertSafeString(requestedPath, `${label} path`);
  if (expectedSha256 !== null && !isDigest(expectedSha256)) throw fail(`${label} expected SHA-256 is invalid`, null, 'binding');
  const absolutePath = isAbsolute(requestedPath) ? requestedPath : resolve(process.cwd(), requestedPath);
  const ancestorsBefore = pathComponents(absolutePath), leafBefore = lstatSync(absolutePath, { bigint: true });
  if (leafBefore.isSymbolicLink() || !leafBefore.isFile()) throw fail(`${label} must be a non-symlink regular file`, { path: absolutePath }, 'binding');
  const realBefore = realpathSync(absolutePath), fd = openSync(absolutePath, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW || 0));
  try {
    const initial = fstatSync(fd, { bigint: true });
    if (!initial.isFile()) throw fail(`${label} descriptor is not a regular file`, { path: absolutePath }, 'binding');
    const bytes = readDescriptorBytes(fd, initial), pathAfter = lstatSync(absolutePath, { bigint: true }), ancestorsAfter = pathComponents(absolutePath), realAfter = realpathSync(absolutePath);
    if (!sameStat(statRecord(initial), statRecord(pathAfter)) || !sameStat(statRecord(leafBefore), statRecord(pathAfter)) || realBefore !== realAfter || canonicalBytes(ancestorsBefore).compare(canonicalBytes(ancestorsAfter)) !== 0) throw fail(`${label} path identity changed during binding`, { path: absolutePath }, 'binding');
    const actual = sha256(bytes);
    if (expectedSha256 !== null && actual !== expectedSha256) throw fail(`${label} SHA-256 mismatch`, { expected: expectedSha256, actual }, 'binding');
    const kind = directExecutable ? executableKind(bytes) : null;
    if (directExecutable && kind === 'wrapper_or_unknown') throw fail(`${label} is not a direct executable`, { path: absolutePath }, 'binding');
    const record = {
      label, source_kind: 'secure_path', requested_path: requestedPath, resolved_path: realBefore,
      sha256: actual, expected_sha256: expectedSha256 === null ? actual : expectedSha256, executable_kind: kind, is_regular_file: true,
      leaf_symlink: false, ancestor_symlink_count: 0, ancestor_chain_sha256: sha256(canonicalBytes(ancestorsBefore)),
      initial_stat: statRecord(initial), post_use_stat: null, post_use_sha256: null, unchanged: null
    };
    return { record, bytes: Buffer.from(bytes), fd: null, revalidate: () => secureRevalidatePath(record, directExecutable) };
  } finally { closeSync(fd); }
}
function secureRevalidatePath(record, directExecutable = false) {
  const current = secureReadPath(record.label, record.resolved_path, record.sha256, { directExecutable });
  record.post_use_stat = current.record.initial_stat; record.post_use_sha256 = current.record.sha256;
  record.unchanged = sameStat(record.initial_stat, record.post_use_stat) && record.ancestor_chain_sha256 === current.record.ancestor_chain_sha256 && record.resolved_path === current.record.resolved_path;
  return record.unchanged;
}
function normalizeLauncherStat(value) {
  if (!value || typeof value !== 'object') return null;
  return { device: Number(value.device), inode: Number(value.inode), mode: Number(value.mode), size_bytes: Number(value.size_bytes), mtime_ns: String(value.mtime_ns), ctime_ns: String(value.ctime_ns) };
}
function descriptorBinding(label, fd, launcherRow, { directExecutable = false } = {}) {
  if (!Number.isInteger(fd) || fd < 3) throw fail(`${label} inherited descriptor is invalid`, { fd }, 'binding');
  const initial = fstatSync(fd, { bigint: true }), bytes = readDescriptorBytes(fd, initial), actual = sha256(bytes);
  if (!exactKeys(launcherRow, ['label', 'requested_path', 'absolute_path', 'sha256', 'expected_sha256', 'stat', 'inherited_fd']) || launcherRow.inherited_fd !== fd || launcherRow.sha256 !== actual || launcherRow.expected_sha256 !== actual || !sameStat(statRecord(initial), normalizeLauncherStat(launcherRow.stat))) throw fail(`${label} descriptor does not match launch receipt`, { fd, actual }, 'binding');
  const kind = directExecutable ? executableKind(bytes) : null;
  if (directExecutable && kind === 'wrapper_or_unknown') throw fail(`${label} descriptor is not a direct executable`, null, 'binding');
  const record = {
    label, source_kind: 'inherited_descriptor', requested_path: launcherRow.requested_path, resolved_path: launcherRow.absolute_path,
    sha256: actual, expected_sha256: launcherRow.expected_sha256, executable_kind: kind, is_regular_file: true,
    leaf_symlink: false, ancestor_symlink_count: 0,
    ancestor_chain_sha256: sha256(canonicalBytes({ launcher_secure_walk: true, absolute_path: launcherRow.absolute_path })),
    initial_stat: statRecord(initial), post_use_stat: null, post_use_sha256: null, unchanged: null
  };
  return { record, bytes: Buffer.from(bytes), fd, revalidate() {
    const currentStat = fstatSync(fd, { bigint: true }), currentBytes = readDescriptorBytes(fd, currentStat);
    record.post_use_stat = statRecord(currentStat); record.post_use_sha256 = sha256(currentBytes);
    record.unchanged = record.post_use_sha256 === record.sha256 && sameStat(record.initial_stat, record.post_use_stat);
    return record.unchanged;
  } };
}
function procExecutableBinding(label, pid, expectedBinding) {
  if (process.platform !== 'linux') throw fail('certifying process executable binding requires Linux /proc', null, 'process_identity');
  const procPath = `/proc/${pid}/exe`, fd = openSync(procPath, fsConstants.O_RDONLY);
  try {
    const stat = fstatSync(fd, { bigint: true }), bytes = readDescriptorBytes(fd, stat), actual = sha256(bytes);
    if (actual !== expectedBinding.record.sha256 || !sameStat(statRecord(stat), expectedBinding.record.initial_stat)) throw fail(`${label} process executable differs from pinned descriptor`, { pid, actual }, 'process_identity');
    return { pid, proc_exe_path: readlinkSync(procPath), sha256: actual, stat: statRecord(stat), matches_pinned_descriptor: true };
  } finally { closeSync(fd); }
}
function treeRows(root) {
  const absoluteRoot = resolve(root); pathComponents(join(absoluteRoot, '__leaf__'));
  const rootStat = lstatSync(absoluteRoot, { bigint: true });
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw fail('tree root must be a non-symlink directory', { root: absoluteRoot }, 'tree');
  const rows = [];
  function visit(directory, relativeDirectory = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = join(directory, entry.name), relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name, entryStat = lstatSync(absolute, { bigint: true });
      if (entryStat.isSymbolicLink()) throw fail('tree contains symlink', { path: absolute }, 'tree');
      if (entryStat.isDirectory()) { rows.push({ path: relativePath, kind: 'directory', mode: Number(entryStat.mode) }); visit(absolute, relativePath); }
      else if (entryStat.isFile()) {
        const bound = secureReadPath(`tree:${relativePath}`, absolute, null);
        rows.push({ path: relativePath, kind: 'file', mode: Number(entryStat.mode), size_bytes: bound.bytes.length, sha256: bound.record.sha256 });
      } else throw fail('tree contains non-regular entry', { path: absolute }, 'tree');
    }
  }
  visit(absoluteRoot); return rows;
}
function treeManifest(root) {
  const rows = treeRows(root), digestRows = rows.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'mode'))), core = { schema_id: 'pm.browser_verifier_tree_manifest.v1', rows: digestRows, file_count: rows.filter(row => row.kind === 'file').length, directory_count: rows.filter(row => row.kind === 'directory').length };
  return { schema_id: core.schema_id, rows, file_count: core.file_count, directory_count: core.directory_count, root: resolve(root), manifest_sha256: sha256(canonicalBytes(core)) };
}
function treeBinding(label, root, expectedManifest, expectedFileCount) {
  if (!isDigest(expectedManifest)) throw fail(`${label} manifest digest is invalid`, null, 'tree');
  const initial = treeManifest(root);
  if (initial.manifest_sha256 !== expectedManifest || initial.file_count !== expectedFileCount) throw fail(`${label} manifest mismatch`, { expectedManifest, actual: initial.manifest_sha256 }, 'tree');
  const record = {
    label, root: resolve(root), manifest_schema_id: initial.schema_id, manifest_rows: initial.rows,
    manifest_sha256: initial.manifest_sha256, expected_manifest_sha256: expectedManifest,
    file_count: initial.file_count, directory_count: initial.directory_count,
    post_use_manifest_sha256: null, post_use_file_count: null, post_use_directory_count: null, unchanged: null
  };
  return { record, initial, revalidate() {
    const current = treeManifest(record.root); record.post_use_manifest_sha256 = current.manifest_sha256; record.post_use_file_count = current.file_count; record.post_use_directory_count = current.directory_count;
    record.unchanged = current.manifest_sha256 === record.manifest_sha256 && current.file_count === record.file_count && current.directory_count === record.directory_count; return record.unchanged;
  } };
}
function readJsonBinding(label, path, expectedSha256) {
  const binding = secureReadPath(label, path, expectedSha256);
  try { return { ...binding, value: JSON.parse(binding.bytes.toString('utf8')) }; }
  catch (error) { throw fail(`${label} is not valid JSON`, { error: String(error) }, 'binding'); }
}

function launcherFileRowClean(row, inherited = false) {
  const keys = ['label', 'requested_path', 'absolute_path', 'sha256', 'expected_sha256', 'stat', ...(inherited ? ['inherited_fd'] : [])];
  return Boolean(exactKeys(row, keys) && typeof row.label === 'string' && row.label.length > 0 && typeof row.requested_path === 'string' && row.requested_path.length > 0 && typeof row.absolute_path === 'string' && isAbsolute(row.absolute_path) && isDigest(row.sha256) && row.sha256 === row.expected_sha256 && statClean(row.stat) && (!inherited || (Number.isInteger(row.inherited_fd) && row.inherited_fd >= 3)));
}
function relativeContained(root, candidate) {
  const value = relative(resolve(root), resolve(candidate));
  return value === '' || (value !== '..' && !value.startsWith(`..${sep}`) && !isAbsolute(value));
}

function validateLaunchReceipt(receipt, receiptPath) {
  const topKeys = ['schema_id', 'schema_version', 'created_at_utc', 'nonce', 'launcher_pid', 'launcher_command', 'launcher', 'stage', 'inputs', 'network_boundary'];
  if (!exactKeys(receipt, topKeys) || receipt.schema_id !== LAUNCH_RECEIPT_SCHEMA || receipt.schema_version !== SCHEMA_VERSION || typeof receipt.created_at_utc !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(receipt.created_at_utc) || typeof receipt.nonce !== 'string' || !/^[0-9a-f]{64}$/.test(receipt.nonce) || !Number.isInteger(receipt.launcher_pid) || receipt.launcher_pid <= 0) throw fail('launch receipt top-level contract mismatch', { receiptPath }, 'launch_receipt');
  if (process.env.PM_PROVENANCE_LAUNCHED !== '1' || process.env.PM_PROVENANCE_NONCE !== receipt.nonce || resolve(process.env.PM_PROVENANCE_LAUNCH_RECEIPT || '') !== resolve(receiptPath) || process.ppid !== receipt.launcher_pid) throw fail('launch receipt is not bound to this live launcher parent', { parent: process.ppid }, 'launch_receipt');
  if (!exactKeys(receipt.launcher_command, ['cwd', 'raw_argv', 'raw_argv_sha256', 'verifier_extra_args']) || typeof receipt.launcher_command.cwd !== 'string' || !isAbsolute(receipt.launcher_command.cwd) || !Array.isArray(receipt.launcher_command.raw_argv) || receipt.launcher_command.raw_argv.some(value => typeof value !== 'string' || value.includes('\u0000')) || !Array.isArray(receipt.launcher_command.verifier_extra_args) || receipt.launcher_command.verifier_extra_args.length % 2 !== 0 || sha256(canonicalBytes(receipt.launcher_command.raw_argv)) !== receipt.launcher_command.raw_argv_sha256) throw fail('launcher command receipt mismatch', null, 'launch_receipt');
  if (!exactKeys(receipt.launcher, ['source', 'python', 'running_process']) || !launcherFileRowClean(receipt.launcher.source) || !launcherFileRowClean(receipt.launcher.python) || !exactKeys(receipt.launcher.running_process, ['proc_exe_path', 'sha256', 'stat']) || typeof receipt.launcher.running_process.proc_exe_path !== 'string' || !isDigest(receipt.launcher.running_process.sha256) || !statClean(receipt.launcher.running_process.stat) || receipt.launcher.running_process.sha256 !== receipt.launcher.python.sha256) throw fail('launcher trust-root contract mismatch', null, 'launch_receipt');
  if (!exactKeys(receipt.stage, ['root', 'verifier_path', 'helper_path', 'modules_path', 'playwright_package_path', 'playwright_manifest_sha256', 'playwright_file_count']) || !['root', 'verifier_path', 'helper_path', 'modules_path', 'playwright_package_path'].every(key => typeof receipt.stage[key] === 'string' && isAbsolute(receipt.stage[key])) || !['verifier_path', 'helper_path', 'modules_path', 'playwright_package_path'].every(key => relativeContained(receipt.stage.root, receipt.stage[key])) || !isDigest(receipt.stage.playwright_manifest_sha256) || !Number.isInteger(receipt.stage.playwright_file_count) || receipt.stage.playwright_file_count < 1) throw fail('launch stage contract mismatch', null, 'launch_receipt');
  if (!exactKeys(receipt.inputs, ['artifact', 'browser', 'node', 'verifier', 'helper', 'playwright', 'browser_package'])) throw fail('launch input contract mismatch', null, 'launch_receipt');
  if (!launcherFileRowClean(receipt.inputs.artifact, true) || !launcherFileRowClean(receipt.inputs.browser, true) || !launcherFileRowClean(receipt.inputs.node, true) || !launcherFileRowClean(receipt.inputs.verifier) || !launcherFileRowClean(receipt.inputs.helper) || !exactKeys(receipt.inputs.playwright, ['requested_path', 'manifest_sha256', 'file_count']) || typeof receipt.inputs.playwright.requested_path !== 'string' || !isDigest(receipt.inputs.playwright.manifest_sha256) || !Number.isInteger(receipt.inputs.playwright.file_count) || receipt.inputs.playwright.file_count < 1 || !exactKeys(receipt.inputs.browser_package, ['requested_path', 'manifest_sha256', 'file_count']) || typeof receipt.inputs.browser_package.requested_path !== 'string' || !isDigest(receipt.inputs.browser_package.manifest_sha256) || !Number.isInteger(receipt.inputs.browser_package.file_count) || receipt.inputs.browser_package.file_count < 1 || receipt.stage.playwright_manifest_sha256 !== receipt.inputs.playwright.manifest_sha256 || receipt.stage.playwright_file_count !== receipt.inputs.playwright.file_count) throw fail('launch input rows are malformed', null, 'launch_receipt');
  if (!exactKeys(receipt.network_boundary, ['binding', 'receipt']) || !launcherFileRowClean(receipt.network_boundary.binding)) throw fail('network boundary launch contract mismatch', null, 'launch_receipt');
  const network = receipt.network_boundary.receipt;
  if (!exactKeys(network, ['schema_id', 'schema_version', 'receipt_id', 'evidence_class', 'enforcement', 'enforced', 'loopback_allowed', 'loopback_only', 'non_loopback_egress_denied', 'network_namespace', 'issuer']) || network.schema_id !== NETWORK_BOUNDARY_SCHEMA || network.schema_version !== '1.0.0' || typeof network.receipt_id !== 'string' || !network.receipt_id || network.evidence_class !== 'independently_verified_os_process_boundary' || !['linux_network_namespace_firewall', 'host_firewall_process_policy'].includes(network.enforcement) || network.enforced !== true || network.loopback_allowed !== true || network.loopback_only !== true || network.non_loopback_egress_denied !== true || typeof network.network_namespace !== 'string' || typeof network.issuer !== 'string' || !network.issuer) throw fail('network boundary receipt is not certifying', null, 'network_boundary');
  if (process.platform !== 'linux' || readlinkSync('/proc/self/ns/net') !== network.network_namespace || readlinkSync(`/proc/${process.ppid}/ns/net`) !== network.network_namespace) throw fail('network namespace does not match independently verified receipt', null, 'network_boundary');
  return true;
}
function normalizeVersion(value) { const match = String(value || '').match(/(?:Chrome\/|Chromium\/)?(\d+\.\d+\.\d+\.\d+)/); return match ? match[1] : null; }
function sanitizedBrowserEnvironment() {
  const allowed = ['PATH', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR', 'HOME'], environment = Object.fromEntries(allowed.filter(key => typeof process.env[key] === 'string').map(key => [key, process.env[key]]));
  return environment;
}
function runtimeErrorRecord(kind, caseId, value) {
  const full = String(value?.stack || value?.message || value);
  return { kind, case_id: caseId, sha256: sha256(Buffer.from(full)), length: full.length, preview: full.slice(0, 600) };
}
function classifier(rawUrl, transport, options = {}) {
  if (rawUrl === 'about:blank') return options.allowInitialAboutBlank === true ? { decision: 'allow', reason: 'bounded_initial_about_blank' } : { decision: 'block', reason: 'unmanifested_intrinsic_document' };
  if (ACTIVE_INTRINSIC_PATTERN.test(rawUrl)) return { decision: 'block', reason: 'unmanifested_active_intrinsic_resource' };
  let candidate; try { candidate = new URL(rawUrl); } catch { return { decision: 'block', reason: 'invalid_url' }; }
  if (!['http:', 'https:'].includes(candidate.protocol)) return { decision: 'block', reason: 'scheme_not_allowed' };
  if (candidate.username || candidate.password) return { decision: 'block', reason: 'userinfo_not_allowed' };
  if (options.probe && candidate.origin === transport.origin && [transport.probe_redirect_path, transport.probe_download_path].includes(candidate.pathname) && candidate.search === '') return { decision: 'allow', reason: 'bounded_probe_endpoint' };
  if (candidate.origin !== transport.origin) return { decision: 'block', reason: 'origin_mismatch' };
  if (candidate.pathname !== transport.artifact_pathname) return { decision: 'block', reason: 'unmanifested_same_origin_path' };
  const entries = [...candidate.searchParams.entries()];
  if (entries.length > 1 || (entries.length === 1 && (entries[0][0] !== 'case' || !CASE_PATTERN.test(entries[0][1])))) return { decision: 'block', reason: 'query_not_allowed' };
  if (options.requireNavigation && !options.isNavigationRequest) return { decision: 'block', reason: 'artifact_path_non_navigation' };
  return { decision: 'allow', reason: 'exact_immutable_artifact' };
}
export function classifyRequestUrl(rawUrl, transport, options = {}) { return classifier(rawUrl, transport, options); }

async function startImmutableServer(inputBytes, artifactSha256) {
  const privateBytes = Buffer.from(inputBytes);
  if (sha256(privateBytes) !== artifactSha256) throw fail('transport input digest mismatch', null, 'transport');
  const token = randomBytes(24).toString('hex'), requestLedger = []; let origin = null, closed = false, integrityFailure = null;
  const artifactPathname = `/artifact/${artifactSha256}.html`, probeRedirectPath = `/__pm_provenance/${token}/redirect`, probeDownloadPath = `/__pm_provenance/${token}/download`;
  const server = createServer((request, response) => {
    const sequence = requestLedger.length + 1; let parsed;
    try { parsed = new URL(request.url || '/', origin || 'http://127.0.0.1'); } catch { parsed = null; }
    const method = request.method || '', navigationId = String(request.headers['x-pm7-navigation-id'] || ''), host = String(request.headers.host || '');
    const entry = { sequence, method, host, url: request.url || null, pathname: parsed?.pathname || null, kind: 'denied', status: 404, navigation_id: navigationId || null, served_sha256: null };
    const currentHash = sha256(privateBytes);
    if (currentHash !== artifactSha256) {
      integrityFailure = { expected: artifactSha256, actual: currentHash, sequence }; entry.kind = 'integrity_failure'; entry.status = 500; requestLedger.push(entry);
      response.writeHead(500, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }); response.end('integrity failure'); return;
    }
    const expectedHost = origin ? new URL(origin).host : null;
    if (host === expectedHost && parsed?.pathname === probeRedirectPath && parsed.search === '' && method === 'GET') {
      entry.kind = 'probe_redirect'; entry.status = 302; requestLedger.push(entry);
      response.writeHead(302, { Location: 'https://example.invalid/pm7-provenance-redirect-target', 'Cache-Control': 'no-store' }); response.end(); return;
    }
    if (host === expectedHost && parsed?.pathname === probeDownloadPath && parsed.search === '' && method === 'GET') {
      const payload = Buffer.from('pm7-provenance-download-probe\n'); entry.kind = 'probe_download'; entry.status = 200; entry.served_sha256 = sha256(payload); requestLedger.push(entry);
      response.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': String(payload.length), 'Content-Disposition': 'attachment; filename="pm7-probe.bin"', 'Cache-Control': 'no-store' }); response.end(payload); return;
    }
    const query = parsed ? [...parsed.searchParams.entries()] : [];
    const allowedArtifact = Boolean(parsed && host === expectedHost && method === 'GET' && parsed.pathname === artifactPathname && (query.length === 0 || (query.length === 1 && query[0][0] === 'case' && CASE_PATTERN.test(query[0][1]))) && NAVIGATION_PATTERN.test(navigationId));
    if (!allowedArtifact) { requestLedger.push(entry); response.writeHead(404, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }); response.end('not found'); return; }
    const responseBytes = Buffer.from(privateBytes), servedHash = sha256(responseBytes);
    if (servedHash !== artifactSha256) { integrityFailure = { expected: artifactSha256, actual: servedHash, sequence }; entry.kind = 'integrity_failure'; entry.status = 500; requestLedger.push(entry); response.writeHead(500); response.end(); return; }
    entry.kind = 'artifact'; entry.status = 200; entry.served_sha256 = servedHash; requestLedger.push(entry);
    response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': String(responseBytes.length), 'Cache-Control': 'no-store', 'X-PM7-Artifact-SHA256': artifactSha256, 'X-PM7-Navigation-ID': navigationId }); response.end(responseBytes);
  });
  await new Promise((resolveListen, rejectListen) => { server.once('error', rejectListen); server.listen(0, '127.0.0.1', resolveListen); });
  const address = server.address(); if (!address || typeof address === 'string') throw fail('immutable artifact server did not bind an IP port', null, 'transport');
  origin = `http://127.0.0.1:${address.port}`;
  return {
    origin, port: address.port, artifact_pathname: artifactPathname, artifact_url: origin + artifactPathname,
    probe_redirect_path: probeRedirectPath, probe_download_path: probeDownloadPath,
    probe_redirect_url: origin + probeRedirectPath, probe_download_url: origin + probeDownloadPath,
    request_ledger: requestLedger, privateBytesCopy: () => Buffer.from(privateBytes), integrityFailure: () => integrityFailure, isClosed: () => closed,
    async close() { if (closed) return; await new Promise((ok, bad) => server.close(error => error ? bad(error) : ok())); closed = true; }
  };
}

function safeReceiptPath(outdir, filename) {
  const directory = resolve(outdir); pathComponents(join(directory, '__leaf__')); const directoryStat = lstatSync(directory);
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) throw fail('failure outdir must be a non-symlink directory', { directory }, 'failure_sink');
  if (!/^[a-z0-9_.-]+\.json$/i.test(filename)) throw fail('failure receipt filename is not bounded', { filename }, 'failure_sink');
  return join(directory, filename);
}
function validateBoundRecordVideo(value, outdir) {
  if (!exactKeys(value, Object.hasOwn(value || {}, 'size') ? ['dir', 'size'] : ['dir']) || typeof value.dir !== 'string' || !isAbsolute(value.dir)) throw fail('recordVideo must use an exact absolute dir and optional size', null, 'context');
  const outputRoot = realpathSync(resolve(outdir)), videoDirectory = realpathSync(resolve(value.dir));
  const containment = relative(outputRoot, videoDirectory);
  if (containment === '..' || containment.startsWith(`..${sep}`) || isAbsolute(containment)) throw fail('recordVideo dir escapes the strict output directory', { outputRoot, videoDirectory }, 'context');
  pathComponents(join(videoDirectory, '__leaf__'));
  const directoryStat = lstatSync(videoDirectory, { bigint: true });
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) throw fail('recordVideo dir must be an existing non-symlink directory', { videoDirectory }, 'context');
  if (Object.hasOwn(value, 'size')) {
    if (!exactKeys(value.size, ['width', 'height']) || !Number.isInteger(value.size.width) || !Number.isInteger(value.size.height) || value.size.width < 1 || value.size.height < 1 || value.size.width > 8192 || value.size.height > 8192) throw fail('recordVideo size is outside the bounded integer contract', { size: value.size }, 'context');
  }
  return true;
}
function atomicWriteJson(path, value) {
  const temporary = `${path}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`, payload = JSON.stringify(canonicalize(value), null, 2) + '\n';
  const fd = openSync(temporary, fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL | (fsConstants.O_NOFOLLOW || 0), 0o600);
  try { writeFileSync(fd, payload); fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(temporary, path); return sha256(Buffer.from(payload));
}
export function createDurableFailureSink({ outdir, verifier = 'unknown', filename = 'browser-verifier-provenance-failure.json' } = {}) {
  const path = safeReceiptPath(outdir, filename); let last = null;
  return { path, record(stage, error, envelope = null) {
    const full = String(error?.stack || error?.message || error), receipt = {
      schema_id: FAILURE_SCHEMA, schema_version: SCHEMA_VERSION, status: 'failed', stage: String(stage || error?.stage || 'unknown'), verifier,
      error: { type: error?.constructor?.name || 'Error', sha256: sha256(Buffer.from(full)), preview: full.slice(0, 1200), details: error?.details || null },
      provenance: envelope ? canonicalize(envelope) : null, certification_boundary: { ...BROWSER_ONLY_BOUNDARY }
    };
    last = { path, receipt_sha256: atomicWriteJson(path, receipt), receipt }; return last;
  }, get last() { return last; } };
}

function fileBindingClean(binding) {
  return Boolean(binding && exactKeys(binding, ['label', 'source_kind', 'requested_path', 'resolved_path', 'sha256', 'expected_sha256', 'executable_kind', 'is_regular_file', 'leaf_symlink', 'ancestor_symlink_count', 'ancestor_chain_sha256', 'initial_stat', 'post_use_stat', 'post_use_sha256', 'unchanged']) && typeof binding.label === 'string' && binding.label.length > 0 && ['secure_path', 'inherited_descriptor'].includes(binding.source_kind) && typeof binding.requested_path === 'string' && binding.requested_path.length > 0 && typeof binding.resolved_path === 'string' && isAbsolute(binding.resolved_path) && [null, 'elf', 'pe', 'mach-o'].includes(binding.executable_kind) && isDigest(binding.sha256) && binding.sha256 === binding.expected_sha256 && binding.post_use_sha256 === binding.sha256 && binding.is_regular_file === true && binding.leaf_symlink === false && binding.ancestor_symlink_count === 0 && isDigest(binding.ancestor_chain_sha256) && statClean(binding.initial_stat) && statClean(binding.post_use_stat) && binding.unchanged === true && sameStat(binding.initial_stat, binding.post_use_stat));
}
function statClean(value) {
  return Boolean(value && exactKeys(value, ['device', 'inode', 'mode', 'size_bytes', 'mtime_ns', 'ctime_ns']) && ['device', 'inode', 'mode', 'size_bytes'].every(key => Number.isSafeInteger(value[key]) && value[key] >= 0) && typeof value.mtime_ns === 'string' && /^\d+$/.test(value.mtime_ns) && typeof value.ctime_ns === 'string' && /^\d+$/.test(value.ctime_ns));
}
function processIdentityClean(value, executable) {
  return Boolean(value && exactKeys(value, ['pid', 'proc_exe_path', 'sha256', 'stat', 'matches_pinned_descriptor']) && Number.isInteger(value.pid) && value.pid > 0 && typeof value.proc_exe_path === 'string' && value.proc_exe_path.length > 0 && isDigest(value.sha256) && value.sha256 === executable?.sha256 && statClean(value.stat) && sameStat(value.stat, executable?.initial_stat) && value.matches_pinned_descriptor === true);
}
function jsonValueClean(value, depth = 0) {
  if (depth > 12) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 10000 && value.every(child => jsonValueClean(child, depth + 1));
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return false;
  const keys = Object.keys(value); return keys.length <= 10000 && keys.every(key => key.length > 0 && key !== '__proto__' && key !== 'prototype' && key !== 'constructor' && jsonValueClean(value[key], depth + 1));
}
function contextConfigClean(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const allowed = new Set(['viewport', 'deviceScaleFactor', 'locale', 'timezoneId', 'colorScheme', 'reducedMotion', 'serviceWorkers', 'acceptDownloads', 'recordVideo']);
  if (Object.keys(value).some(key => !allowed.has(key)) || value.serviceWorkers !== 'block' || value.acceptDownloads !== false) return false;
  if (Object.hasOwn(value, 'viewport') && (!exactKeys(value.viewport, ['width', 'height']) || !Number.isInteger(value.viewport.width) || !Number.isInteger(value.viewport.height) || value.viewport.width < 1 || value.viewport.height < 1 || value.viewport.width > 16384 || value.viewport.height > 16384)) return false;
  if (Object.hasOwn(value, 'deviceScaleFactor') && (!Number.isFinite(value.deviceScaleFactor) || value.deviceScaleFactor <= 0 || value.deviceScaleFactor > 8)) return false;
  if (Object.hasOwn(value, 'locale') && (typeof value.locale !== 'string' || value.locale.length < 2 || value.locale.length > 80)) return false;
  if (Object.hasOwn(value, 'timezoneId') && (typeof value.timezoneId !== 'string' || value.timezoneId.length < 1 || value.timezoneId.length > 120)) return false;
  if (Object.hasOwn(value, 'colorScheme') && !['light', 'dark', 'no-preference'].includes(value.colorScheme)) return false;
  if (Object.hasOwn(value, 'reducedMotion') && !['reduce', 'no-preference'].includes(value.reducedMotion)) return false;
  if (Object.hasOwn(value, 'recordVideo') && (!value.recordVideo || !Object.hasOwn(value.recordVideo, 'dir') || !isAbsolute(value.recordVideo.dir) || !exactKeys(value.recordVideo, Object.hasOwn(value.recordVideo, 'size') ? ['dir', 'size'] : ['dir']) || (Object.hasOwn(value.recordVideo, 'size') && (!exactKeys(value.recordVideo.size, ['width', 'height']) || !Number.isInteger(value.recordVideo.size.width) || !Number.isInteger(value.recordVideo.size.height) || value.recordVideo.size.width < 1 || value.recordVideo.size.height < 1 || value.recordVideo.size.width > 8192 || value.recordVideo.size.height > 8192)))) return false;
  return jsonValueClean(value);
}
function contiguousUniqueSequences(rows) {
  return Array.isArray(rows) && rows.every((row, index) => Number.isInteger(row?.sequence) && row.sequence === index + 1);
}
function treeBindingClean(binding) {
  if (!binding || !exactKeys(binding, ['label', 'root', 'manifest_schema_id', 'manifest_rows', 'manifest_sha256', 'expected_manifest_sha256', 'file_count', 'directory_count', 'post_use_manifest_sha256', 'post_use_file_count', 'post_use_directory_count', 'unchanged'])) return false;
  if (binding.manifest_schema_id !== 'pm.browser_verifier_tree_manifest.v1' || typeof binding.label !== 'string' || !isAbsolute(binding.root) || !Array.isArray(binding.manifest_rows) || !Number.isInteger(binding.file_count) || binding.file_count < 1 || !Number.isInteger(binding.directory_count) || binding.directory_count < 0) return false;
  const paths = new Set(); let files = 0, directories = 0;
  for (const row of binding.manifest_rows) {
    if (!row || typeof row.path !== 'string' || !row.path || row.path.startsWith('/') || row.path.split('/').some(part => !part || part === '.' || part === '..') || paths.has(row.path)) return false;
    paths.add(row.path);
    if (row.kind === 'file') {
      if (!exactKeys(row, ['path', 'kind', 'mode', 'size_bytes', 'sha256']) || !Number.isInteger(row.mode) || !Number.isInteger(row.size_bytes) || row.size_bytes < 0 || !isDigest(row.sha256)) return false;
      files += 1;
    } else if (row.kind === 'directory') {
      if (!exactKeys(row, ['path', 'kind', 'mode']) || !Number.isInteger(row.mode)) return false;
      directories += 1;
    } else return false;
  }
  const digestRows = binding.manifest_rows.map(row => Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'mode')));
  const core = { schema_id: binding.manifest_schema_id, rows: digestRows, file_count: binding.file_count, directory_count: binding.directory_count };
  return Boolean(files === binding.file_count && directories === binding.directory_count && isDigest(binding.manifest_sha256) && binding.manifest_sha256 === sha256(canonicalBytes(core)) && binding.manifest_sha256 === binding.expected_manifest_sha256 && binding.post_use_manifest_sha256 === binding.manifest_sha256 && binding.post_use_file_count === binding.file_count && binding.post_use_directory_count === binding.directory_count && binding.unchanged === true);
}
function boundaryExact(value) { return exactKeys(value, Object.keys(BROWSER_ONLY_BOUNDARY)) && Object.entries(BROWSER_ONLY_BOUNDARY).every(([key, expected]) => value[key] === expected); }
function commandClean(command) {
  if (!exactKeys(command, ['argv0', 'argv1', 'raw_argv', 'parsed_args', 'option_spelling', 'normalized_effective_config', 'unknown_args', 'duplicate_args', 'cwd', 'node_argv0', 'verifier_argv0', 'parser_receipt_sha256'])) return false;
  if (!Array.isArray(command.raw_argv) || command.raw_argv.length === 0 || command.raw_argv.length % 2 !== 0 || !command.parsed_args || !command.option_spelling || !command.normalized_effective_config || command.unknown_args.length || command.duplicate_args.length) return false;
  const reconstructed = {};
  for (let index = 0; index < command.raw_argv.length; index += 2) {
    const token = command.raw_argv[index], value = command.raw_argv[index + 1];
    if (typeof token !== 'string' || !token.startsWith('--') || token.includes('=') || typeof value !== 'string' || value.startsWith('--')) return false;
    const spelling = token.slice(2), entry = Object.entries(command.option_spelling).find(([, observed]) => observed === spelling);
    if (!entry || Object.hasOwn(reconstructed, entry[0]) || command.parsed_args[entry[0]] !== value) return false;
    reconstructed[entry[0]] = value;
  }
  if (canonicalBytes(stableObject(reconstructed)).compare(canonicalBytes(stableObject(command.parsed_args))) !== 0) return false;
  const parserCore = { argv0: command.argv0, argv1: command.argv1, raw_argv: command.raw_argv, parsed_args: command.parsed_args, option_spelling: command.option_spelling, normalized_config: stableObject(command.parsed_args), unknown_args: command.unknown_args, duplicate_args: command.duplicate_args, cwd: command.cwd, node_argv0: command.node_argv0, verifier_argv0: command.verifier_argv0 };
  return sha256(canonicalBytes(parserCore)) === command.parser_receipt_sha256;
}
function exactJoinFailures(envelope) {
  const failures = [], navigations = envelope.navigations, ids = navigations.map(row => row?.navigation_id);
  if (!Array.isArray(envelope?.network?.requests) || !Array.isArray(envelope?.network?.responses) || !Array.isArray(envelope?.transport?.request_ledger) || !Array.isArray(envelope?.observed_main_frame_navigations)) return ['navigation_join_dependencies'];
  if (new Set(ids).size !== ids.length) failures.push('duplicate_navigation_id');
  for (const nav of navigations) {
    if (!exactKeys(nav, ['case_id', 'probe', 'navigation_id', 'requested_url', 'request_url', 'final_url', 'main_frame', 'status', 'redirect_chain', 'content_type', 'content_encoding', 'content_length_header', 'body_size_bytes', 'body_sha256', 'expected_artifact_sha256', 'hash_match', 'exact_url_policy', 'immutable_server_header_match', 'network_request_sequence', 'network_response_sequence', 'server_request_sequence']) || !CASE_PATTERN.test(nav.case_id) || typeof nav.probe !== 'boolean' || !NAVIGATION_PATTERN.test(nav.navigation_id) || ![nav.requested_url, nav.request_url, nav.final_url].every(value => typeof value === 'string') || !Array.isArray(nav.redirect_chain) || !Number.isInteger(nav.body_size_bytes) || ![nav.network_request_sequence, nav.network_response_sequence, nav.server_request_sequence].every(Number.isInteger)) { failures.push(`navigation_shape:${nav?.navigation_id || 'unknown'}`); continue; }
    const requestRows = envelope.network.requests.filter(row => row.navigation_id === nav.navigation_id && row.decision === 'allow'), responseRows = envelope.network.responses.filter(row => row.navigation_id === nav.navigation_id), serverRows = envelope.transport.request_ledger.filter(row => row.navigation_id === nav.navigation_id && row.kind === 'artifact'), observedRows = envelope.observed_main_frame_navigations.filter(row => row.navigation_id === nav.navigation_id);
    if (requestRows.length !== 1 || responseRows.length !== 1 || serverRows.length !== 1 || observedRows.length !== 1) { failures.push(`navigation_cardinality:${nav.navigation_id}`); continue; }
    const request = requestRows[0], response = responseRows[0], server = serverRows[0], observed = observedRows[0], serverUrl = envelope.transport.origin + server.url;
    if (nav.case_id !== request.case_id || nav.case_id !== response.case_id || nav.case_id !== observed.case_id || nav.probe !== request.probe || nav.probe !== response.probe || nav.probe !== observed.probe || nav.requested_url !== nav.request_url || nav.request_url !== nav.final_url || nav.final_url !== request.url || nav.final_url !== response.url || nav.final_url !== observed.url || nav.final_url !== serverUrl || nav.network_request_sequence !== request.sequence || nav.network_response_sequence !== response.sequence || nav.server_request_sequence !== server.sequence || response.request_sequence !== request.sequence || nav.main_frame !== true || nav.status !== 200 || response.status !== 200 || request.navigation !== true || response.navigation !== true || nav.redirect_chain.length !== 0 || nav.content_type !== 'text/html' || nav.content_encoding !== null || nav.body_sha256 !== envelope.artifact.sha256 || nav.expected_artifact_sha256 !== envelope.artifact.sha256 || nav.hash_match !== true || nav.exact_url_policy !== true || nav.immutable_server_header_match !== true || nav.body_size_bytes !== envelope.transport.artifact_size_bytes || nav.content_length_header !== String(envelope.transport.artifact_size_bytes) || server.served_sha256 !== envelope.artifact.sha256) failures.push(`navigation_join:${nav.navigation_id}`);
  }
  return failures;
}
function requestRowClean(row) {
  return Boolean(row && exactKeys(row, ['sequence', 'case_id', 'probe', 'navigation_id', 'decision', 'reason', 'method', 'url', 'resource_type', 'navigation', 'abort_error', 'observed_failure_error', 'correlated']) && Number.isInteger(row.sequence) && CASE_PATTERN.test(row.case_id) && typeof row.probe === 'boolean' && (row.navigation_id === null || NAVIGATION_PATTERN.test(row.navigation_id)) && ['allow', 'block', 'blocked'].includes(row.decision) && typeof row.reason === 'string' && row.reason.length > 0 && typeof row.method === 'string' && row.method.length > 0 && typeof row.url === 'string' && row.url.length > 0 && typeof row.resource_type === 'string' && typeof row.navigation === 'boolean' && (row.abort_error === null || row.abort_error === 'blockedbyclient') && (row.observed_failure_error === null || typeof row.observed_failure_error === 'string') && typeof row.correlated === 'boolean' && (row.decision === 'allow' ? row.abort_error === null : row.abort_error === 'blockedbyclient'));
}
function responseRowClean(row) {
  return Boolean(row && exactKeys(row, ['sequence', 'case_id', 'probe', 'navigation_id', 'request_sequence', 'url', 'status', 'resource_type', 'navigation']) && Number.isInteger(row.sequence) && CASE_PATTERN.test(row.case_id) && typeof row.probe === 'boolean' && (row.navigation_id === null || NAVIGATION_PATTERN.test(row.navigation_id)) && Number.isInteger(row.request_sequence) && typeof row.url === 'string' && Number.isInteger(row.status) && row.status >= 100 && row.status <= 599 && typeof row.resource_type === 'string' && typeof row.navigation === 'boolean');
}
function networkPolicyLedgerClean(network, transport) {
  if (!transport || typeof transport.origin !== 'string') return false;
  for (const row of network.requests) {
    if (row.resource_type === 'websocket') {
      if (row.decision !== 'blocked' || row.reason !== 'websocket_not_allowed' || row.probe !== true || row.correlated !== true) return false;
      continue;
    }
    const expected = classifier(row.url, transport, { requireNavigation: !row.probe, isNavigationRequest: row.navigation, probe: row.probe });
    if (row.decision !== expected.decision || row.reason !== expected.reason) return false;
    if (!row.probe && (row.decision !== 'allow' || row.reason !== 'exact_immutable_artifact' || !row.navigation_id)) return false;
  }
  return network.responses.every(response => network.requests.filter(request => request.sequence === response.request_sequence && request.decision === 'allow').length === 1);
}
function observedNavigationClean(row) {
  return Boolean(row && exactKeys(row, ['case_id', 'probe', 'sequence', 'navigation_id', 'url']) && CASE_PATTERN.test(row.case_id) && typeof row.probe === 'boolean' && Number.isInteger(row.sequence) && NAVIGATION_PATTERN.test(row.navigation_id) && typeof row.url === 'string' && row.url.length > 0);
}
function transportClean(transport, artifact) {
  const keys = ['kind', 'bind_address', 'port', 'origin', 'artifact_pathname', 'artifact_url', 'probe_redirect_path', 'probe_redirect_url', 'probe_download_path', 'probe_download_url', 'artifact_sha256', 'artifact_size_bytes', 'content_encoding', 'cache_policy', 'request_ledger', 'integrity_failure', 'closed'];
  if (!transport || !exactKeys(transport, keys) || transport.kind !== 'helper_owned_defensive_copy_rehash_each_response' || transport.bind_address !== '127.0.0.1' || !Number.isInteger(transport.port) || transport.port < 1 || transport.port > 65535 || transport.origin !== `http://127.0.0.1:${transport.port}` || transport.artifact_pathname !== `/artifact/${artifact?.sha256}.html` || transport.artifact_url !== transport.origin + transport.artifact_pathname || typeof transport.probe_redirect_path !== 'string' || !transport.probe_redirect_path.startsWith('/__pm_provenance/') || transport.probe_redirect_url !== transport.origin + transport.probe_redirect_path || typeof transport.probe_download_path !== 'string' || !transport.probe_download_path.startsWith('/__pm_provenance/') || transport.probe_download_url !== transport.origin + transport.probe_download_path || transport.probe_redirect_path === transport.probe_download_path || transport.artifact_sha256 !== artifact?.sha256 || transport.artifact_size_bytes !== artifact?.initial_stat?.size_bytes || transport.content_encoding !== null || transport.cache_policy !== 'no-store' || transport.integrity_failure !== null || transport.closed !== true || !contiguousUniqueSequences(transport.request_ledger)) return false;
  for (const row of transport.request_ledger) {
    if (!exactKeys(row, ['sequence', 'method', 'host', 'url', 'pathname', 'kind', 'status', 'navigation_id', 'served_sha256']) || typeof row.method !== 'string' || row.host !== new URL(transport.origin).host || typeof row.url !== 'string' || typeof row.pathname !== 'string' || !['artifact', 'probe_redirect', 'probe_download'].includes(row.kind) || !Number.isInteger(row.status) || (row.navigation_id !== null && !NAVIGATION_PATTERN.test(row.navigation_id)) || (row.served_sha256 !== null && !isDigest(row.served_sha256))) return false;
    if (row.kind === 'artifact' && (row.method !== 'GET' || row.status !== 200 || !row.navigation_id || row.served_sha256 !== artifact.sha256)) return false;
    if (row.kind === 'probe_redirect' && (row.status !== 302 || row.navigation_id !== null || row.served_sha256 !== null)) return false;
    if (row.kind === 'probe_download' && (row.status !== 200 || row.navigation_id !== null || !isDigest(row.served_sha256))) return false;
  }
  return true;
}
function policyProbeClean(network, transport) {
  const policy = network?.policy_probe;
  if (!transport || !Array.isArray(transport.request_ledger) || !policy || !exactKeys(policy, ['attempted', 'receipts']) || policy.attempted !== REQUIRED_POLICY_PROBES.length || !Array.isArray(policy.receipts) || policy.receipts.length !== REQUIRED_POLICY_PROBES.length) return false;
  for (const name of REQUIRED_POLICY_PROBES) {
    const matches = policy.receipts.filter(row => row?.name === name);
    if (matches.length !== 1) return false;
    const row = matches[0];
    if (!exactKeys(row, ['name', 'evidence_class', 'decision', 'reason', 'url', 'route_sequence', 'server_sequence', 'browser_error', 'correlated']) || row.evidence_class !== PROBE_CLASSES[name] || !['blocked', 'contained'].includes(row.decision) || typeof row.reason !== 'string' || typeof row.url !== 'string' || (row.browser_error !== null && typeof row.browser_error !== 'string') || row.correlated !== true) return false;
    if (row.route_sequence !== null && (!Number.isInteger(row.route_sequence) || network.requests.filter(request => request.sequence === row.route_sequence && request.probe === true && ['block', 'blocked'].includes(request.decision) && request.correlated === true).length !== 1)) return false;
    if (row.server_sequence !== null && (!Number.isInteger(row.server_sequence) || transport.request_ledger.filter(server => server.sequence === row.server_sequence && ['probe_redirect', 'probe_download'].includes(server.kind)).length !== 1)) return false;
    if (!['userinfo_host_confusion', 'file_url', 'service_worker', 'download'].includes(name) && row.route_sequence === null) return false;
    if (['userinfo_host_confusion', 'file_url', 'service_worker'].includes(name) && row.route_sequence === null && (typeof row.browser_error !== 'string' || row.browser_error.length === 0)) return false;
    if (!['redirect', 'download'].includes(name) && row.server_sequence !== null) return false;
    if (name === 'redirect' && (row.route_sequence === null || row.server_sequence === null)) return false;
    if (name === 'download' && (row.route_sequence !== null || row.server_sequence === null || row.decision !== 'contained')) return false;
  }
  return true;
}
function provenanceFailures(envelope, { requireEmbeddedAdmission = true } = {}) {
  const failures = [], topKeys = ['schema_id', 'schema_version', 'launcher', 'artifact', 'verifier', 'helper', 'node', 'playwright', 'browser', 'command', 'transport', 'contexts', 'navigations', 'observed_main_frame_navigations', 'network', 'runtime_errors', 'finalization', 'certification_boundary', 'admission'];
  if (!exactKeys(envelope, topKeys) || envelope.schema_id !== SCHEMA_ID || envelope.schema_version !== SCHEMA_VERSION) failures.push('schema_identity');
  for (const key of ['artifact', 'verifier', 'helper']) if (!fileBindingClean(envelope?.[key])) failures.push(`${key}_binding`);
  if (!exactKeys(envelope?.node, ['executable', 'process_identity']) || !fileBindingClean(envelope?.node?.executable) || !processIdentityClean(envelope?.node?.process_identity, envelope?.node?.executable)) failures.push('node_binding');
  const playwright = envelope?.playwright;
  if (!playwright || !exactKeys(playwright, ['package_tree', 'package_version', 'loaded_modules']) || !treeBindingClean(playwright.package_tree) || typeof playwright.package_version !== 'string' || playwright.package_version.length === 0) failures.push('playwright_tree_binding');
  const playwrightManifestFiles = new Map((playwright?.package_tree?.manifest_rows || []).filter(row => row.kind === 'file').map(row => [row.path, row]));
  if (!Array.isArray(playwright?.loaded_modules) || playwright.loaded_modules.length === 0 || new Set(playwright.loaded_modules.map(row => row?.path)).size !== playwright.loaded_modules.length || playwright.loaded_modules.some(row => !exactKeys(row, ['path', 'sha256', 'size_bytes']) || typeof row.path !== 'string' || !isDigest(row.sha256) || !Number.isInteger(row.size_bytes) || row.size_bytes < 0 || playwrightManifestFiles.get(row.path)?.sha256 !== row.sha256 || playwrightManifestFiles.get(row.path)?.size_bytes !== row.size_bytes)) failures.push('playwright_loaded_modules');
  const browserKeys = ['executable', 'package_tree', 'direct_executable_binding', 'cli_version_text', 'cli_version', 'browser_type', 'playwright_runtime_version', 'cdp_product', 'cdp_revision', 'cdp_js_version', 'cdp_protocol_version', 'cdp_user_agent', 'cdp_command_line', 'cdp_browser_pid', 'process_identity', 'network_namespace', 'version_consistent', 'executable_unchanged_after_run', 'launch_options', 'environment_keys', 'environment_sha256'];
  if (!exactKeys(envelope?.browser, browserKeys) || !fileBindingClean(envelope?.browser?.executable) || !treeBindingClean(envelope?.browser?.package_tree) || envelope.browser.direct_executable_binding !== true || envelope.browser.executable.executable_kind === null || envelope.browser.executable_unchanged_after_run !== true) failures.push('browser_binding');
  const identity = envelope?.browser?.process_identity;
  const launchOptions = envelope?.browser?.launch_options;
  const allowedEnvironment = new Set(['PATH', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR', 'HOME']);
  if (!processIdentityClean(identity, envelope?.browser?.executable) || !Number.isInteger(envelope?.browser?.cdp_browser_pid) || envelope.browser.cdp_browser_pid !== identity?.pid || typeof envelope.browser.network_namespace !== 'string' || envelope.browser.network_namespace !== envelope?.network?.os_egress?.network_namespace || !Array.isArray(envelope.browser.cdp_command_line) || envelope.browser.cdp_command_line.length === 0 || !envelope.browser.cdp_command_line.every(value => typeof value === 'string') || envelope.browser.version_consistent !== true || new Set([envelope.browser.cli_version, normalizeVersion(envelope.browser.playwright_runtime_version), normalizeVersion(envelope.browser.cdp_product)]).size !== 1 || !exactKeys(launchOptions, ['headless', 'executablePath', 'env', 'args']) || launchOptions.headless !== true || !/^\/proc\/self\/fd\/\d+$/.test(launchOptions.executablePath) || !exactKeys(launchOptions.env, envelope.browser.environment_keys) || envelope.browser.environment_keys.some(key => !allowedEnvironment.has(key)) || sha256(canonicalBytes(launchOptions.env)) !== envelope.browser.environment_sha256 || canonicalBytes(launchOptions.args).compare(canonicalBytes(BROWSER_LAUNCH_ARGUMENTS)) !== 0 || !envelope.browser.cdp_command_line.some(value => [launchOptions.executablePath, envelope.browser.executable.resolved_path, identity?.proc_exe_path].includes(value))) failures.push('browser_process_identity');
  const browserRelative = typeof envelope?.browser?.package_tree?.root === 'string' && typeof envelope?.browser?.executable?.resolved_path === 'string' ? relative(envelope.browser.package_tree.root, envelope.browser.executable.resolved_path).split(sep).join('/') : null;
  const browserPackageRow = envelope?.browser?.package_tree?.manifest_rows?.find(row => row.kind === 'file' && row.path === browserRelative);
  if (!browserRelative || browserRelative === '..' || browserRelative.startsWith('../') || isAbsolute(browserRelative) || browserPackageRow?.sha256 !== envelope?.browser?.executable?.sha256 || browserPackageRow?.size_bytes !== envelope?.browser?.executable?.initial_stat?.size_bytes) failures.push('browser_package_membership');
  if (!commandClean(envelope?.command)) failures.push('command_identity');
  if (!jsonValueClean(envelope?.command?.normalized_effective_config) || envelope?.command?.normalized_effective_config?.certification_mode !== true || envelope?.command?.normalized_effective_config?.service_workers !== 'block' || resolve(envelope?.command?.normalized_effective_config?.artifact_path || '') !== envelope?.artifact?.resolved_path || resolve(envelope?.command?.normalized_effective_config?.outdir || '') !== resolve(envelope?.command?.parsed_args?.outdir || '')) failures.push('effective_config');
  if (!boundaryExact(envelope?.certification_boundary)) failures.push('certification_boundary');
  if (!exactKeys(envelope?.launcher, ['receipt_binding', 'launcher_pid', 'live_parent_bound', 'nonce_bound', 'network_namespace_bound', 'launcher_process_sha256']) || !Number.isInteger(envelope.launcher.launcher_pid) || envelope.launcher.launcher_pid <= 0 || envelope.launcher.live_parent_bound !== true || envelope.launcher.nonce_bound !== true || envelope.launcher.network_namespace_bound !== true || !isDigest(envelope.launcher.launcher_process_sha256) || !fileBindingClean(envelope.launcher.receipt_binding)) failures.push('launcher_identity');
  if (!Array.isArray(envelope?.contexts) || envelope.contexts.length < 2 || new Set(envelope.contexts.map(row => row?.case_id)).size !== envelope.contexts.length || envelope.contexts.some(row => !exactKeys(row, ['case_id', 'probe', 'helper_created', 'attached_before_page', 'effective_context', 'effective_context_sha256', 'navigation_count', 'blocked_count', 'runtime_error_count']) || !CASE_PATTERN.test(row.case_id) || typeof row.probe !== 'boolean' || row.helper_created !== true || row.attached_before_page !== true || !contextConfigClean(row.effective_context) || sha256(canonicalBytes(row.effective_context)) !== row.effective_context_sha256 || ![row.navigation_count, row.blocked_count, row.runtime_error_count].every(value => Number.isInteger(value) && value >= 0) || !Array.isArray(envelope.navigations) || row.navigation_count !== envelope.navigations.filter(nav => nav?.case_id === row.case_id).length) || !envelope.contexts.some(row => row?.probe === true) || !envelope.contexts.some(row => row?.probe === false)) failures.push('context_identity');
  if (!Array.isArray(envelope?.navigations) || envelope.navigations.length === 0 || !Array.isArray(envelope?.observed_main_frame_navigations)) failures.push('navigation_presence'); else failures.push(...exactJoinFailures(envelope));
  if (!contiguousUniqueSequences(envelope?.observed_main_frame_navigations) || envelope.observed_main_frame_navigations.some(row => !observedNavigationClean(row))) failures.push('observed_navigation_shape');
  const network = envelope?.network;
  if (!network || !exactKeys(network, ['requests', 'responses', 'blocked_attempts', 'unmanifested_same_origin', 'request_failures', 'http_errors', 'escape_attempts', 'policy_probe', 'os_egress'])) failures.push('network_shape');
  else {
    if (!contiguousUniqueSequences(network.requests) || network.requests.some(row => !requestRowClean(row)) || !contiguousUniqueSequences(network.responses) || network.responses.some(row => !responseRowClean(row)) || network.responses.some(response => network.requests.filter(request => request.sequence === response.request_sequence && request.case_id === response.case_id && request.url === response.url).length !== 1) || !networkPolicyLedgerClean(network, envelope.transport)) failures.push('network_ledger_shape');
    if (!Array.isArray(network.blocked_attempts) || !Array.isArray(network.unmanifested_same_origin) || !Array.isArray(network.request_failures) || !Array.isArray(network.http_errors) || !Array.isArray(network.escape_attempts) || network.blocked_attempts.length || network.unmanifested_same_origin.length || network.request_failures.length || network.http_errors.length || network.escape_attempts.length) failures.push('artifact_network_cleanliness');
    const osEgress = network.os_egress;
    if (!exactKeys(osEgress, ['evidence_class', 'receipt_id', 'receipt_sha256', 'enforcement', 'enforced', 'loopback_allowed', 'loopback_only', 'non_loopback_egress_denied', 'network_namespace', 'namespace_matches_process', 'helper_enforced']) || osEgress.evidence_class !== 'independently_verified_os_process_boundary' || typeof osEgress.receipt_id !== 'string' || !isDigest(osEgress.receipt_sha256) || !['linux_network_namespace_firewall', 'host_firewall_process_policy'].includes(osEgress.enforcement) || osEgress.enforced !== true || osEgress.loopback_allowed !== true || osEgress.loopback_only !== true || osEgress.non_loopback_egress_denied !== true || typeof osEgress.network_namespace !== 'string' || osEgress.namespace_matches_process !== true || osEgress.helper_enforced !== false) failures.push('os_egress_boundary');
    if (!policyProbeClean(network, envelope.transport)) failures.push('network_policy_probe');
  }
  if (!transportClean(envelope?.transport, envelope?.artifact)) failures.push('transport_integrity');
  if (!exactKeys(envelope?.runtime_errors, ['count', 'samples']) || envelope.runtime_errors.count !== 0 || !Array.isArray(envelope.runtime_errors.samples) || envelope.runtime_errors.samples.length) failures.push('runtime_errors');
  if (!exactKeys(envelope?.finalization, ['state', 'pre_close', 'browser_closed', 'transport_closed', 'failed_stage', 'failure']) || envelope.finalization.state !== 'complete' || envelope.finalization.pre_close !== true || envelope.finalization.browser_closed !== true || envelope.finalization.transport_closed !== true || envelope.finalization.failed_stage !== null || envelope.finalization.failure !== null) failures.push('finalization');
  if (requireEmbeddedAdmission && (!exactKeys(envelope?.admission, ['pass', 'failures', 'envelope_sha256']) || envelope.admission.pass !== true || !Array.isArray(envelope.admission.failures) || envelope.admission.failures.length !== 0 || !isDigest(envelope.admission.envelope_sha256))) failures.push('embedded_admission');
  return [...new Set(failures)];
}
export function provenanceAdmissionFailures(envelope) { return provenanceFailures(envelope, { requireEmbeddedAdmission: true }); }
export function assertProvenanceAdmission(envelope) {
  const failures = provenanceAdmissionFailures(envelope);
  if (failures.length) { const error = fail(`provenance admission failed: ${failures.join(',')}`, { failures }, 'admission'); error.failures = failures; throw error; }
  const copy = structuredClone(envelope), claimed = copy.admission.envelope_sha256; copy.admission.envelope_sha256 = null;
  if (sha256(canonicalBytes(copy)) !== claimed) throw fail('finalized envelope seal mismatch', { claimed }, 'admission');
  return true;
}

export async function prepareProvenanceRun(options) {
  let sink = options?.failureSink || null;
  try {
    if (!sink && typeof options?.command?.parsed_args?.outdir === 'string') sink = createDurableFailureSink({ outdir: options.command.parsed_args.outdir, verifier: String(options?.effectiveConfig?.verifier || 'unknown') });
    const command = options?.command;
    if (!command || !Array.isArray(command.raw_argv) || !command.parsed_args || !isDigest(command.parser_receipt_sha256)) throw fail('strict command receipt is required', null, 'prepare');
    const issuedCommand = ISSUED_PARSER_RECEIPTS.get(command);
    if (!issuedCommand || issuedCommand.synthetic || issuedCommand.verified_node_path !== realpathSync(process.execPath)) throw fail('command receipt was not issued by this live strict parser invocation', null, 'prepare');
    if (!sink) throw fail('durable failure sink is unavailable', null, 'prepare');
    if (!isDigest(options.expectedLaunchReceiptSha256) || process.env.PM_PROVENANCE_LAUNCH_RECEIPT_SHA256 !== options.expectedLaunchReceiptSha256) throw fail('expected launch receipt SHA-256 is required and must match environment', null, 'prepare');
    const launch = readJsonBinding('launch_receipt', options.launchReceiptPath, options.expectedLaunchReceiptSha256); validateLaunchReceipt(launch.value, options.launchReceiptPath);
    const receipt = launch.value, verifierPath = options.verifierUrl?.startsWith?.('file:') ? fileURLToPath(options.verifierUrl) : options.verifierUrl;
    if (issuedCommand.verified_verifier_path !== realpathSync(verifierPath)) throw fail('strict parser verifier identity differs from the prepared verifier module', null, 'prepare');
    if (resolve(verifierPath) !== resolve(receipt.stage.verifier_path) || resolve(fileURLToPath(import.meta.url)) !== resolve(receipt.stage.helper_path) || resolve(options.modulesPath) !== resolve(receipt.stage.modules_path) || resolve(options.artifactPath) !== resolve(receipt.inputs.artifact.absolute_path) || resolve(options.chromiumPath) !== resolve(receipt.inputs.browser.absolute_path)) throw fail('call-site paths do not match staged launch receipt', null, 'prepare');
    for (const [label, supplied, expected] of [['artifact', options.expectedArtifactSha256, receipt.inputs.artifact.sha256], ['verifier', options.expectedVerifierSha256, receipt.inputs.verifier.sha256], ['helper', options.expectedHelperSha256, receipt.inputs.helper.sha256]]) if (supplied !== expected || !isDigest(supplied)) throw fail(`${label} denominator does not match launcher`, null, 'prepare');
    const requiredChildArguments = {
      file: receipt.inputs.artifact.absolute_path, outdir: resolve(receipt.stage.root, '..'),
      modules: receipt.stage.modules_path, chromium: receipt.inputs.browser.absolute_path,
      'expected-artifact-sha256': receipt.inputs.artifact.sha256,
      'expected-verifier-sha256': receipt.inputs.verifier.sha256,
      'expected-helper-sha256': receipt.inputs.helper.sha256,
      'provenance-launch-receipt': resolve(options.launchReceiptPath),
      'expected-launch-receipt-sha256': options.expectedLaunchReceiptSha256
    };
    if (Object.entries(requiredChildArguments).some(([key, value]) => options.command.parsed_args[key] !== value)) throw fail('strict child command does not match launch receipt inputs', { required: requiredChildArguments }, 'prepare');
    const receivedExtras = [];
    for (const [token, value] of Array.from({ length: receipt.launcher_command.verifier_extra_args.length / 2 }, (_, index) => receipt.launcher_command.verifier_extra_args.slice(index * 2, index * 2 + 2))) {
      const key = token.slice(2); receivedExtras.push(token, value);
      if (options.command.parsed_args[key] !== value || options.command.option_spelling[key] !== key) throw fail('strict verifier extra arguments do not match launcher receipt', { key }, 'prepare');
    }
    const protectedKeys = new Set(Object.keys(requiredChildArguments));
    const observedExtraKeys = Object.keys(options.command.parsed_args).filter(key => !protectedKeys.has(key)).sort();
    if (canonicalBytes(observedExtraKeys).compare(canonicalBytes(receivedExtras.filter((_, index) => index % 2 === 0).map(token => token.slice(2)).sort())) !== 0) throw fail('unbound verifier arguments are present', { observedExtraKeys }, 'prepare');
    const artifact = descriptorBinding('artifact', receipt.inputs.artifact.inherited_fd, receipt.inputs.artifact), browserExecutable = descriptorBinding('browser_executable', receipt.inputs.browser.inherited_fd, receipt.inputs.browser, { directExecutable: true }), nodeDescriptor = descriptorBinding('node_executable', receipt.inputs.node.inherited_fd, receipt.inputs.node, { directExecutable: true });
    const nodeProcess = procExecutableBinding('node', process.pid, nodeDescriptor), verifier = secureReadPath('verifier', verifierPath, receipt.inputs.verifier.sha256), helper = secureReadPath('provenance_helper', fileURLToPath(import.meta.url), receipt.inputs.helper.sha256);
    const playwrightTree = treeBinding('playwright_package_tree', receipt.stage.playwright_package_path, receipt.inputs.playwright.manifest_sha256, receipt.inputs.playwright.file_count), browserTree = treeBinding('browser_package_tree', receipt.inputs.browser_package.requested_path, receipt.inputs.browser_package.manifest_sha256, receipt.inputs.browser_package.file_count);
    const browserRelativePath = relative(browserTree.record.root, browserExecutable.record.resolved_path).split(sep).join('/');
    const browserManifestRow = browserTree.initial.rows.find(row => row.kind === 'file' && row.path === browserRelativePath);
    if (!browserRelativePath || browserRelativePath === '..' || browserRelativePath.startsWith('../') || isAbsolute(browserRelativePath) || !browserManifestRow || browserManifestRow.sha256 !== browserExecutable.record.sha256 || browserManifestRow.size_bytes !== browserExecutable.record.initial_stat.size_bytes) throw fail('browser executable is not an exact member of the pinned browser package tree', { browserRelativePath }, 'prepare');
    const launcherFd = openSync(`/proc/${process.ppid}/exe`, fsConstants.O_RDONLY); let launcherProcessSha;
    try { launcherProcessSha = sha256(readDescriptorBytes(launcherFd, fstatSync(launcherFd, { bigint: true }))); } finally { closeSync(launcherFd); }
    if (launcherProcessSha !== receipt.launcher.running_process.sha256) throw fail('live launcher process executable mismatch', null, 'prepare');
    const transport = await startImmutableServer(artifact.bytes, artifact.record.sha256);
    const state = { browser: null, browserClosed: false, finalizedBeforeClose: false, finalEnvelope: null, transportClosed: false, playwrightApi: null, playwrightRequire: null, loadedModulePaths: [], contexts: [], navigations: [], observedNavigations: [], requests: [], responses: [], blockedAttempts: [], unmanifestedSameOrigin: [], requestFailures: [], httpErrors: [], escapeAttempts: [], runtimeErrors: [], policyProbeReceipts: [], networkSequence: 0, responseSequence: 0, cdp: null, failureSink: sink };
    const commandEnvelope = { argv0: command.argv0, argv1: command.argv1, raw_argv: command.raw_argv.slice(), parsed_args: { ...command.parsed_args }, option_spelling: { ...command.option_spelling }, normalized_effective_config: stableObject(options.effectiveConfig || command.normalized_config), unknown_args: command.unknown_args.slice(), duplicate_args: command.duplicate_args.slice(), cwd: command.cwd, node_argv0: command.node_argv0, verifier_argv0: command.verifier_argv0, parser_receipt_sha256: command.parser_receipt_sha256 };
    const envelope = {
      schema_id: SCHEMA_ID, schema_version: SCHEMA_VERSION,
      launcher: { receipt_binding: launch.record, launcher_pid: receipt.launcher_pid, live_parent_bound: true, nonce_bound: true, network_namespace_bound: true, launcher_process_sha256: launcherProcessSha },
      artifact: artifact.record, verifier: verifier.record, helper: helper.record,
      node: { executable: nodeDescriptor.record, process_identity: nodeProcess },
      playwright: { package_tree: playwrightTree.record, package_version: null, loaded_modules: state.loadedModulePaths },
      browser: { executable: browserExecutable.record, package_tree: browserTree.record, direct_executable_binding: true, cli_version_text: null, cli_version: null, browser_type: null, playwright_runtime_version: null, cdp_product: null, cdp_revision: null, cdp_js_version: null, cdp_protocol_version: null, cdp_user_agent: null, cdp_command_line: [], cdp_browser_pid: null, process_identity: null, network_namespace: null, version_consistent: false, executable_unchanged_after_run: false, launch_options: null, environment_keys: [], environment_sha256: null },
      command: commandEnvelope,
      transport: { kind: 'helper_owned_defensive_copy_rehash_each_response', bind_address: '127.0.0.1', port: transport.port, origin: transport.origin, artifact_pathname: transport.artifact_pathname, artifact_url: transport.artifact_url, probe_redirect_path: transport.probe_redirect_path, probe_redirect_url: transport.probe_redirect_url, probe_download_path: transport.probe_download_path, probe_download_url: transport.probe_download_url, artifact_sha256: artifact.record.sha256, artifact_size_bytes: artifact.bytes.length, content_encoding: null, cache_policy: 'no-store', request_ledger: transport.request_ledger, integrity_failure: null, closed: false },
      contexts: state.contexts, navigations: state.navigations, observed_main_frame_navigations: state.observedNavigations,
      network: { requests: state.requests, responses: state.responses, blocked_attempts: state.blockedAttempts, unmanifested_same_origin: state.unmanifestedSameOrigin, request_failures: state.requestFailures, http_errors: state.httpErrors, escape_attempts: state.escapeAttempts, policy_probe: { attempted: 0, receipts: state.policyProbeReceipts }, os_egress: { evidence_class: receipt.network_boundary.receipt.evidence_class, receipt_id: receipt.network_boundary.receipt.receipt_id, receipt_sha256: receipt.network_boundary.binding.sha256, enforcement: receipt.network_boundary.receipt.enforcement, enforced: true, loopback_allowed: true, loopback_only: true, non_loopback_egress_denied: true, network_namespace: receipt.network_boundary.receipt.network_namespace, namespace_matches_process: true, helper_enforced: false } },
      runtime_errors: { count: 0, samples: [] }, finalization: { state: 'prepared', pre_close: false, browser_closed: false, transport_closed: false, failed_stage: null, failure: null }, certification_boundary: { ...BROWSER_ONLY_BOUNDARY }, admission: { pass: false, failures: ['not_finalized'], envelope_sha256: null }
    };
    function artifactUrl(params = {}) { const keys = Object.keys(params); if (!keys.length) return transport.artifact_url; if (keys.length !== 1 || keys[0] !== 'case' || !CASE_PATTERN.test(String(params.case))) throw fail('artifact URL permits one bounded case query only', null, 'navigation'); return `${transport.artifact_url}?case=${encodeURIComponent(String(params.case))}`; }
    function artifactText() { const bytes = transport.privateBytesCopy(); if (sha256(bytes) !== artifact.record.sha256) throw fail('artifact inspection copy digest mismatch', null, 'artifact_inspection'); return bytes.toString('utf8'); }
    function collectLoadedModules() {
      const root = resolve(receipt.stage.playwright_package_path) + sep;
      const manifestFiles = new Map(playwrightTree.initial.rows.filter(row => row.kind === 'file').map(row => [row.path, row]));
      const paths = Object.keys(state.playwrightRequire?.cache || {}).filter(path => resolve(path).startsWith(root)).sort();
      const rows = paths.map(path => {
        const relativePath = relative(receipt.stage.playwright_package_path, path).split(sep).join('/');
        const manifestRow = manifestFiles.get(relativePath);
        if (!manifestRow) throw fail('loaded Playwright module is absent from the pinned tree manifest', { path: relativePath }, 'playwright_load');
        const bound = secureReadPath(`playwright_loaded:${relativePath}`, path, manifestRow.sha256);
        if (bound.bytes.length !== manifestRow.size_bytes) throw fail('loaded Playwright module size differs from pinned tree manifest', { path: relativePath }, 'playwright_load');
        return { path: relativePath, sha256: bound.record.sha256, size_bytes: bound.bytes.length };
      });
      state.loadedModulePaths.splice(0, state.loadedModulePaths.length, ...rows); return rows;
    }
    function loadPlaywright() {
      if (state.playwrightApi) throw fail('Playwright may be loaded exactly once', null, 'playwright_load');
      if (!playwrightTree.revalidate()) throw fail('Playwright tree changed before load', null, 'playwright_load');
      const requireFromRuntime = createRequire(join(receipt.stage.modules_path, '__pm7_provenance_noop__.js')), packageJsonPath = requireFromRuntime.resolve('playwright-core/package.json');
      if (!resolve(packageJsonPath).startsWith(resolve(receipt.stage.playwright_package_path) + sep)) throw fail('Playwright resolution escaped staged package', null, 'playwright_load');
      const preloaded = Object.keys(requireFromRuntime.cache || {}).filter(path => resolve(path).startsWith(resolve(receipt.stage.playwright_package_path) + sep));
      if (preloaded.length) throw fail('Playwright code was loaded before provenance preparation', { preloaded }, 'playwright_load');
      const packageRelativePath = relative(receipt.stage.playwright_package_path, packageJsonPath).split(sep).join('/'), packageManifestRow = playwrightTree.initial.rows.find(row => row.kind === 'file' && row.path === packageRelativePath);
      if (!packageManifestRow) throw fail('Playwright package metadata is absent from the pinned manifest', { packageRelativePath }, 'playwright_load');
      const packageJsonBinding = secureReadPath('playwright_package_json', packageJsonPath, packageManifestRow.sha256);
      state.playwrightRequire = requireFromRuntime; state.playwrightApi = requireFromRuntime('playwright-core'); envelope.playwright.package_version = JSON.parse(packageJsonBinding.bytes.toString('utf8')).version || null;
      if (!state.playwrightApi?.chromium || !collectLoadedModules().length || !playwrightTree.revalidate()) throw fail('Playwright staged module graph did not bind after load', null, 'playwright_load');
      return { chromium: state.playwrightApi.chromium };
    }
    async function launchChromium() {
      if (!state.playwrightApi?.chromium) throw fail('loadPlaywright must run before launch', null, 'browser_launch'); if (state.browser) throw fail('browser already launched', null, 'browser_launch');
      browserExecutable.revalidate(); browserTree.revalidate(); const executablePath = `/proc/self/fd/${browserExecutable.fd}`, environment = sanitizedBrowserEnvironment();
      const cliProbe = spawnSync(executablePath, ['--version'], { encoding: 'utf8', timeout: 15000, env: environment });
      if (cliProbe.error || cliProbe.status !== 0) throw fail('bound browser CLI probe failed', { status: cliProbe.status, error: String(cliProbe.error || '') }, 'browser_launch');
      const cliVersionText = `${cliProbe.stdout || ''}\n${cliProbe.stderr || ''}`.trim(), cliVersion = normalizeVersion(cliVersionText); if (!cliVersion) throw fail('bound browser CLI version is unavailable', null, 'browser_launch');
      const launchOptions = deepFreeze({ headless: true, executablePath, env: environment, args: [...BROWSER_LAUNCH_ARGUMENTS] });
      Object.assign(envelope.browser, { cli_version_text: cliVersionText, cli_version: cliVersion, launch_options: canonicalize(launchOptions), environment_keys: Object.keys(environment).sort(), environment_sha256: sha256(canonicalBytes(environment)) });
      let browser; try { browser = await state.playwrightApi.chromium.launch(launchOptions); } catch (error) { state.failureSink?.record('browser_launch', error, envelope); throw error; }
      state.browser = browser; envelope.browser.browser_type = browser.browserType().name(); envelope.browser.playwright_runtime_version = browser.version();
      const session = await browser.newBrowserCDPSession();
      try {
        const [version, commandLine, processes] = await Promise.all([session.send('Browser.getVersion'), session.send('Browser.getBrowserCommandLine'), session.send('SystemInfo.getProcessInfo')]); state.cdp = version;
        const browserProcesses = processes.processInfo?.filter(row => row.type === 'browser');
        if (!Array.isArray(browserProcesses) || browserProcesses.length !== 1 || !Number.isInteger(browserProcesses[0].id)) throw fail('CDP did not expose exactly one browser PID', null, 'browser_identity');
        const pid = browserProcesses[0].id, processIdentity = procExecutableBinding('browser', pid, browserExecutable), processNamespace = readlinkSync(`/proc/${pid}/ns/net`), argv = Array.isArray(commandLine.arguments) ? commandLine.arguments : [];
        if (processNamespace !== receipt.network_boundary.receipt.network_namespace) throw fail('browser PID escaped verified network namespace', null, 'browser_identity');
        if (!argv.length || !argv.some(value => value === executablePath || value === browserExecutable.record.resolved_path || value === processIdentity.proc_exe_path)) throw fail('CDP browser command line is not tied to bound executable', { argv }, 'browser_identity');
        Object.assign(envelope.browser, { cdp_product: version.product || null, cdp_revision: version.revision || null, cdp_js_version: version.jsVersion || null, cdp_protocol_version: version.protocolVersion || null, cdp_user_agent: version.userAgent || null, cdp_command_line: argv, cdp_browser_pid: pid, process_identity: processIdentity, network_namespace: processNamespace });
      } finally { await session.detach(); }
      const versions = [cliVersion, normalizeVersion(envelope.browser.playwright_runtime_version), normalizeVersion(envelope.browser.cdp_product)]; envelope.browser.version_consistent = versions.every(Boolean) && new Set(versions).size === 1;
      if (envelope.browser.browser_type !== 'chromium' || !envelope.browser.version_consistent) throw fail('CLI/Playwright/CDP browser identity mismatch', { versions }, 'browser_identity');
      return { browser };
    }
    function contextRow(caseId, effectiveContext, probe) {
      const row = { case_id: caseId, probe: Boolean(probe), helper_created: true, attached_before_page: true, effective_context: canonicalize(effectiveContext), effective_context_sha256: sha256(canonicalBytes(effectiveContext)), navigation_count: 0, blocked_count: 0, runtime_error_count: 0 };
      state.contexts.push(row); return row;
    }
    async function configureContext(context, caseId, effectiveContext, probe) {
      if (context.pages().length !== 0) throw fail('helper-created context unexpectedly has preexisting pages', null, 'context');
      const row = contextRow(caseId, effectiveContext, probe), pendingBlocks = [], pages = new Map(), navigationByFrame = new WeakMap(), requestRows = new WeakMap(), responseRows = new WeakMap(), downloads = [], serviceWorkers = [];
      function addRuntime(kind, value) { if (probe) return; state.runtimeErrors.push(runtimeErrorRecord(kind, caseId, value)); row.runtime_error_count += 1; }
      async function instrumentPage(page) {
        if (pages.has(page)) return pages.get(page);
        const ready = (async () => {
          page.on('console', message => { if (message.type() === 'error') addRuntime('console', message.text()); }); page.on('pageerror', error => addRuntime('pageerror', error));
          page.on('download', download => { const entry = { case_id: caseId, kind: 'download', url: download.url(), suggested_filename: download.suggestedFilename() }; downloads.push({ download, entry }); if (!probe) state.escapeAttempts.push(entry); });
          page.on('worker', worker => { if (!probe) state.escapeAttempts.push({ case_id: caseId, kind: 'worker', url: worker.url() }); });
          page.on('framenavigated', frame => { const url = frame.url(); if (frame.parentFrame()) { if (ACTIVE_INTRINSIC_PATTERN.test(url) || url.startsWith('file:')) state.escapeAttempts.push({ case_id: caseId, kind: 'subframe_navigation', url }); return; } if (url === 'about:blank') return; state.observedNavigations.push({ case_id: caseId, probe: Boolean(probe), sequence: state.observedNavigations.length + 1, navigation_id: navigationByFrame.get(frame) || null, url }); });
          const cdp = await context.newCDPSession(page); await cdp.send('Network.enable'); cdp.on('Network.requestWillBeSent', event => { const url = event.request?.url || ''; if ((ACTIVE_INTRINSIC_PATTERN.test(url) || url.startsWith('file:')) && !probe) state.escapeAttempts.push({ case_id: caseId, kind: 'cdp_intrinsic_request', url }); }); return cdp;
        })(); pages.set(page, ready); return ready;
      }
      context.on('page', page => { void instrumentPage(page).catch(error => addRuntime('instrumentation', error)); });
      context.on('serviceworker', worker => { const entry = { case_id: caseId, kind: 'service_worker', url: worker.url() }; serviceWorkers.push(entry); if (!probe) state.escapeAttempts.push(entry); });
      context.on('requestfailed', request => { const failureText = String(request.failure()?.errorText || ''), pending = requestRows.get(request); if (pending && BLOCKED_FAILURE_PATTERN.test(failureText)) { pending.observed_failure_error = failureText; pending.correlated = true; return; } if (!probe) state.requestFailures.push({ case_id: caseId, url: request.url(), method: request.method(), resource_type: request.resourceType(), error: failureText }); });
      context.on('response', response => { const requestRow = requestRows.get(response.request()), receiptRow = { sequence: ++state.responseSequence, case_id: caseId, probe: Boolean(probe), navigation_id: requestRow?.navigation_id || null, request_sequence: requestRow?.sequence || null, url: response.url(), status: response.status(), resource_type: response.request().resourceType(), navigation: response.request().isNavigationRequest() }; responseRows.set(response, receiptRow); state.responses.push(receiptRow); if (!probe && response.status() >= 400) state.httpErrors.push(receiptRow); });
      await context.route('**/*', async route => {
        const request = route.request(), decision = classifier(request.url(), transport, { requireNavigation: !probe, isNavigationRequest: request.isNavigationRequest(), probe }), navigationId = navigationByFrame.get(request.frame()) || null;
        const requestRow = { sequence: ++state.networkSequence, case_id: caseId, probe: Boolean(probe), navigation_id: navigationId, decision: decision.decision, reason: decision.reason, method: request.method(), url: request.url(), resource_type: request.resourceType(), navigation: request.isNavigationRequest(), abort_error: decision.decision === 'block' ? 'blockedbyclient' : null, observed_failure_error: null, correlated: false };
        requestRows.set(request, requestRow); state.requests.push(requestRow);
        if (decision.decision === 'allow') { const headers = { ...request.headers() }; if (decision.reason === 'exact_immutable_artifact') { if (!navigationId || !NAVIGATION_PATTERN.test(navigationId)) throw fail('bound artifact request has no navigation identity', null, 'navigation'); headers['x-pm7-navigation-id'] = navigationId; } await route.continue({ headers }); return; }
        pendingBlocks.push(requestRow); row.blocked_count += 1; if (!probe) { state.blockedAttempts.push(requestRow); if (decision.reason === 'unmanifested_same_origin_path') state.unmanifestedSameOrigin.push(requestRow); } await route.abort('blockedbyclient');
      });
      if (typeof context.routeWebSocket !== 'function') throw fail('Playwright routeWebSocket is required', null, 'context');
      await context.routeWebSocket(/.*/, async wsRoute => { const receiptRow = { sequence: ++state.networkSequence, case_id: caseId, probe: Boolean(probe), navigation_id: null, decision: 'blocked', reason: 'websocket_not_allowed', method: 'WEBSOCKET', url: wsRoute.url(), resource_type: 'websocket', navigation: false, abort_error: 'blockedbyclient', observed_failure_error: 'websocket_route_closed', correlated: true }; pendingBlocks.push(receiptRow); state.requests.push(receiptRow); if (!probe) state.escapeAttempts.push(receiptRow); await wsRoute.close({ code: 1008, reason: 'PM7 provenance policy' }); });
      async function bindNavigation(page, response, navigationId, requestedUrl) {
        if (!response) throw fail(`main document response unavailable: ${navigationId}`, null, 'navigation');
        const request = response.request(), requestRow = requestRows.get(request), responseRow = responseRows.get(response) || state.responses.find(item => item.request_sequence === requestRow?.sequence), headers = await response.allHeaders(), body = await response.body(), finalUrl = response.url(), serverRows = transport.request_ledger.filter(entry => entry.kind === 'artifact' && entry.navigation_id === navigationId);
        const receiptRow = { case_id: caseId, probe: Boolean(probe), navigation_id: navigationId, requested_url: requestedUrl, request_url: request.url(), final_url: finalUrl, main_frame: request.isNavigationRequest() && response.frame() === page.mainFrame(), status: response.status(), redirect_chain: (() => { const rows = []; let prior = request.redirectedFrom(); while (prior) { rows.unshift(prior.url()); prior = prior.redirectedFrom(); } return rows; })(), content_type: String(headers['content-type'] || '').split(';')[0].trim().toLowerCase() || null, content_encoding: headers['content-encoding'] || null, content_length_header: headers['content-length'] || null, body_size_bytes: body.length, body_sha256: sha256(body), expected_artifact_sha256: artifact.record.sha256, hash_match: sha256(body) === artifact.record.sha256, exact_url_policy: classifier(finalUrl, transport, { requireNavigation: true, isNavigationRequest: true }).decision === 'allow', immutable_server_header_match: headers['x-pm7-artifact-sha256'] === artifact.record.sha256 && headers['x-pm7-navigation-id'] === navigationId, network_request_sequence: requestRow?.sequence || null, network_response_sequence: responseRow?.sequence || null, server_request_sequence: serverRows.length === 1 ? serverRows[0].sequence : null };
        state.navigations.push(receiptRow); row.navigation_count += 1; const observed = state.observedNavigations.filter(item => item.navigation_id === navigationId);
        if (!(requestRow && responseRow && serverRows.length === 1 && observed.length === 1 && requestedUrl === request.url() && request.url() === finalUrl && receiptRow.main_frame && receiptRow.status === 200 && !receiptRow.redirect_chain.length && receiptRow.content_type === 'text/html' && receiptRow.content_encoding === null && receiptRow.body_size_bytes === artifact.bytes.length && receiptRow.content_length_header === String(artifact.bytes.length) && receiptRow.hash_match && receiptRow.exact_url_policy && receiptRow.immutable_server_header_match && serverRows[0].served_sha256 === artifact.record.sha256)) throw fail(`navigation provenance mismatch: ${navigationId}`, receiptRow, 'navigation');
        navigationByFrame.delete(page.mainFrame()); return receiptRow;
      }
      return { case_id: caseId, probe, pending_blocks: pendingBlocks, downloads, service_workers: serviceWorkers, instrumentPage,
        async gotoBound(page, { navigation_id: navigationId, url = artifactUrl({ case: caseId }), wait_until: waitUntil = 'load', timeout_ms: timeout = 120000 } = {}) { await instrumentPage(page); const id = navigationId || `${caseId}:initial`; if (!NAVIGATION_PATTERN.test(id)) throw fail('navigation_id is not bounded', null, 'navigation'); navigationByFrame.set(page.mainFrame(), id); return bindNavigation(page, await page.goto(url, { waitUntil, timeout }), id, url); },
        async reloadBound(page, { navigation_id: navigationId, wait_until: waitUntil = 'load', timeout_ms: timeout = 120000 } = {}) { await instrumentPage(page); const id = navigationId || `${caseId}:reload:${row.navigation_count + 1}`, target = page.url(); navigationByFrame.set(page.mainFrame(), id); return bindNavigation(page, await page.reload({ waitUntil, timeout }), id, target); },
        async triggerBoundNavigation(page, { navigation_id: navigationId, target_url: targetUrl, trigger, wait_until: waitUntil = 'load', timeout_ms: timeout = 120000 } = {}) { if (typeof trigger !== 'function' || typeof targetUrl !== 'string') throw fail('triggerBoundNavigation requires trigger and target_url', null, 'navigation'); await instrumentPage(page); const id = navigationId || `${caseId}:trigger:${row.navigation_count + 1}`; navigationByFrame.set(page.mainFrame(), id); const [response] = await Promise.all([page.waitForNavigation({ waitUntil, timeout }), trigger()]); return bindNavigation(page, response, id, targetUrl); }
      };
    }
    async function createBoundContext(browser, { case_id: caseId, context_config: requested = {}, probe = false } = {}) {
      if (!browser || browser !== state.browser || !browser.isConnected()) throw fail('bound live browser is required', null, 'context'); if (typeof caseId !== 'string' || !CASE_PATTERN.test(caseId)) throw fail('bounded case_id is required', null, 'context');
      if (!jsonValueClean(requested)) throw fail('context configuration must be bounded JSON data', null, 'context');
      const allowed = new Set(['viewport', 'deviceScaleFactor', 'locale', 'timezoneId', 'colorScheme', 'reducedMotion', 'serviceWorkers', 'acceptDownloads', 'recordVideo']); if (Object.keys(requested).some(key => !allowed.has(key))) throw fail('context configuration has unknown keys', null, 'context');
      if (Object.hasOwn(requested, 'serviceWorkers') && requested.serviceWorkers !== 'block') throw fail('serviceWorkers must be block', null, 'context'); if (Object.hasOwn(requested, 'acceptDownloads') && requested.acceptDownloads !== false) throw fail('acceptDownloads must be false', null, 'context');
      if (Object.hasOwn(requested, 'recordVideo')) validateBoundRecordVideo(requested.recordVideo, commandEnvelope.parsed_args.outdir);
      const effective = deepFreeze({ ...canonicalize(requested), serviceWorkers: 'block', acceptDownloads: false });
      if (!contextConfigClean(effective)) throw fail('effective context configuration is outside the certifying contract', null, 'context');
      const context = await browser.newContext(effective), guard = await configureContext(context, caseId, effective, probe); return { context, guard };
    }
    async function runNetworkPolicyProbe(browser = state.browser) {
      if (!browser || browser !== state.browser) throw fail('bound browser required for probes', null, 'policy_probe');
      if (state.policyProbeReceipts.length === REQUIRED_POLICY_PROBES.length) return envelope.network.policy_probe;
      if (state.policyProbeReceipts.length) throw fail('partial prior policy probe cannot be resumed', { attempted: state.policyProbeReceipts.length }, 'policy_probe');
      const { context, guard } = await createBoundContext(browser, { case_id: 'provenance-policy-probe', context_config: {}, probe: true }), page = await context.newPage(); await guard.instrumentPage(page); await guard.gotoBound(page, { navigation_id: 'provenance-policy-probe:bootstrap', url: artifactUrl({ case: 'provenance-policy-probe' }) });
      async function fetchProbe(name, url, evidenceClass = 'route_abort') { const before = guard.pending_blocks.length; const browserError = await page.evaluate(async target => { try { await fetch(target, { cache: 'no-store', redirect: 'follow' }); return null; } catch (error) { return String(error); } }, url); await new Promise(done => setTimeout(done, 25)); const candidates = guard.pending_blocks.slice(before), routeRow = candidates.find(row => row.url === url || (name === 'encoded_traversal' && row.reason === 'unmanifested_same_origin_path') || (name === 'redirect' && row.url === 'https://example.invalid/pm7-provenance-redirect-target')), redirectServer = name === 'redirect' ? transport.request_ledger.filter(row => row.kind === 'probe_redirect').at(-1) : null; state.policyProbeReceipts.push({ name, evidence_class: evidenceClass, decision: routeRow?.decision === 'block' ? 'blocked' : 'missing', reason: routeRow?.reason || 'no_route_receipt', url, route_sequence: routeRow?.sequence || null, server_sequence: redirectServer?.sequence || null, browser_error: browserError, correlated: routeRow?.correlated === true && (name !== 'redirect' || Boolean(redirectServer)) }); }
      await fetchProbe('cross_origin_http', 'http://example.invalid/pm7-provenance'); await fetchProbe('cross_origin_https', 'https://example.invalid/pm7-provenance'); await fetchProbe('origin_prefix_confusion', `http://127.0.0.1.invalid:${transport.port}${transport.artifact_pathname}`); await fetchProbe('alternate_port', `http://127.0.0.1:${transport.port === 65535 ? 65534 : transport.port + 1}${transport.artifact_pathname}`); await fetchProbe('redirect', transport.probe_redirect_url, 'redirect_follow_route_abort'); await fetchProbe('encoded_traversal', `${transport.origin}/artifact/%2e%2e/escape`);
      for (const [name, url] of [['userinfo_host_confusion', `http://127.0.0.1:${transport.port}@example.invalid${transport.artifact_pathname}`], ['file_url', 'file:///etc/passwd']]) { const before = state.requests.length, browserError = await page.evaluate(async target => { try { await fetch(target); return null; } catch (error) { return String(error); } }, url); await new Promise(done => setTimeout(done, 25)); state.policyProbeReceipts.push({ name, evidence_class: 'browser_pre_request_rejection', decision: browserError && state.requests.length === before ? 'blocked' : 'missing', reason: 'browser_rejected_before_request', url, route_sequence: null, server_sequence: null, browser_error: browserError, correlated: Boolean(browserError) && state.requests.length === before }); }
      async function socketProbe(name, url) { const before = guard.pending_blocks.length; await page.evaluate(target => new Promise(done => { const socket = new WebSocket(target), finish = () => done(); socket.addEventListener('close', finish, { once: true }); socket.addEventListener('error', finish, { once: true }); setTimeout(finish, 2000); }), url); const row = guard.pending_blocks.slice(before).find(entry => entry.reason === 'websocket_not_allowed' && entry.url === url); state.policyProbeReceipts.push({ name, evidence_class: 'websocket_route_close', decision: row?.decision === 'blocked' ? 'blocked' : 'missing', reason: row?.reason || 'no_websocket_receipt', url, route_sequence: row?.sequence || null, server_sequence: null, browser_error: null, correlated: row?.correlated === true }); }
      await socketProbe('websocket', `ws://127.0.0.1:${transport.port}/pm7-provenance`); await socketProbe('websocket_secure', 'wss://example.invalid/pm7-provenance');
      { const url = 'https://example.invalid/pm7-eventsource', before = guard.pending_blocks.length, browserError = await page.evaluate(target => new Promise(done => { const source = new EventSource(target), finish = value => { source.close(); done(value); }; source.onerror = () => finish('eventsource_error'); setTimeout(() => finish('eventsource_timeout'), 2000); }), url), row = guard.pending_blocks.slice(before).find(entry => entry.url === url); state.policyProbeReceipts.push({ name: 'eventsource', evidence_class: 'route_abort', decision: row?.decision === 'block' ? 'blocked' : 'missing', reason: row?.reason || 'no_route_receipt', url, route_sequence: row?.sequence || null, server_sequence: null, browser_error: browserError, correlated: row?.correlated === true }); }
      { const url = `${transport.origin}/__pm_provenance/unmanifested-service-worker.js`, before = guard.pending_blocks.length, browserError = await page.evaluate(async target => { if (!navigator.serviceWorker) return 'service_worker_api_unavailable'; try { await navigator.serviceWorker.register(target); return null; } catch (error) { return String(error); } }, url); await new Promise(done => setTimeout(done, 50)); const row = guard.pending_blocks.slice(before).find(entry => entry.url === url), contained = guard.service_workers.length === 0 && (row?.correlated === true || Boolean(browserError)); state.policyProbeReceipts.push({ name: 'service_worker', evidence_class: 'service_worker_blocked', decision: contained ? 'contained' : 'missing', reason: row?.reason || 'service_workers_blocked_context', url, route_sequence: row?.sequence || null, server_sequence: null, browser_error: browserError, correlated: contained }); }
      { const before = guard.downloads.length; await page.evaluate(target => { const anchor = document.createElement('a'); anchor.href = target; anchor.download = 'pm7-probe.bin'; document.body.append(anchor); anchor.click(); anchor.remove(); }, transport.probe_download_url); await new Promise(done => setTimeout(done, 250)); const observed = guard.downloads.slice(before)[0]; let browserError = null; if (observed) browserError = await observed.download.failure().catch(error => String(error)); const serverRow = transport.request_ledger.filter(row => row.kind === 'probe_download').at(-1), contained = Boolean(observed && serverRow && browserError); state.policyProbeReceipts.push({ name: 'download', evidence_class: 'download_contained', decision: contained ? 'contained' : 'missing', reason: contained ? 'accept_downloads_false_canceled' : 'download_not_contained', url: transport.probe_download_url, route_sequence: null, server_sequence: serverRow?.sequence || null, browser_error: browserError, correlated: contained }); }
      envelope.network.policy_probe.attempted = state.policyProbeReceipts.length; await context.close(); return envelope.network.policy_probe;
    }
    async function finalizeBeforeBrowserClose(browser = state.browser) { if (state.finalizedBeforeClose) return { browser_connected: Boolean(browser?.isConnected()), policy_probe_attempted: state.policyProbeReceipts.length }; if (!browser || browser !== state.browser || !browser.isConnected()) throw fail('bound browser is not connected at pre-close finalization', null, 'finalize_pre_close'); if (!state.policyProbeReceipts.length) await runNetworkPolicyProbe(browser); if (state.policyProbeReceipts.length !== REQUIRED_POLICY_PROBES.length) throw fail('network policy probe denominator incomplete', null, 'finalize_pre_close'); state.finalizedBeforeClose = true; envelope.finalization.state = 'pre_close_complete'; envelope.finalization.pre_close = true; return { browser_connected: true, policy_probe_attempted: state.policyProbeReceipts.length }; }
    async function closeTransport() { try { await transport.close(); } finally { state.transportClosed = transport.isClosed(); envelope.transport.closed = state.transportClosed; } }
    async function finalizeAfterBrowserClose() {
      if (state.finalEnvelope) return state.finalEnvelope;
      const revalidationFailures = []; if (state.browser?.isConnected()) revalidationFailures.push('browser_still_connected'); state.browserClosed = !state.browser?.isConnected();
      for (const [name, binding] of [['artifact', artifact], ['verifier', verifier], ['helper', helper], ['node', nodeDescriptor], ['launch_receipt', launch]]) { try { if (!binding.revalidate()) revalidationFailures.push(`${name}_changed`); } catch (error) { revalidationFailures.push(`${name}_revalidation_error:${String(error.message || error)}`); } }
      try { if (state.playwrightApi) collectLoadedModules(); } catch (error) { revalidationFailures.push(`playwright_loaded_module_revalidation_error:${String(error.message || error)}`); }
      for (const [name, binding] of [['playwright', playwrightTree], ['browser_package', browserTree]]) { try { if (!binding.revalidate()) revalidationFailures.push(`${name}_changed`); } catch (error) { revalidationFailures.push(`${name}_revalidation_error:${String(error.message || error)}`); } }
      try { browserExecutable.revalidate(); envelope.browser.executable_unchanged_after_run = browserExecutable.record.unchanged === true; } catch (error) { revalidationFailures.push(`browser_executable_revalidation_error:${String(error.message || error)}`); }
      try { await closeTransport(); } catch (error) { revalidationFailures.push(`transport_close_error:${String(error.message || error)}`); }
      envelope.transport.integrity_failure = transport.integrityFailure(); envelope.runtime_errors.count = state.runtimeErrors.length; envelope.runtime_errors.samples = state.runtimeErrors.slice(0, 50); envelope.finalization.browser_closed = state.browserClosed; envelope.finalization.transport_closed = state.transportClosed;
      if (revalidationFailures.length) { envelope.finalization.state = 'failed'; envelope.finalization.failed_stage = 'post_close_revalidation'; envelope.finalization.failure = revalidationFailures; } else { envelope.finalization.state = 'complete'; envelope.finalization.failed_stage = null; envelope.finalization.failure = null; }
      const failures = [...new Set([...revalidationFailures, ...provenanceFailures(envelope, { requireEmbeddedAdmission: false })])]; envelope.admission = { pass: !failures.length, failures, envelope_sha256: null }; if (envelope.admission.pass) envelope.admission.envelope_sha256 = sha256(canonicalBytes(envelope));
      if (!envelope.admission.pass) state.failureSink?.record('post_close_admission', fail('provenance admission failed', { failures }, 'admission'), envelope);
      state.finalEnvelope = deepFreeze(envelope); return state.finalEnvelope;
    }
    async function failRun(stage, error) { if (state.finalEnvelope) return state.finalEnvelope; envelope.finalization.state = 'failed'; envelope.finalization.failed_stage = stage; envelope.finalization.failure = [runtimeErrorRecord('run_failure', stage, error)]; try { if (state.browser?.isConnected()) await state.browser.close(); } catch (closeError) { envelope.finalization.failure.push(runtimeErrorRecord('browser_close_failure', stage, closeError)); } state.browserClosed = !state.browser?.isConnected(); envelope.finalization.browser_closed = state.browserClosed; try { await closeTransport(); } catch (closeError) { envelope.finalization.failure.push(runtimeErrorRecord('transport_close_failure', stage, closeError)); } envelope.admission = { pass: false, failures: [`run_failed:${stage}`], envelope_sha256: null }; state.failureSink?.record(stage, error, envelope); state.finalEnvelope = deepFreeze(envelope); return state.finalEnvelope; }
    return { schema_id: 'pm.browser_verifier_provenance_run.v2', artifactUrl, artifactText, loadPlaywright, launchChromium, createBoundContext, runNetworkPolicyProbe, finalizeBeforeBrowserClose, finalizeAfterBrowserClose, fail: failRun, failureSink: sink, envelope };
  } catch (error) { try { sink?.record(error.stage || 'prepare', error); } catch {} throw error; }
}

export const __test = Object.freeze({ canonicalBytes, secureReadPath, descriptorBinding, startImmutableServer, treeManifest, provenanceFailures, fileBindingClean, treeBindingClean, PROBE_CLASSES, SCHEMA_ID, SCHEMA_VERSION });
