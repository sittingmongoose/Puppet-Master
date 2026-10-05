#!/usr/bin/env python3
"""One fresh native GLM 5.3 Flash Max Goal; no semantic host followups."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import native_support as ns

MODEL = 'builtin:zai-coding-plan/GLM-5.3-Flash'
CLI = '/home/sittingmongoose/.local/opt/zcode/app.backup-3.11.2.6792/resources/glm/zcode.cjs'
CLI_SHA = 'e9f1868c0fdb863537ed910ee3828b9be96b8c2fd805473f63b439e1113266b8'

def atomic(path, value):
    path = Path(path)
    temp = path.with_name(path.name + '.tmp')
    temp.write_text(json.dumps(ns.sanitized(value), indent=2, ensure_ascii=False)+'\n')
    os.replace(temp, path)

def identity(pid):
    try:
        raw = Path(f'/proc/{pid}/stat').read_text()
        fields = raw[raw.rfind(')')+2:].split()
        return {'pid':pid, 'start_ticks':int(fields[19]), 'pgid':int(fields[2]), 'state':fields[0]}
    except (OSError, ValueError, IndexError):
        return None

def group_members(pgid):
    return [i for p in Path('/proc').glob('[0-9]*/stat')
            if (i := identity(int(p.parent.name))) and i['pgid'] == pgid]

def validate_tools(config):
    names = config.get('tool_allowlist', [])
    servers = config.get('mcp_servers', [])
    if not isinstance(names,list) or any(not isinstance(n,str) or not n.startswith('mcp__') for n in names):
        raise ValueError('Only explicitly named confined MCP tools may be admitted')
    if names and not servers:
        raise ValueError('MCP tool names require their exact server configuration')
    if not isinstance(servers,list):
        raise ValueError('mcp_servers must be a list')
    return names, servers

class Protocol(ns.ZCodeProtocol):
    """Reuse official registry/stdio RPC, isolate configuration and capture redacted IO."""
    def __init__(self, node, cli, cwd, output, config):
        import selectors
        self.output, self.messages, self.responses, self.counter = output, [], {}, 0
        self.buffers = {'stdout':b'', 'stderr':b''}
        self.selector = selectors.DefaultSelector()
        self.telemetry = []
        self.private = output/'private-runtime'
        self.private.mkdir(mode=0o700)
        storage = self.private/'storage'
        home = self.private/'home'; home.mkdir(mode=0o700)
        xdg = {}
        for kind in ('config','cache','data','state'):
            xdg[kind] = self.private/('xdg-'+kind); xdg[kind].mkdir(mode=0o700)
        names, _ = validate_tools(config)
        settings = {'storage':{'dir':str(storage),'sessionDbPath':str(storage/'cli/db/db.sqlite')},
                    'plugins':{'enabled':False,'dirs':[]},
                    'skills':{'enabled':False,'includeInstructions':False,'roots':[]},
                    'hooks':{'enabled':False}, 'memory':{'use':False},
                    'features':{'subagent':False,'memory':False,'skill':False,'mcp':True},
                    'mcp':{'servers':{}},
                    'permission':{'mode':'build','allowedTools':names,'disallowedTools':[],
                                  'autoApproveHighRisk':False,'allowMediumRiskInAuto':False}}
        policy = cwd/'.zcode'; policy.mkdir(exist_ok=False)
        atomic(policy/'config.json',settings)
        personal=self.private/'personal-provider.json'; personal.write_text('{"providerRules":[]}\n')
        env={'PATH':'/home/sittingmongoose/.local/bin:/usr/bin:/bin','LANG':'C.UTF-8',
             'HOME':str(home),'USERPROFILE':str(home),
             'XDG_CONFIG_HOME':str(xdg['config']),'XDG_CACHE_HOME':str(xdg['cache']),
             'XDG_DATA_HOME':str(xdg['data']),'XDG_STATE_HOME':str(xdg['state']),
             'ZCODE_BUILTIN_PROVIDER_CONFIG_FILE':'/home/sittingmongoose/.local/opt/zcode/app/resources/config/provider/zcode-builtin.json',
             'ZCODE_PERSONAL_PROVIDER_CONFIG_FILE':str(personal),
             'ZCODE_STORAGE_DIR':str(storage),'ZCODE_LOG_DIR':str(storage/'cli/log'),
             'ZCODE_SESSION_DB_PATH':str(storage/'cli/db/db.sqlite'),'ZCODE_LOG_CONSOLE':'0'}
        self.command=[str(node),str(cli),'app-server','--no-color','--cwd',str(cwd)]
        # Trusted native host gets auth only in memory. Candidate tools get only
        # the explicit confined MCP configuration, never the native host env.
        watch_read,self.watch_write=os.pipe()
        guard=[sys.executable,'-I','-B',str(Path(__file__).with_name('native_guard.py')),
               '--watch-fd',str(watch_read),'--deadline',str(config['_native_deadline_monotonic']),
               '--record',str(output/'native-host.json'),'--cwd',str(cwd),'--',*self.command]
        self.process=subprocess.Popen(guard,cwd=cwd,env=env,stdin=subprocess.PIPE,
                                      stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True,
                                      pass_fds=(watch_read,))
        os.close(watch_read)
        self.selector.register(self.process.stdout,selectors.EVENT_READ,'stdout')
        self.selector.register(self.process.stderr,selectors.EVENT_READ,'stderr')
        self.wire=(output/'protocol.redacted.jsonl').open('a')
        self.stderr=(output/'stderr.redacted.log').open('a')
        atomic(output/'native-process.json',{'identity':identity(self.process.pid),'argv':self.command,
                                           'private_runtime':str(self.private)})

    def send(self, message):
        # Do not hash or serialize a credential-bearing registry request to disk.
        if message.get('method') == 'workspace/updateProviderRegistry':
            self.wire.write(json.dumps({'at':ns.utc(),'direction':'out','method':message['method'],
                                        'credential_projection':'omitted'})+'\n'); self.wire.flush()
            self.process.stdin.write((json.dumps(message)+'\n').encode()); self.process.stdin.flush()
        else:
            super().send(message)

    def poll(self,seconds=.1):
        received = super().poll(seconds)
        for obj in received:
            if obj.get('method') == 'v4/telemetry/event':
                self.telemetry.append(obj.get('params') or {})
        return received

    def answer_host_request(self, message):
        if message['method']=='session/requestRuntimePreferences':
            self.send({'id':message['id'],'result':{'nativeSearchEnhancementsEnabled':False,
                       'memoryEnabled':False,'askUserQuestionAutoResolutionEnabled':False,
                       'modelContextBudgetStrategy':'preflight-v1'}})
        else:
            super().answer_host_request(message)

    def close(self):
        try: result=super().close()
        finally:
            try: os.close(self.watch_write)
            except OSError: pass
        # Parent exits can leave adopted descendants; dedicated group ownership
        # was established at Popen and is checked independently of receipt status.
        if group_members(self.process.pid):
            try: os.killpg(self.process.pid,signal.SIGTERM)
            except ProcessLookupError: pass
            time.sleep(.15)
        if group_members(self.process.pid):
            try: os.killpg(self.process.pid,signal.SIGKILL)
            except ProcessLookupError: pass
        native_record=self.output/'native-host.json'
        pgids=[self.process.pid]
        if native_record.exists(): pgids.append(json.loads(native_record.read_text())['native_identity']['pgid'])
        remaining=[member for pgid in pgids for member in group_members(pgid) if member['state']!='Z']
        result.update({'dedicated_pgid':self.process.pid,'remaining_group_members':remaining,
                       'native_quiescent':self.process.poll() is not None and not remaining})
        return result

def run(args, protocol_factory=Protocol):
    started=time.monotonic(); epoch=time.time()
    supplied_deadline=getattr(args,'deadline_monotonic',None)
    deadline=min(started+args.max_seconds,supplied_deadline) if supplied_deadline is not None else started+args.max_seconds
    if args.max_seconds <= 35 or args.max_responses < 1:
        raise ValueError('Stage needs a finite positive response limit and >35 seconds including cleanup')
    ws=Path(args.workspace).resolve(strict=True); out=Path(args.out).absolute()
    if out == ws or out.is_relative_to(ws): raise ValueError('Native evidence must be outside candidate workspace')
    if any(p.is_symlink() for p in (ws,*ws.parents,out,*out.parents)):
        raise ValueError('Symlink aliases are not stage roots')
    objective=Path(args.prompt_file).read_text()
    raw_prompt_sha256=ns.sha(objective.encode())
    if objective.startswith('/goal\n'): objective=objective.split('\n',1)[1]
    objective=objective.strip()
    if not objective.strip(): raise ValueError('Empty Goal objective')
    config=json.loads(Path(args.tools_config).read_text()) if args.tools_config else {'tool_allowlist':[],'mcp_servers':[]}
    names, servers=validate_tools(config)
    cli=Path(args.cli).resolve(strict=True); node=Path(args.node).resolve(strict=True)
    if ns.sha(cli.read_bytes()) != CLI_SHA: raise ValueError('Accepted installed native CLI drift')
    out.mkdir(parents=True,exist_ok=False,mode=0o700)
    (out/'OBJECTIVE.md').write_text(objective)
    atomic(out/'tools-config.json',config)
    receipt={'schema':'er9.native-stage.v1','job_id':args.job_id,'start_utc':ns.utc(),
             'birth_epoch':epoch,'birth_monotonic':started,'deadline_monotonic':deadline,
             'max_seconds':args.max_seconds,'max_responses':args.max_responses,
             'requested_model':MODEL,'requested_effort':'max','fresh_session':True,
             'native_goal_entry':'official app-server session/goal set', 'status':'starting',
             'raw_prompt_sha256':raw_prompt_sha256,'prompt_sha256':ns.sha(objective.encode()),'tool_allowlist':names,
             'cli_path':str(cli),'cli_sha256':CLI_SHA,'goal_activated':False,
             'unknown_costs':['dollar billing','unexposed provider child usage']}
    atomic(out/'receipt.json',receipt)
    client=None; sid=None; snapshot={}; requests={}; usage={}; stop=[]
    previous={sig:signal.signal(sig,lambda s,f:stop.append(s)) for sig in (signal.SIGINT,signal.SIGTERM)}
    def call(method,params,timeout=45,cleanup=False):
        remaining=(deadline if cleanup else deadline-30)-time.monotonic()
        if remaining <= 0: raise TimeoutError('Original stage deadline exhausted')
        return client.request(method,params,timeout=min(timeout,remaining))
    try:
        client=protocol_factory(node,cli,ws,out,{**config,'_native_deadline_monotonic':deadline-5})
        registry=ns.desktop_registry(Path(args.desktop_config),MODEL)
        # Use a nonsecret revision; original helper's credential-derived registry
        # digest is not emitted or used for public configuration identity.
        registry['revision']='er9-native-glm-flash-max'
        workspace={'workspacePath':str(ws),'workspaceKey':str(ws)}
        admitted=call('workspace/updateProviderRegistry',{'workspace':workspace,'registry':registry,'includeWorkspaceState':False})
        if admitted.get('status') not in {'applied','unchanged'}: raise RuntimeError('Official registry admission failed')
        call('workspace/updateModelIoPreferences',{'workspace':workspace,'preferences':{'fullRetentionEnabled':True}})
        created=call('session/create',{'workspace':workspace,'mode':'build',
                     'model':{'providerId':MODEL.split('/')[0],'modelId':MODEL.split('/')[1]},
                     'thoughtLevel':'max','titleGenerationEnabled':False,'toolAllowlist':names,'mcpServers':servers})
        snapshot=created.get('snapshot',created); sid=snapshot.get('session',{}).get('sessionId') or created.get('sessionId')
        if not sid: raise RuntimeError('Fresh native session identity missing')
        snapshot=call('session/read',{'sessionId':sid})
        selected=snapshot.get('snapshot',snapshot).get('settings',{})
        model=selected.get('model',{}).get('current',{})
        effort=selected.get('thoughtLevel',{}).get('current')
        if (model.get('providerId')+'/'+model.get('modelId',''),effort)!=(MODEL,'max'):
            raise RuntimeError('Observed model/effort differs from exact requested route')
        receipt.update({'session_id':sid,'observed_model':model,'observed_effort':effort,'status':'route_ready'})
        atomic(out/'receipt.json',receipt)
        if args.probe:
            receipt['status']='probe_ready'
        else:
            receipt['goal_submitted']=True
            atomic(out/'receipt.json',receipt)
            activation=call('session/goal',{'sessionId':sid,'action':'set','objective':objective},timeout=60)
            target=(activation.get('snapshot') or {}).get('session',{}).get('target') or {}
            atomic(out/'activation.json',activation)
            # Record positive native activation before any stricter validation:
            # a validation failure must never erase an actual charged Goal start.
            receipt.update({'goal_activated':activation.get('startedTurn') is True and target.get('status')=='active',
                            'goal_target_id':target.get('targetId'),'activation_utc':ns.utc()})
            atomic(out/'receipt.json',receipt)
            if activation.get('startedTurn') is not True or target.get('status')!='active' or target.get('objective')!=objective:
                raise RuntimeError('Genuine native Goal activation receipt mismatch')
            receipt.update({'goal_activated':True,'goal_target_id':target.get('targetId'),'activation_utc':ns.utc(),
                            'pre_activation_seconds':time.monotonic()-started,'status':'running'})
            atomic(out/'receipt.json',receipt)
            while True:
                for p in client.telemetry:
                    if p.get('kind')=='model.request.status': requests[p.get('requestId')]=p.get('status')
                    if p.get('kind')=='usage.delta': usage[p.get('requestId')]=p
                client.telemetry.clear()
                done=sum(s in {'model_request_completed','model_request_failed'} for s in requests.values())
                if stop: receipt['status']='interrupted'; break
                if time.monotonic()>=deadline-30: receipt['status']='cap_seconds'; break
                if done>=args.max_responses: receipt['status']='cap_responses'; break
                if client.process.poll() is not None: receipt['status']='native_host_exited'; break
                snapshot=call('session/read',{'sessionId':sid,'messageLimit':200})
                target=snapshot.get('projection',{}).get('target') or snapshot.get('session',{}).get('target') or {}
                if target.get('targetId') != receipt['goal_target_id']: raise RuntimeError('Goal target identity drift')
                terminal=ns.snapshot_terminal(snapshot,MODEL,'max')
                if terminal: receipt['status']=terminal; break
                until=min(deadline-30,time.monotonic()+2)
                while time.monotonic()<until and not stop: client.poll(min(.2,until-time.monotonic()))
    except Exception as exc:
        receipt.update({'status':'execution_error','error_class':type(exc).__name__,'error':ns.sanitized(str(exc))})
    finally:
        if client:
            if sid:
                if receipt['status']!='completed':
                    for method,params in [('session/goal',{'sessionId':sid,'action':'pause'}),('session/stop',{'sessionId':sid})]:
                        try: call(method,params,timeout=3,cleanup=True)
                        except Exception as exc: receipt.setdefault('cleanup_errors',[]).append(type(exc).__name__)
                try: snapshot=call('session/read',{'sessionId':sid,'messageLimit':200},timeout=4,cleanup=True)
                except Exception as exc: receipt.setdefault('capture_errors',[]).append(type(exc).__name__)
                atomic(out/'final-session.redacted.json',snapshot)
                try: receipt['native_usage']=call('v4/conversation/usage',{'sessionId':sid},timeout=4,cleanup=True)
                except Exception as exc: receipt.setdefault('capture_errors',[]).append(type(exc).__name__)
                try: call('session/close',{'sessionId':sid},timeout=3,cleanup=True)
                except Exception as exc: receipt.setdefault('cleanup_errors',[]).append(type(exc).__name__)
            receipt['cleanup']=client.close()
            if sid:
                try:
                    receipt['native_io']=ns.capture_native_io(out,client.private/'storage/cli/rollout',sid)
                    receipt['actual_models']=receipt['native_io']['actual_models']
                    if any(i['providerId']+'/'+i['modelId']!=MODEL or i.get('variant') not in {None,'max'} for i in receipt['actual_models']):
                        receipt['status']='route_changed'
                    receipt['effort_request_verification']='verified' if receipt['actual_models'] and all(i.get('variant')=='max' for i in receipt['actual_models']) else 'unknown'
                except Exception as exc: receipt.setdefault('capture_errors',[]).append(type(exc).__name__)
                try: receipt['provider_usage']=ns.capture_provider_usage(out,client.private/'storage/cli/db/db.sqlite',sid)
                except Exception as exc: receipt.setdefault('capture_errors',[]).append(type(exc).__name__)
            if not receipt['cleanup'].get('native_quiescent'): receipt['status']='quiescence_unverified'
        receipt['request_status_counts']={s:list(requests.values()).count(s) for s in set(requests.values())}
        receipt['native_responses']=sum(s in {'model_request_completed','model_request_failed'} for s in requests.values())
        receipt['last_usage_delta_by_request_totals']={k:sum(int(p.get(k) or 0) for p in usage.values()) for k in ('inputTokens','outputTokens','reasoningTokens','cacheReadTokens','cacheWriteTokens','totalTokens')}
        receipt['usage_counter_semantics']='last observed usage.delta per request only, not asserted inclusive usage; all raw redacted usage.delta events preserved in protocol; exact provider attempt export preferred; cache fields not added to total; not dollars'
        receipt['ended_utc']=ns.utc(); receipt['elapsed_seconds']=time.monotonic()-started
        receipt['caps_include_setup_and_cleanup']=True
        atomic(out/'receipt.json',receipt)
        for sig,handler in previous.items(): signal.signal(sig,handler)
    return receipt

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for name in ('workspace','prompt-file','out','job-id'): p.add_argument('--'+name,required=True)
    p.add_argument('--tools-config'); p.add_argument('--max-seconds',type=float,required=True)
    p.add_argument('--max-responses',type=int,required=True); p.add_argument('--probe',action='store_true')
    p.add_argument('--deadline-monotonic',type=float)
    p.add_argument('--cli',default=CLI); p.add_argument('--node',default=ns.DEFAULT_NODE)
    p.add_argument('--desktop-config',default=ns.DEFAULT_DESKTOP_CONFIG)
    a=p.parse_args(); r=run(a)
    print(json.dumps({'job_id':a.job_id,'status':r['status'],'receipt':str(Path(a.out)/'receipt.json')}),flush=True)
    return 0 if r['status'] in {'completed','probe_ready'} else 1
if __name__=='__main__': raise SystemExit(main())
