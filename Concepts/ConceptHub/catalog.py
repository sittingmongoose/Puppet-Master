#!/usr/bin/env python3
"""Catalog loading and validation helpers for the Puppet Master Concept Hub."""

from __future__ import annotations

import copy
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple


HUB_DIR = Path(__file__).resolve().parent
CONCEPTS_DIR = HUB_DIR.parent.resolve()
LEGACY_CATALOG = HUB_DIR / "catalog-legacy.json"
OVERRIDES_FILE = HUB_DIR / "catalog-overrides.json"
PRESENTATIONS = {"entries", "workspace", "hybrid"}
OPEN_ACTIONS = {"both", "none"}
CONTROL_MODES = {"standard", "internal"}
WIDTH_ROLES = {"page", "panel", "chat", "none"}


def default_width_control() -> Dict[str, Any]:
    return {
        "enabled": True,
        "label": "App width",
        "role": "page",
        "min": 520,
        "max": 1920,
        "step": 10,
        "default": 1280,
        "presets": [520, 768, 1280, 1600, 1920],
        "previewWidth": "test",
    }


def read_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"{path.name} must contain a JSON object")
    return data


def normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def safe_child(root: Path, relative: str) -> Path:
    if not isinstance(relative, str) or not relative.strip():
        raise ValueError("path must be a non-empty string")
    candidate = (root / relative).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f"path escapes its model folder: {relative}") from exc
    return candidate


def _default_topic(topic_id: str, order: int) -> Dict[str, Any]:
    label = topic_id.replace("-", " ").title()
    return {
        "id": topic_id,
        "label": label,
        "description": f"{label} concepts",
        "order": order,
        "widthControl": default_width_control(),
    }


def _manifest_models() -> Tuple[List[Dict[str, Any]], List[str]]:
    models: List[Dict[str, Any]] = []
    warnings: List[str] = []
    manifests = sorted(CONCEPTS_DIR.glob("*/*/concept-hub.json"))
    for manifest_path in manifests:
        if HUB_DIR in manifest_path.parents:
            continue
        try:
            manifest = read_json(manifest_path)
            folder = manifest_path.parent.resolve()
            folder_rel = folder.relative_to(CONCEPTS_DIR).as_posix()
            topic = str(manifest.get("topic", "")).strip()
            model = str(manifest.get("model", "")).strip()
            presentation = str(manifest.get("presentation", "entries")).strip()
            if manifest.get("schemaVersion") != 1:
                raise ValueError("schemaVersion must be 1")
            if not topic or not model:
                raise ValueError("topic and model are required")
            if presentation not in PRESENTATIONS:
                raise ValueError(f"presentation must be one of {sorted(PRESENTATIONS)}")
            if normalize_name(model) not in normalize_name(folder.name):
                raise ValueError(f"folder name '{folder.name}' must include model '{model}'")
            model_id = f"{topic}:{folder_rel}"
            models.append({
                "id": model_id,
                "topic": topic,
                "model": model,
                "folder": folder_rel,
                "presentation": presentation,
                "order": int(manifest.get("order", 1000)),
                "entries": copy.deepcopy(manifest.get("entries", [])),
                "workspace": copy.deepcopy(manifest.get("workspace")),
                "widthControl": copy.deepcopy(manifest.get("widthControl")),
                "source": "manifest",
            })
        except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
            rel = manifest_path.relative_to(CONCEPTS_DIR).as_posix()
            warnings.append(f"Could not load {rel}: {exc}")
    return models, warnings


def _entry_file_state(folder: Path, item: Dict[str, Any], default_control: str) -> Dict[str, Any]:
    result = copy.deepcopy(item)
    result.setdefault("openActions", "both")
    result.setdefault("controlMode", default_control)
    result.setdefault("tags", [])
    result.setdefault("order", 1000)
    result["broken"] = False
    path = str(result.get("path", "")).strip()
    try:
        target = safe_child(folder, path)
        if not target.is_file():
            result["broken"] = True
            result["problem"] = f"Missing file: {path}"
        else:
            result["modified"] = datetime.fromtimestamp(target.stat().st_mtime, timezone.utc).isoformat()
    except (OSError, ValueError) as exc:
        result["broken"] = True
        result["problem"] = str(exc)
    open_path = str(result.get("openPath", path)).strip()
    result["openPath"] = open_path
    try:
        open_target = safe_child(folder, open_path)
        if not open_target.is_file():
            result["broken"] = True
            result["problem"] = f"Missing open target: {open_path}"
    except (OSError, ValueError) as exc:
        result["broken"] = True
        result["problem"] = str(exc)
    if result["openActions"] not in OPEN_ACTIONS:
        result["openActions"] = "both"
    if result["controlMode"] not in CONTROL_MODES:
        result["controlMode"] = default_control
    return result


def _prepare_model(model: Dict[str, Any], warnings: List[str]) -> Dict[str, Any]:
    result = copy.deepcopy(model)
    folder_rel = str(result.get("folder", ""))
    try:
        folder = safe_child(CONCEPTS_DIR, folder_rel)
    except ValueError as exc:
        result["broken"] = True
        result["problem"] = str(exc)
        return result
    result["folderName"] = folder.name
    result["broken"] = not folder.is_dir()
    if result["broken"]:
        result["problem"] = f"Missing model folder: {folder_rel}"
        warnings.append(result["problem"])
    result.setdefault("entries", [])
    prepared_entries: List[Dict[str, Any]] = []
    seen_ids = set()
    for raw in result.get("entries", []):
        if not isinstance(raw, dict):
            warnings.append(f"{result.get('id')}: ignored non-object entry")
            continue
        entry = _entry_file_state(folder, raw, "standard")
        entry_id = str(entry.get("id", "")).strip()
        if not entry_id or entry_id in seen_ids:
            warnings.append(f"{result.get('id')}: missing or duplicate entry id '{entry_id}'")
            continue
        seen_ids.add(entry_id)
        entry["id"] = entry_id
        entry["kind"] = "concept"
        entry["uid"] = f"{result.get('id')}:{entry_id}"
        entry["title"] = str(entry.get("title") or entry_id)
        prepared_entries.append(entry)
    result["entries"] = prepared_entries
    workspace = result.get("workspace")
    if isinstance(workspace, dict):
        workspace = _entry_file_state(folder, workspace, "internal")
        workspace["id"] = "workspace"
        workspace["uid"] = f"{result.get('id')}:workspace"
        workspace["kind"] = "workspace"
        workspace["title"] = str(workspace.get("title") or "Model workspace")
        result["workspace"] = workspace
    elif result.get("presentation") in {"workspace", "hybrid"}:
        result["workspace"] = None
        warnings.append(f"{result.get('id')}: presentation requires a workspace")
    modified = [item.get("modified") for item in prepared_entries if item.get("modified")]
    if isinstance(result.get("workspace"), dict) and result["workspace"].get("modified"):
        modified.append(result["workspace"]["modified"])
    result["updatedAt"] = max(modified) if modified else None
    return result


def build_catalog(can_edit: bool = False, write_token: Optional[str] = None) -> Dict[str, Any]:
    legacy = read_json(LEGACY_CATALOG)
    manifest_models, warnings = _manifest_models()
    topics: Dict[str, Dict[str, Any]] = {item["id"]: copy.deepcopy(item) for item in legacy.get("topics", [])}
    legacy_models = copy.deepcopy(legacy.get("models", []))
    manifest_folders = {item["folder"] for item in manifest_models}
    models = [item for item in legacy_models if item.get("folder") not in manifest_folders]
    models.extend(manifest_models)
    for index, model in enumerate(models):
        model.setdefault("source", "legacy")
        topic_id = str(model.get("topic", "")).strip()
        if topic_id and topic_id not in topics:
            topics[topic_id] = _default_topic(topic_id, 1000 + index)
        width_control = model.get("widthControl")
        if topic_id and isinstance(width_control, dict):
            current = topics[topic_id].get("widthControl")
            if not isinstance(current, dict) or current == default_width_control():
                topics[topic_id]["widthControl"] = copy.deepcopy(width_control)

    try:
        overrides = read_json(OVERRIDES_FILE)
        labels = overrides.get("labels", {})
        if not isinstance(labels, dict):
            labels = {}
            warnings.append("catalog-overrides.json labels must be an object")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        labels = {}
        warnings.append(f"Could not read catalog overrides: {exc}")

    prepared: List[Dict[str, Any]] = []
    for model in models:
        item = _prepare_model(model, warnings)
        item["catalogModel"] = str(item.get("model", "Unknown"))
        override = labels.get(str(item.get("id")))
        has_override = isinstance(override, str) and bool(override.strip())
        item["displayModel"] = str(override).strip() if has_override else item["catalogModel"]
        if has_override:
            item["unknownModel"] = False
        prepared.append(item)

    duplicate_keys: Dict[Tuple[str, str], List[str]] = {}
    for item in prepared:
        if item.get("unknownModel"):
            continue
        key = (str(item.get("topic")), normalize_name(str(item.get("catalogModel"))))
        duplicate_keys.setdefault(key, []).append(str(item.get("folder")))
    for (topic, model_name), folders in duplicate_keys.items():
        if model_name and len(folders) > 1:
            warnings.append(f"Duplicate model folders in {topic}: {', '.join(folders)}")

    topic_list = sorted(topics.values(), key=lambda item: (int(item.get("order", 1000)), item.get("label", "")))
    prepared.sort(key=lambda item: (
        next((int(t.get("order", 1000)) for t in topic_list if t.get("id") == item.get("topic")), 1000),
        int(item.get("order", 1000)),
        str(item.get("displayModel", "")).lower(),
    ))
    card_count = sum(len(item.get("entries", [])) + (1 if isinstance(item.get("workspace"), dict) else 0) for item in prepared)
    response: Dict[str, Any] = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "topics": topic_list,
        "models": prepared,
        "warnings": warnings,
        "counts": {"topics": len(topic_list), "models": len(prepared), "cards": card_count},
        "canEdit": can_edit,
        "baseline": {"label": "PMConcept7", "path": "PMConcept7.html"},
    }
    if can_edit and write_token:
        response["writeToken"] = write_token
    return response


def known_model_ids() -> Iterable[str]:
    return (item["id"] for item in build_catalog().get("models", []))
