#!/usr/bin/env python3
"""Restore DCH review defects only in memory; run the full ordinary checker.

Exceptions are failures of this campaign, never successful refusals. Each
mutation applies lane-wide; no family or ordinary assertion is filtered out.
"""
import argparse
from concurrent.futures import ProcessPoolExecutor
import contextlib
import copy
import importlib.util
import inspect
import io
import json
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]

def run(name):
    spec = importlib.util.spec_from_file_location('dch_round5_subject', ROOT/'scripts/pm_dch_events.py')
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    overrides = {}
    def replace(function, old, new):
        source = inspect.getsource(getattr(m,function)); assert source.count(old) == 1, (function,old)
        exec(source.replace(old,new),m.__dict__)
    if name == 'C5-B1_default_instance':
        replace('joins', 'identity(event, p, storage_instance)', 'identity(event, p)')
    elif name == 'C5-B2_oversized_checkpoint_inline':
        replace('checkpoint_storage_valid', 'return len(body_bytes(value)) <= INLINE_LIMIT', 'return True')
    elif name == 'C5-B2_checkpoint_reference_custody':
        replace('checkpoint_storage_valid', "all(packed[k] is True for k in ['authorized', 'hold_access_allowed', 'bytes_durable', 'index_durable', 'readback_verified'])", 'True')
    elif name == 'C5-B3_C4-B2_original_edition':
        replace('historical_read_valid', 'or not payload_validator.is_valid(body)', '')
    elif name in ['C5-B3_writer_policy_on_original', 'C5-B3_no_referenced_original']:
        original = m.checkpoint_joins
        def checkpoint(value,source,row,key):
            record=source['event_record']
            if name.endswith('writer_policy_on_original') and record['replay_policy']=='projector_replay_only':return False
            if name.endswith('no_referenced_original') and record['payload_ref'] is not None:return False
            return original(value,source,row,key)
        m.checkpoint_joins=checkpoint
    elif name == 'N1_Astra10_numeric_encoding':
        source=inspect.getsource(m.body_bytes)
        start=source.index('        # SP-236 shortest numeric representation:')
        end=source.index('        if isinstance(v, dict):', start)
        exec(source[:start]+source[end:],m.__dict__)
    elif name == 'Astra11_exact_types':
        m.input_types_valid=lambda value: True
    elif name == 'C4-B1_history_limit':
        stored=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        for c in json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text()):
            path=c['schema_ref'].split('#')[0]; schema=json.loads((ROOT/path).read_text())
            del schema['properties']['history']['maxItems']; overrides[path]=schema
            next(e for e in stored['families'] if e['value_schema_id']==schema['$id'])['value_schema']=copy.deepcopy(schema)
        overrides['Plans/storage_value_registry.json']=stored
    elif name == 'C4-B3_terminal_source_identity':
        replace('test_joins', "or payload['started_event_id'] != started['event_id']", '')
    else: raise ValueError(name)
    text_inputs={str(ROOT/p):json.dumps(v) for p,v in overrides.items()}
    read=Path.read_text
    def read_input(path,*args,**kwargs):return text_inputs[str(path)] if str(path) in text_inputs else read(path,*args,**kwargs)
    output=io.StringIO()
    try:
        with patch.object(Path,'read_text',read_input),contextlib.redirect_stdout(output):code=int(m.main())
        report=json.loads(output.getvalue())
        families=sorted({failure.split(':',1)[0] for failure in report['failures']})
        expected=(['chat.thread_worktree_pre_merge_test_failed','chat.thread_worktree_pre_merge_test_passed']
                  if name=='C4-B3_terminal_source_identity' else sorted(r['event_type'] for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']))
        return {'mutation':name,'pass':code==1 and report['status']=='fail' and families==expected,
                'exit':code,'families':families,'checks':report['checks'],'failures':report['failures']}
    except Exception as exc:return {'mutation':name,'pass':False,'exception':repr(exc)}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--out',type=Path,required=True);p.add_argument('--workers',type=int,default=1);args=p.parse_args()
    names=['C5-B1_default_instance','C5-B2_oversized_checkpoint_inline','C5-B2_checkpoint_reference_custody',
           'C5-B3_C4-B2_original_edition','C5-B3_writer_policy_on_original','C5-B3_no_referenced_original',
           'N1_Astra10_numeric_encoding','Astra11_exact_types','C4-B1_history_limit','C4-B3_terminal_source_identity']
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        results=[]
        for result in pool.map(run,names):
            results.append(result);print(json.dumps({k:v for k,v in result.items() if k!='failures'}),flush=True)
    report={'status':'pass' if all(r['pass'] for r in results) else 'fail','runs':len(results),'results':results}
    args.out.write_text(json.dumps(report,indent=2)+'\n');return report['status']!='pass'

if __name__=='__main__':raise SystemExit(main())
