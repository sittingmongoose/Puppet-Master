#!/usr/bin/env python3
"""Independent read-only check for the normalized native Goal action harness."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from typing import Any


BASE = Path(__file__).resolve().parent
V6 = BASE / "goal_mode_empirical_harness_v6"
FILES = (
    ("goal_mode_empirical_harness_v6/goal_mode_contract.json", V6 / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v6/goal_mode_harness.py", V6 / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v6/goal_mode_single_process_attestor.py", V6 / "goal_mode_single_process_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    ("r9_goal_mode_matrix_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_matrix_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_single_process_canary_001_success_receipt_v1.json", BASE / "r9_goal_mode_single_process_canary_001_success_receipt_v1.json"),
)
GOAL_NAMES = {"get_goal", "create_goal", "update_goal"}
TOOL_RE = re.compile(r"tools\.([A-Za-z_][A-Za-z0-9_]*)")


class Invalid(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key:{key}")
        result[key] = value
    return result


def loads(raw: bytes, label: str) -> Any:
    try:
        return json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"{label} JSON:{exc}") from exc


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    st = os.lstat(path)
    require(stat.S_ISREG(st.st_mode) and not path.is_symlink() and 0 <= st.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes(); after = os.lstat(path)
    require((st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==st.st_size, f"changing file:{path}")
    return raw


def load_canonical(path: Path) -> Any:
    raw = read_regular(path)
    require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    value = loads(raw, str(path)); require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(label: str, path: Path) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":hashlib.sha256(raw).hexdigest()}


def rollout(path: Path) -> list[dict[str, Any]]:
    raw = read_regular(path); require(raw.endswith(b"\n"), "rollout LF")
    rows=[]
    for line_no,line in enumerate(raw.splitlines(),1):
        require(line and b"\r" not in line, f"rollout framing:{line_no}")
        value=loads(line,f"rollout:{line_no}"); require(isinstance(value,dict),f"rollout object:{line_no}"); rows.append({"line":line_no,"value":value})
    return rows


def payload(entry: dict[str, Any]) -> dict[str, Any]:
    value=entry["value"].get("payload")
    return value if isinstance(value,dict) else {}


def direct_goal_sequence(rows: list[dict[str, Any]]) -> tuple[list[str], list[int]]:
    outputs={payload(row).get("call_id") for row in rows if payload(row).get("type")=="function_call_output"}
    calls=[]; lines=[]
    for row in rows:
        item=payload(row)
        if item.get("type")=="function_call" and item.get("name") in GOAL_NAMES:
            require(isinstance(item.get("call_id"),str) and item["call_id"] in outputs, "direct Goal output")
            arguments=item.get("arguments"); require(isinstance(arguments,str) and isinstance(loads(arguments.encode(),"direct arguments"),dict), "direct Goal arguments")
            calls.append(item["name"]); lines.append(row["line"])
    return calls,lines


def nested_goal_sequence(rows: list[dict[str, Any]]) -> list[str]:
    outputs={payload(row).get("call_id") for row in rows if payload(row).get("type")=="custom_tool_call_output"}
    result=[]
    for row in rows:
        item=payload(row)
        if item.get("type")!="custom_tool_call": continue
        code=item.get("input")
        if not isinstance(code,str): continue
        methods=[name for name in TOOL_RE.findall(code) if name in GOAL_NAMES]
        if methods:
            require(item.get("name")=="exec" and len(methods)==1 and item.get("call_id") in outputs, "nested Goal projection")
            result.extend(methods)
    return result


def check(args: argparse.Namespace) -> dict[str, Any]:
    bindings=[identity(label,path) for label,path in FILES]
    require(all(row["mode"]=="0644" for row in bindings), "source mode")
    contract=load_canonical(V6/"goal_mode_contract.json")
    require(contract["schema_id"]=="pw-r9-goal-mode-empirical-harness-contract-v6" and contract["authority"]=={"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False}, "contract authority")
    require(contract["architecture"]["goal_action_projection"]=="CLOSED_NORMALIZATION_OF_DIRECT_NATIVE_FUNCTION_OR_NESTED_CODE_MODE_EXEC", "normalization contract")
    require(contract["omp_lane"]["launch_argv"]==["omp","--cwd","P:\\"] and contract["omp_lane"]["duplicate_spawn"] is False and contract["omp_lane"]["linux_process_absence_is_not_evidence"] is True, "OMP boundary")
    harness=read_regular(V6/"goal_mode_harness.py").decode(); attestor=read_regular(V6/"goal_mode_single_process_attestor.py").decode()
    ast.parse(harness); tree=ast.parse(attestor)
    functions={node.name for node in ast.walk(tree) if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef))}
    require({"_native_goal_calls","_exact_goal_invocation","_reader_call","_reader_result","attest_release","attest_final"} <= functions, "normalizer functions")
    for token in ("DIRECT_NATIVE_FUNCTION","NESTED_CODE_MODE_EXEC","function_call_output","custom_tool_call_output","pre-Goal action","unexpected subject action"):
        require(token in attestor, f"attestor token:{token}")
    require("resume" not in {choice for node in ast.walk(ast.parse(harness)) if isinstance(node,ast.Constant) and isinstance(node.value,str) for choice in [node.value] if choice in {"resume","exec resume"}}, "resume literal")

    failure=load_canonical(BASE/"r9_goal_mode_matrix_001_runtime_failure_receipt_v1.json")
    require(failure["status"]=="FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY_MATRIX_002_FROZEN" and failure["accounting"]=={"aborted_rows":288,"consumed_rows":3,"failed_rows":3,"matrix_attempts":1,"passed_rows":0,"planned_rows":291,"qualification_credit":0,"qualification_streak_clean_matrices":0,"retries":0,"subject_deliveries":0}, "failure lineage")
    direct=[]
    for index,row in enumerate(failure["consumed_rows"]):
        path=args.codex_home/row["rollout"]["logical_path"]
        raw=read_regular(path); require(len(raw)==row["rollout"]["bytes"] and hashlib.sha256(raw).hexdigest()==row["rollout"]["sha256"], f"rollout identity:{index}")
        records=rollout(path); sequence,lines=direct_goal_sequence(records); require(sequence==["get_goal","create_goal","get_goal"],f"direct sequence:{index}")
        web_lines=[entry["line"] for entry in records if payload(entry).get("type")=="web_search_call"]
        direct.append({"pre_goal_web_search":bool(web_lines and web_lines[0]<lines[0]),"row_id":row["row_id"],"sequence":sequence,"task_id":row["task_id"]})
    require([row["pre_goal_web_search"] for row in direct]==[False,True,False], "pre-Goal mutation witness")

    canary=load_canonical(BASE/"r9_goal_mode_single_process_canary_001_success_receipt_v1.json")
    task_id=canary["lifecycle"]["goal"]["thread_id"]
    candidates=sorted((args.codex_home/"sessions").rglob(f"*{task_id}.jsonl"))
    require(len(candidates)==1, "nested canary rollout")
    nested=nested_goal_sequence(rollout(candidates[0])); require(nested==["get_goal","create_goal","get_goal","update_goal"], "nested Goal sequence")

    version=subprocess.run([str(args.codex),"--version"],stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,timeout=10)
    require(version.returncode==0 and version.stderr==b"" and version.stdout==b"codex-cli 0.148.0\n", "Codex version")
    return {"authority":{"canary_admission_eligible":True,"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"bindings":bindings,"checks":{"direct_native_rows":direct,"goal_action_projection":"PASS_BOTH_CLOSED_REPRESENTATIONS","nested_code_mode_sequence":nested,"no_subject_delivery_matrix_001":True,"omp_boundary":"PASS_UNTOUCHED_WINDOWS_HOST","pre_goal_non_goal_action_rejected":True,"source_ast":"PASS"},"first_mismatch":None,"schema_id":"pw-r9-goal-mode-harness-v6-independent-check-v1","status":"PASS_INDEPENDENT_STATIC_NORMALIZATION_CHECK_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
    parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.add_argument("--codex-home",type=Path,required=True); parser.add_argument("--codex",type=Path,required=True); args=parser.parse_args()
    try: result=check(args); rc=0
    except (Invalid,OSError,subprocess.SubprocessError) as exc: result={"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-harness-v6-independent-check-v1","status":"FAIL_ZERO_CREDIT_NO_LAUNCH"}; rc=1
    sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__":
    raise SystemExit(main())
