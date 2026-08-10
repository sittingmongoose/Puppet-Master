#!/usr/bin/env python3
"""Production validators for v1.2 source, structural, slice, and identity artifacts."""

from __future__ import annotations

import importlib.util
import json
import os
import stat
import sys
import unicodedata
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent
V1_PACKET = ROOT.parent / "stage-a-plan-assurance-rolling-trial-packet-v1"
sys.path.insert(0, str(ROOT))
import v1_2_receipts as v12  # noqa: E402


def _load_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"IMPORT:{path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


BASE = _load_module(V1_PACKET / "validate_trial_artifacts.py", "pm_v1_semantic_validator_for_v12")

SCHEMAS = {
    "source": "SOURCE_SNAPSHOT.schema.json",
    "source_shard": "SOURCE_SNAPSHOT_BUCKET_SHARD.schema.json",
    "structural": "STRUCTURAL_COVERAGE_MAP.schema.json",
    "structural_shard": "STRUCTURAL_COVERAGE_MAP_SHARD.schema.json",
    "slice": "CAPABILITY_SLICE_MANIFEST.schema.json",
    "creation": "RUN_ROOT_CREATION_RECEIPT.schema.json",
    "fresh_identity": "FRESH_LAUNCH_IDENTITY.schema.json",
}
SCHEMA_OBJECTS = {key: v12.strict_json_loads((ROOT / name).read_text(encoding="utf-8")) for key, name in SCHEMAS.items()}
VALIDATORS = {key: Draft202012Validator(schema) for key, schema in SCHEMA_OBJECTS.items()}


def schema_findings(kind: str, value: Any) -> list[str]:
    return [f"SCHEMA:{kind}:{'/'.join(str(x) for x in error.absolute_path)}:{error.message}"
            for error in sorted(VALIDATORS[kind].iter_errors(value), key=lambda e: list(e.absolute_path))]


def _safe_ref(ref: Any, prefix: str) -> bool:
    if not isinstance(ref, str) or not ref.startswith(prefix + "/"):
        return False
    if unicodedata.normalize("NFC", ref) != ref or "\\" in ref or "\0" in ref:
        return False
    parts = ref.split("/")
    return all(part not in {"", ".", ".."} for part in parts)


def _confined_regular(root: Path, ref: str) -> tuple[bytes | None, str | None]:
    if not _safe_ref(ref, ref.split("/", 1)[0]):
        return None, "UNSAFE_REF"
    path = root / ref
    try:
        parent = path.parent
        while parent != root:
            st = parent.lstat()
            if stat.S_ISLNK(st.st_mode) or not stat.S_ISDIR(st.st_mode):
                return None, "NONREAL_ANCESTOR"
            parent = parent.parent
        st = path.lstat()
        if not stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode) or st.st_nlink != 1:
            return None, "NOT_SINGLE_REGULAR_FILE"
        if root.resolve() not in path.resolve().parents:
            return None, "PATH_ESCAPE"
        return path.read_bytes(), None
    except Exception as exc:
        return None, f"READ:{exc}"


def validate_source(bundle: dict[str, Any]) -> list[str]:
    findings = schema_findings("source", bundle.get("root"))
    for index, shard in enumerate(bundle.get("shards", [])):
        findings.extend(f"SOURCE_SHARD:{index}:{code}" for code in schema_findings("source_shard", shard))
    findings.extend(v12.validate_source_bundle(bundle))
    return findings


def validate_creation_receipt(receipt: dict[str, Any], source_root: dict[str, Any]) -> list[str]:
    findings = schema_findings("creation", receipt)
    binding = source_root.get("run_root_binding", {})
    if receipt.get("run_root_binding_sha256") != binding.get("binding_sha256"):
        findings.append("CREATION:RUN_ROOT_BINDING")
    if receipt.get("ancestor_chain_sha256") != binding.get("ancestor_chain_sha256"):
        findings.append("CREATION:ANCESTOR_CHAIN")
    if receipt.get("payload_sha256") != v12.payload_hash("run-root-creation-receipt", receipt):
        findings.append("CREATION:PAYLOAD")
    created = receipt.get("created_directory_identity", {})
    if created.get("path") != binding.get("run_root_raw") or created.get("entry_kind") != "directory":
        findings.append("CREATION:IDENTITY")
    return findings


def validate_slices(slices: list[dict[str, Any]], source_rows: list[dict[str, Any]], active: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    canonical = {row["path"]: row for row in source_rows if row["entry_kind"] == "regular_file" and row["path_class"] == "canonical"}
    documents = {row["path"]: row for row in active.get("documents", [])}
    families: set[str] = set()
    for index, item in enumerate(slices):
        findings.extend(f"SLICE:{index}:{code}" for code in schema_findings("slice", item))
        family = item.get("family_id")
        if family in families:
            findings.append("SLICE:DUPLICATE_FAMILY")
        families.add(family)
        spans = item.get("spans", [])
        if spans != sorted(spans, key=lambda row: (row.get("path", "").encode("utf-8"), row.get("start_byte", -1), row.get("end_byte", -1))):
            findings.append(f"SLICE:ORDER:{family}")
        seen: set[tuple[str, int, int]] = set()
        for span in spans:
            key = (span.get("path"), span.get("start_byte"), span.get("end_byte"))
            if key in seen:
                findings.append(f"SLICE:DUPLICATE_SPAN:{family}")
            seen.add(key)
            source = canonical.get(span.get("path"))
            document = documents.get(span.get("path"))
            if source is None or document is None or ".audits" in str(span.get("path")):
                findings.append(f"SLICE:NONCANONICAL:{family}")
                continue
            if span.get("start_byte") != 0 or span.get("end_byte") != source.get("bytes") or span.get("span_sha256") != source.get("sha256") or span.get("source_file_sha256") != source.get("sha256") or span.get("document_id") != document.get("document_id"):
                findings.append(f"SLICE:SPAN_BINDING:{family}:{span.get('path')}")
        if item.get("span_population_sha256") != v12.identity_hash("capability-slice-spans", spans):
            findings.append(f"SLICE:POPULATION:{family}")
        if item.get("payload_sha256") != v12.payload_hash("capability-slice-manifest", item):
            findings.append(f"SLICE:PAYLOAD:{family}")
    if families != {"USAGE_ACCOUNTING_TRUTH", "WEB_RESEARCH_BEHAVIOR", "ACCESSIBILITY_CONTROL_CONTRACTS", "MIGRATIONS_DURABLE_STATE"}:
        findings.append("SLICE:FAMILY_SET")
    return findings


def validate_structural(bundle: dict[str, Any], source_bundle: dict[str, Any], run_root: Path | None = None) -> list[str]:
    descriptor = bundle.get("descriptor", {})
    findings = schema_findings("structural", descriptor)
    for index, shard in enumerate(bundle.get("shards", [])):
        findings.extend(f"STRUCTURAL_SHARD:{index}:{code}" for code in schema_findings("structural_shard", shard))
    active, rebuilt_findings = v12.reassemble_structural_bundle(bundle)
    findings.extend(rebuilt_findings)
    source_root = source_bundle.get("root", {})
    if descriptor.get("source_snapshot_sha256") != v12.sha256_bytes(v12.canonical_bytes(source_root)):
        findings.append("STRUCTURAL:SOURCE_RECEIPT")
    for field in ("population_sha256", "physical_population_sha256", "classification_population_sha256"):
        name = "source_" + field
        if descriptor.get(name) != source_root.get(field):
            findings.append(f"STRUCTURAL:SOURCE:{field}")
    canonical = [row for row in source_bundle.get("rows", []) if row["entry_kind"] == "regular_file" and row["path_class"] == "canonical"]
    if descriptor.get("canonical_population_count") != len(canonical):
        findings.append("STRUCTURAL:CANONICAL_COUNT")
    if active is not None:
        expected_population = [{key: row.get(key) for key in ("path", "mode", "bytes", "sha256", "artifact_role", "semantic_authority", "parser")} for row in canonical]
        observed_population = [{key: row.get(key) for key in ("path", "mode", "bytes", "sha256", "artifact_role", "semantic_authority", "parser")} for row in active.get("population", [])]
        if expected_population != observed_population:
            findings.append("STRUCTURAL:CANONICAL_POPULATION")
        source_bytes = {row["path"]: (v12.REPO / row["path"]).read_bytes() for row in canonical}
        findings.extend(f"STRUCTURAL:BASE_SCHEMA:{code}" for code in BASE.schema_findings("structural", active))
        findings.extend(f"STRUCTURAL:BASE:{code}" for code in BASE.validate_structural(active, source_bytes))
        findings.extend(validate_slices(bundle.get("capability_slices", []), source_bundle.get("rows", []), active))
    if run_root is not None:
        refs = [row.get("ref") for row in descriptor.get("ordered_shards", [])]
        if len(refs) != len(set(refs)) or len({unicodedata.normalize("NFC", ref).casefold() for ref in refs if isinstance(ref, str)}) != len(refs):
            findings.append("STRUCTURAL:REF_COLLISION")
        actual = set()
        shard_dir = run_root / "STRUCTURAL_COVERAGE_MAP_SHARDS"
        if shard_dir.exists():
            actual = {path.relative_to(run_root).as_posix() for path in shard_dir.iterdir()}
        if set(refs) != actual:
            findings.append("STRUCTURAL:SHARD_FILE_BIJECTION")
        for binding in descriptor.get("ordered_shards", []):
            ref = binding.get("ref")
            if not _safe_ref(ref, "STRUCTURAL_COVERAGE_MAP_SHARDS"):
                findings.append("STRUCTURAL:UNSAFE_REF")
                continue
            raw, error = _confined_regular(run_root, ref)
            if error or raw is None or len(raw) != binding.get("physical_bytes") or v12.sha256_bytes(raw) != binding.get("physical_sha256"):
                findings.append(f"STRUCTURAL:FILE_BINDING:{ref}:{error}")
    return findings


def validate_fresh_identity(value: dict[str, Any]) -> list[str]:
    findings = schema_findings("fresh_identity", value)
    forbidden = {
        "stage-a-plan-assurance-rolling-trial-packet-v1", "stage-a-plan-assurance-rolling-trial-packet-v1_1",
        "stage-a-plan-assurance-rolling-trial-v1-run-001", "stage-a-plan-assurance-rolling-trial-v1_1-run-001",
        "generation-001-20260717", "request.generation-001-20260717",
    }
    if any(str(item) in forbidden for item in value.values()):
        findings.append("IDENTITY:STALE_REUSE")
    return findings


def load_bundle_from_root(run_root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    source_root = v12.strict_json_loads((run_root / "SOURCE_SNAPSHOT.json").read_text(encoding="utf-8"))
    source_shards = [v12.strict_json_loads(path.read_text(encoding="utf-8")) for path in sorted((run_root / "SOURCE_SNAPSHOT_BUCKETS").glob("*.json"), key=lambda p: p.name.encode())]
    descriptor = v12.strict_json_loads((run_root / "STRUCTURAL_COVERAGE_MAP.json").read_text(encoding="utf-8"))
    structural_shards = [v12.strict_json_loads(path.read_text(encoding="utf-8")) for path in sorted((run_root / "STRUCTURAL_COVERAGE_MAP_SHARDS").glob("*.json"), key=lambda p: p.name.encode())]
    slices = [v12.strict_json_loads(path.read_text(encoding="utf-8")) for path in sorted((run_root / "CAPABILITY_SLICES").glob("*.json"), key=lambda p: p.name.encode())]
    return {"root": source_root, "shards": source_shards}, {"descriptor": descriptor, "shards": structural_shards, "capability_slices": slices}
