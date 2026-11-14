#!/usr/bin/env python3
"""Prove required-member phases; report exactly the gated tool's credit.

An original full-owner-schema negative must first refuse at the exact required
member occurrence. Only then is that same payload's required-member phase
submitted to the gated tool. Required members are never cut as one aggregate.
No whole-family PASS is inferred from these bounded phases.
"""
import argparse
import copy
import gzip
import hashlib
import json
from pathlib import Path

import pm_guard_isolation as g
import pm_pnc019_required_table as phase
import pm_pnc019_s4o1 as cells


SOURCE = 'scripts/pm_pnc019_required_table.py'
ALLOWANCES = [
    ('selected', 'return', 'return value', 'Select the unchanged complete payload at this required-member phase.'),
    ('case', 'return', 'return g.Case(table, check, context)', 'Return the fresh engine case without deciding acceptance.'),
    ('case', 'call_review', 'g.SchemaCatalog(DOCUMENTS, roots=(URI,))', 'Build a fresh catalogue for the exact source-bound required-member group.'),
    ('case', 'call_review', 'g.schema_table(catalog, {URI: selected})', 'Build the engine table; one row per required member, with no grouped bypass.'),
    ('case', 'data_operation', '{URI: selected}', 'Bind the one declared root to the unchanged-payload selector.'),
    ('case.check', 'call_review', 'table.validate(URI, value, context)', 'Invoke the original complete schema phase through engine attribution.'),
]


def suite(required, control, negatives, label):
    phase.DOCUMENTS = {phase.URI: {'$schema': 'https://json-schema.org/draft/2020-12/schema', 'required': required}}
    preview = phase.case()
    labels = {r.member: r.id for r in preview.table._schema.catalog.guards.values() if r.classification == 'guard'}
    result = g.Suite(label, phase.case, [g.Control('valid', control, 'synthetic')],
                     [g.Negative('missing/' + member, value, labels[member], preview.table.guards[labels[member]].refusal_code,
                                 'valid', 'Remove only required member ' + member) for member, value in negatives],
                     (SOURCE,), cells.ROOT)
    result.non_guards = [g.NonGuard(SOURCE, function, kind, text, reason) for function, kind, text, reason in ALLOWANCES]
    return result


def run(row, out, width=1):
    from urllib.parse import urldefrag
    from pm_event_datetime import EVENT_RECORD, format_checker
    reg, documents = cells.registry()
    path, frag = urldefrag(row['schema'])
    resolver = reg.resolver((cells.ROOT / path).resolve().as_uri())
    schema = resolver.lookup('#' + frag).contents if frag else documents[(cells.ROOT/path).resolve().as_uri()]
    if '$id' in schema:
        resolver = reg.resolver(schema['$id'])
    validator = cells.CurrentValidator(schema, registry=reg, _resolver=resolver, format_checker=format_checker(profile=EVENT_RECORD))
    results, seen = [], set()
    gate = g.MemoryGate(1536, 12, 12, 15, 2700)
    for ci, payload in enumerate(row['controls']):
        if cells.errors(validator, payload):
            continue
        for sp, ip, node, original in cells.schema_nodes(schema, payload, reg, resolver=resolver):
            required = [m for m in node.get('required', []) if isinstance(original, dict) and m in original]
            key = (sp, ip)
            if not required or key in seen:
                continue
            seen.add(key)
            for start in range(0, len(required), width):
                group = required[start:start+width]
                negatives = []
                full_path = tuple(p for p in sp if p != '$ref') + ('required',)
                for member in group:
                    candidate = copy.deepcopy(payload)
                    del cells.at(candidate, ip)[member]
                    errors = cells.errors(validator, candidate)
                    matched = cells.exact_refusal(errors, 'required', sp, ip, member)
                    if matched:
                        negatives.append((member, copy.deepcopy(cells.at(candidate, ip))))
                label = row['event_type'] + '/' + cells.pointer(sp) + '/' + str(start)
                report = g.run(suite(group, original, negatives, label), memory=gate)
                data = json.dumps(report, sort_keys=True, indent=1, default=str).encode() + b'\n'
                name = row['event_type'] + '.' + str(len(results)) + '.json.gz'
                (out/name).write_bytes(gzip.compress(data, mtime=0))
                results.append(dict(schema_path=cells.pointer(sp), instance_path=cells.pointer(ip), control=ci,
                                    required=group, exact_full_owner_refusals=len(negatives), tool_status=report['status'],
                                    proved=sum(r.get('proved', False) for r in report.get('rows', [])),
                                    rows=len(report.get('rows', [])), failures=report.get('failures', []),
                                    report=name, report_sha256=hashlib.sha256(data).hexdigest()))
                print(json.dumps({'family':row['event_type'],'phase':len(results),'status':report['status'],
                                  'proved':results[-1]['proved'],'rows':results[-1]['rows']}), flush=True)
    summary = {'event_type':row['event_type'], 'phases': results,
               'credit_boundary':'Required-member schema phases only; complete family criterion remains PARTIAL.'}
    (out/(row['event_type']+'.required-summary.json')).write_text(json.dumps(summary, indent=2, default=str)+'\n')
    return summary


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family')
    parser.add_argument('--start-position',type=int,default=1)
    parser.add_argument('--end-position',type=int,default=94)
    parser.add_argument('--rows-per-table',type=int,choices=range(1,9),default=1)
    parser.add_argument('--out',required=True,type=Path)
    args=parser.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    selected=[r for r in cells.load_rows()
              if args.start_position<=r['position']<=args.end_position and (not args.family or r['event_type']==args.family)]
    if not selected:
        parser.error('unknown family')
    summaries=[run(row,args.out,args.rows_per_table) for row in selected]
    return int(any(p['tool_status']!='PASS' for r in summaries for p in r['phases']))


if __name__=='__main__':
    raise SystemExit(main())
