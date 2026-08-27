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
ROOT = BASE / "tests/r9g42/run-canary-001"
READER = BASE / "tests/r9g42/atom_reader_v1.py"
SKILL = BASE / ".agents/skills/r9-goal-single-turn-atom-v1/SKILL.md"
ROSTER = [("alpha", "slot-alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "slot-bravo", "gpt-5.4-mini", "medium"), ("charlie", "slot-charlie", "gpt-5.6-luna", "medium")]
EXPERIMENT = "r9g42-goal-single-turn-atom-canary-001"
THREAD = "01900000-0000-7000-8000-000000000042"


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
    out = []
    for path in sorted(root.rglob("*"), key=lambda item: str(item)):
        info = os.lstat(path)
        rel = str(path.relative_to(root))
        if stat.S_ISDIR(info.st_mode):
            out.append(("d", rel, stat.S_IMODE(info.st_mode), info.st_uid))
        elif stat.S_ISREG(info.st_mode):
            raw = path.read_bytes()
            out.append(("f", rel, stat.S_IMODE(info.st_mode), info.st_uid, len(raw), digest(raw)))
        else:
            raise Invalid(f"nonregular:{path}")
    return out


def derive(source_raw, route):
    source = json.loads(source_raw)
    node = source["nodes"][0]
    payload = node["subject_payload"]["utf8"]
    if len(payload.encode()) != node["subject_payload"]["bytes"] or digest(payload.encode()) != node["subject_payload"]["sha256"]:
        raise Invalid(f"payload:{route}")
    parsed = json.loads(payload)
    if parsed != {"op": "label", "t": "evidence_record_ids", "x": "A-S01"}:
        raise Invalid(f"payload-value:{route}")
    atom = f'Apply criterion "{node["acceptance_criterion"]["utf8"]}" to payload {payload}. Required output: {node["output_contract"]["utf8"]}'.encode()
    return source, node, atom, parsed["x"].encode()


def simulate(atom_raw, plan_raw, reader_raw):
    with tempfile.TemporaryDirectory(prefix="r9g42-check-") as name:
        root = pathlib.Path(name)
        os.chmod(root, 0o700)
        (root / "journal").mkdir(mode=0o700)
        os.chmod(root / "journal", 0o700)
        for leaf, raw, mode in (("atom.py", reader_raw, 0o644), ("atom.txt", atom_raw, 0o444), ("plan.json", plan_raw, 0o444)):
            path = root / leaf
            path.write_bytes(raw)
            os.chmod(path, mode)
        env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
        bad = subprocess.run([sys.executable, "-B", "atom.py", "not-a-thread"], cwd=root, env=env, capture_output=True, check=False)
        if bad.returncode == 0 or bad.stdout or bad.stderr or list((root / "journal").iterdir()):
            raise Invalid("wrong-thread")
        first = subprocess.run([sys.executable, "-B", "atom.py", THREAD], cwd=root, env=env, capture_output=True, check=False)
        if first.returncode or first.stderr or first.stdout != atom_raw:
            raise Invalid("first-read")
        plan = json.loads(plan_raw)
        receipt, _ = load(root / "journal" / "000.json", 0o444)
        if receipt != {"atom_bytes": len(atom_raw), "atom_sha256": digest(atom_raw), "attempt_id": plan["attempt_id"], "schema_id": "pw-r9-codex-native-goal-single-turn-atom-release-v1", "thread_id": THREAD}:
            raise Invalid("receipt")
        before = inventory(root)
        second = subprocess.run([sys.executable, "-B", "atom.py", THREAD], cwd=root, env=env, capture_output=True, check=False)
        if second.returncode == 0 or second.stdout or second.stderr or inventory(root) != before:
            raise Invalid("reuse")


def main():
    if len(sys.argv) != 3 or sys.argv[1] != "--check" or pathlib.Path(sys.argv[2]).resolve() != ROOT:
        raise Invalid("cli")
    directory(ROOT)
    directory(ROOT / "rows")
    before = inventory(ROOT)
    manifest, manifest_raw = load(ROOT / "manifest.json", 0o444)
    if set(manifest) != {"authority", "components", "experiment_id", "failure_policy", "lifecycle", "qualification", "rows", "schema_id", "status"}:
        raise Invalid("manifest-shape")
    if manifest["schema_id"] != "pw-r9-codex-native-goal-single-turn-atom-canary-manifest-v1" or manifest["status"] != "PREPARED_NOT_LAUNCHED" or manifest["experiment_id"] != EXPERIMENT:
        raise Invalid("manifest")
    if manifest["authority"] != {"canary_launch": True, "matrix_launch": False, "qualification_credit": 0} or manifest["qualification"] != {"clean_full_matrix_streak": 0, "score": "0/2"}:
        raise Invalid("authority")
    if manifest["failure_policy"] != "NO_RETRY_NO_RESEND_NO_RELAUNCH_NO_REPLACEMENT_NO_REUSE" or manifest["lifecycle"] != "CREATE_GOAL_ACTIVE_THEN_ONE_READER_THEN_UPDATE_GOAL_COMPLETE_IN_SAME_MODEL_TURN":
        raise Invalid("lifecycle")
    if [(row["route"], row["model"], row["reasoning_effort"]) for row in manifest["rows"]] != [(route, model, effort) for route, _, model, effort in ROSTER]:
        raise Invalid("roster")
    if len({row["task_name"] for row in manifest["rows"]}) != 3 or len({row["attempt_id"] for row in manifest["rows"]}) != 3:
        raise Invalid("freshness")

    reader_raw = regular(READER, 0o644)
    skill_raw = regular(SKILL, 0o644)
    ast.parse(reader_raw, filename=str(READER))
    text = reader_raw.decode()
    if text.count("sys.stdout.buffer.write") != 1 or text.index("publish(\"journal/000.json\"") > text.index("sys.stdout.buffer.write"):
        raise Invalid("publish-order")
    if manifest["components"] != {"reader": {"bytes": len(reader_raw), "sha256": digest(reader_raw)}, "skill": {"bytes": len(skill_raw), "sha256": digest(skill_raw)}}:
        raise Invalid("component-binding")
    skill_text = skill_raw.decode()
    for required in ("Call `create_goal` exactly once", "In this same model turn", "Call `update_goal({status:\"complete\"})` exactly once before answering", "Do not call `get_goal`"):
        if required not in skill_text:
            raise Invalid("skill-contract")
    if "automatic Goal continuation" in skill_text:
        raise Invalid("old-phase-family")

    for row, (route, slot, model, effort) in zip(manifest["rows"], ROSTER):
        if set(row) != {"atom", "attempt_id", "expected_answer", "initial_message", "model", "objective", "reasoning_effort", "route", "source_node", "task_name", "workdir"}:
            raise Invalid(f"row-shape:{route}")
        workdir = pathlib.Path(row["workdir"])
        if workdir != ROOT / "rows" / route:
            raise Invalid(f"workdir:{route}")
        directory(workdir)
        directory(workdir / "journal")
        if list((workdir / "journal").iterdir()):
            raise Invalid(f"consumed:{route}")
        if regular(workdir / "atom.py", 0o644) != reader_raw:
            raise Invalid(f"reader-copy:{route}")
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
            raise Invalid(f"source-binding:{route}")
        if atom_raw != expected_atom or len(atom_raw) > 512 or any(token in atom_raw for token in (b"create_goal", b"update_goal", b"Goal Mode")):
            raise Invalid(f"atom:{route}")
        atom_id = {"bytes": len(atom_raw), "sha256": digest(atom_raw)}
        answer_id = {"bytes": len(expected_answer), "sha256": digest(expected_answer), "utf8": expected_answer.decode()}
        if row["atom"] != atom_id or plan["atom"] != atom_id or row["expected_answer"] != answer_id or plan["expected_answer"] != answer_id:
            raise Invalid(f"atom-binding:{route}")
        seed = f"{EXPERIMENT}|{route}|{digest(source_raw)}|{node['atom_id']}".encode()
        task_name = "r9_gst1_" + digest(seed)
        attempt_id = digest(b"attempt|" + seed)[:24]
        objective_text = f"R9 single-turn atom;run={EXPERIMENT};route={route};atom={digest(atom_raw)};no-retry."
        objective_raw = objective_text.encode()
        objective = {"bytes": len(objective_raw), "sha256": digest(objective_raw), "text": objective_text}
        if row["task_name"] != task_name or plan["task_name"] != task_name or not re.fullmatch(r"r9_gst1_[0-9a-f]{64}", task_name) or row["attempt_id"] != attempt_id or plan["attempt_id"] != attempt_id or row["objective"] != objective or plan["objective"] != objective:
            raise Invalid(f"identity:{route}")
        if plan["schema_id"] != "pw-r9-codex-native-goal-single-turn-atom-plan-v1" or set(plan) != {"atom", "attempt_id", "expected_answer", "objective", "schema_id", "source_node", "task_name"}:
            raise Invalid(f"plan:{route}")
        message = f'Use $r9-goal-single-turn-atom-v1 only. Goal objective: "{objective_text}" Atom-reader workdir: {workdir}. Follow that skill exactly.'
        message_raw = message.encode()
        if row["initial_message"] != {"bytes": len(message_raw), "sha256": digest(message_raw), "text": message} or len(message_raw) > 512 or atom_raw in message_raw or node["subject_payload"]["utf8"].encode() in message_raw:
            raise Invalid(f"pregoal-message:{route}")
        simulate(atom_raw, plan_raw, reader_raw)

    if inventory(ROOT) != before:
        raise Invalid("workspace-write")
    sys.stdout.buffer.write(canon({"assertion_count": 70, "manifest_bytes": len(manifest_raw), "manifest_sha256": digest(manifest_raw), "mutation_count": 6, "status": "PASS_STATIC_ZERO_CREDIT_ZERO_WORKTREE_WRITES"}))


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError) as error:
        sys.stdout.buffer.write(canon({"first_mismatch": str(error), "status": "FAIL"}))
        raise SystemExit(1)
