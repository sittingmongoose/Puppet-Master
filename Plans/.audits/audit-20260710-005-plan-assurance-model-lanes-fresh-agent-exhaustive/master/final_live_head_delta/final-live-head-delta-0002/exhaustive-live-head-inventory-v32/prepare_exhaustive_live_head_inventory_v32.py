#!/usr/bin/env python3
"""Create the append-only, preparation-only exhaustive live-head inventory."""
from __future__ import annotations

import datetime
import hashlib
import json
import os
import pathlib
import stat
import subprocess
import sys
import time
from typing import Any

sys.dont_write_bytecode = True

REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster").resolve()
AUDIT_REL = pathlib.Path("Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
TX_REL = AUDIT_REL / "master/final_live_head_delta/final-live-head-delta-0002"
NS_REL = TX_REL / "exhaustive-live-head-inventory-v32"
NS = REPO / NS_REL
OBS_REL = NS_REL / "observations"
OBS = REPO / OBS_REL
STATUS = "PASS_SEALED_EXHAUSTIVE_299_PREPARATION_ONLY_BLOCKED_FRESH_LUNA_INVENTORY_PRELAUNCH"
EXPECTED = {
    "path_count": 299,
    "modified_tracked": 296,
    "untracked": 3,
    "total_bytes": 45176236,
    "status_sha256": "cab64dacb1dedec2c8dd63c3a160e44700e5052e409fc46d45dcd581085812a6",
    "status_z_sha256": "366a43b70b49c4f98748c2313f51e580ec03ae5ef5ce9fa7acec1a03e12b9256",
    "content_state_sha256": "cd988d47ef4c935baf4347d7199cfa293d508393363a2bf77b77336aad695a1f",
    "path_set_sha256": "6af46a1fc6c3178d030b48ef757caeca4d00840dc824da3eab8948f0329619f4",
    "semantic_count": 3,
    "semantic_bytes": 1447239,
    "semantic_path_set_sha256": "a013d03428f32da59aa5a835576601e78a67077da931275d4925fedff73866f2",
    "semantic_content_state_sha256": "cebccebf8fa5def5a1137e09653f495ec52c7a8bd3d8757e3eb6393817437001",
    "generated_count": 296,
    "generated_bytes": 43728997,
    "generated_path_set_sha256": "5601cfcb8abc481da3b30ed65b64094d6f2bea9e34f90cf0d98b7475fa5ea480",
    "generated_content_state_sha256": "39720352e131ac2d867caa7d504b3c66c004511fd4d2702e85c47c271d752cc1",
}
V31_REF = AUDIT_REL / "master/coordination/CONCURRENCY_POLICY_V31.json"
V31_SHA = "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5"
V32_REF = AUDIT_REL / "master/coordination/CONCURRENCY_POLICY_V32.json"
V32_SHA = "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed"
SCOPE_REF = AUDIT_REL / "master/macro/frozen/epoch-0016/manifests/source_scope.jsonl"
SCOPE_SHA = "963911b952c3909c9012ed25a35151719b4f3f18b173cc6fffc8bbc1036e4e46"
LUNA_SCOPE_REF = TX_REL / "luna-independent-source-scope-binding-prelaunch.json"
LUNA_SCOPE_SHA = "dc3ae0a50988b8eaa00059a9c750d83d9825d021b64bd0792d750125859341f7"
FUTURE_LUNA_REF = TX_REL / "exhaustive-live-head-inventory-v32-luna-prelaunch/independent-review.json"
PATHSPEC = ["Plans", ":(exclude)Plans/.audits/**"]
ZERO = {"activation": 0, "capture": 0, "credit": 0, "launches": 0, "native_capture": 0, "packets": 0, "receipts": 0, "results": 0, "semantic_packets": 0}
AUTHZ = {"activation": False, "canonical_writes": False, "capture": False, "credit": False, "launch": False, "packet_generation": False, "receipt_acceptance": False, "result_acceptance": False, "semantic_prose_review": False}
LOGIC_FILES = {
    "prepare_exhaustive_live_head_inventory_v32.py",
    "verify_exhaustive_live_head_inventory_v32.py",
    "test_exhaustive_live_head_inventory_v32.py",
}
GENERATED_FILES = {
    "AUTHORITY_V32.json", "classification_rules.json", "inventory_entry.schema.json", "inventory.jsonl",
    "readiness.json", "terminal-preparation-report.json", "ARTIFACT_SEAL.json",
}
PREDECESSORS = {
    (TX_REL / "source_scope_binding.json").as_posix(): "8484922e0f96633378af3fc32dfc973dbaffd6812acbb0f5aed2d25bcd60e00e",
    (TX_REL / "source_scope_binding_receipt.json").as_posix(): "cf8e02f95c2cf3f495ba443bb7856609ef4a5573fee9bb70b3577a61ca9877a0",
    (TX_REL / "verify_source_scope_binding.py").as_posix(): "85c4216fa39ccc5092f3850dd9a4f4c1a88a7353868de628df592e3d797983e5",
    (TX_REL / "test_source_scope_binding.py").as_posix(): "9ba2cfb49f5e2946aa1f63891b8d9ac2ac11982ca50b0a1fb15eb98060126a96",
    LUNA_SCOPE_REF.as_posix(): LUNA_SCOPE_SHA,
}
FAILED_0001 = {
    (AUDIT_REL / "master/final_live_head_delta/final-live-head-delta-0001/prepare_final_live_head_delta_0001.py").as_posix(): "8cc057cdb4b7a187fde315e72aee10e565459e7fd6911d2d10db67dd13fc904b",
    (AUDIT_REL / "master/final_live_head_delta/final-live-head-delta-0001/verify_final_live_head_delta_0001.py").as_posix(): "7eac2c39af6b06b51ffba79aaf866ba9a1094ed54388b24c73c213a2cdf382ff",
    (AUDIT_REL / "master/final_live_head_delta/final-live-head-delta-0001/test_final_live_head_delta_0001.py").as_posix(): "84b25cb05341faf84f8aa2257b42c0f521fcb02052de577a0df0d43da98180dd",
}


def canon(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def pretty(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode()


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def file_sha(ref: str | pathlib.Path) -> str:
    path = pathlib.Path(ref)
    return sha((path if path.is_absolute() else REPO / path).read_bytes())


def run_git(*args: str) -> bytes:
    return subprocess.check_output(["git", *args], cwd=REPO)


def utc_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def frozen_paths() -> set[str]:
    raw = (REPO / SCOPE_REF).read_bytes()
    if sha(raw) != SCOPE_SHA:
        raise SystemExit("frozen-source-scope-drift")
    return {json.loads(line)["path"] for line in raw.splitlines() if line}


def classify(path: str, scope: set[str]) -> tuple[str, str]:
    if path.startswith("Plans/ledgers/"):
        return "source_lineage", "L1_LEDGER_SOURCE_LINEAGE"
    if path.startswith("Plans/.evidence/"):
        return "generated_governance", "G1_EVIDENCE"
    if path.startswith("Plans/_shards/"):
        return "generated_governance", "G2_SHARDS"
    if path.startswith("Plans/.plan_index/"):
        return "generated_governance", "G3_PLAN_INDEX"
    if path.startswith("Plans/.plan_migration/"):
        return "generated_governance", "G4_PLAN_MIGRATION"
    if path == "Plans/Spec_Lock.json":
        return "generated_governance", "G5_SPEC_LOCK"
    if path == "Plans/auto_decisions.jsonl":
        return "generated_governance", "G6_AUTO_DECISIONS"
    if path in {"Plans/.implementation_readiness/buildability_gate_report.json", "Plans/.implementation_readiness/pnc019_certification_receipt.json"}:
        return "generated_governance", "G7_READINESS_OUTPUT"
    if path in scope:
        return "semantic_canonical", "S1_FROZEN_SOURCE_SCOPE_MEMBER"
    if path.startswith("Plans/") and not path.startswith("Plans/."):
        return "semantic_new_candidate", "S2_NEW_SEMANTIC_CANDIDATE_REQUIRES_LUNA"
    return "unknown_fail_closed", "U0_UNCLASSIFIED_FAIL_CLOSED"


def head_tree() -> dict[str, dict[str, str]]:
    result: dict[str, dict[str, str]] = {}
    raw = run_git("ls-tree", "-r", "-z", "HEAD", "--", "Plans")
    for item in raw.split(b"\0"):
        if not item:
            continue
        meta, path = item.split(b"\t", 1)
        mode, object_type, oid = meta.decode().split()
        result[path.decode()] = {"mode": mode, "object_type": object_type, "blob_oid": oid}
    return result


def status_records() -> tuple[bytes, bytes, list[tuple[int, str, str]]]:
    raw = run_git("status", "--porcelain=v1", "--untracked-files=all", "--", *PATHSPEC)
    raw_z = run_git("status", "--porcelain=v1", "-z", "--untracked-files=all", "--", *PATHSPEC)
    records: list[tuple[int, str, str]] = []
    for index, item in enumerate((x for x in raw_z.split(b"\0") if x), 1):
        if len(item) < 4 or item[2:3] != b" ":
            raise SystemExit("unsupported-porcelain-record")
        records.append((index, item[:2].decode(), item[3:].decode()))
    reconstructed = b"".join(xy.encode() + b" " + path.encode() + b"\n" for _, xy, path in records)
    if reconstructed != raw:
        raise SystemExit("newline-porcelain-not-losslessly-reconstructable")
    return raw, raw_z, records


def snapshot() -> dict[str, Any]:
    scope = frozen_paths()
    tree = head_tree()
    raw, raw_z, status = status_records()
    rows: list[dict[str, Any]] = []
    for status_ordinal, xy, path in status:
        candidate = REPO / path
        data = candidate.read_bytes()  # Hash-only access; no prose decoding or interpretation.
        st = candidate.lstat()
        file_type = "regular" if stat.S_ISREG(st.st_mode) else "symlink" if stat.S_ISLNK(st.st_mode) else "other"
        cls, rule_id = classify(path, scope)
        head = tree.get(path)
        rows.append({
            "schema_version": "audit005-exhaustive-live-head-inventory-entry-v32",
            "ordinal": 0,
            "status_ordinal": status_ordinal,
            "xy": xy,
            "path": path,
            "tracked": xy != "??",
            "working_tree": {
                "file_type": file_type,
                "mode": format(st.st_mode & 0o177777, "06o"),
                "link_count": st.st_nlink,
                "size_bytes": len(data),
                "sha256": sha(data),
            },
            "head": {
                "present": head is not None,
                "mode": head["mode"] if head else None,
                "object_type": head["object_type"] if head else None,
                "blob_oid": head["blob_oid"] if head else None,
            },
            "classification": {
                "class": cls,
                "rule_id": rule_id,
                "frozen_source_scope_member": path in scope,
            },
        })
    rows.sort(key=lambda row: row["path"])
    for ordinal, row in enumerate(rows, 1):
        row["ordinal"] = ordinal
    content_stream = b"".join(row["xy"].encode() + b"\t" + row["path"].encode() + b"\t" + row["working_tree"]["sha256"].encode() + b"\n" for row in rows)
    path_stream = b"".join(row["path"].encode() + b"\n" for row in rows)
    inventory_raw = b"".join(canon(row) for row in rows)
    classes = {}
    for class_name in ("semantic_canonical", "generated_governance"):
        selected = [row for row in rows if row["classification"]["class"] == class_name]
        classes[class_name] = {
            "count": len(selected),
            "bytes": sum(row["working_tree"]["size_bytes"] for row in selected),
            "path_set_sha256": sha(b"".join(row["path"].encode() + b"\n" for row in selected)),
            "content_state_sha256": sha(b"".join(row["xy"].encode() + b"\t" + row["path"].encode() + b"\t" + row["working_tree"]["sha256"].encode() + b"\n" for row in selected)),
        }
    counts = {
        "path_count": len(rows),
        "modified_tracked": sum(row["xy"] == " M" for row in rows),
        "untracked": sum(row["xy"] == "??" for row in rows),
        "total_bytes": sum(row["working_tree"]["size_bytes"] for row in rows),
        "status_sha256": sha(raw),
        "status_z_sha256": sha(raw_z),
        "content_state_sha256": sha(content_stream),
        "path_set_sha256": sha(path_stream),
        "semantic_count": classes["semantic_canonical"]["count"],
        "semantic_bytes": classes["semantic_canonical"]["bytes"],
        "semantic_path_set_sha256": classes["semantic_canonical"]["path_set_sha256"],
        "semantic_content_state_sha256": classes["semantic_canonical"]["content_state_sha256"],
        "generated_count": classes["generated_governance"]["count"],
        "generated_bytes": classes["generated_governance"]["bytes"],
        "generated_path_set_sha256": classes["generated_governance"]["path_set_sha256"],
        "generated_content_state_sha256": classes["generated_governance"]["content_state_sha256"],
    }
    state = {
        "branch": run_git("branch", "--show-current").decode().strip(),
        "head": run_git("rev-parse", "HEAD").decode().strip(),
        "pathspec": PATHSPEC,
        "digest_framing": "path-sort; XY + HT + path + HT + sha256(file_bytes).hexdigest() + LF",
        **counts,
        "inventory_jsonl_sha256": sha(inventory_raw),
        "all_regular_single_link": all(row["working_tree"]["file_type"] == "regular" and row["working_tree"]["link_count"] == 1 for row in rows),
        "semantic_prose_reads": 0,
        "hash_only_file_reads": len(rows),
    }
    return {"observed_at_utc": utc_now(), "rows": rows, "inventory_raw": inventory_raw, "state": state, "state_digest": sha(canon(state))}


def check_snapshot(candidate: dict[str, Any]) -> None:
    state = candidate["state"]
    errors = [key for key, value in EXPECTED.items() if state.get(key) != value]
    if state.get("branch") != "codex/pm-audit-004-master":
        errors.append("branch")
    if state.get("head") != "7f57ffda79c88878816fee922d85fbed29567f97":
        errors.append("head")
    if not state.get("all_regular_single_link"):
        errors.append("file-type-or-link")
    if any(row["classification"]["class"] not in {"semantic_canonical", "generated_governance"} for row in candidate["rows"]):
        errors.append("classification-unknown")
    if errors:
        raise SystemExit("live-head-drift:" + ",".join(sorted(set(errors))))


def write_new(path: pathlib.Path, raw: bytes) -> None:
    if path.exists() or path.is_symlink():
        raise SystemExit("append-only-target-exists:" + path.as_posix())
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)


def schema() -> dict[str, Any]:
    hex64 = "^[0-9a-f]{64}$"
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "audit005-exhaustive-live-head-inventory-entry-v32",
        "type": "object", "additionalProperties": False,
        "required": ["schema_version", "ordinal", "status_ordinal", "xy", "path", "tracked", "working_tree", "head", "classification"],
        "properties": {
            "schema_version": {"const": "audit005-exhaustive-live-head-inventory-entry-v32"},
            "ordinal": {"type": "integer", "minimum": 1},
            "status_ordinal": {"type": "integer", "minimum": 1},
            "xy": {"enum": [" M", "??"]},
            "path": {"type": "string", "pattern": "^Plans/(?!\\.audits/).+"},
            "tracked": {"type": "boolean"},
            "working_tree": {
                "type": "object", "additionalProperties": False,
                "required": ["file_type", "mode", "link_count", "size_bytes", "sha256"],
                "properties": {"file_type": {"const": "regular"}, "mode": {"const": "100644"}, "link_count": {"const": 1}, "size_bytes": {"type": "integer", "minimum": 0}, "sha256": {"type": "string", "pattern": hex64}},
            },
            "head": {
                "type": "object", "additionalProperties": False,
                "required": ["present", "mode", "object_type", "blob_oid"],
                "properties": {"present": {"type": "boolean"}, "mode": {"type": ["string", "null"]}, "object_type": {"type": ["string", "null"]}, "blob_oid": {"type": ["string", "null"], "pattern": "^[0-9a-f]{40}$"}},
                "allOf": [
                    {
                        "if": {"properties": {"present": {"const": True}}, "required": ["present"]},
                        "then": {"properties": {"mode": {"const": "100644"}, "object_type": {"const": "blob"}, "blob_oid": {"type": "string", "pattern": "^[0-9a-f]{40}$"}}},
                    },
                    {
                        "if": {"properties": {"present": {"const": False}}, "required": ["present"]},
                        "then": {"properties": {"mode": {"const": None}, "object_type": {"const": None}, "blob_oid": {"const": None}}},
                    },
                ],
            },
            "classification": {
                "type": "object", "additionalProperties": False,
                "required": ["class", "rule_id", "frozen_source_scope_member"],
                "properties": {"class": {"enum": ["semantic_canonical", "generated_governance"]}, "rule_id": {"type": "string", "minLength": 1}, "frozen_source_scope_member": {"type": "boolean"}},
            },
        },
    }


def main() -> None:
    root_entries = {path.name for path in NS.iterdir()} if NS.exists() else set()
    if root_entries - LOGIC_FILES:
        raise SystemExit("namespace-not-pristine:" + ",".join(sorted(root_entries - LOGIC_FILES)))
    for ref, expected_sha in {**PREDECESSORS, **FAILED_0001, V31_REF.as_posix(): V31_SHA, V32_REF.as_posix(): V32_SHA}.items():
        if file_sha(ref) != expected_sha:
            raise SystemExit("protected-input-drift:" + ref)
    luna = json.loads((REPO / LUNA_SCOPE_REF).read_bytes())
    if luna.get("status") != "PASS_FROZEN_SOURCE_SCOPE_BINDING_ONLY" or luna.get("claims", {}).get("current_live_head_completeness_claimed") is not False:
        raise SystemExit("limited-luna-prerequisite-invalid")
    if (REPO / FUTURE_LUNA_REF).exists():
        raise SystemExit("future-luna-gate-unexpectedly-present")
    samples = []
    for index in range(3):
        candidate = snapshot()
        check_snapshot(candidate)
        samples.append(candidate)
        if index < 2:
            time.sleep(0.5)
    if any(sample["state_digest"] != samples[0]["state_digest"] or sample["inventory_raw"] != samples[0]["inventory_raw"] for sample in samples[1:]):
        raise SystemExit("three-observation-drift")
    sealed = samples[-1]
    rules = {
        "schema_version": "audit005-live-head-classification-rules-v32",
        "status": "FAIL_CLOSED_ORDERED_RULES",
        "rules": [
            {"priority": 1, "rule_id": "X0_AUDIT_EXCLUSION", "match": "Plans/.audits/**", "class": "excluded_audit_control"},
            {"priority": 2, "rule_id": "L1_LEDGER_SOURCE_LINEAGE", "match": "Plans/ledgers/**", "class": "source_lineage"},
            {"priority": 3, "rule_id": "G1_EVIDENCE", "match": "Plans/.evidence/**", "class": "generated_governance"},
            {"priority": 4, "rule_id": "G2_SHARDS", "match": "Plans/_shards/**", "class": "generated_governance"},
            {"priority": 5, "rule_id": "G3_PLAN_INDEX", "match": "Plans/.plan_index/**", "class": "generated_governance"},
            {"priority": 6, "rule_id": "G4_PLAN_MIGRATION", "match": "Plans/.plan_migration/**", "class": "generated_governance"},
            {"priority": 7, "rule_id": "G5_SPEC_LOCK", "match": "Plans/Spec_Lock.json", "class": "generated_governance"},
            {"priority": 8, "rule_id": "G6_AUTO_DECISIONS", "match": "Plans/auto_decisions.jsonl", "class": "generated_governance"},
            {"priority": 9, "rule_id": "G7_READINESS_OUTPUT", "match": ["Plans/.implementation_readiness/buildability_gate_report.json", "Plans/.implementation_readiness/pnc019_certification_receipt.json"], "class": "generated_governance"},
            {"priority": 10, "rule_id": "S1_FROZEN_SOURCE_SCOPE_MEMBER", "match": "path in frozen 135-row source scope", "class": "semantic_canonical"},
            {"priority": 11, "rule_id": "S2_NEW_SEMANTIC_CANDIDATE_REQUIRES_LUNA", "match": "remaining non-pipeline Plans path", "class": "semantic_new_candidate"},
            {"priority": 12, "rule_id": "U0_UNCLASSIFIED_FAIL_CLOSED", "match": "otherwise or overlap", "class": "unknown_fail_closed"},
        ],
        "prohibitions": {"extension_only_classification": True, "mtime_authority": False, "semantic_packetization_before_fresh_luna_inventory_gate": False},
        "current_exact_counts": {"semantic_canonical": 3, "generated_governance": 296, "source_lineage": 0, "semantic_new_candidate": 0, "unknown_fail_closed": 0},
        "current_class_digests": {key: value for key, value in EXPECTED.items() if key.startswith("semantic_") or key.startswith("generated_")},
    }
    authority = {
        "schema_version": "audit005-exhaustive-live-head-inventory-authority-v32",
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "transaction_id": "final-live-head-delta-0002-exhaustive-live-head-inventory-v32",
        "namespace": NS_REL.as_posix(), "status": STATUS,
        "authority_role": "append_only_exhaustive_inventory_preparation_only",
        "live_scope": {"branch": sealed["state"]["branch"], "head": sealed["state"]["head"], "pathspec": PATHSPEC, "expected": EXPECTED, "digest_framing": sealed["state"]["digest_framing"]},
        "classification_rules_ref": (NS_REL / "classification_rules.json").as_posix(),
        "inventory_ref": (NS_REL / "inventory.jsonl").as_posix(),
        "inventory_schema_ref": (NS_REL / "inventory_entry.schema.json").as_posix(),
        "predecessor": {"transaction_id": "final-live-head-delta-0002", "role": "frozen_source_scope_binding_only_not_live_head_completeness", "protected_files": PREDECESSORS, "limitations": {"frozen_rows": 135, "frozen_bytes": 81724, "non_authoritative_live_pins": 15, "exhaustive_live_paths": 299, "missing_from_old_15_pin_table": 284}},
        "failed_predecessor_0001": {"preserved": True, "protected_files": FAILED_0001},
        "policy_lineage": {"v31_ref": V31_REF.as_posix(), "v31_sha256": V31_SHA, "v32_ref": V32_REF.as_posix(), "v32_sha256": V32_SHA, "v32_role": "current_future_activation_no_packet_authority"},
        "frozen_scope_luna_prerequisite": {"ref": LUNA_SCOPE_REF.as_posix(), "sha256": LUNA_SCOPE_SHA, "status": "PASS_FROZEN_SOURCE_SCOPE_BINDING_ONLY", "live_head_completeness": False, "packet_authority_alone": False},
        "fresh_luna_exhaustive_inventory_gate": {"required": True, "present": False, "future_ref": FUTURE_LUNA_REF.as_posix(), "must_recompute_exact_299": True},
        "observations_required": 3, "authorizations": AUTHZ, "zero_state": ZERO,
        "read_policy": {"canonical_prose_semantic_reads": 0, "hash_only_live_file_reads_per_observation": 299, "classification_basis": "path_metadata_and_frozen_scope_membership_only"},
    }
    write_new(NS / "inventory_entry.schema.json", pretty(schema()))
    write_new(NS / "classification_rules.json", pretty(rules))
    write_new(NS / "AUTHORITY_V32.json", pretty(authority))
    write_new(NS / "inventory.jsonl", sealed["inventory_raw"])
    observation_refs = []
    previous_ref = None
    previous_sha = None
    for index, sample in enumerate(samples, 1):
        ref = OBS_REL / f"observation-{index:04d}.json"
        receipt = {
            "schema_version": "audit005-exhaustive-live-head-observation-v32",
            "observation_id": f"observation-{index:04d}", "ordinal": index,
            "observed_at_utc": sample["observed_at_utc"], "state": sample["state"], "state_digest": sample["state_digest"],
            "previous_observation_ref": previous_ref, "previous_observation_sha256": previous_sha,
            "stable_equal_expected": True, "stable_equal_previous": index == 1 or sample["state_digest"] == samples[index - 2]["state_digest"],
            "semantic_prose_reads": 0, "packet_generation": False, "launch": False,
        }
        raw = pretty(receipt)
        write_new(REPO / ref, raw)
        previous_ref, previous_sha = ref.as_posix(), sha(raw)
        observation_refs.append({"ref": previous_ref, "sha256": previous_sha, "state_digest": sample["state_digest"], "observed_at_utc": sample["observed_at_utc"]})
    readiness = {
        "schema_version": "audit005-exhaustive-live-head-inventory-readiness-v32", "status": STATUS,
        "authority_ref": (NS_REL / "AUTHORITY_V32.json").as_posix(), "authority_sha256": file_sha(NS_REL / "AUTHORITY_V32.json"),
        "inventory_ref": (NS_REL / "inventory.jsonl").as_posix(), "inventory_sha256": file_sha(NS_REL / "inventory.jsonl"),
        "observation_count": 3, "observations": observation_refs, "stable_state_digest": samples[0]["state_digest"],
        "exact_state": sealed["state"], "classification": {"semantic_canonical": 3, "generated_governance": 296, "unknown": 0},
        "frozen_scope_luna_prerequisite_only": True, "fresh_luna_exhaustive_inventory_gate_present": False,
        "preparation_complete": True, "activation_ready": False, "authorizations": AUTHZ, "zero_state": ZERO,
    }
    write_new(NS / "readiness.json", pretty(readiness))
    terminal_inputs = ["AUTHORITY_V32.json", "classification_rules.json", "inventory_entry.schema.json", "inventory.jsonl", "readiness.json", *sorted(LOGIC_FILES), *(f"observations/observation-{i:04d}.json" for i in range(1, 4))]
    terminal = {
        "schema_version": "audit005-exhaustive-live-head-inventory-terminal-preparation-v32", "status": STATUS,
        "preparation_complete": True, "sealed_candidate": True, "fresh_luna_exhaustive_inventory_gate_required": True, "fresh_luna_exhaustive_inventory_gate_present": False,
        "exact_state": sealed["state"], "three_stable_observations": observation_refs,
        "artifact_hashes_before_terminal_and_seal": {ref: file_sha(NS_REL / ref) for ref in terminal_inputs},
        "protected_predecessors_unchanged": True, "canonical_plan_writes": 0, "semantic_prose_reads": 0,
        "authorizations": AUTHZ, "zero_state": ZERO,
        "next_permitted_step": "fresh independent Luna exhaustive inventory prelaunch review in a separate append-only namespace",
    }
    write_new(NS / "terminal-preparation-report.json", pretty(terminal))
    seal_files = sorted(path.relative_to(NS).as_posix() for path in NS.rglob("*") if path.is_file() and path.name != "ARTIFACT_SEAL.json")
    seal = {
        "schema_version": "audit005-exhaustive-live-head-inventory-artifact-seal-v32", "status": STATUS,
        "namespace": NS_REL.as_posix(), "sealed_at_utc": utc_now(),
        "files": {ref: {"sha256": file_sha(NS_REL / ref), "bytes": (NS / ref).stat().st_size} for ref in seal_files},
        "sealed_file_count_excluding_seal": len(seal_files), "future_luna_gate_present": False,
        "authorizations": AUTHZ, "zero_state": ZERO,
    }
    write_new(NS / "ARTIFACT_SEAL.json", pretty(seal))
    print(json.dumps({"status": STATUS, "namespace": NS_REL.as_posix(), "paths": 299, "bytes": 45176236, "content_state_sha256": EXPECTED["content_state_sha256"], "observations": 3, "sealed_files_excluding_seal": len(seal_files), "seal_sha256": file_sha(NS_REL / "ARTIFACT_SEAL.json"), "zero_state": ZERO}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
