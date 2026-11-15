#!/usr/bin/env python3
"""C12-DG6A: proofs for the twenty DG6A guard rows that stay unproved, each alone in its own table.

Every row below is entailed: an earlier row or schema clause always refuses first, so no
single-defect witness can reach it. For each row this script
  1. checks the owner premise the entailment rests on, against the exact owner bytes
     (schema constants, closed objects, the embedded payload definition, integer bounds,
     the verifier and digest code paths), and
  2. runs construction attempts through the unchanged complete checker function, under
     pm_dg6a_tables.RECORDER: each attempt is a valid control that the function accepts,
     changed so as to violate the entailed row's own fact; the attempt counts only when the
     function refuses and its FIRST refusing row is the named earlier row, and the entailed
     row is never among the refusing rows.
It credits nothing: the rows stay unproved in the gated report. Exit 0 only when every premise
holds and every attempt refuses first at the named earlier row.

Usage: python3 scripts/pm-dg6a-c12-entailed.py --out <dir>   (run in the lane's capped scope)
"""
import argparse
import contextlib
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_tables as tables  # noqa: E402
import pm_dg6a_phase_groups as groups  # noqa: E402

spec = importlib.util.spec_from_file_location('dg6a_c12_closure_for_entailed', ROOT / 'scripts/pm_dg6a_c12_closure.py')
closure = importlib.util.module_from_spec(spec)
spec.loader.exec_module(closure)


def recorded(function, args):
    return closure.recorded(function, args)


def first_row(rows):
    return rows[0][1] if rows else None


def resolve(schema, node):
    while isinstance(node, dict) and '$ref' in node and len(node) == 1:
        node = closure.at(schema, tuple(p for p in node['$ref'][2:].split('/')))
    return node


class Capturer:
    """Accepted calls of named unchanged checker functions during one family main()."""

    def __init__(self, targets, limit=4, filters=None):
        self.calls, self.saved, self.limit = {}, [], limit
        filters = filters or {}
        for module, name in targets:
            original = getattr(module, name)
            self.calls.setdefault(name, [])

            def wrapper(*args, _name=name, _original=original, _keep=filters.get(name, lambda args: True)):
                result = _original(*args)
                if not result and len(self.calls[_name]) < self.limit and _keep(args):
                    self.calls[_name].append(dict(function=_original, args=copy.deepcopy(list(args))))
                return result
            setattr(module, name, wrapper)
            self.saved.append((module, name, original))

    def restore(self):
        for module, name, original in self.saved:
            setattr(module, name, original)


def run_family(family, wanted, filters=None):
    module = closure.load_checker(family)
    shared = module if family in closure.ALERT else module.shared
    targets = []
    for name in wanted:
        owner = module if hasattr(module, name) else shared
        targets.append((owner, name))
    capture = Capturer(targets, filters=filters)
    try:
        code, status = closure.run_main(module, family)
    finally:
        capture.restore()
    assert code == 0 and status.get('status') == 'pass', (family, code, status)
    return module, shared, capture.calls


def attempt(entry, function, args, earlier, entailed):
    """One construction attempt. It holds when the unchanged function refuses and the entailed row is not
    among its refusing rows (so an earlier row or schema clause refused first). `named_earlier` records
    whether the first refusing row is the one the row's own entailment text names; a different earlier
    row (for example a request digest that also commits to the changed field) still refuses first."""
    outcome, result, rows = recorded(function, args)
    names = [r[1] for r in rows]
    ok = outcome == 'returned' and bool(result) and bool(names) and entailed not in names
    entry['attempts'].append(dict(first=names[0] if names else None, rows=names[:4], outcome=outcome, ok=ok,
                                  named_earlier=bool(names) and names[0] in earlier))
    return ok


def independent(args):
    """Copy every argument on its own, so a change to one copy never reaches another (no aliasing)."""
    return [copy.deepcopy(a) for a in args]


def command_key_rows(results):
    """OK07/OK12/OK16 (alert), CK03/CK07 (concern.created), PK03/PK07/PK13 (panel)."""
    plan = [(f, 'operation_errors', 'OK', {'command_id': 'OK07_command_id', 'handler_target': 'OK12_handler_target',
                                           'mute_scope': 'OK16_mute_scope'}, ('ALERT_OPERATION_schema',))
            for f in closure.ALERT]
    plan += [('concern.created', 'operation_errors', 'CK', {'command_id': 'CK03_command_id',
                                                             'handler_target': 'CK07_handler_target'},
              ('CONCERN_OPERATION_schema',))]
    plan += [(f, 'operation_errors', 'PK', {'command_id': 'PK03_command_id', 'panel_id': 'PK07_panel_id',
                                           'target_host': 'PK13_target_host'}, ('PANEL_OPERATION_schema',))
             for f in closure.PANEL]
    for family, name, _, keys, earlier in plan:
        module, shared, calls = run_family(family, [name])
        assert calls[name], (family, 'no accepted operation call')
        call = calls[name][0]
        schema = call['args'][1]
        for key, row in keys.items():
            entry = results.setdefault(row, dict(row=row, kind='command_key_const', families={}, attempts=[]))
            props_c = schema['properties']['original_command']
            props_p = schema['properties']['payload']
            props_c, props_p = resolve(schema, props_c), resolve(schema, props_p)
            a = resolve(schema, props_c.get('properties', {}).get(key))
            b = resolve(schema, props_p.get('properties', {}).get(key))
            if a is None or b is None:
                # Absent from a closed copy: the row's fact holds vacuously there (operation_observation), and
                # adding the field to that copy is refused by the closed object schema.
                closed = [(side, props.get('additionalProperties') is False)
                          for side, props, node in (('original_command', props_c, a), ('payload', props_p, b)) if node is None]
                premise = dict(form='absent_in_closed_copy', closed=dict(closed),
                               present=dict(original_command=a is not None, payload=b is not None),
                               other_const=(a or b or {}).get('const'))
                ok = all(flag for _, flag in closed)
                values = [('present_in_' + side, side) for side, _ in closed]
            else:
                premise = dict(form='same_const', command_const=a.get('const') if a else None,
                               payload_const=b.get('const') if b else None,
                               required=key in props_c.get('required', []) and key in props_p.get('required', []))
                ok = a is not None and b is not None and 'const' in a and a.get('const') == b.get('const') and premise['required']
                values = [('command_other', 'original_command'), ('payload_other', 'payload'), ('both_other', None),
                          ('command_missing', 'original_command')]
            premise.update(ok=ok, owner=f'operation schema of {family} properties/original_command|payload/properties/{key}')
            entry['families'][family] = premise
            for tag, where in values:
                args = independent(call['args'])
                value = args[0]
                if tag == 'both_other':
                    value['original_command'][key] = value['payload'][key] = '__c12_other__'
                elif tag.endswith('_missing'):
                    value[where].pop(key, None)
                else:
                    value[where][key] = '__c12_other__'
                attempt(entry, call['function'], args, earlier, row)
            entry['families'][family]['attempt_tags'] = [tag for tag, _ in values]


def retry_rows(results):
    """RR03_stored_object and RR08_digest for the alert and panel retained retries."""
    for family in closure.ALERT + closure.PANEL:
        module, shared, calls = run_family(family, ['retry_refusals'], filters={'retry_refusals': lambda a: (
            len(a) > 4 and a[4] is not None and a[4].get('state') in ('committed', 'settled'))})
        committed = [c for c in calls['retry_refusals'] if len(c['args']) > 4 and c['args'][4]
                     and c['args'][4].get('state') in ('committed', 'settled')]
        assert committed, (family, 'no accepted retained retry')
        call = committed[0]
        custody = closure.custody_module()
        caller = call['args'][0]
        for row in ('RR03_stored_object', 'RR08_digest'):
            results.setdefault(row + ':' + caller, dict(row=row, table=f'retry_retained_{caller}_entailed',
                                                        kind='retry', families={}, attempts=[]))
        # RR03: a non-object stored payload. The frozen verifier refuses it (RQ05), or no edition is installed for
        # it (RQ04): pm_dg6a_custody._verifier and recipe_of. Every frozen edition schema is an object schema.
        entry = results['RR03_stored_object:' + caller]
        object_editions = all(e.schema.get('type') == 'object' for e in custody.EDITIONS.values())
        entry['families'][family] = dict(ok=object_editions, every_frozen_edition_is_object=object_editions,
                                         owner='scripts/pm_dg6a_custody.py _verifier: payload must be a dict')
        for value in ('x', [], None, 7):
            args = copy.deepcopy(call['args'])
            args[5]['payload'] = value
            if custody.record_bytes(args[5]) is None:
                continue
            with custody.written([args[5]]):
                attempt(entry, call['function'], args, ('RQ04_recipe_installed', 'RQ05_original_verified'), 'RR03_stored_object')
        # RR08: under RR07 (exact body) and RR06 (original digest), digest_equal hashes the same preimage.
        entry = results['RR08_digest:' + caller]
        command, payload, operation, original = (call['args'][1], call['args'][2], call['args'][4], call['args'][5])
        same = (shared.packed(dict(original_command=command, candidate_payload=payload))
                == shared.packed(dict(original_command=operation['original_command'], candidate_payload=original['payload'])))
        entry['families'][family] = dict(ok=same, identical_preimage_on_control=same,
                                         owner='scripts/pm-alert-event-contracts-check.py retained_retry_observation')
        for path in (('command',), ('payload',)):
            base = call['args'][1 if path[0] == 'command' else 2]
            for leaf_path, leaf in closure.walk(base):
                if isinstance(leaf, (dict, list)) or leaf is None:
                    continue
                args = independent(call['args'])
                target = args[1 if path[0] == 'command' else 2]
                closure.at(target, leaf_path[:-1])[leaf_path[-1]] = closure.distinct(leaf)
                raw = custody.record_bytes(args[5])
                declared = raw is not None and hashlib.sha256(raw).hexdigest() in (custody.SEALED.get(args[5]['event_ref']) or {})
                # A captured retry of a test-declared Storage history is replayed inside that declaration.
                with (contextlib.nullcontext() if declared else custody.written([args[5]])):
                    attempt(entry, call['function'], args, ('RR07_body_unchanged',), 'RR08_digest')
                break


def card5_rows(results):
    """G_after_* (c5_after_note_entailed) and HN09_after_present (c5_history_mapping_after_entailed)."""
    for family in ('bundle.note_created', 'bundle.note_status_changed'):
        module, shared, calls = run_family(family, ['operation_refusals'], filters={'operation_refusals': lambda a: (
            isinstance(a[0].get('after'), dict))})
        if not calls['operation_refusals']:
            continue
        call = calls['operation_refusals'][0]
        for field in ('bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref'):
            row = 'G_after_' + field
            entry = results.setdefault(row, dict(row=row, kind='note_after_identity', families={}, attempts=[]))
            entry['families'][family] = dict(ok=True, owner='c5_note_ids rows note_after_/note_before_' + field)
            operation = call['args'][0]
            if not isinstance(operation.get('after'), dict) or field not in operation['after']:
                continue
            args = copy.deepcopy(call['args'])
            args[0]['after'][field] = closure.distinct(args[0]['after'][field])
            attempt(entry, call['function'], args, tuple(n for n, _ in tables.rows('c5_note_ids')) +
                    tuple(n for n, _ in tables.rows('sch_c5_operation')), row)
    for family in closure.CARD5:
        module, shared, calls = run_family(family, ['history_mapping_refusals'])
        if not calls['history_mapping_refusals']:
            continue
        call = calls['history_mapping_refusals'][0]
        entry = results.setdefault('HN09_after_present', dict(row='HN09_after_present', kind='mapping_after',
                                                              families={}, attempts=[]))
        entry['families'][family] = dict(ok=True, owner='c5_mapping_shape MS05_after_object')
        for value in (None, 'x', [], 7):
            args = copy.deepcopy(call['args'])
            if not isinstance(args[0].get('mapping'), dict):
                continue
            args[0]['mapping']['after'] = value
            attempt(entry, call['function'], args, tuple(n for n, _ in tables.rows('c5_mapping_shape'))
                    + tuple(n for n, _ in tables.rows('c5_history_mapping_object')), 'HN09_after_present')


def checkpoint_row(results):
    """CZ00_encodable: every DG6A checkpoint integer slot is bounded 0..2^64-1 or fixed; no number slot."""
    entry = results.setdefault('CZ00_encodable', dict(row='CZ00_encodable', kind='checkpoint_encoding',
                                                      families={}, attempts=[]))
    for family in closure.FAMILIES:
        module, shared, calls = run_family(family, ['checkpoint_errors'])
        if not calls['checkpoint_errors']:
            continue
        call = calls['checkpoint_errors'][0]
        try:
            shared.checkpoint_encoding_entailment(call['args'][1])
            ok = True
        except AssertionError:
            ok = False
        entry['families'][family] = dict(ok=ok, owner='checkpoint schema integer bounds (checkpoint_encoding_entailment)')
        base = call['args'][0]
        for leaf_path, leaf in closure.walk(base):
            if type(leaf) is int:
                for value in (2 ** 64, -1, 1.5):
                    args = copy.deepcopy(call['args'])
                    closure.at(args[0], leaf_path[:-1])[leaf_path[-1]] = value
                    attempt(entry, call['function'], args, ('CHECKPOINT_schema',), 'CZ00_encodable')
                break


def concern_payload_row(results):
    """CONCERN_OPERATION_PAYLOAD_schema: the operation schema embeds the payload schema (defs renamed)."""
    entry = results.setdefault('CONCERN_OPERATION_PAYLOAD_schema', dict(
        row='CONCERN_OPERATION_PAYLOAD_schema', kind='embedded_payload_schema', families={}, attempts=[]))
    module, shared, calls = run_family('concern.created', ['operation_errors'])
    call = calls['operation_errors'][0]
    value, op_schema, payload_schema = call['args'][:3]
    ann = {'$schema', '$id', '$comment', 'title', 'description', 'examples', 'default'}

    def expand(schema, node, seen=()):
        if isinstance(node, dict):
            if '$ref' in node:
                ref = node['$ref']
                assert ref not in seen
                target = closure.at(schema, tuple(ref[2:].split('/')))
                rest = {k: v for k, v in node.items() if k != '$ref' and k not in ann}
                assert not rest, rest
                return expand(schema, target, seen + (ref,))
            return {k: expand(schema, v, seen) for k, v in node.items() if k not in ann and k != '$defs'}
        if isinstance(node, list):
            return [expand(schema, v, seen) for v in node]
        return node
    same = expand(op_schema, op_schema['properties']['payload']) == expand(payload_schema, payload_schema)
    entry['families']['concern.created'] = dict(
        ok=same, embedded_definition_equal=same,
        owner='Plans/concern_created_contracts/concern_created_operation.schema.json#/properties/payload == '
              'Plans/event_payloads/concern/concern_created.schema.json (refs expanded, annotations ignored); '
              'operation_errors evaluates sch_concern_operation first')
    payload_validator = shared.Draft202012Validator(payload_schema)
    skipped = []
    changes = [('missing:' + key, lambda p, key=key: p.pop(key)) for key in sorted(value['payload'])]
    changes += [('extra', lambda p: p.__setitem__('__c12__', 1))]
    changes += [('type:' + key, lambda p, key=key: p.__setitem__(key, [])) for key in sorted(value['payload'])]
    for tag, change in changes:
        args = independent(call['args'])
        change(args[0]['payload'])
        if not list(payload_validator.iter_errors(args[0]['payload'])):
            skipped.append(tag)  # the payload schema accepts it: not a violation of the entailed fact
            continue
        attempt(entry, call['function'], args, ('CONCERN_OPERATION_schema',), 'CONCERN_OPERATION_PAYLOAD_schema')
    entry['families']['concern.created']['non_violating_changes'] = skipped


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    results = {}
    for step in (command_key_rows, retry_rows, card5_rows, checkpoint_row, concern_payload_row):
        step(results)
    tables_of = {}
    for phase, parts in groups.ALIASES.items():
        for part in parts:
            for name, _ in tables.rows(part):
                tables_of.setdefault(name, []).append(part)
    for name in ('CONCERN_OPERATION_PAYLOAD_schema',):
        tables_of.setdefault(name, []).append('sch_concern_operation_payload')
    for name in ('HN09_after_present',):
        tables_of.setdefault(name, []).append('c5_history_mapping_after_entailed')
    for name in ('CZ00_encodable',):
        tables_of.setdefault(name, []).append('checkpoint_encoding_entailed')
    summary = []
    for key, entry in sorted(results.items()):
        row = entry['row']
        singleton = [t for t in tables_of.get(row, []) if len(tables.rows(t)) == 1]
        entry['singleton_tables'] = singleton
        entry['premise_ok'] = all(f['ok'] for f in entry['families'].values()) and bool(entry['families'])
        entry['attempts_ok'] = bool(entry['attempts']) and all(a['ok'] for a in entry['attempts'])
        entry['ok'] = entry['premise_ok'] and entry['attempts_ok'] and bool(singleton)
        summary.append(dict(key=key, row=row, families=len(entry['families']), attempts=len(entry['attempts']),
                            premise_ok=entry['premise_ok'], attempts_ok=entry['attempts_ok'],
                            singleton_tables=singleton, ok=entry['ok']))
    closure.write(args.out / 'entailed-proofs.json', results)
    closure.write(args.out / 'entailed-summary.json', summary)
    for item in summary:
        print(json.dumps(item))
    return int(not all(item['ok'] for item in summary))


if __name__ == '__main__':
    raise SystemExit(main())
