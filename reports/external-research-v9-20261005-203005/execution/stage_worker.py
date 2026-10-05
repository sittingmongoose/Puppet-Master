#!/usr/bin/env python3
"""Exactly one prepared immutable stage packet -> native Goal -> actual output freeze."""
import argparse
import json
from pathlib import Path, PurePosixPath
import shutil
import time
import glm_stage as g

def digest(path): return g.ns.sha(Path(path).read_bytes())

def pinned(path, expected):
    original=Path(path).absolute()
    if any(p.is_symlink() for p in (original,*original.parents)) or not original.is_file():
        raise ValueError('Pinned regular file without aliases required')
    if digest(original)!=expected: raise ValueError('Prospective file pin mismatch: '+str(original))
    return original

def inventory(root):
    rows=[]
    for path in sorted(root.rglob('*')):
        if path.is_symlink(): raise ValueError('Output alias cannot be frozen')
        if path.is_file():
            rows.append({'path':str(path),'relative_path':path.relative_to(root).as_posix(),
                         'sha256':digest(path),'bytes':path.stat().st_size})
    return rows

def run(spec):
    started=time.monotonic(); epoch=time.time(); deadline=started+spec['max_seconds']
    ws=Path(spec['workspace']).absolute(); out=Path(spec['out']).absolute()
    final=Path(spec.get('freeze_out',str(out.parent/'OUTPUT_FREEZE.json'))).absolute()
    if final.exists(): raise ValueError('Original stage freeze already exists')
    if any(p.is_symlink() for p in (ws,*ws.parents,out,*out.parents,final,*final.parents)):
        raise ValueError('Stage path aliases denied')
    pinned(spec['prompt_file'],spec['prompt_sha256'])
    pinned(spec['tools_config'],spec['tools_config_sha256'])
    freeze=spec['pair_freeze']; pinned(freeze['path'],freeze['sha256'])
    for path,sha in spec['input_pins'].items():
        admitted=Path(path).absolute()
        if not admitted.is_relative_to(ws/'inputs'): raise ValueError('Candidate input outside its read-only namespace')
        pinned(admitted,sha)
    required=[]
    for path in spec['required_artifacts']:
        rel=PurePosixPath(path)
        if rel.is_absolute() or '..' in rel.parts or str(rel)!=path or rel.parts[0]!='out':
            raise ValueError('Canonical out/ artifact path required')
        required.append(str(rel))
    args=argparse.Namespace(workspace=str(ws),prompt_file=spec['prompt_file'],out=str(out),
            job_id=spec['job_id'],max_seconds=spec['max_seconds'],max_responses=spec['max_responses'],
            tools_config=spec['tools_config'],probe=False,cli=g.CLI,node=g.ns.DEFAULT_NODE,
            desktop_config=g.ns.DEFAULT_DESKTOP_CONFIG,deadline_monotonic=deadline)
    result=g.run(args)
    frozen=out.parent/'frozen-output'
    shutil.copytree(ws/'out',frozen)
    artifacts=inventory(frozen)
    index={'out/'+r['relative_path']:r for r in artifacts}
    missing=[r for r in required if r not in index or index[r]['bytes']==0]
    json_errors=[]
    for path in required:
        if path.endswith('.json') and path in index:
            try: json.loads(Path(index[path]['path']).read_text())
            except (ValueError,UnicodeError): json_errors.append(path)
    elapsed=time.monotonic()-started
    complete=(result['status']=='completed' and result.get('goal_activated') is True and
              result.get('cleanup',{}).get('native_quiescent') is True and not missing and
              not json_errors and elapsed<spec['max_seconds'])
    receipt={'schema':'er9.stage-output-freeze.v1','job_id':spec['job_id'],
             'pair_id':spec['pair_id'],'arm':spec['arm'],'stage':spec['stage'],
             'operational_complete':complete,'semantic_quality':'PENDING_INDEPENDENT_EVALUATION',
             'native_status':result['status'],'native_quiescent':result.get('cleanup',{}).get('native_quiescent',False),
             'native_receipt':{'path':str(out/'receipt.json'),'sha256':digest(out/'receipt.json')},
             'pair_freeze':spec['pair_freeze'],'artifacts':artifacts,'missing_required_artifacts':missing,
             'invalid_json_artifacts':json_errors,'elapsed_seconds':elapsed,'birth_epoch':epoch,
             'birth_monotonic':started,'end_monotonic':time.monotonic(),
             'goal_session_id':result.get('session_id'),'goal_target_id':result.get('goal_target_id'),
             'native_goal_starts':int(result.get('goal_activated') is True),
             'native_responses':result.get('native_responses'),'usage':'Exact native session receipt and redacted request attempts; no inferred dollars'}
    g.atomic(final,receipt)
    return receipt,final

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--stage-json',required=True); p.add_argument('--stage-sha256',required=True)
    a=p.parse_args(); spec=json.loads(pinned(a.stage_json,a.stage_sha256).read_text())
    try:
        result,path=run(spec)
        print(json.dumps({'job_id':spec['job_id'],'operational_complete':result['operational_complete'],
                          'freeze_path':str(path)}),flush=True)
        return 0 if result['operational_complete'] else 1
    except Exception as exc:
        print(json.dumps({'job_id':spec.get('job_id'),'status':'worker_error','error_class':type(exc).__name__,
                          'error':g.ns.sanitized(str(exc))}),flush=True)
        return 1
if __name__=='__main__': raise SystemExit(main())
