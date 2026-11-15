#!/usr/bin/env python3
"""Replay one original DG6B family and its complete-boundary clause inventory."""
import argparse
import hashlib
import json
from pathlib import Path

import pm_dg6b_guard_suites as suites
import pm_dg6b_c12_custody as custody
import pm_dg6b_c12_schema as clauses
import pm_dg6b_c12_datetime as timestamps
import pm_dg6b_c12_receipts as receipts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    dg = suites.dg
    args.out.mkdir(parents=True, exist_ok=True)
    original = dg.run(family=args.family)
    (args.out / 'original-suite.json').write_text(json.dumps(original, indent=1) + '\n')
    schema = dg.load_plan('Plans/dg6b_event_contracts.schema.json')
    row = next(r for r in dg.load_plan('Plans/dg6b_event_contract_fixtures.json')['families']
               if r['event_type'] == args.family)
    summary = clauses.run(vars(dg), row, schema)
    datetime_result = timestamps.run(vars(dg), row, schema)
    (args.out / 'datetime-corpus.json').write_text(json.dumps(datetime_result, indent=1) + '\n')
    result = clauses.RESULTS[args.family]
    result['summary'] = summary
    sources = ['scripts/pm-dg6b-event-contracts.py', 'scripts/pm_dg6b_full_oracles.py',
               'scripts/pm_dg6b_c12_schema.py', 'scripts/pm_dg6b_c12_custody.py',
               'scripts/pm_dg6b_original_custody.py', 'scripts/pm_guard_isolation.py',
               'scripts/pm_event_numbers.py', 'scripts/pm_event_datetime.py',
               'Plans/dg6b_event_contracts.schema.json', 'Plans/dg6b_event_contract_fixtures.json',
               'Plans/shared_integration_runtime.schema.json', 'Plans/event_record.schema.json',
               'Plans/event_record_index_checkpoint.schema.json']
    sources = sorted(set(sources) | set(dg.custody_store.FROZEN_RESOURCES) |
                     {str(p.relative_to(suites.ROOT)) for p in (suites.ROOT / 'scripts').glob('pm_dg6b*.py')} |
                     {'scripts/pm-dg6b-c12.py', 'scripts/pm-dg6b-guard-tables.py'})
    result['source_hashes'] = {p: hashlib.sha256((suites.ROOT / p).read_bytes()).hexdigest() for p in sources}
    (args.out / 'coverage.json').write_text(json.dumps(result, indent=1, sort_keys=True) + '\n')
    (args.out / 'retained-observations.json').write_text(json.dumps(custody.OBSERVATIONS, indent=1) + '\n')
    (args.out / 'receipt-observations.json').write_text(json.dumps(receipts.OBSERVATIONS, indent=1) + '\n')
    print(json.dumps(summary, sort_keys=True))


if __name__ == '__main__':
    main()
