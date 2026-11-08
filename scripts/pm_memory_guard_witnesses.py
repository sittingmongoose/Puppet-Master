#!/usr/bin/env python3
"""One-defect witnesses for DMEM guard-table rows the fixture corpora did not reach (sweep part 2A).

Each witness is an intact control that the complete model entry point accepts, and one change
to it that must be refused by exactly its named table row (TableRefusal phase and row). Every
copy that observes the changed fact is refreshed with it (a rehashed retained digest, a coherent
manifest and target id), so no stale copy carries a second defect. The calls go through the
checker's own module attributes, so the guard-suite recorder sees them like any fixture call.
Rows whose own boundary is the shared start custody gate are also witnessed at that gate.
"""
from copy import deepcopy
from decimal import Decimal

OTHER_EVENT_ID = 'evt_mem_' + 'f' * 64
OTHER_SHA = 'f' * 64


def expect(m, name, phase, row, control, negative, counts):
    control()
    try:
        negative()
    except m.TableRefusal as error:
        assert (error.phase, error.row) == (phase, row), (name, 'refused by', error.phase, error.row)
    else:
        raise AssertionError((name, 'witness accepted'))
    counts[phase + '/' + row] = counts.get(phase + '/' + row, 0) + 1


def edited(value, *edits):
    """A deep copy with each (path, new) applied; new DELETE removes the key."""
    result = deepcopy(value)
    for path, new in edits:
        parent = result
        for key in path[:-1]:
            parent = parent[key]
        parent[path[-1]] = deepcopy(new)
    return result


def rehash(m, state, path):
    """Refresh the frozen digest of the retained record at path (its value was changed coherently)."""
    record = state
    for key in path:
        record = record[key]
    record['full_value_sha256'] = m.historical_digest(record['full_value'])
    return state


def with_expected(state, action):
    return {**action, 'expected_operation': deepcopy(state['operation'])}


def disorder(artifacts):
    """Unsorted names: reverse a sorted multi-artifact list, else add a same-name copy with other bytes."""
    if len(artifacts) >= 2:
        artifacts.reverse()
    else:
        artifacts.append({**artifacts[0], 'sha256': 'e' * 64})


def coherent_target(m, target, row, historical=False):
    """A target whose manifest and identity are recomputed from its (changed) artifacts."""
    kind = target['index_kind']
    target['manifest_sha256'] = (m.historical_digest if historical else m.digest)(target['artifacts'])
    target['target_id'] = m.target_identity(row, kind, target['manifest_sha256'])
    return target


def maintenance(m, fixtures, families):
    counts = {}
    stateful = {f['event_type']: f['states'] for f in fixtures['stateful_families']}
    writers = {f['event_type']: f['states'] for f in fixtures['writer_families']}
    checkpoints = {f['event_type']: f for f in fixtures['checkpoint_families']}
    generic = m.load('Plans/event_record_index_checkpoint_contract_fixtures.json')['positive']['current_read_without_old_controls']
    for event in families:
        S = stateful[event]; W = writers[event]
        base, suffix = event.rsplit('.', 1)
        started, completed = base + '.started', base + '.completed'
        index = '.index.' in event
        T = lambda state, action: m.transition(deepcopy(state), deepcopy(action))
        gate = lambda state: m.start_custody_gate(deepcopy(state))
        add = lambda name, phase, row, control, negative: expect(m, event + ':' + name, phase, row, control, negative, counts)

        # The shared start custody gate, at its own boundary (every caller fences these first).
        good = S['started']
        add('gate-withdrawn', 'sg_withdrawn', 'SG01_withdrawn', lambda: gate(good), lambda: gate({**good, 'withdrawn': True}))
        add('gate-unlawful-phase', 'sg_phase', 'SG02_phase', lambda: gate(good),
            lambda: gate(edited(good, (['operation', 'phase'], 'unlawful'))))
        add('gate-missing-start-receipt', 'sg_receipt', 'SG03_start_receipt', lambda: gate(good),
            lambda: gate(edited(good, (['operation', 'started_event_id'], None))))
        # A later retained original that does not cite this start, read through the history boundary.
        done = S['completed']
        read = lambda state: m.read_history(deepcopy(state), started)
        later = ['originals', completed, 'full_value']
        add('later-not-object', 'sgl_later', 'SGL01_object', lambda: read(done), lambda: read(edited(done, (later, 'not-an-object'))))
        add('later-causation', 'sgl_later', 'SGL02_causation', lambda: read(done),
            lambda: read(edited(done, (later + ['causation_event_id'], OTHER_EVENT_ID))))
        add('later-payload-not-object', 'sgl_later', 'SGL03_payload_object', lambda: read(done),
            lambda: read(edited(done, (later + ['payload'], 'not-an-object'))))
        add('later-payload-start', 'sgl_later', 'SGL04_payload_start', lambda: read(done),
            lambda: read(edited(done, (later + ['payload', 'started_event_id'], OTHER_EVENT_ID))))

        # Current writer.
        before = W['before']; value = m.canonical_value(before['operation'], suffix)
        append = lambda state, v=value: m.append_current(deepcopy(state), deepcopy(v), event)
        add('writer-producer-fraction', 'ap_numbers', 'AP02_producer_numbers', lambda: append(before),
            lambda: append(before, {**value, 'producer_sequence_id': Decimal('1.5')}))
        add('writer-append-once-policy', 'ap_gate', 'AP05_replay_policy', lambda: append(before),
            lambda: append(before, {**value, 'replay_policy': 'append_once'}))
        retry = W['completed-retry']
        add('writer-completed-receipt', 'op_receipts', 'OP04_completed_receipt', lambda: append(retry),
            lambda: append(edited(retry, (['operation', 'completed_event_id'], OTHER_EVENT_ID))))
        add('writer-result-ref', 'op_result', 'OP06_result_ref', lambda: append(retry),
            lambda: append(edited(retry, (['operation', 'result_ref'], 'memresult_' + OTHER_SHA))))
        add('writer-result-digest', 'op_result', 'OP07_result_digest', lambda: append(retry),
            lambda: append(edited(retry, (['operation', 'result_sha256'], OTHER_SHA))))
        if suffix == 'completed':
            terminal = W['effect_committed-retry']
            add('writer-original-shape', 'apo_shape', 'APO01_shape', lambda: append(terminal),
                lambda: append(edited(terminal, (['original', 'unexpected'], True))))
            add('writer-original-envelope', 'apo_envelope', 'APO05_envelope', lambda: append(terminal),
                lambda: append(rehash(m, edited(terminal, (['original', 'full_value', 'unexpected'], True)), ['original'])))
            add('writer-new-append-completed-row', 'ap_phase', 'AP14_phase', lambda: append(terminal),
                lambda: append({**deepcopy(retry), 'original': None}))
        else:
            canonical = W['started-retry']
            add('writer-canonical-envelope', 'sgc_envelope', 'SGC05_envelope', lambda: append(canonical),
                lambda: append(rehash(m, edited(canonical, (['original', 'full_value', 'unexpected'], True)), ['original'])))
            add('writer-canonical-reference', 'sgc_reference', 'SGC06_reference', lambda: append(canonical),
                lambda: append(rehash(m, edited(canonical, (['original', 'full_value', 'actor_ref'], 'component:Other')), ['original'])))

        # Phase model.
        crash = {'op': 'crash'}
        add('unknown-action', 'tr_action', 'TR05_action', lambda: T(S['started'], crash),
            lambda: T(S['started'], {'op': 'unknown'}))
        appended = S['terminal_appended']
        reappend = {'op': 'append_completed', 'value': m.full_value(appended['operation'], 'completed')}
        term = ['originals', completed]
        add('reappend-original-shape', 'twr_shape', 'TWR01_shape', lambda: T(appended, reappend),
            lambda: T(edited(appended, (term + ['unexpected'], True)), reappend))
        add('reappend-original-flush', 'twr_body', 'TWR02_flush', lambda: T(appended, reappend),
            lambda: T(edited(appended, (term + ['durability'], 'not_flushed')), reappend))
        add('reappend-original-value', 'twr_body', 'TWR03_binding', lambda: T(appended, reappend),
            lambda: T(rehash(m, edited(appended, (term + ['full_value', 'correlation_id'], 'other-operation')), term), reappend))
        add('reappend-original-digest', 'twr_body', 'TWR04_digest', lambda: T(appended, reappend),
            lambda: T(edited(appended, (term + ['full_value_sha256'], OTHER_SHA)), reappend))
        advance = lambda state: T(state, with_expected(state, {'op': 'advance_completed'}))
        add('advance-original-flush', 'cut_body', 'CUT02_flush', lambda: advance(appended),
            lambda: advance(edited(appended, (term + ['durability'], 'not_flushed'))))
        add('advance-original-value', 'cut_body', 'CUT03_binding', lambda: advance(appended),
            lambda: advance(rehash(m, edited(appended, (term + ['full_value', 'correlation_id'], 'other-operation')), term)))
        add('advance-original-digest', 'cut_body', 'CUT04_digest', lambda: advance(appended),
            lambda: advance(edited(appended, (term + ['full_value_sha256'], OTHER_SHA))))
        add('advance-completed-before-effect', 'ac_phase', 'AC01_phase', lambda: advance(appended),
            lambda: advance(S['started']))
        add('advance-started-twice', 'as_phase', 'AS01_phase', lambda: T(S['start_saved'], with_expected(S['start_saved'], {'op': 'advance_started'})),
            lambda: T(S['started'], with_expected(S['started'], {'op': 'advance_started'})))
        settle = lambda state, status='succeeded', at='2026-11-04T17:01:00Z': T(state, with_expected(
            state, {'op': 'settle', 'status': status, 'completed_occurred_at_utc': at}))
        settled = S['swapped'] if index else S['started']
        add('settle-unknown-outcome', 'se_outcome', 'SE02_outcome', lambda: settle(settled), lambda: settle(settled, 'unknown'))
        add('settle-malformed-completion-time', 'opa_schema', 'OPA01_schema', lambda: settle(settled),
            lambda: settle(settled, at='not-a-date'))
        done_value = deepcopy(done['originals'][started]['full_value'])
        add('retry-foreign-family', 'rr_event', 'RR03_event',
            lambda: T(done, {'op': 'retry', 'event_type': started, 'value': done_value}),
            lambda: T(done, {'op': 'retry', 'event_type': 'memory.other.started', 'value': done_value}))
        if index:
            prepared = S['prepared']
            swap = lambda state: T(state, with_expected(state, {'op': 'swap'}))
            # TGO01 (target schema) is entailed: the operation schema embeds the closed target schema (OP01 first).
            dup = edited(prepared)
            disorder(dup['operation']['prepared_target']['artifacts'])
            coherent_target(m, dup['operation']['prepared_target'], dup['operation'])
            add('row-target-duplicate-name', 'tgo_body', 'TGO02_artifact_order', lambda: swap(prepared), lambda: swap(dup))
            add('swap-effect-count', 'sw_once', 'SW03_effect_count', lambda: swap(prepared),
                lambda: swap({**deepcopy(prepared), 'effect_count': 1}))
            add('swap-swap-count', 'sw_once', 'SW04_swap_count', lambda: swap(prepared),
                lambda: swap({**deepcopy(prepared), 'swap_count': 1}))
            swapped = S['swapped']
            add('settle-effect-count', 'se_effects', 'SE04_effect_count', lambda: settle(swapped),
                lambda: settle({**deepcopy(swapped), 'effect_count': 2}))
            add('settle-swap-count', 'se_effects', 'SE05_swap_count', lambda: settle(swapped),
                lambda: settle({**deepcopy(swapped), 'swap_count': 2}))
            add('settle-failed-after-effect', 'se_index_failed', 'SE06_effect_count', lambda: settle(S['started'], 'failed'),
                lambda: settle({**deepcopy(S['started']), 'effect_count': 1}, 'failed'))
            add('settle-failed-after-swap', 'se_index_failed', 'SE07_swap_count', lambda: settle(S['started'], 'failed'),
                lambda: settle({**deepcopy(S['started']), 'swap_count': 1}, 'failed'))
            add('settle-success-without-target', 'tf_present', 'TF01_present', lambda: settle(swapped),
                lambda: settle(S['started']))
            new_target = prepared['operation']['prepared_target']
            prepare = lambda state: T(state, with_expected(state, {'op': 'prepare', 'target': new_target}))
            add('prepare-before-start', 'pr_phase', 'PR01_phase', lambda: prepare(S['started']), lambda: prepare(S['accepted']))
            add('prepare-artifacts', 'pr_artifacts', 'PR03_artifacts', lambda: prepare(S['started']),
                lambda: prepare({**deepcopy(S['started']), 'durable_artifacts': []}))
            prior = S['prior_started']
            sel = ['selector']
            add('selector-schema', 'sel_schema', 'SEL01_schema', lambda: T(prior, crash),
                lambda: T(edited(prior, (sel + ['unexpected'], True)), crash))
            add('selector-store', 'sel_scope', 'SEL03_store', lambda: T(prior, crash),
                lambda: T(edited(prior, (sel + ['storage_instance_id'], 'storage-other')), crash))
            add('selector-target-manifest', 'tgs_body', 'TGS03_manifest', lambda: T(prior, crash),
                lambda: T(edited(prior, (sel + ['target', 'manifest_sha256'], OTHER_SHA)), crash))
            add('selector-target-id', 'tgs_body', 'TGS05_identity', lambda: T(prior, crash),
                lambda: T(edited(prior, (sel + ['target', 'target_id'], 'memtarget_' + OTHER_SHA)), crash))
            dsel = edited(prior)
            starget = dsel['selector']['target']
            disorder(starget['artifacts'])
            source = {**dsel['operation'], 'operation_id': dsel['selector']['operation_id'],
                      'source_revision_sha256': starget['source_revision_sha256']}
            coherent_target(m, starget, source)
            add('selector-target-duplicate-name', 'tgs_body', 'TGS02_artifact_order', lambda: T(prior, crash), lambda: T(dsel, crash))
        else:
            add('prepare-non-index', 'pr_phase', 'PR02_index', lambda: T(S['started'], crash),
                lambda: T(S['started'], with_expected(S['started'], {'op': 'prepare', 'target': None})))
            add('settle-failed-after-effect', 'se_failed', 'SE09_effect_count', lambda: settle(S['started'], 'failed'),
                lambda: settle({**deepcopy(S['started']), 'effect_count': 1}, 'failed'))

        # Reduced boundary.
        case = next(c for c in fixtures['cases'] if c['event_type'] == event and c['accepted'])
        contract = {'event_type': event}
        check = lambda payload, context: m.accept_check(deepcopy(payload), contract, deepcopy(context))
        payload, context = case['payload'], case['context']
        add('boundary-offset-zone', 'bd_zone', 'BD02_utc_zone', lambda: check(payload, context),
            lambda: check({**payload, 'occurred_at_utc': payload['occurred_at_utc'][:-1] + '+00:00'}, context))
        if suffix == 'completed':
            row = context['operation']
            held = edited(context, (['originals', completed], m.retained(m.full_value(row, 'completed'))))
            add('boundary-start-id', 'bd_terminal_start', 'BD17_started_event', lambda: check(payload, context),
                lambda: check(payload, {**deepcopy(context), 'started_event_id': OTHER_EVENT_ID}))
            orig = ['originals', completed]
            add('boundary-original-shape', 'bdo_shape', 'BDO01_shape', lambda: check(payload, held),
                lambda: check(payload, edited(held, (orig + ['unexpected'], True))))
            add('boundary-original-flush', 'bdo_body', 'BDO02_flush', lambda: check(payload, held),
                lambda: check(payload, edited(held, (orig + ['durability'], 'not_flushed'))))
            add('boundary-original-value', 'bdo_body', 'BDO03_binding', lambda: check(payload, held),
                lambda: check(payload, rehash(m, edited(held, (orig + ['full_value', 'correlation_id'], 'other-operation')), orig)))
            add('boundary-original-digest', 'bdo_body', 'BDO04_digest', lambda: check(payload, held),
                lambda: check(payload, edited(held, (orig + ['full_value_sha256'], OTHER_SHA))))
            finished = edited(row, (['phase'], 'completed'),
                              (['completed_event_id'], m.identity(completed, row['storage_instance_id'], row['project_id'],
                                                                  row['operation_id'])[0]))
            done_ctx = edited(held, (['operation'], finished))
            add('boundary-completed-without-original', 'bd_completed', 'BD19_completed_original',
                lambda: check(payload, done_ctx),
                lambda: check(payload, edited(done_ctx, (['originals'], {k: v for k, v in done_ctx['originals'].items() if k != completed}))))

        # SP-278 checkpoint join.
        ck = checkpoints[event]
        join = lambda checkpoint=generic, row=ck['operation'], value=ck['value']: m.checkpoint_check(
            deepcopy(checkpoint), deepcopy(row), deepcopy(value), event)
        cv = ck['value']
        add('checkpoint-envelope', 'ck_envelope', 'CK01_envelope', join, lambda: join(value={**cv, 'unexpected': True}))
        add('checkpoint-schema', 'ck_envelope', 'CK02_checkpoint_schema', join,
            lambda: join(checkpoint=edited(generic, (['checkpoint', 'unexpected'], True))))
        add('checkpoint-family', 'ck_event', 'CK05_event_type', join, lambda: join(value={**cv, 'event_type': base + '.other'}))
        add('checkpoint-key', 'ck_event', 'CK07_idempotency_key', join,
            lambda: join(value={**cv, 'idempotency_key': 'memory-maintenance:' + OTHER_SHA}))
        add('checkpoint-project', 'ck_project', 'CK09_project', join, lambda: join(value={**cv, 'project_id': 'other-project'}))
        add('checkpoint-payload', 'ck_project', 'CK10_payload', join,
            lambda: join(value=edited(cv, (['payload', 'source_revision_sha256'], OTHER_SHA))))

        # Card 6 dedup.
        if base == 'memory.dedup_sweep':
            policy = m.memory_policy()
            source = next(c for c in m.load('Plans/memory_card6_policy_fixtures.json')['cases']
                          if c['job'] == 'dedup_sweep' and 'refusal' not in c and not c.get('candidate_refusal'))
            snap = policy.typed_edits(deepcopy(source['before']), source.get('before_edits', []))
            nowhere = edited(snap, (['project_id'], ''))
            for k in nowhere['memories']:
                nowhere['memories'][k]['project_id'] = ''
            add('dedup-empty-project', 'dc_scope', 'DC15_project_nonempty', lambda: policy.dedup_candidate(m, deepcopy(snap)),
                lambda: policy.dedup_candidate(m, deepcopy(nowhere)))
            after = policy.dedup_candidate(m, deepcopy(snap))
            wrong = deepcopy(after)
            wrong['merge_records'][-1]['original_ids'] = list(reversed(wrong['merge_records'][-1]['original_ids']))
            add('dedup-lineage-ids', 'dv_lineage', 'DV12_original_ids', lambda: policy.dedup_validate(m, deepcopy(snap), deepcopy(after)),
                lambda: policy.dedup_validate(m, deepcopy(snap), deepcopy(wrong)))
    return counts


def archive(a, fixtures, families):
    m = a.core
    counts = {}
    for event in families:
        fam = next(f for f in fixtures['families'] if f['event_type'] == event)
        S, W = fam['states'], fam['writer_states']
        base, suffix = event.rsplit('.', 1)
        job = base.split('.')[1]
        add = lambda name, phase, row, control, negative: expect(m, event + ':' + name, phase, row, control, negative, counts)
        good = S['started']
        cutoff = lambda state: a.cutoff_gate(deepcopy(state))
        ref = good['operation']['cutoff_ref']
        add('cutoff-application-scope', 'cg_body', 'CG06_scope_kind', lambda: cutoff(good),
            lambda: cutoff(edited(good, (['cutoff_authorities', ref, 'scope_kind'], 'application'))))
        snap = good['archive']
        nowhere = edited(snap, (['project_id'], ''))
        for k in nowhere['memories']:
            nowhere['memories'][k]['project_id'] = ''
        add('selection-empty-project', 'ps_scope', 'PS02_project_nonempty', lambda: a.archive_candidate(deepcopy(snap), job),
            lambda: a.archive_candidate(deepcopy(nowhere), job))
        # Part 2B numbers: a preserved number keeps its exact representation (Decimal digits and exponent,
        # float zero sign); a respelled or sign-flipped copy of the same value is not the original.
        selected = snap['selected_ids'][0]
        for label, original, respelled in (('decimal-respelled', Decimal('0.0499'), Decimal('0.04990')),
                                           ('float-zero-sign', 0.0, -0.0)):
            source = edited(snap, (['memories', selected, 'usefulness_score'], original))
            result = a.archive_candidate(deepcopy(source), job)
            changed = edited(result, (['memories', selected, 'usefulness_score'], respelled))
            add('preserved-score-' + label, 'av_preserve', 'AV08_selected_fields',
                lambda s=source, r=result: a.archive_validate(deepcopy(s), deepcopy(r), job),
                lambda s=source, c=changed: a.archive_validate(deepcopy(s), deepcopy(c), job))
        before = W['before']; value = m.canonical_value(before['operation'], suffix)
        append = lambda state, v=value: a.append_current(deepcopy(state), deepcopy(v), event)
        add('writer-append-once-policy', 'aa_gate', 'AA04_replay_policy', lambda: append(before),
            lambda: append(before, {**value, 'replay_policy': 'append_once'}))
        add('writer-payload-schema', 'aa_payload', 'AA09_payload_schema', lambda: append(before),
            lambda: append(before, edited(value, (['payload', 'unexpected'], True))))
        retry = W['completed-retry']
        add('writer-started-receipt', 'aop_receipts', 'AOP03_started_receipt', lambda: append(retry),
            lambda: append(edited(retry, (['operation', 'started_event_id'], OTHER_EVENT_ID))))
        add('writer-completed-receipt', 'aop_receipts', 'AOP04_completed_receipt', lambda: append(retry),
            lambda: append(edited(retry, (['operation', 'completed_event_id'], OTHER_EVENT_ID))))
        add('writer-result-ref', 'aop_result', 'AOP06_result_ref', lambda: append(retry),
            lambda: append(edited(retry, (['operation', 'result_ref'], 'memresult_' + OTHER_SHA))))
        add('writer-result-digest', 'aop_result', 'AOP07_result_digest', lambda: append(retry),
            lambda: append(edited(retry, (['operation', 'result_sha256'], OTHER_SHA))))
        if suffix == 'completed':
            terminal = W['effect_committed-retry']
            add('writer-original-shape', 'aao_shape', 'AAO01_shape', lambda: append(terminal),
                lambda: append(edited(terminal, (['original', 'unexpected'], True))))
            add('writer-original-envelope', 'aao_envelope', 'AAO05_envelope', lambda: append(terminal),
                lambda: append(rehash(m, edited(terminal, (['original', 'full_value', 'unexpected'], True)), ['original'])))
            add('writer-new-append-completed-row', 'aa_phase', 'AA12_phase', lambda: append(terminal),
                lambda: append({**deepcopy(retry), 'original': None}))
        else:
            canonical = W['started-retry']
            fv = ['original', 'full_value']
            add('canonical-not-object', 'asc_object', 'ASC00_object', lambda: append(canonical),
                lambda: append(edited(canonical, (fv, 'not-an-object'))))
            add('canonical-shape', 'asc_shape', 'ASC01_shape', lambda: append(canonical),
                lambda: append(edited(canonical, (['original', 'unexpected'], True))))
            add('canonical-envelope', 'asc_envelope', 'ASC05_envelope', lambda: append(canonical),
                lambda: append(rehash(m, edited(canonical, (fv + ['unexpected'], True)), ['original'])))
            add('canonical-payload-schema', 'asc_payload_schema', 'ASC06_payload_schema', lambda: append(canonical),
                lambda: append(rehash(m, edited(canonical, (fv + ['payload', 'unexpected'], True)), ['original'])))
            add('canonical-producer', 'asc_joins', 'ASC07_producer', lambda: append(canonical),
                lambda: append(rehash(m, edited(canonical, (fv + ['actor_ref'], 'component:Other')), ['original'])))
            add('canonical-replay-policy', 'asc_joins', 'ASC08_replay_policy', lambda: append(canonical),
                lambda: append(rehash(m, edited(canonical, (fv + ['replay_policy'], 'projector_replay_only')), ['original'])))
    return counts
