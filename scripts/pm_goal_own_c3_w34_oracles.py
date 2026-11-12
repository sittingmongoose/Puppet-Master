#!/usr/bin/env python3
"""C3-W34 original-root preflight. Exits 2 while whole-root closure is blocked.

This is a diagnostic, not a complete Start/D06 oracle corpus. Its generated
values are schema specimens, never issued native originals. It does not edit
an original bank, install a resource alias, or implement an identity codec.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
from pathlib import Path

import msgpack
from referencing import Resource
from referencing.jsonschema import DRAFT202012

from pm_goal_own_c_roots import OriginalBank

ROOT = Path(__file__).resolve().parents[1]
INPUTS = ROOT / "Plans/workflow_standard_source_contracts/inputs/Plans"
LOCATIONS = {
    "Plans/plans_to_code_handoff.schema.json@6a3465b358483aef9d020fcf64e7c16276b8aa11b3c73a8a36aae9455dbf02c2": str(INPUTS / "plans_to_code_handoff.schema.json"),
    "Plans/requested_effective_runtime.schema.json@bcd467b368c2bbdc751d3e841e3a070bfbf40e03669ba6bc82f2bacfc2eeeaa6": str(INPUTS / "requested_effective_runtime.schema.json"),
    "Plans/execution_unit_context.schema.json@95f1b6cfe5d5df747c972f8544acfeb131fca5d404b38844c3c32adaea498b25": str(INPUTS / "execution_unit_context.schema.json"),
    "Plans/source_control_contracts.schema.json@39dda3e18a9cd96e7d561919a7a110c950db2826564c7e5fc76cf25565cb8a5a": str(INPUTS / "source_control_contracts.schema.json"),
    "Plans/source_control_contracts.schema.json@4070038bcaef4539d6d669f2a57618599487e73b2588d79e122fde2b41ed8518": "Plans/workflow_standard_source_contracts/current/Plans/source_control_contracts.schema.json",
    "Plans/full_thread_runtime_contracts.schema.json@5fa07b1ee8a19c769883b6e8876bf0c5e6326b97f5992fec3b661d7ec2a541ea": str(INPUTS / "full_thread_runtime_contracts.schema.json"),
    "Plans/shared_runtime_command_contracts.schema.json@7c460c1e01956e15fce5977779b4920f100b30443ddd950f24fda22dc1b38d7b": str(INPUTS / "shared_runtime_command_contracts.schema.json"),
    "Plans/shared_runtime_contracts.schema.json@680d47fb8e6226aaa26046bcaa971d4a312da6c81949b4a7bb75208b90e97a59": "Plans/workflow_standard_source_contracts/predecessor/v2/predecessor/v1/inputs/Plans/shared_runtime_contracts.schema.json",
}
MAP = {"$defs", "definitions", "properties", "patternProperties", "dependentSchemas"}
ARRAY = {"allOf", "anyOf", "oneOf", "prefixItems"}
SINGLE = {"items", "contains", "if", "then", "else", "not", "additionalProperties", "unevaluatedProperties", "propertyNames", "unevaluatedItems", "additionalItems", "contentSchema"}


def children(node):
    for key, value in node.items():
        if key in MAP:
            for name, child in value.items():
                yield key + "/" + name, child
        elif key in ARRAY:
            for index, child in enumerate(value):
                yield key + "/" + str(index), child
        elif key in SINGLE and isinstance(value, (dict, bool)):
            yield key, value


class DiagnosticBank(OriginalBank):
    """Collect every failure; a collection with any failure is never qualified."""

    def __init__(self, declaration):
        self.failures = []
        self.reference_sites = 0
        super().__init__(declaration, LOCATIONS)

    def _refs(self, node, resolver, path=""):
        if not isinstance(node, dict):
            return
        if "$id" in node:
            resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
        if "$ref" in node:
            self.reference_sites += 1
            try:
                resolver.lookup(node["$ref"])
            except Exception as error:
                self.failures.append({"base_uri": resolver._base_uri, "pointer": path, "ref": node["$ref"], "error_kind": type(error).__name__})
        for key, value in children(node):
            self._refs(value, resolver, path + "/" + key)


def layers(node, resolver):
    """Only a schema-specimen builder; no source issuance or semantic inference."""
    if node is False:
        raise ValueError("cannot seed false schema")
    if node is True:
        return []
    if "$id" in node:
        resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
    result = [(node, resolver)]
    if "$ref" in node:
        target = resolver.lookup(node["$ref"])
        result += layers(target.contents, target.resolver)
    for member in node.get("allOf", []):
        result += layers(member, resolver)
    for keyword in ("anyOf", "oneOf"):
        if keyword in node:
            variants = node[keyword]
            chosen = next((item for item in variants if item.get("type") == "null"), variants[0])
            result += layers(chosen, resolver)
    return result


def specimen(parts):
    expanded = [layer for node, resolver in parts for layer in layers(node, resolver)]
    constants = [node["const"] for node, _ in expanded if "const" in node]
    if constants:
        return copy.deepcopy(constants[-1])
    enums = [node["enum"] for node, _ in expanded if "enum" in node]
    if enums:
        return copy.deepcopy(enums[-1][0])
    types = [node["type"] for node, _ in expanded if "type" in node]
    kind = types[-1] if types else None
    if isinstance(kind, list):
        kind = "null" if "null" in kind else kind[0]
    if kind == "object" or any("properties" in node for node, _ in expanded):
        required = list(dict.fromkeys(key for node, _ in expanded for key in node.get("required", [])))
        return {key: specimen([(node["properties"][key], resolver) for node, resolver in expanded if key in node.get("properties", {})]) for key in required}
    if kind == "null":
        return None
    if kind in ("integer", "number"):
        return max([0] + [node["minimum"] for node, _ in expanded if "minimum" in node])
    if kind == "boolean":
        return False
    if kind == "array":
        length = max([0] + [node["minItems"] for node, _ in expanded if "minItems" in node])
        items = [(node["items"], resolver) for node, resolver in expanded if "items" in node]
        return [specimen(items) for _ in range(length)]
    if kind == "string":
        formats = [node["format"] for node, _ in expanded if "format" in node]
        if "date-time" in formats:
            return "2026-11-05T09:00:00Z"
        if "uuid" in formats:
            return "12345678-1234-1234-1234-123456789abc"
        minimum = max([1] + [node["minLength"] for node, _ in expanded if "minLength" in node])
        patterns = [node["pattern"] for node, _ in expanded if "pattern" in node]
        candidates = ["x" * minimum, "a" * 64, "goal_run.started", "2026-11-05T09:00:00Z"]
        for pattern in patterns:
            match = re.match(r"\^([a-zA-Z0-9_]+)", pattern)
            if match:
                candidates.append(match[1] + "a" * 64)
        for value in candidates:
            if len(value) >= minimum and all(re.fullmatch(pattern, value) for pattern in patterns):
                return value
        raise ValueError("no schema seed for " + repr(patterns))
    raise ValueError("unsupported schema seed " + repr([node for node, _ in expanded]))


def projection_probe(bank, uri, wrapper_root, record_root, event_type):
    resolved = bank.registry.resolver().lookup(uri + "#/$defs/" + wrapper_root)
    wrapper = specimen([(resolved.contents, resolved.resolver)])
    # Select the exact cancelled branch rather than the combined schema's first
    # (started) alternative. The original complete wrapper is still validated.
    record = bank.registry.resolver().lookup(uri + "#/$defs/" + record_root)
    wrapper["record"] = specimen([(record.contents, record.resolver)])
    event = wrapper["record"]["original_event"]
    event["event_type"] = event_type
    event["scope_kind"] = "project"
    event["project_id"] = "x"
    event["payload_ref"] = None
    reference = uri + "#/$defs/" + wrapper_root
    errors = bank.errors(reference, wrapper)
    if errors:
        raise AssertionError("invalid schema baseline: " + str(errors[0]))
    # Opaque ref strings have no maximum in these schemas. This only establishes
    # the representation hole; it makes no native admission/custody assertion.
    for count in range(1, 16384):
        event["actor_ref"] = "x" * count
        event_size = len(msgpack.packb(event, use_bin_type=True))
        row_size = len(msgpack.packb(wrapper, use_bin_type=True))
        if event_size <= 16384 < row_size:
            break
    else:
        raise AssertionError("no boundary specimen")
    if bank.errors(reference, wrapper):
        raise AssertionError("oversize specimen no longer validates")
    without_event = copy.deepcopy(wrapper)
    del without_event["record"]["original_event"]
    missing_errors = bank.errors(reference, without_event)
    if not missing_errors:
        raise AssertionError("original Event unexpectedly optional")
    # Test the original event-property schema directly. No speculative reference
    # field names, new payload reference encoding or schema successor is invented.
    original_event_schema = record.contents["properties"]["original_event"]
    target = record.resolver.lookup(original_event_schema["$ref"])
    leaf_errors = list(__import__("pm_goal_own_c_oracles").Validator(target.contents, registry=bank.registry, _resolver=target.resolver).iter_errors("content-addressed-reference"))
    if not leaf_errors:
        raise AssertionError("scalar reference unexpectedly satisfies whole Event")
    return {
        "event_type": event_type,
        "wrapper_root": reference,
        "record_root": uri + "#/$defs/" + record_root,
        "schema_valid_small_row": True,
        "schema_valid_boundary_row": True,
        "event_msgpack_bytes": event_size,
        "row_msgpack_bytes": row_size,
        "size_method": "MessagePack size only; map ordering does not change encoded length; no identity/digest serializer",
        "missing_original_event_rejected": True,
        "scalar_event_reference_rejected": True,
        "missing_errors": sorted(set(error.validator for error in missing_errors)),
        "scalar_errors": sorted(set(error.validator for error in leaf_errors)),
        "qualification": "SCHEMA_SPECIMENS_ONLY_NO_NATIVE_AUTHORITY",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    declarations = {
        "started": "Plans/goal_run_started_consumer_schema_resources.json",
        "cancelled": "Plans/goal_run_cancelled_consumer_schema_resources.json",
    }
    banks = {}
    audits = []
    for family, path in declarations.items():
        declaration = json.loads((ROOT / path).read_text())
        for realm, spec in declaration["realms"].items():
            bank = DiagnosticBank(spec)
            banks[family, realm] = bank
            audits.append({"bank": path, "realm": realm, "whole_documents": len(bank.documents), "reference_sites": bank.reference_sites, "unresolved": bank.failures})
    probes = [
        projection_probe(banks["started", "current_workflow_native_activation"], "https://puppetmaster.local/proposals/goal_run_started_consumer.v1.schema.json", "StorageProjection", "Projection", "goal_run.started"),
        projection_probe(banks["cancelled", "native_consumer"], "https://puppetmaster.local/proposals/goal_run_started_cancelled_consumer.v1.schema.json", "CombinedStorageProjection", "CancelledProjection", "goal_run.cancelled"),
    ]
    result = {
        "status": "BLOCKED_ORIGINAL_PROJECTION_REFERENCE_ROOT_MISSING",
        "whole_root_closure": {"goal_run.started": "BLOCKED", "goal_run.cancelled": "BLOCKED"},
        "owner_requirement": "Plans/storage-plan.md SP-311 requires an SP-337 reference alternative for oversized Projection and CancelledProjection",
        "blocker": "Both frozen original projection schemas require full original_event and have no payload-reference alternative; an authored test contract cannot make a reference satisfy these exact original roots without changing their schema edition/bank.",
        "full_path_oracles": {"positive": 0, "negative": 0},
        "diagnostic_schema_checks": {"valid_specimens": 4, "required_refusals": 4},
        "native_execution": "NOT_RUN",
        "bank_audits": audits,
        "projection_probes": probes,
        "original_input_sha256": {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in declarations.values()},
        "new_product_guards": [],
        "guard_isolation": "No product guards added; no local proof engine",
    }
    output = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output)
    print(json.dumps({key: result[key] for key in ("status", "whole_root_closure", "full_path_oracles", "diagnostic_schema_checks")}))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
