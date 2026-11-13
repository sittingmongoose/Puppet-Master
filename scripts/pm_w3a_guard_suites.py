"""W3A guard-table witness collection for the gated shared tool (scripts/pm_guard_isolation.py, 004bdedd63).

Collection only (it imports the checker); the tool runs in lean worker
processes (scripts/pm_w3a_guard_lean.py) that import only the engine and the
table under test, so the tool's per-run certification walks a small module set. Every case of the W3A complete checker (scripts/pm_w3a_forge_events.py,
35 families x two scopes) runs once under the checker's observation recorder.
An accepted table evaluation is a control of that table; a refused evaluation
gives its first refusing row as the negative's target. Negatives whose
observation fails more than that one row are reported by the lane matrix and
excluded from tool proof; they stay refused in the complete checker. Nothing
here decides a checker result.
"""
import hashlib
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3a_forge_events as checker  # noqa: E402
import pm_w3a_forge_spec as spec  # noqa: E402

TABLE_PREFIX = checker.TABLE_PREFIX


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


class Collector:
    """Deduplicating recorder: one control or negative per distinct observation of each table."""

    def __init__(self):
        self.slots = {}
        self.counts = dict(records=0, accepted=0, refused=0)

    def append(self, item):
        phase, observed, first = item
        self.counts['records'] += 1
        slot = self.slots.setdefault(phase, dict(controls={}, negatives={}))
        key = _key(observed)
        if first is None:
            self.counts['accepted'] += 1
            slot['controls'].setdefault(key, dict(id=f'control/{phase}/{len(slot["controls"])}', value=observed))
        else:
            self.counts['refused'] += 1
            row, code = first
            slot['negatives'].setdefault(key, dict(id=f'negative/{phase}/{len(slot["negatives"])}',
                                                   value=observed, target=row, code=code))


def collect(progress=None):
    collector = Collector()
    checker.RECORDER = collector
    try:
        with checker.exact_integer_digits():
            only = os.environ.get('PM_W3A_FAMILY')
            for fam in spec.FAMILIES:
                if only and fam['event_type'] != only:
                    continue
                for kind in ('application', 'project'):
                    for case in checker.all_cases(fam, kind):
                        checker.run_case(fam, kind, case)
                if progress:
                    progress(fam['event_type'])
    finally:
        checker.RECORDER = None
    return collector.slots, collector.counts


def dump(path, slots, counts):
    import gzip
    with gzip.open(path, 'wt') as handle:
        json.dump(dict(counts=counts, slots=slots), handle, sort_keys=True)
