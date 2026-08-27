#!/usr/bin/env python3
"""Once-only three-route controller for the closed-message native Goal harness."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import signal
import stat
import subprocess
import sys
import time
from typing import Any


BASE=Path(__file__).resolve().parent
V7=BASE/"goal_mode_empirical_harness_v7"
INPUTS=BASE/"goal_mode_v7_route_canary_001_inputs"
MANIFEST=INPUTS/"manifest.json"
RUN_ID="goal-mode-closed-message-phase-canary-001"
ROW_COUNT=3
MAX_PARALLEL=3
SCHEMA="pw-r9-goal-mode-v7-route-canary-controller-v1"
ADMISSION_SCHEMA="pw-r9-goal-mode-v7-route-canary-controller-admission-v1"
SOURCES=(
 ("r9_goal_mode_v7_route_canary_controller_v1.py",Path(__file__).resolve()),
 ("goal_mode_v7_route_canary_001_inputs/manifest.json",MANIFEST),
 ("goal_mode_empirical_harness_v7/goal_mode_contract.json",V7/"goal_mode_contract.json"),
 ("goal_mode_empirical_harness_v7/goal_mode_harness.py",V7/"goal_mode_harness.py"),
 ("goal_mode_empirical_harness_v7/goal_mode_single_process_attestor.py",V7/"goal_mode_single_process_attestor.py"),
 ("goal_mode_empirical_harness_v4/read_goal_subject.py",BASE/"goal_mode_empirical_harness_v4/read_goal_subject.py"),
 ("r9_goal_mode_harness_v7_independent_static_review_v1.json",BASE/"r9_goal_mode_harness_v7_independent_static_review_v1.json"),
 ("r9_goal_mode_matrix_001_runtime_failure_receipt_v1.json",BASE/"r9_goal_mode_matrix_001_runtime_failure_receipt_v1.json"),
 ("r9_goal_mode_v6_route_canary_001_runtime_failure_receipt_v1.json",BASE/"r9_goal_mode_v6_route_canary_001_runtime_failure_receipt_v1.json"),
 ("r9_goal_mode_omp_windows_transport_clarification_v3.json",BASE/"r9_goal_mode_omp_windows_transport_clarification_v3.json"),
 ("r9_goal_mode_v7_route_canary_001_row_000_admission_v1.json",BASE/"r9_goal_mode_v7_route_canary_001_row_000_admission_v1.json"),
 ("r9_goal_mode_v7_route_canary_001_row_001_admission_v1.json",BASE/"r9_goal_mode_v7_route_canary_001_row_001_admission_v1.json"),
 ("r9_goal_mode_v7_route_canary_001_row_002_admission_v1.json",BASE/"r9_goal_mode_v7_route_canary_001_row_002_admission_v1.json"),
)


class Invalid(RuntimeError): pass


def require(ok: bool,message: str) -> None:
 if not ok: raise Invalid(message)


def pairs(items: list[tuple[str,Any]]) -> dict[str,Any]:
 out={}
 for key,value in items: require(key not in out,f"duplicate JSON key:{key}"); out[key]=value
 return out


def canon(value: Any) -> bytes: return json.dumps(value,ensure_ascii=False,allow_nan=False,sort_keys=True,separators=(",", ":")).encode()+b"\n"


def read_regular(path: Path,limit: int=32_000_000) -> bytes:
 st=os.lstat(path); require(stat.S_ISREG(st.st_mode) and not path.is_symlink() and 0<=st.st_size<=limit,f"unsafe file:{path}"); raw=path.read_bytes(); after=os.lstat(path); require((st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==st.st_size,f"changing file:{path}"); return raw


def sha(raw: bytes) -> str:
 import hashlib
 return hashlib.sha256(raw).hexdigest()


def load(path: Path,limit: int=32_000_000) -> Any:
 raw=read_regular(path,limit); require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw,f"JSON framing:{path}")
 try: value=json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda item:(_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
 except (json.JSONDecodeError,UnicodeDecodeError) as exc: raise Invalid(f"JSON:{path}:{exc}") from exc
 require(raw==canon(value),f"noncanonical:{path}"); return value


def identity(label: str,path: Path) -> dict[str,Any]:
 raw=read_regular(path); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":sha(raw)}


def bindings() -> list[dict[str,Any]]: return [identity(label,path) for label,path in SOURCES]


def load_manifest() -> dict[str,Any]:
 value=load(MANIFEST); require(value.get("schema_id")=="pw-r9-goal-mode-v7-route-canary-input-manifest-v1" and value.get("status")=="PREDECLARED_ZERO_CREDIT_NO_LAUNCH","manifest status"); require(value.get("run_id")==RUN_ID and value.get("row_count")==ROW_COUNT and value.get("max_parallel")==MAX_PARALLEL and len(value.get("rows",[]))==ROW_COUNT,"manifest envelope"); require(value.get("authority")=={"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"manifest authority"); return value


def load_admission(path: Path) -> dict[str,Any]:
 value=load(path); require(set(value)=={"authority","bindings","review","schema_id","status"},"admission keys"); require(value["schema_id"]==ADMISSION_SCHEMA and value["status"]=="PASS_INDEPENDENT_V7_ROUTE_CANARY_CONTROLLER_REVIEW","admission status"); require(value["authority"]=={"canary_launch":True,"launch_count":1,"max_parallel":MAX_PARALLEL,"qualification":False,"retry":False,"row_count":ROW_COUNT,"run_id":RUN_ID},"admission authority"); require(value["bindings"]==bindings(),"admission bindings")
 ref=value["review"]; require(isinstance(ref,dict) and set(ref)=={"bytes","mode","path","sha256"} and ref["path"]==Path(ref["path"]).name,"review ref"); review_path=path.parent/ref["path"]; require(identity(ref["path"],review_path)==ref,"review identity"); review=load(review_path); require(review.get("schema_id")=="pw-r9-goal-mode-v7-route-canary-controller-independent-static-review-v1" and review.get("status")=="PASS_INDEPENDENT_STATIC_REVIEW_V7_ROUTE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH" and review.get("first_mismatch") is None,"review verdict"); require(review.get("bindings")==bindings(),"review bindings"); return value


def validate_inputs(manifest: dict[str,Any]) -> None:
 routes=[("slot-alpha","gpt-5.4-mini","xhigh"),("slot-bravo","gpt-5.4-mini","medium"),("slot-charlie","gpt-5.6-luna","medium")]
 for index,(route,model,effort) in enumerate(routes):
  item=manifest["rows"][index]; require(item["index"]==index and item["row_id"]==f"row-{index:03d}" and (item["route"],item["model"],item["reasoning_effort"])==(route,model,effort),f"route:{index}")
  for key in ("row_spec","subject"):
   ref=item[key]; require(identity(ref["path"],INPUTS/ref["path"])==ref,f"input identity:{index}:{key}")
  row=load(INPUTS/item["row_spec"]["path"]); require(row["run_id"]==RUN_ID and row["row_id"]==item["row_id"] and row["model"]==model and row["reasoning_effort"]==effort,"row projection")


def row_argv(index: int,args: argparse.Namespace,capture: Path) -> list[str]:
 return [sys.executable,"-B",str(V7/"goal_mode_harness.py"),"run-codex-row","--row-spec",str(INPUTS/f"row-{index:03d}.row.json"),"--subject",str(INPUTS/f"row-{index:03d}.subject.txt"),"--admission",str(BASE/f"r9_goal_mode_v7_route_canary_001_row_{index:03d}_admission_v1.json"),"--capture-root",str(capture),"--codex-home",str(args.codex_home),"--codex",str(args.codex),"--workspace",str(args.workspace),"--timeout-seconds",str(args.row_timeout_seconds)]


def write(path: Path,raw: bytes) -> None:
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_CLOEXEC",0),0o600)
 try:
  os.fchmod(fd,0o600); offset=0
  while offset<len(raw): offset+=os.write(fd,raw[offset:])
  os.fsync(fd)
 finally: os.close(fd)
 require(read_regular(path,max(1,len(raw)))==raw,f"write reopen:{path}")


def write_json(path: Path,value: Any) -> None: write(path,canon(value))


def run(args: argparse.Namespace) -> tuple[dict[str,Any],int]:
 manifest=load_manifest(); validate_inputs(manifest); load_admission(args.admission); require(args.run_id==RUN_ID and args.max_parallel==MAX_PARALLEL,"runtime envelope"); require(not args.output.exists(),"output exists")
 args.output.mkdir(mode=0o700); os.chmod(args.output,0o700); rows=args.output/"rows"; results=args.output/"controller_results"; rows.mkdir(mode=0o700); results.mkdir(mode=0o700); os.chmod(rows,0o700); os.chmod(results,0o700)
 started=int(time.time()*1000); procs=[]
 for index in range(ROW_COUNT):
  capture=rows/f"row-{index:03d}"; argv=row_argv(index,args,capture); p=subprocess.Popen(argv,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,cwd=args.workspace,start_new_session=True,env={**os.environ,"PYTHONDONTWRITEBYTECODE":"1"}); procs.append((index,p,int(time.time()*1000)))
 receipts=[]
 for index,p,row_started in procs:
  timed_out=False
  try: stdout,stderr=p.communicate(timeout=args.row_timeout_seconds+120)
  except subprocess.TimeoutExpired:
   timed_out=True
   try: os.killpg(p.pid,signal.SIGTERM)
   except ProcessLookupError: pass
   try: stdout,stderr=p.communicate(timeout=10)
   except subprocess.TimeoutExpired:
    try: os.killpg(p.pid,signal.SIGKILL)
    except ProcessLookupError: pass
    stdout,stderr=p.communicate()
  write(results/f"row-{index:03d}.stdout",stdout); write(results/f"row-{index:03d}.stderr",stderr)
  parsed=None
  try: parsed=json.loads(stdout)
  except (json.JSONDecodeError,UnicodeDecodeError): pass
  ok=not timed_out and p.returncode==0 and stderr==b"" and isinstance(parsed,dict) and parsed.get("status")=="PASS_SINGLE_PROCESS_NATIVE_GOAL_LIFECYCLE_ZERO_CREDIT"
  receipt={"ended_at_ms":int(time.time()*1000),"index":index,"pid":p.pid,"rc":p.returncode,"row_id":f"row-{index:03d}","schema_id":"pw-r9-goal-mode-v7-route-canary-row-process-receipt-v1","started_at_ms":row_started,"status":"PASS" if ok else "FAIL","stderr":{"bytes":len(stderr),"sha256":sha(stderr)},"stdout":{"bytes":len(stdout),"sha256":sha(stdout)},"timed_out":timed_out}; write_json(results/f"row-{index:03d}.receipt.json",receipt); receipts.append(receipt)
 passed=sum(row["status"]=="PASS" for row in receipts); terminal={"accounting":{"consumed":ROW_COUNT,"failed":ROW_COUNT-passed,"passed":passed,"planned":ROW_COUNT,"qualification_credit":0,"retries":0},"first_failure":next(({"index":row["index"],"rc":row["rc"],"stderr_sha256":row["stderr"]["sha256"],"stdout_sha256":row["stdout"]["sha256"]} for row in receipts if row["status"]!="PASS"),None),"run_id":RUN_ID,"schema_id":"pw-r9-goal-mode-v7-route-canary-controller-terminal-v1","started_at_ms":started,"status":"PASS_THREE_ROUTE_GOAL_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" if passed==ROW_COUNT else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY"}; write_json(args.output/"controller_terminal.json",terminal); return terminal,0 if passed==ROW_COUNT else 1


def check(args: argparse.Namespace) -> dict[str,Any]:
 manifest=load_manifest(); validate_inputs(manifest)
 for index in range(ROW_COUNT):
  admission=load(BASE/f"r9_goal_mode_v7_route_canary_001_row_{index:03d}_admission_v1.json"); require(admission["authority"]["row_id"]==f"row-{index:03d}" and admission["authority"]["run_id"]==RUN_ID,"row admission")
 return {"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"bindings":bindings(),"checks":{"max_parallel":MAX_PARALLEL,"no_retry":"PASS_STATIC","row_count":ROW_COUNT,"routes":["slot-alpha","slot-bravo","slot-charlie"],"v7_row_admissions":"PASS"},"schema_id":"pw-r9-goal-mode-v7-route-canary-controller-check-v1","status":"PASS_STATIC_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
 parser=argparse.ArgumentParser(); sub=parser.add_subparsers(dest="command",required=True); sub.add_parser("check"); runp=sub.add_parser("run-canary"); runp.add_argument("--run-id",required=True); runp.add_argument("--admission",type=Path,required=True); runp.add_argument("--output",type=Path,required=True); runp.add_argument("--codex-home",type=Path,required=True); runp.add_argument("--codex",type=Path,required=True); runp.add_argument("--workspace",type=Path,required=True); runp.add_argument("--max-parallel",type=int,required=True); runp.add_argument("--row-timeout-seconds",type=int,required=True); args=parser.parse_args()
 try:
  if args.command=="check": result,rc=check(args),0
  else: require(60<=args.row_timeout_seconds<=1800,"timeout bounds"); result,rc=run(args)
 except (Invalid,OSError,subprocess.SubprocessError) as exc: result={"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"error":str(exc),"schema_id":"pw-r9-goal-mode-v7-route-canary-controller-failure-v1","status":"FAIL_ZERO_CREDIT_NO_RETRY"}; rc=1
 sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__": raise SystemExit(main())
