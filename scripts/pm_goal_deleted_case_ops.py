"""Deterministic TEST_ONLY edits of frozen helper inputs; no frozen-file writes."""
import copy
import datetime
import hashlib
import pickle
import re
from collections import defaultdict


def at(value,path):
    for key in path:value=value[key]
    return value


def put(value,path,replacement):
    parent=at(value,path[:-1]);parent[path[-1]]=replacement


def nodes(value,path=()):
    yield path,value
    if isinstance(value,dict):
        for key,child in value.items():yield from nodes(child,path+(key,))
    elif isinstance(value,(list,tuple)):
        for key,child in enumerate(value):yield from nodes(child,path+(key,))


def typed_hash(value):
    def freeze(value):
        if isinstance(value,dict):return ('dict',tuple(sorted(((freeze(k),freeze(v))for k,v in value.items()),key=repr)))
        if isinstance(value,(list,tuple)):return (type(value).__name__,tuple(map(freeze,value)))
        return (type(value).__name__,value)
    return hashlib.sha256(pickle.dumps(freeze(value),protocol=5)).hexdigest()


def replacement(value,backward=False):
    if type(value)is bool:return not value
    if type(value)is int:return value-1 if value>0 else 1
    if type(value)is float:return value-1
    if value is None:return 'fixture-other'
    if type(value)is bytes:return value+b'x'
    if type(value)is str:
        if re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ',value):
            delta=datetime.timedelta(days=-3650 if backward else 3650)
            return (datetime.datetime.fromisoformat(value[:-1]+'+00:00')+delta).isoformat().replace('+00:00','Z')
        return value[:-1]+('1'if value[-1:]!='1'else'2') if value else 'fixture-other'
    if isinstance(value,list):return value+[copy.deepcopy(value[0])] if value else [None]
    if isinstance(value,dict):
        if not value:return {'fixture_extra':None}
        out=copy.deepcopy(value);first=next(iter(value));key=first[:-1]+('1'if first[-1:]!='1'else'2') if isinstance(first,str)else 'fixture_extra'
        if key in out:key='fixture_extra'
        out[key]=copy.deepcopy(value[first]);return out
    raise TypeError('unsupported edit leaf')


class Editor:
    def __init__(self,base,hash_functions):
        self.base=base;self.hash_functions=hash_functions;self.matches=defaultdict(list);self.hash_fields=defaultdict(list);self.old_digests={}
        for path,value in nodes(base):
            if isinstance(value,(dict,list)) and value:self.matches[typed_hash(value)].append(path)
            if type(value)is str and re.fullmatch('[0-9a-f]{64}',value):self.hash_fields[value].append(path)

    def edit(self,path,mode):
        value=copy.deepcopy(self.base);old=at(self.base,path);new=replacement(old,mode.endswith('backward'))
        edits={path}
        if mode.startswith('coherent'):
            for depth in range(1,len(path)):
                ancestor=at(self.base,path[:depth])
                if isinstance(ancestor,(dict,list)) and ancestor:
                    for other in self.matches[typed_hash(ancestor)]:edits.add(other+path[depth:])
        for edit in edits:put(value,edit,copy.deepcopy(new))
        if mode.startswith('coherent'):
            affected={p[:depth]for p in edits for depth in range(1,len(p))}
            for _ in range(4):
                repaired=False
                for parent in sorted(affected,key=lambda p:(len(p),repr(p)),reverse=True):
                    before,after=at(self.base,parent),at(value,parent)
                    if typed_hash(before)==typed_hash(after):continue
                    for name,function in self.hash_functions.items():
                        key=(parent,name)
                        if key not in self.old_digests:
                            try:self.old_digests[key]=function(before)
                            except Exception:self.old_digests[key]=None
                        old_hash=self.old_digests[key]
                        if not isinstance(old_hash,str) or old_hash not in self.hash_fields:continue
                        try:new_hash=function(after)
                        except Exception:continue
                        for slot in self.hash_fields[old_hash]:
                            if slot not in edits and at(value,slot)==old_hash and old_hash!=new_hash:
                                put(value,slot,new_hash);repaired=True
                                affected.update(slot[:depth]for depth in range(1,len(slot)))
                if not repaired:break
        return value


def source_edit(base,operation,builder,hash_functions):
    import base64
    value=copy.deepcopy(base);s=value['args'][0];events=[copy.deepcopy(f['event']) for f in s['frames']]
    if operation in ('source_duplicate_id','source_duplicate_idempotency','source_duplicate_sequence','source_hole'):
        event=copy.deepcopy(events[0]);event['sequence_id']=events[-1]['sequence_id']+1
        event['event_id']+='-other';event['idempotency_key']+='-other'
        if operation=='source_duplicate_id':event['event_id']=events[0]['event_id']
        if operation=='source_duplicate_idempotency':event['idempotency_key']=events[0]['idempotency_key']
        if operation=='source_duplicate_sequence':event['sequence_id']=events[0]['sequence_id']
        if operation=='source_hole':event['sequence_id']+=1
        events.append(event);value['args'][0]=builder(events);return value
    segment=s['segments'][0];blob=base64.b64decode(s['source_bytes_base64'])
    if operation=='source_watermark':segment['source_durable_end_offset']+=1
    elif operation=='source_digest':segment['source_durable_bytes_sha256']='0'*64
    elif operation=='source_count':segment['retained_event_count']+=1
    elif operation=='source_ends':segment['last_sequence_id']+=1
    elif operation=='source_second_segment':s['segments'].append(copy.deepcopy(segment))
    elif operation=='source_trailing_byte':
        blob+=b'\x00';segment['source_durable_end_offset']+=1;segment['scanned_through_offset']+=1
        segment['source_durable_bytes_sha256']=hashlib.sha256(blob).hexdigest();s['source_bytes_base64']=base64.b64encode(blob).decode()
    elif operation=='source_frame_gap':
        point=s['frames'][1]['byte_offset'];blob=blob[:point]+b'\x00'+blob[point:]
        for frame in s['frames'][1:]:frame['byte_offset']+=1;frame['frame_end_offset']+=1
        segment['source_durable_end_offset']+=1;segment['scanned_through_offset']+=1
        segment['source_durable_bytes_sha256']=hashlib.sha256(blob).hexdigest();s['source_bytes_base64']=base64.b64encode(blob).decode()
    else:raise ValueError('unknown source edit: '+operation)
    m=s['manifest'];m['retained_inventory']=copy.deepcopy(s['segments']);m['excluded_ranges']=copy.deepcopy(s['sequence_gaps'])
    b=s['source_selection'];b['current_bytes_sha256']=hash_functions['mpdig'](s['current']);b['manifest_bytes_sha256']=hash_functions['mpdig'](m)
    for field,key in [('retained_inventory_sha256','retained_inventory'),('durable_watermarks_sha256','durable_watermarks'),('excluded_ranges_sha256','excluded_ranges'),('retired_inputs_sha256','retired_inputs')]:b[field]=hash_functions['bdig'](m[key])
    return value
