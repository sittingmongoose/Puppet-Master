#!/usr/bin/env python3
"""Scoped Browser event-authority conformance; never runtime/currentness proof."""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import re
import sys
from collections import Counter
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin

from jsonschema import Draft202012Validator
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_contract_formats import FormatChecker
import pm_event_payload_route as body_route
from pm_ds_tables import Facts, entry as _ds_entry
from pm_event_numbers import producer_semantic_digest
Draft202012Validator = body_route.StrictValidator
IDENTITIES = ("project_id", "thread_id", "run_id", "node_id", "attempt_id")
MAX_PAYLOAD_BYTES = 65536

# SP-262 pins the preparation landing, not a prohibition on later Goal owner
# adoptions. SMPFS-166's historical rows retain their original hash authority.
ORIGINAL39_SHA256 = "f548a2977dc4f1c51dc0a4976940a0a3562de6281a707a96fbd5cee67f618c0e"
ORIGINAL40_SHA256 = "4f701c9598003d7c01a405f18f7991b373379eca8b182cf6222540a4746d1756"
# Current manifest re-frozen by the landed storage-registry repairs on
# 2026-09-24. Keep its authority separate from the preparation-era lineage.
# Re-frozen 2026-10-10 for DL-188 (Jared approved the Event Authority checkpoint that moves
# workspace.layout_changed to family revision 2.0.0, D42): the one changed row is the reviewed layout
# successor below; was e2b5a433c668a36ffe3ffdc329f90a0f860b680bbc54fb9c596d1a302c6cd306.
# Re-frozen 2026-11-04 for DL-300 (Jared admitted the app scope-selector editions, "Admit them now"): the
# eleven changed Goal rows carry the exact pm_emit_only_event_contract.EVENT_EDITION_DELTAS edition that
# historical_preexisting_rows projects back out; was 5ccb9d5d543fcb81e91db26ce432b89192fe96ed86ca6adf5515c9e5929383ed.
CURRENT39_SHA256 = "5619e8337f1ee1d0c359af94992a6055c3dd1f7d78ba00a1597d53beafba2b37"
COMPACTION_FAMILY = "event-family-context-compaction-completed"
COORDINATION_LEDGER = "Plans/coordination_event_admission.json"
# The exact seven Step 9 batch 2 families (DL-045), each event type mapped to its prepared family ID
# (cycle-2 residual R4-02). The coordination ledger can open no other family and no other family ID,
# whatever its rows say; the gate does not validate the ledger against its schema.
COORDINATION_EVENT_TYPES = {
    "coordination.agent_registered": "event-family-coordination-agent-registered",
    "coordination.agent_status_updated": "event-family-coordination-agent-status-updated",
    "coordination.agent_operation_updated": "event-family-coordination-agent-operation-updated",
    "coordination.agent_file_ownership_updated": "event-family-coordination-agent-file-ownership-updated",
    "coordination.agent_unregistered": "event-family-coordination-agent-unregistered",
    "coordination.agent_crashed": "event-family-coordination-agent-crashed",
    "coordination.agent_aborted": "event-family-coordination-agent-aborted",
}
# Whole-row pins independently taken from each adoption commit, never generated
# from the live registry. Historical pins are from b09294e44b. No sibling or
# field-level exemption follows from these exact six owner adoptions.
REVIEWED_GOAL_SUCCESSORS = {
    "event-family-goal-created": (
        "b659581816da0131ee0bb3883e05d4bc4e72d833fb41fc60648d9a7777bee93b",
        "616062aa35bd00d4d2193253e1bcfa25d3664b2c37aa0c6296c8c3fb319f2ec7",
        "3890d86c70", "Plans/Contracts_V0.md#CV-341",
    ),
    "event-family-goal-updated": (
        "88ced20e631e37262ca286f84c39e1cad02bba82aab48a49a87ab149cfa06fbd",
        "2a99605e467237c2e9fd1b3c9b1ce435a43e45edb401711f1f376f31df0baeef",
        "5fc9747b6f", "Plans/Contracts_V0.md#CV-342",
    ),
    "event-family-goal-cancelled": (
        "9b2150b0fffdabe5752ba1c4323677b1c06231531d8081a6069a129141ef7c16",
        "61ca9065d712ddd15c2093e581f24007f3a10f8063cb5d103bf4e32f4f23d1b7",
        "1136661ddc", "Plans/Contracts_V0.md#CV-347",
    ),
    "event-family-goal-run-started": (
        "27b86920f969ab3143cd9a9c632f18765e69854b80d0b746573a2e7e8c196aac",
        "3b6a4abd54c88b343cd9bf4a15ee55cbfa3394f6cb8814dfb6a08cd7d809daeb",
        "e686963ad5", "Plans/Goal_Runtime_System.md#GRS-079",
    ),
    "event-family-goal-run-cancelled": (
        "befcf90338898beeef80b6a96c154fdff3bdd990b277e848026d55660c33ec25",
        "f60bbabf5cd822c1e59ac39d33ef0eed0007226457fdade4dc0a3a811166af6b",
        "a3c511657f", "Plans/Goal_Runtime_System.md#GRS-080",
    ),
    "event-family-goal-run-certified": (
        "b139f451951b3bf8b08a3d91e3cc0deabf6445760842465ddcd859ca39648061",
        "f58cc6a74676d7d3266c0a45f1a7f07a7e9f12e9782ca2c837f840070df7654e",
        "f6350caf277d662fad531fc9b9af4c82803670fa", "Plans/Goal_Runtime_System.md#GRS-084",
    ),
}

# The one reviewed successor outside the Goal adoptions: workspace.layout_changed 1.1.0 -> 2.0.0,
# approved by Jared as DL-188 (D42) and landed by the home panels and terminal follow-up round.
# Pins: (historical row fingerprint, successor row fingerprint, approval, contract). The historical
# field values are retained verbatim so the preparation-era rows reconstruct exactly.
REVIEWED_LAYOUT_SUCCESSORS = {
    "event-family-workspace-layout-changed": (
        "1a8f179c72f026b106eda791a03bd225f40c02a0ece8db2ad480c3cc180948a7",
        "39a2bbdb6e08fc05ae0526533b01ce3841dfe21014ae98de43889ea30d5c7c1a",
        "Plans/Decision_Log.md#DL-188", "Plans/Contracts_V0.md#CV-361",
    ),
}
REVIEWED_LAYOUT_HISTORICAL_FIELDS = {
    "event-family-workspace-layout-changed": {
        "family_revision": "1.1.0",
        "payload_owner_doc": "Plans/Contracts_V0.md#pmconcept7-home-workspace-event-contracts",
        "payload_schema_id": "https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/1.1.0",
        "payload_schema_ref": {
                "path": "Plans/event_payloads/workspace_layout_changed.schema.json",
                "json_pointer": "#",
                "schema_id": "https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/1.1.0"
        },
        "source_refs": [
                "Plans/event_payloads/workspace_layout_changed.schema.json#",
                "Plans/Contracts_V0.md#pmconcept7-home-workspace-event-contracts",
                "Plans/FinalGUISpec.md#f3-515---settled-interaction-event-and-persistence-boundary",
                "Plans/Automated_Testing_System.md#ats-040---settled-command-event-receipt-and-context-compaction-fixtures"
        ]
    },
}


# The three families Jared admitted on 2026-11-04 (DL-300, "Admit them now"), pinned as whole rows taken
# from the registering commit, never generated from the live registry. Pins: (event type, row
# fingerprint, approval, owner). Their app producers stay requires_owner_adoption; no other family opens.
REVIEWED_DL300_FAMILIES = {
    "event-family-settings-layer-changed": (
        "settings.layer.changed",
        "05040513b1cc6abfa09a8374df186dbfee496c56b089fc381837f664420be4dd",
        "Plans/Decision_Log.md#DL-300", "Plans/Settings_System.md#SSYS-060",
    ),
    "event-family-approval-chat-tool-requested": (
        "approval.chat_tool_requested",
        "378699b25be007f3491484166d7757f33d47668eee17b76277b93658399e573b",
        "Plans/Decision_Log.md#DL-300", "Plans/Permissions_System.md#PS-145",
    ),
    "event-family-approval-chat-tool-resolved": (
        "approval.chat_tool_resolved",
        "4f91ed5da384c9466f15945a5775888232a2cfe611da011d9d36b09cdf7b33c2",
        "Plans/Decision_Log.md#DL-300", "Plans/Permissions_System.md#PS-145",
    ),
}


@lru_cache(maxsize=1)
def emit_only_contract():
    """Reuse the exact DL-300 Goal scope-selector edition deltas, not a general exemption."""
    path = ROOT / "scripts/pm_emit_only_event_contract.py"
    spec = importlib.util.spec_from_file_location("browser_emit_only_event_contract", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@lru_cache(maxsize=1)
def envelope_oracle():
    """Reuse the existing pure Case L identity oracle, not readiness admission."""
    path = ROOT / "scripts/pm-implementation-readiness.py"
    spec = importlib.util.spec_from_file_location("browser_event_case_l_oracle", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@lru_cache(maxsize=1)
def workspace_created_authority():
    path = ROOT / "scripts/pm_browser_workspace_created.py"
    spec = importlib.util.spec_from_file_location("browser_workspace_created_authority", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@lru_cache(maxsize=1)
def workspace_reset_authority():
    path = ROOT / "scripts/pm_browser_workspace_reset.py"
    spec = importlib.util.spec_from_file_location("browser_workspace_reset_authority", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@_ds_entry
def authority_binding_failures(row):
    # Exact individually reviewed bindings only, never prefix/sibling expansion
    # or an arbitrary ref-driven module loader. These are not native proof.
    f = Facts("gate_authority", chain=True)
    if f.stop("GA01_reviewed_binding", lambda: row["event_type"] in ("browser.workspace.created", "browser.workspace.reset")):
        return [f.first_code()]
    f.done()
    if row["event_type"] == "browser.workspace.created":
        return workspace_created_authority().binding_failures(row, root=ROOT)
    return workspace_reset_authority().binding_failures(row, root=ROOT)

def exact_json_text(value):
    """Compact JSON text with exact integers of any length (CV-1100 sets no global cap)."""
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        return json.dumps(value, separators=(",", ":"), ensure_ascii=False)
    finally:
        sys.set_int_max_str_digits(previous)


def load_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def historical_preexisting_rows(rows):
    """Reconstruct retained preparation bytes only after whole-row pin checks.

    This returns an isolated comparison value, never a registry rewrite. Both
    the original rows and reviewed successors are usable in historical tests;
    an unknown change is rejected before any historical fields are restored.
    """
    # DL-300: project the exact reviewed Goal scope-selector editions back to their prior rows first; an
    # unknown edition raises before any historical field is restored.
    historical = emit_only_contract().legacy_registry_rows(rows)
    for row in historical:
        layout_pins = REVIEWED_LAYOUT_SUCCESSORS.get(row["family_id"])
        if layout_pins is not None:
            if fingerprint(row) not in layout_pins[:2]:
                raise ValueError("unreviewed_preexisting_successor: " + row["family_id"])
            row.update(copy.deepcopy(REVIEWED_LAYOUT_HISTORICAL_FIELDS[row["family_id"]]))
            if fingerprint(row) != layout_pins[0]:
                raise ValueError("historical_preexisting_row_reconstruction: " + row["family_id"])
            continue
        pins = REVIEWED_GOAL_SUCCESSORS.get(row["family_id"])
        if pins is None:
            continue
        if fingerprint(row) not in pins[:2]:
            raise ValueError("unreviewed_preexisting_successor: " + row["family_id"])
        stem = row["event_type"].replace(".", "_")
        path = "Plans/event_payloads/goal_runtime/" + stem + ".schema.json"
        schema_id = "pm.goal_runtime_event." + stem + ".schema.v2"
        row.update({
            "family_revision": "2.0.0",
            "semantic_owner_doc": "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima",
            "payload_owner_doc": "Plans/storage-plan.md#sp-214---goal-runtime-persistence-consumer",
            "payload_schema_id": schema_id,
            "payload_schema_ref": {"path": path, "json_pointer": "#", "schema_id": schema_id},
            "source_refs": [path + "#", "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima",
                            "Plans/Contracts_V0.md#cv-287---goal-runtime-event-schema-registration"],
        })
        if fingerprint(row) != pins[0]:
            raise ValueError("historical_preexisting_row_reconstruction: " + row["family_id"])
    return historical


def admitted_coordination_rows():
    """Registry rows the coordination ledger marks admitted_static_contract, by identity and fingerprint.

    Step 9 batch 2 (DL-045): each coordination family is admitted in its own
    landing under DL-078, which appends its prepared registry_row unchanged.
    A row is accepted only as that exact prepared row, and only for one of the seven
    coordination event types under its prepared family ID, with the ledger row's own family
    ID and event type. A prepared, out-of-batch, changed, foreign, renamed or unreadable row
    stays unexpected, and no other family is opened.
    """
    try:
        rows = load_json(COORDINATION_LEDGER)["rows"]
    except (OSError, ValueError, KeyError, TypeError):
        return {}
    return {
        (row["registry_row"]["family_id"], row["registry_row"]["event_type"]): fingerprint(row["registry_row"])
        for row in rows
        if isinstance(row, dict) and row.get("admission_status") == "admitted_static_contract"
        and isinstance(row.get("registry_row"), dict)
        and COORDINATION_EVENT_TYPES.get(row.get("event_type")) == row.get("family_id")
        and row["registry_row"].get("event_type") == row.get("event_type")
        and row["registry_row"].get("family_id") == row.get("family_id")
    }


def preexisting_preservation(admission, registry_rows, *, allow_historical=False, coordination_rows=None):
    """Verify historical39/40 lineage and require the active successor rows.

    Historical comparison is opt-in for isolated tests, never a CLI mode or
    permission to downgrade an active registry row to its retained reader.
    coordination_rows defaults to admitted_coordination_rows(); tests pass their own.
    """
    ids = admission["preexisting_family_ids"]
    original_ids = set(ids)
    existing = [row for row in registry_rows if row["family_id"] in original_ids]
    upstream = [row for row in registry_rows if row["family_id"] in original_ids | {COMPACTION_FAMILY}]
    failures = []
    try:
        historical = historical_preexisting_rows(upstream)
    except ValueError as error:
        failures.append({"error": "preexisting_family_rows_changed", "detail": str(error)})
        historical = []
    historical39 = [row for row in historical if row["family_id"] != COMPACTION_FAMILY]
    preserved39 = (len(historical39) == 39 and fingerprint(historical39) == ORIGINAL39_SHA256
                   and [row["family_id"] for row in historical39] == ids)
    preserved40 = len(historical) == 40 and fingerprint(historical) == ORIGINAL40_SHA256
    if not preserved39 or not preserved40:
        failures.append({"error": "historical_preexisting_baseline_mismatch"})
    if admission["preexisting_family_rows_sha256"] != CURRENT39_SHA256:
        failures.append({"error": "current_preexisting_manifest_hash_mismatch"})
    # Do not let unrelated additions disappear through the baseline filter.
    # Besides Browser rows, only an admitted coordination row equal to its
    # prepared row passes (Step 9 batch 2, generalized 2026-09-25).
    browser_pairs = {(row["family_id"], row["event_type"]) for row in admission["rows"]}
    coordination = admitted_coordination_rows() if coordination_rows is None else coordination_rows
    if any(row["family_id"] not in original_ids | {COMPACTION_FAMILY}
           and (row["family_id"], row["event_type"]) not in browser_pairs
           and coordination.get((row["family_id"], row["event_type"])) != fingerprint(row)
           and REVIEWED_DL300_FAMILIES.get(row["family_id"], (None, None))[:2] != (row["event_type"], fingerprint(row))
           for row in registry_rows):
        failures.append({"error": "unexpected_central_event_family"})
    if len({row["family_id"] for row in registry_rows}) != len(registry_rows):
        failures.append({"error": "duplicate_central_family_id"})
    try:
        existing_prior = emit_only_contract().legacy_registry_rows(existing)
    except ValueError:
        existing_prior = existing
    adopted = [row["family_id"] for row in existing_prior
               if row["family_id"] in REVIEWED_GOAL_SUCCESSORS
               and fingerprint(row) == REVIEWED_GOAL_SUCCESSORS[row["family_id"]][1]]
    missing_successors = sorted(set(REVIEWED_GOAL_SUCCESSORS) - set(adopted))
    if missing_successors and not allow_historical:
        failures.append({"error": "required_preexisting_successors_missing", "family_ids": missing_successors})
    return {
        "historical_baseline_verified": preserved39 and preserved40,
        "historical_original39_verified": preserved39,
        "historical_original40_verified": preserved40,
        "preexisting_family_rows_unchanged": len(existing) == 39 and fingerprint(existing) == ORIGINAL39_SHA256,
        "current_preexisting_rows_match_reviewed_successors": not failures and set(adopted) == set(REVIEWED_GOAL_SUCCESSORS),
        "reviewed_preexisting_successor_family_ids": adopted,
    }, failures


def pointer(value, path):
    for token in path.removeprefix("#").strip("/").split("/"):
        if token:
            value = value[token.replace("~1", "/").replace("~0", "~")]
    return value


def set_pointer(value, path, replacement):
    parts = path.strip("/").split("/")
    parent = value
    for token in parts[:-1]:
        parent = parent[token.replace("~1", "/").replace("~0", "~")]
    parent[parts[-1].replace("~1", "/").replace("~0", "~")] = replacement


def contract_context():
    admission = load_json("Plans/browser_event_admission.json")
    payloads = load_json("Plans/browser_event_payloads.schema.json")
    owner = load_json("Plans/section15_browser_program_contracts.schema.json")
    envelope = load_json("Plans/event_record.schema.json")
    # The existing owner uses a relative $id. Resolve it at the referring
    # document's URI as JSON Schema requires, and also retain its catalog ID.
    # Registry lookup is deliberately offline; no remote retrieval is enabled.
    resources = [(schema["$id"], Resource.from_contents(schema)) for schema in (payloads, owner, envelope)]
    resources.append((urljoin(payloads["$id"], owner["$id"]), Resource.from_contents(owner)))
    registry = body_route.schema_registry(ROOT).with_resources(resources).crawl()
    body_route.eager(registry, payloads, owner, envelope)
    validators = {
        row["event_type"]: Draft202012Validator(
            pointer(payloads, row["payload_schema_ref"]["json_pointer"]),
            registry=registry, format_checker=FormatChecker(),
        )
        for row in admission["rows"]
    }
    return admission, payloads, owner, envelope, validators


@_ds_entry
def semantic_failures(payload):
    context, facts, event = payload["context"], payload["facts"], payload["event_type"]
    f = Facts("gate_semantic")
    f["GS01_run_attempt_paired"] = (context["run_id"] is None) == (context["attempt_id"] is None)
    f["GS02_session_workspace_paired"] = (context["browser_session_id"] is None) == (context["browser_workspace_id"] is None)
    f["GS03_page_generation_paired"] = (context["browser_page_id"] is None) == (context["page_generation"] is None)
    f["GS04_page_has_workspace"] = context["browser_page_id"] is None or context["browser_workspace_id"] is not None
    generation_event = event in {"browser.navigation.generation_changed", "browser.document.generation_changed"}
    f["GS05_prior_page_generation_present"] = not generation_event or facts["prior_page_generation"] is not None
    f["GS06_page_generation_advances"] = not generation_event or facts["prior_page_generation"] is None or facts["prior_page_generation"] < context["page_generation"]
    reset_event = event == "browser.workspace.reset"
    f["GS07_prior_workspace_generation_present"] = not reset_event or facts["prior_workspace_generation"] is not None
    f["GS08_workspace_generation_advances"] = not reset_event or facts["prior_workspace_generation"] is None or facts["prior_workspace_generation"] < facts["workspace_generation"]
    f["GS09_created_no_prior_generation"] = event != "browser.workspace.created" or facts["prior_workspace_generation"] is None
    f["GS10_page_generation_not_regressed"] = ("prior_page_generation" not in facts or facts["prior_page_generation"] is None
                                               or facts["prior_page_generation"] <= context["page_generation"])
    coverage_event = "coverage" in facts
    coverage = facts["coverage"] if coverage_event else {}
    complete = coverage_event and coverage["status"] == "complete"
    f["GS11_representation_generation"] = not coverage_event or facts["base_page_generation"] == context["page_generation"]
    f["GS12_representation_not_self_base"] = not coverage_event or facts["base_representation_id"] != facts["representation_id"]
    f["GS13_coverage_bounds"] = not coverage_event or coverage["frames_covered"] <= coverage["frames_total"]
    f["GS14_complete_frames"] = not complete or coverage["frames_total"] == coverage["frames_covered"]
    f["GS15_complete_no_omissions"] = not complete or not coverage["omission_codes"]
    f["GS16_complete_budget"] = not complete or not coverage["budget_exhausted"]
    f["GS17_complete_no_collisions"] = not complete or not coverage["synthetic_id_collisions"]
    f["GS18_invalidation_matches"] = not coverage_event or facts["invalidated"] == (coverage["status"] == "stale_rejected")
    fence_event = "old_fence" in facts
    old, new = (facts["old_fence"], facts["new_fence"]) if fence_event else ({}, {})
    for row, field in (("GS19_lease_generation_not_regressed", "lease_generation"), ("GS20_lease_epoch_not_regressed", "lease_epoch"),
                       ("GS21_last_sequence_not_regressed", "last_sequence")):
        f[row] = not fence_event or new[field] >= old[field]
    f["GS22_new_fence_page_generation"] = not fence_event or new["page_generation"] == context["page_generation"]
    f["GS23_old_fence_page_generation"] = not fence_event or old["page_generation"] == context["page_generation"]
    identity = ("lease_id", "holder_id", "lease_epoch", "lease_generation")
    f["GS24_renew_identity"] = not (fence_event and event.endswith(".renewed")) or [k for k in identity if old[k] != new[k]] == []
    takeover = fence_event and event.endswith(".takeover_completed")
    f["GS25_takeover_epoch_advances"] = not takeover or new["lease_epoch"] > old["lease_epoch"]
    f["GS26_takeover_holder_changes"] = not takeover or new["holder_id"] != old["holder_id"]
    f["GS27_takeover_request_identity"] = not (fence_event and event.endswith(".takeover_requested")) or [k for k in identity if old[k] != new[k]] == []
    f["GS28_workspace_revision_not_regressed"] = "result_workspace_revision" not in facts or facts["result_workspace_revision"] >= facts["expected_workspace_revision"]
    f["GS29_checkpoint_ref"] = not (event.endswith(".checkpointed") or event in {"browser.program.paused", "browser.program.resumed"}) or bool(facts.get("checkpoint_ref"))
    effect_event = "effect_state" in facts
    unknown = facts["unknown_effect_action_ids"] if effect_event else []
    completed = facts["completed_action_ids"] if effect_event else []
    terminal = facts.get("terminal_state") if effect_event else None
    state = facts["effect_state"] if effect_event else None
    f["GS30_no_action_overlap"] = not effect_event or not (set(unknown) & set(completed))
    f["GS31_unknown_state_no_retry"] = not effect_event or not (state == "effect_unknown" and facts["retry_allowed"])
    f["GS32_unknown_actions_no_retry"] = not effect_event or not (unknown and facts["retry_allowed"])
    f["GS33_no_effect_no_unknown"] = not effect_event or not (state == "no_effect" and unknown)
    f["GS34_no_effect_no_completed"] = not effect_event or not (state == "no_effect" and completed)
    f["GS35_failed_no_effect_state"] = not effect_event or terminal != "failed_no_effect" or state == "no_effect"
    f["GS36_timed_out_unknown_state"] = not effect_event or terminal != "timed_out_effect_state_unknown" or state == "effect_unknown"
    other_terminal = effect_event and bool(terminal) and terminal != "timed_out_effect_state_unknown"
    f["GS37_terminal_no_unknown_actions"] = not other_terminal or not unknown
    f["GS38_terminal_known_state"] = not other_terminal or state != "effect_unknown"
    f["GS39_screenshot_artifact"] = event != "browser.screenshot.model_attachment_selected" or bool(facts["screenshot_artifact_ref"])
    handoff = event == "browser.session.reconstructed_on_host"
    f["GS40_handoff_source_fenced"] = not handoff or bool(facts["source_fenced"])
    f["GS41_handoff_no_unknown_effects"] = not handoff or not facts["unknown_effects"]
    return f.codes()

def fixture_event(case, ordinal):
    payload = copy.deepcopy(case["payload"])
    return {
        "schema_id": "pm.event.v0", "schema_version": "3.0.0" if case["event_type"] in body_route.ADOPTED else "2.0.0", "scope_kind": "project",
        "event_id": f"event-browser-{ordinal}", "event_type": case["event_type"],
        **{field: payload["context"][field] for field in IDENTITIES},
        "actor_ref": "actor:browser-fixture", "requested_account_ref": None, "effective_account_ref": None,
        "occurred_at_utc": "2026-09-10T00:00:00Z", "observed_at_utc": "2026-09-10T00:00:01Z",
        "persisted_at_utc": "2026-09-10T00:00:02Z", "sequence_id": ordinal, "producer_sequence_id": ordinal,
        "correlation_id": f"correlation-browser-{ordinal}", "causation_event_id": None, "parent_event_id": None,
        "idempotency_key": f"browser-transition-{ordinal}", "payload_schema_id": payload["schema_id"],
        "payload": payload, "payload_ref": None, "redaction_profile": "no_secrets",
        "replay_policy": "dedupe_by_idempotency_key",
        "migration": {"migrated_from_schema_id": None, "migrated_from_schema_version": None, "migration_id": None, "compatibility_event_type": None},
    }


@_ds_entry
def compatibility_history_failures(event, context, original):
    """Recompute Case-L normalization from the verified original, never live policy.

    Custody/access flags are checked by the reader. `original` is its authenticated
    legacy source observation, not caller migration metadata or a claimed digest.
    """
    def validate_payload(payload, schema, **kwargs):
        selected = context[-1][event['event_type']]
        body_route.eager(selected._registry, schema)
        return list(selected.evolve(schema=schema).iter_errors(payload))
    normalization = {}

    def normalizes():
        try:
            normalization["value"] = envelope_oracle().normalized_legacy_case(
                original, load_json("Plans/event_family_registry.json"), payload_validator=validate_payload)
        except (ValueError, TypeError, KeyError):
            return False
        return True

    from pm_home_layout_v2_slot_receipt import event_value_or_none
    f = Facts("gate_compatibility", chain=True)
    for row, check in (("GH01_source_present", lambda: isinstance(original, dict)),
                       ("GH02_source_normalizes", normalizes),
                       ("GH03_no_rejection_reason", lambda: normalization["value"][1] is None),
                       ("GH04_normalized_event", lambda: event_value_or_none(event) is not None and
                        event_value_or_none(normalization["value"][0]) == event_value_or_none(event))):
        if f.stop(row, check):
            return [f.first_code()]
    f.done()
    return []


@_ds_entry
def candidate_failures(event, producer_component, context, *, payload_store=None, historical=False, historical_source=None):
    """Check prepared payload semantics without granting EventRecord admission."""
    admission, _, _, envelope, validators = context
    entry = Facts("gate_candidate_entry", chain=True)
    rows = {row["event_type"]: row for row in admission["rows"]}
    if entry.stop("GC01_historical_bool", lambda: type(historical) is bool):
        return [entry.first_code()]
    if entry.stop("GC02_event_object", lambda: isinstance(event, dict)):
        return [entry.first_code()]
    if entry.stop("GC03_known_event", lambda: rows.get(event.get("event_type")) is not None):
        return [entry.first_code()]
    entry.done()
    row = rows[event.get("event_type")]
    selected_envelope = load_json("Plans/event_record_v3.schema.json") if event.get("schema_version") == "3.0.0" else envelope
    shape = Facts("gate_candidate_envelope")
    shape["GC04_envelope_schema"] = not list(body_route.validator(selected_envelope).iter_errors(event))
    shape["GC04A_sequence_uint64"] = event.get("sequence_id") is None or body_route.storage_uint64_fields_ok({"sequence_id": event["sequence_id"]})
    failures = shape.codes()
    payload, route_errors = body_route.resolved_body(event, payload_store, historical=historical)
    failures.extend(route_errors)
    resolved = Facts("gate_candidate_payload", chain=True)
    if resolved.stop("GC05_payload_object", lambda: isinstance(payload, dict)):
        return failures + [resolved.first_code()]
    resolved.done()
    payload_validator = validators[event['event_type']]
    if historical:
        from pm_home_layout_v2_slot_receipt import RetainedBodyValidator
        payload_validator = RetainedBodyValidator(payload_validator.schema, registry=payload_validator._registry, format_checker=FormatChecker())
    joins = Facts("gate_candidate_joins")
    joins["GC06_payload_schema"] = not list(payload_validator.iter_errors(payload))
    joins["GC07_producer_authorized"] = producer_component == row["producer_component"]
    failures += joins.codes()
    payload_context = payload.get("context", {})
    scoped = Facts("gate_candidate_context", chain=True)
    # The payload schema row above has already refused a non-object context.
    if scoped.stop("GC08_context_object", lambda: isinstance(payload_context, dict)):
        return failures + [scoped.first_code()]
    scoped.done()
    migration = event.get('migration')
    scope = Facts("gate_candidate_scope")
    scope["GC10_identity_projection"] = [field for field in IDENTITIES if event.get(field) != payload_context.get(field)] == []
    scope["GC11_payload_schema_id"] = event.get("payload_schema_id") == row["payload_schema_ref"]["schema_id"]
    scope["GC13_producer_sequence"] = historical or event.get("producer_sequence_id") is not None
    scope["GC14_replay_policy"] = historical or event.get("replay_policy") == "dedupe_by_idempotency_key"
    codes = scope.codes()
    # Two rows no input refuses before another row does, each in a table of its own.
    kind = Facts("gate_candidate_scope_kind")
    kind["GC09_project_scope_kind"] = event.get("scope_kind") == "project"
    payload_type = Facts("gate_candidate_payload_event_type")
    payload_type["GC12_payload_event_type"] = payload.get("event_type") == event["event_type"]
    order = ("envelope_scope", "payload_identity_mismatch", "browser_replay_contract")
    merged = set(codes) | set(kind.codes()) | set(payload_type.codes())
    failures += [code for code in order if code in merged]
    present = Facts("gate_candidate_migration", chain=True)
    if present.stop("GC15_migration_object", lambda: isinstance(migration, dict)):
        return failures + [present.first_code()]
    present.done()
    redaction = Facts("gate_candidate_redaction")
    redaction["GC16_redaction_profile"] = event.get("redaction_profile") == "no_secrets"
    redaction["GC17_no_unadmitted_migration"] = historical or not any(migration.values())
    failures += redaction.codes()
    if historical and (event.get('replay_policy') == 'projector_replay_only' or any(migration.values())):
        failures.extend(compatibility_history_failures(event, context, historical_source))
    size = Facts("gate_candidate_size")
    size["GC18_total_byte_limit"] = len(exact_json_text(payload).encode()) <= MAX_PAYLOAD_BYTES
    failures += size.codes()
    if "payload_schema" not in failures:
        failures.extend(semantic_failures(payload))
    return failures



@lru_cache(maxsize=4)
def central_family_validator(root):
    schema = json.loads((root / "Plans/event_family_registry.schema.json").read_text(encoding="utf-8"))
    return Draft202012Validator({"$ref": "#/$defs/family", "$defs": schema["$defs"]})


@_ds_entry
def central_binding_failures(row, family, row_index):
    """Resolve an exact family; a matching name or sibling is insufficient."""
    present = Facts("gate_central_entry", chain=True)
    if present.stop("GB01_family_present", lambda: family is not None):
        return [present.first_code()]
    present.done()
    legacy = family.get("legacy", {})
    required_refs = {
        f"Plans/browser_event_admission.json#/rows/{row_index}", row["semantic_owner_ref"],
        row["payload_schema_ref"]["path"] + row["payload_schema_ref"]["json_pointer"],
    }
    f = Facts("gate_central")
    f["GB02_family_schema"] = not list(central_family_validator(ROOT).iter_errors(family))
    for number, key in enumerate(("event_type", "family_id", "family_revision", "payload_schema_ref", "retention_policy_ref"), 3):
        f[f"GB{number:02d}_{key}"] = family.get(key) == row[key]
    f["GB08_scope_policy"] = family.get("scope_policy") == "project_only"
    f["GB09_payload_schema_id"] = family.get("payload_schema_id") == row["payload_schema_ref"]["schema_id"]
    f["GB10_semantic_owner"] = family.get("semantic_owner_doc") == row["semantic_owner_ref"]
    f["GB11_payload_owner"] = family.get("payload_owner_doc") == "Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe"
    f["GB12_source_refs"] = required_refs <= set(family.get("source_refs", []))
    f["GB13_no_aliases"] = legacy.get("aliases") == []
    f["GB14_no_extensions"] = legacy.get("admitted_extensions") == []
    f["GB16_redaction"] = legacy.get("redaction") == {"mode": "reject_unhandled_secrets", "transform_id": None, "transform_version": None}
    f["GB17_identity_pointers"] = legacy.get("identity_json_pointers") == {field: ["/payload/context/" + field] for field in IDENTITIES}
    codes = f.codes()
    pointer = Facts("gate_central_referenced_pointer")
    pointer["GB15_no_referenced_pointer"] = legacy.get("referenced_event_id_pointer") is None
    return codes + [code for code in pointer.codes() if code not in codes]

@_ds_entry
def event_failures(event, producer_component, context, *, families=None, payload_store=None, historical=False, historical_source=None):
    """Admission-enforcing check, distinct from candidate shape/semantics."""
    failures = candidate_failures(event, producer_component, context, payload_store=payload_store, historical=historical, historical_source=historical_source)
    f = Facts("gate_event", chain=True)
    found = {}

    def one_row():
        found["matches"] = [(index, row) for index, row in enumerate(context[0]["rows"]) if row["event_type"] == event.get("event_type")]
        return len(found["matches"]) == 1

    def one_family():
        registry_rows = load_json("Plans/event_family_registry.json")["families"]
        found["families"] = [family for family in registry_rows if family["event_type"] == found["matches"][0][1]["event_type"]]
        return len(found["families"]) == 1

    for row_name, check in (("GE01_event_object", lambda: isinstance(event, dict)),
                            ("GE02_one_admission_row", one_row),
                            ("GE03_row_admitted", lambda: found["matches"][0][1]["admission_status"] == "admitted_static_contract"),
                            ("GE04_one_registry_family", lambda: families is not None or one_family())):
        if f.stop(row_name, check):
            return failures + [f.first_code()]
    f.done()
    row_index, row = found["matches"][0]
    family = found["families"][0] if families is None else families.get(row["event_type"])
    return failures + central_binding_failures(row, family, row_index) + authority_binding_failures(row)

class ReplayOracle:
    """Admission-enforcing synthetic projector, never durable storage proof."""

    contract_failures = staticmethod(event_failures)

    def __init__(self):
        self.event_ids = {}
        self.transition_ids = {}
        self.checkpoint = -1
        self.page_generations = {}
        self.projected_count = 0
        self.executed_effects = 0

    @_ds_entry
    def consume(self, event, producer, context, *, payload_store=None, historical_source=None,
                source_verified=True, access_allowed=True, deletion_allows_audit=True, withdrawn=False):
        f = Facts("gate_replay", chain=True)
        for row, check in (("GR01_source_verified", lambda: source_verified is True),
                           ("GR02_access_allowed", lambda: access_allowed is True),
                           ("GR03_deletion_allows_audit", lambda: deletion_allows_audit is True),
                           ("GR04_not_withdrawn", lambda: withdrawn is False),
                           ("GR05_contract", lambda: not self.contract_failures(event, producer, context, payload_store=payload_store, historical=True, historical_source=historical_source)),
                           ("GR05A_producer_jcs", lambda: body_route.producer_jcs_ok(event))):
            if f.stop(row, check):
                return f.first_code()
        identity = event["event_id"]
        owner = envelope_oracle()
        transition = (owner.scope_partition(event["scope_kind"], event["project_id"]), event["event_type"], event["idempotency_key"])
        digest = producer_semantic_digest(event, type_sensitive_paths={("producer_sequence_id",)})
        if f.stop("GR06_event_identity", lambda: identity not in self.event_ids or self.event_ids[identity] == digest):
            return f.first_code()
        if identity in self.event_ids:
            f.done()
            return "duplicate_no_effect"
        if f.stop("GR07_transition_identity", lambda: transition not in self.transition_ids or self.event_ids[self.transition_ids[transition]] == digest):
            return f.first_code()
        if transition in self.transition_ids:
            f.done()
            return "duplicate_no_effect"
        if f.stop("GR08_sequence_after_checkpoint", lambda: event["sequence_id"] > self.checkpoint):
            return f.first_code()
        f.done()
        self.event_ids[identity] = digest
        self.transition_ids[transition] = identity
        self.checkpoint = event["sequence_id"]
        self.projected_count += 1
        body, _ = body_route.resolved_body(event, payload_store, historical=True)
        subject = body["context"]
        if subject["browser_page_id"] is not None:
            key = (subject["project_id"], subject["browser_workspace_id"], subject["browser_page_id"])
            self.page_generations[key] = max(self.page_generations.get(key, -1), subject["page_generation"])
        return "projected_no_effect"

class CandidateReplayOracle(ReplayOracle):
    """Payload-only simulation. Its projections never establish admission."""

    contract_failures = staticmethod(candidate_failures)


def validate(*, payloads_only=False):
    context = contract_context()
    admission, payloads, owner, _, _ = context
    failures = []
    admission_schema = load_json("Plans/browser_event_admission.schema.json")
    for error in Draft202012Validator(admission_schema).iter_errors(admission):
        failures.append({"error": "admission_schema", "detail": error.message})
    for schema in (admission_schema, payloads):
        Draft202012Validator.check_schema(schema)
    if admission.get("maximum_payload_utf8_bytes") != MAX_PAYLOAD_BYTES:
        failures.append({"error": "payload_byte_budget_contract_mismatch"})
    section = (ROOT / "Plans/Section15_MVP_Promoted_Features_Spec.md").read_text(encoding="utf-8")
    event_text = section.split("Required browser event registrations are:", 1)[1].split("Required command-catalog rows are:", 1)[0]
    required_events = set(re.findall(r"`(browser\.[a-z0-9_.]+)`", event_text))
    command_text = section.split("Required command-catalog rows are:", 1)[1].split("`cmd.browser.program.inspect` is read-only/no-effect.", 1)[0]
    required_commands = set(re.findall(r"`(cmd\.browser\.[a-z0-9_.]+)`", command_text))
    rows = admission["rows"]
    authored = Counter(row["event_type"] for row in rows)
    if set(authored) != required_events or len(required_events) != 53 or any(count != 1 for count in authored.values()):
        failures.append({"error": "exact_section15_event_census_mismatch"})
    if len({row["family_id"] for row in rows}) != len(rows):
        failures.append({"error": "duplicate_prepared_family_id"})
    if len({row["payload_schema_ref"]["schema_id"] for row in rows}) != len(rows):
        failures.append({"error": "duplicate_prepared_payload_schema_id"})
    registry = load_json("Plans/event_family_registry.json")
    preservation, preservation_failures = preexisting_preservation(admission, registry["families"])
    failures.extend(preservation_failures)
    families = {row["event_type"]: row for row in registry["families"]}
    if len(families) != len(registry["families"]):
        failures.append({"error": "duplicate_central_event_family"})
    admitted_events = {row["event_type"] for row in rows if row["admission_status"] == "admitted_static_contract"}
    prepared_events = {row["event_type"] for row in rows if row["admission_status"] == "prepared_not_admitted"}
    registered_scope = required_events & set(families)
    if registered_scope != admitted_events:
        failures.append({"error": "exact_admitted_subset_mismatch", "manifest_only": sorted(admitted_events - registered_scope), "registry_only": sorted(registered_scope - admitted_events)})
    command_bindings = admission.get("command_event_bindings", [])
    if {row["command_id"] for row in command_bindings} != required_commands or len(command_bindings) != 15:
        failures.append({"error": "exact_browser_command_binding_census"})
    wiring = load_json("Plans/Wiring_Matrix.production.json")
    for index, binding in enumerate(command_bindings):
        command_id = binding["command_id"]
        matches = [entry for entry in wiring["entries"].values() if entry["ui_command_id"] == command_id]
        if len(matches) != 1:
            failures.append({"error": "browser_wiring_count", "command_id": command_id})
            continue
        entry = matches[0]
        if entry["expected_event_types"] != binding["event_types"] or not set(binding["event_types"]) <= required_events:
            failures.append({"error": "browser_wiring_event_binding", "command_id": command_id})
        binding_ref = "Plans/browser_event_admission.json#/command_event_bindings/" + str(index)
        if binding_ref not in entry["effect_contract"]["receipt_or_event_refs"]:
            failures.append({"error": "browser_wiring_missing_admission_ref", "command_id": command_id})
        if not entry["state_selector"].endswith(".availability") or not entry["disabled_reason_projection"].endswith(".disabled_reason"):
            failures.append({"error": "browser_wiring_availability", "command_id": command_id})
        if not any("handler_unavailable" in check for check in entry["acceptance_checks"]):
            failures.append({"error": "browser_wiring_native_proof_guard", "command_id": command_id})
        if not any(all(token in check for token in ("prepared_not_admitted", "advance a checkpoint", "one-family landing")) for check in entry["acceptance_checks"]):
            failures.append({"error": "browser_wiring_prepared_admission_guard", "command_id": command_id})
    if next((row["event_types"] for row in command_bindings if row["command_id"] == "cmd.browser.program.inspect"), None) != []:
        failures.append({"error": "inspect_must_remain_event_silent"})
    retention = {row["policy_id"]: row for row in load_json("Plans/storage_value_registry.json")["retention_policies"]}
    for row_index, row in enumerate(rows):
        definition = pointer(payloads, row["payload_schema_ref"]["json_pointer"])
        record = pointer(owner, row["owner_record_contract_ref"].split("#", 1)[1])
        if definition["$id"] != row["payload_schema_ref"]["schema_id"] or definition["properties"]["owner_record_schema_id"]["const"] != record["properties"]["schema_id"]["const"]:
            failures.append({"event_type": row["event_type"], "error": "owner_schema_binding"})
        policy = retention.get(row["retention_policy_ref"]["policy_id"], {})
        if policy.get("policy_version") != row["retention_policy_ref"]["policy_version"] or not policy.get("hold_eligible"):
            failures.append({"event_type": row["event_type"], "error": "retention_policy_binding"})
        if policy.get("anchor_kind") == "run_completion" and not {"run_id", "attempt_id"} <= set(row["required_context_fields"]):
            failures.append({"event_type": row["event_type"], "error": "retention_run_anchor_missing"})
        if row["admission_status"] == "prepared_not_admitted":
            if row["event_type"] in families:
                failures.append({"event_type": row["event_type"], "error": "prepared_family_registered"})
            continue
        for error in central_binding_failures(row, families.get(row["event_type"]), row_index):
            failures.append({"event_type": row["event_type"], "error": error})
        for error in authority_binding_failures(row):
            failures.append({"event_type": row["event_type"], "error": error})
    fixtures = load_json("Plans/browser_event_admission_fixtures.json")
    by_id = {case["case_id"]: case for case in fixtures["valid"]}
    if set(case["event_type"] for case in fixtures["valid"]) != required_events or len(by_id) != 53:
        failures.append({"error": "fixture_census_mismatch"})
    all_case_ids = [case["case_id"] for case in fixtures["valid"] + fixtures["invalid"]]
    if len(all_case_ids) != len(set(all_case_ids)):
        failures.append({"error": "duplicate_fixture_identity"})
    by_type = {row["event_type"]: row for row in rows}
    positive_events = {}
    for ordinal, case in enumerate(fixtures["valid"], 1):
        event = fixture_event(case, ordinal)
        positive_events[case["case_id"]] = event
        producer = by_type[event["event_type"]]["producer_component"]
        errors = candidate_failures(event, producer, context)
        if errors:
            failures.append({"case_id": case["case_id"], "error": "positive_rejected", "details": errors})
        admission_errors = event_failures(event, producer, context, families=families)
        if event["event_type"] in admitted_events and admission_errors:
            failures.append({"case_id": case["case_id"], "error": "admitted_positive_rejected", "details": admission_errors})
        if event["event_type"] in prepared_events and "event_not_admitted" not in admission_errors:
            failures.append({"case_id": case["case_id"], "error": "prepared_event_admission_escape"})
    for case in fixtures["invalid"]:
        event = copy.deepcopy(positive_events[case["base_case_id"]])
        producer = by_type[event["event_type"]]["producer_component"]
        if case["target"] == "producer":
            producer = case["value"]
        else:
            set_pointer(event["payload"] if case["target"] == "payload" else event, case["pointer"], case["value"])
        errors = candidate_failures(event, producer, context)
        if case["expected_error"] not in errors:
            failures.append({"case_id": case["case_id"], "error": "negative_not_rejected_for_expected_reason", "details": errors})
    for error in Draft202012Validator(load_json("Plans/event_family_registry.schema.json")).iter_errors(registry):
        failures.append({"error": "central_registry_schema", "detail": error.message})
    authority_reports = []
    if "browser.workspace.created" in admitted_events:
        report = workspace_created_authority().validate_fixture_contracts(root=ROOT)
        authority_reports.append(report)
        for failure in report["failures"]:
            failures.append({"event_type": "browser.workspace.created", "error": "workspace_created_static_contract", "detail": failure})
    if "browser.workspace.reset" in admitted_events:
        report = workspace_reset_authority().validate_fixture_contracts(root=ROOT)
        authority_reports.append(report)
        for failure in report["failures"]:
            failures.append({"event_type": "browser.workspace.reset", "error": "workspace_reset_static_contract", "detail": failure})
    return {
        "schema_id": "pm.browser_event_admission_report.v1",
        "status": "fail" if failures else ("payloads_valid_registry_not_claimed" if payloads_only else "pass"),
        "required_event_families": len(required_events), "admitted_scoped_event_families": 0 if payloads_only else len(admitted_events & registered_scope),
        "prepared_scoped_event_families": len(prepared_events),
        "admission_complete": not payloads_only and not failures and admitted_events == required_events,
        "claim_boundary": "Pass means prepared-contract and exact admitted-subset consistency, not completion of pending family admission, root review, native execution, currentness or seal.",
        "registry_family_count": len(registry["families"]), **preservation,
        "positive_cases": len(fixtures["valid"]), "negative_cases": len(fixtures["invalid"]),
        "command_event_bindings_checked": len(command_bindings),
        "single_family_authority_reports": authority_reports,
        "global_event_denominator": "UNKNOWN_OPEN", "runtime_producer_proven": False, "governance_sealed": False,
        "failures": failures,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--payloads-only", action="store_true", help="Report no admission claimed; still reject inconsistent manifest/registry membership.")
    args = parser.parse_args()
    report = validate(payloads_only=args.payloads_only)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(bool(report["failures"]))
