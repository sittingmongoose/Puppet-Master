"""DS15 guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase table under test.
Every witness of both DS15 checkers runs once under the checker's observation recorder:

- the sixteen-family semantic cases and their operation-specific parents, predicate cases,
  guard-proof witnesses, value and migration cases, payload negatives, unresolved-reference
  schema cases and the numeric cases (typed and raw-wire) of pm-ds15-event-contracts.py;
- the deck-2 cases and their bases, policy cases and schema cases of pm-ds15-deck2-contracts.py;
- the shared NUMRULE number-corpus routes of pm-ds15-number-corpus.py;
- the sweep part 2A witnesses of Plans/ds15_p2a_cases.json.

An accepted (or passing) phase evaluation is a control of its table. A refused invocation gives
the observation of the phase holding its FIRST refusal as a negative, targeted at the refusing
row. Untracked results are reported, never relabelled. Nothing here repairs, caches or decides a
checker result; the lane matrix checks every distinct negative against every row of its table.
"""
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402

_spec = importlib.util.spec_from_file_location('ds15_corpus_routes', ROOT / 'scripts/pm-ds15-number-corpus.py')
corpus = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(corpus)
m16 = corpus.base            # the sixteen-family model (unpatched)
deck = corpus.deck2          # the deck-2 checker, with its own patched copy of the model
MODELS = (m16, deck.base)
TABLE_PREFIX = m16.TABLE_PREFIX
RETURN_SOURCE = 'return g.Case(table, check, context)'
P2A_CASES = ROOT / 'Plans/ds15_p2a_cases.json'


# Witnesses kept refused in the full checker but not used as table-row proof: two rows of one
# table refuse them by construction. Single-row witnesses prove each row of every set.
EXCLUDED = [
    ('d2_env_d', r'deck2/[^/]+/application-source-server-forgery',
     'two copies by construction: the forgery changes both the application source and the original operation copy '
     'against the owner record (ER09 and ER10); deck2/*/application source single-copy witnesses and '
     'p2a/ER10-original-application-source prove each row alone'),
    ('env_app_install_b', r'sem/catalog\.install\.[a-z]+/r7-application-install-source-566',
     'two authorities by construction: the source operation is compared with the original operation copy (EA06) and '
     'with the payload operation_id (EA07); the r7 install-source copy witnesses prove each row alone'),
    ('env_scope', r'pred/[^/]+/isolated-envelope_ok-13[56]-15|guard/r7-proof/complete-duplicates/scope-(kind|project-id)',
     'two authorities by construction: a changed context scope is compared with the envelope (EN05/EN06) and with the '
     'payload scope (EN08); envelope-only and payload-only witnesses prove each row alone'),
    ('rc_copies', r'sem/[^/]+/receipt-field-(event_id|sequence_id)|pred/[^/]+/isolated-receipt_ok-172-12',
     'two authorities by construction: one receipt copy changed is compared with the custody copy (RC01) and with the '
     'original event (RC03/RC04) or the issued result copy (RC02); coherent three-copy witnesses and '
     'p2a/RC02-result-receipt-copy prove each row alone'),
    ('replay_only', r'deck2/[^/]+/writer-replay-only-(recover|publish)',
     'two records by construction: the retained original and its candidate copy both carry projector_replay_only '
     '(RO01 and RO02); the one-record witnesses prove each row alone'),
    ('tk_storage', r'sem/[^/]+/(token-storage-disagrees-with-event|checkpoint-foreign-root-key-and-ref|'
     r'rebuild-foreign-root-key-and-ref|prior-checkpoint-foreign-root)',
     'one foreign token by construction: a token of another Storage instance carries that instance in its storage id, '
     'selection, key and reference (TK01-TK04), or in both its key and reference (TK03, TK04); the '
     'checkpoint-foreign-root-key and -ref and the single-field token witnesses prove each row alone'),
    ('tr_browser_a', r'sem/browser\.context_captured/(invalid-transition|publish-current-source-join-refused|'
     r'append-recovery-current-source-join-refused|history-after-live-state-advances-invalid-original-transition)|'
     r'guard/browser\.context_captured/paired-invalid-capture-resolution',
     'two authorities by construction: an unknown context target resolution is outside the allowed set (TB01, an entailed '
     'row) and differs from the payload target (TB02); the payload-target witnesses prove TB02 alone'),
    ('vv_dap', r'guard/Plans/ds15_dev_session_record_v2\.schema\.json/paired-value-root-project',
     'two copies by construction: the value root project is compared with the DAP project (VV03) and the DAP topology '
     'project (VV05); the DAP-only witnesses prove each row alone'),
]


def excluded(phase, witness):
    import re
    for table, pattern, reason in EXCLUDED:
        if table == phase and re.fullmatch(pattern, witness):
            return reason
    return None


def key(value):
    with m16.exact_integer_text():
        return hashlib.sha256(json.dumps(value, sort_keys=True, default=repr).encode()).hexdigest()


def table_rows(phase):
    return m16.table_rows(phase)


def run_recorded(call):
    """(result, records) for one model call; records are (phase, observation, refusal)."""
    records = []
    for model in MODELS:
        model.RECORDER = records
    try:
        result = call()
    except Exception as exc:  # an exception is a result, compared and reported, never a refusal
        result = ('exception', type(exc).__name__)
    finally:
        for model in MODELS:
            model.RECORDER = None
    return result, records


def refused_result(kind, result):
    """Whether a witness call refused, by the boundary's own result contract."""
    if isinstance(result, tuple) and result[:1] == ('exception',):
        return None
    if kind in ('schema', 'deck2schema'):
        return None  # the boundary raises Unresolvable; the refusal is the SR01 record
    if kind == 'payloadneg':
        return result is True
    if kind == 'numeric':
        return result is False
    if kind == 'policy' or isinstance(result, str):
        return result == 'REFUSE'
    return not m16.proof_success(result)


def witness_calls():
    """(id, family, kind, pair id or None, call) for every witness, inputs built before recording."""
    out = []
    contracts = {c['event_type']: c for c in m16.read('Plans/ds15_event_contracts.json')}
    for f in m16.read('Plans/ds15_event_contract_fixtures.json'):
        c, name = contracts[f['event_type']], f['event_type']
        for case in f['semantic_cases']:
            data = m16.semantic_input(c, f, case)
            pair = None
            if case.get('single_defect'):
                parent = m16.semantic_parent(c, f, case)
                pair = f'semparent/{name}/{case["id"]}'
                out.append((pair, name, 'semparent', None,
                            lambda c=c, op=case['operation'], d=parent: m16.evaluate(c, op, copy.deepcopy(d))))
            out.append((f'sem/{name}/{case["id"]}', name, 'sem', pair,
                        lambda c=c, op=case['operation'], d=data: m16.evaluate(c, op, copy.deepcopy(d))))
        for case in f.get('predicate_cases', []):
            parent = copy.deepcopy(f['semantic_base'])
            data = copy.deepcopy(parent)
            m16.patch(data, case['changes'])
            pair = f'predparent/{name}/{case["id"]}'
            out.append((pair, name, 'predparent', None,
                        lambda c=c, t=case['target'], d=parent: m16.predicate_ok(c, t, copy.deepcopy(d))))
            out.append((f'pred/{name}/{case["id"]}', name, 'pred', pair,
                        lambda c=c, t=case['target'], d=data: m16.predicate_ok(c, t, copy.deepcopy(d))))
        for case in f['schema_cases']:
            schema = copy.deepcopy(m16.read(c[case['schema']]))
            m16.patch(schema, case['changes'])
            out.append((f'schema/{name}/{case["id"]}', name, 'schema', None, lambda s=schema: m16.validator(s)))
        v = m16.validator(m16.read(c['payload_schema_ref']))
        for i, case in enumerate(f['negative']):
            bad = copy.deepcopy(f['positive'])
            if case['mutation'] == 'missing_field':
                bad.pop(case['field'])
            else:
                bad[case['field']] = case['value']
            out.append((f'payloadneg/{name}/{i}', name, 'payloadneg', None,
                        lambda v=v, b=bad: m16.schema_refused('sch_payload', v, copy.deepcopy(b))))
    for proof in m16.read('Plans/ds15_guard_proof_fixtures.json'):
        name = proof.get('event_type') or 'shared'
        parent, data = m16.guard_proof_input(proof, False), m16.guard_proof_input(proof)
        pair = f'guardparent/{proof["id"]}'
        out.append((pair, name, 'guardparent', None, lambda p=proof, d=parent: m16.guard_proof_result(p, copy.deepcopy(d))))
        out.append((f'guard/{proof["id"]}', name, 'guard', pair,
                    lambda p=proof, d=data: m16.guard_proof_result(p, copy.deepcopy(d))))
    for f in m16.read('Plans/ds15_value_contract_fixtures.json'):
        for case in f['cases']:
            data = copy.deepcopy(f['positive'])
            m16.patch(data, case['changes'])
            out.append((f'value/{f["schema_ref"]}/{case["id"]}', 'shared', 'value', None,
                        lambda r=f['schema_ref'], d=data: m16.value_valid(r, copy.deepcopy(d))))
        for case in f.get('migration_cases', []):
            data = copy.deepcopy(f['migration_base'])
            m16.patch(data, case['changes'])
            out.append((f'migration/{f["schema_ref"]}/{case["id"]}', 'shared', 'migration', None,
                        lambda d=data: m16.migrate(d['kind'], copy.deepcopy(d['source']), copy.deepcopy(d['evidence']))))
    for case in m16.read('Plans/ds15_numeric_contract_fixtures.json'):
        _, parent = m16.numeric_input(case, False)
        out.append((f'numericparent/{case["id"]}', case['event_type'], 'numericparent', None,
                    lambda z=case, d=parent: m16.numeric_operation(z, copy.deepcopy(d))))
        encoded = m16.numeric_wire(case)
        out.append((f'numeric/wire/{case["id"]}', case['event_type'], 'numeric', f'numericparent/{case["id"]}',
                    lambda z=case, e=encoded: _numeric_wire(z, e)))
        if case['token'] not in m16.RAW_ONLY_TOKENS:
            _, data = m16.numeric_input(case)
            out.append((f'numeric/typed/{case["id"]}', case['event_type'], 'numeric', f'numericparent/{case["id"]}',
                        lambda z=case, d=data: m16.proof_success(m16.numeric_operation(z, copy.deepcopy(d)))))
    deck_contracts = {c['event_type']: c for c in deck.read('Plans/ds15_deck2_contracts.json')}
    for d in deck.read('Plans/ds15_deck2_fixtures.json'):
        c, name = deck_contracts[d['event_type']], d['event_type']
        for case in d['cases']:
            parent = copy.deepcopy(d['bases'][case['base']])
            data = copy.deepcopy(parent)
            deck.base.patch(data, case['changes'])
            deck.base.patch(data, case.get('derived_observations', {}))
            pair = f'deck2parent/{name}/{case["id"]}'
            out.append((pair, name, 'deck2parent', None, lambda c=c, op=case['operation'], x=parent: deck.evaluate(c, op, copy.deepcopy(x))))
            out.append((f'deck2/{name}/{case["id"]}', name, 'deck2', pair,
                        lambda c=c, op=case['operation'], x=data: deck.evaluate(c, op, copy.deepcopy(x))))
        for case in d.get('policy_cases', []):
            out.append((f'policy/{name}/{case["id"]}', name, 'policy', None,
                        lambda c=c, z=case: _policy(c, z)))
        for case in d.get('schema_cases', []):
            schema = copy.deepcopy(deck.read(c[case['schema']]))
            deck.base.patch(schema, case['changes'])
            out.append((f'deck2schema/{name}/{case["id"]}', name, 'deck2schema', None, lambda s=schema: deck.base.validator(s)))
    families = {c['event_type']: (c, True) for c in m16.read('Plans/ds15_event_contracts.json')}
    families.update({c['event_type']: (c, False) for c in deck.read('Plans/ds15_deck2_contracts.json')})
    values = corpus.corpus_values()
    for name in sorted(families):
        contract, sixteen = families[name]
        for route, data, path, run, want in corpus.routes(name, contract, sixteen):
            pair = f'corpusparent/{name}/{route}'
            out.append((pair, name, 'corpusparent', None, lambda r=run, x=data: r(copy.deepcopy(x))))
            for spelling in sorted(values):
                out.append((f'corpus/{name}/{route}/{len(out)}', name, 'corpus', pair,
                            lambda r=run, x=data, p=path, s=spelling: _corpus_run(r, x, p, s)))
    if P2A_CASES.exists():
        import pm_ds15_p2a_cases as p2a
        out.extend(p2a.witness_calls(m16, deck))
    return out


def _numeric_wire(case, encoded):
    ok, decoded = m16.parse_operation_json(encoded)
    return m16.proof_success(m16.numeric_operation(case, decoded)) if ok else False


def _corpus_run(run, data, path, spelling):
    """The corpus route on the value spelled exactly, through the checker's raw ingress (RI01)."""
    ok, candidate = corpus.with_spelling(data, path, spelling)
    return run(candidate) if ok else False


def _policy(c, case):
    return deck.catalog_request(c, copy.deepcopy(case['payload']), copy.deepcopy(case['transition']))


def complete_boundary_flip(call, phase, row):
    """Re-run the whole witness with only its refusing row swapped to always-pass.

    'accepted' means the complete boundary then accepts it; otherwise the next refusing
    (phase, row) is reported: a later row that independently watches the same source fact.
    Lane evidence about the complete checker path only; the tool's credit is per table.
    """
    saved = [model.table_rows(phase) for model in MODELS]
    for model, entries in zip(MODELS, saved):
        model._TABLE_ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
    try:
        result, records = run_recorded(call)
    finally:
        for model, entries in zip(MODELS, saved):
            model._TABLE_ROWS[phase] = entries
    refusals = [r for r in records if r[2] is not None]
    if not refusals:
        return 'accepted' if not (isinstance(result, tuple) and result[:1] == ('exception',)) else 'exception'
    return 'refused_later:' + refusals[0][0] + ':' + refusals[0][2][0]


def collect(flips=False, progress=None):
    """Replay every witness once; return per-phase controls/negatives and findings."""
    calls = witness_calls()
    for model in MODELS:
        model.cached_validator.cache_clear()  # every schema occurrence compiles (SR01 control) under the recorder
    suites, findings, counts = {}, [], {'witnesses': len(calls), 'refused': 0, 'accepted': 0}
    first_records = {}
    for index, (wid, family, kind_name, pair, call) in enumerate(calls):
        if progress and index % 2000 == 0:
            progress(index)
        result, records = run_recorded(call)
        refused = [r for r in records if r[2] is not None]
        verdict = refused_result(kind_name, result)
        if isinstance(result, tuple) and result[:1] == ('exception',) and kind_name not in ('schema', 'deck2schema'):
            findings.append(dict(kind='exception', witness=wid, error=result[1]))
        if verdict is True and not refused:
            findings.append(dict(kind='untracked_refusal', witness=wid, result=repr(result)[:200]))
        if verdict is False and refused and kind_name not in ('numeric',):
            # An accepted boundary result with a recorded refusal: a refusal absorbed by plumbing.
            findings.append(dict(kind='absorbed_refusal', witness=wid, phase=refused[0][0], row=refused[0][2][0]))
        for phase, observed, refusal in records:
            slot = suites.setdefault(phase, dict(controls={}, negatives={}))
            if refusal is None:
                k = key(observed)
                if k not in slot['controls']:
                    slot['controls'][k] = dict(id=f'control/{phase}/{len(slot["controls"])}', value=observed,
                                               witness=wid, family=family, accepted=not refused)
                first_records.setdefault((wid, phase), slot['controls'][k]['id'])
        if refused:
            counts['refused'] += 1
            phase, observed, (row, code) = refused[0]
            reason = excluded(phase, wid)
            if reason:
                findings.append(dict(kind='excluded_from_table_proof', witness=wid, phase=phase, row=row, reason=reason))
                continue
            slot = suites.setdefault(phase, dict(controls={}, negatives={}))
            k = key([row, observed])
            control = first_records.get((pair, phase)) if pair else None
            if k not in slot['negatives']:
                slot['negatives'][k] = dict(id=f'negative/{phase}/{len(slot["negatives"])}', value=observed, target=row,
                                            code=code, control=control, witness=wid, family=family, kind=kind_name,
                                            aliases=[], families=[family], flips=[])
            else:
                entry = slot['negatives'][k]
                entry['aliases'].append(wid)
                if family not in entry['families']:
                    entry['families'].append(family)
                if entry['control'] is None and control is not None:
                    entry['control'] = control
            if flips:
                slot['negatives'][k]['flips'].append(complete_boundary_flip(call, phase, row))
        else:
            counts['accepted'] += 1
    return suites, findings, counts


def lane_matrix(phase, controls, negatives):
    """Direct check of every row on every case (the tool repeats it under certification)."""
    rows = table_rows(phase)
    problems = []
    for c in controls:
        failing = [n for n, p, ctx in rows if p(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = [name for name, p, ctx in rows if p(n['value'], ctx) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing,
                                 witness=n['witness'], aliases=n['aliases'][:5]))
    return problems


def select(items, limit, group):
    """Round-robin over groups (families, then witness kinds) so a capped run keeps variety."""
    buckets = {}
    for item in items:
        buckets.setdefault(group(item), []).append(item)
    out, order = [], sorted(buckets)
    while len(out) < limit and any(buckets.values()):
        for name in order:
            if buckets[name] and len(out) < limit:
                out.append(buckets[name].pop(0))
    return out


def tool_cases(slot, negative_limit, control_limit):
    controls = list(slot['controls'].values())
    preferred = [c for c in controls if c['accepted']] or controls
    chosen_controls = select(preferred, control_limit, lambda c: c['family'])
    negatives = []
    for row in sorted({n['target'] for n in slot['negatives'].values()}):
        own = [n for n in slot['negatives'].values() if n['target'] == row]
        negatives += select(own, negative_limit, lambda n: (n['family'], n['kind']))
    by_id = {c['id']: c for c in controls}
    ids = {c['id'] for c in chosen_controls}
    for n in negatives:
        if n['control'] in by_id and n['control'] not in ids:
            chosen_controls.append(by_id[n['control']])
            ids.add(n['control'])
    return chosen_controls, negatives


def suite_for(phase, slot, negative_limit=10, control_limit=10):
    module = TABLE_PREFIX + phase
    controls, negatives = tool_cases(slot, negative_limit, control_limit)
    if not controls or not negatives:
        return None
    first = controls[0]['id']
    ids = {c['id'] for c in controls}
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'],
                     n['control'] if n['control'] in ids else first, f"{n['kind']} witness {n['witness']} ({n['family']})")
          for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'DS15 {phase}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
