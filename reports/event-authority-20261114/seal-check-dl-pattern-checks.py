#!/usr/bin/env python3
"""E9-1 (fifth receipted change) checks for the frozen Event Authority validator. Fixture trees stay outside the repo.

Every check runs the validator compiled from exact bytes in a scratch tree that carries the receipt chain,
filled by land_receipt_chain.py and anchored in a fixture Spec Lock. A negative passes only on its exact
expected refusal. --mutants also runs each mutant of the validator through the same checks; a mutant counts
as killed only when one of its named killer checks fails with that check's own symptom ('positive refused'
or 'negative accepted'), never because the fixture broke or a refusal changed its wording.

  python3 -I reports/event-authority-20261114/seal-check-dl-pattern-checks.py --scratch <dir> --out <json> [--mutants]
"""
import argparse
import contextlib
import copy
import hashlib
import io
import itertools
import json
from pathlib import Path
import re
import shutil
import sys
import tempfile
import types

REL = 'Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py'
CHAIN = 'reports/event-authority-20261114/land_receipt_chain.py'
DL077_AFTER = '190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20'
DL412_AFTER = '319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91'
FOURTH_AFTER = '3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72'
FIFTH_MESSAGE = 'fifth amendment identity, authority, byte link or anchor mismatch'
FOURTH_MESSAGE = 'fourth amendment identity, authority, byte link or anchor mismatch'
DL077_MESSAGE = 'post-August amendment receipt identity, authority or hash mismatch'
EVENT = 'fixture.alpha.recorded'
OTHER = 'fixture.beta.recorded'
# Fixture-only Decision Log headings. Every malformed id below also gets a heading, so a refusal can only come
# from the pattern. DL-998 is CA-SEAL's fixture-only three-digit number.
GOOD4 = ['DL-1000', 'DL-2001', 'DL-2999', 'DL-9999']
GOOD3 = ['DL-998']
BAD = ['DL-20011', 'DL-0998', 'DL-0000', 'DL-20a1', 'DL-', 'DL-2O01', 'DL-+201', 'DL- 2001', 'dl-2001',
       'DL-١٢٣٤', 'DL-２００１', 'DL-2٠٠١']
BAD_REFS = ['Plans/Decision_Log.md#' + b for b in BAD] + [
    'Plans/Decision_Log.md#DL-2001\n', ' Plans/Decision_Log.md#DL-2001', 'Plans/Decision_Log.md#DL-2001 ',
    'Plans/Decision_Log.md#', 'Plans/Decision_Log.md', '', 'Plans/Decision_Log.mdx#DL-2001',
    'Plans/Decision_Log.md#DL-2001#DL-2001']


class CheckFailure(AssertionError):
    pass


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def compile_module(path, name):
    raw = path.read_bytes()
    module = types.ModuleType(name)
    module.__file__ = str(path)
    sys.modules[name] = module
    exec(compile(raw, str(path), 'exec', dont_inherit=True), module.__dict__)
    return module


def append_sections(dl_path, sections):
    raw = dl_path.read_bytes().rstrip(b'\n') + b'\n'
    for heading, body in sections:
        raw += b'\n### ' + heading.encode() + b': Fixture decision (checks only)\n\n' + body.encode() + b'\n'
    dl_path.write_bytes(raw)


class Fixture:
    """A scratch tree with the receipt chain filled and anchored for the given validator bytes."""

    def __init__(self, repo, base, validator_raw=None):
        self.root = Path(tempfile.mkdtemp(prefix='s1v-', dir=base))
        self.repo = repo
        v_raw = validator_raw if validator_raw is not None else (repo / REL).read_bytes()
        self.put(REL, v_raw)
        probe = compile_module(self.root / REL, 's1v_probe_' + sha(v_raw)[:12])
        paths = ['Plans/Decision_Log.md', probe.HOLDING_RECEIPT, probe.POST_AUGUST_RECEIPT, probe.MULTI_FAMILY_RECEIPT,
                 probe.RECOUNT_CHANGE, probe.DL_PATTERN_CHANGE, CHAIN, probe.DL_PATTERN_CARD, probe.DL_PATTERN_ANSWER]
        for rel in paths:
            self.put(rel, (repo / rel).read_bytes())
        # A mutant is chained truthfully: the fifth receipt names the bytes that run, as an author would write it.
        fifth = self.root / probe.DL_PATTERN_CHANGE
        doc = json.loads(fifth.read_bytes())
        doc['validator_after_sha256'] = sha(v_raw)
        fifth.write_text(json.dumps(doc, indent=2) + '\n')
        sections = [(n, 'Excludes `' + EVENT + '` for the fixture.') for n in GOOD4 + GOOD3 + BAD]
        sections += [('DL-2100', 'Names only `' + OTHER + '`.'), ('DL-2200', 'Duplicate `' + EVENT + '`.'),
                     ('DL-2200', 'Duplicate `' + EVENT + '`.')]
        append_sections(self.root / 'Plans/Decision_Log.md', sections)
        self.put('Plans/fixture_owner.md', ('# Fixture owner\n\n`' + EVENT + '` is not an event family.\n').encode())
        self.put('Plans/fixture.md', b'# Fixture evidence\n')
        self.lock = {'canonical_ssot_hashes': {'files': []}}
        self.write_lock()
        chain = compile_module(self.root / CHAIN, 's1v_chain_' + sha(v_raw)[:12])
        with contextlib.redirect_stdout(io.StringIO()):
            chain.fill(self.root, 'fixture:s1-lander')
        self.anchor_all()
        self.v = compile_module(self.root / REL, 's1v_validator_' + sha(v_raw)[:12])
        self.live = sha(v_raw)
        self.saved = {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.saved_lock = copy.deepcopy(self.lock)

    def put(self, rel, raw):
        target = self.root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        return target

    def write_lock(self):
        self.put('Plans/Spec_Lock.json', (json.dumps(self.lock, indent=2) + '\n').encode())

    def anchor(self, rel):
        files = self.lock['canonical_ssot_hashes']['files']
        files[:] = [f for f in files if f.get('path') != rel]
        files.append({'path': rel, 'sha256': sha((self.root / rel).read_bytes())})
        self.write_lock()

    def anchor_all(self):
        for rel in ('reports/event-authority-20261104/seal-check-multifamily-step-receipt.json',
                    'reports/event-authority-20261105/seal-check-recount-receipt.json',
                    'reports/event-authority-20261114/seal-check-dl-pattern-receipt.json'):
            self.anchor(rel)

    def restore(self):
        for path in [p for p in self.root.rglob('*') if p.is_file() and p not in self.saved]:
            path.unlink()
        for path, raw in self.saved.items():
            if not path.exists() or path.read_bytes() != raw:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(raw)
        self.lock = copy.deepcopy(self.saved_lock)

    def json(self, rel):
        return json.loads((self.root / rel).read_bytes())

    def write_json(self, rel, doc, reanchor=True):
        self.put(rel, (json.dumps(doc, indent=2) + '\n').encode())
        if reanchor:
            self.anchor(rel)

    def close(self):
        shutil.rmtree(self.root)


# ---------- what the validator says ----------

def expect_refusal(action, message=None, kind=ValueError):
    try:
        action()
    except kind as exc:
        if message is not None and str(exc) != message:
            raise CheckFailure('wrong refusal: ' + str(exc)[:200])
        return str(exc)[:200]
    except Exception as exc:  # any other exception is not the expected refusal
        raise CheckFailure('unexpected ' + type(exc).__name__ + ': ' + str(exc)[:200])
    raise CheckFailure('negative accepted')


def positive(action):
    """A positive control: any refusal by the validator is the symptom 'positive refused'."""
    try:
        return action()
    except (OSError, ValueError, TypeError, KeyError, UnicodeError) as exc:
        raise CheckFailure('positive refused: ' + type(exc).__name__ + ': ' + str(exc)[:200])


def chain_state(f):
    v = f.v
    return {'fifth': v.fourth_change_validator_pin(), 'fourth': v.third_change_validator_pin(),
            'third': v.post_august_validator_pin()}


def depth_file(f):
    rel = 'reports/fixture-depth.json'
    rows = [{'event_type': EVENT, 'family_id': 'FIX-ALPHA', 'family_revision': 'fixture-r1',
             'cells': {c: {'status': 'PASS', 'evidence': [{'path': 'Plans/fixture.md'}]} for c in f.v.EVIDENCE_FIELDS}}]
    f.put(rel, json.dumps({'rows': rows}).encode())
    return rel


FAMILY = {'event_type': EVENT, 'family_id': 'FIX-ALPHA', 'family_revision': 'fixture-r1'}


def record_for(f, ref, multi=False):
    v = f.v
    number = ref.split('#', 1)[1] if '#' in ref else None
    try:
        section = v.decision_section_bytes(f.root / 'Plans/Decision_Log.md', number) if number else b''
    except ValueError:
        section = b''
    rel = depth_file(f)
    record = {
        'schema_id': v.POST_AUGUST_RECORD_SCHEMA, 'event_type': EVENT, 'family_id': 'FIX-ALPHA',
        'implementation_receipt_sha256': v.sha256_file(f.root / (v.MULTI_FAMILY_RECEIPT if multi else v.POST_AUGUST_RECEIPT)),
        'decision_ref': ref, 'decision_section_sha256': sha(section),
        'registry_before': {'revision': 'r1', 'sha256': '1' * 64, 'family_count': 46},
        'registry_after': {'revision': 'r2', 'sha256': '2' * 64, 'family_count': 48 if multi else 47},
        'registry_row_sha256': v.canonical_json_sha256(FAMILY),
        'depth_assessment': {'path': rel, 'sha256': v.sha256_file(f.root / rel)},
    }
    if multi:
        record[v.STEP_FIELD] = sorted([EVENT, OTHER])
    return record


def outcomes_for(f, ref):
    v = f.v
    number = ref.split('#', 1)[1] if '#' in ref else None
    try:
        section = v.decision_section_bytes(f.root / 'Plans/Decision_Log.md', number) if number else b''
    except ValueError:
        section = b''
    owner = f.root / 'Plans/fixture_owner.md'
    doc = {'schema_id': 'pm.assurance.event_authority.recount_outcomes.v1',
           'recount_receipt_sha256': v.RECOUNT_RECEIPT_SHA, 'recount_list_sha256': v.RECOUNT_LIST_SHA,
           'rows': [{'event_type': EVENT, 'outcome': 'excluded', 'disposition': 'RECLASSIFY_TO_EXCLUDED',
                     'decision_ref': ref, 'decision_section_sha256': sha(section),
                     'rationale': 'Fixture exclusion.',
                     'source_citations': [{'path': 'Plans/fixture_owner.md', 'sha256': sha(owner.read_bytes()),
                                           'line_start': 3, 'line_end': 3}]}]}
    target = Path(v.RECOUNT_OUTCOMES)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(doc))
    return doc


def site_443(f, ref, multi=False):
    return f.v.admission_record_problems(record_for(f, ref, multi), FAMILY)


def site_1016(f, ref):
    outcomes_for(f, ref)
    return f.v.recount_outcomes([EVENT], set())


# ---------- checks: name -> (function(f), kind) ----------

CHECKS = {}


def check(name):
    def register(fn):
        CHECKS[name] = fn
        return fn
    return register


@check('pattern_exhaustive_ascii_0_to_5_digits')
def _(f):
    rx = re.compile(f.v.DL_REF)
    count = 0
    for n in range(0, 6):
        for digits in itertools.product('0123456789', repeat=n):
            s = ''.join(digits)
            want = n == 3 or (n == 4 and s[0] != '0')
            if bool(rx.fullmatch('DL-' + s)) != want:
                raise CheckFailure(('DL-' + s, 'accepted' if not want else 'refused'))
            count += 1
    return count


@check('pattern_three_digit_branch_is_the_old_pattern')
def _(f):
    new, old = re.compile(f.v.DL_REF), re.compile(r'DL-\d{3}')
    digits = '0123456789' + '٠١٢٣٤٥٦٧٨٩' + '０１２３４５６７８９' + '߀߁߂'
    for chars in itertools.product(digits + 'aO -', repeat=3):
        s = 'DL-' + ''.join(chars)
        if bool(new.fullmatch(s)) != bool(old.fullmatch(s)):
            raise CheckFailure(s)
    for s in ['DL-١٢٣٤', 'DL-１２３４', 'DL-1２３４']:
        if new.fullmatch(s):
            raise CheckFailure('non-ASCII four-digit accepted: ' + s)
    return 'equal'


@check('site_443_four_digit_ref_complete')
def _(f):
    for n in GOOD4:
        problems = positive(lambda: site_443(f, 'Plans/Decision_Log.md#' + n))
        if problems:
            raise CheckFailure('positive refused: ' + n + ' ' + json.dumps(problems))
    return GOOD4


@check('site_443_three_digit_ref_complete')
def _(f):
    for n in GOOD3:
        problems = positive(lambda: site_443(f, 'Plans/Decision_Log.md#' + n))
        if problems:
            raise CheckFailure('positive refused: ' + n + ' ' + json.dumps(problems))
    return GOOD3


@check('site_443_malformed_refs_fail_decision_ref_only')
def _(f):
    for ref in BAD_REFS:
        problems = site_443(f, ref)
        if problems != ['decision_ref']:
            raise CheckFailure(('negative accepted' if 'decision_ref' not in problems else 'wrong refusal')
                               + ': ' + repr(ref) + ' ' + json.dumps(problems))
    return len(BAD_REFS)


@check('site_443_four_digit_missing_or_duplicate_heading_refuses_as_three_digit')
def _(f):
    seen = []
    for number in ['DL-2002', 'DL-997', 'DL-2200']:
        seen.append(expect_refusal(lambda: site_443(f, 'Plans/Decision_Log.md#' + number),
                                   number + ' prose entry missing or duplicated'))
    return seen


@check('site_443_four_digit_ref_keeps_family_and_section_rules')
def _(f):
    record = record_for(f, 'Plans/Decision_Log.md#DL-2100')
    if f.v.admission_record_problems(record, FAMILY) != ['decision_ref_not_for_family']:
        raise CheckFailure('negative accepted: DL-2100 does not name the family')
    record = record_for(f, 'Plans/Decision_Log.md#DL-2001')
    record['decision_section_sha256'] = '0' * 64
    if f.v.admission_record_problems(record, FAMILY) != ['decision_section_sha256']:
        raise CheckFailure('negative accepted: stale section hash')
    for excluded in ['DL-077', 'DL-078']:
        record = record_for(f, 'Plans/Decision_Log.md#' + excluded)
        if 'decision_ref_not_for_family' not in f.v.admission_record_problems(record, FAMILY):
            raise CheckFailure('negative accepted: ' + excluded)
    return 'kept'


@check('site_443_step_record_four_digit_ref_and_dl412_exclusion')
def _(f):
    decision = {'decision_ref', 'decision_ref_not_for_family', 'decision_section_sha256'}
    problems = positive(lambda: site_443(f, 'Plans/Decision_Log.md#DL-2001', multi=True))
    if decision & set(problems):
        raise CheckFailure('positive refused: step record ' + json.dumps(problems))
    problems = site_443(f, 'Plans/Decision_Log.md#DL-412', multi=True)
    if 'decision_ref_not_for_family' not in problems:
        raise CheckFailure('negative accepted: a step record cites DL-412')
    problems = site_443(f, 'Plans/Decision_Log.md#DL-20011', multi=True)
    if not ('decision_ref' in problems and not (decision - {'decision_ref'}) & set(problems)):
        raise CheckFailure('wrong refusal: ' + json.dumps(problems))
    return 'kept'


@check('site_1016_four_digit_exclusion_complete')
def _(f):
    for n in GOOD4:
        result = positive(lambda: site_1016(f, 'Plans/Decision_Log.md#' + n))
        if result.get('complete') is not True:
            raise CheckFailure('positive refused: ' + n)
    return GOOD4


@check('site_1016_three_digit_exclusion_complete')
def _(f):
    for n in GOOD3:
        result = positive(lambda: site_1016(f, 'Plans/Decision_Log.md#' + n))
        if result.get('complete') is not True:
            raise CheckFailure('positive refused: ' + n)
    return GOOD3


@check('site_1016_malformed_refs_refuse_decision_missing')
def _(f):
    for ref in BAD_REFS:
        expect_refusal(lambda: site_1016(f, ref), 'recount exclusion decision missing: ' + EVENT)
    outcomes_for(f, 'Plans/Decision_Log.md#DL-2001')
    doc = json.loads(Path(f.v.RECOUNT_OUTCOMES).read_bytes())
    for value in [None, 2001, ['Plans/Decision_Log.md#DL-2001']]:
        doc['rows'][0]['decision_ref'] = value
        Path(f.v.RECOUNT_OUTCOMES).write_text(json.dumps(doc))
        expect_refusal(lambda: f.v.recount_outcomes([EVENT], set()), 'recount exclusion decision missing: ' + EVENT)
    return len(BAD_REFS) + 3


@check('site_1016_four_digit_keeps_heading_and_name_rules')
def _(f):
    expect_refusal(lambda: site_1016(f, 'Plans/Decision_Log.md#DL-2002'), 'DL-2002 prose entry missing or duplicated')
    expect_refusal(lambda: site_1016(f, 'Plans/Decision_Log.md#DL-2100'),
                   'recount exclusion decision fingerprint/name mismatch: ' + EVENT)
    return 'kept'


@check('chain_positive_every_link_and_state')
def _(f):
    state = chain_state(f)
    if state != {'fifth': FOURTH_AFTER, 'fourth': DL412_AFTER, 'third': DL077_AFTER}:
        raise CheckFailure('positive refused: ' + json.dumps(state))
    v = f.v
    for state_check in (v.post_august_receipt_state, v.multi_family_receipt_state, v.recount_change_state,
                        v.dl_pattern_change_state):
        positive(state_check)
    if v.holding_validator_pin() != v.load_json(f.root / v.POST_AUGUST_RECEIPT)['validator_before_sha256']:
        raise CheckFailure('positive refused: holding pin')
    return state


def broken_link(f, label):
    """A broken fifth link exposes the live hash all the way down and fails the old chain closed."""
    state = chain_state(f)
    if state != {'fifth': f.live, 'fourth': f.live, 'third': f.live}:
        raise CheckFailure('negative accepted: ' + label + ' ' + json.dumps(state))
    expect_refusal(f.v.recount_change_state, FOURTH_MESSAGE)
    expect_refusal(f.v.post_august_receipt_state, DL077_MESSAGE)
    try:
        f.v.dl_pattern_change_state()
    except (OSError, ValueError, TypeError, KeyError, UnicodeError):
        pass
    else:
        raise CheckFailure('negative accepted: fifth state ' + label)
    return label


FIFTH = 'reports/event-authority-20261114/seal-check-dl-pattern-receipt.json'
FOURTH = 'reports/event-authority-20261105/seal-check-recount-receipt.json'


def mutate_fifth(f, change, reanchor=True):
    doc = f.json(FIFTH)
    change(doc)
    f.write_json(FIFTH, doc, reanchor)


LINK_CASES = {
    'fifth_receipt_missing': lambda f: (f.root / FIFTH).unlink(),
    'fifth_anchor_missing': lambda f: (f.lock['canonical_ssot_hashes']['files'].__setitem__(
        slice(None), [e for e in f.lock['canonical_ssot_hashes']['files'] if e['path'] != FIFTH]), f.write_lock()),
    'fifth_anchor_wrong_hash': lambda f: ([e.__setitem__('sha256', '0' * 64) for e in f.lock['canonical_ssot_hashes']['files']
                                          if e['path'] == FIFTH], f.write_lock()),
    'fifth_anchor_uppercase_hash': lambda f: ([e.__setitem__('sha256', e['sha256'].upper()) for e in
                                              f.lock['canonical_ssot_hashes']['files'] if e['path'] == FIFTH], f.write_lock()),
    'fifth_anchor_duplicated': lambda f: (f.lock['canonical_ssot_hashes']['files'].append(
        dict(next(e for e in f.lock['canonical_ssot_hashes']['files'] if e['path'] == FIFTH))), f.write_lock()),
    'fifth_bytes_edited_under_anchor': lambda f: f.put(FIFTH, (f.root / FIFTH).read_bytes() + b' '),
    'fifth_after_is_fourth_after': lambda f: mutate_fifth(f, lambda d: d.__setitem__('validator_after_sha256', FOURTH_AFTER)),
    'fifth_before_wrong': lambda f: mutate_fifth(f, lambda d: d.__setitem__('validator_before_sha256', DL412_AFTER)),
    'fifth_duplicate_key': lambda f: (f.put(FIFTH, (f.root / FIFTH).read_bytes().replace(
        b'{\n  "schema_id"', b'{\n  "schema_id": "x",\n  "schema_id"', 1)), f.anchor(FIFTH)),
    'spec_lock_duplicate_key': lambda f: f.put('Plans/Spec_Lock.json', (f.root / 'Plans/Spec_Lock.json').read_bytes().replace(
        b'{\n  "canonical_ssot_hashes"', b'{\n  "x": 1,\n  "x": 2,\n  "canonical_ssot_hashes"', 1)),
    'validator_one_byte_edit': lambda f: f.put(REL, (f.root / REL).read_bytes() + b'\n'),
}

for _label in LINK_CASES:
    def _make(label):
        def run(f):
            LINK_CASES[label](f)
            if label == 'validator_one_byte_edit':
                f.live = sha((f.root / REL).read_bytes())
            return broken_link(f, label)
        return run
    CHECKS['chain_negative_' + _label] = _make(_label)


SEMANTIC_CASES = {
    'schema_id': lambda d: d.__setitem__('schema_id', 'pm.assurance.event_authority.recount_change.v1'),
    'authority_card_sha': lambda d: d['authority']['card'].__setitem__('sha256', '0' * 64),
    'authority_answer_path': lambda d: d['authority']['answer'].__setitem__('path', 'reports/E9-1-answer.json'),
    'authority_option_B': lambda d: d['authority'].__setitem__('selected_option', 'B'),
    'authority_label': lambda d: d['authority'].__setitem__('card_label', 'E9-2'),
    'authority_missing': lambda d: d.pop('authority'),
    'validator_path': lambda d: d.__setitem__('validator_path', 'scripts/pm_event_authority_independent_validator.py'),
    'validator_id': lambda d: d.__setitem__('validator_id', 'pm.scripts.validator'),
    'prior_path': lambda d: d['prior_receipt'].__setitem__('path', 'reports/event-authority-20261104/seal-check-multifamily-step-receipt.json'),
    'prior_sha_stale': lambda d: d['prior_receipt'].__setitem__('sha256', '0' * 64),
    'pattern_literal_brief_form': lambda d: d.__setitem__('decision_ref_pattern', r'DL-\d{3,4}'),
    'pattern_missing': lambda d: d.pop('decision_ref_pattern'),
    'author': lambda d: d.__setitem__('author_task', 'codex:CA-SEAL2-20261105'),
    'lander_none': lambda d: (d.__setitem__('lander_task', None), d.__setitem__('seal_applier_forbidden_tasks', [d['author_task']])),
    'lander_empty': lambda d: (d.__setitem__('lander_task', ''), d.__setitem__('seal_applier_forbidden_tasks', sorted(['', d['author_task']]))),
    'lander_blank': lambda d: (d.__setitem__('lander_task', '  '), d.__setitem__('seal_applier_forbidden_tasks', sorted(['  ', d['author_task']]))),
    'forbidden_without_lander': lambda d: d.__setitem__('seal_applier_forbidden_tasks', [d['author_task']]),
    'forbidden_extra': lambda d: d.__setitem__('seal_applier_forbidden_tasks', sorted(d['seal_applier_forbidden_tasks'] + ['x'])),
    'forbidden_unsorted': lambda d: d.__setitem__('seal_applier_forbidden_tasks', sorted(d['seal_applier_forbidden_tasks'], reverse=True)),
    'seal_authorized_true': lambda d: d.__setitem__('seal_authorized', True),
    'admission_authorized_true': lambda d: d.__setitem__('admission_authorized', True),
    'depth_complete_missing': lambda d: d.pop('contract_depth_complete'),
    'depth_complete_zero': lambda d: d.__setitem__('contract_depth_complete', 0),
}


def semantic(label):
    def run(f):
        mutate_fifth(f, SEMANTIC_CASES[label])
        if f.v.fourth_change_validator_pin() != FOURTH_AFTER:
            raise CheckFailure('fixture: byte link broken by ' + label)
        return expect_refusal(f.v.dl_pattern_change_state, FIFTH_MESSAGE)
    return run


for _label in SEMANTIC_CASES:
    CHECKS['fifth_state_negative_' + _label] = semantic(_label)


@check('chain_negative_fourth_link_broken_under_intact_fifth_exposes_live')
def _(f):
    """DL-451's rule kept: a broken fourth link exposes the live hash, even when the fifth link holds."""
    f.lock['canonical_ssot_hashes']['files'][:] = [e for e in f.lock['canonical_ssot_hashes']['files'] if e['path'] != FOURTH]
    f.write_lock()
    state = chain_state(f)
    if state != {'fifth': FOURTH_AFTER, 'fourth': f.live, 'third': f.live}:
        raise CheckFailure('negative accepted: ' + json.dumps(state))
    expect_refusal(f.v.recount_change_state, FOURTH_MESSAGE)
    return expect_refusal(f.v.post_august_receipt_state, DL077_MESSAGE)


@check('chain_negative_fourth_restamped_to_live')
def _(f):
    """PNC019-SCOPE finding 6's mistake one link later: re-stamping the fourth receipt to the live hash.

    The fourth link then holds on its own (it claims the live bytes), but the fifth link and the fifth
    receipt's check both refuse, so the combined result still fails closed."""
    fourth = f.json(FOURTH)
    fourth['validator_after_sha256'] = f.live
    f.write_json(FOURTH, fourth)
    if f.v.fourth_change_validator_pin() != f.live:
        raise CheckFailure('negative accepted: fifth link holds over a re-stamped fourth receipt')
    return expect_refusal(f.v.dl_pattern_change_state, FIFTH_MESSAGE)


@check('fifth_state_negative_card_copy_bytes_edited')
def _(f):
    rel = f.v.DL_PATTERN_CARD
    f.put(rel, (f.root / rel).read_bytes().replace(b'"key": "A"', b'"key": "B"', 1))
    if f.v.fourth_change_validator_pin() != FOURTH_AFTER:
        raise CheckFailure('fixture: byte link broken')
    return expect_refusal(f.v.dl_pattern_change_state, FIFTH_MESSAGE)


@check('fifth_state_negative_answer_copy_missing')
def _(f):
    (f.root / f.v.DL_PATTERN_ANSWER).unlink()
    return expect_refusal(f.v.dl_pattern_change_state, kind=FileNotFoundError)


@check('fifth_state_negative_fourth_relanded_without_fifth_prior_refresh')
def _(f):
    fourth = f.json(FOURTH)
    fourth['landing_state'] = 'relanded'
    f.write_json(FOURTH, fourth)
    if chain_state(f)['fifth'] != FOURTH_AFTER:
        raise CheckFailure('fixture: byte link broken')
    return expect_refusal(f.v.dl_pattern_change_state, FIFTH_MESSAGE)


@check('wiring_recount_validation_reports_fifth_receipt')
def _(f):
    v = f.v
    sentinel = 'custody skipped by the check'

    def skipped():
        raise ValueError(sentinel)
    v.recount_frozen_inputs = skipped
    state, issues = v.recount_validation(set())
    errors = [i['error'] for i in issues]
    if errors != ['recount_input_or_outcome_invalid'] or state.get('dl_pattern_change_receipt_sha256') != v.sha256_file(f.root / FIFTH):
        raise CheckFailure('positive refused: ' + json.dumps(issues)[:300])
    mutate_fifth(f, lambda d: d.__setitem__('seal_authorized', True))
    state, issues = v.recount_validation(set())
    errors = [i['error'] for i in issues]
    if errors != ['dl_pattern_change_receipt_invalid', 'recount_input_or_outcome_invalid'] or state['complete']:
        raise CheckFailure('negative accepted: ' + json.dumps(errors))
    if issues[0]['detail'] != FIFTH_MESSAGE:
        raise CheckFailure('wrong refusal: ' + issues[0]['detail'])
    return errors


@check('lander_writer_keeps_pins_and_refuses_restamp')
def _(f):
    v = f.v
    third, fourth, fifth = (f.json(p) for p in (v.MULTI_FAMILY_RECEIPT, FOURTH, FIFTH))
    pins = (third['validator_after_sha256'], fourth['validator_after_sha256'], fifth['validator_before_sha256'],
            fifth['validator_after_sha256'], fourth['prior_receipt']['sha256'], fifth['prior_receipt']['sha256'])
    want = (DL412_AFTER, FOURTH_AFTER, FOURTH_AFTER, f.live, v.sha256_file(f.root / v.MULTI_FAMILY_RECEIPT),
            v.sha256_file(f.root / FOURTH))
    if pins != want or [d['lander_task'] for d in (third, fourth, fifth)] != ['fixture:s1-lander'] * 3:
        raise CheckFailure('positive refused: writer pins ' + json.dumps(pins))
    chain = compile_module(f.root / CHAIN, 's1v_chain_check')
    fourth['validator_after_sha256'] = f.live
    f.write_json(FOURTH, fourth, reanchor=False)
    expect_refusal(lambda: chain.fill(f.root, 'fixture:other'), None)
    f.restore()
    f.write_lock()
    for lander in ['', '  ', v.DL_PATTERN_AUTHOR, v.RECOUNT_AUTHOR]:
        expect_refusal(lambda: chain.fill(f.root, lander), None)
    return 'kept'


# ---------- running ----------

def run_checks(repo, base, validator_raw=None, names=None):
    results = {}
    try:
        f = Fixture(repo, base, validator_raw)
    except Exception as exc:
        return {'fixture': {'pass': False, 'error': type(exc).__name__ + ': ' + str(exc)[:300]}}
    try:
        for name, fn in CHECKS.items():
            if names is not None and name not in names:
                continue
            f.restore()
            f.v = compile_module(f.root / REL, 's1v_validator_run')
            f.live = sha((f.root / REL).read_bytes())
            try:
                value = fn(f)
                results[name] = {'pass': True, 'value': value if isinstance(value, (int, str, list, dict)) else str(value)}
            except CheckFailure as exc:
                results[name] = {'pass': False, 'error': str(exc)[:400]}
            except Exception as exc:
                results[name] = {'pass': False, 'error': 'unexpected ' + type(exc).__name__ + ': ' + str(exc)[:300]}
    finally:
        f.close()
    return results


def mutant(source, old, new):
    if source.count(old) != 1:
        raise ValueError('mutant anchor not unique: ' + old[:60])
    return source.replace(old, new)


MUTANTS = {
    'pattern_reverted_to_three_digits': (r'DL_REF = r"DL-(?:\d{3}|[1-9][0-9]{3})"', r'DL_REF = r"DL-\d{3}"',
                                         ['site_443_four_digit_ref_complete', 'site_1016_four_digit_exclusion_complete']),
    'pattern_literal_three_or_four': (r'DL_REF = r"DL-(?:\d{3}|[1-9][0-9]{3})"', r'DL_REF = r"DL-\d{3,4}"',
                                      ['pattern_exhaustive_ascii_0_to_5_digits', 'site_443_malformed_refs_fail_decision_ref_only',
                                       'site_1016_malformed_refs_refuse_decision_missing']),
    'pattern_three_to_five': (r'DL_REF = r"DL-(?:\d{3}|[1-9][0-9]{3})"', r'DL_REF = r"DL-(?:\d{3}|[1-9][0-9]{3,4})"',
                              ['site_443_malformed_refs_fail_decision_ref_only', 'site_1016_malformed_refs_refuse_decision_missing']),
    'pattern_unicode_four_digits': (r'DL_REF = r"DL-(?:\d{3}|[1-9][0-9]{3})"', r'DL_REF = r"DL-(?:\d{3}|[1-9]\d{3})"',
                                    ['pattern_three_digit_branch_is_the_old_pattern', 'site_443_malformed_refs_fail_decision_ref_only']),
    'pattern_allows_empty_number': (r'DL_REF = r"DL-(?:\d{3}|[1-9][0-9]{3})"', r'DL_REF = r"DL-(?:\d{3}|[1-9][0-9]{3}|)"',
                                    ['site_443_malformed_refs_fail_decision_ref_only', 'site_1016_malformed_refs_refuse_decision_missing']),
    'site_443_only_reverted': (r'r"Plans/Decision_Log\.md#(" + DL_REF + ")"', r'r"Plans/Decision_Log\.md#(DL-\d{3})"',
                               ['site_443_four_digit_ref_complete']),
    'site_1016_only_reverted': (r'r"Plans/Decision_Log\.md#" + DL_REF, ref)', r'r"Plans/Decision_Log\.md#DL-\d{3}", ref)',
                                ['site_1016_four_digit_exclusion_complete']),
    'fifth_link_without_anchor': ('        if (recount_anchor(DL_PATTERN_CHANGE)\n                and receipt.get("validator_after_sha256") == live',
                                  '        if (True\n                and receipt.get("validator_after_sha256") == live',
                                  ['chain_negative_fifth_anchor_missing', 'chain_negative_fifth_bytes_edited_under_anchor']),
    'fifth_link_without_fourth_after': ('                and fourth.get("validator_after_sha256") == DL_PATTERN_BEFORE_SHA):',
                                        '                and True):', ['chain_negative_fourth_restamped_to_live']),
    'fifth_link_without_live_after': ('        if (recount_anchor(DL_PATTERN_CHANGE)\n                and receipt.get("validator_after_sha256") == live',
                                      '        if (recount_anchor(DL_PATTERN_CHANGE)\n                and True',
                                      ['chain_negative_fifth_after_is_fourth_after']),
    'fifth_link_without_before': ('                and receipt.get("validator_before_sha256") == DL_PATTERN_BEFORE_SHA\n                and fourth',
                                  '                and True\n                and fourth', ['chain_negative_fifth_before_wrong']),
    'fourth_link_reads_live_bytes': ('    presented = fourth_change_validator_pin()\n', '    presented = live\n',
                                     ['chain_positive_every_link_and_state']),
    'fourth_link_fallback_is_observed_hash': ('    except (OSError, ValueError, TypeError, KeyError, UnicodeError):\n        pass\n    return live\n\n\ndef recount_change_state',
                                              '    except (OSError, ValueError, TypeError, KeyError, UnicodeError):\n        pass\n    return presented\n\n\ndef recount_change_state',
                                              ['chain_negative_fourth_link_broken_under_intact_fifth_exposes_live']),
    'fourth_state_reads_live_bytes': ('        "validator_after_sha256": fourth_change_validator_pin(),',
                                      '        "validator_after_sha256": sha256_file(Path(__file__)),',
                                      ['chain_positive_every_link_and_state']),
    'fifth_state_without_lander_check': ('            or type(lander) is not str or not lander.strip()\n            or receipt.get("seal_applier_forbidden_tasks") != sorted({DL_PATTERN_AUTHOR, lander})',
                                         '            or receipt.get("seal_applier_forbidden_tasks") != sorted({DL_PATTERN_AUTHOR, lander})',
                                         ['fifth_state_negative_lander_empty', 'fifth_state_negative_lander_blank']),
    'fifth_state_without_card_bytes': ('            or sha256_file(REPO / DL_PATTERN_CARD) != DL_PATTERN_CARD_SHA\n', '',
                                       ['fifth_state_negative_card_copy_bytes_edited']),
    'fifth_state_without_answer_bytes': ('            or sha256_file(REPO / DL_PATTERN_ANSWER) != DL_PATTERN_ANSWER_SHA\n', '',
                                         ['fifth_state_negative_answer_copy_missing']),
    'fifth_state_without_flags': ('            or any(receipt.get(k) is not False for k in (\n                "seal_authorized", "admission_authorized", "contract_depth_complete"))\n            or not recount_anchor(DL_PATTERN_CHANGE)',
                                  '            or not recount_anchor(DL_PATTERN_CHANGE)',
                                  ['fifth_state_negative_seal_authorized_true', 'fifth_state_negative_depth_complete_zero']),
    'fifth_state_without_prior': ('        "prior_receipt": {"path": RECOUNT_CHANGE, "sha256": sha256_file(REPO / RECOUNT_CHANGE)},\n        "decision_ref_pattern"',
                                  '        "decision_ref_pattern"',
                                  ['fifth_state_negative_prior_sha_stale', 'fifth_state_negative_fourth_relanded_without_fifth_prior_refresh']),
    'fifth_state_without_pattern': ('        "decision_ref_pattern": DL_REF,\n        "author_task": DL_PATTERN_AUTHOR,',
                                    '        "author_task": DL_PATTERN_AUTHOR,', ['fifth_state_negative_pattern_literal_brief_form']),
    'fifth_state_not_reported': ('    try:\n        _, state["dl_pattern_change_receipt_sha256"] = dl_pattern_change_state()\n    except (OSError, ValueError, TypeError, KeyError, UnicodeError) as exc:\n        issues.append({"error": "dl_pattern_change_receipt_invalid", "detail": str(exc)})\n',
                                 '', ['wiring_recount_validation_reports_fifth_receipt']),
}


def run_mutants(repo, base):
    raw_source = (repo / REL).read_bytes()
    crlf = raw_source.count(b'\r\n') == raw_source.count(b'\n')
    source = raw_source.decode('utf-8').replace('\r\n', '\n')
    out = {}
    for name, (old, new, killers) in MUTANTS.items():
        text = mutant(source, old, new)
        raw = (text.replace('\n', '\r\n') if crlf else text).encode('utf-8')  # the mutation is the only byte change
        results = run_checks(repo, base, raw)
        failing = sorted(k for k, r in results.items() if not r['pass'])
        # Only a killer check's own symptom is a kill: a positive refused or a negative accepted.
        killed_by = [k for k in killers if k in results and not results[k]['pass']
                     and results[k]['error'].startswith(('positive refused', 'negative accepted'))]
        out[name] = {'validator_sha256': sha(raw), 'killed': bool(killed_by) and 'fixture' not in results,
                     'killed_by': killed_by, 'named_killers': killers, 'failing_checks': failing,
                     'killer_errors': {k: results[k].get('error') for k in killers if k in results}}
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--scratch', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--mutants', action='store_true')
    args = parser.parse_args()
    repo = args.repo.resolve(strict=True)
    args.scratch.mkdir(parents=True, exist_ok=True)
    base = Path(tempfile.mkdtemp(prefix='s1v-checks-', dir=args.scratch))
    try:
        results = run_checks(repo, base)
        report = {'schema_id': 'pm.assurance.event_authority.dl_pattern_checks.v1',
                  'validator_sha256': sha((repo / REL).read_bytes()),
                  'checks': results, 'passed': sum(r['pass'] for r in results.values()), 'total': len(results)}
        if args.mutants:
            report['mutants'] = run_mutants(repo, base)
            report['mutants_killed'] = sum(m['killed'] for m in report['mutants'].values())
            report['mutants_total'] = len(report['mutants'])
    finally:
        shutil.rmtree(base)
    args.out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({k: report[k] for k in report if k not in ('checks', 'mutants')}, indent=2))
    failed = [k for k, r in report['checks'].items() if not r['pass']]
    for k in failed:
        print('FAIL', k, report['checks'][k].get('error'))
    survivors = [k for k, m in report.get('mutants', {}).items() if not m['killed']]
    for k in survivors:
        print('SURVIVED', k, json.dumps(report['mutants'][k]['killer_errors'])[:300])
    return 1 if failed or survivors else 0


if __name__ == '__main__':
    raise SystemExit(main())
