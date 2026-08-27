#!/usr/bin/env python3
import hashlib
import json
import os
import pathlib
import stat

BASE = pathlib.Path("/mnt/Cursor/PuppetMaster")
SOURCE = BASE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_bite_matrix_pair_005_006_inputs_v3/rows/codex-native-goal-bite-matrix-006"
ROOT = BASE / "tests/r9g40/run-canary-001"
READER = BASE / "tests/r9g40/turn_reader_v1.py"
SKILL = BASE / ".agents/skills/r9-goal-turn-pull-v1/SKILL.md"
EXPERIMENT = "r9g40-goal-turn-pull-canary-001"
ROWS = [(0, "alpha", "gpt-5.4-mini", "xhigh"), (97, "bravo", "gpt-5.4-mini", "medium"), (194, "charlie", "gpt-5.6-luna", "medium")]


class Invalid(Exception):
    pass


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode() + b"\n"


def write_new(path, raw, mode):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags, mode)
    try:
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise Invalid("short-write")
            view = view[count:]
        os.fsync(fd)
        os.fchmod(fd, mode)
    finally:
        os.close(fd)
    reopened = pathlib.Path(path).read_bytes()
    info = os.lstat(path)
    if reopened != raw or not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode:
        raise Invalid("reopen")


def mkdir_new(path):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    info = os.lstat(path)
    if not stat.S_ISDIR(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o700 or info.st_uid != os.getuid():
        raise Invalid("directory-custody")


def verified_text(item):
    if not {"bytes", "sha256", "text"} <= set(item):
        raise Invalid("text-shape")
    raw = item["text"].encode()
    if len(raw) != item["bytes"] or digest(raw) != item["sha256"]:
        raise Invalid("text-identity")
    return raw


def main():
    if ROOT.exists() or ROOT.is_symlink():
        raise Invalid("root-exists")
    reader_raw = READER.read_bytes()
    skill_raw = SKILL.read_bytes()
    if stat.S_IMODE(os.lstat(READER).st_mode) != 0o644 or stat.S_IMODE(os.lstat(SKILL).st_mode) != 0o644:
        raise Invalid("component-mode")
    mkdir_new(ROOT)
    mkdir_new(ROOT / "rows")
    manifest_rows = []
    for source_index, route, model, effort in ROWS:
        row_id = f"row-{source_index:03d}"
        source_path = SOURCE / f"{row_id}.json"
        source_raw = source_path.read_bytes()
        source = json.loads(source_raw)
        if source["row_id"] != row_id or source["model_requested"] != model or source["reasoning_effort_requested"] != effort:
            raise Invalid("source-route")
        objective_raw = verified_text(source["objective"])
        sequence = source["prompt_sequence"]
        verified_text(sequence["activation"])
        capsules = []
        for index, chunk in enumerate(sequence["subject_chunks"]):
            raw = verified_text(chunk)
            if index != chunk["chunk_index"] or len(raw) > 512:
                raise Invalid("chunk")
            capsules.append({"bytes": len(raw), "index": index, "kind": "SUBJECT_CHUNK", "sha256": digest(raw), "text": chunk["text"]})
        for kind, item in (("FINAL_TRIGGER", sequence["final_trigger"]), ("CLOSURE", sequence["closure_fallback"])):
            raw = verified_text(item)
            capsules.append({"bytes": len(raw), "index": len(capsules), "kind": kind, "sha256": digest(raw), "text": item["text"]})
        seed = f"{EXPERIMENT}|{route}|{row_id}|{digest(source_raw)}".encode()
        nonce = digest(seed)
        task_name = "r9_gtp1_" + nonce
        attempt_id = digest(b"attempt|" + seed)[:24]
        workdir = ROOT / "rows" / row_id
        mkdir_new(workdir)
        mkdir_new(workdir / "journal")
        write_new(workdir / "turn.py", reader_raw, 0o644)
        plan = {
            "attempt_id": attempt_id,
            "capsules": capsules,
            "objective": source["objective"],
            "row_id": row_id,
            "schema_id": "pw-r9-codex-native-goal-turn-pull-row-plan-v1",
            "source_row": {"bytes": len(source_raw), "path": str(source_path), "sha256": digest(source_raw)},
            "task_name": task_name,
        }
        plan_raw = canon(plan)
        write_new(workdir / "plan.json", plan_raw, 0o444)
        message = f'Use $r9-goal-turn-pull-v1 only. Goal objective: "{objective_raw.decode()}" Reader workdir: {workdir}. Follow that skill exactly.'
        message_raw = message.encode()
        if len(message_raw) > 512 or source["expected_output_bytes"] < 1:
            raise Invalid("message-or-output")
        manifest_rows.append({
            "attempt_id": attempt_id,
            "capsule_count": len(capsules),
            "expected_output": {"bytes": source["expected_output_bytes"], "sha256": source["expected_output_sha256"]},
            "initial_message": {"bytes": len(message_raw), "sha256": digest(message_raw), "text": message},
            "model": model,
            "plan": {"bytes": len(plan_raw), "sha256": digest(plan_raw)},
            "reasoning_effort": effort,
            "route": route,
            "row_id": row_id,
            "source_row_sha256": digest(source_raw),
            "task_name": task_name,
            "workdir": str(workdir),
        })
    manifest = {
        "authority": {"canary_launch": True, "matrix_launch": False, "qualification_credit": 0},
        "components": {
            "reader": {"bytes": len(reader_raw), "path": str(READER), "sha256": digest(reader_raw)},
            "skill": {"bytes": len(skill_raw), "path": str(SKILL), "sha256": digest(skill_raw)},
        },
        "experiment_id": EXPERIMENT,
        "failure_policy": "NO_RETRY_NO_RESEND_NO_RELAUNCH_NO_REPLACEMENT_NO_REUSE",
        "qualification": {"clean_full_matrix_streak": 0, "score": "0/2"},
        "rows": manifest_rows,
        "schema_id": "pw-r9-codex-native-goal-turn-pull-canary-manifest-v1",
        "status": "PREPARED_NOT_LAUNCHED",
    }
    manifest_raw = canon(manifest)
    write_new(ROOT / "manifest.json", manifest_raw, 0o444)
    root_fd = os.open(ROOT, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(root_fd)
    finally:
        os.close(root_fd)
    print(canon({"manifest_bytes": len(manifest_raw), "manifest_sha256": digest(manifest_raw), "rows": len(manifest_rows), "status": "PREPARED"}).decode(), end="")


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError) as error:
        print(canon({"error": str(error), "status": "FAIL"}).decode(), end="")
        raise SystemExit(1)
