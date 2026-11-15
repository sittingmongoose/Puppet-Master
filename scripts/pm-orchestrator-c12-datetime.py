#!/usr/bin/env python3
"""Shared date-time input corpus through complete DO append boundaries.

This exercises the original lane's public date_time/FormatChecker adoption.
It does not admit frozen datetime_validator resources or override the global
inventory gate. That separate suite must report its own admission result.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

import pm_orchestrator_c12 as lane


def expected(value, profile):
    try:
        result = lane.o.date_time(value, profile=profile)
        assert type(result) is str and result == value
        return True, None
    except lane.o.Refusal as refusal:
        return False, refusal.reason


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    sources = lane.source_manifest()
    sources[str(Path(__file__).relative_to(lane.ROOT))] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    fixtures, schema = lane.load()
    corpus = json.loads((lane.ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    originals = [case for case in corpus['cases'] if case['op'] in ('datetime', 'datetime_direct')
                 and case.get('profile', lane.o.EVENT_RECORD) in (lane.o.EVENT_RECORD, lane.o.STORAGE_UTC_Z)]
    values = {}
    for case in originals:
        valid, reason = expected(case['value'], case.get('profile', lane.o.EVENT_RECORD))
        assert valid == ('output' in case), ('shared_fixture_outcome', case['id'], reason)
        if not valid:
            assert reason == case['error'], ('shared_fixture_code', case['id'], case['error'], reason)
        values.setdefault(lane.sha(case['value']), dict(value=case['value'], source_cases=[]))['source_cases'].append(case['id'])
    rows = []
    for base in fixtures['event_cases']:
        assert base['event']['payload_ref'] is None
        assert lane.o.event_errors(base, schema, lane.c.identity, lane.c.retry_allowed, lane.ROOT, lane.c.UTC_FORMAT) == []
        fields = [field for field, node in schema['$defs'][base['definition']]['properties'].items()
                  if node.get('format') == 'date-time']
        slots = [('payload', field, lane.o.EVENT_RECORD) for field in fields]
        slots += [('event', field, lane.o.STORAGE_UTC_Z) for field in lane.o.STORAGE_TIMESTAMP_FIELDS]
        for container, field, profile in slots:
            for datum in values.values():
                value = datum['value']
                valid, reason = expected(value, profile)
                case = copy.deepcopy(base)
                if container == 'payload':
                    case['logical_payload'][field] = value
                    case['event']['payload'] = copy.deepcopy(case['logical_payload'])
                    if field == 'occurred_at_utc':
                        case['event'][field] = value
                else:
                    case['event'][field] = value
                wanted = [] if valid else ['event_schema'] if container == 'event' else (
                    ['event_schema', 'logical_payload_schema'] if field == 'occurred_at_utc' else ['logical_payload_schema'])
                observed = lane.o.event_errors(case, schema, lane.c.identity, lane.c.retry_allowed, lane.ROOT, lane.c.UTC_FORMAT)
                assert observed == wanted, ('complete_datetime_boundary', base['case_id'], container, field,
                                            datum['source_cases'], wanted, observed)
                rows.append(dict(family=base['event_type'], case=base['case_id'], container=container, field=field,
                                 profile=profile, source_cases=datum['source_cases'], value_sha256=lane.sha(value),
                                 expected_codes=wanted, observed_codes=observed, shared_refusal=reason))
        print(json.dumps(dict(case=base['case_id'], checks=len(rows))), flush=True)
    lane.write(args.out / 'sources.json', sources)
    lane.write(args.out / 'observations.json', rows)
    lane.write(args.out / 'summary.json', dict(status='pass', shared_cases=len(originals), values=len(values),
        checks=len(rows), families=len({x['family'] for x in rows}), native='NOT_RUN',
        boundary='DO complete append via its original shared public date_time calls; global inventory admission remains separate'))
    for name, digest in sources.items():
        assert hashlib.sha256((lane.ROOT / name).read_bytes()).hexdigest() == digest, ('source_changed', name)


if __name__ == '__main__':
    main()
