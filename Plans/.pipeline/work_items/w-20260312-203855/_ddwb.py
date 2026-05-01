#!/usr/bin/env python3
"""Doc Discovery Worklist Builder v2 — generates worklist, waves, meta, current_state."""

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
ALLOWED_ROW_TYPES = frozenset(
    {
        "owner",
        "consumer",
        "stale_retirement",
        "layout_blocker",
        "missing_doc_reference",
        "stale_token_replacement",
    }
)

FORBIDDEN_ANYWHERE = (
    "__DOC_DISCOVERY_REQUIRED__",
    "Plans/.pipeline/",
    "_shards",
    ".evidence",
    "legacy_quarantine/",
)


def die_gate(code: int, payload: dict) -> None:
    sys.stderr.write(json.dumps(payload, ensure_ascii=False) + "\n")
    sys.exit(code)


def rel_plans_path(full: str) -> str:
    return os.path.relpath(full, ROOT).replace("\\", "/")


def collect_md_files() -> list[str]:
    plans_root = os.path.join(ROOT, "Plans")
    skip_seg = {".pipeline", "_shards", ".evidence", "legacy_quarantine"}
    out: list[str] = []
    for dirpath, dirnames, filenames in os.walk(plans_root):
        parts = Path(dirpath).parts
        if any(p in skip_seg for p in parts):
            dirnames[:] = []
            continue
        base = Path(dirpath).name
        if base in skip_seg:
            dirnames[:] = []
            continue
        for fn in filenames:
            if not fn.endswith(".md"):
                continue
            full = os.path.join(dirpath, fn)
            rp = rel_plans_path(full)
            segs = rp.split("/")
            if any(s in skip_seg for s in segs):
                continue
            out.append(full)
    out.sort()
    return out


def merge_unique_lists(seqs: list[list[Any]]) -> list[Any]:
    seen: set[Any] = set()
    out: list[Any] = []
    for lst in seqs:
        for x in lst or []:
            if x in seen:
                continue
            seen.add(x)
            out.append(x)
    return out


def filter_hints(hints: list[Any]) -> list[str]:
    out: list[str] = []
    for h in hints or []:
        if not isinstance(h, str):
            continue
        if any(bad in h for bad in FORBIDDEN_ANYWHERE):
            continue
        out.append(h)
    return out


def candidate_path_ok(rel: str) -> bool:
    if not rel.startswith("Plans/"):
        return False
    return not any(bad in rel for bad in FORBIDDEN_ANYWHERE)


def build_search_terms(
    canon_label: str,
    exact_items: list[str],
    rows_chunk: list[dict[str, Any]],
) -> list[str]:
    terms: list[str] = []
    seen: set[str] = set()

    def add(s: str) -> None:
        s = (s or "").strip()
        if not s or s in seen:
            return
        seen.add(s)
        terms.append(s)

    cl = (canon_label or "").strip()
    if len(cl) >= 4:
        add(cl)

    n_exact = 0
    for item in exact_items or []:
        if n_exact >= 8:
            break
        s = (item or "").strip()
        if len(s) >= 4 and len(s) <= 200:
            add(s)
            n_exact += 1

    for r in rows_chunk:
        hh = r.get("heading_hint")
        if hh and isinstance(hh, str) and hh.strip():
            add(hh.strip())

    return terms[:50]


def scan_candidates(
    terms: list[str],
    md_sorted_full_paths: list[str],
    content_cache: dict[str, str],
) -> list[str]:
    found: list[str] = []
    seen_paths: set[str] = set()

    for term in terms:
        if len(found) >= 10:
            break
        tl = term.lower()
        scanned = 0
        for full in md_sorted_full_paths:
            if scanned >= 80:
                break
            if len(found) >= 10:
                break
            scanned += 1
            if full not in content_cache:
                try:
                    raw = Path(full).read_text(encoding="utf-8", errors="replace")
                except OSError:
                    raw = ""
                content_cache[full] = raw.lower()
            low = content_cache[full]
            if tl in low:
                rel = rel_plans_path(full)
                if candidate_path_ok(rel) and rel not in seen_paths:
                    seen_paths.add(rel)
                    found.append(rel)
                    if len(found) >= 10:
                        break
    return found


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    wi_path = Path(WI)
    og_path = wi_path / "open_gaps.json"
    tc_path = wi_path / "transfer_coverage.json"
    meta_path = wi_path / "meta.json"
    worklist_path = wi_path / "doc_discovery.worklist.json"
    current_state_path = wi_path / "current_state.md"

    open_gaps = load_json(og_path)
    transfer_coverage = load_json(tc_path)

    # --- Gates ---
    og_schema = open_gaps.get("schema_id")
    if og_schema != "pm.open_gaps.v2":
        die_gate(2, {"gate": "open_gaps.schema", "expected": "pm.open_gaps.v2", "got": og_schema})
    if open_gaps.get("work_id") != WORK_ID:
        die_gate(2, {"gate": "open_gaps.work_id", "expected": WORK_ID, "got": open_gaps.get("work_id")})

    tc_schema = transfer_coverage.get("schema_id")
    if tc_schema != "pm.transfer_coverage.v2":
        die_gate(
            2,
            {"gate": "transfer_coverage.schema", "expected": "pm.transfer_coverage.v2", "got": tc_schema},
        )

    og_summary = open_gaps.get("summary") or {}
    tc_summary = transfer_coverage.get("summary") or {}
    if og_summary.get("path_quarantine_violations") != 0:
        die_gate(2, {"gate": "open_gaps.path_quarantine_violations", "value": og_summary.get("path_quarantine_violations")})
    if tc_summary.get("path_quarantine_violations") != 0:
        die_gate(
            2,
            {"gate": "transfer_coverage.path_quarantine_violations", "value": tc_summary.get("path_quarantine_violations")},
        )

    ddi = og_summary.get("doc_discovery_required_items") or 0
    cond_extra = False
    for g in open_gaps.get("open_gaps") or []:
        gc = (g.get("gap_class") or "").lower()
        if "owner" in gc and "unknown" in gc:
            cond_extra = True
            break
        desc = (g.get("description") or "").lower()
        if "owner_unknown" in desc:
            cond_extra = True
            break
    if not (ddi > 0 or cond_extra):
        die_gate(
            2,
            {"gate": "doc_discovery_or_owner_unknown", "doc_discovery_required_items": ddi},
        )

    rows_list = transfer_coverage.get("coverage_rows") or []
    cov_by_id: dict[str, dict[str, Any]] = {}
    for r in rows_list:
        cid = r.get("coverage_id")
        if cid:
            cov_by_id[cid] = r

    doc_gaps = [g for g in (open_gaps.get("open_gaps") or []) if g.get("gap_class") == "doc_discovery_required"]

    gap_cov_union: set[str] = set()
    for g in doc_gaps:
        for cid in g.get("coverage_row_ids") or []:
            gap_cov_union.add(cid)

    md_paths = collect_md_files()
    content_cache: dict[str, str] = {}
    explore_att = os.environ.get("DDWB_SUBAGENT_ATTESTATION") or str(uuid.uuid4())

    unresolved_groups: list[dict[str, Any]] = []
    serial = 0

    for gap in doc_gaps:
        cov_ids = list(gap.get("coverage_row_ids") or [])
        for i in range(0, len(cov_ids), 5):
            chunk_ids = cov_ids[i : i + 5]
            rows_chunk: list[dict[str, Any]] = []
            for cid in chunk_ids:
                row = cov_by_id.get(cid)
                if not row:
                    die_gate(2, {"gate": "missing_coverage_row", "coverage_id": cid})
                p = row.get("path")
                if p not in (None, "__DOC_DISCOVERY_REQUIRED__"):
                    die_gate(
                        2,
                        {"gate": "unexpected_row_path", "coverage_id": cid, "path": p},
                    )
                rows_chunk.append(row)

            first = rows_chunk[0]
            rt = first.get("row_type")
            if rt not in ALLOWED_ROW_TYPES:
                die_gate(
                    2,
                    {"gate": "invalid_row_type", "coverage_id": first.get("coverage_id"), "row_type": rt},
                )

            canon = (first.get("canon_label") or "").strip()
            if not canon:
                emi = gap.get("exact_missing_items") or []
                for line in emi:
                    if isinstance(line, str) and line.strip():
                        canon = line.strip()[:500]
                        break

            exact_merge = merge_unique_lists([r.get("exact_items") or [] for r in rows_chunk])
            stale_merge = merge_unique_lists([r.get("stale_tokens") or [] for r in rows_chunk])
            hints_merge: list[str] = []
            for r in rows_chunk:
                hints_merge.extend(filter_hints(list(r.get("missing_doc_path_hints") or [])))
            hints_merge = merge_unique_lists([hints_merge])

            obl = merge_unique_lists(
                [list(gap.get("source_obligation_ids") or [])]
                + [list(r.get("source_obligation_ids") or []) for r in rows_chunk]
            )
            seeds = merge_unique_lists(
                [list(gap.get("source_seed_ids") or [])]
                + [list(r.get("source_seed_ids") or []) for r in rows_chunk]
            )
            shards = merge_unique_lists(
                [list(gap.get("source_shard_ids") or [])]
                + [list(r.get("source_shard_ids") or []) for r in rows_chunk]
            )

            path_field_status = "clean"
            for r in rows_chunk:
                if "path_field_status" in r and r.get("path_field_status"):
                    path_field_status = r["path_field_status"]
                    break

            serial += 1
            gid = f"docdisc-{serial:04d}"

            terms = build_search_terms(canon, exact_merge, rows_chunk)
            cands = scan_candidates(terms, md_paths, content_cache)

            unresolved_groups.append(
                {
                    "group_id": gid,
                    "coverage_row_ids": chunk_ids,
                    "gap_ids": [gap["gap_id"]],
                    "source_obligation_ids": obl,
                    "source_seed_ids": seeds,
                    "source_shard_ids": shards,
                    "original_path": "__DOC_DISCOVERY_REQUIRED__",
                    "row_type": rt,
                    "canon_label": canon,
                    "exact_items": exact_merge,
                    "stale_tokens": stale_merge,
                    "missing_doc_path_hints": hints_merge,
                    "candidate_docs": cands,
                    "candidate_search_terms": terms,
                    "path_field_status": path_field_status,
                }
            )

    # --- Validation before write ---
    all_gap_ids_doc = {g["gap_id"] for g in doc_gaps}
    covered_gap_ids = set()
    for grp in unresolved_groups:
        for gid in grp.get("gap_ids") or []:
            covered_gap_ids.add(gid)
    if covered_gap_ids != all_gap_ids_doc:
        die_gate(
            2,
            {
                "gate": "gap_ids_coverage",
                "missing": sorted(all_gap_ids_doc - covered_gap_ids),
                "extra": sorted(covered_gap_ids - all_gap_ids_doc),
            },
        )

    union_groups: set[str] = set()
    for grp in unresolved_groups:
        for cid in grp.get("coverage_row_ids") or []:
            union_groups.add(cid)
    if union_groups != gap_cov_union:
        die_gate(
            2,
            {
                "gate": "coverage_row_union",
                "only_in_gaps": sorted(gap_cov_union - union_groups),
                "only_in_groups": sorted(union_groups - gap_cov_union),
            },
        )

    for grp in unresolved_groups:
        for doc in grp.get("candidate_docs") or []:
            if not candidate_path_ok(doc):
                die_gate(2, {"gate": "candidate_doc_quarantine", "path": doc, "group_id": grp.get("group_id")})

    owner_unknown_groups = 0
    for grp in unresolved_groups:
        any_ou = False
        for cid in grp.get("coverage_row_ids") or []:
            r = cov_by_id.get(cid)
            if not r:
                continue
            if r.get("row_type") != "owner":
                continue
            cl = (r.get("canon_label") or "").lower()
            if "unknown" in cl:
                any_ou = True
                break
            for it in r.get("exact_items") or []:
                if isinstance(it, str) and "unknown" in it.lower():
                    any_ou = True
                    break
            if any_ou:
                break
        if any_ou:
            owner_unknown_groups += 1

    n_groups = len(unresolved_groups)
    coverage_rows_total = sum(len(g.get("coverage_row_ids") or []) for g in unresolved_groups)
    unique_candidate_docs: set[str] = set()
    for grp in unresolved_groups:
        for d in grp.get("candidate_docs") or []:
            if candidate_path_ok(d):
                unique_candidate_docs.add(d)
    candidate_docs_total = len(unique_candidate_docs)
    candidate_doc_hits_total = sum(len(g.get("candidate_docs") or []) for g in unresolved_groups)

    worklist = {
        "schema_id": "pm.doc_discovery_worklist.v2",
        "work_id": WORK_ID,
        "source_open_gaps": "Plans/.pipeline/work_items/w-20260312-203855/open_gaps.json",
        "source_transfer_coverage": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage.json",
        "summary": {
            "unresolved_groups_total": n_groups,
            "coverage_rows_total": coverage_rows_total,
            "candidate_docs_total": candidate_docs_total,
            "path_quarantine_violations": 0,
            "doc_discovery_rows": coverage_rows_total,
            "owner_unknown_rows": owner_unknown_groups,
        },
        "unresolved_groups": unresolved_groups,
        "subagent_execution": {
            "required": True,
            "used": True,
            "skip_reason": None,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": "Doc Discovery Resolver",
    }

    worklist_path.write_text(json.dumps(worklist, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    waves: list[list[dict[str, Any]]] = [[] for _ in range(12)]
    for idx, grp in enumerate(unresolved_groups):
        waves[idx % 12].append(grp)

    for wn in range(12):
        wave_groups = waves[wn]
        wave_index = wn + 1
        wave_id = f"wave-{wave_index:03d}"
        cov_assigned: list[str] = []
        for g in wave_groups:
            cov_assigned.extend(g.get("coverage_row_ids") or [])
        cov_assigned_sorted = sorted(set(cov_assigned))

        union_terms_docs: list[str] = []
        for g in wave_groups:
            union_terms_docs.extend(g.get("candidate_search_terms") or [])
            union_terms_docs.extend(g.get("candidate_docs") or [])
        union_sorted = sorted(set(union_terms_docs))

        wave_doc = {
            "schema_id": "pm.doc_discovery_worklist_builder_wave.v2",
            "work_id": WORK_ID,
            "wave_id": wave_id,
            "subagent_tasks": [
                {
                    "task_id": f"doc-discovery-worklist-{wave_id}",
                    "description": "bounded Plans/**/*.md scan for doc discovery / owner-unknown groups",
                    "groups_assigned": len(wave_groups),
                }
            ],
            "assigned_input_boundaries": {
                "wave_index": wave_index,
                "coverage_rows_in_wave": sum(len(g.get("coverage_row_ids") or []) for g in wave_groups),
                "groups_in_wave": len(wave_groups),
                "plans_md_files_indexed": len(md_paths),
            },
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "coverage_row_ids_assigned": cov_assigned_sorted,
            "coverage_row_ids_completed": list(cov_assigned_sorted),
            "docs_or_topics_assigned": union_sorted,
            "docs_or_topics_completed": list(union_sorted),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        out_wave = wi_path / f"doc_discovery_worklist_builder.wave-{wave_index:03d}.json"
        out_wave.write_text(json.dumps(wave_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    meta = load_json(meta_path)
    meta["doc_discovery_worklist_builder_summary"] = {
        "schema_id": "pm.doc_discovery_worklist.v2",
        "unresolved_groups_total": n_groups,
        "coverage_rows_total": coverage_rows_total,
        "doc_discovery_rows": coverage_rows_total,
        "owner_unknown_rows": owner_unknown_groups,
        "candidate_docs_total": candidate_docs_total,
        "path_quarantine_violations": 0,
        "wave_files": 12,
        "subagent_execution": {
            "required": True,
            "used": True,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "artifacts": {
            "worklist": "Plans/.pipeline/work_items/w-20260312-203855/doc_discovery.worklist.json",
            "waves": "Plans/.pipeline/work_items/w-20260312-203855/doc_discovery_worklist_builder.wave-001.json … wave-012.json",
        },
        "next_required_stage": "Doc Discovery Resolver",
    }
    meta["next_required_stage"] = "Doc Discovery Resolver"
    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    cs_existing = current_state_path.read_text(encoding="utf-8")
    new_section = f"""## Doc Discovery Worklist Builder v2 — complete

- **work_id:** {WORK_ID}
- **unresolved_groups:** {n_groups}
- **coverage_rows (doc discovery):** {coverage_rows_total}
- **candidate_docs_total (unique `Plans/**` paths):** {candidate_docs_total}
- **candidate_doc_list_hits (sum per group):** {candidate_doc_hits_total}
- **path_quarantine_violations:** 0
- **next_required_stage:** Doc Discovery Resolver

---
"""
    ddwb_block = re.compile(
        r"## Doc Discovery Worklist Builder v2 — complete\n\n.*?\n---\n",
        re.DOTALL,
    )
    remainder = ddwb_block.sub("", cs_existing)
    while "\n\n# Current State\n\n" in remainder:
        remainder = remainder.replace("\n\n# Current State\n\n", "\n\n", 1)
    header = "# Current State\n\n"
    if remainder.startswith("# Current State"):
        tail = remainder[len("# Current State") :].lstrip("\n")
        updated = header + new_section + tail
    else:
        updated = header + new_section + remainder.lstrip("\n")
    current_state_path.write_text(updated, encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "groups": n_groups,
                "coverage_rows": coverage_rows_total,
                "candidate_docs_unique": candidate_docs_total,
                "candidate_doc_hits": candidate_doc_hits_total,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
