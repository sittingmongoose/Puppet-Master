"""Strict new-cohort native handoff validation; metadata only, no scan/choice.

This gates every later role before operator copies outputs into admitted inputs.
Copying content is opaque. Old operational failures cannot qualify as a donor.
"""
from pathlib import Path
import prepare as owner
p=owner.p

def validated_ancestry(registration_ref,current_job_id,capsule_ref,closed_context_refs):
    registration=p.checked(registration_ref)
    rows={r['job_id']:r for r in registration['stage_jobs']};target=rows[current_job_id]
    ids=target['all_same_arm_prior_job_ids'];capsule=p.checked(capsule_ref)
    contexts={}
    for ref in closed_context_refs:
        context=p.checked(ref)
        if context['job_id'] in contexts:raise ValueError('Duplicate source context')
        contexts[context['job_id']]=(ref,context)
    if set(contexts)!=set(ids):raise ValueError('Every declared new ancestor requires exact owned closed capture export, including honest empty')
    selected=[]
    for job in ids:
        row=rows[job];matches=[r for r in capsule['rows'] if r['job_id']==job]
        if len(matches)!=1:raise ValueError('One actual positive new-role identity capsule required')
        actual=matches[0];freeze=p.checked(actual['output_freeze'])
        if actual['pair_id']!=registration['pair_id'] or actual['arm']!=target['arm'] or row['arm']!=target['arm']:
            raise ValueError('Old cohort/other-arm source cannot supply a fresh retest role')
        if actual.get('observed_family')!='L' or actual.get('observed_model')!='gpt-6-luna' or actual.get('observed_effort')!='max':
            raise ValueError('Actual native donor family/model/effort not exact original Luna Max')
        if any(freeze[k]!=actual[k] for k in ['job_id','pair_id','arm','stage']):raise ValueError('Actual freeze identity mismatch')
        if freeze.get('operational_complete') is not True or freeze.get('native_quiescent') is not True or freeze.get('native_goal_starts',0)<1:
            raise ValueError('Strict operational-complete/positive-native/ownedquiet donor required')
        if actual['native_goal_state']!='complete':raise ValueError('Incomplete native Goal cannot become an authenticated new donor')
        expected=p.checked({'path':row['stage_json'],'sha256':row['stage_sha256']})
        required=[name.removeprefix('out/') for name in expected['required_artifacts']]
        inventory={a['relative_path']:a for a in freeze['artifacts']}
        if any(name not in inventory or inventory[name]['bytes']<=0 for name in required):raise ValueError('Missing complete original expected role artifacts')
        context_ref,context=contexts[job]
        if context['output_freeze']!=actual['output_freeze'] or context['owned_quiet_positive'] is not True or context['arm']!=target['arm']:
            raise ValueError('Captures not bound to this exact completed new native donor')
        namespaces={str(Path(name).parent) for name in required}
        artifacts=[a for a in freeze['artifacts'] if str(Path(a['relative_path']).parent) in namespaces]
        for artifact in artifacts:
            if p.sha(artifact['path'])!=artifact['sha256'] or Path(artifact['path']).stat().st_size!=artifact['bytes']:
                raise ValueError('Actual frozen native donor bytes drift')
        selected.append({'origin_job_id':job,'freeze_ref':actual['output_freeze'],'source_identity_capsule_ref':capsule_ref,
                  'closed_context_ref':context_ref,'required_role_paths':required,'all_role_namespace_artifacts':artifacts,
                  'all_captures':context['sources'],'selection':'All declared actual namespace artifacts and ownedcaptures, no grade/content/quality/bestof choice'})
    return selected
