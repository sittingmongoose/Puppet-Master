#!/usr/bin/env python3
"""Finite ER10 BATCH009 exact-byte publication curation. No Git, source research, or grading.

Only explicit closed scopes and exact prior identities are read. Writes are confined
here; raw source bodies and rollout bytes never enter staging.
"""
import collections, datetime as dt, hashlib, json, re
from pathlib import Path
R=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
W=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
H=R/'helpers/publication-batch009'; S=H/'staging'; BASE='reports/external-research-v10-20261007'; P=S/BASE
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
 if 'retention-root-witnesses-v1' in parts or p.name in ['DECISIONS.json','write_decisions.py']:return 'RAW_BODY_EXCLUDED'
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
prior_aliases=[];prior=collections.defaultdict(list);prior_by_path=collections.defaultdict(list);verified={}
for i in range(1,9):
 p=W/BASE/f'BATCH{i:03d}_MANIFEST.json';b=p.read_bytes();j=json.loads(b)
 prior_checks.append({'path':str(p),'sha256':sha(b),'bytes':len(b),'reference_commit':COMMIT,'verification':'exact local manifest bytes; root independently verified commit pin supplied in task'})
 for e in j.get('entries',j.get('files',[])):
  op=e.get('original_path') or e.get('source_original_path') or e.get('source_runtime_relative_path')
  oh=e.get('original_sha256') or e.get('source_original_sha256') or e.get('sha256')
  tp=e.get('target_path') or e.get('target_repo_relative_path') or (BASE+'/'+e['public_path'] if e.get('public_path') else None)
  th=e.get('target_sha256') or e.get('sha256');n=e.get('target_bytes',e.get('bytes',e.get('original_bytes')))
  if op and oh and tp and th==oh:
   if not op.startswith('/'):op=str(R/op)
   original_alias=tp
   canonical=(W/tp).resolve()
   assert under(canonical,(W/BASE).resolve()),('prior target outside report base',tp)
   tp=str(canonical.relative_to(W))
   if original_alias!=tp:prior_aliases.append({'manifest':p.name,'original_target_alias':original_alias,'canonical_target_path':tp,'sha256':th,'bytes':n,'original_manifest_unchanged':True})
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

# BATCH009 explicit new CLOSED scope; historical references never regrade science.
old_kind=kind
metadata_checks=[]
def kind(p,b):
 if under(p,R/'helpers/final-report/closed-slot-ledger-v1'):return 'AUTHORED_OFFLINE_ADAPTER_EXACT_INPUT_CAPTURE_CODE_OR_OUTPUT'
 k=old_kind(p,b)
 if under(p,R/'jobs/D-M16-A') or under(p,R/'reviews/targeted-cohort4/D-M16-A'):
  if 'sources' in p.parts and p.suffix=='.json' and p.name in ['exact-locators.json','integrity.json','review-artifact-integrity.json','input-integrity.json','review-validation.json']:
   assert isinstance(parse(b),(dict,list)) and not body_json(parse(b));return 'AUTHORED_SOURCE_CHECK_OR_IDENTITY'
  if 'sources' in p.parts and (p.suffix=='.sha256' or p.name in ['index_hashes.txt','index_hashes.sha256']):return 'AUTHORED_SOURCE_CHECKSUM_METADATA'
 if p.name=='coverage.json' and isinstance(parse(b),dict):return 'AUTHORED_FULL_SOURCE_COVERAGE_CHECK'
 if k=='EXISTING_AUTHORED_SMALL_BOUNDED_WITNESS':return 'RAW_BODY_EXCLUDED'
 return k
C4='helpers/targeted-cohort4'
closure=C4+'/D-M16-A/both-source-reviews-quiet-v3.json'
for s in ['jobs/D-M16-A','reviews/targeted-cohort4/D-M16-A','cases/D-M16-A',C4]:
 closed_scope(s,closure,'explicit CLOSED final M16 all seven candidate stages, original independent reviews and complete six-case Cohort4 history; no regrade')
# Exact retained adapter inputs/captures: no compact-replay substitution is claimed.
A='helpers/final-report/closed-slot-ledger-v1'
closed_scope(A,'state/closed-slot-ledger-root-reproduction-v1.json','completed offline adapter/code/map and all exact retained inputs/captures; incomplete conservative reporting, not campaign final counts')
for q in sorted((R/A).rglob('*')):
 if q.is_file() and not blocked_format(q):
  assert not any(s in str(q.relative_to(R/A)) for s in ['jobs/D-M07','reviews/targeted-cohort4/D-M07','jobs/D-M09','jobs/D-M06']),('held science in adapter',q)
# Selection helper is metadata/code only. Private DECISIONS and matcher writer excluded.
M='helpers/essential-witness-selection-v1'
meta_names=['SELECTED_MINIMAL_WITNESSES.json','ORIGINAL_OBJECT_COVERAGE.json','PROPOSED_FRAGMENT_INDEX.json','READ_IDENTITIES.json','INITIAL_INPUT_IDENTITIES.json','CONTEXT_INPUT_IDENTITIES.json','RENDERED_EXTRACT_MAPPINGS.json','validate_bundle.py','select.py','config.json','README.md','SUMMARY.json','RESULT.json','VALIDATION.json']
unsafe_keys={'exact_utf8_raw_json_slice','response_body','raw_body','quoted_text','source_body','literal_payload','fragment_text','patterns','pattern','needle'}
def forbidden_metadata(o,p=''):
 if isinstance(o,dict):
  for k,v in o.items():
   if k in unsafe_keys and isinstance(v,(str,list)) and v:yield p+'/'+k
   if isinstance(v,(dict,list)):yield from forbidden_metadata(v,p+'/'+k)
 elif isinstance(o,list):
  for i,v in enumerate(o):yield from forbidden_metadata(v,p+'/'+str(i))
for n in meta_names:
 p=R/M/n;saved=stable(p)
 if saved and p.suffix=='.json':
  unsafe=list(forbidden_metadata(parse(saved[0])));assert not unsafe,('private matcher/body metadata',p,unsafe)
  metadata_checks.append({'path':str(p),'sha256':sha(saved[0]),'bytes':len(saved[0]),'status':'METADATA_ONLY_NO_LITERAL_PAYLOAD_OR_PRIVATE_MATCHER_FIELDS'})
 add(M+'/'+n,'explicit metadata-only range/hash/offset selector records or generic code; private matcher file excluded; no source execution or archive')
# Sole authorized public literal witness, preserving old HOLD as a distinct edition.
add('helpers/final-report/slint-8877-minimal-witness-root-v1.json','root-approved brief attributed 22-word/171-byte numeric/environment witness only, no execution claim')
state_names=['closed-slot-ledger-root-reproduction-v1.json','closed-slot-ledger-task-terminal-v1.json','minimal-witness-root-adjudication-v1.json','essential-witness-selection-root-validation-v1.json','essential-witness-selection-task-terminal-v1.json','publication-batch008.json','publication-batch008-local-commit-v1.json','publication-batch008-root-validated-copy-plan-v1.json','publication-batch008-task-terminal-v1.json','cleanup-publication-batch008-staging-v1.json','cleanup-verified-staging-B2-B8-total-v1.json','root-resume-binding-and-confirmation-normalization-v1.json','current-instructions-update-20261007-2119.json','final-finite-prospective-admissions-v3.json','final-finite-t0-interpretation-before-starts-v1.json','targeted-cohort4.json','working-raw-retention-inventory-after-B8-v1.json','working-bulk-source-cleanup-candidates-v1.json','working-retention-mechanical-repair-history-v1.json']
state_names += [p.name for p in (R/'state').glob('*.json') if ('m16' in p.name or p.name.startswith('D-M07-A-'))]
for n in sorted(set(state_names)):
 add('state/'+n,'explicit pre-cutoff root binding/nomination/lifecycle, actual GitHub/cleanup or protected hash-only working retention metadata; no held scientific findings')
for case in ['D-M07-A','D-M07-B','D-M09-A','D-M06-A','D-M06-B']:
 for q in sorted((R/'jobs'/case).glob('*/*')):
  if q.is_dir():protocol_scope(q,'LIVE/held at fixed cutoff; scientific finals, candidates and review findings excluded; original ACTIVE absence remains HOLD')
 for q in sorted((R/'cases'/case).glob('*')):
  if q.is_file() and q.name in ['BRIEF.md','PLAN.md','case-card.json','INPUT_MAP.json','PREPARED.json','READY.json']:
   protocol_paths.add(str(q));add(str(q.relative_to(R)),'prebound case/task metadata only; no new answers or review science')
for rel in ['helpers/final-report/resolve_public_evidence.py','helpers/final-report/count-and-claim-contract-v1.json','helpers/publication-batch008/curate.py','helpers/publication-batch008/validate.py','helpers/publication-batch008/materialize.py','packet/ER10_T3_EXECUTE_HANDOFF.md','locks/confirmation-selection.json','reviews/confirmation/COMPARISONS.json','reviews/confirmation/FINAL_QUIET.json','reviews/confirmation/REPORT.md','helpers/integrated-execution/FINAL_TRACK_DISPOSITION.json','helpers/integrated-execution/COMPARISONS.json','helpers/integrated-execution/method02-pair-disposition-v2.json','helpers/integrated-execution/fast01-pair-disposition-v1.json']+[f'reviews/confirmation/C-{i:02d}/COMPARISON.json' for i in range(1,5)]:
 add(rel,'prior exact pinned result/protocol/limitations only; no regrade or new aggregate')
# Prior administrative limitations and historical witness HOLD editions, exact bytes.
prior_admin=[]
for i in range(1,9):
 for n in [f'BATCH{i:03d}_VERIFICATION.json',f'BATCH{i:03d}_ABSENCES_AND_DEFERRALS.json',f'BATCH{i:03d}_RAW_SOURCE_IDENTITIES.json',f'BATCH{i:03d}_HELD_WITNESS_METADATA.json']:
  p=W/BASE/n
  if p.is_file():
   b=p.read_bytes();prior_admin.append({'original_path':str(p),'target_path':BASE+'/'+n,'sha256':sha(b),'bytes':len(b),'reference_commit':COMMIT})
# Remote GitHub tree is identity-bound once, not recopied recursively.
tree=stable(R/'state/publication-batch008-remote-tree-v1.json')
tree_identity={'original_path':str(R/'state/publication-batch008-remote-tree-v1.json'),'sha256':sha(tree[0]),'bytes':len(tree[0]),'publication':'IDENTITY_ONLY_NOT_DUPLICATED','qualified_remote_verification_receipt':'state/publication-batch008.json'} if tree else {'status':'ABSENT_OR_POST_CUTOFF'}

processed=set();historical=[]
while True:
 pending=[x for x in selected.values() if x['path'].endswith('.json') and x['path'] not in processed]
 if not pending:break
 for item in pending:
  processed.add(item['path']);owner=Path(item['path']);obj=parse(item['data'])
  if obj is None:continue
  for p,h,n,exists,pointer,meta in identities(obj,owner):
   row={'record':str(owner),'locator':str(p),'expected_sha256':h,'expected_bytes':n,'identity_pointer':pointer}
   held_scientific_dependency=any(under(p,R/'jobs'/case) for case in ['D-M07-A','D-M07-B','D-M09-A','D-M06-A','D-M06-B']) and p.name not in PROTOCOL_NAMES and str(p) not in protocol_paths
   if held_scientific_dependency:
    row.update(status='HELD_PROTOCOL_INPUT_IDENTITY_ONLY_ANSWER_NOT_IMPORTED');checks.append(row);continue
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
 op=item['path'];h=item['sha256'];n=item['bytes'];normal=str((W/BASE/Path(op).relative_to(R)).resolve().relative_to(W));ref=exact_prior(op,h,n)
 if ref:target=ref['target'];disp='EXISTING_EXACT_COMMIT_REFERENCE'
 else:
  target=normal
  # Any prior logical path/version, or existing target, requires NEW frozen path.
  if prior_by_path.get(op) or (W/target).exists():
   target=str((W/BASE/'batch009-frozen-originals'/Path(op).relative_to(R)).resolve().relative_to(W));collisions.append({'original_path':op,'existing_logical_path':normal,'new_target':target,'historical_bytes_not_overwritten':True})
  assert not (W/target).exists(),('existing-target collision',target)
  write(S/target,item['data']);disp='NEW_EXACT_COPY';new_count+=1;copy_bytes+=n
 entries.append({'original_path':op,'original_sha256':h,'original_bytes':n,'target_path':target,'target_sha256':h,'target_bytes':n,'source_kind':item['kind'],'why':item['why'],'disposition':disp,'reference_commit':COMMIT if ref else None,'prior_manifest':ref['manifest'] if ref else None,'original_symlink_target':item.get('original_symlink_target'),'selection_mtime_ns':item['mtime_ns'],'selection_mtime_utc':dt.datetime.fromtimestamp(item['mtime_ns']/1e9,dt.timezone.utc).isoformat(),'json_parse_status':next((x['status'] for x in parse_limits if x['original_path']==op),'PARSEABLE' if op.endswith('.json') else 'NOT_JSON'),'protocol_only':op in protocol_paths})
 by_identity.add((op,h))
for e in historical:
 key=(e['original_path'],e['original_sha256'])
 if key in by_identity:continue
 ref=e['target'];entries.append({'original_path':key[0],'original_sha256':key[1],'original_bytes':e['original_bytes'],'target_path':ref['target'],'target_sha256':key[1],'target_bytes':e['original_bytes'],'source_kind':'HISTORICAL_EXACT_IDENTITY_REFERENCE','why':e['reason'],'disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':COMMIT,'prior_manifest':ref['manifest'],'json_parse_status':'PRIOR_ORIGINAL_PARSE_STATUS_UNCHANGED'});by_identity.add(key)
def entry(s,h=None):return next((e for e in entries if e['original_path']==str(R/s) and (h is None or e['original_sha256']==h)),None)
def generate(name,obj):
 b=obj.encode() if isinstance(obj,str) else encoded(obj);src=H/'generated'/name;write(src,b);target=BASE+'/'+name
 assert not (W/target).exists(),('existing admin target',target)
 write(S/target,b);entries.append({'original_path':str(src),'original_sha256':sha(b),'original_bytes':len(b),'target_path':target,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'CURATOR_ADMINISTRATIVE_NO_GRADING','why':'append-only mechanical curation metadata; no scientific regrade','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'PARSEABLE' if name.endswith('.json') else 'NOT_JSON'})
for item in prior_admin:
 entries.append({'original_path':item['original_path'],'original_sha256':item['sha256'],'original_bytes':item['bytes'],'target_path':item['target_path'],'target_sha256':item['sha256'],'target_bytes':item['bytes'],'source_kind':'PRIOR_ADMINISTRATIVE_LIMITS_EXACT_REFERENCE','why':'immutable earlier parse/stalehash/unresolvedlocator limits and historical HOLD witness edition','disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':COMMIT,'json_parse_status':'PRIOR_ORIGINAL_PARSE_STATUS_UNCHANGED'})
# Public adapter replay is performed only inside own scratch, from staged/pinned bytes.
import subprocess,sys
replay=H/'replay-closed-slot-adapter-v3'
adapter_entries=[e for e in entries if e['original_path'].startswith(str(R/A)+'/')]
for e in adapter_entries:
 rel=Path(e['original_path']).relative_to(R/A)
 src=W/e['target_path'] if e['disposition']=='EXISTING_EXACT_COMMIT_REFERENCE' else S/e['target_path']
 b=src.read_bytes();assert (sha(b),len(b))==(e['original_sha256'],e['original_bytes']);write(replay/rel,b)
replay_before={n:sha((replay/n).read_bytes()) for n in ['CLOSED_SLOT_LEDGER.json','FIELD_MAP.json','INPUT_IDENTITIES.json','REPORTING_NOTES.md']}
replay_commands=[]
for action in ['build','validate']:
 result=subprocess.run([sys.executable,'-B',str(replay/'ledger.py'),action],capture_output=True,timeout=120)
 assert result.returncode==0,('adapter replay failed',action,result.stdout[-2000:],result.stderr[-2000:])
 replay_commands.append({'action':action,'exit_code':result.returncode,'stdout_sha256':sha(result.stdout),'stdout_bytes':len(result.stdout),'stderr_sha256':sha(result.stderr),'stderr_bytes':len(result.stderr)})
replay_after={n:sha((replay/n).read_bytes()) for n in replay_before}
assert all(replay_before[n]==replay_after[n] for n in ['CLOSED_SLOT_LEDGER.json','FIELD_MAP.json','REPORTING_NOTES.md']),('adapter/map replay differs',replay_before,replay_after)
original_input_identity=json.loads(selected[str(R/A/'INPUT_IDENTITIES.json')]['data']);relocated_input_identity=json.loads((replay/'INPUT_IDENTITIES.json').read_bytes())
relocation_differences=[]
for i,(original,relocated) in enumerate(zip(original_input_identity['files'],relocated_input_identity['files'])):
 if original!=relocated:
  assert original['relative_path'] in ['@config.json','@INPUTS.json']
  normalized=dict(relocated);normalized['snapshot_path']=original['snapshot_path'];assert normalized==original
  relocation_differences.append({'pointer':'/files/'+str(i)+'/snapshot_path','original':original['snapshot_path'],'relocated':relocated['snapshot_path'],'reason':'relocated control file path only; exact bytes and original published metadata preserved'})
normalized_input_identity=json.loads(json.dumps(relocated_input_identity))
for i,original in enumerate(original_input_identity['files']):normalized_input_identity['files'][i]['snapshot_path']=original['snapshot_path']
assert normalized_input_identity==original_input_identity

validation=json.loads((replay/'validation.json').read_bytes())
replay_record={'schema':'ER10-batch009-actual-relocated-offline-adapter-replay-v1','performed_at':dt.datetime.now(dt.timezone.utc).isoformat(),'exact_materialized_files':len(adapter_entries),'commands':replay_commands,'original_output_hashes':replay_before,'replayed_output_hashes':replay_after,'whole_adapter_map_replay_identical':True,'input_identity_control_path_relocation_only':relocation_differences,'validation':validation,'scientific_or_source_checks_executed':False,'campaign_final_counts':False}
# Contract facts copy root/closed-record assertions; no scientific adjudication.
m16=parse(selected[str(R/C4/'D-M16-A/comparison-v3.json')]['data'])
assert m16['arms']['control']['source_grade']=='FAIL' and m16['arms']['treatment']['source_grade']=='DIAGNOSTIC_FAIL'
assert m16['arms']['treatment']['all_stage_deadline_checks'][-1]['delivery_overrun_seconds']==133.343585
aggregate=parse(selected[str(R/C4/'COMPARISONS.json')]['data']);assert len(aggregate['cases'])==6
root_replay=parse(selected[str(R/'state/closed-slot-ledger-root-reproduction-v1.json')]['data'])
assert root_replay['replayed_checks']==36 and root_replay['mapping_cells']==4845 and root_replay['unknown_source_fields']==598
cleanup=parse(selected[str(R/'state/cleanup-verified-staging-B2-B8-total-v1.json')]['data'])
contract={'same_logical_slots':40,'same_logical_arms':80,'Cohort4_complete_dispositions':6,'M16_candidate_stage_count':7,'M16_original_control_grade':'FAIL','M16_original_treatment_grade':'DIAGNOSTIC_FAIL','M16_original_material_defects_each_arm':6,'M16_treatment_final_stage_overrun_seconds':133.343585,'M16_full_SourcePASS':False,'quality_preserving_win':False,'native_goal_times_distinct_from_T3_times':True,'adapter_snapshot_closed_slots':35,'adapter_snapshot_held_live_slots':5,'adapter_declared_candidate_finals':68,'adapter_missing_finals':2,'adapter_unopened_finals':10,'adapter_paired_scientific_dispositions':32,'adapter_root_checks':36,'adapter_root_cells':4845,'adapter_root_unknown_fields':598,'adapter_incomplete_not_campaign_final_counts':True,'unknown_coverage_delivery_not_failed_or_unassessed':True,'confirmation_dispositions':4,'confirmation_delivered_paired_assessments':3,'confirmation_both_full_pairs':1,'confirmation_qualified_wins':0,'C01_original0_newNULL_distinct':True,'C02_O1_remainder_C03_nativeBLOCKED_comparativeHOLD_unchanged':True,'integrated_attempt_dispositions':11,'integrated_full_paired_science_pairs':7,'integrated_full_paired_science_arms':14,'integrated_standalone_science_arms':2,'integrated_original_METHOD_FAST_logical_slots':9,'standalone_diagnostic_paired_credit':0,'M07A_native_completed_original_ACTIVE_missing_HOLD_science_UNASSESSED':True,'private_archive_created':False,'source_cache_cleanup_executed':False,'only_executed_duplicate_staging_cleanup':cleanup}
generate('BATCH009_ADAPTER_REPLAY.json',replay_record)
generate('BATCH009_COMPARISON_TRANCHE.json',{'schema':'ER10-batch009-finite-tranche-v1','fixed_cutoff':CUTOFF,'campaign_complete':False,'cohort4_original_aggregate':entry(C4+'/COMPARISONS.json'),'M16_exact_original_comparison':entry(C4+'/D-M16-A/comparison-v3.json'),'cohort4_six_case_original_versions':[{'case_id':k,'original':v} for k,v in aggregate['cases'].items()],'required_count_and_claim_boundaries':contract})
generate('BATCH009_RAW_SOURCE_IDENTITIES.json',{'schema':'ER10-batch009-source-identity-only-v1','fixed_cutoff':CUTOFF,'raw_source_bodies_published':False,'identities':sorted(raw.values(),key=lambda x:x['path']),'raw_GitHub_tree_identity_only':tree_identity,'prior_identity_records':prior_admin,'approved_public_quote_exception':'helpers/final-report/slint-8877-minimal-witness-root-v1.json ONLY; 22 attributed words/171 UTF8 bytes','CISA_and_Slint_HTML_private_fragments_excluded':True,'archive_created':False,'raw_source_cleanup_executed':False,'limitations':'SHA/byte/range/tool identities do not reconstruct absent source bodies. Precise original authored source maps/checks retain locators and source/replay limits. No sources refetched and no scientific checks repaired.'})
generate('BATCH009_ABSENCES_AND_DEFERRALS.json',{'schema':'ER10-batch009-absences-v1','fixed_cutoff':CUTOFF,'omissions':omissions,'limits':['Final M07A/B,M09A,M06A/B LIVE or held at cutoff: no candidate/reviewer scientific bodies or finals. Root nomination/lifecycle and original prebound task metadata only. M07A both native complete does not repair missing original ACTIVE/HOLD; science UNASSESSED for tranche.','M16 FAIL and DIAGNOSTIC_FAIL each six material defects. Historical source operation/capture/provenance/runtime remainder unassessed; no full SourcePASS or equal quality win. T final stage overrun133.343585 seconds; native versus T3 timing distinct.','Adapter35closed/5held,68declared finals/2missing/10unopened,32paired scientific dispositions are its incomplete snapshot, never campaign final counts.598unmapped pointers leave UNKNOWN fields UNKNOWN.','Both standalone diagnostic arms retain zero paired credit. Versions/reviews do not add slots. Confirmation4/3/1/0; C01 missingreview/nullgrade/original0-to-newNULL distinct. C02 O1 remainder and C03 nativeBLOCKED/comparativeHOLD remain.','Prior malformed JSON, stale expected hashes and unresolved locators remain immutable. Curator does not repair science.','Old118B Slint witness remains historical HOLD; approved22word/171B edition separate. Private matcher DECISIONS.json/write_decisions.py, fragments, CISA page text and Slint HTML proposed range bodies excluded.','Working retention inventory protects future paths and records hashes only; no authority to delete. No private archive or source-cache deletion yet. Actual B2-B8 verified disposable duplicate staging cleanup only.','Root working draft and closed-slot adapter are not final aggregate. Complete scientific coverage is distinct from procedural/history/native/provenance/budget/affordability obligations.']})
generate('BATCH009_VERIFICATION.json',{'schema':'ER10-batch009-exact-mechanical-verification-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'verified_reference_commit':COMMIT,'reference_verification':'Root independently verified actual GitHub ALL542 remote Git identities and five critical raw file bytes; curator checks local exact prior target SHA/size only. No new remote verification claim.','prior_manifest_checks':prior_checks,'six_B8_alias_canonicalizations':prior_aliases,'scope_admission_gates':gates,'source_metadata_only_checks':metadata_checks,'freeze_identity_check_counts':dict(collections.Counter(x['status'] for x in checks)),'freeze_and_input_identity_checks':checks,'historical_exact_identity_resolutions':historical,'original_json_parse_limits':parse_limits,'prior_administrative_limits_pinned_references':prior_admin,'append_only_collision_paths':collisions,'required_contract':contract,'actual_relocated_adapter_replay':'BATCH009_ADAPTER_REPLAY.json','original_manifests_science_grades_and_targets_unchanged':True,'root_only_Git_writer':True})
notes=f'''# ER10 publication BATCH009

Fixed cutoff `{CUTOFF}`; immutable prior references bind root's independently GitHub-verified commit `{COMMIT}` on `t3/research/er10-research-efficiency-campaign`. Finite append-only curation; root owns publication and GitHub verification. This is not a campaign final aggregate.

Cohort4 is CLOSED with all six original case dispositions, historical versions, compact final state, GLM release and final quiet audit. M16 final v3 includes all seven candidate stages, original installed/native lifecycle receipts, complete candidate reports/finals, tasks/configs/maps/timing and both independent J1/J2 Source reviews with exact authored source checks/coverage. Control **FAIL: six material defects**; treatment **DIAGNOSTIC_FAIL: six material defects**, with historical operation/capture/provenance/runtime remainder unassessed. No full SourcePASS or quality-preserving win. Both final native Goals completed; treatment final-stage T3 delivery exceeded its bound by **133.343585 seconds**. Native terminal times and T3 delivery times remain distinct. New80-minute bounds do not establish original15-minute success. M12/M15 exact unchanged targets remain pinned; changed bytes use new frozen editions, with no regrade or best-of selection.

The completed closed-slot adapter, code, field map, all retained input/capture identities and exact replay bytes, README and REPORTING_NOTES are retained. Root independently reproduced36 checks/4845 cells/598 unmapped pointers. This curator also materialized only exact staged/pinned adapter bytes into its own directory and ran offline build/validate, checking whole adapter/map identities. See [actual relocated replay](BATCH009_ADAPTER_REPLAY.json). Its snapshot35 closed/5 held,68 declared finals/2 missing/10 unopened and32 paired scientific dispositions remains incomplete conservative reporting. Unknown coverage/delivery fields remain **UNKNOWN**, not failed or unassessed. Same40 slots/80 arms; reviews and versions add no slots. Neither this adapter nor root's working draft is the final campaign aggregate.

Final M07A/B,M09A,M06A/B were LIVE or held at cutoff: their scientific candidate bodies, reviewer findings and finals are excluded. Only root pre-cutoff nomination/lifecycle and prebound protocols are admitted; installation tickets remain original scientific input task metadata, without importing answers. M07A both native complete does not repair original ACTIVE absence/HOLD. Its paired review was running; science is UNASSESSED for this tranche.

Confirmation remains4 dispositions/3 delivered paired assessments/1 both-arm full Source pair/0 qualified wins. C01 missing review/null grade/original material0 and newNULL normalization remain distinct; C02 O1 remainder and C03 nativeBLOCKED/comparativeHOLD remain. Integrated11 attempt dispositions/7 full paired scientific assessments14 arms plus2 standalone arms remain separate from original9 METHOD/FAST logical slots. Both standalone diagnostics retain zero paired credit. Scientific coverage does not establish procedural/history/native/provenance/budget/affordability compliance.

Only root's approved Slint8877 compact witness is public:22 attributed quoted words/171 UTF8 bytes, exact locator/source hash and reported configuration/numbers, without execution claim. The earlier118B selection remains a distinct historical HOLD. Essential witness selection metadata contains ranges/hashes/offsets/identities and generic validators; private DECISIONS.json and write_decisions.py, literal fragments, root CISA page extraction and Slint HTML range proposal are excluded. Root adjudication preserves source identity/page-range/tool metadata only; no derived page text is republished. Selection is a retention plan, not executed raw-source cleanup or a verified private archive.

Root B8 receipt retains actual GitHub ALL542 remote identities/five critical raw bytes, local commit/validated canonical-copy plan, alias verification and executed B2-B8 duplicate staging cleanup total5153 files/108898663 logical bytes. The raw GitHub tree is identity-bound, not repeatedly recopied. Original source caches remain retained; only executed cleanup is claimed. Working hash-only retention inventory protects future paths and gives no result or deletion authorization.

[Manifest](BATCH009_MANIFEST.json) binds every staged file and unchanged pinned reference by original path/hash/bytes, canonical target/hash/bytes and kind. Six old B8 ../ aliases are normalized **inside this report base for lookup** while prior manifest bytes remain unchanged. Changed originals use `batch009-frozen-originals/<original-relative>`. Old grades and public targets are untouched. [Mechanical verification](BATCH009_VERIFICATION.json), [original tranche](BATCH009_COMPARISON_TRANCHE.json), [raw source identities/limits](BATCH009_RAW_SOURCE_IDENTITIES.json), [absences](BATCH009_ABSENCES_AND_DEFERRALS.json). Prior malformed JSON/stale expected hashes/unresolved locator limits remain preserved; no science repair.

Validate publication bytes: `python3 helpers/publication-batch009/validate.py BATCH009_MANIFEST.json --repo CHECKOUT --staging STAGING`. After publication, omit `--staging`. Resolve an exact original path plus required SHA using prior `helpers/final-report/resolve_public_evidence.py`; BATCH009 entries supply canonical targets. No filename/latest fallback is used. The original adapter folder is retained with all its exact inputs/captures: offline `ledger.py build` and `ledger.py validate` write beside the code; run in a disposable copy when inspecting immutable evidence. Original absolute campaign paths remain source identity metadata; replay uses retained local snapshot paths. This reruns the reporting adapter only, not models, native Goals, source science or historical timings. No raw source reconstruction or full public retention-classifier replay is claimed.

Manifest self-identity is bound externally by curation-report and validation-results to avoid self-hash recursion. Root publishes/verifies before removing duplicate staging; curator performs no Git writes or cleanup.
'''
generate('INDEX_BATCH009.md',notes)
# Own post-cutoff administrative code/config is explicitly outside evidence cutoff.
for name in ['config.json','curate.py','validate.py','generic-reuse.json']:
 src=H/name;b=src.read_bytes();tp=BASE+'/helpers/publication-batch009/'+name
 assert not (W/tp).exists();write(S/tp,b)
 entries.append({'original_path':str(src),'original_sha256':sha(b),'original_bytes':len(b),'target_path':tp,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'CURATOR_ADMINISTRATIVE_CODE_CONFIG_NO_GRADING','why':'generic exact-byte finite curation code/config; no new candidate science','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'PARSEABLE' if name.endswith('.json') else 'NOT_JSON'})
manifest={'schema':'ER10-publication-batch009-manifest-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'writing_reserve_seconds':300,'verified_reference_commit':COMMIT,'repository_url':'https://github.com/sittingmongoose/Puppet-Master','branch':'t3/research/er10-research-efficiency-campaign','campaign_complete':False,'scientific_regrading':False,'entries':entries,'self_hash':'EXTERNALLY_BOUND_BY_HELPER_CURATION_AND_VALIDATION_RECORDS'}
dump(P/'BATCH009_MANIFEST.json',manifest)
payload=[p for p in S.rglob('*') if p.is_file()];total=sum(p.stat().st_size for p in payload);assert total<=CFG['staging_limit_bytes'];finished=dt.datetime.now(dt.timezone.utc)
report={'schema':'ER10-publication-batch009-curation-report-v1','status':'STAGED_FINITE_CUTOFF_TRANCHE_NO_GIT_WRITES','extent':'COMPLETE_SELECTED_FINITE_TRANCHE' if finished.timestamp()<=DEADLINE else 'PARTIAL_AFTER_DEADLINE','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'finished_at':finished.isoformat(),'staging_root':str(S),'report_root':str(P),'manifest_path':str(P/'BATCH009_MANIFEST.json'),'manifest_sha256':sha((P/'BATCH009_MANIFEST.json').read_bytes()),'manifest_bytes':(P/'BATCH009_MANIFEST.json').stat().st_size,'index_path':str(P/'INDEX_BATCH009.md'),'index_sha256':sha((P/'INDEX_BATCH009.md').read_bytes()),'entry_count':len(entries),'entry_dispositions':dict(collections.Counter(e['disposition'] for e in entries)),'new_exact_copies':new_count,'new_exact_copy_bytes':copy_bytes,'staged_files':len(payload),'staged_bytes':total,'raw_source_identity_count':len(raw),'freeze_identity_check_counts':dict(collections.Counter(x['status'] for x in checks)),'parse_limit_count':len(parse_limits),'collision_count':len(collisions),'canonicalized_prior_aliases':len(prior_aliases),'adapter_relocated_replay_verified':True,'scientific_regrading':False,'git_commands_or_writes':False,'repo_writes':False,'own_goal_workers_research_account_server_changes_cleanup_polls_watchers':False,'root_next_steps':'Publish exact paths and verify GitHub; remove disposable duplicate staging only after verified retention. No raw-source deletion or private archive claim.'}
dump(H/'curation-report.json',report);print(json.dumps(report,indent=2))
