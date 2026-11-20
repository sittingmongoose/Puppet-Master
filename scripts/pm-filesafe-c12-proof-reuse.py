#!/usr/bin/env python3
"""Rebind unchanged gated DF tables only after source/tool/case hash equality.

The fresh complete-checker collection also proves that singleton extraction
has not changed any credited observation. Entailed rows earn zero credit.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

import pm_filesafe_c12_closure as X
import pm_filesafe_guard_suites as S
from pm_filesafe_table_index import ENTAILED_ROWS


def matching_cases(suite, report):
    controls = {(c.id, S.g.digest(c.value)) for c in suite.controls}
    negatives = {(n.id, n.target, n.code, n.control, S.g.digest(n.value)) for n in suite.negatives}
    prior_controls = {(c['id'], c['sha256']) for c in report['controls']}
    prior_negatives = {(n['id'], n['target'], n['code'], n['control'], n['sha256']) for n in report['negatives']}
    return controls == prior_controls and negatives == prior_negatives


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prior', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--base', required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    collected, findings = S.collect(flips=False)
    report = dict(tables=[], failures=[], invalid_observations=findings,
                  source_base=args.base, tool_sha256=hashlib.sha256((X.ROOT / 'scripts/pm_guard_isolation.py').read_bytes()).hexdigest())
    proved, entailed = set(), set()
    for phase in X.T.PHASES:
        rows = [n for n, p, ctx in X.T.rows(phase)]
        slot = collected.get(phase, dict(controls={}, negatives={}))
        if len(rows) == 1 and rows[0] in ENTAILED_ROWS:
            entailed.update(rows)
            report['tables'].append(dict(phase=phase, rows=rows, status='ENTAILED_UNCREDITED',
                                         controls=len(slot['controls']), negatives=len(slot['negatives']),
                                         proof='fresh unproved-attempts.json + per-row construction and pair/OS01 proofs'))
            if slot['negatives']:
                report['failures'].append(dict(phase=phase, reason='declared entailed row has a reachable witness'))
            continue
        path = X.ROOT / f'scripts/pm_filesafe_table_{phase}.py'
        source = path.read_bytes()
        original = subprocess.run(['git', 'show', args.base + ':' + str(path.relative_to(X.ROOT))],
                                  cwd=X.ROOT, capture_output=True, check=True).stdout
        prior_path = args.prior / (phase + '.json')
        prior = json.loads(prior_path.read_text()) if prior_path.exists() else {}
        suite = S.suite_for(phase, slot)
        source_match = original == source
        tool_match = prior.get('tool_sha256') == report['tool_sha256']
        cases_match = suite is not None and bool(prior) and matching_cases(suite, prior)
        complete_matrix = not S.lane_matrix(phase, list(slot['controls'].values()), list(slot['negatives'].values()))
        old_proved = {r['id'] for r in prior.get('rows', []) if r.get('proved')}
        ok = (source_match and tool_match and cases_match and complete_matrix
              and prior.get('status') == 'PASS' and old_proved == set(rows))
        entry = dict(phase=phase, rows=rows, status='REUSED_EXACT' if ok else 'MISMATCH',
                     source_match=source_match, tool_match=tool_match, cases_match=cases_match,
                     complete_matrix=complete_matrix, source_sha256=hashlib.sha256(source).hexdigest(),
                     prior_report=str(prior_path),
                     prior_report_sha256=hashlib.sha256(prior_path.read_bytes()).hexdigest() if prior_path.exists() else None)
        report['tables'].append(entry)
        if ok:
            proved.update(old_proved)
        else:
            report['failures'].append(entry)
    for finding in findings:
        if finding['kind'] != 'two_row_observation' or not set(finding.get('rows', [])) <= proved:
            report['failures'].append(finding)
    report.update(status='PASS' if not report['failures'] else 'FAIL', proved=len(proved),
                  entailed=len(entailed), rows=len(proved | entailed),
                  table_count=len(report['tables']), max_rows=max(len(X.T.rows(p)) for p in X.T.PHASES))
    X.write(args.out / 'proof-rebinding.json', report)
    print(json.dumps({k: v for k, v in report.items() if k not in ('tables', 'invalid_observations', 'failures')}), flush=True)
    if report['failures']:
        print(json.dumps(report['failures'][:8], indent=1), flush=True)
    return int(bool(report['failures']))


if __name__ == '__main__':
    raise SystemExit(main())
