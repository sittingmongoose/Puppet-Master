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
from unittest.mock import patch

import pm_ea_retention_citations as retention
from pm_ea_retention_citations import (
    ROOT, DT_SERVER_COUNT, GITHUB_SIGN_IN, complete_range,
    missing_facets, range_text, selections, union_missing, without_scope_claims,
)

FOLDER = 'reports/event-authority-20261116/admission-merge-2'


def check_received_effective_counts(ready, rows, policies, read):
    source = '5a5392ecf8ca34c79db7cd3ddd303d751e4c8601'
    recheck_source = 'd40290457bdba327929cb21ac0f7de55131971b7'
    safe_points = {'safe_point.created', 'safe_point.restored'}

    @lru_cache(maxsize=32)
    def received(revision, path):
        return subprocess.check_output(['git', '-C', str(ROOT), 'show', revision+':'+path]).decode()

    def cited_union(event, read_edition):
        assessment = json.loads(read_edition(f'{FOLDER}/depth/{event}.json'))
        return [range_text(item, read_edition) for item in assessment['rows'][0]['cells']['retention']['evidence']]

    gap = 'application:effective_count'
    required_families = GITHUB_SIGN_IN | DT_SERVER_COUNT | safe_points
    revisions = {event: recheck_source if event in safe_points else source for event in required_families}
    original = {
        event: cited_union(event, lambda path: received(revisions[event], path))
        for event in sorted(required_families)
    }
    regressions, findings, mutations = [], [], []
    for event, union in original.items():
        missing, _ = union_missing(union, rows[event], policies)
        regressions.append(dict(event_type=event, source_commit=revisions[event], missing=missing, killed=missing == [gap]))
        if missing != [gap]:
            findings.append(dict(event_type=event, lane=ready[event]['lane'],
                missing=['received union did not isolate the Application count gap'], actual=missing))

    # Removing the new requirement must make the standing negatives fail.
    with patch.object(retention, 'effective_count_missing', return_value=False):
        falsely_credited = [
            event for event, union in original.items() if not union_missing(union, rows[event], policies)[0]
        ]
    killed = set(falsely_credited) == required_families and all(case['killed'] for case in regressions)
    mutations.append(dict(event_type='shared', mutation='drop the effective count evidence requirement',
        falsely_credited=falsely_credited, killed=killed))
    if not killed:
        findings.append(dict(event_type='shared', lane='shared', missing=['effective count requirement mutation survived']))

    backup_event = 'backup.state_changed'
    backup_union = cited_union(backup_event, read)
    backup_allowance = [body for body in backup_union if 'app:operational_security' in body]
    for event in sorted(GITHUB_SIGN_IN):
        current = cited_union(event, read)
        controls = [
            ('remove the assignment to the GitHub allowance', [
                body.replace('counts in `app:github_sign_in`', 'REMOVED_GITHUB_ASSIGNMENT') for body in current
            ]),
            ('remove the shared cap', [body.replace(
                'Each application-wide bucket retains at most 2,000,000 records', 'REMOVED_SHARED_CAP',
            ) for body in current]),
            ('substitute the backup operational security allowance', original[event] + backup_allowance),
        ]
        for name, candidate in controls:
            missing, _ = union_missing(candidate, rows[event], policies)
            killed = missing == [gap] and bool(backup_allowance)
            mutations.append(dict(event_type=event, mutation=name, killed=killed))
            if not killed:
                findings.append(dict(event_type=event, lane=ready[event]['lane'],
                    missing=['effective count mutation survived: '+name], actual=missing))
    storage = read('Plans/storage-plan.md')
    counterpart_rule = next(line for line in storage.splitlines()
        if 'One app Server-wide counterpart bucket per family supplies' in line)
    for event in sorted(DT_SERVER_COUNT):
        current = cited_union(event, read)
        controls = [
            ('substitute the general SP-349 physical counterpart rule', original[event] + [counterpart_rule]),
            ('remove the separate Application cap', [
                body.replace('5,000,000 per Puppet Master Server and Storage instance', 'REMOVED_APPLICATION_CAP')
                for body in current
            ]),
        ]
        for name, candidate in controls:
            missing, _ = union_missing(candidate, rows[event], policies)
            killed = missing == [gap]
            mutations.append(dict(event_type=event, mutation=name, killed=killed))
            if not killed:
                findings.append(dict(event_type=event, lane=ready[event]['lane'],
                    missing=['effective count mutation survived: '+name], actual=missing))
    for event in sorted(safe_points):
        current = cited_union(event, read)
        sibling = next(iter(safe_points - {event}))
        sibling_rule = [
            body for body in cited_union(sibling, read)
            if 'the Project count applies only when there is a real Project' in body
        ]
        controls = [
            ('remove the real-Project count condition', [
                body.replace('the Project count applies only when there is a real Project', 'REMOVED_PROJECT_CONDITION')
                for body in current
            ]),
            ('substitute the sibling SafePoint count assignment', original[event] + sibling_rule),
        ]
        for name, candidate in controls:
            missing, _ = union_missing(candidate, rows[event], policies)
            killed = missing == [gap] and bool(sibling_rule)
            mutations.append(dict(event_type=event, mutation=name, killed=killed))
            if not killed:
                findings.append(dict(event_type=event, lane=ready[event]['lane'],
                    missing=['effective count mutation survived: '+name], actual=missing))
    return regressions, findings, mutations


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
    reviewed, scope_regressions, count_regressions = [], [], []
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
                    for binding in selections(rows[event]).values():
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
            gaps, bindings = union_missing(union, row, policies)
            families.append(dict(event_type=event, lane=prepared['lane'], bindings=bindings, missing=gaps))
            if gaps:
                findings.append(dict(event_type=event, lane=prepared['lane'], missing=gaps))
            elif args.self_test:
                for scope, binding in selections(row).items():
                    token = binding.get('policy_id', binding.get('setting_key'))
                    mutated = [body.replace(token, 'REMOVED_POLICY_BINDING') for body in union]
                    killed = bool(union_missing(mutated, row, policies)[0])
                    mutations.append(dict(event_type=event, scope=scope, mutation='remove selected policy from all current witnesses', killed=killed))
                    if not killed:
                        findings.append(dict(event_type=event, lane=prepared['lane'], missing=['policy-removal mutation survived']))
                    scoped=without_scope_claims(union,scope)
                    scope_gaps,scope_bindings=union_missing(scoped,row,policies)
                    killed=(scope+':assignment_scope' in scope_gaps and
                            all(x['named_in_current_union'] for x in scope_bindings))
                    mutations.append(dict(event_type=event,scope=scope,
                        mutation='remove EventRecord scope evidence while preserving selected policy',killed=killed))
                    if not killed:findings.append(dict(event_type=event,lane=prepared['lane'],missing=['scope-removal mutation survived']))
    if args.self_test and not args.strict_citations:
        count_regressions, count_findings, count_mutations = check_received_effective_counts(ready, rows, policies, read)
        findings.extend(count_findings)
        mutations.extend(count_mutations)
        baseline='10ba97e699d51287673d6f1db4d994f54c59b4ed'
        @lru_cache(maxsize=64)
        def original(path):
            return subprocess.check_output(['git','-C',str(ROOT),'show',baseline+':'+path]).decode()
        targets={}
        for path in sorted((ROOT/'reports/event-authority-20261116/admission-merge-3/corrections').glob('*.json')):
            correction=json.loads(path.read_text());event=correction['event_type']
            original_depth=json.loads(original(FOLDER+'/depth/'+event+'.json'))
            for changed in correction['citation_changes']:
                old=changed['old'];quote=old.get('quote','')
                if not quote.lstrip().startswith('Current selected assignment') or re.search(r'RP-|ai\.usage\.usage-retention',quote):
                    continue
                ordinal=changed['ordinal'];received=original_depth['rows'][0]['cells']['retention']['evidence'][ordinal]
                if any(old.get(k)!=received.get(k) for k in ('path','unit','quote')):
                    findings.append(dict(event_type=event,lane=ready[event]['lane'],missing=['review regression does not match actual received Git input']))
                    continue
                targets[(event,ordinal)]=old
        for (event,ordinal),old in sorted(targets.items()):
            current_item=load(FOLDER+'/depth/'+event+'.json')['rows'][0]['cells']['retention']['evidence'][ordinal]
            try:body=range_text(current_item,read)
            except ValueError:body=''
            tokens=[x.get('policy_id',x.get('setting_key')) for x in selections(rows[event]).values()]
            repaired=all(token in body for token in tokens)
            # Restore the exact received membership-only witness. It is not
            # retention evidence, even when another witness keeps union credit.
            old_body=range_text(old,original)
            killed=not all(token in old_body for token in tokens)
            reviewed.append(dict(event_type=event,ordinal=ordinal,repaired=repaired,original_range_mutation_killed=killed))
            if not repaired or not killed:
                findings.append(dict(event_type=event,lane=ready[event]['lane'],missing=['reviewed truncated range not repaired or regression survived']))
        if len(targets)!=123:
            findings.append(dict(event_type='shared',lane='shared',missing=['expected all 123 received truncated citations'],count=len(targets)))
        for event in sorted({key[0] for key in targets}):
            old_cell=json.loads(original(FOLDER+'/depth/'+event+'.json'))['rows'][0]['cells']['retention']
            old_bodies=[]
            for item in old_cell['evidence']:
                try:old_bodies.append(range_text(item,original))
                except ValueError:pass
            gaps,_=union_missing(old_bodies,rows[event],policies)
            mutations.append(dict(event_type=event,mutation='restore complete received retention cell',baseline_union_missing=gaps,
                killed=bool(gaps),qualification='Secondary policy evidence may preserve family credit; its reviewed truncated range is still repaired.'))
        union_refusals=sum(bool(x.get('baseline_union_missing')) for x in mutations if x['mutation']=='restore complete received retention cell')
        if union_refusals<81:
            findings.append(dict(event_type='shared',lane='shared',missing=['received whole-cell regressions did not reproduce at least 81 refusals'],count=union_refusals))
        received='20697031603d52f52b3dba3d4d621f909be15e88'
        @lru_cache(maxsize=64)
        def received_read(path):
            return subprocess.check_output(['git','-C',str(ROOT),'show',received+':'+path]).decode()
        required={'config.validation.failed','parser.error','phase.force_completed'} | {
            event for event in ready if event.startswith('runtime_artifact.')}
        if len(required)!=22:findings.append(dict(event_type='shared',lane='shared',missing=['received scope regression population differs'],count=len(required)))
        for event in sorted(ready):
            old=__import__('json').loads(received_read(FOLDER+'/depth/'+event+'.json'))['rows'][0]['cells']['retention']
            old_union=[range_text(item,received_read) for item in old['evidence']]
            gaps,_=union_missing(old_union,rows[event],policies)
            if event in required or any(x.endswith(':assignment_scope') for x in gaps):
                refused=any(x.endswith(':assignment_scope') for x in gaps)
                scope_regressions.append(dict(event_type=event,source_commit=received,missing=gaps,
                    required_review_regression=event in required,killed=refused))
                if not refused:findings.append(dict(event_type=event,lane=ready[event]['lane'],missing=['received unscoped union was credited']))
    result = dict(schema_id='pm.ea.retention_citation_check.v1', input_revision=args.revision or 'working_tree',
        script_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        families=len(ready), citations=len(checks), strict_diagnostic=args.strict_citations, findings=findings, checks=checks, family_checks=families, mutations=mutations, reviewed_range_regressions=reviewed,scope_regressions=scope_regressions,
        effective_count_regressions=count_regressions, by_lane=dict(Counter(x['lane'] for x in findings)))
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps(dict(families=len(ready), citations=len(checks), failures=len(findings), affected_families=len({x['event_type'] for x in findings}))))
    return int(bool(findings))


if __name__ == '__main__':
    raise SystemExit(main())
