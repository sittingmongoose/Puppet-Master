#!/usr/bin/env python3
"""Closed structural, byte, hash, and rendering contract for R10 capsules."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path
from typing import Any

import jsonschema

ROOT = Path(__file__).resolve().parent
CAPSULE_SCHEMA = ROOT / "prompt_capsule.schema.json"
PROFILE = "r10-simple-4k-v1"
MAX_PROMPT_BYTES = 4096
MAX_CAPSULE_BYTES = 3584
MAX_ADMITTED_BYTES = 2048
MAX_BLOCK_BYTES = 1024
MAX_CONSTRAINT_BYTES = 256
MAX_OUTPUT_SCHEMA_BYTES = 2048
MAX_PROVIDER_SCHEMA_DEPTH = 10
MAX_PROVIDER_OBJECT_PROPERTIES = 5000
MAX_PROVIDER_ENUM_VALUES = 1000
MAX_PROVIDER_SCHEMA_STRING_CHARS = 120000
MAX_PROVIDER_LARGE_ENUM_VALUES = 250
MAX_PROVIDER_LARGE_ENUM_STRING_CHARS = 15000

PREFIX_START = {"codex": "Create a goal that ", "omp": "/goal "}

FORBIDDEN_SUBJECT_CHOREOGRAPHY = (
    "start goal mode",
    "wait for activation",
    "wait until active",
    "ack the",
    "acknowledge the",
    "resume the goal",
    "update_goal",
    "complete the goal",
    "stop goal mode",
    "receive the next",
    "subject slice",
    "atom release",
)


class ContractError(ValueError):
    pass


def canonical_bytes(value: Any) -> bytes:
    try:
        return json.dumps(
            value,
            allow_nan=False,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise ContractError(f"value is not canonical JSON: {exc}") from exc


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(
            handle,
            object_pairs_hook=_no_duplicates,
            parse_constant=_reject_nonfinite,
            parse_float=_parse_finite_float,
        )


def load_json_text(text: str, label: str = "JSON text") -> Any:
    try:
        return json.loads(
            text,
            object_pairs_hook=_no_duplicates,
            parse_constant=_reject_nonfinite,
            parse_float=_parse_finite_float,
        )
    except json.JSONDecodeError as exc:
        raise ContractError(f"{label} is not valid JSON: {exc}") from exc


def load_json_bytes(raw: bytes, label: str = "JSON bytes") -> Any:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ContractError(f"{label} is not UTF-8: {exc}") from exc
    try:
        return load_json_text(text, label)
    except json.JSONDecodeError as exc:
        raise ContractError(f"{label} is not valid JSON: {exc}") from exc


def _no_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ContractError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def _reject_nonfinite(value: str) -> Any:
    raise ContractError(f"non-finite JSON number: {value}")


def _parse_finite_float(value: str) -> float:
    parsed = float(value)
    if not math.isfinite(parsed):
        raise ContractError(f"JSON number exceeds finite float domain: {value}")
    return parsed


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


def validate_provider_response_schema(schema: dict[str, Any]) -> None:
    """Admit only the closed Structured Outputs subset used by this experiment."""

    jsonschema.Draft202012Validator.check_schema(schema)
    total_properties = 0
    total_enum_values = 0
    total_string_chars = 0

    def walk(node: Any, path: str, *, root: bool = False, depth: int = 1) -> None:
        nonlocal total_properties, total_enum_values, total_string_chars
        require(isinstance(node, dict), f"provider schema node is not an object: {path}")
        require(depth <= MAX_PROVIDER_SCHEMA_DEPTH, f"provider schema nesting exceeds {MAX_PROVIDER_SCHEMA_DEPTH}: {path}")
        schema_type = node.get("type")
        require(isinstance(schema_type, str), f"provider schema type missing or non-string: {path}")

        if schema_type == "object":
            allowed = {"type", "additionalProperties", "required", "properties"}
            if root:
                allowed.add("$schema")
                require(
                    node.get("$schema") == "https://json-schema.org/draft/2020-12/schema",
                    "provider root schema dialect",
                )
            require(set(node).issubset(allowed), f"unsupported provider object keyword at {path}: {sorted(set(node) - allowed)}")
            require(node.get("additionalProperties") is False, f"provider object must close additionalProperties: {path}")
            properties = node.get("properties")
            required = node.get("required")
            require(isinstance(properties, dict) and properties, f"provider object properties: {path}")
            require(all(isinstance(key, str) and key for key in properties), f"provider property name: {path}")
            total_properties += len(properties)
            total_string_chars += sum(len(key) for key in properties)
            require(total_properties <= MAX_PROVIDER_OBJECT_PROPERTIES, "provider schema total object properties")
            require(total_string_chars <= MAX_PROVIDER_SCHEMA_STRING_CHARS, "provider schema total string characters")
            require(isinstance(required, list) and all(isinstance(key, str) for key in required), f"provider required list: {path}")
            require(len(required) == len(set(required)), f"duplicate provider required name: {path}")
            require(set(required) == set(properties), f"provider requires every property: {path}")
            for key, child in properties.items():
                walk(child, f"{path}.properties.{key}", depth=depth + 1)
            return

        if schema_type == "array":
            allowed = {"type", "items", "minItems", "maxItems"}
            require(set(node).issubset(allowed), f"unsupported provider array keyword at {path}: {sorted(set(node) - allowed)}")
            minimum = node.get("minItems")
            maximum = node.get("maxItems")
            if minimum is not None:
                require(isinstance(minimum, int) and not isinstance(minimum, bool) and minimum >= 0, f"provider minItems: {path}")
            if maximum is not None:
                require(isinstance(maximum, int) and not isinstance(maximum, bool) and maximum >= 0, f"provider maxItems: {path}")
            if minimum is not None and maximum is not None:
                require(minimum <= maximum, f"provider item bounds: {path}")
            require("items" in node, f"provider array items missing: {path}")
            walk(node["items"], f"{path}.items", depth=depth + 1)
            return

        require(schema_type in {"string", "boolean", "integer", "number"}, f"unsupported provider schema type at {path}: {schema_type}")
        allowed = {"type", "enum"}
        require(set(node).issubset(allowed), f"unsupported provider scalar keyword at {path}: {sorted(set(node) - allowed)}")
        if "enum" in node:
            values = node["enum"]
            require(isinstance(values, list) and values, f"provider enum: {path}")
            encoded = [canonical_bytes(value) for value in values]
            require(len(encoded) == len(set(encoded)), f"duplicate provider enum value: {path}")
            validator = jsonschema.Draft202012Validator(node)
            require(all(validator.is_valid(value) for value in values), f"provider enum/type mismatch: {path}")
            require(len(values) == len(set(values)), f"semantically duplicate provider enum value: {path}")
            total_enum_values += len(values)
            require(total_enum_values <= MAX_PROVIDER_ENUM_VALUES, "provider schema total enum values")
            string_chars = sum(len(value) for value in values if isinstance(value, str))
            total_string_chars += string_chars
            require(total_string_chars <= MAX_PROVIDER_SCHEMA_STRING_CHARS, "provider schema total string characters")
            if schema_type == "string" and len(values) > MAX_PROVIDER_LARGE_ENUM_VALUES:
                require(
                    string_chars <= MAX_PROVIDER_LARGE_ENUM_STRING_CHARS,
                    "provider large enum total string characters",
                )

    require(isinstance(schema, dict), "provider response schema must be an object")
    require(schema.get("type") == "object", "provider response root must be object")
    walk(schema, "$", root=True)


def validate_capsule(capsule: dict[str, Any], capsule_schema: dict[str, Any] | None = None) -> dict[str, int | str]:
    schema = load_json(CAPSULE_SCHEMA) if capsule_schema is None else capsule_schema
    jsonschema.Draft202012Validator.check_schema(schema)
    jsonschema.Draft202012Validator(schema).validate(capsule)
    require(capsule["profile_id"] == PROFILE, "profile mismatch")

    context = capsule["admitted_context"]
    source_ids = [block["source_id"] for block in context]
    require(len(source_ids) == len(set(source_ids)), "duplicate admitted source_id")
    require(capsule["lineage"]["allowed_source_ids"] == source_ids, "lineage source order/set mismatch")

    admitted_bytes = 0
    for block in context:
        raw = block["text"].encode("utf-8")
        require(len(raw) <= MAX_BLOCK_BYTES, f"source block too large: {block['source_id']}")
        require(block["utf8_bytes"] == len(raw), f"source byte declaration mismatch: {block['source_id']}")
        require(block["text_sha256"] == sha256(raw), f"source hash mismatch: {block['source_id']}")
        admitted_bytes += len(raw)
    require(admitted_bytes <= MAX_ADMITTED_BYTES, "combined admitted context too large")

    constraint_ids = [item["constraint_id"] for item in capsule["constraints"]]
    require(len(constraint_ids) == len(set(constraint_ids)), "duplicate constraint_id")
    for index, constraint in enumerate(capsule["constraints"]):
        require(len(constraint["text"].encode("utf-8")) <= MAX_CONSTRAINT_BYTES, f"constraint too large: {index}")
        require(set(constraint["source_ids"]).issubset(source_ids), f"constraint source outside admission: {index}")

    inline_schema = capsule["output_contract"]["inline_schema"]
    jsonschema.Draft202012Validator.check_schema(inline_schema)
    validate_provider_response_schema(inline_schema)
    inline_raw = canonical_bytes(inline_schema)
    require(len(inline_raw) <= MAX_OUTPUT_SCHEMA_BYTES, "inline output schema too large")
    require(capsule["output_contract"]["schema_sha256"] == sha256(inline_raw), "output schema hash mismatch")
    required = inline_schema["required"]
    require(set(required) == set(inline_schema["properties"]), "output schema required/properties mismatch")

    capsule_raw = canonical_bytes(capsule)
    require(len(capsule_raw) <= MAX_CAPSULE_BYTES, "capsule too large")
    return {
        "admitted_context_utf8_bytes": admitted_bytes,
        "capsule_sha256": sha256(capsule_raw),
        "capsule_utf8_bytes": len(capsule_raw),
        "output_schema_sha256": sha256(inline_raw),
        "output_schema_utf8_bytes": len(inline_raw),
    }


def render_prompt(
    capsule: dict[str, Any],
    platform: str,
    capsule_schema: dict[str, Any] | None = None,
) -> tuple[str, dict[str, int | str]]:
    require(platform in PREFIX_START, f"unsupported platform: {platform}")
    metrics = validate_capsule(capsule, capsule_schema)
    action = (
        f"completes bounded PromptCapsule {capsule['unit_id']} below and returns only one JSON object "
        "matching output_contract.inline_schema.\nPromptCapsule:\n"
    )
    prompt = PREFIX_START[platform] + action + canonical_bytes(capsule).decode("utf-8")
    prompt_raw = prompt.encode("utf-8")
    require(len(prompt_raw) <= MAX_PROMPT_BYTES, "rendered prompt too large")
    require(prompt.startswith("Create a goal that ") if platform == "codex" else prompt.startswith("/goal "), "prefix mismatch")
    lowered = prompt.lower()
    for phrase in FORBIDDEN_SUBJECT_CHOREOGRAPHY:
        require(phrase not in lowered, f"forbidden subject choreography: {phrase}")
    return prompt, {**metrics, "prompt_sha256": sha256(prompt_raw), "prompt_utf8_bytes": len(prompt_raw)}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("capsule", type=Path)
    parser.add_argument("--platform", choices=sorted(PREFIX_START), required=True)
    parser.add_argument("--emit-prompt", action="store_true")
    args = parser.parse_args(argv)
    try:
        capsule = load_json(args.capsule)
        prompt, metrics = render_prompt(capsule, args.platform)
        if args.emit_prompt:
            sys.stdout.write(prompt)
        else:
            sys.stdout.buffer.write(canonical_bytes({"status": "PASS", **metrics}) + b"\n")
        return 0
    except (ContractError, json.JSONDecodeError, jsonschema.ValidationError, jsonschema.SchemaError, OSError) as exc:
        sys.stdout.buffer.write(canonical_bytes({"status": "FAIL", "error": str(exc)}) + b"\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
