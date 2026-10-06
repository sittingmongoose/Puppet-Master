"""Ops-only final index seal on a NEW already-bound source-version workspace."""
import argparse,hashlib,json
from pathlib import Path
import prior_index

def checked(ref):
    path=Path(ref['path'])
    if path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest()!=ref['sha256']:raise ValueError('Pinned metadata drift')
    return json.loads(path.read_text())

def finalize(plan_ref):
    plan=checked(plan_ref)
    if plan.get('schema')!='er9.own-prior-index-original-birth-plan.v1':raise ValueError('Explicit pinned original-birth plan required')
    runtime=checked(plan['bound_stage_ref']);template=checked(plan['navigation_template_ref']);auth=checked(plan['authorized_imports_ref'])
    for key in ['job_id','pair_id','arm','stage','max_seconds','max_responses','prompt_sha256','required_artifacts']:
        if runtime.get(key)!=template.get(key):raise ValueError('Fixed navigation source/template role identity drift')
    for key in ['job_id','pair_id','arm']:
        if auth.get(key)!=runtime[key]:raise ValueError('Import authorization belongs to another target')
    workspace=Path(runtime['workspace']).absolute()
    if workspace==Path(template['workspace']).absolute():raise ValueError('Never write into frozen prepared source template')
    if hashlib.sha256(Path(runtime['prompt_file']).read_bytes()).hexdigest()!=template['prompt_sha256']:raise ValueError('Frozen Task changed at original role birth')
    neutral={Path(path).relative_to(template['workspace']).as_posix():digest for path,digest in template['input_pins'].items()}
    result=prior_index.freeze(workspace,runtime['input_pins'],neutral,auth)
    stage=dict(runtime);stage['input_pins']={**runtime['input_pins'],result['path']:result['sha256']};stage['actual_prior_index_ref']=result
    output=Path(plan['output_stage_path']).absolute()
    if output.exists() or output.parent!=workspace.parent:raise ValueError('Fresh bound descriptor next to exact workspace required')
    with output.open('x') as file:json.dump(stage,file,indent=2,sort_keys=True);file.write('\n')
    return {'stage_ref':{'path':str(output),'sha256':hashlib.sha256(output.read_bytes()).hexdigest()},'index_ref':result,
      'source_plan_ref':plan_ref,'actual_before_goal':True,'model_native_Goal_calls':0,'Task_or_tools_or_clocks_changed':False}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--plan',required=True);p.add_argument('--plan-sha256',required=True);a=p.parse_args()
    print(json.dumps(finalize({'path':str(Path(a.plan).absolute()),'sha256':a.plan_sha256})))
