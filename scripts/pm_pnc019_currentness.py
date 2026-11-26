#!/usr/bin/env python3
"""Pure shared PNC-019 receipt and Event Authority currentness checks.

The governed checkpoint is deliberately fail-closed.  A changed registry does
not clear Event Authority by inference.  Denominator and family-depth clearance
are never constants here: they are read from the installed currentness edition,
and only a CLOSED edition whose bound evidence this module recomputes from the
live tree clears them (PNC-019 step S7).  Any other edition, any drift and any
unreadable input leaves both residuals open.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
from pm_readiness_audit import AUDIT_REL, audit_input, snapshot_for


REQUIRED_PNC019_SOURCE_HASH_PATHS = (
    "Plans/event_record.schema.json",
    "Plans/event_family_registry.json",
    "Plans/execution_unit_context.schema.json",
    "Plans/storage_recovery_contracts.schema.json",
    "Plans/storage_value_registry.schema.json",
    "Plans/storage_value_registry.json",
    "Plans/Plan_To_Node_Compilation.md",
    "Plans/Planning_Wizard.md",
    "Plans/Executor_Protocol.md",
    "Plans/Goal_Runtime_System.md",
    "Plans/Orchestrator_Page.md",
    "Plans/Automated_Testing_System.md",
    "Plans/UI_Command_Catalog.md",
    "Plans/Wiring_Matrix.production.json",
    "Plans/UI_Wiring_Rules.md",
    "Plans/Progression_Gates.md",
    "scripts/pm-pnc019-certification-harness.py",
    "scripts/pm_pnc019_currentness.py",
    "Plans/.audits/event-authority-2026-08-13-currentness/VALIDATOR_RECEIPT.json",
)

EVENT_FAMILY_REGISTRY_REL_PATH = "Plans/event_family_registry.json"
EVENT_FAMILY_REGISTRY_SCHEMA_ID = "pm.event_family_registry.v1"
EVENT_FAMILY_REGISTRY_SCHEMA_VERSION = "2.0.0"
# DL-039 baseline approval (Jared, 2026-09-10), carried to 2026-09-11.1 (40)
# on 2026-09-11T17:01:44.364419Z, then approved by Jared on 2026-09-23 as the
# 42-family Step 8 comparison checkpoint: registry 2026-09-11.2, SHA-256
# 0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842 (approved
# predecessor 1972a6aa6ef168a46091be5347bc9cff657985a1c21ab1b84665b9ed96c1ed3a;
# provenance reports/event-authority-20260911/step-08-checkpoint-2026-09-11.2.json).
# Moved under DL-078's standing rule by the Step 9 registration landing of
# coordination.agent_registered: live registry 2026-09-25.1, 43 families, SHA-256
# 4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70 (predecessor
# 0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842).
# Moved by Jared's approval of 2026-10-10 (D42, "approved"; Plans/Decision_Log.md#DL-188,
# recorded as DL-039 and DL-045 were): workspace.layout_changed moves to family revision 2.0.0
# with the payload of Plans/Contracts_V0.md#CV-361, still 43 families: registry 2026-10-09.1,
# SHA-256 4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe (predecessor
# 4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70). The audit status file's
# pinned revision and hash move with the next reseal, not here.
# Moved by Jared's approval of 2026-11-04 ("Admit them now"; Plans/Decision_Log.md#DL-300, recorded as
# DL-188 was): settings.layer.changed (SSYS-060), approval.chat_tool_requested and
# approval.chat_tool_resolved (PS-145) are registered, and eleven Goal families gain the exact CV-366/GRS-086
# application scope-selector edition with every app producer still requires_owner_adoption: registry
# 2026-11-04.1, 46 families, SHA-256 443ae71d7e6326c3673a409f63950b9f33713c67f43c256fed6efa1c0d03a653 (predecessor
# 4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe). The audit status file's pinned revision and hash move with
# the next reseal, not here.
# Moved under DL-078's standing rule by admission merge 2 (Jared, EA-P2 B, 2026-11-14), one family per commit, each with its own
# Decision Log entry and DL-077 admission record; latest usage.event (Plans/Decision_Log.md#DL-2444):
# registry 2026-11-18.1, 518 families, SHA-256
# aa6188dd713badcfa9c902d24d917b764b23a6a9e2290bdb58de8776a2f79a5e (predecessor
# 774f6d49c5662d6115e42b880c855b5d415fd3eb234627e7405a3f493bd83204). The audit status file's pinned revision and hash
# move with the next reseal, not here.
# FIX1/T259: four owner-role corrections; membership/count and historical admission pins unchanged.
# Current registry 2026-11-19.145, SHA-256 e9eb5cc0d292efbc6c0b452928ece0a93fb0744be43066ed446128d5d2cd3e30.
# Checkpoint data only: denominator and contract-depth clearance remain false.
EVENT_FAMILY_REGISTRY_REVISION = "2026-11-19.145"
EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = 518
EVENT_FAMILY_QUARANTINED_ROW_COUNT = 252
EVENT_FAMILY_DENOMINATOR_STATUS = "UNKNOWN_OPEN"
EVENT_FAMILY_BULK_REGISTRATION_ALLOWED = False
EVENT_FAMILY_EVIDENCE_CURRENTNESS = "live_rehashed_fail_closed_currentness_audit"
EVENT_AUTHORITY_AUDIT_ROOT = AUDIT_REL
EVENT_AUTHORITY_STATUS_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/EVENT_FAMILY_DENOMINATOR_STATUS.json"
EVENT_AUTHORITY_RECEIPT_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/VALIDATOR_RECEIPT.json"
EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/GROUP_ARTIFACT_MANIFEST.json"
EVENT_AUTHORITY_QUARANTINE_LEDGER_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/QUARANTINED_EVENT_DISPOSITIONS.jsonl"
EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/CURRENT_EVENT_SOURCE_INVENTORY.json"
EVENT_FAMILY_EVIDENCE_REFS = [
    {
        "artifact_id": "EVENT_FAMILY_DENOMINATOR_STATUS.json",
        "custody_path": EVENT_AUTHORITY_STATUS_REL_PATH,
        "claim": "UNKNOWN_OPEN current status",
    },
    {
        "artifact_id": "GROUP_ARTIFACT_MANIFEST.json",
        "custody_path": EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH,
        "claim": "252 unique row-local findings quarantined without registry or checkpoint advance",
    },
]


EVENT_AUTHORITY_OPEN_STATUS = EVENT_FAMILY_DENOMINATOR_STATUS
EVENT_AUTHORITY_CLOSED_STATUS = "CLOSED"
EVENT_AUTHORITY_CLOSED_EVIDENCE_CURRENTNESS = "live_rehashed_evidence_bound_closed_edition"
EVENT_AUTHORITY_OCCURRENCES_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/EVENT_OCCURRENCES.jsonl"
EVENT_AUTHORITY_CLOSURE_ROOT = f"{EVENT_AUTHORITY_AUDIT_ROOT}/closure"
EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH = f"{EVENT_AUTHORITY_CLOSURE_ROOT}/CLOSURE_EVIDENCE.json"
EVENT_AUTHORITY_FROZEN_CHECK_RECEIPT_REL_PATH = f"{EVENT_AUTHORITY_CLOSURE_ROOT}/FROZEN_CHECK_RECEIPT.json"
EVENT_AUTHORITY_CONTINUITY_RECEIPT_REL_PATH = f"{EVENT_AUTHORITY_CLOSURE_ROOT}/EA27_EA29_CONTINUITY_RECEIPT.json"
EVENT_AUTHORITY_CLOSURE_ARTIFACT_REL_PATHS = (
    EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH,
    EVENT_AUTHORITY_FROZEN_CHECK_RECEIPT_REL_PATH,
    EVENT_AUTHORITY_CONTINUITY_RECEIPT_REL_PATH,
)
EVENT_FAMILY_CLOSED_EVIDENCE_REFS = [
    {
        "artifact_id": "EVENT_FAMILY_DENOMINATOR_STATUS.json",
        "custody_path": EVENT_AUTHORITY_STATUS_REL_PATH,
        "claim": "CLOSED current status, re-verified against the live tree",
    },
    {
        "artifact_id": "CLOSURE_EVIDENCE.json",
        "custody_path": EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH,
        "claim": "denominator D equals the live registry; every family 12/12; every token disposed; frozen check passing at current pins",
    },
]

# Native producer conformance is not part of Event Authority closure or of the
# PNC-019 receipt's claims (PLAN.md section 4, blocker 5). A CLOSED edition must
# carry exactly this object; it is a recorded boundary, never a pass.
EVENT_AUTHORITY_RUNTIME_BOUNDARY_BASIS_QUOTE = (
    "Native runtime readiness requires executable lifecycle evidence once runtime launch is enabled."
)
EVENT_AUTHORITY_RUNTIME_BOUNDARY = {
    "claim": "runtime_producer_conformance",
    "status": "NOT_RUN",
    "separate_later_claim": True,
    "included_in_event_authority_closure": False,
    "included_in_pnc019_receipt_claims": False,
    "reason": (
        "No Rust product runtime exists and runtime launch is not enabled. PNC-019 certifies the planning "
        "contracts and the in-memory local_deterministic_clean_room lifecycle harness only; native producer "
        "conformance is a later independent lane."
    ),
    "basis": [
        {
            "path": "Plans/Plan_To_Node_Compilation.md",
            "unit": "PNC-019",
            "quote": EVENT_AUTHORITY_RUNTIME_BOUNDARY_BASIS_QUOTE,
        },
        {
            "path": "Plans/.implementation_readiness/pnc019_certification_receipt.schema.json",
            "unit": "#/properties/generated_by/properties/mode",
            "quote": "local_deterministic_clean_room",
        },
    ],
}
EVENT_AUTHORITY_SEPARATE_CLAIMS = {"runtime_producer_conformance": "NOT_RUN"}

# The frozen independent validator (the seal check) and the inputs its receipt
# pins. The closing edition binds a receipt from its own run of that validator;
# every pin must still match the live file, and the validator bytes must be the
# bytes that ran.
EA_FROZEN_AUDIT_ROOT = "Plans/.audits/event-authority-2026-08-12"
EA_FROZEN_VALIDATOR_REL_PATH = f"{EA_FROZEN_AUDIT_ROOT}/independent-validator/pm_event_authority_independent_validator.py"
EA_FROZEN_RECEIPT_DIR_REL_PATH = f"{EA_FROZEN_AUDIT_ROOT}/independent-validator/receipts"
EA_FROZEN_RECEIPT_SCHEMA_ID = "pm.assurance.event_authority.independent_validation_receipt.v1"
EA_FROZEN_VALIDATOR_ID = "pm.plans.audits.event_authority.independent_validator"
EA_KNOWN37_REL_PATH = f"{EA_FROZEN_AUDIT_ROOT}/known37/KNOWN37_FROM_PLANS.json"
EA_COHORT_PINS_REL_PATH = f"{EA_FROZEN_AUDIT_ROOT}/cohort-pins/IMMUTABLE_COHORT_PINS.json"
EA_DISPOSITION_LEDGER_REL_PATH = f"{EA_FROZEN_AUDIT_ROOT}/individual-disposition/LEDGER.jsonl"
EA_CENSUS_ADJUDICATION_REL_PATH = f"{EA_FROZEN_AUDIT_ROOT}/census-adjudication/LEDGER.jsonl"
EA_RECOUNT_OUTCOMES_REL_PATH = f"{EA_FROZEN_AUDIT_ROOT}/recount/OUTCOMES.json"
EA_RECOUNT_OUTCOMES_SCHEMA_ID = "pm.assurance.event_authority.recount_outcomes.v1"
EA_RECOUNT_LIST_REL_PATH = "reports/event-authority-20261104/census-recount-20261104/NEW-LIST.json"
EA_RECOUNT_RECEIPT_REL_PATH = "reports/event-authority-20261104/census-recount-20261104/RECEIPT.json"
EA_RECOUNT_CHANGE_RECEIPT_REL_PATH = "reports/event-authority-20261105/seal-check-recount-receipt.json"
EA_ADMISSION_RECORD_DIR_REL_PATH = "reports/event-authority-20260911/admission-records"
EA_FROZEN_RECEIPT_PIN_PATHS = {
    "holding_bucket_change_receipt_sha256": "reports/event-authority-20260911/step-03-holding-bucket-receipt.json",
    "holding_authority_source_sha256": "Plans/Decision_Log.md",
    "post_august_admission_receipt_sha256": "reports/event-authority-20260911/step-10-post-august-admission-receipt.json",
    "multi_family_step_receipt_sha256": "reports/event-authority-20261104/seal-check-multifamily-step-receipt.json",
    "known37_sha256": EA_KNOWN37_REL_PATH,
    "cohort_pins_sha256": EA_COHORT_PINS_REL_PATH,
    "denominator_sha256": f"{EA_FROZEN_AUDIT_ROOT}/closed-world-census/denominator/FRESH_CENSUS_DENOMINATOR.json",
    "ledger_sha256": EA_DISPOSITION_LEDGER_REL_PATH,
    "census_adjudication_sha256": EA_CENSUS_ADJUDICATION_REL_PATH,
    "census_partition_sha256": f"{EA_FROZEN_AUDIT_ROOT}/census-adjudication/PARTITION.json",
    "registry_sha256": EVENT_FAMILY_REGISTRY_REL_PATH,
    "freeze_sha256": f"{EA_FROZEN_AUDIT_ROOT}/closed-world-census/CURRENT_SOURCE_INVENTORY.json",
    "august_checkpoint_drafts_sha256": f"{EA_FROZEN_AUDIT_ROOT}/august-checkpoint-drafts/AUGUST_CHECKPOINT_DRAFTS.jsonl",
}
# Files outside Plans/*.md and the edition's machine inputs that the closure reads;
# the edition's own inventory already rehashes every direct Plans document.
EA_CLOSURE_BOUND_FILES = (
    "reports/event-authority-20260911/step-03-holding-bucket-receipt.json",
    "reports/event-authority-20260911/step-10-post-august-admission-receipt.json",
    "reports/event-authority-20261104/seal-check-multifamily-step-receipt.json",
    EA_RECOUNT_CHANGE_RECEIPT_REL_PATH,
    EA_RECOUNT_RECEIPT_REL_PATH,
    EA_RECOUNT_LIST_REL_PATH,
)
EA_CLOSURE_BOUND_TREES = (EA_FROZEN_AUDIT_ROOT, EA_ADMISSION_RECORD_DIR_REL_PATH)
EA_CLOSURE_UNBOUND_PREFIXES = (EA_FROZEN_RECEIPT_DIR_REL_PATH + "/",)
EA_AUGUST_PAIR = ("terminal.workgroup_moved", "workspace.layout_changed")
EA_CPU_BUCKET = "confirmed_persisted_unregistered"
EA_CPU_OPEN_DISPOSITIONS = ("KEEP_QUARANTINED", "NEEDS_MORE_EVIDENCE")
EA_DEPTH_CRITERIA = (
    "membership_version",
    "owner_doc",
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
)
EA_EVIDENCE_LEDGER_PREFIXES = ("reports/", "Plans/.audits/event-authority-2026-08-12/")

# S6 token-disposition ledger, in the row format of the S6 classifier
# (scripts/pm-event-token-dispositions.py on plans/ea-pnc-s6c-20261114): one JSONL
# row per census token with exact_token, disposition, resolution_state, rule_id
# and source_rows pins. Final dispositions close a token; open ones refuse closure;
# any other value is outside the reviewed vocabulary and refuses too.
EA_TOKEN_FINAL_DISPOSITIONS = {
    "REGISTERED_MEMBERSHIP_OBSERVED": ("observed", "registered"),
    "EXCLUDED_BY_LANDED_ROW": ("disposed", "landed_exclusion"),
    "EXCLUDED_BY_RECOUNT_OUTCOME": ("disposed", "recount_outcome"),
    "ALIAS_ONLY_NOT_ADMITTED": ("disposed", "landed_alias"),
    "HOLDING_QUARANTINE_OUTSIDE_D": ("disposed", "holding_quarantine"),
    "NON_EVENT_COMMAND_REFERENCE": ("mechanical", "command_namespace"),
    "NON_EVENT_IDENTIFIER_REFERENCE": ("mechanical", "identifier_namespace"),
    "NON_EVENT_FILENAME_REFERENCE": ("mechanical", "filename_reference"),
    "NON_EVENT_VERSION_IDENTIFIER": ("mechanical", "version_identifier"),
    "NON_EVENT_FIELD_OR_UI_REFERENCE": ("mechanical", "field_or_ui_path"),
    "NON_EVENT_NEGATIVE_CONTEXT_REFERENCE": ("mechanical", "negative_context_reference"),
    "SCHEMA_FIXTURE_CONTEXT_REFERENCE": ("mechanical", "schema_fixture_reference"),
    "LINEAGE_CONTEXT_REFERENCE": ("mechanical", "lineage_context_reference"),
}
EA_TOKEN_OPEN_DISPOSITIONS = {
    "PENDING_ADMISSION_OR_OWNER_EVIDENCE",
    "PENDING_RECOUNT_OUTCOME",
    "PREPARED_NOT_ADMITTED",
    "OWNER_REVIEW_REQUIRED",
}
# The S6 classifier's exact lexical predicates (same regular expressions), applied
# again here to every mechanical row of the matching rule.
EA_TOKEN_LEXICAL_RULES = {
    "command_namespace": lambda token: token.startswith("cmd."),
    "identifier_namespace": lambda token: token.startswith(("pm.", "https.", "www.")),
    "filename_reference": lambda token: re.search(r"\.(?:json|jsonl|md|txt|bin|redb|xml|tmp|tsv|rs|py|toml|yaml|yml|db)$", token) is not None,
    "version_identifier": lambda token: re.search(r"(?:\.|_)v\d+$", token) is not None,
    "field_or_ui_path": lambda token: re.search(
        r"^(?:payload|details|diagnostic|original|page|task|rule|artifact|self|cause|actual|affected_scope|allowed_scope|"
        r"cancellation_scope|retention_hold_record|tier_node|parallel_group|done|format|config|settings|ui|local|widget|catalog|home)\.",
        token,
    ) is not None,
}
EA_TOKEN_CONTEXT_RULES = {
    "negative_context_reference": "explicit_non_event_or_forbidden_family",
    "schema_fixture_reference": "schema_or_fixture_event_example",
    "lineage_context_reference": "compatibility_or_source_lineage",
}
# Same pattern as EVENT_VERB_RE in scripts/pm-event-authority-currentness.py (its
# self-test asserts equality): an event-like last segment never takes a context rule.
EA_EVENT_VERB_PATTERN = (
    r"(?:^|_)(?:started|completed|failed|cancelled|canceled|stopped|blocked|created|deleted|"
    r"updated|changed|detected|applied|expired|replanned|scheduled|progressed|recorded|"
    r"evaluated|captured|invoked|denied|requested|required|restored|opened|closed|"
    r"disconnected|connected|renamed|moved|exported|appended|unavailable|degraded)$"
)
EA_LEDGER_FINAL_EXCLUDED = {"RECLASSIFY_TO_EXCLUDED", "RECONFIRM_EXCLUDE", "CONFIRM_EXACT_EXCLUDE", "REJECTED_LEXICAL_CANDIDATE"}
EA_LEDGER_INTERIM = {"KEEP_QUARANTINED", "NEEDS_MORE_EVIDENCE"}
EA_LEDGER_DIRS = (f"{EA_FROZEN_AUDIT_ROOT}/census-adjudication", f"{EA_FROZEN_AUDIT_ROOT}/individual-disposition")
# Canon pins of the external July Event Authority artifacts (Plans/storage-plan.md,
# the Event Authority currentness boundary paragraph). Finding 4 of PLAN.md.
EA_CONTINUITY_RECEIPT_SCHEMA_ID = "pm.event_authority.ea27_ea29_continuity_receipt.v1"
EA_CANON_PIN_SOURCE_REL_PATH = "Plans/storage-plan.md"
EA27_LOGICAL_NAME = "EA-27_PRODUCER_UNION_AND_DENOMINATOR.json"
EA29_LOGICAL_NAME = "EA-29_TERMINAL_FINDINGS_RESIDUALS_CONTRACT_DEPTH_REPAIR_AND_WAVE1_CHECKPOINT.md"
EA27_CANON_SHA256 = "644c6d0bc913eaed62f41e231fdb7e04f55d270549fcdede73a0869994111e47"
EA29_CANON_SHA256 = "17820aef1b498acf2e5165bee106171ff1ef35a1b23fa67d0cc23e291a8ed7bf"
EA27_UNION_ROWS_CANON_SHA256 = "aa9c365904788eba74df73bb1b5eecaae903a6aa167e0514b7937198aa0dbf4d"
EA_CONTINUITY_COHORT_BY_CLASSIFICATION = {
    "registered": "known37",
    "confirmed_persisted_unregistered": "july248_confirmed_persisted_unregistered",
    "excluded": "july68_exact_excluded",
    "alias": "july40_unresolved",
    "candidate_only": "july40_unresolved",
    "conflicting": "july40_unresolved",
    "emit_only": "july40_unresolved",
    "unknown": "july40_unresolved",
    "non_exact_pattern_or_schema_invalid_token": "july26_non_exact",
}
EA_CONTINUITY_COHORTS = (
    "known37",
    "july248_confirmed_persisted_unregistered",
    "july40_unresolved",
    "july68_exact_excluded",
    "july26_non_exact",
)
HELPER_REPO_ROOT = Path(__file__).resolve().parents[1]


# ---------------------------------------------------------------------------
# The edition's source set and occurrence census: one implementation, used by
# the generator to write an edition and by the CLOSED consumer to re-derive both
# from the live tree instead of trusting the edition's own inventory or token
# list (s7 fix 1: an omitted inventory row, re-bound, must not hide drift).
# ---------------------------------------------------------------------------
EA_HISTORICAL_INVENTORY_REL_PATH = (
    f"{EA_FROZEN_AUDIT_ROOT}/closed-world-census/CURRENT_SOURCE_INVENTORY.FRESH_20260812T0900.json"
)
# Fixed byte pin of the one non-canonical selector of the required source set
# (s7 fix 2, R1-F1). The August discovery inventory sits under Plans/.audits,
# outside canon review: an edited copy would redefine what an edition must
# inventory, so the writer and the CLOSED consumer both refuse anything but these
# bytes. The other selectors are canon the edition inventories itself
# (Plans/00-plans-index.md, the registry's payload refs, the Plans/*.md glob)
# or constants of this module (explicit inputs, derived outputs).
EA_HISTORICAL_INVENTORY_SHA256 = "83c12ad98e218fe8c29eff60756cdbe83daf1884cc67bc87fac62fd0ede1129a"
EA_HISTORICAL_INVENTORY_BYTES = 46241
EA_DIRECT_PROSE_CLASS = "direct_canonical_plan_prose"
EA_MACHINE_INPUT_CLASS = "registered_machine_input"
EA_EXPLICIT_NEW_MACHINE_INPUTS = (
    "Plans/runtime_integration_disposition.json",
    "Plans/shared_runtime_contracts.schema.json",
)
EA_DERIVED_VALIDATION_OUTPUTS = (
    # This report consumes Event Authority currentness. Including its raw bytes
    # in the Event Authority source manifest creates a self-invalidating cycle:
    # regenerating the report makes the audit stale, while regenerating the
    # audit changes the report's next validation result. It is derived evidence,
    # not an event-family semantic source.
    "Plans/.implementation_readiness/buildability_gate_report.json",
    # The node-readiness report also consumes the PNC/Event Authority result.
    # Hashing it into the audit makes `pm-plan-index generate` invalidate the
    # evidence used to compute the report that it just wrote.
    "Plans/.plan_index/node_readiness_report.json",
    # The PNC-019 certification receipt binds this audit's VALIDATOR_RECEIPT.json
    # (REQUIRED_PNC019_SOURCE_HASH_PATHS). Inventorying the receipt's bytes here
    # leaves no fixed point: each harness run drifts the edition, and each new
    # edition stales the receipt's binding (PNC-019 scope finding 3).
    "Plans/.implementation_readiness/pnc019_certification_receipt.json",
)
EA_SOURCE_EXCLUSIONS = [
    {"pattern": "Plans/.audits/**", "reason": "audit evidence is validation-only and cannot originate product authority; this audit is also excluded from its own corpus"},
    {"pattern": "Plans/.evidence/**", "reason": "generated governance evidence"},
    {"pattern": "Plans/_shards/**", "reason": "generated mirrors of canonical Plans"},
    {"pattern": "Plans/.plan_index/**", "reason": "generated PlanUnit/index/readiness outputs; node readiness consumes this audit and is excluded to prevent a self-invalidating currentness cycle"},
    {"pattern": "Plans/.plan_migration/** except the two inherited registered hash/alias inputs", "reason": "migration evidence rather than live product authority; retained exceptions are drift-custody inputs and cannot originate event membership"},
    {"pattern": "Plans/ledgers/** except the historically registered ledger_registry.json and plan_unit.schema.json", "reason": "source-lineage memory, not canonical product prose"},
    {"pattern": "Plans/Spec_Lock.json, Plans/auto_decisions.jsonl", "reason": "governance artifacts, not event-family semantic owners"},
    {"pattern": "Plans/.implementation_readiness/buildability_gate_report.json", "reason": "derived validator output that consumes this audit; excluded to prevent a self-invalidating currentness cycle"},
    {"pattern": "Plans/.implementation_readiness/pnc019_certification_receipt.json", "reason": "derived PNC-019 certification receipt that binds this audit's VALIDATOR_RECEIPT.json; excluded to prevent a self-invalidating currentness cycle"},
    {"pattern": "other generated readiness outputs except machine inputs inherited from the registered August inventory or referenced by the live index", "reason": "included exceptions are validation/checkpoint custody only and cannot originate event-family membership"},
    {"pattern": "Concepts/**, reports/**, output/**", "reason": "prototype, report, or generated-output surfaces outside canonical Plans"},
    {"pattern": "src/**/*.rs", "reason": "no current Rust product implementation exists; runtime producer conformance is a later independent lane"},
]
EA_TOKEN_RE = re.compile(r"(?<![A-Za-z0-9_./-])([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+)(?![A-Za-z0-9_./-])")
EA_EVENT_CUE_RE = re.compile(
    r"\b(?:event[_ -]?type|event family|eventrecord|persist(?:ed|s|ing)? event|"
    r"seglog|canonical ledger|emit(?:s|ted|ting)?|append(?:s|ed|ing)?|"
    r"expected_event_types|domain event|event stream|event payload|event schema)\b",
    re.I,
)
EA_NEGATIVE_RE = re.compile(
    r"\b(?:must not|does not|do not|never|no)\b.{0,100}\b(?:emit|eventrecord|event family|persisted event)\b|"
    r"\b(?:not an?|without an?)\s+(?:eventrecord|event family|persisted event)",
    re.I,
)
EA_COMPAT_RE = re.compile(r"\b(?:compatibility|legacy|retired|stale|supersed(?:e|ed)|source[- ]lineage|alias)\b", re.I)
EA_SCHEMA_RE = re.compile(r"\b(?:schema|fixture|example|sample|draft|candidate)\b", re.I)
EA_EVENT_VERB_RE = re.compile(EA_EVENT_VERB_PATTERN)
EA_CENSUS_PRIORITY = {
    "registered_event_family_declaration": 0,
    "likely_persisted_event_candidate": 1,
    "schema_or_fixture_event_example": 2,
    "compatibility_or_source_lineage": 3,
    "explicit_non_event_or_forbidden_family": 4,
    "non_event_command": 5,
    "schema_or_identifier_non_event": 6,
    "ambiguous_event_like_token": 7,
}
EA_EDITION_ARTIFACT_REL_PATHS = tuple(sorted(
    (
        EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH,
        EVENT_AUTHORITY_OCCURRENCES_REL_PATH,
        EVENT_AUTHORITY_STATUS_REL_PATH,
        f"{EVENT_AUTHORITY_AUDIT_ROOT}/README.md",
        f"{EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/EXPECTED_252_EVENT_TYPES.tsv",
        EVENT_AUTHORITY_QUARANTINE_LEDGER_REL_PATH,
        EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH,
        *(f"{EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/source_groups/group_{g}.jsonl" for g in "abcdefg"),
        *EVENT_AUTHORITY_CLOSURE_ARTIFACT_REL_PATHS,
    )
))


def event_authority_selector_pin_problem(historical_raw: bytes) -> str | None:
    """None when the August discovery inventory is exactly its pinned bytes."""
    if len(historical_raw) != EA_HISTORICAL_INVENTORY_BYTES or _sha256_bytes(historical_raw) != EA_HISTORICAL_INVENTORY_SHA256:
        return (
            f"{EA_HISTORICAL_INVENTORY_REL_PATH} is not its pinned bytes "
            f"({len(historical_raw)} bytes, SHA-256 {_sha256_bytes(historical_raw)}; pinned "
            f"{EA_HISTORICAL_INVENTORY_BYTES} bytes, SHA-256 {EA_HISTORICAL_INVENTORY_SHA256})"
        )
    return None


def event_authority_machine_input_candidates(root: Path, *, historical_inventory: Path | None = None) -> set[str]:
    """Machine inputs the edition must inventory, before the derived-output exclusion.

    Refuses (ClosureInputError) unless the August discovery inventory is its pinned bytes.
    """
    root = Path(root)
    historical = Path(historical_inventory) if historical_inventory is not None else root / EA_HISTORICAL_INVENTORY_REL_PATH
    historical_raw = historical.read_bytes()
    problem = event_authority_selector_pin_problem(historical_raw)
    if problem:
        raise ClosureInputError(problem)
    return event_authority_machine_inputs_from_selector(root, historical_raw)


def event_authority_machine_inputs_from_selector(root: Path, historical_raw: bytes) -> set[str]:
    """The machine-input derivation itself, over given selector bytes (callers check the pin first)."""
    root = Path(root)
    old = json.loads(historical_raw.decode("utf-8"))
    paths = {row["path"] for row in old["sources"] if not row["path"].endswith(".md")}
    index_text = (root / "Plans/00-plans-index.md").read_text(encoding="utf-8")
    for match in re.finditer(r"Plans/[A-Za-z0-9_./-]+\.(?:json|jsonl)", index_text):
        candidate = match.group(0).rstrip(".,;:)")
        if (root / candidate).is_file() and not candidate.startswith("Plans/.audits/"):
            paths.add(candidate)
    registry = json.loads((root / EVENT_FAMILY_REGISTRY_REL_PATH).read_text(encoding="utf-8"))
    for row in registry["families"]:
        ref = row.get("payload_schema_ref")
        if isinstance(ref, dict) and isinstance(ref.get("path"), str):
            candidate = ref["path"]
            if (root / candidate).is_file():
                paths.add(candidate)
    paths |= {p for p in EA_EXPLICIT_NEW_MACHINE_INPUTS if (root / p).is_file()}
    return paths


def event_authority_required_sources(root: Path, *, historical_inventory: Path | None = None) -> dict[str, str]:
    """Every source the edition must inventory, with its authority class, derived from the live tree."""
    root = Path(root)
    direct = {p.relative_to(root).as_posix() for p in (root / "Plans").glob("*.md") if p.is_file()}
    machine = event_authority_machine_input_candidates(root, historical_inventory=historical_inventory)
    machine -= set(EA_DERIVED_VALIDATION_OUTPUTS)
    required = {path: EA_MACHINE_INPUT_CLASS for path in machine}
    required.update({path: EA_DIRECT_PROSE_CLASS for path in direct})
    return required


def event_authority_census_classify(token: str, window: str, registered: set[str], suffix: str) -> tuple[str, list[str]]:
    if token.startswith("cmd."):
        return "non_event_command", ["cmd_namespace"]
    if token.startswith(("pm.", "https.", "www.")):
        return "schema_or_identifier_non_event", ["schema_or_identifier_namespace"]
    if token in registered:
        return "registered_event_family_declaration", ["registered_exact_type"]
    if EA_NEGATIVE_RE.search(window):
        return "explicit_non_event_or_forbidden_family", ["explicit_negative_event_context"]
    if EA_COMPAT_RE.search(window):
        return "compatibility_or_source_lineage", ["compatibility_or_source_lineage_context"]
    if (suffix == ".json" or EA_SCHEMA_RE.search(window)) and EA_EVENT_CUE_RE.search(window):
        return "schema_or_fixture_event_example", ["schema_or_fixture_context", "event_language_context"]
    if EA_EVENT_CUE_RE.search(window) and EA_EVENT_VERB_RE.search(token.rsplit(".", 1)[-1]):
        return "likely_persisted_event_candidate", ["event_language_context", "event_like_terminal_verb"]
    return "ambiguous_event_like_token", ["event_language_context_only"]


def event_authority_census_rows(sources: dict[str, bytes], registered: set[str]) -> list[dict[str, Any]]:
    """The occurrence census over repository-relative source bytes (the edition's EVENT_OCCURRENCES rows)."""
    # One alternation finds "some registered type is a substring of the line"
    # exactly as the per-type `in` scan did, at a fraction of the cost.
    registered_re = re.compile("|".join(re.escape(t) for t in sorted(registered))) if registered else None
    by_token: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for path in sorted(sources):
        lines = sources[path].decode("utf-8", errors="replace").splitlines()
        stripped = [line.strip() for line in lines]
        suffix = PurePosixPath(path).suffix
        for i, line in enumerate(lines):
            lo, hi = max(0, i - 1), min(len(lines), i + 2)
            window = " ".join(stripped[lo:hi])
            if not EA_EVENT_CUE_RE.search(window) and not (registered_re is not None and registered_re.search(line)):
                continue
            for match in EA_TOKEN_RE.finditer(line):
                token = match.group(1)
                disposition, cues = event_authority_census_classify(token, window, registered, suffix)
                context = stripped[i]
                by_token[token].append({
                    "path": path,
                    "line": i + 1,
                    "context": context,
                    "context_sha256": _sha256_bytes(context.encode()),
                    "extraction_cues": cues,
                    "mechanical_classification": disposition,
                })
    rows = []
    for token in sorted(by_token):
        occs = sorted(by_token[token], key=lambda x: (x["path"], x["line"], x["context_sha256"]))
        classes = sorted({x["mechanical_classification"] for x in occs}, key=lambda x: EA_CENSUS_PRIORITY[x])
        if token in registered:
            primary = "registered_event_family_declaration"
        elif "likely_persisted_event_candidate" in classes and "explicit_non_event_or_forbidden_family" in classes:
            primary = "contested_positive_and_negative_event_evidence"
        else:
            primary = classes[0]
        rows.append({
            "exact_token": token,
            "registered": token in registered,
            "primary_mechanical_classification": primary,
            "all_mechanical_classifications": classes,
            "occurrence_count": len(occs),
            "occurrences": occs,
            "authority_boundary": "discovery_only_owner_adjudication_required" if token not in registered else "registry_membership_observed_not_depth_certified",
        })
    return rows


def event_authority_census_blob(rows: list[dict[str, Any]]) -> bytes:
    return b"".join(json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode() + b"\n" for row in rows)


_CENSUS_CACHE: dict[str, bytes] = {}


def _census_blob_for(sources: dict[str, bytes], registered: set[str]) -> bytes:
    # The census is a pure function of these bytes; recompute once per process.
    key = _canonical_sha256([sorted((path, _sha256_bytes(data)) for path, data in sources.items()), sorted(registered)])
    if key not in _CENSUS_CACHE:
        _CENSUS_CACHE[key] = event_authority_census_blob(event_authority_census_rows(sources, registered))
    return _CENSUS_CACHE[key]


def event_authority_closed_custody_failures(
    root: Path,
    *,
    inventory: Any,
    occurrences_raw: bytes,
    artifact_hashes: Any,
    historical_inventory: Path | None = None,
) -> list[dict[str, Any]]:
    """A CLOSED edition's inventory, exclusions, artifact set and census, each re-derived from the live tree."""
    root = Path(root)
    failures: list[dict[str, Any]] = []
    # The selector that defines the required set is checked before it is trusted:
    # walking and rehashing an editable selector would only re-bind the edit.
    selector = Path(historical_inventory) if historical_inventory is not None else root / EA_HISTORICAL_INVENTORY_REL_PATH
    try:
        selector_raw = selector.read_bytes()
    except OSError as exc:
        return [{"error": "event_authority_closure_source_selector_unpinned", "selector": EA_HISTORICAL_INVENTORY_REL_PATH, "detail": str(exc)}]
    problem = event_authority_selector_pin_problem(selector_raw)
    if problem:
        return [{"error": "event_authority_closure_source_selector_unpinned", "selector": EA_HISTORICAL_INVENTORY_REL_PATH, "detail": problem}]
    try:
        required = event_authority_required_sources(root, historical_inventory=historical_inventory)
    except Exception as exc:  # noqa: BLE001 - an underivable source set never clears.
        return [{"error": "event_authority_closure_source_set_mismatch", "detail": f"required source set underivable: {exc}"}]
    rows = inventory.get("sources") if isinstance(inventory, dict) else None
    listed: dict[str, Any] = {}
    duplicates: list[Any] = []
    for row in rows if isinstance(rows, list) else []:
        path = row.get("path") if isinstance(row, dict) else None
        if not isinstance(path, str) or path in listed:
            duplicates.append(path)
            continue
        listed[path] = row.get("authority_class")
    omitted = sorted(set(required) - set(listed))
    extra = sorted(set(listed) - set(required))
    reclassed = sorted(path for path in set(required) & set(listed) if listed[path] != required[path])
    if not isinstance(rows, list) or omitted or extra or reclassed or duplicates:
        failures.append({
            "error": "event_authority_closure_source_set_mismatch",
            "omitted": omitted[:50],
            "extra": extra[:50],
            "reclassed": reclassed[:50],
            "duplicates": duplicates[:50],
        })
    if not isinstance(inventory, dict) or inventory.get("explicit_exclusions") != EA_SOURCE_EXCLUSIONS:
        failures.append({"error": "event_authority_closure_exclusions_mismatch"})
    bound = set(artifact_hashes) if isinstance(artifact_hashes, dict) else set()
    if bound != set(EA_EDITION_ARTIFACT_REL_PATHS):
        failures.append({
            "error": "event_authority_currentness_artifact_set_mismatch",
            "missing": sorted(set(EA_EDITION_ARTIFACT_REL_PATHS) - bound),
            "extra": sorted(bound - set(EA_EDITION_ARTIFACT_REL_PATHS)),
        })
    try:
        sources = {path: _read_rel(root, path) for path in required}
        registered = {row["event_type"] for row in _strict_json(_read_rel(root, EVENT_FAMILY_REGISTRY_REL_PATH))["families"]}
        census = _census_blob_for(sources, registered)
    except Exception as exc:  # noqa: BLE001
        failures.append({"error": "event_authority_closure_census_mismatch", "detail": f"census underivable: {exc}"})
        return failures
    if census != occurrences_raw:
        failures.append({
            "error": "event_authority_closure_census_mismatch",
            "recomputed_sha256": _sha256_bytes(census),
            "edition_sha256": _sha256_bytes(occurrences_raw),
        })
    return failures


@dataclass(frozen=True)
class EventAuthorityCheckpoint:
    """Expected registry checkpoint plus clearance read from the installed edition."""

    registry_schema_id: str
    registry_schema_version: str
    registry_revision: str
    registered_kernel_rows: int
    complete_denominator_known: bool
    contract_depth_complete: bool
    denominator_status: str = EVENT_AUTHORITY_OPEN_STATUS
    evidence_currentness: str = EVENT_FAMILY_EVIDENCE_CURRENTNESS
    denominator_event_types_sha256: str | None = None


def open_event_authority_checkpoint() -> EventAuthorityCheckpoint:
    """The fail-closed checkpoint: what every unverified edition yields."""
    return EventAuthorityCheckpoint(
        registry_schema_id=EVENT_FAMILY_REGISTRY_SCHEMA_ID,
        registry_schema_version=EVENT_FAMILY_REGISTRY_SCHEMA_VERSION,
        registry_revision=EVENT_FAMILY_REGISTRY_REVISION,
        registered_kernel_rows=EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT,
        complete_denominator_known=False,
        contract_depth_complete=False,
    )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def audit_error_detail(root: Path, exc: Exception) -> str:
    detail = str(exc)
    snapshot = snapshot_for(root)
    if snapshot is not None:
        detail = detail.replace(str(snapshot), str(root / EVENT_AUTHORITY_AUDIT_ROOT))
    return detail


def event_authority_audit_failures(root: Path) -> list[dict[str, Any]]:
    """Rehash and validate the current in-repo fail-closed audit binding."""
    failures: list[dict[str, Any]] = []
    try:
        receipt = json.loads(audit_input(root, EVENT_AUTHORITY_RECEIPT_REL_PATH).read_text(encoding="utf-8"))
        status = json.loads(audit_input(root, EVENT_AUTHORITY_STATUS_REL_PATH).read_text(encoding="utf-8"))
        manifest = json.loads(audit_input(root, EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH).read_text(encoding="utf-8"))
        inventory = json.loads(audit_input(root, EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH).read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - currentness must fail closed.
        return [{"error": "event_authority_currentness_audit_unavailable", "detail": audit_error_detail(root, exc)}]

    artifact_hashes = receipt.get("artifact_hashes")
    if not isinstance(artifact_hashes, dict):
        failures.append({"error": "event_authority_currentness_artifact_hashes_invalid"})
        artifact_hashes = {}
    for artifact_path, expected_sha in artifact_hashes.items():
        target = audit_input(root, artifact_path)
        if not target.is_file():
            failures.append({"error": "event_authority_currentness_artifact_missing", "artifact_path": artifact_path})
        elif not isinstance(expected_sha, str) or sha256_file(target) != expected_sha:
            failures.append({"error": "event_authority_currentness_artifact_drift", "artifact_path": artifact_path})

    inventory_sources = inventory.get("sources")
    if not isinstance(inventory_sources, list):
        failures.append({"error": "event_authority_currentness_source_inventory_invalid"})
        inventory_sources = []
    inventoried_paths: set[str] = set()
    for row in inventory_sources:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str):
            failures.append({"error": "event_authority_currentness_source_inventory_row_invalid"})
            continue
        source_path = row["path"]
        inventoried_paths.add(source_path)
        target = root / source_path
        if not target.is_file():
            failures.append({"error": "event_authority_currentness_source_missing", "source_path": source_path})
        elif target.stat().st_size != row.get("bytes") or sha256_file(target) != row.get("sha256"):
            failures.append({"error": "event_authority_currentness_source_drift", "source_path": source_path})
    live_direct_plans = {
        path.relative_to(root).as_posix()
        for path in (root / "Plans").glob("*.md")
        if path.is_file()
    }
    inventoried_direct_plans = {
        row["path"]
        for row in inventory_sources
        if isinstance(row, dict) and row.get("authority_class") == "direct_canonical_plan_prose"
    }
    if live_direct_plans != inventoried_direct_plans:
        failures.append({"error": "event_authority_currentness_direct_plans_source_set_drift"})

    validator_path = receipt.get("validator_path")
    validator_sha = receipt.get("validator_sha256")
    if not isinstance(validator_path, str) or not (root / validator_path).is_file():
        failures.append({"error": "event_authority_currentness_validator_missing"})
    elif sha256_file(root / validator_path) != validator_sha:
        failures.append({"error": "event_authority_currentness_validator_drift", "validator_path": validator_path})

    if status.get("status") == EVENT_AUTHORITY_CLOSED_STATUS:
        # A CLOSED edition clears nothing by assertion: its receipt must say so,
        # bind every closure artifact, and its evidence must recompute from the
        # live tree (event_authority_closure_failures).
        if (
            receipt.get("evidence_valid") is not True
            or receipt.get("event_authority_closed") is not True
            or receipt.get("separate_claims") != EVENT_AUTHORITY_SEPARATE_CLAIMS
        ):
            failures.append({"error": "event_authority_currentness_receipt_closure_mismatch"})
        try:
            occurrences_raw = audit_input(root, EVENT_AUTHORITY_OCCURRENCES_REL_PATH).read_bytes()
        except OSError:
            occurrences_raw = b""
        failures.extend(event_authority_closed_custody_failures(
            root, inventory=inventory, occurrences_raw=occurrences_raw, artifact_hashes=artifact_hashes))
        failures.extend(event_authority_closure_failures(root, status=status))
    else:
        if receipt.get("evidence_valid") is not True or receipt.get("event_authority_closed") is not False:
            failures.append({"error": "event_authority_currentness_receipt_not_fail_closed"})
        if not (
            status.get("status") == "UNKNOWN_OPEN"
            and status.get("closed") is False
            and status.get("complete_denominator_known") is False
            and status.get("contract_depth_complete") is False
            and status.get("build_or_pnc019_authority") is False
        ):
            failures.append({"error": "event_authority_currentness_status_not_unknown_open"})
    live_registry = root / EVENT_FAMILY_REGISTRY_REL_PATH
    registry_status = status.get("registry", {})
    if not live_registry.is_file() or not (
        registry_status.get("live_family_count") == EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT
        and registry_status.get("revision") == EVENT_FAMILY_REGISTRY_REVISION
        and registry_status.get("sha256") == sha256_file(live_registry)
    ):
        failures.append({"error": "event_authority_currentness_live_registry_drift"})
    quarantine = status.get("row_local_quarantine", {})
    union = manifest.get("union", {})
    if not (
        quarantine.get("row_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and quarantine.get("unique_event_type_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and quarantine.get("bulk_registration") is False
        and union.get("row_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and union.get("unique_event_type_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and union.get("quarantined_row_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and union.get("exact_set_equality") is True
        and all(
            json.loads(line).get("audit_disposition")
            == "KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE"
            for line in audit_input(root, EVENT_AUTHORITY_QUARANTINE_LEDGER_REL_PATH)
            .read_text(encoding="utf-8")
            .splitlines()
            if line.strip()
        )
        and manifest.get("bulk_registration") is False
        and manifest.get("complete_denominator_known") is False
        and manifest.get("contract_depth_complete") is False
    ):
        failures.append({"error": "event_authority_quarantined_252_manifest_invalid"})
    return failures


def _with_path(failure: dict[str, Any], path_label: str | None) -> dict[str, Any]:
    if path_label is None:
        return failure
    return {"path": path_label, **failure}


def pnc019_source_hash_failures(
    root: Path,
    source_hashes: Any,
    *,
    path_label: str | None = None,
) -> list[dict[str, Any]]:
    """Check every governed receipt dependency against the live repository."""
    failures: list[dict[str, Any]] = []
    if not isinstance(source_hashes, dict):
        failures.append(
            _with_path({"error": "pnc019_source_hashes_missing_or_invalid"}, path_label)
        )
        source_hashes = {}

    for source_path in REQUIRED_PNC019_SOURCE_HASH_PATHS:
        target = audit_input(root, source_path)
        if not target.is_file():
            failures.append(
                _with_path(
                    {
                        "error": "pnc019_source_hash_path_missing",
                        "source_path": source_path,
                    },
                    path_label,
                )
            )
            continue
        expected = sha256_file(target)
        actual = source_hashes.get(source_path)
        if actual != expected:
            failures.append(
                _with_path(
                    {
                        "error": "pnc019_source_hash_stale",
                        "source_path": source_path,
                        "expected": expected,
                        "actual": actual,
                    },
                    path_label,
                )
            )
    return failures


def _registry_event_types_sha256(families: Any) -> str | None:
    if not isinstance(families, list):
        return None
    event_types = [row.get("event_type") for row in families if isinstance(row, dict)]
    if len(event_types) != len(families) or not all(isinstance(value, str) for value in event_types):
        return None
    return hashlib.sha256(("\n".join(sorted(set(event_types))) + "\n").encode()).hexdigest()


def pnc019_event_authority_failures_for_registry(
    registry: Any,
    *,
    path_label: str | None = None,
    checkpoint: EventAuthorityCheckpoint | None = None,
    root: Path | None = None,
) -> list[dict[str, Any]]:
    """Require both denominator and family-depth clearance at the live checkpoint.

    Clearance comes from the installed edition (event_authority_checkpoint), never
    from a constant, and only for the exact family set the CLOSED edition proved.
    """
    if not isinstance(registry, dict):
        return [
            _with_path(
                {"error": "event_family_registry_unavailable", "detail": "registry is not an object"},
                path_label,
            )
        ]
    if checkpoint is None:
        checkpoint = event_authority_checkpoint(root)

    families = registry.get("families")
    actual_registered_rows = len(families) if isinstance(families, list) else -1
    actual_checkpoint = {
        "registry_schema_id": registry.get("schema_id"),
        "registry_schema_version": registry.get("schema_version"),
        "registry_revision": registry.get("registry_revision"),
        "registered_kernel_rows": actual_registered_rows,
    }
    expected_checkpoint = {
        "registry_schema_id": checkpoint.registry_schema_id,
        "registry_schema_version": checkpoint.registry_schema_version,
        "registry_revision": checkpoint.registry_revision,
        "registered_kernel_rows": checkpoint.registered_kernel_rows,
    }
    failures: list[dict[str, Any]] = []
    if actual_checkpoint != expected_checkpoint:
        failures.append(
            _with_path(
                {
                    "error": "event_authority_checkpoint_changed_requires_fresh_approval",
                    "expected_checkpoint": expected_checkpoint,
                    "actual_checkpoint": actual_checkpoint,
                    "denominator_status": EVENT_FAMILY_DENOMINATOR_STATUS,
                    "evidence_currentness": EVENT_FAMILY_EVIDENCE_CURRENTNESS,
                    "evidence_refs": EVENT_FAMILY_EVIDENCE_REFS,
                },
                path_label,
            )
        )

    # The closed denominator covers exactly the family set it proved; any other
    # registry (a clone, a later admission) is unresolved until a new edition.
    covers_registry = (
        checkpoint.denominator_event_types_sha256 is not None
        and _registry_event_types_sha256(families) == checkpoint.denominator_event_types_sha256
    )
    if not (checkpoint.complete_denominator_known and covers_registry):
        failures.append(
            _with_path(
                {
                    "error": "event_denominator_unresolved",
                    "registered_kernel_rows": actual_registered_rows,
                    "quarantined_row_count": EVENT_FAMILY_QUARANTINED_ROW_COUNT,
                    "denominator_status": EVENT_FAMILY_DENOMINATOR_STATUS,
                    "bulk_registration_allowed": EVENT_FAMILY_BULK_REGISTRATION_ALLOWED,
                    "evidence_currentness": EVENT_FAMILY_EVIDENCE_CURRENTNESS,
                    "evidence_refs": EVENT_FAMILY_EVIDENCE_REFS,
                    "complete_denominator_known": False,
                    "corpus_complete": False,
                    "disposition": "unknown_or_unregistered_event_types_quarantine_without_checkpoint_advance",
                },
                path_label,
            )
        )

    if not (checkpoint.contract_depth_complete and covers_registry):
        failures.append(
            _with_path(
                {
                    "error": "event_family_contract_depth_unresolved",
                    "registered_kernel_rows": actual_registered_rows,
                    "quarantined_row_count": EVENT_FAMILY_QUARANTINED_ROW_COUNT,
                    "bulk_registration_allowed": EVENT_FAMILY_BULK_REGISTRATION_ALLOWED,
                    "evidence_refs": EVENT_FAMILY_EVIDENCE_REFS,
                    "contract_depth_complete": False,
                },
                path_label,
            )
        )
    return failures


def pnc019_event_authority_clearance_failures(
    root: Path,
    *,
    path_label: str | None = EVENT_FAMILY_REGISTRY_REL_PATH,
) -> list[dict[str, Any]]:
    """Read and evaluate the live Event Authority registry checkpoint."""
    registry_path = root / EVENT_FAMILY_REGISTRY_REL_PATH
    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - fail closed with bounded detail.
        return [
            _with_path(
                {"error": "event_family_registry_unavailable", "detail": str(exc)},
                path_label,
            )
        ]
    audit_failures = event_authority_audit_failures(root)
    registry_failures = pnc019_event_authority_failures_for_registry(
        registry,
        path_label=path_label,
        checkpoint=event_authority_checkpoint(root, audit_failures=audit_failures),
    )
    return audit_failures + registry_failures


def event_authority_checkpoint(
    root: Path | None = None,
    *,
    audit_failures: list[dict[str, Any]] | None = None,
) -> EventAuthorityCheckpoint:
    """Clearance read from the installed edition: open unless a CLOSED edition re-verifies."""
    root = HELPER_REPO_ROOT if root is None else Path(root)
    try:
        status = _strict_json(audit_input(root, EVENT_AUTHORITY_STATUS_REL_PATH).read_bytes())
    except Exception:  # noqa: BLE001 - an unreadable edition is an open one.
        return open_event_authority_checkpoint()
    if not isinstance(status, dict) or status.get("status") != EVENT_AUTHORITY_CLOSED_STATUS:
        return open_event_authority_checkpoint()
    if audit_failures is None:
        audit_failures = event_authority_audit_failures(root)
    denominator = status.get("denominator")
    if audit_failures or not isinstance(denominator, dict) or not _is_hex64(denominator.get("event_types_sha256")):
        return open_event_authority_checkpoint()
    return EventAuthorityCheckpoint(
        registry_schema_id=EVENT_FAMILY_REGISTRY_SCHEMA_ID,
        registry_schema_version=EVENT_FAMILY_REGISTRY_SCHEMA_VERSION,
        registry_revision=EVENT_FAMILY_REGISTRY_REVISION,
        registered_kernel_rows=EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT,
        complete_denominator_known=True,
        contract_depth_complete=True,
        denominator_status=EVENT_AUTHORITY_CLOSED_STATUS,
        evidence_currentness=EVENT_AUTHORITY_CLOSED_EVIDENCE_CURRENTNESS,
        denominator_event_types_sha256=denominator["event_types_sha256"],
    )


def event_authority_denominator_status(root: Path | None = None) -> str:
    """`CLOSED` only for a re-verified CLOSED edition; `UNKNOWN_OPEN` otherwise."""
    return event_authority_checkpoint(root).denominator_status


def event_authority_evidence_refs(checkpoint: EventAuthorityCheckpoint) -> list[dict[str, str]]:
    if checkpoint.denominator_status == EVENT_AUTHORITY_CLOSED_STATUS:
        return [dict(ref) for ref in EVENT_FAMILY_CLOSED_EVIDENCE_REFS]
    return [dict(ref) for ref in EVENT_FAMILY_EVIDENCE_REFS]


# ---------------------------------------------------------------------------
# Evidence-bound closing path (PNC-019 step S7).
#
# compute_closure_evidence() is the one derivation of the closing evidence. The
# generator calls it to build a CLOSED edition (and refuses on any failure);
# event_authority_closure_failures() calls it again on the installed edition and
# requires the stored evidence to equal the recomputation. Nothing here trusts a
# stored boolean: sets, coverage, depth cells and pins are recomputed from the
# live tree.
# ---------------------------------------------------------------------------

EVENT_AUTHORITY_CLOSURE_EVIDENCE_SCHEMA_ID = "pm.event_authority.closure_evidence.v1"
EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS = (
    "one row-local owner disposition per discovered exact token is not materialized",
    "the exact persisted denominator D is unknown",
    "D has not been proven equal to the exact live registry set",
    "registry-linked material depth is incomplete",
    "runtime producer conformance cannot be tested because no Rust product runtime exists",
    "EA-27 and EA-29 external custody artifacts are unavailable, so historical cohort continuity is unverified",
)
EVENT_AUTHORITY_RESOLVED_CLOSURE_BLOCKERS = [
    {"blocker": EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS[0], "resolution": "token_disposition_ledger", "evidence": "closure/CLOSURE_EVIDENCE.json#/token_ledger"},
    {"blocker": EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS[1], "resolution": "frozen_check_pass_at_current_pins", "evidence": "closure/CLOSURE_EVIDENCE.json#/frozen_check"},
    {"blocker": EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS[2], "resolution": "denominator_equals_live_registry", "evidence": "closure/CLOSURE_EVIDENCE.json#/denominator"},
    {"blocker": EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS[3], "resolution": "twelve_of_twelve_depth_row_per_family", "evidence": "closure/CLOSURE_EVIDENCE.json#/depth"},
    {"blocker": EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS[4], "resolution": "recorded_boundary_not_run_separate_later_claim", "evidence": "EVENT_FAMILY_DENOMINATOR_STATUS.json#/runtime_producer_conformance"},
    {"blocker": EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS[5], "resolution": "ea27_ea29_continuity_receipt", "evidence": "closure/EA27_EA29_CONTINUITY_RECEIPT.json"},
]
_HEX64 = re.compile(r"[0-9a-f]{64}")


class ClosureInputError(ValueError):
    """An input the closure reads is missing, unsafe or malformed."""


def _is_hex64(value: Any) -> bool:
    return isinstance(value, str) and _HEX64.fullmatch(value) is not None


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _canonical_sha256(value: Any) -> str:
    return _sha256_bytes(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))


def _strict_json(raw: bytes) -> Any:
    """JSON with duplicate keys and non-finite numbers rejected."""

    def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
        obj: dict[str, Any] = {}
        for key, value in items:
            if key in obj:
                raise ClosureInputError(f"duplicate JSON key: {key}")
            obj[key] = value
        return obj

    def constant(token: str) -> Any:
        raise ClosureInputError(f"non-finite JSON number: {token}")

    def finite(token: str) -> float:
        value = float(token)
        if not math.isfinite(value):
            raise ClosureInputError(f"non-finite JSON number: {token}")
        return value

    return json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=constant, parse_float=finite)


def _strict_jsonl(raw: bytes) -> list[Any]:
    return [_strict_json(line) for line in raw.splitlines() if line.strip()]


def _safe_relative(value: Any) -> str:
    if (
        not isinstance(value, str)
        or not value
        or "\\" in value
        or ":" in value
        or any(ord(ch) < 32 or ord(ch) == 127 for ch in value)
        or value.startswith("/")
        or any(part in ("", ".", "..") for part in value.split("/"))
    ):
        raise ClosureInputError(f"unsafe repository-relative path: {value!r}")
    return PurePosixPath(value).as_posix()


def _contained_file(root: Path, relative: str) -> Path:
    base = Path(root).resolve(strict=True)
    path = base.joinpath(*_safe_relative(relative).split("/"))
    try:
        resolved = path.resolve(strict=True)
    except OSError as exc:
        raise ClosureInputError(f"missing input: {relative}") from exc
    if not resolved.is_relative_to(base) or not resolved.is_file():
        raise ClosureInputError(f"input is not a contained regular file: {relative}")
    return resolved


def _read_rel(root: Path, relative: str) -> bytes:
    return _contained_file(root, relative).read_bytes()


def _sha_rel(root: Path, relative: str) -> str | None:
    try:
        return _sha256_bytes(_read_rel(root, relative))
    except (ClosureInputError, OSError):
        return None


def _names_token(text: str, token: str) -> bool:
    return re.search(r"(?<![A-Za-z0-9_.])" + re.escape(token) + r"(?![A-Za-z0-9_]|\.[A-Za-z0-9_])", text) is not None


def closure_bound_input_paths(root: Path, *, token_ledger_path: str, depth_assessment_paths: list[str]) -> list[str]:
    """Every non-inventoried file the closing evidence depends on."""
    paths = set(EA_CLOSURE_BOUND_FILES) | {token_ledger_path} | set(depth_assessment_paths)
    base = Path(root)
    for tree in EA_CLOSURE_BOUND_TREES:
        directory = base / tree
        if not directory.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(directory):
            dirnames[:] = sorted(name for name in dirnames if name != "__pycache__")
            for name in sorted(filenames):
                if name.endswith(".pyc"):
                    continue
                relative = (Path(dirpath) / name).relative_to(base).as_posix()
                if any(relative.startswith(prefix) for prefix in EA_CLOSURE_UNBOUND_PREFIXES):
                    continue
                paths.add(relative)
    return sorted(paths)


def _closure_registry(root: Path, failures: list[dict[str, Any]]) -> tuple[dict[str, Any], dict[str, dict[str, Any]]]:
    raw = _read_rel(root, EVENT_FAMILY_REGISTRY_REL_PATH)
    registry = _strict_json(raw)
    families = registry.get("families") if isinstance(registry, dict) else None
    if not isinstance(families, list) or not all(isinstance(row, dict) and isinstance(row.get("event_type"), str) for row in families):
        raise ClosureInputError("registry families malformed")
    live = {row["event_type"]: row for row in families}
    if len(live) != len(families):
        failures.append({"error": "event_authority_closure_registry_invalid", "detail": "duplicate event_type rows"})
    summary = {
        "path": EVENT_FAMILY_REGISTRY_REL_PATH,
        "sha256": _sha256_bytes(raw),
        "revision": registry.get("registry_revision"),
        "family_count": len(families),
        "event_types_sha256": _sha256_bytes(("\n".join(sorted(live)) + "\n").encode()),
    }
    return summary, live


def _closure_known37(root: Path) -> list[str]:
    doc = _strict_json(_read_rel(root, EA_KNOWN37_REL_PATH))
    names = doc.get("event_types") if isinstance(doc, dict) else None
    if (
        not isinstance(names, list)
        or not all(isinstance(name, str) for name in names)
        or len(set(names)) != len(names)
        or doc.get("count") != len(names)
    ):
        raise ClosureInputError("Known37 event types malformed")
    return names


def _closure_admission_records(root: Path, failures: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    directory = Path(root) / EA_ADMISSION_RECORD_DIR_REL_PATH
    for path in sorted(directory.glob("*.json")) if directory.is_dir() else []:
        relative = path.relative_to(root).as_posix()
        record = _strict_json(_read_rel(root, relative))
        event_type = record.get("event_type") if isinstance(record, dict) else None
        if not isinstance(event_type, str) or path.name != event_type + ".json":
            failures.append({"error": "event_authority_closure_input_invalid", "input": relative, "detail": "admission record name and event_type disagree"})
            continue
        records[event_type] = record
    return records


def _closure_frozen_check(
    root: Path,
    receipt: Any,
    validator_sha256: Any,
    live: dict[str, dict[str, Any]],
    known37: list[str],
    failures: list[dict[str, Any]],
) -> None:
    if not isinstance(receipt, dict):
        failures.append({"error": "event_authority_closure_frozen_check_identity_mismatch", "detail": "receipt is not an object"})
        return
    if (
        receipt.get("schema_id") != EA_FROZEN_RECEIPT_SCHEMA_ID
        or receipt.get("validator_id") != EA_FROZEN_VALIDATOR_ID
        or receipt.get("validator_path") != EA_FROZEN_VALIDATOR_REL_PATH
    ):
        failures.append({"error": "event_authority_closure_frozen_check_identity_mismatch"})
    if not _is_hex64(validator_sha256) or _sha_rel(root, EA_FROZEN_VALIDATOR_REL_PATH) != validator_sha256:
        failures.append({"error": "event_authority_closure_frozen_validator_drift", "validator_path": EA_FROZEN_VALIDATOR_REL_PATH})
    named = receipt.get("named_checks") if isinstance(receipt.get("named_checks"), dict) else {}
    counts = receipt.get("counts") if isinstance(receipt.get("counts"), dict) else {}
    recount = named.get("recount") if isinstance(named.get("recount"), dict) else {}
    passing = {
        "pass": receipt.get("pass") is True,
        "complete_denominator_known": receipt.get("complete_denominator_known") is True,
        "contract_depth_complete": receipt.get("contract_depth_complete") is True,
        "bulk_registration_allowed_false": receipt.get("bulk_registration_allowed") is False,
        "failures_empty": receipt.get("failures") == [],
        "seal_prerequisites_met": named.get("seal_prerequisites_met") is True,
        "fresh_denominator_closed": counts.get("fresh_denominator_closed") is True,
        "recount_complete": recount.get("complete") is True,
    }
    if not all(passing.values()):
        failures.append({
            "error": "event_authority_closure_frozen_check_not_passing",
            "unmet": sorted(name for name, ok in passing.items() if not ok),
        })
    pins = receipt.get("input_pins") if isinstance(receipt.get("input_pins"), dict) else {}
    outcomes = recount.get("outcomes") if isinstance(recount.get("outcomes"), dict) else {}
    pin_values = dict((name, pins.get(name)) for name in EA_FROZEN_RECEIPT_PIN_PATHS)
    pin_values["recount_outcomes_sha256"] = outcomes.get("outcomes_sha256")
    pin_values["recount_change_receipt_sha256"] = recount.get("change_receipt_sha256")
    pin_paths = dict(EA_FROZEN_RECEIPT_PIN_PATHS)
    pin_paths["recount_outcomes_sha256"] = EA_RECOUNT_OUTCOMES_REL_PATH
    pin_paths["recount_change_receipt_sha256"] = EA_RECOUNT_CHANGE_RECEIPT_REL_PATH
    for name, relative in sorted(pin_paths.items()):
        expected = pin_values.get(name)
        if not _is_hex64(expected) or _sha_rel(root, relative) != expected:
            failures.append({"error": "event_authority_closure_frozen_pin_stale", "pin": name, "path": relative})
    admitted = named.get("post_august_admitted")
    beyond = sorted(set(live) - set(known37) - set(EA_AUGUST_PAIR))
    if not isinstance(admitted, list) or sorted(admitted) != beyond:
        failures.append({
            "error": "event_authority_closure_frozen_admitted_set_mismatch",
            "expected": beyond,
            "actual": admitted if isinstance(admitted, list) else None,
        })


def _frozen_declared_pins(root: Path) -> dict[str, str]:
    """The SHA-256 constants the frozen validator itself declares for its immutable inputs."""
    try:
        text = _read_rel(root, EA_FROZEN_VALIDATOR_REL_PATH).decode("utf-8", errors="replace")
    except (ClosureInputError, OSError):
        return {}
    return {name: value for name, value in re.findall(r'(?m)^([A-Z][A-Z0-9_]*_SHA) = "([0-9a-f]{64})"', text)}


def _closure_denominator(
    root: Path,
    live: dict[str, dict[str, Any]],
    known37: list[str],
    records: dict[str, dict[str, Any]],
    failures: list[dict[str, Any]],
) -> tuple[dict[str, Any], list[dict[str, Any]], set[str]]:
    ledger = _strict_jsonl(_read_rel(root, EA_DISPOSITION_LEDGER_REL_PATH))
    if not all(isinstance(row, dict) and isinstance(row.get("event_type"), str) for row in ledger):
        raise ClosureInputError("individual-disposition ledger malformed")
    cpu_open = sorted(
        row["event_type"]
        for row in ledger
        if row.get("bucket") == EA_CPU_BUCKET and row.get("disposition") in EA_CPU_OPEN_DISPOSITIONS
    )
    if cpu_open:
        failures.append({"error": "event_authority_closure_cpu_rows_open", "count": len(cpu_open), "sample": cpu_open[:20]})

    recount_list_raw = _read_rel(root, EA_RECOUNT_LIST_REL_PATH)
    declared = _frozen_declared_pins(root)
    if (
        declared.get("RECOUNT_LIST_SHA") != _sha256_bytes(recount_list_raw)
        or declared.get("RECOUNT_RECEIPT_SHA") != _sha_rel(root, EA_RECOUNT_RECEIPT_REL_PATH)
    ):
        failures.append({"error": "event_authority_closure_recount_list_invalid", "detail": "recount list or receipt bytes differ from the frozen validator's declared pins"})
    pinned = _strict_json(_read_rel(root, EA_COHORT_PINS_REL_PATH)).get("cohorts", {})
    pinned_known37 = (pinned.get("known37") or {}).get("event_types") if isinstance(pinned, dict) else None
    if not isinstance(pinned_known37, list) or sorted(pinned_known37) != sorted(known37):
        failures.append({"error": "event_authority_closure_known37_invalid", "detail": "Known37 differs from the immutable cohort pins"})
    recount_list = _strict_json(recount_list_raw)
    if not isinstance(recount_list, list) or not all(isinstance(row, dict) and isinstance(row.get("name"), str) for row in recount_list):
        raise ClosureInputError("recount list malformed")
    recount_names = [row["name"] for row in recount_list]
    outcome_rows: list[dict[str, Any]] = []
    try:
        outcomes = _strict_json(_read_rel(root, EA_RECOUNT_OUTCOMES_REL_PATH))
    except (ClosureInputError, OSError, ValueError) as exc:
        failures.append({"error": "event_authority_closure_recount_outcomes_invalid", "detail": str(exc)})
        outcomes = None
    if outcomes is not None:
        rows = outcomes.get("rows") if isinstance(outcomes, dict) else None
        if (
            not isinstance(outcomes, dict)
            or outcomes.get("schema_id") != EA_RECOUNT_OUTCOMES_SCHEMA_ID
            or not isinstance(rows, list)
            or not all(isinstance(row, dict) for row in rows)
            or [row.get("event_type") for row in rows] != sorted(set(recount_names))
            or any(row.get("outcome") not in ("registered", "excluded", "decision_card") for row in rows)
        ):
            failures.append({"error": "event_authority_closure_recount_outcomes_invalid", "detail": "identity, member order or outcome vocabulary"})
        else:
            outcome_rows = rows
    cards = sorted(row["event_type"] for row in outcome_rows if row.get("outcome") == "decision_card")
    if cards:
        failures.append({"error": "event_authority_closure_recount_decision_cards_open", "count": len(cards), "sample": cards[:20]})

    for event_type, record in sorted(records.items()):
        row = live.get(event_type)
        if row is not None and record.get("registry_row_sha256") != _canonical_sha256(row) and event_type not in known37:
            failures.append({"error": "event_authority_closure_admission_record_stale", "event_type": event_type})

    basis: dict[str, set[str]] = {}

    def add(event_type: str, reason: str) -> None:
        basis.setdefault(event_type, set()).add(reason)

    for name in known37:
        add(name, "known37")
    for name in EA_AUGUST_PAIR:
        add(name, "august_pair")
    for name in records:
        add(name, "admission_record")
    for row in ledger:
        if row.get("disposition") == "KEEP_REGISTERED":
            add(row["event_type"], "disposition_keep_registered")
    for row in outcome_rows:
        if row.get("outcome") == "registered":
            add(row["event_type"], "recount_registered")
    members = sorted(basis)
    missing_from_registry = sorted(set(members) - set(live))
    missing_from_denominator = sorted(set(live) - set(members))
    if missing_from_registry or missing_from_denominator:
        failures.append({
            "error": "event_authority_closure_denominator_registry_mismatch",
            "in_denominator_not_registry": missing_from_registry,
            "in_registry_not_denominator": missing_from_denominator,
        })
    summary = {
        "size": len(members),
        "event_types_sha256": _sha256_bytes(("\n".join(members) + "\n").encode()),
        "equals_live_registry": not (missing_from_registry or missing_from_denominator),
        "members": [{"event_type": name, "basis": sorted(basis[name])} for name in members],
        "cpu_open_rows": len(cpu_open),
        "recount_rows": len(outcome_rows),
        "recount_registered": sum(1 for row in outcome_rows if row.get("outcome") == "registered"),
        "recount_excluded": sum(1 for row in outcome_rows if row.get("outcome") == "excluded"),
        "recount_decision_cards": len(cards),
    }
    return summary, outcome_rows, set(recount_names)


def _depth_rows(root: Path, relative: str, cache: dict[str, tuple[str, list[dict[str, Any]]]]) -> tuple[str, list[dict[str, Any]]]:
    if relative not in cache:
        raw = _read_rel(root, relative)
        doc = _strict_json(raw)
        rows = doc.get("rows") if isinstance(doc, dict) else None
        if not isinstance(rows, list):
            raise ClosureInputError(f"depth assessment without rows: {relative}")
        cache[relative] = (_sha256_bytes(raw), [row for row in rows if isinstance(row, dict)])
    return cache[relative]


def _depth_cell_passes(root: Path, cell: Any) -> bool:
    if not isinstance(cell, dict) or cell.get("status") != "PASS":
        return False
    evidence = cell.get("evidence")
    if not isinstance(evidence, list):
        return False
    for item in evidence:
        if isinstance(item, dict) and isinstance(item.get("path"), str) and item["path"].startswith("Plans/"):
            try:
                _contained_file(root, item["path"].split("#", 1)[0])
                return True
            except ClosureInputError:
                continue
    return False


def _closure_depth(
    root: Path,
    live: dict[str, dict[str, Any]],
    records: dict[str, dict[str, Any]],
    declared: list[str],
    failures: list[dict[str, Any]],
) -> dict[str, Any]:
    cache: dict[str, tuple[str, list[dict[str, Any]]]] = {}
    for relative in declared:
        if not relative.startswith(EA_EVIDENCE_LEDGER_PREFIXES):
            raise ClosureInputError(f"depth assessment outside reports/ or the frozen audit: {relative}")
        _depth_rows(root, relative, cache)
    families = []
    for event_type in sorted(live):
        row = live[event_type]
        family_id, revision = row.get("family_id"), row.get("family_revision")
        record = records.get(event_type)
        matches: list[tuple[str, dict[str, Any]]] = []
        if isinstance(record, dict) and record.get("registry_row_sha256") == _canonical_sha256(row):
            selected_by = "admission_record"
            pin = record.get("depth_assessment") if isinstance(record.get("depth_assessment"), dict) else {}
            source = pin.get("path")
            try:
                source = _safe_relative(source)
                sha, rows = _depth_rows(root, source, cache)
            except (ClosureInputError, OSError, ValueError) as exc:
                failures.append({"error": "event_authority_closure_depth_source_stale", "event_type": event_type, "detail": str(exc)})
                rows, sha = [], None
            if sha is not None and sha != pin.get("sha256"):
                failures.append({"error": "event_authority_closure_depth_source_stale", "event_type": event_type, "path": source})
            matches = [(source, item) for item in rows if (item.get("event_type"), item.get("family_id"), item.get("family_revision")) == (event_type, family_id, revision)]
        else:
            selected_by = "declared_assessment"
            for relative in declared:
                matches.extend(
                    (relative, item)
                    for item in cache[relative][1]
                    if (item.get("event_type"), item.get("family_id"), item.get("family_revision")) == (event_type, family_id, revision)
                )
        entry = {"event_type": event_type, "family_id": family_id, "family_revision": revision, "selected_by": selected_by, "source_path": None, "source_sha256": None}
        if not matches:
            failures.append({"error": "event_authority_closure_depth_row_missing", "event_type": event_type, "family_revision": revision})
        elif len(matches) > 1:
            failures.append({"error": "event_authority_closure_depth_row_ambiguous", "event_type": event_type, "sources": sorted(path for path, _ in matches)})
        else:
            source, item = matches[0]
            entry["source_path"] = source
            entry["source_sha256"] = cache[source][0]
            cells = item.get("cells")
            if not isinstance(cells, dict) or set(cells) != set(EA_DEPTH_CRITERIA):
                failures.append({"error": "event_authority_closure_depth_incomplete", "event_type": event_type, "non_pass": ["criteria_set"]})
            else:
                non_pass = [name for name in EA_DEPTH_CRITERIA if not _depth_cell_passes(root, cells[name])]
                if non_pass:
                    failures.append({"error": "event_authority_closure_depth_incomplete", "event_type": event_type, "non_pass": non_pass})
        families.append(entry)
    return {"criteria": list(EA_DEPTH_CRITERIA), "declared_assessments": list(declared), "families": families}


def _landed_ledger_paths(root: Path) -> list[str]:
    """The two live top-level ledgers and their new-name supplements (the S6 classifier's set)."""
    paths = []
    for directory in EA_LEDGER_DIRS:
        base = Path(root) / directory
        for path in sorted(base.glob("*.jsonl")) if base.is_dir() else []:
            if path.name == "LEDGER.jsonl" or path.name.endswith("-NEW-NAMES-LEDGER.jsonl"):
                paths.append(path.relative_to(root).as_posix())
    return paths


def _pin_value(root: Path, pin: dict[str, Any], cache: dict[str, Any]) -> Any:
    """The JSON value a source-row pin names, read from the live file; ClosureInputError if it is not there."""
    relative = _safe_relative(pin.get("path"))
    if relative not in cache:
        raw = _read_rel(root, relative)
        doc = _strict_jsonl(raw) if relative.endswith(".jsonl") else _strict_json(raw)
        cache[relative] = (_sha256_bytes(raw), doc)
    file_sha, doc = cache[relative]
    if pin.get("sha256") != file_sha:
        raise ClosureInputError(f"stale pin: {relative}")
    pointer = pin.get("json_pointer")
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        raise ClosureInputError(f"pin without a JSON pointer: {relative}")
    value = doc
    for part in pointer[1:].split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        if isinstance(value, list) and part.isdigit() and int(part) < len(value):
            value = value[int(part)]
        elif isinstance(value, dict) and part in value:
            value = value[part]
        else:
            raise ClosureInputError(f"pin points at nothing: {relative}{pointer}")
    if pin.get("row_sha256") != _canonical_sha256(value):
        raise ClosureInputError(f"pinned row changed: {relative}{pointer}")
    return value


def _window_pin_ok(root: Path, token: str, pin: dict[str, Any], cache: dict[str, Any]) -> bool:
    """A Plans occurrence window: current file bytes, exact excerpt, and the token named in it."""
    try:
        relative = _safe_relative(pin.get("path"))
        if not relative.startswith("Plans/") or relative.startswith("Plans/.audits/"):
            return False
        if relative not in cache:
            raw = _read_rel(root, relative)
            cache[relative] = (_sha256_bytes(raw), raw.decode("utf-8", errors="replace").splitlines())
        file_sha, lines = cache[relative]
    except (ClosureInputError, OSError):
        return False
    if pin.get("sha256") != file_sha:
        raise ClosureInputError(f"stale pin: {relative}")
    start, end = pin.get("window_start_line"), pin.get("window_end_line")
    if type(start) is not int or type(end) is not int or not 1 <= start <= end <= len(lines):
        return False
    excerpt = "\n".join(lines[start - 1:end])
    return pin.get("excerpt") == excerpt and _names_token(excerpt, token)


def _closure_token_ledger(
    root: Path,
    relative: str,
    occurrences_raw: bytes,
    live: dict[str, dict[str, Any]],
    outcome_rows: list[dict[str, Any]],
    recount_names: set[str],
    failures: list[dict[str, Any]],
) -> dict[str, Any]:
    if not relative.startswith(EA_EVIDENCE_LEDGER_PREFIXES):
        raise ClosureInputError(f"token ledger outside reports/ or the frozen audit: {relative}")
    raw = _read_rel(root, relative)
    rows = _strict_jsonl(raw)
    occurrences: dict[str, dict[str, Any]] = {}
    for row in _strict_jsonl(occurrences_raw):
        if not isinstance(row, dict) or not isinstance(row.get("exact_token"), str):
            raise ClosureInputError("occurrence ledger malformed")
        occurrences[row["exact_token"]] = row
    ledger_paths = set(_landed_ledger_paths(root))
    # Every landed row naming each token, from the live ledgers: a ledger-rule row
    # must cite exactly these, so a conflicting row cannot be left out (fix 1).
    landed_rows: dict[str, set[tuple[str, int]]] = {}
    for path in sorted(ledger_paths):
        for n, value in enumerate(_strict_jsonl(_read_rel(root, path))):
            if isinstance(value, dict) and isinstance(value.get("event_type"), str):
                landed_rows.setdefault(value["event_type"], set()).add((path, n))
    ledger_history = set(landed_rows)
    event_verb = re.compile(EA_EVENT_VERB_PATTERN)
    # parsed documents and text lines are cached apart: one file can be both
    cache: dict[str, Any] = {}
    line_cache: dict[str, Any] = {}
    seen: dict[str, str] = {}
    invalid: list[dict[str, Any]] = []
    open_rows: list[str] = []
    unknown: list[dict[str, Any]] = []
    bad_sources: list[dict[str, Any]] = []
    stale: list[dict[str, Any]] = []
    registry_mismatch: list[str] = []
    for row in rows:
        if (
            not isinstance(row, dict)
            or not isinstance(row.get("exact_token"), str)
            or not isinstance(row.get("disposition"), str)
            or not isinstance(row.get("source_rows"), list)
            or not all(isinstance(pin, dict) for pin in row["source_rows"])
        ):
            invalid.append({"row": row.get("exact_token") if isinstance(row, dict) else None, "detail": "row fields"})
            continue
        token, disposition, pins = row["exact_token"], row["disposition"], row["source_rows"]
        if token in seen:
            invalid.append({"exact_token": token, "detail": "duplicate token row"})
            continue
        seen[token] = disposition
        if disposition in EA_TOKEN_OPEN_DISPOSITIONS:
            open_rows.append(token)
            continue
        if disposition not in EA_TOKEN_FINAL_DISPOSITIONS:
            unknown.append({"exact_token": token, "disposition": disposition})
            continue
        state, rule = EA_TOKEN_FINAL_DISPOSITIONS[disposition]
        if (token in live) != (rule == "registered"):
            registry_mismatch.append(token)
        problem = None
        if row.get("resolution_state") != state or row.get("rule_id") != rule:
            problem = "resolution_state or rule_id does not match the disposition"
        elif token in ledger_history and rule not in ("registered", "landed_exclusion", "landed_alias", "holding_quarantine"):
            problem = "a landed ledger row outranks this rule"
        elif token in recount_names and rule not in ("registered", "recount_outcome"):
            problem = "a recount name is registered or excluded by its recount outcome only"
        else:
            # Every repository pin must be current; the granting pins are resolved below.
            for pin in pins:
                path = pin.get("path")
                if isinstance(path, str) and not path.startswith("/") and "json_pointer" not in pin and "window_start_line" not in pin:
                    problem = "pin is neither a row pointer nor an occurrence window"
            try:
                if rule == "registered":
                    granted = [
                        _pin_value(root, pin, cache) for pin in pins
                        if pin.get("path") == EVENT_FAMILY_REGISTRY_REL_PATH and "json_pointer" in pin
                    ]
                    if not any(isinstance(value, dict) and value.get("event_type") == token for value in granted):
                        problem = "no current registry row pin"
                elif rule in ("landed_exclusion", "landed_alias", "holding_quarantine"):
                    values = [_pin_value(root, pin, cache) for pin in pins if pin.get("path") in ledger_paths]
                    cited = {
                        (pin["path"], int(pin["json_pointer"][1:]) if str(pin.get("json_pointer", ""))[1:].isdigit() else -1)
                        for pin in pins if pin.get("path") in ledger_paths
                    }
                    names_token = values and all(isinstance(v, dict) and v.get("event_type") == token for v in values)
                    dispositions = {v.get("disposition") for v in values if isinstance(v, dict)}
                    if cited != landed_rows.get(token, set()):
                        problem = "the row does not cite every landed ledger row naming the token"
                    elif not names_token:
                        problem = "no current landed ledger row pin naming the token"
                    elif rule == "landed_exclusion" and not dispositions <= EA_LEDGER_FINAL_EXCLUDED:
                        problem = "a cited ledger row does not exclude the token"
                    elif rule == "landed_alias" and dispositions != {"RECLASSIFY_ALIAS"}:
                        problem = "a cited ledger row is not an alias row"
                    elif rule == "holding_quarantine" and not (
                        dispositions <= EA_LEDGER_INTERIM
                        and all(v.get("category", v.get("bucket")) == "quarantined_not_admitted" for v in values)
                    ):
                        problem = "a cited ledger row is not a holding-bucket row"
                elif rule == "recount_outcome":
                    values = [_pin_value(root, pin, cache) for pin in pins if pin.get("path") == EA_RECOUNT_OUTCOMES_REL_PATH]
                    if not any(isinstance(v, dict) and v.get("event_type") == token and v.get("outcome") == "excluded" for v in values):
                        problem = "no current recount outcome pin excluding the token"
                else:
                    windows = [pin for pin in pins if "window_start_line" in pin]
                    if not windows or not all(_window_pin_ok(root, token, pin, line_cache) for pin in windows):
                        problem = "no current Plans occurrence window naming the token"
                    elif rule in EA_TOKEN_LEXICAL_RULES and not EA_TOKEN_LEXICAL_RULES[rule](token):
                        problem = "the lexical rule does not match the token"
                    elif rule in EA_TOKEN_CONTEXT_RULES and (
                        (occurrences.get(token) or {}).get("primary_mechanical_classification") != EA_TOKEN_CONTEXT_RULES[rule]
                        or event_verb.search(token.rsplit(".", 1)[-1]) is not None
                    ):
                        problem = "the context rule does not match the token's census classification"
            except ClosureInputError as exc:
                stale.append({"exact_token": token, "detail": str(exc)})
                continue
        if problem is not None:
            bad_sources.append({"exact_token": token, "disposition": disposition, "detail": problem})
    if invalid:
        failures.append({"error": "event_authority_closure_token_ledger_invalid", "count": len(invalid), "sample": invalid[:20]})
    missing = sorted(set(occurrences) - set(seen))
    extra = sorted(set(seen) - set(occurrences))
    if missing or extra:
        failures.append({"error": "event_authority_closure_token_coverage_mismatch", "missing_count": len(missing), "missing_sample": missing[:20], "extra_count": len(extra), "extra_sample": extra[:20]})
    if open_rows:
        failures.append({"error": "event_authority_closure_token_disposition_open", "count": len(open_rows), "sample": sorted(open_rows)[:20]})
    if unknown:
        failures.append({"error": "event_authority_closure_token_disposition_invalid", "count": len(unknown), "sample": unknown[:20]})
    if registry_mismatch:
        failures.append({"error": "event_authority_closure_token_registry_mismatch", "count": len(registry_mismatch), "sample": sorted(registry_mismatch)[:20]})
    if stale:
        failures.append({"error": "event_authority_closure_token_ledger_stale", "count": len(stale), "sample": stale[:20]})
    if bad_sources:
        failures.append({"error": "event_authority_closure_token_source_invalid", "count": len(bad_sources), "sample": bad_sources[:20]})
    counts: dict[str, int] = {}
    for disposition in seen.values():
        counts[disposition] = counts.get(disposition, 0) + 1
    return {
        "path": relative,
        "sha256": _sha256_bytes(raw),
        "format": "S6 classifier TOKEN_DISPOSITIONS.jsonl rows",
        "occurrences_sha256": _sha256_bytes(occurrences_raw),
        "row_count": len(rows),
        "disposition_counts": dict(sorted(counts.items())),
    }


def _closure_continuity(root: Path, receipt: Any, failures: list[dict[str, Any]]) -> None:
    if not isinstance(receipt, dict) or receipt.get("schema_id") != EA_CONTINUITY_RECEIPT_SCHEMA_ID:
        failures.append({"error": "event_authority_closure_continuity_pin_mismatch", "detail": "receipt identity"})
        return
    ea27 = receipt.get("ea27") if isinstance(receipt.get("ea27"), dict) else {}
    ea29 = receipt.get("ea29") if isinstance(receipt.get("ea29"), dict) else {}
    try:
        canon_text = _read_rel(root, EA_CANON_PIN_SOURCE_REL_PATH).decode("utf-8", errors="replace")
    except (ClosureInputError, OSError):
        canon_text = ""
    pins_ok = (
        ea27.get("logical_name") == EA27_LOGICAL_NAME
        and ea27.get("sha256") == EA27_CANON_SHA256
        and ea29.get("logical_name") == EA29_LOGICAL_NAME
        and ea29.get("sha256") == EA29_CANON_SHA256
        and receipt.get("union_rows_sha256_recomputed") == EA27_UNION_ROWS_CANON_SHA256
        and all(value in canon_text for value in (EA27_CANON_SHA256, EA29_CANON_SHA256, EA27_UNION_ROWS_CANON_SHA256))
    )
    if not pins_ok:
        failures.append({"error": "event_authority_closure_continuity_pin_mismatch"})
    try:
        pinned = _strict_json(_read_rel(root, EA_COHORT_PINS_REL_PATH)).get("cohorts", {})
        census = {
            row.get("event_type")
            for row in _strict_jsonl(_read_rel(root, EA_CENSUS_ADJUDICATION_REL_PATH))
            if isinstance(row, dict)
        }
    except (ClosureInputError, OSError, ValueError, AttributeError) as exc:
        failures.append({"error": "event_authority_closure_continuity_cohort_mismatch", "detail": str(exc)})
        return
    recorded = receipt.get("cohorts") if isinstance(receipt.get("cohorts"), dict) else {}
    mismatched = []
    for name in EA_CONTINUITY_COHORTS:
        pin = pinned.get(name) if isinstance(pinned, dict) else None
        expected = pin.get("event_types") if isinstance(pin, dict) else None
        actual = recorded.get(name)
        if (
            not isinstance(expected, list)
            or not isinstance(actual, list)
            or sorted(actual) != sorted(expected)
            or len(set(actual)) != len(actual)
            or pin.get("count") != len(actual)
        ):
            mismatched.append(name)
    exact = [name for cohort in EA_CONTINUITY_COHORTS[:4] for name in (recorded.get(cohort) or [])]
    non_exact = recorded.get(EA_CONTINUITY_COHORTS[4]) or []
    if (
        mismatched
        or set(recorded) != set(EA_CONTINUITY_COHORTS)
        or receipt.get("exact_row_count") != len(exact)
        or receipt.get("non_exact_row_count") != len(non_exact)
        or len(set(exact)) != len(exact)
        or receipt.get("unmapped_rows", []) != []
    ):
        failures.append({"error": "event_authority_closure_continuity_cohort_mismatch", "cohorts": mismatched})
    gaps = sorted(name for name in set(exact) if name not in census)
    if gaps:
        failures.append({"error": "event_authority_closure_continuity_census_gap", "count": len(gaps), "sample": gaps[:20]})


def _closure_runtime_boundary(root: Path, failures: list[dict[str, Any]]) -> None:
    missing = []
    for basis in EVENT_AUTHORITY_RUNTIME_BOUNDARY["basis"]:
        try:
            text = _read_rel(root, basis["path"]).decode("utf-8", errors="replace")
        except (ClosureInputError, OSError):
            text = ""
        if basis["quote"] not in text:
            missing.append(basis["path"])
    if missing:
        failures.append({"error": "event_authority_closure_runtime_boundary_basis_missing", "paths": missing})


def compute_closure_evidence(
    root: Path,
    *,
    token_ledger_path: str,
    depth_assessment_paths: list[str],
    frozen_receipt: Any,
    frozen_receipt_sha256: str,
    frozen_validator_sha256: str,
    recount_source_map: Any,
    continuity_receipt: Any,
    continuity_receipt_sha256: str,
    occurrences_raw: bytes,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """Derive the closing evidence from the live tree; failures mean not CLOSED."""
    root = Path(root)
    failures: list[dict[str, Any]] = []
    unreadable: list[str] = []

    def section(name: str, compute: Any) -> Any:
        # A section whose input is missing or malformed is reported and makes the
        # evidence unclosable; the other sections still run so one refusal lists
        # every remaining blocker.
        try:
            return compute()
        except Exception as exc:  # noqa: BLE001 - any section error fails closed, never crashes a caller.
            unreadable.append(name)
            failures.append({"error": "event_authority_closure_input_invalid", "section": name, "detail": str(exc)})
            return None

    paths = section("input_paths", lambda: (
        _safe_relative(token_ledger_path),
        sorted({_safe_relative(path) for path in depth_assessment_paths}),
    ))
    registry = section("registry", lambda: _closure_registry(root, failures))
    known37 = section("known37", lambda: _closure_known37(root))
    records = section("admission_records", lambda: _closure_admission_records(root, failures))
    if paths is None or registry is None or known37 is None or records is None:
        return {}, failures
    token_ledger_path, declared = paths
    registry_summary, live = registry
    section("frozen_check", lambda: _closure_frozen_check(root, frozen_receipt, frozen_validator_sha256, live, known37, failures))
    denominator_result = section("denominator", lambda: _closure_denominator(root, live, known37, records, failures))
    depth = section("depth", lambda: _closure_depth(root, live, records, declared, failures))
    token_ledger = None
    if denominator_result is not None:
        denominator, outcome_rows, recount_names = denominator_result
        token_ledger = section("token_ledger", lambda: _closure_token_ledger(
            root, token_ledger_path, occurrences_raw, live, outcome_rows, recount_names, failures))
    section("continuity", lambda: _closure_continuity(root, continuity_receipt, failures))
    section("runtime_boundary", lambda: _closure_runtime_boundary(root, failures))
    if unreadable or denominator_result is None or depth is None or token_ledger is None:
        return {}, failures
    bound_paths = section("bound_inputs", lambda: closure_bound_input_paths(
        root,
        token_ledger_path=token_ledger_path,
        depth_assessment_paths=declared + sorted({row["source_path"] for row in depth["families"] if row["source_path"]}),
    ))
    if bound_paths is None:
        return {}, failures
    bound_inputs = []
    for relative in bound_paths:
        digest = _sha_rel(root, relative)
        if digest is None:
            failures.append({"error": "event_authority_closure_input_missing", "path": relative})
        bound_inputs.append({"path": relative, "sha256": digest})
    evidence = {
        "schema_id": EVENT_AUTHORITY_CLOSURE_EVIDENCE_SCHEMA_ID,
        "claim_boundary": (
            "Event Authority closure for the exact live registry and corpus this edition inventories. "
            "Runtime producer conformance is NOT_RUN and outside this claim."
        ),
        "registry": registry_summary,
        "frozen_check": {
            "validator_path": EA_FROZEN_VALIDATOR_REL_PATH,
            "validator_sha256": frozen_validator_sha256,
            "receipt_path": EVENT_AUTHORITY_FROZEN_CHECK_RECEIPT_REL_PATH,
            "receipt_sha256": frozen_receipt_sha256,
            "recount_source_map": recount_source_map,
        },
        "denominator": denominator,
        "depth": depth,
        "token_ledger": token_ledger,
        "continuity": {
            "receipt_path": EVENT_AUTHORITY_CONTINUITY_RECEIPT_REL_PATH,
            "receipt_sha256": continuity_receipt_sha256,
        },
        "runtime_producer_conformance": json.loads(json.dumps(EVENT_AUTHORITY_RUNTIME_BOUNDARY)),
        "bound_inputs": bound_inputs,
    }
    return evidence, failures


def build_closed_status(open_status: dict[str, Any], evidence: dict[str, Any], evidence_sha256: str) -> dict[str, Any]:
    """The CLOSED status document for evidence that compute_closure_evidence accepted."""
    status = json.loads(json.dumps(open_status))
    status.update({
        "status": EVENT_AUTHORITY_CLOSED_STATUS,
        "closed": True,
        "complete_denominator_known": True,
        "contract_depth_complete": True,
        "build_or_pnc019_authority": True,
        "denominator": {
            "size": evidence["denominator"]["size"],
            "event_types_sha256": evidence["denominator"]["event_types_sha256"],
            "equals_live_registry": True,
        },
        "closure_evidence": {"path": EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH, "sha256": evidence_sha256},
        "runtime_producer_conformance": json.loads(json.dumps(EVENT_AUTHORITY_RUNTIME_BOUNDARY)),
        "closure_blockers": [],
        "resolved_closure_blockers": json.loads(json.dumps(EVENT_AUTHORITY_RESOLVED_CLOSURE_BLOCKERS)),
        "next_safe_action": (
            "keep this edition current: any Plans landing drifts it, and each new edition restales the PNC-019 "
            "receipt's VALIDATOR_RECEIPT.json binding, so a harness rerun follows every edition refresh"
        ),
    })
    depth = dict(status.get("depth") or {})
    depth.update({"status": "COMPLETE", "fresh_live_depth_rows_materialized": len(evidence["depth"]["families"])})
    status["depth"] = depth
    quarantine = dict(status.get("row_local_quarantine") or {})
    quarantine["superseded_by"] = "final individual dispositions and recount outcomes bound in closure/CLOSURE_EVIDENCE.json"
    status["row_local_quarantine"] = quarantine
    return status


def closed_status_failures(status: Any, evidence: dict[str, Any], evidence_sha256: str) -> list[dict[str, Any]]:
    if not isinstance(status, dict):
        return [{"error": "event_authority_currentness_status_closure_inconsistent", "fields": ["status_object"]}]
    denominator = evidence.get("denominator") or {}
    depth = status.get("depth") if isinstance(status.get("depth"), dict) else {}
    expected = {
        "status": EVENT_AUTHORITY_CLOSED_STATUS,
        "closed": True,
        "complete_denominator_known": True,
        "contract_depth_complete": True,
        "build_or_pnc019_authority": True,
        "denominator": {
            "size": denominator.get("size"),
            "event_types_sha256": denominator.get("event_types_sha256"),
            "equals_live_registry": True,
        },
        "closure_evidence": {"path": EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH, "sha256": evidence_sha256},
        "runtime_producer_conformance": EVENT_AUTHORITY_RUNTIME_BOUNDARY,
        "closure_blockers": [],
        "resolved_closure_blockers": EVENT_AUTHORITY_RESOLVED_CLOSURE_BLOCKERS,
    }
    wrong = sorted(key for key, value in expected.items() if status.get(key) != value)
    if depth.get("status") != "COMPLETE" or depth.get("fresh_live_depth_rows_materialized") != len((evidence.get("depth") or {}).get("families") or []):
        wrong.append("depth")
    if wrong:
        return [{"error": "event_authority_currentness_status_closure_inconsistent", "fields": wrong}]
    return []


def _edition_path(edition_dir: Path, logical: str) -> Path:
    prefix = EVENT_AUTHORITY_AUDIT_ROOT + "/"
    return Path(edition_dir) / logical[len(prefix):]


def event_authority_closure_failures(
    root: Path,
    *,
    edition_dir: Path | None = None,
    status: Any = None,
) -> list[dict[str, Any]]:
    """Recompute a CLOSED edition's evidence from the live tree; [] means it still holds."""
    root = Path(root)
    edition_dir = (snapshot_for(root) or root / EVENT_AUTHORITY_AUDIT_ROOT) if edition_dir is None else Path(edition_dir)
    try:
        evidence_raw = _edition_path(edition_dir, EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH).read_bytes()
        evidence = _strict_json(evidence_raw)
        frozen_raw = _edition_path(edition_dir, EVENT_AUTHORITY_FROZEN_CHECK_RECEIPT_REL_PATH).read_bytes()
        frozen = _strict_json(frozen_raw)
        continuity_raw = _edition_path(edition_dir, EVENT_AUTHORITY_CONTINUITY_RECEIPT_REL_PATH).read_bytes()
        continuity = _strict_json(continuity_raw)
        occurrences_raw = _edition_path(edition_dir, EVENT_AUTHORITY_OCCURRENCES_REL_PATH).read_bytes()
        if status is None:
            status = _strict_json(_edition_path(edition_dir, EVENT_AUTHORITY_STATUS_REL_PATH).read_bytes())
        if not isinstance(evidence, dict) or evidence.get("schema_id") != EVENT_AUTHORITY_CLOSURE_EVIDENCE_SCHEMA_ID:
            raise ClosureInputError("closure evidence identity")
        frozen_pin = evidence["frozen_check"]
        token_ledger_path = evidence["token_ledger"]["path"]
        declared = evidence["depth"]["declared_assessments"]
        continuity_pin = evidence["continuity"]
    except (ClosureInputError, OSError, ValueError, TypeError, KeyError) as exc:
        return [{"error": "event_authority_closure_evidence_unavailable", "detail": audit_error_detail(root, exc)}]
    failures: list[dict[str, Any]] = []
    if (
        not isinstance(frozen_pin, dict)
        or frozen_pin.get("receipt_sha256") != _sha256_bytes(frozen_raw)
        or not isinstance(continuity_pin, dict)
        or continuity_pin.get("receipt_sha256") != _sha256_bytes(continuity_raw)
    ):
        failures.append({"error": "event_authority_closure_artifact_binding_mismatch"})
        return failures
    recomputed, recompute_failures = compute_closure_evidence(
        root,
        token_ledger_path=token_ledger_path,
        depth_assessment_paths=declared if isinstance(declared, list) else [],
        frozen_receipt=frozen,
        frozen_receipt_sha256=frozen_pin.get("receipt_sha256"),
        frozen_validator_sha256=frozen_pin.get("validator_sha256"),
        recount_source_map=frozen_pin.get("recount_source_map"),
        continuity_receipt=continuity,
        continuity_receipt_sha256=continuity_pin.get("receipt_sha256"),
        occurrences_raw=occurrences_raw,
    )
    failures.extend(recompute_failures)
    if recomputed and recomputed != evidence:
        stored_inputs = {row.get("path"): row.get("sha256") for row in evidence.get("bound_inputs") or [] if isinstance(row, dict)}
        live_inputs = {row["path"]: row["sha256"] for row in recomputed["bound_inputs"]}
        if stored_inputs != live_inputs:
            changed = sorted(path for path in set(stored_inputs) & set(live_inputs) if stored_inputs[path] != live_inputs[path])
            failures.append({
                "error": "event_authority_closure_input_drift",
                "changed": changed[:50],
                "added": sorted(set(live_inputs) - set(stored_inputs))[:50],
                "removed": sorted(set(stored_inputs) - set(live_inputs))[:50],
            })
        other = sorted(key for key in set(evidence) | set(recomputed) if key != "bound_inputs" and evidence.get(key) != recomputed.get(key))
        if other:
            failures.append({"error": "event_authority_closure_evidence_mismatch", "sections": other})
    failures.extend(closed_status_failures(status, evidence, _sha256_bytes(evidence_raw)))
    return failures
