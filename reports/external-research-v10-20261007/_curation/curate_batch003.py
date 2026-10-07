#!/usr/bin/env python3
"""Finite batch003 publication curation. Does not execute witnesses/exporters or mutate source state.
Raw captures are streamed for identity checks only, never decoded or copied.
"""
from pathlib import Path
import datetime, hashlib, json, subprocess
ROOT=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
REPO=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
HELPER=ROOT/'helpers/publication-batch003'
STAGE=HELPER/'staging'
PREFIX='reports/external-research-v10-20261007/'
PUB=REPO/PREFIX
CUTOFF='2026-10-07T19:18:49.960897+00:00'
COMMIT='4efd9d7c5a0dca13ef77ba1079288d21e3e2b057'
BUDGET=512*1024*1024
files=[]; references=[]; raw=[]; frozen=[]; observations={}; absences=[]; selected={}; generated=[]
def digest(p):
 h=hashlib.sha256();n=0
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b);n+=len(b)
 return h.hexdigest(),n
def sha(b):return hashlib.sha256(b).hexdigest()
def read(rel):
 p=ROOT/rel;b=p.read_bytes();observations.setdefault(str(p),(sha(b),len(b)))
 return json.loads(b)
def jbytes(d):return (json.dumps(d,indent=2,ensure_ascii=False,sort_keys=True)+'\n').encode()
def write_generated(rel,d,why,provenance=None):
 b=d if isinstance(d,bytes) else jbytes(d);p=STAGE/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 row={'source_original_path':str(p),'source_original_sha256':sha(b),'source_original_bytes':len(b),'source_kind':'curator_generated_metadata','target_repo_relative_path':PREFIX+rel,'staging_relative_path':rel,'sha256':sha(b),'bytes':len(b),'copy_identity':'curator_generated_metadata','why_required':why}
 if provenance:row['derived_from']=provenance
 generated.append(row)
def private(p,why,expected=None,locator=None):
 p=Path(p);h,n=digest(p)
 if expected:assert h==expected,(str(p),'private hash mismatch')
 observations.setdefault(str(p),(h,n))
 row={'original_path':str(p),'sha256':h,'bytes':n,'reason_not_copied':why,'retention':'UNKNOWN/unverified','availability_at_curation':'existing_local_path_hash_verified','github_retention':'NOT_ASSERTED','content_use':'Raw primary bodies hash-only; for embedded native/thread text, only bounded metadata projection parsed, no external histories or databases opened'}
 if locator:row['authored_locator']=locator
 if not any(x['original_path']==str(p) for x in raw):raw.append(row)
 return row
# Published manifest metadata only. Every selected reference is independently verified below.
old=[]
for name in ['BATCH001_MANIFEST.json','BATCH002_MANIFEST.json']:
 m=json.loads((PUB/name).read_text())
 for row in m['files']+m.get('existing_publication_references',[]):
  target=row.get('target_repo_relative_path') or PREFIX+row['public_path']
  old.append({'target':target,'sha256':row['sha256'],'bytes':row['bytes'],'manifest':PREFIX+name})
byhash={}
for row in old:byhash.setdefault((row['sha256'],row['bytes']),[]).append(row)
def stable_ref(row):
 p=REPO/row['target'];h,n=digest(p);assert (h,n)==(row['sha256'],row['bytes']),('existing publication identity',str(p))
 b=subprocess.check_output(['git','-C',str(REPO),'show',COMMIT+':'+row['target']])
 assert (sha(b),len(b))==(h,n),('stable commit identity',str(p))
 return {'repository_relative_path':row['target'],'commit':COMMIT,'sha256':h,'bytes':n,'local_hash_verified':True,'commit_blob_hash_verified':True,'prior_manifest':row['manifest'],'github_remote_requeried':False}
def select(p,why,authority,expected=None,target=None):
 p=Path(p);rel=str(p.relative_to(ROOT));h,n=digest(p)
 if expected:assert h==expected,(rel,'selected hash mismatch')
 observations.setdefault(str(p),(h,n))
 if rel in selected:
  selected[rel]['selection_authorities'].append(authority);return
 row={'source_original_path':str(p),'source_original_sha256':h,'source_original_bytes':n,'bytes':n,'sha256':h,'why_required':why,'selection_authorities':[authority],'copy_identity':'unchanged'}
 matches=byhash.get((h,n),[])
 if matches:
  wanted=PREFIX+rel;oldrow=next((x for x in matches if x['target']==wanted),matches[0]);ref=stable_ref(oldrow)
  row.update(target_repo_relative_path=ref['repository_relative_path'],disposition='existing_published_reference',published_reference=ref)
  references.append(row)
 else:
  destrel=target or rel
  if (PUB/destrel).exists():
   # Different versioned scientific content must never be overwritten.
   if p.name in {'final.md','draft.md','critique.md','prior-state.md','REVIEW.md','review.md','judgment.json','REVIEW.json','sources.json'}:
    raise AssertionError('Changed scientific publication collision: '+rel)
   d=Path(destrel);destrel=str(d.with_name(d.stem+'.batch003'+d.suffix));row['administrative_collision_snapshot']=True
  assert not (PUB/destrel).exists(),('new target collision',destrel)
  b=p.read_bytes();assert (sha(b),len(b))==(h,n)
  dest=STAGE/destrel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
  row.update(target_repo_relative_path=PREFIX+destrel,staging_relative_path=destrel,disposition='new_exact_copy')
  files.append(row)
 selected[rel]=row
 return row
def entries(freeze,doc):
 fs=doc.get('files',doc.get('hashes',{}))
 if isinstance(fs,list):
  for x in fs:yield x['path'],x['sha256'],x.get('bytes')
 else:
  for k,v in fs.items():
   if isinstance(v,str):yield k,v,None
   else:yield v.get('path',k),v['sha256'],v.get('bytes')
def resolve(freeze,s):
 p=Path(s)
 if p.is_absolute():return p
 return ROOT/p if (ROOT/p).exists() else freeze.parent/p
SOURCE_NOTE_NAMES={'SOURCES.md','sources.json','index.json','manifest.json','artifact-identities.json','input-identities.json','checked-sources.json','retrievals.json','retrieval-stamps.json','prior-boundary.json','executed-checks.json'}
def is_raw(p):
 parts=p.parts
 if 'reviewer-primary' in parts:return True
 if 'inputs' in parts and 'sources' in parts:return True
 if 'sources' not in parts:return False
 if p.name in SOURCE_NOTE_NAMES:return False
 if p.suffix=='.md':return False
 if p.name in {'bagit-validate-excerpt.txt','bagit-v190-validate-excerpt.txt'}:return False
 return True
SENSITIVE_TEXT={'objective','current_work','next_work','currentWork','nextWork','reason','message','title','acceptance','notes'}
HISTORY_KEYS={'items','messages','history','thinking','chain_of_thought','transcript'}
def sanitize(v):
 if isinstance(v,list):return [sanitize(x) for x in v]
 if not isinstance(v,dict):return v
 out={}
 for k,x in v.items():
  if k in HISTORY_KEYS or k in SENSITIVE_TEXT or (k=='content' and 'structuredContent' in v):
   if x is not None:out[k+'_sha256']=sha(x.encode() if isinstance(x,str) else jbytes(x))
  else:out[k]=sanitize(x)
 return out
def lifecycle_projection(p,why):
 d=read(str(p.relative_to(ROOT)));origin=private(p,'Original receipt includes embedded native/thread task/source text; bounded lifecycle projection published separately.')
 # Retain real status/identity/counters, exclude the large receipt observations (vendor source excerpts).
 if p.name=='native_goal_receipt.json' and 'I-ANCHOR-GLM' in p.parts:
  keep={k:v for k,v in d.items() if k in {'receiptType','job','writtenAtUtc','route','state','finalObservedStatus','honestScopeNotes','lifecycleClarification'}}
  keep['omitted_observations_sha256']=sha(jbytes(d.get('observations')))
 else:keep=d
 rel=str(p.relative_to(ROOT));q=Path(rel);dest=str(q.with_name(q.stem+'.batch003-lifecycle-projection.json'))
 write_generated(dest,{'original_identity':origin,'projection':sanitize(keep),'projection_policy':'Separate bounded metadata copy; original untouched. Text/history hashed, actual scalar lifecycle preserved; never a raw tool response.'},why,[origin])
def freeze(rel,why):
 p=ROOT/rel;d=read(rel)
 stamp=d.get('frozen_at',d.get('at'))
 if stamp:assert datetime.datetime.fromisoformat(stamp.replace('Z','+00:00'))<=datetime.datetime.fromisoformat(CUTOFF),('defer later freeze',rel)
 select(p,why+' freeze authority',rel)
 for s,h,n in entries(p,d):
  q=resolve(p,s);hh,nn=digest(q);assert hh==h,(rel,str(q),'frozen sha mismatch');assert n is None or n==nn,(rel,str(q),'frozen bytes mismatch')
  frozen.append({'freeze':rel,'original_path':str(q),'sha256':hh,'bytes':nn,'verified':True})
  if is_raw(q):private(q,'Raw primary body/vendor code/HTML/corpus excluded; authored source locator/excerpts retained separately.',h)
  elif q.name=='native_goal_receipt.json' and 'I-ANCHOR-GLM' in q.parts:lifecycle_projection(q,'Actual expired GLM lifecycle, text-free projection with original identity')
  elif q.name=='integration-state-expiry-terminal-001.json':lifecycle_projection(q,'Actual expiry paused state and retained native noncompletion')
  elif q.name in {'t3-terminal-observed.json','t3_dispatch_clock_receipt.json','t3_terminal_clock_receipt.json'} and ('common/seed-v1' in str(q) or 'D-M08-A' in q.parts or 'D-M08-B' in q.parts):lifecycle_projection(q,'Actual frozen task timing/native evidence metadata; embedded thread items hashed, standalone native receipts preserved')
  else:select(q,why,rel,h)
 return d
# Scope never expands to later-completed reviews.
anchor=read('reviews/anchors/I-ANCHOR-MUSE/COMPARISON.json')
select(ROOT/'reviews/anchors/I-ANCHOR-MUSE/COMPARISON.json','Exact authored anchor judgments, economics, timing, usage, failures','explicit completed anchor comparison',target='reviews/anchors/I-ANCHOR-MUSE/COMPARISON.batch003.json')
select(ROOT/'reviews/anchors/I-ANCHOR-MUSE/REPORT.md','Exact authored interpretation; no curator verdict','explicit anchor report')
freeze('reviews/anchors/I-ANCHOR-MUSE/pair-freeze.json','Original anchor pair temporal/lifecycle gate')
for arm,stages in [('control',['research-v1','critic-v1','reviser-v1']),('treatment',['research-v1','critic-finalizer-v1'])]:
 for stage in stages:freeze(f'jobs/I-ANCHOR-MUSE/{arm}/{stage}/freeze.json','Full original admitted scientific stage/source notes/task/config/timing/native receipts')
for rel in ['control/source-review-v1','treatment/source-review-v1','treatment/source-review-v2']:
 freeze('reviews/anchors/I-ANCHOR-MUSE/'+rel+'/freeze.json','Original completed scientific review or stopped ungraded partial/protocol; original evaluation costs')
# Exact comparison-nominated measurement/failure artifacts, no supervisor state or history traversal.
for key in ['raw_metrics','measurement_receipts']:
 row=anchor[key];p=Path(row['path']);assert digest(p)[0]==row['sha256']
 if key=='measurement_receipts':
  d=read(str(p.relative_to(ROOT)));o=private(p,'Thread observation contains embedded message item; history-free timing projection used.')
  write_generated('helpers/anchor-supervisor/muse-t3-timing-observations.batch003.json',{'original_identity':o,'observations':sanitize(d)},'Actual matched T3 timing/settled observations; message items hashed',[o])
 else:select(p,'Exact native timing/usage metric samples; cumulative counters not summed','anchor COMPARISON raw_metrics',row['sha256'])
for rel in ['helpers/anchor-supervisor/preparation-failure-001.json','helpers/anchor-supervisor/metrics-helper-failure-001.json']:
 select(ROOT/rel,'Original retained infrastructure attempt/failure costs','anchor COMPARISON preserved_failure_attempts')
# Scoped snapshot of exact authored M05 subtrees only; mutable later-completed rows are deferred.
comparisons=read('helpers/targeted-cohort2/COMPARISONS.json')
cohort=[c for c in comparisons['cases'] if c['case_id'] in {'D-M05-A','D-M05-B'}]
assert len(cohort)==2
p=ROOT/'helpers/targeted-cohort2/COMPARISONS.json';h,n=digest(p)
comparison_identity={'original_path':str(p),'original_sha256':h,'original_bytes':n,'retention':'UNKNOWN/unverified','github_retention':'NOT_ASSERTED'}
write_generated('helpers/targeted-cohort2/COMPARISONS.batch003.json',{'snapshot_type':'scope_bounded_exact_authored_JSON_subtrees','original_identity':comparison_identity,'retained_json_pointers':['/cases/'+str(i) for i,c in enumerate(comparisons['cases']) if c['case_id'] in {'D-M05-A','D-M05-B'}],'cases':cohort,'scope_cutoff_utc':CUTOFF,'later_or_unrelated_rows':'DEFERRED; not included or counted','copy_identity':'Selected case subtrees preserve every authored field/value; wrapper is curation metadata; full original unchanged'},'Exact original M05 matched judgments/timing/usage subtrees; later mutable-file additions deferred',[comparison_identity])
for c in cohort:
 case=c['case_id'];assert c['disposition']=='TERMINAL_EVALUATED'
 assert c['review']==read(f'reviews/targeted-cohort2/{case}/REVIEW_FREEZE.json'),('comparison review differs from exact completed freeze',case)
 freeze(f'jobs/{case}/common/seed-v1/SEED_FREEZE.json','Original legitimate common seed, cold and amortized costs; seed is not truth')
 for arm in ['control','treatment']:freeze(f'jobs/{case}/{arm}/refresh-v1/FINAL_FREEZE.json','Exact evaluated scientific final/source map/timing/native lifecycle')
 for stage in ['common/seed-v1','control/refresh-v1','treatment/refresh-v1']:
  for name in ['INPUT_MAP.json','dispatch-config.json','dispatch-receipt.json','task.txt']:
   select(ROOT/f'jobs/{case}/{stage}/{name}','Exact authored assignment/binding/map for frozen evaluated stage',f'approved exact frozen {case}/{stage}')
 freeze(f'reviews/targeted-cohort2/{case}/REVIEW_FREEZE.json','Original independent full-scope review/checks/judgment/witnesses')
 imrel=f'reviews/targeted-cohort2/{case}/INPUT_MAP.json';im=read(imrel)
 for o in im['outputs']:
  for a in o['artifacts'].values():
   p=Path(a['path']);assert digest(p)[0]==a['sha256'];frozen.append({'freeze':imrel,'original_path':str(p),'sha256':a['sha256'],'bytes':p.stat().st_size,'verified':True});select(p,'Exact neutral reviewer input identity and candidate/reference meaning',imrel,a['sha256'])
 for name in ['INPUT_MAP.json','dispatch-config.json','dispatch-receipt.json','task.txt']:
  select(ROOT/f'reviews/targeted-cohort2/{case}/{name}','Exact independent review assignment/config/neutral input map',f'completed {case} review')
# Frozen failures/unassessed terminal evidence, no successors.
glm=freeze('jobs/I-ANCHOR-GLM/treatment/research-v2/freeze.json','Root-expired original GLM research: UNASSESSED, interrupted, native paused, HOLD')
for rel in ['state/glm-treatment-v2-expiry-task-terminal.json']:
 select(ROOT/rel,'Exact quiet expiry task terminal explicitly nominated by frozen lifecycle','GLM frozen integration-state-expiry-terminal-001')
for case in ['D-M08-A','D-M08-B']:freeze(f'jobs/{case}/common/research-v1/freeze_disposition.json','Original failed seed/disposition/overrun, costs retained; no method comparison or source grade')
# M01 gate exception only: do not read or publish any M01 reviewer findings/grades.
m01map='reviews/targeted/D-M01-A/source-review-v1/REVIEW_INPUT_MAP.json';m01identity='reviews/targeted/D-M01-A/source-review-v1/IDENTITY_MAP_PRIVATE.json'
im=read(m01map);ids=read(m01identity)
for name in ['X','Y']:
 a=ids[name];p=Path(a['original_final']);assert digest(p)[0]==a['sha256']
 select(p,'Original gate-exception candidate final; not counted as independent completed batch003 science',m01identity,a['sha256'])
 label=next(x for x in im['candidates'] if x['label']==name)
 for a in [label['final']]+label['method_required_intermediates']:
  p=Path(a['path']);hh,nn=digest(p);assert hh==a['sha256'];frozen.append({'freeze':m01map,'original_path':str(p),'sha256':hh,'bytes':nn,'verified':True})
  select(p,'Exact gate-frozen scientific input; diagnostic assessment not included in this batch',m01map,hh)
for name in ['INPUT_MAP.json','PROMPT.txt','REQUEST.json','DISPATCH_RECEIPT.json','CANCEL_RECEIPT.json','pre-cancel-status.json','TASK_TERMINAL.json','native_goal_receipt.json','report.md']:
 select(ROOT/'jobs/D-M01-A/control/revision-v1'/name,'Original interrupted revision assignment/activation/quiet interruption evidence; native terminal absent','explicit M01 original gate exception')
select(ROOT/m01map,'Exact original gate-frozen candidate hashes/source locators','M01 gate exception')
select(ROOT/m01identity,'Exact X=control/Y=treatment identity mapping, no grade','M01 gate exception')
p=ROOT/'reviews/targeted/D-M01-A/source-review-v1/PROMPT.txt';b=p.read_bytes();observations.setdefault(str(p),(sha(b),len(b)))
gate=next(line for line in b.decode().splitlines() if 'Root failed-terminal-disposition gate exception' in line)
write_generated('protocol/M01A_GATE_EXCEPTION.batch003.json',{'original_path':str(p),'original_sha256':sha(b),'original_bytes':len(b),'exact_authored_gate_paragraph':gate,'copied_range':'Exact single paragraph beginning Root failed-terminal-disposition gate exception','missing_native_terminal_path':str(ROOT/'jobs/D-M01-A/control/revision-v1/native_goal_terminal.json'),'missing_native_terminal_verified':not (ROOT/'jobs/D-M01-A/control/revision-v1/native_goal_terminal.json').exists(),'review_findings_read':False,'batch003_completed_science_credit':False},'Original diagnostic-only exception, interrupted task not native completion')
absences.append({'scope':'D-M01-A/control/revision-v1','missing':str(ROOT/'jobs/D-M01-A/control/revision-v1/native_goal_terminal.json'),'status':'ABSENT','effect':'Original failure and gate exception preserved; no lifecycle success inferred'})
# Cases exact briefs/cards/maps and source identity metadata, not source bodies.
for case in ['I-ANCHOR-MUSE','I-ANCHOR-GLM','D-M05-A','D-M05-B','D-M08-A','D-M08-B','D-M01-A']:
 base=ROOT/'cases'/case
 for rel in ['brief.md','card.json','plan.md','route-v2.json','CASE_CARD.md','INPUT_MAP.json','SEED_INPUT_MAP.json','case-card.json','inputs/brief.md','inputs/changes.json','inputs/prior-brief.md','inputs/sources.json']:
  p=base/rel
  if p.exists():
   select(p,'Exact declared case brief/binding/identity/source locator metadata','explicit scoped case')
   if rel=='inputs/sources.json':
    d=read(str(p.relative_to(ROOT)))
    def walk(x):
     if isinstance(x,dict):
      if x.get('path') and x.get('sha256'):
       q=Path(x['path']);q=q if q.is_absolute() else ROOT/q
       if q.exists() and is_raw(q):private(q,'Case mapped raw source body excluded; exact IDs/URL/version retained in authored map.',x['sha256'],{k:x[k] for k in ['source_id','url','version_or_capture','capture_date_utc'] if k in x})
      for v in x.values():walk(v)
     elif isinstance(x,list):
      for v in x:walk(v)
    walk(d)
# Exact infrastructure code/docs/configs/qualification and qualification-nominated redacted receipts only.
for name in ['export.py','qualify.py','README.md','PROSPECTIVE_CARRIER_V2.md','qualification.json','ROOT_ADMISSION_V2.json','config.json','dispatch.json','task.txt']:
 select(ROOT/'helpers/passive-receipts'/name,'Prospective carrier qualification and exact bounded code/docs; engineering only','explicit passive receipts helper')
qual=read('helpers/passive-receipts/qualification.json')
for c in qual['checks']:
 stem=c['stage'].replace('/','--')+'--'+c['artifact_sha256'][:16]+'.json';p=ROOT/'helpers/passive-receipts/receipts'/stem
 select(p,'Exact already-redacted qualification fixture; no raw native history or DB copied','qualification checks exact artifact hash',c['artifact_sha256'])
assert digest(ROOT/'helpers/passive-receipts/export.py')[0]==read('helpers/passive-receipts/ROOT_ADMISSION_V2.json')['exporter_sha256']
for rel in ['state/passive-receipts-task-terminal.json','state/publication-batch002.json']:
 select(ROOT/rel,'Actual infrastructure terminal or prior publication identity receipt','explicit allowed state receipt',target=str(Path(rel).with_name(Path(rel).stem+'.batch003.json')))
# Additional exact hashes in approved maps checked, no live source research.
for rel in ['reviews/targeted-cohort2/D-M05-A/INPUT_MAP.json','reviews/targeted-cohort2/D-M05-B/INPUT_MAP.json',m01map]:
 d=read(rel)
 for s in d.get('primary_sources',d.get('sources',[])):
  p=Path(s['path']);private(p,'Mapped primary raw bytes omitted; hash-only check, authored ID/URL/version/range retained.',s['sha256'],{k:s[k] for k in ['source_id','url','version_or_capture','capture_date_utc'] if k in s})
# Index carries original authored axes without new scientific judgments or speed arithmetic.
index={'status':'IN_PROGRESS_POINT_IN_TIME_PUBLICATION','cutoff_utc':CUTOFF,'campaign_complete':False,'completed_science':{'matched_pairs':3,'anchors':1,'targeted_pairs':2,'independently_assessed_arm_outputs':6,'completed_independent_review_tasks':4,'full_positive_arm_outputs':0,'source_PASS_inferred':False},'pairs':[{'case':'I-ANCHOR-MUSE','status':anchor['status'],'original_judgments':{a:d['quality']['overall_judgment'] for a,d in anchor['arms'].items()},'provenance':anchor['provenance_eligibility'],'time_usage':{a:{k:d[k] for k in ['time','usage','evaluation_attempts','failure_inclusive_evaluation_admitted_seconds']} for a,d in anchor['arms'].items()},'economic_observation':anchor['economic_observation']}]+cohort,'infra_and_unassessed':{'stopped_ungraded_review_attempts':1,'failed_original_common_seeds':2,'expired_unassessed_GLM_research_stages':1,'M01_original_gate_exception_cases':1,'prospective_carrier_qualification_helpers':1,'additional_completed_method_comparisons':0,'legitimate_common_seed_predecessors_without_independent_seed_truth_grade':2,'M01_gate_frozen_arm_outputs_not_assessed_in_batch003':2},'qualification':'Engineering only; prospective common carrier v2 for NEW matched-pair versions before either arm/common seed dispatch. Original contracts, failures and costs unchanged.','late_review_policy':'No scope expansion. Complete source reviews frozen after initial selection are deferred; no unrelated reviewer outputs inspected.','source_originals':'Full authored outputs, original judgments/checks and bounded authored source notes remain exact; raw captures referenced by identity only.'}
write_generated('INDEX.batch003.json',index,'In-progress count and exact original status/time/usage axes; no semantic regrade')
write_generated('RAW_PRIVATE_EVIDENCE.batch003.json',{'retention_policy':'UNKNOWN/unverified. Presence and hash at curation do not establish durable retention or GitHub availability. No raw source/native histories/DB/config/secrets copied.','entries':sorted(raw,key=lambda x:x['original_path'])},'Required private evidence identity, bytes and explicit retention limits')
write_generated('FROZEN_IDENTITY_CHECKS.batch003.json',{'cutoff':CUTOFF,'checks':frozen,'verification':'Streaming SHA-256 and byte counts; raw bodies never decoded; no witnesses/exporters executed.'},'Mechanical verification of every selected freeze-listed identity including excluded captures')
limits='''# ER10 batch003 — in progress

This compact, point-in-time publication adds one completed anchor and two completed targeted matched pairs (six independently assessed arm outputs, four completed reviewer tasks). Muse control/treatment original judgments are NOT_FULL_POSITIVE; D-M05-A/B control/treatment source quality is FAIL. These labels are preserved exactly. They do not establish equal quality, a quality-preserving speedup, twofold result, affordability or a quota saving. No SourcePASS is inferred.

The Muse premature treatment source-review-v1 remains an ungraded stopped partial; full treatment source-review-v2 retains the prior-observation/blinding disclosure. Comparative/provenance eligibility remains HOLD and exposure UNKNOWN. Original evaluation costs include the stopped attempt. The observed 1.7254 latency ratio is descriptive only. D-M05-A cold inclusive control/treatment seconds are 431.904 / 715.337; D-M05-B are 700.729 / 437.65, with full seed/intervening queue costs retained. D-M05-B independent review delivery exceeded its 900-second ceiling by 93.278 seconds. Its treatment native paused/complete observations retain continuous-active eligibility HOLD. Cumulative native counters are neither generated tokens nor billing; enclosing samples are not summed. Billing/input/cache/output splits and actual source-operation counts remain unknown where originally unknown.

Infrastructure and unassessed records are separate: one stopped partial review, two original failed common seeds (M08A/B, neither arm admitted), one expired GLM treatment research-v2 (T3 interrupted, native paused, lifecycle HOLD, source UNASSESSED), one M01A interruption/missing-native-terminal diagnostic gate exception, and one prospective carrier qualification helper. None adds a completed method comparison. M01A reviewer findings/grades and later or unrelated reviews are outside this batch. The mutable cohort comparison file grew during curation. Its batch003 snapshot retains only the two approved exact M05 JSON subtrees, with the full original SHA-256/bytes and precise JSON pointers; later or unrelated case rows are deferred and not published. M05 comparison review fields mechanically match the original completed review freezes. Two legitimate M05 common seeds are unassessed as independent truth and two M01 gate-frozen finals are not scientifically graded in this batch.

Prospective carrier v2 is infrastructure only and may apply only to new matched-pair versions declared before either arm or common seed dispatch. Old missing-receipt failures/contracts/costs remain unchanged. Codex projection is not a raw create/get response; GLM installed integration state is not a vendor backend target; unverified alias mapping and incomplete scope audits remain unknown. No provider calls, Goals, new case-specific research, witness execution, scientific repairs, best-of selection or rewritten grades were performed for curation.

Exact authored assignments/configs, full scientific outputs, source IDs/URLs/version/ranges, judgments, executed reviewer checks and minimal witness scripts are either new exact copies or hash-verified stable references at the recorded batch002 commit. References have local and Git-blob byte identity checks; this helper has not re-queried GitHub and has not published the staging files. Mutable comparison/administrative collisions use batch003 snapshot names; scoped comparison extraction is clearly labeled separately from byte-exact copies. Existing versioned scientific files are never overwritten.

Raw primary bodies, complete articles, vendor code/HTML/corpora, native histories, databases and account/config/secrets are excluded. RAW_PRIVATE_EVIDENCE.batch003.json records required original path+SHA-256+bytes and retention UNKNOWN/unverified; local presence does not promise retention or GitHub availability. Bounded already-authored excerpts/locators and actual witness code remain with their original meaning. Text-bearing GLM lifecycle and T3 timing records have separate clearly labeled projections with original identity and hashed text; originals are preserved. No new source excerpts were extracted from raw bodies.

Mechanics: FROZEN_IDENTITY_CHECKS.batch003.json covers every selected freeze-listed original; the manifest records exact copies and stable references. Recheck copies/references with _curation/verify_batch003.py. Reproduction of historical witnesses requires the exact externally retained captures named by their authored maps, the original host/version limitations, and an isolated copy of the scripts/maps; do not treat a rerun or proposed test as original execution. Do not run the exporter/qualification scripts from publication staging: they describe the original host-bound engineering run and can write runtime state. Raw retention and full exact runtime availability are unverified.

Selection cutoff is 2026-10-07T19:18:49.960897+00:00. Later-completed/frozen reviews are deferred without inspection. Campaign remains in progress; this is not a campaign completion report.
'''
write_generated('IN_PROGRESS_BATCH003.md',limits.encode(),'Publication index limitations, exact original failures and lawful retention/reproduction boundary')
# Recheck all observed selected identities at end, rejecting any in-flight source mutation.
for path,(h,n) in observations.items():assert digest(Path(path))==(h,n),('source changed during curation',path)
assert not (ROOT/'jobs/D-M01-A/control/revision-v1/native_goal_terminal.json').exists(),'Original absent native terminal changed during curation'
# Script is retained for reproducibility, not an experiment/candidate runner.
script=STAGE/'_curation/curate_batch003.py'
if script.exists():
 h,n=digest(script);generated.append({'source_original_path':str(script),'source_original_sha256':h,'source_original_bytes':n,'source_kind':'curator_generated_code','target_repo_relative_path':PREFIX+'_curation/curate_batch003.py','staging_relative_path':'_curation/curate_batch003.py','sha256':h,'bytes':n,'copy_identity':'curator_generated_metadata','why_required':'Exact finite publication-curation recipe; no experimental work or native-state edits'})
# Add verifier already supplied next to this recipe.
v=STAGE/'_curation/verify_batch003.py'
if v.exists():
 h,n=digest(v);generated.append({'source_original_path':str(v),'source_original_sha256':h,'source_original_bytes':n,'source_kind':'curator_generated_code','target_repo_relative_path':PREFIX+'_curation/verify_batch003.py','staging_relative_path':'_curation/verify_batch003.py','sha256':h,'bytes':n,'copy_identity':'curator_generated_metadata','why_required':'Read-only manifest/copy/freeze/reference verification; no raw semantic reads'})
manifest={'schema':'ER10-publication-batch003-v1','batch':'003','status':'IN_PROGRESS_CURATED_NOT_PUBLISHED','campaign_complete':False,'selection_cutoff_utc':CUTOFF,'scope':'One Muse anchor + two D-M05 targeted completed pairs; explicitly scoped original failures and prospective carrier infrastructure only','publication_root_repo_relative':PREFIX.rstrip('/'),'budget_bytes':BUDGET,'files':sorted(files+generated,key=lambda x:x['target_repo_relative_path']),'existing_publication_references':sorted(references,key=lambda x:x['source_original_path']),'completed_science_counts':index['completed_science'],'infra_and_unassessed_counts':index['infra_and_unassessed'],'absences':absences+[{'scope':'All raw/private evidence identities','status':'BODY_NOT_PUBLISHED','retention':'UNKNOWN/unverified','index':PREFIX+'RAW_PRIVATE_EVIDENCE.batch003.json'},{'scope':'billing/input/cache/generated-output quotas','status':'UNKNOWN where original receipts have null; no estimates'},{'scope':'later/unrelated complete source reviews','status':'DEFERRED_WITHOUT_INSPECTION'}],'verification':{'all_selected_frozen_identities':True,'all_selected_originals_unchanged_at_end':True,'all_copy_hashes':True,'all_existing_reference_local_and_commit_hashes':True,'remote_publication_requeried':False},'no_new_scientific_verdicts':True,'manifest_self_hash':'Report separately; manifest cannot contain its own hash'}
manifest['source_copy_file_count']=len(files);manifest['generated_file_count']=len(generated);manifest['existing_reference_count']=len(references);manifest['frozen_identity_check_count']=len(frozen);manifest['raw_private_evidence_count']=len(raw);manifest['unique_frozen_original_count']=len({x['original_path'] for x in frozen});manifest['payload_bytes_excluding_manifest']=sum(x['bytes'] for x in files+generated)
mp=STAGE/'BATCH003_MANIFEST.json';mp.write_bytes(jbytes(manifest));total=sum(p.stat().st_size for p in STAGE.rglob('*') if p.is_file());assert total<=BUDGET
report={'schema':'ER10-publication-batch003-curation-report-v1','status':'CURATED_AND_MECHANICALLY_VERIFIED_NOT_PUBLISHED','campaign_complete':False,'root':str(ROOT),'staging':str(STAGE),'manifest_path':str(mp),'manifest_target_repo_relative_path':PREFIX+'BATCH003_MANIFEST.json','manifest_sha256':digest(mp)[0],'manifest_bytes':mp.stat().st_size,'staging_files':sum(p.is_file() for p in STAGE.rglob('*')),'staging_bytes':total,'budget_bytes':BUDGET,'source_copy_files':len(files),'generated_files_excluding_manifest':len(generated),'existing_published_reference_count':len(references),'frozen_identity_checks':len(frozen),'private_evidence_identities':len(raw),'completed_science_counts':index['completed_science'],'infra_and_unassessed_counts':index['infra_and_unassessed'],'absences':manifest['absences'],'verification':manifest['verification'],'write_scope':'Only helpers/publication-batch003/staging/** and helpers/publication-batch003/curation-report.json','git_or_native_state_mutations':False,'children_launched':False,'selection_cutoff_utc':CUTOFF,'stable_reference_commit':COMMIT}
(HELPER/'curation-report.json').write_bytes(jbytes(report));print(json.dumps(report,indent=2))
