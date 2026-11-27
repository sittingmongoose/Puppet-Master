#!/usr/bin/env python3
"""PNC019 Goal sweep: complete checker witnesses and gated Method B phase tables.

No private guard-removal result is credited. Extensions register another case
source; no family-name special case exists in the isolation or mutation judge.
Native execution remains NOT_RUN.

C12-GH1 (lane 15, 2026-11-15) closes the s3ao conformance gaps G3a, G3b and G4
in this shared runner (GH2 and GO reuse it; see "Extension points" below):

* G3a. Rows are grouped into phase tables of at most eight rows. A phase is a
  co-observation class: every complete call that evaluates one of its rows
  evaluates all of them, so every call yields a complete observation vector
  for the phase. The gated tool 004bdedd63 receives those real vectors
  (distinct by value), each bound to the complete-call label and input
  SHA-256 that produced it. A row no complete call observed has no vector and
  is refused before the tool runs; `fabricated_row_self_test` keeps that as a
  standing negative.
* G3b/G4. Every complete call is a ledger entry (uncapped). A negative carries
  a declared target: from its source (fixture rule, generator `emit` keyword,
  authored bank), fixed before or independently of the observed result; never
  the observed refusal. Outcome classes: exact_expected, multiple_refusals,
  other_refusal, accepted, exception, undeclared. Only exact_expected inputs are
  replayed. KILLED needs both: the complete checker accepts with exactly that
  row cut, and an uncached restoration run returns the same refusal. A later
  refusal (COVERED_LATER), a cut exception or a failed restoration earns no
  credit. A later refusal is judged in this order (rulings 1121112536-0b66 (3),
  1121115610-7650, addendum 1 = 1121124828-43f4 (1)):
  KILLED_CODE (a kill, shown apart from KILLED) when the declared target is the
  row's own guard with its own code (its recorded origin frame is that guard,
  or the gate's static single-raise-site check holds; addendum 11 =
  1121131008-95db), the intact run is exact, the cut refuses
  with a DIFFERENT owner refusal code and the uncached restoration repeats the
  intact result (errors and code); a crash is never KILLED_CODE. A
  different-code refusal that misses any condition is CANNOT_DECIDE, never
  COVERED_LATER. A same-code later refusal is COVERED_LATER only when the cut
  trial's after-state equals the intact trial's (store digest and owner
  in-memory digest; the intact trial is the restoration, run a second time as
  its determinism control), else CANNOT_DECIDE. CANNOT_DECIDE never credits.
  Root-row prefix-equivalence (lead ruling 1121224233-9f91 (1)): two refusal
  codes are the same code for J2 when the refusal origins are the same source
  site (file:line) — both the recorded origin site and the innermost
  non-checker origin frame (the owner guard line; the recorded site alone can
  be the bank's shared raise line) — the violation suffix after the root-row
  segment is byte-equal, and the codes are byte-equal after removing the
  root-row prefix segment (<area>/<kind>/root/ -> <area>/root/); such a pair
  goes through the same-code after-state rule, never KILLED_CODE. Anything
  else stays a different code. A declared duplicate set (tuple target) is DUPLICATE_SET_KILLED only
  when its joint cut accepts, each single-site cut still refuses with the peer
  site, and restoration repeats the refusal.

Extension points (GH2, GO):
  --source MODULE   module with main()/run(); registers complete calls through
                    tables.COLLECTOR.invoke(label, evaluate, value, valid,
                    target=..., family=..., generated=...).
  declare(result, valid, target)  declare a call's target after it returned
                    (own-D `check` pattern); the result object identifies it.
  collector.family_scope  family attribution for a source's calls.
  earlier_clause_proof(name, reports)  source-bound proof provider (s3ao).
  pm_goal_schema_witnesses.run(collector)  declared keyword witnesses for every
                    seed validator, run after all sources.
"""
import argparse
import base64
import collections
import contextlib
import copy
import gzip
import hashlib
import importlib
import inspect
import io
import json
import os
from pathlib import Path
import pickle
import re
import subprocess
import sys
import time

import pm_goal_guard_tables as tables
import pm_guard_isolation as g

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = None
REPLAY_CAP = 4          # KILLED replays kept per (target, family, direct); every attempt is still listed
REPLAY_LIMIT = 40       # total cut/restoration replays per (target, family, direct), whatever their result
FABRICATED = 'reviewer/fabricated_guard_no_checker_has_this'


def replay_key(targets, record):
    """Cap/limit key: /direct/ records carry their own bucket so they cannot exhaust registered entries."""
    return (tuple(sorted(set(targets))), record['family'], '/direct/' in (record.get('label') or ''))


_FUNCTION_CONTEXTS = {}


def digest(value):
    # Pure frozen codec functions are immutable checker context. Their pickle
    # module aliases depend on import order; bind their actual source instead.
    if isinstance(value,dict)and set(value)=={'args','kwargs'}:
        def context(item):
            if not inspect.isfunction(item):return item
            if item.__closure__ or item.__defaults__ or item.__kwdefaults__:
                raise ValueError('callable context needs an explicit state binding')
            if item not in _FUNCTION_CONTEXTS:
                path=Path(item.__code__.co_filename)
                if not path.is_file():raise ValueError('callable context has no source file')
                _FUNCTION_CONTEXTS[item]=dict(frozen_callable_source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                    function=item.__qualname__,line=item.__code__.co_firstlineno)
            return _FUNCTION_CONTEXTS[item]
        args=[context(item)for item in value['args']]
        kwargs={key:context(item)for key,item in value['kwargs'].items()}
        if any(a is not b for a,b in zip(args,value['args']))or any(kwargs[k]is not v for k,v in value['kwargs'].items()):
            def typed(item):
                if isinstance(item,dict):
                    return ('dict',tuple((typed(key),typed(item[key]))for key in sorted(item,key=lambda key:(type(key).__name__,repr(key)))))
                if isinstance(item,(list,tuple)):return (type(item).__name__,tuple(typed(x)for x in item))
                if isinstance(item,(set,frozenset)):
                    return (type(item).__name__,sorted((typed(x)for x in item),key=lambda x:json.dumps(x,ensure_ascii=True,separators=(',',':'))))
                if isinstance(item,str):return ('str',item)
                if isinstance(item,bytes):return ('bytes',item.hex())
                if item is None:return ('none',)
                if type(item)is bool:return ('bool',item)
                if type(item)is int:return ('int',hex(item))
                if type(item)is float:return ('float',item.hex())
                raise TypeError('unsupported frozen context type: '+type(item).__name__)
            return hashlib.sha256(json.dumps(typed(dict(args=args,kwargs=kwargs)),ensure_ascii=True,separators=(',',':')).encode()).hexdigest()
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


# --- family attribution -------------------------------------------------------
_HISTORY_KEYS = None
_EVENT_TYPES = ('goal.child_status_changed','goal.degraded','goal.scheduled','goal.progressed','goal.replanned',
    'goal.stopped','goal.verification_decided','goal.evidence_captured','goal.receipt_recorded',
    'goal.tool_check_recorded','goal.created','restore_point.deleted','run.started','goal.blocked',
    'goal.completed','goal_run.blocked','goal_run.stopped')


def history_keys():
    global _HISTORY_KEYS
    if _HISTORY_KEYS is None:
        try:
            from pm_goal_history_reader_fixtures import FAMILIES
            _HISTORY_KEYS = {key: value[0] for key, value in FAMILIES.items()}
        except Exception:  # A source set without the history reader.
            _HISTORY_KEYS = {}
    return _HISTORY_KEYS


def family_of(label, scope=None):
    """Family attribution from the source's scope or its authored label."""
    if scope:
        return scope
    for event in _EVENT_TYPES:
        if event in label:
            return event
    keys = history_keys()
    parts = re.split(r'[/]', label)
    for part in parts:
        if part in keys:
            return keys[part]
    for key, event in keys.items():
        token = event.split('.', 1)[1]
        if token in label:
            return event
    return 'shared'


def family_from_prefix(prefix, schema=None):
    keys = history_keys()
    head = prefix.split('/', 1)[0]
    if head in keys:
        return keys[head]
    text = prefix + ' ' + json.dumps((schema or {}).get('$id', ''))
    for key, event in keys.items():
        if 'goal_' + key in text or event.replace('.', '_') in text:
            return event
    return family_of(prefix)


def boundary_of(family, label):
    if 'current_writer' in label or family in ('goal.created', 'run.started'):
        return 'append'
    return 'retained_history'


# --- later-refusal rules (KILLED_CODE, then the COVERED_LATER after-state rule) ---
# The kill classes that credit (KILLED_CODE shown apart from KILLED in every tally).
KILL_CLASSES = ('KILLED', 'DUPLICATE_SET_KILLED', 'KILLED_CODE')
# Classes a later refusal can get: KILLED_CODE credits as a kill; these never credit.
LATER_REFUSAL_CLASSES = ('COVERED_LATER', 'CANNOT_DECIDE')


def after_state(result):
    """The after-state a complete call exported: its store digest and owner-state digest.

    Only a store-bound call (pm_goal_dg5_boundaries.invoke) exports one. A plain
    error list exports none, so its later refusals are CANNOT_DECIDE.
    """
    if not isinstance(result, dict) or 'store_after_sha256' not in result:
        return None
    owner = result.get('owner_state') or {}
    return dict(store_sha256=result.get('store_after_sha256'), owner_sha256=result.get('owner_state_sha256'),
                owner_hook=owner.get('hook'), owner_reason=owner.get('reason'), owner_objects=owner.get('objects'),
                refusal_code=result.get('refusal_code'), refusal_origin=result.get('refusal_origin'))


def same_code(intact_code, cut_code):
    """The after-state rule's precondition: two owner refusal codes, both present and equal."""
    return all(isinstance(c, str) and c and not c.startswith('crash:') for c in (intact_code, cut_code)) \
        and intact_code == cut_code


def root_row_code_parts(code):
    """The root-row code grammar: <area>/<kind>/root/<violation suffix>.

    The s_readers root rows validate each root copy at one runtime check
    (`bank.validate(..., where + '/root')` with where = <area>/<kind>); the bank
    appends '/schema/<path>:<validator>'. The root-row segment is unambiguous
    only when 'root' is exactly one segment, at index 2, with a non-empty area,
    kind and suffix, and the suffix carries at least one non-'/' character:
    '<area>/<kind>/root/' and '<area>/<kind>/root//' name no violation and are
    not prefix-equivalent (N5 D1/E1, lead 1122004535-9d63). Returns
    (area, kind, suffix), or None when the code is not an unambiguous root-row
    code (the prefix rule then refuses to apply).
    """
    if not isinstance(code, str) or not code or code.startswith('crash:'):
        return None
    parts = code.split('/')
    if len(parts) < 4 or parts[2] != 'root' or parts.count('root') != 1 or not all(parts[:2]):
        return None
    suffix = '/'.join(parts[3:])
    if not suffix or not suffix.strip('/'):
        return None
    return parts[0], parts[1], suffix


def root_row_prefix_equivalent(intact_code, cut_code, intact_origin=None, cut_origin=None):
    """Lead ruling 1121224233-9f91 (1): two refusal codes are the same code for J2 when
    (a) the refusal origins are the same source site (file:line): both the recorded origin
    site and the innermost non-checker origin frame (the owner guard line, e.g.
    s_readers.py:94; the recorded site alone can be the bank's shared raise line),
    (b) the violation suffix after the root-row segment is byte-equal, and (c) the codes
    are byte-equal after removing the root-row prefix segment (<area>/<kind>/root/ ->
    <area>/root/). Anything that fails any of (a)-(c) stays a different code.
    Returns dict(applicable, ...)."""
    out = dict(applicable=False, intact_code=intact_code, cut_code=cut_code)
    intact_parts, cut_parts = root_row_code_parts(intact_code), root_row_code_parts(cut_code)
    if intact_parts is None or cut_parts is None:
        return dict(out, why='a code is not an unambiguous root-row code')
    if intact_code == cut_code:
        return dict(out, why='codes already byte-equal (the same-code rule applies directly)')

    def origin_site(origin):
        site = origin.get('site') if isinstance(origin, dict) else None
        return tuple(site) if isinstance(site, (list, tuple)) and len(site) == 2 else None

    def guard_site(origin):
        # The innermost origin frame outside the checker: the owner guard line that
        # raised the refusal (frames are [where, line, name, bridge_or_guard, checker]).
        for frame in reversed((origin.get('frames') or []) if isinstance(origin, dict) else []):
            if isinstance(frame, (list, tuple)) and len(frame) >= 5 and not frame[4]:
                return (frame[0], frame[1])
        return None
    intact_site, cut_site = origin_site(intact_origin), origin_site(cut_origin)
    intact_guard, cut_guard = guard_site(intact_origin), guard_site(cut_origin)
    if intact_site is None or cut_site is None:
        return dict(out, why='a refusal origin site is not recorded')
    if intact_site != cut_site:
        return dict(out, why='refusal origins at different sites: %s vs %s' % (list(intact_site), list(cut_site)))
    if intact_guard is None or cut_guard is None:
        return dict(out, why='an origin has no owner guard frame (only checker frames)')
    if intact_guard != cut_guard:
        return dict(out, why='refusal origins at different guard sites: %s vs %s' % (list(intact_guard), list(cut_guard)))
    if intact_parts[0] != cut_parts[0]:
        return dict(out, why='different area')
    if intact_parts[2] != cut_parts[2]:
        return dict(out, why='different violation suffix')
    return dict(out, applicable=True, site=list(intact_site), guard_site=list(intact_guard), area=intact_parts[0],
                kinds=[intact_parts[1], cut_parts[1]], suffix=intact_parts[2],
                normalized_code=intact_parts[0] + '/root/' + intact_parts[2])


def killed_code_check(target, intact_code, restoration_code, cut_code, origin=None, refusing_sites=(), cut_origin=None):
    """KILLED_CODE's four conditions (addendum 1); the caller has already found the intact
    run exact (outcome exact_expected), the restoration's errors equal to it and the cut
    refusing at a later row. Returns dict(verdict=KILLED_CODE|None, different_code, ...).
    Prefix-equivalent root-row codes (lead ruling 1121224233-9f91 (1)) are the same code
    for J2: they are not a different code and go to the after-state rule."""
    out = dict(intact_code=intact_code, restoration_code=restoration_code, cut_code=cut_code)
    if isinstance(cut_code, str) and cut_code.startswith('crash:'):
        # Addendum 1 and METHOD-RULING addendum C: a crash is never KILLED_CODE and never cover.
        return dict(out, verdict=None, different_code=False, crash=True, reason='cut trial crashed (' + cut_code + ')')
    known = all(isinstance(c, str) and c and not c.startswith('crash:') for c in (intact_code, cut_code))
    different = known and cut_code != intact_code
    if different:
        prefix = root_row_prefix_equivalent(intact_code, cut_code, origin, cut_origin)
        if prefix['applicable']:
            out['prefix_equivalence'] = prefix
            different = False
    out['different_code'] = different
    if not different:
        reason = 'no different owner refusal code' if not known else \
            ('prefix-equivalent root-row codes: same code for J2' if out.get('prefix_equivalence') else 'same code')
        return dict(out, verdict=None, reason=reason)
    if not isinstance(target, str):
        return dict(out, verdict=None, reason='declared target is a set, not one guard')
    import pm_goal_dg5_boundaries as bridge
    own = bridge.row_code_check(target, intact_code, origin, refusing_sites or ())
    out['own_guard'] = own
    if not own['own']:
        return dict(out, verdict=None, reason='declared target is not the row guard with its own code: ' + str(own['why']))
    if restoration_code != intact_code:
        return dict(out, verdict=None, reason='restoration did not repeat the intact refusal code')
    return dict(out, verdict='KILLED_CODE', reason=None)


def covered_later_check(intact, restoration, cut):
    """The shared after-state rule (pm_goal_dg5_owner_state.covered_later_check; the forked
    Method B judge applies the same function)."""
    from pm_goal_dg5_owner_state import covered_later_check as rule
    return rule(intact, restoration, cut)


class Collector:
    def __init__(self, *, judge=True):
        self.checkpoint_path = OUTPUT
        self.active = None
        self.replaying = False
        self.family_scope = None
        self.judge = judge
        self.rows = {}
        self.calls = 0
        self.failures = []
        self.candidates = {}
        self.snapshots = {}
        self.schema_seeds = {}
        self.proof_providers = []
        self.store_snapshots = []
        self.frozen_exploration = None
        self.signatures = {}
        self.signature_list = []
        self.ledger = []
        self.pending = None
        self.replays = collections.Counter()
        self.replay_attempts = collections.Counter()
        self.order = 0
        self.generator_stats = {}
        self.replay_unknown_rows = set()

    def checkpoint(self):
        if OUTPUT is None:return
        OUTPUT.mkdir(parents=True,exist_ok=True)
        (OUTPUT/'partial-collection.json').write_text(json.dumps(dict(calls=self.calls,failures=self.failures,
            rows={name:{**{k:v for k,v in slot.items() if k!='sites'},'sites':sorted(slot['sites'])} for name,slot in self.rows.items()}),indent=1)+'\n')

    def schema_seed(self, validator, value, prefix):
        family = family_from_prefix(prefix, validator.schema)
        key = (digest(validator.schema),value.get('schema_version') if isinstance(value,dict) else None, family)
        slot = self.schema_seeds.setdefault(key, [])
        if len(slot) < 24 and all(digest(v[1]) != digest(value) for v in slot):
            slot.append((validator, copy.deepcopy(value), prefix))

    def observe(self, name, holds, site):
        if self.replaying:
            if self.active is not None:
                self.active.append((name, holds))
            return
        row = self.rows.get(name)
        if row is None:
            row = self.rows[name] = dict(sites=set(), controls=[], negatives=[], later=[], order=self.order)
            self.order += 1
        row['sites'].add(tuple(site))
        scopes=row.setdefault('family_scopes',[])
        if self.family_scope and self.family_scope not in scopes:scopes.append(self.family_scope)
        if self.active is not None:
            self.active.append((name, holds))

    def _signature(self, names):
        key = frozenset(names)
        ident = self.signatures.get(key)
        if ident is None:
            ident = self.signatures[key] = len(self.signature_list)
            self.signature_list.append(key)
        return ident

    def _settle(self):
        if self.pending is not None:
            record = self.pending[0]
            self.pending = None
            self._judge(record, None, None)

    def declare(self, result, valid, target):
        """Declare the target of the call that returned `result` (own-D check)."""
        if self.pending is None or self.pending[1] is not result:
            return False
        record, _, evaluate, value = self.pending
        self.pending = None
        record['valid'] = valid
        record['target'] = target
        record['declared_by'] = 'source_check'
        self._judge(record, evaluate, value)
        return True

    def invoke(self, label, evaluate, value, valid=None, *, target=None, family=None, generated=False):
        self._settle()
        before = digest(value)
        previous = self.active
        self.active = []
        fam = family or family_of(label, self.family_scope)
        try:
            result = evaluate(copy.deepcopy(value))
            errors = set(result['errors'] if isinstance(result, dict) else result)
            observed = self.active
        except Exception as exc:
            self.active = previous
            self.ledger.append(dict(id=len(self.ledger), label=label, family=fam, input_sha256=before, valid=valid,
                target=target, generated=generated, errors=None, outcome='exception',
                exception=type(exc).__name__, detail=str(exc)[:200]))
            if not generated:
                self.failures.append(dict(case=label, kind='exception', exception=type(exc).__name__, detail=str(exc)[:300]))
            return dict(errors=['UNEXPECTED_EXCEPTION'])
        finally:
            self.active = previous
        self.calls += 1
        if isinstance(result, dict) and 'store_snapshot_sha256' in result:
            self.store_snapshots.append(dict(case=label, before=result['store_snapshot_sha256'],
                                             after=result['store_after_sha256'], input_sha256=before,
                                             snapshot_pickle_base64=base64.b64encode(pickle.dumps(value['store'],protocol=5)).decode()))
        if self.calls % 2000 == 0:
            print(f'complete calls {self.calls}; rows {len(self.rows)}; ledger {len(self.ledger)}', file=sys.stderr, flush=True)
        if digest(value) != before:
            self.failures.append(dict(case=label, kind='fixture_mutation'))
        if valid is not None and bool(errors) == valid and not generated:
            self.failures.append(dict(case=label, kind='expectation', valid=valid, errors=sorted(errors)))
        first = next((name for name, holds in observed if not holds), None)
        merged = {}
        for name, holds in observed:
            merged[name] = merged.get(name, True) and holds
        record = dict(id=len(self.ledger), label=label, family=fam, input_sha256=before, valid=valid, target=target,
            generated=generated, errors=sorted(errors), first=first, sig=self._signature(merged),
            failing=tuple(sorted(name for name, holds in merged.items() if not holds)),
            after_state=after_state(result),
            refusal_code=result.get('refusal_code') if isinstance(result, dict) else None,
            refusal_origin=result.get('refusal_origin') if isinstance(result, dict) else None,
            refusing_sites=result.get('refusing_sites') if isinstance(result, dict) else None)
        self.ledger.append(record)
        one = len(errors) == 1 and first in errors
        for name, holds in merged.items():
            slot = self.rows[name]
            if not errors and holds and len(slot['controls']) < 2:
                slot['controls'].append(dict(source=label, input_sha256=before))
            elif not holds and one and name == first and len(slot['negatives']) < 2:
                slot['negatives'].append(dict(source=label, input_sha256=before, observed=name))
                self.candidates.setdefault(name, (evaluate, copy.deepcopy(value), label))
                self.snapshots.setdefault(name, copy.deepcopy(value))
        if target is not None or valid is not None:
            record['declared_by'] = 'invoke'
            self._judge(record, evaluate, value)
        else:
            self.pending = (record, result, evaluate, copy.deepcopy(value))
        return result

    def _replay(self, evaluate, value, cut):
        """One full complete-checker run, uncached, with exactly `cut` disabled."""
        return self._trial(evaluate, value, cut)[0]

    def _trial(self, evaluate, value, cut, *, state=False):
        """`_replay` and the trial's after-state (store and owner digests; None when the call exports none).

        With `state`, the call is asked for its owner in-memory digest
        (`tables.AFTER_STATE`); a store-bound call computes it only then, because
        the walk is the costly part and only the judged trials need it.
        """
        saved = (tables.CUT, tables.NO_CACHE, self.active, self.replaying, getattr(tables, 'AFTER_STATE', False))
        tables.CUT, tables.NO_CACHE, self.active, self.replaying = frozenset(cut), True, [], True
        tables.AFTER_STATE = state
        try:
            result = evaluate(copy.deepcopy(value))
            return sorted(set(result['errors'] if isinstance(result, dict) else result)), after_state(result)
        except Exception as exc:
            return 'exception:' + type(exc).__name__, None
        finally:
            tables.CUT, tables.NO_CACHE, self.active, self.replaying, tables.AFTER_STATE = saved

    def _judge(self, record, evaluate, value):
        target, valid = record.get('target'), record.get('valid')
        errors = set(record['errors'] or [])
        if valid is True:
            record['outcome'] = 'control' if not errors else 'control_refused'
            return
        if target is None:
            record['outcome'] = 'undeclared' if errors or valid is False else 'undeclared_accepted'
            return
        targets = set(target) if isinstance(target, (list, tuple)) else {target}
        if not errors:
            outcome = 'accepted'
        elif errors == targets or (len(targets) > 1 and errors <= targets):
            # A declared duplicate set may hold sites the baseline does not
            # reach (behind a decided structural stop). The site cuts below
            # must still show each site refusing alone, or no credit.
            outcome = 'exact_expected'
            if errors != targets:
                record['shadowed_sites'] = sorted(targets - errors)
        elif targets <= errors:
            outcome = 'multiple_refusals'
        else:
            outcome = 'other_refusal'
        record['outcome'] = outcome
        if outcome != 'exact_expected' or not self.judge or evaluate is None:
            return
        key = replay_key(targets, record)
        # Kills are capped; a COVERED_LATER replay never uses up a later
        # witness's chance to be judged (only the total bound does).
        if self.replays[key] >= REPLAY_CAP or self.replay_attempts[key] >= REPLAY_LIMIT:
            record['kill'] = 'NOT_REPLAYED_CAP'
            return
        self.replay_attempts[key] += 1
        cut, cut_state = self._trial(evaluate, value, targets, state=True)
        later = isinstance(cut, list) and bool(cut)
        # A later refusal is judged on after-states: the intact trial runs twice with its
        # owner digest (restoration and its repeat, the determinism control).
        restoration, restoration_state = self._trial(evaluate, value, (), state=later)
        record['cut_errors'] = cut
        record['restoration_errors'] = restoration
        if restoration != sorted(errors):
            record['kill'] = 'RESTORATION_FAILED'
        elif isinstance(cut, str):
            record['kill'] = 'CUT_EXCEPTION'
        elif len(targets) > 1 and not cut:
            self._site_cuts(record, evaluate, value, targets, errors, key)
        elif cut:
            # After KILLED (the cut accepts): KILLED_CODE, then the after-state rule.
            code = killed_code_check(record['target'], record.get('refusal_code'),
                                     (restoration_state or {}).get('refusal_code'), (cut_state or {}).get('refusal_code'),
                                     record.get('refusal_origin'), record.get('refusing_sites'),
                                     cut_origin=(cut_state or {}).get('refusal_origin'))
            record['killed_code_check'] = code
            if code['verdict'] == 'KILLED_CODE':
                record['kill'] = 'KILLED_CODE'
                self.replays[key] += 1
            elif code.get('crash'):
                record['kill'] = 'CANNOT_DECIDE'   # a crash is not cover (addendum C) and not KILLED_CODE
                record['cannot_decide_reason'] = code['reason']
            elif code['different_code']:
                record['kill'] = 'CANNOT_DECIDE'   # a different-code refusal is never COVERED_LATER
                record['cannot_decide_reason'] = 'different-code later refusal: ' + code['reason']
            elif not same_code(code['intact_code'], code['cut_code']) and not code.get('prefix_equivalence'):
                # Only a same-code later refusal can be cover (review (b)): both codes must exist and be equal.
                record['kill'] = 'CANNOT_DECIDE'
                record['cannot_decide_reason'] = 'not a same-code later refusal: intact %r, cut %r' % (
                    code['intact_code'], code['cut_code'])
            else:
                repeat, repeat_state = self._trial(evaluate, value, (), state=True)
                record['restoration_repeat_errors'] = repeat
                check = covered_later_check(restoration_state, repeat_state, cut_state)
                if repeat != restoration:
                    check = dict(check, verdict='CANNOT_DECIDE', reason='intact trial is not deterministic: '
                                 'its repeat refused differently')
                record['covered_later_check'] = check
                record['kill'] = check['verdict']
                if check['verdict'] == 'CANNOT_DECIDE':
                    record['cannot_decide_reason'] = check['reason']
            if len(targets) == 1 and len(cut) == 1:
                joint = self._replay(evaluate, value, targets | set(cut))
                record['joint_cut'] = dict(rows=sorted(targets | set(cut)), errors=joint)
        elif len(targets) == 1:
            record['kill'] = 'KILLED'
            self.replays[key] += 1

    def _site_cuts(self, record, evaluate, value, targets, errors, key):
        """Each site (a registered type/enum/const duplicate group counts as one
        site) must refuse alone with every other site cut; the joint cut
        already accepted. Otherwise the set earns nothing."""
        import pm_goal_oracle_common as common
        groups = []
        for site in sorted(targets):
            members = {site} | {m for g, ms in common._SCHEMA_DUPLICATES.items() if site in ms or g == site
                                for m in ({g} | set(ms)) if m in targets}
            if not any(members & group for group in groups):
                groups.append(members)
            else:
                next(group for group in groups if members & group).update(members)
        sites = {}
        if len(groups) == 1:
            # One registered duplicate invariant: the joint cut accepted.
            record['kill'] = 'KILLED'
            record['site_cuts'] = {'|'.join(sorted(groups[0])): 'single registered duplicate group'}
            self.replays[key] += 1
            return
        ok = True
        for group in groups:
            result = self._replay(evaluate, value, targets - group)
            sites['|'.join(sorted(group))] = result
            ok = ok and isinstance(result, list) and result and set(result) <= group
        record['site_cuts'] = sites
        record['kill'] = 'DUPLICATE_SET_KILLED' if ok else 'DUPLICATE_SET_SITE_FAILED'
        if record['kill'] == 'DUPLICATE_SET_KILLED':
            self.replays[key] += 1

    def finish(self):
        self._settle()

    def audit(self, audit):
        # Register schema sites before adding the authored per-type witnesses.
        for case in list(audit.cases):
            _, evaluate, value, valid = case[:4]
            if valid:
                self.invoke('schema-registration', lambda x, e=evaluate: e(x, set()), value)
                self._settle()
        import pm_goal_oracle_common as common
        fixtures = common.load(ROOT / 'Plans/goal_oracle_schema_type_fixtures.json').get('suites', {}).get(audit.suite, {})
        for case in fixtures.get('cases', []):
            site = next((v for (_, prefix), v in common._SCHEMA_SITES.items() if prefix == case['site']), None)
            if site is None:
                self.failures.append(dict(kind='unknown_schema_site', site=case['site']))
                continue
            baseline = fixtures['bases'][case['base_id']]
            value = common.materialize_cases([
                dict(id='base', valid=True, input=baseline),
                dict(id=case['id'], base_id='base', valid=False, changes=case['changes'])])[1]['input']
            def schema(value, disabled, v=site, prefix=case['site']):
                gate = common.Gates(disabled)
                gate.schema(v, value, prefix)
                return gate.errors
            audit.case(case['id'], schema, value, False, base=baseline)
        start = len(self.failures)
        for case in audit.cases:
            name, evaluate, value, valid, base = case[:5]
            target = case[5] if len(case) > 5 else None
            self.invoke(audit.suite + '/' + name, lambda x, e=evaluate: e(x, set()), value, valid, target=target)
        failures = audit.failures + self.failures[start:]
        return dict(status='fail' if failures else 'pass', cases=len(audit.cases),
                    negatives=sum(not c[3] for c in audit.cases), failures=failures,
                    guard_removal=[], schema_type_inventory={}, native_execution='NOT_RUN')

    # Optional exploratory search (s3ao). Undeclared: never kill credit.
    def fuzz_schemas(self):
        import pm_goal_oracle_common as common
        def leaves(value, path=()):
            yield path, value
            if isinstance(value, dict):
                for key, child in value.items():
                    yield from leaves(child, path+(key,))
            elif isinstance(value, list):
                for key, child in enumerate(value):
                    yield from leaves(child, path+(key,))
        seeds = [seed for group in self.schema_seeds.values() for seed in group]
        for index, (validator, base, prefix) in enumerate(seeds):
            def evaluate(value, v=validator, p=prefix):
                gate = common.Gates(); gate.schema(v, value, p); return gate.errors
            for path, original in list(leaves(base)):
                for number, replacement in enumerate([None, False, 0, 1.5, '', 'foreign', [], {}]):
                    changed = copy.deepcopy(base)
                    if path:
                        parent = changed
                        for part in path[:-1]:
                            parent = parent[part]
                        parent[path[-1]] = replacement
                    else:
                        changed = replacement
                    self.invoke(f'schema-fuzz/{index}/{path!r}/{number}', evaluate, changed, False, generated=True)


def collect(sources, *, fuzz=True, judge=True, keyword_witnesses=True):
    tables.ACTIVE = True
    collector = Collector(judge=judge)
    tables.COLLECTOR = collector
    try:
        for source in sources:
            module = importlib.import_module(source)
            before=collector.calls
            entry=getattr(module,'main',None)or getattr(module,'run')
            with contextlib.redirect_stdout(io.StringIO()) as captured:
                code=entry([])if 'argv'in inspect.signature(entry).parameters else entry()
            collector.finish()
            provider=getattr(module,'earlier_clause_proof',None)
            if provider is not None:collector.proof_providers.append(provider)
            if collector.calls==before:
                collector.failures.append(dict(kind='source_registered_no_complete_calls',source=source))
            if code:
                collector.failures.append(dict(kind='source_failed', source=source, exit=code, details=captured.getvalue()[-16000:]))
            collector.checkpoint()
            print(f'source {source}: calls={collector.calls} rows={len(collector.rows)} failures={len(collector.failures)}',
                  file=sys.stderr, flush=True)
        import pm_goal_oracle_common as common
        # Re-observe real accepted owner-schema inputs after discovering its
        # refusal names; a positive is never fabricated from a negative mask.
        for index, seeds in enumerate(list(collector.schema_seeds.values())):
            for number,(validator,value,prefix) in enumerate(seeds):
                def control(value,v=validator,p=prefix):
                    gate=common.Gates();gate.schema(v,value,p);return gate.errors
                collector.invoke(f'schema-control/{index}/{number}',control,value,True,
                                 family=family_from_prefix(prefix, validator.schema))
        if keyword_witnesses:
            import pm_goal_schema_witnesses as keywords
            collector.generator_stats['schema_keywords'] = keywords.run(collector)
        if fuzz:
            collector.fuzz_schemas()
        collector.finish()
    finally:
        tables.COLLECTOR = None
    return collector


# --- phase tables -------------------------------------------------------------
def partition(collector):
    """Co-observation classes, chunked to at most eight rows, in first-seen order.

    A row with no single-false vector inside its chunk, or none at all, moves
    to a singleton table (W3-P2: an unproved row sits alone in its table).
    """
    row_sigs = collections.defaultdict(set)
    for ident, names in enumerate(collector.signature_list):
        for name in names:
            row_sigs[name].add(ident)
    classes = collections.defaultdict(list)
    for name in collector.rows:
        if row_sigs.get(name):
            classes[frozenset(row_sigs[name])].append(name)
    by_sig = collections.defaultdict(list)
    for record in collector.ledger:
        if record.get('sig') is not None:
            by_sig[record['sig']].append(record['failing'])
    out = []
    for sigs, names in sorted(classes.items(), key=lambda item: min(collector.rows[n]['order'] for n in item[1])):
        names.sort(key=lambda n: collector.rows[n]['order'])
        failing_sets = [set(f) for s in sigs for f in by_sig[s]]
        for start in range(0, len(names), 8):
            chunk = names[start:start+8]
            single = {n for f in failing_sets for n in [f & set(chunk)] if len(n) == 1 for n in n}
            keep = [n for n in chunk if n in single]
            alone = [n for n in chunk if n not in single]
            if keep:
                out.append(keep)
            out.extend([n] for n in alone)
    return out


def table_id(names):
    return hashlib.sha256('\n'.join(names).encode()).hexdigest()[:16]


def table_source(ident, names, sites):
    lines = ['"""Goal phase guard table ' + ident + '; generated by pm_goal_guard_sweep.py --generate.',
             '',
             'One co-observation class of the complete Goal checkers: every complete call',
             'that evaluates one of these rows evaluates all of them, so the gated tool',
             'is fed the real per-call observation vector. Each predicate reads only the',
             'Boolean its complete checker computed for that row from the full input.',
             '"""',
             'import pm_guard_isolation as g',
             '',
             'FIELDS = (' + ''.join(repr(n) + ', ' for n in names) + ')',
             '']
    for index, name in enumerate(names):
        lines += ['', f'def row_{index:02d}(value, context):',
                  f'    return {name!r} if value[{name!r}] is not True else None', '']
    lines += ['', 'def case(value):', '    context = None', '    table = g.GuardTable([']
    for index, name in enumerate(names):
        where = '; '.join(f'{p}:{l}' for p, l in sorted(sites[name])[:4])
        lines.append(f'        g.Guard({name!r}, g.Invariant({("/" + name)!r}, '
                     f'{("complete checker predicate holds at " + where)!r}), {name!r}, row_{index:02d}),')
    lines += ['    ])', '', '    def check(value):']
    for name in names:
        lines.append(f'        table.require({name!r}, value, context)')
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def site_location(site):
    path=Path(site[0])
    return (str(path.relative_to(ROOT))if path.is_absolute()and path.is_relative_to(ROOT)else site[0],site[1])


def generate(collector, *, replace=False):
    """Deterministically generate checked-in table code, never generated evidence."""
    path = ROOT / 'scripts/pm_goal_guard_rows.json'
    mapping = json.loads(path.read_text()) if path.exists() and not replace else {}
    chunks = partition(collector)
    for names in chunks:
        ident = table_id(names)
        sites = {n: [site_location(s) for s in collector.rows[n]['sites']] for n in names}
        (ROOT / f'scripts/{tables.PHASE_PREFIX}{ident}.py').write_text(table_source(ident, names, sites))
        for index, name in enumerate(names):
            mapping[name] = dict(table=ident, phase=True, index=index, rows=len(names),
                                 sites=sorted(sites[name]))
    path.write_text(json.dumps(mapping, indent=2, sort_keys=True)+'\n')
    witnesses = {}
    for record in collector.ledger:
        if record.get('kill') in KILL_CLASSES:
            target = record['target'] if isinstance(record['target'], str) else '|'.join(sorted(record['target']))
            witnesses.setdefault(target, dict(expected_refusal=record['target'], source=record['label'],
                family=record['family'], input_sha256=record['input_sha256'], kill=record['kill']))
    (ROOT / 'scripts/pm_goal_guard_witnesses.json').write_text(json.dumps(witnesses,indent=2,sort_keys=True)+'\n')
    if replace:
        keep = {tables.PHASE_PREFIX+row['table'] for row in mapping.values() if row.get('phase')}
        keep |= {tables.PREFIX+row['table'] for row in mapping.values() if not row.get('phase')}
        for prefix in (tables.PREFIX, tables.PHASE_PREFIX):
            for path in (ROOT/'scripts').glob(prefix+'*.py'):
                if path.stem not in keep and 'generated by pm_goal_guard_sweep.py' in path.read_text().splitlines()[0]:
                    path.unlink()
    return chunks


# --- gated proof on real vectors ----------------------------------------------
def table_records(collector):
    by_sig = collections.defaultdict(list)
    for record in collector.ledger:
        if record.get('sig') is not None:
            by_sig[record['sig']].append(record)
    return by_sig


PREFERENCE = {'KILLED': 0, 'DUPLICATE_SET_KILLED': 1, 'KILLED_CODE': 2, 'NOT_REPLAYED_CAP': 3, 'COVERED_LATER': 4,
              'CANNOT_DECIDE': 5}


def vectors_for(collector, names, by_sig):
    """Real distinct observation vectors for one table; refuse a row nobody observed."""
    names = list(names)
    sigs = [s for s, members in enumerate(collector.signature_list) if names[0] in members]
    full, partial = [], 0
    for s in sigs:
        members = collector.signature_list[s]
        if not set(names) <= members:
            partial += len(by_sig[s])
            continue
        full.extend(by_sig[s])
    unobserved = [n for n in names if not any(n in collector.signature_list[s] for s in sigs)]
    groups = collections.defaultdict(list)
    for record in full:
        failing = set(record['failing']) & set(names)
        groups[tuple(n in failing for n in names)].append(record)
    return full, partial, unobserved, groups


def rank(record, target):
    exact = record.get('outcome') == 'exact_expected' and record.get('target') == target
    return (0 if exact and record.get('kill') == 'KILLED' else 1 if exact else 2 if record['errors'] == [target] else 3,
            PREFERENCE.get(record.get('kill'), 9), record['id'])


def prove_table(collector, ident, names, by_sig, out, *, module_name=None, path=None):
    full, partial, unobserved, groups = vectors_for(collector, names, by_sig)
    entry = dict(table=ident, rows=list(names), records=len(full), partial_vector_records=partial,
                 distinct_vectors=len(groups), unobserved_rows=unobserved)
    if unobserved:
        entry.update(status='REFUSED', reason='row_never_observed_by_complete_checker', proved=[])
        return entry
    control_key = tuple(False for _ in names)
    controls = sorted(groups.get(control_key, []), key=lambda r: (r['errors'] != [], r['id']))
    multi = {k: len(v) for k, v in groups.items() if sum(k) > 1}
    entry['not_single_row'] = dict(vectors=len(multi), records=sum(multi.values()))
    negatives = []
    for index, name in enumerate(names):
        key = tuple(i == index for i in range(len(names)))
        if groups.get(key):
            best = sorted(groups[key], key=lambda r: rank(r, name))
            negatives.append((name, key, best[:10]))
    entry['rows_without_negative'] = [n for n in names if n not in {x[0] for x in negatives}]
    if not controls or not negatives:
        entry.update(status='NOT_RUN', reason='no control vector' if not controls else 'no single-row vector', proved=[])
        return entry
    boundary = boundary_of(controls[0]['family'], controls[0]['label'])
    vector = lambda key: {n: not bad for n, bad in zip(names, key)}
    gc = [g.Control('control/' + ident, vector(control_key), boundary)]
    gn = []
    for number, (name, key, best) in enumerate(negatives):
        witness = best[0]
        gn.append(g.Negative(f'negative/{ident}/{number}', vector(key), name, name, gc[0].id,
            f'complete-checker witness {witness["label"]} ({witness["family"]}) input sha256 '
            f'{witness["input_sha256"]}; outcome {witness.get("outcome")}; kill {witness.get("kill")}'))
    module_name = module_name or tables.PHASE_PREFIX + ident
    path = path or f'scripts/{module_name}.py'
    module = importlib.import_module(module_name)
    suite = g.Suite('Goal phase ' + ident, module.case, gc, gn, (path,), ROOT,
        non_guards=[g.NonGuard(path, 'case', 'return', 'return g.Case(table, check, context)',
            'Fresh engine Case construction; no acceptance/refusal decision.')])
    report = g.run(suite)
    filename = ident + '.json.gz'
    with gzip.open(out / filename, 'wt') as handle:
        json.dump(report, handle, sort_keys=True, default=str)
    proved = sorted(r['id'] for r in report.get('rows', []) if r.get('proved'))
    entry.update(status=report['status'], proved=proved, report=filename,
                 report_sha256=hashlib.sha256((out / filename).read_bytes()).hexdigest(),
                 failure_kinds=sorted({f.get('kind') for f in report.get('failures', [])}),
                 controls=[dict(id=gc[0].id, boundary=boundary, witnesses=[dict(label=r['label'], family=r['family'],
                     input_sha256=r['input_sha256'], complete_errors=r['errors']) for r in controls[:10]])],
                 negatives=[dict(id=n.id, target=n.target, witnesses=[dict(label=r['label'], family=r['family'],
                     input_sha256=r['input_sha256'], outcome=r.get('outcome'), kill=r.get('kill'),
                     complete_errors=r['errors']) for r in best[:10]]) for n, (_, _, best) in zip(gn, negatives)])
    return entry


def prove(collector, out, only=None):
    out.mkdir(parents=True, exist_ok=True)
    manifest = tables.rows()
    grouped = collections.defaultdict(list)
    for name, spec in manifest.items():
        if name in collector.rows:
            grouped[spec['table']].append((spec.get('index', 0), name, spec))
    by_sig = table_records(collector)
    reports = []
    for ident in sorted(grouped):
        if only and ident not in only:
            continue
        entries = sorted(grouped[ident])
        names = [n for _, n, _ in entries]
        if entries[0][2].get('phase'):
            entry = prove_table(collector, ident, names, by_sig, out)
        else:
            entry = prove_table(collector, ident, names, by_sig, out, module_name=tables.PREFIX + ident)
        reports.append(entry)
        if len(reports) % 25 == 0:
            print(f'tables {len(reports)} proved {sum(len(x["proved"]) for x in reports)}', file=sys.stderr, flush=True)
    (out / 'summary.json').write_text(json.dumps(reports, indent=1, default=list)+'\n')
    # Row view: each unproved row gets a source-bound proof or stays open.
    rows = []
    for entry in reports:
        for name in entry['rows']:
            rows.append(dict(guard=name, table=entry['table'], status='PASS' if name in entry['proved'] else 'UNPROVED',
                             table_status=entry['status']))
    for row in rows:
        if row['status']=='UNPROVED':
            proof=dominance_proof(row['guard'],rows) or union_member_proof(row['guard'],rows)
            for provider in collector.proof_providers:
                if proof:break
                candidate=provider(row['guard'],rows)
                if candidate:
                    earlier=candidate.get('earlier_guards',[])
                    if not earlier or any(not any(r['guard']==name and r['status']=='PASS'for r in rows)for name in earlier):
                        raise ValueError('earlier-clause proof lacks a proved dependency: '+row['guard'])
                    proof=candidate
            if proof:row['proof']=proof
    (out/'rows.json').write_text(json.dumps(rows,indent=1,default=list)+'\n')
    return reports, rows


def fabricated_row_self_test(collector, out, reports):
    """Standing negative: a guard name no checker evaluates is refused (G3a)."""
    host = next((r for r in reports if r['status'] == 'PASS' and len(r['rows']) >= 2), None)
    if host is None:
        return dict(status='fail', reason='no proved multi-row table to host the probe')
    names = host['rows'] + [FABRICATED]
    by_sig = table_records(collector)
    pipeline = prove_table(collector, 'fabricated-probe', names, by_sig, out)
    # Force the gated tool with every real vector of the host table: the
    # fabricated predicate reads a field no complete call produced.
    full, _, _, groups = vectors_for(collector, host['rows'], by_sig)
    module_name = 'pm_c12_fabricated_selftest_table'
    path = ROOT / 'scripts' / (module_name + '.py')
    sites = {n: [site_location(s) for s in collector.rows[n]['sites']] for n in host['rows']}
    sites[FABRICATED] = [('nowhere', 0)]
    tool = None
    try:
        path.write_text(table_source('fabricated-probe', names, sites).replace(
            'generated by pm_goal_guard_sweep.py --generate', 'C12-GH1 fabricated-row self-test probe; deleted after the run'))
        importlib.invalidate_caches()
        module = importlib.import_module(module_name)
        host_names = host['rows']
        vector = lambda key: {n: not bad for n, bad in zip(host_names, key)}
        control_key = tuple(False for _ in host_names)
        gc = [g.Control('control/probe', vector(control_key), 'retained_history')]
        gn = []
        for index, name in enumerate(host_names):
            key = tuple(i == index for i in range(len(host_names)))
            if groups.get(key):
                gn.append(g.Negative(f'negative/probe/{index}', vector(key), name, name, 'control/probe', 'real host vector'))
        suite = g.Suite('C12-GH1 fabricated probe', module.case, gc, gn, ('scripts/' + module_name + '.py',), ROOT,
            non_guards=[g.NonGuard('scripts/' + module_name + '.py', 'case', 'return', 'return g.Case(table, check, context)',
                'Fresh engine Case construction; no acceptance/refusal decision.')])
        report = g.run(suite)
        tool = dict(status=report['status'], fabricated_proved=any(r['id'] == FABRICATED and r.get('proved')
            for r in report.get('rows', [])), failure_kinds=sorted({f.get('kind') for f in report.get('failures', [])}),
            proved=sorted(r['id'] for r in report.get('rows', []) if r.get('proved')))
    except Exception as exc:  # A probe that cannot be built is reported, never passed.
        tool = dict(status='EXCEPTION', exception=type(exc).__name__, detail=str(exc)[:300], fabricated_proved=False)
    finally:
        sys.modules.pop(module_name, None)
        if path.exists():
            path.unlink()
    # Contrast: the s3ao synthetic proof of the same name, which never consulted a checker.
    legacy = None
    legacy_name = 'pm_c12_fabricated_selftest_legacy'
    legacy_path = ROOT / 'scripts' / (legacy_name + '.py')
    try:
        legacy_path.write_text('"""C12-GH1 legacy synthetic-vector contrast; deleted after the run."""\n'
            'import pm_guard_isolation as g\n\n'
            'def predicate(value, context):\n'
            f'    return {FABRICATED!r} if value[{FABRICATED!r}] is not True else None\n\n'
            'def case(value):\n    context = None\n    table = g.GuardTable([\n'
            f'        g.Guard({FABRICATED!r}, g.Invariant({("/"+FABRICATED)!r}, "made-up"), {FABRICATED!r}, predicate),\n'
            '    ])\n    def check(value):\n'
            f'        table.require({FABRICATED!r}, value, context)\n        return True\n'
            '    return g.Case(table, check, context)\n')
        importlib.invalidate_caches()
        module = importlib.import_module(legacy_name)
        suite = g.Suite('legacy synthetic', module.case, [g.Control('control', {FABRICATED: True}, 'synthetic')],
            [g.Negative('negative', {FABRICATED: False}, FABRICATED, FABRICATED, 'control', 'synthetic')],
            ('scripts/' + legacy_name + '.py',), ROOT, non_guards=[g.NonGuard('scripts/' + legacy_name + '.py', 'case',
            'return', 'return g.Case(table, check, context)', 'Fresh engine Case construction.')])
        report = g.run(suite)
        legacy = dict(status=report['status'], proved=sum(1 for r in report.get('rows', []) if r.get('proved')))
    except Exception as exc:
        legacy = dict(status='EXCEPTION', exception=type(exc).__name__)
    finally:
        sys.modules.pop(legacy_name, None)
        if legacy_path.exists():
            legacy_path.unlink()
    passed = pipeline['status'] == 'REFUSED' and FABRICATED in pipeline['unobserved_rows'] and not tool.get('fabricated_proved')
    return dict(status='pass' if passed else 'fail', fabricated=FABRICATED, host_table=host['table'],
                pipeline=dict(status=pipeline['status'], reason=pipeline.get('reason'), unobserved=pipeline['unobserved_rows']),
                gated_tool_on_real_vectors=tool, legacy_synthetic_contrast=legacy)


def union_member_proof(name, reports):
    """An owner assertion inside a union alternative is never the sole refusal (C12-GH1).

    Structural fact (pm_goal_oracle_common.schema_type_inventory): every schema
    path from every validator root reaches this keyword only through one or
    more unions. Code fact (schema_guards): when the keyword fails but another
    alternative accepts, the union holds and nothing refuses; when the union
    fails, (a) for a oneOf and a non-type keyword, the composed rule reports
    the oneOf in place of its own descendants; (b) for an anyOf whose
    alternatives only hold type/minimum/minLength/required, the union rule
    reports the anyOf. Either way the union row, separately proved, refuses.
    """
    import pm_goal_oracle_common as c
    contexts = c._SCHEMA_UNION_CONTEXTS.get(name)
    info = c._SCHEMA_ASSERTION_INFO.get(name)
    if not contexts or None in contexts or info is None:
        return None
    for union in contexts:
        if union.endswith('/oneOf'):
            if info['keyword'] == 'type':
                return None
        elif union.endswith('/anyOf'):
            if union not in c._SCHEMA_SIMPLE_UNIONS:
                return None
        else:
            return None
    passed = {r['guard'] for r in reports if r['status'] == 'PASS'}
    if not set(contexts) <= passed:
        return None
    source = ROOT / 'scripts/pm_goal_oracle_common.py'
    text = source.read_text().splitlines()
    lines = [i for i, x in enumerate(text, 1) if 'if union_errors:' in x or "composed=[e for e in errors if e.validator=='oneOf']" in x]
    return dict(kind='union_alternative_member', earlier_guards=sorted(contexts),
                owner=info['location'], keyword=info['keyword'],
                checker='scripts/pm_goal_oracle_common.py:' + ','.join(map(str, lines)),
                checker_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                proof='Reached only inside the alternatives of ' + ', '.join(sorted(contexts)) + '. If another alternative '
                      'accepts, the union holds and this keyword refuses nothing; if the union fails, schema_guards reports '
                      'the union (oneOf composed rule for a non-type keyword; anyOf rule for type/minimum/minLength/required '
                      'alternatives) in place of the alternative keyword. The union row is separately proved.')


def dominance_proof(name,reports):
    """Verify the three nullable branch declarations' earlier union, not a sample mask."""
    import pm_goal_oracle_common as c
    location=c._SCHEMA_LOCATIONS.get(name,'')
    doc=c.load(ROOT/'Plans/event_record.schema.json')
    receipt=c.load(ROOT/'Plans/event_append_receipt_contracts.schema.json')
    selectors=[receipt['$id']+'/$defs/'+name+'/type' for name in ('custody_v1_reader','custody_v2')]
    if location in selectors:
        branches=receipt['$defs']['custody_reader']['oneOf']
        if {x.get('$ref') for x in branches}!={'#/$defs/custody_v1_reader','#/$defs/custody_v2'}:return None
        if any(receipt['$defs'][ref['$ref'].split('/')[-1]].get('type')!='object' for ref in branches):return None
        parent=c.guard_for_location(receipt['$id']+'/$defs/custody_reader/oneOf')
        if not any(r['guard']==parent and r['status']=='PASS' for r in reports):return None
        return dict(kind='earlier_owner_edition_union',earlier_guard=parent,
            owner='Plans/event_append_receipt_contracts.schema.json#/$defs/custody_reader',
            owner_sha256=hashlib.sha256((ROOT/'Plans/event_append_receipt_contracts.schema.json').read_bytes()).hexdigest(),
            checker='scripts/pm_goal_oracle_common.py:schema_guards',
            proof='Both supported editions require an object. On a non-object both branch types fail and schema_guards reports the complete oneOf before branch attribution. On an object both root type predicates hold. Therefore neither edition root type can refuse first; the earlier edition-union predicate is separately proved.')
    prefix=doc['$id']+'/'
    if not location.startswith(prefix) or '/anyOf/' not in location or not location.endswith('/type'):
        return None
    node_location=location.rsplit('/anyOf/',1)[0]
    pointer=node_location[len(doc['$id']):]
    node=doc
    for key in pointer.strip('/').split('/'):
        node=node[key.replace('~1','/').replace('~0','~')]
    if not isinstance(node.get('anyOf'),list) or len(node['anyOf'])!=2:
        return None
    def branch_type(branch):
        if '$ref' in branch:
            target=doc
            for key in branch['$ref'].removeprefix('#/').split('/'):
                target=target[key]
            return target.get('type')
        return branch.get('type')
    if {branch_type(x) for x in node['anyOf']} not in ({'integer','null'},{'string','null'}):
        return None
    parent=c.guard_for_location(node_location+'/anyOf')
    earlier=next((r for r in reports if r['guard']==parent),None)
    if earlier is None or earlier['status']!='PASS':return None
    source=ROOT/'scripts/pm_goal_oracle_common.py'
    line=next(i for i,x in enumerate(source.read_text().splitlines(),1) if 'if union_errors:' in x)
    return dict(kind='earlier_owner_union',earlier_guard=parent,
        owner='Plans/event_record.schema.json#'+pointer,owner_sha256=hashlib.sha256((ROOT/'Plans/event_record.schema.json').read_bytes()).hexdigest(),
        checker='scripts/pm_goal_oracle_common.py:'+str(line),
        proof='The branch declaration selects one nullable alternative. A valid other alternative accepts without a refusal. If the complete union fails, schema_guards returns the parent anyOf refusal before branch attribution. Thus this branch row can never refuse first; the parent row is separately proved.')


# --- judge self-test -----------------------------------------------------------
def exact_refusal(evaluate,value,expected):
    try:
        result=evaluate(copy.deepcopy(value))
        errors=set(result['errors'] if isinstance(result,dict) else result)
    except Exception as exc:
        return False,dict(exception=type(exc).__name__)
    return errors=={expected},dict(baseline=sorted(errors))


def judge_self_test():
    """Standing trials of the kill judge on real decisions (Gates rows)."""
    import pm_goal_oracle_common as common
    import pm_goal_shared_oracles as shared
    saved = (tables.ACTIVE, tables.DISCOVERY, tables.COLLECTOR)
    tables.ACTIVE, tables.DISCOVERY = True, True
    collector = Collector(judge=True)
    tables.COLLECTOR = collector
    rows = []
    try:
        family,base=next(shared.originals())
        missing=copy.deepcopy(base);missing['store']['sealed_receipts']=[]
        broken=copy.deepcopy(base);del broken['event']['event_id']
        def gate_pair(value):
            gate=common.Gates();gate.require('selftest/a', value['a']);gate.require('selftest/b', value['b']);return gate.errors
        def later(value):
            gate=common.Gates();gate.require('selftest/early', value['x']);gate.require('selftest/late', value['x']);return gate.errors
        flip={'n':0}
        def unstable(value):
            flip['n']+=1;gate=common.Gates();gate.require('selftest/unstable', value['x'] or flip['n']>1);return gate.errors
        def raising(value):
            gate=common.Gates();gate.require('selftest/raise', value['x'])
            if 'selftest/raise' in tables.CUT:raise KeyError('after cut')
            return gate.errors
        cases=[('expected_refusal_killed',shared.check_read,missing,'retained/original_receipt_missing','exact_expected','KILLED'),
               ('declared_other_refusal',shared.check_read,missing,'retained/original_receipt_seal','other_refusal',None),
               ('unexpected_exception',shared.check_read,broken,'retained/original_receipt_missing','exception',None),
               ('accepted_input',shared.check_read,base,'retained/original_receipt_missing','accepted',None),
               ('multiple_refusals',gate_pair,dict(a=False,b=False),'selftest/a','multiple_refusals',None),
               ('duplicate_set',later,dict(x=False),('selftest/early','selftest/late'),'exact_expected','DUPLICATE_SET_KILLED'),
               ('later_refusal_no_credit',later,dict(x=False),'selftest/early','multiple_refusals',None),
               ('restoration_failed',unstable,dict(x=False),'selftest/unstable','exact_expected','RESTORATION_FAILED'),
               ('cut_exception',raising,dict(x=False),'selftest/raise','exact_expected','CUT_EXCEPTION')]
        for name,evaluate,value,target,outcome,kill in cases:
            flip['n']=0
            collector.invoke('judge/'+name,evaluate,value,False,target=target,generated=True)
            record=collector.ledger[-1]
            rows.append(dict(case=name,expected_outcome=outcome,actual_outcome=record.get('outcome'),
                             expected_kill=kill,actual_kill=record.get('kill'),errors=record.get('errors'),cut=record.get('cut_errors')))
        # A single declared row whose cut leaves a later row refusing. A plain error
        # list exports no after-state, so the later refusal cannot be compared with
        # the intact trial: CANNOT_DECIDE (store-bound COVERED_LATER, CUT_LEFT_EFFECT
        # and CANNOT_DECIDE trials: scripts/pm_goal_dg5_covered_later_selftest.py).
        def chained(value):
            gate=common.Gates();gate.require('selftest/first', value['x'])
            if gate.errors:return gate.errors
            gate.require('selftest/second', value['x']);return gate.errors
        collector.invoke('judge/covered_later_single',chained,dict(x=False),False,target='selftest/first',generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='later_refusal_without_after_state',expected_outcome='exact_expected',
                         actual_outcome=record.get('outcome'),
                         expected_kill='CANNOT_DECIDE',actual_kill=record.get('kill'),cut=record.get('cut_errors')))
        # Exported refusal codes: a different-code later refusal at the row's own code is
        # KILLED_CODE; the same chain refusing with one shared code stays with the after-state rule.
        def coded(value, shared=False, origin=True):
            gate=common.Gates();gate.require('dg5/selftest/first/schema', value['x'])
            if not gate.errors:gate.require('dg5/selftest/second/schema', value['x'])
            errors=sorted(gate.errors)
            row=errors[0].split('/')[-2] if errors else None
            code=None if not errors else ('selftest/shared/schema/x' if shared else f'selftest/{row}/schema/x')
            # The recorded origin (addendum 11): the refusal's traceback passes through the
            # site where its row refused. Without it the own-guard condition fails closed.
            where=['scripts/selftest_owner.py', 10 if row == 'first' else 20]
            return dict(errors=errors,refusal_code=code,
                        refusal_origin=dict(site=where,frames=[where+['check',False,False]]) if origin else None,
                        refusing_sites=[(e,where) for e in errors],
                        store_after_sha256='0'*64,owner_state_sha256='1'*64,owner_state=dict(hook='selftest'))
        collector.invoke('judge/killed_code',coded,dict(x=False),False,target='dg5/selftest/first/schema',generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='killed_code',expected_outcome='exact_expected',actual_outcome=record.get('outcome'),
                         expected_kill='KILLED_CODE',actual_kill=record.get('kill'),cut=record.get('cut_errors')))
        collector.invoke('judge/killed_code_without_origin',lambda v:coded(v,origin=False),dict(x=False),False,
                         target='dg5/selftest/first/schema',generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='killed_code_without_origin',expected_outcome='exact_expected',
                         actual_outcome=record.get('outcome'),expected_kill='CANNOT_DECIDE',actual_kill=record.get('kill'),
                         cut=record.get('cut_errors')))
        collector.invoke('judge/same_code_not_killed_code',lambda v:coded(v,True),dict(x=False),False,
                         target='dg5/selftest/first/schema',generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='same_code_later_refusal',expected_outcome='exact_expected',actual_outcome=record.get('outcome'),
                         expected_kill='COVERED_LATER',actual_kill=record.get('kill'),cut=record.get('cut_errors')))
        # The same chain with an exported, unchanged after-state is COVERED_LATER.
        def chained_state(value, codes=True):
            errors=chained(value)
            return dict(errors=errors,store_after_sha256='0'*64,owner_state_sha256='1'*64,
                        refusal_code='selftest/same' if codes and errors else None,owner_state=dict(hook='selftest'))
        # No refusal codes exported: equal after-states, but not a same-code refusal (review (b)).
        collector.invoke('judge/no_codes_not_cover',lambda v:chained_state(v,False),dict(x=False),False,
                         target='selftest/first',generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='later_refusal_without_codes',expected_outcome='exact_expected',
                         actual_outcome=record.get('outcome'),expected_kill='CANNOT_DECIDE',actual_kill=record.get('kill'),
                         cut=record.get('cut_errors')))
        collector.invoke('judge/covered_later_single_state',chained_state,dict(x=False),False,target='selftest/first',
                         generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='covered_later_single',expected_outcome='exact_expected',actual_outcome=record.get('outcome'),
                         expected_kill='COVERED_LATER',actual_kill=record.get('kill'),cut=record.get('cut_errors')))
        # A duplicate set whose second site sits behind a structural stop.
        collector.invoke('judge/duplicate_set_shadowed_site',chained,dict(x=False),False,
                         target=('selftest/first','selftest/second'),generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='duplicate_set_shadowed_site',expected_outcome='exact_expected',actual_outcome=record.get('outcome'),
                         expected_kill='DUPLICATE_SET_KILLED',actual_kill=record.get('kill'),cut=record.get('site_cuts')))
        # An over-broad set: a declared site that never refuses on its own.
        def chained_plus(value):
            gate=common.Gates();gate.require('selftest/first', value['x']);gate.require('selftest/never', True)
            if gate.errors:return gate.errors
            gate.require('selftest/second', value['x']);return gate.errors
        collector.invoke('judge/over_broad_set',chained_plus,dict(x=False),False,
                         target=('selftest/first','selftest/never','selftest/second'),generated=True)
        record=collector.ledger[-1]
        rows.append(dict(case='over_broad_set',expected_outcome='exact_expected',actual_outcome=record.get('outcome'),
                         expected_kill='DUPLICATE_SET_SITE_FAILED',actual_kill=record.get('kill'),cut=record.get('site_cuts')))
    finally:
        tables.ACTIVE, tables.DISCOVERY, tables.COLLECTOR = saved
    ok=all(r['expected_outcome']==r['actual_outcome'] and r['expected_kill']==r['actual_kill'] for r in rows)
    patterns=common.pattern_self_test()
    audit=common.audit_scope_self_test()
    ok=ok and patterns['status']=='pass' and audit['status']=='pass'
    return dict(status='pass' if ok else 'fail',cases=rows,ecma_patterns=patterns,removal_audit_and_union_attribution=audit)


# --- ledger outputs ------------------------------------------------------------
def ledger_summary(collector, rows):
    """Per-row kill ledger; credit only KILLED / DUPLICATE_SET_KILLED / KILLED_CODE replays (by class)."""
    per = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
    kills = collections.defaultdict(lambda: collections.defaultdict(list))
    for record in collector.ledger:
        target = record.get('target')
        if target is None or record.get('valid') is True:
            continue
        targets = [target] if isinstance(target, str) else list(target)
        for name in targets:
            per[name][record['family']][record.get('outcome')] += 1
            if record.get('kill'):
                per[name][record['family']]['kill:' + record['kill']] += 1
            if record.get('kill') in KILL_CLASSES:
                kills[name][record['family']].append(dict(label=record['label'], input_sha256=record['input_sha256'],
                    kill=record['kill'], set=None if isinstance(target, str) else sorted(target)))
    out = []
    for row in rows:
        name = row['guard']
        out.append(dict(guard=name, table=row['table'], gated=row['status'], proof=row.get('proof'),
            families={fam: dict(counts) for fam, counts in per.get(name, {}).items()},
            killed_families=sorted(fam for fam in kills.get(name, {})),
            kill_witnesses={fam: items[:3] for fam, items in kills.get(name, {}).items()},
            killed=bool(kills.get(name))))
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--generate', action='store_true')
    parser.add_argument('--replace-generated',action='store_true',help='Replace only this runner’s generated inventory with all supplied sources; otherwise preserve other source tables')
    parser.add_argument('--judge-self-test',action='store_true')
    parser.add_argument('--prove-generated',action='store_true',help='After generation, prove the generated tables in a fresh child process')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--source', action='append')
    parser.add_argument('--table', action='append')
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--no-fuzz',action='store_true',help='Skip optional exploratory mutation search (undeclared; never credit)')
    parser.add_argument('--no-keyword-witnesses',action='store_true',help='Skip the declared schema keyword generator')
    args = parser.parse_args()
    global OUTPUT
    OUTPUT=args.out
    args.out.mkdir(parents=True,exist_ok=True)
    if args.judge_self_test:
        result=judge_self_test()
        (args.out/'judge-self-test.json').write_text(json.dumps(result,indent=1,default=str)+'\n')
        print(json.dumps(result,default=str));return int(result['status']!='pass')
    source_paths=sorted((ROOT/'scripts').glob('pm_goal*.py'))+[ROOT/'scripts'/name for name in
        ('pm_guard_isolation.py','pm_event_numbers.py','pm_event_datetime.py','pm_event_numbers_corpus.py')]
    code_bindings={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest()for p in source_paths}
    all_code_bindings=code_bindings.copy()
    sources = args.source or ['pm_goal_history_reader_fixtures', 'pm_goal_own_d_oracles',
                             'pm_goal_own_d_supplement','pm_goal_complete_oracles','pm_goal_shared_oracles']
    tables.DISCOVERY = bool(args.generate or args.collect_only)
    started = time.time()
    collector = collect(sources, fuzz=not args.no_fuzz, judge=not args.generate,
                        keyword_witnesses=not args.no_keyword_witnesses)
    import pm_goal_oracle_common as common
    (args.out/'schema-inventory.json').write_text(json.dumps(dict(types=common._SCHEMA_TYPES,inactive=common._SCHEMA_INACTIVE_TYPES,
        duplicates={k:sorted(v) for k,v in common._SCHEMA_DUPLICATES.items()},locations=common._SCHEMA_LOCATIONS,
        assertions=common._SCHEMA_ASSERTION_INFO),indent=1,default=str)+'\n')
    summary = dict(calls=collector.calls, guards=len(collector.rows), failures=collector.failures,
        store_snapshots=collector.store_snapshots, generator_stats=collector.generator_stats,
        replay_unknown_rows=sorted(collector.replay_unknown_rows),
        signatures=len(collector.signature_list), seconds=round(time.time()-started,1),
        rows={name: {**{k:v for k,v in slot.items() if k!='sites'}, 'sites': sorted(slot['sites'])} for name, slot in collector.rows.items()},
        native_execution='NOT_RUN')
    (args.out / 'collection.json').write_text(json.dumps(summary, indent=1, default=str)+'\n')
    with gzip.open(args.out/'ledger.json.gz','wt') as handle:
        json.dump(collector.ledger, handle, default=list)
    # Observation signatures (ledger `sig` indexes this list) and, per family,
    # every row its complete calls evaluated: the coverage matrix's row set.
    with gzip.open(args.out/'signatures.json.gz','wt') as handle:
        json.dump([sorted(names) for names in collector.signature_list], handle)
    family_rows = collections.defaultdict(set)
    for record in collector.ledger:
        if record.get('sig') is not None:
            family_rows[record['family']].update(collector.signature_list[record['sig']])
    (args.out/'family-rows.json').write_text(json.dumps({f: sorted(v) for f, v in family_rows.items()}, indent=1)+'\n')
    if args.generate:
        generate(collector, replace=args.replace_generated)
        if args.prove_generated:
            child=[sys.executable,'-B',__file__,'--out',str(args.out/'proof')]+[x for s in sources for x in ('--source',s)]
            if args.no_fuzz:child.append('--no-fuzz')
            if args.no_keyword_witnesses:child.append('--no-keyword-witnesses')
            return subprocess.call(child)
        return int(bool(collector.failures))
    used_scripts={str(Path(module.__file__).resolve().relative_to(ROOT))for module in tuple(sys.modules.values())
        if getattr(module,'__file__',None)and Path(module.__file__).resolve().is_relative_to(ROOT)
        and Path(module.__file__).name.startswith('pm_goal')and Path(module.__file__).suffix=='.py'}
    code_bindings={path:sha for path,sha in code_bindings.items()if path in used_scripts or not Path(path).name.startswith('pm_goal')}
    for name in ('pm_goal_guard_rows.json','pm_goal_guard_witnesses.json'):
        path=ROOT/'scripts'/name
        if path.exists():code_bindings[str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
    failed = bool(collector.failures)
    if not args.collect_only:
        for name in collector.rows:
            spec=tables.rows()[name];path=ROOT/'scripts'/(tables.module_name(spec)+'.py')
            code_bindings[str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
        reports, rows = prove(collector, args.out / 'tables', args.table)
        probe = fabricated_row_self_test(collector, args.out / 'tables', reports)
        (args.out/'fabricated-row-self-test.json').write_text(json.dumps(probe,indent=1,default=str)+'\n')
        mutation = ledger_summary(collector, rows)
        (args.out / 'mutations.json').write_text(json.dumps(mutation, indent=1, default=str)+'\n')
        invalid = [r for r in collector.ledger if r.get('target') is not None and r.get('valid') is not True
                   and r.get('outcome') != 'exact_expected']
        with gzip.open(args.out/'invalid-mutations.json.gz','wt') as handle:
            json.dump(invalid, handle, default=list)
        outcomes = collections.Counter(r.get('outcome') for r in collector.ledger)
        kills = collections.Counter(r.get('kill') for r in collector.ledger if r.get('kill'))
        print(json.dumps(dict(calls=collector.calls, guards=len(collector.rows), tables=len(reports),
            proved=sum(len(r['proved']) for r in reports), unproved_with_proof=sum(1 for r in rows if r['status']!='PASS' and r.get('proof')),
            outcomes=outcomes, kills=kills, fabricated_probe=probe['status'], failures=len(collector.failures))))
        failed = failed or probe['status'] != 'pass'
    for module in tuple(sys.modules.values()):
        filename=getattr(module,'__file__',None)
        if not filename:continue
        path=Path(filename).resolve()
        if path.is_relative_to(ROOT)and path.name.startswith('pm_goal')and path.suffix=='.py':
            relative=str(path.relative_to(ROOT))
            if relative not in code_bindings:
                if relative not in all_code_bindings:raise ValueError('unbound late source: '+relative)
                code_bindings[relative]=all_code_bindings[relative]
    source_bindings={**code_bindings,**common.SOURCE_BINDINGS}
    drift=[path for path,sha in source_bindings.items()if not (ROOT/path).exists()or hashlib.sha256((ROOT/path).read_bytes()).hexdigest()!=sha]
    (args.out/'source-bindings.json').write_text(json.dumps(dict(files=source_bindings,changed_during_run=drift),indent=1,sort_keys=True)+'\n')
    if drift:print('Source changed during run: '+', '.join(drift),file=sys.stderr)
    return int(failed or bool(drift))


if __name__ == '__main__':
    sys.exit(main())
