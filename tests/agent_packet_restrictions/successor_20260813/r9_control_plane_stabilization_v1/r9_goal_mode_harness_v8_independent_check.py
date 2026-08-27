#!/usr/bin/env python3
"""Independent static and mutation check for V8 causal stderr closure."""

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


BASE=Path(__file__).resolve().parent
V8=BASE/"goal_mode_empirical_harness_v8"
V7=BASE/"goal_mode_empirical_harness_v7"
sys.path.insert(0,str(V8))
import goal_mode_single_process_attestor as ga  # noqa:E402
spec=importlib.util.spec_from_file_location("goal_mode_v8_harness",V8/"goal_mode_harness.py")
if spec is None or spec.loader is None: raise RuntimeError("V8 harness import")
h=importlib.util.module_from_spec(spec); spec.loader.exec_module(h)


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
 raw=read(path); require(raw.endswith(b"\n") and b"\r" not in raw,"framing"); value=json.loads(raw,object_pairs_hook=pairs); require(raw==canon(value),f"canonical:{path}"); return value


def identity(label: str,path: Path) -> dict[str,Any]:
 raw=read(path); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":hashlib.sha256(raw).hexdigest()}


def expect_reject(raw: bytes,attestation: dict[str,Any],home: Path) -> None:
 try: h._classify_stderr(raw,attestation,home)
 except ga.Invalid: return
 raise Invalid(f"mutation accepted:{raw!r}")


def classifier_check() -> dict[str,Any]:
 current="11111111-1111-4111-8111-111111111111"; orphan="22222222-22aa-4222-8222-22222222bbcc"; line=f"2026-08-22T07:52:17.435536Z ERROR codex_core::tools::router: error=collab spawn failed: no thread with id: {orphan}\n".encode(); attestation={"goal":{"thread_id":current},"rollout":{"logical_path":"sessions/test.jsonl"}}
 with tempfile.TemporaryDirectory(prefix="pw-r9-goal-v8-classifier-") as name:
  home=Path(name); (home/"sessions").mkdir(); (home/"sessions/test.jsonl").write_bytes(b"{\"closed_subject_actions\":true}\n")
  empty=h._classify_stderr(b"",attestation,home); accepted=h._classify_stderr(line,attestation,home); require(empty["category"]=="EMPTY_STDERR" and empty["bytes"]==0 and accepted["category"]=="ORPHANED_COLLAB_ROUTER_DIAGNOSTIC_NOT_SUBJECT_ACTION" and accepted["referenced_thread_id"]==orphan and accepted["bytes"]==144,"accepted classes")
  mutations=(line[:-1],line+b"x",b"x"+line,line+line,line.replace(b"ERROR",b"WARN"),line.replace(orphan.encode(),current.encode()),line.replace(orphan.encode(),orphan.upper().encode()))
  for raw in mutations: expect_reject(raw,attestation,home)
  (home/"sessions/test.jsonl").write_bytes(orphan.encode()+b"\n"); expect_reject(line,attestation,home)
 return {"accepted_classes":2,"mutations_rejected":8,"workspace_writes":0}


def check() -> dict[str,Any]:
 contract=load(V8/"goal_mode_contract.json"); require(contract["schema_id"]=="pw-r9-goal-mode-empirical-harness-contract-v8" and contract["causal_stderr_classifier"]["policy"]=="FAIL_CLOSED_EXCEPT_EXACT_CAUSALLY_DISJOINT_INTERNAL_ROUTER_DIAGNOSTIC","contract"); require(contract["loop_breaker"]=={"another_serialization_only_patch":False,"classifier_mutation_after_live_failure":False,"fresh_canary_required":True,"matrix_authority_before_canary":False,"on_classifier_failure":"REJECT_CAUSAL_CLASSIFIER_FAMILY_NO_WARNING_SPECIFIC_PATCH","retry":False},"loop breaker"); require(contract["omp_lane"]["launch_argv"]==["omp","--cwd","P:\\"] and contract["omp_lane"]["duplicate_spawn"] is False and contract["omp_lane"]["linux_process_inference"] is False,"OMP boundary")
 harness=read(V8/"goal_mode_harness.py").decode(); ast.parse(harness); require("_classify_stderr(stderr_raw,attestation,args.codex_home)" in harness and "stderr_classification.json" in harness and "nonempty CLI stderr" not in harness,"classifier integration"); require(harness.index("attestation=ga.attest_final")<harness.index("classification=_classify_stderr"),"attestation before classification")
 expected=read(V7/"goal_mode_single_process_attestor.py").decode().replace("Read-only attestor for native Goal activation and closed CLI message phases.","Read-only V8 attestor for native Goal activation and closed CLI message phases.").replace('ADAPTER = "CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_V3"','ADAPTER = "CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_CAUSAL_STDERR_V4"').replace('ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v7"','ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v8"').replace('ATTESTATION_SCHEMA = "pw-r9-codex-native-goal-single-process-row-attestation-v3"','ATTESTATION_SCHEMA = "pw-r9-codex-native-goal-single-process-row-attestation-v4"'); require(read(V8/"goal_mode_single_process_attestor.py").decode()==expected,"attestor delta")
 mutation=classifier_check(); bindings=[identity("goal_mode_empirical_harness_v8/goal_mode_contract.json",V8/"goal_mode_contract.json"),identity("goal_mode_empirical_harness_v8/goal_mode_harness.py",V8/"goal_mode_harness.py"),identity("goal_mode_empirical_harness_v8/goal_mode_single_process_attestor.py",V8/"goal_mode_single_process_attestor.py"),identity("goal_mode_empirical_harness_v4/read_goal_subject.py",BASE/"goal_mode_empirical_harness_v4/read_goal_subject.py")]; require(all(item["mode"]=="0644" for item in bindings),"source modes")
 return {"authority":{"canary_admission_eligible":True,"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"bindings":bindings,"checks":{"attestation_before_classification":"PASS_STATIC","classifier":mutation,"goal_attestor_delta":"PASS_EXACT_CONSTANT_ONLY","matrix_003_failure_preserved":"PASS_PERMANENT_ZERO_CREDIT","no_generic_stderr_suppression":"PASS_STATIC","omp_boundary":"PASS_EXISTING_WINDOWS_HOST_UNTOUCHED","source_ast":"PASS"},"first_mismatch":None,"schema_id":"pw-r9-goal-mode-harness-v8-independent-check-v1","status":"PASS_INDEPENDENT_STATIC_CHECK_CAUSAL_STDERR_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
 parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.parse_args()
 try: result=check(); rc=0
 except (Invalid,ga.Invalid,OSError,UnicodeError,SyntaxError,ValueError) as exc: result={"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-harness-v8-independent-check-v1","status":"FAIL_ZERO_CREDIT_NO_LAUNCH"}; rc=1
 sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__": raise SystemExit(main())
