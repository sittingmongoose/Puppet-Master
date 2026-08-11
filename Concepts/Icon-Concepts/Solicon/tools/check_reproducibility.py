#!/usr/bin/env python3
"""Build Solicon twice and prove byte-for-byte reproducibility."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUILDER = ROOT / "tools" / "build_assets.py"
REPORT = ROOT / "verification" / "reproducibility-report.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def snapshot() -> dict[str, str]:
    return {
        path.relative_to(ROOT).as_posix(): sha256(path)
        for path in sorted(ROOT.rglob("*"))
        if path.is_file()
        and "verification" not in path.parts
        and "__pycache__" not in path.parts
        and path.suffix != ".pyc"
    }


def build() -> dict:
    result = subprocess.run(["python3", str(BUILDER)], cwd=ROOT, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def main() -> None:
    first_build = build()
    first = snapshot()
    second_build = build()
    second = snapshot()
    changed = sorted(path for path in set(first) | set(second) if first.get(path) != second.get(path))
    zip_paths = [path for path in second if path.endswith(".zip")]
    receipt = {
        "schema_id": "pm.solicon.reproducibility_receipt.v1",
        "status": "passed" if not changed else "failed",
        "build_one": first_build,
        "build_two": second_build,
        "files_compared": len(second),
        "zip_bundles_compared": len(zip_paths),
        "changed_paths": changed,
        "byte_for_byte_reproducible": not changed,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if changed:
        raise SystemExit(f"Reproducibility failure in {len(changed)} paths: {changed[:8]}")
    print(json.dumps({"files_compared": len(second), "zip_bundles_compared": len(zip_paths), "byte_for_byte_reproducible": True}, sort_keys=True))


if __name__ == "__main__":
    main()
