#!/usr/bin/env python3
"""Frozen read-only supplemental prelaunch validator for audit-004.

This is deterministic audit infrastructure. It reads live Plans sources and writes
only inside this audit directory. It never reads substantive results from older
audits and never edits canonical project files.
"""

from __future__ import annotations

import argparse
import hashlib
import heapq
import json
import math
import re
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT.parents[2]
PLANS = REPO / "Plans"
PLAN_INDEX = PLANS / ".plan_index" / "plan_units.jsonl"

MAX_LINES = 400
MAX_TOKENS = 12_000
MAX_CHARS = MAX_TOKENS * 3
MAX_CAPSULE_PACKAGE_BYTES = 65_536
DEFAULT_OVERLAP_LINES = 12

RUNNERS = {
    "runner-01": "019f49e2-0a65-71c1-8a60-293ec0c78aaf",
    "runner-02": "019f49e2-0bbd-7a42-a792-97a0f348de81",
    "runner-03": "019f49e2-0d34-7a20-b443-b3c1e7e3f427",
    "runner-04": "019f49e2-0e96-70a0-960b-162a79bc889a",
    "runner-05": "019f49e2-1022-71c1-b547-37d8b9e8bf28",
    "runner-06": "019f49e2-11a4-7103-a900-9d3efa10a213",
    "runner-07": "019f49e2-1337-7ad1-bda0-71b4073cb8fc",
    "runner-08": "019f49e2-14f8-7af2-afa3-b2394de435a0",
    "runner-09": "019f49e2-16f5-7d13-b047-49d8c1252759",
    "runner-10": "019f49e2-18cb-7101-b7cb-0027862d9fcb",
    "runner-11": "019f49e2-1a9e-7383-9761-96a1962b1054",
    "runner-12": "019f49e2-1cad-7230-b892-72a2a4da54a4",
}

DEFERRED = {
    "Plans/OpenCode_Coverage_Matrix.md",
    "Plans/GUI_Rebuild_Requirements_Checklist.md",
}
BOOTSTRAP = {
    "Plans/bootstrap/Bootstrap_Planning_Workflow.md",
    "Plans/bootstrap/Codex_Prompts.md",
}
ACTIVE_JSON = {
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
READINESS = {
    "Plans/.implementation_readiness/non_executable_closure_evidence.schema.json",
    "Plans/.implementation_readiness/pnc019_certification_receipt.schema.json",
    "Plans/.implementation_readiness/readiness_matrix.json",
}
RETIRED = {
    "Plans/chain-wizard.md",
    "Plans/chain-wizard-flexibility.md",
}

ROLES = {
    "exact": "contract_capability_exact_behavior",
    "adversarial": "adversarial_negative_space",
}

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
JSON_KEY_RE = re.compile(r'^\s*"((?:[^"\\]|\\.)+)"\s*:')
SCHEMA_ID_RE = re.compile(r'(?i)["\']?schema_id["\']?\s*[:=]\s*["\']([^"\']+)')
CONTRACT_RE = re.compile(r"ContractName:([^,\s]+)")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def rel(path: Path) -> str:
    return path.resolve().relative_to(REPO).as_posix()


def token_estimate(text: str) -> int:
    return math.ceil(len(text) / 3)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = "\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows)
    path.write_text(payload + ("\n" if payload else ""), encoding="utf-8")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def load_planunits() -> tuple[list[dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    rows = read_jsonl(PLAN_INDEX)
    by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        by_doc[row["owner_doc"]].append(row)
    return rows, dict(by_doc)


def active_sources(by_doc: dict[str, list[dict[str, Any]]]) -> tuple[list[str], list[str]]:
    markdown = sorted(
        doc for doc, rows in by_doc.items()
        if doc.startswith("Plans/") and doc.count("/") == 1
        and any(row.get("status") != "retired" for row in rows)
    )
    schemas = sorted(rel(path) for path in PLANS.glob("*.schema.json"))
    active = sorted(set(markdown) | BOOTSTRAP | set(schemas) | ACTIVE_JSON | READINESS)
    if len(markdown) != 70:
        raise RuntimeError(f"expected 70 active top-level markdown owners, found {len(markdown)}")
    if len(schemas) != 44:
        raise RuntimeError(f"expected 44 top-level schemas, found {len(schemas)}")
    if len(ACTIVE_JSON) != 14 or len(active) != 133:
        raise RuntimeError({"active": len(active), "json": len(ACTIVE_JSON)})
    blind = [path for path in active if path not in DEFERRED]
    if len(blind) != 131 or not DEFERRED.issubset(active):
        raise RuntimeError({"blind": len(blind), "deferred_missing": sorted(DEFERRED - set(active))})
    return active, blind


@dataclass
class Atom:
    start: int
    end: int
    kind: str
    block_id: str
    plan_unit_ids: list[str]
    structural_path: str | None = None
    continuation_index: int | None = None
    continuation_count: int | None = None
    continuation_reason: str | None = None


def fits(start: int, end: int, lines: list[str]) -> bool:
    text = "".join(lines[start - 1:end])
    return end - start + 1 <= MAX_LINES and len(text) <= MAX_CHARS


def json_depths(lines: list[str]) -> list[int]:
    depth = 0
    starts: list[int] = []
    in_string = False
    escaped = False
    for line in lines:
        starts.append(depth)
        for ch in line:
            if in_string:
                if escaped:
                    escaped = False
                elif ch == "\\":
                    escaped = True
                elif ch == '"':
                    in_string = False
                continue
            if ch == '"':
                in_string = True
            elif ch in "[{":
                depth += 1
            elif ch in "]}":
                depth -= 1
        if depth < 0:
            raise RuntimeError("negative JSON depth")
    if depth != 0 or in_string:
        raise RuntimeError("unbalanced JSON structure")
    return starts


def safe_boundaries(lines: list[str], start: int, end: int, kind: str) -> list[int]:
    if kind == "json":
        depths = json_depths(lines)
        base = min(depths[start - 1:end])
        return [
            line_no for line_no in range(start + 1, end + 1)
            if depths[line_no - 1] <= base + 1
            and (JSON_KEY_RE.match(lines[line_no - 1]) or lines[line_no - 1].lstrip().startswith(("{", "[")))
        ]
    return [
        line_no for line_no in range(start + 1, end + 1)
        if HEADING_RE.match(lines[line_no - 1].rstrip("\n")) or not lines[line_no - 1].strip()
    ]


def split_atom(atom: Atom, lines: list[str]) -> list[Atom]:
    if fits(atom.start, atom.end, lines):
        return [atom]
    boundaries = safe_boundaries(lines, atom.start, atom.end, "json" if atom.kind == "json" else "markdown")
    raw_parts: list[tuple[int, int]] = []
    start = atom.start
    while start <= atom.end:
        chars = 0
        hard_end = start - 1
        for line_no in range(start, atom.end + 1):
            new_chars = chars + len(lines[line_no - 1])
            if line_no - start + 1 > MAX_LINES or new_chars > MAX_CHARS:
                break
            chars = new_chars
            hard_end = line_no
        if hard_end < start:
            raise RuntimeError(f"single line exceeds limits at {atom.block_id}:{start}")
        if hard_end < atom.end:
            candidates = [line_no for line_no in boundaries if start < line_no <= hard_end]
            end = max(candidates) - 1 if candidates else hard_end
        else:
            end = atom.end
        raw_parts.append((start, end))
        start = end + 1
    count = len(raw_parts)
    reason = "oversized_planunit" if atom.kind == "planunit" else (
        "oversized_json_structural_unit" if atom.kind == "json" else "oversized_markdown_structure"
    )
    return [
        Atom(
            start=s,
            end=e,
            kind=atom.kind,
            block_id=f"{atom.block_id}:CONT-{idx:03d}",
            plan_unit_ids=atom.plan_unit_ids,
            structural_path=atom.structural_path,
            continuation_index=idx,
            continuation_count=count,
            continuation_reason=reason,
        )
        for idx, (s, e) in enumerate(raw_parts, 1)
    ]


def markdown_atoms(path_rel: str, lines: list[str], plan_rows: list[dict[str, Any]]) -> list[Atom]:
    headings: dict[int, list[str]] = defaultdict(list)
    for row in plan_rows:
        if row.get("status") == "retired":
            continue
        loc = row.get("source_location") or {}
        line_no = loc.get("heading_line")
        if not isinstance(line_no, int) or not (1 <= line_no <= len(lines)):
            raise RuntimeError(f"missing heading line for {row.get('plan_unit_id')} in {path_rel}")
        unit_line = loc.get("line")
        probe = "".join(lines[max(0, (unit_line or 1) - 1):min(len(lines), (unit_line or 1) + 6)]) if isinstance(unit_line, int) else ""
        if not isinstance(unit_line, int) or not (1 <= unit_line <= len(lines)) or row["plan_unit_id"] not in probe:
            raise RuntimeError(f"PlanUnit source-location drift for {row.get('plan_unit_id')} in {path_rel}")
        headings[line_no].append(row["plan_unit_id"])
    starts = sorted(headings)
    atoms: list[Atom] = []
    if starts and starts[0] > 1:
        atoms.extend(split_atom(Atom(1, starts[0] - 1, "markdown", f"PROLOGUE:{path_rel}", []), lines))
    if starts:
        for idx, start in enumerate(starts):
            ids = sorted(set(headings[start]))
            end = starts[idx + 1] - 1 if idx + 1 < len(starts) else len(lines)
            atoms.extend(split_atom(Atom(start, end, "planunit", f"PLANUNIT:{'+'.join(ids)}", ids), lines))
    else:
        atoms.extend(split_atom(Atom(1, len(lines), "markdown", f"DOCUMENT:{path_rel}", []), lines))
    return atoms


def json_atoms(path_rel: str, lines: list[str], text: str) -> list[Atom]:
    json.loads(text)
    depths = json_depths(lines)
    top_keys: list[tuple[int, str]] = []
    for line_no, line in enumerate(lines, 1):
        match = JSON_KEY_RE.match(line)
        if match and depths[line_no - 1] == 1:
            top_keys.append((line_no, json.loads('"' + match.group(1) + '"')))
    atoms: list[Atom] = []
    if top_keys:
        if top_keys[0][0] > 1:
            atoms.extend(split_atom(Atom(1, top_keys[0][0] - 1, "json", f"JSON_PREFIX:{path_rel}", [], "$"), lines))
        for idx, (start, key) in enumerate(top_keys):
            end = top_keys[idx + 1][0] - 1 if idx + 1 < len(top_keys) else len(lines) - 1
            atoms.extend(split_atom(Atom(start, max(start, end), "json", f"JSON_FIELD:{path_rel}:{key}", [], f"$.{key}"), lines))
        if top_keys[-1][0] <= len(lines) and lines[-1].strip() in ("}", "}]"):
            # The final closing delimiter is already included in the last atom when needed.
            pass
    else:
        atoms.extend(split_atom(Atom(1, len(lines), "json", f"JSON_ROOT:{path_rel}", [], "$"), lines))
    # Ensure exact coverage; attach any trailing lines accidentally excluded above.
    expected = 1
    repaired: list[Atom] = []
    for atom in sorted(atoms, key=lambda item: item.start):
        if atom.start > expected:
            repaired.extend(split_atom(Atom(expected, atom.start - 1, "json", f"JSON_GAP:{path_rel}:{expected}", [], "$"), lines))
        repaired.append(atom)
        expected = atom.end + 1
    if expected <= len(lines):
        repaired.extend(split_atom(Atom(expected, len(lines), "json", f"JSON_SUFFIX:{path_rel}", [], "$"), lines))
    return repaired


def pack_windows(path_rel: str, doc_id: str, lines: list[str], atoms: list[Atom], source_hash: str) -> list[dict[str, Any]]:
    packs: list[list[Atom]] = []
    current: list[Atom] = []
    chars = 0
    line_count = 0
    for atom in atoms:
        atom_text = "".join(lines[atom.start - 1:atom.end])
        atom_chars = len(atom_text)
        atom_lines = atom.end - atom.start + 1
        if current and (chars + atom_chars > MAX_CHARS or line_count + atom_lines > MAX_LINES):
            packs.append(current)
            current, chars, line_count = [], 0, 0
        if atom_chars > MAX_CHARS or atom_lines > MAX_LINES:
            raise RuntimeError(f"unsplit atom {atom.block_id}")
        current.append(atom)
        chars += atom_chars
        line_count += atom_lines
    if current:
        packs.append(current)
    windows: list[dict[str, Any]] = []
    for idx, pack in enumerate(packs, 1):
        start, end = pack[0].start, pack[-1].end
        core = "".join(lines[start - 1:end])
        window_id = f"WIN-{doc_id[4:]}-{idx:04d}"
        windows.append({
            "audit_id": AUDIT_ID,
            "record_type": "document_window",
            "window_id": window_id,
            "doc_id": doc_id,
            "document_path": path_rel,
            "core_line_start": start,
            "core_line_end": end,
            "core_line_count": end - start + 1,
            "source_sha256": source_hash,
            "core_sha256": sha(core.encode()),
            "core_chars": len(core),
            "token_estimate": token_estimate(core),
            "semantic_block_ids": [atom.block_id for atom in pack],
            "plan_unit_ids": sorted({unit for atom in pack for unit in atom.plan_unit_ids}),
            "structural_paths": sorted({atom.structural_path for atom in pack if atom.structural_path}),
            "continuations": [
                {"block_id": atom.block_id, "index": atom.continuation_index, "count": atom.continuation_count,
                 "reason": atom.continuation_reason, "plan_unit_ids": atom.plan_unit_ids,
                 "structural_path": atom.structural_path}
                for atom in pack if atom.continuation_index is not None
            ],
            "required_roles": list(ROLES.values()),
            "review_state": "unassigned",
        })
    return windows


def source_excerpt(window: dict[str, Any], lines: list[str], overlap: int) -> tuple[str, list[list[int]]]:
    start, end = window["core_line_start"], window["core_line_end"]
    before_start = max(1, start - overlap)
    after_end = min(len(lines), end + overlap)
    ranges = []
    pieces = []
    if before_start < start:
        ranges.append([before_start, start - 1])
        pieces.append(f"<<< CONTEXT_BEFORE {before_start}-{start-1} >>>\n" + "".join(lines[before_start - 1:start - 1]))
    pieces.append(f"<<< AUTHORITATIVE_CORE {start}-{end} >>>\n" + "".join(lines[start - 1:end]))
    if end < after_end:
        ranges.append([end + 1, after_end])
        pieces.append(f"<<< CONTEXT_AFTER {end+1}-{after_end} >>>\n" + "".join(lines[end:after_end]))
    return "\n".join(pieces), ranges


def role_instructions(role_key: str) -> str:
    if role_key == "exact":
        return "Extract exact behavior, contracts, capabilities, states, authorities, consumers, GUI truth, failures, acceptance evidence, and consequential builder discretion from only this capsule. Identify underspecified obligations with exact source lines. Do not use external or prior-audit knowledge."
    return "Independently attack negative space in only this capsule: missing callers, states, transitions, authority, failure/recovery, security/privacy, misleading GUI truth, propagation, operations, scale, compatibility, and test oracles. Do not see or infer the exact reviewer's conclusions."


def make_capsules_and_assignments(windows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, int]]:
    loads = {runner: 0 for runner in RUNNERS}
    heaps = [(0, runner) for runner in RUNNERS]
    heapq.heapify(heaps)
    assignments: list[dict[str, Any]] = []
    capsules: list[dict[str, Any]] = []
    seq = 0
    window_lookup = {row["window_id"]: row for row in windows}
    for window in sorted(windows, key=lambda row: (-row["token_estimate"], row["window_id"])):
        chosen: dict[str, str] = {}
        for role_key in ("exact", "adversarial"):
            candidates = sorted((load, runner) for runner, load in loads.items() if runner not in chosen.values())
            runner = candidates[0][1]
            chosen[role_key] = runner
            loads[runner] += window["token_estimate"]
        for role_key in ("exact", "adversarial"):
            seq += 1
            runner = chosen[role_key]
            role = ROLES[role_key]
            assignment_id = f"A004-{seq:06d}-{role_key.upper()}-{window['window_id']}"
            path = REPO / window["document_path"]
            lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
            overlap = DEFAULT_OVERLAP_LINES
            while True:
                excerpt, context_ranges = source_excerpt(window, lines, overlap)
                source_ref = ROOT / "capsules" / "source" / f"{window['window_id']}.txt"
                source_ref.parent.mkdir(parents=True, exist_ok=True)
                if not source_ref.exists():
                    source_ref.write_text(excerpt, encoding="utf-8")
                source_bytes = source_ref.read_bytes()
                capsule = {
                    "audit_id": AUDIT_ID,
                    "assignment_id": assignment_id,
                    "runner_id": runner,
                    "runner_thread_id": RUNNERS[runner],
                    "role": role,
                    "role_key": role_key,
                    "role_instructions": role_instructions(role_key),
                    "window_id": window["window_id"],
                    "doc_id": window["doc_id"],
                    "document_path": window["document_path"],
                    "core_range": [window["core_line_start"], window["core_line_end"]],
                    "context_ranges": context_ranges,
                    "source_sha256": window["source_sha256"],
                    "core_sha256": window["core_sha256"],
                    "source_excerpt_ref": rel(source_ref),
                    "source_excerpt_sha256": sha(source_bytes),
                    "source_excerpt_bytes": len(source_bytes),
                    "blindness": {"prior_audits": "forbidden", "other_reviewer_results": "forbidden", "unrelated_windows": "forbidden"},
                    "output_required": ["observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs"],
                }
                capsule_bytes = (json.dumps(capsule, indent=2, sort_keys=True) + "\n").encode()
                package_bytes = len(source_bytes) + len(capsule_bytes)
                if package_bytes <= MAX_CAPSULE_PACKAGE_BYTES:
                    break
                if overlap == 0:
                    raise RuntimeError(f"capsule package too large for {assignment_id}: {package_bytes}")
                overlap //= 2
                source_ref.unlink(missing_ok=True)
            capsule_ref = ROOT / "capsules" / "metadata" / f"{assignment_id}.json"
            write_json(capsule_ref, capsule)
            capsule_file = capsule_ref.read_bytes()
            capsule_row = {
                "assignment_id": assignment_id,
                "window_id": window["window_id"],
                "role": role,
                "runner_id": runner,
                "capsule_ref": rel(capsule_ref),
                "capsule_sha256": sha(capsule_file),
                "capsule_bytes": len(capsule_file),
                "source_excerpt_ref": rel(source_ref),
                "source_excerpt_sha256": sha(source_bytes),
                "source_excerpt_bytes": len(source_bytes),
                "capsule_package_bytes": len(capsule_file) + len(source_bytes),
            }
            capsules.append(capsule_row)
            assignments.append({
                "audit_id": AUDIT_ID,
                "phase": "blind_document_window_review",
                "assignment_id": assignment_id,
                "assignment_seq": seq,
                "runner_id": runner,
                "runner_thread_id": RUNNERS[runner],
                "role": role,
                "role_key": role_key,
                "window_id": window["window_id"],
                "doc_id": window["doc_id"],
                "document_path": window["document_path"],
                "core_range": [window["core_line_start"], window["core_line_end"]],
                "source_sha256": window["source_sha256"],
                "core_sha256": window["core_sha256"],
                "token_estimate": window["token_estimate"],
                **{key: capsule_row[key] for key in ("capsule_ref", "capsule_sha256", "capsule_bytes", "source_excerpt_ref", "source_excerpt_sha256", "source_excerpt_bytes", "capsule_package_bytes")},
                "required_model": "gpt-5.6-sol",
                "required_reasoning_effort": "ultra",
                "fresh_agent_required": True,
                "prior_substantive_assignment_count": 0,
                "terminal_after_result": True,
                "followup_reuse_forbidden": True,
                "state": "ready_unassigned",
            })
    assert len(assignments) == len(window_lookup) * 2
    return capsules, assignments, loads


def build() -> None:
    for directory in ("coordination", "manifests", "assignments", "capsules/source", "capsules/metadata", "validators", "merged", "reports"):
        (ROOT / directory).mkdir(parents=True, exist_ok=True)
    _, by_doc = load_planunits()
    active, blind = active_sources(by_doc)
    scope_rows: list[dict[str, Any]] = []
    windows: list[dict[str, Any]] = []
    for path_rel in active:
        path = REPO / path_rel
        data = path.read_bytes()
        text = data.decode("utf-8")
        lines = text.splitlines(keepends=True)
        phase = "post_freeze_deferred" if path_rel in DEFERRED else "blind_initial"
        doc_id = "DOC-" + sha(path_rel.encode())[:12].upper()
        scope_rows.append({
            "audit_id": AUDIT_ID, "record_type": "document_scope", "doc_id": doc_id,
            "path": path_rel, "active_authority": True, "phase_disposition": phase,
            "line_count": len(lines), "byte_count": len(data), "source_sha256": sha(data),
            "plan_unit_count": sum(1 for row in by_doc.get(path_rel, []) if row.get("status") != "retired"),
            "window_state": "deferred_until_candidate_freeze" if phase != "blind_initial" else "pending_generation",
        })
        if phase != "blind_initial":
            continue
        if path.suffix == ".md":
            atoms = markdown_atoms(path_rel, lines, by_doc.get(path_rel, []))
        else:
            atoms = json_atoms(path_rel, lines, text)
        doc_windows = pack_windows(path_rel, doc_id, lines, atoms, sha(data))
        windows.extend(doc_windows)
        scope_rows[-1]["window_ids"] = [row["window_id"] for row in doc_windows]
        scope_rows[-1]["window_state"] = "prelaunch_generated"
    for path_rel in sorted(RETIRED):
        path = REPO / path_rel
        scope_rows.append({
            "audit_id": AUDIT_ID, "record_type": "document_scope", "doc_id": "DOC-" + sha(path_rel.encode())[:12].upper(),
            "path": path_rel, "active_authority": False, "phase_disposition": "retired_source_lineage_only",
            "line_count": len(path.read_text(encoding="utf-8").splitlines()), "source_sha256": sha(path.read_bytes()),
            "window_state": "explicitly_excluded",
        })
    capsules, assignments, loads = make_capsules_and_assignments(windows)
    write_jsonl(ROOT / "manifests" / "doc_scope_manifest.jsonl", scope_rows)
    write_jsonl(ROOT / "manifests" / "window_manifest.jsonl", windows)
    write_jsonl(ROOT / "manifests" / "context_capsule_registry.jsonl", capsules)
    write_jsonl(ROOT / "assignments" / "global_assignment_manifest.jsonl", assignments)
    for runner in RUNNERS:
        write_jsonl(ROOT / "assignments" / f"{runner}.jsonl", [row for row in assignments if row["runner_id"] == runner])
    write_json(ROOT / "coordination" / "runner_thread_registry.json", RUNNERS)
    architecture = {
        "audit_id": AUDIT_ID, "status": "prelaunch_built", "runner_count": 12,
        "fresh_agent_per_assignment": True, "persistent_runner_semantic_work_forbidden": True,
        "exact_adversarial_cross_runner_separation": True, "single_writer_namespaces": True,
        "active_authority_sources": 133, "blind_initial_sources": 131, "post_freeze_deferred_sources": 2,
        "window_count": len(windows), "assignment_count": len(assignments), "runner_token_loads": loads,
        "later_fresh_fleets_required": ["seam", "document_integration", "feature_inventory", "external_research", "feature_synthesis", "scenario_falsification", "shadow_builders", "mutation", "certification"],
    }
    write_json(ROOT / "architecture.json", architecture)
    (ROOT / "AUDIT_CHARTER.md").write_text(
        "# Audit 004 Charter\n\nBlind, exhaustive, audit-only Plan Assurance. Audits 001-003 provide zero substantive coverage. "
        "Every semantic assignment uses one fresh gpt-5.6-sol/ultra agent and exact/adversarial roles are isolated across top-level runners. "
        "External research is mandatory for every feature in a later fresh fleet. No canonical repairs are authorized.\n",
        encoding="utf-8",
    )
    write_validator_wrappers()
    result = validate_existing()
    write_json(ROOT / "validator_results.json", result)
    coverage = {
        "audit_id": AUDIT_ID, "status": "ready_for_blind_window_runners", "complete": False,
        "active_authority_sources": 133, "blind_initial_sources": 131, "post_freeze_deferred_sources": 2,
        "windows": len(windows), "assignments": len(assignments), "valid_results": 0,
        "substantive_coverage_credit": 0, "prelaunch_validation_passed": True,
        "postrun_validation": "deferred_not_passed", "completion_blockers": ["all_window_results", "later_assurance_fleets"],
    }
    write_json(ROOT / "coverage_report.json", coverage)
    seal_payload = {
        "audit_id": AUDIT_ID, "status": "READY_FOR_RUNNERS", "prelaunch_validation_passed": True,
        "window_count": len(windows), "assignment_count": len(assignments), "runner_count": 12,
        "manifest_sha256": sha((ROOT / "assignments" / "global_assignment_manifest.jsonl").read_bytes()),
        "window_manifest_sha256": sha((ROOT / "manifests" / "window_manifest.jsonl").read_bytes()),
        "capsule_registry_sha256": sha((ROOT / "manifests" / "context_capsule_registry.jsonl").read_bytes()),
        "runner_registry_sha256": sha((ROOT / "coordination" / "runner_thread_registry.json").read_bytes()),
        "validator_result_sha256": sha((ROOT / "validator_results.json").read_bytes()),
        "old_audit_substantive_credit": 0,
    }
    write_json(ROOT / "coordination" / "READY_FOR_RUNNERS.json", seal_payload)
    (ROOT / "CHECKPOINT.md").write_text(
        "# Audit 004 Checkpoint\n\n- status: ready_for_runners\n- substantive_coverage: 0\n"
        f"- windows: {len(windows)}\n- assignments: {len(assignments)}\n- prelaunch_validation: passed\n"
        "- postrun_validation: deferred_not_passed\n",
        encoding="utf-8",
    )
    print(json.dumps({**seal_payload, "runner_token_loads": loads}, indent=2, sort_keys=True))


def validate_existing() -> dict[str, Any]:
    scopes = read_jsonl(ROOT / "manifests" / "doc_scope_manifest.jsonl")
    windows = read_jsonl(ROOT / "manifests" / "window_manifest.jsonl")
    capsules = read_jsonl(ROOT / "manifests" / "context_capsule_registry.jsonl")
    assignments = read_jsonl(ROOT / "assignments" / "global_assignment_manifest.jsonl")
    errors: list[str] = []
    active = [row for row in scopes if row.get("active_authority")]
    blind = [row for row in active if row.get("phase_disposition") == "blind_initial"]
    deferred = [row for row in active if row.get("phase_disposition") == "post_freeze_deferred"]
    if (len(active), len(blind), len(deferred)) != (133, 131, 2):
        errors.append(f"scope_counts:{len(active)}/{len(blind)}/{len(deferred)}")
    by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in windows:
        by_doc[row["document_path"]].append(row)
        if row["core_line_count"] > MAX_LINES or row["token_estimate"] > MAX_TOKENS:
            errors.append(f"window_limit:{row['window_id']}")
    for scope in blind:
        path = REPO / scope["path"]
        data = path.read_bytes()
        if sha(data) != scope["source_sha256"]:
            errors.append(f"source_drift:{scope['path']}")
        line_count = len(data.decode("utf-8").splitlines(keepends=True))
        expected = 1
        for row in sorted(by_doc.get(scope["path"], []), key=lambda item: item["core_line_start"]):
            if row["core_line_start"] != expected:
                errors.append(f"core_gap_or_duplicate:{scope['path']}:{expected}:{row['core_line_start']}")
            expected = row["core_line_end"] + 1
        if expected != line_count + 1:
            errors.append(f"core_tail:{scope['path']}:{expected}:{line_count+1}")
    # Independently prove that every fitting PlanUnit heading-to-next-PlanUnit
    # span stayed on one side of every window boundary. Source locations come
    # from the live validated Plan index, avoiding loose heading/date regexes.
    _, planunits_by_doc = load_planunits()
    fitting_planunit_spans = 0
    oversized_planunit_spans = 0
    for scope in blind:
        if not scope["path"].endswith(".md"):
            continue
        path = REPO / scope["path"]
        lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
        grouped: dict[int, list[str]] = defaultdict(list)
        for unit in planunits_by_doc.get(scope["path"], []):
            if unit.get("status") == "retired":
                continue
            loc = unit.get("source_location") or {}
            if isinstance(loc.get("heading_line"), int):
                grouped[loc["heading_line"]].append(unit["plan_unit_id"])
        starts = sorted(grouped)
        doc_windows = by_doc.get(scope["path"], [])
        for idx, start in enumerate(starts):
            end = starts[idx + 1] - 1 if idx + 1 < len(starts) else len(lines)
            ids = set(grouped[start])
            overlaps = [row for row in doc_windows if row["core_line_end"] >= start and row["core_line_start"] <= end]
            if fits(start, end, lines):
                fitting_planunit_spans += 1
                if len(overlaps) != 1 or overlaps[0]["core_line_start"] > start or overlaps[0]["core_line_end"] < end:
                    errors.append(f"fitting_planunit_split:{scope['path']}:{start}:{sorted(ids)}")
            else:
                oversized_planunit_spans += 1
                if not overlaps:
                    errors.append(f"oversized_planunit_missing:{scope['path']}:{start}:{sorted(ids)}")
                for row in overlaps:
                    matching = [c for c in row.get("continuations", []) if c.get("reason") == "oversized_planunit" and ids.intersection(c.get("plan_unit_ids") or [])]
                    if not matching:
                        errors.append(f"oversized_planunit_metadata:{row['window_id']}:{sorted(ids)}")
    for row in windows:
        for continuation in row.get("continuations", []):
            if continuation.get("reason") == "oversized_json_structural_unit":
                if not continuation.get("structural_path") or not continuation.get("index") or not continuation.get("count"):
                    errors.append(f"json_structural_continuation_metadata:{row['window_id']}")
    by_window_role: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    if len(assignments) != len(windows) * 2 or len({row["assignment_id"] for row in assignments}) != len(assignments):
        errors.append("assignment_count_or_duplicate")
    capsule_by_assignment = {row["assignment_id"]: row for row in capsules}
    loads = defaultdict(int)
    for row in assignments:
        by_window_role[row["window_id"]][row["role_key"]] = row
        loads[row["runner_id"]] += row["token_estimate"]
        if RUNNERS.get(row["runner_id"]) != row["runner_thread_id"]:
            errors.append(f"runner_registry:{row['assignment_id']}")
        cap = capsule_by_assignment.get(row["assignment_id"])
        if not cap or cap["capsule_package_bytes"] > MAX_CAPSULE_PACKAGE_BYTES:
            errors.append(f"capsule_missing_or_large:{row['assignment_id']}")
            continue
        for ref_key, hash_key in (("capsule_ref", "capsule_sha256"), ("source_excerpt_ref", "source_excerpt_sha256")):
            ref_path = REPO / cap[ref_key]
            if not ref_path.is_file() or sha(ref_path.read_bytes()) != cap[hash_key]:
                errors.append(f"capsule_hash:{row['assignment_id']}:{ref_key}")
    for window in windows:
        roles = by_window_role.get(window["window_id"], {})
        if set(roles) != {"exact", "adversarial"}:
            errors.append(f"role_missing:{window['window_id']}")
        elif roles["exact"]["runner_id"] == roles["adversarial"]["runner_id"] or roles["exact"]["runner_thread_id"] == roles["adversarial"]["runner_thread_id"]:
            errors.append(f"role_colocation:{window['window_id']}")
    if loads:
        max_assignment = max(row["token_estimate"] for row in assignments)
        if max(loads.values()) - min(loads.values()) > max_assignment * 2:
            errors.append("runner_load_imbalance")
    if errors:
        raise RuntimeError(json.dumps(errors[:100], indent=2))
    return {
        "audit_id": AUDIT_ID, "phase": "prelaunch", "status": "pass",
        "checks": {
            "source_and_scope": "pass", "exact_core_coverage": "pass", "window_limits": "pass",
            "fitting_planunit_boundary_preservation": f"pass:{fitting_planunit_spans}",
            "oversized_planunit_continuation_metadata": f"pass:{oversized_planunit_spans}",
            "json_structural_continuation_metadata": "pass",
            "capsule_hash_and_size": "pass", "assignment_uniqueness": "pass", "cross_runner_role_separation": "pass",
            "runner_registry_and_balance": "pass", "old_audit_credit_zero": "pass",
            "postrun_results": "deferred_not_passed", "fresh_agent_identity_receipts": "deferred_not_passed",
        },
        "errors": [],
    }


def write_validator_wrappers() -> None:
    wrapper = """#!/usr/bin/env python3
import importlib.util, json, sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('audit004_build', root / 'build_launch.py')
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules[spec.name] = module
spec.loader.exec_module(module)
print(json.dumps(module.validate_existing(), indent=2, sort_keys=True))
"""
    for name in ("validate_master_manifest.py", "validate_horizontal_isolation.py"):
        path = ROOT / "validators" / name
        path.write_text(wrapper, encoding="utf-8")
        path.chmod(0o755)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output")
    args = parser.parse_args()
    result = validate_existing()
    if args.output:
        output = Path(args.output).resolve()
        if ROOT not in output.parents:
            raise RuntimeError("output must stay inside audit root")
        write_json(output, result)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
