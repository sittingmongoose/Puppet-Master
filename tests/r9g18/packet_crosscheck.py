#!/usr/bin/env python3
import hashlib
import json
import math
import os
import stat
import sys
import types

sys.dont_write_bytecode = True
ARCH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11.json"
ARCH_BYTES = 3621
ARCH_SHA256 = "331f6e3a3e2e5356b6e5d78d2bb5e3aa42cf189ace90ce07b05dd3c41a615537"
RECIPE = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
COMPILER = "/mnt/Cursor/PuppetMaster/tests/r9g18/packet_compiler.py"
COMPILER_BYTES = 6018
COMPILER_SHA256 = "bce30c334538d0d10c93fd6fa9d2c8ad2df9f6b4ceb43ddb776c6805018dfb31"
WAITER = "/mnt/Cursor/PuppetMaster/tests/r9g18/wait.py"
WAITER_BYTES = 7771
WAITER_SHA256 = "d73b89f69cb4af3f531ab7bd3a1befe81354156f8587bd62a57d67af6cd9d438"
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g18/r"


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key:" + key)
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid("nonfinite:" + item)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before) and sha(raw) == digest, "drift:" + path)
    return raw


def module(name, path, size, digest):
    raw = read_bound(path, size, digest)
    value = types.ModuleType(name)
    value.__file__ = path
    exec(compile(raw, path, "exec"), value.__dict__)
    return value


def expected_record(atom_id):
    nonce = sha(b"pw-r9-cg11-single-source-packet-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    return {"atom_id": atom_id, "goal_objective": "CG11R|a={}|x={}|once".format(atom_id, nonce), "model_requested": "gpt-5.6-luna", "reasoning_effort_requested": "medium", "review_nonce": nonce, "task_name": "r9_cg11r_" + nonce}


def expected_subject(atom):
    return canonical({"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 3, "z": "PASS or " + atom["fail_token"]})


def expected_pre(record, subject):
    return {"architecture_sha256": ARCH_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4", "goal_objective": record["goal_objective"], "model_requested": "gpt-5.6-luna", "packet_compiler_sha256": COMPILER_SHA256, "reasoning_effort_requested": "medium", "recipe_sha256": RECIPE_SHA256, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-predeclaration-v11", "subject_bytes": len(subject), "subject_sha256": sha(subject), "subject_source_sha256": ARCH_SHA256, "task_path": "/root/" + record["task_name"], "waiter_bytes": WAITER_BYTES, "waiter_sha256": WAITER_SHA256}


def rejected(waiter, raw, pre, label):
    try:
        waiter.validate_subject(raw, pre)
    except (waiter.Invalid, Invalid, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def run():
    require(not os.path.lexists(ROOT), "review-root-present")
    architecture_raw = read_bound(ARCH, ARCH_BYTES, ARCH_SHA256)
    architecture = parse(architecture_raw)
    require(architecture_raw == canonical(architecture) and architecture["packet_contract"]["subject_source_rule"] == "SUBJECT_P_SRC_EQUALS_PREDECLARED_SUBJECT_SOURCE_SHA256_EQUALS_THIS_V11_ARCHITECTURE_SHA256", "architecture")
    recipe_raw = read_bound(RECIPE, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe), "recipe")
    compiler = module("r9g18_crosscheck_compiler", COMPILER, COMPILER_BYTES, COMPILER_SHA256)
    waiter = module("r9g18_crosscheck_waiter", WAITER, WAITER_BYTES, WAITER_SHA256)
    compiler_recipe = compiler.load_recipe()
    require(compiler_recipe == recipe and compiler.__all__ == ("ARCH_SHA256", "EFFORT", "Invalid", "MODEL", "ROOT", "canonical", "compile_record", "load_recipe", "predeclaration", "row_path", "sha", "spawn_prompt", "subject_bytes") and waiter.__all__ == ("Invalid", "PRE", "validate_subject"), "api")
    mutations = 0
    maximum = {"prompt": 0, "subject": 0}
    nonces = set()
    for atom in recipe["atoms"]:
        compiler_atom, record = compiler.compile_record(compiler_recipe, atom["id"])
        require(compiler_atom == atom and record == expected_record(atom["id"]), "record:" + atom["id"])
        subject = compiler.subject_bytes(compiler_atom)
        require(subject == expected_subject(atom), "subject:" + atom["id"])
        pre = compiler.predeclaration(record, subject, COMPILER_SHA256, WAITER_BYTES, WAITER_SHA256)
        require(pre == expected_pre(record, subject), "pre:" + atom["id"])
        value = waiter.validate_subject(subject, pre)
        require(value["p"] == {"atom": atom["id"], "src": ARCH_SHA256}, "waiter:" + atom["id"])
        require(record["review_nonce"] not in nonces, "nonce:" + atom["id"])
        nonces.add(record["review_nonce"])
        maximum["prompt"] = max(maximum["prompt"], len(compiler.spawn_prompt(record)))
        maximum["subject"] = max(maximum["subject"], len(subject))
        if atom["id"] in {"A01", "A09", "A18"}:
            bad = parse(subject); bad["p"]["src"] = "0" * 64; mutations += rejected(waiter, canonical(bad), pre, atom["id"] + "-source")
            bad = parse(subject); bad["p"]["atom"] = "A02" if atom["id"] != "A02" else "A03"; mutations += rejected(waiter, canonical(bad), pre, atom["id"] + "-atom")
            bad = parse(subject); bad["v"] = 2; mutations += rejected(waiter, canonical(bad), pre, atom["id"] + "-version")
            bad_pre = dict(pre); bad_pre["subject_source_sha256"] = "0" * 64; mutations += rejected(waiter, subject, bad_pre, atom["id"] + "-pre-source")
            bad_pre = dict(pre); bad_pre["subject_sha256"] = "0" * 64; mutations += rejected(waiter, subject, bad_pre, atom["id"] + "-pre-hash")
    require(len(nonces) == 18 and maximum["subject"] <= 512 and maximum["prompt"] <= 512, "closed")
    return {"assertion_count": 18 * 16 + 41, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": maximum["prompt"], "max_subject_bytes": maximum["subject"], "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-crosscheck-v11", "status": "PASS_DATA_ONLY_ACTUAL_WAITER_CROSS_COMPONENT_SUBJECT_IDENTITY_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def main():
    try:
        require(sys.argv == [sys.argv[0], "--check"], "cli")
        sys.stdout.buffer.write(canonical(run()))
        return 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-crosscheck-v11", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
