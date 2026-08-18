from __future__ import annotations
import base64 as _base64
import hashlib as _hashlib
import json as _json
import os as _os
import pathlib as _pathlib
import re as _re
import stat as _stat
import subprocess as _subprocess
import sys as _sys
from typing import Any as _Any
_sys.dont_write_bytecode = True
__all__ = ['verify']
_FILES = {'semantic_bundle.json': ('IMMUTABLE_SEMANTIC_BUNDLE', 900000), 'runner.py': ('PROCESS_RUNNER', 60000), 'evidence_recorder.py': ('APPEND_ONLY_EVIDENCE_RECORDER', 40000), 'offline_verifier.py': ('OFFLINE_VERIFIER', 95000)}
_ROLES = ('APPEND_ONLY_EVIDENCE_RECORDER', 'IMMUTABLE_SEMANTIC_BUNDLE', 'OFFLINE_VERIFIER', 'PROCESS_RUNNER')
_ROUTES = [{'slot': 'slot-alpha', 'model': 'gpt-5.4-mini', 'reasoning_effort': 'xhigh'}, {'slot': 'slot-bravo', 'model': 'gpt-5.4-mini', 'reasoning_effort': 'medium'}, {'slot': 'slot-charlie', 'model': 'gpt-5.6-luna', 'reasoning_effort': 'medium'}]
_SHARED = [{'bytes': 7024, 'role': 'OPERATING_CONTRACT', 'sha256': '764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd', 'successor_root_relative_path': 'r9_goal_operating_contract_v1.json'}, {'bytes': 5909, 'role': 'SUBJECT_TRANSPORT_ADDENDUM', 'sha256': '7b5186b3c9f244488a75695b34b0d06e79ee6b720acb934fc3767315c4b005d8', 'successor_root_relative_path': 'r9_subject_transport_addendum_subagent_invocations_v1.json'}, {'bytes': 4780, 'role': 'ROUTE_CAPABILITY_RECEIPT', 'sha256': '3d523eac087e691b2336a6ab878dbfe64b8359891831dc866641039f97f8646a', 'successor_root_relative_path': 'r9_subject_transport_subagent_route_capability_receipt_v1.json'}]
_INSTRUCTION = b'TEST-TAKER TRANSPORT: Answer the frozen packet below directly in your first final response. Do not use tools, files, browsing, network, memory, delegation, or other agents.\n\n'
_TOP_FIELDS = set('schema_id role format lineage shared_authorities routes cells stage_order deterministic_stages schedule transport evidence_contract synthetic_scenarios regressions counterfactuals nonclaims'.split())
_RUN_FIELDS = set('schema_id run_id run_kind mode scenario created_utc component_identity component_provenance shared_authorities routes schedule route_count cells_per_route cell_count planned_call_count stage_count required_clean_stage_artifact_count regression_family_count regression_variant_count global_fault_count semantic_counterfactual_count retry_count best_of replacement_count custody'.split())
_ROW_FIELDS = set('row_id ordinal slot cell index nonce invocation_id task_name expected_canonical_task_path'.split())
_ATTEMPT_FIELDS = set('schema_id run_id run_kind mode row_id slot cell index ordinal nonce invocation_id task_name expected_canonical_task_path agent_type fork_turns model reasoning_effort causal_inputs packet_sha256 packet_bytes message_sha256 message_bytes attempt retry_count best_of replacement_result no_retry no_relaunch admission_state'.split())
_SPAWN_REQUEST_FIELDS = set('schema_id run_id run_kind mode slot cell index ordinal nonce invocation_id task_name expected_canonical_task_path agent_type fork_turns model reasoning_effort packet_sha256 packet_bytes message_utf8 message_sha256 message_bytes attempt_sha256 attempt_bytes'.split())
_SPAWN_EVENT_FIELDS = {'schema_id', 'invocation_id', 'spawn_request_sha256', 'tool_result', 'returned_identity_kind', 'returned_canonical_task_path'}
_TERMINAL_EVENT_FIELDS = {'schema_id', 'invocation_id', 'returned_canonical_task_path', 'message_type', 'final_utf8', 'observed_activity', 'terminal_status'}
_FAILURE_FIELDS = {'schema_id', 'invocation_id', 'phase', 'failure_type', 'detail'}
_ACTIVITY_FIELDS = {'tool_calls', 'file_accesses', 'browsing', 'network_accesses', 'delegations', 'memory_accesses', 'followup_turns', 'nonterminal_messages', 'observation_basis'}
_STAGE_FIELDS = set('schema_id run_id slot stage index rule finalization_row_id finalization_ordinal causal_inputs artifact_payload_utf8 artifact_payload_sha256 artifact_payload_bytes artifact_storage_sha256 artifact_storage_bytes'.split())
_COMPLETE_FILES = {'provider_input.txt', 'spawn_message.txt', 'attempt.json', 'spawn_receipt.json', 'raw_result.json', 'completion.json'}
_SPAWN_PREFIX = {'provider_input.txt', 'spawn_message.txt', 'attempt.json', 'spawn_receipt.json'}
_TERMINAL_PREFIX = _SPAWN_PREFIX | {'raw_result.json'}
_SAFE = _re.compile('[A-Za-z0-9][A-Za-z0-9_.-]{0,191}\\Z')
_HEX = _re.compile('[0-9a-f]{64}\\Z')
_TOKEN = _re.compile('[A-Z][A-Z0-9_]{0,127}\\Z')
_CANDIDATE = _re.compile('formal_candidate_v[1-9][0-9]*\\Z')
_ROOT_EOF_DETAIL = _re.compile('ROOT_EOF_INVALID:_Invalid:trailing root bytes:[1-9][0-9]*:[0-9a-f]{64}\\Z')
_MAX_EVENT = 4 * 1024 * 1024
_CONTROL_PROJECTIONS = {'cell_dependencies': (24047, '06f5f58c7962b8340f429df55a6791f11d8a70217b8cea9add103c2e0df417a8'), 'stage_control': (6014, '10455dbd60188fd820ec50cf58e229aecdf804141da315ae08bc49ff98791a17'), 'regression_control': (78600, 'a3fb8d6607723a60b5e589da12fd9ef9feac86ac5a8d877e9da2a73d0dea4cf9'), 'transport_evidence_control': (15835, '94ac984dc25ae88d344ad1eaa8b6b141c3efbfbc9b2a35b071d60aa718a85726'), 'synthetic_scenarios': (2153, '54c536041f95ad601cb3ae39c311adf324d820a0de7ed53a8d7a9973f38c921c'), 'counterfactuals': (8248, '5d10f27e09e802b4a19f69f4465d657eabcdf12d8fde095b1e0e1aaae554fb8e'), 'payload_identities': (44358, 'c195b34bba0dd021d656bf321e031961515ad2483f15c4698f7870cf571b5a69')}
_CHECKS = ('component_bootstrap', 'shared_authorities', 'semantic_bundle', 'expected_interface', 'run_manifest', 'component_equivalence', 'present_custody', 'exact_inventory', 'row_chains', 'causal_dependency_gates', 'provider_bytes', 'transport_captures', 'deterministic_scores', 'stage_artifacts', 'schedule_and_stop_rules', 'path_terminals', 'matrix_terminal', 'accounting', 'global_freshness')

class _Invalid(RuntimeError):

	def __init__(self, code, detail):
		super().__init__(detail)
		self.code = code
		self.detail = detail

def _fail(code, detail):
	raise _Invalid(code, detail)

def _sha(data):
	return _hashlib.sha256(data).hexdigest()

def _canon(value):
	try:
		return _json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
	except (TypeError, ValueError, UnicodeEncodeError) as exc:
		_fail('NOT_CANONICAL_JSONABLE', str(exc))

def _same(left, right):
	return _canon(left) == _canon(right)

def _projection(name, value):
	encoded = _canon(value)
	if (len(encoded), _sha(encoded)) != _CONTROL_PROJECTIONS[name]:
		_fail('SEMANTIC_CONTROL_PROJECTION_DRIFT', name)

def _ordered(value):
	try:
		return _json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(',', ':')).encode('utf-8')
	except (TypeError, ValueError, UnicodeEncodeError) as exc:
		_fail('NOT_ORDERED_JSONABLE', str(exc))

def _pairs(items):
	result = {}
	for key, value in items:
		if key in result:
			_fail('DUPLICATE_JSON_KEY', key)
		result[key] = value
	return result

def _constant(value):
	_fail('NONFINITE_JSON_NUMBER', value)

def _exact(value, keys, label):
	if not isinstance(value, dict):
		_fail('OBJECT_REQUIRED', label)
	if set(value) != keys:
		_fail('OBJECT_SHAPE_MISMATCH', f'{label}: missing={sorted(keys - set(value))}, extra={sorted(set(value) - keys)}')
	return value

def _integer(value, label, minimum=0):
	if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
		_fail('INTEGER_REQUIRED', f'{label}: minimum {minimum}')
	return value

def _text(value, label, nonempty=True):
	if not isinstance(value, str) or (nonempty and (not value)):
		_fail('STRING_REQUIRED', label)
	try:
		value.encode('utf-8')
	except UnicodeEncodeError as exc:
		_fail('INVALID_UTF8_STRING', f'{label}: {exc}')
	return value

def _name(value, label):
	text = _text(value, label)
	if not _SAFE.fullmatch(text) or text in {'.', '..'}:
		_fail('UNSAFE_NAME', label)
	return text

def _safe_relative(value, label):
	text = _text(value, label)
	if '\\' in text:
		_fail('UNSAFE_RELATIVE_PATH', label)
	pure = _pathlib.PurePosixPath(text)
	if pure.is_absolute() or pure.as_posix() != text or any((part in {'', '.', '..'} for part in pure.parts)):
		_fail('UNSAFE_RELATIVE_PATH', label)
	return pure

def _lexical_absolute(value, label):
	if not _os.path.isabs(value):
		_fail('ABSOLUTE_PATH_REQUIRED', label)
	if _os.path.normpath(value) != value:
		_fail('NONCANONICAL_LEXICAL_PATH', label)
	parts = value.split(_os.sep)[1:]
	if any((part in {'', '.', '..'} for part in parts)):
		_fail('UNSAFE_LEXICAL_PATH', label)
	return value

def _no_symlink_ancestors(path, label):
	_lexical_absolute(path, label)
	current = _os.sep
	for part in path.split(_os.sep)[1:]:
		current = _os.path.join(current, part)
		try:
			info = _os.lstat(current)
		except FileNotFoundError:
			continue
		except OSError as exc:
			_fail('PATH_READ_ERROR', f'{label}: {exc}')
		if _stat.S_ISLNK(info.st_mode):
			_fail('SYMLINK_ANCESTOR', f'{label}: {current}')

def _lstat(path, label):
	try:
		return _os.lstat(path)
	except (FileNotFoundError, NotADirectoryError):
		_fail('MISSING_PATH', f'{label}: {path}')
	except OSError as exc:
		_fail('PATH_READ_ERROR', f'{label}: {exc}')
	raise AssertionError('unreachable')

def _directory(path, label):
	info = _lstat(path, label)
	if _stat.S_ISLNK(info.st_mode) or not _stat.S_ISDIR(info.st_mode):
		_fail('NONLINK_DIRECTORY_REQUIRED', f'{label}: {path}')

def _read_file(path, label, *, evidence=False):
	before = _lstat(path, label)
	if _stat.S_ISLNK(before.st_mode) or not _stat.S_ISREG(before.st_mode):
		_fail('REGULAR_NONLINK_REQUIRED', f'{label}: {path}')
	if evidence and _stat.S_IMODE(before.st_mode) != 292:
		_fail('EVIDENCE_MODE_MISMATCH', f'{label}: expected 0444')
	flags = _os.O_RDONLY | getattr(_os, 'O_NOFOLLOW', 0)
	try:
		descriptor = _os.open(path, flags)
	except OSError as exc:
		_fail('FILE_OPEN_ERROR', f'{label}: {exc}')
	parts = []
	try:
		opened = _os.fstat(descriptor)
		if not _stat.S_ISREG(opened.st_mode) or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
			_fail('REOPEN_IDENTITY_MISMATCH', label)
		while True:
			chunk = _os.read(descriptor, 1024 * 1024)
			if not chunk:
				break
			parts.append(chunk)
	except OSError as exc:
		_fail('FILE_READ_ERROR', f'{label}: {exc}')
	finally:
		_os.close(descriptor)
	data = b''.join(parts)
	after = _lstat(path, label)
	if _stat.S_ISLNK(after.st_mode) or not _stat.S_ISREG(after.st_mode) or (after.st_dev, after.st_ino, after.st_size) != (before.st_dev, before.st_ino, before.st_size) or (len(data) != before.st_size):
		_fail('FILE_CHANGED_DURING_REOPEN', label)
	return data

def _entries(path, label):
	_directory(path, label)
	result = {}
	try:
		rows = list(_os.scandir(path))
	except OSError as exc:
		_fail('DIRECTORY_READ_ERROR', f'{label}: {exc}')
	for row in rows:
		if row.name in result:
			_fail('DUPLICATE_DIRECTORY_ENTRY', f'{label}: {row.name}')
		try:
			if row.is_symlink():
				_fail('SYMLINK_FORBIDDEN', f'{label}: {row.name}')
			if row.is_dir(follow_symlinks=False):
				result[row.name] = True
			elif row.is_file(follow_symlinks=False):
				result[row.name] = False
			else:
				_fail('SPECIAL_PATH_FORBIDDEN', f'{label}: {row.name}')
		except OSError as exc:
			_fail('PATH_READ_ERROR', f'{label}/{row.name}: {exc}')
	return result

def _load_object_bytes(storage, label, *, terminal_lf):
	payload = storage
	if terminal_lf:
		if not storage.endswith(b'\n') or storage.endswith(b'\n\n') or b'\r' in storage:
			_fail('JSON_STORAGE_FORMAT', f'{label}: exactly one terminal LF and no CR')
		payload = storage[:-1]
	elif b'\r' in storage or storage.endswith(b'\n'):
		_fail('JSON_PAYLOAD_FORMAT', f'{label}: no CR or terminal LF')
	try:
		value = _json.loads(payload.decode('utf-8'), object_pairs_hook=_pairs, parse_constant=_constant)
	except (UnicodeDecodeError, _json.JSONDecodeError) as exc:
		_fail('INVALID_JSON', f'{label}: {exc}')
	if not isinstance(value, dict):
		_fail('JSON_OBJECT_REQUIRED', label)
	if _canon(value) != payload:
		_fail('NONCANONICAL_JSON', label)
	return value

def _json_file(path, label, *, evidence=True):
	storage = _read_file(path, label, evidence=evidence)
	return (storage, _load_object_bytes(storage, label, terminal_lf=True))

def _component_identity(parts, label='component identity'):
	value = _exact(parts, {'schema_id', 'part_count', 'aggregate_file_bytes', 'rows_sha256', 'rows_bytes', 'parts'}, label)
	rows = value.get('parts')
	if value.get('schema_id') != 'pw-r9-four-part-component-identity-v1':
		_fail('COMPONENT_IDENTITY_SCHEMA', label)
	if not _same(_integer(value.get('part_count'), f'{label}.part_count', 1), 4) or not isinstance(rows, list) or len(rows) != 4:
		_fail('COMPONENT_IDENTITY_CARDINALITY', label)
	normalized = []
	for role, raw in zip(_ROLES, rows):
		row = _exact(raw, {'role', 'sha256', 'bytes'}, f'{label}.{role}')
		digest = row.get('sha256')
		if row.get('role') != role or not isinstance(digest, str) or (not _HEX.fullmatch(digest)):
			_fail('COMPONENT_PART_IDENTITY', role)
		_integer(row.get('bytes'), f'{label}.{role}.bytes', 1)
		normalized.append(dict(row))
	encoded = _canon(normalized)
	if not _same(_integer(value.get('aggregate_file_bytes'), f'{label}.aggregate_file_bytes', 1), sum((row['bytes'] for row in normalized))) or value.get('rows_sha256') != _sha(encoded) or (not _same(_integer(value.get('rows_bytes'), f'{label}.rows_bytes', 1), len(encoded))):
		_fail('COMPONENT_AGGREGATE_IDENTITY', label)
	return value

def _bootstrap():
	source = __file__ if _os.path.isabs(__file__) else _os.path.join(_os.getcwd(), __file__)
	source = _lexical_absolute(source, 'verifier source')
	root_text = _os.path.dirname(source)
	_no_symlink_ancestors(root_text, 'component root')
	root = _pathlib.Path(root_text)
	parent = root.parent
	leaf = root.name
	if parent.name != 'r9_control_plane_stabilization_v1' or not (leaf == 'iteration_011' or _CANDIDATE.fullmatch(leaf)):
		_fail('COMPONENT_ROOT_LAYOUT', root_text)
	_directory(root, 'component root')
	inventory = _entries(root, 'component root')
	if inventory != {name: False for name in _FILES}:
		_fail('COMPONENT_INVENTORY', str(sorted(inventory.items())))
	storages = {}
	for name, (_, maximum) in _FILES.items():
		storage = _read_file(root / name, f'component {name}')
		if not storage or len(storage) > maximum:
			_fail('COMPONENT_BYTE_CEILING', f'{name}: {len(storage)} > {maximum}')
		storages[name] = storage
	by_role = {role: storages[name] for name, (role, _) in _FILES.items()}
	parts = [{'role': role, 'sha256': _sha(by_role[role]), 'bytes': len(by_role[role])} for role in _ROLES]
	rows = _canon(parts)
	identity = {'schema_id': 'pw-r9-four-part-component-identity-v1', 'part_count': 4, 'aggregate_file_bytes': sum((item['bytes'] for item in parts)), 'rows_sha256': _sha(rows), 'rows_bytes': len(rows), 'parts': parts}
	_component_identity(identity)
	return (root, parent.parent, storages, identity)

def _shared_authorities(successor):
	storages = {}
	for declaration in _SHARED:
		relative = declaration['successor_root_relative_path']
		pure = _safe_relative(relative, f"shared authority {declaration['role']}")
		path = successor.joinpath(*pure.parts)
		_no_symlink_ancestors(str(path), f"shared authority {declaration['role']}")
		first = _read_file(path, f"shared authority {declaration['role']}")
		second = _read_file(path, f"shared authority {declaration['role']} reopen")
		if first != second or (_sha(first), len(first)) != (declaration['sha256'], declaration['bytes']):
			_fail('SHARED_AUTHORITY_DRIFT', declaration['role'])
		storages[declaration['role']] = first
	return ([dict(item) for item in _SHARED], storages)

def _projection_observed(value):
	projection = _exact(value, {'source_supported_candidate', 'supported_claims', 'apparent_discrepancies', 'source_bindings', 'predecessor_outputs'}, 'counterfactual provider projection')
	claims = projection['supported_claims']
	bindings = projection['source_bindings']
	discrepancies = projection['apparent_discrepancies']
	if not isinstance(claims, list) or len(claims) < 2 or (not isinstance(bindings, list)) or (not isinstance(discrepancies, list)):
		_fail('COUNTERFACTUAL_PROJECTION_SHAPE', 'claim, binding, or discrepancy list')
	binding_ids = set()
	for raw in bindings:
		binding = _exact(raw, {'authority', 'source_record_id'}, 'counterfactual source binding')
		source_id = _name(binding.get('source_record_id'), 'counterfactual source id')
		_text(binding.get('authority'), 'counterfactual source authority')
		if source_id in binding_ids:
			_fail('COUNTERFACTUAL_SOURCE_DUPLICATE', source_id)
		binding_ids.add(source_id)
	claim_by_id = {}
	for raw in claims:
		claim = _exact(raw, {'claim_id', 'predicate', 'source_record_ids', 'value'}, 'counterfactual claim')
		claim_id = _name(claim.get('claim_id'), 'counterfactual claim id')
		sources = claim.get('source_record_ids')
		if claim_id in claim_by_id or not isinstance(sources, list) or (not sources):
			_fail('COUNTERFACTUAL_CLAIM_SHAPE', claim_id)
		source_ids = [_name(item, 'counterfactual claim source') for item in sources]
		if len(source_ids) != len(set(source_ids)) or not set(source_ids).issubset(binding_ids):
			_fail('COUNTERFACTUAL_CLAIM_SOURCE', claim_id)
		_text(claim.get('predicate'), 'counterfactual predicate')
		claim_value = claim.get('value')
		if isinstance(claim_value, bool) or not isinstance(claim_value, (str, int)):
			_fail('COUNTERFACTUAL_CLAIM_VALUE', claim_id)
		claim_by_id[claim_id] = claim
	candidate = _exact(projection['source_supported_candidate'], {'claim_ids', 'discrepancy_ids'}, 'counterfactual candidate')
	candidate_claims = candidate.get('claim_ids')
	candidate_discrepancies = candidate.get('discrepancy_ids')
	if not isinstance(candidate_claims, list) or len(candidate_claims) != len(set(candidate_claims)) or set(candidate_claims) != set(claim_by_id):
		_fail('COUNTERFACTUAL_CANDIDATE_CLAIMS', 'claim closure')
	discrepancy_by_id = {}
	pairs = set()
	for raw in discrepancies:
		discrepancy = _exact(raw, {'claim_ids', 'discrepancy_id', 'kind'}, 'counterfactual discrepancy')
		discrepancy_id = _name(discrepancy.get('discrepancy_id'), 'counterfactual discrepancy id')
		ids = discrepancy.get('claim_ids')
		if discrepancy_id in discrepancy_by_id or not isinstance(ids, list) or len(ids) != 2 or (len(set(ids)) != 2) or (not set(ids).issubset(claim_by_id)):
			_fail('COUNTERFACTUAL_DISCREPANCY_SHAPE', discrepancy_id)
		pair = frozenset(ids)
		left, right = (claim_by_id[item] for item in ids)
		if pair in pairs or discrepancy.get('kind') not in {'VALUE_CONFLICT', 'AUTHORITY_SCOPE_OVERLAP'} or left['predicate'] != right['predicate'] or _same(left['value'], right['value']):
			_fail('COUNTERFACTUAL_DISCREPANCY_INVALID', discrepancy_id)
		pairs.add(pair)
		discrepancy_by_id[discrepancy_id] = discrepancy
	claim_ids = list(claim_by_id)
	expected_pairs = {frozenset((left, right)) for index, left in enumerate(claim_ids) for right in claim_ids[index + 1:] if claim_by_id[left]['predicate'] == claim_by_id[right]['predicate'] and (not _same(claim_by_id[left]['value'], claim_by_id[right]['value']))}
	if pairs != expected_pairs or not isinstance(candidate_discrepancies, list) or len(candidate_discrepancies) != len(set(candidate_discrepancies)) or (set(candidate_discrepancies) != set(discrepancy_by_id)):
		_fail('COUNTERFACTUAL_DISCREPANCY_CLOSURE', 'complete unequal-value pairs')
	predecessors = _exact(projection['predecessor_outputs'], {'decisions'}, 'counterfactual predecessors')
	decisions = predecessors.get('decisions')
	if not isinstance(decisions, list):
		_fail('COUNTERFACTUAL_DECISION_LIST', 'decisions')
	by_discrepancy = {}
	decision_ids = set()
	edges = {item: set() for item in claim_by_id}
	unresolved = False
	for raw in decisions:
		if not isinstance(raw, dict):
			_fail('COUNTERFACTUAL_DECISION_SHAPE', 'object')
		kind = raw.get('decision')
		common = {'decision', 'decision_id', 'discrepancy_id'}
		keys = common | ({'selected_claim_id', 'superseded_claim_ids'} if kind == 'select_current_and_supersede_other' else {'claim_ids'})
		decision = _exact(raw, keys, 'counterfactual decision')
		if kind not in {'select_current_and_supersede_other', 'preserve_unresolved_conflict', 'preserve_distinct_authorities'}:
			_fail('COUNTERFACTUAL_DECISION_KIND', str(kind))
		decision_id = _name(decision.get('decision_id'), 'counterfactual decision id')
		discrepancy_id = _name(decision.get('discrepancy_id'), 'counterfactual decision discrepancy')
		if decision_id in decision_ids or discrepancy_id in by_discrepancy or discrepancy_id not in discrepancy_by_id:
			_fail('COUNTERFACTUAL_DECISION_BINDING', decision_id)
		decision_ids.add(decision_id)
		by_discrepancy[discrepancy_id] = decision
		discrepancy = discrepancy_by_id[discrepancy_id]
		ids = set(discrepancy['claim_ids'])
		if kind == 'select_current_and_supersede_other':
			selected = decision.get('selected_claim_id')
			superseded = decision.get('superseded_claim_ids')
			if discrepancy['kind'] != 'VALUE_CONFLICT' or selected not in ids or (not isinstance(superseded, list)) or (len(superseded) != len(set(superseded))) or ({selected, *superseded} != ids) or (selected in superseded):
				_fail('COUNTERFACTUAL_SELECTION_BINDING', decision_id)
			for old in superseded:
				edges[old].add(selected)
		else:
			listed = decision.get('claim_ids')
			wanted_kind = 'VALUE_CONFLICT' if kind == 'preserve_unresolved_conflict' else 'AUTHORITY_SCOPE_OVERLAP'
			if not isinstance(listed, list) or len(listed) != len(set(listed)) or set(listed) != ids or (discrepancy['kind'] != wanted_kind):
				_fail('COUNTERFACTUAL_PRESERVATION_BINDING', decision_id)
			unresolved = True
	visiting = set()
	visited = set()

	def visit(node):
		if node in visiting:
			_fail('COUNTERFACTUAL_SUPERSESSION_CYCLE', node)
		if node not in visited:
			visiting.add(node)
			for successor in edges[node]:
				visit(successor)
			visiting.remove(node)
			visited.add(node)
	for claim_id in edges:
		visit(claim_id)
	return unresolved or any((item not in by_discrepancy for item in discrepancy_by_id))

def _counterfactual_checks(corpus, contract):
	if not isinstance(corpus, list) or len(corpus) != 7:
		_fail('SEMANTIC_COUNTERFACTUAL_CARDINALITY', '6 plus 1')
	encoded_projections = []
	fixture_ids = []
	observed_results = []
	for raw in corpus[:6]:
		item = _exact(raw, {'id', 'evaluation_authority', 'case'}, 'counterfactual item')
		if item.get('evaluation_authority') != 'INDEPENDENT_CODE_EVALUATOR_ONLY':
			_fail('COUNTERFACTUAL_AUTHORITY', str(item.get('id')))
		case = _exact(item.get('case'), {'fixture_id', 'provider_projection', 'expected', 'canonical_projection'}, 'counterfactual case')
		projection = case.get('provider_projection')
		encoded = _canon(projection)
		identity = {'encoding': 'UTF-8 canonical minified JSON without terminal LF', 'sha256': _sha(encoded), 'bytes': len(encoded)}
		if not _same(case.get('canonical_projection'), identity):
			_fail('COUNTERFACTUAL_PROJECTION_IDENTITY', str(item.get('id')))
		observed = _projection_observed(projection)
		expected = case.get('expected')
		if not isinstance(expected, bool) or observed is not expected:
			_fail('COUNTERFACTUAL_EXPECTED_RESULT', str(item.get('id')))
		observed_results.append(observed)
		encoded_projections.append(encoded)
		fixture_ids.append(_name(case.get('fixture_id'), 'counterfactual fixture id'))
	if not _same(observed_results, [False, False, False, True, True, True]):
		_fail('COUNTERFACTUAL_OBSERVATION_VECTOR', str(observed_results))
	leakage_item = _exact(corpus[6], {'id', 'evaluation_authority', 'leakage_case'}, 'counterfactual leakage item')
	if leakage_item.get('evaluation_authority') != 'INDEPENDENT_CODE_EVALUATOR_ONLY':
		_fail('COUNTERFACTUAL_AUTHORITY', str(leakage_item.get('id')))
	leakage = _exact(leakage_item.get('leakage_case'), {'fixture_id', 'forbidden_keys', 'forbidden_tokens', 'projection_refs', 'scan_encoding'}, 'counterfactual leakage case')
	refs = [{'fixture_id': fixture, 'sha256': _sha(data), 'bytes': len(data)} for fixture, data in zip(fixture_ids, encoded_projections)]
	forbidden_keys = leakage.get('forbidden_keys')
	forbidden_tokens = leakage.get('forbidden_tokens')
	if not _same(leakage.get('projection_refs'), refs) or not _same(forbidden_keys, contract.get('provider_projection_forbidden_recursive_keys')) or (not isinstance(forbidden_tokens, list)):
		_fail('COUNTERFACTUAL_LEAKAGE_BINDING', 'refs or forbidden corpus')
	for encoded in encoded_projections:
		for key in forbidden_keys:
			if _json.dumps(_text(key, 'counterfactual forbidden key'), ensure_ascii=False).encode('utf-8') + b':' in encoded:
				_fail('COUNTERFACTUAL_KEY_LEAKAGE', key)
		for token in forbidden_tokens:
			if _text(token, 'counterfactual forbidden token').encode('utf-8') in encoded:
				_fail('COUNTERFACTUAL_TOKEN_LEAKAGE', token)
	for injected_key in ('expected', 'result', 'observed_result'):
		adverse = dict(corpus[0]['case']['provider_projection'])
		adverse[injected_key] = False
		try:
			_projection_observed(adverse)
		except _Invalid:
			pass
		else:
			_fail('COUNTERFACTUAL_SELF_ATTESTATION_ADMITTED', injected_key)
	if not _same(contract.get('ordered_fixture_ids'), fixture_ids + [_name(leakage.get('fixture_id'), 'leakage fixture id')]):
		_fail('COUNTERFACTUAL_FIXTURE_ORDER', 'ordered fixture IDs')

def _validate_semantic(storage, identity, shared):
	bundle = _load_object_bytes(storage, 'semantic bundle', terminal_lf=True)
	if set(bundle) != _TOP_FIELDS:
		_fail('SEMANTIC_TOP_SHAPE', str(sorted(bundle)))
	if bundle.get('schema_id') != 'pw-r9-immutable-semantic-bundle-v1' or bundle.get('role') != 'IMMUTABLE_SEMANTIC_BUNDLE' or (not _same(bundle.get('shared_authorities'), shared)) or (not _same(bundle.get('routes'), _ROUTES)):
		_fail('SEMANTIC_FIXED_BINDING', 'schema, role, routes, or shared authorities')
	format_value = _exact(bundle.get('format'), {'canonical_serialization', 'internal_reference_kinds', 'oracle_storage', 'top_level_field_count'}, 'semantic format')
	if not _same(format_value.get('top_level_field_count'), 16) or not _same(format_value.get('internal_reference_kinds'), ['stable ID', 'JSON pointer', 'role', 'sha256', 'bytes']):
		_fail('SEMANTIC_FORMAT_CONTRACT', 'format')
	cells = bundle.get('cells')
	cell_fields = set('cell dependency_gate expected_output expected_output_bytes expected_output_sha256 expected_output_storage_bytes expected_output_storage_sha256 expected_output_utf8 index render_utf8 render_utf8_bytes render_utf8_sha256'.split())
	if not isinstance(cells, list) or len(cells) != 97:
		_fail('SEMANTIC_CELL_CARDINALITY', str(type(cells).__name__))
	cell_by_id = {}
	for index, raw in enumerate(cells):
		cell = _exact(raw, cell_fields, f'semantic cell {index}')
		cell_id = _name(cell.get('cell'), f'semantic cell {index}.cell')
		if cell_id in cell_by_id or cell.get('index') != index:
			_fail('SEMANTIC_CELL_ORDER', cell_id)
		packet = _text(cell.get('render_utf8'), f'cell {cell_id}.render').encode('utf-8')
		if not packet.endswith(b'\n') or packet.endswith(b'\n\n') or b'\r' in packet or (not _same([cell.get('render_utf8_sha256'), cell.get('render_utf8_bytes')], [_sha(packet), len(packet)])):
			_fail('SEMANTIC_RENDER_IDENTITY', cell_id)
		oracle = _text(cell.get('expected_output_utf8'), f'cell {cell_id}.oracle').encode('utf-8')
		try:
			oracle_value = _json.loads(oracle.decode('utf-8'), object_pairs_hook=_pairs, parse_constant=_constant)
		except (UnicodeDecodeError, _json.JSONDecodeError) as exc:
			_fail('SEMANTIC_ORACLE_JSON', f'{cell_id}: {exc}')
		if _ordered(oracle_value) != oracle or not _same(oracle_value, cell.get('expected_output')) or (not _same([cell.get('expected_output_sha256'), cell.get('expected_output_bytes')], [_sha(oracle), len(oracle)])) or (not _same([cell.get('expected_output_storage_sha256'), cell.get('expected_output_storage_bytes')], [_sha(oracle + b'\n'), len(oracle) + 1])):
			_fail('SEMANTIC_ORACLE_IDENTITY', cell_id)
		gate = _exact(cell.get('dependency_gate'), {'rule', 'required_pass_cells', 'required_stage_artifacts'}, f'cell {cell_id}.dependency_gate')
		if gate.get('rule') != 'pw-r9-exact-input-frozen-artifact-v1':
			_fail('SEMANTIC_GATE_RULE', cell_id)
		for key in ('required_pass_cells', 'required_stage_artifacts'):
			values = gate.get(key)
			if not isinstance(values, list) or len(values) != len(set(values)) or any((not isinstance(item, str) for item in values)):
				_fail('SEMANTIC_GATE_LIST', f'{cell_id}:{key}')
		cell_by_id[cell_id] = cell
	schedule = bundle.get('schedule')
	if not isinstance(schedule, list) or len(schedule) != 291:
		_fail('SEMANTIC_SCHEDULE_CARDINALITY', str(type(schedule).__name__))
	for index, row in enumerate(schedule):
		route_index, cell_index = divmod(index, 97)
		expected_row = {'index': index, 'route_index': route_index, 'route_ref': f'/routes/{route_index}', 'cell_index': cell_index, 'cell_ref': f'/cells/{cell_index}'}
		if not _same(row, expected_row):
			_fail('SEMANTIC_SCHEDULE_ORDER', str(index))
	stage_order = bundle.get('stage_order')
	stages = bundle.get('deterministic_stages')
	stage_fields = set('direct_subject_cells expected_artifact expected_artifact_bytes expected_artifact_sha256 expected_artifact_storage_bytes expected_artifact_storage_sha256 expected_artifact_utf8 finalization_boundary index predecessor_stages route_local_artifacts rule stage'.split())
	if not isinstance(stage_order, list) or len(stage_order) != 18 or len(set(stage_order)) != 18 or (not isinstance(stages, list)) or (len(stages) != 18):
		_fail('SEMANTIC_STAGE_CARDINALITY', 'stage order or stages')
	stage_by_id = {}
	for index, raw in enumerate(stages):
		stage = _exact(raw, stage_fields, f'semantic stage {index}')
		stage_id = _name(stage.get('stage'), f'semantic stage {index}.stage')
		if stage.get('index') != index or stage_id != stage_order[index] or stage.get('rule') != 'pw-r9-exact-input-frozen-artifact-v1':
			_fail('SEMANTIC_STAGE_ORDER', stage_id)
		payload = _text(stage.get('expected_artifact_utf8'), f'stage {stage_id}.payload').encode('utf-8')
		try:
			payload_value = _json.loads(payload.decode('utf-8'), object_pairs_hook=_pairs, parse_constant=_constant)
		except (UnicodeDecodeError, _json.JSONDecodeError) as exc:
			_fail('SEMANTIC_STAGE_PAYLOAD_JSON', f'{stage_id}: {exc}')
		if not isinstance(payload_value, dict) or _ordered(payload_value) != payload or (not _same(payload_value, stage.get('expected_artifact'))) or (not _same([stage.get('expected_artifact_sha256'), stage.get('expected_artifact_bytes')], [_sha(payload), len(payload)])) or (not _same([stage.get('expected_artifact_storage_sha256'), stage.get('expected_artifact_storage_bytes')], [_sha(payload + b'\n'), len(payload) + 1])):
			_fail('SEMANTIC_STAGE_PAYLOAD_IDENTITY', stage_id)
		predecessors = stage.get('predecessor_stages')
		direct = stage.get('direct_subject_cells')
		if not isinstance(predecessors, list) or len(predecessors) != len(set(predecessors)) or any((item not in stage_order[:index] for item in predecessors)) or (not isinstance(direct, list)) or (len(direct) != len(set(direct))) or any((item not in cell_by_id for item in direct)) or (not predecessors and (not direct)):
			_fail('SEMANTIC_STAGE_DEPENDENCY', stage_id)
		boundary = _exact(stage.get('finalization_boundary'), {'after_cell_index', 'after_cell', 'stage_order_index'}, f'stage {stage_id}.boundary')
		after = _integer(boundary.get('after_cell_index'), f'stage {stage_id}.boundary')
		if after >= 97 or boundary.get('after_cell') != cells[after]['cell'] or boundary.get('stage_order_index') != index or any((cell_by_id[item]['index'] > after for item in direct)):
			_fail('SEMANTIC_STAGE_BOUNDARY', stage_id)
		expected_local = [{'artifact_id': f"{route['slot']}:{stage_id}", 'artifact_oracle_ref': f'/deterministic_stages/{index}/expected_artifact_utf8', 'route_ref': f'/routes/{route_index}', 'stage_ref': f'/deterministic_stages/{index}'} for route_index, route in enumerate(_ROUTES)]
		if not _same(stage.get('route_local_artifacts'), expected_local):
			_fail('SEMANTIC_ROUTE_LOCAL_ARTIFACTS', stage_id)
		stage_by_id[stage_id] = stage
	for cell in cells:
		gate = cell['dependency_gate']
		if any((item not in cell_by_id or cell_by_id[item]['index'] >= cell['index'] for item in gate['required_pass_cells'])):
			_fail('SEMANTIC_FORWARD_PASS_DEPENDENCY', cell['cell'])
		if any((item not in stage_by_id or stage_by_id[item]['finalization_boundary']['after_cell_index'] >= cell['index'] for item in gate['required_stage_artifacts'])):
			_fail('SEMANTIC_FORWARD_STAGE_DEPENDENCY', cell['cell'])
	transport = bundle.get('transport')
	transport_fields = set('actual_dispatch_adapter adjudication_boundary agent_type attempt best_of canonical_task_path event_cardinality failure_schema_id fork_turns instruction_bytes instruction_sha256 instruction_utf8 invocation_id nonce observation_basis observed_activity observed_activity_fields prohibited_activity raw_root_event replacement_count retry_count root_event_contract spawn_receipt_schema_id spawn_request spawn_request_schema_id subject_visible_view task_name terminal_delivery_schema_id'.split())
	_exact(transport, transport_fields, 'semantic transport')
	if not _same([transport.get('agent_type'), transport.get('fork_turns'), transport.get('attempt'), transport.get('retry_count'), transport.get('best_of'), transport.get('replacement_count')], ['default', 'none', 1, 0, False, 0]):
		_fail('SEMANTIC_TRANSPORT_ONCE_ONLY', 'transport')
	if transport.get('instruction_utf8') != _INSTRUCTION.decode('utf-8') or transport.get('instruction_sha256') != _sha(_INSTRUCTION) or transport.get('instruction_bytes') != 174 or (transport.get('canonical_task_path') != '/root/<task_name>') or (transport.get('invocation_id') != 'r9-invocation:<nonce>') or (transport.get('task_name') != 'r9_<nonce>'):
		_fail('SEMANTIC_TRANSPORT_INSTRUCTION', 'transport')
	if transport.get('spawn_request_schema_id') != 'pw-r9-subagent-spawn-request-v1' or transport.get('spawn_receipt_schema_id') != 'pw-r9-subagent-spawn-receipt-event-v1' or transport.get('terminal_delivery_schema_id') != 'pw-r9-subagent-terminal-delivery-event-v1' or (transport.get('failure_schema_id') != 'pw-r9-subagent-transport-failure-event-v1') or (set(transport['spawn_request'].get('exact_fields', [])) != _SPAWN_REQUEST_FIELDS) or (transport['raw_root_event'].get('maximum_bytes_including_lf') != _MAX_EVENT) or (set(transport.get('observed_activity_fields', [])) != _ACTIVITY_FIELDS):
		_fail('SEMANTIC_TRANSPORT_SCHEMA', 'transport')
	root_events = transport.get('root_event_contract')
	if set(root_events['spawn_receipt'].get('exact_fields', [])) != _SPAWN_EVENT_FIELDS or set(root_events['terminal_delivery'].get('exact_fields', [])) != _TERMINAL_EVENT_FIELDS or set(root_events['transport_failure'].get('exact_fields', [])) != _FAILURE_FIELDS:
		_fail('SEMANTIC_ROOT_EVENT_SCHEMA', 'transport')
	evidence_contract = bundle.get('evidence_contract')
	evidence_fields = {'canonical_json_storage', 'counterfactual_projection_contract', 'dependency_gate', 'durability', 'failure_prefixes', 'permanent_invalid_rule', 'raw_capture', 'reopen', 'row_inventory', 'row_storage', 'schedule_contract', 'schema_ids', 'schema_ownership', 'scoring', 'stage_finalization', 'terminal_distinctions', 'terminal_order', 'write_order'}
	_exact(evidence_contract, evidence_fields, 'evidence contract')
	row_inventory = ['provider_input.txt', 'spawn_message.txt', 'attempt.json', 'spawn_receipt.json', 'raw_result.json', 'completion.json']
	if not _same(evidence_contract.get('row_inventory'), row_inventory) or not _same(evidence_contract.get('write_order'), row_inventory) or (not _same(evidence_contract.get('failure_prefixes'), {'spawn_failure': row_inventory[:4], 'terminal_failure': row_inventory[:5]})) or (evidence_contract.get('reopen') != 'read-only and byte-inventory preserving'):
		_fail('SEMANTIC_EVIDENCE_INVENTORY', 'evidence contract')
	schemas = {'accounting': 'pw-r9-accounting-v3', 'attempt': 'pw-r9-attempt-v4', 'completion': 'pw-r9-completion-v4', 'matrix_terminal': 'pw-r9-matrix-terminal-v3', 'path_terminal': 'pw-r9-path-terminal-v3', 'raw_result': 'pw-r9-raw-root-event-v1', 'reopen_result': 'pw-r9-reopen-result-v4', 'run': 'pw-r9-run-v4', 'runner_error': 'pw-r9-runner-error-v1', 'spawn_receipt': 'pw-r9-spawn-record-v1', 'stage': 'pw-r9-stage-artifact-v1'}
	ownership = {'APPEND_ONLY_EVIDENCE_RECORDER': 'owns create-only mechanical construction', 'IMMUTABLE_SEMANTIC_BUNDLE': 'owns schema IDs plus semantic invariants', 'OFFLINE_VERIFIER': 'independently owns exact field, type, hash, causal, and inventory validation', 'PROCESS_RUNNER': 'constructs values', 'forbidden': ['duplicate JSON-Schema authority', 'proof authority', 'callback authority']}
	row_rule = {'collision_rule': 'exactly one row_id per declared ordinal', 'format': 'row-<ordinal:03d>', 'function_id': 'pw-r9-row-id-v1', 'ordinal_base': 0, 'ordinal_range_by_run': {'run-canary': [0, 2], 'run-matrix': [0, 290], 'simulate': [0, 290]}}
	nonce_rule = {'algorithm': 'sha256_canonical_utf8_tuple', 'function_id': 'pw-r9-dispatch-nonce-v1', 'inputs': ['run_id', 'schedule_index', 'slot', 'cell'], 'predeclared_in_run_manifest': True, 'semantic_manifest_contains_run_specific_nonce': False}
	schedule_contract = evidence_contract.get('schedule_contract')
	if not _same(evidence_contract.get('schema_ids'), schemas) or not _same(evidence_contract.get('schema_ownership'), ownership) or (not _same(schedule_contract.get('planned_rows'), {'run-canary': 3, 'run-matrix': 291, 'simulate': 291})) or (not _same(schedule_contract.get('row_id_rule'), row_rule)) or (not _same(schedule_contract.get('nonce_rule'), nonce_rule)) or (schedule_contract.get('order') != 'slot-major') or (schedule_contract.get('canary_cell_ref') != '/cells/0') or (schedule_contract.get('route_count') != 3) or (schedule_contract.get('cells_per_route') != 97):
		_fail('SEMANTIC_EVIDENCE_DECLARATION', 'schemas, ownership, or schedule')
	scenarios = bundle.get('synthetic_scenarios')
	scenario_ids = ['clean', 'observed_tool', 'observed_file', 'observed_browse', 'observed_network', 'observed_delegation', 'observed_memory', 'observed_followup', 'observed_nonterminal', 'missing_spawn', 'failed_spawn', 'wrong_path', 'wrong_sender', 'wrong_type', 'malformed_output', 'partial_output', 'missing_output', 'delayed_multi_poll']
	if not isinstance(scenarios, list) or len(scenarios) != 18 or [item.get('scenario_id') for item in scenarios if isinstance(item, dict)] != scenario_ids or any((set(item) != {'scenario_id', 'event_rule'} for item in scenarios)):
		_fail('SEMANTIC_SCENARIO_INVENTORY', 'synthetic scenarios')
	regressions = bundle.get('regressions')
	regression_fields = {'calls', 'families', 'family_count', 'global_fault_count', 'global_faults', 'historical_evidence_policy', 'normalization_rule', 'qualification_credit', 'scope_classification', 'variant_count', 'variant_expectations_authority'}
	_exact(regressions, regression_fields, 'semantic regressions')
	families = regressions.get('families')
	global_faults = regressions.get('global_faults')
	if not _same([regressions.get('family_count'), regressions.get('variant_count'), regressions.get('global_fault_count'), regressions.get('qualification_credit'), regressions.get('calls')], [22, 56, 10, 0, {'network': 0, 'provider': 0, 'subject': 0}]) or not isinstance(families, list) or len(families) != 22 or (not isinstance(global_faults, list)) or (len(global_faults) != 10) or (sum((len(item.get('variants', [])) for item in families if isinstance(item, dict))) != 56):
		_fail('SEMANTIC_REGRESSION_CARDINALITY', '22/56/10')
	scenario_map = {item: item for item in scenario_ids}
	family_ids = set()
	variant_ids = set()
	for family in families:
		family_id = _name(family.get('scenario_id'), 'regression family scenario')
		variants = family.get('variants')
		if family_id in family_ids or not isinstance(variants, list) or family.get('variant_count') != len(variants):
			_fail('SEMANTIC_REGRESSION_FAMILY', family_id)
		family_ids.add(family_id)
		for variant in variants:
			variant_id = _name(variant.get('variant_id'), 'regression variant')
			if variant_id in variant_ids:
				_fail('SEMANTIC_REGRESSION_VARIANT_DUPLICATE', variant_id)
			variant_ids.add(variant_id)
			backend = variant.get('backend_scenario')
			if backend is not None and backend not in scenario_ids:
				_fail('SEMANTIC_REGRESSION_BACKEND', variant_id)
			scenario_map[variant_id] = backend
	if len({_name(item.get('case_id'), 'global fault') for item in global_faults}) != 10:
		_fail('SEMANTIC_GLOBAL_FAULT_DUPLICATE', 'global faults')
	counterfactuals = bundle.get('counterfactuals')
	projection_contract = evidence_contract.get('counterfactual_projection_contract')
	if not isinstance(counterfactuals, list) or len(counterfactuals) != 7 or (not _same(projection_contract.get('semantic_case_count'), 6)) or (not _same(projection_contract.get('leakage_case_count'), 1)):
		_fail('SEMANTIC_COUNTERFACTUAL_CARDINALITY', '6 plus 1')
	_counterfactual_checks(counterfactuals, projection_contract)
	_projection('cell_dependencies', [{key: cell[key] for key in ('cell', 'index', 'dependency_gate')} for cell in cells])
	_projection('stage_control', {'stage_order': stage_order, 'stages': [{key: stage[key] for key in ('stage', 'index', 'rule', 'predecessor_stages', 'direct_subject_cells', 'finalization_boundary')} for stage in stages]})
	_projection('regression_control', regressions)
	_projection('transport_evidence_control', {'transport': transport, 'evidence_contract': evidence_contract})
	_projection('synthetic_scenarios', scenarios)
	_projection('counterfactuals', counterfactuals)
	_projection('payload_identities', {'cells': [{key: cell[key] for key in ('cell', 'index', 'render_utf8_sha256', 'render_utf8_bytes', 'expected_output_sha256', 'expected_output_bytes', 'expected_output_storage_sha256', 'expected_output_storage_bytes')} for cell in cells], 'stages': [{key: stage[key] for key in ('stage', 'index', 'expected_artifact_sha256', 'expected_artifact_bytes', 'expected_artifact_storage_sha256', 'expected_artifact_storage_bytes')} for stage in stages]})
	if not isinstance(bundle.get('nonclaims'), list) or not bundle['nonclaims']:
		_fail('SEMANTIC_NONCLAIMS', 'nonempty list required')
	return {'bundle': bundle, 'identity': identity, 'cells': cells, 'cell_by_id': cell_by_id, 'stages': stages, 'stage_by_id': stage_by_id, 'scenario_map': scenario_map}

def _validate_provenance(value, identity):
	provenance = _exact(value, {'authority', 'parts'}, 'component provenance')
	if provenance.get('authority') is not False:
		_fail('PROVENANCE_AUTHORITY_FORBIDDEN', 'authority must be false')
	rows = provenance.get('parts')
	if not isinstance(rows, list) or len(rows) != 4:
		_fail('PROVENANCE_CARDINALITY', 'four parts required')
	identity_rows = identity['parts']
	seen_paths = set()
	for wanted, raw in zip(identity_rows, rows):
		row = _exact(raw, {'role', 'path', 'sha256', 'bytes'}, 'provenance part')
		pure = _safe_relative(row.get('path'), f"provenance {wanted['role']}.path")
		if not pure.parts or pure.parts[0] != 'r9_control_plane_stabilization_v1':
			_fail('PROVENANCE_PATH_SCOPE', wanted['role'])
		if pure.as_posix() in seen_paths:
			_fail('PROVENANCE_PATH_DUPLICATE', pure.as_posix())
		seen_paths.add(pure.as_posix())
		if not _same({key: row.get(key) for key in ('role', 'sha256', 'bytes')}, wanted):
			_fail('PROVENANCE_ROLE_IDENTITY_DRIFT', wanted['role'])

def _expected_interface(run_root, expected, identity, shared):
	keys = {'schema_id', 'run_id', 'run_kind', 'planned_call_count', 'evidence_root', 'current_component_identity', 'shared_authorities'}
	value = _exact(expected, keys, 'expected')
	if value.get('schema_id') != 'pw-r9-verifier-expectation-v4':
		_fail('EXPECTED_SCHEMA', str(value.get('schema_id')))
	run_id = _name(value.get('run_id'), 'expected.run_id')
	run_kind = value.get('run_kind')
	if run_kind not in {'simulate', 'run-canary', 'run-matrix'}:
		_fail('EXPECTED_RUN_KIND', str(run_kind))
	planned = _integer(value.get('planned_call_count'), 'expected.planned_call_count', 1)
	if planned != (3 if run_kind == 'run-canary' else 291):
		_fail('EXPECTED_CALL_COUNT', str(planned))
	if not _same(value.get('current_component_identity'), identity):
		_fail('EXPECTED_COMPONENT_IDENTITY_DRIFT', 'role/hash/bytes closure')
	_component_identity(value.get('current_component_identity'), 'expected component identity')
	if not _same(value.get('shared_authorities'), shared):
		_fail('EXPECTED_SHARED_AUTHORITY_DRIFT', 'shared authorities')
	evidence_text = _text(value.get('evidence_root'), 'expected.evidence_root')
	_lexical_absolute(evidence_text, 'expected.evidence_root')
	_no_symlink_ancestors(evidence_text, 'evidence root')
	evidence_root = _pathlib.Path(evidence_text)
	_directory(evidence_root, 'evidence root')
	if not isinstance(run_root, _pathlib.Path):
		_fail('RUN_ROOT_PATHLIB_REQUIRED', type(run_root).__name__)
	run_text = _os.fspath(run_root)
	_lexical_absolute(run_text, 'run root')
	_no_symlink_ancestors(run_text, 'run root')
	_directory(run_root, 'run root')
	if _os.path.dirname(run_text) != evidence_text or _os.path.basename(run_text) != run_id:
		_fail('RUN_ROOT_DIRECT_CHILD_MISMATCH', run_text)
	return {'run_id': run_id, 'run_kind': run_kind, 'planned_call_count': planned, 'evidence_root': evidence_root}

def _schedule(run_id, run_kind, controls):
	selected = [(route, controls['cells'][0]) for route in _ROUTES] if run_kind == 'run-canary' else [(route, cell) for route in _ROUTES for cell in controls['cells']]
	rows = []
	for ordinal, (route, cell) in enumerate(selected):
		row_id = f'row-{ordinal:03d}'
		nonce_input = [run_id, ordinal, route['slot'], cell['cell']]
		nonce = _sha(_canon(nonce_input))
		task = f'r9_{nonce}'
		rows.append({'row_id': row_id, 'ordinal': ordinal, 'slot': route['slot'], 'cell': cell['cell'], 'index': ordinal, 'nonce': nonce, 'invocation_id': f'r9-invocation:{nonce}', 'task_name': task, 'expected_canonical_task_path': f'/root/{task}'})
	return rows

def _load_run(run_root, expectation, controls, shared, identity):
	storage, run = _json_file(run_root / 'run.json', 'run manifest')
	_exact(run, _RUN_FIELDS, 'run manifest')
	run_kind = expectation['run_kind']
	mode = 'synthetic' if run_kind == 'simulate' else 'actual'
	scenario = run.get('scenario')
	if mode == 'synthetic':
		if scenario not in controls['scenario_map']:
			_fail('RUN_SCENARIO', str(scenario))
	elif scenario is not None:
		_fail('ACTUAL_SCENARIO_FORBIDDEN', str(scenario))
	created = _text(run.get('created_utc'), 'run.created_utc')
	if not created.endswith('Z'):
		_fail('RUN_CREATED_UTC', created)
	rows = _schedule(run_root.name, run_kind, controls)
	cells_per_route = 1 if run_kind == 'run-canary' else 97
	fixed = {'schema_id': 'pw-r9-run-v4', 'run_id': run_root.name, 'run_kind': run_kind, 'mode': mode, 'component_identity': identity, 'shared_authorities': shared, 'routes': _ROUTES, 'schedule': rows, 'route_count': 3, 'cells_per_route': cells_per_route, 'cell_count': 97, 'planned_call_count': len(rows), 'stage_count': 18, 'required_clean_stage_artifact_count': 54 if len(rows) == 291 else 0, 'regression_family_count': 22, 'regression_variant_count': 56, 'global_fault_count': 10, 'semantic_counterfactual_count': 7, 'retry_count': 0, 'best_of': False, 'replacement_count': 0}
	if any((not _same(run.get(key), value) for key, value in fixed.items())):
		_fail('RUN_MANIFEST_BINDING', 'fixed fields or recomputed schedule')
	if expectation['run_id'] != run_root.name or expectation['planned_call_count'] != len(rows):
		_fail('RUN_EXPECTATION_BINDING', run_root.name)
	_validate_provenance(run.get('component_provenance'), identity)
	synthetic_custody = {'mode': 'SYNTHETIC_PRECOMMIT_ALLOWED', 'required': False, 'qualification_credit': 0, 'current_git_custody_reported_by_verifier': True}
	if mode == 'synthetic' and (not _same(run.get('custody'), synthetic_custody)):
		_fail('RUN_SYNTHETIC_CUSTODY', 'recorded custody')
	return (storage, run, rows)

def _git(arguments, cwd):
	environment = dict(_os.environ)
	environment.update({'GIT_OPTIONAL_LOCKS': '0', 'LC_ALL': 'C'})
	try:
		result = _subprocess.run(['git', '-C', str(cwd), *arguments], stdin=_subprocess.DEVNULL, stdout=_subprocess.PIPE, stderr=_subprocess.PIPE, env=environment, timeout=30, check=False)
	except (OSError, _subprocess.SubprocessError) as exc:
		_fail('GIT_EXECUTION_ERROR', str(exc))
	if result.returncode != 0:
		detail = result.stderr.decode('utf-8', errors='replace').strip()
		_fail('GIT_COMMAND_FAILED', f"{' '.join(arguments)}: {detail}")
	return result.stdout

def _git_custody(root,successor,cstore,sstore):
	repo_text = _git(['rev-parse', '--show-toplevel'], root).decode('utf-8').strip()
	_lexical_absolute(repo_text, 'Git top level')
	repo = _pathlib.Path(repo_text)
	head = _git(['rev-parse', 'HEAD'], repo).decode('ascii').strip()
	origin = _git(['rev-parse', 'refs/remotes/origin/main'], repo).decode('ascii').strip()
	if not _re.fullmatch('[0-9a-f]{40,64}', head) or head != origin:
		_fail('GIT_HEAD_ORIGIN_MISMATCH', f'HEAD={head} origin/main={origin}')
	prefix = repo_text.rstrip(_os.sep) + _os.sep
	blobs = []
	for path,label,data in ([(root/name,name,cstore[name]) for name in _FILES]+[(successor/item['successor_root_relative_path'],item['role'],sstore[item['role']]) for item in _SHARED]):
		path = str(path)
		if not path.startswith(prefix):
			_fail('GIT_PATH_OUTSIDE_REPO', label)
		rel = path[len(prefix):].replace(_os.sep, '/')
		_git(['ls-files','--error-unmatch','--',rel], repo)
		if _git(['cat-file','blob',f'HEAD:{rel}'], repo) != data:
			_fail('GIT_HEAD_BLOB_DRIFT', label)
		blobs.append((rel,data))
	if _git(['status','--porcelain=v1','--untracked-files=all','--',*(item[0] for item in blobs)], repo):
		_fail('GIT_SCOPED_DIRTY', 'component or shared authority')
	return ({'mode':'ACTUAL_GIT_CUSTODY','required':True,'status':'PASS','head':head,'origin_main':origin,'tracked_component_count':4,'tracked_shared_authority_count':3,'scoped_clean':True,'head_blob_equal':True},repo,blobs)

def _reported_custody(run,root,successor,cstore,sstore):
	try:
		now,repo,blobs = _git_custody(root, successor, cstore, sstore)
	except _Invalid as exc:
		if run['mode'] == 'actual':
			raise
		now = {'mode':'PRESENT_GIT_CUSTODY','required':False,'status':'FAIL','error':{'code':exc.code,'detail':exc.detail}}
	if run['mode'] == 'actual':
		prior = _exact(run.get('custody'),set(now),'recorded custody')
		if any((not _same(prior.get(key),value) for key,value in now.items() if key not in {'head','origin_main'})):
			_fail('RECORDED_ACTUAL_CUSTODY_DRIFT','flags')
		head = _text(prior.get('head'), 'recorded custody head')
		if not _re.fullmatch('[0-9a-f]{40,64}',head) or prior.get('origin_main') != head:
			_fail('RECORDED_ACTUAL_CUSTODY_DRIFT','head/origin')
		if _git(['cat-file','-t',head],repo) != b'commit\n':
			_fail('RECORDED_GIT_OBJECT_NOT_COMMIT', head)
		if any((_git(['cat-file','blob',f'{head}:{rel}'],repo) != data for rel,data in blobs)):
			_fail('RECORDED_GIT_BLOB_DRIFT', head)
		return {'mode':'ACTUAL_GIT_CUSTODY','required':True,'status':'PASS','recorded':prior,'present_git':now,'recorded_head_equals_present_head':head==now['head'],'recorded_commit_source_blobs_reopened':True}
	return {'mode':'SYNTHETIC_PRECOMMIT_ALLOWED','required':False,'recorded':run['custody'],'present_git':now}

def _reference(run_root, path, storage, kind, identity):
	try:
		relative = path.relative_to(run_root).as_posix()
	except ValueError:
		_fail('CAUSAL_REFERENCE_ESCAPE', str(path))
	return {'kind': kind, 'id': identity, 'path': relative, 'sha256': _sha(storage), 'bytes': len(storage)}

def _load_artifacts(run_root, controls):
	inventory = _entries(run_root / 'artifacts', 'artifacts')
	slots = {route['slot'] for route in _ROUTES}
	result = {}
	for slot, is_directory in inventory.items():
		if not is_directory or slot not in slots:
			_fail('UNEXPECTED_ARTIFACT_SLOT', slot)
		children = _entries(run_root / 'artifacts' / slot, f'artifact slot {slot}')
		for name, nested in children.items():
			if nested or not name.endswith('.json'):
				_fail('UNEXPECTED_ARTIFACT_PATH', f'{slot}/{name}')
			stage_id = name[:-5]
			if stage_id not in controls['stage_by_id'] or (slot, stage_id) in result:
				_fail('UNDECLARED_STAGE_ARTIFACT', f'{slot}/{name}')
			path = run_root / 'artifacts' / slot / name
			storage, value = _json_file(path, f'stage artifact {slot}/{stage_id}')
			result[slot, stage_id] = {'path': path, 'storage': storage, 'value': value}
	return result

def _event_line(raw, label):
	if not raw or len(raw) > _MAX_EVENT or (not raw.endswith(b'\n')) or raw.endswith(b'\n\n') or (b'\r' in raw) or (b'\n' in raw[:-1]):
		_fail('ROOT_EVENT_FRAMING', label)
	return _load_object_bytes(raw[:-1], label, terminal_lf=False)

def _capture(value, schema, run_root, row_id, flag, bindings, label):
	keys = {'schema_id', 'run_id', 'row_id', 'capture_ordinal', 'capture_status', flag, 'root_event_base64', 'root_event_sha256', 'root_event_bytes', *bindings}
	_exact(value, keys, label)
	if value.get('schema_id') != schema or value.get('run_id') != run_root.name or value.get('row_id') != row_id or (not _same(value.get('capture_ordinal'), 1)) or (value.get('capture_status') != 'DURABLE_BEFORE_CONSUMER') or (value.get(flag) is not True) or any((not _same(value.get(key), expected) for key, expected in bindings.items())):
		_fail('CAPTURE_ENVELOPE_BINDING', label)
	encoded = value.get('root_event_base64')
	if not isinstance(encoded, str):
		_fail('CAPTURE_BASE64_TYPE', label)
	try:
		raw = _base64.b64decode(encoded, validate=True)
	except (ValueError, _base64.binascii.Error) as exc:
		_fail('CAPTURE_BASE64', f'{label}: {exc}')
	if _base64.b64encode(raw).decode('ascii') != encoded or value.get('root_event_sha256') != _sha(raw) or (not _same(value.get('root_event_bytes'), len(raw))) or (len(raw) > _MAX_EVENT):
		_fail('CAPTURE_ROOT_EVENT_IDENTITY', label)
	return raw

def _failure_event(value, invocation, phase, label):
	if not isinstance(value, dict) or value.get('schema_id') != 'pw-r9-subagent-transport-failure-event-v1':
		return False
	event = _exact(value, _FAILURE_FIELDS, label)
	failure_type = _text(event.get('failure_type'), f'{label}.failure_type')
	_text(event.get('detail'), f'{label}.detail')
	if event.get('invocation_id') != invocation or event.get('phase') != phase or (not _TOKEN.fullmatch(failure_type)):
		_fail('TRANSPORT_FAILURE_EVENT', label)
	return True

def _clean_activity():
	return {'tool_calls': 0, 'file_accesses': 0, 'browsing': 0, 'network_accesses': 0, 'delegations': 0, 'memory_accesses': 0, 'followup_turns': 0, 'nonterminal_messages': [], 'observation_basis': 'ROOT_VISIBLE_COLLABORATION_DELIVERIES'}

def _synthetic_events(request, scenario, oracle):
	invocation = request['invocation_id']
	path = request['expected_canonical_task_path']
	failure = lambda phase, kind, detail: {'schema_id': 'pw-r9-subagent-transport-failure-event-v1', 'invocation_id': invocation, 'phase': phase, 'failure_type': kind, 'detail': detail}
	if scenario == 'missing_spawn':
		return (failure('SPAWN_ATTEMPT', 'SPAWN_MISSING', 'synthetic spawn result was not returned'), None)
	if scenario == 'failed_spawn':
		return (failure('SPAWN_ATTEMPT', 'SPAWN_FAILED', 'synthetic spawn failure'), None)
	spawn = {'schema_id': 'pw-r9-subagent-spawn-receipt-event-v1', 'invocation_id': invocation, 'spawn_request_sha256': _sha(_canon(request)), 'tool_result': {'task_name': path}, 'returned_identity_kind': 'canonical_task_path', 'returned_canonical_task_path': path}
	if scenario == 'wrong_path':
		spawn['returned_canonical_task_path'] = '/root/synthetic-wrong-path'
	if scenario == 'missing_output':
		return (spawn, failure('TERMINAL_DRAIN', 'TERMINAL_DELIVERY_MISSING', 'synthetic terminal delivery missing'))
	final = oracle + '\n'
	if scenario == 'malformed_output':
		final = '{malformed-output'
	elif scenario == 'partial_output':
		final = oracle[:max(1, len(oracle) // 2)]
	activity = _clean_activity()
	activity_fields = {'observed_tool': 'tool_calls', 'observed_file': 'file_accesses', 'observed_browse': 'browsing', 'observed_network': 'network_accesses', 'observed_delegation': 'delegations', 'observed_memory': 'memory_accesses', 'observed_followup': 'followup_turns'}
	if scenario in activity_fields:
		activity[activity_fields[scenario]] = 1
	elif scenario == 'observed_nonterminal':
		message = 'synthetic nonterminal message'
		encoded = message.encode('utf-8')
		activity['nonterminal_messages'] = [{'sequence': 1, 'message_type': 'MESSAGE', 'utf8': message, 'sha256': _sha(encoded), 'bytes': len(encoded)}]
	terminal = {'schema_id': 'pw-r9-subagent-terminal-delivery-event-v1', 'invocation_id': invocation, 'returned_canonical_task_path': path, 'message_type': 'FINAL_ANSWER', 'final_utf8': final, 'observed_activity': activity, 'terminal_status': 'FINAL_RETURNED'}
	if scenario == 'wrong_sender':
		terminal['returned_canonical_task_path'] = '/root/synthetic-wrong-sender'
	elif scenario == 'wrong_type':
		terminal['message_type'] = 'MESSAGE'
	return (spawn, terminal)

def _transport_observation(mode, scenario):
	if mode == 'actual':
		return {'kind': 'ROOT_EVENT_LINE_READ', 'spawn_observations': 1, 'terminal_observations': 1, 'empty_terminal_observations': 0}
	delayed = scenario == 'delayed_multi_poll'
	return {'kind': 'SYNTHETIC_EVENT_GROUP_POLL', 'spawn_observations': 1, 'terminal_observations': 3 if delayed else 1, 'empty_terminal_observations': 2 if delayed else 0}

def _spawn_event(value, request):
	if _failure_event(value, request['invocation_id'], 'SPAWN_ATTEMPT', 'spawn event'):
		return 'SPAWN_FAILURE'
	event = _exact(value, _SPAWN_EVENT_FIELDS, 'spawn event')
	path = request['expected_canonical_task_path']
	if event.get('schema_id') != 'pw-r9-subagent-spawn-receipt-event-v1' or event.get('invocation_id') != request['invocation_id'] or event.get('spawn_request_sha256') != _sha(_canon(request)) or (not _same(event.get('tool_result'), {'task_name': path})) or (event.get('returned_identity_kind') != 'canonical_task_path') or (event.get('returned_canonical_task_path') != path):
		_fail('SPAWN_EVENT_BINDING', str(request['ordinal']))
	return 'SPAWNED'

def _activity(value, ordinal):
	activity = _exact(value, _ACTIVITY_FIELDS, f'row {ordinal} observed activity')
	prohibited = False
	for key in ('tool_calls', 'file_accesses', 'browsing', 'network_accesses', 'delegations', 'memory_accesses', 'followup_turns'):
		prohibited = bool(_integer(activity.get(key), f'row {ordinal}.{key}')) or prohibited
	messages = activity.get('nonterminal_messages')
	if not isinstance(messages, list):
		_fail('NONTERMINAL_MESSAGES_LIST', str(ordinal))
	for sequence, raw in enumerate(messages, 1):
		message = _exact(raw, {'sequence', 'message_type', 'utf8', 'sha256', 'bytes'}, f'row {ordinal} nonterminal {sequence}')
		data = _text(message.get('utf8'), 'nonterminal utf8', False).encode('utf-8')
		if not _same(_integer(message.get('sequence'), 'nonterminal sequence', 1), sequence) or message.get('message_type') != 'MESSAGE' or message.get('sha256') != _sha(data) or (not _same(_integer(message.get('bytes'), 'nonterminal bytes'), len(data))):
			_fail('NONTERMINAL_MESSAGE_BINDING', f'{ordinal}:{sequence}')
	if activity.get('observation_basis') != 'ROOT_VISIBLE_COLLABORATION_DELIVERIES':
		_fail('ACTIVITY_OBSERVATION_BASIS', str(ordinal))
	return prohibited or bool(messages)

def _consumer(value, request, cell, mode, scenario):
	if _failure_event(value, request['invocation_id'], 'TERMINAL_DRAIN', 'terminal event'):
		_fail('TERMINAL_FAILURE_USED_AS_COMPLETION', str(request['ordinal']))
	event = _exact(value, _TERMINAL_EVENT_FIELDS, 'terminal event')
	if event.get('schema_id') != 'pw-r9-subagent-terminal-delivery-event-v1' or event.get('invocation_id') != request['invocation_id'] or event.get('returned_canonical_task_path') != request['expected_canonical_task_path'] or (event.get('message_type') != 'FINAL_ANSWER') or (event.get('terminal_status') != 'FINAL_RETURNED'):
		_fail('TERMINAL_EVENT_BINDING', str(request['ordinal']))
	raw = _text(event.get('final_utf8'), 'terminal final_utf8', False).encode('utf-8')
	prohibited = _activity(event.get('observed_activity'), request['ordinal'])
	if raw.endswith(b'\n'):
		normalized = raw[:-1]
		normalization = 'REMOVED_EXACTLY_ONE_FINAL_LF'
	else:
		normalized = raw
		normalization = 'PRESERVED_NO_FINAL_LF'
	expected = cell['expected_output_utf8'].encode('utf-8')
	returncode = 86 if prohibited else 0
	if prohibited:
		verdict, reason = ('FAIL', 'PROHIBITED_ACTIVITY_AFTER_FINAL')
	elif normalized != expected:
		verdict, reason = ('FAIL', 'EXACT_OUTPUT_MISMATCH')
	else:
		verdict, reason = ('PASS', 'EXACT_UTF8_MATCH')
	consumer = {'schema_id': 'pw-r9-consumer-result-v1', 'transport': {'invocation_id': request['invocation_id'], 'canonical_task_path': request['expected_canonical_task_path'], 'terminal_status': 'FINAL_RETURNED', 'message_type': 'FINAL_ANSWER', 'observed_activity': event['observed_activity'], 'prohibited_activity': prohibited, 'transport_observation': _transport_observation(mode, scenario)}, 'result': {'normalization': normalization, 'raw_final_sha256': _sha(raw), 'raw_final_bytes': len(raw), 'normalized_utf8': normalized.decode('utf-8'), 'normalized_sha256': _sha(normalized), 'normalized_bytes': len(normalized), 'returncode': returncode}, 'score': {'rule': 'EXACT_UTF8_REMOVE_AT_MOST_ONE_FINAL_LF', 'verdict': verdict, 'reason': reason, 'expected_sha256': cell['expected_output_sha256'], 'expected_bytes': cell['expected_output_bytes'], 'actual_sha256': _sha(normalized), 'actual_bytes': len(normalized), 'returncode': returncode}}
	return (consumer, verdict)

def _causal_inputs(run_root, slot, cell, records, created_artifacts):
	refs = []
	for cell_id in cell['dependency_gate']['required_pass_cells']:
		record = records.get((slot, cell_id))
		if record is None or record.get('status') != 'PASS':
			_fail('CAUSAL_PASS_CELL_UNAVAILABLE', f"{slot}:{cell['cell']}:{cell_id}")
		refs.append(_reference(run_root, record['completion_path'], record['completion_storage'], 'PASS_CELL', cell_id))
	for stage_id in cell['dependency_gate']['required_stage_artifacts']:
		artifact = created_artifacts.get((slot, stage_id))
		if artifact is None:
			_fail('CAUSAL_STAGE_UNAVAILABLE', f"{slot}:{cell['cell']}:{stage_id}")
		refs.append(_reference(run_root, artifact['path'], artifact['storage'], 'STAGE_ARTIFACT', stage_id))
	refs.sort(key=lambda item: (item['kind'], item['id'], item['path']))
	return refs

def _row(run_root, run, row, cell, records, created_artifacts, inventory, scenario):
	row_path = run_root / 'rows' / row['row_id']
	if inventory not in (_COMPLETE_FILES, _SPAWN_PREFIX, _TERMINAL_PREFIX):
		_fail('ROW_FILE_INVENTORY', row['row_id'])
	packet = _read_file(row_path / 'provider_input.txt', f"{row['row_id']} provider input", evidence=True)
	message = _read_file(row_path / 'spawn_message.txt', f"{row['row_id']} spawn message", evidence=True)
	expected_packet = cell['render_utf8'].encode('utf-8')
	if packet != expected_packet or message != _INSTRUCTION + packet[:-1] or len(_INSTRUCTION) != 174:
		_fail('ROW_PROVIDER_OR_MESSAGE_DRIFT', row['row_id'])
	causal = _causal_inputs(run_root, row['slot'], cell, records, created_artifacts)
	attempt_storage, attempt = _json_file(row_path / 'attempt.json', f"{row['row_id']} attempt")
	route = next((item for item in _ROUTES if item['slot'] == row['slot']))
	expected_attempt = {'schema_id': 'pw-r9-attempt-v4', 'run_id': run_root.name, 'run_kind': run['run_kind'], 'mode': run['mode'], 'row_id': row['row_id'], 'slot': row['slot'], 'cell': row['cell'], 'index': row['index'], 'ordinal': row['ordinal'], 'nonce': row['nonce'], 'invocation_id': row['invocation_id'], 'task_name': row['task_name'], 'expected_canonical_task_path': row['expected_canonical_task_path'], 'agent_type': 'default', 'fork_turns': 'none', 'model': route['model'], 'reasoning_effort': route['reasoning_effort'], 'causal_inputs': causal, 'packet_sha256': _sha(packet), 'packet_bytes': len(packet), 'message_sha256': _sha(message), 'message_bytes': len(message), 'attempt': 1, 'retry_count': 0, 'best_of': False, 'replacement_result': False, 'no_retry': True, 'no_relaunch': True, 'admission_state': 'FUSED_BEFORE_SPAWN'}
	if set(attempt) != _ATTEMPT_FIELDS or not _same(attempt, expected_attempt):
		_fail('ATTEMPT_BINDING', row['row_id'])
	request = {'schema_id': 'pw-r9-subagent-spawn-request-v1', 'run_id': run_root.name, 'run_kind': run['run_kind'], 'mode': run['mode'], 'slot': row['slot'], 'cell': row['cell'], 'index': row['index'], 'ordinal': row['ordinal'], 'nonce': row['nonce'], 'invocation_id': row['invocation_id'], 'task_name': row['task_name'], 'expected_canonical_task_path': row['expected_canonical_task_path'], 'agent_type': 'default', 'fork_turns': 'none', 'model': route['model'], 'reasoning_effort': route['reasoning_effort'], 'packet_sha256': _sha(packet), 'packet_bytes': len(packet), 'message_utf8': message.decode('utf-8'), 'message_sha256': _sha(message), 'message_bytes': len(message), 'attempt_sha256': _sha(attempt_storage), 'attempt_bytes': len(attempt_storage)}
	if set(request) != _SPAWN_REQUEST_FIELDS:
		_fail('SPAWN_REQUEST_SHAPE', row['row_id'])
	request_storage = _canon(request)
	spawn_storage, spawn_record = _json_file(row_path / 'spawn_receipt.json', f"{row['row_id']} spawn record")
	spawn_raw = _capture(spawn_record, 'pw-r9-spawn-record-v1', run_root, row['row_id'], 'first_spawn_only', {'attempt_sha256': _sha(attempt_storage), 'attempt_bytes': len(attempt_storage), 'spawn_request_sha256': _sha(request_storage), 'spawn_request_bytes': len(request_storage)}, f"{row['row_id']} spawn record")
	spawn_event = _event_line(spawn_raw, f"{row['row_id']} spawn event")
	expected_terminal = None
	if scenario is not None:
		expected_spawn, expected_terminal = _synthetic_events(request, scenario, cell['expected_output_utf8'])
		if not _same(spawn_event, expected_spawn):
			_fail('SYNTHETIC_SPAWN_EVENT_MISMATCH', row['row_id'])
	base = {'ordinal': row['ordinal']}
	if scenario == 'wrong_path':
		if inventory != _SPAWN_PREFIX:
			_fail('BAD_PREFIX', row['row_id'])
		return {**base, 'kind': 'spawn receipt/request', 'raw_present': False}
	spawn_kind = _spawn_event(spawn_event, request)
	if spawn_kind == 'SPAWN_FAILURE':
		if inventory != _SPAWN_PREFIX:
			_fail('SPAWN_FAILURE_PREFIX', row['row_id'])
		return {**base, 'kind': 'SPAWN_FAILURE', 'raw_present': False}
	if inventory == _SPAWN_PREFIX:
		_fail('UNTYPED_SPAWN_PREFIX', row['row_id'])
	raw_storage, raw_record = _json_file(row_path / 'raw_result.json', f"{row['row_id']} raw result")
	terminal_raw = _capture(raw_record, 'pw-r9-raw-root-event-v1', run_root, row['row_id'], 'first_terminal_only', {'attempt_sha256': _sha(attempt_storage), 'attempt_bytes': len(attempt_storage), 'spawn_request_sha256': _sha(request_storage), 'spawn_request_bytes': len(request_storage), 'spawn_record_sha256': _sha(spawn_storage), 'spawn_record_bytes': len(spawn_storage)}, f"{row['row_id']} raw result")
	terminal_event = _event_line(terminal_raw, f"{row['row_id']} terminal event")
	if scenario is not None and (not _same(terminal_event, expected_terminal)):
		_fail('SYNTHETIC_TERMINAL_EVENT_MISMATCH', row['row_id'])
	if scenario in {'wrong_sender', 'wrong_type'}:
		if inventory != _TERMINAL_PREFIX:
			_fail('BAD_PREFIX', row['row_id'])
		return {**base, 'kind': 'terminal delivery ide', 'raw_present': True}
	if _failure_event(terminal_event, request['invocation_id'], 'TERMINAL_DRAIN', 'terminal event'):
		if inventory != _TERMINAL_PREFIX:
			_fail('TERMINAL_FAILURE_PREFIX', row['row_id'])
		return {**base, 'kind': 'TERMINAL_FAILURE', 'raw_present': True}
	if inventory != _COMPLETE_FILES:
		_fail('UNTYPED_TERMINAL_PREFIX', row['row_id'])
	consumer, verdict = _consumer(terminal_event, request, cell, run['mode'], scenario)
	completion_path = row_path / 'completion.json'
	completion_storage, completion = _json_file(completion_path, f"{row['row_id']} completion")
	expected_completion = {'schema_id': 'pw-r9-completion-v4', 'run_id': run_root.name, 'row_id': row['row_id'], 'attempt_sha256': _sha(attempt_storage), 'attempt_bytes': len(attempt_storage), 'spawn_record_sha256': _sha(spawn_storage), 'spawn_record_bytes': len(spawn_storage), 'raw_result_sha256': _sha(raw_storage), 'raw_result_bytes': len(raw_storage), 'consumer_result': consumer, 'status': verdict, 'attempt': 1, 'retry_count': 0, 'best_of': False, 'replacement_result': False, 'completion_is_last_row_write': True}
	if not _same(completion, expected_completion):
		_fail('COMPLETION_BINDING', row['row_id'])
	return {**base, 'kind': 'COMPLETE', 'raw_present': True, 'status': verdict, 'completion_path': completion_path, 'completion_storage': completion_storage, 'completion_sha256': _sha(completion_storage), 'completion_bytes': len(completion_storage)}

def _finalize(run_root, row, cell, controls, records, actual_artifacts, created):
	slot = row['slot']
	for stage in controls['stages']:
		key = (slot, stage['stage'])
		if key in created or stage['finalization_boundary']['after_cell_index'] > cell['index']:
			continue
		causal = []
		eligible = True
		for cell_id in stage['direct_subject_cells']:
			record = records.get((slot, cell_id))
			if record is None or record.get('status') != 'PASS':
				eligible = False
				break
			causal.append(_reference(run_root, record['completion_path'], record['completion_storage'], 'PASS_CELL', cell_id))
		if not eligible:
			continue
		for stage_id in stage['predecessor_stages']:
			predecessor = created.get((slot, stage_id))
			if predecessor is None:
				eligible = False
				break
			causal.append(_reference(run_root, predecessor['path'], predecessor['storage'], 'STAGE_ARTIFACT', stage_id))
		if not eligible:
			continue
		causal.sort(key=lambda item: (item['kind'], item['id'], item['path']))
		payload = stage['expected_artifact_utf8'].encode('utf-8')
		envelope = {'schema_id': 'pw-r9-stage-artifact-v1', 'run_id': run_root.name, 'slot': slot, 'stage': stage['stage'], 'index': stage['index'], 'rule': stage['rule'], 'finalization_row_id': row['row_id'], 'finalization_ordinal': row['ordinal'], 'causal_inputs': causal, 'artifact_payload_utf8': stage['expected_artifact_utf8'], 'artifact_payload_sha256': _sha(payload), 'artifact_payload_bytes': len(payload), 'artifact_storage_sha256': _sha(payload + b'\n'), 'artifact_storage_bytes': len(payload) + 1}
		if set(envelope) != _STAGE_FIELDS:
			_fail('STAGE_ENVELOPE_SHAPE', stage['stage'])
		actual = actual_artifacts.get(key)
		if actual is None:
			_fail('ELIGIBLE_STAGE_MISSING', f"{slot}:{stage['stage']}")
		expected_storage = _canon(envelope) + b'\n'
		if not _same(actual['value'], envelope) or actual['storage'] != expected_storage:
			_fail('STAGE_ENVELOPE_BINDING', f"{slot}:{stage['stage']}")
		created[key] = actual

def _root_cause(value):
	if value is None:
		return None
	cause = _exact(value, {'kind', 'detail'}, 'matrix cause')
	if cause.get('kind') not in {'CONTROLLER_INVALID', 'STOPPED_AFTER_DRAIN'}:
		_fail('MATRIX_CAUSE_KIND', str(cause.get('kind')))
	_text(cause.get('detail'), 'matrix cause.detail')
	return cause

def _validate_terminals(run_root, run_storage, run, rows, records_by_ordinal, actual_artifacts):
	matrix_storage, matrix = _json_file(run_root / 'matrix_terminal.json', 'matrix terminal')
	cause = _root_cause(matrix.get('cause'))
	bad = [record for record in records_by_ordinal.values() if record['kind'] != 'COMPLETE']
	typed = [record for record in bad if record['kind'] in {'SPAWN_FAILURE', 'TERMINAL_FAILURE'}]
	if len(bad) > 1:
		_fail('INVALID_ROWS', str(len(bad)))
	eof_invalid = bool(run.get('mode') == 'actual' and cause is not None and (cause.get('kind') == 'CONTROLLER_INVALID') and _ROOT_EOF_DETAIL.fullmatch(cause.get('detail', '')))
	if typed:
		item = typed[0]
		detail = f"ROW_{item['ordinal']}_INVALID:_Invalid:typed SPAWN_ATTEMPT failure captured durably" if item['kind'] == 'SPAWN_FAILURE' else f"ROW_{item['ordinal']}_INVALID:_Invalid:typed TERMINAL_DRAIN failure captured durably"
		if not eof_invalid and (not _same(cause, {'kind': 'CONTROLLER_INVALID', 'detail': detail})):
			_fail('TYPED_FAILURE_CAUSE', detail)
	elif bad:
		item = bad[0]
		detail = f"ROW_{item['ordinal']}_INVALID:_Invalid:{item['kind']}"
		if not _same(cause, {'kind': 'CONTROLLER_INVALID', 'detail': detail}):
			_fail('INVALID_CAUSE', detail)
	if not bad and cause is not None and (cause.get('kind') == 'CONTROLLER_INVALID') and (not eof_invalid):
		_fail('UNEXPLAINED_CONTROLLER_INVALID_CAUSE', cause['detail'])
	if cause is not None and cause.get('kind') == 'STOPPED_AFTER_DRAIN':
		allowed = {'signal before next admission', 'signal pending before admission fuse', 'signal drained admitted receipt and terminal chain durably', 'signal at terminal decision boundary'}
		if cause.get('detail') not in allowed:
			_fail('STOP_CAUSE_DETAIL', cause['detail'])
	failed_slots = set()
	halted = False
	for row in rows:
		present = row['ordinal'] in records_by_ordinal
		if row['slot'] in failed_slots:
			if present:
				_fail('POST_SUBJECT_FAIL_DISPATCH', row['row_id'])
			continue
		if halted:
			if present:
				_fail('POST_GLOBAL_HALT_DISPATCH', row['row_id'])
			continue
		if not present:
			if cause is not None and cause.get('kind') == 'STOPPED_AFTER_DRAIN':
				halted = True
				continue
			if eof_invalid:
				halted = True
				continue
			_fail('UNEXPLAINED_MISSING_ROW', row['row_id'])
		record = records_by_ordinal[row['ordinal']]
		if record['kind'] != 'COMPLETE':
			halted = True
		elif record['status'] == 'FAIL':
			failed_slots.add(row['slot'])
	if cause is not None and cause.get('kind') == 'STOPPED_AFTER_DRAIN':
		halted = True
	run_identity = {'sha256': _sha(run_storage), 'bytes': len(run_storage)}
	path_records = []
	path_identities = []
	total_pass = total_fail = total_ineligible = total_stopped = 0
	total_aborted = total_missing = total_invalid = total_completed = 0
	for route in _ROUTES:
		slot = route['slot']
		scheduled = [row for row in rows if row['slot'] == slot]
		completed_rows = []
		invalid_rows = []
		first_fail = None
		for row in scheduled:
			record = records_by_ordinal.get(row['ordinal'])
			if record is None:
				continue
			if record['kind'] == 'COMPLETE':
				completed_rows.append({'row_id': row['row_id'], 'ordinal': row['ordinal'], 'cell': row['cell'], 'index': row['index'], 'status': record['status'], 'completion_sha256': record['completion_sha256'], 'completion_bytes': record['completion_bytes']})
				if record['status'] == 'FAIL' and first_fail is None:
					first_fail = row['ordinal']
			else:
				invalid_rows.append({'ordinal': row['ordinal'], 'reason': record['kind']})
		ineligible = []
		stopped = []
		aborted = []
		missing = []
		for row in scheduled:
			if row['ordinal'] in records_by_ordinal:
				continue
			if first_fail is not None and row['ordinal'] > first_fail:
				ineligible.append(row['ordinal'])
			elif cause is not None and cause.get('kind') == 'STOPPED_AFTER_DRAIN':
				stopped.append(row['ordinal'])
			elif bad or eof_invalid:
				aborted.append(row['ordinal'])
			else:
				missing.append(row['ordinal'])
		if missing:
			_fail('PATH_UNEXPLAINED_MISSING', f'{slot}:{missing}')
		pass_count = sum((item['status'] == 'PASS' for item in completed_rows))
		fail_count = sum((item['status'] == 'FAIL' for item in completed_rows))
		if fail_count > 1:
			_fail('MULTIPLE_SUBJECT_FAILURES', slot)
		if invalid_rows:
			status = 'CONTROLLER_INVALID'
		elif aborted:
			status = 'CONTROLLER_ABORTED'
		elif stopped:
			status = 'STOPPED_AFTER_DRAIN'
		elif fail_count:
			status = 'VALID_SUBJECT_FAIL'
		elif len(completed_rows) == len(scheduled):
			status = 'PASS'
		else:
			_fail('PATH_STATUS_UNCLASSIFIED', slot)
		artifact_rows = [{'stage': stage_id, 'sha256': _sha(actual_artifacts[slot, stage_id]['storage']), 'bytes': len(actual_artifacts[slot, stage_id]['storage'])} for stage_id in sorted((stage for artifact_slot, stage in actual_artifacts if artifact_slot == slot))]
		completion_inventory = _canon(completed_rows)
		expected_path = {'schema_id': 'pw-r9-path-terminal-v3', 'run_id': run_root.name, 'run_sha256': run_identity['sha256'], 'run_bytes': run_identity['bytes'], 'slot': slot, 'status': status, 'scheduled_rows': len(scheduled), 'completed_rows': len(completed_rows), 'pass_rows': pass_count, 'subject_fail_rows': fail_count, 'invalid_rows': invalid_rows, 'ineligible_after_subject_fail_ordinals': ineligible, 'stopped_after_signal_ordinals': stopped, 'controller_aborted_ordinals': aborted, 'missing_ordinals': [], 'stage_artifacts': artifact_rows, 'stage_artifact_count': len(artifact_rows), 'completion_inventory_sha256': _sha(completion_inventory), 'completion_inventory_bytes': len(completion_inventory)}
		path_storage, actual_path = _json_file(run_root / 'terminals' / f'{slot}.json', f'path terminal {slot}')
		if not _same(actual_path, expected_path):
			_fail('PATH_TERMINAL_MISMATCH', slot)
		path_records.append(expected_path)
		path_identities.append({'slot': slot, 'sha256': _sha(path_storage), 'bytes': len(path_storage)})
		total_pass += pass_count
		total_fail += fail_count
		total_invalid += len(invalid_rows)
		total_ineligible += len(ineligible)
		total_stopped += len(stopped)
		total_aborted += len(aborted)
		total_missing += len(missing)
		total_completed += len(completed_rows)
	artifact_count = len(actual_artifacts)
	full_matrix = len(rows) == 291
	clean_matrix = full_matrix and total_pass == 291 and (total_fail == 0) and (total_invalid == 0) and (total_ineligible == 0) and (total_stopped == 0) and (total_aborted == 0) and (total_missing == 0) and (total_completed == 291) and (artifact_count == 54)
	if bad or eof_invalid:
		matrix_status = 'CONTROLLER_INVALID'
	elif cause is not None and cause.get('kind') == 'STOPPED_AFTER_DRAIN':
		matrix_status = 'STOPPED_AFTER_DRAIN'
	elif total_fail:
		matrix_status = 'VALID_SUBJECT_FAIL'
	elif full_matrix and clean_matrix or (not full_matrix and total_completed == len(rows) and (total_pass == len(rows))):
		matrix_status = 'PASS'
	else:
		_fail('MATRIX_STATUS_UNCLASSIFIED', run_root.name)
	spawn_prefix_count = sum((record['kind'] == 'SPAWN_FAILURE' for record in typed))
	terminal_prefix_count = sum((record['kind'] == 'TERMINAL_FAILURE' for record in typed))
	expected_matrix = {'schema_id': 'pw-r9-matrix-terminal-v3', 'run_id': run_root.name, 'run_sha256': run_identity['sha256'], 'run_bytes': run_identity['bytes'], 'status': matrix_status, 'cause': cause, 'scheduled_rows': len(rows), 'completed_rows': total_completed, 'pass_rows': total_pass, 'subject_fail_rows': total_fail, 'invalid_rows': total_invalid, 'ineligible_rows': total_ineligible, 'stopped_rows': total_stopped, 'controller_aborted_rows': total_aborted, 'missing_rows': total_missing, 'stage_artifact_count': artifact_count, 'invalid_stage_artifact_count': 0, 'required_clean_stage_artifacts': 54 if full_matrix else 0, 'spawn_failure_prefix_count': spawn_prefix_count, 'terminal_failure_prefix_count': terminal_prefix_count, 'clean_matrix': clean_matrix, 'path_terminals': path_identities, 'retry_count': 0, 'best_of': False, 'replacement_count': 0}
	if not _same(matrix, expected_matrix):
		_fail('MATRIX_TERMINAL_MISMATCH', 'matrix_terminal.json')
	accounting_storage, accounting = _json_file(run_root / 'accounting.json', 'accounting')
	attempts = len(records_by_ordinal)
	captured_spawn = attempts
	captured_raw = sum((record['raw_present'] for record in records_by_ordinal.values()))
	expected_accounting = {'schema_id': 'pw-r9-accounting-v3', 'run_id': run_root.name, 'run_sha256': run_identity['sha256'], 'run_bytes': run_identity['bytes'], 'status': matrix_status, 'matrix_terminal_sha256': _sha(matrix_storage), 'matrix_terminal_bytes': len(matrix_storage), 'planned_calls': len(rows), 'attempts': attempts, 'captured_spawn_records': captured_spawn, 'captured_raw_results': captured_raw, 'valid_completions': total_completed, 'pass_rows': total_pass, 'subject_fail_rows': total_fail, 'spawn_failure_prefix_count': spawn_prefix_count, 'terminal_failure_prefix_count': terminal_prefix_count, 'ineligible_rows': total_ineligible, 'stopped_rows': total_stopped, 'controller_aborted_rows': total_aborted, 'invalid_rows': total_invalid, 'missing_rows': total_missing, 'stage_artifact_count': artifact_count, 'invalid_stage_artifact_count': 0, 'unknown_or_uncaptured_dispatches': max(0, attempts - captured_spawn), 'unknown_or_uncaptured_terminal_deliveries': max(0, captured_spawn - captured_raw), 'retry_count': 0, 'best_of': False, 'replacement_count': 0, 'accounting_is_last_run_write': True}
	if not _same(accounting, expected_accounting):
		_fail('ACCOUNTING_MISMATCH', 'accounting.json')
	counts = {'planned_calls': len(rows), 'attempts': attempts, 'captured_spawn_records': captured_spawn, 'captured_raw_results': captured_raw, 'completed_rows': total_completed, 'pass_rows': total_pass, 'subject_fail_rows': total_fail, 'invalid_rows': total_invalid, 'ineligible_rows': total_ineligible, 'stopped_rows': total_stopped, 'controller_aborted_rows': total_aborted, 'missing_rows': total_missing, 'stage_artifacts': artifact_count, 'invalid_stage_artifacts': 0, 'spawn_failure_prefix_count': spawn_prefix_count, 'terminal_failure_prefix_count': terminal_prefix_count, 'retry_count': 0, 'replacement_count': 0, 'best_of_count': 0, 'accounting_bytes': len(accounting_storage)}
	return (expected_matrix, expected_accounting, counts)

def _global_freshness(evidence_root):
	inventory = _entries(evidence_root, 'evidence root')
	seen = {}
	runs = 0
	for run_name, is_directory in sorted(inventory.items()):
		if not is_directory:
			_fail('EVIDENCE_ROOT_FILE_FORBIDDEN', run_name)
		_name(run_name, 'sibling run name')
		sibling = evidence_root / run_name
		_, run = _json_file(sibling / 'run.json', f'sibling run {run_name}')
		if set(run) != _RUN_FIELDS or run.get('schema_id') != 'pw-r9-run-v4' or run.get('run_id') != run_name:
			_fail('SIBLING_RUN_MANIFEST', run_name)
		run_kind = run.get('run_kind')
		if run_kind not in {'simulate', 'run-canary', 'run-matrix'}:
			_fail('SIBLING_RUN_KIND', run_name)
		identity = _component_identity(run.get('component_identity'), f'sibling {run_name} identity')
		mode = 'synthetic' if run_kind == 'simulate' else 'actual'
		expected_count = 3 if run_kind == 'run-canary' else 291
		cells_per_route = 1 if run_kind == 'run-canary' else 97
		fixed = {'schema_id': 'pw-r9-run-v4', 'run_id': run_name, 'run_kind': run_kind, 'mode': mode, 'shared_authorities': _SHARED, 'routes': _ROUTES, 'route_count': 3, 'cells_per_route': cells_per_route, 'cell_count': 97, 'planned_call_count': expected_count, 'stage_count': 18, 'required_clean_stage_artifact_count': 0 if expected_count == 3 else 54, 'regression_family_count': 22, 'regression_variant_count': 56, 'global_fault_count': 10, 'semantic_counterfactual_count': 7, 'retry_count': 0, 'best_of': False, 'replacement_count': 0}
		if any((not _same(run.get(key), value) for key, value in fixed.items())):
			_fail('SIBLING_RUN_FIXED_BINDING', run_name)
		_validate_provenance(run.get('component_provenance'), identity)
		_text(run.get('created_utc'), 'sibling created UTC')
		if mode == 'synthetic':
			_name(run.get('scenario'), 'sibling scenario')
			synthetic_custody = {'mode': 'SYNTHETIC_PRECOMMIT_ALLOWED', 'required': False, 'qualification_credit': 0, 'current_git_custody_reported_by_verifier': True}
			if not _same(run.get('custody'), synthetic_custody):
				_fail('SIBLING_CUSTODY', run_name)
		else:
			if run.get('scenario') is not None:
				_fail('SIBLING_ACTUAL_SCENARIO', run_name)
			custody = _exact(run.get('custody'), {'mode', 'required', 'status', 'head', 'origin_main', 'tracked_component_count', 'tracked_shared_authority_count', 'scoped_clean', 'head_blob_equal'}, 'sibling actual custody')
			if not _same({key: custody.get(key) for key in ('mode', 'required', 'status', 'tracked_component_count', 'tracked_shared_authority_count', 'scoped_clean', 'head_blob_equal')}, {'mode': 'ACTUAL_GIT_CUSTODY', 'required': True, 'status': 'PASS', 'tracked_component_count': 4, 'tracked_shared_authority_count': 3, 'scoped_clean': True, 'head_blob_equal': True}):
				_fail('SIBLING_CUSTODY', run_name)
			head = _text(custody.get('head'), 'sibling custody head')
			if not _re.fullmatch('[0-9a-f]{40,64}', head) or custody.get('origin_main') != head:
				_fail('SIBLING_CUSTODY', run_name)
		schedule = run.get('schedule')
		if not isinstance(schedule, list) or len(schedule) != expected_count:
			_fail('SIBLING_SCHEDULE_COUNT', run_name)
		for ordinal, raw in enumerate(schedule):
			row = _exact(raw, _ROW_FIELDS, f'sibling {run_name} row {ordinal}')
			row_id = f'row-{ordinal:03d}'
			if row.get('row_id') != row_id or not _same(_integer(row.get('ordinal'), 'sibling ordinal'), ordinal) or (not _same(_integer(row.get('index'), 'sibling index'), ordinal)):
				_fail('SIBLING_ROW_ORDER', f'{run_name}:{ordinal}')
			slot = _name(row.get('slot'), 'sibling slot')
			cell = _name(row.get('cell'), 'sibling cell')
			nonce_input = [run_name, ordinal, slot, cell]
			nonce = _sha(_canon(nonce_input))
			invocation = f'r9-invocation:{nonce}'
			task = f'r9_{nonce}'
			path = f'/root/{task}'
			if row.get('nonce') != nonce or row.get('invocation_id') != invocation or row.get('task_name') != task or (row.get('expected_canonical_task_path') != path):
				_fail('SIBLING_IDENTITY_DERIVATION', f'{run_name}:{ordinal}')
			for value, kind in ((nonce, 'nonce'), (invocation, 'invocation'), (path, 'path')):
				prior = seen.get(value)
				if prior is not None:
					_fail('GLOBAL_IDENTITY_COLLISION', f'{prior} and {run_name}:{ordinal}:{kind}')
				seen[value] = f'{run_name}:{ordinal}:{kind}'
		runs += 1
	return (runs, len(seen))

def _scenario_binding(run, scenario_map, matrix, counts):
	if run['mode'] != 'synthetic':
		return
	scenario = scenario_map[run['scenario']]
	if matrix.get('status') == 'STOPPED_AFTER_DRAIN':
		z = 'subject_fail_rows invalid_rows ineligible_rows controller_aborted_rows missing_rows invalid_stage_artifacts spawn_failure_prefix_count terminal_failure_prefix_count retry_count replacement_count best_of_count'.split()
		n = counts['completed_rows']
		if matrix.get('cause', {}).get('kind') != 'STOPPED_AFTER_DRAIN' or any(counts[key] for key in z) or not _same([counts['planned_calls'], counts['attempts'], counts['captured_spawn_records'], counts['captured_raw_results'], counts['pass_rows'], n + counts['stopped_rows']], [291,n,n,n,n,291]):
			_fail('SYNTHETIC_STOP_OUTCOME_MISMATCH', run['scenario'])
		return
	c=dict.fromkeys('stopped_rows missing_rows invalid_stage_artifacts retry_count replacement_count best_of_count'.split(),0)
	c['planned_calls']=291
	k='attempts captured_spawn_records captured_raw_results completed_rows pass_rows subject_fail_rows invalid_rows ineligible_rows controller_aborted_rows stage_artifacts spawn_failure_prefix_count terminal_failure_prefix_count'.split()
	cause=None
	if scenario in {'clean', 'delayed_multi_poll'}:
		v = (291,291,291,291,291,0,0,0,0,54,0,0)
		status = 'PASS'
	elif scenario.startswith('observed_') or scenario in {'malformed_output', 'partial_output'}:
		v = (3,3,3,3,0,3,0,288,0,0,0,0)
		status = 'VALID_SUBJECT_FAIL'
	elif scenario in {'missing_spawn','failed_spawn','missing_output','wrong_path','wrong_sender','wrong_type'}:
		generic=scenario.startswith('wrong_')
		raw=scenario in {'missing_output','wrong_sender','wrong_type'}
		v = (1,1,int(raw),0,0,0,1,0,290,0,int(not generic and not raw),int(not generic and raw))
		if generic:
			reason='spawn receipt/request' if scenario=='wrong_path' else 'terminal delivery ide'
			cause = {'kind':'CONTROLLER_INVALID','detail':f'ROW_0_INVALID:_Invalid:{reason}'}
		status = 'CONTROLLER_INVALID'
	else:
		_fail('SYNTHETIC_MALFORMED_SCENARIO_ADMITTED', scenario)
	wanted={**c,**dict(zip(k,v))}
	observed={key:counts.get(key) for key in wanted}
	if not _same(observed, wanted) or matrix.get('status') != status or (cause is not None and not _same(matrix.get('cause'), cause)):
		_fail('SYNTHETIC_SCENARIO_OUTCOME_MISMATCH', run['scenario'])

def _failure_report(run_id, run_kind, completed, error, component, shared, custody):
	return {'schema_id': 'pw-r9-offline-verifier-report-v4', 'valid': False, 'run_id': run_id, 'run_kind': run_kind, 'matrix_status': 'CONTROLLER_INVALID', 'error': {'code': error.code, 'detail': error.detail}, 'checks': {key: key in completed for key in _CHECKS}, 'counts': None, 'credit': {'qualification_clean_run_credit': 0, 'synthetic_credit': 0, 'controller_invalid_credit': 0}, 'component': component, 'custody': custody, 'shared_authorities': shared, 'calls': {'model': 0, 'collaboration': 0, 'provider': 0, 'subject': 0, 'network': 0}, 'authority': {'launch': False, 'qualification_claim': False, 'recursive': False}, 'residuals': ['Evidence failed closed and receives zero credit.']}

def verify(run_root: _pathlib.Path, expected: dict[str, object]) -> dict[str, object]:
	completed = []
	run_id = expected.get('run_id') if isinstance(expected, dict) and isinstance(expected.get('run_id'), str) else None
	run_kind = expected.get('run_kind') if isinstance(expected, dict) and isinstance(expected.get('run_kind'), str) else None
	component = None
	shared = None
	custody = None
	try:
		root, successor, component_storages, component = _bootstrap()
		completed.append('component_bootstrap')
		shared, shared_storages = _shared_authorities(successor)
		completed.append('shared_authorities')
		controls = _validate_semantic(component_storages['semantic_bundle.json'], component, shared)
		completed.append('semantic_bundle')
		expectation = _expected_interface(run_root, expected, component, shared)
		completed.append('expected_interface')
		run_storage, run, rows = _load_run(run_root, expectation, controls, shared, component)
		completed.extend(('run_manifest', 'component_equivalence'))
		custody = _reported_custody(run, root, successor, component_storages, shared_storages)
		completed.append('present_custody')
		root_inventory = _entries(run_root, 'run root')
		wanted_root = {'run.json': False, 'rows': True, 'artifacts': True, 'terminals': True, 'matrix_terminal.json': False, 'accounting.json': False}
		if root_inventory != wanted_root:
			_fail('RUN_ROOT_INVENTORY', str(sorted(root_inventory.items())))
		terminal_inventory = _entries(run_root / 'terminals', 'terminals')
		if terminal_inventory != {f"{route['slot']}.json": False for route in _ROUTES}:
			_fail('TERMINAL_INVENTORY', str(sorted(terminal_inventory.items())))
		row_inventory = _entries(run_root / 'rows', 'rows')
		declared = {row['row_id'] for row in rows}
		if any((not is_directory or name not in declared for name, is_directory in row_inventory.items())):
			_fail('ROW_ROOT_INVENTORY', str(sorted(row_inventory.items())))
		completed.append('exact_inventory')
		actual_artifacts = _load_artifacts(run_root, controls)
		records = {}
		records_by_ordinal = {}
		created_artifacts = {}
		failed_slots = set()
		globally_halted = False
		for row in rows:
			if row['row_id'] not in row_inventory:
				continue
			if row['slot'] in failed_slots:
				_fail('POST_SUBJECT_FAIL_DISPATCH', row['row_id'])
			if globally_halted:
				_fail('POST_GLOBAL_HALT_DISPATCH', row['row_id'])
			files = _entries(run_root / 'rows' / row['row_id'], f"row {row['row_id']}")
			if any(files.values()):
				_fail('NESTED_ROW_ENTRY', row['row_id'])
			backend = controls['scenario_map'][run['scenario']] if run['mode'] == 'synthetic' else None
			record = _row(run_root, run, row, controls['cell_by_id'][row['cell']], records, created_artifacts, set(files), backend)
			records_by_ordinal[row['ordinal']] = record
			if record['kind'] == 'COMPLETE':
				records[row['slot'], row['cell']] = record
				if record['status'] == 'PASS':
					_finalize(run_root, row, controls['cell_by_id'][row['cell']], controls, records, actual_artifacts, created_artifacts)
				else:
					failed_slots.add(row['slot'])
			else:
				globally_halted = True
		if set(actual_artifacts) != set(created_artifacts):
			extra = sorted(set(actual_artifacts) - set(created_artifacts))
			missing = sorted(set(created_artifacts) - set(actual_artifacts))
			_fail('STAGE_ARTIFACT_INVENTORY', f'extra={extra}, missing={missing}')
		completed.extend(('row_chains', 'causal_dependency_gates', 'provider_bytes', 'transport_captures', 'deterministic_scores', 'stage_artifacts'))
		matrix, accounting, counts = _validate_terminals(run_root, run_storage, run, rows, records_by_ordinal, actual_artifacts)
		_scenario_binding(run, controls['scenario_map'], matrix, counts)
		completed.extend(('schedule_and_stop_rules', 'path_terminals', 'matrix_terminal', 'accounting'))
		scanned, unique = _global_freshness(expectation['evidence_root'])
		counts['evidence_runs_scanned'] = scanned
		counts['globally_unique_identity_and_nonce_values'] = unique
		completed.append('global_freshness')
		qualification = int(run_kind == 'run-matrix' and run['mode'] == 'actual' and (matrix['status'] == 'PASS') and (matrix['clean_matrix'] is True) and (counts['planned_calls'] == 291) and (counts['pass_rows'] == 291) and (counts['completed_rows'] == 291) and (counts['stage_artifacts'] == 54) and all((counts[key] == 0 for key in ('subject_fail_rows', 'invalid_rows', 'ineligible_rows', 'stopped_rows', 'controller_aborted_rows', 'missing_rows', 'invalid_stage_artifacts', 'spawn_failure_prefix_count', 'terminal_failure_prefix_count', 'retry_count', 'replacement_count', 'best_of_count'))) and (custody.get('status') == 'PASS'))
		report = {'schema_id': 'pw-r9-offline-verifier-report-v4', 'valid': True, 'run_id': expectation['run_id'], 'run_kind': expectation['run_kind'], 'matrix_status': matrix['status'], 'error': None, 'checks': {key: True for key in _CHECKS}, 'counts': counts, 'credit': {'qualification_clean_run_credit': qualification, 'synthetic_credit': 0, 'controller_invalid_credit': 0}, 'component': component, 'custody': custody, 'shared_authorities': shared, 'calls': {'model': 0, 'collaboration': 0, 'provider': 0, 'subject': 0, 'network': 0}, 'authority': {'launch': False, 'qualification_claim': False, 'recursive': False}, 'residuals': ['A final filesystem snapshot cannot reconstruct historical create-only and fsync system calls.', 'Effective provider routing and activity not exposed to the root remain trusted-platform residuals.', 'Recorded component provenance paths are nonauthoritative and are never reopened or compared with the current component root.']}
		if set(report) != {'schema_id', 'valid', 'run_id', 'run_kind', 'matrix_status', 'error', 'checks', 'counts', 'credit', 'component', 'custody', 'shared_authorities', 'calls', 'authority', 'residuals'}:
			_fail('REPORT_SHAPE', 'success report')
		_canon(report)
		return report
	except _Invalid as exc:
		return _failure_report(run_id, run_kind, completed, exc, component, shared, custody)
	except BaseException as exc:
		error = _Invalid('UNEXPECTED_VERIFIER_ERROR', f'{type(exc).__name__}: {exc}')
		return _failure_report(run_id, run_kind, completed, error, component, shared, custody)
