#!/usr/bin/env python3
"""Finite ER10 BATCH008 exact-byte publication curation. No Git, source research, or grading.

Only explicit closed scopes and exact prior identities are read. Writes are confined
here; raw source bodies and rollout bytes never enter staging.
"""
import collections, datetime as dt, hashlib, json, re
from pathlib import Path
R=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
W=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
H=R/'helpers/publication-batch008'; S=H/'staging'; BASE='reports/external-research-v10-20261007'; P=S/BASE
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
  raw[str(p)]={**item,'github_body_published_in_batch008':False,'archive_verified':False,'private_retention':'UNKNOWN_UNVERIFIED','source_locators':[{'origin':'excluded upstream metadata identities only',**meta}] if meta else []};return
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


# REUSED prior exact identity functions
# Prior immutable manifest identities, verified against exact local targets.
# No Git commands or network verification occur. Commit pin is independently
# verified by root and supplied in task/config; no new remote claim is made.
prior=collections.defaultdict(list);prior_by_path=collections.defaultdict(list);verified={}
for i in range(1,8):
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

# BATCH008 selection
# Exclude all raw upstream text even when a previous generic curator admitted a
# bounded excerpt: only specifically authorized compact authored fixtures survive.
old_kind=kind
def kind(p,b):
 k=old_kind(p,b)
 if p.name=='coverage.json':
  j=parse(b)
  if isinstance(j,dict) and any(x in j for x in ['review_identity','six_axes','category_counts','all_remaining_scope_unassessed','full_source_scope']):return 'AUTHORED_FULL_SOURCE_COVERAGE_CHECK'
 if k=='EXISTING_AUTHORED_SMALL_BOUNDED_WITNESS':return 'RAW_BODY_EXCLUDED'
 return k
# Cutoff gates apply to every original, including metadata. No recursive live
# M16 or held-successor scope is admitted.
for case in ['D-M08-A','D-M08-B','D-M10-A']:
 witness=f'jobs/{case}/V3_PAIR_FREEZE.json'
 closed_scope(f'jobs/{case}',witness,'explicit CLOSED Cohort3 final v3 and prior failed candidate stages; no new source grading')
 closed_scope(f'reviews/targeted-cohort3/{case}-v3',f'reviews/targeted-cohort3/{case}-v3/J1/freeze_disposition.json','complete exact independent Source reviews and pair comparisons')
for q in sorted((R/'reviews/targeted-cohort3/D-M08-B-v2').rglob('*')):
 if q.is_file():add(str(q.relative_to(R)),'prior unsuccessful review protocols remain original')
add('reviews/targeted-cohort3/COMPARISONS.json','complete Cohort3 aggregate including prior failures')
for n in ['config.json','dispatch.json','freeze_v3.py','prepare_reviews_v3.py','setup.py','stage_record.py','task.txt']:
 add('helpers/targeted-cohort3/'+n,'actual selected task/config/generic checks and freeze helpers')
IW='helpers/integrated-execution/FINAL_TRACK_DISPOSITION.json'
closed_scope('helpers/integrated-execution',IW,'all method and FAST queues CLOSED; original aggregate/economics/generic helpers and 79-task quiet audit')
# Catalog captures are bulky repetitive administrative snapshots, not scientific outputs.
for n in ['capabilities-v1.json']:
 selected.pop(str(R/'helpers/integrated-execution'/n),None)
 omissions.append({'path':str(R/'helpers/integrated-execution'/n),'status':'BULKY_DUPLICATE_CATALOG_CAPTURE_EXCLUDED'})
for case in [f'I-METHOD-{i:02d}' for i in range(1,7)]+[f'I-FAST-{i:02d}' for i in range(1,4)]:
 closed_scope('jobs/'+case,IW,'integrated CLOSED original/retest candidate bytes, all semantic/views/preservation/checks/metrics/failures')
 closed_scope('reviews/integrated-methods/'+case,IW,'integrated CLOSED complete independent Source reviews; standalone diagnostics separate from paired HOLD')
for case in ['D-M08-A','D-M08-B','D-M10-A','I-METHOD-04','I-FAST-03']:
 closed_scope('cases/'+case,IW if case.startswith('I-') else 'jobs/'+case+'/V3_PAIR_FREEZE.json','exact authored prebound case tasks/fixtures/maps; raw full sources excluded')
# Read only named predispatch protocols for scopes explicitly unclosed/held at cutoff.
for case in ['D-M16-A','D-M07-A','D-M07-B','D-M09-A','D-M06-A','D-M06-B']:
 for q in sorted((R/'jobs'/case).glob('*/*')):
  if q.is_dir():protocol_scope(q,'M16 final join/review NOT CLOSED or successor unstarted-held at cutoff; no findings/output/native terminal files opened')
 for q in sorted((R/'cases'/case).glob('*')):
  if q.is_file() and q.name in ['BRIEF.md','PLAN.md','case-card.json','INPUT_MAP.json','PREPARED.json','READY.json']:
   protocol_paths.add(str(q));add(str(q.relative_to(R)),'predispatch case protocol only; no completion inferred')
# Current binding, terminal acknowledgements, pre-cutoff GitHub/verified actual
# B2--7 payload cleanup receipts. No source-cache cleanup or archive claimed.
for rel in ['state/integrated-final-task-terminal-v1.json','state/normalizer-task-terminal-v1.json','state/source-retention-plan-task-terminal-v1.json','state/root-resume-binding-and-confirmation-normalization-v1.json','state/current-instructions-update-20261007-2119.json','state/logical-slot-index-v1.json','state/final-finite-prospective-admissions-v3.json','state/final-finite-t0-interpretation-before-starts-v1.json','state/m16-native-active-root-nominations-v1.json','state/m16-topic1-treatment-topic2-control-native-active-root-nominations-v1.json','state/m16-topic2-both-native-active-root-nominations-v1.json','state/m16-treatment-final-join-native-root-nomination-v1.json','state/m16-treatment-topic2-control-join-native-active-root-nominations-v1.json','state/publication-batch007.json','state/publication-batch007-local-commit-v1.json','state/publication-batch007-push-v1.json','state/publication-batch007-root-precommit-verification-v1.json','state/publication-batch007-task-terminal-v1.json','state/cleanup-staging002-005-executed-v1.json','state/cleanup-publication-batch006-staging-v1.json','state/cleanup-publication-batch007-staging-v1.json','state/I-METHOD-04-prospective-v2-root-binding.json','state/I-METHOD-02-v2-treatment-only-diagnostic-gate-exception-v1.json','state/I-FAST-01-treatment-only-diagnostic-gate-exception-v1.json','state/recorded-usage-root-validation-v1.json','state/C-02-actual-Codex-session-usage-observation-v1.json','packet/ER10_T3_EXECUTE_HANDOFF.md','helpers/final-report/count-and-claim-contract-v1.json','helpers/final-report/resolve_public_evidence.py','locks/speed-budget-selection-v1.json','locks/confirmation-selection.json','helpers/publication-batch007/curate.py','helpers/publication-batch007/validate.py']:
 add(rel,'explicit pre-cutoff root lifecycle/binding/actual publication cleanup/protocol or exact generic reproduction helper')
# Exact prior confirmation science is immutable. Resolve authored counts/NULL
# only in the NEW publication layer; no new grades or source checks.
for rel in ['reviews/confirmation/COMPARISONS.json','reviews/confirmation/FINAL_QUIET.json','reviews/confirmation/REPORT.md','helpers/confirmation-supervisor/all-inputs-and-carriers-freeze.json']+[f'reviews/confirmation/C-{i:02d}/COMPARISON.json' for i in range(1,5)]:
 add(rel,'unchanged exact confirmation disposition/coverage/quiet history; no regrade')
# Finite normalizer: preserve working note, essential code/map, actual immutable
# input identities, validation, and all 139 byte-exact input bindings. A compact
# replay map replaces duplicate working-input copies whenever a prior exact
# original identity resolves. The giant deterministic output is regenerated.
N=R/'helpers/final-report/normalizer-v1'
for q in sorted(N.iterdir()):
 if q.is_file() and q.name!='WORKING-normalized.json':add(str(q.relative_to(R)),'completed ordinary count-normalizer working snapshot/code/map/actual input identities/validation')
normalizer_inputs=[]
for q in sorted((N/'working-input').rglob('*')):
 if not q.is_file():continue
 rel=str(q.relative_to(N)); saved=stable(q)
 if not saved:
  omissions.append({'path':str(q),'status':'NORMALIZER_INPUT_ABSENT_AFTER_CUTOFF_OR_UNSTABLE'});continue
 b,st=saved;h=sha(b);k=kind(q,b)
 # Names under this immutable input snapshot denote authored metadata, not live
 # candidate/reviewer files. Nevertheless M16 answer/review paths stay prohibited.
 assert not re.search(r'jobs/D-M16-A|reviews/targeted-cohort4/D-M16-A',rel),rel
 underlying=str(R/q.relative_to(N/'working-input'));ref=exact_prior(underlying,h,len(b))
 if ref:
  normalizer_inputs.append({'snapshot_relative_path':rel,'snapshot_original_path':str(q),'original_path':underlying,'sha256':h,'bytes':len(b),'target_path':ref['target'],'reference_commit':COMMIT,'prior_manifest':ref['manifest']})
 else:
  explicit.add(q);select(q,'unique immutable normalizer input snapshot, exact bytes required for offline replay',True)
  normalizer_inputs.append({'snapshot_relative_path':rel,'snapshot_original_path':str(q),'original_path':underlying,'sha256':h,'bytes':len(b),'target_path':None,'reference_commit':None})
normalizer_projection=stable(N/'WORKING-normalized.json');assert normalizer_projection
# Retention plan: keep classification/code/identity/limits, replace snapshot's
# repeated authored documents with exact prior-public references. The held
# witness fragments are never copied; their ranges/hashes/metadata are retained.
T=R/'helpers/retention-plan-v1'
for q in sorted(T.iterdir()):
 if q.is_file() and q.name not in ['snapshot.json','public-witness-candidates.json']:
  add(str(q.relative_to(R)),'completed source-retention plan-only code/classification/identity/validation; no archive/source cleanup')
retention_snapshot=stable(T/'snapshot.json');assert retention_snapshot
retention_obj=json.loads(retention_snapshot[0]);retention_replay_refs=[]
def projection(value,shape_id,shapes):
 desc=shapes[shape_id]
 if desc is None:return value
 if isinstance(desc,dict):return {k:projection(value[k],v,shapes) for k,v in desc.items()}
 assert len(value)==len(desc)
 return [projection(v,k,shapes) for v,k in zip(value,desc)]
def shape_table(value):
 shapes={};seen={}
 def shape(v):
  if isinstance(v,dict):desc={k:shape(x) for k,x in v.items()}
  elif isinstance(v,list):desc=[shape(x) for x in v]
  else:desc=None
  key=json.dumps(desc,sort_keys=True,separators=(',',':'))
  if key not in seen:
   ident='s'+str(len(seen));seen[key]=ident;shapes[ident]=desc
  return seen[key]
 ident=shape(value);return ident,shapes
def prior_public_ref(tp,h,n,projected=None):
 q=W/tp;b=q.read_bytes();assert sha(b)==h and len(b)==n,('retention-public-identity',tp)
 retention_replay_refs.append({'target_path':tp,'sha256':h,'bytes':n,'reference_commit':COMMIT})
 ref={'target_path':tp,'sha256':h,'bytes':n,'reference_commit':COMMIT}
 if projected is not None and json.loads(b)!=projected:
  ident,shapes=shape_table(projected);assert projection(json.loads(b),ident,shapes)==projected
  ref['projection_shape']=ident;ref['projection_shapes']=shapes
 return {'$er10_exact_public_reference':ref}
# Replace documents only when the actual expected bytes can be bound. All
# observations/metadata/array positions remain unchanged in the compact form.
for group in ['records','frozen_context','raw_manifests','publication_manifests']:
 for item in retention_obj.get(group,[]):
  if not isinstance(item,dict) or 'document' not in item:continue
  info=item.get('read_identity',item.get('identity',{}));tp=item.get('published_path')
  if not tp and str(info.get('path','')).startswith(str(W)+'/'):tp=str(Path(info['path']).relative_to(W))
  h=info.get('sha256');n=info.get('bytes')
  if tp and h and n is not None:item['document']=prior_public_ref(tp,h,n,item['document'])
# Inventory document is independently retained compact original metadata.
invinfo=retention_obj.get('inventory_identity',{})
# Discover schema without guessing; exact document-only replacement is optional.
for key,v in list(retention_obj.items()):
 if key in ['inventory'] and isinstance(v,dict) and invinfo.get('sha256'):
  ref=exact_prior(invinfo['path'],invinfo['sha256'],invinfo['bytes'])
  if ref:retention_obj[key]=prior_public_ref(ref['target'],ref['sha256'],ref['bytes'])
held_saved=stable(T/'public-witness-candidates.json');assert held_saved
held=json.loads(held_saved[0]);withheld=[]
def hide(o,pointer=''):
 if isinstance(o,dict):
  for k,v in list(o.items()):
   if k=='exact_utf8_raw_json_slice':
    withheld.append({'pointer':pointer+'/'+k,'sha256':sha(v.encode()),'utf8_bytes':len(v.encode()),'status':'HOLD_NOT_APPROVED_NOT_PUBLISHED'})
    o[k]={'withheld':'HOLD_PENDING_ROOT_PUBLICATION_PERMISSION_AND_SUFFICIENCY_DECISION'}
   else:hide(v,pointer+'/'+k)
 elif isinstance(o,list):
  for i,v in enumerate(o):hide(v,pointer+'/'+str(i))
hide(held);assert len(withheld)==3
# Mandatory metadata-only identity of the held original; no futurefiles.
omissions.append({'path':str(T/'public-witness-candidates.json'),'sha256':sha(held_saved[0]),'bytes':len(held_saved[0]),'status':'HELD_QUOTE_FRAGMENTS_NOT_PUBLISHED_METADATA_COPY_ONLY','withheld_fields':withheld})

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
   target=BASE+'/batch008-frozen-originals/'+str(Path(op).relative_to(R));collisions.append({'original_path':op,'existing_logical_path':normal,'new_target':target,'historical_bytes_not_overwritten':True})
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

# Add exact replay dependencies to the manifest, each independently verified.
def reference_entry(op,h,n,tp,why,source_kind='EXACT_ADMINISTRATIVE_REPLAY_REFERENCE'):
 key=(op,h)
 if key in by_identity:return
 b=(W/tp).read_bytes();assert sha(b)==h and len(b)==n
 entries.append({'original_path':op,'original_sha256':h,'original_bytes':n,'target_path':tp,'target_sha256':h,'target_bytes':n,'source_kind':source_kind,'why':why,'disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':COMMIT,'json_parse_status':'PRIOR_ORIGINAL_PARSE_STATUS_UNCHANGED'})
 by_identity.add(key)
for item in normalizer_inputs:
 if item['target_path']:
  reference_entry(item['original_path'],item['sha256'],item['bytes'],item['target_path'],'exact immutable normalizer snapshot byte reference, not version guessing')
 else:
  e=entry(str(Path(item['snapshot_original_path']).relative_to(R)))
  assert e,('missing unique normalizer snapshot',item)
  item['target_path']=e['target_path']
for item in retention_replay_refs:
 reference_entry(str(W/item['target_path']),item['sha256'],item['bytes'],item['target_path'],'exact original authored document used in compact retention snapshot')
# Prior publication administrative limitations remain visible and pinned.
inherited_limits={}
for i in range(1,8):
 for suffix in ['MANIFEST','VERIFICATION','ABSENCES_AND_DEFERRALS','RAW_SOURCE_IDENTITIES','COMPARISON_TRANCHE']:
  tp=BASE+f'/BATCH{i:03d}_{suffix}.json';q=W/tp
  if not q.is_file():continue
  b=q.read_bytes();reference_entry(str(q),sha(b),len(b),tp,'immutable prior manifest/limitations/reference identity')
  if i==7 and suffix=='VERIFICATION':
   j=json.loads(b);inherited_limits={'source_target':tp,'source_sha256':sha(b),'source_bytes':len(b),'reference_commit':COMMIT,'original_json_parse_limits':j.get('original_json_parse_limits',[]),'stale_expected_hash_mismatches':[c for c in j.get('freeze_and_input_identity_checks',[]) if c.get('status')=='MISMATCH_ORIGINAL_BYTES_PRESERVED'],'earlier_inherited_limits':j.get('inherited_prior_publication_limitations',{}),'no_original_files_fixed':True}
 tp=BASE+f'/INDEX_BATCH{i:03d}.md';q=W/tp
 if q.is_file():
  b=q.read_bytes();reference_entry(str(q),sha(b),len(b),tp,'immutable earlier tranche index; historical live-scope annotations apply to its own cutoff')
# Compact snapshot is an administrative transform, never a repaired scientific
# original. Its byte-exact expansion is tested below against the held original.
def expand_here(o):
 if isinstance(o,dict):
  if set(o)=={'$er10_exact_public_reference'}:
   ref=o['$er10_exact_public_reference'];b=(W/ref['target_path']).read_bytes();assert sha(b)==ref['sha256'];value=json.loads(b);return projection(value,ref['projection_shape'],ref['projection_shapes']) if 'projection_shape' in ref else value
  return {k:expand_here(v) for k,v in o.items()}
 if isinstance(o,list):return [expand_here(v) for v in o]
 return o
reconstructed=(json.dumps(expand_here(retention_obj),ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()
assert reconstructed==retention_snapshot[0],('retention snapshot serialization not exact',sha(reconstructed),sha(retention_snapshot[0]))
generate('BATCH008_RETENTION_SNAPSHOT_COMPACT.json',{'schema':'ER10-retention-exact-reference-projection-v1','original_identity':{'path':str(T/'snapshot.json'),'sha256':sha(retention_snapshot[0]),'bytes':len(retention_snapshot[0])},'snapshot':retention_obj,'exact_in_memory_materialization_verified':True,'held_witness_fragments_included':False,'no_body_reconstruction_claim':True})
generate('BATCH008_HELD_WITNESS_METADATA.json',{'schema':'ER10-held-witness-metadata-only-v1','original_identity':{'path':str(T/'public-witness-candidates.json'),'sha256':sha(held_saved[0]),'bytes':len(held_saved[0])},'copy_transform':'exact_utf8_raw_json_slice fields withheld; original unchanged','withheld_fields':withheld,'metadata':held,'status':'HOLD_PENDING_ROOT_DECISION','private_archive_exists':False,'source_cache_cleanup_executed':False})
generate('BATCH008_REPLAY_MAP.json',{'schema':'ER10-exact-administrative-replay-map-v1','fixed_cutoff':CUTOFF,'reference_commit':COMMIT,'normalizer_inputs':normalizer_inputs,'normalizer_projection':{'original_path':str(N/'WORKING-normalized.json'),'sha256':sha(normalizer_projection[0]),'bytes':len(normalizer_projection[0]),'status':'DETERMINISTIC_REDUNDANT_OUTPUT_NOT_STAGED; reproduce from exact inputs with original normalizer.py'},'retention_snapshot':{'original_path':str(T/'snapshot.json'),'sha256':sha(retention_snapshot[0]),'bytes':len(retention_snapshot[0]),'compact_path':BASE+'/BATCH008_RETENTION_SNAPSHOT_COMPACT.json','byte_exact_materialization_verified':True},'held_witness_replay_limit':'Snapshot can be restored; original classifier replay and witness validation require held original fragments not published in this tranche. No successful public full-classifier replay claimed.'})
# Required checks use only exact authored counters and lifecycle facts.
final=parse(selected[str(R/IW)]['data']);cov=final['total_evaluation_coverage']
assert cov=={'paired_full_science_assessed_pairs':7,'paired_full_science_assessed_arms':14,'separate_full_science_assessed_standalone_arms':2,'paired_infrastructure_HOLD_attempts':4,'complete_owned_pair_attempt_dispositions':11,'no_exhaustive_opportunity_recall':True}
assert final['owned_tasks']['complete_terminal_dispositions']==79 and final['owned_tasks']['quiet_without_pending_children']==79 and final['owned_tasks']['active']==0
assert final['source_quality_preserving_speed_win_established'] is False
assert final['method_complete'] and final['speed_complete'] and final['integrated_complete']
m04=parse(selected[str(R/'helpers/integrated-execution/method04-pair-disposition-v2.json')]['data'])
f03=parse(selected[str(R/'helpers/integrated-execution/fast03-pair-disposition-v1.json')]['data'])
assert all(a['source_judgment']=='PASS_WITH_LIMITATIONS' for a in m04['arms'].values())
assert m04['generic_renderer_preparation_lower_bound_seconds']==454.372
assert f03['arms']['control']['source_judgment']=='PASS_WITH_LIMITATIONS' and f03['arms']['treatment']['source_judgment']=='FAIL'
lock_hash='9ba0418ac83ed7355e73a6d49f0ab5bf0cb1888b34bcca6e1fdc61b75c541d1a';lock=entry('locks/confirmation-selection.json',lock_hash);assert lock and 'batch004-frozen-originals' in lock['target_path']
c01=parse(selected[str(R/'reviews/confirmation/C-01/COMPARISON.json')]['data']);assert c01['arms']['control']['original_scientific_grade'] is None and c01['arms']['control']['material_defect_count']==0
contract={'immutable_logical_slots':40,'immutable_logical_arms':80,'integrated_original_counters':cov,'integrated_owned_task_count':79,'integrated_owned_task_active_count':0,'method_and_fast_queues_closed':True,'comparison_win_established':False,'confirmation_dispositions':4,'confirmation_delivered_paired_assessments':3,'confirmation_both_arm_full_declared_source_pairs':1,'confirmation_qualified_wins':0,'confirmation_selected_lock_sha256':lock_hash,'C01_control_original_grade':None,'C01_control_original_material_defect_count':0,'C01_control_new_normalized_material_defect_count':None,'normalizer_exact_input_count':len(normalizer_inputs),'retention_snapshot_exact_expansion_verified':True,'retention_witness_fragments_withheld':len(withheld),'native_goal_cumulative_counters_summed':False,'M16_final_join_or_pair_review_opened':False,'held_successor_answers_or_reviews_opened':False}
# Explicit original tranche records are copied, not interpreted or regraded.
rows=[]
for case in ['D-M08-A','D-M08-B','D-M10-A']:
 rel=f'reviews/targeted-cohort3/{case}-v3/PAIR_COMPARISON.json';j=parse(selected[str(R/rel)]['data'])
 rows.append({'case':case,'version':'final-v3','original_record':str(R/rel),'published_record':entry(rel)['target_path'],'original_disposition':j['disposition'],'original_control':j['control'],'original_treatment':j['treatment'],'original_eligibility':j['eligibility'],'original_economics':j['economics'],'no_new_grade':True})
for rel,j in [('helpers/integrated-execution/method04-pair-disposition-v2.json',m04),('helpers/integrated-execution/fast03-pair-disposition-v1.json',f03)]:
 rows.append({'case':j['case'],'version':j.get('version','v1'),'original_record':str(R/rel),'published_record':entry(rel)['target_path'],'original_disposition':j['status'],'original_arms':j['arms'],'original_limits':j.get('comparison_limits',j.get('limits')),'no_new_grade':True})
generate('BATCH008_COMPARISON_TRANCHE.json',{'schema':'ER10-batch008-finite-tranche-v1','fixed_cutoff':CUTOFF,'campaign_complete':False,'integrated_track_complete_only':True,'rows':rows,'original_aggregate_record':entry(IW)['target_path'],'original_integrated_coverage':cov,'denominator_rule':'11 pair-attempt dispositions include versions/retests and do not create new logical slots. Exactly 40 slots/80 arms. 7 full paired Source assessments/14 arms and 2 standalone diagnostic arms are distinct; 4 infrastructure HOLD attempts. FAIL/FAIL is not a tie or count winner.','required_contract_checks':contract})
generate('BATCH008_RAW_SOURCE_IDENTITIES.json',{'schema':'ER10-batch008-raw-source-identities-v1','fixed_cutoff':CUTOFF,'raw_body_bytes_published':False,'private_archive_exists':False,'source_cache_cleanup_executed':False,'identity_not_reconstruction':'SHA-256 identifies bytes; replay requires the exact lawful upstream URL/version/commit/locator and capture transformation. Missing release metadata, mutable or deleted sources, license limits and unresolved source-locator checks remain limits. No URL/version is invented.','identities':sorted(raw.values(),key=lambda x:x['path']),'earlier_identity_manifests':[{'target_path':BASE+f'/BATCH{i:03d}_RAW_SOURCE_IDENTITIES.json','reference_commit':COMMIT} for i in range(1,8)],'held_minimal_witness_status':'118-byte three-fragment candidate HOLD; metadata/ranges/hash only, no fragments staged'})
generate('BATCH008_ABSENCES_AND_DEFERRALS.json',{'schema':'ER10-batch008-absences-v1','fixed_cutoff':CUTOFF,'campaign_complete':False,'omissions':omissions,'preserved_limits':['M16 last treatment join and paired review not closed at cutoff: protocols/nomination/lifecycle metadata only. Live candidate findings/final science not opened.','M07A/B, M09A, M06A/B final-authorized successors unstarted-held: protocols only; no future answers/reviews.','C01 missing control review: original grade NULL and original defect count0 preserved, new normalization NULL only; no error-free inference.','C02 O1 remainder/C03 actual native BLOCKED and comparative HOLD unchanged. Actual9ba selected lock distinct old44ba.','METHOD02v2/FAST01 full standalone diagnostic grades are independent of unchanged paired HOLD.','Historical old GLM P27 absent; no witness invented.','Prior three malformed JSON and five stale expected hashes retained/disclosed through pinned prior verification; any new limits remain exact original bytes. Unresolved locator checks are not repaired.','No private archive exists and no source-cache cleanup yet. Only actual pre-cutoff B2--7 duplicate-payload cleanup receipts are included.','Normalizer deterministic 20MB projection omitted in favor of exact input identities, essential code/map and byte-replay references. Retention repeated input documents compacted into exact references, byte expansion verified. Held fragments prevent claiming full public classifier replay.','All after-cutoff or unstable originals excluded. No future files are admitted from current existence.']})
generate('BATCH008_VERIFICATION.json',{'schema':'ER10-batch008-mechanical-verification-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'reference_commit':COMMIT,'reference_pin_origin':'Actual GitHub commit independently verified by root before cutoff and supplied in frozen config. Curator verifies exact local target bytes; no new network/Git verification claim.','prior_manifest_checks':prior_checks,'scope_admission_gates':gates,'freeze_identity_check_counts':dict(collections.Counter(x['status'] for x in checks)),'freeze_and_input_identity_checks':checks,'historical_exact_identity_resolutions':historical,'original_json_parse_limits':parse_limits,'inherited_prior_publication_limitations':inherited_limits,'append_only_collision_paths':collisions,'required_contract_checks':contract,'all_expected_hashes_and_scientific_grades_unchanged':True,'ordinary_count_normalizer_status':'COMPLETED WORKING snapshot remains IN_PROGRESS, not campaign final','source_retention_status':'PLAN_ONLY; candidate witness HOLD; no private archive or source-cache cleanup','own_goal_workers_research_regrading_git_repo_writes_cleanup_watchers':False})
notes=f'''# ER10 publication BATCH008

Fixed publication cutoff `{CUTOFF}`. Exact prior-public references bind root's verified GitHub commit `{COMMIT}` on `t3/research/er10-research-efficiency-campaign`. This is a finite append-only tranche. Root owns commit, push, GitHub verification and later cleanup after retention.

Closed new scopes: Cohort3 D-M08-A/B and D-M10-A final v3 (all candidate stages, full independent Source reviews, pair comparisons and prior failures); integrated METHOD04 final v2 (both full Source PASS_WITH_LIMITATIONS, all semantic data, nine views, preservation/checks and actual economics); FAST03 (full paired Source control PASS_WITH_LIMITATIONS / treatment FAIL with two material findings); complete original METHOD/FAST aggregate, FINAL_TRACK_DISPOSITION and final 79-task quiet audit. METHOD/FAST candidate queues are closed. Earlier METHOD02v2 and FAST01 standalone diagnostics remain independent of their original paired HOLD; no grades are duplicated or rewritten.

Exactly 40 logical slots / 80 arms. Integrated coverage is 11 pair-ATTEMPT dispositions including versions/retests, seven full paired Source assessments / fourteen arms, two separately assessed standalone arms and four infrastructure HOLD attempts. These are not eleven new slots. Expanded final-v3 30/40/50/60/80/100/120-minute budgets establish new ceilings, never successes against old 15/45-minute budgets. No quality-preserving win is established. METHOD04v2 treatment is slower, includes the known 454.372-second generic preparation lower bound and unknown qualification wall time; no source-operation or affordability claim follows.

FAST03 control has 49 scientific units; its full contract has 51 facets including two procedural UNVERIFIED facets. Full scientific source assessment, coverage and requirement fulfillment remain separate from required chronology/history/preservation/native completion/T3 quiet/method/provenance/time/quota checks. FAIL/FAIL is neither a tie nor a count winner. Native cumulative Goal counters stay unsummed. The earlier actual SDK usage observation is separate and has mixed candidate/review roles; input/cache/output/billing remain unknown where the original record does not expose them. No raw rollout bodies are opened or staged.

Confirmation remains FOUR dispositions / THREE delivered paired assessments / ONE both-arm full declared Source pair C04 / ZERO qualified wins. C01 control grade is NULL with a missing review: original material count0 is preserved, not an error-free finding; only a new normalization uses NULL. C02 O1 remainder and C03 native BLOCKED/comparative HOLD remain unchanged. The selected9ba lock is distinct from the old44ba lock.

M16 last treatment join and paired review are NOT CLOSED at cutoff. Only named predispatch protocols, nomination and lifecycle metadata are included; live candidate/reviewer findings and final scientific files were not opened. Final-authorized GLM M07A/B, M09A, M06A/B successors were unstarted-held: protocols only, no future answers/reviews. Root/helper terminal acknowledgements, correct binding, actual BATCH007 GitHub receipts and actual executed B2--7 verified duplicate-payload cleanup receipts are selected only before cutoff. Campaign-wide closure or source-cache cleanup is not claimed.

The ordinary count-normalizer's completed WORKING snapshot, code, field map, all actual input identities and validation are preserved. Its result remains IN_PROGRESS, including unresolved mappings. A compact replay map references exact prior authored bytes, avoiding redundant input copies and the 20MB deterministic output; the original normalizer can regenerate that output after materialization. The source-retention planner's code, classification, input identities and validation remain PLAN_ONLY. Its repeated snapshot documents are references whose in-memory expansion was verified byte-identical. The one 118-byte witness is HOLD: only ranges, hashes and metadata are public; its three literal fragments are withheld. No private archive exists, and no source-cache cleanup has occurred. Original classifier replay/fragment validation cannot be claimed from this public bundle until root resolves that held evidence.

Full raw source/corpus/PDF/API/patch bodies, model transcripts, logs, databases, profiles, secrets, nested repositories, usage rollouts and bulky duplicate captures are excluded. Exact source URL/version/locator/SHA metadata is retained where authored. A hash cannot reconstruct missing source bytes. Mutable upstream content, unrecorded versions/transforms, missing locators and license/permission restrictions can prevent exact replay. Old GLM P27 stays absent. Original malformed JSON, stale expected hashes and unresolved locator checks remain disclosed without repairing original science.

Reproduce publication identities with `python3 helpers/publication-batch008/validate.py BATCH008_MANIFEST.json --repo CHECKOUT --staging STAGING`. The validator checks every staged file and prior target by exact SHA and bytes, and refuses overwrites. Use the original `helpers/final-report/resolve_public_evidence.py` with the exact original path and required SHA; there is no filename/latest/best-grade fallback.

Administrative replay: `python3 helpers/publication-batch008/materialize.py --repo CHECKOUT --bundle REPORT_ROOT --out EMPTY_DIRECTORY`. It restores all exact normalizer input snapshots and the byte-identical retention metadata snapshot; it never restores raw sources or held fragments. Overlay essential normalizer code/map/config/manifests from their manifest targets into the materialized normalizer directory, then follow its original README to reproduce deterministic outputs. Past model/native execution, scientific source verification and timings are not recreated by publication receipts. The original replay code and supplied validation results do not certify a newly executed scientific check.

[BATCH008 manifest](BATCH008_MANIFEST.json), [mechanical verification and original limits](BATCH008_VERIFICATION.json), [finite tranche](BATCH008_COMPARISON_TRANCHE.json), [raw identities and replay limits](BATCH008_RAW_SOURCE_IDENTITIES.json), [absences/deferrals](BATCH008_ABSENCES_AND_DEFERRALS.json), [administrative replay map](BATCH008_REPLAY_MAP.json), [held witness metadata only](BATCH008_HELD_WITNESS_METADATA.json).

Changed logical originals use NEW `batch008-frozen-originals/<original-relative>` paths; unchanged targets remain pinned references. All old targets and scientific grades remain unchanged. Manifest self-hash is externally bound by the helper's curation and validation receipts, avoiding self-hash recursion.

'''
notes+='| Closed scope | Exact original comparison |\n|---|---|\n'
for row in rows:notes+=f"| {row['case']} {row['version']} | [{Path(row['original_record']).name}]({row['published_record'][len(BASE)+1:]}) |\n"
notes+='\nIntegrated final closure: '+link(IW,'original FINAL_TRACK_DISPOSITION')+' and '+link('helpers/integrated-execution/final-owned-task-quiet-audit-v1.json','79-task actual quiet audit')+'.\n'
generate('INDEX_BATCH008.md',notes)
# Administrative own config/code are post-cutoff authored publication machinery,
# not future campaign evidence. Manifest them separately and preserve exact bytes.
for name in ['config.json','curate.py','validate.py','materialize.py','generic-reuse.json']:
 src=H/name;b=src.read_bytes();tp=BASE+'/helpers/publication-batch008/'+name
 assert not (W/tp).exists();write(S/tp,b)
 entries.append({'original_path':str(src),'original_sha256':sha(b),'original_bytes':len(b),'target_path':tp,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'CURATOR_ADMINISTRATIVE_CODE_CONFIG_NO_GRADING','why':'generic finite exact-byte curation/replay/validation; no candidate answers or original science changes','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'PARSEABLE' if name.endswith('.json') else 'NOT_JSON'})
manifest={'schema':'ER10-publication-batch008-manifest-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'writing_reserve_seconds':CFG['writing_reserve_seconds'],'verified_reference_commit':COMMIT,'repository_url':'https://github.com/sittingmongoose/Puppet-Master','branch':'t3/research/er10-research-efficiency-campaign','campaign_complete':False,'scientific_regrading':False,'entries':entries,'self_hash':'EXCLUDED_SELF_HASH; path/SHA/bytes bound externally by curation-report.json and validation-results.json'}
dump(P/'BATCH008_MANIFEST.json',manifest)
payload=[p for p in S.rglob('*') if p.is_file()];total=sum(p.stat().st_size for p in payload);assert total<=CFG['staging_limit_bytes']
finished=dt.datetime.now(dt.timezone.utc).isoformat();on_time=dt.datetime.now(dt.timezone.utc).timestamp()<=DEADLINE
report={'schema':'ER10-publication-batch008-curation-report-v1','status':'STAGED_FINITE_CUTOFF_TRANCHE_NO_GIT_WRITES','extent':'COMPLETE_SELECTED_FINITE_TRANCHE' if on_time else 'PARTIAL_EXTENT_FINISHED_AFTER_DEADLINE','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'finished_at':finished,'writing_reserve_seconds':CFG['writing_reserve_seconds'],'staging_root':str(S),'report_root':str(P),'manifest_path':str(P/'BATCH008_MANIFEST.json'),'manifest_sha256':sha((P/'BATCH008_MANIFEST.json').read_bytes()),'manifest_bytes':(P/'BATCH008_MANIFEST.json').stat().st_size,'index_path':str(P/'INDEX_BATCH008.md'),'index_sha256':sha((P/'INDEX_BATCH008.md').read_bytes()),'raw_source_identities_path':str(P/'BATCH008_RAW_SOURCE_IDENTITIES.json'),'raw_source_identities_sha256':sha((P/'BATCH008_RAW_SOURCE_IDENTITIES.json').read_bytes()),'entry_count':len(entries),'entry_dispositions':dict(collections.Counter(e['disposition'] for e in entries)),'new_exact_copies':new_count,'new_exact_copy_bytes':copy_bytes,'staged_files':len(payload),'staged_bytes':total,'raw_source_identity_count':len(raw),'freeze_identity_check_counts':dict(collections.Counter(x['status'] for x in checks)),'parse_limit_count':len(parse_limits),'collision_count':len(collisions),'normalizer_input_count':len(normalizer_inputs),'retention_snapshot_exact_replay_verified':True,'held_witness_fragment_count_not_published':len(withheld),'scientific_regrading':False,'git_commands_or_writes':False,'repo_writes':False,'own_goal_workers_research_account_server_changes_cleanup_watchers':False,'raw_rollout_bytes_opened':False,'root_next_steps':'Exact-path commit/push/GitHub verification, then cleanup duplicate copies only after retention. No source-cache cleanup or private-archive claim.'}
dump(H/'curation-report.json',report);print(json.dumps(report,indent=2))
