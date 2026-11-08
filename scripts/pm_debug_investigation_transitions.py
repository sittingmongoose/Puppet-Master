"""Production entry points of the DDBG static checkers (DL-428/429 included).

Every refusal comes from a named row of a guard table in the phase modules
pm_debug_investigation_guards_<phase>.py. These wrappers build the same phase Case the
proof adapter gives the guard-isolation tool, run its original check, and
report the row the table issued. All source/proof inputs are fixture
projections; native owner exclusion, original receipts and evidence
dereference remain NOT_RUN.

The tool exposes no public single-case entry point. evaluate() therefore binds
the table with the engine's own GuardTable._bind/_restore, outside every
scanned checker module (tool-issues item recorded in the DDBG report).
"""
import copy
import json
from pathlib import Path

import pm_guard_isolation as g
import pm_debug_investigation_guard_constants as guards
import pm_debug_investigation_guards_admission as admission
import pm_debug_investigation_guards_envelope as envelope
import pm_debug_investigation_guards_family as family
import pm_debug_investigation_guards_instrumentation as instrumentation
import pm_debug_investigation_guards_instrumentation_detail as instrumentation_detail
import pm_debug_investigation_guards_instrumentation_detail_values_a as instrumentation_detail_values_a
import pm_debug_investigation_guards_instrumentation_detail_values_b as instrumentation_detail_values_b
import pm_debug_investigation_guards_instrumentation_detail_values_c as instrumentation_detail_values_c
import pm_debug_investigation_guards_instrumentation_detail_values_d as instrumentation_detail_values_d
import pm_debug_investigation_guards_instrumentation_detail_required as instrumentation_detail_required
import pm_debug_investigation_guards_instrumentation_joins as instrumentation_joins
import pm_debug_investigation_guards_instrumentation_source as instrumentation_source
import pm_debug_investigation_guards_instrumentation_source_values as instrumentation_source_values
import pm_debug_investigation_guards_lifecycle as lifecycle
import pm_debug_investigation_guards_payload as payload
import pm_debug_investigation_guards_payload_values as payload_values
import pm_debug_investigation_guards_references as references
import pm_debug_investigation_guards_retained as retained
import pm_debug_investigation_guards_retry as retry
import pm_debug_investigation_guards_target_payload as target_payload

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = 'Plans/debug_investigation_event_payloads.schema.json'
DIALECT = 'https://json-schema.org/draft/2020-12/schema'
FAILED_REASONS = guards.FAILED_REASONS
TERMINAL = guards.TERMINAL
ATTENTION = guards.ATTENTION
INSTRUMENTATION_EVENT = 'debug.investigation.instrumentation_state_changed'
LIFECYCLE_EVENT = 'debug.investigation.state_changed'
TARGET_EVENT = 'debug.investigation.target_bound'
FAMILIES = ('context_item_added', 'context_item_state_changed', 'exported', 'imported',
            'instrumentation_state_changed', 'started', 'target_bound', 'verification_recorded',
            'state_changed')
# Payloads judged in two exact parts (structure, then property values), so no
# payload suite needs more than the guard tool's per-command time.
SPLIT_PAYLOADS = ('instrumentation_state_changed', 'started', 'target_bound', 'state_changed')
# The one pattern in the companion schema, kept by the payload phase as the
# payload.target_sha256_hex row plus its type and length rows.
SUPPORTED_PATTERN = (('$defs', 'target_bound', 'properties', 'target_bindings', 'properties', 'source_sha256'),
                     '^[0-9a-f]{64}$')
# Fixture-suite lists ride along in each fixture case but are not part of the
# candidate event; checkers judge the candidate without them.
FIXTURE_SUITE_KEYS = ('negative_cases', 'retry_cases', 'transition_cases', 'native_oracles',
                      'checks', 'mode_cases', 'retry_request_cases')
# Lane summary codes for schema rows (the row itself is reported beside it).
SCHEMA_CODES = {
    guards.PAYLOAD_URI: 'invalid_payload',
    guards.LIFECYCLE_URI: 'invalid_lifecycle_source',
    guards.SOURCE_URI: 'invalid_instrumentation_source',
    guards.SOURCE_VALUES_URI: 'invalid_instrumentation_source',
    guards.DETAIL_URI: 'invalid_detail',
    guards.DETAIL_VALUES_A_URI: 'invalid_detail',
    guards.DETAIL_VALUES_B_URI: 'invalid_detail',
    guards.DETAIL_VALUES_C_URI: 'invalid_detail',
    guards.DETAIL_VALUES_D_URI: 'invalid_detail',
    guards.DETAIL_REQUIRED_URI: 'invalid_detail',
    guards.PAYLOAD_VALUES_URI: 'invalid_payload',
    guards.RETRY_URI: 'invalid_retry_request'}
SCHEMA_LABELS = {
    guards.PAYLOAD_URI: 'payload',
    guards.LIFECYCLE_URI: 'lifecycle_source',
    guards.SOURCE_URI: 'instrumentation_source',
    guards.SOURCE_VALUES_URI: 'instrumentation_source',
    guards.DETAIL_URI: 'instrumentation_change_detail',
    guards.DETAIL_VALUES_A_URI: 'instrumentation_change_detail',
    guards.DETAIL_VALUES_B_URI: 'instrumentation_change_detail',
    guards.DETAIL_VALUES_C_URI: 'instrumentation_change_detail',
    guards.DETAIL_VALUES_D_URI: 'instrumentation_change_detail',
    guards.DETAIL_REQUIRED_URI: 'instrumentation_change_detail',
    guards.PAYLOAD_VALUES_URI: 'payload',
    guards.RETRY_URI: 'cleanup_retry_request'}


def patterns(node, path=()):
    """Every pattern keyword of the companion schema, by path."""
    found = []
    if isinstance(node, dict):
        if 'pattern' in node:
            found.append((path, node['pattern']))
        for key, child in node.items():
            found.extend(patterns(child, path + (key,)))
    elif isinstance(node, list):
        for index, child in enumerate(node):
            found.extend(patterns(child, path + (index,)))
    return found


def documents(schema):
    """Per-phase schema documents for the guard tables, from the companion schema."""
    found = patterns(schema)
    if found != [SUPPORTED_PATTERN]:
        raise ValueError('companion schema patterns changed; only the target_bound digest pattern is supported: ' + repr(found))
    defs = schema['$defs']

    def document(name):
        return {'$schema': DIALECT, **copy.deepcopy(defs[name])}
    result = {
        'lifecycle': {guards.LIFECYCLE_URI: document('lifecycle_source')},
        **source_documents(document('instrumentation_source')),
        # The detail rows judge the record payload.detail_ref names, wrapped as {'detail': record}.
        **detail_documents(defs['instrumentation_change_detail']),
        'retry_request': {guards.RETRY_URI: document('cleanup_retry_request')}}
    for name in FAMILIES:
        closed = document(name)
        if name == 'target_bound':
            del closed['properties']['target_bindings']['properties']['source_sha256']['pattern']
        if name in SPLIT_PAYLOADS:
            structure, values = split_properties(closed)
            result['debug.investigation.' + name] = {guards.PAYLOAD_URI: structure}
            result['debug.investigation.' + name + '#values'] = {guards.PAYLOAD_VALUES_URI: dict(values, **{'$schema': DIALECT})}
        else:
            result['debug.investigation.' + name] = {guards.PAYLOAD_URI: closed}
    return result


def source_documents(source):
    structure, values = split_properties(source)
    return {'instrumentation_source': {guards.SOURCE_URI: structure},
            'instrumentation_source_values': {guards.SOURCE_VALUES_URI: dict(values, **{'$schema': DIALECT})}}


def split_properties(definition):
    """(structure, values): every keyword but the property constraints, with each
    property kept as an empty schema; and {'properties': the constraints}. Refused
    unless the two recombine to the definition."""
    keys = list(definition['properties'])
    structure = {key: copy.deepcopy(value) for key, value in definition.items() if key != 'properties'}
    structure['properties'] = {key: {} for key in keys}
    values = {'properties': copy.deepcopy(definition['properties'])}
    if dict(structure, properties=values['properties']) != definition:
        raise ValueError('schema parts do not recombine to the published definition')
    return structure, values


# Which document keys each schema-using phase module holds.
DOCUMENT_MODULES = ((lifecycle, ('lifecycle',)), (instrumentation_source, ('instrumentation_source',)),
                    (instrumentation_source_values, ('instrumentation_source_values',)),
                    (instrumentation_detail, ('instrumentation_detail',)),
                    (instrumentation_detail_required, ('instrumentation_detail_required',)),
                    (instrumentation_detail_values_a, ('instrumentation_detail_values_a',)),
                    (instrumentation_detail_values_b, ('instrumentation_detail_values_b',)),
                    (instrumentation_detail_values_c, ('instrumentation_detail_values_c',)),
                    (instrumentation_detail_values_d, ('instrumentation_detail_values_d',)), (retry, ('retry_request',)),
                    (payload, tuple('debug.investigation.' + name for name in FAMILIES if name != 'target_bound')),
                    (payload_values, tuple('debug.investigation.' + name for name in SPLIT_PAYLOADS)),
                    (target_payload, (TARGET_EVENT,)))


LOADED = {'keys': None}


def detail_documents(detail):
    """The detail definition in six exact parts: structure (every keyword but the
    property constraints and the second half of the required list, with each
    property kept as an empty schema); the second half of the required list; and
    the constraints of its properties 1-5, 11-20, 21-30 and 6-10."""
    keys = list(detail['properties'])
    required = list(detail['required'])
    half = len(required) // 2
    structure = {key: copy.deepcopy(value) for key, value in detail.items() if key not in ('properties', 'required')}
    structure['required'] = required[:half]
    structure['properties'] = {key: {} for key in keys}
    required_b = {'required': required[half:]}
    groups = (keys[:5], keys[10:20], keys[20:], keys[5:10])
    parts = tuple({key: copy.deepcopy(detail['properties'][key]) for key in group} for group in groups)
    merged = {key: value for part in parts for key, value in part.items()}
    recombined = dict(structure, required=structure['required'] + required_b['required'],
                      properties={key: merged[key] for key in keys if key in merged})
    if recombined != detail or list(recombined['properties']) != keys or sum(len(part) for part in parts) != len(keys):
        raise ValueError('detail schema parts do not recombine to the published definition')

    def wrapped(part):
        return {'$schema': DIALECT, 'properties': {'detail': part}}
    return {'instrumentation_detail': {guards.DETAIL_URI: wrapped(structure)},
            'instrumentation_detail_required': {guards.DETAIL_REQUIRED_URI: wrapped(required_b)},
            'instrumentation_detail_values_a': {guards.DETAIL_VALUES_A_URI: wrapped({'properties': parts[0]})},
            'instrumentation_detail_values_b': {guards.DETAIL_VALUES_B_URI: wrapped({'properties': parts[1]})},
            'instrumentation_detail_values_c': {guards.DETAIL_VALUES_C_URI: wrapped({'properties': parts[2]})},
            'instrumentation_detail_values_d': {guards.DETAIL_VALUES_D_URI: wrapped({'properties': parts[3]})}}


def load_documents(schema=None, only=None):
    """Give each phase module its documents (all of them, or only these keys for one proof suite)."""
    wanted = 'all' if only is None else tuple(only)
    if schema is None and LOADED['keys'] == wanted:
        return
    loaded = documents(schema if schema is not None else json.loads((ROOT / SCHEMA).read_text()))
    LOADED['schema'] = loaded
    for module, keys in DOCUMENT_MODULES:
        # The values part of a split payload is stored under its event type in its own module.
        suffix = '#values' if module is payload_values else ''
        module.DOCUMENTS = {key: loaded[key + suffix] for key in keys if only is None or key + suffix in only}
    LOADED['keys'] = wanted
    BUILT.clear()


# Phases whose Case does not depend on the candidate (context None, documents
# chosen only by event type). Production reuses one built Case per document
# key; GuardTable._restore returns its table to the unbound original after each
# run. The proof still builds a fresh Case for every evaluation.
REUSABLE = {payload.payload_case: 'event_type', target_payload.target_payload_case: 'event_type',
            payload_values.payload_values_case: 'event_type',
            lifecycle.lifecycle_case: None, instrumentation_source.instrumentation_source_case: None,
            instrumentation_source_values.instrumentation_source_values_case: None,
            retry.retry_request_case: None, admission.admission_case: None}
BUILT = {}


def run_phase(factory, value):
    """Run one phase's original check through its table: (issued row, its code) or (None, None)."""
    load_documents()
    if factory in REUSABLE:
        key = (factory, value.get(REUSABLE[factory]) if REUSABLE[factory] else None, LOADED['keys'])
        if key not in BUILT:
            BUILT[key] = factory(value)
        built = BUILT[key]
    else:
        built = factory(value)
    table = built.table
    table._bind(value, built.context, frozenset())
    try:
        result = built.check(value)
    except g.GuardRefusal as refusal:
        uri = row_uri(refusal.guard)
        return refusal.guard, SCHEMA_CODES[uri] if uri is not None else refusal.code
    finally:
        table._restore()
    if result is not True:
        raise RuntimeError('phase check returned a non-True result')
    return None, None


def evaluate(factory, value):
    """The issued row of one phase, or None."""
    return run_phase(factory, value)[0]


def row_uri(row):
    return row[len('schema:'):].split('#', 1)[0] if row.startswith('schema:') else None


def row_label(row):
    """Stable fixture label: code rows by name; schema rows by def and pointer, without the occurrence hash."""
    uri = row_uri(row)
    if uri is None:
        return row
    pointer = row.split('#', 1)[1].rsplit('@', 1)[0]
    if uri in (guards.DETAIL_URI, guards.DETAIL_REQUIRED_URI, guards.DETAIL_VALUES_A_URI, guards.DETAIL_VALUES_B_URI,
               guards.DETAIL_VALUES_C_URI, guards.DETAIL_VALUES_D_URI):
        pointer = pointer[len('/properties/detail'):]
    return SCHEMA_LABELS[uri] + '#' + pointer


# The top-level candidate members each phase reads (its factory, selectors and
# predicates). Proof inputs are projected to these; the lane runner shows that
# every phase gives the same row on the full candidate and on its projection.
PHASE_MEMBERS = {
    'envelope': ('envelope', 'owner_record', 'payload', 'project_id', 'scope_partition'),
    'payload': ('event_type', 'payload'),
    'payload_values': ('event_type', 'payload'),
    'family': ('event_type', 'mode_resolution', 'payload'),
    'lifecycle': ('lifecycle_source', 'payload'),
    'instrumentation_source': ('instrumentation_source',),
    'instrumentation_source_values': ('instrumentation_source',),
    'instrumentation_detail': ('detail_records', 'payload'),
    'instrumentation_detail_required': ('detail_records', 'payload'),
    'instrumentation_detail_values_a': ('detail_records', 'payload'),
    'instrumentation_detail_values_b': ('detail_records', 'payload'),
    'instrumentation_detail_values_c': ('detail_records', 'payload'),
    'instrumentation_detail_values_d': ('detail_records', 'payload'),
    'instrumentation_joins': ('detail_records', 'instrumentation_source', 'payload'),
    'instrumentation': ('detail_records', 'instrumentation_source', 'payload')}
# Value-part phases judge only some properties of one object; their proof input
# keeps only those properties (and, for the detail parts, only payload.detail_ref
# and the record it names).
VALUE_PARTS = {'payload_values': None, 'instrumentation_detail_values_a': guards.DETAIL_VALUES_A_URI,
               'instrumentation_detail_values_b': guards.DETAIL_VALUES_B_URI,
               'instrumentation_detail_values_c': guards.DETAIL_VALUES_C_URI,
               'instrumentation_detail_values_d': guards.DETAIL_VALUES_D_URI}
# The envelope rows read only these payload members.
ENVELOPE_PAYLOAD_KEYS = ('investigation_id', 'project_id', 'thread_id', 'run_id')


def part_keys(phase, case):
    loaded = documents(json.loads((ROOT / SCHEMA).read_text())) if 'schema' not in LOADED else LOADED['schema']
    if phase == 'payload_values':
        document = loaded.get(str(case.get('event_type')) + '#values')
        return None if document is None else list(document[guards.PAYLOAD_VALUES_URI]['properties'])
    uri = VALUE_PARTS[phase]
    return list(loaded[phase][uri]['properties']['detail']['properties'])


def projected(phase, case):
    result = {key: case[key] for key in PHASE_MEMBERS[phase] if key in case}
    if phase == 'envelope' and type(result.get('payload')) is dict:
        result['payload'] = {key: value for key, value in result['payload'].items() if key in ENVELOPE_PAYLOAD_KEYS}
    if phase not in VALUE_PARTS:
        return result
    keys = part_keys(phase, case)
    if phase == 'payload_values':
        if keys is not None and type(result.get('payload')) is dict:
            result['payload'] = {key: value for key, value in result['payload'].items() if key in keys}
        return result
    payload_value, records = result.get('payload'), result.get('detail_records')
    ref = payload_value.get('detail_ref') if type(payload_value) is dict else None
    if type(ref) is str and type(records) is dict and type(records.get(ref)) is dict:
        result['payload'] = {'detail_ref': ref}
        result['detail_records'] = {ref: {key: value for key, value in records[ref].items() if key in keys}}
    return result


def candidate(case):
    return {key: value for key, value in case.items() if key not in FIXTURE_SUITE_KEYS}


def phases(case):
    event = case.get('event_type')
    sequence = [('envelope', envelope.envelope_case),
                ('payload', target_payload.target_payload_case if event == TARGET_EVENT else payload.payload_case)]
    if event in tuple('debug.investigation.' + name for name in SPLIT_PAYLOADS):
        sequence.append(('payload_values', payload_values.payload_values_case))
    sequence.append(('family', family.family_case))
    if event == INSTRUMENTATION_EVENT:
        sequence += [('instrumentation_source', instrumentation_source.instrumentation_source_case),
                     ('instrumentation_source_values', instrumentation_source_values.instrumentation_source_values_case),
                     ('instrumentation_detail', instrumentation_detail.instrumentation_detail_case),
                     ('instrumentation_detail_required', instrumentation_detail_required.instrumentation_detail_required_case),
                     ('instrumentation_detail_values_a', instrumentation_detail_values_a.instrumentation_detail_values_a_case),
                     ('instrumentation_detail_values_d', instrumentation_detail_values_d.instrumentation_detail_values_d_case),
                     ('instrumentation_detail_values_b', instrumentation_detail_values_b.instrumentation_detail_values_b_case),
                     ('instrumentation_detail_values_c', instrumentation_detail_values_c.instrumentation_detail_values_c_case),
                     ('instrumentation_joins', instrumentation_joins.instrumentation_joins_case),
                     ('instrumentation', instrumentation.instrumentation_case)]
    if event == LIFECYCLE_EVENT:
        sequence.append(('lifecycle', lifecycle.lifecycle_case))
    return sequence


def phase_results(case):
    """Every phase of the family run on its own: [(phase, row, code)]."""
    return [(name, *run_phase(factory, case)) for name, factory in phases(case)]


def candidate_result(case):
    """The complete candidate append path: the first refusing phase, or (None, None, None)."""
    for name, factory in phases(case):
        row, code = run_phase(factory, case)
        if row is not None:
            return name, row, code
    return None, None, None


def candidate_refusal(case):
    return candidate_result(case)[2]


def lifecycle_refusal(case):
    return run_phase(lifecycle.lifecycle_case, case)[1]


def instrumentation_refusal(case):
    for name, factory in phases(dict(case, event_type=INSTRUMENTATION_EVENT)):
        if not name.startswith('instrumentation'):
            continue
        row, code = run_phase(factory, case)
        if row is not None:
            return code
    return None


def cleanup_retry_refusal(retries_used, authorized):
    """Owner's typed initiation decision, before allocating an attempt/body."""
    return run_phase(retry.retry_request_case, {'retries_used': retries_used, 'authorized': authorized})[1]


def admission_refusal(case, admitted=False, retention='PENDING_RETENTION_DECISION', withdrawn=False):
    value = {'case': case, 'admitted': admitted, 'retention': retention, 'withdrawn': withdrawn}
    return run_phase(admission.admission_case, value)[1]


def retained_value(case, original, withdrawn=False):
    original = dict(original, original_admission=list(original['original_admission']))
    return {'case': case, 'original': original, 'withdrawn': withdrawn}


def retained_refusal(case, original, withdrawn=False):
    """Read the original Storage projection, never the current owner transition.

    Source authentication and historical admission/recipe custody are native
    obligations. These vectors compare a selected original with the offered read.
    """
    return run_phase(retained.retained_case, retained_value(case, original, withdrawn))[1]


def schema_reference_refusal(schema):
    """Every $ref/$dynamicRef in every branch, including never-visited ones, resolves."""
    return run_phase(references.references_case, schema)[1]


# ---------------------------------------------------------------------------
# Shared probe builders: the lane runner and the proof adapter use the same
# controls and single-defect negatives for the admission, retained-history,
# retry-request and schema-reference checkers. Each negative names its row.
# ---------------------------------------------------------------------------

RESOLVED_RETENTION = 'RP-OPERATIONAL-2555D@1.0.0'


def admission_probes(case):
    """(controls, negatives) of admission values for one candidate."""
    def value(**changes):
        result = {'case': copy.deepcopy(case), 'admitted': True, 'retention': RESOLVED_RETENTION, 'withdrawn': False}
        result.update(changes)
        return result
    reader_only = value()
    reader_only['case']['envelope']['replay_policy'] = 'projector_replay_only'
    append_once = value()
    append_once['case']['envelope']['replay_policy'] = 'append_once'
    event_id = value()
    event_id['case']['envelope']['replay_policy'] = 'dedupe_by_event_id'
    controls = [('admitted', value())]
    negatives = [
        ('reader-only replay policy cannot append or retry', reader_only, 'admission.replay_only', 'replay_only_not_appendable'),
        ('current writer cannot select append_once', append_once, 'admission.writer_policy', 'writer_policy_mismatch'),
        ('current writer cannot select dedupe_by_event_id', event_id, 'admission.writer_policy', 'writer_policy_mismatch'),
        ('withdrawn family', value(withdrawn=True), 'admission.withdrawn', 'withdrawn'),
        ('family not on the registry', value(admitted=False), 'admission.registered', 'unregistered'),
        ('retention binding unresolved', value(retention='PENDING_RETENTION_DECISION'), 'admission.retention', 'retention_unresolved')]
    return controls, negatives


def retained_probes(case):
    """(controls, negatives) of retained-history values for one candidate.

    The original is retained with the reader-only replay policy; the live
    owner record and source state have changed since, which the historical
    reader must ignore.
    """
    historical = copy.deepcopy(case)
    historical['envelope']['replay_policy'] = 'projector_replay_only'
    original = {'case': copy.deepcopy(historical), 'original_admission': [case['event_type'], '1.0.0'],
                'recipe_ref': guards.RECIPE_REF}
    historical['owner_record']['investigation_id'] = 'different-live-investigation'
    if 'lifecycle_source' in historical:
        historical['lifecycle_source']['state'] = 'resolved'
    if 'instrumentation_source' in historical:
        historical['instrumentation_source']['state'] = 'cleaned'

    def value(offered=None, selected=None, withdrawn=False):
        return {'case': copy.deepcopy(offered if offered is not None else historical),
                'original': copy.deepcopy(selected if selected is not None else original), 'withdrawn': withdrawn}

    def offered(path, replacement):
        result = copy.deepcopy(historical)
        target = result
        for key in path[:-1]:
            target = target[key]
        target[path[-1]] = replacement
        return result
    controls = [('retained original after live changes', value())]
    negatives = [
        ('withdrawn history', value(withdrawn=True), 'retained.withdrawn', 'withdrawn'),
        ('original admission names another family', value(selected=dict(original, original_admission=['other.family', '1.0.0'])),
         'retained.admission', 'historical_admission_mismatch'),
        ('caller selects an older recipe', value(selected=dict(original, recipe_ref='caller-selected-old-recipe')),
         'retained.recipe', 'historical_recipe_mismatch'),
        ('offered record of another family', value(offered=offered(('event_type',), 'debug.investigation.other_family')),
         'retained.family', 'foreign_history'),
        ('forged Project scope changes the identity only', value(offered=offered(('project_id',), 'forged-project')),
         'retained.identity', 'forged_history_identity'),
        ('forged semantic body', value(offered=offered(('payload', case['mutation_field']), case['mutation_value'])),
         'retained.body', 'forged_history_body'),
        ('forged Storage sequence', value(offered=offered(('envelope', 'sequence_id'), 999)),
         'retained.sequence', 'forged_storage_metadata'),
        ('forged Storage observed time', value(offered=offered(('envelope', 'observed_at_utc'), '2026-11-04T01:00:00Z')),
         'retained.observed', 'forged_storage_metadata'),
        ('forged Storage persisted time', value(offered=offered(('envelope', 'persisted_at_utc'), '2026-11-04T01:00:01Z')),
         'retained.persisted', 'forged_storage_metadata')]
    return controls, negatives


def retry_request_probes(rows):
    """(controls, negatives) from the fixture's retry_request_cases."""
    controls, negatives = [], []
    for row in rows:
        request = row['request'] if 'request' in row else {'retries_used': row['retries_used'], 'authorized': row['authorized']}
        if row['expected_refusal'] is None:
            controls.append((row['case'], request))
        else:
            negatives.append((row['case'], request, row['guard'], row['expected_refusal']))
    return controls, negatives


def reference_proof_document(schema):
    """The smallest document the reference probes need: the companion schema's own
    identifiers and the one definition they point into. The guard tool snapshots
    the whole input at each checkpoint, so the proof judges the reference rows on
    this document; the lane runner judges the same probes on the full schema."""
    return {'$schema': schema['$schema'], '$id': schema['$id'],
            '$defs': {'lifecycle_source': copy.deepcopy(schema['$defs']['lifecycle_source'])}}


def reference_probes(schema):
    """(controls, negatives): the real schema, and one injected dormant reference per defect."""
    def injected(reference):
        result = copy.deepcopy(schema)
        result['$defs']['unvisited'] = {'$ref': reference}
        return result
    controls = [('companion schema', copy.deepcopy(schema))]
    negatives = [
        ('dormant reference with a plain-name anchor', injected('#no_such_anchor'), 'references.anchor_form'),
        ('dormant non-string reference', injected(5), 'references.anchor_form'),
        ('dormant reference to an undeclared base', injected('https://other.invalid/schema.json#/$defs/x'), 'references.base_known'),
        ('dormant reference to a missing definition', injected('#/$defs/no_such_definition'), 'references.target_exists'),
        ('dormant reference to a non-schema member', injected('#/$defs/lifecycle_source/required'), 'references.target_schema')]
    return controls, [(name, value, row, 'unresolved_schema_reference') for name, value, row in negatives]
