#!/usr/bin/env python3
"""C12-SR: re-grade criterion 12 for the five SR families from exact owner quotes.

Supersedes only these five rows of depth-s3bo-registered-families.json. Every
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
OUT = 'reports/event-authority-20261114/depth-c12-sr-families'
ATS = 'Plans/Automated_Testing_System.md'
SP = 'Plans/storage-plan.md'
FAMILIES = {
    'restore_point.applied': ('sr_applied', 'pm_s3bo_ext_sr_applied'),
    'restore_point.corrupt': ('sr_corrupt', 'pm_s3bo_ext_sr_corrupt'),
    'restore_point.created': ('sr_created', 'pm_s3bo_ext_sr_created'),
    'restore_point.expired': ('sr_expired', 'pm_s3bo_ext_sr_expired'),
    'safe_point.recovery_unavailable': ('sr_recovery', 'pm_s3bo_ext_sr_recovery'),
}
QUOTES = {
    'restore_point.applied': [
        (ATS, 'ATS-3880', 'For `restore_point.applied`, every SP-2202 step-1 precondition and every UCC-126 reason'),
        (ATS, 'ATS-3880', 'a crash after each of reserve, materialize, record, append and first receipt resumes without a second branch or a second append'),
        (SP, 'SP-2202', 'A crash before (4) resumes from the row and the reserved IDs; a crash after (4) resolves the obligation or the original receipt.'),
    ],
    'restore_point.corrupt': [
        (ATS, 'ATS-3880', 'For `restore_point.corrupt`, the fixed precedence is executed over independent inputs'),
        (ATS, 'ATS-3880', 'a deletion or expiry commit excludes the corruption commit and a settled corruption refuses later branch, delete and expire'),
        (SP, 'SP-2203', 'Corruption, deletion (B1) and expiry (E1) admit in the same serialized domain'),
    ],
    'restore_point.expired': [
        (ATS, 'ATS-3880', 'For `restore_point.expired`, eligibility is executed exactly'),
        (ATS, 'ATS-3880', 'replays the SP-275 frozen joined package refrozen for DL-076'),
        (SP, 'SP-275', 'The v5 pin in `Plans/restore_point_expired_contract_fixtures.json#/frozen_joined_subject` is lineage only.'),
    ],
    'safe_point.recovery_unavailable': [
        (ATS, 'ATS-3880', 'For `safe_point.recovery_unavailable`, establishment runs classify, durability commit, barrier append, first receipt and only then offers actions'),
        (ATS, 'ATS-3880', 'withdrawal never release the anchor, and restore or ordinary retry refuses while it is unavailable'),
        (SP, 'SP-2204', 'withdrawal never releases an anchor'),
    ],
    'restore_point.created': [
        (ATS, 'ATS-3880', 'no owner text defines how the creation owner selects conversation-history properties into'),
        (ATS, 'ATS-3880', '`restore_point.created` criterion 12 stays open on that owner definition'),
    ],
}
GAP_CREATED = ('Criterion 12: ACD-465 defines no original capture constructor that selects conversation-history properties '
               'into context_refs, provenance_refs, attachment_refs and citation_refs (L05 source map, 2026-09-22). The '
               'checker preserves the frozen capture exactly and never infers an assignment; the owner must define the '
               'selection (question for Jared in drafts/PNC019/c12-sr/REPORT.md).')


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
                passed = family != 'restore_point.created' and run_ok and complete
                prior = cell['status']
                cell.update(status='PASS' if passed else 'PARTIAL', representation='exact_normative_owner', evidence=quotes,
                            prior={'source': BASE, 'status': prior},
                            change='upgraded' if passed and prior != 'PASS' else 'carried')
                if passed:
                    cell['finding'] = ('ATS-3880 binds the complete executable family boundary in scripts/' + module + '.py: '
                                       'every owner branch has a real table predicate, an independently labelled single-defect '
                                       'witness and a gated cut; the full shared corpus runs through the boundary. Proof: '
                                       + str(facts['proved']) + '/' + str(facts['rows']) + ' rows in ' + str(len(facts['tables']))
                                       + ' tables, none unproved. Native execution remains NOT_RUN.')
                    cell['change_reason'] = 'The family boundary named as the C12 gap is executed and proved; see the C12-SR report.'
                elif family == 'restore_point.created':
                    cell['finding'] = ('ATS-3880 executes the creation-custody boundary (hash recipe and owner vectors, union and '
                                       'split equalities, rpc_ identity, joins, B1/B2/B3 order, crash recovery, completion), but '
                                       'states that no owner text defines the history-property to category capture constructor. '
                                       'Criterion 12 stays PARTIAL on that owner definition.')
                    cell['change_reason'] = 'Boundary executed; the capture-selection owner definition is still missing.'
                else:
                    cell['finding'] = 'The C12-SR evidence bundle did not pass in full; criterion 12 stays PARTIAL.'
                    cell['change_reason'] = 'Incomplete evidence bundle.'
            total += len(cell['evidence']); counts[cell['status']] += 1
            by_criterion.setdefault(criterion, collections.Counter())[cell['status']] += 1
        if 'disposition_evidence' in row:
            row['disposition_evidence'] = [anchor(ev) for ev in row['disposition_evidence']]
            total += len(row['disposition_evidence'])
        c12 = row['cells']['positive_negative_oracles']['status']
        row['remaining_gaps'] = [] if c12 == 'PASS' else ([GAP_CREATED] if family == 'restore_point.created'
                                                         else ['Criterion 12: C12-SR evidence bundle incomplete.'])
        row['static_checks_seen'] = list(dict.fromkeys(row.get('static_checks_seen', []) +
                                                        ['scripts/pm-s3bo-check.py run (matrix / batteries / corpus / evidence / guards)']))
        row['current_owner_units'] = list(dict.fromkeys(row.get('current_owner_units', []) + ['ATS-3880']))
        row['pass_count'] = sum(cell['status'] == 'PASS' for cell in row['cells'].values())
        row['normative_depth_complete'] = row['pass_count'] == 12
        row['grading_batch'] = 'c12-sr'
        rows.append(row)
    report = copy.deepcopy(base)
    report.update(assessment_id='EA-PNC019-C12-SR-20261114', rows=rows,
                  scope='PNC-019 step S4 criterion-12 closure lane C12-SR: the five restore-point and recovery-unavailable families.',
                  assessed_tree={'branch': 'plans/ea-pnc-c12-sr-20261114', 'commit': args.commit},
                  supersedes={'path': BASE, 'note': 'Supersedes these five rows only.'},
                  status_counts=dict(counts), status_counts_by_criterion={k: dict(v) for k, v in by_criterion.items()},
                  normative_depth_complete_families=[r['event_type'] for r in rows if r['normative_depth_complete']],
                  pass_counts={r['event_type']: r['pass_count'] for r in rows}, evidence_items=total,
                  quote_check={'exact': total}, guard_proof=proofs, run_summary=summary,
                  method={'rubric': base['method']['rubric'],
                          'grading': 'Criterion 12 PASS requires the full C12-SR bundle (matrix, batteries, corpus, extension evidence) to pass and every row of the family tables to be proved by the gated tool; every quote exact-checked. Other cells carried and re-anchored.'},
                  note='Native execution remains NOT_RUN for every family.')
    (ROOT / (OUT + '.json')).write_text(json.dumps(report, indent=1) + '\n')
    lines = ['# PNC-019 C12-SR depth re-grade', '', 'Implementation: `' + args.commit + '`. Every quote is exact-checked against this tree.', '',
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
