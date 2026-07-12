#!/usr/bin/env python3
import hashlib,json,os,subprocess
from pathlib import Path
BASE=Path(__file__).resolve().parent;WAVE=BASE.parents[1];AUDIT=BASE.parents[4];PY=Path('/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3');SITE=AUDIT/'master/dependencies/jsonschema-draft202012-v1/site-packages'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def verify():
 e=[]
 try:
  a=json.loads((BASE/'authority-v6.json').read_text());luna=WAVE/'validation/activation-binding-v5/luna-independent-prelaunch-v5.json';ld=json.loads(luna.read_text())
  if sha(luna)!=a['luna_v5_fail_report_sha256'] or ld.get('errors')!=a['localized_blockers']:e.append('luna-v5')
  cache=Path(a['cache_v3_terminal_path']);cd=json.loads(cache.read_text())
  if sha(cache)!=a['cache_v3_terminal_sha256'] or cd.get('status')!='PASS' or cd.get('semantic_file_count')!=152 or cd.get('runtime_file_count')!=216:e.append('cache-v3')
  for p,h in [(WAVE/'validation/activation-binding-v5/authority-v5-terminal.json',a['v5_terminal_authority_sha256']),(WAVE/'validation/activation-binding-v5/terminal-preparation-report-v5.json',a['v5_terminal_report_sha256']),(WAVE/'validation/activation-binding-v5/verify_activation_binding_v5_4.py',a['v5_terminal_verifier_sha256']),(WAVE/'validation/activation-binding-v5/test_activation_binding_v5_4.py',a['v5_terminal_tests_sha256'])]:
   if sha(p)!=h:e.append('v5-pin:'+p.name)
  reg=rows(BASE/'dispatch-intent-registry-v6.jsonl')
  if len(reg)!=16 or len({x['dispatch_intent_path'] for x in reg})!=16:e.append('intent-registry')
  for x in reg:
   p=Path(x['dispatch_intent_path']);out=Path(x['output_directory']);intent=json.loads(p.read_text())
   if sha(p)!=x['dispatch_intent_sha256'] or not out.is_dir() or any(out.iterdir()) or Path(intent['receipt_ref']).exists():e.append('zero-state:'+x['assignment_id'])
  before=sum(1 for p in SITE.rglob('*') if p.is_file());env={'PYTHONPATH':str(SITE),'PYTHONNOUSERSITE':'1','PYTHONDONTWRITEBYTECODE':'1','PYTHONHASHSEED':'0','PATH':os.environ.get('PATH','')};code='import jsonschema,sys;from jsonschema import Draft202012Validator;print(jsonschema.__version__,sys.version_info[:3],Draft202012Validator.__name__)';r=subprocess.run([str(PY),'-S','-B','-c',code],env=env,text=True,capture_output=True);after=sum(1 for p in SITE.rglob('*') if p.is_file())
  if r.returncode or '4.26.0 (3, 12, 13) Draft202012Validator' not in r.stdout or before!=216 or after!=216:e.append('isolated-engine')
 except Exception as ex:e.append(f'{type(ex).__name__}:{ex}')
 return {'status':'pass' if not e else 'fail','errors':e,'assignments':16,'outputs_empty':16,'semantic_files':152,'runtime_files':216,'engine':'jsonschema 4.26.0 Draft202012Validator CPython 3.12.13 -S -B','activation_authorized':False,'credits':0}
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass' else 1)
