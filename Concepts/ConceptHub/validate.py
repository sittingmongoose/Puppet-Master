#!/usr/bin/env python3
"""Validate one standard Puppet Master model concept folder."""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

from catalog import CONCEPTS_DIR, CONTROL_MODES, OPEN_ACTIONS, PRESENTATIONS, WIDTH_ROLES, build_catalog, read_json, safe_child, normalize_name


TEMP_ARTIFACT_DIR_NAMES = {
    ".nyc_output",
    ".playwright",
    "blob-report",
    "browser-profile",
    "browser-profiles",
    "coverage",
    "playwright-profile",
    "playwright-profiles",
    "playwright-report",
    "playwright-results",
    "test-output",
    "test-outputs",
    "test-results",
    "traces",
    "verification",
    "verification-output",
    "verification-results",
    "verifications",
}
TEMP_ARTIFACT_FILE_NAMES = {
    "playwright-report.zip",
    "test-results.json",
    "trace.zip",
    "verification-results.json",
}
TEMP_ARTIFACT_FILE_PATTERN = re.compile(
    r"(?:^|[-_])(?:screen[-_]?recording|screenshot|test[-_]?video|verification[-_]?result)(?:[-_.]|$)",
    re.I,
)


def temporary_artifacts(folder: Path) -> List[str]:
    """Return generated test/verification material that must not ship."""
    found: List[str] = []
    for path in folder.rglob("*"):
        try:
            relative = path.relative_to(folder)
        except ValueError:
            continue
        name = path.name.lower()
        if path.is_dir() and name in TEMP_ARTIFACT_DIR_NAMES:
            # A tracked .gitignore may reserve an output directory without
            # retaining any generated verification material.
            has_output = any(child.name != ".gitignore" for child in path.rglob("*") if child.is_file())
            if has_output:
                found.append(f"{relative.as_posix()}/")
        elif path.is_file() and (name in TEMP_ARTIFACT_FILE_NAMES or TEMP_ARTIFACT_FILE_PATTERN.search(name)):
            found.append(relative.as_posix())
    return sorted(set(found))


def validate_width_control(value: Any, prefix: str = "widthControl") -> List[str]:
    errors: List[str] = []
    if value is None:
        return errors
    if not isinstance(value, dict):
        return [f"{prefix} must be an object"]
    role = str(value.get("role", "page"))
    if role not in WIDTH_ROLES:
        errors.append(f"{prefix}.role must be one of {sorted(WIDTH_ROLES)}")
    enabled = value.get("enabled", True)
    if not isinstance(enabled, bool):
        errors.append(f"{prefix}.enabled must be true or false")
    if enabled and not str(value.get("label", "")).strip():
        errors.append(f"{prefix}.label is required when enabled")
    if enabled:
        try:
            minimum = float(value.get("min"))
            maximum = float(value.get("max"))
            default = float(value.get("default"))
            step = float(value.get("step", 1))
            if minimum >= maximum:
                errors.append(f"{prefix}.min must be less than max")
            if not minimum <= default <= maximum:
                errors.append(f"{prefix}.default must be between min and max")
            if step <= 0:
                errors.append(f"{prefix}.step must be greater than zero")
            presets = value.get("presets", [])
            if not isinstance(presets, list) or any(not isinstance(item, (int, float)) or not minimum <= item <= maximum for item in presets):
                errors.append(f"{prefix}.presets must contain only widths between min and max")
        except (TypeError, ValueError):
            errors.append(f"{prefix} min, max, default, and step must be numbers")
    preview = value.get("previewWidth", "test")
    if preview != "test" and (not isinstance(preview, (int, float)) or preview <= 0):
        errors.append(f"{prefix}.previewWidth must be a positive number or 'test'")
    return errors


def bridge_supported(page: Path, source: str) -> bool:
    if "pm-concept-ready" in source and "pm-concept-state" in source:
        return True
    for match in re.finditer(r"<script[^>]+src=[\"']([^\"']+)[\"']", source, flags=re.I):
        src = match.group(1).split("?", 1)[0].split("#", 1)[0]
        if src.startswith(("http:", "https:", "//")):
            continue
        try:
            script = safe_child(page.parent, src)
            text = script.read_text(encoding="utf-8", errors="replace")
            if "pm-concept-ready" in text and "pm-concept-state" in text:
                return True
        except (OSError, ValueError):
            continue
    return False


def validate(folder: Path) -> List[str]:
    errors: List[str] = []
    folder = folder.resolve()
    manifest_path = folder / "concept-hub.json"
    try:
        manifest: Dict[str, Any] = read_json(manifest_path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        return [f"Cannot read {manifest_path}: {exc}"]
    if manifest.get("schemaVersion") != 1:
        errors.append("schemaVersion must be 1")
    topic = str(manifest.get("topic", "")).strip()
    model = str(manifest.get("model", "")).strip()
    presentation = str(manifest.get("presentation", "entries")).strip()
    if not topic:
        errors.append("topic is required")
    if not model:
        errors.append("model is required")
    elif normalize_name(model) not in normalize_name(folder.name) and not bool(manifest.get("unknownModel", False)):
        errors.append(f"folder name '{folder.name}' must include model name '{model}'")
    manifest_id = manifest.get("id")
    if manifest_id is not None and (not isinstance(manifest_id, str) or not manifest_id.strip()):
        errors.append("id must be a non-empty string when provided")
    if presentation not in PRESENTATIONS:
        errors.append(f"presentation must be one of {sorted(PRESENTATIONS)}")
    errors.extend(validate_width_control(manifest.get("widthControl")))
    entries = manifest.get("entries", [])
    if not isinstance(entries, list):
        errors.append("entries must be an array")
        entries = []
    workspace = manifest.get("workspace")
    if presentation in {"workspace", "hybrid"} and not isinstance(workspace, dict):
        errors.append(f"presentation '{presentation}' requires workspace")
    if presentation in {"entries", "hybrid"} and not entries:
        errors.append(f"presentation '{presentation}' requires at least one entry")
    artifacts = temporary_artifacts(folder)
    if artifacts:
        preview = ", ".join(artifacts[:10])
        if len(artifacts) > 10:
            preview += f", and {len(artifacts) - 10} more"
        errors.append(
            "temporary test/verification artifacts must be deleted before finishing: " + preview
        )
    targets: List[Dict[str, Any]] = [item for item in entries if isinstance(item, dict)]
    if isinstance(workspace, dict):
        targets.append(workspace)
    seen = set()
    expected_label = html.escape(model, quote=True)
    for index, item in enumerate(targets):
        entry_id = "workspace" if item is workspace else str(item.get("id", "")).strip()
        prefix = f"{entry_id or f'entry {index + 1}'}"
        if not entry_id:
            errors.append(f"{prefix}: id is required")
        elif entry_id in seen:
            errors.append(f"{prefix}: duplicate id")
        seen.add(entry_id)
        path_value = str(item.get("path", "")).strip()
        try:
            target = safe_child(folder, path_value)
            if not target.is_file():
                errors.append(f"{prefix}: missing page {path_value}")
                continue
        except ValueError as exc:
            errors.append(f"{prefix}: {exc}")
            continue
        open_actions = str(item.get("openActions", "both"))
        if open_actions not in OPEN_ACTIONS:
            errors.append(f"{prefix}: openActions must be one of {sorted(OPEN_ACTIONS)}")
        control_mode = str(item.get("controlMode", "internal" if item is workspace else "standard"))
        if control_mode not in CONTROL_MODES:
            errors.append(f"{prefix}: controlMode must be one of {sorted(CONTROL_MODES)}")
        preview_width = item.get("previewWidth")
        if preview_width is not None and preview_width != "test" and (not isinstance(preview_width, (int, float)) or preview_width <= 0):
            errors.append(f"{prefix}: previewWidth must be a positive number or 'test'")
        open_path = str(item.get("openPath", path_value)).strip()
        try:
            if not safe_child(folder, open_path).is_file():
                errors.append(f"{prefix}: missing openPath {open_path}")
        except ValueError as exc:
            errors.append(f"{prefix}: {exc}")
        source = target.read_text(encoding="utf-8", errors="replace")
        label_pattern = re.compile(r"data-concept-model\s*=\s*([\"'])" + re.escape(expected_label) + r"\1", re.I)
        if not label_pattern.search(source):
            errors.append(f"{prefix}: page must visibly label the model with data-concept-model=\"{model}\"")
        if control_mode == "standard" and not bridge_supported(target, source):
            errors.append(f"{prefix}: standard pages must support pm-concept-ready and pm-concept-state")

    parent = folder.parent
    for sibling_manifest in parent.glob("*/concept-hub.json"):
        if sibling_manifest.resolve() == manifest_path.resolve():
            continue
        try:
            sibling = read_json(sibling_manifest)
        except (OSError, ValueError, json.JSONDecodeError):
            continue
        if str(sibling.get("topic", "")).strip() == topic and normalize_name(str(sibling.get("model", ""))) == normalize_name(model):
            errors.append(f"duplicate model folder for {model}: {sibling_manifest.parent.name}")
    try:
        folder.relative_to(CONCEPTS_DIR)
        for registered in build_catalog().get("models", []):
            registered_folder = safe_child(CONCEPTS_DIR, str(registered.get("folder", ""))).resolve()
            registered_model = str(registered.get("catalogModel", registered.get("model", "")))
            if registered_folder != folder and str(registered.get("topic", "")) == topic and normalize_name(registered_model) == normalize_name(model):
                message = f"duplicate model folder for {model}: {registered_folder.name}"
                if message not in errors:
                    errors.append(message)
    except (OSError, ValueError):
        pass
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a Puppet Master model concept folder")
    parser.add_argument("folder", type=Path)
    args = parser.parse_args()
    errors = validate(args.folder)
    if errors:
        print(f"Concept validation failed ({len(errors)} issue{'s' if len(errors) != 1 else ''}):")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"Concept validation passed: {args.folder}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
