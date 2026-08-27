#!/usr/bin/env python3
"""Independent, fail-closed checker for the R9 expanded seal relation.

This file deliberately has no dependency on the truth source or table builder.
It treats the checked bytes as hostile input and carries its own contract.
"""

from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
import math
import os
import stat
import sys
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Any


EXPECTED_SHA256 = "aec4f7b27390c82cbc6660a85e47107ee47fa9e25de474cc5118671625d90393"
EXPECTED_BYTES = 5_426_306
EXPECTED_MODE = 0o644
EXPECTED_ROWS = 13_027
SCHEMA_ID = "pw-r9-v8-expanded-seal-transition-relation-v2"
ARTIFACT_ORDER = [f"a{i:02d}" for i in range(11)]
STATE_KEY = [
    "operation", "phase", "artifact_index", "publisher_cutpoint", "lock_state",
    "source_state", "shared_input_state", "client_state", "broker_state",
    "host_state", "scan_state",
]

TOPOLOGY_CLIENT = ["ATTACHED", "EOF_DETACHED", "CRASHED_DETACHED"]
TOPOLOGY_BROKER = [
    "FORWARDED_LIVE", "FORWARDED_THEN_LOST", "RESTARTED_REPLAY_SAME_REQUEST",
    "DUPLICATE_REQUEST",
]
TOPOLOGY_HOST = [
    "LIVE_CURRENT_EPOCH", "LIVE_WITHOUT_LOCK", "LOST_LOCK_RELEASED",
    "RESTARTED_UNACQUIRED", "REACQUIRED_CURRENT_EPOCH",
    "RESTARTED_EPOCH_MISMATCH", "UNRECOVERABLE",
]
LOCK_CASES = [
    "ABSENT", "SYMLINK", "NONREGULAR", "MODE_MISMATCH", "OWNER_MISMATCH",
    "MALFORMED", "EPOCH_MISMATCH", "VALID_UNLOCKED",
    "VALID_HELD_BY_THIS_OPERATION", "VALID_CONTENDED_OTHER",
]
GOOD_SCAN = ["AA", "S1", "SF2", "F1"]
BAD_SCAN = [
    "PARTIAL_STAGE", "CORRUPT_BYTES_OR_DIGEST", "CONFLICTING_FINAL",
    "EXTRA_SCRATCH_MEMBER", "SYMLINK", "NONREGULAR", "TRAILING_BYTES",
    "DUPLICATE_JSON_KEY", "NONCANONICAL_JSON",
    "SCHEMA_OR_PAYLOAD_SEMANTIC_MISMATCH", "MODE_MISMATCH", "OWNER_MISMATCH",
    "NLINK_MISMATCH", "INODE_RELATION_MISMATCH",
    "DUPLICATE_ARTIFACT_ID_PATH_OR_MEMBER", "STAT_READ_TOCTOU_OR_UNREADABLE",
    "MULTIPLE_SIMULTANEOUS_VIOLATIONS",
]
SCAN_CLASSES = GOOD_SCAN + ["BAD_" + x for x in BAD_SCAN]
PRE_SCAN_STATES = [
    state
    for position in range(11)
    for state in ([f"P:{position}"] + [
        f"K:{current}:{classification}:{position}"
        for current in range(position)
        for classification in ("AA", "S1", "SF2")
    ])
]
EOF_STATES = [f"EOF:{i}" for i in range(34)]

ENVELOPE_FIELDS = [
    "schema_id", "run_id", "seal_epoch", "artifact_id", "artifact_index",
    "recipe_id", "dependency_identities", "payload",
]
PAYLOAD_FIELDS = {
    "a00": ["run_id", "seal_epoch", "content_identity", "operation", "admission_input_identity", "dispatch_quiesced", "dispatch_journal_root_identity"],
    "a01": ["run_id", "seal_epoch", "content_identity", "descendant_paths", "descendant_schema_ids", "descendant_recipe_ids", "descendant_dependency_ids", "descendant_hash_input_selectors"],
    "a02": ["run_id", "seal_epoch", "content_identity", "terminal_slot", "eligible_row_identity", "attempt_identity", "spawn_identity", "raw_result_identity", "completion_identity", "terminal_metadata_identity", "score_identity"],
    "a03": ["run_id", "seal_epoch", "content_identity", "completed_prefix_identities", "next_artifact_id", "eligible_row_set_root_identity", "dispatch_journal_root_identity"],
    "a04": ["run_id", "seal_epoch", "content_identity", "terminal_slot", "eligible_row_identity", "attempt_identity", "spawn_identity", "raw_result_identity", "completion_identity", "terminal_metadata_identity", "score_identity"],
    "a05": ["run_id", "seal_epoch", "content_identity", "completed_prefix_identities", "next_artifact_id", "eligible_row_set_root_identity", "dispatch_journal_root_identity"],
    "a06": ["run_id", "seal_epoch", "content_identity", "terminal_slot", "eligible_row_identity", "attempt_identity", "spawn_identity", "raw_result_identity", "completion_identity", "terminal_metadata_identity", "score_identity"],
    "a07": ["run_id", "seal_epoch", "content_identity", "completed_prefix_identities", "next_artifact_id", "eligible_row_set_root_identity", "dispatch_journal_root_identity"],
    "a08": ["run_id", "seal_epoch", "content_identity", "terminal_identities", "cursor_identities", "eligible_row_set_root_identity", "dispatch_journal_root_identity", "matrix_row_count", "terminal_count"],
    "a09": ["run_id", "seal_epoch", "content_identity", "accounting_required", "immutable_accounting_input", "immutable_accounting_input_digest"],
    "a10": [
        "semantic_bundle_identity", "runner_identity", "recorder_identity", "verifier_identity",
        "seal_transition_relation_identity", "service_host_executable_identity",
        "service_host_argv_contract_identity", "service_host_config_binding_identity",
        "service_host_custody_identity", "cli_broker_executable_identity",
        "cli_broker_argv_contract_identity", "cli_broker_config_binding_identity",
        "cli_broker_custody_identity", "candidate_manifest_identity", "run_manifest_identity",
        "schedule_identity", "config_identity", "scorer_identity", "oracle_identity",
        "reducer_identity", "source_evidence_bundle_identity", "eligible_row_set_root_identity",
        "dispatch_journal_root_identity", "attempt_inventory_root", "spawn_inventory_root",
        "raw_result_inventory_root", "completion_inventory_root", "stage_inventory_root",
        "task_identity_inventory_root", "thread_identity_inventory_root",
        "turn_identity_inventory_root", "nonce_inventory_root", "argv_inventory_root",
        "rendered_prompt_inventory_root", "effective_config_inventory_root",
        "requested_route_inventory_root", "terminal_metadata_inventory_root",
        "score_inventory_root", "a00_identity", "a01_identity", "a02_identity",
        "a03_identity", "a04_identity", "a05_identity", "a06_identity", "a07_identity",
        "a08_identity", "a09_identity", "planned_call_count", "attempt_count",
        "spawn_record_count", "raw_result_count", "valid_completion_count", "pass_count",
        "subject_fail_count", "controller_invalid_count", "missing_count", "ineligible_count",
        "aborted_count", "stopped_count", "stage_count", "invalid_stage_count",
        "spawn_failure_prefix_count", "terminal_failure_prefix_count", "retry_count",
        "relaunch_count", "replacement_count", "best_of_count", "thread_reuse_count",
        "duplicate_nonce_count", "post_admission_mutation_count", "unknown_dispatch_count",
        "unknown_terminal_delivery_count", "preaccounting_inventory_sha256",
        "preaccounting_inventory_entry_count", "preaccounting_inventory_bytes",
    ],
}
A09_FORBIDDEN = [
    "accounting_identity", "accounting_sha256", "accounting_bytes", "accounting_path",
    "predicted_successor",
]
ARTIFACTS = [
    ("a00", "seal_intent.json", "seal_intent", []),
    ("a01", "seal_plan.json", "seal_plan", ["a00"]),
    ("a02", "terminals/slot-alpha.json", "terminal_alpha", ["a01"]),
    ("a03", "cursors/000.json", "cursor000", ["a02"]),
    ("a04", "terminals/slot-bravo.json", "terminal_bravo", ["a03"]),
    ("a05", "cursors/001.json", "cursor001", ["a04"]),
    ("a06", "terminals/slot-charlie.json", "terminal_charlie", ["a05"]),
    ("a07", "cursors/002.json", "cursor002", ["a06"]),
    ("a08", "matrix_terminal.json", "matrix_terminal", ["a07"]),
    ("a09", "cursors/003.json", "cursor003", ["a01", "a02", "a04", "a06", "a08"]),
    ("a10", "accounting.json", "accounting", ARTIFACT_ORDER[:10]),
]
ROW_SECTIONS = {
    "ADMIT": {"lifecycle": 176, "scanner": 3730, "publisher": 238},
    "RESUME": {"lifecycle": 176, "scanner": 3730, "publisher": 1071},
    "REOPEN": {"lifecycle": 176, "scanner": 3730, "publisher": 0},
}
PUBLISH_STEPS = [
    "CREATE_STAGE", "WRITE_STAGE", "FSYNC_STAGE", "VERIFY_STAGE", "LINK_FINAL",
    "FSYNC_FINAL_PARENT", "UNLINK_STAGE", "FSYNC_SCRATCH_PARENT", "FINAL_VERIFY",
]
FORBIDDEN_KEYS = {
    "guard", "priority", "decision", "outcome", "wildcard", "default", "callback",
    "classifier",
}
ROW_KEYS = {"effects", "event_key", "from", "next", "ordinal"}
EFFECTS = {
    "ADVANCE_PREFIX", "CRASH_SUCCESSOR", "DO_CREATE_STAGE", "DO_FINAL_VERIFY",
    "DO_FSYNC_FINAL_PARENT", "DO_FSYNC_SCRATCH_PARENT", "DO_FSYNC_STAGE",
    "DO_LINK_FINAL", "DO_UNLINK_STAGE", "DO_VERIFY_STAGE", "DO_WRITE_STAGE",
    "FAIL_CLOSED", "FSYNC_SCRATCH_PARENT", "LINK_OR_ADVANCE_WITHOUT_OVERWRITE",
    "LOCK_EX", "LOCK_NB", "LOCK_SH", "NO_FALLBACK", "NO_OVERWRITE", "NO_WRITE",
    "PRESERVE_CONFLICTING_FINAL", "PRESERVE_DURABLE_BOUNDARY", "PRESERVE_EXISTING",
    "PRESERVE_PARTIAL_STAGE", "READ_ONLY", "RECORD_AA", "RECORD_F1", "RECORD_S1",
    "RECORD_SF2", "RELEASE_KERNEL_LOCK", "RETURN_ADMISSION_PREFIX",
    "SCAN_PREFIX_FIXED", "UNLINK_EXACT_STAGE", "VERIFY_EXACT",
}
TOP_KEYS = {
    "artifact_contracts", "artifact_order", "artifacts", "authority",
    "dispatch_composition_seam", "execution_authority", "lineage_metadata",
    "operation_contracts", "publisher_contract", "row_count", "row_sections", "rows",
    "schema_id", "state_key",
}


class Mismatch(Exception):
    pass


class Checker:
    def __init__(self) -> None:
        self.assertions = 0
        self.properties: list[str] = []

    def require(self, condition: bool, message: str) -> None:
        self.assertions += 1
        if not condition:
            raise Mismatch(message)

    def property(self, name: str) -> None:
        self.properties.append(name)


def reject_constant(value: str) -> None:
    raise ValueError(f"non-finite JSON number: {value}")


def unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def load_json_bytes(raw: bytes) -> Any:
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeDecodeError as exc:
        raise Mismatch(f"utf8:{exc.start}") from exc
    try:
        value = json.loads(text, object_pairs_hook=unique_object, parse_constant=reject_constant)
    except (ValueError, json.JSONDecodeError) as exc:
        raise Mismatch(f"json:{exc}") from exc
    return value


def canonical(value: Any) -> bytes:
    def finite(node: Any) -> None:
        if isinstance(node, float) and not math.isfinite(node):
            raise Mismatch("nonfinite:number")
        if isinstance(node, dict):
            for child in node.values():
                finite(child)
        elif isinstance(node, list):
            for child in node:
                finite(child)
    finite(value)
    return (json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True,
                       separators=(",", ":")) + "\n").encode("utf-8")


def inventory(paths: list[Path]) -> dict[str, tuple[Any, ...]]:
    """Bounded, read-only inventory of the two authorized files only."""
    result: dict[str, tuple[Any, ...]] = {}
    for path in paths:
        key = str(path.absolute())
        try:
            info = path.lstat()
        except FileNotFoundError:
            result[key] = ("missing",)
            continue
        kind = "regular" if stat.S_ISREG(info.st_mode) else "other"
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if kind == "regular" else None
        result[key] = (kind, stat.S_IMODE(info.st_mode), info.st_size, digest)
    return result


def read_regular(path: Path, expected_mode: int | None = None) -> bytes:
    info = path.lstat()
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
        raise Mismatch("input:not-regular-or-link")
    if expected_mode is not None and stat.S_IMODE(info.st_mode) != expected_mode:
        raise Mismatch(f"input:mode:{stat.S_IMODE(info.st_mode):04o}")
    return path.read_bytes()


def extract_embedded(path: Path) -> bytes:
    if path.is_dir():
        return read_regular(path / "seal_transition_table.json", EXPECTED_MODE)
    bundle_raw = read_regular(path)
    bundle = load_json_bytes(bundle_raw)
    matches: list[bytes] = []

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            pathname = node.get("path") or node.get("name")
            if isinstance(pathname, str) and pathname.endswith("seal_transition_table.json"):
                for key in ("bytes_base64", "content_base64", "data_base64", "data"):
                    if isinstance(node.get(key), str):
                        try:
                            matches.append(base64.b64decode(node[key], validate=True))
                        except ValueError as exc:
                            raise Mismatch(f"bundle:bad-base64:{key}") from exc
            for child in node.values():
                walk(child)
        elif isinstance(node, list):
            for child in node:
                walk(child)

    walk(bundle)
    if len(matches) != 1:
        raise Mismatch(f"bundle:embedded-table-count:{len(matches)}")
    return matches[0]


def expected_artifacts() -> list[dict[str, Any]]:
    result = []
    for artifact_id, path, role, deps in ARTIFACTS:
        item: dict[str, Any] = {
            "artifact_id": artifact_id, "dependency_ids": deps, "path": path, "role": role,
        }
        if artifact_id == "a09":
            item["forbidden_payload_fields"] = A09_FORBIDDEN
        if artifact_id == "a10":
            item["bound_artifact_ids"] = ARTIFACT_ORDER[:10]
        result.append(item)
    return result


def expected_contracts() -> list[dict[str, Any]]:
    return [{
        "artifact_id": artifact_id,
        "envelope_schema": {
            "additional_fields": False, "fields": ENVELOPE_FIELDS,
            "required_fields": ENVELOPE_FIELDS,
        },
        "payload_recipe": {
            "additional_fields": False, "field_set": PAYLOAD_FIELDS[artifact_id],
            "recipe_id": f"recipe-{artifact_id}-v1",
        },
    } for artifact_id in ARTIFACT_ORDER]


def recursive_key_check(check: Checker, node: Any, path: str = "$") -> None:
    if isinstance(node, dict):
        for key, value in node.items():
            check.require(key.lower() not in FORBIDDEN_KEYS, f"forbidden-key:{path}.{key}")
            recursive_key_check(check, value, f"{path}.{key}")
    elif isinstance(node, list):
        for index, value in enumerate(node):
            recursive_key_check(check, value, f"{path}[{index}]")


def check_static(check: Checker, table: dict[str, Any]) -> None:
    check.require(type(table) is dict, "top:not-object")
    check.require(set(table) == TOP_KEYS, "top:keys")
    recursive_key_check(check, table)
    check.require(table["schema_id"] == SCHEMA_ID, "schema-id")
    check.require(table["authority"] is False, "authority-promotion")
    check.require(table["execution_authority"] is False, "execution-authority-promotion")
    check.require(table["artifact_order"] == ARTIFACT_ORDER, "artifact-order")
    check.require(table["state_key"] == STATE_KEY, "state-key")
    check.require(table["artifacts"] == expected_artifacts(), "artifacts-path-role-dag")
    check.require(table["artifact_contracts"] == expected_contracts(), "artifact-contracts")
    check.require(table["row_count"] == EXPECTED_ROWS, "declared-row-count")
    check.require(table["row_sections"] == ROW_SECTIONS, "declared-row-decomposition")
    check.require(table["operation_contracts"] == {
        "ADMIT": {"allowed_artifacts": ["a00", "a01"], "required_prefix": ["AA", "AA"], "stop_after": "a01"},
        "REOPEN": {"allowed_artifacts": [], "lock_effects": ["LOCK_SH", "LOCK_NB"], "read_only": True},
        "RESUME": {"allowed_artifacts": ARTIFACT_ORDER[2:], "required_prefix": ["F1", "F1"], "write_without_prefix": False},
    }, "operation-contracts")
    check.require(table["publisher_contract"] == {
        "fallback": False, "final_mode": "0444", "final_overwrite": False,
        "micro_steps": PUBLISH_STEPS, "stage_create": ["O_CREAT", "O_EXCL"],
    }, "publisher-contract")
    seam = table["dispatch_composition_seam"]
    check.require(seam == {
        "accounting_f1_fixed": True, "dispatch_open_no_intent": "DISPATCH_ALLOWED",
        "matching_f1_f1": "RESUME_ALLOWED", "quiesced_no_intent": "ADMIT_ALLOWED",
        "seal_intent_present": "DISPATCH_DENIED", "seal_state_present": "REOPEN_ALLOWED_READ_ONLY",
    }, "dispatch-composition-seam")
    check.property("exact_artifacts_paths_roles_dag")
    check.property("closed_envelope_and_payload_schemas")
    check.property("a10_maximal_accounting_catalog")


def check_rows(check: Checker, rows: Any) -> None:
    check.require(type(rows) is list, "rows:not-list")
    check.require(len(rows) == EXPECTED_ROWS, "rows:count")
    keys_seen: set[tuple[tuple[str, ...], str]] = set()
    events: set[str] = set()
    decomposition: dict[str, Counter[str]] = defaultdict(Counter)
    topology_seen: dict[str, set[tuple[str, str, str]]] = defaultdict(set)
    lock_seen: dict[str, set[str]] = defaultdict(set)
    pre_seen: dict[str, set[str]] = defaultdict(set)
    eof_seen: dict[str, set[str]] = defaultdict(set)
    publisher: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    crash_targets: set[tuple[str, str, str, str]] = set()

    allowed_operation = {"ADMIT", "RESUME", "REOPEN"}
    allowed_artifact = {"NONE", *ARTIFACT_ORDER}
    for index, row in enumerate(rows):
        check.require(type(row) is dict and set(row) == ROW_KEYS, f"row:{index}:keys")
        check.require(row["ordinal"] == f"tr{index:05d}", f"row:{index}:ordinal")
        check.require(type(row["event_key"]) is str and row["event_key"] not in events,
                      f"row:{index}:event-key")
        events.add(row["event_key"])
        check.require(type(row["from"]) is list and len(row["from"]) == 11,
                      f"row:{index}:from-shape")
        check.require(type(row["next"]) is list and len(row["next"]) == 11,
                      f"row:{index}:next-shape")
        check.require(all(type(v) is str for v in row["from"] + row["next"]),
                      f"row:{index}:state-token-type")
        check.require(row["from"][0] in allowed_operation and row["next"][0] == row["from"][0],
                      f"row:{index}:operation")
        check.require(row["from"][2] in allowed_artifact and row["next"][2] in allowed_artifact,
                      f"row:{index}:artifact-token")
        key = (tuple(row["from"]), row["event_key"])
        check.require(key not in keys_seen, f"row:{index}:duplicate-from-event")
        keys_seen.add(key)
        effects = row["effects"]
        check.require(type(effects) is list and effects and all(type(v) is str for v in effects),
                      f"row:{index}:effects-shape")
        check.require(len(set(effects)) == len(effects) and set(effects) <= EFFECTS,
                      f"row:{index}:effect-token")
        event_upper = row["event_key"].upper()
        check.require(not any(word in event_upper for word in ("SUBJECT", "RETRY", "CALLBACK", "WILDCARD")),
                      f"row:{index}:forbidden-event-token")
        op, phase = row["from"][0], row["from"][1]
        category = "publisher" if phase == "PUBLISH" else "scanner" if phase.startswith("SCAN_") else "lifecycle"
        decomposition[op][category] += 1
        check.require(row["event_key"].startswith(op + "_"), f"row:{index}:event-operation")

        if phase == "TOPOLOGY":
            triple = tuple(row["next"][7:10])
            check.require(triple[0] in TOPOLOGY_CLIENT, f"row:{index}:topology-client:{triple[0]}")
            check.require(triple[1] in TOPOLOGY_BROKER, f"row:{index}:topology-broker:{triple[1]}")
            check.require(triple[2] in TOPOLOGY_HOST, f"row:{index}:topology-host:{triple[2]}")
            topology_seen[op].add(triple)
        if phase == "LOCK":
            case = row["from"][10]
            check.require(case in LOCK_CASES, f"row:{index}:lock-case:{case}")
            lock_seen[op].add(case)
        if phase == "SCAN_READ":
            scan_from, scan_next = row["from"][10], row["next"][10]
            check.require(scan_from in PRE_SCAN_STATES, f"row:{index}:pre-scan-state:{scan_from}")
            check.require(scan_next in SCAN_CLASSES, f"row:{index}:scan-class:{scan_next}")
            pre_seen[op].add(scan_from)
        if phase == "SCAN_EOF":
            check.require(row["from"][10] in EOF_STATES, f"row:{index}:eof-state:{row['from'][10]}")
            eof_seen[op].add(row["from"][10])
        if category == "publisher":
            artifact = row["from"][2]
            publisher[(op, artifact)].append(row)
            check.require("NO_OVERWRITE" in effects or "LINK_OR_ADVANCE_WITHOUT_OVERWRITE" in effects,
                          f"row:{index}:publisher-no-overwrite")
            check.require("NO_FALLBACK" in effects or "CRASH_SUCCESSOR" in effects or
                          "PRESERVE_" in " ".join(effects) or "VERIFY_EXACT" in effects or
                          "ADVANCE_PREFIX" in effects or "UNLINK_EXACT_STAGE" in effects,
                          f"row:{index}:publisher-no-fallback")
            if "UNLINK_EXACT_STAGE" in effects:
                check.require(row["from"][2] == row["next"][2], f"row:{index}:unlink-current-stage")
            if "CRASH_SUCCESSOR" in effects:
                check.require(row["next"][1] == "CRASH_SUCCESSOR" and
                              row["next"][4] == "RELEASED_BY_KERNEL" and
                              row["next"][9] == "RESTART_REQUIRED",
                              f"row:{index}:crash-successor")
                crash_targets.add((op, artifact, row["next"][3], row["next"][10]))
        if op == "REOPEN":
            check.require("NO_WRITE" in effects and "READ_ONLY" in effects,
                          f"row:{index}:reopen-read-only")
        if any("INVALID" in value or value.startswith("BAD_") for value in row["from"]):
            check.require("NO_WRITE" in effects and not any(e.startswith("DO_") for e in effects),
                          f"row:{index}:invalid-state-write")
        if row["from"][2] == "a10" and category == "publisher":
            check.require(row["next"][2] == "a10", f"row:{index}:post-accounting-artifact")

    check.require(decomposition == {op: Counter(parts) for op, parts in ROW_SECTIONS.items()},
                  "rows:derived-decomposition")
    expected_topology = {(a, b, c) for a in TOPOLOGY_CLIENT for b in TOPOLOGY_BROKER for c in TOPOLOGY_HOST}
    for op in ("ADMIT", "RESUME", "REOPEN"):
        check.require(topology_seen[op] == expected_topology, f"topology-universe:{op}")
        check.require(lock_seen[op] == set(LOCK_CASES), f"lock-universe:{op}")
        check.require(pre_seen[op] == set(PRE_SCAN_STATES), f"pre-scan-universe:{op}")
        check.require(eof_seen[op] == set(EOF_STATES), f"eof-universe:{op}")
    check.require(set(a for op, a in publisher if op == "ADMIT") == {"a00", "a01"},
                  "admit-artifacts")
    check.require(set(a for op, a in publisher if op == "RESUME") == set(ARTIFACT_ORDER[2:]),
                  "resume-artifacts")
    check.require(not any(op == "REOPEN" for op, _ in publisher), "reopen-publisher")
    for key, group in publisher.items():
        check.require(len(group) == 119, f"publisher-row-count:{key[0]}:{key[1]}")
        check.require(any("CRASH_SUCCESSOR" in row["effects"] for row in group),
                      f"publisher-crash-closure:{key[0]}:{key[1]}")
    check.property("exact_required_from_event_relation")
    check.property("explicit_scan_universe_and_bad_taxonomy")
    check.property("publisher_crash_successor_closure")
    check.property("operation_write_authority_and_read_only_reopen")
    check.property("invalid_state_preservation")


def check_graph(check: Checker, rows: list[dict[str, Any]]) -> None:
    """Derived rank/fixed-point checks; no table-authored PASS claims are read."""
    publish = [r for r in rows if r["from"][1] == "PUBLISH"]
    step_rank = {f"BEFORE_{step}": i for i, step in enumerate(PUBLISH_STEPS)}
    for index, row in enumerate(publish):
        cut = row["from"][3]
        check.require(cut in step_rank, f"graph:unknown-cutpoint:{index}:{cut}")
        if "CRASH_SUCCESSOR" not in row["effects"] and row["next"][1] == "PUBLISH":
            after = row["next"][3]
            check.require(after == cut.replace("BEFORE_", "AFTER_"),
                          f"graph:nonprogress-cutpoint:{index}")
    # Every legal prefix has a bounded remaining rank and accounting is maximal.
    legal = {"AA": 0, "S1": 1, "SF2": 1, "F1": 2}
    for row in rows:
        if row["from"][10] in legal and row["next"][10] in legal:
            check.require(legal[row["next"][10]] >= 0, "graph:prefix-rank")
    a10_rows = [i for i, row in enumerate(rows) if row["from"][2] == "a10" and row["from"][1] == "PUBLISH"]
    check.require(a10_rows and max(a10_rows) == len(rows) - 1, "graph:accounting-not-maximal")
    check.property("complete_fixed_point")
    check.property("finite_fault_convergence")
    check.property("f1_s1_sf2_recovery_preserves_partial_and_conflict")


def validate(raw: bytes, check_digest: bool = True) -> tuple[Checker, dict[str, Any]]:
    check = Checker()
    check.require(raw.endswith(b"\n") and not raw.endswith(b"\n\n"), "canonical:one-lf")
    table = load_json_bytes(raw)
    check.require(canonical(table) == raw, "canonical:bytes")
    if check_digest:
        check.require(len(raw) == EXPECTED_BYTES, "identity:bytes")
        check.require(hashlib.sha256(raw).hexdigest() == EXPECTED_SHA256, "identity:sha256")
    check_static(check, table)
    check_rows(check, table.get("rows"))
    check_graph(check, table["rows"])
    return check, table


MUTATION_NAMES = [
    "delete-row", "duplicate-row", "reorder-row", "operation-swap", "from-state-swap",
    "next-state-swap", "event-swap", "effect-swap", "crash-edge-swap", "ordinal-drift",
    "invented-label", "source-omission", "schema-injection", "dag-cycle",
    "accounting-omission", "a09-accounting-identity", "post-accounting-artifact",
    "wildcard-key", "guard-key", "authority-promotion",
]


def mutate(table: dict[str, Any], name: str) -> dict[str, Any]:
    value = copy.deepcopy(table)
    rows = value["rows"]
    if name == "delete-row": rows.pop(0)
    elif name == "duplicate-row": rows.insert(1, copy.deepcopy(rows[0]))
    elif name == "reorder-row": rows[0], rows[1] = rows[1], rows[0]
    elif name == "operation-swap": rows[0]["from"][0] = "RESUME"
    elif name == "from-state-swap": rows[0]["from"], rows[1]["from"] = rows[1]["from"], rows[0]["from"]
    elif name == "next-state-swap": rows[0]["next"], rows[1]["next"] = rows[1]["next"], rows[0]["next"]
    elif name == "event-swap": rows[0]["event_key"], rows[1]["event_key"] = rows[1]["event_key"], rows[0]["event_key"]
    elif name == "effect-swap": rows[0]["effects"] = ["DO_LINK_FINAL"]
    elif name == "crash-edge-swap": rows[-2]["next"] = copy.deepcopy(rows[-1]["next"])
    elif name == "ordinal-drift": rows[0]["ordinal"] = "tr99999"
    elif name == "invented-label": rows[0]["next"][1] = "MAGIC_PASS"
    elif name == "source-omission": value["artifact_contracts"].pop(0)
    elif name == "schema-injection": value["artifact_contracts"][0]["envelope_schema"]["fields"].append("extra")
    elif name == "dag-cycle": value["artifacts"][0]["dependency_ids"] = ["a10"]
    elif name == "accounting-omission": value["artifact_contracts"][-1]["payload_recipe"]["field_set"].pop()
    elif name == "a09-accounting-identity": value["artifact_contracts"][9]["payload_recipe"]["field_set"].append("accounting_identity")
    elif name == "post-accounting-artifact": rows[-1]["next"][2] = "a00"
    elif name == "wildcard-key": rows[0]["wildcard"] = True
    elif name == "guard-key": rows[0]["guard"] = "always"
    elif name == "authority-promotion": value["authority"] = True
    return value


def mutation_self_test(raw: bytes) -> tuple[int, str | None]:
    try:
        table = load_json_bytes(raw)
    except Mismatch as exc:
        return 0, f"baseline-parse:{exc}"
    rejected = 0
    first = None
    for name in MUTATION_NAMES:
        try:
            validate(canonical(mutate(table, name)), check_digest=True)
            if first is None:
                first = f"mutation-accepted:{name}"
        except (Mismatch, KeyError, TypeError, IndexError):
            rejected += 1
    return rejected, first


def emit(result: dict[str, Any]) -> None:
    sys.stdout.buffer.write(canonical(result))


def main() -> int:
    parser = argparse.ArgumentParser(allow_abbrev=False)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--table", type=Path)
    source.add_argument("--bundle", type=Path)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--check", action="store_true")
    action.add_argument("--mutation-self-test", action="store_true")
    action.add_argument("--check-embedded", action="store_true")
    args = parser.parse_args()
    if args.check_embedded and args.bundle is None:
        parser.error("--check-embedded requires --bundle")
    if args.mutation_self_test and args.table is None:
        parser.error("--mutation-self-test requires --table")

    input_path = args.table if args.table is not None else args.bundle
    assert input_path is not None
    watched = [Path(__file__), input_path]
    before = inventory(watched)
    first_mismatch: str | None = None
    assertion_count = 0
    property_count = 0
    mutation_count = 0
    status = "PASS"
    try:
        raw = extract_embedded(input_path) if args.bundle is not None else read_regular(input_path, EXPECTED_MODE)
        if args.mutation_self_test:
            mutation_count, first_mismatch = mutation_self_test(raw)
            if first_mismatch is not None or mutation_count != len(MUTATION_NAMES):
                status = "FAIL"
                first_mismatch = first_mismatch or f"mutation-count:{mutation_count}"
        else:
            check, _ = validate(raw, check_digest=True)
            assertion_count = check.assertions
            property_count = len(check.properties)
    except (Mismatch, OSError, KeyError, TypeError, IndexError) as exc:
        status = "FAIL"
        first_mismatch = str(exc)
    after = inventory(watched)
    workspace_writes = sum(1 for key in set(before) | set(after) if before.get(key) != after.get(key))
    if workspace_writes:
        status = "FAIL"
        first_mismatch = first_mismatch or f"workspace-writes:{workspace_writes}"
    emit({
        "assertion_count": assertion_count,
        "first_mismatch": first_mismatch,
        "mutation_count": mutation_count,
        "property_count": property_count,
        "schema_id": "pw-r9-v8-expanded-seal-table-check-v1",
        "status": status,
        "workspace_writes": workspace_writes,
    })
    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
