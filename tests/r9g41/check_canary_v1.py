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
ROOT = BASE / "tests/r9g41/run-canary-001"
READER = BASE / "tests/r9g41/atom_reader_v1.py"
SKILL = BASE / ".agents/skills/r9-goal-terminal-atom-v1/SKILL.md"
ROSTER = [
    ("alpha", "slot-alpha", "gpt-5.4-mini", "xhigh"),
    ("bravo", "slot-bravo", "gpt-5.4-mini", "medium"),
    ("charlie", "slot-charlie", "gpt-5.6-luna", "medium"),
]
EXPERIMENT = "r9g41-goal-terminal-atom-canary-001"
THREAD = "01900000-0000-7000-8000-000000000041"


class Invalid(Exception):
    pass


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode() + b"\n"


def load_json(path, mode):
    info = os.lstat(path)
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode or info.st_uid != os.getuid():
        raise Invalid(f"custody:{path}")
    raw = pathlib.Path(path).read_bytes()
    value = json.loads(raw)
    if raw != canon(value):
        raise Invalid(f"canonical:{path}")
    return value, raw


def read_regular(path, mode):
    info = os.lstat(path)
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode or info.st_uid != os.getuid():
        raise Invalid(f"custody:{path}")
    return pathlib.Path(path).read_bytes()


def check_dir(path):
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
    criterion = node["acceptance_criterion"]["utf8"]
    output = node["output_contract"]["utf8"]
    if len(payload.encode()) != node["subject_payload"]["bytes"] or digest(payload.encode()) != node["subject_payload"]["sha256"]:
        raise Invalid(f"payload:{route}")
    atom = f'While this Goal is active, apply criterion "{criterion}" to payload {payload}. Required output: {output} Call update_goal with status "complete"; after its COMPLETE tool receipt return only the extracted value.'.encode()
    parsed_payload = json.loads(payload)
    if parsed_payload != {"op": "label", "t": "evidence_record_ids", "x": "A-S01"}:
        raise Invalid(f"source-payload:{route}")
    expected = parsed_payload["x"].encode()
    return source, node, atom, expected


def simulate(atom_raw, plan_raw, reader_raw):
    with tempfile.TemporaryDirectory(prefix="r9g41-check-") as name:
        root = pathlib.Path(name)
        os.chmod(root, 0o700)
        (root / "journal").mkdir(mode=0o700)
        os.chmod(root / "journal", 0o700)
        for name, raw, mode in (("atom.py", reader_raw, 0o644), ("atom.txt", atom_raw, 0o444), ("plan.json", plan_raw, 0o444)):
            path = root / name
            path.write_bytes(raw)
            os.chmod(path, mode)
        env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
        wrong = subprocess.run([sys.executable, "-B", "atom.py", "not-a-thread"], cwd=root, env=env, capture_output=True, check=False)
        if wrong.returncode == 0 or wrong.stdout or wrong.stderr or list((root / "journal").iterdir()):
            raise Invalid("wrong-thread-not-closed")
        first = subprocess.run([sys.executable, "-B", "atom.py", THREAD], cwd=root, env=env, capture_output=True, check=False)
        if first.returncode or first.stderr or first.stdout != atom_raw:
            raise Invalid("reader-first")
        receipt, _ = load_json(root / "journal" / "000.json", 0o444)
        plan = json.loads(plan_raw)
        if receipt != {"atom_bytes": len(atom_raw), "atom_sha256": digest(atom_raw), "attempt_id": plan["attempt_id"], "schema_id": "pw-r9-codex-native-goal-terminal-atom-release-v1", "thread_id": THREAD}:
            raise Invalid("reader-receipt")
        before = inventory(root)
        second = subprocess.run([sys.executable, "-B", "atom.py", THREAD], cwd=root, env=env, capture_output=True, check=False)
        if second.returncode == 0 or second.stdout or second.stderr or inventory(root) != before:
            raise Invalid("reader-reuse-not-closed")


def main():
    if len(sys.argv) != 3 or sys.argv[1] != "--check" or pathlib.Path(sys.argv[2]).resolve() != ROOT:
        raise Invalid("cli")
    check_dir(ROOT)
    check_dir(ROOT / "rows")
    before = inventory(ROOT)
    manifest, manifest_raw = load_json(ROOT / "manifest.json", 0o444)
    if set(manifest) != {"authority", "components", "experiment_id", "failure_policy", "qualification", "rows", "schema_id", "status"}:
        raise Invalid("manifest-shape")
    if manifest["schema_id"] != "pw-r9-codex-native-goal-terminal-atom-canary-manifest-v1" or manifest["status"] != "PREPARED_NOT_LAUNCHED" or manifest["experiment_id"] != EXPERIMENT:
        raise Invalid("manifest")
    if manifest["authority"] != {"canary_launch": True, "matrix_launch": False, "qualification_credit": 0} or manifest["qualification"] != {"clean_full_matrix_streak": 0, "score": "0/2"}:
        raise Invalid("authority")
    if manifest["failure_policy"] != "NO_RETRY_NO_RESEND_NO_RELAUNCH_NO_REPLACEMENT_NO_REUSE":
        raise Invalid("failure-policy")
    roster = [(row["route"], row["model"], row["reasoning_effort"]) for row in manifest["rows"]]
    if roster != [(route, model, effort) for route, _, model, effort in ROSTER]:
        raise Invalid("roster")
    if len({row["task_name"] for row in manifest["rows"]}) != 3 or len({row["attempt_id"] for row in manifest["rows"]}) != 3:
        raise Invalid("freshness")

    reader_raw = read_regular(READER, 0o644)
    skill_raw = read_regular(SKILL, 0o644)
    ast.parse(reader_raw, filename=str(READER))
    reader_text = reader_raw.decode()
    if reader_text.count("sys.stdout.buffer.write") != 1 or reader_text.index("publish(\"journal/000.json\"") > reader_text.index("sys.stdout.buffer.write"):
        raise Invalid("publish-order")
    if manifest["components"] != {"reader": {"bytes": len(reader_raw), "sha256": digest(reader_raw)}, "skill": {"bytes": len(skill_raw), "sha256": digest(skill_raw)}}:
        raise Invalid("component-binding")
    skill_text = skill_raw.decode()
    for required in ("Call `create_goal` exactly once", "call `get_goal` once", "Call `update_goal({status:\"complete\"})` exactly once before returning", "Never call the reader twice"):
        if required not in skill_text:
            raise Invalid("skill-contract")

    for row, (route, slot, model, effort) in zip(manifest["rows"], ROSTER):
        if set(row) != {"atom", "attempt_id", "expected_answer", "initial_message", "model", "objective", "reasoning_effort", "route", "source_node", "task_name", "workdir"}:
            raise Invalid(f"row-shape:{route}")
        if (row["route"], row["model"], row["reasoning_effort"]) != (route, model, effort):
            raise Invalid(f"row-roster:{route}")
        workdir = pathlib.Path(row["workdir"])
        if workdir != ROOT / "rows" / route:
            raise Invalid(f"workdir:{route}")
        check_dir(workdir)
        check_dir(workdir / "journal")
        if list((workdir / "journal").iterdir()):
            raise Invalid(f"journal-not-empty:{route}")
        if read_regular(workdir / "atom.py", 0o644) != reader_raw:
            raise Invalid(f"reader-copy:{route}")
        atom_raw = read_regular(workdir / "atom.txt", 0o444)
        plan, plan_raw = load_json(workdir / "plan.json", 0o444)
        if set(plan) != {"atom", "attempt_id", "expected_answer", "objective", "schema_id", "source_node", "task_name"} or plan["schema_id"] != "pw-r9-codex-native-goal-terminal-atom-plan-v1":
            raise Invalid(f"plan-shape:{route}")
        source_path = pathlib.Path(row["source_node"]["path"])
        expected_path = BASE / f"tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-000/{slot}.json"
        if source_path != expected_path:
            raise Invalid(f"source-path:{route}")
        source_raw = read_regular(source_path, 0o644)
        if row["source_node"] != {"atom_id": "n00000", "bytes": len(source_raw), "path": str(source_path), "sha256": digest(source_raw)}:
            raise Invalid(f"source-binding:{route}")
        source, node, expected_atom, expected_answer = derive(source_raw, route)
        if source["route"] != slot or source["model_requested"] != model or source["reasoning_effort_requested"] != effort or node["atom_id"] != "n00000":
            raise Invalid(f"source-roster:{route}")
        if atom_raw != expected_atom or len(atom_raw) > 512 or row["atom"] != {"bytes": len(atom_raw), "sha256": digest(atom_raw)} or plan["atom"] != row["atom"]:
            raise Invalid(f"atom:{route}")
        expected_record = {"bytes": len(expected_answer), "sha256": digest(expected_answer), "utf8": expected_answer.decode()}
        if row["expected_answer"] != expected_record or plan["expected_answer"] != expected_record:
            raise Invalid(f"answer:{route}")
        seed = f"{EXPERIMENT}|{route}|{digest(source_raw)}|{node['atom_id']}".encode()
        expected_task = "r9_gta1_" + digest(seed)
        expected_attempt = digest(b"attempt|" + seed)[:24]
        expected_objective = f"R9 terminal atom;run={EXPERIMENT};route={route};atom={digest(atom_raw)};no-retry."
        objective_raw = expected_objective.encode()
        if row["task_name"] != expected_task or plan["task_name"] != expected_task or not re.fullmatch(r"r9_gta1_[0-9a-f]{64}", expected_task):
            raise Invalid(f"task-name:{route}")
        if row["attempt_id"] != expected_attempt or plan["attempt_id"] != expected_attempt:
            raise Invalid(f"attempt:{route}")
        objective = {"bytes": len(objective_raw), "sha256": digest(objective_raw), "text": expected_objective}
        if row["objective"] != objective or plan["objective"] != objective:
            raise Invalid(f"objective:{route}")
        expected_message = f'Use $r9-goal-terminal-atom-v1 only. Goal objective: "{expected_objective}" Atom-reader workdir: {workdir}. Follow that skill exactly.'
        message_raw = expected_message.encode()
        if row["initial_message"] != {"bytes": len(message_raw), "sha256": digest(message_raw), "text": expected_message} or len(message_raw) > 512:
            raise Invalid(f"message:{route}")
        if atom_raw in message_raw or node["subject_payload"]["utf8"].encode() in message_raw:
            raise Invalid(f"pregoal-subject:{route}")
        if plan["source_node"] != row["source_node"]:
            raise Invalid(f"plan-source:{route}")
        simulate(atom_raw, plan_raw, reader_raw)

    if inventory(ROOT) != before:
        raise Invalid("workspace-write")
    sys.stdout.buffer.write(canon({"assertion_count": 67, "manifest_bytes": len(manifest_raw), "manifest_sha256": digest(manifest_raw), "mutation_count": 6, "status": "PASS_STATIC_ZERO_CREDIT_ZERO_WORKTREE_WRITES"}))


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError) as error:
        sys.stdout.buffer.write(canon({"first_mismatch": str(error), "status": "FAIL"}))
        raise SystemExit(1)
