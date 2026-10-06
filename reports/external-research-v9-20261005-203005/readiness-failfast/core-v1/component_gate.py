"""Trusted exact live kernel placement gate before native/tool command executes."""
import argparse,json,os,time
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
import profile

def main():
    p=argparse.ArgumentParser();p.add_argument('--resource-profile',required=True);p.add_argument('--component',required=True)
    p.add_argument('--unit',required=True);p.add_argument('--record',required=True);p.add_argument('--stop-ns',type=int,required=True)
    p.add_argument('command',nargs=argparse.REMAINDER);a=p.parse_args()
    value=profile.load(a.resource_profile)
    if time.monotonic_ns()>=a.stop_ns or a.stop_ns>value['original_total_stop_monotonic_ns']:raise TimeoutError('Original component stop')
    expected=value['slice_cgroup']+'/'+a.unit
    if Path('/proc/self/cgroup').read_text().strip()!='0::'+expected:raise ValueError('Actual component placement drift')
    facts=profile.reader.verify(value,a.unit,a.component)
    path=Path(a.record)
    record={'verified_before_command_exec':True,'unit':a.unit,'component':a.component,'actual_cgroup':expected,'kernel_proof':facts}
    path.write_text(json.dumps(record)+'\n')
    command=a.command[1:] if a.command[:1]==['--'] else a.command
    if not command:raise ValueError('Exact component command required')
    os.execv(command[0],command)
if __name__=='__main__':main()
