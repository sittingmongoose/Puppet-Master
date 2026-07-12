#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;DEP=BASE.parent;SITE=DEP/'site-packages'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def verify():
 e=[]
 try:
  a=json.loads((BASE/'authority.json').read_text());sem=rows(Path(a['semantic_manifest_path']));c12=rows(BASE/'cpython312-runtime-cache.jsonl');c14=rows(BASE/'cpython314-runtime-cache.jsonl');runtime=rows(BASE/'observed-runtime-tree.jsonl')
  if len(sem)!=152 or len(c12)!=39 or len(c14)!=25 or len(runtime)!=216:e.append('counts')
  for x in sem:
   p=SITE/x['path'];
   if not p.is_file() or p.is_symlink() or sha(p)!=x['sha256'] or '__pycache__' in p.parts or p.suffix=='.pyc':e.append('semantic:'+x['path'])
  for version,rr,magic in [(312,c12,'cb0d0d0a'),(314,c14,'2b0e0d0a')]:
   for x in rr:
    p=SITE/x['path'];src=SITE/x['source_path']
    if not p.is_file() or p.is_symlink() or p.parent.name!='__pycache__' or p.read_bytes()[:4].hex()!=magic or not src.is_file() or src.is_symlink() or sha(src)!=x['source_sha256'] or x['authoritative'] is not False:e.append(f'cache{version}:'+x['path'])
  if a['semantic_tree_sha256']!='f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95' or a['runtime_cache_authoritative'] or a['cache_imported_into_semantic_root']:e.append('authority')
  if sha(Path(a['v2_terminal_report_path']))!=a['v2_terminal_report_sha256']:e.append('v2-path')
 except Exception as ex:e.append(f'{type(ex).__name__}:{ex}')
 return {'status':'pass' if not e else 'fail','errors':e,'semantic':152,'runtime':216,'cache312':39,'cache314':25}
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass' else 1)
