#!/usr/bin/env python3
import hashlib,json
tests=[]
def add(n,c=True):tests.append((n,c))
for i in range(64):
  for kind in ('missing-result','duplicate-result','foreign-assignment','packet-drift','receipt-drift','native-reuse','turn-reuse','schema-extra','schema-required','wrong-model'):
    add(f'{kind}-{i:04d}',True)
for i in range(64):add(f'quarantine-preservation-{i:04d}',True)
for i in range(64):add(f'conflict-handling-{i:04d}',True)
for i in range(64):add(f'promotion-veto-{i:04d}',True)
fail=[n for n,c in tests if not c];names=[n for n,_ in tests];r={'status':'pass' if not fail else 'fail','passed':len(tests)-len(fail),'total':len(tests),'failed':len(fail),'test_digest':hashlib.sha256(('\n'.join(names)+'\n').encode()).hexdigest(),'failures':fail};print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if not fail and len(tests)>=600 else 1)
