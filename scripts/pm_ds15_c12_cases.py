#!/usr/bin/env python3
"""C12-DS15 own-family witnesses for the seven deck-2 families (PNC-019 criterion 12).

Usage: python3 scripts/pm_ds15_c12_cases.py --check                 (every witness exactly as stated)
       python3 scripts/pm_ds15_c12_cases.py --derive --out <dir>    (rebuild Plans/ds15_c12_cases.json)

Before this file every guard row a deck-2 family reaches was proved by the gated tool, but many only
through another family's single-row negative. Each witness here starts from a named valid deck-2 base of
its OWN family (or one of its own policy cases), changes one source fact and moves only the copies that
observe it (maintenance below). Its target row is declared before it runs: a transplant names the row its
donor witness refused at, a directed or retained witness names the row it was written for. Run through the
complete deck-2 checker it must be refused FIRST at exactly that row, its observation must refuse at no other
row of that table (the lane matrix rule), and its parent must evaluate with no refusal recorded. Attempts
that refuse elsewhere, raise or are accepted are INVALID: --derive lists them in its report and keeps none.

Retained witnesses (kind 'retained') exercise SP-1101 selection from the actual sealed custody
(Plans/ds15_original_custody.json): a Storage instance without custody (SX01), a custody store holding no
receipt for the exact original (SX08), a coherent forgery and another original's receipt (SX08), an original
sealed twice (SX09), under an uninstalled recipe (SX02) or under another family (SX05). The custody builder
(pm_ds15_p2b_cases.py --write-custody) seals the deliberately sealed ones ('seal_as', 'seal_also') once at
composition; a case under check never adds to the custody.

Maintenance steps (observation copies only, never a second defect):
  cas                expected_previous = stored_previous (the checkpoint CAS copy)
  prior_refs         the prior read token's derived key, reference and dataset name
  cohere_transition  original_context.transition and the owner record transition = context.transition
  record_payload     the owner record payload = payload
  record_text_invalid the owner record text loses its closing brace (one byte)
  deck2_record       record_changes applied to the owner record text
  refresh_envelope   envelope payload copy and idempotency key recomputed from the payload
  cohere             the retained envelope copy, custody producer digest and both CV-339 commitment copies of
                     an edited original event (pm_ds15_p2b_cases.recompute_copies)
  store              the custody copy of the Storage instance
  scan_from_prior    scan_low = prior through + 1 and the index rows of low..high (the scan a prior checkpoint selects)
  index_rows_from_scan  the index rows = the source rows of scan_low..scan_high
  through_from_scan  the proposed checkpoint's through_sequence_id = scan_high

A transplant keeps its donor's operation-specific parent (for example a lost receipt for an append recovery) as
parent_changes / parent_maintain: the parent is the base with those applied and must itself evaluate with no refusal;
the witness adds only the donor's own defect (changes / maintain) on top of that parent.
"""
import argparse
import copy
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
FIXTURE = ROOT / 'Plans/ds15_c12_cases.json'
STORE_NO_CUSTODY = '33333333-3333-4333-8333-333333333333'
STORE_EMPTY = '66666666-6666-4666-8666-666666666666'
OTHER_STORE = '22222222-2222-4222-8222-222222222222'
NO_REFUSAL = ('REFUSE', 'UNAVAILABLE', 'PENDING')
DONOR_KINDS = ('p2a', 'sem', 'p2b', 'deck2', 'pred')
# Sixteen-family semantic parents whose only role is to make that family's semantic base a valid payload-operation
# parent (its own envelope payload copy); every deck-2 base is already one, so they add no parent change.
BASE_EQUIVALENT_PARENTS = frozenset({'valid-transition'})
ATTEMPTS_PER_ROW = 12
# A predicate-harness donor names a boundary, not an operation: try the complete operations that reach it.
PRED_OPS = {'receipt_ok': ('read', 'receipt_boundary', 'recover'), 'token_matches_storage': ('checkpoint', 'rebuild'),
            'envelope_ok': ('payload', 'envelope_boundary', 'read'), 'admission_present': ('withdraw_writer',),
            'admission_numbers_ok': ('withdraw_writer',), 'original_evidence_ok': ('read',),
            'outcome_present': ('read', 'recover'), 'index_inputs_ok': ('index_boundary', 'checkpoint'),
            'identity_fields_types_ok': ('payload',), 'identity': ('payload',), 'commitment': ('read', 'receipt_boundary'),
            'authority_types_ok': ('payload', 'read'), 'context_types_ok': ('payload',), 'payload_ok': ('payload',),
            'object_input_present': ('payload',)}


def load_models():
    import pm_ds15_p2a_cases as p2a
    return p2a.load_models()


def slug(name):
    return name.replace('.', '_')


def substitute(value, donor, target):
    """Donor family names and slugs in strings and keys become the target family's (ids, refs, keys)."""
    if donor == target:
        return copy.deepcopy(value)
    pairs = ((donor, target), (slug(donor), slug(target)))

    def text(s):
        for a, b in pairs:
            s = s.replace(a, b)
        return s
    if isinstance(value, str):
        return text(value)
    if isinstance(value, dict):
        return {text(k): substitute(v, donor, target) for k, v in value.items()}
    if isinstance(value, list):
        return [substitute(v, donor, target) for v in value]
    return copy.deepcopy(value)


def contract(deck, family):
    return next(c for c in deck.read('Plans/ds15_deck2_contracts.json') if c['event_type'] == family)


def fixture(deck, family):
    return next(f for f in deck.read('Plans/ds15_deck2_fixtures.json') if f['event_type'] == family)


def record_patch(model, text, changes):
    record = json.loads(text)
    model.patch(record, changes)
    return json.dumps(record, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def set_path(model, data, path, value):
    if path == '$root':
        return copy.deepcopy(value)
    model.patch(data, {path: value})
    return data


def maintain(model, c, data, steps, w):
    import pm_ds15_p2b_cases as p2b
    for step in steps:
        if step == 'cas':
            data['expected_previous'] = copy.deepcopy(data['stored_previous'])
        elif step == 'prior_refs':
            token = data['stored_previous']['index_read_token']
            key = 'event_record_index_checkpoint.v1:' + token['storage_instance_id']
            token['checkpoint_ref'] = key + '#/generations/' + token['generation_id']
            token['index_dataset_name'] = 'event_record_index.v2@' + token['generation_id']
            data['expected_previous'] = copy.deepcopy(data['stored_previous'])
        elif step == 'cohere_transition':
            data['original_context']['transition'] = copy.deepcopy(data['context']['transition'])
            ref = data['payload']['outcome_ref']
            data['owner_records'][ref] = record_patch(model, data['owner_records'][ref],
                                                      {'transition': data['context']['transition']})
        elif step == 'record_text_invalid':
            ref = data['payload']['outcome_ref']
            data['owner_records'][ref] = data['owner_records'][ref][:-1]
        elif step == 'record_payload':
            ref = data['payload']['outcome_ref']
            data['owner_records'][ref] = record_patch(model, data['owner_records'][ref], {'payload': data['payload']})
        elif step == 'deck2_record':
            ref = data['payload']['outcome_ref']
            data['owner_records'][ref] = record_patch(model, data['owner_records'][ref], w['record_changes'])
        elif step == 'refresh_envelope':
            data['envelope']['payload'] = copy.deepcopy(data['payload'])
            data['envelope']['idempotency_key'] = model.identity(c, data['payload'], data.get('application_source'))
        elif step == 'cohere':
            p2b.recompute_copies(model, data, envelope=True)
        elif step == 'commitments':
            p2b.recompute_copies(model, data, envelope=False)
        elif step == 'store':
            data['custody']['storage_instance_id'] = data['storage_instance_id']
        elif step == 'scan_from_prior':
            data['scan_low'] = data['stored_previous']['through_sequence_id'] + 1
            data['index_rows'] = [r for r in data['selected_source']['rows'] if data['scan_low'] <= r['sequence'] <= data['scan_high']]
        elif step == 'index_rows_from_scan':
            data['index_rows'] = [r for r in data['selected_source']['rows'] if data['scan_low'] <= r['sequence'] <= data['scan_high']]
        elif step == 'through_from_scan':
            data['checkpoint']['through_sequence_id'] = data['scan_high']
        else:
            raise AssertionError(step)


def build(deck, w):
    """(contract, call) of one witness; the input is built before the call runs."""
    model = deck.base
    c = contract(deck, w['family'])
    f = fixture(deck, w['family'])
    if w['operation'] == 'policy':
        seed = next(z for z in f['policy_cases'] if z['id'] == w['base'])
        data = {'payload': copy.deepcopy(seed['payload']), 'transition': copy.deepcopy(seed['transition'])}
        for path, value in w['changes'].items():
            data = set_path(model, data, path, value)
        return c, data, (lambda d=data: deck.catalog_request(c, copy.deepcopy(d['payload']), copy.deepcopy(d['transition'])))
    data = copy.deepcopy(f['bases'][w['base']])
    for path, value in w.get('parent_changes', {}).items():
        data = set_path(model, data, path, value)
    maintain(model, c, data, w.get('parent_maintain', []), w)
    for path, value in w['changes'].items():
        data = set_path(model, data, path, value)
    maintain(model, c, data, w['maintain'], w)
    return c, data, (lambda d=data, op=w['operation']: deck.evaluate(c, op, copy.deepcopy(d)))


def parent_of(w):
    return dict(w, changes={}, maintain=[])


def parent_call(deck, w):
    return build(deck, parent_of(w))[2]


def recorded(deck, call):
    records = []
    deck.base.RECORDER = records
    try:
        result = call()
    except Exception as exc:  # a raise is an INVALID result, never a refusal
        result = ('exception', type(exc).__name__)
    finally:
        deck.base.RECORDER = None
    return result, records


def refused_result(result):
    if isinstance(result, tuple) and result[:1] == ('exception',):
        return None
    if isinstance(result, str):
        return result == 'REFUSE'
    return isinstance(result, dict) and result.get('result') in NO_REFUSAL


def verdict(deck, w):
    """('KILL', first) when the witness is exactly as declared, else ('INVALID', reason)."""
    try:
        _, _, call = build(deck, w)
        _, _, parent = build(deck, parent_of(w))
    except (KeyError, IndexError, TypeError, ValueError, AttributeError) as exc:
        return 'INVALID', 'build:' + type(exc).__name__, None
    presult, precords = recorded(deck, parent)
    if refused_result(presult) is not False or any(r[2] is not None for r in precords):
        return 'INVALID', 'parent_not_valid', None
    result, records = recorded(deck, call)
    first = next((r for r in records if r[2] is not None), None)
    if refused_result(result) is not True or first is None:
        return 'INVALID', 'not_refused:' + repr(result)[:60], None
    got = [first[0], first[2][0]]
    if got != list(w['target']):
        return 'INVALID', 'first:' + ':'.join(got), got
    failing = [name for name, predicate, context in deck.base.table_rows(first[0]) if predicate(first[1], context) is not None]
    if failing != [first[2][0]]:
        return 'INVALID', 'multi_row:' + ','.join(failing), got
    return 'KILL', None, got


# --------------------------------------------------------------------------- donors and transplants
def sem_levels(fixture16, case):
    """[(changes, steps)] from the semantic base to the case (its parent cases first), or None."""
    chain = []
    while True:
        chain.append(case)
        if 'parent_case' not in case:
            break
        case = next(z for z in fixture16['semantic_cases'] if z['id'] == case['parent_case'])
    levels = []
    for level in reversed(chain):
        if level.get('refresh_browser_owner'):
            return None
        if level['id'] in BASE_EQUIVALENT_PARENTS:
            continue  # makes that family's semantic base a valid payload parent; a deck-2 base already is one
        levels.append((level['changes'], ['refresh_envelope'] if level.get('refresh_envelope') else []))
    return levels


def merged(levels):
    changes, steps = {}, []
    for c, s in levels:
        changes.update(c)
        steps += [x for x in s if x not in steps]
    return changes, steps


def donor_specs(m16, deck, wid, family_of):
    """(donor family, [(base, op, changes, maintain, record_changes)]) for one donor witness, or None."""
    kind, rest = wid.split('/', 1)
    if kind == 'sem':
        family, cid = rest.split('/', 1)
        f16 = next(f for f in m16.read('Plans/ds15_event_contract_fixtures.json') if f['event_type'] == family)
        case = next(z for z in f16['semantic_cases'] if z['id'] == cid)
        levels = sem_levels(f16, case)
        if levels is None:
            return None
        parent_changes, parent_steps = merged(levels[:-1])
        changes, steps = levels[-1]
        return family, [('project', case['operation'], changes, steps, None, parent_changes, parent_steps)]
    if kind == 'pred':
        family, cid = rest.split('/', 1)
        f16 = next(f for f in m16.read('Plans/ds15_event_contract_fixtures.json') if f['event_type'] == family)
        case = next(z for z in f16['predicate_cases'] if z['id'] == cid)
        return family, [('project', op, case['changes'], [], None, {}, []) for op in PRED_OPS.get(case['target'], ())]
    if kind == 'deck2':
        family, cid = rest.split('/', 1)
        case = next(z for z in fixture(deck, family)['cases'] if z['id'] == cid)
        steps = ['cohere_transition'] if case.get('coherent_transition') else []
        if case.get('coherent_payload'):
            return None
        if set(case.get('derived_observations', {})) - {'original_context/transition', 'owner_records'}:
            return None
        return family, [(case['base'], case['operation'], case['changes'], steps, None, {}, [])]
    if kind in ('p2a', 'p2b'):
        import pm_ds15_p2a_cases as p2a
        import pm_ds15_p2b_cases as p2b
        rows = json.loads((p2a.FIXTURE if kind == 'p2a' else p2b.FIXTURE).read_text())
        row = next(r for r in rows if r['id'] == rest)
        if row['family'] == 'shared' or row['parent'][0] not in ('sem', 'deck2'):
            return None
        mapping = {'cas': 'cas', 'prior_refs': 'prior_refs', 'deck2_record': 'deck2_record',
                   'deck2_record_payload': 'record_payload', 'cohere': 'cohere', 'commitments': 'commitments',
                   'store': 'store'}
        if any(m not in mapping for m in row['maintain']) or row.get('extra', {}).get('seal') or row.get('extra', {}).get('seal_as'):
            return None
        steps = [mapping[m] for m in row['maintain']]
        parent_changes, parent_steps = {}, []
        base = 'project'
        if row['parent'][0] == 'sem':
            f16 = next(f for f in m16.read('Plans/ds15_event_contract_fixtures.json') if f['event_type'] == row['family'])
            case = next(z for z in f16['semantic_cases'] if z['id'] == row['parent'][1])
            levels = sem_levels(f16, case)
            if levels is None:
                return None
            parent_changes, parent_steps = merged(levels)
        else:
            base = row['parent'][1]
        return row['family'], [(base, row['operation'], row['changes'], steps, row.get('extra', {}).get('record_changes'),
                                parent_changes, parent_steps)]
    return None


def transplant(deck, family, donor_family, spec, target, donor_wid):
    base, op, changes, steps, record_changes, parent_changes, parent_steps = spec
    bases = fixture(deck, family)['bases']
    if base not in bases:
        base = 'project'
    w = {'id': None, 'family': family, 'base': base, 'operation': op,
         'changes': substitute(changes, donor_family, family), 'maintain': list(steps),
         'target': list(target), 'method': 'transplant', 'donor': donor_wid}
    if parent_changes or parent_steps:
        w['parent_changes'] = substitute(parent_changes, donor_family, family)
        w['parent_maintain'] = list(parent_steps)
    if record_changes is not None:
        w['record_changes'] = substitute(record_changes, donor_family, family)
    return w


# --------------------------------------------------------------------------- directed and retained witnesses
def directed(family, bases, c=None):
    """Hand-written single-defect witnesses (target declared here), tried for every family.

    An entry may list alternative change sets for one target (tried in order; each failure is an INVALID attempt).
    """
    s = slug(family)
    project = bases['project']
    rows = project['selected_source']['rows']
    out = [
        # Oracle defect fixed in this lane: a new append's current context is validated before its transition is
        # read (the history base's retained-reader context has no transition; it raised KeyError before).
        ('history', 'envelope_boundary', {}, [], ['sch_d2_context', 'D2_CONTEXT_schema']),
        # Custody copy joins (rc_custody), one custody copy changed, the receipt and result untouched
        ('project', 'read', {'custody/original_segment_ref': 'segment:foreign'}, [], ['rc_custody', 'RC08_segment']),
        ('project', 'read', {'custody/storage_instance_id': OTHER_STORE}, [], ['rc_custody', 'RC09_storage_instance']),
        ('project', 'read', {'custody/scope_partition': 'app'}, [], ['rc_custody', 'RC10_partition']),
        ('project', 'read', {'custody/event_id': 'event:' + s + ':9'}, [], ['rc_custody', 'RC11_event']),
        ('project', 'read', {'custody/event_type': 'catalog.install.started' if family != 'catalog.install.started' else 'catalog.update.started'},
         [], ['rc_custody', 'RC12_event_type']),
        ('project', 'read', {'custody/idempotency_key': '0' * 64}, [], ['rc_custody', 'RC13_key']),
        ('project', 'read', {'custody/producer_semantic_digest': '0' * 64}, [], ['rc_custody', 'RC14_producer_digest']),
        # Receipt copies
        ('project', 'read', {'receipt/byte_offset': 999999}, [], ['rc_copies', 'RC01_custody_receipt']),
        # Token custody (tk_storage) on the checkpoint's own token
        ('project', 'checkpoint', {'selected_token/storage_instance_id': OTHER_STORE}, [], ['tk_storage', 'TK01_token_storage']),
        # Writer withdrawal Storage sequences (wd_gate)
        ('project', 'withdraw_writer', {'admitted_sequence': -1}, [], ['wd_gate', 'WD02_admitted_uint64']),
        ('project', 'withdraw_writer', {'withdrawal_frontier': -1}, [], ['wd_gate', 'WD03_frontier_uint64']),
        ('project', 'withdraw_writer', {'admitted_sequence': None}, [], ['wd_gate', 'WD01_admitted_present']),
        # Identity input and preimage
        ('project', 'payload', {'payload/outcome_ref': 'outcome:' + s + ':1\ud800'}, [], ['id_preimage', 'ID04_preimage_encodable']),
        # Number rules under the frozen retained recipe: an integral float in a retained Storage integer
        ('project', 'read', {'receipt/sequence_id': 1.0, 'custody/first_append_receipt/sequence_id': 1.0,
                             'issued_result/first_append_receipt/sequence_id': 1.0}, [], ['sch_receipt_n', 'RECEIPT_numbers']),
        ('project', 'read', {'custody/first_append_receipt/sequence_id': 1.0}, [], ['sch_custody_n', 'CUSTODY_numbers']),
        ('project', 'read', {'issued_result/first_append_receipt/sequence_id': 1.0}, [], ['sch_result_n', 'RESULT_numbers']),
        ('project', 'payload', {'envelope/producer_sequence_id': 1.0}, [], ['sch_envelope_n', 'ENVELOPE_numbers']),
        ('project', 'read', {'envelope/producer_sequence_id': 1.0}, [], ['sch_envelope_v1_n', 'ENVELOPE_V1_numbers']),
        ('project', 'read', {'original/event/producer_sequence_id': 1.0}, ['commitments'], ['sch_original_event_n', 'ORIGINAL_EVENT_numbers']),
        ('project', 'read', {'outcome/payload/schema_version': 7}, [], ['ev_outcome_domain', 'OD01_outcome_v1']),
        # Schema verdicts at retained and copy boundaries
        ('project', 'read', {'receipt/durability_state': 'lost'}, [], ['sch_receipt', 'RECEIPT_schema']),
        ('project', 'read', {'custody/schema_version': '9.0.0'}, [], ['sch_custody', 'CUSTODY_schema']),
        ('project', 'read', {'issued_result/schema_version': '9.0.0'}, [], ['sch_result', 'RESULT_schema']),
        ('project', 'read', {'envelope/schema_version': '9.0.0'}, [], ['sch_envelope_v1', 'ENVELOPE_V1_schema']),
        ('project', 'payload', {'envelope/schema_version': '9.0.0'}, [], ['sch_envelope', 'ENVELOPE_schema']),
        ('project', 'read', {'original/payload/schema_version': '9.0.0'}, [], ['sch_payload_v1', 'PAYLOAD_V1_schema']),
        ('project', 'checkpoint', {'checkpoint/schema_version': '9.0.0'}, [], ['sch_checkpoint', 'CHECKPOINT_schema']),
        ('project', 'read', {'unexpected_member': True}, [], ['sch_evidence', 'EVIDENCE_schema']),
        ('project', 'payload', {'context/c12_unexpected': True}, [], ['sch_d2_context', 'D2_CONTEXT_schema']),
        ('project', 'read', {'context/c12_unexpected': True}, [], ['sch_d2_context_retained', 'D2_CONTEXT_RETAINED_schema']),
        ('project', 'read', {'original_context/c12_unexpected': True}, [], ['sch_d2_context_v1', 'D2_CONTEXT_V1_schema']),
        ('project', 'read', {'owner_records/outcome:' + s + ':2': 7}, [], ['sch_d2_owner_records', 'D2_OWNER_RECORDS_schema']),
        ('project', 'checkpoint', {'index_rows/0/c12_unexpected': True}, [], ['sch_index_inputs', 'INDEX_INPUTS_schema']),
        # Original evidence and owner record bank presence
        ('project', 'read', {'owner_records': {'$delete': True}}, [], ['d2_ev_bank', 'EB21_bank_present']),
    ]
    # Checkpoint range and matches, computed from this family's own source rows (one fact moved, its copies kept)
    prior = copy.deepcopy(project['checkpoint'])
    prior['through_sequence_id'] = rows[0]['sequence']
    out += [
        ('project', 'checkpoint', {'scan_low': rows[1]['sequence']}, ['index_rows_from_scan'], ['cp_range', 'CN01_low']),
        ('project', 'checkpoint', {'scan_high': rows[1]['sequence']}, ['index_rows_from_scan', 'through_from_scan'],
         ['cp_range', 'CN05_selected_high']),
        # a prior checkpoint through the first (non-matching) row: no earlier match precedes it
        ('project', 'checkpoint', {'stored_previous': prior}, ['cas', 'scan_from_prior'], ['cp_matches', 'CE01_prior_earlier']),
        # The receipt's original event id, every receipt copy moved together (RC01/RC02 keep agreeing)
        ('project', 'read', {'receipt/event_id': 'event:' + s + ':9', 'custody/first_append_receipt/event_id': 'event:' + s + ':9',
                             'issued_result/first_append_receipt/event_id': 'event:' + s + ':9'}, [], ['rc_copies', 'RC03_receipt_event']),
        # The checkpoint token of another Storage instance, its selected copy moved (CG07 keeps agreeing)
        ('project', 'checkpoint', {'checkpoint/index_read_token/storage_instance_id': OTHER_STORE,
                                   'selected_token/storage_instance_id': OTHER_STORE}, [], ['tk_storage', 'TK01_token_storage']),
        # Storage uint64 sequences past 2^64-1 (the authority type walk admits them; storage_uint64 does not)
        ('project', 'withdraw_writer', {'admitted_sequence': 2 ** 64}, [], ['wd_gate', 'WD02_admitted_uint64']),
        ('project', 'withdraw_writer', {'withdrawal_frontier': 2 ** 64}, [], ['wd_gate', 'WD03_frontier_uint64']),
        ('project', 'payload', {'envelope/sequence_id': 2 ** 64}, [], ['sch_envelope_n', 'ENVELOPE_numbers']),
        # Storage uint64 at the index inputs: past 2^64-1 the stock schema (no maximum) and the authority type walk admit
        # it and only the number rule refuses (the inherited 'entailed' claim for this row was wrong)
        ('project', 'checkpoint', {'index_rows/0/sequence': 2 ** 64}, [], ['sch_index_inputs_n', 'INDEX_INPUTS_numbers']),
        ('project', 'checkpoint', {'checkpoint/through_sequence_id': 2 ** 64}, [], ['sch_checkpoint_n', 'CHECKPOINT_numbers']),
        # Frozen ds15-v1 integer domain on retained records: a float where no authority key is (an integral float at
        # an integer slot passes the stock integer type, so only the ds15-v1 domain refuses it)
        ('project', 'read', {'envelope/payload/c12_number': 1.5}, [], ['sch_envelope_v1_n', 'ENVELOPE_V1_numbers']),
        ('project', 'read', {'receipt/segment_generation': 1.0}, [], ['sch_receipt_n', 'RECEIPT_numbers']),
        ('project', 'read', {'custody/first_append_receipt/segment_generation': 1.0}, [], ['sch_custody_n', 'CUSTODY_numbers']),
        ('project', 'read', {'issued_result/first_append_receipt/segment_generation': 1.0}, [], ['sch_result_n', 'RESULT_numbers']),
        # Owner record joins: one record member moved in the record text only
        ('project', 'payload', {}, ['deck2_record'], ['d2_env_c', 'ER01_record_payload'],
         {'record_changes': {'payload/outcome_ref': 'outcome:' + s + ':9'}}),
        ('project', 'payload', {}, ['record_text_invalid'], ['d2_or_bytes', 'OR02_record_json']),
        ('project', 'payload', {'$root': []}, [], ['ev_input', 'EV01_input_object']),
    ]
    payload = project['payload']
    out += [
        ('project', 'payload', {'original/event/event_type': 'catalog.install.started'}, [], ['d2_env_a', 'DE02_original_type']),
        ('project', 'checkpoint_boundary', {'checkpoint/last_event_id': 'event:' + s + ':1\ud800'}, [], ['cp_size', 'CP01_encodable']),
    ]
    if c is not None and c['scope_policy'] == 'project_only':
        out += [
            ('project', 'payload', {'context/scope/project_id': 'other_project'}, [], ['d2_pl_gate', 'PG03_scope']),
            ('project', 'envelope_boundary', {'context/scope/project_id': 'other_project'}, [], ['d2_env_b', 'DE11_context_scope']),
            ('project', 'payload', {}, ['deck2_record'], ['d2_env_c', 'ER03_record_scope'],
             {'record_changes': {'scope/project_id': 'other_project'}}),
        ]
    if family.startswith('catalog.update.'):
        effective = payload['target_version'] if family.endswith('.started') else payload['previous_version']
        out.append(('project', 'payload', {'payload/effective_version': effective, 'context/transition/effective_version': effective},
                    [], ['d2_tr_update', 'TC15_effective_rule']))
    transition = project['context']['transition']
    if c is not None and 'uses' in transition and not transition['uses']:
        listed = c['listed_uses'].get(payload.get('item_type'), [])
        if listed:
            out.append(('project', 'payload', {'context/transition/uses': listed[:1]}, [],
                        ['d2_env_c', 'ER07_record_current_transition']))
    for key in sorted(transition):
        value = transition[key]
        moved = (not value if type(value) is bool else value + '-c12' if isinstance(value, str)
                 else list(reversed(value)) if isinstance(value, list) and len(value) > 1 else None)
        if moved is None:
            continue
        out.append(('project', 'read', {}, ['deck2_record'], ['d2_env_c', 'ER04_record_original_transition'],
                    {'record_changes': {'transition/' + key: moved}}))
        out.append(('project', 'payload', {'context/transition/' + key: moved}, [], ['d2_env_c', 'ER07_record_current_transition']))
    # The catalog request oracle (catalog_request) from this family's own valid policy case
    if family.startswith('catalog.update.'):
        seed = 'queue-command-open_edit_session'
        out += [
            (seed, 'policy', {'transition/owner_rules_satisfied': False}, [], ['d2_request', 'CQ01_owner_rules']),
            (seed, 'policy', {'transition/effective_version': '2.0.0'}, [], ['d2_request', 'CQ04_update_verified']),
            (seed, 'policy', {'transition/installed_available': False}, [], ['d2_request', 'CQ05_update_installed']),
            (seed, 'policy', {'transition/stage': 7}, [], ['sch_d2_transition', 'D2_TRANSITION_schema']),
            (seed, 'policy', {'payload/schema_version': '9.0.0'}, [], ['sch_payload', 'PAYLOAD_schema']),
        ]
    elif family.startswith('catalog.remove.'):
        seed = 'refuse-command-component_reference'
        out += [
            (seed, 'policy', {'transition/owner_rules_satisfied': False}, [], ['d2_request', 'CQ01_owner_rules']),
            (seed, 'policy', {'transition/installed_available': False}, [], ['d2_request', 'CQ02_remove_installed']),
            (seed, 'policy', {'transition/queued': True}, [], ['d2_request', 'CQ03_remove_not_queued']),
            (seed, 'policy', {'transition/stage': 7}, [], ['sch_d2_transition', 'D2_TRANSITION_schema']),
            (seed, 'policy', {'payload/schema_version': '9.0.0'}, [], ['sch_payload', 'PAYLOAD_schema']),
        ]
    return out


def retained(family):
    """SP-1101 selection from the actual sealed custody (rd_recipe, rd_resolve), every retained route."""
    rows = []
    for op, result in (('read', 'UNAVAILABLE'), ('recover', 'REFUSE'), ('checkpoint', 'REFUSE'), ('rebuild', 'REFUSE'),
                       ('publish', 'REFUSE'), ('receipt_boundary', 'REFUSE'), ('withdraw_writer', 'REFUSE')):
        rows.append((f'SX01-{op}-store-without-custody', 'project', op, {'storage_instance_id': STORE_NO_CUSTODY}, ['store'],
                     ['rd_recipe', 'SX01_custody_store'], {}))
        rows.append((f'SX08-{op}-store-without-receipt', 'project', op, {'storage_instance_id': STORE_EMPTY}, ['store'],
                     ['rd_recipe', 'SX08_receipt_present'], {}))
    rows += [
        ('SX08-read-coherent-forgery', 'project', 'read', {'original/event/actor_ref': 'actor:c12-forged'}, ['cohere'],
         ['rd_recipe', 'SX08_receipt_present'], {}),
        ('SX08-read-other-original-receipt', 'project', 'read', {'original/event/event_id': 'event:' + slug(family) + ':2'},
         ['cohere'], ['rd_recipe', 'SX08_receipt_present'], {}),
        ('SX08-recover-coherent-forgery', 'project', 'recover', {'original/event/actor_ref': 'actor:c12-forged-retry'},
         ['cohere'], ['rd_recipe', 'SX08_receipt_present'], {}),
        ('SX09-read-original-sealed-twice', 'project', 'read', {'original/event/actor_ref': 'actor:c12-sealed-twice'},
         ['cohere'], ['rd_recipe', 'SX09_receipt_unique'], {'seal_as': [family, 'ds15-v1'], 'seal_also': [[family, 'ds15-v0']]}),
        ('SX09-recover-original-sealed-twice', 'project', 'recover', {'original/event/actor_ref': 'actor:c12-sealed-twice-retry'},
         ['cohere'], ['rd_recipe', 'SX09_receipt_unique'], {'seal_as': [family, 'ds15-v1'], 'seal_also': [[family, 'ds15-v0']]}),
        ('SX02-read-original-sealed-under-older-recipe', 'project', 'read', {'original/event/actor_ref': 'actor:c12-sealed-v0'},
         ['cohere'], ['rd_recipe', 'SX02_recipe_installed'], {'seal_as': [family, 'ds15-v0']}),
        ('ORIGINAL_EVENT-read-sealed-original-float', 'project', 'read', {'original/event/payload/c12_number': 1.5},
         ['commitments'], ['sch_original_event_n', 'ORIGINAL_EVENT_numbers'], {'seal_as': [family, 'ds15-v1']}),
        ('CR02-sealed-original-sequence-differs-from-index-row', 'project', 'checkpoint',
         {'original/event/sequence_id': 9, 'receipt/sequence_id': 9, 'custody/first_append_receipt/sequence_id': 9,
          'issued_result/first_append_receipt/sequence_id': 9}, ['cohere'], ['cp_row', 'CR02_row_fields'],
         {'seal_as': [family, 'ds15-v1']}),
        ('SX05-read-original-sealed-under-another-family', 'project', 'read',
         {'original/event/actor_ref': 'actor:c12-sealed-wrong-family'}, ['cohere'], ['rd_resolve', 'SX05_original_verification'],
         {'seal_as': ['catalog.install.started', 'ds15-v1']}),
    ]
    return rows


def retained_witnesses():
    out = []
    for family in sorted(FAMILIES):
        for rid, base, op, changes, steps, target, seal in retained(family):
            w = {'id': f'c12/{family}/retained/{rid}', 'family': family, 'base': base, 'operation': op, 'changes': changes,
                 'maintain': steps, 'target': target, 'method': 'retained', 'donor': None}
            w.update(seal)
            out.append(w)
    return out


# --------------------------------------------------------------------------- derivation
def own_negatives(firsts, family):
    return {(w['first'][0], w['first'][1]) for w in firsts if w['f'] == family and w['first'] and not w['excluded']}


def derive(out):
    import pm_ds15_guard_suites as suites
    m16, deck = suites.m16, suites.deck
    calls = suites.witness_calls()
    firsts, reach = [], {f: set() for f in FAMILIES}
    for wid, family, kind, pair, call in calls:
        if kind in ('c12', 'c12parent') or (kind not in DONOR_KINDS and family not in FAMILIES):
            continue  # a previous derivation's own witnesses never count as existing negatives
        result, records = suites.run_recorded(call)
        if family in FAMILIES:
            reach[family] |= {phase for phase, _, _ in records}
        first = next((r for r in records if r[2] is not None), None)
        firsts.append({'w': wid, 'f': family, 'k': kind, 'first': [first[0], first[2][0]] if first else None,
                       'excluded': bool(first and suites.excluded(first[0], wid))})
    donors = {}
    for w in firsts:
        if w['first'] and not w['excluded'] and w['k'] in DONOR_KINDS:
            donors.setdefault(tuple(w['first']), []).append(w)
    witnesses, attempts = [], []
    for family in sorted(FAMILIES):
        have = own_negatives(firsts, family)
        for w in retained_witnesses():
            if w['family'] == family:
                status, reason, got = verdict(deck, w)
                attempts.append(dict(id=w['id'], target=w['target'], method='retained', status=status, reason=reason))
                if status == 'KILL':
                    witnesses.append(w)
                    have.add(tuple(w['target']))
        for entry in directed(family, fixture(deck, family)['bases'], contract(deck, family)):
            base, op, changes, steps, target = entry[:5]
            if tuple(target) in have:
                continue
            kind = 'policy' if op == 'policy' else 'directed'
            w = {'id': f'c12/{family}/{kind}/{target[1]}', 'family': family, 'base': base, 'operation': op,
                 'changes': changes, 'maintain': steps, 'target': target, 'method': 'directed', 'donor': None}
            w.update(entry[5] if len(entry) > 5 else {})
            status, reason, got = verdict(deck, w)
            attempts.append(dict(id=w['id'], target=target, method='directed', status=status, reason=reason))
            if status == 'KILL':
                witnesses.append(w)
                have.add(tuple(target))
        gaps = []
        for phase in sorted(reach[family]):
            for row, _, _ in deck.base.table_rows(phase):
                if (phase, row) not in have and (phase, row) in donors:
                    gaps.append((phase, row))
        for target in gaps:
            pool = sorted(donors[target], key=lambda w: (DONOR_KINDS.index(w['k']), w['w']))
            tried = 0
            for donor in pool:
                if tried >= ATTEMPTS_PER_ROW:
                    break
                specs = donor_specs(m16, deck, donor['w'], donor['f'])
                if not specs:
                    continue
                for spec in specs[1]:
                    tried += 1
                    w = transplant(deck, family, specs[0], spec, target, donor['w'])
                    w['id'] = f'c12/{family}/transplant/{target[1]}'
                    status, reason, got = verdict(deck, w)
                    attempts.append(dict(id=w['id'], donor=donor['w'], target=list(target), method='transplant',
                                         status=status, reason=reason, operation=spec[1]))
                    if status == 'KILL':
                        witnesses.append(w)
                        have.add(target)
                        break
                if target in have:
                    break
    FIXTURE.write_text(json.dumps(witnesses, indent=1, ensure_ascii=True, sort_keys=True) + '\n')
    out.mkdir(parents=True, exist_ok=True)
    (out / 'c12-derivation.json').write_text(json.dumps(dict(
        witnesses=len(witnesses), attempts=attempts, invalid=[a for a in attempts if a['status'] != 'KILL'],
        reach={f: sorted(v) for f, v in reach.items()}), indent=1, sort_keys=True) + '\n')
    return witnesses, attempts


FAMILIES = ('browser.context_share_revoked', 'browser.context_shared', 'catalog.remove.completed', 'catalog.remove.started',
            'catalog.update.completed', 'catalog.update.started', 'tool.custom_headless.skipped')


def fixture_cases():
    return json.loads(FIXTURE.read_text()) if FIXTURE.exists() else []


def witness_calls(m16, deck):
    """(id, family, kind, pair, call) for the guard-table suite builder, inputs built before recording."""
    out = []
    for w in fixture_cases():
        _, _, call = build(deck, w)
        pair = w['id'] + '#parent'
        out.append((pair, w['family'], 'c12parent', None, parent_call(deck, w)))
        out.append((w['id'], w['family'], 'c12', pair, call))
    return out


def check(deck, cases):
    problems = []
    for w in cases:
        status, reason, got = verdict(deck, w)
        if status != 'KILL':
            problems.append({'id': w['id'], 'target': w['target'], 'reason': reason})
    return problems


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--derive', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    if args.derive:
        witnesses, attempts = derive(args.out)
        print(json.dumps({'witnesses': len(witnesses), 'attempts': len(attempts),
                          'invalid': sum(a['status'] != 'KILL' for a in attempts)}))
        return 0
    m16, deck = load_models()
    cases = fixture_cases()
    problems = check(deck, cases)
    ids = [w['id'] for w in cases]
    by_family = {f: sum(w['family'] == f for w in cases) for f in FAMILIES}
    print(json.dumps({'status': 'pass' if not problems and len(set(ids)) == len(ids) else 'fail', 'witnesses': len(cases),
                      'by_family': by_family, 'duplicate_ids': len(ids) - len(set(ids)), 'problems': problems}))
    return 1 if problems or len(set(ids)) != len(ids) else 0


if __name__ == '__main__':
    sys.exit(main())
