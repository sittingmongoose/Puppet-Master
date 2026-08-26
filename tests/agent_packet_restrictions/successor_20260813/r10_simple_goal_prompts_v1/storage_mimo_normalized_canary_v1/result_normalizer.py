#!/usr/bin/env python3
"""Closed deterministic PM_RESULT projection over an already-verified OMP session."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import omp_session
import pipeline as P


class NormalizationError(RuntimeError):
    """Permanent result defect after the native Goal session is structurally terminal."""


MARKER_LIKE = re.compile(r"^PM_RESULT(?=$|[^A-Za-z0-9_])")


def require(value: bool, message: str) -> None:
    if not value:
        raise NormalizationError(message)


def typed_equal(left: Any, right: Any) -> bool:
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return set(left) == set(right) and all(typed_equal(left[key], right[key]) for key in left)
    if isinstance(left, list):
        return len(left) == len(right) and all(typed_equal(a, b) for a, b in zip(left, right))
    return left == right


def validate_schema(value: Any, schema: dict[str, Any]) -> None:
    try:
        import jsonschema

        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.Draft202012Validator(schema).validate(value)
    except Exception as exc:
        raise NormalizationError(f"PM_RESULT schema/type rejection: {type(exc).__name__}: {exc}") from exc


def normalize_verified_session(
    path: Path,
    structural: dict[str, Any],
    *,
    oracle_path: Path,
    schema_path: Path,
    max_text_block_utf8_bytes: int,
) -> dict[str, Any]:
    """Project one canonical oracle line without changing or repairing raw session bytes."""
    require(type(max_text_block_utf8_bytes) is int and max_text_block_utf8_bytes > 0, "text bound")
    oracle = P.load_json(oracle_path)
    schema = P.load_json(schema_path)
    oracle_text = oracle_path.read_text(encoding="utf-8").strip()
    require(P.strict_loads(oracle_text) == oracle, "frozen oracle text/object join")
    canonical_line = P.RESULT_PREFIX + oracle_text

    _slot, _header, entries, _raw = omp_session.load_physical_session(path)
    assistants = [
        (entry_index, entry, entry["message"])
        for entry_index, entry in enumerate(entries)
        if entry.get("type") == "message"
        and isinstance(entry.get("message"), dict)
        and entry["message"].get("role") == "assistant"
    ]
    require(len(assistants) == structural.get("assistant_message_count") and assistants, "verified assistant roster join")

    text_records: list[dict[str, Any]] = []
    candidates: list[tuple[Any, dict[str, Any]]] = []
    total_text_bytes = 0
    for assistant_ordinal, (entry_index, entry, message) in enumerate(assistants, 1):
        content = message.get("content")
        require(isinstance(content, list), "verified assistant content list")
        for block_index, block in enumerate(content):
            if not isinstance(block, dict) or block.get("type") != "text":
                continue
            text = block.get("text")
            require(isinstance(text, str), "verified assistant text block")
            raw_text = text.encode("utf-8")
            require(len(raw_text) <= max_text_block_utf8_bytes, "assistant text block byte ceiling")
            total_text_bytes += len(raw_text)
            text_records.append(
                {
                    "assistant_ordinal": assistant_ordinal,
                    "entry_index": entry_index,
                    "entry_id": entry.get("id"),
                    "message_id": message.get("id"),
                    "block_index": block_index,
                    "utf8_bytes": len(raw_text),
                    "sha256": P.sha256_bytes(raw_text),
                }
            )
            for line_index, line in enumerate(text.split("\n"), 1):
                if not MARKER_LIKE.match(line):
                    continue
                require(line.startswith(P.RESULT_PREFIX), f"marker-like PM_RESULT line lacks exact space delimiter at assistant {assistant_ordinal} block {block_index} line {line_index}")
                raw_line = line.encode("utf-8")
                record = {
                    "assistant_ordinal": assistant_ordinal,
                    "entry_index": entry_index,
                    "entry_id": entry.get("id"),
                    "message_id": message.get("id"),
                    "block_index": block_index,
                    "line_index": line_index,
                    "raw_line": line,
                    "raw_line_utf8_bytes": len(raw_line),
                    "raw_line_sha256": P.sha256_bytes(raw_line),
                }
                try:
                    value = P.strict_loads(line[len(P.RESULT_PREFIX) :])
                    validate_schema(value, schema)
                except (P.PipelineError, UnicodeError, ValueError, TypeError, NormalizationError) as exc:
                    raise NormalizationError(
                        f"invalid PM_RESULT candidate at assistant {assistant_ordinal} block {block_index} line {line_index}: {type(exc).__name__}: {exc}"
                    ) from exc
                candidates.append((value, record))

    require(total_text_bytes <= max_text_block_utf8_bytes * len(assistants), "bounded assistant text aggregate")
    require(candidates, "at least one line-start PM_RESULT candidate")
    first = candidates[0][0]
    require(all(typed_equal(value, first) for value, _record in candidates[1:]), "conflicting PM_RESULT candidates")
    require(typed_equal(first, oracle), "PM_RESULT candidate value differs from frozen oracle")

    raw_last = structural.get("final_text")
    require(isinstance(raw_last, str), "raw last-assistant text")
    raw_last_bytes = raw_last.encode("utf-8")
    candidate_records = [record for _value, record in candidates]
    projection = dict(structural)
    projection.update(
        {
            "raw_last_assistant_text": raw_last,
            "raw_last_assistant_utf8_bytes": len(raw_last_bytes),
            "raw_last_assistant_sha256": P.sha256_bytes(raw_last_bytes),
            "verified_assistant_text_blocks": text_records,
            "verified_assistant_text_utf8_bytes": total_text_bytes,
            "result_normalization": {
                "schema_id": "pm.r10.storage_pipeline.result_normalization.v1",
                "result_authority": "deterministic_host_program_over_verified_assistant_text",
                "location_indexing": "entry_and_block_zero_based_line_one_based",
                "candidate_count": len(candidate_records),
                "candidates": candidate_records,
                "canonical_text": canonical_line,
                "canonical_utf8_bytes": len(canonical_line.encode("utf-8")),
                "canonical_sha256": P.sha256_bytes(canonical_line.encode("utf-8")),
                "raw_session_preserved": True,
                "surrounding_prose_authoritative": False,
            },
            "final_text": canonical_line,
            "final_text_sha256": P.sha256_bytes(canonical_line.encode("utf-8")),
        }
    )
    return projection
