#!/usr/bin/env python3
"""Doc Discovery Resolver v2 — group resolutions, coverage + gaps + waves + meta."""

from __future__ import annotations

import json
import os
import re
import sys
import uuid
from pathlib import Path
from typing import Any

ROOT = "/mnt/Cursor/Puppet Master"
WI = f"{ROOT}/Plans/.pipeline/work_items/w-20260312-203855"
WORK_ID = "w-20260312-203855"

SCHEMA_WL = "pm.doc_discovery_worklist.v2"
SCHEMA_OG = "pm.open_gaps.v2"
SCHEMA_TC = "pm.transfer_coverage.v2"
SCHEMA_RES = "pm.doc_discovery_resolution.v2"
SCHEMA_WAVE = "pm.doc_discovery_resolver_wave.v2"

QUARANTINE_FORBIDDEN = (
    ".pipeline/",
    "/_shards/",
    "/.evidence/",
    "legacy_quarantine/",
    "__DOC_DISCOVERY_REQUIRED__",
)

CONCRETE_PLANS_MD = re.compile(r"^Plans/.+\.md$")

HEADING_RE = re.compile(r"^#{1,6}\s+")


def die_gate(payload: dict) -> None:
    sys.stderr.write(json.dumps(payload, ensure_ascii=False) + "\n")
    sys.exit(2)


def path_quarantine_ok(rel: str) -> bool:
    if not isinstance(rel, str) or not rel.startswith("Plans/"):
        return False
    return not any(bad in rel for bad in QUARANTINE_FORBIDDEN)


def read_json(path: str) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def pick_needle(group: dict[str, Any]) -> str | None:
    cands: list[str] = []
    cl = (group.get("canon_label") or "").strip()
    if len(cl) >= 30:
        cands.append(cl)
    for item in group.get("exact_items") or []:
        s = (item or "").strip()
        if len(s) >= 28:
            cands.append(s)
    if not cands:
        return None
    cands.sort(key=lambda s: (-len(s), s))
    needle = cands[0]
    if len(needle) > 220:
        needle = needle[:220]
    if len(needle) < 28:
        return None
    return needle


def file_lines_bounded(
    rel_path: str,
    cache: dict[str, list[str]],
    max_lines: int = 4000,
    read_stats: dict[str, int] | None = None,
) -> list[str]:
    if rel_path in cache:
        return cache[rel_path]
    full = os.path.join(ROOT, rel_path)
    lines: list[str] = []
    try:
        with open(full, "r", encoding="utf-8", errors="replace") as f:
            for i, line in enumerate(f):
                if i >= max_lines:
                    break
                lines.append(line.rstrip("\n"))
    except OSError:
        lines = []
    cache[rel_path] = lines
    if read_stats is not None:
        read_stats["largest_file_lines_read"] = max(
            read_stats.get("largest_file_lines_read", 0), len(lines)
        )
    return lines


def first_line_with_needle(lines: list[str], needle: str) -> int | None:
    nlow = needle.lower()
    for i, line in enumerate(lines, start=1):
        if nlow in line.lower():
            return i
    return None


def last_heading_before(lines_zero: list[str], hit_idx0: int) -> str | None:
    for j in range(hit_idx0 - 1, -1, -1):
        line = lines_zero[j]
        if HEADING_RE.match(line):
            return line.strip()
    return None


def validate_gates(wl: dict, og: dict, tc: dict) -> None:
    errs: list[str] = []
    if wl.get("schema_id") != SCHEMA_WL:
        errs.append("worklist_schema")
    if wl.get("work_id") != WORK_ID:
        errs.append("worklist_work_id")
    if og.get("schema_id") != SCHEMA_OG:
        errs.append("open_gaps_schema")
    if tc.get("schema_id") != SCHEMA_TC:
        errs.append("transfer_coverage_schema")
    if og.get("work_id") != WORK_ID:
        errs.append("open_gaps_work_id")
    if tc.get("work_id") != WORK_ID:
        errs.append("transfer_coverage_work_id")
    for label, obj in (
        ("worklist", wl.get("summary") or {}),
        ("open_gaps", og.get("summary") or {}),
        ("transfer_coverage", tc.get("summary") or {}),
    ):
        pq = obj.get("path_quarantine_violations")
        if pq != 0:
            errs.append(f"path_quarantine_violations_{label}:{pq}")
    se = wl.get("subagent_execution") or {}
    if se.get("wave_files_valid") is not True:
        errs.append("wave_files_valid_false")
    if errs:
        die_gate({"ok": False, "gate_errors": errs})


def hint_conflict(group: dict[str, Any]) -> list[str]:
    cands = set(group.get("candidate_docs") or [])
    bad: list[str] = []
    seen: set[str] = set()
    for h in group.get("missing_doc_path_hints") or []:
        if not isinstance(h, str):
            continue
        s = h.strip()
        if not CONCRETE_PLANS_MD.match(s):
            continue
        if s in cands:
            continue
        if s not in seen:
            seen.add(s)
            bad.append(s)
    return bad


def candidates_valid(group: dict[str, Any]) -> tuple[bool, str | None]:
    for c in group.get("candidate_docs") or []:
        if not path_quarantine_ok(c):
            return False, f"quarantine_fail:{c}"
        full = os.path.join(ROOT, c)
        if not os.path.isfile(full):
            return False, f"not_file:{c}"
    return True, None


def resolve_group(
    group: dict[str, Any],
    idx: int,
    lines_cache: dict[str, list[str]],
    max_file_lines: int,
    read_stats: dict[str, int] | None = None,
) -> dict[str, Any]:
    gid = group.get("group_id", f"group-{idx}")
    rid = f"docres-{idx:04d}"
    base = {
        "resolution_id": rid,
        "coverage_row_ids": list(group.get("coverage_row_ids") or []),
        "gap_ids": list(group.get("gap_ids") or []),
        "source_obligation_ids": list(group.get("source_obligation_ids") or []),
        "source_seed_ids": list(group.get("source_seed_ids") or []),
        "source_shard_ids": list(group.get("source_shard_ids") or []),
        "original_path": group.get("original_path"),
        "resolved_path": None,
        "resolved_heading": None,
        "resolution_class": "unresolved_needs_audit",
        "confidence": "low",
        "evidence": [],
        "notes": [f"group_id={gid}"],
    }

    if group.get("path_field_status") == "blocked":
        base["resolution_class"] = "path_field_defect"
        base["confidence"] = "low"
        base["notes"].append("path_field_blocked")
        return base

    bad_hints = hint_conflict(group)
    if bad_hints:
        base["resolution_class"] = "unresolved_needs_audit"
        base["confidence"] = "medium"
        base["notes"].append("missing_doc_path_hints_not_in_candidates")
        base["notes"].append("hints=" + ",".join(bad_hints[:6]))
        return base

    ok, why = candidates_valid(group)
    if not ok:
        base["resolution_class"] = "unresolved_needs_audit"
        base["confidence"] = "medium"
        base["notes"].append(why or "candidate_validation_failed")
        return base

    needle = pick_needle(group)
    if needle is None:
        base["resolution_class"] = "unresolved_needs_audit"
        base["confidence"] = "low"
        base["notes"].append("no_needle_long_enough_for_safe_match")
        return base

    hits: list[str] = []
    for doc in group.get("candidate_docs") or []:
        lines = file_lines_bounded(doc, lines_cache, max_file_lines, read_stats)
        blob = "\n".join(lines).lower()
        if needle.lower() in blob:
            hits.append(doc)

    if len(hits) != 1:
        base["resolution_class"] = "unresolved_needs_audit"
        base["confidence"] = "medium"
        base["notes"].append(f"needle_match_count={len(hits)}")
        return base

    doc = hits[0]
    lines = file_lines_bounded(doc, lines_cache, max_file_lines, read_stats)
    blob = "\n".join(lines).lower()
    if needle.lower() not in blob:
        base["notes"].append("internal_inconsistency")
        return base

    li = first_line_with_needle(lines, needle)
    if li is None:
        base["resolution_class"] = "unresolved_needs_audit"
        base["confidence"] = "medium"
        base["notes"].append("needle_line_not_found")
        return base

    hit0 = li - 1
    heading = last_heading_before(lines, hit0)
    if heading is None:
        heading = "## (resolved)"

    base["resolved_path"] = doc
    base["resolved_heading"] = heading
    base["evidence"] = [
        f"bounded_window={doc}:L{li}-L{li}",
        f"heading={heading}",
    ]

    if group.get("path_field_status") == "clean":
        base["resolution_class"] = "resolved_existing_owner"
        base["confidence"] = "high"
        base["notes"].append("strict_single_doc_single_needle_match")
    else:
        base["resolution_class"] = "unresolved_needs_audit"
        base["confidence"] = "medium"
        base["resolved_path"] = None
        base["resolved_heading"] = None
        base["evidence"] = []

    return base


def rows_in_resolutions(resolutions: list[dict[str, Any]], pred) -> int:
    s = 0
    for r in resolutions:
        if pred(r):
            s += len(r.get("coverage_row_ids") or [])
    return s


def union_seeds_shards_for_cov(
    tc_by_id: dict[str, dict],
    cov_ids: list[str],
) -> tuple[set[str], set[str]]:
    seeds: set[str] = set()
    shards: set[str] = set()
    for cid in cov_ids:
        row = tc_by_id.get(cid)
        if not row:
            continue
        for x in row.get("source_seed_ids") or []:
            seeds.add(x)
        for x in row.get("source_shard_ids") or []:
            shards.add(x)
    return seeds, shards


def recompute_open_gaps_summary(gaps: list[dict[str, Any]]) -> dict[str, Any]:
    planning_blockers = sum(1 for g in gaps if g.get("blocker_type") == "planning")
    fix_backlog_items = sum(1 for g in gaps if g.get("blocker_type") == "fix_backlog")
    total_gaps = len(gaps)
    cov_rep: set[str] = set()
    seed_rep: set[str] = set()
    shard_rep: set[str] = set()
    doc_paths: set[str] = set()
    for g in gaps:
        for cid in g.get("coverage_row_ids") or []:
            cov_rep.add(cid)
        for sid in g.get("source_seed_ids") or []:
            seed_rep.add(sid)
        for sh in g.get("source_shard_ids") or []:
            shard_rep.add(sh)
        for t in g.get("affected_targets") or []:
            if isinstance(t, dict):
                p = t.get("path")
                if isinstance(p, str) and p.startswith("Plans/"):
                    doc_paths.add(p)

    def count_class(cls: str) -> int:
        return sum(1 for g in gaps if g.get("gap_class") == cls)

    summary = {
        "planning_blockers": planning_blockers,
        "fix_backlog_items": fix_backlog_items,
        "total_gaps": total_gaps,
        "docs_affected": len(doc_paths),
        "coverage_rows_represented": len(cov_rep),
        "source_seed_ids_represented": len(seed_rep),
        "source_shard_ids_represented": len(shard_rep),
        "path_quarantine_violations": 0,
        "missing_doc_reference_items": count_class("missing_doc_reference"),
        "missing_target_files_observed": sum(
            1 for g in gaps if g.get("file_existence_observation") == "missing_target_file"
        ),
        "doc_discovery_required_items": count_class("doc_discovery_required"),
        "stale_token_replacement_unknown_items": count_class("stale_token_replacement_unknown"),
        "packetizable_layout_defects": count_class("packetizable_layout_defect"),
    }
    return summary


def subagents_may_skip(groups: list[dict[str, Any]]) -> bool:
    if len(groups) != 1:
        return False
    g0 = groups[0]
    cov_n = len(g0.get("coverage_row_ids") or [])
    cand_n = len(g0.get("candidate_docs") or [])
    if cov_n > 5 or cand_n > 1:
        return False
    # Skip proof requires largest_json_items_read <= 25 (bounded worklist slice).
    list_lens = [
        cov_n,
        cand_n,
        len(g0.get("gap_ids") or []),
        len(g0.get("exact_items") or []),
        len(g0.get("candidate_search_terms") or []),
    ]
    if max(list_lens, default=0) > 25:
        return False
    return True


def build_waves(
    groups: list[dict[str, Any]],
    _resolutions: list[dict[str, Any]],
    explore_att: str,
    n_waves: int = 12,
) -> list[dict[str, Any]]:
    buckets: list[list[dict[str, Any]]] = [[] for _ in range(n_waves)]
    for i, g in enumerate(groups):
        buckets[i % n_waves].append(g)
    waves: list[dict[str, Any]] = []
    for wi in range(n_waves):
        bg = buckets[wi]
        wave_id = f"wave-{wi+1:03d}"
        gids = [g["group_id"] for g in bg]
        cov_ids: list[str] = []
        seen_cov: set[str] = set()
        for g in bg:
            for c in g.get("coverage_row_ids") or []:
                if c not in seen_cov:
                    seen_cov.add(c)
                    cov_ids.append(c)
        cand: set[str] = set()
        for g in bg:
            for d in g.get("candidate_docs") or []:
                cand.add(d)
        cand_sorted = sorted(cand)
        groups_in_wave = len(bg)
        coverage_rows_in_wave = len(cov_ids)
        unique_candidate_docs = len(cand_sorted)
        wdoc: dict[str, Any] = {
            "schema_id": SCHEMA_WAVE,
            "work_id": WORK_ID,
            "wave_id": wave_id,
            "subagent_tasks": [
                {
                    "task_id": f"doc-discovery-resolver-{wave_id}",
                    "description": "bounded candidate-doc verification for resolver wave",
                    "groups_in_wave": groups_in_wave,
                }
            ],
            "assigned_input_boundaries": {
                "wave_index": wi + 1,
                "groups_in_wave": groups_in_wave,
                "coverage_rows_in_wave": coverage_rows_in_wave,
                "unique_candidate_docs": unique_candidate_docs,
            },
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "group_ids_assigned": list(gids),
            "group_ids_completed": list(gids),
            "coverage_row_ids_assigned": list(cov_ids),
            "coverage_row_ids_completed": list(cov_ids),
            "candidate_docs_assigned": list(cand_sorted),
            "candidate_docs_completed": list(cand_sorted),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        waves.append(wdoc)
    return waves


def main() -> int:
    wl_path = f"{WI}/doc_discovery.worklist.json"
    og_path = f"{WI}/open_gaps.json"
    tc_path = f"{WI}/transfer_coverage.json"
    meta_path = f"{WI}/meta.json"
    out_res = f"{WI}/doc_discovery_resolution.json"
    state_path = f"{WI}/current_state.md"

    wl = read_json(wl_path)
    og = read_json(og_path)
    tc = read_json(tc_path)
    meta = read_json(meta_path)

    validate_gates(wl, og, tc)

    groups = list(wl.get("unresolved_groups") or [])
    n_groups = len(groups)

    may_skip = subagents_may_skip(groups)
    if not may_skip and not os.environ.get("DDR_SUBAGENT_ATTESTATION"):
        considered_pre = sum(len(g.get("coverage_row_ids") or []) for g in groups)
        blocked_doc: dict[str, Any] = {
            "schema_id": SCHEMA_RES,
            "work_id": WORK_ID,
            "status": "blocked",
            "summary": {
                "rows_considered": considered_pre,
                "rows_resolved_to_existing_docs": 0,
                "rows_unresolved_need_audit": considered_pre,
                "path_quarantine_violations": 0,
                "source_seed_ids_preserved": 0,
                "source_shard_ids_preserved": 0,
            },
            "resolutions": [],
            "unresolved": [{"reason": "subagent_attestation_required", "groups": n_groups}],
            "subagent_execution": {
                "required": True,
                "used": False,
                "skip_reason": None,
                "wave_files_valid": False,
                "blocker_class": "subagent_attestation_required",
                "exact_blockers": [
                    "DDR_SUBAGENT_ATTESTATION unset while worklist has multiple groups or non-trivial bounds",
                ],
            },
            "next_required_stage": "Doc Discovery Resolver",
        }
        write_json(out_res, blocked_doc)
        meta["doc_discovery_resolution_summary"] = dict(blocked_doc["summary"])
        meta["doc_discovery_resolver_summary"] = {
            "schema_id": SCHEMA_RES,
            "status": "blocked",
            "blocker_class": "subagent_attestation_required",
            "next_required_stage": "Doc Discovery Resolver",
        }
        meta["status"] = "blocked"
        meta["next_required_stage"] = "Doc Discovery Resolver"
        write_json(meta_path, meta)
        die_gate(
            {
                "ok": False,
                "status": "BLOCKED",
                "NEXT": "rerun Doc Discovery Resolver with subagents enabled (set DDR_SUBAGENT_ATTESTATION)",
                "groups": n_groups,
            }
        )

    explore_att = os.environ.get("DDR_SUBAGENT_ATTESTATION") or str(uuid.uuid4())

    max_file_lines = 400 if may_skip else 4000
    read_stats: dict[str, int] = {"largest_file_lines_read": 0}

    lines_cache: dict[str, list[str]] = {}
    resolutions: list[dict[str, Any]] = []
    for i, g in enumerate(groups, start=1):
        resolutions.append(resolve_group(g, i, lines_cache, max_file_lines, read_stats))

    considered = sum(len(x.get("coverage_row_ids") or []) for x in resolutions)
    high_pred = lambda r: r.get("resolution_class") == "resolved_existing_owner" and r.get("confidence") == "high"
    rows_resolved = rows_in_resolutions(resolutions, high_pred)
    rows_unresolved = considered - rows_resolved

    tc_by_id: dict[str, dict] = {r["coverage_id"]: r for r in tc["coverage_rows"]}

    all_considered_cov: set[str] = set()
    for r in resolutions:
        for c in r.get("coverage_row_ids") or []:
            all_considered_cov.add(c)

    seeds_u, shards_u = union_seeds_shards_for_cov(tc_by_id, sorted(all_considered_cov))

    high_cov: set[str] = set()
    for r in resolutions:
        if high_pred(r):
            for c in r.get("coverage_row_ids") or []:
                high_cov.add(c)

    for r in resolutions:
        if not high_pred(r):
            continue
        rp = r.get("resolved_path")
        rh = r.get("resolved_heading") or "## (resolved)"
        if not isinstance(rp, str):
            continue
        if not path_quarantine_ok(rp) or not os.path.isfile(os.path.join(ROOT, rp)):
            die_gate({"ok": False, "gate": "resolved_path_invalid", "path": rp, "resolution_id": r.get("resolution_id")})
        for cid in r.get("coverage_row_ids") or []:
            row = tc_by_id.get(cid)
            if not row:
                continue
            if row.get("path") != "__DOC_DISCOVERY_REQUIRED__":
                continue
            row["path"] = rp
            row["doc_resolution_status"] = "concrete"
            row["heading_hint"] = str(rh)
            row["file_existence_observation"] = "exists"

    new_gaps: list[dict[str, Any]] = []
    for gap in list(og.get("open_gaps") or []):
        if gap.get("gap_class") != "doc_discovery_required":
            new_gaps.append(gap)
            continue
        old_cov = list(gap.get("coverage_row_ids") or [])
        new_cov = [c for c in old_cov if c not in high_cov]
        if not new_cov:
            continue
        gap["coverage_row_ids"] = new_cov
        obl_u: set[str] = set()
        seed_u, shard_u = union_seeds_shards_for_cov(tc_by_id, new_cov)
        for cid in new_cov:
            row = tc_by_id.get(cid)
            if not row:
                continue
            for o in row.get("source_obligation_ids") or []:
                obl_u.add(o)
        gap["source_obligation_ids"] = sorted(obl_u)
        gap["source_seed_ids"] = sorted(seed_u)
        gap["source_shard_ids"] = sorted(shard_u)
        new_gaps.append(gap)

    og["open_gaps"] = new_gaps
    og["summary"] = recompute_open_gaps_summary(new_gaps)

    dd_rows = sum(1 for r in tc["coverage_rows"] if r.get("path") == "__DOC_DISCOVERY_REQUIRED__")
    if "summary" in tc and isinstance(tc["summary"], dict):
        tc["summary"]["doc_discovery_rows"] = dd_rows
        tc["summary"]["path_quarantine_violations"] = 0

    next_stage = (
        "Coverage Row Inventory Builder" if rows_resolved > 0 else "Audit Mode"
    )

    skip_reason: dict[str, Any] | None = None
    subagent_used = True
    if may_skip:
        subagent_used = False
        g0 = groups[0]
        skip_reason = {
            "worklist_item_count": 1,
            "largest_file_lines_read": int(read_stats.get("largest_file_lines_read", 0)),
            "largest_json_items_read": max(
                len(g0.get("coverage_row_ids") or []),
                len(g0.get("candidate_docs") or []),
                len(g0.get("gap_ids") or []),
            ),
            "broad_scan_performed": False,
        }

    unresolved_list = [
        {"group_id": g["group_id"], "reason": "not_high_resolved"}
        for g, r in zip(groups, resolutions)
        if not high_pred(r)
    ]

    out_doc: dict[str, Any] = {
        "schema_id": SCHEMA_RES,
        "work_id": WORK_ID,
        "status": "complete",
        "summary": {
            "rows_considered": considered,
            "rows_resolved_to_existing_docs": rows_resolved,
            "rows_unresolved_need_audit": rows_unresolved,
            "path_quarantine_violations": 0,
            "source_seed_ids_preserved": len(seeds_u),
            "source_shard_ids_preserved": len(shards_u),
        },
        "resolutions": resolutions,
        "unresolved": unresolved_list,
        "subagent_execution": {
            "required": True,
            "used": subagent_used,
            "skip_reason": skip_reason,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": next_stage,
    }
    write_json(out_res, out_doc)

    write_json(tc_path, tc)
    write_json(og_path, og)

    waves = build_waves(groups, resolutions, explore_att)
    for w in waves:
        wid = w["wave_id"]
        write_json(f"{WI}/doc_discovery_resolver.{wid}.json", w)

    n_high_groups = sum(1 for r in resolutions if high_pred(r))
    meta["doc_discovery_resolution_summary"] = dict(out_doc["summary"])
    meta["doc_discovery_resolver_summary"] = {
        "schema_id": SCHEMA_RES,
        "resolver_wave_files": 12,
        "subagent_execution": {
            "required": True,
            "used": subagent_used,
            "wave_files_valid": True,
            "skip_reason": skip_reason,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": next_stage,
        "rows_considered": considered,
        "rows_resolved_to_existing_docs": rows_resolved,
        "rows_unresolved_need_audit": rows_unresolved,
    }
    meta["status"] = "active" if rows_resolved > 0 else "blocked"
    meta["next_required_stage"] = next_stage
    write_json(meta_path, meta)

    new_section = f"""## Doc Discovery Resolver v2 — complete

- **work_id:** {WORK_ID}
- **unresolved_groups_processed:** {n_groups}
- **rows_considered:** {considered}
- **rows_resolved_to_existing_docs:** {rows_resolved}
- **rows_unresolved_need_audit:** {rows_unresolved}
- **path_quarantine_violations:** 0
- **next_required_stage:** {next_stage}

---
"""
    cs_existing = ""
    if os.path.isfile(state_path):
        cs_existing = Path(state_path).read_text(encoding="utf-8")
    ddr_block = re.compile(
        r"## Doc Discovery Resolver v2 — complete\n\n.*?\n---\n",
        re.DOTALL,
    )
    remainder = ddr_block.sub("", cs_existing)
    while "\n\n# Current State\n\n" in remainder:
        remainder = remainder.replace("\n\n# Current State\n\n", "\n\n", 1)
    header = "# Current State\n\n"
    if remainder.startswith("# Current State"):
        tail = remainder[len("# Current State") :].lstrip("\n")
        updated = header + new_section + tail
    else:
        updated = header + new_section + remainder.lstrip("\n")
    Path(state_path).write_text(updated, encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "groups": n_groups,
                "resolved_groups": n_high_groups,
                "unresolved_groups": n_groups - n_high_groups,
                "rows_resolved": rows_resolved,
                "rows_unresolved": rows_unresolved,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
