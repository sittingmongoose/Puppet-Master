#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def verify():
 e=[];a=json.loads((BASE/'authority-v7_2.json').read_text())
 for aid in ('ER-0003','ER-0008'):
  old=a['failure_reproduction'][aid]['old_common_errors'];new=a['failure_reproduction'][aid]['new_isolated_errors']
  if old!=['binding:activation_core_sha256','binding:leaf_dispatch_authorization_sha256']:e.append(aid+':old-reproduction')
  if new!=[]:e.append(aid+':new-validator')
 for p,k in [(BASE/'result_validator_v7_2.py','result_validator_sha256'),(BASE/'write_positive_receipt_v7_2.py','receipt_writer_sha256'),(BASE/'write_native_capture_v7_2.py','capture_writer_sha256'),(BASE/'external_research_dispatch_receipt_v7_2.schema.json','receipt_schema_sha256'),(BASE/'external_research_native_capture_v7_2.schema.json','capture_schema_sha256')]:
  if sha(p)!=a[k]:e.append(k+':drift')
 if any((NS/f'dispatch/{x}/attempt-0007/dispatch_receipt.json').exists() for x in ('ER-0003','ER-0008')):e.append('production-receipt-present')
 if (NS/'runtime/native_capture.json').exists():e.append('production-capture-present')
 return {'status':'pass' if not e else 'fail','errors':e,'production_receipts':0,'production_capture_rows':0,'credits':0}
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass' else 1)
