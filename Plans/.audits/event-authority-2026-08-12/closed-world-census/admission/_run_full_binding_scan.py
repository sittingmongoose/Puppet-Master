#!/usr/bin/env python3
"""Full 180-source machine-contract event binding scan v3 (Advisor-2 blocker)."""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[5]
AUDIT = REPO / "Plans/.audits/event-authority-2026-08-12"
TOKEN_RE = re.compile(r"^[a-z][a-z0-9_]*(?:\.[a-z0-9_]+)+$")
CMD_RE = re.compile(r"`(cmd\.[a-z][a-z0-9_.]*)`|^(cmd\.[a-z][a-z0-9_.]*)$")
NO_PERSIST_RE = re.compile(
    r"no persisted|none\s*[—\-]\s*ui-only|\(none|receipt-only|clipboard|navigation\)",
    re.I,
)
JSON_FENCE_RE = re.compile(r"```json\s*\n(.*?)\n```", re.DOTALL)
V2_TRIPLE_BOUND_BASELINE = 77
V2_MISSING_FROM_LEDGER_BASELINE = [
    "docker.host.access_open_requested",
    "docker.host.instance_lifecycle_requested",
    "docker.host.instance_retention_recorded",
    "docker.host.preflight_requested",
    "docker.host.profile_saved",
    "docker.host.receipt_opened",
    "docker.host.refresh_requested",
    "docker.host.session_launch_requested",
    "docker.hosts_route_opened",
    "github.actions.dispatch_readiness_validated",
    "github.actions.readiness_compared",
    "github.repo.create_requested",
    "health.route_opened",
    "plan_compile.run_created_or_bound",
    "planning.approval_cas_receipt.written",
    "planning.plan_approved",
    "prd_builder.approval_snapshot.created",
    "prd_builder.prd_pack_approved",
    "project.github_repo_bound",
    "remote.reconnect.requested",
    "testing.session.backgrounded",
    "testing.session.opened",
    "testing.session.redaction_inspected",
    "testing.session.watch_started",
]
V3_SCHEMA_ID = "pm.assurance.event_authority.machine_contract_event_binding_scan.v3"
# Default freeze pin. Recensus candidate is an --inventory input-path override only.
# Never rewrite CURRENT_SOURCE_INVENTORY.json and never seal denominator_closed.
SOURCE_INVENTORY_REL = "closed-world-census/CURRENT_SOURCE_INVENTORY.json"
SOURCE_INVENTORY_REPO_PATH = (
    "Plans/.audits/event-authority-2026-08-12/closed-world-census/"
    "CURRENT_SOURCE_INVENTORY.json"
)
PRIOR_V3_SCAN_095827 = {
    "generated_at_utc": "2026-08-12T09:58:27Z",
    "canonical_digest_sha256": (
        "b93ef8493d91b69beefbcfc9498e72fc01af9cabbbcd9259e684f3c15e540d56"
    ),
    "source_inventory_path": (
        "Plans/.audits/event-authority-2026-08-12/closed-world-census/"
        "CURRENT_SOURCE_INVENTORY.json"
    ),
    "triple_bound_tokens": [
        "alert.acknowledged",
        "alert.dismissed",
        "alert.rule_muted",
        "alert.snoozed",
        "browser.context_captured",
        "browser.context_share_revoked",
        "browser.context_shared",
        "browser.session.closed",
        "browser.session.created",
        "browser.session.promoted",
        "browser.session.state_changed",
        "browser.session.takeover_state_changed",
        "chat.message.submitted",
        "concern.assigned",
        "concern.created",
        "concern.evidence_linked",
        "concern.promoted",
        "concern.reopened",
        "concern.resolved",
        "concern.updated",
        "dashboard.widget_added",
        "dev.session.stopped",
        "docker.host.access_open_requested",
        "docker.host.instance_lifecycle_requested",
        "docker.host.instance_retention_recorded",
        "docker.host.preflight_requested",
        "docker.host.profile_saved",
        "docker.host.receipt_opened",
        "docker.host.refresh_requested",
        "docker.host.session_launch_requested",
        "docker.hosts_route_opened",
        "file.created",
        "file.deleted",
        "file.renamed",
        "folder.created",
        "github.actions.dispatch_readiness_validated",
        "github.actions.readiness_compared",
        "github.repo.create_requested",
        "goal.replanned",
        "goal_run.stopped",
        "health.route_opened",
        "model.catalog_refreshed",
        "node.unblocked",
        "onboarding.free_models_refresh_retried",
        "onboarding.free_models_refreshed",
        "onboarding.provider_setup_opened",
        "panel.redocked",
        "panel.undocked",
        "persona.created",
        "persona.deleted",
        "persona.exported",
        "persona.imported",
        "persona.selected",
        "persona.updated",
        "plan_compile.run_created_or_bound",
        "planning.approval_cas_receipt.written",
        "planning.plan_approved",
        "prd_builder.approval_snapshot.created",
        "prd_builder.prd_pack_approved",
        "project.github_repo_bound",
        "remote.reconnect.requested",
        "restore_point.applied",
        "restore_point.created",
        "restore_point.deleted",
        "runtime_artifact.created",
        "safe_point.restored",
        "scheduler.pass",
        "settings.theme.updated",
        "settings.updated",
        "terminal.workgroup_moved",
        "testing.capability_policy.updated",
        "testing.session.backgrounded",
        "testing.session.opened",
        "testing.session.redaction_inspected",
        "testing.session.watch_started",
        "testing.visibility_policy.updated",
        "workspace.layout_changed",
    ],
    "md_only": [
        "auth.github.disconnected",
        "chat.thread.created",
        "file.exported",
        "folder.deleted",
        "folder.exported",
        "folder.renamed",
        "git.clone.completed",
        "memory.dedup_sweep.completed",
        "memory.dedup_sweep.started",
        "memory.gist.discarded",
        "memory.gist.pinned",
        "memory.gist.unpinned",
        "memory.gist.updated",
        "memory.gist.verification_failed",
        "memory.gist.verification_requested",
        "memory.gist.verified",
        "memory.index.lexical.rebuild.completed",
        "memory.index.lexical.rebuild.started",
        "memory.index.semantic.rebuild.completed",
        "memory.index.semantic.rebuild.started",
        "memory.monthly_summary.completed",
        "memory.monthly_summary.started",
        "memory.prune_archive.completed",
        "memory.prune_archive.started",
        "memory.verification_sweep.completed",
        "memory.verification_sweep.started",
        "project.added",
        "project.created",
        "tool.denied",
        "wizard.deferred_payload.loaded",
        "wizard.opened",
    ],
    "missing_from_census": [],
}


def resolve_source_path(rel_or_abs: str) -> Path:
    p = rel_or_abs.replace("P:/", "").replace("P:\\", "").replace("/", "\\")
    for candidate in (REPO / p, Path(rel_or_abs)):
        if candidate.exists():
            return candidate
    return REPO / p


def rel_norm_path(fp: Path, fallback: str) -> str:
    try:
        return str(fp.relative_to(REPO)).replace("\\", "/")
    except ValueError:
        return fallback.replace("\\", "/")


def tokenize_event_text(text: str) -> list[str]:
    if not text or NO_PERSIST_RE.search(text):
        return []
    cleaned = re.sub(r"`([^`]+)`", r"\1", text.strip())
    cleaned = re.sub(r"\([^)]*\)", "", cleaned)
    tokens: list[str] = []
    for part in re.split(r"\s+or\s+|,\s*|/\s*", cleaned, flags=re.I):
        token = part.strip().strip("`").strip()
        if not token:
            continue
        token = re.sub(r"^terminal:\s*", "", token, flags=re.I)
        token = re.sub(r"\s+\(.*$", "", token).strip()
        if TOKEN_RE.match(token):
            tokens.append(token)
    return tokens


def scan_node_tokens(node: dict, out: set[str]) -> None:
    effect_contract = node.get("effect_contract")
    if isinstance(effect_contract, dict):
        refs = effect_contract.get("receipt_or_event_refs")
        if refs:
            vals = refs if isinstance(refs, list) else [refs]
            for token in vals:
                if isinstance(token, str) and TOKEN_RE.match(token):
                    out.add(token)
    for field in ("expected_event_types", "receipt_or_event_refs"):
        if field not in node or not node[field]:
            continue
        vals = node[field] if isinstance(node[field], list) else [node[field]]
        for token in vals:
            if isinstance(token, str) and TOKEN_RE.match(token):
                out.add(token)
    for value in node.values():
        if isinstance(value, dict):
            scan_node_tokens(value, out)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    scan_node_tokens(item, out)


def scan_json_tokens(data: object) -> set[str]:
    tokens: set[str] = set()
    if isinstance(data, dict):
        scan_node_tokens(data, tokens)
    return tokens


def scan_wiring_entries(
    data: dict, rel_path: str
) -> tuple[dict[str, dict], set[str]]:
    triple: dict[str, dict] = {}
    json_tokens: set[str] = set()
    entries = data.get("entries")
    if not isinstance(entries, dict):
        return triple, json_tokens
    for entry_id, entry in entries.items():
        if not isinstance(entry, dict):
            continue
        expected = entry.get("expected_event_types") or []
        if isinstance(expected, str):
            expected = [expected]
        for token in expected:
            if isinstance(token, str) and TOKEN_RE.match(token):
                json_tokens.add(token)
        effect_contract = entry.get("effect_contract") or {}
        effect_kind = effect_contract.get("effect_kind")
        refs = effect_contract.get("receipt_or_event_refs") or []
        if isinstance(refs, str):
            refs = [refs]
        for token in refs:
            if isinstance(token, str) and TOKEN_RE.match(token):
                json_tokens.add(token)
        if effect_kind != "event":
            continue
        exp_set = {
            t
            for t in expected
            if isinstance(t, str) and TOKEN_RE.match(t)
        }
        ref_set = {
            t for t in refs if isinstance(t, str) and TOKEN_RE.match(t)
        }
        for token in exp_set & ref_set:
            rec = triple.setdefault(
                token,
                {
                    "event_type": token,
                    "entry_ids": [],
                    "ui_command_ids": [],
                    "sources": [],
                },
            )
            rec["entry_ids"].append(entry_id)
            ui_cmd = entry.get("ui_command_id")
            if ui_cmd:
                rec["ui_command_ids"].append(ui_cmd)
            if rel_path not in rec["sources"]:
                rec["sources"].append(rel_path)
    for meta in triple.values():
        meta["entry_ids"] = sorted(set(meta["entry_ids"]))
        meta["ui_command_ids"] = sorted(set(meta["ui_command_ids"]))
        meta["sources"] = sorted(meta["sources"])
    return triple, json_tokens


def parse_pipe_table(
    lines: list[str], start_idx: int
) -> tuple[list[str], list[list[str]], int]:
    headers = [cell.strip().strip("`") for cell in lines[start_idx].strip("|").split("|")]
    idx = start_idx + 1
    if idx < len(lines) and re.match(r"^\|\s*[-:]+", lines[idx]):
        idx += 1
    rows: list[list[str]] = []
    while idx < len(lines) and lines[idx].strip().startswith("|"):
        if re.match(r"^\|\s*[-:]+", lines[idx]):
            idx += 1
            continue
        rows.append([cell.strip() for cell in lines[idx].strip().strip("|").split("|")])
        idx += 1
    return headers, rows, idx


def add_md_binding(
    bindings: list[dict],
    md_tokens: set[str],
    *,
    token: str,
    source: str,
    parser: str,
    ui_command_id: str | None,
    row_text: str,
    ui_element_id: str | None = None,
) -> None:
    md_tokens.add(token)
    bindings.append(
        {
            "binding_kind": "md_expected_event_binding",
            "event_type": token,
            "ui_command_id": ui_command_id,
            "ui_element_id": ui_element_id,
            "source": source,
            "parser": parser,
            "row_text": row_text,
        }
    )


def parse_command_catalog_md(
    text: str, rel_path: str, bindings: list[dict], md_tokens: set[str]
) -> None:
    lines = text.splitlines()
    idx = 0
    while idx < len(lines):
        line = lines[idx]
        if "| Command ID |" in line and "Expected events" in line:
            headers, rows, idx = parse_pipe_table(lines, idx)
            try:
                cmd_col = headers.index("Command ID")
                evt_col = headers.index("Expected events")
            except ValueError:
                continue
            for row in rows:
                if len(row) <= max(cmd_col, evt_col):
                    continue
                cmd_match = CMD_RE.search(row[cmd_col]) or re.search(
                    r"(cmd\.[a-z][a-z0-9_.]*)", row[cmd_col]
                )
                if not cmd_match:
                    continue
                ui_cmd = cmd_match.group(1)
                for token in tokenize_event_text(row[evt_col]):
                    add_md_binding(
                        bindings,
                        md_tokens,
                        token=token,
                        source=rel_path,
                        parser="command_catalog_table",
                        ui_command_id=ui_cmd,
                        row_text=row[evt_col],
                    )
            continue
        header_match = re.match(
            r"^#{1,6}\s+`?(cmd\.[a-z][a-z0-9_.]*)`?\s*$", line.strip()
        )
        if header_match:
            ui_cmd = header_match.group(1)
            j = idx + 1
            while j < len(lines) and not re.match(r"^#{1,6}\s", lines[j]):
                bullet = re.search(
                    r"^\s*-\s+\*\*Expected events:\*\*\s*(.+)$", lines[j]
                )
                if bullet:
                    for token in tokenize_event_text(bullet.group(1)):
                        add_md_binding(
                            bindings,
                            md_tokens,
                            token=token,
                            source=rel_path,
                            parser="command_catalog_bullet",
                            ui_command_id=ui_cmd,
                            row_text=bullet.group(1),
                        )
                j += 1
        idx += 1


def ingest_json_object(
    data: object,
    rel_path: str,
    json_tokens: set[str],
    triple_accum: dict[str, dict],
) -> None:
    json_tokens.update(scan_json_tokens(data))
    found_triple, found_json = (
        scan_wiring_entries(data, rel_path)
        if isinstance(data, dict)
        else ({}, set())
    )
    json_tokens.update(found_json)
    for token, meta in found_triple.items():
        if token not in triple_accum:
            triple_accum[token] = {
                "event_type": token,
                "entry_ids": [],
                "ui_command_ids": [],
                "sources": [],
            }
        triple_accum[token]["entry_ids"].extend(meta["entry_ids"])
        triple_accum[token]["ui_command_ids"].extend(meta["ui_command_ids"])
        for source in meta["sources"]:
            if source not in triple_accum[token]["sources"]:
                triple_accum[token]["sources"].append(source)


def parse_wiring_matrix_md(
    text: str,
    rel_path: str,
    bindings: list[dict],
    md_tokens: set[str],
    json_tokens: set[str],
    triple_accum: dict[str, dict],
) -> None:
    lines = text.splitlines()
    idx = 0
    while idx < len(lines):
        line = lines[idx]
        if (
            line.strip().startswith("|")
            and "ui_element_id" in line
            and "expected_event_types" in line
        ):
            headers, rows, idx = parse_pipe_table(lines, idx)
            try:
                evt_col = headers.index("expected_event_types")
                cmd_col = headers.index("ui_command_id")
                elem_col = headers.index("ui_element_id")
            except ValueError:
                continue
            for row in rows:
                if len(row) <= max(evt_col, cmd_col, elem_col):
                    continue
                if row[elem_col].strip().lower().startswith("ui_element"):
                    continue
                ui_cmd = row[cmd_col].strip().strip("`")
                ui_element_id = row[elem_col].strip().strip("`")
                for token in tokenize_event_text(row[evt_col]):
                    add_md_binding(
                        bindings,
                        md_tokens,
                        token=token,
                        source=rel_path,
                        parser="wiring_matrix_md_table",
                        ui_command_id=ui_cmd if ui_cmd.startswith("cmd.") else None,
                        row_text=row[evt_col],
                        ui_element_id=ui_element_id,
                    )
            continue
        idx += 1
    for match in JSON_FENCE_RE.finditer(text):
        try:
            data = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        ingest_json_object(data, rel_path, json_tokens, triple_accum)


def parse_markdown_source(
    text: str,
    rel_path: str,
    bindings: list[dict],
    md_tokens: set[str],
    json_tokens: set[str],
    triple_accum: dict[str, dict],
) -> None:
    if rel_path.endswith("UI_Command_Catalog.md"):
        parse_command_catalog_md(text, rel_path, bindings, md_tokens)
    if rel_path.endswith("Wiring_Matrix.md"):
        parse_wiring_matrix_md(
            text, rel_path, bindings, md_tokens, json_tokens, triple_accum
        )
        return
    for match in JSON_FENCE_RE.finditer(text):
        try:
            data = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        ingest_json_object(data, rel_path, json_tokens, triple_accum)


def scan_jsonl_bindings(
    path: Path, rel_path: str, json_tokens: set[str], triple_accum: dict[str, dict]
) -> None:
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        ingest_json_object(obj, rel_path, json_tokens, triple_accum)


def load_ledger_ids() -> set[str]:
    ledger_ids: set[str] = set()
    for line in (AUDIT / "census-adjudication/LEDGER.jsonl").read_text(
        encoding="utf-8"
    ).splitlines():
        if not line.strip():
            continue
        ledger_ids.add(json.loads(line)["candidate_id"])
    return ledger_ids


def load_indiv_ids() -> set[str]:
    indiv_ids: set[str] = set()
    for line in (AUDIT / "individual-disposition/LEDGER.jsonl").read_text(
        encoding="utf-8"
    ).splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        indiv_ids.add(row.get("event_type") or row.get("candidate_id"))
    return indiv_ids


def compute_refs_only(wm_data: dict, triple_bound: set[str]) -> list[str]:
    refs_only: list[str] = []
    for entry in (wm_data.get("entries") or {}).values():
        if not isinstance(entry, dict):
            continue
        effect_contract = entry.get("effect_contract") or {}
        if effect_contract.get("effect_kind") != "event":
            continue
        refs = effect_contract.get("receipt_or_event_refs") or []
        if isinstance(refs, str):
            refs = [refs]
        for token in refs:
            if not isinstance(token, str):
                continue
            if not TOKEN_RE.match(token):
                continue
            if token in triple_bound:
                continue
            if token in refs_only:
                continue
            refs_only.append(token)
    return sorted(refs_only)


def dedupe_triple_accum(triple_accum: dict[str, dict]) -> None:
    for meta in triple_accum.values():
        meta["entry_ids"] = sorted(set(meta["entry_ids"]))
        meta["ui_command_ids"] = sorted(set(meta["ui_command_ids"]))
        meta["sources"] = sorted(meta["sources"])


def compare_to_prior_095827(
    triple_bound_tokens: set[str],
    md_only: list[str],
    missing_census: list[str],
) -> dict[str, Any]:
    prior_tb = set(PRIOR_V3_SCAN_095827["triple_bound_tokens"])
    prior_md = set(PRIOR_V3_SCAN_095827["md_only"])
    prior_miss = set(PRIOR_V3_SCAN_095827["missing_from_census"])
    return {
        "prior_generated_at_utc": PRIOR_V3_SCAN_095827["generated_at_utc"],
        "prior_canonical_digest_sha256": PRIOR_V3_SCAN_095827[
            "canonical_digest_sha256"
        ],
        "prior_source_inventory_path": PRIOR_V3_SCAN_095827["source_inventory_path"],
        "prior_triple_bound_token_count": len(prior_tb),
        "fresh_triple_bound_token_count": len(triple_bound_tokens),
        "triple_bound_added": sorted(triple_bound_tokens - prior_tb),
        "triple_bound_removed": sorted(prior_tb - triple_bound_tokens),
        "prior_md_only_count": len(prior_md),
        "fresh_md_only_count": len(md_only),
        "md_only_added": sorted(set(md_only) - prior_md),
        "md_only_removed": sorted(prior_md - set(md_only)),
        "prior_missing_from_census_count": len(prior_miss),
        "fresh_missing_from_census_count": len(missing_census),
        "missing_from_census_added": sorted(set(missing_census) - prior_miss),
        "missing_from_census_removed": sorted(prior_miss - set(missing_census)),
        "individual_disposition_merge": "not_performed",
    }


def write_summary(
    path: Path,
    *,
    now: str,
    sources: list[dict],
    scanned_json: int,
    scanned_md: int,
    scanned_jsonl: int,
    md_tokens: set[str],
    json_tokens: set[str],
    triple_bound_tokens: set[str],
    md_bindings: list[dict],
    md_only: list[str],
    md_json_overlap: list[str],
    json_only: list[str],
    ledger_ids: set[str],
    in_census: list[str],
    missing_census: list[str],
    v2_compare: dict[str, Any],
    inventory_path: str,
    inventory_digest: str,
    inventory_frozen_at: str,
    denominator_closed: bool,
    fresh_vs_prior: dict[str, Any],
) -> None:
    lines = [
        "# Full 180-Source Machine Contract Event Binding Scan v3",
        "",
        f"**Generated:** {now}",
        "",
        "## Scope",
        f"- Inventory path: `{inventory_path}`",
        f"- Inventory digest: `{inventory_digest}`",
        f"- Inventory frozen_at_utc: **{inventory_frozen_at}**",
        f"- `denominator_closed` on inventory: **{str(denominator_closed).lower()}** (not sealed; freeze pin not rewritten)",
        f"- Frozen sources: **{len(sources)}** ({scanned_json} JSON, {scanned_md} MD, {scanned_jsonl} JSONL)",
        "- Triple-bound recomputed from JSON `entries.*` only",
        "- Markdown command catalog + Wiring_Matrix tables + JSON fences reconciled",
        "- Missing tokens are **not** merged into individual-disposition",
        "",
        "## Counts",
        f"- `md_tokens`: **{len(md_tokens)}**",
        f"- `json_tokens`: **{len(json_tokens)}**",
        f"- `triple_bound_tokens`: **{len(triple_bound_tokens)}**",
        f"- `md_expected_event_binding` rows: **{len(md_bindings)}**",
        f"- `md_only`: **{len(md_only)}**",
        f"- `md_json_overlap`: **{len(md_json_overlap)}**",
        f"- `json_only`: **{len(json_only)}**",
        "",
        "## vs previous 09:58:27Z scan",
        f"- Prior generated_at_utc: **{fresh_vs_prior['prior_generated_at_utc']}**",
        f"- Prior digest: `{fresh_vs_prior['prior_canonical_digest_sha256']}`",
        f"- Fresh digest: `{inventory_digest}`",
        f"- `triple_bound`: **{fresh_vs_prior['prior_triple_bound_token_count']}** → **{fresh_vs_prior['fresh_triple_bound_token_count']}**",
        f"- `md_only`: **{fresh_vs_prior['prior_md_only_count']}** → **{fresh_vs_prior['fresh_md_only_count']}**",
        f"- `missing_from_census`: **{fresh_vs_prior['prior_missing_from_census_count']}** → **{fresh_vs_prior['fresh_missing_from_census_count']}**",
        f"- triple_bound added: {fresh_vs_prior['triple_bound_added'] or '[]'}",
        f"- triple_bound removed: {fresh_vs_prior['triple_bound_removed'] or '[]'}",
        f"- md_only added: {fresh_vs_prior['md_only_added'] or '[]'}",
        f"- md_only removed: {fresh_vs_prior['md_only_removed'] or '[]'}",
        f"- missing_from_census added: {fresh_vs_prior['missing_from_census_added'] or '[]'}",
        f"- missing_from_census removed: {fresh_vs_prior['missing_from_census_removed'] or '[]'}",
        "- individual-disposition merge: **not performed**",
        "",
        "## v2 triple_bound comparison",
        f"- v2 baseline triple_bound count: **{V2_TRIPLE_BOUND_BASELINE}**",
        f"- v3 triple_bound count: **{len(triple_bound_tokens)}**",
        f"- Count changed: **{'yes' if len(triple_bound_tokens) != V2_TRIPLE_BOUND_BASELINE else 'no'}**",
        "",
        "## Census-adjudication LEDGER reconciliation",
        f"- Ledger `candidate_id` count: **{len(ledger_ids)}**",
        f"- Triple-bound in ledger: **{len(in_census)}**",
        f"- Triple-bound missing from ledger (v3): **{len(missing_census)}**",
        f"- v2 baseline missing from ledger: **{len(V2_MISSING_FROM_LEDGER_BASELINE)}** (merged before v3; scan does not merge rows)",
    ]
    if missing_census:
        lines.append("- v3 missing tokens:")
        for token in missing_census:
            lines.append(f"  - `{token}`")
    extra = sorted(ledger_ids - triple_bound_tokens)
    lines.extend(
        [
            f"- Ledger candidate_ids not in triple_bound scan: **{len(extra)}** (expected; ledger includes non-emit families)",
            "",
            "## New tokens in markdown not present in JSON scan (`md_only`)",
        ]
    )
    if md_only:
        lines.append(
            f"**{len(md_only)}** documentation/catalog tokens surfaced via markdown reconciliation "
            "(recorded as `md_expected_event_binding`, not automatic emit candidates):"
        )
        for token in md_only:
            lines.append(f"- `{token}`")
    else:
        lines.append("None.")
    lines.extend(
        [
            "",
            "## Validator receipt",
            "- `Plans/.audits/event-authority-2026-08-12/independent-validator/receipts/event_authority_validator_receipt.json`",
            "",
            "## Artifacts",
            "- `MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` (schema v3)",
            "- `MACHINE_CONTRACT_EVENT_BINDING_SCAN_DETAIL.json`",
            "- Rerun: `python Plans/.audits/event-authority-2026-08-12/closed-world-census/admission/_run_full_binding_scan.py`",
            "",
            "## v2 scan delta",
            json.dumps(v2_compare, indent=2),
            "",
            "## vs 09:58:27Z scan delta",
            json.dumps(fresh_vs_prior, indent=2),
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Full 180-source machine-contract event binding scan v3. "
            "Use --inventory only as an input-path override; freeze pin is not rewritten."
        )
    )
    parser.add_argument(
        "--inventory",
        default=None,
        help=(
            "Source inventory JSON path override (repo-relative or absolute). "
            "Does not rewrite CURRENT_SOURCE_INVENTORY.json."
        ),
    )
    return parser.parse_args()


def resolve_inventory_override(raw: str | None) -> tuple[Path, str]:
    if not raw:
        inv_path = AUDIT / SOURCE_INVENTORY_REL
        return inv_path, SOURCE_INVENTORY_REPO_PATH
    candidate = Path(raw)
    if not candidate.is_absolute():
        for option in (REPO / raw, AUDIT / raw, Path.cwd() / raw):
            if option.exists():
                candidate = option
                break
        else:
            candidate = REPO / raw
    try:
        repo_rel = str(candidate.resolve().relative_to(REPO)).replace("\\", "/")
    except ValueError:
        repo_rel = str(candidate).replace("\\", "/")
    return candidate, repo_rel


def main() -> None:
    args = parse_args()
    inv_path, inventory_repo_path = resolve_inventory_override(args.inventory)
    inv = json.loads(inv_path.read_text(encoding="utf-8"))
    sources = inv["sources"]
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    md_tokens: set[str] = set()
    json_tokens: set[str] = set()
    triple_accum: dict[str, dict] = {}
    md_bindings: list[dict] = []
    missing_sources: list[str] = []
    scanned_json = scanned_md = scanned_jsonl = 0

    for source in sources:
        rel = source["path"]
        fp = resolve_source_path(rel)
        if not fp.exists():
            missing_sources.append(rel)
            continue
        rel_norm = rel_norm_path(fp, rel)
        suffix = fp.suffix.lower()
        if suffix == ".json":
            scanned_json += 1
            try:
                data = json.loads(fp.read_text(encoding="utf-8", errors="replace"))
            except json.JSONDecodeError:
                continue
            ingest_json_object(data, rel_norm, json_tokens, triple_accum)
        elif suffix == ".md":
            scanned_md += 1
            parse_markdown_source(
                fp.read_text(encoding="utf-8", errors="replace"),
                rel_norm,
                md_bindings,
                md_tokens,
                json_tokens,
                triple_accum,
            )
        elif suffix == ".jsonl":
            scanned_jsonl += 1
            scan_jsonl_bindings(fp, rel_norm, json_tokens, triple_accum)

    dedupe_triple_accum(triple_accum)
    triple_bound_tokens = set(triple_accum)
    ledger_ids = load_ledger_ids()
    indiv_ids = load_indiv_ids()

    md_only = sorted(md_tokens - json_tokens)
    json_only = sorted(json_tokens - md_tokens)
    md_json_overlap = sorted(md_tokens & json_tokens)
    reconciliation = {
        "md_tokens": sorted(md_tokens),
        "json_tokens": sorted(json_tokens),
        "triple_bound_tokens": sorted(triple_bound_tokens),
        "md_only": md_only,
        "json_only": json_only,
        "md_json_overlap": md_json_overlap,
    }

    missing_census = sorted(t for t in triple_bound_tokens if t not in ledger_ids)
    in_census = sorted(t for t in triple_bound_tokens if t in ledger_ids)
    missing_indiv = sorted(t for t in triple_bound_tokens if t not in indiv_ids)

    wm_path = REPO / "Plans/Wiring_Matrix.production.json"
    wm_data = json.loads(wm_path.read_text(encoding="utf-8"))
    refs_only = compute_refs_only(wm_data, triple_bound_tokens)

    prior_restores = [
        {
            "event_type": "testing.capability_policy.updated",
            "ui_command_id": "cmd.testing.capability_policy.set",
            "restore_as": "unresolved_emit_candidate",
        },
        {
            "event_type": "testing.visibility_policy.updated",
            "ui_command_id": "cmd.testing.visibility_policy.set",
            "restore_as": "unresolved_emit_candidate",
        },
    ]
    emit_candidates_total = sorted(
        set(V2_MISSING_FROM_LEDGER_BASELINE)
        | {row["event_type"] for row in prior_restores}
        | set(missing_census)
    )

    v2_compare = {
        "v2_triple_bound_token_count": V2_TRIPLE_BOUND_BASELINE,
        "v3_triple_bound_token_count": len(triple_bound_tokens),
        "triple_bound_count_changed": len(triple_bound_tokens) != V2_TRIPLE_BOUND_BASELINE,
        "v2_missing_from_census_ledger_baseline": V2_MISSING_FROM_LEDGER_BASELINE,
        "v3_missing_from_census_ledger": missing_census,
        "resolved_since_v2_merge": sorted(
            set(V2_MISSING_FROM_LEDGER_BASELINE) - set(missing_census)
        ),
        "new_missing_vs_v2_baseline": sorted(
            set(missing_census) - set(V2_MISSING_FROM_LEDGER_BASELINE)
        ),
        "extra_in_ledger_not_triple_bound_count": len(ledger_ids - triple_bound_tokens),
        "md_only_new_vs_v2_json_scan": md_only,
    }
    fresh_vs_prior = compare_to_prior_095827(
        triple_bound_tokens, md_only, missing_census
    )

    out: dict[str, Any] = {
        "schema_id": V3_SCHEMA_ID,
        "generated_at_utc": now,
        "advisor2_blocker": "full_180_source_binding_scan_v3_md_json_reconciliation",
        "source_inventory": {
            "schema_id": inv["schema_id"],
            "path": inventory_repo_path,
            "source_count": len(sources),
            "canonical_digest_sha256": inv.get("canonical_digest_sha256"),
            "frozen_at_utc": inv.get("frozen_at_utc"),
            "denominator_closed": inv.get("denominator_closed"),
            "note": (
                "Input-path override only; CURRENT_SOURCE_INVENTORY.json freeze pin "
                "not rewritten; denominator not sealed; families not admitted"
            ),
        },
        "triple_bound_definition": (
            "JSON entries.* catalog entry: token in expected_event_types AND "
            "effect_contract.receipt_or_event_refs with effect_contract.effect_kind=event"
        ),
        "md_binding_definition": (
            "Markdown expected_event_types / Expected events without same-row effect_contract "
            "recorded as md_expected_event_binding (not triple_bound)"
        ),
        "fields_scanned": [
            "entries.*.expected_event_types",
            "entries.*.effect_contract.receipt_or_event_refs",
            "entries.*.effect_contract.effect_kind",
            "markdown command catalog Expected events column",
            "markdown Wiring_Matrix expected_event_types column",
            "markdown ```json fences",
            "jsonl line objects",
        ],
        "sources_scanned_json_count": scanned_json,
        "sources_scanned_md_count": scanned_md,
        "sources_scanned_jsonl_count": scanned_jsonl,
        "sources_missing_on_disk": missing_sources,
        "reconciliation": reconciliation,
        "md_expected_event_binding_count": len(md_bindings),
        "md_expected_event_bindings": md_bindings,
        "triple_bound_token_count": len(triple_bound_tokens),
        "triple_bound_in_census_ledger_count": len(in_census),
        "triple_bound_missing_from_census_ledger_count": len(missing_census),
        "triple_bound_missing_from_census_ledger": missing_census,
        "triple_bound_missing_from_individual_disposition_count": len(missing_indiv),
        "false_rejects_restored": prior_restores,
        "emit_candidates_total": emit_candidates_total,
        "triple_bound_tokens": {
            token: {
                "entry_ids": triple_accum[token]["entry_ids"],
                "ui_command_ids": triple_accum[token]["ui_command_ids"],
                "sources": triple_accum[token]["sources"],
                "in_census_ledger": token in ledger_ids,
                "in_individual_disposition": token in indiv_ids,
            }
            for token in sorted(triple_bound_tokens)
        },
        "refs_only_enumeration_count": len(refs_only),
        "refs_only_enumeration_note": (
            "Enumerate only; do not treat as emit-candidate event families"
        ),
        "refs_only_enumeration": refs_only,
        "v2_comparison": v2_compare,
        "fresh_vs_prior_095827": fresh_vs_prior,
        "prior_v2_scan_limitation": (
            "v2 recursive scan_node co-located fields on one node (missed nested "
            "effect_contract) and skipped 72 markdown binding-table sources."
        ),
        "owner_merge_scope": "do_not_merge_ledger_rows_in_scan_script",
        "individual_disposition_merge": "not_performed",
    }

    out_path = AUDIT / "closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json"
    out_path.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")

    detail_path = (
        AUDIT / "closed-world-census/admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN_DETAIL.json"
    )
    detail_path.write_text(
        json.dumps(
            {
                "generated_at_utc": now,
                "schema_id": V3_SCHEMA_ID,
                "source_inventory": out["source_inventory"],
                "triple_bound_detail": triple_accum,
                "missing_triple_bound_detail": {
                    token: triple_accum[token] for token in missing_census
                },
                "md_expected_event_bindings_by_token": {
                    token: [b for b in md_bindings if b["event_type"] == token]
                    for token in sorted({b["event_type"] for b in md_bindings})
                },
                "reconciliation_detail": reconciliation,
                "v2_comparison": v2_compare,
                "fresh_vs_prior_095827": fresh_vs_prior,
                "individual_disposition_merge": "not_performed",
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    summary_path = AUDIT / "closed-world-census/admission/FULL_180_SOURCE_SCAN_V3_SUMMARY.md"
    write_summary(
        summary_path,
        now=now,
        sources=sources,
        scanned_json=scanned_json,
        scanned_md=scanned_md,
        scanned_jsonl=scanned_jsonl,
        md_tokens=md_tokens,
        json_tokens=json_tokens,
        triple_bound_tokens=triple_bound_tokens,
        md_bindings=md_bindings,
        md_only=md_only,
        md_json_overlap=md_json_overlap,
        json_only=json_only,
        ledger_ids=ledger_ids,
        in_census=in_census,
        missing_census=missing_census,
        v2_compare=v2_compare,
        inventory_path=inventory_repo_path,
        inventory_digest=inv.get("canonical_digest_sha256") or "",
        inventory_frozen_at=inv.get("frozen_at_utc") or "",
        denominator_closed=bool(inv.get("denominator_closed")),
        fresh_vs_prior=fresh_vs_prior,
    )

    print(
        f"sources={len(sources)} json={scanned_json} md={scanned_md} jsonl={scanned_jsonl} "
        f"missing={len(missing_sources)}"
    )
    print(
        f"md_tokens={len(md_tokens)} json_tokens={len(json_tokens)} "
        f"triple_bound={len(triple_bound_tokens)} md_bindings={len(md_bindings)}"
    )
    print(f"md_only={len(md_only)} overlap={len(md_json_overlap)} json_only={len(json_only)}")
    print(f"missing_from_census={len(missing_census)}")
    print(f"digest={inv.get('canonical_digest_sha256')}")
    print(f"WROTE {out_path}")
    print(f"WROTE {summary_path}")


if __name__ == "__main__":
    main()
