#!/usr/bin/env python3
"""Closed structural, byte, hash, and rendering contract for R10 capsules."""

from __future__ import annotations

import argparse
import hashlib
import json
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
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle, object_pairs_hook=_no_duplicates)


def load_json_bytes(raw: bytes, label: str = "JSON bytes") -> Any:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ContractError(f"{label} is not UTF-8: {exc}") from exc
    try:
        return json.loads(text, object_pairs_hook=_no_duplicates)
    except json.JSONDecodeError as exc:
        raise ContractError(f"{label} is not valid JSON: {exc}") from exc


def _no_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ContractError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


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
