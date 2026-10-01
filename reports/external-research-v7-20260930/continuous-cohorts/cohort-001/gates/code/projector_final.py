#!/usr/bin/env python3
"""Capture METHOD repair2. Host-only read gate; no network, Goal or runtime edits."""
import os,stat,json,re,hashlib,ipaddress
from pathlib import Path
from urllib.parse import urlsplit
TOOL='mcp__pm_boundary__public_https_get'
RUNTIME='298f125f395f38d15202a0b1d07ba0753130d547c56db6bfecdb0f509f40c8c4'
MAX_BODY=524288;MAX_LINE=4*1024*1024;MAX_FILE=64*1024*1024;MAX_RECORDS=4096
class Rejected(ValueError):pass
def require(ok):
 if not ok:raise Rejected('UNKNOWN: rejected shape, privacy, identity or byte predicate')
def sha(b):return hashlib.sha256(b).hexdigest()
def ident(v):
 require(isinstance(v,str) and re.fullmatch(r'[A-Za-z0-9_.:-]{1,160}',v) is not None);return v
def unique(pairs):
 d={}
 for k,v in pairs:require(k not in d);d[k]=v
 return d
def decode(b):
 return json.loads(b,object_pairs_hook=unique,parse_constant=lambda _:(_ for _ in ()).throw(Rejected('UNKNOWN')))
def url(v):
 require(isinstance(v,str) and 0<len(v)<=4096 and not any(ord(c)<33 for c in v) and '\\' not in v)
 p=urlsplit(v);h=p.hostname
 require(p.scheme=='https' and bool(h) and not p.username and not p.password and not p.fragment and not p.query and p.port in (None,443))
 require(h.lower()!='localhost' and not h.lower().endswith(('.localhost','.local','.internal')))
 try:address=ipaddress.ip_address(h)
 except ValueError:
  require(re.fullmatch(r'(?:[A-Za-z][A-Za-z0-9-]*\.)+[A-Za-z]{2,63}',h) is not None)
 else:require(address.is_global)
 return v

def get_result(v):
 if isinstance(v,list):
  require(len(v)==1 and isinstance(v[0],dict) and set(v[0])=={'type','text'} and v[0]['type']=='text');v=v[0]['text']
 require(isinstance(v,str) and len(v.encode('utf8'))<=MAX_LINE)
 # Fail closed, never redact/re-emit a sensitive rejected result.
 require(re.search(r'(?i)bearer\s|api[_-]?key|access[_-]?token|authorization|private[_-]?client|password|credential|\[redacted\]',v) is None)
 d=decode(v);require(isinstance(d,dict) and set(d)=={'url','status','bytes','sha256','text'})
 url(d['url']);require(type(d['status']) is int and 100<=d['status']<=599 and type(d['bytes']) is int and 0<=d['bytes']<=MAX_BODY and isinstance(d['text'],str))
 b=d['text'].encode('utf8');require(len(b)==d['bytes'] and sha(b)==d['sha256'])
 return d

def project(record,expected):
 """BODY only; actual request identity verified against independent native telemetry.
 Full request/body retention only; delta/tail/omitted/SDK substitutes unsupported.
 """
 require(isinstance(record,dict) and record.get('type')=='model_io' and not record.get('error'))
 for key in ('requestId','attempt','sessionId','turnId'):require(record.get(key)==expected[key])
 ident(record['requestId']);ident(record['sessionId']);ident(record['turnId']);require(type(record['attempt']) is int and record['attempt']>=1)
 model=record.get('model');require(isinstance(model,dict) and model.get('providerId')=='builtin:zai-coding-plan' and str(model.get('modelId')).lower()=='glm-5.3-flash')
 request=record.get('request');require(isinstance(request,dict))
 require(request.get('bodyMessagesKind') in (None,'full'))
 if 'bodyMessagesKind' in request:require(request.get('bodyMessageOffset')==0)
 body=request.get('body')
 if isinstance(body,str):body=decode(body)
 require(isinstance(body,dict) and isinstance(body.get('messages'),list));messages=body['messages']
 require(len(messages)<=2048)
 if 'bodyMessageCount' in request:require(type(request['bodyMessageCount']) is int and len(messages)==request['bodyMessageCount'])
 uses={};results={}
 for message in messages:
  if not isinstance(message,dict) or not isinstance(message.get('content'),list):continue
  for block in message['content']:
   if not isinstance(block,dict):continue
   if message.get('role')=='assistant' and block.get('type')=='tool_use' and block.get('name')==TOOL:
    i=ident(block.get('id'));inp=block.get('input');require(isinstance(inp,dict) and set(inp)=={'url'})
    use={'type':'tool_use','id':i,'name':TOOL,'input':{'url':url(inp['url'])}}
    require(i not in uses);uses[i]=use
   elif message.get('role')=='user' and block.get('type')=='tool_result':
    i=ident(block.get('tool_use_id'))
    if i not in uses:continue # unrelated tool content is never interpreted or emitted
    require(i not in results and block.get('is_error') is not True)
    results[i]={'type':'tool_result','tool_use_id':i,'content':get_result(block.get('content'))}
 require(uses and set(uses)==set(results))
 return {'identity':{k:record[k] for k in ('requestId','attempt','sessionId','turnId')},'get_pairs':[{'use':uses[i],'result':results[i]} for i in uses]}

def join(projected,events):
 require(isinstance(events,list) and len(events)<=MAX_RECORDS)
 identity=projected['identity'];models=[];groups={};seen_ids=set();seen_seq=set()
 for raw in events:
  if not isinstance(raw,dict) or raw.get('method')!='v4/telemetry/event':continue
  e=raw.get('params');require(isinstance(e,dict))
  if e.get('kind')=='model.request.status' and (e.get('requestId'),e.get('attempt'))==(identity['requestId'],identity['attempt']):
   require(e.get('sessionId')==identity['sessionId'] and e.get('providerId')=='builtin:zai-coding-plan' and str(e.get('modelId')).lower()=='glm-5.3-flash');models.append(e)
  if e.get('kind')!='tool.lifecycle' or (e.get('sessionId'),e.get('turnId'))!=(identity['sessionId'],identity['turnId']):continue
  if e.get('toolName')!=TOOL:continue
  ident(e.get('toolCallId'));ident(e.get('eventId'));require(type(e.get('eventSeq')) is int and e['eventSeq']>=0)
  require(e['eventId'] not in seen_ids and e['eventSeq'] not in seen_seq);seen_ids.add(e['eventId']);seen_seq.add(e['eventSeq'])
  groups.setdefault(e['toolCallId'],[]).append(e)
 statuses=[e.get('status') for e in models]
 require(statuses.count('model_request_started')==1 and statuses.count('model_request_completed')==1 and not any(x in statuses for x in ('model_request_failed','model_stream_stalled')))
 captures=[]
 for pair in projected['get_pairs']:
  i=pair['use']['id'];g=groups.get(i,[])
  require(len(g)==3 and [e.get('phase') for e in sorted(g,key=lambda e:e['eventSeq'])]==['scheduled','started','completed'])
  require(all(not e.get('errorCode') and not e.get('errorMessage') for e in g))
  body=pair['result']['content'];captures.append({'native_identity':identity,'tool_call_id':i,'tool_name':TOOL,'requested_url':pair['use']['input']['url'],'final_url':body['url'],'status':body['status'],'body':body['text'],'bytes':body['bytes'],'sha256':body['sha256'],'native_event_ids':[e['eventId'] for e in g],'source_eligible':200<=body['status']<=299,'semantic_acquisition':'UNKNOWN','candidate_consumption':'native BODY request exposure; not comprehension','completion_identity_join':'session/turn/toolCallId; request/attempt independently completed model telemetry'})
 return captures


def bounded_file(path,root,filename,metadata):
 """Exact selected quiescent regular file: metadata stability, NO private-file hash."""
 p=Path(path);r=Path(root)
 require(p.is_absolute() and r.is_absolute() and str(p)==str(r/filename) and p.name==filename)
 require(isinstance(metadata,dict) and set(metadata)=={'bytes','mtime_ns','inode','device'})
 require(all(type(v) is int and v>=0 for v in metadata.values()))
 require(not any(part.lower() in {'auth','headers','config','credentials','settings','.','..'} for part in p.parts))
 require(not any(x.is_symlink() for x in (p,*p.parents)))
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK)
 try:
  before=os.fstat(fd);require(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_uid==os.getuid() and before.st_size<=MAX_FILE)
  def stamp(st):return {'bytes':st.st_size,'mtime_ns':st.st_mtime_ns,'inode':st.st_ino,'device':st.st_dev}
  require(stamp(before)==metadata)
  chunks=[];total=0
  while True:
   part=os.read(fd,min(65536,MAX_FILE+1-total))
   if not part:break
   chunks.append(part);total+=len(part);require(total<=MAX_FILE)
  after=os.fstat(fd);require(stamp(before)==stamp(after))
  raw=b''.join(chunks);require(len(raw)==before.st_size)
  lines=raw.splitlines();require(len(lines)<=MAX_RECORDS and all(len(x)<=MAX_LINE for x in lines))
  return [decode(x.decode('utf8')) for x in lines if x.strip()]
 finally:os.close(fd)


def _capture(selection,acceptance):
 """Caller passes HOST gate objects. No unauthenticated CLI/raw-reader path.
 Independent reviewer controls acceptance; author may not create it for actual jobs.
 Gate binds exact code, exact selected path/metadata/request tuples and runtime hash. Source full-retention checked after the authorized projection read, never preasserted.
 """
 require(acceptance.get('schema')=='er7.capture_method_privacy_acceptance.v2' and acceptance.get('verdict')=='accepted' and acceptance.get('runtime_sha256')==RUNTIME and acceptance.get('projector_sha256')==sha(Path(__file__).read_bytes()) and acceptance.get('selection_sha256')==sha((json.dumps(selection,sort_keys=True,separators=(',',':'))+'\n').encode()) and acceptance.get('independent_source_shape_verified') is True and acceptance.get('authorized_selection_rule')=='exact-quiescent-job-modelio-native-identities-v1')
 require(selection.get('runtime_sha256')==RUNTIME and set(selection)=={'runtime_sha256','model_io','lifecycle','expected'})
 e=selection['expected'];require(set(e)=={'requestId','attempt','sessionId','turnId'})
 ident(e['requestId']);ident(e['turnId']);require(type(e['attempt']) is int and e['attempt']>=1)
 session=ident(e['sessionId']);filename='model-io-'+re.sub(r'[^a-zA-Z0-9_-]+','-',session).strip('-')[:80]+'.jsonl'
 m=selection['model_io'];l=selection['lifecycle'];require(set(m)==set(l)=={'path','root','metadata'})
 require(Path(l['path']).name=='zcode-stdout.redacted.jsonl')
 records=bounded_file(m['path'],m['root'],filename,m['metadata'])
 selected=[r for r in records if isinstance(r,dict) and (r.get('requestId'),r.get('attempt'))==(e['requestId'],e['attempt'])];require(len(selected)==1)
 projected=project(selected[0],e)
 events=bounded_file(l['path'],l['root'],'zcode-stdout.redacted.jsonl',l['metadata'])
 rows=join(projected,events)
 for row in rows:row['provenance']={'model_io_locator':filename,'public_get_projection_sha256':sha((json.dumps(projected,sort_keys=True,separators=(',',':'))+'\n').encode()),'private_file_hash_or_copy':False,'selection_sha256':acceptance['selection_sha256'],'projector_sha256':acceptance['projector_sha256'],'request_attempt_filename':ident(e['requestId'])+'.attempt-'+str(e['attempt'])+'.json'}
 return rows
def capture(selection,acceptance):
 try:return _capture(selection,acceptance)
 except Exception:raise Rejected('UNKNOWN: reader rejected; no raw details emitted') from None

if __name__=='__main__':raise SystemExit('HELD: no direct raw-reader CLI; independent exact selection/source/privacy acceptance required')
