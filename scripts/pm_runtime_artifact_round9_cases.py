"""Sweep part 2A single-defect witnesses for guard-table rows the earlier pairs never reached.

Each negative starts from the same family's valid invocation and changes one
source fact; every observation that watches the changed fact is rebound with
the checker's own codec, so the targeted row is the only refusal.
"""
import copy
import hashlib


def node(bundle):
    cp = bundle['checkpoint']
    return cp['generations'][cp['current_generation_id']]


def rebind_selection(m, event, original, bundle, keep=()):
    """Recompute CURRENT/manifest/inventory digests (except keep), copy the selection, rebind token/datasets."""
    src = bundle['selected_source']
    selection = src['source_selection']
    manifest = src['manifest']
    computed = dict(current_bytes_sha256=hashlib.sha256(m.value_bytes(src['current'])).hexdigest(),
                    manifest_bytes_sha256=hashlib.sha256(m.value_bytes(manifest)).hexdigest(),
                    retained_inventory_sha256=m.binding_digest(manifest['retained_inventory']),
                    durable_watermarks_sha256=m.binding_digest(manifest['durable_watermarks']),
                    excluded_ranges_sha256=m.binding_digest(manifest['excluded_ranges']),
                    retired_inputs_sha256=m.binding_digest(manifest['retired_inputs']))
    selection.update({k: v for k, v in computed.items() if k not in keep})
    n = node(bundle)
    n['anchor']['source_selection'] = copy.deepcopy(selection)
    n['frontier']['source_selection'] = copy.deepcopy(selection)
    for dataset in bundle['datasets'].values():
        for row in dataset.values():
            row['publication_locator'].update(manifest_generation=selection['manifest_generation'],
                                              recovery_epoch=selection['recovery_epoch'],
                                              survivor_prefix_sha256=selection['manifest_survivor_prefix_sha256'])
    m.checkpoint_rebind(event, original, bundle)


def change_segment(m, event, original, bundle, field, value):
    """One source segment fact, copied to coverage and the manifest inventory, everything else rebound."""
    src = bundle['selected_source']
    src['segments'][0][field] = value
    src['manifest']['retained_inventory'] = copy.deepcopy(src['segments'])
    node(bundle)['frontier']['coverage']['segments'] = copy.deepcopy(src['segments'])
    rebind_selection(m, event, original, bundle)


def retained_prefix(m, event, sha256):
    return m.binding_digest(dict(domain='pm.event_index.retained_prefix.v1', entries=[dict(
        sequence_id=event['sequence_id'], event_id=event['event_id'],
        scope_partition=m.scope_partition(event['project_id']), source_value_bytes_sha256=sha256)]))


def set_generation(m, event, original, bundle, generation):
    """A consistently applied generation id that is not the SP-278 recomputation."""
    cp = bundle['checkpoint']
    n = node(bundle)
    n['generation_id'] = generation
    n['index_dataset_name'] = 'event_record_index.v2@' + generation
    cp['current_generation_id'] = generation
    cp['generations'] = {generation: n}
    key = bundle['checkpoint_key']
    token = bundle['read_token']
    token.update(generation_id=generation, checkpoint_ref=key + '#/generations/' + generation,
                 index_dataset_name=n['index_dataset_name'])
    dataset = next(iter(bundle['datasets'].values()))
    for row in dataset.values():
        row['publication_locator']['checkpoint_ref'] = token['checkpoint_ref']
    bundle['datasets'] = {n['index_dataset_name']: dataset}
    n['frontier']['index_row_set_sha256'] = m.binding_digest(dict(domain='pm.event_index.row_set.v1',
        entries=[dict(key=k, value=v) for k, v in sorted(dataset.items())]))
    token['frontier_sha256'] = m.binding_digest(n['frontier'])


def checkpoint_cases(m, add, row, family, full, original, bundle):
    """Single-row checkpoint faults; each rebinds every observation that watches the changed fact."""
    def cp(b, o=original):
        return lambda n: n.checkpoint_matches(row, full, o, b)

    def fault(guard, name, edit, rebind=True, o=None):
        b = copy.deepcopy(bundle)
        o = copy.deepcopy(original) if o is None else o
        edit(b, o)
        if rebind:
            m.checkpoint_rebind(full, o, b)
        add(guard, family, name, cp(bundle), cp(b, o))

    foreign = '22222222-2222-4222-8222-222222222222'
    seq = full['sequence_id']

    def token_key(b, o):
        b['read_token']['checkpoint_key'] = m.CHECKPOINT_KEY.format(storage_instance_id=foreign)
    fault('C03', 'token_key_only', token_key, rebind=False)

    def selection_store(b, o):
        sel = b['selected_source']['source_selection']
        sel['storage_instance_id'] = foreign
        node(b)['frontier']['source_selection'] = copy.deepcopy(sel)
    fault('C04', 'live_selection_store', selection_store)

    fault('C05', 'generation_not_recomputed', lambda b, o: set_generation(m, full, o, b, 'eig_' + '4' * 64), rebind=False)
    fault('C05', 'token_generation_only', lambda b, o: b['read_token'].update(generation_id='eig_' + '5' * 64), rebind=False)
    fault('C05', 'token_anchor_only', lambda b, o: b['read_token'].update(generation_anchor_sha256='0' * 64), rebind=False)

    def token_dataset(b, o):
        name = 'event_record_index.v2@eig_' + '7' * 64
        node(b)['index_dataset_name'] = name
        b['read_token']['index_dataset_name'] = name
        b['datasets'] = {name: next(iter(b['datasets'].values()))}
    fault('C05', 'token_and_node_dataset_not_generation', token_dataset, rebind=False)
    fault('C05', 'node_dataset_only', lambda b, o: node(b).update(index_dataset_name='event_record_index.v2@eig_' + '8' * 64), rebind=False)

    def source_digest(b, o):
        value = '0' * 64
        src = b['selected_source']
        src['event_value_sha256'] = value
        src['segments'][0]['source_durable_bytes_sha256'] = value
        src['manifest']['retained_inventory'] = copy.deepcopy(src['segments'])
        n = node(b)
        n['frontier']['coverage']['segments'] = copy.deepcopy(src['segments'])
        prefix = retained_prefix(m, full, value)
        n['anchor']['retained_event_prefix_sha256'] = prefix
        n['frontier']['coverage']['retained_event_prefix_sha256'] = prefix
        rebind_selection(m, full, o, b)
    fault('C07', 'source_event_digest', source_digest, rebind=False)

    def selection_segment(b, o):
        src = b['selected_source']
        for part in (src['source_selection'], src['current'], src['manifest']):
            part['selected_segment_generation'] = 2
        rebind_selection(m, full, o, b)
    fault('C07', 'selection_segment_generation', selection_segment, rebind=False)

    for guard, name, member, field, value in (
            ('C08', 'current_generation_value', 'current', 'selected_segment_generation', 2),
            ('C08', 'manifest_segment_value', 'manifest', 'selected_segment_generation', 2),
            ('C08', 'manifest_generation_value', 'manifest', 'manifest_generation', 12),
            ('C08', 'recovery_epoch_value', 'manifest', 'recovery_epoch', 1),
            ('C08', 'survivor_prefix_value', 'manifest', 'survivor_prefix_sha256', 'a' * 64)):
        def edit(b, o, member=member, field=field, value=value):
            b['selected_source'][member][field] = value
            rebind_selection(m, full, o, b)
        fault(guard, name, edit, rebind=False)
    for field in ('retained_inventory_sha256', 'durable_watermarks_sha256', 'excluded_ranges_sha256', 'retired_inputs_sha256'):
        def edit(b, o, field=field):
            b['selected_source']['source_selection'][field] = '0' * 64
            rebind_selection(m, full, o, b, keep=(field,))
        fault('C08', 'selection_' + field, edit, rebind=False)

    fault('C09', 'anchor_selection_copy', lambda b, o: node(b)['anchor']['source_selection'].update(
        manifest_survivor_prefix_sha256='b' * 64))
    fault('C09', 'translation_present', lambda b, o: node(b).update(translation=dict(
        manifest_ref='storage/compaction/manifest-1', manifest_sha256='1' * 64, source_index_generation_id='eig_' + '6' * 64,
        source_selection_sha256='2' * 64, target_selection_sha256='3' * 64, preserved_event_count=1, removed_event_count=0,
        semantic_outcomes_sha256='4' * 64)))
    for field, value in (('first_retained_sequence_id', seq + 1), ('through_sequence_id', seq + 1),
                         ('retained_event_prefix_sha256', 'c' * 64), ('sequence_gaps_sha256', 'd' * 64)):
        fault('C09', 'anchor_' + field, lambda b, o, field=field, value=value: node(b)['anchor'].update({field: value}))
    gap = dict(reason='retention_compaction', first_sequence_id=1, last_sequence_id=2,
               manifest_evidence_ref='storage/compaction/manifest-1', manifest_evidence_sha256='5' * 64)
    for field, value in (('retained_event_count', 2), ('sequence_gaps', [gap]),
                         ('first_retained_sequence_id', seq + 1), ('through_sequence_id', seq + 1)):
        fault('C09', 'coverage_' + field,
              lambda b, o, field=field, value=value: node(b)['frontier']['coverage'].update({field: copy.deepcopy(value)}))

    def two_segments(b, o):
        src = b['selected_source']
        second = dict(copy.deepcopy(src['segments'][0]), segment_generation=2,
                      segment_name='seg-000002-00000000000000000001-00000000000000000099.seglog')
        src['segments'].append(second)
        src['manifest']['retained_inventory'] = copy.deepcopy(src['segments'])
        node(b)['frontier']['coverage']['segments'] = copy.deepcopy(src['segments'])
        rebind_selection(m, full, o, b)
    fault('C10', 'two_source_segments', two_segments, rebind=False)
    segment = bundle['selected_source']['segments'][0]
    for field, value in (('segment_generation', 2), ('segment_name', 'seg-000009-00000000000000000099.active'),
                         ('scanned_through_offset', segment['scanned_through_offset'] + 1),
                         ('source_durable_end_offset', segment['source_durable_end_offset'] + 1),
                         ('retained_event_count', 2), ('first_sequence_id', seq + 1), ('last_sequence_id', seq + 1)):
        fault('C11', 'segment_' + field, lambda b, o, field=field, value=value: change_segment(m, full, o, b, field, value), rebind=False)

    def frame_end(b, o):
        end = b['selected_source']['frame_end_offset'] - 1
        b['selected_source']['frame_end_offset'] = end
        node(b)['frontier']['coverage']['last_frame']['frame_end_offset'] = end
        change_segment(m, full, o, b, 'scanned_through_offset', end)
    fault('C11', 'frame_end_not_event_length', frame_end, rebind=False)

    def beyond_durable(b, o):
        end = b['selected_source']['frame_end_offset'] - 1
        for receipt in (o['result']['first_append_receipt'], o['custody']['first_append_receipt']):
            receipt['durable_end_offset'] = end
        change_segment(m, full, o, b, 'source_durable_end_offset', end)
    fault('C11', 'frame_beyond_receipt_durable_end', beyond_durable, rebind=False)


def cases(m, rows, fixtures):
    result = []

    def add(guard, family, name, good, bad):
        result.append((guard, family, name, good, bad))

    for row in rows:
        family = row['event_type']
        full = fixtures['positive_events'][family]
        receipt = fixtures['first_append_receipts'][family]

        def dec(event, packs=None, row=row, raw_sources=None):
            return lambda n: n.decode(row, event, packs or {}, raw_sources=raw_sources)

        # D03a: an application envelope is schema-valid (project_id null) but not this Project edition.
        bad = copy.deepcopy(full)
        bad.update(scope_kind='application', project_id=None)
        add('D03', family, 'application_scope', dec(full), dec(bad))
        bad_stored = copy.deepcopy(bad)
        add('V02', family, 'stored_application_scope', lambda n, e=full: n.stored_event_valid(e),
            lambda n, e=bad_stored: n.stored_event_valid(e))

        logical = copy.deepcopy(full['payload'])
        logical['summary'] = 'x' * 17000
        packs = {}
        packed = copy.deepcopy(full)
        packed['payload'], packed['payload_ref'] = m.storage_form(logical, packs)
        digest = m.PACK_REF.fullmatch(packed['payload_ref']).group(1)
        missing = {}
        add('D07', family, 'pack_missing', dec(packed, packs), dec(packed, missing))
        # Present, durable and authorized bytes whose reference matches them exactly.
        body = m.rfc8785.dumps(logical)
        for name, broken in (('body_not_utf8', body[:-2] + b'\xff"}'), ('body_not_json', body[:-1] + b',}')):
            d = m.blake3(broken).hexdigest()
            bad = copy.deepcopy(packed)
            bad['payload_ref'] = f'pm.payload_pack.v1:blake3:{d}:{len(broken)}:application/json'
            add('D10', family, name, dec(packed, packs), dec(bad, {d: dict(body=broken, durable=True, authorized=True)}))

        if family.endswith('.cost_usage'):
            # One body copy at a time; refs and the root copy stay the agreeing source.
            from pm_runtime_artifact_round6_cases import agreement_case
            for field in ('usage_event_ref', 'usage_record_id'):
                agreement_case(m, result, row, full['payload'], ('type_payload', field), 'foreign-body-' + field, 'body_' + field)
        if family in m.PROVIDER_HASH_PATHS:
            evidence = full['payload']['type_payload']['authority' if family.endswith('.cost_usage') else 'raw_payload']
            raw = fixtures['provider_hash_source_utf8'][family].encode('utf-8')
            for route, event, route_packs in (('inline', full, {}), ('packed', packed, packs)):
                add('B02', family, 'source_missing_' + route,
                    dec(event, route_packs, raw_sources={evidence['raw_payload_ref']: raw}),
                    dec(event, route_packs, raw_sources={}))

        # H05 for every family: an unknown recorded decoder never reaches decode.
        custody = copy.deepcopy(fixtures['custody_template'])
        custody.update(event_id=full['event_id'], scope_partition=m.scope_partition(full['project_id']),
                       event_type=family, idempotency_key=full['idempotency_key'],
                       producer_semantic_digest=m.semantic_digest(full), first_append_receipt=copy.deepcopy(receipt),
                       original_event_value_commitment=m.commitment(full))
        original = dict(event=full, custody=custody, result={k: copy.deepcopy(custody[k]) for k in (
            'first_append_receipt', 'original_segment_ref', 'original_event_value_commitment')})
        if family not in m.PROVIDER_HASH_PATHS:
            source = m.history_source_for(row, full['payload'], original)
            unknown = dict(source, recorded_decoder='unknown-decoder')
            add('H05', family, 'unknown_decoder',
                lambda n, r=row, o=original, s=source: n.resolve_history(r, o, s, {}),
                lambda n, r=row, o=original, s=unknown: n.resolve_history(r, o, s, {}))

        bundle = fixtures['checkpoint_positives'][family]

        def cp(b, r=row, e=full, o=original):
            return lambda n: n.checkpoint_matches(r, e, o, b)

        # C04x: the current generation id names no generation in the map.
        bad = copy.deepcopy(bundle)
        cpd = bad['checkpoint']
        generation = cpd['current_generation_id']
        cpd['generations'] = {'eig_' + '1' * 64: dict(cpd['generations'][generation], generation_id='eig_' + '1' * 64)}
        add('C04', family, 'current_generation_absent', cp(bundle), cp(bad))
        # C04b: the selected node is staged while another generation is current.
        bad = copy.deepcopy(bundle)
        cpd = bad['checkpoint']
        other = copy.deepcopy(node(bad))
        other['generation_id'] = 'eig_' + '2' * 64
        node(bad).update(state='staged', activated_at_utc=None)
        cpd['generations'][other['generation_id']] = other
        add('C04', family, 'selected_generation_not_current', cp(bundle), cp(bad))
        # C04c: the selected node is current and so is a second generation.
        bad = copy.deepcopy(bundle)
        other = copy.deepcopy(node(bad))
        other['generation_id'] = 'eig_' + '3' * 64
        bad['checkpoint']['generations'][other['generation_id']] = other
        add('C04', family, 'two_current_generations', cp(bundle), cp(bad))
        checkpoint_cases(m, add, row, family, full, original, bundle)
    return result
