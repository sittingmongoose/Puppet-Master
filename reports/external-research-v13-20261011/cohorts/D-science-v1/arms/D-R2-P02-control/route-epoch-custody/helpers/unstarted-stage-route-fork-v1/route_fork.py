#!/usr/bin/env python3
"""Dispatcher-only R0 reviser preparation; no provider/native calls."""
import argparse, copy, hashlib, json, types
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
AMENDMENT_SHA = '7094c3ee0b12087616f70226b9f00906b41ccfdd2f5747e6ef869c37627ccb18'
OLD_ROUTE = {'providerInstanceId':'AUTHORIZED_PROVIDER_INSTANCE','model':'gpt-6-luna','options':{'reasoningEffort':'max','serviceTier':'default'}}
NEW_ROUTE = dict(OLD_ROUTE, providerInstanceId='codex_private_epoch_2')

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def read(p):
    return json.loads(p.read_bytes())

def safe(p):
    if not p.is_absolute() or any(x.is_symlink() for x in (p,*p.parents)):
        raise ValueError('absolute non-symlink path required')
    return p

def encode(x):
    return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()

def exclusive(p,x):
    safe(p)
    with p.open('xb') as f: f.write(encode(x))
    p.chmod(0o444)

def delta(old,new):
    expected=copy.deepcopy(old); expected['provider']=NEW_ROUTE
    if old['provider']!=OLD_ROUTE or new!=expected:
        raise ValueError('only providerInstanceId prospective route delta authorized')

def module(p,owner=None,anchor=None):
    safe(p); raw=p.read_text()
    m=types.ModuleType('route_fork_'+p.parent.name); m.__file__=str(p)
    if anchor:
        if raw.count(anchor)!=1: raise ValueError('exact stage-owner source anchor mismatch')
        raw=raw.replace(anchor,'owner = ROUTE_OWNER')
        m.ROUTE_OWNER=owner
    exec(compile(raw,str(p),'exec'),m.__dict__)
    return m

def tree(p):
    if not p.is_dir(): raise ValueError('original predecessor directory required')
    out={}
    for f in sorted(p.rglob('*')):
        safe(f)
        if f.is_file(): out[str(f)]=sha(f)
    return out

def prepare(old_config, old_sha, amendment, amendment_sha, fork_config, stage, run_sha,
            expected_run_id='D-R2-P02-control'):
    for p in (old_config,amendment,fork_config,stage): safe(p)
    if amendment_sha!=AMENDMENT_SHA or sha(amendment)!=amendment_sha:
        raise ValueError('exact root amendment pin required')
    am=read(amendment)
    if (am.get('new_codex_provider_instance')!='codex_private_epoch_2' or
        am.get('future_candidate_starts')!={'providerInstanceId':'codex_private_epoch_2','model':'gpt-6-luna','reasoningEffort':'max','serviceTier':'default'} or
        any(am.get(k) is not True for k in ('science_methods_unchanged','native_goal_objective_and_birth_guards_unchanged','T0_stage_whole_deadlines_unchanged','historical_grades_requests_receipts_unchanged'))):
        raise ValueError('root prospective authority does not preserve original science/clocks')
    if sha(old_config)!=old_sha: raise ValueError('old config pin mismatch')
    old=read(old_config); new=copy.deepcopy(old); new['provider']=NEW_ROUTE; delta(old,new)
    if (old.get('run_id')!=expected_run_id or old.get('public_recipe_choice')!='R0' or
        old.get('method_id')!='R0' or old.get('stage_prompt_deltas')!={} or old.get('method_delta_files')!={} or
        old.get('stage_budgets_s')!={'investigator':1800,'critic':720,'reviser':1080} or old.get('whole_budget_s')!=3600 or old.get('activation_capture_version')!='exact-capture-v21'):
        raise ValueError('only original R0 control shape supported')
    runtime=safe(Path(old['runtime_root'])); arm=runtime.parents[1]
    if stage!=runtime/'stages/reviser' or old_config!=arm/'configs'/ (old['run_id']+'.json'):
        raise ValueError('exact original unstarted reviser/config paths required')
    if fork_config.exists() or not fork_config.parent.is_dir() or fork_config.is_relative_to(runtime):
        raise ValueError('new control-only fork config path required; no retry reconstruction')
    if fork_config.with_suffix('.route-epoch.json').exists():
        raise ValueError('existing route epoch; no counter-reconstruction or repair')
    if stage.exists():
        for p in stage.rglob('*'): safe(p)
    if stage.exists() and any(p.name!='sources' or not p.is_dir() or any(p.iterdir()) for p in stage.iterdir()):
        raise ValueError('used/prepared/science/native/attempt stage refused')
    runfile=runtime/'control/run.json'
    if sha(runfile)!=run_sha: raise ValueError('immutable original common initialization pin mismatch')
    init=read(runfile)
    if (init['run_id']!=old['run_id'] or init['initialized_at_utc']!=old['t0_utc'] or
        init['whole_deadline_utc']!=old['whole_deadline_utc'] or init['requested_route']!=OLD_ROUTE):
        raise ValueError('original T0/deadline/route initialization mismatch')
    pins=read(HERE/'PINS.json')
    for row in pins['source_files']:
        p=safe(ROOT/row['relative_path'])
        if sha(p)!=row['sha256']: raise ValueError('generic source pin mismatch: '+str(p))
    oldowner=arm/'mechanics/exact-activation-capture-v2-1/capture-owner.json'
    owner=read(oldowner)
    if owner['config_path']!=str(old_config) or owner['config_sha256']!=old_sha or owner['runtime_root']!=str(runtime):
        raise ValueError('original capture owner mismatch')
    protected={str(p):sha(p) for p in (old_config,runfile,oldowner,Path(old['brief_path']),Path(old['plan_path']))}
    for s in ('investigator','critic'): protected.update(tree(runtime/'stages'/s))
    protected.update(tree(runtime/'control/terminal-handoffs'))
    inventories={str(p):tree(p) for p in (runtime/'stages/investigator',runtime/'stages/critic',runtime/'control/terminal-handoffs')}
    preparer=module(arm/'helpers/er12-screen-v1/prepare.py')
    c=preparer.load_config(old_config) # original full config validation, original route
    if c['_whole_deadline']<=preparer.now(): raise ValueError('original whole deadline expired')
    deps=preparer.get_deps(c,'reviser'); preparer.verify_terminal_status(runtime,deps)
    preparer.verify_predecessors(runtime,'reviser') # original frozen outputs/source checks
    # Keep original init validation with original route; only the NEW stage sees the new route.
    original_init=preparer.init_run
    def init_original(fork):
        base=dict(fork,provider=OLD_ROUTE,_config_path=str(old_config))
        result=original_init(base)
        if sha(runfile)!=run_sha: raise ValueError('original initialization changed')
        return result
    preparer.init_run=init_original
    c['provider']=NEW_ROUTE; c['_config_path']=str(fork_config)
    exclusive(fork_config,new)
    # Explicit amendment/binding exists before any new stage generation.
    owner=dict(owner,config_path=str(fork_config),config_sha256=sha(fork_config),stages=['reviser'])
    record={'version':'unstarted-stage-route-fork-v1','amendment_path':str(amendment),'amendment_sha256':amendment_sha,
            'old_config_path':str(old_config),'old_config_sha256':old_sha,'original_run_init_sha256':run_sha,
            'fork_config_path':str(fork_config),'fork_config_sha256':sha(fork_config),'stageDir':str(stage),
            'strict_delta':['provider.providerInstanceId'],'owner':owner,'protected_sha256':protected,
            'original_t0_utc':old['t0_utc'],'original_whole_deadline_utc':old['whole_deadline_utc'],
            'actual_dispatch_performed':False,'actual_native_calls':0,'physical_provenance':'UNKNOWN'}
    exclusive(fork_config.with_suffix('.route-epoch.json'),record)
    spec=preparer.prepare(c,'reviser')
    clarify=module(arm/'mechanics/invocation-clarification-v1/transform.py')
    guard=module(arm/'mechanics/exact-goal-binding-guard-v1/overlay.py')
    clarify.transform(stage); guard.transform(stage)
    overlay_path=arm/'mechanics/exact-activation-capture-v2-1/overlay.py'
    activation=module(overlay_path,owner,"owner = json.loads((HERE / 'capture-owner.json').read_bytes())")
    cap_path=ROOT/'helpers/prospective-capture-v1/install.py'
    cap=module(cap_path,owner,"owner = json.loads((old_dir / 'capture-owner.json').read_bytes())")
    terminal=module(ROOT/'helpers/prospective-terminal-capture-v1/install.py',owner,
                    "owner = json.loads((root/'mechanics/exact-activation-capture-v2-1/capture-owner.json').read_bytes())")
    # Sole existing imports receive the isolated owner in memory. Every source/template/guard pin stays checked.
    def cap_load(p):
        if Path(p)!=overlay_path: raise ValueError('unsupported activation import')
        return activation
    def term_load(p):
        if Path(p)!=cap_path: raise ValueError('unsupported terminal import')
        return cap
    cap.load=cap_load; terminal.load=term_load
    installed=terminal.transform(stage)
    req=read(stage/'request.json'); freeze=read(stage/'freeze.json'); im=read(stage/'input-map.json')
    preparer.verify_saved_request(stage,req)
    if any(x!=NEW_ROUTE for x in (req['args']['target'],freeze['requested_route'],im['requested_route'])):
        raise ValueError('prospective stage request/route mismatch')
    if freeze['request_sha256']!=sha(stage/'request.json') or installed['binding']['config_sha256']!=sha(fork_config):
        raise ValueError('new stage request/config binding mismatch')
    if freeze['stage_budget_s']!=1080 or freeze['whole_deadline_utc']!=old['whole_deadline_utc']:
        raise ValueError('original stage/whole clock changed')
    for path,digest in protected.items():
        if sha(Path(path))!=digest: raise ValueError('protected original changed: '+path)
    if any(tree(Path(p))!=inventory for p,inventory in inventories.items()):
        raise ValueError('protected original inventory changed')
    return dict(spec,args=req['args'],route_epoch=str(fork_config.with_suffix('.route-epoch.json')),
                fork_config_sha256=sha(fork_config),binding_sha256=installed['binding_sha256'],
                actual_native_calls=0,actual_dispatch_performed=False,physical_provenance='UNKNOWN')

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    for key in ('old-config','amendment','fork-config','stage-dir'): ap.add_argument('--'+key,type=Path,required=True)
    for key in ('old-config-sha','amendment-sha','original-run-init-sha'): ap.add_argument('--'+key,required=True)
    a=ap.parse_args()
    try:
        print(json.dumps(prepare(a.old_config,a.old_config_sha,a.amendment,a.amendment_sha,
                                a.fork_config,a.stage_dir,a.original_run_init_sha)))
    except (ValueError,OSError,KeyError,TypeError) as e: ap.exit(2,str(e)+'\n')

if __name__=='__main__': main()
