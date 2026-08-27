#!/usr/bin/env python3
"""Independent, read-only verifier for the R9 native-Goal skill adapter."""

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


MANIFEST_REL = "r9_codex_native_goal_bootstrap_skill_adapter_implementation_manifest_v1.json"
MANIFEST_SHA256 = "36fb668c10cc8515fdf544b873cd5c85c994176e513b011525c9377c2fea60ff"
MANIFEST_BYTES = 5004
MANIFEST_SCHEMA = "pw-r9-codex-native-goal-bootstrap-skill-adapter-implementation-manifest-v1"

ARCHITECTURE_REL = "r9_codex_native_goal_bootstrap_skill_adapter_architecture_v1.json"
ARCHITECTURE_SHA256 = "c83b4b8b7c630c5761e0b93f6beeca4eddd59ef18e8e1baeeb1f2766729b9364"
ARCHITECTURE_BYTES = 6619
ARCHITECTURE_SCHEMA = "pw-r9-codex-native-goal-bootstrap-skill-adapter-architecture-v1"

REVIEW_REL = "r9_codex_native_goal_bootstrap_skill_adapter_design_review_success_receipt_v1.json"
REVIEW_SHA256 = "d13dcd099d7def092ddf628449027770809dd6129e4c456774263f1fd8f7daf2"
REVIEW_BYTES = 1603

DECOMPOSITION_REL = "r9_codex_native_goal_atomic_manifest_compiler_v1.py"
DECOMPOSITION_SHA256 = "bdae122be76f64dafeb244fdde0aac8986e600cbb9d6fe7a14c2b6828eaa4c9e"
DECOMPOSITION_BYTES = 55381

SEMANTIC_REL = "formal_candidate_v7/semantic_bundle.json"
SEMANTIC_SHA256 = "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"
SEMANTIC_BYTES = 786546
SEMANTIC_SCHEMA = "pw-r9-immutable-semantic-bundle-v1"

CHECK_SCHEMA = "pw-r9-goal-skill-offline-verifier-check-v1"
INDEX_SCHEMA = "pw-r9-goal-skill-adapter-index-v1"
RENDER_SCHEMA = "pw-r9-goal-skill-adapter-render-one-v1"
PREDECLARATION_SCHEMA = "pw-r9-goal-skill-predeclaration-v1"
RUNTIME_EVENT_SCHEMA = "pw-r9-goal-skill-runtime-event-v1"
ACCOUNTING_SCHEMA = "pw-r9-goal-skill-accounting-v1"

EXPECTED_ATOM_COUNT = 15612
EXPECTED_ROUTE_COUNT = 5204
EXPECTED_CELL_COUNT = 97
ROUTES = (("slot-alpha", "a"), ("slot-bravo", "b"), ("slot-charlie", "c"))
RUNTIME_KINDS = (
    "ACTIVE_GOAL_RECEIPT_RAW",
    "PRE_SUBJECT_GET_GOAL_RAW",
    "BOUND",
    "COMPACT_RESULT",
    "TERMINAL_GOAL_RECEIPT_RAW",
    "TASK_FINAL",
)
RUNTIME_EVENT_INDEXES = (2, 4, 5, 6, 7, 8)
PROHIBITED_SPAWN_TOKENS = (
    "followup_task",
    "omp ",
    "--print",
    "subject_payload",
    "acceptance_criterion",
    "expected_output",
)

CONTEXT_RE = re.compile(
    r"\n(BEGIN_[A-Z0-9_]+_CONTEXT)\n(.*?)\n(END_[A-Z0-9_]+_CONTEXT)\n?$",
    re.DOTALL,
)
RUN_ID_RE = re.compile(r"[a-z0-9][a-z0-9-]{0,62}")
TASK_NAME_RE = re.compile(r"[a-z0-9][a-z0-9_-]{0,127}")
SIGNAL_RE = re.compile(r"[A-Za-z0-9._:-]+")
THREAD_ID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")

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


class Invalid(Exception):
    """The first fail-closed mismatch."""


class Parser(argparse.ArgumentParser):
    def error(self, message):
        raise Invalid("ARGUMENTS: " + message)


def sha256(data):
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
        raise Invalid(f"NONFINITE_JSON: {exc}") from exc


def canonical(value):
    return canonical_no_lf(value) + b"\n"


def unique_pairs(items):
    value = {}
    for key, child in items:
        if key in value:
            raise Invalid(f"DUPLICATE_JSON_KEY: {key}")
        value[key] = child
    return value


def parse_json(data, label, require_canonical=False):
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=unique_pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(ValueError(token)),
        )
    except Exception as exc:
        raise Invalid(f"INVALID_JSON: {label}: {exc}") from exc
    if require_canonical and canonical(value) != data:
        raise Invalid(f"NONCANONICAL_JSON: {label}")
    return value


def read_regular(path, require_mode=None):
    try:
        before = os.lstat(path)
    except OSError as exc:
        raise Invalid(f"READ_STAT: {path}: {exc}") from exc
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
        raise Invalid(f"READ_NOT_REGULAR_NONLINK: {path}")
    if require_mode is not None and stat.S_IMODE(before.st_mode) != require_mode:
        raise Invalid(f"READ_MODE: {path}")
    try:
        data = path.read_bytes()
        after = os.lstat(path)
    except OSError as exc:
        raise Invalid(f"READ_BYTES: {path}: {exc}") from exc
    if (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ) != (
        after.st_dev,
        after.st_ino,
        after.st_size,
        after.st_mtime_ns,
    ):
        raise Invalid(f"READ_IDENTITY_DRIFT: {path}")
    return data


def bind(path, expected_sha256, expected_bytes):
    data = read_regular(path, 0o644)
    if len(data) != expected_bytes or sha256(data) != expected_sha256:
        raise Invalid(f"SOURCE_BINDING: {path}")
    return data


def exact_fields(value, fields, label):
    if not isinstance(value, dict) or set(value) != set(fields):
        actual = sorted(value) if isinstance(value, dict) else type(value).__name__
        raise Invalid(f"{label}_FIELDS: {actual}")


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
    raise Invalid(f"SOURCE_SHAPE: {cell_name}")


def family(marker):
    values = {
        "BEGIN_SINGLE_DECISION_CONTEXT": "DECISION_SELECTOR",
        "BEGIN_ANSWER_FIRST_DECISION_CONTEXT": "DECISION_SELECTOR",
        "BEGIN_SINGLE_EDGE_CONTEXT": "EDGE_JUDGE",
        "BEGIN_SINGLE_TENSION_CONTEXT": "TENSION_JUDGE",
        "BEGIN_COMPACT_INTEGRATION_CONTEXT": "CROSS_TOPIC_EDGE_SET",
        "BEGIN_SINGLE_NEW_EDGE_CONTEXT": "SPECIALIST_CLASSIFIER",
    }
    if marker not in values:
        raise Invalid(f"CONTEXT_FAMILY: {marker}")
    return values[marker]


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
            raise Invalid("S50_ENDPOINT_BINDING")
        return {"d": rows[index]["id"], "k": "choice"}
    if parts[0] == "edge_candidates" and parts[2] in {"statement", "type"}:
        rows = context.get("edge_candidates")
        if not isinstance(rows, list) or index >= len(rows):
            raise Invalid("S50_EDGE_BINDING")
        return {"i": rows[index]["id"], "k": parts[2]}
    return None


def label_payload(field_name, text, binding=None):
    if binding is not None:
        return canonical_no_lf({**binding, "op": "label", "x": text})
    return canonical_no_lf({"op": "label", "t": field_name, "x": text})


def split_leaf(field_name, value, binding, payload_max):
    text = value if isinstance(value, str) else canonical_no_lf(value).decode("utf-8")
    chunks = []
    current = ""
    start = 0
    cursor = 0
    for character in text:
        candidate = current + character
        if len(label_payload(field_name, candidate, binding)) > payload_max:
            if not current:
                raise Invalid("LEAF_CODEPOINT_CAPACITY")
            chunks.append((start, cursor, current))
            start = cursor
            current = character
            if len(label_payload(field_name, current, binding)) > payload_max:
                raise Invalid("LEAF_FRESH_CODEPOINT_CAPACITY")
        else:
            current = candidate
        cursor += len(character.encode("utf-8"))
    if current or not chunks:
        chunks.append((start, cursor, current))
    if "".join(chunk for _start, _end, chunk in chunks) != text:
        raise Invalid("LEAF_RECONSTRUCTION")
    return chunks


def parse_context(cell):
    render = cell.get("render_utf8")
    if not isinstance(render, str):
        raise Invalid(f"CELL_RENDER: {cell.get('index')}")
    match = CONTEXT_RE.search(render)
    if match is None:
        raise Invalid(f"CONTEXT_MARKERS: {cell.get('index')}")
    begin, raw, end = match.groups()
    if end != begin.replace("BEGIN_", "END_", 1):
        raise Invalid(f"CONTEXT_MARKER_PAIR: {cell.get('index')}")
    context = parse_json(raw.encode("utf-8"), f"cell-{cell['index']}-context")
    if not isinstance(context, dict):
        raise Invalid(f"CONTEXT_OBJECT: {cell.get('index')}")
    return begin, context, raw.encode("utf-8")


def dynamic_template(kind, context, edge=None, class_code=None, left_tags=None, right_tags=None):
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
                "dependency_result_max_bytes": [32, 32],
            }
        return {
            "canonical_json_template": {
                "l": "${LEFT_RESULT}",
                "op": "reduce",
                "r": "${RIGHT_RESULT}",
            },
            "dependency_result_max_bytes": [48, 48],
        }
    if kind == "FINAL_OPTION_SELECTOR":
        options = context.get("decision", {}).get("options", context.get("options"))
        return {
            "canonical_json_template": {"e": "${SUMMARY_RESULT}", "o": options},
            "dependency_result_max_bytes": [16],
        }
    if kind in {"FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
        return {
            "canonical_json_template": {"e": "${SUMMARY_RESULT}"},
            "dependency_result_max_bytes": [48],
        }
    if kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        return {
            "canonical_json_template": {
                "e": "${SUMMARY_RESULT}",
                "f": edge["from"],
                "i": edge["id"],
                "t": edge["to"],
            },
            "dependency_result_max_bytes": [32],
        }
    if kind == "FINAL_SPECIALIST_CODE":
        return {
            "canonical_json_template": {"c": class_code, "e": "${SUMMARY_RESULT}"},
            "dependency_result_max_bytes": [48],
        }
    raise Invalid(f"DYNAMIC_TEMPLATE: {kind}")


def text_contract(kind, root_signal_max=None):
    if kind == "EVIDENCE_SLICE_LABEL":
        return "Extract one signal from p.", "1-48 [A-Za-z0-9._:-]+ only.", 48
    if kind == "ENDPOINT_SLICE_LABEL":
        return "Extract one bound edge signal.", "1-32 [A-Za-z0-9._:-]+ only.", 32
    if kind == "PAIR_SIGNAL_REDUCER":
        maximum = root_signal_max or 48
        return "Reduce l+r to one signal.", f"1-{maximum} [A-Za-z0-9._:-]+ only.", maximum
    if kind == "FINAL_OPTION_SELECTOR":
        return "Choose one o using e.", '{"selected_choice":<exact o>}', 128
    if kind == "FINAL_EDGE_VERDICT":
        return "Judge edge e.", '{"verdict":"supported|unsupported"}', 128
    if kind == "FINAL_TENSION_VERDICT":
        return "Judge boundary e.", '{"preserve_boundary":true|false}', 128
    if kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        return "Judge edge i using e.", "S or U only.", 1
    if kind == "FINAL_SPECIALIST_CODE":
        return "Judge specialist e.", "S:<c> or U:<c> only.", 3
    raise Invalid(f"TEXT_CONTRACT: {kind}")


def replace_template(template, results=None, maximum=False):
    maxima = template["dependency_result_max_bytes"]
    if maximum:
        values = ["x" * count for count in maxima]
    else:
        if results is None or len(results) != len(maxima):
            raise Invalid("DEPENDENCY_RESULT_ARITY")
        values = list(results)
        for value, limit in zip(values, maxima):
            if not isinstance(value, str) or len(value.encode("utf-8")) > limit:
                raise Invalid("DEPENDENCY_RESULT_LIMIT")
    replacements = {
        "${LEFT_RESULT}": values[0],
        "${RIGHT_RESULT}": values[1] if len(values) > 1 else None,
        "${SUMMARY_RESULT}": values[0],
    }

    def visit(value):
        if isinstance(value, dict):
            return {key: visit(child) for key, child in value.items()}
        if isinstance(value, list):
            return [visit(child) for child in value]
        return replacements.get(value, value)

    return canonical_no_lf(visit(template["canonical_json_template"]))


def make_node(nodes, path, dependencies, kind, payload=None, template=None, root_signal_max=None):
    node = {
        "local_id": f"n{len(nodes):05d}",
        "path": path,
        "dependencies": dependencies,
        "kind": kind,
        "dynamic": template is not None,
        "payload": payload,
        "template": template,
        "root_signal_max": root_signal_max,
        "answer": None,
    }
    nodes.append(node)
    return node["local_id"]


def build_nodes(cell, context, compiler_family, coverage):
    nodes = []
    leaf_ids = []
    leaf_ids_by_pointer = {}
    for entry in coverage:
        if entry["disposition"] != "MODEL_EXPOSED_SLICE":
            continue
        pointer_ids = []
        for segment in entry["segments"]:
            local_id = make_node(
                nodes,
                f"leaf/{len(leaf_ids):05d}",
                [],
                "ENDPOINT_SLICE_LABEL"
                if compiler_family == "CROSS_TOPIC_EDGE_SET"
                else "EVIDENCE_SLICE_LABEL",
                payload=segment["payload_utf8"].encode("utf-8"),
            )
            leaf_ids.append(local_id)
            pointer_ids.append(local_id)
        leaf_ids_by_pointer[entry["pointer"]] = pointer_ids
    if not leaf_ids:
        raise Invalid(f"NO_MODEL_LEAF: {cell['index']}")

    if compiler_family == "CROSS_TOPIC_EDGE_SET":
        decisions = context.get("endpoint_decisions")
        edges = context.get("edge_candidates")
        if not isinstance(decisions, list) or not isinstance(edges, list) or len(edges) != 8:
            raise Invalid("S50_SOURCE_SHAPE")
        decision_indexes = {row.get("id"): index for index, row in enumerate(decisions)}
        if len(decision_indexes) != len(decisions) or None in decision_indexes:
            raise Invalid("S50_ENDPOINT_IDENTITIES")
        edge_roots = {}
        for edge_index, edge in enumerate(edges):
            if edge.get("from") not in decision_indexes or edge.get("to") not in decision_indexes:
                raise Invalid("S50_EDGE_ENDPOINT")
            bindings = (
                (f"/endpoint_decisions/{decision_indexes[edge['from']]}/choice", "f"),
                (f"/endpoint_decisions/{decision_indexes[edge['to']]}/choice", "t"),
                (f"/edge_candidates/{edge_index}/type", "y"),
                (f"/edge_candidates/{edge_index}/statement", "s"),
            )
            current = []
            tags = {}
            for pointer, tag in bindings:
                bound = leaf_ids_by_pointer.get(pointer)
                if not bound:
                    raise Invalid(f"S50_EDGE_EVIDENCE: {pointer}")
                current.extend(bound)
                for local_id in bound:
                    tags[local_id] = [tag]
            level = 0
            while len(current) > 1:
                following = []
                for pair_index in range(math.ceil(len(current) / 2)):
                    left = current[pair_index * 2]
                    if pair_index * 2 + 1 >= len(current):
                        following.append(left)
                        continue
                    right = current[pair_index * 2 + 1]
                    merged = []
                    for tag in tags[left] + tags[right]:
                        if tag not in merged:
                            merged.append(tag)
                    local_id = make_node(
                        nodes,
                        f"edge/{edge_index:03d}/reduce/{level:03d}/{pair_index:03d}",
                        [left, right],
                        "PAIR_SIGNAL_REDUCER",
                        template=dynamic_template(
                            "PAIR_SIGNAL_REDUCER",
                            context,
                            edge=edge,
                            left_tags=tags[left],
                            right_tags=tags[right],
                        ),
                        root_signal_max=32,
                    )
                    following.append(local_id)
                    tags[local_id] = merged
                current = following
                level += 1
            edge_roots[edge["id"]] = current[0]
        final_ids = []
        verdicts = {
            row["edge_id"]: row["verdict"]
            for row in cell["expected_output"].get("edge_verdicts", [])
        }
        for edge_index, edge in enumerate(edges):
            root = edge_roots[edge["id"]]
            local_id = make_node(
                nodes,
                f"final/{edge_index:03d}",
                [root],
                "FINAL_EDGE_VERDICT_PER_EDGE",
                template=dynamic_template("FINAL_EDGE_VERDICT_PER_EDGE", context, edge=edge),
            )
            if verdicts.get(edge["id"]) not in {"supported", "unsupported"}:
                raise Invalid(f"S50_EXPECTED_VERDICT: {edge['id']}")
            nodes[-1]["answer"] = "S" if verdicts[edge["id"]] == "supported" else "U"
            final_ids.append(local_id)
        return nodes, edge_roots, final_ids

    current = list(leaf_ids)
    level = 0
    while len(current) > 1:
        following = []
        for pair_index in range(math.ceil(len(current) / 2)):
            left = current[pair_index * 2]
            if pair_index * 2 + 1 >= len(current):
                following.append(left)
                continue
            right = current[pair_index * 2 + 1]
            local_id = make_node(
                nodes,
                f"reduce/{level:03d}/{pair_index:05d}",
                [left, right],
                "PAIR_SIGNAL_REDUCER",
                template=dynamic_template("PAIR_SIGNAL_REDUCER", context),
            )
            following.append(local_id)
        current = following
        level += 1
    root_id = current[0]
    if compiler_family == "DECISION_SELECTOR":
        root = next((node for node in nodes if node["local_id"] == root_id), None)
        if root is None or root["kind"] != "PAIR_SIGNAL_REDUCER":
            raise Invalid("DECISION_ROOT_REDUCER")
        root["root_signal_max"] = 16
        root["template"]["dependency_result_max_bytes"] = [48, 48]
        final_kind = "FINAL_OPTION_SELECTOR"
        class_code = None
    elif compiler_family == "EDGE_JUDGE":
        final_kind = "FINAL_EDGE_VERDICT"
        class_code = None
    elif compiler_family == "TENSION_JUDGE":
        final_kind = "FINAL_TENSION_VERDICT"
        class_code = None
    elif compiler_family == "SPECIALIST_CLASSIFIER":
        classes = {
            "provenance_gap": "P",
            "authority_conflation": "C",
            "counterfactual_failure": "K",
        }
        classification = cell["expected_output"].get("classification")
        class_code = classes.get(classification)
        if class_code is None or f'classification="{classification}"' not in cell["render_utf8"]:
            raise Invalid("S60_CLASSIFICATION")
        final_kind = "FINAL_SPECIALIST_CODE"
    else:
        raise Invalid(f"COMPILER_FAMILY: {compiler_family}")
    final_id = make_node(
        nodes,
        "final/000",
        [root_id],
        final_kind,
        template=dynamic_template(final_kind, context, class_code=class_code),
    )
    if compiler_family == "SPECIALIST_CLASSIFIER":
        verdict = cell["expected_output"].get("verdict")
        if verdict not in {"supported", "unsupported"}:
            raise Invalid("S60_EXPECTED_VERDICT")
        nodes[-1]["answer"] = ("S:" if verdict == "supported" else "U:") + class_code
    else:
        nodes[-1]["answer"] = cell["expected_output_utf8"]
    return nodes, root_id, [final_id]


def derive_cell(cell, route, route_code, payload_max):
    marker, context, context_bytes = parse_context(cell)
    compiler_family = family(marker)
    coverage = []
    for pointer, value in scalars(context):
        disp = disposition(pointer, compiler_family)
        scalar = canonical_no_lf(value)
        entry = {
            "disposition": disp,
            "pointer": pointer,
            "scalar_bytes": len(scalar),
            "scalar_sha256": sha256(scalar),
            "scalar_type": "null" if value is None else type(value).__name__,
            "segments": [],
        }
        if disp == "MODEL_EXPOSED_SLICE":
            field_name = last_pointer_key(pointer)
            binding = s50_binding(pointer, context) if compiler_family == "CROSS_TOPIC_EDGE_SET" else None
            if compiler_family == "CROSS_TOPIC_EDGE_SET" and binding is None:
                raise Invalid(f"S50_SLICE_BINDING: {pointer}")
            text = value if isinstance(value, str) else scalar.decode("utf-8")
            for ordinal, (start, end, chunk) in enumerate(
                split_leaf(field_name, value, binding, payload_max)
            ):
                payload = label_payload(field_name, chunk, binding)
                entry["segments"].append(
                    {
                        "end_byte": end,
                        "ordinal": ordinal,
                        "payload_bytes": len(payload),
                        "payload_sha256": sha256(payload),
                        "payload_utf8": payload.decode("utf-8"),
                        "slice_bytes": len(chunk.encode("utf-8")),
                        "slice_sha256": sha256(chunk.encode("utf-8")),
                        "start_byte": start,
                    }
                )
            rebuilt = "".join(json.loads(row["payload_utf8"])["x"] for row in entry["segments"])
            if rebuilt != text:
                raise Invalid(f"COVERAGE_RECONSTRUCTION: {cell['index']}:{pointer}")
        coverage.append(entry)
    nodes, root_signal, final_ids = build_nodes(cell, context, compiler_family, coverage)
    skeleton = {
        "cell": cell["cell"],
        "cell_index": cell["index"],
        "compiler_family": compiler_family,
        "context_bytes": len(context_bytes),
        "context_sha256": sha256(context_bytes),
        "coverage": coverage,
        "dag_skeleton": [
            {
                "atom_id": node["local_id"],
                "atom_path": node["path"],
                "dependencies": node["dependencies"],
                "dynamic": node["dynamic"],
                "kind": node["kind"],
                **(
                    {"subject_template": node["template"]}
                    if node["dynamic"]
                    else {"payload_sha256": sha256(node["payload"])}
                ),
            }
            for node in nodes
        ],
        "final_node_ids": final_ids,
        "root_signal_node_id": root_signal,
        "route": route,
        "source_shape": source_shape(cell["cell"]),
    }
    control_sha = sha256(canonical_no_lf(skeleton))
    for node in nodes:
        criterion, output_contract, result_max = text_contract(node["kind"], node["root_signal_max"])
        node.update(
            {
                "cell": cell["cell"],
                "cell_index": cell["index"],
                "control_sha": control_sha,
                "criterion": criterion,
                "output_contract": output_contract,
                "result_max": result_max,
                "route": route,
                "route_code": route_code,
            }
        )
    return nodes


def validate_semantic(bundle):
    if not isinstance(bundle, dict) or bundle.get("schema_id") != SEMANTIC_SCHEMA:
        raise Invalid("SEMANTIC_SCHEMA")
    cells = bundle.get("cells")
    if not isinstance(cells, list) or len(cells) != EXPECTED_CELL_COUNT:
        raise Invalid("SEMANTIC_CELL_COUNT")
    families = Counter()
    shapes = Counter()
    for index, cell in enumerate(cells):
        if cell.get("index") != index:
            raise Invalid(f"SEMANTIC_CELL_INDEX: {index}")
        render = cell.get("render_utf8", "").encode("utf-8")
        answer = cell.get("expected_output_utf8", "").encode("utf-8")
        if (
            len(render) != cell.get("render_utf8_bytes")
            or sha256(render) != cell.get("render_utf8_sha256")
            or len(answer) != cell.get("expected_output_bytes")
            or sha256(answer) != cell.get("expected_output_sha256")
            or parse_json(answer, f"cell-{index}-answer") != cell.get("expected_output")
        ):
            raise Invalid(f"SEMANTIC_CELL_BINDING: {index}")
        marker, context, raw = parse_context(cell)
        if not context or not raw:
            raise Invalid(f"SEMANTIC_CONTEXT: {index}")
        families[family(marker)] += 1
        shapes[source_shape(cell["cell"])] += 1
    if families != Counter(
        {
            "DECISION_SELECTOR": 71,
            "EDGE_JUDGE": 18,
            "TENSION_JUDGE": 4,
            "CROSS_TOPIC_EDGE_SET": 1,
            "SPECIALIST_CLASSIFIER": 3,
        }
    ):
        raise Invalid(f"SEMANTIC_FAMILIES: {dict(families)}")
    if len(shapes) != 9:
        raise Invalid(f"SEMANTIC_SOURCE_SHAPES: {dict(shapes)}")
    return cells


def validate_bound_authorities(base):
    manifest = parse_json(
        bind(base / MANIFEST_REL, MANIFEST_SHA256, MANIFEST_BYTES),
        MANIFEST_REL,
        True,
    )
    if manifest.get("schema_id") != MANIFEST_SCHEMA:
        raise Invalid("MANIFEST_SCHEMA")
    if manifest.get("authority") != {
        "canary_launch": False,
        "empirical_launch": False,
        "implementation": True,
        "matrix_launch": False,
        "qualification": False,
        "release": False,
    }:
        raise Invalid("MANIFEST_AUTHORITY")
    bindings = manifest.get("bindings")
    expected_bindings = {
        "D": (ARCHITECTURE_REL, ARCHITECTURE_SHA256, ARCHITECTURE_BYTES),
        "R": (REVIEW_REL, REVIEW_SHA256, REVIEW_BYTES),
        "P0": (DECOMPOSITION_REL, DECOMPOSITION_SHA256, DECOMPOSITION_BYTES),
        "S": (SEMANTIC_REL, SEMANTIC_SHA256, SEMANTIC_BYTES),
    }
    for symbol, (path, digest, count) in expected_bindings.items():
        row = bindings.get(symbol) if isinstance(bindings, dict) else None
        if row != {"bytes": count, "mode": "100644", "path": path, "sha256": digest}:
            raise Invalid(f"MANIFEST_BINDING_{symbol}")
    slice_v = manifest.get("slices", {}).get("V")
    if not isinstance(slice_v, dict) or slice_v.get("allowed_reads") != ["D", "R", "P0", "S"]:
        raise Invalid("MANIFEST_SLICE_V_READS")
    if slice_v.get("output") != "r9_codex_native_goal_bootstrap_skill_offline_verifier_v1.py":
        raise Invalid("MANIFEST_SLICE_V_OUTPUT")
    public = manifest.get("public_api", {})
    check_api = public.get("verifier_check")
    check_fields = ["authority", "check", "first_mismatch", "schema_id", "static_capacity", "workspace_writes"]
    if check_api != {"exact_fields": check_fields, "schema_id": CHECK_SCHEMA}:
        raise Invalid("MANIFEST_VERIFIER_API")

    architecture = parse_json(
        bind(base / ARCHITECTURE_REL, ARCHITECTURE_SHA256, ARCHITECTURE_BYTES),
        ARCHITECTURE_REL,
        True,
    )
    if architecture.get("schema_id") != ARCHITECTURE_SCHEMA:
        raise Invalid("ARCHITECTURE_SCHEMA")
    if architecture.get("design", {}).get("fork_turns") != "none":
        raise Invalid("ARCHITECTURE_FORK_TURNS")
    if architecture.get("omp_boundary") != {
        "artifacts": "FROZEN DIAGNOSTIC-ONLY COMPARATOR EVIDENCE",
        "dependency": False,
        "execution": False,
        "monitoring": False,
        "qualification_credit": 0,
    }:
        raise Invalid("ARCHITECTURE_OMP_BOUNDARY")
    limits = architecture.get("limits")
    expected_limits = {
        "acceptance_criterion_max_utf8_bytes": 256,
        "atom_output_max_utf8_bytes": 128,
        "goal_objective_max_utf8_bytes": 256,
        "initial_spawn_message_max_utf8_bytes": 256,
        "intermediate_compact_result_max_utf8_bytes": 48,
        "project_skill_max_utf8_bytes": 1024,
        "run_message_max_utf8_bytes": 512,
        "subject_payload_max_utf8_bytes": 170,
        "wait_agent_timeout_seconds": 60,
    }
    if limits != expected_limits:
        raise Invalid("ARCHITECTURE_LIMITS")
    catalog = architecture.get("wire_schema_catalog")
    expected_catalog = {
        "accounting": {
            "exact_fields": [
                "schema_id",
                "run_id",
                "atom_id",
                "route",
                "task_path",
                "goal_thread_id",
                "result",
                "status",
                "qualification_credit",
            ],
            "schema_id": ACCOUNTING_SCHEMA,
        },
        "predeclaration": {
            "exact_fields": [
                "schema_id",
                "run_id",
                "atom_id",
                "route",
                "task_name",
                "objective_utf8",
                "objective_sha256",
                "spawn_utf8",
                "spawn_sha256",
                "run_utf8",
                "run_sha256",
                "subject_payload_sha256",
            ],
            "schema_id": PREDECLARATION_SCHEMA,
        },
        "runtime_event": {
            "exact_fields": [
                "schema_id",
                "event_index",
                "kind",
                "direct_sender_task_path",
                "utf8",
                "utf8_bytes",
                "sha256",
            ],
            "kinds": list(RUNTIME_KINDS),
            "schema_id": RUNTIME_EVENT_SCHEMA,
        },
        "shared_catalog_rule": "ADAPTER AND VERIFIER MUST EACH REOPEN THIS EXACT ARCHITECTURE AND REQUIRE THESE FIELD SETS BYTE-FOR-BYTE; VERIFIER MUST INDEPENDENTLY REDERIVE ALL VALUES",
    }
    if catalog != expected_catalog:
        raise Invalid("ARCHITECTURE_WIRE_CATALOG")

    review = parse_json(bind(base / REVIEW_REL, REVIEW_SHA256, REVIEW_BYTES), REVIEW_REL, True)
    if review.get("status") != "PASS_DISTINCT_GOAL_FIRST_SKILL_ADAPTER_DESIGN_ZERO_CREDIT_IMPLEMENTATION_ONLY_AUTHORITY":
        raise Invalid("REVIEW_STATUS")
    if review.get("qualification_state", {}).get("qualification_credit") != 0:
        raise Invalid("REVIEW_CREDIT")
    bind(base / DECOMPOSITION_REL, DECOMPOSITION_SHA256, DECOMPOSITION_BYTES)
    semantic = parse_json(bind(base / SEMANTIC_REL, SEMANTIC_SHA256, SEMANTIC_BYTES), SEMANTIC_REL, True)
    return manifest, architecture, validate_semantic(semantic)


def derive_specs(cells, architecture):
    payload_max = architecture["limits"]["subject_payload_max_utf8_bytes"]
    specs = []
    for route, route_code in ROUTES:
        for cell in cells:
            specs.extend(derive_cell(cell, route, route_code, payload_max))
    return specs


def atom_id(run_id, spec):
    return sha256(
        canonical_no_lf(
            [run_id, spec["cell_index"], spec["route"], spec["path"], 0]
        )
    )[:24]


def atom_identity_map(run_id, specs):
    local = {
        (spec["cell_index"], spec["route"], spec["local_id"]): atom_id(run_id, spec)
        for spec in specs
    }
    by_id = {}
    for spec in specs:
        identifier = atom_id(run_id, spec)
        if identifier in by_id:
            raise Invalid("ATOM_ID_COLLISION")
        dependencies = [
            local[(spec["cell_index"], spec["route"], dependency)]
            for dependency in spec["dependencies"]
        ]
        by_id[identifier] = (spec, dependencies)
    return by_id


def goal_objective(run_id, identifier, spec):
    return (
        f"R9 atom;run={run_id};c={spec['cell_index']};r={spec['route_code']};"
        f"a={identifier};m={spec['control_sha']};no-retry."
    )


def spawn_message(objective):
    return f"Use $r9-goal-atom-bootstrap. Objective: {objective}"


def run_message(spec, payload):
    return "RUN " + canonical_no_lf(
        {"c": spec["criterion"], "p": payload.decode("utf-8"), "q": spec["output_contract"]}
    ).decode("utf-8")


def static_capacity(specs, architecture):
    limits = architecture["limits"]
    route_counts = Counter(spec["route"] for spec in specs)
    kind_counts = Counter(spec["kind"] for spec in specs)
    if len(specs) != EXPECTED_ATOM_COUNT:
        raise Invalid(f"ATOM_COUNT: {len(specs)}")
    if route_counts != Counter({route: EXPECTED_ROUTE_COUNT for route, _code in ROUTES}):
        raise Invalid(f"ROUTE_COUNTS: {dict(route_counts)}")
    run_id = "offline-verifier-check-v1"
    identities = atom_identity_map(run_id, specs)
    dag_projection = []
    message_projection = []
    answer_projection = []
    depth = {}
    maximum_depth = 0
    maximum_payload = 0
    maximum_spawn = 0
    maximum_run = 0
    for identifier, (spec, dependencies) in identities.items():
        objective = goal_objective(run_id, identifier, spec)
        spawn = spawn_message(objective)
        payload = replace_template(spec["template"], maximum=True) if spec["dynamic"] else spec["payload"]
        run = run_message(spec, payload)
        if len(objective.encode("utf-8")) > limits["goal_objective_max_utf8_bytes"]:
            raise Invalid(f"OBJECTIVE_LIMIT: {identifier}")
        if len(spawn.encode("utf-8")) > limits["initial_spawn_message_max_utf8_bytes"]:
            raise Invalid(f"SPAWN_LIMIT: {identifier}")
        if len(run.encode("utf-8")) > limits["run_message_max_utf8_bytes"]:
            raise Invalid(f"RUN_LIMIT: {identifier}")
        if len(payload) > limits["subject_payload_max_utf8_bytes"]:
            raise Invalid(f"PAYLOAD_LIMIT: {identifier}")
        if len(spec["criterion"].encode("utf-8")) > limits["acceptance_criterion_max_utf8_bytes"]:
            raise Invalid(f"CRITERION_LIMIT: {identifier}")
        if spec["result_max"] > limits["atom_output_max_utf8_bytes"]:
            raise Invalid(f"RESULT_LIMIT: {identifier}")
        if spec["answer"] is not None and len(spec["answer"].encode("utf-8")) > spec["result_max"]:
            raise Invalid(f"SCORER_RESULT_LIMIT: {identifier}")
        depth[identifier] = 1 + max((depth[item] for item in dependencies), default=0)
        maximum_depth = max(maximum_depth, depth[identifier])
        maximum_payload = max(maximum_payload, len(payload))
        maximum_spawn = max(maximum_spawn, len(spawn.encode("utf-8")))
        maximum_run = max(maximum_run, len(run.encode("utf-8")))
        dag_projection.append(
            {
                "atom_id": identifier,
                "cell_index": spec["cell_index"],
                "dependencies": dependencies,
                "kind": spec["kind"],
                "route": spec["route"],
            }
        )
        message_projection.append(
            {
                "atom_id": identifier,
                "objective_sha256": sha256(objective.encode("utf-8")),
                "payload_sha256": sha256(payload),
                "run_sha256": sha256(run.encode("utf-8")),
                "spawn_sha256": sha256(spawn.encode("utf-8")),
            }
        )
        if spec["answer"] is not None:
            answer_projection.append(
                {
                    "atom_id": identifier,
                    "bytes": len(spec["answer"].encode("utf-8")),
                    "sha256": sha256(spec["answer"].encode("utf-8")),
                }
            )
    if len(answer_projection) != 312:
        raise Invalid(f"SCORER_ATOM_COUNT: {len(answer_projection)}")
    if len({row["atom_id"] for row in answer_projection}) != len(answer_projection):
        raise Invalid("SCORER_ATOM_REUSE")
    sha256(canonical_no_lf(answer_projection))
    return {
        "atom_count": len(specs),
        "atom_kind_counts": dict(sorted(kind_counts.items())),
        "cell_count": EXPECTED_CELL_COUNT,
        "dag_projection_sha256": sha256(canonical_no_lf(dag_projection)),
        "limits": limits,
        "matrix_credit": 0,
        "max_dag_depth": maximum_depth,
        "max_run_utf8_bytes": maximum_run,
        "max_spawn_utf8_bytes": maximum_spawn,
        "max_subject_payload_bytes": maximum_payload,
        "message_projection_sha256": sha256(canonical_no_lf(message_projection)),
        "qualification_credit": 0,
        "route_counts": dict(sorted(route_counts.items())),
        "semantic_cell_route_count": EXPECTED_CELL_COUNT * len(ROUTES),
        "workspace_writes": 0,
    }


def validate_index(record, specs, manifest):
    api = manifest["public_api"]["adapter_index"]
    exact_fields(record, api["exact_fields"], "INDEX")
    if record["schema_id"] != api["schema_id"] or record["schema_id"] != INDEX_SCHEMA:
        raise Invalid("INDEX_SCHEMA")
    run_id = record["run_id"]
    if not isinstance(run_id, str) or RUN_ID_RE.fullmatch(run_id) is None:
        raise Invalid("INDEX_RUN_ID")
    if record["qualification_credit"] != 0:
        raise Invalid("INDEX_CREDIT")
    identities = atom_identity_map(run_id, specs)
    expected_rows = [
        {
            "atom_id": identifier,
            "cell_index": spec["cell_index"],
            "dependencies": dependencies,
            "kind": spec["kind"],
            "route": spec["route"],
        }
        for identifier, (spec, dependencies) in identities.items()
    ]
    if record["atom_count"] != EXPECTED_ATOM_COUNT or len(record["atoms"]) != EXPECTED_ATOM_COUNT:
        raise Invalid("INDEX_ATOM_COUNT")
    if record["route_counts"] != {route: EXPECTED_ROUTE_COUNT for route, _code in ROUTES}:
        raise Invalid("INDEX_ROUTE_COUNTS")
    atom_fields = api["atom_exact_fields"]
    for row in record["atoms"]:
        exact_fields(row, atom_fields, "INDEX_ATOM")
    if record["atoms"] != expected_rows:
        raise Invalid("INDEX_ATOM_DERIVATION")
    return run_id, identities


def parse_run_utf8(value):
    if not isinstance(value, str) or not value.startswith("RUN "):
        raise Invalid("RUN_PREFIX")
    raw = value[4:].encode("utf-8")
    parsed = parse_json(raw, "run-message")
    exact_fields(parsed, ["c", "p", "q"], "RUN_MESSAGE")
    if canonical_no_lf(parsed) != raw:
        raise Invalid("RUN_NONCANONICAL")
    if not all(isinstance(parsed[key], str) for key in ("c", "p", "q")):
        raise Invalid("RUN_STRING_FIELDS")
    return parsed


def validate_render(record, spec, dependencies, run_id, identifier, payload, manifest, architecture):
    api = manifest["public_api"]["adapter_render_one"]
    exact_fields(record, api["exact_fields"], "RENDER")
    if record["schema_id"] != api["schema_id"] or record["schema_id"] != RENDER_SCHEMA:
        raise Invalid("RENDER_SCHEMA")
    if (
        record["run_id"] != run_id
        or record["atom_id"] != identifier
        or record["cell_index"] != spec["cell_index"]
        or record["route"] != spec["route"]
        or record["qualification_credit"] != 0
    ):
        raise Invalid("RENDER_IDENTITY")
    objective = goal_objective(run_id, identifier, spec)
    if record["goal_objective_utf8"] != objective:
        raise Invalid("RENDER_OBJECTIVE")
    pre = record["predeclaration"]
    pre_fields = architecture["wire_schema_catalog"]["predeclaration"]["exact_fields"]
    exact_fields(pre, pre_fields, "PREDECLARATION")
    if pre["schema_id"] != PREDECLARATION_SCHEMA:
        raise Invalid("PREDECLARATION_SCHEMA")
    if (
        pre["run_id"] != run_id
        or pre["atom_id"] != identifier
        or pre["route"] != spec["route"]
        or pre["objective_utf8"] != objective
        or pre["objective_sha256"] != sha256(objective.encode("utf-8"))
    ):
        raise Invalid("PREDECLARATION_IDENTITY")
    task_name = pre["task_name"]
    if not isinstance(task_name, str) or TASK_NAME_RE.fullmatch(task_name) is None:
        raise Invalid("PREDECLARATION_TASK_NAME")
    if identifier not in task_name:
        raise Invalid("PREDECLARATION_TASK_FRESHNESS")
    if record["spawn_utf8"] != pre["spawn_utf8"] or record["run_utf8"] != pre["run_utf8"]:
        raise Invalid("RENDER_PREDECLARATION_BYTES")
    spawn = pre["spawn_utf8"]
    run = pre["run_utf8"]
    if spawn != spawn_message(objective):
        raise Invalid("SPAWN_EXACT_BYTES")
    lowered = spawn.lower()
    if any(token in lowered for token in PROHIBITED_SPAWN_TOKENS):
        raise Invalid("SPAWN_PREACTIVE_DISCLOSURE")
    run_value = parse_run_utf8(run)
    expected_run = run_message(spec, payload)
    if run != expected_run or run_value != {
        "c": spec["criterion"],
        "p": payload.decode("utf-8"),
        "q": spec["output_contract"],
    }:
        raise Invalid("RUN_EXACT_BYTES")
    if (
        pre["spawn_sha256"] != sha256(spawn.encode("utf-8"))
        or pre["run_sha256"] != sha256(run.encode("utf-8"))
        or pre["subject_payload_sha256"] != sha256(payload)
    ):
        raise Invalid("PREDECLARATION_HASH")
    limits = architecture["limits"]
    if len(objective.encode("utf-8")) > limits["goal_objective_max_utf8_bytes"]:
        raise Invalid("EVIDENCE_OBJECTIVE_LIMIT")
    if len(spawn.encode("utf-8")) > limits["initial_spawn_message_max_utf8_bytes"]:
        raise Invalid("EVIDENCE_SPAWN_LIMIT")
    if len(run.encode("utf-8")) > limits["run_message_max_utf8_bytes"]:
        raise Invalid("EVIDENCE_RUN_LIMIT")
    if len(payload) > limits["subject_payload_max_utf8_bytes"]:
        raise Invalid("EVIDENCE_PAYLOAD_LIMIT")
    return pre


def parse_raw_goal_receipt(value, label):
    if not isinstance(value, str) or value != value.strip() or not value.startswith('{"goal":'):
        raise Invalid(f"{label}_RAW")
    receipt = parse_json(value.encode("utf-8"), label)
    exact_fields(receipt, ["goal", "remainingTokens", "completionBudgetReport"], label)
    goal = receipt["goal"]
    exact_fields(
        goal,
        ["threadId", "objective", "status", "tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"],
        label + "_GOAL",
    )
    if not isinstance(goal["threadId"], str) or THREAD_ID_RE.fullmatch(goal["threadId"]) is None:
        raise Invalid(f"{label}_THREAD")
    for key in ("tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"):
        if not isinstance(goal[key], int) or isinstance(goal[key], bool) or goal[key] < 0:
            raise Invalid(f"{label}_{key}")
    return goal


def validate_result(spec, result):
    if not isinstance(result, str) or not result:
        raise Invalid("COMPACT_RESULT_EMPTY")
    if len(result.encode("utf-8")) > spec["result_max"]:
        raise Invalid("COMPACT_RESULT_LIMIT")
    if spec["answer"] is not None:
        if result != spec["answer"]:
            raise Invalid("COMPACT_RESULT_ANSWER")
    elif SIGNAL_RE.fullmatch(result) is None:
        raise Invalid("COMPACT_RESULT_SIGNAL")


def validate_group(group, spec, dependencies, run_id, identifier, dependency_results, manifest, architecture):
    if len(group) != 8:
        raise Invalid("EVIDENCE_GROUP_SIZE")
    render = group[0]
    events = group[1:7]
    accounting = group[7]
    if spec["dynamic"]:
        missing = [item for item in dependencies if item not in dependency_results]
        if missing:
            raise Invalid(f"DEPENDENCY_EVIDENCE_MISSING: {identifier}:{missing[0]}")
        payload = replace_template(spec["template"], [dependency_results[item] for item in dependencies])
    else:
        payload = spec["payload"]
    pre = validate_render(
        render,
        spec,
        dependencies,
        run_id,
        identifier,
        payload,
        manifest,
        architecture,
    )
    event_fields = architecture["wire_schema_catalog"]["runtime_event"]["exact_fields"]
    sender = None
    for event, kind, event_index in zip(events, RUNTIME_KINDS, RUNTIME_EVENT_INDEXES):
        exact_fields(event, event_fields, "RUNTIME_EVENT")
        if (
            event["schema_id"] != RUNTIME_EVENT_SCHEMA
            or event["kind"] != kind
            or event["event_index"] != event_index
        ):
            raise Invalid(f"RUNTIME_EVENT_ORDER: {kind}")
        if not isinstance(event["utf8"], str):
            raise Invalid(f"RUNTIME_EVENT_UTF8: {kind}")
        data = event["utf8"].encode("utf-8")
        if event["utf8_bytes"] != len(data) or event["sha256"] != sha256(data):
            raise Invalid(f"RUNTIME_EVENT_BYTES: {kind}")
        path = event["direct_sender_task_path"]
        if not isinstance(path, str) or not path.startswith("/root/") or not path.endswith("/" + pre["task_name"]):
            raise Invalid(f"DIRECT_SENDER: {kind}")
        if sender is None:
            sender = path
        elif path != sender:
            raise Invalid("DIRECT_SENDER_DRIFT")
    active = parse_raw_goal_receipt(events[0]["utf8"], "ACTIVE_RECEIPT")
    reopened = parse_raw_goal_receipt(events[1]["utf8"], "GET_GOAL_RECEIPT")
    terminal = parse_raw_goal_receipt(events[4]["utf8"], "TERMINAL_RECEIPT")
    if active["status"] != "active" or reopened["status"] != "active" or terminal["status"] != "complete":
        raise Invalid("GOAL_STATUS_ORDER")
    thread_id = active["threadId"]
    if reopened["threadId"] != thread_id or terminal["threadId"] != thread_id:
        raise Invalid("GOAL_THREAD_DRIFT")
    if any(goal["objective"] != pre["objective_utf8"] for goal in (active, reopened, terminal)):
        raise Invalid("GOAL_OBJECTIVE_DRIFT")
    if active["createdAt"] != reopened["createdAt"] or active["createdAt"] != terminal["createdAt"]:
        raise Invalid("GOAL_CREATED_AT_DRIFT")
    if not (active["updatedAt"] <= reopened["updatedAt"] <= terminal["updatedAt"]):
        raise Invalid("GOAL_UPDATE_ORDER")
    if events[2]["utf8"] != "BOUND":
        raise Invalid("BOUND_EXACT_BYTES")
    result = events[3]["utf8"]
    validate_result(spec, result)
    if events[5]["utf8"] != "SETTLED":
        raise Invalid("TASK_FINAL_NONTERMINAL")
    accounting_fields = architecture["wire_schema_catalog"]["accounting"]["exact_fields"]
    exact_fields(accounting, accounting_fields, "ACCOUNTING")
    if accounting != {
        "schema_id": ACCOUNTING_SCHEMA,
        "run_id": run_id,
        "atom_id": identifier,
        "route": spec["route"],
        "task_path": sender,
        "goal_thread_id": thread_id,
        "result": result,
        "status": "SETTLED",
        "qualification_credit": 0,
    }:
        raise Invalid("ACCOUNTING_EXACT")
    return {
        "atom_id": identifier,
        "result": result,
        "task_path": sender,
        "thread_id": thread_id,
    }


def load_records(path):
    data = read_regular(path)
    try:
        parsed = parse_json(data, str(path))
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict):
            return [parsed]
    except Invalid:
        pass
    records = []
    for number, line in enumerate(data.splitlines(), 1):
        if not line:
            raise Invalid(f"EVIDENCE_BLANK_LINE: {path}:{number}")
        value = parse_json(line, f"{path}:{number}")
        if not isinstance(value, dict) or canonical_no_lf(value) != line:
            raise Invalid(f"EVIDENCE_LINE_CANONICAL: {path}:{number}")
        records.append(value)
    if not records:
        raise Invalid(f"EVIDENCE_EMPTY: {path}")
    return records


def verify_evidence_records(records, specs, manifest, architecture, require_full):
    index = None
    cursor = 0
    if records and isinstance(records[0], dict) and records[0].get("schema_id") == INDEX_SCHEMA:
        index = records[0]
        cursor = 1
        run_id, identities = validate_index(index, specs, manifest)
    else:
        render_records = [
            row for row in records if isinstance(row, dict) and row.get("schema_id") == RENDER_SCHEMA
        ]
        if not render_records:
            raise Invalid("EVIDENCE_NO_RENDER")
        run_ids = {row.get("run_id") for row in render_records}
        if len(run_ids) != 1:
            raise Invalid("EVIDENCE_RUN_ID_DRIFT")
        run_id = next(iter(run_ids))
        if not isinstance(run_id, str) or RUN_ID_RE.fullmatch(run_id) is None:
            raise Invalid("EVIDENCE_RUN_ID")
        identities = atom_identity_map(run_id, specs)
    remaining = len(records) - cursor
    if remaining <= 0 or remaining % 8:
        raise Invalid("EVIDENCE_RECORD_ARITY")
    groups = [records[position : position + 8] for position in range(cursor, len(records), 8)]
    dependency_results = {}
    task_paths = set()
    thread_ids = set()
    seen_atoms = set()
    for group in groups:
        render = group[0]
        if not isinstance(render, dict) or render.get("schema_id") != RENDER_SCHEMA:
            raise Invalid("EVIDENCE_RENDER_ORDER")
        identifier = render.get("atom_id")
        if identifier in seen_atoms:
            raise Invalid("EVIDENCE_ATOM_REUSE")
        if identifier not in identities:
            raise Invalid(f"EVIDENCE_UNKNOWN_ATOM: {identifier}")
        spec, dependencies = identities[identifier]
        verified = validate_group(
            group,
            spec,
            dependencies,
            run_id,
            identifier,
            dependency_results,
            manifest,
            architecture,
        )
        if verified["task_path"] in task_paths:
            raise Invalid("EVIDENCE_TASK_REUSE")
        if verified["thread_id"] in thread_ids:
            raise Invalid("EVIDENCE_GOAL_REUSE")
        seen_atoms.add(identifier)
        task_paths.add(verified["task_path"])
        thread_ids.add(verified["thread_id"])
        dependency_results[identifier] = verified["result"]
    if require_full:
        if index is None:
            raise Invalid("MATRIX_INDEX_MISSING")
        if len(seen_atoms) != EXPECTED_ATOM_COUNT or seen_atoms != set(identities):
            raise Invalid("MATRIX_NOT_FULL")
    return {
        "run_id": run_id,
        "atom_ids": seen_atoms,
        "task_paths": task_paths,
        "thread_ids": thread_ids,
        "full": len(seen_atoms) == EXPECTED_ATOM_COUNT and seen_atoms == set(identities),
    }


def command_paths(args, command):
    if command == "verify-evidence":
        values = list(args.evidence or []) + list(args.paths or [])
        if not values:
            raise Invalid("ARGUMENTS: verify-evidence requires evidence")
        return values
    values = []
    if args.matrix_a is not None:
        values.append(args.matrix_a)
    if args.matrix_b is not None:
        values.append(args.matrix_b)
    values.extend(args.matrix or [])
    values.extend(args.paths or [])
    if len(values) != 2:
        raise Invalid("MATRICES_EXACTLY_TWO_CONSECUTIVE")
    return values


def verify_command(args, specs, manifest, architecture):
    paths = command_paths(args, args.command)
    if args.command == "verify-evidence":
        combined = []
        for path in paths:
            combined.extend(load_records(path))
        verify_evidence_records(combined, specs, manifest, architecture, False)
        return
    matrices = [
        verify_evidence_records(load_records(path), specs, manifest, architecture, True)
        for path in paths
    ]
    if not all(row["full"] for row in matrices):
        raise Invalid("MATRICES_NOT_FULL")
    if matrices[0]["run_id"] == matrices[1]["run_id"]:
        raise Invalid("MATRIX_RUN_REUSE")
    for key, code in (("atom_ids", "MATRIX_ATOM_REUSE"), ("task_paths", "MATRIX_TASK_REUSE"), ("thread_ids", "MATRIX_GOAL_REUSE")):
        if matrices[0][key] & matrices[1][key]:
            raise Invalid(code)


def result(check, first_mismatch, capacity):
    return {
        "authority": {
            "canary_launch": False,
            "empirical_launch": False,
            "matrix_launch": False,
            "qualification": False,
            "release": False,
        },
        "check": check,
        "first_mismatch": first_mismatch,
        "schema_id": CHECK_SCHEMA,
        "static_capacity": capacity,
        "workspace_writes": 0,
    }


def parser():
    root = Parser()
    commands = root.add_subparsers(dest="command", required=True, parser_class=Parser)
    check = commands.add_parser("check")
    check.add_argument("--base", type=Path, required=True)

    evidence = commands.add_parser("verify-evidence")
    evidence.add_argument("--base", type=Path, required=True)
    evidence.add_argument("--evidence", action="append", type=Path)
    evidence.add_argument("paths", nargs="*", type=Path)

    matrices = commands.add_parser("verify-matrices")
    matrices.add_argument("--base", type=Path, required=True)
    matrices.add_argument("--matrix", action="append", type=Path)
    matrices.add_argument("--matrix-a", type=Path)
    matrices.add_argument("--matrix-b", type=Path)
    matrices.add_argument("paths", nargs="*", type=Path)
    return root


def main():
    capacity = None
    try:
        args = parser().parse_args()
        base = args.base.resolve(strict=True)
        manifest, architecture, cells = validate_bound_authorities(base)
        specs = derive_specs(cells, architecture)
        capacity = static_capacity(specs, architecture)
        if args.command != "check":
            verify_command(args, specs, manifest, architecture)
        output = result("PASS", None, capacity)
        exact_fields(output, manifest["public_api"]["verifier_check"]["exact_fields"], "CHECK")
        sys.stdout.buffer.write(canonical(output))
        return 0
    except Exception as exc:
        mismatch = str(exc) if isinstance(exc, Invalid) else f"INTERNAL_{type(exc).__name__}: {exc}"
        sys.stdout.buffer.write(canonical(result("FAIL", mismatch, capacity)))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
