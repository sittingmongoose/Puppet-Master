#!/usr/bin/env python3
"""Synthetic mini-repository for the Event Authority closing path's self-tests.

`build()` writes, under a temporary root, a tiny tree at the real repository
paths: a registry with the live checkpoint's revision and row count, the frozen
audit inputs, admission records, depth assessments, a token-disposition ledger
and an OPEN or CLOSED currentness edition. The helper's real verification code
(`scripts/pm_pnc019_currentness.py`) then runs on it unchanged.

`TAMPERS` lists one mutation per closing predicate with the one refusal that
counts as its kill. Semantic tampers are resealed: every hash, pin and status
field is recomputed over the tampered inputs, as a generator that skipped its
refusal would write them, so only the recomputation can catch them.

Nothing here reads or writes the live repository.
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path
from types import ModuleType
from typing import Any, Callable

TOKEN_LEDGER = "reports/fixture/TOKEN_DISPOSITIONS.jsonl"
DEPTH_REGISTERED = "reports/fixture/depth-registered.json"
DEPTH_ADMITTED = "reports/fixture/depth-admitted.json"
DEPTH_DUPLICATE = "reports/fixture/depth-duplicate.json"
VALIDATOR_STUB = "scripts/pm-event-authority-currentness.py"
EVENTS_DOC = "Plans/fixture_events.md"
# machine inputs, one per derivation route of the required source set
HISTORICAL_INPUT = "Plans/change_budget.schema.json"       # August inventory (a real row of the pinned selector)
INDEX_INPUT = "Plans/fixture_index_input.json"             # Plans/00-plans-index.md
PAYLOAD_INPUT = "Plans/fixture_payload.schema.json"        # registry payload_schema_ref
EXPLICIT_INPUT = "Plans/runtime_integration_disposition.json"  # explicit shared-runtime input
RECEIPT_SCHEMA = "Plans/.implementation_readiness/pnc019_certification_receipt.schema.json"
UNREQUIRED_FILE = "Plans/.implementation_readiness/fixture_unrequired.json"   # selected by no route


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _dump(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True) + "\n").encode()


def _write(root: Path, relative: str, data: Any) -> bytes:
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = data if isinstance(data, bytes) else data.encode() if isinstance(data, str) else _dump(data)
    path.write_bytes(raw)
    return raw


def _read(root: Path, relative: str) -> Any:
    return json.loads((root / relative).read_bytes())


def _jsonl(rows: list[dict[str, Any]]) -> bytes:
    return b"".join(json.dumps(row, sort_keys=True, separators=(",", ":")).encode() + b"\n" for row in rows)


def _names(helper: ModuleType) -> dict[str, Any]:
    total = helper.EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT
    admitted_count = total - 37 - len(helper.EA_AUGUST_PAIR)
    if admitted_count < 2:
        raise ValueError("fixture needs at least two post-August families")
    return {
        "known": [f"fx.known_{i:02d}.recorded" for i in range(37)],
        "august": list(helper.EA_AUGUST_PAIR),
        "admitted": [f"fx.admitted_{i:02d}.recorded" for i in range(admitted_count)],
    }


def _family(event_type: str) -> dict[str, Any]:
    return {
        "event_type": event_type,
        "family_id": "event-family-" + event_type.replace(".", "-").replace("_", "-"),
        "family_revision": "1.0.0",
    }


def _depth_row(family: dict[str, Any], criteria: tuple[str, ...]) -> dict[str, Any]:
    cell = {"status": "PASS", "evidence": [{"path": EVENTS_DOC, "unit": "fixture"}]}
    return {**family, "cells": {name: json.loads(json.dumps(cell)) for name in criteria}}


def _paths(helper: ModuleType) -> dict[str, str]:
    audit = helper.EVENT_AUTHORITY_AUDIT_ROOT
    return {
        "status": helper.EVENT_AUTHORITY_STATUS_REL_PATH,
        "receipt": helper.EVENT_AUTHORITY_RECEIPT_REL_PATH,
        "inventory": helper.EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH,
        "occurrences": helper.EVENT_AUTHORITY_OCCURRENCES_REL_PATH,
        "manifest": helper.EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH,
        "quarantine": helper.EVENT_AUTHORITY_QUARANTINE_LEDGER_REL_PATH,
        "readme": f"{audit}/README.md",
        "evidence": helper.EVENT_AUTHORITY_CLOSURE_EVIDENCE_REL_PATH,
        "frozen_receipt": helper.EVENT_AUTHORITY_FROZEN_CHECK_RECEIPT_REL_PATH,
        "continuity": helper.EVENT_AUTHORITY_CONTINUITY_RECEIPT_REL_PATH,
    }


def _pin(root: Path, relative: str, pointer: str, value: Any) -> dict[str, Any]:
    return {
        "path": relative,
        "sha256": _sha((root / relative).read_bytes()),
        "git_commit": "fixture",
        "json_pointer": pointer,
        "line": None,
        "row_sha256": hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest(),
    }


def _window(root: Path, token: str, relative: str = EVENTS_DOC) -> dict[str, Any]:
    raw = (root / relative).read_bytes()
    lines = raw.decode().splitlines()
    line = next(i for i, text in enumerate(lines, 1) if token in text.replace('"', " ").replace(",", " ").split())
    lo, hi = max(1, line - 1), min(len(lines), line + 1)
    return {"path": relative, "sha256": _sha(raw), "line": line, "context_sha256": _sha(lines[line - 1].strip().encode()),
            "excerpt": "\n".join(lines[lo - 1:hi]), "window_start_line": lo, "window_end_line": hi}


def _token_row(root: Path, helper: ModuleType, token: str, rule: str, occurrence_rows: list[dict[str, Any]], window_doc: str = EVENTS_DOC) -> dict[str, Any]:
    """One row in the S6 classifier's format, with pins the closing check resolves."""
    disposition = next(d for d, (_state, r) in helper.EA_TOKEN_FINAL_DISPOSITIONS.items() if r == rule)
    state = helper.EA_TOKEN_FINAL_DISPOSITIONS[disposition][0]
    pins: list[dict[str, Any]] = []
    if rule == "registered":
        families = _read(root, helper.EVENT_FAMILY_REGISTRY_REL_PATH)["families"]
        index = next(i for i, row in enumerate(families) if row["event_type"] == token)
        pins.append(_pin(root, helper.EVENT_FAMILY_REGISTRY_REL_PATH, f"/families/{index}", families[index]))
    for relative in (helper.EA_CENSUS_ADJUDICATION_REL_PATH, helper.EA_DISPOSITION_LEDGER_REL_PATH):
        rows = [json.loads(line) for line in (root / relative).read_bytes().splitlines() if line.strip()]
        for n, value in enumerate(rows):
            if value.get("event_type") == token:
                pins.append(_pin(root, relative, f"/{n}", value))
    if rule == "recount_outcome":
        rows = _read(root, helper.EA_RECOUNT_OUTCOMES_REL_PATH)["rows"]
        n = next(i for i, value in enumerate(rows) if value["event_type"] == token)
        pins.append(_pin(root, helper.EA_RECOUNT_OUTCOMES_REL_PATH, f"/rows/{n}", rows[n]))
    discovery = next(row["primary_mechanical_classification"] for row in occurrence_rows if row["exact_token"] == token)
    return {
        "exact_token": token, "class": rule, "rule_id": rule, "disposition": disposition, "resolution_state": state,
        "discovery_class": discovery, "occurrence_count": 1, "judgement_reason": None,
        "source_rows": pins + [_window(root, token, window_doc)],
    }


def build(root: Path, helper: ModuleType, *, closed: bool) -> None:
    """Write the synthetic tree and an OPEN or CLOSED edition under `root`."""
    criteria = tuple(helper.EA_DEPTH_CRITERIA)
    root = Path(root)
    names = _names(helper)
    registered = names["known"] + names["august"] + names["admitted"]
    families = [_family(name) for name in registered]
    # an identifier whose only occurrence window is in the registry file, which the
    # registered rows also pin as parsed rows: the two reads must not share a cache
    families[0]["payload_schema_id"] = "pm.fx.known_schema"
    families[0]["payload_owner_doc"] = "Plans/storage-plan.md#eventrecord-owner"
    families[1]["payload_schema_ref"] = {"path": PAYLOAD_INPUT}
    _write(root, helper.EVENT_FAMILY_REGISTRY_REL_PATH, {
        "schema_id": helper.EVENT_FAMILY_REGISTRY_SCHEMA_ID,
        "schema_version": helper.EVENT_FAMILY_REGISTRY_SCHEMA_VERSION,
        "registry_revision": helper.EVENT_FAMILY_REGISTRY_REVISION,
        "families": families,
    })
    # token -> (S6 rule, Plans line naming it); ledger and recount rows below back the non-mechanical ones
    non_events = {
        "cmd.fx.run": ("command_namespace", "The cmd.fx.run command emits nothing."),
        "pm.fx.schema_id": ("identifier_namespace", "Schema pm.fx.schema_id is an identifier; it emits nothing."),
        "fx.manifest.json": ("filename_reference", "The file fx.manifest.json holds the manifest; nothing is appended."),
        "fx.layout_v2": ("version_identifier", "Key fx.layout_v2 is a version tag; nothing is appended."),
        "payload.fx_field": ("field_or_ui_path", "Field payload.fx_field is a payload path; nothing is appended."),
        "fx.cited.thing": ("negative_context_reference", "fx.cited.thing must not emit an EventRecord."),
        "fx.alias.recorded": ("landed_alias", "fx.alias.recorded is an alias; nothing is appended."),
        "fx.holding.recorded": ("holding_quarantine", "fx.holding.recorded stays in the holding bucket; nothing is appended."),
        "fx.cpu_excluded.recorded": ("landed_exclusion", "fx.cpu_excluded.recorded was reclassified; nothing is appended."),
        "fx.excluded68.recorded": ("landed_exclusion", "fx.excluded68.recorded is an excluded July row; nothing is appended."),
        "cmd.fx.legacy": ("landed_exclusion", "cmd.fx.legacy was excluded by its census row; it emits nothing."),
        "fx.recount_x.recorded": ("recount_outcome", "fx.recount_x.recorded was excluded at recount; nothing is appended."),
        "pm.fx.recount_identifier": ("recount_outcome", "pm.fx.recount_identifier was excluded at recount; it emits nothing."),
    }
    window_docs = {"pm.fx.known_schema": helper.EVENT_FAMILY_REGISTRY_REL_PATH}
    events_text = "# Fixture events\n\n" + "".join(f"The {name} event is appended.\n" for name in registered)
    events_text += "".join(line + "\n" for _rule, line in non_events.values())
    _write(root, EVENTS_DOC, events_text)
    _write(root, "Plans/storage-plan.md", "# Storage\n\nEA-27 `{}` union `{}`; EA-29 `{}`.\n".format(
        helper.EA27_CANON_SHA256, helper.EA27_UNION_ROWS_CANON_SHA256, helper.EA29_CANON_SHA256))
    _write(root, "Plans/Plan_To_Node_Compilation.md", "# PNC\n\n- " + helper.EVENT_AUTHORITY_RUNTIME_BOUNDARY_BASIS_QUOTE + "\n")
    _write(root, "Plans/Decision_Log.md", "# Decisions\n\n### DL-900: fixture\n\nNothing here.\n")
    _write(root, RECEIPT_SCHEMA, '{"const": "local_deterministic_clean_room"}\n')
    _write(root, UNREQUIRED_FILE, '{"fixture_unrequired": true}\n')
    _write(root, VALIDATOR_STUB, "# fixture stand-in for the currentness tool\n")
    # the machine-input routes, and derived outputs that every route must leave out
    _write(root, "Plans/00-plans-index.md", f"# Index\n\nMachine inputs: {INDEX_INPUT}, Plans/.plan_index/node_readiness_report.json, Plans/missing_input.json.\n")
    for relative in (INDEX_INPUT, EXPLICIT_INPUT):
        _write(root, relative, {"fixture_machine_input": relative})
    _write(root, HISTORICAL_INPUT, {"type": "object", "additionalProperties": False, "title": "fixture change budget"})
    _write(root, PAYLOAD_INPUT, {"type": "object", "additionalProperties": False})
    for relative in helper.EA_DERIVED_VALIDATION_OUTPUTS:
        _write(root, relative, {"derived_output": relative})
    # The August selector is pinned by bytes, so the fixture uses the real pinned file
    # and gives each of its machine paths a stub; the real pin then runs unchanged.
    selector = (helper.HELPER_REPO_ROOT / helper.EA_HISTORICAL_INVENTORY_REL_PATH).read_bytes()
    if helper.event_authority_selector_pin_problem(selector):
        raise AssertionError("the repository's August selector is not its pinned bytes")
    _write(root, helper.EA_HISTORICAL_INVENTORY_REL_PATH, selector)
    for row in json.loads(selector)["sources"]:
        if not row["path"].endswith(".md") and not (root / row["path"]).exists():
            _write(root, row["path"], {"fixture_stub": True})

    frozen = helper.EA_FROZEN_AUDIT_ROOT
    cohorts = {
        "known37": names["known"],
        "july248_confirmed_persisted_unregistered": [names["admitted"][0], "fx.cpu_excluded.recorded"],
        "july40_unresolved": ["fx.alias.recorded", "fx.holding.recorded"],
        "july68_exact_excluded": ["fx.excluded68.recorded"],
        "july26_non_exact": ["Fx.NonExact"],
        "august2_live_beyond_known37": names["august"],
    }
    _write(root, helper.EA_KNOWN37_REL_PATH, {"count": 37, "event_types": names["known"]})
    _write(root, helper.EA_COHORT_PINS_REL_PATH, {"cohorts": {k: {"count": len(v), "event_types": v} for k, v in cohorts.items()}})
    census = (
        [{"event_type": n, "category": "registered_keep", "disposition": "KEEP_REGISTERED"} for n in names["known"]]
        + [
            {"event_type": names["admitted"][0], "category": "persisted_unregistered_quarantine", "disposition": "KEEP_REGISTERED"},
            {"event_type": "fx.cpu_excluded.recorded", "category": "persisted_unregistered_quarantine", "disposition": "RECLASSIFY_TO_EXCLUDED"},
            {"event_type": "fx.alias.recorded", "category": "alias", "disposition": "RECLASSIFY_ALIAS"},
            {"event_type": "fx.holding.recorded", "category": "quarantined_not_admitted", "disposition": "KEEP_QUARANTINED"},
            {"event_type": "fx.excluded68.recorded", "category": "exact_excluded", "disposition": "CONFIRM_EXACT_EXCLUDE"},
            {"event_type": "cmd.fx.legacy", "category": "exact_excluded", "disposition": "CONFIRM_EXACT_EXCLUDE"},
        ]
    )
    _write(root, helper.EA_CENSUS_ADJUDICATION_REL_PATH, _jsonl(census))
    ledger = (
        [{"event_type": n, "bucket": "august", "disposition": "KEEP_REGISTERED"} for n in names["august"]]
        + [
            {"event_type": names["admitted"][0], "bucket": helper.EA_CPU_BUCKET, "disposition": "KEEP_REGISTERED"},
            {"event_type": "fx.cpu_excluded.recorded", "bucket": helper.EA_CPU_BUCKET, "disposition": "RECLASSIFY_TO_EXCLUDED"},
            {"event_type": "fx.alias.recorded", "bucket": "alias", "disposition": "RECLASSIFY_ALIAS"},
            {"event_type": "fx.holding.recorded", "bucket": "quarantined_not_admitted", "disposition": "KEEP_QUARANTINED"},
        ]
    )
    _write(root, helper.EA_DISPOSITION_LEDGER_REL_PATH, _jsonl(ledger))
    for name, relative in helper.EA_FROZEN_RECEIPT_PIN_PATHS.items():
        if not (root / relative).exists():
            _write(root, relative, {"fixture_input": name})
    recount_names = sorted([names["admitted"][1], "fx.recount_x.recorded", "pm.fx.recount_identifier"])
    _write(root, helper.EA_RECOUNT_LIST_REL_PATH, [{"name": n} for n in recount_names])
    _write(root, helper.EA_RECOUNT_RECEIPT_REL_PATH, {"fixture": "recount receipt"})
    _write(root, helper.EA_RECOUNT_CHANGE_RECEIPT_REL_PATH, {"fixture": "recount change receipt"})
    _write(root, helper.EA_RECOUNT_OUTCOMES_REL_PATH, {
        "schema_id": helper.EA_RECOUNT_OUTCOMES_SCHEMA_ID,
        "rows": [{"event_type": n, "outcome": "registered" if n == names["admitted"][1] else "excluded"} for n in recount_names],
    })
    _write(root, helper.EA_FROZEN_VALIDATOR_REL_PATH, "# frozen validator stand-in\nRECOUNT_RECEIPT_SHA = \"{}\"  # declared pin\nRECOUNT_LIST_SHA = \"{}\"  # declared pin\n".format(
        _sha((root / helper.EA_RECOUNT_RECEIPT_REL_PATH).read_bytes()), _sha((root / helper.EA_RECOUNT_LIST_REL_PATH).read_bytes())))
    _write(root, helper.EA_FROZEN_RECEIPT_DIR_REL_PATH + "/event_authority_validator_receipt.json", "{}\n")

    by_name = {f["event_type"]: f for f in families}
    _write(root, DEPTH_REGISTERED, {"rows": [_depth_row(by_name[n], criteria) for n in names["known"] + names["august"]]})
    depth_admitted = _write(root, DEPTH_ADMITTED, {"rows": [_depth_row(by_name[n], criteria) for n in names["admitted"]]})
    for name in names["admitted"]:
        _write(root, f"{helper.EA_ADMISSION_RECORD_DIR_REL_PATH}/{name}.json", {
            "event_type": name,
            "family_id": by_name[name]["family_id"],
            "registry_row_sha256": helper._canonical_sha256(by_name[name]),
            "depth_assessment": {"path": DEPTH_ADMITTED, "sha256": _sha(depth_admitted)},
        })

    rules = {name: "registered" for name in registered}
    rules.update({name: rule for name, (rule, _line) in non_events.items()})
    rules["pm.fx.known_schema"] = "identifier_namespace"
    paths = _paths(helper)
    occurrence_rows, occurrences = _census(root, helper)
    unexpected = sorted({row["exact_token"] for row in occurrence_rows} - set(rules))
    missing = sorted(set(rules) - {row["exact_token"] for row in occurrence_rows})
    if unexpected or missing:
        raise AssertionError(f"fixture census differs from its design: unexpected {unexpected}, missing {missing}")
    discovery = {row["exact_token"]: row["primary_mechanical_classification"] for row in occurrence_rows}
    if discovery["fx.cited.thing"] != "explicit_non_event_or_forbidden_family" or discovery["fx.layout_v2"] == "explicit_non_event_or_forbidden_family":
        raise AssertionError(f"fixture census classes differ from the context-rule design: {discovery}")
    _write(root, paths["occurrences"], occurrences)
    _write(root, TOKEN_LEDGER, _jsonl([
        _token_row(root, helper, row["exact_token"], rules[row["exact_token"]], occurrence_rows, window_docs.get(row["exact_token"], EVENTS_DOC))
        for row in occurrence_rows
    ]))
    _write(root, f"{helper.EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/EXPECTED_252_EVENT_TYPES.tsv", "".join(f"fx.quarantined_{i:03d}.recorded\n" for i in range(252)))
    for group in "abcdefg":
        _write(root, f"{helper.EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/source_groups/group_{group}.jsonl", _jsonl([{"group": group}]))

    _write(root, paths["manifest"], {
        "union": {"row_count": 252, "unique_event_type_count": 252, "quarantined_row_count": 252, "exact_set_equality": True},
        "bulk_registration": False,
        "complete_denominator_known": False,
        "contract_depth_complete": False,
    })
    _write(root, paths["quarantine"], _jsonl([
        {"event_type": f"fx.quarantined_{i:03d}.recorded", "audit_disposition": "KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE"}
        for i in range(252)
    ]))
    _write(root, paths["readme"], "# fixture edition\n")
    open_status = {
        "schema_id": "pm.event_authority.denominator_currentness_status.v1",
        "status": "UNKNOWN_OPEN",
        "closed": False,
        "complete_denominator_known": False,
        "contract_depth_complete": False,
        "build_or_pnc019_authority": False,
        "registry": {},
        "depth": {"status": "INCOMPLETE", "fresh_live_depth_rows_materialized": 0},
        "row_local_quarantine": {"row_count": 252, "unique_event_type_count": 252, "bulk_registration": False},
        "closure_blockers": list(helper.EVENT_AUTHORITY_OPEN_CLOSURE_BLOCKERS),
    }
    _write(root, paths["status"], open_status)
    if closed:
        _write(root, paths["frozen_receipt"], _frozen_receipt(root, helper))
        _write(root, paths["continuity"], {
            "schema_id": helper.EA_CONTINUITY_RECEIPT_SCHEMA_ID,
            "ea27": {"logical_name": helper.EA27_LOGICAL_NAME, "sha256": helper.EA27_CANON_SHA256},
            "ea29": {"logical_name": helper.EA29_LOGICAL_NAME, "sha256": helper.EA29_CANON_SHA256},
            "union_rows_sha256_recomputed": helper.EA27_UNION_ROWS_CANON_SHA256,
            "cohorts": {k: sorted(v) for k, v in cohorts.items() if k in helper.EA_CONTINUITY_COHORTS},
            "exact_row_count": sum(len(cohorts[k]) for k in helper.EA_CONTINUITY_COHORTS[:4]),
            "non_exact_row_count": len(cohorts["july26_non_exact"]),
        })
    reseal(root, helper, closed=closed, refresh_frozen=False)
    if closed:
        failures = helper.event_authority_audit_failures(root)
        if failures:
            raise AssertionError(f"pristine CLOSED fixture does not verify: {failures}")


def _required_sources(root: Path, helper: ModuleType) -> dict[str, str]:
    """The required source set over whatever selector bytes are on disk, without the pin check.

    This is the resealer standing in for a writer that skipped its refusals; the
    CLOSED consumer under test always applies the pin.
    """
    selector = (root / helper.EA_HISTORICAL_INVENTORY_REL_PATH).read_bytes()
    machine = helper.event_authority_machine_inputs_from_selector(root, selector) - set(helper.EA_DERIVED_VALIDATION_OUTPUTS)
    required = {path: helper.EA_MACHINE_INPUT_CLASS for path in machine}
    required.update({p.relative_to(root).as_posix(): helper.EA_DIRECT_PROSE_CLASS for p in (root / "Plans").glob("*.md") if p.is_file()})
    return required


def _census(root: Path, helper: ModuleType) -> tuple[list[dict[str, Any]], bytes]:
    """The fixture's occurrence census, by the same code the generator and the CLOSED consumer use."""
    required = _required_sources(root, helper)
    sources = {path: (root / path).read_bytes() for path in required}
    registered = {row["event_type"] for row in _read(root, helper.EVENT_FAMILY_REGISTRY_REL_PATH)["families"]}
    rows = helper.event_authority_census_rows(sources, registered)
    return rows, helper.event_authority_census_blob(rows)


def _frozen_receipt(root: Path, helper: ModuleType) -> dict[str, Any]:
    registry = _read(root, helper.EVENT_FAMILY_REGISTRY_REL_PATH)
    live = {f["event_type"] for f in registry["families"]}
    known = set(_read(root, helper.EA_KNOWN37_REL_PATH)["event_types"])
    pins = {name: helper._sha_rel(root, rel) for name, rel in helper.EA_FROZEN_RECEIPT_PIN_PATHS.items()}
    return {
        "schema_id": helper.EA_FROZEN_RECEIPT_SCHEMA_ID,
        "validator_id": helper.EA_FROZEN_VALIDATOR_ID,
        "validator_path": helper.EA_FROZEN_VALIDATOR_REL_PATH,
        "pass": True,
        "complete_denominator_known": True,
        "contract_depth_complete": True,
        "bulk_registration_allowed": False,
        "failures": [],
        "counts": {"fresh_denominator_closed": True},
        "input_pins": pins,
        "named_checks": {
            "seal_prerequisites_met": True,
            "post_august_admitted": sorted(live - known - set(helper.EA_AUGUST_PAIR)),
            "recount": {
                "complete": True,
                "outcomes": {"outcomes_sha256": helper._sha_rel(root, helper.EA_RECOUNT_OUTCOMES_REL_PATH)},
                "change_receipt_sha256": helper._sha_rel(root, helper.EA_RECOUNT_CHANGE_RECEIPT_REL_PATH),
            },
        },
    }


def reseal(
    root: Path,
    helper: ModuleType,
    *,
    closed: bool = True,
    refresh_frozen: bool = True,
    declared: list[str] | None = None,
    frozen_override: Callable[[dict[str, Any]], None] | None = None,
    recensus: bool = True,
) -> None:
    """Rewrite every hash, pin and status field over the current inputs, as the generator would."""
    paths = _paths(helper)
    registry_raw = (root / helper.EVENT_FAMILY_REGISTRY_REL_PATH).read_bytes()
    registry = json.loads(registry_raw)
    live = sorted(f["event_type"] for f in registry["families"])
    sources = []
    for path, authority_class in sorted(_required_sources(root, helper).items()):
        raw = (root / path).read_bytes()
        sources.append({"path": path, "authority_class": authority_class, "bytes": len(raw), "sha256": _sha(raw)})
    _write(root, paths["inventory"], {"sources": sources, "explicit_exclusions": helper.EA_SOURCE_EXCLUSIONS})
    if recensus:
        _write(root, paths["occurrences"], _census(root, helper)[1])
    status = _read(root, paths["status"])
    status["registry"] = {
        "path": helper.EVENT_FAMILY_REGISTRY_REL_PATH,
        "sha256": _sha(registry_raw),
        "revision": registry["registry_revision"],
        "live_family_count": len(live),
        "event_types_sha256": _sha(("\n".join(live) + "\n").encode()),
    }
    artifacts = [path for path in helper.EA_EDITION_ARTIFACT_REL_PATHS if path not in helper.EVENT_AUTHORITY_CLOSURE_ARTIFACT_REL_PATHS]
    receipt: dict[str, Any] = {
        "validator_path": VALIDATOR_STUB,
        "validator_sha256": _sha((root / VALIDATOR_STUB).read_bytes()),
        "evidence_valid": True,
        "event_authority_closed": False,
    }
    if closed:
        if refresh_frozen:
            frozen = _frozen_receipt(root, helper)
            if frozen_override is not None:
                frozen_override(frozen)
            _write(root, paths["frozen_receipt"], frozen)
        frozen_raw = (root / paths["frozen_receipt"]).read_bytes()
        continuity_raw = (root / paths["continuity"]).read_bytes()
        if (root / paths["evidence"]).exists():
            stored = _read(root, paths["evidence"])
            declared = stored["depth"]["declared_assessments"] if declared is None else declared
        declared = [DEPTH_REGISTERED] if declared is None else declared
        evidence, _failures = helper.compute_closure_evidence(
            root,
            token_ledger_path=TOKEN_LEDGER,
            depth_assessment_paths=declared,
            frozen_receipt=json.loads(frozen_raw),
            frozen_receipt_sha256=_sha(frozen_raw),
            frozen_validator_sha256=_sha((root / helper.EA_FROZEN_VALIDATOR_REL_PATH).read_bytes()),
            recount_source_map=None,
            continuity_receipt=json.loads(continuity_raw),
            continuity_receipt_sha256=_sha(continuity_raw),
            occurrences_raw=(root / paths["occurrences"]).read_bytes(),
        )
        if not evidence:
            raise AssertionError(f"fixture closure inputs unreadable: {_failures}")
        evidence_raw = _write(root, paths["evidence"], evidence)
        status = helper.build_closed_status(status, evidence, _sha(evidence_raw))
        artifacts = list(helper.EA_EDITION_ARTIFACT_REL_PATHS)
        receipt.update({"event_authority_closed": True, "separate_claims": dict(helper.EVENT_AUTHORITY_SEPARATE_CLAIMS)})
    _write(root, paths["status"], status)
    receipt["artifact_hashes"] = {p: _sha((root / p).read_bytes()) for p in artifacts}
    _write(root, paths["receipt"], receipt)


def _edit_json(root: Path, relative: str, change: Callable[[Any], None]) -> None:
    value = _read(root, relative)
    change(value)
    _write(root, relative, value)


def _edit_jsonl(root: Path, relative: str, change: Callable[[list[dict[str, Any]]], None]) -> None:
    rows = [json.loads(line) for line in (root / relative).read_bytes().splitlines() if line.strip()]
    change(rows)
    _write(root, relative, _jsonl(rows))


def _refresh_artifact(root: Path, helper: ModuleType, relative: str) -> None:
    paths = _paths(helper)
    receipt = _read(root, paths["receipt"])
    receipt["artifact_hashes"][relative] = _sha((root / relative).read_bytes())
    _write(root, paths["receipt"], receipt)


def _set_row(rows: list[dict[str, Any]], key: str, value: str, **changes: Any) -> None:
    for row in rows:
        if row.get(key) == value:
            row.update(changes)
            return
    raise KeyError(value)


def _t_cpu_row_reopened(root: Path, h: ModuleType) -> None:
    _edit_jsonl(root, h.EA_DISPOSITION_LEDGER_REL_PATH, lambda rows: _set_row(rows, "event_type", "fx.cpu_excluded.recorded", disposition="KEEP_QUARANTINED"))
    reseal(root, h)


def _t_recount_card_open(root: Path, h: ModuleType) -> None:
    def change(doc: dict[str, Any]) -> None:
        for row in doc["rows"]:
            if row["event_type"] == "fx.recount_x.recorded":
                row["outcome"] = "decision_card"
    _edit_json(root, h.EA_RECOUNT_OUTCOMES_REL_PATH, change)
    reseal(root, h)


def _t_admission_record_removed(root: Path, h: ModuleType) -> None:
    name = _names(h)["admitted"][-1]
    (root / f"{h.EA_ADMISSION_RECORD_DIR_REL_PATH}/{name}.json").unlink()
    reseal(root, h)


def _t_depth_cell_partial(root: Path, h: ModuleType) -> None:
    def change(doc: dict[str, Any]) -> None:
        doc["rows"][0]["cells"]["producer"]["status"] = "PARTIAL"
    _edit_json(root, DEPTH_REGISTERED, change)
    reseal(root, h)


def _t_depth_cell_uncited(root: Path, h: ModuleType) -> None:
    def change(doc: dict[str, Any]) -> None:
        # an existing file outside Plans/: only the canonical-Plans rule refuses it
        doc["rows"][0]["cells"]["retention"]["evidence"] = [{"path": DEPTH_ADMITTED}]
    _edit_json(root, DEPTH_REGISTERED, change)
    reseal(root, h)


def _t_depth_row_missing(root: Path, h: ModuleType) -> None:
    _edit_json(root, DEPTH_REGISTERED, lambda doc: doc["rows"].pop(1))
    reseal(root, h)


def _t_depth_row_ambiguous(root: Path, h: ModuleType) -> None:
    first = _read(root, DEPTH_REGISTERED)["rows"][0]
    _write(root, DEPTH_DUPLICATE, {"rows": [first]})
    reseal(root, h, declared=[DEPTH_REGISTERED, DEPTH_DUPLICATE])


def _t_successor_without_regrade(root: Path, h: ModuleType) -> None:
    def change(doc: dict[str, Any]) -> None:
        doc["families"][0]["family_revision"] = "2.0.0"
    _edit_json(root, h.EVENT_FAMILY_REGISTRY_REL_PATH, change)
    reseal(root, h)


def _relabel(root: Path, h: ModuleType, token: str, disposition: str) -> None:
    state, rule = h.EA_TOKEN_FINAL_DISPOSITIONS.get(disposition, ("judgement", "judgement_residue"))
    _edit_jsonl(root, TOKEN_LEDGER, lambda rows: _set_row(rows, "exact_token", token, disposition=disposition, resolution_state=state, rule_id=rule, **{"class": rule}))
    reseal(root, h)


def _t_token_uncovered(root: Path, h: ModuleType) -> None:
    _edit_jsonl(root, TOKEN_LEDGER, lambda rows: rows.__setitem__(slice(None), [r for r in rows if r["exact_token"] != "fx.cited.thing"]))
    reseal(root, h)


def _t_token_disposition_open(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.cited.thing", "OWNER_REVIEW_REQUIRED")


def _t_token_disposition_unknown(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.cited.thing", "NON_EVENT_BY_ASSERTION")


def _t_token_rule_mismatch(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.cited.thing", "NON_EVENT_COMMAND_REFERENCE")


def _t_token_registered_excluded(root: Path, h: ModuleType) -> None:
    _relabel(root, h, _names(h)["known"][0], "EXCLUDED_BY_LANDED_ROW")


def _t_token_precedence_ledger(root: Path, h: ModuleType) -> None:
    # lexically a command, but a landed census row excludes it: the ledger row must decide
    _relabel(root, h, "cmd.fx.legacy", "NON_EVENT_COMMAND_REFERENCE")


def _t_token_precedence_recount(root: Path, h: ModuleType) -> None:
    # lexically an identifier, but it is a recount name: its recount outcome must decide
    _relabel(root, h, "pm.fx.recount_identifier", "NON_EVENT_IDENTIFIER_REFERENCE")


def _edit_token(root: Path, h: ModuleType, token: str, change: Callable[[dict[str, Any]], None]) -> None:
    def apply(rows: list[dict[str, Any]]) -> None:
        change(next(row for row in rows if row["exact_token"] == token))
    _edit_jsonl(root, TOKEN_LEDGER, apply)
    reseal(root, h)


def _drop_pins(path: str) -> Callable[[dict[str, Any]], None]:
    return lambda row: row.__setitem__("source_rows", [pin for pin in row["source_rows"] if pin.get("path") != path])


def _t_token_rule_id_mismatch(root: Path, h: ModuleType) -> None:
    _edit_token(root, h, "fx.cited.thing", lambda row: row.__setitem__("rule_id", "command_namespace"))


def _t_token_registered_unpinned(root: Path, h: ModuleType) -> None:
    _edit_token(root, h, _names(h)["known"][0], _drop_pins(h.EVENT_FAMILY_REGISTRY_REL_PATH))


def _t_token_ledger_unpinned(root: Path, h: ModuleType) -> None:
    # an exclusion with no landed row: an empty pin set grants every disposition subset,
    # so only the "a cited row names the token" requirement refuses it
    def change(row: dict[str, Any]) -> None:
        row["source_rows"] = [pin for pin in row["source_rows"] if "window_start_line" in pin]
    _edit_token(root, h, "fx.excluded68.recorded", change)


def _t_token_recount_unpinned(root: Path, h: ModuleType) -> None:
    _edit_token(root, h, "fx.recount_x.recorded", _drop_pins(h.EA_RECOUNT_OUTCOMES_REL_PATH))


def _t_token_alias_called_excluded(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.alias.recorded", "EXCLUDED_BY_LANDED_ROW")


def _t_token_holding_called_alias(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.holding.recorded", "ALIAS_ONLY_NOT_ADMITTED")


def _t_token_exclusion_called_holding(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.cpu_excluded.recorded", "HOLDING_QUARANTINE_OUTSIDE_D")


def _t_token_window_wrong(root: Path, h: ModuleType) -> None:
    other = _window(root, "fx.alias.recorded")

    def change(row: dict[str, Any]) -> None:
        row["source_rows"] = [pin for pin in row["source_rows"] if "window_start_line" not in pin] + [other]
    _edit_token(root, h, "cmd.fx.run", change)


def _t_token_context_mismatch(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.layout_v2", "NON_EVENT_NEGATIVE_CONTEXT_REFERENCE")


def _t_token_pin_row_hash(root: Path, h: ModuleType) -> None:
    def change(row: dict[str, Any]) -> None:
        pin = next(pin for pin in row["source_rows"] if pin.get("path") == h.EA_DISPOSITION_LEDGER_REL_PATH)
        pin["row_sha256"] = "0" * 64
    _edit_token(root, h, "fx.alias.recorded", change)


def _t_token_ledger_stale(root: Path, h: ModuleType) -> None:
    # a Plans document changed after the S6 ledger pinned its occurrence windows
    path = root / EVENTS_DOC
    path.write_bytes(path.read_bytes() + b"A later owner edit.\n")
    reseal(root, h)


def _t_continuity_cohort_mismatch(root: Path, h: ModuleType) -> None:
    _edit_json(root, _paths(h)["continuity"], lambda doc: doc["cohorts"]["july248_confirmed_persisted_unregistered"].pop())
    reseal(root, h)


def _t_continuity_cohort_swapped(root: Path, h: ModuleType) -> None:
    # same count, different member: only the cohort-set equality refuses it
    def change(doc: dict[str, Any]) -> None:
        cohort = doc["cohorts"]["july248_confirmed_persisted_unregistered"]
        cohort[-1] = "fx.not_pinned.recorded"
        cohort.sort()
    _edit_json(root, _paths(h)["continuity"], change)
    reseal(root, h)


def _t_continuity_pin_mismatch(root: Path, h: ModuleType) -> None:
    _edit_json(root, _paths(h)["continuity"], lambda doc: doc["ea27"].__setitem__("sha256", "f" * 64))
    reseal(root, h)


def _t_continuity_unmapped_row(root: Path, h: ModuleType) -> None:
    _edit_json(root, _paths(h)["continuity"], lambda doc: doc.__setitem__("unmapped_rows", ["fx.invented_class.recorded"]))
    reseal(root, h)


def _t_frozen_check_failing(root: Path, h: ModuleType) -> None:
    def override(frozen: dict[str, Any]) -> None:
        frozen["pass"] = False
        frozen["failures"] = [{"error": "registered_contract_depth_incomplete"}]
    reseal(root, h, frozen_override=override)


def _t_frozen_admitted_set(root: Path, h: ModuleType) -> None:
    reseal(root, h, frozen_override=lambda frozen: frozen["named_checks"]["post_august_admitted"].pop())


def _t_runtime_basis_removed(root: Path, h: ModuleType) -> None:
    _write(root, "Plans/Plan_To_Node_Compilation.md", "# PNC\n\nRuntime readiness is out of scope.\n")
    reseal(root, h)


def _t_runtime_boundary_claimed(root: Path, h: ModuleType) -> None:
    status = _paths(h)["status"]
    _edit_json(root, status, lambda doc: doc["runtime_producer_conformance"].__setitem__("status", "PASS"))
    _refresh_artifact(root, h, status)


def _t_receipt_says_open(root: Path, h: ModuleType) -> None:
    _edit_json(root, _paths(h)["receipt"], lambda doc: doc.__setitem__("event_authority_closed", False))


def _t_closure_artifact_unbound(root: Path, h: ModuleType) -> None:
    _edit_json(root, _paths(h)["receipt"], lambda doc: doc["artifact_hashes"].pop(_paths(h)["continuity"]))


def _t_status_unknown_state(root: Path, h: ModuleType) -> None:
    status = _paths(h)["status"]
    _edit_json(root, status, lambda doc: doc.__setitem__("status", "CLOSED_PENDING"))
    _refresh_artifact(root, h, status)


def _t_bound_input_drift(root: Path, h: ModuleType) -> None:
    path = root / h.EA_FROZEN_RECEIPT_PIN_PATHS["census_partition_sha256"]
    path.write_bytes(path.read_bytes() + b" ")


def _t_bound_input_added(root: Path, h: ModuleType) -> None:
    _write(root, f"{h.EA_ADMISSION_RECORD_DIR_REL_PATH}/notes.txt", "late addition\n")


def _t_frozen_validator_drift(root: Path, h: ModuleType) -> None:
    path = root / h.EA_FROZEN_VALIDATOR_REL_PATH
    path.write_bytes(path.read_bytes() + b"# edited\n")


def _t_evidence_unavailable(root: Path, h: ModuleType) -> None:
    (root / _paths(h)["evidence"]).unlink()


def _t_evidence_edited_in_place(root: Path, h: ModuleType) -> None:
    paths = _paths(h)
    _edit_json(root, paths["evidence"], lambda doc: doc["denominator"].__setitem__("cpu_open_rows", 0 if doc["denominator"]["cpu_open_rows"] else 1))
    evidence_sha = _sha((root / paths["evidence"]).read_bytes())
    _edit_json(root, paths["status"], lambda doc: doc["closure_evidence"].__setitem__("sha256", evidence_sha))
    _refresh_artifact(root, h, paths["evidence"])
    _refresh_artifact(root, h, paths["status"])


def _edit_inventory(root: Path, h: ModuleType, change: Callable[[dict[str, Any]], None]) -> None:
    """Edit the edition's inventory and re-bind it in VALIDATOR_RECEIPT.json (the omit-and-re-bind route)."""
    _edit_json(root, _paths(h)["inventory"], change)
    _refresh_artifact(root, h, _paths(h)["inventory"])


def _drop_source(path: str) -> Callable[[dict[str, Any]], None]:
    return lambda doc: doc.__setitem__("sources", [row for row in doc["sources"] if row["path"] != path])


def _t_inventory_omits_machine_input(root: Path, h: ModuleType) -> None:
    # the reviewer's R1: leave an index-registered machine input out, re-bind, then let it drift
    _edit_inventory(root, h, _drop_source(INDEX_INPUT))
    _write(root, INDEX_INPUT, {"tampered_schema": True})


def _t_inventory_omits_registry_input(root: Path, h: ModuleType) -> None:
    _edit_inventory(root, h, _drop_source(PAYLOAD_INPUT))
    _write(root, PAYLOAD_INPUT, {"tampered_schema": True})


def _t_inventory_omits_historical_input(root: Path, h: ModuleType) -> None:
    _edit_inventory(root, h, _drop_source(HISTORICAL_INPUT))
    _write(root, HISTORICAL_INPUT, {"tampered_schema": True})


def _t_inventory_omits_plans_doc(root: Path, h: ModuleType) -> None:
    _edit_inventory(root, h, _drop_source("Plans/Decision_Log.md"))


def _t_inventory_path_substituted(root: Path, h: ModuleType) -> None:
    # a required row replaced by another file's path, size and hash: internally consistent, wrong file
    raw = (root / UNREQUIRED_FILE).read_bytes()

    def change(doc: dict[str, Any]) -> None:
        row = next(row for row in doc["sources"] if row["path"] == PAYLOAD_INPUT)
        row.update({"path": UNREQUIRED_FILE, "bytes": len(raw), "sha256": _sha(raw)})
    _edit_inventory(root, h, change)
    _write(root, PAYLOAD_INPUT, {"tampered_schema": True})


def _t_inventory_extra_derived_row(root: Path, h: ModuleType) -> None:
    # the derived PNC-019 receipt put back into the inventory (the finding-3 cycle)
    relative = "Plans/.implementation_readiness/pnc019_certification_receipt.json"
    raw = (root / relative).read_bytes()
    _edit_inventory(root, h, lambda doc: doc["sources"].append(
        {"path": relative, "authority_class": "registered_machine_input", "bytes": len(raw), "sha256": _sha(raw)}))


def _t_inventory_reclassed(root: Path, h: ModuleType) -> None:
    def change(doc: dict[str, Any]) -> None:
        next(row for row in doc["sources"] if row["path"] == HISTORICAL_INPUT)["authority_class"] = "direct_canonical_plan_prose"
    _edit_inventory(root, h, change)


def _t_inventory_exclusions_edited(root: Path, h: ModuleType) -> None:
    _edit_inventory(root, h, lambda doc: doc.__setitem__(
        "explicit_exclusions", [row for row in doc["explicit_exclusions"] if "pnc019_certification_receipt" not in row["pattern"]]))


def _t_census_token_omitted(root: Path, h: ModuleType) -> None:
    # the reviewer's note: a token dropped from the census and the S6 ledger together, re-bound
    _edit_jsonl(root, _paths(h)["occurrences"], lambda rows: rows.__setitem__(slice(None), [r for r in rows if r["exact_token"] != "cmd.fx.legacy"]))
    _edit_jsonl(root, TOKEN_LEDGER, lambda rows: rows.__setitem__(slice(None), [r for r in rows if r["exact_token"] != "cmd.fx.legacy"]))
    reseal(root, h, recensus=False)


def _t_artifact_entry_omitted(root: Path, h: ModuleType) -> None:
    paths = _paths(h)
    _edit_json(root, paths["receipt"], lambda doc: doc["artifact_hashes"].pop(paths["readme"]))
    _write(root, paths["readme"], "# an unbound README\n")


def _t_artifact_entry_extra(root: Path, h: ModuleType) -> None:
    paths = _paths(h)
    _edit_json(root, paths["receipt"], lambda doc: doc["artifact_hashes"].__setitem__(EVENTS_DOC, _sha((root / EVENTS_DOC).read_bytes())))


def _t_token_ledger_pin_omitted(root: Path, h: ModuleType) -> None:
    # a conflicting landed row is left out of the token's citations
    _edit_jsonl(root, h.EA_CENSUS_ADJUDICATION_REL_PATH, lambda rows: _set_row(rows, "event_type", "fx.alias.recorded", disposition="KEEP_QUARANTINED"))
    _edit_token(root, h, "fx.alias.recorded", _drop_pins(h.EA_CENSUS_ADJUDICATION_REL_PATH))


def _t_token_ledger_rule_without_row(root: Path, h: ModuleType) -> None:
    _relabel(root, h, "fx.layout_v2", "EXCLUDED_BY_LANDED_ROW")


def _t_recount_name_dropped(root: Path, h: ModuleType) -> None:
    # a recount name dropped from the list and its outcomes together, its token relabelled
    name = "pm.fx.recount_identifier"
    _write(root, h.EA_RECOUNT_LIST_REL_PATH, [row for row in _read(root, h.EA_RECOUNT_LIST_REL_PATH) if row["name"] != name])
    _edit_json(root, h.EA_RECOUNT_OUTCOMES_REL_PATH, lambda doc: doc.__setitem__("rows", [r for r in doc["rows"] if r["event_type"] != name]))
    def change(row: dict[str, Any]) -> None:
        row.update(disposition="NON_EVENT_IDENTIFIER_REFERENCE", resolution_state="mechanical", rule_id="identifier_namespace", **{"class": "identifier_namespace"})
        row["source_rows"] = [pin for pin in row["source_rows"] if "window_start_line" in pin]
    _edit_token(root, h, name, change)


def _t_known37_family_added(root: Path, h: ModuleType) -> None:
    # a post-August family moved into Known37 so it needs no admission record
    name = _names(h)["admitted"][-1]
    _edit_json(root, h.EA_KNOWN37_REL_PATH, lambda doc: (doc["event_types"].append(name), doc.__setitem__("count", len(doc["event_types"]))))
    (root / f"{h.EA_ADMISSION_RECORD_DIR_REL_PATH}/{name}.json").unlink()
    reseal(root, h)


def _edit_selector(root: Path, h: ModuleType, change: Callable[[dict[str, Any]], None], *, indent: int = 2) -> None:
    path = root / h.EA_HISTORICAL_INVENTORY_REL_PATH
    doc = json.loads(path.read_bytes())
    change(doc)
    path.write_text(json.dumps(doc, indent=indent) + "\n", encoding="utf-8")


def _t_historical_selector_row_dropped(root: Path, h: ModuleType) -> None:
    # the reviewer's R1-F1: drop a machine input from the August selector, let it drift,
    # and rebuild inventory, census and evidence over the edited selector
    _edit_selector(root, h, lambda doc: doc.__setitem__("sources", [r for r in doc["sources"] if r["path"] != HISTORICAL_INPUT]))
    _write(root, HISTORICAL_INPUT, {"tampered_schema": True})
    reseal(root, h)


def _t_historical_selector_row_added(root: Path, h: ModuleType) -> None:
    _edit_selector(root, h, lambda doc: doc["sources"].append({"path": UNREQUIRED_FILE}))
    reseal(root, h)


def _t_historical_selector_reserialized(root: Path, h: ModuleType) -> None:
    # the same rows in other bytes: the pin is on bytes, not on a reading of them
    _edit_selector(root, h, lambda doc: None, indent=1)
    reseal(root, h)


# name -> (mutation, the one refusal that counts as its kill, predicate group)
TAMPERS: dict[str, tuple[Callable[[Path, ModuleType], None], str, str]] = {
    "cpu_row_reopened": (_t_cpu_row_reopened, "event_authority_closure_cpu_rows_open", "denominator"),
    "recount_card_open": (_t_recount_card_open, "event_authority_closure_recount_decision_cards_open", "denominator"),
    "admission_record_removed": (_t_admission_record_removed, "event_authority_closure_denominator_registry_mismatch", "denominator"),
    "frozen_check_failing": (_t_frozen_check_failing, "event_authority_closure_frozen_check_not_passing", "frozen_check"),
    "frozen_admitted_set": (_t_frozen_admitted_set, "event_authority_closure_frozen_admitted_set_mismatch", "frozen_check"),
    "frozen_validator_drift": (_t_frozen_validator_drift, "event_authority_closure_frozen_validator_drift", "frozen_check"),
    "depth_cell_partial": (_t_depth_cell_partial, "event_authority_closure_depth_incomplete", "depth"),
    "depth_cell_uncited": (_t_depth_cell_uncited, "event_authority_closure_depth_incomplete", "depth"),
    "depth_row_missing": (_t_depth_row_missing, "event_authority_closure_depth_row_missing", "depth"),
    "depth_row_ambiguous": (_t_depth_row_ambiguous, "event_authority_closure_depth_row_ambiguous", "depth"),
    "successor_without_regrade": (_t_successor_without_regrade, "event_authority_closure_depth_row_missing", "depth"),
    "token_uncovered": (_t_token_uncovered, "event_authority_closure_token_coverage_mismatch", "token_ledger"),
    "token_rule_mismatch": (_t_token_rule_mismatch, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_registered_excluded": (_t_token_registered_excluded, "event_authority_closure_token_registry_mismatch", "token_ledger"),
    "token_ledger_stale": (_t_token_ledger_stale, "event_authority_closure_token_ledger_stale", "token_ledger"),
    "token_disposition_open": (_t_token_disposition_open, "event_authority_closure_token_disposition_open", "token_ledger"),
    "token_disposition_unknown": (_t_token_disposition_unknown, "event_authority_closure_token_disposition_invalid", "token_ledger"),
    "token_precedence_ledger": (_t_token_precedence_ledger, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_precedence_recount": (_t_token_precedence_recount, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_rule_id_mismatch": (_t_token_rule_id_mismatch, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_registered_unpinned": (_t_token_registered_unpinned, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_ledger_unpinned": (_t_token_ledger_unpinned, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_recount_unpinned": (_t_token_recount_unpinned, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_alias_called_excluded": (_t_token_alias_called_excluded, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_holding_called_alias": (_t_token_holding_called_alias, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_exclusion_called_holding": (_t_token_exclusion_called_holding, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_window_wrong": (_t_token_window_wrong, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_context_mismatch": (_t_token_context_mismatch, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_pin_row_hash": (_t_token_pin_row_hash, "event_authority_closure_token_ledger_stale", "token_ledger"),
    "continuity_cohort_mismatch": (_t_continuity_cohort_mismatch, "event_authority_closure_continuity_cohort_mismatch", "continuity"),
    "continuity_cohort_swapped": (_t_continuity_cohort_swapped, "event_authority_closure_continuity_cohort_mismatch", "continuity"),
    "continuity_pin_mismatch": (_t_continuity_pin_mismatch, "event_authority_closure_continuity_pin_mismatch", "continuity"),
    "continuity_unmapped_row": (_t_continuity_unmapped_row, "event_authority_closure_continuity_cohort_mismatch", "continuity"),
    "runtime_basis_removed": (_t_runtime_basis_removed, "event_authority_closure_runtime_boundary_basis_missing", "runtime_boundary"),
    "runtime_boundary_claimed": (_t_runtime_boundary_claimed, "event_authority_currentness_status_closure_inconsistent", "runtime_boundary"),
    "receipt_says_open": (_t_receipt_says_open, "event_authority_currentness_receipt_closure_mismatch", "edition_binding"),
    "closure_artifact_unbound": (_t_closure_artifact_unbound, "event_authority_currentness_artifact_set_mismatch", "edition_binding"),
    "status_unknown_state": (_t_status_unknown_state, "event_authority_currentness_status_not_unknown_open", "edition_binding"),
    "evidence_unavailable": (_t_evidence_unavailable, "event_authority_closure_evidence_unavailable", "edition_binding"),
    "evidence_edited_in_place": (_t_evidence_edited_in_place, "event_authority_closure_evidence_mismatch", "edition_binding"),
    "bound_input_drift": (_t_bound_input_drift, "event_authority_closure_input_drift", "currentness"),
    "historical_selector_row_dropped": (_t_historical_selector_row_dropped, "event_authority_closure_source_selector_unpinned", "source_set"),
    "historical_selector_row_added": (_t_historical_selector_row_added, "event_authority_closure_source_selector_unpinned", "source_set"),
    "historical_selector_reserialized": (_t_historical_selector_reserialized, "event_authority_closure_source_selector_unpinned", "source_set"),
    "inventory_omits_machine_input": (_t_inventory_omits_machine_input, "event_authority_closure_source_set_mismatch", "source_set"),
    "inventory_omits_registry_input": (_t_inventory_omits_registry_input, "event_authority_closure_source_set_mismatch", "source_set"),
    "inventory_omits_historical_input": (_t_inventory_omits_historical_input, "event_authority_closure_source_set_mismatch", "source_set"),
    "inventory_omits_plans_doc": (_t_inventory_omits_plans_doc, "event_authority_closure_source_set_mismatch", "source_set"),
    "inventory_path_substituted": (_t_inventory_path_substituted, "event_authority_closure_source_set_mismatch", "source_set"),
    "inventory_extra_derived_row": (_t_inventory_extra_derived_row, "event_authority_closure_source_set_mismatch", "source_set"),
    "inventory_reclassed": (_t_inventory_reclassed, "event_authority_closure_source_set_mismatch", "source_set"),
    "inventory_exclusions_edited": (_t_inventory_exclusions_edited, "event_authority_closure_exclusions_mismatch", "source_set"),
    "census_token_omitted": (_t_census_token_omitted, "event_authority_closure_census_mismatch", "source_set"),
    "artifact_entry_omitted": (_t_artifact_entry_omitted, "event_authority_currentness_artifact_set_mismatch", "edition_binding"),
    "artifact_entry_extra": (_t_artifact_entry_extra, "event_authority_currentness_artifact_set_mismatch", "edition_binding"),
    "token_ledger_pin_omitted": (_t_token_ledger_pin_omitted, "event_authority_closure_token_source_invalid", "token_ledger"),
    "token_ledger_rule_without_row": (_t_token_ledger_rule_without_row, "event_authority_closure_token_source_invalid", "token_ledger"),
    "recount_name_dropped": (_t_recount_name_dropped, "event_authority_closure_recount_list_invalid", "denominator"),
    "known37_family_added": (_t_known37_family_added, "event_authority_closure_known37_invalid", "denominator"),
    "bound_input_added": (_t_bound_input_added, "event_authority_closure_input_drift", "currentness"),
}


def copy_tree(source: Path, target: Path) -> Path:
    shutil.copytree(source, target)
    return target
