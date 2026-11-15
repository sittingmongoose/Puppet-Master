#!/usr/bin/env python3
"""C12-SS: re-grade criterion 12 for the five SS families from exact owner quotes.

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
OUT = 'reports/event-authority-20261114/depth-c12-ss-families'
ATS = 'Plans/Automated_Testing_System.md'
SP = 'Plans/storage-plan.md'
NT = 'Plans/newtools.md'
FAMILIES = {
    'platform.capability_evaluated': ('ss_platform', 'pm_s3bo_ext_ss_platform'),
    'seglog.event_appended': ('ss_seglog', 'pm_s3bo_ext_ss_seglog'),
    'storage.boot_recovery': ('ss_boot', 'pm_s3bo_ext_ss_boot'),
    'storage.integrity_detected': ('ss_integrity', 'pm_s3bo_ext_ss_integrity'),
    'storage.recovery_applied': ('ss_recovery', 'pm_s3bo_ext_ss_recovery'),
}
QUOTES = {
    'platform.capability_evaluated': [
        (ATS, 'ATS-3900', 'For `platform.capability_evaluated`, the N2-157 evaluation is executed over the original request, its independently authenticated context and every supplied source fact'),
        (ATS, 'ATS-3900', 'so the CAP-POS-009 alias positive has no admissible input and its defined outcome, quarantine, is what executes'),
        (NT, 'N2-157', 'Choose live_runtime_discovery, provider_policy_snapshot, static_platform_baseline in that order; lower valid evidence remains provenance and cannot override.'),
    ],
    'seglog.event_appended': [
        (ATS, 'ATS-3900', 'For `seglog.event_appended`, the SP-270 producer is executed'),
        (ATS, 'ATS-3900', 'its stored reader tokens carry no `redb_snapshot_id`, its stored-snapshot negatives refuse'),
        (SP, 'SP-270', 'The v4-root pin in `Plans/seglog_append_observability_contract_fixtures.json#/external_joined_subject`'),
        (SP, 'SP-2210', 'Its relational oracle suite must store that nine-field token, with a stored-snapshot negative, before criterion 12 can pass.'),
    ],
    'storage.boot_recovery': [
        (ATS, 'ATS-3900', 'For `storage.boot_recovery`, the SP-291, SP-292 and SP-2205 boundary is executed'),
        (ATS, 'ATS-3900', 'post-restore issuance only through SP-286 fresh admission, a restored pending intent never first-minting and a surviving exact receipt replayed'),
        (SP, 'SP-2205', 'no restored pending Boot intent is first-minted; a surviving exact receipt is replayed as before.'),
    ],
    'storage.integrity_detected': [
        (ATS, 'ATS-3900', 'The full-uint64 downstream route is the shared qualified RFC 8785 digest'),
        (ATS, 'ATS-3900', 'The `exact_event` route joins unique UTF-8-byte-sorted refs to header-verified witnesses and corroborating source frames inside the affected ranges, never to advisory index rows.'),
        (SP, 'SP-279', 'refuses before any effect under CV-1100; the durable finding stays pending under section 5'),
    ],
    'storage.recovery_applied': [
        (ATS, 'ATS-3900', 'For `storage.recovery_applied`, the SP-293 capsule boundary is executed over the six action fixtures'),
        (ATS, 'ATS-3900', 'and typed unavailable for any missing proof, permission or foreign selector.'),
        (SP, 'SP-2207', '`translate_by_semantic_identity` and `activate_verified_target_shadow` are `storage.compaction_lifecycle_changed` tokens and never occur in this payload.'),
    ],
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
                passed = run_ok and complete
                prior = cell['status']
                cell.update(status='PASS' if passed else 'PARTIAL', representation='exact_normative_owner', evidence=quotes,
                            prior={'source': BASE, 'status': prior},
                            change='upgraded' if passed and prior != 'PASS' else 'carried')
                if passed:
                    cell['finding'] = ('ATS-3900 binds the complete executable family boundary in scripts/' + module + '.py: '
                                       'every owner branch has a real table predicate, an independently labelled single-defect '
                                       'witness and a gated cut; the full shared corpus runs through the boundary. Proof: '
                                       + str(facts['proved']) + '/' + str(facts['rows']) + ' rows in ' + str(len(facts['tables']))
                                       + ' tables, none unproved. Native execution remains NOT_RUN.')
                    cell['change_reason'] = 'The family boundary named as the C12 gap is executed and proved; see the C12-SS report.'
                else:
                    cell['finding'] = 'The C12-SS evidence bundle did not pass in full; criterion 12 stays PARTIAL.'
                    cell['change_reason'] = 'Incomplete evidence bundle.'
            total += len(cell['evidence']); counts[cell['status']] += 1
            by_criterion.setdefault(criterion, collections.Counter())[cell['status']] += 1
        if 'disposition_evidence' in row:
            row['disposition_evidence'] = [anchor(ev) for ev in row['disposition_evidence']]
            total += len(row['disposition_evidence'])
        c12 = row['cells']['positive_negative_oracles']['status']
        row['remaining_gaps'] = [] if c12 == 'PASS' else ['Criterion 12: C12-SS evidence bundle incomplete.']
        row['static_checks_seen'] = list(dict.fromkeys(row.get('static_checks_seen', []) +
                                                        ['scripts/pm-s3bo-check.py run (matrix / batteries / corpus / evidence / guards)']))
        row['current_owner_units'] = list(dict.fromkeys(row.get('current_owner_units', []) + ['ATS-3900']))
        row['pass_count'] = sum(cell['status'] == 'PASS' for cell in row['cells'].values())
        row['normative_depth_complete'] = row['pass_count'] == 12
        row['grading_batch'] = 'c12-ss'
        rows.append(row)
    report = copy.deepcopy(base)
    report.update(assessment_id='EA-PNC019-C12-SS-20261115', rows=rows,
                  scope='PNC-019 step S4 criterion-12 closure lane C12-SS: the platform, seglog, Boot, integrity and recovery families.',
                  assessed_tree={'branch': 'plans/ea-pnc-c12-ss-20261114', 'commit': args.commit},
                  supersedes={'path': BASE, 'note': 'Supersedes these five rows only.'},
                  status_counts=dict(counts), status_counts_by_criterion={k: dict(v) for k, v in by_criterion.items()},
                  normative_depth_complete_families=[r['event_type'] for r in rows if r['normative_depth_complete']],
                  pass_counts={r['event_type']: r['pass_count'] for r in rows}, evidence_items=total,
                  quote_check={'exact': total}, guard_proof=proofs, run_summary=summary,
                  method={'rubric': base['method']['rubric'],
                          'grading': 'Criterion 12 PASS requires the full C12-SS bundle (matrix, batteries, corpus, extension evidence) to pass and every row of the family tables to be proved by the gated tool; every quote exact-checked. Other cells carried and re-anchored.'},
                  note='Native execution remains NOT_RUN for every family.')
    (ROOT / (OUT + '.json')).write_text(json.dumps(report, indent=1) + '\n')
    lines = ['# PNC-019 C12-SS depth re-grade', '', 'Implementation: `' + args.commit + '`. Every quote is exact-checked against this tree.', '',
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
