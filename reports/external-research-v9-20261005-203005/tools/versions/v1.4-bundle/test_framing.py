"""No-inference regressions for persistent MCP pipe framing and original bounds."""
import importlib.util
import json
import os
from pathlib import Path
import selectors
import subprocess
import tempfile
import time
import unittest

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('framing_config',HERE/'config.py')
config=importlib.util.module_from_spec(spec);spec.loader.exec_module(config)

class Peer:
    def __init__(self,command):
        self.p=subprocess.Popen(command,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        self.sel=selectors.DefaultSelector();self.sel.register(self.p.stdout,selectors.EVENT_READ)
        os.set_blocking(self.p.stdout.fileno(),False);self.pending=bytearray()
    def send(self,frames):
        self.p.stdin.write(b''.join(json.dumps(f).encode()+b'\n' for f in frames));self.p.stdin.flush()
    def receive(self,timeout=2):
        stop=time.monotonic()+timeout
        while b'\n' not in self.pending:
            if not self.sel.select(max(0,stop-time.monotonic())):raise TimeoutError('frame response')
            raw=os.read(self.p.stdout.fileno(),65536)
            if not raw:raise EOFError('source EOF')
            self.pending.extend(raw)
        end=self.pending.index(b'\n')+1;raw=bytes(self.pending[:end]);del self.pending[:end]
        return json.loads(raw)
    def close(self):
        if not self.p.stdin.closed:self.p.stdin.close()
        try:self.p.wait(timeout=3)
        except subprocess.TimeoutExpired:self.p.kill();self.p.wait(timeout=3)
        self.sel.close();self.p.stdout.close();self.p.stderr.close()

def frame(i,method,params=None):
    value={'jsonrpc':'2.0','method':method}
    if i is not None:value['id']=i
    if params is not None:value['params']=params
    return value

class FramingTests(unittest.TestCase):
    def setUp(self):self.tmp=tempfile.TemporaryDirectory(prefix='er9-framing-');self.root=Path(self.tmp.name);self.peers=[]
    def tearDown(self):
        for peer in self.peers:peer.close()
        self.tmp.cleanup()
    def execution(self,seconds=8):
        cmd=['/usr/bin/python3','-I','-B',str(HERE/'execution_server.py'),'--evidence-dir',str(self.root/'receipts'),'--deadline-monotonic-ns',str(time.monotonic_ns()+int(seconds*1e9))]
        peer=Peer(cmd);self.peers.append(peer);return peer
    def test_initialize_notification_list_coalesced_persistent_pipe(self):
        peer=self.execution();peer.send([frame(1,'initialize'),frame(None,'notifications/initialized'),frame(2,'tools/list')])
        self.assertEqual(peer.receive()['id'],1);listed=peer.receive();self.assertEqual(listed['id'],2)
        self.assertEqual([t['name'] for t in listed['result']['tools']],['python_execute']);self.assertIsNone(peer.p.poll())
        peer.send([frame(None,'notifications/cancelled'),frame(3,'ping'),frame(4,'ping')])
        self.assertEqual([peer.receive()['id'],peer.receive()['id']],[3,4])
    def test_fragmented_frames_and_controller_eof(self):
        peer=self.execution();raw=json.dumps(frame(1,'initialize')).encode()+b'\n'
        peer.p.stdin.write(raw[:10]);peer.p.stdin.flush();time.sleep(.05)
        peer.p.stdin.write(raw[10:]);peer.p.stdin.flush();self.assertEqual(peer.receive()['id'],1)
        peer.p.stdin.close();self.assertEqual(peer.p.wait(timeout=2),0)
    def test_original_deadline_while_idle_and_partial_frame(self):
        for partial in (False,True):
            peer=self.execution(.5)
            if partial:peer.p.stdin.write(b'{"unfinished"');peer.p.stdin.flush()
            self.assertEqual(peer.p.wait(timeout=2),0)
    def test_call_after_notification_real_execution_receipt_and_eof_quiet(self):
        peer=self.execution();peer.send([frame(1,'initialize')]);self.assertEqual(peer.receive()['id'],1)
        peer.send([frame(None,'notifications/initialized'),frame(2,'tools/list'),frame(3,'tools/call',{'name':'python_execute','arguments':{'code':'print(sum(data))','data':[2,3]}})])
        self.assertEqual(peer.receive()['id'],2);result=peer.receive(3)
        value=json.loads(result['result']['content'][0]['text']);self.assertEqual(value['stdout'],'5\n');self.assertEqual(value['exit_code'],0);self.assertTrue(value['cleanup_confirmed'])
        peer.p.stdin.close();self.assertEqual(peer.p.wait(timeout=2),0)
        request=json.loads((self.root/'receipts'/value['execution_id']/'request.json').read_text())
        status=subprocess.run(['/usr/bin/systemctl','--user','show',request['unit'],'--property=ActiveState','--value'],capture_output=True,text=True)
        self.assertEqual(status.returncode,0);self.assertEqual(status.stdout.strip(),'inactive')
    def test_original_deadline_and_controller_eof_during_real_execution(self):
        for close_controller in (False,True):
            peer=self.execution(.8);peer.send([frame(1,'initialize')]);self.assertEqual(peer.receive()['id'],1)
            peer.send([frame(2,'tools/call',{'name':'python_execute','arguments':{'code':'import time; time.sleep(30)'}})])
            if close_controller:peer.p.stdin.close()
            result=peer.receive(3);value=json.loads(result['result']['content'][0]['text'])
            self.assertNotEqual(value['exit_code'],0);self.assertTrue(value['cleanup_confirmed'],value)
            self.assertLess(value['elapsed_seconds'],3);self.assertEqual(peer.p.wait(timeout=2),0)
            request=json.loads((self.root/'receipts'/value['execution_id']/'request.json').read_text())
            status=subprocess.run(['/usr/bin/systemctl','--user','show',request['unit'],'--property=ActiveState','--value'],capture_output=True,text=True)
            self.assertEqual(status.returncode,0);self.assertEqual(status.stdout.strip(),'inactive')
    def test_source_notification_list_read_coalesced_unchanged(self):
        ws=self.root/'case';ws.mkdir();(ws/'inputs').mkdir();(ws/'out').mkdir();(ws/'TASK.md').write_text('Synthetic source framing only.\n')
        cfg=config.mcp_configs(ws,public_get=True)['mcp_servers'][0];peer=Peer([cfg['command'],*cfg['args']]);self.peers.append(peer)
        peer.send([frame(1,'initialize'),frame(None,'notifications/initialized'),frame(2,'tools/list'),frame(3,'tools/call',{'name':'read_file','arguments':{'path':'TASK.md'}})])
        self.assertEqual(peer.receive()['id'],1);listed=peer.receive();self.assertEqual(listed['id'],2)
        self.assertEqual({t['name'] for t in listed['result']['tools']},{'read_file','write_file','mechanical','public_https_get'})
        reply=peer.receive();self.assertFalse(reply['result']['isError']);self.assertIsNone(peer.p.poll())

if __name__=='__main__':unittest.main(verbosity=2)
