#!/usr/bin/env python3
"""Copy I1 current reports and deferred acquisition artifacts into one reviewer workspace.

This creates a presentation split, not an access barrier. Reading chronology is a
reviewer-prompt instruction. Case corpus and key are staged by the existing workflow.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path


def _mapping(value: str) -> tuple[Path, Path]:
    if "=" not in value:
        raise argparse.ArgumentTypeError("deferred mapping must be SOURCE=RELATIVE_DESTINATION")
    source_text, relative_text = value.rsplit("=", 1)
    source, relative = Path(source_text), Path(relative_text)
    if not source_text or not relative_text or not relative.parts or relative.is_absolute() or any(p in ("", ".", "..") for p in relative.parts):
        raise argparse.ArgumentTypeError("deferred destination must be a nonempty safe relative path")
    return source, relative


def _copy(source: Path, destination: Path, workspace: Path) -> dict[str, str]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    return {"path": destination.relative_to(workspace).as_posix(),
            "sha256": hashlib.sha256(destination.read_bytes()).hexdigest()}


def stage(workspace: Path, x1_current: Path, x2_current: Path,
          x1_deferred: list[tuple[Path, Path]], x2_deferred: list[tuple[Path, Path]]) -> dict[str, object]:
    if not x1_deferred or not x2_deferred:
        raise ValueError("both arms require an explicit deferred acquisition inventory")
    destinations: list[tuple[Path, Path]] = [
        (x1_current, workspace / "first_view/results/X1/current.md"),
        (x2_current, workspace / "first_view/results/X2/current.md"),
    ]
    workspace_root = workspace.resolve()
    for label, mappings in (("X1", x1_deferred), ("X2", x2_deferred)):
        for source, relative in mappings:
            if relative.is_absolute() or not relative.parts or ".." in relative.parts:
                raise ValueError(f"unsafe deferred destination: {relative}")
            destination = workspace / "deferred" / label / relative
            expected_root = workspace_root / "deferred" / label
            if not destination.resolve().is_relative_to(expected_root):
                raise ValueError(f"deferred destination escapes {label}: {relative}")
            destinations.append((source, destination))
    target_paths = [destination.resolve() for _, destination in destinations]
    if len(set(target_paths)) != len(target_paths):
        raise ValueError("duplicate staging destination")
    if any(not target.is_relative_to(workspace_root) for target in target_paths):
        raise ValueError("staging destination escapes reviewer workspace")
    for label, (_, destination) in (("X1", destinations[0]), ("X2", destinations[1])):
        expected_root = workspace_root / "first_view" / "results" / label
        if not destination.resolve().is_relative_to(expected_root):
            raise ValueError(f"current report destination escapes first_view/results/{label}")
    for source, destination in destinations:
        if not source.is_file():
            raise ValueError(f"source is not a file: {source}")
        if source.resolve() == destination.resolve():
            raise ValueError(f"source equals destination: {source}")
    first_view = workspace / "first_view"
    if first_view.exists():
        unexpected = {p.name for p in first_view.iterdir()} - {"case", "key", "results"}
        if unexpected:
            raise ValueError(f"unexpected first_view paths: {sorted(unexpected)}")
    results = first_view / "results"
    if results.exists():
        unexpected = {p.name for p in results.iterdir()} - {"X1", "X2"}
        if unexpected:
            raise ValueError(f"unexpected first_view/results paths: {sorted(unexpected)}")
    # A reused package may carry a superseded result. Refuse it rather than overwrite a subset.
    for relative in ("first_view/results/X1", "first_view/results/X2", "deferred/X1", "deferred/X2"):
        folder = workspace / relative
        if folder.exists() and any(folder.iterdir()):
            raise ValueError(f"staging directory must start empty: {folder}")
    if (workspace / "deferred/INVENTORY.json").exists():
        raise ValueError("deferred acquisition inventory already exists")
    inventory: dict[str, object] = {
        "schema": "i1-acquisition-inventory/v1",
        "gate": "prompt_only_same_readable_workspace",
        "case_and_key": "supplied by existing copy workflow under first_view",
        "first_view": [], "deferred": [],
    }
    for source, destination in destinations:
        group = destination.relative_to(workspace).parts[0]
        inventory[group].append(_copy(source, destination, workspace))
    inventory_path = workspace / "deferred/INVENTORY.json"
    inventory_path.write_text(json.dumps(inventory, indent=2) + "\n", encoding="utf-8")
    return inventory


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", type=Path, required=True)
    parser.add_argument("--x1-current", type=Path, required=True)
    parser.add_argument("--x2-current", type=Path, required=True)
    parser.add_argument("--x1-deferred", type=_mapping, action="append", default=[])
    parser.add_argument("--x2-deferred", type=_mapping, action="append", default=[])
    args = parser.parse_args()
    try:
        stage(args.workspace, args.x1_current, args.x2_current, args.x1_deferred, args.x2_deferred)
    except (OSError, ValueError) as exc:
        parser.exit(2, f"stage_i1: {exc}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
