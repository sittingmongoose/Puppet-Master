#!/usr/bin/env python3
import hashlib,json,os,subprocess
from pathlib import Path
BASE=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
v=json.loads(subprocess.check_output(['python3',str(BASE/'verify_repair_attempt_0002.py')],text=True));t=json.loads(subprocess.check_output(['python3',str(BASE/'test_repair_attempt_0002.py')],text=True));assert v['status']=='pass_blocked' and t['status']=='pass'
r={'schema_version':'cross-domain-seam-repair-attempt-0002-terminal-report','status':'BLOCKED_AWAITING_FRESH_LUNA_PRELAUNCH','authority_sha256':sha(BASE/'authority.json'),'manifest_sha256':sha(BASE/'manifest.jsonl'),'verifier_sha256':sha(BASE/'verify_repair_attempt_0002.py'),'tests_sha256':sha(BASE/'test_repair_attempt_0002.py'),'tests_passed':t['passed'],'tests_total':t['total'],'test_digest':t['test_digest'],'assignments':['A005CDSV2-0002','A005CDSV2-0006','A005CDSV2-0039'],'outputs_empty':3,'activation':0,'results':0,'receipts':0,'credits':0};p=BASE/'terminal-preparation-report.json';raw=(json.dumps(r,indent=2,sort_keys=True)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
with os.fdopen(fd,'wb') as f:f.write(raw)
print(json.dumps({'path':str(p),'sha256':sha(p),'tests':t['total']},sort_keys=True))
