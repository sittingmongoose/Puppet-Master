"""Import final preservation and partial current readouts without altering prior grades."""
from pathlib import Path
import json,hashlib,datetime
LAB=Path('/home/sittingmongoose/PM-Experiments/external-research-v7-20260930');OUT=Path(__file__).resolve().parents[1];FILES={};COPIES=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def read(src,expected=None):
 p=Path(src);p=p if p.is_absolute() else LAB/p;b=p.read_bytes();h=sha(b)
 if expected:assert h==expected,(p,h,expected)
 FILES[str(p)]={'sha256':h,'bytes':len(b)};return b
def load(src,expected=None):return json.loads(read(src,expected))
def put(dst,value):
 p=OUT/dst;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
def copy(src,dst,expected=None):
 b=read(src,expected);p=OUT/dst;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b);COPIES.append({'source':str(src if Path(src).is_absolute() else LAB/src),'published':dst,'sha256':sha(b),'bytes':len(b)})
summaries={'R003-R004-phase2-summary.json':'8c791175690580d803bcbd31ff99dd173924a7fcea14f9ded5531dd426dc6552','C017-phase2-summary.json':'de0c06ab58dbf3f87ee0b89a037bad23322ad6126b980988ebfa87e08ba09169','C028-phase2-summary.json':'ed6ca51394a4226f4ec6cbe66d0d31a506978d0a88623eb2a8fdafe64c386758','C041-current-pair-summary.json':'df9a5463a36e12e23321a2a7c84b3c3d645736a9cdc5420cef17cbbb9494da91'}
for name,h in summaries.items():
 copy('grading/'+name,'reviews/'+name,h);copy('grading/'+name.replace('.json','.md'),'reviews/'+name.replace('.json','.md'))
a=load('grading/R003-R004-phase2-summary.json',summaries['R003-R004-phase2-summary.json'])
for r in a['reviews']:
 for kind in ['json','md']:copy(r['preservation_'+kind+'_path'],'reviews/'+r['review_id']+'/preservation-assessment.'+kind,r['preservation_'+kind+'_sha256'])
 for name,h in r['phase1_unchanged_hashes'].items():
  read('grading/'+r['review_id']+'/'+name,h);assert sha((OUT/'reviews'/r['review_id']/name).read_bytes())==h
b=load('grading/C017-phase2-summary.json',summaries['C017-phase2-summary.json'])
for r in b['reports']:
 rid=r['report_id']
 for kind in ['json','md']:
  copy(r['preservation_'+kind+'_path'],'reviews/'+rid+'/preservation-assessment.'+kind,r['preservation_'+kind+'_sha256']);read('grading/'+rid+'/current-assessment.'+kind,r['stage1_'+kind+'_sha256']);assert sha((OUT/'reviews'/rid/('current-assessment.'+kind)).read_bytes())==r['stage1_'+kind+'_sha256']
 read('grading/'+rid+'/current-report.md',r['current_report_sha256'])
c=load('grading/C028-phase2-summary.json',summaries['C028-phase2-summary.json'])
for rid,r in c['report_bindings'].items():
 for kind in ['json','md']:copy('grading/'+rid+'/preservation-assessment.'+kind,'reviews/'+rid+'/preservation-assessment.'+kind,r['preservation_'+kind+'_sha256'])
 for name,h in r['frozen_current_pins'].items():
  read('grading/'+rid+'/'+name,h);assert sha((OUT/'reviews'/rid/name).read_bytes())==h
d=load('grading/C041-current-pair-summary.json',summaries['C041-current-pair-summary.json'])
for rid,r in d['reports'].items():
 assert not r['complete_coverage'] and r['material_coverage_complete'] and r['verdict']=='quality failure'
 for kind in ['json','md']:copy('grading/'+rid+'/current-assessment.'+kind,'reviews/'+rid+'/current-assessment.'+kind,r['assessment_'+kind+'_sha256'])
 arm='control' if rid=='R011' else 'treatment';assert sha((OUT/'candidate-outputs'/('t14-m-ome-negative-screen-v1-'+arm)/'report.md').read_bytes())==r['report_sha256']
# Policy is a bounded same-repair completion allowance, never independent runtime acceptance.
copy('evaluation/reviews/runtime-repair2-policy-adjudication.json','reviews/runtime-repair2-policy-adjudication.json','13a5e42f9a082e566e983da389f18ac81560fbbc1e7c327683478c7219688871');copy('evaluation/reviews/runtime-repair2-policy-adjudication.md','reviews/runtime-repair2-policy-adjudication.md')
# The holdout audit is private-only. Publish only a status projection with no source/facet/key detail.
src='evaluation/reviews/holdout-v2-preparation-audit.json';audit=load(src,'7752ce53dfdc520d0abbe84a52a3e87f0c7d0244efd3269325984e61fdf20014')
projection={'source':str(LAB/src),'source_sha256':FILES[str(LAB/src)]['sha256'],'projection':'status fields only; full audit, source-fact aid, evaluation dimensions, source selections and all private omission keys remain excluded','reviewer':audit['reviewer'],'created_utc':audit['created_utc'],'decision':audit['decision'],'native_execution':'held; preparation is not scored research or candidate launch qualification','candidate_starts':0,'final_holdout_executions':0,'private_audit_publication':'excluded through holdout closure'}
put('cohort-preservation/holdout-preparation-status.json',projection)
put('cohort-preservation/source-freeze.json',{'as_of_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':FILES,'copies':COPIES,'projections':[{'source':str(LAB/src),'source_sha256':FILES[str(LAB/src)]['sha256'],'published':'cohort-preservation/holdout-preparation-status.json','projection_sha256':sha((OUT/'cohort-preservation/holdout-preparation-status.json').read_bytes())}],'scope':'frozen final readouts; partial certification preserved; current grades unchanged; private holdout audit status only; no native starts'})
print({'copied':len(COPIES),'source_bindings':len(FILES)})
