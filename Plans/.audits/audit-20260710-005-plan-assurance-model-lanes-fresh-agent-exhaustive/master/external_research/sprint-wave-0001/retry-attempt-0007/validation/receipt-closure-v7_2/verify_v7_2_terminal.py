#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def verify():
 a=json.loads((BASE/'authority-v7_2-terminal.json').read_text());e=[]
 expected={'result_validator_sha256':('result_validator_v7_2.py','c678f65ea3518a12415af57581818cb43399eb04432412447b69ae7f0774c84f'),'receipt_writer_sha256':('write_positive_receipt_v7_2.py','997e58260cf5342bee7d060e53a71278417ed253e834f3da1f1c6eda696e6d24'),'capture_writer_sha256':('write_native_capture_v7_2.py','bf02818c247007f5d6c486e48f2c6b74d5086a9221f2d0734e028a9b922ad1d5'),'receipt_schema_sha256':('external_research_dispatch_receipt_v7_2.schema.json','a39987afa695c4a2576a8292d8bd0f2207e09288afeddbba8b5c10d9fbb3a5bb'),'capture_schema_sha256':('external_research_native_capture_v7_2.schema.json','9758ef23d92f2eab80d2c1ccdd3a87b3ec867daf556fef49c1d20c318ee390be'),'tests_sha256':('test_v7_2.py','8dcc732ddb4b7f1061df9879cd8fe7dac5053594908f4f77166979d51882fd5b')}
 if a.get('status')!='READY_FOR_FRESH_LUNA_RECEIPT_CLOSURE_V7_2':e.append('status')
 for k,(name,h) in expected.items():
  if a.get(k)!=h or sha(BASE/name)!=h:e.append(k)
 if a.get('tests_passed')!=644 or a.get('tests_total')!=644:e.append('tests')
 if not a.get('full_real_fixture',{}).get('cleaned_after_test') or (BASE/'fixture-sandbox').exists():e.append('fixture-cleanup')
 if any((NS/f'dispatch/{x}/attempt-0007/dispatch_receipt.json').exists() for x in ('ER-0003','ER-0008')):e.append('production-receipt')
 if (NS/'runtime/native_capture.json').exists():e.append('production-capture')
 return {'status':'pass' if not e else 'fail','errors':e,'production_receipts':0,'production_capture_rows':0,'credits':0}
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass' else 1)
