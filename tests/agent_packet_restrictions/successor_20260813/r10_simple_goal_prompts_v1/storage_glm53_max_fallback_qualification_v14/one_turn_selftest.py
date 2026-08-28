#!/usr/bin/env python3
import json, shutil, tempfile
from pathlib import Path

import controller as C

def require(value, message):
    if not value: raise RuntimeError(message)

source=Path("/tmp/pm-r10-storage-dev-20260828-runs/dev02/evidence/diagnostic_01/omp_mimo_v25_free_high/postfailure_session.raw.jsonl")
prompt=Path("/tmp/pm-r10-storage-dev-20260828-runs/dev02/evidence/diagnostic_01/omp_mimo_v25_free_high/stdin_prompt.raw").read_bytes()
root=Path(tempfile.mkdtemp(prefix="pm-r10-storage-dev-one-turn-")); directory=root/"diagnostic_01"/"omp_mimo_v25_free_high"; directory.mkdir(parents=True); (directory/"stdin_prompt.raw").write_bytes(prompt)
kept=[]
for raw_line in source.read_bytes().splitlines(keepends=True):
    kept.append(raw_line); entry=json.loads(raw_line)
    if entry.get("type")=="message" and entry.get("message",{}).get("role")=="toolResult": break
session=directory/"one-turn.jsonl"; session.write_bytes(b"".join(kept))
header=json.loads(kept[1]); expected_cwd=header["cwd"]
old=(C.EVIDENCE,C.G.EVIDENCE,C.row_dir,C.G.row_dir,C.G.NORMALIZE); C.EVIDENCE=root; C.G.EVIDENCE=root; C.row_dir=lambda _row=None:directory; C.G.row_dir=lambda _row=None:directory; C.G.NORMALIZE=C.semantic_normalize
try:
    row=dict(C.rows()[0]); row.update(route_id="omp_mimo_v25_free_high",model="opencode-zen/mimo-v2.5-free",thinking="high")
    with C.selected(row):
        result=C.G.verify_session(session,expected_cwd=expected_cwd,expected_provider="opencode-zen",expected_selector=row["model"],expected_model="mimo-v2.5-free",expected_thinking="high",expected_objective="IGNORED_IN_FAVOR_OF_TRANSPORT",require_exit=False)
    require(result["assistant_lifecycle_shape"]=="standard_single_turn_goal_complete" and result["assistant_message_count"]==1,"one-turn lifecycle projection")
    require(result["one_turn_final_payload_before_goal_complete"] is True and result["result_normalization"]["candidate_count"]==1,"pre-completion payload authority")
    require(result["ordinary_tool_calls"]==0 and result["native_continuation_count"]==0,"zero ordinary tools/continuations")
finally:
    C.EVIDENCE,C.G.EVIDENCE,C.row_dir,C.G.row_dir,C.G.NORMALIZE=old; C.DB.cleanup(); shutil.rmtree(root)
print(json.dumps({"status":"PASS_ONE_TURN_FINAL_PAYLOAD","subject_calls":0,"assistant_message_count":result["assistant_message_count"],"goal_complete_once":True,"final_payload":"pre_goal_complete_assistant_text","native_continuations":0},sort_keys=True))
