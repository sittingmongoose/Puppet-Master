"""Resolve explicitly mapped, external audit evidence without changing authority.

Locations are not source identity. Callers must still verify their own frozen
hashes, source sets, schemas and reviewer evidence. Live Plans cannot be mapped.
The default is the caller's existing repository path; no directory is guessed.
"""
from __future__ import annotations

import json
import os
from pathlib import Path, PurePosixPath
from typing import Mapping


class EvidencePathError(RuntimeError):
    pass


_ALLOWED = ("scratchpad/", "Plans/.audits/", "reports/", "tests/agent_packet_restrictions/")


def relative_parts(value: str) -> tuple[str, ...]:
    if not isinstance(value, str) or not value or "\\" in value or "\x00" in value:
        raise EvidencePathError("evidence path must be a nonempty POSIX-relative path")
    p = PurePosixPath(value)
    if p.is_absolute() or ":" in value or any(x in ("", ".", "..") for x in value.split("/")):
        raise EvidencePathError(f"unsafe evidence path: {value!r}")
    return p.parts


def contained_path(root: Path, relative: str, *, must_exist: bool = True) -> Path:
    """Reject absolute, traversal and symlink escapes, on every actual read."""
    parts = relative_parts(relative)
    base = Path(root).resolve(strict=True)
    path = base.joinpath(*parts)
    try:
        resolved = path.resolve(strict=must_exist)
    except OSError as exc:
        raise EvidencePathError(f"evidence is missing: {path}") from exc
    if not resolved.is_relative_to(base):
        raise EvidencePathError(f"evidence path escapes its custody root: {relative}")
    return resolved


def _mapping(repo: Path, mapping_path: str | None) -> dict[str, Path]:
    if not mapping_path:
        return {}
    try:
        source = Path(mapping_path).expanduser().resolve(strict=True)
        doc = json.loads(source.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise EvidencePathError(f"invalid evidence location map: {mapping_path}") from exc
    if not isinstance(doc, dict) or set(doc) != {"schema_id", "mappings"} or doc["schema_id"] != "pm.external_evidence_locations.v1":
        raise EvidencePathError("unsupported evidence location map")
    rows = doc["mappings"]
    if not isinstance(rows, list) or not rows:
        raise EvidencePathError("evidence mappings must be a nonempty array")
    result: dict[str, Path] = {}
    for row in rows:
        if not isinstance(row, dict) or set(row) != {"logical_root", "physical_root"}:
            raise EvidencePathError("each evidence mapping needs logical_root and physical_root only")
        logical = row["logical_root"]
        relative_parts(logical)
        if not any((logical + "/").startswith(p) for p in _ALLOWED):
            raise EvidencePathError(f"live canon or unknown namespace cannot be mapped: {logical}")
        if logical in result:
            raise EvidencePathError(f"duplicate evidence mapping: {logical}")
        physical = row["physical_root"]
        if not isinstance(physical, str) or not Path(physical).is_absolute():
            raise EvidencePathError("physical_root must be an explicit absolute path")
        try:
            target = Path(physical).resolve(strict=True)
        except OSError as exc:
            raise EvidencePathError(f"mapped evidence root is missing: {physical}") from exc
        if not target.is_dir():
            raise EvidencePathError(f"mapped evidence root is not a directory: {physical}")
        result[logical] = target
    # Ambiguous overlapping maps make the source selection implicit. Reject them.
    keys = sorted(result)
    for i, key in enumerate(keys):
        for other in keys[i + 1:]:
            if other.startswith(key + "/"):
                raise EvidencePathError(f"overlapping evidence mappings: {key}, {other}")
    return result


def resolve_evidence_input(repo: Path, logical: str, *, must_exist: bool = True,
                           environ: Mapping[str, str] | None = None) -> Path:
    """Explicit map wins; missing mapped data never falls back to a stale copy."""
    env = os.environ if environ is None else environ
    root = Path(repo).resolve(strict=True)
    parts = relative_parts(logical)
    maps = _mapping(root, env.get("PM_EVIDENCE_MAP"))
    for prefix, physical in maps.items():
        if logical == prefix:
            target = physical
        elif logical.startswith(prefix + "/"):
            target = contained_path(physical, logical[len(prefix) + 1:], must_exist=must_exist)
        else:
            continue
        if must_exist and not target.exists():
            raise EvidencePathError(f"mapped evidence is missing: {logical} -> {target}")
        return target
    try:
        return contained_path(root, "/".join(parts), must_exist=must_exist)
    except EvidencePathError as exc:
        raise EvidencePathError(f"{exc}; supply an explicit PM_EVIDENCE_MAP for relocated evidence") from exc


def logical_evidence_path(repo: Path, physical: Path, *, environ: Mapping[str, str] | None = None) -> str:
    env = os.environ if environ is None else environ
    root = Path(repo).resolve(strict=True)
    path = Path(physical).resolve(strict=False)
    if path.is_relative_to(root):
        return path.relative_to(root).as_posix()
    maps = _mapping(root, env.get("PM_EVIDENCE_MAP"))
    for logical, base in maps.items():
        if path.is_relative_to(base):
            tail = path.relative_to(base).as_posix()
            return logical if tail == "." else logical + "/" + tail
    raise EvidencePathError(f"evidence path has no explicit logical mapping: {physical}")
