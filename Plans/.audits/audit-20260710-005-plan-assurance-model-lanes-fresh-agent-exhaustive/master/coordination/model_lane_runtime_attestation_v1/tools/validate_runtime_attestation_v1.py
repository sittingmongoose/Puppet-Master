#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json
from pathlib import Path

NS=Path(__file__).resolve().parents[1]
EXPECTED_PATH="/root/a005_cds_v2_luna_independent_prelaunch_terminal"
def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()

def validate_evidence(e:dict)->list[str]:
    errors=[];spawn=e.get("parent_spawn",{});args=spawn.get("arguments",{});result=e.get("parent_spawn_result",{});terminal=e.get("terminal_mapping",{});child=e.get("child_native_session",{});closure=e.get("closure",{})
    if e.get("schema_version")!="audit005-model-lane-runtime-spawn-evidence-v1":errors.append("schema_version")
    if spawn.get("call_count")!=1:errors.append("spawn_call_count")
    if args.get("task_name")!="a005_cds_v2_luna_independent_prelaunch_terminal":errors.append("task_name")
    if args.get("fork_turns")!="none":errors.append("fork_turns")
    if "model" not in args:errors.append("spawn_argument_model_missing")
    elif args.get("model")!="gpt-5.6-luna":errors.append("spawn_argument_model_mismatch")
    if "reasoning_effort" not in args:errors.append("spawn_argument_reasoning_effort_missing")
    elif args.get("reasoning_effort")!="max":errors.append("spawn_argument_reasoning_effort_mismatch")
    if result.get("task_name")!=EXPECTED_PATH:errors.append("spawn_result_path")
    if result.get("call_id")!=spawn.get("call_id"):errors.append("spawn_result_call_id")
    if terminal.get("sender")!=EXPECTED_PATH or terminal.get("payload")!="PMR1" or terminal.get("count")!=1:errors.append("terminal_mapping")
    if child.get("agent_path")!=EXPECTED_PATH:errors.append("child_agent_path")
    if not child.get("native_child_thread_id") or child.get("native_child_thread_id_count")!=1:errors.append("native_child_identity")
    if child.get("parent_thread_id")!="019f4f5e-96c6-7893-8c94-ce2c1b760d6c":errors.append("parent_thread_identity")
    if child.get("actual_model")!="gpt-5.6-luna":errors.append("child_runtime_model")
    if child.get("actual_reasoning_effort")!="max":errors.append("child_runtime_reasoning_effort")
    if child.get("terminal_status")!="completed" or child.get("terminal_response")!="PMR1":errors.append("child_terminal")
    if child.get("task_complete_is_last_line") is not True:errors.append("child_session_suffix")
    if closure.get("original_turn_segment_closed") is not True or closure.get("parent_task_complete_after_terminal") is not True:errors.append("parent_turn_closure")
    if closure.get("same_path_spawn_count")!=1:errors.append("spawn_replay")
    if closure.get("followup_count")!=0:errors.append("followup")
    if closure.get("message_count")!=0:errors.append("message_reuse")
    if closure.get("descendant_spawn_count")!=0:errors.append("descendants")
    if closure.get("retry_count")!=0:errors.append("retry")
    if closure.get("post_terminal_reuse_actions")!=[]:errors.append("post_terminal_reuse")
    for k in ["parent_turn_segment_sha256","spawn_record_sha256","spawn_result_record_sha256","terminal_record_sha256","child_session_sha256"]:
        if not isinstance(e.get("hash_closure",{}).get(k),str) or len(e["hash_closure"][k])!=64:errors.append("hash_closure:"+k)
    # Prompt prose and self-attestation are deliberately ignored as authority.
    return sorted(set(errors))

def validate_live_files()->dict:
    evidence_path=NS/"evidence/runtime_spawn_evidence.json";manifest_path=NS/"evidence/capture_manifest.json";errors=[]
    if not evidence_path.is_file():errors.append("missing_evidence")
    if not manifest_path.is_file():errors.append("missing_manifest")
    if errors:return {"status":"fail","errors":errors}
    e=json.loads(evidence_path.read_text());m=json.loads(manifest_path.read_text())
    if m.get("runtime_spawn_evidence_sha256")!=sha(evidence_path):errors.append("evidence_hash")
    errors+=validate_evidence(e)
    return {"status":"pass" if not errors else "fail","errors":sorted(set(errors)),"evidence":e,"manifest":m}

if __name__=="__main__":
    r=validate_live_files();print(json.dumps({k:v for k,v in r.items() if k not in {"evidence","manifest"}},indent=2,sort_keys=True));raise SystemExit(0 if r["status"]=="pass" else 1)
