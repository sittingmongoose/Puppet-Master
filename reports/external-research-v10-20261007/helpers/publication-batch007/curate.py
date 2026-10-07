#!/usr/bin/env python3
"""Finite ER10 BATCH007 exact-byte publication curation. No Git, source research, or grading.

Only explicit closed scopes and exact prior identities are read. Writes are confined
here; raw source bodies and rollout bytes never enter staging.
"""
import collections, datetime as dt, hashlib, json, re
from pathlib import Path
R=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
W=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
H=R/'helpers/publication-batch007'; S=H/'staging'; BASE='reports/external-research-v10-20261007'; P=S/BASE
CFG=json.loads((H/'config.json').read_bytes()); CUTOFF=CFG['fixed_cutoff']; TS=dt.datetime.fromisoformat(CUTOFF).timestamp(); COMMIT=CFG['latest_verified_commit']
DEADLINE=dt.datetime.fromisoformat(CFG['deadline']).timestamp()
selected={};raw={};checks=[];omissions=[];gates=[];collisions=[];parse_limits=[];scopes=set();explicit=set();protocol_paths=set();prior_checks=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
def under(p,r):return p==r or r in p.parents
def write(p,b):
 assert under(p.resolve(),H.resolve()),p
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert p.read_bytes()==b,('append-only collision',p)
 else:p.write_bytes(b)
def encoded(o):return (json.dumps(o,indent=2,ensure_ascii=False)+'\n').encode()
def dump(p,o):write(p,encoded(o))
def strict(b):
 try:return json.loads(b)
 except (ValueError,UnicodeError):return None
def parse(b):
 j=strict(b)
 if j is not None:return j
 try:return json.JSONDecoder().raw_decode(b.decode().lstrip())[0]
 except (ValueError,UnicodeError):return None
def forbidden(p):
 s=str(p)
 return bool(re.search(r'(^|/)(\.git|__pycache__|profiles?|databases?|transcripts?|history|logs?|scratch|node_modules|rollouts?)(/|$)|\.(sqlite|db|pyc|jsonl|log|pdf|patch)$',s,re.I))
def blocked_format(p):
 # PDF/patch are raw identity candidates, all other forbidden formats stay unopened.
 return forbidden(p) and p.suffix.lower() not in ['.pdf','.patch']
def stable(p,cutoff=True):
 if not p.is_file():return None
 if p.is_symlink() and (not under(p.resolve(),R) or not allowed(p.resolve())):return None
 link_before=p.lstat().st_mtime_ns
 st=p.stat()
 if cutoff and st.st_mtime>TS:return None
 b=p.read_bytes();end=p.stat()
 if (st.st_size,st.st_mtime_ns)!=(end.st_size,end.st_mtime_ns) or p.lstat().st_mtime_ns!=link_before:return None
 return b,st

def body_json(j):
 if isinstance(j,dict):
  if ('encoding' in j and 'content' in j) or any(isinstance(j.get(k),str) for k in ['body','patch','raw_body','response_body']):return True
  if 'sha' in j and 'commit' in j and isinstance(j.get('files'),list):return True
  if 'sha' in j and isinstance(j.get('tree'),list):return True
  if 'node_id' in j and ('url' in j or 'html_url' in j):return True
  return any(body_json(v) for v in j.values() if isinstance(v,(dict,list)))
 if isinstance(j,list):return any(body_json(v) for v in j if isinstance(v,(dict,list)))
 return False

def kind(p,b):
 parts=p.relative_to(R).parts;n=p.name.lower();j=parse(b) if p.suffix.lower()=='.json' else None
 if p.suffix.lower() in ['.pdf','.patch','.zip','.gz','.tar','.png','.jpg','.jpeg','.webp','.mp4','.bin']:return 'RAW_BODY_EXCLUDED'
 if 'source-cache' in parts:
  return 'RAW_BODY_EXCLUDED' if 'objects' in parts else 'SOURCE_OPERATION_METADATA'
 source=any(x in parts for x in ['sources','source','reviewer-source-checks','primary-source-checks','raw','corpus','captures'])
 if not source:return 'AUTHORED_RESULT_PROTOCOL_OR_RECEIPT'
 if body_json(j):return 'RAW_BODY_EXCLUDED'
 if p.suffix.lower()=='.json':
  metadata_name=bool(re.search(r'(index|manifest|identity|identities|audit|checksum|checks|retrieval|provenance|metadata|read|source-map)',n))
  metadata_keys=isinstance(j,dict) and any(k in j for k in ['sha256','url','urls','sources','retrievals','checks','captures','input_identities','rows','results','captured_at','response_bytes'])
  if metadata_name or metadata_keys or re.fullmatch(r'p\d+.*\.json',n):return 'AUTHORED_SOURCE_CHECK_OR_IDENTITY'
 if p.suffix.lower()=='.py' and n in ['checks.py','retrieve.py','reproduce.py','finalize.py','validate.py','check.py']:return 'AUTHORED_RUNNABLE_SOURCE_CHECK'
 if n in ['sources.md','checksums.txt','review-evidence.md']:return 'AUTHORED_SOURCE_CHECK_OR_IDENTITY'
 if p.suffix.lower()=='.txt' and len(b)<=4096:
  saved=stable(p.with_suffix('.json'));m=parse(saved[0]) if saved else None
  if isinstance(m,dict) and re.search(r'bounded|excerpt',json.dumps(m),re.I) and isinstance(m.get('response_bytes'),int) and len(b)<m['response_bytes']:return 'EXISTING_AUTHORED_SMALL_BOUNDED_WITNESS'
 return 'RAW_BODY_EXCLUDED'
def allowed(p):return under(p,R) and not blocked_format(p) and (p in explicit or any(under(p,q) for q in scopes))
def select(p,why,force=False):
 p=Path(p)
 if str(p) in selected or str(p) in raw:return
 if not under(p,R) or blocked_format(p):
  omissions.append({'path':str(p),'status':'UNOPENED_UNSAFE_OR_EXCLUDED_FORMAT','why':why});return
 if not force and not allowed(p):return
 saved=stable(p)
 if not saved:
  omissions.append({'path':str(p),'status':'ABSENT_AFTER_CUTOFF_OR_UNSTABLE','exists_at_selection':p.exists(),'why':why});return
 b,st=saved;k=kind(p,b)
 item={'path':str(p),'sha256':sha(b),'bytes':len(b),'mtime_ns':st.st_mtime_ns,'why':why,'kind':k}
 if k=='RAW_BODY_EXCLUDED':
  j=parse(b) if p.suffix.lower()=='.json' else None
  meta={}
  if isinstance(j,dict):
   for field in ['url','html_url','ref','tag','sha','full_name','version','license']:
    if field in j:meta[field]=j[field]
   if isinstance(j.get('object'),dict):meta['upstream_object_sha']=j['object'].get('sha');meta['upstream_object_url']=j['object'].get('url')
  raw[str(p)]={**item,'github_body_published_in_batch007':False,'archive_verified':False,'private_retention':'UNKNOWN_UNVERIFIED','source_locators':[{'origin':'excluded upstream metadata identities only',**meta}] if meta else []};return
 if re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:sk-proj-|ghp_|github_pat_)[A-Za-z0-9_-]{20,}',b):
  omissions.append({'path':str(p),'sha256':sha(b),'status':'SECRET_PATTERN_EXCLUDED_ORIGINAL_NOT_REWRITTEN'});return
 selected[str(p)]={**item,'data':b,'original_symlink_target':str(p.resolve()) if p.is_symlink() else None}
 if p.suffix=='.json' and strict(b) is None:
  try:
   _,end=json.JSONDecoder().raw_decode(b.decode().lstrip());suffix=b.decode().lstrip()[end:]
   status='PREFIX_JSON_WITH_LITERAL_ESCAPED_NEWLINE_SUFFIX' if suffix.strip()=='\\n' else 'PREFIX_JSON_WITH_NONSTANDARD_TRAILING_CONTENT'
  except (ValueError,UnicodeError):status='ORIGINAL_JSON_PARSE_FAILED'
  parse_limits.append({'original_path':str(p),'sha256':sha(b),'bytes':len(b),'status':status,'original_bytes_unchanged':True,'prefix_used_only_for_mechanical_locators':parse(b) is not None})
def add(s,why):
 p=R/s;explicit.add(p);select(p,why,True)
def scan(p,why):
 for q in sorted(p.rglob('*')):
  if q.is_file() and not blocked_format(q):select(q,why)
def closed_scope(s,witness,why):
 p=R/s;w=R/witness
 saved=stable(w)
 assert saved,('no pre-cutoff closure witness',s,witness)
 j=parse(saved[0]);assert isinstance(j,(dict,list)),(s,witness)
 # Closure is explicit scope authority; scientific correctness is never inferred.
 scopes.add(p);gates.append({'scope':str(p),'status':'EXPLICIT_CLOSED_FROZEN_SCOPE','witness_path':str(w),'witness_sha256':sha(saved[0]),'why':why,'no_scientific_grade_inferred':True});add(witness,'exact scope closure witness');scan(p,why)
PROTOCOL_NAMES=['config.json','dispatch-config.json','prospective-config-v1.json','prospective-config-v2.json','actual-dispatch-config.json','dispatch-request.json','stage-envelope.json','request.json','REQUEST.json','input-map.json','INPUT_MAP.json','REVIEW_INPUT_MAP.json','task.txt','task-template.txt','PROMPT.txt','assignment.md','runtime-budget.json','prospective-timing.json','admission-timing.json','INPUT_HASH_BINDING.json']
def protocol_scope(p,why):
 gates.append({'scope':str(p),'status':'PREDISPATCH_PROTOCOL_ONLY_NO_SCIENCE_OPENED','why':why})
 for n in PROTOCOL_NAMES:
  q=p/n
  if q.is_file():explicit.add(q);protocol_paths.add(str(q));select(q,'PROTOCOL_ONLY_NOT_COMPLETION: '+why,True)

# Final CLOSED Cohort1 projection and last exact M02A v3 assessment; other prior
# science resolves from exact prior manifest identities rather than broad re-audit.
cohort_w='helpers/targeted-supervisor/FINAL_OWNED_TASK_QUIET_CHECK.json'
for n in ['COMPARISONS.json','COMPARISONS-full-final-preserved.json','COMPARISONS-pre-final-preserved.json','FINAL_OWNED_TASK_QUIET_CHECK.json','FINAL_OWNED_TASK_SETTLEMENTS.json','D-M02-A-final-all-task-templates-v3.json','D-M02-A-final-both-arm-config-map-v3.json','D-M02-A-final-pair-quiet-gate-v3.json','cohort1-m02a-final-v3.py','prepare-m02a-final-review-v3.py','cohort1-task.txt','candidate-common-v2.txt','reviewer-common-v2.txt']:
 add('helpers/targeted-supervisor/'+n,'final CLOSED six-case projection, exact last M02A v3 setup/closure/generic reproduction helper')
for p in sorted((R/'jobs/D-M02-A').glob('*/*-v3')):
 if p.is_dir():closed_scope(str(p.relative_to(R)),cohort_w,'M02A authorized final v3 completed candidate stage; lifecycle/chronology limits retained')
closed_scope('reviews/targeted/D-M02-A/source-review-v3','reviews/targeted/D-M02-A/source-review-v3/TASK_TERMINAL.json','last complete independent M02A v3 six-axis review and full declared coverage')

# Exactly four mechanical dispositions and 24 prebound case files; C01 review
# absence is a terminal missing artifact, never silently upgraded.
confirm_w='reviews/confirmation/FINAL_QUIET.json'
for n in ['COMPARISONS.json','REPORT.md','FINAL_QUIET.json']:add('reviews/confirmation/'+n,'final exact C01..C04 closure aggregate/report/28-task quiet audit')
for case in ['C-01','C-02','C-03','C-04']:
 for p in sorted((R/'jobs'/case).glob('*/*')):
  if p.is_dir():closed_scope(str(p.relative_to(R)),confirm_w,'actual frozen confirmation candidate task/source-map/native/timing record')
 for arm in ['control','treatment']:
  closed_scope(f'reviews/confirmation/{case}/{arm}/source-review-v1',confirm_w,'exact closed confirmation independent review or explicit C01-control incomplete-review freeze; no absent assessment inferred')
 for n in ['COMPARISON.json','PAIR_FINAL_FREEZE.json','PAIR_QUIET.json']:
  add(f'reviews/confirmation/{case}/{n}','immutable exact confirmation disposition and pair gate distinct from scientific grade')
 for n in ['BRIEF.md','PLAN.md','case-card.json','INPUT_MAP.json','PREPARED.json','READY.json']:
  add(f'cases/{case}/{n}','one of ALL 24 exact prebound confirmation files')
for n in ['aggregate.py','all-inputs-and-carriers-freeze.json','compare.py','config.json','dispatch.json','finish_review.py','manage.py','protocol-freeze.json','review.py','task.txt']:
 add('helpers/confirmation-supervisor/'+n,'exact final confirmation generic helper/task/config/predispatch binding')

# M08B v3 complete pair and own full independent reviews only.
m08w='jobs/D-M08-B/V3_PAIR_FREEZE.json'
for n in ['V3_PAIR_FREEZE.json','V3_ALL_STAGE_PRELAUNCH_FREEZE.json']:add('jobs/D-M08-B/'+n,'exact selected M08B v3 pair/predispatch freeze')
for s in ['common/fresh-common-draft-v3','common/fresh-independent-common-critique-v3','control/coherent-rewrite-check-final-v3','treatment/local-amendment-dependency-check-render-v3']:
 closed_scope('jobs/D-M08-B/'+s,m08w,'M08B selected v3 frozen common and arm stages, original native/time/source limits retained')
for j in ['J1','J2']:closed_scope('reviews/targeted-cohort3/D-M08-B-v3/'+j,'reviews/targeted-cohort3/D-M08-B-v3/'+j+'/freeze_disposition.json','M08B complete independent own review, full six-axis coverage')
add('reviews/targeted-cohort3/D-M08-B-v3/PAIR_COMPARISON.json','M08B complete original pair comparison')
for n in ['freeze_v3.py','prepare_reviews_v3.py','stage_record.py']:add('helpers/targeted-cohort3/'+n,'exact generic M08B v3 freezing/review preparation helper')

# M15 v3 all four candidate stages and both full reviews; no live M16 siblings.
m15w='helpers/targeted-cohort4/D-M15-A/pair-freeze-v3.json'
closed_scope('helpers/targeted-cohort4/D-M15-A',m15w,'M15 selected v3 pair/comparison/source identity/admission/economics with original prospective overlays')
for s in ['control/whole_question_research_final-v3','treatment/fresh_object_scout-v3','treatment/fresh_transport_scout-v3','treatment/fresh_full_synthesis_final-v3']:
 closed_scope('jobs/D-M15-A/'+s,m15w,'M15 v3 complete exact candidate stage; parallel scouts and failed costs remain distinct')
for a in ['control','treatment']:
 closed_scope('reviews/targeted-cohort4/D-M15-A/'+a+'-v3','reviews/targeted-cohort4/D-M15-A/'+a+'-v3/freeze.json','M15 v3 complete own independent full review')
for n in ['freeze_stage.py','prepare_reviews_v3.py','prepare_glm_final_v3.py','capture.py','register.py']:
 add('helpers/targeted-cohort4/'+n,'generic selected M15 preparation/capture/reproduction helper; script existence is not execution')

# METHOD02 v2 exact closed standalone treatment diagnostic is separate from
# immutable paired UNASSESSED/HOLD; do not substitute its FAIL into paired grade.
m02w='helpers/integrated-execution/method02-v2-standalone-diagnostic-current-quiet-v1.json'
for p in sorted((R/'jobs/I-METHOD-02').glob('*/*-v2')):
 if p.is_dir():closed_scope(str(p.relative_to(R)),m02w,'METHOD02 v2 terminal candidate/failure records; control draft unassessed and no full-final success inferred')
closed_scope('reviews/integrated-methods/I-METHOD-02/treatment/standalone-diagnostic-v2','reviews/integrated-methods/I-METHOD-02/treatment/standalone-diagnostic-v2/frozen-standalone-review.json','separately root-authorized full treatment-only Source6 diagnostic FAIL; original paired HOLD unchanged')
# FAST02 full exact paired reviews and cold lock/time/carriers.
fastw='helpers/integrated-execution/i-fast-02-pair-current-quiet-v1.json'
for p in sorted((R/'jobs/I-FAST-02').glob('*/*-v1')):
 if p.is_dir():closed_scope(str(p.relative_to(R)),fastw,'FAST02 exact terminal native-complete candidates, source maps and failure-inclusive times')
for a in ['control','treatment']:
 closed_scope('reviews/integrated-methods/I-FAST-02/'+a+'/review-v1','reviews/integrated-methods/I-FAST-02/'+a+'/review-v1/frozen-review.json','FAST02 complete full Source6 paired review FAIL/FAIL; no equal-quality/ranking inference')
for n in ['method02-pair-disposition-v2.json','method02-v2-standalone-diagnostic-current-quiet-v1.json','method02-v2-treatment-standalone-gate-freeze-v1.json','i-method-02-terminal-economics-v2.json','method02-v2-prospective-clock-annotation.json','method02-v2-future-stage-carrier-path-overlay.json','fast02-pair-disposition-v1.json','i-fast-02-pair-current-quiet-v1.json','i-fast-02-pair-freeze-v1.json','i-fast-02-pair-prospective-freeze-v1.json','i-fast-02-terminal-economics-v1.json','speed-lock-received.json','selection-v1.json','freeze_complete_pair.py','freeze_method02_retest.py','freeze_review.py','freeze_speed.py','freeze_terminal.py','prepare_method02_stage_v2.py','prepare_review.py','prepare_speed_pair.py','prepare_speed_stage.py','prepare_stage.py','record_activation.py','record_dispatch.py','record_review_dispatch.py','record_terminal_economics.py','record_version_terminal_economics.py','register_returned_dispatch.py']:
 add('helpers/integrated-execution/'+n,'selected completed METHOD02v2/FAST02 immutable diagnostic/gate/economics or generic reproduction helper')

# Declared authored case packets; exclude raw primary sources, corpus and PDFs.
for case in ['D-M02-A','D-M08-B','D-M15-A','I-METHOD-02','I-FAST-02']:
 d=R/'cases'/case
 for p in sorted(d.iterdir()) if d.exists() else []:
  if p.is_file():add(str(p.relative_to(R)),'selected exact authored case brief/plan/identity bindings')
 for n in ['inputs','input','source']:
  p=d/n
  if p.is_dir():scopes.add(p);scan(p,'selected frozen authored case inputs; raw primary bodies excluded')
# Later scopes are protocols ONLY, even if files/task IDs look completed now.
for case in ['D-M10-A','D-M10-B','D-M16-A','I-METHOD-04','I-FAST-03']:
 for p in sorted((R/'jobs'/case).glob('*/*')):
  if p.is_dir():protocol_scope(p,'live/unassessed at fixed cutoff; no answers, findings, terminal/native outputs opened')
# Explicit PREdispatch root schedule covers later GLM queues without opening them.
for s in ['state/targeted-cohort1-terminal-finalaudit-v1.json','state/confirmation-supervisor-terminal-finalaudit-v1.json','state/root-resume-binding-and-confirmation-normalization-v1.json','state/C-03-failed-native-diagnostic-review-gate-exception-v1.json','state/I-METHOD-02-v2-treatment-only-diagnostic-gate-exception-v1.json','state/confirmation-cases.json','state/recorded-usage-reader-terminal-v1.json','state/recorded-usage-root-validation-v1.json','state/C-02-actual-Codex-session-usage-observation-v1.json','state/recorded-usage-service-observation-v1.json','state/cleanup-publication-batch006-staging-v1.json','state/publication-batch006.json','state/publication-batch006-local-validation.json','state/publication-batch006-index-validation.json','state/publication-batch006-task-terminal.json','state/final-finite-prospective-admissions-v3.json','state/final-finite-t0-interpretation-before-starts-v1.json','state/logical-slot-index-v1.json','state/prospective-activation-notice-registration-order-v1.json','state/review-carrier-prospective-v2.json','state/review-boundary-annotation-v1.json','locks/confirmation-selection.json','locks/speed-budget-selection-v1.json','helpers/passive-receipts/ROOT_ADMISSION_V2.json','helpers/passive-receipts/PROSPECTIVE_CARRIER_V2.md','helpers/passive-receipts/export.py','helpers/passive-receipts/README.md','packet/ER10_T3_EXECUTE_HANDOFF.md','helpers/final-report/resolve_public_evidence.py','helpers/publication-batch006/curate.py','helpers/recorded-usage/reader.py','helpers/recorded-usage/README.md','helpers/recorded-usage/config.json','helpers/recorded-usage/dispatch.json','helpers/recorded-usage/task.txt','helpers/recorded-usage/root-registration-repair.json','helpers/recorded-usage/observation-20261007T211653Z-aa6ea07490bb4a08.json']:
 add(s,'actual root closure/binding/normalization/verified B6 retention cleanup, immutable separate telemetry observation, or fixed protocol/helper evidence')

# Prior immutable manifest identities, verified against exact local targets.
# No Git commands or network verification occur. Commit pin is independently
# verified by root and supplied in task/config; no new remote claim is made.
prior=collections.defaultdict(list);prior_by_path=collections.defaultdict(list);verified={}
for i in range(1,7):
 p=W/BASE/f'BATCH{i:03d}_MANIFEST.json';b=p.read_bytes();j=json.loads(b)
 prior_checks.append({'path':str(p),'sha256':sha(b),'bytes':len(b),'reference_commit':COMMIT,'verification':'exact local manifest bytes; root independently verified commit pin supplied in task'})
 for e in j.get('entries',j.get('files',[])):
  op=e.get('original_path') or e.get('source_original_path') or e.get('source_runtime_relative_path')
  oh=e.get('original_sha256') or e.get('source_original_sha256') or e.get('sha256')
  tp=e.get('target_path') or e.get('target_repo_relative_path') or (BASE+'/'+e['public_path'] if e.get('public_path') else None)
  th=e.get('target_sha256') or e.get('sha256');n=e.get('target_bytes',e.get('bytes',e.get('original_bytes')))
  if op and oh and tp and th==oh:
   if not op.startswith('/'):op=str(R/op)
   row={'target':tp,'sha256':th,'bytes':n,'manifest':p.name,'kind':e.get('source_kind','PRIOR_EXACT_AUTHORED_IDENTITY')}
   prior[(op,oh)].append(row);prior_by_path[op].append((oh,row))
def target_bytes(row):
 tp=row['target'];p=(W/tp).resolve()
 if not under(p,W) or p.is_symlink() or not p.is_file():return None
 if tp not in verified:
  b=p.read_bytes();verified[tp]=(sha(b),len(b))
 return verified[tp]
def exact_prior(op,h,n=None):
 matches=[r for r in prior.get((op,h),[]) if target_bytes(r)==(h,r['bytes']) and (n is None or r['bytes']==n)]
 if not matches:return None
 # Equivalent duplicate exact identities have the same bytes; target ordering
 # chooses presentation only, never a version or scientific grade.
 normal=BASE+'/'+str(Path(op).relative_to(R)) if under(Path(op),R) else ''
 return next((r for r in matches if r['target']==normal),sorted(matches,key=lambda r:r['target'])[0])

# Mechanical identity closure never expands into live science or usage rollouts.
def resolve(loc,owner,h=None):
 p=Path(loc)
 if p.is_absolute():return p
 if loc.startswith('reports/'):return W/p
 if loc.startswith(('jobs/','reviews/','cases/','helpers/','state/','locks/','packet/')):return R/p
 candidates=[owner.parent/p]
 if loc in ['case-card.json','CASE_CARD.md','INPUT_MAP.json','READY.json','BRIEF.md','PLAN.md']:
  subject=next((q.name for q in owner.parents if re.fullmatch(r'D-M\d{2}-[AB]|I-METHOD-\d{2}|I-FAST-\d{2}|C-\d{2}',q.name)),None)
  if subject:candidates.insert(0,R/'cases'/subject/p)
 for parent in [owner.parent,*list(owner.parents)[:4]]:
  if loc.startswith('sources/') and parent.name=='sources':candidates.append(parent.parent/p)
  if parent.name=='sources':candidates.extend([parent/'raw'/p,parent/'objects'/p])
 # Do not read speculative candidates. Selected exact bytes can disambiguate.
 known=[q for q in dict.fromkeys(candidates) if (selected.get(str(q)) or raw.get(str(q)) or {}).get('sha256')==h and h]
 return known[0] if len(known)==1 else candidates[0]
LOC_KEYS=['url','urls','final_url','version','version_or_capture','version_or_commit','version_or_release','commit','tag','ref','locator','locators','line_range','accessed_at_utc','captured_at','source_id','license','upstream','upstream_url','release','http_status','retrieved_at','accessed_at','source_url','path_or_locator','capture_date_utc','captured_at_utc']
def identities(o,owner,pointer=''):
 if isinstance(o,dict):
  loc=next((o[k] for k in ['path','original_path','file','capture_path','local_path','local_file','relative_path','stored_path','capture_file','captured_file','source_path','file_path','artifact_path','freeze'] if isinstance(o.get(k),str)),None)
  h=next((o[k] for k in ['sha256','hash','original_sha256','local_sha256','capture_sha256','stored_sha256','body_sha256','raw_sha256'] if isinstance(o.get(k),str) and re.fullmatch('[0-9a-f]{64}',o[k])),None)
  meta={k:v for k,v in o.items() if k in LOC_KEYS}
  if loc and (h or o.get('exists') is False):yield resolve(loc,owner,h),h,o.get('bytes',o.get('local_bytes')),o.get('exists'),pointer,meta
  for field in ['bounded_evidence','excerpt']:
   if isinstance(o.get(field+'_file'),str):yield resolve(o[field+'_file'],owner,o.get(field+'_sha256')),o.get(field+'_sha256'),o.get(field+'_bytes'),True,pointer+'/'+field,meta
  for k,v in o.items():
   if isinstance(v,dict) and ('sha256' in v or v.get('exists') is False) and not any(t in v for t in ['path','file','capture_path','local_path','captured_file','source_path','file_path','freeze']) and ('.' in k or '/' in k):yield resolve(k,owner,v.get('sha256')),v.get('sha256'),v.get('bytes'),v.get('exists'),pointer+'/'+k,{t:u for t,u in v.items() if t in LOC_KEYS}
   if isinstance(v,str) and re.fullmatch('[0-9a-f]{64}',v) and ('/' in k or '.' in k) and not k.endswith('sha256'):yield resolve(k,owner,v),v,None,True,pointer+'/'+k,{}
   if isinstance(v,(dict,list)):yield from identities(v,owner,pointer+'/'+k)
 elif isinstance(o,list):
  for i,v in enumerate(o):yield from identities(v,owner,pointer+'/'+str(i))
processed=set();historical=[]
while True:
 pending=[x for x in selected.values() if x['path'].endswith('.json') and x['path'] not in processed]
 if not pending:break
 for item in pending:
  processed.add(item['path']);owner=Path(item['path']);obj=parse(item['data'])
  if obj is None:continue
  for p,h,n,exists,pointer,meta in identities(obj,owner):
   row={'record':str(owner),'locator':str(p),'expected_sha256':h,'expected_bytes':n,'identity_pointer':pointer}
   if exists is False:
    row.update(status='DECLARED_FROZEN_ABSENCE',current_exists_not_completion=p.exists());checks.append(row);continue
   # Explicit exact passive receipt references are immutable engineering carrier
   # artifacts; never follow the receipt to DB/history/rollout evidence bodies.
   if under(p,R/'helpers/passive-receipts/receipts') and h and not blocked_format(p):
    explicit.add(p);select(p,'exact immutable passive receipt named by selected completed freeze',True)
   if allowed(p):select(p,'exact selected source/freeze reference from '+str(owner.relative_to(R)))
   found=selected.get(str(p)) or raw.get(str(p))
   if found:
    row.update(observed_sha256=found['sha256'],observed_bytes=found['bytes']);row['status']='MATCH' if (not h or h==found['sha256']) and (n is None or n==found['bytes']) else 'MISMATCH_ORIGINAL_BYTES_PRESERVED'
    if str(p) in raw and meta:raw[str(p)]['source_locators'].append({'record':str(owner),'pointer':pointer,**meta})
   else:
    ref=exact_prior(str(p),h,n) if h else None
    if ref:
     historical.append({'original_path':str(p),'original_sha256':h,'original_bytes':ref['bytes'],'target':ref,'reason':'exact frozen dependency or historical identity; no runtime science re-audit'})
     row.update(status='EXACT_PRIOR_PINNED_REFERENCE',target_path=ref['target'],reference_commit=COMMIT)
    else:row['status']='OUTSIDE_SELECTED_FROZEN_SCOPE_NOT_READ' if not allowed(p) else 'ABSENT_OR_DEFERRED_AT_CUTOFF'
   if row['status']=='MISMATCH_ORIGINAL_BYTES_PRESERVED' and h:
    ref=exact_prior(str(p),h,n)
    if ref:
     historical.append({'original_path':str(p),'original_sha256':h,'original_bytes':ref['bytes'],'target':ref,'reason':'exact historical expected hash; current original bytes differ and remain unchanged'})
     row['historical_expected_target']=ref['target'];row['reference_commit']=COMMIT
   checks.append(row)
# Raw records preserve locator metadata from all admitted indexes/checks. Body
# reads are solely hashing, never research; no body enters the public payload.
for item in selected.values():
 if not item['path'].endswith('.json'):continue
 for p,h,n,exists,pointer,meta in identities(parse(item['data']),Path(item['path'])):
  if str(p) in raw and meta:
   row={'record':item['path'],'pointer':pointer,**meta}
   if row not in raw[str(p)]['source_locators']:raw[str(p)]['source_locators'].append(row)
# Exact byte aliases are identities, not source provenance or reconstruction.
# Preserve original locators; expose same-byte authored metadata references only
# when the exact SHA matches, without claiming a capture's unknown URL/version.
known_locators=collections.defaultdict(list)
for x in raw.values():
 for loc in x['source_locators']:
  known_locators[x['sha256']].append({'raw_identity_path':x['path'],'sha256':x['sha256'],'source_locator_record':loc})
for x in raw.values():
 if not x['source_locators'] and known_locators.get(x['sha256']):
  x['same_bytes_locator_references']=known_locators[x['sha256']]
  x['locator_limit']='Original capture has no extracted direct locator; references above describe another explicitly authored capture with the exact same SHA, not proof of this capture provenance. A hash is not reconstruction.'
 elif not x['source_locators']:
  x['locator_limit']='No mechanically extracted direct locator in this finite tranche; consult the exact original authored source maps/indexes. Replay provenance/version may remain incomplete; no source URL invented.'
# Missing historical GLM P27 witness remains an explicit absence only.
omissions.append({'path':'historical GLM P27 witness','status':'ORIGINAL_MISSING_WITNESS_REMAINS_ABSENT','no_witness_invented':True})

entries=[];by_identity=set();new_count=0;copy_bytes=0
for item in sorted(selected.values(),key=lambda x:x['path']):
 op=item['path'];h=item['sha256'];n=item['bytes'];normal=BASE+'/'+str(Path(op).relative_to(R));ref=exact_prior(op,h,n)
 if ref:target=ref['target'];disp='EXISTING_EXACT_COMMIT_REFERENCE'
 else:
  target=normal
  # Any prior logical path/version, or existing target, requires NEW frozen path.
  if prior_by_path.get(op) or (W/target).exists():
   target=BASE+'/batch007-frozen-originals/'+str(Path(op).relative_to(R));collisions.append({'original_path':op,'existing_logical_path':normal,'new_target':target,'historical_bytes_not_overwritten':True})
  assert not (W/target).exists(),('existing-target collision',target)
  write(S/target,item['data']);disp='NEW_EXACT_COPY';new_count+=1;copy_bytes+=n
 entries.append({'original_path':op,'original_sha256':h,'original_bytes':n,'target_path':target,'target_sha256':h,'target_bytes':n,'source_kind':item['kind'],'why':item['why'],'disposition':disp,'reference_commit':COMMIT if ref else None,'prior_manifest':ref['manifest'] if ref else None,'original_symlink_target':item.get('original_symlink_target'),'selection_mtime_ns':item['mtime_ns'],'selection_mtime_utc':dt.datetime.fromtimestamp(item['mtime_ns']/1e9,dt.timezone.utc).isoformat(),'json_parse_status':next((x['status'] for x in parse_limits if x['original_path']==op),'PARSEABLE' if op.endswith('.json') else 'NOT_JSON'),'protocol_only':op in protocol_paths})
 by_identity.add((op,h))
for e in historical:
 key=(e['original_path'],e['original_sha256'])
 if key in by_identity:continue
 ref=e['target'];entries.append({'original_path':key[0],'original_sha256':key[1],'original_bytes':e['original_bytes'],'target_path':ref['target'],'target_sha256':key[1],'target_bytes':e['original_bytes'],'source_kind':'HISTORICAL_EXACT_IDENTITY_REFERENCE','why':e['reason'],'disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':COMMIT,'prior_manifest':ref['manifest'],'json_parse_status':'PRIOR_ORIGINAL_PARSE_STATUS_UNCHANGED'});by_identity.add(key)
def entry(s,h=None):return next((e for e in entries if e['original_path']==str(R/s) and (h is None or e['original_sha256']==h)),None)
def link(s,label=None,h=None):
 e=entry(s,h);return f'[{label or s}]({e["target_path"][len(BASE)+1:]})' if e else f'{label or s} — absent/excluded; see verification'
def generate(name,obj):
 b=obj.encode() if isinstance(obj,str) else encoded(obj);src=H/'generated'/name;write(src,b);target=BASE+'/'+name
 assert not (W/target).exists(),('existing admin target',target)
 write(S/target,b);entries.append({'original_path':str(src),'original_sha256':sha(b),'original_bytes':len(b),'target_path':target,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'CURATOR_ADMINISTRATIVE_NO_GRADING','why':'new append-only mechanical publication/limitations metadata, not original science','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'PARSEABLE' if name.endswith('.json') else 'NOT_JSON'})

# Exact previous publication admin identities are already root-verified in the
# retained cleanup receipt. No previous candidate science is re-audited.
inherited_limits={}
cleanup=json.loads(selected[str(R/'state/cleanup-publication-batch006-staging-v1.json')]['data'])
for name in ['BATCH006_MANIFEST.json','BATCH006_VERIFICATION.json','BATCH006_ABSENCES_AND_DEFERRALS.json','BATCH006_RAW_SOURCE_IDENTITIES.json','BATCH006_COMPARISON_TRANCHE.json','INDEX_BATCH006.md']:
 tp=BASE+'/'+name;q=W/tp;prior_obj=next(o for o in cleanup['verified_objects'] if o['relative_path']==tp)
 b=q.read_bytes();assert sha(b)==prior_obj['sha256'] and len(b)==prior_obj['bytes']
 entries.append({'original_path':str(q),'original_sha256':sha(b),'original_bytes':len(b),'target_path':tp,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'PRIOR_ROOT_VERIFIED_PUBLICATION_ADMIN_IDENTITY','why':'exact prior publication administrative limitation/identity records; no prior scientific re-audit','disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':COMMIT,'json_parse_status':'PARSEABLE' if name.endswith('.json') else 'NOT_JSON'})
 if name=='BATCH006_VERIFICATION.json':
  j=json.loads(b);inherited_limits={'source_target':tp,'source_sha256':sha(b),'source_bytes':len(b),'reference_commit':COMMIT,'original_json_parse_limits':j.get('original_json_parse_limits',[]),'stale_expected_hash_mismatches':[c for c in j.get('freeze_and_input_identity_checks',[]) if c.get('status')=='MISMATCH_ORIGINAL_BYTES_PRESERVED'],'no_original_files_fixed':True}

# Required mechanical contract checks are assertions of exact authored records,
# not new candidate grading or new denominators.
lock_hash='9ba0418ac83ed7355e73a6d49f0ab5bf0cb1888b34bcca6e1fdc61b75c541d1a'
lock=entry('locks/confirmation-selection.json',lock_hash);assert lock and 'batch004-frozen-originals/locks/confirmation-selection.json' in lock['target_path']
prebound=parse(selected[str(R/'helpers/confirmation-supervisor/all-inputs-and-carriers-freeze.json')]['data'])['all_case_files']
assert len(prebound)==24
case_checks=[]
for op,i in prebound.items():
 e=next((e for e in entries if e['original_path']==op and e['original_sha256']==i['sha256']),None)
 assert e and e['target_bytes']==i['bytes'],op
 case_checks.append({'original_path':op,'original_sha256':i['sha256'],'original_bytes':i['bytes'],'target_path':e['target_path'],'target_sha256':e['target_sha256'],'target_bytes':e['target_bytes'],'status':'MATCH'})
quiet=parse(selected[str(R/confirm_w)]['data']);assert quiet['task_count']==28 and quiet['no_pending_children'] is True
assert all(t['status'] in ['completed','interrupted','failed','cancelled'] and t.get('hasPendingChildRuns') is False for t in quiet['tasks'])
c01=parse(selected[str(R/'reviews/confirmation/C-01/COMPARISON.json')]['data']);assert c01['arms']['control']['original_scientific_grade'] is None and c01['arms']['control']['material_defect_count']==0
usage=json.loads(selected[str(R/'state/recorded-usage-root-validation-v1.json')]['data']);observation=selected[str(R/'helpers/recorded-usage/observation-20261007T211653Z-aa6ea07490bb4a08.json')]
assert usage['observation_sha256']==observation['sha256'] and usage['reader_sha256']==selected[str(R/'helpers/recorded-usage/reader.py')]['sha256']
contract={'selected_confirmation_lock':lock,'all_24_prebound_case_files':case_checks,'confirmation_task_count':28,'all_tasks_terminal_quiet':True,'C01_original_control_scientific_grade':None,'C01_original_material_defect_count':0,'C01_new_normalized_material_defect_count':None,'normalization_reason':'unknown/unassessed, never error-free','usage_observation_root_binding_matches':True,'no_rollout_bytes_read_or_copied':True}

generate('BATCH007_RAW_SOURCE_IDENTITIES.json',{'schema':'ER10-batch007-raw-source-identities-v1','cutoff':CUTOFF,'full_source_bodies_published':False,'usage_rollout_bytes_published':False,'private_archive_verified':False,'reconstructibility':'SHA-256 is identity, not reconstruction. Exact authored source indexes/maps/checks supply URL/version/commit/locator references. Upstream availability, missing release/capture metadata and license conditions can limit exact replay. Private retention is UNKNOWN_UNVERIFIED. No source retrieval or new source assessment occurred.','direct_locator_identity_count':sum(bool(x['source_locators']) for x in raw.values()),'same_byte_locator_reference_count':sum(bool(x.get('same_bytes_locator_references')) for x in raw.values()),'identities':sorted(raw.values(),key=lambda x:x['path'])})
generate('BATCH007_ABSENCES_AND_DEFERRALS.json',{'schema':'ER10-batch007-absences-v1','cutoff':CUTOFF,'campaign_complete':False,'omissions':omissions,'explicit_remainders':['C01 control required scientific review artifacts absent; original scientific grade null/UNASSESSED and comparative HOLD; original zero material_defect_count is not an error-free finding','C02 treatment O1 discovery coverage remainder unchanged; not BOTH-arm full declared-source pair','C03 treatment native BLOCKED; diagnostic treatment FAIL/control HOLD with chronology/material defects; comparative HOLD','METHOD02 v2 control full final UNASSESSED; immutable paired HOLD distinct from separately authorized treatment-only Source6 FAIL','M10, METHOD04 LASTv2, FAST03, M16 and later GLM queues live/unassessed at cutoff: PREdispatch protocols only, no live scientific outputs/findings read or published','Historical old GLM P27 witness absent; no witness invented','Excluded raw source/corpus/PDF/API/patch bodies, full transcripts/logs/DBs/profiles/rollouts/nested repos remain excluded; no private archive verification claimed','Original JSON whitespace/trailing-content limitations and stale expected hash mismatches retained without scientific-file repairs','All after-cutoff writes and unstable originals excluded; exact prior identities can remain referenced through the supplied pinned previous commit']})
generate('BATCH007_VERIFICATION.json',{'schema':'ER10-batch007-mechanical-verification-v1','cutoff':CUTOFF,'reference_commit':COMMIT,'reference_branch':'t3/research/er10-research-efficiency-campaign','reference_verification':'Root independently verified GitHub commit pin provided in task/config. Curator verifies local prior manifest targets by original path + exact SHA + bytes. No curator Git commands/network verification or new remote claims. Root must verify staged publication after committing.','prior_manifest_checks':prior_checks,'scope_admission_gates':gates,'freeze_identity_check_counts':dict(collections.Counter(x['status'] for x in checks)),'freeze_and_input_identity_checks':checks,'historical_exact_identity_resolutions':historical,'original_json_parse_limits':parse_limits,'inherited_prior_publication_limitations':inherited_limits,'append_only_collision_paths':collisions,'required_contract_checks':contract,'scientific_grades_changed':False,'source_operations_counted_from_filenames':False,'native_goal_cumulative_counters_summed':False,'maps_certified_as_filesystem_firewall':False,'own_goal_or_workers_or_watchers':False})
rows=[
 ('Cohort1 six-case final','final CLOSED projection','Six scientific paired assessments including diagnostic/repaired reviews; ZERO qualified method comparisons','Seven pair-version dispositions retain historical M02A v2 missing-final diagnostic; no 24-case/campaign completion claim','helpers/targeted-supervisor/COMPARISONS.json'),
 ('D-M02-A','last v3 complete Source6 review','Control QUALIFIED_SUPPORTED; treatment NOT_FULLY_CORRECT_AS_WRITTEN','Six obligations and 13 claim groups per label are audit partitions; chronology/timing/provenance limits separate; original v2 diagnostic unchanged','reviews/targeted/D-M02-A/source-review-v3/REVIEW.json'),
 ('C-01','original v1 mechanical disposition','Control NULL/UNASSESSED; treatment FAIL; comparative HOLD','Missing control review; original control material_defect_count 0 preserved but normalized unknown/null','reviews/confirmation/C-01/COMPARISON.json'),
 ('C-02','original v1 delivered paired assessment','Control FAIL / treatment HOLD','Treatment O1 remainder retained; delivered pair assessment distinct from both-arm full source coverage','reviews/confirmation/C-02/COMPARISON.json'),
 ('C-03','original v1 diagnostic paired assessment','Control HOLD / treatment FAIL; comparative HOLD','Control chronology/material defects retained; treatment native BLOCKED and root diagnostic exception distinct from science','reviews/confirmation/C-03/COMPARISON.json'),
 ('C-04','original v1 BOTH-arm full declared Source pair','Control FAIL / treatment PASS_WITH_LIMITATIONS','Near-equal descriptive times; one both-arm full-source pair; no qualified confirmation win','reviews/confirmation/C-04/COMPARISON.json'),
 ('D-M08-B','matched v3 complete pair/full own reviews','Control FullSourceFAIL / treatment FullSourcePASS','Full scope/scientific assessment distinct from native/time/method/provenance eligibility; expanded 40-minute ceilings are new benchmark','reviews/targeted-cohort3/D-M08-B-v3/PAIR_COMPARISON.json'),
 ('D-M15-A','matched v3 complete pair/full own reviews','FAIL / FAIL','All four candidate stages and full own reviews retained; two failure labels do not establish equal quality or ranking; expanded 60/common100 budgets separate','helpers/targeted-cohort4/D-M15-A/comparison-v3.json'),
 ('I-METHOD-02','v2 separately authorized treatment-only diagnostic','Treatment full Source6 FAIL; immutable paired UNASSESSED/HOLD','Standalone grade never replaces paired disposition or control missing-full-final status','reviews/integrated-methods/I-METHOD-02/treatment/standalone-diagnostic-v2/frozen-standalone-review.json'),
 ('I-FAST-02','original v1 complete paired reviews','FAIL / FAIL','Exact lock/native/carriers/cold timing retained; no equal-quality/ranking inference or quality-preserving speed win','helpers/integrated-execution/fast02-pair-disposition-v1.json')]
generate('BATCH007_COMPARISON_TRANCHE.json',{'schema':'ER10-batch007-finite-tranche-v1','cutoff':CUTOFF,'campaign_complete':False,'scientific_regrading':False,'rows':[{'case':a,'exact_version':b,'original_disposition_only':c,'limits':d,'original_record':str(R/e),'published_record':entry(e)['target_path'] if entry(e) else None} for a,b,c,d,e in rows],'confirmation_original_counts':{'mechanical_dispositions':4,'delivered_paired_assessments':3,'both_arm_full_declared_source_pairs':1,'qualified_wins':0},'count_rule':'Counts explicitly stated by final closure records, not a newly inferred denominator. Forty immutable slots/eighty arms are protocol counts, not completion counts. Attempts/reviews/helpers do not create logical comparisons.'})
notes='''The fixed cutoff is a publication boundary while later queues continue. This finite tranche preserves exact authored outputs, task/config/input/source maps, full independent reviews, declared coverage/remainder, source checks, native/timing/failure/economics records and reproducible generic helpers for the explicit closed scopes. It adds no candidate answer, source research, scientific grading, retry, feedback, or benchmark denominator.

Six source axes and full obligations, assessment coverage and remainder, source correctness, requirement fulfillment and chronology, actual native activation/completion, T3 task quiet, time/delivery bounds, method/provenance eligibility, source operations and economics remain distinct. A completed assessment need not fulfill its requirements. FAIL/FAIL labels and differing defect counts establish neither equal quality nor ranking. Prospective expanded 30/40/60/common100-minute budgets are new ceilings, not success against old 15/45-minute budgets. Advisory maps are not a filesystem firewall.

Confirmation preserves FOUR dispositions, THREE delivered paired assessments, ONE BOTH-arm full declared Source pair (C04), and ZERO qualified wins. C01 control is NULL/UNASSESSED/HOLD with missing review; its authored material_defect_count 0 remains byte-for-byte unchanged, and new normalization uses null/unknown. C02 remains control FAIL/treatment HOLD with original treatment O1 discovery remainder. C03 control HOLD chronology/material defects and treatment FAIL plus actual native BLOCKED remain distinct, with original comparative HOLD. C04 original treatment PASS_WITH_LIMITATIONS/control FAIL accompanies near-equal descriptive failure-inclusive service times (control 1980.880571 s, treatment 1951.822083 s) and occupied stage time (1934.303 s versus 1930.386 s); these are not a qualified speed win. The exact 28-task terminal/quiet audit is retained.

The exact selected confirmation lock is 9ba0418ac83ed7355e73a6d49f0ab5bf0cb1888b34bcca6e1fdc61b75c541d1a at batch004-frozen-originals/locks/confirmation-selection.json. The older 44ba unversioned lock remains historical/unselected. ALL 24 prebound case files are verified by original path/SHA/bytes and retain their original bindings.

Recorded usage is a NEW separate supplement: final cumulative raw Codex token_count totals per distinct authorized native session, from a closed reader and immutable completed observation with root arithmetic/binding validation and C02 actual SDK usage qualification. Observation groups can include candidate AND review roles; role attribution is retained, and no group is labeled candidate-only. Old usage nulls and scientific grades remain unchanged. Native Goal cumulative counters remain unsummed. Billing, account remaining quota and complete-arm/campaign costs remain unknown. Cold arm/service, occupied work, shared/helper preparation, queue, handoff and review time are separately observable where original records expose them. Filenames and capture byte counts are not source-operation counts. No rollout bytes are published or opened by this curator.

M10, METHOD04 last v2, FAST03, M16 and all later GLM queues remain live/unassessed at the cutoff. Only selected predispatch protocols are admitted; candidate answers, review findings, native outputs and terminal receipts from those live scopes were not opened. Generic helper code does not establish its execution. Other completed earlier science is referenced by exact prior manifest identity, without a broad re-audit.

Raw full public-source/corpus/PDF/API/patch bodies, full model transcripts, logs, databases/profiles, secrets, nested repositories and bulky captures are excluded from this new payload. Exact hashes, bytes and source locators/URL/version/commit metadata remain in the raw-identity and authored source-map records. Hashes cannot reconstruct bytes; lawful replay requires the original publicly available upstream version and its licensing conditions. Mutable sources, incomplete version/capture metadata, removed URLs and unavailable runtimes may prevent exact replay. Private archive retention is UNKNOWN/unverified; no archive is claimed verified. The old GLM P27 witness remains absent.

Original whitespace and nonstandard JSON trailing content are retained exactly. Prefix JSON may be used only to extract mechanical locators, with strict parse limitations disclosed in verification; no original scientific file is repaired. Stale expected hashes are disclosed with exact historical prior targets where available, never silently replaced by a new current hash. Existing published targets and grades are neither overwritten nor removed.
'''
lines=['# ER10 publication BATCH007\n',f'\nFixed cutoff `{CUTOFF}`; supplied independently verified prior GitHub commit `{COMMIT}` on `t3/research/er10-research-efficiency-campaign`. Campaign incomplete.\n\n',notes,'\n| Scope | Exact version | Original disposition | Limits | Exact evidence |\n|---|---|---|---|---|\n']
for a,b,c,d,e in rows:lines.append(f'| {a} | {b} | {c} | {d} | {link(e,"original record")} |\n')
lines+=['\nClosed confirmation: '+link('reviews/confirmation/REPORT.md','original report')+', '+link('reviews/confirmation/COMPARISONS.json','four original dispositions')+', '+link(confirm_w,'28-task quiet audit')+'. Exact '+link('locks/confirmation-selection.json','selected 9ba lock',lock_hash)+' and '+link('helpers/confirmation-supervisor/all-inputs-and-carriers-freeze.json','24-case-file freeze')+'.\n','\nImmutable separate telemetry: '+link('helpers/recorded-usage/reader.py','reader')+', '+link('helpers/recorded-usage/observation-20261007T211653Z-aa6ea07490bb4a08.json','completed observation')+', '+link('state/recorded-usage-root-validation-v1.json','root validation')+', '+link('state/C-02-actual-Codex-session-usage-observation-v1.json','C02 actual SDK supplement')+'. Root '+link('state/root-resume-binding-and-confirmation-normalization-v1.json','binding/normalization')+' and '+link('state/cleanup-publication-batch006-staging-v1.json','verified B6 staging cleanup receipt')+'.\n','\nReproduction: checkout the pinned previous commit and overlay only NEW staged paths listed in [BATCH007 manifest](BATCH007_MANIFEST.json), or use root’s later published BATCH007 commit. Verify all payload/reference hashes and byte counts using [validator](helpers/publication-batch007/validate.py). Exact historical references bind the supplied previous commit and never choose by filename/latest/best grade. Changed logical paths reside under `batch007-frozen-originals/<original-relative>`; untouched prior targets remain references. Manifest self-identity is in the external curation/validation receipts to avoid an impossible self-hash.\n','\nResolve an original using '+link('helpers/final-report/resolve_public_evidence.py','exact path + required SHA resolver')+'. Follow its exact selected task and input map before running an authored fixture; retrieve excluded upstream bodies lawfully via the source URL/version/commit/locator. Raw bodies are not reconstructed by the resolver. Candidate/model/native-runtime execution and past timing cannot be recreated from receipts alone. No scientific fixture was re-executed for publication. The recorded-usage reader requires authorized quiet-session metadata and access to excluded local rollout files; the public observation is verifiable arithmetic evidence, not replayable raw rollout data.\n','\n[Exact verification/parse limits](BATCH007_VERIFICATION.json), [absences and deferrals](BATCH007_ABSENCES_AND_DEFERRALS.json), [raw identities and reconstruction limits](BATCH007_RAW_SOURCE_IDENTITIES.json), [finite comparison tranche](BATCH007_COMPARISON_TRANCHE.json). Root owns commit/push/GitHub verification and cleanup after retention; this curator only stages new paths.\n']
generate('INDEX_BATCH007.md',''.join(lines))
# The one publication validator is created locally before inclusion.
validator=(H/'validate.py').read_bytes();write(S/(BASE+'/helpers/publication-batch007/validate.py'),validator)
entries.append({'original_path':str(H/'validate.py'),'original_sha256':sha(validator),'original_bytes':len(validator),'target_path':BASE+'/helpers/publication-batch007/validate.py','target_sha256':sha(validator),'target_bytes':len(validator),'source_kind':'CURATOR_RUNNABLE_MECHANICAL_VALIDATOR','why':'exact publication identity validation only, no science/grading','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'NOT_JSON'})
manifest={'schema':'ER10-publication-batch007-manifest-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'writing_reserve_seconds':CFG['writing_reserve_seconds'],'verified_reference_commit':COMMIT,'repository_url':'https://github.com/sittingmongoose/Puppet-Master','branch':'t3/research/er10-research-efficiency-campaign','campaign_complete':False,'scientific_regrading':False,'entries':entries,'self_hash':'EXCLUDED_SELF_HASH; manifest path/SHA/bytes externally bound by curation-report.json and validation-results.json'}
dump(P/'BATCH007_MANIFEST.json',manifest)
payload=[p for p in S.rglob('*') if p.is_file()];total=sum(p.stat().st_size for p in payload);assert total<=CFG['staging_limit_bytes']
assert len({e['target_path'] for e in entries})<=len(entries)
finished=dt.datetime.now(dt.timezone.utc).isoformat();extent='COMPLETE_SELECTED_FINITE_TRANCHE' if dt.datetime.now(dt.timezone.utc).timestamp()<=DEADLINE else 'SELECTED_TRANCHE_FINISHED_AFTER_DEADLINE_LABELLED'
report={'schema':'ER10-publication-batch007-curation-report-v1','status':'STAGED_FINITE_CUTOFF_TRANCHE_NO_GIT_WRITES','extent':extent,'cutoff':CUTOFF,'deadline':CFG['deadline'],'finished_at':finished,'writing_reserve_seconds':CFG['writing_reserve_seconds'],'staging_root':str(S),'report_root':str(P),'manifest_path':str(P/'BATCH007_MANIFEST.json'),'manifest_sha256':sha((P/'BATCH007_MANIFEST.json').read_bytes()),'manifest_bytes':(P/'BATCH007_MANIFEST.json').stat().st_size,'index_path':str(P/'INDEX_BATCH007.md'),'index_sha256':sha((P/'INDEX_BATCH007.md').read_bytes()),'raw_source_identities_path':str(P/'BATCH007_RAW_SOURCE_IDENTITIES.json'),'raw_source_identities_sha256':sha((P/'BATCH007_RAW_SOURCE_IDENTITIES.json').read_bytes()),'verification_path':str(P/'BATCH007_VERIFICATION.json'),'verification_sha256':sha((P/'BATCH007_VERIFICATION.json').read_bytes()),'entry_count':len(entries),'entry_dispositions':dict(collections.Counter(e['disposition'] for e in entries)),'new_exact_copies':new_count,'new_exact_copy_bytes':copy_bytes,'staged_files':len(payload),'staged_bytes':total,'raw_source_identity_count':len(raw),'raw_direct_locator_count':sum(bool(x['source_locators']) for x in raw.values()),'raw_same_byte_locator_reference_count':sum(bool(x.get('same_bytes_locator_references')) for x in raw.values()),'freeze_identity_check_counts':dict(collections.Counter(x['status'] for x in checks)),'collision_count':len(collisions),'parse_limit_count':len(parse_limits),'inherited_parse_limit_count':len(inherited_limits.get('original_json_parse_limits',[])),'inherited_mismatch_count':len(inherited_limits.get('stale_expected_hash_mismatches',[])),'all_24_prebound_case_files_verified':True,'selected_9ba_lock_verified':True,'confirmation_28_tasks_terminal_quiet':True,'campaign_complete':False,'git_commands_or_writes':False,'repo_writes':False,'science_regraded':False,'raw_usage_rollout_bytes_copied':False,'validator_command':f'python3 {H}/validate.py {P}/BATCH007_MANIFEST.json --repo {W} --staging {S}'}
dump(H/'curation-report.json',report);print(json.dumps(report,indent=2))
