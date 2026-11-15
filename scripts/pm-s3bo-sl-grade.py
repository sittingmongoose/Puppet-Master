#!/usr/bin/env python3
"""C12-SL: re-grade criterion 12 for the four SL Storage families from exact owner quotes.

Supersedes only these four rows of depth-s3bo-registered-families.json. Every
other cell is carried with its evidence re-anchored to this tree and
exact-checked. A criterion-12 PASS requires the lane's complete evidence bundle:
the matrix, batteries, corpus and extension evidence with status pass and the
gated guard proof with every row of the family's tables proved. Run after the
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
BASE = 'reports/event-authority-20261114/depth-s3bo-registered-families.json'
BASE_COMMIT = '4eeef08643f098e855291d986135bc9be58ee408'
OUT = 'reports/event-authority-20261114/depth-c12-sl-families'
ATS = 'Plans/Automated_Testing_System.md'
SP = 'Plans/storage-plan.md'
FAMILIES = {
    'storage.compaction_lifecycle_changed': ('sl_compaction', 'pm_s3bo_ext_sl_compaction'),
    'storage.deletion_lifecycle_changed': ('sl_deletion', 'pm_s3bo_ext_sl_deletion'),
    'storage.retention_hold_changed': ('sl_hold', 'pm_s3bo_ext_sl_hold'),
    'storage.value_quarantine_changed': ('sl_quarantine', 'pm_s3bo_ext_sl_quarantine'),
}
OPEN = {'storage.deletion_lifecycle_changed'}
QUOTES = {
    'storage.compaction_lifecycle_changed': [
        (ATS, 'ATS-3920', 'For `storage.compaction_lifecycle_changed`, the checker covers:'),
        (ATS, 'ATS-3920', '`RP-COMPACTION-DETAIL-7D` eligibility at 604800 seconds inclusive with every protection overriding age'),
        (SP, 'SP-297', 'RP-COMPACTION-DETAIL-7D version 1.0.0 uses exactly 604800 seconds after first fully settled success or failure'),
    ],
    'storage.retention_hold_changed': [
        (ATS, 'ATS-3920', 'For `storage.retention_hold_changed`, the checker covers:'),
        (ATS, 'ATS-3920', 'the hold-transition binding, `evt_hold_` id, key and logical receipt reproduce every owner fixture'),
        (SP, 'SP-288', 'One hold ID has one immutable set and at most one immutable clear.'),
    ],
    'storage.value_quarantine_changed': [
        (ATS, 'ATS-3920', 'For `storage.value_quarantine_changed`, detection mints the `qtn_` identity'),
        (ATS, 'ATS-3920', 'The SP-2211 deleted-scope examples remain the common ATS-2206 rows.'),
        (SP, 'SP-2201', 'While a non-terminal record for those values exists, a re-detection resolves to it and mints nothing.'),
    ],
    'storage.deletion_lifecycle_changed': [
        (ATS, 'ATS-3920', 'For `storage.deletion_lifecycle_changed`, every coordinator step is admitted or refused at the first failing stage'),
        (ATS, 'ATS-3920', '`storage.deletion_lifecycle_changed` criterion 12 stays open on that owner definition'),
        (SP, 'Case L-3 Thread/project deletion', 'It creates no fixed bypass from `failed` to `purge_pending` or `purged`.'),
    ],
}
GAP_DELETION = ('Criterion 12: the owner text defines no successor edge out of `failed` for a revalidated deletion retry '
                '("before a graph-valid successor"; "no fixed bypass from failed to purge_pending or purged"). The checker '
                'records the provisional reading logically_hidden and refuses the bypasses; the owner must define the '
                'successor (question for Jared in drafts/PNC019/c12-sl/REPORT.md).')


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
             'status': sorted({d['status'] for d in tables})}
    return facts['rows'] == facts['proved'] and not facts['unproved'] and facts['status'] == ['PASS'], facts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--bundle', type=Path, required=True, help='the evidence directory of the full run')
    args = parser.parse_args()
    base = json.loads((ROOT / BASE).read_text())
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
        if row['event_type'] not in FAMILIES:
            continue
        row = copy.deepcopy(row); family = row['event_type']; group, module = FAMILIES[family]
        complete, facts = proof_complete(args.bundle, group)
        proofs[family] = facts
        for criterion, cell in row['cells'].items():
            if criterion != 'positive_negative_oracles':
                cell['evidence'] = [anchor(ev) for ev in cell['evidence']]
            else:
                quotes = [evidence(*q) for q in QUOTES[family]]
                passed = family not in OPEN and run_ok and complete
                prior = cell['status']
                cell.update(status='PASS' if passed else 'PARTIAL', representation='exact_normative_owner', evidence=quotes,
                            prior={'source': BASE, 'status': prior},
                            change='upgraded' if passed and prior != 'PASS' else 'carried')
                if passed:
                    cell['finding'] = ('ATS-3920 binds the complete executable family boundary in scripts/' + module + '.py: '
                                       'every owner branch has a real table predicate, an independently labelled single-defect '
                                       'witness and a gated cut; the full shared corpus runs through the boundary. Proof: '
                                       + str(facts['proved']) + '/' + str(facts['rows']) + ' rows in ' + str(len(facts['tables']))
                                       + ' tables, none unproved. Native execution remains NOT_RUN.')
                    cell['change_reason'] = 'The family boundary named as the C12 gap is executed and proved; see the C12-SL report.'
                elif family in OPEN:
                    cell['finding'] = ('ATS-3920 executes the complete deletion boundary (admission order, zero-effect refusals, '
                                       'record CAS, producer order, effects, payload, identity, envelope, retry identity and '
                                       'revalidation, replay, crash cuts, handlers, readers, withdrawal, restore, deadline), but '
                                       'states that no owner text defines the successor of a revalidated retry after failed. '
                                       'Criterion 12 stays PARTIAL on that owner definition. Proof: ' + str(facts.get('proved')) + '/'
                                       + str(facts.get('rows')) + ' rows.')
                    cell['change_reason'] = 'Boundary executed and proved; the retry-successor owner definition is still missing.'
                else:
                    cell['finding'] = 'The C12-SL evidence bundle did not pass in full; criterion 12 stays PARTIAL.'
                    cell['change_reason'] = 'Incomplete evidence bundle.'
            total += len(cell['evidence']); counts[cell['status']] += 1
            by_criterion.setdefault(criterion, collections.Counter())[cell['status']] += 1
        if 'disposition_evidence' in row:
            row['disposition_evidence'] = [anchor(ev) for ev in row['disposition_evidence']]
            total += len(row['disposition_evidence'])
        c12 = row['cells']['positive_negative_oracles']['status']
        row['remaining_gaps'] = [] if c12 == 'PASS' else ([GAP_DELETION] if family in OPEN
                                                         else ['Criterion 12: C12-SL evidence bundle incomplete.'])
        row['static_checks_seen'] = list(dict.fromkeys(row.get('static_checks_seen', []) +
                                                        ['scripts/pm-s3bo-check.py run (matrix / batteries / corpus / evidence / guards)']))
        row['current_owner_units'] = list(dict.fromkeys(row.get('current_owner_units', []) + ['ATS-3920']))
        row['pass_count'] = sum(cell['status'] == 'PASS' for cell in row['cells'].values())
        row['normative_depth_complete'] = row['pass_count'] == 12
        row['grading_batch'] = 'c12-sl'
        rows.append(row)
    report = copy.deepcopy(base)
    report.update(assessment_id='EA-PNC019-C12-SL-20261114', rows=rows,
                  scope='PNC-019 step S4 criterion-12 closure lane C12-SL: the four Storage compaction, deletion, hold and quarantine families.',
                  assessed_tree={'branch': 'plans/ea-pnc-c12-sl-20261114', 'commit': args.commit},
                  supersedes={'path': BASE, 'note': 'Supersedes these four rows only.'},
                  status_counts=dict(counts), status_counts_by_criterion={k: dict(v) for k, v in by_criterion.items()},
                  normative_depth_complete_families=[r['event_type'] for r in rows if r['normative_depth_complete']],
                  pass_counts={r['event_type']: r['pass_count'] for r in rows}, evidence_items=total,
                  quote_check={'exact': total}, guard_proof=proofs, run_summary=summary,
                  method={'rubric': base['method']['rubric'],
                          'grading': 'Criterion 12 PASS requires the full C12-SL bundle (matrix, batteries, corpus, extension evidence) to pass and every row of the family tables to be proved by the gated tool; every quote exact-checked. Other cells carried and re-anchored.'},
                  note='Native execution remains NOT_RUN for every family.')
    (ROOT / (OUT + '.json')).write_text(json.dumps(report, indent=1) + '\n')
    lines = ['# PNC-019 C12-SL depth re-grade', '', 'Implementation: `' + args.commit + '`. Every quote is exact-checked against this tree.', '',
             '| Family | PASS cells | Criterion 12 before | Criterion 12 after | Proof rows |', '|---|---:|---|---|---|']
    for row in rows:
        cell = row['cells']['positive_negative_oracles']; facts = proofs[row['event_type']]
        lines.append('| `' + row['event_type'] + '` | ' + str(row['pass_count']) + '/12 | ' + cell['prior']['status'] + ' | '
                     + cell['status'] + ' | ' + str(facts.get('proved')) + '/' + str(facts.get('rows')) + ' |')
    lines += ['', 'Totals: ' + str(dict(counts)) + '. Native execution is NOT_RUN. Evidence and remaining gaps are in the JSON companion.', '']
    (ROOT / (OUT + '.md')).write_text('\n'.join(lines))
    print(json.dumps({'status_counts': dict(counts), 'exact_quotes': total, 'pass_counts': report['pass_counts'],
                      'complete': report['normative_depth_complete_families']}))


if __name__ == '__main__':
    main()
