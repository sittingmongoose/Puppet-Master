#!/usr/bin/env python3
"""Only public, pinned config validate/status commands. No serve/session/model.
Private read-only policy mount reuses the accepted v1 namespace recipe unchanged.
All process environment and policy inputs are synthetic; never reads existing auth.
"""
from pathlib import Path
import hashlib,json,subprocess,time
HERE=Path(__file__).resolve().parent
LAB=HERE.parent.parent
BIN=Path('USER_HOME/.local/bin/muse-bin-1.4.2-R4684.1')
BIN_SHA='dfb3096c91f4767c4d98006460800b7ba906a0b1a408280a926a8dc19a1af64f'
DEADLINE=1790988067.0349553

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run():
    assert time.time()<DEADLINE-45
    assert sha(BIN)==BIN_SHA
    home=HERE/'offline-home';home.mkdir(exist_ok=True)
    env={'HOME':str(home),'PATH':'/usr/bin:/bin'}
    capture=json.loads((LAB/'dev/source-capture-v1/binding.json').read_text())
    tools=capture['tool_names']
    assert tools==['read_file','write_file','mechanical','public_https_get']
    names=['mcp__pm_boundary__'+x for x in tools]
    source=HERE/'synthetic-policy-root';source.mkdir(exist_ok=True)
    native={'schema_version':1,'execution':{'tool_rules':{'update_goal':{'decision':'allow'}},'tool_rule_fallback':'deny'}}
    (source/'enterprise-policy.json').write_text(json.dumps(native,indent=2)+'\n')
    prefix=['/usr/bin/bwrap','--unshare-user','--unshare-pid','--die-with-parent','--cap-drop','ALL','--uid','0','--gid','0','--ro-bind','/','/','--tmpfs','/etc','--dir','/etc/muse','--ro-bind',str(source),'/etc/muse','--proc','/proc','--dev-bind','/dev','/dev','--']
    trials=[('native-goal-only',native,0)]
    for name in names:
        trials.append((name,{'schema_version':1,'execution':{'tool_rules':{name:{'decision':'allow'}},'tool_rule_fallback':'deny'}},1))
    trials.append(('assigned-four-only',{'schema_version':1,'execution':{'tool_rules':{n:{'decision':'allow'} for n in names},'tool_rule_fallback':'deny'}},1))
    denies=['read_file','subagent_spawn','subagent_status','subagent_send_message','subagent_wait','subagent_read_result','subagent_cancel']
    trials.append(('builtin-read-and-subagent-deny',{'schema_version':1,'execution':{'tool_rules':{n:{'decision':'deny'} for n in denies},'tool_rule_fallback':'deny'}},0))
    rows=[]
    for name,policy,expected in trials:
        assert time.time()<DEADLINE-30
        path=HERE/(name+'.json');path.write_text(json.dumps(policy,indent=2)+'\n')
        cmd=prefix+[str(BIN),'config','validate','--plane','policy','--file',str(path)]
        trace=HERE/(name+'.filetrace.txt')
        proc=subprocess.run(['/usr/bin/strace','-f','-e','trace=file','-o',str(trace)]+cmd,env=env,cwd=HERE,capture_output=True,text=True,timeout=15)
        rows.append({'name':name,'command':cmd,'observed_epoch':time.time(),'policy_sha256':sha(path),'trace_path':str(trace),'trace_sha256':sha(trace),'expected_exit':expected,'exit_code':proc.returncode,'stdout':proc.stdout,'stderr':proc.stderr})
        assert proc.returncode==expected,(name,proc.stdout,proc.stderr)
        if expected==1:assert 'semantic_invalid location=execution.tool_rules' in proc.stderr
    cmd=prefix+[str(BIN),'config','status']
    trace=HERE/'private-mount-status.filetrace.txt'
    proc=subprocess.run(['/usr/bin/strace','-f','-e','trace=file','-o',str(trace)]+cmd,env=env,cwd=HERE,capture_output=True,text=True,timeout=15)
    assert proc.returncode==0 and 'plane=policy source_class=system_file state=valid' in proc.stdout
    result={'schema':'er8.muse.contract.offline.v2','observed_epoch':time.time(),'binary_sha256':BIN_SHA,'tests':rows,'private_policy_mount_status':{'command':cmd,'exit_code':proc.returncode,'stdout':proc.stdout,'stderr':proc.stderr,'trace_path':str(trace),'trace_sha256':sha(trace)},'registered_names_basis':'public documented registered naming plus unchanged pm_boundary identity from frozen v1; not live runtime inventory','env_keys':sorted(env),'synthetic_home':str(home),'candidate_goals_started':0,'provider_requests_started':0,'serve_processes_started':0,'actual_auth_read_or_projection':False,'runtime_enforcement_exercised':False,'apparmor_changed':False,'route_admission':'HOLD'}
    (HERE/'offline-probe-result.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'checks':len(rows)+1,'results':[(r['name'],r['exit_code']) for r in rows],'private_policy_loading':'valid','runtime_enforcement_exercised':False,'route_admission':'HOLD'}))
if __name__=='__main__':run()
