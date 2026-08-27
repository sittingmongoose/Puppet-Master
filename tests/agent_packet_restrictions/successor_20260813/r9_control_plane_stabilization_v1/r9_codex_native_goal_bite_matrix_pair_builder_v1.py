#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
from pathlib import Path

SCHEMA = "pw-r9-codex-native-goal-bite-matrix-pair-inputs-v1"
ROW_SCHEMA = "pw-r9-codex-native-goal-bite-matrix-row-v1"
SOURCE_MANIFEST_SHA256 = "220100f422dfbf9a33ae0e8269abe32b4654e8339c5eaeea150d57eb81e9391b"
SOURCE_MANIFEST_BYTES = 405977
IMPACT_SHA256 = "f458fc5f8836d7f454b718f9619fc420e440489a1d84150ecafea30485dd02a1"
IMPACT_BYTES = 2754
CANARY_SHA256 = "aefd5e29e32461e7f4d0983c8d920512c9e428fe261e5caa5f256c95f0d4bd08"
CANARY_BYTES = 3349
REVIEW_SHA256 = "b6b3e9ddea4c6243f80c4a2168f1fb0a306b53b79752d6749e1d5f9c1a4c526b"
REVIEW_BYTES = 1889
RUN_IDS = ("codex-native-goal-bite-matrix-001", "codex-native-goal-bite-matrix-002")
PAYLOAD_MAX = 340
PROMPT_MAX = 512
OBJECTIVE_MAX = 256
VERIFY = "Call get_goal. Return only the current Goal receipt. Do not do subject work."
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
        value = json.loads(data.decode("utf-8"), parse_constant=lambda x: (_ for _ in ()).throw(ValueError(x)))
    except Exception as exc:
        raise Invalid(f"invalid JSON {label}: {exc}") from exc
    if canonical(value) != data:
        raise Invalid(f"noncanonical JSON: {label}")
    return value


def split_utf8(text, limit):
    chunks = []
    buf = []
    size = 0
    for ch in text:
        encoded = ch.encode("utf-8")
        if size + len(encoded) > limit and buf:
            chunks.append("".join(buf))
            buf = []
            size = 0
        if len(encoded) > limit:
            raise Invalid("single code point exceeds chunk limit")
        buf.append(ch)
        size += len(encoded)
    if buf:
        chunks.append("".join(buf))
    return chunks


def prompt(value, kind):
    raw = value.encode("utf-8")
    if len(raw) > PROMPT_MAX:
        raise Invalid(f"{kind} exceeds prompt limit: {len(raw)}")
    return {"bytes": len(raw), "kind": kind, "sha256": sha(raw), "text": value}


def build_chunk_prompts(subject_text, subject_sha):
    payloads = split_utf8(subject_text, PAYLOAD_MAX)
    total = len(payloads)
    out = []
    for index, payload in enumerate(payloads):
        ordinal = index + 1
        header = (
            f"SUBJECT_CHUNK {ordinal:03d}/{total:03d} subject_sha256={subject_sha}. "
            f"Store payload in order; do not answer; reply exactly ACK:{ordinal:03d}.\n"
        )
        message = header + payload
        row = prompt(message, "SUBJECT_CHUNK")
        payload_raw = payload.encode("utf-8")
        row.update({
            "chunk_index": index,
            "expected_ack": f"ACK:{ordinal:03d}",
            "payload_bytes": len(payload_raw),
            "payload_sha256": sha(payload_raw),
        })
        out.append(row)
    rebuilt = "".join(item["text"].split("\n", 1)[1] for item in out)
    if rebuilt != subject_text or sha(rebuilt.encode("utf-8")) != subject_sha:
        raise Invalid("subject reassembly mismatch")
    return out


def row_object(source_row, run_id):
    source_path = source_row["subject"]["resolved_path"]
    subject_raw, _ = read_regular(source_path)
    if len(subject_raw) != source_row["subject"]["bytes"] or sha(subject_raw) != source_row["subject"]["sha256"]:
        raise Invalid(f"subject mismatch: {source_path}")
    subject_text = subject_raw.decode("utf-8")
    chunks = build_chunk_prompts(subject_text, source_row["subject"]["sha256"])
    index = source_row["index"]
    row_id = f"row-{index:03d}"
    if row_id != source_row["row_id"]:
        raise Invalid(f"row id mismatch: {row_id}")
    nonce_preimage = canonical([
        run_id,
        index,
        source_row["slot"],
        source_row["cell"],
        source_row["subject"]["sha256"],
    ])[:-1]
    nonce = sha(nonce_preimage)
    task_name = f"r9_cg_{nonce}"
    objective = (
        f"R9 Goal atom; run={run_id}; row={row_id}; "
        f"subject={source_row['subject']['sha256']}; answer only after all chunks."
    )
    objective_raw = objective.encode("utf-8")
    if len(objective_raw) > OBJECTIVE_MAX:
        raise Invalid(f"objective exceeds limit: {len(objective_raw)}")
    activation = (
        f'Call create_goal with this exact objective: "{objective}" '
        "Return only the ACTIVE Goal receipt, then wait. Do not do subject work."
    )
    final_trigger = (
        f"All {len(chunks)} subject chunks for sha256={source_row['subject']['sha256']} are stored. "
        "Interpret their exact concatenation as the sole subject prompt and return only its required answer."
    )
    model_available = source_row["model"] == "gpt-5.6-luna"
    return {
        "adapter": "CODEX_NATIVE_COLLABORATION_FRESH_TASK_NATIVE_GOAL_CHUNKED_SUBJECT_V1",
        "attempt": 0,
        "cell": source_row["cell"],
        "cell_index": source_row["cell_index"],
        "expected_output_bytes": source_row["expected_output_bytes"],
        "expected_output_sha256": source_row["expected_output_sha256"],
        "fork_turns": "none",
        "index": index,
        "model_available_in_current_collaboration_schema": model_available,
        "model_requested": source_row["model"],
        "nonce": nonce,
        "objective": {"bytes": len(objective_raw), "sha256": sha(objective_raw), "text": objective},
        "prompt_sequence": {
            "activation": prompt(activation, "CREATE_GOAL"),
            "closure_fallback": prompt(CLOSURE, "COMPLETE_GOAL_IF_STILL_ACTIVE"),
            "final_trigger": prompt(final_trigger, "ATOMIC_SCORED_DECISION"),
            "subject_chunks": chunks,
            "verification": prompt(VERIFY, "GET_GOAL_PRE_SUBJECT_GATE"),
        },
        "qualification_credit": 0,
        "reasoning_effort_requested": source_row["reasoning_effort"],
        "route": source_row["slot"],
        "row_id": row_id,
        "run_id": run_id,
        "schema_id": ROW_SCHEMA,
        "subject": {
            "bytes": len(subject_raw),
            "chunk_count": len(chunks),
            "sha256": sha(subject_raw),
            "source_path": source_row["subject"]["manifest_path"],
        },
        "task_name": task_name,
    }


def materialize(base):
    source_root = base / "goal_mode_v8_serial_matrix_pair_003_004_inputs_v1"
    source_manifest_path = source_root / "manifest.json"
    source = parse_json(bind(source_manifest_path, SOURCE_MANIFEST_SHA256, SOURCE_MANIFEST_BYTES), source_manifest_path)
    bind(base / "r9_codex_native_goal_collaboration_lane_impact_assessment_v1.json", IMPACT_SHA256, IMPACT_BYTES)
    bind(base / "r9_codex_native_goal_bite_canary_002_success_receipt_v1.json", CANARY_SHA256, CANARY_BYTES)
    bind(base / "r9_codex_native_goal_bite_canary_002_independent_review_001_success_receipt_v1.json", REVIEW_SHA256, REVIEW_BYTES)
    if source.get("pair_order") != ["goal-mode-v8-serialized-matrix-003", "goal-mode-v8-serialized-matrix-004"]:
        raise Invalid("source pair order mismatch")
    if len(source.get("matrices", [])) != 2:
        raise Invalid("source matrix count mismatch")
    first_rows = source["matrices"][0]["rows"]
    second_rows = source["matrices"][1]["rows"]
    if len(first_rows) != 291 or len(second_rows) != 291:
        raise Invalid("source row count mismatch")
    subjects = {item["path"]: item for item in source["subjects"]}
    prepared = []
    for left, right in zip(first_rows, second_rows):
        fields = ("index", "row_id", "cell", "cell_index", "slot", "model", "reasoning_effort", "expected_output_bytes", "expected_output_sha256", "subject_utf8_bytes", "subject_utf8_sha256")
        if any(left[field] != right[field] for field in fields):
            raise Invalid(f"source pair roster mismatch: {left['row_id']}")
        subject = subjects[left["subject"]["path"]]
        prepared.append({
            **{key: left[key] for key in fields},
            "subject": {
                "bytes": subject["bytes"],
                "manifest_path": subject["path"],
                "resolved_path": source_root / subject["path"],
                "sha256": subject["sha256"],
            },
        })
    matrices = []
    row_files = {}
    all_tasks = set()
    all_nonces = set()
    total_chunks = 0
    max_message = 0
    for run_id in RUN_IDS:
        index_rows = []
        route_counts = {}
        for source_row in prepared:
            row = row_object(source_row, run_id)
            if row["task_name"] in all_tasks or row["nonce"] in all_nonces:
                raise Invalid("task or nonce collision")
            all_tasks.add(row["task_name"])
            all_nonces.add(row["nonce"])
            row_bytes = canonical(row)
            relative = f"rows/{run_id}/{row['row_id']}.json"
            row_files[relative] = row_bytes
            chunks = row["prompt_sequence"]["subject_chunks"]
            total_chunks += len(chunks)
            message_sizes = [
                row["prompt_sequence"]["activation"]["bytes"],
                row["prompt_sequence"]["verification"]["bytes"],
                row["prompt_sequence"]["final_trigger"]["bytes"],
                row["prompt_sequence"]["closure_fallback"]["bytes"],
                *(item["bytes"] for item in chunks),
            ]
            max_message = max(max_message, *message_sizes)
            route_counts[row["route"]] = route_counts.get(row["route"], 0) + 1
            index_rows.append({
                "cell": row["cell"],
                "chunk_count": row["subject"]["chunk_count"],
                "index": row["index"],
                "model_available_in_current_collaboration_schema": row["model_available_in_current_collaboration_schema"],
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
        "architecture": "ONE_FRESH_COLLABORATION_TASK_AND_NATIVE_GOAL_PER_ROW_WITH_EXACT_SUBJECT_BYTES_DELIVERED_AS_ORDERED_PROMPTS_AT_MOST_512_BYTES",
        "authority": {
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "bindings": [
            {"bytes": SOURCE_MANIFEST_BYTES, "mode": "0644", "path": "goal_mode_v8_serial_matrix_pair_003_004_inputs_v1/manifest.json", "sha256": SOURCE_MANIFEST_SHA256},
            {"bytes": IMPACT_BYTES, "mode": "0644", "path": "r9_codex_native_goal_collaboration_lane_impact_assessment_v1.json", "sha256": IMPACT_SHA256},
            {"bytes": CANARY_BYTES, "mode": "0644", "path": "r9_codex_native_goal_bite_canary_002_success_receipt_v1.json", "sha256": CANARY_SHA256},
            {"bytes": REVIEW_BYTES, "mode": "0644", "path": "r9_codex_native_goal_bite_canary_002_independent_review_001_success_receipt_v1.json", "sha256": REVIEW_SHA256},
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
            "route_alpha": {"available": False, "model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
            "route_bravo": {"available": False, "model": "gpt-5.4-mini", "reasoning_effort": "medium"},
            "route_charlie": {"available": True, "model": "gpt-5.6-luna", "reasoning_effort": "medium"},
            "silent_substitution": False,
        },
        "pair_order": list(RUN_IDS),
        "qualification": {"clean_full_matrix_target": 2, "current_streak": 0, "current_value": "0/2"},
        "schema_id": SCHEMA,
        "status": "PREDECLARED_BITE_SIZE_PAIR_BLOCKED_PENDING_EXACT_ALPHA_BRAVO_NATIVE_MODEL_AVAILABILITY_NO_LAUNCH",
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
    files = {"manifest.json": canonical(manifest), **row_files}
    return files, manifest


def write_new(root, files):
    if root.exists() or root.is_symlink():
        raise Invalid(f"output already exists: {root}")
    root.mkdir(mode=0o755)
    os.chmod(root, 0o755)
    for relative, data in sorted(files.items()):
        path = root / relative
        path.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
        os.chmod(path.parent, 0o755)
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
        try:
            offset = 0
            while offset < len(data):
                written = os.write(fd, data[offset:])
                if written <= 0:
                    raise Invalid(f"short write: {path}")
                offset += written
            os.fsync(fd)
        finally:
            os.close(fd)
        os.chmod(path, 0o644)
        reopened, st = read_regular(path)
        if reopened != data or stat.S_IMODE(st.st_mode) != 0o644:
            raise Invalid(f"reopen mismatch: {path}")
    for directory, _, _ in os.walk(root, topdown=False):
        os.chmod(directory, 0o755)
        fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)


def check_existing(root, files):
    actual = {}
    for path in sorted(root.rglob("*")):
        if path.is_symlink() or not (path.is_file() or path.is_dir()):
            raise Invalid(f"nonregular tree member: {path}")
        if path.is_file():
            data, st = read_regular(path)
            if stat.S_IMODE(st.st_mode) != 0o644:
                raise Invalid(f"file mode mismatch: {path}")
            actual[path.relative_to(root).as_posix()] = data
        elif stat.S_IMODE(os.lstat(path).st_mode) != 0o755:
            raise Invalid(f"directory mode mismatch: {path}")
    if set(actual) != set(files):
        raise Invalid("output inventory mismatch")
    for relative, expected in files.items():
        if actual[relative] != expected:
            raise Invalid(f"output bytes mismatch: {relative}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--output")
    group.add_argument("--check")
    args = parser.parse_args()
    base = Path(args.base).resolve()
    files, manifest = materialize(base)
    if args.output:
        root = Path(args.output).resolve()
        write_new(root, files)
        action = "OUTPUT_OK"
    else:
        root = Path(args.check).resolve()
        check_existing(root, files)
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
