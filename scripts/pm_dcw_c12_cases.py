"""C12-DCW complete-boundary witnesses through the unchanged complete DCW checkers.

Each witness starts from an authored accepting control and changes one fact.
Every copy that independently records that same fact elsewhere in the input
(source slot copies, sealed originals, index rows and tokens) is reissued, so
the named row is the only predicate that can refuse it. The repair control is
the unchanged accepting input. `kind='sealed'` means the independent original
store sealed exactly this scenario's originals; pm_dcw_guard_suites.invoke
installs that store state for the one call and restores the store afterwards.

These witnesses run in the guard collection (gated tool) and in
pm_dcw_c12_boundary.py, which requires the complete checker to accept with only
the named row disabled. No predicate, schema or helper is changed here.
"""
import copy

import pm_dcw_event_oracles as m
from pm_dcw_blockage_fixtures import base, seal, sync_payload, restore
from pm_dcw_event_fixtures import event_slots, seal_originals
from pm_dcw_event_regressions import scenario
from pm_dcw_index_fixtures import rehash, snapshot_source
from pm_dcw_p2a_cases import _generation, _reissue_generation, _rebuild_source, source_result

OTHER_STORAGE = '22222222-2222-4222-8222-222222222222'
FOREIGN_KEY = 'event_record_index_checkpoint.v1:' + OTHER_STORAGE
ORDINARY = ('bundle.revision_requested', 'bundle.revision_started', 'bundle.revision_completed',
            'bundle.revision_interrupted', 'wizard.opened', 'wizard.deferred_payload.loaded')
BLOCKAGE = ('wizard.blocked', 'wizard.unblocked')
# A schema-valid compaction translation body whose refs resolve no actual owner evidence.
OPAQUE_TRANSLATION = dict(manifest_ref='storage/compaction/manifest-unresolved', manifest_sha256='a' * 64,
                          source_index_generation_id='eig_' + 'b' * 64, source_selection_sha256='c' * 64,
                          target_selection_sha256='d' * 64, preserved_event_count=1, removed_event_count=0,
                          semantic_outcomes_sha256='e' * 64)


class C12Str(str):
    """A str subclass: equal and hash-equal to its text, but not an exact JSON string."""


def families():
    return {r['event_type']: r for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']}


def control(row, operation):
    case = next(c for c in row['cases'] if c['expected'] == 'accept' and c['operation'] == operation)
    return scenario(row, case)


def witness(target, family, row, seed, mutate, expected, operation, kind=None):
    value = copy.deepcopy(seed)
    mutate(value)
    return dict(id=family + '/c12/' + target + '/' + operation, family=family, row=row, value=value,
                operation=operation, expected=expected, target=target, repair=copy.deepcopy(seed), kind=kind)


def tokens(value):
    return (value['reader']['live_token'], value['reader']['durable_token'])


def rebuild_rows(value):
    """Reissue the current dataset rows, frontier row digest and tokens from the captured frames."""
    cp, g = _generation(value)
    key = 'event_record_index_checkpoint.v1:' + cp['storage_instance_id']
    rows = {m.index_key(f['event']): m.index_row(f, g, key) for f in value['index']['current_source']['frames']}
    value['index']['datasets'][g['index_dataset_name']] = rows
    g['frontier']['index_row_count'] = len(rows)
    rehash(value['index'], value['reader'])
    for token in tokens(value):
        token['generation_anchor_sha256'] = m.index_binding(g['anchor'])


def event_copy(value, field, new):
    """Change one envelope field of the event and its own source slot copy, then reseal originals."""
    value['event'][field] = new
    for slot in event_slots(value):
        if slot['prepared_event']['event_id'] == value['event']['event_id']:
            slot['prepared_event'][field] = new
    seal_originals(value)


def receipt_copy(value, update):
    """Change the event's first append receipt in custody and in its source slot copy."""
    eid = value['event']['event_id']
    receipt = value['authority']['custody'][eid]['first_append_receipt']
    receipt.update(update)
    for slot in event_slots(value):
        if slot['prepared_event']['event_id'] == eid:
            slot['first_append_receipt'] = copy.deepcopy(receipt)


def cases():
    fams = families()
    requested, completed = fams['bundle.revision_requested'], fams['bundle.revision_completed']
    opened, loaded = fams['wizard.opened'], fams['wizard.deferred_payload.loaded']

    # O234: a current generation carrying an unverified compaction translation is unavailable.
    def translated(value):
        _generation(value)[1]['translation'] = copy.deepcopy(OPAQUE_TRANSLATION)
    for name in ORDINARY:
        for operation in ('read', 'rebuild', 'compatibility_read'):
            yield witness('O234', name, fams[name], control(fams[name], operation), translated,
                          'index_translation_unverified', operation)
    for name in BLOCKAGE:
        yield witness('O234', name, None, base(name), translated, 'index_translation_unverified', 'read')

    # Blockage identifier and clearing-action shape.
    def trailing_space(value):
        value['source']['observation']['next_steps'][0]['step_ref'] = 'step:trailing '
        sync_payload(value)
    yield witness('B015', 'wizard.blocked', None, base('wizard.blocked'), trailing_space, 'identifier_whitespace', 'append')

    def subclass_items(value):
        action = value['authority']['actions'][value['event']['payload']['resolution_source']]
        action['remaining_before'] = [C12Str(x) for x in action['remaining_before']]
    yield witness('B063', 'wizard.unblocked', None, base('wizard.unblocked'), subclass_items,
                  'clearing_action_type_remaining_before', 'append')

    def foreign_source_ref(value):
        value['source']['source_ref'] = 'wizard_blocked_evidence:' + 'e' * 64
    yield witness('B022', 'wizard.blocked', None, base('wizard.blocked'), foreign_source_ref, 'source_ref', 'append')

    def rekeyed_source_ref(value):
        old, new = value['event']['payload']['source_ref'], 'wizard_blocked_evidence:' + 'e' * 64
        value['event']['payload']['source_ref'] = new
        value['source']['source_ref'] = new
        value['authority']['available_refs'] = [new if r == old else r for r in value['authority']['available_refs']]
        value['authority']['observations'].pop(old, None)
        seal(value)
    yield witness('B023', 'wizard.blocked', None, base('wizard.blocked'), rekeyed_source_ref, 'source_ref', 'append')

    def newer_dependency(value):
        restore(value)
        value['source']['recovery_epoch'] = value['authority']['recovery_epoch'] + 1
        restore(value)
    yield witness('B093', 'wizard.unblocked', None, base('wizard.unblocked'), newer_dependency, 'restore_older_only', 'publish')

    # Source slot and result joins on the writer path (no retained original involved).
    yield witness('O062', 'bundle.revision_requested', requested, control(requested, 'append'),
                  lambda v: v['source']['phases'][0].__setitem__('source_ref', 'foreign-ref'), 'source_ref', 'append')
    yield witness('O083', 'wizard.deferred_payload.loaded', loaded, control(loaded, 'append'),
                  lambda v: v['source'].__setitem__('source_ref', 'wizard_seed_load_evidence:' + 'e' * 64), 'source_ref', 'append')
    yield witness('O075', 'bundle.revision_completed', completed, control(completed, 'append'),
                  lambda v: source_result(v, 'output_document_refs', []), 'completion_outputs', 'append')

    def child_join(value):
        request, child = value['source']['request'], value['source']['child']
        request['thread_group_id'] = child['thread_group_id'] = 'thread-group:foreign'
        value['authority']['requests'][request['request_ref']] = copy.deepcopy(request)
        value['authority']['children'][value['source']['result']['child_ref']] = copy.deepcopy(child)
    yield witness('O085', 'wizard.opened', opened, control(opened, 'append'), child_join, 'current_child_join', 'append')

    # Envelope facts whose every copy moves with them.
    yield witness('O013', 'wizard.opened', opened, control(opened, 'append'),
                  lambda v: (event_copy(v, 'event_type', 'wizard.deferred_payload.loaded'),
                             v['authority']['custody'][v['event']['event_id']].__setitem__('event_type', 'wizard.deferred_payload.loaded'),
                             seal_originals(v)),
                  'family', 'append')
    yield witness('O020', 'wizard.opened', opened, control(opened, 'append'),
                  lambda v: event_copy(v, 'causation_event_id', 'evt-c12-foreign-cause'), 'causation', 'append')

    def parent(value):
        value['event']['causation_event_id'] = 'evt-c12-foreign-parent'
        event_copy(value, 'parent_event_id', 'evt-c12-foreign-parent')
        for slot in event_slots(value):
            if slot['prepared_event']['event_id'] == value['event']['event_id']:
                slot['prepared_event']['causation_event_id'] = 'evt-c12-foreign-parent'
        seal_originals(value)
    yield witness('O021', 'wizard.opened', opened, control(opened, 'append'), parent, 'causation', 'append')

    # Sealed first-append receipt facts (retry resolves the retained original).
    for target, update, expected in [
            ('O039', {'event_id': 'evt-c12-foreign-original'}, 'receipt_event_sequence'),
            ('O040', None, 'receipt_event_sequence'),
            ('O042', None, 'receipt_durability')]:
        def change(value, target=target, update=update):
            receipt = value['authority']['custody'][value['event']['event_id']]['first_append_receipt']
            if target == 'O040':
                update = {'sequence_id': receipt['sequence_id'] + 5}
            elif target == 'O042':
                update = {'byte_offset': receipt['durable_end_offset']}
            receipt_copy(value, update)
        yield witness(target, 'bundle.revision_requested', requested, control(requested, 'retry'), change, expected,
                      'retry', kind='sealed')

    # Index token, key and generation identity, each with all derived copies reissued.
    def token_key(value):
        for token in tokens(value):
            token['checkpoint_key'] = FOREIGN_KEY
    yield witness('O132', 'bundle.revision_requested', requested, control(requested, 'read'), token_key, 'index_currentness', 'read')

    def index_key(value):
        gid = value['index']['checkpoint']['current_generation_id']
        value['index']['checkpoint_key'] = FOREIGN_KEY
        for token in tokens(value):
            token['checkpoint_key'] = FOREIGN_KEY
            token['checkpoint_ref'] = FOREIGN_KEY + '#/generations/' + gid
    yield witness('O133', 'bundle.revision_requested', requested, control(requested, 'read'), index_key, 'index_currentness', 'read')

    def frontier_selection(value):
        g = _generation(value)[1]
        g['frontier']['source_selection']['manifest_generation'] += 1
        for token in tokens(value):
            token['source_selection'] = copy.deepcopy(g['frontier']['source_selection'])
        rehash(value['index'], value['reader'])
    yield witness('O116', 'bundle.revision_requested', requested, control(requested, 'read'), frontier_selection,
                  'index_currentness', 'read')

    def source_selection(value):
        source = value['index']['current_source']
        source['source_selection']['current_bytes_sha256'] = 'f' * 64
        value['index'], value['reader'] = snapshot_source(source, value['index']['checkpoint']['storage_instance_id'])
    yield witness('O198', 'bundle.revision_requested', requested, control(requested, 'read'), source_selection,
                  'index_source_binding', 'read')

    def other_storage(value, token_storage):
        source = value['index']['current_source']
        source['source_selection'] = m.index_selection(source, OTHER_STORAGE)
        value['index'], value['reader'] = snapshot_source(source, OTHER_STORAGE)
        for token in tokens(value):
            token['storage_instance_id'] = token_storage(value)
    yield witness('O128', 'bundle.revision_requested', requested, control(requested, 'read'),
                  lambda v: other_storage(v, lambda w: w['authority']['storage_instance_id']), 'index_currentness', 'read')
    yield witness('O183', 'bundle.revision_requested', requested, control(requested, 'read'),
                  lambda v: other_storage(v, lambda w: OTHER_STORAGE), 'checkpoint_storage_instance', 'read')

    def anchor(value, field, new):
        _generation(value)[1]['anchor']['source_selection'][field] = new
        _reissue_generation(value)
        rebuild_rows(value)
    yield witness('O220', 'bundle.revision_requested', requested, control(requested, 'read'),
                  lambda v: anchor(v, 'storage_instance_id', OTHER_STORAGE), 'index_generation_identity', 'read')
    yield witness('O226', 'bundle.revision_requested', requested, control(requested, 'read'),
                  lambda v: anchor(v, 'current_bytes_sha256', 'f' * 64), 'index_anchor_prefix', 'read')

    def keyed_generation(value):
        cp, g = _generation(value)
        key = 'eig_' + 'f' * 64
        added = copy.deepcopy(g)
        added.update(index_dataset_name='event_record_index.v2@' + key, state='retired',
                     retired_at_utc='2026-09-11T19:00:00Z', successor_generation_id=cp['current_generation_id'])
        cp['generations'][key] = added
    yield witness('O216', 'bundle.revision_requested', requested, control(requested, 'read'), keyed_generation,
                  'index_generation_identity', 'read')

    from pm_dcw_registered_cases import mixed
    def orphan_frame(value):
        value['index']['current_source']['frames'][-1]['segment_name'] = 'seg-000002-00000000000000000001.active'
        _rebuild_source(value)
    yield witness('O202', 'bundle.revision_requested', requested, mixed(requested), orphan_frame, 'index_source_bytes', 'read')

    yield from more_cases(fams)


def more_cases(fams):
    requested, opened, loaded = fams['bundle.revision_requested'], fams['wizard.opened'], fams['wizard.deferred_payload.loaded']
    from pm_dcw_index_fixtures import issue

    # O113: the predecessor Wizard was opened, fully authenticated, with another seed edition.
    def opened_other_seed(value):
        a = value['authority']
        source = a['opened_source']
        seed = copy.deepcopy(source['seed'])
        seed.update(seed_ref='seed:c12-opened', version='seed-v2')
        a['seeds'][seed['seed_ref']] = copy.deepcopy(seed)
        source['seed'] = seed
        source['result']['seed_ref'] = seed['seed_ref']
        a['results'][source['result']['result_ref']] = copy.deepcopy(source['result'])
        source['prepared_event']['payload'].update(seed_ref=seed['seed_ref'], seed_version=seed['version'])
        seal_originals(value)
    yield witness('O113', 'wizard.deferred_payload.loaded', loaded, control(loaded, 'append'), opened_other_seed,
                  'opened_join', 'append')

    # O028: a secret in another, internally valid DCW EventRecord captured in the same index source.
    def secret_frame(value):
        other = copy.deepcopy(value['event'])
        other['payload']['request_id'] = 'request-c12-other'
        other['event_id'], other['idempotency_key'] = m.event_identity(other['payload'])
        other['correlation_id'] = other['payload']['request_id']
        other['actor_ref'] = 'Bearer c12-not-a-real-token'
        other['sequence_id'] = max(e['sequence_id'] for e in value['authority']['events'].values()) + 1
        value['authority']['events'][other['event_id']] = other
        issue(value)
    yield witness('O028', 'wizard.opened', opened, control(opened, 'read'), secret_frame, 'secret_or_path', 'read')

    # O209: declared gaps and their evidence are exact, but the manifest excludes nothing.
    from pm_dcw_registered_cases import mixed
    gap = mixed(requested, mutate=lambda e: e.update(sequence_id=e['sequence_id'] + 2))
    def manifest_exclusions(value):
        source = value['index']['current_source']
        source['manifest']['excluded_ranges'] = []
        source['source_selection'] = m.index_selection(source, value['index']['checkpoint']['storage_instance_id'])
        value['index'], value['reader'] = snapshot_source(source, value['index']['checkpoint']['storage_instance_id'])
    yield witness('O209', 'bundle.revision_requested', requested, gap, manifest_exclusions, 'index_source_gaps', 'read')

    # O207: frames out of storage order; declared gaps, exclusions and evidence follow the computed holes.
    def out_of_order(value):
        source = value['index']['current_source']
        frames = source['frames']
        # A third, distinct registered original after the captured gap, then a swapped storage order.
        extra = copy.deepcopy(frames[-1])
        extra['event']['event_id'] = extra['event']['event_id'][:-8] + 'c12c12c1'
        extra['event']['idempotency_key'] = extra['event']['idempotency_key'] + ':c12-third'
        extra['event']['sequence_id'] = extra['event']['sequence_id'] + 3
        frames.append(extra)
        frames[-1], frames[-2] = frames[-2], frames[-1]
        sequences = [f['event']['sequence_id'] for f in frames]
        holes = [(a + 1, b - 1) for a, b in zip(sequences, sequences[1:]) if b != a + 1]
        template = copy.deepcopy(source['sequence_gaps'][0]) if source['sequence_gaps'] else None
        gaps = []
        for i, (first, last) in enumerate(holes):
            g = copy.deepcopy(template)
            g.update(first_sequence_id=first, last_sequence_id=last, manifest_evidence_ref=template['manifest_evidence_ref'] + ':c12:' + str(i))
            gaps.append(g)
        source['sequence_gaps'] = gaps
        source['manifest']['excluded_ranges'] = copy.deepcopy(gaps)
        source['gap_evidence'] = {g['manifest_evidence_ref']: copy.deepcopy(g) for g in gaps}
        _rebuild_source(value)
        # The anchor's birth-gap digest is the derived copy of the gaps inside its retained prefix.
        anchor = _generation(value)[1]['anchor']
        prefix = value['index']['current_source']['frames'][:anchor['retained_event_count']]
        birth = [g for g in gaps if prefix and prefix[0]['event']['sequence_id'] <= g['first_sequence_id']
                 and g['last_sequence_id'] <= prefix[-1]['event']['sequence_id']]
        anchor['sequence_gaps_sha256'] = m.index_binding(birth)
        for token in tokens(value):
            token['generation_anchor_sha256'] = m.index_binding(anchor)
    yield witness('O207', 'bundle.revision_requested', requested, gap, out_of_order, 'index_source_bytes', 'read')

    # OE002: an unused unresolved local $ref, with the registry's materialized copy kept identical.
    from pm_dcw_preflight_guard_cases import cases as preflight
    probe = next(w for w in preflight() if w['id'] == 'preflight/unused-local-ref')
    value = copy.deepcopy(probe['value'])
    path, document = next(iter(value['replacements'].items()))
    source_family = value['fixtures']['families'][0]['source_family']
    next(r for r in value['registry']['families'] if r['family_id'] == source_family)['value_schema'] = copy.deepcopy(document)
    control_value = copy.deepcopy(next(w for w in preflight() if w['id'] == 'preflight/control')['value'])
    yield dict(id='preflight/c12/OE002', family='CLI preflight', row=None, kind='preflight', operation='CLI',
               value=value, expected='unresolved_schema_ref', target='OE002', repair=control_value)
    yield from blockage_cases()


def blockage_cases():
    from pm_dcw_blockage_events import identity, source_key

    # B019: an Unblocked whose predecessor is itself a fully authenticated Unblocked of the same episode.
    def second_unblock(value):
        a = value['authority']
        first, first_source = value['event'], value['source']
        a['sources'][first['event_id']] = copy.deepcopy(first_source)
        p = copy.deepcopy(first['payload'])
        p.update(observation_id='observation:c12-second-unblock', predecessor_event_id=first['event_id'])
        event = copy.deepcopy(first)
        event.update(payload=p, causation_event_id=first['event_id'], parent_event_id=first['event_id'], sequence_id=12)
        event['event_id'], event['idempotency_key'] = identity(p)
        p['source_ref'] = 'wizard_unblocked_evidence:' + event['idempotency_key'].split(':')[-1]
        obs = copy.deepcopy(first_source['observation'])
        obs['observation_id'] = p['observation_id']
        source = dict(copy.deepcopy(first_source), source_ref=p['source_ref'], observation=obs, prepared_event=event)
        a['available_refs'].append(p['source_ref'])
        value.update(event=event, source=source, source_key=source_key(p))
        value['control']['latest_predecessor_event_id'] = first['event_id']
        seal(value)
    yield witness('B019', 'wizard.unblocked', None, base('wizard.unblocked'), second_unblock, 'blocked_original', 'append')

    # B096: two admitted restore members for one original; only the first would be joined.
    restored = base('wizard.unblocked')
    restore(restored)
    def duplicate_member(value):
        members = value['authority']['restore_admission']['members']
        twin = copy.deepcopy(next(x for x in members if x['event_id'] == value['event']['event_id']))
        twin['owner_operation_sha256'] = 'f' * 64
        members.append(twin)
    yield witness('B096', 'wizard.unblocked', None, restored, duplicate_member, 'restore_member', 'publish')
