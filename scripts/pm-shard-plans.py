#!/usr/bin/env python3
"""Generate and verify derived plan shards for Puppet Master governance."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SHARD_BODY_DELIMITER = b"---\n\n"
SHARD_BODY_MARKER = b"\n---\n\n"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def exact_path(ref: str) -> tuple[Path | None, dict[str, Any] | None]:
    """Resolve a repo-relative path only when every segment matches exact case."""
    if not ref or any(token in ref for token in "*?[]"):
        return ROOT / ref, None
    posix = PurePosixPath(ref)
    if posix.is_absolute():
        return None, {"path": ref, "error": "absolute_ref_not_allowed"}

    current = ROOT
    resolved_parts: list[str] = []
    for part in posix.parts:
        if part in {"", "."}:
            continue
        if part == "..":
            return None, {"path": ref, "error": "parent_ref_not_allowed"}
        if not current.exists():
            return None, {"path": ref, "error": "missing_parent", "parent": "/".join(resolved_parts)}
        try:
            children = {child.name: child for child in current.iterdir()}
        except NotADirectoryError:
            return None, {"path": ref, "error": "parent_not_directory", "parent": "/".join(resolved_parts)}
        if part not in children:
            case_matches = [child.name for child in children.values() if child.name.lower() == part.lower()]
            if case_matches:
                actual_parts = resolved_parts + [case_matches[0]]
                return None, {
                    "path": ref,
                    "error": "case_mismatched_ref",
                    "actual": "/".join(actual_parts),
                }
            return None, {"path": ref, "error": "missing_ref"}
        current = children[part]
        resolved_parts.append(part)
    return current, None


def ref_failure(path_error: dict[str, Any], ref_key: str = "ref") -> dict[str, Any]:
    failure = dict(path_error)
    failure[ref_key] = failure.pop("path")
    return failure


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def first_byte_difference(expected: bytes, actual: bytes) -> dict[str, Any] | None:
    limit = min(len(expected), len(actual))
    for offset in range(limit):
        if expected[offset] != actual[offset]:
            return {
                "offset": offset,
                "expected_byte": expected[offset],
                "actual_byte": actual[offset],
            }
    if len(expected) != len(actual):
        return {
            "offset": limit,
            "expected_byte": expected[limit] if limit < len(expected) else None,
            "actual_byte": actual[limit] if limit < len(actual) else None,
        }
    return None


def extract_shard_body_bytes(shard_bytes: bytes) -> bytes | None:
    marker_at = shard_bytes.find(SHARD_BODY_MARKER)
    if marker_at >= 0:
        return shard_bytes[marker_at + len(SHARD_BODY_MARKER) :]
    if shard_bytes.startswith(SHARD_BODY_DELIMITER):
        return shard_bytes[len(SHARD_BODY_DELIMITER) :]
    return None


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9._-]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "section"


def load_config(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data.get("sources"), list) or not data["sources"]:
        raise SystemExit(f"{rel(path)} must define a non-empty sources array")
    return data


def normalize_generated_markdown(text: str) -> str:
    lines = [line.rstrip() for line in text.splitlines()]
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines) + "\n"


def split_markdown(lines: list[str]) -> list[dict[str, Any]]:
    def trimmed_section_end(start: int, end: int) -> int:
        while end > start and not lines[end - 1].strip():
            end -= 1
        return end

    fence = False
    starts: list[int] = []
    for i, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            fence = not fence
        if fence:
            continue
        if line.startswith("## ") or line.startswith("##\t") or line.strip() == "##":
            starts.append(i)

    sections: list[dict[str, Any]] = []
    if starts:
        if starts[0] > 0:
            starts = [0] + starts
        for index, start in enumerate(starts):
            end = trimmed_section_end(start, starts[index + 1] if index + 1 < len(starts) else len(lines))
            heading = lines[start].strip() if lines[start].startswith("##") else "Preamble"
            heading = heading.lstrip("#").strip() or "Preamble"
            sections.append(
                {
                    "start": start + 1,
                    "end": end,
                    "heading": heading,
                    "lines": lines[start:end],
                    "split_rule": "heading-##",
                }
            )
        return sections

    chunk_size = 200
    for start in range(0, len(lines), chunk_size):
        end = min(start + chunk_size, len(lines))
        sections.append(
            {
                "start": start + 1,
                "end": end,
                "heading": f"Lines {start + 1}-{end}",
                "lines": lines[start:end],
                "split_rule": "line-count-200",
            }
        )
    return sections


def shard_source(source: Path, output_root: Path, generated_at: str) -> dict[str, Any]:
    source_bytes = source.read_bytes()
    source_hash = hashlib.sha256(source_bytes).hexdigest()
    text = source_bytes.decode("utf-8", errors="replace")
    lines = text.splitlines(keepends=True)
    line_bytes = source_bytes.splitlines(keepends=True)
    doc_slug = slugify(source.stem)
    doc_dir = output_root / doc_slug
    doc_dir.mkdir(parents=True, exist_ok=True)

    shards: list[dict[str, Any]] = []
    used_names: set[str] = set()
    for index, section in enumerate(split_markdown(lines), start=1):
        base_name = slugify(section["heading"])[:64]
        name = f"{index:03d}-{base_name}.md"
        while name in used_names:
            name = f"{index:03d}-{base_name}-{len(used_names)}.md"
        used_names.add(name)
        shard_path = doc_dir / name
        body_bytes = b"".join(line_bytes[section["start"] - 1 : section["end"]])
        shard_header = (
            f"# Shard {index:03d}: {section['heading']}\n\n"
            f"Source: `{rel(source)}`\n\n"
            f"Source lines: L{section['start']}-L{section['end']}\n\n"
            f"Source SHA256: `{source_hash}`\n\n"
            "---\n\n"
        )
        shard_path.write_bytes(shard_header.encode("utf-8") + body_bytes)
        shards.append(
            {
                "shard_id": f"{index:03d}",
                "path": rel(shard_path),
                "sha256": sha256_file(shard_path),
                "source_line_start": section["start"],
                "source_line_end": section["end"],
                "heading": section["heading"],
                "split_rule": section["split_rule"],
            }
        )

    manifest_path = doc_dir / "manifest.json"
    index_path = doc_dir / "00-index.md"
    manifest = {
        "schema_id": "pm.plan_shards.manifest.v1",
        "generated_at_utc": generated_at,
        "source": {
            "path": rel(source),
            "sha256": source_hash,
            "line_count": len(line_bytes),
        },
        "index_path": rel(index_path),
        "manifest_path": rel(manifest_path),
        "shards": shards,
    }

    index_lines = [
        f"# Shard Index: {rel(source)}",
        "",
        f"Generated: {generated_at}",
        "",
        f"Source SHA256: `{source_hash}`",
        "",
        f"Manifest: [`manifest.json`](manifest.json)",
        "",
        "## Shards",
        "",
    ]
    for shard in shards:
        name = Path(shard["path"]).name
        index_lines.append(
            f"- [{shard['shard_id']} - {shard['heading']}]({name}) "
            f"L{shard['source_line_start']}-L{shard['source_line_end']} "
            f"`{shard['sha256']}`"
        )
    index_path.write_text(normalize_generated_markdown("\n".join(index_lines)), encoding="utf-8")

    manifest["index_sha256"] = sha256_file(index_path)
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    manifest["manifest_sha256"] = sha256_file(manifest_path)
    return manifest


def generate(config_path: Path, report_path: Path | None) -> dict[str, Any]:
    config = load_config(config_path)
    output_root = ROOT / config.get("output_root", "Plans/_shards")
    if output_root.exists():
        shutil.rmtree(output_root)
    output_root.mkdir(parents=True, exist_ok=True)

    generated_at = utc_now()
    docs = []
    failures = []
    for source_ref in config["sources"]:
        source, path_error = exact_path(source_ref)
        if path_error:
            failures.append({"source": source_ref, **ref_failure(path_error, "source_ref")})
            continue
        assert source is not None
        if not source.exists():
            failures.append({"source": source_ref, "error": "missing_source"})
            continue
        docs.append(shard_source(source, output_root, generated_at))

    report = {
        "schema_id": "pm.plan_shards.report.v1",
        "generated_at_utc": generated_at,
        "mode": "generate",
        "config_path": rel(config_path),
        "output_root": rel(output_root),
        "source_count": len(config["sources"]),
        "docs_generated": len(docs),
        "shards_generated": sum(len(doc["shards"]) for doc in docs),
        "failures": failures,
        "docs": docs,
        "status": "pass" if not failures else "fail",
    }
    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return report


def check(config_path: Path, report_path: Path | None) -> dict[str, Any]:
    config = load_config(config_path)
    output_root = ROOT / config.get("output_root", "Plans/_shards")
    expected_dirs = {slugify(Path(source).stem) for source in config["sources"]}
    failures: list[dict[str, Any]] = []
    docs = []

    exact_output_root, output_root_error = exact_path(config.get("output_root", "Plans/_shards"))
    if output_root_error:
        failures.append(ref_failure(output_root_error, "output_root_ref"))
    elif exact_output_root is not None:
        output_root = exact_output_root

    if not output_root.exists():
        failures.append({"path": rel(output_root), "error": "missing_output_root"})
    else:
        stale_dirs = [
            rel(path)
            for path in sorted(output_root.iterdir())
            if path.is_dir() and path.name not in expected_dirs
        ]
        for path in stale_dirs:
            failures.append({"path": path, "error": "stale_unregistered_shard_dir"})

    for source_ref in config["sources"]:
        source, source_error = exact_path(source_ref)
        doc_slug = slugify(Path(source_ref).stem)
        doc_dir = output_root / doc_slug
        manifest_path = doc_dir / "manifest.json"
        index_path = doc_dir / "00-index.md"
        doc_result: dict[str, Any] = {"source": source_ref, "dir": rel(doc_dir), "failures": []}
        docs.append(doc_result)

        if source_error:
            doc_result["failures"].append(ref_failure(source_error, "source_ref"))
            failures.extend({"source": source_ref, **failure} for failure in doc_result["failures"])
            continue
        assert source is not None
        if not source.exists():
            doc_result["failures"].append({"path": source_ref, "error": "missing_source"})
            continue
        if not doc_dir.exists():
            doc_result["failures"].append({"path": rel(doc_dir), "error": "missing_shard_dir"})
            continue
        if not manifest_path.exists():
            doc_result["failures"].append({"path": rel(manifest_path), "error": "missing_manifest"})
            continue
        if not index_path.exists():
            doc_result["failures"].append({"path": rel(index_path), "error": "missing_index"})
            continue

        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            doc_result["failures"].append({"path": rel(manifest_path), "error": f"invalid_json:{exc}"})
            continue

        source_hash = sha256_file(source)
        source_line_bytes = source.read_bytes().splitlines(keepends=True)
        if manifest.get("schema_id") != "pm.plan_shards.manifest.v1":
            doc_result["failures"].append({"path": rel(manifest_path), "error": "invalid_schema_id"})
        if manifest.get("source", {}).get("path") != source_ref:
            doc_result["failures"].append({"path": rel(manifest_path), "error": "source_path_mismatch"})
        if manifest.get("source", {}).get("sha256") != source_hash:
            doc_result["failures"].append({"path": rel(manifest_path), "error": "source_hash_stale"})
        if manifest.get("source", {}).get("line_count") != len(source_line_bytes):
            doc_result["failures"].append({"path": rel(manifest_path), "error": "source_line_count_stale"})
        if manifest.get("manifest_path") != rel(manifest_path):
            doc_result["failures"].append({"path": rel(manifest_path), "error": "manifest_path_mismatch"})
        if manifest.get("index_path") != rel(index_path):
            doc_result["failures"].append({"path": rel(manifest_path), "error": "index_path_mismatch"})
        if manifest.get("index_sha256") != sha256_file(index_path):
            doc_result["failures"].append({"path": rel(index_path), "error": "index_hash_stale"})

        index_text = index_path.read_text(encoding="utf-8")
        expected_doc_files = {manifest_path, index_path}
        body_reconstruction_checked = 0
        body_reconstruction_mismatches = 0
        for shard in manifest.get("shards", []):
            shard_path, path_error = exact_path(shard.get("path", ""))
            if path_error:
                doc_result["failures"].append({**ref_failure(path_error, "shard_ref"), "error": "case_mismatched_shard" if path_error["error"] == "case_mismatched_ref" else path_error["error"]})
                continue
            assert shard_path is not None
            if not shard_path.exists():
                doc_result["failures"].append({"path": shard.get("path"), "error": "missing_shard"})
                continue
            expected_doc_files.add(shard_path)
            if sha256_file(shard_path) != shard.get("sha256"):
                doc_result["failures"].append({"path": shard.get("path"), "error": "shard_hash_stale"})
            if Path(shard["path"]).name not in index_text:
                doc_result["failures"].append({"path": rel(index_path), "error": f"index_missing_link:{shard['path']}"})

            start = shard.get("source_line_start")
            end = shard.get("source_line_end")
            if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start or end > len(source_line_bytes):
                body_reconstruction_mismatches += 1
                doc_result["failures"].append(
                    {
                        "path": shard.get("path"),
                        "error": "invalid_source_line_range",
                        "source_line_start": start,
                        "source_line_end": end,
                        "source_line_count": len(source_line_bytes),
                    }
                )
                continue
            expected_body = b"".join(source_line_bytes[start - 1 : end])
            actual_body = extract_shard_body_bytes(shard_path.read_bytes())
            body_reconstruction_checked += 1
            if actual_body is None:
                body_reconstruction_mismatches += 1
                doc_result["failures"].append({"path": shard.get("path"), "error": "missing_shard_body_delimiter"})
                continue
            if actual_body != expected_body:
                body_reconstruction_mismatches += 1
                doc_result["failures"].append(
                    {
                        "path": shard.get("path"),
                        "error": "shard_body_mismatch",
                        "source_line_start": start,
                        "source_line_end": end,
                        "expected_body_sha256": sha256_bytes(expected_body),
                        "actual_body_sha256": sha256_bytes(actual_body),
                        "expected_body_bytes": len(expected_body),
                        "actual_body_bytes": len(actual_body),
                        "first_difference": first_byte_difference(expected_body, actual_body),
                    }
                )

        stale_files = [
            rel(path)
            for path in sorted(doc_dir.iterdir())
            if path.is_file() and path not in expected_doc_files
        ]
        for path in stale_files:
            doc_result["failures"].append({"path": path, "error": "unregistered_shard_output_file"})

        if not manifest.get("shards"):
            doc_result["failures"].append({"path": rel(manifest_path), "error": "no_shards"})
        doc_result["shard_count"] = len(manifest.get("shards", []))
        doc_result["body_reconstruction_checked"] = body_reconstruction_checked
        doc_result["body_reconstruction_mismatches"] = body_reconstruction_mismatches
        failures.extend({"source": source_ref, **failure} for failure in doc_result["failures"])

    index_path = ROOT / "Plans/00-plans-index.md"
    index_failures: list[dict[str, Any]] = []
    if not index_path.exists():
        index_failures.append({"path": "Plans/00-plans-index.md", "error": "missing_root_plan_index"})
    else:
        index_text = index_path.read_text(encoding="utf-8")
        for source_ref in config["sources"]:
            source_name = Path(source_ref).name
            doc_slug = slugify(Path(source_ref).stem)
            expected_ref = f"{config.get('output_root', 'Plans/_shards')}/{doc_slug}/00-index.md"
            expected_row = f"| `{source_name}` | [`{expected_ref}`]({expected_ref}) |"
            if expected_row not in index_text:
                index_failures.append(
                    {
                        "path": "Plans/00-plans-index.md",
                        "source": source_ref,
                        "expected": expected_row,
                        "error": "missing_or_stale_root_shard_index_row",
                    }
                )
        for match in re.finditer(r"Plans/_shards/[A-Za-z0-9_.-]+/00-index\.md", index_text):
            ref = match.group(0)
            _, path_error = exact_path(ref)
            if path_error:
                index_failures.append({"path": "Plans/00-plans-index.md", **ref_failure(path_error, "shard_index_ref")})
    failures.extend(index_failures)

    report = {
        "schema_id": "pm.plan_shards.report.v1",
        "generated_at_utc": utc_now(),
        "mode": "check",
        "config_path": rel(config_path),
        "output_root": rel(output_root),
        "source_count": len(config["sources"]),
        "docs_checked": len(docs),
        "shards_checked": sum(doc.get("shard_count", 0) for doc in docs),
        "body_reconstruction_checked": sum(doc.get("body_reconstruction_checked", 0) for doc in docs),
        "body_reconstruction_mismatches": sum(doc.get("body_reconstruction_mismatches", 0) for doc in docs),
        "root_index_path": "Plans/00-plans-index.md",
        "root_index_failures": index_failures,
        "failures": failures,
        "docs": docs,
        "status": "pass" if not failures else "fail",
    }
    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--generate", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--config", default="Plans/sharding_config.json")
    parser.add_argument("--report")
    args = parser.parse_args()

    config_path = ROOT / args.config
    report_path = ROOT / args.report if args.report else None
    report = generate(config_path, report_path) if args.generate else check(config_path, report_path)
    print(json.dumps({k: report[k] for k in ("status", "source_count", "docs_checked" if args.check else "docs_generated", "shards_checked" if args.check else "shards_generated", "failures")}, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
