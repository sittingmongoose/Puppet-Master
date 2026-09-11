"""Byte-exact, bounded packet custody reads; never audit verdicts."""
from __future__ import annotations
import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any, Iterator
from pm_evidence_paths import contained_path, EvidencePathError

class AuditError(RuntimeError):
    pass

def is_nonempty_string(value):
    return isinstance(value, str) and bool(value.strip())

def sha256_bytes(value):
    return hashlib.sha256(value).hexdigest()

def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise AuditError(f"cannot load custody JSON {path}: {exc}") from exc

class SliceCorpus:
    def __init__(self, custody_root: Path) -> None:
        self.root = custody_root.resolve(strict=True)
        coverage_path = self.file("slice_coverage.json")
        coverage_bytes = coverage_path.read_bytes()
        self.coverage_sha256 = sha256_bytes(coverage_bytes)
        try:
            coverage = json.loads(coverage_bytes)
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise AuditError("cannot decode slice_coverage.json") from exc
        if not isinstance(coverage, dict):
            raise AuditError("slice_coverage.json must be an object")
        self.max_lines = coverage.get("max_lines_per_slice")
        self.overlap = coverage.get("overlap_lines")
        if (type(self.max_lines) is not int or not 1 <= self.max_lines <= 220
                or type(self.overlap) is not int or not 0 <= self.overlap < self.max_lines):
            raise AuditError("invalid custody slice limit or overlap")
        documents = coverage.get("documents")
        if not isinstance(documents, list) or not documents:
            raise AuditError("slice_coverage.json documents must be a nonempty array")
        if (type(coverage.get("document_count")) is not int
                or coverage["document_count"] != len(documents)):
            raise AuditError("custody document_count does not match the exact document set")
        self.documents = {}
        for item in documents:
            if not isinstance(item, dict) or not is_nonempty_string(item.get("document_id")):
                raise AuditError("custody document requires a concrete document_id")
            did = item["document_id"]
            if did in self.documents:
                raise AuditError(f"duplicate custody document_id: {did}")
            if (type(item.get("source_line_count")) is not int or item["source_line_count"] < 0
                    or not isinstance(item.get("source_sha256"), str)
                    or re.fullmatch(r"[0-9a-f]{64}", item["source_sha256"]) is None
                    or not is_nonempty_string(item.get("logical_path"))):
                raise AuditError(f"{did}: invalid source identity or count")
            self.documents[did] = item

    def file(self, relative: str) -> Path:
        # Resolve again on every actual read: a prior path check is not authority
        # for a file which may have been replaced by an escaping symlink.
        try:
            return contained_path(self.root, relative)
        except (EvidencePathError, OSError, ValueError) as exc:
            raise AuditError(f"invalid custody path (including symlink escape): {exc}") from exc

    def _verify_raw_source(self, document_id: str, document: dict[str, Any]) -> None:
        """Hash declared raw provenance without exposing an unbounded text read.

        Historical slice-only manifests remain supported. When raw provenance is
        declared, it must agree with the same source identity as the slices; a
        self-repinned slice must not hide changed or absent original bytes.
        """
        relative = document.get("raw_relative_path")
        if relative is None:
            return
        path = self.file(relative)
        digest = hashlib.sha256()
        size = 0
        with path.open("rb") as handle:
            for block in iter(lambda: handle.read(65536), b""):
                digest.update(block)
                size += len(block)
        if digest.hexdigest() != document["source_sha256"]:
            raise AuditError(f"{document_id}: raw source hash mismatch")
        declared_size = document.get("source_bytes")
        if type(declared_size) is not int or declared_size < 0 or size != declared_size:
            raise AuditError(f"{document_id}: raw source byte count mismatch")

    def _verified_lines(self, document_id: str) -> Iterator[bytes]:
        document = self.documents.get(document_id)
        if document is None:
            raise AuditError(f"unknown custody document_id: {document_id}")
        self._verify_raw_source(document_id, document)
        slices = document.get("slices")
        if (not isinstance(slices, list)
                or type(document.get("slice_count")) is not int
                or document["slice_count"] != len(slices)):
            raise AuditError(f"{document_id}: invalid slice list/count")
        if document["source_line_count"] == 0:
            if document["source_sha256"] != sha256_bytes(b""):
                raise AuditError(f"{document_id}: invalid empty source hash")
            if slices:
                # The materializer retains one explicitly empty 0..0 slice for
                # empty documents; it is not a one-line source or an omission.
                if len(slices) != 1 or not isinstance(slices[0], dict):
                    raise AuditError(f"{document_id}: invalid empty slice set")
                item = slices[0]
                if (any(type(item.get(k)) is not int or item[k] != 0
                        for k in ("start_line", "end_line", "line_count"))
                        or item.get("sha256") != sha256_bytes(b"")
                        or self.file(item.get("slice_relative_path")).read_bytes() != b""):
                    raise AuditError(f"{document_id}: invalid empty slice bounds or bytes")
            if "source_bytes" in document and (type(document["source_bytes"]) is not int
                    or document["source_bytes"] != 0):
                raise AuditError(f"{document_id}: invalid empty source byte count")
            return
        if not slices:
            raise AuditError(f"{document_id}: nonempty source has no slices")
        previous_end = 0
        tail: list[bytes] = []
        digest = hashlib.sha256()
        emitted = 0
        emitted_bytes = 0
        seen_paths = set()
        for index, item in enumerate(slices):
            if not isinstance(item, dict):
                raise AuditError(f"{document_id}: slice must be an object")
            start, end, count = (item.get(k) for k in ("start_line", "end_line", "line_count"))
            if (any(type(v) is not int for v in (start, end, count)) or start < 1 or end < start
                    or count != end - start + 1 or not 1 <= count <= self.max_lines):
                raise AuditError(f"{document_id}: invalid slice range")
            expected_start = 1 if index == 0 else previous_end - self.overlap + 1
            if start != expected_start or end <= previous_end:
                raise AuditError(f"{document_id}: discontinuous or non-advancing slice")
            relative = item.get("slice_relative_path")
            path = self.file(relative)
            if path in seen_paths:
                raise AuditError(f"{document_id}: duplicate slice path")
            seen_paths.add(path)
            data = path.read_bytes()
            if sha256_bytes(data) != item.get("sha256"):
                raise AuditError(f"{document_id}: slice hash mismatch while reading {relative}")
            try:
                data.decode("utf-8")
            except UnicodeError as exc:
                raise AuditError(f"{document_id}: slice is not UTF-8") from exc
            lines = data.splitlines(keepends=True)
            if len(lines) != count:
                raise AuditError(f"{document_id}: physical line count mismatch")
            skip = 0 if index == 0 else self.overlap
            if skip and lines[:skip] != tail:
                raise AuditError(f"{document_id}: overlapping source bytes disagree")
            for line in lines[skip:]:
                digest.update(line)
                emitted += 1
                emitted_bytes += len(line)
                yield line
            tail = lines[-self.overlap:] if self.overlap else []
            previous_end = end
        if previous_end != document["source_line_count"] or emitted != document["source_line_count"]:
            raise AuditError(f"{document_id}: reconstructed source does not reach exact EOF")
        if digest.hexdigest() != document["source_sha256"]:
            raise AuditError(f"{document_id}: reconstructed source hash mismatch against manifest/raw source bounds")
        if "source_bytes" in document and (type(document["source_bytes"]) is not int
                or emitted_bytes != document["source_bytes"]):
            raise AuditError(f"{document_id}: reconstructed source byte count mismatch")

    def verify_all(self) -> dict[str, Any]:
        failures: list[str] = []
        slice_count = 0
        unique_line_count = 0
        def inspect(document_id: str) -> tuple[int, int, str | None]:
            slices = self.documents[document_id].get("slices")
            count = len(slices) if isinstance(slices, list) else 0
            try:
                return count, sum(1 for _ in self._verified_lines(document_id)), None
            except (AuditError, OSError, ValueError, TypeError) as exc:
                return count, 0, str(exc)
        # Custody reads are independent and I/O-bound. Preserve deterministic
        # document order and every per-read check while bounding concurrency.
        with ThreadPoolExecutor(max_workers=4) as executor:
            for count, lines, failure in executor.map(inspect, sorted(self.documents)):
                slice_count += count
                unique_line_count += lines
                if failure is not None:
                    failures.append(failure)
        return {
            "document_count": len(self.documents),
            "slice_count": slice_count,
            "unique_source_line_count": unique_line_count,
            "max_lines_per_slice": self.max_lines,
            "overlap_lines": self.overlap,
            "valid": not failures,
            "failures": failures,
        }

    def lines(self, document_id: str) -> Iterator[tuple[int, str]]:
        # Re-read and validate the same bytes actually consumed, not a prior pass.
        for number, line in enumerate(self._verified_lines(document_id), start=1):
            yield number, line.decode("utf-8").rstrip("\r\n")

    def document_summary(self, document_id: str) -> dict[str, Any]:
        for _ in self._verified_lines(document_id):
            pass
        document = self.documents[document_id]
        return {
            "document_id": document_id,
            "logical_path": document["logical_path"],
            "source_line_count": document["source_line_count"],
            "source_sha256": document["source_sha256"],
            "slice_count": document["slice_count"],
        }
