"""Pure revalidation of explicit prospective root formula; public records only."""
from pathlib import Path
import hashlib
import json

FORMULA='er8.luna.exact-original-birth-binding.v1'
POLICY='wall-goal-token-observation-v1'
ACCOUNT='EXISTING_AUTHORIZED_CODEX_SUBSCRIPTION'
HERE=Path(__file__).resolve().parent

def record(rec,json_value=True):
    if not isinstance(rec,dict) or set(rec)!={'path','sha256'}:raise ValueError('exact formula lineage record required')
    p=Path(rec['path'])
    if not p.is_absolute() or any(q.is_symlink() for q in (p,*p.parents)) or hashlib.sha256(p.read_bytes()).hexdigest()!=rec['sha256']:raise ValueError('formula lineage drift')
    return json.loads(p.read_text()) if json_value else rec

def validate(config,binding,concrete):
    if concrete.get('binding_formula')!=FORMULA:raise ValueError('explicit source-controlled root formula required')
    parent=record(concrete.get('prospective_root_release'))
    exact={'schema':'er8.luna.controller-root-release.v1','root_authority':True,'accepted':True,
        'authorization':'EXACT_ROOT_RELEASE','family':'L','model':'gpt-6-luna','effort':'max',
        'native_response_policy':POLICY,'binding_formula':FORMULA,'owned_cleanup_authorized':True,'mode':binding['mode']}
    if any(parent.get(k)!=v for k,v in exact.items()):raise ValueError('no synthetic per-binding authorization')
    route=record(parent['route_snapshot']);controller=record(parent['controller_snapshot'])
    if parent['route_snapshot']['path']!=str(HERE/'SNAPSHOT.json') or concrete.get('route_snapshot_sha256')!=parent['route_snapshot']['sha256'] or concrete.get('controller_snapshot')!=parent['controller_snapshot']:raise ValueError('exact frozen controller/route formula required')
    for path,pin in {**route['closure_sha256'],**controller['closure_sha256']}.items():record({'path':path,'sha256':pin},False)
    control=record({'path':str(HERE.parent/'recovery-control.json'),'sha256':controller['closure_sha256'][str(HERE.parent/'recovery-control.json')]})
    for key,field in (('ledger_source','ledger'),('campaign_authority','authority'),('resume_authority','resume_authority')):
        if parent[key]!=control[field]:raise ValueError('exact unchanged accounting authority required')
        record(parent[key],False)
    if Path(parent['controller_snapshot']['path'])!=HERE.parent/'SNAPSHOT.json' or not Path(parent['run_root']).is_relative_to(Path(control['operator_root'])):raise ValueError('exact own controller/operator root required')
    for key in ('source_review','execution_acceptance'):
        review=record(parent[key])
        if review.get('verdict')!='accepted' or review.get('snapshot_sha256')!=parent['route_snapshot']['sha256']:raise ValueError('exact accepted source and lifetime scope required')
    source=record(parent['source_review'])
    if source.get('create_goal_pre_dispatch_denied_verified') is not True or source.get('host_one_goal_lifetime_verified') is not True:raise ValueError('preventive Goal boundary unestablished; monitor-only remains HOLD')
    if binding['mode'] not in source.get('allowed_modes',[]):raise ValueError('unreviewed formula mode')
    template=record(parent['config'])
    if concrete.get('config_template')!=parent['config']:raise ValueError('config template lineage required')
    home=Path(binding['workspace']).parent
    if home!=Path(parent['run_root'])/binding['case_id']/binding['label'] or config!={**template,'private_codex_home':str(home/'private-codex-auth')}:raise ValueError('formula changes only own fresh private home')
    for k,field in (('case_id','case_id'),('stage_id','stage_id'),('original_stage_birth_monotonic_ns','stage_start_monotonic_ns'),('original_stage_birth_epoch','stage_birth_epoch')):
        if concrete.get(k)!=binding.get(field):raise ValueError('exact original birth/hash lineage required')
    if binding.get('native_response_policy')!=POLICY or binding.get('account_identity')!=ACCOUNT or binding['max_responses']!=1:raise ValueError('Luna policy/ABI sentinel required')
    scope=parent['selected_stage_scope']
    if binding['mode']=='canary':
        if scope!={'canary_id':binding['case_id'],'cap_seconds':480,'cleanup_reserve_seconds':30,'max_responses_abi_sentinel':1} or binding['stage_id']!=binding['case_id'].lower() or binding['max_seconds']!=480:raise ValueError('exact root selected once-only canary required')
    else:
        roles=[['research-proposal',1800,'PROPOSAL.md'],['independent-candidate-critic',600,'CRITIQUE.md'],['final-correction',600,'FINAL_PROPOSAL.md']]
        if scope!={'case_queue':parent['case_queue'],'roles':roles,'cleanup_reserve_seconds':30,'max_responses_abi_sentinel':1} or binding['case_id'] not in parent['case_queue'] or not any(binding['stage_id']==(binding['case_id']+'-'+r).lower() and binding['max_seconds']==cap for r,cap,_ in roles):raise ValueError('exact root selected productive stage required')
    return True
