#!/usr/bin/env python3
"""Independent static/data-only checker for the single-process Goal harness."""

from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
import tempfile
from typing import Any


BASE = Path(__file__).resolve().parent
ROOT = BASE / "goal_mode_empirical_harness_v5"
V4_READER = BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"
EXPECTED_FAILURE = {
    "bytes": 6938,
    "path": "r9_goal_mode_canary_003_runtime_failure_receipt_v1.json",
    "sha256": "a91f18419326892d13328ff41a707f800b867a2620729e37f26df2f6a7d8f035",
}


class CheckFailure(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise CheckFailure(message)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def identity(label: str, path: Path) -> dict[str, Any]:
    st = os.lstat(path)
    require(stat.S_ISREG(st.st_mode) and not path.is_symlink(), f"unsafe source:{label}")
    raw = path.read_bytes()
    return {"bytes":len(raw),"mode":f"{stat.S_IMODE(st.st_mode):04o}","path":label,"sha256":hashlib.sha256(raw).hexdigest()}


def load_canonical(path: Path) -> dict[str, Any]:
    raw = path.read_bytes(); require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw, f"framing:{path.name}")
    value = json.loads(raw)
    require(isinstance(value, dict), f"object:{path.name}")
    expected = json.dumps(value,ensure_ascii=False,allow_nan=False,separators=(",",":"),sort_keys=True).encode()+b"\n"
    require(raw == expected, f"canonical:{path.name}")
    return value


def import_file(name: str, path: Path) -> Any:
    spec=importlib.util.spec_from_file_location(name,path); require(spec is not None and spec.loader is not None,f"import spec:{name}")
    module=importlib.util.module_from_spec(spec); sys.modules[name]=module; spec.loader.exec_module(module); return module


def popen_count(tree: ast.AST) -> int:
    return sum(isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute) and isinstance(node.func.value,ast.Name) and node.func.value.id=="subprocess" and node.func.attr=="Popen" for node in ast.walk(tree))


def main() -> int:
    parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); args=parser.parse_args()
    del args
    sources=[
        identity("goal_mode_empirical_harness_v5/goal_mode_contract.json",ROOT/"goal_mode_contract.json"),
        identity("goal_mode_empirical_harness_v5/goal_mode_harness.py",ROOT/"goal_mode_harness.py"),
        identity("goal_mode_empirical_harness_v5/goal_mode_single_process_attestor.py",ROOT/"goal_mode_single_process_attestor.py"),
        identity("goal_mode_empirical_harness_v4/read_goal_subject.py",V4_READER),
    ]
    require(all(row["mode"]=="0644" for row in sources),"source mode")
    failure_path=BASE/EXPECTED_FAILURE["path"]
    require(failure_path.stat().st_size==EXPECTED_FAILURE["bytes"] and digest(failure_path)==EXPECTED_FAILURE["sha256"],"Canary003 failure lineage")
    contract=load_canonical(ROOT/"goal_mode_contract.json")
    require(contract["schema_id"]=="pw-r9-goal-mode-empirical-harness-contract-v5","contract schema")
    require(contract["architecture"]=={"adapter":"CODEX_NATIVE_GOAL_SINGLE_PROCESS_ACTIVATE_THEN_FIFO_V1","goal_hierarchy":"ONE_FRESH_TEST_TAKER_TASK_WITH_ITS_OWN_NATIVE_GOAL","process_topology":"ONE_CODEX_EXEC_PROCESS_ONE_TASK_ONE_TURN","subject_visibility":"CONTROLLER_RELEASES_COMMITTED_FIFO_BYTES_ONLY_AFTER_DURABLE_ACTIVE_GOAL_GATE","terminal":"SAME_TASK_UPDATE_GOAL_COMPLETE_BEFORE_EXACT_FINAL"},"architecture closure")
    require(contract["loop_breaker"]=={"canary_004_patch":False,"continuation_prose_classifier":False,"exec_resume":False,"fifo_subject_delivery_reused":True,"new_process_topology":True,"retries":0},"loop breaker")
    require(contract["omp_lane"]=={"duplicate_spawn":False,"external_controller":"WINDOWS_HOST","launch_argv":["omp","--cwd","P:\\"],"linux_process_absence_is_not_evidence":True,"native_goal_required_per_fresh_omp_test_taker":True,"status":"EXISTING_EXTERNALLY_ARRANGED_LANE_UNTOUCHED"},"OMP boundary")
    harness_raw=(ROOT/"goal_mode_harness.py").read_text(); attestor_raw=(ROOT/"goal_mode_single_process_attestor.py").read_text()
    harness_tree=ast.parse(harness_raw,filename="goal_mode_harness.py"); ast.parse(attestor_raw,filename="goal_mode_single_process_attestor.py"); ast.parse(V4_READER.read_text(),filename="read_goal_subject.py")
    require(popen_count(harness_tree)==1,"exactly one Popen site")
    require("exec resume" not in harness_raw and "_resume_argv" not in harness_raw and "codex_internal_context" not in harness_raw+attestor_raw,"rejected continuation family survived")
    require(harness_raw.count("ga.attest_release(")==1 and harness_raw.index("ga.attest_release(")<harness_raw.index("_deliver(fifo,subject"),"release gate ordering")
    require(harness_raw.index('goal_active_subject_release_gate.json')<harness_raw.index("_deliver(fifo,subject"),"durable gate before delivery")
    require('"qualification_credit":0' in harness_raw.replace(" ", ""),"qualification source marker")
    sys.path.insert(0,str(ROOT)); attestor=import_file("v5_attestor_check",ROOT/"goal_mode_single_process_attestor.py"); harness=import_file("v5_harness_check",ROOT/"goal_mode_harness.py")
    sentinel=b"THIS_SENTINEL_SUBJECT_MUST_NOT_APPEAR_IN_BOOTSTRAP\n"
    criteria={"expected_exact_utf8":"{\"goal_mode\":\"single_process\"}","rule":"EXACT_UTF8_NO_DECORATION"}
    control={"canary":True,"goal_mode_required":True,"matrix":False,"qualification_credit":0,"subject_tools_allowed":False}
    row={"adapter":attestor.ADAPTER,"attempt":0,"cli_version":"0.148.0","control_envelope":control,"criteria":criteria,"model":"gpt-5.6-luna","objective":"","reasoning_effort":"medium","row_id":"row-000","run_id":"goal-mode-single-process-canary-001","schema_id":attestor.ROW_SCHEMA,"subject_utf8_bytes":len(sentinel),"subject_utf8_sha256":hashlib.sha256(sentinel).hexdigest()}
    row["objective"]=harness._expected_objective(row["run_id"],row["row_id"],criteria,control,row["subject_utf8_sha256"])
    with tempfile.TemporaryDirectory(prefix="r9-v5-check-") as tmp:
        tmp_path=Path(tmp); row_path=tmp_path/"row.json"
        row_path.write_bytes(attestor.canon(row)); os.chmod(row_path,0o600)
        require(attestor.load_row(row_path)==row,"row round trip")
        prompt=harness._prompt(row,tmp_path/"capture",Path("/mnt/Cursor/PuppetMaster"))
        require(sentinel not in prompt and row["subject_utf8_sha256"].encode() in prompt and str(len(sentinel)).encode() in prompt,"subject withheld commitment")
        positions=[prompt.index(attestor.get_goal_code().rstrip("\n").encode()),prompt.index(attestor.create_goal_code(row["objective"]).rstrip("\n").encode()),prompt.rindex(attestor.get_goal_code().rstrip("\n").encode()),prompt.index(attestor.reader_code(row,tmp_path/"capture",Path("/mnt/Cursor/PuppetMaster")).rstrip("\n").encode()),prompt.index(attestor.update_goal_code().rstrip("\n").encode())]
        require(positions==sorted(positions) and len(set(positions))==5,"prompt lifecycle order")
        mutations=[]
        for label,mutator in (
            ("adapter",lambda v:v.__setitem__("adapter","CODEX_NATIVE_GOAL_EXPLICIT_RESUME_FIFO_V4")),
            ("schema",lambda v:v.__setitem__("schema_id","pw-r9-goal-mode-row-spec-v4")),
            ("attempt",lambda v:v.__setitem__("attempt",1)),
            ("cli_version",lambda v:v.__setitem__("cli_version","0.149.0")),
            ("objective",lambda v:v.__setitem__("objective",v["objective"]+"x")),
            ("subject_hash",lambda v:v.__setitem__("subject_utf8_sha256","0"*64)),
        ):
            candidate=json.loads(json.dumps(row)); mutator(candidate); path=tmp_path/f"{label}.json"; path.write_bytes(attestor.canon(candidate)); os.chmod(path,0o600)
            try: attestor.load_row(path)
            except attestor.Invalid: mutations.append(label)
        require(len(mutations)==6,"row mutations")
    result={"assertions":24,"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"release":False},"bindings":sources,"first_mismatch":None,"mutation_rejections":6,"schema_id":"pw-r9-goal-mode-harness-v5-independent-static-check-v1","status":"PASS_INDEPENDENT_STATIC_DATA_ONLY_SINGLE_PROCESS_GOAL_HARNESS_ZERO_CREDIT_NO_LAUNCH","workspace_writes":0}
    sys.stdout.buffer.write(json.dumps(result,ensure_ascii=False,allow_nan=False,separators=(",",":"),sort_keys=True).encode()+b"\n"); return 0


if __name__=="__main__":
    try: raise SystemExit(main())
    except (CheckFailure,AssertionError,KeyError,TypeError,ValueError,OSError) as exc:
        sys.stdout.write(json.dumps({"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"release":False},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-harness-v5-independent-static-check-v1","status":"FAIL_INDEPENDENT_STATIC_ZERO_CREDIT_NO_LAUNCH","workspace_writes":0},sort_keys=True,separators=(",",":"))+"\n"); raise SystemExit(1)
