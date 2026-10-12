#!/usr/bin/env python3
"""Observed flat context intervals only; residency is not billed activity."""
import argparse
import json
from pathlib import Path
from results import time

def occupancy(intervals):
    events = {}
    for start, end in intervals:
        if end < start:
            raise ValueError('negative context interval')
        events[start] = events.get(start, 0)+1
        events[end] = events.get(end, 0)-1
    count, prior, union, overlap = 0, None, 0, 0
    for moment, delta in sorted(events.items()):
        if prior is not None:
            union += (moment-prior) if count else 0
            overlap += (moment-prior) if count > 1 else 0
        count += delta
        prior = moment
    summed = sum(end-start for start, end in intervals)
    return {'summed_seconds': summed, 'union_seconds': union, 'overlap_wall_seconds': overlap, 'excess_context_seconds': summed-union}

def summarize(records):
    ids = {r['context_id']: r for r in records}
    if len(ids) != len(records):
        raise ValueError('duplicate context_id')
    groups = {}
    stage_rows = []
    for r in records:
        row = {'attempt_id': r['attempt_id'], 'context_id': r['context_id'], 'stage': r['stage']}
        for name, beginning, ending in (('created_context', 'created_utc', 'closed_utc'), ('started_context', 'start_utc', 'closed_utc'), ('provider_activity', 'active_start_utc', 'active_end_utc')):
            start, end = time(r.get(beginning)), time(r.get(ending))
            if start is not None and end is not None and end < start:
                raise ValueError('negative observed interval')
            row[name+'_seconds'] = end-start if start is not None and end is not None else None
            bucket = groups.setdefault(r['attempt_id'], {}).setdefault(name, [])
            bucket.append((start, end) if start is not None and end is not None else None)
        start, terminal = time(r.get('start_utc')), time(r.get('terminal_utc'))
        if start is not None and terminal is not None and terminal < start:
            raise ValueError('negative stage duration')
        row['stage_seconds'] = terminal-start if start is not None and terminal is not None else None
        predecessor = r.get('predecessor_context_id')
        row['inter_stage_wait_seconds'] = None
        if predecessor:
            if predecessor not in ids or ids[predecessor]['attempt_id'] != r['attempt_id']:
                raise ValueError('unknown/cross-attempt predecessor')
            previous = time(ids[predecessor].get('terminal_utc'))
            if previous is not None and start is not None:
                # Negative means genuinely parallel topology; no invented sequential wait.
                row['predecessor_end_to_start_seconds'] = start-previous
                row['inter_stage_wait_seconds'] = max(0, start-previous)
        stage_rows.append(row)
    summary = {}
    for attempt, names in groups.items():
        summary[attempt] = {}
        for name, intervals in names.items():
            known = [x for x in intervals if x is not None]
            summary[attempt][name] = {'contexts': len(intervals), 'observed': len(known), 'unknown': len(intervals)-len(known), 'known_intervals': occupancy(known), 'all_contexts': occupancy(known) if len(known) == len(intervals) else None}
    return {'schema': 'er13.lifetimes.v1', 'stages': stage_rows, 'attempts': summary, 'limitation': 'Provider activity requires actual activity boundaries, never inferred from context residence; disjoint activity intervals may be separate rows with unique IDs. Missing boundaries remain unknown.'}

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--records', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    value = summarize(json.loads(a.records.read_text()))
    with a.output.open('x') as f:
        json.dump(value, f, indent=2, allow_nan=False)
        f.write('\n')

if __name__ == '__main__':
    main()
