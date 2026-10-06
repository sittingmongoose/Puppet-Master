"""One owned MCP byte stream to a prestarted, resource-gated service."""
import os,selectors,socket,struct,subprocess,threading,time,uuid
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
        self.stop=threading.Event();self.client=None
        self.thread=threading.Thread(target=self.relay,daemon=True);self.thread.start()
    def relay(self):
        selector=selectors.DefaultSelector()
        try:
            while not self.stop.is_set() and self.proc.poll() is None:
                try:
                    self.client,_=self.listener.accept()
                    peer_pid,peer_uid,_=struct.unpack('3i',self.client.getsockopt(socket.SOL_SOCKET,socket.SO_PEERCRED,12))
                    if peer_uid!=os.getuid():raise ValueError('MCP peer UID differs from owner')
                    expected=profile.load(next(self.server['args'][i+1] for i,v in enumerate(self.server['args']) if v=='--resource-profile'))['slice_cgroup']
                    profile.reader.verify_pid_placement(peer_pid,expected)
                    break
                except socket.timeout:continue
            if self.client is None:return
            selector.register(self.client,selectors.EVENT_READ,'socket')
            selector.register(self.proc.stdout,selectors.EVENT_READ,'backend')
            while not self.stop.is_set() and self.proc.poll() is None:
                for key,_ in selector.select(.1):
                    data=os.read(key.fileobj.fileno(),65536)
                    if not data:return
                    if key.data=='socket':self.proc.stdin.write(data);self.proc.stdin.flush()
                    else:self.client.sendall(data)
        finally:
            selector.close()
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
