"""Fixed host ABI selected by the separately armed immutable lifetime wrapper."""
import argparse
import json
from pathlib import Path
import runpy
import sys

HERE=Path(__file__).resolve().parent

def main():
    parser=argparse.ArgumentParser()
    for name in ('config','lease','case-binding','acceptance'): parser.add_argument('--'+name,type=Path,required=True)
    args=parser.parse_args()
    sys.path.insert(0,str(HERE))
    import admission
    active=admission.bind(args.config,args.lease,args.case_binding,args.acceptance)
    b=active['binding']
    argv=['--workspace',b['workspace'],'--prompt-file',b['prompt_file'],'--out',b['native_out'],
          '--label',b['label'],'--max-seconds',str(b['max_seconds']),'--max-responses',str(b['max_responses']),
          '--admission-file',str(args.case_binding)]
    if b['public_get']: argv.append('--public-get')
    argv+=['--mode',b['mode']]
    sys.argv=[str(HERE/'native_runner.py'),*argv]
    runpy.run_path(str(HERE/'native_runner.py'),run_name='__main__')

if __name__=='__main__':
    try: main()
    except Exception as error:
        # No raw errors, native responses or keys cross the host projection.
        print(json.dumps({'schema':'er8.route.launch-result.v1','outcome':'HOLD','error_class':type(error).__name__}),flush=True)
        raise SystemExit(126)
