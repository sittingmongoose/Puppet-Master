"""Luna route host adapter below unchanged accepted absolute lifetime boundary."""
import argparse
import importlib.util
import json
from pathlib import Path
import os
import time
from controls import CLI, CLI_SHA, verify_sources
import admission
from native_driver import Protocol, run, stop_native

HERE=Path(__file__).resolve().parent
RECOVERY=Path('LAB_ROOT/dev/route-recovery-v1')


def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod


def public_writer(root):
    def write(name,value):
        if name not in {'fresh-thread.json','native-catalog.json','native-mcp-catalog.json',
                       'activation.json','public-metrics.json','outcome.json'}:
            raise ValueError('public projection filename not admitted')
        target=root/name; temporary=target.with_suffix('.tmp')
        temporary.write_text(json.dumps(value,indent=2)+'\n');os.replace(temporary,target)
    return write


def group_absent(pgid):
    for path in Path('/proc').glob('[0-9]*/stat'):
        try:
            raw=path.read_text();fields=raw[raw.rfind(')')+2:].split()
            if int(fields[2])==pgid and fields[0]!='Z':return False
        except (OSError,ValueError,IndexError):pass
    return True


def main():
    p=argparse.ArgumentParser()
    for name in ('workspace','prompt-file','out','admission-file'):p.add_argument('--'+name,type=Path,required=True)
    p.add_argument('--label',required=True)
    p.add_argument('--max-seconds',type=float,required=True)
    p.add_argument('--max-responses',type=int,required=True)
    p.add_argument('--public-get',action='store_true')
    p.add_argument('--mode',choices=('canary','productive'),required=True)
    args=p.parse_args();accepted=admission.validate_admission(args,HERE,HERE.parents[1])
    selected=verify_sources()
    args.out.mkdir(mode=0o700,parents=True,exist_ok=False)
    write=public_writer(args.out)
    boundary=load('accepted_er8_mcp_route',RECOVERY/'route-assembly-v1/boundary.py')
    stop_ns=admission.ACTIVE['lease']['native_stop_monotonic_ns']
    objective=args.prompt_file.read_text().strip()
    if objective.startswith('/goal\n'):objective=objective.split('\n',1)[1]
    host=None;outcome='HOLD';error_class=None
    try:
        host=Protocol(workspace=args.workspace,private_home=args.out/'private-home',
            codex_home=admission.ACTIVE['config']['private_codex_home'],
            proxy_argv=boundary.command(args.workspace,args.public_get),stop_ns=stop_ns,
            process_record=args.out/'host-process.json')
        run(host,objective,args.max_responses,write)
        outcome='native_goal_complete'
    except Exception as error:error_class=type(error).__name__
    finally:
        if host:
            stop_native(host)
            metrics=host.state.metrics()
            groups_absent=group_absent(host.proc.pid)
            record=args.out/'host-process.json'
            if record.exists():groups_absent=groups_absent and group_absent(json.loads(record.read_text())['native_host_pgid'])
            metrics.update(host_groups_absent=groups_absent,original_native_stop_monotonic_ns=stop_ns,
                           root_release_bound=True,runtime_snapshot_sha256=accepted['runtime_snapshot_sha256'],
                           selected_control_proof=selected,native_goal_completed_observed=host.state.goal_status=='complete',
                           boundary_outcome=outcome,error_class=error_class)
            metrics['source_proven_tool_restriction_verified']=True
            metrics['native_mcp_catalog_verified']=host.state.mcp_verified
            metrics['actual_inference_tool_payload_observed']=False
            metrics['component_outcome']='passed' if outcome=='native_goal_complete' and groups_absent and not host.state.failed else 'HOLD'
            metrics['canary_independently_qualified']=args.mode=='productive'
            # Native completion is a component observation; independent canary/artifact
            # quality and same-family criticism remain separate pipeline gates.
            write('activation.json',host.state.activation);write('public-metrics.json',metrics)
        write('outcome.json',{'outcome':outcome,'error_class':error_class,
            'raw_native_output_persisted':False,'provider_auth_public':False})
    return 0 if outcome=='native_goal_complete' else 126

if __name__=='__main__':raise SystemExit(main())
