#!/usr/bin/env python3
"""Index frozen identities and select bounded retention fragments. No source needles."""
import collections, datetime, hashlib, html, json, re, sys
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path('/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5')
OUT=ROOT/'helpers/retention-final-gap-v1'
CWD=Path('/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f')
READS=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc)
def write(name,o):
 p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,indent=2,sort_keys=True)+'\n')
def read(p,kind='METADATA',expected=None):
 p=Path(p);a=p.stat();raw=p.read_bytes();z=p.stat();h=sha(raw)
 READS.append({'path':str(p),'sha256':h,'bytes':len(raw),'kind':kind,'read_at':now().isoformat(),'stable_during_read':(a.st_size,a.st_mtime_ns)==(z.st_size,z.st_mtime_ns),'expected_sha256':expected,'identity_match':expected is None or h==expected})
 if expected and h!=expected:raise ValueError('identity mismatch: '+str(p))
 return raw
def load(p,expected=None):return json.loads(read(p,expected=expected))
CFG=load(OUT/'config.json');RESERVE=datetime.datetime.fromisoformat(CFG['deadline'].replace('Z','+00:00'))-datetime.timedelta(seconds=CFG['writing_reserve_seconds'])
CONTROL=['helpers/retention-working-scope-v2/retention-plan.json','helpers/retention-working-scope-v2/snapshot.json','state/working-raw-retention-inventory-after-B8-v1.json','helpers/essential-witness-selection-v1/SELECTED_MINIMAL_WITNESSES.json','helpers/essential-witness-selection-v1/ORIGINAL_OBJECT_COVERAGE.json','helpers/retention-root-witnesses-v1/APPROVED_FRAGMENT_SCOPE_PREVIEW_V2.json','state/minimal-witness-root-adjudication-v2.json','state/CPython-v3.12.3-immutable-retention-alternatives-v1.json','state/immutable-code-witness-alternatives-root-v1.json','state/GTFS-DAG-and-Slint-old-release-retention-alternatives-v1.json']
controls={n:load(ROOT/n) for n in CONTROL};plan,snapshot,inventory,oldsel,oldcoverage,preview,adjudication,cpy,codealt,others=[controls[n] for n in CONTROL]
SNAP={r['original_path']:r for r in snapshot['records']}
INV={r['path']:r for r in inventory['rows']}
OLD={r['source']['sha256']:(i,r) for i,r in enumerate(oldcoverage['coverage'])}
APPROVED=collections.defaultdict(list)
for i,r in enumerate(preview['ranges']):APPROVED[r['source_sha256']].append({'index':i,'source_path':r['source_path'],'start_byte':r['start_byte'],'end_byte':r['end_byte'],'fragment_sha256':r['fragment_sha256'],'bytes':r['bytes']})
ROWS={};PRIVATE={};INTERNAL={};B9DOC={};FRAGMENTS={};TOTAL_RAW=0;RAW_CACHE={};SELECTED_OBJECTS=set();PROPOSED=[];COMPACTION=[]
PREVIOUS_JOURNAL=[json.loads(x) for x in (OUT/'run-read-journal.jsonl').read_text().splitlines()] if (OUT/'run-read-journal.jsonl').is_file() else []
PREVIOUS_RAW=sum(x.get('raw_bytes',0)+x.get('parser_probe_raw_bytes',0) for x in PREVIOUS_JOURNAL)

def pointer(d,p):
 for k in p.split('/')[1:]:d=d[int(k)] if isinstance(d,list) else d[k.replace('~1','/').replace('~0','~')]
 return d

def frozen_ref(r,record):
 return {'record_path':record['record'],'record_sha256':record['record_sha256'],'published_path':record.get('published_path'),'pointer':r['pointer'],'binding':r.get('binding'),'role':r.get('role')}

def add_obj(h,paths,size,cl,scope):
 if h not in ROWS:
  ROWS[h]={'source_sha256':h,'source_paths':list(paths),'source_bytes':size,'locator_class':cl,'scopes':[scope],'frozen_reviewer_refs':[],'locators':[],'prior_coverage':None,'immutable_alternative':{'status':'NONE_ESTABLISHED'},'necessity':'UNRESOLVED_NOT_FULL_ARCHIVE','selection_ids':[],'limitations':[]}
 else:
  ROWS[h]['source_paths']=sorted(set(ROWS[h]['source_paths']+list(paths)));ROWS[h]['scopes']=sorted(set(ROWS[h]['scopes']+[scope]))
 return ROWS[h]

for oi,o in enumerate(plan['objects']):
 if not o['frozen_assertion_reference_count']:continue
 h=o['sha256'];row=add_obj(h,o['paths'],o['bytes'],o['locator_class'],'WORKING_AFTER_B8');row['plan_object_pointer']='/objects/'+str(oi);row['identity_all_matches_frozen']=o['identity_all_matches'];INTERNAL[h]=[]
 for rid in o['record_references']:
  rr=plan['record_references'][rid]
  if rr['role']!='frozen_review_assertion_reference':continue
  rec=plan['records'][rr['record_id']];row['frozen_reviewer_refs'].append(frozen_ref(rr,rec))
  if rec['record'] in SNAP:
   a=pointer(SNAP[rec['record']]['document'],rr['pointer']);INTERNAL[h].append((a,row['frozen_reviewer_refs'][-1]))
 for lid in o['locators']:
  l=plan['locators'][lid];rec=plan['records'][l['record_id']]
  row['locators'].append({'locator_id':lid,'urls':l['urls'],'record_path':rec['record'],'record_sha256':rec['record_sha256'],'pointer':l['pointer'],'range_metadata_path':str(ROOT/CONTROL[0]),'range_metadata_sha256':next(x['sha256'] for x in READS if x['path']==str(ROOT/CONTROL[0])),'range_metadata_pointer':'/locators/'+lid+'/range','range_keys':list(l.get('range',{})),'locator_class':l['locator_class']})
 if h in OLD:
  i,old=OLD[h];row['prior_coverage']={'path':str(ROOT/CONTROL[4]),'pointer':'/coverage/'+str(i),'sha256':next(x['sha256'] for x in READS if x['path']==str(ROOT/CONTROL[4])),'decision':old['decision'],'eligible_index':old['eligible_index']}
  row['necessity']='PRIOR_SCOPE_REFERENCE_ONLY';row['limitations'].append('Prior decision is preserved; only its identified components and ranges are covered, not every whole assertion.')
 if h in APPROVED:
  row['prior_approved_literal_ranges']=APPROVED[h];row['necessity']='ROOT_APPROVED_EXISTING_MINIMAL_RANGES'
 for ai,a in enumerate(cpy['rows']):
  if a['original_sha256']==h and a['byte_equivalent_verified']:
   row['immutable_alternative']={'status':'ROOT_VERIFIED_BYTE_IDENTICAL_COMMIT','path':str(ROOT/CONTROL[7]),'pointer':'/rows/'+str(ai),'sha256':next(x['sha256'] for x in READS if x['path']==str(ROOT/CONTROL[7])),'url':a['immutable_url'],'source_sha256':h};row['necessity']='NO_ADDITIONAL_PRIVATE_PAYLOAD_BY_ROOT_VERIFIED_ALTERNATIVE'
 if row['prior_coverage']:
  ei=row['prior_coverage']['eligible_index'];alts=[{'pointer':'/rows/'+str(i),'url':a['url'],'verification_kind':a['byte_equivalence_kind'],'expected_exact_sha256_match':a['expected_exact_sha256_match']} for i,a in enumerate(codealt['rows']) if a.get('eligible_index')==ei]
  if alts:row['immutable_alternative']={'status':'ROOT_VERIFIED_COMPONENT_ALTERNATIVE','path':str(ROOT/CONTROL[8]),'sha256':next(x['sha256'] for x in READS if x['path']==str(ROOT/CONTROL[8])),'components':alts,'replay_limit':'Original API or HTML wrapper is not reconstructed.'}
 if o['locator_class']=='IMMUTABLE_GIT_COMMIT_FILE' and not row['prior_coverage']:
  row['immutable_alternative']={'status':'EXACT_FROZEN_COMMIT_LOCATOR_AND_SOURCE_SHA_NO_REFETCH','urls':sorted({u for l in row['locators'] for u in l['urls']}),'source_sha256':h,'independent_frozen_reviewer_refs':row['frozen_reviewer_refs'],'replay_limit':'Stable source lookup; availability and current wrapper bytes not independently refetched here.'};row['necessity']='NO_PRIVATE_PAYLOAD_ESTABLISHED_FOR_FIXED_LOCATOR'
 if o['locator_class']=='RELEASED_SPECIFICATION':row['necessity']='NO_PRIVATE_PAYLOAD_ESTABLISHED_FOR_RELEASED_SPECIFICATION'
 if o['compact_authored_manifest_references']:
  row['compact_authored_refs']=o['compact_authored_manifest_references'];row['necessity']='COMPACT_AUTHORED_IDENTITY_REFERENCE'

manifest_path=CWD/'reports/external-research-v10-20261007/BATCH009_MANIFEST.json';manifest=load(manifest_path);MANIFEST_SHA=sha(manifest_path.read_bytes());M16_META=[]
ALLOWED={'review.json','exact-locators.json','lexical-checks.json','public-capture-index.json','review-capture-index.json','version-provenance-checks.json','mbtiles-provenance-check.json','leaflet-captured-tree-check.json'}
for i,e in enumerate(manifest['entries']):
 if '/reviews/targeted-cohort4/D-M16-A/' not in e['original_path'] or '/helpers/' in e['original_path'] or Path(e['original_path']).name not in ALLOWED:continue
 d=load(CWD/e['target_path'],e['target_sha256']);B9DOC[e['target_path']]=d;M16_META.append({'manifest_pointer':'/entries/'+str(i),'original_path':e['original_path'],'original_sha256':e['original_sha256'],'published_path':e['target_path'],'published_sha256':e['target_sha256']})
 if Path(e['original_path']).name!='review.json':continue
 rec={'record':e['original_path'],'record_sha256':e['original_sha256'],'published_path':e['target_path']};registry=d.get('source_registry',d.get('source_evidence_registry',[]));sid={x.get('id',x.get('review_source_id')):x for x in registry};evs={x['id']:x for x in d.get('source_evidence',[])}
 for ci,a in enumerate(d['consequential_claim_checks']):
  linked=[]
  for ei in a.get('source_evidence_ids',[]):
   if ei in evs:linked.append((evs[ei]['source_id'],'/source_evidence/'+str(d['source_evidence'].index(evs[ei])),evs[ei]))
  for pi,ep in enumerate(a.get('primary_evidence',[])):
   if isinstance(ep,dict) and ep.get('source_id'):linked.append((ep['source_id'],'/consequential_claim_checks/'+str(ci)+'/primary_evidence/'+str(pi),ep))
  for si,eptr,ep in linked:
   if si not in sid:continue
   src=sid[si];path=src.get('path',src.get('primary_path'));h=src['sha256'];url=src['url'];cl='RELEASED_SPECIFICATION' if 'rfc-editor.org/rfc/' in url else ('VERSIONED_RELEASE_OR_TAG' if re.search(r'/(v\d|\d\.\d|osmdroid-parent-)',url) else 'LIVE_MUTABLE_DOC_API_HISTORY');row=add_obj(h,[path],src['bytes'],cl,'CLOSED_M16_BATCH009');ref=frozen_ref({'pointer':'/consequential_claim_checks/'+str(ci),'binding':'exact original reviewer source ID joins registry path and SHA','role':'frozen_review_assertion_reference'},rec);ref['evidence_pointer']=eptr;ref['source_id']=si
   if ref not in row['frozen_reviewer_refs']:row['frozen_reviewer_refs'].append(ref)
   row['locators'].append({'urls':[url],'record_path':rec['record'],'record_sha256':rec['record_sha256'],'pointer':eptr,'range_metadata_pointer':eptr+'/primary_locator' if 'primary_locator' in ep else eptr+'/locator','locator_class':cl})
   INTERNAL.setdefault(h,[]).append(({'evidence':[dict(ep,path=path,sha256=h,url=url,source_id=si)],'claim':a.get('claim',''),'conclusion':a.get('assessment','')},ref))
   if cl=='RELEASED_SPECIFICATION':row['necessity']='NO_PRIVATE_PAYLOAD_ESTABLISHED_FOR_RELEASED_SPECIFICATION'
   elif cl=='VERSIONED_RELEASE_OR_TAG':row['immutable_alternative']={'status':'VERSIONED_SOURCE_FROZEN_REVIEWER_IDENTITY_REPLAY_LIMITED','url':url,'source_sha256':h,'replay_limit':'Tag or release body identified by frozen reviewer; no fresh upstream byte-equivalence verification here.'};row['necessity']='VERSIONED_BODY_REFERENCE_PENDING_ROOT_ADJUDICATION'
   else:row['necessity']='UNWITNESSED_MUTABLE_FROZEN_CONDITION'

# Existing special private transforms are referenced, never reproduced.
SPECIAL=[]
for key in ['CISA_private_alternative','Slint_HTML_private_alternative']:
 path=ROOT/adjudication[key];raw=read(path);SPECIAL.append({'path':str(path),'sha256':sha(raw),'bytes':len(raw),'role':key,'selection':'EXISTING_ROOT_TRANSFORMATION_IDENTITY_ONLY'})
write('GAP_OBJECTS.json',{'schema':'ER10_RETENTION_GAP_OBJECTS_V1','objects':list(ROWS.values()),'working_assertion_objects':199,'closed_m16_metadata':M16_META,'B9_manifest':{'path':str(manifest_path),'sha256':MANIFEST_SHA,'verified_commit_supplied_by_root':'415b8a478a89e7c6e9ac73ca0a6975a211809892','network_verification_here':False},'private_selection_implies_deletion_authorization':False})
write('READ_IDENTITIES.json',{'reads':READS,'raw_source_bytes':TOTAL_RAW,'reserve':RESERVE.isoformat()})
print(json.dumps({'objects':len(ROWS),'M16_added_objects':sum(1 for x in ROWS.values() if x['scopes']==['CLOSED_M16_BATCH009']),'M16_unique_objects':sum('CLOSED_M16_BATCH009' in x['scopes'] for x in ROWS.values()),'M16_classes':dict(collections.Counter(x['locator_class'] for x in ROWS.values() if 'CLOSED_M16_BATCH009' in x['scopes'])),'metadata_reads':len(READS)}))

# Supplementary primary joins and verified version alternatives from exact B9 checks.
UNRESOLVED_LINKS=[]
for rp,d in list(B9DOC.items()):
 if not rp.endswith('/review.json') or 'source_registry' not in d:continue
 capture_key=rp.replace('/review.json','/sources/public-capture-index.json');captures=B9DOC.get(capture_key,[])
 for ei,ep in enumerate(d['source_evidence']):
  if not ep['source_id'].startswith('SUPPLEMENT'):continue
  matches=[(i,c) for i,c in enumerate(captures) if c.get('sha256')==ep.get('sha256') and c.get('url')==ep.get('url') and c.get('path')]
  if len(matches)!=1:
   UNRESOLVED_LINKS.append({'record_path':rp,'pointer':'/source_evidence/'+str(ei),'status':'HOLD_UNRESOLVED_PRIMARY_IDENTITY_JOIN'});continue
  capi,cap=matches[0];row=add_obj(ep['sha256'],[cap['path']],cap['bytes'],'RELEASED_SPECIFICATION','CLOSED_M16_BATCH009');row['necessity']='NO_PRIVATE_PAYLOAD_ESTABLISHED_FOR_RELEASED_SPECIFICATION';row['locators'].append({'urls':[ep['url']],'record_path':rp,'pointer':'/source_evidence/'+str(ei),'capture_metadata_path':capture_key,'capture_metadata_pointer':'/'+str(capi)})
  for ci,a in enumerate(d['consequential_claim_checks']):
   if ep['id'] in a.get('source_evidence_ids',[]):row['frozen_reviewer_refs'].append({'published_path':rp,'record_path':str(ROOT/rp.split('external-research-v10-20261007/')[1]),'record_sha256':next(x['sha256'] for x in READS if x['path']==str(CWD/rp)),'pointer':'/consequential_claim_checks/'+str(ci),'evidence_pointer':'/source_evidence/'+str(ei),'source_id':ep['source_id'],'binding':'exact closed supplemental source SHA joins independent capture'})
for rp,d in B9DOC.items():
 if rp.endswith('/public-capture-index.json'):
  for i,c in enumerate(d):
   h=c.get('sha256');u=c.get('url','')
   if h in ROWS and c.get('status')==200 and re.search(r'raw.githubusercontent.com/[^/]+/[^/]+/[0-9a-f]{12,40}/',u):
    ROWS[h]['immutable_alternative']={'status':'CLOSED_INDEPENDENT_CAPTURE_BYTE_IDENTICAL_FIXED_COMMIT','url':u,'source_sha256':h,'capture_metadata_path':rp,'pointer':'/'+str(i),'capture_metadata_sha256':next(x['sha256'] for x in READS if x['path']==str(CWD/rp)),'replay_limit':'Original mutable URL and API response wrappers are not reconstructible from this body alternative.'};ROWS[h]['necessity']='NO_ADDITIONAL_PRIVATE_PAYLOAD_BY_CLOSED_VERIFIED_COMMIT'

class TextMap(HTMLParser):
 """Map visible normalized characters to exact UTF-8 source byte envelopes."""
 def __init__(self,raw):
  super().__init__(convert_charrefs=False);self.s=raw.decode('utf-8');self.chars=[];self.map=[];self.skip=[];self.starts=[0];self.bmap=[0]
  for i,c in enumerate(self.s):
   if c=='\n':self.starts.append(i+1)
   self.bmap.append(self.bmap[-1]+len(c.encode('utf-8')))
  self.feed(self.s)
 def pos(self):l,c=self.getpos();return self.starts[l-1]+c
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip.append(t)
 def handle_endtag(self,t):
  if self.skip and self.skip[-1]==t:self.skip.pop()
 def handle_data(self,s):
  if self.skip:return
  a=self.pos()
  for i,c in enumerate(s):
   if not c.isspace():self.chars.append(c);self.map.append((self.bmap[a+i],self.bmap[a+i+1]))
 def entity(self,s):
  if self.skip:return
  a=self.pos();e=a+len(s)
  for c in html.unescape(s):
   if not c.isspace():self.chars.append(c);self.map.append((self.bmap[a],self.bmap[e]))
 def handle_entityref(self,n):self.entity('&'+n+';')
 def handle_charref(self,n):self.entity('&#'+n+';')
 def find(self,s,start=0):
  key=''.join(c for c in s if not c.isspace());text=''.join(self.chars);i=text.find(key,start)
  return (self.map[i][0],self.map[i+len(key)-1][1],i+len(key)) if key and i>=0 else None

class JsonSpans:
 """JSON pointer to original lexical byte ranges, with no source-specific terms."""
 def __init__(self,raw):
  self.s=raw.decode('utf-8');self.dec=json.JSONDecoder();self.spans={};self.bmap=[0]
  for c in self.s:self.bmap.append(self.bmap[-1]+len(c.encode('utf-8')))
  self.walk(0,'')
 def ws(self,i):
  while i<len(self.s) and self.s[i].isspace():i+=1
  return i
 def walk(self,i,p):
  i=self.ws(i);a=i;c=self.s[i]
  if c=='{':
   i=self.ws(i+1)
   while self.s[i]!='}':
    k,e=self.dec.raw_decode(self.s,i);i=self.ws(e);assert self.s[i]==':';i=self.walk(i+1,p+'/'+k.replace('~','~0').replace('/','~1'));i=self.ws(i)
    if self.s[i]==',':i=self.ws(i+1)
   i+=1
  elif c=='[':
   i=self.ws(i+1);n=0
   while self.s[i]!=']':
    i=self.walk(i,p+'/'+str(n));n+=1;i=self.ws(i)
    if self.s[i]==',':i=self.ws(i+1)
   i+=1
  else:v,i=self.dec.raw_decode(self.s,i)
  self.spans[p]=(self.bmap[a],self.bmap[i]);return i

def source(h,path=None):
 global TOTAL_RAW
 if h in RAW_CACHE:return RAW_CACHE[h]
 if now()>=RESERVE:raise TimeoutError('writing reserve started')
 row=ROWS[h];p=Path(path or row['source_paths'][0]);size=p.stat().st_size
 if size>CFG['maximum_source_object_bytes'] or p.suffix.lower() in ['.pdf','.crate','.zip','.gz','.xz','.tar','.map']:raise ValueError('excluded large or archive source')
 if PREVIOUS_RAW+TOTAL_RAW+size>CFG['maximum_raw_source_bytes_read']:raise ValueError('raw read budget')
 raw=read(p,'RAW_SOURCE',h);TOTAL_RAW+=len(raw);RAW_CACHE[h]=raw;row['currently_read_verified_path']=str(p);return raw

def fragment(h,a,e,refs,method,extra=None):
 if h not in SELECTED_OBJECTS and len(SELECTED_OBJECTS)>=CFG['maximum_additional_source_objects']:
  ROWS[h]['limitations'].append('Additional source-object selection cap; no full-archive authorization.');return None
 raw=RAW_CACHE[h]
 range_path=ROWS[h]['currently_read_verified_path'];range_sha=h
 if not 0<=a<e<=len(raw) or a==0 and e==len(raw):return None
 payload=raw[a:e];hs=sha(payload)
 if hs not in FRAGMENTS and sum(len(x) for x in FRAGMENTS.values())+len(payload)>CFG['maximum_private_fragment_bytes']:
  PROPOSED.append({'source_sha256':h,'source_path':range_path,'start_byte':a,'end_byte':e,'bytes':len(payload),'fragment_sha256':hs,'frozen_reviewer_refs':refs,'selection_method':method,'status':'LOCATED_NOT_MATERIALIZED_PRIVATE_PAYLOAD_BUDGET','extra_mapping':extra})
  ROWS[h]['limitations'].append({'reason':'64 KiB private payload cap; exact component located but not materialized.','start_byte':a,'end_byte':e,'sha256':hs});return None
 sid='SUP-'+str(len(PRIVATE)+1).zfill(4);(OUT/'private/fragments').mkdir(parents=True,exist_ok=True);p=OUT/'private/fragments'/str(hs+'.bin')
 if hs not in FRAGMENTS:p.write_bytes(payload);FRAGMENTS[hs]=payload
 f={'selection_id':sid,'source_sha256':h,'source_path':ROWS[h]['currently_read_verified_path'],'range_source_path':range_path,'range_source_sha256':range_sha,'start_byte':a,'end_byte':e,'bytes':len(payload),'fragment_sha256':hs,'private_path':str(p),'frozen_reviewer_refs':refs,'selection_method':method,'context_limit':'Only the explicit cited fields, lines, or governing local element; no full source, absence, or whole-assertion proof.'}
 if extra:f.update(extra)
 PRIVATE[sid]=f;ROWS[h]['selection_ids'].append(sid);SELECTED_OBJECTS.add(h);return sid

def merge_ranges(ranges,gap=0):
 out=[]
 for a,e in sorted(set(ranges)):
  if out and a<=out[-1][1]+gap:out[-1]=(out[-1][0],max(e,out[-1][1]))
  else:out.append((a,e))
 return out

def governing(raw,a,e,limit=3072):
 # A complete small paragraph/list/pre/code item is preferred to fixed context.
 tags=[]
 for tag in [b'p',b'li',b'pre',b'code',b'td']:
  starts=list(re.finditer(rb'<'+tag+rb'(?:\s[^>]*|)>',raw[:a+1],re.I));ends=list(re.finditer(rb'</'+tag+rb'\s*>',raw[e:],re.I))
  if starts and ends:
   s=starts[-1].start();z=e+ends[0].end()
   if z-s<=limit:tags.append((s,z))
 if tags:return max(tags,key=lambda x:x[1]-x[0])
 return max(0,a-192),min(len(raw),e+192)

# I-FAST: original extracted-line locators, with exact raw envelope mapping.
new_candidates=[(i,o) for i,o in enumerate(plan['objects']) if o['sha256'] in ROWS and o['sha256'] not in OLD and o['frozen_assertion_reference_count'] and o['locator_class'] in ['LIVE_MUTABLE_DOC_API_HISTORY','VERSIONED_RELEASE_OR_TAG']]
for oi,o in new_candidates:
 h=o['sha256'];row=ROWS[h]
 if o['paths'][0].endswith('.crate'):
  row['necessity']='HOLD_ARCHIVE_MEMBER_OR_PACKAGE_REPLAY_NOT_SELECTED';row['limitations'].append('Archive body not opened. Versioned package locator does not establish exact wrapper reconstruction; no full-archive recommendation.');continue
 urls=sorted({u for l in row['locators'] for u in l['urls']})
 if any(re.search(r'/(?:commits|git/tags)/[a-f0-9]{40}(?:$|\?)',u) for u in urls):
  row['immutable_alternative']={'status':'FROZEN_FIXED_OBJECT_SOURCE_LOCATOR_NO_FRESH_REPLAY','urls':urls,'source_sha256':h,'replay_limit':'Object semantic fields are pinned; full API wrapper representation is not guaranteed byte-identical on replay.'};row['necessity']='NO_PRIVATE_PAYLOAD_ESTABLISHED_FOR_FIXED_OBJECT_METADATA';continue
 bindings=INTERNAL.get(h,[]);ev=[]
 for a,ref in bindings:
  if isinstance(a,dict):
   for ei,e in enumerate(a.get('evidence',[])):
    if isinstance(e,dict) and e.get('sha256')==h:ev.append((e,ref,ei))
 if not ev:row['limitations'].append('No exact original assertion evidence row resolved from frozen snapshot.');continue
 if any('extracted lines' in e.get('locator','') for e,ref,ei in ev):
  pref=next((e['path'] for e,ref,ei in ev if 'path' in e),o['paths'][0]);derived=str(Path(pref).with_suffix('.extracted.txt'));dr=INV.get(derived)
  if not dr:row['limitations'].append('Exact extraction identity missing from permitted inventory.');continue
  try:raw=source(h,pref);db=read(derived,'DERIVED_EXISTING',dr['sha256']);tm=TextMap(raw)
  except (ValueError,TimeoutError) as ex:row['limitations'].append(type(ex).__name__);continue
  lines=db.decode('utf-8').splitlines();byte_lines=db.splitlines(keepends=True);bo=[0]
  for l in byte_lines:bo.append(bo[-1]+len(l))
  targets=[]
  for e,ref,ei in ev:
   loc=e.get('locator','');m=re.search(r'extracted lines\s+([^;:]+)',loc)
   if m:
    for x,y in re.findall(r'(\d+)\s*[-–]\s*(\d+)',m.group(1)):targets.append((int(x),int(y),ref))
  for first,last,ref in targets:
   spans=[];unmapped=[];cursor=0;line_mapping=[]
   for li in range(first-1,min(last,len(lines))):
    line=lines[li].strip()
    if not line:continue
    if len(line)<3:unmapped.append(li+1);continue
    hit=tm.find(line,cursor)
    if hit is None:hit=tm.find(line)
    if hit:
     spans.append(hit[:2]);cursor=hit[2];line_mapping.append({'derived_line':li+1,'raw_start_byte':hit[0],'raw_end_byte':hit[1],'normalized_line_sha256':sha(''.join(c for c in line if not c.isspace()).encode())})
    else:unmapped.append(li+1)
   selected=[]
   for aa,zz in merge_ranges(spans,64):
    if zz-aa>8192:unmapped.append('oversize_raw_envelope');continue
    sid=fragment(h,aa,zz,[ref],'FROZEN_EXTRACTED_LINE_TO_RAW_HTML_ENVELOPE',{'derived_mapping':{'filename':derived,'sha256':dr['sha256'],'start_byte':bo[first-1],'end_byte':bo[min(last,len(byte_lines))],'selected_line_start':first,'selected_line_end':last,'selected_derived_bytes_sha256':sha(db[bo[first-1]:bo[min(last,len(byte_lines))]]),'line_mapping':line_mapping,'raw_mapping_parser':'stdlib html.parser.HTMLParser(convert_charrefs=False), whitespace-elision match','python_version':sys.version.split()[0],'original_extractor_version':'NOT_RECORDED_IN_PERMITTED_METADATA; full extraction bytestream replay not claimed','unmapped_lines':unmapped}})
    if sid:selected.append(sid)
   if unmapped:row['limitations'].append({'unresolved_extracted_lines':unmapped,'frozen_pointer':ref['pointer'],'reason':'Bounded raw envelope mapping incomplete; selected neighboring text does not prove the omitted condition.'})
   if selected:
    aa,zz=bo[first-1],bo[min(last,len(byte_lines))]
    COMPACTION.append({'source_sha256':h,'raw_source_path':str(pref),'derived_path':derived,'derived_source_sha256':dr['sha256'],'start_byte':aa,'end_byte':zz,'fragment_sha256':sha(db[aa:zz]),'bytes':zz-aa,'replace_selection_ids':selected,'materialized_here':False,'raw_visible_line_mapping':line_mapping,'unmapped_lines':unmapped,'frozen_reviewer_ref':ref,'transformation_limit':'Only exact existing derived bytes and individually mapped visible lines; full historic extraction parser is unspecified. Root must independently review before substituting for raw envelopes.'})
 elif Path(ev[0][0]['path']).suffix=='.json':
  try:raw=source(h,ev[0][0]['path']);sp=JsonSpans(raw)
  except (ValueError,TimeoutError) as ex:row['limitations'].append(type(ex).__name__);continue
  wanted=set()
  for e,ref,ei in ev:
   loc=e.get('locator','');parsed=re.findall(r'/(?:[A-Za-z_0-9]+/?)+',loc)
   for q in parsed:
    if q in sp.spans and q:wanted.add(q)
   # Generic relevant API-field locators only, selected from the frozen locator text.
   for key in ['title','state','body','closed_at','merged_at','head','sha','ref','object','message','checksum','num','dl_path','documentation_url']:
    if re.search(r'\b'+key+r'\b',loc):
     for q in sp.spans:
      if q.endswith('/'+key) and q.count('/')<=2:wanted.add(q)
   if '404' in loc:
    for q in ['/message','documentation_url']:
     if q in sp.spans:wanted.add(q)
   if '/patch' in loc:
    for q in sp.spans:
     if q.endswith('/patch') or q.endswith('/filename'):wanted.add(q)
   if 'ref object' in loc and '/object' in sp.spans:wanted.add('/object')
   if not parsed and 'events' in loc:
    doc=json.loads(raw)
    if isinstance(doc,list):
     for ni,obj in enumerate(doc):
      if isinstance(obj,dict) and obj.get('event') in ['closed','reopened','referenced']:
       for key in ['event','created_at','commit_id','commit_url']:
        q='/'+str(ni)+'/'+key
        if q in sp.spans:wanted.add(q)
  for q in sorted(wanted):
   aa,zz=sp.spans[q]
   if zz-aa>8192:row['limitations'].append({'json_pointer':q,'reason':'Field exceeds bounded local fragment limit; not retained.'});continue
   fragment(h,aa,zz,[ref for e,ref,ei in ev],'FROZEN_JSON_FIELD_LEXICAL_VALUE',{'json_pointer':q,'parser':'stdlib JSONDecoder with lexical span indexing','python_version':sys.version.split()[0],'governing_qualifier_limit':'Only fields explicitly identified by frozen original locator; omissions and temporal claims require original metadata context.'})
  if not wanted:row['limitations'].append('Frozen JSON locator resolved no bounded lexical field. No whole object copied.')
 else:row['limitations'].append('No bounded original line or field locator; source not opened for speculative matching.')
 if row['selection_ids']:row['necessity']='MINIMAL_PRIVATE_SUPPLEMENT_PROPOSED_ORIGINAL_CONDITIONS_PARTIAL'

# M16: frozen original byte hits expanded only to a governing local element.
for rp,d in B9DOC.items():
 if not rp.endswith('/exact-locators.json'):continue
 for hi,hitrec in enumerate(d):
  path=hitrec['source'];row=next((r for r in ROWS.values() if path in r['source_paths']),None)
  if not row or row['locator_class']=='RELEASED_SPECIFICATION' or row['necessity'].startswith('NO_ADDITIONAL_PRIVATE'):continue
  h=row['source_sha256']
  if not hitrec.get('hits'):row['limitations'].append({'exact_locator_metadata':rp,'pointer':'/'+str(hi),'reason':'Original matcher has zero hits; no fabricated literal absence witness.'});continue
  try:raw=source(h,path)
  except (ValueError,TimeoutError) as ex:row['limitations'].append(type(ex).__name__);continue
  ranges=[]
  for hit in hitrec['hits']:
   a=hit['byte_start'];e=hit['byte_end_exclusive']
   if not 0<=a<e<=len(raw):row['limitations'].append('Original hit offset out of bounds.');continue
   ranges.append(governing(raw,a,e))
  for a,e in merge_ranges(ranges,32):
   fragment(h,a,e,row['frozen_reviewer_refs'],'FROZEN_ORIGINAL_MATCH_OFFSET_GOVERNING_ELEMENT',{'original_hit_metadata_path':str(CWD/rp),'original_hit_metadata_sha256':next(x['sha256'] for x in READS if x['path']==str(CWD/rp)),'original_hit_pointer':'/'+str(hi)+'/hits','governing_element_maximum_bytes':3072,'fallback_context_bytes_each_side':192,'assertion_binding_limit':'Frozen source registry plus exact matcher file; a match does not establish complete scientific assertion coverage.'})
  if row['selection_ids']:row['necessity']='MINIMAL_PRIVATE_SUPPLEMENT_PROPOSED_ORIGINAL_CONDITIONS_PARTIAL'

# M16 treatment locators not in the exact-hit file: numeric original line ranges.
for h,row in ROWS.items():
 if 'CLOSED_M16_BATCH009' not in row['scopes'] or row['locator_class']=='RELEASED_SPECIFICATION' or row['selection_ids'] or row['necessity'].startswith('NO_ADDITIONAL_PRIVATE') or row['locator_class']=='VERSIONED_RELEASE_OR_TAG':continue
 ranges=[];refs=[]
 for a,ref in INTERNAL.get(h,[]):
  for e in a.get('evidence',[]):
   loc=e.get('locator',e.get('primary_locator',''))
   for aa,zz in re.findall(r'(?:lines?\s+|\bL)(\d+)\s*[-–]\s*(?:L)?(\d+)',loc):ranges.append((int(aa),int(zz)));refs.append(ref)
 if not ranges:
  row['limitations'].append('No numeric frozen original locator in admitted reviewer metadata; no speculative body search.');continue
 try:raw=source(h)
 except (ValueError,TimeoutError) as ex:row['limitations'].append(type(ex).__name__);continue
 ls=raw.splitlines(keepends=True);offs=[0]
 for x in ls:offs.append(offs[-1]+len(x))
 for aa,zz in merge_ranges(ranges):
  if aa<1 or zz>len(ls):row['limitations'].append('Original numeric locator outside physical-line range.');continue
  a,e=offs[aa-1],offs[zz]
  if e-a>8192:row['limitations'].append('Original cited physical line contains oversized HTML; no full line retained.');continue
  fragment(h,a,e,refs,'FROZEN_ORIGINAL_PHYSICAL_LINE_RANGE',{'line_start':aa,'line_end':zz,'parser':'bytes.splitlines(keepends=True)','python_version':sys.version.split()[0]})
 if row['selection_ids']:row['necessity']='MINIMAL_PRIVATE_SUPPLEMENT_PROPOSED_ORIGINAL_CONDITIONS_PARTIAL'

# Remaining M16 mutable headers and CLI option locators are indexed without
# source-specific literal needles. Payload-budget failures remain explicit HOLD.
for h,row in ROWS.items():
 if 'CLOSED_M16_BATCH009' not in row['scopes'] or row['locator_class']!='LIVE_MUTABLE_DOC_API_HISTORY' or row['selection_ids'] or row['necessity'].startswith('NO_ADDITIONAL_PRIVATE'):continue
 path=row['source_paths'][0]
 bindings=INTERNAL.get(h,[])
 if not bindings:continue
 if 'headers' in Path(path).name:
  try:raw=source(h,path)
  except (ValueError,TimeoutError) as ex:row['limitations'].append(type(ex).__name__);continue
  offset=0
  facts=' '.join(str(e.get('locator',''))+' '+str(e.get('stated_source_fact','')) for a,ref in bindings for e in a.get('evidence',[])).lower()
  for line in raw.splitlines(keepends=True):
   name=line.split(b':',1)[0].decode('utf-8',errors='replace').strip().lower()
   if b':' in line and name and name in facts:
    fragment(h,offset,offset+len(line),row['frozen_reviewer_refs'],'FROZEN_NAMED_HTTP_HEADER_FIELD',{'parser':'physical header lines selected solely by field names in original frozen evidence metadata','governing_qualifier_limit':'Only the named captured header; no current policy or general caching inference.'})
   offset+=len(line)
 elif any('curl.se/' in u for l in row['locators'] for u in l['urls']):
  terms=set()
  for a,ref in bindings:
   for e in a.get('evidence',[]):
    terms.update(re.findall(r'--[a-zA-Z][a-zA-Z0-9-]+',str(e.get('locator',''))+' '+str(e.get('stated_source_fact',''))))
  if not terms:row['limitations'].append('No frozen original CLI-option locator token available.');continue
  try:raw=source(h,path);tm=TextMap(raw)
  except (ValueError,TimeoutError) as ex:row['limitations'].append(type(ex).__name__);continue
  for term in sorted(terms):
   hit=tm.find(term)
   if not hit:row['limitations'].append({'missing_locator_token_sha256':sha(term.encode()),'reason':'No literal mapped original locator; not semantic regrading.'});continue
   aa,zz=governing(raw,hit[0],hit[1]);fragment(h,aa,zz,row['frozen_reviewer_refs'],'FROZEN_CLI_OPTION_LOCATOR_GOVERNING_ELEMENT',{'locator_token_sha256':sha(term.encode()),'parser':'stdlib HTMLParser visible-character offset map','governing_element_maximum_bytes':3072,'qualifier_limit':'Initial literal option occurrence may be an index; root must verify actual governing condition before retaining.'})
 if row['selection_ids']:row['necessity']='MINIMAL_PRIVATE_SUPPLEMENT_PROPOSED_ORIGINAL_CONDITIONS_PARTIAL'

# Finish bounded artifacts; no grading, deletion authorization, or completion claim.
allrows=list(ROWS.values());conditions=[]
for row in allrows:
 for ref in row['frozen_reviewer_refs']:
  ids=[s for s in row['selection_ids'] if ref in PRIVATE[s]['frozen_reviewer_refs']]
  conditions.append({'source_sha256':row['source_sha256'],'source_paths':row['source_paths'],'frozen_reviewer_ref':ref,'prior_coverage':row['prior_coverage'],'prior_approved_range_reference_count':len(row.get('prior_approved_literal_ranges',[])),'supplement_selection_ids':ids,'coverage_status':'LOCATED_LITERAL_COMPONENTS_ROOT_QUALIFIER_REVIEW_PENDING' if ids else row['necessity'],'immutable_alternative':row['immutable_alternative'],'unresolved_and_replay_limits':row['limitations'],'whole_assertion_coverage_verified':False,'semantic_grade_unchanged':True})
write('SELECTED_SUPPLEMENT.json',{'schema':'ER10_SELECTED_SUPPLEMENT_V1','selections':list(PRIVATE.values()),'located_not_materialized_components':PROPOSED,'derived_compaction_alternatives':COMPACTION,'immutable_alternatives':[{'source_sha256':r['source_sha256'],'reference':r['immutable_alternative']} for r in allrows if r['immutable_alternative']['status']!='NONE_ESTABLISHED'],'existing_root_private_transform_references':SPECIAL,'limits':CFG,'selected_source_objects':len(SELECTED_OBJECTS),'unique_fragments':len(FRAGMENTS),'deduplicated_private_fragment_bytes':sum(map(len,FRAGMENTS.values())),'archive_created':False,'source_cleanup_authorized':False,'public_source_quotation_added':False})
write('GAP_OBJECTS.json',{'schema':'ER10_RETENTION_GAP_OBJECTS_V1','objects':allrows,'working_assertion_objects':199,'closed_m16_assertion_bound_objects':sum('CLOSED_M16_BATCH009' in x['scopes'] for x in allrows),'closed_m16_metadata':M16_META,'unresolved_original_source_identity_links':UNRESOLVED_LINKS,'B9_manifest':{'path':str(manifest_path),'sha256':MANIFEST_SHA,'verified_commit_supplied_by_root':'415b8a478a89e7c6e9ac73ca0a6975a211809892','network_verification_here':False},'private_selection_implies_deletion_authorization':False})
write('ORIGINAL_ASSERTION_COVERAGE.json',{'schema':'ER10_ORIGINAL_ASSERTION_RETENTION_LINEAGE_V1','coverage':conditions,'unresolved_original_source_identity_links':UNRESOLVED_LINKS,'replay_limits':['Original scientific claims and grades are not re-audited.','Located literal components do not certify entire assertions or negative absence conditions.','A hash alone does not reconstruct a disappearing mutable body.','Versioned or immutable source alternatives preserve only their explicitly verified body or fields; API/HTML wrappers may change.','Later live scopes, unregistered source identities, and unmatched qualifiers remain HOLD.'],'raw_deletion_authorization':False})
oldreads=[]
if (OUT/'PARSER_READ_IDENTITIES.json').is_file():oldreads=load(OUT/'PARSER_READ_IDENTITIES.json')['reads']
with (OUT/'run-read-journal.jsonl').open('a') as journal:journal.write(json.dumps({'iteration':'bounded_selection_with_explicit_HOLD','reads':READS,'raw_bytes':TOTAL_RAW})+'\n')
write('READ_IDENTITIES.json',{'schema':'ER10_RETENTION_READ_IDENTITIES_V1','reads':READS,'prior_iterations':PREVIOUS_JOURNAL,'earlier_parser_probe_reads':oldreads,'raw_source_bytes':PREVIOUS_RAW+TOTAL_RAW,'raw_current_run_bytes':TOTAL_RAW,'frozen_snapshot_contains_author_documents':True,'reserve':RESERVE.isoformat(),'closed_at':now().isoformat(),'other_earlier_reads':'Actual AGENTS, packet sections 11-12 and exact listed metadata controls were read before this script; their identities are registered separately in README. No uncatalogued raw Source bodies were opened.'})
summary={'schema':'ER10_RETENTION_SUPPLEMENT_SUMMARY_V1','status':'PARTIAL_BOUNDED_COMPONENT_SELECTION_ROOT_REVIEW_REQUIRED','fixed_deadline':CFG['deadline'],'writing_reserve_begins':RESERVE.isoformat(),'working_assertion_referenced_objects':199,'old_assertion_objects':76,'old_root_approved_objects':44,'old_root_approved_ranges':222,'old_root_approved_unique_fragments':199,'old_root_approved_fragment_bytes':17010,'total_assertion_bound_objects':len(allrows),'closed_m16_assertion_bound_objects':sum('CLOSED_M16_BATCH009' in x['scopes'] for x in allrows),'selected_supplement_source_objects':len(SELECTED_OBJECTS),'selected_supplement_ranges':len(PRIVATE),'unique_supplement_fragments':len(FRAGMENTS),'deduplicated_private_supplement_bytes':sum(map(len,FRAGMENTS.values())),'raw_source_bytes_read_including_parser_probe':PREVIOUS_RAW+TOTAL_RAW,'original_reviewer_lineage_rows':len(conditions),'source_necessity_counts':dict(collections.Counter(x['necessity'] for x in allrows)),'objects_with_unresolved_limits':sum(bool(x['limitations']) for x in allrows),'located_not_materialized_components':len(PROPOSED),'derived_compaction_alternatives':len(COMPACTION),'unresolved_source_identity_links':len(UNRESOLVED_LINKS),'raw_source_deletion_authorized':False,'root_independent_fragment_and_qualifier_verification_required':True,'archive_created':False,'network_calls':0,'workers_started':0,'goals_created':0,'semantic_regrading':False,'campaign_completion_claimed':False,'cleanup_claimed':False}
write('SUMMARY.json',summary);write('RESULT.json',dict(summary,deliverables=['GAP_OBJECTS.json','SELECTED_SUPPLEMENT.json','ORIGINAL_ASSERTION_COVERAGE.json','READ_IDENTITIES.json','private/fragments','validate_supplement.py','README.md']))
print(json.dumps({k:summary[k] for k in ['status','total_assertion_bound_objects','closed_m16_assertion_bound_objects','selected_supplement_source_objects','selected_supplement_ranges','unique_supplement_fragments','deduplicated_private_supplement_bytes','raw_source_bytes_read_including_parser_probe','objects_with_unresolved_limits']}))
