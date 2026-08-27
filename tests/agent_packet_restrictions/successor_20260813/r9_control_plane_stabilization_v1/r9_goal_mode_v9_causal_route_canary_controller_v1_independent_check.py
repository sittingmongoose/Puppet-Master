#!/usr/bin/env python3
"""Independent static check for the V9 causal-stderr Goal route canary controller."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any


BASE=Path(__file__).resolve().parent
CONTROLLER=BASE/"r9_goal_mode_v9_causal_route_canary_controller_v1.py"
MANIFEST=BASE/"goal_mode_v9_causal_route_canary_001_inputs/manifest.json"
RUN_ID="goal-mode-causal-stderr-canary-001"


class Invalid(RuntimeError): pass


def require(ok: bool,message: str) -> None:
 if not ok: raise Invalid(message)


def pairs(items: list[tuple[str,Any]]) -> dict[str,Any]:
 out={}
 for key,value in items: require(key not in out,f"duplicate:{key}"); out[key]=value
 return out


def canon(value: Any) -> bytes: return json.dumps(value,ensure_ascii=False,allow_nan=False,sort_keys=True,separators=(",", ":")).encode()+b"\n"


def read(path: Path,limit: int=32_000_000) -> bytes:
 st=os.lstat(path); require(stat.S_ISREG(st.st_mode) and not path.is_symlink() and 0<=st.st_size<=limit,f"unsafe:{path}"); raw=path.read_bytes(); after=os.lstat(path); require((st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==st.st_size,f"drift:{path}"); return raw


def load(path: Path) -> Any:
 raw=read(path); require(raw.endswith(b"\n") and b"\r" not in raw,"framing")
 try: value=json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda item:(_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
 except json.JSONDecodeError as exc: raise Invalid(str(exc)) from exc
 require(raw==canon(value),f"noncanonical:{path}"); return value


def identity(label: str,path: Path) -> dict[str,Any]:
 raw=read(path); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":hashlib.sha256(raw).hexdigest()}


def source_bindings() -> list[dict[str,Any]]:
 rels=(
  "r9_goal_mode_v9_causal_route_canary_controller_v1.py",
  "goal_mode_v9_causal_route_canary_001_inputs/manifest.json",
  "goal_mode_empirical_harness_v8/goal_mode_contract.json",
  "goal_mode_empirical_harness_v8/goal_mode_harness.py",
  "goal_mode_empirical_harness_v8/goal_mode_single_process_attestor.py",
  "goal_mode_empirical_harness_v4/read_goal_subject.py",
  "r9_goal_mode_harness_v8_independent_static_review_v1.json",
  "r9_goal_mode_v7_route_canary_001_runtime_failure_receipt_v1.json",
  "r9_goal_mode_v8_serial_route_canary_001_success_receipt_v1.json",
  "r9_goal_mode_v8_serial_matrix_003_runtime_failure_receipt_v1.json",
  "r9_goal_mode_per_test_taker_binding_correction_v2.json",
  "r9_goal_mode_omp_windows_transport_clarification_v3.json",
  "r9_goal_mode_v9_causal_route_canary_001_row_000_admission_v1.json",
  "r9_goal_mode_v9_causal_route_canary_001_row_001_admission_v1.json",
  "r9_goal_mode_v9_causal_route_canary_001_row_002_admission_v1.json",
 )
 return [identity(rel,BASE/rel) for rel in rels]


def check() -> dict[str,Any]:
 source=read(CONTROLLER).decode(); tree=ast.parse(source); constants=[node.value for node in ast.walk(tree) if isinstance(node,ast.Constant)]
 require(constants.count(RUN_ID)>=1,"run id constant")
 assignments={node.targets[0].id:node.value.value for node in ast.walk(tree) if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name) and isinstance(node.value,ast.Constant)}
 require(assignments.get("ROW_COUNT")==3 and assignments.get("MAX_PARALLEL")==1,"serialized envelope constants")
 popens=[node for node in ast.walk(tree) if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute) and node.func.attr=="Popen"]
 require(len(popens)==1,"Popen site count")
 require("procs=[]" not in source and "launch_one(index,args,capture,results)" in source,"no batch process collection")
 launch_at=source.index("receipt=launch_one(index,args,capture,results)"); break_at=source.index('if receipt["status"]!="PASS": break'); require(launch_at<break_at,"fail-fast order")
 require('"quiescent_before_next":quiescent' in source and 'all(row["quiescent_before_next"] for row in receipts)' in source,"quiescence bound")
 require("PASS_THREE_ROUTE_CAUSAL_STDERR_GOAL_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" in source,"causal terminal")
 require("PASS_SINGLE_PROCESS_NATIVE_GOAL_CAUSAL_STDERR_ZERO_CREDIT" in source and 'parsed["attestation"].get("status")=="PASS_SINGLE_PROCESS_NATIVE_GOAL_LIFECYCLE_ZERO_CREDIT"' in source and 'parsed["stderr_classification"].get("accepted") is True' in source,"closed wrapper gate")
 manifest=load(MANIFEST); require(manifest["run_id"]==RUN_ID and manifest["row_count"]==3 and manifest["max_parallel"]==1,"manifest envelope")
 require(manifest["isolation"]=={"accepted_stderr_classes":["EMPTY","EXACT_SINGLE_ORPHAN_ROUTER_LINE_CAUSALLY_DISJOINT"],"attestation_before_stderr_classification":True,"between_rows":"FULL_PROCESS_EXIT_CAPTURE_CLOSE_READER_QUIESCENCE","fail_fast":True,"max_parallel":1,"mode":"SERIAL_DISTINCT_CODEX_EXEC_PROCESSES","no_generic_stderr_suppression":True},"manifest isolation")
 require(manifest["omp_boundary"]=={"duplicate_launch":False,"existing_launch":"omp --cwd P:\\","linux_process_inference":False,"native_goal_required_per_fresh_omp_test_taker":True,"status":"PRESERVED_UNTOUCHED"},"manifest OMP boundary")
 expected=[("slot-alpha","gpt-5.4-mini","xhigh"),("slot-bravo","gpt-5.4-mini","medium"),("slot-charlie","gpt-5.6-luna","medium")]; input_rows=[]
 for index,triple in enumerate(expected):
  row=manifest["rows"][index]; require((row["route"],row["model"],row["reasoning_effort"])==triple and row["row_id"]==f"row-{index:03d}",f"route:{index}")
  for key in ("control_envelope","criteria","row_spec","subject"):
   ref=row[key]; require(identity(ref["path"],MANIFEST.parent/ref["path"])==ref,f"identity:{index}:{key}")
  spec=load(MANIFEST.parent/row["row_spec"]["path"]); require(spec["control_envelope"]==load(MANIFEST.parent/row["control_envelope"]["path"]) and spec["criteria"]==load(MANIFEST.parent/row["criteria"]["path"]),"committed inputs")
  require(spec["control_envelope"]["max_parallel"]==1 and spec["control_envelope"]["serialized"] is True and spec["control_envelope"]["causal_stderr_classifier"] is True,"row causal serialized")
  admission=BASE/f"r9_goal_mode_v9_causal_route_canary_001_row_{index:03d}_admission_v1.json"; value=load(admission); require(value["schema_id"]=="pw-r9-goal-mode-row-admission-v8" and value["authority"]["run_id"]==RUN_ID and value["authority"]["row_id"]==f"row-{index:03d}" and value["authority"]["retry"] is False,"row admission")
  input_rows.append({"index":index,"model":row["model"],"reasoning_effort":row["reasoning_effort"],"route":row["route"],"row_id":row["row_id"]})
 bindings=source_bindings(); require(all(row["mode"]=="0644" for row in bindings),"binding mode")
 harness_review=load(BASE/"r9_goal_mode_harness_v8_independent_static_review_v1.json"); require(harness_review["status"]=="PASS_INDEPENDENT_STATIC_REVIEW_CAUSAL_STDERR_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH" and harness_review["first_mismatch"] is None,"harness review")
 matrix_failure=load(BASE/"r9_goal_mode_v8_serial_matrix_003_runtime_failure_receipt_v1.json"); require(matrix_failure["authority"]["qualification_credit"]==0 and matrix_failure["authority"]["matrix_launch"] is False,"Matrix003 preserved")
 omp=load(BASE/"r9_goal_mode_omp_windows_transport_clarification_v3.json"); require(omp["clarification"]["launch_boundary"]["argv"]==["omp","--cwd","P:\\"] and omp["clarification"]["duplicate_omp_spawn_forbidden"] is True and omp["clarification"]["linux_process_census_authority"] is False,"OMP boundary")
 correction=load(BASE/"r9_goal_mode_per_test_taker_binding_correction_v2.json"); require(correction["course_correction"]["every_fresh_test_taker_owns_and_activates_its_own_goal"] is True and correction["authority"]["qualification_streak_clean_matrices"]==0,"Goal correction")
 return {"authority":{"canary_admission_eligible":True,"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"bindings":bindings,"checks":{"causal_stderr_classifier":"PASS_EXACT_TWO_CLASS_AFTER_FULL_ATTESTATION","closed_wrapper_gate":"PASS_STATIC","fail_fast_unlaunched_suffix":"PASS_STATIC","input_rows":input_rows,"max_parallel":1,"no_batch_process_collection":"PASS_STATIC","no_generic_stderr_suppression":"PASS_STATIC","no_retry":"PASS_STATIC","omp_windows_boundary":"PASS_NO_DUPLICATE_OR_LINUX_INFERENCE","popen_sites":1,"row_count":3,"serialized_reap_and_reader_quiescence":"PASS_STATIC","v8_goal_attestation":"PASS_STATIC"},"first_mismatch":None,"schema_id":"pw-r9-goal-mode-v9-causal-route-canary-controller-independent-check-v1","status":"PASS_INDEPENDENT_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
 parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.parse_args()
 try: result=check(); rc=0
 except (Invalid,OSError,UnicodeError,SyntaxError) as exc: result={"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-v9-causal-route-canary-controller-independent-check-v1","status":"FAIL_ZERO_CREDIT_NO_LAUNCH"}; rc=1
 sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__": raise SystemExit(main())
