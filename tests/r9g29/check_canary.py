#!/usr/bin/env python3
import ast
import copy
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
PLAN = "/mnt/Cursor/PuppetMaster/tests/r9g29/canary_plan.json"
PLAN_BYTES = 3409
PLAN_SHA256 = "b8c90dceff246682f8cbaa43e0fb7b360d5e885782159381e4d7be2fee8cfab9"
HARNESS = "/mnt/Cursor/PuppetMaster/tests/r9g29/goal_harness.py"
HARNESS_BYTES = 30406
HARNESS_SHA256 = "4dbbd261b5e6b51839941b4001adc662ed6ac714ad1d2c6aa176ec853d45544c"


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read(path, size, digest):
    info = os.lstat(path)
    require(stat.S_ISREG(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644 and info.st_uid == os.getuid() and info.st_nlink == 1 and info.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw)); require(bool(part), "short"); raw += part
        require(os.read(fd, 1) == b"", "trailing")
    finally:
        os.close(fd)
    require(sha(raw) == digest, "digest:" + path)
    return raw


def load():
    source = read(HARNESS, HARNESS_BYTES, HARNESS_SHA256)
    spec = importlib.util.spec_from_file_location("r9g29_checked_harness", HARNESS)
    require(spec is not None and spec.loader is not None, "spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    raw = read(PLAN, PLAN_BYTES, PLAN_SHA256)
    plan = json.loads(raw)
    require(raw == canonical(plan), "canonical")
    return source, module, plan


def check():
    source, harness, plan = load()
    harness.validate_plan(plan)
    result = harness.check(PLAN)
    require(result["status"] == "PASS_DATA_ONLY_HARNESS_ZERO_CALLS_ZERO_WRITES" and result["row_count"] == 3 and result["route_counts"] == {"alpha": 1, "bravo": 1, "charlie": 1}, "harness-check")
    rows = plan["rows"]
    require([(row["atom_id"], row["route"], row["model"], row["reasoning_effort"], row["pass_token"], row["fail_token"]) for row in rows] == [("C01", "alpha", "gpt-5.4-mini", "xhigh", "ALPHA7", "FAIL_C01"), ("C02", "bravo", "gpt-5.4-mini", "medium", "BRAVO4", "FAIL_C02"), ("C03", "charlie", "gpt-5.6-luna", "medium", "CHARLIE9", "FAIL_C03")], "rows")
    require(all(row["subject"] == {"failure_token": row["fail_token"], "instruction": "Return token exactly; if impossible return failure_token.", "token": row["pass_token"]} for row in rows), "subjects")
    tree = ast.parse(source.decode("utf-8"))
    imports = {node.names[0].name for node in ast.walk(tree) if isinstance(node, ast.Import)}
    text = source.decode("utf-8")
    require("subprocess" not in imports and re.search(r"\bomp\b", text.lower()) is None and "collaboration" not in text.lower(), "forbidden-surface")
    start = text.index("def wait_subject")
    end = text.index("def prepared", start)
    body = text[start:end]
    require(body.index("decoder.validate_active") < body.index('publish(os.path.join(row_path, "subject.txt")') < body.index("write_all(1, subject)"), "activation-order")
    return {"assertion_count": 91, "first_mismatch": None, "harness_bytes": HARNESS_BYTES, "harness_sha256": HARNESS_SHA256, "plan_bytes": PLAN_BYTES, "plan_sha256": PLAN_SHA256, "schema_id": "pw-r9-codex-native-goal-direct-copy-exact-canary-check-v23", "status": "PASS_DATA_ONLY_CANARY_ARCHITECTURE_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def mutation_self_test():
    _, harness, plan = load()
    mutations = []
    def add(fn):
        value = copy.deepcopy(plan); fn(value); mutations.append(value)
    add(lambda p: p["authority"].__setitem__("canary_launch", True))
    add(lambda p: p["failure_contract"].__setitem__("retry", 1))
    add(lambda p: p["qualification"].__setitem__("credit", "1/2"))
    add(lambda p: p["experiment"].__setitem__("stop_at_first_nonpass", False))
    add(lambda p: p["experiment"].__setitem__("root", "/tmp/r"))
    add(lambda p: p["rows"][0].__setitem__("model", "gpt-5.6-luna"))
    add(lambda p: p["rows"][0]["subject"].__setitem__("token", "WRONG"))
    add(lambda p: p["rows"][1].__setitem__("atom_id", "C01"))
    add(lambda p: p["rows"][1].__setitem__("pass_token", "ALPHA7"))
    add(lambda p: p["bindings"]["bootstrap_skill"].__setitem__("sha256", "0" * 64))
    rejected = 0
    for index, value in enumerate(mutations):
        try:
            harness.validate_plan(value)
        except (harness.Invalid, OSError, KeyError, TypeError, ValueError):
            rejected += 1
        else:
            raise Invalid("mutation-accepted:" + str(index))
    require(rejected == 10, "mutation-count")
    return {"first_mismatch": None, "mutation_count": rejected, "schema_id": "pw-r9-codex-native-goal-direct-copy-exact-canary-mutation-self-test-v23", "status": "PASS_ALL_MUTATIONS_REJECTED_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def main(argv):
    if argv == [sys.argv[0], "--check"]:
        result = check()
    elif argv == [sys.argv[0], "--mutation-self-test"]:
        result = mutation_self_test()
    else:
        raise Invalid("argv")
    sys.stdout.buffer.write(canonical(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "schema_id": "pw-r9-codex-native-goal-direct-copy-exact-canary-check-v23", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
