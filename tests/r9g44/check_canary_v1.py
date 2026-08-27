#!/usr/bin/env python3
import ast
import hashlib
import json
import os
import pathlib
import re
import stat
import subprocess
import sys
import tempfile

BASE = pathlib.Path("/mnt/Cursor/PuppetMaster")
ROOT = BASE / "tests/r9g44/run-canary-001"
READER = BASE / "tests/r9g42/atom_reader_v1.py"
SKILL = BASE / ".agents/skills/r9-goal-receipt-bound-atom-v1/SKILL.md"
TRACE_VERIFIER = BASE / "tests/r9_goal_trace_enforcement_v1/verify_trace_v1.py"
NEGATIVE_OBSERVATION = BASE / "tests/r9g43/canary_001_trace_observation.json"
ROSTER = [("alpha", "slot-alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "slot-bravo", "gpt-5.4-mini", "medium"), ("charlie", "slot-charlie", "gpt-5.6-luna", "medium")]
EXPERIMENT = "r9g44-trace-enforced-self-contained-atom-canary-001"
THREAD = "01900000-0000-7000-8000-000000000044"


class Invalid(Exception):
    pass


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode() + b"\n"


def regular(path, mode):
    info = os.lstat(path)
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode or info.st_uid != os.getuid():
        raise Invalid(f"custody:{path}")
    return pathlib.Path(path).read_bytes()


def load(path, mode):
    raw = regular(path, mode)
    value = json.loads(raw)
    if raw != canon(value):
        raise Invalid(f"canonical:{path}")
    return value, raw


def directory(path):
    info = os.lstat(path)
    if not stat.S_ISDIR(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o700 or info.st_uid != os.getuid():
        raise Invalid(f"directory:{path}")


def inventory(root):
    rows = []
    for path in sorted(root.rglob("*"), key=lambda item: str(item)):
        info = os.lstat(path)
        rel = str(path.relative_to(root))
        if stat.S_ISDIR(info.st_mode):
            rows.append(("d", rel, stat.S_IMODE(info.st_mode), info.st_uid))
        elif stat.S_ISREG(info.st_mode):
            raw = path.read_bytes()
            rows.append(("f", rel, stat.S_IMODE(info.st_mode), info.st_uid, len(raw), digest(raw)))
        else:
            raise Invalid(f"nonregular:{path}")
    return rows


def derive(source_raw, route):
    source = json.loads(source_raw)
    node = source["nodes"][0]
    payload = node["subject_payload"]["utf8"]
    parsed = json.loads(payload)
    if parsed != {"op": "label", "t": "evidence_record_ids", "x": "A-S01"} or len(payload.encode()) != node["subject_payload"]["bytes"] or digest(payload.encode()) != node["subject_payload"]["sha256"]:
        raise Invalid(f"payload:{route}")
    atom = f'Return exactly the JSON string value at key "x" in payload {payload}. Output only that value. This atom is self-contained; do not consult memory, files, web, or any other tool.'.encode()
    return source, node, atom, parsed["x"].encode()


def simulate(atom_raw, plan_raw, reader_raw):
    with tempfile.TemporaryDirectory(prefix="r9g44-check-") as name:
        root = pathlib.Path(name)
        os.chmod(root, 0o700)
        (root / "journal").mkdir(mode=0o700)
        os.chmod(root / "journal", 0o700)
        for leaf, raw, mode in (("atom.py", reader_raw, 0o644), ("atom.txt", atom_raw, 0o444), ("plan.json", plan_raw, 0o444)):
            path = root / leaf
            path.write_bytes(raw)
            os.chmod(path, mode)
        env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
        first = subprocess.run([sys.executable, "-B", "atom.py", THREAD], cwd=root, env=env, capture_output=True, check=False)
        if first.returncode or first.stderr or first.stdout != atom_raw:
            raise Invalid("reader")
        plan = json.loads(plan_raw)
        receipt, _ = load(root / "journal" / "000.json", 0o444)
        if receipt["thread_id"] != THREAD or receipt["attempt_id"] != plan["attempt_id"] or receipt["atom_sha256"] != digest(atom_raw):
            raise Invalid("reader-receipt")
        before = inventory(root)
        second = subprocess.run([sys.executable, "-B", "atom.py", THREAD], cwd=root, env=env, capture_output=True, check=False)
        if second.returncode == 0 or second.stdout or second.stderr or inventory(root) != before:
            raise Invalid("reader-reuse")


def main():
    if len(sys.argv) != 3 or sys.argv[1] != "--check" or pathlib.Path(sys.argv[2]).resolve() != ROOT:
        raise Invalid("cli")
    directory(ROOT)
    directory(ROOT / "rows")
    before = inventory(ROOT)
    manifest, manifest_raw = load(ROOT / "manifest.json", 0o444)
    if set(manifest) != {"authority", "components", "experiment_id", "failure_policy", "lifecycle", "postrun_gate", "qualification", "rows", "schema_id", "status"}:
        raise Invalid("manifest-shape")
    if manifest["schema_id"] != "pw-r9-codex-native-goal-trace-enforced-atom-canary-manifest-v1" or manifest["status"] != "PREPARED_NOT_LAUNCHED" or manifest["experiment_id"] != EXPERIMENT:
        raise Invalid("manifest")
    if manifest["authority"] != {"canary_launch": True, "matrix_launch": False, "qualification_credit": 0} or manifest["qualification"] != {"clean_full_matrix_streak": 0, "score": "0/2"}:
        raise Invalid("authority")
    if manifest["failure_policy"] != "NO_RETRY_NO_RESEND_NO_RELAUNCH_NO_REPLACEMENT_NO_REUSE" or manifest["lifecycle"] != "STANDALONE_GOAL_RECEIPT_ONE_SELF_CONTAINED_ATOM_CLOSED_POSTRUN_TRACE_GRAMMAR" or manifest["postrun_gate"] != "TRACE_VERIFIER_PASS_REQUIRED":
        raise Invalid("lifecycle")
    if [(r["route"], r["model"], r["reasoning_effort"]) for r in manifest["rows"]] != [(route, model, effort) for route, _, model, effort in ROSTER]:
        raise Invalid("roster")
    if len({r["task_name"] for r in manifest["rows"]}) != 3 or len({r["attempt_id"] for r in manifest["rows"]}) != 3:
        raise Invalid("freshness")
    reader_raw = regular(READER, 0o644)
    skill_raw = regular(SKILL, 0o644)
    verifier_raw = regular(TRACE_VERIFIER, 0o644)
    ast.parse(reader_raw, filename=str(READER))
    ast.parse(verifier_raw, filename=str(TRACE_VERIFIER))
    if manifest["components"] != {"reader": {"bytes": len(reader_raw), "sha256": digest(reader_raw)}, "skill": {"bytes": len(skill_raw), "sha256": digest(skill_raw)}, "trace_verifier": {"bytes": len(verifier_raw), "sha256": digest(verifier_raw)}}:
        raise Invalid("component-binding")
    negative = subprocess.run([sys.executable, "-B", str(TRACE_VERIFIER), "--observation", str(NEGATIVE_OBSERVATION)], cwd=BASE, env=dict(os.environ, PYTHONDONTWRITEBYTECODE="1"), capture_output=True, check=False)
    expected_negative = canon({"first_mismatch": "alpha:tool-sequence:SKILL_READ,CREATE_GOAL,ATOM_READER,OTHER_EXEC,OTHER_EXEC,UPDATE_GOAL", "status": "FAIL", "workspace_writes": 0})
    if negative.returncode != 1 or negative.stdout != expected_negative or negative.stderr:
        raise Invalid("trace-negative-control")
    for row, (route, slot, model, effort) in zip(manifest["rows"], ROSTER):
        workdir = pathlib.Path(row["workdir"])
        if workdir != ROOT / "rows" / route:
            raise Invalid(f"workdir:{route}")
        directory(workdir)
        directory(workdir / "journal")
        if list((workdir / "journal").iterdir()) or regular(workdir / "atom.py", 0o644) != reader_raw:
            raise Invalid(f"prepared:{route}")
        atom_raw = regular(workdir / "atom.txt", 0o444)
        plan, plan_raw = load(workdir / "plan.json", 0o444)
        source_path = pathlib.Path(row["source_node"]["path"])
        expected_path = BASE / f"tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-000/{slot}.json"
        if source_path != expected_path:
            raise Invalid(f"source-path:{route}")
        source_raw = regular(source_path, 0o644)
        source, node, expected_atom, expected_answer = derive(source_raw, route)
        source_id = {"atom_id": "n00000", "bytes": len(source_raw), "path": str(source_path), "sha256": digest(source_raw)}
        if row["source_node"] != source_id or plan["source_node"] != source_id or source["route"] != slot or source["model_requested"] != model or source["reasoning_effort_requested"] != effort:
            raise Invalid(f"source:{route}")
        atom_id = {"bytes": len(atom_raw), "sha256": digest(atom_raw)}
        answer_id = {"bytes": len(expected_answer), "sha256": digest(expected_answer), "utf8": expected_answer.decode()}
        if atom_raw != expected_atom or len(atom_raw) > 512 or row["atom"] != atom_id or plan["atom"] != atom_id or row["expected_answer"] != answer_id or plan["expected_answer"] != answer_id:
            raise Invalid(f"atom:{route}")
        for token in (b"self-contained", b"do not consult memory", b"Output only that value"):
            if token not in atom_raw:
                raise Invalid(f"atom-isolation:{route}")
        seed = f"{EXPERIMENT}|{route}|{digest(source_raw)}|{node['atom_id']}".encode()
        task = "r9_gte1_" + digest(seed)
        attempt = digest(b"attempt|" + seed)[:24]
        objective_text = f"R9 trace-enforced atom;run={EXPERIMENT};route={route};atom={digest(atom_raw)};no-retry."
        objective_raw = objective_text.encode()
        objective = {"bytes": len(objective_raw), "sha256": digest(objective_raw), "text": objective_text}
        if row["task_name"] != task or plan["task_name"] != task or not re.fullmatch(r"r9_gte1_[0-9a-f]{64}", task) or row["attempt_id"] != attempt or plan["attempt_id"] != attempt or row["objective"] != objective or plan["objective"] != objective:
            raise Invalid(f"identity:{route}")
        message = f'Use $r9-goal-receipt-bound-atom-v1 only. Goal objective: "{objective_text}" Atom-reader workdir: {workdir}. Follow that skill exactly.'
        message_raw = message.encode()
        if row["initial_message"] != {"bytes": len(message_raw), "sha256": digest(message_raw), "text": message} or len(message_raw) > 512 or atom_raw in message_raw or node["subject_payload"]["utf8"].encode() in message_raw:
            raise Invalid(f"message:{route}")
        simulate(atom_raw, plan_raw, reader_raw)
    if inventory(ROOT) != before:
        raise Invalid("workspace-write")
    sys.stdout.buffer.write(canon({"assertion_count": 78, "manifest_bytes": len(manifest_raw), "manifest_sha256": digest(manifest_raw), "mutation_count": 7, "status": "PASS_STATIC_ZERO_CREDIT_ZERO_WORKTREE_WRITES"}))


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError) as error:
        sys.stdout.buffer.write(canon({"first_mismatch": str(error), "status": "FAIL"}))
        raise SystemExit(1)
