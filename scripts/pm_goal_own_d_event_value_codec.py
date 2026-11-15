"""UNAPPROVED external SeglogFrameV2 wire candidate. No filesystem effects."""
import struct, math, zlib, functools
from dataclasses import dataclass
MAGIC=b'PMSEGR2\0';PREFIX=48;MAX_HEADER=4096;MAX_PAYLOAD=16777216;U64=(1<<64)-1
LAYOUT=struct.Struct('<8sBHIBQQIIII')
assert LAYOUT.size==PREFIX
HEADER_FIELDS=('event_id','event_type','schema_id','schema_version','payload_schema_id','scope_kind','project_id')
class WireError(ValueError):
 def __init__(self,code):self.code=code;super().__init__(code)
class Corrupt(WireError):pass
class Unsupported(WireError):pass
class AdmissionRefused(WireError):pass
class ResourceUnavailable(WireError):pass
def resource_guard(fn):
 @functools.wraps(fn)
 def wrapped(*a,**kw):
  try:return fn(*a,**kw)
  except (MemoryError,RecursionError)as e:raise ResourceUnavailable('resource_unavailable')from e
 return wrapped
def need(ok,code,kind=Corrupt):
 if not ok:raise kind(code)
def uint(n,bits,name):need(type(n)is int and 0<=n<(1<<bits),name,AdmissionRefused);return n
def crc(data):return zlib.crc32(data)&0xffffffff
def crc_reference(data):
 c=0xffffffff
 for b in data:
  c^=b
  for _ in range(8):c=(c>>1)^(0xedb88320 if c&1 else 0)
 return c^0xffffffff
def _lenprefix(n,fix,limit,codes,widths):
 if n<limit:return bytes([fix+n])
 for code,w in zip(codes,widths):
  if n<1<<(8*w):return bytes([code])+n.to_bytes(w,'big')
 raise AdmissionRefused('messagepack_length_unrepresentable')
@resource_guard
def pack(value,max_bytes=None):
 """JSON-value MessagePack; no numeric/string coercion, no recursion depth cap."""
 out=bytearray();tasks=[('value',value)];active=set()
 while tasks:
  op,v=tasks.pop()
  if op=='exit':active.remove(v);continue
  if v is None:out+=b'\xc0'
  elif type(v)is bool:out+=b'\xc3'if v else b'\xc2'
  elif type(v)is int:
   need(-(1<<63)<=v<=U64,'numeric_unrepresentable',AdmissionRefused)
   if 0<=v<128:out.append(v)
   elif -32<=v<0:out.append(v&255)
   else:
    signed=v<0
    for size,code in zip((1,2,4,8),(0xd0,0xd1,0xd2,0xd3)if signed else(0xcc,0xcd,0xce,0xcf)):
     if (-(1<<(8*size-1))<=v<(1<<(8*size-1)))if signed else(v<1<<(8*size)):
      out.append(code);out+=v.to_bytes(size,'big',signed=signed);break
  elif type(v)is float:
   need(math.isfinite(v),'nonfinite_float',AdmissionRefused)
   try:small=struct.pack('>f',v);short=struct.unpack('>f',small)[0]==v
   except OverflowError:short=False
   out+=(b'\xca'+small)if short else(b'\xcb'+struct.pack('>d',v))
  elif type(v)is str:
   try:b=v.encode('utf-8','strict')
   except UnicodeError:raise AdmissionRefused('invalid_utf8')
   out+=_lenprefix(len(b),0xa0,32,(0xd9,0xda,0xdb),(1,2,4));out+=b
  elif type(v)in (list,dict):
   need(id(v)not in active,'cyclic_value',AdmissionRefused);active.add(id(v));tasks.append(('exit',id(v)))
   if type(v)is list:
    out+=_lenprefix(len(v),0x90,16,(0xdc,0xdd),(2,4));tasks.extend(('value',x)for x in reversed(v))
   else:
    need(all(type(k)is str for k in v),'nonstring_map_key',AdmissionRefused)
    try:keys=sorted(v,key=lambda k:k.encode('utf-8','strict'))
    except UnicodeError:raise AdmissionRefused('invalid_utf8')
    out+=_lenprefix(len(v),0x80,16,(0xde,0xdf),(2,4))
    for k in reversed(keys):tasks.extend([('value',v[k]),('value',k)])
  else:raise AdmissionRefused('unsupported_json_value_or_exact_numeric')
  need(max_bytes is None or len(out)<=max_bytes,'encoded_size_cap',AdmissionRefused)
 return bytes(out)
@resource_guard
def unpack(data):
 """Iterative, bounded by actual bytes; declared counts never preallocate arrays."""
 data=memoryview(data);pos=0;stack=[];result=None;have=False
 def take(n):
  nonlocal pos
  need(n<=len(data)-pos,'messagepack_truncated');b=bytes(data[pos:pos+n]);pos+=n;return b
 def length(n):return int.from_bytes(take(n),'big')
 def attach(v):
  nonlocal result,have
  while True:
   if not stack:need(not have,'messagepack_trailing');result=v;have=True;return
   f=stack[-1]
   if f['kind']=='map':
    if f['key']is None:
     need(type(v)is str,'nonstring_map_key');b=v.encode();need(f['last']is None or f['last']<b,'duplicate_or_unordered_map_key');f['last']=b;f['key']=v;return
    f['value'][f['key']]=v;f['key']=None
   else:f['value'].append(v)
   f['remaining']-=1
   if f['remaining']:return
   stack.pop();v=f['value']
 while pos<len(data)and not have:
  c=take(1)[0];container=None
  if c<128:v=c
  elif c>=224:v=c-256
  elif 0xa0<=c<=0xbf:v=take(c-0xa0).decode('utf-8','strict')
  elif 0x90<=c<=0x9f:container=('array',c-0x90)
  elif 0x80<=c<=0x8f:container=('map',c-0x80)
  elif c==0xc0:v=None
  elif c in (0xc2,0xc3):v=c==0xc3
  elif c in (0xcc,0xcd,0xce,0xcf):v=length({0xcc:1,0xcd:2,0xce:4,0xcf:8}[c])
  elif c in (0xd0,0xd1,0xd2,0xd3):v=int.from_bytes(take({0xd0:1,0xd1:2,0xd2:4,0xd3:8}[c]),'big',signed=True)
  elif c in (0xca,0xcb):v=struct.unpack('>f'if c==0xca else'>d',take(4 if c==0xca else 8))[0];need(math.isfinite(v),'nonfinite_float')
  elif c in (0xd9,0xda,0xdb):v=take(length({0xd9:1,0xda:2,0xdb:4}[c])).decode('utf-8','strict')
  elif c in (0xdc,0xdd):container=('array',length(2 if c==0xdc else 4))
  elif c in (0xde,0xdf):container=('map',length(2 if c==0xde else 4))
  else:raise Corrupt('messagepack_non_json_tag')
  if container:
   kind,n=container;need(n<=(len(data)-pos)//(2 if kind=='map'else 1),'messagepack_impossible_count');v={}if kind=='map'else[]
   if n:stack.append(dict(kind=kind,value=v,remaining=n,key=None,last=None));continue
  attach(v)
 need(have and not stack and pos==len(data),'messagepack_truncated_or_trailing')
 need(pack(result)==bytes(data),'messagepack_noncanonical');return result
def header(event):return [1]+[event[k]for k in HEADER_FIELDS]
def prefix(version,header_len,payload_len,flags,generation,sequence,header_crc,payload_crc,reserved=0):
 p=LAYOUT.pack(MAGIC,version,header_len,payload_len,flags,generation,sequence,header_crc,payload_crc,0,reserved)
 return p[:40]+struct.pack('<I',crc(p))+p[44:]
@resource_guard
def encode(event,generation,validate_event):
 uint(generation,64,'generation_u64');uint(event.get('sequence_id'),64,'sequence_u64');validate_event(event)
 need(event['schema_id']=='pm.event.v0'and event['schema_version']=='2.0.0','new_writer_event_version',AdmissionRefused)
 need(event['replay_policy']!='projector_replay_only','replay_only_not_appendable',AdmissionRefused)
 h=pack(header(event),MAX_HEADER);payload=pack(event,MAX_PAYLOAD)
 return prefix(2,len(h),len(payload),0,generation,event['sequence_id'],crc(h),crc(payload))+h+payload
@dataclass(frozen=True)
class Frame:
 start:int
 end:int
 generation:int
 sequence:int
 header:object
 event:object
 raw_payload:bytes

@resource_guard
def decode(data,offset,generation,last_sequence,validate_event,seen=None,trace=None):
 """Pure candidate decode. Unsupported admission never becomes a resync hole."""
 trace=[]if trace is None else trace
 uint(generation,64,'expected_generation_u64')
 if last_sequence is not None:uint(last_sequence,64,'prior_sequence_u64')
 need(type(offset)is int and 0<=offset<=len(data),'offset_bounds')
 trace.append('magic');need(data[offset:offset+8]==MAGIC,'magic')
 trace.append('prefix_crc');need(len(data)-offset>=PREFIX,'prefix_truncated');p=data[offset:offset+PREFIX];v=LAYOUT.unpack(p);_,ver,hn,pn,flags,gen,seq,hc,pc,pcrc,reserved=v
 need(crc(p[:40]+b'\0'*4+p[44:])==pcrc,'prefix_crc')
 trace.append('version_reserved');need(ver==2,'unsupported_frame_version',Unsupported);need(reserved==0,'reserved_nonzero');need(flags==0,'unsupported_flags',Unsupported)
 trace.append('caps_file_bounds');need(hn<=MAX_HEADER and pn<=MAX_PAYLOAD,'frame_caps');need(hn<=len(data)-offset-PREFIX and pn<=len(data)-offset-PREFIX-hn,'frame_truncated');end=offset+PREFIX+hn+pn
 trace.append('generation_sequence');need(gen==generation,'generation_mismatch');need(last_sequence is None or seq>last_sequence,'sequence_not_strict')
 hbytes=data[offset+PREFIX:offset+PREFIX+hn];payload=data[offset+PREFIX+hn:end]
 trace.append('header_crc_decode');need(crc(hbytes)==hc,'header_crc')
 try:h=unpack(hbytes)
 except UnicodeError:raise Corrupt('header_invalid_utf8')
 need(type(h)is list and len(h)>=1 and type(h[0])is int,'header_dispatch_shape');need(h[0]==1,'unsupported_header_version',Unsupported)
 need(len(h)==8,'header_tuple_arity');need(all(type(x)is str and x for x in h[1:7])and(h[7]is None or(type(h[7])is str and h[7])),'header_tuple_types')
 trace.append('payload_crc');need(crc(payload)==pc,'payload_crc')
 trace.append('decompression_bounds');need(flags==0,'unsupported_compression',Unsupported) # Identity transform, same 16 MiB cap.
 trace.append('event_schema')
 try:e=unpack(payload)
 except UnicodeError:raise Corrupt('payload_invalid_utf8')
 need(type(e)is dict,'event_map');need(type(e.get('schema_id'))is str and bool(e.get('schema_id')) and type(e.get('schema_version'))is str and bool(e.get('schema_version')),'event_schema');need(e.get('schema_id')=='pm.event.v0'and e.get('schema_version')=='2.0.0','unsupported_event_version',Unsupported)
 validate_event(e)
 trace.append('duplicate_identity_crosscheck');need(header(e)==h and type(e['sequence_id'])is int and e['sequence_id']==seq,'duplicate_header_envelope_identity')
 if seen is not None:need(e['event_id']not in seen,'duplicate_event_id')
 return Frame(offset,end,gen,seq,h,e,bytes(payload))

@resource_guard
def resync(data,start,generation,last_sequence,validate_event,seen=None):
 """Return first fully validated candidate or None. Never edit bytes or cursors."""
 need(type(start)is int and 0<=start<=len(data),'resync_start_bounds',AdmissionRefused)
 for offset in range(start,len(data)):
  if data[offset:offset+8]!=MAGIC:continue
  try:return decode(data,offset,generation,last_sequence,validate_event,seen)
  except Corrupt:continue
 return None

def trustworthy_next(data,offset,generation,last_sequence):
 """Validate only the current-profile prefix's boundary authority."""
 if data[offset:offset+8]!=MAGIC or len(data)-offset<PREFIX:return None
 p=data[offset:offset+PREFIX];_,ver,hn,pn,flags,gen,seq,hc,pc,pcrc,reserved=LAYOUT.unpack(p)
 if crc(p[:40]+b'\0'*4+p[44:])!=pcrc:return None
 need(ver==2,'unsupported_frame_version',Unsupported);need(flags==0,'unsupported_flags',Unsupported)
 if reserved!=0 or hn>MAX_HEADER or pn>MAX_PAYLOAD:return None
 if hn>len(data)-offset-PREFIX or pn>len(data)-offset-PREFIX-hn:return None
 if gen!=generation or (last_sequence is not None and seq<=last_sequence):return None
 return offset+PREFIX+hn+pn

@resource_guard
def loss_range(data,failed_offset,generation,last_sequence,validate_event,seen=None):
 """Prove corruption, then next-boundary validation or exact bytewise resync.
 No watermark disposition, cursor advance, quarantine, mutation or repair.
 """
 try:decode(data,failed_offset,generation,last_sequence,validate_event,seen)
 except Corrupt:pass
 else:raise AdmissionRefused('valid_frame_not_loss')
 nxt=trustworthy_next(data,failed_offset,generation,last_sequence)
 if nxt is not None and nxt<len(data):
  try:candidate=decode(data,nxt,generation,last_sequence,validate_event,seen)
  except Corrupt:pass
  else:return (failed_offset,nxt),candidate
 candidate=resync(data,failed_offset+1,generation,last_sequence,validate_event,seen)
 return (failed_offset,candidate.start if candidate is not None else len(data)),candidate
