#!/usr/bin/env python3
"""Independent read-only verifier for R9 Codex-native Goal atomic evidence."""

import argparse
import ast
import hashlib
import json
import math
import os
import re
import stat
import sys
from collections import Counter
from pathlib import Path


SCHEMA = "pw-r9-codex-native-goal-resident-atomic-mailbox-offline-verifier-v1"
PUBLIC_SCHEMA = "pw-r9-codex-native-goal-atomic-public-manifest-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-atomic-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-atomic-node-v1"
SCORER_SCHEMA = "pw-r9-codex-native-goal-atomic-scorer-v1"
CAPACITY_SCHEMA = "pw-r9-codex-native-goal-atomic-capacity-report-v1"

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
COMPILER_REL = "r9_codex_native_goal_atomic_manifest_compiler_v1.py"
COMPILER_SHA = "bdae122be76f64dafeb244fdde0aac8986e600cbb9d6fe7a14c2b6828eaa4c9e"
COMPILER_BYTES = 55381

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
SAFE_SIGNAL_RE = re.compile(r"[A-Za-z0-9._:-]+")
SHA_RE = re.compile(r"[0-9a-f]{64}")
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
EXPECTED_PUBLIC_KEYS = {
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


def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def parse_json(data, label, require_canonical=False):
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


def read_regular(path, expected_mode=None):
    try:
        before = os.lstat(path)
    except OSError as exc:
        raise Invalid(f"cannot stat {path}: {exc}") from exc
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
        raise Invalid(f"not regular nonlink: {path}")
    if expected_mode is not None and stat.S_IMODE(before.st_mode) != expected_mode:
        raise Invalid(f"mode mismatch: {path}")
    try:
        fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        try:
            chunks = []
            while True:
                chunk = os.read(fd, 1024 * 1024)
                if not chunk:
                    break
                chunks.append(chunk)
            data = b"".join(chunks)
        finally:
            os.close(fd)
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
    data, _ = read_regular(path, 0o644)
    if len(data) != expected_bytes or sha(data) != expected_sha:
        raise Invalid(f"binding mismatch: {path}")
    return data


def self_identity():
    data, st = read_regular(Path(__file__).resolve(strict=True), 0o644)
    return {"bytes": len(data), "mode": stat.S_IMODE(st.st_mode), "sha256": sha(data)}


def safe_relative(value):
    path = Path(value)
    if path.is_absolute() or not path.parts or any(part in {"", ".", ".."} for part in path.parts):
        raise Invalid(f"unsafe relative path: {value}")
    return path


def exact_keys(value, keys, label):
    if not isinstance(value, dict) or set(value) != set(keys):
        raise Invalid(f"exact keys mismatch {label}: {sorted(value) if isinstance(value, dict) else type(value).__name__}")


def public_scan(value, path=""):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in EXPECTED_PUBLIC_KEYS or key.startswith("expected_"):
                raise Invalid(f"expected-value field in public root: {path}/{key}")
            public_scan(child, path + "/" + key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            public_scan(child, path + "/" + str(index))


def tree_inventory(root):
    try:
        root_st = os.lstat(root)
    except OSError as exc:
        raise Invalid(f"cannot stat root {root}: {exc}") from exc
    if stat.S_ISLNK(root_st.st_mode) or not stat.S_ISDIR(root_st.st_mode):
        raise Invalid(f"root not directory nonlink: {root}")
    if stat.S_IMODE(root_st.st_mode) != 0o700:
        raise Invalid(f"root mode mismatch: {root}")
    files = {}
    directories = {"."}
    for dirpath, dirnames, filenames in os.walk(root, topdown=True, followlinks=False):
        current = Path(dirpath)
        current_st = os.lstat(current)
        if stat.S_ISLNK(current_st.st_mode) or not stat.S_ISDIR(current_st.st_mode):
            raise Invalid(f"directory custody mismatch: {current}")
        if stat.S_IMODE(current_st.st_mode) != 0o700:
            raise Invalid(f"directory mode mismatch: {current}")
        relative_dir = current.relative_to(root).as_posix() or "."
        directories.add(relative_dir)
        for name in list(dirnames):
            child = current / name
            st = os.lstat(child)
            if stat.S_ISLNK(st.st_mode) or not stat.S_ISDIR(st.st_mode):
                raise Invalid(f"non-directory member: {child}")
        for name in filenames:
            child = current / name
            relative = child.relative_to(root).as_posix()
            data, _ = read_regular(child, 0o644)
            files[relative] = data
    return files, directories


def verify_materialized_root(root):
    files, directories = tree_inventory(root)
    if "inventory.json" not in files:
        raise Invalid("missing inventory.json")
    inventory = parse_json(files["inventory.json"], "inventory", True)
    if not isinstance(inventory, list):
        raise Invalid("inventory not array")
    expected_paths = []
    for row in inventory:
        exact_keys(row, ["bytes", "path", "sha256"], "inventory row")
        relative = safe_relative(row["path"]).as_posix()
        if relative == "inventory.json" or relative in expected_paths:
            raise Invalid("inventory path duplicate or self-reference")
        if relative not in files:
            raise Invalid(f"inventory missing file: {relative}")
        data = files[relative]
        if len(data) != row["bytes"] or sha(data) != row["sha256"]:
            raise Invalid(f"inventory identity mismatch: {relative}")
        expected_paths.append(relative)
    if sorted(expected_paths + ["inventory.json"]) != sorted(files):
        raise Invalid("inventory file-set mismatch")
    expected_dirs = {"."}
    for relative in files:
        parent = Path(relative).parent
        while parent != Path("."):
            expected_dirs.add(parent.as_posix())
            parent = parent.parent
    if directories != expected_dirs:
        raise Invalid("directory-set mismatch")
    all_rows = inventory + [
        {
            "bytes": len(files["inventory.json"]),
            "path": "inventory.json",
            "sha256": sha(files["inventory.json"]),
        }
    ]
    projection = canonical_no_lf(all_rows)
    return files, {
        "file_count": len(files),
        "inventory_bytes": len(files["inventory.json"]),
        "inventory_sha256": sha(files["inventory.json"]),
        "projection_bytes": len(projection),
        "projection_sha256": sha(projection),
    }


def pointer_escape(value):
    return str(value).replace("~", "~0").replace("/", "~1")


def scalars(value, pointer=""):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from scalars(child, pointer + "/" + pointer_escape(key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from scalars(child, pointer + "/" + str(index))
    else:
        yield pointer or "/", value


def last_key(pointer):
    parts = pointer.split("/")[1:]
    while parts and parts[-1].isdigit():
        parts.pop()
    return (parts[-1] if parts else "value").replace("~1", "/").replace("~0", "~")


def family(marker):
    mapping = {
        "BEGIN_SINGLE_DECISION_CONTEXT": "DECISION_SELECTOR",
        "BEGIN_ANSWER_FIRST_DECISION_CONTEXT": "DECISION_SELECTOR",
        "BEGIN_SINGLE_EDGE_CONTEXT": "EDGE_JUDGE",
        "BEGIN_SINGLE_TENSION_CONTEXT": "TENSION_JUDGE",
        "BEGIN_COMPACT_INTEGRATION_CONTEXT": "CROSS_TOPIC_EDGE_SET",
        "BEGIN_SINGLE_NEW_EDGE_CONTEXT": "SPECIALIST_CLASSIFIER",
    }
    if marker not in mapping:
        raise Invalid(f"unknown context marker: {marker}")
    return mapping[marker]


def source_shape(name):
    prefixes = (
        "S10A_DECISION",
        "S10A_EDGE",
        "S10A_TENSION",
        "S10B_DECISION",
        "S10B_EDGE",
        "S10B_TENSION",
        "S30_",
        "S50_",
        "S60_",
    )
    for prefix in prefixes:
        if name.startswith(prefix):
            return prefix.rstrip("_")
    raise Invalid(f"unknown cell source shape: {name}")


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
    if last_key(pointer) not in STRUCTURAL_KEYS:
        return "MODEL_EXPOSED_SLICE"
    if compiler_family in {"CROSS_TOPIC_EDGE_SET", "SPECIALIST_CLASSIFIER"}:
        return "DETERMINISTIC_ASSEMBLY_FIELD"
    return "CONTROL_FIELD"


def parse_context(cell):
    match = CONTEXT_RE.search(cell["render_utf8"])
    if match is None or match.group(3) != match.group(1).replace("BEGIN_", "END_", 1):
        raise Invalid(f"context marker mismatch: {cell['cell']}")
    raw = match.group(2).encode("utf-8")
    return match.group(1), parse_json(raw, cell["cell"] + " context"), raw


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


def leaf_payload(field_name, text, binding=None):
    if binding is not None:
        return canonical_no_lf({**binding, "op": "label", "x": text})
    return canonical_no_lf({"op": "label", "t": field_name, "x": text})


def split_leaf(field_name, value, binding=None):
    text = value if isinstance(value, str) else canonical_no_lf(value).decode("utf-8")
    chunks = []
    current = ""
    start = 0
    cursor = 0
    for character in text:
        candidate = current + character
        if len(leaf_payload(field_name, candidate, binding)) > PAYLOAD_MAX:
            if not current:
                raise Invalid("leaf codepoint overflow")
            chunks.append((start, cursor, current))
            start = cursor
            current = character
            if len(leaf_payload(field_name, current, binding)) > PAYLOAD_MAX:
                raise Invalid("leaf fresh codepoint overflow")
        else:
            current = candidate
        cursor += len(character.encode("utf-8"))
    if current or not chunks:
        chunks.append((start, cursor, current))
    if "".join(item[2] for item in chunks) != text:
        raise Invalid("leaf split mismatch")
    return text, chunks


def expected_coverage(context, compiler_family):
    output = []
    for pointer, value in scalars(context):
        encoded = canonical_no_lf(value)
        disp = disposition(pointer, compiler_family)
        entry = {
            "disposition": disp,
            "pointer": pointer,
            "scalar_bytes": len(encoded),
            "scalar_sha256": sha(encoded),
            "scalar_type": "null" if value is None else type(value).__name__,
            "segments": [],
        }
        if disp == "MODEL_EXPOSED_SLICE":
            field = last_key(pointer)
            binding = (
                s50_binding(pointer, context)
                if compiler_family == "CROSS_TOPIC_EDGE_SET"
                else None
            )
            if compiler_family == "CROSS_TOPIC_EDGE_SET" and binding is None:
                raise Invalid(f"S50 model slice missing binding: {pointer}")
            text, chunks = split_leaf(field, value, binding)
            rebuilt = ""
            for ordinal, (start, end, chunk) in enumerate(chunks):
                payload = leaf_payload(field, chunk, binding)
                segment = {
                    "end_byte": end,
                    "ordinal": ordinal,
                    "payload_bytes": len(payload),
                    "payload_sha256": sha(payload),
                    "payload_utf8": payload.decode("utf-8"),
                    "slice_bytes": len(chunk.encode("utf-8")),
                    "slice_sha256": sha(chunk.encode("utf-8")),
                    "start_byte": start,
                }
                entry["segments"].append(segment)
                rebuilt += chunk
            if rebuilt != text:
                raise Invalid("coverage reconstruction mismatch")
        output.append(entry)
    return output


def fixed_literal(render, name):
    found = re.findall(rf'{re.escape(name)}="([^"]+)"', render)
    if len(set(found)) != 1:
        raise Invalid(f"fixed literal mismatch: {name}")
    return found[0]


def class_code(render):
    values = {
        "provenance_gap": "P",
        "authority_conflation": "C",
        "counterfactual_failure": "K",
    }
    matched = [code for value, code in values.items() if f'classification="{value}"' in render]
    if len(matched) != 1:
        raise Invalid("specialist class code mismatch")
    return matched[0]


def dynamic_template(kind, context, edge=None, code=None, left_tags=None, right_tags=None):
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
        return {"canonical_json_template": {"l": "${LEFT_RESULT}", "op": "reduce", "r": "${RIGHT_RESULT}"}, "dependency_result_max_bytes": [48, 48]}
    if kind == "FINAL_OPTION_SELECTOR":
        options = context.get("decision", {}).get("options", context.get("options"))
        return {"canonical_json_template": {"e": "${SUMMARY_RESULT}", "o": options}, "dependency_result_max_bytes": [16]}
    if kind in {"FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
        return {"canonical_json_template": {"e": "${SUMMARY_RESULT}"}, "dependency_result_max_bytes": [48]}
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
        return {"canonical_json_template": {"c": code, "e": "${SUMMARY_RESULT}"}, "dependency_result_max_bytes": [48]}
    raise Invalid(f"unknown dynamic kind: {kind}")


def expected_topology(coverage, compiler_family, context, render):
    topology = []
    current = []
    by_pointer = {}
    for entry in coverage:
        if entry["disposition"] != "MODEL_EXPOSED_SLICE":
            continue
        pointer_ids = []
        for segment in entry["segments"]:
            atom_id = f"n{len(topology):05d}"
            current.append(atom_id)
            pointer_ids.append(atom_id)
            topology.append(
                {
                    "atom_id": atom_id,
                    "atom_path": f"leaf/{len(current)-1:05d}",
                    "dependencies": [],
                    "dynamic": False,
                    "kind": (
                        "ENDPOINT_SLICE_LABEL"
                        if compiler_family == "CROSS_TOPIC_EDGE_SET"
                        else "EVIDENCE_SLICE_LABEL"
                    ),
                    "payload": segment["payload_utf8"].encode("utf-8"),
                }
            )
        by_pointer[entry["pointer"]] = pointer_ids
    if not current:
        raise Invalid("no model-exposed leaves")
    if compiler_family == "CROSS_TOPIC_EDGE_SET":
        decisions = context.get("endpoint_decisions")
        edges = context.get("edge_candidates")
        if not isinstance(decisions, list) or not isinstance(edges, list) or len(edges) != 8:
            raise Invalid("S50 branch source mismatch")
        decision_indexes = {row.get("id"): index for index, row in enumerate(decisions)}
        if len(decision_indexes) != len(decisions) or None in decision_indexes:
            raise Invalid("S50 endpoint identity mismatch")
        roots = {}
        for edge_index, edge in enumerate(edges):
            if edge.get("from") not in decision_indexes or edge.get("to") not in decision_indexes:
                raise Invalid("S50 edge endpoint missing")
            bindings = [
                (f"/endpoint_decisions/{decision_indexes[edge['from']]}/choice", "f"),
                (f"/endpoint_decisions/{decision_indexes[edge['to']]}/choice", "t"),
                (f"/edge_candidates/{edge_index}/type", "y"),
                (f"/edge_candidates/{edge_index}/statement", "s"),
            ]
            branch = []
            tags_by_node = {}
            for pointer, tag in bindings:
                ids = by_pointer.get(pointer)
                if not ids:
                    raise Invalid(f"S50 edge evidence missing: {pointer}")
                branch.extend(ids)
                for atom_id in ids:
                    tags_by_node[atom_id] = [tag]
            level = 0
            while len(branch) > 1:
                following = []
                for pair_index in range(math.ceil(len(branch) / 2)):
                    left = branch[pair_index * 2]
                    if pair_index * 2 + 1 >= len(branch):
                        following.append(left)
                        continue
                    right = branch[pair_index * 2 + 1]
                    atom_id = f"n{len(topology):05d}"
                    following.append(atom_id)
                    merged = []
                    for tag in tags_by_node[left] + tags_by_node[right]:
                        if tag not in merged:
                            merged.append(tag)
                    topology.append(
                        {
                            "atom_id": atom_id,
                            "atom_path": f"edge/{edge_index:03d}/reduce/{level:03d}/{pair_index:03d}",
                            "dependencies": [left, right],
                            "dynamic": True,
                            "kind": "PAIR_SIGNAL_REDUCER",
                            "root_signal_max": EDGE_SIGNAL_MAX,
                            "subject_template": dynamic_template(
                                "PAIR_SIGNAL_REDUCER",
                                context,
                                edge=edge,
                                left_tags=tags_by_node[left],
                                right_tags=tags_by_node[right],
                            ),
                        }
                    )
                    tags_by_node[atom_id] = merged
                branch = following
                level += 1
            roots[edge["id"]] = branch[0]
        final_ids = []
        for edge_index, edge in enumerate(edges):
            atom_id = f"n{len(topology):05d}"
            final_ids.append(atom_id)
            topology.append(
                {
                    "atom_id": atom_id,
                    "atom_path": f"final/{edge_index:03d}",
                    "dependencies": [roots[edge["id"]]],
                    "dynamic": True,
                    "kind": "FINAL_EDGE_VERDICT_PER_EDGE",
                    "subject_template": dynamic_template(
                        "FINAL_EDGE_VERDICT_PER_EDGE", context, edge=edge
                    ),
                }
            )
        return topology, roots, final_ids
    level = 0
    while len(current) > 1:
        following = []
        for pair_index in range(math.ceil(len(current) / 2)):
            left = current[pair_index * 2]
            if pair_index * 2 + 1 == len(current):
                following.append(left)
                continue
            right = current[pair_index * 2 + 1]
            atom_id = f"n{len(topology):05d}"
            following.append(atom_id)
            topology.append(
                {
                    "atom_id": atom_id,
                    "atom_path": f"reduce/{level:03d}/{pair_index:05d}",
                    "dependencies": [left, right],
                    "dynamic": True,
                    "kind": "PAIR_SIGNAL_REDUCER",
                    "subject_template": dynamic_template("PAIR_SIGNAL_REDUCER", context),
                }
            )
        current = following
        level += 1
    root = current[0]
    if compiler_family == "DECISION_SELECTOR":
        matches = [row for row in topology if row["atom_id"] == root and row["kind"] == "PAIR_SIGNAL_REDUCER"]
        if len(matches) != 1:
            raise Invalid("decision root compression topology mismatch")
        matches[0]["root_signal_max"] = 16
        finals = [("FINAL_OPTION_SELECTOR", None, None)]
    elif compiler_family == "EDGE_JUDGE":
        finals = [("FINAL_EDGE_VERDICT", None, None)]
    elif compiler_family == "TENSION_JUDGE":
        finals = [("FINAL_TENSION_VERDICT", None, None)]
    elif compiler_family == "SPECIALIST_CLASSIFIER":
        finals = [("FINAL_SPECIALIST_CODE", None, class_code(render))]
    else:
        raise Invalid("unknown compiler family")
    final_ids = []
    for kind, edge, code in finals:
        atom_id = f"n{len(topology):05d}"
        final_ids.append(atom_id)
        topology.append(
            {
                "atom_id": atom_id,
                "atom_path": f"final/{len(final_ids)-1:03d}",
                "dependencies": [root],
                "dynamic": True,
                "kind": kind,
                "subject_template": dynamic_template(kind, context, edge, code),
            }
        )
    return topology, root, final_ids


def text_contract(kind, root_max=None):
    values = {
        "EVIDENCE_SLICE_LABEL": ("Extract one signal from p.", "1-48 [A-Za-z0-9._:-]+ only.", 48),
        "ENDPOINT_SLICE_LABEL": ("Extract one bound edge signal.", "1-32 [A-Za-z0-9._:-]+ only.", EDGE_SIGNAL_MAX),
        "FINAL_OPTION_SELECTOR": ("Choose one o using e.", '{"selected_choice":<exact o>}', 128),
        "FINAL_EDGE_VERDICT": ("Judge edge e.", '{"verdict":"supported|unsupported"}', 128),
        "FINAL_TENSION_VERDICT": ("Judge boundary e.", '{"preserve_boundary":true|false}', 128),
        "FINAL_EDGE_VERDICT_PER_EDGE": ("Judge edge i using e.", "S or U only.", 1),
        "FINAL_SPECIALIST_CODE": ("Judge specialist e.", "S:<c> or U:<c> only.", 3),
    }
    if kind == "PAIR_SIGNAL_REDUCER":
        maximum = root_max or 48
        return "Reduce l+r to one signal.", f"1-{maximum} [A-Za-z0-9._:-]+ only.", maximum
    if kind not in values:
        raise Invalid(f"unknown contract kind: {kind}")
    return values[kind]


def materialize_template_max(template):
    value = json.loads(json.dumps(template["canonical_json_template"]))
    limits = template["dependency_result_max_bytes"]
    replacement = {
        "${LEFT_RESULT}": "x" * limits[0],
        "${RIGHT_RESULT}": "x" * limits[1] if len(limits) > 1 else None,
        "${SUMMARY_RESULT}": "x" * limits[0],
    }

    def visit(item):
        if isinstance(item, dict):
            return {key: visit(child) for key, child in item.items()}
        if isinstance(item, list):
            return [visit(child) for child in item]
        return replacement.get(item, item)

    return canonical_no_lf(visit(value))


def attempt_id(matrix_id, cell_index, route, atom_path):
    return sha(canonical_no_lf([matrix_id, cell_index, route, atom_path, 0]))[:24]


def nonce(matrix_id, cell_index, route, atom_path, kind, payload_sha):
    return sha(canonical_no_lf([matrix_id, cell_index, route, atom_path, kind, payload_sha]))


def goal_objective(matrix_id, cell_index, route_code, atom_id, manifest_sha):
    return f"R9 atom;run={matrix_id};c={cell_index};r={route_code};a={atom_id};m={manifest_sha};no-retry."


def wire(kind, **values):
    if kind == "subject":
        return canonical_no_lf({"a": values["attempt"], "i": values["atom_id"], "k": "subject", "n": values["nonce"], "p": values["payload"], "ph": values["payload_sha"], "v": 1})
    if kind == "bootstrap":
        return canonical_no_lf({"a": values["attempt"], "d": 60, "k": "boot", "mh": values["manifest_sha"], "n": values["nonce"], "o": values["objective"], "r": values["route_code"], "sh": values["payload_sha"], "v": 1})
    if kind == "control":
        return canonical_no_lf({"a": values["attempt"], "c": values["criterion"], "ch": sha(values["criterion"].encode()), "k": "control", "mh": values["manifest_sha"], "n": values["nonce"], "q": values["output_contract"], "qh": sha(values["output_contract"].encode()), "r": values["route_code"], "sh": values["payload_sha"], "v": 1})
    raise Invalid("unknown wire kind")


def projection_skeleton(cell_file, topology):
    rows = []
    for expected, node in zip(topology, cell_file["nodes"]):
        row = {
            "atom_id": expected["atom_id"],
            "atom_path": expected["atom_path"],
            "dependencies": expected["dependencies"],
            "dynamic": expected["dynamic"],
            "kind": expected["kind"],
        }
        if expected["dynamic"]:
            row["subject_template"] = expected["subject_template"]
        else:
            row["payload_sha256"] = sha(expected["payload"])
        rows.append(row)
    return {
        "cell": cell_file["cell"],
        "cell_index": cell_file["cell_index"],
        "compiler_family": cell_file["compiler_family"],
        "context_bytes": cell_file["context_identity"]["bytes"],
        "context_sha256": cell_file["context_identity"]["sha256"],
        "coverage": cell_file["context_coverage"],
        "dag_skeleton": rows,
        "final_node_ids": cell_file["final_node_ids"],
        "root_signal_node_id": cell_file["root_signal_node_id"],
        "route": cell_file["route"],
        "source_shape": cell_file["source_shape"],
    }


def verify_node(node, expected, cell_file, manifest_sha):
    common_keys = {
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
        "schema_id",
    }
    dynamic_keys = {
        "identity_derivation",
        "subject_template",
        "wire_message_max_bytes",
        "wire_messages",
    }
    static_keys = {
        "atom_nonce",
        "control_bind",
        "spawn_bootstrap",
        "subject_atom",
        "subject_payload",
        "task_name",
    }
    exact_keys(
        node,
        common_keys | (dynamic_keys if expected["dynamic"] else static_keys),
        "public node",
    )
    if node.get("schema_id") != NODE_SCHEMA:
        raise Invalid("node schema mismatch")
    for field in ("atom_id", "atom_path", "dependencies", "dynamic", "kind"):
        if node.get(field) != expected[field]:
            raise Invalid(f"node topology mismatch: {node.get('atom_id')} {field}")
    criterion, output_contract, result_max = text_contract(expected["kind"], expected.get("root_signal_max"))
    route = cell_file["route"]
    aid = attempt_id(cell_file["matrix_id"], cell_file["cell_index"], route, expected["atom_path"])
    objective = goal_objective(cell_file["matrix_id"], cell_file["cell_index"], cell_file["route_code"], expected["atom_id"], manifest_sha)
    if node.get("attempt") != 0 or node.get("attempt_id") != aid:
        raise Invalid("node attempt mismatch")
    if node.get("goal_objective") != {"bytes": len(objective.encode()), "sha256": sha(objective.encode()), "utf8": objective}:
        raise Invalid("node objective mismatch")
    if node.get("acceptance_criterion") != {"bytes": len(criterion.encode()), "sha256": sha(criterion.encode()), "utf8": criterion}:
        raise Invalid("node acceptance mismatch")
    if node.get("output_contract") != {"bytes": len(output_contract.encode()), "sha256": sha(output_contract.encode()), "utf8": output_contract}:
        raise Invalid("node output contract mismatch")
    if node.get("result_max_bytes") != result_max:
        raise Invalid("node result maximum mismatch")
    expected_validation = (
        {"regex": r"[A-Za-z0-9._:-]+", "utf8_bytes_max": result_max, "utf8_bytes_min": 1}
        if expected["kind"] in {"EVIDENCE_SLICE_LABEL", "ENDPOINT_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"}
        else {"closed_output_contract": True, "utf8_bytes_max": result_max}
    )
    if node.get("result_validation") != expected_validation:
        raise Invalid("node result validation mismatch")
    if len(objective.encode()) > OBJECTIVE_MAX or len(criterion.encode()) > ACCEPTANCE_MAX:
        raise Invalid("node textual limit mismatch")
    if expected["dynamic"]:
        template = expected["subject_template"]
        maximum_payload = materialize_template_max(template)
        if len(maximum_payload) > PAYLOAD_MAX:
            raise Invalid("dynamic payload limit mismatch")
        expected_template = {**template, "max_payload_bytes": len(maximum_payload), "payload_sha256_at_admission": "REQUIRED_BEFORE_SPAWN"}
        if node.get("subject_template") != expected_template:
            raise Invalid("dynamic template mismatch")
        dummy_nonce = "0" * 64
        payload_sha = sha(maximum_payload)
        maximums = {
            "control_bind": len(wire("control", attempt=aid, criterion=criterion, manifest_sha=manifest_sha, nonce=dummy_nonce, output_contract=output_contract, payload_sha=payload_sha, route_code=cell_file["route_code"])),
            "spawn_bootstrap": len(wire("bootstrap", attempt=aid, manifest_sha=manifest_sha, nonce=dummy_nonce, objective=objective, payload_sha=payload_sha, route_code=cell_file["route_code"])),
            "subject_atom": len(wire("subject", attempt=aid, atom_id=expected["atom_id"], nonce=dummy_nonce, payload=maximum_payload.decode(), payload_sha=payload_sha)),
        }
        if node.get("wire_message_max_bytes") != maximums or max(maximums.values()) > ENVELOPE_MAX:
            raise Invalid("dynamic wire maximum mismatch")
        if node.get("identity_derivation") != "CONTROLLER_CONTRACT_DYNAMIC_NODE_IDENTITY_RULE":
            raise Invalid("dynamic identity rule mismatch")
        if node.get("wire_messages") != "DERIVED_AND_RECORDED_IN_DYNAMIC_NODE_ADMISSION_BEFORE_SPAWN":
            raise Invalid("dynamic wire rule mismatch")
    else:
        payload = expected["payload"]
        payload_sha = sha(payload)
        atom_nonce = nonce(cell_file["matrix_id"], cell_file["cell_index"], route, expected["atom_path"], expected["kind"], payload_sha)
        subject = wire("subject", attempt=aid, atom_id=expected["atom_id"], nonce=atom_nonce, payload=payload.decode(), payload_sha=payload_sha)
        bootstrap = wire("bootstrap", attempt=aid, manifest_sha=manifest_sha, nonce=atom_nonce, objective=objective, payload_sha=payload_sha, route_code=cell_file["route_code"])
        control = wire("control", attempt=aid, criterion=criterion, manifest_sha=manifest_sha, nonce=atom_nonce, output_contract=output_contract, payload_sha=payload_sha, route_code=cell_file["route_code"])
        expected_values = {
            "atom_nonce": atom_nonce,
            "task_name": "r9_cgra_" + atom_nonce,
            "subject_payload": {"bytes": len(payload), "sha256": payload_sha, "utf8": payload.decode()},
            "subject_atom": {"bytes": len(subject), "sha256": sha(subject), "utf8": subject.decode()},
            "spawn_bootstrap": {"bytes": len(bootstrap), "sha256": sha(bootstrap), "utf8": bootstrap.decode()},
            "control_bind": {"bytes": len(control), "sha256": sha(control), "utf8": control.decode()},
        }
        for field, value in expected_values.items():
            if node.get(field) != value:
                raise Invalid(f"static node field mismatch: {field}")
        if max(len(subject), len(bootstrap), len(control)) > ENVELOPE_MAX or len(payload) > PAYLOAD_MAX:
            raise Invalid("static message limit mismatch")


def expected_assembly(cell, compiler_family, context, final_ids):
    if compiler_family == "DECISION_SELECTOR":
        options = context.get("decision", {}).get("options", context.get("options"))
        return {"allowed_values": options, "dynamic_node": final_ids[0], "kind": "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON", "output_key": "selected_choice"}
    if compiler_family == "EDGE_JUDGE":
        return {"allowed_values": ["supported", "unsupported"], "dynamic_node": final_ids[0], "kind": "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON", "output_key": "verdict"}
    if compiler_family == "TENSION_JUDGE":
        return {"allowed_values": [True, False], "dynamic_node": final_ids[0], "kind": "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON", "output_key": "preserve_boundary"}
    if compiler_family == "CROSS_TOPIC_EDGE_SET":
        candidates = context["edge_candidates"]
        return {
            "fixed": {
                "checked_edge_ids": [item["id"] for item in candidates],
                "claim_boundary": fixed_literal(cell["render_utf8"], "claim_boundary"),
                "external_audit_status": "excluded",
                "forbidden_action_violations": [],
                "protocol_id": fixed_literal(cell["render_utf8"], "protocol_id"),
                "stage": "S50_SEMANTIC",
                "topic_artifact_hashes": context["topic_artifact_hashes"],
            },
            "kind": "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS",
            "ordered_edge_items": [
                {"edge_id": item["id"], "source_decision_ids": [item["from"], item["to"]], "verdict_from_compact_node": node_id}
                for item, node_id in zip(candidates, final_ids)
            ],
        }
    if compiler_family == "SPECIALIST_CLASSIFIER":
        role = re.search(r"ROLE: bounded ([a-z_]+) specialist", cell["render_utf8"])
        if role is None:
            raise Invalid("specialist role missing")
        return {
            "compact_node": final_ids[0],
            "fixed": {
                "candidate_edge_id": context["candidate_edge"]["id"],
                "candidate_lineage_sha256": fixed_literal(cell["render_utf8"], "candidate_lineage_sha256"),
                "claim_boundary": fixed_literal(cell["render_utf8"], "claim_boundary"),
                "classification": fixed_literal(cell["render_utf8"], "classification"),
                "external_audit_status": "excluded",
                "forbidden_action_violations": [],
                "integration_candidate_sha256": fixed_literal(cell["render_utf8"], "integration_candidate_sha256"),
                "protocol_id": fixed_literal(cell["render_utf8"], "protocol_id"),
                "role": role.group(1),
                "source_record_ids": [item["source_record_id"] for item in context["source_records"]],
                "stage": "S60_UNIT",
            },
            "kind": "DETERMINISTIC_S60_ASSEMBLY_FROM_COMPACT_SPECIALIST_CODE",
        }
    raise Invalid("unknown assembly family")


def load_components(base):
    semantic = parse_json(bind(base / SEMANTIC_REL, SEMANTIC_SHA, SEMANTIC_BYTES), SEMANTIC_REL, True)
    design = parse_json(bind(base / DESIGN_REL, DESIGN_SHA, DESIGN_BYTES), DESIGN_REL, True)
    review = parse_json(bind(base / REVIEW_REL, REVIEW_SHA, REVIEW_BYTES), REVIEW_REL, True)
    contract = parse_json(bind(base / CONTRACT_REL, CONTRACT_SHA, CONTRACT_BYTES), CONTRACT_REL, True)
    compiler_bytes = bind(base / COMPILER_REL, COMPILER_SHA, COMPILER_BYTES)
    try:
        compiler_ast = ast.parse(compiler_bytes.decode("utf-8"))
    except Exception as exc:
        raise Invalid(f"compiler AST invalid: {exc}") from exc
    if semantic.get("schema_id") != "pw-r9-immutable-semantic-bundle-v1" or len(semantic.get("cells", [])) != 97:
        raise Invalid("semantic component mismatch")
    if design.get("schema_id") != "pw-r9-codex-native-goal-resident-atomic-mailbox-implementation-design-v1":
        raise Invalid("design schema mismatch")
    if review.get("verdict") != "PASS_ZERO_BLOCKERS|IMPLEMENTATION_ONLY":
        raise Invalid("implementation review mismatch")
    if contract.get("schema_id") != "pw-r9-codex-native-goal-resident-atomic-mailbox-controller-contract-v1":
        raise Invalid("controller contract mismatch")
    if contract["semantic_atomicity"].get("intermediate_result_regex") != "[A-Za-z0-9._:-]+":
        raise Invalid("intermediate signal contract mismatch")
    forbidden_calls = {"spawn_agent", "followup_task", "send_message", "wait_agent", "interrupt_agent"}
    for node in ast.walk(compiler_ast):
        if isinstance(node, ast.Name) and node.id in forbidden_calls:
            raise Invalid("compiler contains collaboration call symbol")
    return semantic, contract


def verify_cell_file(cell_file, semantic_cell, matrix_id, route_tuple):
    route, route_code, model, effort = route_tuple
    exact_keys(
        cell_file,
        [
            "assembly_recipe",
            "cell",
            "cell_index",
            "compiler_family",
            "context_coverage",
            "context_identity",
            "control_manifest_projection_bytes",
            "control_manifest_sha256",
            "dependency_gate",
            "final_node_ids",
            "matrix_id",
            "model_requested",
            "nodes",
            "reasoning_effort_requested",
            "root_signal_node_id",
            "route",
            "route_code",
            "schema_id",
            "source_shape",
        ],
        "public cell",
    )
    if cell_file.get("schema_id") != CELL_SCHEMA:
        raise Invalid("cell schema mismatch")
    fixed = {
        "cell": semantic_cell["cell"],
        "cell_index": semantic_cell["index"],
        "dependency_gate": semantic_cell["dependency_gate"],
        "matrix_id": matrix_id,
        "model_requested": model,
        "reasoning_effort_requested": effort,
        "route": route,
        "route_code": route_code,
        "source_shape": source_shape(semantic_cell["cell"]),
    }
    for key, value in fixed.items():
        if cell_file.get(key) != value:
            raise Invalid(f"cell fixed field mismatch: {semantic_cell['cell']} {route} {key}")
    marker, context, context_raw = parse_context(semantic_cell)
    compiler_family = family(marker)
    if cell_file.get("compiler_family") != compiler_family:
        raise Invalid("compiler family mismatch")
    if cell_file.get("context_identity") != {"bytes": len(context_raw), "sha256": sha(context_raw)}:
        raise Invalid("context identity mismatch")
    coverage = expected_coverage(context, compiler_family)
    if cell_file.get("context_coverage") != coverage:
        raise Invalid("context coverage mismatch")
    topology, root_id, final_ids = expected_topology(coverage, compiler_family, context, semantic_cell["render_utf8"])
    if cell_file.get("root_signal_node_id") != root_id or cell_file.get("final_node_ids") != final_ids:
        raise Invalid("root/final topology mismatch")
    nodes = cell_file.get("nodes")
    if not isinstance(nodes, list) or len(nodes) != len(topology):
        raise Invalid("node count mismatch")
    skeleton = projection_skeleton(cell_file, topology)
    manifest_bytes = canonical_no_lf(skeleton)
    manifest_sha = sha(manifest_bytes)
    if cell_file.get("control_manifest_projection_bytes") != len(manifest_bytes) or cell_file.get("control_manifest_sha256") != manifest_sha:
        raise Invalid("control manifest projection mismatch")
    seen = set()
    for node, expected in zip(nodes, topology):
        if any(dep not in seen for dep in expected["dependencies"]):
            raise Invalid("non-topological dependency")
        verify_node(node, expected, cell_file, manifest_sha)
        seen.add(expected["atom_id"])
    assembly = expected_assembly(semantic_cell, compiler_family, context, final_ids)
    if cell_file.get("assembly_recipe") != assembly:
        raise Invalid("assembly recipe mismatch")
    public_scan(cell_file)
    return nodes, compiler_family


def verify_manifest(base, public_root, scorer_root):
    semantic, _contract = load_components(base)
    public_files, public_identity = verify_materialized_root(public_root)
    scorer_files, scorer_identity = verify_materialized_root(scorer_root)
    if "manifest.json" not in public_files or "capacity.json" not in public_files:
        raise Invalid("public manifest/capacity missing")
    if set(scorer_files) != {"manifest.json", "inventory.json"}:
        raise Invalid("scorer root file set mismatch")
    public = parse_json(public_files["manifest.json"], "public manifest", True)
    scorer = parse_json(scorer_files["manifest.json"], "scorer manifest", True)
    capacity = parse_json(public_files["capacity.json"], "capacity", True)
    exact_keys(
        public,
        [
            "authority",
            "bindings",
            "capacity",
            "cells",
            "compiler_families",
            "controller_protocol",
            "matrix_id",
            "public_scorer_separation",
            "qualification_credit",
            "route_roster",
            "schema_id",
            "source_shape_combinations",
            "status",
        ],
        "public manifest",
    )
    exact_keys(
        scorer,
        [
            "cell_count",
            "cells",
            "comparator",
            "matrix_id",
            "qualification_credit",
            "route_outcome_count",
            "schema_id",
            "semantic_bundle",
        ],
        "scorer manifest",
    )
    public_scan(public)
    if public.get("schema_id") != PUBLIC_SCHEMA or scorer.get("schema_id") != SCORER_SCHEMA or capacity.get("schema_id") != CAPACITY_SCHEMA:
        raise Invalid("manifest schema mismatch")
    matrix_id = public.get("matrix_id")
    if not isinstance(matrix_id, str) or scorer.get("matrix_id") != matrix_id or capacity.get("matrix_id") != matrix_id:
        raise Invalid("matrix id mismatch")
    expected_bindings = {
        "controller_contract": {"bytes": CONTRACT_BYTES, "path": CONTRACT_REL, "sha256": CONTRACT_SHA},
        "implementation_design": {"bytes": DESIGN_BYTES, "path": DESIGN_REL, "sha256": DESIGN_SHA},
        "implementation_review": {"bytes": REVIEW_BYTES, "path": REVIEW_REL, "sha256": REVIEW_SHA},
        "semantic_bundle": {"bytes": SEMANTIC_BYTES, "path": SEMANTIC_REL, "sha256": SEMANTIC_SHA},
    }
    if public.get("bindings") != expected_bindings:
        raise Invalid("public binding mismatch")
    if public["authority"] != {"canary_launch": False, "empirical_launch": False, "matrix_launch": False, "qualification": False, "release": False}:
        raise Invalid("public authority mismatch")
    if public["controller_protocol"] != "CODEX_NATIVE_GOAL_RESIDENT_ATOMIC_MAILBOX_V1" or public["public_scorer_separation"] != "PUBLIC_ROOT_CONTAINS_NO_EXPECTED_VALUE_FIELDS_OR_SCORER_PATH" or public["qualification_credit"] != 0 or public["status"] != "COMPILED_STATIC_PUBLIC_ATOM_DAGS_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY":
        raise Invalid("public fixed field mismatch")
    if public["route_roster"] != [
        {"model_requested": model, "reasoning_effort_requested": effort, "route": route}
        for route, _code, model, effort in ROUTES
    ]:
        raise Invalid("public route roster mismatch")
    if scorer.get("semantic_bundle") != {"bytes": SEMANTIC_BYTES, "sha256": SEMANTIC_SHA}:
        raise Invalid("scorer semantic binding mismatch")
    if scorer["cell_count"] != 97 or scorer["comparator"] != "EXACT_UTF8_AND_SHA256_AFTER_PUBLIC_RECIPE_ASSEMBLY" or scorer["qualification_credit"] != 0 or scorer["route_outcome_count"] != 291:
        raise Invalid("scorer fixed field mismatch")
    scorer_rows = scorer.get("cells")
    if not isinstance(scorer_rows, list) or len(scorer_rows) != 97:
        raise Invalid("scorer cell count mismatch")
    for cell, row in zip(semantic["cells"], scorer_rows):
        expected_row = {
            "cell": cell["cell"],
            "cell_index": cell["index"],
            "expected_output_bytes": cell["expected_output_bytes"],
            "expected_output_sha256": cell["expected_output_sha256"],
            "expected_output_utf8": cell["expected_output_utf8"],
        }
        if row != expected_row:
            raise Invalid(f"scorer row mismatch: {cell['index']}")
    expected_cell_files = {}
    atom_kinds = Counter()
    route_counts = Counter()
    family_counts = Counter()
    shape_counts = Counter()
    max_depth = 0
    max_message = 0
    max_payload = 0
    nonces = set()
    tasks = set()
    index_rows = []
    for route_tuple in ROUTES:
        route = route_tuple[0]
        for cell in semantic["cells"]:
            relative = f"cells/cell-{cell['index']:03d}/{route}.json"
            if relative not in public_files:
                raise Invalid(f"missing public cell file: {relative}")
            cell_data = public_files[relative]
            cell_file = parse_json(cell_data, relative, True)
            nodes, compiler_family = verify_cell_file(cell_file, cell, matrix_id, route_tuple)
            expected_cell_files[relative] = cell_data
            family_counts[compiler_family] += 1
            shape_counts[source_shape(cell["cell"])] += 1
            route_counts[route] += len(nodes)
            depths = {}
            for node in nodes:
                atom_kinds[node["kind"]] += 1
                depths[node["atom_id"]] = 1 + max((depths[item] for item in node["dependencies"]), default=0)
                if node["dynamic"]:
                    max_payload = max(max_payload, node["subject_template"]["max_payload_bytes"])
                    max_message = max(max_message, *node["wire_message_max_bytes"].values())
                else:
                    if node["atom_nonce"] in nonces or node["task_name"] in tasks:
                        raise Invalid("static identity collision")
                    nonces.add(node["atom_nonce"])
                    tasks.add(node["task_name"])
                    max_payload = max(max_payload, node["subject_payload"]["bytes"])
                    max_message = max(max_message, node["spawn_bootstrap"]["bytes"], node["control_bind"]["bytes"], node["subject_atom"]["bytes"])
            max_depth = max(max_depth, max(depths.values()))
            index_rows.append({
                "atom_count": len(nodes),
                "cell": cell["cell"],
                "cell_file": {"bytes": len(cell_data), "path": relative, "sha256": sha(cell_data)},
                "cell_index": cell["index"],
                "compiler_family": compiler_family,
                "model_requested": route_tuple[2],
                "reasoning_effort_requested": route_tuple[3],
                "route": route,
            })
    if set(public_files) != set(expected_cell_files) | {"manifest.json", "capacity.json", "inventory.json"}:
        raise Invalid("public file set mismatch")
    if public.get("cells") != index_rows:
        raise Invalid("public cell index mismatch")
    base_family_counts = {key: value // 3 for key, value in family_counts.items()}
    base_shape_counts = {key: value // 3 for key, value in shape_counts.items()}
    if public.get("compiler_families") != dict(sorted(base_family_counts.items())) or public.get("source_shape_combinations") != dict(sorted(base_shape_counts.items())):
        raise Invalid("manifest family/shape counts mismatch")
    total_atoms = sum(atom_kinds.values())
    expected_capacity = {
        "atom_kind_counts": dict(sorted(atom_kinds.items())),
        "controller_message_utf8_bytes_upper_bound": total_atoms * ENVELOPE_MAX * 3,
        "exact_atom_count": total_atoms,
        "collaboration_slot_count": 4,
        "controller_slot_count": 1,
        "matrix_id": matrix_id,
        "max_compiled_static_message_bytes": max_message,
        "max_dag_depth": max_depth,
        "max_subject_payload_bytes": max_payload,
        "max_concurrent_test_takers": 3,
        "model_call_count": total_atoms,
        "platform_total_token_ceiling": None,
        "platform_total_token_ceiling_nonclaim": "SYSTEM_TOOL_AND_HIDDEN_RUNTIME_TOKENS_ARE_NOT_EXPOSED_OR_ATTESTED",
        "qualification_credit": 0,
        "route_atom_counts": dict(sorted(route_counts.items())),
        "schema_id": CAPACITY_SCHEMA,
        "semantic_cell_count": 97,
        "semantic_cell_route_outcome_count": 291,
        "subject_atoms_per_goal": 1,
        "test_taker_goal_count": total_atoms,
        "test_taker_full_wait_upper_bound_seconds": math.ceil(total_atoms / 3) * WAIT_SECONDS,
        "test_taker_wave_count": math.ceil(total_atoms / 3),
        "total_full_wait_upper_bound_seconds_if_serial": total_atoms * WAIT_SECONDS,
        "unbounded_loop": False,
    }
    if capacity != expected_capacity:
        raise Invalid("capacity recomputation mismatch")
    if public.get("capacity") != {"bytes": len(public_files["capacity.json"]), "path": "capacity.json", "sha256": sha(public_files["capacity.json"])}:
        raise Invalid("capacity binding mismatch")
    return {
        "capacity": capacity,
        "matrix_id": matrix_id,
        "public_root": public_identity,
        "scorer_root": scorer_identity,
        "semantic": semantic,
        "public_files": public_files,
        "public": public,
        "scorer": scorer,
    }


def parse_wire(data, label):
    if b"\n" in data or b"\r" in data or b"\x00" in data:
        raise Invalid(f"wire framing mismatch: {label}")
    value = parse_json(data, label)
    if canonical_no_lf(value) != data:
        raise Invalid(f"wire not canonical: {label}")
    return value


def goal_payload(value, expected_status, objective=None, thread_id=None):
    exact_keys(value, ["completionBudgetReport", "goal", "remainingTokens"], "Goal tool result")
    goal = value["goal"]
    required = {"threadId", "objective", "status", "tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"}
    if not isinstance(goal, dict) or set(goal) != required:
        raise Invalid("Goal receipt field mismatch")
    if goal["status"] != expected_status or not isinstance(goal["threadId"], str) or not goal["threadId"]:
        raise Invalid("Goal receipt status/thread mismatch")
    if objective is not None and goal["objective"] != objective:
        raise Invalid("Goal receipt objective mismatch")
    if thread_id is not None and goal["threadId"] != thread_id:
        raise Invalid("Goal receipt thread mismatch")
    for key in ("tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"):
        if type(goal[key]) is not int or goal[key] < 0:
            raise Invalid("Goal receipt numeric mismatch")
    return goal["threadId"]


def exact_run_files(atom_dir, dynamic):
    expected = [
        "000_predeclaration.json",
        "001_spawn_bootstrap.txt",
        "002_active_goal_receipt.json",
        "003_control_bind.txt",
        "004_control_bound.json",
        "005_pre_subject_get_goal.json",
        "006_subject_atom.txt",
        "008_terminal_goal_receipt.json",
        "009_task_final.txt",
        "010_atom_accounting.json",
    ]
    if dynamic:
        expected.append("000_dynamic_node_admission.json")
    files, directories = tree_inventory(atom_dir)
    result_names = {"007_atom_result.txt", "007_abort_result.json"} & set(files)
    if len(result_names) != 1:
        raise Invalid("atom result/abort cardinality mismatch")
    expected.append(next(iter(result_names)))
    if set(files) != set(expected) or directories != {"."}:
        raise Invalid(f"atom file set mismatch: {atom_dir}")
    return files, next(iter(result_names))


def bind_blob(blob, expected):
    return isinstance(expected, dict) and expected == {"bytes": len(blob), "sha256": sha(blob)}


def verify_atom_evidence(atom_dir, node, cell_file, global_ids, dependency_results):
    files, result_name = exact_run_files(atom_dir, node["dynamic"])
    predecl = parse_json(files["000_predeclaration.json"], "atom predeclaration", True)
    exact_keys(predecl, ["atom_id", "atom_path", "attempt", "attempt_id", "cell_index", "matrix_id", "node_projection_sha256", "route", "schema_id"], "atom predeclaration")
    if predecl != {
        "atom_id": node["atom_id"],
        "atom_path": node["atom_path"],
        "attempt": 0,
        "attempt_id": node["attempt_id"],
        "cell_index": cell_file["cell_index"],
        "matrix_id": cell_file["matrix_id"],
        "node_projection_sha256": sha(canonical_no_lf(node)),
        "route": cell_file["route"],
        "schema_id": "pw-r9-codex-native-goal-atom-predeclaration-v1",
    }:
        raise Invalid("atom predeclaration mismatch")
    if node["dynamic"]:
        admission = parse_json(files["000_dynamic_node_admission.json"], "dynamic admission", True)
        exact_keys(admission, ["atom_nonce", "bootstrap", "control", "payload", "schema_id", "subject", "task_name"], "dynamic admission")
        for field in ("bootstrap", "control", "payload", "subject"):
            exact_keys(admission[field], ["bytes", "sha256", "utf8"], f"dynamic admission {field}")
        payload = admission["payload"].get("utf8", "").encode()
        if admission["schema_id"] != "pw-r9-codex-native-goal-dynamic-node-admission-v1" or not bind_blob(payload, {k: admission["payload"][k] for k in ("bytes", "sha256")}):
            raise Invalid("dynamic payload admission mismatch")
        if len(payload) > node["subject_template"]["max_payload_bytes"]:
            raise Invalid("dynamic payload limit mismatch")
        payload_value = parse_json(payload, "dynamic payload")
        template = node["subject_template"]["canonical_json_template"]
        if set(payload_value) != set(template):
            raise Invalid("dynamic payload shape mismatch")
        if any(dependency not in dependency_results for dependency in node["dependencies"]):
            raise Invalid("dynamic node dependency result missing")
        substitutions = {
            "${LEFT_RESULT}": dependency_results[node["dependencies"][0]].decode(),
            "${SUMMARY_RESULT}": dependency_results[node["dependencies"][0]].decode(),
        }
        if len(node["dependencies"]) > 1:
            substitutions["${RIGHT_RESULT}"] = dependency_results[node["dependencies"][1]].decode()

        def substitute(value):
            if isinstance(value, dict):
                return {key: substitute(child) for key, child in value.items()}
            if isinstance(value, list):
                return [substitute(child) for child in value]
            return substitutions.get(value, value)

        if payload != canonical_no_lf(substitute(template)):
            raise Invalid("dynamic payload dependency substitution mismatch")
        atom_nonce = nonce(cell_file["matrix_id"], cell_file["cell_index"], cell_file["route"], node["atom_path"], node["kind"], sha(payload))
        if admission["atom_nonce"] != atom_nonce or admission["task_name"] != "r9_cgra_" + atom_nonce:
            raise Invalid("dynamic identity mismatch")
        bootstrap = admission["bootstrap"]["utf8"].encode()
        control = admission["control"]["utf8"].encode()
        subject = admission["subject"]["utf8"].encode()
        expected_task_path = "/root/" + admission["task_name"]
        for blob, field in ((bootstrap, "bootstrap"), (control, "control"), (subject, "subject")):
            if not bind_blob(blob, {k: admission[field][k] for k in ("bytes", "sha256")}):
                raise Invalid("dynamic wire binding mismatch")
        expected_bootstrap = wire("bootstrap", attempt=node["attempt_id"], manifest_sha=cell_file["control_manifest_sha256"], nonce=atom_nonce, objective=node["goal_objective"]["utf8"], payload_sha=sha(payload), route_code=cell_file["route_code"])
        expected_control = wire("control", attempt=node["attempt_id"], criterion=node["acceptance_criterion"]["utf8"], manifest_sha=cell_file["control_manifest_sha256"], nonce=atom_nonce, output_contract=node["output_contract"]["utf8"], payload_sha=sha(payload), route_code=cell_file["route_code"])
        expected_subject = wire("subject", attempt=node["attempt_id"], atom_id=node["atom_id"], nonce=atom_nonce, payload=payload.decode(), payload_sha=sha(payload))
        if (bootstrap, control, subject) != (expected_bootstrap, expected_control, expected_subject):
            raise Invalid("dynamic admitted wire derivation mismatch")
    else:
        atom_nonce = node["atom_nonce"]
        bootstrap = node["spawn_bootstrap"]["utf8"].encode()
        control = node["control_bind"]["utf8"].encode()
        subject = node["subject_atom"]["utf8"].encode()
        expected_task_path = "/root/" + node["task_name"]
    if files["001_spawn_bootstrap.txt"] != bootstrap or files["003_control_bind.txt"] != control or files["006_subject_atom.txt"] != subject:
        raise Invalid("observed controller message mismatch")
    active = parse_json(files["002_active_goal_receipt.json"], "active receipt", True)
    exact_keys(active, ["a", "g", "goal", "k", "n", "oh", "task", "v"], "active envelope")
    if active["a"] != node["attempt_id"] or active["k"] != "ga" or active["n"] != atom_nonce or active["oh"] != node["goal_objective"]["sha256"] or active["v"] != 1:
        raise Invalid("active envelope mismatch")
    thread_id = goal_payload(active["goal"], "active", node["goal_objective"]["utf8"])
    if active["g"] != thread_id or active["task"] != expected_task_path:
        raise Invalid("active identity mismatch")
    control_bound = parse_json(files["004_control_bound.json"], "control bound", True)
    exact_keys(control_bound, ["a", "ch", "g", "k", "mh", "n", "qh", "r", "sh", "v"], "control bound")
    control_value = parse_wire(control, "control bind")
    expected_bound = {"a": node["attempt_id"], "ch": control_value["ch"], "g": thread_id, "k": "bound", "mh": control_value["mh"], "n": atom_nonce, "qh": control_value["qh"], "r": cell_file["route_code"], "sh": control_value["sh"], "v": 1}
    if control_bound != expected_bound:
        raise Invalid("control-bound mismatch")
    pre_subject = parse_json(files["005_pre_subject_get_goal.json"], "pre-subject get_goal", True)
    goal_payload(pre_subject, "active", node["goal_objective"]["utf8"], thread_id)
    subject_value = parse_wire(subject, "subject atom")
    if subject_value["a"] != node["attempt_id"] or subject_value["n"] != atom_nonce or subject_value["i"] != node["atom_id"]:
        raise Invalid("subject envelope mismatch")
    passed = result_name == "007_atom_result.txt"
    if passed:
        result = parse_wire(files[result_name], "atom result")
        exact_keys(result, ["a", "g", "k", "n", "r", "rh", "v"], "atom result")
        raw_result = result["r"].encode()
        if result != {"a": node["attempt_id"], "g": thread_id, "k": "result", "n": atom_nonce, "r": result["r"], "rh": sha(raw_result), "v": 1}:
            raise Invalid("atom result mismatch")
        if len(raw_result) > node["result_max_bytes"]:
            raise Invalid("atom result byte limit mismatch")
        if node["kind"] in {"EVIDENCE_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"} and SAFE_SIGNAL_RE.fullmatch(result["r"]) is None:
            raise Invalid("intermediate result alphabet mismatch")
    else:
        result = parse_json(files[result_name], "abort result", True)
        exact_keys(result, ["a", "code", "g", "k", "n", "v"], "abort result")
        if result["a"] != node["attempt_id"] or result["g"] != thread_id or result["k"] != "ar" or result["n"] != atom_nonce or result["v"] != 1:
            raise Invalid("abort result mismatch")
        raw_result = None
    terminal = parse_json(files["008_terminal_goal_receipt.json"], "terminal receipt", True)
    exact_keys(terminal, ["a", "g", "goal", "k", "n", "status", "v"], "terminal envelope")
    if terminal["a"] != node["attempt_id"] or terminal["g"] != thread_id or terminal["k"] != "gt" or terminal["n"] != atom_nonce or terminal["status"] != "complete" or terminal["v"] != 1:
        raise Invalid("terminal envelope mismatch")
    goal_payload(terminal["goal"], "complete", node["goal_objective"]["utf8"], thread_id)
    task_final = parse_wire(files["009_task_final.txt"], "task final")
    if task_final != {"a": node["attempt_id"], "g": thread_id, "k": "task_final", "n": atom_nonce, "status": "SETTLED", "v": 1}:
        raise Invalid("task final mismatch")
    accounting = parse_json(files["010_atom_accounting.json"], "atom accounting", True)
    exact_keys(accounting, ["attempt", "files_before_accounting", "goal_thread_id", "mailbox_message_count", "qualification_credit", "retry_count", "route_requested", "schema_id", "task_path", "terminal_goal_status", "test_outcome"], "atom accounting")
    prior_files = sorted(name for name in files if name != "010_atom_accounting.json")
    prior_inventory = [{"bytes": len(files[name]), "path": name, "sha256": sha(files[name])} for name in prior_files]
    if accounting["files_before_accounting"] != prior_inventory or accounting["attempt"] != 0 or accounting["goal_thread_id"] != thread_id or accounting["qualification_credit"] != 0 or accounting["retry_count"] != 0 or accounting["route_requested"] != cell_file["route"] or accounting["task_path"] != active["task"] or accounting["terminal_goal_status"] != "complete" or accounting["schema_id"] != "pw-r9-codex-native-goal-atom-accounting-v1":
        raise Invalid("atom accounting mismatch")
    if accounting["test_outcome"] != ("PASS" if passed else "TYPED_FAIL"):
        raise Invalid("atom outcome mismatch")
    expected_mailbox = 6
    if accounting["mailbox_message_count"] != expected_mailbox:
        raise Invalid("mailbox message count mismatch")
    for label, value in (("nonce", atom_nonce), ("task", active["task"]), ("goal", thread_id), ("attempt", node["attempt_id"])):
        if value in global_ids[label]:
            raise Invalid(f"global {label} reuse")
        global_ids[label].add(value)
    return passed, raw_result, atom_nonce, thread_id, active["task"], set(files)


def assemble_cell(recipe, node_results):
    kind = recipe["kind"]
    if kind == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON":
        raw = node_results[recipe["dynamic_node"]]
        value = parse_json(raw, "model final output")
        if list(value) != [recipe["output_key"]] or value[recipe["output_key"]] not in recipe["allowed_values"]:
            raise Invalid("model final output shape/value mismatch")
        return raw
    if kind == "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS":
        fixed = recipe["fixed"]
        verdicts = []
        for item in recipe["ordered_edge_items"]:
            code = node_results[item["verdict_from_compact_node"]].decode()
            if code not in {"S", "U"}:
                raise Invalid("S50 compact verdict mismatch")
            verdicts.append({"edge_id": item["edge_id"], "source_decision_ids": item["source_decision_ids"], "verdict": "supported" if code == "S" else "unsupported"})
        value = {
            "protocol_id": fixed["protocol_id"],
            "stage": fixed["stage"],
            "topic_artifact_hashes": fixed["topic_artifact_hashes"],
            "checked_edge_ids": fixed["checked_edge_ids"],
            "edge_verdicts": verdicts,
            "claim_boundary": fixed["claim_boundary"],
            "external_audit_status": fixed["external_audit_status"],
            "forbidden_action_violations": fixed["forbidden_action_violations"],
        }
        return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode()
    if kind == "DETERMINISTIC_S60_ASSEMBLY_FROM_COMPACT_SPECIALIST_CODE":
        fixed = recipe["fixed"]
        code = node_results[recipe["compact_node"]].decode()
        expected_class = {"provenance_gap": "P", "authority_conflation": "C", "counterfactual_failure": "K"}[fixed["classification"]]
        if code not in {f"S:{expected_class}", f"U:{expected_class}"}:
            raise Invalid("S60 compact code mismatch")
        value = {
            "protocol_id": fixed["protocol_id"],
            "stage": fixed["stage"],
            "role": fixed["role"],
            "candidate_edge_id": fixed["candidate_edge_id"],
            "candidate_lineage_sha256": fixed["candidate_lineage_sha256"],
            "integration_candidate_sha256": fixed["integration_candidate_sha256"],
            "verdict": "supported" if code.startswith("S:") else "unsupported",
            "classification": fixed["classification"],
            "source_record_ids": fixed["source_record_ids"],
            "claim_boundary": fixed["claim_boundary"],
            "external_audit_status": fixed["external_audit_status"],
            "forbidden_action_violations": fixed["forbidden_action_violations"],
        }
        return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode()
    raise Invalid("unknown assembly kind")


def verify_matrix_evidence(manifest_result, evidence_root, global_ids):
    matrix_id = manifest_result["matrix_id"]
    if evidence_root.name != matrix_id:
        raise Invalid("evidence root name/matrix mismatch")
    files, directories = tree_inventory(evidence_root)
    matrix_names = {
        "matrix_predeclaration.json",
        "capacity_report.json",
        "atom_inventory_before.json",
        "cell_assembly_results.json",
        "global_freshness.json",
        "matrix_terminal.json",
        "matrix_accounting.json",
    }
    if not matrix_names <= set(files):
        raise Invalid("matrix terminal file set incomplete")
    predecl = parse_json(files["matrix_predeclaration.json"], "matrix predeclaration", True)
    exact_keys(predecl, ["compiler_sha256", "controller_contract_sha256", "manifest_public_projection_sha256", "matrix_id", "pair_id", "pair_position", "predecessor_matrix_accounting_sha256", "schema_id", "verifier_bytes", "verifier_sha256"], "matrix predeclaration")
    verifier_identity = self_identity()
    if predecl["matrix_id"] != matrix_id or predecl["compiler_sha256"] != COMPILER_SHA or predecl["controller_contract_sha256"] != CONTRACT_SHA or predecl["manifest_public_projection_sha256"] != manifest_result["public_root"]["projection_sha256"] or predecl["schema_id"] != "pw-r9-codex-native-goal-matrix-predeclaration-v1" or predecl["verifier_sha256"] != verifier_identity["sha256"] or predecl["verifier_bytes"] != verifier_identity["bytes"] or not isinstance(predecl["pair_id"], str) or not predecl["pair_id"]:
        raise Invalid("matrix predeclaration mismatch")
    if predecl["pair_position"] not in {1, 2}:
        raise Invalid("matrix pair position mismatch")
    if predecl["pair_position"] == 1 and predecl["predecessor_matrix_accounting_sha256"] is not None:
        raise Invalid("first matrix predecessor must be null")
    capacity = parse_json(files["capacity_report.json"], "evidence capacity", True)
    if capacity != manifest_result["capacity"]:
        raise Invalid("evidence capacity mismatch")
    atom_inventory_before = parse_json(files["atom_inventory_before.json"], "atom inventory before", True)
    if atom_inventory_before != {"existing_atom_directory_count": 0, "expected_atom_count": manifest_result["capacity"]["exact_atom_count"], "schema_id": "pw-r9-codex-native-goal-atom-inventory-before-v1"}:
        raise Invalid("atom inventory before mismatch")
    atoms_root = evidence_root / "atoms"
    expected_atom_dirs = set()
    expected_all_files = set(matrix_names)
    node_results_by_cell = {}
    all_pass = True
    for index_row in manifest_result["public"]["cells"]:
        row = manifest_result["public_files"][index_row["cell_file"]["path"]]
        cell_file = parse_json(row, "public cell", True)
        cell_key = (cell_file["cell_index"], cell_file["route"])
        node_results = {}
        for node in cell_file["nodes"]:
            relative = Path(cell_file["route"]) / f"cell-{cell_file['cell_index']:03d}" / node["atom_id"]
            expected_atom_dirs.add((Path("atoms") / relative).as_posix())
            passed, raw_result, _nonce, _goal, _task, atom_files = verify_atom_evidence(
                atoms_root / relative, node, cell_file, global_ids, node_results
            )
            expected_all_files.update((Path("atoms") / relative / name).as_posix() for name in atom_files)
            all_pass = all_pass and passed
            if passed:
                node_results[node["atom_id"]] = raw_result
        node_results_by_cell[cell_key] = (cell_file, node_results)
    observed_atom_dirs = set()
    for directory in directories:
        parts = Path(directory).parts
        if len(parts) == 4 and parts[0] == "atoms":
            observed_atom_dirs.add(directory)
    if observed_atom_dirs != expected_atom_dirs:
        raise Invalid("atom directory set mismatch")
    if set(files) != expected_all_files:
        raise Invalid("matrix evidence file set mismatch")
    expected_directories = {"."}
    for relative in expected_all_files:
        parent = Path(relative).parent
        while parent != Path("."):
            expected_directories.add(parent.as_posix())
            parent = parent.parent
    if directories != expected_directories:
        raise Invalid("matrix evidence directory set mismatch")
    scorer_by_cell = {row["cell_index"]: row for row in manifest_result["scorer"]["cells"]}
    assembly_rows = []
    for (cell_index, route), (cell_file, node_results) in sorted(node_results_by_cell.items()):
        if len(node_results) != len(cell_file["nodes"]):
            assembled = None
            matched = False
        else:
            assembled = assemble_cell(cell_file["assembly_recipe"], node_results)
            scorer = scorer_by_cell[cell_index]
            matched = len(assembled) == scorer["expected_output_bytes"] and sha(assembled) == scorer["expected_output_sha256"] and assembled.decode() == scorer["expected_output_utf8"]
        assembly_rows.append({"assembled_bytes": None if assembled is None else len(assembled), "assembled_sha256": None if assembled is None else sha(assembled), "cell_index": cell_index, "matched": matched, "route": route})
        all_pass = all_pass and matched
    if parse_json(files["cell_assembly_results.json"], "cell assembly results", True) != assembly_rows:
        raise Invalid("cell assembly results mismatch")
    freshness = parse_json(files["global_freshness.json"], "global freshness", True)
    expected_freshness = {"attempt_count": len(global_ids["attempt"]), "atom_nonce_count": len(global_ids["nonce"]), "goal_thread_id_count": len(global_ids["goal"]), "schema_id": "pw-r9-codex-native-goal-global-freshness-v1", "task_path_count": len(global_ids["task"]), "unique": True}
    if freshness != expected_freshness:
        raise Invalid("global freshness mismatch")
    terminal = parse_json(files["matrix_terminal.json"], "matrix terminal", True)
    exact_keys(terminal, ["all_atoms_pass", "all_cells_match", "matrix_id", "qualification_credit", "schema_id", "status"], "matrix terminal")
    expected_status = "CLEAN" if all_pass else "FAILED"
    if terminal != {"all_atoms_pass": all_pass, "all_cells_match": all(item["matched"] for item in assembly_rows), "matrix_id": matrix_id, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-matrix-terminal-v1", "status": expected_status}:
        raise Invalid("matrix terminal mismatch")
    accounting = parse_json(files["matrix_accounting.json"], "matrix accounting", True)
    exact_keys(accounting, ["files_before_accounting", "matrix_id", "qualification_credit", "retry_count", "schema_id", "status"], "matrix accounting")
    prior = sorted(name for name in files if name != "matrix_accounting.json")
    inventory = [{"bytes": len(files[name]), "path": name, "sha256": sha(files[name])} for name in prior]
    if accounting != {"files_before_accounting": inventory, "matrix_id": matrix_id, "qualification_credit": 0, "retry_count": 0, "schema_id": "pw-r9-codex-native-goal-matrix-accounting-v1", "status": expected_status}:
        raise Invalid("matrix accounting mismatch")
    return {
        "accounting_sha256": sha(files["matrix_accounting.json"]),
        "clean": all_pass,
        "matrix_id": matrix_id,
        "pair_id": predecl["pair_id"],
        "pair_position": predecl["pair_position"],
        "predecessor_matrix_accounting_sha256": predecl["predecessor_matrix_accounting_sha256"],
    }


def do_check(base):
    semantic, contract = load_components(base)
    markers = Counter()
    shapes = Counter()
    for cell in semantic["cells"]:
        marker, _context, _raw = parse_context(cell)
        markers[family(marker)] += 1
        shapes[source_shape(cell["cell"])] += 1
    if len(shapes) != 9 or sum(markers.values()) != 97:
        raise Invalid("semantic family/shape total mismatch")
    return {
        "authority": {"empirical_launch": False, "qualification": False},
        "check": "PASS",
        "component_bindings": {
            "compiler": {"bytes": COMPILER_BYTES, "sha256": COMPILER_SHA},
            "controller_contract": {"bytes": CONTRACT_BYTES, "sha256": CONTRACT_SHA},
            "semantic_bundle": {"bytes": SEMANTIC_BYTES, "sha256": SEMANTIC_SHA},
        },
        "controller_protocol": contract["protocol"]["id"],
        "first_mismatch": None,
        "schema_id": SCHEMA,
        "semantic_cell_count": 97,
        "source_shape_count": 9,
        "workspace_writes": 0,
    }


def do_verify_manifest(base, public_root, scorer_root):
    result = verify_manifest(base, public_root, scorer_root)
    return {
        "authority": {"empirical_launch": False, "qualification": False},
        "capacity": result["capacity"],
        "first_mismatch": None,
        "matrix_id": result["matrix_id"],
        "public_root": result["public_root"],
        "schema_id": SCHEMA,
        "scorer_root": result["scorer_root"],
        "status": "PASS_STATIC_MANIFEST_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY",
        "workspace_writes": 0,
    }


def add_unique(global_ids, label, value):
    if value in global_ids[label]:
        raise Invalid(f"historical/current {label} reuse")
    global_ids[label].add(value)


def index_historical_evidence(history_parent, excluded_roots, global_ids):
    if not history_parent.is_absolute():
        raise Invalid("history parent must be absolute")
    parent_st = os.lstat(history_parent)
    if stat.S_ISLNK(parent_st.st_mode) or not stat.S_ISDIR(parent_st.st_mode):
        raise Invalid("history parent custody mismatch")
    excluded = {root.resolve(strict=True) for root in excluded_roots}
    indexed_runs = 0
    for entry in sorted(os.scandir(history_parent), key=lambda item: item.name):
        if entry.is_symlink() or not entry.is_dir(follow_symlinks=False):
            if entry.name.startswith("codex-native-goal"):
                raise Invalid(f"malformed historical member: {entry.name}")
            continue
        run_root = Path(entry.path).resolve(strict=True)
        if run_root in excluded:
            continue
        marker = run_root / "matrix_predeclaration.json"
        if not os.path.lexists(marker):
            continue
        read_regular(marker, 0o644)
        atoms_root = run_root / "atoms"
        if not atoms_root.is_dir() or atoms_root.is_symlink():
            raise Invalid(f"historical atoms root invalid: {run_root}")
        indexed_runs += 1
        for predecl_path in sorted(atoms_root.glob("*/cell-*/*/000_predeclaration.json")):
            predecl = parse_json(read_regular(predecl_path, 0o644)[0], "historical atom predeclaration", True)
            attempt = predecl.get("attempt_id")
            if not isinstance(attempt, str) or not attempt:
                raise Invalid("historical attempt identity missing")
            add_unique(global_ids, "attempt", attempt)
            atom_dir = predecl_path.parent
            active_path = atom_dir / "002_active_goal_receipt.json"
            dynamic_path = atom_dir / "000_dynamic_node_admission.json"
            bootstrap_path = atom_dir / "001_spawn_bootstrap.txt"
            if os.path.lexists(dynamic_path):
                admission = parse_json(read_regular(dynamic_path, 0o644)[0], "historical dynamic admission", True)
                atom_nonce = admission.get("atom_nonce")
                task = admission.get("task_name")
            elif os.path.lexists(bootstrap_path):
                bootstrap = parse_wire(read_regular(bootstrap_path, 0o644)[0], "historical bootstrap")
                atom_nonce = bootstrap.get("n")
                task = "r9_cgra_" + atom_nonce if isinstance(atom_nonce, str) else None
            else:
                raise Invalid("historical atom lacks admitted identity")
            if not isinstance(atom_nonce, str) or SHA_RE.fullmatch(atom_nonce) is None or not isinstance(task, str):
                raise Invalid("historical nonce/task identity invalid")
            canonical_task = "/root/" + task
            add_unique(global_ids, "nonce", atom_nonce)
            add_unique(global_ids, "task", canonical_task)
            if os.path.lexists(active_path):
                active = parse_json(read_regular(active_path, 0o644)[0], "historical active receipt", True)
                goal = active.get("g")
                active_task = active.get("task")
                if not isinstance(goal, str) or not goal or active_task != canonical_task:
                    raise Invalid("historical active identity invalid")
                add_unique(global_ids, "goal", goal)
    return indexed_runs


def do_verify_matrices(base, public_roots, scorer_roots, evidence_roots, history_parent):
    if not (len(public_roots) == len(scorer_roots) == len(evidence_roots)) or len(evidence_roots) not in {1, 2}:
        raise Invalid("verify-matrices requires one or two aligned public/scorer/evidence roots")
    history_resolved = history_parent.resolve(strict=True)
    resolved_evidence = [root.resolve(strict=True) for root in evidence_roots]
    if len(set(resolved_evidence)) != len(resolved_evidence) or any(root.parent != history_resolved for root in resolved_evidence):
        raise Invalid("evidence roots must be unique immediate children of history parent")
    manifests = [
        verify_manifest(base, public_root, scorer_root)
        for public_root, scorer_root in zip(public_roots, scorer_roots)
    ]
    if len({item["matrix_id"] for item in manifests}) != len(manifests):
        raise Invalid("matrix manifest id reuse")
    if len(manifests) == 2:
        left = dict(manifests[0]["capacity"])
        right = dict(manifests[1]["capacity"])
        left.pop("matrix_id")
        right.pop("matrix_id")
        if left != right:
            raise Invalid("pair capacity/component projection mismatch")
    global_ids = {key: set() for key in ("nonce", "task", "goal", "attempt")}
    historical_run_count = index_historical_evidence(history_parent, evidence_roots, global_ids)
    results = [
        verify_matrix_evidence(manifest, root, global_ids)
        for manifest, root in zip(manifests, evidence_roots)
    ]
    streak = 0
    previous = None
    for result in results:
        if result["pair_position"] != streak + 1:
            raise Invalid("matrix pair position/order mismatch")
        if previous is None:
            if result["predecessor_matrix_accounting_sha256"] is not None:
                raise Invalid("first matrix predecessor mismatch")
        elif result["predecessor_matrix_accounting_sha256"] != previous["accounting_sha256"]:
            raise Invalid("matrix accounting chain mismatch")
        if not result["clean"]:
            streak = 0
            break
        streak += 1
        previous = result
    if len({result["pair_id"] for result in results}) != 1:
        raise Invalid("matrix pair id mismatch")
    qualification = streak == 2
    return {
        "clean_full_matrix_streak": streak,
        "first_mismatch": None,
        "historical_run_count": historical_run_count,
        "matrices": results,
        "qualification": qualification,
        "qualification_score": f"{streak}/2",
        "schema_id": SCHEMA,
        "status": "PASS_TWO_CONSECUTIVE_CLEAN_FULL_MATRICES" if qualification else "ZERO_QUALIFICATION_CREDIT_INCOMPLETE_STREAK",
        "workspace_writes": 0,
    }


def make_parser():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check")
    check.add_argument("--base", type=Path, required=True)
    manifest = sub.add_parser("verify-manifest")
    manifest.add_argument("--base", type=Path, required=True)
    manifest.add_argument("--public-root", type=Path, required=True)
    manifest.add_argument("--scorer-root", type=Path, required=True)
    matrices = sub.add_parser("verify-matrices")
    matrices.add_argument("--base", type=Path, required=True)
    matrices.add_argument("--public-root", type=Path, action="append", required=True)
    matrices.add_argument("--scorer-root", type=Path, action="append", required=True)
    matrices.add_argument("--evidence-root", type=Path, action="append", required=True)
    matrices.add_argument("--history-parent", type=Path, required=True)
    return parser


def main():
    args = make_parser().parse_args()
    try:
        base = args.base.resolve(strict=True)
        if args.command == "check":
            result = do_check(base)
        elif args.command == "verify-manifest":
            result = do_verify_manifest(base, args.public_root, args.scorer_root)
        else:
            result = do_verify_matrices(base, args.public_root, args.scorer_root, args.evidence_root, args.history_parent)
        sys.stdout.buffer.write(canonical(result))
        return 0
    except Exception as exc:
        sys.stdout.buffer.write(
            canonical(
                {
                    "check": "FAIL",
                    "error": str(exc),
                    "error_type": type(exc).__name__,
                    "qualification": False,
                    "qualification_score": "0/2",
                    "schema_id": SCHEMA,
                    "status": "FAIL_CLOSED_ZERO_CREDIT",
                    "workspace_writes": 0,
                }
            )
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
