#!/usr/bin/env python3
"""PNC-019 C12-GC: compact result bundle from one runner output and one clause-coverage output.

Writes reports/event-authority-20261115/PNC019-C12-GC-{core,coverage,ledger,schema-closure}.json:
  core     - totals, gated-tool table results (credit copied from the tool), kill classes, justified rows,
             retained-store observations, corpus and join counts, source bindings and evidence hashes;
  coverage - per family: owner clause (unit) -> row -> table and tool status -> control, negative, cut, restore;
  ledger   - every negative case, uncapped: declared target, final call, outcome class, cut and restore result;
  schema-closure - per whole-definition root: every reachable assertion clause KILLED, COVERED_LATER (with the
             clause that still refuses), VACUOUS, SELECTOR_OR_NEGATED or UNCOVERED (scripts/pm-goal-gc-schema-closure.py).
Usage: python3 scripts/pm-goal-gc-report.py --run DIR --closure FILE [--out-dir reports/event-authority-20261115]
"""
import argparse
import collections
import gzip
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_goal_gc_declarations import DUPLICATES, JUSTIFIED  # noqa: E402

FAMILIES = {'own_a': ('goal_run.stopped', 'goal_run.blocked'), 'own_b': ('goal.blocked', 'goal.completed')}
# Owner clause map: row prefix -> owner units (headings verified at build time).
OWNER = {
    'own_a': [
        (('request/', 'route', 'registration/', 'birth/', 'authority/', 'writer/'), ['EP-1110', 'EP-1111', 'EP-1112', 'GRS-1110']),
        (('native/', 'cause/', 'goal/', 'final/'), ['EP-1111', 'EP-1112', 'GRS-200', 'GRS-201']),
        (('event/',), ['SP-426', 'SP-427', 'CV-420', 'CV-421']),
        (('operation/', 'retry/', 'receipt/', 'storage/', 'append/', 'recovery/'), ['SP-1110', 'SP-1111', 'SP-286']),
        (('reader/',), ['SP-1110', 'SP-1111', 'SP-1101']),
        (('project/', 'publish/', 'candidate/', 'generation/', 'cutover/', 'read/'), ['SP-1112', 'SP-428', 'GRS-202']),
        (('part/', 'wrapper/'), ['SP-337', 'CV-1110']),
        (('root/',), ['CV-1110']),
    ],
    'own_b': [
        (('dispatch/', 'schema/'), ['CV-1120', 'CV-1121', 'CV-1122']),
        (('source/', 'physical/', 'resolver/', 'access/', 'writer/'), ['SP-1120', 'SP-1121', 'SP-1122']),
        (('fence/', 'authority/'), ['GRS-1120', 'GRS-1121', 'GRS-050']),
        (('body/', 'blocked/'), ['GRS-1120', 'SP-429']),
        (('completed/',), ['GRS-1121', 'GRS-050']),
        (('exception/',), ['GRS-1122', 'EP-1120', 'HITL-1120', 'PS-1120', 'SIR-1120']),
        (('event/', 'receipt/', 'result/', 'reference/'), ['SP-1120', 'SP-1121', 'SP-1122', 'SP-286']),
        (('retained/',), ['SP-1101']),
    ],
}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def headings():
    out = {}
    for path in sorted((ROOT / 'Plans').glob('*.md')):
        for number, line in enumerate(path.read_text().split('\n'), 1):
            if line.startswith('### ') and ' - ' in line:
                unit = line[4:].split(' - ', 1)[0].strip()
                out.setdefault(unit, f'{path.relative_to(ROOT)}:{number}')
    return out


def owner_units(source, code):
    for prefixes, units in OWNER[source]:
        if code.startswith(prefixes):
            return units
    return []


def family_of(source, case):
    for family in FAMILIES[source]:
        if case.startswith(family + '/'):
            return family
    if source == 'own_b':
        return {'blocked': 'goal.blocked', 'completed': 'goal.completed', 'exception': 'goal.completed'}.get(case.split('/', 1)[0], 'shared')
    return 'shared'


def root_families(source, root):
    name = root.rsplit('/', 1)[-1]
    if source == 'own_a':
        if 'Stop' in name or 'stopped' in name:
            return ['goal_run.stopped']
        if 'Block' in name or 'blocked' in name:
            return ['goal_run.blocked']
        return ['goal_run.stopped', 'goal_run.blocked']
    if 'blocked' in name:
        return ['goal.blocked']
    if any(word in name for word in ('completed', 'exception', 'approval', 'workflow', 'todo', 'disposition')):
        return ['goal.completed']
    return ['goal.blocked', 'goal.completed']


def race(snapshot):
    return snapshot['case'].endswith('_disclosure') and snapshot['refusal'] == 'access/disclosure'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', type=Path, required=True)
    parser.add_argument('--closure', type=Path, action='append', required=True, help='one schema-closure output per checker')
    parser.add_argument('--out-dir', type=Path, default=ROOT / 'reports/event-authority-20261115')
    args = parser.parse_args()
    summary = json.loads((args.run / 'summary.json').read_text())
    tables = json.loads((args.run / 'tables.json').read_text())
    ledgers = json.loads((args.run / 'ledger.json').read_text())
    stores = json.loads((args.run / 'retained-store-snapshots.json').read_text())
    closure = dict(sources={})
    for path in args.closure:
        closure['sources'].update(json.loads(path.read_text())['sources'])
    units = headings()
    table_of = {key: t for t in tables for key in t['rows']}
    core = dict(schema_id='pm.pnc019.c12_gc.core.v1', native_execution='NOT_RUN', tool_commit='004bdedd63',
                tool_sha256=sorted({t.get('tool_sha256') for t in tables if t.get('tool_sha256')}),
                runner='scripts/pm-goal-gc-guard-tables.py', sources={}, families={})
    coverage, ledger_out = {}, {}
    for source, ledger in ledgers.items():
        calls = json.loads(gzip.open(args.run / f'{source}-calls.json.gz').read())
        controls = collections.defaultdict(lambda: collections.Counter())
        for call in calls:
            if call['kind'] == 'accepted':
                fam = family_of(source, call['case'])
                for key in {k for k, _h, _s in call['observations']}:
                    controls[key][fam] += 1
        by_row = collections.defaultdict(list)
        for entry in ledger:
            by_row[entry['row']].append(entry)
        ledger_out[source] = [[e['case'], e['family'], e['declared_target'], e.get('outcome_class'), e.get('final_call'),
                               e.get('input_sha256'), (e.get('cut') or {}).get('kind'), (e.get('cut') or {}).get('refusal') or (e.get('cut') or {}).get('exception'),
                               (e.get('restore') or {}).get('refusal'), (e.get('joint_cut') or {}).get('rows')] for e in ledger]
        rows = [r for t in tables if t['table'].startswith(source + '_') for r in t['rows']]
        for family in FAMILIES[source]:
            matrix = []
            for key in rows:
                code = key.split(':', 1)[1]
                fam_controls = controls[key].get(family, 0)
                negs = [e for e in by_row[key] if e['family'] in (family, 'shared')]
                if not fam_controls and not negs:
                    continue
                kills = [e for e in negs if e.get('outcome_class') == 'kill']
                dups = [e for e in negs if e.get('outcome_class') == 'duplicate_set_kill']
                t = table_of[key]
                matrix.append(dict(
                    owner_units={u: units.get(u) for u in owner_units(source, code)}, row=key,
                    table=t['table'], tool_status=t['tool_status'], tool_proved=key in t['proved'],
                    controls=fam_controls, negatives=len(negs),
                    negative_witness=(kills or dups or negs or [{}])[0].get('case'),
                    cut=(kills and 'accepts') or (dups and 'accepts with declared duplicate set') or
                        (negs and sorted({e.get('outcome_class') for e in negs})) or 'no family negative',
                    restoration=bool(kills or dups) and all((e.get('restore') or {}).get('refusal') == e['declared_target'] for e in kills + dups),
                    duplicate_set=DUPLICATES.get(source, {}).get(code),
                    justification=JUSTIFIED.get(source, {}).get(code)))
            proved = sum(m['tool_proved'] for m in matrix)
            justified = sum(1 for m in matrix if not m['tool_proved'] and m['justification'])
            open_rows = [m['row'] for m in matrix if not m['tool_proved'] and not m['justification']]
            coverage[family] = dict(source=source, rows=len(matrix), tool_proved=proved, justified_singletons=justified,
                                    open_rows=open_rows, matrix=matrix)
            fam_ledger = [e for e in ledger if e['family'] in (family, 'shared')]
            core['families'][family] = dict(
                source=source, rows=len(matrix), tool_proved=proved, justified_singletons=justified, open_rows=len(open_rows),
                negative_cases=len(fam_ledger), outcome_classes=dict(collections.Counter(e.get('outcome_class') for e in fam_ledger)),
                corpus_cases=sum(1 for e in fam_ledger if '/numbers/' in '/' + e['case'] or '/datetime/' in '/' + e['case']),
                retained_cases=sum(1 for e in fam_ledger if '/retained/' in '/' + e['case']),
                join_cases=sum(1 for e in fam_ledger if '/join/' in '/' + e['case']),
                retained_store_reads=sum(1 for s in stores if s['source'] == source and family_of(source, s['case']) in (family, 'shared')),
                retained_store_changed=sum(1 for s in stores if s['source'] == source and family_of(source, s['case']) in (family, 'shared')
                                           and s['store_before'] != s['store_after'] and not race(s)),
                # The declared owner race: DisclosureHook withdraws content_visible during the read (a modeled owner
                # change, not a read effect); every such read refuses at access/disclosure.
                retained_store_owner_race_changes=sum(1 for s in stores if s['source'] == source and family_of(source, s['case']) in (family, 'shared')
                                                      and s['store_before'] != s['store_after'] and race(s)))
        src = summary['sources'][source]
        core['sources'][source] = dict(src, tables=sum(1 for t in tables if t['table'].startswith(source + '_')),
                                       tool_pass_tables=sum(1 for t in tables if t['table'].startswith(source + '_') and t['tool_status'] == 'PASS'),
                                       rows_proved=sum(len(t['proved']) for t in tables if t['table'].startswith(source + '_')))
    core.update(totals=dict(tables=summary['tables'], rows=summary['rows'], proved=summary['proved'],
                            lane_matrix_problems=summary['lane_matrix_problems'], tool_failure_tables=summary['tool_failure_tables'],
                            unproved_justified=len(summary['unproved_justified']), unproved_unjustified=summary['unproved_unjustified']),
                changed_during_run=summary['changed_during_run'], source_bindings=summary['source_bindings'],
                schema_closure={s: dict(occurrences=v['occurrence_counts'], distinct=v['distinct_counts'])
                                for s, v in closure['sources'].items()},
                evidence={p.name: sha(p) for p in sorted(args.run.rglob('*')) if p.is_file()} | {p.name: sha(p) for p in args.closure},
                evidence_root=str(args.run))
    args.out_dir.mkdir(parents=True, exist_ok=True)
    (args.out_dir / 'PNC019-C12-GC-core.json').write_text(json.dumps(core, indent=1, sort_keys=True) + '\n')
    (args.out_dir / 'PNC019-C12-GC-coverage.json').write_text(json.dumps(coverage, indent=1, sort_keys=True) + '\n')
    (args.out_dir / 'PNC019-C12-GC-ledger.json').write_text(json.dumps(dict(
        columns=['case', 'family', 'declared_target', 'outcome_class', 'final_call', 'input_sha256', 'cut_kind', 'cut_result',
                 'restore_refusal', 'joint_cut_rows'], rows=ledger_out), indent=0) + '\n')
    compact = {}
    for source, v in closure['sources'].items():
        roots = {}
        for root, e in v['roots'].items():
            classes = collections.defaultdict(dict)
            for clause, entry in e['clauses'].items():
                if entry['cls'] == 'KILLED':
                    classes['KILLED'][clause] = [entry['input_sha256'][:16], entry['edit'], entry['control']]
                elif entry['cls'] == 'COVERED_LATER':
                    classes['COVERED_LATER'][clause] = entry['still_refused_by']
                elif entry['cls'] in ('VACUOUS', 'SELECTOR_OR_NEGATED', 'UNREACHABLE'):
                    classes[entry['cls']][clause] = entry.get('proof') or entry.get('note')
                else:
                    classes['UNCOVERED'][clause] = entry
            roots[root] = dict(rows=e['rows'], families=root_families(source, root), seeds=e['seeds'],
                               branch_controls=len(e['branch_controls']), validations=e['validations'], counts=e['counts'], **classes)
        compact[source] = dict(occurrences=v['occurrence_counts'], distinct=v['distinct_counts'], uncovered_distinct=v['uncovered'], roots=roots)
    (args.out_dir / 'PNC019-C12-GC-schema-closure.json').write_text(json.dumps(compact, indent=1, sort_keys=True) + '\n')
    for family, entry in core['families'].items():
        uncovered = sorted({clause for root, e in compact[entry['source']]['roots'].items() if family in e['families']
                            for clause in e.get('UNCOVERED', {})})
        later = sum(len(e.get('COVERED_LATER', {})) for e in compact[entry['source']]['roots'].values() if family in e['families'])
        killed = sum(len(e.get('KILLED', {})) for e in compact[entry['source']]['roots'].values() if family in e['families'])
        entry.update(schema_clauses_killed=killed, schema_clauses_covered_later=later, schema_uncovered=len(uncovered),
                     schema_uncovered_list=uncovered)
    (args.out_dir / 'PNC019-C12-GC-core.json').write_text(json.dumps(core, indent=1, sort_keys=True) + '\n')
    print(json.dumps(core['families'], indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
