#!/usr/bin/env python3
"""Deterministic, zero-call compiler for plaintext native-Goal phase capsules."""

import argparse
import hashlib
import json
import math
import os
import re
import stat
import sys
from collections import Counter
from pathlib import Path


SCHEMA = "pw-r9-codex-native-goal-plaintext-phase-capsule-compiler-v1"
PUBLIC_SCHEMA = "pw-r9-codex-native-goal-plaintext-phase-capsule-public-manifest-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-plaintext-phase-capsule-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-plaintext-phase-capsule-node-v1"
SCORER_SCHEMA = "pw-r9-codex-native-goal-plaintext-phase-capsule-scorer-v1"
CAPACITY_SCHEMA = "pw-r9-codex-native-goal-plaintext-phase-capsule-capacity-report-v1"
RECEIPT_SCHEMA = "pw-r9-codex-native-goal-plaintext-phase-capsule-compile-receipt-v1"
PROTOCOL = "CODEX_NATIVE_GOAL_PLAINTEXT_PHASE_CAPSULE_V1"

ARCHITECTURE_REL = "r9_codex_native_goal_plaintext_phase_capsule_architecture_v1.json"
ARCHITECTURE_SHA = "8f542f50d9f9ebe60ef0270f709f8ef5c6937b999b04ddf0610fc4cde1210ea2"
ARCHITECTURE_BYTES = 6620
REVIEW_REL = "r9_codex_native_goal_plaintext_phase_capsule_design_review_success_receipt_v1.json"
REVIEW_SHA = "eac6356823e893624ba6f75aff310f29dc9247f5149be1e952527b1213e5a4f0"
REVIEW_BYTES = 3236
DECOMPOSITION_REL = "r9_codex_native_goal_atomic_manifest_compiler_v1.py"
DECOMPOSITION_SHA = "bdae122be76f64dafeb244fdde0aac8986e600cbb9d6fe7a14c2b6828eaa4c9e"
DECOMPOSITION_BYTES = 55381
SEMANTIC_REL = "formal_candidate_v7/semantic_bundle.json"
SEMANTIC_SHA = "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"
SEMANTIC_BYTES = 786546

PAYLOAD_MAX = 170
MESSAGE_MAX = 512
OBJECTIVE_MAX = 256
ACCEPTANCE_MAX = 256
ATOM_OUTPUT_MAX = 128
INTERMEDIATE_MAX = 48
WAIT_SECONDS = 60
EXACT_ATOMS = 15612
ATOMS_PER_ROUTE = 5204
ROUTES = (
    ("slot-alpha", "a", "gpt-5.4-mini", "xhigh"),
    ("slot-bravo", "b", "gpt-5.4-mini", "medium"),
    ("slot-charlie", "c", "gpt-5.6-luna", "medium"),
)
INTERMEDIATE_KINDS = {
    "EVIDENCE_SLICE_LABEL",
    "ENDPOINT_SLICE_LABEL",
    "PAIR_SIGNAL_REDUCER",
}
EXPECTED_PUBLIC_TOKENS = {
    "expected_output",
    "expected_output_bytes",
    "expected_output_sha256",
    "expected_output_storage_bytes",
    "expected_output_storage_sha256",
    "expected_output_utf8",
}
NONCE_TOKEN = "${ATOM_NONCE}"
PAYLOAD_SHA_TOKEN = "${SUBJECT_PAYLOAD_SHA256}"
PAYLOAD_TOKEN = "${SUBJECT_PAYLOAD_UTF8}"


class Invalid(Exception):
    pass


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical_no_lf(value):
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise Invalid(f"not finite JSON: {exc}") from exc


def canonical(value):
    return canonical_no_lf(value) + b"\n"


def pairs(pairs_value):
    out = {}
    for key, value in pairs_value:
        if key in out:
            raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def parse_json_bytes(data, label, require_canonical=False):
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(ValueError(token)),
        )
    except Exception as exc:
        raise Invalid(f"invalid JSON {label}: {exc}") from exc
    if require_canonical and canonical(value) != data:
        raise Invalid(f"noncanonical JSON: {label}")
    return value


def read_regular(path):
    try:
        before = os.lstat(path)
    except OSError as exc:
        raise Invalid(f"cannot stat {path}: {exc}") from exc
    if not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode):
        raise Invalid(f"not regular nonlink: {path}")
    try:
        data = path.read_bytes()
        after = os.lstat(path)
    except OSError as exc:
        raise Invalid(f"cannot read {path}: {exc}") from exc
    if (before.st_dev, before.st_ino, before.st_size) != (
        after.st_dev,
        after.st_ino,
        after.st_size,
    ):
        raise Invalid(f"identity drift: {path}")
    return data, after


def bind(path, expected_sha, expected_bytes):
    data, st = read_regular(path)
    if (
        len(data) != expected_bytes
        or sha(data) != expected_sha
        or stat.S_IMODE(st.st_mode) != 0o644
    ):
        raise Invalid(f"binding mismatch: {path}")
    return data


def exact_record(text):
    data = text.encode("utf-8")
    return {"bytes": len(data), "kind": "EXACT_UTF8", "sha256": sha(data), "utf8": text}


def template_record(template, materialized_max, placeholders):
    template_data = template.encode("utf-8")
    maximum = len(materialized_max.encode("utf-8"))
    return {
        "kind": "EXACT_UTF8_ADMISSION_TEMPLATE",
        "max_materialized_bytes": maximum,
        "placeholders": placeholders,
        "template_bytes": len(template_data),
        "template_sha256": sha(template_data),
        "utf8_template": template,
    }


def bootstrap_message(objective):
    return (
        f'Create native Goal with exact objective "{objective}". Before files or subject work, '
        "send exact ACTIVE Goal receipt JSON to /root; wait for one CONTROL. Do nothing else. "
        "No reuse or retry."
    )


def control_message(attempt_id, nonce, route_code, criterion, output_contract, payload_sha):
    return (
        f"CONTROL a={attempt_id} n={nonce} r={route_code}. Criterion: {criterion} "
        f"Output: {output_contract} Subject SHA-256: {payload_sha}. Call get_goal; require "
        "same active thread; send exact receipt JSON to /root; send only BOUND; wait for one "
        "SUBJECT. Do no subject work."
    )


def subject_message(attempt_id, nonce, atom_id, payload_utf8):
    return (
        f"SUBJECT a={attempt_id} n={nonce} i={atom_id}. Payload: {payload_utf8} Call get_goal; "
        "require same active thread; send exact receipt JSON to /root; apply bound "
        "criterion/output once; send only compact result; call update_goal complete; send exact "
        "terminal receipt JSON; return SETTLED."
    )


def abort_message(attempt_id, nonce):
    return (
        f"ABORT a={attempt_id} n={nonce}. Discard pending work. If Goal active, call "
        "update_goal complete and send exact terminal receipt JSON to /root. Return FAILED."
    )


def validate_message_record(record):
    if record["kind"] == "EXACT_UTF8":
        data = record["utf8"].encode("utf-8")
        if record["bytes"] != len(data) or record["sha256"] != sha(data):
            raise Invalid("exact message record mismatch")
        maximum = record["bytes"]
    elif record["kind"] == "EXACT_UTF8_ADMISSION_TEMPLATE":
        data = record["utf8_template"].encode("utf-8")
        if record["template_bytes"] != len(data) or record["template_sha256"] != sha(data):
            raise Invalid("message template record mismatch")
        maximum = record["max_materialized_bytes"]
    else:
        raise Invalid("unknown phase message record kind")
    if maximum > MESSAGE_MAX:
        raise Invalid(f"phase message exceeds {MESSAGE_MAX} bytes")
    return maximum


def validate_architecture_sample(architecture):
    if architecture.get("schema_id") != "pw-r9-codex-native-goal-plaintext-phase-capsule-architecture-v1":
        raise Invalid("architecture schema mismatch")
    if architecture.get("design", {}).get("fork_turns") != "none":
        raise Invalid("architecture fork_turns mismatch")
    messages = architecture.get("sample_messages")
    identity = architecture.get("sample_identity")
    if not isinstance(messages, dict) or set(messages) != {"ABORT", "BOOTSTRAP", "CONTROL", "SUBJECT"}:
        raise Invalid("architecture sample message set mismatch")
    if not isinstance(identity, dict):
        raise Invalid("architecture sample identity missing")
    for record in messages.values():
        if set(record) != {"bytes", "sha256", "utf8"}:
            raise Invalid("architecture sample record shape mismatch")
        if exact_record(record["utf8"]) != {**record, "kind": "EXACT_UTF8"}:
            raise Invalid("architecture sample record identity mismatch")
    bootstrap = messages["BOOTSTRAP"]["utf8"]
    objective_match = re.fullmatch(
        r'Create native Goal with exact objective "(.*)"\. Before files or subject work, send exact ACTIVE Goal receipt JSON to /root; wait for one CONTROL\. Do nothing else\. No reuse or retry\.',
        bootstrap,
    )
    if objective_match is None or bootstrap_message(objective_match.group(1)) != bootstrap:
        raise Invalid("architecture BOOTSTRAP sample mismatch")
    control = messages["CONTROL"]["utf8"]
    control_match = re.fullmatch(
        r"CONTROL a=([0-9a-f]{24}) n=([0-9a-f]{64}) r=([abc])\. Criterion: (.*?) Output: (.*?) Subject SHA-256: ([0-9a-f]{64})\. Call get_goal; require same active thread; send exact receipt JSON to /root; send only BOUND; wait for one SUBJECT\. Do no subject work\.",
        control,
    )
    if control_match is None or control_message(*control_match.groups()) != control:
        raise Invalid("architecture CONTROL sample mismatch")
    subject = messages["SUBJECT"]["utf8"]
    subject_match = re.fullmatch(
        r"SUBJECT a=([0-9a-f]{24}) n=([0-9a-f]{64}) i=(n[0-9]{5})\. Payload: (.*) Call get_goal; require same active thread; send exact receipt JSON to /root; apply bound criterion/output once; send only compact result; call update_goal complete; send exact terminal receipt JSON; return SETTLED\.",
        subject,
    )
    if subject_match is None or subject_message(*subject_match.groups()) != subject:
        raise Invalid("architecture SUBJECT sample mismatch")
    abort = messages["ABORT"]["utf8"]
    abort_match = re.fullmatch(
        r"ABORT a=([0-9a-f]{24}) n=([0-9a-f]{64})\. Discard pending work\. If Goal active, call update_goal complete and send exact terminal receipt JSON to /root\. Return FAILED\.",
        abort,
    )
    if abort_match is None or abort_message(*abort_match.groups()) != abort:
        raise Invalid("architecture ABORT sample mismatch")
    if (
        control_match.group(1) != identity.get("attempt_id")
        or control_match.group(2) != identity.get("atom_nonce")
        or identity.get("task_name") != "r9_cgra_" + identity.get("atom_nonce", "")
        or subject_match.group(1) != identity.get("attempt_id")
        or subject_match.group(2) != identity.get("atom_nonce")
        or abort_match.groups() != (identity.get("attempt_id"), identity.get("atom_nonce"))
    ):
        raise Invalid("architecture sample cross-message identity mismatch")


def load_semantic_engine(base):
    source = bind(base / DECOMPOSITION_REL, DECOMPOSITION_SHA, DECOMPOSITION_BYTES)
    namespace = {
        "__file__": str(base / DECOMPOSITION_REL),
        "__name__": "_r9_bound_semantic_decomposition",
        "__package__": None,
    }
    try:
        exec(compile(source, str(base / DECOMPOSITION_REL), "exec"), namespace)
    except Exception as exc:
        raise Invalid(f"cannot load bound semantic decomposition: {exc}") from exc
    if namespace.get("SCHEMA") != "pw-r9-codex-native-goal-atomic-manifest-compiler-v1":
        raise Invalid("semantic decomposition source schema mismatch")
    required = ("validate_semantic", "compile_cell", "materialize_template_max")
    if any(not callable(namespace.get(name)) for name in required):
        raise Invalid("semantic decomposition source symbols missing")
    return namespace


def message_template_records(node, maximum_payload):
    aid = node["attempt_id"]
    atom_id = node["atom_id"]
    route_code = node["route_code"]
    criterion = node["acceptance_criterion"]["utf8"]
    output_contract = node["output_contract"]["utf8"]
    goal = node["goal_objective"]["utf8"]
    maximum_payload_utf8 = maximum_payload.decode("utf-8")
    fixed_nonce = "0" * 64
    fixed_payload_sha = "0" * 64
    records = {
        "ABORT": template_record(
            abort_message(aid, NONCE_TOKEN),
            abort_message(aid, fixed_nonce),
            ["ATOM_NONCE"],
        ),
        "BOOTSTRAP": exact_record(bootstrap_message(goal)),
        "CONTROL": template_record(
            control_message(aid, NONCE_TOKEN, route_code, criterion, output_contract, PAYLOAD_SHA_TOKEN),
            control_message(aid, fixed_nonce, route_code, criterion, output_contract, fixed_payload_sha),
            ["ATOM_NONCE", "SUBJECT_PAYLOAD_SHA256"],
        ),
        "SUBJECT": template_record(
            subject_message(aid, NONCE_TOKEN, atom_id, PAYLOAD_TOKEN),
            subject_message(aid, fixed_nonce, atom_id, maximum_payload_utf8),
            ["ATOM_NONCE", "SUBJECT_PAYLOAD_UTF8"],
        ),
    }
    for record in records.values():
        validate_message_record(record)
    return records


def exact_message_records(node):
    aid = node["attempt_id"]
    nonce = node["atom_nonce"]
    payload = node["subject_payload"]["utf8"]
    payload_sha = node["subject_payload"]["sha256"]
    records = {
        "ABORT": exact_record(abort_message(aid, nonce)),
        "BOOTSTRAP": exact_record(bootstrap_message(node["goal_objective"]["utf8"])),
        "CONTROL": exact_record(
            control_message(
                aid,
                nonce,
                node["route_code"],
                node["acceptance_criterion"]["utf8"],
                node["output_contract"]["utf8"],
                payload_sha,
            )
        ),
        "SUBJECT": exact_record(subject_message(aid, nonce, node["atom_id"], payload)),
    }
    for record in records.values():
        validate_message_record(record)
    return records


def transform_node(old, engine, matrix_id, cell_index, route):
    common_keys = (
        "acceptance_criterion",
        "atom_id",
        "atom_path",
        "attempt",
        "attempt_id",
        "dependencies",
        "dynamic",
        "goal_objective",
        "kind",
        "output_contract",
        "result_max_bytes",
        "result_validation",
        "route_code",
    )
    node = {key: old[key] for key in common_keys}
    node.update(
        {
            "fork_turns": "none",
            "one_subject_atom_per_goal": True,
            "protocol": PROTOCOL,
            "result_class": (
                "INTERMEDIATE_COMPACT" if old["kind"] in INTERMEDIATE_KINDS else "FINAL_ATOM_OUTPUT"
            ),
            "schema_id": NODE_SCHEMA,
        }
    )
    if len(node["goal_objective"]["utf8"].encode("utf-8")) > OBJECTIVE_MAX:
        raise Invalid("goal objective byte limit")
    if len(node["acceptance_criterion"]["utf8"].encode("utf-8")) > ACCEPTANCE_MAX:
        raise Invalid("acceptance criterion byte limit")
    if node["result_class"] == "INTERMEDIATE_COMPACT" and node["result_max_bytes"] > INTERMEDIATE_MAX:
        raise Invalid("intermediate compact result byte limit")
    if node["result_max_bytes"] > ATOM_OUTPUT_MAX:
        raise Invalid("atom output byte limit")
    if old["dynamic"]:
        subject_template = old["subject_template"]
        maximum_payload = engine["materialize_template_max"](subject_template)
        if len(maximum_payload) != subject_template["max_payload_bytes"] or len(maximum_payload) > PAYLOAD_MAX:
            raise Invalid("dynamic subject payload bound mismatch")
        node.update(
            {
                "admission_identity": {
                    "atom_nonce_canonical_input": [
                        matrix_id,
                        cell_index,
                        route,
                        old["atom_path"],
                        old["kind"],
                        "${SUBJECT_PAYLOAD_SHA256}",
                    ],
                    "atom_nonce_rule": "SHA256_CANONICAL_JSON_NO_LF_AFTER_PAYLOAD_MATERIALIZATION",
                    "fresh_task_name_rule": "r9_cgra_${ATOM_NONCE}",
                    "prior_v1_consumed_identity_reuse": "PROHIBITED",
                },
                "phase_messages": message_template_records(old, maximum_payload),
                "phase_messages_kind": "MATERIALIZE_EXACTLY_ONCE_AT_DYNAMIC_ADMISSION_BEFORE_SPAWN",
                "subject_template": subject_template,
            }
        )
    else:
        if old["subject_payload"]["bytes"] > PAYLOAD_MAX:
            raise Invalid("static subject payload byte limit")
        node.update(
            {
                "atom_nonce": old["atom_nonce"],
                "phase_messages": exact_message_records(old),
                "phase_messages_kind": "COMPILED_EXACT_PLAINTEXT",
                "subject_payload": old["subject_payload"],
                "task_name": old["task_name"],
            }
        )
    return node


def compile_cell(engine, cell, matrix_id, route, route_code, model, effort):
    old = engine["compile_cell"](cell, matrix_id, route, route_code, model, effort)
    nodes = [
        transform_node(node, engine, matrix_id, cell["index"], route)
        for node in old["nodes"]
    ]
    return {
        "assembly_recipe": old["assembly_recipe"],
        "cell": old["cell"],
        "cell_index": old["cell_index"],
        "compiler_family": old["compiler_family"],
        "context_coverage": old["context_coverage"],
        "context_identity": old["context_identity"],
        "control_manifest_projection_bytes": old["control_manifest_projection_bytes"],
        "control_manifest_sha256": old["control_manifest_sha256"],
        "controller_protocol": PROTOCOL,
        "dependency_gate": old["dependency_gate"],
        "final_node_ids": old["final_node_ids"],
        "fork_turns": "none",
        "matrix_id": old["matrix_id"],
        "model_requested": old["model_requested"],
        "nodes": nodes,
        "reasoning_effort_requested": old["reasoning_effort_requested"],
        "root_signal_node_id": old["root_signal_node_id"],
        "route": old["route"],
        "route_code": old["route_code"],
        "schema_id": CELL_SCHEMA,
        "source_shape": old["source_shape"],
    }


def public_key_scan(value, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in EXPECTED_PUBLIC_TOKENS or key.startswith("expected_"):
                raise Invalid(f"expected-value field leaked to public manifest: {path}/{key}")
            public_key_scan(child, path + "/" + key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            public_key_scan(child, path + "/" + str(index))


def validate_review(review):
    if review.get("schema_id") != "pw-r9-codex-native-goal-plaintext-phase-capsule-design-review-success-receipt-v1":
        raise Invalid("design review schema mismatch")
    if review.get("verdict") != "CAPSULE|PASS|NONE":
        raise Invalid("design review verdict mismatch")
    authority = review.get("authority", {})
    if not authority.get("compiler_implementation") or any(
        authority.get(key)
        for key in ("canary_launch", "empirical_launch", "matrix_launch", "qualification", "release")
    ):
        raise Invalid("design review authority mismatch")


def make_outputs(base, matrix_id):
    architecture = parse_json_bytes(
        bind(base / ARCHITECTURE_REL, ARCHITECTURE_SHA, ARCHITECTURE_BYTES),
        ARCHITECTURE_REL,
        require_canonical=True,
    )
    review = parse_json_bytes(
        bind(base / REVIEW_REL, REVIEW_SHA, REVIEW_BYTES),
        REVIEW_REL,
        require_canonical=True,
    )
    semantic = parse_json_bytes(
        bind(base / SEMANTIC_REL, SEMANTIC_SHA, SEMANTIC_BYTES),
        SEMANTIC_REL,
        require_canonical=True,
    )
    validate_architecture_sample(architecture)
    validate_review(review)
    engine = load_semantic_engine(base)
    cells, family_counts, shape_counts = engine["validate_semantic"](semantic)

    public_files = {}
    scorer_cells = []
    cell_index_rows = []
    atom_counts = Counter()
    route_atom_counts = Counter()
    attempt_ids = set()
    static_nonces = set()
    static_tasks = set()
    max_dag_depth = 0
    max_message_bytes = 0
    max_payload_bytes = 0
    max_objective_bytes = 0
    for route, route_code, model, effort in ROUTES:
        for cell in cells:
            compiled = compile_cell(engine, cell, matrix_id, route, route_code, model, effort)
            relative = f"cells/cell-{cell['index']:03d}/{route}.json"
            cell_bytes = canonical(compiled)
            public_files[relative] = cell_bytes
            kinds = Counter(node["kind"] for node in compiled["nodes"])
            atom_counts.update(kinds)
            route_atom_counts[route] += len(compiled["nodes"])
            depth = {}
            for node in compiled["nodes"]:
                if node["attempt_id"] in attempt_ids:
                    raise Invalid("attempt identity collision")
                attempt_ids.add(node["attempt_id"])
                depth[node["atom_id"]] = 1 + max(
                    (depth[item] for item in node["dependencies"]), default=0
                )
                max_objective_bytes = max(max_objective_bytes, node["goal_objective"]["bytes"])
                for record in node["phase_messages"].values():
                    max_message_bytes = max(max_message_bytes, validate_message_record(record))
                if node["dynamic"]:
                    max_payload_bytes = max(max_payload_bytes, node["subject_template"]["max_payload_bytes"])
                else:
                    if node["atom_nonce"] in static_nonces or node["task_name"] in static_tasks:
                        raise Invalid("static atom identity collision")
                    static_nonces.add(node["atom_nonce"])
                    static_tasks.add(node["task_name"])
                    max_payload_bytes = max(max_payload_bytes, node["subject_payload"]["bytes"])
            max_dag_depth = max(max_dag_depth, max(depth.values()))
            cell_index_rows.append(
                {
                    "atom_count": len(compiled["nodes"]),
                    "cell": cell["cell"],
                    "cell_file": {"bytes": len(cell_bytes), "path": relative, "sha256": sha(cell_bytes)},
                    "cell_index": cell["index"],
                    "compiler_family": compiled["compiler_family"],
                    "model_requested": model,
                    "reasoning_effort_requested": effort,
                    "route": route,
                }
            )
    for cell in cells:
        scorer_cells.append(
            {
                "cell": cell["cell"],
                "cell_index": cell["index"],
                "expected_output_bytes": cell["expected_output_bytes"],
                "expected_output_sha256": cell["expected_output_sha256"],
                "expected_output_utf8": cell["expected_output_utf8"],
            }
        )

    total_atoms = sum(atom_counts.values())
    required_routes = {route: ATOMS_PER_ROUTE for route, _code, _model, _effort in ROUTES}
    if total_atoms != EXACT_ATOMS or dict(route_atom_counts) != required_routes:
        raise Invalid(f"finite atom capacity mismatch: total={total_atoms} routes={dict(route_atom_counts)}")
    if len(attempt_ids) != EXACT_ATOMS:
        raise Invalid("attempt identity cardinality mismatch")
    if max_message_bytes > MESSAGE_MAX or max_objective_bytes > OBJECTIVE_MAX or max_payload_bytes > PAYLOAD_MAX:
        raise Invalid("compiled prompt capacity exceeds protocol limits")
    test_taker_waves = math.ceil(total_atoms / 3)
    capacity = {
        "agent_message_max_utf8_bytes": MESSAGE_MAX,
        "atom_kind_counts": dict(sorted(atom_counts.items())),
        "atom_output_max_utf8_bytes": ATOM_OUTPUT_MAX,
        "collaboration_slot_count": 4,
        "controller_slot_count": 1,
        "exact_atom_count": total_atoms,
        "fork_turns": "none",
        "fresh_goal_count": total_atoms,
        "goal_objective_max_utf8_bytes": OBJECTIVE_MAX,
        "intermediate_compact_result_max_utf8_bytes": INTERMEDIATE_MAX,
        "matrix_id": matrix_id,
        "max_compiled_or_admission_message_bytes": max_message_bytes,
        "max_dag_depth": max_dag_depth,
        "max_goal_objective_bytes": max_objective_bytes,
        "max_subject_payload_bytes": max_payload_bytes,
        "max_concurrent_test_takers": 3,
        "omp_dependency": False,
        "provider_model_subject_call_authority": False,
        "qualification_credit": 0,
        "route_atom_counts": dict(sorted(route_atom_counts.items())),
        "schema_id": CAPACITY_SCHEMA,
        "semantic_cell_count": 97,
        "semantic_cell_route_outcome_count": 291,
        "subject_atom_count": total_atoms,
        "subject_atoms_per_goal": 1,
        "subject_payload_max_utf8_bytes": PAYLOAD_MAX,
        "test_taker_full_wait_upper_bound_seconds": test_taker_waves * WAIT_SECONDS,
        "test_taker_wave_count": test_taker_waves,
        "total_full_wait_upper_bound_seconds_if_serial": total_atoms * WAIT_SECONDS,
        "unbounded_loop": False,
    }
    capacity_bytes = canonical(capacity)
    public_files["capacity.json"] = capacity_bytes
    manifest = {
        "authority": {
            "canary_launch": False,
            "empirical_launch": False,
            "matrix_launch": False,
            "provider_model_subject_calls": False,
            "qualification": False,
            "release": False,
            "static_data_only_checks": True,
        },
        "bindings": {
            "architecture": {"bytes": ARCHITECTURE_BYTES, "path": ARCHITECTURE_REL, "sha256": ARCHITECTURE_SHA},
            "design_review": {"bytes": REVIEW_BYTES, "path": REVIEW_REL, "sha256": REVIEW_SHA},
            "semantic_bundle": {"bytes": SEMANTIC_BYTES, "path": SEMANTIC_REL, "sha256": SEMANTIC_SHA},
            "semantic_decomposition_source": {
                "bytes": DECOMPOSITION_BYTES,
                "path": DECOMPOSITION_REL,
                "sha256": DECOMPOSITION_SHA,
                "use": "SEMANTIC_DECOMPOSITION_ONLY_NO_V1_WIRE_PROTOCOL_OUTPUT",
            },
        },
        "capacity": {"bytes": len(capacity_bytes), "path": "capacity.json", "sha256": sha(capacity_bytes)},
        "cells": cell_index_rows,
        "compiler_families": dict(sorted(family_counts.items())),
        "controller_protocol": PROTOCOL,
        "fresh_identity_contract": {
            "fresh_matrix_id_each_run": True,
            "fresh_native_goal_per_atom": True,
            "no_retry_relaunch_replacement_or_reuse": True,
            "prior_v1_consumed_identity_reuse": "PROHIBITED",
        },
        "matrix_id": matrix_id,
        "phase_order": [
            "PREDECLARATION",
            "SPAWN_ARGUMENT_BOOTSTRAP_FORK_TURNS_NONE",
            "ACTIVE_GOAL_RECEIPT_RAW",
            "CONTROL",
            "PRE_CONTROL_GET_GOAL_RAW",
            "BOUND",
            "SUBJECT",
            "PRE_SUBJECT_GET_GOAL_RAW",
            "COMPACT_RESULT",
            "TERMINAL_GOAL_RECEIPT_RAW",
            "TASK_FINAL",
            "ACCOUNTING",
        ],
        "public_scorer_separation": "PUBLIC_ROOT_CONTAINS_NO_EXPECTED_VALUE_FIELDS_OR_SCORER_PATH",
        "qualification_credit": 0,
        "route_roster": [
            {"model_requested": model, "reasoning_effort_requested": effort, "route": route}
            for route, _code, model, effort in ROUTES
        ],
        "schema_id": PUBLIC_SCHEMA,
        "source_shape_combinations": dict(sorted(shape_counts.items())),
        "status": "COMPILED_STATIC_PLAINTEXT_PHASE_CAPSULE_DAGS_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY",
    }
    public_key_scan(manifest)
    for data in public_files.values():
        public_key_scan(parse_json_bytes(data, "public output", True))
    public_files["manifest.json"] = canonical(manifest)
    scorer = {
        "cell_count": 97,
        "cells": scorer_cells,
        "comparator": "EXACT_UTF8_AND_SHA256_AFTER_PUBLIC_RECIPE_ASSEMBLY",
        "matrix_id": matrix_id,
        "qualification_credit": 0,
        "route_outcome_count": 291,
        "schema_id": SCORER_SCHEMA,
        "semantic_bundle": {"bytes": SEMANTIC_BYTES, "sha256": SEMANTIC_SHA},
    }
    return public_files, {"manifest.json": canonical(scorer)}, capacity


def safe_relative(relative):
    path = Path(relative)
    if path.is_absolute() or not path.parts or any(part in {"", ".", ".."} for part in path.parts):
        raise Invalid(f"unsafe relative path: {relative}")
    return path


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def mkdir_exact(path, mode=0o700):
    os.mkdir(path, mode)
    os.chmod(path, mode, follow_symlinks=False)
    st = os.lstat(path)
    if not stat.S_ISDIR(st.st_mode) or stat.S_ISLNK(st.st_mode) or stat.S_IMODE(st.st_mode) != mode:
        raise Invalid(f"directory custody mismatch: {path}")
    fsync_dir(path.parent)


def write_exact(path, data):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags, 0o600)
    try:
        offset = 0
        while offset < len(data):
            written = os.write(fd, data[offset:])
            if written <= 0:
                raise Invalid(f"short write: {path}")
            offset += written
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, 0o644, follow_symlinks=False)
    reopened, st = read_regular(path)
    if reopened != data or stat.S_IMODE(st.st_mode) != 0o644:
        raise Invalid(f"write reopen mismatch: {path}")
    fsync_dir(path.parent)


def materialize_root(root, files):
    if not root.is_absolute():
        raise Invalid("output root must be absolute")
    if os.path.lexists(root):
        raise Invalid(f"output root exists: {root}")
    mkdir_exact(root)
    directories = {Path(".")}
    for relative in files:
        parent = safe_relative(relative).parent
        while parent != Path("."):
            directories.add(parent)
            parent = parent.parent
    for relative in sorted(directories, key=lambda item: (len(item.parts), item.as_posix())):
        if relative != Path("."):
            mkdir_exact(root / relative)
    inventory = []
    for relative in sorted(files):
        data = files[relative]
        write_exact(root / safe_relative(relative), data)
        inventory.append({"bytes": len(data), "path": relative, "sha256": sha(data)})
    inventory_bytes = canonical(inventory)
    write_exact(root / "inventory.json", inventory_bytes)
    all_rows = inventory + [
        {"bytes": len(inventory_bytes), "path": "inventory.json", "sha256": sha(inventory_bytes)}
    ]
    projection = canonical_no_lf(all_rows)
    return {
        "file_count": len(all_rows),
        "inventory_bytes": len(inventory_bytes),
        "inventory_sha256": sha(inventory_bytes),
        "projection_bytes": len(projection),
        "projection_sha256": sha(projection),
    }


def validate_matrix_id(value):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", value):
        raise Invalid("matrix-id must match [a-z0-9][a-z0-9-]{0,62}")
    if value == "check-only-matrix":
        raise Invalid("matrix-id is reserved for data-only checking")
    return value


def projection(files):
    return canonical_no_lf(
        [{"bytes": len(data), "path": path, "sha256": sha(data)} for path, data in sorted(files.items())]
    )


def do_check(base):
    public_files, scorer_files, capacity = make_outputs(base, "check-only-matrix")
    public_projection = projection(public_files)
    scorer_projection = projection(scorer_files)
    return {
        "authority": {
            "empirical_launch": False,
            "provider_model_subject_calls": False,
            "qualification": False,
        },
        "capacity": capacity,
        "check": "PASS",
        "first_mismatch": None,
        "public_projection_bytes": len(public_projection),
        "public_projection_sha256": sha(public_projection),
        "schema_id": SCHEMA,
        "scorer_projection_bytes": len(scorer_projection),
        "scorer_projection_sha256": sha(scorer_projection),
        "workspace_writes": 0,
    }


def do_compile(base, matrix_id, public_root, scorer_root, receipt_path):
    public_resolved = public_root.resolve(strict=False)
    scorer_resolved = scorer_root.resolve(strict=False)
    if (
        public_resolved == scorer_resolved
        or public_resolved.is_relative_to(scorer_resolved)
        or scorer_resolved.is_relative_to(public_resolved)
    ):
        raise Invalid("public and scorer roots must be disjoint and non-nested")
    if receipt_path is not None and (
        receipt_path.resolve(strict=False).is_relative_to(public_resolved)
        or receipt_path.resolve(strict=False).is_relative_to(scorer_resolved)
    ):
        raise Invalid("receipt must be outside public and scorer roots")
    public_files, scorer_files, capacity = make_outputs(base, matrix_id)
    public_identity = materialize_root(public_root, public_files)
    scorer_identity = materialize_root(scorer_root, scorer_files)
    receipt = {
        "authority": {
            "empirical_launch": False,
            "provider_model_subject_calls": False,
            "qualification": False,
        },
        "capacity": capacity,
        "matrix_id": matrix_id,
        "public_root": {"lexical_path": str(public_root), **public_identity},
        "qualification_credit": 0,
        "schema_id": RECEIPT_SCHEMA,
        "scorer_root": {"lexical_path": str(scorer_root), **scorer_identity},
        "status": "COMPILED_CREATE_ONLY_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY",
    }
    if receipt_path is not None:
        if not receipt_path.is_absolute():
            raise Invalid("receipt path must be absolute")
        write_exact(receipt_path, canonical(receipt))
    return receipt


def parser():
    result = argparse.ArgumentParser()
    sub = result.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check")
    check.add_argument("--base", type=Path, required=True)
    compile_cmd = sub.add_parser("compile")
    compile_cmd.add_argument("--base", type=Path, required=True)
    compile_cmd.add_argument("--matrix-id", required=True)
    compile_cmd.add_argument("--public-root", type=Path, required=True)
    compile_cmd.add_argument("--scorer-root", type=Path, required=True)
    compile_cmd.add_argument("--receipt", type=Path)
    return result


def main():
    args = parser().parse_args()
    try:
        base = args.base.resolve(strict=True)
        if args.command == "check":
            result = do_check(base)
        else:
            result = do_compile(
                base,
                validate_matrix_id(args.matrix_id),
                args.public_root,
                args.scorer_root,
                args.receipt,
            )
        sys.stdout.buffer.write(canonical(result))
        return 0
    except Exception as exc:
        failure = {
            "check": "FAIL",
            "error": str(exc),
            "error_type": type(exc).__name__,
            "schema_id": SCHEMA,
        }
        sys.stdout.buffer.write(canonical(failure))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
