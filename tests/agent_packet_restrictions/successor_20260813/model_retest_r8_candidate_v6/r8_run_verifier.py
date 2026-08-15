#!/usr/bin/env python3
"""Read-only closed-world verifier for R8 candidate-6 run evidence.

Every evidence path is derived from the execution root, frozen slot, frozen
cell, or frozen deterministic stage.  The program emits canonical JSON to
stdout and never writes files or calls a subject/provider.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from typing import Any

sys.dont_write_bytecode = True
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v6"
HARNESS = ROOT / "r8_harness.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-6"
IDENTITY_FAMILY = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
SNAPSHOT_DESCRIPTOR_SHA256 = "28730f6ea44a5720cb8e473f8fb736353dfe5c412e21261eacc88d70ffe46392"
WRAPPER_SOURCE_THREAD_ID = "019ffbff-994a-76f0-9c06-57bab28b7ee3"
CODEX_SESSION_ROOT = Path("/home/sittingmongoose/.codex/sessions")
FREEZE_MANIFEST_REL = "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v6_freeze_manifest.json"
FREEZE_MANIFEST = REPO / FREEZE_MANIFEST_REL
CANDIDATE_ROOT_REL = "model_retest_r8_candidate_v6"
CANDIDATE_REQUIRED_FILES = (
    "README.md", "architecture_contract.json", "controller_contract.json",
    "counterfactual_holdouts.json", "deterministic_preflight_report.json",
    "independent_preseal_audit.json", "r8_harness.py", "r8_run_verifier.py",
    "r8_subject_task_driver.py", "revision_lineage.json", "verifier_contract.json",
)
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
STAGES = ("S10A","S10B","S20A","S20B","S30A","S30B","S40A","S40B","S45A","S45B","S50","S55","S60P","S60C","S60K","S70","S80","S90")
ROUTES = {"slot-alpha":("gpt-5.4-mini","xhigh"),"slot-bravo":("gpt-5.4-mini","medium"),"slot-charlie":("gpt-5.6-luna","medium")}
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
FINAL_EXCLUSIONS = ("artifact_manifest.json", "validation_report.json")
QUALIFICATION_CONTRACT = {
    "required_matrices":2,"qualification_sequences":[1,2],"routes_per_matrix":3,
    "cells_per_route":97,"subject_calls_per_matrix":291,"required_subject_calls":582,
    "required_fresh_thread_create_evidence_count":582,
    "required_matrix_terminal":"COMPLETE_CLEAN_MATRIX_PASS","required_clean_credit_per_matrix":1,
    "required_pass_count":582,"allowed_fail_count":0,"allowed_invalid_count":0,
    "allowed_missing_count":0,"allowed_ineligible_count":0,"allowed_retry_count":0,
    "allowed_best_of_count":0,"allowed_replacement_count":0,
    "fresh_task_identity_basis":"thread_id","required_unique_task_identity_count":582,
    "required_unique_thread_count":582,
    "required_unique_turn_count":582,
}
PROHIBITED_ITEM_TYPES = {
    "function_call", "function_call_output", "web_search_call",
    "computer_tool_call", "image_generation_call",
}
class Invalid(RuntimeError): pass


def dump(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def sha(data: bytes) -> str: return hashlib.sha256(data).hexdigest()


def expected_text_normalization(
    finals: list[Any],
    single_text: str|None,
    prohibited_types: list[str],
    observations: list[str],
) -> dict[str,Any]:
    """Independently derive the only admitted idempotent-final observation."""
    count=len(finals)
    if count==1:
        scoring_text=single_text; status="NOT_APPLIED_SINGLE_FINAL"; normalized_count=0; reasons=[]
    else:
        reason_set:set[str]=set()
        if prohibited_types: reason_set.add("prohibited_activity_present")
        if observations != ["assistant_final_message_count_not_one"]: reason_set.add("non_multiplicity_conformance_observation")
        texts:list[str]=[]
        for final in finals:
            content=final.get("content") if isinstance(final,dict) else None
            if not isinstance(content,list) or len(content)!=1 or not isinstance(content[0],dict) or content[0].get("type")!="output_text" or not isinstance(content[0].get("text"),str):
                reason_set.add("final_content_not_single_output_text")
                continue
            texts.append(content[0]["text"])
        if len(texts)==count and len({text.encode("utf-8") for text in texts})!=1: reason_set.add("final_text_bytes_not_identical")
        reasons=sorted(reason_set)
        if count>=2 and not reasons:
            scoring_text=texts[0]; status="APPLIED_IDENTICAL_DUPLICATE_FINALS"; normalized_count=count
        else:
            scoring_text=None; status="REJECTED_MULTIPLE_FINALS"; normalized_count=0
    scoring_bytes=None if scoring_text is None else scoring_text.encode("utf-8")
    return {"schema_id":"pw-r8-idempotent-final-text-normalization-v1","status":status,"assistant_final_message_count":count,"normalized_duplicate_count":normalized_count,"scoring_text_output_utf8":scoring_text,"scoring_text_output_sha256":None if scoring_bytes is None else sha(scoring_bytes),"scoring_text_output_bytes":None if scoring_bytes is None else len(scoring_bytes),"rejection_reasons":reasons}


def normalization_counts(scores: list[dict[str,Any]]) -> dict[str,int]:
    statuses=[score.get("text_normalization_status") for score in scores]
    allowed={"NOT_APPLIED_SINGLE_FINAL","APPLIED_IDENTICAL_DUPLICATE_FINALS","REJECTED_MULTIPLE_FINALS"}
    if any(status not in allowed for status in statuses): raise Invalid("score normalization status outside closed world")
    return {
        "normalization_not_applied_call_count":statuses.count("NOT_APPLIED_SINGLE_FINAL"),
        "normalization_applied_call_count":statuses.count("APPLIED_IDENTICAL_DUPLICATE_FINALS"),
        "normalization_rejected_call_count":statuses.count("REJECTED_MULTIPLE_FINALS"),
    }


def reject_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out: raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def strict_object(data: bytes, label: str, canonical: bool = True) -> dict[str, Any]:
    try: value = json.loads(data.decode("utf-8"), object_pairs_hook=reject_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc: raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict): raise Invalid(f"{label}: top level is not object")
    if canonical and dump(value) != data: raise Invalid(f"{label}: not canonical minified JSON")
    return value


def root_path(value: str) -> Path:
    path = Path(value).resolve()
    if not path.is_relative_to(SUCCESSOR.resolve()): raise Invalid("execution-root is outside successor_20260813")
    if path == SUCCESSOR.resolve() or path == ROOT.resolve(): raise Invalid("execution-root must be a contained run directory")
    return path


def regular(path: Path, label: str) -> bytes:
    """lstat, no-follow open, fstat, and read one stable regular file."""
    try: before = os.lstat(path)
    except FileNotFoundError as exc: raise Invalid(f"{label}: missing {path}") from exc
    if not stat.S_ISREG(before.st_mode): raise Invalid(f"{label}: not a regular nonlink")
    flags=os.O_RDONLY | getattr(os,"O_CLOEXEC",0) | getattr(os,"O_NOFOLLOW",0)
    try: fd=os.open(path,flags)
    except OSError as exc: raise Invalid(f"{label}: no-follow open failed: {exc}") from exc
    try:
        opened=os.fstat(fd)
        if not stat.S_ISREG(opened.st_mode) or (opened.st_dev,opened.st_ino)!=(before.st_dev,before.st_ino): raise Invalid(f"{label}: file identity changed during open")
        chunks=[]
        while True:
            chunk=os.read(fd,1024*1024)
            if not chunk: break
            chunks.append(chunk)
        after=os.fstat(fd); data=b"".join(chunks)
        stable=(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)==(opened.st_dev,opened.st_ino,opened.st_size,opened.st_mtime_ns)
        if not stable or len(data)!=after.st_size: raise Invalid(f"{label}: file changed during read")
        return data
    finally: os.close(fd)


def payload(path: Path, label: str) -> tuple[bytes, bytes, dict[str, Any]]:
    storage = regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"): raise Invalid(f"{label}: storage must have exactly one terminal LF")
    raw = storage[:-1]
    return storage, raw, strict_object(raw, label)


def file_row(path: Path, rel: str, label: str) -> dict[str,Any]:
    data=regular(path,label)
    return {"path":rel,"sha256":sha(data),"bytes":len(data)}


def checked_relative(base: Path, rel: str, label: str) -> Path:
    if not isinstance(rel,str) or not rel or Path(rel).is_absolute() or rel!=Path(rel).as_posix(): raise Invalid(f"{label}: path is not exact relative POSIX form")
    lexical=base/rel
    path=lexical.resolve()
    if path!=lexical or not path.is_relative_to(base.resolve()): raise Invalid(f"{label}: path escapes declared root or traverses a link")
    return lexical


def validate_audit(path: Path, binding: dict[str,Any]) -> dict[str,Any]:
    data=regular(path,"independent preseal audit")
    audit=strict_object(data,"independent preseal audit",canonical=False)
    if audit.get("schema_id")!="pw-r8-candidate-v6-independent-preseal-audit-v1" or audit.get("candidate_id")!=CANDIDATE_ID or audit.get("audit_kind")!="independent_adversarial_static_deterministic_preseal" or audit.get("status")!="PRESEAL_PASS" or audit.get("launch_ready") is not True or audit.get("empirical_model_success") is not False or audit.get("qualification_achieved") is not False: raise Invalid("independent preseal audit is not an exact candidate-v6 PASS")
    if audit.get("blockers")!=[]: raise Invalid("independent preseal audit blockers are not empty")
    scope=audit.get("audit_scope")
    expected_scope_root=f"tests/agent_packet_restrictions/successor_20260813/{CANDIDATE_ROOT_REL}"
    expected_output=f"{expected_scope_root}/independent_preseal_audit.json"
    if not isinstance(scope,dict) or scope.get("candidate_root")!=expected_scope_root or scope.get("exact_current_candidate_bytes") is not True or scope.get("live_plans_read") is not False or scope.get("frozen_fixture_only") is not True or scope.get("subject_or_provider_calls_forbidden") is not True or scope.get("temporary_or_cache_writes_forbidden") is not True or scope.get("output_path")!=expected_output: raise Invalid("independent preseal audit scope mismatch")
    calls=audit.get("zero_call_attestation")
    zero_fields=("subject_calls","provider_calls","network_calls","live_plans_reads","temporary_files_written","cache_files_written","candidate_files_modified")
    if not isinstance(calls,dict) or any(type(calls.get(key)) is not int or calls[key]!=0 for key in zero_fields) or calls.get("files_written")!=[expected_output]: raise Invalid("independent preseal audit zero-call/write attestation invalid")
    want={"path":f"{CANDIDATE_ROOT_REL}/independent_preseal_audit.json","storage_sha256":sha(data),"storage_bytes":len(data),"schema_id":audit["schema_id"],"status":"PRESEAL_PASS","launch_ready":True}
    if binding!=want or tuple(binding)!=("path","storage_sha256","storage_bytes","schema_id","status","launch_ready"): raise Invalid("independent preseal audit binding mismatch")
    return want


def validate_freeze_manifest(path_value: str|Path, expected_sha: str|None=None, expected_bytes: int|None=None) -> dict[str,Any]:
    supplied=Path(path_value)
    if str(supplied)==FREEZE_MANIFEST_REL: lexical=FREEZE_MANIFEST
    elif str(supplied)==str(FREEZE_MANIFEST): lexical=FREEZE_MANIFEST
    else: raise Invalid("candidate freeze manifest path is not the fixed external path")
    try: resolved=lexical.resolve(strict=True)
    except FileNotFoundError as exc: raise Invalid("external candidate freeze manifest missing") from exc
    if resolved!=lexical: raise Invalid("external candidate freeze manifest path traverses a link")
    storage=regular(lexical,"external candidate freeze manifest")
    storage_sha=sha(storage); storage_bytes=len(storage)
    if expected_sha is not None and expected_sha!=storage_sha: raise Invalid("run contract freeze manifest hash mismatch")
    if expected_bytes is not None and (type(expected_bytes) is not int or expected_bytes!=storage_bytes): raise Invalid("run contract freeze manifest bytes mismatch")
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage: raise Invalid("freeze manifest storage framing invalid")
    manifest=strict_object(storage[:-1],"external candidate freeze manifest")
    manifest_keys=("schema_id","candidate_id","identity_family","claim_boundary","candidate_root","frozen_snapshot_descriptor_sha256","preseal_terminal","preseal_launch_ready","independent_preseal_audit","qualification_contract","candidate_file_count","candidate_files","runtime_dependency_count","runtime_dependencies")
    if tuple(manifest)!=manifest_keys: raise Invalid("freeze manifest keys/order outside exact contract")
    identity=(manifest.get("schema_id"),manifest.get("candidate_id"),manifest.get("identity_family"),manifest.get("claim_boundary"),manifest.get("candidate_root"),manifest.get("frozen_snapshot_descriptor_sha256"),manifest.get("preseal_terminal"),manifest.get("preseal_launch_ready"))
    wanted_identity=("pw-r8-external-candidate-freeze-manifest-v3",CANDIDATE_ID,IDENTITY_FAMILY,"unfinished throwaway frozen-snapshot prompt-architecture experiment only",CANDIDATE_ROOT_REL,SNAPSHOT_DESCRIPTOR_SHA256,"PRESEAL_PASS",True)
    if identity!=wanted_identity: raise Invalid("freeze manifest identity/status mismatch")
    if manifest.get("qualification_contract")!=QUALIFICATION_CONTRACT or tuple(manifest["qualification_contract"])!=tuple(QUALIFICATION_CONTRACT): raise Invalid("freeze manifest qualification contract mismatch")
    root_stat=os.lstat(ROOT)
    if not stat.S_ISDIR(root_stat.st_mode) or ROOT.resolve()!=ROOT: raise Invalid("candidate root is not an exact regular directory")
    actual_names=tuple(sorted(path.name for path in ROOT.iterdir()))
    if actual_names!=CANDIDATE_REQUIRED_FILES: raise Invalid("candidate directory closed-world file set mismatch")
    rows=manifest.get("candidate_files")
    if type(manifest.get("candidate_file_count")) is not int or manifest["candidate_file_count"]!=len(CANDIDATE_REQUIRED_FILES) or not isinstance(rows,list) or len(rows)!=len(CANDIDATE_REQUIRED_FILES): raise Invalid("freeze candidate inventory count mismatch")
    if any(not isinstance(row,dict) or tuple(row)!=("path","sha256","bytes") for row in rows): raise Invalid("freeze candidate inventory row schema mismatch")
    if [row["path"] for row in rows]!=list(CANDIDATE_REQUIRED_FILES): raise Invalid("freeze candidate inventory is not exact sorted closed world")
    actual_rows=[]
    for name in CANDIDATE_REQUIRED_FILES:
        actual_rows.append(file_row(checked_relative(ROOT,name,"candidate file"),name,f"candidate file {name}"))
    if rows!=actual_rows: raise Invalid("freeze candidate inventory hash/bytes drift")
    audit_binding=manifest.get("independent_preseal_audit")
    if not isinstance(audit_binding,dict): raise Invalid("freeze independent audit binding missing")
    validated_audit=validate_audit(ROOT/"independent_preseal_audit.json",audit_binding)
    architecture=strict_object(regular(ROOT/"architecture_contract.json","architecture contract"),"architecture contract",canonical=False)
    if architecture.get("candidate_id")!=CANDIDATE_ID: raise Invalid("architecture contract candidate mismatch")
    closure=architecture.get("runtime_dependency_closure")
    if not isinstance(closure,list) or not closure: raise Invalid("architecture runtime dependency closure missing")
    expected_runtime=[]
    for row in closure:
        if not isinstance(row,dict) or not all(key in row for key in ("path","sha256","bytes")): raise Invalid("architecture runtime dependency row invalid")
        rel=row["path"]
        path=checked_relative(SUCCESSOR,rel,"runtime dependency")
        actual=file_row(path,rel,f"runtime dependency {rel}")
        if actual!={"path":rel,"sha256":row["sha256"],"bytes":row["bytes"]}: raise Invalid(f"architecture runtime dependency drift: {rel}")
        expected_runtime.append(actual)
    expected_runtime=sorted(expected_runtime,key=lambda row:row["path"])
    if len({row["path"] for row in expected_runtime})!=len(expected_runtime): raise Invalid("runtime dependency paths duplicated")
    runtime=manifest.get("runtime_dependencies")
    if type(manifest.get("runtime_dependency_count")) is not int or manifest["runtime_dependency_count"]!=len(expected_runtime) or not isinstance(runtime,list): raise Invalid("freeze runtime dependency count mismatch")
    if any(not isinstance(row,dict) or tuple(row)!=("path","sha256","bytes") for row in runtime) or runtime!=expected_runtime: raise Invalid("freeze runtime dependency inventory mismatch")
    manifest_successor_rel=FREEZE_MANIFEST.relative_to(SUCCESSOR).as_posix()
    if any(row["path"] in (FREEZE_MANIFEST_REL,manifest_successor_rel) for row in [*rows,*runtime]): raise Invalid("freeze manifest must not inventory itself")
    candidate_bytes=dump(actual_rows); runtime_bytes=dump(expected_runtime); qualification_bytes=dump(QUALIFICATION_CONTRACT)
    out={"schema_id":"pw-r8-freeze-validation-v1","candidate_id":CANDIDATE_ID,"status":"PASS","manifest_path":FREEZE_MANIFEST_REL,"manifest_storage_sha256":storage_sha,"manifest_storage_bytes":storage_bytes,"frozen_snapshot_descriptor_sha256":SNAPSHOT_DESCRIPTOR_SHA256,"candidate_file_count":len(actual_rows),"candidate_inventory_sha256":sha(candidate_bytes),"candidate_inventory_bytes":len(candidate_bytes),"runtime_dependency_count":len(expected_runtime),"runtime_dependency_inventory_sha256":sha(runtime_bytes),"runtime_dependency_inventory_bytes":len(runtime_bytes),"independent_preseal_audit":validated_audit,"qualification_contract_sha256":sha(qualification_bytes),"qualification_contract_bytes":len(qualification_bytes),"manifest_excludes_itself":True,"candidate_directory_closed_world":True}
    return out


def run_contract(execution_root: Path) -> dict[str, Any]:
    _, _, value = payload(execution_root / "run_contract.json", "run contract")
    if value.get("schema_id") != "pw-r8-run-contract-v3" or value.get("candidate_id") != CANDIDATE_ID: raise Invalid("run contract identity mismatch")
    expected_keys=("schema_id","candidate_id","run_id","routes","candidate_freeze_manifest_path","candidate_freeze_manifest_storage_sha256","candidate_freeze_manifest_storage_bytes","qualification_sequence","predecessor_run_id")
    if tuple(value)!=expected_keys: raise Invalid("run contract keys/order outside closed world")
    run_id = value.get("run_id")
    if not isinstance(run_id, str) or not RUN_ID_RE.fullmatch(run_id): raise Invalid("run contract run_id invalid")
    if value.get("routes") != {s:{"requested_model":ROUTES[s][0],"requested_thinking":ROUTES[s][1]} for s in SLOTS}: raise Invalid("run contract routes mismatch")
    manifest_path=value.get("candidate_freeze_manifest_path"); manifest_sha=value.get("candidate_freeze_manifest_storage_sha256"); manifest_bytes=value.get("candidate_freeze_manifest_storage_bytes")
    if manifest_path!=FREEZE_MANIFEST_REL or not isinstance(manifest_sha,str) or not re.fullmatch(r"[0-9a-f]{64}",manifest_sha) or type(manifest_bytes) is not int or manifest_bytes<=0: raise Invalid("run contract candidate freeze manifest identity invalid")
    freeze=validate_freeze_manifest(manifest_path,manifest_sha,manifest_bytes)
    if (freeze["manifest_storage_sha256"],freeze["manifest_storage_bytes"])!=(manifest_sha,manifest_bytes): raise Invalid("run contract validated freeze identity mismatch")
    sequence=value.get("qualification_sequence"); predecessor=value.get("predecessor_run_id")
    if type(sequence) is not int or sequence not in (1,2): raise Invalid("run contract qualification sequence must be 1 or 2")
    if sequence==1 and predecessor is not None: raise Invalid("qualification sequence 1 predecessor must be null")
    if sequence==2 and (not isinstance(predecessor,str) or not RUN_ID_RE.fullmatch(predecessor) or predecessor==run_id): raise Invalid("qualification sequence 2 predecessor invalid")
    return value


def freeze_binding(contract: dict[str,Any]) -> dict[str,Any]:
    return {"path":contract["candidate_freeze_manifest_path"],"storage_sha256":contract["candidate_freeze_manifest_storage_sha256"],"storage_bytes":contract["candidate_freeze_manifest_storage_bytes"]}


def ordered_schedule(execution_root: Path, cells: tuple[str,...]) -> dict[str,Any]:
    _,_,value=payload(execution_root/"ordered_schedule.json","ordered schedule")
    want={"schema_id":"pw-r8-ordered-schedule-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(execution_root)["run_id"],"cells":list(cells)}
    if value!=want: raise Invalid("ordered schedule does not exactly bind frozen harness schedule")
    return value


def validate_layout(root: Path, cells: tuple[str,...]) -> None:
    root_names={"run_contract.json","ordered_schedule.json","subject_call_accounting.json","validation_report.json","artifact_manifest.json","matrix_terminal.json"}
    cell_set=set(cells); stage_set=set(STAGES)
    for path in root.rglob("*"):
        st=os.lstat(path); rel=path.relative_to(root); parts=rel.parts
        if stat.S_ISDIR(st.st_mode):
            allowed_dir=(len(parts)==1 and parts[0] in {*SLOTS,"direct_appserver_receipts","controller_invalid","path_terminals"}) or (len(parts)==2 and ((parts[0] in SLOTS and parts[1] in {"rendered","captures","scores","artifacts"}) or (parts[0]=="controller_invalid" and parts[1] in SLOTS))) or (len(parts)==3 and parts[0]=="controller_invalid" and parts[1] in SLOTS and parts[2] in cell_set)
            if not allowed_dir: raise Invalid(f"directory outside closed-world run layout: {rel}")
            continue
        if not stat.S_ISREG(st.st_mode): raise Invalid(f"nonregular evidence entry: {path}")
        allowed=False
        if len(parts)==1 and parts[0] in root_names: allowed=True
        elif len(parts)==2 and parts[0]=="direct_appserver_receipts" and any(parts[1]==f"{s}_{c}.json" for s in SLOTS for c in cells): allowed=True
        elif len(parts)==2 and parts[0]=="path_terminals" and parts[1] in {f"{s}.json" for s in SLOTS}: allowed=True
        elif len(parts)==4 and parts[0]=="controller_invalid" and parts[1] in SLOTS and parts[2] in cell_set and re.fullmatch(r"attempt-[0-9]{4}\.json",parts[3]): allowed=True
        elif len(parts)==3 and parts[0] in SLOTS:
            if parts[1] in ("captures","scores") and parts[2].endswith(".json") and parts[2][:-5] in cell_set: allowed=True
            elif parts[1]=="rendered" and parts[2].endswith(".txt") and parts[2][:-4] in cell_set: allowed=True
            elif parts[1]=="artifacts" and parts[2].endswith(".json") and parts[2][:-5] in stage_set: allowed=True
        if not allowed: raise Invalid(f"file outside closed-world run layout: {rel}")


def harness(args: list[str], allowed_rc: tuple[int, ...] = (0,)) -> tuple[bytes, int]:
    run = subprocess.run([sys.executable,"-B",str(HARNESS),*args],cwd=REPO,env={**os.environ,"PYTHONDONTWRITEBYTECODE":"1"},stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False)
    if run.returncode not in allowed_rc: raise Invalid(f"harness {' '.join(args[:1])} rc={run.returncode}: {run.stderr.decode(errors='replace')}")
    return run.stdout, run.returncode


def schedule() -> tuple[str, ...]:
    storage, _ = harness(["list-cells"])
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"): raise Invalid("harness list-cells storage framing invalid")
    value = strict_object(storage[:-1], "harness list-cells")
    cells = value.get("cells")
    if tuple(value)!=("candidate_id","count","cells") or value.get("candidate_id") != CANDIDATE_ID or type(value.get("count")) is not int or value.get("count")!=97 or not isinstance(cells,list) or len(cells)!=value["count"] or any(not isinstance(x,str) or not x for x in cells) or len(cells)!=len(set(cells)): raise Invalid("harness frozen schedule invalid")
    return tuple(cells)


def check_slot_cell(slot: str, cell: str, cells: tuple[str,...]) -> None:
    if slot not in SLOTS or cell not in cells: raise Invalid("slot/cell outside frozen schedule")


def receipt_path(root: Path, slot: str, cell: str) -> Path: return root / "direct_appserver_receipts" / f"{slot}_{cell}.json"
def capture_path(root: Path, slot: str, cell: str) -> Path: return root / slot / "captures" / f"{cell}.json"
def score_path(root: Path, slot: str, cell: str) -> Path: return root / slot / "scores" / f"{cell}.json"
def rendered_path(root: Path, slot: str, cell: str) -> Path: return root / slot / "rendered" / f"{cell}.txt"
def artifact_path(root: Path, slot: str, stage: str) -> Path: return root / slot / "artifacts" / f"{stage}.json"
def path_terminal_path(root: Path, slot: str) -> Path: return root / "path_terminals" / f"{slot}.json"
def invalid_path(root: Path, slot: str, cell: str, ordinal: int) -> Path: return root / "controller_invalid" / slot / cell / f"attempt-{ordinal:04d}.json"


def strict_jsonl(data: bytes, label: str) -> list[dict[str,Any]]:
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data: raise Invalid(f"{label}: JSONL framing invalid")
    lines=data[:-1].split(b"\n")
    if not lines or any(not line for line in lines): raise Invalid(f"{label}: blank JSONL row")
    return [strict_object(line,f"{label} row {index}",canonical=False) for index,line in enumerate(lines,1)]


def independent_rollout_validation(root: Path,slot: str,cell: str,receipt: dict[str,Any]) -> dict[str,Any]:
    raw_path=receipt.get("rollout_path")
    if not isinstance(raw_path,str) or not raw_path: raise Invalid("receipt rollout path missing")
    path=Path(raw_path)
    if not path.is_absolute(): raise Invalid("receipt rollout path must be absolute")
    try: resolved=path.resolve(strict=True)
    except FileNotFoundError as exc: raise Invalid("receipt rollout path does not exist") from exc
    session_root=CODEX_SESSION_ROOT.resolve()
    if resolved!=path or not resolved.is_relative_to(session_root): raise Invalid("receipt rollout path is not exact beneath configured Codex session root")
    storage=regular(resolved,f"{slot} {cell} primary rollout")
    if (receipt.get("rollout_storage_sha256"),receipt.get("rollout_storage_bytes"))!=(sha(storage),len(storage)): raise Invalid("receipt primary rollout storage binding mismatch")
    rows=strict_jsonl(storage,f"{slot} {cell} primary rollout")
    metas=[row["payload"] for row in rows if row.get("type")=="session_meta" and isinstance(row.get("payload"),dict)]
    turns=[row["payload"] for row in rows if row.get("type")=="turn_context" and isinstance(row.get("payload"),dict)]
    starts=[row["payload"] for row in rows if row.get("type")=="event_msg" and row.get("payload",{}).get("type")=="task_started"]
    completes=[row["payload"] for row in rows if row.get("type")=="event_msg" and row.get("payload",{}).get("type")=="task_complete"]
    if not (len(metas)==len(turns)==len(starts)==len(completes)==1): raise Invalid("primary rollout is not one session, one turn, one task start, and one task complete")
    meta,turn,start,complete=metas[0],turns[0],starts[0],completes[0]
    thread_id=receipt.get("thread_id"); turn_id=receipt.get("turn_id")
    if not isinstance(thread_id,str) or not thread_id or not isinstance(turn_id,str) or not turn_id: raise Invalid("receipt task identities missing")
    if (meta.get("id"),meta.get("session_id"))!=(thread_id,thread_id) or not resolved.name.endswith(f"-{thread_id}.jsonl"): raise Invalid("primary rollout session/thread identity mismatch")
    if turn.get("turn_id")!=turn_id or start.get("turn_id")!=turn_id or complete.get("turn_id")!=turn_id: raise Invalid("primary rollout turn/task identity mismatch")
    relevant=[]
    for row in rows:
        payload_value=row.get("payload",{})
        if row.get("type")!="response_item" or payload_value.get("type")!="message" or payload_value.get("role")!="user": continue
        content=payload_value.get("content")
        if isinstance(content,list) and any(isinstance(item,dict) and isinstance(item.get("text"),str) and item["text"].startswith("<codex_delegation>") for item in content): relevant.append(payload_value)
    if len(relevant)!=1: raise Invalid("primary rollout relevant user turn cardinality mismatch")
    model,effort=ROUTES[slot]
    rendered,rc=harness(["render","--execution-root",str(root),"--slot",slot,"--cell",cell])
    if rc!=0 or not rendered.endswith(b"\n") or rendered.endswith(b"\n\n"): raise Invalid("primary rollout independent render failed")
    provider_payload=rendered[:-1]
    try: prompt=provider_payload.decode("utf-8")
    except UnicodeDecodeError as exc: raise Invalid("harness provider payload is not UTF-8") from exc
    wrapper=f"<codex_delegation>\n  <source_thread_id>{WRAPPER_SOURCE_THREAD_ID}</source_thread_id>\n  <input>{prompt}</input>\n</codex_delegation>"
    user=relevant[0]; user_content=user.get("content")
    if user_content!=[{"type":"input_text","text":wrapper}] or user.get("internal_chat_message_metadata_passthrough",{}).get("turn_id")!=turn_id: raise Invalid("primary rollout wrapper/user-turn bytes mismatch")
    if (receipt.get("render_storage_sha256"),receipt.get("render_storage_bytes"))!=(sha(rendered),len(rendered)) or (receipt.get("provider_visible_payload_sha256"),receipt.get("provider_visible_payload_bytes"))!=(sha(provider_payload),len(provider_payload)): raise Invalid("receipt render/provider payload binding mismatch")
    settings=turn.get("collaboration_mode",{}).get("settings",{}) if isinstance(turn.get("collaboration_mode"),dict) else {}
    if meta.get("model_provider")!="openai" or meta.get("cwd")!=str(REPO) or meta.get("thread_source")!="subagent": raise Invalid("primary rollout session provider/context mismatch")
    if turn.get("cwd")!=str(REPO) or turn.get("model")!=model or turn.get("effort")!=effort or settings.get("model")!=model or settings.get("reasoning_effort")!=effort: raise Invalid("primary rollout requested/turn-context route mismatch")
    finals=[row["payload"] for row in rows if row.get("type")=="response_item" and row.get("payload",{}).get("type")=="message" and row["payload"].get("role")=="assistant" and row["payload"].get("phase")=="final_answer"]
    if any(final.get("internal_chat_message_metadata_passthrough",{}).get("turn_id")!=turn_id for final in finals): raise Invalid("primary rollout assistant final turn mismatch")
    prohibited=[row["payload"] for row in rows if row.get("type")=="response_item" and row.get("payload",{}).get("type") in PROHIBITED_ITEM_TYPES]
    final_bytes=dump(finals); prohibited_bytes=dump(prohibited)
    text=None
    if len(finals)==1:
        content=finals[0].get("content")
        if isinstance(content,list) and len(content)==1 and isinstance(content[0],dict) and isinstance(content[0].get("text"),str): text=content[0]["text"]
    text_bytes=None if text is None else text.encode("utf-8")
    observations=[]
    if len(finals)!=1: observations.append("assistant_final_message_count_not_one")
    elif not isinstance(finals[0].get("content"),list): observations.append("assistant_final_content_not_array")
    elif len(finals[0]["content"])!=1: observations.append("assistant_final_content_item_count_not_one")
    elif not isinstance(finals[0]["content"][0],dict) or not isinstance(finals[0]["content"][0].get("text"),str): observations.append("assistant_final_content_item_not_text")
    types=[item.get("type") for item in prohibited]
    normalization=expected_text_normalization(finals,text,types,observations)
    derived={"assistant_final_messages":finals,"assistant_final_messages_sha256":sha(final_bytes),"assistant_final_messages_bytes":len(final_bytes),"single_text_output_utf8":text,"single_text_output_sha256":None if text_bytes is None else sha(text_bytes),"single_text_output_bytes":None if text_bytes is None else len(text_bytes),"text_normalization_receipt":normalization,"prohibited_activity_items":prohibited,"prohibited_activity_items_sha256":sha(prohibited_bytes),"prohibited_activity_items_bytes":len(prohibited_bytes),"prohibited_activity_item_types":types,"conformance_observations":observations}
    if any(receipt.get(key)!=value for key,value in derived.items()): raise Invalid("receipt final/prohibited/normalization evidence differs from primary rollout")
    timing=(complete.get("started_at"),complete.get("completed_at"),complete.get("duration_ms"))
    if any(isinstance(value,bool) or not isinstance(value,(int,float)) for value in timing) or timing[1]<timing[0] or timing[2]<0: raise Invalid("primary rollout task timing invalid")
    if start.get("started_at")!=complete.get("started_at") or (receipt.get("started_at_epoch_seconds"),receipt.get("completed_at_epoch_seconds"),receipt.get("duration_ms"))!=timing: raise Invalid("receipt primary rollout timing mismatch")
    if receipt.get("model_provider")!="openai" or receipt.get("turn_context_model")!=turn.get("model") or receipt.get("turn_context_effort")!=turn.get("effort") or receipt.get("fresh_context") is not True or receipt.get("first_attempt_subject_call") is not True: raise Invalid("receipt primary rollout context/route mismatch")
    wrapper_bytes=wrapper.encode("utf-8")
    return {"schema_id":"pw-r8-independent-rollout-validation-v1","candidate_id":CANDIDATE_ID,"run_id":receipt["run_id"],"slot":slot,"cell":cell,"status":"PASS","rollout_path":raw_path,"rollout_storage_sha256":sha(storage),"rollout_storage_bytes":len(storage),"session_thread_id":thread_id,"turn_id":turn_id,"relevant_user_turn_count":1,"turn_context_count":1,"task_started_count":1,"task_complete_count":1,"wrapper_sha256":sha(wrapper_bytes),"wrapper_bytes":len(wrapper_bytes),"provider_visible_payload_sha256":sha(provider_payload),"provider_visible_payload_bytes":len(provider_payload),"model_provider":"openai","requested_model":model,"requested_thinking":effort,"requested_route_evidence_basis":"turn_context+collaboration_mode.settings","provider_effective_model":None,"provider_effective_thinking":None,"provider_effective_serving_snapshot_exposed":False,"fresh_task_identity_basis":"thread_id","fresh_thread_create_evidence":True,"fresh_thread_create_evidence_basis":"one session_meta and one turn_context for a unique session/thread identity","assistant_final_message_count":len(finals),"assistant_final_messages_sha256":sha(final_bytes),"assistant_final_messages_bytes":len(final_bytes),"prohibited_activity_item_count":len(prohibited),"prohibited_activity_items_sha256":sha(prohibited_bytes),"prohibited_activity_items_bytes":len(prohibited_bytes),"started_at_epoch_seconds":complete.get("started_at"),"completed_at_epoch_seconds":complete.get("completed_at"),"duration_ms":complete.get("duration_ms"),"one_session_one_turn":True,"fresh_context":True,"identity_limitation":"No separate platform task_id, direct thread/create invocation receipt, provider-effective model/thinking, or serving-snapshot attestation is exposed; thread_id is the fresh task identity."}


def completed_receipt(root: Path, slot: str, cell: str) -> tuple[bytes, dict[str, Any],dict[str,Any]]:
    storage, _, value = payload(receipt_path(root,slot,cell), f"{slot} {cell} receipt")
    contract = run_contract(root); model, effort = ROUTES[slot]
    expected_keys=("schema_id","candidate_id","run_id","slot","cell","execution_root","requested_model","requested_thinking","provider_effective_model","provider_effective_thinking","host_id","thread_id","turn_id","fresh_task_identity_basis","status","subject_call_started","fresh_context","first_attempt_subject_call","retry_count","best_of","replacement_result","admission","render_storage_sha256","render_storage_bytes","provider_visible_payload_sha256","provider_visible_payload_bytes","rollout_path","rollout_storage_sha256","rollout_storage_bytes","model_provider","turn_context_model","turn_context_effort","started_at_epoch_seconds","completed_at_epoch_seconds","duration_ms","assistant_final_messages","assistant_final_messages_sha256","assistant_final_messages_bytes","single_text_output_utf8","single_text_output_sha256","single_text_output_bytes","text_normalization_receipt","prohibited_activity_items","prohibited_activity_items_sha256","prohibited_activity_items_bytes","prohibited_activity_item_types","conformance_observations","identity_limitation")
    if tuple(value)!=expected_keys: raise Invalid(f"{slot} {cell} receipt keys/order outside closed world")
    expected = {"schema_id":"pw-r8-direct-appserver-subject-receipt-v3","candidate_id":CANDIDATE_ID,"run_id":contract["run_id"],"slot":slot,"cell":cell,"requested_model":model,"requested_thinking":effort,"status":"completed","subject_call_started":True,"fresh_context":True,"first_attempt_subject_call":True,"retry_count":0,"best_of":False,"replacement_result":False}
    for key,want in expected.items():
        if type(value.get(key)) is not type(want) or value.get(key)!=want: raise Invalid(f"{slot} {cell} receipt field mismatch: {key}")
    if not isinstance(value.get("thread_id"),str) or not value["thread_id"] or not isinstance(value.get("turn_id"),str) or not value["turn_id"]: raise Invalid("receipt thread/turn missing")
    if value.get("fresh_task_identity_basis")!="thread_id": raise Invalid("receipt fresh task identity basis mismatch")
    if value.get("execution_root")!=str(root): raise Invalid("receipt execution_root mismatch")
    if value.get("provider_effective_model") is not None or value.get("provider_effective_thinking") is not None or value.get("host_id")!="remote-ssh-discovered:pm-dev": raise Invalid("receipt provider-effective limitation/host fields mismatch")
    if value.get("model_provider")!="openai" or value.get("turn_context_model")!=model or value.get("turn_context_effort")!=effort: raise Invalid("receipt reopened route identity mismatch")
    if value.get("identity_limitation")!="The fresh Codex task is identified by the newly created thread_id; task_started and task_complete identify its only turn by turn_id. No separate platform task_id or provider-effective serving snapshot is exposed.": raise Invalid("receipt identity limitation disclosure mismatch")
    if not isinstance(value.get("rollout_path"),str) or not value["rollout_path"].startswith("/home/sittingmongoose/.codex/sessions/"): raise Invalid("receipt rollout path outside expected capture authority")
    if not isinstance(value.get("rollout_storage_sha256"),str) or not re.fullmatch(r"[0-9a-f]{64}",value["rollout_storage_sha256"]) or not isinstance(value.get("rollout_storage_bytes"),int) or value["rollout_storage_bytes"]<=0: raise Invalid("receipt rollout storage binding shape invalid")
    if any(not isinstance(value.get(key),(int,float)) for key in ("started_at_epoch_seconds","completed_at_epoch_seconds","duration_ms")): raise Invalid("receipt task timing fields invalid")
    admission=value.get("admission")
    admission_keys=("schema_id","candidate_id","run_id","candidate_freeze_manifest","slot","cell","ordered_index","status","prior_pass_count","preserved_no_start_controller_invalid_count","other_slot_path_terminals_do_not_block","root_terminal_phase_started","retry","best_of","replacement")
    if not isinstance(admission,dict) or tuple(admission)!=admission_keys or admission.get("schema_id")!="pw-r8-cell-admission-v4" or admission.get("candidate_id")!=CANDIDATE_ID or admission.get("run_id")!=contract["run_id"] or admission.get("candidate_freeze_manifest")!=freeze_binding(contract) or admission.get("slot")!=slot or admission.get("cell")!=cell or admission.get("status")!="ADMIT_ONE_FRESH_FIRST_ATTEMPT" or admission.get("other_slot_path_terminals_do_not_block") is not True or admission.get("root_terminal_phase_started") is not False or admission.get("retry") is not False or admission.get("best_of") is not False or admission.get("replacement") is not False: raise Invalid("receipt closed-world admission binding mismatch")
    final_messages=value.get("assistant_final_messages"); prohibited=value.get("prohibited_activity_items")
    if not isinstance(final_messages,list) or not isinstance(prohibited,list): raise Invalid("receipt raw item arrays missing")
    if any(not isinstance(item,dict) for item in prohibited): raise Invalid("receipt prohibited activity items must be objects")
    fb=dump(final_messages); pb=dump(prohibited)
    if (value.get("assistant_final_messages_sha256"),value.get("assistant_final_messages_bytes"))!=(sha(fb),len(fb)): raise Invalid("receipt final-message binding mismatch")
    if (value.get("prohibited_activity_items_sha256"),value.get("prohibited_activity_items_bytes"))!=(sha(pb),len(pb)): raise Invalid("receipt prohibited-item binding mismatch")
    text=value.get("single_text_output_utf8")
    if text is None:
        if value.get("single_text_output_sha256") is not None or value.get("single_text_output_bytes") is not None: raise Invalid("receipt null text binding mismatch")
    elif isinstance(text,str):
        tb=text.encode("utf-8")
        if (value.get("single_text_output_sha256"),value.get("single_text_output_bytes"))!=(sha(tb),len(tb)): raise Invalid("receipt text binding mismatch")
    else: raise Invalid("receipt single text must be string or null")
    types=value.get("prohibited_activity_item_types"); observations=value.get("conformance_observations")
    if not isinstance(types,list) or types!=[x.get("type") for x in prohibited] or any(not isinstance(x,str) or not x for x in types): raise Invalid("receipt prohibited activity type binding mismatch")
    if not isinstance(observations,list) or any(not isinstance(x,str) or not x for x in observations): raise Invalid("receipt conformance observations invalid")
    normalization=value.get("text_normalization_receipt")
    if normalization != expected_text_normalization(final_messages,text,types,observations): raise Invalid("receipt text normalization is not exact raw-evidence derivation")
    binding=independent_rollout_validation(root,slot,cell,value)
    return storage,value,binding


def expected_capture(root: Path, slot: str, cell: str) -> dict[str, Any]:
    receipt_storage,r,_=completed_receipt(root,slot,cell)
    return {
        "schema_id":"pw-r8-subject-capture-envelope-v3","candidate_id":CANDIDATE_ID,"run_id":r["run_id"],"slot":slot,"cell":cell,
        "subject_call_started":True,"subject_call_completed":True,
        "thread_id":r["thread_id"],"turn_id":r["turn_id"],
        "assistant_final_messages":r["assistant_final_messages"],"assistant_final_messages_sha256":r["assistant_final_messages_sha256"],"assistant_final_messages_bytes":r["assistant_final_messages_bytes"],
        "single_text_output_utf8":r["single_text_output_utf8"],"single_text_output_sha256":r["single_text_output_sha256"],"single_text_output_bytes":r["single_text_output_bytes"],
        "text_normalization_receipt":r["text_normalization_receipt"],
        "prohibited_activity_item_types":r["prohibited_activity_item_types"],
        "conformance_observations":r["conformance_observations"],
        "driver_receipt_storage_sha256":sha(receipt_storage),"driver_receipt_storage_bytes":len(receipt_storage),
    }


def capture(root: Path, slot: str, cell: str) -> dict[str, Any]:
    _,raw,value=payload(capture_path(root,slot,cell),f"{slot} {cell} capture")
    expected=expected_capture(root,slot,cell)
    if raw!=dump(expected) or value!=expected: raise Invalid(f"{slot} {cell} capture is not byte-bound to derived receipt")
    return value


def expected_score(root: Path,slot: str,cell: str) -> dict[str,Any]:
    captured=capture(root,slot,cell)
    out,rc=harness(["score","--execution-root",str(root),"--slot",slot,"--cell",cell],(0,1,2))
    if not out.endswith(b"\n") or out.endswith(b"\n\n"): raise Invalid("harness score framing invalid")
    score=strict_object(out[:-1],"harness score")
    if rc==2 or score.get("verdict")=="INVALID": raise Invalid(f"harness/scorer invalid for completed conforming response: {score.get('error')}")
    if score.get("candidate_id")!=CANDIDATE_ID or score.get("slot")!=slot or score.get("cell")!=cell or score.get("verdict") not in ("PASS","FAIL"): raise Invalid("harness score identity/verdict invalid")
    normalization=captured["text_normalization_receipt"]
    expected_normalization_fields=(normalization["assistant_final_message_count"],normalization["status"],sha(dump(normalization)))
    observed_normalization_fields=(score.get("assistant_final_message_count"),score.get("text_normalization_status"),score.get("text_normalization_receipt_sha256"))
    if observed_normalization_fields!=expected_normalization_fields: raise Invalid("harness score normalization binding mismatch")
    if normalization["status"]=="REJECTED_MULTIPLE_FINALS" and score.get("verdict")!="FAIL": raise Invalid("rejected final normalization must remain permanent FAIL")
    return score


def persisted_score(root: Path,slot: str,cell: str) -> dict[str,Any]:
    _,raw,value=payload(score_path(root,slot,cell),f"{slot} {cell} score")
    expected=expected_score(root,slot,cell)
    if raw!=dump(expected) or value!=expected: raise Invalid(f"{slot} {cell} persisted score differs from recomputation")
    return value


def validate_rendered(root: Path,slot: str,cell: str,receipt: dict[str,Any]) -> None:
    path=rendered_path(root,slot,cell)
    if not path.exists(): raise Invalid(f"{slot} {cell} rendered packet missing")
    actual=regular(path,f"{slot} {cell} rendered packet")
    expected,_=harness(["render","--execution-root",str(root),"--slot",slot,"--cell",cell])
    if actual!=expected: raise Invalid(f"{slot} {cell} rendered packet drift")
    payload_bytes=actual[:-1]
    if (receipt.get("render_storage_sha256"),receipt.get("render_storage_bytes"))!=(sha(actual),len(actual)) or (receipt.get("provider_visible_payload_sha256"),receipt.get("provider_visible_payload_bytes"))!=(sha(payload_bytes),len(payload_bytes)): raise Invalid("receipt rendered identity mismatch")


def controller_invalids(root: Path,slot: str,cell: str) -> list[dict[str,Any]]:
    base=root/"controller_invalid"/slot/cell
    if not base.exists(): return []
    paths=sorted(base.glob("attempt-*.json"))
    if [p.name for p in paths] != [f"attempt-{i:04d}.json" for i in range(1,len(paths)+1)]: raise Invalid("controller-invalid ordinals are not contiguous")
    values=[]
    for i,path in enumerate(paths,1):
        _,_,v=payload(path,f"controller invalid {slot} {cell} {i}")
        base_keys=("schema_id","candidate_id","run_id","slot","cell","execution_root","requested_model","requested_thinking","status","phase","subject_call_started","thread_id","turn_id","fresh_task_identity_basis","admission")
        render_keys=("render_storage_sha256","render_storage_bytes","provider_visible_payload_sha256","provider_visible_payload_bytes")
        tail_keys=("error_type","error","empirical_credit","driver_authorizes_recreation")
        if tuple(v) not in (base_keys+tail_keys,base_keys+render_keys+tail_keys): raise Invalid("controller-invalid receipt keys/order outside closed world")
        model,effort=ROUTES[slot]
        if v.get("schema_id")!="pw-r8-direct-appserver-controller-invalid-v2" or v.get("candidate_id")!=CANDIDATE_ID or v.get("run_id")!=run_contract(root)["run_id"] or v.get("slot")!=slot or v.get("cell")!=cell or v.get("execution_root")!=str(root) or v.get("requested_model")!=model or v.get("requested_thinking")!=effort or v.get("fresh_task_identity_basis")!="thread_id" or v.get("status")!="controller_invalid" or v.get("empirical_credit") is not False or v.get("driver_authorizes_recreation") is not False: raise Invalid("controller-invalid receipt identity mismatch")
        started=v.get("subject_call_started")
        if started is not False and started is not True and started is not None: raise Invalid("controller-invalid subject_call_started must be true, false, or null")
        if not isinstance(v.get("phase"),str) or not v["phase"] or not isinstance(v.get("error_type"),str) or not v["error_type"] or not isinstance(v.get("error"),str) or not v["error"]: raise Invalid("controller-invalid phase/error fields invalid")
        if v.get("admission") is not None and not isinstance(v.get("admission"),dict): raise Invalid("controller-invalid admission must be object or null")
        for key in ("thread_id","turn_id"):
            identity=v.get(key)
            if identity is not None and (not isinstance(identity,str) or not identity): raise Invalid(f"controller-invalid {key} invalid")
        values.append(v)
    return values


def validate_no_start_invalids(root: Path,slot: str,cell: str,values: list[dict[str,Any]]) -> None:
    if not values: return
    if any(v.get("subject_call_started") is not False for v in values): raise Invalid("controller-invalid attempt lacks positive no-start proof")
    current,_=harness(["render","--execution-root",str(root),"--slot",slot,"--cell",cell])
    if not current.endswith(b"\n") or current.endswith(b"\n\n"): raise Invalid("current renderer framing invalid")
    wanted=(sha(current),len(current),sha(current[:-1]),len(current)-1)
    for value in values:
        observed=(value.get("render_storage_sha256"),value.get("render_storage_bytes"),value.get("provider_visible_payload_sha256"),value.get("provider_visible_payload_bytes"))
        if observed!=wanted: raise Invalid("no-start controller-invalid receipt lacks byte-identical frozen input proof")


def required_stages_before(cell: str) -> tuple[str,...]:
    if cell.startswith("S30_A"): return ("S10A","S20A")
    if cell.startswith("S30_B"): return ("S10B","S20B")
    if cell=="S50_SEMANTIC": return ("S45A","S45B")
    if cell.startswith("S60_"): return ("S50","S55")
    return ()


def validate_artifact(root: Path,slot: str,stage: str) -> dict[str,Any]:
    if stage not in STAGES: raise Invalid("stage outside frozen stage set")
    storage,raw,value=payload(artifact_path(root,slot,stage),f"{slot} {stage} artifact")
    expected,_=harness(["reduce","--execution-root",str(root),"--slot",slot,"--stage",stage])
    if not expected.endswith(b"\n") or expected.endswith(b"\n\n"): raise Invalid("harness reduce framing invalid")
    if storage!=expected: raise Invalid(f"{slot} {stage} artifact differs from deterministic reducer")
    return {"schema_id":"pw-r8-artifact-validation-v3","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"slot":slot,"stage":stage,"status":"PASS","artifact_payload_sha256":sha(raw),"artifact_payload_bytes":len(raw),"terminal":value.get("terminal")}


def root_terminal_files_present(root: Path) -> bool:
    root_files=("matrix_terminal.json","subject_call_accounting.json","artifact_manifest.json","validation_report.json")
    return any((root/name).exists() for name in root_files)


def admit(root: Path,slot: str,cell: str) -> dict[str,Any]:
    cells=schedule(); check_slot_cell(slot,cell,cells); index=cells.index(cell)
    ordered_schedule(root,cells)
    if root_terminal_files_present(root): raise Invalid("run already has root terminal artifacts; downstream dispatch prohibited")
    if path_terminal_path(root,slot).exists(): raise Invalid("slot already has a persisted path terminal; same-slot dispatch prohibited")
    if receipt_path(root,slot,cell).exists() or capture_path(root,slot,cell).exists() or score_path(root,slot,cell).exists(): raise Invalid("target cell already has empirical evidence")
    for later in cells[index+1:]:
        if any(p.exists() for p in (receipt_path(root,slot,later),capture_path(root,slot,later),score_path(root,slot,later))) or controller_invalids(root,slot,later): raise Invalid("downstream evidence exists before target")
    for prior in cells[:index]:
        if persisted_score(root,slot,prior).get("verdict")!="PASS": raise Invalid(f"prior cell {prior} is not PASS; downstream dispatch prohibited")
    invalids=controller_invalids(root,slot,cell); validate_no_start_invalids(root,slot,cell,invalids)
    for stage in required_stages_before(cell): validate_artifact(root,slot,stage)
    return {"schema_id":"pw-r8-cell-admission-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"slot":slot,"cell":cell,"ordered_index":index,"status":"ADMIT_ONE_FRESH_FIRST_ATTEMPT","prior_pass_count":index,"preserved_no_start_controller_invalid_count":len(invalids),"other_slot_path_terminals_do_not_block":True,"root_terminal_phase_started":False,"retry":False,"best_of":False,"replacement":False}


def validate_cell(root: Path,slot: str,cell: str) -> dict[str,Any]:
    cells=schedule(); check_slot_cell(slot,cell,cells)
    _,r,binding=completed_receipt(root,slot,cell); validate_rendered(root,slot,cell,r); c=capture(root,slot,cell); score=expected_score(root,slot,cell)
    persisted=None
    if score_path(root,slot,cell).exists(): persisted=persisted_score(root,slot,cell)
    return {"schema_id":"pw-r8-cell-validation-v4","candidate_id":CANDIDATE_ID,"run_id":r["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"slot":slot,"cell":cell,"status":"PASS","subject_result_verdict":score["verdict"],"independent_rollout_validation":binding,"capture_payload_sha256":sha(dump(c)),"capture_payload_bytes":len(dump(c)),"score":score,"score_persisted_and_reopened":persisted is not None,"score_path":str(score_path(root,slot,cell).relative_to(root))}


def ensure_identity_uniqueness(rows: list[tuple[str|None,str|None]], label: str) -> tuple[int,int]:
    threads=[x[0] for x in rows if isinstance(x[0],str) and x[0]]
    turns=[x[1] for x in rows if isinstance(x[1],str) and x[1]]
    if len(threads)!=len(set(threads)): raise Invalid(f"thread identity reused {label}")
    if len(turns)!=len(set(turns)): raise Invalid(f"turn identity reused {label}")
    return len(set(threads)),len(set(turns))


def rollout_binding_aggregate(bindings: list[dict[str,Any]]) -> dict[str,Any]:
    if any(binding.get("schema_id")!="pw-r8-independent-rollout-validation-v1" or binding.get("status")!="PASS" or binding.get("fresh_thread_create_evidence") is not True for binding in bindings): raise Invalid("independent rollout validation binding status/fresh-thread evidence invalid")
    data=dump(bindings)
    return {"primary_rollout_validation_count":len(bindings),"fresh_thread_create_evidence_count":len(bindings),"primary_rollout_validation_aggregate_sha256":sha(data),"primary_rollout_validation_aggregate_bytes":len(data)}


def all_invalid_rows(root: Path,cells: tuple[str,...],slot: str|None=None) -> list[tuple[str,int,dict[str,Any]]]:
    rows=[]
    for current_slot in ((slot,) if slot is not None else SLOTS):
        for cell in cells:
            for ordinal,value in enumerate(controller_invalids(root,current_slot,cell),1): rows.append((cell,ordinal,value))
    return rows


def base_path_terminal(root: Path,slot: str,cells: tuple[str,...],scores: list[dict[str,Any]],identities: list[tuple[str|None,str|None]],bindings: list[dict[str,Any]],terminal: str,failed_cell: str|None,ineligible_count: int) -> dict[str,Any]:
    unique_threads,unique_turns=ensure_identity_uniqueness(identities,"within path")
    if len(bindings)!=len(scores): raise Invalid("path primary rollout validation accounting mismatch")
    return {"schema_id":"pw-r8-path-terminal-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"slot":slot,"terminal_publication_authority":"root_controller_only","terminal_publication_phase":"AFTER_ALL_PATH_WORKERS_STOPPED","terminal":terminal,"qualification_clean_path_credit":1 if terminal=="COMPLETE_PASS" else 0,"expected_subject_cells":len(cells),"subject_call_attempt_count":len(scores),"started_subject_calls":len(scores),"completed_subject_calls":len(scores),"pass_count":sum(s["verdict"]=="PASS" for s in scores),"fail_count":sum(s["verdict"]=="FAIL" for s in scores),**normalization_counts(scores),"invalid_count":0,"invalid_cell_count":0,"no_start_invalid_attempt_count":0,"after_start_invalid_attempt_count":0,"unknown_start_invalid_attempt_count":0,"missing_count":0,"ineligible_count":ineligible_count,"first_failed_cell":failed_cell,"first_invalid_cell":None,"retry_count":0,"best_of_count":0,"replacement_count":0,**rollout_binding_aggregate(bindings),"fresh_task_identity_basis":"thread_id","unique_task_identity_count":unique_threads,"unique_thread_count":unique_threads,"unique_turn_count":unique_turns}


def path_terminal(root: Path,slot: str) -> dict[str,Any]:
    cells=schedule(); scores=[]; bindings=[]; first_failure=None; identities: list[tuple[str|None,str|None]]=[]
    invalid_rows=all_invalid_rows(root,cells,slot)
    invalid_by_cell={cell:controller_invalids(root,slot,cell) for cell in cells}
    for _,_,value in invalid_rows: identities.append((value.get("thread_id"),value.get("turn_id")))
    blocking_invalid_indexes=[cells.index(cell) for cell,_,value in invalid_rows if value.get("subject_call_started") is not False]
    if blocking_invalid_indexes:
        blocking_index=min(blocking_invalid_indexes)
        for cell in cells[blocking_index:]:
            if any(p.exists() for p in (receipt_path(root,slot,cell),capture_path(root,slot,cell),score_path(root,slot,cell))): raise Invalid("empirical evidence exists at/after started-or-unknown controller-invalid cell")
        if any(cells.index(cell)>blocking_index for cell,_,_ in invalid_rows): raise Invalid("controller-invalid attempt exists downstream of started-or-unknown invalid cell")
    stopped_index: int|None=None
    for i,cell in enumerate(cells):
        evidence=(receipt_path(root,slot,cell),capture_path(root,slot,cell),score_path(root,slot,cell))
        present=[p.exists() for p in evidence]
        if any(present) and not all(present): raise Invalid(f"partial empirical evidence at {cell}")
        if not any(present):
            if first_failure is not None:
                if invalid_by_cell[cell]: raise Invalid(f"controller-invalid evidence exists after subject failure: {cell}")
                continue
            if invalid_by_cell[cell]:
                stopped_index=i
                if any(any(p.exists() for p in (receipt_path(root,slot,later),capture_path(root,slot,later),score_path(root,slot,later))) or invalid_by_cell[later] for later in cells[i+1:]): raise Invalid("downstream evidence exists after uncompleted controller-invalid cell")
                break
            raise Invalid(f"path incomplete at {cell}")
        if first_failure is not None: raise Invalid(f"downstream evidence exists after failure: {cell}")
        score=persisted_score(root,slot,cell); _,r,binding=completed_receipt(root,slot,cell); validate_rendered(root,slot,cell,r); scores.append(score); bindings.append(binding); identities.append((r["thread_id"],r["turn_id"]))
        if score["verdict"]!="PASS": first_failure=(cell,i,score["verdict"])
    if invalid_rows:
        first_invalid_cell=min(invalid_rows,key=lambda x:cells.index(x[0]))[0]
        states=[value.get("subject_call_started") for _,_,value in invalid_rows]
        terminal="CONTROLLER_INVALID_NO_START" if all(x is False for x in states) else "CONTROLLER_INVALID_AFTER_START_OR_UNKNOWN"
        no_start=sum(x is False for x in states); after_start=sum(x is True for x in states); unknown=sum(x is None for x in states)
        unique_threads,unique_turns=ensure_identity_uniqueness(identities,"within path")
        known_started=len(scores)+after_start
        ineligible=len(cells)-len(scores) if first_failure is not None else (0 if stopped_index is None else len(cells)-stopped_index-1)
        if len(bindings)!=len(scores): raise Invalid("invalid path primary rollout validation accounting mismatch")
        return {"schema_id":"pw-r8-path-terminal-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"slot":slot,"terminal_publication_authority":"root_controller_only","terminal_publication_phase":"AFTER_ALL_PATH_WORKERS_STOPPED","terminal":terminal,"qualification_clean_path_credit":0,"expected_subject_cells":len(cells),"subject_call_attempt_count":len(scores)+len(invalid_rows),"started_subject_calls":known_started,"completed_subject_calls":len(scores),"pass_count":sum(s["verdict"]=="PASS" for s in scores),"fail_count":sum(s["verdict"]=="FAIL" for s in scores),**normalization_counts(scores),"invalid_count":len(invalid_rows),"invalid_cell_count":len({cell for cell,_,_ in invalid_rows}),"no_start_invalid_attempt_count":no_start,"after_start_invalid_attempt_count":after_start,"unknown_start_invalid_attempt_count":unknown,"missing_count":0,"ineligible_count":ineligible,"first_failed_cell":None if first_failure is None else first_failure[0],"first_invalid_cell":first_invalid_cell,"retry_count":0,"best_of_count":0,"replacement_count":0,**rollout_binding_aggregate(bindings),"fresh_task_identity_basis":"thread_id","unique_task_identity_count":unique_threads,"unique_thread_count":unique_threads,"unique_turn_count":unique_turns}
    if first_failure:
        return base_path_terminal(root,slot,cells,scores,identities,bindings,"FIRST_ATTEMPT_FAIL",first_failure[0],len(cells)-len(scores))
    if stopped_index is not None:
        return base_path_terminal(root,slot,cells,scores,identities,bindings,"INELIGIBLE_AFTER_MATRIX_CONTROLLER_INVALID",None,len(cells)-stopped_index)
    if len(scores)!=len(cells): raise Invalid("clean path missing score")
    s90=validate_artifact(root,slot,"S90")
    if s90.get("terminal")!="bounded_causal_simulation_pass": raise Invalid("S90 terminal mismatch")
    return base_path_terminal(root,slot,cells,scores,identities,bindings,"COMPLETE_PASS",None,0)


def root_path_terminal(root: Path,slot: str) -> dict[str,Any]:
    """Enter root finalization only after every independent path has stopped."""
    paths={current_slot:path_terminal(root,current_slot) for current_slot in SLOTS}
    return paths[slot]


def matrix_terminal(root: Path) -> dict[str,Any]:
    cells=schedule(); paths={slot:path_terminal(root,slot) for slot in SLOTS}
    for slot,want in paths.items():
        _,raw,stored=payload(path_terminal_path(root,slot),f"{slot} path terminal")
        if raw!=dump(want) or stored!=want: raise Invalid(f"{slot} persisted path terminal mismatch")
    identities=[]; bindings=[]; calls=0
    for slot in SLOTS:
        for cell in cells:
            if receipt_path(root,slot,cell).exists():
                _,r,binding=completed_receipt(root,slot,cell); identities.append((r["thread_id"],r["turn_id"])); bindings.append(binding); calls+=1
            for value in controller_invalids(root,slot,cell): identities.append((value.get("thread_id"),value.get("turn_id")))
    unique_threads,unique_turns=ensure_identity_uniqueness(identities,"across matrix")
    invalid_count=sum(x["invalid_count"] for x in paths.values()); fail_count=sum(x["fail_count"] for x in paths.values())
    all_pass=all(x["terminal"]=="COMPLETE_PASS" for x in paths.values()) and invalid_count==0
    if all_pass: terminal="COMPLETE_CLEAN_MATRIX_PASS"
    elif invalid_count and fail_count: terminal="CONTROLLER_INVALID_MATRIX_WITH_SUBJECT_FAILURES"
    elif invalid_count: terminal="CONTROLLER_INVALID_MATRIX"
    else: terminal="VALID_COMPLETED_MATRIX_WITH_FIRST_ATTEMPT_FAILURES"
    normalization_total=sum(x["normalization_not_applied_call_count"]+x["normalization_applied_call_count"]+x["normalization_rejected_call_count"] for x in paths.values())
    if normalization_total!=calls: raise Invalid("matrix normalization accounting does not cover every completed call exactly once")
    if len(bindings)!=calls: raise Invalid("matrix primary rollout validation accounting mismatch")
    return {"schema_id":"pw-r8-matrix-terminal-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"terminal_publication_authority":"root_controller_only","terminal_publication_phase":"AFTER_ALL_PATH_WORKERS_STOPPED","terminal":terminal,"qualification_clean_run_credit":1 if all_pass else 0,"paths":paths,"expected_clean_subject_calls":len(cells)*len(SLOTS),"subject_call_attempt_count":sum(x["subject_call_attempt_count"] for x in paths.values()),"started_subject_calls":sum(x["started_subject_calls"] for x in paths.values()),"completed_subject_calls":calls,"pass_count":sum(x["pass_count"] for x in paths.values()),"fail_count":fail_count,"normalization_not_applied_call_count":sum(x["normalization_not_applied_call_count"] for x in paths.values()),"normalization_applied_call_count":sum(x["normalization_applied_call_count"] for x in paths.values()),"normalization_rejected_call_count":sum(x["normalization_rejected_call_count"] for x in paths.values()),"invalid_count":invalid_count,"invalid_cell_count":sum(x["invalid_cell_count"] for x in paths.values()),"no_start_invalid_attempt_count":sum(x["no_start_invalid_attempt_count"] for x in paths.values()),"after_start_invalid_attempt_count":sum(x["after_start_invalid_attempt_count"] for x in paths.values()),"unknown_start_invalid_attempt_count":sum(x["unknown_start_invalid_attempt_count"] for x in paths.values()),"missing_count":sum(x["missing_count"] for x in paths.values()),"ineligible_count":sum(x["ineligible_count"] for x in paths.values()),"retry_count":0,"best_of_count":0,"replacement_count":0,**rollout_binding_aggregate(bindings),"fresh_task_identity_basis":"thread_id","global_unique_task_identity_count":unique_threads,"global_unique_thread_count":unique_threads,"global_unique_turn_count":unique_turns,"global_thread_turn_disjointness":"PASS"}


def call_accounting(root: Path) -> dict[str,Any]:
    matrix=matrix_terminal(root)
    keys=("expected_clean_subject_calls","subject_call_attempt_count","started_subject_calls","completed_subject_calls","pass_count","fail_count","normalization_not_applied_call_count","normalization_applied_call_count","normalization_rejected_call_count","invalid_count","invalid_cell_count","no_start_invalid_attempt_count","after_start_invalid_attempt_count","unknown_start_invalid_attempt_count","missing_count","ineligible_count","retry_count","best_of_count","replacement_count","primary_rollout_validation_count","fresh_thread_create_evidence_count","primary_rollout_validation_aggregate_sha256","primary_rollout_validation_aggregate_bytes","fresh_task_identity_basis","global_unique_task_identity_count","global_unique_thread_count","global_unique_turn_count")
    return {"schema_id":"pw-r8-call-accounting-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"matrix_terminal":matrix["terminal"],**{key:matrix[key] for key in keys},"global_thread_turn_disjointness":matrix["global_thread_turn_disjointness"]}


def terminal_core(root: Path) -> tuple[tuple[bytes,bytes,dict[str,Any]],tuple[bytes,bytes,dict[str,Any]]]:
    want_matrix=matrix_terminal(root); matrix_storage,matrix_raw,stored_matrix=payload(root/"matrix_terminal.json","matrix terminal")
    if matrix_raw!=dump(want_matrix) or stored_matrix!=want_matrix: raise Invalid("persisted matrix terminal differs from recomputation")
    want_accounting=call_accounting(root); accounting_storage,accounting_raw,stored_accounting=payload(root/"subject_call_accounting.json","subject call accounting")
    if accounting_raw!=dump(want_accounting) or stored_accounting!=want_accounting: raise Invalid("persisted subject call accounting differs from recomputation")
    return (matrix_storage,matrix_raw,stored_matrix),(accounting_storage,accounting_raw,stored_accounting)


def file_binding(storage: bytes,raw: bytes) -> dict[str,Any]:
    return {"payload_sha256":sha(raw),"payload_bytes":len(raw),"storage_sha256":sha(storage),"storage_bytes":len(storage)}


def artifact_inventory(root: Path) -> list[dict[str,Any]]:
    rows=[]
    for path in sorted(root.rglob("*"),key=lambda x:x.relative_to(root).as_posix()):
        rel=path.relative_to(root).as_posix()
        st=os.lstat(path)
        if stat.S_ISDIR(st.st_mode): continue
        if not stat.S_ISREG(st.st_mode): raise Invalid(f"nonregular evidence entry: {rel}")
        if rel in FINAL_EXCLUSIONS: continue
        storage=regular(path,f"manifest inventory {rel}")
        rows.append({"path":rel,"storage_sha256":sha(storage),"storage_bytes":len(storage)})
    return rows


def expected_artifact_manifest(root: Path) -> dict[str,Any]:
    (_,_,matrix),_=terminal_core(root); rows=artifact_inventory(root)
    return {"schema_id":"pw-r8-artifact-manifest-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"status":"CLOSED_WORLD_FINAL_RUN_INVENTORY","generation_order":["root finalization after every path worker stops","path_terminals/<slot>.json","matrix_terminal.json","subject_call_accounting.json","artifact_manifest.json","validation_report.json","reopen-matrix-terminal"],"excluded_self_referential_paths":list(FINAL_EXCLUSIONS),"artifact_count":len(rows),"artifacts":rows,"terminal":matrix["terminal"],"qualification_clean_run_credit":matrix["qualification_clean_run_credit"]}


def stored_artifact_manifest(root: Path) -> tuple[bytes,bytes,dict[str,Any]]:
    storage,raw,stored=payload(root/"artifact_manifest.json","artifact manifest")
    expected=expected_artifact_manifest(root)
    if raw!=dump(expected) or stored!=expected: raise Invalid("persisted artifact manifest differs from closed-world recomputation")
    return storage,raw,stored


def expected_validation_report(root: Path) -> dict[str,Any]:
    matrix_row,accounting_row=terminal_core(root); manifest_storage,manifest_raw,manifest=stored_artifact_manifest(root)
    matrix_storage,matrix_raw,matrix=matrix_row; accounting_storage,accounting_raw,accounting=accounting_row
    count_keys=("expected_clean_subject_calls","subject_call_attempt_count","started_subject_calls","completed_subject_calls","pass_count","fail_count","normalization_not_applied_call_count","normalization_applied_call_count","normalization_rejected_call_count","invalid_count","invalid_cell_count","no_start_invalid_attempt_count","after_start_invalid_attempt_count","unknown_start_invalid_attempt_count","missing_count","ineligible_count","retry_count","best_of_count","replacement_count","primary_rollout_validation_count","fresh_thread_create_evidence_count","primary_rollout_validation_aggregate_sha256","primary_rollout_validation_aggregate_bytes","fresh_task_identity_basis","global_unique_task_identity_count","global_unique_thread_count","global_unique_turn_count")
    return {"schema_id":"pw-r8-run-validation-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"status":"PASS","generation_order":["root finalization after every path worker stops","path_terminals/<slot>.json","matrix_terminal.json","subject_call_accounting.json","artifact_manifest.json","validation_report.json","reopen-matrix-terminal"],"terminal":matrix["terminal"],"qualification_clean_run_credit":matrix["qualification_clean_run_credit"],"closed_world_artifact_count":manifest["artifact_count"],"matrix_terminal":file_binding(matrix_storage,matrix_raw),"subject_call_accounting":file_binding(accounting_storage,accounting_raw),"artifact_manifest":file_binding(manifest_storage,manifest_raw),"counts":{key:accounting[key] for key in count_keys}}


def stored_validation_report(root: Path) -> tuple[bytes,bytes,dict[str,Any]]:
    storage,raw,stored=payload(root/"validation_report.json","validation report")
    expected=expected_validation_report(root)
    if raw!=dump(expected) or stored!=expected: raise Invalid("persisted validation report differs from recomputation")
    return storage,raw,stored


def reopen_terminal(root: Path) -> dict[str,Any]:
    matrix_row,accounting_row=terminal_core(root); manifest_row=stored_artifact_manifest(root); validation_row=stored_validation_report(root)
    matrix_storage,matrix_raw,matrix=matrix_row; accounting_storage,accounting_raw,_=accounting_row; manifest_storage,manifest_raw,_=manifest_row; validation_storage,validation_raw,_=validation_row
    return {"schema_id":"pw-r8-matrix-reopen-validation-v4","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"status":"PASS","terminal":matrix["terminal"],"qualification_clean_run_credit":matrix["qualification_clean_run_credit"],"matrix_terminal":file_binding(matrix_storage,matrix_raw),"subject_call_accounting":file_binding(accounting_storage,accounting_raw),"artifact_manifest":file_binding(manifest_storage,manifest_raw),"validation_report":file_binding(validation_storage,validation_raw)}


def qualify_two_runs(first: Path,second: Path) -> dict[str,Any]:
    cells=schedule(); validate_layout(first,cells); validate_layout(second,cells)
    first_contract=run_contract(first); second_contract=run_contract(second)
    ordered_schedule(first,cells); ordered_schedule(second,cells)
    if first_contract["run_id"]==second_contract["run_id"]: raise Invalid("qualification run IDs must differ")
    if first_contract["qualification_sequence"]!=1 or second_contract["qualification_sequence"]!=2 or second_contract["predecessor_run_id"]!=first_contract["run_id"]: raise Invalid("qualification run sequence is not consecutive 1 then 2")
    freeze_one=freeze_binding(first_contract); freeze_two=freeze_binding(second_contract)
    if freeze_two!=freeze_one: raise Invalid("candidate freeze identity differs across runs")
    expected_per_matrix=len(SLOTS)*len(cells); expected=2*expected_per_matrix
    if len(cells)!=97 or expected_per_matrix!=291 or expected!=582: raise Invalid("frozen qualification denominator mismatch")
    exact_clean_counts={
        "expected_clean_subject_calls":expected_per_matrix,
        "subject_call_attempt_count":expected_per_matrix,
        "started_subject_calls":expected_per_matrix,
        "completed_subject_calls":expected_per_matrix,
        "pass_count":expected_per_matrix,
        "fail_count":0,
        "invalid_count":0,
        "invalid_cell_count":0,
        "no_start_invalid_attempt_count":0,
        "after_start_invalid_attempt_count":0,
        "unknown_start_invalid_attempt_count":0,
        "missing_count":0,
        "ineligible_count":0,
        "retry_count":0,
        "best_of_count":0,
        "replacement_count":0,
        "primary_rollout_validation_count":expected_per_matrix,
        "fresh_thread_create_evidence_count":expected_per_matrix,
        "global_unique_task_identity_count":expected_per_matrix,
        "global_unique_thread_count":expected_per_matrix,
        "global_unique_turn_count":expected_per_matrix,
    }
    terminals=[]; threads=[]; turns=[]; bindings=[]
    for root in (first,second):
        reopened=reopen_terminal(root)
        _,_,stored=payload(root/"matrix_terminal.json",f"{root.name} matrix terminal")
        _,_,accounting=payload(root/"subject_call_accounting.json",f"{root.name} subject call accounting")
        if reopened["terminal"]!="COMPLETE_CLEAN_MATRIX_PASS" or reopened["qualification_clean_run_credit"]!=1 or stored.get("terminal")!="COMPLETE_CLEAN_MATRIX_PASS" or stored.get("qualification_clean_run_credit")!=1: raise Invalid("both runs require final-reopened complete clean matrices")
        for key,want in exact_clean_counts.items():
            if accounting.get(key)!=want or stored.get(key)!=want: raise Invalid(f"clean qualification accounting mismatch: {key}")
        for value in (accounting,stored):
            if not isinstance(value.get("primary_rollout_validation_aggregate_sha256"),str) or not re.fullmatch(r"[0-9a-f]{64}",value["primary_rollout_validation_aggregate_sha256"]) or type(value.get("primary_rollout_validation_aggregate_bytes")) is not int or value["primary_rollout_validation_aggregate_bytes"]<=0: raise Invalid("clean qualification primary-rollout aggregate binding invalid")
        if accounting.get("fresh_task_identity_basis")!="thread_id" or stored.get("fresh_task_identity_basis")!="thread_id": raise Invalid("fresh task identity basis mismatch")
        normalization_total=sum(accounting.get(key,-1) for key in ("normalization_not_applied_call_count","normalization_applied_call_count","normalization_rejected_call_count"))
        if normalization_total!=expected_per_matrix or accounting.get("normalization_rejected_call_count")!=0: raise Invalid("clean qualification normalization accounting mismatch")
        for slot,path in stored.get("paths",{}).items():
            if slot not in SLOTS or path.get("terminal")!="COMPLETE_PASS" or path.get("expected_subject_cells")!=len(cells) or path.get("completed_subject_calls")!=len(cells) or path.get("pass_count")!=len(cells) or path.get("primary_rollout_validation_count")!=len(cells) or path.get("fresh_thread_create_evidence_count")!=len(cells) or path.get("unique_task_identity_count")!=len(cells) or path.get("unique_thread_count")!=len(cells) or path.get("unique_turn_count")!=len(cells) or path.get("fresh_task_identity_basis")!="thread_id": raise Invalid("clean qualification path accounting mismatch")
        if set(stored.get("paths",{}))!=set(SLOTS): raise Invalid("clean qualification path set mismatch")
        terminals.append(stored)
        for slot in SLOTS:
            for cell in cells:
                _,receipt,binding=completed_receipt(root,slot,cell)
                if receipt["fresh_task_identity_basis"]!="thread_id" or binding.get("fresh_thread_create_evidence") is not True: raise Invalid("completed call fresh task/thread evidence mismatch")
                threads.append(receipt["thread_id"]); turns.append(receipt["turn_id"]); bindings.append(binding)
                if controller_invalids(root,slot,cell): raise Invalid("clean qualification runs may not contain controller-invalid attempts")
    if len(threads)!=expected or len(set(threads))!=expected or len(turns)!=expected or len(set(turns))!=expected or len(bindings)!=expected: raise Invalid("cross-run subject call, rollout, or global identity accounting mismatch")
    final_freeze=validate_freeze_manifest(freeze_one["path"],freeze_one["storage_sha256"],freeze_one["storage_bytes"])
    if freeze_binding(first_contract)!={"path":final_freeze["manifest_path"],"storage_sha256":final_freeze["manifest_storage_sha256"],"storage_bytes":final_freeze["manifest_storage_bytes"]}: raise Invalid("candidate freeze identity changed during qualification")
    return {"schema_id":"pw-r8-two-run-qualification-verification-v4","candidate_id":CANDIDATE_ID,"status":"QUALIFIED_TWO_CONSECUTIVE_CLEAN_MATRICES","candidate_freeze_manifest":freeze_one,"byte_identical_candidate_across_runs":True,"run_ids":[first_contract["run_id"],second_contract["run_id"]],"qualification_sequences":[1,2],"matrix_terminals":[x["terminal"] for x in terminals],"complete_clean_matrices":2,"final_reopened_runs":2,"routes_per_matrix":len(SLOTS),"subject_cells_per_route":len(cells),"expected_subject_calls":expected,"subject_call_attempt_count":expected,"started_subject_calls":expected,"completed_subject_calls":expected,"pass_count":expected,"fail_count":0,"normalization_not_applied_call_count":sum(x["normalization_not_applied_call_count"] for x in terminals),"normalization_applied_call_count":sum(x["normalization_applied_call_count"] for x in terminals),"normalization_rejected_call_count":0,"invalid_count":0,"invalid_cell_count":0,"missing_count":0,"ineligible_count":0,"retry_count":0,"best_of_count":0,"replacement_count":0,**rollout_binding_aggregate(bindings),"fresh_task_identity_basis":"thread_id","global_unique_task_identity_count":len(set(threads)),"global_unique_thread_count":len(set(threads)),"global_unique_turn_count":len(set(turns)),"cross_run_thread_turn_disjointness":"PASS"}


def parser() -> argparse.ArgumentParser:
    p=argparse.ArgumentParser(); p.add_argument("--execution-root"); sub=p.add_subparsers(dest="command",required=True)
    q=sub.add_parser("validate-freeze"); q.add_argument("--manifest",required=True)
    for name in ("emit-capture","admit","validate-cell"):
        q=sub.add_parser(name); q.add_argument("--slot",choices=SLOTS,required=True); q.add_argument("--cell",required=True)
    q=sub.add_parser("validate-artifact"); q.add_argument("--slot",choices=SLOTS,required=True); q.add_argument("--stage",choices=STAGES,required=True)
    q=sub.add_parser("validate-controller-invalid"); q.add_argument("--slot",choices=SLOTS,required=True); q.add_argument("--cell",required=True); q.add_argument("--ordinal",type=int,required=True)
    q=sub.add_parser("path-terminal"); q.add_argument("--slot",choices=SLOTS,required=True)
    sub.add_parser("matrix-terminal"); sub.add_parser("call-accounting"); sub.add_parser("artifact-manifest"); sub.add_parser("validation-report"); sub.add_parser("reopen-matrix-terminal")
    q=sub.add_parser("qualify-two-runs"); q.add_argument("--second-execution-root",required=True)
    return p


def main() -> int:
    args=parser().parse_args()
    try:
        if args.command=="validate-freeze":
            out=validate_freeze_manifest(args.manifest)
            sys.stdout.buffer.write(dump(out)+b"\n"); return 0
        if not isinstance(args.execution_root,str) or not args.execution_root: raise Invalid("--execution-root is required for this command")
        root=root_path(args.execution_root); run_contract(root); cells=schedule(); validate_layout(root,cells)
        if hasattr(args,"cell"): check_slot_cell(args.slot,args.cell,cells)
        if args.command=="emit-capture": out=expected_capture(root,args.slot,args.cell)
        elif args.command=="admit": out=admit(root,args.slot,args.cell)
        elif args.command=="validate-cell": out=validate_cell(root,args.slot,args.cell)
        elif args.command=="validate-artifact": out=validate_artifact(root,args.slot,args.stage)
        elif args.command=="validate-controller-invalid":
            values=controller_invalids(root,args.slot,args.cell)
            if args.ordinal<1 or args.ordinal>len(values): raise Invalid("controller-invalid ordinal absent")
            selected=values[args.ordinal-1]; recreation_eligible=False
            if all(value.get("subject_call_started") is False for value in values):
                validate_no_start_invalids(root,args.slot,args.cell,values); recreation_eligible=True
            out={"schema_id":"pw-r8-controller-invalid-validation-v3","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"candidate_freeze_manifest":freeze_binding(run_contract(root)),"slot":args.slot,"cell":args.cell,"ordinal":args.ordinal,"status":"PASS","subject_call_started":selected.get("subject_call_started"),"recreation_eligible":recreation_eligible}
        elif args.command=="path-terminal": out=root_path_terminal(root,args.slot)
        elif args.command=="matrix-terminal": out=matrix_terminal(root)
        elif args.command=="call-accounting": out=call_accounting(root)
        elif args.command=="artifact-manifest": out=expected_artifact_manifest(root)
        elif args.command=="validation-report": out=expected_validation_report(root)
        elif args.command=="reopen-matrix-terminal": out=reopen_terminal(root)
        elif args.command=="qualify-two-runs": out=qualify_two_runs(root,root_path(args.second_execution_root))
        else: raise Invalid("unsupported command")
        sys.stdout.buffer.write(dump(out)+b"\n"); return 0
    except (Invalid,OSError,KeyError,TypeError,ValueError,IndexError) as exc:
        sys.stdout.buffer.write(dump({"schema_id":"pw-r8-run-verifier-error-v3","candidate_id":CANDIDATE_ID,"status":"INVALID","error":str(exc)})+b"\n"); return 2


if __name__=="__main__": raise SystemExit(main())
