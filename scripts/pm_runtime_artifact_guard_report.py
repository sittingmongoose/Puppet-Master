#!/usr/bin/env python3
"""Aggregate the per-family guard-table runs into one summary (credit as the tool reported it).

argv: evidence directory holding <family>/summary.json and <family>/<phase>__<family>.json[.gz]
Writes <dir>/aggregate.json; prints the per-family and per-row tables as JSON lines.
"""
import gzip
import json
from pathlib import Path
import sys


def report(path):
    plain = path.with_suffix('')
    if path.exists():
        return json.loads(path.read_text())
    gz = Path(str(path) + '.gz')
    return json.loads(gzip.decompress(gz.read_bytes()))


def main():
    root = Path(sys.argv[1])
    families, rows, suites, findings = {}, {}, [], []
    for summary_path in sorted(root.glob('*/summary.json')):
        summary = json.loads(summary_path.read_text())
        findings.extend(summary['findings'])
        for entry in summary['suites']:
            family = entry['family']
            fam = families.setdefault(family, dict(suites=0, rows=0, proved=0, negatives=0, controls=0, failed_suites=[],
                                                   lane_matrix_problems=0, flips_accepted=0, flips_refused_later=0))
            fam['suites'] += 1
            fam['rows'] += len(entry['rows'])
            fam['negatives'] += entry['negatives']
            fam['controls'] += entry['controls']
            fam['lane_matrix_problems'] += len(entry['lane_matrix'])
            fam['flips_accepted'] += entry['complete_boundary_flips']['accepted']
            fam['flips_refused_later'] += entry['complete_boundary_flips']['refused_later_count']
            proved = set(entry.get('proved', []))
            fam['proved'] += len(proved)
            if entry.get('tool_status') != 'PASS':
                fam['failed_suites'].append(entry['phase'])
            tool = report(summary_path.parent / entry['report']) if entry.get('report') else {}
            cut = {r['id']: r for r in tool.get('rows', [])}
            for name in entry['rows']:
                r = rows.setdefault(name, dict(phase=entry['phase'], families=0, proved=0, unproved=[], own_flips=0,
                                               stays=0, unrelated_changes=0))
                r['families'] += 1
                if name in proved:
                    r['proved'] += 1
                else:
                    r['unproved'].append(family)
                c = cut.get(name, {})
                r['own_flips'] += len(c.get('flips', []) or [])
                r['stays'] += len(c.get('stays', []) or [])
                r['unrelated_changes'] += len(c.get('unrelated_changes', []) or [])
            suites.append(dict(phase=entry['phase'], family=family, status=entry.get('tool_status'),
                               proved=len(proved), rows=len(entry['rows']), seconds=entry.get('seconds'),
                               evaluations=entry.get('evaluations'), report_sha256=entry.get('report_sha256')))
    totals = dict(families=len([f for f in families if f != 'shared']), suites=len(suites),
                  rows_distinct=len(rows), row_suite_cells=sum(f['rows'] for f in families.values()),
                  proved_cells=sum(f['proved'] for f in families.values()),
                  negatives=sum(f['negatives'] for f in families.values()),
                  failed_suites=sum(len(f['failed_suites']) for f in families.values()),
                  lane_matrix_problems=sum(f['lane_matrix_problems'] for f in families.values()),
                  excluded_witnesses=sum(1 for f in findings if f['kind'] == 'excluded_from_table_proof'),
                  open_findings=[f for f in findings if f['kind'] != 'excluded_from_table_proof'])
    out = dict(totals=totals, families=families, rows=rows, suites=suites,
               excluded=sorted({(f['pair'].split('/')[0], f['reason']) for f in findings if f['kind'] == 'excluded_from_table_proof'}))
    (root / 'aggregate.json').write_text(json.dumps(out, indent=1, sort_keys=True) + '\n')
    print(json.dumps(totals))


if __name__ == '__main__':
    main()
