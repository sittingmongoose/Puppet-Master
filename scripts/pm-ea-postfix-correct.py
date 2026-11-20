#!/usr/bin/env python3
"""Prepare/apply one-family corrections for the post-landing MERGE3 findings.

No admission or verdict changes. Every application has its own correction DL,
registry checkpoint, immutable Git predecessor and DL-077 revision witness.
The command commits only explicit paths; derived files are regenerated.
"""
import argparse
import copy
from functools import lru_cache
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

import yaml

from pm_ea_admission_rows import Gap
from pm_ea_postfix_corrections import (AUTHORITY, DIRECTORY, RECORDS, REGISTRY,
    canonical, corrected_row, git_bytes, pin, rendered, sha)
from pm_ea_retention_citations import ROOT, assignment_range, union_range, range_text, union_missing, selections

FOLDER = 'reports/event-authority-20261116/admission-merge-2'
REVIEW = Path('/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/MERGE2-POSTLAND-astra62max')
DL = 'Plans/Decision_Log.md'


def run(*args):
    return subprocess.check_output(list(args), cwd=ROOT, text=True).strip()


@lru_cache(maxsize=64)
def read(path):
    return (ROOT/path).read_text()


def load(path):
    return json.loads(read(path))


def write(path, value, indent=1):
    path = ROOT/path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=indent, ensure_ascii=False)+'\n')


@lru_cache(maxsize=1)
def writer():
    spec = importlib.util.spec_from_file_location('postfix_correction_writer', ROOT/'scripts/pm-ea-admission-writer.py')
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


def prepare(previous=None):
    registry = load(REGISTRY)
    rows = {x['event_type']:x for x in registry['families']}
    policies = {x['policy_id']:x for x in load('Plans/storage_value_registry.json')['retention_policies']}
    ready = {x['event_type']:x for name in ('readiness-list.json', 'usage-readiness-list.json') for x in load(FOLDER+'/'+name)['ready']}
    review = json.loads((REVIEW/'family-verdicts.json').read_text())
    named = {x['event_type']:set(x['real_findings']) for x in review if x['real_findings']}
    citations = json.loads((REVIEW/'evidence/retention-citations.json').read_text())['all_affected_citations']
    ordinals = {}
    for item in citations:
        ordinals.setdefault(item['event_type'], set()).add(item['ordinal'])
        named.setdefault(item['event_type'], set()).add(4)
    failures, replacements, diagnostics = [], {}, []
    for event in sorted(ready):
        row = rows[event]
        depth = load(FOLDER+'/depth/'+event+'.json')
        evidence = depth['rows'][0]['cells']['retention']['evidence']
        bodies = []
        for item in evidence:
            try:
                bodies.append(range_text(item, read))
            except (ValueError, KeyError):
                # PROSE can move an unchanged quotation. Mechanically relocate
                # it inside its original unit before judging meaning; offset
                # drift is later citation maintenance, not a new family repair.
                current = item.get('current_citation', item)
                try:
                    relocated = writer().refresh_evidence(current,event_type=event)
                    bodies.append(range_text(relocated,read))
                except (ValueError, KeyError, Gap):
                    pass
        gaps, _ = union_missing(bodies, row, policies)
        if gaps:
            named.setdefault(event, set()).add(4)
            diagnostics.append(dict(event_type=event, missing=gaps))
        needed = set(ordinals.get(event, set()))
        if gaps:
            needed.add(0)
        if event in ('run.background_enqueued', 'tool.execution_started', 'tool.execution_completed'):
            needed.add(1)
            named.setdefault(event, set()).add(4)
        if event in ('crew.board_message_posted', 'crew.board_message_read', 'crew.board_messages_archived', 'filesafe.policy_degraded'):
            needed.update(range(len(evidence)))
        planned = []
        for ordinal in sorted(needed):
            item = evidence[ordinal]
            replacement = union_range(item, row, policies, read)
            reason = 'Complete current wrapped assignment inside its original unit.'
            if replacement is None or union_missing([replacement['quote']], row, policies)[0]:
                # Re-cite an existing named per-family Storage owner; never
                # search a sibling to make an old quotation appear present.
                candidates = [ref for ref in row['source_refs'] if ref.startswith('Plans/storage-plan.md#')]
                candidates += [row['payload_owner_doc'], row['semantic_owner_doc']]
                replacement = None
                for ref in dict.fromkeys(candidates):
                    path, unit = ref.split('#', 1)
                    candidate = union_range(dict(path=path, unit=unit), row, policies, read)
                    if candidate and not union_missing([candidate['quote']], row, policies)[0]:
                        replacement = candidate
                        reason = 'Re-cite the exact existing per-family owner assignment; the old evidence is retained at the Git predecessor.'
                        break
            if replacement is None:
                failures.append(dict(event_type=event, ordinal=ordinal, reason='No current canonical assignment establishes the selected policy/scopes.'))
            else:
                planned.append(dict(ordinal=ordinal, old=copy.deepcopy(item), replacement=replacement, reason=reason))
        if planned:
            replacements[event] = planned
    families = []
    prior = json.loads(previous.read_text()) if previous else None
    prior_ids = {f['event_type']:f.get('decision',2451+i) for i,f in enumerate(prior['families'])} if prior else {}
    order = ([f['event_type'] for f in prior['families']] if prior else [])
    order += sorted(set(named)-set(order))
    next_id = max(prior_ids.values(), default=2450)+1
    for event in order:
        findings = named.get(event, set())
        if not findings:
            findings = set(next(f['findings'] for f in prior['families'] if f['event_type']==event))
        decision = prior_ids.get(event)
        if decision is None:
            decision=next_id;next_id+=1
        families.append(dict(event_type=event, lane=ready[event]['lane'], decision=decision, findings=sorted(findings),
            expected_row=corrected_row(rows[event], ROOT), citations=replacements.get(event, [])))
    return dict(schema_id='pm.ea.postfix_correction_plan.v1', base=run('git','rev-parse','HEAD'),
        review=str(REVIEW/'REVIEW.md'), review_sha256=sha((REVIEW/'REVIEW.md').read_bytes()),
        citation_input_sha256=sha((REVIEW/'evidence/retention-citations.json').read_bytes()),
        families=families, hold=failures, additional_union_findings=diagnostics)


def decision_entry(number, event, row, before, after, record, depth_path, depth_sha, revision_path, findings, review):
    versions = row.get('payload_versions') or [dict(scope_kind=row['scope_policy'].removesuffix('_only'),
        payload_schema_id=row['payload_schema_id'], retention_policy_ref=row['retention_policy_ref'],
        producer_admission=row.get('producer_admission', 'requires_owner_adoption'))]
    editions = []
    for version in versions:
        policy = version['retention_policy_ref']
        label = policy['policy_id']+'@'+policy['policy_version'] if policy.get('policy_id') else policy['setting_key']
        editions.append(version['scope_kind']+' `'+version['payload_schema_id']+'` ('+label+', producer '+version['producer_admission']+')')
    original = record.get('original_admission_decision_ref', record['decision_ref'])
    text = (f'Correction for {event} only, under DL-077 and DL-400, resolving post-landing Astra finding(s) {findings}. '
        f'The original admission authority remains {original}; this entry records no new admission, verdict, policy choice or producer adoption. '
        f'Current row canonical SHA-256 {canonical(row)}. Its scope is {row["scope_policy"]}. Payload editions: '+ '; '.join(editions)+'.\n\n'
        f'The correction moves the full registry from {before["revision"]}, {before["family_count"]} families, SHA-256 {before["sha256"]}, '
        f'to {after["revision"]}, {after["family_count"]} families, SHA-256 {after["sha256"]}, without changing another family. '
        f'Revision witness: {revision_path}. Depth assessment: {depth_path}, SHA-256 {depth_sha}.\n\n'
        f'The original append checkpoints are preserved: before {record["registry_before"]["revision"]} SHA-256 {record["registry_before"]["sha256"]}; '
        f'after {record["registry_after"]["revision"]} SHA-256 {record["registry_after"]["sha256"]}. '
        f'Existing semantic owner {row["semantic_owner_doc"]}, payload owner {row["payload_owner_doc"]}, resource '
        f'{row["payload_schema_ref"]["path"]}{row["payload_schema_ref"]["json_pointer"]} retain their contracts. '
        'Current citations were re-read from existing canonical text; original citations, records and decision entries remain in the named Git predecessor. '
        'Native execution remains NOT_RUN. Required producer adoption, permissions, original custody and receipt/publication fences remain required.')
    data = dict(plan_unit_id=number, unit_type='decision', status='accepted', owner_doc=DL,
        canonical_text=text, gui_related=False, gui_classification_reason='Maintains one existing event admission and its evidence.',
        depends_on=['DL-077','DL-400',original.split('#')[1]], unblocks=[],
        acceptance_criteria=['Exactly one family is corrected and the original append checkpoints remain authenticated.',
            'The correction witness and current DL-077 record match their named Git editions.'],
        validation_surfaces=['python3 scripts/pm-ea-record-chain.py', 'python3 scripts/pm-ea-postfix-check.py',
            'python3 scripts/pm-ea-retention-citation-check.py'], risk_class='event_authority_admission',
        reasoning_tier='high', context_scope='event_authority_pnc019_merge3_postfix',
        implementation_surfaces=[REGISTRY], node_compile_hint=dict(mode='owner_contract_only',create_worknodes=False,create_nodeseeds=False),
        source_lineage=[review, original]+(['Plans/Decision_Log.md#DL-2450'] if 6 in findings else []), preserved_exact_tokens=[event,canonical(row),before['revision'],after['revision']],
        negative_constraints=['No new admission, producer adoption, native execution claim or governance seal.'])
    return '### '+number+': Event Authority corrects '+event+' (merge 3 post-landing)\n\n```yaml\n'+yaml.safe_dump(data, sort_keys=False, allow_unicode=True, width=120)+'```\n\n'


def owner_summary(body, event, assignment, findings, storage_policy=None):
    """Complete the same family's existing summary and event-policy clause."""
    if 3 in findings:
        pattern=r'(Current selected assignment \(2026-11-19\): '+re.escape(event)+r'@[^ ]+ is registered for )project_only(.*?Its event history selects )([^;]+);'
        new=re.sub(pattern,lambda m:m[1]+'application_or_project'+m[2]+assignment+';',body,flags=re.S)
        if storage_policy:
            old='Event history `retention_policy_ref = '+storage_policy+'`, under Plans/Decision_Log.md#DL-401.'
            explicit='Event history: Application = `'+storage_policy+'`, Project = `'+storage_policy+'`, under Plans/Decision_Log.md#DL-401.'
            new=new.replace(old,explicit)
        return new
    old_assignment='Application = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project), Project = RP-OPERATIONAL-2555D@1.0.0 (anchor_kind=terminal_transition, cardinality_scope=project)'
    pattern=r'(Current selected assignment \(2026-11-19\): '+re.escape(event)+r'@[^ ]+ is registered for application_or_project.*?Its event history selects )'+re.escape(old_assignment)+';'
    return re.sub(pattern,lambda m:m[1]+assignment+';',body,flags=re.S)


def apply_one(plan, event, decision):
    if run('git','status','--porcelain'):
        raise ValueError('application requires a clean tree')
    family = next(x for x in plan['families'] if x['event_type'] == event)
    if family.get('decision', decision) != decision:
        raise ValueError('decision differs from stable prepared family allocation')
    if any(x['event_type'] == event for x in plan['hold']):
        raise ValueError('family has an unresolved retention witness')
    if event == 'filesafe.policy_degraded' and 'plan_unit_id: DL-2450' not in read(DL):
        raise ValueError('FileSafe waits for the signed Storage binding integration')
    source = run('git','rev-parse','HEAD')
    changed_owners = set()
    number = 'DL-'+str(decision)
    if decision < 2451 or re.search(r'(?m)^plan_unit_id: '+number+r'$', read(DL)):
        raise ValueError('decision id reserved or already used')
    registry_raw = (ROOT/REGISTRY).read_bytes()
    registry = json.loads(registry_raw)
    at = next(i for i,x in enumerate(registry['families']) if x['event_type'] == event)
    before_row = copy.deepcopy(registry['families'][at])
    row = corrected_row(before_row, ROOT)
    if row != family['expected_row']:
        raise ValueError('owner-derived row changed since correction preparation')
    before = pin(registry_raw)
    registry['registry_revision'] = '2026-11-19.'+str(decision-2450)
    registry['families'][at] = row
    after_raw = rendered(registry)
    after = pin(after_raw)
    path = RECORDS+'/'+event+'.json'
    old_record_raw = (ROOT/path).read_bytes()
    record = json.loads(old_record_raw)
    depth_path = record['depth_assessment']['path']
    old_depth = (ROOT/depth_path).read_bytes()
    depth = json.loads(old_depth)
    if 3 in family['findings'] or 6 in family['findings']:
        # Correct the two incomplete current summaries in their own existing
        # owners. The producer contract and adoption fence are unchanged.
        spec = importlib.util.spec_from_file_location('postfix_scope_formatter',ROOT/'scripts/pm-ea-owner-sweep.py')
        formatter = importlib.util.module_from_spec(spec);spec.loader.exec_module(formatter)
        policies={p['policy_id']:p for p in load('Plans/storage_value_registry.json')['retention_policies']}
        assignment=formatter.scope_assignment(row,policies)
        if 3 in family['findings']:
            panel=next(p for p in load('Plans/panel_event_contracts/manifest.json')['families'] if p['event_type']==event)
            refs={row['semantic_owner_doc'],row['payload_owner_doc'],'Plans/storage-plan.md#'+panel['sp'],
                'Plans/Automated_Testing_System.md#'+panel['ats']}
        else:
            refs={'Plans/storage-plan.md#SP-556','Plans/Contracts_V0.md#CV-556','Plans/Automated_Testing_System.md#ATS-278'}
        w=writer()
        edits={}
        for ref in refs:
            owner_path,unit=ref.split('#',1)
            text=read(owner_path);start,end=w.unit_span(text,unit);lines=text.splitlines(keepends=True)
            body=''.join(lines[start-1:end])
            policy=row['retention_policy_ref']
            storage_policy=(policy['policy_id']+'@'+policy['policy_version']
                if 3 in family['findings'] and owner_path=='Plans/storage-plan.md' else None)
            new=owner_summary(body,event,assignment,family['findings'],storage_policy)
            if new!=body:
                edits.setdefault(owner_path,[]).append((start,end,new))
        for owner_path,updates in edits.items():
            lines=read(owner_path).splitlines(keepends=True)
            for start,end,new in sorted(updates,reverse=True):lines[start-1:end]=[new]
            (ROOT/owner_path).write_text(''.join(lines));changed_owners.add(owner_path)
        read.cache_clear()
    cells = depth['rows'][0]['cells']
    for replacement in family['citations']:
        ordinal = replacement['ordinal']
        current = cells['retention']['evidence'][ordinal]
        old = copy.deepcopy(current)
        new = union_range(replacement['replacement'], row, {p['policy_id']:p for p in load('Plans/storage_value_registry.json')['retention_policies']}, read)
        if new is None:
            raise ValueError('prepared assignment no longer resolves in its exact unit')
        new['file_sha256'] = sha((ROOT/new['path']).read_bytes())
        # The received current citations are exact at the reviewed landing,
        # before the PROSE changes. Keep that actual edition, not this family's
        # later parent, as their historical canonical source.
        old['commit'] = '10ba97e699d51287673d6f1db4d994f54c59b4ed'
        w = writer()
        if old['path'].endswith('.py'):
            import ast
            original = w.historical_text(old['commit'],old['path'])
            line = old.get('line_start',old.get('line'))
            functions = [node for node in ast.walk(ast.parse(original)) if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)) and node.lineno <= line <= node.end_lineno]
            if not functions:
                raise ValueError('historical script quote has no containing function')
            function = min(functions,key=lambda node:node.end_lineno-node.lineno)
            old['received_unit'] = old.get('unit')
            old['unit'] = 'python:function:'+function.name
            old['locator_maintenance'] = dict(authority=AUTHORITY,reason='Bind the historical script line to its actual declared function, preserving the received stage label and exact Git bytes; it no longer supplies current retention credit.')
        elif old['path'].endswith('.json'):
            from pm_ea_evidence_projection import pointer_text
            original = w.historical_text(old['commit'],old['path'])
            document = json.loads(original)
            pointer = '#/retention_policy_ref'
            if document.get('event_type') != event or pointer_text(original,pointer).count(old['quote']) != 1:
                raise ValueError('historical retention member does not name its exact family')
            old['received_unit'] = old.get('unit')
            old.update(unit=pointer,json_pointer=pointer,subject_event_type=event)
            old['locator_maintenance'] = dict(authority=AUTHORITY,reason='Bind the received owner label to the exact retention_policy_ref member of its single-family JSON source; retain the original label and Git bytes as lineage, without whole-document fallback.')
        old = w.rederive_source_citation(old)
        new['source_citation'] = old
        new['retention_range_maintenance'] = dict(authority=AUTHORITY, source_commit=source,
            old_quote=old.get('quote'), old_path=old['path'], old_unit=old.get('unit'),
            old_line_start=old.get('line_start'), reason=replacement['reason'])
        cells['retention']['evidence'][ordinal] = new
    # Registry membership and scope are current evidence, while the source
    # assessment itself remains authenticated at the immutable predecessor.
    cells['membership_version']['finding'] = f'Currently registered at {after["revision"]} as #/families/{at}, canonical row SHA-256 {canonical(row)}. Original one-family append checkpoints remain preserved.'
    if 3 in family['findings']:
        old_scope = copy.deepcopy(cells['scope_identity'])
        panel = next(p for p in load('Plans/panel_event_contracts/manifest.json')['families'] if p['event_type']==event)
        owner = 'Plans/storage-plan.md#'+panel['sp']
        body = read(owner.split('#')[0])
        w = writer()
        start,end = w.unit_span(body, owner.split('#')[1])
        cells['scope_identity'] = dict(status=old_scope['status'], representation='reviewed_owner_positive_scope',
            finding='Application and Project editions follow the per-family Storage contract and the named global_shell_app_scope payload; the incomplete Project-only preparation remains historical.',
            evidence=[dict(path=owner.split('#')[0],unit=owner.split('#')[1],line_start=start,line_end=end,
                quote='\n'.join(body.splitlines()[start-1:end]),file_sha256=sha(body.encode()))],
            predecessor_assessment=dict(commit=source,path=depth_path,sha256=sha(old_depth)))
    depth['registry'] = dict(path=REGISTRY, **after, row_pointer='#/families/'+str(at))
    depth['evidence_maintenance'] = dict(authority=AUTHORITY, source_commit=source, source_assessment_sha256=sha(old_depth), native_execution='NOT_RUN')
    write(depth_path, depth)
    revision_path = DIRECTORY+'/'+event+'.json'
    entry = decision_entry(number,event,row,before,after,record,depth_path,sha((ROOT/depth_path).read_bytes()),revision_path,family['findings'],plan['review'])
    old_log = read(DL)
    (ROOT/DL).write_text(old_log+entry)
    (ROOT/REGISTRY).write_bytes(after_raw)
    record['original_admission_decision_ref'] = record.get('original_admission_decision_ref',record['decision_ref'])
    record['decision_ref'] = DL+'#'+number
    record['decision_section_sha256'] = sha(entry.lstrip('\n').encode())
    record['registry_row_sha256'] = canonical(row)
    record['depth_assessment']['sha256'] = sha((ROOT/depth_path).read_bytes())
    record['postfix_correction'] = revision_path
    chain = importlib.util.spec_from_file_location('postfix_record_chain',ROOT/'scripts/pm-ea-record-chain.py')
    module = importlib.util.module_from_spec(chain);chain.loader.exec_module(module)
    record['decision_section_sha256'] = sha(module.decision_bytes((ROOT/DL).read_bytes(),number))
    predecessor = json.loads(old_record_raw)
    record['evidence_maintenance'] = dict(authority=AUTHORITY, source_commit=source, source_record_sha256=sha(old_record_raw),
        source_assessment_sha256=sha(old_depth), source_decision_section_sha256=predecessor['decision_section_sha256'], original_registry_checkpoints_preserved=True)
    write(path, record)
    revision = dict(schema_id='pm.ea.postfix_revision.v1', authority=AUTHORITY,event_type=event,findings=family['findings'],
        source_commit=source,original_admission_decision_ref=record['original_admission_decision_ref'],decision_ref=record['decision_ref'],
        registry_before=before,registry_after=after,before_row=before_row,registry_row=row,
        predecessor_record_sha256=sha(old_record_raw),predecessor_assessment_sha256=sha(old_depth),
        applied_record_sha256=sha((ROOT/path).read_bytes()),applied_assessment_sha256=sha((ROOT/depth_path).read_bytes()),
        citation_changes=family['citations'],review=dict(path=plan['review'],sha256=plan['review_sha256']),native_execution='NOT_RUN')
    write(revision_path,revision)
    currentness='scripts/pm_pnc019_currentness.py'
    text=read(currentness)
    text=re.sub(r'EVENT_FAMILY_REGISTRY_REVISION = "[^"]+"','EVENT_FAMILY_REGISTRY_REVISION = "'+after['revision']+'"',text)
    text=re.sub(r'# Current registry [^\n]+', '# Current registry '+after['revision']+', SHA-256 '+after['sha256']+'.',text)
    (ROOT/currentness).write_text(text)
    golden='tests/fixtures/event_record/legacy_normalization/golden/event_envelope_v1_to_event_record_v2.json'
    golden_doc=load(golden);golden_doc['registry_revision']=after['revision'];write(golden,golden_doc,indent=2)
    for command in (['python3','scripts/pm-shard-plans.py','--generate','--config','Plans/sharding_config.json'],['python3','scripts/pm-plan-index.py','generate']):
        subprocess.run(command,cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
    changed=run('git','diff','--name-only').splitlines()
    allowed={DL,REGISTRY,path,depth_path,currentness,golden}|changed_owners
    derived_prefixes=('Plans/_shards/decision_log/','Plans/.plan_index/')+tuple('Plans/_shards/'+Path(p).stem.lower()+'/' for p in changed_owners)
    unexpected=[x for x in changed if x not in allowed and not x.startswith(derived_prefixes)]
    if unexpected:
        raise ValueError('regeneration touched unrelated document paths: '+repr(unexpected))
    paths=changed+[revision_path]
    subprocess.run(['git','add','--',*paths],cwd=ROOT,check=True)
    subprocess.run(['git','commit','-m',f'Correct {event} evidence and selectors for post-landing finding(s) {family["findings"]} ({number})'],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
    print(json.dumps(dict(event_type=event,decision=number,commit=run('git','rev-parse','HEAD'),registry_after=after)),flush=True)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('command',choices=['prepare','apply-one'])
    p.add_argument('--manifest',type=Path,required=True)
    p.add_argument('--sha256')
    p.add_argument('--previous-manifest',type=Path)
    p.add_argument('--event')
    p.add_argument('--decision',type=int)
    args=p.parse_args()
    if args.command=='prepare':
        doc=prepare(args.previous_manifest);args.manifest.parent.mkdir(parents=True,exist_ok=True);args.manifest.write_text(json.dumps(doc,indent=2,ensure_ascii=False)+'\n')
        print(json.dumps(dict(families=len(doc['families']),hold=len(doc['hold']),manifest_sha256=sha(args.manifest.read_bytes()))))
    else:
        if sha(args.manifest.read_bytes()) != args.sha256:
            p.error('correction plan differs from its pinned bytes')
        if not args.event or args.decision is None:
            p.error('apply-one requires --event and --decision')
        apply_one(json.loads(args.manifest.read_text()),args.event,args.decision)


if __name__=='__main__':
    main()
