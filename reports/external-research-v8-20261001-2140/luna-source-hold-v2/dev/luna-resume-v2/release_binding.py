"""Root-controlled prospective formula binder. No auth read or native launch."""
from pathlib import Path
from common import *

FORMULA='er8.luna.exact-original-birth-binding.v1'
PREDICATES=('inclusive_native_lifetime_verified','native_goal_activation_continuation_completion_verified','source_proven_private_tool_boundary_verified','admitted_native_mcp_operations_verified','source_capture_and_delivered_range_verified')

def check_parent_release(release, mode):
    if release.get('schema')!='er8.luna.controller-root-release.v1' or release.get('root_authority') is not True or release.get('accepted') is not True or release.get('authorization')!='EXACT_ROOT_RELEASE':
        raise ValueError('exact prospective root release required')
    if release.get('family')!='L' or release.get('model')!='gpt-6-luna' or release.get('effort')!='max' or release.get('native_response_policy')!=POLICY or release.get('mode')!=mode or release.get('binding_formula')!=FORMULA or release.get('owned_cleanup_authorized') is not True:
        raise ValueError('Luna exact formula/model/cleanup authorization required')
    if time.time()>=STOP_EPOCH:raise ValueError('original campaign exhausted')
    snapshot=record(release['route_snapshot']); source=record(release['source_review']); boundary=record(release['execution_acceptance'])
    if release['route_snapshot']['path']!=str(LUNA_ROUTE/'SNAPSHOT.json') or source.get('verdict')!='accepted' or source.get('snapshot_sha256')!=release['route_snapshot']['sha256'] or mode not in source.get('allowed_modes',[]) or boundary.get('verdict')!='accepted' or boundary.get('snapshot_sha256')!=release['route_snapshot']['sha256']:
        raise ValueError('exact accepted successor route/source/boundary required')
    if release['controller_snapshot']['path']!=str(HERE/'SNAPSHOT.json'):raise ValueError('exact own controller snapshot required')
    if source.get('create_goal_pre_dispatch_denied_verified') is not True or source.get('host_one_goal_lifetime_verified') is not True:raise ValueError('preventive same-version Goal boundary unestablished; monitor-only source remains HOLD')
    controller=record(release['controller_snapshot'])
    for path,pin in {**snapshot['closure_sha256'],**controller['closure_sha256']}.items():
        if sha(path)!=pin:raise ValueError('selected frozen closure drift')
    for key,bound in (('ledger_source',CONTROL['ledger']),('campaign_authority',CONTROL['authority']),('resume_authority',CONTROL['resume_authority'])):
        if release.get(key)!=bound:raise ValueError('root binds unchanged accounting authority')
        pin_record(bound)
    scope=release.get('selected_stage_scope')
    expected={'canary_id':CONTROL['canary_id'],'cap_seconds':480,'cleanup_reserve_seconds':30,'max_responses_abi_sentinel':1} if mode=='canary' else {'case_queue':release.get('case_queue'),'roles':[list(r) for r in ROLES],'cleanup_reserve_seconds':30,'max_responses_abi_sentinel':1}
    if scope!=expected:raise ValueError('explicit exact root stage selection required')
    root=Path(release['run_root'])
    if not root.is_absolute() or root==Path(CONTROL['operator_root']) or not root.is_relative_to(Path(CONTROL['operator_root'])) or any(p.is_symlink() for p in (root,*root.parents)):raise ValueError('exact own prospective runtime root required')
    source_auth=Path(release['auth_source_path'])
    if not source_auth.is_absolute() or any(p.is_symlink() for p in (source_auth,*source_auth.parents)):raise ValueError('canonical auth source path metadata required')
    cfg=record(release['config'])
    if cfg.get('native_model')!={'provider_id':'openai','model_id':'gpt-6-luna','effort':'max','session_mode':'fresh-persistent'} or cfg.get('native_response_policy')!=POLICY or cfg.get('account_identity')!=ACCOUNT or cfg.get('snapshot_path')!=str(LUNA_ROUTE/'SNAPSHOT.json'):
        raise ValueError('exact Luna public config template required')
    if release.get('pins')!={'runtime':release['route_snapshot']['sha256'],'config':release['config']['sha256'],'independent_acceptance':release['source_review']['sha256']}:raise ValueError('exact ledger pins required')
    with ledger_module().transaction() as state:
        rr=state['route_reviews'].get(release['route'],{})
        scope='CANARY_ONLY' if mode=='canary' else 'NATIVE_ACCEPTED'
        if rr.get('accepted') is not True or rr.get('qualification_scope')!=scope or rr.get('pins')!=release['pins']:raise ValueError('root ledger admission scope required')
    return release

def bind_stage(release, home, binding):
    """Only formula fields change: fresh private home, exact hashes, role/birth."""
    home=Path(home);cfg=dict(record(release['config']))
    mode=binding['mode'];check_parent_release(release,mode)
    if home!=Path(release['run_root'])/binding['case_id']/binding['label'] or binding.get('stage_start_monotonic_ns',0)<=0 or binding.get('stage_birth_epoch',0)<=0:raise ValueError('only exact selected own stage namespace and original birth may be bound')
    private=home/'private-codex-auth'
    if not private.exists():
        private.mkdir(mode=0o700);(private/'auth.json').touch(mode=0o600)
    elif not private.is_dir() or {p.name for p in private.iterdir()}!={'auth.json'} or (private/'auth.json').stat().st_size!=0:raise ValueError('fresh private auth placeholder required')
    cfg['private_codex_home']=str(private);atomic(home/'CONFIG.json',cfg)
    binding['config_sha256']=sha(home/'CONFIG.json');binding['native_response_policy']=POLICY;binding['account_identity']=ACCOUNT
    atomic(home/'CASE_BINDING.json',binding)
    concrete={'schema':'er8.luna.root-native-release.v1','family':'L','model':'gpt-6-luna','effort':'max','native_response_policy':POLICY,'case_binding_sha256':sha(home/'CASE_BINDING.json'),'route_snapshot_sha256':release['route_snapshot']['sha256'],'mode':binding['mode'],'authorization':'EXACT_ROOT_RELEASE','prospective_root_release':release['_parent_record'],'binding_formula':FORMULA,'config_template':release['config'],'controller_snapshot':release['controller_snapshot'],'case_id':binding['case_id'],'stage_id':binding['stage_id'],'original_stage_birth_monotonic_ns':binding['stage_start_monotonic_ns'],'original_stage_birth_epoch':binding['stage_birth_epoch']}
    atomic(home/'ROOT_RELEASE.template.json',{**concrete,'authorization':'HOLD_PENDING_EXACT_ROOT_RELEASE'})
    atomic(home/'ROOT_RELEASE.json',concrete)
    acceptance={'verdict':'accepted','snapshot_sha256':release['route_snapshot']['sha256'],'allowed_modes':[binding['mode']],'source_review':release['source_review'],'root_native_release':{'path':str(home/'ROOT_RELEASE.json'),'sha256':sha(home/'ROOT_RELEASE.json')}}
    atomic(home/'ADMISSION_ACCEPTANCE.json',acceptance)
    return {n:{'path':str(home/name),'sha256':sha(home/name)} for n,name in [('config','CONFIG.json'),('lease','LEASE.json'),('case_binding','CASE_BINDING.json'),('acceptance','ADMISSION_ACCEPTANCE.json')]}
