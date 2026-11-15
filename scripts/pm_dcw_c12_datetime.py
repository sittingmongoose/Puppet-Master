#!/usr/bin/env python3
"""C12-DCW date-time inventory and corpus at every real DCW timestamp boundary.

Inventory: every `format: date-time` clause reachable from each real
check_schema site a family uses (from the authored complete-path controls), and
every direct shared `pm_event_datetime.date_time` call in the DCW checkers.
Corpus: each of the 653 shared battery samples is placed at each date-time
instance field of each site control and decided by the real check_schema call
in the site's own historical/current mode. The expected verdict is the shared
`date_time(sample, profile)` call under the field's owner profile (EventRecord;
Storage-assigned observed_at_utc/persisted_at_utc add storage_utc_z), combined
with the field's other owner clauses. No profile is chosen from the input.
"""
import argparse
import ast
import copy
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_c12 as c12
import pm_dcw_event_oracles as m
import pm_event_datetime as dt

STORAGE_FIELDS = ('observed_at_utc', 'persisted_at_utc')
PROBE = '2026-08-07T24:00:00Z'
CHECKERS = ('scripts/pm_dcw_event_oracles.py', 'scripts/pm_bundle_revision_events.py',
            'scripts/pm_dcw_blockage_events.py', 'scripts/pm_dcw_number_custody.py',
            'scripts/pm_dcw_registered_schemas.py')


def code_sites():
    rows = []
    for path in CHECKERS:
        tree = ast.parse((ROOT / path).read_text())
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                name = node.func.attr if isinstance(node.func, ast.Attribute) else getattr(node.func, 'id', None)
                if name == 'date_time':
                    rows.append(dict(path=path, line=node.lineno, call=ast.unparse(node), sha256=c12.pin(path)))
    return rows


def field_profile(key, parts):
    path, definition, _ = key
    storage = (path == c12.ENVELOPE and definition is None and len(parts) == 1 and parts[0] in STORAGE_FIELDS)
    return dt.STORAGE_UTC_Z if storage else dt.EVENT_RECORD


def shared_verdict(value, profile):
    try:
        return dt.date_time(value, profile=profile) == value
    except dt.Refusal:
        return False


def datetime_fields(site, value):
    """Instance string locations governed by a date-time format clause at this site."""
    found = []
    for parts, original in c12.locations(value):
        if not isinstance(original, str):
            continue
        clauses = c12.mirror_errors(site, c12.replaced(value, parts, PROBE))
        formats = [c for c in clauses if c[2] == 'format' and node(site, c).get('format') == 'date-time']
        if formats:
            found.append((parts, sorted(set(formats))))
    return found


def node(site, clause):
    source, ptr, _ = clause
    target = site['docs'].get(source)
    if target is None:
        return {}
    for part in ptr.split('/')[1:]:
        part = part.replace('~1', '/').replace('~0', '~')
        target = target[int(part)] if isinstance(target, list) else target[part]
    return target


def audit(family, samples):
    sites, _ = c12.controls_for(family)
    inventory, corpus, mismatches = [], Counter(), []
    for key in sorted(sites, key=repr):
        path, definition, historical = key
        site = c12.mirror(path, definition, historical)
        site.update(path=path, definition=definition)
        for control in sites[key][:1]:
            value = control['value']
            for parts, clauses in datetime_fields(site, value):
                profile = field_profile(key, parts)
                entry = dict(family=family, schema=path, definition=definition, historical=historical,
                             instance_path=list(parts), profile=profile, clauses=[list(c) for c in clauses],
                             control=control['witness'], original=c12.at(value, parts))
                accepted = refused = 0
                for sample in samples:
                    changed = c12.replaced(value, parts, sample)
                    actual = c12.real(path, definition, historical, changed)
                    other = [c for c in c12.mirror_errors(site, changed) if c[2] != 'format' and c != c12.STORAGE_CLAUSE]
                    want_accept = shared_verdict(sample, profile) and not other
                    got_accept = actual == ['accepted']
                    if actual[0] == 'ERROR' or want_accept != got_accept or (not got_accept and actual != c12.EXPECTED):
                        mismatches.append(dict(entry, sample=sample, actual=actual, shared=shared_verdict(sample, profile),
                                               other=[list(c) for c in other]))
                    accepted += got_accept
                    refused += not got_accept
                entry.update(samples=len(samples), accepted=accepted, refused=refused)
                corpus[profile] += len(samples)
                inventory.append(entry)
    return inventory, corpus, mismatches


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', choices=c12.FAMILIES, action='append')
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    battery = json.loads((ROOT / 'scripts/pm_event_datetime_timestamp_battery.json').read_text())
    samples = [s['value'] for s in battery['samples']]
    everything, totals, failures = [], Counter(), []
    for family in args.family or c12.FAMILIES:
        inventory, corpus, mismatches = audit(family, samples)
        everything.extend(inventory)
        totals.update(corpus)
        failures.extend(mismatches)
        print(family, len(inventory), 'fields', sum(corpus.values()), 'checks', len(mismatches), 'mismatches', flush=True)
    (args.out / 'datetime-inventory.json').write_text(json.dumps(everything, indent=1, sort_keys=True, default=repr) + '\n')
    summary = dict(status='pass' if not failures else 'fail', fields=len(everything),
                   checks_by_profile=dict(totals), mismatches=len(failures), battery_samples=len(samples),
                   battery_sha256=c12.pin('scripts/pm_event_datetime_timestamp_battery.json'),
                   code_sites=code_sites(), shared_helper_sha256=c12.pin('scripts/pm_event_datetime.py'),
                   acknowledged_at_utc=sorted({(e['schema'], str(e['definition']), e['historical'], e['profile'])
                                               for e in everything if e['instance_path'][-1:] == ['acknowledged_at_utc']}, key=repr))
    (args.out / 'datetime-inventory.json').write_text(json.dumps(everything, indent=1, sort_keys=True, default=repr) + '\n')
    (args.out / 'datetime-mismatches.json').write_text(json.dumps(failures[:500], indent=1, sort_keys=True, default=repr) + '\n')
    (args.out / 'datetime-summary.json').write_text(json.dumps(summary, indent=1, sort_keys=True, default=list) + '\n')
    print(json.dumps({k: v for k, v in summary.items() if k != 'code_sites'}, sort_keys=True, default=list))
    raise SystemExit(0 if not failures else 1)


if __name__ == '__main__':
    main()
