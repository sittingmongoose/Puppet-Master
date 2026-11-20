#!/usr/bin/env python3
"""C12-DCW retained-read observations against the sealed DCW original store.

Each observation runs the unchanged complete DCW checker on an authored
accepting retained-read control (read, rebuild, compatibility_read, retry) and
on one store or caller defect at a time. The sealed store is
`pm_dcw_number_custody._ISSUED` plus its installed `_RECIPES`, the only state
the shared RetainedDispatcher consults. A full snapshot of both is taken
immediately before and after every read; the caller's scenario is compared too.
A read must leave both unchanged, must never create or restamp a receipt, and a
missing, ambiguous or foreign original must refuse with the exact named row and
code below. The store stands for the native Storage/owner adapter, which stays
NOT_RUN.
"""
import argparse
import copy
import dataclasses
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_event_oracles as m
import pm_dcw_number_custody as custody
import pm_dcw_guard_suites as suites
import pm_event_numbers as numbers

FAMILIES = ('bundle.revision_requested', 'bundle.revision_started', 'bundle.revision_completed',
            'bundle.revision_interrupted', 'wizard.opened', 'wizard.deferred_payload.loaded',
            'wizard.blocked', 'wizard.unblocked')
RETAINED = ('read', 'rebuild', 'compatibility_read', 'retry')
BLOCKAGE = ('wizard.blocked', 'wizard.unblocked')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def plain(value):
    if dataclasses.is_dataclass(value):
        return {f.name: plain(getattr(value, f.name)) for f in dataclasses.fields(value)}
    if isinstance(value, bytes):
        return {'sha256': sha(value), 'length': len(value)}
    if isinstance(value, (list, tuple)):
        return [plain(v) for v in value]
    if isinstance(value, dict):
        return {str(k): plain(v) for k, v in value.items()}
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return repr(value)


def store_snapshot():
    """Every sealed original and installed recipe, with byte digests."""
    issued = {key: plain(entry) for key, entry in sorted(custody._ISSUED.items())}
    recipes = sorted(json.dumps(plain(r), sort_keys=True) for r in custody._RECIPES)
    body = dict(issued=issued, recipes=recipes)
    return body, sha(json.dumps(body, sort_keys=True).encode())


def caller_digest(value):
    return sha(json.dumps(value, sort_keys=True, default=repr).encode())


def controls(family):
    chosen = {}
    for w in suites.witnesses(family):
        if w['expected'] != 'accept' or w.get('kind') is not None or w['operation'] not in RETAINED:
            continue
        chosen.setdefault(w['operation'], w)
    return [chosen[op] for op in RETAINED if op in chosen]


def references(w):
    """The sealed references the dispatcher is asked for during this accepting read."""
    seen = []
    original = custody.Owner.authenticated_original

    def spy(self, reference):
        seen.append(reference)
        return original(self, reference)
    custody.Owner.authenticated_original = spy
    try:
        assert suites.invoke(w) == 'accept', w['id']
    finally:
        custody.Owner.authenticated_original = original
    return seen


def target_event(w):
    value = w['value']
    event = value['event']
    if w['operation'] == 'compatibility_read':
        event = value['authority']['events'][event['event_id']]
    return event


DEFECTS = ('accepted', 'missing-receipt', 'ambiguous-receipt', 'other-original', 'unknown-recipe',
           'tampered-original', 'receipt-for-other-original', 'withdrawn', 'revoked')


def expected(family, operation, defect):
    blockage = family in BLOCKAGE
    if defect == 'accepted':
        return ['accept', None]
    if defect in ('missing-receipt', 'ambiguous-receipt'):
        return ['original_authority', 'N001']
    if defect == 'other-original':
        return ['original_binding', 'N001']
    if defect == 'unknown-recipe':
        return ['recipe_unknown', 'N001']
    if defect == 'tampered-original':
        return ['original_verification', 'N001']
    if defect == 'receipt-for-other-original':
        return ['receipt_event_sequence', 'O039']
    if defect == 'withdrawn':
        return ['reader_withdrawn', 'B074' if blockage else 'O179']
    if defect == 'revoked':
        return ['read_permission', 'B030'] if blockage else ['permission_or_deleted_source', 'O172']
    raise KeyError(defect)


def applicable(operation, defect):
    # Withdrawal and read permission are reader-boundary rows; retry is a writer-side replay.
    return not (operation == 'retry' and defect in ('withdrawn', 'revoked'))


def apply_defect(w, defect, refs):
    """Return (witness, store restore callback). Store edits model the sealed store's state."""
    w = dict(w, value=copy.deepcopy(w['value']))
    event = target_event(w)
    ref = next((r for r in refs if r.startswith(event['event_id'] + '@')), None)
    assert ref is not None, (w['id'], refs)
    saved = dict(custody._ISSUED)

    def restore():
        custody._ISSUED.clear()
        custody._ISSUED.update(saved)
    entry = custody._ISSUED[ref]
    if defect == 'missing-receipt':
        del custody._ISSUED[ref]
    elif defect == 'ambiguous-receipt':
        other = dataclasses.replace(entry, result_bytes=entry.result_bytes + b'\x00')
        custody._ISSUED[ref] = (entry, other)
    elif defect == 'other-original':
        custody._ISSUED[ref] = dataclasses.replace(
            entry, binding=dataclasses.replace(entry.binding, event_id=entry.binding.event_id[:-8] + 'ffffffff'))
    elif defect == 'unknown-recipe':
        custody._ISSUED[ref] = dataclasses.replace(
            entry, recipe=dataclasses.replace(entry.recipe, producer_recipe='c12-uninstalled-recipe'))
    elif defect == 'tampered-original':
        result = numbers.decode_storage_value(entry.result_bytes, profile=numbers.EVENT_VALUE)
        result['producer_semantic_digest'] = '0' * 64
        custody._ISSUED[ref] = dataclasses.replace(
            entry, result_bytes=numbers.storage_value_bytes(result, profile=numbers.EVENT_VALUE))
    elif defect == 'receipt-for-other-original':
        value = w['value']
        authority = value['authority']
        others = [k for k in authority['custody'] if k != event['event_id']]
        if others:
            foreign = copy.deepcopy(authority['custody'][others[0]]['first_append_receipt'])
        else:
            # The sealed receipt of another original: same store, another event identity and frame.
            foreign = copy.deepcopy(authority['custody'][event['event_id']]['first_append_receipt'])
            foreign['event_id'] = foreign['event_id'][:-8] + 'ffffffff'
            foreign['sequence_id'] = foreign['sequence_id'] + 1
        authority['custody'][event['event_id']]['first_append_receipt'] = foreign
        for slot in slots(value):
            if type(slot.get('prepared_event')) is dict and slot['prepared_event'].get('event_id') == event['event_id']:
                slot['first_append_receipt'] = copy.deepcopy(foreign)
    elif defect == 'withdrawn':
        w['value']['control']['reader_withdrawn'] = True
    elif defect == 'revoked':
        w['value']['authority']['readable_projects'] = []
    return w, restore


def slots(value):
    source = value['source']
    result = list(source['phases']) if 'phases' in source else [source]
    result += list(value['authority'].get('sources', {}).values())
    if 'opened_source' in value['authority']:
        result.append(value['authority']['opened_source'])
    return [s for s in result if type(s) is dict]


def observe(family):
    results = []
    for control in controls(family):
        refs = references(control)
        for defect in DEFECTS:
            if not applicable(control['operation'], defect):
                continue
            w, restore = apply_defect(control, defect, refs) if defect != 'accepted' else (dict(control, value=copy.deepcopy(control['value'])), lambda: None)
            try:
                if w is None:
                    results.append(dict(family=family, operation=control['operation'], control=control['id'], case=defect,
                                        status='NOT_APPLICABLE', reason='no other original in this control'))
                    continue
                before, before_sha = store_snapshot()
                caller_before = caller_digest(w['value'])
                try:
                    outcome = [suites.invoke(w), None]
                except m.Refusal as exc:
                    outcome = [str(exc), getattr(exc, 'guard', None)]
                after, after_sha = store_snapshot()
                caller_after = caller_digest(w['value'])
            finally:
                restore()
            want = expected(family, control['operation'], defect)
            row = dict(family=family, operation=control['operation'], control=control['id'], case=defect,
                       outcome=outcome, expected=want, exact=outcome == want,
                       store_before_sha256=before_sha, store_after_sha256=after_sha,
                       store_unchanged=before == after, caller_unchanged=caller_before == caller_after,
                       sealed_references=sorted(refs), store_entries=len(before['issued']),
                       installed_recipes=len(before['recipes']))
            if defect == 'accepted':
                row['store_snapshot'] = before
            results.append(row)
            assert row['store_unchanged'] and row['caller_unchanged'], row
            assert row['exact'], row
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=FAMILIES, action='append')
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    everything = []
    for family in args.family or FAMILIES:
        observed = observe(family)
        everything.extend(observed)
        print(family, len(observed), sum(r.get('exact', False) for r in observed), flush=True)
    summary = dict(status='pass', observations=len(everything),
                   exact=sum(r.get('exact', False) for r in everything),
                   not_applicable=sum(r.get('status') == 'NOT_APPLICABLE' for r in everything),
                   store_unchanged=all(r.get('store_unchanged', True) for r in everything),
                   caller_unchanged=all(r.get('caller_unchanged', True) for r in everything),
                   native='NOT_RUN')
    (args.out / 'retained-store.json').write_text(json.dumps(everything, indent=1, sort_keys=True, default=repr) + '\n')
    (args.out / 'retained-summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True) + '\n')
    print(json.dumps(summary, sort_keys=True))


if __name__ == '__main__':
    main()
