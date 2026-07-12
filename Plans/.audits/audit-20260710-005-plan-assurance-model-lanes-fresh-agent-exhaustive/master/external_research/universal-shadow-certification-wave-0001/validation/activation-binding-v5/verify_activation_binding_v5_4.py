#!/usr/bin/env python3
import importlib.util,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;WAVE=BASE.parents[1];S=importlib.util.spec_from_file_location('v53',BASE/'verify_activation_binding_v5_3.py');V=importlib.util.module_from_spec(S);S.loader.exec_module(V)
def verify():
 r=V.verify();errors=[x for x in r['errors'] if "'dispatch_receipt_ref'" not in x]
 try:
  for x in V.V.rows(WAVE/'batch_manifest.jsonl'):
   ip=Path(x['intent_ref']);ip=ip if ip.is_absolute() else WAVE/ip;intent=json.loads(ip.read_text());rp=Path(intent['receipt_ref']);rp=rp if rp.is_absolute() else WAVE/rp
   if rp.exists():raise RuntimeError('receipt-present')
 except Exception as ex:errors.append(f'{type(ex).__name__}: {ex}')
 r['schema_version']='activation-binding-v5.4-verifier-report';r['errors']=errors;r['status']='pass' if not errors else 'fail';return r
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass' else 1)
