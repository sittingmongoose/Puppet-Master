#!/usr/bin/env python3
"""Independent static check for the once-only V7 three-route canary controller."""

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
CONTROLLER=BASE/"r9_goal_mode_v7_route_canary_controller_v1.py"
MANIFEST=BASE/"goal_mode_v7_route_canary_001_inputs/manifest.json"
RUN_ID="goal-mode-closed-message-phase-canary-001"


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
 try: value=json.loads(raw,object_pairs_hook=pairs)
 except json.JSONDecodeError as exc: raise Invalid(str(exc)) from exc
 require(raw==canon(value),f"noncanonical:{path}"); return value


def identity(label: str,path: Path) -> dict[str,Any]:
 raw=read(path); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":hashlib.sha256(raw).hexdigest()}


def check() -> dict[str,Any]:
 source=read(CONTROLLER).decode(); tree=ast.parse(source); constants=[node.value for node in ast.walk(tree) if isinstance(node,ast.Constant)]
 require(constants.count(RUN_ID)>=1 and constants.count(3)>=2,"controller envelope constants")
 popens=[node for node in ast.walk(tree) if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute) and node.func.attr=="Popen"]
 require(len(popens)==1,"Popen site count")
 require("retry" not in {node.name for node in ast.walk(tree) if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef))},"retry function")
 require("range(ROW_COUNT)" in source and "for index,p,row_started in procs" in source and "PASS_THREE_ROUTE_GOAL_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" in source,"batch topology")
 manifest=load(MANIFEST); require(manifest["run_id"]==RUN_ID and manifest["row_count"]==3 and manifest["max_parallel"]==3,"manifest envelope")
 expected=[("slot-alpha","gpt-5.4-mini","xhigh"),("slot-bravo","gpt-5.4-mini","medium"),("slot-charlie","gpt-5.6-luna","medium")]
 input_rows=[]
 for index,triple in enumerate(expected):
  row=manifest["rows"][index]; require((row["route"],row["model"],row["reasoning_effort"])==triple and row["row_id"]==f"row-{index:03d}",f"route:{index}")
  for key in ("row_spec","subject"):
   ref=row[key]; p=MANIFEST.parent/ref["path"]; require(identity(ref["path"],p)==ref,f"identity:{index}:{key}")
  admission=BASE/f"r9_goal_mode_v7_route_canary_001_row_{index:03d}_admission_v1.json"; value=load(admission); require(value["authority"]["run_id"]==RUN_ID and value["authority"]["row_id"]==f"row-{index:03d}" and value["authority"]["retry"] is False,"row admission")
  input_rows.append({"index":index,"model":row["model"],"reasoning_effort":row["reasoning_effort"],"route":row["route"],"row_id":row["row_id"]})
 bindings=[identity("r9_goal_mode_v7_route_canary_controller_v1.py",CONTROLLER),identity("goal_mode_v7_route_canary_001_inputs/manifest.json",MANIFEST)]
 for rel in ("goal_mode_empirical_harness_v7/goal_mode_contract.json","goal_mode_empirical_harness_v7/goal_mode_harness.py","goal_mode_empirical_harness_v7/goal_mode_single_process_attestor.py","goal_mode_empirical_harness_v4/read_goal_subject.py","r9_goal_mode_harness_v7_independent_static_review_v1.json","r9_goal_mode_matrix_001_runtime_failure_receipt_v1.json","r9_goal_mode_v6_route_canary_001_runtime_failure_receipt_v1.json","r9_goal_mode_omp_windows_transport_clarification_v3.json","r9_goal_mode_v7_route_canary_001_row_000_admission_v1.json","r9_goal_mode_v7_route_canary_001_row_001_admission_v1.json","r9_goal_mode_v7_route_canary_001_row_002_admission_v1.json"):
  bindings.append(identity(rel,BASE/rel))
 require(all(row["mode"]=="0644" for row in bindings),"binding mode")
 return {"authority":{"canary_admission_eligible":True,"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"release":False},"bindings":bindings,"checks":{"input_rows":input_rows,"launches_before_wait":"PASS_STATIC","max_parallel":3,"no_retry":"PASS_STATIC","popen_sites":1,"row_count":3},"first_mismatch":None,"schema_id":"pw-r9-goal-mode-v7-route-canary-controller-independent-check-v1","status":"PASS_INDEPENDENT_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
 parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.parse_args()
 try: result=check(); rc=0
 except (Invalid,OSError) as exc: result={"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-v7-route-canary-controller-independent-check-v1","status":"FAIL_ZERO_CREDIT_NO_LAUNCH"}; rc=1
 sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__": raise SystemExit(main())

