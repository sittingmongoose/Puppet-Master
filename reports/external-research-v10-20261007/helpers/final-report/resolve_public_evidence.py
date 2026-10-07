#!/usr/bin/env python3
"""Locate an exact original identity in the immutable ER10 public manifests.

Read-only. Invoke against a GitHub checkout at the report's pinned commit.
No filename-only/latest-version fallback and no raw source reconstruction claim.
"""
import argparse
import hashlib
import json
from pathlib import Path


def candidates(report):
    for manifest in sorted(report.glob("BATCH*_MANIFEST.json")):
        data = json.loads(manifest.read_text())
        for entry in data.get("entries", data.get("files", [])):
            original = entry.get("original_path") or entry.get("source_original_path")
            original = original or entry.get("source_runtime_relative_path")
            original_sha = entry.get("original_sha256") or entry.get("source_original_sha256")
            original_sha = original_sha or entry.get("sha256")
            target = entry.get("target_path") or entry.get("target_repo_relative_path")
            if not target and entry.get("public_path"):
                target = "reports/" + report.name + "/" + entry["public_path"]
            target_sha = entry.get("target_sha256") or entry.get("sha256")
            if original and target and original_sha and target_sha:
                yield manifest.name, original, original_sha, target, target_sha


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path, help="checkout/reports/external-research-v10-20261007")
    parser.add_argument("original", help="exact original absolute path or runtime-relative suffix")
    parser.add_argument("sha256", help="required original SHA-256; versions are never guessed")
    args = parser.parse_args()
    if len(args.sha256) != 64 or any(c not in "0123456789abcdef" for c in args.sha256):
        parser.error("sha256 must be 64 lowercase hexadecimal digits")
    report = args.report.resolve()
    repo = report.parents[1]
    found = {}
    for manifest, original, original_sha, target, target_sha in candidates(report):
        matches_path = original == args.original
        if not Path(args.original).is_absolute():
            matches_path = matches_path or original.endswith("/" + args.original)
        if matches_path and original_sha == args.sha256:
            path = (repo / target).resolve()
            if repo not in path.parents:
                raise ValueError("manifest target escapes the checkout")
            actual = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
            found[target] = {"target": target, "manifest": manifest,
                             "original_sha256": original_sha, "target_sha256": target_sha,
                             "actual_sha256": actual, "verified": actual == target_sha,
                             "unchanged_original_bytes": target_sha == original_sha}
    result = {"original": args.original, "sha256": args.sha256,
              "matches": list(found.values()),
              "unresolved_means": "No exact published identity found; raw source bodies may be excluded. Consult source locators/retention notes. A hash alone cannot reconstruct bytes."}
    print(json.dumps(result, indent=2))
    return 0 if found and all(x["verified"] for x in found.values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
