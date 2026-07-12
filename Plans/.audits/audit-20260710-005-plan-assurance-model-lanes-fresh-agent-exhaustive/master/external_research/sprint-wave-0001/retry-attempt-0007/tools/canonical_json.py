#!/usr/bin/env python3
"""Frozen A005 canonical JSON algorithm v1.

Objects are sorted by Unicode key value, arrays retain order, strings use the
shortest JSON escaping produced by Python with ensure_ascii=False, and finite
JSON numbers are normalized through Decimal to fixed notation with no redundant
fractional or exponent form. Duplicate object keys and non-finite numbers are
rejected. The UTF-8 bytes returned here are the sole input to a canonical digest.
"""
from __future__ import annotations

import hashlib
import json
import math
from decimal import Decimal
from typing import Any

ALGORITHM_ID = "a005-canonical-json-decimal-v1"


def _reject_constant(value: str) -> None:
    raise ValueError("non-finite-number:" + value)


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise ValueError("duplicate-object-key:" + key)
        out[key] = value
    return out


def parse_exact(raw: bytes) -> Any:
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError("non-utf8-json") from exc
    return json.loads(
        text,
        parse_int=Decimal,
        parse_float=Decimal,
        parse_constant=_reject_constant,
        object_pairs_hook=_pairs,
    )


def _number(value: Decimal) -> str:
    if not value.is_finite():
        raise ValueError("non-finite-number")
    if value == 0:
        return "0"
    text = format(value, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    if text in {"-0", "+0", ""}:
        return "0"
    return text


def _encode(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, Decimal):
        return _number(value)
    if isinstance(value, int) and not isinstance(value, bool):
        return str(value)
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("non-finite-number")
        return _number(Decimal(str(value)))
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(_encode(item) for item in value) + "]"
    if isinstance(value, dict):
        if not all(isinstance(key, str) for key in value):
            raise ValueError("non-string-object-key")
        return "{" + ",".join(
            json.dumps(key, ensure_ascii=False, separators=(",", ":")) + ":" + _encode(value[key])
            for key in sorted(value)
        ) + "}"
    raise ValueError("unsupported-json-type:" + type(value).__name__)


def canonical_bytes(value: Any) -> bytes:
    return _encode(value).encode("utf-8")


def canonical_bytes_from_buffer(raw: bytes) -> bytes:
    return canonical_bytes(parse_exact(raw))


def canonical_sha256(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def canonical_sha256_from_buffer(raw: bytes) -> str:
    return hashlib.sha256(canonical_bytes_from_buffer(raw)).hexdigest()
