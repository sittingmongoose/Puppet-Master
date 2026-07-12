#!/usr/bin/env python3
"""Independent oracle for A005 canonical JSON decimal v1.

This implementation intentionally shares no serialization helper with the
production implementation. It is used only for cross-checking tests.
"""
from __future__ import annotations

import hashlib
import json
from decimal import Decimal
from typing import Any


def _no_constant(token: str) -> None:
    raise ValueError(token)


def _unique(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    keys = [key for key, _ in pairs]
    if len(keys) != len(set(keys)):
        raise ValueError("duplicate")
    return dict(pairs)


def _decimal_text(number: Decimal) -> str:
    if not number.is_finite():
        raise ValueError("nonfinite")
    if number.is_zero():
        return "0"
    sign, digits, exponent = number.as_tuple()
    body = "".join(str(d) for d in digits) or "0"
    if exponent >= 0:
        body += "0" * exponent
    else:
        split = len(body) + exponent
        body = ("0." + "0" * (-split) + body) if split <= 0 else (body[:split] + "." + body[split:])
        body = body.rstrip("0").rstrip(".")
    return ("-" if sign else "") + body


def _walk(value: Any, chunks: list[str]) -> None:
    if value is None:
        chunks.append("null")
    elif value is True:
        chunks.append("true")
    elif value is False:
        chunks.append("false")
    elif isinstance(value, Decimal):
        chunks.append(_decimal_text(value))
    elif isinstance(value, str):
        chunks.append(json.dumps(value, ensure_ascii=False))
    elif isinstance(value, list):
        chunks.append("[")
        for index, item in enumerate(value):
            if index:
                chunks.append(",")
            _walk(item, chunks)
        chunks.append("]")
    elif isinstance(value, dict):
        chunks.append("{")
        for index, key in enumerate(sorted(value.keys())):
            if index:
                chunks.append(",")
            chunks.append(json.dumps(key, ensure_ascii=False))
            chunks.append(":")
            _walk(value[key], chunks)
        chunks.append("}")
    else:
        raise ValueError(type(value).__name__)


def canonical_bytes_from_buffer(raw: bytes) -> bytes:
    obj = json.loads(
        raw.decode("utf-8"), parse_int=Decimal, parse_float=Decimal,
        parse_constant=_no_constant, object_pairs_hook=_unique,
    )
    chunks: list[str] = []
    _walk(obj, chunks)
    return "".join(chunks).encode("utf-8")


def canonical_sha256_from_buffer(raw: bytes) -> str:
    return hashlib.sha256(canonical_bytes_from_buffer(raw)).hexdigest()
