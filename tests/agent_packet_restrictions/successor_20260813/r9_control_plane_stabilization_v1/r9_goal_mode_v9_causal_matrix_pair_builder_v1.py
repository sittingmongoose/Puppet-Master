#!/usr/bin/env python3
"""Create/check the fresh V9 causal-stderr 291-row Goal-Mode matrix pair."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any


BASE = Path(__file__).resolve().parent
BUNDLE = BASE / "formal_candidate_v7" / "semantic_bundle.json"
CANARY = BASE / "r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json"
OUTPUT_NAME = "goal_mode_v9_causal_matrix_pair_005_006_inputs_v1"
MATRIX_IDS = ("goal-mode-v9-causal-matrix-005", "goal-mode-v9-causal-matrix-006")
BUNDLE_ID = {"bytes":786546,"mode":"0644","path":"formal_candidate_v7/semantic_bundle.json","sha256":"11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"}
CANARY_ID = {"bytes":7654,"mode":"0644","path":"r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json","sha256":"76e1ecdc3546267976293e1340ba49db5638428ea07337c49777ede7f1e5c3d8"}


class Invalid(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition: raise Invalid(message)


def pairs(items: list[tuple[str,Any]]) -> dict[str,Any]:
    out={}
    for key,value in items:
        require(key not in out,f"duplicate key:{key}"); out[key]=value
    return out


def canon(value: Any, newline: bool=True) -> bytes:
    raw=json.dumps(value,ensure_ascii=False,allow_nan=False,separators=(",",":"),sort_keys=True).encode()
    return raw+(b"\n" if newline else b"")


def sha(raw: bytes) -> str: return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int) -> bytes:
    st=os.lstat(path); require(stat.S_ISREG(st.st_mode) and not path.is_symlink() and 0<=st.st_size<=limit,f"unsafe file:{path}"); raw=path.read_bytes(); st2=os.lstat(path); require(len(raw)==st.st_size and (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(st2.st_dev,st2.st_ino,st2.st_size,st2.st_mtime_ns),f"changing file:{path}"); return raw


def load_json(path: Path, limit: int) -> dict[str,Any]:
    raw=read_regular(path,limit); require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw,"JSON framing")
    value=json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda x:(_ for _ in ()).throw(Invalid(f"nonfinite:{x}"))); require(isinstance(value,dict) and raw==canon(value),f"canonical JSON:{path}"); return value


def identity(path: Path, label: str) -> dict[str,Any]:
    raw=read_regular(path,16_000_000); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":sha(raw)}


def write_exclusive(path: Path, raw: bytes) -> None:
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,"O_CLOEXEC",0),0o644)
    try:
        offset=0
        while offset<len(raw): offset+=os.write(fd,raw[offset:])
        os.fsync(fd)
    finally: os.close(fd)
    os.chmod(path,0o644); require(read_regular(path,max(1,len(raw)))==raw and stat.S_IMODE(os.lstat(path).st_mode)==0o644,f"write reopen:{path}")


def fsync_dir(path: Path) -> None:
    fd=os.open(path,os.O_RDONLY|getattr(os,"O_DIRECTORY",0)|getattr(os,"O_CLOEXEC",0))
    try: os.fsync(fd)
    finally: os.close(fd)


def expected_objective(run_id: str,row_id: str,criteria: dict[str,Any],control: dict[str,Any],subject_hash: str) -> str:
    return f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={sha(canon(criteria,False))}; control_envelope_sha256={sha(canon(control,False))}; subject_commitment_sha256={subject_hash}; execute exactly one gated subject after native Goal activation and settle terminal Goal state."


def source() -> tuple[dict[str,Any],dict[str,Any]]:
    require(identity(BUNDLE,BUNDLE_ID["path"])==BUNDLE_ID,"semantic bundle identity"); require(identity(CANARY,CANARY_ID["path"])==CANARY_ID,"canary identity")
    bundle=load_json(BUNDLE,2_000_000); require(bundle.get("schema_id")=="pw-r9-immutable-semantic-bundle-v1","bundle schema")
    cells=bundle.get("cells"); routes=bundle.get("routes"); schedule=bundle.get("schedule")
    require(isinstance(cells,list) and len(cells)==97 and isinstance(routes,list) and routes==[{"model":"gpt-5.4-mini","reasoning_effort":"xhigh","slot":"slot-alpha"},{"model":"gpt-5.4-mini","reasoning_effort":"medium","slot":"slot-bravo"},{"model":"gpt-5.6-luna","reasoning_effort":"medium","slot":"slot-charlie"}],"cells/routes")
    require(isinstance(schedule,list) and len(schedule)==291,"schedule count")
    for index,item in enumerate(schedule):
        require(item=={"cell_index":index%97,"cell_ref":f"/cells/{index%97}","index":index,"route_index":index//97,"route_ref":f"/routes/{index//97}"},f"schedule:{index}")
    canary=load_json(CANARY,8_000_000); require(canary.get("status")=="PASS_THREE_ROUTE_CAUSAL_STDERR_NATIVE_GOAL_CANARY_ZERO_CREDIT_MATRIX_PAIR_DESIGN_ONLY" and canary.get("authority",{}).get("matrix_launch") is False and canary.get("authority",{}).get("qualification_streak_clean_matrices")==0,"canary authority"); return bundle,canary


def row_payload(bundle: dict[str,Any],matrix_id: str,index: int) -> tuple[dict[str,Any],bytes,dict[str,Any]]:
    item=bundle["schedule"][index]; cell=bundle["cells"][item["cell_index"]]; route=bundle["routes"][item["route_index"]]; subject=cell["render_utf8"].encode("utf-8")
    require(len(subject)==cell["render_utf8_bytes"] and sha(subject)==cell["render_utf8_sha256"],f"subject:{index}")
    expected=cell["expected_output_utf8"]; expected_raw=expected.encode("utf-8"); require(len(expected_raw)==cell["expected_output_bytes"] and sha(expected_raw)==cell["expected_output_sha256"],f"expected:{index}")
    criteria={"expected_exact_utf8":expected,"rule":"EXACT_UTF8_NO_DECORATION"}
    control={"architecture":"SERIAL_DISTINCT_CODEX_EXEC_PROCESSES_CAUSAL_STDERR_V8","canary":False,"causal_stderr_classifier":True,"cell":cell["cell"],"cell_index":item["cell_index"],"full_matrix":True,"goal_mode_required":True,"matrix":True,"matrix_id":matrix_id,"max_parallel":1,"qualification_credit":0,"route_index":item["route_index"],"schedule_index":index,"semantic_bundle_sha256":BUNDLE_ID["sha256"],"serialized":True,"slot":route["slot"],"subject_tools_allowed":False}
    row_id=f"row-{index:03d}"; row={"adapter":"CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_CAUSAL_STDERR_V4","attempt":0,"cli_version":"0.148.0","control_envelope":control,"criteria":criteria,"model":route["model"],"objective":"","reasoning_effort":route["reasoning_effort"],"row_id":row_id,"run_id":matrix_id,"schema_id":"pw-r9-goal-mode-row-spec-v8","subject_utf8_bytes":len(subject),"subject_utf8_sha256":sha(subject)}; row["objective"]=expected_objective(matrix_id,row_id,criteria,control,row["subject_utf8_sha256"])
    projection={"cell":cell["cell"],"cell_index":item["cell_index"],"expected_output_bytes":len(expected_raw),"expected_output_sha256":sha(expected_raw),"index":index,"model":route["model"],"reasoning_effort":route["reasoning_effort"],"row_id":row_id,"slot":route["slot"],"subject_utf8_bytes":len(subject),"subject_utf8_sha256":sha(subject)}
    return row,subject,projection


def build(output: Path) -> dict[str,Any]:
    require(output.name==OUTPUT_NAME and output.parent==BASE and not output.exists(),"output must be exact absent root")
    bundle,_=source(); output.mkdir(mode=0o755); os.chmod(output,0o755); subjects=output/"subjects"; rows_root=output/"rows"; subjects.mkdir(mode=0o755); rows_root.mkdir(mode=0o755); os.chmod(subjects,0o755); os.chmod(rows_root,0o755)
    subject_ids=[]
    for cell_index,cell in enumerate(bundle["cells"]):
        raw=cell["render_utf8"].encode(); path=subjects/f"cell-{cell_index:03d}.txt"; write_exclusive(path,raw); subject_ids.append(identity(path,f"subjects/{path.name}"))
    matrices=[]
    for matrix_id in MATRIX_IDS:
        matrix_dir=rows_root/matrix_id; matrix_dir.mkdir(mode=0o755); os.chmod(matrix_dir,0o755); manifest_rows=[]
        for index in range(291):
            row,subject,projection=row_payload(bundle,matrix_id,index); row_raw=canon(row); row_path=matrix_dir/f"row-{index:03d}.json"; write_exclusive(row_path,row_raw)
            subject_path=f"subjects/cell-{projection['cell_index']:03d}.txt"; require(subject_ids[projection["cell_index"]]["sha256"]==sha(subject),"subject inventory")
            manifest_rows.append({**projection,"row_spec":{"bytes":len(row_raw),"path":f"rows/{matrix_id}/{row_path.name}","sha256":sha(row_raw)},"subject":{"bytes":len(subject),"path":subject_path,"sha256":sha(subject)}})
        fsync_dir(matrix_dir); rows_projection=canon(manifest_rows,False); matrices.append({"matrix_id":matrix_id,"row_count":291,"rows":manifest_rows,"rows_projection_bytes":len(rows_projection),"rows_projection_sha256":sha(rows_projection)})
    manifest={"architecture":"CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_CAUSAL_STDERR_V4_SERIAL_MAX_PARALLEL_1","authority":{"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"matrices":matrices,"pair_order":list(MATRIX_IDS),"schema_id":"pw-r9-goal-mode-v9-causal-matrix-pair-input-manifest-v1","sources":{"canary":CANARY_ID,"semantic_bundle":BUNDLE_ID},"status":"PREDECLARED_INPUTS_ZERO_CREDIT_NO_LAUNCH","subjects":subject_ids}
    manifest_raw=canon(manifest); write_exclusive(output/"manifest.json",manifest_raw); fsync_dir(subjects); fsync_dir(rows_root); fsync_dir(output); fsync_dir(output.parent)
    return {"manifest":{"bytes":len(manifest_raw),"path":f"{OUTPUT_NAME}/manifest.json","sha256":sha(manifest_raw)},"matrix_count":2,"row_count":582,"schema_id":"pw-r9-goal-mode-v9-causal-matrix-pair-build-result-v1","status":"BUILD_COMPLETE_ZERO_CREDIT_NO_LAUNCH","subject_count":97}


def check(output: Path) -> dict[str,Any]:
    bundle,_=source(); require(output.name==OUTPUT_NAME and output.parent==BASE and output.is_dir() and not output.is_symlink(),"output root")
    manifest=load_json(output/"manifest.json",16_000_000); require(manifest.get("schema_id")=="pw-r9-goal-mode-v9-causal-matrix-pair-input-manifest-v1" and manifest.get("pair_order")==list(MATRIX_IDS),"manifest schema/order")
    require(manifest.get("sources")=={"canary":CANARY_ID,"semantic_bundle":BUNDLE_ID} and manifest.get("authority")=={"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"manifest sources/authority")
    expected_files={"manifest.json"}; require(len(manifest.get("subjects",[]))==97 and len(manifest.get("matrices",[]))==2,"manifest counts")
    for cell_index,item in enumerate(manifest["subjects"]):
        path=output/f"subjects/cell-{cell_index:03d}.txt"; expected_files.add(path.relative_to(output).as_posix()); require(identity(path,item["path"])==item,"subject identity")
    for matrix_no,matrix_id in enumerate(MATRIX_IDS):
        matrix=manifest["matrices"][matrix_no]; require(matrix["matrix_id"]==matrix_id and matrix["row_count"]==291 and len(matrix["rows"])==291,"matrix count/id")
        rebuilt=[]
        for index,item in enumerate(matrix["rows"]):
            row,subject,projection=row_payload(bundle,matrix_id,index); row_raw=canon(row); row_path=output/f"rows/{matrix_id}/row-{index:03d}.json"; expected_files.add(row_path.relative_to(output).as_posix()); require(read_regular(row_path,2_000_000)==row_raw,"row bytes"); require(item=={**projection,"row_spec":{"bytes":len(row_raw),"path":row_path.relative_to(output).as_posix(),"sha256":sha(row_raw)},"subject":{"bytes":len(subject),"path":f"subjects/cell-{projection['cell_index']:03d}.txt","sha256":sha(subject)}},"manifest row")
            rebuilt.append(item)
        projection=canon(rebuilt,False); require(matrix["rows_projection_bytes"]==len(projection) and matrix["rows_projection_sha256"]==sha(projection),"matrix projection")
    actual={p.relative_to(output).as_posix() for p in output.rglob("*") if p.is_file()}; require(actual==expected_files,f"file inventory:{sorted(actual^expected_files)[:3]}")
    return {"manifest":{"bytes":os.lstat(output/"manifest.json").st_size,"path":f"{OUTPUT_NAME}/manifest.json","sha256":sha(read_regular(output/"manifest.json",16_000_000))},"matrix_count":2,"row_count":582,"schema_id":"pw-r9-goal-mode-v9-causal-matrix-pair-check-result-v1","status":"PASS_EXACT_PAIR_INPUTS_ZERO_CREDIT_NO_LAUNCH","subject_count":97,"workspace_writes":0}


def main() -> int:
    parser=argparse.ArgumentParser(); group=parser.add_mutually_exclusive_group(required=True); group.add_argument("--build",action="store_true"); group.add_argument("--check",action="store_true"); parser.add_argument("--output",type=Path,required=True); args=parser.parse_args(); output=args.output.resolve(strict=False); result=build(output) if args.build else check(output); sys.stdout.buffer.write(canon(result)); return 0


if __name__=="__main__":
    try: raise SystemExit(main())
    except (Invalid,OSError,UnicodeError,json.JSONDecodeError) as exc:
        sys.stdout.buffer.write(canon({"error":str(exc),"schema_id":"pw-r9-goal-mode-v9-causal-matrix-pair-builder-failure-v1","status":"FAIL_ZERO_CREDIT_NO_LAUNCH"})); raise SystemExit(1)

