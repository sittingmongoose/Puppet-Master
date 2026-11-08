"""DF sweep part 2A/2B witness specifications (consumed by scripts/pm-filesafe-p2a-cases.py).

Each spec names its target row and changes exactly one fact of a named valid seed of its
own family; the builder's rebuild() then moves every copy that is not the defect (bodies,
member hashes, source commitment, selected-source bank copy, custody digests, issued and
retained-boundary copies). Where the defect is itself a copy the spec says so in keep.
"""
import copy
import hashlib

import blake3

FILESAFE = ('filesafe.command_denied', 'filesafe.destructive_override_denied', 'filesafe.destructive_override_granted',
            'filesafe.destructive_override_requested', 'filesafe.guard_init_failed', 'filesafe.path_denied',
            'filesafe.policy_degraded')
SAFE_POINTS = ('safe_point.created', 'safe_point.restored')
ALL = FILESAFE + SAFE_POINTS
EFFECT = ('filesafe.destructive_override_granted', 'filesafe.destructive_override_requested') + SAFE_POINTS
CASE_FAMILIES = {'payload_semantic', 'identity_vector'}


def cid(family, row, tag):
    return f"{family.replace('.', '_')}.p2a.{row}.{tag}"


def records(c):
    return c['source']['application_records']


def payload(c):
    return c['source']['original_result']


def req(c):
    return c['source']['original_request']


def set_ctx(c, key, value):
    """Change one execution-context key in the request and every copy of it."""
    req(c)['execution_context'][key] = value
    payload(c)['execution_context'][key] = value
    for record in (c['source'].get('application_records') or {}).values():
        if isinstance(record, dict) and 'execution_context' in record:
            record['execution_context'][key] = value
    if key in ('thread_id', 'run_id'):
        c['event'][key] = value
    if key == 'run_id':
        for copy_ in (payload(c), req(c)):
            if 'run_id' in copy_:
                copy_['run_id'] = value


def manifest_digest(builder, value):
    from pm_event_numbers import qualified_jcs
    return hashlib.sha256(qualified_jcs(value)).hexdigest()


def propagate_target_manifest(builder, family, c):
    """After a snapshot manifest change, move its digest into every copy that names it."""
    mh = manifest_digest(builder, records(c)['snapshot_manifest'])
    sp = records(c)['safe_point_record']
    sp['snapshot_manifest_sha256'] = sp['content_state_sha256'] = mh
    sp['entry_count'] = records(c)['snapshot_manifest']['entry_count']
    sp['total_bytes'] = records(c)['snapshot_manifest']['total_bytes']
    p = payload(c)
    if family == 'safe_point.created':
        p['snapshot_manifest_sha256'] = p['content_state_sha256'] = mh
    else:
        tx, eq = records(c)['restore_transaction'], records(c)['equality_result']
        tx['target_manifest_sha256'] = tx['target_state_sha256'] = mh
        eq['target_manifest_sha256'] = mh
        p['target_state_sha256'] = mh


def specs(builder):
    """Yield case dicts (unvalidated); the builder keeps those that hit their row first."""
    out = []

    def M(family, seed, row, change, keep=(), tag='one', kind='materialization'):
        names = builder.seeds(family)
        if seed not in names:
            return
        case = builder.materialize_case(family, names[seed], row, change, keep, kind=kind)
        case['id'] = cid(family, row, tag)
        out.append(case)

    def setter(path, value):
        def change(c, b):
            node = c
            for part in path[:-1]:
                node = node[part]
            node[path[-1]] = value
        return change

    # ------------------------------------------------ SP-337 payload resolution (reference seeds)
    for f in ALL:
        for scope in ('project', 'application'):
            seed = f'fix3.sp337_reference.{scope}'
            M(f, seed, 'EP02_parse', setter(('event', 'payload_ref'), 'not json'), keep=('payload',), tag=scope)

            def bad_hex(c, b):
                import json as _json
                b['payloads'][_json.loads(c['event']['payload_ref'])['payload_id']] = 'zz'
            M(f, seed, 'EP08_hex', bad_hex, keep=('payload',), tag=scope)

            def repack(extra=None, spaced=False, keep_source=False):
                def change(c, b):
                    import json as _json
                    from pm_event_numbers import qualified_jcs
                    descriptor = _json.loads(c['event']['payload_ref'])
                    body = _json.loads(bytes.fromhex(b['payloads'][descriptor['payload_id']]))
                    if extra:
                        body.update(extra)
                    raw = (_json.dumps(body, separators=(', ', ': '), ensure_ascii=False).encode() if spaced
                           else qualified_jcs(body))
                    pid = 'blake3:' + blake3.blake3(raw).hexdigest()
                    b['payloads'][pid] = raw.hex()
                    b['durable_payload_ids'] = list(b['durable_payload_ids']) + [pid]
                    c['event']['payload_ref'] = qualified_jcs({'payload_id': pid, 'byte_size': len(raw),
                                                               'media_type': descriptor['media_type']}).decode()
                    if extra and not keep_source:
                        c['source']['original_result'] = body
                return change
            M(f, seed, 'EP12_decode', repack(spaced=True), keep=('payload',), tag=scope)
            M(f, seed, 'MP01_payload_schema', repack(extra={'df_p2a_extra': 'x'}, keep_source=True), keep=('payload',), tag=scope)

    # ------------------------------------------------ materialization joins (plain seeds)
    for f in ALL:
        for scope, seed in (('project', 'original_project_0'), ('application', 'original_application_1')):
            M(f, seed, 'MC03_operation', lambda c, b: req(c).__setitem__('operation_id', req(c)['operation_id'] + '-other'), tag=scope)
            M(f, seed, 'MT08_receipt_event', setter(('custody', 'first_append_receipt', 'event_id'), 'evt_df_' + 'f' * 64), tag=scope)
            M(f, seed, 'MT10_durability_class', setter(('custody', 'first_append_receipt', 'durability_class'), 'ordinary'), tag=scope)
            if f in EFFECT and f != 'filesafe.destructive_override_granted':
                for row, key in (('MX01_thread', 'thread_id'), ('MX03_root', 'root_id'),
                                 ('MX04_generation', 'root_generation'), ('MX05_directory', 'working_directory')):
                    if f == 'filesafe.destructive_override_requested' and scope == 'application' and row != 'MX05_directory':
                        continue  # the requested grant pins thread and root: OS07/OS11 refuse first
                    M(f, seed, row, lambda c, b, key=key: set_ctx(c, key, None), tag=scope)
            # Issued-layer witnesses: the candidate and the retained issued copy carry the same change.
            for row, change, keep in (
                    ('IS04a_slot_type', setter(('event', 'sequence_id'), 70.0), ('custody_digests',)),
                    ('IS05_schema', setter(('event', 'redaction_profile'), 'df-p2a-unknown'), ('custody_digests',)),
                    ('IR01_event_id', setter(('custody', 'event_id'), 'evt_df_' + 'e' * 64), ()),
                    ('IR02_event_type', setter(('custody', 'event_type'), 'filesafe.df_p2a_other'), ()),
                    ('IR03_idempotency_key', setter(('custody', 'idempotency_key'), 'filesafe@2:00'), ()),
                    ('IR04_semantic_digest', setter(('custody', 'producer_semantic_digest'), 'd' * 64), ('custody_digests',)),
                    ('IR05_full_value', setter(('custody', 'original_event_value_commitment', 'sha256'), 'c' * 64), ('custody_digests',)),
                    ('IR06_receipt_event', setter(('custody', 'first_append_receipt', 'event_id'), 'evt_df_' + 'f' * 64), ()),
                    ('IR07_receipt_sequence', lambda c, b: c['custody']['first_append_receipt'].__setitem__('sequence_id', c['event']['sequence_id'] + 1), ()),
                    ('IR09_durability_class', setter(('custody', 'first_append_receipt', 'durability_class'), 'ordinary'), ())):
                M(f, seed, row, change, keep=keep, tag=scope, kind='issued')
            M(f, seed, 'IS06_payload_schema', lambda c, b: c['event']['payload'].__setitem__('df_p2a_extra', 'x'),
              keep=('payload',), tag=scope, kind='issued')
    for f, key in (('filesafe.command_denied', 'segment_index'), ('filesafe.destructive_override_requested', 'requested_duration'),
                   ('safe_point.created', 'replan_generation')):
        for scope, seed in (('project', 'original_project_0'), ('application', 'original_application_1')):
            def floated(c, b, key=key):
                c['event']['payload'][key] = float(c['event']['payload'][key])
            M(f, seed, 'IS07a_slot_type', floated, keep=('payload', 'custody_digests'), tag=scope, kind='issued')
    # ------------------------------------------------ granted override subset (both grants pass scope semantics)
    g = 'filesafe.destructive_override_granted'
    M(g, 'original_project_0', 'SU03_run', lambda c, b: payload(c)['authorized_scope'].__setitem__('run_id', None))
    M(g, 'original_project_0', 'SU04_worktree', lambda c, b: payload(c)['authorized_scope'].__setitem__('worktree_id', None))
    M(g, 'original_project_0', 'SU05_command', lambda c, b: payload(c)['authorized_scope'].__setitem__('normalized_command_identity', None))
    M(g, 'original_application_1', 'SU12_roots', lambda c, b: payload(c)['authorized_scope']['recorded_roots'].append(
        {'root_id': 'root-p2a', 'root_generation': 'rg-p2a', 'canonical_path': '/work/p2a'}))
    M(g, 'original_application_1', 'SU13_command', lambda c, b: payload(c)['authorized_scope'].__setitem__('normalized_command_identity', None))
    # ------------------------------------------------ safe-point Project originals and capture
    for f in SAFE_POINTS:
        M(f, 'original_project_0', 'MJ01_project', lambda c, b: c['source']['native_project_record'].__setitem__('project_id', 'p-p2a'))
        for row, key in (('MA01_node', 'node_id'), ('MA02_attempt', 'attempt_id')):
            M(f, 'original_application_1', row, lambda c, b, key=key: (payload(c).__setitem__(key, key[:1] + '-p2a'),
              c['event'].__setitem__(key, key[:1] + '-p2a'), req(c).__setitem__(key, key[:1] + '-p2a') if key in req(c) else None))
    cr = 'safe_point.created'
    M(cr, 'original_project_0', 'MK01_created_at', lambda c, b: c['source']['native_project_record'].__setitem__('created_at_utc', '2026-11-04T12:00:09Z'))
    # ------------------------------------------------ application safe-point records
    for f in SAFE_POINTS:
        s = 'original_application_1'
        if f == 'safe_point.created':
            M(f, s, 'SM09_scm', lambda c, b: records(c)['safe_point_record'].__setitem__('scm', None) if records(c)['snapshot_manifest']['scm'] is not None else None, tag='scm_removed')
        M(f, s, 'AR02_context', lambda c, b: records(c)['safe_point_record']['execution_context'].__setitem__('thread_id', 'th-p2a'))
        M(f, s, 'SP02_run_id', lambda c, b: records(c)['safe_point_record'].__setitem__('run_id', 'run-p2a'))
        M(f, s, 'SP05_worktree_path', lambda c, b: records(c)['safe_point_record'].__setitem__('worktree_path', '/work/p2a'))
        M(f, s, 'SM02_manifest_ref', lambda c, b: records(c)['safe_point_record'].__setitem__('snapshot_manifest_ref', 'original:p2a:manifest'))
        M(f, s, 'SM03_manifest_sha256', lambda c, b: records(c)['safe_point_record'].__setitem__('snapshot_manifest_sha256', 'a' * 64))
        M(f, s, 'SM04_content_state', lambda c, b: records(c)['safe_point_record'].__setitem__('content_state_sha256', 'a' * 64))
        M(f, s, 'SM05_entry_count', lambda c, b: records(c)['safe_point_record'].__setitem__('entry_count', records(c)['safe_point_record']['entry_count'] + 1))
        M(f, s, 'SM06_total_bytes', lambda c, b: records(c)['safe_point_record'].__setitem__('total_bytes', records(c)['safe_point_record']['total_bytes'] + 1))
        M(f, s, 'SM07_format_version', lambda c, b: records(c)['safe_point_record'].__setitem__('snapshot_format_version', 'p2a.1'))
        M(f, s, 'SM08_scope_version', lambda c, b: records(c)['safe_point_record'].__setitem__('content_scope_version', 'p2a.1'))

        def entry_change(field, value, propagate=True):
            def change(c, b):
                entry = records(c)['snapshot_manifest']['entries'][-1]
                node = entry
                for part in field[:-1]:
                    node = node[part]
                node[field[-1]] = value(node[field[-1]]) if callable(value) else value
                if propagate:
                    propagate_target_manifest(builder, f, c)
            return change
        if f != 'safe_point.created':
            continue
        M(f, s, 'AE01_root_id', entry_change(('identity', 'root_id'), 'root-p2a'))
        M(f, s, 'AE02_generation', entry_change(('identity', 'root_generation'), 'rg-p2a'))
        M(f, s, 'AE04_environment', entry_change(('identity', 'environment_id'), 'e-p2a'))
        M(f, s, 'AE06_no_parent', entry_change(('identity', 'canonical_absolute_path'), lambda v: v + '/..'))
        M(f, s, 'AE07_no_git', entry_change(('identity', 'canonical_absolute_path'), lambda v: v + '/.git/x'))
        M(f, s, 'AE08_ignored_scope', lambda c, b: (records(c)['snapshot_manifest']['entries'][-1].update(ignored=True, authorized_write_set=False),
                                                     propagate_target_manifest(builder, f, c)))
        M(f, s, 'AF01_one_blob', entry_change(('payload_id',), 'blake3:' + '0' * 64))
        M(f, s, 'AF06_entry_sha256', entry_change(('blob_sha256',), '0' * 64))

        def blob_bytes(c, b):
            blob = records(c)['snapshot_blobs']['blobs'][0]
            b['bodies'][blob['ref']] = 'zz'
        M(f, s, 'AF02_bytes', blob_bytes)

        def lengths(blob_delta, entry_delta):
            def change(c, b):
                manifest = records(c)['snapshot_manifest']
                entry = next(e for e in manifest['entries'] if e['present'] and e['kind'] == 'file')
                blob = next(x for x in records(c)['snapshot_blobs']['blobs'] if x['payload_id'] == entry['payload_id'])
                blob['length'] += blob_delta
                entry['length'] += entry_delta
                manifest['total_bytes'] += entry_delta
                propagate_target_manifest(builder, f, c)
            return change
        M(f, s, 'AF03_body_length', lengths(1, 1))
        M(f, s, 'AF04_entry_length', lengths(0, 1))
    cr = 'safe_point.created'
    s = 'original_application_1'
    for row, key in (('CR02_replan_generation', 'replan_generation'), ('CR03_format_version', 'snapshot_format_version'),
                     ('CR04_scope_version', 'content_scope_version')):
        def change(c, b, key=key):
            value = payload(c)[key]
            new = value + 1 if isinstance(value, int) else value + '-p2a'
            payload(c)[key] = new
            if key in req(c):
                req(c)[key] = new
        M(cr, s, row, change, tag='with_request')
    for row, key in (('CR05_manifest_ref', 'snapshot_manifest_ref'),
                     ('CR06_manifest_sha256', 'snapshot_manifest_sha256'), ('CR07_content_state', 'content_state_sha256'),
                     ('CR08_capture_status', 'capture_status')):
        def change(c, b, key=key):
            value = payload(c)[key]
            payload(c)[key] = value + 1 if isinstance(value, int) else ('a' * 64 if key.endswith('sha256') else value + '-p2a')
        M(cr, s, row, change)
    M(cr, s, 'CO02_created_at', lambda c, b: records(c)['safe_point_record'].__setitem__('created_at_utc', '2026-11-04T12:00:09Z'))
    M(cr, s, 'CO03_actor', lambda c, b: records(c)['safe_point_record'].__setitem__('created_by_actor_ref', 'actor:p2a'))
    for row, key in (('CS06_worktree_id', 'worktree_id'), ('CS07_worktree_path', 'worktree_path'), ('CS08_branch', 'branch_name')):
        M(cr, s, row, lambda c, b, key=key: payload(c).__setitem__(key, payload(c)[key] + '-p2a') if payload(c).get(key) else None)
    rs = 'safe_point.restored'
    for row, key in (('TR01_safe_point_id', 'safe_point_id'), ('TR03_run_id', 'run_id'),
                     ('TR06_outcome', 'restore_outcome'),
                     ('TR07_target_state', 'target_state_sha256'), ('TR08_pre_state', 'pre_restore_state_sha256'),
                     ('TR09_post_state', 'post_restore_state_sha256'), ('TR10_conflict', 'conflict_reason_code'),
                     ('TR11_recovered', 'recovered_after_restart')):
        def change(c, b, key=key):
            tx = records(c)['restore_transaction']
            value = tx[key]
            tx[key] = (not value if isinstance(value, bool) else 'a' * 64 if key.endswith('sha256')
                       else ('branch_mismatch' if value != 'branch_mismatch' else 'head_mismatch') if key == 'conflict_reason_code'
                       else 'restore_failed' if key == 'restore_outcome' and value != 'restore_failed'
                       else 'restore_refused' if key == 'restore_outcome' else 'p2a' if value is None else value + '-p2a')
        M(rs, s, row, change)
    for row, key in (('TM02_pre_ref', 'pre_restore_manifest_ref'), ('TM03_target_sha256', 'target_manifest_sha256'),
                     ('TM05_pre_sha256', 'pre_restore_manifest_sha256')):
        M(rs, s, row, lambda c, b, key=key: records(c)['restore_transaction'].__setitem__(key, 'a' * 64 if key.endswith('sha256') else 'original:p2a'))
    for row, key in (('EQ01_transaction', 'restore_transaction_id'), ('EQ02_safe_point', 'safe_point_id'),
                     ('EQ03_target', 'target_manifest_sha256'), ('EQ04_pre', 'pre_restore_manifest_sha256')):
        M(rs, s, row, lambda c, b, key=key: records(c)['equality_result'].__setitem__(key, 'a' * 64 if key.endswith('sha256') else records(c)['equality_result'][key] + '-p2a'))
    M(rs, s, 'HJ01_safe_point_holds', lambda c, b: records(c)['safe_point_record']['hold_refs'].append('hold:p2a'))
    M(rs, s, 'HJ02_equality_holds', lambda c, b: records(c)['equality_result']['hold_refs'].append('hold:p2a'))
    M(rs, s, 'HJ04_mutation_count', lambda c, b: records(c)['equality_result'].__setitem__('path_mutation_count', records(c)['equality_result']['path_mutation_count'] + 1))
    M(rs, s, 'JC04_updated_at', lambda c, b: records(c)['restore_transaction'].__setitem__('updated_at_utc', '2026-11-04T12:00:09Z'))
    M(rs, s, 'JC05_restart', lambda c, b: records(c)['restore_transaction'].__setitem__('restart_count', records(c)['restore_transaction']['restart_count'] + 1))
    restored_specs(builder, M)
    number_specs(builder, M)
    return out


def protocol_specs():
    """(family, seed name, row, pre-construction edits, steps, expected results, target step)."""
    out = []
    for f in ALL:
        out += [
            (f, 'original_project_0', 'PX02_not_crashed', [], [{'action': 'crash'}, {'action': 'owner_commit'}],
             ['crashed_no_new_effect', 'recovery_required'], 1),
            (f, 'original_project_0', 'PC03_phase', [], [{'action': 'owner_commit'}, {'action': 'owner_commit'}],
             ['owner_committed', 'already_committed'], 1),
            (f, 'original_project_0', 'PP02_recovery', [],
             [{'action': 'owner_commit'}, {'edit': {'target': 'bank', 'path': '/writer_epoch', 'value': 'p2a'}},
              {'action': 'recover'}, {'action': 'prepare'}], ['owner_committed', 'recovery_fenced', 'recovery_fenced'], 2),
            (f, 'original_project_0', 'PA02_recovery', [],
             [{'action': 'owner_commit'}, {'action': 'prepare'}, {'edit': {'target': 'bank', 'path': '/writer_epoch', 'value': 'p2a'}},
              {'action': 'recover'}, {'action': 'append'}], ['owner_committed', 'prepared', 'recovery_fenced', 'recovery_fenced'], 3),
            (f, 'original_project_0', 'RT02_appended', [], [{'action': 'owner_commit'}, {'action': 'retry'}],
             ['owner_committed', 'original_pending'], 1),
            (f, 'original_project_0', 'RB01_reader_fence', [], [{'action': 'rebuild'}], ['reader_fence_required'], 0),
            (f, 'original_project_0', 'PB01_reader_fence', [], [{'action': 'publish_reader'}], ['verified_rebuild_required'], 0),
            (f, 'original_project_0', 'PR04_issued', [],
             [{'action': 'owner_commit'}, {'action': 'prepare'}, {'action': 'append'}, {'edit': {'target': 'bank', 'path': '/original_custody/EID', 'remove': True}},
              {'action': 'receipt'}], ['owner_committed', 'prepared', 'appended', 'receipt_unavailable'], 3),
            (f, 'original_project_0', 'RS01_storage', [],
             [{'action': 'owner_commit'}, {'action': 'prepare'}, {'action': 'append'}, {'action': 'receipt'},
              {'edit': {'target': 'bank', 'path': '/storage_instance_id', 'value': '22222222-2222-4222-8222-222222222222'}},
              {'action': 'terminal'}], ['owner_committed', 'prepared', 'appended', 'receipted', 'recovery_fenced'], 4),
            (f, 'original_project_0', 'CG01_bank_type', [],
             [{'action': 'withdraw_writer'}, {'action': 'withdraw_reader'}, {'edit': {'target': 'bank', 'path': '/source_generation', 'value': 'p2a'}},
              {'action': 'rebuild'}], ['writer_fenced', 'reader_fenced', 'survivor_verification_failed'], 2),
            (f, 'original_project_0', 'CG02_oracle_type', [{'target': 'bank', 'path': '/source_generation', 'value': 'p2a'}],
             [{'edit': {'target': 'bank', 'path': '/source_generation', 'value': 1}}, {'action': 'withdraw_writer'}, {'action': 'withdraw_reader'},
              {'action': 'rebuild'}], ['writer_fenced', 'reader_fenced', 'survivor_verification_failed'], 2),
            (f, 'original_project_0', 'RG01_bank_type', [], [{'edit': {'target': 'bank', 'path': '/reader_generation', 'value': 'p2a'}},
                                                            {'action': 'read'}], ['read_unavailable'], 0),
            (f, 'original_project_0', 'RG02_oracle_type', [{'target': 'bank', 'path': '/reader_generation', 'value': 'p2a'}],
             [{'edit': {'target': 'bank', 'path': '/reader_generation', 'value': 1}}, {'action': 'read'}], ['read_unavailable'], 0),
            (f, 'original_project_0', 'RD02_boundary', [{'target': 'bank', 'path': '/retained_boundary/EID', 'remove': True}],
             [{'action': 'read'}], ['read_unavailable'], 0),
            (f, 'original_project_0', 'BD01_schema', [], [{'edit': {'target': 'candidate', 'path': '/source/writer_epoch', 'value': 'p2a'}},
                                                         {'action': 'read_body'}], ['read_unavailable'], 0),
            (f, 'original_project_0', 'BD05_hash', [], [{'edit': {'target': 'bank', 'path': '/bodies/INPUT', 'value': '00'}},
                                                       {'action': 'read_body'}], ['read_unavailable'], 0),
            (f, 'original_project_0', 'DD01_binding', [], [{'edit': {'target': 'bank', 'path': '/issued/EID/custody/storage_instance_id',
                                                                     'value': '22222222-2222-4222-8222-222222222222'}},
                                                          {'action': 'read'}], ['read_unavailable'], 0),
            (f, 'original_project_0', 'DD02_recipe', [], [{'edit': {'target': 'bank', 'path': '/original_custody/EID/resource_manifest_sha256', 'value': 'f' * 64}},
                                                         {'action': 'read'}], ['read_unavailable'], 0),
            (f, 'original_application_1', 'DD02_recipe', [], [{'edit': {'target': 'bank', 'path': '/original_custody/EID/write_time_edition', 'value': 'DF-p2a-unknown'}},
                                                             {'action': 'read'}], ['read_unavailable'], 0),
            (f, 'original_project_0', 'DD03_authority', [], [{'edit': {'target': 'bank', 'path': '/original_custody/EID', 'remove': True}},
                                                            {'action': 'read'}], ['read_unavailable'], 0),
        ]
    return out


def cases(builder):
    import pm_filesafe_event_authority as A
    import pm_filesafe_event_contracts as C
    out = specs(builder)
    import json as _json
    for family, seed, row, pre, steps, expected, target in protocol_specs():
        index = builder.seeds(family)[seed]
        base = builder.P.seed(family, index)['candidate']
        text = _json.dumps([pre, steps]).replace('/EID', '/' + base['event']['event_id']).replace(
            '/INPUT', '/' + base['source']['original_request']['original_input_ref'])
        pre, steps = _json.loads(text)
        out.append(dict(kind='protocol', family=family, positive_index=index, target_row=row, edits=pre,
                        steps=steps, expected_results=expected, target_step=target,
                        id=cid(family, row, 'trace.' + seed.split('_')[1]), defect='decision-model trace'))
    out.extend(raw_specs(builder) + fixture_specs(builder) + payload_specs(builder))
    return out


def restored_specs(builder, M):
    rs = 'safe_point.restored'
    clean, failed, skipped, refused, recovery = ('original_application_1', 'original_application_6', 'original_application_7',
                                                 'original_application_8', 'original_application_9')
    tx = lambda c: records(c)['restore_transaction']
    eq = lambda c: records(c)['equality_result']

    def sync_post(c):
        from pm_event_numbers import qualified_jcs
        post = records(c)['post_restore_manifest']
        posth = hashlib.sha256(qualified_jcs(post)).hexdigest()
        tx(c)['post_restore_state_sha256'] = eq(c)['post_restore_manifest_sha256'] = payload(c)['post_restore_state_sha256'] = posth
        eq(c)['scm_equal_target'] = post['scm'] == records(c)['snapshot_manifest']['scm']
        eq(c)['scm_equal_pre_restore'] = post['scm'] == records(c)['pre_restore_manifest']['scm']

    def target_state(c, b):
        tx(c)['target_state_sha256'] = tx(c)['target_manifest_sha256'] = payload(c)['target_state_sha256'] = 'a' * 64
        if 'target_state_sha256' in req(c):
            req(c)['target_state_sha256'] = 'a' * 64
    M(rs, failed, 'TM04_target_state', target_state)

    def pre_state(c, b):
        tx(c)['pre_restore_state_sha256'] = tx(c)['pre_restore_manifest_sha256'] = payload(c)['pre_restore_state_sha256'] = 'b' * 64
        if 'pre_restore_state_sha256' in req(c):
            req(c)['pre_restore_state_sha256'] = 'b' * 64
    M(rs, clean, 'TM06_pre_state', pre_state)
    M(rs, recovery, 'TM07_post_state', lambda c, b: (tx(c).__setitem__('post_restore_state_sha256', 'c' * 64),
                                                      payload(c).__setitem__('post_restore_state_sha256', 'c' * 64)))
    M(rs, clean, 'EQ07_scm_pre', lambda c, b: eq(c).__setitem__('scm_equal_pre_restore', not eq(c)['scm_equal_pre_restore']))

    def extra_op(mode):
        def change(c, b):
            ops = tx(c)['operations']
            op = copy.deepcopy(ops[0])
            path = op['identity']['canonical_absolute_path']
            if mode == 'dup_id':
                op['identity']['canonical_absolute_path'] = path + '-p2a'
            elif mode == 'dup_path':
                op['operation_id'] = op['operation_id'] + '-p2a'
            elif mode == 'unsorted':
                op['operation_id'] = op['operation_id'] + '-p2a'
                op['identity']['canonical_absolute_path'] = path[:path.rindex('/') + 1] + '!p2a'
            elif mode == 'absent':
                op['operation_id'] = op['operation_id'] + '-p2a'
                op['identity']['canonical_absolute_path'] = path + '-p2a'
            ops.append(op)
        return change
    M(rs, clean, 'OO01_unique_ids', extra_op('dup_id'))
    M(rs, clean, 'OO02_unique_paths', extra_op('dup_path'))
    M(rs, clean, 'OO03_sorted_paths', extra_op('unsorted'))
    M(rs, clean, 'OP01_subject_present', extra_op('absent'))
    M(rs, clean, 'OP02_identity', lambda c, b: tx(c)['operations'][0]['identity'].__setitem__('host_id', 'h-p2a'))
    M(rs, clean, 'OP04_target_sha256', lambda c, b: tx(c)['operations'][0].__setitem__('target_sha256', 'd' * 64))
    M(rs, clean, 'OP06_target_type', lambda c, b: tx(c)['operations'][0].__setitem__('target_type', 'symlink'))
    for seed in ('fix2.valid_create_missing', 'fix2.valid_create_absent'):
        M(rs, seed, 'ST02_create_tombstone', lambda c, b: tx(c)['operations'][0].__setitem__('tombstone_ref', 'tombstone:p2a'), tag=seed.rsplit('.', 1)[1])
    for seed in ('fix2.valid_delete_missing', 'fix2.valid_delete_absent'):
        M(rs, seed, 'ST03_delete_stage', lambda c, b: tx(c)['operations'][0].__setitem__('stage_ref', 'stage:p2a'), tag=seed.rsplit('.', 1)[1])

    def count(value):
        def change(c, b):
            tx(c)['path_mutation_count'] = eq(c)['path_mutation_count'] = value
        return change
    M(rs, clean, 'JC02_mutations', count(2))
    M(rs, clean, 'OQ04_cursor_complete', lambda c, b: tx(c).__setitem__('operation_cursor', 0))
    M(rs, skipped, 'OQ11_no_mutation', count(1))
    M(rs, refused, 'OQ14_no_mutation', count(1))
    M(rs, skipped, 'NM01_cursor', lambda c, b: tx(c).__setitem__('operation_cursor', 1))
    M(rs, failed, 'OU02_cursor', lambda c, b: tx(c).__setitem__('operation_cursor', 0))
    M(rs, recovery, 'OQ16_fence', lambda c, b: (tx(c).__setitem__('fence_active', False), eq(c).__setitem__('fence_active', False)))
    M(rs, recovery, 'OQ18_post_not_target', lambda c, b: (records(c).__setitem__('post_restore_manifest', copy.deepcopy(records(c)['snapshot_manifest'])), sync_post(c)))
    M(rs, recovery, 'OQ19_post_not_pre', lambda c, b: (records(c).__setitem__('post_restore_manifest', copy.deepcopy(records(c)['pre_restore_manifest'])), sync_post(c)))


def setter_(path, value):
    def change(c, b):
        node = c
        for part in path[:-1]:
            node = node[part]
        node[path[-1]] = value
    return change


def number_specs(builder, M):
    big, sixty = 2 ** 53 + 1, 2 ** 60
    for f, key in (('filesafe.command_denied', 'segment_index'), ('filesafe.destructive_override_requested', 'requested_duration'),
                   ('safe_point.created', 'replan_generation')):
        for scope, seed in (('project', 'original_project_0'), ('application', 'original_application_1')):
            for row, value in (('PJ01_binary64', big), ('PJ02_decimal', sixty)):
                def change(c, b, key=key, value=value):
                    payload(c)[key] = value
                    if key in req(c):
                        req(c)[key] = value
                M(f, seed, row, change, keep=('custody_digests',), tag=scope)

            def inline_float(c, b, key=key):
                c['event']['payload'][key] = float(c['event']['payload'][key])
            M(f, seed, 'MP02a_slot_type', inline_float, keep=('payload', 'custody_digests'), tag=scope)
    for f in ALL:
        for scope, seed in (('project', 'original_project_0'), ('application', 'original_application_1')):
            for row, value in (('QJ01_binary64', 2 ** 53 + 1), ('QJ02_decimal', 2 ** 60)):
                M(f, seed, row, setter_(('event', 'producer_sequence_id'), value), keep=('custody_digests',), tag=scope)
            M(f, seed, 'QJ03_other', setter_(('event', 'migration', 'migration_id'), 'm\ud800'), keep=('custody_digests',), tag=scope)

            def wide_sequence(c, b):
                c['event']['sequence_id'] = c['custody']['first_append_receipt']['sequence_id'] = 2 ** 64
            M(f, seed, 'FV01_integer_range', wide_sequence, keep=('custody_digests',), tag=scope)
            if f.startswith('safe_point.') and scope == 'application':
                M(f, seed, 'CP01_custody', lambda c, b: b['original_custody'].pop(c['source']['source_ref']))
                M(f, seed, 'CP02_manifest', lambda c, b: b['original_custody'][c['source']['source_ref']].__setitem__('resource_manifest_sha256', 'f' * 64))
        for scope, seed in (('project', 'fix3.sp337_reference.project'), ('application', 'fix3.sp337_reference.application')):
            for row, value in (('DJ01_binary64', 2 ** 53 + 1), ('DJ02_decimal', 2 ** 60)):
                def change(c, b, value=value):
                    import json as _json
                    d = _json.loads(c['event']['payload_ref'])
                    d['byte_size'] = value
                    c['event']['payload_ref'] = _json.dumps(d, separators=(',', ':'), sort_keys=True)
                M(f, seed, row, change, keep=('payload', 'custody_digests'), tag=scope)


def raw_specs(builder):
    out = []
    for f in ALL:
        for scope, seed in (('project', 'original_project_0'), ('application', 'original_application_1')):
            index = builder.seeds(f)[seed]
            base = builder.P.seed(f, index)
            epoch = base['candidate']['source']['writer_epoch']
            token = f'"writer_epoch": {epoch},'
            for row, spelled in (('CR01_integer_token', '-0'), ('CR02_json_syntax', '0' + str(epoch)), ('CR03_other', 'NaN')):
                out.append(dict(kind='materialization_raw', family=f, positive_index=index, target_row=row,
                                expected_error='current_raw_number', edits=[], spellings=[[token, f'"writer_epoch": {spelled},']],
                                id=cid(f, row, scope), defect=f'writer_epoch spelled {spelled} in the current raw JSON candidate'))
    return out


def fixture_specs(builder):
    import json as _json
    import pm_filesafe_event_authority as A
    import pm_filesafe_event_contracts as C
    import pm_filesafe_retention as RT
    out = []
    registry = _json.loads((A.ROOT / 'Plans/storage_value_registry.json').read_text())
    frows = _json.loads((A.ROOT / 'Plans/filesafe_event_retention_fixtures.json').read_text())['families']
    for f in ALL:
        graph = A.context(f)[0]
        res = graph['resources']
        for row, edits, keep in (
                ('GR01_family', [('/event_type', 'filesafe.df_p2a_other')], False),
                ('GR02_hash', [('/graph_sha256', '0' * 64)], True),
                ('GR03_stage_order', [('/ordered_stages/0/role', graph['ordered_stages'][1]['role']),
                                      ('/ordered_stages/1/role', graph['ordered_stages'][0]['role'])], False),
                ('GR04_ordinal_type', [('/ordered_stages/1/ordinal', True)], False),
                ('GR05_ordinal_value', [('/ordered_stages/1/ordinal', 5)], False),
                ('GR06_method_count', [('/methods', graph['methods'][:1])], False),
                ('GR07_interface', [('/methods/0/interface_id', graph['methods'][0]['interface_id'] + '-p2a')], False),
                ('GR08_component', [('/methods/0/component', 'component.p2a')], False),
                ('GR09_adoption', [('/methods/0/adoption_disposition', 'implemented')], False),
                ('GH01_resource_hash', [('/resources/0/sha256', '0' * 64)], False),
                ('GD01_resource_uri', [('/resources/1/uri', res[1]['uri'] + '/p2a')], False),
                ('GA01_admission', [('/native_admission', 'admitted')], False)):
            out.append(dict(kind='graph', family=f, target_row=row, keep_graph_hash=keep, expected_error=None,
                            graph_edits=[dict(path=p, value=v) for p, v in edits], id=cid(f, row, 'graph'), defect='one source-graph change'))
        if f in SAFE_POINTS:
            for row, path, value in (('RB01_runyear_policy', '/retention_policy_ref', 'RP-OPERATIONAL-2555D'),
                                     ('RB02_runyear_decision', '/retention_decision_ref', 'DL-999')):
                out.append(dict(kind='retention_binding', family=f, target_row=row, expected_error='g28_scope_binding',
                                graph_edits=[dict(path=path, value=value)], id=cid(f, row, 'graph'), defect='one retention binding change'))
        if f in RT.BINDINGS:
            for row, path, value in (('RB03_card2_by_scope', '/retention_policy_by_scope/project', 'RP-DF-P2A'),
                                     ('RB04_card2_decision', '/retention_decision_ref', 'DL-999'),
                                     ('RB05_card2_pending_root', '/retention_policy_ref', 'RP-OPERATIONAL-2555D')):
                out.append(dict(kind='retention_binding', family=f, target_row=row, expected_error='card2_scope_binding',
                                graph_edits=[dict(path=path, value=value)], id=cid(f, row, 'graph'), defect='one retention binding change'))
        if f in RT.BINDINGS or f in SAFE_POINTS:
            pid = 'RP-RUNTIME-365D' if f in SAFE_POINTS else RT.BINDINGS[f][0]
            index = next(i for i, r in enumerate(registry['retention_policies']) if r['policy_id'] == pid)
            out.append(dict(kind='retention_check', family=f, target_row='RP01_single_policy', expected_error='card2_policy_missing_or_ambiguous',
                            registry_edits=[dict(path=f'/retention_policies/{index}/policy_id', value=pid + '-P2A')],
                            id=cid(f, 'RP01_single_policy', 'registry'), defect='the bound policy id is absent from the registry'))
            out.append(dict(kind='retention_check', family=f, target_row='RP02_policy_unchanged', expected_error='card2_existing_policy_changed',
                            registry_edits=[dict(path=f'/retention_policies/{index}/hold_eligible', value=False)],
                            id=cid(f, 'RP02_policy_unchanged', 'registry'), defect='one field of the bound policy changes'))
            findex = next(i for i, r in enumerate(frows) if r['event_type'] == f)
            for row, key in (('RF01_fixture_policy', 'project_policy_ref'), ('RF02_fixture_decision', 'decision_ref')):
                out.append(dict(kind='retention_check', family=f, target_row=row, expected_error='card2_fixture_binding',
                                fixture_edits=[dict(path=f'/families/{findex}/{key}', value='DF-P2A-OTHER')],
                                id=cid(f, row, 'fixture'), defect='one retention fixture binding change'))
        out.append(dict(kind='membership', family=f, target_row='MM01_unregistered', expected_error='membership_changed',
                        registry={'families': [{'event_type': f}]}, id=cid(f, 'MM01_unregistered', 'registry'),
                        defect='a registry that names the family'))
        row = C.contract_row(f)
        expected = list(row['identity_vectors'][0]['expected'])
        expected[1] = 'evt_df_' + '0' * 64
        out.append(dict(kind='identity_vector', family=f, target_row='CI01_vector', expected_error='identity_vector',
                        payload_index=row['identity_vectors'][0]['payload_index'], expected=expected,
                        id=cid(f, 'CI01_vector', 'vector'), defect='a recorded event_id that the recipe does not produce'))
    out.append(dict(kind='census', family=None, target_row='FC01_census', expected_error='fixture_family_census',
                    families=list(reversed(ALL)), id='shared.p2a.FC01_census.reversed', defect='the family census out of order'))
    out.append(dict(kind='schema_meta', family=None, target_row='SM01_meta_schema', expected_error='schema_document_invalid',
                    document={'type': 5}, id='shared.p2a.SM01_meta_schema.type', defect='a type keyword that is not a type name'))
    return out


def payload_specs(builder):
    import pm_filesafe_event_contracts as C
    out = []

    def P_(family, index, row, change, tag='one'):
        value = copy.deepcopy(C.contract_positive(family, index))
        change(value)
        out.append(dict(kind='payload_semantic', family=family, target_row=row, expected_error='payload_semantics',
                        payload=value, id=cid(family, row, tag), defect='one payload change'))
    rq = 'filesafe.destructive_override_requested'
    P_(rq, 0, 'OS02_project', lambda p: p['requested_scope'].__setitem__('project_id', 'p-p2a'), 'project')
    P_(rq, 0, 'OS03_run', lambda p: p['requested_scope'].__setitem__('run_id', 'run-p2a'), 'project')
    P_(rq, 0, 'OS04_worktree', lambda p: p['requested_scope'].__setitem__('worktree_id', 'worktree-p2a'), 'project')
    for row, key in (('OS05_server', 'server_id'), ('OS06_computer', 'computer_id'), ('OS07_thread', 'thread_id'),
                     ('OS08_run', 'run_id'), ('OS09_host', 'host_id'), ('OS10_environment', 'environment_id')):
        P_(rq, 1, row, lambda p, key=key: p['requested_scope'].__setitem__(key, key[:-3] + '-p2a'), 'application')
    P_(rq, 1, 'OS11_root', lambda p: p['requested_scope'].__setitem__('recorded_roots', [
        {'root_id': 'root-p2a', 'root_generation': 'rg-p2a', 'canonical_path': '/work/p2a'}]), 'application')
    for i, tag in ((0, 'project'), (1, 'application')):
        P_(rq, i, 'OS12_command', lambda p: p['requested_scope'].__setitem__('normalized_command_identity', 'normalized-p2a'), tag)
    cr = 'safe_point.created'
    P_(cr, 0, 'PS05_attempt_id', lambda p: p.__setitem__('attempt_id', None), 'none')
    P_(cr, 0, 'PW01_path', lambda p: p.pop('worktree_path'), 'absent')
    P_(cr, 0, 'PW02_branch', lambda p: p.pop('branch_name'), 'absent')
    P_('safe_point.restored', 0, 'PR03_skipped_target', lambda p: p.update(
        restore_outcome='restore_skipped', target_state_sha256='e' * 64,
        post_restore_state_sha256=p['pre_restore_state_sha256']), 'skipped')
    for f, key in (('filesafe.command_denied', 'segment_index'), ('filesafe.destructive_override_requested', 'requested_duration'),
                   ('safe_point.created', 'replan_generation')):
        value = copy.deepcopy(C.contract_positive(f, 0))
        value[key] = float(value[key])
        out.append(dict(kind='payload_semantic', family=f, target_row='CS02a_slot_type', expected_error='payload_schema',
                        payload=value, id=cid(f, 'CS02a_slot_type', 'float'), defect=f'{key} given as a float'))
    return out
