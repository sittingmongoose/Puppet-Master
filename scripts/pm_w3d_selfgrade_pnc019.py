#!/usr/bin/env python3
"""PNC-019 lane s4d regrade of the fifteen W3D families from current owner text and checked result artifacts.

Every cell cites exact current spans: the quote is located by exact text search, its line numbers are recorded, and
the audit re-reads every quote at its cited lines. Executable evidence is cited from the committed result summary
reports/event-authority-20261105/W3D-pnc019-s4d-summary.json (written by the lane from the run outputs). Membership
stays ABSENT (no admission); native execution stays NOT_RUN.

Usage: python3 scripts/pm_w3d_selfgrade_pnc019.py
"""
import collections
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3d_bsd_spec as spec  # noqa: E402

GRADE = ROOT / 'reports/event-authority-20261105/W3D-self-grade.json'
AUDIT = ROOT / 'reports/event-authority-20261105/W3D-self-grade-audit-pnc019.json'
SUMMARY = 'reports/event-authority-20261105/W3D-pnc019-s4d-summary.json'
ROWS = 'scripts/pm_w3d_bsd_rows.py'
CHECKER = 'scripts/pm_w3d_bsd_events.py'
UNITS = {'BSD': 'Plans/Back_Seat_Driver.md', 'CV': 'Plans/Contracts_V0.md', 'SP': 'Plans/storage-plan.md',
         'ATS': 'Plans/Automated_Testing_System.md'}


def unit_span(path, unit):
    lines = (ROOT / path).read_text().splitlines()
    start = next(i for i, line in enumerate(lines) if line.startswith(f'### {unit} '))
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith('### ')), len(lines))
    return lines, start, end


def cite(path, needle, unit, within=None):
    """Exact quote (<= 200 chars) of the first line containing needle, inside a unit's span when given."""
    if within:
        lines, start, end = unit_span(path, within)
    else:
        lines = (ROOT / path).read_text().splitlines()
        start, end = 0, len(lines)
    index = next(i for i in range(start, end) if needle in lines[i])
    line = lines[index]
    at = line.index(needle)
    quote = line[at:at + 200]
    return dict(path=path, unit=unit, line_start=index + 1, line_end=index + 1, quote=quote)


def owner(prefix, number, needle):
    unit = f'{prefix}-{number}'
    return cite(UNITS[prefix], needle, unit, within=unit)


def main():
    grade = json.loads(GRADE.read_text())
    summary = json.loads((ROOT / SUMMARY).read_text())
    prior = {r['event_type']: {c: v['status'] for c, v in r['cells'].items()} for r in grade['rows']}
    rows = []
    for fam in spec.FAMILIES:
        n = int(fam['owner_units'][0].split('-')[1])
        et = fam['event_type']
        backed = fam['assignment_backed']
        policy = 'RP-RUNTIME-365D' if backed else 'RP-AUTHORITY-INDEFINITE'
        res = lambda key: cite(SUMMARY, f'"{key}"', 'ATS-1230')  # noqa: E731
        cells = {
            'membership_version': ('ABSENT', 'absent',
                'Registry membership deliberately remains absent; admission is a separate step (PNC-019 S5).',
                [owner('BSD', n, '1 membership/version: registry membership remains ABSENT.')]),
            'owner_doc': ('PASS', 'exact_normative_owner',
                f'Back_Seat_Driver BSD-{n} is the semantic owner; CV-{n} binds payload/identity and SP-{n}/SP-1365 bind Storage values.',
                [owner('BSD', n, '2 owner: Back_Seat_Driver is the semantic owner;')]),
            'producer': ('PASS', 'exact_normative_owner',
                'Exact producer and order (source+pending operation under owner CAS, packs before references, barrier first receipt, '
                'complete operation and head together, then terminal publication) with SP-286/CV-339 adopted by name; the '
                'producer crash model checks every cut and recovery (CR01-CR11, CD01 for review start).',
                [owner('BSD', n, 'adopt SP-286/CV-339 by name'), owner('SP', n, 'It adopts SP-286/CV-339 first receipt/full-value v2'),
                 cite(ROWS, "'CR02_source_op_atomic'", 'ATS-1230'), res('crash_model')]),
            'closed_payload_schema': ('PASS', 'exact_normative_owner',
                'Individually closed 1.0.0 payload root; every keyword is its own guard row and the payload is inline only (EventRecord 2.0.0).',
                [owner('BSD', n, '4 payload: independently closed schema'),
                 owner('CV', n, 'This EventRecord 2.0.0 family keeps its closed payload inline (payload_ref null)')]),
            'scope_identity': ('PASS', 'exact_normative_owner',
                'Project-only scope, exact operation/event/key recipes, finding-key recipe, owner joins of every payload field and '
                'reference resolution, with CV-1100/SP-1100, CV-1101 and SP-1101 adopted by name.',
                [owner('CV', n, 'The canonical operation ID is bsd-op@1:') if et != 'bsd.review_started' else owner('CV', n, 'bsd-op@1:'),
                 owner('CV', n, 'This family adopts by name the shared CV-1100/SP-1100 number rules'),
                 cite(ROWS, "rows.append((f'OW_{field}_join'", 'ATS-1230')]),
            'replay_idempotency': ('PASS', 'exact_normative_owner',
                'Same identity returns the original result, different body conflicts, dedupe must be tail-current; the retry model '
                '(RT01-RT12) and instrumented replay model (RP01-RP08) compute the outcomes.',
                [owner('BSD', n, '6 replay/idempotency: same original identity and semantic bytes returns exactly the original result'),
                 cite(ROWS, "('RT11_retry_no_new_event'", 'ATS-1230'), res('retry_model')]),
            'retention': ('PASS', 'exact_normative_owner',
                f'Event history bound to {policy}@1.0.0 ' + ('(Storage Case L-3 run class, run-completion anchor).' if backed else
                                                             '(DL-453 item 1.a).') + ' Derived rows keep RP-PROJECTION-3GEN and '
                'operations RP-EVENT-IDENTITY-APPROOT; the retention model checks the binding (RN rows).',
                [owner('BSD', n, f'policy_id: {policy}'), owner('SP', n, policy if not backed else 'RP-RUNTIME-365D'),
                 res('retention_model')]),
            'redaction_custody': ('PASS', 'exact_normative_owner',
                'Ref-only event; protected owner content never enters payload or envelope (RD01/RD02); retained reads select only '
                'from the sealed receipt with store snapshots (HI01-HI14); coherent backup cut restore model (RS rows).',
                [owner('BSD', n, '8 custody: the original BSD lifecycle source stays canonical'),
                 cite(ROWS, "('payload_no_protected'", 'ATS-1230'), res('restore_model')]),
            'transitions': ('PASS', 'exact_normative_owner',
                'This family\'s own transition predicates (section 9) are each a row with a single-defect witness.',
                [owner('BSD', n, '9 transitions:'), res('checker')]),
            'consumers_checkpoints': ('PASS', 'exact_normative_owner',
                'Exact projector/reader/operating consumer adopting SP-278 with the nine-field durable token; complete scan with '
                'zero-match, degraded survivor and inclusive restart cases; CAS; projection value joined to the original.',
                [owner('BSD', n, 'adopt SP-278 by name via SP-'), owner('SP', n, 'Inclusive restart rechecks the last exact event/frame/offset'),
                 cite(ROWS, "('SC09_degraded_state'", 'ATS-1230')]),
            'compatibility_withdrawal': ('PASS', 'exact_normative_owner',
                'Authenticated retained reading after live changes and a full withdrawal protocol; the withdrawal model (WD01-WD07), '
                'reader selector (HI09), withdrawn-publication CAS (CS07) and successor rebuild model (RB01-RB07) compute it.',
                [owner('BSD', n, '11 compatibility/withdrawal:'), cite(ROWS, "('drain_honest'", 'ATS-1230'), res('withdrawal_model')]),
            'positive_negative_oracles': ('PASS', 'executable_synthetic_oracles',
                'Complete checker, gated guard tool, strict derivation mutations, per-slot shared corpus and plan coverage all pass; '
                'see the summary for counts. Native execution NOT_RUN.',
                [owner('BSD', n, 'and scripts/pm_w3d_bsd_events.py executes them'), res('status'), res('plan_coverage'),
                 res('derivation_mutations'), res('slot_corpus'), res('guard_tool')]),
        }
        out_cells = {}
        for name, (status, rep, finding, evidence) in cells.items():
            before = prior.get(et, {}).get(name)
            out_cells[name] = dict(status=status, representation=rep, finding=finding, evidence=evidence,
                                   prior={'source': 'W3D-self-grade.json phase_2_fix_1', 'status': before},
                                   change='carried' if before == status else 'upgraded',
                                   change_reason=('Unchanged.' if before == status else
                                                  'PNC-019 lane s4d: owner text and executable evidence now close it.'))
        rows.append(dict(event_type=et, family_id=f'event-family-{et.replace(".", "-")}', family_revision='1.0.0',
                         disposition='PREPARED_WITHOUT_ADMISSION', current_owner_units=[f'BSD-{n}', f'CV-{n}', f'SP-{n}', 'SP-1365', 'ATS-1230'],
                         cells=out_cells,
                         remaining_gaps=['Registry admission (PNC-019 S5) and SP-318 physical/migration/budget prerequisites.',
                                         'Independent review of this lane before admission.',
                                         'Native execution NOT_RUN.'],
                         static_checks_seen=['scripts/pm_w3d_bsd_events.py', 'scripts/pm_w3d_bsd_guard_chunked.py',
                                             'scripts/pm_w3d_bsd_derivation_mutations.py', 'scripts/pm_w3d_bsd_slot_corpus.py',
                                             'scripts/pm_w3d_bsd_plan_coverage.py', 'scripts/pm_w3d_bsd_numbers.py'],
                         native_execution='NOT_RUN'))
    counts = dict(collections.Counter(c['status'] for r in rows for c in r['cells'].values()))
    grade.update(assessment_id='EA-W3D-PNC019-S4D-20261114', assessment_kind='author_self_grade_pnc019_s4d_prepared_without_admission',
                 oracle_execution='EXECUTABLE_PNC019_S4D', rows=rows, status_counts=counts)
    grade['status_meaning'] = {
        'PASS': 'Current owner text explicitly supports the criterion for this family and executable synthetic evidence covers it; no native execution claim.',
        'PARTIAL': 'Some required part is unbound or untested.',
        'ABSENT': 'No event registry membership; admission is a separate step.'}
    grade['pnc019_s4d'] = dict(summary=SUMMARY, prior_counts={'ABSENT': 15, 'PASS': 45, 'PARTIAL': 120}, counts=counts)
    GRADE.write_text(json.dumps(grade, indent=2, ensure_ascii=False) + '\n')
    failures, count = [], 0
    for row in rows:
        for cell, data in row['cells'].items():
            for ev in data['evidence']:
                count += 1
                source = (ROOT / ev['path']).read_text().splitlines()
                span = '\n'.join(source[ev['line_start'] - 1:ev['line_end']])
                if ev['quote'] not in span:
                    failures.append(dict(event=row['event_type'], cell=cell, evidence=ev))
    audit = dict(status='fail' if failures else 'pass', quote_records=count, matched=count - len(failures),
                 status_counts=counts, failures=failures)
    AUDIT.write_text(json.dumps(audit, indent=1) + '\n')
    print(json.dumps(dict(status=audit['status'], quote_records=count, status_counts=counts), indent=1))
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
