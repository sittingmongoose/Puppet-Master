#!/usr/bin/env python3
"""Read-only byte freeze. Symlinks are metadata, never followed or deleted."""
import argparse,hashlib,json,os,stat
from pathlib import Path

def sha(data):return hashlib.sha256(data).hexdigest()
def freeze(root):
 root=Path(root).absolute()
 if root.is_symlink():raise ValueError('A linked root is not an executable source root')
 if not root.is_dir():raise ValueError('Source root must be an existing directory')
 entries={}
 for base,dirs,files in os.walk(root,followlinks=False):
  dirs[:]=sorted(d for d in dirs if d not in {'.git','__pycache__','.venv','venv'})
  for name in sorted(dirs+files):
   p=Path(base)/name;rel=p.relative_to(root).as_posix();info=p.lstat()
   if stat.S_ISLNK(info.st_mode):
    entries[rel]={'kind':'symlink_metadata_only','sha256':sha(os.fsencode(os.readlink(p))),'traversed':False}
   elif stat.S_ISREG(info.st_mode):entries[rel]={'kind':'file','sha256':sha(p.read_bytes()),'bytes':info.st_size}
   elif not stat.S_ISDIR(info.st_mode):raise ValueError('Special file refused: '+rel)
 return entries

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,required=True);ap.add_argument('--manifest',type=Path,required=True);ap.add_argument('--verify-only',action='store_true');a=ap.parse_args()
 if a.manifest.resolve()==a.root.resolve() or a.root.resolve() in a.manifest.resolve().parents:ap.error('Freeze manifest must be outside source')
 entries=freeze(a.root)
 if a.verify_only:
  old=json.loads(a.manifest.read_text());assert old['entries']==entries,'Source changed';print('SOURCE_FREEZE_REVERIFIED');return
 if a.manifest.exists():ap.error('Existing manifest not overwritten')
 a.manifest.parent.mkdir(parents=True,exist_ok=True);a.manifest.write_text(json.dumps({'schema':'pm.concept.source_freeze.v1','entries':entries,'file_count':sum(x['kind']=='file' for x in entries.values()),'symlinks_traversed':False},indent=2)+'\n');print('SOURCE_FREEZE_WRITTEN')
if __name__=='__main__':main()
