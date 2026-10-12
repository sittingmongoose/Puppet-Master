#!/usr/bin/env python3
"""Flat ER13 export and conservative arithmetic; no dispatch or evidence invention."""
import argparse
import csv
from datetime import datetime
import json
import math
from pathlib import Path

TIMES = ('t0_utc', 'accepted_utc', 'start_utc', 'terminal_utc', 'delivery_utc', 'created_utc', 'closed_utc', 'setup_start_utc', 'setup_end_utc', 'admitted_utc', 'queued_utc', 'finish_utc', 'last_artifact_utc', 'quiet_utc')
METRICS = ('input_tokens', 'cached_input_tokens', 'output_tokens', 'reasoning_tokens', 'goal_tokens', 'subscription_consumption', 'billing_amount', 'active_provider_seconds', 'created_context_seconds', 'started_context_seconds', 'context_union_seconds', 'context_overlap_seconds')
BASE = ('attempt_id', 'arm_id', 'primary', 'parent_attempt_id', 'charged_extra', 'cost_category', 'scope', 'track', 'block_id', 'cell', 'method_id', 'method_version', 'case_id', 'requested_family', 'actual_provider', 'actual_model', 'actual_effort', 'actual_tier', 'time_contract_version', 'status', 'assessment', 'full_scope_assessed', 'final_present', 'delivery_basis', 'billing_currency', 'subscription_unit', 'counter_basis', 'extra_start_count', 'evidence_ref', 'authored_manifest_ref', 'authored_manifest_sha256', 'frozen_utc', 'evaluation_start_utc', 'dispatch_record_ref', 'terminal_record_ref')
DERIVED = ('request_to_accept_seconds', 'accept_to_start_seconds', 'start_to_terminal_seconds', 'request_to_terminal_seconds', 'delivery_seconds', 'open_context_seconds', 'setup_seconds', 'start_to_finish_seconds')
FIELDS = BASE + TIMES + METRICS + DERIVED

def unknown(v):
    return v is None or v == '' or v == 'UNKNOWN'

def time(v):
    if unknown(v):
        return None
    d = datetime.fromisoformat(v.replace('Z', '+00:00'))
    if d.tzinfo is None:
        raise ValueError('timezone required')
    return d.timestamp()

def difference(row, end, start):
    e, s = time(row.get(end)), time(row.get(start))
    if e is None or s is None:
        return None
    if e < s:
        raise ValueError('negative observed interval: ' + end + '/' + start)
    return e-s

def number(v):
    if unknown(v):
        return None
    if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or v < 0:
        raise ValueError('metrics must be finite nonnegative numbers or UNKNOWN/null')
    return v

def aggregate(rows, metric, passes):
    known = [r[metric] for r in rows if r[metric] is not None]
    complete = len(known) == len(rows)
    total = sum(known) if complete else None
    return {'assigned': len(rows), 'observed': len(known), 'unknown': len(rows)-len(known), 'known_subtotal': sum(known), 'all_assigned_total': total, 'passing_output_sample_quotient': total/passes if complete and passes else None}

def build(queue, records):
    arms = queue['arms']
    if len(arms) != 80 or len({a['arm_id'] for a in arms}) != 80:
        raise ValueError('exactly 80 unique primary queue arms required')
    primaries, ids, extras = {}, set(), []
    for record in records:
        if record['attempt_id'] in ids:
            raise ValueError('duplicate attempt_id')
        ids.add(record['attempt_id'])
        if record.get('primary') is True:
            if record['arm_id'] in primaries:
                raise ValueError('multiple primary rows for arm; retries are extras')
            primaries[record['arm_id']] = record
        elif record.get('primary') is False:
            extras.append(record)
        else:
            raise ValueError('explicit primary boolean required')
    arm_map = {a['arm_id']: a for a in arms}
    if set(primaries)-set(arm_map):
        raise ValueError('primary arm not in queue')
    for r in extras:
        if r.get('parent_attempt_id') and r['parent_attempt_id'] not in ids:
            raise ValueError('unknown parent_attempt_id')
    inputs = []
    for arm in arms:
        r = primaries.get(arm['arm_id'], {'attempt_id': arm['arm_id'], 'arm_id': arm['arm_id'], 'primary': True, 'status': 'PLANNED_NOT_EXECUTED'})
        inputs.append((arm, r))
    inputs.extend((arm_map.get(r.get('arm_id'), {}), r) for r in extras)
    rows = []
    for arm, record in inputs:
        unexpected = set(record)-set(FIELDS)
        if unexpected:
            raise ValueError('unknown/nested record fields: ' + ','.join(sorted(unexpected)))
        if any(isinstance(v, (dict, list)) for v in record.values()):
            raise ValueError('flat records only; use exact evidence pointers')
        row = {f: None for f in FIELDS}
        for field in ('arm_id', 'scope', 'track', 'block_id', 'cell', 'method_id', 'requested_family'):
            row[field] = arm.get(field)
        row.update(record)
        row['cost_category'] = record.get('cost_category', 'product' if record['primary'] else None)
        if row['cost_category'] not in ('product', 'evaluation', 'preparation', 'support', 'publication', 'root_observation'):
            raise ValueError('explicit valid cost category required')
        if not record['primary'] and not isinstance(row['charged_extra'], bool):
            raise ValueError('extras need explicit charged_extra boolean')
        for metric in METRICS:
            row[metric] = number(row[metric])
        for field in TIMES + ('frozen_utc', 'evaluation_start_utc'):
            time(row[field])
            if unknown(row[field]):
                row[field] = None
        for total, subset in (('input_tokens', 'cached_input_tokens'), ('output_tokens', 'reasoning_tokens')):
            if row[total] is not None and row[subset] is not None and row[subset] > row[total]:
                raise ValueError('subset exceeds counter total')
        for field, end, start in (
            ('request_to_accept_seconds', 'accepted_utc', 't0_utc'),
            ('accept_to_start_seconds', 'start_utc', 'accepted_utc'),
            ('start_to_terminal_seconds', 'terminal_utc', 'start_utc'),
            ('request_to_terminal_seconds', 'terminal_utc', 't0_utc'),
            ('open_context_seconds', 'closed_utc', 'created_utc'),
            ('setup_seconds', 'setup_end_utc', 'setup_start_utc'),
            ('start_to_finish_seconds', 'finish_utc', 'start_utc')):
            row[field] = difference(row, end, start)
        if row['delivery_utc']:
            if row['final_present'] is not True or row['delivery_basis'] not in ('last_complete_artifact', 'request_to_quiet_proxy'):
                raise ValueError('delivery requires actual final and named observable basis')
            row['delivery_seconds'] = difference(row, 'delivery_utc', 't0_utc')
        if row['assessment'] == 'PASS':
            if row['final_present'] is not True or row['full_scope_assessed'] is not True:
                raise ValueError('PASS needs present output and full assigned scope assessment')
        if row['evaluation_start_utc']:
            if not row['authored_manifest_ref'] or not row['authored_manifest_sha256'] or not row['frozen_utc']:
                raise ValueError('evaluation requires preceding authored hash manifest')
            if time(row['evaluation_start_utc']) < time(row['frozen_utc']):
                raise ValueError('evaluation precedes freeze')
        if row['billing_amount'] is not None and not row['billing_currency']:
            raise ValueError('billing requires currency')
        if row['subscription_consumption'] is not None and not row['subscription_unit']:
            raise ValueError('subscription requires unit')
        if row['extra_start_count'] is not None:
            if isinstance(row['extra_start_count'], bool) or not isinstance(row['extra_start_count'], int) or row['extra_start_count'] < 0:
                raise ValueError('extra_start_count must be nonnegative integer or null')
        rows.append(row)
    # Only equally scoped strata; no cross-provider/contract speedup claim.
    groups = {}
    for row in rows:
        key = tuple(row.get(f) for f in ('cost_category', 'scope', 'case_id', 'actual_provider', 'actual_model', 'actual_effort', 'actual_tier', 'time_contract_version', 'method_id', 'method_version', 'billing_currency', 'subscription_unit', 'counter_basis'))
        groups.setdefault(key, []).append(row)
    summaries = []
    for key, members in groups.items():
        passes = sum(r['assessment'] == 'PASS' for r in members)
        summaries.append({'stratum': list(key), 'assigned': len(members), 'passing_outputs': passes, 'metrics': {m: aggregate(members, m, passes) for m in METRICS + ('delivery_seconds', 'request_to_terminal_seconds')}})
    charged = [r for r in rows if not r['primary'] and r['charged_extra']]
    charges = [r['extra_start_count'] for r in charged]
    summary = {'schema': 'er13.arithmetic.v1', 'primary_rows': 80, 'extra_rows': len(extras), 'charged_extra_rows': len(charged), 'charged_extra_stage_starts_known_subtotal': sum(x for x in charges if x is not None), 'charged_extra_stage_starts_total': sum(charges) if all(x is not None for x in charges) else None, 'groups': summaries, 'limitations': ['Unknown is not zero. Cached input/reasoning are subsets; Goal counters may overlap and are never added to provider counters.', 'Quotients are sample quotients, not expected retry cost or billing. Zero passing outputs is undefined.', 'Delivery is unknown for missing finals. No cold end-to-end total is inferred from unrelated medians.', 'No inference of quality equivalence, affordability or scientific gains. Paired/factorial analysis needs independent assessments and complete matching.']}
    return rows, summary

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--queue', required=True, type=Path)
    p.add_argument('--records', required=True, type=Path, help='flat JSON array; [] exports unexecuted queue')
    p.add_argument('--destination', required=True, type=Path)
    args = p.parse_args()
    rows, summary = build(json.loads(args.queue.read_text()), json.loads(args.records.read_text()))
    args.destination.mkdir(parents=True, exist_ok=False)
    for name, value in (('results.json', rows), ('arithmetic.json', summary)):
        with (args.destination/name).open('x') as f:
            json.dump(value, f, indent=2, allow_nan=False)
            f.write('\n')
    with (args.destination/'results.csv').open('x', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows({k: 'UNKNOWN' if v is None else v for k, v in row.items()} for row in rows)
    print(json.dumps({'primary_rows': 80, 'extra_rows': summary['extra_rows']}))

if __name__ == '__main__':
    main()
