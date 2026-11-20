#!/usr/bin/env python3
"""T224: CA-SEAL2's frozen 261-check suite on current main, with the fifth receipt (E9-1).

CA-SEAL2-checks.py (reports/event-authority-20261105) is a dated review artifact; its bytes are
never edited. This wrapper loads it, applies exactly three adaptations, and runs the full suite:

  1. Fixture adapter (s1v, drafts/PNC019/s1v/adapted/later-links-adapter.diff): the chain fixtures
     also copy the fifth receipt and its signed card/answer, stamp a fixture lander, sync the
     fifth prior-byte pin to the fourth receipt's fixture bytes, and anchor the fifth beside the
     earlier links (files[-1] stays the fourth).
  2. Intended re-expectation: deleting the fourth receipt now invalidates the fifth link too.
     negative_aggregate_receipt_oserror asserts exactly two issues, in order:
     recount_change_receipt_invalid then dl_pattern_change_receipt_invalid, both with the same
     FileNotFoundError detail for the fourth receipt path. Every other aggregate control keeps
     its exact-one-issue assertion.
  3. Source-table baseline: a new coverage table derived mechanically from the validator's
     current bytes (b1474596...), proved confined to s1v's reviewed diff before it is baselined.
     Its control-side consequence: the two frozen-edit probes' isolation precondition expects
     the baselined E9-1 frozen-line records (rebased through the probe's own edit) plus exactly
     the probe's deletion/insertion, and names only the probe's own identities. With the old
     empty frozen baseline the transformed precondition is byte-equivalent in behavior to the
     original, so --old-baseline reproduces the documented failures unchanged. The probes still
     refuse any frozen-line delta beyond baseline plus their own edit; the 200 random-edits
     control with the table byte-identical independently refuses every unreviewed edit.

Proof-path decision (mailed to pm-ea-lead as pm-ea-lead:1116021409-ff47, recorded in
drafts/PNC019/t224/STOP.md): the lane's proof command names
scripts/pm_event_authority_independent_validator.py, which exists in neither pinned commit nor
in main (git cat-file -e exits 128; the diff is empty). The validator's canonical path is the
checker's REL, Plans/.audits/event-authority-2026-08-12/independent-validator/
pm_event_authority_independent_validator.py, which is also both receipts' validator_path. The
proof runs against that path at the same pinned commits 7cf5636835..0a63bf3b7a. The wrapper
re-runs the lane's literal command and records its emptiness; it never baselines a difference
outside the reviewed diff.

Source-table proof obligations (all mechanical; any violation stops with a written report and
exit 2, and nothing is baselined):
  P1  old bytes (7cf5636835:REL) sha == committed table pin == FROZEN_SHA; s1v head bytes
      (0a63bf3b7a:REL) sha == current bytes == fifth receipt validator_after_sha256; the receipt
      chain links (fifth.before == fourth.after == table pin).
  P2  the reviewed diff, applied to the old bytes, rebuilds the current bytes exactly (CRLF
      preserved, byte-for-byte).
  P3  difflib's old-side changed set equals the git diff's old-side changed set; every new-side
      slide (difflib vs git) is a text-identical twin inside the same hunk's new range.
  P4  every row added to the table, or identity-changed, is confined to the reviewed diff:
      its node span meets a git-changed new line (or a proved slide twin), or it is unchanged
      old text newly inventoried because the reviewed diff made its function touched, or it is
      a node-row-to-census conversion in such a function, or it is the new semantic collection
      row whose except handler sits on a git-changed new line, or a historical record whose text
      is a git-minus line, or a frozen-line record on a git-changed line (slide twins allowed).
  P5  every dropped reviewed row's span meets a git-changed old line, or it is such a conversion.
  P6  carried rows change only line/end_line/site_id (plus recorded outcome conversions in
      newly touched functions); carried preservation claims re-verify against the computed
      occurrence map.
  P7  the derived table passes the checker's own validate_coverage on the current bytes.

New-row classification is deterministic: carried reviewed rows keep their reviewed fields;
preserved occurrences are computed by the checker's occurrence map; exact/positional/shape
donors from the reviewed table supply reviewed outcomes (kill claims inherit only within the
same function); data-producing calls take the reviewed generic data-operation record with a
freshly computed consumer chain; the remaining truth carriers on E9-1 lines take the explicit
classifications below, each citing the s1v review (PNC019-s1v-solmax, CLEAN_WITH_NOTES) and the
reviewed fourth-receipt precedent. An unclassifiable new row is a proof stop, never a guess.

Modes:
  default                     adapter + re-expectation + derived baseline; expect 261/261.
  --no-fixture-adapter        negative 1: adapter off (derived baseline + re-expectation kept).
  --old-baseline              negative 2: committed reviewed table + original expectations,
                              adapter on; reproduces the documented 249/261 picture exactly.
  --prove-only                derive + prove only; exit 0 pass, 2 refused.
  --proof-target PATH         prove against a temporary validator copy instead of repo/REL
                              (negative 3: an appended line outside the diff must be refused).

The wrapper writes only into its scratch directory and the run tree's coverage path (restored
after the run). It never writes the checker, the validator, any receipt, or Plans/Spec_Lock.json.
"""
import argparse
import ast
import copy
import difflib
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

CHECKER_REL = 'reports/event-authority-20261105/CA-SEAL2-checks.py'
CHECKER_SHA = '2df0b208d69a67176317025c3ec4642d2b714d126d7fce009da5c52f86ccbd8a'
COVERAGE_REL = 'reports/event-authority-20261105/CA-SEAL2-coverage.json'
BASE_COMMIT = '7cf5636835'
S1V_COMMIT = '0a63bf3b7a'
LANE_SCRIPTS_PATH = 'scripts/pm_event_authority_independent_validator.py'
FOURTH_RECEIPT_REL = 'reports/event-authority-20261105/seal-check-recount-receipt.json'
FIFTH_RECEIPT_REL = 'reports/event-authority-20261114/seal-check-dl-pattern-receipt.json'
CURRENT_SHA = 'b147459618e1c7f13ab1ba73ac03d270d40c8703690bd00239e3ac3d10ed3456'
REVIEW_MD = ('/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/'
             'PNC019-s1v-solmax/REVIEW.md')
S1V_CITATION = ('E9-1 fifth receipted change, reviewed in PNC019-s1v-solmax (Sol 6.1 max, '
                'CLEAN_WITH_NOTES, no REAL findings); diff ' + BASE_COMMIT + '..' + S1V_COMMIT)
DATA_REASON = ('Produces a data value (lookup, conversion, bytes, digest, path, collection or '
               'validated record). The enclosing data-flow below identifies its consumer; '
               'comparisons, truth tests, helper bodies and dispatch remain separately inventoried.')
PRESERVED_REASON = (
    'The coverage test computes this occurrence: function-by-function alignment of CA-SEAL '
    '17c842445a to the current validator places this node inside an unchanged source block, with '
    'the same type, expression, extent and enclosing context, at the cited baseline node, and no '
    'other row claims that baseline. This is a preservation outcome, not a guard-removal or '
    'accepting-input claim. Inserted, changed, re-contexted or new-function nodes have no '
    'counterpart and cannot hold it. T224: the occurrence became census-inventoried because the '
    'reviewed E9-1 diff touched its function; the occurrence itself is unchanged August code.')


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo)] + list(args))


class ProofStop(Exception):
    def __init__(self, report):
        super().__init__('source-table proof refused: ' + str(len(report['violations'])) + ' violation(s)')
        self.report = report


def review_evidence(selector):
    return [{'path': REVIEW_MD, 'selector': selector, 'verdict': 'CLEAN_WITH_NOTES'},
            {'path': 'reports/event-authority-20261116/CA-SEAL2-checks-fifth-link.py',
             'selector': 'T224 derived baseline'}]


# ---------------------------------------------------------------- reviewed diff parsing

def parse_reviewed_diff(diff_text, old_line_count):
    """Full old->new line map (context + offset), changed sets, texts, per-hunk content."""
    hunks = list(re.finditer(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@[^\n]*\n', diff_text, re.M))
    if not hunks:
        raise ProofStop({'violations': [{'rule': 'P2', 'detail': 'reviewed diff has no hunks'}]})
    full, git_old, git_new = {}, set(), set()
    minus_text, plus_text = {}, {}
    ranges, hunk_data = [], []
    pos, offset = 1, 0
    for k, m in enumerate(hunks):
        a, an = int(m.group(1)), int(m.group(2) or 1)
        b, bn = int(m.group(3)), int(m.group(4) or 1)
        end = hunks[k + 1].start() if k + 1 < len(hunks) else len(diff_text)
        for o in range(pos, a):
            full[o] = o + offset
        oi, ni = a, b
        lines = []
        for line in diff_text[m.end():end].split('\n'):
            if line.startswith('-'):
                git_old.add(oi); minus_text[oi] = line[1:].rstrip('\r'); oi += 1
                lines.append(('-', line[1:]))
            elif line.startswith('+'):
                git_new.add(ni); plus_text[ni] = line[1:].rstrip('\r'); ni += 1
                lines.append(('+', line[1:]))
            elif line.startswith(' '):
                full[oi] = ni; oi += 1; ni += 1
                lines.append((' ', line[1:]))
            elif line.startswith('\\'):
                pass
        if oi != a + an or ni != b + bn:
            raise ProofStop({'violations': [{'rule': 'P2', 'detail': 'hunk line counts disagree',
                                             'hunk': m.group(0)}]})
        offset += bn - an
        pos = oi
        ranges.append((b, b + bn - 1))
        hunk_data.append({'a': a, 'an': an, 'b': b, 'bn': bn, 'lines': lines})
    for o in range(pos, old_line_count + 1):
        full[o] = o + offset
    return {'full': full, 'git_old': git_old, 'git_new': git_new, 'minus_text': minus_text,
            'plus_text': plus_text, 'ranges': ranges, 'hunks': hunk_data}


def rebuild_bytes(old_raw, parsed):
    """Apply the parsed diff to the old bytes; return the rebuilt bytes (CRLF preserved)."""
    old_lines = old_raw.decode().split('\n')
    out, pos = [], 1
    for h in parsed['hunks']:
        out.extend(old_lines[pos - 1:h['a'] - 1])
        for kind, content in h['lines']:
            if kind in ('+', ' '):
                out.append(content)
        pos = h['a'] + h['an']
    out.extend(old_lines[pos - 1:])
    return '\n'.join(out).encode()


def replace_pairs(old_lines, new_lines):
    """difflib replace-block pairing (new line -> old line), index within each block."""
    pairs = {}
    matcher = difflib.SequenceMatcher(None, old_lines, new_lines, autojunk=False)
    for tag, a1, a2, b1, b2 in matcher.get_opcodes():
        if tag == 'replace':
            for i in range(min(a2 - a1, b2 - b1)):
                pairs[b1 + i + 1] = a1 + i + 1
    return pairs


# ---------------------------------------------------------------- checker loading

def load_checker(repo):
    raw = (repo / CHECKER_REL).read_bytes()
    if sha(raw) != CHECKER_SHA:
        raise ProofStop({'violations': [{'rule': 'frozen-checker', 'detail': 'checker bytes changed',
                                         'sha256': sha(raw)}]})
    spec = importlib.util.spec_from_file_location('ca_seal2_original', repo / CHECKER_REL)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return raw.decode(), module


# ---------------------------------------------------------------- span index

def build_span_index(source):
    tree = ast.parse(source)
    functions = {}
    for n in tree.body:
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions[n.name] = n
    index = {}
    for name, fn in functions.items():
        for n in ast.walk(fn):
            if getattr(n, 'lineno', None) is None:
                continue
            index.setdefault((name, n.lineno, n.col_offset), []).append(n)
    return tree, functions, index


def row_span(row, functions, index):
    """The source span of a census/walker row's anchor node, or None."""
    if row['function'] not in functions:
        return None
    line, col = row.get('line'), row.get('column')
    candidates = index.get((row['function'], line, col), [])
    expr = row.get('expression')
    for n in candidates:
        try:
            if ast.unparse(n) == expr:
                return n.lineno, n.end_lineno
        except (ValueError, TypeError):
            pass
    nt = row.get('node_type') or ''
    base = nt.split(' ')[0]
    for n in candidates:
        if type(n).__name__ == base:
            return n.lineno, n.end_lineno
    if nt in ('Try dispatch', 'TryStar dispatch', 'except dispatch', 'except alternative'):
        for n in candidates:
            if isinstance(n, (ast.Try, ast.TryStar, ast.ExceptHandler)):
                return n.lineno, n.end_lineno
    if candidates:
        n = candidates[0]
        return n.lineno, n.end_lineno
    return None


def consumer_chain(tree, functions, row):
    """Mechanical data-flow evidence: ancestors up to and including the enclosing statement."""
    fn = functions.get(row['function'])
    if fn is None:
        return [{'node_type': 'unknown', 'line': row.get('line'), 'expression': row.get('expression')}]
    links = {}
    for n in ast.walk(fn):
        for field, value in ast.iter_fields(n):
            for child in value if isinstance(value, list) else [value]:
                if isinstance(child, ast.AST):
                    links[id(child)] = n
    target = None
    for n in ast.walk(fn):
        if getattr(n, 'lineno', None) == row.get('line') and getattr(n, 'col_offset', None) == row.get('column'):
            try:
                if ast.unparse(n) == row.get('expression'):
                    target = n
                    break
            except (ValueError, TypeError):
                pass
    if target is None:
        return [{'node_type': row.get('node_type', 'node'), 'line': row.get('line'),
                 'expression': row.get('expression')}]
    chain, cur = [], target
    while id(cur) in links:
        cur = links[id(cur)]
        if getattr(cur, 'lineno', None) is None:
            break
        chain.append({'node_type': type(cur).__name__, 'line': cur.lineno, 'expression': ast.unparse(cur)})
        if isinstance(cur, (ast.stmt, ast.excepthandler)):
            break
    if not chain:
        chain = [{'node_type': type(target).__name__, 'line': target.lineno, 'expression': ast.unparse(target)}]
    return chain


# ---------------------------------------------------------------- explicit classifications

def duplicate_reason(new_desc, donor_desc, extra=''):
    return ('Same-predicate duplicate of the reviewed ' + donor_desc + '. ' + extra + ' '
            + S1V_CITATION + '. No CA-SEAL2 suite control varies this site independently, so no '
            'kill is claimed here; the fifth link\'s own refusal controls are the E9-1 checker '
            '(reports/event-authority-20261114/seal-check-dl-pattern-checks.py, 21 credited '
            'mutations in the s1v review), outside this suite\'s test names.')


FOURTH_GUARD = ('fourth-receipt identity guard (recount_change_state expected-map equality, '
                'killed by the negative_change_* battery)')
THIRD_GUARD = ('third-bridge guard (third_change_validator_pin, killed by '
               'negative_missing_fourth_anchor / negative_duplicate_fourth_anchor)')
ANCHOR_SET = ('Spec_Lock anchor-set predicate (recount_anchor at the reviewed fourth site; '
              'negative_missing_fourth_anchor / negative_duplicate_fourth_anchor remove the whole '
              'anchor set and the reviewed fourth-anchor clause alone still refuses')
BEFORE_PIN = ('receipt validator_before_sha256 identity equality (reviewed fourth-receipt '
              'expected-map check, killed by negative_change_validator_before_sha256)')
AFTER_PIN = ('fourth-receipt validator_after_sha256 identity (reviewed expected-map check, killed '
             'by negative_change_validator_after_sha256, and the third bridge equality)')
FORBIDDEN = ('seal_applier_forbidden_tasks equality (reviewed fourth-receipt lander controls '
             'negative_blank_lander / negative_missing_lander_from_seal_applier_list)')
FLAGS = ('authorization-flag False checks (reviewed fourth-receipt controls '
         'negative_change_seal_authorized / negative_change_admission_authorized / '
         'negative_change_contract_depth_complete)')
BRIDGE_PIN = ('byte-link bridge pin (reviewed multi_family_receipt_state '
              'third_change_validator_pin() inequality, killed by negative_third_semantic_after_hash)')
FALLBACK = ('live-hash fallback return (reviewed third_change_validator_pin return, killed by the '
            'legacy_predicate_preserved_under_* and bridge controls); every suite control reaching '
            'this fallback also fails the enclosing third bridge, whose reviewed fallback returns '
            'the same live hash, so cutting this return alone preserves every refusal')

# (function, line, column, node_type-or-kind) -> (outcome, reason, cut-or-None).
# Lines and columns are pinned by P1 (current bytes == b1474596...).
EXPLICIT = {
    ('admission_record_problems', 449, 12, 'Call'): (
        'implied',
        'The grammar refusal is carried by the separately inventoried section extraction: with the '
        'fullmatch cut to a truthy non-match, match.group(1) raises AttributeError, which '
        'validate_post_august_admissions catches as a malformed issue, so the record is still '
        'refused; removing the grammar and the section-hash/extraction chain together is what '
        'accepts. E9-1 widens the accepted number width to DL-1000..DL-9999 through the shared '
        'DL_REF constant; three-digit semantics, zero-padding refusal and the DL-077/DL-078 '
        'exclusions are preserved (s1v review scope item 1). ' + S1V_CITATION + '.', None),
    ('admission_record_problems', 449, 12, 'predicate call'): (
        'implied',
        'Walker row of the same fullmatch census anchor: the grammar refusal is carried by the '
        'inventoried section extraction (AttributeError on a truthy non-match is caught as '
        'malformed by validate_post_august_admissions). ' + S1V_CITATION + '.', None),
    ('dl_pattern_change_state', 955, 8, 'BoolOp'): (
        'same-predicate duplicate', duplicate_reason('fifth-receipt identity guard', FOURTH_GUARD), None),
    ('dl_pattern_change_state', 955, 8, 'If test'): (
        'same-predicate duplicate', duplicate_reason('fifth-receipt identity guard', FOURTH_GUARD), None),
    ('dl_pattern_change_state', 955, 8, 'branch'): (
        'same-predicate duplicate', duplicate_reason('fifth-receipt identity guard', FOURTH_GUARD), None),
    ('dl_pattern_change_state', 956, 15, 'Compare'): (
        'frozen-input only',
        'The E9-1 card bytes are the immutable signed decision artifact pinned at '
        'DL_PATTERN_CARD_SHA=b4809cf1361cd13a4adcb09b7ffabce4ad0b56d91d8bcb9c46655daa264cefa6 and '
        'again by the fifth receipt\'s authority.card.sha256; no run can supply different card '
        'bytes past those pins. ' + S1V_CITATION + '.', None),
    ('dl_pattern_change_state', 956, 15, 'Boolean clause'): (
        'frozen-input only', 'Clause of the frozen card-byte equality. ' + S1V_CITATION + '.', None),
    ('dl_pattern_change_state', 956, 15, 'comparison'): (
        'frozen-input only', 'Walker row of the frozen card-byte equality. ' + S1V_CITATION + '.', None),
    ('dl_pattern_change_state', 957, 15, 'Compare'): (
        'frozen-input only',
        'The E9-1 answer bytes are the immutable signed decision artifact pinned at '
        'DL_PATTERN_ANSWER_SHA=64e0bb3966b9b4efe353cfc4070922e2a68ca839312a0e2a088258ee0431246f and '
        'again by the fifth receipt\'s authority.answer.sha256; no run can supply different answer '
        'bytes past those pins. ' + S1V_CITATION + '.', None),
    ('dl_pattern_change_state', 957, 15, 'Boolean clause'): (
        'frozen-input only', 'Clause of the frozen answer-byte equality. ' + S1V_CITATION + '.', None),
    ('dl_pattern_change_state', 957, 15, 'comparison'): (
        'frozen-input only', 'Walker row of the frozen answer-byte equality. ' + S1V_CITATION + '.', None),
    ('dl_pattern_change_state', 959, 15, 'Compare'): (
        'same-predicate duplicate', duplicate_reason('forbidden-tasks list equality', FORBIDDEN), None),
    ('dl_pattern_change_state', 959, 15, 'Boolean clause'): (
        'same-predicate duplicate', duplicate_reason('forbidden-tasks list equality', FORBIDDEN), None),
    ('dl_pattern_change_state', 959, 15, 'comparison'): (
        'same-predicate duplicate', duplicate_reason('forbidden-tasks list equality', FORBIDDEN), None),
    ('dl_pattern_change_state', 960, 15, 'Call'): (
        'same-predicate duplicate', duplicate_reason('authorization-flag any() check', FLAGS), None),
    ('dl_pattern_change_state', 960, 15, 'Boolean clause'): (
        'same-predicate duplicate', duplicate_reason('authorization-flag any() check', FLAGS), None),
    ('dl_pattern_change_state', 962, 15, 'UnaryOp(Not)'): (
        'same-predicate duplicate', duplicate_reason('fifth-anchor check', ANCHOR_SET), None),
    ('dl_pattern_change_state', 962, 19, 'Call'): (
        'same-predicate duplicate', duplicate_reason('fifth-anchor check', ANCHOR_SET), None),
    ('dl_pattern_change_state', 962, 15, 'Boolean clause'): (
        'same-predicate duplicate', duplicate_reason('fifth-anchor check', ANCHOR_SET), None),
    ('dl_pattern_change_state', 963, 15, 'Compare'): (
        'same-predicate duplicate', duplicate_reason('fifth bridge-pin inequality', BRIDGE_PIN), None),
    ('dl_pattern_change_state', 963, 15, 'Boolean clause'): (
        'same-predicate duplicate', duplicate_reason('fifth bridge-pin inequality', BRIDGE_PIN), None),
    ('dl_pattern_change_state', 963, 15, 'comparison'): (
        'same-predicate duplicate', duplicate_reason('fifth bridge-pin inequality', BRIDGE_PIN), None),
    ('fourth_change_validator_pin', 876, 12, 'BoolOp'): (
        'same-predicate duplicate', duplicate_reason('fourth-pin exposure guard', THIRD_GUARD), None),
    ('fourth_change_validator_pin', 876, 12, 'If test'): (
        'same-predicate duplicate', duplicate_reason('fourth-pin exposure guard', THIRD_GUARD), None),
    ('fourth_change_validator_pin', 876, 12, 'branch'): (
        'same-predicate duplicate', duplicate_reason('fourth-pin exposure guard', THIRD_GUARD), None),
    ('fourth_change_validator_pin', 876, 12, 'Call'): (
        'same-predicate duplicate', duplicate_reason('fifth-anchor check', ANCHOR_SET), None),
    ('fourth_change_validator_pin', 876, 12, 'Boolean clause'): (
        'same-predicate duplicate', duplicate_reason('fifth-anchor check', ANCHOR_SET), None),
    ('fourth_change_validator_pin', 878, 20, 'Compare'): (
        'same-predicate duplicate', duplicate_reason('fifth-receipt before-pin equality', BEFORE_PIN), None),
    ('fourth_change_validator_pin', 878, 20, 'Boolean clause'): (
        'same-predicate duplicate', duplicate_reason('fifth-receipt before-pin equality', BEFORE_PIN), None),
    ('fourth_change_validator_pin', 878, 20, 'comparison'): (
        'same-predicate duplicate', duplicate_reason('fifth-receipt before-pin equality', BEFORE_PIN), None),
    ('fourth_change_validator_pin', 879, 20, 'Compare'): (
        'same-predicate duplicate', duplicate_reason('fourth-after chain-link equality', AFTER_PIN), None),
    ('fourth_change_validator_pin', 879, 20, 'Boolean clause'): (
        'same-predicate duplicate', duplicate_reason('fourth-after chain-link equality', AFTER_PIN), None),
    ('fourth_change_validator_pin', 879, 20, 'comparison'): (
        'same-predicate duplicate', duplicate_reason('fourth-after chain-link equality', AFTER_PIN), None),
    ('fourth_change_validator_pin', 880, 12, 'return'): (
        'structural',
        'This narrow cut interrupts a valid parent: replacing the frozen-hash return with the live '
        'hash makes third_change_validator_pin present the live bytes, and positive_fourth_receipt '
        'refuses with fourth amendment identity, authority, byte link or anchor mismatch. No '
        'acceptance is claimed. ' + S1V_CITATION + '.',
        {'function': 'fourth_change_validator_pin', 'expression': 'DL_PATTERN_BEFORE_SHA',
         'replacement': 'live', 'label': 'fifth_pin_constant_return'}),
    ('fourth_change_validator_pin', 883, 4, 'return'): (
        'same-predicate duplicate', duplicate_reason('live-hash fallback return', FALLBACK), None),
    ('third_change_validator_pin', 894, 20, 'Compare'): (
        'killed by',
        'E9-1 replaces the reviewed live-hash equality with the presented fourth-pin hash; the '
        'reviewed killing control still exercises this seam: a mutated fourth validator_after '
        'fails the fourth pin, the bridge presents the live hash, and this equality refuses. '
        + S1V_CITATION + '.',
        {'guard': 'I009_L863_third_change_validator_pin', 'function': 'third_change_validator_pin',
         'expression': "receipt.get('validator_after_sha256') == presented", 'replacement': True,
         't224_line': 894}),
    ('third_change_validator_pin', 894, 20, 'Boolean clause'): (
        'killed by', 'Clause of the reviewed after-hash equality, E9-1 presented form. ' + S1V_CITATION + '.',
        {'guard': 'I009_L863_third_change_validator_pin', 'function': 'third_change_validator_pin',
         'expression': "receipt.get('validator_after_sha256') == presented", 'replacement': True,
         't224_line': 894}),
    ('third_change_validator_pin', 894, 20, 'comparison'): (
        'killed by', 'Walker row of the reviewed after-hash equality, E9-1 presented form. ' + S1V_CITATION + '.',
        {'guard': 'I009_L863_third_change_validator_pin', 'function': 'third_change_validator_pin',
         'expression': "receipt.get('validator_after_sha256') == presented", 'replacement': True,
         't224_line': 894}),
}
EXPLICIT_KILLED_BY = {
    ('third_change_validator_pin', 894, 20, 'Compare'): ['legacy_predicate_preserved_under_validator_after_sha256'],
    ('third_change_validator_pin', 894, 20, 'Boolean clause'): ['legacy_predicate_preserved_under_validator_after_sha256'],
    ('third_change_validator_pin', 894, 20, 'comparison'): ['legacy_predicate_preserved_under_validator_after_sha256'],
}
# New callees whose results are data (digest string / validated record), mirroring the reviewed
# recount_change_state() / third_change_validator_pin() data-operation rows.
NEW_DATA_CALLEES = {'fourth_change_validator_pin', 'dl_pattern_change_state'}


def call_head(expression):
    m = re.match(r'^([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\(', expression)
    if not m:
        return None
    return m.group(1).split('.')[-1]


# ---------------------------------------------------------------- derivation

def derive_baseline(repo, c, new_raw, proof_target=False):
    report = {'violations': [], 'facts': {}, 'accounting': {}, 'classifications': []}
    violations = report['violations']

    def violate(rule, **detail):
        violations.append(dict(rule=rule, **detail))

    table = json.loads((repo / COVERAGE_REL).read_bytes())
    report['facts']['committed_table_sha256'] = sha((repo / COVERAGE_REL).read_bytes())
    old_raw = git(repo, 'show', BASE_COMMIT + ':' + c.REL)
    s1v_raw = git(repo, 'show', S1V_COMMIT + ':' + c.REL)
    fifth = json.loads((repo / FIFTH_RECEIPT_REL).read_bytes())
    fourth = json.loads((repo / FOURTH_RECEIPT_REL).read_bytes())
    report['facts'].update({
        'old_sha256': sha(old_raw), 's1v_head_sha256': sha(s1v_raw), 'current_sha256': sha(new_raw),
        'table_pin': table['validator_sha256'], 'frozen_sha': c.FROZEN_SHA,
        'fifth_before': fifth['validator_before_sha256'], 'fifth_after': fifth['validator_after_sha256'],
        'fourth_after': fourth['validator_after_sha256'], 'fifth_validator_path': fifth['validator_path'],
        'proof_target': proof_target})
    # P1 identity chain
    if sha(old_raw) != table['validator_sha256']:
        violate('P1', detail='old bytes differ from the committed table pin')
    if table['validator_sha256'] != c.FROZEN_SHA:
        violate('P1', detail='committed table pin is not FROZEN_SHA')
    if sha(s1v_raw) != sha(new_raw):
        violate('P1', detail='current bytes are not the reviewed s1v after-bytes',
                expected=sha(s1v_raw), actual=sha(new_raw))
    if fifth['validator_after_sha256'] != sha(new_raw):
        violate('P1', detail='current bytes differ from the fifth receipt after-hash')
    if not (fifth['validator_before_sha256'] == fourth['validator_after_sha256'] == table['validator_sha256']):
        violate('P1', detail='receipt chain before/after pins do not link')
    if fifth['validator_path'] != c.REL:
        violate('P1', detail='fifth receipt validator_path is not the checker REL')
    # The lane's literal command, recorded as a fact (path exists in no revision).
    lane_diff = git(repo, 'diff', BASE_COMMIT, S1V_COMMIT, '--', LANE_SCRIPTS_PATH)
    lane_present = subprocess.run(['git', '-C', str(repo), 'cat-file', '-e',
                                   BASE_COMMIT + ':' + LANE_SCRIPTS_PATH], capture_output=True)
    report['facts']['lane_literal_diff_empty'] = lane_diff == b''
    report['facts']['lane_literal_path_exit'] = lane_present.returncode
    report['facts']['proof_path'] = c.REL
    # P2 reviewed diff rebuilds the current bytes
    diff_text = git(repo, 'diff', BASE_COMMIT, S1V_COMMIT, '--', c.REL).decode()
    report['facts']['reviewed_diff_sha256'] = sha(diff_text.encode())
    old = old_raw.decode().replace('\r\n', '\n')
    new = new_raw.decode().replace('\r\n', '\n')
    ol, nl = c.source_lines(old), c.source_lines(new)
    parsed = parse_reviewed_diff(diff_text, len(ol))
    rebuilt = rebuild_bytes(old_raw, parsed)
    if proof_target:
        if rebuilt != s1v_raw:
            violate('P2', detail='reviewed diff does not rebuild the s1v head bytes')
    elif rebuilt != new_raw:
        violate('P2', detail='reviewed diff does not rebuild the current bytes')
    full, git_old, git_new = parsed['full'], parsed['git_old'], parsed['git_new']
    # P3 alignment agreement (old side exact; new side slide twins within the same hunk)
    blocks, dmap, marks = c.align_lines(list(range(1, len(ol) + 1)), ol,
                                        list(range(1, len(nl) + 1)), nl)
    dif_old = set(marks['deleted']) | set(marks['replaced'])
    dif_new = set(marks['inserted']) | set(marks['changed'])
    if dif_old != git_old:
        violate('P3', detail='difflib and git old-side changed sets differ',
                difflib_only=sorted(dif_old - git_old), git_only=sorted(git_old - dif_old))
    slide_new = set()
    for ln in sorted(dif_new - git_new):
        twins = [n for n in sorted(git_new - dif_new)
                 if nl[n - 1] == nl[ln - 1]
                 and any(a <= ln <= b and a <= n <= b for a, b in parsed['ranges'])]
        if not twins:
            violate('P3', detail='new-side slide line has no text-identical git twin in its hunk',
                    line=ln, text=nl[ln - 1][:80])
        else:
            slide_new.add(ln)
    for ln in sorted(git_new - dif_new):
        twins = [n for n in sorted(dif_new - git_new)
                 if nl[n - 1] == nl[ln - 1]
                 and any(a <= ln <= b and a <= n <= b for a, b in parsed['ranges'])]
        if not twins:
            violate('P3', detail='git new-side line has no difflib slide twin in its hunk',
                    line=ln, text=nl[ln - 1][:80])
    report['facts']['slide_new_lines'] = sorted(slide_new)
    changed_new = git_new | slide_new
    inv = {n: o for o, n in full.items()}
    pairs = replace_pairs(ol, nl)
    donor_line = dict(inv)
    donor_line.update(pairs)

    before = git(repo, 'show', c.SEAL_BASE + ':' + c.REL).decode()
    frozen = c.frozen_source(repo)
    expected, touched, prev_nodes, counterparts, occ_totals, changed, historical, census = \
        c.coverage_model(new, before)
    nodes, partition = c.node_model(new, before)
    frozen_inv = c.frozen_line_inventory(new, frozen)
    if any(partition['problems'].values()):
        violate('P7', detail='node partition problems', problems=partition['problems'])
    old_touched = set(table['touched_functions'])
    newly_touched = sorted(set(touched) - old_touched)
    report['facts']['newly_touched_functions'] = newly_touched
    report['facts']['touched_count'] = len(touched)
    tree, functions, index = build_span_index(new)
    old_tree, old_functions, old_index = build_span_index(old)
    fn_changed = {}
    for name, fn in functions.items():
        start = min([fn.lineno] + [d.lineno for d in fn.decorator_list])
        fn_changed[name] = bool(changed_new.intersection(range(start, fn.end_lineno + 1)))

    rb = c.rebase_lines(copy.deepcopy(table), full.get)
    derived = copy.deepcopy(table)

    def span_of(row, which):
        if 'end_line' in row:
            return row['line'], row['end_line']
        fns, idx = (functions, index) if which == 'new' else (old_functions, old_index)
        return row_span(row, fns, idx)

    def confined_new(row):
        sp = span_of(row, 'new')
        if sp and changed_new.intersection(range(sp[0], sp[1] + 1)):
            return 'diff-span'
        fn = row.get('function')
        if fn in newly_touched and fn_changed.get(fn):
            o = inv.get(row['line'])
            if o is not None and ol[o - 1] == nl[row['line'] - 1]:
                return 'newly-touched-unchanged-text'
        return None

    def confined_drop(row):
        sp = span_of(row, 'old')
        if sp and git_old.intersection(range(sp[0], sp[1] + 1)):
            return 'diff-span'
        fn = row.get('function')
        if fn in newly_touched and fn_changed.get(fn):
            return 'newly-touched-conversion'
        return None

    def moved_sid(r0, group):
        """The site id a reviewed row takes after the rebase, or None if its line vanished."""
        if group in ('sites', 'supplement'):
            if 'line' not in r0:
                return r0['site_id']
            ml = full.get(r0['line'])
            if ml is None:
                return None
            ident = {k: r0[k] for k in ('function', 'line', 'column', 'expression', 'kind')}
            ident['line'] = ml
            return r0['site_id'].split(':')[0] + ':' + sha(json.dumps(ident, sort_keys=True).encode())
        keys = c.CHANGED_IDENTITY if group == 'changed_line_nodes' else c.NODE_IDENTITY
        prefix = 'changed' if group == 'changed_line_nodes' else 'node'
        ml, me = full.get(r0['line']), full.get(r0['end_line'])
        if ml is None or me is None:
            return None
        ident = {k: r0[k] for k in keys}
        ident['line'], ident['end_line'] = ml, me
        return prefix + ':' + sha(json.dumps(ident, sort_keys=True).encode())

    def node_conversion(r0):
        ml = full.get(r0['line'])
        conv = [s for s in exp_sup.values()
                if s['function'] == r0['function'] and s['line'] == ml
                and s['column'] == r0['column'] and s['expression'] == r0['expression']]
        if conv and r0['function'] in newly_touched:
            return 'node-to-census-conversion'
        return None

    def drop_accounting(group, exp, acc, convert_check=None):
        """P5 over the ORIGINAL reviewed rows (old coordinates), including rebase deletions."""
        for r0 in table[group]:
            if group == 'sites' and r0['site_id'].startswith('semantic:'):
                continue
            sid = moved_sid(r0, group)
            if sid is not None and sid in exp:
                continue
            if sid is None:
                if r0['line'] not in git_old:
                    violate('P5', group=group, site_id=r0['site_id'], function=r0.get('function'),
                            line=r0['line'], detail='rebase-dropped row is not on a reviewed minus line')
                acc['dropped'] += 1
                continue
            how = confined_drop(r0)
            if how is None and convert_check is not None:
                how = convert_check(r0)
            if how is None:
                violate('P5', group=group, site_id=r0['site_id'], function=r0.get('function'),
                        line=r0.get('line'), expression=str(r0.get('expression'))[:120],
                        detail='dropped row not confined')
            acc['dropped'] += 1

    # data-producer heads: every reviewed row of that head is a data operation
    head_outcomes = {}
    type_outcomes = {}
    for r in table['supplement']:
        if r['outcome'] == 'preserved August predicate':
            continue
        if r['node_type'] == 'Call':
            h = call_head(r['expression'])
            if h:
                head_outcomes.setdefault(h, set()).add(r['outcome'])
        type_outcomes.setdefault(r['node_type'], set()).add(r['outcome'])
    data_heads = {h for h, os_ in head_outcomes.items()
                  if os_ == {'non-predicate data operation'}} | NEW_DATA_CALLEES
    data_node_types = {t for t, os_ in type_outcomes.items()
                       if os_ == {'non-predicate data operation'} and t != 'Call'}

    def inherit(d, r, how):
        if d['outcome'] == 'preserved August predicate':
            return dict(outcome='same-predicate duplicate',
                        reason=duplicate_reason(r['expression'][:60] + ' (' + str(r.get('node_type', r.get('kind'))) + ')',
                                                'reviewed preserved occurrence ' + d['site_id']),
                        evidence=review_evidence(d['site_id'])), 'preserved-donor-duplicate'
        row = dict(outcome=d['outcome'], reason=(d.get('reason') or '') +
                   ' T224: carried through the reviewed ' + S1V_CITATION + '.',
                   evidence=copy.deepcopy(d.get('evidence') or []) + review_evidence(d['site_id']))
        for k in ('killed_by', 'cut', 'data_flow', 'baseline_expression', 'baseline_site_id',
                  'baseline_line'):
            if k in d:
                row[k] = copy.deepcopy(d[k])
        if row['outcome'] == 'non-predicate data operation':
            row['data_flow'] = consumer_chain(tree, functions, r)
            row['reason'] = DATA_REASON + ' T224: ' + how + ' from reviewed ' + d['site_id'] + '; ' + S1V_CITATION + '.'
        if row.get('cut') and isinstance(row['cut'], dict):
            if row['cut'].get('expression') == d['expression'] and d['expression'] != r['expression']:
                row['cut'] = dict(row['cut'], expression=r['expression'], t224_line=r['line'])
        return row, how

    def explicit_fields(key):
        outcome, reason, cut = EXPLICIT[key]
        row = dict(outcome=outcome, reason=reason, evidence=review_evidence(str(key)))
        if cut:
            row['cut'] = cut
        if outcome == 'killed by':
            row['killed_by'] = EXPLICIT_KILLED_BY[key]
        return row

    def classify_supplement(r):
        sid = r['site_id']
        if sid in counterparts:
            base = prev_nodes[counterparts[sid]]
            return dict(outcome='preserved August predicate', reason=PRESERVED_REASON,
                        baseline_expression=r['expression'], baseline_site_id=counterparts[sid],
                        baseline_line=base['line'],
                        evidence=[{'git_revision': c.SEAL_BASE, 'path': c.REL,
                                   'selector': counterparts[sid]}]), 'preserved'
        key = (r['function'], r['line'], r['column'], r['node_type'])
        if key in EXPLICIT:
            return explicit_fields(key), 'explicit'
        exact = [d for d in table['supplement']
                 if d['expression'] == r['expression'] and d['node_type'] == r['node_type']
                 and d['function'] == r['function']]
        if exact:
            return inherit(exact[0], r, 'exact-donor')
        o = donor_line.get(r['line'])
        if o is not None:
            pos = [d for d in table['supplement']
                   if d['function'] == r['function'] and d['line'] == o
                   and d['node_type'] == r['node_type']]
            if pos:
                return inherit(pos[0], r, 'positional-donor')
        if (r['node_type'] == 'Call' and call_head(r['expression']) in data_heads) \
                or r['node_type'] in data_node_types:
            return dict(outcome='non-predicate data operation', reason=DATA_REASON,
                        data_flow=consumer_chain(tree, functions, r),
                        evidence=review_evidence('data-operation ' + r['expression'][:60])), 'data-shape'
        exact_any = [d for d in table['supplement']
                     if d['expression'] == r['expression'] and d['node_type'] == r['node_type']]
        if exact_any:
            d = exact_any[0]
            if d['outcome'] not in ('killed by', 'preserved August predicate'):
                return inherit(d, r, 'exact-donor-cross-function')
            return dict(outcome='same-predicate duplicate',
                        reason=duplicate_reason(r['expression'][:60] + ' (' + r['node_type'] + ')',
                                                'reviewed ' + d['function'] + ' occurrence ' + d['site_id']),
                        evidence=review_evidence(d['site_id'])), 'cross-function-duplicate'
        return None, 'UNCLASSIFIED'

    def classify_syntax(r):
        key = (r['function'], r['line'], r['column'], r['kind'])
        if key in EXPLICIT:
            return explicit_fields(key), 'explicit'
        exact = [d for d in table['sites'] if d['site_id'].startswith('syntax:')
                 and d['expression'] == r['expression'] and d['kind'] == r['kind']
                 and d['function'] == r['function']]
        if exact:
            return inherit(exact[0], r, 'exact-donor')
        o = donor_line.get(r['line'])
        if o is not None:
            pos = [d for d in table['sites'] if d['site_id'].startswith('syntax:')
                   and d['function'] == r['function'] and d['line'] == o and d['kind'] == r['kind']]
            if pos:
                return inherit(pos[0], r, 'positional-donor')
        exact_any = [d for d in table['sites'] if d['site_id'].startswith('syntax:')
                     and d['expression'] == r['expression'] and d['kind'] == r['kind']]
        if exact_any:
            d = exact_any[0]
            if d['outcome'] not in ('killed by', 'preserved August predicate'):
                return inherit(d, r, 'exact-donor-cross-function')
            return dict(outcome='same-predicate duplicate',
                        reason=duplicate_reason(r['expression'][:60] + ' (' + r['kind'] + ')',
                                                'reviewed ' + d['function'] + ' occurrence ' + d['site_id']),
                        evidence=review_evidence(d['site_id'])), 'cross-function-duplicate'
        return None, 'UNCLASSIFIED'

    # ---- sites (syntax + semantic)
    exp_syn = {s: r for s, r in expected.items() if s.startswith('syntax:')}
    exp_sem = {s: r for s, r in expected.items() if s.startswith('semantic:')}
    rb_syn = {r['site_id']: r for r in rb['sites'] if r['site_id'].startswith('syntax:')}
    old_sem = {r['site_id']: r for r in table['sites'] if r['site_id'].startswith('semantic:')}
    new_sites, kept_sites = [], []
    acc = {'carried': 0, 'new': 0, 'dropped': 0}
    for sid, r in exp_syn.items():
        if sid in rb_syn:
            kept_sites.append(rb_syn[sid])
            acc['carried'] += 1
            continue
        how = confined_new(r)
        if how is None:
            violate('P4', group='sites', site_id=sid, function=r['function'], line=r['line'],
                    expression=r['expression'][:120], detail='new row not confined to the reviewed diff')
            how = 'UNCONFINED'
        fields, cls = classify_syntax(r)
        if fields is None:
            violate('P4', group='sites', site_id=sid, detail='unclassifiable new walker row',
                    function=r['function'], line=r['line'], expression=r['expression'][:120])
            fields = dict(outcome='implied', reason='UNCLASSIFIED', evidence=[])
        new_sites.append(dict(r, **fields))
        report['classifications'].append({'group': 'sites', 'function': r['function'], 'line': r['line'],
                                          'kind': r['kind'], 'classification': cls, 'confinement': how,
                                          'outcome': fields['outcome']})
        acc['new'] += 1
    drop_accounting('sites', exp_syn, acc)
    # semantic rows: carry old; new labels must come from a new except handler on a diff line
    sem_handlers = {}
    rv = functions.get('recount_validation')
    if rv is not None:
        for n in ast.walk(rv):
            if isinstance(n, ast.ExceptHandler):
                for d in ast.walk(n):
                    if isinstance(d, ast.Dict):
                        for k, v in zip(d.keys, d.values):
                            if isinstance(k, ast.Constant) and k.value == 'error' and isinstance(v, ast.Constant):
                                sem_handlers['collect ' + v.value + ' before completion'] = n.lineno
    kept_sem = []
    for sid, r in old_sem.items():
        if sid in exp_sem:
            kept_sem.append(r)
        else:
            violate('P5', group='semantic', site_id=sid, detail='reviewed semantic row vanished')
    for sid, r in exp_sem.items():
        if sid in old_sem:
            continue
        label = r['predicate']
        hline = sem_handlers.get(label)
        if hline is None or hline not in git_new:
            violate('P4', group='semantic', site_id=sid, handler_line=hline,
                    detail='new semantic collection row has no except handler on a reviewed diff line')
        error = label[len('collect '):-len(' before completion')]
        kept_sem.append(dict(r, outcome='killed by',
                             killed_by=['negative_aggregate_receipt_oserror'],
                             cut={'guard': 'aggregate_collect_' + error},
                             reason='The fifth collection handler is new in the reviewed E9-1 diff; '
                                    'negative_aggregate_receipt_oserror (T224 re-expectation) asserts '
                                    'the dl_pattern_change_receipt_invalid issue is collected before '
                                    'completion when the fourth receipt is deleted. Removing the handler '
                                    'propagates the OSError and fails that control. ' + S1V_CITATION + '.',
                             evidence=review_evidence(sid)))
        report['classifications'].append({'group': 'semantic', 'site_id': sid,
                                          'classification': 'new-handler', 'handler_line': hline})
    derived['sites'] = kept_sites + new_sites + kept_sem
    report['accounting']['sites'] = acc

    # ---- supplement
    exp_sup = {s: r for s, r in expected.items() if s.startswith('supplement:')}
    rb_sup = {r['site_id']: r for r in rb['supplement']}
    new_sup, kept_sup = [], []
    acc = {'carried': 0, 'new': 0, 'dropped': 0, 'preserved': 0}
    for sid, r in exp_sup.items():
        if sid in rb_sup:
            row = rb_sup[sid]
            if row['outcome'] == 'preserved August predicate':
                if counterparts.get(sid) != row.get('baseline_site_id'):
                    violate('P6', group='supplement', site_id=sid,
                            detail='carried preservation claim no longer matches the occurrence map')
                acc['preserved'] += 1
            kept_sup.append(row)
            acc['carried'] += 1
            continue
        how = confined_new(r)
        if how is None:
            violate('P4', group='supplement', site_id=sid, function=r['function'], line=r['line'],
                    expression=r['expression'][:120], detail='new row not confined to the reviewed diff')
            how = 'UNCONFINED'
        fields, cls = classify_supplement(r)
        if fields is None:
            violate('P4', group='supplement', site_id=sid, detail='unclassifiable new census row',
                    function=r['function'], line=r['line'], node_type=r['node_type'],
                    expression=r['expression'][:120])
            fields = dict(outcome='implied', reason='UNCLASSIFIED', evidence=[])
        new_sup.append(dict(r, **fields))
        report['classifications'].append({'group': 'supplement', 'function': r['function'],
                                          'line': r['line'], 'node_type': r['node_type'],
                                          'classification': cls, 'confinement': how,
                                          'outcome': fields['outcome']})
        acc['new'] += 1
    drop_accounting('supplement', exp_sup, acc)
    derived['supplement'] = kept_sup + new_sup
    report['accounting']['supplement'] = acc

    # ---- changed_line_nodes
    rb_ch = {r['site_id']: r for r in rb['changed_line_nodes']}
    new_ch, kept_ch = [], []
    acc = {'carried': 0, 'new': 0, 'dropped': 0}
    for sid, r in changed.items():
        if sid in rb_ch:
            row = rb_ch[sid]
            if row['outcome'] != r['required_outcome']:
                violate('P6', group='changed_line_nodes', site_id=sid,
                        detail='carried changed-line outcome drift',
                        reviewed=row['outcome'], required=r['required_outcome'])
            kept_ch.append(row)
            acc['carried'] += 1
            continue
        how = confined_new(r)
        if how is None:
            violate('P4', group='changed_line_nodes', site_id=sid, function=r['function'],
                    line=r['line'], detail='new row not confined')
            how = 'UNCONFINED'
        new_ch.append(dict(r, outcome=r['required_outcome'],
                           reason='E9-1 inserted or changed line of the reviewed s1v diff: '
                                  + r['node_class'] + ' node, ' + r['required_outcome']
                                  + ' as its exact class requires; census anchors and preserved '
                                  'occurrences are inventoried separately. ' + S1V_CITATION + '.',
                           evidence=review_evidence(sid)))
        acc['new'] += 1
    drop_accounting('changed_line_nodes', changed, acc)
    derived['changed_line_nodes'] = kept_ch + new_ch
    report['accounting']['changed_line_nodes'] = acc

    # ---- nodes
    rb_nd = {r['site_id']: r for r in rb['nodes']}
    new_nd, kept_nd = [], []
    acc = {'carried': 0, 'new': 0, 'dropped': 0, 'outcome_conversions': 0}
    for sid, r in nodes.items():
        if sid in rb_nd:
            row = rb_nd[sid]
            if row['outcome'] != r['required_outcome']:
                if r['function'] in newly_touched:
                    report['classifications'].append(
                        {'group': 'nodes', 'function': r['function'], 'line': r['line'],
                         'classification': 'newly-touched-outcome-conversion',
                         'from': row['outcome'], 'to': r['required_outcome']})
                    row = dict(row, outcome=r['required_outcome'],
                               reason='T224 outcome conversion: the reviewed E9-1 diff touched this '
                                      'function, so its census now carries this node\'s truth '
                                      '(structural) or its class category applies; the node itself is '
                                      'unchanged August code. ' + S1V_CITATION + '.',
                               evidence=(row.get('evidence') or []) + review_evidence(sid))
                    acc['outcome_conversions'] += 1
                else:
                    violate('P6', group='nodes', site_id=sid, detail='carried node outcome drift',
                            reviewed=row['outcome'], required=r['required_outcome'])
            kept_nd.append(row)
            acc['carried'] += 1
            continue
        how = confined_new(r)
        if how is None:
            violate('P4', group='nodes', site_id=sid, function=r['function'], line=r['line'],
                    detail='new node row not confined')
        new_nd.append(dict(r, outcome=r['required_outcome'],
                           reason='E9-1 reviewed diff node row. ' + S1V_CITATION + '.',
                           evidence=review_evidence(sid)))
        acc['new'] += 1
    drop_accounting('nodes', nodes, acc, node_conversion)
    derived['nodes'] = kept_nd + new_nd
    report['accounting']['nodes'] = acc

    # ---- historical_lines (August-anchored; carry by site id)
    hist_old = {r['site_id']: r for r in table['historical_lines']}
    kept_hist, new_hist = [], []
    for sid, r in hist_old.items():
        if sid in historical:
            kept_hist.append(r)
        else:
            violate('P5', group='historical_lines', site_id=sid, detail='reviewed historical record vanished')
    for sid, r in historical.items():
        if sid in hist_old:
            continue
        twins = [o for o, t in parsed['minus_text'].items() if t == r['text']]
        if not twins or not fn_changed.get(r['function']):
            violate('P4', group='historical_lines', site_id=sid, function=r['function'],
                    baseline_line=r['baseline_line'], detail='new historical record is not a reviewed minus line')
        new_hist.append(dict(r, reason='CA-SEAL line ' + str(r['baseline_line']) + ' of '
                             + r['function'] + ' has no current counterpart: the reviewed E9-1 diff '
                             'replaced it (git-minus line(s) ' + repr(twins) + '). The August text is '
                             'the three-digit-only decision_ref grammar; E9-1 moves the pattern into '
                             'the shared DL_REF constant accepting DL-1000..DL-9999. ' + S1V_CITATION + '.',
                             evidence=review_evidence(sid)))
    derived['historical_lines'] = kept_hist + new_hist
    report['accounting']['historical_lines'] = {'carried': len(kept_hist), 'new': len(new_hist)}

    # ---- frozen_lines (the committed table pins the frozen bytes themselves: zero rows)
    if table['frozen_lines']:
        violate('P1', detail='committed table has frozen-line rows; derivation assumes the frozen pin')
    new_frozen = []
    for sid, r in frozen_inv.items():
        ok = r['line'] in changed_new if r['mark'] in ('inserted', 'changed') else r['line'] in git_old
        if not ok:
            violate('P4', group='frozen_lines', site_id=sid, mark=r['mark'], line=r['line'],
                    detail='frozen-line record outside the reviewed diff')
        new_frozen.append(dict(r, reason='E9-1 fifth receipted change (Jared 2026-11-14, card E9-1 '
                               'option A): ' + r['mark'] + ' line of the reviewed diff '
                               + BASE_COMMIT + '..' + S1V_COMMIT + '. ' + S1V_CITATION + '.',
                               evidence=review_evidence(sid)))
    derived['frozen_lines'] = new_frozen
    report['accounting']['frozen_lines'] = {'new': len(new_frozen)}

    # ---- totals and pins
    derived = c.refresh_totals(derived, new_raw, before)
    derived['validator_sha256'] = sha(new_raw)
    derived['completeness_claim'] = re.sub(r'all \d+ touched functions',
                                           'all ' + str(len(touched)) + ' touched functions',
                                           derived['completeness_claim'])
    report['facts']['derived_table_sha256'] = sha((json.dumps(derived, indent=2) + '\n').encode())
    # P7 pre-validation (the suite re-runs this with its own recorded test names)
    names = set()
    for group in ('sites', 'supplement'):
        for r in derived[group]:
            names.update(r.get('killed_by') or [])
    try:
        c.validate_coverage(new_raw, before, derived, frozenset(names), frozen=frozen)
    except AssertionError as exc:
        violate('P7', detail='derived table fails validate_coverage', error=str(exc)[:400])
    if violations:
        raise ProofStop(report)
    return derived, report


# ---------------------------------------------------------------- source transformations

ADAPTER_FIND = """        put(v.RECOUNT_CHANGE, encoded(change))
        def anchors():
            put('Plans/Spec_Lock.json', encoded({'canonical_ssot_hashes': {'files': [
                {'path': p, 'sha256': sha((root / p).read_bytes())}
                for p in [v.MULTI_FAMILY_RECEIPT, v.RECOUNT_CHANGE]]}}))
        anchors()
"""
ADAPTER_REPLACE = """        put(v.RECOUNT_CHANGE, encoded(change))
        # T224 fixture adapter (s1v later-links-adapter.diff): the fifth link E9-1 adds sits
        # between the live bytes and the fourth link.
        later = []
        if hasattr(v, 'DL_PATTERN_CHANGE'):
            for rel in (v.DL_PATTERN_CARD, v.DL_PATTERN_ANSWER):
                put(rel, (repo / rel).read_bytes())
            fifth = json.loads((repo / v.DL_PATTERN_CHANGE).read_bytes())
            fifth['lander_task'] = 'fixture:lander'
            fifth['seal_applier_forbidden_tasks'] = sorted({v.DL_PATTERN_AUTHOR, 'fixture:lander'})
            put(v.DL_PATTERN_CHANGE, encoded(fifth))
            later = [v.DL_PATTERN_CHANGE]
        def anchors():
            if later:  # as the S1 lander does: the fifth receipt's prior pin follows the fourth receipt's bytes
                doc = json.loads((root / v.DL_PATTERN_CHANGE).read_bytes())
                doc['prior_receipt']['sha256'] = sha((root / v.RECOUNT_CHANGE).read_bytes())
                put(v.DL_PATTERN_CHANGE, encoded(doc))
            put('Plans/Spec_Lock.json', encoded({'canonical_ssot_hashes': {'files': [
                {'path': p, 'sha256': sha((root / p).read_bytes())}
                for p in later + [v.MULTI_FAMILY_RECEIPT, v.RECOUNT_CHANGE]]}}))  # later first: files[-1] stays the fourth
        anchors()
"""
REEXPECT_FIND = """            def aggregate_issue(code, detail):
                state, issues = v.recount_validation(set(names))
                if not (state['complete'] is False):
                    raise AssertionError(state)
                if not (state['diagnostic_only'] is True):
                    raise AssertionError(state)
                if not (issues == [{'error': code, 'detail': detail}]):
                    raise AssertionError(issues)
"""
REEXPECT_REPLACE = """            def aggregate_issue(code, detail, extra=()):
                state, issues = v.recount_validation(set(names))
                if not (state['complete'] is False):
                    raise AssertionError(state)
                if not (state['diagnostic_only'] is True):
                    raise AssertionError(state)
                if not (issues == [{'error': code, 'detail': detail}] + list(extra)):
                    raise AssertionError(issues)
"""
OSERROR_FIND = """                record('negative_' + label, lambda path=path, code=code: aggregate_issue(
                    code, str(FileNotFoundError(2, 'No such file or directory', str(path)))))
"""
OSERROR_REPLACE = """                # T224 re-expectation: deleting the fourth receipt also invalidates the fifth
                # link's prior-byte dependency; assert exactly both issues, in order.
                fifth_extra = ([{'error': 'dl_pattern_change_receipt_invalid',
                                 'detail': str(FileNotFoundError(2, 'No such file or directory', str(path)))}]
                               if label == 'aggregate_receipt_oserror' else [])
                record('negative_' + label, lambda path=path, code=code, fifth_extra=fifth_extra:
                       aggregate_issue(code, str(FileNotFoundError(2, 'No such file or directory', str(path))),
                                       fifth_extra))
"""
FROZEN_FIND = """    elif group == 'frozen_lines':
        named = sorted(frozen_records)
        if not (sorted((r['mark'], r['line']) for r in frozen_records.values()) == sorted(
            [('deleted', n) for n in deleted] + [('inserted', n) for n in edited])):
            raise AssertionError(frozen_records)
"""
FROZEN_REPLACE = """    elif group == 'frozen_lines':
        # T224 baseline refresh: isolate the probe's own frozen-line delta from the baselined
        # E9-1 records by content (mark, text), so difflib blank-line slides under an unrelated
        # edit cannot forge or break the isolation. The table's frozen records are re-anchored
        # to the edited source's inventory positions, keeping their reviewed reasons; only the
        # probe's own identities are named and omitted from forging. With an empty baseline this
        # reduces to the original precondition (the inventory must be exactly the probe's delta).
        probe_marks = sorted([('deleted', old_lines[n - 1]) for n in deleted]
                             + [('inserted', source_lines(altered)[n - 1]) for n in edited])
        baseline_content = sorted((r['mark'], r['text']) for r in table.get('frozen_lines', []))
        remaining = sorted((r['mark'], r['text']) for r in frozen_records.values())
        for pair in probe_marks:
            if pair not in remaining:
                raise AssertionError(frozen_records)
            remaining.remove(pair)
        if not (remaining == baseline_content):
            raise AssertionError(frozen_records)
        donors = {}
        for r in table.get('frozen_lines', []):
            donors.setdefault((r['mark'], r['text']), []).append(r)
        named, refrozen = [], []
        for sid, r in frozen_records.items():
            pool = donors.get((r['mark'], r['text']))
            if pool:
                d = pool.pop()
                refrozen.append(dict(r, reason=d['reason'], evidence=d['evidence']))
            else:
                named.append(sid)
        named = sorted(named)
        table['frozen_lines'] = refrozen
"""


def transform_checker(source, adapter, reexpect):
    notes = []
    if adapter:
        if source.count(ADAPTER_FIND) != 1:
            raise ProofStop({'violations': [{'rule': 'adapter', 'detail': 'fixture block not found exactly once'}]})
        source = source.replace(ADAPTER_FIND, ADAPTER_REPLACE)
        notes.append('fixture adapter applied (s1v later-links)')
    if reexpect:
        for find, repl, name in ((REEXPECT_FIND, REEXPECT_REPLACE, 'aggregate_issue extra parameter'),
                                 (OSERROR_FIND, OSERROR_REPLACE, 'aggregate_receipt_oserror two-issue expectation'),
                                 (FROZEN_FIND, FROZEN_REPLACE, 'frozen-edit probe baseline-aware isolation')):
            if source.count(find) != 1:
                raise ProofStop({'violations': [{'rule': 'reexpect', 'detail': name + ' not found exactly once'}]})
            source = source.replace(find, repl)
        notes.append('intended re-expectation applied (fourth deletion invalidates the fifth)')
        notes.append('frozen-edit probes: baseline-aware isolation precondition (E9-1 records + probe delta)')
    if any(isinstance(n, ast.Assert) for n in ast.walk(ast.parse(source))):
        raise ProofStop({'violations': [{'rule': 'no-asserts', 'detail': 'transformation introduced an assert'}]})
    return source, notes


# ---------------------------------------------------------------- main

def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--source-map', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--scratch', type=Path, default=Path.home() / 'pm-scratch/ea-t224/wrapper')
    parser.add_argument('--no-fixture-adapter', action='store_true')
    parser.add_argument('--old-baseline', action='store_true')
    parser.add_argument('--prove-only', action='store_true')
    parser.add_argument('--proof-target', type=Path)
    args = parser.parse_args()
    repo = args.repo.resolve()
    scratch = args.scratch.resolve()
    scratch.mkdir(parents=True, exist_ok=True)
    summary = {'wrapper': 'CA-SEAL2-checks-fifth-link.py', 'mode': {
        'fixture_adapter': not args.no_fixture_adapter,
        'derived_baseline': not args.old_baseline,
        're_expectation': not args.old_baseline,
        'prove_only': args.prove_only, 'proof_target': str(args.proof_target) if args.proof_target else None}}
    try:
        source, c = load_checker(repo)
        new_raw = args.proof_target.read_bytes() if args.proof_target else (repo / c.REL).read_bytes()
        if not args.old_baseline:
            derived, report = derive_baseline(repo, c, new_raw, proof_target=args.proof_target is not None)
            (scratch / 'proof-report.json').write_text(json.dumps(report, indent=2) + '\n')
            (scratch / 'derived-coverage.json').write_text(json.dumps(derived, indent=2) + '\n')
            summary['proof'] = 'pass'
            summary['proof_report'] = str(scratch / 'proof-report.json')
            summary['accounting'] = report['accounting']
        else:
            derived = None
            summary['proof'] = 'skipped (old baseline)'
        if args.prove_only:
            summary['status'] = 'proof-pass' if derived is not None else 'old-baseline-no-proof'
            args.out.write_text(json.dumps(summary, indent=2) + '\n')
            print(json.dumps({k: summary[k] for k in ('status', 'proof')}))
            return 0
        if args.source_map is None:
            parser.error('--source-map is required for a suite run')
        transformed, notes = transform_checker(source, not args.no_fixture_adapter, not args.old_baseline)
        summary['transformations'] = notes
        checker_path = scratch / 'CA-SEAL2-checks.adapted.py'
        checker_path.write_text(transformed)
        spec = importlib.util.spec_from_file_location('ca_seal2_adapted', checker_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        coverage_path = repo / COVERAGE_REL
        original_coverage = coverage_path.read_bytes()
        checker_out = scratch / 'checker-results.json'
        try:
            if derived is not None:
                coverage_path.write_text(json.dumps(derived, indent=2) + '\n')
            exit_code = module.run(repo, checker_out, args.source_map.resolve())
        finally:
            coverage_path.write_bytes(original_coverage)
        results = json.loads(checker_out.read_text())
        summary['checker'] = {k: results[k] for k in ('status', 'checks', 'passed', 'failed', 'interpreter')}
        summary['failed_names'] = [r['name'] for r in results['results'] if not r['pass']]
        summary['checker_results'] = str(checker_out)
        summary['status'] = results['status']
        args.out.write_text(json.dumps(summary, indent=2) + '\n')
        print(json.dumps(dict({k: summary[k] for k in ('status', 'proof')}, **summary['checker'])))
        return exit_code
    except ProofStop as stop:
        summary['status'] = 'proof-refused'
        summary['proof'] = 'refused'
        summary['proof_report'] = str(scratch / 'proof-report.json')
        (scratch / 'proof-report.json').write_text(json.dumps(stop.report, indent=2) + '\n')
        args.out.write_text(json.dumps(summary, indent=2) + '\n')
        print(json.dumps({'status': 'proof-refused', 'violations': len(stop.report['violations'])}))
        for v in stop.report['violations'][:20]:
            print(json.dumps(v))
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
