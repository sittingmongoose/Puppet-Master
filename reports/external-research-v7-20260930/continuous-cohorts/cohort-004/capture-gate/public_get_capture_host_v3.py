"""Trusted owned-quiescent GET capture selection and strict native-identity dedup."""
import argparse, hashlib, importlib.util, json, os, pathlib, re, stat, time
LAB=pathlib.Path(__file__).absolute().parents[2]
GUARD_PATH=LAB/'ops/whole_freeze_delivery_v2.py'
if hashlib.sha256(GUARD_PATH.read_bytes()).hexdigest()!='7f6f8a2bfc2c50172cc00541238c6951459300f23a0905a2eabe5c779f6ce844':raise ValueError('accepted guard source drift')
SPEC=importlib.util.spec_from_file_location('er7_whole_guard',GUARD_PATH)
GUARD=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(GUARD)
TOOL='mcp__pm_boundary__public_https_get'
RUNTIME='298f125f395f38d15202a0b1d07ba0753130d547c56db6bfecdb0f509f40c8c4'
PRIVACY_SHA='ac130e16b57409ccdf05fc1066bd02a19e2a3def8a181e5293709cb6e7374e66'
PROJECTOR_SHA='5a9894290471a1947964c9c9c47699a5f48ed08a3b949c3bb18f908097a622e4'
PROJECTOR_PATH=LAB/'dev/z-mcp-acquisition-capture-v2/projector_final.py'
def canonical(v):return (json.dumps(v,sort_keys=True,separators=(',',':'))+'\n').encode()
def ident(v):
 if not isinstance(v,str) or re.fullmatch(r'[A-Za-z0-9_.:-]{1,160}',v) is None:raise ValueError('invalid native identity')
 return v
def metadata(path):
 p=GUARD.safe(path);s=p.stat()
 if s.st_uid!=os.getuid():raise ValueError('owned file required')
 return {'bytes':s.st_size,'mtime_ns':s.st_mtime_ns,'inode':s.st_ino,'device':s.st_dev}
MAX_NATIVE_BYTES=512*1024*1024
MAX_LINE=4*1024*1024
MAX_NATIVE_LINES=262144
MAX_IDENTITY_EVENTS=4096
MAX_DERIVED_BYTES=64*1024*1024
class Unknown(ValueError):pass
def require(ok):
 if not ok:raise Unknown('UNKNOWN: rejected sanitized native metadata or admission')
def decode(line):
 return json.loads(line,object_pairs_hook=GUARD.unique,parse_constant=lambda _:(_ for _ in ()).throw(Unknown('UNKNOWN')))
def stamp(st):
 return {'bytes':st.st_size,'mtime_ns':st.st_mtime_ns,'inode':st.st_ino,'device':st.st_dev}
def native_identity_projection(path,root,session):
 """Stream only the exact named sanitized native file; never raw private-client data.
 Retain all model status rows, including wrong-session/provider rows, so failed or
 inconsistent request identity cannot become a success by filtering. Tool rows
 are only exact publicGET lifecycle rows; no arguments, results or error text.
 """
 p=pathlib.Path(path);r=GUARD.safe(root,'dir')
 require(p.is_absolute() and p==r/'zcode-stdout.redacted.jsonl')
 GUARD.safe(p)
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK)
 try:
  before=os.fstat(fd)
  require(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_uid==os.getuid() and before.st_size<=MAX_NATIVE_BYTES)
  events=[];total=0;line_count=0;derived=0
  with os.fdopen(fd,'rb',closefd=False) as stream:
   while True:
    line=stream.readline(MAX_LINE+1)
    if not line:break
    total+=len(line);line_count+=1
    require(total<=MAX_NATIVE_BYTES and len(line)<=MAX_LINE and line_count<=MAX_NATIVE_LINES)
    # Complete records only. A partial final line cannot silently disappear.
    require(line.endswith(b'\n'))
    if not line.strip():continue
    row=decode(line.decode('utf8'));require(isinstance(row,dict))
    if row.get('method')!='v4/telemetry/event':continue
    e=row.get('params');require(isinstance(e,dict))
    kind=e.get('kind')
    if kind=='model.request.status':
     # Absence stays absence; projector checks provider/status/session validity.
     out={k:e[k] for k in ('kind','sessionId','turnId','requestId','attempt','providerId','modelId','status') if k in e}
     ident(e.get('requestId'));require(type(e.get('attempt')) is int and e['attempt']>=1)
     for k in ('sessionId','turnId','providerId','modelId','status'):
      if k in e and e[k] is not None:ident(e[k])
    elif kind=='tool.lifecycle' and e.get('toolName')==TOOL:
     out={k:e[k] for k in ('kind','sessionId','turnId','toolCallId','toolName','eventId','eventSeq','phase') if k in e}
     for k in ('sessionId','turnId','toolCallId','eventId'):ident(e.get(k))
     require(type(e.get('eventSeq')) is int and e['eventSeq']>=0)
     if 'phase' in e and e['phase'] is not None:ident(e['phase'])
    else:continue
    # Presence and truthiness are sufficient for accepted projector eligibility.
    for k in ('errorCode','errorMessage'):
     if k in e:out[k]=bool(e[k])
    projected={'method':'v4/telemetry/event','params':out}
    size=len(canonical(projected));derived+=size
    require(len(events)<MAX_IDENTITY_EVENTS and derived<=MAX_DERIVED_BYTES)
    events.append(projected)
  after=os.fstat(fd)
  GUARD.safe(p)
  require(stat.S_ISREG(after.st_mode) and after.st_nlink==1 and after.st_uid==os.getuid())
  require(stamp(before)==stamp(after) and total==before.st_size and stamp(p.lstat())==stamp(before))
  return events,{'path':str(p),'root':str(r),'metadata':stamp(before),'streamed_bytes':total,'streamed_lines':line_count,'identity_events':len(events),'derived_bytes':derived,'private_file_hash_or_copy':False}
 finally:os.close(fd)
def write_identity(events,destination):
 destination=pathlib.Path(destination).absolute();GUARD.safe(destination.parent,'dir')
 destination.mkdir(mode=0o700)
 path=destination/'zcode-stdout.redacted.jsonl'
 with path.open('xb') as out:
  for event in events:out.write(canonical(event))
 path.chmod(0o400);destination.chmod(0o500)
 return path,metadata(path)
def admission_binding(host,integrity,receipt,admission,cfg):
 cfgsha=admission['method_config']['sha256']
 require(receipt.get('accepted_method_sha256')==cfgsha)
 pre=GUARD.load(host/'preflight.json')
 require(pre.get('method_config_sha256')==cfgsha and pre.get('method_review_sha256')==admission.get('method_review',{}).get('sha256') and pre.get('canary_review_sha256')==admission.get('canary_review',{}).get('sha256'))
 authority_ref=pre.get('root_authority');require(isinstance(authority_ref,dict) and set(authority_ref)=={'path','sha256'})
 authority=GUARD.pinned(authority_ref['path'],authority_ref['sha256'])
 require(authority.get('schema')=='er7.prospective.z.queue.authority.v1' and authority.get('status')=='authorized')
 matches=[x for x in authority.get('components',[]) if x.get('label')==host.name and x.get('method_config_sha256')==cfgsha and x.get('method_review_sha256')==pre['method_review_sha256']]
 require(len(matches)==1)
 return {'root_authority_sha256':authority_ref['sha256'],'method_config_sha256':cfgsha,'accepted_method_sha256':receipt['accepted_method_sha256']}
def deduplicate(rows):
 unique={};conflicts=set()
 for row in rows:
  key=(ident(row['native_identity']['sessionId']),ident(row['native_identity']['turnId']),ident(row['tool_call_id']))
  value={k:row[k] for k in ('tool_name','requested_url','final_url','status','body','bytes','sha256','source_eligible')}
  # Same native operation must have identical public bytes and lifecycle IDs.
  value['native_event_ids']=sorted(ident(x) for x in row['native_event_ids'])
  if key in unique and canonical(unique[key]['value'])!=canonical(value):conflicts.add(key)
  else:unique.setdefault(key,{'value':value,'captures':[]})['captures'].append(row)
 return [{'native_identity':{'sessionId':k[0],'turnId':k[1]},'tool_call_id':k[2],**v['value'],'exposure_count':len(v['captures']),'exposure_request_attempts':[{'requestId':x['native_identity']['requestId'],'attempt':x['native_identity']['attempt'],'projection_sha256':x['provenance']['public_get_projection_sha256'],'selection_sha256':x['provenance']['selection_sha256']} for x in v['captures']]} for k,v in unique.items() if k not in conflicts],len(conflicts)
def _capture_job(host,gate_path,gate_sha,destination):
 began=time.monotonic();host=GUARD.safe(host,'dir')
 if host.parent!=LAB/'ops/productive-z-v1':raise ValueError('owned campaign job required')
 integrity=GUARD.load(host/'output-integrity.json');receipt=GUARD.quiet(host,integrity)
 admission=GUARD.load(host/'host-admission.json')
 if receipt.get('runtime_snapshot_sha256')!=RUNTIME or admission.get('runtime_snapshot_sha256')!=RUNTIME or integrity.get('label')!=host.name or admission.get('attempt',{}).get('label')!=host.name:raise ValueError('actual owned runtime/label mismatch')
 cfg=GUARD.pinned(admission['method_config']['path'],admission['method_config']['sha256'])
 if cfg.get('runtime_snapshot_sha256')!=RUNTIME or cfg.get('attempt')!=admission.get('attempt') or cfg.get('attempt',{}).get('label')!=host.name:raise ValueError('actual exact owned config mismatch')
 bindings=admission_binding(host,integrity,receipt,admission,cfg)
 if receipt.get('inventory_check',{}).get('verified') is not True or integrity.get('future_native_context')!='qualified':raise ValueError('native/context qualification required')
 if gate_sha!=PRIVACY_SHA:raise ValueError('accepted privacy source pin required')
 gate=GUARD.pinned(gate_path,gate_sha)
 if gate.get('schema')!='er7.capture_method_privacy_gate.v2.final' or gate.get('verdict')!='accepted' or gate.get('runtime_snapshot_sha256')!=RUNTIME or gate.get('authorized_selection_rule')!='exact-quiescent-job-modelio-native-identities-v1' or gate.get('raw_private_hash_or_output') is not False:raise ValueError('exact privacy gate required')
 code=pathlib.Path(gate['projector_path'])
 if code!=PROJECTOR_PATH or gate['projector_sha256']!=PROJECTOR_SHA or GUARD.sha(GUARD.raw(code))!=PROJECTOR_SHA:raise ValueError('projector drift')
 session=ident(receipt['session_id']);native=host/'native';lifecycle=native/'zcode-stdout.redacted.jsonl'
 events,native_proof=native_identity_projection(lifecycle,native,session)
 # Derived identity file is exclusive to this own host and never overwrites original.
 derived_root=host/'sanitized-identity-capture-v3'
 derived_lifecycle,life_metadata=write_identity(events,derived_root)
 requests={};turns=set();calls={}
 for row in events:
  if row.get('method')!='v4/telemetry/event':continue
  e=row.get('params',{})
  if e.get('sessionId')!=session:continue
  if e.get('kind')=='model.request.status' and e.get('status')=='model_request_completed':
   rid=ident(e['requestId']);attempt=e['attempt']
   if type(attempt) is not int or attempt<1:raise ValueError('invalid native attempt')
   requests[(rid,attempt)]=ident(e['turnId']) if e.get('turnId') else None
  if e.get('kind')=='tool.lifecycle' and e.get('toolName')==TOOL:
   turn=ident(e['turnId']);cid=ident(e['toolCallId']);turns.add(turn);calls.setdefault((turn,cid),[]).append(e.get('phase'))
 if len(requests)>160 or len(turns)>16:raise ValueError('selection tuple cap')
 model_root=native/'private-client/storage/cli/rollout'
 filename='model-io-'+re.sub(r'[^a-zA-Z0-9_-]+','-',session).strip('-')[:80]+'.jsonl'
 model=model_root/filename
 model_metadata=metadata(model)
 selection_base={'runtime_sha256':RUNTIME,'model_io':{'path':str(model),'root':str(model_root),'metadata':model_metadata},'lifecycle':{'path':str(derived_lifecycle),'root':str(derived_root),'metadata':life_metadata}}
 s=importlib.util.spec_from_file_location('er7_public_only_projector',code);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
 rows=[];rejected=0;selections=[]
 for (rid,attempt),known_turn in requests.items():
  for turn in ([known_turn] if known_turn else sorted(turns)):
   selection={**selection_base,'expected':{'requestId':rid,'attempt':attempt,'sessionId':session,'turnId':turn}}
   selected_sha=GUARD.sha(canonical(selection))
   acceptance={'schema':'er7.capture_method_privacy_acceptance.v2','verdict':'accepted','runtime_sha256':RUNTIME,'projector_sha256':gate['projector_sha256'],'selection_sha256':selected_sha,'independent_source_shape_verified':gate['independent_source_shape_verified'],'authorized_selection_rule':gate['authorized_selection_rule']}
   try:projected=m.capture(selection,acceptance);rows.extend(projected);status='public-projection-joined'
   except m.Rejected:rejected+=1;status='unknown-rejected-no-private-details'
   selections.append({'expected':selection['expected'],'selection_sha256':selected_sha,'status':status})
 unique,conflicts=deduplicate(rows)
 destination=pathlib.Path(destination).absolute();GUARD.safe(destination.parent,'dir');destination.mkdir(mode=0o700)
 public_rows=[];ineligible=0
 for i,row in enumerate(unique,1):
  if row['source_eligible'] is not True:ineligible+=1;continue
  body=row.pop('body').encode('utf8')
  if GUARD.sha(body)!=row['sha256'] or len(body)!=row['bytes']:raise ValueError('dedup byte mismatch')
  p=destination/f'S{i:03d}.txt'
  with p.open('xb') as f:f.write(body)
  p.chmod(0o400);public_rows.append({**row,'file':p.name,'kind':'actual native public GET completed identity plus exact public BODY bytes; semantic acquisition unknown'})
 result={'schema':'er7.actual_public_get_capture.v1','capture_repair':'second-successive-v3','admission_bindings':bindings,'original_sanitized_native_metadata':native_proof,'derived_identity_metadata':life_metadata,'source_ineligible_completions_excluded':ineligible,'host_label':integrity['label'],'native_receipt_sha256':GUARD.sha(GUARD.raw(native/'receipt.json')),'privacy_gate_sha256':gate_sha,'projector_sha256':gate['projector_sha256'],'wrapper_sha256':GUARD.sha(GUARD.raw(__file__)),'public_sources':public_rows,'unique_joined_public_get_completions':len(public_rows),'completed_native_get_identity_count':sum(v==['scheduled','started','completed'] for v in calls.values()),'conflicting_native_identities':conflicts,'rejected_selection_tuples':rejected,'selection_tuple_records':selections,'actual_source_eligibility':'partial-or-unknown' if rejected or conflicts or ineligible else 'joined-public-captures-only','semantic_acquisition':'unknown pending independent current-before-history grading','private_file_hash_or_copy':False,'projection_seconds':time.monotonic()-began}
 p=destination/'capture.json'
 with p.open('x') as f:f.write(json.dumps(result,indent=2)+'\n')
 p.chmod(0o400);destination.chmod(0o500)
 return {'path':str(p),'sha256':GUARD.sha(GUARD.raw(p,True)),'source_count':len(public_rows),'private_file_hash_or_copy':False}
def capture_job(host,gate_path,gate_sha,destination):
 try:return _capture_job(host,gate_path,gate_sha,destination)
 except Exception:raise Unknown('UNKNOWN: host capture rejected; no raw details emitted') from None
if __name__=='__main__':
 p=argparse.ArgumentParser()
 for k in ('host','gate','gate-sha256','destination'):p.add_argument('--'+k,required=True)
 a=p.parse_args();print(json.dumps(capture_job(a.host,a.gate,a.gate_sha256,a.destination)))
