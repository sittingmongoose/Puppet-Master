#!/usr/bin/env python3
"""Read-only mechanical verification of the permanent Matrix005 Goal-terminal failure."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys
from typing import Any


BASE=Path(__file__).resolve().parent
HARNESS=BASE/"goal_mode_empirical_harness_v8"
sys.path.insert(0,str(HARNESS))
import goal_mode_single_process_attestor as ga  # noqa:E402

PAIR=BASE/"goal_mode_v9_causal_matrix_pair_005_006_inputs_v1"
MANIFEST=PAIR/"manifest.json"
EVIDENCE=BASE/"goal_mode_v9_causal_matrix_005_evidence"
MATRIX_ID="goal-mode-v9-causal-matrix-005"
ROUTER_RE=re.compile(r"^(?P<timestamp>[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z) ERROR codex_core::tools::router: error=collab spawn failed: no thread with id: (?P<thread_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\n$")


def require(ok: bool,message: str) -> None:
 if not ok: raise ga.Invalid(message)


def sha(raw: bytes) -> str: return hashlib.sha256(raw).hexdigest()


def pairs(items: list[tuple[str,Any]]) -> dict[str,Any]:
 out={}
 for key,value in items: require(key not in out,f"duplicate:{key}"); out[key]=value
 return out


def canon(value: Any,newline: bool=True) -> bytes:
 raw=json.dumps(value,ensure_ascii=False,allow_nan=False,sort_keys=True,separators=(",", ":")).encode(); return raw+(b"\n" if newline else b"")


def read(path: Path,limit: int=256_000_000) -> bytes:
 before=os.lstat(path); require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0<=before.st_size<=limit,f"unsafe:{path}"); raw=path.read_bytes(); after=os.lstat(path); require((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==before.st_size,f"drift:{path}"); return raw


def load(path: Path,limit: int=256_000_000) -> Any:
 raw=read(path,limit); require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw,f"framing:{path}"); value=json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda item:(_ for _ in ()).throw(ga.Invalid(f"nonfinite:{item}"))); require(raw==canon(value),f"noncanonical:{path}"); return value


def inventory(root: Path) -> dict[str,Any]:
 require(root.is_dir() and not root.is_symlink(),"evidence root"); files=[]; directories=[]
 for path in sorted(root.rglob("*"),key=lambda p:p.relative_to(root).as_posix()):
  rel=path.relative_to(root).as_posix(); st=os.lstat(path); require(not path.is_symlink(),f"symlink:{rel}")
  if stat.S_ISDIR(st.st_mode): require(stat.S_IMODE(st.st_mode)==0o700,f"directory mode:{rel}"); directories.append({"mode":"0700","path":rel})
  else:
   require(stat.S_ISREG(st.st_mode) and stat.S_IMODE(st.st_mode)==0o600,f"file mode:{rel}"); raw=read(path); files.append({"bytes":len(raw),"mode":"0600","path":rel,"sha256":sha(raw)})
 projection={"directories":directories,"files":files,"root_mode":f"{stat.S_IMODE(os.lstat(root).st_mode):04o}"}; raw=canon(projection,False)
 return {"aggregate_file_bytes":sum(x["bytes"] for x in files),"directory_count":len(directories),"file_count":len(files),"projection":projection,"projection_bytes":len(raw),"projection_sha256":sha(raw)}


def classify(raw: bytes,attestation: dict[str,Any],codex_home: Path) -> dict[str,Any]:
 current=attestation["goal"]["thread_id"]
 if raw==b"": return {"accepted":True,"bytes":0,"category":"EMPTY_STDERR","current_thread_id":current,"referenced_thread_id":None,"schema_id":"pw-r9-goal-mode-causal-stderr-classification-v1","sha256":sha(raw),"status":"PASS_EXACT_EMPTY_STDERR"}
 text=raw.decode("utf-8"); match=ROUTER_RE.fullmatch(text); require(match is not None,"stderr classifier"); referenced=match.group("thread_id"); require(referenced!=current,"current thread referenced"); rollout=read(codex_home/attestation["rollout"]["logical_path"],64_000_000); require(referenced.encode() not in rollout,"referenced thread in rollout")
 return {"accepted":True,"bytes":len(raw),"category":"ORPHANED_COLLAB_ROUTER_DIAGNOSTIC_NOT_SUBJECT_ACTION","current_thread_id":current,"referenced_thread_id":referenced,"schema_id":"pw-r9-goal-mode-causal-stderr-classification-v1","sha256":sha(raw),"status":"PASS_EXACT_CAUSALLY_DISJOINT_INTERNAL_ROUTER_DIAGNOSTIC"}


def check(codex_home: Path) -> dict[str,Any]:
 before=inventory(EVIDENCE); require(before["file_count"]==779 and before["directory_count"]==54,"inventory counts")
 terminal=load(EVIDENCE/"matrix_terminal.json"); require(terminal["schema_id"]=="pw-r9-goal-mode-v9-causal-matrix-controller-terminal-v1" and terminal["status"]=="FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY" and terminal["matrix_id"]==MATRIX_ID,"terminal")
 require(terminal["accounting"]=={"aborted_unlaunched":239,"consumed":52,"failed":1,"passed":51,"planned":291,"qualification_credit":0,"retries":0} and terminal["first_failure"]["index"]==51,"terminal accounting")
 manifest=load(MANIFEST,16_000_000); matrix=next(x for x in manifest["matrices"] if x["matrix_id"]==MATRIX_ID); require(len(matrix["rows"])==291,"manifest rows")
 threads=set(); goals=set(); turns=set(); categories=[]
 for index in range(51):
  row_id=f"row-{index:03d}"; item=matrix["rows"][index]; row_path=PAIR/item["row_spec"]["path"]; capture=EVIDENCE/"rows"/row_id; row=ga.load_row(row_path); attestation=ga.attest_final(row_path,capture,codex_home); stored=load(capture/"goal_mode_attestation.json"); require(attestation==stored,"stored attestation"); goal=attestation["goal"]; require(goal["status"]=="complete" and goal["thread_id"] not in threads and goal["goal_id"] not in goals and goal["turn_id"] not in turns,"identity/state"); threads.add(goal["thread_id"]); goals.add(goal["goal_id"]); turns.add(goal["turn_id"])
  classification=load(capture/"stderr_classification.json"); require(classify(read(capture/"stderr.bin"),attestation,codex_home)==classification,"classification"); categories.append(classification["category"]); require(read(capture/"output_last_message.txt")==row["criteria"]["expected_exact_utf8"].encode(),"answer")
  outer=load(EVIDENCE/"controller_results"/f"{row_id}.receipt.json"); require(outer["status"]=="PASS" and outer["rc"]==0 and outer["quiescent_before_next"] is True,"outer pass")
 row_id="row-051"; item=matrix["rows"][51]; row_path=PAIR/item["row_spec"]["path"]; row=ga.load_row(row_path); capture=EVIDENCE/"rows"/row_id
 identity,records,goal,rollout_raw,prompt_line,reader,argv=ga._common(row,capture,codex_home,complete=False); calls=ga._native_goal_calls(records)
 require(goal["status"]=="active" and [x["method"] for x in calls]==["get_goal","create_goal","get_goal"],"failure Goal state/actions"); require(read(capture/"output_last_message.txt")==row["criteria"]["expected_exact_utf8"].encode(),"failure exact answer"); require(not (capture/"goal_mode_attestation.json").exists() and not (capture/"stderr_classification.json").exists(),"no false final artifacts")
 process=load(capture/"process_receipt.json"); require(process["rc"]==0 and process["timed_out"] is False and process["subject_release"]=="AFTER_SAME_PROCESS_NATIVE_GOAL_ACTIVE_ATTESTATION" and process["reader_quiescence"]["remaining_pids"]==[],"failure process")
 outer=load(EVIDENCE/"controller_results/row-051.receipt.json"); failure=load(EVIDENCE/"controller_results/row-051.stdout"); require(outer["status"]=="FAIL" and outer["rc"]==1 and failure=={"authority":{"matrix_launch":False,"qualification_credit":0},"error":"Goal not complete","schema_id":"pw-r9-goal-mode-v9-causal-matrix-controller-failure-v1","status":"FAIL_ZERO_CREDIT_NO_RETRY"},"failure binding")
 require(not (BASE/"goal_mode_v9_causal_matrix_006_evidence").exists(),"Matrix006 must remain absent")
 after=inventory(EVIDENCE); require(before==after,"inventory changed")
 return {"authority":{"matrix_006_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False,"retry":False},"completed_prefix":{"goal_count":len(goals),"passed_rows":51,"stderr_categories":categories,"task_count":len(threads),"turn_count":len(turns)},"evidence":{"aggregate_file_bytes":before["aggregate_file_bytes"],"directory_count":before["directory_count"],"file_count":before["file_count"],"projection_bytes":before["projection_bytes"],"projection_sha256":before["projection_sha256"]},"failure":{"answer":{"bytes":len(read(capture/"output_last_message.txt")),"sha256":sha(read(capture/"output_last_message.txt"))},"goal":{"goal_id":goal["goal_id"],"status":goal["status"],"thread_id":goal["thread_id"],"turn_id":identity["turn_id"]},"goal_methods":[x["method"] for x in calls],"index":51,"normalized_family":"GOAL_TERMINAL_UPDATE_OMISSION_AFTER_VALID_SUBJECT_FINAL","outer_error":"Goal not complete","process_rc":process["rc"],"row_id":row_id},"first_mismatch":"row-051:Goal not complete","matrix_id":MATRIX_ID,"schema_id":"pw-r9-goal-mode-v9-causal-matrix-005-failure-mechanical-verify-v1","status":"PASS_MECHANICAL_CONFIRMATION_OF_PERMANENT_ZERO_CREDIT_GOAL_TERMINAL_FAILURE"}


def main() -> int:
 parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.add_argument("--codex-home",type=Path,required=True); args=parser.parse_args()
 try: result=check(args.codex_home); rc=0
 except (ga.Invalid,OSError,UnicodeError,ValueError,KeyError,TypeError,json.JSONDecodeError) as exc: result={"authority":{"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-v9-causal-matrix-005-failure-mechanical-verify-v1","status":"FAIL_MECHANICAL_VERIFY_ZERO_CREDIT"}; rc=1
 sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__": raise SystemExit(main())
