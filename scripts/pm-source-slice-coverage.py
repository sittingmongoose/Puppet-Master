#!/usr/bin/env python3
"""Materialize and verify bounded source slices for approval-gated packet review."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shutil
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any


SCHEMA_VERSION = "1.0.0"
MAX_LINES = 220
OVERLAP_LINES = 20
STEP_LINES = MAX_LINES - OVERLAP_LINES
TEXT_EXTENSIONS = {
    ".css", ".csv", ".html", ".ini", ".js", ".json", ".jsonl", ".md",
    ".mjs", ".py", ".rs", ".slint", ".toml", ".ts", ".tsx", ".txt",
    ".xml", ".yaml", ".yml",
}


class CustodyError(RuntimeError):
    pass


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def safe_parts(name: str) -> tuple[str, ...]:
    normalized = name.replace("\\", "/")
    path = PurePosixPath(normalized)
    if path.is_absolute() or any(part in {"", ".", ".."} for part in path.parts):
        raise CustodyError(f"unsafe archive member path: {name!r}")
    return path.parts


def slug(value: str) -> str:
    result = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in result.split("-") if part)


@dataclass(frozen=True)
class Document:
    document_id: str
    archive_id: str
    archive_chain: tuple[str, ...]
    logical_path: str
    raw_relative_path: str
    data: bytes
    text: str


class Materializer:
    def __init__(self, output: Path) -> None:
        self.output = output
        self.raw_root = output / "raw"
        self.slice_root = output / "slices"
        self.inventory: list[dict[str, Any]] = []
        self.documents: list[Document] = []
        self.nested_archives: list[dict[str, Any]] = []

    def run(self, archives: list[Path]) -> None:
        if self.output.exists():
            raise CustodyError(f"output already exists: {self.output}")
        self.raw_root.mkdir(parents=True)
        self.slice_root.mkdir(parents=True)

        packet_hashes = []
        used_ids: set[str] = set()
        for position, archive in enumerate(archives, start=1):
            data = archive.read_bytes()
            archive_id = f"PKT-{position:02d}-{slug(archive.stem)}"
            if archive_id in used_ids:
                raise CustodyError(f"duplicate archive id: {archive_id}")
            used_ids.add(archive_id)
            packet_hashes.append({
                "archive_id": archive_id,
                "attachment_locator": f"attachment://{archive.parent.name}/{archive.name}",
                "basename": archive.name,
                "bytes": len(data),
                "sha256": sha256_bytes(data),
            })
            self._read_zip(
                data=data,
                archive_id=archive_id,
                archive_chain=(archive.name,),
                raw_prefix=Path(archive_id),
                logical_prefix=PurePosixPath(),
                depth=0,
            )

        coverage_documents = [self._slice_document(document) for document in self.documents]
        write_json(self.output / "packet_hashes.json", {
            "schema_id": "pm.packet_custody.hashes.v1",
            "schema_version": SCHEMA_VERSION,
            "archive_count": len(packet_hashes),
            "archives": packet_hashes,
        })
        write_json(self.output / "inventory.json", {
            "schema_id": "pm.packet_custody.inventory.v1",
            "schema_version": SCHEMA_VERSION,
            "top_level_archive_count": len(packet_hashes),
            "nested_archive_count": len(self.nested_archives),
            "entry_count": len(self.inventory),
            "document_count": len(self.documents),
            "nested_archives": self.nested_archives,
            "entries": self.inventory,
        })
        write_json(self.output / "slice_coverage.json", {
            "schema_id": "pm.packet_custody.slice_coverage.v1",
            "schema_version": SCHEMA_VERSION,
            "max_lines_per_slice": MAX_LINES,
            "overlap_lines": OVERLAP_LINES,
            "document_count": len(coverage_documents),
            "documents": coverage_documents,
        })
        write_json(self.output / "approval_gate.json", {
            "schema_id": "pm.packet_custody.approval_gate.v1",
            "schema_version": SCHEMA_VERSION,
            "gate": "explicit_owner_approval_required",
            "state": "not_approved_for_canonical_promotion",
            "allowed_without_further_approval": [
                "hash_verification", "inventory_verification", "slice_coverage_verification"
            ],
            "prohibited_without_further_approval": [
                "canonical_plan_promotion", "implementation_claim", "runtime_claim",
                "readiness_claim", "governance_refresh"
            ],
        })

    def _read_zip(
        self,
        *,
        data: bytes,
        archive_id: str,
        archive_chain: tuple[str, ...],
        raw_prefix: Path,
        logical_prefix: PurePosixPath,
        depth: int,
    ) -> None:
        if depth > 8:
            raise CustodyError(f"nested archive depth exceeds 8: {archive_chain!r}")
        with zipfile.ZipFile(io.BytesIO(data), mode="r") as archive:
            seen: set[str] = set()
            for member in archive.infolist():
                if member.is_dir():
                    continue
                parts = safe_parts(member.filename)
                logical_path = logical_prefix.joinpath(*parts).as_posix()
                if logical_path in seen:
                    raise CustodyError(f"duplicate archive member: {logical_path}")
                seen.add(logical_path)
                member_data = archive.read(member)
                raw_path = self.raw_root / raw_prefix.joinpath(*parts)
                raw_path.parent.mkdir(parents=True, exist_ok=True)
                raw_path.write_bytes(member_data)
                suffix = Path(parts[-1]).suffix.lower()
                kind = "binary"
                line_count: int | None = None
                decode_status = "not_text_extension"
                text: str | None = None
                if suffix in TEXT_EXTENSIONS:
                    try:
                        text = member_data.decode("utf-8")
                    except UnicodeDecodeError:
                        kind = "undecodable_text"
                        decode_status = "utf8_decode_failed"
                    else:
                        kind = "document"
                        decode_status = "utf8"
                        line_count = len(text.splitlines())
                entry = {
                    "archive_id": archive_id,
                    "archive_chain": list(archive_chain),
                    "logical_path": logical_path,
                    "raw_relative_path": raw_path.relative_to(self.output).as_posix(),
                    "kind": kind,
                    "bytes": len(member_data),
                    "sha256": sha256_bytes(member_data),
                    "decode_status": decode_status,
                }
                if line_count is not None:
                    entry["line_count"] = line_count
                self.inventory.append(entry)
                if text is not None:
                    document_id = f"DOC-{len(self.documents) + 1:04d}"
                    self.documents.append(Document(
                        document_id=document_id,
                        archive_id=archive_id,
                        archive_chain=archive_chain,
                        logical_path=logical_path,
                        raw_relative_path=entry["raw_relative_path"],
                        data=member_data,
                        text=text,
                    ))
                if suffix == ".zip":
                    nested_name = "/".join((*archive_chain, member.filename))
                    self.nested_archives.append({
                        "archive_id": archive_id,
                        "archive_chain": [*archive_chain, member.filename],
                        "bytes": len(member_data),
                        "sha256": sha256_bytes(member_data),
                    })
                    nested_raw = raw_prefix.joinpath(*parts[:-1], f"{parts[-1]}.contents")
                    nested_logical = logical_prefix.joinpath(*parts[:-1], f"{parts[-1]}.contents")
                    self._read_zip(
                        data=member_data,
                        archive_id=archive_id,
                        archive_chain=(*archive_chain, member.filename),
                        raw_prefix=nested_raw,
                        logical_prefix=nested_logical,
                        depth=depth + 1,
                    )

    def _slice_document(self, document: Document) -> dict[str, Any]:
        lines = document.text.splitlines(keepends=True)
        document_dir = self.slice_root / document.archive_id / document.document_id
        document_dir.mkdir(parents=True, exist_ok=True)
        slices: list[dict[str, Any]] = []
        if not lines:
            slice_path = document_dir / "L000000-L000000.txt"
            slice_path.write_bytes(b"")
            slices.append({
                "start_line": 0, "end_line": 0, "line_count": 0,
                "slice_relative_path": slice_path.relative_to(self.output).as_posix(),
                "sha256": sha256_bytes(b""),
            })
        else:
            for start_index in range(0, len(lines), STEP_LINES):
                end_index = min(start_index + MAX_LINES, len(lines))
                slice_data = "".join(lines[start_index:end_index]).encode("utf-8")
                start_line = start_index + 1
                end_line = end_index
                slice_path = document_dir / f"L{start_line:06d}-L{end_line:06d}.txt"
                slice_path.write_bytes(slice_data)
                slices.append({
                    "start_line": start_line,
                    "end_line": end_line,
                    "line_count": end_line - start_line + 1,
                    "slice_relative_path": slice_path.relative_to(self.output).as_posix(),
                    "sha256": sha256_bytes(slice_data),
                })
                if end_index == len(lines):
                    break
        return {
            "document_id": document.document_id,
            "archive_id": document.archive_id,
            "archive_chain": list(document.archive_chain),
            "logical_path": document.logical_path,
            "raw_relative_path": document.raw_relative_path,
            "source_bytes": len(document.data),
            "source_sha256": sha256_bytes(document.data),
            "source_line_count": len(lines),
            "slice_count": len(slices),
            "slices": slices,
        }


def verify(root: Path) -> list[str]:
    errors: list[str] = []
    coverage_path = root / "slice_coverage.json"
    inventory_path = root / "inventory.json"
    try:
        coverage = json.loads(coverage_path.read_text(encoding="utf-8"))
        inventory = json.loads(inventory_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return [f"manifest read failed: {error}"]
    if coverage.get("max_lines_per_slice") != MAX_LINES:
        errors.append(f"max_lines_per_slice must be {MAX_LINES}")
    if coverage.get("overlap_lines") != OVERLAP_LINES:
        errors.append(f"overlap_lines must be {OVERLAP_LINES}")
    entries = inventory.get("entries", [])
    if not isinstance(entries, list):
        return errors + ["inventory entries must be an array"]
    if inventory.get("entry_count") != len(entries):
        errors.append("inventory entry_count does not match entries array")
    for index, entry in enumerate(entries, start=1):
        raw_path = root / entry.get("raw_relative_path", "")
        try:
            raw_data = raw_path.read_bytes()
        except OSError as error:
            errors.append(f"inventory entry {index}: raw file read failed: {error}")
            continue
        if len(raw_data) != entry.get("bytes"):
            errors.append(f"inventory entry {index}: raw byte count mismatch")
        if sha256_bytes(raw_data) != entry.get("sha256"):
            errors.append(f"inventory entry {index}: raw hash mismatch")
    documents = coverage.get("documents")
    if not isinstance(documents, list):
        return errors + ["documents must be an array"]
    inventory_docs = {
        (entry.get("archive_id"), entry.get("logical_path")): entry
        for entry in entries if entry.get("kind") == "document"
    }
    if inventory.get("document_count") != len(inventory_docs):
        errors.append("inventory document_count does not match document entries")
    if coverage.get("document_count") != len(documents):
        errors.append("document_count does not match documents array")
    if len(inventory_docs) != len(documents):
        errors.append("inventory document count does not match coverage document count")
    for document in documents:
        label = document.get("document_id", "<missing-document-id>")
        key = (document.get("archive_id"), document.get("logical_path"))
        entry = inventory_docs.get(key)
        if entry is None:
            errors.append(f"{label}: missing document inventory entry")
            continue
        raw_path = root / document.get("raw_relative_path", "")
        try:
            raw_data = raw_path.read_bytes()
        except OSError as error:
            errors.append(f"{label}: raw source read failed: {error}")
            continue
        if sha256_bytes(raw_data) != document.get("source_sha256"):
            errors.append(f"{label}: raw source hash mismatch")
        try:
            raw_lines = raw_data.decode("utf-8").splitlines(keepends=True)
        except UnicodeDecodeError:
            errors.append(f"{label}: raw source is not UTF-8")
            continue
        if len(raw_lines) != document.get("source_line_count"):
            errors.append(f"{label}: source line count mismatch")
        slices = document.get("slices", [])
        if document.get("slice_count") != len(slices):
            errors.append(f"{label}: slice_count mismatch")
        expected_start = 0 if not raw_lines else 1
        covered: set[int] = set()
        previous_end: int | None = None
        for index, item in enumerate(slices):
            start = item.get("start_line")
            end = item.get("end_line")
            slice_path = root / item.get("slice_relative_path", "")
            try:
                slice_data = slice_path.read_bytes()
            except OSError as error:
                errors.append(f"{label}: slice {index + 1} read failed: {error}")
                continue
            if sha256_bytes(slice_data) != item.get("sha256"):
                errors.append(f"{label}: slice {index + 1} hash mismatch")
            if not raw_lines:
                if (start, end, slice_data) != (0, 0, b""):
                    errors.append(f"{label}: invalid empty-document slice")
                continue
            if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start:
                errors.append(f"{label}: slice {index + 1} has invalid bounds")
                continue
            if end - start + 1 > MAX_LINES:
                errors.append(f"{label}: slice {index + 1} exceeds {MAX_LINES} lines")
            if index == 0 and start != expected_start:
                errors.append(f"{label}: first slice does not begin at line 1")
            if previous_end is not None:
                actual_overlap = previous_end - start + 1
                expected_overlap = min(OVERLAP_LINES, previous_end)
                if actual_overlap != expected_overlap:
                    errors.append(
                        f"{label}: slice {index + 1} overlap {actual_overlap}, expected {expected_overlap}"
                    )
            expected_data = "".join(raw_lines[start - 1:end]).encode("utf-8")
            if slice_data != expected_data:
                errors.append(f"{label}: slice {index + 1} bytes do not match source bounds")
            covered.update(range(start, end + 1))
            previous_end = end
        if raw_lines and covered != set(range(1, len(raw_lines) + 1)):
            errors.append(f"{label}: source-line coverage has gaps or out-of-range lines")
    return errors


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    materialize = subparsers.add_parser("materialize")
    materialize.add_argument("--output", type=Path, required=True)
    materialize.add_argument("--archive", action="append", type=Path, required=True)
    verify_parser = subparsers.add_parser("verify")
    verify_parser.add_argument("root", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.command == "materialize":
            archives = [path.resolve(strict=True) for path in args.archive]
            if len(archives) != 8:
                raise CustodyError(f"exactly 8 top-level archives required, got {len(archives)}")
            Materializer(args.output).run(archives)
            errors = verify(args.output)
            if errors:
                raise CustodyError("post-materialization verification failed:\n" + "\n".join(errors))
            print(f"PASS: materialized and verified {args.output}")
            return 0
        errors = verify(args.root)
        if errors:
            for error in errors:
                print(f"ERROR: {error}", file=sys.stderr)
            return 1
        print(f"PASS: source-line slice coverage verified for {args.root}")
        return 0
    except (CustodyError, OSError, zipfile.BadZipFile) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
