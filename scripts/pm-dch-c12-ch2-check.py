#!/usr/bin/env python3
"""Replay CH2 closure evidence on the original DCH and Stop checkers and their gated guard rows.

Families: bundle.selection_forward_blocked, bundle.selection_sent_to_chat,
chat.message, chat.thread_archived, chat.thread_created, chat.thread_deleted
and chat.response_stop_requested. Run under the lane memory admission/cap and a
long-job; raw evidence belongs outside the repository. Every output is bound to
the actual checker inputs by source pins. Native execution is NOT_RUN.
"""
import argparse
import contextlib
import copy
import gzip
import hashlib
import io
import json
from pathlib import Path

import pm_dch_events as m
import pm_dch_stop as stop
import pm_dch_c12_ch2_cases as cs
from pm_dch_formats import validator
from pm_dch_thread import FAMILIES as THREAD_FAMILIES, fixtures as thread_fixtures
from pm_event_datetime import date_time, EVENT_RECORD, STORAGE_UTC_Z
from pm_event_numbers import Refusal
from pm_event_numbers_corpus import _value

ROOT = Path(__file__).resolve().parents[1]
STOP = stop.EVENT
FAMILIES = THREAD_FAMILIES + (STOP,)


def write(out, name, value):
    (out / name).write_text(json.dumps(value, indent=1, sort_keys=True, default=list) + '\n')


def sha(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), default=list).encode()).hexdigest()


def manifest():
    paths = list(ROOT.glob('scripts/pm_dch*.py')) + list(ROOT.glob('scripts/pm-dch*.py'))
    paths += list(ROOT.glob('Plans/dch*json')) + list(ROOT.glob('Plans/dch_event_payloads/*.json'))
    paths += list(ROOT.glob('tests/fixtures/dch_c12_ch1/*.json')) + list(ROOT.glob('tests/fixtures/dch_c12_ch2/*.json'))
    paths += [ROOT / p for p in ('scripts/pm_guard_isolation.py', 'scripts/pm_event_numbers.py', 'scripts/pm_event_datetime.py',
                                 'Plans/event_number_recipe_corpus.json', 'scripts/pm_event_datetime_timestamp_battery.json',
                                 'Plans/event_datetime_inventory.json', 'Plans/event_record.schema.json',
                                 'Plans/event_append_receipt_contracts.schema.json', 'Plans/storage_value_registry.json',
                                 'Plans/event_record_index_checkpoint.schema.json')]
    return {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths))}


def rows():
    return {r['event_type']: r for r in json.loads((ROOT / 'Plans/dch_event_contracts.json').read_text())['rows']}


def _ledger_entry(run, world, expected, ident, family, clause, kind):
    """Exact expected-code result, exact-row cut and restoration; exceptions are invalid, never kills."""
    before = sha(world)
    try:
        got = run()
    except Exception as error:  # noqa: BLE001 - an exception is an invalid mutation, never credit
        return None, dict(id=ident, family=family, kind=kind, error=type(error).__name__ + ': ' + str(error), credit=False)
    result = dict(id=ident, family=family, kind=kind, clause=clause, expected=expected, actual=got, control=expected is None,
                  pass_=got == expected, store_before=before, store_after=sha(world))
    if result['store_after'] != before:
        result['pass_'] = False
    if got == expected and got is not None:
        old = m.CUT_ROWS
        try:
            m.CUT_ROWS = frozenset(set(old) | {tuple(got[:2])})
            try:
                cut = run()
            except Exception as error:  # noqa: BLE001
                cut = ('EXCEPTION', type(error).__name__, str(error))
        finally:
            m.CUT_ROWS = old
        restored = run()
        result.update(expected_refusal_kill=True, whole_route_cut=cut, restoration=restored,
                      restoration_exact=restored == expected)
        result['pass_'] = result['pass_'] and restored == expected and sha(world) == before
    return result, None


def source_witnesses(out, family=None):
    r = rows()
    results, invalid = [], []
    def add(entry):
        result, bad = entry
        if bad:
            invalid.append(bad)
        else:
            results.append(result)
    for c in cs.cases(family if family in THREAD_FAMILIES else None) if family in (None, *THREAD_FAMILIES) else []:
        add(_ledger_entry(lambda c=c: m.thread_event_outcome(c.record, r[c.family], c.original_ref, c.originals),
                          c.originals, c.expected, c.name, c.family, c.clause, 'ordinary_original'))
    if family in (None, STOP):
        for c in cs.stop_request_cases():
            add(_ledger_entry(lambda c=c: stop.request_original_outcome(c.record, c.original_ref, c.originals),
                              c.originals, c.expected, c.name, STOP, c.clause, 'stop_writer_original'))
        for c in cs.sealed_cases():
            add(_ledger_entry(lambda c=c: stop.sealed_outcome(c.surface, c.data, c.custody),
                              dict(custody=c.custody, data=c.data), c.expected, 'sealed/' + c.name, STOP, c.clause, 'stop_sealed_read'))
    report = dict(status='pass' if not invalid and all(x['pass_'] for x in results) else 'fail',
                  controls=sum(x['control'] for x in results),
                  expected_refusal_kills=sum(x.get('expected_refusal_kill', False) for x in results),
                  invalid_mutations=invalid, results=results)
    write(out, 'source-mutations.json', report)
    return report['status'] == 'pass'


def sealed_snapshot(custody=None):
    """The actual protected store the reader uses.

    Ordinary reads: the sealed catalogue maps, recipes and installed tuples.
    Stop reads: the independently sealed Stop store and its one installed tuple
    (the Stop reader never consults the ordinary catalogue).
    """
    if custody is not None:
        return dict(stop_custody=copy.deepcopy(custody), stop_tuple=repr(stop.STOP_TUPLE))
    return dict(custody=copy.deepcopy(m.CUSTODY),
                receipts=[dict(store=k[0], digest=k[1], receipts=copy.deepcopy(v)) for k, v in sorted(m.RECIPE_RECEIPTS.items())],
                recipes=copy.deepcopy(m.RETAINED_RECIPES), installed=[dict(recipe=k, tuple=repr(v)) for k, v in sorted(m.RECIPE_TUPLES.items())])


def retained(out, family=None):
    from pm_dch_round7_oracles import OWNER_INVALID_ORIGINALS, OWNER_INVALID_CHECKPOINT_RETIRED
    r = rows()
    data = json.loads((ROOT / 'Plans/dch_retained_history_fixtures.json').read_text())
    ev = validator(json.loads((ROOT / 'Plans/event_record.schema.json').read_text()))
    results, worlds = [], {}

    def keep(world):
        wid = sha(world)
        if wid not in worlds:
            name = 'retained-world-' + wid + '.json.gz'
            (out / name).write_bytes(gzip.compress(json.dumps(world, sort_keys=True).encode(), mtime=0))
            worlds[wid] = dict(path=name, sha256=hashlib.sha256((out / name).read_bytes()).hexdigest())
        return wid

    def observe(label, source, function, expected, custody=None):
        bid = keep(sealed_snapshot(custody))
        raw_before = sha(source)
        try:
            function()
            got = None
        except m.TableRefusal as e:
            got = (e.phase, e.row, e.code)
        aid = keep(sealed_snapshot(custody))
        results.append(dict(id=label, expected=expected, actual=got, pass_=got == expected and bid == aid and raw_before == sha(source),
                            store_before=bid, store_after=aid, source_before=raw_before, source_after=sha(source)))
    wanted = [f for f in THREAD_FAMILIES if family in (None, f)]
    for item in data['events']:
        f = item['event_type']
        if f not in wanted:
            continue
        row = r[f]
        pv = validator(json.loads((ROOT / row['payload_schema_ref']).read_text()))
        valid = item['case'] not in OWNER_INVALID_ORIGINALS
        observe(f + '/' + item['edition'] + '/' + item['case'], item,
                lambda item=item, row=row, pv=pv: m._historical_read(item['record'], row, item['witness'], ev, pv),
                None if valid else ('hr_flags', 'HR02_envelope_schema', 'history_refused'))
    fs = json.loads((ROOT / 'Plans/dch_event_contract_fixtures.json').read_text())
    for fixture in fs:
        f = fixture['event_type']
        if f not in wanted:
            continue
        key = (fixture['historical_source']['storage_instance_id'], fixture['historical_source']['source_value_sha256'])
        original = m.RECIPE_RECEIPTS[key]
        pv = validator(json.loads((ROOT / r[f]['payload_schema_ref']).read_text()))
        for mode, target in [('missing', ('rn_receipt', 'RN07_receipt_present', 'original_unavailable')),
                             ('ambiguous', ('rn_receipt', 'RN08_receipt_unique', 'recipe_unsupported')),
                             ('other_original', ('rn_original', 'RO01_receipt_binding', 'original_unavailable'))]:
            replacement = [] if mode == 'missing' else copy.deepcopy(original)
            if mode == 'ambiguous':
                replacement.append(copy.deepcopy(original[0]))
            if mode == 'other_original':
                replacement[0]['binding']['event_id'] += ':other'
            m.RECIPE_RECEIPTS[key] = replacement
            try:
                observe(f + '/' + fixture['edition'] + '/' + mode, fixture,
                        lambda fixture=fixture, pv=pv, f=f: m._historical_read(fixture['record'], r[f], fixture['historical_source'], ev, pv),
                        target)
            finally:
                m.RECIPE_RECEIPTS[key] = original
    for item in data['checkpoints']:
        f = item['event_type']
        if f not in wanted:
            continue
        valid = item['value']['history'][0]['retired_at_utc'] != OWNER_INVALID_CHECKPOINT_RETIRED
        observe(f + '/checkpoint/' + item.get('case', item['rule']), item,
                lambda item=item, f=f: m._checkpoint_joins(item['value'], item['source'], r[f], item['key']),
                None if valid else ('cp_schema', 'CP01_checkpoint_schema', 'checkpoint_refused'))
    if family in (None, STOP):
        # Every sealed Stop historical consumer, accepted and refused, with the Stop store snapshotted.
        for c in cs.sealed_cases():
            dispatch = {'history': lambda c=c: stop._sealed_request(c.data['record'], c.data['context'], c.custody)}
            def run(c=c):
                got = stop.sealed_outcome(c.surface, c.data, c.custody)
                if got is not None:
                    raise m.TableRefusal(*got)
            observe(STOP + '/sealed/' + c.name, c.data, dispatch.get(c.surface, run), c.expected, c.custody)
    report = dict(status='pass' if all(x['pass_'] for x in results) else 'fail', reads=len(results),
                  failures=[x for x in results if not x['pass_']], observations=results,
                  snapshot_file='retained-store-snapshots.json', snapshot_count=len(worlds))
    write(out, 'retained-store-snapshots.json', worlds)
    write(out, 'retained-observations.json', report)
    return report['status'] == 'pass'


def _samples():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())['cases']
    direct = [x for x in corpus if x['op'] == 'datetime' and x.get('profile', EVENT_RECORD) == EVENT_RECORD]
    samples = json.loads((ROOT / 'scripts/pm_event_datetime_timestamp_battery.json').read_text())['samples']
    samples = [dict(id='battery/' + str(i), value=x['value']) for i, x in enumerate(samples)]
    for x in direct:
        samples.append(dict(id=x['id'], value=_value(x['value']), expected='error' not in x))
    return corpus, samples


def _profile_ok(value, profile, uppercase=False):
    try:
        date_time(value, profile=profile)
    except Refusal as e:
        return False, e.reason
    return (not uppercase or type(value) is str and value.endswith('Z')), None


def corpora(out, family=None):
    from pm_dch_number_corpus import run as number_run
    nr = number_run(m)
    numbers = dict(status='pass' if all(ok for _, ok, _ in nr) else 'fail', checks=len(nr), results=nr)
    corpus, samples = _samples()
    for sample in samples:
        if 'expected' in sample and _profile_ok(sample['value'], EVENT_RECORD)[0] != sample['expected']:
            raise AssertionError('shared direct corpus mismatch ' + sample['id'])
    r = rows()
    originals = thread_fixtures()
    stop_originals = cs.stop_data()['originals']
    envelope_schema = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
    checkpoints = json.loads((ROOT / 'Plans/dch_checkpoint_fixtures.json').read_text())
    SD = ('sd_complete', 'SD01_complete_definition', 'schema_refused')
    results, receipt_numbers = [], []

    def route(f, ref, world):
        if f == STOP:
            return stop.request_original_outcome(world[ref][0]['record'], ref, world)
        return m.thread_event_outcome(world[ref][0]['record'], r[f], ref, world)
    for f in FAMILIES:
        if family not in (None, f):
            continue
        store = stop_originals if f == STOP else originals
        for edition in ('project', 'application'):
            ref = f + '/' + edition
            base = store[ref][0]
            # acknowledged_at_utc: EventRecord profile (E5-2), in both independent receipt copies.
            for sample in samples:
                wanted, reason = _profile_ok(sample['value'], EVENT_RECORD)
                world = {ref: [copy.deepcopy(base)]}
                for key in ('receipt', 'first_receipt'):
                    world[ref][0][key]['acknowledged_at_utc'] = sample['value']
                got = route(f, ref, world)
                expected = None if wanted else SD
                results.append(dict(family=f, edition=edition, id=sample['id'], field='acknowledged_at_utc', profile=EVENT_RECORD,
                                    boundary='complete original route', expected=expected, actual=got, shared_reason=reason,
                                    pass_=got == expected))
            # Each timestamp declaration at the complete owner schema it belongs to.
            if f == STOP:
                declarations = [('ts', stop.REQUEST, base['result'], EVENT_RECORD, True),
                                ('occurred_at_utc', validator(envelope_schema), base['record'], EVENT_RECORD, False),
                                ('observed_at_utc', validator(envelope_schema), base['record'], STORAGE_UTC_Z, False),
                                ('persisted_at_utc', validator(envelope_schema), base['record'], STORAGE_UTC_Z, False),
                                ('ts', validator(stop.stop_source_schema(edition)), base, EVENT_RECORD, True)]
                outcome = next(b['value'] for b in json.loads((ROOT / 'Plans/dch_stop_contract_fixtures.json').read_text())['bases'].values()
                               if isinstance(b, dict) and 'value' in b and 'context' in b and b['value']['scope']['scope_kind'] == edition)
                declarations.append(('outcome_at_utc', stop.OUTCOME, outcome, EVENT_RECORD, True))
            else:
                payload = validator(json.loads((ROOT / r[f]['payload_schema_ref']).read_text()))
                declarations = [('ts', payload, base['result'], EVENT_RECORD, True),
                                ('occurred_at_utc', validator(envelope_schema), base['record'], EVENT_RECORD, False),
                                ('observed_at_utc', validator(envelope_schema), base['record'], STORAGE_UTC_Z, False),
                                ('persisted_at_utc', validator(envelope_schema), base['record'], STORAGE_UTC_Z, False)]
            for field, actual_validator, value, profile, uppercase in declarations:
                for sample in samples:
                    wanted, reason = _profile_ok(sample['value'], profile, uppercase)
                    if value is base:  # the Stop source wrapper: its frozen accepted intent and context copies
                        candidate = copy.deepcopy(base)
                        candidate['intent'][field] = candidate['context']['accepted'][field] = sample['value']
                    else:
                        candidate = {**value, field: sample['value']}
                    got = m.schema_admission(candidate, actual_validator)
                    results.append(dict(family=f, edition=edition, id=sample['id'], field=field, profile=profile, owner_uppercase_Z=uppercase,
                                        boundary='source wrapper intent/context' if value is base else 'complete selected owner schema',
                                        expected=wanted, actual=got, shared_reason=reason, pass_=got == wanted))
            # Receipt Storage integers: every shared uint64 case at the completed original route.
            for case in corpus:
                if case['op'] != 'uint64':
                    continue
                val = _value(case['value'])
                world = {ref: [copy.deepcopy(base)]}
                for component in ('receipt', 'first_receipt'):
                    world[ref][0][component]['byte_offset'] = val
                got = route(f, ref, world)
                if 'error' not in case:
                    expected = None
                elif type(val) is int and val >= 0 or type(val) is float and val.is_integer() and val >= 0:
                    expected = ('og_receipt', 'OG08_receipt_numbers', 'original_refused')
                else:
                    expected = SD
                receipt_numbers.append(dict(family=f, edition=edition, id=case['id'], shared_error=case.get('error'),
                                            expected=expected, actual=got, pass_=got == expected))
        if f != STOP:
            cp = next(c for c in checkpoints if c['event_type'] == f)
            cv = validator(json.loads((ROOT / cp['schema_ref'].split('#')[0]).read_text()))
            for sample in samples:
                wanted, reason = _profile_ok(sample['value'], EVENT_RECORD, True)
                candidate = copy.deepcopy(cp['with_history'])
                candidate['history'][0]['retired_at_utc'] = sample['value']
                got = m.schema_admission(candidate, cv)
                results.append(dict(family=f, id=sample['id'], field='retired_at_utc', profile=EVENT_RECORD, owner_uppercase_Z=True,
                                    boundary='complete populated checkpoint schema', expected=wanted, actual=got, shared_reason=reason,
                                    pass_=got == wanted))
    numbers['receipt_uint64'] = receipt_numbers
    numbers['status'] = 'pass' if numbers['status'] == 'pass' and all(x['pass_'] for x in receipt_numbers) else 'fail'
    write(out, 'number-corpus.json', numbers)
    dates = dict(status='pass' if all(x['pass_'] for x in results) else 'fail', checks=len(results),
                 failures=[x for x in results if not x['pass_']], results=results,
                 existing_fields='The complete original rounds 7/8 and Stop suites replay the existing timestamp oracles as well.')
    write(out, 'datetime-corpus.json', dates)
    return numbers['status'] == 'pass' and dates['status'] == 'pass'


def entailments(out, family=None):
    """Concrete premises of every defensive singleton the CH2 routes cross (7 ordinary, 4 Stop)."""
    import inspect
    r = rows()
    ordinary = {
        'SC13_decoded_bytes': 'sc_project_bytes', 'CP29_value_event_type': 'cp_family_entailed',
        'CP30_event_event_type': 'cp_event_family_entailed', 'CP32_consumer': 'cp_consumer_entailed',
        'CP33_projector': 'cp_projector_entailed', 'CS04_pointer_encodable': 'cs_pointer_bounds',
        'CS05_pointer_size': 'cs_pointer_size_entailed'}
    proofs = {row: dict(phase=phase, scope='ordinary', proof='Unchanged CH1 implication (reports/event-authority-20261114/c12-ch1); '
                        'its const premises are re-checked below for the CH2 families.') for row, phase in ordinary.items()}
    proofs.update({
        'SV11_pointer_encodable': dict(phase='st_pointer_bounds', scope='stop', proof=(
            'SV15 already requires payload_ref to equal payload:v1:<64 lowercase hex>:<decimal len>:application/msgpack, recomputed '
            'from the real encoded body and its BLAKE3. The pointer {"payload_ref": that ASCII string} is a built-in map of one str, '
            'always encodable by the current codec.')),
        'SV12_pointer_size': dict(phase='st_pointer_size_entailed', scope='stop', proof=(
            'The exact SV15 reference has a fixed ASCII prefix, 64 hex digits, a decimal byte length and a fixed media suffix; even a '
            '20-digit uint64 length gives at most 131 physical bytes, below 16384.')),
        'IX22_record_event_type': dict(phase='st_index_family_entailed', scope='stop', proof=(
            '_index_read_valid first calls _request_valid on the same unchanged record, which runs JN02 through shared._joins with '
            'EVENT=chat.response_stop_requested and refuses any other event_type before st_index_family_entailed.')),
        'IX24_row_sequence_type': dict(phase='st_index_sequence_entailed', scope='stop', proof=(
            '_index_read_valid runs shared._input_types(source) over the unchanged source whose index_row.sequence_id is a Storage '
            'uint64 slot: TY03/TY04 refuse every non-uint64 value before st_index_sequence_entailed.'))})
    for row, item in proofs.items():
        actual = m.table_rows(item['phase'])
        assert len(actual) == 1 and actual[0][0] == row, (row, actual)
        item['table'] = 'scripts/pm_dch_table_' + item['phase'] + '.py'
    constants = []
    for f in THREAD_FAMILIES:
        if family not in (None, f):
            continue
        row = r[f]
        path = 'Plans/dch_event_payloads/dch_' + f.replace('.', '_') + '_checkpoint.schema.json'
        editions = [(m.CURRENT_RULE, json.loads((ROOT / path).read_text()))] + [(n, rec['schemas'][path]) for n, rec in m.RETAINED_RECIPES.items()]
        for edition, definition in editions:
            for key, expected in (('event_type', f), ('consumer_id', row['reader']), ('projector_id', row['domain_projector'])):
                assert definition['properties'][key].get('const') == expected, (f, edition, key)
                constants.append(dict(family=f, edition=edition, schema=path, pointer='/properties/' + key + '/const', value=expected))
    pins = []
    for module, func in ((m, m._scope_partition), (m, m._historical_read), (m, m._joins), (m, m._checkpoint_joins),
                         (m, m._checkpoint_storage), (stop, stop._resolve_value), (stop, stop._request_valid), (stop, stop._index_read_valid)):
        lines, start = inspect.getsourcelines(func)
        pins.append(dict(path='scripts/' + Path(module.__file__).name, function=func.__name__, line=start,
                         sha256=hashlib.sha256(''.join(lines).encode()).hexdigest()))
    source = inspect.getsource(stop._resolve_value)
    assert source.index("require('st_pack_a'") < source.index("require('st_pointer_bounds'") < source.index("require('st_pointer_size_entailed'")
    index = inspect.getsource(stop._index_read_valid)
    assert index.index('_request_valid(record, context, historical=True)') < index.index('shared._input_types(source)') < index.index(
        "require('st_index_family_entailed'") < index.index("require('st_index_sequence_entailed'")
    request = inspect.getsource(stop._request_valid)
    assert 'shared._joins(ordinary, EVENT' in request
    assert 'sequence_id' in m.UINT64_SLOTS and 'sequence_id' in m.INTEGER_SLOTS
    pointer = {'payload_ref': 'payload:v1:' + 'f' * 64 + ':' + str((1 << 64) - 1) + ':application/msgpack'}
    pointer_bytes = len(m.body_bytes(pointer))
    assert pointer_bytes <= 131 < m.INLINE_LIMIT
    result = dict(status='pass', scope='CH2: no proof credit is invented for these unreachable defensive rows', proofs=proofs,
                  const_premises=constants, source_pins=pins, max_pointer_witness_bytes=pointer_bytes, tool_proved=False)
    write(out, 'entailed-singletons.json', result)
    return True


def replay(out, family=None):
    old = m.SELECTED_FAMILY
    m.SELECTED_FAMILY = None if family == STOP else family
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            code = m.main()
    finally:
        m.SELECTED_FAMILY = old
    write(out, 'original-suite.json', json.loads(buf.getvalue()))
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        stop_code = stop.main()
    write(out, 'stop-original-suite.json', json.loads(buf.getvalue()))
    return not (code or stop_code)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--family', choices=FAMILIES)
    p.add_argument('--part', action='append', choices=['source', 'schema', 'retained', 'corpora', 'replay', 'entailments'])
    a = p.parse_args()
    a.out.mkdir(parents=True, exist_ok=True)
    pins = manifest()
    write(a.out, 'source-pins.json', pins)
    parts = a.part or ['source', 'schema', 'retained', 'corpora', 'replay', 'entailments']
    outcomes = {}
    for part in parts:
        print('CH2 ' + part, flush=True)
        if part == 'schema':
            from pm_dch_schema_coverage import run
            result = run(m, a.family)
            write(a.out, 'schema-coverage.json', result)
            unresolved = [dict(boundary=b['id'], path=s['path'], classification=s['classification'])
                          for b in result['boundaries'] for s in b['inventory'] if s['classification'] in ('unvisited', 'needs_cover')]
            write(a.out, 'schema-unresolved.json', unresolved)
            outcomes[part] = not unresolved
        else:
            outcomes[part] = globals()[dict(source='source_witnesses').get(part, part)](a.out, a.family)
        print(part + ' ' + ('PASS' if outcomes[part] else 'FAIL'), flush=True)
    if manifest() != pins:
        raise AssertionError('input sources changed during run')
    summary = dict(status='pass' if all(outcomes.values()) else 'fail', parts=outcomes, source_pins='source-pins.json',
                   native_execution='NOT_RUN')
    write(a.out, 'summary.json', summary)
    print(json.dumps(summary))
    return summary['status'] != 'pass'


if __name__ == '__main__':
    raise SystemExit(main())
