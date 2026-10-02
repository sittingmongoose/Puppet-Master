"""Metadata-only dispatcher controls; raw native artifacts are never read here."""
import argparse, hashlib, importlib.util, json, os, time
from pathlib import Path
SOURCE_ROOT=Path(__file__).resolve().parent
CONTROL=json.loads((SOURCE_ROOT.parent/'recovery-control.json').read_text())
ROOT=Path(CONTROL['operator_root'])
CAMPAIGN=Path(CONTROL['campaign'])
LEDGER_PATH=Path(CONTROL['ledger']['path'])
DEADLINE=CONTROL['deadline_epoch']
FINAL_HOUR=DEADLINE-3600
QUEUE=list(CONTROL['default_queue'])
STAGES=['research-proposal','independent-candidate-critic','final-correction']
CANARY=CONTROL['canary_id']

def ledger(action,request=None):
    if hashlib.sha256(LEDGER_PATH.read_bytes()).hexdigest()!=CONTROL['ledger']['sha256']: raise ValueError('overlay source drift')
    spec=importlib.util.spec_from_file_location('er8_slot_ledger',LEDGER_PATH)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    with module.transaction() as state:
        return module.apply(state,action,request or {})

def atomic_json(path,value):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_suffix(path.suffix+'.tmp')
    with tmp.open('w') as out:
        json.dump(value,out,indent=2);out.write('\n');out.flush();os.fsync(out.fileno())
    os.replace(tmp,path)

def verify_positive_pins(receipt):
    # Only positively selected source/config/acceptance files may be hashed.
    for bound in (CONTROL['ledger'],CONTROL['authority']):
        if hashlib.sha256(Path(bound['path']).read_bytes()).hexdigest()!=bound['sha256']: raise ValueError('prospective policy source drift')
    if receipt.get('schema')!='er8.dispatcher.root-release.v1':
        raise ValueError('root release schema required')
    if receipt.get('root_authority') is not True:
        raise ValueError('explicit root release required')
    if receipt.get('mode') not in ('CANARY_ONLY','PRODUCTION'):
        raise ValueError('root release mode required')
    if time.time()>=DEADLINE:
        raise RuntimeError('original campaign deadline passed')
    pins=receipt.get('selected_positive_files')
    if not isinstance(pins,dict) or not pins:
        raise ValueError('exact selected positive path/hash closure required')
    forbidden=('native.json','.log','/private/','/credentials/','/auth/')
    results={}
    for raw,digest in pins.items():
        path=Path(raw)
        allowed_roots=(CAMPAIGN,Path('/usr/bin'),Path('USER_HOME/.local/bin'),Path('USER_HOME/.local/opt/zcode'))
        exact_old_sources={Path('HISTORICAL_V7_LAB_ROOT/dev/runtime-boundary-final-repair2/native_runner.py'),Path('HISTORICAL_V7_LAB_ROOT/dev/runtime-boundary-final-repair2/review-snapshot-final.json'),Path('HISTORICAL_V7_LAB_ROOT/dev/harness-v1-frozen/native/run_goal.py')}
        if not path.is_absolute() or not (any(path.is_relative_to(root) for root in allowed_roots) or path in exact_old_sources):
            raise ValueError('positively selected exact source/code/config path required')
        if any(word in raw for word in forbidden):
            raise ValueError('private/raw artifacts cannot be selected')
        if not isinstance(digest,str) or len(digest)!=64:
            raise ValueError('sha256 required')
        actual=hashlib.sha256(path.read_bytes()).hexdigest()
        if actual!=digest:
            raise RuntimeError('positive selected closure pin changed')
        results[raw]=actual
    return {'schema':'er8.dispatcher.prelaunch-pin-receipt.v1',
            'checked_epoch':time.time(),'mode':receipt['mode'],
            'selected_positive_files':results,'native_calls':0}

def begin_job(release,request,*,original_start_ns,original_birth_epoch):
    # Rehash positive closure before admitting; no packing occurs before this.
    verify_positive_pins(release)
    if release['mode']=='CANARY_ONLY' and request['job']!=CANARY:
        raise RuntimeError('canary-only release cannot admit production')
    if request['route']!=release['route'] or request['pins']!=release['pins']:
        raise RuntimeError('root route/pins must match admission')
    birth_monotonic_ns=original_start_ns
    birth_epoch=original_birth_epoch
    spec=importlib.util.spec_from_file_location('er8_slot_ledger',LEDGER_PATH)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    with module.transaction() as state:
        if request['case'] not in state['cases']:
            request={**request,'outside_native_cap_seconds':300,'birth_epoch':birth_epoch,'birth_monotonic':birth_monotonic_ns/10**9}
            job=module.apply(state,'prepare-admission',request)
        else:
            job=module.apply(state,'admit',request)
        original=dict(state['cases'][request['case']])
    # Actual input packing/host binding must follow this admission receipt.
    record={'schema':'er8.dispatcher.job-birth.v1','case':request['case'],
        'job':request['job'],'original_case':original,
        'stage_start_monotonic_ns':birth_monotonic_ns,
        'stage_start_epoch':birth_epoch,'admission':job}
    atomic_json(ROOT/'jobs'/request['case']/request['job']/'BIRTH.json',record)
    return record

def choose_next(case_states,active_cases):
    # Finish each active case before admitting a new case on its freed slot.
    for case in active_cases:
        state=case_states.get(case,{})
        if not state.get('failed'):
            done=state.get('completed_stages',[])
            for stage in STAGES:
                if stage not in done:return case,stage
    for case in QUEUE:
        if case not in case_states:return case,STAGES[0]
    return None

def main():
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['status','verify-release'])
    parser.add_argument('--receipt',type=Path);args=parser.parse_args()
    if args.action=='status':
        print(json.dumps({'operator':json.loads((ROOT/'OPERATOR.json').read_text()),'accounting':ledger('status')},indent=2))
    else:
        if args.receipt is None:raise ValueError('root receipt path required')
        result=verify_positive_pins(json.loads(args.receipt.read_text()))
        atomic_json(ROOT/'PRELAUNCH_PIN_CHECK.json',result)
        print(json.dumps({'mode':result['mode'],'verified_positive_files':len(result['selected_positive_files']),'native_calls':0}))
if __name__=='__main__':main()
