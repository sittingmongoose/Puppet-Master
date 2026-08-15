#!/usr/bin/env python3
"""Build/validate durable custody for the corrected runtime packet.

The archive may live outside the repository.  The committed index retains exact
member hashes and validates every live root-Plan packet reference without copying
the packet or embedding a local attachment path in canon.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PACKET_NAME = "PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13"
ARCHIVE_BASENAME = f"{PACKET_NAME}.zip"
ARCHIVE_SHA256 = "8ec8184b055c0f3ddfc03c2848dde6f6e27c1abb067c2f08cdb5f4bde081053b"
MANIFEST_SHA256 = "449230aee06c923d85d4f88a166547bd54f59e2a7fd3863027afc7885b3f95ce"
INDEX_PATH = ROOT / "reports/shared-runtime-integration-2026-08-13/PACKET_SOURCE_INDEX.json"
REF_RE = re.compile(rf"{re.escape(PACKET_NAME)}/([A-Za-z0-9_./-]+\.(?:md|json))")
EXCLUDED_PARTS = {
    "_shards", "ledgers", ".evidence", ".plan_index", ".implementation_readiness",
    ".plan_migration",
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def build_index(archive_path: Path) -> dict[str, Any]:
    archive_bytes = archive_path.read_bytes()
    if sha256_bytes(archive_bytes) != ARCHIVE_SHA256:
        raise ValueError("corrected packet archive SHA-256 mismatch")
    with zipfile.ZipFile(archive_path) as archive:
        manifest_member = f"{PACKET_NAME}/PACKET_MANIFEST.json"
        manifest_bytes = archive.read(manifest_member)
        if sha256_bytes(manifest_bytes) != MANIFEST_SHA256:
            raise ValueError("packet manifest SHA-256 mismatch")
        manifest = json.loads(manifest_bytes)
        members: list[dict[str, Any]] = []
        for declared in manifest["files"]:
            member_name = f"{PACKET_NAME}/{declared['path']}"
            value = archive.read(member_name)
            actual = {"path": declared["path"], "bytes": len(value), "sha256": sha256_bytes(value)}
            if actual != declared:
                raise ValueError(f"manifest member mismatch: {declared['path']}")
            members.append(actual)
        archive_names = {
            name.removeprefix(f"{PACKET_NAME}/")
            for name in archive.namelist()
            if name.startswith(f"{PACKET_NAME}/") and not name.endswith("/")
        }
        expected_names = {member["path"] for member in members} | {"PACKET_MANIFEST.json"}
        if archive_names != expected_names:
            raise ValueError("archive member set differs from manifest plus manifest self")
    return {
        "schema_id": "pm.runtime_packet_source_index.v1",
        "schema_version": "1.0.0",
        "generated_at_utc": "2026-08-14T00:00:00Z",
        "packet_name": PACKET_NAME,
        "revision": "corrected-2026-08-13",
        "archive_basename": ARCHIVE_BASENAME,
        "archive_sha256": ARCHIVE_SHA256,
        "manifest_member": {
            "path": "PACKET_MANIFEST.json",
            "bytes": len(manifest_bytes),
            "sha256": MANIFEST_SHA256,
            "manifest_self_hash": False,
        },
        "manifest_declared_member_count": len(members),
        "archive_file_member_count": len(expected_names),
        "members": members,
        "content_identity_aliases": [{
            "paths": [
                "reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md",
                "reference/PERFORMANCE_CURRENT_DECISION_REGISTER.md",
            ],
            "sha256": "3df7ad729c5ea1be0df192d19845e42326b5047de03e9f59fbe4918943e0150d",
            "disposition": "intentional_original_filename_alias",
        }],
        "authority_note": (
            "Source-custody index only. It proves archive/member identity and live reference resolvability; "
            "it does not make the packet canonical over Plans, prove implementation, or seal governance."
        ),
    }


def live_root_plan_files() -> list[Path]:
    return sorted(
        path for path in (ROOT / "Plans").rglob("*")
        if path.is_file()
        and path.suffix in {".md", ".json"}
        and not any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT / "Plans").parts)
    )


def validate_index(index: dict[str, Any], archive_path: Path | None) -> list[str]:
    failures: list[str] = []
    if index.get("schema_id") != "pm.runtime_packet_source_index.v1":
        failures.append("packet_source_index_schema_id_invalid")
    if index.get("packet_name") != PACKET_NAME:
        failures.append("packet_source_index_packet_name_invalid")
    if index.get("archive_sha256") != ARCHIVE_SHA256:
        failures.append("packet_source_index_archive_hash_invalid")
    if index.get("manifest_member", {}).get("sha256") != MANIFEST_SHA256:
        failures.append("packet_source_index_manifest_hash_invalid")
    members = index.get("members", [])
    paths = [member.get("path") for member in members]
    if len(paths) != 33 or len(set(paths)) != 33:
        failures.append("packet_source_index_member_denominator_invalid")
    declared = set(paths) | {"PACKET_MANIFEST.json"}
    live_refs: list[tuple[str, str]] = []
    for path in live_root_plan_files():
        text = path.read_text(encoding="utf-8")
        relative = str(path.relative_to(ROOT))
        if "corrected-runtime-packet:" in text:
            failures.append(f"unregistered_packet_alias:{relative}")
        if "01_T3_PROVIDER_INSTALLATION_AND_CAPABILITY_LIFECYCLE.md" in text:
            failures.append(f"missing_packet_member_reference:{relative}")
        if "reference/EGOLITE_INTEGRATION_RUNTIME_RETURN.md#wsl-and-environment-profiles" in text:
            failures.append(f"invalid_packet_fragment:{relative}")
        for match in REF_RE.finditer(text):
            member = match.group(1)
            live_refs.append((relative, member))
            if member not in declared:
                failures.append(f"unknown_packet_member:{relative}:{member}")
    if not live_refs:
        failures.append("no_live_packet_references_found")
    index["live_reference_validation"] = {
        "scanned_root_plan_files": len(live_root_plan_files()),
        "reference_occurrences": len(live_refs),
        "unique_referenced_members": len({member for _, member in live_refs}),
        "all_references_resolve": not any(value.startswith("unknown_packet_member:") for value in failures),
    }
    if archive_path is not None:
        try:
            rebuilt = build_index(archive_path)
            if rebuilt["members"] != members:
                failures.append("packet_source_index_archive_member_drift")
        except (OSError, ValueError, KeyError, zipfile.BadZipFile) as error:
            failures.append(f"packet_archive_validation_failed:{error}")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("build", "validate"))
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    if args.mode == "build":
        if args.archive is None:
            parser.error("--archive is required for build")
        index = build_index(args.archive)
    else:
        index = read_json(INDEX_PATH)
    failures = validate_index(index, args.archive)
    if failures:
        print(json.dumps({"status": "fail", "failures": failures}, indent=2))
        return 1
    if args.mode == "build":
        INDEX_PATH.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": "pass",
        "members": len(index["members"]),
        "archive_sha256": index["archive_sha256"],
        "live_reference_validation": index["live_reference_validation"],
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
