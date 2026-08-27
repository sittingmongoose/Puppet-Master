#!/usr/bin/env python3
import argparse
import hashlib
import importlib.util
import json
import os
import stat
from pathlib import Path

SCHEMA = "pw-r9-codex-native-goal-bite-matrix-pair-inputs-v2"
ROW_SCHEMA = "pw-r9-codex-native-goal-bite-matrix-row-v2"
V1_BUILDER = "r9_codex_native_goal_bite_matrix_pair_builder_v1.py"
V1_BUILDER_SHA256 = "de39f81ccff223bd9e09587464b843ebdc467481f6351ad070359d0fcc42b7de"
V1_BUILDER_BYTES = 17290
V1_REJECTION = "r9_codex_native_goal_bite_matrix_pair_001_002_v1_family_rejection_v1.json"
V1_REJECTION_SHA256 = "713aaea4adf62698b573b76333d10a983488ed1984bc24b768b8c08a468c78ce"
V1_REJECTION_BYTES = 2136
ROUTE_CAPABILITY = "r9_codex_native_goal_exact_route_capability_canary_001_v1.json"
ROUTE_CAPABILITY_SHA256 = "6a2250a74ff6f2dec15f9a08e8aaced42e2e49f1be5d1ba1ecc850aca7f575e2"
ROUTE_CAPABILITY_BYTES = 4244
ROUTE_REVIEW = "r9_codex_native_goal_exact_route_capability_review_002_success_receipt_v1.json"
ROUTE_REVIEW_SHA256 = "824fad6b15b6f469d13fd56f6faa24593a49acbade8ff3062d0d2de742fa0c06"
ROUTE_REVIEW_BYTES = 1874
RUN_IDS = ("codex-native-goal-bite-matrix-003", "codex-native-goal-bite-matrix-004")
SOURCE_RUN_ID = "codex-native-goal-bite-matrix-001"
PAYLOAD_MAX = 220
PROMPT_MAX = 512
OBJECTIVE_MAX = 256
GATE_PREFIX = "Call get_goal first. If it is not this same ACTIVE Goal, reply exactly FAIL:GOAL and stop. After ACTIVE receipt, "
CLOSURE = 'Call update_goal with status "complete". Return only the completion receipt.'


class Invalid(Exception):
    pass


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def read_regular(path):
    st = os.lstat(path)
    if not stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode):
        raise Invalid(f"not regular nonlink: {path}")
    data = path.read_bytes()
    if os.lstat(path).st_ino != st.st_ino:
        raise Invalid(f"identity drift: {path}")
    return data, st


def bind(path, expected_sha, expected_bytes):
    data, st = read_regular(path)
    if len(data) != expected_bytes or sha(data) != expected_sha or stat.S_IMODE(st.st_mode) != 0o644:
        raise Invalid(f"binding mismatch: {path}")
    return data


def parse_json(data, label):
    try:
        value = json.loads(data.decode("utf-8"), parse_constant=lambda value: (_ for _ in ()).throw(ValueError(value)))
    except Exception as exc:
        raise Invalid(f"invalid JSON {label}: {exc}") from exc
    if canonical(value) != data:
        raise Invalid(f"noncanonical JSON: {label}")
    return value


def prompt(value, kind):
    raw = value.encode("utf-8")
    if len(raw) > PROMPT_MAX:
        raise Invalid(f"{kind} exceeds prompt limit: {len(raw)}")
    return {"bytes": len(raw), "kind": kind, "sha256": sha(raw), "text": value}


def split_utf8(text, limit):
    chunks = []
    buf = []
    size = 0
    for character in text:
        encoded = character.encode("utf-8")
        if size + len(encoded) > limit and buf:
            chunks.append("".join(buf))
            buf = []
            size = 0
        if len(encoded) > limit:
            raise Invalid("single code point exceeds chunk limit")
        buf.append(character)
        size += len(encoded)
    if buf:
        chunks.append("".join(buf))
    return chunks


def source_text(row):
    chunks = row["prompt_sequence"]["subject_chunks"]
    text = "".join(item["text"].split("\n", 1)[1] for item in chunks)
    raw = text.encode("utf-8")
    if len(raw) != row["subject"]["bytes"] or sha(raw) != row["subject"]["sha256"]:
        raise Invalid(f"source subject mismatch: {row['row_id']}")
    return text


def chunk_prompts(text, subject_sha):
    payloads = split_utf8(text, PAYLOAD_MAX)
    total = len(payloads)
    out = []
    for index, payload in enumerate(payloads):
        ordinal = index + 1
        header = (
            f"SUBJECT_CHUNK {ordinal:03d}/{total:03d} subject_sha256={subject_sha}. "
            f"Store payload in order; do not answer; reply exactly ACK:{ordinal:03d}.\n"
        )
        gated = index == 0
        message = (GATE_PREFIX if gated else "") + header + payload
        item = prompt(message, "ACTIVE_GOAL_GATE_AND_SUBJECT_CHUNK" if gated else "SUBJECT_CHUNK")
        payload_raw = payload.encode("utf-8")
        item.update({
            "active_goal_gate_before_payload": gated,
            "chunk_index": index,
            "expected_ack": f"ACK:{ordinal:03d}",
            "payload_bytes": len(payload_raw),
            "payload_sha256": sha(payload_raw),
        })
        out.append(item)
    rebuilt = "".join(item["text"].split("\n", 1)[1] for item in out)
    if rebuilt != text or sha(rebuilt.encode("utf-8")) != subject_sha:
        raise Invalid("subject reassembly mismatch")
    if sum(1 for item in out if item["active_goal_gate_before_payload"]) != 1:
        raise Invalid("active Goal gate cardinality mismatch")
    return out


def transformed_row(source, run_id):
    text = source_text(source)
    chunks = chunk_prompts(text, source["subject"]["sha256"])
    nonce_preimage = canonical([
        run_id,
        source["index"],
        source["route"],
        source["cell"],
        source["subject"]["sha256"],
    ])[:-1]
    nonce = sha(nonce_preimage)
    row_id = source["row_id"]
    objective = (
        f"R9 Goal atom; run={run_id}; row={row_id}; "
        f"subject={source['subject']['sha256']}; answer only after all chunks."
    )
    objective_raw = objective.encode("utf-8")
    if len(objective_raw) > OBJECTIVE_MAX:
        raise Invalid(f"objective exceeds limit: {len(objective_raw)}")
    activation = (
        f'Call create_goal with this exact objective: "{objective}" '
        "Return only the ACTIVE Goal receipt, then wait. Do not do subject work."
    )
    final_trigger = (
        f"All {len(chunks)} subject chunks for sha256={source['subject']['sha256']} are stored. "
        "Interpret their exact concatenation as the sole subject prompt and return only its required answer."
    )
    return {
        "adapter": "CODEX_NATIVE_COLLABORATION_FRESH_TASK_NATIVE_GOAL_COMBINED_GATE_CHUNKED_SUBJECT_V2",
        "attempt": 0,
        "cell": source["cell"],
        "cell_index": source["cell_index"],
        "expected_output_bytes": source["expected_output_bytes"],
        "expected_output_sha256": source["expected_output_sha256"],
        "fork_turns": "none",
        "index": source["index"],
        "model_route_capability_admitted": True,
        "model_requested": source["model_requested"],
        "nonce": nonce,
        "objective": {"bytes": len(objective_raw), "sha256": sha(objective_raw), "text": objective},
        "prompt_sequence": {
            "activation": prompt(activation, "CREATE_GOAL"),
            "closure_fallback": prompt(CLOSURE, "COMPLETE_GOAL_IF_STILL_ACTIVE"),
            "final_trigger": prompt(final_trigger, "ATOMIC_SCORED_DECISION"),
            "subject_chunks": chunks,
        },
        "qualification_credit": 0,
        "reasoning_effort_requested": source["reasoning_effort_requested"],
        "route": source["route"],
        "row_id": row_id,
        "run_id": run_id,
        "schema_id": ROW_SCHEMA,
        "subject": {
            "bytes": source["subject"]["bytes"],
            "chunk_count": len(chunks),
            "sha256": source["subject"]["sha256"],
            "source_path": source["subject"]["source_path"],
        },
        "task_name": f"r9_cg_{nonce}",
    }


def load_v1(base):
    builder_path = base / V1_BUILDER
    bind(builder_path, V1_BUILDER_SHA256, V1_BUILDER_BYTES)
    spec = importlib.util.spec_from_file_location("r9_bite_builder_v1_frozen", builder_path)
    if spec is None or spec.loader is None:
        raise Invalid("cannot load frozen V1 builder")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    files, manifest = module.materialize(base)
    if manifest["pair_order"] != ["codex-native-goal-bite-matrix-001", "codex-native-goal-bite-matrix-002"]:
        raise Invalid("frozen V1 pair order mismatch")
    return module, files


def materialize(base):
    v1, v1_files = load_v1(base)
    bind(base / V1_REJECTION, V1_REJECTION_SHA256, V1_REJECTION_BYTES)
    bind(base / ROUTE_CAPABILITY, ROUTE_CAPABILITY_SHA256, ROUTE_CAPABILITY_BYTES)
    bind(base / ROUTE_REVIEW, ROUTE_REVIEW_SHA256, ROUTE_REVIEW_BYTES)
    source_rows = []
    for index in range(291):
        relative = f"rows/{SOURCE_RUN_ID}/row-{index:03d}.json"
        source_rows.append(parse_json(v1_files[relative], relative))
    matrices = []
    row_files = {}
    all_tasks = set()
    all_nonces = set()
    total_chunks = 0
    max_message = 0
    for run_id in RUN_IDS:
        index_rows = []
        route_counts = {}
        for source in source_rows:
            row = transformed_row(source, run_id)
            if row["task_name"] in all_tasks or row["nonce"] in all_nonces:
                raise Invalid("task or nonce collision")
            all_tasks.add(row["task_name"])
            all_nonces.add(row["nonce"])
            row_bytes = canonical(row)
            relative = f"rows/{run_id}/{row['row_id']}.json"
            row_files[relative] = row_bytes
            chunks = row["prompt_sequence"]["subject_chunks"]
            total_chunks += len(chunks)
            sizes = [
                row["prompt_sequence"]["activation"]["bytes"],
                row["prompt_sequence"]["final_trigger"]["bytes"],
                row["prompt_sequence"]["closure_fallback"]["bytes"],
                *(item["bytes"] for item in chunks),
            ]
            max_message = max(max_message, *sizes)
            route_counts[row["route"]] = route_counts.get(row["route"], 0) + 1
            index_rows.append({
                "cell": row["cell"],
                "chunk_count": row["subject"]["chunk_count"],
                "index": row["index"],
                "model_requested": row["model_requested"],
                "reasoning_effort_requested": row["reasoning_effort_requested"],
                "route": row["route"],
                "row_file": {"bytes": len(row_bytes), "path": relative, "sha256": sha(row_bytes)},
                "row_id": row["row_id"],
                "task_name": row["task_name"],
            })
        if route_counts != {"slot-alpha": 97, "slot-bravo": 97, "slot-charlie": 97}:
            raise Invalid(f"route counts mismatch: {route_counts}")
        projection = canonical(index_rows)[:-1]
        matrices.append({
            "matrix_id": run_id,
            "row_count": len(index_rows),
            "rows": index_rows,
            "rows_projection_bytes": len(projection),
            "rows_projection_sha256": sha(projection),
        })
    manifest = {
        "architecture": "ONE_FRESH_COLLABORATION_TASK_AND_NATIVE_GOAL_PER_ROW_WITH_ACTIVE_GOAL_GATE_AND_FIRST_SUBJECT_CHUNK_IN_ONE_PROMPT",
        "authority": {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "bindings": [
            {"bytes": V1_BUILDER_BYTES, "mode": "0644", "path": V1_BUILDER, "sha256": V1_BUILDER_SHA256},
            {"bytes": V1_REJECTION_BYTES, "mode": "0644", "path": V1_REJECTION, "sha256": V1_REJECTION_SHA256},
            {"bytes": ROUTE_CAPABILITY_BYTES, "mode": "0644", "path": ROUTE_CAPABILITY, "sha256": ROUTE_CAPABILITY_SHA256},
            {"bytes": ROUTE_REVIEW_BYTES, "mode": "0644", "path": ROUTE_REVIEW, "sha256": ROUTE_REVIEW_SHA256},
        ],
        "limits": {
            "acceptance_criterion_max_utf8_bytes": 256,
            "all_delivered_prompts_max_utf8_bytes": PROMPT_MAX,
            "chunk_payload_max_utf8_bytes": PAYLOAD_MAX,
            "goal_objective_max_utf8_bytes": OBJECTIVE_MAX,
            "output_contract_max_utf8_bytes": 128,
        },
        "matrices": matrices,
        "model_roster": {
            "original_exact_roster_preserved": True,
            "route_alpha": {"available": True, "model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
            "route_bravo": {"available": True, "model": "gpt-5.4-mini", "reasoning_effort": "medium"},
            "route_charlie": {"available": True, "model": "gpt-5.6-luna", "reasoning_effort": "medium"},
            "silent_substitution": False,
        },
        "pair_order": list(RUN_IDS),
        "qualification": {"clean_full_matrix_target": 2, "current_streak": 0, "current_value": "0/2"},
        "schema_id": SCHEMA,
        "status": "PREDECLARED_BITE_SIZE_PAIR_V2_EXACT_ROUTES_AVAILABLE_PENDING_INDEPENDENT_REVIEW_NO_LAUNCH",
        "summary": {
            "matrix_count": 2,
            "maximum_delivered_prompt_utf8_bytes": max_message,
            "row_count_per_matrix": 291,
            "total_fresh_goal_tasks": 582,
            "total_subject_chunk_prompts": total_chunks,
            "unique_nonces": len(all_nonces),
            "unique_task_names": len(all_tasks),
        },
    }
    return {"manifest.json": canonical(manifest), **row_files}, manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--output")
    group.add_argument("--check")
    args = parser.parse_args()
    base = Path(args.base).resolve()
    files, manifest = materialize(base)
    root = Path(args.output or args.check).resolve()
    if args.output:
        v1, _ = load_v1(base)
        v1.write_new(root, files)
        action = "OUTPUT_OK"
    else:
        v1, _ = load_v1(base)
        v1.check_existing(root, files)
        action = "CHECK_OK"
    manifest_bytes = files["manifest.json"]
    print(json.dumps({
        "action": action,
        "file_count": len(files),
        "manifest_bytes": len(manifest_bytes),
        "manifest_sha256": sha(manifest_bytes),
        "maximum_delivered_prompt_utf8_bytes": manifest["summary"]["maximum_delivered_prompt_utf8_bytes"],
        "row_count": sum(item["row_count"] for item in manifest["matrices"]),
        "status": "PASS",
        "total_subject_chunk_prompts": manifest["summary"]["total_subject_chunk_prompts"],
    }, sort_keys=True, separators=(",", ":")))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL"}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
