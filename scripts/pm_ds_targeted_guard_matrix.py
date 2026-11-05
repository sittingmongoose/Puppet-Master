#!/usr/bin/env python3
"""Run both DS regression cohorts together; shared source predicates own all their cases."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import pm_event_authority_ds_round2 as boundary
import pm_event_authority_ds_round3 as round3

# These names refer to the exact same predicates, not unrelated guards.
SHARED = {
    'browser_writer_replay_policy': 'browser_current_replay_and_producer_sequence',
    'current_writer_producer_sequence': 'browser_current_replay_and_producer_sequence',
    **{'browser_historical_authenticity:' + family: 'history_flags:' + family
       for family in ('browser.workspace.created', 'browser.workspace.reset')},
}


def build():
    combined = boundary.Suite()
    for suite in (boundary.build(), round3.build()):
        combined.positives.extend(suite.positives)
        combined.negatives.extend((name, SHARED.get(guard, guard), fn) for name, guard, fn in suite.negatives)
        for guard, weakener in suite.weakeners.items():
            combined.weakeners.setdefault(SHARED.get(guard, guard), weakener)
    assert len({name for name, _, _ in combined.negatives}) == len(combined.negatives)
    return combined


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    result = build().run()
    result['schema_id'] = 'pm.ds.combined_targeted_guard_matrix.v1'
    result['shared_source_predicates'] = SHARED
    result['composition_source_sha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: result[k] for k in ('status', 'positive_count', 'negative_count', 'guard_removal_complete', 'failures')}, indent=2))
    return result['status'] != 'pass' or not result['guard_removal_complete']


if __name__ == '__main__':
    raise SystemExit(main())
