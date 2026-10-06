"""One owned MCP byte stream to a prestarted, resource-gated service."""
import json,os,selectors,socket,struct,subprocess,threading,time,uuid
from pathlib import Path
import profile

class Bridge:
    def __init__(self,server,cwd,out,env):
        self.server=server;self.root=Path(out);self.cwd=cwd
        self.root.mkdir(mode=0o700,parents=True,exist_ok=True)
        self.socket_path='@er9glm'+uuid.uuid4().hex
        self.listener=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
        self.listener.bind('\0'+self.socket_path[1:])
        self.listener.listen(1);self.listener.settimeout(.1)
        self.stderr=(self.root/(server['name']+'.stderr')).open('wb')
        self.proc=subprocess.Popen([server['command'],*server['args']],cwd=cwd,env=env,
             stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=self.stderr,start_new_session=True)
        self.lifecycle={'backend_guard_pid':self.proc.pid,'accepted_connections':0,'disconnected_connections':0,
                        'backend_stdin_lifetime':'owned stage, independent of temporary proxy EOF'}
        self.lifecycle_path=self.root/(server['name']+'.lifecycle.json')
        self.save_lifecycle()
        self.stop=threading.Event();self.client=None
        self.thread=threading.Thread(target=self.relay,daemon=True);self.thread.start()
    def save_lifecycle(self):
        temp=self.lifecycle_path.with_suffix('.tmp');temp.write_text(json.dumps(self.lifecycle)+'\n');os.replace(temp,self.lifecycle_path)
    def relay(self):
        try:
            while not self.stop.is_set() and self.proc.poll() is None:
                self.client=None
                try:
                    self.client,_=self.listener.accept()
                    peer_pid,peer_uid,_=struct.unpack('3i',self.client.getsockopt(socket.SOL_SOCKET,socket.SO_PEERCRED,12))
                    if peer_uid!=os.getuid():raise ValueError('MCP peer UID differs from owner')
                    expected=profile.load(next(self.server['args'][i+1] for i,v in enumerate(self.server['args']) if v=='--resource-profile'))['slice_cgroup']
                    self.lifecycle['last_verified_peer']=profile.reader.verify_pid_placement(peer_pid,expected)
                    self.lifecycle['accepted_connections']+=1;self.save_lifecycle()
                except socket.timeout:continue
                except OSError:
                    if self.stop.is_set():return
                    raise
                # Native tool discovery uses a temporary client. Its EOF ends
                # that transport, not the stage-owned backend's lifetime.
                client=self.client;selector=selectors.DefaultSelector()
                try:
                    selector.register(client,selectors.EVENT_READ,'socket')
                    selector.register(self.proc.stdout,selectors.EVENT_READ,'backend')
                    disconnected=False
                    while not self.stop.is_set() and self.proc.poll() is None and not disconnected:
                        for key,_ in selector.select(.1):
                            data=os.read(key.fileobj.fileno(),65536)
                            if not data:
                                if key.data=='backend':return
                                disconnected=True;break
                            if key.data=='socket':self.proc.stdin.write(data);self.proc.stdin.flush()
                            else:client.sendall(data)
                except OSError:
                    if not self.stop.is_set():self.lifecycle['transport_disconnected']=True
                finally:
                    selector.close();client.close();self.client=None
                    self.lifecycle['disconnected_connections']+=1;self.save_lifecycle()
        finally:
            # Only explicit owner close/death or backend exit closes stdin.
            try:self.proc.stdin.close()
            except (OSError,BrokenPipeError):pass
    def native_config(self,resource_path):
        return {**self.server,'command':'/usr/bin/python3','args':['-I','-B',
            str(Path(__file__).with_name('pipe_proxy.py')),'--socket',str(self.socket_path),
            '--resource-profile',str(resource_path)],'env':[]}
    def close(self):
        self.stop.set()
        if self.client:
            try:self.client.shutdown(socket.SHUT_RDWR)
            except OSError:pass
            self.client.close()
        self.listener.close();self.thread.join(timeout=.5)
        try:self.proc.stdin.close()
        except (OSError,BrokenPipeError):pass
        try:self.proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            self.proc.terminate()
            try:self.proc.wait(timeout=2)
            except subprocess.TimeoutExpired:self.proc.kill();self.proc.wait(timeout=1)
        self.stderr.close()
        # Abstract owned endpoint disappears when the listener closes.
