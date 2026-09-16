#!/usr/bin/env python3
"""Test actual guarded archive preservation of an unlisted dependency symlink."""
import argparse, hashlib, json, os, shutil, subprocess, sys, zipfile
from pathlib import Path
P='Concepts/chat-assistant-concepts/5.6 Pro'
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--zip',type=Path,required=True);ap.add_argument('--baseline',type=Path,required=True);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o.exists():ap.error('Use a new external output directory')
 o.mkdir(parents=True);repo=o/'repo';shutil.copytree(a.baseline,repo);pkg=o/'package'
 with zipfile.ZipFile(a.zip) as z:
  assert z.testzip() is None
  for n in z.namelist():assert not Path(n).is_absolute() and '..' not in Path(n).parts
  z.extractall(pkg)
 outside=o/'external-dependency';outside.mkdir();secret=outside/'not-part-of-application.txt';secret.write_text('Do not read or mutate this dependency as application source.\n');link=repo/P/'handoff/node_modules';link.parent.mkdir(exist_ok=True);link.symlink_to(outside,target_is_directory=True);link_bytes=os.fsencode(os.readlink(link));inode=link.lstat().st_ino;original=secret.read_bytes()
 results={'status':'running','guard_sha256':hashlib.sha256(a.zip.read_bytes()).hexdigest(),'checks':[],'commands':[]}
 def ck(n,v):results['checks'].append({'name':n,'pass':bool(v)});assert v,n
 def run(*args):
  p=subprocess.run([sys.executable,str(pkg/'apply_update.py'),'--repo',str(repo),*map(str,args)],capture_output=True,text=True);results['commands'].append({'args':list(map(str,args)),'exit_code':p.returncode,'output':p.stdout+p.stderr});assert p.returncode==0,p.stdout+p.stderr
 run();ck('Preflight leaves unlisted symlink inode and text unchanged',link.is_symlink() and link.lstat().st_ino==inode and os.fsencode(os.readlink(link))==link_bytes)
 run('--apply','--backup',o/'backup');ck('Apply preserves unlisted dependency link',link.is_symlink() and link.lstat().st_ino==inode and os.fsencode(os.readlink(link))==link_bytes);ck('Apply preserves external target bytes',secret.read_bytes()==original)
 run('--rollback',o/'backup');ck('Rollback preserves unlisted dependency link',link.is_symlink() and link.lstat().st_ino==inode and os.fsencode(os.readlink(link))==link_bytes);ck('Rollback preserves external target bytes',secret.read_bytes()==original)
 results['status']='pass';(o/'RESULT.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS',len(results['checks']))
if __name__=='__main__':main()
