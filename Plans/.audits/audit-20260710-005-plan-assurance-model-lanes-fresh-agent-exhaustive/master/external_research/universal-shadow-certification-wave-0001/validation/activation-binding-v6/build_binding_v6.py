#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,os
from pathlib import Path
BASE=Path(__file__).resolve().parent;WAVE=BASE.parents[1];AUDIT=BASE.parents[4];V5=WAVE/'validation/activation-binding-v5';CACHE=AUDIT/'master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def write(p,raw):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
 with os.fdopen(fd,'wb') as f:f.write(raw)
def main():
 m=rows(WAVE/'batch_manifest.jsonl');registry=[]
 for x in m:
  p=Path(x['intent_ref']);p=p if p.is_absolute() else WAVE/p;assert p.is_file();registry.append({'assignment_id':x['assignment_id'],'dispatch_intent_path':str(p.resolve()),'dispatch_intent_sha256':sha(p),'output_directory':x['output_directory'],'prospective_agent_path':x['prospective_agent_path']})
 assert len(registry)==16 and len({x['dispatch_intent_path'] for x in registry})==16
 write(BASE/'dispatch-intent-registry-v6.jsonl',b''.join((json.dumps(x,sort_keys=True,separators=(',',':'))+'\n').encode() for x in registry))
 a={'schema_version':'universal-shadow-certification-activation-binding-authority-v6','status':'BLOCKED_AWAITING_FRESH_LUNA_PRELAUNCH_V6','luna_v5_fail_report_sha256':'a61d08fc0bdf39bee09785162f348d0d57ec86546e6bc72eab73a69787e21db5','localized_blockers':['LIVE_DEPENDENCY_BUNDLE_TREE_DRIFT','LIVE_CACHE_RUNTIME_SCOPE_DRIFT','V5_AUTHORITY_CACHE_REPORT_PATH_MISSING','PINNED_V5_TEST_REPORT_NOT_731_OF_731','LIVE_DEPENDENCY_BINDING_TEST_FAIL_CLOSED'],'cache_v3_terminal_path':str(CACHE/'terminal-cache-reconciliation-v3.json'),'cache_v3_terminal_sha256':sha(CACHE/'terminal-cache-reconciliation-v3.json'),'semantic_tree_sha256':'f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95','semantic_files':152,'runtime_files':216,'cache312':39,'cache314':25,'v5_terminal_authority_sha256':'ced0d38794a5d832f8ce64f28190eb5fed2b021f0d3895dad589adb41a756da1','v5_terminal_report_sha256':'821348e45c96fd1caaeff48bd2cd043ab133db2b4635b42b4efd4ccc923e7564','v5_terminal_verifier_sha256':'4853b4e2a491ceabd59a3c992811803390551b00ee431ddef82a6301b6be672d','v5_terminal_tests_sha256':'650cee52a465e8e2108160ce06a507da2a582715d55ede7827f0a36a36bc4c21','v5_tests_passed':731,'v5_tests_total':731,'dispatch_intent_registry_sha256':sha(BASE/'dispatch-intent-registry-v6.jsonl'),'dispatch_intent_count':16,'model':'gpt-5.6-sol','reasoning_effort':'xhigh','activation_authorized':False,'leaves':0,'results':0,'receipts':0,'credits':0,'verifier_sha256':sha(BASE/'verify_binding_v6.py'),'tests_sha256':sha(BASE/'test_binding_v6.py')};write(BASE/'authority-v6.json',(json.dumps(a,indent=2,sort_keys=True)+'\n').encode());print(json.dumps({'authority_sha256':sha(BASE/'authority-v6.json'),'registry':16},sort_keys=True))
if __name__=='__main__':main()
