#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,os
from pathlib import Path
BASE=Path(__file__).resolve().parent;DEP=BASE.parent;SITE=DEP/'site-packages';V2=DEP/'cache-reconciliation-v2'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def canon(v):return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def write(p,raw):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
 with os.fdopen(fd,'wb') as f:f.write(raw)
def jsonl(p,v):write(p,b''.join((json.dumps(x,sort_keys=True,separators=(',',':'))+'\n').encode() for x in v))
def main():
 sem=rows(V2/'immutable_authoritative_semantic_tree.jsonl');assert len(sem)==152
 for x in sem:
  p=SITE/x['path'];assert p.is_file() and not p.is_symlink() and sha(p)==x['sha256']
 caches={312:[],314:[]}
 for version in (312,314):
  suffix=f'.cpython-{version}.pyc';magic='cb0d0d0a' if version==312 else '2b0e0d0a'
  for p in sorted(SITE.rglob('*'+suffix)):
   rel=p.relative_to(SITE);assert p.is_file() and not p.is_symlink() and rel.parts[-2]=='__pycache__' and rel.parts.count('__pycache__')==1 and p.read_bytes()[:4].hex()==magic
   stem=p.name[:-len(suffix)];src=p.parent.parent/(stem+'.py');assert src.is_file() and not src.is_symlink()
   caches[version].append({'path':str(rel),'sha256':sha(p),'size':p.stat().st_size,'source_path':str(src.relative_to(SITE)),'source_sha256':sha(src),'magic_hex':magic,'cache_tag':f'cpython-{version}','authoritative':False})
 assert len(caches[312])==39 and len(caches[314])==25
 jsonl(BASE/'cpython312-runtime-cache.jsonl',caches[312]);jsonl(BASE/'cpython314-runtime-cache.jsonl',caches[314])
 allfiles=[{'path':str(p.relative_to(SITE)),'sha256':sha(p),'size':p.stat().st_size} for p in sorted(SITE.rglob('*')) if p.is_file()]
 assert len(allfiles)==216;jsonl(BASE/'observed-runtime-tree.jsonl',allfiles)
 auth={'schema_version':'jsonschema-cache-reconciliation-v3-authority','status':'PASS_SEMANTIC_152_RUNTIME_216','semantic_manifest_path':str(V2/'immutable_authoritative_semantic_tree.jsonl'),'semantic_manifest_sha256':sha(V2/'immutable_authoritative_semantic_tree.jsonl'),'semantic_file_count':152,'semantic_tree_sha256':'f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95','cpython312_cache_manifest_sha256':sha(BASE/'cpython312-runtime-cache.jsonl'),'cpython312_cache_count':39,'cpython314_cache_manifest_sha256':sha(BASE/'cpython314-runtime-cache.jsonl'),'cpython314_cache_count':25,'observed_runtime_manifest_sha256':sha(BASE/'observed-runtime-tree.jsonl'),'observed_runtime_count':216,'runtime_cache_authoritative':False,'cache_imported_into_semantic_root':False,'v2_terminal_report_path':str(V2/'validation/terminal-cache-reconciliation-v2.json'),'v2_terminal_report_sha256':'bfb3a7fc8a3723994f23930085f5989848c1aac85b4a6b39ed4dc0d15e0b3782','builder_sha256':sha(BASE/'build_cache_reconciliation_v3.py'),'verifier_sha256':sha(BASE/'verify_cache_reconciliation_v3.py'),'tests_sha256':sha(BASE/'test_cache_reconciliation_v3.py')};write(BASE/'authority.json',(json.dumps(auth,indent=2,sort_keys=True)+'\n').encode());print(json.dumps({'authority_sha256':sha(BASE/'authority.json'),'runtime':216,'semantic':152,'cache312':39,'cache314':25},sort_keys=True))
if __name__=='__main__':main()
