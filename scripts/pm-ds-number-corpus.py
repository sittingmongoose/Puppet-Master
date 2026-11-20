#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the complete lane DS checker routes.

Every number-scope value of Plans/event_number_recipe_corpus.json (raw JSON spellings
and exact integers) is parsed with the shared current parser (loads_current_json) and,
when it parses, placed at each DS integer slot of a valid complete input. The complete
checker then runs that route. The expected outcome is composed from the shared helpers
alone (current_integer with the slot's schema bounds, storage_uint64, EVENT_VALUE
storage_value_bytes, qualified producer JCS); a disagreement or an untracked exception
fails the run. Date-time cases are out of scope (CV-1101 is part 2B).

usage: python3 scripts/pm-ds-number-corpus.py [--json <path>]
"""
from __future__ import annotations

import argparse
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_event_numbers as N  # noqa: E402
import pm_home_layout_v2_slot_receipt as home  # noqa: E402
import pm_event_authority_ds_round2 as ds  # noqa: E402
import pm_event_authority_ds_round3 as d3  # noqa: E402
import pm_browser_workspace_created as created  # noqa: E402
import pm_browser_workspace_reset as reset  # noqa: E402

RAW_OPS = ('token', 'slot', 'parse_token', 'parse')


def corpus_values():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    raws, ints = [], []
    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        if case.get('op') in RAW_OPS and isinstance(case.get('raw'), str):
            raws.append(case['raw'])
        elif case.get('op') in ('uint64', 'integer') and isinstance(case.get('value'), dict) and '@int' in case['value']:
            with home.exact_digits():
                ints.append(int(case['value']['@int']))
        elif case.get('op') in ('current_json', 'current_json_slot') and isinstance(case.get('raw'), str):
            try:
                with home.exact_digits():
                    tree = N.loads_current_json(case['raw'])
            except (N.Refusal, ValueError):
                continue
            pending = [tree]
            while pending:
                node = pending.pop()
                if isinstance(node, dict):
                    pending.extend(node.values())
                elif isinstance(node, list):
                    pending.extend(node)
                elif type(node) is int:
                    ints.append(node)
                elif isinstance(node, N.ParsedDecimal):
                    raws.append(str(node))
    seen, out = set(), []
    for raw in raws:
        if ('raw', raw) not in seen:
            seen.add(('raw', raw))
            out.append(('raw', raw))
    for value in ints:
        with home.exact_digits():
            key = ('int', str(value))
        if key not in seen:
            seen.add(key)
            out.append(key)
    return out


def parsed(kind, text):
    """The value a DS input holds after the shared current parser, or a Refusal."""
    try:
        with home.exact_digits():
            return N.loads_current_json(text), None
    except N.Refusal as exc:
        return None, exc.reason
    except ValueError as exc:
        return None, 'json_syntax:' + type(exc).__name__


def ok(call):
    try:
        call()
    except N.Refusal:
        return False
    return True


def expect_integer(value, minimum=None):
    return ok(lambda: N.current_integer(value, minimum=minimum))


def expect_event_value(value):
    return ok(lambda: N.storage_value_bytes(value, profile=N.EVENT_VALUE))


def expect_producer(event):
    return home.producer_jcs_ok(event)


def routes():
    gate, context, values = d3.bases()
    (_, created_base), (_, reset_base) = values
    digest = gate.envelope_oracle().event_producer_semantic_digest
    comp = ds.load('Plans/context_compaction_completion_contract_fixtures.json')['valid_event']
    slot, layout_event = d3.layout_base()
    checkpoint = json.loads((ROOT / created.FIXTURE_PATH).read_text())['checkpoint_fixture']

    def created_append(base):
        oracle = created.CreationOracle(digest)
        return oracle.create(**copy.deepcopy(base), append_outcome='committed', admitted=True)

    def reset_append(base):
        t = base['transition']
        oracle = reset.ResetOracle(t['subject'], t['checked_workspace_revision'], t['prior_workspace_generation'], digest)
        return oracle.reset(**copy.deepcopy(base), append_outcome='committed', admitted=True)

    def r_created_producer(v):
        b = copy.deepcopy(created_base); b['event']['producer_sequence_id'] = v
        expected = expect_integer(v, 0) and expect_producer(b['event'])
        return created_append(b) == 'creation_committed_and_published', expected

    def r_reset_producer(v):
        b = copy.deepcopy(reset_base); b['event']['producer_sequence_id'] = v
        expected = expect_integer(v, 0) and expect_producer(b['event'])
        return reset_append(b) == 'reset_event_committed_and_published', expected

    def r_created_generation(v):
        b = copy.deepcopy(created_base)
        b['event']['payload']['facts']['workspace_generation'] = v
        b['witness']['workspace_generation'] = v
        expected = (expect_integer(v, 0) and expect_event_value(b["event"]["payload"])
                    and expect_producer(b['event']))
        return created_append(b) == 'creation_committed_and_published', expected

    def r_compaction_producer(v):
        e = copy.deepcopy(comp); e['producer_sequence_id'] = v
        expected = expect_integer(v, 0) and expect_producer(e)
        return ds.compaction_event_errors(e) == [], expected

    def r_layout_revision(v):
        e = copy.deepcopy(layout_event); b = copy.deepcopy(slot['binding'])
        if type(v) is int:
            b['expected_layout_revision'] = v - 1
            e['payload']['prior_layout_revision'] = v - 1
        else:
            b['expected_layout_revision'] = v
            e['payload']['prior_layout_revision'] = v
        e['payload']['new_layout_revision'] = v
        e['producer_sequence_id'] = v
        expected = (type(v) is int and expect_integer(v - 1, 0) and expect_integer(v, 1)
                    and expect_event_value(e['payload']) and expect_producer(e))
        return ds.layout_event_errors(e, binding=b) == [], expected

    def r_candidate_sequence(v):
        e = copy.deepcopy(created_base['event']); e['sequence_id'] = v
        expected = expect_integer(v, 0) and ok(lambda: N.storage_uint64(v))
        return gate.candidate_failures(e, 'BrowserRuntimeService.workspace', context) == [], expected

    def r_checkpoint_through(v):
        c = copy.deepcopy(checkpoint)
        c['index_through_sequence_id'] = v
        if c.get('source_cursor') is not None:
            c['source_cursor']['last_sequence_id'] = v
        if c.get('first_retained_sequence_id') is not None and type(v) is int and v < c['first_retained_sequence_id']:
            c['first_retained_sequence_id'] = v
        expected = (expect_integer(v, 0) and ok(lambda: N.storage_uint64(v))
                    and (c.get('first_retained_sequence_id') is None or c['first_retained_sequence_id'] <= v))
        return created.checkpoint_failures(c) == [], expected

    return {'created_writer_producer_sequence_id': r_created_producer,
            'reset_writer_producer_sequence_id': r_reset_producer,
            'created_writer_payload_workspace_generation': r_created_generation,
            'compaction_event_producer_sequence_id': r_compaction_producer,
            'layout_writer_revision_edge': r_layout_revision,
            'browser_candidate_storage_sequence_id': r_candidate_sequence,
            'created_v1_checkpoint_through_sequence': r_checkpoint_through}


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    table = routes()
    rows, disagreements, untracked = [], [], []
    for kind, text in corpus_values():
        value, refusal = parsed(kind, text)
        if refusal is not None:
            rows.append({'value': text, 'kind': kind, 'parse': refusal, 'routes': 'not run (refused by the shared current parser)'})
            continue
        for name, route in table.items():
            try:
                accepted, expected = route(value)
            except Exception as exc:  # an untracked exception is never a refusal
                untracked.append({'value': text[:40], 'route': name, 'exception': repr(exc)[:200]})
                continue
            row = {'value': text[:40], 'kind': kind, 'route': name, 'accepted': accepted, 'expected': expected}
            rows.append(row)
            if accepted != expected:
                disagreements.append(row)
    runs = [r for r in rows if 'route' in r]
    report = {'schema_id': 'pm.ds.number_corpus.v1', 'status': 'pass' if not disagreements and not untracked else 'fail',
              'values': len(corpus_values()), 'parse_refusals': sum('parse' in r for r in rows),
              'route_runs': len(runs), 'accepted': sum(r['accepted'] for r in runs),
              'refused': sum(not r['accepted'] for r in runs), 'disagreements': disagreements, 'untracked': untracked,
              'routes': sorted(table), 'rows': rows,
              'scope': 'CV-1100/SP-1100 number values only; date-time (CV-1101) and SP-1101 dispatch are part 2B.'}
    if args.json:
        args.json.write_text(json.dumps(report, indent=1, default=str) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'rows'}, indent=1, default=str)[:3000])
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
