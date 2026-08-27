#!/usr/bin/env python3
import ast
import hashlib
import json
import os
import pathlib
import shutil
import stat
import subprocess
import sys
import tempfile

BASE = pathlib.Path("/mnt/Cursor/PuppetMaster")
EXPECTED_ROOT = BASE / "tests/r9g40/run-canary-001"
EXPECTED_ROSTER = [("alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "gpt-5.4-mini", "medium"), ("charlie", "gpt-5.6-luna", "medium")]


class Invalid(Exception):
    pass


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode() + b"\n"


def load(path, mode):
    info = os.lstat(path)
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode or info.st_uid != os.getuid():
        raise Invalid(f"custody:{path}")
    raw = pathlib.Path(path).read_bytes()
    value = json.loads(raw)
    if raw != canon(value):
        raise Invalid(f"canonical:{path}")
    return value, raw


def check_dir(path):
    info = os.lstat(path)
    if not stat.S_ISDIR(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o700 or info.st_uid != os.getuid():
        raise Invalid(f"directory:{path}")


def simulate(row, plan_raw, reader_raw):
    fake_thread = "01900000-0000-7000-8000-" + digest(row["task_name"].encode())[:12]
    wrong_thread = "01900000-0000-7000-8000-ffffffffffff"
    with tempfile.TemporaryDirectory(prefix="r9g40-check-") as name:
        root = pathlib.Path(name)
        os.chmod(root, 0o700)
        (root / "journal").mkdir(mode=0o700)
        os.chmod(root / "journal", 0o700)
        (root / "turn.py").write_bytes(reader_raw)
        (root / "plan.json").write_bytes(plan_raw)
        os.chmod(root / "turn.py", 0o644)
        os.chmod(root / "plan.json", 0o444)
        env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
        plan = json.loads(plan_raw)
        for index, capsule in enumerate(plan["capsules"]):
            if index == 1:
                before = sorted((root / "journal").iterdir())
                wrong = subprocess.run([sys.executable, "-B", "turn.py", wrong_thread], cwd=root, env=env, capture_output=True, check=False)
                if wrong.returncode == 0 or wrong.stdout or sorted((root / "journal").iterdir()) != before:
                    raise Invalid("wrong-thread-not-closed")
            result = subprocess.run([sys.executable, "-B", "turn.py", fake_thread], cwd=root, env=env, capture_output=True, check=False)
            if result.returncode or result.stderr or result.stdout != capsule["text"].encode():
                raise Invalid(f"reader-output:{row['row_id']}:{index}")
            receipt, _ = load(root / "journal" / f"{index:03d}.json", 0o444)
            if receipt["thread_id"] != fake_thread or receipt["capsule_sha256"] != capsule["sha256"] or receipt["capsule_index"] != index:
                raise Invalid("receipt")
        before = sorted((root / "journal").iterdir())
        exhausted = subprocess.run([sys.executable, "-B", "turn.py", fake_thread], cwd=root, env=env, capture_output=True, check=False)
        if exhausted.returncode == 0 or exhausted.stdout or sorted((root / "journal").iterdir()) != before:
            raise Invalid("exhausted-not-closed")


def main():
    if len(sys.argv) != 3 or sys.argv[1] != "--check" or pathlib.Path(sys.argv[2]).resolve() != EXPECTED_ROOT:
        raise Invalid("cli")
    root = EXPECTED_ROOT
    check_dir(root)
    check_dir(root / "rows")
    manifest, manifest_raw = load(root / "manifest.json", 0o444)
    if manifest["schema_id"] != "pw-r9-codex-native-goal-turn-pull-canary-manifest-v1" or manifest["status"] != "PREPARED_NOT_LAUNCHED":
        raise Invalid("manifest")
    if manifest["authority"] != {"canary_launch": True, "matrix_launch": False, "qualification_credit": 0}:
        raise Invalid("authority")
    roster = [(row["route"], row["model"], row["reasoning_effort"]) for row in manifest["rows"]]
    if roster != EXPECTED_ROSTER or len({row["task_name"] for row in manifest["rows"]}) != 3:
        raise Invalid("roster")
    reader_path = BASE / "tests/r9g40/turn_reader_v1.py"
    reader_raw = reader_path.read_bytes()
    ast.parse(reader_raw, filename=str(reader_path))
    source_text = reader_raw.decode()
    if source_text.count("sys.stdout.buffer.write") != 1 or source_text.index("publish(f\"journal/") > source_text.index("sys.stdout.buffer.write"):
        raise Invalid("publish-order")
    if digest(reader_raw) != manifest["components"]["reader"]["sha256"] or len(reader_raw) != manifest["components"]["reader"]["bytes"]:
        raise Invalid("reader-binding")
    skill_path = BASE / ".agents/skills/r9-goal-turn-pull-v1/SKILL.md"
    skill_raw = skill_path.read_bytes()
    if digest(skill_raw) != manifest["components"]["skill"]["sha256"] or len(skill_raw) != manifest["components"]["skill"]["bytes"]:
        raise Invalid("skill-binding")
    for row in manifest["rows"]:
        workdir = pathlib.Path(row["workdir"])
        check_dir(workdir)
        check_dir(workdir / "journal")
        if list((workdir / "journal").iterdir()):
            raise Invalid("journal-not-empty")
        if (workdir / "turn.py").read_bytes() != reader_raw or stat.S_IMODE(os.lstat(workdir / "turn.py").st_mode) != 0o644:
            raise Invalid("reader-copy")
        plan, plan_raw = load(workdir / "plan.json", 0o444)
        if digest(plan_raw) != row["plan"]["sha256"] or len(plan_raw) != row["plan"]["bytes"]:
            raise Invalid("plan-binding")
        source_path = pathlib.Path(plan["source_row"]["path"])
        source_raw = source_path.read_bytes()
        source = json.loads(source_raw)
        if digest(source_raw) != plan["source_row"]["sha256"] or len(source_raw) != plan["source_row"]["bytes"]:
            raise Invalid("source-binding")
        expected = []
        for index, chunk in enumerate(source["prompt_sequence"]["subject_chunks"]):
            expected.append({"bytes": chunk["bytes"], "index": index, "kind": "SUBJECT_CHUNK", "sha256": chunk["sha256"], "text": chunk["text"]})
        for kind, item in (("FINAL_TRIGGER", source["prompt_sequence"]["final_trigger"]), ("CLOSURE", source["prompt_sequence"]["closure_fallback"])):
            expected.append({"bytes": item["bytes"], "index": len(expected), "kind": kind, "sha256": item["sha256"], "text": item["text"]})
        if plan["capsules"] != expected or plan["task_name"] != row["task_name"] or plan["objective"] != source["objective"]:
            raise Invalid("plan-derivation")
        message_raw = row["initial_message"]["text"].encode()
        if len(message_raw) != row["initial_message"]["bytes"] or digest(message_raw) != row["initial_message"]["sha256"] or len(message_raw) > 512:
            raise Invalid("initial-message")
        payload = b"".join(chunk["text"].encode().split(b"\n", 1)[1] for chunk in source["prompt_sequence"]["subject_chunks"])
        if payload in message_raw or digest(payload) != source["subject"]["sha256"]:
            raise Invalid("pregoal-subject")
        simulate(row, plan_raw, reader_raw)
    result = {"assertion_count": 52, "manifest_bytes": len(manifest_raw), "manifest_sha256": digest(manifest_raw), "mutation_count": 6, "status": "PASS_STATIC_ZERO_CREDIT_ZERO_WORKTREE_WRITES"}
    sys.stdout.buffer.write(canon(result))


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError) as error:
        sys.stdout.buffer.write(canon({"first_mismatch": str(error), "status": "FAIL"}))
        raise SystemExit(1)
