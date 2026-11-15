#!/usr/bin/env python3
"""PNC-019 C12-GC: the four families' depth grades with a fresh criterion-12 cell.

Rows start from the latest exact-family grades: goal.blocked and goal.completed from
reports/event-authority-20261115/PNC019-S3AO-grades-core.json (s3a's cells), goal_run.stopped and goal_run.blocked
from reports/event-authority-20261114/PNC019-S3D-grades.json. Every inherited quote is re-anchored to this tree
(same text, nearest occurrence; excerpt and file hashes recomputed); a quote that is no longer present fails the
build. Only the positive_negative_oracles cell is rewritten, from the committed GC bundle. Check the output with
scripts/pm-pnc019-s3a-grade-check.py.
Usage: python3 scripts/pm-goal-gc-grades.py --commit SHA [--out reports/event-authority-20261115/PNC019-C12-GC-grades.json]
"""
import argparse
import copy
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORDER = ['membership_version', 'owner_doc', 'producer', 'closed_payload_schema', 'scope_identity', 'replay_idempotency',
         'retention', 'redaction_custody', 'transitions', 'consumers_checkpoints', 'compatibility_withdrawal', 'positive_negative_oracles']
LETTER = {'PASS': 'P', 'PARTIAL': 'p', 'ABSENT': 'A', 'CONFLICT': 'C'}
SOURCES = {'goal.blocked': 'reports/event-authority-20261115/PNC019-S3AO-grades-core.json',
           'goal.completed': 'reports/event-authority-20261115/PNC019-S3AO-grades-core.json',
           'goal_run.stopped': 'reports/event-authority-20261114/PNC019-S3D-grades.json',
           'goal_run.blocked': 'reports/event-authority-20261114/PNC019-S3D-grades.json'}
_LINES = {}


def lines(path):
    if path not in _LINES:
        raw = (ROOT / path).read_bytes()
        _LINES[path] = (hashlib.sha256(raw).hexdigest(), raw.decode('utf-8').split('\n'))
    return _LINES[path]


def anchor(path, quote, start, span=1):
    file_sha, text = lines(path)
    hits = [i for i in range(len(text) - span + 1) if quote in '\n'.join(text[i:i + span])]
    if not hits:
        raise SystemExit(f'quote not found: {path}: {quote[:80]!r}')
    i = min(hits, key=lambda h: abs(h + 1 - start))
    excerpt = '\n'.join(text[i:i + span])
    return dict(path=path, line_start=i + 1, line_end=i + span, quote=quote,
                excerpt_sha256=hashlib.sha256(excerpt.encode()).hexdigest(), file_sha256=file_sha)


def reanchor(e):
    return anchor(e['path'], e['quote'], e['line_start'], e['line_end'] - e['line_start'] + 1)


def after(path, marker, quote):
    """The first line containing quote after the line containing marker."""
    _, text = lines(path)
    start = next(i for i, line in enumerate(text) if marker in line)
    i = next(i for i in range(start, len(text)) if quote in text[i])
    return anchor(path, quote, i + 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', required=True, help='the tree the grades assess')
    parser.add_argument('--out', type=Path, default=ROOT / 'reports/event-authority-20261115/PNC019-C12-GC-grades.json')
    args = parser.parse_args()
    core_path = 'reports/event-authority-20261115/PNC019-C12-GC-core.json'
    core = json.loads((ROOT / core_path).read_text())
    rows = []
    for family, source in SOURCES.items():
        doc = json.loads((ROOT / source).read_text())
        row = copy.deepcopy(next(r for r in doc['rows'] if r['event_type'] == family))
        for name in ORDER:
            row['cells'][name]['evidence'] = [reanchor(e) for e in row['cells'][name]['evidence']]
        before = row['cells']['positive_negative_oracles']['status']
        fam = core['families'][family]
        marker = f'  "{family}": {{'
        ok = fam['open_rows'] == 0 and core['totals']['lane_matrix_problems'] == 0 and not core['changed_during_run'] \
            and fam['retained_store_changed'] == 0 and fam['corpus_cases'] > 0 and fam['join_cases'] > 0 and fam['retained_cases'] > 0 \
            and fam['schema_uncovered'] == 0
        status = 'PASS' if ok else 'PARTIAL'
        checker = 'scripts/pm_goal_own_a_oracles.py' if fam['source'] == 'own_a' else 'scripts/pm_goal_own_b_oracles.py'
        evidence = [
            after(core_path, marker, f'"open_rows": {fam["open_rows"]}'),
            after(core_path, marker, f'"tool_proved": {fam["tool_proved"]}'),
            after(core_path, marker, f'"justified_singletons": {fam["justified_singletons"]}'),
            after(core_path, marker, f'"retained_store_changed": {fam["retained_store_changed"]}'),
            after(core_path, marker, f'"corpus_cases": {fam["corpus_cases"]}'),
            after(core_path, marker, f'"join_cases": {fam["join_cases"]}'),
            after(core_path, marker, f'"schema_uncovered": {fam["schema_uncovered"]}'),
            after(core_path, marker, f'"schema_clauses_killed": {fam["schema_clauses_killed"]}'),
            anchor('scripts/pm-goal-gc-schema-closure.py', 'with only that clause cut it ACCEPTS', 1),
            anchor('scripts/pm-goal-gc-guard-tables.py', 'A kill is counted only when the cut complete checker ACCEPTS', 1),
            anchor('scripts/pm-goal-gc-guard-tables.py', 'real observation vectors: controls', 1),
            anchor('scripts/pm_goal_gc_adapter.py', 'predicate, field = _predicate(key)', 1),
            anchor(checker, 'adapter.retained_reason(', 1),
            anchor(checker, "corpus = ", 1),
        ]
        classes = fam['outcome_classes']
        finding = (f"Criterion-12 re-grade (PNC-019 C12-GC). Complete checker {checker} with every owner predicate a named row of a "
                   f"generated phase table (at most 8 rows) decided only by that table; the gated tool 004bdedd63 ran on real "
                   f"observation vectors (controls from accepted complete calls, negatives from cut runs in which every other row "
                   f"of the phase was computed on the defective input). Family rows {fam['rows']}: {fam['tool_proved']} tool-proved, "
                   f"{fam['justified_singletons']} justified singletons, {fam['open_rows']} open. Negative cases {fam['negative_cases']} "
                   f"(declared targets from the suites): {json.dumps(classes, sort_keys=True)}; a kill needs the cut checker to accept "
                   f"and the restored checker to refuse with the same code; duplicate-set kills are counted apart. Shared number corpus "
                   f"and date-time corpus through this checker ({fam['corpus_cases']} cases), sealed-receipt retained reads "
                   f"({fam['retained_cases']} cases; {fam['retained_store_reads']} store observations, {fam['retained_store_changed']} "
                   f"changed), distinct-copy joins ({fam['join_cases']} cases). Schema closure over every whole-definition root the family "
                   f"reaches (PNC019-C12-GC-schema-closure.json): {fam['schema_clauses_killed']} clause occurrences KILLED (clause cut "
                   f"accepts, restored refuses), {fam['schema_clauses_covered_later']} COVERED_LATER with the later clause named, "
                   f"{fam['schema_uncovered']} uncovered" + (': ' + ', '.join(fam['schema_uncovered_list']) if fam['schema_uncovered_list'] else '') +
                   ". Native execution NOT_RUN.")
        row['cells']['positive_negative_oracles'] = dict(status=status, finding=finding, evidence=evidence,
                                                         prior_status=before, prior_source=source)
        row['vector'] = ' '.join(LETTER[row['cells'][c]['status']] for c in ORDER)
        row['pass_count'] = sum(row['cells'][c]['status'] == 'PASS' for c in ORDER)
        row['criterion_12_before'] = before
        rows.append(row)
    out = dict(schema_id='pm.pnc019.c12_gc.depth_grades.v1', grade='after',
               assessed_tree=dict(commit=args.commit, branch='plans/ea-pnc-c12-gc-20261114',
                                  note='Grades the tree at this commit; the bundle and grade file are committed after it.'),
               rubric='/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-20260924/rubric.md',
               criteria=ORDER, status_meaning='PASS/PARTIAL/ABSENT/CONFLICT as in the rubric; a PASS grades owner text and '
               'static oracles, never native or runtime proof. Native execution NOT_RUN.',
               grading_basis='Only criterion 12 is re-graded; the other eleven cells are carried from their sources with every '
               'quote re-anchored to this tree. goal.blocked/goal.completed keep s3a\'s registered-row basis for criteria 4-5; '
               'goal_run.* keep s3d\'s prepared-successor basis (the S5b registry switch is separate).',
               oracle_bar='lanes/C12-RUN.md and the s3ao conformance review (reviews/PNC019-s3ao-c12-conformance/REVIEW.md G1-G6).',
               rows=rows)
    args.out.write_text(json.dumps(out, indent=1) + '\n')
    print(json.dumps({r['event_type']: dict(before=r['criterion_12_before'], after=r['cells']['positive_negative_oracles']['status'],
                                            vector=r['vector'], pass_count=r['pass_count']) for r in rows}, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
