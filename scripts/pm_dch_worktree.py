"""CH1 original worktree operations, composed with the existing DCH checker.

These are deterministic, synthetic source observations. An independently held
store supplies intent, committed result, record, first receipt and before/after
transaction snapshots. The reader never creates any of them. Native git/API,
redb transactions, receipt authentication and process execution remain NOT_RUN.
"""
import copy
import json
from pathlib import Path

from pm_dch_formats import validator
from pm_event_numbers import Refusal, full_value_commitment, storage_uint64

ROOT = Path(__file__).resolve().parents[1]
FAMILIES = tuple('chat.thread_worktree_' + suffix for suffix in (
    'bound', 'create_failed', 'merge_failed', 'merged', 'pr_created', 'pr_failed',
    'pre_merge_test_failed', 'pre_merge_test_passed', 'pre_merge_test_started', 'renamed', 'unbound'))
INPUT_FIELDS = ('operation_id', 'scope', 'computer_id', 'thread_id', 'actor_ref', 'worktree_id',
                'worktree_path', 'command', 'strategy', 'branch_name', 'target_branch', 'binding_origin',
                'old_branch_name', 'reason', 'test_target')
RECEIPT_NUMBERS = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')
RECEIPT_SCHEMA = json.loads((ROOT/'Plans/event_append_receipt_contracts.schema.json').read_text())['$defs']


def closed(properties, required=None):
    return dict(type='object', additionalProperties=False, properties=properties,
                required=list(properties) if required is None else required)


def source_schema(row, edition):
    """Witness-container shape only; existing owners validate payload/record/receipt.

    This DCH-specific schema gives every source field a closed shape before its
    transaction predicate reads it. It adds no product field or numeric limit.
    """
    payload = json.loads((ROOT/row['payload_schema_ref']).read_text())['$defs'][edition]
    props = payload['properties']
    intent = closed({k: copy.deepcopy(v) for k, v in props.items() if k in INPUT_FIELDS})
    text = dict(type='string', minLength=1)
    boolean = dict(type='boolean')
    nullable_text = dict(type=['string', 'null'])
    guards = closed({k: boolean for k in ('dirty', 'conflicts', 'active_run', 'detached')})
    api = closed(dict(status=text, pr_url=text, pr_number=dict(type='integer', minimum=1)), ['status'])
    action = row['event_type'].removeprefix('chat.thread_worktree_')
    outcomes = {
        'bound': closed(dict(status=text, inflight_turn=boolean)),
        'create_failed': closed(dict(status=text, error=text)),
        'merged': closed(dict(lock_owner=text, strategy=text, status=text, guards=guards, tests=text,
                             result_commit_sha=nullable_text, error=nullable_text, has_conflicts=boolean,
                             rebase_steps=dict(type='array', items=text))),
        'pr_created': closed(dict(push=text, api=closed(api['properties']))),
        'pr_failed': closed(dict(push=text, api=dict(anyOf=[closed(dict(status=text)), dict(type='null')]), error=text)),
        'pre_merge_test_started': closed(dict(lock_owner=text, target=text, strategy=text, guards=guards,
                                             safe_point_ref=text, rebase_conflict=boolean)),
        'renamed': closed(dict(status=text)),
        'unbound': closed(dict(origin=text, path_exists=boolean)),
    }
    outcomes['merge_failed'] = outcomes['merged']
    test_outcome = closed({**{k: copy.deepcopy(props[k]) for k in ('operation_id','scope','computer_id','thread_id',
        'worktree_id','command','strategy')}, 'duration_ms': dict(type='integer', minimum=0),
        'started_event_id': text, 'kind': dict(enum=['exit','timeout','process_error']),
        'exit_code': dict(type=['integer','null']), 'error_ref': nullable_text}) if 'pre_merge_test_' in action and action != 'pre_merge_test_started' else None
    if test_outcome is not None:
        outcomes[action] = test_outcome
    state = closed(dict(bindings=dict(type='object', additionalProperties=text),
                        reverse=dict(type='object', additionalProperties=text),
                        worktree=closed({k: text for k in ('worktree_id','worktree_path','branch_name','temp_branch_name')})))
    fields = dict(storage_instance_id=text, intent=intent, result=dict(type='object'), record=dict(type='object'),
                  receipt=dict(type='object'), first_receipt=dict(type='object'), commitment=dict(type='object'),
                  before=state, after=state, operation=closed(dict(event_type=text, operation_id=text,
                      actions=dict(type='array', items=text), outcome=outcomes[action])))
    if test_outcome is not None:
        fields['test_source'] = closed(dict(started=dict(type='object'), started_access=dict(type='object'), outcome=test_outcome))
    from pm_dch_worktree_protocol import ACTIONS, context_schema
    if action in ACTIONS:
        fields['operation']['properties']['owner_context']=context_schema(action)
        fields['operation']['properties']['execution_trace']=dict(type='array',items=text)
        fields['operation']['required']+=['owner_context','execution_trace']
    return closed(fields)


def orders(family,context=None):
    if family.endswith('_pre_merge_test_started'):
        return ['intent', 'lock', 'guards', 'snapshot', 'append', 'receipt']+([] if context and context['launch_state']=='not_launched' else ['launch'])
    return ['intent', 'effect', 'commit', 'readback', 'append', 'receipt', 'publish']


def _binding(state, p):
    return state['bindings'].get(p['thread_id']), state['reverse'].get(p.get('worktree_id'))


def owner_outcome(m, family, p, original):
    """Derive independent source observations; only named family rows refuse."""
    o=original['operation']['outcome'];b,a=original['before'],original['after']
    action=family.removeprefix('chat.thread_worktree_')
    if action=='bound':
        m.require('wt_bound',dict(status=o['status'],inflight=o['inflight_turn'],
            worktree=a['worktree']['worktree_id'],payload_worktree=p['worktree_id'],
            path=a['worktree']['worktree_path'],payload_path=p['worktree_path'],
            branch=a['worktree']['branch_name'],payload_branch=p['branch_name']))
    elif action=='create_failed':m.require('wt_create_failed',dict(status=o['status'],error=o['error'],payload_error=p['error']))
    elif action in ('merged','merge_failed'):
        facts=dict(lock=o['lock_owner'],operation=p['operation_id'],strategy=o['strategy'],payload_strategy=p['strategy'],
                   status=o['status'],commit=o['result_commit_sha'],rebase_steps=o['rebase_steps'])
        if action=='merged':facts.update(guard_mismatches=[k for k,v in o['guards'].items() if v is not False],
                                         tests=o['tests'],tests_enabled=original['operation']['owner_context']['tests_enabled'],payload_commit=p['result_commit_sha'])
        else:facts.update(error=o['error'],payload_error=p['error'],conflicts=o['has_conflicts'],payload_conflicts=p['has_conflicts'],
                         rebase_attempted=original['operation']['owner_context']['failure_stage']=='rebase_conflict')
        m.require('wt_'+action,facts)
    elif action=='pr_created':
        m.require('wt_pr_created',dict(push=o['push'],api_status=o['api']['status'],url=o['api']['pr_url'],
            payload_url=p['pr_url'],number=o['api']['pr_number'],payload_number=p['pr_number']))
    elif action=='pr_failed':
        m.require('wt_pr_failed',dict(error=o['error'],payload_error=p['error'],push=o['push'],
            expected_push='failed' if p['phase']=='push' else 'succeeded',phase=p['phase'],
            api_present=o['api'] is not None,api_status=o['api'].get('status') if o['api'] is not None else None))
    elif action=='pre_merge_test_started':
        m.require('wt_test_started',dict(lock=o['lock_owner'],operation=p['operation_id'],target=o['target'],payload_target=p['test_target'],
            strategy=o['strategy'],payload_strategy=p['strategy'],guard_mismatches=[k for k,v in o['guards'].items() if v is not False],
            safe_point_present=o['safe_point_ref'].startswith('pmref:'),rebase_conflict=o['rebase_conflict']))
    elif action in ('pre_merge_test_failed','pre_merge_test_passed'):
        m.require('wt_terminal',dict(outcome=o,terminal_source=original['test_source']['outcome']))
    elif action=='renamed':m.require('wt_renamed',dict(status=o['status'],old_branch=b['worktree']['branch_name'],
        payload_old=p['old_branch_name'],new_branch=a['worktree']['branch_name'],payload_new=p['new_branch_name']))
    elif action=='unbound':m.require('wt_unbound',dict(origin=o['origin'],
        expected_origin='path_revalidation' if p['reason']=='path_missing' else 'explicit_cleanup',reason=p['reason'],path_exists=o['path_exists']))
    else:raise ValueError('not a CH1 family: '+family)


def state_transition(family, p, original):
    b, a = original['before'], original['after']
    action = family.removeprefix('chat.thread_worktree_')
    if action == 'bound':
        return (_binding(b, p) == (None, None) and _binding(a, p) == (p['worktree_id'], p['thread_id'])
                and list(a['bindings'].values()).count(p['worktree_id']) == 1
                and list(a['reverse'].values()).count(p['thread_id']) == 1)
    if action == 'unbound':
        return (_binding(b, p) == (p['worktree_id'], p['thread_id']) and _binding(a, p) == (None, None)
                and a['worktree'] == b['worktree'])
    if action == 'renamed':
        return (a['bindings'] == b['bindings'] and a['reverse'] == b['reverse']
                and all(a['worktree'][k] == b['worktree'][k] for k in ('worktree_id', 'worktree_path', 'temp_branch_name')))
    return a == b


def check_original(m, record, row, original_ref, originals, store):
    """The complete route: current schemas, source, receipt, outcome and transaction.

    Missing/ambiguous originals refuse before indexing a source. The independent
    original and its first receipt are read-only here, including all refusal paths.
    """
    matches = originals.get(original_ref, [])
    m.require('wt_presence', dict(original_count=len(matches)))
    o = matches[0]
    m._schema_admission(record, validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text())))
    edition = record['scope_kind']
    m._schema_admission(o, validator(source_schema(row, edition)))
    # Current operation evidence is an independent integer/type boundary too.
    # Receipts use their own explicit storage_uint64 calls below.
    m._input_types({'source':{k:v for k,v in o.items() if k not in ('receipt','first_receipt','test_source')}})
    p = m._current_record(record, row, o.get('payload_source'), store)
    m._schema_admission(o['record'], validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text())))
    m._schema_admission(o['result'], validator(json.loads((ROOT/row['payload_schema_ref']).read_text())))
    # These are exact complete definitions, including their original formats.
    m._schema_admission(o['receipt'], validator(RECEIPT_SCHEMA['AppendReceipt']))
    m._schema_admission(o['first_receipt'], validator(RECEIPT_SCHEMA['AppendReceipt']))
    m._schema_admission(o['commitment'], validator(RECEIPT_SCHEMA['original_event_value_commitment']))
    m.require('wt_original', dict(original_store=o['storage_instance_id'], store=store,
        record_equal=record == o['record'], intent_mismatches=[k for k in INPUT_FIELDS if k in p and o['intent'].get(k) != p[k]],
        result_equal=p == o['result'], receipt_event=o['receipt']['event_id'], original_event=o['record']['event_id'],
        receipt_sequence=o['receipt']['sequence_id'], original_sequence=o['record']['sequence_id']))
    refusals = []
    for component in ('receipt','first_receipt'):
        for k in RECEIPT_NUMBERS:
            try:
                storage_uint64(o[component][k])
            except Refusal as e:
                refusals.append([component+'/'+k, e.reason])
    m.require('wt_receipt', dict(number_refusals=refusals, commitment=o['commitment']['sha256'],
        expected_commitment=full_value_commitment(o['record']), receipt_equal=o['receipt'] == o['first_receipt']))
    m.require('wt_transaction', dict(
        operation_identity=o['operation']['event_type'] == row['event_type'] and o['operation']['operation_id'] == o['intent']['operation_id'],
        operation_order=o['operation']['actions'] == orders(row['event_type'],o['operation'].get('owner_context')),
        ))
    owner_outcome(m,row['event_type'],p,o)
    m.require('wt_state',dict(state_transition=state_transition(row['event_type'],p,o)))
    if 'test_source' in o:
        m._test_joins(p, o['test_source'], row['event_type'])
    from pm_dch_worktree_protocol import check as protocol_check
    protocol_check(m,row['event_type'],p,o)
    return True


def fixtures():
    return json.loads((ROOT/'tests/fixtures/dch_c12_ch1/originals.json').read_text())


def checks(m):
    """Original controls are authored fixture inputs; never inferred from acceptance."""
    data = fixtures()
    rows = {r['event_type']: r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    selected = getattr(m, 'SELECTED_FAMILY', None)
    for original_ref, values in data.items():
        o = values[0]
        family = o['record']['event_type']
        if selected is not None and family != selected:
            continue
        before = copy.deepcopy(data)
        ok = m.worktree_event_valid(o['record'], rows[family], original_ref, data)
        yield family + ': CH1 committed worktree source ' + original_ref, ok and data == before


def publication_checks(m):
    data=fixtures()
    rows={r['event_type']:r for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']}
    selected=getattr(m,'SELECTED_FAMILY',None)
    for cp in json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text()):
        family=cp['event_type']
        if family not in FAMILIES or selected and family!=selected:continue
        ref=family+'/'+cp['source']['event_record']['scope_kind']
        before=copy.deepcopy(data)
        ok=m.worktree_checkpoint_valid(cp['valid'],cp['source'],rows[family],cp['key'],ref,data)
        yield family+': CH1 original receipt to SP-278 publication',ok and before==data
        foreign=copy.deepcopy(data);foreign[ref][0]['receipt']['event_id']+=':foreign'
        foreign[ref][0]['first_receipt']=copy.deepcopy(foreign[ref][0]['receipt'])
        yield family+': CH1 checkpoint cannot use foreign first receipt',not m.worktree_checkpoint_valid(cp['valid'],cp['source'],rows[family],cp['key'],ref,foreign)
        # Distinct publication/source record witnesses already exercise every
        # SP-278 pair in the original suite; this control composes both graphs.
