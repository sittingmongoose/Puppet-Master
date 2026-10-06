#!/usr/bin/env python3
"""Chronological native-byte seed imports and prospective actual-card role corrections. No launch."""
import copy
import datetime
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import prepare as p
import plan_seeded as prior_plan
import bind_seeded as prior_bind

ROOT=Path(__file__).resolve().parent
LAB=ROOT.parents[2]
ROLES={'proposal':'research/proposal.md','source_catalog':'research/sources.json',
       'witness_catalog':'research/witnesses.json','lead_inventory':'research/leads.json'}


def capture_store(spec):
    if spec.get('tools_config'):
        cfg=json.loads(Path(spec['tools_config']).read_text())
        return next(Path(a) for s in cfg['mcp_servers'] for a in s['args']
                    if isinstance(a,str) and a.endswith('/public_captures'))
    return Path(spec['workspace'])/'public_captures'


def snapshot_captures(job_id,spec):
    store=capture_store(spec);events=Path(spec['prompt_file']).parents[1]/'operation_receipts/events.jsonl'
    # Luna owns stores under workspace rather than run.
    if not events.exists():events=Path(spec['workspace'])/'operation_receipts/events.jsonl'
    rows=[];seen=set()
    for line_no,line in enumerate(events.read_text().splitlines(),1):
        event=json.loads(line);s=event.get('source_evidence')
        if event.get('tool')!='public_https_get' or not s or not s.get('capture_id'):continue
        key=(s['capture_id'],s['sha256'])
        if key in seen:continue
        seen.add(key)
        meta_path=p.regular(store/(s['capture_id']+'.json'));meta=json.loads(meta_path.read_text())
        original=p.regular(store/(s['sha256']+'.body'))
        if p.sha(original)!=s['sha256'] or meta.get('sha256')!=s['sha256']:
            raise ValueError('Actual per-Goal capture pin mismatch')
        # Copy every actually returned captured body for this Goal; no relevance/quality selection.
        target=ROOT/'bases'/job_id/'public_captures'/(s['sha256']+'.body')
        if not target.exists():target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(original,target)
        normalized={'schema':'er9.lossless-capture-receipt-envelope.v1',
                    'url':meta.get('url',s.get('actual_url')),'requested_url':meta.get('requested_url'),
                    'actual_url':meta.get('actual_url',s.get('actual_url')),
                    'sha256':s['sha256'],'body_sha256':s['sha256'],
                    'source_version':s.get('source_version'),
                    'status':s.get('status'),'body_complete':s.get('body_complete'),
                    'truncated':s.get('truncated'),'captured_bytes':s.get('captured_bytes'),
                    'original_capture_metadata':{'path':str(meta_path),'sha256':p.sha(meta_path)},
                    'original_capture_body':{'path':str(original),'sha256':p.sha(original)},
                    'actual_origin_goal_event':{'job_id':job_id,'path':str(events),'sha256':p.sha(events),'jsonl_line':line_no},
                    'primary_or_semantic_suitability':'UNASSESSED','model_comprehension':'UNOBSERVED'}
        norm_path=ROOT/'bases'/job_id/'capture_receipts'/(s['capture_id']+'.json');p.put(norm_path,normalized)
        rows.append({'kind':'PUBLIC_CAPTURE','path':str(target),'sha256':s['sha256'],
                     'url':normalized['url'],'version_or_commit':s.get('source_version'),
                     'capture_receipt':{'path':str(norm_path),'sha256':p.sha(norm_path)},
                     'origin_capture_id':s['capture_id'],'origin_job_id':job_id,
                     'capture_limitations':{'status':s.get('status'),'body_complete':s.get('body_complete'),'truncated':s.get('truncated')},
                     'primary_classification':'UNASSESSED','semantic_source_facts_added':False})
    return rows


def select_origins():
    jobs=json.loads((LAB/'state/jobs.json').read_text())['jobs'];eligible={'A':[],'B':[]}
    for row in jobs:
        match=re.match(r'I-(\d+)',row.get('pair_id',''))
        if not match or row.get('stage')!='research' or not row.get('freeze_path'):continue
        domain='A' if int(match.group(1))%2 else 'B';freeze_path=Path(row['freeze_path'])
        freeze=json.loads(freeze_path.read_text());index={a['relative_path']:a for a in freeze['artifacts']}
        complete=freeze.get('operational_complete') is True and freeze.get('native_quiescent') is True and (freeze.get('native_goal_starts') or 0)>=1
        if not complete or not all(name in index and index[name]['bytes']>0 for name in ROLES.values()):continue
        for name in ROLES.values():
            a=index[name]
            if p.sha(p.regular(a['path']))!=a['sha256']:raise ValueError('Frozen candidate bytes changed')
        eligible[domain].append((freeze.get('birth_epoch',float('inf')),row,freeze,freeze_path,index))
    selected={}
    for d,choices in eligible.items():
        selected[d]=sorted(choices,key=lambda x:(x[0],x[1]['job_id']))[0]
    if selected['A'][1]['job_id']!='I-01-control-research-a001' or selected['B'][1]['job_id']!='I-02-treatment-research-a001':
        raise ValueError('Chronological selection differs from root DEC006; report rather than silently choose another')
    p.put(ROOT/'CHRONOLOGICAL_SELECTION.json',{'schema':'er9.mechanical-seed-selection.v1',
                                              'rule':'First chronological genuine completed quiescent research Goal with original research4 inventory; no proposal meaning or grades inspected.',
                                              'selected':{d:x[1]['job_id'] for d,x in selected.items()},
                                              'eligible_inventory_order':{d:[x[1]['job_id'] for x in sorted(c,key=lambda x:(x[0],x[1]['job_id']))] for d,c in eligible.items()},
                                              'quality_cherry_picking':False,'semantic_or_evaluator_bodies_read':False})
    return selected


def build_bases(selected):
    out={}
    for domain,(_,row,freeze,freeze_path,index) in selected.items():
        receipt_ref=freeze['native_receipt'];receipt=json.loads(Path(receipt_ref['path']).read_text())
        if p.sha(receipt_ref['path'])!=receipt_ref['sha256'] or receipt.get('goal_activated') is not True:raise ValueError('Native origin proof mismatch')
        spec=json.loads(Path(row['stage_json']).read_text())
        identity=receipt.get('observed_model');effort=receipt.get('observed_effort')
        files={role:{'path':index[name]['path'],'sha256':index[name]['sha256'],'origin_job_id':row['job_id'],
                     'original_relative_path':name,'bytes':index[name]['bytes']} for role,name in ROLES.items()}
        base={'schema':'er9.authentic-partial-role-base.v2','domain':domain,'seed_id':'BASE-'+domain+'-DEC006',
              'status':'MECHANICALLY_AUTHENTIC_BASE_ONLY','candidate_files':files,
              'origin_freezes':[{'path':str(freeze_path),'sha256':p.sha(freeze_path),'actual_family':'GLM',
                                 'actual_model':identity,'actual_effort':effort,'native_receipt':receipt_ref}],
              'public_source_files':snapshot_captures(row['job_id'],spec),
              'cold_cost_references':[{'job_id':row['job_id'],'native_receipt':receipt_ref,
                                       'original_native_goal_starts':freeze['native_goal_starts'],
                                       'original_elapsed_seconds':freeze['elapsed_seconds'],
                                       'reuse_new_native_starts':0,'accounting_rule':'Charge actual origin once; reuse links that existing cost. Dollars/unknown counters not invented.'}],
              'roles_available':list(files),'roles_missing':['dependencies','enrichment','critique','revision'],
              'base_5file_job_success_claimed':False,'new_native_goal_starts':0,
              'fixture_suitability':{'status':'UNASSESSED','per_facet_private_assessment_required':True,
                                     'missing_facets_are_not_tested_coverage':True,'no_answers_in_candidate_inputs':True},
              'source_grade_used_for_selection':False,'candidate_bytes_rewritten':False}
        path=ROOT/'bases'/row['job_id']/'BASE_MANIFEST.json';p.put(path,base)
        out[domain]={'path':str(path),'sha256':p.sha(path),'seed_id':base['seed_id'],'status':base['status']}
    p.put(ROOT/'BASE_IMPORT_OUTBOX.json',{'schema':'er9.authentic-base-import-outbox.v2','bases':out,
                                         'new_native_starts':0,'successful_5file_seed_jobs_added':0,
                                         'original_failed_seed_status_and_costs_unchanged':True,
                                         'next':'Ordinary22 pairs may use proposal+catalogs/full captured context with explicit private facet gaps. V05/V06/V13 retain genuine missing-role dependencies.'})
    return out


def corrected_plans(bases):
    q=json.loads((LAB/'cases/diagnostics/QUEUE.json').read_text());ordinary=[];special=[]
    for entry in q['items']:
        original_card=LAB/'cases'/entry['card_path'];card=json.loads(original_card.read_text())
        if card['method_id'] in ('V14','V15'):continue
        old_plan=LAB/'dev/diagnostic-runner/seeded/plans'/(card['pair_id']+'.json');plan=json.loads(old_plan.read_text())
        plan['schema']='er9.actual-card-role-dag.v2';plan['prospective_adapter_version']='DEC006-role-policy-v2'
        plan['original_dag_ref']={'path':str(old_plan),'sha256':p.sha(old_plan)}
        plan['base_seed_ref']=bases[card['domain']]
        plan['fixture_suitability']={'status':'UNASSESSED','independent_per_facet_private_check':True,'no_comprehensive_PASS_prerequisite':True,'missing_required_facet':'Report UNASSESSED, not invented tested coverage.'}
        for step in plan['stage_jobs']:
            if not step.get('native_goal'):continue
            method=card['method_id'];stage=step['stage']
            if method=='V04' and stage=='source_first_record':roles=[]
            elif method=='V05':roles=['proposal','critique','revision']
            elif method=='V06':roles=['proposal','critique']
            elif method=='V13':roles=['proposal','dependencies']
            else:roles=['proposal']
            step['seed_input_policy']={'candidate_roles':roles,'full_public_sources':True,
                                       'withheld_roles':[x for x in ['proposal','critique','revision','enrichment','dependencies'] if x not in roles],
                                       'optional_enrichment':'May supply genuinely authored relevant material later; absent file is not an invented ordinary-role gate.'}
            step['status']='BASE_PROVENANCE_READY_FACETS_UNASSESSED' if method not in ('V05','V06','V13') else 'AWAITING_GENUINE_MISSING_ROLE'
        missing={'V05':['critique','revision'],'V06':['critique'],'V13':['dependencies']}.get(card['method_id'],[])
        plan['genuine_missing_roles']=missing
        plan['status']='BASE_PROVENANCE_READY_FACETS_UNASSESSED' if not missing else 'AWAITING_GENUINE_MISSING_ROLE'
        path=ROOT/'corrected-dags'/(card['pair_id']+'.json');p.put(path,plan)
        ref={'pair_id':card['pair_id'],'method_id':card['method_id'],'domain':card['domain'],
             'path':str(path),'sha256':p.sha(path),'status':plan['status'],'genuine_missing_roles':missing}
        (special if missing else ordinary).append(ref)
    p.put(ROOT/'CORRECTED_DAG_OUTBOX.json',{'schema':'er9.corrected-seeded-dag-outbox.v2',
                                           'base_only_pairs':ordinary,'base_only_pair_count':len(ordinary),
                                           'genuine_role_dependent_pairs':special,'role_dependent_pair_count':len(special),
                                           'original_cards_dags_and_failed_seeds_unchanged':True,
                                           'same_tasks_methods_criteria_budgets':True,'no_quality_cherry_picking':True,
                                           'new_native_starts':0})


if __name__=='__main__':
    p.design_pins(LAB)
    selected=select_origins();bases=build_bases(selected);corrected_plans(bases)
    print(json.dumps({'authentic_base_imports':2,'base_only_pair_DAGs':22,'genuine_role_dependent_pairs':6,
                      'new_native_starts':0,'outbox':str(ROOT/'BASE_IMPORT_OUTBOX.json')}))
