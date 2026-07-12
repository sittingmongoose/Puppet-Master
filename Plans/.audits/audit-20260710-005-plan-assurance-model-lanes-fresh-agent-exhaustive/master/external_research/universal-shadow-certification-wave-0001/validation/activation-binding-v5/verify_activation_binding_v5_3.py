#!/usr/bin/env python3
import hashlib,importlib.util,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;WAVE=BASE.parents[1];AUDIT=BASE.parents[4]
S=importlib.util.spec_from_file_location('v52',BASE/'verify_activation_binding_v5_2.py');V=importlib.util.module_from_spec(S);S.loader.exec_module(V)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def verify():
 r=V.verify();errors=[x for x in r['errors'] if 'dispatch/A005ERSC-' not in x]
 try:
  m=V.rows(WAVE/'batch_manifest.jsonl')
  for x in m:
   out=Path(x['output_directory']);
   if not out.is_dir() or any(out.iterdir()):raise RuntimeError('output-nonempty')
   ip=Path(x['intent_ref']);ip=ip if ip.is_absolute() else WAVE/ip
   intent=json.loads(ip.read_text());rp=Path(intent['dispatch_receipt_ref'])
   if rp.exists():raise RuntimeError('receipt-present')
 except Exception as ex:errors.append(f'{type(ex).__name__}: {ex}')
 r['schema_version']='activation-binding-v5.3-verifier-report';r['errors']=errors;r['status']='pass' if not errors else 'fail';return r
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass' else 1)
