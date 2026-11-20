#!/usr/bin/env python3
"""C12-SR2: re-grade criterion 12 of restore_point.created from exact owner quotes (DL-693).

Supersedes only the restore_point.created row of C12-SR's
depth-c12-sr-families.json. Every other cell is carried with its evidence
re-anchored to this tree and exact-checked. Criterion 12 PASS requires the
lane's complete evidence bundle (matrix, batteries, corpus and extension
evidence with status pass) and the gated proof with every row of the family's
tables proved: the owner's sr_created tables and the DL-693 co-extension's
sr2_capture tables. Run after the implementation commit, before the report
commit.
"""
import argparse
import collections
import copy
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = 'reports/event-authority-20261114/depth-c12-sr-families.json'
BASE_COMMIT = '5b13ef359f08994ded76315ac03670a7b2aae227'
OUT = 'reports/event-authority-20261114/depth-c12-sr2-created'
FAMILY = 'restore_point.created'
GROUPS = ('sr_created', 'sr2_capture')
ACD = 'Plans/assistant-chat-design.md'
ATS = 'Plans/Automated_Testing_System.md'
DL = 'Plans/Decision_Log.md'
QUOTES = [
    (DL, 'DL-693', 'His answer: option A, "Everything up to that message, sorted by kind", with no added words.'),
    (ACD, 'ACD-465', '`cmd.chat.create_restore_point` captures everything up to and including the chosen message, sorted by kind.'),
    (ACD, 'ACD-465', "- `context_refs`: the items in the chat's context at the boundary message"),
    (ACD, 'ACD-465', "- `provenance_refs`: for each assistant answer in the range, the sources its tools and its model used to write it"),
    (ACD, 'ACD-465', "- `attachment_refs`: what is attached to each message in the range (its `attachments[]`, such as attached files), in message order."),
    (ACD, 'ACD-465', "- `citation_refs`: the sources each assistant answer in the range cites (`citations[]`), in message order."),
    (ACD, 'ACD-465', "The canonical record's `context_provenance_refs` is `context_refs` followed by each `provenance_refs` ref not already in it"),
    (ACD, 'ACD-465', 'creation refuses or quarantines with no record, companion or event, and nothing is dropped, rewritten or redacted to make the capture fit.'),
    (ATS, 'ATS-3880', 'For `restore_point.created`, the checker executes the thirteen-field `pm.restore_point.immutable_capture_sha256.v1` recipe'),
    (ATS, 'ATS-3880', 'Amended 2026-11-15 (DL-693, lane C12-SR2), closing the gap above: that selection is now owner text'),
]


def evidence(path, unit, quote, near=0):
    text = (ROOT / path).read_text(); hits = []; pos = text.find(quote)
    while pos >= 0:
        start = text.count('\n', 0, pos) + 1; end = text.count('\n', 0, pos + len(quote)) + 1
        hits.append((start, end)); pos = text.find(quote, pos + 1)
    if not hits:
        raise ValueError('Missing exact quote in ' + path + ': ' + quote)
    start, end = min(hits, key=lambda x: abs(x[0] - near)) if near else hits[0]
    excerpt = '\n'.join(text.split('\n')[start - 1:end])
    assert quote in excerpt
    return dict(path=path, unit=unit, line_start=start, line_end=end, quote=quote,
                excerpt_sha256=hashlib.sha256(excerpt.encode()).hexdigest(), quote_check='exact')


def proof_complete(bundle):
    guards = json.loads((bundle / 'guards.json').read_text())
    tables = [d for d in guards['detail'] if d['table'].startswith(tuple(g + '_' for g in GROUPS))]
    groups = {g for g in GROUPS if any(d['table'].startswith(g + '_') for d in tables)}
    facts = {'tables': [d['table'] for d in tables], 'rows': sum(d['rows'] for d in tables),
             'proved': sum(d['proved'] for d in tables), 'unproved': [u for d in tables for u in d['unproved']],
             'status': sorted({d['status'] for d in tables}),
             'reuse_verified': sorted(v['table'] for v in guards.get('reuse_verification', []) if v.get('reused'))}
    ok = (groups == set(GROUPS) and facts['rows'] == facts['proved'] and not facts['unproved']
          and facts['status'] == ['PASS'])
    return ok, facts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--bundle', type=Path, required=True, help='the evidence directory of the full run')
    args = parser.parse_args()
    base = json.loads(subprocess.check_output(['git', 'show', BASE_COMMIT + ':' + BASE], cwd=ROOT, text=True))
    summary = json.loads((args.bundle / 'summary.json').read_text())
    run_ok = all(summary[k]['status'] == 'pass' for k in ('matrix', 'batteries', 'corpus', 'evidence', 'guards'))
    complete, facts = proof_complete(args.bundle)
    shifts = {}

    def anchor(ev):
        path = ev['path']
        if path not in shifts:
            old = subprocess.check_output(['git', 'show', BASE_COMMIT + ':' + path], cwd=ROOT, text=True).splitlines()
            new = (ROOT / path).read_text().splitlines(); mapping = {}
            for match in difflib.SequenceMatcher(a=old, b=new, autojunk=True).get_matching_blocks():
                for i in range(match.size):
                    mapping[match.a + i + 1] = match.b + i + 1
            shifts[path] = mapping
        return evidence(path, ev['unit'], ev['quote'], shifts[path].get(ev['line_start'], ev['line_start']))

    row = copy.deepcopy(next(r for r in base['rows'] if r['event_type'] == FAMILY))
    total = 0; counts = collections.Counter()
    for criterion, cell in row['cells'].items():
        if criterion != 'positive_negative_oracles':
            cell['evidence'] = [anchor(ev) for ev in cell['evidence']]
        else:
            passed = run_ok and complete
            prior = cell['status']
            cell.update(status='PASS' if passed else 'PARTIAL', representation='exact_normative_owner',
                        evidence=[evidence(*q) for q in QUOTES], prior={'source': BASE, 'commit': BASE_COMMIT, 'status': prior},
                        change='upgraded' if passed and prior != 'PASS' else 'carried')
            if passed:
                cell['finding'] = ('DL-693 (Jared, card E10-1, option A) defines the capture selection in ACD-465 "Capture selection '
                                   '(DL-693)", and ATS-3880 binds it: scripts/pm_s3bo_ext_sr2_capture.py selects every list over the '
                                   'inclusive boundary from an independently presented transcript and compares one designated copy per '
                                   'list, with real table predicates, independently labelled single-defect witnesses against hand-written '
                                   'captures and a gated cut, alongside the owner boundary in scripts/pm_s3bo_ext_sr_created.py. Proof: '
                                   + str(facts['proved']) + '/' + str(facts['rows']) + ' rows in ' + str(len(facts['tables']))
                                   + ' tables, none unproved. Native execution remains NOT_RUN.')
                cell['change_reason'] = 'The missing capture-selection owner definition is now owner text and is executed and proved; see the C12-SR2 report.'
            else:
                cell['finding'] = 'The C12-SR2 evidence bundle did not pass in full; criterion 12 stays PARTIAL.'
                cell['change_reason'] = 'Incomplete evidence bundle.'
        total += len(cell['evidence']); counts[cell['status']] += 1
    if 'disposition_evidence' in row:
        row['disposition_evidence'] = [anchor(ev) for ev in row['disposition_evidence']]
        total += len(row['disposition_evidence'])
    c12 = row['cells']['positive_negative_oracles']['status']
    row['remaining_gaps'] = [] if c12 == 'PASS' else ['Criterion 12: C12-SR2 evidence bundle incomplete.']
    row['current_owner_units'] = list(dict.fromkeys(row.get('current_owner_units', []) + ['ACD-465', 'ATS-3880', 'DL-693']))
    row['static_checks_seen'] = list(dict.fromkeys(row.get('static_checks_seen', []) +
                                                    ['scripts/pm-s3bo-check.py matrix / batteries / corpus / evidence; guards --tables sr2_ plus verified reuse']))
    row['pass_count'] = sum(cell['status'] == 'PASS' for cell in row['cells'].values())
    row['normative_depth_complete'] = row['pass_count'] == 12
    row['grading_batch'] = 'c12-sr2'
    report = copy.deepcopy(base)
    report.update(assessment_id='EA-PNC019-C12-SR2-20261115', rows=[row],
                  scope='PNC-019 step S4 criterion-12 closure lane C12-SR2: restore_point.created under DL-693.',
                  assessed_tree={'branch': 'plans/ea-pnc-c12-sr2-20261115', 'commit': args.commit},
                  supersedes={'path': BASE, 'commit': BASE_COMMIT, 'note': 'Supersedes the restore_point.created row only.'},
                  status_counts=dict(counts), status_counts_by_criterion={k: {v['status']: 1} for k, v in row['cells'].items()},
                  normative_depth_complete_families=[FAMILY] if row['normative_depth_complete'] else [],
                  pass_counts={FAMILY: row['pass_count']}, evidence_items=total, quote_check={'exact': total},
                  guard_proof={FAMILY: facts}, run_summary=summary,
                  method={'rubric': base['method']['rubric'],
                          'grading': 'Criterion 12 PASS requires the full C12-SR2 bundle (matrix, batteries, corpus, extension evidence) to pass and every row of the sr_created and sr2_capture tables to be proved by the gated tool, reused proofs re-verified against this tree; every quote exact-checked. Other cells carried and re-anchored.'},
                  note='Native execution remains NOT_RUN.')
    (ROOT / (OUT + '.json')).write_text(json.dumps(report, indent=1) + '\n')
    cell = row['cells']['positive_negative_oracles']
    lines = ['# PNC-019 C12-SR2 depth re-grade: restore_point.created', '',
             'Implementation: `' + args.commit + '`. Supersedes the `' + FAMILY + '` row of `' + BASE + '` at `' + BASE_COMMIT[:10]
             + '`. Every quote is exact-checked against this tree.', '',
             '| Family | PASS cells | Criterion 12 before | Criterion 12 after | Proof rows |', '|---|---:|---|---|---|',
             '| `' + FAMILY + '` | ' + str(row['pass_count']) + '/12 | ' + cell['prior']['status'] + ' | ' + cell['status']
             + ' | ' + str(facts['proved']) + '/' + str(facts['rows']) + ' |', '',
             'Totals: ' + str(dict(counts)) + '. Native execution is NOT_RUN. Evidence and remaining gaps are in the JSON companion.', '']
    (ROOT / (OUT + '.md')).write_text('\n'.join(lines))
    print(json.dumps({'status_counts': dict(counts), 'exact_quotes': total, 'pass_count': row['pass_count'],
                      'complete': report['normative_depth_complete_families'], 'proof': facts}))


if __name__ == '__main__':
    main()
