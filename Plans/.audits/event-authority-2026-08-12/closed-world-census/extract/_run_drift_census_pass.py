#!/usr/bin/env python3
"""Drift census pass over 10 canonical Plans sources vs frozen inventory.

Discovery-only: no admission inference (CENSUS_ADMISSION_RULE_V2).
Writes extract/drift_sources/*.json and updates EXTRACT_SUMMARY.json drift_census_pass.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[5]
AUDIT = REPO / "Plans/.audits/event-authority-2026-08-12"
CENSUS = AUDIT / "closed-world-census"
EXTRACT = CENSUS / "extract"
DRIFT_DIR = EXTRACT / "drift_sources"
BINDING_SCAN = CENSUS / "admission/_run_full_binding_scan.py"
TOKEN_RE = re.compile(r"\b([a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+)\b")

DRIFT_PATHS = [
    "Plans/00-plans-index.md",
    "Plans/Automated_Testing_System.md",
    "Plans/FileManager.md",
    "Plans/FinalGUISpec.md",
    "Plans/GUI_Rebuild_Requirements_Checklist.md",
    "Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json",
    "Plans/UI_Command_Catalog.md",
    "Plans/UI_Wiring_Rules.md",
    "Plans/Widget_System.md",
    "Plans/Wiring_Matrix.production.json",
]


def now_utc() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def safe_filename(path: str) -> str:
    return path.replace("/", "__").replace("\\", "__")


def git_frozen_bytes(rel_path: str, frozen_sha: str) -> bytes | None:
    out = subprocess.run(
        ["git", "log", "-50", "--format=%H", "--", rel_path],
        capture_output=True,
        text=True,
        cwd=REPO,
    )
    for commit in out.stdout.strip().splitlines():
        blob = subprocess.run(["git", "show", f"{commit}:{rel_path}"], capture_output=True, cwd=REPO)
        if blob.returncode == 0 and hashlib.sha256(blob.stdout).hexdigest() == frozen_sha:
            return blob.stdout
    return None


def full_lexical_tokens(text: str) -> dict[str, list[int]]:
    found: dict[str, set[int]] = {}
    for i, line in enumerate(text.splitlines(), 1):
        for m in TOKEN_RE.finditer(line):
            found.setdefault(m.group(1), set()).add(i)
    return {k: sorted(v) for k, v in sorted(found.items())}


def ledger_tokens_for_path(path: str) -> set[str]:
    tokens: set[str] = set()
    with (EXTRACT / "OCCURRENCE_LEDGER.jsonl").open(encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            row = json.loads(line)
            for c in row.get("citations", []):
                if c.get("path") == path:
                    tokens.add(row["event_type"])
                    break
    return tokens


def load_binding_scan_ns() -> dict[str, Any]:
    src = BINDING_SCAN.read_text(encoding="utf-8").replace(
        "REPO = Path(__file__).resolve().parents[5]",
        f"REPO = Path(r'{REPO}')",
    )
    ns: dict[str, Any] = {"__builtins__": __builtins__}
    exec(src, ns)
    return ns


def contract_extract(text: str, rel_path: str, is_json: bool, ns: dict[str, Any]) -> dict[str, Any]:
    bindings: list[dict] = []
    md_tokens: set[str] = set()
    json_tokens: set[str] = set()
    triple_accum: dict[str, dict] = {}
    if is_json:
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            data = None
        if data is not None:
            ns["ingest_json_object"](data, rel_path, json_tokens, triple_accum)
    else:
        ns["parse_markdown_source"](text, rel_path, bindings, md_tokens, json_tokens, triple_accum)
    for meta in triple_accum.values():
        meta["entry_ids"] = sorted(set(meta["entry_ids"]))
        meta["ui_command_ids"] = sorted(set(meta["ui_command_ids"]))
        meta["sources"] = sorted(meta["sources"])

    def binding_key(b: dict) -> tuple:
        return (b["event_type"], b.get("ui_command_id"), b.get("parser"), b.get("row_text"))

    return {
        "lexical_tokens": sorted(json_tokens | md_tokens),
        "triple_bound": {k: triple_accum[k] for k in sorted(triple_accum)},
        "md_bindings": bindings,
        "md_binding_keys": sorted(binding_key(b) for b in bindings),
    }


def main() -> int:
    now = now_utc()
    ns = load_binding_scan_ns()
    inv = json.loads((CENSUS / "CURRENT_SOURCE_INVENTORY.json").read_text(encoding="utf-8"))
    frozen_map = {r["path"]: r for r in inv["sources"]}
    freeze_digest = inv["canonical_digest_sha256"]
    DRIFT_DIR.mkdir(parents=True, exist_ok=True)
    per_source_rows: list[dict] = []
    totals: dict[str, int] = defaultdict(int)

    for rel_path in DRIFT_PATHS:
        fr = frozen_map[rel_path]
        live_fp = REPO / rel_path
        live_data = live_fp.read_bytes()
        live_sha = hashlib.sha256(live_data).hexdigest()
        live_bytes = len(live_data)
        frozen_sha = fr["sha256"]
        frozen_bytes = fr["bytes"]
        is_json = rel_path.endswith(".json")

        frozen_content = git_frozen_bytes(rel_path, frozen_sha)
        frozen_text = frozen_content.decode("utf-8", errors="replace") if frozen_content else None
        live_text = live_fp.read_text(encoding="utf-8", errors="replace")

        frozen_full = full_lexical_tokens(frozen_text) if frozen_text else {}
        live_full = full_lexical_tokens(live_text)
        fs, fss = set(frozen_full), set(live_full)
        new_full = sorted(fss - fs)
        removed_full = sorted(fs - fss)
        changed_lines = sorted(t for t in (fss & fs) if live_full[t] != frozen_full[t])

        frozen_contract = contract_extract(frozen_text, rel_path, is_json, ns) if frozen_text else None
        live_contract = contract_extract(live_text, rel_path, is_json, ns)
        ledger_tokens = ledger_tokens_for_path(rel_path)

        if frozen_contract:
            fcl = set(frozen_contract["lexical_tokens"])
            ft = set(frozen_contract["triple_bound"])
            fm = set(frozen_contract["md_binding_keys"])
        else:
            fcl, ft, fm = set(), set(), set()
        lcl = set(live_contract["lexical_tokens"])
        lt = set(live_contract["triple_bound"])
        lm = set(live_contract["md_binding_keys"])
        ncl = sorted(lcl - fcl)
        rcl = sorted(fcl - lcl)
        nt = sorted(lt - ft)
        rt = sorted(ft - lt)
        nm = sorted(lm - fm)
        rm = sorted(fm - lm)

        totals["new_full_lexical_tokens"] += len(new_full)
        totals["removed_full_lexical_tokens"] += len(removed_full)
        totals["changed_line_context_tokens"] += len(changed_lines)
        totals["new_contract_lexical_tokens"] += len(ncl)
        totals["removed_contract_lexical_tokens"] += len(rcl)
        totals["new_triple_bound_tokens"] += len(nt)
        totals["removed_triple_bound_tokens"] += len(rt)
        totals["new_md_bindings"] += len(nm)
        totals["removed_md_bindings"] += len(rm)

        row = {
            "schema_id": "pm.assurance.event_authority.drift_source_census_row.v1",
            "generated_at_utc": now,
            "path": rel_path,
            "source_class": fr["source_class"],
            "frozen": {"bytes": frozen_bytes, "sha256": frozen_sha},
            "live": {"bytes": live_bytes, "sha256": live_sha},
            "drift": live_sha != frozen_sha or live_bytes != frozen_bytes,
            "byte_delta": live_bytes - frozen_bytes,
            "frozen_content_recovered": frozen_text is not None,
            "freeze_baseline": {
                "inventory": "closed-world-census/CURRENT_SOURCE_INVENTORY.json",
                "occurrence_ledger_frozen_token_count": len(ledger_tokens),
            },
            "event_type_mentions": {
                "live_full_lexical_count": len(fss),
                "frozen_full_lexical_count": len(fs),
                "new_full_lexical_tokens": new_full,
                "removed_full_lexical_tokens": removed_full,
                "changed_line_context_tokens": [
                    {"event_type": t, "frozen_lines": frozen_full[t], "live_lines": live_full[t]}
                    for t in changed_lines
                ],
                "new_vs_ledger_tokens": sorted(fss - ledger_tokens),
                "removed_vs_ledger_tokens": sorted(ledger_tokens - fss),
                "live_contract_lexical_count": len(lcl),
                "frozen_contract_lexical_count": len(fcl),
                "new_contract_lexical_tokens": ncl,
                "removed_contract_lexical_tokens": rcl,
            },
            "contract_references": {
                "live_triple_bound_count": len(lt),
                "frozen_triple_bound_count": len(ft),
                "new_triple_bound_tokens": nt,
                "removed_triple_bound_tokens": rt,
                "new_triple_bound_detail": [live_contract["triple_bound"][t] for t in nt],
                "removed_triple_bound_detail": (
                    [frozen_contract["triple_bound"][t] for t in rt] if frozen_contract else []
                ),
                "new_md_binding_count": len(nm),
                "removed_md_binding_count": len(rm),
                "new_md_bindings": [
                    b
                    for b in live_contract["md_bindings"]
                    if (b["event_type"], b.get("ui_command_id"), b.get("parser"), b.get("row_text")) in nm
                ],
                "removed_md_bindings": (
                    [
                        b
                        for b in frozen_contract["md_bindings"]
                        if (b["event_type"], b.get("ui_command_id"), b.get("parser"), b.get("row_text")) in rm
                    ]
                    if frozen_contract
                    else []
                ),
            },
            "admission_claim": False,
            "denominator_effect": "none_until_adjudicated",
            "notes": [
                "Discovery-only drift pass; no admission inference per CENSUS_ADMISSION_RULE_V2.",
                "full_lexical uses dotted lowercase token regex on file text; not admission.",
            ],
        }
        (DRIFT_DIR / f"{safe_filename(rel_path)}.json").write_text(json.dumps(row, indent=2) + "\n", encoding="utf-8")
        per_source_rows.append(
            {
                "path": rel_path,
                "artifact": f"closed-world-census/extract/drift_sources/{safe_filename(rel_path)}.json",
                "byte_delta": row["byte_delta"],
                "live_sha256": live_sha,
                "frozen_sha256": frozen_sha,
                "new_full_lexical": len(new_full),
                "removed_full_lexical": len(removed_full),
                "changed_line_context": len(changed_lines),
                "new_contract_lexical": len(ncl),
                "removed_contract_lexical": len(rcl),
                "new_triple_bound": len(nt),
                "removed_triple_bound": len(rt),
                "new_md_bindings": len(nm),
                "removed_md_bindings": len(rm),
            }
        )

    summary = json.loads((EXTRACT / "EXTRACT_SUMMARY.json").read_text(encoding="utf-8"))
    summary["generated_at_utc"] = now
    summary["drift_census_pass"] = {
        "schema_id": "pm.assurance.event_authority.drift_census_pass.v1",
        "generated_at_utc": now,
        "freeze_digest_sha256": freeze_digest,
        "drift_source_count": len(DRIFT_PATHS),
        "inventory_match_count": 170,
        "inventory_drift_count": 10,
        "admission_rule": "DIRECT_EVENT_TYPE_BINDING_REQUIRED",
        "admission_rule_artifact": "closed-world-census/admission/CENSUS_ADMISSION_RULE_V2.md",
        "totals": dict(totals),
        "per_source_index": per_source_rows,
        "admission_claim": False,
        "denominator_closed": False,
        "notes": [
            "Drift pass over 10 canonical Plans sources with live SHA-256 vs frozen inventory.",
            "New/changed mentions are lexical/contract discovery only; not denominator admission.",
        ],
    }
    (EXTRACT / "EXTRACT_SUMMARY.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"generated_at_utc": now, "totals": dict(totals), "per_source_index": per_source_rows}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
