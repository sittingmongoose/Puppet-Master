#!/usr/bin/env python3
"""Check all 299 merge-2 families' current retention ranges; do not re-grade."""
import argparse
from collections import Counter
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import subprocess
import re

from pm_ea_retention_citations import ROOT, missing_facets, range_text, complete_range

FOLDER = 'reports/event-authority-20261116/admission-merge-2'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--revision')
    p.add_argument('--output', type=Path)
    p.add_argument('--self-test', action='store_true')
    p.add_argument('--strict-citations', action='store_true', help='diagnostic only: require every secondary citation to repeat all values')
    p.add_argument('--plan', action='store_true', help='report possible same-unit expansions without writing')
    args = p.parse_args()
    @lru_cache(maxsize=2048)
    def read(path):
        return subprocess.check_output(['git', '-C', str(ROOT), 'show', args.revision+':'+path]).decode() if args.revision else (ROOT/path).read_text()
    load = lambda path: json.loads(read(path))
    ready = {x['event_type']:x for name in ('readiness-list.json', 'usage-readiness-list.json') for x in load(FOLDER+'/'+name)['ready']}
    assert len(ready) == 299
    rows = {x['event_type']:x for x in load('Plans/event_family_registry.json')['families']}
    policies = {x['policy_id']:x for x in load('Plans/storage_value_registry.json')['retention_policies']}
    findings, checks, mutations, families = [], [], [], []
    for event, prepared in sorted(ready.items()):
        cell = load(FOLDER+'/depth/'+event+'.json')['rows'][0]['cells']['retention']
        union = []
        for ordinal, item in enumerate(cell['evidence']):
            try:
                body = range_text(item, read)
                missing = missing_facets(body, rows[event], policies)
            except (ValueError, KeyError) as exc:
                body, missing = '', [str(exc)]
            result = dict(event_type=event, lane=prepared['lane'], ordinal=ordinal,
                path=item['path'], unit=item.get('unit'), missing=missing)
            if args.plan and missing:
                result['same_unit_replacement'] = complete_range(item, rows[event], policies, read)
            checks.append(result)
            if body:
                union.append(body)
            if missing and args.strict_citations:
                findings.append(result)
            elif args.self_test and args.strict_citations and not missing:
                for facet in ('policy', 'anchor', 'count'):
                    # Real current proof minus one required binding value.
                    changed = body
                    for binding in __import__('pm_ea_retention_citations').selections(rows[event]).values():
                        policy = policies.get(binding.get('policy_id'), {})
                        tokens = {'policy':[binding.get('policy_id', binding.get('setting_key'))],
                            'anchor':[policy.get('anchor_kind', binding.get('anchor'))],
                            'count':[str(policy.get('max_cardinality')) if policy.get('max_cardinality') is not None else 'cardinality_scope', 'Server counterpart', 'Project partition', 'no count eviction', 'indefinite']}[facet]
                        for token in tokens:
                            if token:
                                changed = __import__('re').sub(__import__('re').escape(token), 'REMOVED_BINDING', changed, flags=__import__('re').I)
                    killed = bool(missing_facets(changed, rows[event], policies))
                    mutations.append(dict(event_type=event, ordinal=ordinal, facet=facet, killed=killed))
                    if not killed:
                        findings.append(dict(event_type=event, lane=prepared['lane'], ordinal=ordinal, missing=['mutation survived: '+facet]))
        if not args.strict_citations:
            row = rows[event]
            from pm_ea_retention_citations import union_missing
            gaps, bindings = union_missing(union, row, policies)
            families.append(dict(event_type=event, lane=prepared['lane'], bindings=bindings, missing=gaps))
            if gaps:
                findings.append(dict(event_type=event, lane=prepared['lane'], missing=gaps))
            elif args.self_test:
                for scope, binding in __import__('pm_ea_retention_citations').selections(row).items():
                    token = binding.get('policy_id', binding.get('setting_key'))
                    mutated = [body.replace(token, 'REMOVED_POLICY_BINDING') for body in union]
                    killed = bool(union_missing(mutated, row, policies)[0])
                    mutations.append(dict(event_type=event, scope=scope, mutation='remove selected policy from all current witnesses', killed=killed))
                    if not killed:
                        findings.append(dict(event_type=event, lane=prepared['lane'], missing=['policy-removal mutation survived']))
    result = dict(schema_id='pm.ea.retention_citation_check.v1', input_revision=args.revision or 'working_tree',
        script_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        families=len(ready), citations=len(checks), strict_diagnostic=args.strict_citations, findings=findings, checks=checks, family_checks=families, mutations=mutations,
        by_lane=dict(Counter(x['lane'] for x in findings)))
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps(dict(families=len(ready), citations=len(checks), failures=len(findings), affected_families=len({x['event_type'] for x in findings}))))
    return int(bool(findings))


if __name__ == '__main__':
    raise SystemExit(main())
