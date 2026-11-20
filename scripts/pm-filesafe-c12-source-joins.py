#!/usr/bin/env python3
"""DF C12: independent caller/selected-source copy cuts on every family/scope."""
import argparse
import copy
import hashlib
from pathlib import Path

import pm_filesafe_c12_closure as X
import pm_filesafe_guard_suites as S


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    ledger = []
    controls, negatives = {}, {}
    for row in X.A.load('Plans/filesafe_event_authority_fixtures.json')['families']:
        family = row['event_type']
        for index, seed in enumerate(row['positive'][:2]):
            candidate, bank = copy.deepcopy((seed['candidate'], seed['bank']))
            source = candidate['source']
            assert X.A.selected_source_failures(family, source, bank) == []
            control = f'{family}/{index}/original'
            controls[control] = dict(id=control, value={'exact_equal': True}, family=family)
            for which in ('caller_only', 'selected_store_only'):
                candidate, bank = copy.deepcopy((seed['candidate'], seed['bank']))
                source = candidate['source']
                changed = source if which == 'caller_only' else bank['sources'][source['source_ref']]
                changed['original_request']['operation_id'] += '-independent-copy'
                changed['accepted_source_sha256'] = X.A.source_commitment(changed)
                action = lambda: X.A.selected_source_failures(family, source, bank)
                before = X.digest(bank)
                outcome, records = S.recorded(action)
                first = next(r for r in records if r[2])
                exact = outcome == ['selected_source_join'] and first[0] == 'selected_source_join' and first[2] == (('SS04_join', 'selected_source_join'),)
                flip = S.complete_boundary_flip(action, 'selected_source_join', 'SS04_join')
                restored = action()
                after = X.digest(bank)
                entry = dict(id=f'{family}/{index}/{which}', family=family, scope=source['original_request']['scope']['scope_kind'],
                             copy=which, expected='selected_source_join', outcome=outcome,
                             first=[first[0], first[2]], cut=flip, restored=restored,
                             before=before, after=after,
                             status='KILLED_EXPECTED' if exact and flip == 'accepted' and restored == ['selected_source_join'] and before == after else 'INVALID')
                ledger.append(entry)
                negatives[entry['id']] = dict(id=entry['id'], value=first[1], target='SS04_join',
                                              code='selected_source_join', control=control,
                                              family=family, defect=which, aliases=[], flips=[flip])
    slot = dict(controls=controls, negatives=negatives)
    suite = S.suite_for('selected_source_join', slot)
    report = S.g.run(suite, memory=S.g.MemoryGate(1400, 12, 13, 30, 2700))
    X.write(args.out / 'gated-source-join.json', report)
    summary = dict(ledger=ledger, attempts=len(ledger),
                   killed=sum(r['status'] == 'KILLED_EXPECTED' for r in ledger),
                   invalid=sum(r['status'] == 'INVALID' for r in ledger),
                   gated_status=report['status'],
                   tool_sha256=hashlib.sha256((X.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest(),
                   source_sha256=hashlib.sha256((X.ROOT / 'scripts/pm_filesafe_table_selected_source_join.py').read_bytes()).hexdigest())
    X.write(args.out / 'source-join-ledger.json', summary)
    print({k: v for k, v in summary.items() if k != 'ledger'}, flush=True)
    return int(summary['invalid'] != 0 or report['status'] != 'PASS')


if __name__ == '__main__':
    raise SystemExit(main())
