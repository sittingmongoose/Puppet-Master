#!/usr/bin/env python3
"""Only loss of the intended join refusal counts as a mutation kill."""
import sys,copy,json,argparse
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
parser = argparse.ArgumentParser(description='Refusal-specific mutations for the nine W3E original-result joins')
parser.add_argument('--json')
args = parser.parse_args()
import pm_w3e_event_oracles as w
rows=[]
for family,fields in w.RESULT_FIELDS.items():
 for field in fields:
  base=w.build_case(family,'owner-result:'+field,with_before=True)
  assert w.evaluate(base,'append')[0]==[]
  current=base['event']['payload'][field]
  alternatives=[a for a in w._enum_values(family,field) if a!=current] or w._join_alternatives(current)
  bad=None
  for alt in alternatives:
   candidate=copy.deepcopy(base);candidate['event']['payload'][field]=alt
   if w.schema_errors(w.PAYLOAD_ID[family],'',candidate['event']['payload']) or w.strict_errors(w.PAYLOAD_ID[family],'',candidate['event']['payload']):continue
   w.resync(candidate);bad=candidate;break
  assert bad is not None,(family,field)
  rid='append_join_'+field;expected=[(rid,w.ROW_BY_ID[rid]['code'])]
  refused=w.evaluate(bad,'append')[0];assert refused==expected,(family,field,refused,expected)
  module=w.table_module(w.ROW_TABLE[rid]);saved=getattr(module,rid);setattr(module,rid,lambda value,context:None)
  try:
   try: got=w.evaluate(bad,'append')[0]
   except Exception as error: status='INVALID';detail=repr(error)
   else:status='killed' if got==[] else 'INVALID';detail=got
  finally:setattr(module,rid,saved)
  rows.append(dict(family=family,field=field,row=rid,baseline_refusal=expected,status=status,detail=detail))
result=dict(status='pass' if all(r['status']=='killed' for r in rows) else 'fail',killed=sum(r['status']=='killed' for r in rows),mutations=rows)
if args.json:
 Path(args.json).write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result, indent=2))
raise SystemExit(0 if result['status'] == 'pass' else 1)
