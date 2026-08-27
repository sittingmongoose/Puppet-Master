#!/usr/bin/env python3
"""Read-only independent reopen of the V9 causal-stderr native-Goal canary."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from pathlib import Path
import stat
import sys
from typing import Any


BASE=Path(__file__).resolve().parent
INPUTS=BASE/"goal_mode_v9_causal_route_canary_001_inputs"
EVIDENCE=BASE/"goal_mode_v9_causal_route_canary_001_evidence"
RUN_ID="goal-mode-causal-stderr-canary-001"
HARNESS=BASE/"goal_mode_empirical_harness_v8"
sys.path.insert(0,str(HARNESS))
import goal_mode_single_process_attestor as ga  # noqa: E402


ROUTER_STDERR_RE=re.compile(r"^(?P<timestamp>[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z) ERROR codex_core::tools::router: error=collab spawn failed: no thread with id: (?P<thread_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\n$")


class Invalid(RuntimeError): pass


def require(ok: bool,message: str) -> None:
 if not ok: raise Invalid(message)


def pairs(items: list[tuple[str,Any]]) -> dict[str,Any]:
 out={}
 for key,value in items: require(key not in out,f"duplicate:{key}"); out[key]=value
 return out


def canon(value: Any,newline: bool=True) -> bytes:
 raw=json.dumps(value,ensure_ascii=False,allow_nan=False,sort_keys=True,separators=(",", ":")).encode(); return raw+(b"\n" if newline else b"")


def read_regular(path: Path,limit: int=64_000_000) -> bytes:
 st=os.lstat(path); require(stat.S_ISREG(st.st_mode) and not path.is_symlink() and 0<=st.st_size<=limit,f"unsafe:{path}"); raw=path.read_bytes(); after=os.lstat(path); require((st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==st.st_size,f"drift:{path}"); return raw


def load(path: Path) -> Any:
 raw=read_regular(path); require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw,f"framing:{path}")
 try: value=json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda item:(_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
 except (json.JSONDecodeError,UnicodeDecodeError) as exc: raise Invalid(f"JSON:{path}:{exc}") from exc
 require(raw==canon(value),f"noncanonical:{path}"); return value


def sha(raw: bytes) -> str: return hashlib.sha256(raw).hexdigest()


def inventory(root: Path) -> dict[str,Any]:
 require(root.is_dir() and not root.is_symlink(),"evidence root")
 dirs=[]; files=[]
 for path in sorted(root.rglob("*"),key=lambda item:item.relative_to(root).as_posix()):
  rel=path.relative_to(root).as_posix(); st=os.lstat(path)
  if stat.S_ISDIR(st.st_mode) and not path.is_symlink(): dirs.append({"mode":f"{stat.S_IMODE(st.st_mode):04o}","path":rel})
  elif stat.S_ISREG(st.st_mode) and not path.is_symlink():
   raw=read_regular(path); files.append({"bytes":len(raw),"mode":f"{stat.S_IMODE(st.st_mode):04o}","path":rel,"sha256":sha(raw)})
  else: raise Invalid(f"nonregular inventory:{rel}")
 projection={"directories":dirs,"files":files,"root_mode":f"{stat.S_IMODE(os.lstat(root).st_mode):04o}"}; raw=canon(projection,newline=False)
 return {"aggregate_file_bytes":sum(row["bytes"] for row in files),"directory_count":len(dirs),"file_count":len(files),"projection":projection,"projection_bytes":len(raw),"projection_sha256":sha(raw)}


def prior_identities() -> dict[str,set[str]]:
 roots=(
  BASE/"goal_mode_single_process_canary_001_capture",
  BASE/"goal_mode_v6_route_canary_001_evidence",
  BASE/"goal_mode_v7_route_canary_001_evidence",
  BASE/"goal_mode_v8_serial_route_canary_001_evidence",
  BASE/"goal_mode_v8_serial_matrix_003_evidence",
 )
 values={"goal_id":set(),"thread_id":set(),"turn_id":set()}
 for root in roots:
  if not root.exists(): continue
  for path in sorted(root.rglob("goal_mode_attestation.json")):
   goal=load(path).get("goal",{})
   if isinstance(goal,dict):
    for key in values:
     if isinstance(goal.get(key),str): values[key].add(goal[key])
 return values


def classify_stderr(raw: bytes,attestation: dict[str,Any],codex_home: Path) -> dict[str,Any]:
 current=attestation["goal"]["thread_id"]
 if raw==b"":
  return {"accepted":True,"bytes":0,"category":"EMPTY_STDERR","current_thread_id":current,"referenced_thread_id":None,"schema_id":"pw-r9-goal-mode-causal-stderr-classification-v1","sha256":sha(raw),"status":"PASS_EXACT_EMPTY_STDERR"}
 try: text=raw.decode("utf-8")
 except UnicodeDecodeError as exc: raise Invalid("stderr non-UTF8") from exc
 match=ROUTER_STDERR_RE.fullmatch(text); require(match is not None,"stderr outside exact independent causal classifier")
 referenced=match.group("thread_id"); require(referenced!=current,"router diagnostic references current test-taker thread")
 rollout=read_regular(codex_home/attestation["rollout"]["logical_path"]); require(referenced.encode("ascii") not in rollout,"router diagnostic thread appears in test-taker rollout")
 return {"accepted":True,"bytes":len(raw),"category":"ORPHANED_COLLAB_ROUTER_DIAGNOSTIC_NOT_SUBJECT_ACTION","current_thread_id":current,"referenced_thread_id":referenced,"schema_id":"pw-r9-goal-mode-causal-stderr-classification-v1","sha256":sha(raw),"status":"PASS_EXACT_CAUSALLY_DISJOINT_INTERNAL_ROUTER_DIAGNOSTIC"}


def check(codex_home: Path) -> dict[str,Any]:
 before=inventory(EVIDENCE); projection=before["projection"]; require(projection["root_mode"]=="0700" and all(row["mode"]=="0700" for row in projection["directories"]) and all(row["mode"]=="0600" for row in projection["files"]),"evidence custody modes")
 terminal=load(EVIDENCE/"controller_terminal.json"); require(set(terminal)=={"accounting","first_failure","isolation","run_id","schema_id","started_at_ms","status"},"terminal keys"); require(terminal["schema_id"]=="pw-r9-goal-mode-v9-causal-route-canary-controller-terminal-v1" and terminal["status"]=="PASS_THREE_ROUTE_CAUSAL_STDERR_GOAL_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY","terminal status"); require(terminal["run_id"]==RUN_ID and terminal["accounting"]=={"aborted_unlaunched":0,"consumed":3,"failed":0,"passed":3,"planned":3,"qualification_credit":0,"retries":0} and terminal["first_failure"] is None,"terminal accounting"); require(terminal["isolation"]=={"all_consumed_rows_quiescent_before_successor":True,"max_parallel":1,"serialized":True},"terminal isolation")
 prior=prior_identities(); observed={"goal_id":set(),"thread_id":set(),"turn_id":set()}; rows=[]
 for index in range(3):
  row_id=f"row-{index:03d}"; capture=EVIDENCE/"rows"/row_id; result_root=EVIDENCE/"controller_results"; receipt=load(result_root/f"{row_id}.receipt.json")
  require(receipt["schema_id"]=="pw-r9-goal-mode-v9-causal-route-canary-row-process-receipt-v1" and receipt["status"]=="PASS" and receipt["index"]==index and receipt["row_id"]==row_id,"row receipt"); require(receipt["rc"]==0 and receipt["timed_out"] is False and receipt["process_reaped"] is True and receipt["quiescent_before_next"] is True,"row process closure"); require(receipt["stderr"]=={"bytes":0,"sha256":sha(b"")},"row controller stderr receipt")
  stdout=read_regular(result_root/f"{row_id}.stdout"); stderr=read_regular(result_root/f"{row_id}.stderr"); require(stderr==b"" and receipt["stdout"]=={"bytes":len(stdout),"sha256":sha(stdout)},"row controller streams")
  wrapper=json.loads(stdout,object_pairs_hook=pairs,parse_constant=lambda item:(_ for _ in ()).throw(Invalid(f"nonfinite:{item}"))); require(stdout==canon(wrapper),"controller stdout canonical wrapper"); require(set(wrapper)=={"attestation","schema_id","status","stderr_classification"} and wrapper["schema_id"]=="pw-r9-goal-mode-causal-stderr-row-result-v1" and wrapper["status"]=="PASS_SINGLE_PROCESS_NATIVE_GOAL_CAUSAL_STDERR_ZERO_CREDIT","controller wrapper")
  attestation=load(capture/"goal_mode_attestation.json"); classification=load(capture/"stderr_classification.json"); require(wrapper["attestation"]==attestation and wrapper["stderr_classification"]==classification,"controller stdout durable binding")
  stderr_raw=read_regular(capture/"stderr.bin"); require(classify_stderr(stderr_raw,attestation,codex_home)==classification and classification["accepted"] is True,"independent causal classification")
  launch=load(capture/"launch_receipt.json"); lexical_capture=Path(launch["argv"][17]).parent; workspace=Path(launch["argv"][4]); require(Path.cwd().resolve()==workspace.resolve() and (workspace/lexical_capture).resolve()==capture.resolve(),"launch lexical capture/workspace binding"); reopened=ga.attest_final(INPUTS/f"{row_id}.row.json",lexical_capture,codex_home); require(reopened==attestation,"independent attestor reopen mismatch")
  goal=attestation["goal"]; require(goal["status"]=="complete","Goal terminal")
  for key in observed:
   value=goal[key]; require(value not in observed[key] and value not in prior[key],f"identity reuse:{key}"); observed[key].add(value)
  spec=load(INPUTS/f"{row_id}.row.json"); expected=spec["criteria"]["expected_exact_utf8"].encode(); require(read_regular(capture/"subject_input.txt")==read_regular(INPUTS/f"{row_id}.subject.txt") and read_regular(capture/"output_last_message.txt")==expected,"subject/answer exact")
  process=load(capture/"process_receipt.json"); require(process["reader_quiescence"]["remaining_pids"]==[] and process["subject_fifo_removed"] is True and process["stdin_closed"] is True,"inner process quiescence")
  rows.append({"answer":{"bytes":len(expected),"sha256":sha(expected)},"goal":{"goal_id":goal["goal_id"],"status":goal["status"],"thread_id":goal["thread_id"],"turn_id":goal["turn_id"]},"index":index,"message_count":attestation["terminal"]["message_count"],"model":spec["model"],"reasoning_effort":spec["reasoning_effort"],"row_id":row_id,"stderr_classification":{"category":classification["category"],"referenced_thread_id":classification["referenced_thread_id"],"sha256":classification["sha256"]},"transport":attestation["transport"]})
 after=inventory(EVIDENCE); require(before==after,"evidence changed during reopen")
 require(all(len(observed[key])==3 for key in observed),"global uniqueness")
 return {"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"evidence":{"aggregate_file_bytes":before["aggregate_file_bytes"],"directory_count":before["directory_count"],"file_count":before["file_count"],"inventory_projection_bytes":before["projection_bytes"],"inventory_projection_sha256":before["projection_sha256"],"root":"goal_mode_v9_causal_route_canary_001_evidence"},"first_mismatch":None,"omp":{"calls":0,"duplicate_spawn":False,"launch_boundary":["omp","--cwd","P:\\"],"linux_process_inference":False},"rows":rows,"schema_id":"pw-r9-goal-mode-v9-causal-route-canary-independent-runtime-verify-v1","status":"PASS_INDEPENDENT_REOPEN_THREE_CAUSAL_STDERR_NATIVE_GOALS_ZERO_CREDIT_CANARY_ONLY"}


def main() -> int:
 parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.add_argument("--codex-home",type=Path,required=True); args=parser.parse_args()
 try: result=check(args.codex_home); rc=0
 except (Invalid,ga.Invalid,OSError,UnicodeError,ValueError) as exc: result={"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-v9-causal-route-canary-independent-runtime-verify-v1","status":"FAIL_ZERO_CREDIT_NO_MATRIX_AUTHORITY"}; rc=1
 sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__": raise SystemExit(main())

