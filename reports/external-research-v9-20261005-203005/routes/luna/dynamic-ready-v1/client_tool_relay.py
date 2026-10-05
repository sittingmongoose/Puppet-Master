"""Exact five client-dynamic tools relayed to unchanged confined MCP servers.

This trusted transport adapter cannot execute code or interpret tool arguments.
The original source/runtime servers own the actual capability enforcement.
Every child uses the same tested original-deadline/EOF guardian as native Codex.
"""
import hashlib
import json
import os
from pathlib import Path
import queue
import signal
import subprocess
import threading
import time


def encoded(value):
    return json.dumps(value,allow_nan=False,separators=(',',':')).encode()


class BoundaryClient:
    def __init__(self,row,workspace,private,stop_ns,record):
        private.mkdir(mode=0o700)
        env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8','HOME':str(private),
             'PM_BOUND_DEADLINE_NS':str(stop_ns)}
        read_fd,self.write_fd=os.pipe()
        self.proc=subprocess.Popen(['/usr/bin/python3','-I','-B',
            str(Path(__file__).with_name('host_guard.py')),str(read_fd),str(stop_ns),str(record),
            '--',row['command'],*row['args']],cwd=workspace,env=env,
            stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,
            pass_fds=(read_fd,),start_new_session=True,text=True,bufsize=1)
        os.close(read_fd)
        self.stop_ns=stop_ns;self.counter=0;self.lock=threading.Lock();self.replies=queue.Queue()
        threading.Thread(target=self._read,daemon=True).start()
        threading.Thread(target=self._discard,daemon=True).start()
        try:
            self.call('initialize',{'protocolVersion':'2024-11-05',
                'capabilities':{},'clientInfo':{'name':'er9-confined-client-relay','version':'1'}})
            self.proc.stdin.write(json.dumps({'jsonrpc':'2.0','method':'notifications/initialized'})+'\n')
            self.proc.stdin.flush()
            self.tools=self.call('tools/list',{})['tools']
        except Exception:
            self.close();raise

    def _discard(self):
        while self.proc.stderr.read(4096):pass

    def _read(self):
        try:
            for line in self.proc.stdout:
                if len(line.encode())>2*1024*1024:raise ValueError('confined result cap')
                obj=json.loads(line)
                if 'id' in obj:self.replies.put(obj)
        finally:self.replies.put(None)

    def call(self,method,params):
        if method not in {'initialize','tools/list','tools/call'}:raise ValueError('relay method denied')
        with self.lock:
            self.counter+=1;ident=self.counter
            remaining=min(20,(self.stop_ns-time.monotonic_ns())/1e9)
            if remaining<=0:raise TimeoutError('original relay deadline')
            self.proc.stdin.write(json.dumps({'jsonrpc':'2.0','id':ident,'method':method,'params':params})+'\n')
            self.proc.stdin.flush()
            try:reply=self.replies.get(timeout=remaining)
            except queue.Empty:raise TimeoutError('confined tool response deadline')
            if reply is None:raise RuntimeError('confined tool transport closed')
            if reply.get('id')!=ident or 'error' in reply:raise RuntimeError('confined protocol mismatch')
            return reply['result']

    def close(self):
        try:self.proc.stdin.close()
        except OSError:pass
        try:os.close(self.write_fd)
        except OSError:pass
        try:self.proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            os.killpg(self.proc.pid,signal.SIGKILL);self.proc.wait(timeout=2)


class ClientToolRelay:
    def __init__(self,config,workspace,private,out,stop_ns):
        self.clients={};self.specs=[];self.calls=[];self.allowed={}
        private.mkdir(mode=0o700)
        for name in config['tool_allowlist']:
            _,server,tool=name.split('__');self.allowed.setdefault(server,set()).add(tool)
        try:
            for row in config['mcp_servers']:
                name=row['name']
                client=BoundaryClient(row,workspace,private/name,stop_ns,out/(name+'-host-process.json'))
                self.clients[name]=client
                if {t['name'] for t in client.tools}!=self.allowed[name]:raise ValueError('exact confined tool inventory required')
                self.specs.append({'type':'namespace','name':name,
                    'description':'User-preauthorized confined ER9 '+name+' capabilities.',
                    'tools':[{'type':'function','name':t['name'],'description':t['description'],
                              'inputSchema':t['inputSchema'],'deferLoading':False}
                             for t in client.tools]})
        except Exception:
            self.close();raise

    def dispatch(self,params,thread):
        # A provider cannot choose a process/path/schema or inject a host RPC.
        required={'threadId','turnId','callId','namespace','tool','arguments'}
        if set(params)!=required or not all(isinstance(params[k],str) for k in ('threadId','turnId','callId','namespace','tool')):
            raise ValueError('client call shape mismatch')
        namespace=params.get('namespace');tool=params.get('tool');args=params.get('arguments')
        if params.get('threadId')!=thread or not isinstance(args,dict) or tool not in self.allowed.get(namespace,set()):
            raise ValueError('unadmitted client tool binding')
        argument_bytes=encoded(args)
        result=self.clients[namespace].call('tools/call',{'name':tool,'arguments':args})
        content=result.get('content')
        if not isinstance(content,list) or not all(isinstance(x,dict) and x.get('type')=='text' and isinstance(x.get('text'),str) for x in content):
            raise ValueError('confined text-only tool response required')
        success=result.get('isError') is False
        self.calls.append({'namespace':namespace,'tool':tool,'call_id':params['callId'],
            'argument_sha256':hashlib.sha256(argument_bytes).hexdigest(),
            'response_sha256':hashlib.sha256(encoded(result)).hexdigest(),
            'response_bytes':len(encoded(result)),'success':success})
        return {'contentItems':[{'type':'inputText','text':x['text']} for x in content],
                'success':success}

    def close(self):
        for client in self.clients.values():
            client.close()
