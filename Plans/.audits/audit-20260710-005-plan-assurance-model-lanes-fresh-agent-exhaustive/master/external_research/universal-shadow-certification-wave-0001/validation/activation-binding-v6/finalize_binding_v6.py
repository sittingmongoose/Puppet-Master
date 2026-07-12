#!/usr/bin/env python3
import hashlib,json,os,subprocess
from pathlib import Path
BASE=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
v=json.loads(subprocess.check_output(['python3',str(BASE/'verify_binding_v6.py')],text=True));t=json.loads(subprocess.check_output(['python3',str(BASE/'test_binding_v6.py')],text=True))
if v['status']!='pass' or t['status']!='pass' or t['total']<900:raise SystemExit('not clean')
r={'schema_version':'universal-shadow-certification-binding-v6-terminal-report','status':'BLOCKED_AWAITING_FRESH_LUNA_PRELAUNCH_V6','authority_sha256':sha(BASE/'authority-v6.json'),'cache_v3_terminal_sha256':sha(BASE.parents[4]/'master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3/terminal-cache-reconciliation-v3.json'),'verifier_sha256':sha(BASE/'verify_binding_v6.py'),'tests_sha256':sha(BASE/'test_binding_v6.py'),'tests_passed':t['passed'],'tests_total':t['total'],'test_digest':t['test_digest'],'assignments':16,'features':3888,'outputs_empty':16,'activation_authorized':False,'leaves':0,'results':0,'receipts':0,'credits':0};p=BASE/'terminal-preparation-report-v6.json';raw=(json.dumps(r,indent=2,sort_keys=True)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
with os.fdopen(fd,'wb') as f:f.write(raw)
print(json.dumps({'path':str(p),'sha256':sha(p),'tests':t['total']},sort_keys=True))
