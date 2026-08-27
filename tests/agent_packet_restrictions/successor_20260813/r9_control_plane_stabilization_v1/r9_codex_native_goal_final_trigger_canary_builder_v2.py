#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
from pathlib import Path

SCHEMA = "pw-r9-codex-native-goal-final-trigger-canary-002-inputs-v1"
ROW_SCHEMA = "pw-r9-codex-native-goal-final-trigger-canary-002-row-v1"
RUN_ID = "codex-native-goal-final-trigger-canary-002"
AUTHORITY = "r9_codex_native_goal_final_trigger_canary_001_failure_adjudication_v1.json"
AUTHORITY_SHA256 = "38ca1ef164574dc744d505e96e548de9859e4b55c4ad2c679a926b6669942d0a"
AUTHORITY_BYTES = 3534
PROMPT_MAX = 512
OBJECTIVE_MAX = 256
CLOSURE = 'Call update_goal with status "complete". Return only the completion receipt.'
ROUTES = (
    ("slot-alpha", "gpt-5.4-mini", "xhigh", "GREEN-A"),
    ("slot-bravo", "gpt-5.4-mini", "medium", "GREEN-B"),
    ("slot-charlie", "gpt-5.6-luna", "medium", "GREEN-C"),
)


class Invalid(Exception):
    pass


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def prompt(text, kind):
    raw = text.encode("utf-8")
    if len(raw) > PROMPT_MAX:
        raise Invalid(f"{kind} exceeds {PROMPT_MAX}: {len(raw)}")
    return {"bytes": len(raw), "kind": kind, "sha256": sha(raw), "text": text}


def bind(path, expected_sha, expected_bytes):
    st = os.lstat(path)
    if not stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode):
        raise Invalid(f"not regular nonlink: {path}")
    data = path.read_bytes()
    if len(data) != expected_bytes or sha(data) != expected_sha or stat.S_IMODE(st.st_mode) != 0o644:
        raise Invalid(f"binding mismatch: {path}")


def make_row(index, route, model, effort, token):
    row_id = f"row-{index:03d}"
    payloads = (
        "Return only the token shown after TOKEN= on the next line.\n",
        "TOKEN=",
        token,
    )
    subject = "".join(payloads)
    subject_raw = subject.encode("utf-8")
    subject_sha = sha(subject_raw)
    nonce = sha(canonical([RUN_ID, index, route, model, effort, subject_sha])[:-1])
    objective = (
        f"R9 final-trigger canary; run={RUN_ID}; row={row_id}; "
        f"subject={subject_sha}; never answer before explicit FINAL_TRIGGER."
    )
    objective_raw = objective.encode("utf-8")
    if len(objective_raw) > OBJECTIVE_MAX:
        raise Invalid(f"objective exceeds {OBJECTIVE_MAX}: {len(objective_raw)}")
    activation = (
        f'Call create_goal with this exact objective: "{objective}" '
        "Return only the ACTIVE Goal receipt, then wait. Do not do subject work."
    )
    chunks = []
    for chunk_index, payload in enumerate(payloads):
        ordinal = chunk_index + 1
        if ordinal == 1:
            header = (
                f"SUBJECT_CHUNK {ordinal:03d}/003 subject_sha256={subject_sha}. "
                "Call get_goal first. If not this same ACTIVE Goal, reply exactly FAIL:GOAL. "
                "After ACTIVE receipt, store payload; do not answer it. Reply exactly "
                '{"ack":"ACK:001","goal_status":"active","goal_thread_id":"<receipt threadId>"}.\n'
            )
            item = prompt(header + payload, "ROOT_VISIBLE_ACTIVE_GOAL_GATE_AND_SUBJECT_CHUNK")
            item["expected_response"] = {"ack": "ACK:001", "goal_status": "active", "goal_thread_id": "MATCH_GOAL_ACTIVATION_THREAD_ID"}
            item["root_visible_active_goal_gate_before_payload"] = True
        else:
            header = (
                f"SUBJECT_CHUNK {ordinal:03d}/003 subject_sha256={subject_sha}. "
                f"Store payload; reply exactly ACK:{ordinal:03d}. A scored answer is forbidden until a later FINAL_TRIGGER.\n"
            )
            kind = "FINAL_SUBJECT_CHUNK_REQUIRES_ACK" if ordinal == 3 else "SUBJECT_CHUNK"
            item = prompt(header + payload, kind)
            item["expected_ack"] = f"ACK:{ordinal:03d}"
            item["root_visible_active_goal_gate_before_payload"] = False
        payload_raw = payload.encode("utf-8")
        item.update({"chunk_index": chunk_index, "payload_bytes": len(payload_raw), "payload_sha256": sha(payload_raw)})
        chunks.append(item)
    rebuilt = "".join(item["text"].split("\n", 1)[1] for item in chunks)
    if rebuilt != subject or sha(rebuilt.encode("utf-8")) != subject_sha:
        raise Invalid("rebuilt subject mismatch")
    if not chunks[-1]["text"].endswith(token) or chunks[-1]["payload_bytes"] != len(token.encode("utf-8")):
        raise Invalid("final payload is not exact oracle token")
    final_trigger = (
        f"FINAL_TRIGGER subject_sha256={subject_sha} chunks=3. "
        "Now interpret their exact concatenation as the sole subject prompt and return only its required answer."
    )
    return {
        "adapter": "CODEX_NATIVE_FRESH_TASK_NATIVE_GOAL_EXPLICIT_FINAL_TRIGGER_V4_CANARY",
        "attempt": 0,
        "expected_output_bytes": len(token.encode("utf-8")),
        "expected_output_sha256": sha(token.encode("utf-8")),
        "expected_output_utf8": token,
        "fork_turns": "none",
        "index": index,
        "model_requested": model,
        "nonce": nonce,
        "objective": {"bytes": len(objective_raw), "sha256": sha(objective_raw), "text": objective},
        "prompt_sequence": {
            "activation": prompt(activation, "CREATE_GOAL"),
            "closure_fallback": prompt(CLOSURE, "COMPLETE_GOAL_IF_STILL_ACTIVE"),
            "final_trigger": prompt(final_trigger, "FINAL_TRIGGER_ONLY_SCORED_AUTHORITY"),
            "subject_chunks": chunks,
        },
        "qualification_credit": 0,
        "reasoning_effort_requested": effort,
        "route": route,
        "row_id": row_id,
        "run_id": RUN_ID,
        "schema_id": ROW_SCHEMA,
        "subject": {"bytes": len(subject_raw), "chunk_count": 3, "sha256": subject_sha},
        "task_name": f"r9_cgft2_{nonce}",
    }


def materialize(base):
    bind(base / AUTHORITY, AUTHORITY_SHA256, AUTHORITY_BYTES)
    files = {}
    rows = []
    task_names = set()
    nonces = set()
    maximum_prompt = 0
    for index, (route, model, effort, token) in enumerate(ROUTES):
        row = make_row(index, route, model, effort, token)
        if row["task_name"] in task_names or row["nonce"] in nonces:
            raise Invalid("task or nonce collision")
        task_names.add(row["task_name"])
        nonces.add(row["nonce"])
        row_bytes = canonical(row)
        relative = f"rows/{row['row_id']}.json"
        files[relative] = row_bytes
        sizes = [row["prompt_sequence"][key]["bytes"] for key in ("activation", "closure_fallback", "final_trigger")]
        sizes.extend(item["bytes"] for item in row["prompt_sequence"]["subject_chunks"])
        maximum_prompt = max(maximum_prompt, *sizes)
        rows.append({
            "index": index,
            "model_requested": model,
            "reasoning_effort_requested": effort,
            "route": route,
            "row_file": {"bytes": len(row_bytes), "path": relative, "sha256": sha(row_bytes)},
            "row_id": row["row_id"],
            "task_name": row["task_name"],
        })
    manifest = {
        "architecture": "ONE_FRESH_CODEX_TASK_AND_NATIVE_GOAL_PER_ROUTE_EXPLICIT_FINAL_TRIGGER_ONLY",
        "authority": {"matrix_launch": False, "qualification_credit": 0, "release": False},
        "binding": {"bytes": AUTHORITY_BYTES, "mode": "0644", "path": AUTHORITY, "sha256": AUTHORITY_SHA256},
        "controls": {
            "final_chunk_payload_is_exact_expected_output_without_trailing_punctuation": True,
            "final_chunk_requires_ack": True,
            "final_trigger_is_only_scored_answer_authority": True,
            "no_best_of": True,
            "no_relaunch": True,
            "no_replacement": True,
            "no_retry": True,
            "no_task_or_goal_reuse": True,
            "same_family_recurrence_rejects_v4": True,
        },
        "limits": {"all_delivered_prompts_max_utf8_bytes": PROMPT_MAX, "goal_objective_max_utf8_bytes": OBJECTIVE_MAX},
        "nonclaims": {"effective_platform_model_attestation": False, "omp_lane_authority": False},
        "qualification": {"clean_full_matrix_streak": 0, "current_value": "0/2", "required_clean_full_matrix_streak": 2},
        "rows": rows,
        "run_id": RUN_ID,
        "schema_id": SCHEMA,
        "status": "PREDECLARED_ZERO_CREDIT_CANARY_002_ORACLE_CORRECTION_PENDING_INDEPENDENT_REVIEW_NO_LAUNCH",
        "summary": {"maximum_delivered_prompt_utf8_bytes": maximum_prompt, "row_count": 3, "unique_nonces": len(nonces), "unique_task_names": len(task_names)},
    }
    files["manifest.json"] = canonical(manifest)
    return files, manifest


def write_new(root, files):
    if root.exists():
        raise Invalid(f"output exists: {root}")
    root.mkdir(mode=0o755)
    (root / "rows").mkdir(mode=0o755)
    os.chmod(root, 0o755)
    os.chmod(root / "rows", 0o755)
    for relative, data in sorted(files.items()):
        path = root / relative
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
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
        if path.read_bytes() != data or stat.S_IMODE(os.lstat(path).st_mode) != 0o644:
            raise Invalid(f"write reopen mismatch: {path}")
    for directory in (root / "rows", root):
        fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)


def check_existing(root, files):
    actual = sorted(path.relative_to(root).as_posix() for path in root.rglob("*") if path.is_file())
    if actual != sorted(files):
        raise Invalid("file inventory mismatch")
    for relative, expected in files.items():
        path = root / relative
        if path.read_bytes() != expected or stat.S_IMODE(os.lstat(path).st_mode) != 0o644:
            raise Invalid(f"existing file mismatch: {relative}")


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
        write_new(root, files)
        action = "OUTPUT_OK"
    else:
        check_existing(root, files)
        action = "CHECK_OK"
    manifest_bytes = files["manifest.json"]
    print(json.dumps({
        "action": action,
        "file_count": len(files),
        "manifest_bytes": len(manifest_bytes),
        "manifest_sha256": sha(manifest_bytes),
        "maximum_delivered_prompt_utf8_bytes": manifest["summary"]["maximum_delivered_prompt_utf8_bytes"],
        "row_count": manifest["summary"]["row_count"],
        "status": "PASS",
    }, sort_keys=True, separators=(",", ":")))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL"}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
