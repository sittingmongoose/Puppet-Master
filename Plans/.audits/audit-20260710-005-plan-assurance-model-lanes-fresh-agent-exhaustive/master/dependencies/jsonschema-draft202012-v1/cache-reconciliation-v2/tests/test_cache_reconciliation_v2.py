#!/usr/bin/env python3
from __future__ import annotations
import copy,hashlib,json,tempfile
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"tools"))
from validate_cache_reconciliation_v2 import capture_live,validate_snapshot_model,classify_cache,validate_pyc,canonical_digest

def digest(v):return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":")).encode()).hexdigest()
def main():
    tests={}
    def check(n,v):tests[n]=bool(v)
    base=capture_live();check("live-pass",base["status"]=="pass");check("exact-counts",base["counts"]=={"semantic":152,"cache":39,"runtime":191});check("semantic-root",base["semantic_root"]=="f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95");check("runtime-distinct",base["runtime_root"]!=base["semantic_root"]);check("no-symlinks",base["symlinks"]==[]);check("runtime-probe",base["runtime_probe"].get("jsonschema")=="4.26.0" and base["runtime_probe"].get("python")=="3.12.13" and base["runtime_probe"].get("machine")=="arm64");check("offline",base["offline_no_global_install"] and not base["network_used"])
    semantic=base["semantic_rows"];cache=base["cache_rows"];runtime=base["runtime_rows"]
    for row in semantic:check("semantic-row:"+row["path"],len(row["sha256"])==64 and row["size"]>=0 and "__pycache__" not in Path(row["path"]).parts and not row["path"].endswith(".pyc"))
    for row in cache:
        p=Path(__file__).resolve().parents[2]/"site-packages"/row["path"];ok,reason,src=classify_cache(p)
        check("cache-path:"+row["path"],ok and reason is None);check("cache-source:"+row["path"],src is not None and src.is_file());check("cache-magic:"+row["path"],validate_pyc(p,src)==[] and row["magic_hex"]=="cb0d0d0a" and row["cache_tag"]=="cpython-312")
    # Per-cache mutations cover disguised, renamed, nested, traversal, wrong tag,
    # duplicate and runtime-growth cases independently for all 39 caches.
    variants=[lambda p:p.replace("__pycache__","cache"),lambda p:p.replace(".cpython-312.pyc",".pyc"),lambda p:p.replace(".cpython-312.pyc",".cpython-311.pyc"),lambda p:p.replace("__pycache__","__pycache__/nested"),lambda p:"../"+p]
    for i,row in enumerate(cache):
        for j,fn in enumerate(variants):
            bad=copy.deepcopy(cache);bad[i]["path"]=fn(row["path"]);check(f"cache-path-negative:{i}:{j}",bool(validate_snapshot_model(semantic,bad,runtime)))
        dup=copy.deepcopy(cache);dup[i]["path"]=cache[1 if i==0 else 0]["path"];check(f"cache-duplicate-negative:{i}",bool(validate_snapshot_model(semantic,dup,runtime)))
        grown=copy.deepcopy(runtime)+[{"path":row["path"]+".extra","size":1,"sha256":"0"*64}];check(f"runtime-growth-negative:{i}",bool(validate_snapshot_model(semantic,cache,grown)))
    mutations=[]
    mutations.append(("semantic-missing",semantic[:-1],cache,runtime));mutations.append(("semantic-extra",semantic+[{"path":"x.py","size":0,"sha256":"0"*64}],cache,runtime));s=copy.deepcopy(semantic);s[0]["sha256"]="0"*64;mutations.append(("semantic-hash-drift",s,cache,runtime));s=copy.deepcopy(semantic);s[0]["path"]=s[1]["path"];mutations.append(("semantic-duplicate",s,cache,runtime));mutations.append(("cache-missing",semantic,cache[:-1],runtime));mutations.append(("runtime-missing",semantic,cache,runtime[:-1]));mutations.append(("runtime-duplicate",semantic,cache,runtime+[runtime[0]]));c=copy.deepcopy(cache);c[0]["path"]="/absolute/__pycache__/x.cpython-312.pyc";mutations.append(("cache-absolute",semantic,c,runtime));c=copy.deepcopy(cache);c[0]["path"]="pkg/__pycache__/nested/__pycache__/x.cpython-312.pyc";mutations.append(("cache-double-nested",semantic,c,runtime));c=copy.deepcopy(cache);c[0]["path"]="pkg/__pycache__/x.cpython-312.py";mutations.append(("cache-wrong-extension",semantic,c,runtime));c=copy.deepcopy(cache);c[0]["path"]="pkg/__pycache__/x.cpython-312.pyc/escape";mutations.append(("cache-path-trailer",semantic,c,runtime))
    for n,s,c,r in mutations:check("model-negative:"+n,bool(validate_snapshot_model(s,c,r)))
    # Filesystem-only symlink and missing-source classification probes.
    with tempfile.TemporaryDirectory() as td:
        root=Path(td);pkg=root/"pkg";cache_dir=pkg/"__pycache__";cache_dir.mkdir(parents=True);src=pkg/"m.py";src.write_text("x=1\n");target=cache_dir/"m.cpython-312.pyc";target.write_bytes(b"x"*16);link=cache_dir/"alias.cpython-312.pyc";link.symlink_to(target)
        check("symlink-negative",classify_cache(link,root)[1]=="symlink");target.unlink();check("missing-source-or-cache-negative",classify_cache(cache_dir/"missing.cpython-312.pyc",root)[1]=="missing_source")
    failed=sorted(k for k,v in tests.items() if not v);out={"schema_version":"jsonschema-cache-reconciliation-v2-tests-v1","status":"pass" if not failed else "fail","counts":{"total":len(tests),"passed":len(tests)-len(failed),"failed":len(failed)},"failed_tests":failed,"test_digest":digest(tests)};print(json.dumps(out,indent=2,sort_keys=True));raise SystemExit(0 if not failed else 1)
if __name__=="__main__":main()
