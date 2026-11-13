#!/usr/bin/env python3
"""Restore DCH review defects only in memory; run the full ordinary checker.

Guard defects are restored by swapping named guard-table rows to always-pass
(CUT_ROWS); derivation defects by an exact in-memory source edit.

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

def run(name, family=None):
    spec = importlib.util.spec_from_file_location('dch_round5_subject', ROOT/'scripts/pm_dch_events.py')
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    m.SELECTED_FAMILY=family
    overrides = {}
    restore = []
    try:
        return _run(m, name, family, overrides, restore)
    finally:
        for undo in restore:
            undo()


def _run(m, name, family, overrides, restore):
    def replace(function, old, new):
        source = inspect.getsource(getattr(m,function)); assert source.count(old) == 1, (function,old)
        exec(source.replace(old,new),m.__dict__)
    def cut(*rows):
        for phase, row in rows:
            assert row in [n for n, _, _ in m.table_rows(phase)], (phase, row)
        m.CUT_ROWS = frozenset(rows)
    if name == 'C5-B1_default_instance':
        replace('_joins', 'identity(event, p, storage_instance)', 'identity(event, p)')
    elif name == 'C5-B2_oversized_checkpoint_inline':
        cut(('cs_inline', 'CS03_inline_limit'))
    elif name == 'C5-B2_checkpoint_reference_custody':
        cut(*[('cs_pack_b', row) for row in ['CS16_pack_authorized', 'CS17_pack_hold_access', 'CS18_pack_bytes_durable',
                                            'CS19_pack_index_durable', 'CS20_pack_readback']])
    elif name == 'C5-B3_C4-B2_original_edition':
        cut(('hr_flags', 'HR03_payload_schema'))
    elif name in ['C5-B3_writer_policy_on_original', 'C5-B3_no_referenced_original']:
        original = m.checkpoint_joins
        def checkpoint(value,source,row,key):
            record=source['event_record']
            if name.endswith('writer_policy_on_original') and record['replay_policy']=='projector_replay_only':return False
            if name.endswith('no_referenced_original') and record['payload_ref'] is not None:return False
            return original(value,source,row,key)
        m.checkpoint_joins=checkpoint
    elif name == 'N1_Astra10_numeric_encoding':
        # SP-1100 inverts the original N1 premise: current bytes must preserve
        # the float type. Restore the old integral-float normalization for the
        # current recipe; the type-preserving byte oracles must then fail.
        original_bytes=m.body_bytes
        def normalized(value, rule=m.CURRENT_RULE):
            return m.retained_body_bytes(value, 'strict-v3') if m.uses_current_numbers(rule) else original_bytes(value, rule)
        m.body_bytes=normalized
    elif name == 'Astra11_exact_types':
        cut(*[(phase, row) for phase in ['ty_a', 'ty_b'] for row, _, _ in m.table_rows(phase)])
    elif name == 'C4-B1_history_limit':
        stored=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        for c in json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text()):
            path=c['schema_ref'].split('#')[0]; schema=json.loads((ROOT/path).read_text())
            del schema['properties']['history']['maxItems']; overrides[path]=schema
            next(e for e in stored['families'] if e['value_schema_id']==schema['$id'])['value_schema']=copy.deepcopy(schema)
        overrides['Plans/storage_value_registry.json']=stored
    elif name == 'C4-B3_terminal_source_identity':
        cut(('tj_start', 'TJ01_payload_started_id'))
    elif name == 'CV1101_shared_predicate_removed':
        # Sweep part 2B: every current validator loses the shared CV-1101 predicate
        # and its CV-253 composition (a stock validator that skips date-time).
        from jsonschema import Draft202012Validator
        import pm_dch_formats as formats
        saved = formats.datetime_validator
        formats.datetime_validator = lambda schema, **kwargs: Draft202012Validator(schema, format_checker=formats.skipped_checker())
        formats._CACHE.clear()
        restore.append(lambda: (setattr(formats, 'datetime_validator', saved), formats._CACHE.clear()))
    elif name == 'SP1101_retained_format_skipped':
        # Sweep part 2B: the frozen verifier keeps the recipes' recorded skipped
        # format check, so owner-invalid retained timestamps would read as valid.
        from jsonschema import Draft202012Validator
        import pm_dch_formats as formats
        m.retained_validator = lambda schema, current_schema=None: formats.Composite(
            schema, (Draft202012Validator(schema, format_checker=formats.skipped_checker()),))
    else: raise ValueError(name)
    text_inputs={str(ROOT/p):json.dumps(v) for p,v in overrides.items()}
    read=Path.read_text
    def read_input(path,*args,**kwargs):return text_inputs[str(path)] if str(path) in text_inputs else read(path,*args,**kwargs)
    output=io.StringIO()
    try:
        with patch.object(Path,'read_text',read_input),contextlib.redirect_stdout(output):code=int(m.main())
        report=json.loads(output.getvalue())
        # Lane-wide 'shared:' assertions (table order, shared number corpus) may fail
        # together with the families; the trial is judged on the family failures.
        families=sorted({failure.split(':',1)[0] for failure in report['failures']}-{'shared'})
        expected=(['chat.thread_worktree_pre_merge_test_failed','chat.thread_worktree_pre_merge_test_passed']
                  if name=='C4-B3_terminal_source_identity' else sorted(r['event_type'] for r in json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']))
        if family is not None:expected=[e for e in expected if e==family]
        return {'mutation':name,'pass':code==1 and report['status']=='fail' and families==expected,
                'exit':code,'families':families,'checks':report['checks'],'failures':report['failures']}
    except Exception as exc:return {'mutation':name,'pass':False,'exception':repr(exc)}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--out',type=Path,required=True);p.add_argument('--workers',type=int,default=1);args=p.parse_args()
    names=['C5-B1_default_instance','C5-B2_oversized_checkpoint_inline','C5-B2_checkpoint_reference_custody',
           'C5-B3_C4-B2_original_edition','C5-B3_writer_policy_on_original','C5-B3_no_referenced_original',
           'N1_Astra10_numeric_encoding','Astra11_exact_types','C4-B1_history_limit','C4-B3_terminal_source_identity',
           'CV1101_shared_predicate_removed','SP1101_retained_format_skipped']
    with ProcessPoolExecutor(max_workers=args.workers) as pool:
        results=[]
        for result in pool.map(run,names):
            results.append(result);print(json.dumps({k:v for k,v in result.items() if k!='failures'}),flush=True)
    report={'status':'pass' if all(r['pass'] for r in results) else 'fail','runs':len(results),'results':results}
    args.out.write_text(json.dumps(report,indent=2)+'\n');return report['status']!='pass'

if __name__=='__main__':raise SystemExit(main())
