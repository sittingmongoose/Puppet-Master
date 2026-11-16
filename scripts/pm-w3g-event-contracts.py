#!/usr/bin/env python3
"""Run the complete W3G checker over every positive and single-defect negative (ATS-1260..1263, phase 2).

Usage: python3 scripts/pm-w3g-event-contracts.py [--json out.json] [--skip-numbers]

Each case names its boundary and expectation; a negative passes only when its FIRST refusal is the target row
(an acceptance, another row or an exception fails it), and a refusal leaves its input unchanged (zero new
effects). Also checks: the generated tables are current; the eager offline schema-reference closure (check 9)
and owner-pin drift; unique observation fields; the timestamp-field inventory; that every (family, row) pair has
a first-refusal witness unless the row is entailed (written proof, own table) or not applicable to that family;
that every schema site of Plans/event_authority_w3g/oracle_plan.json maps to a row or to a written implication;
the 19 retention cells against the decisions on main; and the shared NUMRULE corpus through the complete routes
(scripts/pm_w3g_numbers.py). Exit 0 only when everything agrees.
"""
import argparse
import collections
import json
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_w3g_events as m  # noqa: E402
import pm_w3g_cases as c  # noqa: E402

MAIN_PIN = 'f8b20986082fe7b11ca5c22770ec042ee34e3327'   # origin/main carrying DL-453..DL-464 and DL-500..DL-509


def run_cases():
    failures, witness, per_family = [], {}, {}
    cases = c.all_cases()
    for x in cases:
        try:
            got, _w = c.run(x)
        except Exception as exc:  # an exception is never a refusal
            failures.append(dict(case=x['id'], expected=x['expect'], got=('exception', type(exc).__name__, str(exc)[:200])))
            continue
        exp = x['expect']
        ok = (got is None) if exp is None else (got is not None and tuple(got) == tuple(exp))
        if not ok:
            failures.append(dict(case=x['id'], expected=exp, got=got))
            continue
        kind = 'positives' if exp is None else 'negatives'
        per_family.setdefault(x['family'], dict(positives=0, negatives=0))[kind] += 1
        if exp is not None and x['id'].startswith('neg/'):
            witness.setdefault((x['family'], exp[1]), []).append(x['id'])
    return cases, failures, witness, per_family


def coverage(witness):
    phases = m.all_phases()
    entailed = m.entailed_proofs()
    missing, na, ent = [], [], []
    for f in m.FAMILIES:
        slug = m.FAM[f]['slug']
        for phase, (_t, _a, rows) in phases.items():
            if phase not in m.ROWS and slug not in phase:
                continue
            for r in rows:
                if r[0] in entailed or f'{f}:{r[0]}' in entailed:
                    ent.append((f, r[0]))
                elif (f, r[0]) in c.NOT_APPLICABLE:
                    na.append((f, r[0], c.NOT_APPLICABLE[(f, r[0])]))
                elif (f, r[0]) not in witness:
                    missing.append((f, phase, r[0]))
    return missing, na, ent


IMPLIED = {
    'root_type': ('PF01_form_exclusive', 'the stored payload is an inline object body or a payload:v1 reference (PF01), and a '
                  'decoded pack body must be an object (PF07); no non-object payload reaches the selector'),
    'minLength_ref': ('pattern', 'the ref pattern ^[^\\u0000-\\u001f\\u007f]+(?![\\s\\S]) requires at least one character, so '
                      'every string the minLength 1 site refuses (the empty string) the pattern row refuses first'),
    'minLength_hex': ('pattern', 'the pattern ^[0-9a-f]{64}$ requires 64 hex characters before the end, so every string '
                      'shorter than 64 (the minLength 64 site) the pattern row refuses first'),
    'type_enum': ('enum', 'every value of the string enum is a string, so every non-string the type site refuses the enum row refuses '
                  'too; the type site has no single-defect witness and is not a separate row'),
    'anyOf_null': ('anyOf_type', 'the null branch type site is one alternative of the anyOf type union row (string or '
                   'integer, or null); jsonschema refuses only when every branch refuses'),
}


def schema_site_map():
    """Every schema predicate site of the phase-1 plan -> its row, or an implication with a written reason."""
    plan = json.loads((ROOT / 'Plans/event_authority_w3g/oracle_plan.json').read_text())
    out, unmapped = [], []
    for fam in plan['families']:
        f = fam['event_type']
        rows = {r[1]: r[0] for r in m.py_rows(f)}
        for site in fam['schema_predicate_inventory']:
            pred = site['predicate']
            mt = re.fullmatch(r'#/\$defs/(\w+)/(.*)', pred)
            rest = mt.group(2)
            target = None
            if rest == 'type':
                target = ('implied', 'root_type')
            elif rest == 'additionalProperties':
                target = rows.get('closed')
            elif rest.startswith('required/'):
                target = rows.get('required.' + rest.split('/', 1)[1])
            elif rest.startswith('properties/'):
                parts = rest.split('/')
                k = parts[1]
                tail = '/'.join(parts[2:])
                prop = m.SCHEMAS[f]['$defs'][mt.group(1)]['properties'][k]
                if tail == 'minLength':
                    target = ('implied', 'minLength_hex' if prop.get('minLength') == 64 else 'minLength_ref')
                elif tail == 'type' and f'type.{k}' not in rows and 'enum' in prop:
                    target = ('implied', 'type_enum')
                elif tail in ('type', 'const', 'maxLength', 'pattern', 'minimum', 'enum', 'minItems', 'uniqueItems'):
                    target = rows.get(f'{tail}.{k}')
                elif tail == 'anyOf/0/type':
                    target = rows.get(f'anyOf_type.{k}')
                elif tail == 'anyOf/1/type':
                    target = ('implied', 'anyOf_null')
                elif tail == 'anyOf/0/minLength':
                    target = ('implied', 'minLength_ref')
                elif tail in ('anyOf/0/pattern', 'anyOf/0/minimum'):
                    target = rows.get(f'anyOf_{tail.rsplit("/", 1)[1]}.{k}')
                elif tail == 'allOf/1/properties/scope_kind/const':
                    target = rows.get(f'scope_kind_const.{k}')
                elif tail == 'items/type':
                    target = rows.get(f'items_type.{k}')
                elif tail == 'items/pattern':
                    target = rows.get(f'items_pattern.{k}')
                elif tail == 'items/minLength':
                    target = ('implied', 'minLength_ref')
            if target is None:
                unmapped.append((f, pred))
            out.append(dict(family=f, site=pred, row=target if type(target) is str else None,
                            implied=target[1] if type(target) is tuple else None))
    return out, unmapped


# Phase-1 plan guard suffix -> the common row observation field that implements it (family guards map by suffix to
# pm_w3g_spec.DOMAIN rows; closed_schema maps to the per-keyword py_<family> rows; timestamp_profile and numeric_recipe
# are split into the TM and NM rows, listed by their first row).
PLAN_COMMON = {
    'membership': 'membership', 'membership_selector': 'membership_selector', 'retention': 'retention', 'withdrawal': 'withdrawal',
    'reference_closure': 'reference_closure', 'exact_types': 'exact_types', 'identifier_fullmatch': 'identifier_fullmatch',
    'identifier_spelling': 'identifier_spelling', 'source_custody': 'source_custody', 'source_custody_receipt_issued': 'source_receipt_issued',
    'source_digest': 'source_digest', 'scope': 'req_scope_kind', 'scope_scope_partition': 'req_scope_partition',
    'scope_project_id': 'req_project_id', 'scope_server_id': 'req_server_id', 'scope_computer_id': 'req_computer_id',
    'subject': 'req_subject_id', 'subject_thread_id': 'req_thread_id', 'subject_run_id': 'req_run_id',
    'writer_currentness': 'writer_currentness', 'identity_recipe': 'identity_recipe', 'identity_recipe_idempotency': 'identity_idempotency',
    'retry_conflict': 'retry_conflict', 'no_second_effect': 'no_second_effect', 'storage_metadata': 'sequence_issued',
    'storage_metadata_observed_at_utc': 'observed_issued', 'storage_metadata_persisted_at_utc': 'persisted_issued',
    'replay_only_writer': 'replay_only_writer', 'payload_form': 'payload_form', 'payload_form_exclusive': 'form_exclusive',
    'value_size': 'value_size', 'numeric_recipe': 'producer_route', 'timestamp_profile': 'occurred_clock',
    'receipt_custody': 'receipt_custody', 'receipt_custody_event': 'receipt_event', 'receipt_custody_group': 'receipt_group',
    'coverage': 'coverage', 'coverage_current': 'coverage_current', 'checkpoint_identity': 'ckpt_instance',
    'checkpoint_identity_generation': 'ckpt_generation', 'checkpoint_identity_frontier': 'ckpt_frontier',
    'checkpoint_identity_scope': 'ckpt_scope', 'durable_token': 'durable_token', 'durable_token_snapshot': 'token_snapshot',
    'historical_recipe': 'recipe_edition', 'historical_recipe_admission': 'original_admission', 'read_visibility': 'read_permission',
    'read_visibility_deletion': 'not_deleted', 'read_visibility_restriction': 'restriction_ok', 'reader_passivity': 'passive_domain',
    'reader_passivity_external request': 'passive_external', 'reader_passivity_notification': 'passive_notification',
    'reader_passivity_charge': 'passive_charge', 'coherent_restore': 'restore_native', 'coherent_restore_operation result': 'restore_result',
    'coherent_restore_first receipt group': 'restore_group', 'coherent_restore_referenced payload': 'restore_payload',
    'coherent_restore_identity custody': 'restore_identity', 'coherent_restore_tombstones': 'restore_tombstones',
    'payload_dispatch': 'dispatch_event_type', 'payload_dispatch_payload_schema_id': 'dispatch_schema_id',
    'payload_dispatch_payload_scope': 'dispatch_scope', 'payload_dispatch_payload_edition': 'dispatch_edition',
    'write_lease': 'write_lease', 'write_permission': 'write_permission', 'writer_owner': 'writer_owner', 'writer_epoch': 'writer_epoch',
    'writer_cas': 'writer_cas', 'writer_intent': 'writer_intent', 'writer_stop_epoch': 'writer_stop_epoch',
    'writer_final_fence': 'writer_final_fence', 'retry_original_result': 'retry_original_result',
    'retry_first_receipt': 'retry_first_receipt', 'write_lease_scope': 'write_lease_scope', 'writer_stop_blocked': 'writer_stop_blocked',
    'application_key': 'application_key', 'closed_schema': None,
}


def plan_guard_map():
    """Every guard of the plan -> (row, code agreement). closed_schema maps to the py_<family> keyword rows."""
    import pm_w3g_spec as spec
    plan = json.loads((ROOT / 'Plans/event_authority_w3g/oracle_plan.json').read_text())
    common = {r[1]: (r[0], r[3]) for ph, (_t, _a, rows) in m.all_phases().items() if ph in m.ROWS for r in rows}
    out, bad = [], []
    for fam in plan['families']:
        f = fam['event_type']
        for g in fam['guards']:
            suffix = g['guard_id'].split(':', 1)[1]
            code = g['negative']['expected_refusal']
            if suffix in PLAN_COMMON:
                field = PLAN_COMMON[suffix]
                row, rcode = (('py_' + m.FAM[f]['slug'] + ' keyword rows', m.PY_CODE) if field is None else common[field])
            else:
                hits = [(n, r) for n, r in enumerate(spec.DOMAIN[f], 1) if r['suffix'] == suffix]
                if len(hits) != 1:
                    bad.append(dict(guard=g['guard_id'], problem='no row'))
                    continue
                n, r = hits[0]
                row, rcode = f'FD{n:02d}_{m._sanitize(suffix)}', r['code']
            ok = field is None if suffix in PLAN_COMMON and PLAN_COMMON[suffix] is None else rcode == code
            if suffix == 'closed_schema':
                ok = code == 'invalid_payload'
            out.append(dict(guard=g['guard_id'], row=row, plan_refusal=code, row_refusal=rcode, agrees=ok))
            if not ok:
                bad.append(out[-1])
    return out, bad


def resolver_checks():
    """N1/N2 (phase-1 review notes, implemented here): offline discovery refuses an ambiguous URI that no owner pin
    disambiguates and a reachable resource that is missing; the symbolic value-schema notation resolves only by an exact
    unique family_id and refuses a missing or duplicated id."""
    out = {}
    out['shipped_closure_resolves'] = m.closure(())[0] is True
    out['missing_resource_refused'] = m.closure(m.CLOSURE_NEGATIVE_EXCLUSION)[0] is False
    uri = 'https://puppetmaster.local/schemas/goal_cancel_command_custody/1.0.0/goal_cancel_command_custody.schema.json'
    saved = m.OWNER_PINS.pop(uri)
    m._CLOSURE.clear()
    try:
        out['ambiguous_uri_without_pin_refused'] = m.closure(())[0] is False
    finally:
        m.OWNER_PINS[uri] = saved
        m._CLOSURE.clear()
    out['ambiguous_uri_with_one_pin_resolves'] = m.closure(())[0] is True
    registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    fid = registry['families'][0]['family_id']
    out['symbolic_exact_id_resolves'] = m.resolve_symbolic(f'Plans/storage_value_registry.json#/families/{fid}/value_schema',
                                                            registry) == registry['families'][0]['value_schema']
    for name, doc in (('symbolic_missing_id_refused', dict(families=[r for r in registry['families'] if r['family_id'] != fid])),
                      ('symbolic_duplicate_id_refused', dict(families=registry['families'] + [registry['families'][0]]))):
        try:
            m.resolve_symbolic(f'Plans/storage_value_registry.json#/families/{fid}/value_schema', doc)
            out[name] = False
        except m.ClosureRefused:
            out[name] = True
    try:
        m.resolve_symbolic('Plans/storage_value_registry.json#/families/0/value_schema', dict(families=registry['families']))
        out['symbolic_array_position_refused'] = False
    except m.ClosureRefused:
        out['symbolic_array_position_refused'] = True
    contracts_text = (ROOT / 'Plans/event_authority_w3g/contracts.json').read_text()
    out['symbolic_refs_in_w3g_selections'] = contracts_text.count('storage_value_registry.json#/families/')
    return out


def _line_of(path, start, *keys):
    """Line of the first `"key"` after `start`, following keys in order (the payload schemas are pretty-printed)."""
    lines = (ROOT / path).read_text().split('\n')
    i = start
    for key in keys:
        while i < len(lines) and f'"{key}"' not in lines[i]:
            i += 1
        if i == len(lines):
            raise AssertionError((path, keys))
        i += 1
    return i


def _code_line(path, text):
    lines = (ROOT / path).read_text().split('\n')
    hits = [n for n, line in enumerate(lines, 1) if text in line]
    assert len(hits) == 1, (path, text, hits)
    return hits[0]


def implied_sites(sites):
    """Every schema site not credited as a row: its keyword and field, the row that always refuses first and the proof
    with path:line (schema site and checker evaluation)."""
    ev = 'scripts/pm_w3g_events.py'
    code = dict(form=_code_line(ev, "obs['form_exclusive'] = inline or external"),
                decodes=_code_line(ev, "obs['pack_decodes'] = not p_ok or"),
                kw=_code_line(ev, "if kw in ('const', 'type', 'maxLength', 'pattern', 'minimum', 'enum', 'minItems', 'uniqueItems', 'minLength'):"),
                anyof=_code_line(ev, "elif kw == 'anyOf_type':"), items=_code_line(ev, "elif kw == 'items_pattern':"),
                enumskip=_code_line(ev, "if 'type' in prop and not ('enum' in prop"))
    out = []
    for s in sites:
        if not s['implied']:
            continue
        f = s['family']
        path = m.FAM[f]['payload_path']
        mt = re.fullmatch(r'#/\$defs/(\w+)/(.*)', s['site'])
        sel, rest = mt.group(1), mt.group(2)
        sel_line = _line_of(path, 0, sel)
        rows = {r[1]: r for r in m.py_rows(f)}
        kind = s['implied']
        if kind == 'root_type':
            line = _line_of(path, sel_line - 1, 'type')
            out.append(dict(family=f, selector=sel, site=s['site'], keyword='type: object', field='(payload root)',
                            row='pf PF01_form_exclusive (inline) / PF07_pack_decodes (SP-337)', kind=kind,
                            proof=f'{path}:{line} requires an object; {ev}:{code["form"]} admits only an inline object body or a '
                                  f'payload:v1 reference and {ev}:{code["decodes"]} requires the decoded pack body to be an object, '
                                  'so no non-object payload reaches the selector'))
            continue
        k = rest.split('/')[1]
        tail = '/'.join(rest.split('/')[2:])
        prop_line = _line_of(path, sel_line, 'properties', k)
        prop = m.SCHEMAS[f]['$defs'][sel]['properties'][k]
        if kind in ('minLength_ref', 'minLength_hex'):
            branch = prop['anyOf'][0] if tail.startswith('anyOf') else prop['items'] if tail.startswith('items') else prop
            keys = ('anyOf',) if tail.startswith('anyOf') else ('items',) if tail.startswith('items') else ()
            ml = _line_of(path, prop_line - 1, *keys, 'minLength')
            pl = _line_of(path, prop_line - 1, *keys, 'pattern')
            target = rows.get(f'anyOf_pattern.{k}' if tail.startswith('anyOf') else f'items_pattern.{k}' if tail.startswith('items')
                              else f'pattern.{k}')
            out.append(dict(family=f, selector=sel, site=s['site'], keyword=f'minLength: {branch["minLength"]}', field=k,
                            row=target[0], kind=kind,
                            proof=f'{path}:{ml} minLength {branch["minLength"]} is implied by {path}:{pl} pattern '
                                  f'{branch["pattern"]} (it needs at least {branch["minLength"]} characters before the end); the '
                                  f'pattern row runs at {ev}:{code["items"] if tail.startswith("items") else code["kw"] if not tail.startswith("anyOf") else code["anyof"]}'))
        elif kind == 'anyOf_null':
            nl = _line_of(path, prop_line - 1, 'anyOf', 'null')
            out.append(dict(family=f, selector=sel, site=s['site'], keyword='anyOf[1] type: null', field=k,
                            row=rows[f'anyOf_type.{k}'][0], kind=kind,
                            proof=f'{path}:{nl} is one alternative of the anyOf; the anyOf type row ({ev}:{code["anyof"]}) '
                                  'requires the value to be of some branch type (string/integer or null), the only way the '
                                  'null alternative can contribute to a refusal'))
        elif kind == 'type_enum':
            tl = _line_of(path, prop_line - 1, 'type')
            el = _line_of(path, prop_line - 1, 'enum')
            out.append(dict(family=f, selector=sel, site=s['site'], keyword='type: string', field=k, row=rows[f'enum.{k}'][0],
                            kind=kind,
                            proof=f'{path}:{tl} type string is implied by {path}:{el} enum, whose values are all strings, so '
                                  f'every non-string the type site refuses the enum row refuses ({ev}:{code["kw"]}); the type '
                                  f'row is not generated for string enums ({ev}:{code["enumskip"]})'))
        else:
            raise AssertionError(kind)
    return out


def implied_witnesses():
    """One complete-checker case per implied kind: the implied keyword is enforced, refused first at its covering row."""
    def pedit(changes):
        return c._payload_edit(changes)

    def bad_root_pack(w):
        raw = m.storage_value_bytes([1], profile=m.EVENT_VALUE)
        digest = m.blake3(raw).hexdigest()
        w['storage']['packs'] = {digest: dict(bytes=raw, media_type=m.MEDIA, pack_synced=True, index_synced=True)}
        w['stored']['payload_ref'] = 'payload:v1:' + digest

    def root_inline(w):
        w['stored']['payload'] = ['not', 'an', 'object']
    gp = 'goal.paused'
    cases = [
        ('root_type (inline)', c.case('implied/root_type/inline', gp, 'project', m.A, c._row('pf', 'form_exclusive'), mut=root_inline)),
        ('root_type (SP-337)', c.case('implied/root_type/ref', gp, 'project', m.A, c._row('pf', 'pack_decodes'), mut=bad_root_pack, form='ref')),
        ('minLength_ref', c.case('implied/minLength_ref', gp, 'project', m.A, c._row('py_goal_paused', 'pattern.goal_id'),
                                 mut=pedit({'goal_id': ''}))),
        ('minLength_ref (anyOf branch)', c.case('implied/minLength_ref/anyOf', gp, 'project', m.A,
                                                c._row('py_goal_paused', 'anyOf_pattern.active_run_ref'), mut=pedit({'active_run_ref': ''}))),
        ('minLength_ref (items)', c.case('implied/minLength_ref/items', 'assistant_plan.completed', 'project', m.A,
                                         c._row('py_assistant_plan_completed', 'items_pattern.completion_evidence_refs'),
                                         mut=pedit({'completion_evidence_refs': ['']}))),
        ('minLength_hex', c.case('implied/minLength_hex', gp, 'project', m.A, c._row('py_goal_paused', 'pattern.currentness_hash'),
                                 mut=pedit({'currentness_hash': 'a' * 63}))),
        ('anyOf_null', c.case('implied/anyOf_null', gp, 'project', m.A, c._row('py_goal_paused', 'anyOf_type.active_run_ref'),
                              mut=pedit({'active_run_ref': 7.5}))),
        ('type_enum', c.case('implied/type_enum', gp, 'project', m.A, c._row('py_goal_paused', 'enum.before_state'),
                             mut=pedit({'before_state': 7}))),
    ]
    out = []
    for kind, x in cases:
        got, _w = c.run(x)
        out.append(dict(kind=kind, case=x['id'], expected=x['expect'], got=got, ok=got is not None and tuple(got) == tuple(x['expect'])))
    return out


def git_show(rev, path):
    return subprocess.run(['git', '-C', str(ROOT), 'show', f'{rev}:{path}'], capture_output=True, text=True, check=True).stdout


def retention_cells():
    """Each family/scope cell against the landed decision text and policy objects on main (MAIN_PIN)."""
    plan = git_show(MAIN_PIN, 'Plans/storage-plan.md')
    registry = json.loads(git_show(MAIN_PIN, 'Plans/storage_value_registry.json'))
    policies = {p['policy_id']: p for p in registry['retention_policies']}
    lines = plan.splitlines()

    def line_of(text, prefix=''):
        for i, line in enumerate(lines, 1):
            if text in line and line.startswith(prefix):
                return i, line
        return None, None

    out, bad = [], []
    for f in m.FAMILIES:
        for scope in m.SCOPES[f]:
            ref = m.RETENTION[f][scope]
            pid = ref.split('@')[0]
            if pid == 'RP-RUNTIME-365D':
                decision, cite = 'DL-401 Card 1 Case L-3 (phase-1 binding, unchanged)', None
                ok = pid in policies
            elif pid == 'RP-AUTHORITY-INDEFINITE':
                n, line = line_of(f'`{f}`', '- 1.a,')
                ok = n is not None and line.startswith('- 1.a,') and pid in policies
                head, _ = line_of('Kept indefinitely, `RP-AUTHORITY-INDEFINITE@1.0.0` (Keep), 47 further names (DL-453)')
                ok = ok and head is not None and head < n
                decision, cite = 'DL-453 (E-CARDS-3 item 1.a A)', f'Plans/storage-plan.md:{head},{n}'
            else:
                n, line = line_of(f'`{f}`', '- 3.a,')
                head, _ = line_of('Kept seven years, 24 operational, security and recovery histories (DL-455)')
                ok = n is not None and line.startswith('- 3.a,') and head is not None and head < n and pid in policies
                if scope == 'project':
                    adapter, aline = line_of('**Project first-save anchor adapter for `RP-OPERATIONAL-2555D@1.0.0` (DL-455, DL-457).**')
                    ok = ok and pid == 'RP-OPERATIONAL-2555D' and adapter is not None
                    entry = [i for i, x in enumerate(lines, 1) if f'`{f}`' in x and x.startswith('- **') and i > adapter]
                    ok = ok and len(entry) == 1
                    decision, cite = 'DL-455 (E-CARDS-3 item 3.a A), Project first-save anchor adapter', \
                        f'Plans/storage-plan.md:{head},{n},{adapter},{entry[0] if entry else None}'
                else:
                    ok = ok and pid == 'RP-OPERATIONAL-SECURITY-APPLICATION-2555D' and \
                        policies[pid].get('anchor_kind') == 'creation'
                    decision, cite = 'DL-455 (E-CARDS-3 item 3.a A), application allowance app:operational_security', \
                        f'Plans/storage-plan.md:{head},{n}'
            ok = ok and m.FAM[f].get('retention_by_scope', {}).get(scope) == ref   # the contract records the same cell
            cell = dict(family=f, scope=scope, retention_policy_ref=ref, decision=decision, main=MAIN_PIN, cite=cite,
                        policy_object_on_main=pid in policies, status='bound' if ok else 'mismatch')
            out.append(cell)
            if not ok:
                bad.append(cell)
    return out, bad


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--json', type=Path)
    parser.add_argument('--skip-numbers', action='store_true')
    args = parser.parse_args()
    started = time.monotonic()
    tables = subprocess.run([sys.executable, str(ROOT / 'scripts/pm-w3g-table-generate.py'), '--check'], capture_output=True, text=True)
    resources = m.assert_schema_closure()
    m.assert_fields_unique()
    clocks = m.timestamp_inventory()
    cases, failures, witness, per_family = run_cases()
    missing, na, ent = coverage(witness)
    sites, unmapped = schema_site_map()
    cells, bad_cells = retention_cells()
    guard_map, bad_guards = plan_guard_map()
    resolver = resolver_checks()
    implied = implied_sites(sites)
    implied_wit = implied_witnesses()
    bad_implied = [w for w in implied_wit if not w['ok']] + ([] if len(implied) == sum(1 for x in sites if x['implied']) else ['count'])
    bad_resolver = [k for k, v in resolver.items() if v is False]
    phases = m.all_phases()
    result = dict(
        status='pass' if not (failures or missing or unmapped or bad_cells or bad_guards or bad_resolver or bad_implied
                              or tables.returncode) else 'fail',
        implied_sites=implied, implied_site_count=len(implied), implied_witnesses=implied_wit,
        implied_by_kind=dict(collections.Counter(x['kind'] for x in implied)),
        resolver_checks=resolver,
        plan_guards=len(guard_map), plan_guard_problems=bad_guards,
        tables_current=tables.returncode == 0, tables=tables.stdout.strip(),
        schema_closure_resources=resources, owner_pin_drift=m.pin_drift(), timestamp_fields=clocks,
        cases=len(cases), positives=sum(1 for x in cases if x['expect'] is None),
        negatives=sum(1 for x in cases if x['expect'] is not None),
        tables_count=len(phases), rows=sum(len(v[2]) for v in phases.values()),
        family_row_witnessed=len(witness), family_row_not_applicable=na, family_row_entailed=len(ent),
        entailed_proofs=m.entailed_proofs(), missing_witnesses=missing,
        schema_sites=len(sites), schema_sites_row=sum(1 for s in sites if s['row']), schema_sites_implied=sum(1 for s in sites if s['implied']),
        implied_reasons=IMPLIED, schema_sites_unmapped=unmapped,
        retention_cells=cells, retention_mismatches=bad_cells,
        per_family=per_family, failures=failures[:200], failure_count=len(failures))
    if not args.skip_numbers:
        import pm_w3g_numbers as numbers
        result['numbers'] = numbers.run()
        if result['numbers']['status'] != 'pass':
            result['status'] = 'fail'
    result['seconds'] = round(time.monotonic() - started, 1)
    text = json.dumps(result, indent=1, sort_keys=True, default=str)
    if args.json:
        args.json.write_text(text + '\n')
    brief = {k: v for k, v in result.items() if k not in ('per_family', 'failures', 'retention_cells', 'entailed_proofs', 'implied_sites',
                                                          'family_row_not_applicable', 'implied_reasons', 'timestamp_fields')}
    if 'numbers' in brief:
        brief['numbers'] = {k: v for k, v in result['numbers'].items() if k in ('status', 'counts', 'mismatch_count', 'crash_count')}
    print(json.dumps(brief, indent=1, default=str))
    for f in failures[:25]:
        print('FAIL', f, file=sys.stderr)
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
