#!/usr/bin/env python3
"""Generate and validate the clean-run document scope and semantic window manifests.

Writes only inside this audit directory. It does not inspect prior audit bodies,
closure registries, or quarantined report contents.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


AUDIT_ID = "audit-20260709-002-plan-assurance-windowed-blind-exhaustive"
PROTOCOL_ID = "hierarchical-document-sharding-v1"
MAX_CORE_LINES = 400
MAX_ESTIMATED_TOKENS = 12_000
TOKEN_CHAR_DIVISOR = 3
MAX_CORE_CHARS = MAX_ESTIMATED_TOKENS * TOKEN_CHAR_DIVISOR
CONTEXT_LINES = 18

SCRIPT = Path(__file__).resolve()
AUDIT_DIR = SCRIPT.parent
REPO = SCRIPT.parents[3]
PLANS = REPO / "Plans"

REQUIRED_ROLES = [
    "contract_capability_exact_behavior",
    "adversarial_negative_space",
]

QUARANTINED_MARKDOWN = {
    "Plans/OpenCode_Coverage_Matrix.md": "blind_quarantined_prior_coverage_audit",
    "Plans/GUI_Rebuild_Requirements_Checklist.md": "blind_quarantined_prior_verification_summary",
}

RETIRED_MARKDOWN = {
    "Plans/chain-wizard.md": "retired_source_lineage_only",
    "Plans/chain-wizard-flexibility.md": "retired_source_lineage_only",
}

BOOTSTRAP_ACTIVE = {
    "Plans/bootstrap/Bootstrap_Planning_Workflow.md": "active_governance_workflow_consumer",
    "Plans/bootstrap/Codex_Prompts.md": "active_governance_prompt_consumer",
}

BOOTSTRAP_DISPOSITION = {
    "Plans/bootstrap/Bootstrap_Design_Brief.md": "source_seed_non_product_authority",
}

ACTIVE_NON_SCHEMA_JSON = {
    "Plans/PMConcept_Control_Reconciliation.json",
    "Plans/Wiring_Matrix.production.exclusions.json",
    "Plans/Wiring_Matrix.production.json",
    "Plans/path_reference_registry.json",
    "Plans/prd_planning_runtime_contracts.json",
    "Plans/storage_value_registry.json",
    "Plans/web_agent_policy_fixtures.json",
    "Plans/web_intent_routing_fixtures.json",
    "Plans/web_operation_card_fixtures.json",
    "Plans/web_operation_job_fixtures.json",
    "Plans/web_policy_negative_fixtures.json",
    "Plans/web_provider_adapter_registry.seed.json",
    "Plans/web_provider_projection_fixtures.json",
    "Plans/web_research_run_fixtures.json",
}

QUARANTINED_NON_MARKDOWN = {
    "Plans/web_capability_findings_coverage.json": "blind_quarantined_prior_finding_coverage",
    "Plans/web_capability_source_packet_receipt.json": "blind_quarantined_prior_source_packet_receipt",
    "Plans/evidence_requirements_traceability_upgrade_2026-02-25.json": "blind_quarantined_prior_traceability_result",
    "Plans/zero_incomplete_disposition.json": "blind_quarantined_prior_disposition_result",
}

GENERATED_OR_SECONDARY_NON_MARKDOWN = {
    "Plans/Spec_Lock.json": "generated_governance_lock_secondary",
    "Plans/auto_decisions.jsonl": "generated_governance_decision_log_secondary",
    "Plans/plan_graph.json": "generated_governance_graph_secondary",
    "Plans/sharding_config.json": "generated_shard_configuration_secondary",
}

EXCLUDED_DIRECTORY_RULES = {
    "Plans/ledgers": "source_lineage_planning_memory_excluded_primary",
    "Plans/_shards": "generated_shards_excluded_primary",
    "Plans/.evidence": "generated_evidence_excluded_primary",
    "Plans/.audits": "prior_and_current_audit_artifacts_excluded_primary",
    "Plans/.plan_migration": "migration_process_evidence_excluded_primary",
    "Plans/.plan_index": "generated_plan_index_secondary",
    "Plans/.implementation_readiness": "generated_readiness_evidence_secondary",
}

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
PLANUNIT_HEADING_RE = re.compile(r"^#{2,6}\s+([A-Za-z0-9]+-[0-9]+)\b")
PLANUNIT_FIELD_RE = re.compile(r"^plan_unit_id:\s*['\"]?([^'\"\s]+)")
TOP_YAML_KEY_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*:\s*")
TABLE_RE = re.compile(r"^\s*\|.*\|\s*$")
JSON_FIELD_RE = re.compile(r'^\s{0,6}"([^"\\]+)"\s*:\s*')
SCHEMA_ID_RE = re.compile(r'(?i)["\']?schema_id["\']?\s*[:=]\s*["\']([^"\']+)')
CONTRACT_NAME_RE = re.compile(r"ContractName:([^,\s]+)")


def rel(path: Path) -> str:
    return path.resolve().relative_to(REPO).as_posix()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_source(path: Path) -> tuple[bytes, list[str]]:
    data = path.read_bytes()
    text = data.decode("utf-8")
    return data, text.splitlines(keepends=True)


def token_estimate(text: str) -> int:
    return math.ceil(len(text) / TOKEN_CHAR_DIVISOR)


def jsonl_write(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    payload = "\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows)
    path.write_text(payload + ("\n" if payload else ""), encoding="utf-8")


@dataclass
class Segment:
    start: int
    end: int
    block_id: str
    kind: str
    parent_block_id: str | None = None
    oversized_subdivision: bool = False
    subdivision_reason: str | None = None

    def line_count(self) -> int:
        return self.end - self.start + 1


def load_planunit_metadata() -> tuple[dict[str, dict[str, int]], dict[str, list[dict[str, Any]]]]:
    stats: dict[str, dict[str, int]] = defaultdict(lambda: {"accepted": 0, "retired": 0, "total": 0})
    rows_by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    path = PLANS / ".plan_index" / "plan_units.jsonl"
    for raw in path.read_text(encoding="utf-8").splitlines():
        if not raw.strip():
            continue
        row = json.loads(raw)
        doc = row["owner_doc"]
        status = row.get("status", "unknown")
        stats[doc]["total"] += 1
        if status == "retired":
            stats[doc]["retired"] += 1
        else:
            stats[doc]["accepted"] += 1
        rows_by_doc[doc].append(row)
    return dict(stats), dict(rows_by_doc)


def classify_documents() -> list[dict[str, Any]]:
    planunit_stats, _ = load_planunit_metadata()
    rows: list[dict[str, Any]] = []

    top_level = sorted(p for p in PLANS.iterdir() if p.is_file())
    bootstrap = sorted((PLANS / "bootstrap").glob("*"))
    candidates = top_level + [p for p in bootstrap if p.is_file()]

    for path in candidates:
        path_rel = rel(path)
        suffixes = "".join(path.suffixes)
        primary = False
        scope_class = "unclassified"
        authority_role = "unclassified"
        blind_access = "allowed"
        basis: list[str] = []

        if path.name == ".DS_Store":
            scope_class = "excluded_local_machine_state"
            authority_role = "none"
            blind_access = "do_not_inspect"
            basis = ["AGENTS.md safety: do not add or use local machine state"]
        elif path_rel in RETIRED_MARKDOWN:
            scope_class = RETIRED_MARKDOWN[path_rel]
            authority_role = "source_lineage_only"
            blind_access = "post_freeze_reconciliation_only"
            basis = ["Plans/00-plans-index.md retirement registration"]
        elif path_rel in QUARANTINED_MARKDOWN:
            scope_class = QUARANTINED_MARKDOWN[path_rel]
            authority_role = "prior_coverage_or_verification_input"
            blind_access = "post_freeze_only"
            basis = ["audit anti-anchoring rule", "Plans/00-plans-index.md plan-map role"]
        elif path_rel in BOOTSTRAP_ACTIVE:
            primary = True
            scope_class = BOOTSTRAP_ACTIVE[path_rel]
            authority_role = "active_governance_consumer"
            basis = ["Plans/00-plans-index.md semantic audit/ledger workflow consumer routing"]
        elif path_rel in BOOTSTRAP_DISPOSITION:
            scope_class = BOOTSTRAP_DISPOSITION[path_rel]
            authority_role = "source_seed_reference"
            blind_access = "routing_only"
            basis = ["document self-identifies as a source seed"]
        elif path.suffix == ".md":
            counts = planunit_stats.get(path_rel)
            if counts and counts["accepted"] > 0:
                primary = True
                scope_class = "active_canonical_markdown"
                authority_role = "active_owner_consumer_or_governance"
                basis = ["current Plans/.plan_index accepted PlanUnit ownership", "live non-pipeline Plans path"]
            elif counts and counts["retired"] == counts["total"]:
                scope_class = "retired_source_lineage_only"
                authority_role = "source_lineage_only"
                blind_access = "post_freeze_reconciliation_only"
                basis = ["all current PlanUnits retired"]
            else:
                scope_class = "unclassified_markdown"
                authority_role = "unclassified"
        elif path.name.endswith(".schema.json"):
            primary = True
            scope_class = "active_machine_contract_schema"
            authority_role = "machine_contract_owner_or_validator_shape"
            basis = ["top-level machine-readable schema", "relevant schema/contract consumer audit requirement"]
        elif path_rel in ACTIVE_NON_SCHEMA_JSON:
            primary = True
            scope_class = "active_machine_contract_fixture_or_registry"
            authority_role = "machine_contract_fixture_registry_or_production_wiring"
            basis = ["current top-level registered contract/fixture/registry/wiring artifact"]
        elif path_rel in QUARANTINED_NON_MARKDOWN:
            scope_class = QUARANTINED_NON_MARKDOWN[path_rel]
            authority_role = "prior_result_or_lineage_receipt"
            blind_access = "post_freeze_only"
            basis = ["audit anti-anchoring rule"]
        elif path_rel in GENERATED_OR_SECONDARY_NON_MARKDOWN:
            scope_class = GENERATED_OR_SECONDARY_NON_MARKDOWN[path_rel]
            authority_role = "generated_governance_secondary"
            blind_access = "secondary_after_primary_extraction"
            basis = ["AGENTS.md/index governance-artifact boundary"]

        data = path.read_bytes()
        if path.name == ".DS_Store":
            line_count = 0
        else:
            try:
                line_count = len(data.decode("utf-8").splitlines())
            except UnicodeDecodeError:
                line_count = 0
        counts = planunit_stats.get(path_rel, {"accepted": 0, "retired": 0, "total": 0})
        rows.append(
            {
                "record_type": "document_scope",
                "doc_id": "DOC-" + hashlib.sha256(path_rel.encode()).hexdigest()[:12].upper(),
                "path": path_rel,
                "file_kind": "markdown" if path.suffix == ".md" else ("jsonl" if path.suffix == ".jsonl" else "json_or_binary"),
                "scope_class": scope_class,
                "authority_role": authority_role,
                "primary_authority": primary,
                "blind_access": blind_access,
                "classification_status": "classified" if not scope_class.startswith("unclassified") else "unclassified",
                "classification_basis": basis,
                "line_count": line_count,
                "byte_count": len(data),
                "source_hash": sha256_bytes(data),
                "planunit_counts": counts,
                "window_manifest_refs": [],
                "window_coverage_status": "pending" if primary else "explicitly_dispositioned",
            }
        )

    for directory_rel, disposition in EXCLUDED_DIRECTORY_RULES.items():
        directory = REPO / directory_rel
        files = [p for p in directory.rglob("*") if p.is_file()] if directory.exists() else []
        if directory_rel == "Plans/.audits":
            files = [p for p in files if AUDIT_ID not in p.parts]
        rows.append(
            {
                "record_type": "directory_disposition",
                "doc_id": "DIR-" + hashlib.sha256(directory_rel.encode()).hexdigest()[:12].upper(),
                "path": directory_rel + "/**",
                "file_kind": "directory_aggregate",
                "scope_class": disposition,
                "authority_role": "excluded_or_secondary_directory",
                "primary_authority": False,
                "blind_access": "no_body_inspection_during_blind_phase" if directory_rel == "Plans/.audits" else "secondary_or_excluded",
                "classification_status": "classified",
                "classification_basis": ["AUDIT_CHARTER.md authority and anti-anchoring boundary"],
                "file_count": len(files),
                "byte_count": sum(p.stat().st_size for p in files),
                "line_count": None,
                "source_hash": None,
                "window_manifest_refs": [],
                "window_coverage_status": "directory_disposition_recorded",
            }
        )

    unclassified = [row["path"] for row in rows if row["classification_status"] == "unclassified"]
    if unclassified:
        raise RuntimeError(f"Unclassified top-level/bootstrap documents: {unclassified}")
    return rows


def markdown_protected_ranges(lines: list[str], path_rel: str) -> dict[int, Segment]:
    protected: dict[int, Segment] = {}
    i = 1
    n = len(lines)
    fence_count = 0
    table_count = 0
    while i <= n:
        raw = lines[i - 1].rstrip("\n")
        if raw.lstrip().startswith("```"):
            fence_count += 1
            start = i
            fence_token = raw.lstrip().split()[0]
            j = i + 1
            while j <= n and not lines[j - 1].lstrip().startswith("```"):
                j += 1
            end = min(j, n)
            body = "".join(lines[start - 1 : end])
            planunit_match = PLANUNIT_FIELD_RE.search(body)
            if planunit_match:
                block_id = f"PLANUNIT:{planunit_match.group(1)}"
                # Attach a directly preceding PlanUnit heading and intervening blanks.
                probe = start - 1
                while probe >= 1 and not lines[probe - 1].strip():
                    probe -= 1
                if probe >= 1 and PLANUNIT_HEADING_RE.match(lines[probe - 1]):
                    start = probe
            else:
                block_id = f"FENCE:{path_rel}:{fence_count:04d}"
            protected[start] = Segment(start, end, block_id, "fenced_block")
            i = end + 1
            continue
        if TABLE_RE.match(raw):
            table_count += 1
            start = i
            j = i + 1
            while j <= n and (TABLE_RE.match(lines[j - 1].rstrip("\n")) or not lines[j - 1].strip()):
                if not lines[j - 1].strip() and (j == n or not TABLE_RE.match(lines[j].rstrip("\n"))):
                    break
                j += 1
            end = j - 1
            protected[start] = Segment(start, end, f"TABLE:{path_rel}:{table_count:04d}", "table")
            i = end + 1
            continue
        i += 1
    return protected


def initial_segments(lines: list[str], path_rel: str, is_markdown: bool) -> list[Segment]:
    n = len(lines)
    segments: list[Segment] = []
    protected = markdown_protected_ranges(lines, path_rel) if is_markdown else {}
    protected_covered: set[int] = set()
    for segment in protected.values():
        protected_covered.update(range(segment.start, segment.end + 1))

    i = 1
    generic_count = 0
    while i <= n:
        if i in protected:
            segments.append(protected[i])
            i = protected[i].end + 1
            continue
        if i in protected_covered:
            i += 1
            continue
        generic_count += 1
        raw = lines[i - 1].rstrip("\n")
        if is_markdown and HEADING_RE.match(raw):
            start = i
            j = i + 1
            while j <= n and j not in protected and not HEADING_RE.match(lines[j - 1].rstrip("\n")):
                if not lines[j - 1].strip():
                    j += 1
                    break
                j += 1
            end = j - 1
            segments.append(Segment(start, end, f"HEADING_BLOCK:{path_rel}:{generic_count:05d}", "heading_block"))
            i = end + 1
            continue
        if not is_markdown and JSON_FIELD_RE.match(raw):
            key = JSON_FIELD_RE.match(raw).group(1)  # type: ignore[union-attr]
            start = i
            indent = len(raw) - len(raw.lstrip())
            j = i + 1
            while j <= n:
                candidate = lines[j - 1].rstrip("\n")
                match = JSON_FIELD_RE.match(candidate)
                if match and (len(candidate) - len(candidate.lstrip())) <= indent:
                    break
                j += 1
            end = j - 1
            segments.append(Segment(start, end, f"JSON_FIELD:{path_rel}:{key}:{generic_count:05d}", "json_field"))
            i = end + 1
            continue
        start = i
        j = i + 1
        while j <= n and j not in protected:
            candidate = lines[j - 1].rstrip("\n")
            if is_markdown and HEADING_RE.match(candidate):
                break
            if not is_markdown and JSON_FIELD_RE.match(candidate):
                break
            if not candidate.strip() and j > start + 1:
                j += 1
                break
            j += 1
        end = j - 1
        segments.append(Segment(start, end, f"BLOCK:{path_rel}:{generic_count:05d}", "paragraph_or_structure"))
        i = end + 1

    assert segments
    expected = 1
    for segment in segments:
        if segment.start != expected:
            raise RuntimeError(f"Segment gap in {path_rel}: expected {expected}, got {segment.start}")
        expected = segment.end + 1
    if expected != n + 1:
        raise RuntimeError(f"Segment tail gap in {path_rel}: expected end {n}, got {expected-1}")
    return segments


def split_oversized_segment(segment: Segment, lines: list[str]) -> list[Segment]:
    text = "".join(lines[segment.start - 1 : segment.end])
    if segment.line_count() <= MAX_CORE_LINES and len(text) <= MAX_CORE_CHARS:
        return [segment]

    candidates: list[int] = []
    for line_no in range(segment.start + 1, segment.end + 1):
        raw = lines[line_no - 1].rstrip("\n")
        if segment.block_id.startswith("PLANUNIT:") and TOP_YAML_KEY_RE.match(raw):
            candidates.append(line_no)
        elif segment.kind == "table" and TABLE_RE.match(raw):
            candidates.append(line_no)
        elif segment.kind == "json_field" and JSON_FIELD_RE.match(raw):
            candidates.append(line_no)
        elif HEADING_RE.match(raw) or not raw.strip():
            candidates.append(line_no)

    parts: list[Segment] = []
    start = segment.start
    part = 1
    while start <= segment.end:
        chars = 0
        hard_end = start - 1
        for line_no in range(start, segment.end + 1):
            candidate_chars = chars + len(lines[line_no - 1])
            if line_no - start + 1 > MAX_CORE_LINES or candidate_chars > MAX_CORE_CHARS:
                break
            chars = candidate_chars
            hard_end = line_no
        if hard_end < start:
            raise RuntimeError(f"Single source line exceeds token budget in {segment.block_id} at line {start}")
        if hard_end < segment.end:
            eligible = [line_no for line_no in candidates if start < line_no <= hard_end]
            end = (max(eligible) - 1) if eligible else hard_end
            if end < start:
                end = hard_end
        else:
            end = segment.end
        parts.append(
            Segment(
                start,
                end,
                f"{segment.block_id}:PART-{part:03d}",
                segment.kind,
                parent_block_id=segment.block_id,
                oversized_subdivision=True,
                subdivision_reason="semantic_block_exceeded_400_lines_or_12000_estimated_tokens",
            )
        )
        part += 1
        start = end + 1
    return parts


def heading_paths(lines: list[str], path_rel: str) -> list[list[str]]:
    stack: list[str] = []
    result: list[list[str]] = []
    for raw in lines:
        match = HEADING_RE.match(raw.rstrip("\n"))
        if match:
            level = len(match.group(1))
            title = match.group(2).strip()
            stack = stack[: level - 1]
            while len(stack) < level - 1:
                stack.append("<implicit>")
            stack.append(title)
        result.append(stack.copy() if stack else [path_rel])
    return result


def specialist_roles(text: str) -> list[str]:
    lowered = text.lower()
    roles: list[str] = []
    if any(term in lowered for term in ("security", "permission", "credential", "secret", "auth", "privacy", "abuse")):
        roles.append("security_privacy_authority_specialist")
    if any(term in lowered for term in ("gui", "ui", "accessibility", "responsive", "localization", "screen reader", "slint")):
        roles.append("gui_truthfulness_accessibility_specialist")
    if any(term in lowered for term in ("schema", "state machine", "transition", "enum", "idempot", "concurrent", "migration")):
        roles.append("schema_state_concurrency_specialist")
    if any(term in lowered for term in ("test", "acceptance", "oracle", "evidence", "validator", "fixture")):
        roles.append("test_oracle_evidence_specialist")
    if any(term in lowered for term in ("provider", "github", "docker", "browser", "mcp", "lsp", "api", "protocol", "standard")):
        roles.append("external_constraint_currentness_specialist")
    return sorted(set(roles))


def make_windows(path: Path, scope_row: dict[str, Any]) -> list[dict[str, Any]]:
    data, lines = read_source(path)
    path_rel = rel(path)
    if not lines:
        raise RuntimeError(f"Authoritative document is empty: {path_rel}")
    is_markdown = path.suffix == ".md"
    segments = initial_segments(lines, path_rel, is_markdown)
    expanded: list[Segment] = []
    for segment in segments:
        expanded.extend(split_oversized_segment(segment, lines))

    windows_segments: list[list[Segment]] = []
    current: list[Segment] = []
    current_chars = 0
    current_lines = 0
    for segment in expanded:
        seg_text = "".join(lines[segment.start - 1 : segment.end])
        seg_chars = len(seg_text)
        seg_lines = segment.line_count()
        if current and (current_lines + seg_lines > MAX_CORE_LINES or current_chars + seg_chars > MAX_CORE_CHARS):
            windows_segments.append(current)
            current = []
            current_chars = 0
            current_lines = 0
        if seg_lines > MAX_CORE_LINES or seg_chars > MAX_CORE_CHARS:
            raise RuntimeError(f"Unsplit oversized segment {segment.block_id} in {path_rel}")
        current.append(segment)
        current_chars += seg_chars
        current_lines += seg_lines
    if current:
        windows_segments.append(current)

    paths = heading_paths(lines, path_rel)
    source_hash = sha256_bytes(data)
    windows: list[dict[str, Any]] = []
    slug = re.sub(r"[^a-z0-9]+", "-", Path(path_rel).stem.lower()).strip("-")
    for index, packed in enumerate(windows_segments, 1):
        start = packed[0].start
        end = packed[-1].end
        core_text = "".join(lines[start - 1 : end])
        before = [max(1, start - CONTEXT_LINES), start - 1] if start > 1 else None
        after = [end + 1, min(len(lines), end + CONTEXT_LINES)] if end < len(lines) else None
        context_ranges = [item for item in (before, after) if item]
        plan_ids = sorted(set(PLANUNIT_FIELD_RE.findall(core_text)) | set(PLANUNIT_HEADING_RE.findall(core_text)))
        contract_ids = sorted(set(SCHEMA_ID_RE.findall(core_text)) | set(CONTRACT_NAME_RE.findall(core_text)))
        semantic_ids = [segment.block_id for segment in packed]
        parent_ids = sorted({segment.parent_block_id for segment in packed if segment.parent_block_id})
        anchor_paths: list[list[str]] = []
        for line_no in range(start, end + 1):
            if HEADING_RE.match(lines[line_no - 1].rstrip("\n")) or line_no == start:
                candidate = paths[line_no - 1]
                if candidate not in anchor_paths:
                    anchor_paths.append(candidate)
        window_id = f"WIN-{slug}-{index:04d}"
        windows.append(
            {
                "record_type": "document_window",
                "audit_id": AUDIT_ID,
                "protocol_id": PROTOCOL_ID,
                "document_path": path_rel,
                "document_scope_class": scope_row["scope_class"],
                "window_id": window_id,
                "core_line_start": start,
                "core_line_end": end,
                "context_ranges": context_ranges,
                "overlap_ranges": context_ranges,
                "heading_anchor_path": anchor_paths,
                "source_hash": source_hash,
                "window_source_hash": sha256_bytes(core_text.encode("utf-8")),
                "token_estimate": token_estimate(core_text),
                "token_estimate_method": "ceil(unicode_characters/3)",
                "source_character_count": len(core_text),
                "semantic_block_ids": semantic_ids,
                "parent_semantic_block_ids": parent_ids,
                "plan_unit_ids": plan_ids,
                "contract_ids": contract_ids,
                "required_roles": REQUIRED_ROLES,
                "specialist_roles_recommended": specialist_roles(core_text),
                "assigned_agent_ids": [],
                "assigned_roles": [],
                "review_state": "unassigned_manifest_validating",
                "result_refs": [],
                "authoritative_line_count": end - start + 1,
                "disposition": "authoritative_core",
                "oversized_subdivision": any(segment.oversized_subdivision for segment in packed),
                "subdivision_reasons": sorted({segment.subdivision_reason for segment in packed if segment.subdivision_reason}),
            }
        )
    return windows


def validate_windows(scope_rows: list[dict[str, Any]], window_rows: list[dict[str, Any]]) -> dict[str, Any]:
    by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in window_rows:
        by_doc[row["document_path"]].append(row)
    duplicate_window_ids = len({row["window_id"] for row in window_rows}) != len(window_rows)
    gaps: list[dict[str, Any]] = []
    duplicates: list[dict[str, Any]] = []
    limit_errors: list[dict[str, Any]] = []
    authoritative_lines = 0
    covered_lines = 0
    windowed_docs = 0
    for scope in scope_rows:
        if scope.get("record_type") != "document_scope" or not scope.get("primary_authority"):
            continue
        path_rel = scope["path"]
        line_count = scope["line_count"]
        authoritative_lines += line_count
        rows = sorted(by_doc.get(path_rel, []), key=lambda item: item["core_line_start"])
        if not rows:
            gaps.append({"document_path": path_rel, "missing_range": [1, line_count]})
            continue
        windowed_docs += 1
        expected = 1
        for row in rows:
            start = row["core_line_start"]
            end = row["core_line_end"]
            if start > expected:
                gaps.append({"document_path": path_rel, "missing_range": [expected, start - 1]})
            elif start < expected:
                duplicates.append({"document_path": path_rel, "duplicate_range": [start, expected - 1]})
            expected = max(expected, end + 1)
            covered_lines += end - start + 1
            if end - start + 1 > MAX_CORE_LINES or row["token_estimate"] > MAX_ESTIMATED_TOKENS:
                limit_errors.append({"document_path": path_rel, "window_id": row["window_id"], "line_count": end-start+1, "token_estimate": row["token_estimate"]})
        if expected <= line_count:
            gaps.append({"document_path": path_rel, "missing_range": [expected, line_count]})
    if duplicate_window_ids:
        duplicates.append({"document_path": "<global>", "duplicate_window_id": True})
    if gaps or duplicates or limit_errors or covered_lines != authoritative_lines:
        raise RuntimeError(json.dumps({"gaps": gaps, "duplicates": duplicates, "limit_errors": limit_errors, "authoritative_lines": authoritative_lines, "covered_lines": covered_lines}, indent=2))
    return {
        "windowed_documents": windowed_docs,
        "total_authoritative_windows": len(window_rows),
        "authoritative_lines": authoritative_lines,
        "covered_lines": covered_lines,
        "gap_count": 0,
        "duplicate_core_count": 0,
        "unclassified_line_count": 0,
        "limit_error_count": 0,
    }


def main() -> None:
    scope_rows = classify_documents()
    primary_rows = [row for row in scope_rows if row.get("record_type") == "document_scope" and row.get("primary_authority")]
    window_rows: list[dict[str, Any]] = []
    for scope in primary_rows:
        window_rows.extend(make_windows(REPO / scope["path"], scope))

    validation = validate_windows(scope_rows, window_rows)
    refs_by_doc: dict[str, list[str]] = defaultdict(list)
    for row in window_rows:
        refs_by_doc[row["document_path"]].append(row["window_id"])
    for scope in scope_rows:
        if scope.get("record_type") == "document_scope" and scope.get("primary_authority"):
            scope["window_manifest_refs"] = refs_by_doc[scope["path"]]
            scope["window_coverage_status"] = "exact_core_coverage_validated"

    scope_header = {
        "record_type": "audit_header",
        "audit_id": AUDIT_ID,
        "status": "classified_and_windowed",
        "classification_complete": True,
        "hierarchical_windowing_required": True,
        "generated_by": rel(SCRIPT),
        "generator_hash": sha256_bytes(SCRIPT.read_bytes()),
    }
    scope_schema = {
        "record_type": "schema",
        "row_type": "document_scope",
        "required_fields": ["doc_id", "path", "scope_class", "authority_role", "primary_authority", "blind_access", "classification_status", "line_count", "source_hash", "window_manifest_refs", "window_coverage_status"],
        "rule": "Path classification is not review coverage; authoritative rows require exact core windows and completed dual-role/integration/seam evidence.",
    }
    jsonl_write(AUDIT_DIR / "doc_scope_manifest.jsonl", [scope_header, scope_schema, *scope_rows])

    window_header = {
        "record_type": "audit_header",
        "audit_id": AUDIT_ID,
        "protocol_id": PROTOCOL_ID,
        "status": "manifest_validated_assignments_allowed",
        "max_core_lines": MAX_CORE_LINES,
        "max_estimated_tokens": MAX_ESTIMATED_TOKENS,
        "token_estimate_method": "ceil(unicode_characters/3)",
        "semantic_boundaries_required": True,
        "generator": rel(SCRIPT),
        "generator_hash": sha256_bytes(SCRIPT.read_bytes()),
        "validation": validation,
    }
    window_schema = {
        "record_type": "schema",
        "row_type": "document_window",
        "required_fields": ["document_path", "window_id", "core_line_start", "core_line_end", "context_ranges", "overlap_ranges", "heading_anchor_path", "source_hash", "window_source_hash", "token_estimate", "semantic_block_ids", "plan_unit_ids", "contract_ids", "required_roles", "assigned_agent_ids", "assigned_roles", "review_state", "result_refs", "authoritative_line_count", "disposition"],
        "core_rule": "Non-overlapping core ranges cover every authoritative source line exactly once; overlap is context only.",
        "oversize_rule": "Oversized semantic blocks use explicit subdivisions with parent IDs, provenance, and hashes.",
    }
    jsonl_write(AUDIT_DIR / "doc_window_manifest.jsonl", [window_header, window_schema, *window_rows])

    seam_rows: list[dict[str, Any]] = []
    by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in window_rows:
        by_doc[row["document_path"]].append(row)
    for path_rel, rows in sorted(by_doc.items()):
        ordered = sorted(rows, key=lambda item: item["core_line_start"])
        for idx, (left, right) in enumerate(zip(ordered, ordered[1:]), 1):
            crossing_blocks = sorted(set(left["parent_semantic_block_ids"]) & set(right["parent_semantic_block_ids"]))
            crossing_planunits = sorted(set(left["plan_unit_ids"]) & set(right["plan_unit_ids"]))
            crossing_contracts = sorted(set(left["contract_ids"]) & set(right["contract_ids"]))
            seam_rows.append(
                {
                    "record_type": "seam_manifest",
                    "seam_id": "SEAM-" + hashlib.sha256(f"{path_rel}:{left['window_id']}:{right['window_id']}".encode()).hexdigest()[:16].upper(),
                    "document_path": path_rel,
                    "left_window_id": left["window_id"],
                    "right_window_id": right["window_id"],
                    "boundary_lines": [left["core_line_end"], right["core_line_start"]],
                    "crossing_semantic_block_ids": crossing_blocks,
                    "crossing_plan_unit_ids": crossing_planunits,
                    "crossing_contract_ids": crossing_contracts,
                    "reviewer_agent_id": None,
                    "source_refs": [f"{path_rel}:{max(1,left['core_line_end']-CONTEXT_LINES)}", f"{path_rel}:{min(right['core_line_end'],right['core_line_start']+CONTEXT_LINES)}"],
                    "continuity_checks": [],
                    "contradictions": [],
                    "missing_transitions": [],
                    "unresolved_ownership": [],
                    "candidate_findings": [],
                    "state": "unassigned",
                    "result_ref": None,
                }
            )
    seam_header = {"record_type": "audit_header", "audit_id": AUDIT_ID, "protocol_id": PROTOCOL_ID, "status": "manifest_generated", "seam_result_count": 0, "seam_manifest_count": len(seam_rows)}
    seam_schema = {"record_type": "schema", "row_type": "seam_review", "required_fields": ["seam_id", "document_path", "left_window_id", "right_window_id", "crossing_semantic_block_ids", "crossing_plan_unit_ids", "crossing_contract_ids", "reviewer_agent_id", "source_refs", "continuity_checks", "contradictions", "missing_transitions", "unresolved_ownership", "candidate_findings", "state", "result_ref"], "rule": "Every adjacent boundary and crossing semantic block receives separate review."}
    jsonl_write(AUDIT_DIR / "seam_findings.jsonl", [seam_header, seam_schema, *seam_rows])

    total_source_lines = sum(row.get("line_count") or 0 for row in scope_rows if row.get("record_type") == "document_scope")
    dispositioned_lines = sum(row.get("line_count") or 0 for row in scope_rows if row.get("record_type") == "document_scope" and not row.get("primary_authority"))
    report = {
        "audit_id": AUDIT_ID,
        "protocol_id": PROTOCOL_ID,
        "status": "manifest_validated_assignments_allowed",
        "manifest_validation_passed": True,
        "assignment_gate_open": True,
        "complete": False,
        "documents": {
            "classified": sum(1 for row in scope_rows if row.get("record_type") == "document_scope"),
            "in_scope_authoritative": len(primary_rows),
            "windowed": validation["windowed_documents"],
            "integrated": 0,
            "seam_reviewed": 0,
        },
        "windows": {
            "total_authoritative": len(window_rows),
            "contract_role_complete": 0,
            "adversarial_role_complete": 0,
            "both_required_roles_complete": 0,
            "unreviewed_authoritative": len(window_rows),
            "specialist_assignments": 0,
        },
        "lines": {
            "total_source": total_source_lines,
            "authoritative": validation["authoritative_lines"],
            "covered_by_exact_core": validation["covered_lines"],
            "explicitly_dispositioned": dispositioned_lines,
            "unclassified": 0,
        },
        "gap_count": 0,
        "duplicate_core_count": 0,
        "unreviewed_window_count": len(window_rows),
        "boundary_count": len(seam_rows),
        "boundary_seam_reviewed_count": 0,
        "crossing_semantic_block_count": sum(1 for row in seam_rows if row["crossing_semantic_block_ids"] or row["crossing_plan_unit_ids"] or row["crossing_contract_ids"]),
        "crossing_semantic_block_seam_reviewed_count": 0,
        "max_core_lines": MAX_CORE_LINES,
        "max_estimated_tokens": MAX_ESTIMATED_TOKENS,
        "token_estimate_method": "ceil(unicode_characters/3)",
        "completion_blockers": ["required_window_roles_not_complete", "document_integrations_not_complete", "seam_reviews_not_complete"],
    }
    (AUDIT_DIR / "doc_window_coverage_report.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    overall_path = AUDIT_DIR / "coverage_report.json"
    overall = json.loads(overall_path.read_text(encoding="utf-8"))
    overall["status"] = "window_manifest_validated_reviews_not_started"
    overall["document_window_coverage"] = {
        "manifest_status": report["status"],
        "total_windows": len(window_rows),
        "authoritative_lines": validation["authoritative_lines"],
        "covered_lines": validation["covered_lines"],
        "dispositioned_lines": dispositioned_lines,
        "gap_count": 0,
        "duplicate_core_count": 0,
        "unreviewed_window_count": len(window_rows),
        "documents_with_multiple_agents": 0,
        "documents_integrated": 0,
        "documents_seam_reviewed": 0,
    }
    overall["completion_blockers"] = ["required_window_roles_not_complete", "document_integrations_not_complete", "seam_reviews_not_complete", "feature_inventory_not_started"]
    overall_path.write_text(json.dumps(overall, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
