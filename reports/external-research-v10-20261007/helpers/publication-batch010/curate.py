#!/usr/bin/env python3
"""Finite ER10 BATCH010 exact-byte publication curation. No Git, source research, or grading.

Only explicit closed scopes and exact prior identities are read. Writes are confined
here; raw source bodies and rollout bytes never enter staging.
"""
import collections, datetime as dt, hashlib, json, re
from pathlib import Path
R=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
W=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
H=R/'helpers/publication-batch010'; S=H/'staging'; BASE='reports/external-research-v10-20261007'; P=S/BASE
CFG=json.loads((H/'config.json').read_bytes()); CUTOFF=CFG['fixed_cutoff']; TS=dt.datetime.fromisoformat(CUTOFF).timestamp(); COMMIT=CFG['prior_verified_github_commit']
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
 if p.is_symlink():return None
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
  # Git tree is explicit administrative identity metadata, never a source body.
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
 source=any(x in parts for x in ['sources','source','reviewer-source-checks','primary-source-checks','raw','corpus','captures','additional-captures'])
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
for i in range(1,10):
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
 if tp not in remote_blobs or remote_blobs[tp].get('size')!=verified[tp][1]:return None
 b=p.read_bytes(); gitsha=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
 if remote_blobs[tp].get('sha')!=gitsha:return None
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

# BATCH010 explicit CLOSED selection only. No runtime scientific expansion.
remote_path=R/'state/publication-batch009-remote-tree-v1.json'
remote_saved=stable(remote_path); assert remote_saved, 'B9 tree missing before cutoff'
remote_data,remote_st=remote_saved
remote_tree=json.loads(remote_data)
remote_blobs={BASE+'/'+e['path']:e for e in remote_tree['tree'] if e['type']=='blob'}
root_receipt=json.loads((R/'state/publication-batch009.json').read_bytes())
assert root_receipt['commit']==COMMIT and root_receipt['remote_tree_receipt_sha256']==sha(remote_data)
assert not remote_tree['truncated']
scopes.update(R/p for p in ['jobs/D-M07-A','reviews/targeted-cohort3/D-M07-A-v3','cases/D-M07-A','helpers/targeted-cohort3/D-M07-A/administrative-prebinding-originals','helpers/recorded-usage-v2'])
closure=[]
for rel in ['jobs/D-M07-A/common/fresh-untrusted-seed-v3','jobs/D-M07-A/control/document-order-review-final-v3','jobs/D-M07-A/treatment/critical-first-protected-breadth-final-v3','reviews/targeted-cohort3/D-M07-A-v3/J1','reviews/targeted-cohort3/D-M07-A-v3/J2']:
 saved=stable(R/rel/'freeze_disposition.json'); assert saved,rel
 j=parse(saved[0]);assert j['quiet'] is True,rel
 settled=stable(R/rel/'settle_receipt.json');assert settled,rel
 closure.append({'scope':rel,'freeze_path':str(R/rel/'freeze_disposition.json'),'freeze_sha256':sha(saved[0]),'freeze_bytes':len(saved[0]),'quiet':True,'settle_path':str(R/rel/'settle_receipt.json'),'settle_sha256':sha(settled[0]),'settle_bytes':len(settled[0]),'settled':True,'authority':'exact original explicit freeze/settle records; no live status recapture'})
for scope in sorted(scopes):scan(scope,'explicit closed M07A v3 scientific/protocol/native engineering evidence or closed role-separated SDK V2 metadata/code')
for p in sorted((R/'helpers/passive-receipts/receipts').glob('D-M07-A--*.json')):explicit.add(p);select(p,'actual exact M07A passive native receipt including failed exports; engineering only',True)
for p in sorted((R/'state').glob('D-M07-A-*.json')):add(str(p.relative_to(R)),'exact root native nomination/terminal observations; original absence/HOLD unchanged')
add('reviews/targeted-cohort3/COMPARISONS.json','own finite pre-cutoff Cohort3 comparisons; no live M07B science or final campaign aggregate')
state_names=['recorded-usage-reader-v2-task-terminal-v1.json','recorded-usage-v2-root-validation-v1.json','recorded-usage-v2-root-validation-empty-category-schema-failure-v1.json','publication-batch009.json','publication-batch009-remote-tree-v1.json','publication-batch009-local-commit-v1.json','publication-batch009-root-validated-copy-plan-v1.json','publication-batch009-copied-exact-v1.json','publication-batch009-index-verified-v1.json','publication-batch009-root-verification-mechanical-failure-v1.json','publication-batch009-task-terminal-v1.json','cleanup-publication-batch009-staging-prepared-v1.json','cleanup-publication-batch009-staging-v1.json','cleanup-publication-batch009-replay-prepared-v1.json','cleanup-publication-batch009-replay-executed-v1.json','cleanup-verified-staging-B2-B9-total-v1.json','cleanup-summary-projection-schema-failure-v1.json','CPython-v3.12.3-immutable-retention-alternatives-v1.json','immutable-code-witness-alternatives-root-v1.json','GTFS-DAG-and-Slint-old-release-retention-alternatives-v1.json','minimal-witness-root-adjudication-v2.json','C-02-actual-Codex-session-usage-observation-v1.json']
metadata_checks=[]
unsafe_fields={'body','source_body','raw_body','response_body','fragment_text','quoted_text','matching_phrases','patterns','needle','literal_payload','exact_utf8_raw_json_slice','credential','creator_account_id','access_token','refresh_token'}
def unsafe_metadata(o,pointer=''):
 if isinstance(o,dict):
  for k,v in o.items():
   if k in unsafe_fields and isinstance(v,(str,list,dict)) and v:yield pointer+'/'+k
   if isinstance(v,(dict,list)):yield from unsafe_metadata(v,pointer+'/'+k)
 elif isinstance(o,list):
  for i,v in enumerate(o):yield from unsafe_metadata(v,pointer+'/'+str(i))
for n in state_names:
 p=R/'state'/n
 if 'alternatives' in n or n=='minimal-witness-root-adjudication-v2.json':
  saved=stable(p);assert saved,n
  bad=list(unsafe_metadata(parse(saved[0])));assert not bad,(n,bad)
  metadata_checks.append({'path':str(p),'sha256':sha(saved[0]),'bytes':len(saved[0]),'kind':'RETENTION_ALTERNATIVE_METADATA_ONLY','source_bodies_opened':False,'semantic_regrade_or_runtime_proof':False})
 add('state/'+n,'explicit CLOSED root publication/actual cleanup/numeric validation or retention-alternative identity metadata only')
add('helpers/final-report/verify_batch009_github.py','exact root B9 verifier code; code retained, not executed by curator')
add('helpers/final-report/resolve_public_evidence.py','read prior exact-identity resolver; unchanged SHA dependency, no science replay')
add('packet/ER10_T3_EXECUTE_HANDOFF.md','exact packet retention/publication policy; root alone publishes and cleans')
# Old reader and numeric inputs are necessary immutable dependencies; do not import
# present-day broad state/source bodies. Existing expected hashes resolve only pins.
old_observer=R/'helpers/recorded-usage/observation-20261007T211653Z-aa6ea07490bb4a08.json'
old_saved=stable(old_observer);assert old_saved
old=json.loads(old_saved[0])
final=json.loads(selected[str(R/'helpers/recorded-usage-v2/final/observation-20261007T231625Z-9eea80abc27c8de8.json')]['data'])
initial=json.loads(selected[str(R/'helpers/recorded-usage-v2/observation-20261007T231635Z-eb490bede0eae84b.json')]['data'])
for op,h in final['immutable_original_inputs']['before'].items():
 p=Path(op);explicit.add(p);select(p,'explicit old SHA-pinned reader/config/metadata observation dependency necessary for reproducibility',True)
 assert selected.get(op,{}).get('sha256')==h,('changed original SDK dependency',op)
# Typed old authority references and exact C02 binding receipts remain references.
historical=[];unresolved_authorities=[]
for row in old['authority_sources']:
 op=row['path'];ref=exact_prior(op,row['sha256'],row['bytes'])
 if ref:historical.append({'original_path':op,'original_sha256':row['sha256'],'original_bytes':row['bytes'],'target':ref,'reason':'exact old reader authority at captured hash; prior pin only; no current state/dispatch recapture'})
 else:unresolved_authorities.append({'original_path':op,'sha256':row['sha256'],'bytes':row['bytes'],'status':'EXACT_OLD_AUTHORITY_NOT_PUBLISHED_AT_CAPTURED_IDENTITY','no_current_substitution':True})
for row in old.get('account_reference_qualification',{}).get('checks',[]):
 q=row['binding_receipt'];ref=exact_prior(q['path'],q['sha256'],q['bytes'])
 if ref:historical.append({'original_path':q['path'],'original_sha256':q['sha256'],'original_bytes':q['bytes'],'target':ref,'reason':'original C02 numeric binding receipt exact pin; no account/raw SDK body'})
# Pin all nine prior limitation editions; do not re-audit or repair their contents.
prior_admin=[]
for i in range(1,10):
 for n in [f'BATCH{i:03d}_VERIFICATION.json',f'BATCH{i:03d}_ABSENCES_AND_DEFERRALS.json',f'BATCH{i:03d}_RAW_SOURCE_IDENTITIES.json',f'BATCH{i:03d}_HELD_WITNESS_METADATA.json']:
  p=W/BASE/n
  if p.is_file():
   b=p.read_bytes();row={'target':BASE+'/'+n,'sha256':sha(b),'bytes':len(b),'manifest':f'BATCH{i:03d}_MANIFEST.json'}
   assert target_bytes(row)==(sha(b),len(b)),('prior admin Git pin mismatch',n)
   prior_admin.append({'original_path':str(p),'sha256':sha(b),'bytes':len(b),'target':row,'reference_commit':COMMIT,'reason':'literal prior malformed/stale-hash/coverage/locator limits; no repair'})
# The published Slint witness is only referenced; no new source quotation.
op=str(R/'helpers/final-report/slint-8877-minimal-witness-root-v1.json')
ref=exact_prior(op,'0be4f09c9d421d87b9ce4aaa74903c2f1dda3d184f8b1e4318fd8f139fa33658',4482);assert ref
historical.append({'original_path':op,'original_sha256':ref['sha256'],'original_bytes':ref['bytes'],'target':ref,'reason':'old 171B/22-word public witness already pinned B9; no new quotes'})
# No live stage/seed/Goal paths are traversed. State checkpoint changed after cut.
checkpoint=R/'state/targeted-cohort3.json';st=checkpoint.stat()
checkpoint_boundary={'original_path':str(checkpoint),'observed_size':st.st_size,'observed_mtime_ns':st.st_mtime_ns,'fixed_cutoff':CUTOFF,'status':'AFTER_CUTOFF_CURRENT_CHECKPOINT_DEFERRED_SOURCE_OPAQUE','scientific_body_not_imported':True,'replacement':'pre-cut M07A PAIR_COMPARISON, finite COMPARISONS and five freeze/settle records retain M07A checkpoint facts'}
omissions.append(checkpoint_boundary)
# Mechanical closure resolves only admitted M07A or explicit immutable pins.
# SDK authority captures contain source locators for live files; those locators
# remain metadata and are never recursively opened.
for item in list(selected.values()):
 owner=Path(item['path'])
 if owner.suffix!='.json':continue
 if under(owner,R/'helpers/recorded-usage-v2') or under(owner,R/'helpers/recorded-usage') or owner.name.startswith('cleanup-') or owner.name.endswith('alternatives-v1.json'):continue
 for p,h,n,exists,pointer,meta in identities(parse(item['data']),owner):
  row={'record':str(owner),'locator':str(p),'expected_sha256':h,'expected_bytes':n,'identity_pointer':pointer}
  if any(under(p,R/'jobs'/c) or under(p,R/'reviews/targeted-cohort3'/c) or under(p,R/'reviews/targeted-cohort3'/(c+'-v3')) for c in ['D-M07-B','D-M09-A','D-M06-A','D-M06-B']):
   row['status']='LIVE_HELD_SOURCE_OPAQUE_IDENTIFIER_ONLY_NOT_READ';checks.append(row);continue
  if exists is False:row['status']='DECLARED_FROZEN_ABSENCE';checks.append(row);continue
  found=selected.get(str(p)) or raw.get(str(p))
  if found:
   row.update(observed_sha256=found['sha256'],observed_bytes=found['bytes']);row['status']='MATCH' if (not h or h==found['sha256']) and (n is None or n==found['bytes']) else 'MISMATCH_ORIGINAL_BYTES_PRESERVED'
   if str(p) in raw and meta:raw[str(p)]['source_locators'].append({'record':str(owner),'pointer':pointer,**meta})
  else:
   ref=exact_prior(str(p),h,n) if h else None
   if ref:
    historical.append({'original_path':str(p),'original_sha256':h,'original_bytes':ref['bytes'],'target':ref,'reason':'named exact historical dependency; existing Git pin only'})
    row.update(status='EXACT_PRIOR_PINNED_REFERENCE',target_path=ref['target'],reference_commit=COMMIT)
   else:row['status']='LOCATOR_OUTSIDE_SELECTED_SCOPE_NOT_READ' if not allowed(p) else 'ABSENT_OR_DEFERRED_AT_CUTOFF'
  checks.append(row)
# Hash-equivalent authored source operations provide locators, never provenance.
for item in selected.values():
 owner=Path(item['path'])
 if owner.suffix!='.json' or ('D-M07-A' not in str(owner)):continue
 def source_ops(o,pointer=''):
  if isinstance(o,dict):
   h=o.get('sha256');url=o.get('url')
   if h and url:
    for x in raw.values():
     if x['sha256']==h:
      loc={'record':str(owner),'pointer':pointer,**{k:v for k,v in o.items() if k in LOC_KEYS}}
      if loc not in x['source_locators']:x['source_locators'].append(loc)
   for k,v in o.items():
    if isinstance(v,(dict,list)):source_ops(v,pointer+'/'+k)
  elif isinstance(o,list):
   for i,v in enumerate(o):source_ops(v,pointer+'/'+str(i))
 source_ops(parse(item['data']))
for x in raw.values():x['locator_limit']='Original body excluded; exact authored maps/checks retain URL/capture/version/ranges. Mutable URLs and unverified release tags cannot promise frozen-byte replay. Hash/size do not reconstruct bytes; no source refetched.'
entries=[];by_identity=set();new_count=0;copy_bytes=0
for item in sorted(selected.values(),key=lambda x:x['path']):
 op=item['path'];h=item['sha256'];n=item['bytes'];normal=BASE+'/'+str(Path(op).relative_to(R));ref=exact_prior(op,h,n)
 if ref:target=ref['target'];disp='EXISTING_EXACT_COMMIT_REFERENCE'
 else:
  target=normal
  if prior_by_path.get(op) or (W/target).exists():
   target=BASE+'/batch010-frozen-originals/'+str(Path(op).relative_to(R));collisions.append({'original_path':op,'existing_logical_path':normal,'new_target':target,'historical_bytes_not_overwritten':True})
  assert not (W/target).exists(),('existing target collision',target)
  write(S/target,item['data']);disp='NEW_EXACT_COPY';new_count+=1;copy_bytes+=n
 entries.append({'original_path':op,'original_sha256':h,'original_bytes':n,'target_path':target,'target_sha256':h,'target_bytes':n,'source_kind':item['kind'],'why':item['why'],'disposition':disp,'reference_commit':COMMIT if ref else None,'prior_manifest':ref['manifest'] if ref else None,'selection_mtime_ns':item['mtime_ns'],'json_parse_status':next((x['status'] for x in parse_limits if x['original_path']==op),'PARSEABLE' if op.endswith('.json') else 'NOT_JSON')})
 by_identity.add((op,h))
for x in historical+prior_admin:
 op=x['original_path'];h=x.get('original_sha256',x.get('sha256'));n=x.get('original_bytes',x.get('bytes'));ref=x['target']
 if (op,h) in by_identity:continue
 entries.append({'original_path':op,'original_sha256':h,'original_bytes':n,'target_path':ref['target'],'target_sha256':h,'target_bytes':n,'source_kind':'HISTORICAL_EXACT_IDENTITY_REFERENCE','why':x['reason'],'disposition':'EXISTING_EXACT_COMMIT_REFERENCE','reference_commit':COMMIT,'prior_manifest':ref['manifest'],'json_parse_status':'PRIOR_ORIGINAL_PARSE_STATUS_UNCHANGED'});by_identity.add((op,h))
def entry(rel):return next((e for e in entries if e['original_path']==str(R/rel)),None)
def generate(name,obj):
 b=obj.encode() if isinstance(obj,str) else encoded(obj);src=H/'generated'/name;write(src,b);tp=BASE+'/'+name
 assert not (W/tp).exists();write(S/tp,b)
 entries.append({'original_path':str(src),'original_sha256':sha(b),'original_bytes':len(b),'target_path':tp,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'CURATOR_ADMINISTRATIVE_NO_GRADING','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'PARSEABLE' if name.endswith('.json') else 'NOT_JSON','why':'new finite exact-identity/absence/boundary metadata only'})
# Administrative consistency checks only; scientific verdicts are copied as-is.
pair=json.loads(selected[str(R/'reviews/targeted-cohort3/D-M07-A-v3/PAIR_COMPARISON.json')]['data'])
assert pair['control']==pair['treatment']=='FullSourceFAIL' and pair['is_method_comparison'] is False
assert pair['economics']['shared_stage_seconds_full_each_cold_once_aggregate']==588.6
before={s['native_id']:{k:v for k,v in s.items() if k!='role_mapping'} for s in initial['sessions']}
after={s['native_id']:{k:v for k,v in s.items() if k!='role_mapping'} for s in final['sessions']}
assert before==after and initial['campaign_selected_quiet_SDK_work']['field_sums']==final['campaign_selected_quiet_SDK_work']['field_sums']
assert set(initial['campaign_selected_quiet_SDK_work']['native_ids'])==set(final['campaign_selected_quiet_SDK_work']['native_ids'])
usage_root=json.loads(selected[str(R/'state/recorded-usage-v2-root-validation-v1.json')]['data'])
contract={'campaign_complete':False,'new_closed_case':'D-M07-A final v3 diagnostic only','candidate_stages':3,'independent_source_reviews':2,'owned_tasks_quiet_settled':5,'science_original_grades':{'control':pair['control'],'treatment':pair['treatment']},'original_native_comparative_HOLD':pair['native_provenance_comparative_disposition'],'different_defects_not_equal_quality_or_winner':True,'full_declared_science_six_axes_six_brief_obligations_eight_draft_and_final_findings_with_intermediates':'retained exact independent authored review coverage; no scientific remainder; no unknown-defect/runtime guarantee','economics_original':pair['economics'],'host_costs_incomplete_separate':True,'new_native_qualified_method_comparisons':0,'historical_adapter_closed_slots':35,'historical_adapter_unresolved_fields':598,'historical_adapter_not_final_40_80_assessment':True,'recorded_usage_authorized_threads':305,'recorded_usage_strong_Gmail_native_sessions':246,'recorded_usage_quiet_measured_sessions':228,'quiet_role_counts':usage_root['category_session_counts'],'common_work_native_sessions_reference_once':10,'usage_one_source_session_SQL_capture_initial_and_role_corrected_editions':True,'same_captured_sessions_identity_counters_events_liveness_verified':before==after,'no_root_partial_15telemetry_holds_missingrollout_liveSDK_body_in_completed_sums':True,'otherproviders_quantities_null':True,'final_cumulative_once_cache_reasoning_are_subsets':True,'usage_not_billing_quota_generation_or_complete_campaign':True,'final_root_after_all_quiet_observation_pending':True,'source_body_cleanup_or_private_archive_performed':False,'retention_alternatives_no_source_regrade_runtime_proof':True}
generate('BATCH010_COMPARISON_TRANCHE.json',{'schema':'ER10-batch010-finite-tranche-v1','fixed_cutoff':CUTOFF,'required_boundaries':contract,'M07A_original_pair':entry('reviews/targeted-cohort3/D-M07-A-v3/PAIR_COMPARISON.json'),'finite_original_COMPARISONS':entry('reviews/targeted-cohort3/COMPARISONS.json'),'five_owned_closure_records':closure,'current_checkpoint_boundary':checkpoint_boundary,'no_new_campaign_denominator':True})
generate('BATCH010_SOURCE_IDENTITIES.json',{'schema':'ER10-batch010-source-identity-and-limits-v1','fixed_cutoff':CUTOFF,'source_bodies_published':False,'source_bodies_refetched':False,'identities':sorted(raw.values(),key=lambda x:x['path']),'root_retention_alternative_metadata':metadata_checks,'approved_prior_quote_only':'already-published B9 171B/22word Slint witness pinned; no new quoted source bodies','locator_limit':'Exact primary maps/checks preserve original locators and captures; missing frozen source bodies, unverified immutable tag resolution, proposed runtime tests and unknown provenance remain limitations. Source body reconstruction is not claimed.'})
generate('BATCH010_ABSENCES_AND_DEFERRALS.json',{'schema':'ER10-batch010-absences-v1','fixed_cutoff':CUTOFF,'omissions':omissions,'unresolved_old_authority_exact_pins':unresolved_authorities,'original_json_parse_limits':parse_limits,'limits':['Both original M07A control/treatment ACTIVE capture absences, failed exports and diagnostic comparative HOLD remain. Completed native Goals cannot repair missing ACTIVE evidence.','Independent Source reviews assess full declared six axes, six brief obligations, eight draft/final findings and authored intermediates; both fail with different defects. No winner/equalquality/method or native comparative qualification. Candidate operation histories not independently authenticated; runtime and procedural/budget obligations remain distinct.','M07B/M09A/M06A/B live or held scientific contents not read/imported; no recursive seed/Goal-ticket traversal.','Current Cohort3 checkpoint changed aftercut; deferred. Pre-cut M07A comparison/freeze/settle records supply exact closed disposition.','SDK V2 has one capture, distinct initial failed role partition and corrected final metadata partition; no recapture. Holds/rootpartial excluded from completed sums. Final all-quiet root observation is pending.','Other provider quantities NULL; counters provider-reported final cumulative once with cache/reasoning subsets, not billing/quota/generation or final campaign counts.','All nine prior malformed/stalehash/coverage editions remain exact pinned references; no repair. Historical35closed/598unknown adapter remains INCOMPLETE.','B9 actual cleanup removed405/33672237B staging and925/60343176B replay duplicates; B2-9 total5558/142570900B. Original science/source untouched; earlier cleanup failures retained. Unique unpublished failed B9 whole staging/replay corpus not imported.','Retention alternatives metadata only, independent byte equivalence/component/DAG identities, no Source regrade/runtime proof. Old source-body cleanup/private archive unexecuted; private CISA/Slint fragments/matcher excluded.','A hash does not reconstruct missing source bodies. Original maps/ranges/locators retained; source provenance/version/replay gaps disclosed.']})
generate('BATCH010_VERIFICATION.json',{'schema':'ER10-batch010-mechanical-verification-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'verified_reference_commit':COMMIT,'reference_verification':'Root supplied actual independently GitHub-verified commit/tree receipt. Curator verifies local prior target SHA/size AND Git blob SHA/size against exact B9 remote-tree metadata; no new network/GitHub verification claim.','root_B9_tree_identity':{'path':str(remote_path),'sha256':sha(remote_data),'bytes':len(remote_data),'root_receipt':entry('state/publication-batch009.json')},'prior_manifest_checks':prior_checks,'prior_canonical_aliases':prior_aliases,'prior_administrative_limits_pinned_references':prior_admin,'five_owned_closure_records':closure,'retention_metadata_checks':metadata_checks,'source_identity_checks':checks,'identity_check_counts':dict(collections.Counter(x['status'] for x in checks)),'original_json_parse_limits':parse_limits,'append_only_collision_paths':collisions,'old_authority_pin_failures':unresolved_authorities,'required_boundaries':contract,'prior_manifests_and_science_originals_unchanged':True,'root_sole_git_writer':True,'curator_no_goal_workers_source_research_grading_git_repo_write_account_server_cleanup_polls_watchers':True})
notes=f'''# ER10 publication BATCH010

Finite cutoff `{CUTOFF}`; exact prior references pin root's GitHub-verified commit `{COMMIT}` on `t3/research/er10-research-efficiency-campaign`. Root performs publication, fresh GitHub verification and cleanup. This tranche adds the closed **M07A final-v3 diagnostic disposition**; it is not the final campaign aggregate or denominator.

All three M07A candidate stages and both ordinary independent J1/J2 Source reviews are quiet and settled. Exact seed draft, full control/treatment finals, authored intermediate notes, assignments/maps/configs, scientific freezes, timing and installed native receipts/snapshots are retained. Both independent reviews record **FullSourceFAIL** with full six-axis assessment, all six brief obligations, eight draft/final findings, consequential claims and authored intermediates, with no declared scientific remainder. Their defects differ; these verdicts establish neither equal quality nor a winner. Runtime/source-operation execution histories and procedural/budget/native provenance obligations remain distinct. The original both-arm ACTIVE capture absences and failed exports retain **HOLD_MISSING_NATIVE_ACTIVE**. Root's diagnostic exception/gate permits full science review only; no native comparative qualification or causal method result follows.

Original timing: shared seed **588.600s**, charged fully to each cold arm and once in aggregate; own control/treatment **742.515s / 1006.981s**; candidate aggregate **2338.096s**; reviews **734.207s** (original floating value preserved). Incomplete host/capture cost remains separate. Original 15-minute success, billing and affordability are not established. Original M07A PAIR_COMPARISON and finite pre-cut COMPARISONS are immutable editions. Current Cohort3 checkpoint changed aftercut and is deferred; pre-cut five freezes/settles retain the closed M07A facts. Live/held M07B/M09A/M06A/B science, drafts and Goal tickets are excluded.

Recorded SDK usage V2 retains exact reader/reclassifier/validator, task/config/dispatch/run receipt, README/delivery, initial observation/authority/failed validation, corrected final observation/authority/validation, root terminal/numeric validation and original empty-category root schema failure. There was **one Source/session/SQL capture**; correction changes role metadata only. The mechanical curation check confirms unchanged native session identities, quantities, selected events, liveness and aggregate counters. Initial and final editions stay distinct.

Coverage is partial: **305 authorized threads, 246 strong Gmail native sessions, 228 quiet measurements**; quiet role partition **126 candidate / 62 independent review / 1 coordination / 20 helper / 19 unattributed**. Ten common-work sessions occur once, with a reference ledger that adds no second sum. Rootpartial, 15 telemetry holds, missing rollout and live work are excluded from completed sums; other providers' quantities remain NULL. Final cumulative SDK counters are counted once, with cache/reasoning subsets. These are not billing, quota, generated-token or complete-campaign measurements. The final root observation after all work is quiet remains pending. Old SHA-pinned reader and C02 numeric supplement/authority identities necessary for reproducibility remain exact references; unresolved captured identities are explicit.

Root B9 publication receipts include actual remote-tree Git metadata, exact local commit/copy/index checks and the original mechanical suffix failure. Actual duplicate cleanup removed **405 staging files / 33,672,237B**, plus **925 replay duplicates / 60,343,176B**; verified staging B2–9 total **5,558 files / 142,570,900B**. Exact retained paths/hashes/Git identities are in the root prepared/executed plans. Scientific source originals stayed untouched; earlier cleanup failures remain pinned. This curator performs no cleanup and does not import the unique unpublished failed B9 whole corpus.

The four new root retention-alternative records contain only identity/URL/range/DAG metadata: five CPython fixed-tag doc/code bodies verified, code component alternatives, GTFS DAG fields and distinct Slint old release. They establish retention alternatives, not Source regrades or runtime proof. No full source/code/API/PDF/patch/HTML corpus, private matcher/DECISIONS, CISA/Slint fragments or new quotation enters this tranche. The old 171B/22word public witness stays pinned B9. Source-body cleanup and private archive have not occurred.

[Manifest](BATCH010_MANIFEST.json) maps exact original path/SHA/size to canonical target path/SHA/size. Every changed logical target goes under `batch010-frozen-originals/`; earlier targets and all nine manifests/grades/limits stay unchanged. Existing aliases are canonicalized for lookup only. [Verification](BATCH010_VERIFICATION.json), [source identities and locator limits](BATCH010_SOURCE_IDENTITIES.json), [absences/deferrals](BATCH010_ABSENCES_AND_DEFERRALS.json), [finite tranche](BATCH010_COMPARISON_TRANCHE.json). Historical adapter35closed/598unresolved remains INCOMPLETE; no final40/80 or native count claim.

Validate exact bytes: `python3 -B helpers/publication-batch010/validate.py BATCH010_MANIFEST.json --repo CHECKOUT --staging STAGING`. Omit `--staging` after publication. Original absolute paths are provenance locators, not portable execution paths. Use the existing exact-hash resolver; no filename/latest fallback. SDK reclassification/numeric validation is metadata-only; original reader would require local native telemetry and the archived authorization window cannot authorize recapture. Missing frozen source bodies, mutable URLs/unverified tag commits and unretained supplemental captures limit independent source replay; original authored maps/checks retain the actual ranges/identities without invented locators.

Manifest self-hash is externally bound by curation-report and validation-results; every other staging file is manifested. No generated administrative record changes a scientific grade or supplies a missing scientific result.
'''
generate('INDEX_BATCH010.md',notes)
# Own admin copies are explicitly post-cutoff administrative artifacts.
for name in ['task.txt','config.json','dispatch.json','curate.py','validate.py','validate_scope.py','generic-reuse.json','run-receipt.json']:
 src=H/name;b=src.read_bytes();tp=BASE+'/helpers/publication-batch010/'+name
 assert not (W/tp).exists();write(S/tp,b)
 entries.append({'original_path':str(src),'original_sha256':sha(b),'original_bytes':len(b),'target_path':tp,'target_sha256':sha(b),'target_bytes':len(b),'source_kind':'CURATOR_ADMINISTRATIVE_CODE_TASK_CONFIG_NO_GRADING','disposition':'GENERATED_ADMINISTRATIVE','reference_commit':None,'json_parse_status':'PARSEABLE' if name.endswith('.json') else 'NOT_JSON','why':'own finite curator code/task/config; no science'})
# Core receipt has no recursive manifest hash; final receipt binds full manifest.
core={'schema':'ER10-batch010-curation-core-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'selected_exact_originals':len(selected),'new_exact_copies':new_count,'new_exact_copy_bytes':copy_bytes,'raw_identity_count':len(raw),'append_only_collisions':len(collisions),'campaign_complete':False,'root_sole_git_writer':True,'extent':'SELECTED_FINITE_CLOSED_TRANCHE','root_next':'verify exact staging, publish branch, verify GitHub, then root cleanup'}
generate('BATCH010_CURATION_REPORT.json',core)
# validation preflight is full entry identity/coverage, excluding only the manifest
# and this validation record to avoid cyclic SHA definitions. Final validator is external.
preflight={'schema':'ER10-batch010-preflight-v1','passed':True,'checked_entries':len(entries),'unmanifested_files':[],'failures':[],'manifest_and_validation_record_identity_bound_by_external_final_validator':True}
for e in entries:
 p=W/e['target_path'] if e['disposition']=='EXISTING_EXACT_COMMIT_REFERENCE' else S/e['target_path'];b=p.read_bytes()
 assert (sha(b),len(b))==(e['target_sha256'],e['target_bytes'])
 assert '..' not in Path(e['target_path']).parts and under((W/e['target_path']).resolve(),(W/BASE).resolve())
generate('BATCH010_VALIDATION_RESULTS.json',preflight)
manifest={'schema':'ER10-publication-batch010-manifest-v1','fixed_cutoff':CUTOFF,'deadline':CFG['deadline'],'writing_reserve_seconds':300,'verified_reference_commit':COMMIT,'repository_url':'https://github.com/sittingmongoose/Puppet-Master','branch':'t3/research/er10-research-efficiency-campaign','campaign_complete':False,'scientific_regrading':False,'entries':entries,'self_hash':'EXTERNALLY_BOUND_BY_HELPER_CURATION_AND_VALIDATION_RECORDS'}
dump(P/'BATCH010_MANIFEST.json',manifest)
payload=[p for p in S.rglob('*') if p.is_file()];total=sum(p.stat().st_size for p in payload);assert total<=CFG['max_staging_bytes']
existing_bytes=sum(p.stat().st_size for p in (W/BASE).rglob('*') if p.is_file() and not p.is_symlink());assert existing_bytes+total<=512*1024*1024
finished=dt.datetime.now(dt.timezone.utc)
report={**core,'status':'STAGED_FINITE_TRANCHE_READY_FOR_ROOT_VALIDATION_PUBLICATION','extent':'COMPLETE_SELECTED_FINITE_TRANCHE' if finished.timestamp()<=DEADLINE else 'PARTIAL_AFTER_DEADLINE','finished_at':finished.isoformat(),'staging_root':str(S),'report_root':str(P),'manifest_sha256':sha((P/'BATCH010_MANIFEST.json').read_bytes()),'manifest_bytes':(P/'BATCH010_MANIFEST.json').stat().st_size,'index_sha256':sha((P/'INDEX_BATCH010.md').read_bytes()),'index_bytes':(P/'INDEX_BATCH010.md').stat().st_size,'entry_count':len(entries),'entry_dispositions':dict(collections.Counter(e['disposition'] for e in entries)),'staged_files':len(payload),'staged_bytes':total,'existing_report_bytes':existing_bytes,'prospective_report_bytes':existing_bytes+total,'old_authority_exact_unresolved':len(unresolved_authorities),'original_parse_limits':len(parse_limits),'prior_aliases_canonicalized':len(prior_aliases),'no_repo_Git_source_science_changes':True}
dump(H/'curation-report.json',report);print(json.dumps(report,indent=2))
