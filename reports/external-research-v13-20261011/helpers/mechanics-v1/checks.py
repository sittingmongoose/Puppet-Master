#!/usr/bin/env python3
"""Minimal synthetic integrity/privacy/denominator checks; scratch is deleted."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from results import build
from lifetimes import occupancy, summarize
from public_files import scan_text, relative

HERE = Path(__file__).resolve().parent
count = 0

def check(value):
    global count
    assert value
    count += 1

def rejects(fn):
    try:
        fn()
    except ValueError:
        check(True)
        return
    raise AssertionError('expected refusal')

def invoke(script, *args, ok=True):
    result = subprocess.run([sys.executable, '-B', str(HERE/script), *map(str,args)], capture_output=True, text=True)
    check((result.returncode == 0) == ok)
    return result

queue = {'arms': [{'arm_id': 'p'+str(i), 'scope': 'FULL'} for i in range(80)]}
rows, summary = build(queue, [])
check(len(rows) == 80 and rows[0]['delivery_seconds'] is None)
check(summary['groups'][0]['metrics']['input_tokens']['all_assigned_total'] is None)
check(summary['groups'][0]['metrics']['input_tokens']['passing_output_sample_quotient'] is None)
records = [{'attempt_id': 'p'+str(i), 'arm_id': 'p'+str(i), 'primary': True, 'status': 'FAILED', 'input_tokens': 10} for i in range(80)]
_, summary = build(queue, records)
metric = summary['groups'][0]['metrics']['input_tokens']
check(metric['all_assigned_total'] == 800 and metric['passing_output_sample_quotient'] is None)
records[0].update(assessment='PASS', final_present=True, full_scope_assessed=True)
_, summary = build(queue, records)
check(summary['groups'][0]['metrics']['input_tokens']['passing_output_sample_quotient'] == 800)
records.append({'attempt_id':'retry', 'arm_id':'p0', 'parent_attempt_id':'p0', 'primary':False, 'charged_extra':True, 'extra_start_count':2, 'cost_category':'product', 'status':'FAILED', 'input_tokens':20})
rows, summary = build(queue, records)
check(len(rows) == 81 and summary['charged_extra_stage_starts_total'] == 2)
check(summary['groups'][0]['metrics']['input_tokens']['all_assigned_total'] == 820)
records[-1]['extra_start_count'] = None
_, summary = build(queue, records)
check(summary['charged_extra_stage_starts_total'] is None)
records[0]['input_tokens'] = None
_, summary = build(queue, records)
check(summary['groups'][0]['metrics']['input_tokens']['all_assigned_total'] is None)
rejects(lambda: build(queue, [dict(records[0], final_present=False)]))
rejects(lambda: build(queue, [dict(records[1], delivery_utc='2026-10-11T00:00:01Z',t0_utc='2026-10-11T00:00:00Z')]))
rejects(lambda: build(queue, [dict(records[1], input_tokens=1,cached_input_tokens=2)]))
rejects(lambda: build(queue, [dict(records[1], input_tokens=float('nan'))]))
rejects(lambda: build(queue, [dict(records[1], evaluation_start_utc='2026-10-11T00:00:00Z')]))
rejects(lambda: build(queue, [dict(records[1], t0_utc='2026-10-11T00:00:02Z', terminal_utc='2026-10-11T00:00:01Z')]))
rejects(lambda: build(queue, [dict(records[1], billing_amount=2)]))
check(occupancy([(0,10),(5,15)]) == {'summed_seconds':20,'union_seconds':15,'overlap_wall_seconds':5,'excess_context_seconds':5})
life = summarize([{'attempt_id':'x','context_id':'a','stage':'critic','created_utc':'2026-10-11T00:00:00Z','closed_utc':None}])
check(life['attempts']['x']['created_context']['all_contexts'] is None)
synthetic_email = '@'.join(('worker', 'private.invalid'))
synthetic_home = '/'.join(('', 'home', 'private', 'runtime'))
check(bool(scan_text(synthetic_email,'f')))
check(not scan_text('123+public@users.noreply.github.com','f'))
check(bool(scan_text('Bearer '+ 'x'*24,'f')))
check(bool(scan_text(synthetic_home+'/file','f')))
check(bool(scan_text('.'.join(('192','168','50','179')),'f')))
check(bool(scan_text('private route','f',deny=['private route'])))
with tempfile.TemporaryDirectory(prefix='er13-mechanics-check-') as temp:
    root = Path(temp)
    rejects(lambda: relative(root,'../outside'))
    (root/'source.md').write_text('source governing text '+synthetic_home+'/input\n')
    selection = root/'selection.json'
    selection.write_text(json.dumps({'files':[{'source':'source.md','target':'science/source.md','kind':'source_evidence'}]}))
    policy = root/'policy.json'
    policy.write_text(json.dumps({'replacements':{synthetic_home:'ER13_RUNTIME'},'private_literals':[synthetic_home]}))
    dest = root/'public'
    invoke('public_files.py','copy','--root',root,'--list',selection,'--destination',dest,ok=False)
    check(not dest.exists())
    invoke('public_files.py','copy','--root',root,'--list',selection,'--policy',policy,'--destination',dest)
    check((root/'source.md').read_text().endswith(synthetic_home+'/input\n'))
    check('ER13_RUNTIME/input' in (dest/'science/source.md').read_text())
    invoke('public_files.py','copy','--root',root,'--list',selection,'--policy',policy,'--destination',dest,ok=False)
    (root/'renamed.json').write_text(json.dumps({'messages':[{'role':'assistant','content':'secret'}]}))
    selection.write_text('["renamed.json"]')
    invoke('public_files.py','scan','--root',root,'--list',selection,ok=False)
    (root/'link').symlink_to(root/'source.md')
    rejects(lambda: relative(root,'link'))
    selection.write_text('["source.md"]')
    frozen = root/'frozen'
    invoke('freeze.py','--root',root,'--list',selection,'--destination',frozen)
    invoke('freeze.py','--root',root,'--list',selection,'--destination',frozen,'--verify')
    invoke('freeze.py','--root',root,'--list',selection,'--destination',frozen,ok=False)
    (frozen/'source.md').chmod(0o644)
    (frozen/'source.md').write_text('changed')
    invoke('freeze.py','--root',root,'--list',selection,'--destination',frozen,'--verify',ok=False)
    q = root/'queue.json';q.write_text(json.dumps(queue))
    r = root/'records.json';r.write_text('[]')
    out = root/'results'
    invoke('results.py','--queue',q,'--records',r,'--destination',out)
    check(len(json.loads((out/'results.json').read_text())) == 80)
    check('UNKNOWN' in (out/'results.csv').read_text())
print(json.dumps({'synthetic_checks_passed':count,'scientific_runs':0,'native_execution_qualified':False,'scratch_removed':True}))
