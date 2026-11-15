#!/usr/bin/env python3
"""C12-DCW checked implications for the 14 by-construction DCW rows.

Each row sits alone in its own gated table and earns no proof credit. This
check makes its written proof (reports/event-authority-20261104/DCW.guard-removal.md)
executable on real inputs:

1. every cited proof line still carries the cited text;
2. attempts: each single-fact mutation of the row's own input, in every family
   and operation that reaches the row, is refused FIRST by the cited earlier
   guard with its exact code, never by the row itself;
3. backstop: with only that earlier guard disabled, the row is reached on the
   same input and its own predicate refuses it. The row is therefore live
   defence in depth, entailed by the earlier guard, not dead code.

OE007 is a dead fallback rather than a backstop: its attempts show the
schema refusal re-raised as phase_order before the fallback, and that OE007 is
never observed refusing anywhere in the lane corpus.
"""
import argparse
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_event_oracles as m
import pm_dcw_guard_rows as rows
import pm_dcw_guard_suites as suites
import pm_bundle_revision_events as legacy
import pm_dcw_blockage_events as blockage
from pm_dcw_blockage_fixtures import base, sync_payload

FIXTURES = 'Plans/dcw_event_contract_fixtures.json'
ORDINARY = ('bundle.revision_requested', 'bundle.revision_started', 'bundle.revision_completed',
            'bundle.revision_interrupted', 'wizard.opened', 'wizard.deferred_payload.loaded')
OTHER_TYPES = ('bundle.revision_requested', 'bundle.revision_started', 'bundle.revision_completed',
               'bundle.revision_interrupted', 'wizard.opened', 'wizard.deferred_payload.loaded',
               'wizard.blocked', 'wizard.unblocked', 'foreign.family')


def families():
    return {r['event_type']: r for r in m.load(FIXTURES)['families']}


def accepting(row, operation):
    case = next(c for c in row['cases'] if c['expected'] == 'accept' and c['operation'] == operation)
    from pm_dcw_event_regressions import scenario
    return scenario(row, case)


def execute(row, value, operation, disabled=frozenset()):
    recorded = []
    rows.RECORDER = recorded
    rows.DISABLED = frozenset(disabled)
    try:
        try:
            if row is None:
                outcome = blockage.verify(copy.deepcopy(value), operation)
            else:
                outcome = m.verify(row, copy.deepcopy(value), operation, legacy.validate)
            return dict(outcome=outcome, row=None), recorded
        except m.Refusal as exc:
            return dict(outcome=str(exc), row=getattr(exc, 'guard', None)), recorded
        except Exception as exc:
            return dict(outcome='EXCEPTION', row=type(exc).__name__), recorded
    finally:
        rows.RECORDER = None
        rows.DISABLED = frozenset()


def refuses(name, value):
    case = rows.FACTORIES[name](value)
    return case.table.guards[name].predicate(value, case.context) is not None


def payload_type(v, t):
    v['event']['payload']['event_type'] = t


def receipt_state(v, s):
    v['authority']['custody'][v['event']['event_id']]['first_append_receipt']['durability_state'] = s


def result_status(v, s):
    v['source']['result']['status'] = s
    v['authority']['results'][v['source']['result']['result_ref']] = copy.deepcopy(v['source']['result'])


def opened_predecessor(v, s):
    v['event']['payload']['predecessor_event_id'] = s


def coverage_flag(v, s):
    cp = v['index']['checkpoint']
    cp['generations'][cp['current_generation_id']]['frontier']['coverage']['complete_to_captured_boundary'] = s


def durable_length(v, extra):
    v['reader']['durable_token'].update(extra)


def live_length(v, extra):
    v['reader']['live_token'].update(extra)


def payload_ts(v, s):
    """The event and its own source slot copy move together, then originals are resealed."""
    from pm_dcw_event_fixtures import event_slots, seal_originals
    v['event']['payload']['ts'] = s
    for slot in event_slots(v):
        if slot['prepared_event']['event_id'] == v['event']['event_id']:
            slot['prepared_event']['payload']['ts'] = s
    seal_originals(v)


SPECS = [
    # row, earlier guard(s), families, operation, mutator, values, proof cite
    ('O014', ('OE001',), ORDINARY, 'publish', payload_type, OTHER_TYPES,
     'payload schema event_type const, enforced in event_body before O014'),
    ('O041', ('OE001',), ORDINARY, 'retry', receipt_state, ('acknowledged', 'appended', 'pending', 'unsynced', ''),
     'custody_v2 receipt durability_state const synced, enforced in original_receipt before O041'),
    ('O108', ('OE001',), ('wizard.opened',), 'append', result_status, ('seed_loaded', 'failed', 'opened ', ''),
     'wizard_open_evidence result status const opened, inline source schema before O108'),
    ('O109', ('OE001',), ('wizard.opened',), 'append', opened_predecessor, ('evt-foreign', ''),
     'wizard.opened payload predecessor_event_id type null'),
    ('O110', ('OE001',), ('wizard.deferred_payload.loaded',), 'append', result_status, ('opened', 'failed', 'seed_loaded ', ''),
     'wizard_seed_load_evidence result status const seed_loaded'),
    ('O117', ('OE001',), ORDINARY, 'read', coverage_flag, (False, None, 'true', 1),
     'checkpoint coverage complete_to_captured_boundary const true, checkpoint schema before O117'),
    ('O124', ('O122', 'O123', 'OE001'), ORDINARY, 'read', durable_length, ({'redb_snapshot_id': 'snap-x'}, {'extra': 1}),
     'O123 exact durable/live equality plus the closed ten-field live token'),
    ('O125', ('OE001',), ORDINARY, 'read', live_length, ({'extra': 1}, {'x': None}),
     'read token closed with exactly ten required fields, live token schema before O125'),
    ('L001', ('OE001',), ORDINARY[:4], 'append', payload_ts,
     ('2026-11-04T12:00:00+00:00', '2026-11-04T12:00:00z', '2026-11-04T12:00:00-05:00', '2026-11-04T12:00:00'),
     'payload ts pattern Z$ and shared EventRecord date_time format before L001'),
    ('LE001', ('OE001',), ORDINARY[:4], 'append', payload_ts,
     ('2026-11-04T24:00:00Z', '2026-13-04T12:00:00Z', '2026-11-04T12:00:00Z\n', '2026-12-31T23:59:60Z', 'not-a-timestamp-Z'),
     'payload ts shared EventRecord date_time format (same predicate) before LE001'),
]


def blockage_specs():
    def event_type(v, t):
        v['event']['payload']['event_type'] = t
    def no_predecessor(v, s):
        v['event']['payload']['predecessor_event_id'] = s
        sync_payload(v)
    return [
        ('B001', ('OE001',), ('wizard.blocked', 'wizard.unblocked'), 'publish', event_type, OTHER_TYPES,
         'blockage payload event_type const; envelope row derived from envelope type'),
        ('B054', ('OE001',), ('wizard.unblocked',), 'publish', no_predecessor, (None,),
         'wizard.unblocked payload predecessor_event_id required string'),
    ]


def run_spec(spec, fams):
    name, earlier, names, operation, mutate, values, cite = spec
    attempts = []
    for family in names:
        row = fams.get(family)
        for value in values:
            if values is OTHER_TYPES and value == family:
                continue
            control = base(family) if row is None else accepting(row, operation)
            changed = copy.deepcopy(control)
            mutate(changed, value)
            first, _ = execute(row, changed, operation)
            reached, extra, disabled = [], [], set(earlier)
            for _ in range(8):
                backstop, recorded = execute(row, changed, operation, disabled=disabled)
                reached = [v for n, v, _ in recorded if n == name]
                if any(refuses(name, v) for v in reached) or backstop['row'] in (None, name) or backstop['outcome'] == 'EXCEPTION':
                    break
                # The single mutation also breaks a copy checked before this row; record it.
                extra.append(backstop['row'])
                disabled.add(backstop['row'])
            own = any(refuses(name, v) for v in reached)
            attempts.append(dict(family=family, operation=operation, value=repr(value), first=first,
                                 first_is_earlier=first['row'] in earlier and first['outcome'] not in ('accept', 'EXCEPTION'),
                                 row_refused_first=first['row'] == name, backstop_also_disabled=extra,
                                 backstop_reached=bool(reached), backstop_refuses=own, backstop=backstop))
    ok = all(a['first_is_earlier'] and not a['row_refused_first'] and a['backstop_refuses'] for a in attempts)
    return dict(row=name, earlier=list(earlier), cite=cite, attempts=attempts, status='pass' if ok else 'fail')


def terminal_spec(fams):
    """O077 shares O057's membership test in the same iteration; settled grows only after O077."""
    attempts = []
    from pm_dcw_event_regressions import scenario
    for family in ('bundle.revision_completed', 'bundle.revision_interrupted'):
        row = fams[family]
        case = next(c for c in row['cases'] if c['case_id'] == 'two_terminals_for_one_start')
        value = scenario(row, case)
        first, _ = execute(row, value, case['operation'])
        disabled, extra = {'O057'}, []
        for _ in range(8):
            backstop, recorded = execute(row, value, case['operation'], disabled=disabled)
            own = any(refuses('O077', v) for n, v, _ in recorded if n == 'O077')
            if own or backstop['row'] in (None, 'O077') or backstop['outcome'] == 'EXCEPTION':
                break
            extra.append(backstop['row'])
            disabled.add(backstop['row'])
        attempts.append(dict(family=family, operation=case['operation'], first=first,
                             first_is_earlier=first['row'] == 'O057', row_refused_first=first['row'] == 'O077',
                             backstop_also_disabled=extra, backstop_refuses=own, backstop=backstop))
    ok = all(a['first_is_earlier'] and a['backstop_refuses'] for a in attempts)
    return dict(row='O077', earlier=['O057'], cite='same predecessor/settled test as O057; settled.add after O077',
                attempts=attempts, status='pass' if ok else 'fail')


def dead_fallback(collection):
    """OE007: the legacy callback raises only named Refusals; check_schema never raises ValidationError.

    Evidence: (1) the canonical callback's AST holds no raise or assert statement
    of its own, and every refusal it can produce is a named row Refusal that
    bundle_source re-raises as phase_order before the fallback; (2) over the
    whole lane collection OE007 is observed only as a passing control, with zero
    negatives, while every legacy L-row negative refuses through that path.
    """
    import ast
    tree = ast.parse((ROOT / 'scripts/pm_bundle_revision_events.py').read_text())
    validate = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'validate')
    raises = [n.lineno for n in ast.walk(validate) if isinstance(n, (ast.Raise, ast.Assert))]
    handled = [n.lineno for n in ast.walk(validate) if isinstance(n, ast.ExceptHandler)]
    # Legacy-kind witnesses call the callback directly; only bundle_source paths show the re-raise.
    legacy_cuts = [c for c in collection['cuts'] if c['row'].startswith('L') and '/legacy/' not in c['id']]
    via_refusal = all(c['baseline'] == 'phase_order' for c in legacy_cuts)
    negatives = collection['negatives'].get('OE007', [])
    control = collection['controls'].get('OE007')
    ok = not raises and not negatives and control is not None and via_refusal and legacy_cuts
    return dict(row='OE007', earlier=['named row Refusal re-raised as phase_order'],
                attempts=[dict(kind='legacy_negative', id=c['id'], row=c['row'], baseline=c['baseline']) for c in legacy_cuts],
                validate_raise_or_assert_lines=raises, validate_except_lines=handled,
                collection_negatives=len(negatives), collection_control=control is not None,
                cite='check_schema converts ValidationError to the OE001 Refusal; bundle_source re-raises Refusal as phase_order before the fallback',
                status='pass' if ok else 'fail')


def cited_lines():
    """Every path:line the written proof cites, with the text that must be there."""
    checks = [
        ('scripts/pm_dcw_event_oracles.py', 241, "check_schema(row['schema'], event['payload'])"),
        ('scripts/pm_dcw_event_oracles.py', 270, "guard_rows.enforce('O014'"),
        ('scripts/pm_dcw_event_oracles.py', 309, "custody_v2"),
        ('scripts/pm_dcw_event_oracles.py', 328, "guard_rows.enforce('O041'"),
        ('scripts/pm_dcw_event_oracles.py', 371, "guard_rows.enforce('O057'"),
        ('scripts/pm_dcw_event_oracles.py', 408, "guard_rows.enforce('O077'"),
        ('scripts/pm_dcw_event_oracles.py', 409, "settled.add"),
        ('scripts/pm_dcw_event_oracles.py', 424, "check_schema(row['source_schema'], source, 'inline')"),
        ('scripts/pm_dcw_event_oracles.py', 460, "guard_rows.enforce('O108'"),
        ('scripts/pm_dcw_event_oracles.py', 463, "guard_rows.enforce('O110'"),
        ('scripts/pm_dcw_event_oracles.py', 479, "'checkpoint')"),
        ('scripts/pm_dcw_event_oracles.py', 480, "'read_token')"),
        ('scripts/pm_dcw_event_oracles.py', 484, "guard_rows.enforce('O117'"),
        ('scripts/pm_dcw_event_oracles.py', 491, "guard_rows.enforce('O123'"),
        ('scripts/pm_dcw_event_oracles.py', 492, "guard_rows.enforce('O124'"),
        ('scripts/pm_dcw_event_oracles.py', 493, "guard_rows.enforce('O125'"),
        ('scripts/pm_dcw_event_oracles.py', 374, "except Refusal as exc:"),
        ('scripts/pm_dcw_event_oracles.py', 375, "exc.args = ('phase_order',)"),
        ('scripts/pm_dcw_event_oracles.py', 377, "except (AssertionError, ValidationError) as exc:"),
        ('scripts/pm_dcw_event_oracles.py', 378, "guard_rows.enforce('OE007'"),
        ('scripts/pm_dcw_event_oracles.py', 856, "def valid_date_time(value):"),
        ('scripts/pm_bundle_revision_events.py', 17, "m.check_schema(row['schema'], payload)"),
        ('scripts/pm_bundle_revision_events.py', 18, "guard_rows.enforce('L001'"),
        ('scripts/pm_bundle_revision_events.py', 20, "event_datetime.date_time(payload['ts'], profile=event_datetime.EVENT_RECORD)"),
        ('scripts/pm_dcw_blockage_events.py', 24, "m.check_schema('Plans/event_record.schema.json', event)"),
        ('scripts/pm_dcw_blockage_events.py', 152, "guard_rows.enforce('B054'"),
    ]
    result = []
    for path, line, text in checks:
        actual = (ROOT / path).read_text().splitlines()[line - 1]
        result.append(dict(path=path, line=line, text=text, present=text in actual, actual=actual.strip()[:200]))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--collection', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    import pickle
    collection = pickle.loads(args.collection.read_bytes())
    fams = families()
    results = [run_spec(spec, fams) for spec in SPECS + blockage_specs()]
    results.append(terminal_spec(fams))
    results.append(dead_fallback(collection))
    lines = cited_lines()
    status = 'pass' if all(r['status'] == 'pass' for r in results) and all(l['present'] for l in lines) else 'fail'
    report = dict(status=status, rows=results, cited_lines=lines,
                  attempts=sum(len(r['attempts']) for r in results),
                  unproved_rows=sorted(r['row'] for r in results), credited=0)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / 'entailments.json').write_text(json.dumps(report, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(dict(status=status, attempts=report['attempts'],
                          rows={r['row']: r['status'] for r in results},
                          missing_lines=[l for l in lines if not l['present']]), sort_keys=True, default=repr))
    raise SystemExit(0 if status == 'pass' else 1)


if __name__ == '__main__':
    main()
