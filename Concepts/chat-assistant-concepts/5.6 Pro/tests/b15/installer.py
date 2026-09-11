#!/usr/bin/env python3
"""Tests the installer extracted from the actual guarded-update ZIP.
Requires an existing cumulative B14 directory (or --baseline ZIP) and Git.
All mutations are confined to a fresh external scratch directory.
"""
from __future__ import annotations
import argparse,hashlib,importlib.util,json,os,shutil,subprocess,sys,traceback,zipfile
from pathlib import Path

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
def inventory(root):return {p.relative_to(root).as_posix():sha(p) for p in root.rglob('*') if p.is_file() and '.git' not in p.parts and '__pycache__' not in p.parts}
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--zip',type=Path,required=True);ap.add_argument('--baseline',type=Path,required=True);ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();o=a.outdir.resolve()
 if o.exists():ap.error('Use a fresh output directory')
 o.mkdir(parents=True);r={'status':'running','guard_zip_sha256':sha(a.zip),'checks':[],'commands':[],'scope':'Actual extracted Python installer, working-tree bytes and Git index. Controlled write faults patch the extracted atomic_write seam.'}
 def save():(o/'RESULT.json').write_text(json.dumps(r,indent=2)+'\n')
 def ck(n,v):r['checks'].append({'name':n,'pass':bool(v)});save();assert v,n
 def cli(package,root,*args,expect=0):
  cmd=[sys.executable,str(package/'apply_update.py'),'--repo',str(root),*map(str,args)];p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);r['commands'].append({'argv':cmd,'exit_code':p.returncode,'output':p.stdout});save();assert p.returncode==expect,p.stdout;return json.loads(p.stdout)
 def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],stderr=subprocess.STDOUT)
 def extracted(name):
  dest=o/name;dest.mkdir()
  with zipfile.ZipFile(a.zip) as z:
   assert z.testzip() is None
   for name2 in z.namelist():
    p=Path(name2);assert not p.is_absolute() and '..' not in p.parts
   z.extractall(dest)
  return dest
 try:
  pkg=extracted('extracted-package');m=json.loads((pkg/'UPDATE_MANIFEST.json').read_text());rows=m['files'];changed=[x for x in rows if x['before_sha256'] is not None];new=[x for x in rows if x['before_sha256'] is None];ck('Package contains guarded existing paths and absence-guarded additions',bool(changed) and bool(new));r['installer_sha256']=sha(pkg/'apply_update.py');r['manifest_sha256']=sha(pkg/'UPDATE_MANIFEST.json')
  base=o/'baseline';
  if a.baseline.is_dir():shutil.copytree(a.baseline,base)
  else:
   base.mkdir()
   with zipfile.ZipFile(a.baseline) as z:z.extractall(base)
  repo=o/'repo';shutil.copytree(base,repo);git(repo,'init','-q');git(repo,'config','user.name','Batch 15 installer test');git(repo,'config','user.email','installer-test@example.invalid');git(repo,'add','.');git(repo,'commit','-qm','Scratch B14 baseline');(repo/'unrelated-new-main.txt').write_text('newer unrelated committed work\n');git(repo,'add','unrelated-new-main.txt');git(repo,'commit','-qm','Newer unrelated main work');(repo/'unrelated-staged.txt').write_text('unrelated staged bytes\n');git(repo,'add','unrelated-staged.txt')
  # Keep deliberately staged bytes DIFFERENT from both the B14 working tree and B15 output.
  overlap=repo/changed[0]['path'];old=overlap.read_bytes();overlap.write_bytes(old+b'\nSTAGED CONTENT MUST STAY\n');git(repo,'add','--',changed[0]['path']);overlap.write_bytes(old);index_before=sha(repo/'.git/index');head_before=git(repo,'rev-parse','HEAD');staged_before=git(repo,'show',':'+changed[0]['path']);before=inventory(repo)
  out=cli(pkg,repo);ck('Preflight is read-only and sees all paths',inventory(repo)==before and sha(repo/'.git/index')==index_before and len(out['files'])==len(rows));backup=o/'external-backup';out=cli(pkg,repo,'--apply','--backup',backup);ck('Applied exactly listed changes',out['written']==len(rows) and all(sha(repo/x['path'])==x['sha256'] for x in rows));ck('Newer unrelated work remains', (repo/'unrelated-new-main.txt').read_text()=='newer unrelated committed work\n' and (repo/'unrelated-staged.txt').read_text()=='unrelated staged bytes\n');ck('Git HEAD, index and staged overlapping content preserved',sha(repo/'.git/index')==index_before and git(repo,'rev-parse','HEAD')==head_before and git(repo,'show',':'+changed[0]['path'])==staged_before);ck('Backup external and complete',not backup.is_relative_to(repo) and all(sha(backup/'files'/x['path'])==x['before_sha256'] for x in changed));out=cli(pkg,repo,'--apply','--backup',o/'unused-backup');ck('Repeated application is a no-op without second backup',out['status']=='already_current' and not (o/'unused-backup').exists())
  html=next(x for x in rows if x['path'].endswith('/index.html'));concept=(repo/html['path']).parent;stand=concept/'PM_Chat_Assistant_5.6_Pro_Standalone.html';(concept/'index.html').unlink();stand.unlink();p=subprocess.run([sys.executable,str(concept/'build.py')],cwd=concept,capture_output=True,text=True);r['clean_installed_build']={'exit_code':p.returncode,'output':p.stdout+p.stderr};ck('Installed extraction clean-rebuilds both exact final HTML bytes',p.returncode==0 and sha(concept/'index.html')==html['sha256'] and sha(stand)==html['sha256']);ck('Build also leaves staged index unchanged',sha(repo/'.git/index')==index_before)
  newer=repo/changed[0]['path'];newer.write_bytes(newer.read_bytes()+b'\nNEWER EDIT\n');snapshot=inventory(repo);out=cli(pkg,repo,'--rollback',backup,expect=2);ck('Rollback refuses a newer edit without partial changes',out['status']=='refused' and inventory(repo)==snapshot);newer.write_bytes((pkg/'payload'/changed[0]['path']).read_bytes());out=cli(pkg,repo,'--rollback',backup);ck('Explicit rollback restores original bytes and removes only its new files',out['status']=='rolled_back' and inventory(repo)==before);ck('Rollback preserves exact staged index',sha(repo/'.git/index')==index_before);ck('Second rollback is idempotent',cli(pkg,repo,'--rollback',backup)['restored']==[])
  # Whole-target preflight: a later path conflicts before any earlier path can be written.
  conflict=repo/changed[-1]['path'];orig=conflict.read_bytes();conflict.write_bytes(orig+b'\nforeign edit\n');snapshot=inventory(repo);out=cli(pkg,repo,'--apply','--backup',o/'conflict-backup',expect=2);ck('Unknown overlapping working bytes refuse before backup or writes',inventory(repo)==snapshot and not (o/'conflict-backup').exists());conflict.write_bytes(orig)
  # Corruption, unlisted files, traversal, path aliases and symlink escape.
  bad=extracted('corrupt-package');target=bad/'payload'/rows[0]['path'];target.write_bytes(target.read_bytes()+b'CORRUPT');snapshot=inventory(repo);cli(bad,repo,'--apply','--backup',o/'corrupt-backup',expect=2);ck('Corrupt payload rejected before writes',inventory(repo)==snapshot and not (o/'corrupt-backup').exists())
  bad=extracted('extra-package');(bad/'payload/EXTRA.txt').write_text('unlisted');cli(bad,repo,expect=2);ck('Unlisted payload refused',inventory(repo)==snapshot)
  for name,path in [('traversal','../outside'),('absolute','/outside'),('backslash','bad\\path'),('git','.git/index'),('case-git','.GiT/index')]:
   bad=extracted('bad-'+name);j=json.loads((bad/'UPDATE_MANIFEST.json').read_text());j['files'][0]['path']=path;(bad/'UPDATE_MANIFEST.json').write_text(json.dumps(j));cli(bad,repo,expect=2);ck(name+' path refused',inventory(repo)==snapshot)
  bad=extracted('duplicate-package');j=json.loads((bad/'UPDATE_MANIFEST.json').read_text());j['files'].append(j['files'][0]);(bad/'UPDATE_MANIFEST.json').write_text(json.dumps(j));cli(bad,repo,expect=2);ck('Duplicate target refused',inventory(repo)==snapshot)
  bad=extracted('linked-payload');linked=bad/'payload'/rows[0]['path'];outside=o/'outside';outside.write_bytes(linked.read_bytes());linked.unlink();linked.symlink_to(outside);outside_sha=sha(outside);cli(bad,repo,expect=2);ck('Payload symlink refused without touching outside file',sha(outside)==outside_sha)
  link=o/'linked-repo';link.symlink_to(repo,target_is_directory=True);cli(pkg,link,expect=2);ck('Symlink repository refused',inventory(repo)==snapshot)
  # Existing target replaced by a link to identical expected bytes must still be refused.
  exact=repo/changed[0]['path'];old=exact.read_bytes();outside.write_bytes(old);exact.unlink();exact.symlink_to(outside);cli(pkg,repo,expect=2);ck('Target symlink refused despite matching content',sha(outside)==hashlib.sha256(old).hexdigest());exact.unlink();exact.write_bytes(old)
  parent=repo/Path(changed[0]['path']).parts[0];park=o/'parked-parent';parent.rename(park);parent.symlink_to(park,target_is_directory=True);cli(pkg,repo,expect=2);ck('Symlink target ancestor refused',parent.is_symlink());parent.unlink();park.rename(parent)
  cli(pkg,repo,'--apply','--backup',repo/'unsafe-backup',expect=2);ck('Backup inside repository refused',inventory(repo)==snapshot and not (repo/'unsafe-backup').exists())
  # Actual extracted installer's second repository write fails; backups are not faulted.
  spec=importlib.util.spec_from_file_location('extracted_b15_installer',pkg/'apply_update.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);original_write=mod.atomic_write
  # Portable negative shim exercises the Windows reparse-attribute branch, not a
  # native Windows installation. This must work even without Path.is_junction.
  from types import SimpleNamespace
  original_lstat=Path.lstat;reparse_rejected=False
  def reparse_lstat(path,*args,**kwargs):
   value=original_lstat(path,*args,**kwargs)
   return SimpleNamespace(st_mode=value.st_mode,st_file_attributes=0x400) if path==repo else value
  try:
   Path.lstat=reparse_lstat
   try:mod.checked_path(repo)
   except mod.Refusal:reparse_rejected=True
  finally:Path.lstat=original_lstat
  ck('Windows reparse attribute refused (portable negative shim, not native test)',reparse_rejected)

  for kind in ['rollback','intervening']:
   calls=[0];before_fault=inventory(repo);foreign_path=None
   def inject(path,data,mode=0o644):
    nonlocal foreign_path
    if path.is_relative_to(repo):
     calls[0]+=1
     if calls[0]==2:
      if kind=='intervening':foreign_path=repo/rows[0]['path'];foreign_path.write_bytes(b'newer concurrent edit survives failed install\n')
      raise OSError('injected second repository write failure')
    return original_write(path,data,mode)
   mod.atomic_write=inject
   try:mod.apply(repo,pkg,o/('fault-'+kind));ck('Injected '+kind+' must fail',False)
   except mod.Refusal as exc:r['commands'].append({'injected_case':kind,'result':str(exc)})
   finally:mod.atomic_write=original_write
   if kind=='rollback':ck('Mid-write failure automatically restores all old bytes',inventory(repo)==before_fault)
   else:
    expected={**before_fault,rows[0]['path']:hashlib.sha256(b'newer concurrent edit survives failed install\n').hexdigest()};ck('Failed install preserves intervening bytes and reports rollback conflict',inventory(repo)==expected and 'rollback_conflict' in r['commands'][-1]['result']);foreign_path.write_bytes((base/rows[0]['path']).read_bytes()) if (base/rows[0]['path']).exists() else foreign_path.unlink()
   ck('Fault recovery preserves staged index',sha(repo/'.git/index')==index_before)
  # Corrupt originals cannot be used for rollback.
  bkp=o/'corrupt-original';mod.apply(repo,pkg,bkp);p=bkp/'files'/changed[0]['path'];p.write_bytes(p.read_bytes()+b'tamper');snapshot2=inventory(repo);cli(pkg,repo,'--rollback',bkp,expect=2);ck('Corrupt original backup refuses rollback without writes',inventory(repo)==snapshot2)
  # Real linked worktree: its .git is a pointer file and staging index lives
  # outside the install root. Preserve both and deliberately different staging.
  control=o/'worktree-control';shutil.copytree(base,control);git(control,'init','-q');git(control,'config','user.name','Batch 15 installer test');git(control,'config','user.email','installer-test@example.invalid');git(control,'add','.');git(control,'commit','-qm','Linked worktree baseline')
  linked=o/'actual-linked-worktree';git(control,'worktree','add','-q','-b','b15-install',str(linked));index_path=Path(git(linked,'rev-parse','--path-format=absolute','--git-path','index').decode().strip());pointer_before=sha(linked/'.git');linked_head=git(linked,'rev-parse','HEAD');tracked=linked/changed[0]['path'];tracked_old=tracked.read_bytes();tracked.write_bytes(tracked_old+b'\nKEEP LINKED STAGING\n');git(linked,'add','--',changed[0]['path']);tracked.write_bytes(tracked_old);linked_staged=git(linked,'show',':'+changed[0]['path']);linked_index=sha(index_path);linked_before=inventory(linked)
  cli(pkg,linked,'--apply','--backup',o/'linked-backup');ck('Actual linked worktree preserves external index, pointer, HEAD and staged overlap',not index_path.is_relative_to(linked) and sha(index_path)==linked_index and sha(linked/'.git')==pointer_before and git(linked,'rev-parse','HEAD')==linked_head and git(linked,'show',':'+changed[0]['path'])==linked_staged and all(sha(linked/x['path'])==x['sha256'] for x in rows))
  cli(pkg,linked,'--rollback',o/'linked-backup');ck('Actual linked-worktree rollback preserves external index and originals',inventory(linked)==linked_before and sha(index_path)==linked_index and sha(linked/'.git')==pointer_before)
  r['status']='pass';save()
 except Exception:r['status']='fail';r['failure']=traceback.format_exc();save();print(r['failure'],flush=True)
 r['assertions']=len(r['checks']);save();print(json.dumps({'status':r['status'],'assertions':r['assertions'],'report':str(o/'RESULT.json')}));return 0 if r['status']=='pass' else 1
if __name__=='__main__':raise SystemExit(main())
