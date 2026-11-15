"""C12-GO run.started complete boundary (lane 18).

* Consumer contract boundary (Plans/run_started_consumer_contract_fixtures.json):
  owner schemas as whole-definition rows (EventRecord envelope, the selected
  run.started v2 payload, requested_effective_runtime snapshot, the
  event_record_index value schema and the run-started checkpoint), the s3ao
  `run_joins` distinct-copy joins (envelope, payload, snapshot, index,
  checkpoint and lookup copies, hashes recomputed from real preimages) and
  their single-defect witnesses.
* SP-265/SP-278 index adoption, retention and cleanup boundary: the pinned
  adoption_v4_check functions loaded by pm_goal_run_adoption_oracles, unchanged.
Every authored negative's target is declared before it runs; then the GO
witness search covers rows with no single-row kill.
"""
import ast
import base64
import copy
import hashlib
import os
from pathlib import Path

import pm_event_numbers as n
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c
import pm_goal_go_declare as declare
import pm_goal_go_schema as schemas

ROOT = Path(__file__).resolve().parents[1]
FAMILY = 'run.started'
PREFIX = declare.PREFIX
SEEDS = {}
GO_EVIDENCE = {}
CHECKS = {}
PLANS = ROOT / 'Plans'

# The run_joins row that compares the copy each authored static join case mutates
# (scripts/pm_goal_complete_oracles.py run_joins, read in source order).
STATIC_JOINS = {
    'event/payload/project_id': 'run.started/payload/project_id',
    'event/payload/run_id': 'run.started/payload/run_id',
    'lookup/requested_run_id': 'run.started/lookup/run_id',
    'snapshot/snapshot_sha256': 'run.started/snapshot_digest',
    'event/payload/requested_effective_snapshot_ref': 'run.started/payload_snapshot_ref',
    'checkpoint/source_cursor/last_sequence_id': 'run.started/source_cursor/sequence_id',
    'checkpoint/source_cursor/recovery_epoch': 'run.started/publication/recovery_epoch',
    'index/source_locator/segment_generation': 'run.started/source_cursor/segment_generation',
    'index/payload_sha256': 'run.started/index_payload_digest',
    'checkpoint/index_checkpoint_ref': 'run.started/full_index_checkpoint',
    'checkpoint/first_retained_sequence_id': 'run.started/coverage',
    'snapshot/effective_model': 'run.started/runtime/effective_model',
}
DOMAIN = ('project_join', 'scope_encoding', 'run_lookup_join', 'thread_join', 'event_identity', 'sequence_join',
          'coverage_order', 'source_payload_hash', 'producer_semantic_digest', 'immutable_snapshot_hash',
          'immutable_snapshot_ref', 'index_key', 'checkpoint_key', 'global_checkpoint_ref', 'new_start_key', 'new_start_id')
# adoption_v4_check.run_retention_eligible / shape: the first owner check reading the changed member.
RETENTION = {'root_schema': 'run retention root schema', 'selection_schema': 'run retention selection schema',
             'root_preimage': 'run cleanup exact root preimage and Storage/key',
             'selected_generation': 'cleanup selects exact retired generation, never current',
             'hold_scope_kind': 'fixture requires actual owner resolution for non-project hold scopes',
             'hold_key': 'actual registered hold key/value', 'hold_applicable': 'actual applicable hold scope',
             'duplicate_holds': 'unique resolved hold rows'}
SHAPES = {('successor_handoff', 'run_generation_admission'): 'run generation admission schema',
          ('successor_handoff', 'created_generation_admission'): 'created generation admission schema',
          ('original_creation_publication',): 'original_creation_publication schema',
          ('original_creation_commit_transaction',): 'original_creation_commit_transaction schema',
          ('run_started', 'event', 'payload'): 'run event schema',      # EventRecord types payload as object
          ('restore_created', 'event', 'payload'): 'created event schema',
          ('generic', 'checkpoint'): 'generic schema'}


def consumer_checks(registry):
    run = schemas.checker(PLANS / 'event_record.schema.json', '#', registry)
    payload_schema = c.load(PLANS / 'event_payload_run_started.schema.json')
    payload = schemas.checker(PLANS / 'event_payload_run_started.schema.json', '#', registry)

    def event(value):
        errors = run(value)
        if not errors:
            gate = c.Gates()
            gate.require('run.started/selected_payload_schema', value['payload_schema_id'] == payload_schema['$id'])
            errors |= gate.errors
        if not errors:
            errors |= payload(value['payload'])
        return errors
    index_schema = next(row['value_schema'] for row in c.load(PLANS / 'storage_value_registry.json')['families']
                        if row['family_id'] == 'event_record_index')
    index = schemas.checker(PLANS / 'storage_value_registry.json', '#/families/event_record_index/value_schema', registry,
                            current=False, schema=index_schema,
                            row='complete/owner_schema/Plans/storage_value_registry.json#/families/event_record_index/value_schema')
    return dict(event=event, payload=payload, envelope=run,
                snapshot=schemas.checker(PLANS / 'requested_effective_runtime.schema.json', '#', registry),
                checkpoint=schemas.checker(PLANS / 'run_started_consumer_contracts.schema.json', '#/$defs/checkpoint', registry),
                index=index)


def build_rule(checks):
    fixture = c.load(PLANS / 'run_started_consumer_contract_fixtures.json')
    schema_cases = {case['case_id']: case for case in fixture['schema_cases']}
    join_cases = {case['case_id']: case for case in fixture['static_join_cases']}
    adoption = {case['case_id']: case for case in c.load(PLANS / 'event_index_consumer_adoption_fixtures.json')['negative']}
    retention = {case['case_id']: case for case in c.load(PLANS / 'run_started_checkpoint_retention_fixtures.json')['cases']}
    bank = c.load(ROOT / 'tests/fixtures/pnc019_goal_adoption_helper_witnesses.json')['cases']

    def schema_row(case):
        if case['target'] == 'event':
            return checks['payload' if case['case_id'].startswith('payload-') else 'envelope'].row
        return checks[case['target']].row

    def rule(label, value):
        if label.startswith('run.started/single-defect/'):
            return 'run.started/' + label.split('/', 2)[2], 'source_emit_name'
        if label.startswith('run.started/consumer/'):
            case_id = label.rsplit('/', 1)[1]
            if case_id in schema_cases:
                return schema_row(schema_cases[case_id]), 'schema_case_target'
            if case_id in join_cases:
                return STATIC_JOINS[join_cases[case_id]['mutation_path']], 'static_join_mutation_path'
        if label.startswith('run.started/adoption/single-defect/'):
            name = label.rsplit('/', 1)[1]
            if name in DOMAIN or name.startswith('snapshot_join_'):
                return 'run.started/adoption/domain/' + name, 'source_emit_name'
            fixed = {'self-predecessor': 'run predecessor and successor differ',
                     'creation_original_observed': 'original append/current source immutable event scope identity',
                     'creation_original_relocated': 'original source cursor/frame-end'}
            if name in fixed:
                return PREFIX + fixed[name], 'source_literal'
        if label.startswith('run.started/adoption/shapes/root-type/'):
            path = ast.literal_eval(label.rsplit('/root-type/', 1)[1])  # the tuple literal the source wrote
            if path in SHAPES:
                return PREFIX + SHAPES[path], 'shape_first_check'
            if path[0] == 'run_started':
                return PREFIX + 'run ' + path[1] + ' schema', 'shape_first_check'
            if path[0] == 'restore_created':
                return PREFIX + 'created ' + path[1] + ' schema', 'shape_first_check'
        if label == 'run.started/adoption/shapes/generic-row':
            return PREFIX + 'generic row schema', 'shape_first_check'
        if label.startswith('run.started/adoption/'):
            case = adoption.get(label.split('/', 2)[2])
            if case:
                text = case.get('rejection', '')
                if text.startswith('run immutable snapshot/domain join: '):
                    names = text.split(': ', 1)[1].split(',')
                    rows = tuple(sorted('run.started/adoption/domain/' + x for x in names))
                    return (rows[0] if len(rows) == 1 else rows), 'adoption_rejection'
                target = declare.resolve_rejection(text)
                return (target, 'adoption_rejection') if target else None
        if label.startswith('run.started/retention/single-defect/'):
            return PREFIX + RETENTION[label.rsplit('/', 1)[1]], 'retention_first_check'
        if label.startswith('run.started/retention/cleanup/'):
            return 'run.started/retention/' + label.rsplit('/', 1)[1], 'source_literal'
        if label == 'run.started/retention/three-full-slots':
            return 'run.started/retention/reservation_capacity', 'source_literal'
        if label == 'run.started/retention/fourth-generation-schema':
            return 'run.started/retention/reservation_root_schema', 'source_literal'
        if label.startswith('run.started/retention/'):
            case = retention.get(label.rsplit('/', 1)[1])
            if case is not None and case['expected_eligible'] is False:
                return 'run.started/retention/eligible', 'retention_policy_ineligible'
        if label.startswith('adoption-bank/single-defect/'):
            return bank[int(label.rsplit('/', 1)[1])]['expected_refusal'], 'bank:adoption'
        return None
    return rule


RUNTIME = ('requested_runtime_mode', 'runtime_mode', 'requested_mode_overlay', 'effective_mode_overlay', 'requested_strategy',
           'strategy', 'strategy_resolution_reason', 'requested_platform', 'effective_platform', 'requested_model',
           'effective_model', 'requested_account_id', 'effective_account_id', 'requested_persona', 'effective_persona')


def digest_or_none(fn, value):
    try:
        return fn(value)
    except n.Refusal:
        return None


def run_joins(bundle):
    """s3ao's run.started consumer joins (scripts/pm_goal_complete_oracles.py run_joins), unchanged row for row,
    except that its two digests are total (GH1 defect class 6): an event whose payload or producer
    semantic digest the producer could not form refuses at that digest row instead of raising."""
    g = c.Gates()
    ev, snapshot, index, checkpoint, lookup = (bundle[k] for k in ('event', 'snapshot', 'index', 'checkpoint', 'lookup'))
    payload = ev['payload']
    for key in ('project_id', 'run_id'):
        g.require('run.started/lookup/' + key, lookup['requested_' + key] == ev[key])
        g.require('run.started/payload/' + key, payload[key] == ev[key])
        g.require('run.started/snapshot/' + key, snapshot[key] == ev[key])
    for key in RUNTIME:
        g.require('run.started/runtime/' + key, snapshot[key] == payload[key])
    digest = digest_or_none(lambda s: hashlib.sha256(n.qualified_jcs({k: v for k, v in s.items()
                                                                       if k not in ('snapshot_sha256', 'snapshot_ref')})).hexdigest(), snapshot)
    g.require('run.started/snapshot_digest', digest is not None and snapshot['snapshot_sha256'] == digest)
    part = 'project~' + base64.urlsafe_b64encode(ev['project_id'].encode()).decode().rstrip('=')
    ref = 'requested_effective_runtime.v1:' + part + ':' + snapshot['snapshot_id'] + ':' + str(digest)
    g.require('run.started/snapshot_ref', snapshot['snapshot_ref'] == ref)
    g.require('run.started/payload_snapshot_ref', payload['requested_effective_snapshot_ref'] == snapshot['snapshot_ref'])
    for key in ('event_id', 'sequence_id', 'event_type', 'project_id', 'idempotency_key', 'correlation_id',
                'causation_event_id', 'persisted_at_utc', 'redaction_profile'):
        g.require('run.started/index/' + key, c.same_json_value(index[key], ev[key]))
    payload_digest = digest_or_none(lambda x: hashlib.sha256(n.qualified_jcs(x)).hexdigest(), payload)
    g.require('run.started/index_payload_digest', payload_digest is not None and index['payload_sha256'] == payload_digest)
    producer = digest_or_none(n.producer_semantic_digest, ev)
    g.require('run.started/index_producer_digest', producer is not None and index['producer_semantic_digest'] == producer)
    g.require('run.started/checkpoint_scope', checkpoint['project_id'] == ev['project_id'] and checkpoint['scope_partition'] == part)
    g.require('run.started/index_partition', index['scope_partition'] == part)
    for key in ('segment_generation', 'segment_name', 'byte_offset'):
        g.require('run.started/source_cursor/' + key, checkpoint['source_cursor'][key] == index['source_locator'][key])
    g.require('run.started/source_cursor/sequence_id', checkpoint['source_cursor']['last_sequence_id'] == index['sequence_id'])
    for key in ('manifest_generation', 'recovery_epoch', 'survivor_prefix_sha256'):
        g.require('run.started/publication/' + key, checkpoint['source_cursor'][key] == index['publication_locator'][key])
    g.require('run.started/full_index_checkpoint', checkpoint['index_checkpoint_ref'] == index['publication_locator']['checkpoint_ref'])
    g.require('run.started/coverage', checkpoint['first_retained_sequence_id'] <= ev['sequence_id'] <= checkpoint['index_through_sequence_id'])
    g.require('run.started/index_key', lookup['index_key'] == f'event_record_index.v2:{part}:{ev["sequence_id"]:020d}:{ev["event_id"]}')
    g.require('run.started/checkpoint_key', lookup['checkpoint_key'] == 'run_started_index_checkpoint.v1:' + checkpoint['storage_instance_id'] + ':' + part)
    return g.errors


def bundle_boundary(bundle):
    """The complete run.started consumer boundary: every independently held copy's owner schema
    (EventRecord envelope + selected v2 payload, snapshot, index value, checkpoint), the Storage
    uint64 sequence, then the joins."""
    errors = set()
    for key, check in (('event', CHECKS['event']), ('snapshot', CHECKS['snapshot']), ('index', CHECKS['index']),
                       ('checkpoint', CHECKS['checkpoint'])):
        errors |= check(bundle[key])
    if errors:
        return errors
    # The index key recipe event_record_index.v2:{partition}:{sequence_id:020d}:{event_id} is the Storage
    # uint64 encoding of the EventRecord sequence (SP-236/SP-265): the shared storage_uint64 call decides
    # it before any join forms a key (the owner schemas give minimum 0 and no maximum).
    gate = c.Gates()
    gate.require('run.started/storage_sequence_uint64', storage_u64(bundle['event']['sequence_id']))
    if gate.errors:
        return gate.errors
    return run_joins(bundle)


def storage_u64(value):
    try:
        n.storage_uint64(value)
        return True
    except n.Refusal:
        return False


def coherent(bundle):
    """Re-derive the snapshot digest/ref, the payload's snapshot ref and the index digests (as s3ao's extra_joins)."""
    s, e = bundle['snapshot'], bundle['event']
    s['snapshot_sha256'] = hashlib.sha256(n.qualified_jcs({k: v for k, v in s.items() if k not in ('snapshot_sha256', 'snapshot_ref')})).hexdigest()
    part = 'project~' + base64.urlsafe_b64encode(e['project_id'].encode()).decode().rstrip('=')
    s['snapshot_ref'] = 'requested_effective_runtime.v1:' + part + ':' + s['snapshot_id'] + ':' + s['snapshot_sha256']
    e['payload']['requested_effective_snapshot_ref'] = s['snapshot_ref']
    bundle['index']['payload_sha256'] = hashlib.sha256(n.qualified_jcs(e['payload'])).hexdigest()
    bundle['index']['producer_semantic_digest'] = n.producer_semantic_digest(e)
    return bundle


def choices(spec):
    if 'enum' in spec:
        return list(spec['enum'])
    for branch in spec.get('anyOf', []):
        if 'enum' in branch:
            return list(branch['enum']) + ([None] if any(b.get('type') == 'null' for b in spec['anyOf']) else [])
    return None


COUPLED = ('requested_runtime_mode', 'runtime_mode', 'requested_mode_overlay', 'effective_mode_overlay',
           'requested_strategy', 'strategy', 'strategy_resolution_reason')
FREE_ALTERNATIVES = {'requested_platform': 'fixture-provider-b', 'effective_platform': 'fixture-provider-b',
                     'requested_model': 'fixture/model-b', 'effective_model': 'fixture/model-b',
                     'requested_account_id': 'account-b', 'effective_account_id': 'account-b',
                     'requested_persona': 'reviewer', 'effective_persona': 'reviewer'}


def runtime_witnesses(collector, base):
    """Schema-valid runtime-join defects, each declared before it runs.

    The payload and snapshot owner schemas couple requested/effective mode, overlay and
    strategy/reason inside each copy (payload allOf/oneOf), so some joins can only refuse
    together. Every assignment of the seven coupled fields that both owner schemas accept is
    enumerated; for each join the snapshot copy takes one valid assignment and the payload copy
    another, choosing the pair with the fewest differing fields that contains the join. Its
    declared target is that join row alone when it differs alone, else the declared duplicate
    set of the differing join rows (the judge then requires the joint cut to accept and each
    join to refuse alone). Uncoupled fields take one pattern-valid alternative in the payload."""
    import itertools
    payload_schema = c.load(PLANS / 'event_payload_run_started.schema.json')['properties']
    snapshot_v, payload_v = CHECKS['snapshot'].validator, CHECKS['payload'].validator
    domains = [choices(payload_schema[f]) for f in COUPLED]
    valid = []
    for combo in itertools.product(*domains):
        payload = dict(base['event']['payload'], **dict(zip(COUPLED, combo)))
        snapshot = dict(base['snapshot'], **dict(zip(COUPLED, combo)))
        if payload_v.is_valid(payload) and snapshot_v.is_valid(snapshot):
            valid.append(combo)
    emitted = dict(valid_coupled_assignments=len(valid), witnesses={})
    for index, field in enumerate(COUPLED):
        best = None
        for a, b in itertools.permutations(valid, 2):
            if a[index] == b[index]:
                continue
            differ = tuple(COUPLED[i] for i in range(len(COUPLED)) if a[i] != b[i])
            if best is None or len(differ) < len(best[2]):
                best = (a, b, differ)
        if best is None:
            emitted['witnesses'][field] = None
            continue
        a, b, differ = best
        candidate = copy.deepcopy(base)
        candidate['snapshot'].update(zip(COUPLED, a))
        candidate['event']['payload'].update(zip(COUPLED, b))
        coherent(candidate)
        rows = tuple(sorted('run.started/runtime/' + f for f in differ))
        collector.invoke(f'run.started/runtime-witness/{field}/' + '+'.join(differ), bundle_boundary, candidate, False,
                         target=rows[0] if len(rows) == 1 else rows, family=FAMILY)
        emitted['witnesses'][field] = list(differ)
    for field, value in FREE_ALTERNATIVES.items():
        partner = field.replace('requested_', 'effective_') if field.startswith('requested_') else field.replace('effective_', 'requested_')
        for differ in ((field,), tuple(sorted((field, partner)))):
            candidate = copy.deepcopy(base)
            for name in differ:
                candidate['event']['payload'][name] = FREE_ALTERNATIVES[name]
            if payload_v.is_valid(candidate['event']['payload']):
                break
        else:
            emitted['witnesses'][field] = 'payload schema refuses every alternative'
            continue
        coherent(candidate)
        rows = tuple(sorted('run.started/runtime/' + f for f in differ))
        collector.invoke(f'run.started/runtime-witness/{field}/' + '+'.join(differ), bundle_boundary, candidate, False,
                         target=rows[0] if len(rows) == 1 else rows, family=FAMILY)
        emitted['witnesses'][field] = list(differ)
    return emitted


class Proxy:
    """Feeds s3ao's extra_joins single-defect bundles to the complete boundary, unchanged otherwise."""
    def __init__(self, collector):
        self.collector, self.failures = collector, []
    # extra_joins appends to `failures` when a bundle does not refuse exactly at its join.

    def invoke(self, label, evaluate, value, valid=None, **kwargs):
        return self.collector.invoke(label, bundle_boundary, value, valid, family=FAMILY, **kwargs)


def consumer(collector, checks):
    from pm_goal_complete_oracles import extra_joins
    run = c.load(PLANS / 'run_started_consumer_contract_fixtures.json')
    for case in run['schema_cases']:
        target = case['target']
        evaluate = checks['event'] if target == 'event' else checks[target]
        collector.invoke('run.started/consumer/' + case['case_id'], evaluate, case['value'], case['expect_valid'], family=FAMILY)
    for case in run['static_join_cases']:
        collector.invoke('run.started/consumer/' + case['case_id'], bundle_boundary, case['bundle'], case['expect_valid'], family=FAMILY)
    proxy = Proxy(collector)
    extra_joins(proxy, run['base'])
    # s3ao witnesses the complete boundary's owner schemas refuse are invalid mutations (in the ledger as
    # declared other_refusal attempts), not suite failures; GO adds schema-valid witnesses for those joins.
    GO_EVIDENCE['s3ao_join_witnesses_refused_by_owner_schema'] = proxy.failures
    GO_EVIDENCE['runtime_witnesses'] = runtime_witnesses(collector, run['base'])
    for value in ('redacted', 'secret_refs_only'):
        bundle = copy.deepcopy(run['base'])
        bundle['index']['redaction_profile'] = value
        collector.invoke('run.started/index-witness/redaction_profile/' + value, bundle_boundary, bundle, False,
                         target='run.started/index/redaction_profile', family=FAMILY)
    foreign = copy.deepcopy(run['base']['event'])
    foreign['payload_schema_id'] = 'https://puppetmaster.local/schemas/event_payloads/run_started/foreign'
    collector.invoke('run.started/single-defect/selected_payload_schema', checks['event'], foreign, False, family=FAMILY)


def install_generic_capture(dep, frozen):
    """Capture accepted calls of the frozen dependency's checker functions (generic source/index/
    checkpoint, created-domain and result checks) made *inside run.started adoption calls*, so the GO
    witness search edits run.started-world inputs of those functions (helper-level complete calls of the
    pinned checker, as s3ao's frozen and adoption banks are). Observation only: every call still runs the
    installed function; a seed is kept only from a call that returned without refusal."""
    import inspect
    seeds, active, counts = [], [False], {}
    pinned = {str(path) for path in declare.frozen_files()}  # every pinned frozen .py file, resolved
    for namespace in (vars(dep), dep.G, dep.AD, dep.C, dep.R):
        for key, fn in list(namespace.items()):
            if not inspect.isfunction(fn) or getattr(fn, '_go_capture', False):
                continue
            inner = (fn.__kwdefaults__ or {}).get('_' + '_fn', fn)
            code = getattr(inner, '__code__', None)
            if code is None or str(Path(code.co_filename).resolve()) not in pinned or 'expect' not in code.co_names:
                continue
            label = 'adoption-dependency/' + Path(code.co_filename).name + ':' + str(code.co_firstlineno)

            def capture(*args, _wrapped=fn, _inner=inner, _label=label, **kwargs):
                result = _wrapped(*args, **kwargs)
                if active[0] and counts.get(_label, 0) < 8:
                    counts[_label] = counts.get(_label, 0) + 1
                    seeds.append((_inner, dict(args=copy.deepcopy(list(args)), kwargs=copy.deepcopy(kwargs)),
                                  _label + '/' + str(counts[_label])))
                return result
            capture._go_capture = True
            namespace[key] = capture
    return seeds, active


def transfer_bank(collector, frozen, seeds):
    """Replay every pinned frozen-bank defect (tests/fixtures/pnc019_goal_frozen_helper_witnesses.json, authored
    for restore_point.deleted) whose seed function also ran inside run.started adoption calls, on that function's
    run.started-world input: the same authored (path, operation), the bank's declared refusal as the target.
    A defect whose path is absent from the run.started input, or whose edit cannot be built, is skipped."""
    import inspect
    from pm_goal_deleted_case_ops import Editor
    pin = c.load(PLANS / 'restore_point_deleted_contract_fixtures.json')['frozen_joined_subject']
    manifest = Path(pin['path'])
    files = [(Path(r['path']) if Path(r['path']).is_absolute() else manifest.parent / r['path']).resolve()
             for r in c.load(manifest)['files']]
    by_function = {}
    for fn, base, label in seeds:
        code = fn.__code__
        by_function.setdefault((str(Path(code.co_filename).resolve()), code.co_firstlineno), []).append((fn, base, label))
    counts = dict(cases=0, matched=0, built=0)
    bank = c.load(ROOT / 'tests/fixtures/pnc019_goal_frozen_helper_witnesses.json')['cases']
    dep = frozen.FIXTURE_CONTEXT[0]
    for number, case in enumerate(bank):
        counts['cases'] += 1
        seed = case['seed']
        if 'manifest_file_index' not in seed:
            continue
        key = (str(files[seed['manifest_file_index']]), seed['function_line'])
        for fn, base, label in by_function.get(key, [])[:2]:
            counts['matched'] += 1
            try:
                operation = case['operation']
                if operation == 'legacy_other':
                    value = copy.deepcopy(base)
                    parent = value
                    for part in case['path'][:-1]:
                        parent = parent[part]
                    parent[case['path'][-1]] = frozen.legacy_other(parent[case['path'][-1]])
                elif operation.startswith('generic_'):
                    from pm_goal_deleted_generic_edits import edit
                    value = edit(base, operation, dep.G)
                elif operation.startswith('source_'):
                    from pm_goal_deleted_case_ops import source_edit
                    value = source_edit(base, operation, frozen.SOURCE_BUILDER, frozen.HASH_FUNCTIONS)
                else:
                    version = case.get('hash_recipe_version', 1)
                    value = Editor(base, frozen.helper_hash_functions(version), version=version).edit(tuple(case['path']), operation)
            except Exception:  # the authored path or operation does not exist in this input
                continue
            if not frozen.fixed_context_unchanged(fn, base, value):
                continue
            counts['built'] += 1
            collector.invoke(f'run.started/transfer-bank/{number}/{label}', search_evaluator(fn, frozen), value, False,
                             target=case['expected_refusal'], family=FAMILY, generated=True)
            collector.ledger[-1]['declared_rule'] = 'bank:frozen_transfer'
    return counts


def search_evaluator(fn, frozen):
    def evaluate(value):
        try:
            fn(*value['args'], **value['kwargs'])
        except frozen.ExpectedRefusal as refusal:
            return refusal.errors
        return set()
    return evaluate


def main():
    import pm_goal_deleted_external_oracles as frozen
    import pm_goal_run_adoption_oracles as adoption
    from pm_goal_complete_oracles import resources
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_go_sweep.py')
    start = len(collector.failures)
    schemas.install_frozen_hooks(frozen)
    registry = resources({PLANS / p for p in ('event_record.schema.json', 'requested_effective_runtime.schema.json',
                                               'run_started_consumer_contracts.schema.json', 'event_payload_run_started.schema.json')})
    checks = consumer_checks(registry)
    CHECKS.clear()
    CHECKS.update(checks)
    rule = build_rule(checks)
    saved = frozen.helper_witnesses
    env = os.environ.get('PNC019_ADOPTION_EXPLORE')

    def capture(collector_, seeds, files):
        SEEDS['adoption'] = (list(seeds), list(files))
    code = 0
    collector.family_scope = FAMILY
    try:
        with declare.Intercept(collector, rule):
            consumer(collector, checks)
            os.environ['PNC019_ADOPTION_EXPLORE'] = '1'
            frozen.helper_witnesses = capture
            if not hasattr(frozen, 'FIXTURE_CONTEXT'):
                frozen.main()
            generic, active = install_generic_capture(frozen.FIXTURE_CONTEXT[0], frozen)
            active[0] = True
            try:
                code |= adoption.main()
            finally:
                active[0] = False
            SEEDS['dependency'] = (generic, [])
            GO_EVIDENCE['frozen_bank_transfer'] = transfer_bank(collector, frozen, generic + SEEDS.get('adoption', ([], []))[0])
    finally:
        frozen.helper_witnesses = saved
        if env is None:
            os.environ.pop('PNC019_ADOPTION_EXPLORE', None)
        else:
            os.environ['PNC019_ADOPTION_EXPLORE'] = env
        collector.family_scope = FAMILY
    import pm_goal_go_search as search
    ns = adoption.ADOPTION_CONTEXT[0]
    packet = c.load(PLANS / 'event_index_consumer_adoption_fixtures.json')
    complete = [(ns['validate'], dict(args=[packet['positive'][label]], kwargs={}), 'adoption-validate/' + label)
                for label in sorted(packet['positive'])]
    try:
        # PNC019_GO_NO_SEARCH=1 only for the schema-closure root collection (pm_goal_go_schema_closure.py).
        if os.environ.get('PNC019_GO_NO_SEARCH') != '1' and FAMILY in os.environ.get('PNC019_GO_SEARCH_FAMILIES', FAMILY):
            GO_EVIDENCE['search'] = search.run(collector, FAMILY, [SEEDS[k] for k in ('adoption', 'dependency') if k in SEEDS],
                                               frozen, complete=complete)
            GO_EVIDENCE['dependency_seeds'] = len(SEEDS.get('dependency', ([], []))[0])
    finally:
        collector.family_scope = None
    GO_EVIDENCE['declared'] = declare.evidence()
    return int(bool(code) or len(collector.failures) > start)


def earlier_clause_proof(name, reports):
    """The same s3ao frozen-checker implications, for rows reached through the adoption dependency."""
    import pm_goal_run_adoption_oracles as adoption
    return adoption.earlier_clause_proof(name, reports)
