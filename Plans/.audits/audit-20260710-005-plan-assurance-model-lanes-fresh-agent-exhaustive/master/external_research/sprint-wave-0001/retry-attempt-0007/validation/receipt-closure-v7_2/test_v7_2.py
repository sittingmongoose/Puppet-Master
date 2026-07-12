#!/usr/bin/env python3
from __future__ import annotations
import copy,hashlib,json,os,shutil,subprocess,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];sys.path.insert(0,str(NS/'tools'));sys.path.insert(0,str(BASE))
import common,result_validator_v7_2 as RV
ACT={'core':'043488cb83d6064068a887d484f22d19d6c158a2bc1d424798ed9611c9f58c83','ER-0003':'a0cf53b81fe654c3cc460682da7ae6ae28dc6cca90d8e0f338258d596bc4e5c8','ER-0008':'34b9261297844b43aba855bed802a56f06f68596f81fc51295322a6bfd9e31f1'}
fixture=BASE/'fixture-sandbox/full-real';shutil.rmtree(BASE/'fixture-sandbox',ignore_errors=True);fixture.mkdir(parents=True)
env=dict(os.environ);env['AUDIT005_V7_2_FIXTURE_MODE']='1';tests=[];manifest=common.load(NS/'manifest.json');assign={x['assignment_id']:x for x in manifest['assignments']}
for aid in ('ER-0003','ER-0008'):
 proof=NS/f'runtime/terminal-proofs/{aid}.json';cmd=[sys.executable,str(BASE/'write_positive_receipt_v7_2.py'),'--assignment-id',aid,'--terminal-proof',str(proof),'--terminal-proof-sha256',common.sha(proof),'--fixture-root',str(fixture)];r=subprocess.run(cmd,text=True,capture_output=True,env=env);tests.append((f'full-writer-{aid}',r.returncode==0 and (fixture/f'{aid}-dispatch_receipt.json').is_file(),r.stderr+r.stdout))
state=NS/'runtime/native-state-v7_1.json';r=subprocess.run([sys.executable,str(BASE/'write_native_capture_v7_2.py'),'--native-state',str(state),'--sha256',common.sha(state),'--fixture-root',str(fixture)],text=True,capture_output=True,env=env);tests.append(('full-capture',r.returncode==0 and (fixture/'native_capture.json').is_file(),r.stderr+r.stdout))
mutators=[]
for k in range(10):
 def make(k):
  def mutate(v,aid,core,auth):
   if k==0:v['activation_core_sha256']=common.canonical_sha(core)
   elif k==1:v['leaf_dispatch_authorization_sha256']=common.canonical_sha(auth)
   elif k==2:v['status']='blocked'
   elif k==3:v['agent_path']='/root/reused'
   elif k==4:v['task_thread_id']='forbidden'
   elif k==5:v['research_questions']=v['research_questions'][:-1]
   elif k==6:v['sources'][0]['url']='http://invalid.example'
   elif k==7:
    target=next((x for s in common.SECTIONS for x in v[s] if x.get('evidence_class')=='no_evidence'),None)
    if target is None:target=v['unresolved_questions'][0];target['evidence_class']='no_evidence'
    target['source_urls']=['https://invalid.example/evidence']
   elif k==8:next(iter(v['self_attestation']));v['self_attestation'][next(iter(v['self_attestation']))]=False
   else:v['topic']='wrong-topic-binding'
  return mutate
 mutators.append(make(k))
for i in range(640):
 aid=('ER-0003','ER-0008')[i%2];row=assign[aid];core=common.load(common.core_path());auth=common.load(common.authorization_path(aid));value=common.parse_standard_exact(common.result_path(aid).read_bytes());mutators[i%10](value,aid,core,auth);errs=RV.result_errors_v7_2(value,row,core,auth,ACT['core'],ACT[aid]);tests.append((f'negative-{i:04d}',bool(errs),str(errs[:3])))
tests.append(('production-zero',not any(common.receipt_path(x).exists() for x in ('ER-0003','ER-0008')) and not common.capture_path().exists(),'production outputs must remain absent'))
fail=[{'name':n,'detail':d} for n,ok,d in tests if not ok];names=[n for n,_,_ in tests];result={'status':'pass' if not fail else 'fail','passed':len(tests)-len(fail),'total':len(tests),'failed':len(fail),'test_digest':hashlib.sha256(('\n'.join(names)+'\n').encode()).hexdigest(),'full_real_fixture':{'ER-0003':(fixture/'ER-0003-dispatch_receipt.json').is_file(),'ER-0008':(fixture/'ER-0008-dispatch_receipt.json').is_file(),'capture':(fixture/'native_capture.json').is_file()},'failures':fail};print(json.dumps(result,indent=2,sort_keys=True));shutil.rmtree(BASE/'fixture-sandbox',ignore_errors=True);raise SystemExit(0 if not fail and len(tests)>=600 else 1)
