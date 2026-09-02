#!/usr/bin/env python3
"""Create durable PMConcept7 frame-review assignments and contact sheets.

The script never deletes or rewrites captured frames. It creates:
  * review-ledger.json: every frame assigned to at least one reviewer range;
  * full-frame-review.html: full-resolution links and per-frame bookkeeping;
  * contact-sheets/*.html: multi-view sampled sheets;
  * optionally contact-sheets/*.png via system Chrome headless screenshots.

Assignments are review work, not proof that review occurred. Reviewers must use
--mark-reviewed to record their completed ranges and an immutable findings
receipt (an empty findings array is the explicit no-defect receipt). A final
--check-complete exits nonzero until frame coverage, independent high-risk and
defect-span coverage, primary-integrator review, source integrity, and defect
closure all pass. The terminal receipt keeps those claims separate.
"""
from __future__ import annotations

import argparse
import copy
import errno
import hashlib
import html
import json
import math
import os
import subprocess
import stat
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCHEMA = "pm.capture.full_frame_review_ledger.v2"
CONTACT_INDEX_SCHEMA = "pm.capture.contact_sheet_index.v2"
FINDINGS_SCHEMA = "pm.capture.frame_review_findings.v1"
DISPOSITIONS_SCHEMA = "pm.capture.frame_review_finding_dispositions.v1"
PRIMARY_REVIEW_SCHEMA = "pm.capture.primary_integrator_review_receipt.v1"
TERMINAL_RECEIPT_SCHEMA = "pm.capture.terminal_frame_review_receipt.v1"
MULTI_VIEW_INDEX_SCHEMA = "pm.capture.multi_view_index.v1"
REPLACEMENT_PACKAGE_SCHEMA = "pm.capture.replacement_chapter_package.v1"
AGGREGATE_RERUN_SCHEMA = "pm.capture.replacement_aggregate_rerun_receipt.v1"
HIGH_RISK_DEFAULT = {
    "themes-motion", "onboarding", "onboarding-retro-reduced", "guided-tour",
    "hover-tags", "usage-ats039-motion", "responsive-matrix", "responsive-samples", "home-t48-motion"
}
FINDING_SEVERITIES = {"blocker", "critical", "major", "minor", "note"}
FINDING_TERMINAL_STATUSES = {"repaired", "not_a_defect"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def lexical_absolute(path: Path) -> Path:
    return Path(os.path.abspath(os.fspath(path)))


def open_parent_dir_absolute_nofollow(path: Path) -> tuple[int, str, Path]:
    absolute = lexical_absolute(path)
    parts = absolute.parts
    if len(parts) < 2:
        raise ValueError(f"path has no leaf name: {path}")
    flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0)
    fd = os.open(parts[0], flags)
    try:
        for component in parts[1:-1]:
            next_fd = os.open(component, flags, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return fd, parts[-1], absolute
    except Exception:
        os.close(fd)
        raise


def read_regular_nofollow(path: Path, label: str) -> tuple[Path, bytes, os.stat_result]:
    parent_fd, basename, absolute = open_parent_dir_absolute_nofollow(path)
    fd = None
    try:
        fd = os.open(basename, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=parent_fd)
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            raise ValueError(f"{label} must be a direct regular file")
        chunks: list[bytes] = []
        while block := os.read(fd, 1024 * 1024):
            chunks.append(block)
        data = b"".join(chunks)
        after = os.fstat(fd)
        if len(data) != before.st_size or (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns):
            raise ValueError(f"{label} changed while being read")
        return absolute, data, before
    except OSError as error:
        if error.errno in {errno.ELOOP, errno.ENOTDIR}:
            raise ValueError(f"{label} traverses a symlink or non-directory ancestor") from error
        raise
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def load_json_with_digest(path: Path, label: str = "JSON file") -> tuple[Path, Any, str, os.stat_result]:
    absolute, data, info = read_regular_nofollow(path, label)
    try:
        value = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ValueError(f"{label} is not valid UTF-8 JSON: {error}") from error
    return absolute, value, hashlib.sha256(data).hexdigest(), info


def load_json(path: Path) -> Any:
    return load_json_with_digest(path)[1]


def write_json(path: Path, value: Any) -> None:
    payload = (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    parent_fd, basename, _ = open_parent_dir_absolute_nofollow(path)
    fd = None
    try:
        fd = os.open(basename, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), 0o600, dir_fd=parent_fd)
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise ValueError(f"JSON output must be a direct regular file: {path}")
        view = memoryview(payload)
        while view:
            view = view[os.write(fd, view):]
        os.fsync(fd)
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def sha256(path: Path) -> str:
    return hashlib.sha256(read_regular_nofollow(path, "hashed file")[1]).hexdigest()


def canonical_sha256(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def require_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} must be a non-empty string")
    return value.strip()


def validate_exact_executable_identity(identity: Any, label: str) -> dict[str, Any]:
    string_fields = ("product", "version", "channel", "user_agent", "executable_path", "executable_sha256", "playwright_version")
    stat_fields = ("executable_bytes", "executable_device", "executable_inode", "executable_mtime_ns")
    if (not isinstance(identity, dict) or set(identity) != set(string_fields) | set(stat_fields)
            or not all(isinstance(identity.get(key), str) and identity[key] for key in string_fields)
            or len(identity.get("executable_sha256", "")) != 64
            or any(character not in "0123456789abcdef" for character in identity.get("executable_sha256", ""))
            or not all(isinstance(identity.get(key), int) and not isinstance(identity[key], bool) and identity[key] >= 0 for key in stat_fields)):
        raise ValueError(f"{label} lacks exact path/hash/stat/version executable identity")
    path = Path(identity["executable_path"])
    if not path.is_absolute() or lexical_absolute(path) != path:
        raise ValueError(f"{label} executable path is not exact absolute lexical identity")
    _, data, info = read_regular_nofollow(path, f"{label} executable")
    observed = {"executable_sha256": hashlib.sha256(data).hexdigest(), "executable_bytes": info.st_size, "executable_device": info.st_dev, "executable_inode": info.st_ino, "executable_mtime_ns": info.st_mtime_ns}
    if any(identity.get(key) != value for key, value in observed.items()):
        raise ValueError(f"{label} executable hash/stat identity drifted")
    return identity


def resolve_evidence_path(raw: Any, base: Path, label: str) -> Path:
    value = require_string(raw, label)
    path = Path(value)
    return lexical_absolute(path if path.is_absolute() else base / path)


def validate_png_bytes(data: bytes, path: Path) -> tuple[int, int]:
    header = data[:24]
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError(f"not a structurally recognizable PNG: {path}")
    width, height = int.from_bytes(header[16:20], "big"), int.from_bytes(header[20:24], "big")
    if width <= 0 or height <= 0:
        raise ValueError(f"PNG has invalid dimensions: {path}")
    return width, height


def validate_png(path: Path) -> tuple[int, int]:
    _, data, _ = read_regular_nofollow(path, "PNG evidence")
    return validate_png_bytes(data, path)


def split_ranges(count: int, reviewers: list[str]) -> list[dict[str, Any]]:
    if not reviewers:
        reviewers = ["unassigned-reviewer"]
    size = max(1, math.ceil(count / len(reviewers)))
    rows = []
    for index, reviewer in enumerate(reviewers):
        start = index * size
        if start >= count:
            break
        rows.append({"reviewer": reviewer, "start": start, "end": min(count - 1, start + size - 1)})
    return rows


def build_ledger(index_path: Path, reviewers: list[str], high_risk: set[str]) -> dict[str, Any]:
    index_path, source, index_digest, _ = load_json_with_digest(index_path, "source frame index")
    frames = source.get("frames", [])
    if not isinstance(frames, list) or not frames:
        raise ValueError("frame index must contain a non-empty frames array")
    indexes = [frame.get("index") for frame in frames]
    if indexes != list(range(len(frames))):
        raise ValueError("frame indexes must be unique, contiguous, ordered, and zero-based")
    if len(reviewers) != len(set(reviewers)):
        raise ValueError("reviewer identities must be unique")
    high_risk_present = any(frame.get("chapter") in high_risk for frame in frames)
    if high_risk_present and len(reviewers) < 2:
        raise ValueError("at least two distinct reviewers are required for high-risk frames")
    campaign_dir = index_path.parent
    for frame in frames:
        frame_path = lexical_absolute(campaign_dir / frame["path"])
        if campaign_dir not in frame_path.parents:
            raise ValueError(f'frame {frame["index"]} resolves outside the campaign directory')
        frame_path, frame_data, _ = read_regular_nofollow(frame_path, f'frame {frame["index"]}')
        png_width, png_height = validate_png_bytes(frame_data, frame_path)
        if frame.get("width") != png_width or frame.get("height") != png_height:
            raise ValueError(f'frame {frame["index"]} declared dimensions differ from its PNG IHDR')
        actual_hash = hashlib.sha256(frame_data).hexdigest()
        if frame.get("sha256") != actual_hash:
            raise ValueError(f'frame {frame["index"]} hash mismatch')
    assignments = split_ranges(len(frames), reviewers)
    second = reviewers[1:] + reviewers[:1]
    rows = []
    for frame in frames:
        first = next((item["reviewer"] for item in assignments if item["start"] <= frame["index"] <= item["end"]), "unassigned-reviewer")
        required = 2 if frame.get("chapter") in high_risk else 1
        assigned = [first]
        # Keep a distinct secondary reviewer available for any ordinary frame
        # that later becomes a defect span. Discovery raises its required count
        # to two without requiring the evidence campaign to be regenerated.
        if len(reviewers) >= 2:
            candidate = second[reviewers.index(first)]
            assigned.append(candidate)
        rows.append({
            "index": frame["index"], "path": frame["path"], "sha256": frame.get("sha256"),
            "chapter": frame.get("chapter"), "elapsed_ms": frame.get("elapsed_ms"),
            "width": frame.get("width"), "height": frame.get("height"),
            "base_required_review_count": required, "required_review_count": required,
            "assigned_reviewers": assigned,
            "reviews": [], "status": "pending"
        })
    covered = [index for assignment in assignments for index in range(assignment["start"], assignment["end"] + 1)]
    partition_exact_once = sorted(covered) == list(range(len(rows))) and len(covered) == len(set(covered))
    high_risk_distinct = all(
        row["base_required_review_count"] == 1
        or (len(row["assigned_reviewers"]) >= 2 and len(set(row["assigned_reviewers"])) == len(row["assigned_reviewers"]))
        for row in rows
    )
    if not partition_exact_once:
        raise ValueError("ordinary reviewer ranges do not partition frames exactly once")
    if not high_risk_distinct:
        raise ValueError("a high-risk frame does not have two distinct reviewer assignments")
    ledger = {
        "schema_id": SCHEMA, "created_at_utc": utc_now(),
        "source_frame_index": str(index_path),
        "source_frame_index_sha256": index_digest,
        "campaign_dir": str(campaign_dir),
        "evidence_boundary": "Assignments are not completed review evidence. Review coverage and defect closure are independent. Each completed review must attest inspection of the full-resolution source frame.",
        "high_risk_chapters": sorted(high_risk), "assignments": assignments,
        "assignment_validation": {
            "ordinary_ranges_partition_exactly_once": partition_exact_once,
            "high_risk_frames_have_two_distinct_reviewers": high_risk_distinct
        },
        "review_surfaces": [],
        "contact_sheet_index": None,
        "multi_view_indexes": [],
        "finding_sources": [],
        "finding_disposition_receipts": [],
        "primary_review_receipts": [],
        "findings": [],
        "frames": rows,
        "summary": {
            "frames": len(rows), "pending": len(rows), "partial": 0, "complete": 0,
            "high_risk_frames": sum(row["base_required_review_count"] == 2 for row in rows),
            "defect_span_frames": 0, "finding_count": 0, "unresolved_findings": 0
        }
    }
    return ledger


def render_review_html(ledger: dict[str, Any], out: Path, campaign_dir: Path) -> None:
    cards = []
    for row in ledger["frames"]:
        frame = campaign_dir / row["path"]
        rel = frame.resolve().as_uri()
        cards.append(
            f'<article id="frame-{row["index"]}"><header>#{row["index"]:07d} · {html.escape(str(row.get("chapter")))} · '
            f'{row.get("elapsed_ms")} ms</header><a href="{rel}"><img loading="lazy" src="{rel}" '
            f'alt="Full source frame {row["index"]}"></a><pre>{html.escape(json.dumps(row, indent=2))}</pre></article>'
        )
    document = f"""<!doctype html><meta charset="utf-8"><title>PMConcept7 full-frame review</title>
<style>body{{margin:0;background:#11151d;color:#e9edf5;font:14px system-ui}}nav{{position:sticky;top:0;padding:12px;background:#161c28;z-index:2}}article{{padding:18px;border-bottom:1px solid #394255}}header{{font-weight:700;margin-bottom:10px}}img{{display:block;max-width:none;width:auto;height:auto;border:1px solid #667085;background:#000}}pre{{white-space:pre-wrap;color:#b9c2d3}}</style>
<nav>Static assignment navigation · {len(cards)} frames · click any frame for its original PNG · current completion and findings live only in the ledger and terminal receipt</nav>{''.join(cards)}"""
    out.write_text(document, encoding="utf-8")


def render_contact_sheets(ledger: dict[str, Any], sheet_dir: Path, campaign_dir: Path, chrome: str | None) -> dict[str, Any]:
    sheet_dir.mkdir(parents=True, exist_ok=True)
    frames = ledger["frames"]
    # Every source frame appears once across the twelve-view navigation sheets;
    # completion still requires opening every retained source PNG at full size.
    per_sheet = 12
    sheets = []
    for offset in range(0, len(frames), per_sheet):
        group = frames[offset:offset + per_sheet]
        cards = []
        for row in group:
            uri = (campaign_dir / row["path"]).resolve().as_uri()
            cards.append(f'<figure><img src="{uri}"><figcaption>#{row["index"]} · {html.escape(str(row.get("chapter")))} · {row.get("elapsed_ms")}ms</figcaption></figure>')
        number = offset // per_sheet + 1
        html_path = sheet_dir / f"contact-sheet-{number:04d}.html"
        html_path.write_text(
            '<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:14px;background:#11151d;color:#eef2fa;font:12px system-ui}.grid{display:grid;grid-template-columns:repeat(4,340px);gap:10px}figure{margin:0;padding:6px;background:#1b2230;border:1px solid #3a465d}img{display:block;width:326px;height:204px;object-fit:contain;background:#000}figcaption{padding-top:5px;white-space:nowrap;overflow:hidden}</style><div class="grid">' + ''.join(cards) + '</div>',
            encoding="utf-8"
        )
        row = {
            "surface_id": f"contact-sheet-{number:04d}", "kind": "contact_sheet",
            "html": html_path.name, "html_sha256": sha256(html_path),
            "first_frame": group[0]["index"], "last_frame": group[-1]["index"],
            "frame_indexes": [item["index"] for item in group], "png": None,
            "png_sha256": None
        }
        if chrome:
            png_path = html_path.with_suffix(".png")
            run = subprocess.run([
                chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                "--window-size=1400,780", f"--screenshot={png_path}", html_path.resolve().as_uri()
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            row.update({"png": png_path.name if run.returncode == 0 and png_path.exists() else None,
                        "png_sha256": sha256(png_path) if run.returncode == 0 and png_path.exists() else None,
                        "chrome_exit": run.returncode})
        row["surface_sha256"] = canonical_sha256({
            "surface_id": row["surface_id"], "kind": row["kind"],
            "frame_indexes": row["frame_indexes"], "html_sha256": row["html_sha256"],
            "png_sha256": row["png_sha256"]
        })
        sheets.append(row)
    covered = [index for sheet in sheets for index in sheet["frame_indexes"]]
    exact_coverage = covered == [row["index"] for row in frames]
    if not exact_coverage:
        raise ValueError("contact sheets do not cover every frame exactly once")
    stable_set = [{
        "surface_id": row["surface_id"], "kind": row["kind"], "frame_indexes": row["frame_indexes"],
        "html_sha256": row["html_sha256"], "png_sha256": row["png_sha256"],
        "surface_sha256": row["surface_sha256"]
    } for row in sheets]
    index = {
        "schema_id": CONTACT_INDEX_SCHEMA,
        "navigation_only": True,
        "review_completion_requires_primary_receipt": True,
        "all_frames_covered_exactly_once": exact_coverage,
        "deterministic_sheet_set_sha256": canonical_sha256(stable_set),
        "sheets": sheets
    }
    index_path = sheet_dir / "contact-sheet-index.json"
    write_json(index_path, index)
    index["index_path"] = str(index_path.resolve())
    index["index_sha256"] = sha256(index_path)
    return index


def import_multi_view_indexes(paths: list[Path]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    index_records: list[dict[str, Any]] = []
    surfaces: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw_path in paths:
        index_path = lexical_absolute(raw_path)
        index_path, source, index_digest, _ = load_json_with_digest(index_path, "multi-view index")
        if source.get("schema_id") != MULTI_VIEW_INDEX_SCHEMA or not isinstance(source.get("sheets"), list):
            raise ValueError(f"multi-view index has wrong schema or sheets: {index_path}")
        ids_this_index: list[str] = []
        for item in source["sheets"]:
            if not isinstance(item, dict):
                raise ValueError(f"multi-view index contains a non-object sheet: {index_path}")
            surface_id = require_string(item.get("surface_id"), "multi-view surface_id")
            if surface_id in seen:
                raise ValueError(f"duplicate review surface_id: {surface_id}")
            seen.add(surface_id)
            ids_this_index.append(surface_id)
            artifact = resolve_evidence_path(item.get("path"), index_path.parent, f"{surface_id}.path")
            if not artifact.is_file() or sha256(artifact) != item.get("sha256"):
                raise ValueError(f"multi-view artifact is missing or hash-mismatched: {surface_id}")
            surface = {
                "surface_id": surface_id, "kind": "multi_view_sheet",
                "artifact_path": str(artifact), "artifact_sha256": item["sha256"],
                "frame_indexes": item.get("frame_indexes", []),
            }
            surface["surface_sha256"] = canonical_sha256({
                "surface_id": surface_id, "kind": surface["kind"],
                "artifact_sha256": surface["artifact_sha256"],
                "frame_indexes": surface["frame_indexes"]
            })
            surfaces.append(surface)
        index_records.append({
            "path": str(index_path), "sha256": index_digest,
            "surface_ids": ids_this_index
        })
    return index_records, surfaces


def validate_review_surfaces(ledger: dict[str, Any]) -> dict[str, Any]:
    contact_ref = ledger.get("contact_sheet_index")
    if not isinstance(contact_ref, dict):
        raise ValueError("ledger is missing contact-sheet index custody")
    index_path = Path(require_string(contact_ref.get("path"), "contact_sheet_index.path"))
    index_path, index, index_digest, _ = load_json_with_digest(index_path, "contact-sheet index")
    if index_digest != contact_ref.get("sha256"):
        raise ValueError("contact-sheet index is missing or hash-mismatched")
    if index.get("schema_id") != CONTACT_INDEX_SCHEMA:
        raise ValueError("contact-sheet index schema mismatch")
    sheets = index.get("sheets")
    if not isinstance(sheets, list) or not sheets:
        raise ValueError("contact-sheet index has no sheets")
    stable_set = []
    covered: list[int] = []
    for sheet in sheets:
        sheet_id = require_string(sheet.get("surface_id"), "contact-sheet surface_id")
        html_path = resolve_evidence_path(sheet.get("html"), index_path.parent, f"{sheet_id}.html")
        if not html_path.is_file() or sha256(html_path) != sheet.get("html_sha256"):
            raise ValueError(f"contact-sheet HTML is missing or hash-mismatched: {sheet_id}")
        png_hash = sheet.get("png_sha256")
        if sheet.get("png") is not None:
            png_path = resolve_evidence_path(sheet.get("png"), index_path.parent, f"{sheet_id}.png")
            if not png_path.is_file() or sha256(png_path) != png_hash:
                raise ValueError(f"contact-sheet PNG is missing or hash-mismatched: {sheet_id}")
        expected_surface_hash = canonical_sha256({
            "surface_id": sheet_id, "kind": "contact_sheet",
            "frame_indexes": sheet.get("frame_indexes"), "html_sha256": sheet.get("html_sha256"),
            "png_sha256": png_hash
        })
        if sheet.get("surface_sha256") != expected_surface_hash:
            raise ValueError(f"contact-sheet surface hash drift: {sheet_id}")
        stable_set.append({
            "surface_id": sheet_id, "kind": "contact_sheet", "frame_indexes": sheet.get("frame_indexes"),
            "html_sha256": sheet.get("html_sha256"), "png_sha256": png_hash,
            "surface_sha256": expected_surface_hash
        })
        covered.extend(sheet.get("frame_indexes", []))
    frame_indexes = [row["index"] for row in ledger["frames"]]
    if covered != frame_indexes or len(covered) != len(set(covered)):
        raise ValueError("contact sheets no longer cover every frame exactly once")
    set_hash = canonical_sha256(stable_set)
    if index.get("deterministic_sheet_set_sha256") != set_hash:
        raise ValueError("deterministic contact-sheet set hash drift")
    for record in ledger.get("multi_view_indexes", []):
        Path(require_string(record.get("path"), "multi_view_index.path"))
    multi_paths = [Path(record["path"]) for record in ledger.get("multi_view_indexes", [])]
    rebuilt_indexes, rebuilt_surfaces = import_multi_view_indexes(multi_paths)
    if rebuilt_indexes != ledger.get("multi_view_indexes", []):
        raise ValueError("multi-view index census drift")
    current_multi = [surface for surface in ledger.get("review_surfaces", []) if surface.get("kind") == "multi_view_sheet"]
    if rebuilt_surfaces != current_multi:
        raise ValueError("multi-view review-surface projection drift")
    for surface in ledger.get("review_surfaces", []):
        if surface.get("kind") == "multi_view_sheet":
            artifact_path = Path(require_string(surface.get("artifact_path"), "multi-view artifact path"))
            if not artifact_path.is_file() or sha256(artifact_path) != surface.get("artifact_sha256"):
                raise ValueError(f'multi-view artifact drift: {surface.get("surface_id")}')
            expected_surface_hash = canonical_sha256({
                "surface_id": surface.get("surface_id"), "kind": "multi_view_sheet",
                "artifact_sha256": surface.get("artifact_sha256"),
                "frame_indexes": surface.get("frame_indexes", [])
            })
            if surface.get("surface_sha256") != expected_surface_hash:
                raise ValueError(f'multi-view surface hash drift: {surface.get("surface_id")}')
    projected_contact = [{
        "surface_id": row["surface_id"], "kind": row["kind"],
        "surface_sha256": row["surface_sha256"], "frame_indexes": row["frame_indexes"]
    } for row in sheets]
    projected_all = projected_contact + rebuilt_surfaces
    if projected_all != ledger.get("review_surfaces", []):
        raise ValueError("ledger review-surface census does not exactly match contact and multi-view indexes")
    surface_ids = [row["surface_id"] for row in projected_all]
    if len(surface_ids) != len(set(surface_ids)):
        raise ValueError("review surface IDs are not unique")
    return {
        "surface_count": len(projected_all), "contact_sheet_count": len(sheets),
        "multi_view_sheet_count": len(rebuilt_surfaces), "sheet_set_sha256": set_hash,
        "contact_sheet_index_sha256": index_digest
    }


def validate_sources(ledger: dict[str, Any], rows: list[dict[str, Any]] | None = None) -> None:
    index_path = Path(ledger["source_frame_index"])
    if sha256(index_path) != ledger["source_frame_index_sha256"]:
        raise ValueError("source frame index is missing or changed since assignment")
    campaign_dir = lexical_absolute(Path(ledger["campaign_dir"]))
    for row in rows if rows is not None else ledger["frames"]:
        frame_path = lexical_absolute(campaign_dir / row["path"])
        if campaign_dir not in frame_path.parents:
            raise ValueError(f'source frame {row["index"]} is missing or out of bounds')
        frame_path, frame_data, _ = read_regular_nofollow(frame_path, f'source frame {row["index"]}')
        png_width, png_height = validate_png_bytes(frame_data, frame_path)
        if row.get("width") != png_width or row.get("height") != png_height:
            raise ValueError(f'source frame {row["index"]} declared dimensions differ from its PNG IHDR')
        if hashlib.sha256(frame_data).hexdigest() != row["sha256"]:
            raise ValueError(f'source frame {row["index"]} changed after assignment')


def validate_finding_payload(raw: Any, ledger: dict[str, Any], reporter: str) -> list[dict[str, Any]]:
    if not isinstance(raw, dict) or raw.get("schema_id") != FINDINGS_SCHEMA:
        raise ValueError(f"findings file must be an object with schema_id {FINDINGS_SCHEMA}")
    if raw.get("reviewer") != reporter:
        raise ValueError("findings reviewer must exactly match --mark-reviewed")
    findings = raw.get("findings")
    if not isinstance(findings, list):
        raise ValueError("findings file must contain a findings array")
    frame_map = {row["index"]: row for row in ledger["frames"]}
    seen: set[str] = set()
    normalized: list[dict[str, Any]] = []
    for item in findings:
        if not isinstance(item, dict):
            raise ValueError("each finding must be an object")
        finding_id = require_string(item.get("id"), "finding.id")
        if finding_id in seen:
            raise ValueError(f"duplicate finding id in one file: {finding_id}")
        seen.add(finding_id)
        chapter = require_string(item.get("chapter"), f"{finding_id}.chapter")
        frame_indexes = item.get("frame_indexes")
        if (not isinstance(frame_indexes, list) or not frame_indexes
                or any(not isinstance(index, int) or isinstance(index, bool) for index in frame_indexes)
                or frame_indexes != sorted(set(frame_indexes))):
            raise ValueError(f"{finding_id}.frame_indexes must be a non-empty sorted unique integer array")
        if any(index not in frame_map for index in frame_indexes):
            raise ValueError(f"{finding_id} cites an unknown frame")
        if any(frame_map[index].get("chapter") != chapter for index in frame_indexes):
            raise ValueError(f"{finding_id} chapter does not match every cited frame")
        severity = item.get("severity")
        if severity not in FINDING_SEVERITIES:
            raise ValueError(f"{finding_id}.severity must be one of {sorted(FINDING_SEVERITIES)}")
        evidence = item.get("evidence")
        if not isinstance(evidence, dict):
            raise ValueError(f"{finding_id}.evidence must be an object")
        summary = require_string(evidence.get("summary"), f"{finding_id}.evidence.summary")
        artifact_refs = evidence.get("artifact_refs")
        if (not isinstance(artifact_refs, list) or not artifact_refs
                or any(not isinstance(ref, str) or not ref.strip() for ref in artifact_refs)):
            raise ValueError(f"{finding_id}.evidence.artifact_refs must be a non-empty string array")
        hashes = evidence.get("frame_hashes")
        expected_hashes = [{"index": index, "sha256": frame_map[index]["sha256"]} for index in frame_indexes]
        if hashes != expected_hashes:
            raise ValueError(f"{finding_id}.evidence.frame_hashes must exactly bind every cited source frame")
        if item.get("status") != "unresolved" or item.get("repaired_by") is not None or item.get("replacement_capture") is not None:
            raise ValueError(f"{finding_id} discovery must start unresolved with null repaired_by and replacement_capture")
        normalized.append({
            "id": finding_id, "chapter": chapter, "frame_indexes": frame_indexes,
            "severity": severity, "evidence": {**evidence, "summary": summary},
            "status": "unresolved", "repaired_by": None, "repair_ref": None,
            "replacement_capture": None, "disposition_reason": None,
            "reported_by": reporter, "reported_at_utc": raw.get("reviewed_at_utc"),
        })
    return normalized


def register_findings(ledger: dict[str, Any], findings_path: Path | None, reviewer: str,
                      selected_indexes: set[int]) -> tuple[list[str], str | None]:
    if findings_path is None:
        raise ValueError("every completed review requires an immutable --findings receipt; use an empty findings array when no defects were observed")
    findings_path, raw, source_hash, _ = load_json_with_digest(findings_path, "immutable findings receipt")
    findings = validate_finding_payload(raw, ledger, reviewer)
    existing = {item["id"]: item for item in ledger.get("findings", [])}
    for item in findings:
        if not set(item["frame_indexes"]).issubset(selected_indexes):
            raise ValueError(f'{item["id"]} cites a frame outside the attested review range')
        if item["id"] in existing:
            comparable = {key: existing[item["id"]].get(key) for key in (
                "id", "chapter", "frame_indexes", "severity", "evidence", "reported_by"
            )}
            wanted = {key: item.get(key) for key in comparable}
            if comparable != wanted:
                raise ValueError(f'finding id conflicts with an existing finding: {item["id"]}')
        else:
            ledger.setdefault("findings", []).append(item)
            existing[item["id"]] = item
    source_record = {"path": str(findings_path), "sha256": source_hash, "reviewer": reviewer}
    if source_record not in ledger.setdefault("finding_sources", []):
        ledger["finding_sources"].append(source_record)
    return [item["id"] for item in findings], source_hash


def _replacement_ref(spec: Any, package_dir: Path, label: str, schema_id: str | None = None) -> tuple[Path, Any]:
    if not isinstance(spec, dict):
        raise ValueError(f"{label} must be a file reference")
    path = resolve_evidence_path(spec.get("path"), package_dir, f"{label}.path")
    if path != package_dir and package_dir not in path.parents:
        raise ValueError(f"{label} escapes the replacement package")
    if schema_id:
        path, value, digest, _ = load_json_with_digest(path, label)
        if spec.get("sha256") != digest:
            raise ValueError(f"{label} is missing or hash-mismatched")
        if not isinstance(value, dict) or value.get("schema_id") != schema_id:
            raise ValueError(f"{label} schema mismatch")
    else:
        path, data, _ = read_regular_nofollow(path, label)
        if spec.get("sha256") != hashlib.sha256(data).hexdigest():
            raise ValueError(f"{label} is missing or hash-mismatched")
        value = None
    return path, value


def _validate_replacement_review(ledger_path: Path, expected_index: Path, expected_chapters: str | set[str]) -> dict[str, Any]:
    ledger_path, replacement_ledger, ledger_digest, _ = load_json_with_digest(ledger_path, "replacement review ledger")
    if replacement_ledger.get("schema_id") != SCHEMA:
        raise ValueError("replacement review ledger schema mismatch")
    if lexical_absolute(Path(require_string(replacement_ledger.get("source_frame_index"), "replacement source_frame_index"))) != lexical_absolute(expected_index) or replacement_ledger.get("source_frame_index_sha256") != sha256(expected_index):
        raise ValueError("replacement review ledger is not bound to the package frame index")
    validate_sources(replacement_ledger)
    surface = validate_review_surfaces(replacement_ledger)
    finding_custody = validate_review_and_finding_custody(replacement_ledger)
    primary = validate_primary_review_coverage(replacement_ledger)
    rows = replacement_ledger.get("frames")
    if not isinstance(rows, list) or len(rows) < 2:
        raise ValueError("replacement review requires at least two full-resolution chapter frames")
    allowed_chapters = {expected_chapters} if isinstance(expected_chapters, str) else set(expected_chapters)
    observed_chapters: set[str] = set()
    for row in rows:
        reviews = row.get("reviews") if isinstance(row, dict) else None
        reviewers = {review.get("reviewer") for review in reviews or [] if isinstance(review, dict) and review.get("full_resolution_attested") is True}
        observed_chapters.add(row.get("chapter"))
        if row.get("chapter") not in allowed_chapters or row.get("status") != "complete" or row.get("required_review_count") != 2 or len(reviewers) < 2:
            raise ValueError("every replacement frame requires two distinct completed full-resolution reviews")
    if observed_chapters != allowed_chapters:
        raise ValueError("replacement review omits one or more required chapters")
    if finding_custody.get("unresolved_findings") or primary.get("complete") is not True:
        raise ValueError("replacement review has unresolved findings or incomplete primary review")
    contact_ref = replacement_ledger.get("contact_sheet_index")
    return {
        "ledger_sha256": ledger_digest, "frame_count": len(rows), "surface": surface, "primary": primary,
        "contact_sheet_index_path": str(lexical_absolute(Path(require_string(contact_ref.get("path"), "replacement contact-sheet path")))) if isinstance(contact_ref, dict) else None,
        "contact_sheet_index_sha256": contact_ref.get("sha256") if isinstance(contact_ref, dict) else None,
    }


def _validate_replacement_frame_set(index_path: Path, frame_index: dict[str, Any], *,
                                    artifact_sha: str, denominator_sha: str,
                                    configuration_sha: str, expected_chapters: set[str],
                                    label: str) -> tuple[list[dict[str, Any]], list[Path]]:
    rows = frame_index.get("frames")
    if (frame_index.get("source_sha256") != artifact_sha or frame_index.get("target_fps") != 60
            or frame_index.get("denominator_sha256") != denominator_sha
            or frame_index.get("configuration_sha256") != configuration_sha
            or frame_index.get("full_resolution_census_complete") is not True
            or not isinstance(rows, list) or len(rows) < max(2, len(expected_chapters))):
        raise ValueError(f"{label} frame index is incomplete or stale")
    projected: list[dict[str, Any]] = []
    paths: list[Path] = []
    observed_chapters: set[str] = set()
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or row.get("index") != index or row.get("chapter") not in expected_chapters or row.get("full_resolution") is not True:
            raise ValueError(f"{label} frame {index} has invalid census/chapter/full-resolution binding")
        observed_chapters.add(row["chapter"])
        width, height = row.get("width"), row.get("height")
        viewport_width, viewport_height, dpr = row.get("viewport_width"), row.get("viewport_height"), row.get("device_scale_factor")
        expected_width = round(viewport_width * dpr) if isinstance(viewport_width, (int, float)) and not isinstance(viewport_width, bool) and isinstance(dpr, (int, float)) and not isinstance(dpr, bool) else None
        expected_height = round(viewport_height * dpr) if isinstance(viewport_height, (int, float)) and not isinstance(viewport_height, bool) and isinstance(dpr, (int, float)) and not isinstance(dpr, bool) else None
        if dpr != 1 or width != expected_width or height != expected_height or row.get("expected_width") != expected_width or row.get("expected_height") != expected_height:
            raise ValueError(f"{label} frame {index} is not exact viewport x DPR evidence")
        for key in ("cdp_timestamp_s", "received_monotonic_ms"):
            value = row.get(key)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or (projected and value <= projected[-1][key]):
                raise ValueError(f"{label} frame {index} has invalid or nonmonotonic {key}")
        path = lexical_absolute(index_path.parent / require_string(row.get("path"), f"{label} frame path"))
        if index_path.parent not in path.parents:
            raise ValueError(f"{label} frame {index} escapes its campaign")
        path, data, _ = read_regular_nofollow(path, f"{label} frame {index}")
        if validate_png_bytes(data, path) != (width, height) or hashlib.sha256(data).hexdigest() != row.get("sha256"):
            raise ValueError(f"{label} frame {index} PNG dimensions/hash differ")
        paths.append(path)
        projected.append({key: row.get(key) for key in ("index", "chapter", "width", "height", "viewport_width", "viewport_height", "device_scale_factor", "cdp_timestamp_s", "received_monotonic_ms", "sha256")})
    if observed_chapters != expected_chapters:
        raise ValueError(f"{label} frame census omits required chapters")
    return projected, paths


def validate_replacement_capture(replacement: Any, ledger: dict[str, Any], finding: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(replacement, dict):
        raise ValueError(f'{finding["id"]} repaired disposition requires replacement_capture')
    package_path = resolve_evidence_path(
        replacement.get("package_manifest_path"), Path(ledger["campaign_dir"]),
        f'{finding["id"]}.replacement_capture.package_manifest_path'
    )
    package_path, package, package_digest, _ = load_json_with_digest(package_path, f'{finding["id"]} replacement package manifest')
    if replacement.get("package_manifest_sha256") != package_digest:
        raise ValueError(f'{finding["id"]} replacement package manifest is missing or hash-mismatched')
    if not isinstance(package, dict) or package.get("schema_id") != REPLACEMENT_PACKAGE_SCHEMA:
        raise ValueError(f'{finding["id"]} replacement package schema mismatch')
    package_dir = package_path.parent
    chapter = require_string(replacement.get("chapter"), f'{finding["id"]}.replacement_capture.chapter')
    if chapter != finding["chapter"] or package.get("chapter") != chapter:
        raise ValueError(f'{finding["id"]} replacement chapter must match the defect chapter')
    required_actions = package.get("required_action_ids")
    if not isinstance(required_actions, list) or not required_actions or len(required_actions) != len(set(required_actions)):
        raise ValueError(f'{finding["id"]} replacement package lacks an exact action denominator')
    artifact_sha = require_string(package.get("artifact_sha256"), "replacement artifact_sha256")
    denominator_sha = require_string(package.get("denominator_sha256"), "replacement denominator_sha256")
    configuration_sha = require_string(package.get("configuration_sha256"), "replacement configuration_sha256")
    runner_sha = require_string(package.get("runner_sha256"), "replacement runner_sha256")
    if any(len(value) != 64 or any(char not in "0123456789abcdef" for char in value) for value in (artifact_sha, denominator_sha, configuration_sha, runner_sha)):
        raise ValueError(f'{finding["id"]} replacement provenance hashes are invalid')
    campaign_path, campaign = _replacement_ref(package.get("campaign_report"), package_dir, "replacement campaign report", "pm.pmconcept7.final_capture_campaign.v1")
    frame_index_path, replacement_index = _replacement_ref(package.get("frame_index"), package_dir, "replacement frame index", "pm.capture.delivered_compositor_frame_index.v1")
    scenario_path, scenario = _replacement_ref(package.get("scenario_manifest"), package_dir, "replacement scenario manifest", "pm.capture.scenario_manifest.v1")
    coverage_path, coverage = _replacement_ref(package.get("coverage_manifest"), package_dir, "replacement coverage manifest", "pm.capture.final_campaign_coverage.v1")
    action_path, action_timing = _replacement_ref(package.get("action_timing"), package_dir, "replacement action timing", "pm.capture.action_timing.v1")
    timing_path, timing = _replacement_ref(package.get("timing_report"), package_dir, "replacement timing report", "pm.capture.delivered_frame_timing.v1")
    review_path, _ = _replacement_ref(package.get("review_ledger"), package_dir, "replacement review ledger", SCHEMA)
    contact_path, _ = _replacement_ref(package.get("contact_sheet_index"), package_dir, "replacement contact-sheet index", CONTACT_INDEX_SCHEMA)
    terminal_path, terminal = _replacement_ref(package.get("terminal_review_receipt"), package_dir, "replacement terminal review receipt", TERMINAL_RECEIPT_SCHEMA)
    master_path, _ = _replacement_ref(package.get("ffv1_master"), package_dir, "replacement FFV1 master")
    mp4_path, _ = _replacement_ref(package.get("review_mp4"), package_dir, "replacement review MP4")
    if master_path.suffix.lower() != ".mkv" or mp4_path.suffix.lower() != ".mp4" or not master_path.stat().st_size or not mp4_path.stat().st_size:
        raise ValueError(f'{finding["id"]} replacement media files are missing or use the wrong containers')
    actions = campaign.get("actions")
    chapters = campaign.get("chapters")
    if campaign.get("campaign") != "replacement_chapter" or campaign.get("source_sha256") != artifact_sha or campaign.get("target_fps") != 60 or campaign.get("disposition") != "captured_browser_concept_evidence" or campaign.get("runtime_errors") not in (None, []) or campaign.get("denominator", {}).get("sha256") != denominator_sha or campaign.get("configuration_sha256") != configuration_sha or campaign.get("runner", {}).get("sha256") != runner_sha:
        raise ValueError(f'{finding["id"]} replacement campaign provenance or disposition is invalid')
    if [row.get("id") for row in actions or [] if isinstance(row, dict)] != required_actions or any(row.get("disposition") != "captured" for row in actions or [] if isinstance(row, dict)):
        raise ValueError(f'{finding["id"]} replacement campaign action census is incomplete')
    if not isinstance(chapters, list) or len(chapters) != 1 or chapters[0].get("id") != chapter or chapters[0].get("action_ids") != required_actions or chapters[0].get("coverage_complete") is not True:
        raise ValueError(f'{finding["id"]} replacement campaign is not one complete re-recorded chapter')
    rows = replacement_index.get("frames")
    if replacement_index.get("source_sha256") != artifact_sha or replacement_index.get("target_fps") != 60 or replacement_index.get("denominator_sha256") != denominator_sha or replacement_index.get("configuration_sha256") != configuration_sha or replacement_index.get("full_resolution_census_complete") is not True or not isinstance(rows, list) or len(rows) < 2:
        raise ValueError(f'{finding["id"]} replacement frame index is incomplete or stale')
    actual_bindings = []
    replacement_frame_paths: list[Path] = []
    projected_frames: list[dict[str, Any]] = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or row.get("index") != index or row.get("chapter") != chapter or row.get("full_resolution") is not True:
            raise ValueError(f'{finding["id"]} replacement frame census/chapter/full-resolution binding is invalid')
        width, height = row.get("width"), row.get("height")
        viewport_width, viewport_height, dpr = row.get("viewport_width"), row.get("viewport_height"), row.get("device_scale_factor")
        expected_width = round(viewport_width * dpr) if isinstance(viewport_width, (int, float)) and not isinstance(viewport_width, bool) and isinstance(dpr, (int, float)) and not isinstance(dpr, bool) else None
        expected_height = round(viewport_height * dpr) if isinstance(viewport_height, (int, float)) and not isinstance(viewport_height, bool) and isinstance(dpr, (int, float)) and not isinstance(dpr, bool) else None
        if dpr != 1 or width != expected_width or height != expected_height or row.get("expected_width") != expected_width or row.get("expected_height") != expected_height:
            raise ValueError(f'{finding["id"]} replacement frame {index} is not exact viewport x DPR evidence')
        for key in ("cdp_timestamp_s", "received_monotonic_ms"):
            value = row.get(key)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
                raise ValueError(f'{finding["id"]} replacement frame {index} has invalid {key}')
            if projected_frames and value <= projected_frames[-1][key]:
                raise ValueError(f'{finding["id"]} replacement {key} census is not strictly monotonic')
        frame_path = lexical_absolute(frame_index_path.parent / require_string(row.get("path"), "replacement frame path"))
        if frame_index_path.parent not in frame_path.parents:
            raise ValueError(f'{finding["id"]} replacement frame {index} is missing or out of bounds')
        frame_path, frame_data, _ = read_regular_nofollow(frame_path, f'{finding["id"]} replacement frame {index}')
        png_width, png_height = validate_png_bytes(frame_data, frame_path)
        if png_width != width or png_height != height:
            raise ValueError(f'{finding["id"]} replacement frame {index} declared dimensions differ from its PNG IHDR')
        if row.get("sha256") != hashlib.sha256(frame_data).hexdigest():
            raise ValueError(f'{finding["id"]} replacement frame {index} hash mismatch')
        actual_bindings.append({"index": index, "sha256": row["sha256"]})
        replacement_frame_paths.append(frame_path)
        projected_frames.append({key: row.get(key) for key in ("index", "width", "height", "viewport_width", "viewport_height", "device_scale_factor", "cdp_timestamp_s", "received_monotonic_ms", "sha256")})
    scenario_rows = scenario.get("scenarios")
    if scenario.get("campaign") != "replacement_chapter" or scenario.get("source_sha256") != artifact_sha or scenario.get("denominator_sha256") != denominator_sha or not isinstance(scenario_rows, list) or len(scenario_rows) != 1 or scenario_rows[0].get("id") != chapter or scenario_rows[0].get("required_action_ids") != required_actions:
        raise ValueError(f'{finding["id"]} replacement scenario manifest is incomplete')
    coverage_rows = coverage.get("chapters")
    if coverage.get("campaign") != "replacement_chapter" or coverage.get("source_sha256") != artifact_sha or coverage.get("denominator_sha256") != denominator_sha or coverage.get("observed", {}).get("complete") is not True or not isinstance(coverage_rows, list) or len(coverage_rows) != 1 or coverage_rows[0].get("id") != chapter or coverage_rows[0].get("required_action_ids") != required_actions or coverage_rows[0].get("action_ids") != required_actions or coverage_rows[0].get("coverage_complete") is not True:
        raise ValueError(f'{finding["id"]} replacement coverage manifest is incomplete')
    if action_timing.get("source_sha256") != artifact_sha or action_timing.get("denominator_sha256") != denominator_sha or action_timing.get("actions") != actions:
        raise ValueError(f'{finding["id"]} replacement action timing differs from the campaign')
    if timing.get("source_sha256") != artifact_sha or timing.get("denominator_sha256") != denominator_sha or timing.get("requested_fps") != 60 or timing.get("no_resampling_claim") is not True or timing.get("observations", {}).get("cadence_valid") is not True:
        raise ValueError(f'{finding["id"]} replacement timing/cadence evidence is incomplete')
    review = _validate_replacement_review(review_path, frame_index_path, chapter)
    if review.get("contact_sheet_index_path") != str(contact_path) or review.get("contact_sheet_index_sha256") != sha256(contact_path):
        raise ValueError(f'{finding["id"]} replacement contact-sheet package binding is invalid')
    if terminal.get("disposition") != "complete" or terminal.get("complete") is not True or terminal.get("ledger_sha256") != sha256(review_path) or terminal.get("source_frame_index_sha256") != sha256(frame_index_path) or terminal.get("failures") != []:
        raise ValueError(f'{finding["id"]} replacement terminal review receipt is incomplete or stale')
    rerun_specs = package.get("aggregate_rerun_receipts")
    if not isinstance(rerun_specs, list) or len(rerun_specs) != 2:
        raise ValueError(f'{finding["id"]} replacement requires chapter and aggregate rerun receipts')
    rerun_paths, rerun_campaign_paths, rerun_values, scopes = [], [], [], []
    for index, spec in enumerate(rerun_specs):
        rerun_path, rerun = _replacement_ref(spec, package_dir, f"replacement rerun {index}", AGGREGATE_RERUN_SCHEMA)
        scopes.append(rerun.get("scope")); rerun_paths.append(rerun_path); rerun_values.append(rerun)
        checks = rerun.get("checks")
        chapter_ids = rerun.get("chapter_ids")
        action_ids = rerun.get("action_ids")
        rerun_campaign_path, rerun_campaign = _replacement_ref(
            rerun.get("campaign_report"), package_dir,
            f"replacement rerun {index} campaign report", "pm.pmconcept7.final_capture_campaign.v1"
        )
        rerun_campaign_paths.append(rerun_campaign_path)
        actual_chapter_ids = [row.get("id") for row in rerun_campaign.get("chapters", []) if isinstance(row, dict)]
        actual_action_ids = [row.get("id") for row in rerun_campaign.get("actions", []) if isinstance(row, dict)]
        if rerun.get("status") != "pass" or rerun.get("artifact_sha256") != artifact_sha or rerun.get("denominator_sha256") != denominator_sha or rerun.get("configuration_sha256") != configuration_sha or rerun.get("runner_sha256") != runner_sha or rerun.get("campaign_report_sha256") != sha256(rerun_campaign_path) or rerun.get("chapter") != chapter or not isinstance(chapter_ids, list) or not chapter_ids or len(chapter_ids) != len(set(chapter_ids)) or not isinstance(action_ids, list) or not action_ids or len(action_ids) != len(set(action_ids)) or not isinstance(checks, list) or not checks or any(not isinstance(check, dict) or check.get("pass") is not True for check in checks):
            raise ValueError(f'{finding["id"]} replacement rerun {index} is failed, stale, or empty')
        if (rerun_campaign.get("source_sha256") != artifact_sha
                or rerun_campaign.get("denominator", {}).get("sha256") != denominator_sha
                or rerun_campaign.get("configuration_sha256") != configuration_sha
                or rerun_campaign.get("runner", {}).get("sha256") != runner_sha
                or rerun_campaign.get("target_fps") != 60
                or rerun_campaign.get("no_resampling_claim") is not True
                or rerun_campaign.get("disposition") != "captured_browser_concept_evidence"
                or rerun_campaign.get("runtime_errors") not in (None, [])
                or actual_chapter_ids != chapter_ids or actual_action_ids != action_ids
                or any(row.get("disposition") != "captured" for row in rerun_campaign.get("actions", []) if isinstance(row, dict))):
            raise ValueError(f'{finding["id"]} replacement rerun {index} is not backed by the claimed successful campaign report')
        if rerun.get("scope") == "chapter" and (chapter_ids != [chapter] or action_ids != required_actions):
            raise ValueError(f'{finding["id"]} chapter rerun does not close the exact replacement chapter denominator')
    if scopes != ["chapter", "aggregate"]:
        raise ValueError(f'{finding["id"]} replacement rerun scopes must be chapter then aggregate')
    if rerun_campaign_paths[0] != campaign_path or rerun_campaign_paths[1] == campaign_path or rerun_campaign_paths[1] == rerun_campaign_paths[0]:
        raise ValueError(f'{finding["id"]} aggregate rerun must admit a distinct full-campaign report')
    aggregate = package.get("aggregate_evidence")
    if not isinstance(aggregate, dict):
        raise ValueError(f'{finding["id"]} aggregate rerun requires a complete distinct aggregate evidence package')
    aggregate_campaign_path, aggregate_campaign = _replacement_ref(aggregate.get("campaign_report"), package_dir, "aggregate campaign report", "pm.pmconcept7.final_capture_campaign.v1")
    aggregate_index_path, aggregate_index = _replacement_ref(aggregate.get("frame_index"), package_dir, "aggregate frame index", "pm.capture.delivered_compositor_frame_index.v1")
    aggregate_scenario_path, aggregate_scenario = _replacement_ref(aggregate.get("scenario_manifest"), package_dir, "aggregate scenario manifest", "pm.capture.scenario_manifest.v1")
    aggregate_coverage_path, aggregate_coverage = _replacement_ref(aggregate.get("coverage_manifest"), package_dir, "aggregate coverage manifest", "pm.capture.final_campaign_coverage.v1")
    aggregate_action_path, aggregate_action = _replacement_ref(aggregate.get("action_timing"), package_dir, "aggregate action timing", "pm.capture.action_timing.v1")
    aggregate_timing_path, aggregate_timing = _replacement_ref(aggregate.get("timing_report"), package_dir, "aggregate timing report", "pm.capture.delivered_frame_timing.v1")
    aggregate_review_path, _ = _replacement_ref(aggregate.get("review_ledger"), package_dir, "aggregate review ledger", SCHEMA)
    aggregate_contact_path, _ = _replacement_ref(aggregate.get("contact_sheet_index"), package_dir, "aggregate contact-sheet index", CONTACT_INDEX_SCHEMA)
    aggregate_terminal_path, aggregate_terminal = _replacement_ref(aggregate.get("terminal_review_receipt"), package_dir, "aggregate terminal review receipt", TERMINAL_RECEIPT_SCHEMA)
    aggregate_master_path, _ = _replacement_ref(aggregate.get("ffv1_master"), package_dir, "aggregate FFV1 master")
    aggregate_mp4_path, _ = _replacement_ref(aggregate.get("review_mp4"), package_dir, "aggregate review MP4")
    if aggregate_campaign_path != rerun_campaign_paths[1]:
        raise ValueError(f'{finding["id"]} aggregate evidence campaign differs from the aggregate rerun campaign')
    chapter_paths = {campaign_path, frame_index_path, scenario_path, coverage_path, action_path, timing_path, review_path, contact_path, terminal_path, master_path, mp4_path, *replacement_frame_paths}
    aggregate_core_paths = {aggregate_campaign_path, aggregate_index_path, aggregate_scenario_path, aggregate_coverage_path, aggregate_action_path, aggregate_timing_path, aggregate_review_path, aggregate_contact_path, aggregate_terminal_path, aggregate_master_path, aggregate_mp4_path}
    if len(aggregate_core_paths) != 11 or chapter_paths & aggregate_core_paths:
        raise ValueError(f'{finding["id"]} aggregate evidence must use distinct campaign/frame/media/review artifacts')
    aggregate_chapter_ids = rerun_values[1].get("chapter_ids")
    aggregate_action_ids = rerun_values[1].get("action_ids")
    chapter_rows = aggregate_campaign.get("chapters")
    action_rows = aggregate_campaign.get("actions")
    chapter_map = {row.get("id"): row for row in chapter_rows or [] if isinstance(row, dict)}
    aggregate_configuration = aggregate_campaign.get("configuration")
    aggregate_command = aggregate_campaign.get("command")
    aggregate_media = aggregate_campaign.get("media")
    if (not isinstance(aggregate_configuration, dict)
            or canonical_sha256(aggregate_configuration) != configuration_sha
            or aggregate_configuration.get("target_fps") != 60
            or aggregate_configuration.get("spatial_downscaling") is not False
            or aggregate_configuration.get("denominator_sha256") != denominator_sha
            or not isinstance(aggregate_command, dict) or set(aggregate_command) != {"argv", "cwd"}
            or not isinstance(aggregate_command.get("argv"), list) or not aggregate_command["argv"]
            or not all(isinstance(value, str) and value for value in aggregate_command["argv"])
            or not isinstance(aggregate_command.get("cwd"), str) or not aggregate_command["cwd"]):
        raise ValueError(f'{finding["id"]} aggregate campaign lacks exact producer-shaped configuration/command binding')
    validate_exact_executable_identity(aggregate_campaign.get("browser_identity"), f'{finding["id"]} aggregate browser')
    if (not isinstance(aggregate_media, dict) or aggregate_media.get("disposition") != "encoded"
            or aggregate_media.get("ffv1_master", {}).get("path") != aggregate_master_path.name
            or aggregate_media.get("ffv1_master", {}).get("sha256") != sha256(aggregate_master_path)
            or aggregate_media.get("ffv1_master", {}).get("success") is not True
            or aggregate_media.get("ffv1_master", {}).get("probe_proves_ffv1") is not True
            or aggregate_media.get("review_mp4", {}).get("path") != aggregate_mp4_path.name
            or aggregate_media.get("review_mp4", {}).get("sha256") != sha256(aggregate_mp4_path)
            or aggregate_media.get("review_mp4", {}).get("success") is not True):
        raise ValueError(f'{finding["id"]} aggregate campaign does not bind its distinct media bytes')
    if (aggregate_campaign.get("campaign") != "final" or aggregate_campaign.get("source_sha256") != artifact_sha
            or aggregate_campaign.get("denominator", {}).get("sha256") != denominator_sha
            or aggregate_campaign.get("configuration_sha256") != configuration_sha
            or aggregate_campaign.get("runner", {}).get("sha256") != runner_sha
            or aggregate_campaign.get("target_fps") != 60 or aggregate_campaign.get("no_resampling_claim") is not True
            or aggregate_campaign.get("disposition") != "captured_browser_concept_evidence"
            or aggregate_campaign.get("runtime_errors") not in (None, [])
            or [row.get("id") for row in chapter_rows or [] if isinstance(row, dict)] != aggregate_chapter_ids
            or [row.get("id") for row in action_rows or [] if isinstance(row, dict)] != aggregate_action_ids
            or any(row.get("disposition") != "captured" for row in action_rows or [] if isinstance(row, dict))
            or any(not isinstance(chapter_map.get(chapter_id, {}).get("action_ids"), list)
                   or chapter_map[chapter_id].get("missing_action_ids") != []
                   or chapter_map[chapter_id].get("unexpected_action_ids") != []
                   or chapter_map[chapter_id].get("failed_action_ids") != []
                   or chapter_map[chapter_id].get("coverage_complete") is not True
                   for chapter_id in aggregate_chapter_ids)):
        raise ValueError(f'{finding["id"]} aggregate campaign lacks full producer-shaped chapter/action closure')
    actions_by_chapter = {chapter_id: [row.get("id") for row in action_rows if isinstance(row, dict) and row.get("chapter") == chapter_id] for chapter_id in aggregate_chapter_ids}
    if any(chapter_map[chapter_id].get("action_ids") != actions_by_chapter[chapter_id] for chapter_id in aggregate_chapter_ids):
        raise ValueError(f'{finding["id"]} aggregate campaign chapter/action projection is inconsistent')
    aggregate_frames, aggregate_frame_paths = _validate_replacement_frame_set(
        aggregate_index_path, aggregate_index, artifact_sha=artifact_sha,
        denominator_sha=denominator_sha, configuration_sha=configuration_sha,
        expected_chapters=set(aggregate_chapter_ids), label=f'{finding["id"]} aggregate',
    )
    if chapter_paths & set(aggregate_frame_paths) or len(aggregate_frame_paths) != len(set(aggregate_frame_paths)):
        raise ValueError(f'{finding["id"]} aggregate frame files must be distinct from chapter evidence')
    scenario_rows = aggregate_scenario.get("scenarios")
    if (aggregate_scenario.get("campaign") != "final" or aggregate_scenario.get("source_sha256") != artifact_sha
            or aggregate_scenario.get("denominator_sha256") != denominator_sha
            or aggregate_scenario.get("configuration_sha256") != configuration_sha
            or [row.get("id") for row in scenario_rows or [] if isinstance(row, dict)] != aggregate_chapter_ids
            or any(row.get("required_action_ids") != actions_by_chapter.get(row.get("id")) for row in scenario_rows or [] if isinstance(row, dict))):
        raise ValueError(f'{finding["id"]} aggregate scenario manifest is incomplete')
    coverage_rows = aggregate_coverage.get("chapters")
    if (aggregate_coverage.get("campaign") != "final" or aggregate_coverage.get("source_sha256") != artifact_sha
            or aggregate_coverage.get("denominator_sha256") != denominator_sha
            or aggregate_coverage.get("configuration_sha256") != configuration_sha
            or aggregate_coverage.get("observed", {}).get("complete") is not True
            or [row.get("id") for row in coverage_rows or [] if isinstance(row, dict)] != aggregate_chapter_ids
            or any(row.get("required_action_ids") != actions_by_chapter.get(row.get("id"))
                   or row.get("action_ids") != actions_by_chapter.get(row.get("id"))
                   or row.get("coverage_complete") is not True for row in coverage_rows or [] if isinstance(row, dict))):
        raise ValueError(f'{finding["id"]} aggregate coverage manifest is incomplete')
    if aggregate_action.get("source_sha256") != artifact_sha or aggregate_action.get("denominator_sha256") != denominator_sha or aggregate_action.get("configuration_sha256") != configuration_sha or aggregate_action.get("actions") != action_rows:
        raise ValueError(f'{finding["id"]} aggregate action timing differs from the campaign')
    if aggregate_timing.get("source_sha256") != artifact_sha or aggregate_timing.get("denominator_sha256") != denominator_sha or aggregate_timing.get("configuration_sha256") != configuration_sha or aggregate_timing.get("requested_fps") != 60 or aggregate_timing.get("no_resampling_claim") is not True or aggregate_timing.get("observations", {}).get("cadence_valid") is not True:
        raise ValueError(f'{finding["id"]} aggregate timing/cadence evidence is incomplete')
    aggregate_review = _validate_replacement_review(aggregate_review_path, aggregate_index_path, set(aggregate_chapter_ids))
    if aggregate_review.get("contact_sheet_index_path") != str(aggregate_contact_path) or aggregate_review.get("contact_sheet_index_sha256") != sha256(aggregate_contact_path):
        raise ValueError(f'{finding["id"]} aggregate contact-sheet package binding is invalid')
    if aggregate_terminal.get("disposition") != "complete" or aggregate_terminal.get("complete") is not True or aggregate_terminal.get("ledger_sha256") != aggregate_review["ledger_sha256"] or aggregate_terminal.get("source_frame_index_sha256") != sha256(aggregate_index_path) or aggregate_terminal.get("failures") != []:
        raise ValueError(f'{finding["id"]} aggregate terminal review is incomplete or stale')
    if aggregate_master_path.suffix.lower() != ".mkv" or aggregate_mp4_path.suffix.lower() != ".mp4" or not read_regular_nofollow(aggregate_master_path, "aggregate FFV1 master")[2].st_size or not read_regular_nofollow(aggregate_mp4_path, "aggregate review MP4")[2].st_size:
        raise ValueError(f'{finding["id"]} aggregate media is missing or uses the wrong containers')
    custody_paths = sorted({*chapter_paths, *rerun_paths, *aggregate_core_paths, *aggregate_frame_paths}, key=str)
    return {
        "package_manifest_path": str(package_path), "package_manifest_sha256": sha256(package_path),
        "chapter": chapter, "frame_count": len(rows), "frame_hashes": actual_bindings,
        "required_action_ids": required_actions, "artifact_sha256": artifact_sha,
        "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha,
        "runner_sha256": runner_sha, "review": review,
        "aggregate_rerun_scopes": scopes, "aggregate_rerun_receipts": rerun_values,
        "replacement_frames": projected_frames,
        "ffv1_master": {"path": str(master_path), "sha256": sha256(master_path)},
        "review_mp4": {"path": str(mp4_path), "sha256": sha256(mp4_path)},
        "aggregate_frames": aggregate_frames,
        "aggregate_ffv1_master": {"path": str(aggregate_master_path), "sha256": sha256(aggregate_master_path)},
        "aggregate_review_mp4": {"path": str(aggregate_mp4_path), "sha256": sha256(aggregate_mp4_path)},
        "aggregate_review": aggregate_review,
        "aggregate_campaign": aggregate_campaign,
        "custody_files": [{"path": str(path), "sha256": sha256(path)} for path in custody_paths],
        "admission_status": "admitted_complete_rerecorded_reviewed_chapter_package",
    }


def record_finding_dispositions(ledger_path: Path, dispositions_path: Path) -> dict[str, Any]:
    ledger = load_json(ledger_path)
    validate_sources(ledger)
    dispositions_path, raw, disposition_digest, _ = load_json_with_digest(dispositions_path, "finding disposition receipt")
    if not isinstance(raw, dict) or raw.get("schema_id") != DISPOSITIONS_SCHEMA:
        raise ValueError(f"disposition receipt must use schema_id {DISPOSITIONS_SCHEMA}")
    adjudicator = require_string(raw.get("adjudicator"), "disposition.adjudicator")
    rows = raw.get("dispositions")
    if not isinstance(rows, list) or not rows:
        raise ValueError("disposition receipt must contain a non-empty dispositions array")
    findings = {item["id"]: item for item in ledger.get("findings", [])}
    seen: set[str] = set()
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("each finding disposition must be an object")
        finding_id = require_string(row.get("finding_id"), "disposition.finding_id")
        if finding_id in seen:
            raise ValueError(f"duplicate finding disposition: {finding_id}")
        seen.add(finding_id)
        if finding_id not in findings:
            raise ValueError(f"disposition cites an unknown finding: {finding_id}")
        finding = findings[finding_id]
        if finding.get("status") in FINDING_TERMINAL_STATUSES:
            raise ValueError(f"finding already has a terminal disposition: {finding_id}")
        status = row.get("status")
        if status not in FINDING_TERMINAL_STATUSES:
            raise ValueError(f"{finding_id} disposition status must be repaired or not_a_defect")
        reason = require_string(row.get("disposition_reason"), f"{finding_id}.disposition_reason")
        evidence = row.get("evidence")
        if not isinstance(evidence, dict) or not isinstance(evidence.get("refs"), list) or not evidence["refs"]:
            raise ValueError(f"{finding_id}.evidence.refs must be a non-empty array")
        if any(not isinstance(ref, str) or not ref.strip() for ref in evidence["refs"]):
            raise ValueError(f"{finding_id}.evidence.refs contains an invalid reference")
        if status == "repaired":
            repaired_by = require_string(row.get("repaired_by"), f"{finding_id}.repaired_by")
            repair_ref = require_string(row.get("repair_ref"), f"{finding_id}.repair_ref")
            replacement = validate_replacement_capture(row.get("replacement_capture"), ledger, finding)
        else:
            if row.get("repaired_by") is not None or row.get("repair_ref") is not None or row.get("replacement_capture") is not None:
                raise ValueError(f"{finding_id} not_a_defect disposition must not claim a repair or replacement capture")
            repaired_by, repair_ref, replacement = None, None, None
        finding.update({
            "status": status, "repaired_by": repaired_by, "repair_ref": repair_ref,
            "replacement_capture": replacement, "disposition_reason": reason,
            "disposition_evidence": evidence, "adjudicated_by": adjudicator,
            "adjudicated_at_utc": raw.get("adjudicated_at_utc") or utc_now(),
        })
    receipt = {"path": str(dispositions_path), "sha256": disposition_digest, "finding_ids": sorted(seen)}
    ledger.setdefault("finding_disposition_receipts", []).append(receipt)
    recompute_status(ledger)
    ledger["updated_at_utc"] = utc_now()
    write_json(ledger_path, ledger)
    return {"recorded": len(seen), "finding_ids": sorted(seen), "adjudicator": adjudicator}


def validate_primary_receipt(raw: Any, ledger: dict[str, Any], reviewer: str) -> dict[str, Any]:
    if not isinstance(raw, dict) or raw.get("schema_id") != PRIMARY_REVIEW_SCHEMA:
        raise ValueError(f"primary receipt must use schema_id {PRIMARY_REVIEW_SCHEMA}")
    if raw.get("reviewer") != reviewer or raw.get("reviewer_role") != "primary_integrator":
        raise ValueError("primary receipt reviewer and role must exactly match the primary integrator")
    require_string(raw.get("reviewed_at_utc"), "primary reviewed_at_utc")
    require_string(raw.get("attestation"), "primary attestation")
    surfaces = raw.get("surfaces")
    defects = raw.get("defect_candidates")
    if not isinstance(surfaces, list) or not isinstance(defects, list):
        raise ValueError("primary receipt must contain surfaces and defect_candidates arrays")
    known_surfaces = {item["surface_id"]: item for item in ledger.get("review_surfaces", [])}
    known_findings = {item["id"]: item for item in ledger.get("findings", [])}
    surface_ids: list[str] = []
    finding_ids: list[str] = []
    for item in surfaces:
        if not isinstance(item, dict):
            raise ValueError("each primary surface review must be an object")
        surface_id = require_string(item.get("surface_id"), "primary surface_id")
        if surface_id in surface_ids or surface_id not in known_surfaces:
            raise ValueError(f"primary receipt contains duplicate or unknown surface: {surface_id}")
        if item.get("surface_sha256") != known_surfaces[surface_id]["surface_sha256"]:
            raise ValueError(f"primary receipt surface hash mismatch: {surface_id}")
        if item.get("status") != "reviewed":
            raise ValueError(f"primary surface status must be reviewed: {surface_id}")
        require_string(item.get("observation"), f"{surface_id}.observation")
        surface_ids.append(surface_id)
    for item in defects:
        if not isinstance(item, dict):
            raise ValueError("each primary defect-candidate review must be an object")
        finding_id = require_string(item.get("finding_id"), "primary finding_id")
        if finding_id in finding_ids or finding_id not in known_findings:
            raise ValueError(f"primary receipt contains duplicate or unknown finding: {finding_id}")
        if item.get("status") != "reviewed":
            raise ValueError(f"primary finding status must be reviewed: {finding_id}")
        require_string(item.get("observation"), f"{finding_id}.observation")
        finding_ids.append(finding_id)
    return {"surface_ids": sorted(surface_ids), "finding_ids": sorted(finding_ids)}


def record_primary_review(ledger_path: Path, reviewer: str, receipt_path: Path,
                          primary_review_attested: bool) -> dict[str, Any]:
    if not primary_review_attested:
        raise ValueError("--primary-review-attested is required; the tool cannot infer primary visual inspection")
    ledger = load_json(ledger_path)
    validate_sources(ledger)
    validate_review_surfaces(ledger)
    receipt_path, raw, receipt_digest, _ = load_json_with_digest(receipt_path, "primary review receipt")
    coverage = validate_primary_receipt(raw, ledger, reviewer)
    receipt = {
        "path": str(receipt_path), "sha256": receipt_digest,
        "reviewer": reviewer, **coverage
    }
    if any(item.get("sha256") == receipt["sha256"] for item in ledger.get("primary_review_receipts", [])):
        raise ValueError("primary review receipt is already recorded")
    ledger.setdefault("primary_review_receipts", []).append(receipt)
    ledger["updated_at_utc"] = utc_now()
    write_json(ledger_path, ledger)
    return {"recorded": True, **coverage, "reviewer": reviewer}


def recompute_status(ledger: dict[str, Any]) -> None:
    high_risk = set(ledger.get("high_risk_chapters", []))
    defect_frames = {
        index for finding in ledger.get("findings", [])
        for index in finding.get("frame_indexes", [])
    }
    for row in ledger["frames"]:
        base_expected = 2 if row.get("chapter") in high_risk else 1
        if row.get("base_required_review_count") != base_expected:
            raise ValueError(f'frame {row["index"]} has an invalid base required review count')
        expected = 2 if base_expected == 2 or row["index"] in defect_frames else 1
        row["required_review_count"] = expected
        assigned = row.get("assigned_reviewers", [])
        if len(assigned) < expected or len(set(assigned)) != len(assigned):
            raise ValueError(f'frame {row["index"]} lacks distinct required reviewer assignments')
        review_identities = [item.get("reviewer") for item in row.get("reviews", [])]
        if len(review_identities) != len(set(review_identities)):
            raise ValueError(f'frame {row["index"]} contains duplicate reviewer records')
        if any(identity not in assigned for identity in review_identities):
            raise ValueError(f'frame {row["index"]} contains an unassigned reviewer record')
        if any(item.get("full_resolution_attested") is not True for item in row.get("reviews", [])):
            raise ValueError(f'frame {row["index"]} contains a review without full-resolution attestation')
        valid = {
            item.get("reviewer") for item in row.get("reviews", [])
            if item.get("reviewer") in row["assigned_reviewers"]
            and item.get("full_resolution_attested") is True
        }
        row["status"] = "complete" if len(valid) >= row["required_review_count"] else ("partial" if valid else "pending")
    complete = sum(row["status"] == "complete" for row in ledger["frames"])
    partial = sum(row["status"] == "partial" for row in ledger["frames"])
    pending = sum(row["status"] == "pending" for row in ledger["frames"])
    unresolved = sum(item.get("status") not in FINDING_TERMINAL_STATUSES for item in ledger.get("findings", []))
    ledger["summary"].update({
        "pending": pending, "partial": partial, "complete": complete,
        "defect_span_frames": len(defect_frames), "finding_count": len(ledger.get("findings", [])),
        "unresolved_findings": unresolved
    })


def mark_reviewed(ledger_path: Path, reviewer: str, frame_range: str, findings_path: Path | None, full_resolution_attested: bool) -> dict[str, Any]:
    ledger = load_json(ledger_path)
    if not full_resolution_attested:
        raise ValueError("--full-resolution-attested is required; the tool cannot infer that source PNGs were inspected")
    start_text, end_text = frame_range.split(":", 1)
    start, end = int(start_text), int(end_text)
    if start < 0 or end < start:
        raise ValueError("review range must be non-negative start:end with start <= end")
    reviewed = 0
    selected = [row for row in ledger["frames"] if start <= row["index"] <= end]
    if not selected:
        raise ValueError("review range selects no frames")
    validate_sources(ledger, selected)
    finding_ids, finding_hash = register_findings(
        ledger, findings_path, reviewer, {row["index"] for row in selected}
    )
    # Finding discovery can promote an ordinary span to independent dual review.
    recompute_status(ledger)
    for row in selected:
        if reviewer not in row["assigned_reviewers"]:
            raise ValueError(f'{reviewer} is not assigned frame {row["index"]}')
        if any(item["reviewer"] == reviewer for item in row["reviews"]):
            continue
        row["reviews"].append({
            "reviewer": reviewer, "reviewed_at_utc": utc_now(),
            "attestation": "Inspected the retained source PNG at full resolution.",
            "full_resolution_attested": True,
            "frame_index": row["index"], "frame_sha256": row["sha256"],
            "findings_path": str(lexical_absolute(findings_path)) if findings_path else None,
            "findings_sha256": finding_hash,
            "finding_ids": [finding_id for finding_id in finding_ids if row["index"] in next(
                item["frame_indexes"] for item in ledger["findings"] if item["id"] == finding_id
            )]
        })
        reviewed += 1
    recompute_status(ledger)
    complete = ledger["summary"]["complete"]
    ledger["updated_at_utc"] = utc_now()
    write_json(ledger_path, ledger)
    return {
        "reviewed": reviewed, "coverage_complete_frames": complete,
        "total": len(ledger["frames"]), "findings_registered": finding_ids,
        "defect_closure_complete": ledger["summary"]["unresolved_findings"] == 0
    }


def validate_review_and_finding_custody(ledger: dict[str, Any]) -> dict[str, Any]:
    if ledger.get("schema_id") != SCHEMA:
        raise ValueError(f"review ledger must use schema_id {SCHEMA}")
    findings = {item["id"]: item for item in ledger.get("findings", [])}
    if len(findings) != len(ledger.get("findings", [])):
        raise ValueError("review ledger contains duplicate finding IDs")
    discovered: dict[str, dict[str, Any]] = {}
    for source in ledger.get("finding_sources", []):
        path = Path(require_string(source.get("path"), "finding source path"))
        path, raw_source, source_digest, _ = load_json_with_digest(path, "finding source")
        if source_digest != source.get("sha256"):
            raise ValueError("finding source is missing or hash-mismatched")
        reviewer = require_string(source.get("reviewer"), "finding source reviewer")
        for item in validate_finding_payload(raw_source, ledger, reviewer):
            if item["id"] in discovered:
                comparable = {key: discovered[item["id"]].get(key) for key in (
                    "id", "chapter", "frame_indexes", "severity", "evidence", "reported_by"
                )}
                if comparable != {key: item.get(key) for key in comparable}:
                    raise ValueError(f'conflicting immutable discovery evidence for {item["id"]}')
            discovered[item["id"]] = item
    if set(discovered) != set(findings):
        raise ValueError("ledger findings do not exactly match immutable finding sources")
    for finding_id, source in discovered.items():
        current = findings[finding_id]
        for key in ("id", "chapter", "frame_indexes", "severity", "evidence", "reported_by"):
            if current.get(key) != source.get(key):
                raise ValueError(f"ledger discovery field drift for {finding_id}.{key}")
    disposed: set[str] = set()
    for receipt in ledger.get("finding_disposition_receipts", []):
        path = Path(require_string(receipt.get("path"), "finding disposition path"))
        path, raw, disposition_digest, _ = load_json_with_digest(path, "finding disposition receipt")
        if disposition_digest != receipt.get("sha256"):
            raise ValueError("finding disposition receipt is missing or hash-mismatched")
        if raw.get("schema_id") != DISPOSITIONS_SCHEMA or not isinstance(raw.get("dispositions"), list):
            raise ValueError("finding disposition receipt schema mismatch")
        adjudicator = require_string(raw.get("adjudicator"), "finding disposition adjudicator")
        raw_ids: list[str] = []
        for row in raw["dispositions"]:
            finding_id = require_string(row.get("finding_id"), "disposition.finding_id")
            raw_ids.append(finding_id)
            if finding_id in disposed or finding_id not in findings:
                raise ValueError(f"duplicate or unknown terminal disposition: {finding_id}")
            disposed.add(finding_id)
            current = findings[finding_id]
            status = row.get("status")
            if status not in FINDING_TERMINAL_STATUSES or current.get("status") != status:
                raise ValueError(f"terminal disposition drift for {finding_id}")
            if current.get("disposition_reason") != row.get("disposition_reason"):
                raise ValueError(f"disposition reason drift for {finding_id}")
            if current.get("disposition_evidence") != row.get("evidence") or current.get("adjudicated_by") != adjudicator:
                raise ValueError(f"disposition evidence or adjudicator drift for {finding_id}")
            if status == "repaired":
                replacement = validate_replacement_capture(row.get("replacement_capture"), ledger, current)
                if (current.get("repaired_by") != row.get("repaired_by")
                        or current.get("repair_ref") != row.get("repair_ref")
                        or current.get("replacement_capture") != replacement):
                    raise ValueError(f"repair or admitted replacement-capture drift for {finding_id}")
            elif any(current.get(key) is not None for key in ("repaired_by", "repair_ref", "replacement_capture")):
                raise ValueError(f"not_a_defect finding carries repair claims: {finding_id}")
        if sorted(raw_ids) != receipt.get("finding_ids"):
            raise ValueError("finding-disposition receipt ID census drift")
    for finding_id, finding in findings.items():
        if finding.get("status") in FINDING_TERMINAL_STATUSES and finding_id not in disposed:
            raise ValueError(f"finding has a terminal status without an immutable disposition receipt: {finding_id}")
        if finding.get("status") not in FINDING_TERMINAL_STATUSES and finding_id in disposed:
            raise ValueError(f"finding disposition receipt was not projected into ledger: {finding_id}")
    for frame in ledger.get("frames", []):
        for review in frame.get("reviews", []):
            if review.get("frame_index") != frame["index"] or review.get("frame_sha256") != frame["sha256"]:
                raise ValueError(f'frame review custody drift at frame {frame["index"]}')
            findings_path = review.get("findings_path")
            if findings_path is None:
                raise ValueError(f'frame review lacks a no-finding/finding receipt at frame {frame["index"]}')
            path = Path(findings_path)
            if not path.is_file() or sha256(path) != review.get("findings_sha256"):
                raise ValueError(f'frame review finding source drift at frame {frame["index"]}')
            if any(finding_id not in findings or frame["index"] not in findings[finding_id]["frame_indexes"]
                   for finding_id in review.get("finding_ids", [])):
                raise ValueError(f'frame review finding citation drift at frame {frame["index"]}')
    frame_map = {frame["index"]: frame for frame in ledger.get("frames", [])}
    for finding_id, finding in findings.items():
        for frame_index in finding["frame_indexes"]:
            reporter_reviews = [
                review for review in frame_map[frame_index].get("reviews", [])
                if review.get("reviewer") == finding["reported_by"]
                and finding_id in review.get("finding_ids", [])
                and review.get("full_resolution_attested") is True
            ]
            if len(reporter_reviews) != 1:
                raise ValueError(f"finding {finding_id} lacks one exact reporter review on frame {frame_index}")
    return {
        "finding_count": len(findings),
        "terminal_findings": sum(item.get("status") in FINDING_TERMINAL_STATUSES for item in findings.values()),
        "finding_ids": sorted(findings),
        "repaired_finding_ids": sorted(
            finding_id for finding_id, item in findings.items() if item.get("status") == "repaired"
        ),
        "not_a_defect_finding_ids": sorted(
            finding_id for finding_id, item in findings.items() if item.get("status") == "not_a_defect"
        ),
        "replacement_package_manifest_sha256s": sorted({
            item["replacement_capture"]["package_manifest_sha256"] for item in findings.values()
            if item.get("status") == "repaired" and item.get("replacement_capture")
        }),
        "unresolved_findings": sorted(
            finding_id for finding_id, item in findings.items()
            if item.get("status") not in FINDING_TERMINAL_STATUSES
        )
    }


def validate_primary_review_coverage(ledger: dict[str, Any]) -> dict[str, Any]:
    known_surfaces = {item["surface_id"] for item in ledger.get("review_surfaces", [])}
    known_findings = {item["id"] for item in ledger.get("findings", [])}
    reviewed_surfaces: set[str] = set()
    reviewed_findings: set[str] = set()
    primary_reviewers: set[str] = set()
    for receipt in ledger.get("primary_review_receipts", []):
        path = Path(require_string(receipt.get("path"), "primary receipt path"))
        path, raw, primary_digest, _ = load_json_with_digest(path, "primary review receipt")
        if primary_digest != receipt.get("sha256"):
            raise ValueError("primary review receipt is missing or hash-mismatched")
        reviewer = require_string(receipt.get("reviewer"), "primary receipt reviewer")
        coverage = validate_primary_receipt(raw, ledger, reviewer)
        if coverage["surface_ids"] != receipt.get("surface_ids") or coverage["finding_ids"] != receipt.get("finding_ids"):
            raise ValueError("primary review receipt projection drift")
        primary_reviewers.add(reviewer)
        reviewed_surfaces.update(coverage["surface_ids"])
        reviewed_findings.update(coverage["finding_ids"])
    missing_surfaces = sorted(known_surfaces - reviewed_surfaces)
    missing_findings = sorted(known_findings - reviewed_findings)
    return {
        "complete": not missing_surfaces and not missing_findings and bool(known_surfaces),
        "primary_reviewers": sorted(primary_reviewers),
        "surface_total": len(known_surfaces), "surface_reviewed": len(reviewed_surfaces),
        "finding_total": len(known_findings), "finding_reviewed": len(reviewed_findings),
        "missing_surface_ids": missing_surfaces, "missing_finding_ids": missing_findings
    }


def check_complete(ledger_path: Path, terminal_receipt_path: Path | None = None, emit: bool = True) -> int:
    receipt_path = lexical_absolute(terminal_receipt_path or ledger_path.parent / "terminal-review-receipt.json")
    failures: list[dict[str, str]] = []
    ledger: dict[str, Any] = {}
    surface_result: dict[str, Any] = {"complete": False}
    finding_result: dict[str, Any] = {
        "finding_count": 0, "terminal_findings": 0, "finding_ids": [],
        "repaired_finding_ids": [], "not_a_defect_finding_ids": [],
        "replacement_package_manifest_sha256s": [], "unresolved_findings": []
    }
    primary_result: dict[str, Any] = {"complete": False, "missing_surface_ids": [], "missing_finding_ids": []}
    source_integrity = False
    ledger_digest: str | None = None
    try:
        ledger_path, ledger, ledger_digest, _ = load_json_with_digest(ledger_path, "review ledger")
        validate_sources(ledger)
        source_integrity = True
    except Exception as error:
        failures.append({"code": "source_frame_integrity_failed", "message": str(error)})
    if ledger:
        try:
            surface_result = {"complete": True, **validate_review_surfaces(ledger)}
        except Exception as error:
            failures.append({"code": "review_surface_integrity_failed", "message": str(error)})
        try:
            finding_result = validate_review_and_finding_custody(ledger)
        except Exception as error:
            failures.append({"code": "finding_custody_or_closure_invalid", "message": str(error)})
        try:
            recompute_status(ledger)
        except Exception as error:
            failures.append({"code": "review_coverage_invalid", "message": str(error)})
        try:
            primary_result = validate_primary_review_coverage(ledger)
        except Exception as error:
            failures.append({"code": "primary_review_invalid", "message": str(error)})
    frames = ledger.get("frames", []) if isinstance(ledger, dict) else []
    incomplete = [row.get("index") for row in frames if row.get("status") != "complete"]
    coverage_complete = bool(frames) and not incomplete and not any(item["code"] == "review_coverage_invalid" for item in failures)
    unresolved = finding_result.get("unresolved_findings", [])
    defect_closure_complete = not unresolved and not any(
        item["code"] == "finding_custody_or_closure_invalid" for item in failures
    )
    if not coverage_complete:
        failures.append({"code": "full_resolution_review_coverage_incomplete", "message": f"{len(incomplete)} frames are incomplete"})
    if not defect_closure_complete:
        failures.append({"code": "defect_closure_incomplete", "message": f"unresolved findings: {unresolved[:20]}"})
    if not primary_result.get("complete"):
        failures.append({"code": "primary_integrator_review_incomplete", "message": "one or more contact/multi-view sheets or defect candidates lack primary review"})
    complete = (
        source_integrity and surface_result.get("complete") is True and coverage_complete
        and defect_closure_complete and primary_result.get("complete") is True and not failures
    )
    receipt = {
        "schema_id": TERMINAL_RECEIPT_SCHEMA,
        "generated_at_utc": utc_now(),
        "disposition": "complete" if complete else "incomplete",
        "complete": complete,
        "ledger_path": str(lexical_absolute(ledger_path)),
        "ledger_sha256": ledger_digest,
        "source_frame_index_sha256": ledger.get("source_frame_index_sha256") if ledger else None,
        "evidence_boundary": "Browser-concept full-frame review only. Coverage does not imply defect closure, native Slint certification, or production-runtime readiness.",
        "source_integrity": {"complete": source_integrity},
        "review_surface_integrity": surface_result,
        "review_coverage": {
            "complete": coverage_complete, "frame_total": len(frames),
            "frame_complete": len(frames) - len(incomplete), "incomplete_count": len(incomplete),
            "first_incomplete": incomplete[:20],
            "high_risk_frames": sum(row.get("base_required_review_count") == 2 for row in frames),
            "defect_span_frames": ledger.get("summary", {}).get("defect_span_frames", 0) if ledger else 0,
        },
        "defect_closure": {"complete": defect_closure_complete, **finding_result},
        "primary_integrator_review": primary_result,
        "failures": failures,
    }
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    write_json(receipt_path, receipt)
    if emit:
        print(json.dumps({**receipt, "terminal_receipt": str(receipt_path)}, indent=2))
    return 0 if complete else 1


def run_self_test() -> dict[str, Any]:
    png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    with tempfile.TemporaryDirectory(prefix="pm7-frame-review-selftest-") as temp_raw:
        root = Path(temp_raw)
        campaign = root / "campaign"
        campaign.mkdir()
        frames = []
        for index, chapter in enumerate(("ordinary", "onboarding", "onboarding")):
            path = campaign / f"frame-{index:03d}.png"
            path.write_bytes(png + bytes([index]))
            frames.append({
                "index": index, "path": path.name, "sha256": sha256(path),
                "chapter": chapter, "elapsed_ms": index * 16.7,
                "width": 1, "height": 1
            })
        frame_index = campaign / "frame-index.json"
        write_json(frame_index, {"schema_id": "pm.capture.delivered_compositor_frame_index.v1", "frames": frames})
        review_dir = root / "review"
        review_dir.mkdir()
        ledger_path = review_dir / "review-ledger.json"
        ledger = build_ledger(frame_index, ["fixture-reviewer-a", "fixture-reviewer-b"], HIGH_RISK_DEFAULT)
        render_review_html(ledger, review_dir / "full-frame-review.html", campaign)
        contact = render_contact_sheets(ledger, review_dir / "contact-sheets", campaign, None)
        ledger["contact_sheet_index"] = {"path": contact["index_path"], "sha256": contact["index_sha256"]}
        ledger["review_surfaces"] = [{
            "surface_id": row["surface_id"], "kind": row["kind"],
            "surface_sha256": row["surface_sha256"], "frame_indexes": row["frame_indexes"]
        } for row in contact["sheets"]]
        write_json(ledger_path, ledger)
        if check_complete(ledger_path, review_dir / "terminal-incomplete.json", emit=False) != 1:
            raise AssertionError("incomplete fixture unexpectedly passed")
        finding_path = root / "findings-a.json"
        write_json(finding_path, {
            "schema_id": FINDINGS_SCHEMA, "reviewer": "fixture-reviewer-a", "reviewed_at_utc": utc_now(),
            "findings": [{
                "id": "FIXTURE-DEFECT-001", "chapter": "ordinary", "frame_indexes": [0],
                "severity": "minor", "evidence": {
                    "summary": "Synthetic defect used only by the isolated verifier self-test.",
                    "frame_hashes": [{"index": 0, "sha256": frames[0]["sha256"]}],
                    "artifact_refs": ["fixture://frame-0"]
                },
                "status": "unresolved", "repaired_by": None, "replacement_capture": None
            }]
        })
        mark_reviewed(ledger_path, "fixture-reviewer-a", "0:2", finding_path, True)
        no_findings_path = root / "findings-b-none.json"
        write_json(no_findings_path, {
            "schema_id": FINDINGS_SCHEMA, "reviewer": "fixture-reviewer-b",
            "reviewed_at_utc": utc_now(), "findings": []
        })
        mark_reviewed(ledger_path, "fixture-reviewer-b", "0:2", no_findings_path, True)
        unresolved_receipt_path = review_dir / "terminal-unresolved.json"
        if check_complete(ledger_path, unresolved_receipt_path, emit=False) != 1:
            raise AssertionError("unresolved finding fixture unexpectedly passed")
        unresolved_receipt = load_json(unresolved_receipt_path)
        if unresolved_receipt["review_coverage"]["complete"] is not True or unresolved_receipt["defect_closure"]["complete"] is not False:
            raise AssertionError("coverage and defect closure were not kept independent")
        tampered_path = review_dir / "tampered-missing-replacement-ledger.json"
        tampered = load_json(ledger_path)
        tampered["findings"][0]["status"] = "repaired"
        write_json(tampered_path, tampered)
        if check_complete(tampered_path, review_dir / "terminal-missing-replacement.json", emit=False) != 1:
            raise AssertionError("repaired-without-replacement fixture unexpectedly passed")
        replacement = root / "replacement"
        replacement_frames = replacement / "frames"
        replacement_review = replacement / "review"
        replacement_frames.mkdir(parents=True)
        replacement_review.mkdir()
        artifact_sha, denominator_sha, runner_sha = "a" * 64, "b" * 64, "d" * 64
        replacement_configuration = {"schema_id": "pm.capture.final_campaign_configuration.v1", "campaign": "final", "target_fps": 60, "spatial_downscaling": False, "denominator_sha256": denominator_sha}
        configuration_sha = canonical_sha256(replacement_configuration)
        required_actions = ["ordinary-repair-start", "ordinary-repair-settle"]
        replacement_rows = []
        for index in range(2):
            path = replacement_frames / f"replacement-{index:03d}.png"
            path.write_bytes(png + b"replacement" + bytes([index]))
            replacement_rows.append({
                "index": index, "path": f"frames/{path.name}", "sha256": sha256(path),
                "chapter": "ordinary", "elapsed_ms": index * 16.667,
                "received_monotonic_ms": index * 16.667, "cdp_timestamp_s": index / 60,
                "width": 1, "height": 1, "viewport_width": 1, "viewport_height": 1,
                "device_scale_factor": 1, "expected_width": 1, "expected_height": 1,
                "full_resolution": True,
            })
        replacement_index = replacement / "frame-index.json"
        write_json(replacement_index, {
            "schema_id": "pm.capture.delivered_compositor_frame_index.v1",
            "source_sha256": artifact_sha, "target_fps": 60,
            "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha,
            "full_resolution_census_complete": True, "frames": replacement_rows,
        })
        replacement_campaign = replacement / "campaign-report.json"
        replacement_actions = [{"id": action_id, "chapter": "ordinary", "disposition": "captured"} for action_id in required_actions]
        write_json(replacement_campaign, {
            "schema_id": "pm.pmconcept7.final_capture_campaign.v1", "campaign": "replacement_chapter",
            "source_sha256": artifact_sha, "target_fps": 60, "disposition": "captured_browser_concept_evidence",
            "no_resampling_claim": True,
            "runtime_errors": [], "denominator": {"sha256": denominator_sha},
            "configuration_sha256": configuration_sha, "runner": {"sha256": runner_sha},
            "actions": replacement_actions,
            "chapters": [{"id": "ordinary", "action_ids": required_actions, "coverage_complete": True}],
        })
        replacement_scenario = replacement / "scenario-manifest.json"
        write_json(replacement_scenario, {
            "schema_id": "pm.capture.scenario_manifest.v1", "campaign": "replacement_chapter",
            "source_sha256": artifact_sha, "denominator_sha256": denominator_sha,
            "scenarios": [{"id": "ordinary", "required_action_ids": required_actions}],
        })
        replacement_coverage = replacement / "coverage-manifest.json"
        write_json(replacement_coverage, {
            "schema_id": "pm.capture.final_campaign_coverage.v1", "campaign": "replacement_chapter",
            "source_sha256": artifact_sha, "denominator_sha256": denominator_sha,
            "observed": {"complete": True},
            "chapters": [{"id": "ordinary", "required_action_ids": required_actions, "action_ids": required_actions, "coverage_complete": True}],
        })
        replacement_action = replacement / "action-timing.json"
        write_json(replacement_action, {"schema_id": "pm.capture.action_timing.v1", "source_sha256": artifact_sha, "denominator_sha256": denominator_sha, "actions": replacement_actions})
        replacement_timing = replacement / "timing-report.json"
        write_json(replacement_timing, {"schema_id": "pm.capture.delivered_frame_timing.v1", "source_sha256": artifact_sha, "denominator_sha256": denominator_sha, "requested_fps": 60, "no_resampling_claim": True, "observations": {"cadence_valid": True}})
        replacement_master = replacement / "replacement-ffv1.mkv"; replacement_master.write_bytes(b"synthetic media custody; aggregate gate performs codec proof")
        replacement_mp4 = replacement / "replacement-review.mp4"; replacement_mp4.write_bytes(b"synthetic media custody; aggregate gate performs codec proof")
        replacement_ledger_path = replacement_review / "review-ledger.json"
        replacement_ledger = build_ledger(replacement_index, ["replacement-a", "replacement-b"], {"ordinary"})
        render_review_html(replacement_ledger, replacement_review / "full-frame-review.html", replacement)
        replacement_contact = render_contact_sheets(replacement_ledger, replacement_review / "contact-sheets", replacement, None)
        replacement_ledger["contact_sheet_index"] = {"path": replacement_contact["index_path"], "sha256": replacement_contact["index_sha256"]}
        replacement_ledger["review_surfaces"] = [{
            "surface_id": row["surface_id"], "kind": row["kind"],
            "surface_sha256": row["surface_sha256"], "frame_indexes": row["frame_indexes"]
        } for row in replacement_contact["sheets"]]
        write_json(replacement_ledger_path, replacement_ledger)
        for reviewer in ("replacement-a", "replacement-b"):
            empty_path = replacement_review / f"findings-{reviewer}.json"
            write_json(empty_path, {"schema_id": FINDINGS_SCHEMA, "reviewer": reviewer, "reviewed_at_utc": utc_now(), "findings": []})
            mark_reviewed(replacement_ledger_path, reviewer, "0:1", empty_path, True)
        current_replacement = load_json(replacement_ledger_path)
        replacement_primary_path = replacement_review / "primary.json"
        write_json(replacement_primary_path, {
            "schema_id": PRIMARY_REVIEW_SCHEMA, "reviewer": "replacement-primary", "reviewer_role": "primary_integrator",
            "reviewed_at_utc": utc_now(), "attestation": "Synthetic replacement primary-review validator exercise.",
            "surfaces": [{"surface_id": row["surface_id"], "surface_sha256": row["surface_sha256"], "status": "reviewed", "observation": "Synthetic replacement surface review."} for row in current_replacement["review_surfaces"]],
            "defect_candidates": [],
        })
        record_primary_review(replacement_ledger_path, "replacement-primary", replacement_primary_path, True)
        replacement_terminal = replacement_review / "terminal-review-receipt.json"
        if check_complete(replacement_ledger_path, replacement_terminal, emit=False) != 0:
            raise AssertionError("complete replacement review did not pass")
        aggregate_campaign = replacement / "aggregate-campaign-report.json"
        aggregate_chapter_ids = ["ordinary", "aggregate-fixture-other"]
        aggregate_action_ids = [*required_actions, "aggregate-fixture-other-action"]
        aggregate_actions = [
            {"serial": index + 1, "id": action_id, "chapter": "ordinary" if action_id in required_actions else "aggregate-fixture-other", "disposition": "captured", "started_ms": index * 10, "finished_ms": index * 10 + 1, "elapsed_ms": 1}
            for index, action_id in enumerate(aggregate_action_ids)
        ]
        aggregate_action_map = {
            chapter_id: [row["id"] for row in aggregate_actions if row["chapter"] == chapter_id]
            for chapter_id in aggregate_chapter_ids
        }
        write_json(aggregate_campaign, {
            "schema_id": "pm.pmconcept7.final_capture_campaign.v1", "campaign": "final",
            "source_sha256": artifact_sha, "target_fps": 60, "no_resampling_claim": True,
            "disposition": "captured_browser_concept_evidence", "runtime_errors": [],
            "denominator": {"sha256": denominator_sha}, "configuration_sha256": configuration_sha,
            "runner": {"sha256": runner_sha},
            "chapters": [{"id": value, "required_action_ids": aggregate_action_map[value], "action_ids": aggregate_action_map[value], "missing_action_ids": [], "unexpected_action_ids": [], "failed_action_ids": [], "coverage_complete": True} for value in aggregate_chapter_ids],
            "actions": aggregate_actions,
        })
        aggregate_frames_dir = replacement / "aggregate-frames"; aggregate_frames_dir.mkdir()
        aggregate_rows = []
        for index, chapter_id in enumerate(aggregate_chapter_ids):
            path = aggregate_frames_dir / f"aggregate-{index:03d}.png"
            path.write_bytes(png + b"aggregate" + bytes([index]))
            aggregate_rows.append({
                "index": index, "path": f"aggregate-frames/{path.name}", "sha256": sha256(path),
                "chapter": chapter_id, "elapsed_ms": index * 16.667,
                "received_monotonic_ms": index * 16.667, "cdp_timestamp_s": index / 60,
                "width": 1, "height": 1, "viewport_width": 1, "viewport_height": 1,
                "device_scale_factor": 1, "expected_width": 1, "expected_height": 1,
                "full_resolution": True,
            })
        aggregate_index = replacement / "aggregate-frame-index.json"
        write_json(aggregate_index, {"schema_id": "pm.capture.delivered_compositor_frame_index.v1", "source_sha256": artifact_sha, "target_fps": 60, "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha, "full_resolution_census_complete": True, "frames": aggregate_rows})
        aggregate_scenario = replacement / "aggregate-scenario-manifest.json"
        write_json(aggregate_scenario, {"schema_id": "pm.capture.scenario_manifest.v1", "campaign": "final", "source_sha256": artifact_sha, "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha, "scenarios": [{"id": value, "required_action_ids": aggregate_action_map[value]} for value in aggregate_chapter_ids]})
        aggregate_coverage = replacement / "aggregate-coverage-manifest.json"
        write_json(aggregate_coverage, {"schema_id": "pm.capture.final_campaign_coverage.v1", "campaign": "final", "source_sha256": artifact_sha, "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha, "observed": {"complete": True}, "chapters": [{"id": value, "required_action_ids": aggregate_action_map[value], "action_ids": aggregate_action_map[value], "coverage_complete": True} for value in aggregate_chapter_ids]})
        aggregate_action = replacement / "aggregate-action-timing.json"
        write_json(aggregate_action, {"schema_id": "pm.capture.action_timing.v1", "source_sha256": artifact_sha, "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha, "actions": aggregate_actions})
        aggregate_timing = replacement / "aggregate-timing-report.json"
        write_json(aggregate_timing, {"schema_id": "pm.capture.delivered_frame_timing.v1", "source_sha256": artifact_sha, "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha, "requested_fps": 60, "no_resampling_claim": True, "observations": {"cadence_valid": True}})
        aggregate_review_dir = replacement / "aggregate-review"; aggregate_review_dir.mkdir()
        aggregate_ledger_path = aggregate_review_dir / "review-ledger.json"
        aggregate_ledger = build_ledger(aggregate_index, ["aggregate-a", "aggregate-b"], set(aggregate_chapter_ids))
        render_review_html(aggregate_ledger, aggregate_review_dir / "full-frame-review.html", replacement)
        aggregate_contact = render_contact_sheets(aggregate_ledger, aggregate_review_dir / "contact-sheets", replacement, None)
        aggregate_ledger["contact_sheet_index"] = {"path": aggregate_contact["index_path"], "sha256": aggregate_contact["index_sha256"]}
        aggregate_ledger["review_surfaces"] = [{"surface_id": row["surface_id"], "kind": row["kind"], "surface_sha256": row["surface_sha256"], "frame_indexes": row["frame_indexes"]} for row in aggregate_contact["sheets"]]
        write_json(aggregate_ledger_path, aggregate_ledger)
        for reviewer in ("aggregate-a", "aggregate-b"):
            empty_path = aggregate_review_dir / f"findings-{reviewer}.json"
            write_json(empty_path, {"schema_id": FINDINGS_SCHEMA, "reviewer": reviewer, "reviewed_at_utc": utc_now(), "findings": []})
            mark_reviewed(aggregate_ledger_path, reviewer, "0:1", empty_path, True)
        aggregate_current = load_json(aggregate_ledger_path)
        aggregate_primary = aggregate_review_dir / "primary.json"
        write_json(aggregate_primary, {"schema_id": PRIMARY_REVIEW_SCHEMA, "reviewer": "aggregate-primary", "reviewer_role": "primary_integrator", "reviewed_at_utc": utc_now(), "attestation": "Synthetic aggregate replacement primary-review exercise.", "surfaces": [{"surface_id": row["surface_id"], "surface_sha256": row["surface_sha256"], "status": "reviewed", "observation": "Synthetic aggregate replacement surface review."} for row in aggregate_current["review_surfaces"]], "defect_candidates": []})
        record_primary_review(aggregate_ledger_path, "aggregate-primary", aggregate_primary, True)
        aggregate_terminal = aggregate_review_dir / "terminal-review-receipt.json"
        if check_complete(aggregate_ledger_path, aggregate_terminal, emit=False) != 0:
            raise AssertionError("complete aggregate replacement review did not pass")
        aggregate_master = replacement / "aggregate-ffv1.mkv"; aggregate_master.write_bytes(b"synthetic aggregate media custody; aggregate gate performs codec proof")
        aggregate_mp4 = replacement / "aggregate-review.mp4"; aggregate_mp4.write_bytes(b"synthetic aggregate media custody; aggregate gate performs codec proof")
        aggregate_browser = replacement / "aggregate-browser-executable"; aggregate_browser.write_bytes(b"synthetic direct aggregate browser identity")
        aggregate_browser_path, aggregate_browser_data, aggregate_browser_info = read_regular_nofollow(aggregate_browser, "aggregate fixture browser")
        aggregate_campaign_value = load_json(aggregate_campaign)
        aggregate_campaign_value.update({
            "command": {"argv": ["node", "synthetic-aggregate-capture.mjs"], "cwd": str(replacement)},
            "configuration": replacement_configuration,
            "browser_identity": {
                "product": "Synthetic Browser", "version": "fixture-1.0", "channel": "fixture",
                "user_agent": "fixture-agent", "executable_path": str(aggregate_browser_path),
                "executable_sha256": hashlib.sha256(aggregate_browser_data).hexdigest(),
                "executable_bytes": aggregate_browser_info.st_size, "executable_device": aggregate_browser_info.st_dev,
                "executable_inode": aggregate_browser_info.st_ino, "executable_mtime_ns": aggregate_browser_info.st_mtime_ns,
                "playwright_version": "fixture-1.0",
            },
            "media": {
                "disposition": "encoded",
                "ffv1_master": {"path": aggregate_master.name, "sha256": sha256(aggregate_master), "success": True, "probe_proves_ffv1": True},
                "review_mp4": {"path": aggregate_mp4.name, "sha256": sha256(aggregate_mp4), "success": True},
            },
            "observations": {"cadence_valid": True},
        })
        write_json(aggregate_campaign, aggregate_campaign_value)
        rerun_specs = []
        for scope in ("chapter", "aggregate"):
            path = replacement / f"rerun-{scope}.json"
            write_json(path, {
                "schema_id": AGGREGATE_RERUN_SCHEMA, "scope": scope, "status": "pass",
                "artifact_sha256": artifact_sha, "denominator_sha256": denominator_sha,
                "configuration_sha256": configuration_sha, "runner_sha256": runner_sha,
                "campaign_report": {"path": (replacement_campaign if scope == "chapter" else aggregate_campaign).name, "sha256": sha256(replacement_campaign if scope == "chapter" else aggregate_campaign)},
                "campaign_report_sha256": sha256(replacement_campaign if scope == "chapter" else aggregate_campaign), "chapter": "ordinary",
                "chapter_ids": ["ordinary"] if scope == "chapter" else aggregate_chapter_ids,
                "action_ids": required_actions if scope == "chapter" else aggregate_action_ids,
                "checks": [{"id": f"{scope}-fixture", "pass": True}],
            })
            rerun_specs.append({"path": path.name, "sha256": sha256(path), "schema_id": AGGREGATE_RERUN_SCHEMA})
        package_path = replacement / "replacement-package.json"
        package = {
            "schema_id": REPLACEMENT_PACKAGE_SCHEMA, "artifact_sha256": artifact_sha,
            "denominator_sha256": denominator_sha, "configuration_sha256": configuration_sha,
            "runner_sha256": runner_sha, "chapter": "ordinary", "required_action_ids": required_actions,
            "campaign_report": {"path": replacement_campaign.name, "sha256": sha256(replacement_campaign)},
            "frame_index": {"path": replacement_index.name, "sha256": sha256(replacement_index)},
            "scenario_manifest": {"path": replacement_scenario.name, "sha256": sha256(replacement_scenario)},
            "coverage_manifest": {"path": replacement_coverage.name, "sha256": sha256(replacement_coverage)},
            "action_timing": {"path": replacement_action.name, "sha256": sha256(replacement_action)},
            "timing_report": {"path": replacement_timing.name, "sha256": sha256(replacement_timing)},
            "review_ledger": {"path": os.path.relpath(replacement_ledger_path, replacement), "sha256": sha256(replacement_ledger_path)},
            "contact_sheet_index": {"path": os.path.relpath(Path(replacement_contact["index_path"]), replacement), "sha256": replacement_contact["index_sha256"]},
            "terminal_review_receipt": {"path": os.path.relpath(replacement_terminal, replacement), "sha256": sha256(replacement_terminal)},
            "ffv1_master": {"path": replacement_master.name, "sha256": sha256(replacement_master)},
            "review_mp4": {"path": replacement_mp4.name, "sha256": sha256(replacement_mp4)},
            "aggregate_rerun_receipts": rerun_specs,
            "aggregate_evidence": {
                "campaign_report": {"path": aggregate_campaign.name, "sha256": sha256(aggregate_campaign)},
                "frame_index": {"path": aggregate_index.name, "sha256": sha256(aggregate_index)},
                "scenario_manifest": {"path": aggregate_scenario.name, "sha256": sha256(aggregate_scenario)},
                "coverage_manifest": {"path": aggregate_coverage.name, "sha256": sha256(aggregate_coverage)},
                "action_timing": {"path": aggregate_action.name, "sha256": sha256(aggregate_action)},
                "timing_report": {"path": aggregate_timing.name, "sha256": sha256(aggregate_timing)},
                "review_ledger": {"path": os.path.relpath(aggregate_ledger_path, replacement), "sha256": sha256(aggregate_ledger_path)},
                "contact_sheet_index": {"path": os.path.relpath(Path(aggregate_contact["index_path"]), replacement), "sha256": aggregate_contact["index_sha256"]},
                "terminal_review_receipt": {"path": os.path.relpath(aggregate_terminal, replacement), "sha256": sha256(aggregate_terminal)},
                "ffv1_master": {"path": aggregate_master.name, "sha256": sha256(aggregate_master)},
                "review_mp4": {"path": aggregate_mp4.name, "sha256": sha256(aggregate_mp4)},
            },
        }
        write_json(package_path, package)
        aggregate_rerun_path = replacement / "rerun-aggregate.json"
        aggregate_rerun = load_json(aggregate_rerun_path)
        forged_aggregate = copy.deepcopy(aggregate_rerun)
        forged_aggregate["campaign_report"] = {"path": replacement_campaign.name, "sha256": sha256(replacement_campaign)}
        forged_aggregate["campaign_report_sha256"] = sha256(replacement_campaign)
        write_json(aggregate_rerun_path, forged_aggregate)
        package["aggregate_rerun_receipts"][1]["sha256"] = sha256(aggregate_rerun_path)
        write_json(package_path, package)
        try:
            validate_replacement_capture(
                {"package_manifest_path": str(package_path), "package_manifest_sha256": sha256(package_path), "chapter": "ordinary"},
                load_json(ledger_path), load_json(ledger_path)["findings"][0]
            )
            raise AssertionError("chapter-only campaign was accepted as an aggregate rerun")
        except ValueError:
            pass
        write_json(aggregate_rerun_path, aggregate_rerun)
        package["aggregate_rerun_receipts"][1]["sha256"] = sha256(aggregate_rerun_path)
        write_json(package_path, package)
        report_only_package = copy.deepcopy(package); report_only_package.pop("aggregate_evidence")
        write_json(package_path, report_only_package)
        try:
            validate_replacement_capture(
                {"package_manifest_path": str(package_path), "package_manifest_sha256": sha256(package_path), "chapter": "ordinary"},
                load_json(ledger_path), load_json(ledger_path)["findings"][0]
            )
            raise AssertionError("self-authored aggregate report without distinct frames/media/review was accepted")
        except ValueError:
            pass
        write_json(package_path, package)
        disposition_path = root / "dispositions.json"
        write_json(disposition_path, {
            "schema_id": DISPOSITIONS_SCHEMA, "adjudicator": "fixture-adjudicator", "adjudicated_at_utc": utc_now(),
            "dispositions": [{
                "finding_id": "FIXTURE-DEFECT-001", "status": "repaired",
                "disposition_reason": "Synthetic replacement proves the verifier's repair-custody path.",
                "evidence": {"refs": ["fixture://repair-diff"]},
                "repaired_by": "fixture-repairer", "repair_ref": "fixture://repair-001",
                "replacement_capture": {
                    "package_manifest_path": str(package_path), "package_manifest_sha256": sha256(package_path),
                    "chapter": "ordinary"
                }
            }]
        })
        record_finding_dispositions(ledger_path, disposition_path)
        missing_primary_path = review_dir / "terminal-missing-primary.json"
        if check_complete(ledger_path, missing_primary_path, emit=False) != 1:
            raise AssertionError("missing-primary-review fixture unexpectedly passed")
        missing_primary = load_json(missing_primary_path)
        if missing_primary["defect_closure"]["complete"] is not True or missing_primary["primary_integrator_review"]["complete"] is not False:
            raise AssertionError("defect closure and primary review were not kept independent")
        current = load_json(ledger_path)
        primary_path = root / "primary.json"
        write_json(primary_path, {
            "schema_id": PRIMARY_REVIEW_SCHEMA, "reviewer": "fixture-primary",
            "reviewer_role": "primary_integrator", "reviewed_at_utc": utc_now(),
            "attestation": "Synthetic self-test receipt; no campaign review claim.",
            "surfaces": [{
                "surface_id": surface["surface_id"], "surface_sha256": surface["surface_sha256"],
                "status": "reviewed", "observation": "Synthetic contact-sheet validator exercise."
            } for surface in current["review_surfaces"]],
            "defect_candidates": [{
                "finding_id": "FIXTURE-DEFECT-001", "status": "reviewed",
                "observation": "Synthetic defect-candidate validator exercise."
            }]
        })
        record_primary_review(ledger_path, "fixture-primary", primary_path, True)
        if check_complete(ledger_path, review_dir / "terminal-complete.json", emit=False) != 0:
            raise AssertionError("complete fixture did not pass")
        one_frame_package = load_json(package_path)
        one_frame_index = load_json(replacement_index); one_frame_index["frames"] = one_frame_index["frames"][:1]
        write_json(replacement_index, one_frame_index); one_frame_package["frame_index"]["sha256"] = sha256(replacement_index); write_json(package_path, one_frame_package)
        one_frame_replacement = {"package_manifest_path": str(package_path), "package_manifest_sha256": sha256(package_path), "chapter": "ordinary"}
        try:
            validate_replacement_capture(one_frame_replacement, load_json(ledger_path), load_json(ledger_path)["findings"][0])
            raise AssertionError("one-frame replacement package unexpectedly passed")
        except ValueError:
            pass
        write_json(replacement_index, {**one_frame_index, "frames": replacement_rows}); package["frame_index"]["sha256"] = sha256(replacement_index); write_json(package_path, package)
        replacement_frame = replacement_frames / "replacement-000.png"
        replacement_bytes = replacement_frame.read_bytes()
        replacement_frame.write_bytes(replacement_bytes + b"drift")
        if check_complete(ledger_path, review_dir / "terminal-replacement-drift.json", emit=False) != 1:
            raise AssertionError("replacement-capture hash-drift fixture unexpectedly passed")
        replacement_frame.write_bytes(replacement_bytes)
        original = (campaign / "frame-000.png").read_bytes()
        (campaign / "frame-000.png").write_bytes(original + b"drift")
        if check_complete(ledger_path, review_dir / "terminal-drift.json", emit=False) != 1:
            raise AssertionError("hash-drift fixture unexpectedly passed")
        complete_receipt = load_json(review_dir / "terminal-complete.json")
        drift_receipt = load_json(review_dir / "terminal-drift.json")
        return {
            "passed": True, "synthetic_only": True,
            "complete_fixture_disposition": complete_receipt["disposition"],
            "drift_fixture_disposition": drift_receipt["disposition"],
            "frames": len(frames), "replacement_frames": len(replacement_rows),
            "high_risk_frames": 2, "defect_span_frames": 1,
            "chapter_only_aggregate_rerun_rejected": True,
            "report_only_aggregate_rerun_rejected": True,
            "contact_sheet_set_sha256": contact["deterministic_sheet_set_sha256"]
        }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--frame-index", type=Path)
    parser.add_argument("--outdir", type=Path)
    parser.add_argument("--reviewers", default="reviewer-1,reviewer-2")
    parser.add_argument("--high-risk", default=",".join(sorted(HIGH_RISK_DEFAULT)))
    parser.add_argument("--chrome", default="/usr/bin/google-chrome")
    parser.add_argument("--multi-view-index", action="append", default=[], type=Path)
    parser.add_argument("--mark-reviewed")
    parser.add_argument("--range", dest="frame_range")
    parser.add_argument("--findings", type=Path)
    parser.add_argument("--full-resolution-attested", action="store_true")
    parser.add_argument("--record-finding-dispositions", type=Path)
    parser.add_argument("--record-primary-review")
    parser.add_argument("--primary-receipt", type=Path)
    parser.add_argument("--primary-review-attested", action="store_true")
    parser.add_argument("--ledger", type=Path)
    parser.add_argument("--check-complete", action="store_true")
    parser.add_argument("--terminal-receipt", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        print(json.dumps(run_self_test(), indent=2))
        return 0
    if args.check_complete:
        if not args.ledger:
            parser.error("--check-complete requires --ledger")
        return check_complete(
            lexical_absolute(args.ledger), lexical_absolute(args.terminal_receipt) if args.terminal_receipt else None
        )
    if args.record_finding_dispositions:
        if not args.ledger:
            parser.error("--record-finding-dispositions requires --ledger")
        result = record_finding_dispositions(lexical_absolute(args.ledger), lexical_absolute(args.record_finding_dispositions))
        print(json.dumps(result, indent=2))
        return 0
    if args.record_primary_review:
        if not args.ledger or not args.primary_receipt:
            parser.error("--record-primary-review requires --ledger and --primary-receipt")
        result = record_primary_review(
            lexical_absolute(args.ledger), args.record_primary_review, lexical_absolute(args.primary_receipt),
            args.primary_review_attested
        )
        print(json.dumps(result, indent=2))
        return 0
    if args.mark_reviewed:
        if not args.ledger or not args.frame_range or not args.findings:
            parser.error("--mark-reviewed requires --ledger, --range start:end, and an immutable --findings receipt")
        result = mark_reviewed(lexical_absolute(args.ledger), args.mark_reviewed, args.frame_range, lexical_absolute(args.findings) if args.findings else None, args.full_resolution_attested)
        print(json.dumps(result, indent=2))
        return 0
    if not args.frame_index or (not args.validate_only and not args.outdir):
        parser.error("generation requires --frame-index and --outdir; --validate-only requires --frame-index")

    index_path = lexical_absolute(args.frame_index)
    reviewers = [item.strip() for item in args.reviewers.split(",") if item.strip()]
    high_risk = {item.strip() for item in args.high_risk.split(",") if item.strip()}
    if args.validate_only:
        source = load_json(index_path)
        frames = source.get("frames", [])
        if not isinstance(frames, list) or not frames:
            raise ValueError("frame index must contain a non-empty frames array")
        campaign_dir = index_path.parent
        for frame in frames:
            frame_path = lexical_absolute(campaign_dir / frame["path"])
            if campaign_dir not in frame_path.parents:
                raise ValueError(f'frame {frame.get("index")} is missing or out of bounds')
            frame_path, frame_data, _ = read_regular_nofollow(frame_path, f'frame {frame.get("index")}')
            validate_png_bytes(frame_data, frame_path)
            if frame.get("sha256") != hashlib.sha256(frame_data).hexdigest():
                raise ValueError(f'frame {frame.get("index")} hash mismatch')
        print(json.dumps({"valid": True, "outputs_written": False, "frames": len(frames), "frame_index_sha256": sha256(index_path)}, indent=2))
        return 0
    outdir = lexical_absolute(args.outdir)
    if outdir.exists() and any(outdir.iterdir()):
        raise ValueError(f"refusing to overwrite non-empty review directory: {outdir}")
    outdir.mkdir(parents=True, exist_ok=True)
    ledger_path = outdir / "review-ledger.json"
    ledger = build_ledger(index_path, reviewers, high_risk)
    campaign_dir = index_path.parent
    render_review_html(ledger, outdir / "full-frame-review.html", campaign_dir)
    chrome = args.chrome if args.chrome and Path(args.chrome).exists() else None
    contact = render_contact_sheets(ledger, outdir / "contact-sheets", campaign_dir, chrome)
    multi_indexes, multi_surfaces = import_multi_view_indexes(args.multi_view_index)
    contact_surfaces = [{
        "surface_id": row["surface_id"], "kind": row["kind"],
        "surface_sha256": row["surface_sha256"], "frame_indexes": row["frame_indexes"]
    } for row in contact["sheets"]]
    all_ids = [row["surface_id"] for row in contact_surfaces + multi_surfaces]
    if len(all_ids) != len(set(all_ids)):
        raise ValueError("contact and multi-view review surface IDs must be globally unique")
    ledger["contact_sheet_index"] = {"path": contact["index_path"], "sha256": contact["index_sha256"]}
    ledger["multi_view_indexes"] = multi_indexes
    ledger["review_surfaces"] = contact_surfaces + multi_surfaces
    write_json(ledger_path, ledger)
    print(json.dumps({
        "ledger": str(ledger_path), "frames": len(ledger["frames"]),
        "contact_sheets": len(contact["sheets"]), "multi_view_sheets": len(multi_surfaces),
        "contact_sheet_index_sha256": contact["index_sha256"],
        "deterministic_sheet_set_sha256": contact["deterministic_sheet_set_sha256"],
        "chrome_rendered": bool(chrome),
        "evidence_boundary": "Assignments and generated navigation sheets are not completed review evidence."
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
