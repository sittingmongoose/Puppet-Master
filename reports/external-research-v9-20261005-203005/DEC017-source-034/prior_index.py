"""Deterministic exact authorized own-prior metadata; no content or selection."""
import hashlib,json,os,re,stat
from pathlib import Path,PurePosixPath
INDEX='inputs/prior_file_index.json'
SCHEMA='er9.authorized-own-prior-file-index.v1'
MAX_BYTES=524288  # Existing read_file input limit, no tool permission expansion.

def relative(value):
    if type(value) is not str or not value or '\\' in value or '\x00' in value:raise ValueError('Canonical candidate-relative path required')
    path=PurePosixPath(value)
    if path.is_absolute() or '..' in path.parts or str(path)!=value or len(path.parts)<2 or path.parts[0]!='inputs':raise ValueError('Only canonical already-authorized inputs paths required')
    if value==INDEX:raise ValueError('Index cannot recursively index itself')
    return value

def regular(workspace,relative_path):
    ws=Path(workspace).absolute();path=ws/relative(relative_path)
    if any(x.is_symlink() for x in (path,*path.parents)) or not path.is_relative_to(ws):raise ValueError('Symlink/traversal/outside-root denied')
    meta=path.stat()
    if not stat.S_ISREG(meta.st_mode) or meta.st_nlink!=1:raise ValueError('Unaliased regular admitted import required')
    return path,meta

def canonical_pins(workspace,pins):
    if type(pins) is not dict:raise ValueError('Exact input pin map required')
    ws=Path(workspace).absolute();result={}
    for absolute,digest in pins.items():
        path=Path(absolute)
        if not path.is_absolute() or str(path)!=absolute or not path.is_relative_to(ws):raise ValueError('Pinned input outside exact workspace')
        rel=path.relative_to(ws).as_posix()
        if rel==INDEX:continue
        relative(rel)
        if rel in result or type(digest) is not str or not re.fullmatch('[0-9a-f]{64}',digest):raise ValueError('Duplicate or malformed SHA pin')
        result[rel]=digest
    return result

def encode(workspace,input_pins,neutral_relative_pins,authorization):
    """Authorization is an explicit positive ops DTO from authenticated imports.

    Actual file bytes are hashed opaquely, never decoded. Exact imported delta
    must equal the explicit same-arm authorization rows without filtering.
    """
    pins=canonical_pins(workspace,input_pins)
    if type(neutral_relative_pins) is not dict:raise ValueError('Preclosed neutral pin map required')
    for rel,digest in neutral_relative_pins.items():
        relative(rel)
        if pins.get(rel)!=digest:raise ValueError('Original neutral input pin identity changed')
    if authorization.get('schema')!='er9.accepted-own-prior-imports.v1' or authorization.get('authenticated_same_arm') is not True:
        raise ValueError('Positive already-authenticated same-arm imports required')
    if type(authorization.get('job_id')) is not str or not authorization['job_id'] or type(authorization.get('pair_id')) is not str or not authorization['pair_id'] or authorization.get('arm') not in {'control','treatment'}:
        raise ValueError('Exact target import binding required')
    rows=authorization.get('imports')
    if type(rows) is not list:raise ValueError('Explicit complete import row list required')
    declared={}
    for row in rows:
        if type(row) is not dict or set(row)-{'path','sha256','bytes','origin_job_id','origin_role','origin_arm_id'}:raise ValueError('No content/relevance/grade fields allowed')
        rel=relative(row['path'])
        if rel in declared:raise ValueError('Duplicate imported path denied')
        if row.get('origin_arm_id')!=authorization['arm']:raise ValueError('Other-arm input cannot become own-prior')
        if type(row.get('bytes')) is not int or row['bytes']<0 or row.get('sha256')!=pins.get(rel):raise ValueError('Authorized SHA/length identity required')
        if any(key in row and (type(row[key]) is not str or not row[key]) for key in ['origin_job_id','origin_role']):raise ValueError('Optional provenance must be explicit authenticated strings')
        declared[rel]=row
    if set(declared)!=set(pins)-set(neutral_relative_pins):raise ValueError('All exact authorized imports without omission/addition required')
    entries=[]
    for rel in sorted(declared):
        row=declared[rel];path,before=regular(workspace,rel)
        hasher=hashlib.sha256()
        with path.open('rb') as file:
            if os.fstat(file.fileno()).st_ino!=before.st_ino:raise ValueError('Import changed before hashing')
            for chunk in iter(lambda:file.read(65536),b''):hasher.update(chunk)
            after=os.fstat(file.fileno())
        final=path.stat()
        if before.st_size!=row['bytes'] or after.st_size!=before.st_size or after.st_mtime_ns!=before.st_mtime_ns or final.st_ino!=after.st_ino or final.st_dev!=after.st_dev or final.st_size!=after.st_size or final.st_mtime_ns!=after.st_mtime_ns or hasher.hexdigest()!=row['sha256']:
            raise ValueError('Wrong/unstable imported SHA or byte length')
        entry={'path':rel,'sha256':row['sha256'],'bytes':row['bytes']}
        for key in ['origin_job_id','origin_role']:
            if key in row:entry[key]=row[key]
        entries.append(entry)
    value={'schema':SCHEMA,'files':entries}
    raw=(json.dumps(value,ensure_ascii=False,indent=2,sort_keys=True)+'\n').encode('utf-8')
    if len(raw)>MAX_BYTES:raise ValueError('Index exceeds existing read_file input limit')
    return raw

def freeze(workspace,input_pins,neutral_relative_pins,authorization):
    raw=encode(workspace,input_pins,neutral_relative_pins,authorization);path=Path(workspace).absolute()/INDEX
    if any(x.is_symlink() for x in (path,*path.parents)):raise ValueError('Index aliases denied')
    with path.open('xb') as file:file.write(raw)
    path.chmod(0o444)
    return {'path':str(path),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'captured_before_goal':True,
      'source':'Exact already-authenticated imported pin closure; no content/relevance/grade selection'}
