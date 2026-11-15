#!/usr/bin/env python3
"""C12-GH2 (lane 16) owner-schema clause closure per family, lane GC's standard.

Every reachable assertion clause of every owner schema root a family's
complete calls validate is classified, per root:

  KILLED                the family has a declared witness targeting this row
                        alone whose single-row cut makes the complete checker
                        accept and whose uncached restoration repeats the
                        refusal (matrix CLOSED, KILLED);
  DUPLICATE_GROUP_KILLED  killed only as a member of a registered duplicate
                        group (type with its enum/const, or a property enum with
                        the union whose alternatives enumerate the same values,
                        pm_goal_oracle_common._SCHEMA_DUPLICATES): the group's
                        joint cut accepts; one invariant, never a single-row kill;
  DUPLICATE_SET_KILLED  closed only by a declared duplicate set of separate
                        invariants (joint cut accepts, each site refuses alone);
  COVERED_BY_PROOF      a recorded source-bound proof names the covering
                        clause(s), each itself closed in this family (union
                        alternative members, nullable/edition unions, identity
                        constants, the GH2 entailment); no kill credit;
  UNCOVERED             anything else (the bar is 0).

Listed apart, never counted as reachable: clauses inside an `if` (a branch
selector) or inside a `not` (the `not` keyword is the row), VACUOUS bounds
(minItems/minLength/minProperties of 0) and UNREACHABLE types (items of an
array whose owner node has maxItems 0).

Reachability is computed twice and compared: by this tool's own walk of each
root (every keyword, every $ref, both conditional branches, union
alternatives, the shared timestamp profiles composed at their fields) and by
C12-GH1's inventory (pm_goal_oracle_common.schema_type_inventory). A clause one
walk reaches and the other does not is UNCOVERED. Every family schema row must
belong to one of the listed roots (no unattributed row). The family's
family-specific checker rows in source are also checked against the matrix.

Usage:
  python3 scripts/pm_goal_c12_gh2_closure.py MATRIX_JSON --ledger PROOF/ledger.json.gz --out closure.json
"""
import argparse
import collections
import gzip
import hashlib
import json
import re
from pathlib import Path

import pm_goal_oracle_common as common
import pm_goal_own_d_oracles as d
from pm_goal_history_reader_fixtures import CKPT_SCHEMA, ER_SCHEMA, FAMILIES

ROOT = common.ROOT
GH2 = ('stopped', 'verification_decided', 'evidence_captured', 'receipt_recorded', 'tool_check_recorded')
VACUOUS = ('minItems', 'minLength', 'minProperties', 'minContains')


def assertion(schema, key):
    if key in ('additionalProperties', 'unevaluatedProperties'):
        return schema[key] is False
    return key in common.ASSERTION_KEYWORDS


def location_of(schema):
    return schema.get('x-pm-oracle-id') or json.dumps(schema, sort_keys=True)


def walk(v):
    """Independent walk: {(guard): set(contexts)} with context in reachable/if/not/empty_items."""
    found = collections.defaultdict(set)
    info = {}
    seen = set()

    def visit(schema, resolver, context):
        if not isinstance(schema, dict):
            return
        key = (location_of(schema), context)
        if key in seen:
            return
        seen.add(key)
        for word in schema:
            if word in common._KEYWORDS and assertion(schema, word):
                guard = common.schema_guard(schema, word)
                found[guard].add(context)
                info.setdefault(guard, dict(location=location_of(schema), keyword=word,
                                            value=schema[word] if not isinstance(schema[word], (dict, list))
                                            or word in ('required', 'enum', 'type') else '<subschema>'))
        if context == 'reachable':
            for field in common.timestamp_roles(schema):
                target = common.timestamp_target(schema['properties'][field], resolver)
                for word in ('type', 'format'):
                    guard = common.schema_guard(target, word)
                    found[guard].add(context)
                    info.setdefault(guard, dict(location=location_of(target), keyword=word,
                                                value='date-time' if word == 'format' else 'string', shared_profile=field))
        if '$ref' in schema:
            resolved = resolver.lookup(schema['$ref'])
            visit(resolved.contents, resolved.resolver, context)
        for word in ('properties', 'patternProperties', 'dependentSchemas'):
            for child in schema.get(word, {}).values():
                visit(child, resolver, context)
        for word in ('additionalProperties', 'unevaluatedProperties', 'contains', 'propertyNames', 'then', 'else',
                     'unevaluatedItems', 'additionalItems', 'contentSchema'):
            visit(schema.get(word), resolver, context)
        items_context = 'empty_items' if schema.get('maxItems') == 0 and context == 'reachable' else context
        visit(schema.get('items'), resolver, items_context)
        for word in ('allOf', 'prefixItems', 'anyOf', 'oneOf'):
            for child in schema.get(word, []):
                visit(child, resolver, context)
        visit(schema.get('if'), resolver, 'if' if context == 'reachable' else context)
        visit(schema.get('not'), resolver, 'not' if context == 'reachable' else context)

    visit(v.schema, v._resolver, 'reachable')
    return found, info


def roots(suite, key):
    registry = suite.registry
    return {
        'payload': suite.payloads[key],
        'history_answer': suite.answers[key],
        'event_record': common.validator(common.load(ER_SCHEMA), registry),
        'read_token': common.validator({'$ref': common.load(CKPT_SCHEMA)['$id'] + '#/$defs/read_token'}, registry),
        'custody_reader': suite.custody,
    }


def checker_rows(key):
    """Family-specific checker row names written in the two base checkers."""
    family = FAMILIES[key][0]
    history = (ROOT / 'scripts/pm_goal_history_reader_fixtures.py').read_text()
    block = re.search(r"elif f=='" + re.escape(family) + r"':\n(.*?)(?=\n elif f==|\ndef )", history, re.S)
    names = set(re.findall(r"g\.require\('([^']+)'", block.group(1))) if block else set()
    own_d = (ROOT / 'scripts/pm_goal_own_d_oracles.py').read_text()
    provenance = re.search(r"'" + key + r"': \{([^}]*)\}", own_d)
    fields = re.findall(r"'([a-z_]+)'", provenance.group(1)) if provenance else []
    if fields:
        names.add(key + '/provenance_members')
    if key == 'evidence_captured':
        names |= {'evidence/content_hash', 'evidence/source_line_bounds'}
        names |= {'evidence/original/' + f for f in ('evidence_ref', 'source_spans', 'currentness_state', 'redaction_profile')}
    if key in ('stopped', 'tool_check_recorded'):
        names |= {key + '/original/' + f for f in fields}
    return sorted(names), dict(history_block=bool(block), provenance_fields=fields)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('matrix', type=Path)
    parser.add_argument('--ledger', type=Path, required=True, help='the proof run ledger.json.gz the matrix was built from')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    matrix = json.loads(args.matrix.read_text())
    # Kill kind per (family, row), from the uncapped ledger: a KILLED record
    # whose declared target is the row alone, a KILLED tuple target (one
    # registered duplicate group, judged by its joint cut), or a
    # DUPLICATE_SET_KILLED tuple target.
    kinds = collections.defaultdict(dict)
    for record in json.load(gzip.open(args.ledger, 'rt')):
        kill = record.get('kill')
        if kill not in ('KILLED', 'DUPLICATE_SET_KILLED') or record.get('valid') is True:
            continue
        target = record['target']
        if isinstance(target, str):
            kind, names = ('single', [target]) if kill == 'KILLED' else (None, [])
        else:
            kind, names = ('group' if kill == 'KILLED' else 'set'), list(target)
        for name in names:
            kinds[record['family']].setdefault(name, {}).setdefault(kind, dict(label=record['label'],
                input_sha256=record['input_sha256'], target=target, site_cuts=record.get('site_cuts')))
    suite = d.ReaderOracles()
    out = dict(schema_id='pm.pnc019.c12_gh2.schema_closure.v1',
               matrix=str(args.matrix), matrix_sha256=hashlib.sha256(args.matrix.read_bytes()).hexdigest(),
               ledger=str(args.ledger), ledger_sha256=hashlib.sha256(args.ledger.read_bytes()).hexdigest(),
               rule='Every reachable owner assertion clause of every root a family validates is KILLED, '
                    'DUPLICATE_SET_KILLED or COVERED_BY_PROOF (named covering clauses closed in the family); '
                    'clauses inside if/not, VACUOUS bounds and UNREACHABLE empty-array item types are listed apart. '
                    'Two independent reachability walks must agree.',
               code=dict(tool='scripts/pm_goal_c12_gh2_closure.py',
                         tool_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                         common_sha256=hashlib.sha256((ROOT / 'scripts/pm_goal_oracle_common.py').read_bytes()).hexdigest()),
               families={})
    for key in GH2:
        family = FAMILIES[key][0]
        fam = matrix['families'][family]
        by_row = {m['row']: m for m in fam['matrix']}
        family_schema_rows = {m['row'] for m in fam['matrix'] if m['row'].startswith('schema/')}
        attributed = set()
        root_out = {}
        totals = collections.Counter()
        distinct = {}
        for name, v in roots(suite, key).items():
            common.schema_type_inventory(v)
            inventory = set(common._SCHEMA_VALIDATOR_ASSERTIONS[id(v)])
            inactive = set(common._SCHEMA_INACTIVE_TYPES) & set(common._SCHEMA_VALIDATOR_GUARDS[id(v)])
            found, info = walk(v)
            reachable = {g for g, contexts in found.items() if 'reachable' in contexts}
            empty = {g for g, contexts in found.items() if contexts == {'empty_items'}}
            apart_if = {g for g, contexts in found.items() if 'reachable' not in contexts and 'if' in contexts}
            apart_not = {g for g, contexts in found.items() if 'reachable' not in contexts and 'not' in contexts}
            reachable -= empty
            clauses = []
            counts = collections.Counter()
            for guard in sorted(reachable | inventory):
                meta = info.get(guard) or common._SCHEMA_ASSERTION_INFO.get(guard, {})
                row = by_row.get(guard)
                entry = dict(guard=guard, location=meta.get('location'), keyword=meta.get('keyword'))
                if meta.get('shared_profile'):
                    entry['shared_profile'] = meta['shared_profile']
                if guard not in inventory:
                    entry.update(cls='UNCOVERED', reason='reached by the independent walk, not inventoried as a row')
                elif guard not in reachable:
                    entry.update(cls='UNCOVERED', reason='inventoried row the independent walk does not reach')
                elif row is None:
                    entry.update(cls='UNCOVERED', reason='inventoried but never evaluated by this family')
                elif meta.get('keyword') in VACUOUS and meta.get('value') == 0 and row['status'] == 'OPEN':
                    entry.update(cls='VACUOUS', reason='bound of 0 refuses nothing')
                elif row['status'] == 'CLOSED':
                    kind = kinds[family].get(guard, {})
                    choice = next((k for k in ('single', 'group', 'set') if k in kind), None)
                    if choice is None:
                        entry.update(cls='UNCOVERED', reason='matrix CLOSED but no kill record in the ledger')
                    else:
                        witness = kind[choice]
                        entry.update(cls={'single': 'KILLED', 'group': 'DUPLICATE_GROUP_KILLED',
                                          'set': 'DUPLICATE_SET_KILLED'}[choice],
                                     witness=witness['label'], witness_sha256=witness['input_sha256'],
                                     target=witness['target'], site_cuts=witness['site_cuts'],
                                     table=row['predicate']['table'], gated=row['predicate']['gated'])
                        if choice != 'single':
                            # With this clause alone cut, a named peer site still refuses.
                            entry['named'] = sorted(set(witness['target']) - {guard})
                elif row['status'] == 'CLOSED_BY_PROOF':
                    proof = row['proof'] or {}
                    named = proof.get('earlier_guards') or [proof.get('earlier_guard')]
                    entry.update(cls='COVERED_BY_PROOF', basis=proof.get('kind'), named=named,
                                 named_status={n: by_row.get(n, {}).get('status', 'NOT_IN_FAMILY') for n in named})
                    if any(by_row.get(n, {}).get('status') not in ('CLOSED', 'CLOSED_BY_PROOF') for n in named):
                        entry.update(cls='UNCOVERED', reason='a named covering clause is not closed in this family')
                else:
                    entry.update(cls='UNCOVERED', reason=row.get('reason'))
                # Lane GC's closure class: a joint-cut or proof-covered clause is
                # COVERED_LATER with its named clause(s), never a single-row kill.
                entry['gc_class'] = {'KILLED': 'KILLED', 'DUPLICATE_GROUP_KILLED': 'COVERED_LATER',
                                     'DUPLICATE_SET_KILLED': 'COVERED_LATER', 'COVERED_BY_PROOF': 'COVERED_LATER',
                                     'VACUOUS': 'VACUOUS'}.get(entry['cls'], 'UNCOVERED')
                counts[entry['cls']] += 1
                counts['gc:' + entry['gc_class']] += 1
                clauses.append(entry)
                distinct.setdefault(guard, entry['cls'])
            for guard in sorted(inactive | empty):
                clauses.append(dict(guard=guard, location=(info.get(guard) or {}).get('location'),
                                    keyword='type', cls='UNREACHABLE',
                                    proof=common._SCHEMA_INACTIVE_TYPES.get(guard, {}).get('proof',
                                          'item clause of an array whose owner node has maxItems 0')))
                counts['UNREACHABLE'] += 1
            counts['apart_if'] = len(apart_if)
            counts['apart_not'] = len(apart_not)
            attributed |= reachable | inventory
            totals.update(counts)
            root_out[name] = dict(root=v.schema.get('$ref') or v.schema.get('$id'), counts=dict(counts),
                                  walks_agree=reachable == inventory - inactive,
                                  apart=dict(if_selectors=sorted(apart_if), not_subschemas=sorted(apart_not)),
                                  clauses=clauses)
        unattributed = sorted(family_schema_rows - attributed)
        rows, meta = checker_rows(key)
        missing_checker_rows = [r for r in rows if r not in by_row]
        open_checker_rows = [r for r in rows if r in by_row and by_row[r]['status'] not in ('CLOSED', 'CLOSED_BY_PROOF')]
        distinct_counts = collections.Counter(distinct.values())
        out['families'][family] = dict(
            roots=root_out, occurrences=dict(totals), distinct=dict(distinct_counts),
            uncovered=totals.get('UNCOVERED', 0), unattributed_schema_rows=unattributed,
            family_schema_rows=len(family_schema_rows),
            checker_rows=dict(source_rows=rows, missing_from_matrix=missing_checker_rows,
                              not_closed=open_checker_rows, **meta))
    args.out.write_text(json.dumps(out, indent=1, default=list) + '\n')
    summary = {f: dict(occurrences=v['occurrences'], distinct=v['distinct'], uncovered=v['uncovered'],
                       unattributed=len(v['unattributed_schema_rows']),
                       walks_agree=all(r['walks_agree'] for r in v['roots'].values()),
                       checker_rows=len(v['checker_rows']['source_rows']),
                       checker_missing=v['checker_rows']['missing_from_matrix'] + v['checker_rows']['not_closed'])
               for f, v in out['families'].items()}
    print(json.dumps(summary, indent=1))
    bad = any(s['uncovered'] or s['unattributed'] or not s['walks_agree'] or s['checker_missing'] for s in summary.values())
    return int(bad)


if __name__ == '__main__':
    raise SystemExit(main())
