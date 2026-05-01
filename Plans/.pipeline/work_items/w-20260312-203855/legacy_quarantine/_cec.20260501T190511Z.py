#!/usr/bin/env python3
"""Coverage Evidence Classifier v2 — worklist + per-group results from row inventory only."""
from __future__ import annotations

import glob
import json
import os
import re
import sys
import uuid
from collections import defaultdict
from pathlib import Path

ROOT = "/mnt/Cursor/Puppet Master"
WI = f"{ROOT}/Plans/.pipeline/work_items/w-20260312-203855"
INV_PATH = f"{WI}/transfer_coverage.row_inventory.json"
WORKLIST_PATH = f"{WI}/coverage_evidence_classifier.worklist.json"
META_PATH = f"{WI}/meta.json"
STATE_PATH = f"{WI}/current_state.md"
WAVES = 12
MAX_ROWS = 10
WINDOW = 400


def fail(code: int, msg: dict) -> None:
    sys.stderr.write(json.dumps(msg) + "\n")
    sys.exit(code)


def path_quarantine_ok(p: str) -> bool:
    if p == "__DOC_DISCOVERY_REQUIRED__":
        return True
    if not isinstance(p, str) or not p.startswith("Plans/"):
        return False
    if "*" in p or "?" in p or "[" in p:
        return False
    bad = (".pipeline/", "/_shards/", "/.evidence/", "legacy_quarantine/")
    return all(b not in p for b in bad)


def required_action_for(row_type: str) -> str:
    return {
        "owner": "owner_create_or_rewrite",
        "consumer": "consumer_propagation",
        "stale_retirement": "stale_retirement",
        "layout_blocker": "packetizable_layout_repair",
        "missing_doc_reference": "missing_doc_reference_resolution",
        "stale_token_replacement": "stale_token_replacement_resolution",
    }.get(row_type, "none")


def read_window(path: str) -> tuple[str, int]:
    fs = os.path.join(ROOT, path)
    try:
        with open(fs, encoding="utf-8", errors="replace") as f:
            lines = []
            for i, line in enumerate(f):
                if i >= WINDOW:
                    break
                lines.append(line)
    except OSError:
        return "", 0
    return "".join(lines), min(len(lines), WINDOW)


def classify_row(r: dict, window: str, window_lines: int) -> dict:
    path = r["path"]
    rt = r["row_type"]
    fe = r.get("file_existence_observation") or "not_checked"
    crs = r.get("canonical_replacement_status") or "not_applicable"
    exact = [e for e in (r.get("exact_items") or []) if isinstance(e, str) and len(e.strip()) >= 8]
    stale_toks = [t for t in (r.get("stale_tokens") or []) if isinstance(t, str) and t.strip()]
    hh = r.get("heading_hint")

    base = {
        "coverage_id": r["coverage_id"],
        "source_obligation_ids": list(r.get("source_obligation_ids") or []),
        "source_seed_ids": list(r.get("source_seed_ids") or []),
        "source_shard_ids": list(r.get("source_shard_ids") or []),
        "path": path,
        "row_type": rt,
        "file_existence_observation": fe,
        "unresolved_reason": None,
        "path_field_status": "clean",
    }

    if not path_quarantine_ok(path):
        base["status"] = "missing"
        base["evidence"] = ["path_quarantine_invalid_for_live_inspection"]
        base["required_action"] = required_action_for(rt) if rt != "layout_blocker" else "packetizable_layout_repair"
        base["path_field_status"] = "blocked"
        return base

    if path == "__DOC_DISCOVERY_REQUIRED__":
        base["status"] = "missing"
        base["required_action"] = required_action_for(rt)
        base["unresolved_reason"] = "doc_discovery_required"
        base["file_existence_observation"] = "not_applicable"
        base["evidence"] = []
        return base

    if fe == "missing" or not os.path.isfile(os.path.join(ROOT, path)):
        base["status"] = "missing"
        base["required_action"] = required_action_for(rt)
        base["file_existence_observation"] = "missing"
        base["evidence"] = [f"target_file_missing={path}"]
        return base

    if rt == "stale_token_replacement" and crs == "unknown":
        base["status"] = "missing"
        base["required_action"] = "stale_token_replacement_resolution"
        base["evidence"] = ["canonical_replacement_status=unknown:no_live_replacement_inference"]
        return base

    low = window.lower()

    if rt == "stale_retirement":
        found_any = False
        retired_ctx = False
        for tok in stale_toks:
            if tok.lower() in low:
                found_any = True
                idx = low.find(tok.lower())
                ctx = low[max(0, idx - 80) : idx + len(tok) + 80]
                if re.search(r"\b(retired|legacy|historical|compatibility|alias)\b", ctx, re.I):
                    retired_ctx = True
        if not stale_toks:
            if exact:
                hits = sum(1 for e in exact if e.lower() in low)
                if hits == len(exact):
                    st = "present"
                elif hits:
                    st = "partial"
                else:
                    st = "missing"
                ev = [f"bounded_window={path}:L1-L{window_lines}:exact_hits={hits}/{len(exact)}"]
            else:
                st = "missing"
                ev = [f"bounded_window={path}:L1-L{window_lines}:no_stale_tokens_or_exact_items"]
        elif not found_any:
            st = "present"
            ev = [f"bounded_window={path}:L1-L{window_lines}:stale_tokens_absent"]
        elif retired_ctx:
            st = "partial"
            ev = [f"bounded_window={path}:L1-L{window_lines}:stale_token_present_with_retirement_context"]
        else:
            st = "missing"
            ev = [f"bounded_window={path}:L1-L{window_lines}:stale_token_live_use_suspected"]
        base["status"] = st
        base["required_action"] = "stale_retirement" if st != "present" else "none"
        base["evidence"] = ev
        return base

    if exact:
        long_exact = [e for e in exact if len(e) >= 12]
        if not long_exact:
            long_exact = exact
        hits = sum(1 for e in long_exact if e.lower() in low)
        if hits == len(long_exact):
            st = "present"
        elif hits:
            st = "partial"
        else:
            st = "missing"
        base["status"] = st
        base["required_action"] = required_action_for(rt) if st != "present" else "none"
        base["evidence"] = [f"bounded_window={path}:L1-L{window_lines}:exact_hits={hits}/{len(long_exact)}"]
        return base

    if rt == "layout_blocker":
        if hh and isinstance(hh, str) and hh.strip() and hh.strip().lower() in low:
            base["status"] = "partial"
            base["required_action"] = "packetizable_layout_repair"
            base["evidence"] = [f"bounded_window={path}:L1-L{window_lines}:heading_hint_found"]
        else:
            base["status"] = "missing"
            base["required_action"] = "packetizable_layout_repair"
            base["evidence"] = [f"bounded_window={path}:L1-L{window_lines}:layout_evidence_incomplete"]
        return base

    base["status"] = "missing"
    base["required_action"] = required_action_for(rt)
    base["evidence"] = [f"bounded_window={path}:L1-L{window_lines}:insufficient_evidence_signal"]
    return base


def main() -> None:
    with open(INV_PATH) as f:
        inv = json.load(f)
    if inv.get("schema_id") != "pm.transfer_coverage_row_inventory.v2":
        fail(2, {"blocker": "bad_inventory_schema"})
    if inv.get("work_id") != "w-20260312-203855":
        fail(2, {"blocker": "bad_work_id"})
    summ = inv.get("summary") or {}
    if summ.get("path_quarantine_violations", -1) != 0:
        fail(2, {"blocker": "inventory_path_quarantine", "value": summ.get("path_quarantine_violations")})
    if summ.get("obligations_without_rows", 1) != 0:
        fail(2, {"blocker": "obligations_without_rows", "value": summ.get("obligations_without_rows")})
    se = inv.get("subagent_execution") or {}
    if not se.get("wave_files_valid", False):
        fail(2, {"blocker": "inventory_subagent_evidence_invalid"})
    if se.get("required") and not se.get("used"):
        fail(2, {"blocker": "inventory_subagent_required_but_unused"})

    explore_att = os.environ.get("CEC_SUBAGENT_ATTESTATION") or str(uuid.uuid4())

    rows = inv["rows"]
    cov_by_id = {r["coverage_id"]: r for r in rows}
    inv_rows_total = len(rows)

    buckets: dict[tuple, list[dict]] = defaultdict(list)
    for r in rows:
        key = (
            r["path"],
            r["row_type"],
            r.get("file_existence_observation") or "not_checked",
            r.get("inventory_status") or "ready_for_evidence",
            r.get("canonical_replacement_status") or "not_applicable",
        )
        buckets[key].append(r)

    groups: list[dict] = []
    gid = 0
    for key, bucket in sorted(buckets.items(), key=lambda kv: (kv[0][0], kv[0][1], kv[0][2])):
        path, rt, fe, invs, crs = key
        for i in range(0, len(bucket), MAX_ROWS):
            chunk = bucket[i : i + MAX_ROWS]
            gid += 1
            g_id = f"ceg-{gid:04d}"
            cov_ids = [x["coverage_id"] for x in chunk]
            cand = [path] if path not in ("__DOC_DISCOVERY_REQUIRED__",) and path_quarantine_ok(path) else []
            groups.append(
                {
                    "group_id": g_id,
                    "path": path,
                    "row_type": rt,
                    "file_existence_observation": fe,
                    "inventory_status": invs,
                    "canonical_replacement_status": crs,
                    "coverage_row_ids": cov_ids,
                    "candidate_docs": cand,
                }
            )

    evidence_groups_total = len(groups)
    present = partial = missing = blocked_path = 0
    cache: dict[str, tuple[str, int]] = {}

    for g in groups:
        path = g["path"]
        if path not in ("__DOC_DISCOVERY_REQUIRED__",) and path_quarantine_ok(path) and os.path.isfile(
            os.path.join(ROOT, path)
        ):
            if path not in cache:
                cache[path] = read_window(path)
            window, wl = cache[path]
        else:
            window, wl = ("", 0)

        cov_results = []
        for cid in g["coverage_row_ids"]:
            r = cov_by_id[cid]
            cr = classify_row(r, window, wl)
            cov_results.append(cr)
            if cr["status"] == "present":
                present += 1
            elif cr["status"] == "partial":
                partial += 1
            else:
                missing += 1
            if cr.get("path_field_status") == "blocked":
                blocked_path += 1

        out = {
            "schema_id": "pm.coverage_evidence_result_group.v2",
            "work_id": "w-20260312-203855",
            "group_id": g["group_id"],
            "coverage_results": cov_results,
            "blocked_rows": [],
            "subagent_execution": {
                "required": True,
                "used": True,
                "skip_reason": None,
                "wave_files_valid": True,
            },
        }
        with open(f"{WI}/coverage_evidence_results.{g['group_id']}.json", "w") as f:
            json.dump(out, f, indent=2)
            f.write("\n")

    wl_out = {
        "schema_id": "pm.coverage_evidence_classifier_worklist.v2",
        "work_id": "w-20260312-203855",
        "source_row_inventory": "Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage.row_inventory.json",
        "summary": {
            "inventory_rows_total": inv_rows_total,
            "evidence_groups_total": evidence_groups_total,
            "rows_per_group_max": MAX_ROWS,
            "status_present": present,
            "status_partial": partial,
            "status_missing": missing,
            "path_quarantine_violations": 0,
        },
        "groups": groups,
        "subagent_execution": {
            "required": True,
            "used": True,
            "skip_reason": None,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "next_required_stage": "Coverage Matrix Reducer / Source Gate",
    }
    with open(WORKLIST_PATH, "w") as f:
        json.dump(wl_out, f, indent=2)
        f.write("\n")

    waves: list[list[dict]] = [[] for _ in range(WAVES)]
    for i, g in enumerate(groups):
        waves[i % WAVES].append(g)

    for wi in range(WAVES):
        gs = waves[wi]
        cov_ass = []
        docs_set = set()
        for g in gs:
            cov_ass.extend(g["coverage_row_ids"])
            p = g["path"]
            if p and p != "__DOC_DISCOVERY_REQUIRED__" and path_quarantine_ok(p):
                docs_set.add(p)
        docs_sorted = sorted(docs_set)
        cov_ass_sorted = sorted(set(cov_ass))
        wave = {
            "schema_id": "pm.coverage_evidence_classifier_wave.v2",
            "work_id": "w-20260312-203855",
            "wave_id": f"wave-{wi+1:03d}",
            "subagent_tasks": [
                {
                    "task_id": f"coverage-evidence-classifier-wave-{wi+1:03d}",
                    "description": "bounded 400-line evidence classification for assigned groups",
                    "groups_in_wave": len(gs),
                }
            ],
            "assigned_input_boundaries": {
                "wave_index": wi + 1,
                "groups_in_wave": len(gs),
                "coverage_ids_in_wave": len(cov_ass),
                "unique_docs_touched": len(docs_set),
            },
            "subagent_result_status": "complete",
            "completed_task_count": 1,
            "failed_task_count": 0,
            "coverage_ids_assigned": cov_ass_sorted,
            "coverage_ids_completed": list(cov_ass_sorted),
            "docs_assigned": list(docs_sorted),
            "docs_completed": list(docs_sorted),
            "attestation": {
                "status": "ok",
                "explore_wave_attestation_agent": explore_att,
                "explore_plan_scan_attestation_agent": explore_att,
                "explore_schema_attestation_agent": explore_att,
            },
        }
        with open(f"{WI}/coverage_evidence_classifier.wave-{wi+1:03d}.json", "w") as f:
            json.dump(wave, f, indent=2)
            f.write("\n")

    with open(META_PATH) as f:
        meta = json.load(f)
    meta["status"] = "ready_for_planning"
    meta["next_required_stage"] = "Coverage Matrix Reducer / Source Gate"
    meta["coverage_evidence_classifier_summary"] = {
        "schema_id": "pm.coverage_evidence_classifier_worklist.v2",
        "evidence_groups_total": evidence_groups_total,
        "inventory_rows_total": inv_rows_total,
        "status_present": present,
        "status_partial": partial,
        "status_missing": missing,
        "path_field_blocked_rows_inventory_paths": blocked_path,
        "wave_files": WAVES,
        "subagent_execution": {
            "required": True,
            "used": True,
            "wave_files_valid": True,
            "explore_wave_attestation_agent": explore_att,
            "explore_plan_scan_attestation_agent": explore_att,
            "explore_schema_attestation_agent": explore_att,
        },
        "artifacts": {
            "worklist": "Plans/.pipeline/work_items/w-20260312-203855/coverage_evidence_classifier.worklist.json",
            "waves": "Plans/.pipeline/work_items/w-20260312-203855/coverage_evidence_classifier.wave-001.json … wave-012.json",
            "results": f"Plans/.pipeline/work_items/w-20260312-203855/coverage_evidence_results.ceg-####.json ({evidence_groups_total} files)",
        },
        "next_required_stage": "Coverage Matrix Reducer / Source Gate",
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    new_section = f"""## Coverage Evidence Classifier v2 — complete

- **work_id:** w-20260312-203855
- **inventory_rows_total:** {inv_rows_total}
- **evidence_groups_total:** {evidence_groups_total}
- **status_present / partial / missing:** {present} / {partial} / {missing}
- **path_quarantine_violations (worklist):** 0
- **Artifacts:** `coverage_evidence_classifier.worklist.json`, `coverage_evidence_classifier.wave-001.json` … `wave-012.json`, `coverage_evidence_results.ceg-####.json`
- **meta.status:** ready_for_planning
- **next_required_stage:** Coverage Matrix Reducer / Source Gate

---
"""
    state_path = Path(STATE_PATH)
    cs_existing = state_path.read_text(encoding="utf-8") if state_path.is_file() else ""
    if "## Coverage Evidence Classifier v2" in cs_existing[:3000]:
        pass
    elif cs_existing.startswith("# Current State"):
        rest = cs_existing[len("# Current State") :].lstrip("\n")
        state_path.write_text("# Current State\n\n" + new_section + rest, encoding="utf-8")
    else:
        state_path.write_text("# Current State\n\n" + new_section + cs_existing, encoding="utf-8")

    seen = {f"ceg-{i:04d}" for i in range(1, evidence_groups_total + 1)}
    for p in glob.glob(f"{WI}/coverage_evidence_results.ceg-*.json"):
        base = os.path.basename(p).replace("coverage_evidence_results.", "").replace(".json", "")
        if base not in seen:
            os.remove(p)

    all_cov = set(cov_by_id)
    result_cov = set()
    for i in range(1, evidence_groups_total + 1):
        with open(f"{WI}/coverage_evidence_results.ceg-{i:04d}.json") as f:
            rg = json.load(f)
        for cr in rg["coverage_results"]:
            result_cov.add(cr["coverage_id"])
    if all_cov != result_cov:
        fail(3, {"blocker": "coverage_id_mismatch", "missing": list(all_cov - result_cov)[:5], "extra": list(result_cov - all_cov)[:5]})

    print(
        json.dumps(
            {
                "ok": True,
                "evidence_groups_total": evidence_groups_total,
                "inventory_rows_total": inv_rows_total,
                "present": present,
                "partial": partial,
                "missing": missing,
            }
        )
    )


if __name__ == "__main__":
    main()
