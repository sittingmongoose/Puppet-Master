#!/usr/bin/env python3
"""Red-first cases for the settlement (lead 1124045917, fix round 1) and the live-text rule (N1).

(i)   :923 WITH the record            CREDIT
(ii)  :923 WITHOUT the record         PENDING_READ
(iii) a LATER unlisted material NOT_SOUND  PENDING_READ (revoked)
(iv)  an UNLISTED EARLIER material NOT_SOUND  PENDING_READ (revoked; N5)
(v)   a changed proof-text sha        PENDING_READ (settlement void; N1 for a document)
(vi)  a changed module proof text     credit_decision refuses the old reads (N1)
"""
import copy
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_dg5_proof_reviews as reviews  # noqa: E402

ENTRY = 'cycle2-audit-20261124/rewrites/pm_goal_dg_ca3_route_923.md dg5/site/pm_goal_dg_ca3_route.py:923'
FAMILY = 'goal.cancelled'
MODULE_ENTRY = 'scripts/pm_goal_dg5_proofs_ca.py dg5/site/pm_goal_dg_ca3_index.py:218'


def inject(readings, when, path):
    out = copy.deepcopy(readings)
    out.append(dict(review_path=path, reader='TEST-INJECTED', mark='NOT_SOUND', verdict='NOT_SOUND',
                    material=True, family=FAMILY, families=[FAMILY], text_sha=None,
                    of_live_text=True, read_at=when, read_at_source='test injection (constructed)'))
    return out


def main():
    registry = reviews.load()
    entry = registry['entries'][ENTRY]
    settlement = reviews._settlement_for(registry, FAMILY, entry['row'], entry['text_sha'])
    results = []

    def run(name, reads, sha, sett, expect):
        deps = list(entry.get('depends_on') or ())
        decision = reviews.decide(FAMILY, reads, sha, sett, None, ENTRY,
                                  depends_on=deps, closed_rows=set(deps),
                                  depends_on_recorded=entry.get('depends_on_recorded', True))
        results.append(dict(case=name, status=decision['status'], reason=decision['reason'],
                            expect=expect, ok=decision['status'] == expect))

    run('i-with-record', entry['readings'], entry['text_sha'], settlement, 'CREDIT')
    run('ii-without-record', entry['readings'], entry['text_sha'], None, 'PENDING_READ')
    later = inject(entry['readings'], '2026-11-24T06:00:00Z', 'reviews/TEST-INJECTED-later/REVIEW.json')
    for reading in later:
        if reading.get('review_path', '').startswith('reviews/TEST-INJECTED-later'):
            reading['text_sha'] = entry['text_sha']
    run('iii-later-unlisted-not-sound', later, entry['text_sha'], settlement, 'PENDING_READ')
    earlier = inject(entry['readings'], '2026-11-24T02:00:00Z', 'reviews/TEST-INJECTED-earlier/REVIEW.json')
    for reading in earlier:
        if reading.get('review_path', '').startswith('reviews/TEST-INJECTED-earlier'):
            reading['text_sha'] = entry['text_sha']
    run('iv-earlier-unlisted-not-sound', earlier, entry['text_sha'], settlement, 'PENDING_READ')
    run('v-changed-document-text', entry['readings'], '0' * 64, settlement, 'PENDING_READ')

    module_entry = registry['entries'][MODULE_ENTRY]
    live = module_entry['text_sha']
    changed = dict(module_entry, argument=(module_entry.get('argument') or '') + ' (edited)')
    decision = reviews.credit_decision(FAMILY, module_entry['row'], changed, registry, closed_rows=set())
    results.append(dict(case='vi-changed-module-text', status=decision['status'], reason=decision['reason'],
                        expect='PENDING_READ', ok=decision['status'] == 'PENDING_READ'))
    print(__import__('json').dumps(dict(entry=ENTRY, settlement=settlement['id'],
                                       decision=settlement['decision'], results=results), indent=1))
    return 0 if all(r['ok'] for r in results) else 1


if __name__ == '__main__':
    raise SystemExit(main())
