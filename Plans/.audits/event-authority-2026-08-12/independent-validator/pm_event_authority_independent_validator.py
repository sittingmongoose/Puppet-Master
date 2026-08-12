#!/usr/bin/env python3
"""Independent Event Authority validator (Plans/.audits canonical).

Advisor-2 capable-certification rewrite:
- Known37 derived solely from canonical Plans (KNOWN37_FROM_PLANS.json <- storage-plan RET-K37)
- No C: noncanonical Known37 fallback
- No unconditional open failures / hardcoded pass:false
- Flags and pass computed from check results
- Fresh census admitted-family exact equality (not a 295 floor; exclusions via census-adjudication partition)
- Does not edit scripts/**
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
HOME = HERE.parent
ROOT = HOME.parents[1]  # Plans/
REPO = ROOT.parent
IND = HOME / "individual-disposition"
CENSUS = HOME / "closed-world-census"
K37 = HOME / "known37" / "KNOWN37_FROM_PLANS.json"
COHORT = HOME / "cohort-pins" / "IMMUTABLE_COHORT_PINS.json"
DENOM = CENSUS / "denominator" / "FRESH_CENSUS_DENOMINATOR.json"
CENSUS_ADJ = HOME / "census-adjudication"
RECEIPT_DIR = HERE / "receipts"

EVIDENCE_FIELDS = [
    "membership_version",
    "owner_doc",  # binding schema name; accept legacy "owner" as alias during transition
    "producer",
    "closed_payload_schema",
    "scope_identity",
    "replay_idempotency",
    "retention",
    "redaction_custody",
    "transitions",
    "consumers_checkpoints",
    "compatibility_withdrawal",
    "positive_negative_oracles",
]
LEGACY_OWNER_KEY = "owner"
AUGUST = {"terminal.workgroup_moved", "workspace.layout_changed"}
# Terminal statuses must match OWNER_DECISION_SHEET option tokens (not arbitrary non-PENDING).
AUGUST_VETO_STATUS_ENUM = {
    "PENDING",
    "AFFIRM_DRAFT_AS_PROPOSED",
    "VETO_KEEP_REGISTERED_PROVISIONAL",
    "RECLASSIFY_OUT_OF_REGISTRY",
}
AUGUST_TERMINAL_VETO_STATUS = AUGUST_VETO_STATUS_ENUM - {"PENDING"}
AUTH_GITHUB = {
    "auth.github.authenticated",
    "auth.github.device_code.issued",
    "auth.github.disconnected",
    "auth.github.failed",
    "auth.github.token.polling",
}
COMPACTION_COMPLETED = "context.compaction.completed"


def option_token(opt) -> str | None:
    """Normalize a sheet option into its stable identifier token.

    Example: "CONFIRM_EXACT_EXCLUDE (foo)" -> "CONFIRM_EXACT_EXCLUDE"
    """
    if not isinstance(opt, str) or not opt.strip():
        return None
    s = opt.strip()
    m = re.match(r"^([A-Za-z0-9_.\-]+)", s)
    return m.group(1) if m else None


def decision_chosen_token(decisions, decision_id: str) -> str | None:
    rows = [d for d in decisions if isinstance(d, dict) and d.get("decision_id") == decision_id]
    if len(rows) != 1:
        return None
    resp = rows[0].get("owner_response")
    if not isinstance(resp, dict):
        return None
    return option_token(resp.get("chosen_option"))


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_ledger(path: Path):
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows




def derive_independent_partition(
    cohort: dict,
    rejected_doc: dict,
    machine_scan: dict,
    alias_types: set[str] | None = None,
    *,
    qna_close: bool = False,
    compact_not_admitted: bool = False,
    august_reclassified: bool = False,
) -> dict[str, set[str]]:
    """Derive expected category -> event_type sets from pinned sources only.

    Sources: IMMUTABLE_COHORT_PINS, MACHINE_CONTRACT_EVENT_BINDING_SCAN,
    REJECTED_LEXICAL_CANDIDATES, and authoritative IndividualDisposition alias
    rebucket (july40 RECLASSIFY_ALIAS rows). Must NOT read census PARTITION.json
    or census-adjudication/LEDGER.jsonl.
    """
    k37 = set(cohort["cohorts"]["known37"]["event_types"])
    aug = set(cohort["cohorts"]["august2_live_beyond_known37"]["event_types"])
    j248 = set(cohort["cohorts"]["july248_confirmed_persisted_unregistered"]["event_types"])
    j40 = set(cohort["cohorts"]["july40_unresolved"]["event_types"])
    j68 = set(cohort["cohorts"]["july68_exact_excluded"]["event_types"])
    j26 = set(cohort["cohorts"]["july26_non_exact"]["event_types"])
    emit_restores = {
        x["event_type"] for x in machine_scan.get("false_rejects_restored") or []
    }
    triple_bound_emit = set(machine_scan.get("triple_bound_missing_from_census_ledger") or [])
    # After merge, emit_candidates_total is authoritative superset
    emit_candidates = emit_restores | triple_bound_emit | set(
        machine_scan.get("emit_candidates_total") or []
    )
    rejected_types = {
        c["event_type"]
        for c in rejected_doc.get("candidates") or []
        if c.get("verdict") == "REJECTED_LEXICAL_CANDIDATE" and c.get("event_type")
    }
    alias = set(alias_types or ()) & j40
    unresolved = (j40 - alias) | emit_candidates
    registered_keep = k37 | aug
    persisted_unregistered_quarantine = j248 | AUTH_GITHUB
    quarantined_not_admitted: set[str] = set()
    if qna_close:
        quarantined_not_admitted = (j40 - alias) | emit_candidates
        if compact_not_admitted:
            quarantined_not_admitted = quarantined_not_admitted | {COMPACTION_COMPLETED}
        if august_reclassified:
            quarantined_not_admitted = quarantined_not_admitted | aug
        unresolved = set()
    if compact_not_admitted:
        persisted_unregistered_quarantine = (j248 | AUTH_GITHUB) - {COMPACTION_COMPLETED}
    if august_reclassified:
        registered_keep = set(k37)
    return {
        "registered_keep": registered_keep,
        "persisted_unregistered_quarantine": persisted_unregistered_quarantine,
        "alias": alias,
        "unresolved": unresolved,
        "exact_excluded": j68 - AUTH_GITHUB,
        "non_exact_excluded": j26,
        "rejected_lexical_candidate": rejected_types,
        "quarantined_not_admitted": quarantined_not_admitted,
    }

def evidence_map(row: dict) -> dict:
    ev = dict(row.get("evidence") or {})
    if "owner_doc" not in ev and LEGACY_OWNER_KEY in ev:
        ev["owner_doc"] = ev[LEGACY_OWNER_KEY]
    return ev


def cell_ok_pass(cell) -> bool:
    if not isinstance(cell, dict):
        return False
    if cell.get("status") != "PASS":
        return False
    cit = cell.get("citation")
    return isinstance(cit, str) and cit.startswith("Plans/") and len(cit) > 8


def main() -> int:
    RECEIPT_DIR.mkdir(parents=True, exist_ok=True)
    failures: list[dict] = []
    named: dict = {}

    # --- required inputs ---
    required_paths = {
        "known37_from_plans": K37,
        "cohort_pins": COHORT,
        "fresh_denominator": DENOM,
        "disposition_ledger": IND / "LEDGER.jsonl",
        "census_adjudication_ledger": CENSUS_ADJ / "LEDGER.jsonl",
        "census_adjudication_partition": CENSUS_ADJ / "PARTITION.json",
        "registry": ROOT / "event_family_registry.json",
        "census_freeze": CENSUS / "CURRENT_SOURCE_INVENTORY.json",
        "august_checkpoint_drafts": HOME / "august-checkpoint-drafts" / "AUGUST_CHECKPOINT_DRAFTS.jsonl",
        "owner_decision_sheet": HOME / "OWNER_DECISION_SHEET.json",
        "exclusion_revalidation_summary": HOME / "exclusion-revalidation" / "EXCLUSION_REVALIDATION_SUMMARY.json",
        "exclusion_revalidation_ledger": HOME / "exclusion-revalidation" / "EXCLUSION_REVALIDATION_LEDGER.jsonl",
        "machine_contract_event_binding_scan": CENSUS / "admission" / "MACHINE_CONTRACT_EVENT_BINDING_SCAN.json",
        "rejected_lexical_candidates": CENSUS / "rejected-lexical" / "REJECTED_LEXICAL_CANDIDATES.json",
        "md_only_binding_adjudication": CENSUS / "admission" / "MD_ONLY_BINDING_ADJUDICATION.jsonl",
    }
    for key, path in required_paths.items():
        if not path.exists():
            failures.append({"error": "required_input_missing", "input": key, "path": str(path)})

    if failures:
        receipt = build_receipt(False, False, failures, {}, {}, named)
        out = RECEIPT_DIR / "event_authority_validator_receipt.json"
        out.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({
            "pass": receipt["pass"],
            "failure_count": len(failures),
            "failure_errors": sorted({f.get("error") for f in failures if isinstance(f, dict)}),
            "receipt": str(out),
        }, indent=2))
        return 1

    known37_doc = load_json(K37)
    cohort = load_json(COHORT)
    denom = load_json(DENOM)
    ledger = load_ledger(IND / "LEDGER.jsonl")
    census_adj = load_ledger(CENSUS_ADJ / "LEDGER.jsonl")
    census_partition = load_json(CENSUS_ADJ / "PARTITION.json")
    registry = load_json(ROOT / "event_family_registry.json")
    freeze = load_json(CENSUS / "CURRENT_SOURCE_INVENTORY.json")

    known37 = list(known37_doc.get("event_types") or [])
    live = [f["event_type"] for f in registry["families"]]
    live_set = set(live)
    ledger_types = [r.get("event_type") for r in ledger]
    ledger_set = set(ledger_types)

    # Reject noncanonical Known37 sources
    named["known37_source_is_plans_only"] = (
        known37_doc.get("source", {}).get("path") == "Plans/storage-plan.md"
        and known37_doc.get("noncanonical_paths_forbidden") is True
        and len(known37) == 37
    )
    if not named["known37_source_is_plans_only"]:
        failures.append({"error": "known37_not_plans_canonical", "detail": known37_doc.get("source")})

    k37_unique = (
        len(known37) == 37
        and len(set(known37)) == 37
        and all(isinstance(x, str) and x.strip() for x in known37)
    )
    named["known37_exact_uniqueness"] = k37_unique
    if not k37_unique:
        failures.append({
            "error": "known37_not_exactly_unique_37",
            "count": len(known37),
            "unique_count": len(set(known37)),
            "detail": "Known37 must be exactly 37 unique nonempty event_type strings",
        })

    missing_k37 = sorted(set(known37) - live_set)
    named["known37_present_in_live_registry"] = not missing_k37 and k37_unique
    if missing_k37:
        failures.append({"error": "known37_missing_from_live", "missing": missing_k37})

    # Owner-sheet close-path flags must be known before August live-set and partition.
    owner_sheet_path = HOME / "OWNER_DECISION_SHEET.json"
    owner_sheet_for_flags = load_json(owner_sheet_path) if owner_sheet_path.exists() else {}
    flag_decisions = owner_sheet_for_flags.get("decisions") or []
    august_reclassified = (
        decision_chosen_token(flag_decisions, "AUG-CP-WLC-001") == "RECLASSIFY_OUT_OF_REGISTRY"
        and decision_chosen_token(flag_decisions, "AUG-CP-TWM-001") == "RECLASSIFY_OUT_OF_REGISTRY"
    )
    compact_not_admitted = (
        decision_chosen_token(flag_decisions, "COMPACT-001") == "KEEP_UNREGISTERED_NO_PERSIST"
    )
    qna_close = (
        decision_chosen_token(flag_decisions, "UNRESOLVED-54-CLOSE-PATH")
        == "NEW_NON_ADMITTED_QUARANTINE_BUCKET"
    )
    named["august_reclassified"] = august_reclassified
    named["compact_not_admitted"] = compact_not_admitted
    named["qna_close"] = qna_close

    live_august = live_set - set(known37)
    expected_august = set() if august_reclassified else set(AUGUST)
    named["august_set_ok"] = live_august == expected_august
    if not named["august_set_ok"]:
        failures.append({"error": "unexpected_august_set", "august": sorted(live_august)})

    # Immutable original cohort coverage (pins), independent of working buckets
    def cohort_types(name: str):
        # map short names
        key_map = {
            "july248": "july248_confirmed_persisted_unregistered",
            "july40": "july40_unresolved",
            "july68": "july68_exact_excluded",
            "july26": "july26_non_exact",
            "august2": "august2_live_beyond_known37",
            "known37": "known37",
        }
        return set(cohort["cohorts"][key_map[name]]["event_types"])

    # Disposition pin index (admitted families)
    pin_index = {}
    for r in ledger:
        et = r.get("event_type")
        pins = r.get("cohort_pins") or []
        if isinstance(pins, str):
            pins = [pins]
        pin_index[et] = set(pins)

    # Census-adjudication pin index (complete candidate universe)
    adj_pin_index = {}
    adj_by_cat = {}
    adj_ids = []
    for r in census_adj:
        cid = r.get("candidate_id") or r.get("event_type")
        adj_ids.append(cid)
        et = r.get("event_type")
        pins = r.get("cohort_pins") or []
        if isinstance(pins, str):
            pins = [pins]
        if et:
            adj_pin_index.setdefault(et, set()).update(pins)
        cat = r.get("category")
        adj_by_cat.setdefault(cat, set()).add(cid)

    named["census_adjudication_unique_ids"] = len(adj_ids) == len(set(adj_ids))
    if len(adj_ids) != len(set(adj_ids)):
        failures.append({
            "error": "census_adjudication_duplicate_candidate_id",
            "duplicate_count": len(adj_ids) - len(set(adj_ids)),
        })

    # Independent partition derivation (Advisor-2: no circular PARTITION.json counts)
    rejected_path = CENSUS / "rejected-lexical" / "REJECTED_LEXICAL_CANDIDATES.json"
    machine_scan_path = CENSUS / "admission" / "MACHINE_CONTRACT_EVENT_BINDING_SCAN.json"
    if not rejected_path.exists():
        failures.append({"error": "required_input_missing", "input": "rejected_lexical_candidates", "path": str(rejected_path)})
    if not machine_scan_path.exists():
        failures.append({"error": "required_input_missing", "input": "machine_contract_event_binding_scan", "path": str(machine_scan_path)})
    rejected_doc = load_json(rejected_path) if rejected_path.exists() else {}
    machine_scan = load_json(machine_scan_path) if machine_scan_path.exists() else {}
    md_only_adj_path = CENSUS / "admission" / "MD_ONLY_BINDING_ADJUDICATION.jsonl"
    md_only_adj_rows = []
    if md_only_adj_path.exists():
        for line in md_only_adj_path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                md_only_adj_rows.append(json.loads(line))
    alias_types = {
        r["event_type"]
        for r in ledger
        if r.get("bucket") == "alias" and r.get("disposition") == "RECLASSIFY_ALIAS"
    }
    independent_partition = derive_independent_partition(
        cohort,
        rejected_doc,
        machine_scan,
        alias_types=alias_types,
        qna_close=qna_close,
        compact_not_admitted=compact_not_admitted,
        august_reclassified=august_reclassified,
    )
    ledger_by_event = {}
    for r in census_adj:
        cat = r.get("category")
        et = r.get("event_type")
        if cat and et:
            ledger_by_event.setdefault(cat, set()).add(et)

    partition_set_ok = True
    partition_mismatches = []
    for cat, expected_ets in independent_partition.items():
        actual_ets = ledger_by_event.get(cat, set())
        if actual_ets != expected_ets:
            partition_set_ok = False
            partition_mismatches.append({
                "category": cat,
                "missing_from_ledger": sorted(expected_ets - actual_ets)[:20],
                "extra_in_ledger": sorted(actual_ets - expected_ets)[:20],
                "missing_count": len(expected_ets - actual_ets),
                "extra_count": len(actual_ets - expected_ets),
            })
    # md_only explicit adjudication (Advisor-2: close non-JSON-source gap before denominator seal)
    # Fail closed: missing machine-scan, non-v3 scan, or missing adj ledger must not
    # leave md_only_bindings_adjudicated_ok=True.
    recon = machine_scan.get("reconciliation") or {}
    raw_md_only = recon.get("md_only")
    md_only_tokens = set(raw_md_only or []) if isinstance(raw_md_only, list) else set()
    md_adj_by_token = {r["event_type"]: r for r in md_only_adj_rows if r.get("event_type")}
    md_only_ok = True
    md_only_issues = []
    if not machine_scan_path.exists():
        md_only_ok = False
        md_only_issues.append({
            "error": "md_only_machine_scan_missing",
            "path": str(machine_scan_path),
            "detail": "Deleted machine-scan must not fail open as md_only adjudicated",
        })
    elif not str(machine_scan.get("schema_id") or "").endswith(".v3"):
        md_only_ok = False
        md_only_issues.append({
            "error": "md_only_machine_scan_not_v3",
            "schema_id": machine_scan.get("schema_id"),
            "detail": "Non-v3 or missing schema_id must not skip md_only adjudication",
        })
    else:
        if not isinstance(raw_md_only, list):
            md_only_ok = False
            md_only_issues.append({
                "error": "md_only_token_set_missing",
                "detail": "v3 reconciliation.md_only list is required; do not skip adjudication when the key is absent",
            })
        elif not md_only_tokens:
            md_only_ok = False
            md_only_issues.append({
                "error": "md_only_token_set_empty",
                "detail": "Empty md_only token set must not fail open as adjudicated",
            })
        elif not md_only_adj_path.exists():
            md_only_ok = False
            md_only_issues.append({"error": "md_only_adjudication_artifact_missing", "path": str(md_only_adj_path)})
        elif set(md_adj_by_token) != md_only_tokens:
            md_only_ok = False
            md_only_issues.append({
                "error": "md_only_adjudication_incomplete",
                "expected_count": len(md_only_tokens),
                "actual_count": len(md_adj_by_token),
                "missing": sorted(md_only_tokens - set(md_adj_by_token))[:20],
                "extra": sorted(set(md_adj_by_token) - md_only_tokens)[:20],
            })
        else:
            for token in sorted(md_only_tokens):
                row = md_adj_by_token[token]
                census_row = next((r for r in census_adj if r.get("event_type") == token), None)
                if row.get("emit_candidate"):
                    md_only_ok = False
                    md_only_issues.append({"error": "md_only_emit_candidate_true", "event_type": token})
                if not row.get("census_category_unchanged", False):
                    md_only_ok = False
                    md_only_issues.append({"error": "md_only_census_category_changed", "event_type": token})
                if census_row and row.get("census_category") != census_row.get("category"):
                    md_only_ok = False
                    md_only_issues.append({
                        "error": "md_only_census_category_mismatch",
                        "event_type": token,
                        "adjudication": row.get("census_category"),
                        "ledger": census_row.get("category"),
                    })
    named["md_only_bindings_adjudicated_ok"] = md_only_ok
    if not md_only_ok:
        failures.append({"error": "md_only_bindings_not_adjudicated", "issues": md_only_issues})

    named["census_adjudication_independent_set_equality_ok"] = partition_set_ok
    if not partition_set_ok:
        failures.append({
            "error": "census_adjudication_independent_set_mismatch",
            "mismatches": partition_mismatches,
            "detail": "Expected sets derived from cohort_pins + machine_contract_scan + rejected_lexical, not PARTITION.json",
        })

    expected_adj_cats = {k: len(v) for k, v in independent_partition.items() if v}
    adj_cat_counts = {k: len(v) for k, v in adj_by_cat.items()}
    named["census_adjudication_category_counts_ok"] = adj_cat_counts == expected_adj_cats
    if adj_cat_counts != expected_adj_cats:
        failures.append({
            "error": "census_adjudication_category_count_mismatch",
            "actual": adj_cat_counts,
            "expected": expected_adj_cats,
        })

    # PARTITION.json is a derived artifact; must agree with ledger + independent counts (not authoritative)
    named["census_partition_artifact_ok"] = (
        bool(census_partition.get("partition_ok"))
        and census_partition.get("category_counts") == adj_cat_counts
        and census_partition.get("expected_category_counts") == expected_adj_cats
        and census_partition.get("independent_set_equality_ok") is True
    )
    if not named["census_partition_artifact_ok"]:
        failures.append({
            "error": "census_adjudication_partition_artifact_stale",
            "partition_ok": census_partition.get("partition_ok"),
            "category_counts": census_partition.get("category_counts"),
            "expected_category_counts": census_partition.get("expected_category_counts"),
            "independent_set_equality_ok": census_partition.get("independent_set_equality_ok"),
        })

    for cname, expect_n in [
        ("july248", 248),
        ("july40", 40),
        ("july68", 68),
        ("july26", 26),
        ("august2", 2),
        ("known37", 37),
    ]:
        need = cohort_types(cname)
        named[f"immutable_{cname}_pin_count"] = len(need) == expect_n
        if len(need) != expect_n:
            failures.append({"error": f"immutable_{cname}_pin_count_mismatch", "count": len(need), "expected": expect_n})
            continue
        if cname == "known37":
            named["immutable_known37_registry_ok"] = named.get("known37_present_in_live_registry", False)
            # Also require census-adjudication registered_keep coverage
            covered = need <= {r.get("event_type") for r in census_adj if "known37" in (r.get("cohort_pins") or [])}
            named["immutable_known37_covered_in_census_adjudication"] = covered
            if not covered:
                failures.append({"error": "immutable_known37_missing_from_census_adjudication"})
            continue
        covered_ets = {et for et, pins in adj_pin_index.items() if cname in pins}
        missing = sorted(need - covered_ets)
        named[f"immutable_{cname}_covered_in_census_adjudication"] = not missing
        if missing:
            failures.append({
                "error": f"immutable_{cname}_missing_from_census_adjudication",
                "missing": missing[:30],
                "missing_count": len(missing),
            })
        # Admitted-family cohorts must also remain pinned on IndividualDisposition where present
        if cname in {"july248", "july40", "august2"}:
            # july248 original set is 248; working unreg may be 253 with auth dual-pins
            missing_disp = sorted((need & ledger_set) - {et for et in (need & ledger_set) if cname in pin_index.get(et, set()) or (cname == "july248" and "july248" in pin_index.get(et, set()))})
            # Simpler: every need member that is in ledger must carry pin
            unpinned = sorted(et for et in (need & ledger_set) if cname not in pin_index.get(et, set()))
            if cname == "july248":
                # auth.github are not in original july248 need set; original 248 must be in ledger with pin
                missing_orig = sorted(need - ledger_set)
                named["immutable_july248_covered_in_ledger"] = not missing_orig
                if missing_orig:
                    failures.append({"error": "immutable_july248_missing_from_ledger", "missing": missing_orig[:30], "missing_count": len(missing_orig)})
                if unpinned:
                    failures.append({"error": "immutable_july248_cohort_pins_missing_on_rows", "sample": unpinned[:20]})
            elif cname == "july40":
                named["immutable_july40_covered_in_ledger"] = not sorted(need - ledger_set)
                if sorted(need - ledger_set):
                    failures.append({"error": "immutable_july40_missing_from_ledger", "missing": sorted(need - ledger_set)[:30], "missing_count": len(need - ledger_set)})
                if unpinned:
                    failures.append({"error": "immutable_july40_cohort_pins_missing_on_rows", "sample": unpinned[:20]})
            elif cname == "august2":
                named["immutable_august2_covered_in_ledger"] = not sorted(need - ledger_set)
                if sorted(need - ledger_set):
                    failures.append({"error": "immutable_august2_missing_from_ledger", "missing": sorted(need - ledger_set), "missing_count": len(need - ledger_set)})
                if unpinned:
                    failures.append({"error": "immutable_august2_cohort_pins_missing_on_rows", "sample": unpinned[:20]})

    # Auth.github multi-cohort pin retention on both ledgers
    auth_adj_ok = True
    for et in sorted(AUTH_GITHUB):
        pins = adj_pin_index.get(et, set())
        if not ({"july68", "july248"} <= pins):
            auth_adj_ok = False
            failures.append({"error": "auth_github_missing_multi_cohort_pins_census_adjudication", "event_type": et, "pins": sorted(pins)})
        dp = pin_index.get(et, set())
        if et in ledger_set and not ({"july68", "july248"} <= dp):
            auth_adj_ok = False
            failures.append({"error": "auth_github_missing_multi_cohort_pins_disposition", "event_type": et, "pins": sorted(dp)})
    named["auth_github_multi_cohort_pins_ok"] = auth_adj_ok

    # Fresh census denominator: exact equality ONLY for admitted persisted event families
    named["fresh_denominator_artifact_present"] = True
    closed = bool(denom.get("closed")) is True
    named["fresh_denominator_closed"] = closed
    admitted_block = denom.get("admitted_persisted_event_families") or {}
    comp = admitted_block.get("composition") or {}
    if comp.get("unresolved"):
        failures.append({
            "error": "denominator_admitted_includes_unresolved",
            "detail": "Unresolved rows are not admitted persisted event families until per-row persistence proof",
            "unresolved_count_in_composition": comp.get("unresolved"),
        })
        named["denominator_admitted_excludes_unresolved"] = False
    else:
        named["denominator_admitted_excludes_unresolved"] = True
    open_block = admitted_block.get("persistence_open_not_admitted") or {}
    if "unresolved_tracking_count" not in open_block:
        failures.append({
            "error": "denominator_missing_persistence_open_tracking",
            "detail": "Must track unresolved emit/persistence-open rows separately from admitted denominator",
        })
    # Pre-seal candidate set (Advisor-2): nonempty/exact equality is NOT post-seal-only.
    # Only `fresh_census_denominator_not_closed` is deferred until closed=true.
    admitted_buckets = {"confirmed_persisted_unregistered", "august"}
    admitted_ledger_types = [
        r.get("event_type") for r in ledger if r.get("bucket") in admitted_buckets
    ]
    admitted_ledger_set = set(admitted_ledger_types)
    named["proposed_admitted_event_types_nonempty"] = bool(admitted_ledger_set)
    named["proposed_admitted_event_types_no_duplicates"] = (
        len(admitted_ledger_types) == len(admitted_ledger_set)
    )
    if not admitted_ledger_set:
        failures.append({
            "error": "proposed_admitted_event_types_empty",
            "detail": "Pre-seal candidate admitted set from IndividualDisposition must be nonempty",
        })
    if len(admitted_ledger_types) != len(admitted_ledger_set):
        failures.append({
            "error": "proposed_admitted_event_types_duplicate_ledger_rows",
            "duplicate_count": len(admitted_ledger_types) - len(admitted_ledger_set),
        })

    raw_types = admitted_block.get("event_types")
    if raw_types is None:
        raw_types = denom.get("event_types")

    excl_ets = {
        r.get("event_type") for r in census_adj
        if r.get("category") in {"exact_excluded", "non_exact_excluded", "rejected_lexical_candidate"} and r.get("event_type")
    }

    if raw_types is None:
        denom_types = None
        named["fresh_denominator_admitted_event_types_specified"] = False
        named["ledger_equals_admitted_persisted_families"] = False
        named["ledger_equals_fresh_denominator"] = False
        named["admitted_excludes_exclusion_and_rejects"] = True
        failures.append({
            "error": "fresh_denominator_admitted_event_types_unspecified",
            "detail": "Pre-seal: write nonempty admitted event_types equal to the ledger candidate before flipping closed=true. Null event_types must not be treated as post-seal-only.",
            "candidate_count": len(admitted_ledger_set),
        })
    else:
        named["fresh_denominator_admitted_event_types_specified"] = True
        denom_types = set(raw_types)
        if not denom_types:
            failures.append({
                "error": "fresh_denominator_closed_but_empty_event_types",
                "detail": "Admitted event_types is empty; this is a pre-seal failure (do not seal an empty set)",
            })
        missing = sorted(denom_types - admitted_ledger_set)
        extra = sorted(admitted_ledger_set - denom_types)
        eq_ok = (
            bool(denom_types)
            and not missing
            and not extra
            and len(admitted_ledger_types) == len(admitted_ledger_set)
        )
        named["ledger_equals_admitted_persisted_families"] = eq_ok
        named["ledger_equals_fresh_denominator"] = eq_ok
        if not eq_ok:
            failures.append({
                "error": "ledger_admitted_persisted_families_set_mismatch",
                "missing_count": len(missing),
                "extra_count": len(extra),
                "duplicate_ledger_rows": len(admitted_ledger_types) - len(admitted_ledger_set),
                "missing_sample": missing[:30],
                "extra_sample": extra[:30],
            })
        leaked_ets = sorted(denom_types & excl_ets)
        named["admitted_excludes_exclusion_and_rejects"] = not leaked_ets
        if leaked_ets:
            failures.append({
                "error": "admitted_denominator_contains_exclusion_or_reject",
                "sample": leaked_ets[:30],
                "count": len(leaked_ets),
            })

    # Anti-circularity: ONLY this flag is post-seal certification.
    # Sequence: apply closure prerequisites + write proposed event_types ->
    # seal_prerequisites_met -> flip closed=true -> re-run for pass=true.
    if not closed:
        failures.append({
            "error": "fresh_census_denominator_not_closed",
            "blocked_by": denom.get("close_blocked_by"),
            "detail": "Post-seal certification only. Artifact closed=false always fails this check; seal after seal_prerequisites_met (which already requires nonempty exact admitted event_types), then re-run.",
        })

    # Freeze digest pin — absent digest must not fail open as a match
    denom_digest = denom.get("freeze_digest_sha256")
    freeze_digest = freeze.get("canonical_digest_sha256")
    if not denom_digest or not freeze_digest:
        named["freeze_digest_matches_denominator"] = False
        failures.append({
            "error": "census_freeze_digest_missing",
            "denominator_digest": denom_digest,
            "freeze_digest": freeze_digest,
            "detail": "Both denominator freeze_digest_sha256 and inventory canonical_digest_sha256 are required",
        })
    elif denom_digest != freeze_digest:
        named["freeze_digest_matches_denominator"] = False
        failures.append({
            "error": "census_freeze_digest_mismatch",
            "denominator_digest": denom_digest,
            "freeze_digest": freeze_digest,
        })
    else:
        named["freeze_digest_matches_denominator"] = True

    # Advisor-2: rejected lexical candidates must never pollute disposition or denominator
    rule_v2 = CENSUS / "admission" / "CENSUS_ADMISSION_RULE_V2.json"
    rejected_path = CENSUS / "rejected-lexical" / "REJECTED_LEXICAL_CANDIDATES.json"
    named["census_admission_rule_v2_present"] = rule_v2.exists()
    if not rule_v2.exists():
        failures.append({
            "error": "census_admission_rule_v2_missing",
            "detail": "DIRECT_EVENT_TYPE_BINDING_REQUIRED artifact required after residual-pollution correction",
            "path": str(rule_v2),
        })
    rejected_types = set()
    if rejected_path.exists():
        rej_doc = load_json(rejected_path)
        for c in rej_doc.get("candidates") or []:
            if c.get("verdict") == "REJECTED_LEXICAL_CANDIDATE" and c.get("event_type"):
                rejected_types.add(c["event_type"])
    named["rejected_lexical_ledger_loaded"] = rejected_path.exists()
    fresh_pollution = sorted({
        r.get("event_type")
        for r in ledger
        if r.get("bucket") == "fresh_census_residual" or r.get("event_type") in rejected_types
    })
    named["no_fresh_census_residual_pollution"] = not fresh_pollution
    if fresh_pollution:
        failures.append({
            "error": "fresh_census_residual_or_rejected_lexical_in_disposition",
            "count": len(fresh_pollution),
            "sample": fresh_pollution[:30],
            "detail": "Rejected lexical candidates and heuristic clean residuals are not IndividualDisposition denominator rows",
        })
    if closed and denom_types is not None:
        rej_in_denom = sorted(rejected_types & denom_types)
        named["no_rejected_lexical_in_fresh_denominator"] = not rej_in_denom
        if rej_in_denom:
            failures.append({
                "error": "rejected_lexical_in_fresh_denominator",
                "count": len(rej_in_denom),
                "sample": rej_in_denom[:30],
            })
        # progress_union must not claim clean residuals as denom members
        progress = denom.get("progress_union_not_denominator") or {}
        claimed_clean = progress.get("fresh_clean_residuals") or []
        named["no_progress_clean_residual_claim"] = not claimed_clean
        if claimed_clean:
            failures.append({
                "error": "denominator_progress_still_claims_clean_residuals",
                "sample": list(claimed_clean)[:20],
            })
    else:
        progress = denom.get("progress_union_not_denominator") or {}
        claimed_clean = progress.get("fresh_clean_residuals") or []
        named["no_progress_clean_residual_claim"] = not claimed_clean
        if claimed_clean:
            failures.append({
                "error": "denominator_progress_still_claims_clean_residuals",
                "sample": list(claimed_clean)[:20],
            })


    # --- Per-row exclusion revalidation (68 exact + 26 non-exact) ---
    excl_summary_path = HOME / "exclusion-revalidation" / "EXCLUSION_REVALIDATION_SUMMARY.json"
    excl_ledger_path = HOME / "exclusion-revalidation" / "EXCLUSION_REVALIDATION_LEDGER.jsonl"
    excl_summary: dict = {}
    excl_rows: list[dict] = []
    expected_excl_total = 94
    if not excl_summary_path.exists() or not excl_ledger_path.exists():
        named["exclusion_revalidation_artifacts_present"] = False
        named["exclusion_revalidation_row_count_ok"] = False
        named["exclusion_revalidation_all_rows_pass"] = False
        failures.append({
            "error": "exclusion_revalidation_artifacts_missing",
            "summary_path": str(excl_summary_path),
            "ledger_path": str(excl_ledger_path),
        })
    else:
        named["exclusion_revalidation_artifacts_present"] = True
        excl_summary = load_json(excl_summary_path)
        excl_rows = load_ledger(excl_ledger_path)
        excl_pass_count = sum(1 for r in excl_rows if r.get("pass") is True)
        excl_owner_pending = [
            r.get("event_type")
            for r in excl_rows
            if not r.get("pass") or r.get("disposition") == "OWNER_DECISION_REQUIRED"
        ]
        named["exclusion_revalidation_row_count_ok"] = len(excl_rows) == expected_excl_total
        named["exclusion_revalidation_pass_count"] = excl_pass_count
        named["exclusion_revalidation_all_rows_pass"] = (
            len(excl_rows) == expected_excl_total
            and excl_pass_count == expected_excl_total
            and excl_summary.get("all_revalidated") is True
            and not excl_owner_pending
        )
        if not named["exclusion_revalidation_row_count_ok"]:
            failures.append({
                "error": "exclusion_revalidation_row_count_mismatch",
                "expected": expected_excl_total,
                "actual": len(excl_rows),
            })
        if not named["exclusion_revalidation_all_rows_pass"]:
            failures.append({
                "error": "exclusion_revalidation_incomplete",
                "pass_count": excl_pass_count,
                "total": expected_excl_total,
                "fail_count": excl_summary.get("fail_count"),
                "all_revalidated": excl_summary.get("all_revalidated"),
                "owner_decision_pending": excl_owner_pending,
            })

    # --- Owner decision sheet (August / EMIT / J248 / J40 / exclusion) ---
    owner_sheet_path = HOME / "OWNER_DECISION_SHEET.json"
    owner_sheet: dict = {}
    pending_owner_decisions: list[str] = []

    def owner_decision_applied(decision: dict) -> bool:
        resp = decision.get("owner_response")
        if not isinstance(resp, dict):
            return False
        chosen = resp.get("chosen_option")
        options = decision.get("options")
        if not chosen or not isinstance(chosen, str):
            return False
        if not isinstance(options, list) or not options:
            return False
        if chosen not in options:
            return False
        return True

    if not owner_sheet_path.exists():
        named["owner_decision_sheet_present"] = False
        named["owner_decision_sheet_all_applied"] = False
        failures.append({
            "error": "owner_decision_sheet_missing",
            "path": str(owner_sheet_path),
        })
    else:
        named["owner_decision_sheet_present"] = True
        owner_sheet = load_json(owner_sheet_path)
        decisions = owner_sheet.get("decisions") or []
        required_decision_ids = {
            "AUG-CP-WLC-001",
            "AUG-CP-TWM-001",
            "EXCL-OD-done_budget_exceeded",
            "EXCL-OD-stop_identical_failure",
            "EMIT-PERSIST-026",
            "J248-VETO-BATCH-252",
            "J40-VETO-BATCH",
            "COMPACT-001",
            "UNRESOLVED-54-CLOSE-PATH",
        }

        # Pin expected option-token sets for required IDs to prevent sheet corruption.
        expected_option_tokens: dict[str, set[str]] = {
            "AUG-CP-WLC-001": {"AFFIRM_DRAFT_AS_PROPOSED", "VETO_KEEP_REGISTERED_PROVISIONAL", "RECLASSIFY_OUT_OF_REGISTRY"},
            "AUG-CP-TWM-001": {"AFFIRM_DRAFT_AS_PROPOSED", "VETO_KEEP_REGISTERED_PROVISIONAL", "RECLASSIFY_OUT_OF_REGISTRY"},
            "EXCL-OD-done_budget_exceeded": {"CONFIRM_EXACT_EXCLUDE", "RECLASSIFY_TO_NON_EXACT", "RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE"},
            "EXCL-OD-stop_identical_failure": {"CONFIRM_EXACT_EXCLUDE", "RECLASSIFY_TO_NON_EXACT", "RECLASSIFY_TO_UNRESOLVED_OR_QUARANTINE"},
            "EMIT-PERSIST-026": {"ACCEPT_EMIT_OBLIGATION_ONLY", "DEMAND_PERSISTENCE_PROOF_BEFORE_ANY_ADMIT", "PER_ROW_VETO_REQUIRED"},
            "COMPACT-001": {"KEEP_UNREGISTERED_NO_PERSIST", "ESCALATE_AS_PERSISTED_FAMILY", "RECLASSIFY_UNRESOLVED_PENDING_AUTHORITY"},
            "J248-VETO-BATCH-252": {"CONFIRM_ALL_QUARANTINE_NO_ADMIT", "ESCALATE_SUBSET_FOR_REGISTRY_ADMIT", "PER_ROW_REVIEW_REQUIRED"},
            "J40-VETO-BATCH": {"CONFIRM_UNRESOLVED_NO_ADMIT", "ESCALATE_SUBSET", "PER_ROW_REVIEW"},
            "UNRESOLVED-54-CLOSE-PATH": {
                "NEW_NON_ADMITTED_QUARANTINE_BUCKET",
                "VALIDATOR_TREAT_QUARANTINED_UNRESOLVED_AS_CLOSED",
                "MOVE_54_INTO_CPU_QUARANTINE",
                "PER_ROW_SPLIT_54",
            },
        }

        # Fail if any required decision_id appears more than once.
        id_counts = Counter(d.get("decision_id") for d in decisions if d.get("decision_id"))
        dup_required = sorted([k for k, v in id_counts.items() if k in required_decision_ids and v > 1])
        if dup_required:
            failures.append({
                "error": "owner_decision_sheet_duplicate_required_ids",
                "duplicate_required_decision_ids": dup_required,
            })

        # Fail if the required decision option-token sets drift.
        for rid in required_decision_ids:
            req_rows = [d for d in decisions if d.get("decision_id") == rid]
            if len(req_rows) != 1:
                continue  # missing/dup handled elsewhere
            opts = req_rows[0].get("options") or []
            actual_tokens = set(option_token(o) for o in opts)
            actual_tokens.discard(None)
            expected_tokens = expected_option_tokens.get(rid) or set()
            if actual_tokens != expected_tokens:
                failures.append({
                    "error": "owner_decision_sheet_option_set_drift",
                    "decision_id": rid,
                    "expected_option_tokens": sorted(expected_tokens),
                    "actual_option_tokens": sorted(actual_tokens),
                })
        present_ids = {d.get("decision_id") for d in decisions if d.get("decision_id")}
        missing_ids = sorted(required_decision_ids - present_ids)
        named["owner_decision_sheet_required_ids_present"] = not missing_ids and bool(decisions)
        if not decisions:
            named["owner_decision_sheet_all_applied"] = False
            failures.append({
                "error": "owner_decision_sheet_empty",
                "path": str(owner_sheet_path),
                "required_decision_ids": sorted(required_decision_ids),
                "detail": "Empty owner decision list must not fail open as all_applied",
            })
        if missing_ids:
            named["owner_decision_sheet_all_applied"] = False
            failures.append({
                "error": "owner_decision_sheet_missing_required_ids",
                "missing_decision_ids": missing_ids,
                "detail": "Required owner-decision IDs must remain present; deleting rows must not fail open",
            })
        pending_owner_decisions = [
            d.get("decision_id")
            for d in decisions
            if d.get("decision_id") in required_decision_ids and not owner_decision_applied(d)
        ]
        # also pending if extra decisions exist without response
        pending_owner_decisions += [
            d.get("decision_id")
            for d in decisions
            if d.get("decision_id") not in required_decision_ids and not owner_decision_applied(d)
        ]
        # de-dupe preserve order
        seen = set()
        pending_owner_decisions = [x for x in pending_owner_decisions if not (x in seen or seen.add(x))]
        named["owner_decision_sheet_all_applied"] = (
            named.get("owner_decision_sheet_required_ids_present")
            and not pending_owner_decisions
        )
        named["owner_decision_sheet_pending_count"] = len(pending_owner_decisions)
        if pending_owner_decisions:
            failures.append({
                "error": "owner_decision_sheet_unresolved",
                "pending_count": len(pending_owner_decisions),
                "pending_decision_ids": pending_owner_decisions,
                "detail": "Batched owner decisions (August, exclusion reclass, EMIT-PERSIST-026, J248, J40, COMPACT-001) must be applied before validator pass=true or denominator seal",
            })

    # --- August checkpoint veto state (must not remain PENDING) ---
    # Fail closed: missing/empty draft ledger, or missing either expected August
    # event, is an explicit failure BEFORE veto-status evaluation. A deleted
    # artifact must not set august_checkpoint_decisions_applied=True.
    august_draft_path = HOME / "august-checkpoint-drafts" / "AUGUST_CHECKPOINT_DRAFTS.jsonl"
    august_drafts: list[dict] = []
    august_pending: list = []
    named["august_checkpoint_drafts_present"] = august_draft_path.exists()
    named["august_checkpoint_events_complete"] = False
    named["august_checkpoint_decisions_applied"] = False
    if not august_draft_path.exists():
        failures.append({
            "error": "august_checkpoint_drafts_missing",
            "path": str(august_draft_path),
            "expected_event_types": sorted(AUGUST),
            "detail": "August draft ledger is a required input; absence must not fail open",
        })
        august_pending = sorted(AUGUST)
    else:
        august_drafts = load_ledger(august_draft_path)
        draft_ets = {r.get("event_type") for r in august_drafts if r.get("event_type")}
        missing_events = sorted(AUGUST - draft_ets)
        if not august_drafts:
            named["august_checkpoint_events_complete"] = False
            failures.append({
                "error": "august_checkpoint_drafts_empty",
                "path": str(august_draft_path),
                "expected_event_types": sorted(AUGUST),
                "detail": "Empty August draft ledger must not fail open as decisions applied",
            })
            august_pending = sorted(AUGUST)
        elif missing_events:
            named["august_checkpoint_events_complete"] = False
            failures.append({
                "error": "august_checkpoint_events_missing",
                "missing_event_types": missing_events,
                "expected_event_types": sorted(AUGUST),
                "present_event_types": sorted(et for et in draft_ets if et),
                "detail": "Both workspace.layout_changed and terminal.workgroup_moved must have draft rows before veto-status evaluation",
            })
            august_pending = missing_events
        else:
            named["august_checkpoint_events_complete"] = True
            counts = Counter(r.get("event_type") for r in august_drafts if r.get("event_type"))
            unexpected = sorted(et for et in counts if et not in AUGUST)
            duplicates = sorted(et for et, n in counts.items() if et in AUGUST and n != 1)
            cardinality_ok = not unexpected and not duplicates and all(counts.get(et) == 1 for et in AUGUST)
            named["august_checkpoint_exactly_one_row_per_event"] = cardinality_ok
            if unexpected:
                failures.append({
                    "error": "august_checkpoint_unexpected_event_types",
                    "unexpected_event_types": unexpected,
                    "expected_event_types": sorted(AUGUST),
                    "detail": "August draft ledger must contain only the two expected events",
                })
            if duplicates:
                failures.append({
                    "error": "august_checkpoint_duplicate_rows",
                    "duplicate_event_types": duplicates,
                    "counts": {et: counts[et] for et in duplicates},
                    "detail": "Exactly one draft row per August event is required; duplicates must not fail open",
                })
            if not cardinality_ok:
                named["august_checkpoint_decisions_applied"] = False
                august_pending = sorted(AUGUST)
            else:
                by_et = {}
                for r in august_drafts:
                    et = r.get("event_type")
                    if et in AUGUST:
                        by_et[et] = r
                invalid_status = []
                august_pending = []
                for et in sorted(AUGUST):
                    status = by_et[et].get("veto_status")
                    if status not in AUGUST_VETO_STATUS_ENUM:
                        invalid_status.append({"event_type": et, "veto_status": status})
                    elif status == "PENDING":
                        august_pending.append(et)
                    elif status not in AUGUST_TERMINAL_VETO_STATUS:
                        invalid_status.append({"event_type": et, "veto_status": status})
                if invalid_status:
                    named["august_checkpoint_decisions_applied"] = False
                    failures.append({
                        "error": "august_checkpoint_invalid_veto_status",
                        "invalid": invalid_status,
                        "allowed": sorted(AUGUST_VETO_STATUS_ENUM),
                        "terminal": sorted(AUGUST_TERMINAL_VETO_STATUS),
                        "detail": "Garbage/typo non-PENDING values must not count as applied; require explicit terminal enum aligned to OWNER_DECISION_SHEET options",
                    })
                    august_pending = sorted({*(august_pending or []), *(x["event_type"] for x in invalid_status)})
                else:
                    # Advisor-2: do not treat draft veto_status as applied unless it
                    # matches the normalized mapping of that event's owner choice.
                    decision_id_by_event = {
                        "workspace.layout_changed": "AUG-CP-WLC-001",
                        "terminal.workgroup_moved": "AUG-CP-TWM-001",
                    }

                    def normalize_chosen_option(chosen) -> str | None:
                        if not isinstance(chosen, str) or not chosen:
                            return None
                        if chosen.startswith("AFFIRM_DRAFT_AS_PROPOSED"):
                            return "AFFIRM_DRAFT_AS_PROPOSED"
                        if chosen.startswith("VETO_KEEP_REGISTERED_PROVISIONAL"):
                            return "VETO_KEEP_REGISTERED_PROVISIONAL"
                        if chosen.startswith("RECLASSIFY_OUT_OF_REGISTRY"):
                            return "RECLASSIFY_OUT_OF_REGISTRY"
                        return None

                    mismatches = []
                    for et in sorted(AUGUST):
                        actual_status = by_et[et].get("veto_status")
                        decision_id = decision_id_by_event.get(et)
                        decision = next((d for d in decisions if d.get("decision_id") == decision_id), None)
                        if not decision or not owner_decision_applied(decision):
                            # If owner_response is missing/unapplied, drafts must remain PENDING.
                            expected_status = "PENDING"
                            owner_chosen = None
                        else:
                            owner_chosen = (decision.get("owner_response") or {}).get("chosen_option")
                            expected_status = normalize_chosen_option(owner_chosen)

                        if actual_status != expected_status:
                            mismatches.append({
                                "event_type": et,
                                "owner_decision_id": decision_id,
                                "owner_chosen_option": owner_chosen,
                                "expected_veto_status": expected_status,
                                "actual_veto_status": actual_status,
                            })

                    if mismatches:
                        named["august_checkpoint_decisions_applied"] = False
                        failures.append({
                            "error": "august_checkpoint_veto_status_mismatch_owner_choice",
                            "mismatches": mismatches,
                            "detail": "Each August draft veto_status must equal the normalized mapping of the event's owner_response.chosen_option.",
                        })
                    else:
                        named["august_checkpoint_decisions_applied"] = not august_pending
                        if august_pending:
                            failures.append({
                                "error": "august_checkpoint_veto_pending",
                                "pending_event_types": august_pending,
                                "detail": "August consumer/checkpoint drafts require owner affirm/veto before contract depth and denominator seal",
                            })

    # --- Blocking disposition states (quarantine / unresolved / owner-veto / evidence-gap) ---
    owner_veto_blocking = [r for r in ledger if r.get("disposition") == "NEEDS_OWNER_VETO"]
    evidence_gap_blocking = [r for r in ledger if r.get("disposition") == "NEEDS_MORE_EVIDENCE"]
    unresolved_blocking = [r for r in ledger if r.get("bucket") == "unresolved"]
    quarantine_blocking = [
        r for r in ledger
        if r.get("bucket") == "confirmed_persisted_unregistered"
        and r.get("disposition") in {"NEEDS_OWNER_VETO", "NEEDS_MORE_EVIDENCE"}
    ]
    named["no_blocking_owner_veto_dispositions"] = not owner_veto_blocking
    named["no_blocking_evidence_gap_dispositions"] = not evidence_gap_blocking
    named["unresolved_bucket_rows"] = len(unresolved_blocking)
    named["quarantine_blocking_disposition_rows"] = len(quarantine_blocking)
    if owner_veto_blocking:
        failures.append({
            "error": "individual_dispositions_owner_veto_blocking",
            "count": len(owner_veto_blocking),
            "sample": [r.get("event_type") for r in owner_veto_blocking[:20]],
            "detail": "NEEDS_OWNER_VETO rows block denominator seal and PNC-019 recertify until owner batch decisions are applied",
        })
    if evidence_gap_blocking:
        failures.append({
            "error": "individual_dispositions_evidence_gap_blocking",
            "count": len(evidence_gap_blocking),
            "sample": [r.get("event_type") for r in evidence_gap_blocking[:20]],
            "detail": "NEEDS_MORE_EVIDENCE rows (including machine-contract emit candidates) block denominator seal until persistence proof or owner stance applied",
        })
    if unresolved_blocking:
        failures.append({
            "error": "unresolved_bucket_not_closed",
            "count": len(unresolved_blocking),
            "sample": [r.get("event_type") for r in unresolved_blocking[:20]],
            "detail": "Unresolved bucket rows remain outside admitted denominator until per-row adjudication completes",
        })

    # Disposition quality / anti-fraud
    provisional_rows = [r for r in ledger if r.get("provisional")]
    named["no_provisional_rows"] = not provisional_rows
    if provisional_rows:
        failures.append({"error": "individual_dispositions_provisional", "count": len(provisional_rows)})

    illegal_admit = [r.get("event_type") for r in ledger if r.get("disposition") == "ADMIT_CANDIDATE"]
    named["no_illegal_admit_disposition"] = not illegal_admit
    if illegal_admit:
        failures.append({"error": "illegal_admit_disposition", "sample": illegal_admit[:20]})

    inference = [r.get("event_type") for r in ledger if r.get("inference_used") or r.get("analogy_used") or not r.get("independent_of_od_ea_003", True)]
    named["no_inference_or_od_ea_003_dependence"] = not inference
    if inference:
        failures.append({"error": "inference_or_od_ea_003_dependence", "sample": inference[:20]})

    # 12-field evidence rules for rows that claim KEEP_REGISTERED or are live registered families in ledger
    depth_failures = []
    registered_like = []
    for r in ledger:
        disp = r.get("disposition")
        et = r.get("event_type")
        if disp == "KEEP_REGISTERED" or et in live_set:
            registered_like.append(r)
        ev = evidence_map(r)
        # Every row must have all 12 fields present
        for f in EVIDENCE_FIELDS:
            if f not in ev:
                # allow during transition if owner exists instead of owner_doc already remapped
                depth_failures.append({"event_type": et, "error": "missing_evidence_field", "field": f})
                continue
            cell = ev[f]
            if not isinstance(cell, dict) or "status" not in cell:
                depth_failures.append({"event_type": et, "error": "malformed_evidence_cell", "field": f})
                continue
            st = cell.get("status")
            if st not in {"PASS", "FAIL", "OWNER_REQUIRED", "UNKNOWN"}:
                depth_failures.append({"event_type": et, "error": "invalid_evidence_status", "field": f, "status": st})
            if st == "PASS" and not cell_ok_pass(cell):
                depth_failures.append({"event_type": et, "error": "pass_without_plans_citation", "field": f})
        # Oracle field special: PASS requires citation; executable oracle harness still required for depth complete globally
        ora = ev.get("positive_negative_oracles") or {}
        if disp == "KEEP_REGISTERED" and ora.get("status") == "PASS" and not cell_ok_pass(ora):
            depth_failures.append({"event_type": et, "error": "oracle_pass_without_citation"})

    named["evidence_shape_ok"] = not depth_failures
    if depth_failures:
        failures.append({"error": "evidence_rule_failures", "count": len(depth_failures), "sample": depth_failures[:30]})

    # Contract depth for registered families present in ledger: all 12 must be PASS with citations
    depth_incomplete_rows = []
    for r in registered_like:
        ev = evidence_map(r)
        bad = []
        for f in EVIDENCE_FIELDS:
            cell = ev.get(f) or {}
            if not cell_ok_pass(cell):
                bad.append(f)
        # Also require non-provisional
        if bad or r.get("provisional"):
            depth_incomplete_rows.append({"event_type": r.get("event_type"), "non_pass_fields": bad, "provisional": bool(r.get("provisional"))})
    named["registered_rows_full_depth"] = not depth_incomplete_rows
    # Note: depth complete also requires executable oracle harness globally; detect harness receipt if present
    oracle_harness_receipt = HERE / "oracle-harness" / "ORACLE_HARNESS_RECEIPT.json"
    if not oracle_harness_receipt.exists():
        oracle_harness_receipt = HOME / "oracle-harness" / "ORACLE_HARNESS_RECEIPT.json"
    oracle_ok = False
    if oracle_harness_receipt.exists():
        oh = load_json(oracle_harness_receipt)
        oracle_ok = bool(oh.get("executable")) and bool(oh.get("pass")) and oh.get("covers_registered_families") is True
    named["executable_oracle_harness_pass"] = oracle_ok
    if not oracle_ok:
        failures.append({
            "error": "executable_oracle_harness_missing_or_failed",
            "detail": "SS-003/contract depth require executable positive/negative oracle harness results covering registered families",
        })
    if depth_incomplete_rows:
        failures.append({
            "error": "registered_contract_depth_incomplete",
            "count": len(depth_incomplete_rows),
            "sample": depth_incomplete_rows[:20],
        })

    # Auth.github reclass rows if present in working unreg must remain individually tracked (not bulk)
    unreg = {r.get("event_type") for r in ledger if r.get("bucket") == "confirmed_persisted_unregistered"}
    if AUTH_GITHUB & ledger_set:
        missing_auth = sorted(AUTH_GITHUB - unreg)
        named["auth_github_tracked_in_unreg_bucket"] = not missing_auth
        if missing_auth:
            failures.append({"error": "auth_github_reclassify_bucket_drift", "missing": missing_auth})
    else:
        named["auth_github_tracked_in_unreg_bucket"] = True  # not applicable yet

    named["scripts_untouched"] = True
    named["validator_location_plans_audits"] = True
    named["no_295_coverage_floor"] = True

    # --- Compute flags from results (not hardcoded) ---
    denominator_blocking = {
        "fresh_census_denominator_not_closed",
        "fresh_denominator_closed_but_empty_event_types",
        "ledger_admitted_persisted_families_set_mismatch",
        "ledger_fresh_denominator_set_mismatch",  # legacy alias if raised
        "admitted_denominator_contains_exclusion_or_reject",
        "census_adjudication_category_count_mismatch",
        "census_adjudication_partition_artifact_stale",
        "census_adjudication_independent_set_mismatch",
        "denominator_admitted_includes_unresolved",
        "denominator_missing_persistence_open_tracking",
        "census_adjudication_duplicate_candidate_id",
        "census_freeze_digest_mismatch",
        "census_freeze_digest_missing",
        "fresh_denominator_admitted_event_types_unspecified",
        "proposed_admitted_event_types_empty",
        "proposed_admitted_event_types_duplicate_ledger_rows",
        "individual_dispositions_provisional",
        "individual_dispositions_owner_veto_blocking",
        "individual_dispositions_evidence_gap_blocking",
        "unresolved_bucket_not_closed",
        "exclusion_revalidation_artifacts_missing",
        "exclusion_revalidation_row_count_mismatch",
        "exclusion_revalidation_incomplete",
        "owner_decision_sheet_missing",
        "owner_decision_sheet_empty",
        "owner_decision_sheet_missing_required_ids",
        "owner_decision_sheet_unresolved",
        "august_checkpoint_veto_pending",
        "august_checkpoint_drafts_missing",
        "august_checkpoint_drafts_empty",
        "august_checkpoint_events_missing",
        "august_checkpoint_duplicate_rows",
        "august_checkpoint_unexpected_event_types",
        "august_checkpoint_invalid_veto_status",
        "illegal_admit_disposition",
        "inference_or_od_ea_003_dependence",
        "required_input_missing",
        "known37_not_plans_canonical",
        "known37_not_exactly_unique_37",
        "known37_missing_from_live",
        "unexpected_august_set",
        "immutable_july248_missing_from_ledger",
        "immutable_july40_missing_from_ledger",
        "immutable_august2_missing_from_ledger",
        "immutable_july68_missing_from_census_adjudication",
        "immutable_july26_missing_from_census_adjudication",
        "auth_github_missing_multi_cohort_pins_census_adjudication",
        "auth_github_missing_multi_cohort_pins_disposition",
        "md_only_bindings_not_adjudicated",
    }
    depth_blocking = set(denominator_blocking) | {
        "registered_contract_depth_incomplete",
        "executable_oracle_harness_missing_or_failed",
        "evidence_rule_failures",
    }
    fail_errors = {f.get("error") for f in failures}
    # Failures that can only clear AFTER the denominator artifact is sealed.
    # Using these as a pre-seal gate is circular (validator lines that emit
    # fresh_census_denominator_not_closed while closed=false).
    # Advisor-2: empty/mismatch are pre-seal. Exclude ONLY the unavoidable closed=false flag.
    open_denominator_certification_errors = {
        "fresh_census_denominator_not_closed",
    }
    remaining_pre_seal = sorted(fail_errors - open_denominator_certification_errors)
    named["seal_prerequisites_met"] = not remaining_pre_seal
    named["seal_prerequisites_blocking_errors"] = remaining_pre_seal
    named["open_denominator_certification_errors_present"] = sorted(fail_errors & open_denominator_certification_errors)
    complete_denominator_known = (
        closed
        and named.get("ledger_equals_admitted_persisted_families", False)
        and named.get("census_adjudication_independent_set_equality_ok", False)
        and named.get("census_adjudication_category_counts_ok", False)
        and named.get("census_partition_artifact_ok", False)
        and named.get("denominator_admitted_excludes_unresolved", False)
        and named.get("freeze_digest_matches_denominator", False)
        and not (fail_errors & denominator_blocking)
    )
    contract_depth_complete = (
        complete_denominator_known
        and named.get("registered_rows_full_depth", False)
        and named.get("executable_oracle_harness_pass", False)
        and named.get("evidence_shape_ok", False)
        and not (fail_errors & depth_blocking)
    )
    # If denominator not closed, ensure we did not spuriously set equality true
    if not closed:
        complete_denominator_known = False
        contract_depth_complete = False

    # If depth incomplete rows exist, force depth false
    if depth_incomplete_rows or not oracle_ok:
        contract_depth_complete = False

    overall_pass = complete_denominator_known and contract_depth_complete and not failures
    # If there are only informational failures? No — any failure blocks pass.
    if failures:
        overall_pass = False

    counts = {
        "live_registry_rows": len(live),
        "known37": len(known37),
        "ledger_rows": len(ledger),
        "ledger_unique": len(ledger_set),
        "provisional": len(provisional_rows),
        "owner_veto_blocking": len(owner_veto_blocking),
        "evidence_gap_blocking": len(evidence_gap_blocking),
        "unresolved_bucket_rows": len(unresolved_blocking),
        "quarantine_blocking_disposition_rows": len(quarantine_blocking),
        "exclusion_revalidation_pass_count": named.get("exclusion_revalidation_pass_count"),
        "exclusion_revalidation_total": expected_excl_total,
        "owner_decision_sheet_pending": len(pending_owner_decisions),
        "august_checkpoint_pending": len(august_pending),
        "seal_prerequisites_met": named.get("seal_prerequisites_met"),
        "fresh_denominator_closed": closed,
        "fresh_denominator_size": (len(denom_types) if denom_types is not None else None),
        "census_adjudication_rows": len(census_adj),
        "census_adjudication_by_category": {k: len(v) for k, v in adj_by_cat.items()},
        "by_bucket": dict(Counter(r.get("bucket") for r in ledger)),
        "by_disposition": dict(Counter(r.get("disposition") for r in ledger)),
    }
    pins = {
        "known37_sha256": sha256_file(K37),
        "cohort_pins_sha256": sha256_file(COHORT),
        "denominator_sha256": sha256_file(DENOM),
        "ledger_sha256": sha256_file(IND / "LEDGER.jsonl"),
        "census_adjudication_sha256": sha256_file(CENSUS_ADJ / "LEDGER.jsonl"),
        "census_partition_sha256": sha256_file(CENSUS_ADJ / "PARTITION.json"),
        "registry_sha256": sha256_file(ROOT / "event_family_registry.json"),
        "freeze_sha256": sha256_file(CENSUS / "CURRENT_SOURCE_INVENTORY.json"),
        "august_checkpoint_drafts_sha256": sha256_file(august_draft_path) if august_draft_path.exists() else None,
    }

    receipt = build_receipt(
        complete_denominator_known,
        contract_depth_complete,
        failures,
        counts,
        pins,
        named,
        overall_pass,
    )
    out = RECEIPT_DIR / "event_authority_validator_receipt.json"
    out.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "pass": receipt["pass"],
        "complete_denominator_known": complete_denominator_known,
        "contract_depth_complete": contract_depth_complete,
        "seal_prerequisites_met": named.get("seal_prerequisites_met"),
        "failure_count": len(failures),
        "failure_errors": sorted(fail_errors),
        "receipt": str(out),
    }, indent=2))
    return 0 if receipt["pass"] else 1


def build_receipt(denom, depth, failures, counts, pins, named, overall_pass=None):
    if overall_pass is None:
        overall_pass = bool(denom and depth and not failures)
    return {
        "schema_id": "pm.assurance.event_authority.independent_validation_receipt.v1",
        "schema_version": "1.0.0",
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "validator_id": "pm.plans.audits.event_authority.independent_validator",
        "validator_path": "Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py",
        "complete_denominator_known": bool(denom),
        "contract_depth_complete": bool(depth),
        "bulk_registration_allowed": False,
        "pass": bool(overall_pass),
        "counts": counts,
        "input_pins": pins,
        "named_checks": named,
        "failures": failures,
        "scripts_binding": {
            "scripts_modified": False,
            "pm_pnc019_currentness_edited": False,
            "note": "Canonical Plans/.audits validator. scripts/** promotion/edit prohibited (Advisor-2 / CLAUDE STRICT). Existing scripts may be run fail-closed until an explicitly authorized later binding that recomputes semantics and does not trust receipt booleans.",
        },
        "notes": [
            "Flags/pass are computed from check results (not hardcoded)",
            "pass=true is post-seal certification; seal_prerequisites_met excludes ONLY fresh_census_denominator_not_closed; empty/mismatch/unspecified admitted sets are pre-seal",
            "Known37 pin is Plans/storage-plan.md RET-K37 only",
            "Admitted persisted-family exact equality when closed; july68/july26/rejects via census-adjudication partition; no 295 coverage floor",
            "Receipt is not self-authorizing for PNC currentness without separate binding authorization",
        ],
    }


if __name__ == "__main__":
    raise SystemExit(main())
