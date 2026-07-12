#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,subprocess
from pathlib import Path
import sys

NS=Path(__file__).resolve().parents[1]
BUNDLE=NS.parent
sys.path.insert(0,str(NS/"tools"))
from validate_cache_reconciliation_v2 import capture_live,canonical_digest
def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
def write_json(p:Path,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,sort_keys=True)+"\n")
def write_jsonl(p:Path,rows):p.parent.mkdir(parents=True,exist_ok=True);p.write_text("".join(json.dumps(x,sort_keys=True,separators=(",",":"))+"\n" for x in rows))
def main():
    live=capture_live()
    if live["status"]!="pass":raise SystemExit("live reconciliation failed:"+";".join(live["errors"]))
    test_script=NS/"tests/test_cache_reconciliation_v2.py";proc=subprocess.run(["python3","-B",str(test_script)],text=True,capture_output=True);tests=json.loads(proc.stdout)
    if proc.returncode or tests.get("status")!="pass" or tests.get("counts",{}).get("total",0)<250:raise SystemExit("tests failed")
    write_jsonl(NS/"immutable_authoritative_semantic_tree.jsonl",live["semantic_rows"])
    write_jsonl(NS/"observed_cache_tree.jsonl",live["cache_rows"])
    write_jsonl(NS/"observed_runtime_tree.jsonl",live["runtime_rows"])
    tool_hashes={"preparation":sha(NS/"tools/prepare_cache_reconciliation_v2.py"),"validator":sha(NS/"tools/validate_cache_reconciliation_v2.py"),"tests":sha(test_script)}
    authority={"schema_version":"audit005-jsonschema-cache-reconciliation-authority-v2","status":"PASS","scope":"site-packages only","cache_exclusion_contract":"Only regular *.pyc files directly under exactly one __pycache__ directory, named *.cpython-312.pyc, with CPython 3.12 magic and matching existing authoritative source timestamp/size, are excluded from semantic authority.","immutable_authoritative_semantic_tree":{"file_count":152,"sha256":live["semantic_root"],"expected_sha256":"f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95","manifest_path":str(NS/"immutable_authoritative_semantic_tree.jsonl"),"manifest_sha256":sha(NS/"immutable_authoritative_semantic_tree.jsonl")},"observed_cache_tree":{"file_count":39,"sha256":live["cache_root"],"manifest_path":str(NS/"observed_cache_tree.jsonl"),"manifest_sha256":sha(NS/"observed_cache_tree.jsonl"),"cache_tag":"cpython-312","magic_hex":"cb0d0d0a","caches_remain_on_disk":True,"authoritative":False},"observed_runtime_tree":{"file_count":191,"sha256":live["runtime_root"],"manifest_path":str(NS/"observed_runtime_tree.jsonl"),"manifest_sha256":sha(NS/"observed_runtime_tree.jsonl"),"authoritative":False},"runtime":{"python":"CPython 3.12.13","platform":"macOS arm64","executable":"/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3","jsonschema":"4.26.0","validator":"jsonschema.Draft202012Validator","offline":True,"global_install":False,"network_used":False},"bundle_bindings":{"dependency_authority_sha256":"89d86715ed9760a2f9469733bf43cb6099784710b97bccf1b656e9520d0d3afb","install_receipt_sha256":"f36f64777e31a3d993a3e1fc03ed4d46182b77667d20f81bba6eb5ffc56462f8","requirements_lock_sha256":"a70d91fb9e7a4efbdded91709cb942d65be08c94f7ea58e473b3f0b1c190996d","source_registry_sha256":"23ca01e5f0117b8f8637168c883dc99cd459387920629f6ee34be7985b9e9005","wheel_manifest_sha256":"c662aa4821ea4980210c248711d76afd25c6e296b9367458467f19f1a7665f40","wheel_hashes":live["wheel_hashes"]},"symlinks":[],"errors":[],"tool_hashes":tool_hashes,"tests":{"counts":tests["counts"],"test_digest":tests["test_digest"]}}
    write_json(NS/"CACHE_RECONCILIATION_AUTHORITY_V2.json",authority)
    report={"schema_version":"audit005-jsonschema-cache-reconciliation-terminal-report-v2","status":"PASS","errors":[],"authority_path":str(NS/"CACHE_RECONCILIATION_AUTHORITY_V2.json"),"authority_sha256":sha(NS/"CACHE_RECONCILIATION_AUTHORITY_V2.json"),"semantic_tree_file_count":152,"semantic_tree_sha256":live["semantic_root"],"cache_file_count":39,"cache_tree_sha256":live["cache_root"],"runtime_tree_file_count":191,"runtime_tree_sha256":live["runtime_root"],"cache_validation":{"all_regular_direct_pycache_pyc":True,"all_cpython_312":True,"all_magic_valid":True,"all_sources_exist":True,"all_timestamp_and_size_match":True,"symlink_count":0,"path_escape_count":0},"runtime_probe":live["runtime_probe"],"tests":tests,"activation_authorized":False,"launch_authorized":False,"credits":0}
    write_json(NS/"validation/terminal-cache-reconciliation-v2.json",report)
    print(json.dumps({"status":"PASS","authority_sha256":sha(NS/"CACHE_RECONCILIATION_AUTHORITY_V2.json"),"report_sha256":sha(NS/"validation/terminal-cache-reconciliation-v2.json"),"semantic_root":live["semantic_root"],"cache_root":live["cache_root"],"runtime_root":live["runtime_root"],"tests":tests["counts"],"test_digest":tests["test_digest"]},sort_keys=True))
if __name__=="__main__":main()
