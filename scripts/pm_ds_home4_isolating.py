"""Complete Home4 inputs for the review's exact join/capture proof seams."""
from __future__ import annotations
import base64
import copy
import json
import pm_home_layout_v2_slot_receipt as h
import pm_event_authority_ds_round2 as ds


def refresh_source(value, which):
    data = h.canonical_json(value[which + '_layout'])
    value[which + '_layout_source_bytes'] = {'form': 'inline', 'bytes': base64.b64encode(data).decode()}
    value[which + '_layout_sha256'] = h.sha(data)
    if which == 'candidate' and value['readback'] is not None:
        value['readback']['layout_sha256'] = h.sha(data)


def refresh_receipt(value):
    digest = h.sha(h.canonical_json(value['owner_result']))
    value['original_owner_result_sha256'] = digest
    if value['original_command_outcome'] is not None:
        value['original_command_outcome']['owner_result_sha256'] = digest
    refresh_captures(value)


def refresh_captures(value):
    for key in ('normalized_request', 'command_outcome', 'ui_response'):
        original = value['original_' + key]
        data = h.canonical_msgpack(original) if original is not None else None
        value['identity_capture_bytes'][key] = base64.b64encode(data).decode() if data is not None else None
        value['identity_capture_bytes_sha256'][key] = h.sha(data) if data is not None else None


def replace_strings(value, before, after):
    if isinstance(value, dict):
        return {k: replace_strings(v, before, after) for k, v in value.items()}
    if isinstance(value, list):
        return [replace_strings(v, before, after) for v in value]
    return value.replace(before, after) if isinstance(value, str) else value


def cases():
    fixtures = ds.load(h.FIXTURES)
    valid = {c['id']: c for c in fixtures['valid']}
    slot = valid['home4_readback_verified_slot']['value']
    committed = valid['home4_committed_receipt']['value']
    receipt=copy.deepcopy(committed)
    receipt.update(state='prepared',append_result=None,source_durability_ref=None,terminal_at_utc=None,
                   original_append_receipt=None,original_publication=None)
    receipt['owner_result'].update(event_status='pending',event_ref=None)
    receipt['dispatch_receipt']['event_ref']=None
    receipt['original_ui_response']['event_refs']=[]
    refresh_receipt(receipt)
    checker = h.Checker(ds.ROOT)
    store = h.PayloadStore.from_fixture(fixtures['payload_store'])
    assert not checker.schema_errors('operation_receipt',receipt)
    assert not checker.semantic('operation_receipt',receipt,store)
    rows = []
    def add(uid, label, base, mutate, *, capture=False, preserve_hash=False):
        value = copy.deepcopy(base)
        mutate(value)
        if capture:
            (refresh_captures if preserve_hash else refresh_receipt)(value)
        definition = 'transaction_slot' if base is slot else 'operation_receipt'
        def errors(v=value, d=definition):
            shape = checker.schema_errors(d, v)
            return shape or checker.semantic(d, v, store)
        rows.append({'id': 'NEG-' + uid + ':' + label, 'review_id': uid,
                     'definition': definition, 'value': value, 'errors': errors,
                     'entry': lambda f=errors: not f()})

    def event_field(field, val):
        return lambda v: v['event_semantics'].__setitem__(field, val)
    def payload_field(field, val):
        return lambda v: v['event_semantics']['payload'].__setitem__(field, val)
    for field, value in [('producer_sequence_id', 10)]:
        add('U004', field, slot, event_field(field, value))
    for field in ('prior_layout_revision', 'new_layout_revision'):
        def revision_edge(v, field=field):
            value = 6 if field.startswith('prior') else 10
            v['event_semantics']['payload'][field] = value
            if field == 'new_layout_revision':
                v['event_semantics']['producer_sequence_id'] = value
        add('U004', field, slot, revision_edge)
    add('U005', 'envelope_correlation', slot, event_field('correlation_id', 'correlation:foreign'))
    for field in ('correlation_id', 'interaction_transaction_id'):
        add('U005', field, slot, payload_field(field, 'correlation:foreign'))
    add('U006', 'actor_ref', slot, event_field('actor_ref', 'actor:foreign'))
    def pending_command(v):
        custody=v['pending_sir_custody']
        for key in ('original_source','current_source'):
            source=custody[key]
            # Both observed copies and their complete source captures follow the
            # changed command. The authoritative slot binding stays original.
            source['normalized_request']['command_id']='cmd.workspace_layout.split_panel'
            source['nonterminal_outcome']['command_id']='cmd.workspace_layout.split_panel'
            custody[key+'_sha256']=h.sha(h.canonical_json(source))
    add('U016','pending_source_command',slot,pending_command)
    for field, value in [('storage_instance_id', '22222222-2222-4222-8222-222222222222'),
                         ('project_id', 'project-foreign'), ('workspace_tab_id', 'workspace-foreign')]:
        def binding_scope(v, field=field, value=value):
            old = v['binding']['operation_digest']
            v['binding'][field] = value
            new = h.digest(v['binding'])
            updated = replace_strings(v, old, new)
            v.clear(); v.update(updated)
            if field == 'project_id':
                v['event_semantics']['project_id'] = v['event_semantics']['payload']['project_id'] = value
            elif field == 'workspace_tab_id':
                v['event_semantics']['payload']['workspace_tab_id'] = value
            v['readback']['canonical_key'] = h.layout_key(v['binding'])
        add('U014', field, slot, binding_scope)
    for which in ('prior', 'candidate'):
        def revision(v, which=which):
            v[which + '_layout']['revision'] += 2
            refresh_source(v, which)
            if which == 'candidate':
                v['readback']['layout_revision'] = v['candidate_layout']['revision']
        add('U015', which, slot, revision)
        for field in ('project_id', 'workspace_tab_id'):
            def layout_scope(v, which=which, field=field):
                v[which + '_layout'][field] += '-foreign'
                refresh_source(v, which)
            add('U018', which + ':' + field, slot, layout_scope)
    add('U019', 'readback_key', slot, lambda v: v['readback'].__setitem__('canonical_key', 'home_workspace_layout.v2:foreign:workspace'))
    for field, value in [('layout_revision', 10), ('layout_sha256', 'f' * 64)]:
        add('U020', field, slot, lambda v, f=field, x=value: v['readback'].__setitem__(f, x))
    add('U021', 'normalized_command', receipt,
        lambda v: v['original_normalized_request'].__setitem__('command_id', 'cmd.workspace_layout.split_panel'), capture=True)
    add('U022', 'receipt_prior', receipt, lambda v: v.__setitem__('prior_layout_revision', 6), capture=True)
    add('U022', 'owner_prior', receipt, lambda v: v['owner_result'].__setitem__('prior_layout_revision', 6), capture=True)
    for field in ('operation_ref', 'result_ref'):
        def owner_ref(v, field=field):
            old = v['owner_result'][field]
            replacement = old.rsplit(':', 1)[0] + ':' + 'f' * 64
            if field == 'result_ref':
                updated = replace_strings(v, old, replacement)
                v.clear(); v.update(updated)
            else:
                v['owner_result'][field] = replacement
        add('U023', 'owner:' + field, receipt, owner_ref, capture=True)
    for field in ('receipt_ref', 'operation_ref'):
        def dispatch_ref(v, field=field):
            v['dispatch_receipt'][field] = v['dispatch_receipt'][field].rsplit(':', 1)[0] + ':' + 'f' * 64
            if field == 'receipt_ref':
                v['event_semantics']['payload']['receipt_refs'] = [v['dispatch_receipt'][field]]
        add('U023', 'dispatch:' + field, receipt,
            dispatch_ref, capture=True)
    for field in ('command_result_ref', 'correlation_id', 'dispatch_ref'):
        add('U024', field, receipt, lambda v, f=field: v['dispatch_receipt'].__setitem__(f, v['dispatch_receipt'][f] + '-foreign'), capture=True)
    add('U027', 'readback_hash', receipt, lambda v: v['readback'].__setitem__('layout_sha256', 'f' * 64), capture=True)
    def settlement(v):
        v['settled_layout_ref'] = v['event_semantics']['payload']['settled_layout_ref'] = 'home_layout_settlement:' + 'f' * 64
    add('U027', 'settlement_ref', receipt, settlement, capture=True)
    for key in ('owner_result', 'dispatch_receipt'):
        add('U029', key, committed, lambda v, k=key: v[k].__setitem__('event_ref', 'evt_workspace_layout_' + 'f' * 64), capture=True)
    foreign_ref={'path':'Plans/browser_workspace_created_contracts.schema.json','json_pointer':'#/$defs/checkpoint',
                 'schema_id':'pm.storage_value.browser_workspace_created_index_checkpoint.v1'}
    for uid,key in [('U026','original_ui_response'),('U031','original_command_outcome')]:
        add(uid,'foreign_owner_result_schema',receipt,
            lambda v,k=key:v[k].__setitem__('owner_result_schema_ref',copy.deepcopy(foreign_ref)),capture=True)
    for mode in ('missing_capture','missing_original','orphan_hash'):
        def presence(v,mode=mode):
            if mode=='missing_capture':
                v['identity_capture_bytes']['ui_response']=None
                v['identity_capture_bytes_sha256']['ui_response']=None
            elif mode=='missing_original':
                v['original_ui_response']=None
            else:
                v['original_ui_response']=None
                v['identity_capture_bytes']['ui_response']=None
                v['identity_capture_bytes_sha256']['ui_response']='f'*64
        add('U033',mode,receipt,presence)
    def false_owner_hash(v):
        v['original_owner_result_sha256'] = v['original_command_outcome']['owner_result_sha256'] = 'f' * 64
    add('U032', 'coherent_false_hash', receipt, false_owner_hash, capture=True, preserve_hash=True)
    return rows
