#!/usr/bin/env python3
"""Native Goal harness with closed message phases and exact causal stderr closure."""

from __future__ import annotations

import argparse
import ast
import errno
import json
import os
from pathlib import Path
import re
import signal
import sqlite3
import stat
import subprocess
import sys
import threading
import time
from typing import Any

import goal_mode_single_process_attestor as ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v8"
ADAPTER = ga.ADAPTER
DEFAULT_TIMEOUT_SECONDS = 3600
MAX_SUBJECT_BYTES = 8_000_000
ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
SOURCES = (
    ("goal_mode_empirical_harness_v8/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v8/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v8/goal_mode_single_process_attestor.py", ROOT / "goal_mode_single_process_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
)
_ACTIVE: list[subprocess.Popen[bytes]] = []
RESULT_SCHEMA = "pw-r9-goal-mode-causal-stderr-row-result-v1"
STDERR_SCHEMA = "pw-r9-goal-mode-causal-stderr-classification-v1"
ROUTER_STDERR_RE = re.compile(r"^(?P<timestamp>[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z) ERROR codex_core::tools::router: error=collab spawn failed: no thread with id: (?P<thread_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\n$")

class LaunchFailure(ga.Invalid):
    pass


def _write_exclusive(path: Path, raw: bytes, mode: int = 0o600) -> None:
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), mode)
    try:
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, mode)
    ga.require(ga.base._read_regular(path, max(len(raw), 1)) == raw, f"exclusive write reopen: {path.name}")
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)


def _write_json(path: Path, value: Any, mode: int = 0o600) -> None:
    _write_exclusive(path, ga.canon(value), mode)


def _identity(label: str, path: Path) -> dict[str, Any]:
    raw = ga.base._read_regular(path, 16_000_000)
    return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":ga.sha256(raw)}


def _bindings() -> list[dict[str, Any]]:
    return [_identity(label, path) for label, path in SOURCES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 4_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority","bindings","review","row_spec","schema_id","status"}, "admission")
    ga.require(value["schema_id"] == ADMISSION_SCHEMA and value["status"] == "PASS_INDEPENDENT_SINGLE_PROCESS_GOAL_HARNESS_REVIEW", "admission schema/status")
    ga.require(value["authority"] == {"adapter":ADAPTER,"canary_launch":True,"launch_count":1,"matrix_launch":False,"qualification":False,"retry":False,"row_id":row["row_id"],"run_id":row["run_id"]}, "admission authority")
    ga.require(value["bindings"] == _bindings(), "admission bindings")
    review_ref = value["review"]
    ga.require(isinstance(review_ref, dict), "review reference")
    ga.base._exact_keys(review_ref, {"bytes","mode","path","sha256"}, "review reference")
    ga.require(isinstance(review_ref["path"], str) and review_ref["path"] == Path(review_ref["path"]).name, "review basename")
    review_path = path.parent / review_ref["path"]
    ga.require(_identity(review_ref["path"], review_path) == review_ref, "review identity")
    review = ga.load_json(review_path, 8_000_000)
    ga.require(isinstance(review, dict) and review.get("schema_id") == "pw-r9-goal-mode-harness-v8-independent-static-review-v1", "review schema")
    ga.require(review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_CAUSAL_STDERR_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH" and review.get("first_mismatch") is None, "review verdict")
    ga.require(review.get("authority") == {"canary_admission_eligible":True,"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False}, "review authority")
    ga.require(review.get("bindings") == _bindings(), "review source bindings")
    raw = ga.base._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes":len(raw),"sha256":ga.sha256(raw)}, "row binding")
    return value


def _snapshot(codex_home: Path) -> dict[str, Any]:
    with ga.base._connect_ro(ga.base._db_path(codex_home, "state")) as state:
        threads = [row[0] for row in state.execute("SELECT id FROM threads ORDER BY id")]
    with ga.base._connect_ro(ga.base._db_path(codex_home, "goals")) as goals:
        goal_ids = [row[0] for row in goals.execute("SELECT goal_id FROM thread_goals ORDER BY goal_id")]
    return {"captured_at_ms":int(time.time()*1000),"goal_ids":goal_ids,"schema_id":ga.SNAPSHOT_SCHEMA,"thread_ids":threads}


def _expected_objective(run_id: str, row_id: str, criteria: dict[str, Any], control: dict[str, Any], subject_hash: str) -> str:
    return f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={ga.sha256(ga.canon(criteria,newline=False))}; control_envelope_sha256={ga.sha256(ga.canon(control,newline=False))}; subject_commitment_sha256={subject_hash}; execute exactly one gated subject after native Goal activation and settle terminal Goal state."


def make_row_spec(args: argparse.Namespace) -> dict[str, Any]:
    subject = ga.base._read_regular(args.subject, MAX_SUBJECT_BYTES)
    ga.require(subject and b"\x00" not in subject, "subject nonempty NUL-free")
    subject.decode("utf-8")
    criteria = ga.load_json(args.criteria, 2_000_000); control = ga.load_json(args.control_envelope, 2_000_000)
    ga.require(isinstance(criteria, dict) and isinstance(control, dict), "criteria/control objects")
    digest = ga.sha256(subject)
    row = {"adapter":ADAPTER,"attempt":0,"cli_version":args.cli_version,"control_envelope":control,"criteria":criteria,"model":args.model,"objective":_expected_objective(args.run_id,args.row_id,criteria,control,digest),"reasoning_effort":args.reasoning_effort,"row_id":args.row_id,"run_id":args.run_id,"schema_id":ga.ROW_SCHEMA,"subject_utf8_bytes":len(subject),"subject_utf8_sha256":digest}
    _write_json(args.output, row, 0o644)
    return {"row_spec":_identity(args.output.name,args.output),"status":"ROW_SPEC_CREATED_ZERO_CREDIT_NO_LAUNCH"}


def _prompt(row: dict[str, Any], capture: Path, workspace: Path) -> bytes:
    get_code = ga.get_goal_code().rstrip("\n")
    create_code = ga.create_goal_code(row["objective"]).rstrip("\n")
    reader_code = ga.reader_code(row, capture, workspace).rstrip("\n")
    update_code = ga.update_goal_code().rstrip("\n")
    prompt = f"""R9 NATIVE GOAL MODE SINGLE-PROCESS BOOTSTRAP — THE SCORED SUBJECT IS NOT PRESENT.

You are one fresh empirical test taker. The controller has committed the subject hash and byte count but has not included the subject text. Before any file access, command, web request, collaboration action, or subject reasoning, invoke exactly these three native Goal actions as separate calls: `get_goal`, `create_goal`, then `get_goal`. If your tool surface exposes those Goal tools directly, call them directly with exact arguments. Otherwise use the exact code-mode forms below. Do not invoke any non-Goal tool first. Bootstrap commentary is allowed, but it is not a subject answer.

1. ```javascript
{get_code}
```
Require `goal` null.
2. ```javascript
{create_code}
```
Require the exact objective and status `active`.
3. ```javascript
{get_code}
```
Require the same Goal and status `active`.

Commitments: run_id={row['run_id']}; row_id={row['row_id']}; attempt=0; criteria_sha256={ga.sha256(ga.canon(row['criteria'],newline=False))}; control_envelope_sha256={ga.sha256(ga.canon(row['control_envelope'],newline=False))}; subject_commitment_sha256={row['subject_utf8_sha256']}; subject_utf8_bytes={row['subject_utf8_bytes']}.

After and only after call 3 succeeds, invoke the exact reader command once. If `exec_command` is exposed directly, call it directly with the same `cmd`, `workdir`, `yield_time_ms`, and `max_output_tokens`; otherwise execute exactly this one code-mode call:

```javascript
{reader_code}
```

The reader blocks while the controller independently proves this task's fresh active native Goal. Treat the returned UTF-8 text as the sole scored subject prompt. Do not read another prompt source. Perform all subject reasoning after that return, in this same task and same active Goal turn. Do not retry, relaunch, replace, delegate, or use any other subject tool. When the answer is fully determined, invoke exactly one terminal `update_goal` action with status `complete`, directly if exposed or through this exact code-mode form:

```javascript
{update_code}
```

Require the same Goal with status `complete`, then emit only the subject answer as the terminal assistant message.
"""
    raw = prompt.encode("utf-8")
    ga.require(row["subject_utf8_sha256"].encode() in raw and str(row["subject_utf8_bytes"]).encode() in raw, "prompt commitments")
    return raw


def _argv(codex: Path, row: dict[str, Any], workspace: Path, last: Path) -> list[str]:
    return [str(codex),"exec","--strict-config","-C",str(workspace),"--sandbox","read-only","--color","never","--json","-m",row["model"],"-c",f'model_reasoning_effort="{row["reasoning_effort"]}"',"-c","suppress_unstable_features_warning=true","-o",str(last),"-"]


def _parse_thread(line: bytes) -> str | None:
    try:
        value = json.loads(line)
    except json.JSONDecodeError:
        return None
    result = value.get("thread_id") if isinstance(value, dict) and value.get("type") == "thread.started" else None
    return result if isinstance(result, str) else None


def _pump(stream: Any, path: Path, thread_event: threading.Event, thread_box: list[str], errors: list[str]) -> None:
    try:
        fd = os.open(path, os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_CLOEXEC",0), 0o600)
        try:
            os.fchmod(fd,0o600)
            while True:
                chunk = stream.readline()
                if not chunk: break
                offset=0
                while offset<len(chunk): offset += os.write(fd,chunk[offset:])
                os.fsync(fd)
                thread_id = _parse_thread(chunk) if path.name == "stdout.jsonl" else None
                if thread_id:
                    if thread_box and thread_box[0] != thread_id: errors.append("multiple thread ids")
                    elif not thread_box: thread_box.append(thread_id); thread_event.set()
        finally:
            os.close(fd)
    except BaseException as exc:
        errors.append(f"{path.name}:{type(exc).__name__}:{exc}"); thread_event.set()


def _start(argv: list[str], prompt: bytes, capture: Path, cwd: Path) -> tuple[subprocess.Popen[bytes], list[threading.Thread], list[str], list[str], int]:
    started = int(time.time()*1000)
    process = subprocess.Popen(argv,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,cwd=cwd,start_new_session=True)
    _ACTIVE.append(process)
    _write_json(capture/"launch_receipt.json", {"argv":argv,"phase":"SINGLE_PROCESS","pid":process.pid,"schema_id":ga.LAUNCH_SCHEMA,"started_at_ms":started,"stdin":{"bytes":len(prompt),"sha256":ga.sha256(prompt)}})
    ga.require(process.stdin is not None and process.stdout is not None and process.stderr is not None, "process pipes")
    event=threading.Event(); box:list[str]=[]; errors:list[str]=[]
    out=threading.Thread(target=_pump,args=(process.stdout,capture/"stdout.jsonl",event,box,errors),daemon=True)
    err=threading.Thread(target=_pump,args=(process.stderr,capture/"stderr.bin",threading.Event(),[],errors),daemon=True)
    out.start(); err.start(); process.stdin.write(prompt); process.stdin.close()
    return process,[out,err],box,errors,started


def _terminate(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is None:
        try: os.killpg(process.pid,signal.SIGTERM)
        except ProcessLookupError: pass
        try: process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            try: os.killpg(process.pid,signal.SIGKILL)
            except ProcessLookupError: pass
            try: process.wait(timeout=10)
            except subprocess.TimeoutExpired: pass


def _normalize(path: Path) -> None:
    try: before=os.lstat(path)
    except FileNotFoundError: return
    ga.require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe output: {path.name}")
    os.chmod(path,0o600); after=os.lstat(path)
    ga.require((before.st_dev,before.st_ino)==(after.st_dev,after.st_ino) and stat.S_IMODE(after.st_mode)==0o600, f"output normalization: {path.name}")


def _reader_pids(fifo: Path) -> list[int]:
    target=str(fifo).encode(); result=[]
    for member in Path("/proc").iterdir():
        if not member.name.isdigit(): continue
        try: raw=(member/"cmdline").read_bytes()
        except FileNotFoundError: continue
        except (OSError,PermissionError) as exc: raise LaunchFailure(f"reader census:{member.name}:{exc}") from exc
        if target in raw and b"read_goal_subject.py" in raw: result.append(int(member.name))
    return sorted(result)


def _signal_readers(fifo: Path, pids: list[int], sig: signal.Signals) -> int:
    target=str(fifo).encode(); sent=0
    for pid in pids:
        try: fd=os.pidfd_open(pid)
        except ProcessLookupError: continue
        try:
            try: raw=Path(f"/proc/{pid}/cmdline").read_bytes()
            except FileNotFoundError: continue
            ga.require(target in raw and b"read_goal_subject.py" in raw, "reader PID drift")
            signal.pidfd_send_signal(fd,sig); sent+=1
        finally: os.close(fd)
    return sent


def _quiesce(fifo: Path) -> dict[str, Any]:
    deadline=time.monotonic()+5
    while time.monotonic()<deadline and _reader_pids(fifo): time.sleep(0.05)
    detected=_reader_pids(fifo); term=_signal_readers(fifo,detected,signal.SIGTERM) if detected else 0
    deadline=time.monotonic()+5
    while time.monotonic()<deadline and _reader_pids(fifo): time.sleep(0.05)
    remaining=_reader_pids(fifo); kill=_signal_readers(fifo,remaining,signal.SIGKILL) if remaining else 0
    deadline=time.monotonic()+5
    while time.monotonic()<deadline and _reader_pids(fifo): time.sleep(0.05)
    return {"detected_pids":detected,"kill_sent":kill,"remaining_pids":_reader_pids(fifo),"term_sent":term}


def _deliver(fifo: Path, subject: bytes, process: subprocess.Popen[bytes], deadline: float) -> dict[str, Any]:
    while time.monotonic()<deadline and process.poll() is None:
        try: fd=os.open(fifo,os.O_WRONLY|os.O_NONBLOCK|getattr(os,"O_CLOEXEC",0))
        except OSError as exc:
            if exc.errno==errno.ENXIO: time.sleep(0.02); continue
            return {"error":f"fifo_open:{exc}"}
        try:
            offset=0
            while offset<len(subject): offset += os.write(fd,subject[offset:])
            return {"bytes":len(subject),"closed_at_ms":int(time.time()*1000),"schema_id":ga.DELIVERY_SCHEMA,"sha256":ga.sha256(subject),"status":"DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE"}
        except OSError as exc: return {"error":f"fifo_write:{exc}"}
        finally: os.close(fd)
    return {"error":"fifo_reader_never_opened"}


def _classify_stderr(raw: bytes, attestation: dict[str, Any], codex_home: Path) -> dict[str, Any]:
    if raw == b"":
        return {"accepted":True,"bytes":0,"category":"EMPTY_STDERR","current_thread_id":attestation["goal"]["thread_id"],"referenced_thread_id":None,"schema_id":STDERR_SCHEMA,"sha256":ga.sha256(raw),"status":"PASS_EXACT_EMPTY_STDERR"}
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise LaunchFailure("stderr non-UTF8") from exc
    match = ROUTER_STDERR_RE.fullmatch(text)
    ga.require(match is not None, "stderr outside exact causal classifier")
    referenced = match.group("thread_id"); current = attestation["goal"]["thread_id"]
    ga.require(referenced != current, "router diagnostic references current test-taker thread")
    rollout_path = codex_home / attestation["rollout"]["logical_path"]
    rollout_raw = ga.base._read_regular(rollout_path, 64_000_000)
    ga.require(referenced.encode("ascii") not in rollout_raw, "router diagnostic thread appears in test-taker rollout")
    return {"accepted":True,"bytes":len(raw),"category":"ORPHANED_COLLAB_ROUTER_DIAGNOSTIC_NOT_SUBJECT_ACTION","current_thread_id":current,"referenced_thread_id":referenced,"schema_id":STDERR_SCHEMA,"sha256":ga.sha256(raw),"status":"PASS_EXACT_CAUSALLY_DISJOINT_INTERNAL_ROUTER_DIAGNOSTIC"}


def run_codex_row(args: argparse.Namespace) -> dict[str, Any]:
    row=ga.load_row(args.row_spec); subject=ga.base._read_regular(args.subject,MAX_SUBJECT_BYTES); subject.decode("utf-8")
    ga.require(len(subject)==row["subject_utf8_bytes"] and ga.sha256(subject)==row["subject_utf8_sha256"], "subject identity")
    _load_admission(args.admission,args.row_spec,row)
    ga.require(not args.capture_root.exists(), "capture root must be absent")
    args.capture_root.mkdir(mode=0o700,parents=False); os.chmod(args.capture_root,0o700)
    _write_json(args.capture_root/"prelaunch_snapshot.json",_snapshot(args.codex_home))
    fifo=args.capture_root/"subject.fifo"; os.mkfifo(fifo,0o600); os.chmod(fifo,0o600)
    prompt=_prompt(row,args.capture_root,args.workspace.resolve()); _write_exclusive(args.capture_root/"bootstrap_prompt.txt",prompt)
    last=args.capture_root/"output_last_message.txt"
    process,threads,box,errors,started=_start(_argv(args.codex.resolve(),row,args.workspace.resolve(),last),prompt,args.capture_root,args.workspace)
    release=None; release_error="active Goal release gate timeout"; release_deadline=time.monotonic()+min(300,args.timeout_seconds)
    while time.monotonic()<release_deadline and process.poll() is None:
        if box and not errors:
            try:
                release=ga.attest_release(args.row_spec,args.capture_root,args.codex_home); break
            except (ga.Invalid,OSError,sqlite3.Error,UnicodeError) as exc: release_error=str(exc)
        time.sleep(0.05)
    delivery:dict[str,Any]={}; timed_out=False
    if release is not None:
        _write_json(args.capture_root/"goal_active_subject_release_gate.json",release)
        delivery=_deliver(fifo,subject,process,time.monotonic()+30)
        if delivery.get("status")=="DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE":
            _write_json(args.capture_root/"subject_delivery.json",delivery); _write_exclusive(args.capture_root/"subject_input.txt",subject)
    if release is None or delivery.get("status")!="DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE": _terminate(process)
    else:
        try: process.wait(timeout=max(0.1,args.timeout_seconds))
        except subprocess.TimeoutExpired: timed_out=True; _terminate(process)
    for thread in threads: thread.join(timeout=10)
    _normalize(last)
    quiescence=_quiesce(fifo)
    if not quiescence["remaining_pids"] and fifo.exists():
        fifo.unlink(); dfd=os.open(args.capture_root,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_CLOEXEC",0)); os.fsync(dfd); os.close(dfd)
    receipt={"ended_at_ms":int(time.time()*1000),"goal_release_error":None if release is not None else release_error,"pid":process.pid,"rc":process.returncode,"reader_quiescence":quiescence,"schema_id":ga.PROCESS_SCHEMA,"started_at_ms":started,"stdin_closed":True,"subject_delivery":delivery,"subject_fifo_removed":not fifo.exists(),"subject_release":"AFTER_SAME_PROCESS_NATIVE_GOAL_ACTIVE_ATTESTATION" if release is not None else "NOT_RELEASED","timed_out":timed_out}
    _write_json(args.capture_root/"process_receipt.json",receipt)
    if release is None: raise LaunchFailure(f"active Goal gate failed; subject withheld: {release_error}")
    if delivery.get("status")!="DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE": raise LaunchFailure(f"subject delivery failed:{delivery}")
    if process.returncode!=0 or timed_out or errors: raise LaunchFailure(f"single process terminal failure:rc={process.returncode}:timed_out={timed_out}:pump={errors}")
    if quiescence["term_sent"] or quiescence["kill_sent"] or quiescence["remaining_pids"]: raise LaunchFailure(f"reader forced cleanup:{quiescence}")
    stderr_raw=ga.base._read_regular(args.capture_root/"stderr.bin",64_000_000)
    attestation=ga.attest_final(args.row_spec,args.capture_root,args.codex_home)
    classification=_classify_stderr(stderr_raw,attestation,args.codex_home)
    _write_json(args.capture_root/"goal_mode_attestation.json",attestation)
    _write_json(args.capture_root/"stderr_classification.json",classification)
    return {"attestation":attestation,"schema_id":RESULT_SCHEMA,"status":"PASS_SINGLE_PROCESS_NATIVE_GOAL_CAUSAL_STDERR_ZERO_CREDIT","stderr_classification":classification}


def check(args: argparse.Namespace) -> dict[str, Any]:
    contract=ga.load_json(ROOT/"goal_mode_contract.json",4_000_000)
    ga.require(contract["schema_id"]=="pw-r9-goal-mode-empirical-harness-contract-v8" and contract["authority"]=={"canary_launch":False,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False}, "contract authority")
    ga.require(contract["architecture"]["process_topology"]=="ONE_CODEX_EXEC_PROCESS_ONE_TASK_ONE_TURN" and contract["loop_breaker"]["fresh_canary_required"] is True, "distinct architecture")
    ga.require(contract["architecture"]["goal_action_projection"]=="CLOSED_NORMALIZATION_OF_DIRECT_NATIVE_FUNCTION_OR_NESTED_CODE_MODE_EXEC" and contract["architecture"]["message_projection"]=="ORDERED_ROLLOUT_COMMENTARY_STAR_THEN_ONE_FINAL_BOUND_TO_CLI_AGENT_MESSAGES", "Goal/message normalization")
    ga.require(contract["causal_stderr_classifier"]["policy"]=="FAIL_CLOSED_EXCEPT_EXACT_CAUSALLY_DISJOINT_INTERNAL_ROUTER_DIAGNOSTIC" and contract["architecture"]["adapter"]==ADAPTER, "causal stderr contract")
    ga.require(contract["omp_lane"]["launch_argv"]==["omp","--cwd","P:\\"] and contract["omp_lane"]["duplicate_spawn"] is False, "OMP boundary")
    for name in ("goal_mode_harness.py","goal_mode_single_process_attestor.py"):
        ast.parse((ROOT/name).read_text(encoding="utf-8"),filename=name)
    version=subprocess.run([str(args.codex),"--version"],stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,timeout=10)
    ga.require(version.returncode==0 and version.stderr==b"" and version.stdout.decode().strip()=="codex-cli 0.148.0", "Codex version")
    help_run=subprocess.run([str(args.codex),"exec","--help"],stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,timeout=10)
    ga.require(help_run.returncode==0 and b"Run Codex non-interactively" in help_run.stdout, "Codex exec surface")
    return {"authority":{"canary_launch":False,"matrix_launch":False,"qualification_credit":0},"bindings":_bindings(),"checks":{"causal_stderr_classifier":"PASS_STATIC_EXACT_TWO_CLASS_FAIL_CLOSED","codex_cli_version":"codex-cli 0.148.0","goal_action_normalization":"PASS_STATIC","goal_before_subject":"PASS_STATIC","message_phase_binding":"PASS_STATIC","one_process_one_turn":"PASS_STATIC","omp_lane":"EXISTING_WINDOWS_CONTROLLER_ONLY_NO_DUPLICATE_SPAWN","resume_surface_absent":"PASS_STATIC","source_ast":"PASS"},"schema_id":"pw-r9-goal-mode-harness-check-v8","status":"PASS_STATIC_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT"}


def _emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(ga.canon(value))


def main(argv: list[str] | None=None) -> int:
    parser=argparse.ArgumentParser(); sub=parser.add_subparsers(dest="command",required=True)
    pcheck=sub.add_parser("check"); pcheck.add_argument("--codex",type=Path,required=True)
    make=sub.add_parser("make-row-spec")
    for flag in ("subject","criteria","control-envelope","output"): make.add_argument(f"--{flag}",type=Path,required=True)
    for flag in ("run-id","row-id","model","reasoning-effort"): make.add_argument(f"--{flag}",required=True)
    make.add_argument("--cli-version",default="0.148.0")
    run=sub.add_parser("run-codex-row")
    for flag in ("row-spec","subject","admission","capture-root","codex-home","codex","workspace"): run.add_argument(f"--{flag}",type=Path,required=True)
    run.add_argument("--timeout-seconds",type=int,default=DEFAULT_TIMEOUT_SECONDS)
    args=parser.parse_args(argv)
    try:
        if args.command=="check": result=check(args)
        elif args.command=="make-row-spec": result=make_row_spec(args)
        else: ga.require(60<=args.timeout_seconds<=7200,"timeout bounds"); result=run_codex_row(args)
        _emit(result); return 0
    except (ga.Invalid,OSError,sqlite3.Error,UnicodeError,subprocess.SubprocessError) as exc:
        _emit({"authority":{"qualification_credit":0,"subject_release":False},"error":str(exc),"schema_id":"pw-r9-goal-mode-harness-failure-v8","status":"FAIL_CLOSED_ZERO_CREDIT_NO_RETRY"}); return 1
    finally:
        while _ACTIVE:
            process=_ACTIVE.pop(); _terminate(process)
            for stream in (process.stdin,process.stdout,process.stderr):
                try:
                    if stream is not None: stream.close()
                except OSError: pass


if __name__=="__main__":
    raise SystemExit(main())
