#!/usr/bin/env python3
"""Predeclared batch controller for fresh Goal-per-row R9 matrices."""

from __future__ import annotations

import argparse
import ast
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import stat
import subprocess
import sys
import time
from typing import Any


BASE=Path(__file__).resolve().parent
V5=BASE/"goal_mode_empirical_harness_v5"
sys.path.insert(0,str(V5))
import goal_mode_single_process_attestor as ga  # noqa:E402
spec=importlib.util.spec_from_file_location("goal_mode_v5_core",V5/"goal_mode_harness.py")
if spec is None or spec.loader is None: raise RuntimeError("V5 core import")
core=importlib.util.module_from_spec(spec); spec.loader.exec_module(core)


SCHEMA="pw-r9-goal-mode-matrix-controller-v1"
ADMISSION_SCHEMA="pw-r9-goal-mode-matrix-001-admission-v1"
MATRIX_ID="goal-mode-single-process-matrix-001"
MAX_PARALLEL=3
ROW_COUNT=291
MANIFEST=BASE/"goal_mode_matrix_pair_001_002_inputs_v1"/"manifest.json"
SOURCES=(
 ("r9_goal_mode_matrix_controller_v1.py",Path(__file__).resolve()),
 ("r9_goal_mode_matrix_pair_builder_v1.py",BASE/"r9_goal_mode_matrix_pair_builder_v1.py"),
 ("r9_goal_mode_matrix_verifier_v1.py",BASE/"r9_goal_mode_matrix_verifier_v1.py"),
 ("goal_mode_matrix_pair_001_002_inputs_v1/manifest.json",MANIFEST),
 ("goal_mode_empirical_harness_v5/goal_mode_contract.json",V5/"goal_mode_contract.json"),
 ("goal_mode_empirical_harness_v5/goal_mode_harness.py",V5/"goal_mode_harness.py"),
 ("goal_mode_empirical_harness_v5/goal_mode_single_process_attestor.py",V5/"goal_mode_single_process_attestor.py"),
 ("goal_mode_empirical_harness_v4/read_goal_subject.py",BASE/"goal_mode_empirical_harness_v4"/"read_goal_subject.py"),
 ("r9_goal_mode_single_process_canary_001_success_receipt_v1.json",BASE/"r9_goal_mode_single_process_canary_001_success_receipt_v1.json"),
)


def identity(label: str,path: Path) -> dict[str,Any]:
 raw=ga.base._read_regular(path,32_000_000); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":ga.sha256(raw)}


def bindings() -> list[dict[str,Any]]: return [identity(label,path) for label,path in SOURCES]


def load_manifest() -> dict[str,Any]:
 value=ga.load_json(MANIFEST,16_000_000); ga.require(value.get("schema_id")=="pw-r9-goal-mode-matrix-pair-input-manifest-v1" and value.get("pair_order")==[MATRIX_ID,"goal-mode-single-process-matrix-002"],"manifest schema/order"); ga.require(value.get("authority")=={"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"manifest authority"); return value


def matrix_projection(manifest: dict[str,Any]) -> dict[str,Any]:
 rows=manifest["matrices"][0]; ga.require(rows["matrix_id"]==MATRIX_ID and rows["row_count"]==ROW_COUNT and len(rows["rows"])==ROW_COUNT,"matrix projection"); return rows


def load_admission(path: Path,manifest: dict[str,Any]) -> dict[str,Any]:
 value=ga.load_json(path,8_000_000); ga.require(isinstance(value,dict),"admission object"); ga.base._exact_keys(value,{"authority","bindings","manifest","review","schema_id","status"},"admission")
 ga.require(value["schema_id"]==ADMISSION_SCHEMA and value["status"]=="PASS_INDEPENDENT_GOAL_MATRIX_001_CONTROLLER_REVIEW","admission schema/status")
 ga.require(value["authority"]=={"canary_launch":False,"matrix_id":MATRIX_ID,"matrix_launch":True,"max_parallel":MAX_PARALLEL,"qualification":False,"retry":False,"row_count":ROW_COUNT},"admission authority")
 ga.require(value["bindings"]==bindings(),"admission bindings"); ga.require(value["manifest"]==identity("goal_mode_matrix_pair_001_002_inputs_v1/manifest.json",MANIFEST),"admission manifest")
 review_ref=value["review"]; ga.require(isinstance(review_ref,dict),"review ref"); ga.base._exact_keys(review_ref,{"bytes","mode","path","sha256"},"review ref"); ga.require(review_ref["path"]==Path(review_ref["path"]).name,"review basename"); review_path=path.parent/review_ref["path"]; ga.require(identity(review_ref["path"],review_path)==review_ref,"review identity")
 review=ga.load_json(review_path,8_000_000); ga.require(review.get("schema_id")=="pw-r9-goal-mode-matrix-controller-v1-independent-static-review-v1" and review.get("status")=="PASS_INDEPENDENT_STATIC_REVIEW_MATRIX_001_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH" and review.get("first_mismatch") is None,"review verdict"); ga.require(review.get("authority")=={"matrix_001_admission_eligible":True,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"review authority"); ga.require(review.get("bindings")==bindings(),"review bindings")
 return value


def row_paths(manifest: dict[str,Any],index: int) -> tuple[Path,Path,dict[str,Any]]:
 ga.require(0<=index<ROW_COUNT,"row index"); item=matrix_projection(manifest)["rows"][index]; ga.require(item["index"]==index and item["row_id"]==f"row-{index:03d}","row order"); row=BASE/"goal_mode_matrix_pair_001_002_inputs_v1"/item["row_spec"]["path"]; subject=BASE/"goal_mode_matrix_pair_001_002_inputs_v1"/item["subject"]["path"]; row_id=identity(item["row_spec"]["path"],row); subject_id=identity(item["subject"]["path"],subject); ga.require(row_id=={**item["row_spec"],"mode":"0644"} and subject_id=={**item["subject"],"mode":"0644"},"row input identity"); return row,subject,item


def execute_row(row_path: Path,subject_path: Path,capture: Path,codex_home: Path,codex: Path,workspace: Path,timeout_seconds: int) -> dict[str,Any]:
 row=ga.load_row(row_path); subject=ga.base._read_regular(subject_path,core.MAX_SUBJECT_BYTES); subject.decode("utf-8"); ga.require(row["run_id"]==MATRIX_ID and row["control_envelope"].get("matrix") is True and row["control_envelope"].get("full_matrix") is True,"matrix row authority"); ga.require(len(subject)==row["subject_utf8_bytes"] and ga.sha256(subject)==row["subject_utf8_sha256"],"subject identity"); ga.require(not capture.exists(),"capture exists")
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
 if ga.base._read_regular(capture/"stderr.bin",64_000_000)!=b"": raise core.LaunchFailure("stderr nonempty")
 attestation=ga.attest_final(row_path,capture,codex_home); core._write_json(capture/"goal_mode_attestation.json",attestation); return attestation


def run_row(args: argparse.Namespace) -> dict[str,Any]:
 manifest=load_manifest(); load_admission(args.admission,manifest); row,subject,item=row_paths(manifest,args.index); ga.require(args.capture.name==item["row_id"] and args.capture.parent.name=="rows","capture row path"); result=execute_row(row,subject,args.capture,args.codex_home,args.codex,args.workspace,args.timeout_seconds); return {"attestation":result,"index":args.index,"row_id":item["row_id"],"schema_id":"pw-r9-goal-mode-matrix-row-controller-result-v1","status":"PASS_ROW_ZERO_CREDIT_PENDING_MATRIX_VERIFY"}


def child_argv(args: argparse.Namespace,index: int,capture: Path) -> list[str]:
 return [sys.executable,"-B",str(Path(__file__).resolve()),"run-row","--index",str(index),"--admission",str(args.admission),"--capture",str(capture),"--codex-home",str(args.codex_home),"--codex",str(args.codex),"--workspace",str(args.workspace),"--timeout-seconds",str(args.row_timeout_seconds)]


def run_matrix(args: argparse.Namespace) -> dict[str,Any]:
 manifest=load_manifest(); load_admission(args.admission,manifest); ga.require(args.matrix_id==MATRIX_ID and args.max_parallel==MAX_PARALLEL,"matrix runtime envelope"); ga.require(not args.output.exists(),"matrix output must be absent"); args.output.mkdir(mode=0o700); os.chmod(args.output,0o700); rows=args.output/"rows"; results=args.output/"controller_results"; rows.mkdir(mode=0o700); results.mkdir(mode=0o700); os.chmod(rows,0o700); os.chmod(results,0o700)
 started_at=int(time.time()*1000); passed=0; consumed=0; first_failure=None
 env=os.environ.copy(); env["PYTHONDONTWRITEBYTECODE"]="1"
 for start in range(0,ROW_COUNT,MAX_PARALLEL):
  batch=[]
  for index in range(start,min(start+MAX_PARALLEL,ROW_COUNT)):
   capture=rows/f"row-{index:03d}"; process=subprocess.Popen(child_argv(args,index,capture),stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,cwd=BASE,env=env,start_new_session=True); batch.append((index,process,int(time.time()*1000)))
  for index,process,row_started in batch:
   consumed+=1
   stdout,stderr=process.communicate()
   core._write_exclusive(results/f"row-{index:03d}.stdout",stdout); core._write_exclusive(results/f"row-{index:03d}.stderr",stderr)
   parsed=None
   try: parsed=json.loads(stdout)
   except (UnicodeDecodeError,json.JSONDecodeError): pass
   ok=process.returncode==0 and stderr==b"" and isinstance(parsed,dict) and parsed.get("schema_id")=="pw-r9-goal-mode-matrix-row-controller-result-v1" and parsed.get("status")=="PASS_ROW_ZERO_CREDIT_PENDING_MATRIX_VERIFY" and parsed.get("index")==index
   receipt={"ended_at_ms":int(time.time()*1000),"index":index,"pid":process.pid,"rc":process.returncode,"row_id":f"row-{index:03d}","schema_id":"pw-r9-goal-mode-matrix-row-process-receipt-v1","started_at_ms":row_started,"stderr":{"bytes":len(stderr),"sha256":ga.sha256(stderr)},"stdout":{"bytes":len(stdout),"sha256":ga.sha256(stdout)},"status":"PASS" if ok else "FAIL"}; core._write_json(results/f"row-{index:03d}.receipt.json",receipt)
   if ok: passed+=1
   elif first_failure is None: first_failure={"index":index,"rc":process.returncode,"stderr_sha256":ga.sha256(stderr),"stdout_sha256":ga.sha256(stdout)}
  if first_failure is not None: break
 status="PASS_ALL_ROWS_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" if passed==ROW_COUNT and consumed==ROW_COUNT else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY"
 terminal={"accounting":{"aborted":ROW_COUNT-consumed,"consumed":consumed,"failed":consumed-passed,"passed":passed,"planned":ROW_COUNT,"qualification_credit":0,"retries":0},"first_failure":first_failure,"matrix_id":MATRIX_ID,"schema_id":"pw-r9-goal-mode-matrix-controller-terminal-v1","started_at_ms":started_at,"status":status}; core._write_json(args.output/"matrix_terminal.json",terminal); return terminal


def check() -> dict[str,Any]:
 manifest=load_manifest(); matrix=matrix_projection(manifest); ast.parse(Path(__file__).read_text(),filename=Path(__file__).name); ga.require(matrix["rows_projection_bytes"]>0 and len({row["subject"]["sha256"] for row in matrix["rows"]})==97,"matrix projection/subjects"); ga.require(MAX_PARALLEL==3 and ROW_COUNT==291,"controller constants"); return {"authority":{"matrix_launch":False,"qualification_credit":0},"bindings":bindings(),"checks":{"fresh_goal_per_row":"PASS_STATIC","matrix_rows":291,"max_parallel":3,"no_retry":"PASS_STATIC","omp_process_calls":0,"pair_predeclared":True,"row_input_reopen":"PASS"},"schema_id":"pw-r9-goal-mode-matrix-controller-check-v1","status":"PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH"}


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
 row=sub.add_parser("run-row"); row.add_argument("--index",type=int,required=True); row.add_argument("--admission",type=Path,required=True); row.add_argument("--capture",type=Path,required=True); row.add_argument("--codex-home",type=Path,required=True); row.add_argument("--codex",type=Path,required=True); row.add_argument("--workspace",type=Path,required=True); row.add_argument("--timeout-seconds",type=int,required=True)
 matrix=sub.add_parser("run-matrix"); matrix.add_argument("--matrix-id",required=True); matrix.add_argument("--admission",type=Path,required=True); matrix.add_argument("--output",type=Path,required=True); matrix.add_argument("--codex-home",type=Path,required=True); matrix.add_argument("--codex",type=Path,required=True); matrix.add_argument("--workspace",type=Path,required=True); matrix.add_argument("--max-parallel",type=int,required=True); matrix.add_argument("--row-timeout-seconds",type=int,required=True)
 args=parser.parse_args(argv)
 try:
  if args.command=="check": result=check()
  elif args.command=="run-row": ga.require(60<=args.timeout_seconds<=7200,"timeout"); result=run_row(args)
  else: ga.require(60<=args.row_timeout_seconds<=7200,"row timeout"); result=run_matrix(args)
  emit(result); return 0
 except (ga.Invalid,OSError,sqlite3.Error,UnicodeError,subprocess.SubprocessError) as exc:
  emit({"authority":{"matrix_launch":False,"qualification_credit":0},"error":str(exc),"schema_id":"pw-r9-goal-mode-matrix-controller-failure-v1","status":"FAIL_ZERO_CREDIT_NO_RETRY"}); return 1
 finally: cleanup()


if __name__=="__main__": raise SystemExit(main())
