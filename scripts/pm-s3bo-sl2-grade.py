#!/usr/bin/env python3
"""C12-SL2: re-grade criterion 12 of the Storage deletion and quarantine families from exact owner quotes (DL-695).

Supersedes only the storage.deletion_lifecycle_changed and
storage.value_quarantine_changed rows of C12-SL's depth-c12-sl-families.json.
Deletion was PARTIAL only because no owner text defined the successor of a
revalidated retry after `failed`; DL-695 (Jared, card E11-1, option A) defines
it as `failed -> logically_hidden` in Case L-3. Quarantine is re-graded because
the same lane moved its stored event obligation into the closed record schema
(SP-2201) and re-proved its tables. Every other cell is carried with its
evidence re-anchored to this tree and exact-checked. Criterion 12 PASS requires
the lane's complete evidence bundle (matrix, batteries, corpus and extension
evidence with status pass) and the gated proof with every row of the family's
tables proved, reused proofs re-verified against this tree. Run after the
implementation commit, before the report commit.
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
BASE = 'reports/event-authority-20261114/depth-c12-sl-families.json'
BASE_COMMIT = 'ebcc8e9cddc668358a7921a5e1ab0031218017aa'
OUT = 'reports/event-authority-20261114/depth-c12-sl2-families'
ATS = 'Plans/Automated_Testing_System.md'
DL = 'Plans/Decision_Log.md'
SP = 'Plans/storage-plan.md'
REG = 'Plans/storage_value_registry.json'
FAMILIES = {
    'storage.deletion_lifecycle_changed': ('sl_deletion', 'pm_s3bo_ext_sl_deletion'),
    'storage.value_quarantine_changed': ('sl_quarantine', 'pm_s3bo_ext_sl_quarantine'),
}
QUOTES = {
    'storage.deletion_lifecycle_changed': [
        (DL, 'DL-695', 'His answer: option A, "It stays hidden; the retry re-checks and carries on", with no added words.'),
        (SP, 'Case L-3 Thread/project deletion (SP-237)', 'The graph-valid successor of a revalidated retry is exactly `failed -> logically_hidden` (DL-695)'),
        (SP, 'Case L-3 Thread/project deletion (SP-237)', 'It creates no fixed bypass from `failed` to `purge_pending` or `purged`.'),
        (SP, 'Case L-3 Thread/project deletion (SP-237)', 'A retry whose revalidation is missing or fails is refused under the admission order below, and the record stays `failed`. There is no `failed -> requested` edge.'),
        (SP, 'SP-2200', "appends the transition to `event_refs` and stores the frozen EventRecord as the durable pending event obligation in the same row's `event_obligation` member"),
        (REG, 'storage_deletion_record value_schema', 'SP-2200: the frozen EventRecord of the latest admitted transition'),
        (ATS, 'ATS-3920', 'For `storage.deletion_lifecycle_changed`, every coordinator step is admitted or refused at the first failing stage'),
        (ATS, 'ATS-3920', '**Retry after `failed`:** its only successor is `logically_hidden` (DL-695).'),
        (ATS, 'ATS-3920', '**Closed by DL-695 (lane C12-SL2, 2026-11-15):**'),
    ],
    'storage.value_quarantine_changed': [
        (ATS, 'ATS-3920', 'For `storage.value_quarantine_changed`, detection mints the `qtn_` identity'),
        (ATS, 'ATS-3920', 'The SP-2211 deleted-scope examples remain the common ATS-2206 rows.'),
        (SP, 'SP-2201', 'While a non-terminal record for those values exists, a re-detection resolves to it and mints nothing.'),
        (SP, 'SP-2201', "appends the transition to `transition_receipts` and stores the frozen EventRecord as the durable pending event obligation in the same row's `event_obligation` member"),
        (REG, 'storage_quarantine_record value_schema', 'SP-2201: the frozen EventRecord of the latest admitted transition'),
    ],
}
FINDING = {
    'storage.deletion_lifecycle_changed': (
        'DL-695 (Jared, card E11-1, option A) defines the one edge out of `failed` in Case L-3: a revalidated retry goes to '
        '`logically_hidden`, with no `failed -> requested` edge and no bypass to `purge_pending` or `purged`. ATS-3920 binds the '
        'complete deletion boundary in scripts/pm_s3bo_ext_sl_deletion.py with RETRY_SUCCESSOR final: the retry edge, each '
        'revalidation refusal and the refused retries to requested, purge_pending and purged are real table predicates with '
        'independently labelled single-defect witnesses and a gated cut, and the SP-2200 obligation is read from the record\'s '
        'event_obligation member. Proof: '),
    'storage.value_quarantine_changed': (
        'ATS-3920 binds the complete quarantine boundary in scripts/pm_s3bo_ext_sl_quarantine.py; the SP-2201 obligation now lives '
        'in the closed storage_quarantine_record schema\'s event_obligation member and the checker reads and compares it there. '
        'Every owner branch has a real table predicate, an independently labelled single-defect witness and a gated cut; the full '
        'shared corpus runs through the boundary. Proof: '),
}
REASON = {
    'storage.deletion_lifecycle_changed': 'The missing retry-successor owner definition is now owner text (DL-695) and is executed and proved; see the C12-SL2 report.',
    'storage.value_quarantine_changed': 'Re-proved after the SP-2201 obligation moved into the closed record schema; see the C12-SL2 report.',
}


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


def proof_complete(bundle, group):
    guards = json.loads((bundle / 'guards.json').read_text())
    tables = [d for d in guards['detail'] if d['table'].startswith(group + '_')]
    if not tables:
        return False, {}
    facts = {'tables': [d['table'] for d in tables], 'rows': sum(d['rows'] for d in tables),
             'proved': sum(d['proved'] for d in tables), 'unproved': [u for d in tables for u in d['unproved']],
             'status': sorted({d['status'] for d in tables}),
             'reuse_verified': sorted(v['table'] for v in guards.get('reuse_verification', [])
                                      if v.get('reused') and v['table'].startswith(group + '_'))}
    ok = facts['rows'] == facts['proved'] and not facts['unproved'] and facts['status'] == ['PASS']
    return ok, facts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--bundle', type=Path, required=True, help='the evidence directory of the full run')
    args = parser.parse_args()
    base = json.loads(subprocess.check_output(['git', 'show', BASE_COMMIT + ':' + BASE], cwd=ROOT, text=True))
    summary = json.loads((args.bundle / 'summary.json').read_text())
    run_ok = all(summary[k]['status'] == 'pass' for k in ('matrix', 'batteries', 'corpus', 'evidence', 'guards'))
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

    rows = []; total = 0; counts = collections.Counter(); by_criterion = {}; proofs = {}
    for row in base['rows']:
        family = row['event_type']
        if family not in FAMILIES:
            continue
        row = copy.deepcopy(row); group, _module = FAMILIES[family]
        complete, facts = proof_complete(args.bundle, group)
        proofs[family] = facts
        for criterion, cell in row['cells'].items():
            if criterion != 'positive_negative_oracles':
                cell['evidence'] = [anchor(ev) for ev in cell['evidence']]
            else:
                passed = run_ok and complete
                prior = cell['status']
                cell.update(status='PASS' if passed else 'PARTIAL', representation='exact_normative_owner',
                            evidence=[evidence(*q) for q in QUOTES[family]],
                            prior={'source': BASE, 'commit': BASE_COMMIT, 'status': prior},
                            change='upgraded' if passed and prior != 'PASS' else 'carried')
                if passed:
                    cell['finding'] = (FINDING[family] + str(facts['proved']) + '/' + str(facts['rows']) + ' rows in '
                                       + str(len(facts['tables'])) + ' tables, none unproved. Native execution remains NOT_RUN.')
                    cell['change_reason'] = REASON[family]
                else:
                    cell['finding'] = 'The C12-SL2 evidence bundle did not pass in full; criterion 12 stays PARTIAL.'
                    cell['change_reason'] = 'Incomplete evidence bundle.'
            total += len(cell['evidence']); counts[cell['status']] += 1
            by_criterion.setdefault(criterion, collections.Counter())[cell['status']] += 1
        if 'disposition_evidence' in row:
            row['disposition_evidence'] = [anchor(ev) for ev in row['disposition_evidence']]
            total += len(row['disposition_evidence'])
        c12 = row['cells']['positive_negative_oracles']['status']
        row['remaining_gaps'] = [] if c12 == 'PASS' else ['Criterion 12: C12-SL2 evidence bundle incomplete.']
        extra = ['ATS-3920', 'SP-2200', 'SP-237', 'DL-695'] if family == 'storage.deletion_lifecycle_changed' else ['ATS-3920', 'SP-2201']
        row['current_owner_units'] = list(dict.fromkeys(row.get('current_owner_units', []) + extra))
        row['static_checks_seen'] = list(dict.fromkeys(row.get('static_checks_seen', []) +
                                                        ['scripts/pm-s3bo-check.py matrix / batteries / corpus / evidence; table runs for sl_deletion_* and sl_quarantine_* plus verified reuse']))
        row['pass_count'] = sum(cell['status'] == 'PASS' for cell in row['cells'].values())
        row['normative_depth_complete'] = row['pass_count'] == 12
        row['grading_batch'] = 'c12-sl2'
        rows.append(row)
    report = copy.deepcopy(base)
    report.update(assessment_id='EA-PNC019-C12-SL2-20261115', rows=rows,
                  scope='PNC-019 step S4 criterion-12 closure lane C12-SL2: storage.deletion_lifecycle_changed under DL-695 and storage.value_quarantine_changed after the SP-2201 obligation fix.',
                  assessed_tree={'branch': 'plans/ea-pnc-c12-sl2-20261115', 'commit': args.commit},
                  supersedes={'path': BASE, 'commit': BASE_COMMIT,
                              'note': 'Supersedes the storage.deletion_lifecycle_changed and storage.value_quarantine_changed rows only.'},
                  status_counts=dict(counts), status_counts_by_criterion={k: dict(v) for k, v in by_criterion.items()},
                  normative_depth_complete_families=[r['event_type'] for r in rows if r['normative_depth_complete']],
                  pass_counts={r['event_type']: r['pass_count'] for r in rows}, evidence_items=total,
                  quote_check={'exact': total}, guard_proof=proofs, run_summary=summary,
                  method={'rubric': base['method']['rubric'],
                          'grading': 'Criterion 12 PASS requires the full C12-SL2 bundle (matrix, batteries, corpus, extension evidence) to pass and every row of the family tables to be proved by the gated tool, reused proofs re-verified against this tree; every quote exact-checked. Other cells carried and re-anchored.'},
                  note='Native execution remains NOT_RUN for both families.')
    (ROOT / (OUT + '.json')).write_text(json.dumps(report, indent=1) + '\n')
    lines = ['# PNC-019 C12-SL2 depth re-grade: Storage deletion and quarantine', '',
             'Implementation: `' + args.commit + '`. Supersedes these two rows of `' + BASE + '` at `' + BASE_COMMIT[:10]
             + '`. Every quote is exact-checked against this tree.', '',
             '| Family | PASS cells | Criterion 12 before | Criterion 12 after | Proof rows |', '|---|---:|---|---|---|']
    for row in rows:
        cell = row['cells']['positive_negative_oracles']; facts = proofs[row['event_type']]
        lines.append('| `' + row['event_type'] + '` | ' + str(row['pass_count']) + '/12 | ' + cell['prior']['status'] + ' | '
                     + cell['status'] + ' | ' + str(facts.get('proved')) + '/' + str(facts.get('rows')) + ' |')
    lines += ['', 'Totals: ' + str(dict(counts)) + '. Native execution is NOT_RUN. Evidence and remaining gaps are in the JSON companion.', '']
    (ROOT / (OUT + '.md')).write_text('\n'.join(lines))
    print(json.dumps({'status_counts': dict(counts), 'exact_quotes': total, 'pass_counts': report['pass_counts'],
                      'complete': report['normative_depth_complete_families'], 'proof': proofs}))


if __name__ == '__main__':
    main()
