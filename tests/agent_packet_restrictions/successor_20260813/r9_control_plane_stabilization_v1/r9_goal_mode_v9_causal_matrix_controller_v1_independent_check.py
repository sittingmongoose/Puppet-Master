#!/usr/bin/env python3
"""Independent static checker for the causal-stderr Goal matrix pair/controller."""

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
CONTROLLER=BASE/"r9_goal_mode_v9_causal_matrix_controller_v1.py"
BUILDER=BASE/"r9_goal_mode_v9_causal_matrix_pair_builder_v1.py"
VERIFIER=BASE/"r9_goal_mode_v9_causal_matrix_verifier_v1.py"
PAIR=BASE/"goal_mode_v9_causal_matrix_pair_005_006_inputs_v1"
MANIFEST=PAIR/"manifest.json"
BUNDLE=BASE/"formal_candidate_v7/semantic_bundle.json"
MATRIX_IDS=("goal-mode-v9-causal-matrix-005","goal-mode-v9-causal-matrix-006")


class Invalid(RuntimeError): pass


def require(ok: bool,message: str) -> None:
 if not ok: raise Invalid(message)


def pairs(items: list[tuple[str,Any]]) -> dict[str,Any]:
 out={}
 for key,value in items: require(key not in out,f"duplicate:{key}"); out[key]=value
 return out


def canon(value: Any,newline: bool=True) -> bytes:
 raw=json.dumps(value,ensure_ascii=False,allow_nan=False,sort_keys=True,separators=(",", ":")).encode(); return raw+(b"\n" if newline else b"")


def sha(raw: bytes) -> str: return hashlib.sha256(raw).hexdigest()


def read(path: Path,limit: int=32_000_000) -> bytes:
 st=os.lstat(path); require(stat.S_ISREG(st.st_mode) and not path.is_symlink() and 0<=st.st_size<=limit,f"unsafe:{path}"); raw=path.read_bytes(); after=os.lstat(path); require((st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns) and len(raw)==st.st_size,f"drift:{path}"); return raw


def load(path: Path,limit: int=32_000_000) -> Any:
 raw=read(path,limit); require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw,"framing")
 try: value=json.loads(raw,object_pairs_hook=pairs,parse_constant=lambda item:(_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
 except json.JSONDecodeError as exc: raise Invalid(str(exc)) from exc
 require(raw==canon(value),f"noncanonical:{path}"); return value


def identity(label: str,path: Path,limit: int=32_000_000) -> dict[str,Any]:
 raw=read(path,limit); return {"bytes":len(raw),"mode":f"{stat.S_IMODE(os.lstat(path).st_mode):04o}","path":label,"sha256":sha(raw)}


def source_bindings() -> list[dict[str,Any]]:
 rels=(
  "r9_goal_mode_v9_causal_matrix_controller_v1.py","r9_goal_mode_v9_causal_matrix_pair_builder_v1.py","r9_goal_mode_v9_causal_matrix_verifier_v1.py","goal_mode_v9_causal_matrix_pair_005_006_inputs_v1/manifest.json","goal_mode_empirical_harness_v8/goal_mode_contract.json","goal_mode_empirical_harness_v8/goal_mode_harness.py","goal_mode_empirical_harness_v8/goal_mode_single_process_attestor.py","goal_mode_empirical_harness_v4/read_goal_subject.py","r9_goal_mode_harness_v8_independent_static_review_v1.json","r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json","r9_goal_mode_v8_serial_matrix_003_runtime_failure_receipt_v1.json","r9_goal_mode_per_test_taker_binding_correction_v2.json","r9_goal_mode_omp_windows_transport_clarification_v3.json",
 )
 return [identity(rel,BASE/rel,16_000_000) for rel in rels]


def expected_objective(run_id: str,row_id: str,criteria: dict[str,Any],control: dict[str,Any],subject_hash: str) -> str:
 return f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={sha(canon(criteria,False))}; control_envelope_sha256={sha(canon(control,False))}; subject_commitment_sha256={subject_hash}; execute exactly one gated subject after native Goal activation and settle terminal Goal state."


def check_rows() -> dict[str,Any]:
 manifest=load(MANIFEST,16_000_000); bundle=load(BUNDLE,2_000_000); require(manifest["schema_id"]=="pw-r9-goal-mode-v9-causal-matrix-pair-input-manifest-v1" and manifest["pair_order"]==list(MATRIX_IDS),"manifest schema/order"); require(manifest["architecture"]=="CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_CAUSAL_STDERR_V4_SERIAL_MAX_PARALLEL_1" and manifest["authority"]=={"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"manifest authority"); require(manifest["sources"]["semantic_bundle"]==identity("formal_candidate_v7/semantic_bundle.json",BUNDLE,2_000_000) and manifest["sources"]["canary"]==identity("r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json",BASE/"r9_goal_mode_v9_causal_route_canary_001_success_receipt_v1.json"),"manifest sources")
 require(len(bundle["cells"])==97 and len(bundle["routes"])==3 and len(bundle["schedule"])==291,"bundle counts"); expected_files={"manifest.json"}; row_hashes={}
 for cell_index,cell in enumerate(bundle["cells"]):
  path=PAIR/f"subjects/cell-{cell_index:03d}.txt"; raw=read(path,8_000_000); require(len(raw)==cell["render_utf8_bytes"] and sha(raw)==cell["render_utf8_sha256"],"subject source"); expected_files.add(path.relative_to(PAIR).as_posix())
 for matrix_no,matrix_id in enumerate(MATRIX_IDS):
  matrix=manifest["matrices"][matrix_no]; require(matrix["matrix_id"]==matrix_id and matrix["row_count"]==291 and len(matrix["rows"])==291,"matrix count"); rebuilt=[]; hashes=set()
  for index,item in enumerate(matrix["rows"]):
   schedule=bundle["schedule"][index]; cell=bundle["cells"][schedule["cell_index"]]; route=bundle["routes"][schedule["route_index"]]; row_path=PAIR/item["row_spec"]["path"]; subject_path=PAIR/item["subject"]["path"]; row=load(row_path,2_000_000); subject=read(subject_path,8_000_000); expected=cell["expected_output_utf8"]; criteria={"expected_exact_utf8":expected,"rule":"EXACT_UTF8_NO_DECORATION"}; control={"architecture":"SERIAL_DISTINCT_CODEX_EXEC_PROCESSES_CAUSAL_STDERR_V8","canary":False,"causal_stderr_classifier":True,"cell":cell["cell"],"cell_index":schedule["cell_index"],"full_matrix":True,"goal_mode_required":True,"matrix":True,"matrix_id":matrix_id,"max_parallel":1,"qualification_credit":0,"route_index":schedule["route_index"],"schedule_index":index,"semantic_bundle_sha256":manifest["sources"]["semantic_bundle"]["sha256"],"serialized":True,"slot":route["slot"],"subject_tools_allowed":False}; row_id=f"row-{index:03d}"; require(row=={"adapter":"CODEX_NATIVE_GOAL_SINGLE_PROCESS_CLOSED_MESSAGE_PHASES_FIFO_CAUSAL_STDERR_V4","attempt":0,"cli_version":"0.148.0","control_envelope":control,"criteria":criteria,"model":route["model"],"objective":expected_objective(matrix_id,row_id,criteria,control,sha(subject)),"reasoning_effort":route["reasoning_effort"],"row_id":row_id,"run_id":matrix_id,"schema_id":"pw-r9-goal-mode-row-spec-v8","subject_utf8_bytes":len(subject),"subject_utf8_sha256":sha(subject)},f"row spec:{matrix_id}:{index}")
   expected_raw=expected.encode(); projection={"cell":cell["cell"],"cell_index":schedule["cell_index"],"expected_output_bytes":len(expected_raw),"expected_output_sha256":sha(expected_raw),"index":index,"model":route["model"],"reasoning_effort":route["reasoning_effort"],"row_id":row_id,"slot":route["slot"],"subject_utf8_bytes":len(subject),"subject_utf8_sha256":sha(subject)}; row_raw=canon(row); expected_item={**projection,"row_spec":{"bytes":len(row_raw),"path":row_path.relative_to(PAIR).as_posix(),"sha256":sha(row_raw)},"subject":{"bytes":len(subject),"path":subject_path.relative_to(PAIR).as_posix(),"sha256":sha(subject)}}; require(item==expected_item,"manifest row"); rebuilt.append(item); hashes.add(item["row_spec"]["sha256"]); expected_files.add(row_path.relative_to(PAIR).as_posix())
  raw=canon(rebuilt,False); require(len(hashes)==291 and matrix["rows_projection_bytes"]==len(raw) and matrix["rows_projection_sha256"]==sha(raw),"rows projection"); row_hashes[matrix_id]={"bytes":len(raw),"sha256":sha(raw)}
 actual={path.relative_to(PAIR).as_posix() for path in PAIR.rglob("*") if path.is_file()}; require(actual==expected_files,"pair inventory"); return {"file_count":len(actual),"matrix_rows":row_hashes,"subject_count":97}


def check() -> dict[str,Any]:
 controller=read(CONTROLLER).decode(); tree=ast.parse(controller); assignments={node.targets[0].id:node.value.value for node in ast.walk(tree) if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name) and isinstance(node.value,ast.Constant)}; require(assignments.get("MAX_PARALLEL")==1 and assignments.get("ROW_COUNT")==291,"controller constants"); popens=[node for node in ast.walk(tree) if isinstance(node,ast.Call) and isinstance(node.func,ast.Attribute) and node.func.attr=="Popen"]; require(len(popens)==1,"Popen count"); require("batch=[]" not in controller and "for index in range(ROW_COUNT):" in controller and "receipt=launch_one" in controller and 'if receipt["status"]!="PASS": break' in controller,"serialized fail-fast topology"); require('args.output.is_absolute()' in controller and '"quiescent_before_next":quiescent' in controller,"absolute capture/quiescence")
 verifier=read(VERIFIER).decode(); ast.parse(verifier); require(all(token not in verifier for token in ("O_WRONLY","O_CREAT","unlink(","mkdir(")),"verifier mutation token"); require("qualification_streak_clean_matrices" in verifier and "MATRIX_005_RECEIPT" in verifier,"consecutive verification")
 pair=check_rows(); bindings=source_bindings(); require(all(item["mode"]=="0644" for item in bindings),"source modes"); omp=load(BASE/"r9_goal_mode_omp_windows_transport_clarification_v3.json"); require(omp["clarification"]["launch_boundary"]["argv"]==["omp","--cwd","P:\\"] and omp["clarification"]["duplicate_omp_spawn_forbidden"] is True and omp["clarification"]["linux_process_census_authority"] is False,"OMP boundary")
 return {"authority":{"matrix_005_admission_eligible":True,"matrix_006_requires_clean_matrix_005":True,"matrix_launch":False,"qualification_credit":0,"qualification_streak_clean_matrices":0,"release":False},"bindings":bindings,"checks":{"fail_fast_unlaunched_suffix":"PASS_STATIC","fresh_goal_per_row":"PASS_STATIC","matrix_ids":list(MATRIX_IDS),"matrix_rows_each":291,"max_parallel":1,"no_retry":"PASS_STATIC","omp_windows_boundary":"PASS_NO_DUPLICATE_OR_LINUX_INFERENCE","pair":pair,"popen_sites":1,"read_only_verifier":"PASS_STATIC","serialized_reap_and_reader_quiescence":"PASS_STATIC","causal_stderr_classifier":"PASS_EXACT_TWO_CLASS_AFTER_FULL_ATTESTATION"},"first_mismatch":None,"schema_id":"pw-r9-goal-mode-v9-causal-matrix-controller-independent-check-v1","status":"PASS_INDEPENDENT_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH"}


def main() -> int:
 parser=argparse.ArgumentParser(); parser.add_argument("--check",action="store_true",required=True); parser.parse_args()
 try: result=check(); rc=0
 except (Invalid,OSError,UnicodeError,SyntaxError,KeyError,TypeError) as exc: result={"authority":{"matrix_launch":False,"qualification_credit":0},"error":str(exc),"first_mismatch":str(exc),"schema_id":"pw-r9-goal-mode-v9-causal-matrix-controller-independent-check-v1","status":"FAIL_ZERO_CREDIT_NO_LAUNCH"}; rc=1
 sys.stdout.buffer.write(canon(result)); return rc


if __name__=="__main__": raise SystemExit(main())

