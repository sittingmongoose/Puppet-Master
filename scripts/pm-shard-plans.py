#!/usr/bin/env python3
"""Deterministic lossless plan-doc sharding tool for Puppet Master."""

from __future__ import annotations

import argparse
import datetime
import difflib
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PLANS_DIR = REPO_ROOT / "Plans"
CONFIG_PATH = PLANS_DIR / "sharding_config.json"
EVIDENCE_SCHEMA_PATH = PLANS_DIR / "evidence.schema.json"
PLANS_INDEX_PATH = PLANS_DIR / "00-plans-index.md"

H2_RE = re.compile(r"^## ")
FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})")
SHARD_FILE_RE = re.compile(r"^(?!00-index\.md$)\d{2,}-.+\.md$")
INDEX_ROW_RE = re.compile(r"^- \[([^\]]+)\]\(([^)]+)\)")
SHARD_INDEX_SECTION_RE = re.compile(r"(?ms)^## Shard indexes\n.*?(?=^## |\Z)")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def count_lines_bytes(data: bytes) -> int:
    if not data:
        return 0
    return data.count(b"\n") + (0 if data.endswith(b"\n") else 1)


def _new_run_id() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")


def _relpath(path: Path) -> str:
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def _rel_link(from_dir: Path, to_path: Path) -> str:
    from_abs = from_dir if from_dir.is_absolute() else (REPO_ROOT / from_dir)
    to_abs = to_path if to_path.is_absolute() else (REPO_ROOT / to_path)
    return (
        os.path.relpath(to_abs.resolve(), from_abs.resolve())
        .replace(os.sep, "/")
        .replace(" ", "%20")
    )


def _output_root(config: dict) -> Path:
    raw = Path(config["output_root"])
    return raw if raw.is_absolute() else REPO_ROOT / raw


def _evidence_root(config: dict) -> Path:
    raw = Path(config["evidence_root"])
    return raw if raw.is_absolute() else REPO_ROOT / raw


def _latest_run_id_path(config: dict) -> Path:
    return _evidence_root(config) / "plan-sharding-latest.txt"


def _write_latest_run_id(config: dict, run_id: str) -> None:
    latest_path = _latest_run_id_path(config)
    latest_path.parent.mkdir(parents=True, exist_ok=True)
    latest_path.write_text(f"{run_id}\n", encoding="utf-8", newline="")


def _read_latest_run_id(config: dict) -> str | None:
    latest_path = _latest_run_id_path(config)
    if latest_path.exists():
        value = latest_path.read_text(encoding="utf-8").strip()
        if value:
            return value

    evidence_root = _evidence_root(config)
    candidates = sorted(
        d.name.removeprefix("plan-sharding-")
        for d in evidence_root.glob("plan-sharding-*")
        if d.is_dir() and (d / "evidence.json").exists()
    )
    return candidates[-1] if candidates else None


def _rewrite_commands_txt(reports_dir: Path, commands_run: list[dict]) -> None:
    commands_txt = reports_dir / "commands.txt"
    commands_txt.write_text(
        "".join(
            f"{entry['cmd']} | exit_code={entry['exit_code']}\n"
            for entry in commands_run
        ),
        encoding="utf-8",
        newline="",
    )


def update_evidence_command_status(config: dict, run_id: str, cmd: str, exit_code: int) -> bool:
    evidence_dir = _evidence_root(config) / f"plan-sharding-{run_id}"
    evidence_path = evidence_dir / "evidence.json"
    reports_dir = evidence_dir / "reports"
    if not evidence_path.exists():
        print(
            f"WARNING: No evidence bundle found for run_id {run_id}; command status not recorded for: {cmd}",
            file=sys.stderr,
        )
        return False

    with evidence_path.open("r", encoding="utf-8") as f:
        evidence = json.load(f)

    commands_run = evidence.get("commands_run", [])
    for entry in commands_run:
        if entry.get("cmd") == cmd:
            entry["exit_code"] = exit_code
            entry.pop("stdout_excerpt", None)
            entry.pop("stderr_excerpt", None)
            break
    else:
        commands_run.append({"cmd": cmd, "exit_code": exit_code})

    evidence["commands_run"] = commands_run

    completed_pm_runs = sum(
        1
        for entry in commands_run
        if isinstance(entry, dict)
        and isinstance(entry.get("cmd"), str)
        and entry["cmd"].startswith("python3 scripts/pm-shard-plans.py")
        and isinstance(entry.get("exit_code"), int)
        and entry["exit_code"] != -1
    )
    tool_calls = evidence.get("tool_calls", [])
    for tool_entry in tool_calls:
        if tool_entry.get("tool_id") == "pm-shard-plans":
            tool_entry["count"] = max(completed_pm_runs, 1)
            break
    else:
        tool_calls.append({"tool_id": "pm-shard-plans", "count": max(completed_pm_runs, 1)})
    evidence["tool_calls"] = tool_calls

    evidence_path.write_text(
        json.dumps(evidence, indent=2) + "\n", encoding="utf-8", newline=""
    )
    reports_dir.mkdir(parents=True, exist_ok=True)
    _rewrite_commands_txt(reports_dir, commands_run)
    return True


def heading_to_slug(heading: str) -> str:
    text = heading.lstrip("#").strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text.strip()).lower()
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "section"


def load_config() -> dict:
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        config = json.load(f)

    if not isinstance(config, dict):
        raise ValueError("sharding config must be a JSON object")

    for key in ("output_root", "evidence_root", "split_rule", "sources"):
        if key not in config:
            raise ValueError(f"sharding config missing required key: {key}")

    if not isinstance(config["sources"], list):
        raise ValueError("sharding config 'sources' must be an array")

    split_rule = config["split_rule"]
    if not isinstance(split_rule, dict):
        raise ValueError("sharding config 'split_rule' must be an object")
    if "primary" not in split_rule or "fallback" not in split_rule:
        raise ValueError("split_rule must include primary and fallback")

    return config


def split_at_h2(lines: list[str]) -> list[dict]:
    segments: list[dict] = []
    current_heading: str | None = None
    current_lines: list[str] = []
    current_start = 1
    in_fence = False
    fence_marker: tuple[str, int] | None = None

    for i, line in enumerate(lines):
        lineno = i + 1

        fence_match = FENCE_RE.match(line)
        if fence_match:
            marker = fence_match.group(1)
            marker_char = marker[0]
            marker_len = len(marker)
            marker_end = fence_match.end(1)

            if not in_fence:
                in_fence = True
                fence_marker = (marker_char, marker_len)
            elif fence_marker and marker_char == fence_marker[0] and marker_len >= fence_marker[1]:
                if line[marker_end:].strip() == "":
                    in_fence = False
                    fence_marker = None

        if not in_fence and H2_RE.match(line):
            if current_lines:
                segments.append(
                    {
                        "heading": current_heading,
                        "start_line": current_start,
                        "lines": current_lines,
                    }
                )
            current_heading = line.rstrip("\r\n")
            current_lines = [line]
            current_start = lineno
        else:
            current_lines.append(line)

    if current_lines:
        segments.append(
            {
                "heading": current_heading,
                "start_line": current_start,
                "lines": current_lines,
            }
        )

    return segments


def split_by_linecount(lines: list[str], chunk_size: int = 200) -> list[dict]:
    segments: list[dict] = []
    for i in range(0, len(lines), chunk_size):
        chunk = lines[i : i + chunk_size]
        segments.append(
            {
                "heading": None,
                "start_line": i + 1,
                "lines": chunk,
            }
        )
    return segments


def _record_change(all_changes: list[dict], path: Path, preexisting_paths: set[str]) -> None:
    rel = _relpath(path)
    all_changes.append(
        {
            "path": rel,
            "change_type": "modified" if rel in preexisting_paths else "added",
        }
    )
    preexisting_paths.discard(rel)


def _build_shard_index_section(config: dict) -> str:
    lines = [
        "## Shard indexes\n",
        "\n",
        "Agent-friendly shards for long plan docs. Generated by `scripts/pm-shard-plans.py --generate`; do not edit shards directly.\n",
        "\n",
        "| Source doc | Shard index |\n",
        "|-----------|-------------|\n",
    ]

    for source_rel in config["sources"]:
        source_name = Path(source_rel).name
        stem = Path(source_rel).stem
        shard_index_rel = Path(config["output_root"]) / stem / "00-index.md"
        shard_index_rel_str = shard_index_rel.as_posix()
        lines.append(
            f"| `{source_name}` | [`{shard_index_rel_str}`]({shard_index_rel_str}) |\n"
        )

    return "".join(lines)


def update_plans_index_shard_section(config: dict) -> bool:
    if not PLANS_INDEX_PATH.exists():
        raise FileNotFoundError(f"missing plans index file: {_relpath(PLANS_INDEX_PATH)}")

    original = PLANS_INDEX_PATH.read_text(encoding="utf-8")
    section = _build_shard_index_section(config)

    if SHARD_INDEX_SECTION_RE.search(original):
        updated = SHARD_INDEX_SECTION_RE.sub(section, original, count=1)
    else:
        prefix = "" if original.endswith("\n") else "\n"
        updated = f"{original}{prefix}\n{section}"

    if not updated.endswith("\n"):
        updated += "\n"

    if updated == original:
        return False

    PLANS_INDEX_PATH.write_text(updated, encoding="utf-8", newline="")
    return True


def _is_generated_file_name(name: str) -> bool:
    return name == "manifest.json" or name == "00-index.md" or SHARD_FILE_RE.match(name) is not None


def _collect_generated_files(shard_dir: Path) -> dict[str, bytes]:
    if not shard_dir.exists():
        return {}

    file_map: dict[str, bytes] = {}
    for f in sorted(shard_dir.iterdir()):
        if f.is_file() and _is_generated_file_name(f.name):
            file_map[f.name] = f.read_bytes()
    return file_map


def _extract_shard_indexes_section(text: str) -> str:
    match = SHARD_INDEX_SECTION_RE.search(text)
    return match.group(0) if match else ""


def generate_shards(
    config: dict,
    run_id: str,
    *,
    output_root_override: Path | None = None,
    canonical_output_root: str | None = None,
    update_plans_index: bool = False,
) -> dict:
    del run_id  # run_id is kept for CLI compatibility; generation output is deterministic.

    output_root = output_root_override or _output_root(config)
    output_root.mkdir(parents=True, exist_ok=True)

    if canonical_output_root is not None:
        manifest_root = REPO_ROOT / canonical_output_root
    else:
        manifest_root = output_root

    all_files_changed: list[dict] = []
    results: dict[str, dict] = {}

    for source_rel in config["sources"]:
        source_path = REPO_ROOT / source_rel
        stem = source_path.stem
        shard_dir = output_root / stem

        if not source_path.exists():
            results[stem] = {
                "status": "FAIL",
                "source_sha256": "N/A",
                "reason": "source file not found",
            }
            continue

        preexisting_paths: set[str] = set()
        if shard_dir.exists():
            preexisting_paths = {
                _relpath(p)
                for p in shard_dir.iterdir()
                if p.is_file()
            }
            shutil.rmtree(shard_dir)
        shard_dir.mkdir(parents=True, exist_ok=True)

        source_bytes = source_path.read_bytes()
        source_sha = sha256_bytes(source_bytes)
        with source_path.open("r", encoding="utf-8", newline="") as f:
            lines = f.readlines()

        segments = split_at_h2(lines)
        split_rule_applied = config["split_rule"]["primary"]
        if len(segments) <= 1:
            segments = split_by_linecount(lines, chunk_size=200)
            split_rule_applied = config["split_rule"]["fallback"]

        slug_counts: dict[str, int] = {}
        used_slugs: set[str] = set()
        shard_entries: list[dict] = []

        for idx, seg in enumerate(segments):
            if seg["heading"] is None and idx == 0:
                base_slug = "preamble"
            elif seg["heading"] is None:
                base_slug = f"chunk-{idx + 1}"
            else:
                base_slug = heading_to_slug(seg["heading"])

            count = slug_counts.get(base_slug, 0) + 1
            candidate = base_slug if count == 1 else f"{base_slug}-{count}"
            while candidate in used_slugs:
                count += 1
                candidate = f"{base_slug}-{count}"
            slug_counts[base_slug] = count
            used_slugs.add(candidate)
            slug = candidate

            filename = f"{idx + 1:02d}-{slug}.md"
            shard_path = shard_dir / filename
            content = "".join(seg["lines"])
            shard_path.write_text(content, encoding="utf-8", newline="")
            _record_change(all_files_changed, shard_path, preexisting_paths)

            end_line = seg["start_line"] + len(seg["lines"]) - 1
            shard_entries.append(
                {
                    "dest_path": _relpath(manifest_root / stem / filename),
                    "start_line": seg["start_line"],
                    "end_line": end_line,
                    "segment_sha256": sha256_bytes(content.encode("utf-8")),
                    "heading": seg["heading"],
                }
            )

        manifest = {
            "source_path": source_rel,
            "source_sha256": source_sha,
            "split_rule": {
                "primary": config["split_rule"]["primary"],
                "fallback": config["split_rule"]["fallback"],
                "applied": split_rule_applied,
            },
            "shards": shard_entries,
        }
        manifest_path = shard_dir / "manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, indent=2) + "\n",
            encoding="utf-8",
            newline="",
        )
        _record_change(all_files_changed, manifest_path, preexisting_paths)

        canonical_shard_dir = manifest_root / stem
        index_lines = [
            f"# Shard Index: {stem}\n",
            "\n",
            "> **Derived shards for agent reading; DO NOT edit shards directly unless you also update the source doc; rerun generator.**\n",
            "\n",
            f"Canonical source: [{source_rel}]({_rel_link(canonical_shard_dir, source_path)})\n",
            "\n",
            "## Shards (reading order)\n",
            "\n",
        ]
        for entry in shard_entries:
            name = Path(entry["dest_path"]).name
            heading_label = entry["heading"] or "(preamble / chunk)"
            index_lines.append(f"- [{name}]({name}) — {heading_label}\n")

        index_path = shard_dir / "00-index.md"
        index_path.write_text("".join(index_lines), encoding="utf-8", newline="")
        _record_change(all_files_changed, index_path, preexisting_paths)

        for deleted_rel in sorted(preexisting_paths):
            all_files_changed.append({"path": deleted_rel, "change_type": "deleted"})

        results[stem] = {
            "status": "PASS",
            "source_sha256": source_sha,
            "source_path": source_rel,
        }

    if update_plans_index:
        index_preexisting = { _relpath(PLANS_INDEX_PATH) } if PLANS_INDEX_PATH.exists() else set()
        changed = update_plans_index_shard_section(config)
        if changed:
            _record_change(all_files_changed, PLANS_INDEX_PATH, index_preexisting)

    return {
        "results": results,
        "files_changed": all_files_changed,
    }


def _safe_manifest(source_rel: str, manifest_path: Path) -> tuple[dict | None, list[str]]:
    if not manifest_path.exists():
        return None, [f"manifest not found: {_relpath(manifest_path)}"]

    try:
        with manifest_path.open("r", encoding="utf-8") as f:
            manifest = json.load(f)
    except Exception as e:
        return None, [f"manifest parse failed: {_relpath(manifest_path)}: {e}"]

    errors: list[str] = []
    if not isinstance(manifest, dict):
        return None, [f"manifest is not a JSON object: {_relpath(manifest_path)}"]

    if manifest.get("source_path") != source_rel:
        errors.append(
            f"manifest source_path mismatch: expected {source_rel}, got {manifest.get('source_path')}"
        )

    shards = manifest.get("shards")
    if not isinstance(shards, list):
        errors.append("manifest.shards must be an array")

    return manifest, errors


def _unified_diff(source_path: Path, reconstructed: bytes) -> str:
    source_text = source_path.read_text(encoding="utf-8").splitlines(keepends=True)
    recon_text = reconstructed.decode("utf-8").splitlines(keepends=True)
    diff = list(
        difflib.unified_diff(
            source_text,
            recon_text,
            fromfile=str(source_path),
            tofile="reconstructed",
            n=3,
        )
    )
    return "".join(diff) if diff else "(no diff output)\n"


def check_reconstruction_and_lines(config: dict, reports_dir: Path) -> dict[str, dict]:
    output_root = _output_root(config)
    results: dict[str, dict] = {}

    for source_rel in config["sources"]:
        source_path = REPO_ROOT / source_rel
        stem = source_path.stem
        shard_dir = output_root / stem
        manifest_path = shard_dir / "manifest.json"

        reconstruct_sha_path = reports_dir / f"{stem}.reconstruct.sha256.txt"
        reconstruct_diff_path = reports_dir / f"{stem}.reconstruct.diff.txt"

        status = "PASS"
        details: list[str] = []
        source_sha = "N/A"
        reconstructed = b""
        reconstructed_sha = "N/A"

        if not source_path.exists():
            status = "FAIL"
            details.append(f"source file not found: {source_rel}")
        else:
            source_bytes = source_path.read_bytes()
            source_sha = sha256_bytes(source_bytes)

            manifest, manifest_errors = _safe_manifest(source_rel, manifest_path)
            details.extend(manifest_errors)
            if manifest is None:
                status = "FAIL"
            else:
                shards = manifest.get("shards", [])
                if not isinstance(shards, list):
                    status = "FAIL"
                else:
                    covered_lines: set[int] = set()
                    overlap_line: int | None = None

                    for idx, entry in enumerate(shards):
                        if not isinstance(entry, dict):
                            status = "FAIL"
                            details.append(f"manifest.shards[{idx}] is not an object")
                            continue

                        dest_rel = entry.get("dest_path")
                        start_line = entry.get("start_line")
                        end_line = entry.get("end_line")
                        expected_seg_sha = entry.get("segment_sha256")

                        if not isinstance(dest_rel, str) or not dest_rel:
                            status = "FAIL"
                            details.append(f"manifest.shards[{idx}] missing dest_path")
                            continue
                        if not isinstance(start_line, int) or not isinstance(end_line, int):
                            status = "FAIL"
                            details.append(f"manifest.shards[{idx}] invalid start_line/end_line")
                            continue
                        if start_line <= 0 or end_line < start_line:
                            status = "FAIL"
                            details.append(
                                f"manifest.shards[{idx}] invalid line range {start_line}-{end_line}"
                            )
                            continue

                        shard_path = REPO_ROOT / dest_rel
                        if not shard_path.exists():
                            status = "FAIL"
                            details.append(f"shard not found: {dest_rel}")
                            continue

                        shard_bytes = shard_path.read_bytes()
                        reconstructed += shard_bytes

                        if isinstance(expected_seg_sha, str):
                            actual_seg_sha = sha256_bytes(shard_bytes)
                            if actual_seg_sha != expected_seg_sha:
                                status = "FAIL"
                                details.append(
                                    f"segment sha mismatch: {dest_rel} expected={expected_seg_sha} actual={actual_seg_sha}"
                                )
                        else:
                            status = "FAIL"
                            details.append(f"manifest.shards[{idx}] missing segment_sha256")

                        expected_line_count = end_line - start_line + 1
                        actual_line_count = count_lines_bytes(shard_bytes)
                        if actual_line_count != expected_line_count:
                            status = "FAIL"
                            details.append(
                                f"line range/content mismatch: {dest_rel} range={start_line}-{end_line} expects {expected_line_count} lines, file has {actual_line_count}"
                            )

                        for ln in range(start_line, end_line + 1):
                            if ln in covered_lines and overlap_line is None:
                                overlap_line = ln
                            covered_lines.add(ln)

                    reconstructed_sha = sha256_bytes(reconstructed)
                    if reconstructed_sha != source_sha:
                        status = "FAIL"
                        details.append(
                            f"reconstruction sha mismatch: source={source_sha} reconstructed={reconstructed_sha}"
                        )

                    total_lines = count_lines_bytes(source_bytes)
                    expected_lines = set(range(1, total_lines + 1))
                    gaps = expected_lines - covered_lines
                    extra = covered_lines - expected_lines

                    if overlap_line is not None:
                        status = "FAIL"
                        details.append(f"line accounting overlap at line {overlap_line}")
                    if gaps:
                        status = "FAIL"
                        details.append(
                            f"line accounting gaps: {len(gaps)} missing lines (first {min(gaps)})"
                        )
                    if extra:
                        status = "FAIL"
                        details.append(
                            f"line accounting extras: {len(extra)} lines beyond source (first {min(extra)})"
                        )

        reconstruct_sha_path.write_text(
            "\n".join(
                [
                    f"source: {source_sha}",
                    f"reconstructed: {reconstructed_sha}",
                    f"RESULT: {status}",
                ]
            )
            + "\n",
            encoding="utf-8",
            newline="",
        )

        if status == "PASS":
            reconstruct_diff_path.write_text("PASS\n", encoding="utf-8", newline="")
        else:
            if source_path.exists() and reconstructed:
                diff_text = _unified_diff(source_path, reconstructed)
            else:
                diff_text = "\n".join(details) + "\n"
            reconstruct_diff_path.write_text(diff_text, encoding="utf-8", newline="")

        results[stem] = {
            "status": status,
            "source_sha256": source_sha,
            "details": "; ".join(details) if details else "OK",
        }

    return results


def check_index_manifest(config: dict, reports_dir: Path) -> dict[str, dict]:
    output_root = _output_root(config)
    results: dict[str, dict] = {}

    for source_rel in config["sources"]:
        stem = Path(source_rel).stem
        shard_dir = output_root / stem
        manifest_path = shard_dir / "manifest.json"
        index_path = shard_dir / "00-index.md"
        report_path = reports_dir / f"{stem}.index_check.txt"

        status = "PASS"
        details: list[str] = []

        manifest, manifest_errors = _safe_manifest(source_rel, manifest_path)
        details.extend(manifest_errors)
        if manifest is None:
            status = "FAIL"
            report_path.write_text("\n".join(details) + "\n", encoding="utf-8", newline="")
            results[stem] = {"status": status, "details": "; ".join(details)}
            continue

        shards = manifest.get("shards", [])
        if not isinstance(shards, list):
            status = "FAIL"
            details.append("manifest.shards is not a list")
            report_path.write_text("\n".join(details) + "\n", encoding="utf-8", newline="")
            results[stem] = {"status": status, "details": "; ".join(details)}
            continue

        expected_names = [Path(entry.get("dest_path", "")).name for entry in shards if isinstance(entry, dict)]
        legacy_manifest_shards = [name for name in expected_names if name.startswith("00-")]
        if legacy_manifest_shards:
            status = "FAIL"
            details.append(
                "manifest includes legacy 00-* shard filenames (expected 01-* and above): "
                f"{legacy_manifest_shards}"
            )

        if not index_path.exists():
            status = "FAIL"
            details.append(f"missing index file: {_relpath(index_path)}")
        else:
            lines = index_path.read_text(encoding="utf-8").splitlines()
            shard_heading_idx = None
            for i, line in enumerate(lines):
                if line.strip() == "## Shards (reading order)":
                    shard_heading_idx = i
                    break

            if shard_heading_idx is None:
                status = "FAIL"
                details.append("index missing '## Shards (reading order)' section")
                listed_names: list[str] = []
            else:
                listed_names = []
                seen_links: set[str] = set()
                for line in lines[shard_heading_idx + 1 :]:
                    stripped = line.strip()
                    if stripped.startswith("## "):
                        break
                    if not stripped.startswith("- "):
                        continue
                    row_match = INDEX_ROW_RE.match(stripped)
                    if not row_match:
                        status = "FAIL"
                        details.append(f"index row has invalid format: {stripped}")
                        continue

                    linked_name = row_match.group(1)
                    link_target = row_match.group(2)
                    if linked_name != link_target:
                        status = "FAIL"
                        details.append(
                            f"index row link text/target mismatch: text={linked_name} target={link_target}"
                        )

                    listed_names.append(link_target)
                    if link_target in seen_links:
                        status = "FAIL"
                        details.append(f"index duplicate shard entry: {link_target}")
                    seen_links.add(link_target)

                if listed_names != expected_names:
                    status = "FAIL"
                    details.append(
                        "index shard order mismatch with manifest: "
                        f"expected={expected_names} actual={listed_names}"
                    )

                for link_target in listed_names:
                    target_path = shard_dir / link_target
                    if not target_path.exists():
                        status = "FAIL"
                        details.append(f"index link target missing on disk: {_relpath(target_path)}")

        disk_shards = sorted(
            f.name
            for f in shard_dir.iterdir()
            if f.is_file() and SHARD_FILE_RE.match(f.name)
        ) if shard_dir.exists() else []

        expected_set = set(expected_names)
        disk_set = set(disk_shards)
        extras = sorted(disk_set - expected_set)
        missing = sorted(expected_set - disk_set)
        if extras:
            status = "FAIL"
            details.append(f"extra shard files on disk not in manifest: {extras}")
        if missing:
            status = "FAIL"
            details.append(f"manifest shard files missing on disk: {missing}")

        legacy_index_path = shard_dir / "_index.md"
        if legacy_index_path.exists():
            status = "FAIL"
            details.append(f"legacy shard index file detected: {_relpath(legacy_index_path)}")

        allowed_files = set(expected_names)
        allowed_files.update({"manifest.json", "00-index.md"})
        unexpected_files = sorted(
            f.name for f in shard_dir.iterdir() if f.is_file() and f.name not in allowed_files
        ) if shard_dir.exists() else []
        if unexpected_files:
            status = "FAIL"
            details.append(f"unexpected files in shard directory: {unexpected_files}")

        if status == "PASS":
            report_path.write_text("PASS\n", encoding="utf-8", newline="")
        else:
            report_path.write_text("\n".join(details) + "\n", encoding="utf-8", newline="")

        results[stem] = {
            "status": status,
            "details": "; ".join(details) if details else "OK",
        }

    return results


def check_clean_room(config: dict, reports_dir: Path) -> dict[str, dict]:
    output_root = _output_root(config)
    results: dict[str, dict] = {}

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_output = Path(tmpdir) / "out"
        tmp_output.mkdir(parents=True, exist_ok=True)

        generate_result = generate_shards(
            config,
            run_id="clean-room",
            output_root_override=tmp_output,
            canonical_output_root=config["output_root"],
            update_plans_index=False,
        )

        for source_rel in config["sources"]:
            stem = Path(source_rel).stem
            report_path = reports_dir / f"{stem}.clean_room.txt"
            status = "PASS"
            details: list[str] = []

            if generate_result["results"].get(stem, {}).get("status") != "PASS":
                status = "FAIL"
                details.append(
                    f"clean-room generation failed: {generate_result['results'].get(stem, {}).get('reason', 'unknown reason')}"
                )
            else:
                real_dir = output_root / stem
                temp_dir = tmp_output / stem
                real_files = _collect_generated_files(real_dir)
                temp_files = _collect_generated_files(temp_dir)

                if real_files.keys() != temp_files.keys():
                    status = "FAIL"
                    details.append(
                        "generated file set mismatch: "
                        f"real={sorted(real_files.keys())} temp={sorted(temp_files.keys())}"
                    )
                else:
                    diff_files = [
                        name for name in sorted(real_files.keys()) if real_files[name] != temp_files[name]
                    ]
                    if diff_files:
                        status = "FAIL"
                        details.append(
                            f"byte mismatch against clean-room output for files: {diff_files}"
                        )

            if status == "PASS":
                report_path.write_text("PASS\n", encoding="utf-8", newline="")
            else:
                report_path.write_text("\n".join(details) + "\n", encoding="utf-8", newline="")

            results[stem] = {
                "status": status,
                "details": "; ".join(details) if details else "OK",
            }

    return results


def _snapshot_idempotency_state(config: dict) -> dict[str, bytes]:
    output_root = _output_root(config)
    snapshot: dict[str, bytes] = {}

    for source_rel in config["sources"]:
        stem = Path(source_rel).stem
        shard_dir = output_root / stem
        for name, content in _collect_generated_files(shard_dir).items():
            snapshot[f"{stem}/{name}"] = content

    index_text = PLANS_INDEX_PATH.read_text(encoding="utf-8") if PLANS_INDEX_PATH.exists() else ""
    snapshot["__shard_index_section__"] = _extract_shard_indexes_section(index_text).encode("utf-8")
    return snapshot


def check_idempotency(config: dict) -> dict:
    first_generation = generate_shards(config, run_id="idempotency-pass-1", update_plans_index=True)
    first_fail_docs = [
        stem
        for stem, info in first_generation["results"].items()
        if info.get("status") != "PASS"
    ]
    if first_fail_docs:
        return {
            "status": "FAIL",
            "details": f"first idempotency generation failed for: {first_fail_docs}",
        }

    snap_first = _snapshot_idempotency_state(config)

    second_generation = generate_shards(config, run_id="idempotency-pass-2", update_plans_index=True)
    second_fail_docs = [
        stem
        for stem, info in second_generation["results"].items()
        if info.get("status") != "PASS"
    ]
    if second_fail_docs:
        return {
            "status": "FAIL",
            "details": f"second idempotency generation failed for: {second_fail_docs}",
        }

    snap_second = _snapshot_idempotency_state(config)

    if snap_first.keys() != snap_second.keys():
        return {
            "status": "FAIL",
            "details": (
                "idempotency keyset mismatch: "
                f"first={sorted(snap_first.keys())} second={sorted(snap_second.keys())}"
            ),
        }

    changed = [
        key
        for key in sorted(snap_first.keys())
        if snap_first[key] != snap_second[key]
    ]
    if changed:
        return {
            "status": "FAIL",
            "details": f"idempotency content drift after second generate: {changed}",
        }

    return {
        "status": "PASS",
        "details": "second generate produced no shard or shard-index-section changes",
    }


def _run_all_checks(config: dict, reports_dir: Path) -> dict:
    recon = check_reconstruction_and_lines(config, reports_dir)
    index_check = check_index_manifest(config, reports_dir)
    clean_room = check_clean_room(config, reports_dir)
    idempotency = check_idempotency(config)

    any_fail = any(info["status"] != "PASS" for info in recon.values())
    any_fail = any_fail or any(info["status"] != "PASS" for info in index_check.values())
    any_fail = any_fail or any(info["status"] != "PASS" for info in clean_room.values())
    any_fail = any_fail or idempotency["status"] != "PASS"

    return {
        "reconstruction": recon,
        "index_check": index_check,
        "clean_room": clean_room,
        "idempotency": idempotency,
        "status": "FAIL" if any_fail else "PASS",
    }


def _build_evidence_checks(config: dict, check_results: dict) -> list[dict]:
    checks: list[dict] = []

    for source_rel in config["sources"]:
        stem = Path(source_rel).stem
        recon_info = check_results["reconstruction"].get(stem, {"status": "FAIL", "details": "missing"})
        index_info = check_results["index_check"].get(stem, {"status": "FAIL", "details": "missing"})
        clean_info = check_results["clean_room"].get(stem, {"status": "FAIL", "details": "missing"})

        checks.append(
            {
                "name": f"reconstruction-line-accounting-{stem}",
                "result": recon_info["status"],
                "details": recon_info.get("details", ""),
            }
        )
        checks.append(
            {
                "name": f"index-manifest-{stem}",
                "result": index_info["status"],
                "details": index_info.get("details", ""),
            }
        )
        checks.append(
            {
                "name": f"clean-room-{stem}",
                "result": clean_info["status"],
                "details": clean_info.get("details", ""),
            }
        )

    checks.append(
        {
            "name": "idempotency-second-generate",
            "result": check_results["idempotency"]["status"],
            "details": check_results["idempotency"].get("details", ""),
        }
    )
    checks.append(
        {
            "name": "shard-naming-policy",
            "result": (
                "PASS"
                if all(info.get("status") == "PASS" for info in check_results["index_check"].values())
                else "FAIL"
            ),
            "details": (
                "Canonical shard naming policy: 00-index.md plus 01-* shard files. "
                "Legacy _index.md and 00-* shard files are invalid."
            ),
        }
    )

    return checks


def _dedupe_file_changes(entries: list[dict]) -> list[dict]:
    deduped: dict[str, dict] = {}
    for entry in entries:
        path = entry["path"]
        prev = deduped.get(path)
        if prev is None:
            deduped[path] = entry
            continue

        if prev["change_type"] == "added" and entry["change_type"] == "deleted":
            deduped[path] = {"path": path, "change_type": "modified"}
        else:
            deduped[path] = entry

    return [deduped[k] for k in sorted(deduped.keys())]


def write_evidence(
    config: dict,
    run_id: str,
    generate_exit_code: int,
    check_results: dict,
    generated_files_changed: list[dict],
) -> Path:
    evidence_dir = _evidence_root(config) / f"plan-sharding-{run_id}"
    reports_dir = evidence_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    commands_run = [
        {"cmd": "python3 scripts/pm-shard-plans.py --generate", "exit_code": generate_exit_code},
        {
            "cmd": "python3 scripts/pm-shard-plans.py --check",
            "exit_code": -1,
            "stdout_excerpt": "not yet run",
        },
        {
            "cmd": "python3 scripts/pm-plans-verify.py run-gates",
            "exit_code": -1,
            "stdout_excerpt": "not yet run",
        },
    ]
    _rewrite_commands_txt(reports_dir, commands_run)

    report_changes = [
        {"path": _relpath(path), "change_type": "modified"}
        for path in sorted(reports_dir.glob("*.txt"))
    ]
    report_changes.append(
        {"path": _relpath(reports_dir / "commands.txt"), "change_type": "modified"}
    )

    checks = _build_evidence_checks(config, check_results)
    all_pass = all(check["result"] == "PASS" for check in checks)

    evidence_path = evidence_dir / "evidence.json"
    files_changed = _dedupe_file_changes(
        generated_files_changed
        + report_changes
        + [
            {"path": _relpath(evidence_path), "change_type": "modified"},
        ]
    )

    evidence = {
        "schema_id": "pm.evidence.schema.v1",
        "evidence_id": f"plan-sharding-{run_id}",
        "created_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "node": {"node_id": "plan-sharding"},
        "summary": (
            "Plan sharding checks PASS: reconstruction, line accounting, index-manifest, clean-room, and idempotency."
            if all_pass
            else "Plan sharding checks FAILED; see per-doc reports and command logs."
        ),
        "commands_run": commands_run,
        "tool_calls": [{"tool_id": "pm-shard-plans", "count": 1}],
        "events": {
            "event_refs": [
                {
                    "source": "other",
                    "ref": f"plan-sharding-{run_id}",
                }
            ]
        },
        "files_changed": files_changed,
        "contract_refs_satisfied": [],
        "reproducibility": {
            "snapshot_ref": f"plan-sharding-{run_id}",
            "note": "Determinism validated by clean-room and idempotency checks.",
        },
        "artifacts": [{"path": _relpath(evidence_dir)}],
        "checks": checks,
    }

    if EVIDENCE_SCHEMA_PATH.exists():
        try:
            import jsonschema

            with EVIDENCE_SCHEMA_PATH.open("r", encoding="utf-8") as f:
                schema = json.load(f)
            jsonschema.validate(evidence, schema)
        except Exception as e:
            print(f"WARNING: could not validate evidence schema: {e}", file=sys.stderr)

    evidence_path.write_text(
        json.dumps(evidence, indent=2) + "\n",
        encoding="utf-8",
        newline="",
    )
    return evidence_path


def _print_check_table(config: dict, check_results: dict) -> None:
    print(f"{'Document':<50} {'Recon+Lines':<12} {'Index':<8} {'CleanRoom':<10}")
    print("-" * 92)
    for source_rel in config["sources"]:
        stem = Path(source_rel).stem
        recon_status = check_results["reconstruction"].get(stem, {}).get("status", "FAIL")
        index_status = check_results["index_check"].get(stem, {}).get("status", "FAIL")
        clean_status = check_results["clean_room"].get(stem, {}).get("status", "FAIL")
        print(f"{stem:<50} {recon_status:<12} {index_status:<8} {clean_status:<10}")

    print("\nIdempotency:")
    print(
        f"  status={check_results['idempotency']['status']} detail={check_results['idempotency'].get('details', '')}"
    )


def cmd_generate() -> int:
    config = load_config()
    run_id = _new_run_id()

    evidence_dir = _evidence_root(config) / f"plan-sharding-{run_id}"
    reports_dir = evidence_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    generation = generate_shards(config, run_id=run_id, update_plans_index=True)
    generation_fail = any(info.get("status") != "PASS" for info in generation["results"].values())

    check_results = _run_all_checks(config, reports_dir)
    checks_fail = check_results["status"] != "PASS"

    exit_code = 1 if generation_fail or checks_fail else 0

    evidence_path = write_evidence(
        config,
        run_id,
        generate_exit_code=exit_code,
        check_results=check_results,
        generated_files_changed=generation["files_changed"],
    )
    _write_latest_run_id(config, run_id)

    print("\n=== Shard generation + verification ===")
    _print_check_table(config, check_results)
    print(f"\nEvidence bundle: {_relpath(evidence_path)}")
    print(f"Reports: {_relpath(reports_dir)}")

    if exit_code != 0:
        print("\nFAIL: One or more sharding checks failed.", file=sys.stderr)
    else:
        print("\nAll sharding checks PASS.")
    return exit_code


def cmd_check() -> int:
    config = load_config()
    run_id = _read_latest_run_id(config) or _new_run_id()

    evidence_dir = _evidence_root(config) / f"plan-sharding-{run_id}"
    reports_dir = evidence_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    check_results = _run_all_checks(config, reports_dir)
    exit_code = 1 if check_results["status"] != "PASS" else 0

    print("\n=== Shard verification ===")
    _print_check_table(config, check_results)
    print(f"\nReports: {_relpath(reports_dir)}")

    recorded = update_evidence_command_status(
        config,
        run_id,
        "python3 scripts/pm-shard-plans.py --check",
        exit_code,
    )
    if not recorded:
        print("WARNING: Could not update evidence command status for --check.", file=sys.stderr)

    if exit_code != 0:
        print("\nOVERALL: FAIL", file=sys.stderr)
    else:
        print("\nOVERALL: PASS")
    return exit_code


def cmd_record_run_gates(exit_code: int) -> int:
    config = load_config()
    run_id = _read_latest_run_id(config) or _new_run_id()
    recorded = update_evidence_command_status(
        config,
        run_id,
        "python3 scripts/pm-plans-verify.py run-gates",
        exit_code,
    )
    return 0 if recorded else 1


def main() -> int:
    parser = argparse.ArgumentParser(
        prog="pm-shard-plans",
        description="Deterministic lossless plan-doc sharding for Puppet Master",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--generate",
        action="store_true",
        help="Generate/overwrite shards from source docs and write evidence",
    )
    group.add_argument(
        "--check",
        action="store_true",
        help="Verify reconstruction, line accounting, index-manifest, clean-room, and idempotency",
    )
    group.add_argument(
        "--record-run-gates-exit",
        type=int,
        help="Record pm-plans-verify.py run-gates exit code in latest evidence bundle",
    )

    args = parser.parse_args()

    if args.generate:
        return cmd_generate()
    if args.check:
        return cmd_check()
    if args.record_run_gates_exit is not None:
        return cmd_record_run_gates(args.record_run_gates_exit)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
