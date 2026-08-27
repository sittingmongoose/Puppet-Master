#!/usr/bin/env python3
"""Fail-fast serialized controller for fresh causal-stderr Goal-per-row matrices 005/006."""

from __future__ import annotations

import argparse
import ast
import importlib.util
import json
import os
from pathlib import Path
import signal
import sqlite3
import stat
import subprocess
import sys
import time
from typing import Any


BASE=Path(__file__).resolve().parent
V8=BASE/"goal_mode_empirical_harness_v8"
sys.path.insert(0,str(V8))
import goal_mode_single_process_attestor as ga  # noqa:E402
spec=importlib.util.spec_from_file_location("goal_mode_v8_core",V8/"goal_mode_harness.py")
if spec is None or spec.loader is None: raise RuntimeError("V8 core import")
core=importlib.util.module_from_spec(spec); spec.loader.exec_module(core)


SCHEMA="pw-r9-goal-mode-v9-causal-matrix-controller-v1"
MATRIX_IDS=("goal-mode-v9-causal-matrix-005","goal-mode-v9-causal-matrix-006")
MAX_PARALLEL=1
ROW_COUNT=291
PAIR_ROOT=BASE/"goal_mode_v9_causal_matrix_pair_005_006_inputs_v1"
MANIFEST=PAIR_ROOT/"manifest.json"
CANARY=BASE/"r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json"
MATRIX_005_RECEIPT=BASE/"r9_goal_mode_v9_causal_matrix_005_success_receipt_v1.json"
SOURCES=(
 ("r9_goal_mode_v9_causal_matrix_controller_v1.py",Path(__file__).resolve()),
 ("r9_goal_mode_v9_causal_matrix_pair_builder_v1.py",BASE/"r9_goal_mode_v9_causal_matrix_pair_builder_v1.py"),
 ("r9_goal_mode_v9_causal_matrix_verifier_v1.py",BASE/"r9_goal_mode_v9_causal_matrix_verifier_v1.py"),
 ("goal_mode_v9_causal_matrix_pair_005_006_inputs_v1/manifest.json",MANIFEST),
 ("goal_mode_empirical_harness_v8/goal_mode_contract.json",V8/"goal_mode_contract.json"),
 ("goal_mode_empirical_harness_v8/goal_mode_harness.py",V8/"goal_mode_harness.py"),
 ("goal_mode_empirical_harness_v8/goal_mode_single_process_attestor.py",V8/"goal_mode_single_process_attestor.py"),
 ("goal_mode_empirical_harness_v4/read_goal_subject.py",BASE/"goal_mode_empirical_harness_v4/read_goal_subject.py"),
 ("r9_goal_mode_harness_v8_independent_static_review_v1.json",BASE/"r9_goal_mode_harness_v8_independent_static_review_v1.json"),
 ("r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json",CANARY),
 ("r9_goal_mode_v8_serial_matrix_003_runtime_failure_receipt_v1.json",BASE/"r9_goal_mode_v8_serial_matrix_003_runtime_failure_receipt_v1.json"),
 ("r9_goal_mode_per_test_taker_binding_correction_v2.json",BASE/"r9_goal_mode_per_test_taker_binding_correction_v2.json"),
 ("r9_goal_mode_omp_windows_transport_clarification_v3.json",BASE/"r9_goal_mode_omp_windows_transport_clarification_v3.json"),
)


def identity(label: str,path: Path,limit: int=32_000_000) -> dict[str,Any]:
 raw=ga.base._read_regular(path,limit); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":ga.sha256(raw)}


def bindings() -> list[dict[str,Any]]: return [identity(label,path) for label,path in SOURCES]


def load_manifest() -> dict[str,Any]:
 value=ga.load_json(MANIFEST,16_000_000); ga.require(value.get("schema_id")=="pw-r9-goal-mode-v9-causal-matrix-pair-input-manifest-v1" and value.get("pair_order")==list(MATRIX_IDS),"manifest schema/order"); ga.require(value.get("architecture")=="CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_CAUSAL_STDERR_V4_SERIAL_MAX_PARALLEL_1" and value.get("authority")=={"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"manifest architecture/authority"); return value


def matrix_projection(manifest: dict[str,Any],matrix_id: str) -> dict[str,Any]:
 rows=[item for item in manifest["matrices"] if item.get("matrix_id")==matrix_id]; ga.require(len(rows)==1,"matrix projection cardinality"); matrix=rows[0]; ga.require(matrix["row_count"]==ROW_COUNT and len(matrix["rows"])==ROW_COUNT,"matrix projection"); return matrix


def predecessor(matrix_id: str) -> dict[str,Any]:
 if matrix_id==MATRIX_IDS[0]:
  value=ga.load_json(CANARY,32_000_000); ga.require(value.get("status")=="PASS_THREE_ROUTE_CAUSAL_STDERR_NATIVE_GOAL_CANARY_ZERO_CREDIT_MATRIX_PAIR_DESIGN_ONLY","canary predecessor"); return identity(CANARY.name,CANARY,32_000_000)
 ga.require(matrix_id==MATRIX_IDS[1] and MATRIX_005_RECEIPT.exists(),"Matrix006 predecessor absent"); value=ga.load_json(MATRIX_005_RECEIPT,256_000_000); ga.require(value.get("status")=="PASS_CLEAN_FULL_CAUSAL_STDERR_NATIVE_GOAL_MATRIX_STREAK_1_OF_2_ZERO_QUALIFICATION_CREDIT" and value.get("matrix_id")==MATRIX_IDS[0],"Matrix005 predecessor"); return identity(MATRIX_005_RECEIPT.name,MATRIX_005_RECEIPT,256_000_000)


def load_admission(path: Path,manifest: dict[str,Any],matrix_id: str) -> dict[str,Any]:
 value=ga.load_json(path,16_000_000); ga.base._exact_keys(value,{"authority","bindings","manifest","predecessor","review","schema_id","status"},"admission"); number="005" if matrix_id==MATRIX_IDS[0] else "006"; ga.require(value["schema_id"]==f"pw-r9-goal-mode-v9-causal-matrix-{number}-admission-v1" and value["status"]==f"PASS_INDEPENDENT_CAUSAL_GOAL_MATRIX_{number}_CONTROLLER_REVIEW","admission schema/status")
 ga.require(value["authority"]=={"canary_launch":False,"matrix_id":matrix_id,"matrix_launch":True,"max_parallel":MAX_PARALLEL,"qualification":False,"retry":False,"row_count":ROW_COUNT},"admission authority"); ga.require(value["bindings"]==bindings(),"admission bindings"); ga.require(value["manifest"]==identity("goal_mode_v9_causal_matrix_pair_005_006_inputs_v1/manifest.json",MANIFEST),"admission manifest"); ga.require(value["predecessor"]==predecessor(matrix_id),"admission predecessor")
 review_ref=value["review"]; ga.base._exact_keys(review_ref,{"bytes","mode","path","sha256"},"review ref"); ga.require(review_ref["path"]==Path(review_ref["path"]).name,"review basename"); review_path=path.parent/review_ref["path"]; ga.require(identity(review_ref["path"],review_path)==review_ref,"review identity"); review=ga.load_json(review_path,16_000_000); ga.require(review.get("schema_id")=="pw-r9-goal-mode-v9-causal-matrix-controller-independent-static-review-v1" and review.get("status")=="PASS_INDEPENDENT_STATIC_REVIEW_CAUSAL_MATRIX_005_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH" and review.get("first_mismatch") is None,"review verdict"); ga.require(review.get("authority")=={"matrix_005_admission_eligible":True,"matrix_006_requires_clean_matrix_005":True,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"review authority"); ga.require(review.get("bindings")==bindings(),"review bindings"); return value


def row_paths(manifest: dict[str,Any],matrix_id: str,index: int) -> tuple[Path,Path,dict[str,Any]]:
 ga.require(0<=index<ROW_COUNT,"row index"); item=matrix_projection(manifest,matrix_id)["rows"][index]; ga.require(item["index"]==index and item["row_id"]==f"row-{index:03d}","row order"); row=PAIR_ROOT/item["row_spec"]["path"]; subject=PAIR_ROOT/item["subject"]["path"]; row_id=identity(item["row_spec"]["path"],row); subject_id=identity(item["subject"]["path"],subject); ga.require(row_id=={**item["row_spec"],"mode":"0644"} and subject_id=={**item["subject"],"mode":"0644"},"row input identity"); return row,subject,item


def execute_row(matrix_id: str,row_path: Path,subject_path: Path,capture: Path,codex_home: Path,codex: Path,workspace: Path,timeout_seconds: int) -> dict[str,Any]:
 row=ga.load_row(row_path); subject=ga.base._read_regular(subject_path,core.MAX_SUBJECT_BYTES); subject.decode("utf-8"); ga.require(row["run_id"]==matrix_id and row["control_envelope"].get("matrix") is True and row["control_envelope"].get("full_matrix") is True and row["control_envelope"].get("max_parallel")==1 and row["control_envelope"].get("serialized") is True and row["control_envelope"].get("causal_stderr_classifier") is True,"matrix row authority"); ga.require(len(subject)==row["subject_utf8_bytes"] and ga.sha256(subject)==row["subject_utf8_sha256"],"subject identity"); ga.require(capture.is_absolute() and not capture.exists(),"capture must be absent absolute path")
 capture.mkdir(mode=0o700,parents=False); os.chmod(capture,0o700); core._write_json(capture/"prelaunch_snapshot.json",core._snapshot(codex_home)); fifo=capture/"subject.fifo"; os.mkfifo(fifo,0o600); os.chmod(fifo,0o600); prompt=core._prompt(row,capture,workspace.resolve()); core._write_exclusive(capture/"bootstrap_prompt.txt",prompt); last=capture/"output_last_message.txt"
 process,threads,box,errors,started=core._start(core._argv(codex.resolve(),row,workspace.resolve(),last),prompt,capture,workspace); release=None; release_error="active Goal release gate timeout"; deadline=time.monotonic()+min(300,timeout_seconds)
 while time.monotonic()<deadline and process.poll() is None:
  if box and not errors:
   try: release=ga.attest_release(row_path,capture,codex_home); break
   except (ga.Invalid,OSError,sqlite3.Error,UnicodeError) as exc: release_error=str(exc)
  time.sleep(0.05)
 delivery={}; timed_out=False
 if release is not None:
  core._write_json(capture/"goal_active_subject_release_gate.json",release); delivery=core._deliver(fifo,subject,process,time.monotonic()+30)
  if delivery.get("status")=="DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE": core._write_json(capture/"subject_delivery.json",delivery); core._write_exclusive(capture/"subject_input.txt",subject)
 if release is None or delivery.get("status")!="DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE": core._terminate(process)
 else:
  try: process.wait(timeout=max(0.1,timeout_seconds))
  except subprocess.TimeoutExpired: timed_out=True; core._terminate(process)
 for thread in threads: thread.join(timeout=10)
 core._normalize(last); quiescence=core._quiesce(fifo)
 if not quiescence["remaining_pids"] and fifo.exists(): fifo.unlink(); fd=os.open(capture,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_CLOEXEC",0)); os.fsync(fd); os.close(fd)
 receipt={"ended_at_ms":int(time.time()*1000),"goal_release_error":None if release is not None else release_error,"pid":process.pid,"rc":process.returncode,"reader_quiescence":quiescence,"schema_id":ga.PROCESS_SCHEMA,"started_at_ms":started,"stdin_closed":True,"subject_delivery":delivery,"subject_fifo_removed":not fifo.exists(),"subject_release":"AFTER_SAME_PROCESS_NATIVE_GOAL_ACTIVE_ATTESTATION" if release is not None else "NOT_RELEASED","timed_out":timed_out}; core._write_json(capture/"process_receipt.json",receipt)
 if release is None: raise core.LaunchFailure(f"active Goal gate failed; subject withheld:{release_error}")
 if delivery.get("status")!="DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE": raise core.LaunchFailure(f"subject delivery failed:{delivery}")
 if process.returncode!=0 or timed_out or errors: raise core.LaunchFailure(f"process terminal:rc={process.returncode}:timeout={timed_out}:pump={errors}")
 if quiescence["term_sent"] or quiescence["kill_sent"] or quiescence["remaining_pids"]: raise core.LaunchFailure(f"reader cleanup:{quiescence}")
 stderr_raw=ga.base._read_regular(capture/"stderr.bin",64_000_000); attestation=ga.attest_final(row_path,capture,codex_home); classification=core._classify_stderr(stderr_raw,attestation,codex_home); core._write_json(capture/"goal_mode_attestation.json",attestation); core._write_json(capture/"stderr_classification.json",classification); return {"attestation":attestation,"stderr_classification":classification}


def run_row(args: argparse.Namespace) -> dict[str,Any]:
 manifest=load_manifest(); load_admission(args.admission,manifest,args.matrix_id); row,subject,item=row_paths(manifest,args.matrix_id,args.index); ga.require(args.capture.name==item["row_id"] and args.capture.parent.name=="rows","capture row path"); result=execute_row(args.matrix_id,row,subject,args.capture,args.codex_home,args.codex,args.workspace,args.timeout_seconds); return {"attestation":result["attestation"],"index":args.index,"matrix_id":args.matrix_id,"row_id":item["row_id"],"schema_id":"pw-r9-goal-mode-v9-causal-matrix-row-controller-result-v1","status":"PASS_ROW_CAUSAL_STDERR_NATIVE_GOAL_ZERO_CREDIT_PENDING_MATRIX_VERIFY","stderr_classification":result["stderr_classification"]}


def child_argv(args: argparse.Namespace,index: int,capture: Path) -> list[str]:
 return [sys.executable,"-B",str(Path(__file__).resolve()),"run-row","--matrix-id",args.matrix_id,"--index",str(index),"--admission",str(args.admission),"--capture",str(capture),"--codex-home",str(args.codex_home),"--codex",str(args.codex),"--workspace",str(args.workspace),"--timeout-seconds",str(args.row_timeout_seconds)]


def capture_quiescent(capture: Path) -> bool:
 try: receipt=ga.load_json(capture/"process_receipt.json",4_000_000)
 except (ga.Invalid,OSError,sqlite3.Error,UnicodeError): return False
 quiet=receipt.get("reader_quiescence"); return isinstance(quiet,dict) and quiet.get("remaining_pids")==[] and receipt.get("subject_fifo_removed") is True and receipt.get("stdin_closed") is True


def launch_one(args: argparse.Namespace,index: int,capture: Path,results: Path) -> dict[str,Any]:
 env=os.environ.copy(); env["PYTHONDONTWRITEBYTECODE"]="1"; row_started=int(time.time()*1000); process=subprocess.Popen(child_argv(args,index,capture),stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,cwd=BASE,env=env,start_new_session=True); timed_out=False
 try: stdout,stderr=process.communicate(timeout=args.row_timeout_seconds+120)
 except subprocess.TimeoutExpired:
  timed_out=True
  try: os.killpg(process.pid,signal.SIGTERM)
  except ProcessLookupError: pass
  try: stdout,stderr=process.communicate(timeout=10)
  except subprocess.TimeoutExpired:
   try: os.killpg(process.pid,signal.SIGKILL)
   except ProcessLookupError: pass
   stdout,stderr=process.communicate()
 core._write_exclusive(results/f"row-{index:03d}.stdout",stdout); core._write_exclusive(results/f"row-{index:03d}.stderr",stderr)
 parsed=None
 try: parsed=json.loads(stdout)
 except (UnicodeDecodeError,json.JSONDecodeError): pass
 quiescent=capture_quiescent(capture); ok=not timed_out and process.returncode==0 and stderr==b"" and quiescent and isinstance(parsed,dict) and parsed.get("schema_id")=="pw-r9-goal-mode-v9-causal-matrix-row-controller-result-v1" and parsed.get("status")=="PASS_ROW_CAUSAL_STDERR_NATIVE_GOAL_ZERO_CREDIT_PENDING_MATRIX_VERIFY" and isinstance(parsed.get("stderr_classification"),dict) and parsed["stderr_classification"].get("accepted") is True and parsed.get("index")==index and parsed.get("matrix_id")==args.matrix_id
 receipt={"ended_at_ms":int(time.time()*1000),"index":index,"pid":process.pid,"process_reaped":process.poll() is not None,"quiescent_before_next":quiescent,"rc":process.returncode,"row_id":f"row-{index:03d}","schema_id":"pw-r9-goal-mode-v9-causal-matrix-row-process-receipt-v1","started_at_ms":row_started,"stderr":{"bytes":len(stderr),"sha256":ga.sha256(stderr)},"stdout":{"bytes":len(stdout),"sha256":ga.sha256(stdout)},"status":"PASS" if ok else "FAIL","timed_out":timed_out}; core._write_json(results/f"row-{index:03d}.receipt.json",receipt); return receipt


def run_matrix(args: argparse.Namespace) -> dict[str,Any]:
 manifest=load_manifest(); load_admission(args.admission,manifest,args.matrix_id); ga.require(args.matrix_id in MATRIX_IDS and args.max_parallel==MAX_PARALLEL,"matrix runtime envelope"); ga.require(args.output.is_absolute() and not args.output.exists(),"matrix output must be absent absolute path"); args.output.mkdir(mode=0o700); os.chmod(args.output,0o700); rows=args.output/"rows"; results=args.output/"controller_results"; rows.mkdir(mode=0o700); results.mkdir(mode=0o700); os.chmod(rows,0o700); os.chmod(results,0o700)
 started_at=int(time.time()*1000); receipts=[]
 for index in range(ROW_COUNT):
  receipt=launch_one(args,index,rows/f"row-{index:03d}",results); receipts.append(receipt)
  if receipt["status"]!="PASS": break
 consumed=len(receipts); passed=sum(row["status"]=="PASS" for row in receipts); first_failure=next(({"index":row["index"],"rc":row["rc"],"stderr_sha256":row["stderr"]["sha256"],"stdout_sha256":row["stdout"]["sha256"]} for row in receipts if row["status"]!="PASS"),None); status="PASS_ALL_ROWS_CAUSAL_STDERR_NATIVE_GOALS_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" if passed==ROW_COUNT else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY"
 terminal={"accounting":{"aborted_unlaunched":ROW_COUNT-consumed,"consumed":consumed,"failed":consumed-passed,"passed":passed,"planned":ROW_COUNT,"qualification_credit":0,"retries":0},"first_failure":first_failure,"isolation":{"all_consumed_rows_quiescent_before_successor":all(row["quiescent_before_next"] for row in receipts),"max_parallel":1,"serialized":True},"matrix_id":args.matrix_id,"schema_id":"pw-r9-goal-mode-v9-causal-matrix-controller-terminal-v1","started_at_ms":started_at,"status":status}; core._write_json(args.output/"matrix_terminal.json",terminal); return terminal


def check() -> dict[str,Any]:
 manifest=load_manifest(); ast.parse(Path(__file__).read_text(),filename=Path(__file__).name)
 for matrix_id in MATRIX_IDS:
  matrix=matrix_projection(manifest,matrix_id); ga.require(matrix["rows_projection_bytes"]>0 and len({row["subject"]["sha256"] for row in matrix["rows"]})==97,"matrix projection/subjects")
 ga.require(MAX_PARALLEL==1 and ROW_COUNT==291,"controller constants"); return {"authority":{"matrix_launch":False,"qualification_credit":0},"bindings":bindings(),"checks":{"fail_fast_unlaunched_suffix":"PASS_STATIC","fresh_goal_per_row":"PASS_STATIC","matrix_ids":list(MATRIX_IDS),"matrix_rows_each":291,"max_parallel":1,"no_retry":"PASS_STATIC","omp_process_calls":0,"pair_predeclared":True,"row_input_reopen":"PASS","serialized_process_reap_and_reader_quiescence":"PASS_STATIC","causal_stderr_classifier":"PASS_EXACT_TWO_CLASS_AFTER_FULL_ATTESTATION"},"schema_id":"pw-r9-goal-mode-v9-causal-matrix-controller-check-v1","status":"PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH"}


def emit(value: dict[str,Any]) -> None: sys.stdout.buffer.write(ga.canon(value))


def cleanup() -> None:
 while core._ACTIVE:
  process=core._ACTIVE.pop(); core._terminate(process)
  for stream in (process.stdin,process.stdout,process.stderr):
   try:
    if stream is not None: stream.close()
   except OSError: pass


def main(argv: list[str]|None=None) -> int:
 parser=argparse.ArgumentParser(); sub=parser.add_subparsers(dest="command",required=True); sub.add_parser("check")
 row=sub.add_parser("run-row"); row.add_argument("--matrix-id",required=True); row.add_argument("--index",type=int,required=True); row.add_argument("--admission",type=Path,required=True); row.add_argument("--capture",type=Path,required=True); row.add_argument("--codex-home",type=Path,required=True); row.add_argument("--codex",type=Path,required=True); row.add_argument("--workspace",type=Path,required=True); row.add_argument("--timeout-seconds",type=int,required=True)
 matrix=sub.add_parser("run-matrix"); matrix.add_argument("--matrix-id",required=True); matrix.add_argument("--admission",type=Path,required=True); matrix.add_argument("--output",type=Path,required=True); matrix.add_argument("--codex-home",type=Path,required=True); matrix.add_argument("--codex",type=Path,required=True); matrix.add_argument("--workspace",type=Path,required=True); matrix.add_argument("--max-parallel",type=int,required=True); matrix.add_argument("--row-timeout-seconds",type=int,required=True)
 args=parser.parse_args(argv)
 try:
  if args.command=="check": result=check()
  elif args.command=="run-row": ga.require(args.matrix_id in MATRIX_IDS and 60<=args.timeout_seconds<=7200,"row envelope"); result=run_row(args)
  else: ga.require(args.matrix_id in MATRIX_IDS and 60<=args.row_timeout_seconds<=7200,"matrix envelope"); args.output=args.output.resolve(strict=False); result=run_matrix(args)
  emit(result); return 0
 except (ga.Invalid,OSError,sqlite3.Error,UnicodeError,subprocess.SubprocessError) as exc:
  emit({"authority":{"matrix_launch":False,"qualification_credit":0},"error":str(exc),"schema_id":"pw-r9-goal-mode-v9-causal-matrix-controller-failure-v1","status":"FAIL_ZERO_CREDIT_NO_RETRY"}); return 1
 finally: cleanup()


if __name__=="__main__": raise SystemExit(main())

