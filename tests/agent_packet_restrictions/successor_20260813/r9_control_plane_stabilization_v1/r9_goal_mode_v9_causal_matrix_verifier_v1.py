#!/usr/bin/env python3
"""Read-only independent verifier for causal-stderr Goal-per-row matrices 005/006."""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
import sqlite3
import stat
import sys
from typing import Any


BASE=Path(__file__).resolve().parent
V8=BASE/"goal_mode_empirical_harness_v8"
sys.path.insert(0,str(V8))
import goal_mode_single_process_attestor as ga  # noqa:E402


MATRIX_IDS=("goal-mode-v9-causal-matrix-005","goal-mode-v9-causal-matrix-006")
ROW_COUNT=291
MANIFEST=BASE/"goal_mode_v9_causal_matrix_pair_005_006_inputs_v1"/"manifest.json"
CANARY=BASE/"r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json"
MATRIX_005_RECEIPT=BASE/"r9_goal_mode_v9_causal_matrix_005_success_receipt_v1.json"

ROUTER_STDERR_RE=re.compile(r"^(?P<timestamp>[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z) ERROR codex_core::tools::router: error=collab spawn failed: no thread with id: (?P<thread_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\n$")


def require(value: bool,message: str) -> None:
 if not value: raise ga.Invalid(message)


def identity(path: Path,label: str,limit: int=64_000_000) -> dict[str,Any]:
 raw=ga.base._read_regular(path,limit); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":ga.sha256(raw)}


def manifest_matrix(manifest: dict[str,Any],matrix_id: str) -> dict[str,Any]:
 rows=[item for item in manifest["matrices"] if item.get("matrix_id")==matrix_id]; require(len(rows)==1,"matrix manifest cardinality"); matrix=rows[0]; require(matrix["row_count"]==ROW_COUNT and len(matrix["rows"])==ROW_COUNT,"matrix rows"); return matrix


def capture_inventory(root: Path) -> tuple[list[dict[str,Any]],bytes,int]:
 rows=[]; directories=0
 for path in sorted(root.rglob("*"),key=lambda p:p.relative_to(root).as_posix()):
  st=os.lstat(path); rel=path.relative_to(root).as_posix(); require(not path.is_symlink(),f"symlink:{rel}")
  if stat.S_ISDIR(st.st_mode): require(stat.S_IMODE(st.st_mode)==0o700,f"directory mode:{rel}"); directories+=1; continue
  require(stat.S_ISREG(st.st_mode) and stat.S_IMODE(st.st_mode)==0o600,f"file mode/type:{rel}"); raw=ga.base._read_regular(path,256_000_000); rows.append({"bytes":len(raw),"mode":"0600","path":rel,"sha256":ga.sha256(raw)})
 raw=ga.canon(rows,newline=False); return rows,raw,directories


def prior_identities(matrix_id: str) -> tuple[set[str],set[str],set[str],dict[str,Any]]:
 canary=ga.load_json(CANARY,32_000_000); require(canary.get("status")=="PASS_THREE_ROUTE_CAUSAL_STDERR_NATIVE_GOAL_CANARY_ZERO_CREDIT_MATRIX_PAIR_DESIGN_ONLY","canary source")
 threads={row["goal"]["thread_id"] for row in canary["rows"]}; goals={row["goal"]["goal_id"] for row in canary["rows"]}; turns={row["goal"]["turn_id"] for row in canary["rows"]}
 predecessor={"identity":identity(CANARY,CANARY.name),"status":canary["status"]}
 if matrix_id==MATRIX_IDS[1]:
  prior=ga.load_json(MATRIX_005_RECEIPT,256_000_000); require(prior.get("status")=="PASS_CLEAN_FULL_CAUSAL_STDERR_NATIVE_GOAL_MATRIX_STREAK_1_OF_2_ZERO_QUALIFICATION_CREDIT" and prior.get("matrix_id")==MATRIX_IDS[0],"Matrix005 predecessor")
  for row in prior["rows"]: threads.add(row["goal"]["thread_id"]); goals.add(row["goal"]["goal_id"]); turns.add(row["goal"]["turn_id"])
  predecessor={"identity":identity(MATRIX_005_RECEIPT,MATRIX_005_RECEIPT.name,256_000_000),"status":prior["status"]}
 return threads,goals,turns,predecessor


def classify_stderr(raw: bytes,attestation: dict[str,Any],codex_home: Path) -> dict[str,Any]:
 current=attestation["goal"]["thread_id"]
 if raw==b"": return {"accepted":True,"bytes":0,"category":"EMPTY_STDERR","current_thread_id":current,"referenced_thread_id":None,"schema_id":"pw-r9-goal-mode-causal-stderr-classification-v1","sha256":ga.sha256(raw),"status":"PASS_EXACT_EMPTY_STDERR"}
 try: text=raw.decode("utf-8")
 except UnicodeDecodeError as exc: raise ga.Invalid("stderr non-UTF8") from exc
 match=ROUTER_STDERR_RE.fullmatch(text); require(match is not None,"stderr outside exact independent causal classifier"); referenced=match.group("thread_id"); require(referenced!=current,"router diagnostic references current task")
 rollout=ga.base._read_regular(codex_home/attestation["rollout"]["logical_path"],64_000_000); require(referenced.encode("ascii") not in rollout,"router diagnostic thread appears in task rollout")
 return {"accepted":True,"bytes":len(raw),"category":"ORPHANED_COLLAB_ROUTER_DIAGNOSTIC_NOT_SUBJECT_ACTION","current_thread_id":current,"referenced_thread_id":referenced,"schema_id":"pw-r9-goal-mode-causal-stderr-classification-v1","sha256":ga.sha256(raw),"status":"PASS_EXACT_CAUSALLY_DISJOINT_INTERNAL_ROUTER_DIAGNOSTIC"}


def verify(matrix_id: str,evidence: Path,codex_home: Path) -> dict[str,Any]:
 require(matrix_id in MATRIX_IDS,"matrix id"); manifest=ga.load_json(MANIFEST,16_000_000); require(manifest.get("schema_id")=="pw-r9-goal-mode-v9-causal-matrix-pair-input-manifest-v1" and manifest.get("pair_order")==list(MATRIX_IDS),"manifest schema/order"); matrix=manifest_matrix(manifest,matrix_id); require(evidence.is_absolute() and evidence.is_dir() and not evidence.is_symlink() and stat.S_IMODE(os.lstat(evidence).st_mode)==0o700,"evidence root")
 terminal=ga.load_json(evidence/"matrix_terminal.json",4_000_000); require(terminal=={"accounting":{"aborted_unlaunched":0,"consumed":291,"failed":0,"passed":291,"planned":291,"qualification_credit":0,"retries":0},"first_failure":None,"isolation":{"all_consumed_rows_quiescent_before_successor":True,"max_parallel":1,"serialized":True},"matrix_id":matrix_id,"schema_id":"pw-r9-goal-mode-v9-causal-matrix-controller-terminal-v1","started_at_ms":terminal["started_at_ms"],"status":"PASS_ALL_ROWS_CAUSAL_STDERR_NATIVE_GOALS_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY"} and isinstance(terminal["started_at_ms"],int),"matrix terminal")
 prior_threads,prior_goals,prior_turns,predecessor=prior_identities(matrix_id); threads=set(); goals=set(); turns=set(); row_capture_projection=[]; row_summaries=[]
 before,inventory_before,directory_count=capture_inventory(evidence)
 for index,item in enumerate(matrix["rows"]):
  row_id=f"row-{index:03d}"; require(item["index"]==index and item["row_id"]==row_id,"row order"); row_path=MANIFEST.parent/item["row_spec"]["path"]; subject_path=MANIFEST.parent/item["subject"]["path"]; row_raw=ga.base._read_regular(row_path,2_000_000); subject=ga.base._read_regular(subject_path,8_000_000); require(len(row_raw)==item["row_spec"]["bytes"] and ga.sha256(row_raw)==item["row_spec"]["sha256"] and len(subject)==item["subject"]["bytes"] and ga.sha256(subject)==item["subject"]["sha256"],"input identity")
  row=ga.load_row(row_path); capture=evidence/"rows"/row_id; require(row["run_id"]==matrix_id and row["row_id"]==row_id and row["control_envelope"]["max_parallel"]==1 and row["control_envelope"]["serialized"] is True and row["control_envelope"]["causal_stderr_classifier"] is True,"row authority"); require(row["criteria"]["expected_exact_utf8"].encode()==ga.base._read_regular(capture/"output_last_message.txt",8_000_000),"row answer")
  launch=ga.load_json(capture/"launch_receipt.json",2_000_000); lexical_capture=Path(launch["argv"][17]).parent; workspace=Path(launch["argv"][4]); require(lexical_capture.is_absolute() and lexical_capture.resolve()==capture.resolve() and workspace.resolve()==BASE.parents[4].resolve(),"launch capture/workspace")
  attestation=ga.attest_final(row_path,lexical_capture,codex_home); stored=ga.load_json(capture/"goal_mode_attestation.json",8_000_000); require(attestation==stored and attestation["status"]=="PASS_SINGLE_PROCESS_NATIVE_GOAL_LIFECYCLE_ZERO_CREDIT","row attestation")
  stderr_raw=ga.base._read_regular(capture/"stderr.bin",64_000_000); classification=ga.load_json(capture/"stderr_classification.json",4_000_000); require(classify_stderr(stderr_raw,attestation,codex_home)==classification and classification["accepted"] is True,"causal stderr classification")
  goal=attestation["goal"]; require(goal["status"]=="complete" and goal["thread_id"] not in prior_threads|threads and goal["goal_id"] not in prior_goals|goals and goal["turn_id"] not in prior_turns|turns,"runtime identity uniqueness"); threads.add(goal["thread_id"]); goals.add(goal["goal_id"]); turns.add(goal["turn_id"])
  receipt=ga.load_json(capture/"process_receipt.json",4_000_000); require(receipt["rc"]==0 and receipt["timed_out"] is False and receipt["subject_release"]=="AFTER_SAME_PROCESS_NATIVE_GOAL_ACTIVE_ATTESTATION" and receipt["reader_quiescence"]=={"detected_pids":[],"kill_sent":0,"remaining_pids":[],"term_sent":0} and receipt["subject_fifo_removed"] is True,"row process")
  result_root=evidence/"controller_results"; stdout_path=result_root/f"{row_id}.stdout"; stderr_path=result_root/f"{row_id}.stderr"; process_path=result_root/f"{row_id}.receipt.json"; stdout=ga.base._read_regular(stdout_path,8_000_000); stderr=ga.base._read_regular(stderr_path,8_000_000); outer=ga.load_json(process_path,4_000_000); parsed=json.loads(stdout); require(stderr==b"" and outer["status"]=="PASS" and outer["rc"]==0 and outer["index"]==index and outer["process_reaped"] is True and outer["quiescent_before_next"] is True and outer["stdout"]=={"bytes":len(stdout),"sha256":ga.sha256(stdout)} and outer["stderr"]=={"bytes":0,"sha256":ga.sha256(b"")},"outer process"); require(parsed["attestation"]==attestation and parsed["index"]==index and parsed["row_id"]==row_id and parsed["status"]=="PASS_ROW_CAUSAL_STDERR_NATIVE_GOAL_ZERO_CREDIT_PENDING_MATRIX_VERIFY" and parsed["stderr_classification"]==classification,"outer result")
  files=[identity(p,p.name) for p in sorted(capture.iterdir(),key=lambda p:p.name)]; require(len(files)==12,"row capture file count"); projection=ga.canon(files,newline=False); row_capture_projection.append({"bytes":len(projection),"index":index,"sha256":ga.sha256(projection)})
  expected=row["criteria"]["expected_exact_utf8"].encode(); row_summaries.append({"answer":{"bytes":len(expected),"sha256":ga.sha256(expected)},"goal":goal,"index":index,"message_count":attestation["terminal"]["message_count"],"model":row["model"],"reasoning_effort":row["reasoning_effort"],"row_id":row_id,"stderr_classification":{"category":classification["category"],"referenced_thread_id":classification["referenced_thread_id"],"sha256":classification["sha256"]},"transport":attestation["transport"]})
 require(len(threads)==len(goals)==len(turns)==ROW_COUNT,"global identity cardinality")
 after,inventory_after,directory_count_after=capture_inventory(evidence); require(before==after and inventory_before==inventory_after and directory_count==directory_count_after,"inventory changed during reopen"); require(len(after)==4366,"matrix file count")
 rows_raw=ga.canon(row_capture_projection,newline=False); streak=1 if matrix_id==MATRIX_IDS[0] else 2; status="PASS_CLEAN_FULL_CAUSAL_STDERR_NATIVE_GOAL_MATRIX_STREAK_1_OF_2_ZERO_QUALIFICATION_CREDIT" if streak==1 else "PASS_CLEAN_FULL_CAUSAL_STDERR_NATIVE_GOAL_MATRIX_STREAK_2_OF_2_QUALIFICATION_CANDIDATE"
 return {"authority":{"matrix_006_admission_candidate":streak==1,"qualification_candidate":streak==2,"qualification_credit":0 if streak==1 else 2,"qualification_streak_clean_matrices":streak,"release":False},"evidence_inventory":{"aggregate_file_bytes":sum(item["bytes"] for item in after),"directory_count":directory_count,"file_count":len(after),"projection_bytes":len(inventory_after),"projection_sha256":ga.sha256(inventory_after)},"first_mismatch":None,"matrix_id":matrix_id,"predecessor":predecessor,"row_capture_projection":{"bytes":len(rows_raw),"sha256":ga.sha256(rows_raw)},"rows":row_summaries,"runtime_identity_counts":{"goals":len(goals),"tasks":len(threads),"turns":len(turns)},"schema_id":"pw-r9-goal-mode-v9-causal-matrix-independent-verification-v1","status":status,"verified_rows":ROW_COUNT}


def check() -> dict[str,Any]:
 manifest=ga.load_json(MANIFEST,16_000_000); require(manifest.get("pair_order")==list(MATRIX_IDS) and manifest.get("architecture")=="CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_CAUSAL_STDERR_V4_SERIAL_MAX_PARALLEL_1","manifest architecture")
 for matrix_id in MATRIX_IDS:
  matrix=manifest_matrix(manifest,matrix_id); require(len({item["row_spec"]["sha256"] for item in matrix["rows"]})==291 and len({item["subject"]["sha256"] for item in matrix["rows"]})==97,"manifest uniqueness")
 return {"authority":{"matrix_launch":False,"qualification_credit":0,"release":False},"checks":{"expected_file_count":4366,"fresh_runtime_identities_per_matrix":291,"matrix_ids":list(MATRIX_IDS),"read_only":True,"rows_per_matrix":291,"serialized":True},"schema_id":"pw-r9-goal-mode-v9-causal-matrix-verifier-check-v1","status":"PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
 parser=argparse.ArgumentParser(); sub=parser.add_subparsers(dest="command",required=True); sub.add_parser("check"); run=sub.add_parser("verify"); run.add_argument("--matrix-id",required=True); run.add_argument("--evidence",type=Path,required=True); run.add_argument("--codex-home",type=Path,required=True); args=parser.parse_args(); result=check() if args.command=="check" else verify(args.matrix_id,args.evidence.resolve(),args.codex_home); sys.stdout.buffer.write(ga.canon(result)); return 0


if __name__=="__main__":
 try: raise SystemExit(main())
 except (ga.Invalid,OSError,sqlite3.Error,UnicodeError,json.JSONDecodeError,KeyError,TypeError,ValueError) as exc:
  sys.stdout.buffer.write(ga.canon({"authority":{"qualification_credit":0,"release":False},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-v9-causal-matrix-independent-verification-v1","status":"FAIL_ZERO_CREDIT_NO_AUTHORITY"})); raise SystemExit(1)

