"""Route landing validators' audit reads to the edition pinned by their launcher."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterator

AUDIT_REL = "Plans/.audits/event-authority-2026-08-13-currentness"
SNAPSHOT_CAPABILITY = "landing-readiness-snapshot-v1"
SNAPSHOT_ENV = "PM_LANDING_READINESS_SNAPSHOT"
SNAPSHOT_REPO_ENV = "PM_LANDING_READINESS_REPO"
SNAPSHOT_WALK_ENV = "PM_LANDING_READINESS_WALK"
SNAPSHOT_ENV_NAMES = (SNAPSHOT_ENV, SNAPSHOT_REPO_ENV, SNAPSHOT_WALK_ENV)


def snapshot_for(root: Path) -> Path | None:
    # Some validators exercise an independent tree in a self-test. They must read their fixture.
    path = os.environ.get(SNAPSHOT_ENV)
    if path is not None and str(root) == os.environ.get(SNAPSHOT_REPO_ENV):
        return Path(path)
    return None


def audit_input(root: Path, relative: str) -> Path:
    """Resolve an edition input while leaving canonical source reads in the repository."""
    if relative.startswith(AUDIT_REL + "/"):
        snapshot = snapshot_for(root)
        if snapshot is not None:
            return snapshot / relative.removeprefix(AUDIT_REL + "/")
    return root / relative


def logical_path(root: Path, path: Path) -> Path:
    snapshot = snapshot_for(root)
    if snapshot is not None and path.is_relative_to(snapshot):
        return root / AUDIT_REL / path.relative_to(snapshot)
    return path


def tree_paths(root: Path, start: Path) -> Iterator[Path]:
    """Walk the tree in its usual order, substituting the pinned edition at its logical location."""
    snapshot = snapshot_for(root)
    if snapshot is None:
        yield from start.rglob("*")
        return

    edition = root / AUDIT_REL
    walk_edition = os.environ.get(SNAPSHOT_WALK_ENV) == "1"

    def walk(directory: Path) -> Iterator[Path]:
        try:
            children = list(directory.iterdir())
        except OSError:
            return
        if directory == edition.parent and edition not in children and walk_edition:
            children.append(edition)
        for path in children:
            yield path
        for path in children:
            if path == edition:
                if walk_edition:
                    yield from snapshot.rglob("*")
            elif not path.is_symlink() and path.is_dir():
                yield from walk(path)

    if start.is_dir():
        yield from walk(start)
