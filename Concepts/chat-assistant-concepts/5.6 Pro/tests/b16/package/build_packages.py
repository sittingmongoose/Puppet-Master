#!/usr/bin/env python3
"""Build merge-only and cumulative source archives. Does not install or call Git.
Package verification must run against the resulting ZIPs, not this source folder.
"""
from pathlib import Path
import argparse,hashlib,json,zipfile
PREFIX='Concepts/chat-assistant-concepts/5.6 Pro'
EXCLUDE_DIRS={'.git','__pycache__','node_modules','.venv','venv'}
EXCLUDE_EXT={'.ttf','.otf','.woff','.woff2','.pyc'}
PIN='86a3cbf28f63dcfdf98a8e20269c994f470b60d8'
def sha(data):return hashlib.sha256(data).hexdigest()
def files(root):
 result={}
 for p in sorted(root.rglob('*')):
  if any(x in EXCLUDE_DIRS for x in p.relative_to(root).parts):continue
  if p.is_symlink():raise ValueError('Source symlink refused: '+str(p))
  if p.is_file() and p.suffix.lower() not in EXCLUDE_EXT:result[p.relative_to(root).as_posix()]=p.read_bytes()
 return result
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--source',type=Path,required=True);ap.add_argument('--baseline',type=Path,required=True,help='B15 concept directory, not repo root');ap.add_argument('--outdir',type=Path,required=True);a=ap.parse_args();s=a.source.resolve();b=a.baseline.resolve();o=a.outdir.resolve()
 if o==s or s in o.parents:ap.error('Output must be outside source')
 o.mkdir(parents=True,exist_ok=True)
 names=['pm-b16-guarded-update.zip','pm-b16-cumulative-source.zip','PM_Chat_Assistant_Batch16.html','PACKAGE_BUILD.json']
 if any((o/n).exists() for n in names):ap.error('Use a fresh output directory')
 data=files(s);old=files(b)
 for n in ['todos.js','plans.js','build.py','tests/b16/handler-cases.js','tests/b16/controller.js','tests/b16/browser.py']:assert data.get(n),n
 assert data['index.html']==data['PM_Chat_Assistant_5.6_Pro_Standalone.html']
 assert all(n in data for n in old),'Cumulative archive may not remove baseline files'
 protected=[x+y for x in ['motion','variants-a','variants-b','variants-c','orbit'] for y in ['.js','.css']]
 assert all(data[n]==old[n] for n in protected),'Protected animation changed'
 changed={n:v for n,v in data.items() if old.get(n)!=v};rows=[]
 for n,v in changed.items():
  row={'path':PREFIX+'/'+n,'before_sha256':sha(old[n]) if n in old else None,'sha256':sha(v),'bytes':len(v)}
  if n=='tests/b10/qa/regression-review.py':
   row.update(allow_absent=True,absence_reason='This retained B15 QA file is in the supplied cumulative baseline but absent from the pinned GitHub tests tree 58d8605ff09a3c1ee11fa07ce95590218cb77f7d. Only its exact known baseline, known absence, or exact target is admitted.')
  rows.append(row)
 manifest={'schema':'pm.guarded_merge_update.v1','package_id':'pm-assistant-batch16','mode':'merge_only','pinned_main':PIN,'scope':'HTML concept and retained tests only; no native/governance/acceptance claim','files':rows,'protected_files_unchanged':protected,'deletions':[]}
 instructions='''# Batch 16 guarded update

Do not copy payload over your repository manually. Extract this ZIP outside the repository. In a trusted, quiescent isolated worktree, run the read-only preflight:

    python3 apply_update.py --repo /path/to/isolated-worktree

Apply only after preflight passes. Use a NEW backup path outside both repository and extracted package:

    python3 apply_update.py --repo /path/to/isolated-worktree --apply --backup /path/to/external/new-backup

Undo in the same worktree:

    python3 apply_update.py --repo /path/to/isolated-worktree --rollback /path/to/external/new-backup

Only listed paths are touched. Unknown overlapping bytes refuse; do not force-overwrite them. Absence is not a deletion instruction. HEAD/index/staged contents and unlisted files are preserved. Review and land the changes using current repository worktree/landing rules; this package neither commits nor pushes.

The manifest explicitly permits the known absence of ONE retained B10 QA file, because that path exists in the supplied B15 source package but not the pinned GitHub tree. Other existing files require their exact baseline or target bytes. The cumulative ZIP contains the full retained test corpus; this delta does not install every unchanged historical test that was absent on GitHub.

All ten protected animation files are unchanged and excluded from this delta. Backup and rollback detect intervening edits; concurrent directory renames or hostile filesystem races are outside this Python installer's tested boundary. Native Windows/macOS installation is not claimed.
'''
 with zipfile.ZipFile(o/names[0],'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  z.writestr('apply_update.py',data['tests/b16/package/apply_update.py']);z.writestr('UPDATE_MANIFEST.json',json.dumps(manifest,indent=2)+'\n');z.writestr('README.md',instructions)
  for n,v in changed.items():z.writestr('payload/'+PREFIX+'/'+n,v)
 source_manifest={'schema':'pm.cumulative_source_manifest.v1','batch':16,'pinned_main':PIN,'html_sha256':sha(data['index.html']),'source_files':[{'path':PREFIX+'/'+n,'sha256':sha(v),'bytes':len(v)} for n,v in data.items()],'baseline_file_count':len(old),'deletions':[],'verification':'Archive hashes prove byte custody only. Read the separate final delivery receipt and verification summary for execution results.'}
 with zipfile.ZipFile(o/names[1],'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for n,v in data.items():z.writestr(PREFIX+'/'+n,v)
  z.writestr('SOURCE_MANIFEST.json',json.dumps(source_manifest,indent=2)+'\n');z.writestr('README_CUMULATIVE.md','# Cumulative Batch 16 source and tests\n\nAll supplied Batch 15 source/test paths are retained. This is NOT a repository overwrite installer. Use the separate guarded update for an existing repository.\n\nTo rebuild, enter `'+PREFIX+'`, delete both generated HTML files, and run `python3 build.py`. Read BATCH_16_README.md for the bounded test launchers and concept limitations. Archive absence never instructs deletion of an existing repository file.\n')
 (o/names[2]).write_bytes(data['index.html'])
 result={'status':'built_not_installation_verified','pinned_main':PIN,'html_sha256':sha(data['index.html']),'changed_or_new_paths':len(rows),'cumulative_source_files':len(data),'files':[]}
 for n in names[:3]:p=o/n;result['files'].append({'path':n,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())})
 for n in names[:2]:
  with zipfile.ZipFile(o/n) as z:assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
 (o/names[3]).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
if __name__=='__main__':main()
