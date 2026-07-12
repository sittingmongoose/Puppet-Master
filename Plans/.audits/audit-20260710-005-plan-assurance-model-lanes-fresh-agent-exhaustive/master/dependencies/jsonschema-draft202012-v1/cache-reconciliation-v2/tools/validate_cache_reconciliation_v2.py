#!/usr/bin/env python3
from __future__ import annotations

import hashlib,json,os,re,struct,subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SITE=ROOT/"site-packages"
PYTHON=Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
EXPECTED_SEMANTIC_COUNT=152
EXPECTED_SEMANTIC_ROOT="f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95"
EXPECTED_CACHE_COUNT=39
EXPECTED_RUNTIME_COUNT=191
EXPECTED_MAGIC=bytes.fromhex("cb0d0d0a")
CACHE_RE=re.compile(r"^(.+)\.cpython-312\.pyc$")

def sha_bytes(b:bytes)->str:return hashlib.sha256(b).hexdigest()
def sha(p:Path)->str:return sha_bytes(p.read_bytes())
def canonical_digest(v)->str:return sha_bytes(json.dumps(v,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode())

def row_for(path:Path)->dict:
    raw=path.read_bytes();return {"path":str(path.relative_to(SITE)),"size":len(raw),"sha256":sha_bytes(raw)}

def classify_cache(path:Path,root:Path=SITE)->tuple[bool,str|None,Path|None]:
    try:rel=path.relative_to(root)
    except ValueError:return False,"path_escape",None
    if any(part in {".","..",""} for part in rel.parts):return False,"path_traversal",None
    ancestors=[]
    for parent in path.parents:
        ancestors.append(parent)
        if parent==root:break
    if path.is_symlink() or any(p.is_symlink() for p in ancestors):return False,"symlink",None
    if path.parent.name!="__pycache__" or "__pycache__" not in rel.parts:return False,"not_direct_pycache",None
    if rel.parts.count("__pycache__")!=1:return False,"nested_pycache",None
    if path.suffix!=".pyc":return False,"not_pyc",None
    m=CACHE_RE.fullmatch(path.name)
    if not m:return False,"wrong_cache_tag_or_name",None
    source=path.parent.parent/(m.group(1)+".py")
    if not source.is_file() or source.is_symlink():return False,"missing_source",source
    return True,None,source

def validate_pyc(path:Path,source:Path)->list[str]:
    errors=[];raw=path.read_bytes()
    if len(raw)<16:return ["short_header"]
    if raw[:4]!=EXPECTED_MAGIC:errors.append("magic")
    flags=struct.unpack("<I",raw[4:8])[0]
    if flags!=0:errors.append("flags_not_timestamp_mode")
    if flags==0:
        mtime=struct.unpack("<I",raw[8:12])[0];size=struct.unpack("<I",raw[12:16])[0]
        if mtime!=(int(source.stat().st_mtime)&0xffffffff):errors.append("source_mtime")
        if size!=(source.stat().st_size&0xffffffff):errors.append("source_size")
    return errors

def validate_snapshot_model(semantic_rows:list[dict],cache_rows:list[dict],runtime_rows:list[dict])->list[str]:
    errors=[]
    if len(semantic_rows)!=EXPECTED_SEMANTIC_COUNT:errors.append("semantic_count")
    if canonical_digest(semantic_rows)!=EXPECTED_SEMANTIC_ROOT:errors.append("semantic_root")
    if len(cache_rows)!=EXPECTED_CACHE_COUNT:errors.append("cache_count")
    if len(runtime_rows)!=EXPECTED_RUNTIME_COUNT:errors.append("runtime_count")
    semantic_paths=[x.get("path") for x in semantic_rows];cache_paths=[x.get("path") for x in cache_rows];runtime_paths=[x.get("path") for x in runtime_rows]
    if len(set(semantic_paths))!=len(semantic_paths):errors.append("semantic_duplicate")
    if len(set(cache_paths))!=len(cache_paths):errors.append("cache_duplicate")
    if set(semantic_paths)&set(cache_paths):errors.append("cross_class_overlap")
    if set(runtime_paths)!=(set(semantic_paths)|set(cache_paths)):errors.append("runtime_union")
    if len(runtime_paths)!=len(set(runtime_paths)):errors.append("runtime_duplicate")
    for row in cache_rows:
        p=row.get("path","");parts=Path(p).parts
        if len(parts)<2 or parts[-2]!="__pycache__" or parts.count("__pycache__")!=1 or not CACHE_RE.fullmatch(parts[-1]):errors.append("cache_path_contract")
        if Path(p).is_absolute() or ".." in parts:errors.append("cache_path_escape")
    return sorted(set(errors))

def capture_live()->dict:
    errors=[]
    symlinks=[str(p.relative_to(SITE)) for p in SITE.rglob("*") if p.is_symlink()]
    if symlinks:errors.append("site_symlinks")
    files=sorted((p for p in SITE.rglob("*") if p.is_file()),key=lambda p:str(p.relative_to(SITE)))
    semantic=[];cache=[];cache_details=[]
    for p in files:
        is_candidate=(p.parent.name=="__pycache__" or p.suffix==".pyc" or "__pycache__" in p.relative_to(SITE).parts)
        if is_candidate:
            ok,reason,source=classify_cache(p)
            if not ok:
                errors.append(f"invalid_cache:{p.relative_to(SITE)}:{reason}")
                continue
            pyc_errors=validate_pyc(p,source)
            if pyc_errors:errors.extend(f"invalid_pyc:{p.relative_to(SITE)}:{x}" for x in pyc_errors)
            row=row_for(p);row.update({"source_path":str(source.relative_to(SITE)),"magic_hex":p.read_bytes()[:4].hex(),"cache_tag":"cpython-312","header_mode":"timestamp","validation_errors":pyc_errors});cache.append(row);cache_details.append(row)
        else:semantic.append(row_for(p))
    runtime=sorted([row_for(p) for p in files],key=lambda x:x["path"]);semantic=sorted(semantic,key=lambda x:x["path"]);cache=sorted(cache,key=lambda x:x["path"])
    errors+=validate_snapshot_model(semantic,cache,runtime)
    fixed={"dependency_authority.json":"89d86715ed9760a2f9469733bf43cb6099784710b97bccf1b656e9520d0d3afb","install_receipt.json":"f36f64777e31a3d993a3e1fc03ed4d46182b77667d20f81bba6eb5ffc56462f8","requirements.lock":"a70d91fb9e7a4efbdded91709cb942d65be08c94f7ea58e473b3f0b1c190996d","source_registry.json":"23ca01e5f0117b8f8637168c883dc99cd459387920629f6ee34be7985b9e9005","wheel_manifest.jsonl":"c662aa4821ea4980210c248711d76afd25c6e296b9367458467f19f1a7665f40"}
    for rel,want in fixed.items():
        if sha(ROOT/rel)!=want:errors.append(f"bundle_binding:{rel}")
    wheel_hashes={"attrs-26.1.0-py3-none-any.whl":"c647aa4a12dfbad9333ca4e71fe62ddc36f4e63b2d260a37a8b83d2f043ac309","jsonschema-4.26.0-py3-none-any.whl":"d489f15263b8d200f8387e64b4c3a75f06629559fb73deb8fdfb525f2dab50ce","jsonschema_specifications-2025.9.1-py3-none-any.whl":"98802fee3a11ee76ecaca44429fda8a41bff98b00a0f2838151b113f210cc6fe","referencing-0.37.0-py3-none-any.whl":"381329a9f99628c9069361716891d34ad94af76e461dcb0335825aecc7692231","rpds_py-2026.6.3-cp312-cp312-macosx_11_0_arm64.whl":"538949e262e46caa31ac01bdb3c1e8f642622922cacbabbae6a8445d9dc33eaf","typing_extensions-4.16.0-py3-none-any.whl":"481caa481374e813c1b176ada14e97f1f67a4539ce9cfeb3f350d78d6370c2e8"}
    for name,want in wheel_hashes.items():
        if sha(ROOT/"wheels"/name)!=want:errors.append(f"wheel:{name}")
    before=canonical_digest(runtime)
    code="import json,importlib.metadata,jsonschema,platform,sys;print(json.dumps({'jsonschema':importlib.metadata.version('jsonschema'),'validator':jsonschema.Draft202012Validator.__name__,'python':platform.python_version(),'machine':platform.machine(),'cache_tag':sys.implementation.cache_tag}))"
    env={"PYTHONPATH":str(SITE),"PYTHONNOUSERSITE":"1","PYTHONDONTWRITEBYTECODE":"1","PYTHONHASHSEED":"0","PATH":os.environ.get("PATH","")}
    proc=subprocess.run([str(PYTHON),"-S","-B","-c",code],env=env,text=True,capture_output=True)
    try:probe=json.loads(proc.stdout)
    except Exception:probe={"parse_error":proc.stdout,"stderr":proc.stderr}
    if proc.returncode or probe!={"jsonschema":"4.26.0","validator":"Draft202012Validator","python":"3.12.13","machine":"arm64","cache_tag":"cpython-312"}:errors.append("isolated_runtime_probe")
    after_rows=sorted([row_for(p) for p in SITE.rglob("*") if p.is_file()],key=lambda x:x["path"])
    if canonical_digest(after_rows)!=before:errors.append("runtime_probe_mutated_tree")
    return {"status":"pass" if not errors else "fail","errors":sorted(set(errors)),"semantic_rows":semantic,"cache_rows":cache,"runtime_rows":runtime,"semantic_root":canonical_digest(semantic),"cache_root":canonical_digest(cache),"runtime_root":canonical_digest(runtime),"counts":{"semantic":len(semantic),"cache":len(cache),"runtime":len(runtime)},"symlinks":symlinks,"runtime_probe":probe,"bundle_bindings":fixed,"wheel_hashes":wheel_hashes,"offline_no_global_install":True,"network_used":False}

if __name__=="__main__":
    r=capture_live();out={k:v for k,v in r.items() if k not in {"semantic_rows","cache_rows","runtime_rows"}};print(json.dumps(out,indent=2,sort_keys=True));raise SystemExit(0 if r["status"]=="pass" else 1)
