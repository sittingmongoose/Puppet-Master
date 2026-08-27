#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat

ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_self_attesting_packet_atomic_review_v12.json"
ARCH_BYTES = 2576
ARCH_SHA256 = "b31e34fe302c6c9b17478cea888c1c26beea4b26179daa9a0600572645335352"
RECIPE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g19/r"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
ATOM = re.compile(r"^A(?:0[1-9]|1[0-8])$")
HEX = re.compile(r"^[0-9a-f]{64}$")


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


def load_recipe():
    architecture_raw = read_bound(ARCH_PATH, ARCH_BYTES, ARCH_SHA256)
    architecture = parse(architecture_raw)
    require(architecture_raw == canonical(architecture) and architecture["status"] == "FROZEN_PROPOSED_SELF_ATTESTING_PACKET_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "architecture")
    recipe_raw = read_bound(RECIPE_PATH, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe) and recipe["status"] == "DATA_ONLY_REVIEW_CORPUS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe")
    require([item["id"] for item in recipe["atoms"]] == ["A{:02d}".format(index) for index in range(1, 19)], "atom-set")
    return recipe


def compile_record(recipe, atom_id):
    require(ATOM.fullmatch(atom_id or ""), "atom-id")
    atom = next((item for item in recipe["atoms"] if item["id"] == atom_id), None)
    require(atom is not None, "atom-missing")
    nonce = sha(b"pw-r9-cg12-self-attesting-packet-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    record = {"atom_id": atom_id, "goal_objective": "CG12R|a={}|x={}|once".format(atom_id, nonce), "model_requested": MODEL, "reasoning_effort_requested": EFFORT, "review_nonce": nonce, "task_name": "r9_cg12r_" + nonce}
    return atom, record


def row_path(record):
    return ROOT + "/" + record["atom_id"] + "/" + record["review_nonce"]


def subject_bytes(atom):
    raw = canonical({"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 4, "z": "PASS or " + atom["fail_token"]})
    require(len(raw) <= 512 and raw.count(b"\n") == 1 and b"\r" not in raw, "subject-size")
    return raw


def spawn_prompt(record):
    text = "Use $r9-goal-atom-bootstrap; load once via exec_command cmd=\"sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md\" workdir=/mnt/Cursor/PuppetMaster yield=10000 max=3000. objective=" + json.dumps(record["goal_objective"]) + " waiter=" + json.dumps(row_path(record)) + ". Obey skill."
    raw = text.encode("utf-8")
    require(len(raw) <= 512 and b"PASS" not in raw and b"FAIL_" not in raw, "spawn-prompt")
    return raw


def predeclaration(record, subject, compiler_sha256, waiter_bytes, waiter_sha256):
    require(HEX.fullmatch(compiler_sha256 or "") and HEX.fullmatch(waiter_sha256 or "") and isinstance(waiter_bytes, int) and not isinstance(waiter_bytes, bool) and waiter_bytes > 0, "component-identity")
    return {"architecture_sha256": ARCH_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_objective": record["goal_objective"], "model_requested": MODEL, "native_envelope_bytes": CODEC_BYTES, "native_envelope_sha256": CODEC_SHA256, "packet_compiler_sha256": compiler_sha256, "reasoning_effort_requested": EFFORT, "recipe_sha256": RECIPE_SHA256, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-predeclaration-v12", "subject_bytes": len(subject), "subject_sha256": sha(subject), "subject_source_sha256": ARCH_SHA256, "task_path": "/root/" + record["task_name"], "waiter_bytes": waiter_bytes, "waiter_sha256": waiter_sha256}


__all__ = ("ARCH_SHA256", "EFFORT", "Invalid", "MODEL", "ROOT", "canonical", "compile_record", "load_recipe", "predeclaration", "row_path", "sha", "spawn_prompt", "subject_bytes")
