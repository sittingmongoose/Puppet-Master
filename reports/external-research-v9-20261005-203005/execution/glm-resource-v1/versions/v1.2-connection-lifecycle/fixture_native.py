"""Synthetic native-unit client lifecycle; no native CLI/provider/Goal imports."""
import argparse,json,subprocess,sys
from pathlib import Path

def send(process,value):process.stdin.write(json.dumps(value)+'\n');process.stdin.flush()
def rpc(process,identifier,method,params=None):
    send(process,{'jsonrpc':'2.0','id':identifier,'method':method,'params':params or {}})
    while True:
        line=process.stdout.readline()
        if not line:raise RuntimeError('Synthetic MCP peer exited')
        value=json.loads(line)
        if value.get('id')==identifier:
            if 'error' in value or value.get('result',{}).get('isError'):raise RuntimeError('Synthetic MCP request failed')
            return value['result']
def open_peer(server):
    process=subprocess.Popen([server['command'],*server['args']],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    placement=Path('/proc',str(process.pid),'cgroup').read_text().strip()
    if placement!=Path('/proc/self/cgroup').read_text().strip():raise ValueError('Native-spawned proxy placement differs')
    rpc(process,1,'initialize',{'protocolVersion':'2024-11-05','capabilities':{},'clientInfo':{'name':'synthetic-zero-inference','version':'1'}})
    send(process,{'jsonrpc':'2.0','method':'notifications/initialized'})
    rpc(process,2,'tools/list')
    return process,placement
def close_peer(process):
    process.stdin.close();process.wait(timeout=4)
    if process.returncode:raise RuntimeError('Synthetic proxy exit failed')
def emit(value):print(json.dumps(value),flush=True)
def main():
    a=argparse.ArgumentParser();a.add_argument('--config',required=True);args=a.parse_args();servers=json.loads(Path(args.config).read_text())
    placements=[]
    for server in servers:
        process,placement=open_peer(server);placements.append({'component':server['name'],'actual_proxy_cgroup':placement});close_peer(process)
    emit({'event':'discovery_disconnected','proxy_placements':placements,'model_calls':0,'native_goal_starts':0})
    for line in sys.stdin:
        command=json.loads(line)
        if command['action']=='finish':return 0
        if command['action']!='reconnect_and_work':raise ValueError('Synthetic action unknown')
        for server in servers:
            process,placement=open_peer(server);placements.append({'component':server['name'],'actual_proxy_cgroup':placement})
            if server['name']=='pm_boundary':
                rpc(process,3,'tools/call',{'name':'read_file','arguments':{'path':'TASK.md'}})
                rpc(process,4,'tools/call',{'name':'write_file','arguments':{'path':'out/synthetic.txt','text':'Synthetic zero-inference fixture only.\n'}})
            elif server['name']=='pm_execution':
                emit({'event':'sandbox_request_sent'})
                rpc(process,3,'tools/call',{'name':'python_execute','arguments':{'code':'import time;time.sleep(1);print(sum(data))','data':[2,3]}})
            close_peer(process)
        emit({'event':'reconnect_tools_done','proxy_placements':placements,'model_calls':0,'native_goal_starts':0})
    return 0
if __name__=='__main__':raise SystemExit(main())
