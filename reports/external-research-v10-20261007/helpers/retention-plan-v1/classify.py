#!/usr/bin/env python3
"""Read-only finite snapshot and offline conservative raw-source retention classifier.
Writes only beside this file. No network, Git, subprocess, archive, source execution or deletion.
"""
import argparse, collections, datetime, hashlib, json, os, re
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
OUT=Path(__file__).resolve().parent
REPO=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
REPORT=REPO/'reports/external-research-v10-20261007'
UTC=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
SHA=lambda b:hashlib.sha256(b).hexdigest()
def write(name,obj):
 p=OUT/name
 assert p.resolve().is_relative_to(OUT)
 p.write_text(json.dumps(obj,ensure_ascii=False,sort_keys=True,**({'separators':(',',':')} if name in ('retention-plan.json','snapshot.json') else {'indent':2}))+'\n')
def ptr(k):return str(k).replace('~','~0').replace('/','~1')
def walk(v,p=''):
 if isinstance(v,dict):
  yield p,v
  for k,x in v.items():yield from walk(x,p+'/'+ptr(k))
 elif isinstance(v,list):
  for i,x in enumerate(v):yield from walk(x,p+'/'+str(i))
ALLOW_NAMES={'sources.json','input-map.json','input_map.json','review_input_map.json','seed_input_map.json','source-map.json','source_map.json','source-index.json','source-checks.json','checked_sources.json','checked-sources.json','primary_sources_checked.json','reviewer-executed-checks.json','executed-checks.json','coverage.json','review.json','frozen-review.json','frozen-standalone-review.json','index.json','additional_implementation_check.json','instructions_checked.json','frozen_note_identity_check.json','supplied-evidence-identity-check.json','capture-link-check.json'}
BAD=re.compile(r'(PRIVATE|transcript|rollout|profile|/logs?/|BATCH007|batch007)',re.I)
def allowed(e):
 op=e.get('original_path') or ''
 return Path(op).name.lower() in ALLOW_NAMES and not BAD.search(op) and bool(e.get('target_path'))
URL_KEYS={'url','urls','source_url','source_urls','original_url','requested_url','effective_url','final_url','fetch_url','upstream_url','exact_url','resolved_url','retrieved_url','captured_request_url','primary_url','capture_url','permalink'}
LOC_KEYS={'source_locator','locator','locator_from_map','symbol_range','range','line_range','lines','pages','section','sections','source_path','upstream_path','repo_path','source_ranges_or_symbols','source_range','symbol','symbols'}
VER_KEYS={'version','version_or_date','version_or_capture','version_or_applicability','revision','commit','commit_sha','tag','release','ref','capture_date','accessed_at','captured_at','capture_window_start','retrieved_at','version_or_condition','accessed_at_utc','captured_at_utc'}
ID_KEYS={'id','source_id','candidate_source_id','source_ids','source','sources','source_ref','source_refs','evidence_ref','evidence_refs'}
LICENSE_KEYS={'license','licence','license_url','license_note','copyright','publication_constraints'}
def subset(d,keys):return {k:v for k,v in d.items() if k.lower() in keys and (isinstance(v,(str,int,float,bool)) or (isinstance(v,list) and all(isinstance(x,(str,int,float,bool)) for x in v)))}
def urls(d):
 out=[]
 for k,v in d.items():
  if k.lower() in URL_KEYS:
   if isinstance(v,str) and v.startswith(('https://','http://')):out.append(v)
   elif isinstance(v,list):out.extend(x for x in v if isinstance(x,str) and x.startswith(('http://','https://')))
 return sorted(set(out))
def snapshot():
 dest=OUT/'snapshot.json'
 if dest.exists():raise SystemExit('Snapshot already exists: use replay; no moving-target resnapshot.')
 cache={}; observations=[]
 def read(p):
  s=str(p)
  if s in cache:return cache[s]
  try:
   before=p.stat();b=p.read_bytes();after=p.stat()
   stable=(before.st_size,before.st_mtime_ns,before.st_ino)==(after.st_size,after.st_mtime_ns,after.st_ino)
   info={'path':s,'sha256':SHA(b),'bytes':len(b),'mtime_ns':before.st_mtime_ns,'stable_during_read':stable,'read_at':UTC()}
   cache[s]=(b,info)
  except (OSError,ValueError) as exc:cache[s]=(None,{'path':s,'error':str(exc),'read_at':UTC()})
  observations.append(cache[s][1]);return cache[s]
 started=UTC(); ib,ii=read(ROOT/'state/published-raw-source-precleanup-inventory-v3.json'); inv=json.loads(ib)
 raw_manifests=[]; manifests=[]; entries=[]
 for n in (4,5,6):
  for suffix,acc in [('RAW_SOURCE_IDENTITIES',raw_manifests),('MANIFEST',manifests)]:
   b,info=read(REPORT/f'BATCH00{n}_{suffix}.json');d=json.loads(b);acc.append({'batch':n,'identity':info,'document':d})
  entries.extend(manifests[-1]['document']['entries'])
 raw_paths=sorted({r['original_path'] for r in inv['rows']});actual={}
 for path in raw_paths:
  p=Path(path)
  if not p.resolve().is_relative_to(ROOT.resolve()) or BAD.search(path):
   actual[path]={'path':path,'status':'PROTECTED_NOT_READ'};continue
  # Bodies are only streamed through SHA; no parsing, content inspection or copying.
  try:
   s=p.stat();h=hashlib.sha256();size=0
   with p.open('rb') as f:
    for block in iter(lambda:f.read(1024*1024),b''):h.update(block);size+=len(block)
   t=p.stat();actual[path]={'path':path,'actual_sha256':h.hexdigest(),'bytes':size,'mtime_ns':s.st_mtime_ns,'stable_during_read':(s.st_size,s.st_mtime_ns,s.st_ino)==(t.st_size,t.st_mtime_ns,t.st_ino),'read_at':UTC()}
  except OSError as exc:actual[path]={'path':path,'error':str(exc),'read_at':UTC()}
 records=[];skips=[];seen=set()
 for e in entries:
  if not allowed(e):continue
  ident=(e['original_path'],e.get('original_sha256'),e['target_path'],e.get('target_sha256'))
  if ident in seen:continue
  seen.add(ident);target=REPO/e['target_path'];b,info=read(target)
  expected=e.get('original_sha256'); target_sha=e.get('target_sha256')
  # Only exact originals support original-pointer joins; redactions are not treated as original.
  if b is None or info.get('sha256')!=expected or info.get('sha256')!=target_sha or not info.get('stable_during_read'):
   p=Path(e['original_path'])
   if not p.resolve().is_relative_to(ROOT.resolve()):skips.append({'entry':e,'reason':'non-campaign original protected'});continue
   b,info=read(p)
  if b is None or info.get('sha256')!=expected or not info.get('stable_during_read'):
   skips.append({'original_path':e['original_path'],'expected_sha256':expected,'observed':info,'reason':'Exact frozen bytes unavailable; not parsed'});continue
  try:d=json.loads(b)
  except Exception as exc:skips.append({'original_path':e['original_path'],'reason':'not parseable JSON','error':str(exc)});continue
  records.append({'original_path':e['original_path'],'original_sha256':expected,'read_identity':info,'published_path':e['target_path'],'publication_reference_commit':e.get('reference_commit'),'disposition':e.get('disposition'),'document':d})
 # Frozen publication administrative records only, no future BATCH007 data.
 context=[]
 for name in ['BATCH004_ABSENCES_AND_DEFERRALS.json','BATCH005_ABSENCES_AND_DEFERRALS.json','BATCH006_ABSENCES_AND_DEFERRALS.json','BATCH006_COMPARISON_TRANCHE.json','INDEX.batch004.json']:
  b,info=read(REPORT/name);context.append({'identity':info,'document':json.loads(b)})
 b,configid=read(OUT/'config.json');config=json.loads(b)
 for p in [REPO/'AGENTS.md',ROOT/'packet/ER10_T3_EXECUTE_HANDOFF.md',OUT/'task.txt']:
  read(p)
 snap={'schema':'er10.retention.snapshot.v1','snapshot_started_at':started,'snapshot_closed_at':UTC(),'inventory_identity':ii,'inventory':inv,'raw_manifests':raw_manifests,'publication_manifests':manifests,'records':records,'record_skips':skips,'path_observations':actual,'read_identities':observations,'frozen_context':context,'config':config,'config_identity':configid,'scope':'BATCH004..006 plus root precleanup inventory v3 only; not final campaign inventory','raw_body_policy':'SHA streaming only. No body copied, inspected or executed. No model transcripts. No BATCH007.'}
 write('snapshot.json',snap)
 return snap

def classify(snap):
 obs=snap['path_observations']; objects={}; rowrefs=[]; path_to_obj={};errors=[]
 raw_lookup={}; authored_by_sha=collections.defaultdict(list)
 for m in snap['publication_manifests']:
  for i,e in enumerate(m['document']['entries']):
   if e.get('original_sha256') and e.get('original_sha256')==e.get('target_sha256') and e.get('target_path'):
    authored_by_sha[e['original_sha256']].append({'manifest':m['identity']['path'],'manifest_sha256':m['identity']['sha256'],'pointer':f'/entries/{i}','original_path':e.get('original_path'),'published_path':e['target_path'],'sha256':e['original_sha256'],'reference_commit':e.get('reference_commit'),'remote_verified_by_planner':False})
 for m in snap['raw_manifests']:
  for i,r in enumerate(m['document']['identities']):
   key=(m['identity']['path'].split('/')[-1],r.get('original_path') or r.get('path'),r.get('sha256'))
   raw_lookup[key]=(m,i,r)
 for i,r in enumerate(snap['inventory']['rows']):
  p=r['original_path'];a=obs[p];sha=a.get('actual_sha256');verified=bool(sha==r['expected_sha256'] and a.get('stable_during_read') and a.get('bytes')==r['bytes'])
  row={'inventory_pointer':f'/rows/{i}','manifest':r['manifest'],'original_path':p,'expected_sha256':r['expected_sha256'],'actual_sha256':sha,'bytes':a.get('bytes'),'identity_match':verified}
  rowrefs.append(row)
  if not verified:errors.append(row)
  if not sha:continue
  o=objects.setdefault(sha,{'sha256':sha,'bytes':a['bytes'],'paths':[],'inventory_row_indexes':[],'identity_all_matches':True,'locators':[],'record_references':[]})
  if p not in o['paths']:o['paths'].append(p)
  o['inventory_row_indexes'].append(i);o['identity_all_matches'] &= verified;path_to_obj[p]=sha
 def add(sha,loc=None,ref=None):
  if sha not in objects:return
  o=objects[sha]
  if loc and loc not in o['locators']:o['locators'].append(loc)
  if ref and ref not in o['record_references']:o['record_references'].append(ref)
 # Explicit manifest locator associations preserve exact record pointer references.
 for row in rowrefs:
  hit=raw_lookup.get((row['manifest'],row['original_path'],row['expected_sha256']))
  if not hit:continue
  m,i,r=hit
  for j,l in enumerate(r.get('source_locators',[])):
   if not isinstance(l,dict):continue
   add(row['actual_sha256'],{'urls':urls(l),'version':subset(l,VER_KEYS),'range':subset(l,LOC_KEYS),'source_id':subset(l,ID_KEYS),'license':subset(l,LICENSE_KEYS),'binding':'explicit raw identity manifest locator','record':m['identity']['path'],'record_sha256':m['identity']['sha256'],'pointer':f'/identities/{i}/source_locators/{j}','original_record_reference':l.get('record'),'original_record_pointer':l.get('pointer')})
 # Resolve exact source-map / index paths and byte SHA references. URLs never join by themselves.
 source_ids=collections.defaultdict(set);record_nodes={};records_by_path={}
 for rec in snap['records']:
  records_by_path[(rec['original_path'],rec['original_sha256'])]=rec
  nodes=dict(walk(rec['document']));record_nodes[(rec['original_path'],rec['original_sha256'])]=nodes
  doc=rec['document']; capdir=doc.get('capture_directory') if isinstance(doc,dict) else None
  for pointer,node in nodes.items():
   pieces=pointer.split('/'); parents=[]
   for depth in (1,2,3):
    pp='/'.join(pieces[:-depth])
    if pp in nodes:parents.append(nodes[pp])
   inherited={}
   for par in reversed(parents):inherited.update(subset(par,URL_KEYS|LOC_KEYS|VER_KEYS|ID_KEYS|LICENSE_KEYS))
   inherited.update(subset(node,URL_KEYS|LOC_KEYS|VER_KEYS|ID_KEYS|LICENSE_KEYS))
   linked=set();binding=[]
   for key,val in node.items():
    if isinstance(val,str) and re.fullmatch('[0-9a-f]{64}',val) and re.search('sha|hash',key,re.I) and val in objects:linked.add(val);binding.append('exact content SHA')
    if isinstance(val,str) and re.search('path|file|capture',key,re.I) and not val.startswith(('http://','https://')):
     candidates=[val]
     if not val.startswith('/'):
      candidates.extend([str(Path(rec['original_path']).parent/val)])
      if capdir:candidates.append(str(Path(capdir)/val))
      # Original maps often store a filename under their local sources directory.
      candidates.append(str(Path(rec['original_path']).parent/'sources'/val))
     for path in candidates:
      if path in path_to_obj:linked.add(path_to_obj[path]);binding.append('exact original path')
   for key,val in node.items():
    if key in ('source_files','evidence_files','capture_files','files','evidence_paths','source_paths') and isinstance(val,list):
     for name in val:
      if not isinstance(name,str):continue
      exact=str(Path(rec['original_path']).parent/name)
      exact2=str(Path(rec['original_path']).parent/'sources'/name)
      matches={path_to_obj[x] for x in (name,exact,exact2) if x in path_to_obj}
      if not matches and '/reviews/' in rec['original_path']:
       prefix=str(Path(rec['original_path']).parent)+'/'
       matches={sha for path,sha in path_to_obj.items() if path.startswith(prefix) and Path(path).name==Path(name).name}
      if len(matches)==1:linked.update(matches);binding.append('unique exact source filename within frozen review directory')
   if not linked:continue
   role='review_record_reference' if '/reviews/' in rec['original_path'] else 'declared_source_metadata'
   if role=='review_record_reference' and re.search('check|checked',Path(rec['original_path']).name,re.I):role='review_source_check_reference'
   if '/reviews/' in rec['original_path'] and any(k in node for k in ('claim','claim_group','finding')):role='frozen_review_assertion_reference'
   base={'record':rec['original_path'],'record_sha256':rec['original_sha256'],'published_path':rec['published_path'],'pointer':pointer,'role':role,'binding':sorted(set(binding))}
   loc={**base,'urls':urls(inherited),'version':subset(inherited,VER_KEYS),'range':subset(inherited,LOC_KEYS),'source_id':subset(inherited,ID_KEYS),'license':subset(inherited,LICENSE_KEYS)}
   ref={**base,'explicit_fields':{k:v for k,v in node.items() if re.search(r'^(status|verdict|grade|judgment|result|check|checked|claim|finding|material|relevance|reason|use|role|purpose|version_or_condition|source_ranges)',k,re.I) and isinstance(v,(str,bool,int,float))}}
   for sha in linked:
    add(sha,loc if loc['urls'] else None,ref)
    for depth in (0,1,2,3):
     ap='/'.join(pieces[:-depth]) if depth else pointer
     an=nodes.get(ap,{})
     if '/reviews/' in rec['original_path'] and any(k in an for k in ('claim','claim_group','finding')):
      add(sha,ref={**base,'pointer':ap,'role':'frozen_review_assertion_reference','binding':['nested exact evidence reference in frozen assertion'],'explicit_fields':{k:v for k,v in an.items() if re.search(r'^(claim|finding|judgment|result|conditions|version|material|reason|assess|source_ranges)',k,re.I) and isinstance(v,(str,bool,int,float))}})
      break
    # Source IDs are scoped to the exact review directory to avoid global S01 collisions.
    for k,v in inherited.items():
     if k in ('id','source_id','candidate_source_id') and isinstance(v,str):source_ids[(str(Path(rec['original_path']).parent),v)].add(sha)
 # Only explicit ID mentions in frozen review/coverage records; not evidence necessity by default.
 for rec in snap['records']:
  if '/reviews/' not in rec['original_path']:continue
  for pointer,node in walk(rec['document']):
   ids=[]
   for k,v in node.items():
    if k in ID_KEYS:
     if isinstance(v,str):ids.append(v)
     if isinstance(v,list):ids.extend(x for x in v if isinstance(x,str))
   linked=set()
   for ident in ids:linked.update(source_ids.get((str(Path(rec['original_path']).parent),ident),set()))
   for sha in linked:
    add(sha,ref={'record':rec['original_path'],'record_sha256':rec['original_sha256'],'published_path':rec['published_path'],'pointer':pointer,'role':'review_source_id_reference','binding':['exact source ID within same review directory'],'explicit_fields':{k:v for k,v in node.items() if re.search(r'^(status|verdict|grade|result|claim|finding|material|reason|use|role|purpose)',k,re.I) and isinstance(v,(str,bool,int,float))}})
 def locator_class(loc):
  for url in loc['urls']:
   u=urlsplit(url);p=u.path
   # Git file locator must carry a full commit and an exact file path; tree roots are insufficient.
   if (u.netloc=='raw.githubusercontent.com' and re.match(r'^/[^/]+/[^/]+/[0-9a-f]{40}/.+',p)) or (u.netloc in ('github.com','www.github.com') and re.match(r'^/[^/]+/[^/]+/blob/[0-9a-f]{40}/.+',p)):
    return 'IMMUTABLE_GIT_COMMIT_FILE'
   if u.netloc in ('github.com','www.github.com') and re.search(r'/commit/[0-9a-f]{40}(?:\.patch|\.diff|/|$)',p):return 'IMMUTABLE_GIT_COMMIT_FILE'
   if u.netloc=='docs.ogc.org' and re.match(r'^/(?:is|as|dp|per|bp)/[0-9][^/]+/.+',p):return 'RELEASED_SPECIFICATION'
   if u.netloc=='docs.oasis-open.org' and re.search(r'/(?:os|cs\d+|cos\d+)/',p):return 'RELEASED_SPECIFICATION'
   if u.netloc=='pubs.opengroup.org' and re.match(r'^/onlinepubs/[0-9]{10}/',p):return 'RELEASED_SPECIFICATION'
   if u.netloc=='nvlpubs.nist.gov' and re.search(r'(?:sp\d|nistspecialpublication).*\.pdf$',p,re.I):return 'RELEASED_SPECIFICATION'
   if u.netloc in ('www.rfc-editor.org','rfc-editor.org') and re.search(r'/rfc/rfc\d+',p):return 'RELEASED_SPECIFICATION'
  for url in loc['urls']:
   u=urlsplit(url);p=u.path
   if u.netloc=='raw.githubusercontent.com':
    m=re.match(r'^/[^/]+/[^/]+/([^/]+)/.+',p)
    if m and re.search(r'\d',m[1]) and m[1] not in ('main','master','HEAD'):return 'VERSIONED_RELEASE_OR_TAG'
   if u.netloc in ('github.com','www.github.com') and re.search(r'/(blob|tree|releases/tag)/[^/]*\d',p):return 'VERSIONED_RELEASE_OR_TAG'
   if u.netloc=='docs.rs' and re.search(r'/\d+\.\d+',p):return 'VERSIONED_RELEASE_OR_TAG'
   if u.netloc.endswith('readthedocs.io') and re.search(r'/en/v?\d+\.\d+(?:\.\d+)?/',p):return 'VERSIONED_RELEASE_OR_TAG'
  return 'LIVE_MUTABLE_DOC_API_HISTORY' if loc['urls'] else 'MISSING_LOCATOR'
 rank={'IMMUTABLE_GIT_COMMIT_FILE':0,'RELEASED_SPECIFICATION':1,'VERSIONED_RELEASE_OR_TAG':2,'LIVE_MUTABLE_DOC_API_HISTORY':3,'MISSING_LOCATOR':4}
 for o in objects.values():
  for l in o['locators']:
   l['locator_class']=locator_class(l)
   l['relevant_range_state']='EXACT_RECORDED_RANGE_FIELDS' if l['range'] else 'RELEVANT_SUBSET_UNRESOLVED; URL addresses whole file/document only'
   l['body_provenance_or_upstream_replay_verified']=False
  classes={l['locator_class'] for l in o['locators']};o['locator_class']=min(classes,key=lambda c:rank[c]) if classes else 'MISSING_LOCATOR'
  o['locators'].sort(key=lambda l:(rank[l['locator_class']],l['record'],l['pointer']))
  stable=o['locator_class'] in ('IMMUTABLE_GIT_COMMIT_FILE','RELEASED_SPECIFICATION') and o['identity_all_matches']
  versioned=o['locator_class']=='VERSIONED_RELEASE_OR_TAG' and o['identity_all_matches']
  refs=o['record_references']; o['review_reference_count']=sum(r['role'].startswith(('review_','frozen_review_')) for r in refs)
  o['frozen_assertion_reference_count']=sum(r['role']=='frozen_review_assertion_reference' for r in refs)
  o['compact_authored_manifest_references']=authored_by_sha.get(o['sha256'],[])
  authored=bool(o['compact_authored_manifest_references'])
  o['relevance']='FROZEN_REVIEW_REFERENCE_PRESENT_NECESSITY_NOT_PROVEN' if o['review_reference_count'] else 'DECLARED_OR_CACHED_ONLY_RELEVANCE_UNRESOLVED'
  o['reconstructibility']='PRECISE_STABLE_UPSTREAM_REPLAY_LOCATOR_NO_REFETCH_VERIFIED' if stable else ('VERSIONED_UPSTREAM_REPLAY_CONDITIONAL_TAG_MUTATION_AND_BYTE_HASH' if versioned else 'UNKNOWN_EXACT_REPLAY')
  o['proposed_disposition']='NO_PRIVATE_FULL_BODY_COPY_REQUIRED_BY_IDENTIFIED_STABLE_LOCATOR' if stable else ('NO_DEFAULT_ARCHIVE_CONDITIONAL_VERSION_REPLAY_ROOT_VERIFY' if versioned else 'HOLD_LOCATOR_RELEVANCE_OR_MINIMAL_WITNESS_UNRESOLVED')
  if authored:o['proposed_disposition']='RETAIN_COMPACT_AUTHORED_ORIGINAL_VERIFY_GITHUB_NO_PRIVATE_RAW_DUPLICATE'
  if not o['identity_all_matches']:o['proposed_disposition']='HOLD_CURRENT_IDENTITY_MISMATCH'
  o['archive_essential_proposed']=False
  o['replay_limits']=['No source fetch or availability/license check performed. Original URL and hash are identity references, not verified reconstruction.','Deleting the raw object prevents exact local replay until upstream bytes matching the recorded hash are obtainable.','HTTP response headers, capture timestamps, HTML styling and transformed text may differ; wrapper equality is not implied by a stable underlying document.']
  o['captured_form']='POSSIBLY_TRANSFORMED_OR_WRAPPED' if any(re.search(r'(derived|extracted|\.capture|\.review-text|\.html\.txt|\.pdf\.txt)',p,re.I) for p in o['paths']) else 'ORIGINAL_FORM_NOT_BODY_PROVENANCE_VERIFIED'
  if o['captured_form']=='POSSIBLY_TRANSFORMED_OR_WRAPPED':o['replay_limits'].append('A stable underlying source locator does not reproduce extraction, capture wrapper or derived text byte-for-byte; exact transformation recipe is not verified here.')
  if versioned:o['replay_limits'].append('Tags/releases can move or be replaced; recorded SHA is required to detect differing bytes. Resolve to full commit/file before cleanup when feasible.')
  if not stable and not versioned:o['replay_limits'].append('Mutable or missing locator: no guarantee the original captured body can be retrieved. HOLD is not delete authorization or an archive mandate.')
  o['paths'].sort();o['record_references'].sort(key=lambda r:(r['record'],r['pointer'],r['role']))
 totals=collections.Counter(o['locator_class'] for o in objects.values());disps=collections.Counter(o['proposed_disposition'] for o in objects.values())
 objlist=sorted(objects.values(),key=lambda o:o['sha256'])
 for skipped in snap['record_skips']:
  candidates={e.get('original_sha256') for m in snap['publication_manifests'] for e in m['document']['entries'] if e.get('original_path')==skipped.get('original_path')}
  skipped['manifest_original_sha256_candidates']=sorted(x for x in candidates if x)
 breakdown={}
 for cls in totals:
  group=[o for o in objlist if o['locator_class']==cls]
  breakdown[cls]={'objects':len(group),'unique_object_bytes':sum(o['bytes'] for o in group),'unique_paths':sum(len(o['paths']) for o in group),'inventory_rows':sum(len(o['inventory_row_indexes']) for o in group)}
 for o in objlist:
  o['private_archive_necessity']='NOT_ESTABLISHED'
  o['license_publication_constraints']='RECORDED_METADATA_ONLY_ELSE_UNKNOWN; no raw body included'
 plan={'schema':'er10.compact-source-retention-plan.v1','plan_only':True,'snapshot_started_at':snap['snapshot_started_at'],'snapshot_closed_at':snap['snapshot_closed_at'],'deadline':snap['config']['deadline'],'writing_reserve_seconds':snap['config']['writing_reserve_seconds'],'inventory_identity':snap['inventory_identity'],'snapshot_file_sha256':SHA((OUT/'snapshot.json').read_bytes()),'scope':snap['scope'],'future_results':'BATCH007, unfinished findings and results completed after the frozen batch cutoffs excluded. Root must extend independently after freeze; no watching.','scientific_scope':'Preserve original independent SourcePASS/FAIL, correctness/preservation/material failures and legitimate absence/trace limits; no new source verdict or qualified 2x claim.','totals':{'investigated_inventory_rows':len(rowrefs),'unique_paths':len(obs),'actual_unique_objects':len(objects),'actual_unique_object_bytes':sum(o['bytes'] for o in objects.values()),'identity_matching_rows':sum(r['identity_match'] for r in rowrefs),'identity_unresolved_rows':len(errors),'locator_class_objects':dict(totals),'locator_class_breakdown':breakdown,'disposition_objects':dict(disps),'stable_replay_locator_objects':sum(o['locator_class'] in ('IMMUTABLE_GIT_COMMIT_FILE','RELEASED_SPECIFICATION') for o in objects.values()),'versioned_conditional_replay_objects':totals['VERSIONED_RELEASE_OR_TAG'],'unknown_exact_replay_objects':totals['LIVE_MUTABLE_DOC_API_HISTORY']+totals['MISSING_LOCATOR'],'objects_with_frozen_review_reference':sum(o['review_reference_count']>0 for o in objects.values()),'compact_authored_duplicate_objects':sum(bool(o['compact_authored_manifest_references']) for o in objects.values()),'unresolved_hold_objects':sum(o['proposed_disposition'].startswith('HOLD') for o in objects.values()),'objects_with_exact_frozen_assertion_reference':sum(o['frozen_assertion_reference_count']>0 for o in objects.values()),'essential_private_archive_proposed_objects':0,'essential_private_archive_proposed_bytes':0,'metadata_records_inspected':len(snap['records']),'frozen_metadata_record_skips':len(snap['record_skips']),'not_final_all_campaign_inventory':True},'objects':objlist,'inventory_rows':rowrefs,'identity_errors':errors,'metadata_record_skips':snap['record_skips'],'compact_authored_retention':{'policy':'Retain original tasks/configs/all output versions, executed check/helper/witness bytes, failures, source maps/coverage, original independent reviews/comparisons, metrics and absences; never replace with this classification. Public manifest pointers enumerate them without opening candidate answers.','manifest_refs':[{'path':m['identity']['path'],'sha256':m['identity']['sha256'],'entries':len(m['document']['entries']),'pointer':'/entries'} for m in snap['publication_manifests']],'remote_verified_by_planner':False,'preserve_original_paths':True},'archive':{'recommendation':'NONE_JUSTIFIED_BY_THIS_BOUNDED_PLAN','candidates':[],'maximum_archives':1,'proposed_directory':'/mnt/Cursor/PuppetMaster-Evidence/tests/er10-20261007-5a126dd5','name_if_later_justified':'essential-source-witnesses-sha256-<archive-content-sha256>.tar.zst','created':False,'verified':False,'candidate_rule':'Require exact frozen assertion/check/failure record pointer+SHA, exact object/range+SHA, why retained authored checks and immutable refs are insufficient, minimal lawful public witness alternative, license/publication restriction, replay procedure and retention reason. An unresolved cache object is not an archive candidate.'},'protected_resources':['All shared provider/account state, Codex rollouts/profiles/logs, T3 database/user history/resources, ER9 originals and foreign/sibling resources','Original scientific outputs/reviews/failure records and all posted paths; no mutation','Every current source cache: none removed by this plan'], 'missing_trace_policy':'Keep original absence/provenance limits. No P27 reconstruction or hidden trace inference. No new grading.', 'cleanup':{'executed':False,'source_files_deleted':False,'eligible_delete_paths':[],'root_preconditions':['Freeze final completed scientific results and owned-resource inventory separately.','Independently verify precise locator binding, stable revision/file/range, expected hash and permitted minimal witnesses for relied-on assertions.','Publish and verify exact compact authored originals and required lawful witnesses on GitHub; hashes alone insufficient.','Resolve every HOLD intended for removal; retain unresolved narrow objects otherwise.','Any justified private witness archive is separately created, inspected, checksum/replay verified and kept private; at most one.','Verify exact campaign ownership and active bindings; protect shared provider/T3/user/ER9/foreign resources.','Root records actual path/byte cleanup outcomes; this plan claims none.']}}
 witness_path=OUT/'public-witness-candidates.json'
 if witness_path.exists():
  wb=witness_path.read_bytes();wd=json.loads(wb)
  for candidate in wd['public_witness_candidates']:
   assert candidate['raw_source']['sha256'] in objects
   for witness in candidate['witnesses']:
    encoded=witness['exact_utf8_raw_json_slice'].encode('utf8')
    assert SHA(encoded)==witness['sha256'] and len(encoded)==witness['bytes']
  plan['public_witness_candidates']={'path':str(witness_path),'sha256':SHA(wb),'bytes':len(wb),'candidates':len(wd['public_witness_candidates']),'status':'HOLD; no release/license or scientific-sufficiency approval inferred','inspected_existing_source_objects':1,'inspected_unique_source_bytes':7232,'exact_proposed_witness_bytes':118}
  plan['totals']['public_witness_candidate_count']=len(wd['public_witness_candidates'])
  plan['totals']['public_witness_candidate_bytes']=118
 # Compact normalized tables eliminate repeated long paths and locator structures.
 record_table={};locator_table={};reference_table={};authored_table={}
 def intern_record(r):
  key=(r.get('record'),r.get('record_sha256'),r.get('published_path'))
  rid='r'+str(len(record_table))
  for old,entry in record_table.items():
   if tuple(entry.get(k) for k in ('record','record_sha256','published_path'))==key:return old
  record_table[rid]={k:r.get(k) for k in ('record','record_sha256','published_path')};return rid
 def intern(v,table):
  k=SHA(json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
  table.setdefault(k,v);return k
 for o in objlist:
  for field,table in [('locators',locator_table),('record_references',reference_table)]:
   compact=[]
   for v in o[field]:
    t=dict(v);rid=intern_record(t)
    for key in ('record','record_sha256','published_path'):t.pop(key,None)
    t['record_id']=rid;compact.append(intern(t,table))
   o[field]=compact
  o['compact_authored_manifest_references']=[intern(v,authored_table) for v in o['compact_authored_manifest_references']]
  o.pop('replay_limits',None)
 plan['records']=record_table;plan['locators']=locator_table;plan['record_references']=reference_table;plan['compact_authored_references']=authored_table
 plan['replay_limits_by_class']={'all':'No network/availability/license/provenance verification. Exact original hash is required on replay. Source locators do not prove role or necessity. Removing raw bytes limits exact local reproduction. A hash cannot reconstruct missing bytes.','IMMUTABLE_GIT_COMMIT_FILE':'Fetch exact full commit/file; verify original bytes/hash. A capture wrapper or transformed text may need separately retained minimal procedure; upstream availability remains unverified.','RELEASED_SPECIFICATION':'Retrieve exact document ID/revision and specified section/pages; verify original hash; official host availability or replacement remains a limit.','VERSIONED_RELEASE_OR_TAG':'Release/tag may mutate; resolve full commit/file where possible; hash comparison is required.','LIVE_MUTABLE_DOC_API_HISTORY':'Current URL/API/history need not reproduce frozen capture. Preserve minimal lawful assertion witness or resolve immutable alternative before intended removal.','MISSING_LOCATOR':'Exact upstream retrieval or transformation unspecified. Retain narrow object on HOLD until locator/necessity is resolved.','authored_copy':'Manifest-linked exact authored bytes must be retained and independently verified on GitHub; duplicate cached copies need no private archive.'}
 write('retention-plan.json',plan)
 write('archive-candidates.json',plan['archive'])
 write('summary.json',{'totals':plan['totals'],'inventory_sha256':plan['inventory_identity']['sha256'],'snapshot_closed_at':plan['snapshot_closed_at'],'plan_sha256':SHA((OUT/'retention-plan.json').read_bytes())})
 print(json.dumps(plan['totals'],indent=2));return plan
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('mode',choices=['snapshot','replay']);a=ap.parse_args()
 s=snapshot() if a.mode=='snapshot' else json.loads((OUT/'snapshot.json').read_bytes())
 classify(s)
