#!/usr/bin/env python3
"""Repin this finite public helper closure, never campaign/runtime files."""
import hashlib,json,re
from pathlib import Path
HERE=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,obj): p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def rows(paths):return [{'relative_path':str(p.relative_to(HERE)),'sha256':sha(p),'bytes':p.stat().st_size} for p in paths]
base=HERE/'sources/helpers/er12-screen-v1';comp=HERE/'sources/helpers/er12-composite-A1-A8-v1'
paths={'base_prepare':base/'prepare.py','base_reveal':base/'reveal.py','base_bootstrap':base/'bootstrap.js','critic_delta':HERE/'sources/methods/A8/critic_prompt_delta.txt','reviser_delta':HERE/'sources/methods/A8/reviser_prompt_delta.txt'}
s=(comp/'prepare.py').read_text()
for n,p in paths.items():
 s,count=re.subn(r"('"+n+r"': \([^\n]*, ')[a-f0-9]{64}('\),)",lambda m:m[1]+sha(p)+m[2],s)
 assert count==1,n
(comp/'prepare.py').write_text(s)
put(comp/'COMPONENT_PINS.json',{n:{'path':'ER13_RUNTIME/'+str(p.relative_to(HERE/'sources')),'sha256':sha(p),'bytes':p.stat().st_size} for n,p in paths.items()})
put(HERE/'sources/mechanics/invocation-clarification-v1/helper-pins.json',{'ER13_RUNTIME/helpers/er12-screen-v1/'+n:sha(base/n) for n in ['prepare.py','reveal.py']})
sources=[p for p in sorted((HERE/'sources').rglob('*')) if p.is_file()]
put(HERE/'public-input-dependency-manifest.json',{'schema':'er13.finite-public-source-closure.v1','files':rows(sources)})
old=json.loads((HERE/'prior-v3-bundle-manifest.json').read_text())
old_rows={r['relative_path']:r['sha256'] for r in old['files']}
for rel in ['sources/mechanics/exact-goal-binding-guard-v1/assert-active-goal.py','sources/methods/A8/critic_prompt_delta.txt','sources/methods/A8/reviser_prompt_delta.txt']:
 assert sha(HERE/rel)==old_rows[rel], 'immutable inherited byte changed: '+rel
put(HERE/'source-lineage.json',{'parent_recipe':'materialize-v3','parent_manifest_sha256':sha(HERE/'prior-v3-bundle-manifest.json'),'exact_A8_sha256':{n:sha(HERE/'sources/methods/A8'/n) for n in ['critic_prompt_delta.txt','reviser_prompt_delta.txt']},'files':[dict(r,parent_v3_sha256=old_rows.get(r['relative_path']),changed_from_v3=r['sha256']!=old_rows.get(r['relative_path'])) for r in rows(sources)]})
files=[p for p in sorted(HERE.rglob('*')) if p.is_file() and not any(x.startswith(('.offline-smoke-','__pycache__','sealed')) for x in p.relative_to(HERE).parts) and p.name not in ('bundle-manifest.json','SHA256SUMS') and p.suffix!='.pyc']
put(HERE/'bundle-manifest.json',{'schema':'er13.materialize-public-bundle.v1','scope':['R0','A1','A8','A1+A8','B02','B06','B07','B09','B10','B11','B12'],'activation_capture_versions':['exact-capture-v21'],'files':rows(files)})
(HERE/'SHA256SUMS').write_text(''.join(sha(p)+'  '+str(p.relative_to(HERE))+'\n' for p in files+[HERE/'bundle-manifest.json']))
print(json.dumps({'repinned':True,'source_files':len(sources),'bundle_files':len(files),'dispatches':0}))
