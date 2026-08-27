#!/usr/bin/env python3
"""Independent no-launch recomputation of the Goal-Mode matrix pair/controller."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any


BASE=Path(__file__).resolve().parent
BUNDLE=BASE/"formal_candidate_v7"/"semantic_bundle.json"
MANIFEST=BASE/"goal_mode_matrix_pair_001_002_inputs_v1"/"manifest.json"
CONTROLLER=BASE/"r9_goal_mode_matrix_controller_v1.py"
BUILDER=BASE/"r9_goal_mode_matrix_pair_builder_v1.py"
VERIFIER=BASE/"r9_goal_mode_matrix_verifier_v1.py"
MATRIX_IDS=("goal-mode-single-process-matrix-001","goal-mode-single-process-matrix-002")


class Invalid(RuntimeError): pass
def require(value: bool,message: str) -> None:
 if not value: raise Invalid(message)
def canon(value: Any,newline: bool=True) -> bytes:
 raw=json.dumps(value,ensure_ascii=False,allow_nan=False,separators=(",",":"),sort_keys=True).encode(); return raw+(b"\n" if newline else b"")
def sha(raw: bytes) -> str: return hashlib.sha256(raw).hexdigest()
def read(path: Path,limit: int) -> bytes:
 st=os.lstat(path); require(stat.S_ISREG(st.st_mode) and not path.is_symlink() and st.st_size<=limit,f"unsafe:{path}"); raw=path.read_bytes(); require(len(raw)==st.st_size,f"short:{path}"); return raw
def load(path: Path,limit: int) -> dict[str,Any]:
 raw=read(path,limit); value=json.loads(raw); require(isinstance(value,dict) and raw==canon(value),f"canonical:{path}"); return value
def ident(label: str,path: Path) -> dict[str,Any]:
 raw=read(path,32_000_000); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":sha(raw)}
def objective(run_id: str,row_id: str,criteria: dict[str,Any],control: dict[str,Any],subject_hash: str) -> str:
 return f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={sha(canon(criteria,False))}; control_envelope_sha256={sha(canon(control,False))}; subject_commitment_sha256={subject_hash}; execute exactly one gated subject after native Goal activation and settle terminal Goal state."


def main() -> int:
 parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.parse_args()
 controller_raw=read(CONTROLLER,2_000_000); builder_raw=read(BUILDER,2_000_000); verifier_raw=read(VERIFIER,2_000_000); controller_text=controller_raw.decode(); builder_text=builder_raw.decode(); controller_tree=ast.parse(controller_text,filename=CONTROLLER.name); ast.parse(builder_text,filename=BUILDER.name); ast.parse(verifier_raw.decode(),filename=VERIFIER.name)
 require(controller_text.count("subprocess.Popen(")==1,"controller Popen site"); require("exec resume" not in controller_text and "--ephemeral" not in controller_text,"rejected transport"); require('MAX_PARALLEL=3' in controller_text and 'ROW_COUNT=291' in controller_text,"runtime constants"); require('range(0,ROW_COUNT,MAX_PARALLEL)' in controller_text and 'retries\":0' in controller_text,"batch/no retry")
 require(controller_text.index('ga.attest_release(')<controller_text.index('core._deliver(fifo,subject'),"release before subject"); require(controller_text.index('goal_active_subject_release_gate.json')<controller_text.index('core._deliver(fifo,subject'),"durable gate before subject")
 bundle=load(BUNDLE,2_000_000); manifest=load(MANIFEST,16_000_000); require(ident("formal_candidate_v7/semantic_bundle.json",BUNDLE)=={"bytes":786546,"mode":"0644","path":"formal_candidate_v7/semantic_bundle.json","sha256":"11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"},"bundle identity"); require(manifest["schema_id"]=="pw-r9-goal-mode-matrix-pair-input-manifest-v1" and manifest["pair_order"]==list(MATRIX_IDS),"manifest pair")
 require(manifest["authority"]=={"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"manifest authority"); require(len(bundle["cells"])==97 and len(bundle["routes"])==3 and len(bundle["schedule"])==291,"source counts"); require(len(manifest["subjects"])==97 and len(manifest["matrices"])==2,"manifest counts")
 for ci,cell in enumerate(bundle["cells"]):
  raw=cell["render_utf8"].encode(); require(len(raw)==cell["render_utf8_bytes"] and sha(raw)==cell["render_utf8_sha256"],f"cell subject:{ci}"); item=manifest["subjects"][ci]; path=MANIFEST.parent/item["path"]; require(ident(item["path"],path)==item and read(path,8_000_000)==raw,f"subject file:{ci}")
 unique_objectives=set(); matrix_projections=[]
 for matrix_no,matrix_id in enumerate(MATRIX_IDS):
  matrix=manifest["matrices"][matrix_no]; require(matrix["matrix_id"]==matrix_id and matrix["row_count"]==291 and len(matrix["rows"])==291,"matrix header"); rows=[]
  for index,item in enumerate(matrix["rows"]):
   schedule=bundle["schedule"][index]; ci=index%97; ri=index//97; require(schedule=={"cell_index":ci,"cell_ref":f"/cells/{ci}","index":index,"route_index":ri,"route_ref":f"/routes/{ri}"},f"schedule:{index}"); cell=bundle["cells"][ci]; route=bundle["routes"][ri]; subject=cell["render_utf8"].encode(); expected=cell["expected_output_utf8"]; expected_raw=expected.encode(); criteria={"expected_exact_utf8":expected,"rule":"EXACT_UTF8_NO_DECORATION"}; control={"architecture":"ONE_CODEX_EXEC_PROCESS_ONE_TASK_ONE_TURN","canary":False,"cell":cell["cell"],"cell_index":ci,"full_matrix":True,"goal_mode_required":True,"matrix":True,"matrix_id":matrix_id,"qualification_credit":0,"route_index":ri,"schedule_index":index,"semantic_bundle_sha256":"11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2","slot":route["slot"],"subject_tools_allowed":False}; row_id=f"row-{index:03d}"; row={"adapter":"CODEX_NATIVE_GOAL_SINGLE_PROCESS_ACTIVATE_THEN_FIFO_V1","attempt":0,"cli_version":"0.148.0","control_envelope":control,"criteria":criteria,"model":route["model"],"objective":"","reasoning_effort":route["reasoning_effort"],"row_id":row_id,"run_id":matrix_id,"schema_id":"pw-r9-goal-mode-row-spec-v5","subject_utf8_bytes":len(subject),"subject_utf8_sha256":sha(subject)}; row["objective"]=objective(matrix_id,row_id,criteria,control,row["subject_utf8_sha256"]); unique_objectives.add(row["objective"]); row_raw=canon(row); row_path=MANIFEST.parent/item["row_spec"]["path"]
   projection={"cell":cell["cell"],"cell_index":ci,"expected_output_bytes":len(expected_raw),"expected_output_sha256":sha(expected_raw),"index":index,"model":route["model"],"reasoning_effort":route["reasoning_effort"],"row_id":row_id,"row_spec":{"bytes":len(row_raw),"path":item["row_spec"]["path"],"sha256":sha(row_raw)},"slot":route["slot"],"subject":{"bytes":len(subject),"path":f"subjects/cell-{ci:03d}.txt","sha256":sha(subject)},"subject_utf8_bytes":len(subject),"subject_utf8_sha256":sha(subject)}; require(item==projection and read(row_path,2_000_000)==row_raw,f"row:{matrix_id}:{index}"); rows.append(item)
  rows_raw=canon(rows,False); require(matrix["rows_projection_bytes"]==len(rows_raw) and matrix["rows_projection_sha256"]==sha(rows_raw),"rows projection"); matrix_projections.append(matrix["rows_projection_sha256"])
 require(len(unique_objectives)==582 and len(set(matrix_projections))==2,"pair uniqueness"); require(manifest["sources"]["canary"]=={"bytes":6030,"mode":"0644","path":"r9_goal_mode_single_process_canary_001_success_receipt_v1.json","sha256":"dd97a373b3eab3266ccb40359f493bdae42ed228dca3ad6d715b97daee2cfc72"},"canary source")
 sources=[ident("r9_goal_mode_matrix_controller_v1.py",CONTROLLER),ident("r9_goal_mode_matrix_pair_builder_v1.py",BUILDER),ident("r9_goal_mode_matrix_verifier_v1.py",VERIFIER),ident("goal_mode_matrix_pair_001_002_inputs_v1/manifest.json",MANIFEST),ident("goal_mode_empirical_harness_v5/goal_mode_contract.json",BASE/"goal_mode_empirical_harness_v5"/"goal_mode_contract.json"),ident("goal_mode_empirical_harness_v5/goal_mode_harness.py",BASE/"goal_mode_empirical_harness_v5"/"goal_mode_harness.py"),ident("goal_mode_empirical_harness_v5/goal_mode_single_process_attestor.py",BASE/"goal_mode_empirical_harness_v5"/"goal_mode_single_process_attestor.py"),ident("goal_mode_empirical_harness_v4/read_goal_subject.py",BASE/"goal_mode_empirical_harness_v4"/"read_goal_subject.py"),ident("r9_goal_mode_single_process_canary_001_success_receipt_v1.json",BASE/"r9_goal_mode_single_process_canary_001_success_receipt_v1.json")]
 result={"authority":{"matrix_launch":False,"qualification_credit":0,"release":False},"bindings":sources,"first_mismatch":None,"matrix_count":2,"recomputed_rows":582,"schema_id":"pw-r9-goal-mode-matrix-controller-v1-independent-check-v1","status":"PASS_INDEPENDENT_RECOMPUTATION_ZERO_CREDIT_NO_LAUNCH","subject_count":97,"workspace_writes":0}; sys.stdout.buffer.write(canon(result)); return 0


if __name__=="__main__":
 try: raise SystemExit(main())
 except (Invalid,OSError,UnicodeError,json.JSONDecodeError,KeyError,TypeError,ValueError) as exc:
  sys.stdout.buffer.write(canon({"authority":{"matrix_launch":False,"qualification_credit":0,"release":False},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-matrix-controller-v1-independent-check-v1","status":"FAIL_INDEPENDENT_ZERO_CREDIT_NO_LAUNCH","workspace_writes":0})); raise SystemExit(1)
