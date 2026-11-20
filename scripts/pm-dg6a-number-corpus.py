#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the complete DG6A checker routes.

Usage: python3 scripts/pm-dg6a-number-corpus.py [--family F]... [--json out.json]

Every number value of Plans/event_number_recipe_corpus.json in the number scope (the raw JSON
spellings of the token, parse, slot, current_json_slot, jcs and parse_token cases and the exact
integers of the integer, uint64, physical and jcs_value cases) is written as JSON text into a valid
DG6A input of each selected family, parsed by the checker's own raw ingress (pm-dg6a-domain.py
`loads`, which is the shared loads_current_json) and run through these routes:

- payload_slot: the family payload schema occurrence at its integer slot (the checker's exact
  validator, which admits integer slots with the shared current_integer and the slot's own bounds);
- checkpoint_through: the complete checkpoint_errors at checkpoint.through_sequence_id (a Storage
  sequence: SP-1100 uint64, and the checkpoint must still encode within 16384 bytes);
- history_cursor: the bounded read-through cursor/frontier rows (Storage uint64);
- producer_sequence: the EventRecord producer digest (CV-317) at producer_sequence_id, qualified
  with the shared producer_semantic_digest (type-sensitive at owner integer paths).

The expected outcome is composed from the shared helpers alone (loads_current_json, current_integer
with the slot's owner bounds, storage_uint64, qualified_jcs with the owner's type-sensitive path).
A route that raises instead of refusing is a disagreement. Date-time cases are out of scope (part 2B).
Exit 0 when every route agrees.
"""
import argparse
import copy
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_event_numbers import Refusal, current_integer, loads_current_json, qualified_jcs, storage_uint64  # noqa: E402
from pm_event_numbers_corpus import NUMBER_OPS  # noqa: E402

RAW_OPS = ('token', 'parse', 'slot', 'current_json_slot', 'jcs', 'parse_token')
VALUE_OPS = ('integer', 'uint64', 'physical', 'jcs_value')
MARKER = '__DG6A_corpus_number__'
CHECKERS = {'alert': 'pm-alert-event-contracts-check.py', 'panel': 'pm-panel-event-contracts-check.py',
            'concern': 'pm-concern-created-contracts-check.py', 'card5': 'pm-card5-event-contracts-check.py'}


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / filename)
    result = importlib.util.module_from_spec(spec)
    sys.modules[name] = result
    spec.loader.exec_module(result)
    return result


def corpus_values():
    doc = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    seen = {}
    for case in doc['cases']:
        if case['op'] not in NUMBER_OPS or 'date_time_profile' in case:
            continue
        spelling = None
        raw = case.get('raw')
        if case['op'] in RAW_OPS and type(raw) is str:
            if case['op'] == 'current_json_slot':
                try:
                    tree = json.loads(raw)
                    if case.get('path') == ['n', 0] and type(tree) is dict and list(tree) == ['n']:
                        spelling = raw[raw.index('[') + 1:raw.rindex(']')]
                except ValueError:
                    spelling = None
            else:
                spelling = raw
        elif case['op'] in VALUE_OPS and type(case.get('value')) is dict and set(case['value']) == {'@int'}:
            spelling = case['value']['@int']
        if spelling is not None:
            seen.setdefault(spelling, []).append(case['id'])
    return seen


def parsed(spelling):
    try:
        return True, loads_current_json(spelling)
    except Refusal:
        return False, None


def admitted(spelling, minimum=None, maximum=None, uint64=False):
    ok, value = parsed(spelling)
    if not ok:
        return False
    try:
        storage_uint64(value) if uint64 else current_integer(value, minimum=minimum, maximum=maximum)
    except Refusal:
        return False
    return True


def producer(spelling, path):
    ok, value = parsed(spelling)
    if not ok:
        return False
    tree = {}
    node = tree
    for key in path[:-1]:
        node = node.setdefault(key, {})
    node[path[-1]] = value
    try:
        qualified_jcs(tree, type_sensitive_paths={tuple(path)})
    except Refusal:
        return False
    return True


def with_spelling(loads, data, path, spelling):
    """(parsed, value): JSON text of data with the value at path spelled exactly, through the checker's raw ingress."""
    data = copy.deepcopy(data)
    node = data
    for key in path[:-1]:
        node = node[key]
    node[path[-1]] = MARKER
    text = json.dumps(data)
    assert text.count(json.dumps(MARKER)) == 1, path
    try:
        return True, loads(text.replace(json.dumps(MARKER), spelling))
    except ValueError:
        return False, None


def slot_of(schema):
    """The payload's own integer slot and its owner bounds (prior revisions, concern revision)."""
    for name in ('prior_revision', 'prior_host_revision', 'concern_revision'):
        node = schema.get('properties', {}).get(name)
        if node is not None:
            while '$ref' in node:
                target = schema
                for part in node['$ref'][2:].split('/'):
                    target = target[part]
                node = target
            if 'const' in node:  # a const integer slot admits exactly that integer
                return name, node['const'], node['const']
            return name, node.get('minimum'), node.get('maximum')
    return None, None, None


def family_routes(kind, m, family):
    """(route, data, path, run(data) -> bool, want(spelling) -> bool) for one family."""
    shared = m if kind == 'alert' else m.shared
    domain = shared.domain
    if kind == 'card5':
        fixture = m.load(family['fixture'])
        payload_schema = m.load(family['payload_schema'])
        cp_schema = m.load(family['checkpoint_schema'])
        payload = copy.deepcopy(fixture['bases']['payload'])
        checkpoint = copy.deepcopy(fixture['bases']['history']['request']['checkpoint'])
        context = fixture['bases']['history']['expected']['event']
        checkpoint_check = shared.checkpoint_errors
    else:
        folder = {'alert': 'alert_event_contracts', 'panel': 'panel_event_contracts', 'concern': 'concern_created_contracts'}[kind]
        slug = family['slug']
        fixture = m.load(f'Plans/{folder}/{slug}.fixtures.json')
        payload_schema = m.load(family['payload_schema'])
        cp_name = family.get('checkpoint') or 'concern_created_checkpoint'
        cp_schema = m.load(f'Plans/{folder}/{cp_name}.schema.json')
        if kind == 'alert':
            payload = copy.deepcopy(fixture['payload_cases'][0]['payload'])
            checkpoint = copy.deepcopy(fixture['checkpoint_cases'][0]['value'])
            context = fixture['operation_cases'][0]['value']
        else:
            operation = fixture['settled_operation']
            payload = copy.deepcopy(operation['payload'])
            checkpoint = copy.deepcopy(fixture['checkpoint'])
            context = operation
        checkpoint_check = m.checkpoint_errors
    out = []
    slot, lo, hi = slot_of(payload_schema)
    if slot is not None and slot in payload:
        validator = domain.validator(payload_schema)
        out.append(('payload_slot', payload, [slot],
                    lambda d: not list(validator.iter_errors(d)),
                    lambda s, lo=lo, hi=hi: admitted(s, lo, hi)))
    if 'through_sequence_id' in checkpoint:
        out.append(('checkpoint_through', checkpoint, ['through_sequence_id'],
                    lambda d: not checkpoint_check(d, cp_schema, context),
                    lambda s: admitted(s, uint64=True)))
    out.append(('history_cursor', dict(after=0, frontier=0), ['frontier'],
                lambda d: not shared.cursor_errors(d['frontier'], d['frontier']),
                lambda s: admitted(s, uint64=True)))
    record = dict(event_type=family['event_type'], scope_kind='project', project_id='fixture', thread_id=None, run_id=None,
                  node_id=None, attempt_id=None, actor_ref='pmref:test:fixture', requested_account_ref=None,
                  effective_account_ref=None, occurred_at_utc='2026-11-04T18:00:00Z', producer_sequence_id=1,
                  correlation_id='fixture', causation_event_id=None, parent_event_id=None, idempotency_key='fixture',
                  payload_schema_id='fixture', payload={}, payload_ref=None, redaction_profile='secret_refs_only', migration=None)

    def run_producer(d):
        try:
            shared.producer_digest(d)
        except ValueError:
            return False
        return True
    out.append(('producer_sequence', record, ['producer_sequence_id'], run_producer,
                lambda s: admitted(s, 0) and producer(s, ('producer_sequence_id',))))
    return out, domain.loads


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--family', action='append')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    values = corpus_values()
    results, failures, parents, families = [], [], [], []
    for kind, filename in CHECKERS.items():
        m = module('dg6a_corpus_' + kind, filename)
        manifest = {'alert': 'Plans/alert_event_contracts/manifest.json', 'panel': 'Plans/panel_event_contracts/manifest.json',
                    'concern': 'Plans/concern_created_contracts/manifest.json', 'card5': 'Plans/card5_event_contracts/manifest.json'}[kind]
        for family in m.load(manifest)['families']:
            name = family['event_type']
            if args.family and name not in args.family:
                continue
            families.append(name)
            routes, loads = family_routes(kind, m, family)
            for route, data, path, run, want in routes:
                parent_ok = run(copy.deepcopy(data))
                parents.append([name, route, parent_ok])
                if not parent_ok:
                    failures.append([name, route, 'parent_refused'])
                    continue
                for spelling, ids in sorted(values.items()):
                    ok, candidate = with_spelling(loads, data, path, spelling)
                    try:
                        got = run(candidate) if ok else False
                    except Exception as error:  # a crash is a disagreement, never a refusal
                        got = 'raised ' + type(error).__name__ + ': ' + str(error)[:80]
                    expected = want(spelling)
                    results.append([name, route, spelling[:40], expected, got])
                    if got != expected:
                        failures.append([name, route, spelling[:60], expected, got, ids[:3]])
    summary = {'status': 'pass' if not failures else 'fail', 'values': len(values), 'families': len(families),
               'route_runs': len(results), 'accepted': sum(1 for r in results if r[4] is True),
               'refused': sum(1 for r in results if r[4] is False), 'disagreements': len(failures),
               'failures': failures[:60], 'routes': sorted({r[1] for r in results})}
    if args.json:
        args.json.write_text(json.dumps(dict(summary, parents=parents, results=results), indent=1) + '\n')
    print(json.dumps(summary))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
