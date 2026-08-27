#!/usr/bin/env python3
"""Deterministic, zero-call compiler for the R9 Codex-native Goal atom DAG."""

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


SCHEMA = "pw-r9-codex-native-goal-atomic-manifest-compiler-v1"
PUBLIC_SCHEMA = "pw-r9-codex-native-goal-atomic-public-manifest-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-atomic-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-atomic-node-v1"
SCORER_SCHEMA = "pw-r9-codex-native-goal-atomic-scorer-v1"
CAPACITY_SCHEMA = "pw-r9-codex-native-goal-atomic-capacity-report-v1"
RECEIPT_SCHEMA = "pw-r9-codex-native-goal-atomic-compile-receipt-v1"

SEMANTIC_REL = "formal_candidate_v7/semantic_bundle.json"
SEMANTIC_SHA = "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"
SEMANTIC_BYTES = 786546
DESIGN_REL = "r9_codex_native_goal_resident_atomic_mailbox_implementation_design_v1.json"
DESIGN_SHA = "dfa5e1ebdb2121eeca287230ae20fef6767c45cf457bffce24dfbdf5bf35fa48"
DESIGN_BYTES = 17552
REVIEW_REL = "r9_codex_native_goal_resident_atomic_mailbox_implementation_design_v1_independent_goal_review_002_success_receipt_v1.json"
REVIEW_SHA = "fec63239f075d55d892dc48dffce772973a7714e92d420ca3eec9941ee8b87aa"
REVIEW_BYTES = 7410
CONTRACT_REL = "r9_codex_native_goal_resident_atomic_mailbox_controller_contract_v1.json"
CONTRACT_SHA = "0042f2da4d9fdb8bd736f792c943147ab983df2f07a8c7e37ca204d74ea5328e"
CONTRACT_BYTES = 10651

PAYLOAD_MAX = 170
ENVELOPE_MAX = 512
OBJECTIVE_MAX = 256
ACCEPTANCE_MAX = 256
OUTPUT_MAX = 128
INTERMEDIATE_MAX = 48
EDGE_SIGNAL_MAX = 32
ROOT_DECISION_SIGNAL_MAX = 16
WAIT_SECONDS = 60
ROUTES = (
    ("slot-alpha", "a", "gpt-5.4-mini", "xhigh"),
    ("slot-bravo", "b", "gpt-5.4-mini", "medium"),
    ("slot-charlie", "c", "gpt-5.6-luna", "medium"),
)
CONTEXT_RE = re.compile(
    r"\n(BEGIN_[A-Z0-9_]+_CONTEXT)\n(.*?)\n(END_[A-Z0-9_]+_CONTEXT)\n?$",
    re.DOTALL,
)
STRUCTURAL_KEYS = {
    "authority",
    "decision_id",
    "edge_id",
    "end_line",
    "from",
    "id",
    "lane",
    "path",
    "purpose",
    "source_record_id",
    "source_record_ids",
    "source_sha256",
    "start_line",
    "to",
    "topic_id",
    "type",
}
EXPECTED_PUBLIC_TOKENS = {
    "expected_output",
    "expected_output_bytes",
    "expected_output_sha256",
    "expected_output_storage_bytes",
    "expected_output_storage_sha256",
    "expected_output_utf8",
}


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


def pointer_escape(part):
    return str(part).replace("~", "~0").replace("/", "~1")


def scalars(value, pointer=""):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from scalars(child, pointer + "/" + pointer_escape(key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from scalars(child, pointer + "/" + str(index))
    else:
        yield pointer or "/", value


def last_pointer_key(pointer):
    parts = pointer.split("/")[1:]
    while parts and parts[-1].isdigit():
        parts.pop()
    if not parts:
        return "value"
    return parts[-1].replace("~1", "/").replace("~0", "~")


def source_shape(cell_name):
    for prefix in (
        "S10A_DECISION",
        "S10A_EDGE",
        "S10A_TENSION",
        "S10B_DECISION",
        "S10B_EDGE",
        "S10B_TENSION",
        "S30_",
        "S50_",
        "S60_",
    ):
        if cell_name.startswith(prefix):
            return prefix.rstrip("_")
    raise Invalid(f"unknown source shape: {cell_name}")


def family(marker):
    mapping = {
        "BEGIN_SINGLE_DECISION_CONTEXT": "DECISION_SELECTOR",
        "BEGIN_ANSWER_FIRST_DECISION_CONTEXT": "DECISION_SELECTOR",
        "BEGIN_SINGLE_EDGE_CONTEXT": "EDGE_JUDGE",
        "BEGIN_SINGLE_TENSION_CONTEXT": "TENSION_JUDGE",
        "BEGIN_COMPACT_INTEGRATION_CONTEXT": "CROSS_TOPIC_EDGE_SET",
        "BEGIN_SINGLE_NEW_EDGE_CONTEXT": "SPECIALIST_CLASSIFIER",
    }
    try:
        return mapping[marker]
    except KeyError as exc:
        raise Invalid(f"unknown context marker: {marker}") from exc


def disposition(pointer, compiler_family):
    parts = pointer.split("/")[1:]
    if compiler_family == "CROSS_TOPIC_EDGE_SET":
        if (
            len(parts) == 3
            and parts[0] == "endpoint_decisions"
            and parts[1].isdigit()
            and parts[2] == "choice"
        ) or (
            len(parts) == 3
            and parts[0] == "edge_candidates"
            and parts[1].isdigit()
            and parts[2] in {"statement", "type"}
        ):
            return "MODEL_EXPOSED_SLICE"
        return "DETERMINISTIC_ASSEMBLY_FIELD"
    key = last_pointer_key(pointer)
    if key not in STRUCTURAL_KEYS:
        return "MODEL_EXPOSED_SLICE"
    if compiler_family in {"CROSS_TOPIC_EDGE_SET", "SPECIALIST_CLASSIFIER"}:
        return "DETERMINISTIC_ASSEMBLY_FIELD"
    return "CONTROL_FIELD"


def s50_binding(pointer, context):
    parts = pointer.split("/")[1:]
    if len(parts) != 3 or not parts[1].isdigit():
        return None
    index = int(parts[1])
    if parts[0] == "endpoint_decisions" and parts[2] == "choice":
        rows = context.get("endpoint_decisions")
        if not isinstance(rows, list) or index >= len(rows):
            raise Invalid("S50 endpoint binding index mismatch")
        return {"d": rows[index]["id"], "k": "choice"}
    if parts[0] == "edge_candidates" and parts[2] in {"statement", "type"}:
        rows = context.get("edge_candidates")
        if not isinstance(rows, list) or index >= len(rows):
            raise Invalid("S50 edge binding index mismatch")
        return {"i": rows[index]["id"], "k": parts[2]}
    return None


def payload_bytes(kind, field_name, text, binding=None):
    if kind != "label":
        raise Invalid(f"unknown static payload kind: {kind}")
    if binding is not None:
        return canonical_no_lf({**binding, "op": "label", "x": text})
    return canonical_no_lf({"op": "label", "t": field_name, "x": text})


def split_for_leaf(field_name, text, binding=None):
    if not isinstance(text, str):
        text = canonical_no_lf(text).decode("utf-8")
    chunks = []
    current = ""
    start = 0
    byte_cursor = 0
    for character in text:
        candidate = current + character
        if len(payload_bytes("label", field_name, candidate, binding)) > PAYLOAD_MAX:
            if not current:
                raise Invalid("one code point cannot fit leaf payload")
            raw = current.encode("utf-8")
            chunks.append((start, byte_cursor, current))
            start = byte_cursor
            current = character
            if len(payload_bytes("label", field_name, current, binding)) > PAYLOAD_MAX:
                raise Invalid("one code point cannot fit fresh leaf payload")
        else:
            current = candidate
        byte_cursor += len(character.encode("utf-8"))
    if current or not chunks:
        chunks.append((start, byte_cursor, current))
    rebuilt = "".join(item[2] for item in chunks)
    if rebuilt != text:
        raise Invalid("leaf split reconstruction mismatch")
    return chunks


def parse_context(cell):
    render = cell.get("render_utf8")
    if not isinstance(render, str):
        raise Invalid(f"missing render: {cell.get('cell')}")
    match = CONTEXT_RE.search(render)
    if match is None:
        raise Invalid(f"missing exact context markers: {cell['cell']}")
    begin, raw_json, end = match.groups()
    if end != begin.replace("BEGIN_", "END_", 1):
        raise Invalid(f"marker mismatch: {cell['cell']}")
    context = parse_json_bytes(raw_json.encode("utf-8"), cell["cell"] + " context")
    return begin, context, raw_json.encode("utf-8")


def fixed_literal(render, name):
    matches = re.findall(rf'{re.escape(name)}="([^"]+)"', render)
    if len(set(matches)) != 1:
        raise Invalid(f"missing or ambiguous fixed literal {name}")
    return matches[0]


def assembly_recipe(cell, compiler_family, context, final_nodes):
    if compiler_family == "DECISION_SELECTOR":
        options = context.get("decision", {}).get("options", context.get("options"))
        if not isinstance(options, list) or not options:
            raise Invalid(f"decision options missing: {cell['cell']}")
        return {
            "allowed_values": options,
            "dynamic_node": final_nodes[0],
            "kind": "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON",
            "output_key": "selected_choice",
        }
    if compiler_family == "EDGE_JUDGE":
        return {
            "allowed_values": ["supported", "unsupported"],
            "dynamic_node": final_nodes[0],
            "kind": "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON",
            "output_key": "verdict",
        }
    if compiler_family == "TENSION_JUDGE":
        return {
            "allowed_values": [True, False],
            "dynamic_node": final_nodes[0],
            "kind": "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON",
            "output_key": "preserve_boundary",
        }
    if compiler_family == "CROSS_TOPIC_EDGE_SET":
        candidates = context.get("edge_candidates")
        hashes = context.get("topic_artifact_hashes")
        if not isinstance(candidates, list) or len(candidates) != 8 or not isinstance(hashes, dict):
            raise Invalid("S50 fixed context shape mismatch")
        edge_items = []
        for candidate, node_id in zip(candidates, final_nodes):
            edge_items.append(
                {
                    "edge_id": candidate["id"],
                    "source_decision_ids": [candidate["from"], candidate["to"]],
                    "verdict_from_compact_node": node_id,
                }
            )
        render = cell["render_utf8"]
        return {
            "fixed": {
                "checked_edge_ids": [item["id"] for item in candidates],
                "claim_boundary": fixed_literal(render, "claim_boundary"),
                "external_audit_status": "excluded",
                "forbidden_action_violations": [],
                "protocol_id": fixed_literal(render, "protocol_id"),
                "stage": "S50_SEMANTIC",
                "topic_artifact_hashes": hashes,
            },
            "kind": "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS",
            "ordered_edge_items": edge_items,
        }
    if compiler_family == "SPECIALIST_CLASSIFIER":
        render = cell["render_utf8"]
        records = context.get("source_records")
        candidate = context.get("candidate_edge")
        if not isinstance(records, list) or not isinstance(candidate, dict):
            raise Invalid("S60 fixed context shape mismatch")
        role_match = re.search(r"ROLE: bounded ([a-z_]+) specialist", render)
        if role_match is None:
            raise Invalid("S60 role missing")
        return {
            "compact_node": final_nodes[0],
            "fixed": {
                "candidate_edge_id": candidate["id"],
                "candidate_lineage_sha256": fixed_literal(render, "candidate_lineage_sha256"),
                "claim_boundary": fixed_literal(render, "claim_boundary"),
                "classification": fixed_literal(render, "classification"),
                "external_audit_status": "excluded",
                "forbidden_action_violations": [],
                "integration_candidate_sha256": fixed_literal(render, "integration_candidate_sha256"),
                "protocol_id": fixed_literal(render, "protocol_id"),
                "role": role_match.group(1),
                "source_record_ids": [record["source_record_id"] for record in records],
                "stage": "S60_UNIT",
            },
            "kind": "DETERMINISTIC_S60_ASSEMBLY_FROM_COMPACT_SPECIALIST_CODE",
        }
    raise Invalid(f"unsupported assembly family: {compiler_family}")


def wire_message(kind, **values):
    if kind == "subject":
        return canonical_no_lf(
            {
                "a": values["attempt_id"],
                "i": values["atom_id"],
                "k": "subject",
                "n": values["nonce"],
                "p": values["payload_utf8"],
                "ph": values["payload_sha256"],
                "v": 1,
            }
        )
    if kind == "bootstrap":
        return canonical_no_lf(
            {
                "a": values["attempt_id"],
                "d": WAIT_SECONDS,
                "k": "boot",
                "mh": values["manifest_sha256"],
                "n": values["nonce"],
                "o": values["objective"],
                "r": values["route_code"],
                "sh": values["payload_sha256"],
                "v": 1,
            }
        )
    if kind == "control":
        return canonical_no_lf(
            {
                "a": values["attempt_id"],
                "c": values["criterion"],
                "ch": sha(values["criterion"].encode("utf-8")),
                "k": "control",
                "mh": values["manifest_sha256"],
                "n": values["nonce"],
                "q": values["output_contract"],
                "qh": sha(values["output_contract"].encode("utf-8")),
                "r": values["route_code"],
                "sh": values["payload_sha256"],
                "v": 1,
            }
        )
    raise Invalid(f"unknown wire kind: {kind}")


def node_text_contract(kind, root_signal_max=None):
    if kind == "EVIDENCE_SLICE_LABEL":
        return "Extract one signal from p.", "1-48 [A-Za-z0-9._:-]+ only.", INTERMEDIATE_MAX
    if kind == "ENDPOINT_SLICE_LABEL":
        return "Extract one bound edge signal.", "1-32 [A-Za-z0-9._:-]+ only.", EDGE_SIGNAL_MAX
    if kind == "PAIR_SIGNAL_REDUCER":
        maximum = root_signal_max or INTERMEDIATE_MAX
        return "Reduce l+r to one signal.", f"1-{maximum} [A-Za-z0-9._:-]+ only.", maximum
    if kind == "FINAL_OPTION_SELECTOR":
        return "Choose one o using e.", '{"selected_choice":<exact o>}', OUTPUT_MAX
    if kind == "FINAL_EDGE_VERDICT":
        return "Judge edge e.", '{"verdict":"supported|unsupported"}', OUTPUT_MAX
    if kind == "FINAL_TENSION_VERDICT":
        return "Judge boundary e.", '{"preserve_boundary":true|false}', OUTPUT_MAX
    if kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        return "Judge edge i using e.", "S or U only.", 1
    if kind == "FINAL_SPECIALIST_CODE":
        return "Judge specialist e.", "S:<c> or U:<c> only.", 3
    raise Invalid(f"unknown node kind: {kind}")


def dynamic_template(
    kind,
    root_id,
    context,
    edge=None,
    class_code=None,
    left_tags=None,
    right_tags=None,
):
    if kind == "PAIR_SIGNAL_REDUCER":
        if edge is not None:
            return {
                "canonical_json_template": {
                    "e": edge["id"],
                    "f": edge["from"],
                    "l": "${LEFT_RESULT}",
                    "lb": left_tags,
                    "r": "${RIGHT_RESULT}",
                    "rb": right_tags,
                    "t": edge["to"],
                },
                "dependency_result_max_bytes": [EDGE_SIGNAL_MAX, EDGE_SIGNAL_MAX],
            }
        return {
            "canonical_json_template": {"l": "${LEFT_RESULT}", "op": "reduce", "r": "${RIGHT_RESULT}"},
            "dependency_result_max_bytes": [INTERMEDIATE_MAX, INTERMEDIATE_MAX],
        }
    if kind == "FINAL_OPTION_SELECTOR":
        options = context.get("decision", {}).get("options", context.get("options"))
        return {
            "canonical_json_template": {"e": "${SUMMARY_RESULT}", "o": options},
            "dependency_result_max_bytes": [ROOT_DECISION_SIGNAL_MAX],
        }
    if kind in {"FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
        return {
            "canonical_json_template": {"e": "${SUMMARY_RESULT}"},
            "dependency_result_max_bytes": [INTERMEDIATE_MAX],
        }
    if kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        return {
            "canonical_json_template": {
                "e": "${SUMMARY_RESULT}",
                "f": edge["from"],
                "i": edge["id"],
                "t": edge["to"],
            },
            "dependency_result_max_bytes": [EDGE_SIGNAL_MAX],
        }
    if kind == "FINAL_SPECIALIST_CODE":
        return {
            "canonical_json_template": {"c": class_code, "e": "${SUMMARY_RESULT}"},
            "dependency_result_max_bytes": [INTERMEDIATE_MAX],
        }
    raise Invalid(f"no dynamic template for: {kind}")


def materialize_template_max(template):
    value = json.loads(json.dumps(template["canonical_json_template"]))
    replacements = {
        "${LEFT_RESULT}": "x" * template["dependency_result_max_bytes"][0],
        "${RIGHT_RESULT}": "x" * template["dependency_result_max_bytes"][1]
        if len(template["dependency_result_max_bytes"]) > 1
        else None,
        "${SUMMARY_RESULT}": "x" * template["dependency_result_max_bytes"][0],
    }

    def replace(item):
        if isinstance(item, dict):
            return {key: replace(child) for key, child in item.items()}
        if isinstance(item, list):
            return [replace(child) for child in item]
        return replacements.get(item, item)

    return canonical_no_lf(replace(value))


def max_template_bytes(template):
    return len(materialize_template_max(template))


def objective(matrix_id, cell_index, route_code, atom_id, manifest_sha):
    text = f"R9 atom;run={matrix_id};c={cell_index};r={route_code};a={atom_id};m={manifest_sha};no-retry."
    if len(text.encode("utf-8")) > OBJECTIVE_MAX:
        raise Invalid(f"objective exceeds {OBJECTIVE_MAX} bytes")
    return text


def attempt_id(matrix_id, cell_index, route, atom_path):
    return sha(canonical_no_lf([matrix_id, cell_index, route, atom_path, 0]))[:24]


def atom_nonce(matrix_id, cell_index, route, atom_path, kind, payload_sha):
    return sha(canonical_no_lf([matrix_id, cell_index, route, atom_path, kind, payload_sha]))


def validate_message_limits(node):
    if len(node["goal_objective"]["utf8"].encode("utf-8")) > OBJECTIVE_MAX:
        raise Invalid("objective byte limit")
    if len(node["acceptance_criterion"]["utf8"].encode("utf-8")) > ACCEPTANCE_MAX:
        raise Invalid("acceptance byte limit")
    if node["dynamic"]:
        if node["subject_template"]["max_payload_bytes"] > PAYLOAD_MAX:
            raise Invalid("dynamic payload byte limit")
        return
    for field, maximum in (
        ("spawn_bootstrap", ENVELOPE_MAX),
        ("control_bind", ENVELOPE_MAX),
        ("subject_atom", ENVELOPE_MAX),
    ):
        if node[field]["bytes"] > maximum:
            raise Invalid(f"{field} byte limit: {node[field]['bytes']}")
    if node["subject_payload"]["bytes"] > PAYLOAD_MAX:
        raise Invalid("static subject payload byte limit")


def finalize_node(raw, matrix_id, cell_index, route, route_code, manifest_sha):
    atom_id = raw["atom_id"]
    path = raw["atom_path"]
    criterion, output_contract, result_max = node_text_contract(
        raw["kind"], raw.get("root_signal_max")
    )
    aid = attempt_id(matrix_id, cell_index, route, path)
    goal = objective(matrix_id, cell_index, route_code, atom_id, manifest_sha)
    common = {
        "acceptance_criterion": {
            "bytes": len(criterion.encode("utf-8")),
            "sha256": sha(criterion.encode("utf-8")),
            "utf8": criterion,
        },
        "atom_id": atom_id,
        "atom_path": path,
        "attempt": 0,
        "attempt_id": aid,
        "dependencies": raw["dependencies"],
        "dynamic": raw["dynamic"],
        "goal_objective": {
            "bytes": len(goal.encode("utf-8")),
            "sha256": sha(goal.encode("utf-8")),
            "utf8": goal,
        },
        "kind": raw["kind"],
        "output_contract": {
            "bytes": len(output_contract.encode("utf-8")),
            "sha256": sha(output_contract.encode("utf-8")),
            "utf8": output_contract,
        },
        "result_max_bytes": result_max,
        "result_validation": (
            {"regex": r"[A-Za-z0-9._:-]+", "utf8_bytes_max": result_max, "utf8_bytes_min": 1}
            if raw["kind"] in {"EVIDENCE_SLICE_LABEL", "ENDPOINT_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"}
            else {"closed_output_contract": True, "utf8_bytes_max": result_max}
        ),
        "route_code": route_code,
        "schema_id": NODE_SCHEMA,
    }
    if raw["dynamic"]:
        template = raw["subject_template"]
        maximum_payload = materialize_template_max(template)
        maximum = len(maximum_payload)
        if maximum > PAYLOAD_MAX:
            raise Invalid(f"dynamic template exceeds payload limit: {path} {maximum}")
        dummy_nonce = "0" * 64
        dummy_payload_sha = sha(maximum_payload)
        dummy_subject = wire_message(
            "subject",
            attempt_id=aid,
            atom_id=atom_id,
            nonce=dummy_nonce,
            payload_utf8=maximum_payload.decode("utf-8"),
            payload_sha256=dummy_payload_sha,
        )
        dummy_bootstrap = wire_message(
            "bootstrap",
            attempt_id=aid,
            manifest_sha256=manifest_sha,
            nonce=dummy_nonce,
            objective=goal,
            payload_sha256=dummy_payload_sha,
            route_code=route_code,
        )
        dummy_control = wire_message(
            "control",
            attempt_id=aid,
            criterion=criterion,
            manifest_sha256=manifest_sha,
            nonce=dummy_nonce,
            output_contract=output_contract,
            payload_sha256=dummy_payload_sha,
            route_code=route_code,
        )
        maximum_wire = {
            "control_bind": len(dummy_control),
            "spawn_bootstrap": len(dummy_bootstrap),
            "subject_atom": len(dummy_subject),
        }
        if max(maximum_wire.values()) > ENVELOPE_MAX:
            raise Invalid(f"dynamic wire envelope exceeds limit: {path} {maximum_wire}")
        common.update(
            {
                "identity_derivation": "CONTROLLER_CONTRACT_DYNAMIC_NODE_IDENTITY_RULE",
                "subject_template": {
                    **template,
                    "max_payload_bytes": maximum,
                    "payload_sha256_at_admission": "REQUIRED_BEFORE_SPAWN",
                },
                "wire_message_max_bytes": maximum_wire,
                "wire_messages": "DERIVED_AND_RECORDED_IN_DYNAMIC_NODE_ADMISSION_BEFORE_SPAWN",
            }
        )
    else:
        payload = raw["payload_bytes"]
        payload_sha = sha(payload)
        nonce = atom_nonce(matrix_id, cell_index, route, path, raw["kind"], payload_sha)
        subject = wire_message(
            "subject",
            attempt_id=aid,
            atom_id=atom_id,
            nonce=nonce,
            payload_utf8=payload.decode("utf-8"),
            payload_sha256=payload_sha,
        )
        bootstrap = wire_message(
            "bootstrap",
            attempt_id=aid,
            manifest_sha256=manifest_sha,
            nonce=nonce,
            objective=goal,
            payload_sha256=payload_sha,
            route_code=route_code,
        )
        control = wire_message(
            "control",
            attempt_id=aid,
            criterion=criterion,
            manifest_sha256=manifest_sha,
            nonce=nonce,
            output_contract=output_contract,
            payload_sha256=payload_sha,
            route_code=route_code,
        )
        common.update(
            {
                "atom_nonce": nonce,
                "control_bind": {"bytes": len(control), "sha256": sha(control), "utf8": control.decode("utf-8")},
                "spawn_bootstrap": {"bytes": len(bootstrap), "sha256": sha(bootstrap), "utf8": bootstrap.decode("utf-8")},
                "subject_atom": {"bytes": len(subject), "sha256": sha(subject), "utf8": subject.decode("utf-8")},
                "subject_payload": {"bytes": len(payload), "sha256": payload_sha, "utf8": payload.decode("utf-8")},
                "task_name": "r9_cgra_" + nonce,
            }
        )
    validate_message_limits(common)
    return common


def build_raw_nodes(coverage, compiler_family, context, render):
    nodes = []
    leaf_ids = []
    leaf_ids_by_pointer = {}
    for entry in coverage:
        if entry["disposition"] != "MODEL_EXPOSED_SLICE":
            continue
        pointer_ids = []
        for segment in entry["segments"]:
            atom_id = f"n{len(nodes):05d}"
            leaf_ids.append(atom_id)
            pointer_ids.append(atom_id)
            nodes.append(
                {
                    "atom_id": atom_id,
                    "atom_path": f"leaf/{len(leaf_ids)-1:05d}",
                    "dependencies": [],
                    "dynamic": False,
                    "kind": (
                        "ENDPOINT_SLICE_LABEL"
                        if compiler_family == "CROSS_TOPIC_EDGE_SET"
                        else "EVIDENCE_SLICE_LABEL"
                    ),
                    "payload_bytes": segment["payload_utf8"].encode("utf-8"),
                }
            )
        leaf_ids_by_pointer[entry["pointer"]] = pointer_ids
    if not leaf_ids:
        raise Invalid("cell has no model-exposed leaf")
    if compiler_family == "CROSS_TOPIC_EDGE_SET":
        decisions = context.get("endpoint_decisions")
        edges = context.get("edge_candidates")
        if not isinstance(decisions, list) or not isinstance(edges, list) or len(edges) != 8:
            raise Invalid("S50 branch source mismatch")
        decision_indexes = {row.get("id"): index for index, row in enumerate(decisions)}
        if len(decision_indexes) != len(decisions) or None in decision_indexes:
            raise Invalid("S50 endpoint identity mismatch")
        edge_roots = {}
        for edge_index, edge in enumerate(edges):
            if edge.get("from") not in decision_indexes or edge.get("to") not in decision_indexes:
                raise Invalid("S50 edge endpoint missing")
            bindings = [
                (f"/endpoint_decisions/{decision_indexes[edge['from']]}/choice", "f"),
                (f"/endpoint_decisions/{decision_indexes[edge['to']]}/choice", "t"),
                (f"/edge_candidates/{edge_index}/type", "y"),
                (f"/edge_candidates/{edge_index}/statement", "s"),
            ]
            current = []
            tags_by_node = {}
            for pointer, tag in bindings:
                bound_ids = leaf_ids_by_pointer.get(pointer)
                if not bound_ids:
                    raise Invalid(f"S50 edge evidence missing: {pointer}")
                current.extend(bound_ids)
                for bound_id in bound_ids:
                    tags_by_node[bound_id] = [tag]
            level = 0
            while len(current) > 1:
                following = []
                for pair_index in range(math.ceil(len(current) / 2)):
                    left = current[pair_index * 2]
                    if pair_index * 2 + 1 >= len(current):
                        following.append(left)
                        continue
                    right = current[pair_index * 2 + 1]
                    atom_id = f"n{len(nodes):05d}"
                    following.append(atom_id)
                    merged_tags = []
                    for tag in tags_by_node[left] + tags_by_node[right]:
                        if tag not in merged_tags:
                            merged_tags.append(tag)
                    nodes.append(
                        {
                            "atom_id": atom_id,
                            "atom_path": f"edge/{edge_index:03d}/reduce/{level:03d}/{pair_index:03d}",
                            "dependencies": [left, right],
                            "dynamic": True,
                            "kind": "PAIR_SIGNAL_REDUCER",
                            "root_signal_max": EDGE_SIGNAL_MAX,
                            "subject_template": dynamic_template(
                                "PAIR_SIGNAL_REDUCER",
                                atom_id,
                                context,
                                edge=edge,
                                left_tags=tags_by_node[left],
                                right_tags=tags_by_node[right],
                            ),
                        }
                    )
                    tags_by_node[atom_id] = merged_tags
                current = following
                level += 1
            edge_roots[edge["id"]] = current[0]
        final_ids = []
        for edge_index, edge in enumerate(edges):
            atom_id = f"n{len(nodes):05d}"
            final_ids.append(atom_id)
            nodes.append(
                {
                    "atom_id": atom_id,
                    "atom_path": f"final/{edge_index:03d}",
                    "dependencies": [edge_roots[edge["id"]]],
                    "dynamic": True,
                    "kind": "FINAL_EDGE_VERDICT_PER_EDGE",
                    "subject_template": dynamic_template(
                        "FINAL_EDGE_VERDICT_PER_EDGE", atom_id, context, edge=edge
                    ),
                }
            )
        return nodes, edge_roots, final_ids
    current = list(leaf_ids)
    level = 0
    while len(current) > 1:
        next_level = []
        pairs_count = math.ceil(len(current) / 2)
        for pair_index in range(pairs_count):
            left = current[pair_index * 2]
            if pair_index * 2 + 1 >= len(current):
                next_level.append(left)
                continue
            right = current[pair_index * 2 + 1]
            atom_id = f"n{len(nodes):05d}"
            next_level.append(atom_id)
            nodes.append(
                {
                    "atom_id": atom_id,
                    "atom_path": f"reduce/{level:03d}/{pair_index:05d}",
                    "dependencies": [left, right],
                    "dynamic": True,
                    "kind": "PAIR_SIGNAL_REDUCER",
                    "subject_template": dynamic_template("PAIR_SIGNAL_REDUCER", atom_id, context),
                }
            )
        current = next_level
        level += 1
    root_id = current[0]
    if compiler_family == "DECISION_SELECTOR":
        found_root_reducer = False
        for node in nodes:
            if node["atom_id"] == root_id and node["kind"] == "PAIR_SIGNAL_REDUCER":
                node["root_signal_max"] = ROOT_DECISION_SIGNAL_MAX
                found_root_reducer = True
                break
        if not found_root_reducer:
            raise Invalid("decision root must be a reducer so its signal can be bounded to 16 bytes")
        final_kinds = [("FINAL_OPTION_SELECTOR", None, None)]
    elif compiler_family == "EDGE_JUDGE":
        final_kinds = [("FINAL_EDGE_VERDICT", None, None)]
    elif compiler_family == "TENSION_JUDGE":
        final_kinds = [("FINAL_TENSION_VERDICT", None, None)]
    elif compiler_family == "SPECIALIST_CLASSIFIER":
        classifications = {
            "provenance_gap": "P",
            "authority_conflation": "C",
            "counterfactual_failure": "K",
        }
        value = None
        for key in classifications:
            if f'classification="{key}"' in render:
                value = classifications[key]
        final_kinds = [("FINAL_SPECIALIST_CODE", None, value)]
    else:
        raise Invalid(f"unknown compiler family: {compiler_family}")
    final_ids = []
    for kind, edge, class_code in final_kinds:
        atom_id = f"n{len(nodes):05d}"
        final_ids.append(atom_id)
        if kind == "FINAL_SPECIALIST_CODE" and class_code is None:
            raise Invalid("specialist class code missing")
        nodes.append(
            {
                "atom_id": atom_id,
                "atom_path": f"final/{len(final_ids)-1:03d}",
                "dependencies": [root_id],
                "dynamic": True,
                "kind": kind,
                "subject_template": dynamic_template(kind, root_id, context, edge, class_code),
            }
        )
    return nodes, root_id, final_ids


def compile_cell(cell, matrix_id, route, route_code, model, effort):
    marker, context, context_bytes = parse_context(cell)
    compiler_family = family(marker)
    shape = source_shape(cell["cell"])
    coverage = []
    exposed_rebuilt = {}
    for pointer, value in scalars(context):
        disp = disposition(pointer, compiler_family)
        entry = {
            "disposition": disp,
            "pointer": pointer,
            "scalar_bytes": len(canonical_no_lf(value)),
            "scalar_sha256": sha(canonical_no_lf(value)),
            "scalar_type": "null" if value is None else type(value).__name__,
            "segments": [],
        }
        if disp == "MODEL_EXPOSED_SLICE":
            field_name = last_pointer_key(pointer)
            binding = (
                s50_binding(pointer, context)
                if compiler_family == "CROSS_TOPIC_EDGE_SET"
                else None
            )
            if compiler_family == "CROSS_TOPIC_EDGE_SET" and binding is None:
                raise Invalid(f"S50 model slice missing binding: {pointer}")
            text = value if isinstance(value, str) else canonical_no_lf(value).decode("utf-8")
            for ordinal, (start, end, chunk) in enumerate(
                split_for_leaf(field_name, text, binding)
            ):
                payload = payload_bytes("label", field_name, chunk, binding)
                entry["segments"].append(
                    {
                        "end_byte": end,
                        "ordinal": ordinal,
                        "payload_bytes": len(payload),
                        "payload_sha256": sha(payload),
                        "payload_utf8": payload.decode("utf-8"),
                        "slice_bytes": len(chunk.encode("utf-8")),
                        "slice_sha256": sha(chunk.encode("utf-8")),
                        "start_byte": start,
                    }
                )
            exposed_rebuilt[pointer] = "".join(
                json.loads(segment["payload_utf8"])["x"] for segment in entry["segments"]
            )
            if exposed_rebuilt[pointer] != text:
                raise Invalid(f"coverage reconstruction mismatch: {cell['cell']} {pointer}")
        coverage.append(entry)
    raw_nodes, root_id, final_ids = build_raw_nodes(
        coverage, compiler_family, context, cell["render_utf8"]
    )
    skeleton = {
        "cell": cell["cell"],
        "cell_index": cell["index"],
        "compiler_family": compiler_family,
        "context_bytes": len(context_bytes),
        "context_sha256": sha(context_bytes),
        "coverage": coverage,
        "dag_skeleton": [
            {
                "atom_id": node["atom_id"],
                "atom_path": node["atom_path"],
                "dependencies": node["dependencies"],
                "dynamic": node["dynamic"],
                "kind": node["kind"],
                **(
                    {"payload_sha256": sha(node["payload_bytes"])}
                    if not node["dynamic"]
                    else {"subject_template": node["subject_template"]}
                ),
            }
            for node in raw_nodes
        ],
        "final_node_ids": final_ids,
        "root_signal_node_id": root_id,
        "route": route,
        "source_shape": shape,
    }
    manifest_sha = sha(canonical_no_lf(skeleton))
    nodes = [
        finalize_node(node, matrix_id, cell["index"], route, route_code, manifest_sha)
        for node in raw_nodes
    ]
    by_id = {node["atom_id"]: node for node in nodes}
    if len(by_id) != len(nodes):
        raise Invalid("duplicate node id")
    for node in nodes:
        if any(dep not in by_id for dep in node["dependencies"]):
            raise Invalid("orphan dependency")
        if node["kind"] == "PAIR_SIGNAL_REDUCER" and len(node["dependencies"]) != 2:
            raise Invalid("nonbinary reducer")
    recipe = assembly_recipe(cell, compiler_family, context, final_ids)
    return {
        "assembly_recipe": recipe,
        "cell": cell["cell"],
        "cell_index": cell["index"],
        "compiler_family": compiler_family,
        "context_coverage": coverage,
        "context_identity": {"bytes": len(context_bytes), "sha256": sha(context_bytes)},
        "control_manifest_projection_bytes": len(canonical_no_lf(skeleton)),
        "control_manifest_sha256": manifest_sha,
        "dependency_gate": cell["dependency_gate"],
        "final_node_ids": final_ids,
        "matrix_id": matrix_id,
        "model_requested": model,
        "nodes": nodes,
        "reasoning_effort_requested": effort,
        "root_signal_node_id": root_id,
        "route": route,
        "route_code": route_code,
        "schema_id": CELL_SCHEMA,
        "source_shape": shape,
    }


def validate_semantic(bundle):
    if bundle.get("schema_id") != "pw-r9-immutable-semantic-bundle-v1":
        raise Invalid("semantic schema mismatch")
    cells = bundle.get("cells")
    if not isinstance(cells, list) or len(cells) != 97:
        raise Invalid("semantic cell count mismatch")
    totals = Counter()
    shapes = Counter()
    for index, cell in enumerate(cells):
        if cell.get("index") != index:
            raise Invalid("cell index mismatch")
        render = cell.get("render_utf8", "").encode("utf-8")
        expected = cell.get("expected_output_utf8", "").encode("utf-8")
        if (
            len(render) != cell.get("render_utf8_bytes")
            or sha(render) != cell.get("render_utf8_sha256")
            or len(expected) != cell.get("expected_output_bytes")
            or sha(expected) != cell.get("expected_output_sha256")
            or parse_json_bytes(expected, f"expected output {index}") != cell.get("expected_output")
        ):
            raise Invalid(f"cell binding mismatch: {index}")
        marker, context, context_raw = parse_context(cell)
        totals[family(marker)] += 1
        shapes[source_shape(cell["cell"])] += 1
        if not isinstance(context, dict) or not context_raw:
            raise Invalid("empty context")
    if totals != Counter(
        {
            "DECISION_SELECTOR": 71,
            "EDGE_JUDGE": 18,
            "TENSION_JUDGE": 4,
            "CROSS_TOPIC_EDGE_SET": 1,
            "SPECIALIST_CLASSIFIER": 3,
        }
    ):
        raise Invalid(f"compiler family counts mismatch: {totals}")
    if len(shapes) != 9:
        raise Invalid(f"source shape combination count mismatch: {shapes}")
    return cells, totals, shapes


def public_key_scan(value, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in EXPECTED_PUBLIC_TOKENS or key.startswith("expected_"):
                raise Invalid(f"expected-value field leaked to public manifest: {path}/{key}")
            public_key_scan(child, path + "/" + key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            public_key_scan(child, path + "/" + str(index))


def make_outputs(base, matrix_id):
    semantic = parse_json_bytes(
        bind(base / SEMANTIC_REL, SEMANTIC_SHA, SEMANTIC_BYTES),
        SEMANTIC_REL,
        require_canonical=True,
    )
    parse_json_bytes(bind(base / DESIGN_REL, DESIGN_SHA, DESIGN_BYTES), DESIGN_REL, True)
    parse_json_bytes(bind(base / REVIEW_REL, REVIEW_SHA, REVIEW_BYTES), REVIEW_REL, True)
    contract = parse_json_bytes(
        bind(base / CONTRACT_REL, CONTRACT_SHA, CONTRACT_BYTES),
        CONTRACT_REL,
        True,
    )
    if contract.get("schema_id") != "pw-r9-codex-native-goal-resident-atomic-mailbox-controller-contract-v1":
        raise Invalid("controller contract schema mismatch")
    cells, family_counts, shape_counts = validate_semantic(semantic)
    public_files = {}
    scorer_cells = []
    cell_index_rows = []
    atom_counts = Counter()
    route_atom_counts = Counter()
    max_dag_depth = 0
    max_message_bytes = 0
    max_payload_bytes = 0
    static_nonces = set()
    static_tasks = set()
    for route, route_code, model, effort in ROUTES:
        for cell in cells:
            compiled = compile_cell(cell, matrix_id, route, route_code, model, effort)
            relative = f"cells/cell-{cell['index']:03d}/{route}.json"
            cell_bytes = canonical(compiled)
            public_files[relative] = cell_bytes
            kinds = Counter(node["kind"] for node in compiled["nodes"])
            atom_counts.update(kinds)
            route_atom_counts[route] += len(compiled["nodes"])
            depth = {}
            for node in compiled["nodes"]:
                depth[node["atom_id"]] = 1 + max(
                    (depth[item] for item in node["dependencies"]), default=0
                )
                if not node["dynamic"]:
                    if node["atom_nonce"] in static_nonces or node["task_name"] in static_tasks:
                        raise Invalid("static atom identity collision")
                    static_nonces.add(node["atom_nonce"])
                    static_tasks.add(node["task_name"])
                    max_message_bytes = max(
                        max_message_bytes,
                        node["spawn_bootstrap"]["bytes"],
                        node["control_bind"]["bytes"],
                        node["subject_atom"]["bytes"],
                    )
                    max_payload_bytes = max(max_payload_bytes, node["subject_payload"]["bytes"])
                else:
                    max_payload_bytes = max(max_payload_bytes, node["subject_template"]["max_payload_bytes"])
                    max_message_bytes = max(
                        max_message_bytes,
                        *node["wire_message_max_bytes"].values(),
                    )
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
    test_taker_waves = math.ceil(total_atoms / 3)
    capacity = {
        "atom_kind_counts": dict(sorted(atom_counts.items())),
        "controller_message_utf8_bytes_upper_bound": total_atoms * ENVELOPE_MAX * 3,
        "exact_atom_count": total_atoms,
        "collaboration_slot_count": 4,
        "controller_slot_count": 1,
        "matrix_id": matrix_id,
        "max_compiled_static_message_bytes": max_message_bytes,
        "max_dag_depth": max_dag_depth,
        "max_subject_payload_bytes": max_payload_bytes,
        "max_concurrent_test_takers": 3,
        "model_call_count": total_atoms,
        "platform_total_token_ceiling": None,
        "platform_total_token_ceiling_nonclaim": "SYSTEM_TOOL_AND_HIDDEN_RUNTIME_TOKENS_ARE_NOT_EXPOSED_OR_ATTESTED",
        "qualification_credit": 0,
        "route_atom_counts": dict(sorted(route_atom_counts.items())),
        "schema_id": CAPACITY_SCHEMA,
        "semantic_cell_count": 97,
        "semantic_cell_route_outcome_count": 291,
        "subject_atoms_per_goal": 1,
        "test_taker_goal_count": total_atoms,
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
            "qualification": False,
            "release": False,
        },
        "bindings": {
            "controller_contract": {"bytes": CONTRACT_BYTES, "path": CONTRACT_REL, "sha256": CONTRACT_SHA},
            "implementation_design": {"bytes": DESIGN_BYTES, "path": DESIGN_REL, "sha256": DESIGN_SHA},
            "implementation_review": {"bytes": REVIEW_BYTES, "path": REVIEW_REL, "sha256": REVIEW_SHA},
            "semantic_bundle": {"bytes": SEMANTIC_BYTES, "path": SEMANTIC_REL, "sha256": SEMANTIC_SHA},
        },
        "capacity": {"bytes": len(capacity_bytes), "path": "capacity.json", "sha256": sha(capacity_bytes)},
        "cells": cell_index_rows,
        "compiler_families": dict(sorted(family_counts.items())),
        "controller_protocol": "CODEX_NATIVE_GOAL_RESIDENT_ATOMIC_MAILBOX_V1",
        "matrix_id": matrix_id,
        "public_scorer_separation": "PUBLIC_ROOT_CONTAINS_NO_EXPECTED_VALUE_FIELDS_OR_SCORER_PATH",
        "qualification_credit": 0,
        "route_roster": [
            {"model_requested": model, "reasoning_effort_requested": effort, "route": route}
            for route, _code, model, effort in ROUTES
        ],
        "schema_id": PUBLIC_SCHEMA,
        "source_shape_combinations": dict(sorted(shape_counts.items())),
        "status": "COMPILED_STATIC_PUBLIC_ATOM_DAGS_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY",
    }
    public_key_scan(manifest)
    for data in public_files.values():
        public_key_scan(parse_json_bytes(data, "public cell", True))
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
    scorer_files = {"manifest.json": canonical(scorer)}
    return public_files, scorer_files, capacity


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
        rel = safe_relative(relative)
        parent = rel.parent
        while parent != Path("."):
            directories.add(parent)
            parent = parent.parent
    for relative in sorted(directories, key=lambda item: (len(item.parts), item.as_posix())):
        if relative == Path("."):
            continue
        mkdir_exact(root / relative)
    inventory = []
    for relative in sorted(files):
        data = files[relative]
        write_exact(root / safe_relative(relative), data)
        inventory.append({"bytes": len(data), "path": relative, "sha256": sha(data)})
    inventory_bytes = canonical(inventory)
    write_exact(root / "inventory.json", inventory_bytes)
    all_rows = inventory + [{"bytes": len(inventory_bytes), "path": "inventory.json", "sha256": sha(inventory_bytes)}]
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
    return value


def do_check(base):
    public_files, scorer_files, capacity = make_outputs(base, "check-only-matrix")
    public_projection = canonical_no_lf(
        [{"bytes": len(data), "path": path, "sha256": sha(data)} for path, data in sorted(public_files.items())]
    )
    scorer_projection = canonical_no_lf(
        [{"bytes": len(data), "path": path, "sha256": sha(data)} for path, data in sorted(scorer_files.items())]
    )
    return {
        "authority": {"empirical_launch": False, "qualification": False},
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
        receipt_path.resolve(strict=False).is_relative_to(public_root.resolve(strict=False))
        or receipt_path.resolve(strict=False).is_relative_to(scorer_root.resolve(strict=False))
    ):
        raise Invalid("receipt must be outside public and scorer roots")
    public_files, scorer_files, capacity = make_outputs(base, matrix_id)
    public_identity = materialize_root(public_root, public_files)
    scorer_identity = materialize_root(scorer_root, scorer_files)
    receipt = {
        "authority": {"empirical_launch": False, "qualification": False},
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
