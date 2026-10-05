"""One fresh standalone Codex thread, native Goal, exactly one initial user turn.

No raw native output is persisted, hashed, or emitted. Notifications are reduced
in memory to the selected structural projection. Host never authors followups.
"""
import json
import os
from pathlib import Path
import queue
import signal
import subprocess
import threading
import time
from controls import CLI, MODEL, EFFORT, config, config_argv, verify_sources, projected_config_check
from projector import State, ident

METHODS={'initialize','config/read','model/list','mcpServerStatus/list',
         'thread/start','thread/resume','thread/goal/set','thread/goal/get','turn/start','turn/interrupt'}


class Protocol:
    def __init__(self, *, workspace, private_home, codex_home, proxy_argv, stop_ns, process_record,
                 native_mcp_servers=None, admitted_mcp=None):
        verify_sources()
        self.workspace=Path(workspace)
        self.stop_ns=stop_ns
        self.state=State(admitted_mcp=admitted_mcp)
        self.lock=threading.Lock()
        self.replies=queue.Queue()
        self.pending={}
        self.counter=0
        self.rpc_counts={}
        self.event_counts={}
        self.mcp_startup_receipts=[]
        self.attention=False
        self.last_poll=0
        self.event_signal=threading.Event()
        self.expected_config=config(proxy_argv, native_mcp_servers)
        self.command=[str(CLI),'app-server','--stdio','--strict-config',*config_argv(self.expected_config)]
        if time.monotonic_ns()>=stop_ns: raise TimeoutError('original native deadline')
        home=Path(private_home)
        home.mkdir(mode=0o700,exist_ok=False)
        dirs={name:home/('xdg-'+name) for name in ('config','cache','data','state')}
        for path in dirs.values():path.mkdir(mode=0o700)
        env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(home),
             'CODEX_HOME':str(codex_home),'XDG_CONFIG_HOME':str(dirs['config']),
             'XDG_CACHE_HOME':str(dirs['cache']),'XDG_DATA_HOME':str(dirs['data']),
             'XDG_STATE_HOME':str(dirs['state']),'PM_BOUND_DEADLINE_NS':str(stop_ns)}
        read_fd,self.write_fd=os.pipe()
        self.proc=subprocess.Popen(['/usr/bin/python3','-I','-B',str(Path(__file__).with_name('host_guard.py')),
            str(read_fd),str(stop_ns),str(process_record),'--',*self.command],
            cwd=workspace,env=env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,text=True,bufsize=1,pass_fds=(read_fd,),start_new_session=True)
        os.close(read_fd)
        threading.Thread(target=self._read,daemon=True).start()
        threading.Thread(target=self._discard_stderr,daemon=True).start()

    def _discard_stderr(self):
        # Native diagnostics may include arbitrary native data. Never capture them.
        while self.proc.stderr.read(4096):pass

    def _write(self,obj):
        with self.lock:
            self.proc.stdin.write(json.dumps(obj,separators=(',',':'))+'\n')
            self.proc.stdin.flush()

    def _read(self):
        try:
            for raw in self.proc.stdout:
                if len(raw.encode())>16*1024*1024:
                    self.state.failed=True;break
                try:obj=json.loads(raw)
                except Exception:self.state.failed=True;break
                if 'id' in obj:
                    if 'method' in obj:
                        # Approval, elicitation, token refresh and dynamic-tool requests
                        # receive a fixed denial; no params enter public artifacts.
                        self.attention=True
                        self._write({'id':obj['id'],'error':{'code':-32000,'message':'No additional host capability admitted'}})
                    else:self.replies.put(obj)
                else:
                    method=obj.get('method')
                    if isinstance(method,str):self.event_counts[method]=self.event_counts.get(method,0)+1
                    if method=='mcpServer/startupStatus/updated':
                        value=obj.get('params') or {}
                        self.mcp_startup_receipts.append({k:value[k] for k in ('threadId','server','status') if k in value})
                    try:self.state.event(obj)
                    except Exception:self.state.failed=True
                    self.event_signal.set()
        finally:self.replies.put(None)

    def call(self,method,params,timeout=20):
        if method not in METHODS: raise ValueError('host RPC not admitted')
        remaining=(self.stop_ns-time.monotonic_ns())/10**9
        if remaining<=0: raise TimeoutError('original native deadline')
        self.counter+=1;request_id=self.counter
        self.rpc_counts[method]=self.rpc_counts.get(method,0)+1
        self._write({'id':request_id,'method':method,'params':params})
        end=time.monotonic()+min(timeout,remaining)
        while True:
            if request_id in self.pending:row=self.pending.pop(request_id)
            else:
                try:row=self.replies.get(timeout=max(.001,end-time.monotonic()))
                except queue.Empty:raise TimeoutError('bounded RPC '+method)
                if row is None: raise RuntimeError('native host exit')
                if row.get('id')!=request_id:
                    self.pending[row.get('id')]=row
                    if time.monotonic()>=end:raise TimeoutError('bounded RPC')
                    continue
            if 'error' in row:raise RuntimeError('native RPC denied')
            return row.get('result')

    def notify(self,method,params):
        if method!='initialized':raise ValueError('notification not admitted')
        self._write({'method':method,'params':params})

    def close(self):
        try:self.proc.stdin.close()
        except OSError:pass
        try:os.close(self.write_fd)
        except OSError:pass
        try:self.proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            try:os.killpg(self.proc.pid,signal.SIGKILL)
            except ProcessLookupError:pass
            self.proc.wait(timeout=2)


def initialize(host):
    host.call('initialize',{'clientInfo':{'name':'er9_luna_route','version':'1'},
        'capabilities':{'experimentalApi':True}})
    host.notify('initialized',{})


def exact_catalog(host):
    row=host.call('model/list',{'limit':100,'includeHidden':True})
    matches=[x for x in row.get('data',[]) if x.get('model')==MODEL]
    if len(matches)!=1 or not any(x.get('reasoningEffort')==EFFORT for x in matches[0].get('supportedReasoningEfforts',[])):
        raise ValueError('native selected metadata/max acknowledgement missing')
    return {'model':MODEL,'effort':EFFORT,'catalog_control_acknowledged':True,
            'existing_account_access':'UNKNOWN until successful native inference'}


def exact_thread_mcp_catalog(host):
    """Use each persisted thread runtime, not bulk transient MCP discovery."""
    rows=[]
    for server in sorted(host.state.admitted_mcp):
        reply=host.call('mcpServerStatus/list',{'threadId':host.state.thread,
                        'serverName':server},timeout=60)
        if reply.get('nextCursor') or {x.get('name') for x in reply.get('data',[])}!={server}:
            raise ValueError('exact persisted MCP runtime required')
        rows.extend(reply['data'])
    return host.state.mcp_catalog({'data':rows,'nextCursor':None})


def run(host,objective,max_responses,write_public):
    initialize(host)
    effective=host.call('config/read',{'includeLayers':False,'cwd':str(host.workspace)})
    projected_config_check(effective['config'],host.expected_config)
    catalog=exact_catalog(host)
    start=host.call('thread/start',{'model':MODEL,'allowProviderModelFallback':False,'cwd':str(host.workspace),
        'ephemeral':False,'approvalPolicy':'never','sandbox':'workspace-write',
        'config':{'model_reasoning_effort':EFFORT}})
    fresh=host.state.bind_thread(start,host.workspace)
    mcp=host.state.mcp_catalog(host.call('mcpServerStatus/list',{'threadId':host.state.thread}))
    # Goal-set acknowledgement alone does not count as activated.
    goal=host.call('thread/goal/set',{'threadId':host.state.thread,'objective':objective,'status':'active'})
    if host.state.goal(goal)!='active':raise ValueError('native Goal active acknowledgement missing')
    if goal['goal'].get('objective')!=objective or type(goal['goal'].get('createdAt')) is not int:raise ValueError('exact original native Goal acknowledgement missing')
    host.state.goal_created_at=goal['goal']['createdAt'];host.state.goal_objective=objective
    host.state.goal_set_ack=True
    turn=host.call('turn/start',{'threadId':host.state.thread,'model':MODEL,'effort':EFFORT,
        'input':[{'type':'text','text':objective,'text_elements':[]}]})
    host.state.initial_turn=ident(turn['turn']['id']);host.state.initial_turn_ack=True
    host.state.maybe_activation()
    write_public('fresh-thread.json',fresh)
    write_public('native-catalog.json',catalog)
    write_public('native-mcp-catalog.json',mcp)
    while time.monotonic_ns()<host.stop_ns:
        write_public('activation.json',host.state.activation)
        if host.attention or host.state.failed:raise RuntimeError('unadmitted native capability/event')
        if max_responses!=1:raise ValueError('prospective Luna ABI sentinel required')
        if host.state.goal_status=='complete' and not host.state.active_turns:
            # Completion is native Goal state, separate from files and final text.
            final=host.call('thread/goal/get',{'threadId':host.state.thread})
            if host.state.goal(final)=='complete':return
        if host.state.goal_status in ('blocked','paused','usageLimited','budgetLimited'):break
        if time.monotonic()-host.last_poll>=1:
            host.state.goal(host.call('thread/goal/get',{'threadId':host.state.thread},timeout=3))
            host.last_poll=time.monotonic()
        host.event_signal.wait(.1);host.event_signal.clear()
    raise TimeoutError('native Goal did not complete within original caps')


def stop_native(host):
    # The PID1/cgroup deadline remains authoritative even if these RPCs stall.
    try:
        if host.state.thread and host.state.goal_status!='complete':
            host.call('thread/goal/set',{'threadId':host.state.thread,'status':'paused'},timeout=1)
        for turn in tuple(host.state.active_turns):
            host.call('turn/interrupt',{'threadId':host.state.thread,'turnId':turn},timeout=1)
    except Exception:pass
    finally:host.close()
