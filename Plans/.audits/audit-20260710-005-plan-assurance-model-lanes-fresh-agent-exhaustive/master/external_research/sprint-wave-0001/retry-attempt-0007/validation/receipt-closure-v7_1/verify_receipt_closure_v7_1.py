#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def verify():
 e=[];a=json.loads((BASE/'authority-v7_1.json').read_text());b=json.loads((BASE/'launch-byte-binding-v7_1.json').read_text())
 if a.get('status')!='READY_FOR_FRESH_LUNA_RECEIPT_CLOSURE_V7_1':e.append('status')
 if not b.get('activation_bytes_unchanged_since_child_launch') or b.get('restamp_performed'):e.append('launch-binding')
 for k,p in {'core':NS/'activation-transaction/activation-core.json','ER-0003':NS/'activation-transaction/leaf-dispatch-authorizations/ER-0003.json','ER-0008':NS/'activation-transaction/leaf-dispatch-authorizations/ER-0008.json','envelope':NS/'activation-transaction/activation-envelope.json'}.items():
  if sha(p)!=a['actual_file_sha256'][k]:e.append('file-drift:'+k)
 for p,k in [(BASE/'write_positive_receipt_v7_1.py','receipt_writer_sha256'),(BASE/'write_native_capture_v7_1.py','capture_writer_sha256'),(BASE/'external_research_dispatch_receipt_v7_1.schema.json','receipt_schema_sha256'),(BASE/'external_research_native_capture_v7_1.schema.json','capture_schema_sha256')]:
  if sha(p)!=a[k]:e.append('tool-drift:'+k)
 for aid,h in a['result_file_sha256'].items():
  p=Path(json.loads((NS/'manifest.json').read_text())['assignments'][0 if aid=='ER-0003' else 1]['output_path'])
  if sha(p)!=h:e.append('result-drift:'+aid)
 if any((NS/f'dispatch/{a}/attempt-0007/dispatch_receipt.json').exists() for a in ('ER-0003','ER-0008')):e.append('receipt-present')
 if (NS/'runtime/native_capture.json').exists():e.append('capture-present')
 return {'status':'pass' if not e else 'fail','errors':e,'receipts':0,'capture_rows':0,'credits':0}
if __name__=='__main__':print(json.dumps(verify(),indent=2,sort_keys=True));raise SystemExit(0 if verify()['status']=='pass' else 1)
