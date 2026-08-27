#!/usr/bin/env python3
import hashlib
import json
import os
import pathlib
import stat

BASE = pathlib.Path("/mnt/Cursor/PuppetMaster")
PUBLIC = BASE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-000"
ROOT = BASE / "tests/r9g44/run-canary-001"
READER = BASE / "tests/r9g42/atom_reader_v1.py"
SKILL = BASE / ".agents/skills/r9-goal-receipt-bound-atom-v1/SKILL.md"
TRACE_VERIFIER = BASE / "tests/r9_goal_trace_enforcement_v1/verify_trace_v1.py"
ROWS = [("alpha", "slot-alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "slot-bravo", "gpt-5.4-mini", "medium"), ("charlie", "slot-charlie", "gpt-5.6-luna", "medium")]
EXPERIMENT = "r9g44-trace-enforced-self-contained-atom-canary-001"


class Invalid(Exception):
    pass


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode() + b"\n"


def mkdir_new(path):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    info = os.lstat(path)
    if not stat.S_ISDIR(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o700 or info.st_uid != os.getuid():
        raise Invalid("directory")


def write_new(path, raw, mode):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), mode)
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
    info = os.lstat(path)
    if pathlib.Path(path).read_bytes() != raw or not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode:
        raise Invalid("reopen")


def main():
    if ROOT.exists() or ROOT.is_symlink():
        raise Invalid("root-exists")
    reader_raw = READER.read_bytes()
    skill_raw = SKILL.read_bytes()
    trace_verifier_raw = TRACE_VERIFIER.read_bytes()
    mkdir_new(ROOT)
    mkdir_new(ROOT / "rows")
    rows = []
    for route, source_route, model, effort in ROWS:
        source_path = PUBLIC / f"{source_route}.json"
        source_raw = source_path.read_bytes()
        source = json.loads(source_raw)
        node = source["nodes"][0]
        if source["route"] != source_route or source["model_requested"] != model or source["reasoning_effort_requested"] != effort:
            raise Invalid("roster")
        payload = node["subject_payload"]["utf8"]
        parsed = json.loads(payload)
        if parsed != {"op": "label", "t": "evidence_record_ids", "x": "A-S01"} or len(payload.encode()) != node["subject_payload"]["bytes"] or digest(payload.encode()) != node["subject_payload"]["sha256"]:
            raise Invalid("payload")
        atom_raw = f'Return exactly the JSON string value at key "x" in payload {payload}. Output only that value. This atom is self-contained; do not consult memory, files, web, or any other tool.'.encode()
        if len(atom_raw) > 512:
            raise Invalid("atom")
        expected_raw = parsed["x"].encode()
        seed = f"{EXPERIMENT}|{route}|{digest(source_raw)}|{node['atom_id']}".encode()
        task_name = "r9_gte1_" + digest(seed)
        attempt_id = digest(b"attempt|" + seed)[:24]
        objective = f"R9 trace-enforced atom;run={EXPERIMENT};route={route};atom={digest(atom_raw)};no-retry."
        objective_raw = objective.encode()
        workdir = ROOT / "rows" / route
        mkdir_new(workdir)
        mkdir_new(workdir / "journal")
        write_new(workdir / "atom.py", reader_raw, 0o644)
        write_new(workdir / "atom.txt", atom_raw, 0o444)
        plan = {"atom": {"bytes": len(atom_raw), "sha256": digest(atom_raw)}, "attempt_id": attempt_id, "expected_answer": {"bytes": len(expected_raw), "sha256": digest(expected_raw), "utf8": expected_raw.decode()}, "objective": {"bytes": len(objective_raw), "sha256": digest(objective_raw), "text": objective}, "schema_id": "pw-r9-codex-native-goal-single-turn-atom-plan-v1", "source_node": {"atom_id": node["atom_id"], "bytes": len(source_raw), "path": str(source_path), "sha256": digest(source_raw)}, "task_name": task_name}
        write_new(workdir / "plan.json", canon(plan), 0o444)
        message = f'Use $r9-goal-receipt-bound-atom-v1 only. Goal objective: "{objective}" Atom-reader workdir: {workdir}. Follow that skill exactly.'
        message_raw = message.encode()
        if len(message_raw) > 512 or atom_raw in message_raw or payload.encode() in message_raw:
            raise Invalid("message")
        rows.append({"atom": plan["atom"], "attempt_id": attempt_id, "expected_answer": plan["expected_answer"], "initial_message": {"bytes": len(message_raw), "sha256": digest(message_raw), "text": message}, "model": model, "objective": plan["objective"], "reasoning_effort": effort, "route": route, "source_node": plan["source_node"], "task_name": task_name, "workdir": str(workdir)})
    manifest = {"authority": {"canary_launch": True, "matrix_launch": False, "qualification_credit": 0}, "components": {"reader": {"bytes": len(reader_raw), "sha256": digest(reader_raw)}, "skill": {"bytes": len(skill_raw), "sha256": digest(skill_raw)}, "trace_verifier": {"bytes": len(trace_verifier_raw), "sha256": digest(trace_verifier_raw)}}, "experiment_id": EXPERIMENT, "failure_policy": "NO_RETRY_NO_RESEND_NO_RELAUNCH_NO_REPLACEMENT_NO_REUSE", "lifecycle": "STANDALONE_GOAL_RECEIPT_ONE_SELF_CONTAINED_ATOM_CLOSED_POSTRUN_TRACE_GRAMMAR", "postrun_gate": "TRACE_VERIFIER_PASS_REQUIRED", "qualification": {"clean_full_matrix_streak": 0, "score": "0/2"}, "rows": rows, "schema_id": "pw-r9-codex-native-goal-trace-enforced-atom-canary-manifest-v1", "status": "PREPARED_NOT_LAUNCHED"}
    manifest_raw = canon(manifest)
    write_new(ROOT / "manifest.json", manifest_raw, 0o444)
    parent = os.open(ROOT, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(parent)
    finally:
        os.close(parent)
    print(canon({"atom_max_bytes": max(row["atom"]["bytes"] for row in rows), "manifest_bytes": len(manifest_raw), "manifest_sha256": digest(manifest_raw), "rows": 3, "status": "PREPARED"}).decode(), end="")


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError) as error:
        print(canon({"error": str(error), "status": "FAIL"}).decode(), end="")
        raise SystemExit(1)
