#!/usr/bin/env python3
"""Restore this explicit finite review package into a new caller-owned directory."""
import argparse,hashlib,json,pathlib,shutil
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--destination',required=True,type=pathlib.Path);a=p.parse_args()
root=pathlib.Path(__file__).resolve().parent;dest=a.destination.expanduser().absolute()
def safe(base,name):
 rel=pathlib.Path(name)
 if rel.is_absolute() or '..' in rel.parts or not rel.parts:raise ValueError('unsafe package member')
 f=base/rel
 if any(x.is_symlink() for x in (f,*f.parents)):raise ValueError('symlink refused')
 return f
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
if dest.exists() or dest==root or root in dest.parents or dest in root.parents:raise ValueError('new disjoint destination required')
if any(x.is_symlink() for x in (dest,*dest.parents)):raise ValueError('symlink destination refused')
listing=json.loads((root/'FILELIST.json').read_text())['files']
index=json.loads((root/'source-index.json').read_text())['files']
# Validate every retained byte and alias before creating output.
for row in listing+index:
 source=safe(root,row.get('retained_path',row['path']))
 if not source.is_file() or digest(source)!=row['sha256'] or source.stat().st_size!=row['bytes']:raise ValueError('package bytes differ: '+row['path'])
dest.mkdir(parents=True)
for row in listing:
 source=safe(root,row['path']);target=safe(dest,row['path']);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
for name in ['FILELIST.json','SHA256SUMS']:
 shutil.copyfile(root/name,dest/name)
for row in index:
 target=safe(dest,row['path'])
 if not target.exists():target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(safe(root,row['retained_path']),target)
 if digest(target)!=row['sha256']:raise ValueError('restored alias mismatch')
print(json.dumps({'restored':True,'retained_files':len(listing)+2,'resolved_source_paths':len(index),'dispatches':0,'native_calls':0}))
