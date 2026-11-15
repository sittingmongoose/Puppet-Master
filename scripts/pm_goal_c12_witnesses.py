"""C12-GH1 coherent single-defect witness bank; TEST_ONLY, declared targets.

Each witness changes one owner fact and keeps every copy that another row
compares coherent (answer and source event, producer digest, receipt copies,
store and presented originals, resealed custody), so the declared row is the
only predicate the defect can reach. Targets are fixed here from the row's
invariant (scripts/pm_goal_history_reader_fixtures.py and
scripts/pm_goal_own_d_oracles.py), before the witness runs.

Routes:
  protocol  history_guards over the complete ATS-211 protocol case (answer,
            source, original), the history reader's own validator path;
  own_d     ReaderOracles._guarded (ATS-1119 complete owner-adapter read) at
            stage `entry`, with an optional answer-builder helper.
Native execution NOT_RUN; these are fixture originals, not real admissions.
"""
import copy

import pm_goal_guard_tables as tables
import pm_goal_retained as retained
import pm_goal_own_d_oracles as d
from pm_goal_history_reader_fixtures import (FAMILIES, PAYLOAD_FILE, OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA,
                                             history_guards)
from pm_goal_oracle_common import Gates, load, materialize_cases, schema_registry, semantic_digest, validator

PLANS = d.PLANS
OTHER_STORAGE = '00000000-0000-4000-8000-0000000000c1'
OTHER_GENERATION = 'eig_' + 'c1' * 32


def merge(target, changes):
    for key, value in changes.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            merge(target[key], value)
        else:
            target[key] = copy.deepcopy(value)


def coherent(base, *, outer=None, inner=None, body=None, token=None, receipt=None, selector=None,
             index_key=None, facts=None):
    value = copy.deepcopy(base)
    for event in (value['answer']['original_event'], value['source']['event']):
        merge(event, outer or {})
        merge(event['payload'], inner or {})
        merge(event['payload']['payload'], body or {})
    for read_token in (value['answer']['read_token'], value['source']['token']):
        merge(read_token, token or {})
    merge(value['original']['first_receipt'], receipt or {})
    merge(value['answer']['selector'], selector or {})
    merge(value['original']['facts'], facts or {})
    if index_key:
        value['source']['index_key'] = index_key(value['answer']['original_event'])
    value['original']['producer_digest'] = semantic_digest(value['answer']['original_event'])
    return value


def index_key(event):
    return f"event_record_index.v2:{d.partition(event)}:{event['sequence_id']:020d}:{event['event_id']}"


def protocol_witnesses(key, base):
    """(label, value, declared target) for rows the authored bank only reaches with two refusals."""
    token = base['answer']['read_token']
    storage = token['storage_instance_id']
    out = [
        ('token_checkpoint_key', coherent(base, token={'checkpoint_key': 'event_record_index_checkpoint.v1:' + OTHER_STORAGE}),
         'join/token/checkpoint_key'),
        ('token_checkpoint_ref', coherent(base, token={'checkpoint_ref': 'checkpoints/event_record_index_checkpoint.v1:'
                                                       + storage + '#/generations/' + OTHER_GENERATION}),
         'join/token/checkpoint_ref'),
        ('token_source_storage', coherent(base, token={'source_selection': {'storage_instance_id': OTHER_STORAGE}}),
         'join/token/source_storage'),
        ('token_dataset', coherent(base, token={'index_dataset_name': 'event_record_index.v2@' + OTHER_GENERATION}),
         'join/token/dataset'),
        ('revision_step', coherent(base, inner={'goal_revision': base['answer']['original_event']['payload']['goal_revision'] + 1},
                                   body={'new_revision': base['answer']['original_event']['payload']['goal_revision'] + 1}
                                   if key == 'replanned' else None),
         'original/revision_step'),
    ]
    event = base['answer']['original_event']
    for outer in ('actor_ref', 'requested_account_ref', 'effective_account_ref', 'correlation_id', 'thread_id'):
        if outer in event['payload'] and isinstance(event.get(outer), str):
            out.append(('envelope_' + outer, coherent(base, outer={outer: event[outer] + '-c12'}), 'join/envelope/' + outer))
    if 'occurred_at_utc' in event['payload']:
        out.append(('envelope_occurred_at_utc', coherent(base, outer={'occurred_at_utc': '2019-06-01T00:00:00Z'}),
                    'join/envelope/occurred_at_utc'))
    if 'idempotency_key' in event['payload']:
        other = event['idempotency_key'] + '-c12'
        out.append(('envelope_idempotency_key', coherent(base, outer={'idempotency_key': other}, receipt={'idempotency_key': other}),
                    'join/envelope/idempotency_key'))
    if 'project_id' in event['payload']:
        other = event['project_id'] + '-c12'
        out.append(('envelope_project_id', coherent(base, outer={'project_id': other}, selector={'project_id': other},
                                                    index_key=index_key), 'join/envelope/project_id'))
    out += family_witnesses(key, base)
    return out


def family_witnesses(key, base):
    body = base['answer']['original_event']['payload']['payload']
    if key == 'child_status':
        # A terminal parent that stays terminal: only the nonterminal row reads pre.
        return [('terminal_parent_preserved', coherent(base, facts={'state_before': 'completed', 'state_after': 'completed'}),
                 'row/child_parent_nonterminal')]
    if key == 'scheduled' and body.get('next_action') == 'dispatch':
        return [('scheduled_observed_before_eligible', coherent(base, outer={'observed_at_utc': '2019-12-31T23:59:59Z'}),
                 'row/scheduled_time')]
    if key == 'progressed':
        delta = copy.deepcopy(body['task_delta'])
        reused = (delta.get('updated_task_ids') or ['task:1'])[0]
        delta['added_task_ids'] = [reused]
        return [('progress_cross_array_reuse', coherent(base, body={'task_delta': delta}), 'row/progress_disjoint_tasks')]
    if key == 'replanned':
        return [('replanned_new_revision_mismatch', coherent(base, body={'new_revision': body['new_revision'] + 1}),
                 'row/replanned_revision')]
    return []


def protocol_route(collector):
    paths = [OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA]
    for key in FAMILIES:
        payload = PLANS / 'event_payloads/goal_runtime' / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json"
        if payload.exists():
            paths.append(payload)
    registry = schema_registry(paths)
    out_doc = load(OUT_SCHEMA)
    count = 0
    for key, (family, _, _) in FAMILIES.items():
        fixture = load(PLANS / f'goal_{key}_history_contract_fixtures.json')
        pv = validator(load(PLANS / 'event_payloads/goal_runtime' / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json"), registry)
        av = validator({'$ref': out_doc['$id'] + '#/$defs/goal_' + key + '_history_answer'}, registry)
        base = next(c['input'] for c in materialize_cases(fixture['protocol_cases']) if c['valid'])
        def evaluate(value, pv=pv, av=av):
            return history_guards(value, pv, av)
        collector.invoke(f'gh1/{key}/protocol/control', evaluate, base, True, family=family)
        # A lawful application-scope EventRecord at ATS-211's own EventRecord
        # boundary: the only place EventRecord's application branch applies
        # (every history answer pins scope_kind to project). A seed, no credit.
        record_validator = validator(load(ER_SCHEMA), registry)
        application = copy.deepcopy(base['answer']['original_event'])
        application.update(scope_kind='application', project_id=None)
        if record_validator.is_valid(application):
            def record_shape(value, rv=record_validator, key=key):
                gate = Gates()
                gate.schema(rv, value, key + '/event_record')
                return gate.errors
            collector.invoke(f'gh1/{key}/event_record/application_scope_control', record_shape, application, True, family=family)
        else:
            collector.failures.append(dict(kind='gh1_application_seed_invalid', family=family))
        # ATS-211's read-token boundary for every family (the fixtures author it
        # for child_status only): a lawful token as a seed, no credit.
        token_validator = validator({'$ref': load(CKPT_SCHEMA)['$id'] + '#/$defs/read_token'}, registry)
        def token_shape(value, tv=token_validator, key=key):
            gate = Gates()
            gate.schema(tv, value, key + '/read_token')
            return gate.errors
        collector.invoke(f'gh1/{key}/read_token/control', token_shape, base['answer']['read_token'], True, family=family)
        for label, value, target in protocol_witnesses(key, base):
            collector.invoke(f'gh1/{key}/protocol/{label}', evaluate, value, False, target=target, family=family)
            count += 1
    return count


def reseal(store):
    store['sealed_receipts'] = [retained.issue(store['original_value'], store['storage_instance_id'], store['custody'])]


def own_d_witnesses(key, base, store):
    """(label, presented, store, helper, target)."""
    out = []
    def selector_back(candidate, presented, current):
        candidate['selector'] = copy.deepcopy(current['selector'])
    presented = copy.deepcopy(base)
    presented['answer']['selector']['sequence_id'] = presented['answer']['selector']['sequence_id'] + 1
    out.append(('request_selector_builder_restores', presented, copy.deepcopy(store), selector_back, 'request/selector'))
    def binding_back(candidate, presented, current):
        candidate['reader_binding'] = current['installed_binding']
    presented = copy.deepcopy(base)
    presented['answer']['reader_binding'] = presented['answer']['reader_binding'] + '-c12'
    out.append(('request_binding_builder_restores', presented, copy.deepcopy(store), binding_back, 'request/binding'))
    # Receipt joins against a custody record whose own seal is intact: the
    # sealed-receipt read verifies bytes, the receipt rows verify meaning.
    custody = store['custody']
    edits = [('storage_instance_id', OTHER_STORAGE), ('event_id', custody['event_id'] + '-c12'),
             ('scope_partition', custody['scope_partition'] + 'c12'), ('event_type', custody['event_type'] + '.c12'),
             ('idempotency_key', custody['idempotency_key'] + '-c12'), ('producer_semantic_digest', 'b' * 64)]
    names = {'producer_semantic_digest': 'receipt/semantic_digest'}
    for field, replacement in edits:
        changed = copy.deepcopy(store)
        changed['custody'][field] = replacement
        reseal(changed)
        out.append(('resealed_custody_' + field, copy.deepcopy(base), changed, None, names.get(field, 'receipt/' + field)))
    if 'original_event_value_commitment' in custody:
        changed = copy.deepcopy(store)
        changed['custody']['original_event_value_commitment']['sha256'] = 'b' * 64
        reseal(changed)
        out.append(('resealed_custody_full_value_commitment', copy.deepcopy(base), changed, None, 'receipt/full_value_commitment'))
    changed = copy.deepcopy(store)
    changed['custody']['first_append_receipt']['event_id'] = custody['first_append_receipt']['event_id'] + '-c12'
    reseal(changed)
    out.append(('resealed_first_receipt_event_id', copy.deepcopy(base), changed, None, 'receipt/first/event_id'))
    changed = copy.deepcopy(store)
    sequence = custody['first_append_receipt']['sequence_id'] + 1
    changed['custody']['first_append_receipt']['sequence_id'] = sequence
    changed['frame']['cursor'][3] = sequence
    changed['selected_source']['cursor'][3] = sequence
    reseal(changed)
    out.append(('resealed_first_receipt_sequence_id', copy.deepcopy(base), changed, None, 'receipt/first/sequence_id'))
    # Coherent admission pair (presented and owner protocol, admission and
    # first receipt together): only the edition / checkpoint lookup refuses.
    for defect, field, receipt_field, target in (('edition', 'owner_unit', 'writer_owner_unit', 'admission/accepted_edition'),
                                                 ('checkpoint', 'registry_checkpoint', 'registry_checkpoint', 'admission/approved_checkpoint')):
        presented = copy.deepcopy(base)
        changed = copy.deepcopy(store)
        for original in (presented['original'], changed['protocol']['original']):
            original['admission'][field] += ':c12-other'
            original['first_receipt'][receipt_field] = original['admission'][field]
        out.append(('coherent_unknown_' + defect, presented, changed, None, target))
    # Custody bytes differ from the sealed receipt; every custody join holds.
    changed = copy.deepcopy(store)
    changed['custody']['first_append_receipt']['acknowledged_at_utc'] = '2026-11-14T12:00:00Z'
    out.append(('custody_differs_from_sealed_receipt', copy.deepcopy(base), changed, None, 'retained/verified_original'))
    # Declared duplicate set: the disclosed source event equals the
    # authenticated original, checked at establish and in the row validator.
    presented = copy.deepcopy(base)
    changed = copy.deepcopy(store)
    changed['source']['event']['actor_ref'] += ':c12-other'
    presented['source']['event'] = copy.deepcopy(changed['source']['event'])
    out.append(('source_event_not_original', presented, changed, None, ('source/full_original', 'source/unchanged_event')))
    foreign = foreign_family(key, base, store)
    if foreign is not None:
        out.append(foreign)
    # A role other than source_contract removed from every copy.
    for role in sorted(store['references']):
        if role == 'source_contract':
            continue
        changed = copy.deepcopy(store)
        presented = copy.deepcopy(base)
        del changed['references'][role]
        del changed['protocol']['original']['resolved_records'][role]
        del presented['original']['resolved_records'][role]
        out.append(('coherent_missing_role_' + role, presented, changed, None, 'references/complete_roles'))
        break
    return out


# Three sites of one invariant (the original is this reader's family): request
# dispatch, the answer-schema event_type const, and the envelope/payload
# event-name join, which the baseline does not reach (history_guards stops at
# the decided answer refusal). The judge's site cuts show each refusing alone.
FAMILY_IDENTITY_SITES = ('request/family_dispatch', 'join/envelope/event_type')


def foreign_family(key, base, store):
    """A coherent original of another real Goal family presented to this reader.

    Every copy (owner original, source events, frame bytes, custody,
    commitments, receipts, admission, recipe) carries the other family, and
    the payload keeps its own event_name. The reader's family identity is
    then refused only by its declared duplicate set: request dispatch, the
    answer-schema event_type const and (shadowed) the event-name join.
    """
    import pm_goal_oracle_common as common
    import pm_event_numbers as numbers
    from dataclasses import asdict
    keys = list(FAMILIES)
    other = FAMILIES[keys[(keys.index(key) + 1) % len(keys)]][0]
    presented = copy.deepcopy(base)
    changed = copy.deepcopy(store)
    events = [changed['original_value'], changed['source']['event'], changed['protocol']['source']['event'],
              presented['source']['event'], presented['answer']['original_event']]
    for event in events:
        event['event_type'] = other
    event = changed['original_value']
    raw = d.wire.pack(event)
    changed['frame']['value'] = raw
    changed['frame']['crc32'] = d.zlib.crc32(raw)
    custody = changed['custody']
    custody['event_type'] = other
    custody['producer_semantic_digest'] = semantic_digest(event)
    if 'original_event_value_commitment' in custody:
        custody['original_event_value_commitment'] = d.commitment(event)
    for original in (presented['original'], changed['protocol']['original']):
        original['first_receipt']['event_type'] = other
        original['admission']['event_type'] = other
        original['producer_digest'] = semantic_digest(event)
    for group in ('editions', 'checkpoints'):
        for edition in changed[group].values():
            edition['event_type'] = other
    changed['installed_recipes'] = [asdict(retained.recipe(event))]
    reseal(changed)
    owner = FAMILIES[key][0]
    answer = load(OUT_SCHEMA)['$defs']['goal_' + key + '_history_answer']
    location = None
    # The answer-schema const on original_event.event_type for this reader.
    for clause in answer['properties']['original_event'].get('then', {}).get('allOf', []):
        if clause.get('properties', {}).get('event_type', {}).get('const') == owner:
            index = answer['properties']['original_event']['then']['allOf'].index(clause)
            location = (load(OUT_SCHEMA)['$id'] + '/$defs/goal_' + key + '_history_answer/properties/original_event/then/allOf/'
                        + str(index) + '/properties/event_type/const')
    if location is None:
        return None
    sites = FAMILY_IDENTITY_SITES + (common.guard_for_location(location),)
    return ('coherent_foreign_family_original', presented, changed, None, tuple(sorted(sites)))


def own_d_route(collector):
    suite = d.ReaderOracles()
    count = 0
    for key, (family, _, _) in FAMILIES.items():
        fixture = load(PLANS / ('goal_' + key + '_history_contract_fixtures.json'))
        base = next(c['input'] for c in materialize_cases(fixture['protocol_cases']) if c['valid'])
        base = d.provenance_original(key, base)
        store = d.logical_store(key, base)
        def make(helper, key=key):
            # The helper is bound in the complete call, never part of the input
            # whose SHA-256 the ledger records.
            def evaluate(value):
                return suite._guarded('entry', key, value['presented'], value['store'], helper)
            return evaluate
        collector.invoke(f'gh1/{key}/own_d/control', make(None), dict(presented=base, store=store), True, family=family)
        for label, presented, changed, helper, target in own_d_witnesses(key, base, store):
            collector.invoke(f'gh1/{key}/own_d/{label}', make(helper), dict(presented=presented, store=changed), False,
                             target=target, family=family)
            count += 1
    return count


def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_guard_sweep.py --source pm_goal_c12_witnesses')
    start = len(collector.failures)
    protocol = protocol_route(collector)
    own_d = own_d_route(collector)
    collector.generator_stats['gh1_bank'] = dict(protocol=protocol, own_d=own_d)
    return int(len(collector.failures) > start)


ENVELOPE_IDENTITY = {
    # join row: (EventRecord field, payload field, answer-schema const field)
    'join/envelope/event_type': ('event_type', 'event_name'),
    'join/envelope/payload_schema_id': ('payload_schema_id', 'schema_version'),
}


def earlier_clause_proof(name, reports):
    """Source-bound proof that an envelope/payload identity join never refuses first.

    history_guards (scripts/pm_goal_history_reader_fixtures.py) validates the
    answer first and stops at any decided answer refusal; the answer schema
    pins original_event.<outer> to the reader's constant. It then validates the
    payload and stops at any decided payload refusal; the payload schema pins
    <inner> to the same constant. Only then does joins() compare outer with
    inner. If both constants hold, outer == inner and the join holds; if either
    fails, the reader has already stopped. So the join can never refuse first.
    The complete-boundary duplicate-set witness (coherent_foreign_family_original)
    separately shows it refusing alone once both earlier constants are cut.
    """
    if name not in ENVELOPE_IDENTITY:
        return None
    import hashlib as _hashlib
    import pm_goal_oracle_common as common
    outer, inner = ENVELOPE_IDENTITY[name]
    answers = load(OUT_SCHEMA)
    earlier = []
    owners = []
    for key, (family, _, _) in FAMILIES.items():
        answer = answers['$defs']['goal_' + key + '_history_answer']['properties']['original_event']
        clauses = answer.get('then', {}).get('allOf', [])
        index = next((i for i, c in enumerate(clauses) if 'const' in c.get('properties', {}).get(outer, {})), None)
        payload_path = PLANS / 'event_payloads/goal_runtime' / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json"
        payload = load(payload_path)
        if index is None or 'const' not in payload.get('properties', {}).get(inner, {}):
            return None
        earlier.append(common.guard_for_location(answers['$id'] + '/$defs/goal_' + key + '_history_answer/properties/original_event/then/allOf/'
                                                 + str(index) + '/properties/' + outer + '/const'))
        earlier.append(common.guard_for_location(payload['$id'] + '/properties/' + inner + '/const'))
        owners.append(str(payload_path.relative_to(common.ROOT)))
    passed = {r['guard'] for r in reports if r['status'] == 'PASS'}
    if not set(earlier) <= passed:
        return None
    source = common.ROOT / 'scripts/pm_goal_history_reader_fixtures.py'
    text = source.read_text().splitlines()
    stops = [i for i, line in enumerate(text, 1) if 'return g.errors' in line and ('g.schema(av' in text[i - 2] or 'g.schema(pv' in line or 'g.errors or not isinstance(ev,dict)' in line)]
    return dict(kind='earlier_owner_constants', earlier_guards=sorted(earlier),
                owner='Plans/goal_history_reader_outputs.schema.json + ' + ', '.join(owners),
                owner_sha256=_hashlib.sha256((common.ROOT / 'Plans/goal_history_reader_outputs.schema.json').read_bytes()).hexdigest(),
                checker='scripts/pm_goal_history_reader_fixtures.py:' + ','.join(map(str, stops)),
                checker_sha256=_hashlib.sha256(source.read_bytes()).hexdigest(),
                proof=('The answer-schema const pins original_event.' + outer + ' and the payload-schema const pins ' + inner +
                       ' to the same reader constant; history_guards stops at either decided refusal before joins(). '
                       'With both holding the join holds, so it never refuses first. Its complete-boundary '
                       'duplicate-set kill is recorded separately.'))
