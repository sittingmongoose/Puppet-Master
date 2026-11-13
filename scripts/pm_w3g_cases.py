"""W3G phase-2 cases: every positive branch and one single-defect negative per (family, row).

A case is (id, family, scope, boundary, build kwargs, mutation, expected). The mutation changes exactly one
thing of a valid complete boundary input built by pm_w3g_events.build_world; a change to the stored event is
followed by refinish(), so every dependent copy, key, hash, pack, receipt commitment and sealed receipt
follows it, and the independent originals (native source, owner issuance, request) stay valid. Expected is
None (accept) or (phase, row, code): the FIRST refusal of the complete checker must be exactly that row.
"""
import copy
import hashlib

import pm_w3g_events as m
import pm_w3g_spec as spec

H = spec.H
A, RT, HI, RS = m.A, m.RT, m.HI, m.RS


def _row(phase, field):
    for r in m.all_phases()[phase][2]:
        if r[1] == field:
            return (phase, r[0], r[3])
    raise KeyError((phase, field))


def case(cid, f, scope, boundary, expect, mut=None, **kw):
    return dict(id=cid, family=f, scope=scope, boundary=boundary, kwargs=kw, mut=mut, expect=expect)


def run(c):
    """(got, world). got is None (accepted) or the first refusal; a refusal must leave the world unchanged."""
    w = m.build_world(c['family'], c['scope'], boundary=c['boundary'], **c['kwargs'])
    if c['mut'] is not None:
        c['mut'](w)
    before = copy.deepcopy(w)
    got = m.check(w)
    assert m.exact(w, before), 'the checker changed its input (a refusal must have zero new effects)'
    if c['boundary'] == HI:
        sealed = len(w['storage']['sealed'])
        out = m.retained_read(w)
        assert len(w['storage']['sealed']) == sealed, 'a retained read created a receipt'
        assert m.exact(w, before), 'a retained read changed custody bytes'
        assert (out[0] == 'available') == (got is None), (out, got)
    return got, w


# --- mutation helpers ----------------------------------------------------------------------------------
def ev(**changes):
    def mut(w):
        for k, v in changes.items():
            w['event'][k] = copy.deepcopy(v)
        m.refinish(w)
    return mut


def at(path, value, refin=False):
    """Set one nested value of the world (dotted path; list index as int)."""
    def mut(w):
        node = w
        parts = path.split('.')
        for p in parts[:-1]:
            node = node[int(p)] if type(node) is list else node[p]
        last = parts[-1]
        node[int(last) if type(node) is list else last] = copy.deepcopy(value(w) if callable(value) else value)
        if refin:
            m.refinish(w)
    return mut


def chain(*muts):
    def mut(w):
        for x in muts:
            x(w)
    return mut


def other_family(f):
    return next(x for x in m.FAMILIES if x != f)


def _sel(w):
    return m.payload_schema_id(w['family'], w['scope'])


# --- positives ---------------------------------------------------------------------------------------------
def positives():
    out = []
    for f in m.FAMILIES:
        for s in m.SCOPES[f]:
            for b in (A, RT, HI, RS):
                for form in ('inline', 'ref'):
                    out.append(case(f'pos/{f}/{s}/{b}/{form}', f, s, b, None, form=form))
            for v in spec.VARIANTS[f]:
                if v == 'base':
                    continue
                bounds = (HI,) if (f, v) in spec.HISTORY_ONLY_VARIANTS else (A, RT, HI)
                for b in bounds:
                    out.append(case(f'pos/{f}/{s}/{b}/variant:{v}', f, s, b, None, variant=v))
            # SP-337 full payload over the inline limit; every stored part bounded
            out.append(case(f'pos/{f}/{s}/append/sp337-large', f, s, A, None, form='ref', pad=17000))
            # retry comparison excludes Storage-assigned metadata (CV-317; standing check 6)
            out.append(case(f'pos/{f}/{s}/retry/storage-metadata-differs', f, s, RT, None,
                            mut=chain(at('retry.incoming.sequence_id', 99), at('retry.incoming.observed_at_utc', '2026-11-06T00:00:00Z'),
                                      at('retry.incoming.persisted_at_utc', '2026-11-06T00:00:01Z'))))
            # retained original after live-state changes (writer lease loss, write permission revoked, CAS/owner/Stop
            # changed, live admission withdrawn): history keeps its original admission/edition (standing check 10)
            out.append(case(f'pos/{f}/{s}/history/live-state-changed', f, s, HI, None, mut=chain(
                at('writer.lease.held', False), at('writer.permission', False), at('writer.current.preimage', H('later')),
                at('writer.current.owner', 'Successor'), at('writer.current.stop', 'manual_stop'), at('writer.current.epoch', 9),
                at('registry.family_admitted', False), at('registry.selectors', {}), at('registry.retention', {}))))
            # retained compatibility history on the passive path: projector_replay_only is read, never appended
            out.append(case(f'pos/{f}/{s}/history/projector-replay-only', f, s, HI, None,
                            mut=ev(replay_policy='projector_replay_only')))
            # retained original written under the older producer recipe: a number the current CV-1100 route refuses
            # is read by its sealed legacy edition (item 10a); the same value is refused on a current write (negative)
            out.append(case(f'pos/{f}/{s}/history/legacy-recipe-number', f, s, HI, None, edition=m.LEGACY,
                            native_patch=dict(producer_sequence_id=2 ** 53 + 1)))
            # empty matching set over a proven nonempty captured range
            out.append(case(f'pos/{f}/{s}/history/empty-match', f, s, HI, None, mut=at('query.subject_id', 'subject-none')))
    for f in ('goal.paused', 'goal.resumed'):
        for s in m.SCOPES[f]:
            # retained admitted V2 original stays valid after a later live cancellation_pending / receipt (GRS-064)
            out.append(case(f'pos/{f}/{s}/history/v2-after-live-cancellation', f, s, HI, None,
                            mut=chain(at('writer.current.stop', 'cancel'), at('writer.current.preimage', H('cancelling')))))
    out.append(case('pos/goal.paused/project/append/variant:staged', 'goal.paused', 'project', A, None, variant='staged'))
    return out


# --- per-keyword payload negatives ---------------------------------------------------------------------------
def _py_value(f, scope, kw, k, payload):
    sel = m.SCHEMAS[f]['$defs'][m.SELECTOR[f][scope]]
    if k is None:
        return None
    prop = sel['properties'][k]
    v = payload.get(k)
    if kw == 'const':
        c = prop['const']
        return 'other' if type(c) is str else (c + 1 if type(c) is int else 'run-x')
    if kw == 'type':
        t = prop['type']
        return {'string': 7, 'integer': 'seven', 'number': '1.5', 'boolean': 'true', 'array': 'refs'}[t]
    if kw == 'pattern':
        return ('g' * 64) if prop['pattern'] == '^[0-9a-f]{64}$' else 'bad\x01ref'
    if kw == 'maxLength':
        return 'a' * 64 + '\n'          # 65 characters that the 64-hex pattern still matches (re.search, $ before LF)
    if kw == 'minLength':
        return ''
    if kw == 'minimum':
        return prop['minimum'] - 1
    if kw == 'enum':
        return 'not_in_enum'
    if kw == 'minItems':
        return []
    if kw == 'uniqueItems':
        return [v[0], v[0]]
    if kw == 'items_type':
        return [5]
    if kw == 'items_pattern':
        return ['bad\x01ref']
    if kw == 'anyOf_type':
        return 7.5 if prop['anyOf'][0]['type'] == 'string' else 'seven'
    if kw == 'anyOf_pattern':
        return 'bad\x01ref'
    if kw == 'anyOf_minimum':
        return prop['anyOf'][0]['minimum'] - 1
    if kw == 'scope_ref':
        return dict(v, scope_partition='')
    if kw == 'scope_kind_const':
        if scope == 'project':
            return dict(schema_id='pm.workflow_scope.v2', schema_version='2.0.0', scope_kind='application', scope_partition='app',
                        project_id=None, project_home_server_id=None, named_plan_id=None, server_id=v['server_id'])
        return dict(v, scope_kind='project', scope_partition=m.partition_of('project', m.PROJECT), project_id=m.PROJECT,
                    project_home_server_id=v['server_id'])
    if kw == 'ref':
        return -1.0 if 'usd_amount' in prop['$ref'] else 'not_a_code'
    raise AssertionError(kw)


def py_negatives(f, scope):
    out = []
    phase = f'py_{m.FAM[f]["slug"]}'
    w0 = m.build_world(f, scope)
    payload = w0['event']['payload']
    for row, field, *_ in m.py_rows(f):
        kw, _, k = field.partition('.')
        k = k or None
        expect = (phase, row, m.PY_CODE)
        if kw == 'closed':
            mut = _payload_edit({'unexpected_member': 'x'})
        elif kw == 'required':
            mut = _payload_drop(k)
        else:
            value = _py_value(f, scope, kw, k, payload)
            mut = _payload_edit({k: value})
        out.append(case(f'neg/{f}/{scope}/{row}', f, scope, A, expect, mut=mut))
    return out


def _payload_edit(changes):
    def mut(w):
        for k, v in changes.items():
            w['event']['payload'][k] = copy.deepcopy(v)
        m.refinish(w)
    return mut


def _payload_drop(k):
    def mut(w):
        del w['event']['payload'][k]
        m.refinish(w)
    return mut


# --- common-row negatives -----------------------------------------------------------------------------------
def _alt(v):
    if type(v) is str:
        return H('alt') if len(v) == 64 and all(c in '0123456789abcdef' for c in v) else v + '-alt'
    if type(v) is bool:
        return not v
    if type(v) is int:
        return v + 1
    if type(v) is float:
        return v + 0.5
    if type(v) is list:
        return v + ['alt-ref'] if v and type(v[0]) is str else list(reversed(v)) + [v[0]]
    if v is None:
        return 'alt-ref'
    raise AssertionError(v)


def common_negatives(f, scope):
    W = lambda field: _row(*field)  # noqa: E731
    out = []
    op_other = 'op:other:1'

    def add(table, field, boundary, mut, **kw):
        out.append(case(f'neg/{f}/{scope}/{boundary}/{field}', f, scope, boundary, _row(table, field), mut=mut, **kw))

    # ad
    add('ad', 'membership', A, at('registry.family_admitted', False))
    add('ad', 'membership_selector', A, lambda w: w['registry']['selectors'].__setitem__(_sel(w), False))
    add('ad', 'retention', A, at('registry.retention', {}))
    add('ad', 'withdrawal', A, lambda w: w['registry']['withdrawn'].append(_sel(w)))
    add('ad', 'withdrawal', HI, lambda w: w['registry']['withdrawn'].append(_sel(w)))
    # sc
    add('sc', 'reference_closure', A, at('registry.resources', list(m.CLOSURE_NEGATIVE_EXCLUSION)))
    add('sc', 'exact_types', A, at('request.checkpoint.frontier_revision', '41'))
    add('sc', 'identifier_fullmatch', A, at('request.source_record_sha256', lambda w: w['request']['source_record_sha256'] + '\n'))
    add('sc', 'identifier_spelling', A, at('request.source_record_ref', lambda w: w['request']['source_record_ref'].upper()))
    # pf
    add('pf', 'form_exclusive', A, lambda w: w['stored'].__setitem__('payload_ref', 'payload:v1:' + 'a' * 64))
    add('pf', 'route_id', A, lambda w: w['stored'].__setitem__('payload_ref', w['stored']['payload_ref'].replace('payload:v1:', 'payload:v2:')),
        form='ref')
    add('pf', 'pack_present', A, at('storage.packs', {}), form='ref')
    add('pf', 'pack_synced', A, lambda w: next(iter(w['storage']['packs'].values())).__setitem__('pack_synced', False), form='ref')
    add('pf', 'payload_form', A, lambda w: next(iter(w['storage']['packs'].values())).__setitem__(
        'bytes', m.storage_value_bytes(dict(w['event']['payload'], schema_version='9.9.9'), profile=m.EVENT_VALUE)), form='ref')
    add('pf', 'pack_media', A, lambda w: next(iter(w['storage']['packs'].values())).__setitem__('media_type', 'application/json'),
        form='ref')

    def bad_pack(w):
        raw = b'\xc1'
        digest = m.blake3(raw).hexdigest()
        w['storage']['packs'] = {digest: dict(bytes=raw, media_type=m.MEDIA, pack_synced=True, index_synced=True)}
        w['stored']['payload_ref'] = 'payload:v1:' + digest
    add('pf', 'pack_decodes', A, bad_pack, form='ref')
    add('pf', 'value_size', A, None, pad=17000)
    add('pf', 'stored_size', A, None, form='ref', corr_pad=17000)
    # en
    add('en', 'envelope_schema', A, ev(attempt_id=''), native_patch={})
    add('en', 'family_type', A, ev(event_type=other_family(f)))
    add('en', 'payload_schema_id', A, ev(payload_schema_id='pm.event_payload.other.v1'))
    add('en', 'replay_only_writer', A, ev(replay_policy='projector_replay_only'))
    add('en', 'replay_only_writer', RT, ev(replay_policy='projector_replay_only'))
    add('en', 'replay_family', A, ev(replay_policy='append_once'))
    add('en', 'migration_null', A, lambda w: (w['event']['migration'].__setitem__('migration_id', 'mig-1'), m.refinish(w)))
    add('en', 'redaction_family', A, ev(redaction_profile='no_secrets'))
    # nm
    add('pf', 'physical_value', A, ev(producer_sequence_id=2 ** 64))
    add('nm', 'sequence_uint64', A, chain(ev(sequence_id=41.0),
                                          lambda w: w['storage']['issued'][w['event']['event_id']].__setitem__('sequence_id', 41.0),
                                          lambda w: next(iter(w['storage']['receipts'].values())).__setitem__('sequence_id', 41)))
    add('nm', 'producer_sequence', A, ev(producer_sequence_id=7.0))
    slots = m._int_slots(f, scope)
    free = [k for k, _mn, _mx, _nl in slots if w0_payload(f, scope).get(k) is not None]
    if free:
        k = free[0]
        add('nm', 'payload_integers', A, _payload_edit({k: float(w0_payload(f, scope)[k])}))
    add('nm', 'producer_route', A, None, native_patch=dict(producer_sequence_id=2 ** 53 + 1))
    add('nm', 'receipt_uint64', A, lambda w: next(iter(w['storage']['receipts'].values())).__setitem__('sequence_id', 41.0))
    add('nm', 'frontier_uint64', HI, chain(at('checkpoint.live_token.frontier_revision', 2 ** 64),
                                           at('checkpoint.stored_token.frontier_revision', 2 ** 64)))
    # tm
    add('tm', 'occurred_clock', A, None, native_patch=dict(accepted_at_utc='2026-11-05T10:00:00'))
    add('tm', 'observed_clock', A, chain(ev(observed_at_utc='2026-11-05T10:00:01+00:00'),
                                         lambda w: w['storage']['issued'][w['event']['event_id']].__setitem__('observed_at_utc', '2026-11-05T10:00:01+00:00')))
    add('tm', 'persisted_clock', A, chain(ev(persisted_at_utc='2026-11-05T10:00:01.5z'),
                                          lambda w: w['storage']['issued'][w['event']['event_id']].__setitem__('persisted_at_utc', '2026-11-05T10:00:01.5z')))
    add('tm', 'ack_clock', A, lambda w: next(iter(w['storage']['receipts'].values())).__setitem__('acknowledged_at_utc', '2026-11-05T24:00:00Z'))
    # src
    add('src', 'source_custody', A, at('issued.records', {}))
    add('src', 'source_custody', HI, at('issued.records', {}))
    add('src', 'source_receipt_issued', A, at('issued.receipts', {}))
    add('src', 'source_digest', A, at('request.source_record_sha256', H('partial-source')))
    add('src', 'source_issuer', A, None, native_patch=dict(issuer='Orchestrator'))
    add('src', 'source_schema', A, None, native_patch=dict(schema_id='Plans/other.schema.json#/$defs/Other'))
    # pj
    add('pj', 'payload_operation', A, _payload_edit({'owner_operation_id': op_other}))
    alt_scope = (lambda w: dict(w['event']['payload']['scope'], named_plan_id='named-plan-1')) if scope == 'project' else \
        (lambda w: dict(w['event']['payload']['scope'], server_id='server-2'))
    add('pj', 'payload_scope', A, lambda w: (w['event']['payload'].__setitem__('scope', alt_scope(w)), m.refinish(w)))
    add('pj', 'payload_record_ref', A, _payload_edit({'source_record_ref': 'src:other:1'}))
    add('pj', 'payload_record_sha256', A, _payload_edit({'source_record_sha256': H('partial-source')}))
    add('pj', 'payload_source_schema_id', A, _payload_edit({'source_schema_id': 'Plans/other.schema.json#/$defs/Other'}))
    add('pj', 'payload_source_schema_version', A, _payload_edit({'source_schema_version': '2.0.0'}))
    add('pj', 'payload_receipt_ref', A, _payload_edit({'source_receipt_ref': 'srcrcpt:other:1'}))
    add('pj', 'payload_receipt_ref', HI, _payload_edit({'source_receipt_ref': 'srcrcpt:other:1'}))
    # ej
    if scope == 'project':
        add('ej', 'env_project_id', A, ev(project_id='proj-beta'))
    add('ej', 'env_thread_id', A, ev(thread_id='thread-9'))
    add('ej', 'env_run_id', A, ev(run_id='run-9'))
    add('ej', 'env_node_id', A, ev(node_id='node-9'))
    add('ej', 'env_attempt_id', A, ev(attempt_id='attempt-9'))
    add('ej', 'env_actor', A, ev(actor_ref='user:bob'))
    add('ej', 'env_requested_account', A, ev(requested_account_ref='acct-9'))
    add('ej', 'env_effective_account', A, ev(effective_account_ref='acct-9'))
    add('ej', 'env_occurred_at', A, ev(occurred_at_utc='2026-11-05T10:00:00.251Z'))
    add('ej', 'env_producer_sequence', A, ev(producer_sequence_id=8))
    add('ej', 'env_correlation', A, ev(correlation_id='corr-2'))
    add('ej', 'env_causation', A, ev(causation_event_id='evt-9'))
    add('ej', 'env_parent', A, ev(parent_event_id='evt-8'))
    add('ej', 'env_parent', HI, ev(parent_event_id='evt-8'))
    # sj
    other_scope = 'application' if scope == 'project' else 'project'
    add('sj', 'req_scope_kind', A, at('request.scope.scope_kind', other_scope))
    add('sj', 'req_scope_partition', A, at('request.scope.scope_partition', 'project~b3RoZXI'))
    add('sj', 'req_project_id', A, at('request.scope.project_id', 'proj-beta'))
    add('sj', 'req_server_id', A, at('request.scope.server_id', 'server-2'))
    add('sj', 'req_computer_id', A, at('request.scope.computer_id', 'computer-9'))
    add('sj', 'req_subject_id', A, at('request.subject.subject_id', 'subject-9'))
    add('sj', 'req_thread_id', A, at('request.subject.thread_id', 'thread-9'))
    add('sj', 'req_run_id', A, at('request.subject.run_id', 'run-9'))
    add('sj', 'req_subject_id', HI, at('request.subject.subject_id', 'subject-9'))
    # wr (current write and current retry)
    for b in (A, RT):
        add('wr', 'writer_currentness', b, at('request.expected_currentness', 'currentness-6'))
        add('wr', 'write_lease', b, at('writer.lease.held', False))
        add('wr', 'write_lease_scope', b, at('writer.lease.partition', 'project~b3RoZXI'))
        add('wr', 'write_permission', b, at('writer.permission', False))
        add('wr', 'writer_owner', b, at('writer.owner', 'Other'))
        add('wr', 'writer_epoch', b, at('writer.captured_epoch', 4))
        add('wr', 'writer_cas', b, at('writer.expected_preimage', H('preimage-6')))
        add('wr', 'writer_intent', b, at('request.intent', 'intent:other'))
        add('wr', 'writer_stop_epoch', b, at('writer.captured_stop_epoch', 1))
        if f not in spec.STOP_PERMITTED:
            add('wr', 'writer_stop_blocked', b, at('writer.current.stop', 'manual_stop'))
        add('wr', 'writer_final_fence', b, at('writer.fence_after.lease_held', False))
    # id
    add('id', 'identity_recipe', A, lambda w: (w['event'].__setitem__(
        'event_id', m.event_id_of(m.INSTANCE, w['native']['scope']['scope_partition'], f, op_other)), m.refinish(w)))
    add('id', 'identity_request', A, at('request.event_id', lambda w: m.event_id_of(m.INSTANCE, w['native']['scope']['scope_partition'], f, op_other)))
    if scope == 'application':
        add('id', 'application_key', A, ev(idempotency_key='application@1:' + m.hx(m.SERVER).upper() + ':' + m.hx(f'op:{f}:1')))
        add('id', 'identity_idempotency', A, ev(idempotency_key='application@1:' + m.hx('server-2') + ':' + m.hx(f'op:{f}:1')))
    else:
        add('id', 'identity_idempotency', A, ev(idempotency_key=f'{f}@1:' + m.hx(op_other)))
    add('id', 'identity_recipe', HI, lambda w: (w['event'].__setitem__(
        'event_id', m.event_id_of(m.INSTANCE, w['native']['scope']['scope_partition'], f, op_other)), m.refinish(w)))
    # st
    add('st', 'sequence_issued', A, ev(sequence_id=42))
    add('st', 'observed_issued', A, ev(observed_at_utc='2026-11-05T10:00:03Z'))
    add('st', 'persisted_issued', A, ev(persisted_at_utc='2026-11-05T10:00:03Z'))
    add('st', 'receipt_custody', A, at('request.receipt_selector', 'rcpt:other'))
    add('st', 'receipt_event', A, lambda w: next(iter(w['storage']['receipts'].values())).__setitem__('full_value_commitment', H('forged')))
    add('st', 'receipt_event', HI, lambda w: next(iter(w['storage']['receipts'].values())).__setitem__('full_value_commitment', H('forged')))
    add('st', 'receipt_group', A, at('request.expected_group', 'grp-2'))
    add('st', 'group_member', A, at('storage.groups', {'grp-1': []}))
    add('st', 'receipt_sequence', A, lambda w: next(iter(w['storage']['receipts'].values())).__setitem__('sequence_id', 40))
    # ry
    first_field = next(iter(spec.PAYLOAD[f]))
    add('ry', 'retry_conflict', RT, lambda w: w['retry']['incoming']['payload'].__setitem__(first_field, 'conflicting-body'))
    add('ry', 'no_second_effect', RT, at('retry.resolution.effects_delta', 1))
    add('ry', 'retry_original_result', RT, at('retry.resolution.result_ref', 'result:other'))
    add('ry', 'retry_first_receipt', RT, lambda w: w['retry']['resolution']['receipt'].__setitem__('receipt_id', 'rcpt:second'))
    # rr (retained reads: the sealed receipt only)
    add('rr', 'sealed_present', HI, at('storage.sealed', []))
    add('rr', 'sealed_unique', HI, lambda w: w['storage']['sealed'].append(copy.deepcopy(w['storage']['sealed'][0])))
    add('rr', 'sealed_binding', HI, lambda w: w['storage']['sealed'][0]['binding'].__setitem__('owner_operation_id', op_other))
    add('rr', 'recipe_known', HI, lambda w: w['storage']['sealed'][0]['recipe'].__setitem__('payload_profile', 'unknown-profile'))
    add('rr', 'recipe_edition', HI, lambda w: w['storage']['sealed'][0].__setitem__(
        'recipe', dict(m.RECIPES[(other_family(f), 'project', 'current')].__dict__)))
    add('rr', 'original_admission', HI, lambda w: w['storage']['sealed'][0].__setitem__('admitted', False))
    # rd
    add('rd', 'read_permission', HI, at('reader.permission', False))
    add('rd', 'not_deleted', HI, lambda w: w['storage']['tombstones'].append(w['event']['event_id']))
    add('rd', 'restriction_ok', HI, at('reader.clearances', []))
    add('rd', 'dispatch_event_type', HI, at('request.dispatch.event_type', other_family(f)))
    add('rd', 'dispatch_schema_id', HI, at('request.dispatch.payload_schema_id', 'pm.event_payload.other.v1'))
    add('rd', 'dispatch_scope', HI, at('request.dispatch.payload_scope', other_scope))
    add('rd', 'dispatch_edition', HI, at('request.dispatch.payload_edition', '2.0.0'))
    add('rd', 'ckpt_instance', HI, at('request.checkpoint.storage_instance_id', '6f1d2c3a-5b7e-4c1d-8e2f-000000000002'))
    add('rd', 'ckpt_generation', HI, at('request.checkpoint.generation_id', 'eig_' + 'b' * 64))
    add('rd', 'ckpt_frontier', HI, at('request.checkpoint.frontier_revision', 40))
    add('rd', 'ckpt_scope', HI, at('request.checkpoint.checkpoint_key', 'event_record_index_checkpoint.v1:other'))
    add('rd', 'durable_token', HI, at('checkpoint.stored_token.redb_snapshot_id', 'snap-tx-1'))
    add('rd', 'token_snapshot', HI, at('checkpoint.live_token.redb_snapshot_id', 'snap-tx-0'))
    add('rd', 'token_join', HI, at('checkpoint.live_token.generation_anchor_sha256', H('anchor-2')))
    add('rd', 'coverage', HI, at('checkpoint.coverage', [[0, 20], [22, 41]]))
    add('rd', 'coverage_current', HI, chain(at('checkpoint.live_token.source_selection.current_bytes_sha256', H('stale-current')),
                                            at('checkpoint.stored_token.source_selection.current_bytes_sha256', H('stale-current'))))
    for k in ('domain', 'external', 'notification', 'charge'):
        add('rd', f'passive_{k}', HI, at(f'reader.effects.{k}', 1))
    # rs
    add('rs', 'restore_native', RS, at('restore.native_sha256', H('other-source')))
    add('rs', 'restore_result', RS, at('restore.result_ref', 'result:other'))
    add('rs', 'restore_group', RS, at('restore.group', ['grp-1']))
    add('rs', 'restore_payload', RS, at('restore.payload_digests', []), form='ref')
    add('rs', 'restore_identity', RS, at('restore.identity', {}))
    add('rs', 'restore_tombstones', RS, lambda w: w['storage']['tombstones'].append(w['event']['event_id']))
    return out


_W0 = {}


def w0_payload(f, scope):
    if (f, scope) not in _W0:
        _W0[(f, scope)] = m.build_world(f, scope)['event']['payload']
    return _W0[(f, scope)]


# --- family rows ---------------------------------------------------------------------------------------------
def fx_negatives(f, scope):
    out = []
    phase = f'fx_{m.FAM[f]["slug"]}'
    rows = {r[1]: r for r in m.fx_rows(f)}
    payload = w0_payload(f, scope)
    for k in m.join_fields(f):
        r = rows[f'join.{k}']
        alt = _alt(payload[k])
        prop = m.SCHEMAS[f]['$defs']['ProjectPayloadV1']['properties'][k]
        if '$ref' in prop and 'typed_error' in prop['$ref']:
            alt = 'notebook_limit_exceeded'
        if type(payload[k]) is str and k in m.SCHEMAS[f]['$defs']['ProjectPayloadV1']['properties'] and \
                'enum' in m.SCHEMAS[f]['$defs']['ProjectPayloadV1']['properties'][k]:
            alt = next(x for x in m.SCHEMAS[f]['$defs']['ProjectPayloadV1']['properties'][k]['enum'] if x != payload[k])
        for b in (A, HI):
            out.append(case(f'neg/{f}/{scope}/{b}/join.{k}', f, scope, b, (phase, r[0], r[3]), mut=_payload_edit({k: alt})))
    for d in spec.DOMAIN[f]:
        variant, kind, changes = d['neg']
        if d.get('entailed'):
            # The entailment, shown on the row's own one-defect input: the payload keyword row refuses first.
            field = 'before_state' if 'before' in d['args'][0] else 'after_state'
            kwd = 'enum' if d['kind'] == 'inn' else 'const'
            prow = next(r for r in m.py_rows(f) if r[1] == f'{kwd}.{field}')
            out.append(case(f'entailed/{f}/{scope}/append/dom.{d["suffix"]}', f, scope, A,
                            (f'py_{m.FAM[f]["slug"]}', prow[0], prow[3]), variant=variant, neg=(kind, changes)))
            continue
        r = rows[f'dom.{d["suffix"]}']
        if (f, variant) in spec.HISTORY_ONLY_VARIANTS:
            boundaries = (HI,)
        else:
            boundaries = tuple(b for b in (A, RT, HI) if b in d['applies'])
        for b in boundaries:
            kw = dict(variant=variant)
            mut = None
            if kind in ('pre', 'post'):
                kw['neg'] = (kind, changes)
            elif kind == 'payload':
                mut = _payload_edit(changes)
            elif kind == 'payload_jcs':
                from pm_event_numbers import qualified_jcs
                mut = _payload_edit({k: hashlib.sha256(qualified_jcs(v)).hexdigest() for k, v in changes.items()})
            out.append(case(f'neg/{f}/{scope}/{b}/dom.{d["suffix"]}', f, scope, b, (phase, r[0], r[3]), mut=mut, **kw))
    return out


# --- rows a family cannot reach, by construction of its own contract (not a missing witness) -------------------
NOT_APPLICABLE = {}
for _f in m.FAMILIES:
    if not any(m._int_slots(_f, _s) for _s in m.SCOPES[_f]):
        NOT_APPLICABLE[(_f, 'NM03_payload_integers')] = 'the selected payload declares no integer slot (schema), so current_integer has no payload input'
    if m.SCOPES[_f] == ('project',):
        NOT_APPLICABLE[(_f, 'ID03_application_key')] = 'Project-only family: no application selector or CV-366 key exists (an application write is refused at AD02)'
    if _f in spec.STOP_PERMITTED:
        NOT_APPLICABLE[(_f, 'WR10_writer_stop_blocked')] = 'Pause/Cancel keep their owner-permitted control behaviour under an effective Stop (no plan row <family>:writer_stop_blocked)'


# --- extra cases (not single-row witnesses of one table; complete-checker expectations) -------------------------
def extra_cases():
    out = []
    for f in m.FAMILIES:
        if m.SCOPES[f] == ('project',):
            # Project-only family: an application current write is refused at selector admission; no Project invented
            out.append(case(f'extra/{f}/application/append/no-app-selector', f, 'application', A,
                            _row('ad', 'membership_selector')))
        for s in m.SCOPES[f]:
            # 4,400-digit integer on a current write: refused by the shared producer route, never a crash (DX/DS15/DF/DM)
            out.append(case(f'extra/{f}/{s}/append/4400-digit', f, s, A, _row('pf', 'physical_value'),
                            mut=ev(producer_sequence_id=10 ** 4399)))
            out.append(case(f'extra/{f}/{s}/append/4400-digit-request', f, s, A, _row('sc', 'exact_types'),
                            mut=at('request.checkpoint.frontier_revision', float(10 ** 300))))
            # the legacy-recipe original is refused on a current write (stricter rule applies to new writes only)
            out.append(case(f'extra/{f}/{s}/append/legacy-number-current', f, s, A, _row('nm', 'producer_route'),
                            native_patch=dict(producer_sequence_id=2 ** 53 + 1)))
            # a forged sealed receipt naming the weaker legacy recipe for a current-edition original is refused
            out.append(case(f'extra/{f}/{s}/history/forged-legacy-selection', f, s, HI, _row('rr', 'sealed_binding'),
                            mut=lambda w: w['storage']['sealed'][0]['binding'].__setitem__('source_commitment', H('forged'))))
            # item 10 number spellings at an integer slot: 1.0, -0.0, True each refused at its exact boundary
            for spelled in (1.0, -0.0, True):
                out.append(case(f'extra/{f}/{s}/append/producer_sequence={spelled!r}', f, s, A,
                                _row('en', 'envelope_schema') if spelled is True else _row('nm', 'producer_sequence'),
                                mut=ev(producer_sequence_id=spelled)))
            # item 12: trailing LF and lowercase t/z on Storage clocks; leap second accepted on occurred (broad profile)
            out.append(case(f'extra/{f}/{s}/append/observed-trailing-lf', f, s, A, _row('tm', 'observed_clock'),
                            mut=chain(ev(observed_at_utc=m.OBSERVED + '\n'),
                                      lambda w: w['storage']['issued'][w['event']['event_id']].__setitem__('observed_at_utc', m.OBSERVED + '\n'))))
            out.append(case(f'extra/{f}/{s}/append/occurred-leap-second', f, s, A, None,
                            native_patch=dict(accepted_at_utc='2016-12-31T23:59:60Z')))
            out.append(case(f'extra/{f}/{s}/append/occurred-24h', f, s, A, _row('tm', 'occurred_clock'),
                            native_patch=dict(accepted_at_utc='2026-11-05T24:00:00Z')))
    return out


def all_cases():
    out = positives()
    for f in m.FAMILIES:
        for s in m.SCOPES[f]:
            out += py_negatives(f, s) + common_negatives(f, s) + fx_negatives(f, s)
    return out + extra_cases()
