"""PNC019 s4o3: execute state transitions for each of the 39 oracle cells.

Existing lane checkers enforce owner/schema/identity/receipt joins. This suite
adds a store that executes the formerly flag-modelled boundaries. Refusals are
judged by exact code and unchanged store, never by a process's nonzero exit.
"""
import argparse
import copy
import importlib
import json
from pathlib import Path

from pm_event_numbers import Refusal
from pm_pnc019_s4o3_store import Store, TABLES, RECEIPT_PATHS, RESULT_FIELDS, at, commitment, encoded
from pm_event_numbers import decode_storage_value, storage_uint64, EVENT_VALUE

ROOT = Path(__file__).resolve().parents[1]


class Adapter:
    def __init__(self, lane, scope=None):
        self.lane = lane
        self.scope = scope
        self.module = importlib.import_module({
            'W3D': 'pm_w3d_bsd_events', 'W3E': 'pm_w3e_event_oracles',
            'W3I': 'pm_w3i_continuity_oracles'}[lane])

    def families(self):
        if self.lane == 'W3D':
            return [f['event_type'] for f in self.module.spec.FAMILIES]
        return list(self.module.FAMILIES)

    def build(self, family):
        if self.lane == 'W3D':
            fam = next(f for f in self.module.spec.FAMILIES if f['event_type'] == family)
            return self.module.build(fam)
        if self.lane == 'W3E':
            case = self.module.build_case(family, 'stateful:' + family, scope=self.scope)
            from pm_pnc019_s4o3_domain_cases import contexts
            case['owner_domains'] = contexts(case)
            return case
        return self.module.build_case(family, 'stateful:' + family)

    def event(self, case):
        return case['env' if self.lane == 'W3D' else 'event']

    def instance(self, case):
        return self.module.STORAGE if self.lane == 'W3D' else self.module.STORAGE_INSTANCE_ID

    def original_ref(self, case):
        return case['receipt_ref' if self.lane == 'W3D' else 'original_ref']

    def receipt(self, case):
        if self.lane == 'W3D':
            return case['custody']
        return case['receipt_custody' if self.lane == 'W3E' else 'custody_receipt']

    def persisted(self, case):
        # W3D's fam is installed verifier code, including Python callables;
        # keep that code outside the captured data and resolve by frozen family.
        return copy.deepcopy({k: v for k, v in case.items() if self.lane != 'W3D' or k != 'fam'})

    def validate(self, case, owner_require):
        if self.lane == 'W3E':
            from pm_pnc019_s4o3_domain_cases import refresh
            for table, raw in case['owner_domains'].items():
                owner_require(table, refresh(raw))
        if self.lane == 'W3I':
            import pm_pnc019_s4o3_schema as schema
            slug = self.module.PAYLOAD_DEFS[case['family']]
            refused = schema.require('payload_' + slug, case['event']['payload'])
            if refused:
                raise Refusal(refused[0][1])
        if self.lane == 'W3D':
            refused = self.module.run_path('append', copy.deepcopy(case))
        else:
            refused = self.module.evaluate(copy.deepcopy(case), 'append')[0]
        if refused:
            raise Refusal(refused[2] if self.lane == 'W3D' else refused[0][1])

    def retained(self, case):
        if self.lane == 'W3D':
            case['fam'] = next(f for f in self.module.spec.FAMILIES if f['event_type'] == case['env']['event_type'])
            refused = self.module.run_path('read', case)
            if refused or not self.module.dispatcher_agrees(case):
                raise AssertionError(('retained_owner_refused', refused))
            return None
        result = self.module.resolve_retained(case)
        if result['reason'] is not None:
            raise Refusal(result['reason'])
        assert result['store_before'] == result['store_after']
        assert result['gate_calls'] == 0
        return result['reason']

    def validate_projection(self, case):
        if self.lane == 'W3I':
            import pm_pnc019_s4o3_schema as schema
            for subject in ('projection', 'checkpoint'):
                refused = schema.require(subject, case[subject])
                if refused:
                    raise Refusal(refused[0][1])
        if self.lane in ('W3E', 'W3I'):
            refused = self.module.evaluate(case, 'derived')[0]
            if refused:
                raise Refusal(refused[0][1])

    def retained_receipt(self, case):
        if self.lane == 'W3D':
            return case['read']['stored'][case['read']['original_ref']]['custody']
        return decode_storage_value(bytes.fromhex(case['sealed_store'][0]['receipt_hex']), profile=EVENT_VALUE)

    def replace_retained_receipt(self, case, receipt):
        if self.lane == 'W3D':
            case['read']['stored'][case['read']['original_ref']]['custody'] = receipt
        else:
            case['sealed_store'][0]['receipt_hex'] = encoded(receipt).hex()

    def first_result(self, case):
        return None if self.lane == 'W3D' else self.module.append_result(self.event(case))

    def retained_values(self, case):
        try:
            receipt = self.retained_receipt(case)
            if self.lane == 'W3D':
                errors = [e.validator for e in self.module.CUSTODY_VALIDATOR.iter_errors(receipt)]
                result = None
            else:
                errors = self.module.schema_errors(self.module.RECEIPT_ID, '/$defs/custody_v2', receipt)
                result = decode_storage_value(bytes.fromhex(case['sealed_store'][0]['result_hex']), profile=EVENT_VALUE)
                if type(result) is not dict or not set(RESULT_FIELDS).issubset(result):
                    errors.append('append_result_shape')
                else:
                    storage_uint64(result['sequence_id'])
            if not errors:
                for field in ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation'):
                    storage_uint64(receipt['first_append_receipt'][field])
            return receipt, result, errors
        except (Refusal, ValueError, KeyError, TypeError) as error:
            return None, None, [getattr(error, 'reason', type(error).__name__)]


def run_family(adapter, family, trace=None, cut=None):
    base = adapter.build(family)
    counts = {'positive': 0, 'negative': 0, 'crash': 0}
    witnesses = []

    def fresh(appended=False, published=False):
        store = Store(adapter, base, trace)
        if appended or published:
            store.append(copy.deepcopy(base))
        if published:
            store.publish(None, 'publication:old', store.source_rows(), 1)
        return store

    def refuse(store, row, fn):
        expected = next(reason for rows in TABLES.values() for name, reason, _ in rows if name == row)
        before = copy.deepcopy(store.data)
        try:
            fn()
        except Refusal as error:
            actual = error.reason
        else:
            actual = None
        # A crash, wrong refusal or secondary failure is INVALID evidence,
        # never a successful mutation kill.
        if actual != expected:
            raise AssertionError(('expected_refusal_missing', row, expected, actual))
        if store.last_refusals != [(row, expected)]:
            raise AssertionError(('wrong_refusal_row', row, store.last_refusals))
        if store.data != before:
            raise AssertionError(('refusal_changed_store', row))
        counts['negative'] += 1
        witnesses.append({'row': row, 'code': actual})

    event = adapter.event(base)
    ref = adapter.original_ref(base)
    # Exact membership includes family/schema/version/scope/Project. Every
    # mismatched edition remains a real registry row, never admitted=True.
    for slot, replacement in ((0, 'other.family'), (1, 'pm.other.v1'),
                              (2, '9.0.0'), (3, 'other_scope'), (4, 'other_project')):
        store = fresh()
        store.data['registry'][0][slot] = replacement
        refuse(store, 'admission', lambda: store.append(copy.deepcopy(base)))
    unsupported = copy.deepcopy(base)
    adapter.event(unsupported)['payload']['schema_version'] = '9.0.0'
    store = fresh()
    refuse(store, 'admission', lambda: store.append(unsupported))
    store = fresh()
    store.data['writer_generation'] = 2
    refuse(store, 'cutoff', lambda: store.append(copy.deepcopy(base), generation=1))

    store = fresh(appended=True)
    original = copy.deepcopy(store.data)
    first = store.append(copy.deepcopy(base))
    assert first == adapter.receipt(base) and store.data == original
    counts['positive'] += 1
    # Recover dedupe from the actual durable log after an index loss. Reading
    # the original stays possible while new writes are fenced.
    store.data['dedupe'] = {}
    store.data['dedupe_through'] = 0
    refuse(store, 'dedupe_frontier', lambda: store.append(copy.deepcopy(base)))
    store.recover_dedupe()
    assert store.append(copy.deepcopy(base)) == first and len(store.data['log']) == 1
    counts['positive'] += 1
    changed = copy.deepcopy(base)
    adapter.event(changed)['correlation_id'] = 'correlation:changed'
    refuse(store, 'dedupe_body', lambda: store.append(changed))
    replay = copy.deepcopy(base)
    adapter.event(replay)['replay_policy'] = 'projector_replay_only'
    replay_store = fresh()
    before = copy.deepcopy(replay_store.data)
    try:
        replay_store.append(replay)
    except Refusal as error:
        assert error.reason == 'replay_only_not_appendable'
    else:
        raise AssertionError('owner replay-only negative accepted')
    assert replay_store.data == before
    counts['negative'] += 1

    for phase in ('prepared', 'receipt_staged', 'before_commit', 'lost_ack'):
        store = fresh()
        before = copy.deepcopy(store.data)
        assert store.append(copy.deepcopy(base), crash=phase) is None
        if phase != 'lost_ack':
            assert store.data == before
        assert store.append(copy.deepcopy(base)) == adapter.receipt(base)
        assert len(store.data['log']) == len(store.data['receipts']) == 1
        counts['crash'] += 1

    store = fresh(appended=True)
    rows = store.source_rows()
    refuse(store, 'publication_cas', lambda: store.publish('stale', 'publication:new', rows, 1))
    refuse(store, 'publication_rows', lambda: store.publish(None, 'publication:new', [], 1))
    refuse(store, 'publication_frontier', lambda: store.publish(None, 'publication:new', rows, 0))
    store.data['withdrawn'] = ['publication:new']
    refuse(store, 'publication_generation', lambda: store.publish(None, 'publication:new', rows, 1))
    store.data['withdrawn'] = []
    for phase in ('rows_staged', 'checkpoint_staged', 'before_commit'):
        before = copy.deepcopy(store.data)
        assert store.publish(None, 'publication:new', rows, 1, crash=phase) is None
        assert store.data == before
        counts['crash'] += 1
    assert store.publish(None, 'publication:old', rows, 1) == 'publication:old'
    counts['positive'] += 1
    # A competing publisher cannot overwrite the installed head using the
    # earlier expected head, even with otherwise coherent rows and frontier.
    refuse(store, 'publication_cas', lambda: store.publish(None, 'publication:racer', rows, 1))
    store.data['writer_generation'] = 2
    refuse(store, 'withdraw_cutoff', lambda: store.withdraw('publication:old', 1, 'publication:new', rows))
    refuse(store, 'withdraw_head', lambda: store.withdraw('stale', 2, 'publication:new', rows))
    refuse(store, 'withdraw_successor', lambda: store.withdraw('publication:old', 2, 'publication:new', []))
    refuse(store, 'withdraw_generation', lambda: store.withdraw('publication:old', 2, 'publication:old', rows))
    store.withdraw('publication:old', 2, 'publication:new', rows)
    assert store.data['head'] == 'publication:new' and store.data['withdrawn'] == ['publication:old']
    refuse(store, 'read_generation', lambda: store.read('publication:old', ref))
    before = copy.deepcopy(store.data)
    assert store.read('publication:new', ref) is None
    assert store.data == before and store.data['external_effects'] == []
    counts['positive'] += 1
    refuse(store, 'read_hold', lambda: store.read('publication:new', 'original:missing'))
    refuse(store, 'read_publication', lambda: store.read('publication:unknown', ref))
    saved_rows = store.data['publications']['publication:new']['rows']
    store.data['publications']['publication:new']['rows'] = []
    refuse(store, 'read_coverage', lambda: store.read('publication:new', ref))
    store.data['publications']['publication:new']['rows'] = saved_rows

    translation = {'original_ref': ref, 'storage_instance': store.data['storage_instance'],
                   'bytes_hex': store.data['frames'][store.data['locations'][ref]].hex(),
                   'prior_locator': store.data['locations'][ref], 'new_locator': 'segment:relocated:2'}
    for field, value, row in (
            ('original_ref', 'original:other', 'relocation_original'),
            ('storage_instance', 'storage:other', 'relocation_instance'),
            ('bytes_hex', '00', 'relocation_bytes'),
            ('prior_locator', 'segment:wrong', 'relocation_prior')):
        bad = dict(translation, **{field: value})
        refuse(store, row, lambda b=bad: store.relocate(ref, b))
    receipts = copy.deepcopy(store.data['receipts'])
    store.relocate(ref, translation)
    assert store.data['locations'][ref] == translation['new_locator']
    assert store.data['receipts'] == receipts and store.read('publication:new', ref) is None
    assert translation['prior_locator'] not in store.data['frames']
    moved_bytes = store.data['frames'][translation['new_locator']]
    store.data['frames'][translation['new_locator']] = b'corrupt'
    refuse(store, 'read_frame', lambda: store.read('publication:new', ref))
    store.data['frames'][translation['new_locator']] = moved_bytes
    # Independently stored immutable first receipts authenticate every retained
    # receipt copy, including the coordinates the legacy frozen verifier omits.
    for path in RECEIPT_PATHS:
        held_case = store.data['originals'][ref]
        saved = copy.deepcopy(held_case)
        receipt = copy.deepcopy(adapter.retained_receipt(held_case))
        value = at(receipt, path)
        if type(value) is int:
            replacement = value + 1
        elif path[-1] == 'storage_instance_id':
            replacement = '22222222-2222-4222-8222-222222222222'
        elif path[-1] in ('producer_semantic_digest', 'group_digest'):
            replacement = ('0' if value[0] != '0' else '1') + value[1:]
        elif path[-1] == 'durability_class':
            replacement = 'ordinary'
        elif path[-1] == 'acknowledged_at_utc':
            replacement = '2026-11-05T12:34:56.123456789+02:00'
        else:
            replacement = value + '-other'
        target = receipt
        for part in path[:-1]:
            target = target[part]
        target[path[-1]] = replacement
        adapter.replace_retained_receipt(held_case, receipt)
        refuse(store, 'receipt_' + '_'.join(path), lambda: store.read('publication:new', ref))
        store.data['originals'][ref] = saved
    if adapter.lane != 'W3D':
        saved = copy.deepcopy(store.data['originals'][ref])
        store.data['originals'][ref]['sealed_store'][0]['receipt_hex'] = 'zz'
        refuse(store, 'read_shape', lambda: store.read('publication:new', ref))
        store.data['originals'][ref] = copy.deepcopy(saved)
        for field in RESULT_FIELDS:
            result = adapter.first_result(base)
            result[field] = result[field] + 1 if type(result[field]) is int else result[field] + '-other'
            store.data['originals'][ref]['sealed_store'][0]['result_hex'] = encoded(result).hex()
            refuse(store, 'result_' + field, lambda: store.read('publication:new', ref))
            store.data['originals'][ref] = copy.deepcopy(saved)
    counts['positive'] += 1

    store.data['holds'][ref] = ['hold:original:1']
    store.prune_selected([ref])
    assert ref in store.data['originals'] and store.read('publication:new', ref) is None
    captured = store.capture()
    manifest = {'sha256': commitment(captured), 'holds': copy.deepcopy(captured['holds'])}
    bad = copy.deepcopy(captured)
    bad['head'] = 'forged'
    refuse(store, 'restore_commitment', lambda: store.restore(bad, manifest))
    bad = copy.deepcopy(captured)
    bad['receipts'].pop(ref)
    bm = dict(manifest, sha256=commitment(bad))
    refuse(store, 'restore_receipts', lambda: store.restore(bad, bm))
    bad = copy.deepcopy(captured)
    bad['holds'] = {}
    bm = dict(manifest, sha256=commitment(bad))
    refuse(store, 'restore_holds', lambda: store.restore(bad, bm))
    bad = copy.deepcopy(captured)
    bad['storage_instance'] = 'storage:other'
    bm = dict(manifest, sha256=commitment(bad))
    refuse(store, 'restore_instance', lambda: store.restore(bad, bm))
    restored = fresh()
    restored.restore(captured, manifest)
    assert restored.data == captured
    assert restored.read('publication:new', ref) is None
    # Revoked current admission does not invalidate an authenticated historical
    # original, including after capture/restore and physical source relocation.
    restored.data['registry'] = []
    before = copy.deepcopy(restored.data)
    assert restored.read('publication:new', ref) is None and restored.data == before
    counts['positive'] += 2
    if adapter.lane == 'W3E':
        from pm_pnc019_s4o3_owner import run_cases
        counts['positive'] += run_cases(adapter, family, trace, refuse)
        from pm_pnc019_s4o3_domain_cases import run as domain_cases
        counts['positive'] += domain_cases(adapter, family, trace, refuse)
    return {'family': family, 'lane': adapter.lane, 'scope_kind': event['scope_kind'],
            **counts, 'witnesses': witnesses}


def run(lanes=('W3D', 'W3E', 'W3I'), trace=None):
    rows = []
    for lane in lanes:
        adapter = Adapter(lane)
        for family in adapter.families():
            rows.append(run_family(adapter, family, trace))
        if lane == 'W3E':
            project = Adapter(lane, scope='project')
            for family in ('backup.state_changed', 'restore.state_changed'):
                rows.append(run_family(project, family, trace))
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--lane', action='append', choices=['W3D', 'W3E', 'W3I'])
    parser.add_argument('--json')
    args = parser.parse_args()
    rows = run(tuple(args.lane or ('W3D', 'W3E', 'W3I')))
    result = {'status': 'pass', 'native': 'NOT_RUN', 'families': len({r['family'] for r in rows}),
              'scenarios': len(rows), 'rows': rows}
    text = json.dumps(result, indent=2) + '\n'
    if args.json:
        Path(args.json).write_text(text)
    print(json.dumps({'status': result['status'], 'families': result['families'], 'scenarios': len(rows),
                      'positive': sum(r['positive'] for r in rows),
                      'negative': sum(r['negative'] for r in rows), 'crash': sum(r['crash'] for r in rows)}))


if __name__ == '__main__':
    main()
