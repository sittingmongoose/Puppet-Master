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

TOKEN_LEDGER = "reports/fixture/token-ledger.json"
DEPTH_REGISTERED = "reports/fixture/depth-registered.json"
DEPTH_ADMITTED = "reports/fixture/depth-admitted.json"
DEPTH_DUPLICATE = "reports/fixture/depth-duplicate.json"
VALIDATOR_STUB = "scripts/pm-event-authority-currentness.py"
EVENTS_DOC = "Plans/fixture_events.md"


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


def build(root: Path, helper: ModuleType, *, closed: bool) -> None:
    """Write the synthetic tree and an OPEN or CLOSED edition under `root`."""
    criteria = tuple(helper.EA_DEPTH_CRITERIA)
    root = Path(root)
    names = _names(helper)
    registered = names["known"] + names["august"] + names["admitted"]
    families = [_family(name) for name in registered]
    _write(root, helper.EVENT_FAMILY_REGISTRY_REL_PATH, {
        "schema_id": helper.EVENT_FAMILY_REGISTRY_SCHEMA_ID,
        "schema_version": helper.EVENT_FAMILY_REGISTRY_SCHEMA_VERSION,
        "registry_revision": helper.EVENT_FAMILY_REGISTRY_REVISION,
        "families": families,
    })
    non_events = {
        "cmd.fx.run": "The cmd.fx.run command emits nothing.",
        "pm.fx.schema_id": "Schema pm.fx.schema_id is an identifier.",
        "fx.excluded.recorded": "fx.excluded.recorded was excluded by DL-900.",
        "fx.cited.thing": "fx.cited.thing is a field path, not an event family.",
        "fx.alias.recorded": "fx.alias.recorded is an alias.",
        "fx.holding.recorded": "fx.holding.recorded stays in the holding bucket.",
        "fx.cpu_excluded.recorded": "fx.cpu_excluded.recorded was reclassified.",
        "fx.recount_x.recorded": "fx.recount_x.recorded was excluded at recount.",
        "fx.excluded68.recorded": "fx.excluded68.recorded is an excluded July row.",
    }
    events_text = "# Fixture events\n\n" + "".join(f"The {name} event is appended.\n" for name in registered)
    events_text += "".join(line + "\n" for line in non_events.values())
    _write(root, EVENTS_DOC, events_text)
    cited_line = events_text.splitlines().index(non_events["fx.cited.thing"]) + 1
    _write(root, "Plans/storage-plan.md", "# Storage\n\nEA-27 `{}` union `{}`; EA-29 `{}`.\n".format(
        helper.EA27_CANON_SHA256, helper.EA27_UNION_ROWS_CANON_SHA256, helper.EA29_CANON_SHA256))
    _write(root, "Plans/Plan_To_Node_Compilation.md", "# PNC\n\n- " + helper.EVENT_AUTHORITY_RUNTIME_BOUNDARY_BASIS_QUOTE + "\n")
    _write(root, "Plans/Decision_Log.md", "# Decisions\n\n### DL-900: fixture exclusion\n\nfx.excluded.recorded is not an event family.\n\n### DL-901: other\n\nNothing.\n")
    _write(root, "Plans/.implementation_readiness/pnc019_certification_receipt.schema.json", '{"const": "local_deterministic_clean_room"}\n')
    _write(root, VALIDATOR_STUB, "# fixture stand-in; EXCLUSIONS: runtime producer conformance is a later independent lane\n")

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
        [{"event_type": n, "category": "registered_keep"} for n in names["known"]]
        + [{"event_type": n, "category": "persisted_unregistered_quarantine"} for n in cohorts["july248_confirmed_persisted_unregistered"]]
        + [{"event_type": "fx.alias.recorded", "category": "alias"}, {"event_type": "fx.holding.recorded", "category": "quarantined_not_admitted"}]
        + [{"event_type": "fx.excluded68.recorded", "category": "exact_excluded"}]
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
    recount_names = sorted([names["admitted"][1], "fx.recount_x.recorded"])
    _write(root, helper.EA_RECOUNT_LIST_REL_PATH, [{"name": n} for n in recount_names])
    _write(root, helper.EA_RECOUNT_RECEIPT_REL_PATH, {"fixture": "recount receipt"})
    _write(root, helper.EA_RECOUNT_CHANGE_RECEIPT_REL_PATH, {"fixture": "recount change receipt"})
    _write(root, helper.EA_RECOUNT_OUTCOMES_REL_PATH, {
        "schema_id": helper.EA_RECOUNT_OUTCOMES_SCHEMA_ID,
        "rows": [{"event_type": n, "outcome": "registered" if n == names["admitted"][1] else "excluded"} for n in recount_names],
    })
    _write(root, helper.EA_FROZEN_VALIDATOR_REL_PATH, "# frozen validator stand-in\n")
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

    tokens = sorted(set(registered) | set(non_events))
    occurrences = _jsonl([{"exact_token": t, "registered": t in by_name, "occurrence_count": 1} for t in tokens])
    paths = _paths(helper)
    _write(root, paths["occurrences"], occurrences)
    dl900 = helper._decision_section(root, "DL-900")
    events_raw = (root / EVENTS_DOC).read_bytes()
    sources = {
        "cmd.fx.run": ("non_event_identifier", {"kind": "mechanical_rule", "rule": "cmd_namespace"}),
        "pm.fx.schema_id": ("non_event_identifier", {"kind": "mechanical_rule", "rule": "identifier_namespace"}),
        "fx.excluded.recorded": ("excluded_not_a_family", {"kind": "decision_log", "ref": "Plans/Decision_Log.md#DL-900", "section_sha256": _sha(dl900)}),
        "fx.cited.thing": ("non_event_owner_cited", {"kind": "owner_citation", "path": EVENTS_DOC, "sha256": _sha(events_raw), "line_start": cited_line, "line_end": cited_line}),
        "fx.alias.recorded": ("alias_of_registered_family", {"kind": "census_adjudication"}),
        "fx.holding.recorded": ("holding_bucket_not_admitted", {"kind": "individual_disposition"}),
        "fx.cpu_excluded.recorded": ("excluded_not_a_family", {"kind": "individual_disposition"}),
        "fx.recount_x.recorded": ("excluded_not_a_family", {"kind": "recount_outcome"}),
        "fx.excluded68.recorded": ("excluded_not_a_family", {"kind": "census_adjudication"}),
    }
    rows = []
    for token in tokens:
        disposition, source = ("registered_family", {"kind": "registry"}) if token in by_name else sources[token]
        rows.append({"exact_token": token, "disposition": disposition, "source": source})
    _write(root, TOKEN_LEDGER, {"schema_id": helper.EA_TOKEN_LEDGER_SCHEMA_ID, "occurrences_sha256": _sha(occurrences), "rows": rows})

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
) -> None:
    """Rewrite every hash, pin and status field over the current inputs."""
    paths = _paths(helper)
    registry_raw = (root / helper.EVENT_FAMILY_REGISTRY_REL_PATH).read_bytes()
    registry = json.loads(registry_raw)
    live = sorted(f["event_type"] for f in registry["families"])
    sources = []
    for path in sorted((root / "Plans").glob("*.md")):
        raw = path.read_bytes()
        sources.append({"path": path.relative_to(root).as_posix(), "authority_class": "direct_canonical_plan_prose", "bytes": len(raw), "sha256": _sha(raw)})
    sources.append({"path": helper.EVENT_FAMILY_REGISTRY_REL_PATH, "authority_class": "registered_machine_input", "bytes": len(registry_raw), "sha256": _sha(registry_raw)})
    _write(root, paths["inventory"], {"sources": sources})
    status = _read(root, paths["status"])
    status["registry"] = {
        "path": helper.EVENT_FAMILY_REGISTRY_REL_PATH,
        "sha256": _sha(registry_raw),
        "revision": registry["registry_revision"],
        "live_family_count": len(live),
        "event_types_sha256": _sha(("\n".join(live) + "\n").encode()),
    }
    artifacts = [paths[k] for k in ("inventory", "occurrences", "status", "readme", "quarantine", "manifest")]
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
        artifacts += [paths["evidence"], paths["frozen_receipt"], paths["continuity"]]
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
        doc["rows"][0]["cells"]["retention"]["evidence"] = [{"path": "reports/fixture/not-canon.md"}]
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


def _t_token_uncovered(root: Path, h: ModuleType) -> None:
    _edit_json(root, TOKEN_LEDGER, lambda doc: doc.__setitem__("rows", [r for r in doc["rows"] if r["exact_token"] != "fx.cited.thing"]))
    reseal(root, h)


def _t_token_rule_mismatch(root: Path, h: ModuleType) -> None:
    def change(doc: dict[str, Any]) -> None:
        _set_row(doc["rows"], "exact_token", "fx.cited.thing", disposition="non_event_identifier", source={"kind": "mechanical_rule", "rule": "cmd_namespace"})
    _edit_json(root, TOKEN_LEDGER, change)
    reseal(root, h)


def _t_token_registered_excluded(root: Path, h: ModuleType) -> None:
    name = _names(h)["known"][0]
    def change(doc: dict[str, Any]) -> None:
        _set_row(doc["rows"], "exact_token", name, disposition="excluded_not_a_family", source={"kind": "census_adjudication"})
    _edit_json(root, TOKEN_LEDGER, change)
    reseal(root, h)


def _t_token_ledger_stale(root: Path, h: ModuleType) -> None:
    _edit_json(root, TOKEN_LEDGER, lambda doc: doc.__setitem__("occurrences_sha256", "0" * 64))
    reseal(root, h)


def _t_continuity_cohort_mismatch(root: Path, h: ModuleType) -> None:
    _edit_json(root, _paths(h)["continuity"], lambda doc: doc["cohorts"]["july248_confirmed_persisted_unregistered"].pop())
    reseal(root, h)


def _t_continuity_pin_mismatch(root: Path, h: ModuleType) -> None:
    _edit_json(root, _paths(h)["continuity"], lambda doc: doc["ea27"].__setitem__("sha256", "f" * 64))
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
    "continuity_cohort_mismatch": (_t_continuity_cohort_mismatch, "event_authority_closure_continuity_cohort_mismatch", "continuity"),
    "continuity_pin_mismatch": (_t_continuity_pin_mismatch, "event_authority_closure_continuity_pin_mismatch", "continuity"),
    "runtime_basis_removed": (_t_runtime_basis_removed, "event_authority_closure_runtime_boundary_basis_missing", "runtime_boundary"),
    "runtime_boundary_claimed": (_t_runtime_boundary_claimed, "event_authority_currentness_status_closure_inconsistent", "runtime_boundary"),
    "receipt_says_open": (_t_receipt_says_open, "event_authority_currentness_receipt_closure_mismatch", "edition_binding"),
    "closure_artifact_unbound": (_t_closure_artifact_unbound, "event_authority_currentness_closure_artifact_unbound", "edition_binding"),
    "status_unknown_state": (_t_status_unknown_state, "event_authority_currentness_status_not_unknown_open", "edition_binding"),
    "evidence_unavailable": (_t_evidence_unavailable, "event_authority_closure_evidence_unavailable", "edition_binding"),
    "evidence_edited_in_place": (_t_evidence_edited_in_place, "event_authority_closure_evidence_mismatch", "edition_binding"),
    "bound_input_drift": (_t_bound_input_drift, "event_authority_closure_input_drift", "currentness"),
    "bound_input_added": (_t_bound_input_added, "event_authority_closure_input_drift", "currentness"),
}


def copy_tree(source: Path, target: Path) -> Path:
    shutil.copytree(source, target)
    return target
