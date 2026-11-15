#!/usr/bin/env python3
"""Assemble and check the C12-DCW per-family coverage matrix from the evidence runs.

Inputs are the outputs of the real runs (schema ledger, gated guard tool summary,
complete-boundary and implication checks, entailments, retained store, date-time
corpus, number lane). For each exact family the matrix maps

  owner unit and checker phase -> named guard row -> control, negatives, gated
  cut and restoration, complete-boundary status (witness or checked implication)

and every reachable schema clause of every real check_schema site the family
uses -> witness mutation, exact OE001 refusal, OE001 cut, restoration and the
single-clause cut, or a vacuous / shared-site / covering classification.

The matrix refuses (exit 1) if any reached row or reachable clause is left
without one of those, or if any input run did not pass.
"""
import argparse
import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_c12 as c12
import pm_dcw_guard_rows as rows
import pm_dcw_guard_suites as suites

# Checker phase -> owner basis. Exact owner quotes for each family stay in the
# self-grade cell; this names which owner obligation each phase enforces.
PHASES = {
    'writer_policy': 'CV-317 replay policy / DL-076 writer admission',
    'secret_free': 'CV-317 redaction profile secret_refs_only',
    'canonical_msgpack': 'SP-1100 physical EventRecord codec',
    'semantic_digest': 'CV-317/CV-1100 producer semantic projection',
    'event_reference': 'SP-337 payload reference descriptor',
    'event_body': 'family payload schema (CV-590..597) and SP-337 overflow body',
    'envelope': 'EventRecord CV-317/CV-253 envelope, identity, scope, causation, time, redaction',
    'original_receipt': 'SP-286/CV-339 first full-value receipt, SP-1101 sealed original custody',
    'bundle_source': 'SP-575..578 revision_run source and ACD-571..574 lifecycle',
    'wizard_source': 'PWIZ-097/098 wizard source, CV-594/595 joins',
    'index_read': 'SP-278 checkpoint, generation, token and translation boundary',
    'index_content': 'SP-278 source frames, rows, coverage and anchors',
    'index_event': 'SP-278 selected original frame join',
    'source_storage': 'SP-337 physical source value and Storage profile',
    'verify': 'family admission, restore admission, permission, cutoff, effects and retained-read boundary',
    'run': 'CLI family inventory and materialized source registry rows',
    'canonical_json': 'integer-only JSON digest domain',
    'opened_source_custody': 'PWIZ-098 opened predecessor custody',
    'require_storage_timestamps': 'CV-253 Storage-assigned UTC-Z timestamps',
    'index_binding': 'SP-278 binding profile',
    'admit_retry_request': 'CV-1100 current caller integers',
    'admit_storage_sequence': 'CV-1100 Storage sequence domain',
    'source_frame_bytes': 'SP-278 captured frame bytes',
    'check_schema': 'owner schema documents (whole-definition)',
    'schema_references': 'eager schema reference closure',
    'validate': 'legacy bundle phase lifecycle (ACD-571..574)',
    'pointer': 'registered payload schema pointer',
    'document_at': 'registered payload schema path',
    'reference_closure': 'registered schema reference closure',
    'validate_registered': 'registered family payload dispatch',
    'strings': 'blockage identifier single reading (CV-596/597)',
    'historical_original': 'blockage predecessor original (CV-596/597, SP-286)',
    'source_contract': 'blockage whole-run source and episode contract (CV-596/597, DL-431/432)',
}


def load(path):
    return json.loads(Path(path).read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def reached_rows(family):
    """Every named row the family's authored accepting controls pass through, with one control id each."""
    found = {}
    for w in suites.witnesses(family):
        if w['expected'] != 'accept' or w.get('kind') is not None:
            continue
        recorded = []
        rows.RECORDER = recorded
        try:
            assert suites.invoke(w) == 'accept', w['id']
        finally:
            rows.RECORDER = None
        for name, _value, _code in recorded:
            found.setdefault(name, w['id'])
    return found


def coverage_file(evidence, family):
    # pm_dcw_c12.py names the file from the family stem (for example bundle.schema-coverage.json).
    return next((evidence / 'schema' / family).glob('*.schema-coverage.json'))


def supplement(evidence, family):
    path = evidence / 'schema-supplement' / (family + '.supplement.json')
    out = {}
    if path.exists():
        for site in load(path):
            for clause in site.get('witnessed_clauses', []):
                out[((site['schema'], site['definition'], site['historical']),
                     (clause['source'], clause['schema_pointer'], clause['keyword']))] = dict(clause, schema_sha256=site['schema_sha256'])
    return out


def schema_family(evidence, family, shared):
    sites = load(coverage_file(evidence, family))
    extra = supplement(evidence, family)
    out, counts = [], Counter()
    for site in sites:
        key = (site['schema'], site['definition'], site['historical'])
        clauses = []
        for clause in site['clauses']:
            ident = (clause['source'], clause['schema_pointer'], clause['keyword'])
            status = clause['status']
            entry = dict(clause)
            if status == 'unwitnessed' and (key, ident) in extra:
                hit = extra[(key, ident)]
                entry.update(status='witnessed_supplement', witnesses=hit['witnesses'], clause_cut=hit['clause_cut'])
            elif status == 'unwitnessed':
                other = shared.get((key, ident))
                if other:
                    entry.update(status='witnessed_by_shared_site', shared_family=other['family'],
                                 shared_witnesses=other['witnesses'], shared_schema_sha256=other['schema_sha256'])
            counts[entry['status']] += 1
            clauses.append(entry)
        out.append(dict(schema=site['schema'], definition=site['definition'], historical=site['historical'],
                        schema_sha256=site['schema_sha256'], controls=len(site['controls']), credited=site['credited'],
                        invalid=site['invalid'], mirror_parity_checks=site['mirror_parity_checks'],
                        clauses=clauses))
    return out, counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence', required=True, type=Path, help='the final evidence directory')
    parser.add_argument('--covering', type=Path, help='JSON list of written covering arguments for named clauses')
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    ev = args.evidence
    guard = load(ev / 'guard-results.json')
    boundary = load(ev / 'boundary' / 'boundary-summary.json')
    implications = load(ev / 'implications.json')
    entail = load(ev / 'entailments' / 'entailments.json')
    retained = load(ev / 'retained' / 'retained-store.json')
    retained_summary = load(ev / 'retained' / 'retained-summary.json')
    dt = load(ev / 'datetime' / 'datetime-inventory.json')
    dt_summary = load(ev / 'datetime' / 'datetime-summary.json')
    numbers = load(ev / 'number-lane.json')
    covering = {(c['schema'], c['definition'], c['historical'], c['source'], c['schema_pointer'], c['keyword']): c
                for c in (load(args.covering) if args.covering else [])}
    by_row = {r['id']: r for r in guard['rows']}
    accepting = {r['id'] for r in guard['rows'] if any(x['cut'] == 'accept' for x in r['full_path_cuts'])}
    entailed_rows = {r['row']: r for r in entail['rows']}

    shared = {}
    for family in c12.FAMILIES:
        for site in load(coverage_file(ev, family)):
            key = (site['schema'], site['definition'], site['historical'])
            for clause in site['clauses']:
                if clause['status'] == 'witnessed':
                    shared.setdefault((key, (clause['source'], clause['schema_pointer'], clause['keyword'])),
                                      dict(family=family, witnesses=clause['witnesses'], schema_sha256=site['schema_sha256']))
        for (key, ident), hit in supplement(ev, family).items():
            shared.setdefault((key, ident), dict(family=family, witnesses=hit['witnesses'], schema_sha256=hit['schema_sha256']))

    matrix, problems, totals = [], [], Counter()
    for family in c12.FAMILIES:
        reached = reached_rows(family)
        row_entries = []
        for name in sorted(reached):
            g = by_row[name]
            tool = g.get('tool_row') or {}
            if not g['proved']:
                complete = dict(status='by_construction', entailment=entailed_rows.get(name, {}).get('status'))
            elif name in accepting:
                complete = dict(status='cut_accepts', witness=next(x['id'] for x in g['full_path_cuts'] if x['cut'] == 'accept'))
            elif boundary.get(name, {}).get('best') == 'complete_boundary':
                complete = dict(status='complete_boundary_reclassified')
            else:
                claim = implications['rows'].get(name, {})
                complete = dict(status=(claim.get('claim') or {}).get('kind', 'MISSING'), check=claim.get('status'))
            negatives = [n for n in by_row[name]['full_path_cuts']]
            entry = dict(row=name, module=g['module'], phase=g['function'], owner_basis=PHASES.get(g['function'], 'UNMAPPED'),
                         source=g['source'], table=g['table'], gated='proved' if g['proved'] else 'unproved_by_construction',
                         control=reached[name], negatives_total=g['negative_count'],
                         negatives_this_family=sum(1 for n in negatives if n['id'].startswith(family + '/')),
                         gated_cut=dict(own=len(tool.get('own', [])), flips=len(tool.get('flips', [])),
                                        stays=len(tool.get('stays', [])), masked=len(tool.get('masked', [])),
                                        unrelated_changes=len(tool.get('unrelated_changes', [])),
                                        restoration='matches' if g['proved'] and not tool.get('unrelated_changes') else 'n/a'),
                         complete_boundary=complete)
            if entry['owner_basis'] == 'UNMAPPED':
                problems.append((family, name, 'unmapped phase'))
            if complete['status'] in ('MISSING',) or complete.get('check') == 'fail' or complete.get('entailment') == 'fail':
                problems.append((family, name, 'complete boundary', complete))
            if g['proved'] and (tool.get('masked') or tool.get('unrelated_changes')):
                problems.append((family, name, 'gated masks'))
            totals['rows_' + complete['status']] += 1
            row_entries.append(entry)
        schema_sites, counts = schema_family(ev, family, shared)
        for site in schema_sites:
            for clause in site['clauses']:
                if clause['status'] == 'unwitnessed':
                    key = (site['schema'], site['definition'], site['historical'], clause['source'],
                           clause['schema_pointer'], clause['keyword'])
                    cover = covering.get(key) or covering.get((None, None, None) + key[3:])
                    if cover:
                        clause.update(status='covered', covering=cover['argument'], covering_kind=cover['kind'])
                        counts['unwitnessed'] -= 1
                        counts['covered'] += 1
                    else:
                        problems.append((family, 'schema', key))
        totals.update({'schema_' + k: v for k, v in counts.items()})
        fam_retained = [r for r in retained if r['family'] == family]
        fam_dt = [d for d in dt if d['family'] == family]
        fam_numbers = [r for r in numbers['results'] if r.get('family') == family]
        matrix.append(dict(family=family, rows=row_entries, schema_sites=schema_sites, schema_counts=dict(counts),
                           schema_credited=sum(s['credited'] for s in schema_sites),
                           schema_invalid=sum(s['invalid'] for s in schema_sites),
                           retained=dict(observations=len(fam_retained), exact=sum(r.get('exact', False) for r in fam_retained),
                                         cases=sorted({r['case'] for r in fam_retained}),
                                         store_unchanged=all(r.get('store_unchanged', True) for r in fam_retained)),
                           datetime=dict(fields=len(fam_dt), checks=sum(d['samples'] for d in fam_dt),
                                         profiles=dict(Counter(d['profile'] for d in fam_dt)),
                                         field_profiles=sorted({(d['schema'], '/'.join(map(str, d['instance_path'])), d['profile']) for d in fam_dt})),
                           numbers=dict(cases=len(fam_numbers))))
    inputs_pass = dict(boundary_implications=implications['status'], entailments=entail['status'],
                       retained=retained_summary['status'], datetime=dt_summary['status'], numbers=numbers['status'])
    for name, status in inputs_pass.items():
        if status != 'pass':
            problems.append(('input', name, status))
    out = dict(status='pass' if not problems else 'fail', problems=[repr(p) for p in problems[:200]],
               problem_count=len(problems), totals=dict(totals), inputs=inputs_pass,
               evidence_pins={str(p.relative_to(ev)): sha(p) for p in sorted(ev.rglob('*.json')) if p.stat().st_size < 50_000_000
                              and 'logs' not in p.parts and 'guard' not in p.parts and p.name != 'steps.json'},
               families=matrix, native='NOT_RUN', admission='ABSENT')
    args.out.write_text(json.dumps(out, indent=1, sort_keys=True, default=list) + '\n')
    print(json.dumps(dict(status=out['status'], problems=len(problems), totals=out['totals'], inputs=inputs_pass), sort_keys=True))
    raise SystemExit(0 if not problems else 1)


if __name__ == '__main__':
    main()
