#!/usr/bin/env python3
"""Prepare policy-bound integrated versions; no launches or candidate interpretation."""
import argparse
import copy
import json
from pathlib import Path
import shutil
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import prepare as p
import bind_seeded as pins

ROOT = Path(__file__).resolve().parent
LAB = ROOT.parents[2]
CASES = LAB / 'cases'


def required(card, arm, step):
    if step.get('required_artifacts'): return step['required_artifacts']
    stage = step['stage']
    if stage == 'research': folder = 'research'
    elif stage in ('critique','critic'): return ['out/critique/review.md']
    elif stage == 'flash_check': return ['out/flash/review.md']
    elif card['method_id']=='V05' and arm=='treatment' and stage=='revision': folder = 'revision'
    else: folder = 'final'
    return ['out/'+folder+'/'+x for x in ('proposal.md','sources.json','witnesses.json','leads.json')]


def prompt_path(name):
    path = Path(name)
    return p.regular(path if path.is_absolute() else CASES / name)


def origin_context(ref, root, arm, minimum_roles):
    freeze = pins.checked_json(ref)
    if (freeze.get('arm') != arm or freeze.get('stage')!='research' or
        freeze.get('native_quiescent') is not True or (freeze.get('native_goal_starts') or 0)<1):
        raise ValueError('Actual quiescent same-arm research Goal required')
    receipt=pins.checked_json(freeze['native_receipt'])
    if receipt.get('goal_activated') is not True and receipt.get('native_goal_set_receipt',{}).get('goal',{}).get('status')!='active':
        raise ValueError('Actual research native Goal activation proof required')
    names = {'proposal':'research/proposal.md','sources':'research/sources.json',
             'witnesses':'research/witnesses.json','leads':'research/leads.json'}
    inventory = {x['relative_path']:x for x in freeze['artifacts']}
    if not all(names[role] in inventory and inventory[names[role]]['bytes']>0 for role in minimum_roles):
        raise ValueError('Policy-selected usable research role absent')
    copies = {}
    for item in freeze['artifacts']:
        if not item['relative_path'].startswith('research/'): continue
        original = p.regular(item['path'])
        if p.sha(original)!=item['sha256']: raise ValueError('Frozen authentic research drift')
        copies['prior/'+freeze['job_id']+'/'+item['relative_path']] = original
    # Capture provenance is collected mechanically from this actual Goal alone, not the
    # later shared armstore. Existing capture helper writes only inside this new lane.
    sys.path.insert(0, str(ROOT.parent/'seed-recovery'))
    import build_imports as capture
    capture.ROOT = root/'source-provenance'
    jobs = json.loads((LAB/'state/jobs.json').read_text())['jobs']
    job = next(x for x in jobs if x['job_id']==freeze['job_id'])
    spec = json.loads(Path(job['stage_json']).read_text())
    captures = capture.snapshot_captures(freeze['job_id'], spec)
    index = []
    for i,item in enumerate(captures):
        name='source_context/'+str(i).zfill(4)+'.body'; copies[name]=Path(item['path'])
        index.append({'candidate_path':'inputs/'+name,'url':item['url'],'sha256':item['sha256'],
                      'version_or_commit':item['version_or_commit'],'capture_limitations':item['capture_limitations']})
    index_path = root/arm/'SOURCE_INDEX.json'
    p.put(index_path,{'schema':'er9.candidate-source-index.v1','sources':index})
    copies['source_context/index.json']=index_path
    return copies, {'research_origin':ref,'original_native_status':freeze.get('native_status'),
                    'original_operational_complete':freeze.get('operational_complete'),
                    'original_elapsed_seconds':freeze.get('elapsed_seconds'),
                    'original_native_receipt':freeze.get('native_receipt'),
                    'role_presence':{role:rel in inventory for role,rel in names.items()},
                    'original_failure_status_not_changed':True,'source_quality':'UNASSESSED'}


def existing_role_context(ref, root, arm, role, origin_ref, expected_cap, owned_scope_ref=None):
    freeze=pins.checked_json(ref);origin=pins.checked_json(origin_ref)
    if (freeze.get('arm')!=arm or freeze.get('stage')!=role or (freeze.get('native_goal_starts') or 0)<1):
        raise ValueError('Existing role must be a genuine quiescent independent native stage')
    jobs=json.loads((LAB/'state/jobs.json').read_text())['jobs'];job=next(x for x in jobs if x['job_id']==freeze['job_id'])
    spec=json.loads(Path(job['stage_json']).read_text())
    if spec['max_seconds']!=expected_cap:raise ValueError('Existing role budget incompatible with source card')
    original_hashes={x['sha256'] for x in origin['artifacts'] if x['relative_path'] in
                     ('research/proposal.md','research/sources.json','research/witnesses.json','research/leads.json')}
    if not original_hashes <= set(spec['input_pins'].values()):raise ValueError('Existing role ancestry differs from selected research')
    receipt=pins.checked_json(freeze['native_receipt'])
    if freeze.get('native_quiescent') is not True:
        if not owned_scope_ref:raise ValueError('Existing role requires exact owned quiescence proof')
        quiet=pins.checked_json(owned_scope_ref)
        if (quiet.get('all_owned_scopes_quiet') is not True or quiet.get('execution_units_quiet') is not True or
            quiet.get('thread_id')!=receipt.get('thread_id')):
            raise ValueError('Owned quiescence supplement does not bind this exact native role')
    if receipt.get('goal_activated') is not True and receipt.get('native_goal_set_receipt',{}).get('goal',{}).get('status')!='active':
        raise ValueError('Actual independent role native Goal activation required')
    if not any(x['relative_path']=='critique/review.md' and x['bytes']>0 for x in freeze['artifacts']):
        raise ValueError('Actual critic review absent; final-stage maps cannot impersonate critic')
    copies={}
    for item in freeze['artifacts']:
        if not item['relative_path'].startswith('critique/'):continue
        original=p.regular(item['path'])
        if p.sha(original)!=item['sha256']:raise ValueError('Frozen genuine critic drift')
        copies['prior/'+freeze['job_id']+'/'+item['relative_path']]=original
    sys.path.insert(0,str(ROOT.parent/'seed-recovery'))
    import build_imports as capture
    capture.ROOT=root/'source-provenance'
    captures=capture.snapshot_captures(freeze['job_id'],spec);index=[]
    for i,item in enumerate(captures):
        name='source_context/'+freeze['job_id']+'/'+str(i).zfill(4)+'.body';copies[name]=Path(item['path'])
        index.append({'candidate_path':'inputs/'+name,'url':item['url'],'sha256':item['sha256'],
                      'version_or_commit':item['version_or_commit'],'capture_limitations':item['capture_limitations']})
    index_path=root/arm/'CRITIC_SOURCE_INDEX.json';p.put(index_path,{'schema':'er9.candidate-source-index.v1','sources':index})
    copies['source_context/critic-index.json']=index_path
    return copies,{'role':role,'origin_ref':ref,'original_status':freeze.get('native_status'),
                   'original_operational_complete':freeze.get('operational_complete'),
                   'original_elapsed_seconds':freeze.get('elapsed_seconds'),'native_receipt':freeze['native_receipt'],
                   'same_research_ancestry_verified':True,'source_quality':'UNASSESSED',
                   'original_quiescence_flag_preserved':freeze.get('native_quiescent'),
                   'owned_scope_supplement':owned_scope_ref}


def prepare(recipe, policy_ref, destination):
    p.design_pins(LAB); pins.checked_json(policy_ref)
    old_card = pins.checked_json(recipe['source_card_ref'])
    card = copy.deepcopy(old_card); pair=recipe['new_pair_id']; root=destination/pair
    modes=recipe.get('arm_modes',{arm:recipe['mode'] for arm in ('control','treatment')})
    if set(modes)!= {'control','treatment'} or any(x not in ('full_fresh','artifact_handoff','research_consolidation','await_existing') for x in modes.values()):
        raise ValueError('Explicit per-arm frozen recovery mode required')
    if recipe.get('resource_contract') and any(x!='full_fresh' for x in modes.values()):
        raise ValueError('New resource binding only for wholly-unstarted symmetric versions')
    if recipe.get('resource_contract'): pins.checked_json(recipe['resource_contract'])
    card.update(pair_id=pair,source_slot=recipe['source_slot'],status='NOT_RUN',card_version='DEC007-delivery-recovery-v1',
                source_card_ref=recipe['source_card_ref'],policy_ref=policy_ref,selection_quality='NOT_USED',
                original_attempts_and_costs_preserved=True,recovery_mode=recipe['mode'],arm_recovery_modes=modes,
                fresh_matched_credit=all(x=='full_fresh' for x in modes.values()))
    family=recipe.get('requested_family',old_card['candidate_family'])
    if family not in ('GLM','Luna'): raise ValueError('Accepted affordable native family required')
    card['candidate_family']=family
    card['requested_model']=recipe.get('requested_model',old_card['requested_model'])
    card['requested_effort']=recipe.get('requested_effort',old_card['requested_effort'])
    card_path=root/'card.json'; p.put(card_path,card)
    delivery=p.regular(ROOT/'DELIVERY_OBJECTIVE_V1.md')
    context={}; provenance={}
    for arm in ('control','treatment'):
        if modes[arm] in ('artifact_handoff','research_consolidation'):
            minimum=['proposal'] if modes[arm]=='research_consolidation' else recipe.get('minimum_research_roles',['proposal','sources','witnesses','leads'])
            context[arm],provenance[arm]=origin_context(recipe['research_origins'][arm],root,arm,minimum)
            for role,ref in recipe.get('existing_role_freezes',{}).get(arm,{}).items():
                st=next(x for x in card[arm+'_stages'] if x['stage']==role)
                quiet=recipe.get('existing_role_scope_proofs',{}).get(arm,{}).get(role)
                extra,proof=existing_role_context(ref,root,arm,role,recipe['research_origins'][arm],st['max_native_seconds'],quiet)
                context[arm].update(extra);provenance[arm].setdefault('existing_roles',[]).append(proof)
        else: context[arm]={}
    inputs={card_path,delivery,Path(policy_ref['path']),Path(recipe['source_card_ref']['path']),
            CASES/card['brief_path'],CASES/card['coverage_path'],CASES/card['common_criteria_path'],
            CASES/card['source_access_path'],CASES/card['common_output_contract']}
    if card.get('important_checks_path'):inputs.add(CASES/card['important_checks_path'])
    for arm in ('control','treatment'):
        for st in card[arm+'_stages']:inputs.update(prompt_path(x) for x in st['prompt_paths'])
    freeze_path=root/'PAIR_INPUT_FREEZE.json'
    p.put(freeze_path,{'schema':'er9.policy-bound-integrated-recovery-freeze.v1','pair_id':pair,
                       'source_slot':recipe['source_slot'],'mode':recipe['mode'],'arm_modes':modes,'policy_ref':policy_ref,
                       'selection_ref':recipe.get('selection_ref'),'fresh_matched_credit':all(x=='full_fresh' for x in modes.values()),
                       'cumulative_original_and_recovery_costs_required':True,
                       'host_input_pins':{str(x):p.sha(x) for x in sorted(inputs)},'research_origins':provenance,
                       'requested_family':family,'requested_model':card['requested_model'],'requested_effort':card['requested_effort'],
                       'allocation':card['allocation'],'designated_final':card['artifacts'],
                       'resource_contract':recipe.get('resource_contract'),'source_quality':'UNASSESSED',
                       'holdout_read':False,'native_starts':0,'launch_seal_required':True})
    pair_ref={'path':str(freeze_path),'sha256':p.sha(freeze_path)}; rows=[]
    for arm in ('control','treatment'):
        if modes[arm]=='await_existing':continue
        priors=[]
        for index,st in enumerate(card[arm+'_stages']):
            if modes[arm]=='artifact_handoff' and st['stage']=='research':continue
            if st['stage'] in recipe.get('existing_role_freezes',{}).get(arm,{}):continue
            job_id=f'{pair}-{arm}-{st["stage"]}-a001'; run=root/job_id;ws=run/'workspace';incoming=ws/'inputs'
            incoming.mkdir(parents=True,exist_ok=False);(ws/'out').mkdir()
            copies={'brief.md':CASES/card['brief_path'],'output_contract.md':CASES/card['common_output_contract'],
                    'delivery_objective.md':delivery,**context[arm]}
            for name,original in copies.items():
                target=incoming/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p.regular(original),target)
            output=required(card,arm,st)
            text=['# Assigned fresh native integrated stage', (incoming/'brief.md').read_text(),
                  (incoming/'output_contract.md').read_text(),*[prompt_path(x).read_text() for x in st['prompt_paths']],
                  '# Exact supplied input inventory\n\n'+'\n'.join('- inputs/'+x for x in sorted(copies))]
            if priors:text.append('Ops must attach the exact complete frozen same-arm predecessor artifacts under inputs/prior/ before this stage. Do not invent them or read another arm.')
            if modes[arm] in ('artifact_handoff','research_consolidation'):text.append('The earlier genuine research is an immutable artifact handoff. Its original native status, missing roles, uncertainties and costs are preserved. Do not treat handoff as source qualification or silently relabel an earlier HOLD as Goal completion.')
            if modes[arm]=='research_consolidation' and st['stage']=='research':
                text.append('This is finite candidate-native research consolidation over your exact earlier proposal and captured source context. Complete the actual current proposal and genuinely author missing source/witness/lead catalogs; do not alias the proposal as another role. Continue the fixed same-arm source context rather than restart unrestricted repository discovery. Full brief obligations and original source access remain; retrieve implicated source/version context where needed and disclose unsupported gaps. This is separately charged recovery, not successful completion of the earlier failed research Goal.')
            text += [delivery.read_text(),'# This exact current stage\n\nAssigned role: '+st['stage']+
                     '\nRequired deliverables:\n'+'\n'.join('- '+x for x in output)]
            if st['stage'] in ('critic_final','critic_and_final'):
                text.append('Perform both genuine independent criticism and complete final authorship in this Goal. The four final files are required; a separate review note is optional. No later final-author stage exists.')
            task=ws/'TASK.md';task.write_text('\n\n'.join(text)+'\n')
            execution=st.get('execution_enabled',not(card['method_id']=='V01' and arm=='control' and st['stage']=='critique'))
            public=st.get('public_get',True); cap=None if family=='Luna' else st['max_parent_responses']
            spec={'job_id':job_id,'pair_id':pair,'arm':arm,'stage':st['stage'],'workspace':str(ws),
                  'prompt_file':str(task),'prompt_sha256':p.sha(task),'out':str(run/'native'),
                  'max_seconds':st['max_native_seconds'],'max_responses':cap,'tools_config':None,'tools_config_sha256':None,
                  'response_cap_enforcement':'UNSUPPORTED_ROOT_PROSPECTIVE_WALL_BUDGET_RULING' if family=='Luna' else 'SUPPORTED_NATIVE_LIMIT',
                  'required_artifacts':output,'pair_freeze':pair_ref,'input_pins':{str(x):p.sha(x) for x in sorted(incoming.rglob('*')) if x.is_file()},
                  'freeze_out':str(run/'OUTPUT_FREEZE.json'),'runtime_binding_required':True,'predecessor_binding_required':bool(priors),
                  'required_resource_contract':recipe.get('resource_contract')}
            spec_path=run/'prepared-stage.json';p.put(spec_path,spec)
            rows.append({'job_id':job_id,'arm':arm,'stage':st['stage'],'stage_index':index,'max_seconds':st['max_native_seconds'],
                         'max_responses':cap,'prerequisite_job_ids':priors[-1:],'all_same_arm_prior_job_ids':priors[:],
                         'stage_json':str(spec_path),'stage_sha256':p.sha(spec_path),'expected_freeze':spec['freeze_out'],
                         'pipeline_final':output[0]=='out/final/proposal.md','execution_enabled':execution,'public_get':public,
                         'status':'PREPARED_NOT_ADMITTED' if not priors else 'AWAITING_ACTUAL_PREDECESSOR_FREEZES',
                         'runtime_binding_required':True});priors.append(job_id)
    request={'schema':'er9.dispatch-registration.v1','request_id':pair+'-DEC007-r001','pair_id':pair,'source_slot':recipe['source_slot'],
             'family':{'Luna':'L','GLM':'Z'}[family],'requested_model':card['requested_model'],'requested_effort':card['requested_effort'],
             'card_path':str(card_path),'card_sha256':p.sha(card_path),'stage_jobs':rows,'root_scope_required':True,
             'admission_owner':'codex-er9-ops','automatic_retry':False,'status':'PREPARED_NOT_ADMITTED',
             'immutable_pair_input_freeze':pair_ref,'original_attempts_and_costs_preserved':True,
             'policy_ref':policy_ref,'scientific_recovery_mode':recipe['mode']}
    request_path=root/'registration.json';p.put(request_path,request)
    ref={'path':str(request_path),'sha256':p.sha(request_path),'request_id':request['request_id']}
    p.put(root/'OUTBOX.json',{'schema':'er9.policy-bound-recovery-outbox.v1','requests':[ref],'native_starts':0})
    return ref


def main():
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('--plan',type=Path,required=True)
    a.add_argument('--plan-sha256',required=True);a.add_argument('--destination',type=Path,required=True);x=a.parse_args()
    plan=pins.checked_json({'path':str(x.plan.absolute()),'sha256':x.plan_sha256});requests=[]
    for recipe in plan['recipes']:requests.append(prepare(recipe,plan['policy_ref'],x.destination.absolute()))
    p.put(x.destination/'OUTBOX.json',{'schema':'er9.policy-bound-recovery-outbox.v1','requests':requests,'native_starts':0})
    print(json.dumps({'requests':len(requests),'outbox':str(x.destination/'OUTBOX.json'),'native_starts':0}))


if __name__=='__main__':main()
