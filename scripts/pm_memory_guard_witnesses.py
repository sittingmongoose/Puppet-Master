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
    """Refresh the digest of the retained record at path (its value was changed coherently): the current writer's
    canonical original (`original`) carries its CV-339 commitment; every other record its frozen digest."""
    record = state
    for key in path:
        record = record[key]
    record['full_value_sha256'] = (m.numbers.full_value_commitment(record['full_value']) if path == ['original']
                                   else m.historical_digest(record['full_value']))
    return state


def with_custody(m, call, seal=(), replace=None):
    """Run call() with custody changed for this one call, then restore it exactly (sweep part 2B, SP-1101).

    seal: (value, row, event, writer, recorded) originals Storage sealed as written (recorded: the commitment the
    retained record carries, None for a bare checkpoint value), so a defective sealed original reaches the frozen
    verifier's own rows; replace: (value, row, event, entries, recorded) puts exactly these (binding, recipe) entries
    at that original's ref and commitment (a forged or ambiguous custody record)."""
    saved = {ref: {c: list(entries) for c, entries in commits.items()} for ref, commits in m.ORIGINAL_CUSTODY.items()}
    try:
        for value, row, event, writer, recorded in seal:
            m.seal_original(value, row, event, writer, recorded=recorded)
        if replace is not None:
            value, row, event, entries, recorded = replace
            commitment = m.source_commitment(value, recorded)
            ref = 'seglog:' + m.original_binding(row, event, commitment).event_id
            m.ORIGINAL_CUSTODY.setdefault(ref, {})[commitment] = list(entries)
        return call()
    finally:
        m.ORIGINAL_CUSTODY.clear()
        m.ORIGINAL_CUSTODY.update(saved)


def sealed_writer(m, call, state, event):
    """call(state) with the state's canonical writer original sealed as written (the current writer's recipe)."""
    record = state['original']
    return lambda: with_custody(m, lambda: call(state), seal=[(record['full_value'], state['operation'], event,
                                                               m.RECIPE_CURRENT, record['full_value_sha256'])])


def downgrade_attempt(m, call, state, event):
    """SP-1101 downgrade: the writer's original carries the frozen integer-json-v1 digest, while custody holds exactly
    the current writer's recipe for that record. The recipe comes from custody, so the CV-339 digest row refuses."""
    bad = edited(state, (['original', 'full_value_sha256'], m.historical_digest(state['original']['full_value'])))
    value, recorded, row = bad['original']['full_value'], bad['original']['full_value_sha256'], bad['operation']
    entries = [(m.original_binding(row, event, m.source_commitment(value, recorded)),
                m.recipe_tuple(event, (value['schema_id'], value['schema_version']), m.RECIPE_CURRENT))]
    return lambda: with_custody(m, lambda: call(bad), replace=(value, row, event, entries, recorded))


def sealed_history(m, call, state, event, written=None):
    """call(state) with the state's retained canonical original of `event` sealed as the frozen writer wrote it."""
    record = state['originals'][event]
    return lambda: with_custody(m, lambda: call(state), seal=[(record['full_value'], written or state['written_operation'], event,
                                                               m.RECIPE_FROZEN, record['full_value_sha256'])])


def history_witnesses(m, add, event, family):
    """SP-1101 at the canonical history reader (hm) and its start custody gate (sgh), and CV-1101/CV-253 at the
    retained edition, each one change from an intact canonical original. Defects behind custody are sealed as
    written, so the frozen verifier's own row refuses them; the custody rows get their four witnesses."""
    base = event.rsplit('.', 1)[0]
    started = base + '.started'
    canonical = family['states']['canonical']
    read = lambda target: (lambda state: m.read_canonical_history(deepcopy(state), target))
    row = canonical['written_operation']
    # For a started family the reader's start custody gate (sgh) checks the same start record first, so the hm rows
    # are witnessed through the completed families' terminal originals.
    sites = ([('hm', event, event)] if event.endswith('.completed') else []) + [('sgh', base + '.completed', started)]
    for prefix, target, held in sites:
        call = read(target)
        record = ['originals', held]
        value = canonical['originals'][held]['full_value']
        forged = rehash(m, edited(canonical, (record + ['full_value', 'correlation_id'], 'other-operation')), record)
        custody_witnesses(m, add, prefix + '-custody', prefix + '_custody', prefix, call,
                          {'intact': canonical, 'forged': forged}, value, row, held, m.RECIPE_FROZEN,
                          canonical['originals'][held]['full_value_sha256'])
        P = prefix.upper()
        sealed = lambda state: sealed_history(m, call, state, held)
        add(prefix + '-unflushed', prefix + '_body', P + '02_flush', lambda: call(canonical),
            lambda: call(edited(canonical, (record + ['durability'], 'not_flushed'))))
        # A sealed record whose recorded commitment is not its value's frozen digest (Storage sealed it as written).
        add(prefix + '-sealed-wrong-digest', prefix + '_body', P + '03_digest', lambda: call(canonical),
            sealed(edited(canonical, (record + ['full_value_sha256'], OTHER_SHA))))
        add(prefix + '-sealed-envelope-extra', prefix + '_body', P + '04_envelope', lambda: call(canonical),
            sealed(rehash(m, edited(canonical, (record + ['full_value', 'unexpected'], True)), record)))
        # CV-253 at the retained edition: a sealed original whose Storage time is not terminal uppercase Z refuses.
        add(prefix + '-sealed-storage-offset', prefix + '_body', P + '04_envelope', lambda: call(canonical),
            sealed(rehash(m, edited(canonical, (record + ['full_value', 'observed_at_utc'],
                                                 value['observed_at_utc'][:-1] + '+00:00')), record)))
        add(prefix + '-sealed-occurred-hour-24', prefix + '_body', P + '04_envelope', lambda: call(canonical),
            sealed(rehash(m, edited(canonical, (record + ['full_value', 'occurred_at_utc'],
                                                 value['occurred_at_utc'][:11] + '24:00:00Z')), record)))
        # The record never selects its edition: a valid 1.0.0 original sealed under the 2.0.0 frozen recipe refuses.
        compat = family['states']['compatibility']
        cvalue = compat['originals'][held]['full_value']; crecorded = compat['originals'][held]['full_value_sha256']
        add(prefix + '-edition-from-custody', prefix + '_body', P + '04_envelope', lambda: call(compat),
            lambda: with_custody(m, lambda: call(compat), replace=(cvalue, compat['written_operation'], held, [
                (m.original_binding(compat['written_operation'], held, m.source_commitment(cvalue, crecorded)),
                 m.recipe_tuple(held, ('pm.event.v0', '2.0.0'), m.RECIPE_FROZEN))], crecorded)))
        add(prefix + '-sealed-payload-extra', prefix + '_joins', P + '05_payload_schema', lambda: call(canonical),
            sealed(rehash(m, edited(canonical, (record + ['full_value', 'payload', 'unexpected'], True)), record)))
        add(prefix + '-sealed-producer', prefix + '_joins', P + '06_producer', lambda: call(canonical),
            sealed(rehash(m, edited(canonical, (record + ['full_value', 'actor_ref'], 'component:Other')), record)))
        add(prefix + '-sealed-binding', prefix + '_joins', P + '07_binding', lambda: call(canonical),
            sealed(forged))
        # A legitimate leap second and a lowercase t at the retained Storage times stay readable (CV-1101/CV-253).
        for label, stamp in (('leap-second', '2016-12-31T23:59:60Z'), ('lower-t', value['observed_at_utc'].replace('T', 't'))):
            valid = rehash(m, edited(canonical, (record + ['full_value', 'observed_at_utc'], stamp),
                                     (record + ['full_value', 'persisted_at_utc'], stamp)), record)
            sealed(valid)()


def custody_witnesses(m, add, label, phase, prefix, call, state, value, row, event, writer, recorded, edition=None):
    """The four SP-1101 custody rows of one site, each from the intact control `call(state)` with one change:
    R1 an unsealed coherent forgery; R2 the same bytes sealed twice; R3 a sealed binding for another operation;
    R4 a sealed recipe with no installed frozen verifier."""
    p = prefix.upper()
    edition = edition or (value['schema_id'], value['schema_version'])
    commitment = m.source_commitment(value, recorded)
    binding = m.original_binding(row, event, commitment)
    recipe = m.recipe_tuple(event, edition, writer)
    other_writer = m.RECIPE_FROZEN if writer == m.RECIPE_CURRENT else m.RECIPE_CURRENT
    unsealed = state['forged']
    add(label + '-unsealed-forgery', phase, p + 'R1_sealed', lambda: call(state['intact']), lambda: call(unsealed))
    add(label + '-ambiguous-recipe', phase, p + 'R2_unambiguous', lambda: call(state['intact']),
        lambda: with_custody(m, lambda: call(state['intact']), replace=(value, row, event, [
            (binding, recipe), (binding, m.recipe_tuple(event, edition, other_writer))], recorded)))
    foreign = m.numbers.OriginalBinding(**{**{f: getattr(binding, f) for f in m.numbers.OriginalBinding.__dataclass_fields__},
                                           'owner_operation_id': 'other-operation'})
    add(label + '-foreign-binding', phase, p + 'R3_binding', lambda: call(state['intact']),
        lambda: with_custody(m, lambda: call(state['intact']), replace=(value, row, event, [(foreign, recipe)], recorded)))
    unknown = m.numbers.RecipeTuple(**{**{f: getattr(recipe, f) for f in m.numbers.RecipeTuple.__dataclass_fields__},
                                       'producer_recipe': 'legacy-permissive'})
    add(label + '-uninstalled-recipe', phase, p + 'R4_recipe', lambda: call(state['intact']),
        lambda: with_custody(m, lambda: call(state['intact']), replace=(value, row, event, [(binding, unknown)], recorded)))


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
    histories = {f['event_type']: f for f in m.load('Plans/memory_canonical_history_fixtures.json')['canonical_history_families']}
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
                sealed_writer(m, append, rehash(m, edited(terminal, (['original', 'full_value', 'unexpected'], True)), ['original']), event))
            add('writer-new-append-completed-row', 'ap_phase', 'AP14_phase', lambda: append(terminal),
                lambda: append({**deepcopy(retry), 'original': None}))
            # SP-1101 downgrade: a current-writer original carrying the frozen digest still selects CV-339 (custody).
            # A sealed original whose producer field differs from the retry candidate (Storage sealed it as written).
            add('writer-original-producer', 'apo_producer', 'APO06_producer', lambda: append(terminal),
                sealed_writer(m, append, rehash(m, edited(terminal, (['original', 'full_value', 'actor_ref'], 'component:Other')), ['original']), event))
            add('writer-original-unflushed', 'apo_body', 'APO02_flush', lambda: append(terminal),
                lambda: append(edited(terminal, (['original', 'durability'], 'not_flushed'))))
            add('writer-original-frozen-digest', 'apo_body', 'APO04_digest', lambda: append(terminal),
                downgrade_attempt(m, append, terminal, event))
            custody_witnesses(m, add, 'writer-original', 'apo_custody', 'apo', append,
                              {'intact': terminal, 'forged': rehash(m, edited(terminal, (['original', 'full_value', 'actor_ref'], 'component:Other')), ['original'])},
                              terminal['original']['full_value'], terminal['operation'], event, m.RECIPE_CURRENT,
                              terminal['original']['full_value_sha256'])
        else:
            canonical = W['started-retry']
            add('writer-canonical-envelope', 'sgc_envelope', 'SGC05_envelope', lambda: append(canonical),
                sealed_writer(m, append, rehash(m, edited(canonical, (['original', 'full_value', 'unexpected'], True)), ['original']), event))
            add('writer-canonical-reference', 'sgc_reference', 'SGC06_reference', lambda: append(canonical),
                sealed_writer(m, append, rehash(m, edited(canonical, (['original', 'full_value', 'actor_ref'], 'component:Other')), ['original']), event))
            add('writer-canonical-unflushed', 'sgc_body', 'SGC02_flush', lambda: append(canonical),
                lambda: append(edited(canonical, (['original', 'durability'], 'not_flushed'))))
            add('writer-canonical-frozen-digest', 'sgc_body', 'SGC04_digest', lambda: append(canonical),
                downgrade_attempt(m, append, canonical, event))
            custody_witnesses(m, add, 'writer-canonical', 'sgc_custody', 'sgc', append,
                              {'intact': canonical, 'forged': rehash(m, edited(canonical, (['original', 'full_value', 'actor_ref'], 'component:Other')), ['original'])},
                              canonical['original']['full_value'], canonical['operation'], event, m.RECIPE_CURRENT,
                              canonical['original']['full_value_sha256'])

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
        # Each value defect is a retained original Storage sealed as written, so the join's own row refuses it.
        sealed_join = lambda bad: (lambda: with_custody(m, lambda: join(value=bad), seal=[(bad, ck['operation'], event, m.RECIPE_FROZEN, None)]))
        add('checkpoint-envelope', 'ck_envelope', 'CK01_envelope', join, sealed_join({**cv, 'unexpected': True}))
        add('checkpoint-storage-offset', 'ck_envelope', 'CK01_envelope', join,
            sealed_join({**cv, 'persisted_at_utc': cv['persisted_at_utc'][:-1] + '+00:00'}))
        # The checkpoint's own Store differs from the operation Store (its key and the retained original unchanged).
        add('checkpoint-store', 'ck_store', 'CK03_store', join,
            lambda: join(checkpoint=edited(generic, (['checkpoint', 'storage_instance_id'], '22222222-2222-4222-8222-222222222222'))))
        add('checkpoint-schema', 'ck_envelope', 'CK02_checkpoint_schema', join,
            lambda: join(checkpoint=edited(generic, (['checkpoint', 'unexpected'], True))))
        add('checkpoint-family', 'ck_event', 'CK05_event_type', join, sealed_join({**cv, 'event_type': base + '.other'}))
        add('checkpoint-event-id', 'ck_event', 'CK06_event_id', join, sealed_join({**cv, 'event_id': OTHER_EVENT_ID}))
        add('checkpoint-key', 'ck_event', 'CK07_idempotency_key', join,
            sealed_join({**cv, 'idempotency_key': 'memory-maintenance:' + OTHER_SHA}))
        add('checkpoint-project', 'ck_project', 'CK09_project', join, sealed_join({**cv, 'project_id': 'other-project'}))
        add('checkpoint-payload', 'ck_project', 'CK10_payload', join,
            sealed_join(edited(cv, (['payload', 'source_revision_sha256'], OTHER_SHA))))
        custody_witnesses(m, add, 'checkpoint', 'ck_custody', 'ck', lambda value: join(value=value),
                          {'intact': cv, 'forged': {**cv, 'correlation_id': 'other-operation'}}, cv, ck['operation'], event,
                          m.RECIPE_FROZEN, None)
        history_witnesses(m, add, event, histories[event])

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
    histories = {f['event_type']: f for f in m.load('Plans/memory_canonical_history_fixtures.json')['canonical_history_families']}
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
                sealed_writer(m, append, rehash(m, edited(terminal, (['original', 'full_value', 'unexpected'], True)), ['original']), event))
            add('writer-original-projection', 'aao_projection', 'AAO06_projection', lambda: append(terminal),
                sealed_writer(m, append, rehash(m, edited(terminal, (['original', 'full_value', 'actor_ref'], 'component:Other')), ['original']), event))
            add('writer-original-unflushed', 'aao_body', 'AAO02_flush', lambda: append(terminal),
                lambda: append(edited(terminal, (['original', 'durability'], 'not_flushed'))))
            add('writer-original-frozen-digest', 'aao_body', 'AAO04_digest', lambda: append(terminal),
                downgrade_attempt(m, append, terminal, event))
            custody_witnesses(m, add, 'writer-original', 'aao_custody', 'aao', append,
                              {'intact': terminal, 'forged': rehash(m, edited(terminal, (['original', 'full_value', 'actor_ref'], 'component:Other')), ['original'])},
                              terminal['original']['full_value'], terminal['operation'], event, m.RECIPE_CURRENT,
                              terminal['original']['full_value_sha256'])
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
                sealed_writer(m, append, rehash(m, edited(canonical, (fv + ['unexpected'], True)), ['original']), event))
            add('canonical-payload-schema', 'asc_payload_schema', 'ASC06_payload_schema', lambda: append(canonical),
                sealed_writer(m, append, rehash(m, edited(canonical, (fv + ['payload', 'unexpected'], True)), ['original']), event))
            add('canonical-producer', 'asc_joins', 'ASC07_producer', lambda: append(canonical),
                sealed_writer(m, append, rehash(m, edited(canonical, (fv + ['actor_ref'], 'component:Other')), ['original']), event))
            add('canonical-unflushed', 'asc_body', 'ASC02_flush', lambda: append(canonical),
                lambda: append(edited(canonical, (['original', 'durability'], 'not_flushed'))))
            add('canonical-frozen-digest', 'asc_body', 'ASC04_digest', lambda: append(canonical),
                downgrade_attempt(m, append, canonical, event))
            custody_witnesses(m, add, 'canonical', 'asc_custody', 'asc', append,
                              {'intact': canonical, 'forged': rehash(m, edited(canonical, (fv + ['correlation_id'], 'other-operation')), ['original'])},
                              canonical['original']['full_value'], canonical['operation'], event, m.RECIPE_CURRENT,
                              canonical['original']['full_value_sha256'])
            add('canonical-payload', 'asc_joins', 'ASC09_payload', lambda: append(canonical),
                sealed_writer(m, append, rehash(m, edited(canonical, (fv + ['payload', 'source_revision_sha256'], 'b' * 64)), ['original']), event))
            add('canonical-replay-policy', 'asc_joins', 'ASC08_replay_policy', lambda: append(canonical),
                sealed_writer(m, append, rehash(m, edited(canonical, (fv + ['replay_policy'], 'projector_replay_only')), ['original']), event))
        history_witnesses(m, add, event, histories[event])
    return counts
