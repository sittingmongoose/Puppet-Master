#!/usr/bin/env python3
"""Verify the lean candidate file manifest without touching runtime evidence."""

from __future__ import annotations

from pathlib import Path

import pipeline


HERE = Path(__file__).resolve().parent


def verify_freeze() -> dict[str, object]:
    manifest = pipeline.load_json(HERE / "freeze_manifest.json")
    paths: set[str] = set()
    for row in manifest["files"]:
        relative = row["path"]
        if relative in paths:
            raise pipeline.PipelineError(f"duplicate frozen path: {relative}")
        paths.add(relative)
        path = (HERE / relative).resolve()
        if path.parent != HERE and HERE not in path.parents:
            raise pipeline.PipelineError(f"frozen path escapes root: {relative}")
        if not path.is_file() or path.is_symlink():
            raise pipeline.PipelineError(f"frozen file absent or unsafe: {relative}")
        if path.stat().st_size != row["bytes"] or pipeline.sha256_file(path) != row["sha256"]:
            raise pipeline.PipelineError(f"frozen bytes drift: {relative}")
    actual = {
        path.relative_to(HERE).as_posix()
        for path in HERE.rglob("*")
        if path.is_file()
        and not path.relative_to(HERE).as_posix().startswith("evidence/")
        and path.relative_to(HERE).as_posix() not in {"PROGRESS.md", "freeze_manifest.json", "PUSH_CUSTODY.json"}
        and "__pycache__" not in path.parts
        and path.suffix not in {".pyc", ".pyo"}
    }
    if actual != paths:
        raise pipeline.PipelineError(f"frozen roster drift: missing={sorted(paths-actual)} extra={sorted(actual-paths)}")
    return {"status": "PASS_FROZEN_ZERO_SUBJECT", "files": len(paths), "qualification_credit": 0}


if __name__ == "__main__":
    print(pipeline.canonical_json(verify_freeze()))
