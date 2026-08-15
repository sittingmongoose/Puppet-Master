#!/usr/bin/env python3
"""Read-only closed-world verifier for R8 candidate-2 run evidence.

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
ROOT = SUCCESSOR / "model_retest_r8_candidate_v2"
HARNESS = ROOT / "r8_harness.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-2"
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
STAGES = ("S10A","S10B","S20A","S20B","S30A","S30B","S40A","S40B","S45A","S45B","S50","S55","S60P","S60C","S60K","S70","S80","S90")
ROUTES = {"slot-alpha":("gpt-5.4-mini","xhigh"),"slot-bravo":("gpt-5.4-mini","medium"),"slot-charlie":("gpt-5.6-luna","medium")}
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")


class Invalid(RuntimeError): pass


def dump(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def sha(data: bytes) -> str: return hashlib.sha256(data).hexdigest()


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
    try: st = os.lstat(path)
    except FileNotFoundError as exc: raise Invalid(f"{label}: missing {path}") from exc
    if not stat.S_ISREG(st.st_mode): raise Invalid(f"{label}: not a regular nonlink")
    return path.read_bytes()


def payload(path: Path, label: str) -> tuple[bytes, bytes, dict[str, Any]]:
    storage = regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"): raise Invalid(f"{label}: storage must have exactly one terminal LF")
    raw = storage[:-1]
    return storage, raw, strict_object(raw, label)


def run_contract(execution_root: Path) -> dict[str, Any]:
    _, _, value = payload(execution_root / "run_contract.json", "run contract")
    if value.get("schema_id") != "pw-r8-run-contract-v2" or value.get("candidate_id") != CANDIDATE_ID: raise Invalid("run contract identity mismatch")
    run_id = value.get("run_id")
    if not isinstance(run_id, str) or not RUN_ID_RE.fullmatch(run_id): raise Invalid("run contract run_id invalid")
    if value.get("routes") != {s:{"requested_model":ROUTES[s][0],"requested_thinking":ROUTES[s][1]} for s in SLOTS}: raise Invalid("run contract routes mismatch")
    return value


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
    if value.get("candidate_id") != CANDIDATE_ID or not isinstance(cells,list) or not cells or any(not isinstance(x,str) for x in cells) or len(cells)!=len(set(cells)): raise Invalid("harness frozen schedule invalid")
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


def completed_receipt(root: Path, slot: str, cell: str) -> tuple[bytes, dict[str, Any]]:
    storage, _, value = payload(receipt_path(root,slot,cell), f"{slot} {cell} receipt")
    contract = run_contract(root); model, effort = ROUTES[slot]
    expected = {"schema_id":"pw-r8-direct-appserver-subject-receipt-v2","candidate_id":CANDIDATE_ID,"run_id":contract["run_id"],"slot":slot,"cell":cell,"requested_model":model,"requested_thinking":effort,"status":"completed","subject_call_started":True,"fresh_context":True,"first_attempt_subject_call":True,"retry_count":0,"best_of":False,"replacement_result":False}
    for key,want in expected.items():
        if type(value.get(key)) is not type(want) or value.get(key)!=want: raise Invalid(f"{slot} {cell} receipt field mismatch: {key}")
    if not isinstance(value.get("thread_id"),str) or not value["thread_id"] or not isinstance(value.get("turn_id"),str) or not value["turn_id"]: raise Invalid("receipt thread/turn missing")
    if value.get("execution_root")!=str(root): raise Invalid("receipt execution_root mismatch")
    admission=value.get("admission")
    if not isinstance(admission,dict) or admission.get("schema_id")!="pw-r8-cell-admission-v2" or admission.get("candidate_id")!=CANDIDATE_ID or admission.get("run_id")!=contract["run_id"] or admission.get("slot")!=slot or admission.get("cell")!=cell or admission.get("status")!="ADMIT_ONE_FRESH_FIRST_ATTEMPT": raise Invalid("receipt closed-world admission binding mismatch")
    final_messages=value.get("assistant_final_messages"); prohibited=value.get("prohibited_activity_items")
    if not isinstance(final_messages,list) or not isinstance(prohibited,list): raise Invalid("receipt raw item arrays missing")
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
    return storage,value


def expected_capture(root: Path, slot: str, cell: str) -> dict[str, Any]:
    receipt_storage,r=completed_receipt(root,slot,cell)
    return {
        "schema_id":"pw-r8-subject-capture-envelope-v2","candidate_id":CANDIDATE_ID,"run_id":r["run_id"],"slot":slot,"cell":cell,
        "subject_call_started":True,"subject_call_completed":True,
        "thread_id":r["thread_id"],"turn_id":r["turn_id"],
        "assistant_final_messages":r["assistant_final_messages"],"assistant_final_messages_sha256":r["assistant_final_messages_sha256"],"assistant_final_messages_bytes":r["assistant_final_messages_bytes"],
        "single_text_output_utf8":r["single_text_output_utf8"],"single_text_output_sha256":r["single_text_output_sha256"],"single_text_output_bytes":r["single_text_output_bytes"],
        "prohibited_activity_item_types":r["prohibited_activity_item_types"],
        "conformance_observations":r["conformance_observations"],
        "driver_receipt_storage_sha256":sha(receipt_storage),"driver_receipt_storage_bytes":len(receipt_storage),
    }


def capture(root: Path, slot: str, cell: str) -> dict[str, Any]:
    _,_,value=payload(capture_path(root,slot,cell),f"{slot} {cell} capture")
    if value != expected_capture(root,slot,cell): raise Invalid(f"{slot} {cell} capture is not byte-bound to derived receipt")
    return value


def expected_score(root: Path,slot: str,cell: str) -> dict[str,Any]:
    capture(root,slot,cell)
    out,rc=harness(["score","--execution-root",str(root),"--slot",slot,"--cell",cell],(0,1,2))
    if not out.endswith(b"\n") or out.endswith(b"\n\n"): raise Invalid("harness score framing invalid")
    score=strict_object(out[:-1],"harness score")
    if rc==2 or score.get("verdict")=="INVALID": raise Invalid(f"harness/scorer invalid for completed conforming response: {score.get('error')}")
    if score.get("candidate_id")!=CANDIDATE_ID or score.get("slot")!=slot or score.get("cell")!=cell or score.get("verdict") not in ("PASS","FAIL"): raise Invalid("harness score identity/verdict invalid")
    return score


def persisted_score(root: Path,slot: str,cell: str) -> dict[str,Any]:
    _,_,value=payload(score_path(root,slot,cell),f"{slot} {cell} score")
    expected=expected_score(root,slot,cell)
    if value != expected: raise Invalid(f"{slot} {cell} persisted score differs from recomputation")
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
        model,effort=ROUTES[slot]
        if v.get("schema_id")!="pw-r8-direct-appserver-controller-invalid-v2" or v.get("candidate_id")!=CANDIDATE_ID or v.get("run_id")!=run_contract(root)["run_id"] or v.get("slot")!=slot or v.get("cell")!=cell or v.get("execution_root")!=str(root) or v.get("requested_model")!=model or v.get("requested_thinking")!=effort or v.get("status")!="controller_invalid" or v.get("empirical_credit") is not False: raise Invalid("controller-invalid receipt identity mismatch")
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
    return {"schema_id":"pw-r8-artifact-validation-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"slot":slot,"stage":stage,"status":"PASS","artifact_payload_sha256":sha(raw),"artifact_payload_bytes":len(raw),"terminal":value.get("terminal")}


def admit(root: Path,slot: str,cell: str) -> dict[str,Any]:
    cells=schedule(); check_slot_cell(slot,cell,cells); index=cells.index(cell)
    ordered_schedule(root,cells)
    if receipt_path(root,slot,cell).exists() or capture_path(root,slot,cell).exists() or score_path(root,slot,cell).exists(): raise Invalid("target cell already has empirical evidence")
    for later in cells[index+1:]:
        if any(p.exists() for p in (receipt_path(root,slot,later),capture_path(root,slot,later),score_path(root,slot,later))): raise Invalid("downstream evidence exists before target")
    for prior in cells[:index]:
        if persisted_score(root,slot,prior).get("verdict")!="PASS": raise Invalid(f"prior cell {prior} is not PASS; downstream dispatch prohibited")
    invalids=controller_invalids(root,slot,cell); validate_no_start_invalids(root,slot,cell,invalids)
    for stage in required_stages_before(cell): validate_artifact(root,slot,stage)
    return {"schema_id":"pw-r8-cell-admission-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"slot":slot,"cell":cell,"ordered_index":index,"status":"ADMIT_ONE_FRESH_FIRST_ATTEMPT","prior_pass_count":index,"preserved_no_start_controller_invalid_count":len(invalids),"retry":False,"best_of":False,"replacement":False}


def validate_cell(root: Path,slot: str,cell: str) -> dict[str,Any]:
    cells=schedule(); check_slot_cell(slot,cell,cells)
    _,r=completed_receipt(root,slot,cell); validate_rendered(root,slot,cell,r); c=capture(root,slot,cell); score=expected_score(root,slot,cell)
    persisted=None
    if score_path(root,slot,cell).exists():
        persisted=persisted_score(root,slot,cell)
    return {"schema_id":"pw-r8-cell-validation-v2","candidate_id":CANDIDATE_ID,"run_id":r["run_id"],"slot":slot,"cell":cell,"status":"PASS","subject_result_verdict":score["verdict"],"capture_payload_sha256":sha(dump(c)),"capture_payload_bytes":len(dump(c)),"score":score,"score_persisted_and_reopened":persisted is not None,"score_path":str(score_path(root,slot,cell).relative_to(root))}


def path_terminal(root: Path,slot: str) -> dict[str,Any]:
    cells=schedule(); scores=[]; first_failure=None
    seen_ids=[]
    started_rows=[]
    for i,cell in enumerate(cells):
        values=controller_invalids(root,slot,cell)
        for value in values:
            if value.get("subject_call_started") is not False: started_rows.append((i,cell,value))
        if values and all(value.get("subject_call_started") is False for value in values): validate_no_start_invalids(root,slot,cell,values)
    if started_rows:
        if len(started_rows)!=1: raise Invalid("multiple started/unknown controller-invalid attempts in one path")
        bad_index,bad_cell,_=started_rows[0]
        for prior in cells[:bad_index]:
            score=persisted_score(root,slot,prior)
            if score.get("verdict")!="PASS": raise Invalid("controller-invalid path has earlier non-PASS")
            _,r=completed_receipt(root,slot,prior); validate_rendered(root,slot,prior,r); scores.append(score); seen_ids.append((r["thread_id"],r["turn_id"]))
        for later in cells[bad_index:]:
            if any(p.exists() for p in (receipt_path(root,slot,later),capture_path(root,slot,later),score_path(root,slot,later))): raise Invalid("empirical evidence exists at/after controller-invalid cell")
        return {"schema_id":"pw-r8-path-terminal-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"slot":slot,"terminal":"CONTROLLER_INVALID_AFTER_START","expected_subject_cells":len(cells),"started_subject_calls":len(scores)+1,"completed_subject_calls":len(scores),"pass_count":len(scores),"fail_count":0,"invalid_count":1,"missing_count":0,"ineligible_count":len(cells)-len(scores),"first_failed_cell":bad_cell,"retry_count":0,"best_of_count":0,"replacement_count":0,"unique_thread_count":len({x[0] for x in seen_ids}),"unique_turn_count":len({x[1] for x in seen_ids})}
    for i,cell in enumerate(cells):
        rp=receipt_path(root,slot,cell); cp=capture_path(root,slot,cell); sp=score_path(root,slot,cell)
        if not any(p.exists() for p in (rp,cp,sp)):
            if first_failure is None: raise Invalid(f"path incomplete at {cell}")
            continue
        if first_failure is not None: raise Invalid(f"downstream evidence exists after failure: {cell}")
        score=persisted_score(root,slot,cell); _,r=completed_receipt(root,slot,cell); validate_rendered(root,slot,cell,r); scores.append(score); seen_ids.append((r["thread_id"],r["turn_id"]))
        if score["verdict"]!="PASS": first_failure=(cell,i,score["verdict"])
    if len(seen_ids)!=len(set(seen_ids)): raise Invalid("thread/turn pair reused within path")
    if first_failure:
        terminal="FIRST_ATTEMPT_FAIL"; failed_cell=first_failure[0]
    else:
        if len(scores)!=len(cells): raise Invalid("clean path missing score")
        s90=validate_artifact(root,slot,"S90")
        if s90.get("terminal")!="bounded_causal_simulation_pass": raise Invalid("S90 terminal mismatch")
        terminal="COMPLETE_PASS"; failed_cell=None
    return {"schema_id":"pw-r8-path-terminal-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"slot":slot,"terminal":terminal,"expected_subject_cells":len(cells),"started_subject_calls":len(scores),"completed_subject_calls":len(scores),"pass_count":sum(s["verdict"]=="PASS" for s in scores),"fail_count":sum(s["verdict"]=="FAIL" for s in scores),"invalid_count":0,"missing_count":0,"ineligible_count":0 if terminal=="COMPLETE_PASS" else len(cells)-len(scores),"first_failed_cell":failed_cell,"retry_count":0,"best_of_count":0,"replacement_count":0,"unique_thread_count":len({x[0] for x in seen_ids}),"unique_turn_count":len({x[1] for x in seen_ids})}


def matrix_terminal(root: Path) -> dict[str,Any]:
    paths={slot:path_terminal(root,slot) for slot in SLOTS}
    for slot,want in paths.items():
        _,_,stored=payload(path_terminal_path(root,slot),f"{slot} path terminal")
        if stored!=want: raise Invalid(f"{slot} persisted path terminal mismatch")
    ids=[]; calls=0; started_invalid_ids=[]
    for slot in SLOTS:
        for cell in schedule():
            if receipt_path(root,slot,cell).exists():
                _,r=completed_receipt(root,slot,cell); ids.append((r["thread_id"],r["turn_id"])); calls+=1
            for value in controller_invalids(root,slot,cell):
                if value.get("subject_call_started") is not False:
                    started_invalid_ids.append((value.get("thread_id"),value.get("turn_id")))
    threads=[x[0] for x in ids]; turns=[x[1] for x in ids]
    if len(threads)!=len(set(threads)) or len(turns)!=len(set(turns)): raise Invalid("global thread or turn identity reuse")
    known_invalid_threads=[x[0] for x in started_invalid_ids if isinstance(x[0],str) and x[0]]; known_invalid_turns=[x[1] for x in started_invalid_ids if isinstance(x[1],str) and x[1]]
    if len(threads+known_invalid_threads)!=len(set(threads+known_invalid_threads)) or len(turns+known_invalid_turns)!=len(set(turns+known_invalid_turns)): raise Invalid("global identity reused by controller-invalid call")
    all_pass=all(x["terminal"]=="COMPLETE_PASS" for x in paths.values())
    return {"schema_id":"pw-r8-matrix-terminal-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"terminal":"COMPLETE_CLEAN_MATRIX_PASS" if all_pass else "VALID_COMPLETED_MATRIX_WITH_FIRST_ATTEMPT_FAILURES","qualification_clean_run_credit":1 if all_pass else 0,"paths":paths,"expected_clean_subject_calls":len(schedule())*len(SLOTS),"started_subject_calls":sum(x["started_subject_calls"] for x in paths.values()),"completed_subject_calls":calls,"pass_count":sum(x["pass_count"] for x in paths.values()),"fail_count":sum(x["fail_count"] for x in paths.values()),"invalid_count":sum(x["invalid_count"] for x in paths.values()),"missing_count":sum(x["missing_count"] for x in paths.values()),"ineligible_count":sum(x["ineligible_count"] for x in paths.values()),"retry_count":0,"best_of_count":0,"replacement_count":0,"global_unique_thread_count":len(set(threads)),"global_unique_turn_count":len(set(turns)),"global_thread_turn_disjointness":"PASS"}


def qualify_two_runs(first: Path,second: Path) -> dict[str,Any]:
    cells=schedule(); validate_layout(second,cells); first_contract=run_contract(first); second_contract=run_contract(second)
    ordered_schedule(first,cells); ordered_schedule(second,cells)
    if first_contract["run_id"]==second_contract["run_id"]: raise Invalid("qualification run IDs must differ")
    if first_contract.get("qualification_sequence")!=1 or second_contract.get("qualification_sequence")!=2 or second_contract.get("predecessor_run_id")!=first_contract["run_id"]: raise Invalid("qualification run sequence is not consecutive 1 then 2")
    freeze_one=first_contract.get("candidate_freeze_sha256"); freeze_two=second_contract.get("candidate_freeze_sha256")
    if not isinstance(freeze_one,str) or not re.fullmatch(r"[0-9a-f]{64}",freeze_one) or freeze_two!=freeze_one: raise Invalid("candidate freeze identity absent or differs across runs")
    terminals=[]; threads=[]; turns=[]
    for root in (first,second):
        want=matrix_terminal(root); _,_,stored=payload(root/"matrix_terminal.json",f"{root.name} matrix terminal")
        if stored!=want or stored.get("terminal")!="COMPLETE_CLEAN_MATRIX_PASS": raise Invalid("both persisted matrices must be byte-valid complete clean passes")
        _,_,accounting=payload(root/"subject_call_accounting.json",f"{root.name} subject call accounting")
        if accounting!=call_accounting(root): raise Invalid("qualification run call accounting differs from recomputation")
        terminals.append(stored)
        for slot in SLOTS:
            for cell in cells:
                _,r=completed_receipt(root,slot,cell); threads.append(r["thread_id"]); turns.append(r["turn_id"])
                if controller_invalids(root,slot,cell): raise Invalid("clean qualification runs may not contain controller-invalid attempts")
    expected=2*len(SLOTS)*len(cells)
    if len(threads)!=expected or len(threads)!=len(set(threads)) or len(turns)!=len(set(turns)): raise Invalid("cross-run subject call or global identity accounting mismatch")
    return {"schema_id":"pw-r8-two-run-qualification-verification-v2","candidate_id":CANDIDATE_ID,"status":"QUALIFIED_TWO_CONSECUTIVE_CLEAN_MATRICES","candidate_freeze_sha256":freeze_one,"run_ids":[first_contract["run_id"],second_contract["run_id"]],"matrix_terminals":[x["terminal"] for x in terminals],"complete_clean_matrices":2,"routes_per_matrix":len(SLOTS),"subject_cells_per_route":len(cells),"expected_subject_calls":expected,"completed_subject_calls":len(threads),"pass_count":sum(x["pass_count"] for x in terminals),"fail_count":0,"invalid_count":0,"missing_count":0,"retry_count":0,"best_of_count":0,"replacement_count":0,"global_unique_thread_count":len(set(threads)),"global_unique_turn_count":len(set(turns)),"cross_run_thread_turn_disjointness":"PASS"}


def call_accounting(root: Path) -> dict[str,Any]:
    matrix=matrix_terminal(root)
    keys=("expected_clean_subject_calls","started_subject_calls","completed_subject_calls","pass_count","fail_count","invalid_count","missing_count","ineligible_count","retry_count","best_of_count","replacement_count","global_unique_thread_count","global_unique_turn_count")
    return {"schema_id":"pw-r8-call-accounting-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"matrix_terminal":matrix["terminal"],**{key:matrix[key] for key in keys},"global_thread_turn_disjointness":matrix["global_thread_turn_disjointness"]}


def parser() -> argparse.ArgumentParser:
    p=argparse.ArgumentParser(); p.add_argument("--execution-root",required=True); sub=p.add_subparsers(dest="command",required=True)
    for name in ("emit-capture","admit","validate-cell"):
        q=sub.add_parser(name); q.add_argument("--slot",choices=SLOTS,required=True); q.add_argument("--cell",required=True)
    q=sub.add_parser("validate-artifact"); q.add_argument("--slot",choices=SLOTS,required=True); q.add_argument("--stage",choices=STAGES,required=True)
    q=sub.add_parser("validate-controller-invalid"); q.add_argument("--slot",choices=SLOTS,required=True); q.add_argument("--cell",required=True); q.add_argument("--ordinal",type=int,required=True)
    q=sub.add_parser("path-terminal"); q.add_argument("--slot",choices=SLOTS,required=True)
    sub.add_parser("matrix-terminal"); sub.add_parser("call-accounting"); sub.add_parser("reopen-matrix-terminal")
    q=sub.add_parser("qualify-two-runs"); q.add_argument("--second-execution-root",required=True)
    return p


def main() -> int:
    args=parser().parse_args()
    try:
        root=root_path(args.execution_root); run_contract(root); cells=schedule(); validate_layout(root,cells)
        if hasattr(args,"cell"): check_slot_cell(args.slot,args.cell,cells)
        if args.command=="emit-capture": out=expected_capture(root,args.slot,args.cell)
        elif args.command=="admit": out=admit(root,args.slot,args.cell)
        elif args.command=="validate-cell": out=validate_cell(root,args.slot,args.cell)
        elif args.command=="validate-artifact": out=validate_artifact(root,args.slot,args.stage)
        elif args.command=="validate-controller-invalid":
            values=controller_invalids(root,args.slot,args.cell)
            if args.ordinal<1 or args.ordinal>len(values): raise Invalid("controller-invalid ordinal absent")
            selected=values[args.ordinal-1]
            if selected.get("subject_call_started") is False: validate_no_start_invalids(root,args.slot,args.cell,values)
            out={"schema_id":"pw-r8-controller-invalid-validation-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"slot":args.slot,"cell":args.cell,"ordinal":args.ordinal,"status":"PASS","subject_call_started":selected.get("subject_call_started"),"recreation_eligible":selected.get("subject_call_started") is False}
        elif args.command=="path-terminal": out=path_terminal(root,args.slot)
        elif args.command=="matrix-terminal": out=matrix_terminal(root)
        elif args.command=="call-accounting": out=call_accounting(root)
        elif args.command=="reopen-matrix-terminal":
            want=matrix_terminal(root); storage,raw,stored=payload(root/"matrix_terminal.json","matrix terminal")
            if stored!=want: raise Invalid("persisted matrix terminal differs from recomputation")
            _,_,accounting=payload(root/"subject_call_accounting.json","subject call accounting")
            if accounting!=call_accounting(root): raise Invalid("persisted subject call accounting differs from recomputation")
            out={"schema_id":"pw-r8-matrix-reopen-validation-v2","candidate_id":CANDIDATE_ID,"run_id":run_contract(root)["run_id"],"status":"PASS","terminal":stored["terminal"],"matrix_terminal_payload_sha256":sha(raw),"matrix_terminal_payload_bytes":len(raw),"matrix_terminal_storage_sha256":sha(storage),"matrix_terminal_storage_bytes":len(storage)}
        elif args.command=="qualify-two-runs": out=qualify_two_runs(root,root_path(args.second_execution_root))
        else: raise Invalid("unsupported command")
        sys.stdout.buffer.write(dump(out)+b"\n"); return 0
    except (Invalid,OSError,KeyError,TypeError,ValueError,IndexError) as exc:
        sys.stdout.buffer.write(dump({"schema_id":"pw-r8-run-verifier-error-v2","candidate_id":CANDIDATE_ID,"status":"INVALID","error":str(exc)})+b"\n"); return 2


if __name__=="__main__": raise SystemExit(main())
