#!/usr/bin/env python3
"""Guarded merge-only file update. Default is read-only preflight; never invokes Git.
Use --apply --backup OUTSIDE_REPO for writes, or --rollback BACKUP to undo.
Run only in a trusted, quiescent local worktree, not concurrently with a directory
renamer or another installer. Changed bytes are compare-and-swap checked.
"""
from __future__ import annotations
import argparse,hashlib,json,os,re,stat,sys,tempfile
from pathlib import Path,PurePosixPath
from typing import Any

class Refusal(Exception):pass
SCHEMA='pm.guarded_merge_update.v1'
UNDO='pm.guarded_merge_undo.v1'
def digest(data:bytes)->str:return hashlib.sha256(data).hexdigest()
def absolute(path:Path)->Path:return Path(os.path.abspath(os.path.expanduser(str(path))))
def checked_path(path:Path,allow_missing:bool=True)->Path:
 p=absolute(path)
 for x in [*reversed(p.parents),p]:
  # lstat reparse flags also cover Windows junctions on Python versions before
  # Path.is_junction exists. Refuse all reparse points rather than following one.
  try: info=x.lstat()
  except FileNotFoundError: info=None
  reparse=info is not None and bool(getattr(info,'st_file_attributes',0) & getattr(stat,'FILE_ATTRIBUTE_REPARSE_POINT',0x400))
  if x.is_symlink() or getattr(x,'is_junction',lambda:False)() or reparse:raise Refusal('Symlink/junction/reparse path refused: '+str(x))
  if x.exists() and x!=p and not x.is_dir():raise Refusal('Non-directory parent: '+str(x))
 if not allow_missing and not p.exists():raise Refusal('Missing path: '+str(p))
 return p

def relpath(value:Any)->str:
 if not isinstance(value,str) or not value or '\\' in value or '\x00' in value:raise Refusal('Invalid relative path')
 p=PurePosixPath(value)
 if p.is_absolute() or p.as_posix()!=value or any(x.casefold() in ('.','..','.git') for x in p.parts):raise Refusal('Unsafe relative path: '+value)
 for part in p.parts:
  if ':' in part or part.endswith(('.', ' ')) or re.match(r'(?i)^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)',part):raise Refusal('Unsafe platform path: '+value)
 return value

def child(root:Path,relative:str)->Path:
 relative=relpath(relative);p=checked_path(root/relative)
 if not p.is_relative_to(root):raise Refusal('Path escape: '+relative)
 return p

def file_state(p:Path)->str|None:
 checked_path(p)
 if not p.exists():return None
 if not p.is_file():raise Refusal('Not a regular file: '+str(p))
 return digest(p.read_bytes())

def valid_hash(h:Any,nullable:bool=False)->bool:return h is None and nullable or isinstance(h,str) and re.fullmatch('[0-9a-f]{64}',h) is not None

def load_json(p:Path)->dict:
 checked_path(p,False)
 try:j=json.loads(p.read_text(encoding='utf-8'))
 except (OSError,ValueError) as e:raise Refusal('Invalid JSON: '+str(p)) from e
 if not isinstance(j,dict):raise Refusal('Object required: '+str(p))
 return j

def atomic_write(path:Path,data:bytes,mode:int=0o644)->None:
 checked_path(path);path.parent.mkdir(parents=True,exist_ok=True);checked_path(path.parent,False)
 fd,name=tempfile.mkstemp(prefix='.pm-b16-',dir=path.parent)
 try:
  with os.fdopen(fd,'wb') as f:f.write(data);f.flush();os.fsync(f.fileno())
  os.chmod(name,mode & 0o777);checked_path(path);os.replace(name,path)
 finally:
  if os.path.exists(name):os.unlink(name)

def write_json(path:Path,value:dict)->None:atomic_write(path,(json.dumps(value,indent=2)+'\n').encode())

def package_rows(package:Path)->tuple[dict,list[dict]]:
 package=checked_path(package,False);m=load_json(package/'UPDATE_MANIFEST.json')
 if m.get('schema')!=SCHEMA or m.get('mode')!='merge_only' or not isinstance(m.get('files'),list) or not m['files']:raise Refusal('Invalid update manifest')
 seen=set();rows=[];payload=checked_path(package/'payload',False)
 for row in m['files']:
  if not isinstance(row,dict):raise Refusal('Invalid file row')
  rel=relpath(row.get('path'));fold=rel.casefold()
  if fold in seen:raise Refusal('Duplicate/case-colliding path: '+rel)
  seen.add(fold)
  if 'before_sha256' not in row or not valid_hash(row.get('before_sha256'),True) or not valid_hash(row.get('sha256')) or type(row.get('bytes')) is not int or row['bytes']<0:raise Refusal('Invalid hash/size: '+rel)
  if 'allow_absent' in row and type(row['allow_absent']) is not bool:raise Refusal('Invalid absence guard: '+rel)
  if row.get('allow_absent') and not row.get('absence_reason'):raise Refusal('Absence guard requires explicit provenance: '+rel)
  p=child(payload,rel)
  if file_state(p)!=row['sha256'] or p.stat().st_size!=row['bytes']:raise Refusal('Payload integrity failure: '+rel)
  rows.append(row)
 # No unlisted payload, links, junction-like files, or path aliases are accepted.
 actual=set()
 for base,dirs,files in os.walk(payload,followlinks=False):
  for name in dirs+files:
   p=checked_path(Path(base)/name,False)
   if p.is_file():actual.add(p.relative_to(payload).as_posix())
   elif not p.is_dir():raise Refusal('Special payload object')
 if actual!={x['path'] for x in rows}:raise Refusal('Payload inventory mismatch')
 return m,rows

def preflight(root:Path,package:Path)->dict:
 root=checked_path(root,False)
 if not root.is_dir():raise Refusal('Repository must be an existing directory')
 m,rows=package_rows(package);out=[];conflicts=[]
 for row in rows:
  current=file_state(child(root,row['path']))
  status='already_current' if current==row['sha256'] else 'update' if current==row['before_sha256'] or current is None and row.get('allow_absent') is True else 'conflict'
  out.append({**row,'current_sha256':current,'action':status})
  if status=='conflict':conflicts.append(row['path'])
 if conflicts:raise Refusal('Newer/unknown target bytes; nothing written: '+', '.join(conflicts))
 return {'schema':SCHEMA,'status':'preflight_pass','repository':str(root),'package_id':m.get('package_id'),'manifest_sha256':file_state(package/'UPDATE_MANIFEST.json'),'files':out,'git_index_touched':False,'deletions':0}

def separate_backup(root:Path,package:Path,backup:Path)->Path:
 b=checked_path(backup)
 if b==root or b.is_relative_to(root) or root.is_relative_to(b) or b==package or b.is_relative_to(package) or package.is_relative_to(b):raise Refusal('Backup must be separate from repository and package')
 if b.exists():raise Refusal('Backup directory must be new: '+str(b))
 if not b.parent.is_dir():raise Refusal('Backup parent must already exist')
 return b

def validated_undo(root:Path,backup:Path)->dict:
 root=checked_path(root,False);backup=checked_path(backup,False)
 if backup==root or backup.is_relative_to(root) or root.is_relative_to(backup):raise Refusal('Unsafe backup location')
 j=load_json(backup/'UNDO.json')
 if j.get('schema')!=UNDO or j.get('repository')!=str(root) or not isinstance(j.get('files'),list):raise Refusal('Undo belongs to a different repository or schema')
 seen=set()
 for row in j['files']:
  rel=relpath(row.get('path'))
  if rel.casefold() in seen:raise Refusal('Duplicate undo target')
  seen.add(rel.casefold())
  if not valid_hash(row.get('before_sha256'),True) or not valid_hash(row.get('sha256')):raise Refusal('Invalid undo hash')
  if row['before_sha256'] is not None:
   p=child(backup/'files',rel)
   if file_state(p)!=row['before_sha256']:raise Refusal('Corrupt backup: '+rel)
  child(root,rel)
 return j

def restore_rows(root:Path,backup:Path,j:dict,strict:bool)->dict:
 conflicts=[];restored=[]
 for row in j['files']:
  current=file_state(child(root,row['path']))
  if current not in (row['sha256'],row['before_sha256']):conflicts.append(row['path'])
 if strict and conflicts:raise Refusal('Rollback conflict; newer edits preserved and nothing restored: '+', '.join(conflicts))
 for row in reversed(j['files']):
  if row['path'] in conflicts:continue
  p=child(root,row['path']);current=file_state(p)
  if current==row['before_sha256']:continue
  if current!=row['sha256']:conflicts.append(row['path']);continue
  if row['before_sha256'] is None:
   checked_path(p);p.unlink()  # Only an exact newly-installed file; never recursive deletion.
  else:atomic_write(p,child(backup/'files',row['path']).read_bytes(),row['before_mode'])
  restored.append(row['path'])
 result={'status':'rolled_back' if not conflicts else 'rollback_conflict','restored':restored,'conflicts':conflicts,'git_index_touched':False}
 write_json(backup/'ROLLBACK_RESULT.json',result);return result

def rollback(root:Path,backup:Path)->dict:
 root=checked_path(root,False);backup=checked_path(backup,False);j=validated_undo(root,backup);return restore_rows(root,backup,j,True)

def apply(root:Path,package:Path,backup:Path)->dict:
 root=checked_path(root,False);package=checked_path(package,False);report=preflight(root,package);rows=[x for x in report['files'] if x['action']=='update']
 if not rows:return {**report,'status':'already_current','written':0,'backup':None}
 backup=separate_backup(root,package,backup);backup.mkdir();j={'schema':UNDO,'repository':str(root),'manifest_sha256':report['manifest_sha256'],'package_id':report['package_id'],'files':[]}
 # Complete backup before first repository write.
 for row in rows:
  p=child(root,row['path']);current=file_state(p)
  if current!=row['current_sha256']:raise Refusal('Target changed during backup; no repository writes: '+row['path'])
  original=p.read_bytes() if current is not None else None;mode=stat.S_IMODE(p.stat().st_mode) if current is not None else 0o644
  if original is not None:
   if digest(original)!=current:raise Refusal('Target changed while read: '+row['path'])
   atomic_write(child(backup/'files',row['path']),original,mode)
  j['files'].append({'path':row['path'],'before_sha256':current,'sha256':row['sha256'],'before_mode':mode})
 write_json(backup/'UNDO.json',j);written=[]
 try:
  # Recheck complete targets/payload after backups; then compare again at each write.
  preflight(root,package)
  if file_state(package/'UPDATE_MANIFEST.json')!=report['manifest_sha256']:raise Refusal('Manifest changed after preflight')
  for row in rows:
   p=child(root,row['path'])
   if file_state(p)!=row['current_sha256']:raise Refusal('Target changed before write: '+row['path'])
   data=child(package/'payload',row['path']).read_bytes()
   if digest(data)!=row['sha256']:raise Refusal('Payload changed after preflight: '+row['path'])
   old=next(x for x in j['files'] if x['path']==row['path']);atomic_write(p,data,old['before_mode']);written.append(row['path'])
  result={'status':'applied','written':len(written),'paths':written,'backup':str(backup),'git_index_touched':False,'manifest_sha256':report['manifest_sha256']};write_json(backup/'APPLY_RESULT.json',result);return result
 except Exception as exc:
  try:recovery=restore_rows(root,backup,validated_undo(root,backup),False)
  except Exception as e:recovery={'status':'rollback_failed','error':str(e)}
  raise Refusal('Apply failed: '+str(exc)+'; rollback='+json.dumps(recovery)+'; backup='+str(backup)) from exc

def main()->int:
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--repo',type=Path,required=True);ap.add_argument('--package',type=Path,default=Path(__file__).resolve().parent);ap.add_argument('--apply',action='store_true');ap.add_argument('--backup',type=Path);ap.add_argument('--rollback',type=Path);a=ap.parse_args()
 if a.rollback and (a.apply or a.backup):ap.error('Rollback is a separate operation')
 if a.apply and not a.backup:ap.error('--apply requires --backup outside the repository')
 try:
  root=absolute(a.repo);package=absolute(a.package)
  out=rollback(root,absolute(a.rollback)) if a.rollback else apply(root,package,absolute(a.backup)) if a.apply else preflight(root,package)
  print(json.dumps(out,indent=2));return 0
 except (Refusal,OSError) as e:print(json.dumps({'status':'refused','error':str(e),'git_index_touched':False},indent=2));return 2
if __name__=='__main__':raise SystemExit(main())
