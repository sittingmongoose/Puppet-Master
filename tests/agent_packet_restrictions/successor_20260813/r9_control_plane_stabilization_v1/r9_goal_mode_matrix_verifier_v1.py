#!/usr/bin/env python3
"""Read-only independent verifier for one complete Goal-per-row matrix."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import stat
import sys
from typing import Any


BASE=Path(__file__).resolve().parent
V5=BASE/"goal_mode_empirical_harness_v5"
sys.path.insert(0,str(V5))
import goal_mode_single_process_attestor as ga  # noqa:E402


MATRIX_ID="goal-mode-single-process-matrix-001"
ROW_COUNT=291
MANIFEST=BASE/"goal_mode_matrix_pair_001_002_inputs_v1"/"manifest.json"
CANARY=BASE/"r9_goal_mode_single_process_canary_001_success_receipt_v1.json"


def require(value: bool,message: str) -> None:
 if not value: raise ga.Invalid(message)


def identity(path: Path,label: str,limit: int=64_000_000) -> dict[str,Any]:
 raw=ga.base._read_regular(path,limit); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":ga.sha256(raw)}


def manifest_matrix(manifest: dict[str,Any],matrix_id: str) -> dict[str,Any]:
 rows=[item for item in manifest["matrices"] if item.get("matrix_id")==matrix_id]; require(len(rows)==1,"matrix manifest cardinality"); matrix=rows[0]; require(matrix["row_count"]==ROW_COUNT and len(matrix["rows"])==ROW_COUNT,"matrix rows"); return matrix


def capture_inventory(root: Path) -> tuple[list[dict[str,Any]],bytes]:
 rows=[]
 for path in sorted(root.rglob("*"),key=lambda p:p.relative_to(root).as_posix()):
  st=os.lstat(path); rel=path.relative_to(root).as_posix()
  require(not path.is_symlink(),f"symlink:{rel}")
  if stat.S_ISDIR(st.st_mode): require(stat.S_IMODE(st.st_mode)==0o700,f"directory mode:{rel}"); continue
  require(stat.S_ISREG(st.st_mode) and stat.S_IMODE(st.st_mode)==0o600,f"file mode/type:{rel}"); raw=ga.base._read_regular(path,256_000_000); rows.append({"bytes":len(raw),"mode":"0600","path":rel,"sha256":ga.sha256(raw)})
 raw=ga.canon(rows,newline=False); return rows,raw


def verify(matrix_id: str,evidence: Path,codex_home: Path) -> dict[str,Any]:
 require(matrix_id==MATRIX_ID,"verifier only admits Matrix001"); manifest=ga.load_json(MANIFEST,16_000_000); matrix=manifest_matrix(manifest,matrix_id); require(evidence.is_dir() and not evidence.is_symlink() and stat.S_IMODE(os.lstat(evidence).st_mode)==0o700,"evidence root")
 terminal=ga.load_json(evidence/"matrix_terminal.json",4_000_000); require(terminal=={"accounting":{"aborted":0,"consumed":291,"failed":0,"passed":291,"planned":291,"qualification_credit":0,"retries":0},"first_failure":None,"matrix_id":matrix_id,"schema_id":"pw-r9-goal-mode-matrix-controller-terminal-v1","started_at_ms":terminal["started_at_ms"],"status":"PASS_ALL_ROWS_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY"} and isinstance(terminal["started_at_ms"],int),"matrix terminal")
 canary=ga.load_json(CANARY,8_000_000); prior_threads={canary["lifecycle"]["goal"]["thread_id"]}; prior_goals={canary["lifecycle"]["goal"]["goal_id"]}; threads=set(); goals=set(); turns=set(); row_capture_projection=[]
 for index,item in enumerate(matrix["rows"]):
  require(item["index"]==index and item["row_id"]==f"row-{index:03d}","row order"); row_path=MANIFEST.parent/item["row_spec"]["path"]; subject_path=MANIFEST.parent/item["subject"]["path"]; row_raw=ga.base._read_regular(row_path,2_000_000); subject=ga.base._read_regular(subject_path,8_000_000); require(len(row_raw)==item["row_spec"]["bytes"] and ga.sha256(row_raw)==item["row_spec"]["sha256"] and len(subject)==item["subject"]["bytes"] and ga.sha256(subject)==item["subject"]["sha256"],"input identity")
  row=ga.load_row(row_path); require(row["run_id"]==matrix_id and row["row_id"]==item["row_id"] and row["criteria"]["expected_exact_utf8"].encode()==ga.base._read_regular(evidence/f"rows/row-{index:03d}/output_last_message.txt",8_000_000),"row answer")
  capture=evidence/f"rows/row-{index:03d}"; attestation=ga.attest_final(row_path,capture,codex_home); stored=ga.load_json(capture/"goal_mode_attestation.json",8_000_000); require(attestation==stored and attestation["status"]=="PASS_SINGLE_PROCESS_NATIVE_GOAL_LIFECYCLE_ZERO_CREDIT","row attestation")
  goal=attestation["goal"]; require(goal["status"]=="complete" and goal["thread_id"] not in prior_threads|threads and goal["goal_id"] not in prior_goals|goals and goal["turn_id"] not in turns,"runtime identity uniqueness"); threads.add(goal["thread_id"]); goals.add(goal["goal_id"]); turns.add(goal["turn_id"])
  receipt=ga.load_json(capture/"process_receipt.json",4_000_000); require(receipt["rc"]==0 and receipt["timed_out"] is False and receipt["subject_release"]=="AFTER_SAME_PROCESS_NATIVE_GOAL_ACTIVE_ATTESTATION" and receipt["reader_quiescence"]=={"detected_pids":[],"kill_sent":0,"remaining_pids":[],"term_sent":0},"row process")
  stdout_path=evidence/f"controller_results/row-{index:03d}.stdout"; stderr_path=evidence/f"controller_results/row-{index:03d}.stderr"; process_path=evidence/f"controller_results/row-{index:03d}.receipt.json"; stdout=ga.base._read_regular(stdout_path,8_000_000); stderr=ga.base._read_regular(stderr_path,8_000_000); outer=ga.load_json(process_path,4_000_000); parsed=json.loads(stdout); require(stderr==b"" and outer["status"]=="PASS" and outer["rc"]==0 and outer["index"]==index and outer["stdout"]=={"bytes":len(stdout),"sha256":ga.sha256(stdout)} and outer["stderr"]=={"bytes":0,"sha256":ga.sha256(b"")},"outer process"); require(parsed["attestation"]==attestation and parsed["index"]==index and parsed["row_id"]==item["row_id"] and parsed["status"]=="PASS_ROW_ZERO_CREDIT_PENDING_MATRIX_VERIFY","outer result")
  files=[identity(p,p.name) for p in sorted(capture.iterdir(),key=lambda p:p.name)]; require(len(files)==11,"row capture file count"); projection=ga.canon(files,newline=False); row_capture_projection.append({"bytes":len(projection),"index":index,"sha256":ga.sha256(projection)})
 require(len(threads)==len(goals)==len(turns)==ROW_COUNT,"global identity cardinality")
 inventory,inventory_raw=capture_inventory(evidence); require(len(inventory)==4075,"matrix file count")
 rows_raw=ga.canon(row_capture_projection,newline=False)
 return {"authority":{"matrix_002_admission_candidate":True,"qualification_credit":1,"qualification_streak_clean_matrices":1,"release":False},"evidence_inventory":{"aggregate_file_bytes":sum(item["bytes"] for item in inventory),"file_count":len(inventory),"projection_bytes":len(inventory_raw),"projection_sha256":ga.sha256(inventory_raw)},"first_mismatch":None,"matrix_id":matrix_id,"row_capture_projection":{"bytes":len(rows_raw),"sha256":ga.sha256(rows_raw)},"runtime_identity_counts":{"goals":len(goals),"tasks":len(threads),"turns":len(turns)},"schema_id":"pw-r9-goal-mode-matrix-independent-verification-v1","status":"PASS_CLEAN_FULL_GOAL_MODE_MATRIX_STREAK_1_OF_2","verified_rows":ROW_COUNT}


def check() -> dict[str,Any]:
 manifest=ga.load_json(MANIFEST,16_000_000); matrix=manifest_matrix(manifest,MATRIX_ID); require(len({item["row_spec"]["sha256"] for item in matrix["rows"]})==291 and len({item["subject"]["sha256"] for item in matrix["rows"]})==97,"manifest uniqueness"); return {"authority":{"matrix_launch":False,"qualification_credit":0,"release":False},"checks":{"expected_file_count":4075,"fresh_runtime_identities":291,"matrix_id":MATRIX_ID,"read_only":True,"rows":291},"schema_id":"pw-r9-goal-mode-matrix-verifier-check-v1","status":"PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
 parser=argparse.ArgumentParser(); sub=parser.add_subparsers(dest="command",required=True); sub.add_parser("check"); run=sub.add_parser("verify"); run.add_argument("--matrix-id",required=True); run.add_argument("--evidence",type=Path,required=True); run.add_argument("--codex-home",type=Path,required=True); args=parser.parse_args(); result=check() if args.command=="check" else verify(args.matrix_id,args.evidence,args.codex_home); sys.stdout.buffer.write(ga.canon(result)); return 0


if __name__=="__main__":
 try: raise SystemExit(main())
 except (ga.Invalid,OSError,sqlite3.Error,UnicodeError,json.JSONDecodeError,KeyError,TypeError,ValueError) as exc:
  sys.stdout.buffer.write(ga.canon({"authority":{"qualification_credit":0,"release":False},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-matrix-independent-verification-v1","status":"FAIL_ZERO_CREDIT_NO_AUTHORITY"})); raise SystemExit(1)
