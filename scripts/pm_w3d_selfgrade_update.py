#!/usr/bin/env python3
"""Re-grade W3D conservatively from current, checked result artifacts and exact source spans."""
import collections
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / 'reports/event-authority-20261105/W3D-self-grade.json'
RESULT = 'reports/event-authority-20261105/W3D-fix1-summary.json'
CONFIG = {'bsd.policy_changed', 'bsd.workflow_binding_created'}


def quote(path, needle, start=0, unit='ATS-1230'):
    lines = (ROOT / path).read_text().splitlines()
    index = next(i for i in range(start, len(lines)) if needle in lines[i])
    return dict(path=path, unit=unit, line_start=index+1, line_end=index+1, quote=lines[index].strip())


def main():
    result = json.loads((ROOT / RESULT).read_text())
    d = json.loads(PATH.read_text())
    d['assessment_kind'] = 'author_self_grade_phase2_fix1_prepared_without_admission'
    d['assessed_tree'] = result['code_commit']
    d['oracle_execution'] = 'EXECUTABLE_PHASE2_FIX1_FINITE_SYNTHETIC_PROOF'
    d['status_meaning']['PASS'] = 'Directly established owner/schema/retention fact; no native execution claim.'
    d['status_meaning']['PARTIAL'] = 'Draft contract and finite synthetic tests exist; complete owner-plan and native assurance are not certified.'
    candidate_path = 'Plans/bsd_event_storage_candidates.json'
    lines = (ROOT / candidate_path).read_text().splitlines()
    for row in d['rows']:
        event = row['event_type']
        slug = event.split('.', 1)[1]
        pno = row['cells']['positive_negative_oracles']
        pno.update(status='PARTIAL', representation='finite_executable_oracles', change='phase2_fix1_regraded',
            change_reason='Recheck findings 1-4 repaired and proven; finite derivation sample and five number routes do not certify every owner-plan obligation.',
            finding=(f"Fixed checker: {result['checker']['positives']} positives, {result['checker']['negatives']} negatives; "
                     'zero mismatches. Recheck derivations 15/15 and own 10/10 killed against explicit outcomes. '
                     'The gated observation suites pass. Criterion 12 remains PARTIAL: no complete per-slot corpus, '
                     'all-derivation certification or implementation-backed retention/restore/withdrawal proof is claimed.'),
            evidence=[quote(RESULT, '"criterion_12": "PARTIAL"')])
        policy = 'RP-AUTHORITY-INDEFINITE' if event in CONFIG else 'RP-RUNTIME-365D'
        start = next(i for i,line in enumerate(lines) if f'"family_id": "bsd_{slug}_operation"' in line)
        start = next(i for i in range(start,len(lines)) if '"event_retention_policy_ref"' in lines[i])
        ev = quote(candidate_path, '"policy_id": "'+policy+'"', start, 'SP-1365')
        row['cells']['retention']['evidence'] = [ev]
        row['remaining_gaps'] = [
            'Finite derivation sample and five corpus routes do not certify every owner-plan obligation.',
            'Independent review before later admission.',
            'SP-318 exact physical/migration/budget/native custody prerequisites remain disabled.',
            'Whole-tree date-time inventory remains fail-closed on recorded lane-tree drift; integration must refresh it.',
        ]
    d['status_counts'] = dict(collections.Counter(c['status'] for r in d['rows'] for c in r['cells'].values()))
    d['phase_2_fix_1'] = dict(code_commit=result['code_commit'], criterion_12='PARTIAL',
        prior_actual_counts={'PASS':60,'PARTIAL':105,'ABSENT':15}, counts=d['status_counts'],
        findings='All five repaired; exact outcome and scope limitations are in W3D.md and W3D-fix1-summary.json.')
    PATH.write_text(json.dumps(d, indent=2, ensure_ascii=False)+'\n')
    failures = []
    count = 0
    for row in d['rows']:
        for cell, data in row['cells'].items():
            for ev in data.get('evidence', []):
                if 'quote' not in ev:
                    continue
                count += 1
                source = (ROOT / ev['path']).read_text().splitlines()
                span = '\n'.join(source[ev['line_start']-1:ev['line_end']])
                if ev['quote'] not in span:
                    failures.append(dict(event=row['event_type'], cell=cell, evidence=ev))
    audit = dict(status='fail' if failures else 'pass', quote_records=count,
                 matched=count-len(failures), status_counts=d['status_counts'], failures=failures)
    (ROOT/'reports/event-authority-20261105/W3D-self-grade-audit-fix1.json').write_text(json.dumps(audit,indent=1)+'\n')
    print(json.dumps(audit,indent=1))
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
