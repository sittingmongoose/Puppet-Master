#!/usr/bin/env python3
"""Validate Puppet Master GUI icon and emoji policy."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]

SOURCE_ROOTS = [
    "ui",
    "src",
    "app",
    "apps",
    "crates",
    "frontend",
    "web",
    "wasm",
    "native",
]
SOURCE_EXTENSIONS = {
    ".slint",
    ".rs",
    ".html",
    ".css",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".svg",
    ".json",
    ".toml",
}
TEXT_EXTENSIONS = SOURCE_EXTENSIONS - {".svg", ".json", ".toml"}
EXCLUDED_DIRS = {
    ".git",
    "target",
    "node_modules",
    "dist",
    "build",
    "out",
    ".next",
    ".svelte-kit",
}
MANIFEST_CANDIDATES = [
    "ui/icons/icon_manifest.json",
    "ui/assets/icons/icon_manifest.json",
    "assets/icons/icon_manifest.json",
    "src/icons/icon_manifest.json",
    "crates/gui/assets/icons/icon_manifest.json",
]
MANIFEST_REQUIRED_FIELDS = {
    "icon_id",
    "path",
    "semantic_label",
    "theme_behavior",
    "size_slots",
    "accessible_label",
    "fallback_text",
}

REMOTE_ICON_RE = re.compile(
    r"(https?:)?//[^\s\"')]*(icon|icons|svg|fontawesome|material-icons|heroicons|lucide|bootstrap-icons|"
    r"cdn\.jsdelivr|unpkg|cdnjs|fonts\.googleapis|fonts\.gstatic)",
    re.IGNORECASE,
)
ICON_ONLY_RE = re.compile(r"\bIconButton\b|\bicon_id\b|\bicon-id\b", re.IGNORECASE)
ACCESSIBLE_LABEL_RE = re.compile(
    r"accessible[-_ ]?label|aria-label|tooltip|semantic_label|fallback_text|\blabel\s*[:=]",
    re.IGNORECASE,
)


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def source_roots(extra_roots: list[str]) -> list[Path]:
    roots: list[Path] = []
    for raw in [*SOURCE_ROOTS, *extra_roots]:
        path = Path(raw)
        if not path.is_absolute():
            path = ROOT / path
        if path.exists() and path.is_dir():
            roots.append(path)
    return sorted(set(roots))


def iter_source_files(roots: list[Path]) -> list[Path]:
    files: list[Path] = []
    for root in roots:
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if any(part in EXCLUDED_DIRS for part in path.relative_to(root).parts):
                continue
            if path.suffix.lower() in SOURCE_EXTENSIONS:
                files.append(path)
    return sorted(set(files))


def codepoint_is_pictographic(value: int) -> bool:
    # Conservative Extended_Pictographic-style guard for GUI source. It includes
    # emoji blocks plus common symbolic pseudo-icon ranges.
    ranges = (
        (0x2190, 0x21FF),  # arrows
        (0x2300, 0x23FF),  # technical symbols
        (0x2460, 0x24FF),  # enclosed alphanumerics
        (0x25A0, 0x25FF),  # geometric shapes
        (0x2600, 0x27BF),  # misc symbols and dingbats
        (0x2B00, 0x2BFF),  # arrows and misc symbols
        (0x1F000, 0x1FAFF),  # emoji and symbols supplement blocks
    )
    return any(start <= value <= end for start, end in ranges)


def scan_text_policy(path: Path, failures: list[dict[str, Any]]) -> None:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return

    for line_no, line in enumerate(text.splitlines(), 1):
        for char in line:
            if codepoint_is_pictographic(ord(char)):
                failures.append(
                    {
                        "path": rel(path),
                        "line": line_no,
                        "policy": "no_emoji_or_unicode_pseudo_icons",
                        "codepoint": f"U+{ord(char):04X}",
                        "excerpt": line.strip()[:160],
                    }
                )
                break
        if REMOTE_ICON_RE.search(line):
            failures.append(
                {
                    "path": rel(path),
                    "line": line_no,
                    "policy": "no_network_or_cdn_icons",
                    "excerpt": line.strip()[:160],
                }
            )


def scan_icon_button_labels(path: Path, failures: list[dict[str, Any]]) -> None:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except UnicodeDecodeError:
        return
    for index, line in enumerate(lines):
        if not ICON_ONLY_RE.search(line):
            continue
        window = "\n".join(lines[index : min(len(lines), index + 8)])
        if not ACCESSIBLE_LABEL_RE.search(window):
            failures.append(
                {
                    "path": rel(path),
                    "line": index + 1,
                    "policy": "icon_only_controls_require_accessible_labels",
                    "excerpt": line.strip()[:160],
                }
            )


def load_icon_manifest(path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    errors: list[str] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [], [f"{rel(path)}: invalid JSON: {exc}"]
    if isinstance(data, dict):
        icons = data.get("icons", data.get("entries"))
    else:
        icons = data
    if not isinstance(icons, list):
        return [], [f"{rel(path)}: manifest must be a list or object with icons/entries list"]
    entries: list[dict[str, Any]] = []
    for index, entry in enumerate(icons, 1):
        if not isinstance(entry, dict):
            errors.append(f"{rel(path)}: icon entry {index} is not an object")
            continue
        entries.append(entry)
    return entries, errors


def resolve_manifest_icon_path(manifest_path: Path, value: str) -> Path:
    raw = Path(value)
    if raw.is_absolute():
        return raw
    repo_relative = ROOT / raw
    if repo_relative.exists():
        return repo_relative
    return manifest_path.parent / raw


def validate_svg_manifest(files: list[Path], failures: list[dict[str, Any]], warnings: list[str]) -> None:
    svg_files = [path for path in files if path.suffix.lower() == ".svg"]
    icon_references = [path for path in files if path.suffix.lower() in TEXT_EXTENSIONS and path.read_text(encoding="utf-8", errors="ignore").find("icon_id") >= 0]
    if not svg_files and not icon_references:
        return

    manifest_path = next((ROOT / candidate for candidate in MANIFEST_CANDIDATES if (ROOT / candidate).exists()), None)
    if manifest_path is None:
        failures.append(
            {
                "path": "icon_manifest.json",
                "policy": "missing_icon_manifest",
                "message": "GUI source references SVG/icon_id assets but no approved icon_manifest.json was found.",
            }
        )
        return

    entries, errors = load_icon_manifest(manifest_path)
    for error in errors:
        failures.append({"path": rel(manifest_path), "policy": "invalid_icon_manifest", "message": error})

    manifest_svg_paths: set[str] = set()
    icon_ids: set[str] = set()
    for index, entry in enumerate(entries, 1):
        missing = sorted(MANIFEST_REQUIRED_FIELDS - set(entry))
        if missing:
            failures.append(
                {
                    "path": rel(manifest_path),
                    "policy": "icon_manifest_entry_missing_fields",
                    "entry_index": index,
                    "missing": missing,
                }
            )
            continue
        icon_id = entry.get("icon_id")
        if not isinstance(icon_id, str) or not icon_id.strip():
            failures.append(
                {
                    "path": rel(manifest_path),
                    "policy": "icon_manifest_icon_id_invalid",
                    "entry_index": index,
                }
            )
        elif icon_id in icon_ids:
            failures.append(
                {
                    "path": rel(manifest_path),
                    "policy": "icon_manifest_duplicate_icon_id",
                    "entry_index": index,
                    "icon_id": icon_id,
                }
            )
        else:
            icon_ids.add(icon_id)

        if not isinstance(entry.get("size_slots"), list) or not entry.get("size_slots"):
            failures.append(
                {
                    "path": rel(manifest_path),
                    "policy": "icon_manifest_size_slots_invalid",
                    "entry_index": index,
                    "icon_id": icon_id,
                }
            )

        icon_path_value = entry.get("path")
        if isinstance(icon_path_value, str):
            icon_path = resolve_manifest_icon_path(manifest_path, icon_path_value)
            if not icon_path.exists():
                failures.append(
                    {
                        "path": rel(manifest_path),
                        "policy": "icon_manifest_path_missing",
                        "entry_index": index,
                        "icon_id": icon_id,
                        "icon_path": icon_path_value,
                    }
                )
            elif icon_path.suffix.lower() != ".svg":
                failures.append(
                    {
                        "path": rel(manifest_path),
                        "policy": "icon_manifest_path_not_svg",
                        "entry_index": index,
                        "icon_id": icon_id,
                        "icon_path": icon_path_value,
                    }
                )
            else:
                manifest_svg_paths.add(rel(icon_path))

    for svg in svg_files:
        if rel(svg) not in manifest_svg_paths:
            failures.append(
                {
                    "path": rel(svg),
                    "policy": "svg_missing_icon_id_manifest_entry",
                    "message": "Every production SVG asset must have an icon_id manifest entry.",
                }
            )

    if not entries:
        warnings.append(f"{rel(manifest_path)} exists but contains no icon entries.")


def build_report(args: argparse.Namespace) -> tuple[dict[str, Any], int]:
    roots = source_roots(args.source_root)
    files = iter_source_files(roots)
    failures: list[dict[str, Any]] = []
    warnings: list[str] = []

    if not roots or not files:
        report = {
            "schema_id": "pm.gui_asset_policy_report.v1",
            "status": "not_applicable",
            "policy_state": "pending_no_gui_source_yet",
            "source_roots": [rel(path) for path in roots],
            "checked_files": 0,
            "failures": [],
            "warnings": [
                "No GUI source tree exists yet; policy is pending/not-applicable until GUI source is introduced."
            ],
        }
        return report, 0

    for path in files:
        if path.suffix.lower() in SOURCE_EXTENSIONS:
            scan_text_policy(path, failures)
            scan_icon_button_labels(path, failures)
    validate_svg_manifest(files, failures, warnings)

    report = {
        "schema_id": "pm.gui_asset_policy_report.v1",
        "status": "fail" if failures else "pass",
        "policy_state": "enforced",
        "source_roots": [rel(path) for path in roots],
        "checked_files": len(files),
        "failures": failures,
        "warnings": warnings,
    }
    return report, 1 if failures else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-root",
        action="append",
        default=[],
        help="Additional GUI source root to scan. May be repeated.",
    )
    args = parser.parse_args(argv)
    report, exit_code = build_report(args)
    print(json.dumps(report, indent=2, sort_keys=True))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
