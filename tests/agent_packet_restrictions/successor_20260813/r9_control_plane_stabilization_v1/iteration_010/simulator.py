#!/usr/bin/env python3
"""Zero-call interactive simulator for the iteration-010 controller protocol.

The simulator imports only the data-only synthetic backend fixture, never the
controller or verifier.  Every controller traversal uses canonical stdout/stdin
request and root-event lines.  Synthetic evidence has zero empirical and
qualification credit, and predecessor failures remain failures.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import selectors
import signal
import stat
import subprocess
import sys
import time
from typing import Any, Callable

sys.dont_write_bytecode = True


def _load_synthetic_backend() -> Any:
    """Load only the data-only fixture module without creating bytecode."""
    path = Path(__file__).resolve().with_name("backend.py")
    spec = importlib.util.spec_from_file_location("r9_iteration_010_synthetic_backend", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("synthetic backend module spec unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


synthetic_backend = _load_synthetic_backend()

ROOT = Path(__file__).resolve().parent
STABILIZATION = ROOT.parent
SUCCESSOR = ROOT.parents[1]
REPO = ROOT.parents[4]
RUNS = STABILIZATION / "simulator_runs"
OPERATING = SUCCESSOR / "r9_goal_operating_contract_v1.json"
SUBJECT_TRANSPORT_ADDENDUM = (
    SUCCESSOR / "r9_subject_transport_addendum_subagent_invocations_v1.json"
)
ROUTE_CAPABILITY_RECEIPT = (
    SUCCESSOR / "r9_subject_transport_subagent_route_capability_receipt_v1.json"
)
SEMANTIC = ROOT / "semantic_manifest.json"
SCHEDULE = ROOT / "schedule.json"
CATALOG = ROOT / "regression_catalog.json"
REGRESSION_RECEIPT = ROOT / "regression_inventory_receipt.json"
CONTRACT = ROOT / "simulator_contract.json"
FAULTS = ROOT / "fault_scenarios.json"
SEMANTIC_RECEIPT = ROOT / "semantic_inventory_receipt.json"
CONTROLLER = ROOT / "controller.py"
BACKEND = ROOT / "backend.py"
VERIFIER = ROOT / "verifier.py"
SIMULATOR = ROOT / "simulator.py"
ITERATION_008 = STABILIZATION / "iteration_008"
ITERATION_009 = STABILIZATION / "iteration_009"
PREDECESSOR_SELF_ATTESTATION_SIMULATOR = ITERATION_009 / "simulator.py"
PREDECESSOR_SELF_ATTESTATION_RECEIPT = ITERATION_009 / "semantic_inventory_receipt.json"
PREDECESSOR_SELF_ATTESTATION_FALSIFIER = STABILIZATION / "iteration_009_falsifier_report_v1.json"
PREDECESSOR_SELF_ATTESTATION_IDENTITIES = {
    PREDECESSOR_SELF_ATTESTATION_SIMULATOR: {
        "sha256": "4d4b83e804537eb961da45f90e047d17c00cdbbe4218d0d6523c2829a0ec7ff9",
        "bytes": 192179,
    },
    PREDECESSOR_SELF_ATTESTATION_RECEIPT: {
        "sha256": "8f3d916eaada5db179fd94de73a9c2420e3379f60a3fb72af301566af743a91c",
        "bytes": 107083,
    },
    PREDECESSOR_SELF_ATTESTATION_FALSIFIER: {
        "sha256": "ad500690671fad27280bbdd61fab39443185b76554f2722f7756ac68a5db7a48",
        "bytes": 9678,
    },
}
PREDECESSOR_SEMANTIC = ITERATION_008 / "semantic_manifest.json"
PREDECESSOR_SCHEDULE = ITERATION_008 / "schedule.json"
PREDECESSOR_ROUTES = ITERATION_008 / "routes.json"
PREDECESSOR_CATALOG = ITERATION_008 / "regression_catalog.json"
PREDECESSOR_FAULTS = ITERATION_008 / "fault_scenarios.json"
FORMAL_CANDIDATE_V4_SEMANTIC = STABILIZATION / "formal_candidate_v4" / "semantic_manifest.json"
PREDECESSOR_ITERATION_008_IDENTITIES = {
    PREDECESSOR_SEMANTIC: {
        "sha256": "d94df402409dd969f7404517fba7be29db511b4736276f9f76ee587d9f8e4abc", "bytes": 595539,
    },
    FORMAL_CANDIDATE_V4_SEMANTIC: {
        "sha256": "d94df402409dd969f7404517fba7be29db511b4736276f9f76ee587d9f8e4abc", "bytes": 595539,
    },
    PREDECESSOR_CATALOG: {
        "sha256": "9e5724e190c2ddd7bfd32004bb44320a401a7f39c3689226aeafe41a6a95d102", "bytes": 45427,
    },
    PREDECESSOR_FAULTS: {
        "sha256": "1f7226b9587511b2c614e299c4096c4c86519263b117e051a7a57a728b88ce69", "bytes": 20959,
    },
    PREDECESSOR_ROUTES: {
        "sha256": "9baa62ac8c8a01cb2c4e0dcc32951131769e4c99d44dbcf92f4ec159cddd3f96", "bytes": 239,
    },
    PREDECESSOR_SCHEDULE: {
        "sha256": "2422c40998f7541268a72df9a7fed6ff3f45464de741110487e5900f664e5fb0", "bytes": 38410,
    },
}
SEMANTIC_DIAGNOSIS = STABILIZATION / "v4_run1_semantic_failure_diagnosis_v1.json"
PREDECESSOR_ROOT = STABILIZATION / "iteration_002"
REOPEN_REPAIR_CHECKPOINT = STABILIZATION / "git_checkpoint_iteration_003_v1.json"
REOPEN_REPAIR_PROGRESS = STABILIZATION / "progress_assessment_iteration_003_final_v1.json"
REOPEN_REPAIR_SUITE_RECEIPT = (
    STABILIZATION / "simulator_runs" / "iteration-003-final-self-test-001"
    / "simulator_receipt.json"
)
REOPEN_REPAIR_IDENTITIES = {
    REOPEN_REPAIR_CHECKPOINT: {
        "sha256": "f71b6d8fa4749fc7a212d104bd158b83dfa8933253527b2b31e57df53afcd027",
        "bytes": 6197,
    },
    REOPEN_REPAIR_PROGRESS: {
        "sha256": "a1684c896e846d445f4bcfef0d6ff367a903c2fefc4666d3abe2eda525ea5904",
        "bytes": 2542,
    },
    REOPEN_REPAIR_SUITE_RECEIPT: {
        "sha256": "365bc09467296174762cac501e1ec25a7f7203299c0d7ba8583eeeab24eb7749",
        "bytes": 260482,
    },
}
PERSISTENCE_PREDECESSOR_RECEIPT = (
    STABILIZATION / "simulator_runs" / "iteration-004-final-self-test-001"
    / "faults" / "025-loss-after-completion" / "receipt.json"
)
PERSISTENCE_PREDECESSOR_COMPLETION = (
    STABILIZATION / "simulator_runs" / "iteration-004-final-self-test-001"
    / "fault_evidence" / "025-loss-after-completion" / "run" / "cells"
    / "slot-alpha" / "000_S10A_DECISION_A01" / "completion.json"
)
PERSISTENCE_PREDECESSOR_IDENTITIES = {
    PERSISTENCE_PREDECESSOR_RECEIPT: {
        "sha256": "1955606fdbfd1d0b3d349c6ebc618111ce1b5036d6c233b512551f5d2851bb3e",
        "bytes": 451,
    },
    PERSISTENCE_PREDECESSOR_COMPLETION: {
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "bytes": 0,
    },
}
LOSS_STAGE_PREDECESSOR_ROOT = (
    STABILIZATION / "simulator_runs" / "iteration-005-final-self-test-001"
)
LOSS_STAGE_PREDECESSOR_RECEIPT = (
    LOSS_STAGE_PREDECESSOR_ROOT / "faults" / "024-loss-after-raw" / "receipt.json"
)
LOSS_STAGE_PREDECESSOR_RUN = (
    LOSS_STAGE_PREDECESSOR_ROOT / "fault_evidence" / "024-loss-after-raw" / "run"
)
LOSS_STAGE_PREDECESSOR_COMPLETION = (
    LOSS_STAGE_PREDECESSOR_RUN / "cells" / "slot-alpha"
    / "000_S10A_DECISION_A01" / "completion.json"
)
LOSS_STAGE_PREDECESSOR_IDENTITIES = {
    LOSS_STAGE_PREDECESSOR_RECEIPT: {
        "sha256": "df700199e1e458de29fd12a8bc3a0ee6e6fb4719791e1e624d7e7561449c538f",
        "bytes": 444,
    },
    LOSS_STAGE_PREDECESSOR_COMPLETION: {
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "bytes": 0,
    },
}
LOSS_AFTER_COMPLETION_STABLE_RECEIPT = (
    LOSS_STAGE_PREDECESSOR_ROOT / "faults" / "025-loss-after-completion" / "receipt.json"
)
LOSS_AFTER_COMPLETION_STABLE_IDENTITY = {
    "sha256": "0f66bb1a91fbaa3784f9d053f9967a2dbb0a1bb3deb716da9bef56a4ec14f5e9",
    "bytes": 25765,
}
LOSS_AFTER_COMPLETION_STABLE_RUN = (
    LOSS_STAGE_PREDECESSOR_ROOT / "fault_evidence" / "025-loss-after-completion" / "run"
)
GRACEFUL_DRAIN_PREDECESSOR_RUN = (
    LOSS_STAGE_PREDECESSOR_ROOT / "fault_evidence" / "017-ordered-boundary" / "run"
)
GRACEFUL_DRAIN_PREDECESSOR_RECEIPT = (
    LOSS_STAGE_PREDECESSOR_ROOT / "faults" / "017-ordered-boundary" / "receipt.json"
)
GRACEFUL_DRAIN_PREDECESSOR_IDENTITY = {
    "sha256": "1e1f95732023b5a774ce93da7073c7bf1435c062fa94f7a2c071f025db3588a2",
    "bytes": 42018,
}
PREDECESSOR_COMPONENT_ROOT = STABILIZATION / "iteration_005"
CANDIDATE_V2_ROOT = STABILIZATION / "formal_candidate_v2"
CANDIDATE_V2_BACKEND = CANDIDATE_V2_ROOT / "backend.py"
CANDIDATE_V2_FAILED_ROLLOUT = SUCCESSOR / "r9_candidate_v2_canary_01_failed_rollout.jsonl"
CANDIDATE_V2_FAILED_TERMINAL = SUCCESSOR / "r9_candidate_v2_canary_01_terminal.json"
CANDIDATE_V2_FAILURE_DIAGNOSIS = STABILIZATION / "canary_v2_failure_diagnosis_v1.json"
CANDIDATE_V2_FAILURE_IDENTITIES = {
    CANDIDATE_V2_BACKEND: {
        "sha256": "21e5ab30c4ed5b01d19ecdb0687d92ed4a356202cc89359a5a6e46a5511b4343",
        "bytes": 34910,
    },
    CANDIDATE_V2_FAILED_ROLLOUT: {
        "sha256": "c081fb0d3df01214d97a1805e8e91a1667453429c5d4f4960e74a6dd3b37b86f",
        "bytes": 86063,
    },
    CANDIDATE_V2_FAILED_TERMINAL: {
        "sha256": "ecbf1898ce78a71d9d8e5f8fe0f597405ce71b1070ef3ed6f68cc393efbb828f",
        "bytes": 7668,
    },
    CANDIDATE_V2_FAILURE_DIAGNOSIS: {
        "sha256": "271a7536389186be1ff852409ae095c934f546bbfe03fbc3d818bc8ebde42bef",
        "bytes": 19805,
    },
}
ROLLOUT_SELECTOR_SIGNATURE = (
    "SESSION_WIDE_USER_CARDINALITY_FALSE_REJECTS_TURN_BOUND_PROVIDER_INPUT"
)
TENSION_QUESTION = (
    "After applying the supplied predecessor_outputs, does this candidate still leave a "
    "durable unresolved authority, scope, sequence, lineage, or evidence boundary that "
    "downstream synthesis must preserve explicitly?"
)
OPERATIONAL_RULE = (
    "Operational rule: source_bindings.authority classifies the source document or excerpt; "
    "it does not by itself establish a downstream boundary. predecessor_outputs are controlling. "
    "Return false when they resolve the apparent discrepancy and leave no boundary. Return true "
    "when a conflict remains unresolved, a required resolution is missing, or predecessor_outputs "
    "establish distinct authorities, scopes, sequences, lineages, or evidence roles that downstream "
    "synthesis must keep separate."
)
OPERATIONAL_RULE_SHA256 = "f726b593813b42eeda445204d392262933756718f38ffb1a8094ba6e22c06ffd"
SEMANTIC_CALLS_ZERO = {"network": 0, "model": 0, "provider": 0, "subject": 0}
SIMULATOR_CALLS_ZERO = {
    "collaboration": 0, "model": 0, "network": 0, "provider": 0, "subject": 0,
}
PROJECTION_DISCREPANCY_KINDS = frozenset({
    "VALUE_CONFLICT", "AUTHORITY_SCOPE_OVERLAP",
})
PROJECTION_FORBIDDEN_RECURSIVE_KEYS = frozenset({
    "expected", "result", "observed_result", "controller_truth", "fixture", "fixture_id",
    "cell", "cell_id", "route", "slot", "model", "oracle", "oracle_hash", "hash", "sha256",
})
PROJECTION_FORBIDDEN_TOKENS = frozenset({
    "PASS", "FAIL", "controller_truth", "expected", "observed_result", "oracle_hash",
    '{"preserve_boundary":false}', '{"preserve_boundary":true}',
})
PROJECTION_PRESERVE_BOUNDARY_ALIASES = frozenset({
    b"preserveboundaryfalse", b"preserveboundarytrue",
})
PROJECTION_NEGATIVE_MUTATION_CASES = (
    "expected_flip_cannot_change_observed",
    "authority_metadata_flip_cannot_change_observed",
    "missing_resolution_returns_true",
    "mismatched_discrepancy_target_rejected",
    "unknown_claim_id_rejected",
    "malformed_decision_rejected",
    "conflicting_decisions_rejected",
    "duplicate_decision_id_rejected",
    "A04_incomplete_claim_coverage_rejected",
    "A05_equal_value_conflict_rejected",
    "A06_duplicate_claim_pair_rejected",
    "A07_cyclic_supersession_rejected",
    "A09_answer_alias_leakage_rejected",
    "A11_distinct_authority_kind_mismatch_rejected",
    "A13_malformed_canonical_identity_rejected",
    "boolean_claim_value_rejected",
    "unknown_discrepancy_kind_rejected",
)
SEMANTIC_OWNER_IDENTITIES = {
    ROOT / "semantic_manifest.json": {
        "sha256": "47337f3225c1a810ede548ca93e947d3ec7e8db23710a10c0909c042c0b2075c",
        "bytes": 597495,
    },
    ROOT / "semantic_inventory_receipt.json": {
        "sha256": "16a4d4215aada316eaf64336c0a23a971b406bc7bd77e0356f98b0fdd0d216c7",
        "bytes": 110641,
    },
    ROOT / "pipeline_contract.json": {
        "sha256": "16e05403a36719b0a5d8133f894a2403abd2b0c8521c7261610e197ed719e708",
        "bytes": 5547,
    },
    ROOT / "architecture_contract.json": {
        "sha256": "804b3054b6ae74d00081f51b78f7b5ce810a237322b6c89cf4094130d25979d4",
        "bytes": 28966,
    },
    ROOT / "README.md": {
        "sha256": "ad90c34baf38b6ba705b19e1b9ef44c288aa46bcc032f4aacd1d59d19505ef66",
        "bytes": 8965,
    },
}
REGRESSION_OWNER_IDENTITIES = {
    CATALOG: {
        "sha256": "5147d228270f3671f6c80ad1810cf74087cac70b4352803396f4390f8e130c80",
        "bytes": 57200,
    },
    REGRESSION_RECEIPT: {
        "sha256": "2c89dc98c4006f049295981a8c7d626dec57e76d9008be9723af4646bdaae567",
        "bytes": 19768,
    },
}
SAFE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
HEX64 = re.compile(r"[0-9a-f]{64}\Z")
FORBIDDEN_IMPORT = re.compile(
    r"(?:model_retest_r8_candidate_v|r8_candidate_v)(?:1[2-9]|20|21)(?:\.|/|\b)"
)
CONTROLLER_COMMANDS = ["reopen", "run-canary", "run-matrix", "simulate"]
ROW_FILES = [
    "attempt.json", "completion.json", "provider_input.txt", "raw_result.json",
    "spawn_message.txt", "spawn_receipt.json",
]
OBSERVED_EVIDENCE_SCHEMAS = {
    "attempt": "pw-r9-attempt-v3",
    "raw_result": "pw-r9-raw-result-v3",
    "completion": "pw-r9-completion-v3",
}
class SimulationError(RuntimeError):
    """Fail-closed simulator assertion."""


def _canon(value: Any) -> bytes:
    try:
        return json.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise SimulationError(f"not canonical JSON: {exc}") from exc


def _semantic_canon(value: Any) -> bytes:
    try:
        return json.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise SimulationError(f"not semantic-canonical JSON: {exc}") from exc


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _identity(data: bytes) -> dict[str, Any]:
    return {"sha256": _sha(data), "bytes": len(data)}


def _projection_leakage_hits(canonical: bytes) -> list[str]:
    hits = sorted(
        token for token in PROJECTION_FORBIDDEN_TOKENS
        if token.encode("utf-8") in canonical
    )
    normalized = re.sub(rb"[^a-z0-9]+", b"", canonical.lower())
    hits.extend(
        f"normalized:{alias.decode('ascii')}"
        for alias in sorted(PROJECTION_PRESERVE_BOUNDARY_ALIASES)
        if alias in normalized
    )
    return hits


def _validate_canonical_projection_identity(
    declared: object, computed: dict[str, Any], label: str,
) -> None:
    if not isinstance(declared, dict) or set(declared) != {"encoding", "sha256", "bytes"}:
        raise SimulationError(f"{label}: closed canonical identity schema required")
    sha256 = declared["sha256"]
    byte_count = declared["bytes"]
    if (
        declared["encoding"] != "UTF-8 canonical minified JSON without terminal LF"
        or not isinstance(sha256, str) or not HEX64.fullmatch(sha256)
        or not isinstance(byte_count, int) or isinstance(byte_count, bool) or byte_count < 0
    ):
        raise SimulationError(f"{label}: canonical identity field type or value invalid")
    if {"sha256": sha256, "bytes": byte_count} != computed:
        raise SimulationError(f"{label}: canonical identity mismatch")


def _evaluate_provider_projection(provider_projection: object) -> bool:
    """Evaluate one closed provider projection without answer-bearing inputs.

    This function deliberately has one input and returns one boolean.  It does
    not receive expected values, fixture IDs, receipt status/checks, callbacks,
    or claimed observations.  Malformed, ambiguous, duplicate, conflicting, or
    referentially invalid projections raise ``SimulationError`` fail closed.
    ``source_bindings.authority`` is validated as metadata and is never used to
    choose the result.
    """
    def exact_object(value: object, keys: set[str], label: str) -> dict[str, Any]:
        if not isinstance(value, dict) or set(value) != keys:
            observed = sorted(value) if isinstance(value, dict) else type(value).__name__
            raise SimulationError(f"{label}: closed schema mismatch: {observed}")
        return value

    def identifier(value: object, label: str) -> str:
        if not isinstance(value, str) or not SAFE.fullmatch(value):
            raise SimulationError(f"{label}: invalid identifier")
        return value

    def identifier_list(
        value: object, label: str, *, minimum: int = 1, exact: int | None = None,
    ) -> list[str]:
        if not isinstance(value, list) or len(value) < minimum or (
            exact is not None and len(value) != exact
        ):
            raise SimulationError(f"{label}: invalid identifier list cardinality")
        values = [identifier(item, f"{label}[{index}]") for index, item in enumerate(value)]
        if len(set(values)) != len(values):
            raise SimulationError(f"{label}: duplicate identifier")
        return values

    canonical = _canon(provider_projection)
    leakage_hits = _projection_leakage_hits(canonical)
    if leakage_hits:
        raise SimulationError(f"provider_projection: answer-bearing token leakage: {leakage_hits}")

    top = exact_object(provider_projection, {
        "source_supported_candidate", "supported_claims", "apparent_discrepancies",
        "source_bindings", "predecessor_outputs",
    }, "provider_projection")

    bindings = top["source_bindings"]
    if not isinstance(bindings, list) or not bindings:
        raise SimulationError("source_bindings: nonempty array required")
    source_ids: list[str] = []
    for index, item in enumerate(bindings):
        row = exact_object(item, {"authority", "source_record_id"}, f"source_bindings[{index}]")
        authority = row["authority"]
        if not isinstance(authority, str) or not authority or len(authority.encode("utf-8")) > 256:
            raise SimulationError(f"source_bindings[{index}].authority: invalid metadata")
        source_ids.append(identifier(row["source_record_id"], f"source_bindings[{index}].source_record_id"))
    if len(set(source_ids)) != len(source_ids):
        raise SimulationError("source_bindings: duplicate source_record_id")

    claims = top["supported_claims"]
    if not isinstance(claims, list) or not claims:
        raise SimulationError("supported_claims: nonempty array required")
    claim_ids: list[str] = []
    claims_by_id: dict[str, dict[str, Any]] = {}
    for index, item in enumerate(claims):
        row = exact_object(
            item, {"claim_id", "predicate", "source_record_ids", "value"},
            f"supported_claims[{index}]",
        )
        claim_id = identifier(row["claim_id"], f"supported_claims[{index}].claim_id")
        predicate = row["predicate"]
        if not isinstance(predicate, str) or not predicate or len(predicate.encode("utf-8")) > 256:
            raise SimulationError(f"supported_claims[{index}].predicate: invalid")
        refs = identifier_list(row["source_record_ids"], f"supported_claims[{index}].source_record_ids")
        if not set(refs).issubset(source_ids):
            raise SimulationError(f"supported_claims[{index}]: unknown source_record_id")
        value = row["value"]
        if (
            value is None or isinstance(value, (dict, list, float, bool))
            or not isinstance(value, (str, int))
        ):
            raise SimulationError(f"supported_claims[{index}].value: closed scalar required")
        claim_ids.append(claim_id)
        claims_by_id[claim_id] = row
    if len(set(claim_ids)) != len(claim_ids):
        raise SimulationError("supported_claims: duplicate claim_id")

    discrepancies = top["apparent_discrepancies"]
    if not isinstance(discrepancies, list) or not discrepancies:
        raise SimulationError("apparent_discrepancies: nonempty array required")
    discrepancy_claims: dict[str, set[str]] = {}
    discrepancy_kinds: dict[str, str] = {}
    discrepancy_pairs: set[frozenset[str]] = set()
    for index, item in enumerate(discrepancies):
        row = exact_object(
            item, {"claim_ids", "discrepancy_id", "kind"},
            f"apparent_discrepancies[{index}]",
        )
        discrepancy_id = identifier(
            row["discrepancy_id"], f"apparent_discrepancies[{index}].discrepancy_id",
        )
        if discrepancy_id in discrepancy_claims:
            raise SimulationError("apparent_discrepancies: duplicate discrepancy_id")
        pair = identifier_list(
            row["claim_ids"], f"apparent_discrepancies[{index}].claim_ids", exact=2,
        )
        if not set(pair).issubset(claim_ids):
            raise SimulationError(f"apparent_discrepancies[{index}]: unknown claim_id")
        pair_key = frozenset(pair)
        if pair_key in discrepancy_pairs:
            raise SimulationError(f"apparent_discrepancies[{index}]: duplicate claim pair")
        pair_claims = [claims_by_id[claim_id] for claim_id in pair]
        if len({claim["predicate"] for claim in pair_claims}) != 1:
            raise SimulationError(f"apparent_discrepancies[{index}]: claim predicates differ")
        kind = row["kind"]
        if kind not in PROJECTION_DISCREPANCY_KINDS:
            raise SimulationError(f"apparent_discrepancies[{index}].kind: invalid")
        if pair_claims[0]["value"] == pair_claims[1]["value"]:
            raise SimulationError(f"apparent_discrepancies[{index}]: equal-value discrepancy")
        discrepancy_pairs.add(pair_key)
        discrepancy_claims[discrepancy_id] = set(pair)
        discrepancy_kinds[discrepancy_id] = kind

    expected_pairs: set[frozenset[str]] = set()
    for left_index, left in enumerate(claims):
        for right in claims[left_index + 1:]:
            if left["predicate"] == right["predicate"] and left["value"] != right["value"]:
                expected_pairs.add(frozenset({left["claim_id"], right["claim_id"]}))
    if discrepancy_pairs != expected_pairs:
        raise SimulationError("apparent_discrepancies: incomplete unequal-value pair coverage")

    candidate = exact_object(
        top["source_supported_candidate"], {"claim_ids", "discrepancy_ids"},
        "source_supported_candidate",
    )
    candidate_claims = identifier_list(candidate["claim_ids"], "source_supported_candidate.claim_ids")
    candidate_discrepancies = identifier_list(
        candidate["discrepancy_ids"], "source_supported_candidate.discrepancy_ids",
    )
    if set(candidate_claims) != set(claim_ids) or set(candidate_discrepancies) != set(discrepancy_claims):
        raise SimulationError("source_supported_candidate: referential closure mismatch")

    predecessor_outputs = exact_object(top["predecessor_outputs"], {"decisions"}, "predecessor_outputs")
    decisions = predecessor_outputs["decisions"]
    if not isinstance(decisions, list):
        raise SimulationError("predecessor_outputs.decisions: array required")
    decision_ids: set[str] = set()
    by_discrepancy: dict[str, dict[str, Any]] = {}
    supersession_edges: dict[str, set[str]] = {claim_id: set() for claim_id in claim_ids}
    for index, item in enumerate(decisions):
        if not isinstance(item, dict):
            raise SimulationError(f"predecessor_outputs.decisions[{index}]: object required")
        decision = item.get("decision")
        if decision == "select_current_and_supersede_other":
            row = exact_object(item, {
                "decision", "decision_id", "discrepancy_id", "selected_claim_id",
                "superseded_claim_ids",
            }, f"predecessor_outputs.decisions[{index}]")
        elif decision in {"preserve_unresolved_conflict", "preserve_distinct_authorities"}:
            row = exact_object(item, {
                "decision", "decision_id", "discrepancy_id", "claim_ids",
            }, f"predecessor_outputs.decisions[{index}]")
        else:
            raise SimulationError(f"predecessor_outputs.decisions[{index}]: unknown decision")
        decision_id = identifier(row["decision_id"], f"predecessor_outputs.decisions[{index}].decision_id")
        if decision_id in decision_ids:
            raise SimulationError("predecessor_outputs.decisions: duplicate decision_id")
        decision_ids.add(decision_id)
        discrepancy_id = identifier(
            row["discrepancy_id"], f"predecessor_outputs.decisions[{index}].discrepancy_id",
        )
        target_claims = discrepancy_claims.get(discrepancy_id)
        if target_claims is None:
            raise SimulationError(f"predecessor_outputs.decisions[{index}]: unknown discrepancy target")
        target_kind = discrepancy_kinds[discrepancy_id]
        if discrepancy_id in by_discrepancy:
            raise SimulationError(f"predecessor_outputs.decisions[{index}]: conflicting decisions")
        if (
            decision in {"select_current_and_supersede_other", "preserve_unresolved_conflict"}
            and target_kind != "VALUE_CONFLICT"
        ) or (
            decision == "preserve_distinct_authorities"
            and target_kind != "AUTHORITY_SCOPE_OVERLAP"
        ):
            raise SimulationError(f"predecessor_outputs.decisions[{index}]: decision-kind mismatch")
        if decision == "select_current_and_supersede_other":
            selected = identifier(
                row["selected_claim_id"], f"predecessor_outputs.decisions[{index}].selected_claim_id",
            )
            superseded = identifier_list(
                row["superseded_claim_ids"],
                f"predecessor_outputs.decisions[{index}].superseded_claim_ids",
                exact=len(target_claims) - 1,
            )
            if selected in superseded or {selected, *superseded} != target_claims:
                raise SimulationError(f"predecessor_outputs.decisions[{index}]: selection coverage mismatch")
            supersession_edges[selected].update(superseded)
        else:
            named = identifier_list(
                row["claim_ids"], f"predecessor_outputs.decisions[{index}].claim_ids",
                exact=len(target_claims),
            )
            if set(named) != target_claims:
                raise SimulationError(f"predecessor_outputs.decisions[{index}]: preservation coverage mismatch")
        by_discrepancy[discrepancy_id] = row

    indegree = {claim_id: 0 for claim_id in claim_ids}
    for superseded_claims in supersession_edges.values():
        for claim_id in superseded_claims:
            indegree[claim_id] += 1
    ready = [claim_id for claim_id, degree in indegree.items() if degree == 0]
    visited = 0
    while ready:
        selected = ready.pop()
        visited += 1
        for superseded in supersession_edges[selected]:
            indegree[superseded] -= 1
            if indegree[superseded] == 0:
                ready.append(superseded)
    if visited != len(claim_ids):
        raise SimulationError("predecessor_outputs.decisions: cyclic supersession")

    for discrepancy_id in discrepancy_claims:
        decision = by_discrepancy.get(discrepancy_id)
        if decision is None or decision["decision"] in {
            "preserve_unresolved_conflict", "preserve_distinct_authorities",
        }:
            return True
    return False


def _projection_rejection(provider_projection: object) -> dict[str, str]:
    try:
        _evaluate_provider_projection(provider_projection)
    except SimulationError as exc:
        return {"result": "REJECTED_FAIL_CLOSED", "error": str(exc)}
    raise SimulationError("negative projection mutation was admitted")


def _recursive_keys(value: object) -> set[str]:
    keys: set[str] = set()
    if isinstance(value, dict):
        for key, item in value.items():
            if not isinstance(key, str):
                raise SimulationError("projection contains non-string JSON object key")
            keys.add(key)
            keys.update(_recursive_keys(item))
    elif isinstance(value, list):
        for item in value:
            keys.update(_recursive_keys(item))
    return keys


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in pairs:
        if key in value:
            raise SimulationError(f"duplicate JSON key: {key}")
        value[key] = item
    return value


def _regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise SimulationError(f"{label}: absent: {path}") from exc
    if not stat.S_ISREG(info.st_mode):
        raise SimulationError(f"{label}: not a regular nonlink: {path}")
    try:
        return path.read_bytes()
    except OSError as exc:
        raise SimulationError(f"{label}: read failed: {exc}") from exc


def _directory(path: Path, label: str) -> None:
    try:
        info = os.lstat(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise SimulationError(f"{label}: absent: {path}") from exc
    if not stat.S_ISDIR(info.st_mode):
        raise SimulationError(f"{label}: not a directory nonlink: {path}")


def _json(path: Path, label: str, canonical: bool = False) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise SimulationError(f"{label}: exactly one terminal LF and no CR required")
    try:
        value = json.loads(
            storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(
                SimulationError(f"nonfinite JSON value: {token}")
            ),
        )
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SimulationError(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise SimulationError(f"{label}: object required")
    if canonical and storage != _canon(value) + b"\n":
        raise SimulationError(f"{label}: noncanonical storage")
    return storage, value


def _predecessor_self_attestation_probe(
    provider_projection: dict[str, Any], projection_receipt_id: str,
) -> dict[str, Any]:
    """Exercise iteration 009's actual gate against an adverse in-memory receipt."""
    canonical_projection = json.loads(_canon(provider_projection))
    observed = _evaluate_provider_projection(canonical_projection)
    if observed is not True:
        raise SimulationError("predecessor negative-control projection must independently observe true")
    projection_identity = _identity(_canon(canonical_projection))

    bound_storage: dict[Path, bytes] = {}
    for path, expected in PREDECESSOR_SELF_ATTESTATION_IDENTITIES.items():
        storage = _regular(path, f"exact predecessor self-attestation input {path.name}")
        if _identity(storage) != expected:
            raise SimulationError(f"predecessor self-attestation identity drift: {path}")
        bound_storage[path] = storage

    _, original_receipt = _json(
        PREDECESSOR_SELF_ATTESTATION_RECEIPT,
        "iteration_009 original semantic inventory receipt",
    )
    _, falsifier = _json(
        PREDECESSOR_SELF_ATTESTATION_FALSIFIER,
        "iteration_009 independent falsifier report",
    )
    finding = falsifier.get("finding", {})
    falsifier_family = finding.get("normalized_family") if isinstance(finding, dict) else None
    if (
        falsifier.get("schema_id") != "pw-r9-iteration-009-independent-falsifier-report-v1"
        or falsifier.get("status") != "EXPERIMENT_VALIDITY_BLOCKER"
        or falsifier_family != "STATIC_COUNTERFACTUAL_SELF_ATTESTATION"
    ):
        raise SimulationError("iteration_009 falsifier family/status drift")

    mutated_receipt = json.loads(_canon(original_receipt))
    semantic_rows = mutated_receipt.get("semantic_regression_receipts", [])
    false_rows = [
        row for row in semantic_rows
        if isinstance(row, dict)
        and row.get("id") == "R9-SEM-REG-007-RENAMED-REORDERED-RESOLVED"
    ]
    if len(false_rows) != 1:
        raise SimulationError("iteration_009 false self-attestation case absent or duplicate")
    false_row = false_rows[0]
    false_case = false_row.get("case")
    false_checks = false_row.get("checks")
    if (
        not isinstance(false_case, dict)
        or false_case.get("fixture_name") != "renamed_reordered_resolved"
        or false_case.get("expected") is not False
        or false_row.get("status") != "PASS_DATA_ONLY_OPERATIONAL_RULE_APPLICATION"
        or not isinstance(false_checks, dict)
        or false_checks.get("result_matches_diagnosis") is not True
    ):
        raise SimulationError("iteration_009 false self-attestation declarations drift")
    false_case["provider_projection"] = canonical_projection
    mutated_storage = _canon(mutated_receipt) + b"\n"
    original_receipt_identity = _identity(bound_storage[PREDECESSOR_SELF_ATTESTATION_RECEIPT])
    mutated_receipt_identity = _identity(mutated_storage)
    if mutated_receipt_identity == original_receipt_identity:
        raise SimulationError("predecessor negative-control receipt mutation had no byte effect")

    predecessor_namespace: dict[str, Any] = {
        "__name__": "_iteration_009_self_attestation_negative_control",
        "__file__": str(PREDECESSOR_SELF_ATTESTATION_SIMULATOR),
        "__package__": None,
    }
    predecessor_source = bound_storage[PREDECESSOR_SELF_ATTESTATION_SIMULATOR]
    exec(
        compile(
            predecessor_source,
            str(PREDECESSOR_SELF_ATTESTATION_SIMULATOR),
            "exec",
        ),
        predecessor_namespace,
    )
    predecessor_gate = predecessor_namespace.get("_semantic_repair_gate")
    predecessor_regular = predecessor_namespace.get("_regular")
    predecessor_owner_identities = predecessor_namespace.get("SEMANTIC_OWNER_IDENTITIES")
    predecessor_receipt_path = predecessor_namespace.get("SEMANTIC_RECEIPT")
    if (
        not callable(predecessor_gate)
        or not callable(predecessor_regular)
        or not isinstance(predecessor_owner_identities, dict)
        or predecessor_receipt_path != PREDECESSOR_SELF_ATTESTATION_RECEIPT
        or predecessor_receipt_path not in predecessor_owner_identities
    ):
        raise SimulationError("iteration_009 executable gate surface drift")
    original_owner_identity = predecessor_owner_identities[predecessor_receipt_path]

    def in_memory_regular(path: Path, label: str) -> bytes:
        if path == predecessor_receipt_path:
            return mutated_storage
        return predecessor_regular(path, label)

    predecessor_result: object = None
    try:
        predecessor_namespace["_regular"] = in_memory_regular
        predecessor_owner_identities[predecessor_receipt_path] = mutated_receipt_identity
        predecessor_result = predecessor_gate()
    finally:
        predecessor_namespace["_regular"] = predecessor_regular
        predecessor_owner_identities[predecessor_receipt_path] = original_owner_identity
    if (
        predecessor_namespace.get("_regular") is not predecessor_regular
        or predecessor_owner_identities.get(predecessor_receipt_path) != original_owner_identity
    ):
        raise SimulationError("iteration_009 negative-control monkeypatch restoration failed")
    if not isinstance(predecessor_result, dict) or predecessor_result.get("status") != "PASS":
        raise SimulationError("iteration_009 actual gate did not admit adverse receipt")
    admitted_rows = [
        row for row in predecessor_result.get("counterfactuals", [])
        if isinstance(row, dict) and row.get("fixture_id") == "renamed_reordered_resolved"
    ]
    if (
        len(admitted_rows) != 1
        or admitted_rows[0].get("expected") is not False
        or admitted_rows[0].get("result") != "PASS"
        or false_case.get("expected") is not False
        or false_row.get("status") != "PASS_DATA_ONLY_OPERATIONAL_RULE_APPLICATION"
        or false_checks.get("result_matches_diagnosis") is not True
    ):
        raise SimulationError("iteration_009 adverse false declaration was not self-attested PASS")

    return {
        "classification": "FAIL_SELF_ATTESTATION_ADMITTED_ADVERSE_PROJECTION",
        "falsifier_family": falsifier_family,
        "actual_predecessor_gate": {
            "function": "iteration_009._semantic_repair_gate",
            "status": predecessor_result["status"],
            "declared_fixture": admitted_rows[0]["fixture_id"],
            "declared_expected": admitted_rows[0]["expected"],
            "declared_result": admitted_rows[0]["result"],
        },
        "adverse_projection": {
            "iteration_010_receipt_id": projection_receipt_id,
            "canonical_projection": projection_identity,
            "independent_observed": observed,
        },
        "exact_original_inputs": [
            {"path": str(path.relative_to(REPO)), **identity}
            for path, identity in PREDECESSOR_SELF_ATTESTATION_IDENTITIES.items()
        ],
        "receipt_negative_control": {
            "original": original_receipt_identity,
            "mutated_in_memory": mutated_receipt_identity,
            "persisted": False,
            "monkeypatch_restored": True,
        },
    }


def _sync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _mkdir(path: Path) -> None:
    try:
        os.mkdir(path, 0o755)
    except FileExistsError as exc:
        raise SimulationError(f"create-only directory exists: {path}") from exc
    _directory(path, "created directory")
    _sync_dir(path.parent)


def _ensure_dir(path: Path, boundary: Path) -> None:
    boundary = boundary.resolve()
    missing: list[Path] = []
    current = path
    while not current.exists():
        try:
            current.resolve(strict=False).relative_to(boundary)
        except ValueError as exc:
            raise SimulationError(f"directory escapes boundary: {path}") from exc
        missing.append(current)
        current = current.parent
    _directory(current, "existing ancestor")
    for item in reversed(missing):
        _mkdir(item)


def _write(path: Path, storage: bytes) -> dict[str, Any]:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise SimulationError(f"short write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    _sync_dir(path.parent)
    if _regular(path, "reopened write") != storage:
        raise SimulationError(f"reopen mismatch: {path}")
    return _identity(storage)


def _write_json(path: Path, value: dict[str, Any]) -> dict[str, Any]:
    return _write(path, _canon(value) + b"\n")


def _canonical_repository_path(path: Path, label: str) -> Path:
    """Admit one existing canonical in-repository path before any content read."""
    repository = Path(os.path.abspath(os.fspath(REPO)))
    try:
        resolved_repository = REPO.resolve(strict=True)
    except (OSError, RuntimeError) as exc:
        raise SimulationError(f"{label}: repository resolution failed: {exc}") from exc
    if resolved_repository != repository:
        raise SimulationError(f"{label}: repository path contains a symlink alias")
    supplied = Path(os.fspath(path))
    if ".." in supplied.parts:
        raise SimulationError(f"{label}: dot-dot lexical alias")
    lexical = Path(os.path.abspath(os.fspath(supplied)))
    try:
        lexical.relative_to(repository)
    except ValueError as exc:
        raise SimulationError(f"{label}: outside repository") from exc
    try:
        resolved = lexical.resolve(strict=True)
    except (OSError, RuntimeError) as exc:
        raise SimulationError(f"{label}: strict resolution failed: {exc}") from exc
    if resolved != lexical:
        raise SimulationError(f"{label}: symlink-bearing lexical alias")
    return lexical


def _canonical_relative_source_path(value: object, label: str) -> Path:
    """Parse one canonical repository-relative source-row spelling."""
    if not isinstance(value, str) or not value or value == "." or "\x00" in value:
        raise SimulationError(f"{label}: canonical relative path absent")
    pure = Path(value)
    if pure.is_absolute() or ".." in pure.parts or pure.as_posix() != value:
        raise SimulationError(f"{label}: noncanonical repository-relative path")
    return pure


def _relative(path: Path) -> str:
    repository = Path(os.path.abspath(os.fspath(REPO)))
    return _canonical_repository_path(path, "repository-relative path").relative_to(
        repository
    ).as_posix()


def _strict_source_paths(paths: list[Path], label: str) -> list[Path]:
    """Validate every source occurrence before deterministic lexical coalescing."""
    lexical_sources: dict[Path, Path] = {}
    for index, path in enumerate(paths):
        lexical = _canonical_repository_path(path, f"{label} candidate {index}")
        _regular(lexical, f"{label} candidate {index}")
        lexical_sources.setdefault(lexical, lexical)
    return sorted(lexical_sources.values(), key=_relative)


def _suite_root(text: str, create: bool) -> Path:
    if not text:
        raise SimulationError("--run-root required")
    if not RUNS.exists():
        if not create:
            raise SimulationError("simulator runs root absent")
        _mkdir(RUNS)
    else:
        _directory(RUNS, "simulator runs root")
    supplied = Path(text)
    path = RUNS / supplied if not supplied.is_absolute() and len(supplied.parts) == 1 else supplied
    path = path.resolve(strict=False)
    if path.parent != RUNS.resolve() or not SAFE.fullmatch(path.name):
        raise SimulationError(f"run root must be a safe direct child of {RUNS}")
    if create:
        if path.exists() or path.is_symlink():
            raise SimulationError("run root already exists; reuse forbidden")
        _mkdir(path)
        for name in ("evidence", "fault_evidence", "faults", "work"):
            _mkdir(path / name)
    else:
        _directory(path, "suite root")
    return path


def _source_paths() -> list[Path]:
    component_root = _canonical_repository_path(ROOT, "live component root")
    semantic_path = _canonical_repository_path(SEMANTIC, "semantic manifest")
    _, semantic = _json(semantic_path, "semantic manifest")
    rows = semantic.get("files")
    if not isinstance(rows, list):
        raise SimulationError("semantic files list absent")
    paths = [OPERATING, SUBJECT_TRANSPORT_ADDENDUM, ROUTE_CAPABILITY_RECEIPT]
    for source in sorted(component_root.iterdir(), key=lambda item: item.name):
        source = _canonical_repository_path(source, "iteration control member")
        if source.name == "evidence":
            continue
        if source.name == "__pycache__":
            raise SimulationError("pycache forbidden in iteration_010")
        info = os.lstat(source)
        if stat.S_ISREG(info.st_mode) and source.suffix in {".json", ".py", ".md"}:
            paths.append(source)
        elif stat.S_ISDIR(info.st_mode):
            raise SimulationError(f"unexpected iteration control directory: {source.name}")
        elif not stat.S_ISREG(info.st_mode):
            raise SimulationError(f"nonregular iteration control member: {source.name}")
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or set(row) != {"path", "sha256", "bytes"}:
            raise SimulationError(f"semantic file row {index}: shape mismatch")
        rel = _canonical_relative_source_path(
            row.get("path"), f"semantic file row {index}"
        )
        text = rel.as_posix()
        if "__pycache__" in rel.parts or rel.suffix == ".pyc":
            raise SimulationError(f"semantic file row {index}: unsafe or bytecode path")
        source = _canonical_repository_path(
            SUCCESSOR / rel, f"semantic source {text}"
        )
        data = _regular(source, f"semantic source {text}")
        if _identity(data) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"semantic source identity drift: {text}")
        paths.append(source)
    return _strict_source_paths(paths, "live source bundle")


def _git(args: list[str], input_bytes: bytes | None = None, allow_fail: bool = False) -> bytes | None:
    completed = subprocess.run(
        ["git", *args], cwd=REPO, input=input_bytes, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, check=False, env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    )
    if completed.returncode != 0:
        if allow_fail:
            return None
        raise SimulationError(
            f"git {' '.join(args)} failed rc={completed.returncode}: "
            f"{completed.stderr.decode('utf-8', 'replace')}"
        )
    return completed.stdout.rstrip(b"\n")


def _git_at(repository: Path, args: list[str], allow_fail: bool = False,
            preserve_output: bool = False) -> bytes | None:
    """Run local-only Git in an isolated causal-reproducer repository."""
    completed = subprocess.run(
        ["git", "-C", str(repository), *args], stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        env={
            **os.environ,
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_CONFIG_SYSTEM": os.devnull,
            "GIT_OPTIONAL_LOCKS": "0",
            "GIT_AUTHOR_NAME": "R9 deterministic simulator",
            "GIT_AUTHOR_EMAIL": "r9-simulator.invalid@example.invalid",
            "GIT_COMMITTER_NAME": "R9 deterministic simulator",
            "GIT_COMMITTER_EMAIL": "r9-simulator.invalid@example.invalid",
            "GIT_AUTHOR_DATE": "2001-01-01T00:00:00Z",
            "GIT_COMMITTER_DATE": "2001-01-01T00:00:00Z",
            "LC_ALL": "C",
        },
    )
    if completed.returncode != 0:
        if allow_fail:
            return None
        raise SimulationError(
            f"isolated git {' '.join(args)} failed rc={completed.returncode}: "
            f"{completed.stderr.decode('utf-8', 'replace')}"
        )
    return completed.stdout if preserve_output else completed.stdout.rstrip(b"\n")


def _sandbox_source_paths(component_root: Path) -> list[Path]:
    """Return the exact minimum runtime/source closure for a historical-HEAD proof."""
    component_root = _canonical_repository_path(component_root, "sandbox component root")
    _directory(component_root, "sandbox component root")
    semantic_path = _canonical_repository_path(
        component_root / "semantic_manifest.json", "sandbox semantic manifest"
    )
    _, semantic = _json(semantic_path, "sandbox semantic manifest")
    rows = semantic.get("files")
    if not isinstance(rows, list):
        raise SimulationError("sandbox semantic inventory absent")
    paths = [OPERATING]
    if component_root == _canonical_repository_path(ROOT, "live component root"):
        paths.extend([SUBJECT_TRANSPORT_ADDENDUM, ROUTE_CAPABILITY_RECEIPT])
    for source in sorted(component_root.iterdir(), key=lambda item: item.name):
        source = _canonical_repository_path(source, "sandbox component member")
        info = os.lstat(source)
        if stat.S_ISDIR(info.st_mode):
            if source.name == "evidence":
                continue
            raise SimulationError(f"sandbox component directory forbidden: {source}")
        if not stat.S_ISREG(info.st_mode) or source.suffix not in {".json", ".py", ".md"}:
            raise SimulationError(f"sandbox component member forbidden: {source}")
        paths.append(source)
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or set(row) != {"path", "sha256", "bytes"}:
            raise SimulationError(f"sandbox semantic row {index}: shape mismatch")
        pure = _canonical_relative_source_path(
            row.get("path"), f"sandbox semantic row {index}"
        )
        text = pure.as_posix()
        if "__pycache__" in pure.parts or pure.suffix == ".pyc":
            raise SimulationError(f"sandbox semantic row {index}: bytecode path")
        source = _canonical_repository_path(
            SUCCESSOR / pure, f"sandbox semantic source {text}"
        )
        storage = _regular(source, f"sandbox semantic source {text}")
        if _identity(storage) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"sandbox semantic source drift: {text}")
        paths.append(source)
    pipeline_path = _canonical_repository_path(
        component_root / "pipeline_contract.json", "sandbox pipeline contract"
    )
    _, pipeline = _json(pipeline_path, "sandbox pipeline contract")
    bindings = pipeline.get("bindings")
    if not isinstance(bindings, dict):
        raise SimulationError("sandbox pipeline bindings absent")
    for key, row in bindings.items():
        if not isinstance(row, dict):
            raise SimulationError(f"sandbox pipeline binding malformed: {key}")
        pure = _canonical_relative_source_path(
            row.get("path"), f"sandbox pipeline binding {key}"
        )
        if "__pycache__" in pure.parts or pure.suffix == ".pyc":
            raise SimulationError(f"sandbox pipeline binding bytecode path: {key}")
        source = REPO / pure if pure.parts and pure.parts[0] == "tests" else component_root / pure
        source = _canonical_repository_path(source, f"sandbox pipeline binding {key}")
        storage = _regular(source, f"sandbox pipeline binding {key}")
        if _identity(storage) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"sandbox pipeline binding drift: {key}")
        paths.append(source)
    return _strict_source_paths(paths, "sandbox source bundle")


def _materialize_sandbox_repository(repository: Path, component_root: Path,
                                    boundary: Path) -> tuple[Path, dict[str, Any]]:
    """Create a minimal local Git repository without importing executable code."""
    _mkdir(repository)
    sources = _sandbox_source_paths(component_root)
    rows: list[dict[str, Any]] = []
    for source in sources:
        relative = Path(_relative(source))
        target = repository / relative
        _ensure_dir(target.parent, boundary)
        storage = _regular(source, "sandbox source")
        _write(target, storage)
        rows.append({"path": relative.as_posix(), **_identity(storage)})
    _git_at(repository, ["init", "--quiet"])
    _git_at(repository, ["add", "--", *[row["path"] for row in rows]])
    _git_at(repository, ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null",
                         "commit", "--quiet", "-m", "recorded exact experiment bytes"])
    head_raw = _git_at(repository, ["rev-parse", "HEAD"])
    if head_raw is None:
        raise SimulationError("sandbox recorded HEAD absent")
    recorded_head = head_raw.decode("ascii")
    component_relative = Path(_relative(component_root))
    return repository / component_relative, {
        "recorded_git_head": recorded_head,
        "source_file_count": len(rows),
        "source_rows_sha256": _sha(_canon(rows)),
        "source_rows_bytes": len(_canon(rows)),
        "source_rows": rows,
        "component_root": component_relative.as_posix(),
    }


def _advance_sandbox_head(repository: Path, label: str) -> str:
    marker = repository / "historical_head_marker.json"
    _write_json(marker, {
        "schema_id": "pw-r9-simulator-historical-head-marker-v1",
        "label": label,
        "meaning": "unbound metadata advances current HEAD without changing experiment bytes",
    })
    _git_at(repository, ["add", "--", marker.name])
    _git_at(repository, ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null",
                         "commit", "--quiet", "-m", "advance unrelated evidence custody"])
    head_raw = _git_at(repository, ["rev-parse", "HEAD"])
    if head_raw is None:
        raise SimulationError("sandbox advanced HEAD absent")
    return head_raw.decode("ascii")


def _reopen_recorded_sources(repository: Path, recorded_head: str,
                             rows: list[dict[str, Any]]) -> dict[str, Any]:
    reopened: list[dict[str, Any]] = []
    for index, row in enumerate(rows):
        path = _canonical_relative_source_path(
            row.get("path"), f"recorded source row {index}"
        ).as_posix()
        blob = _git_at(repository, ["show", f"{recorded_head}:{path}"], preserve_output=True)
        if blob is None or _identity(blob) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"recorded source blob drift: {path}")
        reopened.append({"path": path, **_identity(blob)})
    return {
        "status": "PASS", "recorded_git_head": recorded_head,
        "reopened_blob_count": len(reopened),
        "reopened_rows_sha256": _sha(_canon(reopened)),
        "reopened_rows_bytes": len(_canon(reopened)),
    }


def _source_snapshot() -> dict[str, Any]:
    paths = _source_paths()
    files: list[dict[str, Any]] = []
    matches_head = True
    for path in paths:
        data = _regular(path, "bound source")
        rel = _relative(path)
        current_blob_raw = _git(["hash-object", "--stdin"], data)
        current_blob = current_blob_raw.decode("ascii") if current_blob_raw is not None else None
        head_blob_raw = _git(["rev-parse", f"HEAD:{rel}"], allow_fail=True)
        head_blob = head_blob_raw.decode("ascii") if head_blob_raw else None
        matches_head = matches_head and current_blob == head_blob
        files.append({
            "path": rel, **_identity(data), "git_blob_oid": current_blob,
            "head_blob_oid": head_blob, "matches_head": current_blob == head_blob,
        })
    head_raw = _git(["rev-parse", "HEAD"])
    origin_raw = _git(["rev-parse", "refs/remotes/origin/main"], allow_fail=True)
    status_raw = _git(
        ["status", "--porcelain=v2", "--untracked-files=all", "--", *[row["path"] for row in files]]
    )
    return {
        "schema_id": "pw-r9-source-bundle-binding-v1",
        "files": files,
        "file_count": len(files),
        "head": head_raw.decode("ascii") if head_raw else None,
        "origin_main": origin_raw.decode("ascii") if origin_raw else None,
        "head_equals_origin_main": bool(head_raw and origin_raw and head_raw == origin_raw),
        "all_bound_files_match_head": matches_head,
        "bound_status_porcelain_v2": status_raw.decode("utf-8") if status_raw else "",
        "bound_status_identity": _identity(status_raw or b""),
    }


def _stable_source_rows(snapshot: dict[str, Any], label: str) -> list[dict[str, Any]]:
    """Project only durable source identity, excluding mutable Git observations."""
    files = snapshot.get("files")
    if not isinstance(files, list):
        raise SimulationError(f"{label}: source files absent")
    if snapshot.get("file_count") != len(files):
        raise SimulationError(f"{label}: source file count mismatch")
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, row in enumerate(files):
        if not isinstance(row, dict):
            raise SimulationError(f"{label}: source row {index} is not an object")
        pure = _canonical_relative_source_path(
            row.get("path"), f"{label}: source row {index}"
        )
        path = pure.as_posix()
        sha256 = row.get("sha256")
        size = row.get("bytes")
        if path in seen:
            raise SimulationError(f"{label}: duplicate source path: {path}")
        if not isinstance(sha256, str) or not HEX64.fullmatch(sha256):
            raise SimulationError(f"{label}: invalid source SHA-256: {path}")
        if not isinstance(size, int) or isinstance(size, bool) or size < 0:
            raise SimulationError(f"{label}: invalid source byte count: {path}")
        seen.add(path)
        rows.append({"path": path, "sha256": sha256, "bytes": size})
    return sorted(rows, key=lambda row: row["path"])


def _snapshot_recorded_source_paths(recorded: dict[str, Any]) -> dict[str, Any]:
    """Reopen the exact recorded path set and record current Git custody separately."""
    expected = _stable_source_rows(recorded, "recorded source bundle")
    files: list[dict[str, Any]] = []
    matches_head = True
    for index, row in enumerate(expected):
        path = _canonical_repository_path(
            REPO / _canonical_relative_source_path(
                row["path"], f"recorded source row {index}"
            ),
            f"reopened recorded source {row['path']}",
        )
        data = _regular(path, f"reopened recorded source {row['path']}")
        current_blob_raw = _git(["hash-object", "--stdin"], data)
        current_blob = current_blob_raw.decode("ascii") if current_blob_raw is not None else None
        head_blob_raw = _git(["rev-parse", f"HEAD:{row['path']}"], allow_fail=True)
        head_blob = head_blob_raw.decode("ascii") if head_blob_raw else None
        matches_head = matches_head and current_blob == head_blob
        files.append({
            "path": row["path"], **_identity(data), "git_blob_oid": current_blob,
            "head_blob_oid": head_blob, "matches_head": current_blob == head_blob,
        })
    head_raw = _git(["rev-parse", "HEAD"])
    origin_raw = _git(["rev-parse", "refs/remotes/origin/main"], allow_fail=True)
    status_raw = _git([
        "status", "--porcelain=v2", "--untracked-files=all", "--",
        *[row["path"] for row in files],
    ])
    return {
        "schema_id": "pw-r9-source-bundle-binding-v1",
        "files": files,
        "file_count": len(files),
        "head": head_raw.decode("ascii") if head_raw else None,
        "origin_main": origin_raw.decode("ascii") if origin_raw else None,
        "head_equals_origin_main": bool(head_raw and origin_raw and head_raw == origin_raw),
        "all_bound_files_match_head": matches_head,
        "bound_status_porcelain_v2": status_raw.decode("utf-8") if status_raw else "",
        "bound_status_identity": _identity(status_raw or b""),
    }


def _source_identity_comparison(before: dict[str, Any], after: dict[str, Any],
                                current: dict[str, Any]) -> dict[str, Any]:
    """Compare stable sorted path/hash/byte rows and retain typed mismatch details."""
    before_rows = _stable_source_rows(before, "source bundle before")
    after_rows = _stable_source_rows(after, "source bundle after")
    current_rows = _stable_source_rows(current, "current source bundle")
    before_map = {row["path"]: row for row in before_rows}
    current_map = {row["path"]: row for row in current_rows}
    missing = sorted(set(before_map) - set(current_map))
    extra = sorted(set(current_map) - set(before_map))
    drift = [
        {"path": path, "expected": before_map[path], "observed": current_map[path]}
        for path in sorted(set(before_map) & set(current_map))
        if before_map[path] != current_map[path]
    ]
    before_after_equal = before_rows == after_rows
    before_current_equal = before_rows == current_rows
    return {
        "status": "PASS" if before_after_equal and before_current_equal else "FAIL",
        "projection": "sorted path/sha256/bytes",
        "before_after_equal": before_after_equal,
        "before_current_equal": before_current_equal,
        "expected_file_count": len(before_rows),
        "current_file_count": len(current_rows),
        "expected_rows_sha256": _sha(_canon(before_rows)),
        "expected_rows_bytes": len(_canon(before_rows)),
        "current_rows_sha256": _sha(_canon(current_rows)),
        "current_rows_bytes": len(_canon(current_rows)),
        "missing_paths": missing,
        "extra_paths": extra,
        "identity_drift": drift,
    }


def _current_git_custody(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Report present custody without coupling it to historical receipt metadata."""
    head_origin = snapshot.get("head_equals_origin_main") is True
    files_head = snapshot.get("all_bound_files_match_head") is True
    return {
        "status": "PASS" if head_origin and files_head else "FAIL",
        "local_head": snapshot.get("head"),
        "origin_main": snapshot.get("origin_main"),
        "head_equals_origin_main": head_origin,
        "all_bound_files_match_head": files_head,
        "bound_status_porcelain_v2": snapshot.get("bound_status_porcelain_v2"),
        "bound_status_identity": snapshot.get("bound_status_identity"),
        "historical_status_or_head_equality_required": False,
    }


def _recorded_component_root(snapshot: dict[str, Any]) -> Path:
    """Resolve the one controller directory already bound by the suite receipt."""
    rows = _stable_source_rows(snapshot, "recorded component source bundle")
    matches = [row for row in rows if row["path"].endswith("/controller.py")]
    if len(matches) != 1:
        raise SimulationError("recorded source bundle must contain exactly one controller.py")
    root = _canonical_repository_path(
        REPO / _canonical_relative_source_path(
            matches[0]["path"], "recorded controller source row"
        ),
        "recorded controller source",
    ).parent
    if root != _canonical_repository_path(ROOT, "current iteration controller root"):
        raise SimulationError("recorded component root is not current iteration_010")
    for name in ("backend.py", "controller.py", "semantic_manifest.json", "verifier.py"):
        path = _canonical_repository_path(root / name, f"recorded {name}")
        expected = [row for row in rows if row["path"] == _relative(path)]
        if len(expected) != 1 or _identity(_regular(path, f"recorded {name}")) != {
            "sha256": expected[0]["sha256"], "bytes": expected[0]["bytes"],
        }:
            raise SimulationError(f"recorded component closure mismatch: {name}")
    return root


def _reopen_repair_causal_proof(receipt_storage: bytes, before: dict[str, Any],
                                after: dict[str, Any], current: dict[str, Any],
                                stable: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any] | None:
    """Bind the exact iteration-003 post-push FAIL and its byte-stable successor."""
    if _identity(receipt_storage) != REOPEN_REPAIR_IDENTITIES[REOPEN_REPAIR_SUITE_RECEIPT]:
        return None
    evidence: list[dict[str, Any]] = []
    values: dict[Path, dict[str, Any]] = {}
    for path in (REOPEN_REPAIR_CHECKPOINT, REOPEN_REPAIR_PROGRESS):
        storage, value = _json(path, f"reopen-repair evidence {path.name}", True)
        if _identity(storage) != REOPEN_REPAIR_IDENTITIES[path]:
            raise SimulationError(f"reopen-repair predecessor evidence drift: {path.name}")
        evidence.append({"path": _relative(path), **_identity(storage)})
        values[path] = value
    checkpoint = values[REOPEN_REPAIR_CHECKPOINT]
    progress = values[REOPEN_REPAIR_PROGRESS]
    normalized = checkpoint.get("command", {}).get("normalized_report", {})
    failure = progress.get("failure", {})
    predecessor_fail = (
        checkpoint.get("status") == "POST_PUSH_REOPEN_FAIL"
        and normalized.get("status") == "FAIL"
        and normalized.get("source_bundle_matches") is False
        and sorted(normalized.get("clean_run_statuses", {}).values()) == ["PASS", "PASS"]
        and failure.get("normalized_family") == "DURABLE_REOPEN_COUPLED_TO_MUTABLE_GIT_STATE"
        and failure.get("signature")
        == "POST_PUSH_REOPEN_FAIL/source_bundle_matches=false after byte-identical bundle became tracked at pushed HEAD"
    )
    old_mutable_equal = before == after == current
    head_transition = before.get("head") != current.get("head")
    status_transition = (
        before.get("bound_status_identity") != current.get("bound_status_identity")
        or before.get("bound_status_porcelain_v2") != current.get("bound_status_porcelain_v2")
    )
    successor_pass = (
        stable.get("status") == "PASS" and custody.get("status") == "PASS"
        and head_transition and status_transition and not old_mutable_equal
    )
    status = "PASS" if predecessor_fail and successor_pass else "FAIL"
    return {
        "status": status,
        "normalized_signature": "R9_REG_20_HISTORICAL_RUN_GIT_HEAD_DRIFT",
        "normalized_family": "DURABLE_REOPEN_COUPLED_TO_MUTABLE_GIT_STATE",
        "predecessor": {
            "result": "FAIL", "exact_evidence": evidence,
            "legacy_full_mutable_snapshot_equal": old_mutable_equal,
            "clean_runs_individually_reopened": True,
        },
        "successor": {
            "result": "PASS" if successor_pass else "FAIL",
            "stable_path_sha256_bytes": stable.get("status"),
            "current_git_custody": custody.get("status"),
            "recorded_head": before.get("head"), "current_head": current.get("head"),
            "head_transition_observed": head_transition,
            "tracking_or_status_transition_observed": status_transition,
        },
        "causal_delta": "delete full mutable snapshot equality; retain exact byte identity and current Git custody",
        "calls": dict(SIMULATOR_CALLS_ZERO),
        "qualification_credit": 0,
    }


def _controller_commands() -> list[str]:
    tree = ast.parse(_regular(CONTROLLER, "controller source").decode("utf-8"), filename=str(CONTROLLER))
    commands: set[str] = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
            continue
        if node.func.attr != "add_parser" or not node.args:
            continue
        first = node.args[0]
        if isinstance(first, ast.Constant) and isinstance(first.value, str):
            commands.add(first.value)
    return sorted(commands)


def _runtime_repair_static_contract() -> dict[str, Any]:
    """Bind the interactive collaboration transport without executing a subject."""
    def dotted(node: ast.AST) -> str:
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            prefix = dotted(node.value)
            return f"{prefix}.{node.attr}" if prefix else node.attr
        return ""

    def one_function(tree: ast.AST, name: str, label: str) -> ast.FunctionDef:
        matches = [
            node for node in ast.walk(tree)
            if isinstance(node, ast.FunctionDef) and node.name == name
        ]
        if len(matches) != 1:
            raise SimulationError(f"{label}: exact function {name} absent or duplicate")
        return matches[0]

    controller_tree = ast.parse(
        _regular(CONTROLLER, "controller source").decode("utf-8"), filename=str(CONTROLLER),
    )
    admit = one_function(controller_tree, "_admit", "controller admission")
    complete = one_function(controller_tree, "_complete_admitted", "controller drain")
    transport = one_function(controller_tree, "_transport_result", "controller transport")
    execute = one_function(controller_tree, "_execute", "controller traversal")
    spawn = one_function(controller_tree, "_spawn_request", "controller request")
    protocol_reader = [
        node for node in ast.walk(controller_tree)
        if isinstance(node, ast.ClassDef) and node.name == "_ProtocolReader"
    ]
    if len(protocol_reader) != 1:
        raise SimulationError("controller canonical stdin protocol reader absent")
    admit_calls = [node for node in ast.walk(admit) if isinstance(node, ast.Call)]
    complete_calls = [node for node in ast.walk(complete) if isinstance(node, ast.Call)]
    execute_calls = [node for node in ast.walk(execute) if isinstance(node, ast.Call)]
    if (
        len([node for node in admit_calls if dotted(node.func) == "signal.pthread_sigmask"]) != 2
        or len([node for node in admit_calls if dotted(node.func) == "signal.sigpending"]) != 1
        or len([node for node in complete_calls if dotted(node.func) == "_spawn_request"]) != 1
        or len([node for node in complete_calls if dotted(node.func) == "reader.event"]) != 2
        or len([node for node in complete_calls
                if dotted(node.func) == "reader.reject_ready_extra_event"]) < 1
        or len([node for node in execute_calls if dotted(node.func) == "_admit"]) != 1
        or len([node for node in execute_calls
                if dotted(node.func) == "_complete_admitted"]) != 1
    ):
        raise SimulationError("controller once-only admission or ordered drain structure drift")
    request_keys = {
        key.value for node in ast.walk(spawn)
        if isinstance(node, ast.Dict)
        for key in node.keys if isinstance(key, ast.Constant) and isinstance(key.value, str)
    }
    required_request_keys = {
        "schema_id", "run_id", "run_kind", "mode", "slot", "cell", "index",
        "ordinal", "nonce", "invocation_id", "task_name",
        "expected_canonical_task_path", "agent_type", "fork_turns", "model",
        "reasoning_effort", "packet_sha256", "packet_bytes", "message_utf8",
        "message_sha256", "message_bytes", "attempt_sha256", "attempt_bytes",
    }
    if request_keys != required_request_keys:
        raise SimulationError("controller spawn request exact field set drift")
    transport_constants = {
        node.value for node in ast.walk(transport)
        if isinstance(node, ast.Constant) and isinstance(node.value, str)
    }
    if not {"FINAL_ANSWER", "FINAL_RETURNED"}.issubset(transport_constants):
        raise SimulationError("controller terminal protocol constants drift")
    handler_calls = [
        node for node in execute_calls if dotted(node.func) == "signal.signal"
    ]
    if len(handler_calls) != 2 or any(
        len(node.args) != 2 or dotted(node.args[1]) != "_stop"
        for node in handler_calls
    ):
        raise SimulationError("controller SIGINT/SIGTERM drain handlers drift")

    backend_tree = ast.parse(
        _regular(BACKEND, "backend source").decode("utf-8"), filename=str(BACKEND),
    )
    backend_imports = {
        alias.name
        for node in ast.walk(backend_tree) if isinstance(node, ast.Import)
        for alias in node.names
    } | {
        node.module or ""
        for node in ast.walk(backend_tree) if isinstance(node, ast.ImportFrom)
    }
    prohibited_backend_imports = sorted(
        name for name in backend_imports
        if name.split(".", 1)[0] in {
            "subprocess", "socket", "requests", "urllib", "httpx", "aiohttp",
        }
    )
    if prohibited_backend_imports:
        raise SimulationError(
            f"synthetic backend has execution/network imports: {prohibited_backend_imports}"
        )
    for name in (
        "validate_spawn_request", "make_spawn_receipt", "make_terminal_delivery",
        "make_spawn_failure", "make_terminal_failure", "scenario_events",
    ):
        one_function(backend_tree, name, "synthetic backend")

    simulator_tree = ast.parse(
        _regular(SIMULATOR, "simulator source").decode("utf-8"), filename=str(SIMULATOR),
    )
    driver = one_function(simulator_tree, "_drive_controller", "interactive simulator driver")
    driver_calls = [node for node in ast.walk(driver) if isinstance(node, ast.Call)]
    popen_calls = [
        node for node in driver_calls if dotted(node.func) == "subprocess.Popen"
    ]
    if len(popen_calls) != 1:
        raise SimulationError("interactive simulator must own exactly one Popen call site")
    keywords = {item.arg: item.value for item in popen_calls[0].keywords if item.arg}
    if not (
        isinstance(keywords.get("start_new_session"), ast.Constant)
        and keywords["start_new_session"].value is True
        and dotted(keywords.get("stdin", ast.Constant(None))) == "subprocess.PIPE"
        and dotted(keywords.get("stdout", ast.Constant(None))) == "subprocess.PIPE"
        and dotted(keywords.get("stderr", ast.Constant(None))) == "subprocess.PIPE"
        and (
            "shell" not in keywords
            or isinstance(keywords["shell"], ast.Constant) and keywords["shell"].value is False
        )
        and any(dotted(node.func) == "selectors.DefaultSelector" for node in driver_calls)
        and any(dotted(node.func) == "os.read" for node in driver_calls)
    ):
        raise SimulationError("interactive Popen pipe/session/selector contract drift")
    return {
        "status": "PASS",
        "controller_once_only_admission": True,
        "controller_ordered_root_event_drain": True,
        "controller_stop_handlers_through_terminal_reopen_and_output": True,
        "controller_spawn_request_exact_fields": True,
        "backend_synthetic_data_only": True,
        "simulator_single_interactive_popen_callsite": True,
        "simulator_start_new_session": True,
        "simulator_selectors_os_read": True,
        "shell": False,
        "new_public_controller_surface": 0,
    }


def _candidate_imports() -> list[str]:
    findings: list[str] = []
    for path in (CONTROLLER, BACKEND, VERIFIER, SIMULATOR):
        source = _regular(path, "Python source").decode("utf-8")
        tree = ast.parse(source, filename=str(path))
        for node in ast.walk(tree):
            names: list[str] = []
            if isinstance(node, ast.Import):
                names = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom):
                names = [node.module or ""]
            for name in names:
                if FORBIDDEN_IMPORT.search(name):
                    findings.append(f"{path.name}:{getattr(node, 'lineno', 0)}:{name}")
    return findings


def _history_evidence(refs: Any) -> list[dict[str, Any]]:
    if not isinstance(refs, list):
        raise SimulationError("predecessor evidence_refs must be a list")
    evidence: list[dict[str, Any]] = []
    for index, ref in enumerate(refs):
        if not isinstance(ref, dict) or not isinstance(ref.get("path"), str):
            raise SimulationError("predecessor evidence reference malformed")
        relative = _canonical_relative_source_path(
            ref["path"], f"predecessor evidence row {index}"
        ).as_posix()
        path = _canonical_repository_path(
            REPO / relative, f"predecessor {relative}"
        )
        data = _regular(path, f"predecessor {relative}")
        expected = {"sha256": ref.get("sha256"), "bytes": ref.get("bytes")}
        if _identity(data) != expected:
            raise SimulationError(f"predecessor evidence drift: {relative}")
        evidence.append({"path": relative, "role": ref.get("role"), **expected})
    return evidence


def _history() -> list[dict[str, Any]]:
    _, catalog = _json(CATALOG, "regression catalog")
    rows = catalog.get("families")
    if not isinstance(rows, list):
        raise SimulationError("regression catalog families absent")
    result: list[dict[str, Any]] = []
    for family in rows:
        if not isinstance(family, dict):
            raise SimulationError("regression family is not an object")
        additional = family.get("additional_variants", [])
        if not isinstance(additional, list):
            raise SimulationError("additional catalog variants must be a list")
        additional_history: list[dict[str, Any]] = []
        for variant in additional:
            if not isinstance(variant, dict):
                raise SimulationError("additional catalog variant is not an object")
            additional_history.append({
                "variant_id": variant.get("variant_id"),
                "scenario_id": variant.get("stabilized_simulator_scenario", {}).get("scenario_id"),
                "normalized_signature": variant.get("normalized_signature"),
                "predecessor_result": "FAIL",
                "predecessor_disposition": "PRESERVED_FAIL_NEVER_RECLASSIFIED",
                "evidence": _history_evidence(variant.get("evidence_refs", [])),
            })
        result.append({
            "regression_id": family.get("regression_id"),
            "scenario_id": family.get("stabilized_simulator_scenario", {}).get("scenario_id"),
            "predecessor_result": "FAIL",
            "predecessor_disposition": "PRESERVED_FAIL_NEVER_RECLASSIFIED",
            "evidence": _history_evidence(family.get("evidence_refs", [])),
            "additional_variants": additional_history,
        })
    return result


def _persistence_predecessor() -> dict[str, Any]:
    """Reopen the exact iteration-004 existence-observer failure without reclassifying it."""
    rows: list[dict[str, Any]] = []
    values: dict[Path, dict[str, Any]] = {}
    for path, expected in PERSISTENCE_PREDECESSOR_IDENTITIES.items():
        storage = _regular(path, f"persistence predecessor {path.name}")
        if _identity(storage) != expected:
            raise SimulationError(f"persistence predecessor drift: {_relative(path)}")
        rows.append({"path": _relative(path), **expected})
        if path == PERSISTENCE_PREDECESSOR_RECEIPT:
            parsed_storage, value = _json(path, "persistence predecessor receipt", True)
            if parsed_storage != storage:
                raise SimulationError("persistence predecessor receipt reopen mismatch")
            values[path] = value
    receipt = values[PERSISTENCE_PREDECESSOR_RECEIPT]
    if not (
        receipt.get("schema_id") == "pw-r9-compact-fault-receipt-v2"
        and receipt.get("identifier") == "loss-after-completion"
        and receipt.get("strategy") == "supervised_observation"
        and receipt.get("current_result") == "FAIL"
        and receipt.get("error", {}).get("message")
        == "completion: exactly one terminal LF and no CR required"
    ):
        raise SimulationError("persistence predecessor receipt semantics drift")
    return {
        "normalized_signature": "R9_REG_007_EXISTENCE_BEFORE_PERSISTENCE",
        "result": "FAIL_PRESERVED",
        "observer": "iteration_004 path-existence-only supervisor",
        "exact_evidence": rows,
        "zero_byte_completion": True,
        "qualification_credit": 0,
        "calls": dict(SIMULATOR_CALLS_ZERO),
    }


def _candidate_v2_failure_archive() -> dict[str, Any]:
    """Bind the exact failed canary, its archived rollout, and its diagnosis."""
    exact: list[dict[str, Any]] = []
    storage_by_path: dict[Path, bytes] = {}
    for path, expected in CANDIDATE_V2_FAILURE_IDENTITIES.items():
        storage = _regular(path, f"candidate-v2 failure artifact {path.name}")
        if _identity(storage) != expected:
            raise SimulationError(f"candidate-v2 failure artifact drift: {_relative(path)}")
        storage_by_path[path] = storage
        exact.append({"path": _relative(path), **expected})

    rollout_storage = storage_by_path[CANDIDATE_V2_FAILED_ROLLOUT]
    if not rollout_storage.endswith(b"\n") or b"\r" in rollout_storage:
        raise SimulationError("candidate-v2 rollout storage is not exact terminal-LF JSONL")
    try:
        rows = [json.loads(line) for line in rollout_storage.splitlines()]
    except json.JSONDecodeError as exc:
        raise SimulationError("candidate-v2 rollout JSONL is malformed") from exc
    if len(rows) != 13 or not all(isinstance(row, dict) for row in rows):
        raise SimulationError("candidate-v2 rollout must retain exactly 13 object rows")

    _, terminal = _json(CANDIDATE_V2_FAILED_TERMINAL, "candidate-v2 failed terminal", True)
    _, diagnosis = _json(CANDIDATE_V2_FAILURE_DIAGNOSIS, "candidate-v2 diagnosis", True)
    identity = terminal.get("identity")
    if not isinstance(identity, dict):
        raise SimulationError("candidate-v2 failed terminal identity absent")
    thread_id = identity.get("fresh_thread_id")
    turn_id = identity.get("fresh_turn_id")
    if not isinstance(thread_id, str) or not isinstance(turn_id, str):
        raise SimulationError("candidate-v2 thread/turn identity absent")
    turn_context_indexes = [
        index for index, row in enumerate(rows)
        if row.get("type") == "turn_context"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("turn_id") == turn_id
    ]
    user_indexes = [
        index for index, row in enumerate(rows)
        if row.get("type") == "response_item"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "user"
    ]
    if len(turn_context_indexes) != 1 or len(user_indexes) != 2:
        raise SimulationError("candidate-v2 rollout turn/user cardinality drift")
    context_index = turn_context_indexes[0]
    precontext = [index for index in user_indexes if index < context_index]
    target_inputs = [index for index in user_indexes if index > context_index]
    if len(precontext) != 1 or len(target_inputs) != 1:
        raise SimulationError("candidate-v2 precontext/target input order drift")
    target_payload = rows[target_inputs[0]]["payload"]
    target_content = target_payload.get("content")
    if not (
        isinstance(target_content, list) and len(target_content) == 1
        and isinstance(target_content[0], dict)
        and target_content[0].get("type") == "input_text"
        and isinstance(target_content[0].get("text"), str)
    ):
        raise SimulationError("candidate-v2 exact provider input malformed")
    provider_input = target_content[0]["text"]
    provider_storage = provider_input.encode("utf-8")
    if _identity(provider_storage) != {
        "sha256": "472fb6d9361e6a5a312e4e8e60d2430b6740c0bd1c91fa757d9cd933018a477b",
        "bytes": 2239,
    }:
        raise SimulationError("candidate-v2 exact provider input drift")

    finals = [
        (index, row["payload"])
        for index, row in enumerate(rows)
        if row.get("type") == "response_item"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "assistant"
        and row["payload"].get("phase") == "final_answer"
    ]
    starts = [
        (index, row["payload"])
        for index, row in enumerate(rows)
        if row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "task_started"
    ]
    completes = [
        (index, row["payload"])
        for index, row in enumerate(rows)
        if row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "task_complete"
    ]
    if not (
        len(starts) == len(finals) == len(completes) == 1
        and starts[0][1].get("turn_id") == turn_id
        and completes[0][1].get("turn_id") == turn_id
        and target_inputs[0] < finals[0][0] < completes[0][0]
    ):
        raise SimulationError("candidate-v2 exact task/final terminal order drift")
    final_content = finals[0][1].get("content")
    raw_final = (
        final_content[0].get("text")
        if isinstance(final_content, list) and len(final_content) == 1
        and isinstance(final_content[0], dict)
        and final_content[0].get("type") == "output_text"
        else None
    )
    if raw_final != '{"selected_choice":"ledger_lineage_only"}':
        raise SimulationError("candidate-v2 exact assistant final drift")

    counts = terminal.get("counts")
    if not (
        terminal.get("schema_id") == "pw-r9-candidate-v2-canary-failed-terminal-v1"
        and terminal.get("terminal") == "CONTROLLER_INVALID_CANARY_ZERO_CREDIT_NO_RETRY"
        and isinstance(counts, dict)
        and counts.get("attempts") == counts.get("dispatches") == 1
        and counts.get("valid_completions") == counts.get("pass") == 0
        and terminal.get("failure", {}).get("preserved_as_failure") is True
        and terminal.get("raw_assistant_final_output", {}).get("utf8") == raw_final
    ):
        raise SimulationError("candidate-v2 failed terminal semantics drift")
    matrix = diagnosis.get("deterministic_reproducer", {}).get("matrix")
    expected_cases = [
        "valid_zero_precontext", "current_canary_one_precontext", "valid_two_precontext",
        "missing_provider_input", "duplicate_exact_prompt_after_context",
        "wrong_prompt_after_context", "post_context_extra_nonmatching_user",
        "multiple_turn_contexts", "extra_wrong_turn_task_terminals", "zero_final",
        "one_final", "two_finals",
    ]
    if not (
        diagnosis.get("schema_id") == "pw-r9-canary-v2-failure-diagnosis-v1"
        and diagnosis.get("causal_diagnosis", {}).get("typed_root_cause")
            == "BACKEND_FALSE_REJECTION_FROM_SESSION_WIDE_USER_MESSAGE_CARDINALITY"
        and diagnosis.get("regression_disposition", {}).get("existing_regression_id")
            == "R9-REG-007"
        and isinstance(matrix, list)
        and [row.get("case_id") for row in matrix if isinstance(row, dict)] == expected_cases
    ):
        raise SimulationError("candidate-v2 diagnosis or fault matrix drift")
    return {
        "schema_id": "pw-r9-candidate-v2-failure-archive-binding-v1",
        "status": "FAIL_PRESERVED",
        "normalized_signature": ROLLOUT_SELECTOR_SIGNATURE,
        "exact_evidence": exact,
        "rollout": {
            "rows": len(rows), "thread_id": thread_id, "turn_id": turn_id,
            "precontext_user_messages": len(precontext),
            "target_turn_exact_provider_inputs": len(target_inputs),
            "provider_input": _identity(provider_storage),
            "assistant_finals": len(finals), "task_started": len(starts),
            "task_complete": len(completes), "exact_final_preserved": True,
            "exact_task_terminal_preserved": True,
        },
        "diagnosis_matrix_case_ids": expected_cases,
        "calls": dict(SIMULATOR_CALLS_ZERO),
        "qualification_credit": 0,
    }


def _backend_self_test() -> dict[str, Any]:
    """Run the data-only collaboration fixture self-test."""
    env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "R9_SIMULATOR_ZERO_PROVIDER": "1"}
    started = time.monotonic_ns()
    completed = subprocess.run(
        [sys.executable, "-B", "backend.py", "self-test"], cwd=ROOT, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60.0, check=False,
    )
    result = _parse_stdout(completed.stdout)
    if not (
        completed.returncode == 0
        and completed.stderr == b""
        and isinstance(result, dict)
        and result.get("schema_id") == "pw-r9-synthetic-backend-self-test-v1"
        and result.get("status") == "PASS"
        and result.get("actual_invocations") == 0
        and result.get("empirical_subject_invocations") == 0
        and result.get("subject_calls") == 0
        and result.get("collaboration_calls") == 0
        and result.get("provider_calls") == 0
        and result.get("network_calls") == 0
        and result.get("writes") == 0
        and result.get("scenario_count") == 18
        and result.get("scenario_coverage") == list(synthetic_backend.SCENARIOS)
    ):
        raise SimulationError(
            "backend bounded self-test failed: "
            f"rc={completed.returncode} stdout={completed.stdout!r} stderr={completed.stderr!r}"
        )
    return {
        "invocation": _invocation_record(
            ["self-test"], completed.returncode, completed.stdout, completed.stderr,
            time.monotonic_ns() - started,
        ),
        "scenario_coverage": result["scenario_coverage"],
        "scenario_count": result["scenario_count"],
        "request_hash_binding": result.get("request_hash_binding"),
        "deterministic_repeat": result.get("deterministic_repeat"),
    }


def _controller_check_only() -> dict[str, Any]:
    """Invoke the current public zero-write, zero-backend control admission check."""
    command = [sys.executable, "-B", "controller.py", "simulate", "--check-only"]
    started = time.monotonic_ns()
    completed = subprocess.run(
        command, cwd=ROOT, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, check=False,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
    )
    invocation = _invocation_record(
        ["simulate", "--check-only"], completed.returncode, completed.stdout,
        completed.stderr, time.monotonic_ns() - started,
    )
    result = invocation.get("result")
    if (
        completed.returncode != 0 or not isinstance(result, dict)
        or result.get("schema_id") != "pw-r9-control-check-v3"
        or result.get("status") != "PASS"
        or result.get("spawn_requests") != 0
        or result.get("root_events_read") != 0
        or result.get("evidence_writes") != 0
        or result.get("routes") != 3 or result.get("cells") != 97
        or result.get("matrix_rows") != 291
        or result.get("deterministic_stages_per_route") != 18
        or result.get("required_clean_stage_artifacts") != 54
    ):
        raise SimulationError(
            "controller public check-only failed: "
            f"rc={completed.returncode}; stdout={completed.stdout.decode('utf-8', 'replace')}; "
            f"stderr={completed.stderr.decode('utf-8', 'replace')}"
        )
    return invocation


def _assert_historical_catalog_projection(
    predecessor_catalog: dict[str, Any], current_catalog: dict[str, Any],
) -> dict[str, Any]:
    """Preserve history while admitting only named current-proof field changes."""
    old_families = predecessor_catalog.get("families")
    new_families = current_catalog.get("families")
    if (
        not isinstance(old_families, list) or len(old_families) != 21
        or not isinstance(new_families, list) or len(new_families) < 21
    ):
        raise SimulationError("historical 21-family catalog projection absent")
    family_current_fields = {"required_current_pass", "stabilized_simulator_scenario"}
    variant_current_fields = {
        "required_current_pass", "stabilized_simulator_scenario", "strategy",
        "successor_proof_status", "variant_id",
    }
    changed_family_ids: list[str] = []
    for old, new in zip(old_families, new_families[:21], strict=True):
        if not isinstance(old, dict) or not isinstance(new, dict):
            raise SimulationError("historical catalog family row is not an object")
        regression_id = old.get("regression_id")
        if not isinstance(regression_id, str) or new.get("regression_id") != regression_id:
            raise SimulationError("historical catalog family identity/order changed")
        allowed = set(family_current_fields)
        if regression_id == "R9-REG-007":
            allowed.add("additional_variants")
        old_historical = {key: value for key, value in old.items() if key not in allowed}
        new_historical = {key: value for key, value in new.items() if key not in allowed}
        if old_historical != new_historical:
            raise SimulationError(
                f"historical catalog family field changed outside current proof: {regression_id}"
            )
        if any(old.get(key) != new.get(key) for key in family_current_fields):
            changed_family_ids.append(regression_id)
        if regression_id != "R9-REG-007":
            continue
        old_variants = old.get("additional_variants")
        new_variants = new.get("additional_variants")
        if (
            not isinstance(old_variants, list) or len(old_variants) != 1
            or not isinstance(new_variants, list) or len(new_variants) != 1
            or not isinstance(old_variants[0], dict) or not isinstance(new_variants[0], dict)
        ):
            raise SimulationError("R9-REG-007 historical additional variant shape changed")
        old_variant_historical = {
            key: value for key, value in old_variants[0].items()
            if key not in variant_current_fields
        }
        new_variant_historical = {
            key: value for key, value in new_variants[0].items()
            if key not in variant_current_fields
        }
        if old_variant_historical != new_variant_historical:
            raise SimulationError("R9-REG-007 additional-variant historical fields changed")
    return {
        "historical_family_count": 21,
        "historical_fields_preserved": True,
        "allowed_family_current_proof_fields": sorted(family_current_fields),
        "r9_reg_007_allowed_variant_current_proof_fields": sorted(variant_current_fields),
        "families_with_current_proof_changes": changed_family_ids,
    }


def _validate_applied_catalog_delta(faults: dict[str, Any]) -> dict[str, Any]:
    """Validate the applied 14+2+1 transport delta against active fault rows."""
    scenarios = faults.get("scenarios")
    globals_ = faults.get("global_fault_cases")
    delta = faults.get("catalog_delta_required")
    if (
        not isinstance(scenarios, list) or len(scenarios) != 22
        or not isinstance(globals_, list) or len(globals_) != 10
        or not isinstance(delta, dict)
        or delta.get("status")
            != "APPLIED_AND_VERIFIED_BY_AUTHORIZED_CATALOG_SOLE_WRITER"
        or delta.get("family_count") != 22
        or delta.get("variant_count_before") != 56
        or delta.get("variant_count_after") != 56
    ):
        raise SimulationError("applied catalog delta status/count drift")
    family_ids = [row.get("regression_id") for row in scenarios if isinstance(row, dict)]
    if len(family_ids) != 22 or len(set(family_ids)) != 22:
        raise SimulationError("active fault family identifiers are absent or duplicated")
    active: list[tuple[str, dict[str, Any]]] = []
    for scenario in scenarios:
        variants = scenario.get("variants") if isinstance(scenario, dict) else None
        if not isinstance(variants, list):
            raise SimulationError("active fault variant rows absent")
        for variant in variants:
            if not isinstance(variant, dict):
                raise SimulationError("active fault variant is not an object")
            active.append((scenario["regression_id"], variant))
    active_ids = [variant.get("variant_id") for _, variant in active]
    if (
        len(active) != 56 or not all(isinstance(item, str) for item in active_ids)
        or len(set(active_ids)) != 56
    ):
        raise SimulationError("exact 56 unique active variant identifiers required")
    active_by_key = {(regression_id, variant["variant_id"]): variant
                     for regression_id, variant in active}

    replacements = delta.get("replacements")
    if not isinstance(replacements, list) or len(replacements) != 14:
        raise SimulationError("exact 14 applied replacement rows required")
    old_ids = [row.get("old_variant_id") for row in replacements if isinstance(row, dict)]
    new_ids = [row.get("new_variant_id") for row in replacements if isinstance(row, dict)]
    if (
        len(old_ids) != 14 or len(new_ids) != 14
        or not all(isinstance(item, str) for item in old_ids + new_ids)
        or len(set(old_ids)) != 14 or len(set(new_ids)) != 14
        or set(old_ids) & set(new_ids) or set(old_ids) & set(active_ids)
    ):
        raise SimulationError("applied replacement old/new identifiers overlap, duplicate, or remain active")
    active_replacements = [
        {
            "regression_id": regression_id,
            "old_variant_id": variant["replaces_variant_id"],
            "new_variant_id": variant["variant_id"],
            "new_strategy": variant["strategy"],
        }
        for regression_id, variant in active
        if isinstance(variant.get("replaces_variant_id"), str)
    ]
    if replacements != active_replacements:
        raise SimulationError("declared replacements do not exactly match active variant rows")
    for row in replacements:
        key = (row.get("regression_id"), row.get("new_variant_id"))
        variant = active_by_key.get(key)
        if (
            not isinstance(variant, dict)
            or variant.get("replaces_variant_id") != row.get("old_variant_id")
            or variant.get("strategy") != row.get("new_strategy")
        ):
            raise SimulationError(f"applied replacement row mismatch: {key}")

    expected_in_place = [
        {
            "regression_id": "R9-REG-005", "variant_id": "one-terminal-lf",
            "old_backend_scenario": "immediate", "new_backend_scenario": "clean",
            "strategy": "clean_reference",
        },
        {
            "regression_id": "R9-REG-008", "variant_id": "same-root-reinvoke",
            "old_strategy": "same_root_reinvoke",
            "new_strategy": "same_root_after_hard_loss",
            "old_backend_scenario": "immediate", "new_backend_scenario": "clean",
        },
    ]
    in_place = delta.get("in_place_transport_updates")
    if in_place != expected_in_place:
        raise SimulationError("exact two applied in-place transport updates drift")
    for row in in_place:
        key = (row["regression_id"], row["variant_id"])
        variant = active_by_key.get(key)
        required_strategy = row.get("new_strategy", row.get("strategy"))
        if (
            not isinstance(variant, dict)
            or variant.get("backend_scenario") != row.get("new_backend_scenario")
            or variant.get("strategy") != required_strategy
        ):
            raise SimulationError(f"in-place transport update is not active: {key}")

    expected_global_updates = [{
        "case_id": "GF-SUBJECT-FAIL-PATH-STOP",
        "old_strategy": "subject_fail_path_stop",
        "new_strategy": "protocol_subject_fail",
        "backend_scenario": "malformed_output",
    }]
    global_updates = delta.get("global_case_updates")
    global_ids = [row.get("case_id") for row in globals_ if isinstance(row, dict)]
    if (
        global_updates != expected_global_updates or len(global_ids) != 10
        or len(set(global_ids)) != 10
    ):
        raise SimulationError("exact applied global update or global identifiers drift")
    global_by_id = {row["case_id"]: row for row in globals_}
    for row in global_updates:
        active_global = global_by_id.get(row["case_id"])
        if (
            not isinstance(active_global, dict)
            or active_global.get("strategy") != row.get("new_strategy")
            or active_global.get("backend_scenario") != row.get("backend_scenario")
        ):
            raise SimulationError("declared global update does not match active global row")
    return {
        "status": delta["status"], "families": 22, "variants": 56, "globals": 10,
        "unique_active_variant_ids": 56, "old_variant_ids_absent": 14,
        "one_for_one_replacements": 14, "in_place_updates": 2, "global_updates": 1,
    }


def _semantic_repair_gate() -> dict[str, Any]:
    """Execute the V4-to-iteration-010 projection repair gate with zero calls."""
    for path, expected in SEMANTIC_OWNER_IDENTITIES.items():
        observed = _identity(_regular(path, f"stable semantic-owner file {path.name}"))
        if observed != expected:
            raise SimulationError(f"semantic-owner identity drift: {path.name}")
    for path, expected in PREDECESSOR_ITERATION_008_IDENTITIES.items():
        if _identity(_regular(path, f"exact predecessor file {path.name}")) != expected:
            raise SimulationError(f"exact iteration_008/V4 predecessor identity drift: {path}")
    for path, expected in REGRESSION_OWNER_IDENTITIES.items():
        if _identity(_regular(path, f"stable regression-owner file {path.name}")) != expected:
            raise SimulationError(f"regression-owner identity drift: {path.name}")
    if _identity(OPERATIONAL_RULE.encode("utf-8")) != {
        "sha256": OPERATIONAL_RULE_SHA256, "bytes": 487,
    }:
        raise SimulationError("exact 487-byte operational rule identity drift")
    if _identity(TENSION_QUESTION.encode("utf-8")) != {
        "sha256": "320cac713b9ba0bd3de44fcd248518e0fc8f6e9f06606d0a50080896ff7aaf48",
        "bytes": 211,
    }:
        raise SimulationError("exact unchanged 211-byte tension question drift")

    _, predecessor = _json(PREDECESSOR_SEMANTIC, "iteration_008 semantic manifest")
    _, successor = _json(SEMANTIC, "iteration_010 semantic manifest")
    _, receipt = _json(SEMANTIC_RECEIPT, "iteration_010 semantic inventory receipt")
    _, diagnosis = _json(SEMANTIC_DIAGNOSIS, "V4 run-01 semantic diagnosis")
    _, predecessor_catalog = _json(PREDECESSOR_CATALOG, "iteration_008 regression catalog")
    _, predecessor_faults = _json(PREDECESSOR_FAULTS, "iteration_008 fault scenarios")
    _, current_catalog = _json(CATALOG, "iteration_010 regression catalog")
    _, regression_receipt = _json(REGRESSION_RECEIPT, "iteration_010 regression receipt")
    _, current_faults = _json(FAULTS, "iteration_010 fault scenarios")

    if (
        diagnosis.get("normalized_failure", {}).get("family")
            != "RESOLVED_TENSION_BOUNDARY_PREDICATE_AMBIGUITY"
        or diagnosis.get("counterfactual_suite", {}).get("static_reproducer", {})
            .get("predecessor_fail", {}).get("result") != "FAIL_CONTRACT_INCOMPLETE"
        or diagnosis.get("proposed_repair", {}).get("exact_instruction_insertion", {}).get("utf8")
            != OPERATIONAL_RULE
        or diagnosis.get("proposed_repair", {}).get("exact_instruction_insertion", {}).get("sha256")
            != OPERATIONAL_RULE_SHA256
        or diagnosis.get("proposed_repair", {}).get("exact_question_after", {}).get("utf8")
            != TENSION_QUESTION
    ):
        raise SimulationError("V4 diagnosis and exact repair binding drift")

    old_cells, new_cells = predecessor.get("cells"), successor.get("cells")
    if not isinstance(old_cells, list) or not isinstance(new_cells, list):
        raise SimulationError("cross-iteration semantic cells absent")
    if len(old_cells) != 97 or len(new_cells) != 97:
        raise SimulationError("cross-iteration semantic cell count drift")
    changed: list[str] = []
    unchanged: list[str] = []
    tension: list[str] = []
    stable_fields = (
        "expected_output", "expected_output_sha256", "expected_output_bytes",
        "expected_output_storage_sha256", "expected_output_storage_bytes", "dependency_gate",
    )
    anchor = (
        "Answer only the exact preserve_boundary question for the supplied source-supported "
        "candidate and compiled direct-fact projection."
    )
    insertion = anchor + "\n" + OPERATIONAL_RULE
    for old, new in zip(old_cells, new_cells, strict=True):
        if not isinstance(old, dict) or not isinstance(new, dict):
            raise SimulationError("semantic cell row is not an object")
        cell = old.get("cell")
        if not isinstance(cell, str) or cell != new.get("cell") or old.get("index") != new.get("index"):
            raise SimulationError("semantic cell order or identity drift")
        old_render, new_render = old.get("render_utf8"), new.get("render_utf8")
        if not isinstance(old_render, str) or not isinstance(new_render, str):
            raise SimulationError(f"{cell}: render absent")
        if "_TENSION_" in cell:
            tension.append(cell)
            if (
                old_render.count(anchor) != 1 or old_render.count(TENSION_QUESTION) != 1
                or old_render.count(OPERATIONAL_RULE) != 0
                or new_render != old_render.replace(anchor, insertion)
                or new_render.count(OPERATIONAL_RULE) != 1
                or new_render.count(TENSION_QUESTION) != 1
            ):
                raise SimulationError(f"{cell}: exact operational-rule insertion drift")
        elif old_render != new_render or OPERATIONAL_RULE in new_render:
            raise SimulationError(f"{cell}: non-tension render changed or contains rule")
        (unchanged if old_render == new_render else changed).append(cell)
        if _identity(new_render.encode("utf-8")) != {
            "sha256": new.get("render_utf8_sha256"), "bytes": new.get("render_utf8_bytes"),
        }:
            raise SimulationError(f"{cell}: successor render identity drift")
        for field in stable_fields:
            if old.get(field) != new.get(field):
                raise SimulationError(f"{cell}: stable oracle/gate field drift: {field}")
    if changed != tension or len(tension) != 4 or len(unchanged) != 93:
        raise SimulationError("exact four tension changes and 93 unchanged prompts required")
    answer_bearing_tokens = {
        '"fixture_name"', '"expected"', '"controller_truth"', '"oracle_hash"',
        '"result_hash"', '"route"', '"slot"', '"model"', '"cell_id"', '"case_order"',
    }
    leakage = {
        token: sum(row["render_utf8"].count(token) for row in new_cells)
        for token in answer_bearing_tokens
    }
    if any(leakage.values()):
        raise SimulationError(f"provider-visible answer-bearing field leakage: {leakage}")
    if predecessor.get("deterministic_stages") != successor.get("deterministic_stages"):
        raise SimulationError("18 deterministic artifact payloads changed")
    if len(successor.get("deterministic_stages", [])) != 18:
        raise SimulationError("exact 18 deterministic stages required")
    if _regular(PREDECESSOR_ROUTES, "iteration_008 routes") != _regular(ROOT / "routes.json", "iteration_010 routes"):
        raise SimulationError("routes storage changed")
    if _regular(PREDECESSOR_SCHEDULE, "iteration_008 schedule") != _regular(SCHEDULE, "iteration_010 schedule"):
        raise SimulationError("schedule storage changed")

    blocker = {row["cell"]: row for row in new_cells}.get("S10B_TENSION_B-T02")
    frozen_storage = b'{"preserve_boundary":false}\n'
    if not isinstance(blocker, dict) or (
        _semantic_canon(blocker.get("expected_output")) + b"\n" != frozen_storage
        or blocker.get("expected_output_storage_sha256") != _sha(frozen_storage)
        or blocker.get("expected_output_storage_bytes") != len(frozen_storage)
    ):
        raise SimulationError("frozen B-T02 false oracle changed")

    historical_catalog_projection = _assert_historical_catalog_projection(
        predecessor_catalog, current_catalog,
    )
    applied_catalog_delta = _validate_applied_catalog_delta(current_faults)
    predecessor_variant_count = sum(
        len(row.get("variants", []))
        for row in predecessor_faults.get("scenarios", [])
        if isinstance(row, dict)
    )
    current_historical_count = sum(
        len(row.get("variants", []))
        for row in current_faults.get("scenarios", [])[:21]
        if isinstance(row, dict)
    )
    if predecessor_variant_count != 49 or current_historical_count != 49:
        raise SimulationError("historical 49-variant cardinality drift")
    predecessor_global_ids = [
        row.get("case_id") for row in predecessor_faults.get("global_fault_cases", [])
        if isinstance(row, dict)
    ]
    current_global_ids = [
        row.get("case_id") for row in current_faults.get("global_fault_cases", [])
        if isinstance(row, dict)
    ]
    if predecessor_global_ids != current_global_ids or len(current_global_ids) != 10:
        raise SimulationError("historical global case identity/count drift")
    if (
        current_catalog.get("family_count") != 22
        or current_catalog.get("normalized_variant_count") != 56
        or current_catalog.get("historical_variant_count_preserved") != 49
        or current_catalog.get("new_variant_count") != 7
        or len(current_catalog.get("families", [])) != 22
        or len(current_faults.get("scenarios", [])) != 22
        or len([v for s in current_faults.get("scenarios", []) for v in s.get("variants", [])]) != 56
        or len(current_faults.get("global_fault_cases", [])) != 10
    ):
        raise SimulationError("iteration_010 exact 22/56/10 declarations drift")
    regression_verification = regression_receipt.get("verification", {})
    regression_inventory = regression_receipt.get("inventory", {})
    regression_binding = regression_receipt.get("regression_catalog", {})
    operational_coverage = regression_receipt.get("coverage", {}).get(
        "operational_boundary_predicate", {}
    )
    if (
        regression_receipt.get("schema_id") != "pw-r9-regression-inventory-receipt-v3"
        or regression_receipt.get("status") != "PASS_ALL_REFERENCED_EVIDENCE_EXISTS_AND_MATCHES"
        or regression_receipt.get("calls") != {"network": 0, "provider": 0, "subject": 0}
        or regression_receipt.get("qualification_credit") != 0
        or regression_binding.get("sha256") != REGRESSION_OWNER_IDENTITIES[CATALOG]["sha256"]
        or regression_binding.get("bytes") != REGRESSION_OWNER_IDENTITIES[CATALOG]["bytes"]
        or regression_binding.get("path")
            != "tests/agent_packet_restrictions/successor_20260813/"
               "r9_control_plane_stabilization_v1/iteration_010/regression_catalog.json"
        or regression_inventory.get("family_count") != 22
        or regression_inventory.get("normalized_variant_count") != 56
        or regression_inventory.get("historical_variant_count_preserved") != 49
        or regression_inventory.get("new_variant_count") != 7
        or any(regression_verification.get(key) is not True for key in (
            "iteration_008_family_historical_fields_preserved",
            "current_transport_proof_fields_are_only_family_changes",
            "iteration_008_twenty_one_family_ids_and_historical_fields_preserved",
            "original_r9_reg_007_historical_fields_preserved",
            "catalog_current_transport_family_proofs_present",
            "iteration_008_forty_nine_variants_preserved",
            "iteration_008_ten_global_cases_preserved",
            "operational_boundary_predicate_family_present",
            "operational_boundary_predicate_seven_variants_present",
            "predecessor_v4_contract_incomplete_preserved",
            "successor_requires_iteration_010_deterministic_projection_execution",
            "iteration_009_self_attestation_failure_required",
            "successor_proof_authority_is_suite_receipt_not_inventory_receipt",
        ))
        or operational_coverage.get("predecessor_result")
            != "FAIL_SELF_ATTESTATION_ADMITTED_ADVERSE_PROJECTION"
        or operational_coverage.get("predecessor_evaluator_normalized_family")
            != "STATIC_COUNTERFACTUAL_SELF_ATTESTATION"
        or operational_coverage.get("successor_proof_status")
            != "REQUIRES_ITERATION_010_DETERMINISTIC_PROJECTION_EXECUTION"
        or len(operational_coverage.get("typed_simulator_mapping", [])) != 7
        or any(
            row.get("mapping_kind") != "DETERMINISTIC_PROJECTION_EXECUTION"
            for row in operational_coverage.get("typed_simulator_mapping", [])
        )
    ):
        raise SimulationError("iteration_010 regression inventory receipt binding drift")

    semantic_rows = receipt.get("semantic_regression_receipts")
    projection_contract = receipt.get("counterfactual_projection_contract")
    if (
        receipt.get("schema_id") != "pw-r9-semantic-inventory-receipt-v3"
        or receipt.get("status") != "DATA_ONLY_CONCRETE_PROJECTIONS_NO_RESULT_AUTHORITY"
        or not isinstance(semantic_rows, list) or len(semantic_rows) != 13
        or not isinstance(projection_contract, dict)
    ):
        raise SimulationError("iteration_010 concrete projection corpus contract absent")
    if any(row.get("calls") != SEMANTIC_CALLS_ZERO for row in semantic_rows[:6]):
        raise SimulationError("historical semantic regression call accounting is nonzero")
    by_id = {row.get("id"): row for row in semantic_rows}
    if len(by_id) != 13:
        raise SimulationError("semantic regression receipt IDs duplicate")
    projection_specs = [
        ("R9-SEM-REG-007-CONCRETE-PROJECTION", "renamed_reordered_resolved", False),
        ("R9-SEM-REG-008-CONCRETE-PROJECTION", "stale_vs_current", False),
        ("R9-SEM-REG-009-CONCRETE-PROJECTION", "lineage_only_metadata", False),
        ("R9-SEM-REG-010-CONCRETE-PROJECTION", "genuinely_unresolved_conflict", True),
        ("R9-SEM-REG-011-CONCRETE-PROJECTION", "deliberately_separate_authorities", True),
        ("R9-SEM-REG-012-CONCRETE-PROJECTION", "missing_predecessor_resolution", True),
    ]
    allowed_top = {
        "source_supported_candidate", "supported_claims", "apparent_discrepancies",
        "source_bindings", "predecessor_outputs",
    }
    forbidden_keys = PROJECTION_FORBIDDEN_RECURSIVE_KEYS
    evaluator_contract = projection_contract.get("independent_evaluator_contract", {})
    if (
        projection_contract.get("schema_id") != "pw-r9-concrete-answer-free-projection-corpus-v1"
        or projection_contract.get("semantic_case_count") != 6
        or projection_contract.get("leakage_case_count") != 1
        or set(projection_contract.get("provider_projection_allowed_top_level_keys", [])) != allowed_top
        or set(projection_contract.get("provider_projection_forbidden_recursive_keys", [])) != forbidden_keys
        or set(projection_contract.get("code_owned_discrepancy_kinds", []))
            != PROJECTION_DISCREPANCY_KINDS
        or projection_contract.get("closed_claim_value_types")
            != ["string", "integer_not_boolean"]
        or evaluator_contract.get("owner") != "simulator code, not this receipt"
        or evaluator_contract.get("receipt_assertion_authority") != "DENIED"
    ):
        raise SimulationError("closed projection evaluator contract drift")

    case_results: list[dict[str, Any]] = []
    concrete_projections: list[dict[str, Any]] = []
    projections_by_receipt: dict[str, dict[str, Any]] = {}
    for receipt_id, fixture, required_expected in projection_specs:
        row = by_id.get(receipt_id)
        case = row.get("case") if isinstance(row, dict) else None
        if (
            not isinstance(case, dict)
            or row.get("evaluation_authority") != "INDEPENDENT_CODE_EVALUATOR_ONLY"
            or set(case) != {"canonical_projection", "expected", "fixture_id", "provider_projection"}
        ):
            raise SimulationError(f"concrete projection receipt shape drift: {receipt_id}")
        projection = case["provider_projection"]
        if not isinstance(projection, dict) or set(projection) != allowed_top:
            raise SimulationError(f"closed provider projection top-level drift: {receipt_id}")
        canonical = _canon(projection)
        computed_identity = _identity(canonical)
        declared_identity = case.get("canonical_projection")
        _validate_canonical_projection_identity(
            declared_identity, computed_identity, f"canonical projection identity: {receipt_id}",
        )
        if _recursive_keys(projection) & forbidden_keys:
            raise SimulationError(f"forbidden recursive projection key: {receipt_id}")

        # The evaluator receives only the provider projection.  Expected and
        # fixture metadata are read strictly after the observed bool exists.
        observed = _evaluate_provider_projection(projection)
        expected = case.get("expected")
        fixture_id = case.get("fixture_id")
        if expected is not required_expected or not isinstance(fixture_id, str):
            raise SimulationError(f"counterfactual expected/fixture contract drift: {receipt_id}")
        if observed is not expected:
            raise SimulationError(f"independent projection evaluation mismatch: {receipt_id}")
        projections_by_receipt[receipt_id] = projection
        concrete_projections.append({
            "receipt_id": receipt_id, "provider_fixture_id": fixture_id,
            "canonical_projection": computed_identity,
        })
        case_results.append({
            "fixture_id": fixture, "projection_receipt_id": receipt_id,
            "expected": expected, "observed": observed, "result": "PASS",
            "canonical_projection": computed_identity,
            "strategy": "deterministic_projection_execution",
        })

    leakage_row = by_id.get("R9-SEM-REG-013-LEAKAGE-SCAN-INPUT")
    leakage_case = leakage_row.get("leakage_case") if isinstance(leakage_row, dict) else None
    if (
        not isinstance(leakage_case, dict)
        or leakage_row.get("evaluation_authority") != "INDEPENDENT_CODE_EVALUATOR_ONLY"
        or leakage_case.get("fixture_id") != "projection_leakage_scan_p9"
        or set(leakage_case.get("forbidden_keys", [])) != forbidden_keys
    ):
        raise SimulationError("leakage scan input contract drift")
    forbidden_tokens = leakage_case.get("forbidden_tokens")
    projection_refs = leakage_case.get("projection_refs")
    if (
        not isinstance(forbidden_tokens, list)
        or not all(isinstance(item, str) for item in forbidden_tokens)
        or len(forbidden_tokens) != len(PROJECTION_FORBIDDEN_TOKENS)
        or set(forbidden_tokens) != PROJECTION_FORBIDDEN_TOKENS
    ):
        raise SimulationError("leakage forbidden token set drift")
    if not isinstance(projection_refs, list) or len(projection_refs) != 6:
        raise SimulationError("leakage projection reference count drift")
    computed_refs: list[dict[str, Any]] = []
    leakage_hits: list[dict[str, Any]] = []
    for (receipt_id, _, _), declared_ref in zip(projection_specs, projection_refs, strict=True):
        projection = projections_by_receipt[receipt_id]
        canonical = _canon(projection)
        identity = _identity(canonical)
        case = by_id[receipt_id]["case"]
        expected_ref = {"fixture_id": case["fixture_id"], **identity}
        if declared_ref != expected_ref:
            raise SimulationError(f"leakage projection identity reference drift: {receipt_id}")
        recursive_hits = sorted(_recursive_keys(projection) & forbidden_keys)
        token_hits = _projection_leakage_hits(canonical)
        if recursive_hits or token_hits:
            leakage_hits.append({
                "receipt_id": receipt_id, "forbidden_keys": recursive_hits,
                "forbidden_tokens": token_hits,
            })
        computed_refs.append(expected_ref)
    if leakage_hits:
        raise SimulationError(f"answer-bearing projection leakage: {leakage_hits}")
    case_results.append({
        "fixture_id": "no_answer_leakage",
        "projection_receipt_id": "R9-SEM-REG-013-LEAKAGE-SCAN-INPUT",
        "expected": "PASS", "observed": "PASS", "result": "PASS",
        "strategy": "deterministic_projection_execution",
        "computed_projection_refs": computed_refs,
        "recursive_forbidden_key_hits": 0, "forbidden_token_hits": 0,
    })

    base_case = by_id[projection_specs[0][0]]["case"]
    base_projection = projections_by_receipt[projection_specs[0][0]]
    base_observed = _evaluate_provider_projection(base_projection)
    expected_flip_wrapper = {
        "expected": not base_case["expected"],
        "provider_projection": json.loads(_canon(base_projection)),
    }
    expected_flip_observed = _evaluate_provider_projection(expected_flip_wrapper["provider_projection"])

    authority_flip = json.loads(_canon(base_projection))
    for binding in authority_flip["source_bindings"]:
        binding["authority"] = "metadata_flip_must_not_decide"
    authority_flip_observed = _evaluate_provider_projection(authority_flip)

    missing_resolution = json.loads(_canon(base_projection))
    missing_resolution["predecessor_outputs"]["decisions"] = []
    missing_resolution_observed = _evaluate_provider_projection(missing_resolution)

    mismatched_target = json.loads(_canon(base_projection))
    mismatched_target["predecessor_outputs"]["decisions"][0]["discrepancy_id"] = "discrepancy_unknown_target"
    unknown_claim = json.loads(_canon(base_projection))
    unknown_claim["predecessor_outputs"]["decisions"][0]["selected_claim_id"] = "claim_unknown"
    malformed_decision = json.loads(_canon(base_projection))
    del malformed_decision["predecessor_outputs"]["decisions"][0]["superseded_claim_ids"]
    conflicting_decisions = json.loads(_canon(base_projection))
    discrepancy = conflicting_decisions["apparent_discrepancies"][0]
    conflicting_decisions["predecessor_outputs"]["decisions"].append({
        "decision": "preserve_unresolved_conflict", "decision_id": "decision_conflict_probe",
        "discrepancy_id": discrepancy["discrepancy_id"], "claim_ids": discrepancy["claim_ids"],
    })
    duplicate_decision_id = json.loads(_canon(conflicting_decisions))
    duplicate_decision_id["predecessor_outputs"]["decisions"][1]["decision_id"] = (
        duplicate_decision_id["predecessor_outputs"]["decisions"][0]["decision_id"]
    )

    incomplete_claim_coverage = json.loads(_canon(base_projection))
    incomplete_claim_coverage["source_bindings"].append({
        "authority": "lineage_only_state", "source_record_id": "source_x5",
    })
    incomplete_claim_coverage["supported_claims"].append({
        "claim_id": "claim_x5", "predicate": "declared_profile",
        "source_record_ids": ["source_x5"], "value": "profile_vermilion",
    })
    incomplete_claim_coverage["source_supported_candidate"]["claim_ids"].append("claim_x5")

    equal_value_conflict = json.loads(_canon(base_projection))
    equal_value_conflict["supported_claims"][0]["value"] = (
        equal_value_conflict["supported_claims"][1]["value"]
    )

    duplicate_claim_pair = json.loads(_canon(base_projection))
    duplicate_pair_discrepancy = json.loads(_canon(
        duplicate_claim_pair["apparent_discrepancies"][0]
    ))
    duplicate_pair_discrepancy["discrepancy_id"] = "discrepancy_x9"
    duplicate_claim_pair["apparent_discrepancies"].append(duplicate_pair_discrepancy)
    duplicate_claim_pair["source_supported_candidate"]["discrepancy_ids"].append("discrepancy_x9")
    duplicate_pair_decision = json.loads(_canon(
        duplicate_claim_pair["predecessor_outputs"]["decisions"][0]
    ))
    duplicate_pair_decision["decision_id"] = "decision_x9"
    duplicate_pair_decision["discrepancy_id"] = "discrepancy_x9"
    duplicate_claim_pair["predecessor_outputs"]["decisions"].append(duplicate_pair_decision)

    cyclic_supersession = json.loads(_canon(base_projection))
    cyclic_supersession["source_bindings"].append({
        "authority": "lineage_only_state", "source_record_id": "source_x5",
    })
    cyclic_supersession["supported_claims"].append({
        "claim_id": "claim_x5", "predicate": "declared_profile",
        "source_record_ids": ["source_x5"], "value": "profile_vermilion",
    })
    cyclic_supersession["source_supported_candidate"]["claim_ids"].append("claim_x5")
    cyclic_supersession["apparent_discrepancies"].extend([
        {
            "claim_ids": ["claim_c2", "claim_x5"],
            "discrepancy_id": "discrepancy_x9", "kind": "VALUE_CONFLICT",
        },
        {
            "claim_ids": ["claim_x5", "claim_m8"],
            "discrepancy_id": "discrepancy_y9", "kind": "VALUE_CONFLICT",
        },
    ])
    cyclic_supersession["source_supported_candidate"]["discrepancy_ids"].extend([
        "discrepancy_x9", "discrepancy_y9",
    ])
    cyclic_supersession["predecessor_outputs"]["decisions"].extend([
        {
            "decision": "select_current_and_supersede_other", "decision_id": "decision_x9",
            "discrepancy_id": "discrepancy_x9", "selected_claim_id": "claim_x5",
            "superseded_claim_ids": ["claim_c2"],
        },
        {
            "decision": "select_current_and_supersede_other", "decision_id": "decision_y9",
            "discrepancy_id": "discrepancy_y9", "selected_claim_id": "claim_m8",
            "superseded_claim_ids": ["claim_x5"],
        },
    ])

    answer_alias_leakage = json.loads(_canon(base_projection))
    answer_alias_leakage["source_bindings"][0]["authority"] = "preserve_boundary_false"

    distinct_authority_kind_mismatch = json.loads(_canon(base_projection))
    base_discrepancy = distinct_authority_kind_mismatch["apparent_discrepancies"][0]
    distinct_authority_kind_mismatch["predecessor_outputs"]["decisions"][0] = {
        "decision": "preserve_distinct_authorities", "decision_id": "decision_h3",
        "discrepancy_id": base_discrepancy["discrepancy_id"],
        "claim_ids": base_discrepancy["claim_ids"],
    }

    boolean_claim_value = json.loads(_canon(base_projection))
    boolean_claim_value["supported_claims"][0]["value"] = False
    unknown_discrepancy_kind = json.loads(_canon(base_projection))
    unknown_discrepancy_kind["apparent_discrepancies"][0]["kind"] = "UNKNOWN_KIND"

    malformed_canonical_identity = json.loads(_canon(base_case["canonical_projection"]))
    malformed_canonical_identity["bytes"] = float(malformed_canonical_identity["bytes"])
    try:
        _validate_canonical_projection_identity(
            malformed_canonical_identity, _identity(_canon(base_projection)),
            "negative mutation canonical projection identity",
        )
    except SimulationError as exc:
        malformed_canonical_identity_result = {
            "result": "REJECTED_FAIL_CLOSED", "error": str(exc),
        }
    else:
        raise SimulationError("malformed canonical identity mutation was admitted")

    rejection_rows = [
        {"case": "mismatched_discrepancy_target_rejected", **_projection_rejection(mismatched_target)},
        {"case": "unknown_claim_id_rejected", **_projection_rejection(unknown_claim)},
        {"case": "malformed_decision_rejected", **_projection_rejection(malformed_decision)},
        {"case": "conflicting_decisions_rejected", **_projection_rejection(conflicting_decisions)},
        {"case": "duplicate_decision_id_rejected", **_projection_rejection(duplicate_decision_id)},
        {"case": "A04_incomplete_claim_coverage_rejected", **_projection_rejection(incomplete_claim_coverage)},
        {"case": "A05_equal_value_conflict_rejected", **_projection_rejection(equal_value_conflict)},
        {"case": "A06_duplicate_claim_pair_rejected", **_projection_rejection(duplicate_claim_pair)},
        {"case": "A07_cyclic_supersession_rejected", **_projection_rejection(cyclic_supersession)},
        {"case": "A09_answer_alias_leakage_rejected", **_projection_rejection(answer_alias_leakage)},
        {"case": "A11_distinct_authority_kind_mismatch_rejected", **_projection_rejection(distinct_authority_kind_mismatch)},
        {"case": "A13_malformed_canonical_identity_rejected", **malformed_canonical_identity_result},
        {"case": "boolean_claim_value_rejected", **_projection_rejection(boolean_claim_value)},
        {"case": "unknown_discrepancy_kind_rejected", **_projection_rejection(unknown_discrepancy_kind)},
    ]
    negative_mutation_matrix = [
        {
            "case": "expected_flip_cannot_change_observed", "result": "PASS",
            "before": base_observed, "after": expected_flip_observed,
            "flipped_expected": expected_flip_wrapper["expected"],
        },
        {
            "case": "authority_metadata_flip_cannot_change_observed", "result": "PASS",
            "before": base_observed, "after": authority_flip_observed,
        },
        {
            "case": "missing_resolution_returns_true", "result": "PASS",
            "observed": missing_resolution_observed,
        },
        *rejection_rows,
    ]
    if (
        [row.get("case") for row in negative_mutation_matrix]
            != list(PROJECTION_NEGATIVE_MUTATION_CASES)
        or base_observed is not False or expected_flip_observed is not base_observed
        or authority_flip_observed is not base_observed or missing_resolution_observed is not True
        or any(row.get("result") != "REJECTED_FAIL_CLOSED" for row in rejection_rows)
    ):
        raise SimulationError("projection evaluator negative mutation matrix failed")

    adverse_projection_receipt_id = projection_specs[5][0]
    predecessor_negative_control = _predecessor_self_attestation_probe(
        projections_by_receipt[adverse_projection_receipt_id],
        adverse_projection_receipt_id,
    )
    if (
        predecessor_negative_control.get("classification")
            != "FAIL_SELF_ATTESTATION_ADMITTED_ADVERSE_PROJECTION"
        or predecessor_negative_control.get("falsifier_family")
            != "STATIC_COUNTERFACTUAL_SELF_ATTESTATION"
        or predecessor_negative_control.get("adverse_projection", {}).get("independent_observed")
            is not True
        or predecessor_negative_control.get("actual_predecessor_gate", {}).get("declared_expected")
            is not False
        or predecessor_negative_control.get("actual_predecessor_gate", {}).get("status") != "PASS"
    ):
        raise SimulationError("iteration_009 self-attestation negative control failed")

    scenario = current_faults.get("scenarios", [])[-1]
    fault_cases = scenario.get("variants", []) if isinstance(scenario, dict) else []
    catalog_family = current_catalog.get("families", [])[-1]
    catalog_cases = ([catalog_family] + catalog_family.get("additional_variants", [])) if isinstance(catalog_family, dict) else []
    expected_variant_rows = [
        {"variant_id": row["variant_id"], "fixture_id": row["simulator_mapping"]["fixture_id"],
         "expected": row["simulator_mapping"]["expected"],
         "mapping_kind": row["simulator_mapping"].get("mapping_kind"),
         "successor_proof_status": row.get("successor_proof_status")}
        for row in catalog_cases
    ]
    observed_variant_rows = [
        {"variant_id": row.get("variant_id"), "fixture_id": row.get("fixture_id"),
         "expected": row.get("expect", {}).get("expected"),
         "strategy": row.get("strategy"), "evaluator": row.get("evaluator"),
         "predecessor_result": row.get("expect", {}).get("predecessor_result"),
         "candidate_v4_contract_reproducer_result":
             row.get("expect", {}).get("candidate_v4_contract_reproducer_result")}
        for row in fault_cases
    ]
    if (
        not isinstance(scenario, dict) or scenario.get("regression_id") != "R9-REG-022"
        or scenario.get("scenario_id") != "operational-boundary-predicate"
        or [
            {key: row[key] for key in ("variant_id", "fixture_id", "expected")}
            for row in expected_variant_rows
        ] != [
            {key: row[key] for key in ("variant_id", "fixture_id", "expected")}
            for row in observed_variant_rows
        ]
        or any(
            row["mapping_kind"] != "DETERMINISTIC_PROJECTION_EXECUTION"
            or row["successor_proof_status"]
                != "REQUIRES_ITERATION_010_DETERMINISTIC_PROJECTION_EXECUTION"
            for row in expected_variant_rows
        )
        or any(
            row["strategy"] != "deterministic_projection_execution"
            or row["evaluator"] != "_evaluate_provider_projection"
            or row["predecessor_result"]
                != "FAIL_SELF_ATTESTATION_ADMITTED_ADVERSE_PROJECTION"
            or row["candidate_v4_contract_reproducer_result"]
                != "FAIL_CONTRACT_INCOMPLETE"
            for row in observed_variant_rows
        )
    ):
        raise SimulationError("R9-REG-022 catalog/fault mapping drift")

    return {
        "schema_id": "pw-r9-semantic-operational-rule-gate-v2", "status": "PASS",
        "calls": dict(SEMANTIC_CALLS_ZERO), "qualification_credit": 0,
        "predecessor_result": predecessor_negative_control["classification"],
        "successor_result": "PASS",
        "operational_rule": {"sha256": OPERATIONAL_RULE_SHA256, "bytes": 487},
        "unchanged_question": _identity(TENSION_QUESTION.encode("utf-8")),
        "changed_tension_prompts": changed, "unchanged_prompts": 93,
        "unchanged_expected_outputs": 97, "unchanged_dependency_gates": 97,
        "unchanged_source_bindings_and_predecessor_outputs": 97,
        "unchanged_deterministic_stage_artifacts": 18,
        "routes_and_schedule_unchanged": True,
        "frozen_b_t02_oracle": {"preserve_boundary": False, **_identity(frozen_storage)},
        "counterfactuals": case_results,
        "evaluator": {
            "function": "_evaluate_provider_projection", "input": "provider_projection_only",
            "return": "bool", "closed_schema": True, "receipt_assertion_authority": "DENIED",
            "concrete_projection_count": 6, "projection_identities": concrete_projections,
            "negative_mutation_matrix": negative_mutation_matrix,
        },
        "predecessor_negative_control": predecessor_negative_control,
        "provider_visible_answer_bearing_fields": 0,
        "provider_visible_answer_bearing_token_counts": leakage,
        "regression_inventory": {
            "families": 22, "variants": 56, "globals": 10,
            "historical_families_preserved": 21, "historical_variants_preserved": 49,
            "historical_catalog_projection": historical_catalog_projection,
            "applied_catalog_delta": applied_catalog_delta,
        },
        "semantic_owner_files": [
            {"path": path.name, **identity} for path, identity in SEMANTIC_OWNER_IDENTITIES.items()
        ],
        "regression_owner_files": [
            {"path": path.name, **identity} for path, identity in REGRESSION_OWNER_IDENTITIES.items()
        ],
    }


def _static_check() -> dict[str, Any]:
    _, contract = _json(CONTRACT, "simulator contract")
    _, faults = _json(FAULTS, "fault scenarios")
    _, catalog = _json(CATALOG, "regression catalog")
    _, semantic = _json(SEMANTIC, "semantic manifest")
    _, schedule = _json(SCHEDULE, "schedule")
    _, architecture = _json(ROOT / "architecture_contract.json", "architecture contract")
    if contract.get("schema_id") != "pw-r9-simulator-contract-v9":
        raise SimulationError("simulator contract v9 required")
    if faults.get("schema_id") != "pw-r9-fault-scenarios-v8":
        raise SimulationError("fault scenarios v8 required")
    catalog_rows = catalog.get("families")
    scenario_rows = faults.get("scenarios")
    globals_ = faults.get("global_fault_cases")
    if not isinstance(catalog_rows, list) or not isinstance(scenario_rows, list):
        raise SimulationError("catalog/fault family rows absent")
    catalog_map = {
        row["regression_id"]: row["stabilized_simulator_scenario"]["scenario_id"]
        for row in catalog_rows
    }
    scenario_map = {
        row["regression_id"]: row["scenario_id"] for row in scenario_rows
    }
    if (
        len(catalog_rows) != 22
        or len(scenario_rows) != 22
        or len(scenario_map) != 22
        or scenario_map != catalog_map
    ):
        raise SimulationError("normalized 22-family mapping drift")
    variants = [
        variant for scenario in scenario_rows
        for variant in scenario.get("variants", [])
    ]
    if len(variants) != 56 or not isinstance(globals_, list) or len(globals_) != 10:
        raise SimulationError("exact 22/56/10 regression inventory required")
    applied_catalog_delta = _validate_applied_catalog_delta(faults)
    if contract.get("regression_coverage", {}).get("catalog_delta_status") \
            != "APPLIED_AND_VERIFIED_BY_AUTHORIZED_CATALOG_SOLE_WRITER":
        raise SimulationError("simulator contract applied catalog status drift")
    declared_scenarios: set[str] = set()
    for row in variants + globals_:
        single = row.get("backend_scenario")
        if isinstance(single, str):
            declared_scenarios.add(single)
        matrix = row.get("backend_scenarios", [])
        if not isinstance(matrix, list) or not all(isinstance(item, str) for item in matrix):
            raise SimulationError("backend scenario matrix malformed")
        declared_scenarios.update(matrix)
    if declared_scenarios != set(synthetic_backend.SCENARIOS):
        raise SimulationError(
            f"synthetic backend scenario coverage drift: "
            f"{sorted(set(synthetic_backend.SCENARIOS) - declared_scenarios)}"
        )
    strategies = {
        "clean_reference", "protocol_subject_success", "protocol_subject_fail",
        "protocol_controller_invalid", "protocol_safe_drain", "protocol_hard_loss",
        "causal_prefix_projection", "protocol_archive_and_negative_matrix",
        "same_root_after_hard_loss", "evidence_mutation", "source_binding_projection",
        "historical_head_reopen_pair", "deterministic_projection_execution",
        "static_assertion", "coverage_meta",
    }
    observed_strategies = {row.get("strategy") for row in variants + globals_}
    if not observed_strategies.issubset(strategies):
        raise SimulationError(
            f"unsupported declared strategies: {sorted(observed_strategies - strategies)}"
        )
    labels = {
        label for row in variants + globals_
        for label in row.get("fault_labels", []) if isinstance(label, str)
    }
    required = set(contract.get("required_faults", []))
    if not required.issubset(labels):
        raise SimulationError(f"required fault labels missing: {sorted(required - labels)}")
    if _controller_commands() != CONTROLLER_COMMANDS:
        raise SimulationError("controller public command set drift")
    runtime_repair = _runtime_repair_static_contract()
    imports = _candidate_imports()
    if imports:
        raise SimulationError(f"forbidden candidate runtime imports: {imports}")

    subject_transport = architecture.get("subject_transport")
    if not (
        isinstance(subject_transport, dict)
        and subject_transport.get("schema_id")
            == "pw-r9-collaboration-subagent-transport-contract-v1"
        and subject_transport.get("public_controller_commands")
            == ["simulate", "run-canary", "run-matrix", "reopen"]
        and subject_transport.get("dispatcher", {}).get("tool")
            == "collaboration.spawn_agent"
        and subject_transport.get("dispatcher", {}).get("retry_count") == 0
        and subject_transport.get("dispatcher", {}).get("replacement_count") == 0
        and subject_transport.get("root_events", {}).get("stdin_protocol")
            == "one canonical JSON object per line"
    ):
        raise SimulationError("architecture collaboration transport binding drift")

    cells = semantic.get("cells")
    stages = semantic.get("deterministic_stages")
    stage_order = semantic.get("stage_order")
    entries = schedule.get("entries")
    semantic_files = semantic.get("files")
    if (
        semantic.get("schema_id") != "pw-r9-semantic-manifest-v2"
        or not isinstance(cells, list) or len(cells) != 97
        or not isinstance(stages, list) or len(stages) != 18
        or not isinstance(stage_order, list) or len(stage_order) != 18
        or not isinstance(entries, list) or len(entries) != 291
        or not isinstance(semantic_files, list) or len(semantic_files) != 38
    ):
        raise SimulationError("semantic/schedule cardinality drift")
    for cell in cells:
        gate = cell.get("dependency_gate") if isinstance(cell, dict) else None
        render = cell.get("render_utf8") if isinstance(cell, dict) else None
        expected = cell.get("expected_output") if isinstance(cell, dict) else None
        if (
            not isinstance(gate, dict)
            or set(gate) != {"rule", "required_pass_cells", "required_stage_artifacts"}
            or not isinstance(render, str)
            or _identity(render.encode("utf-8")) != {
                "sha256": cell.get("render_utf8_sha256"),
                "bytes": cell.get("render_utf8_bytes"),
            }
            or _identity(_semantic_canon(expected) + b"\n") != {
                "sha256": cell.get("expected_output_storage_sha256"),
                "bytes": cell.get("expected_output_storage_bytes"),
            }
        ):
            raise SimulationError(f"semantic cell render/oracle/gate drift: {cell.get('cell')}")
    for stage in stages:
        payload = _semantic_canon(stage.get("expected_artifact"))
        storage = payload + b"\n"
        if (
            stage.get("stage") not in stage_order
            or _identity(payload) != {
                "sha256": stage.get("expected_artifact_sha256"),
                "bytes": stage.get("expected_artifact_bytes"),
            }
            or _identity(storage) != {
                "sha256": stage.get("expected_artifact_storage_sha256"),
                "bytes": stage.get("expected_artifact_storage_bytes"),
            }
        ):
            raise SimulationError(f"stage artifact identity drift: {stage.get('stage')}")

    backend_self_test = _backend_self_test()
    controller_check_only = _controller_check_only()
    semantic_repair = _semantic_repair_gate()
    snapshot = _source_snapshot()
    return {
        "schema_id": "pw-r9-simulator-check-v3", "status": "PASS",
        "qualification_credit": 0,
        "calls": {
            "collaboration": 0, "model": 0, "network": 0, "provider": 0, "subject": 0,
            "controller_check_only": 1, "backend_self_test": 1,
        },
        "regression_families": 22, "variants": 56, "global_cases": 10,
        "variant_replacements": faults["catalog_delta_required"]["replacements"],
        "catalog_delta_required": faults["catalog_delta_required"],
        "applied_catalog_delta_validation": applied_catalog_delta,
        "backend_scenarios": sorted(declared_scenarios),
        "fault_labels": sorted(labels),
        "controller_commands": _controller_commands(),
        "runtime_repair_static_contract": runtime_repair,
        "candidate_v12_v21_runtime_imports": imports,
        "semantic_counts": {
            "cells": 97, "schedule_rows": 291, "stages": 18,
            "route_local_artifacts": 54,
        },
        "semantic_repair": semantic_repair,
        "controller_check_only": controller_check_only,
        "backend_self_test": backend_self_test,
        "source_bundle": snapshot,
        "historical_predecessors": _history(),
        "persistence_predecessor": _persistence_predecessor(),
        "candidate_v2_failure_archive": _candidate_v2_failure_archive(),
    }


def _parse_stdout(stdout: bytes) -> dict[str, Any] | None:
    lines = [line for line in stdout.splitlines() if line]
    if not lines:
        return None
    try:
        value = json.loads(lines[-1].decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None
    return value if isinstance(value, dict) else None


def _controller_env(evidence_parent: Path) -> dict[str, str]:
    _directory(evidence_parent, "controller evidence parent")
    return {
        **os.environ,
        "PYTHONDONTWRITEBYTECODE": "1",
        "R9_SIMULATOR_ZERO_PROVIDER": "1",
        "PW_R9_SIMULATOR_EVIDENCE_ROOT": str(evidence_parent.resolve()),
    }


def _invocation_record(args: list[str], rc: int, stdout: bytes, stderr: bytes,
                       elapsed_ns: int) -> dict[str, Any]:
    return {
        "args": args, "rc": rc, "stdout": _identity(stdout),
        "stderr": _identity(stderr), "stdout_utf8": stdout.decode("utf-8", "replace"),
        "stderr_utf8": stderr.decode("utf-8", "replace"),
        "result": _parse_stdout(stdout), "elapsed_monotonic_ns": elapsed_ns,
    }


def _strict_protocol_object(line: bytes, label: str) -> dict[str, Any]:
    if not line or b"\r" in line:
        raise SimulationError(f"{label}: nonempty LF-delimited line required")
    try:
        value = json.loads(
            line.decode("utf-8"), object_pairs_hook=_pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(
                SimulationError(f"nonfinite JSON token: {token}")
            ),
        )
    except (UnicodeDecodeError, json.JSONDecodeError, SimulationError) as exc:
        raise SimulationError(f"{label}: malformed UTF-8 JSON: {exc}") from exc
    if not isinstance(value, dict) or _canon(value) != line:
        raise SimulationError(f"{label}: canonical minified JSON object required")
    return value


def _protocol_line_record(
    sequence: int, direction: str, line: bytes, value: dict[str, Any],
) -> dict[str, Any]:
    return {
        "sequence": sequence, "direction": direction,
        "schema_id": value.get("schema_id"),
        "invocation_id": value.get("invocation_id"),
        "canonical_task_path": (
            value.get("expected_canonical_task_path")
            or value.get("returned_canonical_task_path")
        ),
        **_identity(line),
    }


def _write_protocol_line(fd: int, value: dict[str, Any]) -> bytes:
    line = _canon(value)
    storage = line + b"\n"
    view = memoryview(storage)
    while view:
        count = os.write(fd, view)
        if count <= 0:
            raise SimulationError("short controller stdin event write")
        view = view[count:]
    return line


def _expected_final_utf8(cell_id: str) -> str:
    _, semantic = _json(SEMANTIC, "semantic manifest")
    matches = [
        row for row in semantic.get("cells", [])
        if isinstance(row, dict) and row.get("cell") == cell_id
    ]
    if len(matches) != 1:
        raise SimulationError(f"request cell missing or duplicated: {cell_id}")
    return _semantic_canon(matches[0]["expected_output"]).decode("utf-8")


def _drive_controller(
    component_root: Path,
    evidence_parent: Path,
    args: list[str],
    *,
    backend_scenario: str = "clean",
    mode: str = "normal",
    timeout: float = 600.0,
) -> dict[str, Any]:
    """Drive one controller process over its canonical stdout/stdin protocol."""
    if not args or args[0] not in {"simulate", "reopen"}:
        raise SimulationError("simulator may invoke only public simulate or reopen")
    if backend_scenario not in synthetic_backend.SCENARIOS:
        raise SimulationError(f"unknown backend scenario: {backend_scenario}")
    if mode not in {"normal", "safe_drain_after_receipt", "hard_loss_after_request"}:
        raise SimulationError(f"unknown interactive driver mode: {mode}")
    _directory(component_root, "controller component root")
    command = [sys.executable, "-B", "controller.py", *args]
    started = time.monotonic_ns()
    process = subprocess.Popen(
        command,
        cwd=component_root,
        env=_controller_env(evidence_parent),
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        start_new_session=True,
        shell=False,
    )
    if process.stdin is None or process.stdout is None or process.stderr is None:
        raise SimulationError("controller Popen pipes unavailable")
    selector = selectors.DefaultSelector()
    stdout_fd = process.stdout.fileno()
    stderr_fd = process.stderr.fileno()
    os.set_blocking(stdout_fd, False)
    os.set_blocking(stderr_fd, False)
    selector.register(stdout_fd, selectors.EVENT_READ, "stdout")
    selector.register(stderr_fd, selectors.EVENT_READ, "stderr")
    buffers = {"stdout": bytearray(), "stderr": bytearray()}
    complete = {"stdout": bytearray(), "stderr": bytearray()}
    stdout_lines: list[dict[str, Any]] = []
    stdin_events: list[dict[str, Any]] = []
    requests: list[dict[str, Any]] = []
    result_objects: list[dict[str, Any]] = []
    pending_terminal: tuple[dict[str, Any], int] | None = None
    signals_sent: list[dict[str, Any]] = []
    hard_loss_sent = False
    stdin_closed = False
    deadline = time.monotonic() + timeout

    def send_event(event: dict[str, Any]) -> None:
        nonlocal stdin_closed
        if stdin_closed:
            raise SimulationError("attempted event after controller stdin close")
        line = _write_protocol_line(process.stdin.fileno(), event)
        parsed = _strict_protocol_object(line, "synthetic stdin event")
        stdin_events.append(_protocol_line_record(
            len(stdin_events) + 1, "simulator_to_controller", line, parsed,
        ))

    def signal_group(name: str, phase: str) -> None:
        try:
            os.killpg(process.pid, getattr(signal, name))
        except ProcessLookupError as exc:
            raise SimulationError(f"controller exited before {name}") from exc
        signals_sent.append({
            "sequence": len(signals_sent) + 1, "signal": name, "phase": phase,
        })

    def wait_for_receipt(request: dict[str, Any]) -> None:
        run_id = request["run_id"]
        row_name = f"{request['index']:03d}_{request['cell']}"
        path = evidence_parent / run_id / "cells" / request["slot"] / row_name / "spawn_receipt.json"
        receipt_deadline = min(deadline, time.monotonic() + 5.0)
        previous: bytes | None = None
        while time.monotonic() < receipt_deadline:
            try:
                current = _regular(path, "durable spawn receipt")
            except SimulationError:
                current = None
            if current is not None and current == previous:
                return
            previous = current
            if process.poll() is not None:
                break
            time.sleep(0.0005)
        raise SimulationError("spawn receipt was not durably observed before supervised stop")

    def consume_request(request: dict[str, Any]) -> None:
        nonlocal pending_terminal, hard_loss_sent
        synthetic_backend.validate_spawn_request(request)
        if requests and request["ordinal"] <= requests[-1]["ordinal"]:
            raise SimulationError("spawn requests are not consumed in strict schedule order")
        if not requests and request["ordinal"] != 0:
            raise SimulationError("first spawn request is not schedule ordinal zero")
        requests.append(request)
        if mode == "hard_loss_after_request":
            signal_group("SIGKILL", "after_request_before_any_root_event")
            hard_loss_sent = True
            return
        final_utf8 = _expected_final_utf8(request["cell"])
        events = list(synthetic_backend.scenario_events(
            request, backend_scenario, final_utf8,
        ))
        if not events:
            raise SimulationError("synthetic backend returned no root event")
        if mode == "safe_drain_after_receipt":
            if backend_scenario != "clean" or len(events) != 2:
                raise SimulationError("safe drain requires clean receipt and terminal")
            send_event(events[0])
            wait_for_receipt(request)
            for _ in range(2):
                signal_group("SIGTERM", "after_durable_receipt_before_terminal")
                signal_group("SIGINT", "after_durable_receipt_before_terminal")
            send_event(events[1])
            return
        if backend_scenario == "delayed_multi_poll":
            if len(events) != 2:
                raise SimulationError("delayed scenario must contain receipt and terminal")
            send_event(events[0])
            pending_terminal = (events[1], 2)
            return
        for event in events:
            send_event(event)

    while True:
        if time.monotonic() >= deadline:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGKILL)
            raise SimulationError(f"controller timed out: {args}")
        if pending_terminal is not None:
            event, ticks = pending_terminal
            if ticks <= 0:
                send_event(event)
                pending_terminal = None
            else:
                pending_terminal = (event, ticks - 1)
        ready = selector.select(0.01)
        for key, _ in ready:
            channel = key.data
            chunk = os.read(key.fd, 65536)
            if not chunk:
                selector.unregister(key.fd)
                continue
            complete[channel].extend(chunk)
            buffers[channel].extend(chunk)
            if channel != "stdout":
                continue
            while b"\n" in buffers["stdout"]:
                line, _, remainder = buffers["stdout"].partition(b"\n")
                buffers["stdout"] = bytearray(remainder)
                value = _strict_protocol_object(line, "controller stdout")
                stdout_lines.append(_protocol_line_record(
                    len(stdout_lines) + 1, "controller_to_simulator", line, value,
                ))
                if value.get("schema_id") == synthetic_backend.SPAWN_REQUEST_SCHEMA_ID:
                    if result_objects:
                        raise SimulationError("spawn request emitted after controller result")
                    if mode == "safe_drain_after_receipt" and requests:
                        raise SimulationError("later request emitted after supervised stop")
                    if mode == "hard_loss_after_request" and requests:
                        raise SimulationError("later request emitted after hard loss")
                    consume_request(value)
                else:
                    result_objects.append(value)
                    if len(result_objects) != 1:
                        raise SimulationError("controller emitted multiple terminal result objects")
        if process.poll() is not None and not selector.get_map():
            break
    selector.close()
    if buffers["stdout"]:
        raise SimulationError("controller emitted partial non-LF stdout protocol bytes")
    if pending_terminal is not None:
        raise SimulationError("controller exited before delayed terminal event")
    rc = process.wait()
    if not stdin_closed:
        try:
            process.stdin.close()
        except (BrokenPipeError, OSError):
            pass
        stdin_closed = True
    stdout = bytes(complete["stdout"])
    stderr = bytes(complete["stderr"])
    record = _invocation_record(
        args, rc, stdout, stderr, time.monotonic_ns() - started,
    )
    if mode == "hard_loss_after_request":
        record["result"] = None
    record["protocol"] = {
        "schema_id": "pw-r9-simulator-interactive-transcript-v1",
        "backend_scenario": backend_scenario,
        "mode": mode,
        "request_count": len(requests),
        "stdin_event_count": len(stdin_events),
        "stdout_line_count": len(stdout_lines),
        "stdout_lines": stdout_lines,
        "stdin_events": stdin_events,
        "request_identities": [
            {
                "ordinal": request["ordinal"], "nonce": request["nonce"],
                "invocation_id": request["invocation_id"],
                "task_name": request["task_name"],
                "canonical_task_path": request["expected_canonical_task_path"],
                "spawn_request_sha256": synthetic_backend.spawn_request_sha256(request),
                "spawn_request_bytes": len(synthetic_backend.canonical_json_bytes(request)),
            }
            for request in requests
        ],
        "signals_sent": signals_sent,
        "hard_loss_sent": hard_loss_sent,
        "no_retry_relaunch_followup_or_replacement": True,
        "calls": {
            "collaboration": 0, "model": 0, "network": 0, "provider": 0, "subject": 0,
        },
        "qualification_credit": 0,
    }
    if mode != "hard_loss_after_request" and not result_objects:
        raise SimulationError("controller terminal result object absent")
    return record


def _invoke(
    evidence_parent: Path, args: list[str], timeout: float = 600.0,
    *, backend_scenario: str | None = None, mode: str = "normal",
) -> dict[str, Any]:
    selected = backend_scenario
    if selected is None and "--scenario" in args:
        index = args.index("--scenario")
        selected = args[index + 1] if index + 1 < len(args) else None
    return _drive_controller(
        ROOT, evidence_parent, args, backend_scenario=selected or "clean",
        mode=mode, timeout=timeout,
    )


def _invoke_from(
    component_root: Path, evidence_parent: Path, args: list[str],
    timeout: float = 600.0,
) -> dict[str, Any]:
    """Invoke the public simulator/reopen surface in an isolated local repo."""
    selected = "clean"
    if "--scenario" in args:
        index = args.index("--scenario")
        if index + 1 < len(args):
            selected = args[index + 1]
    return _drive_controller(
        component_root, evidence_parent, args, backend_scenario=selected,
        mode="normal", timeout=timeout,
    )


def _assert_invocation(invocation: dict[str, Any], rc: int, status: str) -> None:
    result = invocation.get("result")
    actual = result.get("status") if isinstance(result, dict) else None
    if invocation.get("rc") != rc or actual != status:
        raise SimulationError(
            f"controller result mismatch rc/status={invocation.get('rc')}/{actual!r}, "
            f"expected {rc}/{status!r}: {invocation.get('stdout_utf8')}"
        )


def _assert_backend_observation(summary: dict[str, Any], scenario: str) -> None:
    observation = summary["transport_observation"]
    if observation["scenario"] != scenario:
        raise SimulationError(f"transport scenario mismatch: {observation['scenario']!r}")
    if scenario in {"clean", "delayed_multi_poll"}:
        expected = (["FINAL_RETURNED"], [0], ["COMPLETE_SINGLE_TEXT"])
    elif scenario in {
        "observed_tool", "observed_file", "observed_browse", "observed_network",
        "observed_delegation", "observed_memory", "observed_followup",
        "observed_nonterminal",
    }:
        expected = (["FINAL_RETURNED"], [86], ["PROHIBITED_ACTIVITY"])
    elif scenario in {"malformed_output", "partial_output"}:
        expected = (["FINAL_RETURNED"], [0], ["COMPLETE_SINGLE_TEXT"])
    else:
        return
    actual = (
        observation["terminal_statuses"], observation["returncodes"],
        observation["output_statuses"],
    )
    if actual != expected:
        raise SimulationError(f"transport observation mismatch for {scenario}: {actual}")


def _row_dirs(run_root: Path) -> list[Path]:
    return sorted(run_root.glob("cells/*/*"), key=lambda path: path.as_posix())


def _artifact_files(run_root: Path) -> list[Path]:
    return sorted(run_root.glob("artifacts/*/*.json"), key=lambda path: path.as_posix())


def _evidence_summary(run_root: Path, complete: bool) -> dict[str, Any]:
    _directory(run_root, "controller run root")
    run_storage, run = _json(run_root / "run.json", "run manifest", True)
    run_rows = run.get("schedule")
    if not isinstance(run_rows, list):
        raise SimulationError("run schedule absent")
    identities = {
        "nonce": [], "invocation_id": [], "canonical_task_path": [],
    }
    for ordinal, row in enumerate(run_rows):
        if not isinstance(row, dict):
            raise SimulationError("run schedule row malformed")
        nonce = row.get("nonce")
        invocation = row.get("invocation_id")
        path = row.get("expected_canonical_task_path")
        if (
            row.get("ordinal") != ordinal
            or not isinstance(nonce, str) or not HEX64.fullmatch(nonce)
            or invocation != f"r9-invocation:{nonce}"
            or row.get("task_name") != f"r9_{nonce}"
            or path != f"/root/r9_{nonce}"
        ):
            raise SimulationError("run schedule identity derivation drift")
        identities["nonce"].append(nonce)
        identities["invocation_id"].append(invocation)
        identities["canonical_task_path"].append(path)
    rows = _row_dirs(run_root)
    pass_count = fail_count = invalid_count = 0
    anomalies: list[dict[str, Any]] = []
    terminal_statuses: set[str] = set()
    returncodes: set[int] = set()
    output_statuses: set[str] = set()
    activity_flags: list[bool] = []
    protocol_evidence: list[dict[str, Any]] = []
    for row_path in rows:
        names = sorted(item.name for item in row_path.iterdir())
        if names != ROW_FILES:
            invalid_count += 1
            anomalies.append({
                "path": row_path.relative_to(run_root).as_posix(), "files": names,
            })
            continue
        packet = _regular(row_path / "provider_input.txt", "provider input")
        message = _regular(row_path / "spawn_message.txt", "spawn message")
        attempt_storage, attempt = _json(row_path / "attempt.json", "attempt", True)
        receipt_storage, receipt = _json(
            row_path / "spawn_receipt.json", "spawn receipt", True,
        )
        raw_storage, raw = _json(row_path / "raw_result.json", "raw result", True)
        completion_storage, completion = _json(
            row_path / "completion.json", "completion", True,
        )
        if not packet.endswith(b"\n") or packet.endswith(b"\n\n") or b"\r" in packet:
            invalid_count += 1
            continue
        request = {
            "schema_id": synthetic_backend.SPAWN_REQUEST_SCHEMA_ID,
            "run_id": run["run_id"], "run_kind": run["run_kind"], "mode": run["mode"],
            "slot": attempt["slot"], "cell": attempt["cell"], "index": attempt["index"],
            "ordinal": attempt["ordinal"], "nonce": attempt["nonce"],
            "invocation_id": attempt["invocation_id"], "task_name": attempt["task_name"],
            "expected_canonical_task_path": attempt["expected_canonical_task_path"],
            "agent_type": attempt["agent_type"], "fork_turns": attempt["fork_turns"],
            "model": attempt["model"], "reasoning_effort": attempt["reasoning_effort"],
            "packet_sha256": _sha(packet), "packet_bytes": len(packet),
            "message_utf8": message.decode("utf-8"), "message_sha256": _sha(message),
            "message_bytes": len(message), "attempt_sha256": _sha(attempt_storage),
            "attempt_bytes": len(attempt_storage),
        }
        synthetic_backend.validate_spawn_request(request)
        if receipt != synthetic_backend.make_spawn_receipt(request):
            raise SimulationError("spawn receipt/request binding drift")
        delivery = raw.get("terminal_delivery")
        if not isinstance(delivery, dict):
            raise SimulationError("raw terminal delivery absent")
        expected_raw = {
            "schema_id": "pw-r9-raw-result-v3", "run_id": run_root.name,
            "slot": attempt["slot"], "cell": attempt["cell"], "index": attempt["index"],
            "ordinal": attempt["ordinal"], "invocation_id": attempt["invocation_id"],
            "attempt_sha256": _sha(attempt_storage), "attempt_bytes": len(attempt_storage),
            "spawn_request_sha256": synthetic_backend.spawn_request_sha256(request),
            "spawn_request_bytes": len(synthetic_backend.canonical_json_bytes(request)),
            "spawn_receipt_sha256": _sha(receipt_storage),
            "spawn_receipt_bytes": len(receipt_storage),
            "terminal_delivery": delivery,
        }
        if raw != expected_raw:
            raise SimulationError("raw request/receipt/terminal binding drift")
        transport = completion.get("transport")
        score = completion.get("score")
        if not isinstance(transport, dict) or not isinstance(score, dict):
            raise SimulationError("completion transport/score absent")
        if (
            completion.get("raw_result_sha256") != _sha(raw_storage)
            or completion.get("raw_result_bytes") != len(raw_storage)
            or completion.get("spawn_receipt_sha256") != _sha(receipt_storage)
            or completion.get("spawn_receipt_bytes") != len(receipt_storage)
            or completion.get("attempt_sha256") != _sha(attempt_storage)
            or completion.get("attempt_bytes") != len(attempt_storage)
        ):
            raise SimulationError("completion causal identity drift")
        terminal_statuses.add(str(transport.get("terminal_status")))
        returncode = transport.get("returncode")
        if isinstance(returncode, int) and not isinstance(returncode, bool):
            returncodes.add(returncode)
        capture = transport.get("output_capture")
        if isinstance(capture, dict):
            output_statuses.add(str(capture.get("status")))
        activity_flags.append(transport.get("prohibited_activity") is True)
        pass_count += completion.get("status") == "PASS"
        fail_count += completion.get("status") == "FAIL"
        protocol_evidence.append({
            "row": row_path.relative_to(run_root).as_posix(),
            "invocation_id": request["invocation_id"],
            "canonical_task_path": request["expected_canonical_task_path"],
            "spawn_request": _identity(synthetic_backend.canonical_json_bytes(request)),
            "spawn_receipt": _identity(receipt_storage),
            "raw_result": _identity(raw_storage),
            "terminal_delivery": _identity(synthetic_backend.canonical_json_bytes(delivery)),
            "completion": _identity(completion_storage),
        })

    artifacts = _artifact_files(run_root)
    artifact_stages: list[str] = []
    artifact_slots: list[str] = []
    _, semantic = _json(SEMANTIC, "semantic manifest")
    stage_by_id = {
        row["stage"]: row for row in semantic.get("deterministic_stages", [])
        if isinstance(row, dict) and isinstance(row.get("stage"), str)
    }
    for path in artifacts:
        storage, value = _json(path, "stage artifact")
        stage = value.get("stage")
        slot = path.parent.name
        declared = stage_by_id.get(stage)
        if not isinstance(stage, str) or not isinstance(declared, dict):
            raise SimulationError(f"undeclared stage artifact: {stage}")
        expected = _semantic_canon(declared["expected_artifact"]) + b"\n"
        if storage != expected or value != declared["expected_artifact"]:
            raise SimulationError(f"stage artifact exact payload drift: {slot}/{stage}")
        artifact_stages.append(stage)
        artifact_slots.append(slot)
    path_terminals = sorted(run_root.glob("terminals/*.json"), key=lambda path: path.name)
    terminal_files = {
        name: _identity(_regular(run_root / name, name))
        for name in ("matrix_terminal.json", "accounting.json")
        if (run_root / name).is_file()
    }
    expected_pairs = {
        (slot, stage) for slot in ("slot-alpha", "slot-bravo", "slot-charlie")
        for stage in stage_by_id
    }
    actual_pairs = list(zip(artifact_slots, artifact_stages))
    if complete and (
        len(rows), pass_count, fail_count, invalid_count, len(artifacts), len(path_terminals)
    ) != (291, 291, 0, 0, 54, 3):
        raise SimulationError(
            "clean evidence mismatch: "
            f"{len(rows)}/{pass_count}/{fail_count}/{invalid_count}/"
            f"{len(artifacts)}/{len(path_terminals)}"
        )
    if complete and (
        set(actual_pairs) != expected_pairs or len(actual_pairs) != len(set(actual_pairs))
        or {path.stem for path in path_terminals}
            != {"slot-alpha", "slot-bravo", "slot-charlie"}
    ):
        raise SimulationError("clean stage/path-terminal inventory mismatch")
    return {
        "run_id": run_root.name, "run": _identity(run_storage),
        "scheduled_rows": len(run_rows), "row_directories": len(rows),
        "pass_rows": pass_count, "subject_fail_rows": fail_count,
        "invalid_row_chains": invalid_count, "row_anomalies": anomalies,
        "stage_artifacts": len(artifacts), "artifact_stage_count": len(set(artifact_stages)),
        "artifact_slot_count": len(set(artifact_slots)),
        "s90_artifacts": sum(stage == "S90" for stage in artifact_stages),
        "path_terminals": len(path_terminals), "terminal_files": terminal_files,
        "identities": identities, "protocol_evidence": protocol_evidence,
        "transport_observation": {
            "scenario": run.get("scenario"),
            "terminal_statuses": sorted(terminal_statuses),
            "returncodes": sorted(returncodes),
            "output_statuses": sorted(output_statuses),
            "prohibited_activity_rows": sum(activity_flags),
        },
    }


def _run_clean(evidence_parent: Path, run_id: str) -> dict[str, Any]:
    invocation = _invoke(evidence_parent, [
        "simulate", "--run-root", run_id, "--scenario", "clean",
    ], backend_scenario="clean")
    _assert_invocation(invocation, 0, "PASS")
    summary = _evidence_summary(evidence_parent / run_id, True)
    _assert_backend_observation(summary, "clean")
    reopen_a = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
    reopen_b = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
    _assert_invocation(reopen_a, 0, "PASS")
    _assert_invocation(reopen_b, 0, "PASS")
    if reopen_a.get("result") != reopen_b.get("result"):
        raise SimulationError("repeated public reopen reports differ")
    return {
        "status": "PASS", "run_id": run_id, "qualification_credit": 0,
        "controller": invocation, "summary": summary,
        "reopen_a": reopen_a, "reopen_b": reopen_b,
    }


def _run_clean_pair(suite: Path, before: dict[str, Any]) -> dict[str, Any]:
    evidence = suite / "evidence"
    first = _run_clean(evidence, "synthetic-clean-001")
    middle = _source_snapshot()
    if middle != before:
        raise SimulationError("bound source bytes changed after first clean run")
    second = _run_clean(evidence, "synthetic-clean-002")
    after = _source_snapshot()
    if after != before:
        raise SimulationError("bound source bytes changed during clean pair")
    combined = {
        key: [] for key in ("nonce", "invocation_id", "canonical_task_path")
    }
    for run in (first, second):
        for key in combined:
            combined[key].extend(run["summary"]["identities"][key])
    uniqueness: dict[str, dict[str, int]] = {}
    for key, values in combined.items():
        uniqueness[key] = {"count": len(values), "unique": len(set(values))}
        if len(values) != 582 or len(set(values)) != 582:
            raise SimulationError(f"clean-pair {key} uniqueness mismatch")
    return {
        "status": "PASS", "qualification_credit": 0,
        "unchanged_source_bundle": True, "runs": [first, second],
        "identity_uniqueness": uniqueness,
    }


def _clone_tree(source: Path, target: Path, boundary: Path) -> None:
    _directory(source, "clone source")
    _mkdir(target)
    for current, directories, files in os.walk(source):
        directories.sort()
        files.sort()
        current_path = Path(current)
        for name in directories:
            source_dir = current_path / name
            _directory(source_dir, "clone source directory")
            target_dir = target / source_dir.relative_to(source)
            _ensure_dir(target_dir.parent, boundary)
            _mkdir(target_dir)
        for name in files:
            source_file = current_path / name
            target_file = target / source_file.relative_to(source)
            _ensure_dir(target_file.parent, boundary)
            _write(target_file, _regular(source_file, "clone source file"))


def _exact_unlink_tree(path: Path, boundary: Path) -> dict[str, int]:
    resolved = path.resolve(strict=False)
    if resolved.parent != boundary.resolve() or not path.name.startswith("tmp-"):
        raise SimulationError(f"temporary cleanup boundary mismatch: {path}")
    _directory(path, "temporary cleanup root")
    files = directories = 0
    for current, dirnames, filenames in os.walk(path, topdown=False, followlinks=False):
        current_path = Path(current)
        for name in filenames:
            target = current_path / name
            info = os.lstat(target)
            if not stat.S_ISREG(info.st_mode):
                raise SimulationError(f"temporary cleanup refuses nonregular: {target}")
            os.unlink(target)
            files += 1
        for name in dirnames:
            target = current_path / name
            _directory(target, "temporary cleanup directory")
            os.rmdir(target)
            directories += 1
    os.rmdir(path)
    directories += 1
    _sync_dir(boundary)
    return {"exact_unlinked_files": files, "rmdir_directories": directories}


def _mutate_storage(path: Path, storage: bytes) -> tuple[bytes, bytes]:
    before = _regular(path, "mutation before")
    if storage == before:
        raise SimulationError("mutation made no byte change")
    os.chmod(path, 0o600)
    fd = os.open(path, os.O_WRONLY | os.O_TRUNC)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise SimulationError("short mutation write")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, 0o400)
    _sync_dir(path.parent)
    return before, _regular(path, "mutation after")


def _mutate_json(path: Path, change: Callable[[dict[str, Any]], None]) -> tuple[bytes, bytes]:
    _, value = _json(path, "mutation JSON", True)
    change(value)
    return _mutate_storage(path, _canon(value) + b"\n")


def _mutate_semantic_json(path: Path, change: Callable[[dict[str, Any]], None]) -> tuple[bytes, bytes]:
    _, value = _json(path, "semantic mutation JSON")
    change(value)
    return _mutate_storage(path, _semantic_canon(value) + b"\n")


def _capture_change(fault_root: Path, sequence: int, path: Path,
                    before: bytes, after: bytes, work_root: Path) -> dict[str, Any]:
    captures = fault_root / "captures"
    if not captures.exists():
        _mkdir(captures)
    before_path = captures / f"{sequence:02d}-before.bin"
    after_path = captures / f"{sequence:02d}-after.bin"
    _write(before_path, before)
    _write(after_path, after)
    return {
        "mutated_path": path.relative_to(work_root).as_posix(),
        "before": {"path": before_path.relative_to(fault_root).as_posix(), **_identity(before)},
        "after": {"path": after_path.relative_to(fault_root).as_posix(), **_identity(after)},
    }


def _first_rows(run_root: Path, count: int = 2) -> list[Path]:
    rows = _row_dirs(run_root)
    if len(rows) < count:
        raise SimulationError(f"need {count} completed rows, found {len(rows)}")
    return rows[:count]


def _rebind_identity_collision(run_root: Path) -> list[tuple[Path, bytes, bytes]]:
    """Plant a cross-row terminal sender identity; do not repair dependent evidence."""
    rows = _first_rows(run_root)
    _, first_attempt = _json(rows[0] / "attempt.json", "first attempt", True)
    second_raw_path = rows[1] / "raw_result.json"

    def collide(value: dict[str, Any]) -> None:
        delivery = value.get("terminal_delivery")
        if not isinstance(delivery, dict):
            raise SimulationError("second terminal delivery absent")
        delivery["invocation_id"] = first_attempt["invocation_id"]
        delivery["returned_canonical_task_path"] = (
            first_attempt["expected_canonical_task_path"]
        )

    return [(second_raw_path, *_mutate_json(second_raw_path, collide))]


def _tamper(run_root: Path, fault_root: Path, tamper: str) -> list[dict[str, Any]]:
    rows = _first_rows(run_root)
    changes: list[tuple[Path, bytes, bytes]] = []
    created: list[dict[str, Any]] = []
    if tamper == "create_wrong_render_directory_member":
        target = run_root / "renders"
        _mkdir(target)
        created.append({"path": target.relative_to(run_root).as_posix(), "kind": "directory"})
    elif tamper == "append_lf_to_render":
        path = rows[0] / "provider_input.txt"
        changes.append((path, *_mutate_storage(path, _regular(path, "render") + b"\n")))
    elif tamper == "change_render_byte":
        path = rows[0] / "provider_input.txt"
        data = _regular(path, "render")
        changes.append((path, *_mutate_storage(path, bytes([data[0] ^ 1]) + data[1:])))
    elif tamper == "change_raw_result_byte":
        path = rows[0] / "raw_result.json"

        def selected_result_change(value: dict[str, Any]) -> None:
            delivery = value.get("terminal_delivery")
            if not isinstance(delivery, dict) or not isinstance(
                delivery.get("final_utf8"), str
            ):
                raise SimulationError("bound terminal final_utf8 absent before mutation")
            delivery["final_utf8"] += " "

        changes.append((path, *_mutate_json(path, selected_result_change)))
    elif tamper == "change_raw_result_schema":
        path = rows[0] / "raw_result.json"
        changes.append((path, *_mutate_json(
            path, lambda value: value.__setitem__("schema_id", "pw-r9-raw-result-tampered")
        )))
    elif tamper == "change_embedded_score":
        path = rows[0] / "completion.json"
        def score_change(value: dict[str, Any]) -> None:
            score = value.get("score")
            if not isinstance(score, dict):
                raise SimulationError("completion score absent")
            score["actual_bytes"] = int(score.get("actual_bytes", 0)) + 1
        changes.append((path, *_mutate_json(path, score_change)))
    elif tamper in {"plant_future_attempt", "plant_future_completion"}:
        future = run_root / "cells" / "slot-alpha" / "999_future"
        _mkdir(future)
        name = "attempt.json" if tamper.endswith("attempt") else "completion.json"
        identity = _write_json(future / name, {"schema_id": "pw-r9-illegal-future-v1"})
        created.append({"path": (future / name).relative_to(run_root).as_posix(),
                        "kind": "file", **identity})
    elif tamper in {"change_run_semantic_binding", "change_run_operating_binding"}:
        path = run_root / "run.json"
        key = "semantic_manifest" if "semantic" in tamper else "operating_contract"
        def binding_change(value: dict[str, Any]) -> None:
            binding = value.get(key)
            if not isinstance(binding, dict):
                raise SimulationError(f"run {key} binding absent")
            binding["sha256"] = "0" * 64
        changes.append((path, *_mutate_json(path, binding_change)))
    elif tamper == "change_matrix_terminal_byte":
        path = run_root / "matrix_terminal.json"
        changes.append((path, *_mutate_json(
            path, lambda value: value.__setitem__("pass_rows", int(value.get("pass_rows", 0)) - 1)
        )))
    elif tamper == "change_accounting_count":
        path = run_root / "accounting.json"
        changes.append((path, *_mutate_json(
            path, lambda value: value.__setitem__(
                "valid_completions", int(value.get("valid_completions", 0)) - 1
            )
        )))
    elif tamper == "duplicate_run_nonce":
        path = run_root / "run.json"
        def nonce_change(value: dict[str, Any]) -> None:
            run_rows = value.get("schedule", value.get("rows"))
            if not isinstance(run_rows, list) or len(run_rows) < 2:
                raise SimulationError("run rows absent")
            run_rows[1]["nonce"] = run_rows[0]["nonce"]
        changes.append((path, *_mutate_json(path, nonce_change)))
    elif tamper == "reuse_prior_backend_identities":
        changes.extend(_rebind_identity_collision(run_root))
    elif tamper in {"change_stage_artifact_byte", "change_s90_artifact_byte"}:
        artifacts = _artifact_files(run_root)
        if tamper == "change_s90_artifact_byte":
            artifacts = [path for path in artifacts if "S90" in path.name]
        if not artifacts:
            raise SimulationError(f"no artifact found for {tamper}")
        path = artifacts[0]
        changes.append((path, *_mutate_semantic_json(
            path, lambda value: value.__setitem__("schema_id", "pw-r9-artifact-tampered")
        )))
    else:
        raise SimulationError(f"unsupported evidence tamper: {tamper}")
    captures = [
        _capture_change(fault_root, index, path, before, after, run_root)
        for index, (path, before, after) in enumerate(changes, 1)
    ]
    return captures + created


def _fault_root(suite: Path, sequence: int, label: str) -> Path:
    safe_label = re.sub(r"[^A-Za-z0-9_.-]+", "-", label.lower()).strip("-")
    name = f"{sequence:03d}-{safe_label}"[:127]
    path = suite / "faults" / name
    _mkdir(path)
    return path


def _fault_evidence_parent(suite: Path, sequence: int, label: str) -> Path:
    safe_label = re.sub(r"[^A-Za-z0-9_.-]+", "-", label.lower()).strip("-")
    parent = suite / "fault_evidence" / f"{sequence:03d}-{safe_label}"[:127]
    _mkdir(parent)
    return parent


def _source_projection(tamper: str, snapshot: dict[str, Any]) -> dict[str, Any]:
    files = snapshot.get("files")
    if not isinstance(files, list) or not files:
        raise SimulationError("source bundle empty")
    first = files[0]
    if tamper == "omit_declared_semantic_source":
        return {"tamper": tamper, "before_count": len(files), "after_count": len(files) - 1,
                "mismatch": "MISSING_DECLARED_MEMBER", "admitted": False}
    if tamper == "add_undeclared_control_member":
        return {"tamper": tamper, "before_count": len(files), "after_count": len(files) + 1,
                "mismatch": "EXTRA_UNDECLARED_MEMBER", "admitted": False}
    if tamper == "declared_source_as_directory":
        return {"tamper": tamper, "path": first["path"], "before_kind": "regular_nonlink",
                "after_kind": "directory", "mismatch": "NONREGULAR_MEMBER", "admitted": False}
    if tamper in {"change_declared_source_byte", "change_required_checkpoint", "change_architecture_schema"}:
        after_sha = "0" * 64 if first["sha256"] != "0" * 64 else "1" * 64
        return {"tamper": tamper, "path": first["path"],
                "before": {"sha256": first["sha256"], "bytes": first["bytes"]},
                "after": {"sha256": after_sha, "bytes": first["bytes"]},
                "mismatch": "IDENTITY_DRIFT", "admitted": False}
    raise SimulationError(f"unsupported source projection: {tamper}")


def _historical_head_sandbox(suite: Path, sequence: int, label: str,
                             component_source: Path, expect_success: bool) -> dict[str, Any]:
    """Advance HEAD around one exact synthetic run without changing its bundle."""
    work = suite / "work"
    repository = work / f"tmp-{sequence:03d}-{label}"
    cleanup: dict[str, int] | None = None
    observation: dict[str, Any] | None = None
    try:
        component_root, source = _materialize_sandbox_repository(repository, component_source, work)
        evidence_parent = repository / "sandbox_evidence"
        _mkdir(evidence_parent)
        run_id = "historical-head-run"
        launch = _invoke_from(component_root, evidence_parent, [
            "simulate", "--run-root", run_id, "--scenario", "malformed_output",
        ])
        _assert_invocation(launch, 1, "VALID_SUBJECT_FAIL")
        run_root = evidence_parent / run_id
        _, run = _json(run_root / "run.json", "historical run", True)
        recorded = source["recorded_git_head"]
        if run.get("git_head") != recorded or run.get("custody_mode") != "WORKTREE_EXACT_BUNDLE":
            raise SimulationError(f"{label}: recorded run custody mismatch")
        if component_source == PREDECESSOR_ROOT:
            historical_rows = _row_dirs(run_root)
            historical_failures = 0
            for historical_row in historical_rows:
                _, historical_completion = _json(
                    historical_row / "completion.json", "historical completion", True,
                )
                historical_failures += historical_completion.get("status") == "FAIL"
            summary = {
                "historical_schema_only": True,
                "row_directories": len(historical_rows),
                "subject_fail_rows": historical_failures,
            }
        else:
            summary = _evidence_summary(run_root, False)
        if summary["row_directories"] != 3 or summary["subject_fail_rows"] != 3:
            raise SimulationError(f"{label}: bounded valid-FAIL run did not stop each route at row one")
        before = _tree_inventory(run_root)
        advanced = _advance_sandbox_head(repository, label)
        if advanced == recorded:
            raise SimulationError(f"{label}: HEAD did not advance")
        changed_raw = _git_at(repository, [
            "diff-tree", "--no-commit-id", "--name-only", "-r", recorded, advanced,
        ])
        changed = changed_raw.decode("utf-8").splitlines() if changed_raw else []
        if changed != ["historical_head_marker.json"]:
            raise SimulationError(f"{label}: experiment bytes changed across HEAD advance: {changed}")
        recorded_blobs = _reopen_recorded_sources(repository, recorded, source["source_rows"])
        reopen = _invoke_from(component_root, evidence_parent, ["reopen", "--run-root", run_id])
        after = _tree_inventory(run_root)
        if before != after:
            raise SimulationError(f"{label}: public reopen mutated retained run evidence")
        result = reopen.get("result")
        if not isinstance(result, dict):
            raise SimulationError(f"{label}: public reopen result absent")
        offline = result.get("offline_verifier")
        if expect_success:
            _assert_invocation(reopen, 1, "VALID_SUBJECT_FAIL")
            if not isinstance(offline, dict) or offline.get("valid") is not True:
                raise SimulationError(f"{label}: successor offline verifier did not pass")
            custody = offline.get("custody")
            expected_custody = {
                "mode": "WORKTREE_EXACT_BUNDLE",
                "recorded_git_head": recorded,
                "current_head_equality_required": False,
                "exact_live_bundle_reopened": True,
                "recorded_commit_blobs_reopened": False,
                "historical_head_reopen": "PASS",
            }
            if custody != expected_custody:
                raise SimulationError(f"{label}: typed successor custody mismatch: {custody}")
            disposition = "SUCCESSOR_VALID_REOPEN_HISTORICAL_HEAD"
            error_code = None
        else:
            _assert_invocation(reopen, 2, "CONTROLLER_INVALID")
            if not isinstance(offline, dict) or offline.get("valid") is not False:
                raise SimulationError(f"{label}: predecessor verifier failure absent")
            error = offline.get("error")
            error_code = error.get("code") if isinstance(error, dict) else None
            if error_code != "RUN_GIT_HEAD_DRIFT" or offline.get("custody") is not None:
                raise SimulationError(f"{label}: predecessor failure was not RUN_GIT_HEAD_DRIFT")
            disposition = "PREDECESSOR_FAIL_PRESERVED"
        observation = {
            "label": label, "disposition": disposition,
            "recorded_git_head": recorded, "advanced_git_head": advanced,
            "head_equal": recorded == advanced, "changed_paths": changed,
            "recorded_commit_source_reopen": recorded_blobs,
            "component_source": _relative(component_source),
            "component_source_identity": {
                "source_file_count": source["source_file_count"],
                "source_rows_sha256": source["source_rows_sha256"],
                "source_rows_bytes": source["source_rows_bytes"],
            },
            "launch": launch, "reopen": reopen, "reopen_error_code": error_code,
            "run_summary": summary, "evidence_unchanged_by_reopen": True,
        }
    finally:
        if repository.exists():
            cleanup = _exact_unlink_tree(repository, work)
        if cleanup is not None and cleanup["exact_unlinked_files"] < 1:
            raise SimulationError(f"{label}: sandbox cleanup retained no file accounting")
    if observation is None or cleanup is None:
        raise SimulationError(f"{label}: sandbox observation or cleanup accounting absent")
    observation["sandbox_cleanup"] = cleanup
    return observation


def _historical_head_pair(suite: Path, sequence: int) -> dict[str, Any]:
    predecessor = _historical_head_sandbox(
        suite, sequence, "predecessor-head-drift", PREDECESSOR_ROOT, False,
    )
    successor = _historical_head_sandbox(
        suite, sequence, "successor-head-reopen", ROOT, True,
    )
    return {
        "normalized_signature": "R9_REG_20_HISTORICAL_RUN_GIT_HEAD_DRIFT",
        "predecessor": predecessor, "successor": successor,
        "causal_delta": {
            "same_reproducer": "advance HEAD only; recorded run, exact source closure, and evidence unchanged",
            "predecessor": "FAIL/RUN_GIT_HEAD_DRIFT",
            "successor": "VALID_REOPEN/HISTORICAL_HEAD_REOPEN",
            "recorded_commit_sources_reopened": True,
        },
        "calls": dict(SIMULATOR_CALLS_ZERO),
        "qualification_credit": 0,
    }


def _fault_record(suite: Path, clean: dict[str, Any], check: dict[str, Any],
                  row: dict[str, Any], sequence: int, kind: str) -> dict[str, Any]:
    identifier = row.get("variant_id") or row.get("case_id")
    if not isinstance(identifier, str):
        raise SimulationError("fault row identifier absent")
    fault_root = _fault_root(suite, sequence, identifier)
    strategy = row.get("strategy")
    zero_calls = {
        "collaboration": 0, "model": 0, "network": 0, "provider": 0, "subject": 0,
    }
    record: dict[str, Any] = {
        "schema_id": "pw-r9-compact-fault-receipt-v3",
        "kind": kind, "sequence": sequence, "identifier": identifier,
        "strategy": strategy, "expected": row.get("expect"),
        "fault_labels": row.get("fault_labels", []),
        "qualification_credit": 0, "calls": zero_calls,
        "current_result": "FAIL",
    }
    if kind == "normalized_variant":
        record.update({
            "regression_id": row.get("regression_id"),
            "scenario_id": row.get("scenario_id"),
            "predecessor_result": "FAIL",
            "predecessor_disposition": "PRESERVED_FAIL_NEVER_RECLASSIFIED",
        })
        for key in ("normalized_signature", "normalized_variant", "replaces_variant_id"):
            if isinstance(row.get(key), str):
                record[key] = row[key]

    def fresh_parent(suffix: str = "") -> tuple[Path, str]:
        run_id = "run"
        label = identifier + suffix
        return _fault_evidence_parent(suite, sequence, label), run_id

    def assert_subject_fail(
        invocation: dict[str, Any], run_root: Path, scenario: str,
    ) -> dict[str, Any]:
        _assert_invocation(invocation, 1, "VALID_SUBJECT_FAIL")
        summary = _evidence_summary(run_root, False)
        _assert_backend_observation(summary, scenario)
        if (
            summary["row_directories"] != 3
            or summary["subject_fail_rows"] != 3
            or summary["pass_rows"] != 0
        ):
            raise SimulationError(f"{identifier}: exact three-route FAIL stop required")
        slots = [path.parent.name for path in _row_dirs(run_root)]
        if len(slots) != len(set(slots)):
            raise SimulationError(f"{identifier}: later same-slot request admitted")
        for path in _row_dirs(run_root):
            _, completion = _json(path / "completion.json", "subject FAIL completion", True)
            score = completion.get("score")
            if not isinstance(score, dict) or score.get("verdict") != "FAIL":
                raise SimulationError(f"{identifier}: deterministic FAIL score absent")
            if scenario.startswith("observed_") and (
                score.get("reason") != "PROHIBITED_ACTIVITY_AFTER_FINAL"
                or completion.get("transport", {}).get("returncode") != 86
            ):
                raise SimulationError(f"{identifier}: prohibited activity did not score rc86 FAIL")
        return summary

    if strategy == "clean_reference":
        first = clean["runs"][0]
        record["observation"] = {
            "clean_run": first["run_id"], "summary": first["summary"],
            "controller_protocol": first["controller"]["protocol"],
            "reopen_a": first["reopen_a"]["result"],
            "reopen_b": first["reopen_b"]["result"],
        }
        record["current_result"] = "PASS"

    elif strategy == "protocol_subject_success":
        evidence_parent, run_id = fresh_parent()
        scenario = str(row.get("backend_scenario"))
        invocation = _invoke(
            evidence_parent,
            ["simulate", "--run-root", run_id, "--scenario", scenario],
            backend_scenario=scenario,
        )
        _assert_invocation(invocation, 0, "PASS")
        summary = _evidence_summary(evidence_parent / run_id, True)
        _assert_backend_observation(summary, scenario)
        protocol = invocation["protocol"]
        if (
            protocol["request_count"] != 291
            or protocol["stdin_event_count"] != 582
            or len({row["invocation_id"] for row in protocol["request_identities"]}) != 291
        ):
            raise SimulationError(f"{identifier}: complete 291 request/event traversal absent")
        reopen_a = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
        reopen_b = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
        _assert_invocation(reopen_a, 0, "PASS")
        _assert_invocation(reopen_b, 0, "PASS")
        if reopen_a["result"] != reopen_b["result"]:
            raise SimulationError(f"{identifier}: independent reopens differ")
        record["observation"] = {
            "controller": invocation, "summary": summary,
            "reopen_a": reopen_a, "reopen_b": reopen_b,
        }
        record["current_result"] = "PASS"

    elif strategy == "protocol_subject_fail":
        evidence_parent, run_id = fresh_parent()
        scenario = str(row.get("backend_scenario"))
        invocation = _invoke(
            evidence_parent,
            ["simulate", "--run-root", run_id, "--scenario", scenario],
            backend_scenario=scenario,
        )
        summary = assert_subject_fail(
            invocation, evidence_parent / run_id, scenario,
        )
        record["observation"] = {
            "controller": invocation, "summary": summary,
            "no_later_same_slot_start": True,
        }
        record["current_result"] = "PASS"

    elif strategy == "protocol_controller_invalid":
        evidence_parent, run_id = fresh_parent()
        scenario = str(row.get("backend_scenario"))
        invocation = _invoke(
            evidence_parent,
            ["simulate", "--run-root", run_id, "--scenario", scenario],
            backend_scenario=scenario,
        )
        _assert_invocation(invocation, 2, "CONTROLLER_INVALID")
        run_root = evidence_parent / run_id
        attempts = list(run_root.glob("cells/*/*/attempt.json"))
        completions = list(run_root.glob("cells/*/*/completion.json"))
        protocol = invocation["protocol"]
        if (
            len(attempts) != 1 or completions
            or protocol["request_count"] != 1
            or protocol["stdin_event_count"] not in {1, 2}
        ):
            raise SimulationError(f"{identifier}: invalid transport did not stop once-only")
        record["observation"] = {
            "controller": invocation, "attempts": len(attempts),
            "raw_results": len(list(run_root.glob("cells/*/*/raw_result.json"))),
            "completions": len(completions), "no_later_request": True,
        }
        record["current_result"] = "PASS"

    elif strategy == "protocol_safe_drain":
        evidence_parent, run_id = fresh_parent()
        invocation = _invoke(
            evidence_parent,
            ["simulate", "--run-root", run_id, "--scenario", "clean"],
            backend_scenario="clean", mode="safe_drain_after_receipt",
        )
        _assert_invocation(invocation, 2, "STOPPED_AFTER_DRAIN")
        protocol = invocation["protocol"]
        run_root = evidence_parent / run_id
        summary = _evidence_summary(run_root, False)
        if (
            protocol["request_count"] != 1
            or protocol["stdin_event_count"] != 2
            or len(protocol["signals_sent"]) != 4
            or {item["signal"] for item in protocol["signals_sent"]}
                != {"SIGINT", "SIGTERM"}
            or summary["row_directories"] != 1
            or summary["pass_rows"] != 1
        ):
            raise SimulationError(f"{identifier}: exact supervised drain evidence absent")
        reopen_a = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
        reopen_b = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
        _assert_invocation(reopen_a, 2, "STOPPED_AFTER_DRAIN")
        _assert_invocation(reopen_b, 2, "STOPPED_AFTER_DRAIN")
        if reopen_a["result"] != reopen_b["result"]:
            raise SimulationError(f"{identifier}: stopped reopens differ")
        record["observation"] = {
            "controller": invocation, "summary": summary,
            "reopen_a": reopen_a, "reopen_b": reopen_b,
            "same_terminal_drained": True, "no_later_request": True,
        }
        record["current_result"] = "PASS"

    elif strategy in {"protocol_hard_loss", "same_root_after_hard_loss"}:
        evidence_parent, run_id = fresh_parent()
        invocation = _invoke(
            evidence_parent,
            ["simulate", "--run-root", run_id, "--scenario", "clean"],
            backend_scenario="clean", mode="hard_loss_after_request",
        )
        run_root = evidence_parent / run_id
        protocol = invocation["protocol"]
        if (
            invocation["rc"] != -signal.SIGKILL
            or protocol["request_count"] != 1
            or protocol["stdin_event_count"] != 0
            or len(list(run_root.glob("cells/*/*/attempt.json"))) != 1
            or list(run_root.glob("cells/*/*/raw_result.json"))
            or list(run_root.glob("cells/*/*/completion.json"))
        ):
            raise SimulationError(f"{identifier}: exact request-stage hard loss absent")
        reopen = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
        _assert_invocation(reopen, 2, "CONTROLLER_INVALID")
        inventory_before = _tree_inventory(run_root)
        reinvoke = _invoke(
            evidence_parent,
            ["simulate", "--run-root", run_id, "--scenario", "clean"],
            backend_scenario="clean",
        )
        inventory_after = _tree_inventory(run_root)
        if (
            reinvoke["rc"] != 2
            or reinvoke["protocol"]["request_count"] != 0
            or inventory_before != inventory_after
        ):
            raise SimulationError(f"{identifier}: same-root fuse/reinvoke changed evidence")
        record["observation"] = {
            "hard_loss_controller": invocation, "public_reopen": reopen,
            "same_root_reinvoke": reinvoke, "incomplete_fuse_preserved": True,
            "evidence_unchanged_on_reinvoke": True, "no_relaunch": True,
        }
        record["current_result"] = "PASS"

    elif strategy == "causal_prefix_projection":
        work = suite / "work"
        temp_parent = work / f"tmp-{sequence:03d}-{identifier}"[:127]
        run_id = "synthetic-clean-001"
        temp = temp_parent / run_id
        _mkdir(temp_parent)
        _clone_tree(suite / "evidence" / run_id, temp, temp_parent)
        deleted: list[dict[str, Any]] = []
        try:
            stage = row.get("stage")
            first = _first_rows(temp, 1)[0]
            if stage == "raw_result":
                targets = [first / "completion.json"]
            elif stage == "completion":
                targets = [temp / "accounting.json"]
            else:
                raise SimulationError(f"{identifier}: unsupported causal prefix stage")
            for target in targets:
                storage = _regular(target, "causal prefix deleted successor")
                os.unlink(target)
                deleted.append({
                    "path": target.relative_to(temp).as_posix(), **_identity(storage),
                })
            invocation = _invoke(temp_parent, ["reopen", "--run-root", run_id])
            _assert_invocation(invocation, 2, "CONTROLLER_INVALID")
            record["observation"] = {
                "stage": stage, "deleted_later_evidence": deleted,
                "controller": invocation, "no_repair": True,
            }
        finally:
            if temp_parent.exists():
                record["ephemeral_cleanup"] = _exact_unlink_tree(temp_parent, work)
        record["current_result"] = "PASS"

    elif strategy == "protocol_archive_and_negative_matrix":
        archive = check["candidate_v2_failure_archive"]
        if archive.get("status") != "FAIL_PRESERVED":
            raise SimulationError(f"{identifier}: historical app-server failure not preserved")
        outcomes: list[dict[str, Any]] = []
        for index, scenario in enumerate(row.get("backend_scenarios", []), 1):
            evidence_parent, run_id = fresh_parent(f"-{index:02d}-{scenario}")
            invocation = _invoke(
                evidence_parent,
                ["simulate", "--run-root", run_id, "--scenario", scenario],
                backend_scenario=scenario,
            )
            if scenario.startswith("observed_"):
                summary = assert_subject_fail(
                    invocation, evidence_parent / run_id, scenario,
                )
                outcome = "SUBJECT_FAIL"
            else:
                _assert_invocation(invocation, 2, "CONTROLLER_INVALID")
                summary = {
                    "attempts": len(list((evidence_parent / run_id).glob(
                        "cells/*/*/attempt.json"
                    ))),
                    "completions": len(list((evidence_parent / run_id).glob(
                        "cells/*/*/completion.json"
                    ))),
                }
                outcome = "CONTROLLER_INVALID"
            outcomes.append({
                "scenario": scenario, "outcome": outcome,
                "controller": invocation, "summary": summary,
            })
        if (
            sum(item["outcome"] == "CONTROLLER_INVALID" for item in outcomes) != 3
            or sum(item["outcome"] == "SUBJECT_FAIL" for item in outcomes) != 8
        ):
            raise SimulationError(f"{identifier}: exact negative protocol matrix drift")
        record["observation"] = {
            "historical_app_server_failure": archive,
            "historical_current_authority": False,
            "current_protocol_matrix": outcomes,
        }
        record["current_result"] = "PASS"

    elif strategy == "evidence_mutation":
        work = suite / "work"
        temp_parent = work / f"tmp-{sequence:03d}-{identifier}"[:127]
        run_id = "synthetic-clean-001"
        temp = temp_parent / run_id
        _mkdir(temp_parent)
        _clone_tree(suite / "evidence" / run_id, temp, temp_parent)
        try:
            changes = _tamper(temp, fault_root, str(row.get("tamper")))
            invocation = _invoke(temp_parent, ["reopen", "--run-root", run_id])
            _assert_invocation(
                invocation, int(row.get("expect", {}).get("rc", 2)),
                str(row.get("expect", {}).get("status", "CONTROLLER_INVALID")),
            )
            record["observation"] = {
                "tamper": row.get("tamper"), "changes": changes,
                "controller": invocation, "no_repair": True,
            }
        finally:
            if temp_parent.exists():
                record["ephemeral_cleanup"] = _exact_unlink_tree(temp_parent, work)
        record["current_result"] = "PASS"

    elif strategy == "source_binding_projection":
        record["observation"] = _source_projection(
            str(row.get("tamper")), check["source_bundle"],
        )
        if record["observation"]["admitted"] is not False:
            raise SimulationError(f"{identifier}: source projection admitted")
        record["current_result"] = "PASS"

    elif strategy == "historical_head_reopen_pair":
        record["observation"] = _historical_head_pair(suite, sequence)
        expected = row.get("expect", {})
        if (
            expected.get("predecessor_result") != "FAIL"
            or expected.get("predecessor_error_code") != "RUN_GIT_HEAD_DRIFT"
            or record["observation"]["predecessor"]["disposition"]
                != "PREDECESSOR_FAIL_PRESERVED"
            or record["observation"]["successor"]["disposition"]
                != "SUCCESSOR_VALID_REOPEN_HISTORICAL_HEAD"
        ):
            raise SimulationError(f"{identifier}: historical HEAD causal proof mismatch")
        record["current_result"] = "PASS"

    elif strategy == "deterministic_projection_execution":
        fixture_id = row.get("fixture_id")
        expected_contract = row.get("expect", {})
        expected = expected_contract.get("expected")
        matched = [
            item for item in check["semantic_repair"].get("counterfactuals", [])
            if item.get("fixture_id") == fixture_id
        ]
        if (
            row.get("evaluator") != "_evaluate_provider_projection"
            or len(matched) != 1
            or matched[0].get("expected") != expected
            or matched[0].get("observed") != expected
            or matched[0].get("result") != "PASS"
        ):
            raise SimulationError(f"{identifier}: projection evaluation mismatch")
        record["predecessor_result"] = check["semantic_repair"]["predecessor_result"]
        record["observation"] = {
            "computed_counterfactual": matched[0],
            "evaluator": check["semantic_repair"]["evaluator"]["function"],
            "receipt_assertion_authority": "DENIED",
        }
        record["current_result"] = "PASS"

    elif strategy == "static_assertion":
        assertion = row.get("assertion")
        if assertion == "public_check_only_pass":
            observation: Any = _controller_check_only()
        elif assertion == "all_declared_regular_exact":
            observation = {
                "file_count": check["source_bundle"]["file_count"],
                "all_declared_present": True, "all_regular_nonlinks": True,
                "all_hashes_exact": True,
            }
        elif assertion in {"candidate_import_scan", "public_command_set"}:
            observation = {
                "candidate_v12_v21_runtime_imports":
                    check["candidate_v12_v21_runtime_imports"],
                "controller_commands": check["controller_commands"],
            }
        elif assertion == "historical_predecessor_exact":
            observation = {
                "historical_predecessors": len(check["historical_predecessors"]),
                "all_results": [
                    item["predecessor_result"]
                    for item in check["historical_predecessors"]
                ],
            }
        elif assertion == "git_bundle_binding":
            observation = check["source_bundle"]
        elif assertion == "semantic_predicate_clarification":
            observation = check["semantic_repair"]
        else:
            raise SimulationError(f"unsupported static assertion: {assertion}")
        record["observation"] = observation
        record["current_result"] = "PASS"

    elif strategy == "coverage_meta":
        record["observation"] = {"deferred_until_dependencies_terminal": True}
        record["current_result"] = "DEFERRED_META"

    else:
        raise SimulationError(f"unsupported fault strategy: {strategy}")

    if record["current_result"] == "DEFERRED_META":
        return {
            "identifier": identifier, "kind": kind,
            "current_result": "DEFERRED_META", "pending_receipt": record,
            "pending_root": fault_root.relative_to(suite).as_posix(),
        }
    _write_json(fault_root / "receipt.json", record)
    return {
        "identifier": identifier, "kind": kind,
        "current_result": record["current_result"],
        "receipt": {
            "path": (fault_root / "receipt.json").relative_to(suite).as_posix(),
            **_identity(_regular(fault_root / "receipt.json", "fault receipt")),
        },
    }


def _run_faults(suite: Path, clean: dict[str, Any], check: dict[str, Any]) -> dict[str, Any]:
    _, faults = _json(FAULTS, "fault scenarios")
    records: list[dict[str, Any]] = []
    sequence = 0
    meta_indexes: list[int] = []
    for scenario in faults.get("scenarios", []):
        for variant in scenario.get("variants", []):
            sequence += 1
            row = {**variant, "regression_id": scenario.get("regression_id"),
                   "scenario_id": variant.get("scenario_id", scenario.get("scenario_id"))}
            try:
                record = _fault_record(suite, clean, check, row, sequence, "normalized_variant")
            except Exception as exc:
                record = {"identifier": variant.get("variant_id"), "kind": "normalized_variant",
                          "current_result": "FAIL", "error_type": type(exc).__name__, "error": str(exc)}
                matches = sorted((suite / "faults").glob(f"{sequence:03d}-*"))
                if len(matches) == 1 and not (matches[0] / "receipt.json").exists():
                    failure = {
                        "schema_id": "pw-r9-compact-fault-receipt-v3",
                        "kind": "normalized_variant", "sequence": sequence,
                        "identifier": variant.get("variant_id"),
                        "regression_id": scenario.get("regression_id"),
                        "scenario_id": scenario.get("scenario_id"),
                        "strategy": variant.get("strategy"), "current_result": "FAIL",
                        "qualification_credit": 0,
                        "calls": dict(SIMULATOR_CALLS_ZERO),
                        "error": {"type": type(exc).__name__, "message": str(exc)},
                    }
                    identity = _write_json(matches[0] / "receipt.json", failure)
                    record["receipt"] = {
                        "path": (matches[0] / "receipt.json").relative_to(suite).as_posix(),
                        **identity,
                    }
            if record.get("current_result") == "DEFERRED_META":
                meta_indexes.append(len(records))
            records.append(record)
    globals_: list[dict[str, Any]] = []
    for case in faults.get("global_fault_cases", []):
        sequence += 1
        try:
            globals_.append(_fault_record(suite, clean, check, case, sequence, "global_case"))
        except Exception as exc:
            record = {"identifier": case.get("case_id"), "kind": "global_case",
                      "current_result": "FAIL", "error_type": type(exc).__name__,
                      "error": str(exc)}
            matches = sorted((suite / "faults").glob(f"{sequence:03d}-*"))
            if len(matches) == 1 and not (matches[0] / "receipt.json").exists():
                failure = {
                    "schema_id": "pw-r9-compact-fault-receipt-v3",
                    "kind": "global_case", "sequence": sequence,
                    "identifier": case.get("case_id"), "strategy": case.get("strategy"),
                    "current_result": "FAIL", "qualification_credit": 0,
                    "calls": dict(SIMULATOR_CALLS_ZERO),
                    "error": {"type": type(exc).__name__, "message": str(exc)},
                }
                identity = _write_json(matches[0] / "receipt.json", failure)
                record["receipt"] = {
                    "path": (matches[0] / "receipt.json").relative_to(suite).as_posix(),
                    **identity,
                }
            globals_.append(record)
    dependency_pass = all(
        row.get("current_result") == "PASS" for index, row in enumerate(records)
        if index not in meta_indexes
    ) and all(row.get("current_result") == "PASS" for row in globals_)
    for index in meta_indexes:
        summary = records[index]
        receipt = summary.pop("pending_receipt")
        pending_root = summary.pop("pending_root")
        receipt["current_result"] = "PASS" if dependency_pass else "FAIL"
        receipt["observation"] = {"all_dependency_variants_pass": dependency_pass}
        receipt_path = suite / pending_root / "receipt.json"
        identity = _write_json(receipt_path, receipt)
        summary["current_result"] = receipt["current_result"]
        summary["receipt"] = {"path": receipt_path.relative_to(suite).as_posix(), **identity}
    passed = sum(row.get("current_result") == "PASS" for row in records)
    global_passed = sum(row.get("current_result") == "PASS" for row in globals_)
    return {
        "status": "PASS" if passed == len(records) and global_passed == len(globals_) else "FAIL",
        "qualification_credit": 0,
        "normalized_variants": records, "global_cases": globals_,
        "normalized_passed": passed, "normalized_total": len(records),
        "global_passed": global_passed, "global_total": len(globals_),
    }


def _tree_inventory(root: Path, exclude: set[str] | None = None) -> list[dict[str, Any]]:
    _directory(root, "inventory root")
    excluded = exclude or set()
    entries: list[dict[str, Any]] = []
    for current, directories, files in os.walk(root):
        directories.sort()
        files.sort()
        current_path = Path(current)
        for directory in directories:
            path = current_path / directory
            _directory(path, "inventory directory")
            if path.name == "__pycache__":
                raise SimulationError(f"pycache forbidden in retained evidence: {path}")
        for name in files:
            path = current_path / name
            rel = path.relative_to(root).as_posix()
            if rel in excluded:
                continue
            data = _regular(path, "inventory file")
            if path.suffix == ".pyc":
                raise SimulationError(f"bytecode forbidden in retained evidence: {path}")
            entries.append({"path": rel, **_identity(data)})
    return entries


def _write_inventory(suite: Path) -> dict[str, Any]:
    work = suite / "work"
    if any(work.iterdir()):
        raise SimulationError("ephemeral work roots remain before inventory")
    os.rmdir(work)
    entries = _tree_inventory(suite, {"inventory.json"})
    manifest = {
        "schema_id": "pw-r9-retained-evidence-inventory-v1",
        "root": suite.name,
        "coverage": "every retained regular file except this self-referential inventory.json",
        "self_exclusion": {"path": "inventory.json", "reason": "cryptographic self-reference"},
        "entry_count": len(entries), "entries": entries,
        "entries_sha256": _sha(_canon(entries)), "entries_bytes": len(_canon(entries)),
    }
    identity = _write_json(suite / "inventory.json", manifest)
    reopened = _verify_inventory(suite)
    return {"path": "inventory.json", **identity, "independent_reopen": reopened}


def _verify_inventory(suite: Path) -> dict[str, Any]:
    storage, manifest = _json(suite / "inventory.json", "retained inventory", True)
    entries = manifest.get("entries")
    if not isinstance(entries, list):
        raise SimulationError("inventory entries absent")
    actual = _tree_inventory(suite, {"inventory.json"})
    if entries != actual:
        raise SimulationError("retained evidence inventory mismatch")
    if manifest.get("entry_count") != len(entries):
        raise SimulationError("inventory entry count mismatch")
    if manifest.get("entries_sha256") != _sha(_canon(entries)):
        raise SimulationError("inventory entry digest mismatch")
    return {"status": "PASS", "inventory": _identity(storage), "entry_count": len(entries)}


def _suite_receipt(command: str, before: dict[str, Any], clean: dict[str, Any] | None,
                   faults: dict[str, Any] | None, error: Exception | None) -> dict[str, Any]:
    after = _source_snapshot()
    status = "PASS"
    if error is not None or before != after:
        status = "FAIL"
    if clean is not None and clean.get("status") != "PASS":
        status = "FAIL"
    if faults is not None and faults.get("status") != "PASS":
        status = "FAIL"
    open_blockers = [
        {"blocker_id": "HOLISTIC_INDEPENDENT_XHIGH_REVIEW_NOT_PART_OF_SIMULATOR",
         "meaning": "A simulator cannot mint or substitute the required independent holistic review."}
    ]
    if not before.get("head_equals_origin_main") or not before.get("all_bound_files_match_head"):
        open_blockers.append({
            "blocker_id": "PUSHED_GIT_BYTE_CUSTODY_NOT_YET_CLOSED",
            "meaning": "Bound current bytes are recorded exactly but do not all match fetched origin/main custody.",
        })
    return {
        "schema_id": "pw-r9-simulator-suite-receipt-v3",
        "status": status, "command": command, "qualification_credit": 0,
        "calls": dict(SIMULATOR_CALLS_ZERO),
        "source_bundle_before": before, "source_bundle_after": after,
        "source_bundle_unchanged": before == after,
        "clean_pair": clean, "faults": faults,
        "historical_predecessors": _history(),
        "stabilization_exit": {"status": "FAIL", "open_blockers": open_blockers,
                               "simulator_may_authorize_exit": False},
        "error": None if error is None else {"type": type(error).__name__, "message": str(error)},
        "residual_risks": [
            "malicious trusted-controller fabrication", "host or OS compromise",
            "arbitrary in-process private callers", "capability tokens",
            "recursive or self-hosting verifier authority", "callback confinement",
            "reflection resistance", "production FileSafe or read-isolation proof",
        ],
        "nonclaims": [
            "Synthetic evidence has zero empirical and qualification credit.",
            "Suite PASS is not stabilization exit, candidate, audit, freeze, canary, qualification, readiness, or release evidence.",
        ],
    }


def _suite_receipt_gate(receipt: dict[str, Any]) -> dict[str, Any]:
    """Fail closed on the retained command result before reopening any clean run."""
    command = receipt.get("command")
    blockers: list[str] = []
    if receipt.get("schema_id") != "pw-r9-simulator-suite-receipt-v3":
        blockers.append("SUITE_RECEIPT_SCHEMA_NOT_V3")
    if command not in {"run-clean-pair", "run-regressions", "self-test"}:
        blockers.append("SUITE_COMMAND_UNSUPPORTED")
    if receipt.get("status") != "PASS":
        blockers.append("SUITE_RECEIPT_STATUS_NOT_PASS")
    if receipt.get("error") is not None:
        blockers.append("SUITE_RECEIPT_ERROR_PRESENT")
    if receipt.get("source_bundle_unchanged") is not True:
        blockers.append("SUITE_SOURCE_BUNDLE_NOT_UNCHANGED")
    if receipt.get("calls") != SIMULATOR_CALLS_ZERO:
        blockers.append("SUITE_CALL_ACCOUNTING_NOT_ZERO")
    clean = receipt.get("clean_pair")
    if not isinstance(clean, dict) or clean.get("status") != "PASS":
        blockers.append("COMMAND_REQUIRED_CLEAN_PAIR_NOT_PASS")
    faults = receipt.get("faults")
    if command in {"run-regressions", "self-test"}:
        if not isinstance(faults, dict) or faults.get("status") != "PASS":
            blockers.append("COMMAND_REQUIRED_FAULTS_NOT_PASS")
    elif command == "run-clean-pair" and faults is not None:
        blockers.append("CLEAN_PAIR_COMMAND_HAS_UNDECLARED_FAULT_SECTION")
    return {
        "status": "PASS" if not blockers else "FAIL",
        "command": command,
        "required_sections": (
            ["clean_pair", "faults"]
            if command in {"run-regressions", "self-test"} else ["clean_pair"]
        ),
        "suite_receipt_status": receipt.get("status"),
        "clean_pair_status": clean.get("status") if isinstance(clean, dict) else None,
        "faults_status": faults.get("status") if isinstance(faults, dict) else None,
        "blockers": blockers,
    }


def _reopen_suite(suite: Path) -> dict[str, Any]:
    inventory = _verify_inventory(suite)
    receipt_storage, receipt = _json(suite / "simulator_receipt.json", "suite receipt", True)
    receipt_gate = _suite_receipt_gate(receipt)
    before = receipt.get("source_bundle_before")
    after = receipt.get("source_bundle_after")
    if not isinstance(before, dict) or not isinstance(after, dict):
        raise SimulationError("suite source snapshots absent")
    source_now = _snapshot_recorded_source_paths(before)
    source_identity = _source_identity_comparison(before, after, source_now)
    custody = _current_git_custody(source_now)
    component_root = _recorded_component_root(before)
    clean_reports: list[dict[str, Any]] = []
    clean = receipt.get("clean_pair")
    if not isinstance(clean, dict):
        raise SimulationError("suite clean-pair receipt absent")
    runs = clean.get("runs")
    if not isinstance(runs, list) or len(runs) != 2:
        raise SimulationError("suite must bind exactly two clean runs")
    for run in runs:
        if not isinstance(run, dict) or not isinstance(run.get("run_id"), str):
            raise SimulationError("clean receipt run reference malformed")
        if (
            receipt_gate.get("status") != "PASS"
            or source_identity.get("status") != "PASS"
            or custody.get("status") != "PASS"
        ):
            break
        invocation = _invoke_from(
            component_root, suite / "evidence", ["reopen", "--run-root", run["run_id"]],
        )
        _assert_invocation(invocation, 0, "PASS")
        summary = _evidence_summary(suite / "evidence" / run["run_id"], True)
        if summary != run.get("summary"):
            raise SimulationError(f"clean run summary drift: {run['run_id']}")
        clean_reports.append({"run_id": run["run_id"], "controller": invocation,
                              "summary": summary})
    causal_proof = _reopen_repair_causal_proof(
        receipt_storage, before, after, source_now, source_identity, custody,
    )
    causal_pass = causal_proof is None or causal_proof.get("status") == "PASS"
    status = "PASS" if (
        receipt_gate.get("status") == "PASS"
        and source_identity.get("status") == "PASS" and custody.get("status") == "PASS"
        and len(clean_reports) == 2 and causal_pass
    ) else "FAIL"
    return {
        "schema_id": "pw-r9-simulator-suite-reopen-v3", "status": status,
        "qualification_credit": 0, "calls": dict(SIMULATOR_CALLS_ZERO),
        "suite_receipt": _identity(receipt_storage), "inventory": inventory,
        "retained_suite_gate": receipt_gate,
        "stable_source_identity": source_identity,
        "current_git_custody": custody,
        "historical_mutable_snapshot_equality_required": False,
        "clean_reopens": clean_reports,
        "same_family_causal_proof": causal_proof,
        "stabilization_exit": "NOT_AUTHORIZED_BY_SIMULATOR",
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="R9 compact zero-provider public-CLI simulator")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("check", help="zero-write static contract, source, history, and Git binding check")
    for name, help_text in (
        ("run-clean-pair", "retain two complete clean 291-row matrices and 54 artifacts each"),
        ("run-regressions", "run all 22 normalized families and causal/global fault cases"),
        ("self-test", "clean pair plus all normalized and causal/global fault cases"),
    ):
        command = commands.add_parser(name, help=help_text)
        command.add_argument("--run-root", required=True, help=f"new direct child of {RUNS}")
    reopen = commands.add_parser("reopen-suite", help="independently inventory and public-reopen retained suite")
    reopen.add_argument("--run-root", required=True, help=f"existing direct child of {RUNS}")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        check = _static_check()
        if args.command == "check":
            sys.stdout.buffer.write(_canon(check) + b"\n")
            return 0
        if args.command == "reopen-suite":
            report = _reopen_suite(_suite_root(args.run_root, False))
            sys.stdout.buffer.write(_canon(report) + b"\n")
            return 0 if report["status"] == "PASS" else 2
        suite = _suite_root(args.run_root, True)
        before = check["source_bundle"]
        clean = faults = None
        error: Exception | None = None
        try:
            if args.command in {"run-clean-pair", "self-test", "run-regressions"}:
                clean = _run_clean_pair(suite, before)
            if args.command in {"run-regressions", "self-test"}:
                faults = _run_faults(suite, clean, check)
        except Exception as exc:
            error = exc
        receipt = _suite_receipt(args.command, before, clean, faults, error)
        receipt_identity = _write_json(suite / "simulator_receipt.json", receipt)
        inventory = _write_inventory(suite)
        result = {
            "schema_id": "pw-r9-simulator-command-result-v3",
            "status": receipt["status"], "suite": suite.name,
            "qualification_credit": 0,
            "calls": dict(SIMULATOR_CALLS_ZERO),
            "receipt": {"path": "simulator_receipt.json", **receipt_identity},
            "inventory": inventory,
            "stabilization_exit": "NOT_AUTHORIZED_BY_SIMULATOR",
        }
        sys.stdout.buffer.write(_canon(result) + b"\n")
        return 0 if result["status"] == "PASS" else 2
    except Exception as exc:
        result = {
            "schema_id": "pw-r9-simulator-error-v3", "status": "FAIL",
            "qualification_credit": 0,
            "calls": dict(SIMULATOR_CALLS_ZERO),
            "error_type": type(exc).__name__, "error": str(exc),
            "stabilization_exit": "NOT_AUTHORIZED_BY_SIMULATOR",
        }
        sys.stdout.buffer.write(_canon(result) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
