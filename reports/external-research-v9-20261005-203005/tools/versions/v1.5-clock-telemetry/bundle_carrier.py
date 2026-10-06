"""DEC010 strict B mechanical delivery: native selection, exact bytes, one commit.

No model, source interpretation, fallback catalog, semantic merge or Goal update.
Callbacks reuse the admitted boundary's confined reads/writes/receipt namespace.
"""
import ctypes
import datetime
import hashlib
import json
import math
import os
from pathlib import PurePosixPath, Path
import re
import stat
import time
import uuid

MAX_BYTES=524288
MAX_OUTPUT=16777216
MAX_MANIFEST=65536
NAMES=('proposal.md','sources.json','witnesses.json','leads.json')
SCHEMA='er9.native_endorsed_delivery.v1'
PROFILE_SCHEMA='er9.bundle-carrier.profile.v1'
MANIFEST_SCHEMA='er9.native-role-reference-closure.v1'
ID=re.compile(r'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$')

def sha(raw):return hashlib.sha256(raw).hexdigest()

def strict_json(raw):
    def pairs(values):
        out={}
        for k,v in values:
            if k in out:raise ValueError('duplicate JSON key')
            out[k]=v
        return out
    def constant(_):raise ValueError('non-JSON numeric constant')
    return json.loads(raw.decode('utf-8'),object_pairs_hook=pairs,parse_constant=constant)

def encoded(value):return json.dumps(value,ensure_ascii=False,allow_nan=False,sort_keys=True,separators=(',',':')).encode('utf-8')

def relative(path,root):
    if not isinstance(path,str) or not path or '\\' in path or '\x00' in path:raise ValueError('canonical relative path required')
    p=PurePosixPath(path)
    if p.is_absolute() or '..' in p.parts or str(p)!=path or p.parts[0]!=root:raise ValueError('path outside declared namespace')
    return p

def validate_profile(profile):
    keys={'schema','final_role_enabled','stage_id','stage_role','case_id','arm_id','bundle_path','commit_dir','allowed_outputs','import_manifest','actor_binding','method_factors'}
    if not isinstance(profile,dict) or set(profile)!=keys or profile['schema']!=PROFILE_SCHEMA or profile['final_role_enabled'] is not True:raise ValueError('explicit final-role operator profile required')
    for k in ('stage_id','stage_role','case_id','arm_id'):
        if not isinstance(profile[k],str) or not ID.fullmatch(profile[k]):raise ValueError('bounded stage identity required')
    factors=profile['method_factors']
    if not isinstance(factors,list) or len(factors)>16 or any(not isinstance(x,str) or not re.fullmatch(r'V(?:0[1-9]|1[0-6])',x) for x in factors) or len(set(factors))!=len(factors) or 'V06' in factors:raise ValueError('first release excludes both V06 arms')
    if profile['stage_role'] in ('research','critic','revision','seed','shared_seed'):raise ValueError('ordinary/intermediate roles do not opt in')
    if profile['commit_dir']!='out/final' or profile['bundle_path']!='out/final_bundle.json':raise ValueError('exact DEC010 delivery paths required')
    if profile['allowed_outputs']!={name:'out/final/'+name for name in NAMES}:raise ValueError('exact required role contract required')
    manifest=profile['import_manifest']
    if not isinstance(manifest,dict) or set(manifest)!={'path','sha256'} or not re.fullmatch(r'[0-9a-f]{64}',manifest.get('sha256','')):raise ValueError('sealed import manifest required')
    relative(manifest['path'],'inputs')
    actor=profile['actor_binding']
    if not isinstance(actor,dict) or not actor or actor.get('stage_id')!=profile['stage_id']:raise ValueError('trusted actor/stage binding required')
    # Identity values are operator/native metadata; no invented Goal result.
    if len(encoded(actor))>8192:raise ValueError('actor metadata cap')
    return profile

def load_profile(path,expected_sha256=None):
    p=Path(path).absolute()
    if any(q.is_symlink() for q in (p,*p.parents)):raise ValueError('operator profile symlink denied')
    meta=p.stat()
    if not stat.S_ISREG(meta.st_mode) or meta.st_uid!=os.getuid() or meta.st_nlink!=1 or meta.st_mode&0o077 or meta.st_size>MAX_MANIFEST:raise ValueError('private owned operator profile required')
    raw=p.read_bytes()
    if expected_sha256 is not None and sha(raw)!=expected_sha256:raise ValueError('sealed operator profile changed')
    return validate_profile(strict_json(raw))

def pinned_metadata(reference,read_raw):
    if not isinstance(reference,dict) or set(reference)!={'path','sha256'} or not re.fullmatch(r'[0-9a-f]{64}',reference.get('sha256','')):raise ValueError('pinned positive metadata proof required')
    relative(reference['path'],'inputs');raw=read_raw(reference['path'])
    if len(raw)>MAX_MANIFEST or sha(raw)!=reference['sha256']:raise ValueError('metadata proof changed')
    return strict_json(raw)

def event_time(value):
    if not isinstance(value,dict) or not {'clock','value'}<=set(value):raise ValueError('actual event clock required')
    if value['clock']=='monotonic_ns':
        if type(value['value']) is not int or not 0<value['value']<=time.monotonic_ns():raise ValueError('actual positive event time required')
        return value['value']
    if value['clock']=='utc' and isinstance(value['value'],str):
        stamp=datetime.datetime.fromisoformat(value['value'].replace('Z','+00:00'))
        if stamp.tzinfo is None or stamp.timestamp()<=0 or stamp>datetime.datetime.now(datetime.timezone.utc):raise ValueError('actual observed UTC event required')
        return stamp.timestamp()
    if value['clock']=='unix_epoch_seconds' and type(value['value']) in (int,float) and math.isfinite(value['value']) and 0<value['value']<=time.time():return value['value']
    raise ValueError('supported actual event time required')

def pointer(value,path):
    if path=='':return value
    if not isinstance(path,str) or not path.startswith('/') or len(path.encode())>2048:raise ValueError('exact metadata JSON pointer required')
    for item in path[1:].split('/'):
        key=item.replace('~1','/').replace('~0','~')
        if isinstance(value,dict):value=value[key]
        elif isinstance(value,list) and key.isdecimal():value=value[int(key)]
        else:raise ValueError('positive metadata selector missing')
    return value

def bound_record(declaration,row,read_raw):
    record=pointer(pinned_metadata({k:declaration[k] for k in ('path','sha256')},read_raw),declaration['record_selector'])
    selectors=declaration['binding_selectors']
    names={'origin_job_id','origin_case_id','origin_arm_id','origin_role','origin_actor_family'}
    if not isinstance(selectors,dict) or set(selectors)!=names:raise ValueError('same-job receipt identity selectors required')
    aliases={'Z':'GLM','L':'Luna','M':'Muse'}
    for name in names:
        actual=pointer(record,selectors[name]);expected=row['origin_actor']['family'] if name=='origin_actor_family' else row[name]
        if name=='origin_actor_family':actual=aliases.get(actual,actual);expected=aliases.get(expected,expected)
        if actual!=expected:raise ValueError('receipt belongs to another origin job/role/family')
    return record

def receipt_count(declaration,row,read_raw):
    if not isinstance(declaration,dict) or set(declaration)!={'path','sha256','record_selector','binding_selectors','count_selector','observed_count'}:raise ValueError('positive bound receipt path/hash/count selector required')
    observed=bound_record(declaration,row,read_raw)
    count=pointer(observed,declaration['count_selector'])
    if isinstance(count,(dict,list)):count=len(count)
    if type(count) is not int or count<1 or type(declaration['observed_count']) is not int or count!=declaration['observed_count']:raise ValueError('positive actual receipt count required')
    return count

def bound_time(value,row,read_raw):
    if not isinstance(value,dict) or set(value)!={'clock','value','basis','receipt','selector'}:raise ValueError('time anchor must bind an actual receipt selector')
    declaration=value['receipt']
    if not isinstance(declaration,dict) or set(declaration)!={'path','sha256','record_selector','binding_selectors'}:raise ValueError('clock receipt must bind actual same-job identity')
    record=bound_record(declaration,row,read_raw)
    if pointer(record,value['selector'])!=value['value']:raise ValueError('invented/unbound time anchor')
    return event_time(value)

def verify_native_proof(row,profile,read_raw):
    proof=pinned_metadata(row['native_proof'],read_raw)
    keys={'schema','origin_job_id','origin_case_id','origin_arm_id','origin_role','origin_goal_id','origin_session_id','origin_actor','origin_status','native_goal_activation_count','immutable_freeze_observation_count','activation_receipt','freeze_receipt','activation_time','freeze_time','activation_time_nonexposure_reason','freeze_time_nonexposure_reason','activation_window_start','freeze_window_end','goal_id_nonexposure_reason'}
    if not isinstance(proof,dict) or set(proof)!=keys or proof['schema']!='er9.native-source-role-proof.v1':raise ValueError('positive activation/freeze capsule required')
    for name in ('origin_job_id','origin_case_id','origin_arm_id','origin_role','origin_goal_id','origin_session_id','origin_actor','origin_status'):
        if proof[name]!=row[name]:raise ValueError('native proof identity drift')
    if type(proof['native_goal_activation_count']) is not int or proof['native_goal_activation_count']<1:raise ValueError('session identity alone is not positive native Goal activation')
    if receipt_count(proof['activation_receipt'],row,read_raw)!=proof['native_goal_activation_count'] or receipt_count(proof['freeze_receipt'],row,read_raw)!=proof['immutable_freeze_observation_count']:raise ValueError('actual activation/freeze receipt binding drift')
    if row['origin_goal_id'] is None and (not isinstance(proof['goal_id_nonexposure_reason'],str) or not proof['goal_id_nonexposure_reason'] or row['origin_session_id'] is None):raise ValueError('distinct Goal ID non-exposure must be explicit')
    if row['origin_goal_id'] is not None and proof['goal_id_nonexposure_reason'] is not None:raise ValueError('exposed Goal ID cannot be relabeled unexposed')
    start=proof['activation_window_start'];end=proof['freeze_window_end']
    if not isinstance(start,dict) or start.get('basis') not in ('actual_native_start','actual_stage_start','saved_worker_birth') or not isinstance(end,dict) or end.get('basis') not in ('actual_freeze_observation','immutable_freeze_receipt_filesystem_mtime','saved_native_end','saved_worker_elapsed_end'):raise ValueError('truthful observed enclosing window required')
    start_value=bound_time(start,row,read_raw);end_value=bound_time(end,row,read_raw)
    if start['clock']!=end['clock'] or end_value<start_value:raise ValueError('missing/unbound/reversed observed window')
    for field in ('activation_time','freeze_time'):
        reason=proof[field+'_nonexposure_reason']
        if proof[field] is None and (not isinstance(reason,str) or not reason):raise ValueError('unknown exact event time needs truthful non-exposure reason')
        if proof[field] is not None and reason is not None:raise ValueError('actual exposed time cannot be relabeled unknown')
        if proof[field] is not None:
            actual=bound_time(proof[field],row,read_raw)
            if proof[field]['clock']==start['clock'] and not start_value<=actual<=end_value:raise ValueError('actual event outside observed window')
    if row['admission_kind']=='same_arm_role':
        if row['origin_case_id']!=profile['case_id'] or row['origin_arm_id']!=profile['arm_id'] or row['shared_seed_authorization'] is not None:raise ValueError('foreign role not same-arm input')
    elif row['admission_kind']=='predeclared_shared_seed':
        allowed=pinned_metadata(row['shared_seed_authorization'],read_raw)
        keys={'schema','target_case_id','target_arms','original_import_manifest_sha256','selection_basis','artifacts'}
        if not isinstance(allowed,dict) or set(allowed)!=keys or allowed['schema']!='er9.predeclared-shared-seed-imports.v1' or allowed['target_case_id']!=profile['case_id'] or not isinstance(allowed['target_arms'],list) or len(allowed['target_arms'])!=2 or any(not isinstance(a,str) or not ID.fullmatch(a) for a in allowed['target_arms']) or profile['arm_id'] not in allowed['target_arms'] or len(set(allowed['target_arms']))!=len(allowed['target_arms']) or allowed['selection_basis']!='predeclared_first_chronological' or not re.fullmatch(r'[0-9a-f]{64}',allowed.get('original_import_manifest_sha256','')) or not isinstance(allowed['artifacts'],list):raise ValueError('exact frozen shared-seed authorization required')
        expected={name:row[name] for name in ('origin_case_id','origin_arm_id','origin_job_id','artifact_role','sha256','bytes')}
        if expected not in allowed['artifacts']:raise ValueError('unregistered foreign shared seed')
        if any(not isinstance(x,dict) or set(x)!=set(expected) for x in allowed['artifacts']):raise ValueError('exact shared-seed import rows required')
    else:raise ValueError('no new cross-arm source sharing')

def reference_closure(profile,read_raw):
    declaration=profile['import_manifest'];raw=read_raw(declaration['path'])
    if len(raw)>MAX_MANIFEST or sha(raw)!=declaration['sha256']:raise ValueError('import manifest changed')
    manifest=strict_json(raw)
    if not isinstance(manifest,dict) or set(manifest)!={'schema','stage_id','case_id','arm_id','entries'} or manifest['schema']!=MANIFEST_SCHEMA or manifest['stage_id']!=profile['stage_id'] or manifest['case_id']!=profile['case_id'] or manifest['arm_id']!=profile['arm_id'] or not isinstance(manifest['entries'],list) or len(manifest['entries'])>128:raise ValueError('same-stage same-case same-arm reference closure required')
    result={};paths=set()
    for row in manifest['entries']:
        keys={'input_id','path','sha256','bytes','artifact_role','case_id','arm_id','origin_case_id','origin_arm_id','origin_role','origin_job_id','origin_goal_id','origin_session_id','origin_actor','origin_status','native_proof','admission_kind','shared_seed_authorization'}
        if not isinstance(row,dict) or set(row)!=keys:raise ValueError('exact source-role provenance required')
        identity=row['input_id'];path=row['path']
        if not isinstance(identity,str) or not ID.fullmatch(identity) or identity in result or path in paths:raise ValueError('duplicate reference identity/path')
        relative(path,'inputs')
        if row['case_id']!=profile['case_id'] or row['arm_id']!=profile['arm_id'] or row['artifact_role'] not in NAMES or not re.fullmatch(r'[0-9a-f]{64}',row.get('sha256','')):raise ValueError('reference scope or role mismatch')
        if type(row['bytes']) is not int or not 0<row['bytes']<=MAX_BYTES:raise ValueError('exact source byte count required')
        for key in ('origin_role','origin_job_id'):
            if not isinstance(row[key],str) or not row[key] or len(row[key].encode('utf-8'))>1024 or any(ord(c)<32 for c in row[key]):raise ValueError('declared native source provenance required')
        for key in ('origin_case_id','origin_arm_id'):
            if row[key] is not None and (not isinstance(row[key],str) or not row[key] or len(row[key].encode('utf-8'))>1024 or any(ord(c)<32 for c in row[key])):raise ValueError('truthful nullable original case/arm required')
        for key in ('origin_goal_id','origin_session_id'):
            if row[key] is not None and (not isinstance(row[key],str) or not row[key] or len(row[key].encode('utf-8'))>1024 or any(ord(c)<32 for c in row[key])):raise ValueError('actual nullable native identity required')
        if row['origin_goal_id'] is None and row['origin_session_id'] is None:raise ValueError('actual source Goal or session identity required')
        origin=row['origin_actor']
        if not isinstance(origin,dict) or set(origin)!={'family','model','effort'} or origin['family'] not in ('GLM','Muse','Luna','Z','M','L') or any(x is not None and (not isinstance(x,str) or len(x.encode('utf-8'))>256) for x in (origin['model'],origin['effort'])):raise ValueError('affordable native source actor required')
        status=row['origin_status']
        if not isinstance(status,dict) or set(status)!={'native_goal_state','output_freeze_state'} or any(not isinstance(x,str) or not x or len(x.encode('utf-8'))>256 for x in status.values()):raise ValueError('original native/freeze status required without source grade')
        verify_native_proof(row,profile,read_raw)
        result[identity]=row;paths.add(path)
    return result

def validate_bundle(raw,profile,read_raw):
    if len(raw)>MAX_BYTES:raise ValueError('existing writer byte cap exceeded')
    bundle=strict_json(raw)
    if not isinstance(bundle,dict) or set(bundle)!={'schema','stage_id','adopt_current','artifacts'} or bundle['schema']!=SCHEMA or bundle['stage_id']!=profile['stage_id'] or bundle['adopt_current'] is not True:raise ValueError('explicit native current-stage adoption required')
    selectors=bundle['artifacts']
    if not isinstance(selectors,dict) or set(selectors)!=set(NAMES):raise ValueError('all four and only four required artifact slots')
    closure=reference_closure(profile,read_raw);payloads={};provenance={}
    for name in NAMES:
        selector=selectors[name]
        if not isinstance(selector,dict):raise ValueError('one literal or input-id selector required')
        if set(selector)=={'text_utf8'} and isinstance(selector['text_utf8'],str):
            content=selector['text_utf8'].encode('utf-8');origin={'selector':'native_literal','source_role_provenance':None}
        elif set(selector)=={'input_id'} and isinstance(selector['input_id'],str) and selector['input_id'] in closure:
            row=closure[selector['input_id']]
            if row['artifact_role']!=name:raise ValueError('selected reference artifact role mismatch')
            content=read_raw(row['path'])
            if len(content)!=row['bytes'] or sha(content)!=row['sha256']:raise ValueError('selected reference bytes changed')
            origin={'selector':'explicit_native_input_id','source_role_provenance':row}
        else:raise ValueError('unadmitted or ambiguous selector')
        if not content or len(content)>MAX_BYTES:raise ValueError('empty/oversized required payload')
        content.decode('utf-8')
        if name!='proposal.md':strict_json(content)
        payloads[name]=content;provenance[name]={'canonical_path':profile['allowed_outputs'][name],'bytes':len(content),'sha256':sha(content),**origin}
    return payloads,provenance

def rename_noreplace(parent_fd,source,target):
    libc=ctypes.CDLL(None,use_errno=True)
    rename=libc.renameat2;rename.argtypes=[ctypes.c_int,ctypes.c_char_p,ctypes.c_int,ctypes.c_char_p,ctypes.c_uint];rename.restype=ctypes.c_int
    if rename(parent_fd,source.encode(),parent_fd,target.encode(),1)!=0:
        code=ctypes.get_errno();raise OSError(code,os.strerror(code))

def write_at(parent,name,raw):
    fd=os.open(name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=parent)
    try:
        view=memoryview(raw)
        while view:
            n=os.write(fd,view)
            if n<=0:raise OSError('zero write')
            view=view[n:]
        os.fsync(fd)
    finally:os.close(fd)

def commit(raw,profile,read_raw,parent_fd,root,operation_context=None,deadline_monotonic_ns=None):
    profile=validate_profile(profile);payloads,provenance=validate_bundle(raw,profile,read_raw)
    parent,target=parent_fd(profile['commit_dir'],True)
    bundle_parent,bundle_name=parent_fd(profile['bundle_path'],True)
    staging='.bundle-stage-'+uuid.uuid4().hex;staging_fd=None;staging_identity=None;created_bundle=False;committed=False
    try:
        # Any existing canonical directory/file, even empty, is a hard stop.
        try:os.stat(target,dir_fd=parent,follow_symlinks=False)
        except FileNotFoundError:pass
        else:raise FileExistsError('canonical final directory already exists')
        try:os.stat(bundle_name,dir_fd=bundle_parent,follow_symlinks=False)
        except FileNotFoundError:pass
        else:raise FileExistsError('native bundle path already exists')
        metadata={'schema':'er9.delivery-commit.v1','stage_id':profile['stage_id'],'case_id':profile['case_id'],'arm_id':profile['arm_id'],
                  'native_call_operation_id':(operation_context or {}).get('operation_id'),
                  'native_call_argument_sha256':(operation_context or {}).get('argument_sha256'),
                  'operator_profile_sha256':(operation_context or {}).get('operator_profile_sha256'),
                  'source_writer_name':'write_file','underlying_admitted_writer':'mcp__pm_boundary__write_file',
                  'native_surface_writer_binding':profile['actor_binding'].get('writer_alias','UNOBSERVED_BY_SOURCE_SERVER'),
                  'actor_binding':profile['actor_binding'],'bundle_path':profile['bundle_path'],'bundle_sha256':sha(raw),
                  'import_manifest_sha256':profile['import_manifest']['sha256'],
                  'native_explicit_adoption':True,'artifacts':provenance,
                  'canonical_render_sha256':sha(b''.join(n.encode()+b'\0'+len(payloads[n]).to_bytes(8,'big')+payloads[n] for n in NAMES)),
                  'goal_result':'INDEPENDENT_NOT_UPDATED','runtime_quiet':'INDEPENDENT_NOT_ASSESSED','source_grade':'INDEPENDENT_NOT_ASSESSED',
                  'warning':'Structural delivery commit verifies selected bytes only; catalog staleness/missing new witness/claim correctness require independent grading.'}
        manifest=encoded(metadata)+b'\n'
        if len(manifest)>MAX_BYTES:raise ValueError('commit metadata cap')
        total=count=0
        for base,dirs,names in os.walk(root+'/out',followlinks=False):
            for item in names:
                meta=os.lstat(os.path.join(base,item));total+=meta.st_size;count+=1
        if total+len(raw)+sum(map(len,payloads.values()))+len(manifest)>MAX_OUTPUT or count+6>128:raise ValueError('existing aggregate output/file cap')
        os.mkdir(staging,0o700,dir_fd=parent)
        staging_fd=os.open(staging,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
        staging_identity=os.fstat(staging_fd)
        for name in NAMES:write_at(staging_fd,name,payloads[name])
        write_at(staging_fd,'DELIVERY_MANIFEST.json',manifest);os.fsync(staging_fd)
        if deadline_monotonic_ns is not None and time.monotonic_ns()>=deadline_monotonic_ns:raise TimeoutError('original stage deadline before delivery commit')
        # Store exact native bundle before the single canonical directory commit.
        write_at(bundle_parent,bundle_name,raw);created_bundle=True
        if deadline_monotonic_ns is not None and time.monotonic_ns()>=deadline_monotonic_ns:raise TimeoutError('original stage deadline before directory publication')
        rename_noreplace(parent,staging,target);committed=True;os.fsync(parent);os.fsync(bundle_parent)
        return {'path':profile['bundle_path'],'bytes':len(raw),'sha256':sha(raw),'delivery_commit':metadata,'delivery_manifest_path':profile['commit_dir']+'/DELIVERY_MANIFEST.json','delivery_manifest_sha256':sha(manifest)}
    finally:
        if staging_fd is not None:os.close(staging_fd)
        # A signal may arrive after successful renameat2 but before Python sets
        # committed. Preserve a physically complete, identity-matched publication.
        if not committed and staging_identity is not None:
            try:
                meta=os.stat(target,dir_fd=parent,follow_symlinks=False)
                committed=stat.S_ISDIR(meta.st_mode) and (meta.st_dev,meta.st_ino)==(staging_identity.st_dev,staging_identity.st_ino)
            except FileNotFoundError:pass
        if not committed:
            try:
                fd=os.open(staging,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=parent)
                try:
                    for name in os.listdir(fd):os.unlink(name,dir_fd=fd)
                finally:os.close(fd)
                os.rmdir(staging,dir_fd=parent)
            except FileNotFoundError:pass
            if created_bundle:os.unlink(bundle_name,dir_fd=bundle_parent)
        os.close(parent);os.close(bundle_parent)
