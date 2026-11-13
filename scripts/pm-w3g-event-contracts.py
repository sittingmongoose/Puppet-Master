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
    phases = m.all_phases()
    result = dict(
        status='pass' if not (failures or missing or unmapped or bad_cells or tables.returncode) else 'fail',
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
    brief = {k: v for k, v in result.items() if k not in ('per_family', 'failures', 'retention_cells', 'entailed_proofs',
                                                          'family_row_not_applicable', 'implied_reasons', 'timestamp_fields')}
    if 'numbers' in brief:
        brief['numbers'] = {k: v for k, v in result['numbers'].items() if k in ('status', 'counts', 'mismatch_count', 'crash_count')}
    print(json.dumps(brief, indent=1, default=str))
    for f in failures[:25]:
        print('FAIL', f, file=sys.stderr)
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
