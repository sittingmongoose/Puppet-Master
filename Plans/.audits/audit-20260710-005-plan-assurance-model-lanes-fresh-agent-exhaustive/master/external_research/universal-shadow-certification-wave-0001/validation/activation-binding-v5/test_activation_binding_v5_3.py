#!/usr/bin/env python3
import copy,hashlib,importlib.util,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;S=importlib.util.spec_from_file_location('v',BASE/'verify_activation_binding_v5_3.py');V=importlib.util.module_from_spec(S);S.loader.exec_module(V)
h=V.V.rows(BASE/'historical-byte-manifest-v5.jsonl');c=V.V.rows(BASE/'current-candidate-byte-manifest-v5.jsonl');tests=[('valid-current',lambda:V.verify()['status']=='pass')]
for label,base in [('historical',h),('candidate',c)]:
 for i in range(len(base)):
  for k in range(7):
   def p(base=base,i=i,k=k):
    v=copy.deepcopy(base)
    if k==0:v[i]['sha256']='0'*64
    elif k==1:v[i]['size']+=1
    elif k==2:v[i]['path']='../escape'
    elif k==3:v[i]['extra']=True
    elif k==4:v[i]['path']=v[(i+1)%len(v)]['path']
    elif k==5:v.pop(i)
    else:v.append(copy.deepcopy(v[i]))
    try:V.V.validate_exact(v,base,'mutated');return False
    except RuntimeError:return True
   tests.append((f'{label}-{i:03d}-{k}',p))
for i in range(128):
 def p(i=i):
  v=copy.deepcopy(h);v[0]['path']=f'validation/activation-binding-v4-injection-{i}/x'
  try:V.V.validate_exact(v,h,'namespace');return False
  except RuntimeError:return True
 tests.append((f'disguised-{i:03d}',p))
fail=[]
for n,f in tests:
 try:
  if not f():fail.append(n)
 except Exception:fail.append(n)
names=[n for n,_ in tests];r={'status':'pass' if not fail else 'fail','passed':len(tests)-len(fail),'total':len(tests),'failed':len(fail),'test_digest':hashlib.sha256(('\n'.join(names)+'\n').encode()).hexdigest(),'failures':fail};print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if not fail and len(tests)>=600 else 1)
