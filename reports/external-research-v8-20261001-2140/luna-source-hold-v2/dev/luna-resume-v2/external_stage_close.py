"""Held-parent requested positive failure-inclusive settlement child."""
import argparse
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
from failure_settlement import close_stage

def finalize(args):
    armed(args.deadline_ns)
    home=Path(args.run_root)/args.case/args.job
    birth_path=home/'BIRTH.json'
    if not birth_path.is_file():birth_path=home.parent/(args.job+'.BIRTH.json')
    birth=read_json(birth_path)
    if birth.get('case')!=args.case or birth.get('job')!=args.job or birth.get('stage_monotonic_ns')!=args.stage_ns or birth.get('original_deadline_monotonic_ns')!=args.deadline_ns:raise ValueError('original exact stage birth required')
    close_stage(home,birth,{'pid':args.actor_pid,'returncode':args.actor_returncode,'exit_monotonic_ns':args.actor_exit_ns})

def main():
    p=argparse.ArgumentParser()
    for n in ('run-root','case','job'):p.add_argument('--'+n,required=True)
    for n in ('stage-ns','deadline-ns','actor-pid','actor-returncode','actor-exit-ns'):p.add_argument('--'+n,type=int,required=True)
    try:finalize(p.parse_args())
    except Exception as error:
        print(json.dumps({'outcome':'HOLD','error_class':type(error).__name__,'occupancy':'held'}),flush=True);raise SystemExit(126)
if __name__=='__main__':main()
