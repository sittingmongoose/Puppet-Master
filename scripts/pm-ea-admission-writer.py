#!/usr/bin/env python3
"""Deterministic Event Authority admission writer (PNC-019 step S5, stream E).

Three stages, each a pure function of the repository tree and the pinned inputs:

``prepare``
    Builds the admission manifest for one admission merge. It reads the two
    reviewed admission-readiness lists (pinned by SHA-256), each family's
    reviewed grade in ``reports/``, and the family's lane contract in canon,
    and derives the registry row the family would append. Every field comes
    from a named source; a field no source states, or two sources state
    differently, blocks the family with a named gap instead of being guessed.
    Every derived row is checked with readiness's own registry checks.

``apply``
    Writes one commit per ready family, in manifest order: the registry
    append (DL-078/DL-096), the family's own Decision Log entry, its DL-077
    admission record, its 12/12 depth assessment, its CPU ledger rationale or
    recount OUTCOMES row, and the DL-078 checkpoint pins. Nothing in a commit
    depends on a clock: the recording time, revision date and DL ids are
    inputs.

``verify``
    Judges every written record with the frozen seal check's own
    ``admission_record_problems`` and the registry with readiness's checks,
    and prints the verdict per family.

The writer never edits the frozen validator, Spec Lock, ``Plans/.evidence``
or ``Plans/auto_decisions.jsonl``, never regenerates shards or the plan
index (one regeneration per merge, run by the merge), never pushes and never
lands.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parents[1]
PLANS = REPO / "Plans"

WRITER_ID = "pm-ea-admission-writer.v1"
REGISTRY = "Plans/event_family_registry.json"
REGISTRY_SCHEMA = "Plans/event_family_registry.schema.json"
DECISION_LOG = "Plans/Decision_Log.md"
CURRENTNESS = "scripts/pm_pnc019_currentness.py"
TEST_PINS = ("tests/test_pm_testing_session_events.py", "tests/test_pm_github_project_integration.py")
AUDIT = "Plans/.audits/event-authority-2026-08-12"
FROZEN = AUDIT + "/independent-validator/pm_event_authority_independent_validator.py"
LEDGER = AUDIT + "/individual-disposition/LEDGER.jsonl"
LEDGER_ROWS = AUDIT + "/individual-disposition/rows"
OUTCOMES = AUDIT + "/recount/OUTCOMES.json"
RECOUNT_LIST = "reports/event-authority-20261104/census-recount-20261104/NEW-LIST.json"
RECOUNT_RECEIPT = "reports/event-authority-20261104/census-recount-20261104/RECEIPT.json"
RECORD_DIR = "reports/event-authority-20260911/admission-records"
POST_AUGUST_RECEIPT = "reports/event-authority-20260911/step-10-post-august-admission-receipt.json"
COORDINATION_LEDGER = "Plans/coordination_event_admission.json"
STORAGE_REGISTRY = "Plans/storage_value_registry.json"

EVIDENCE_FIELDS = (
    "membership_version", "owner_doc", "producer", "closed_payload_schema", "scope_identity",
    "replay_idempotency", "retention", "redaction_custody", "transitions", "consumers_checkpoints",
    "compatibility_withdrawal", "positive_negative_oracles",
)
# Storage policies of derived or index stores, never an event history's own policy.
DERIVED_STORE_POLICIES = {"RP-PROJECTION-3GEN", "RP-EVENT-INDEX-SOURCE"}
# Policies a registered application edition already shares with its Project edition
# (Goal, approval and Goal-run precedents in the live registry). Any other policy needs
# its application edition stated by the lane.
SCOPE_SHARED_POLICIES = {"RP-AUTHORITY-INDEFINITE", "RP-RUNTIME-365D"}
IDENTITY_KEYS = ("project_id", "thread_id", "run_id", "node_id", "attempt_id")

# The two reviewed readiness lists of admission merge 1 (EA-P2 B, Jared 2026-11-14).
EVIDENCE_ROOT = Path("/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104")
READINESS = {
    "batch2": (EVIDENCE_ROOT / "drafts/INT2/admission-readiness-final.json",
               "58566991d8f8a012b87e49afb36f0578576ed24f73122362d84ff365901507be"),
    "batch3": (EVIDENCE_ROOT / "drafts/INT3/admission-readiness.json",
               "815ed8bfdc86b5fe565fac1cc5549fc590fa7b72cd9606fcb589f947bf8eaa8f"),
}

SELF_GRADES = {
    "DX": "reports/event-authority-20261104/DX.self-grade.json",
    "DCN": "reports/event-authority-20261104/DCN-self-grade.json",
    "DCO": "reports/event-authority-20261104/DCO-self-grade.json",
    "DDBG": "reports/event-authority-20261104/DDBG.self-grade.json",
    "DM": "reports/event-authority-20261104/DM-self-grade.json",
    "W3A": "reports/event-authority-20261105/W3A-self-grade.json",
    "W3B": "reports/event-authority-20261105/W3B-self-grade.json",
    "W3C": "reports/event-authority-20261105/W3C-self-grade.json",
    "W3F": "reports/event-authority-20261105/W3F-self-grade.json",
    "W3G": "reports/event-authority-20261105/W3G.self-grade.json",
    "W3H": "reports/event-authority-20261105/W3H-self-grade.json",
}


# ---------------------------------------------------------------- helpers

def sha256_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def canonical_sha256(value: Any) -> str:
    """The DL-077 recipe: sorted keys, compact separators, UTF-8."""
    return sha256_bytes(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))


def load(rel: str) -> Any:
    return json.loads((REPO / rel).read_text(encoding="utf-8"))


def render_registry(doc: dict) -> str:
    return json.dumps(doc, indent=2, ensure_ascii=False) + "\n"


def load_module(name: str, rel: str):
    spec = importlib.util.spec_from_file_location(name, REPO / rel)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


_UNIT_INDEX: dict[str, list[str]] | None = None


def unit_index() -> dict[str, list[str]]:
    """plan_unit_id -> owner documents that declare it (top-level Plans/*.md only)."""
    global _UNIT_INDEX
    if _UNIT_INDEX is None:
        index: dict[str, list[str]] = {}
        for path in sorted(PLANS.glob("*.md")):
            for match in re.finditer(r"(?m)^plan_unit_id: ([A-Z][A-Z0-9]*-[0-9]+)\s*$", path.read_text(encoding="utf-8")):
                index.setdefault(match.group(1), []).append("Plans/" + path.name)
        _UNIT_INDEX = index
    return _UNIT_INDEX


def unit_ref(unit: str) -> str | None:
    docs = unit_index().get(unit, [])
    return docs[0] + "#" + unit if len(docs) == 1 else None


def split_ref(ref: str) -> tuple[str, str]:
    path, _, pointer = ref.partition("#")
    return path, "#" + pointer if pointer else "#"


def policy_ids(text: str) -> list[str]:
    return sorted(set(re.findall(r"RP-[A-Z0-9]+(?:-[A-Z0-9]+)*", text)))


def policy_ref(token: str) -> dict | None:
    match = re.fullmatch(r"(RP-[A-Z0-9-]+)(?:@([0-9]+\.[0-9]+\.[0-9]+))?", token.strip())
    if not match:
        return None
    return {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": match.group(1),
            "policy_version": match.group(2) or "1.0.0"}


class Gap(Exception):
    """A field no source states, or sources that disagree. Blocks the family."""


# ---------------------------------------------------------------- inputs

def readiness_families() -> list[dict]:
    """Admission merge 1: 32 batch-2 rows at 11 PASS + membership ABSENT, then 141 batch-3 rows at 11/0/1."""
    out = []
    path2, pin2 = READINESS["batch2"]
    path3, pin3 = READINESS["batch3"]
    if sha256_file(path2) != pin2 or sha256_file(path3) != pin3:
        raise SystemExit("readiness list bytes differ from their pins")
    batch2 = json.loads(path2.read_text(encoding="utf-8"))
    batch3 = json.loads(path3.read_text(encoding="utf-8"))
    for row in batch2:
        if row["counts"] == {"ABSENT": 1, "PASS": 11} and set(row["nonpass_cells"]) == {"membership_version"}:
            out.append({"event_type": row["event_type"], "lane": row["lane"], "batch": "batch2",
                        "readiness": {"path": str(path2), "sha256": sha256_file(path2)}})
    for row in batch3:
        if row["grade"] == "11/0/1" and row["nonpass"] == []:
            out.append({"event_type": row["event_type"], "lane": row["lane"], "batch": "batch3",
                        "readiness": {"path": str(path3), "sha256": sha256_file(path3)}})
    order = {"batch2": 0, "batch3": 1}
    return sorted(out, key=lambda f: (order[f["batch"]], f["event_type"]))


def grade_rows(lane: str) -> dict[str, dict]:
    doc = load(SELF_GRADES[lane])
    rows = doc.get("rows") if isinstance(doc, dict) and "rows" in doc else doc.get("families")
    return {row["event_type"]: row for row in rows}


def kind_of(event_type: str, ledger: dict, recount: dict) -> str:
    if event_type in ledger and ledger[event_type].get("bucket") == "confirmed_persisted_unregistered":
        return "cpu"
    if event_type in recount:
        return "recount"
    raise Gap("neither a confirmed_persisted_unregistered ledger row nor a recount name")


# ---------------------------------------------------------------- lane contracts

def find_by_event(rows: list, event_type: str, key: str = "event_type") -> tuple[int, dict]:
    hits = [(i, r) for i, r in enumerate(rows) if isinstance(r, dict) and r.get(key) == event_type]
    if len(hits) != 1:
        raise Gap(f"lane contract rows naming the family: {len(hits)}")
    return hits[0]


def lane_contract(lane: str, event_type: str) -> dict:
    """Normalized lane facts: scope, payload editions, owner refs and retention as each lane states them.

    Keys: scope_policy, editions {scope: 'path#pointer'}, retention {scope: 'RP@v'} (may be
    partial), owners {semantic, payload, storage} (may be partial), contract_ref, prepared_row.
    """
    out: dict[str, Any] = {"owners": {}, "retention": {}, "editions": {}, "scope_policy": None,
                           "contract_ref": None, "prepared_row": None}
    if lane == "DCO":
        doc = load(COORDINATION_LEDGER)
        i, row = find_by_event(doc["rows"], event_type)
        out.update(contract_ref=f"{COORDINATION_LEDGER}#/rows/{i}", prepared_row=copy.deepcopy(row["registry_row"]))
        return out
    if lane == "DX":
        rel = "Plans/executor_event_contracts.json"
        i, row = find_by_event(load(rel)["families"], event_type)
        rp = row["retention_policy_ref"]
        out.update(scope_policy=row["scope_policy"], contract_ref=f"{rel}#/families/{i}",
                   editions={"project": row["schema_ref"] + "#"},
                   retention={"project": f"{rp['policy_id']}@{rp['policy_version']}"},
                   owners={"semantic": row["semantic_owner"], "payload": row["payload_owner"],
                           "storage": row["storage_owner"]})
        return out
    if lane == "DCN":
        rel = "Plans/card2_event_contracts.json"
        i, row = find_by_event(load(rel)["families"], event_type)
        rp = row["retention_policy_ref"]
        token = f"{rp['policy_id']}@{rp['policy_version']}"
        scopes = ("application", "project") if row["scope_policy"] == "application_or_project" else ("project",)
        out.update(scope_policy=row["scope_policy"], contract_ref=f"{rel}#/families/{i}",
                   editions={s: row["payload_schema_ref"] for s in scopes},
                   retention={s: token for s in scopes},
                   owners={"semantic": row["semantic_owner_doc"] + "#" + row["semantic_unit"],
                           "payload": "Plans/Contracts_V0.md#" + row["contract_unit"],
                           "storage": "Plans/storage-plan.md#" + row["storage_unit"]})
        return out
    if lane == "DM":
        rel = "Plans/small_owner_event_fixtures.json"
        i, row = find_by_event(load(rel)["families"], event_type)
        scopes = ("application", "project") if row["scope_policy"] == "application_or_project" else ("project",)
        out.update(scope_policy=row["scope_policy"], contract_ref=f"{rel}#/families/{i}",
                   editions={s: row["schema"] + "#" for s in scopes},
                   retention={"project": row["retention_policy_ref"]})
        return out
    if lane == "DDBG":
        rel = "Plans/debug_investigation_event_payloads.schema.json"
        suffix = event_type.removeprefix("debug.investigation.")
        if suffix == event_type or suffix not in load(rel).get("$defs", {}):
            raise Gap("no debug investigation payload definition for the family")
        out.update(contract_ref=f"{rel}#/$defs/{suffix}", editions={"project": f"{rel}#/$defs/{suffix}"})
        return out
    if lane == "W3A":
        rel = "reports/event-authority-20261105/W3A-contracts.json"
        i, row = find_by_event(load(rel)["contracts"], event_type)
        ret = row["retention_policy_ref"]
        ref = row["payload_schema_ref"]
        if isinstance(ret, dict) and set(ret) == {"application", "project"}:
            scope, scopes, retention = "application_or_project", ("application", "project"), dict(ret)
        else:
            # One policy for the family: its scope comes from the graded scope evidence.
            scope, scopes, retention = None, ("project",), {"project": ret}
        out.update(scope_policy=scope, contract_ref=f"{rel}#/contracts/{i}",
                   editions={s: ref for s in scopes}, retention=retention,
                   owners={"semantic": unit_ref(row["owner_unit"]), "payload": unit_ref(row["envelope_unit"]),
                           "storage": unit_ref(row["storage_unit"])})
        return out
    if lane == "W3B":
        rel = "Plans/source_control_event_preparation.json"
        i, row = find_by_event(load(rel)["families"], event_type)
        scopes = ("application", "project") if row["scope_policy"] == "application_or_project" else ("project",)
        out.update(scope_policy=row["scope_policy"], contract_ref=f"{rel}#/families/{i}",
                   editions={s: row["payload_schema_ref"] for s in scopes},
                   retention={"project": row["retention_policy_ref"]},
                   owners={"semantic": row["semantic_owner"], "payload": row["payload_owner"],
                           "storage": row["storage_owner"]})
        return out
    if lane == "W3C":
        rel = "reports/event-authority-20261105/W3C-contracts.json"
        i, row = find_by_event(load(rel)["families"], event_type)
        variants = row.get("payload_variants") or {}
        out.update(scope_policy=row["scope_policy"], contract_ref=f"{rel}#/families/{i}",
                   editions={s: v["schema_ref"] for s, v in variants.items()},
                   retention={"project": row["retention_policy_ref"]},
                   owners={"semantic": unit_ref(row["owner_unit"]), "payload": unit_ref(row["payload_unit"]),
                           "storage": unit_ref(row["storage_unit"])})
        return out
    if lane == "W3F":
        rel = "reports/event-authority-20261105/W3F-row-outcomes.jsonl"
        rows = [json.loads(line) for line in (REPO / rel).read_text(encoding="utf-8").splitlines() if line.strip()]
        i, row = find_by_event(rows, event_type)
        slug = event_type.replace(".", "_")
        schema = f"Plans/event_payloads/w3f/{slug}.schema.json"
        if not (REPO / schema).is_file():
            raise Gap("no W3F payload schema file for the family")
        cv = [u for u in row["owner_units"] if u.startswith("CV-")]
        sp = [u for u in row["owner_units"] if u.startswith("SP-")]
        out.update(contract_ref=f"{rel}#{i + 1}", editions={"project": schema + "#"},
                   owners={"payload": unit_ref(cv[0]) if len(cv) == 1 else None,
                           "storage": unit_ref(sp[0]) if len(sp) == 1 else None})
        if row["retention_policy_ref"] != "PENDING_RETENTION_DECISION":
            out["retention"] = {"project": row["retention_policy_ref"]}
        return out
    if lane == "W3G":
        rel = "Plans/event_authority_w3g/contracts.json"
        i, row = find_by_event(load(rel)["families"], event_type)
        selectors = row.get("payload_selectors") or {}
        editions = {}
        for name, ref in selectors.items():
            scope = "application" if name.startswith("Application") else "project" if name.startswith("Project") else None
            if scope is None or scope in editions:
                raise Gap("W3G payload selector names no single scope: " + name)
            editions[scope] = ref
        out.update(scope_policy=row["scope_policy"], contract_ref=f"{rel}#/families/{i}", editions=editions,
                   retention=dict(row.get("retention_by_scope") or {}),
                   owners={"semantic": f"{row['owner_doc']}#{row['owner_unit']}", "payload": unit_ref(row["cv"]),
                           "storage": unit_ref(row["sp"])})
        return out
    if lane == "W3H":
        rel = "reports/event-authority-20261105/W3H-outcomes.json"
        i, row = find_by_event(load(rel)["rows"], event_type)
        scopes = ("application", "project") if row["scope"] == "application_or_project" else ("project",)
        out.update(scope_policy=row["scope"], contract_ref=f"{rel}#/rows/{i}",
                   editions={s: row["payload_schema_ref"] for s in scopes},
                   retention={"project": row["retention_policy"]},
                   owners={"semantic": unit_ref(row["owner_unit"]), "payload": unit_ref(row["cv_unit"]),
                           "storage": unit_ref(row["sp_unit"])})
        return out
    raise Gap("no lane adapter for " + lane)


# ---------------------------------------------------------------- derivation

def grade_cells_ok(grade: dict) -> None:
    cells = grade.get("cells") or {}
    if set(cells) != set(EVIDENCE_FIELDS):
        raise Gap("reviewed grade does not carry exactly the twelve criteria")
    statuses = {f: cells[f].get("status") for f in EVIDENCE_FIELDS}
    if statuses["membership_version"] != "ABSENT" or any(statuses[f] != "PASS" for f in EVIDENCE_FIELDS[1:]):
        raise Gap("reviewed grade is not 11 PASS with membership ABSENT: " + json.dumps(statuses))


def graded_unit(grade: dict, field: str) -> str | None:
    for item in grade["cells"][field].get("evidence") or []:
        unit = item.get("unit")
        if isinstance(unit, str) and re.fullmatch(r"[A-Z][A-Z0-9]*-[0-9]+", unit):
            path = item.get("path")
            ref = unit_ref(unit)
            if ref and ref.split("#")[0] == path:
                return ref
    return None


def graded_retention(grade: dict) -> dict[str, str]:
    """Project and application history policies named by the reviewed retention cell."""
    cell = grade["cells"]["retention"]
    text = json.dumps([cell.get("finding"), [e.get("quote") for e in cell.get("evidence") or []]], ensure_ascii=False)
    ids = [p for p in policy_ids(text) if p not in DERIVED_STORE_POLICIES]
    app = [p for p in ids if "-APPLICATION-" in p]
    project = [p for p in ids if "-APPLICATION-" not in p]
    out = {}
    if len(project) == 1:
        out["project"] = project[0]
    if len(app) == 1:
        out["application"] = app[0]
    return out


SCOPE_TOKENS = ("application_or_project", "project_only", "application_only")


def scope_from_grade(grade: dict) -> str | None:
    """A scope policy token stated exactly once by the reviewed scope_identity cell's own evidence."""
    cell = grade["cells"]["scope_identity"]
    text = " ".join([str(cell.get("finding") or "")] + [str(e.get("quote") or "") for e in cell.get("evidence") or []])
    found = {t for t in SCOPE_TOKENS if re.search(r"(?<![a-z_])" + t + r"(?![a-z_])", text)}
    return found.pop() if len(found) == 1 else None


def scope_object(schema: dict) -> tuple[str, dict]:
    """The payload's own scope carrier: top level, or a closed `context`/`scope` object."""
    props = schema.get("properties") or {}
    if "scope_kind" in props:
        return "", props
    for name in ("context", "scope"):
        inner = (props.get(name) or {}).get("properties") or {}
        if "scope_kind" in inner:
            return "/" + name, inner
    return "", props


def scope_from_schema(schema: dict) -> str | None:
    prop = scope_object(schema)[1].get("scope_kind") or {}
    values = prop.get("enum") or ([prop["const"]] if "const" in prop else [])
    values = set(values)
    if values == {"project", "application"}:
        return "application_or_project"
    if values == {"project"}:
        return "project_only"
    if values == {"application"}:
        return "application_only"
    return None


def identity_pointers(schema: dict) -> dict[str, list[str]]:
    """Each kernel identity key the payload carries, at the payload's top level or in its scope carrier."""
    props = schema.get("properties") or {}
    carriers = [("", props)] + [("/" + name, (props.get(name) or {}).get("properties") or {}) for name in ("scope", "context")]
    pointers: dict[str, list[str]] = {"project_id": [], "thread_id": []}
    for key in IDENTITY_KEYS:
        for prefix, carrier in carriers:
            if key in carrier:
                pointers[key] = ["/payload" + prefix + "/" + key]
                break
    return {k: v for k, v in pointers.items() if v or k in ("project_id", "thread_id")}


def derive_row(family: dict, grade: dict, contract: dict, readiness) -> tuple[dict, dict]:
    """The registry row and the source of each of its fields."""
    event_type = family["event_type"]
    family_id, revision = grade.get("family_id"), grade.get("family_revision")
    provenance: dict[str, Any] = {"family_id": SELF_GRADES[family["lane"]], "family_revision": SELF_GRADES[family["lane"]]}
    if family_id is None or (isinstance(family_id, str) and family_id.startswith("candidate-only:")):
        # Every live registry row is named event-family-<event type, dots and underscores as hyphens>.
        family_id = "event-family-" + re.sub(r"[._]", "-", event_type)
        provenance["family_id"] = "registry naming convention (every live row); the reviewed grade minted none"
    if not isinstance(family_id, str) or not re.fullmatch(r"event-family-[a-z0-9]+(?:-[a-z0-9]+)*", family_id):
        raise Gap("reviewed grade names no registry family_id")
    if not isinstance(revision, str):
        raise Gap("reviewed grade names no family_revision")
    if contract["prepared_row"] is not None:
        row = contract["prepared_row"]
        if (row.get("event_type"), row.get("family_id"), row.get("family_revision")) != (event_type, family_id, revision):
            raise Gap("prepared registry row disagrees with the reviewed grade's family identity")
        return row, {"row": contract["contract_ref"] + "/registry_row (prepared, appended unchanged)"}

    # Payload editions resolve exactly as readiness resolves them.
    editions = {}
    for scope, ref in sorted(contract["editions"].items()):
        path, pointer = split_ref(ref)
        probe = {"payload_schema_ref": {"path": path, "json_pointer": pointer, "schema_id": "?"}}
        schema, schema_id = readiness.event_family_payload_schema(probe)
        if schema is None or not isinstance(schema_id, str) or not schema_id:
            raise Gap(f"{scope} payload {ref} has no single resolvable schema id (readiness resolver)")
        editions[scope] = {"path": path, "json_pointer": pointer, "schema_id": schema_id, "schema": schema}
    if not editions:
        raise Gap("no payload edition stated")
    provenance["payload_editions"] = contract["contract_ref"]

    scope_policy = contract["scope_policy"]
    graded_scope = scope_from_grade(grade)
    schema_scope = scope_from_schema(next(iter(editions.values()))["schema"])
    if scope_policy is not None:
        provenance["scope_policy"] = contract["contract_ref"]
    elif graded_scope is not None:
        scope_policy = graded_scope
        provenance["scope_policy"] = SELF_GRADES[family["lane"]] + " scope_identity evidence"
    else:
        scope_policy = schema_scope
        provenance["scope_policy"] = "payload schema scope_kind"
    for other in (graded_scope, schema_scope):
        if other is not None and other != scope_policy:
            raise Gap(f"scope policy sources disagree: {scope_policy} vs {other}")
    if scope_policy not in ("project_only", "application_or_project", "application_only"):
        raise Gap("scope policy not stated")
    needed = {"project_only": {"project"}, "application_only": {"application"},
              "application_or_project": {"project", "application"}}[scope_policy]
    if scope_policy == "application_or_project" and set(editions) == {"project"}:
        # One closed payload serving both scopes (the DM precedent of a nullable project_id).
        editions["application"] = dict(editions["project"])
    if set(editions) != needed:
        raise Gap(f"payload editions {sorted(editions)} do not match scope policy {scope_policy}")

    # Owners: the graded owner and payload units, cross-checked with the lane's own refs.
    owners = dict(contract["owners"])
    graded_owner = graded_unit(grade, "owner_doc")
    if owners.get("semantic") is None:
        owners["semantic"] = graded_owner
        provenance["semantic_owner_doc"] = SELF_GRADES[family["lane"]] + " owner_doc evidence"
    else:
        provenance["semantic_owner_doc"] = contract["contract_ref"]
    cv_units = [u for u in grade.get("current_owner_units") or [] if u.startswith("CV-")]
    if owners.get("payload") is None:
        graded_payload = graded_unit(grade, "closed_payload_schema")
        if graded_payload and graded_payload.split("#")[1].startswith("CV-"):
            owners["payload"] = graded_payload
        elif cv_units:
            owners["payload"] = unit_ref(cv_units[0])
        provenance["payload_owner_doc"] = SELF_GRADES[family["lane"]] + " closed_payload_schema evidence / current_owner_units"
    else:
        provenance["payload_owner_doc"] = contract["contract_ref"]
    for key in ("semantic", "payload"):
        ref = owners.get(key)
        if not ref:
            raise Gap(f"{key} owner unit not stated")
        doc, _, unit = ref.partition("#")
        if not (REPO / doc).is_file() or (re.fullmatch(r"[A-Z][A-Z0-9]*-[0-9]+", unit) and unit_ref(unit) != ref):
            raise Gap(f"{key} owner ref {ref} does not resolve to its declaring document")

    # Retention: the reviewed retention cell, cross-checked with the lane contract.
    graded = graded_retention(grade)
    stated = {s: v.split("@")[0] for s, v in contract["retention"].items()}
    retention: dict[str, dict] = {}
    for scope in sorted(needed):
        candidates = {x for x in (graded.get(scope), stated.get(scope)) if x}
        if scope == "application" and not candidates:
            project = graded.get("project") or stated.get("project")
            if project in SCOPE_SHARED_POLICIES:
                candidates = {project}
                provenance["retention_application"] = "shared with the Project edition (" + project + ", registry precedent)"
        if len(candidates) != 1:
            raise Gap(f"{scope} retention not stated exactly once (graded {graded.get(scope)}, lane {stated.get(scope)})")
        token = candidates.pop()
        version = None
        for s, v in contract["retention"].items():
            if v.split("@")[0] == token and "@" in v:
                version = v.split("@")[1]
        ref = policy_ref(token + ("@" + version if version else ""))
        policies = {(p["policy_id"], p["policy_version"]) for p in load(STORAGE_REGISTRY)["retention_policies"]}
        if ref is None or (ref["policy_id"], ref["policy_version"]) not in policies:
            raise Gap(f"{scope} retention {token} is not a registered policy object")
        retention[scope] = ref
    provenance["retention"] = SELF_GRADES[family["lane"]] + " retention cell; " + str(contract["contract_ref"])

    top_scope = "project" if "project" in editions else "application"
    top = editions[top_scope]
    source_refs = []
    for ref in (owners["semantic"], owners["payload"], owners.get("storage")):
        if ref and ref not in source_refs:
            source_refs.append(ref)
    for scope in sorted(editions):
        ref = editions[scope]["path"] + editions[scope]["json_pointer"]
        if ref not in source_refs:
            source_refs.append(ref)
    if contract["contract_ref"].startswith("Plans/") and contract["contract_ref"] not in source_refs:
        source_refs.append(contract["contract_ref"])
    source_refs.append(SELF_GRADES[family["lane"]])

    row: dict[str, Any] = {
        "family_id": family_id,
        "family_revision": revision,
        "event_type": event_type,
        "scope_policy": scope_policy,
        "semantic_owner_doc": owners["semantic"],
        "payload_owner_doc": owners["payload"],
        "payload_schema_id": top["schema_id"],
        "payload_schema_ref": {"path": top["path"], "json_pointer": top["json_pointer"], "schema_id": top["schema_id"]},
        "legacy": {
            "aliases": [],
            "admitted_extensions": [],
            "identity_json_pointers": identity_pointers(top["schema"]),
            "referenced_event_id_pointer": None,
            "redaction": {"mode": "reject_unhandled_secrets", "transform_id": None, "transform_version": None},
        },
        "source_refs": source_refs,
        "retention_policy_ref": retention[top_scope],
    }
    if len(editions) > 1:
        row["payload_versions"] = [
            {
                "scope_kind": scope,
                "payload_schema_id": editions[scope]["schema_id"],
                "payload_schema_ref": {"path": editions[scope]["path"], "json_pointer": editions[scope]["json_pointer"],
                                       "schema_id": editions[scope]["schema_id"]},
                "source_graph_ref": "Plans/Contracts_V0.md#CV-366",
                "producer_admission": "requires_owner_adoption",
                "append_owner_ref": owners["semantic"],
                "read_owner_ref": owners["semantic"],
                "backup_owner_ref": "Plans/Backup_Restore_System.md#BRS-033",
                "retention_policy_ref": retention[scope],
            }
            for scope in sorted(editions)
        ]
        row["payload_selection_policy"] = "exact_scope_and_schema_id_no_fallback"
    provenance["identity_json_pointers"] = "top-level payload schema properties"
    provenance["payload_versions"] = "DL-300 approval-pair precedent: CV-366 graph, requires_owner_adoption, BRS-033"
    return row, provenance


def schema_failures(row: dict) -> list[str]:
    from jsonschema import Draft202012Validator
    from referencing import Registry, Resource
    schema = load(REGISTRY_SCHEMA)
    resource = Resource.from_contents(schema)
    registry = Registry().with_resource(schema["$id"], resource)
    sub = {"$ref": schema["$id"] + "#/$defs/family"}
    validator = Draft202012Validator(sub, registry=registry)
    return sorted(e.message[:200] for e in validator.iter_errors(row))


def prepare(args) -> int:
    readiness = load_module("pm_impl_readiness_for_writer", "scripts/pm-implementation-readiness.py")
    ledger = {json.loads(line)["event_type"]: json.loads(line) for line in (REPO / LEDGER).read_text(encoding="utf-8").splitlines()}
    recount = {row["name"]: row for row in load(RECOUNT_LIST)}
    registry = load(REGISTRY)
    live_types = {f["event_type"] for f in registry["families"]}
    live_ids = {f["family_id"] for f in registry["families"]}
    grades = {lane: grade_rows(lane) for lane in SELF_GRADES}
    families = readiness_families()
    out_rows = []
    candidates = []
    for family in families:
        event_type, lane = family["event_type"], family["lane"]
        entry = {"event_type": event_type, "lane": lane, "batch": family["batch"],
                 "readiness": family["readiness"], "status": "ready", "gaps": []}
        try:
            entry["kind"] = kind_of(event_type, ledger, recount)
            if event_type in live_types:
                raise Gap("already registered")
            grade = grades[lane].get(event_type)
            if grade is None:
                raise Gap("no reviewed grade row in " + SELF_GRADES[lane])
            grade_cells_ok(grade)
            entry["grade"] = {"path": SELF_GRADES[lane], "sha256": sha256_file(REPO / SELF_GRADES[lane])}
            contract = lane_contract(lane, event_type)
            row, provenance = derive_row(family, grade, contract, readiness)
            if row["family_id"] in live_ids:
                raise Gap("family_id already registered")
            problems = schema_failures(row)
            if problems:
                raise Gap("registry schema: " + "; ".join(problems[:3]))
            carried_cells(grade, entry["grade"])  # every cited quotation must still read at this tree
            entry.update(registry_row=row, row_provenance=provenance, contract_ref=contract["contract_ref"])
            candidates.append(row)
        except Gap as gap:
            entry["status"] = "blocked"
            entry["gaps"].append(str(gap))
        out_rows.append(entry)

    # Readiness's own registry data checks over the live registry plus every candidate.
    trial = copy.deepcopy(registry)
    trial["families"].extend(candidates)
    readiness.EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = len(trial["families"])
    failures = readiness.event_family_registry_data_failures(
        trial, load(REGISTRY_SCHEMA), path_label=REGISTRY, include_residuals=False)
    by_index: dict[int, list] = {}
    for failure in failures:
        match = re.search(r":families/(\d+)$", str(failure.get("path", "")))
        if match:
            by_index.setdefault(int(match.group(1)), []).append(failure)
    offset = len(registry["families"])
    position = {row["event_type"]: offset + i for i, row in enumerate(candidates)}
    for entry in out_rows:
        if entry["status"] != "ready":
            continue
        found = by_index.get(position[entry["event_type"]], [])
        if found:
            entry["status"] = "blocked"
            entry["gaps"].append("readiness registry check: " + json.dumps(found, sort_keys=True)[:400])
            entry.pop("registry_row", None)
    global_failures = [f for f in failures if not re.search(r":families/\d+$", str(f.get("path", "")))]
    manifest = {
        "schema_id": "pm.assurance.event_authority.admission_manifest.v1",
        "writer": WRITER_ID,
        "merge": args.merge,
        "base": subprocess.run(["git", "-C", str(REPO), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip(),
        "registry_before": {"revision": registry["registry_revision"], "sha256": sha256_file(REPO / REGISTRY),
                            "family_count": len(registry["families"])},
        "counts": {"families": len(out_rows), "ready": sum(e["status"] == "ready" for e in out_rows),
                   "blocked": sum(e["status"] == "blocked" for e in out_rows)},
        "registry_level_failures_with_all_ready_rows": global_failures,
        "families": out_rows,
    }
    Path(args.out).write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest["counts"]))
    return 0


# ---------------------------------------------------------------- evidence currency

_TEXT_CACHE: dict[str, str] = {}


def file_text(rel: str) -> str | None:
    if rel not in _TEXT_CACHE:
        path = REPO / rel
        _TEXT_CACHE[rel] = path.read_text(encoding="utf-8") if path.is_file() else None
    return _TEXT_CACHE[rel]


def refresh_evidence(item: dict) -> dict:
    """Re-read one cited quotation at the current tree; relocate its lines or fail closed."""
    rel = item.get("path")
    if not isinstance(rel, str) or rel.startswith("/") or ".." in Path(rel).parts:
        raise Gap(f"evidence path is not a repository path: {rel}")
    text = file_text(rel)
    if text is None:
        raise Gap(f"evidence file missing: {rel}")
    out = dict(item)
    unit = item.get("unit")
    if (rel.startswith("Plans/") and rel.endswith(".md") and isinstance(unit, str)
            and re.fullmatch(r"[A-Z][A-Z0-9]*-[0-9]+", unit) and unit_ref(unit) not in (None, rel + "#" + unit)):
        raise Gap(f"evidence unit {unit} is not declared by {rel}")
    quote = item.get("quote")
    if isinstance(quote, str) and quote:
        positions = [m.start() for m in re.finditer(re.escape(quote), text)]
        if not positions:
            raise Gap(f"cited quotation no longer present in {rel}: {quote[:80]!r}")
        want = item.get("line_start") if isinstance(item.get("line_start"), int) else 1
        lines = [text.count("\n", 0, p) + 1 for p in positions]
        start = min(lines, key=lambda n: (abs(n - want), n))
        span = quote.count("\n")
        out["line_start"], out["line_end"] = start, start + span
        out["quote_check"] = "exact"
    out["file_sha256"] = sha256_bytes(text.encode("utf-8"))
    return out


def carried_cells(grade: dict, grade_ref: dict) -> dict:
    """The eleven reviewed PASS cells, each quotation re-read at the current tree."""
    cells = {}
    for field in EVIDENCE_FIELDS[1:]:
        cell = copy.deepcopy(grade["cells"][field])
        evidence = [refresh_evidence(e) for e in cell.get("evidence") or [] if isinstance(e, dict)]
        if not any(str(e.get("path", "")).startswith("Plans/") for e in evidence):
            raise Gap(f"{field} PASS carries no Plans evidence")
        cells[field] = {
            "status": "PASS",
            "representation": cell.get("representation"),
            "finding": cell.get("finding"),
            "evidence": evidence,
            "carried_from": dict(grade_ref, field=field, status=cell.get("status")),
        }
    return cells


# ---------------------------------------------------------------- apply

ANSWERS = (EVIDENCE_ROOT / "decision-answers/ANSWERS_EA-P_20261114.md",
           "8f8c89d237c83fa265aa2baeebd041b657e757014a3a806aff451efb6641f1ac")
EA_P1 = "Add each once its definition passes every check"
EA_P2 = "Two merges: the 173 ready now, then the rest"
DL096_WORDS = "And yes I approve the DL-093 covering the families and later"
PIN_MARKER = "# Moved under DL-078's standing rule by admission merge"
TEST_PIN = re.compile(r"(?m)^APPROVED_CHECKPOINT_FAMILY_COUNT = (\d+)  # moved under DL-078 by each registration$")


def git(*args: str, check: bool = True) -> str:
    result = subprocess.run(["git", "-C", str(REPO), *args], capture_output=True, text=True)
    if check and result.returncode != 0:
        raise SystemExit("git " + " ".join(args) + " failed: " + result.stderr.strip())
    return result.stdout


def write_text(rel: str, text: str, *, crlf: bool = False) -> None:
    data = text.replace("\n", "\r\n") if crlf else text
    (REPO / rel).write_bytes(data.encode("utf-8"))
    _TEXT_CACHE.pop(rel, None)


def next_revision(previous: str, date: str) -> str:
    match = re.fullmatch(r"(\d{4}-\d{2}-\d{2})\.(\d+)", previous)
    if match and match.group(1) == date:
        return f"{date}.{int(match.group(2)) + 1}"
    if match and match.group(1) > date:
        raise SystemExit(f"revision date {date} precedes the live revision {previous}")
    return f"{date}.1"


def dl_numbers(spec: str) -> list[str]:
    out = []
    for part in spec.split(","):
        part = part.strip()
        match = re.fullmatch(r"DL-(\d+)(?:\.\.DL-(\d+))?", part)
        if not match:
            raise SystemExit("bad --dl-ids part: " + part)
        lo = int(match.group(1))
        hi = int(match.group(2) or lo)
        out.extend(f"DL-{n:03d}" for n in range(lo, hi + 1))
    if len(set(out)) != len(out):
        raise SystemExit("--dl-ids repeats an id")
    return out


def row_lines(rendered: str, family_id: str) -> tuple[int, int, int]:
    """(first, last, event_type line) of the registry row naming family_id, 1-based."""
    lines = rendered.split("\n")
    hits = [i for i, line in enumerate(lines) if line.strip() == f'"family_id": "{family_id}",']
    if len(hits) != 1:
        raise SystemExit("registry row not located uniquely: " + family_id)
    first = hits[0] - 1
    if lines[first].strip() != "{":
        raise SystemExit("registry row opening brace not found: " + family_id)
    indent = lines[first][: len(lines[first]) - len(lines[first].lstrip())]
    last = next(i for i in range(first + 1, len(lines)) if lines[i] in (indent + "}", indent + "},"))
    et_line = next(i for i in range(first, last) if lines[i].strip().startswith('"event_type": '))
    return first + 1, last + 1, et_line + 1


def yaml_str(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def decision_entry(dl: str, fam: dict, ctx: dict) -> str:
    et, row = fam["event_type"], fam["registry_row"]
    if fam["kind"] == "cpu":
        authority = (f"`{et}` is one of the rows DL-039 confirmed as persisted but unregistered and kept quarantined until "
                     "its contract was complete; DL-414 requires every such row to reach its one outcome, and DL-039 "
                     "authorized registering these rows family by family.")
        lineage_extra = "Plans/Decision_Log.md#DL-039 (confirmed_persisted_unregistered row, registered family by family)"
    else:
        authority = (f"`{et}` is one of the 249 names of the 2026-11-04 census recount (bucket {ctx['bucket']}). Jared's "
                     f"answer to card EA-P1, option A (\"{EA_P1}\"), admits each such name once its full definition, its "
                     "record and both reviews pass; DL-039's no bulk registration stands.")
        lineage_extra = "reports/event-authority-20261104/census-recount-20261104/NEW-LIST.json (recount name)"
    retention = row["retention_policy_ref"]["policy_id"] + "@" + row["retention_policy_ref"]["policy_version"]
    editions = ""
    if row.get("payload_versions"):
        parts = [f"{v['scope_kind']} `{v['payload_schema_id']}` ({v['retention_policy_ref']['policy_id']}@"
                 f"{v['retention_policy_ref']['policy_version']}, producer {v['producer_admission']})" for v in row["payload_versions"]]
        editions = " Its payload versions are " + "; ".join(parts) + "."
    text = (
        f"Event Authority registers `{et}` as family `{row['family_id']}` revision {row['family_revision']} in admission merge 1 of "
        f"PNC-019. On 2026-11-14 Jared answered card EA-P2 with option B (\"{EA_P2}\"), so the families ready then are admitted "
        f"in a first merge. {authority} Under DL-096 (\"{DL096_WORDS}\") this entry is Jared's decision entry for `{et}`, "
        "and the family's DL-077 admission record cites it as its decision_ref. DL-400 keeps this family's own commit, entry, "
        "record and twelve-criterion assessment inside the batched landing.\n\n"
        f"The registry moves from revision {ctx['before']['revision']} ({ctx['before']['family_count']} families, SHA-256 "
        f"{ctx['before']['sha256']}) to {ctx['after']['revision']} ({ctx['after']['family_count']} families, SHA-256 "
        f"{ctx['after']['sha256']}). The appended row, canonical SHA-256 {ctx['row_sha256']}, has scope policy "
        f"{row['scope_policy']}, payload `{row['payload_schema_id']}` at {row['payload_schema_ref']['path']}"
        f"{row['payload_schema_ref']['json_pointer']}, semantic owner {row['semantic_owner_doc']}, payload owner "
        f"{row['payload_owner_doc']} and retention {retention}.{editions} Under DL-078's standing rule the PNC-019 checkpoint "
        f"moves in the same commit: EVENT_FAMILY_REGISTRY_REVISION {ctx['after']['revision']} and "
        f"EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT {ctx['after']['family_count']} in scripts/pm_pnc019_currentness.py, and the "
        "approved checkpoint count in the two DL-078 test files.\n\n"
        f"Depth: {ctx['depth_path']} (SHA-256 {ctx['depth_sha256']}) grades all twelve criteria PASS. Eleven are carried from "
        f"the reviewed grade {fam['grade']['path']} (SHA-256 {fam['grade']['sha256']}) with every cited quotation re-read at "
        f"this commit's base, and membership_version is this registry row. Admission record: {ctx['record_path']}.\n\n"
        "Native execution stays NOT_RUN and every payload version's producer still requires owner adoption. This entry "
        f"registers only `{et}`. It changes no other family, validator, seal condition, retention assignment or holding "
        "bucket, and it grants no producer adoption, native claim, readiness clearance or governance seal. It lands only "
        "with its merge, after the merge's review pair and the coordinator's landing go."
    )
    body = "\n".join("  " + line if line else "" for line in text.split("\n"))
    lineage = [
        f"{ANSWERS[0]}; SHA-256 {ANSWERS[1]} (EA-P1 A, EA-P2 B, Jared 2026-11-14)",
        lineage_extra,
        f"{fam['grade']['path']}; SHA-256 {fam['grade']['sha256']}",
        f"{fam['readiness']['path']}; SHA-256 {fam['readiness']['sha256']}",
        f"scripts/pm-ea-admission-writer.py ({WRITER_ID})",
    ]
    tokens = [et, row["family_id"], ctx["after"]["revision"], ctx["after"]["sha256"], ctx["row_sha256"], EA_P2, DL096_WORDS]
    if fam["kind"] == "recount":
        tokens.insert(5, EA_P1)
    depends = ["DL-039", "DL-077", "DL-078", "DL-096", "DL-400", "DL-414"]
    out = [
        f"### {dl}: Event Authority registers {et} (admission merge 1)",
        "",
        "```yaml",
        f"plan_unit_id: {dl}",
        "unit_type: decision",
        "status: accepted",
        "owner_doc: Plans/Decision_Log.md",
        "canonical_text: |-",
        body,
        "gui_related: false",
        "gui_classification_reason: Registers one event family in the Event Authority registry; no visual presentation changes.",
        f"depends_on: [{', '.join(depends)}]",
        "unblocks: []",
        "acceptance_criteria:",
        f"- {yaml_str('The live registry contains exactly one row for ' + et + ', equal to the row whose canonical SHA-256 this entry records.')}",
        f"- {yaml_str('The DL-077 admission record ' + ctx['record_path'] + ' passes the frozen seal check with no problem for this family.')}",
        f"- {yaml_str('The checkpoint pins name revision ' + ctx['after']['revision'] + ' and ' + str(ctx['after']['family_count']) + ' families.')}",
        "validation_surfaces:",
        "- python3 Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py",
        "- python3 scripts/pm-implementation-readiness.py validate",
        "- python3 scripts/pm-ea-admission-writer.py verify",
        "risk_class: event_authority_admission",
        "reasoning_tier: high",
        "context_scope: event_authority_pnc019_admission_merge_1",
        "implementation_surfaces: [Plans/event_family_registry.json, scripts/pm_pnc019_currentness.py]",
        "node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false}",
        "source_lineage:",
        *[f"- {yaml_str(x)}" for x in lineage],
        f"preserved_exact_tokens: [{', '.join(yaml_str(t) for t in tokens)}]",
        "negative_constraints:",
        "- No other family, validator, seal condition, retention assignment or holding bucket changes.",
        "- No producer adoption, native execution claim, readiness clearance or governance seal is granted.",
        "```",
        "",
        "",
    ]
    return "\n".join(out)


def membership_cell(fam: dict, ctx: dict) -> dict:
    return {
        "status": "PASS",
        "representation": "exact_registry_membership",
        "finding": (f"Registered at registry revision {ctx['after']['revision']} as #/families/{ctx['row_index']} "
                    f"(canonical row SHA-256 {ctx['row_sha256']}); before this commit the family was absent."),
        "evidence": [{
            "path": REGISTRY,
            "json_pointer": f"#/families/{ctx['row_index']}",
            "line_start": ctx["row_lines"][0],
            "line_end": ctx["row_lines"][1],
            "quote": f'"event_type": "{fam["event_type"]}"',
            "quote_line": ctx["row_lines"][2],
            "file_sha256": ctx["after"]["sha256"],
            "quote_check": "exact",
        }],
    }


def apply_family(fam: dict, dl: str, args, state: dict) -> list[str]:
    et, row = fam["event_type"], fam["registry_row"]
    touched = []
    # 1. Registry append and revision.
    raw = (REPO / REGISTRY).read_text(encoding="utf-8")
    registry = json.loads(raw)
    if render_registry(registry) != raw:
        raise SystemExit("registry serialization does not round-trip; refusing to rewrite it")
    if any(f["event_type"] == et or f["family_id"] == row["family_id"] for f in registry["families"]):
        raise SystemExit("family already registered: " + et)
    before = {"revision": registry["registry_revision"], "sha256": sha256_bytes(raw.encode("utf-8")),
              "family_count": len(registry["families"])}
    registry["families"].append(row)
    registry["registry_revision"] = next_revision(before["revision"], args.revision_date)
    rendered = render_registry(registry)
    write_text(REGISTRY, rendered)
    touched.append(REGISTRY)
    after = {"revision": registry["registry_revision"], "sha256": sha256_bytes(rendered.encode("utf-8")),
             "family_count": len(registry["families"])}
    ctx = {"before": before, "after": after, "row_sha256": canonical_sha256(row), "row_index": before["family_count"],
           "row_lines": row_lines(rendered, row["family_id"]), "bucket": state["recount"].get(et, {}).get("bucket")}
    # 2. Depth assessment: membership from the row, eleven carried cells re-read now.
    grade = state["grades"][fam["lane"]][et]
    if sha256_file(REPO / fam["grade"]["path"]) != fam["grade"]["sha256"]:
        raise SystemExit("reviewed grade bytes changed since prepare: " + fam["grade"]["path"])
    cells = {"membership_version": membership_cell(fam, ctx), **carried_cells(grade, fam["grade"])}
    depth_rel = f"{args.report_dir}/depth/{et}.json"
    depth = {
        "schema_id": "pm.assurance.event_authority.admission_depth_assessment.v1",
        "assessment_kind": "admission_twelve_criteria",
        "writer": WRITER_ID,
        "merge": args.merge,
        "registry": {"path": REGISTRY, **after, "row_pointer": f"#/families/{ctx['row_index']}"},
        "base_commit": state["base"],
        "rubric": "Step 8 depth matrix, twelve criteria (DL-077); PASS needs Plans/ evidence",
        "native_execution": "NOT_RUN",
        "rows": [{"event_type": et, "family_id": row["family_id"], "family_revision": row["family_revision"],
                  "cells": {f: cells[f] for f in EVIDENCE_FIELDS}}],
    }
    (REPO / depth_rel).parent.mkdir(parents=True, exist_ok=True)
    depth_text = json.dumps(depth, indent=1, ensure_ascii=False) + "\n"
    write_text(depth_rel, depth_text)
    touched.append(depth_rel)
    ctx.update(depth_path=depth_rel, depth_sha256=sha256_bytes(depth_text.encode("utf-8")),
               record_path=f"{RECORD_DIR}/{et}.json")
    # 3. The family's own Decision Log entry (appended; ends with a blank line so later
    #    appends never move its pinned section bytes).
    log = (REPO / DECISION_LOG).read_text(encoding="utf-8")
    if f"### {dl}:" in log or re.search(rf"(?m)^plan_unit_id: {dl}$", log):
        raise SystemExit(dl + " already exists in the Decision Log")
    if not log.endswith("\n\n"):
        log += "\n"
    entry = decision_entry(dl, fam, ctx)
    write_text(DECISION_LOG, log + entry)
    touched.append(DECISION_LOG)
    frozen = state["frozen"]
    section = frozen.decision_section_bytes(PLANS / "Decision_Log.md", dl)
    # 4. The DL-077 admission record.
    record = {
        "schema_id": "pm.assurance.event_authority.post_august_admission_record.v1",
        "event_type": et,
        "family_id": row["family_id"],
        "implementation_receipt_sha256": sha256_file(REPO / POST_AUGUST_RECEIPT),
        "decision_ref": f"Plans/Decision_Log.md#{dl}",
        "decision_section_sha256": sha256_bytes(section),
        "registry_before": before,
        "registry_after": after,
        "registry_row_sha256": ctx["row_sha256"],
        "depth_assessment": {"path": depth_rel, "sha256": ctx["depth_sha256"]},
        "admission_landing": {
            "branch": args.branch,
            "commit": None,
            "record": args.landing_record,
            "note": "The landing commit is this family's commit on the branch once the merge lands. A record cannot name the commit that contains it, so the landing record names it.",
        },
        "criteria_not_passing_at_recording": [],
        "status_at_recording": "complete_depth",
        "recorded_by": args.recorded_by,
        "recorded_at_utc": args.recorded_at,
        "notes": [
            f"Admission merge 1 (EA-P2 B), written by {WRITER_ID} from the manifest row for this family; one commit holds the registry append, this record, its Decision Log entry, its depth assessment, its {'ledger rationale' if fam['kind'] == 'cpu' else 'recount OUTCOMES row'} and the DL-078 checkpoint pins.",
            "The decision entry is " + dl + ", which DL-096 makes Jared's decision entry for this family.",
            "registry_before is the registry at this commit's parent. If main's registry moves before the landing, the writer runs again on the new base and this record, its entry and the pins are taken again.",
            "Written under DL-077. The seal check recomputes completeness from the pinned assessment; the two fields ending in _at_recording are informational only.",
        ],
    }
    record_text = json.dumps(record, indent=1, ensure_ascii=False) + "\n"
    write_text(ctx["record_path"], record_text)
    touched.append(ctx["record_path"])
    problems = frozen.admission_record_problems(record, row)
    if problems:
        raise SystemExit(f"{et}: the frozen check refuses the record just written: {problems}")
    # 5. CPU ledger rationale or recount OUTCOMES row.
    if fam["kind"] == "cpu":
        sentence = (f" Registered at registry revision {after['revision']} in admission merge 1 under DL-078, DL-096 and DL-400 "
                    f"(decision Plans/Decision_Log.md#{dl}); DL-077 admission record {ctx['record_path']}. The seal check judges "
                    "this family by that record (INDIVIDUAL_DISPOSITION_SCHEMA.md, DL-077 note); the bucket, disposition, cohort "
                    "pins and retained evidence stay as written, since the frozen schema has no registered J248 value.")
        lines = (REPO / LEDGER).read_text(encoding="utf-8").split("\n")
        hits = [i for i, line in enumerate(lines) if line and json.loads(line).get("event_type") == et]
        if len(hits) != 1:
            raise SystemExit("ledger row not unique: " + et)
        ledger_row = json.loads(lines[hits[0]])
        if json.dumps(ledger_row, ensure_ascii=False) != lines[hits[0]]:
            raise SystemExit("ledger row serialization does not round-trip: " + et)
        ledger_row["disposition_rationale"] = ledger_row["disposition_rationale"] + sentence
        lines[hits[0]] = json.dumps(ledger_row, ensure_ascii=False)
        write_text(LEDGER, "\n".join(lines))
        touched.append(LEDGER)
        row_rel = f"{LEDGER_ROWS}/ROW_{et}.json"
        row_raw = (REPO / row_rel).read_bytes().decode("utf-8")
        crlf = "\r\n" in row_raw
        row_doc = json.loads(row_raw)
        if json.dumps(row_doc, indent=2, ensure_ascii=False) + "\n" != row_raw.replace("\r\n", "\n"):
            raise SystemExit("ledger row file serialization does not round-trip: " + row_rel)
        if row_doc.get("disposition_rationale") != ledger_row["disposition_rationale"][: -len(sentence)]:
            raise SystemExit("ledger row file and LEDGER.jsonl disagree before the edit: " + et)
        row_doc["disposition_rationale"] = ledger_row["disposition_rationale"]
        write_text(row_rel, json.dumps(row_doc, indent=2, ensure_ascii=False) + "\n", crlf=crlf)
        touched.append(row_rel)
    else:
        path = REPO / OUTCOMES
        if path.exists():
            doc = json.loads(path.read_text(encoding="utf-8"))
        else:
            doc = {"schema_id": "pm.assurance.event_authority.recount_outcomes.v1",
                   "recount_receipt_sha256": sha256_file(REPO / RECOUNT_RECEIPT),
                   "recount_list_sha256": sha256_file(REPO / RECOUNT_LIST), "rows": []}
            path.parent.mkdir(parents=True, exist_ok=True)
        if any(r.get("event_type") == et for r in doc["rows"]):
            raise SystemExit("recount outcome already present: " + et)
        doc["rows"].append({"event_type": et, "outcome": "registered"})
        doc["rows"].sort(key=lambda r: r["event_type"])
        write_text(OUTCOMES, json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
        touched.append(OUTCOMES)
    # 6. Lane bookkeeping: a coordination ledger row flips to admitted with its prepared row.
    if fam["lane"] == "DCO":
        craw = (REPO / COORDINATION_LEDGER).read_text(encoding="utf-8")
        cdoc = json.loads(craw)
        if json.dumps(cdoc, indent=2, ensure_ascii=False) + "\n" != craw:
            raise SystemExit("coordination ledger serialization does not round-trip")
        i, crow = find_by_event(cdoc["rows"], et)
        if crow["admission_status"] != "prepared_not_admitted" or canonical_sha256(crow["registry_row"]) != ctx["row_sha256"]:
            raise SystemExit("coordination ledger row is not the prepared row being appended: " + et)
        reordered = {}
        for key, value in crow.items():
            reordered[key] = "admitted_static_contract" if key == "admission_status" else value
            if key == "runtime_producer_status":
                reordered["authority_contract_ref"] = "Plans/coordination_projection_contracts.schema.json#/x-pm-event-authority-binding"
        if "authority_contract_ref" not in reordered:
            reordered["authority_contract_ref"] = "Plans/coordination_projection_contracts.schema.json#/x-pm-event-authority-binding"
        cdoc["rows"][i] = reordered
        write_text(COORDINATION_LEDGER, json.dumps(cdoc, indent=2, ensure_ascii=False) + "\n")
        touched.append(COORDINATION_LEDGER)
    # 7. DL-078 checkpoint pins.
    cur = (REPO / CURRENTNESS).read_text(encoding="utf-8")
    cur, n1 = re.subn(r'(?m)^EVENT_FAMILY_REGISTRY_REVISION = "[^"]+"$', f'EVENT_FAMILY_REGISTRY_REVISION = "{after["revision"]}"', cur)
    cur, n2 = re.subn(r"(?m)^EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = \d+$", f"EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = {after['family_count']}", cur)
    if (n1, n2) != (1, 1):
        raise SystemExit("checkpoint pins not found exactly once in " + CURRENTNESS)
    paragraph = (
        f"{PIN_MARKER} 1 (Jared, EA-P2 B, 2026-11-14), one family per commit, each with its own\n"
        f"# Decision Log entry and DL-077 admission record; latest {et} (Plans/Decision_Log.md#{dl}):\n"
        f"# registry {after['revision']}, {after['family_count']} families, SHA-256\n"
        f"# {after['sha256']} (predecessor\n"
        f"# {before['sha256']}). The audit status file's pinned revision and hash\n"
        "# move with the next reseal, not here.\n"
    )
    start = cur.find(PIN_MARKER)
    if start >= 0:
        end = cur.index("# move with the next reseal, not here.\n", start) + len("# move with the next reseal, not here.\n")
        cur = cur[:start] + paragraph + cur[end:]
    else:
        anchor = "# Checkpoint data only: denominator and contract-depth clearance remain false.\n"
        if cur.count(anchor) != 1:
            raise SystemExit("checkpoint provenance anchor not found in " + CURRENTNESS)
        cur = cur.replace(anchor, paragraph + anchor)
    write_text(CURRENTNESS, cur)
    touched.append(CURRENTNESS)
    for rel in TEST_PINS:
        text = (REPO / rel).read_text(encoding="utf-8")
        text, n = TEST_PIN.subn(f"APPROVED_CHECKPOINT_FAMILY_COUNT = {after['family_count']}  # moved under DL-078 by each registration", text)
        if n != 1:
            raise SystemExit("approved checkpoint pin not found exactly once in " + rel + " (run the census generalization first)")
        write_text(rel, text)
        touched.append(rel)
    state["results"].append({"event_type": et, "dl": dl, "registry_after": after, "record": ctx["record_path"],
                             "depth": depth_rel, "row_sha256": ctx["row_sha256"]})
    return touched


def commit_message(fam: dict, dl: str, result: dict) -> str:
    et = fam["event_type"]
    what = "ledger rationale" if fam["kind"] == "cpu" else "recount OUTCOMES row"
    return (
        f"plans: {dl} registers {et} (admission merge 1, EA-P2 B)\n\n"
        f"One commit per family ({WRITER_ID}): registry {result['registry_after']['revision']} with "
        f"{result['registry_after']['family_count']} families (SHA-256 {result['registry_after']['sha256'][:12]}...), "
        f"the row appended with canonical SHA-256 {result['row_sha256'][:12]}...; its Decision Log entry {dl} "
        f"(DL-096 decision entry); its DL-077 admission record {result['record']}; its 12/12 depth assessment "
        f"{result['depth']}; its {what}; the DL-078 checkpoint pins. The frozen seal check's own "
        "admission_record_problems returns no problem for the record. Shards and the plan index are regenerated "
        "once per merge, not here.\n"
    )


def apply(args) -> int:
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    ready = [f for f in manifest["families"] if f["status"] == "ready"]
    if args.only:
        wanted = set(args.only.split(","))
        ready = [f for f in ready if f["event_type"] in wanted]
    ids = dl_numbers(args.dl_ids)
    if args.limit:
        live_now = {f["event_type"] for f in load(REGISTRY)["families"]}
        done = sum(f["event_type"] in live_now for f in ready)
        ready = ready[: done + args.limit]
    if len(ids) < len(ready):
        raise SystemExit(f"{len(ready)} admissions need {len(ready)} DL ids; --dl-ids gives {len(ids)}")
    if args.require_three_digit and any(not re.fullmatch(r"DL-\d{3}", i) for i in ids[: len(ready)]):
        raise SystemExit("the frozen seal check accepts only DL-\\d{3} decision refs (validator line 443)")
    if git("status", "--porcelain", "--untracked-files=no").strip():
        raise SystemExit("working tree not clean")
    head = git("rev-parse", "HEAD").strip()
    if manifest["base"] != head and not args.allow_new_base:
        raise SystemExit(f"manifest was prepared at {manifest['base']}, HEAD is {head}; prepare again")
    state = {
        "base": head,
        "grades": {lane: grade_rows(lane) for lane in SELF_GRADES},
        "recount": {row["name"]: row for row in load(RECOUNT_LIST)},
        "frozen": load_module("pm_ea_frozen_check_for_writer", FROZEN),
        "results": [],
    }
    live = {f["event_type"] for f in load(REGISTRY)["families"]}
    for fam, dl in zip(ready, ids):
        if fam["event_type"] in live:
            # Resume: a family already written by this writer keeps the id it was given.
            record_path = REPO / RECORD_DIR / (fam["event_type"] + ".json")
            record = json.loads(record_path.read_text(encoding="utf-8")) if record_path.is_file() else {}
            if record.get("decision_ref") != f"Plans/Decision_Log.md#{dl}":
                raise SystemExit(f"{fam['event_type']} is registered without this run's record for {dl}")
            continue
        try:
            touched = apply_family(fam, dl, args, state)
        except Gap as gap:
            git("checkout", "--", ".")
            git("clean", "-fdq", "--", args.report_dir, RECORD_DIR, AUDIT + "/recount")
            raise SystemExit(f"{fam['event_type']}: {gap}")
        if args.commit:
            audit = sorted(p for p in set(touched) if p.startswith(AUDIT + "/"))
            other = sorted(p for p in set(touched) if not p.startswith(AUDIT + "/"))
            git("add", "--", *other)
            if audit:
                # Plans/.audits/* is ignored for new files; these ledger and outcome files are tracked canon.
                git("add", "-f", "--", *audit)
            msg = commit_message(fam, dl, state["results"][-1])
            git("commit", "-q", "-m", msg + "\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n")
            state["results"][-1]["commit"] = git("rev-parse", "HEAD").strip()
        print(json.dumps(state["results"][-1]))
    if args.results:
        Path(args.results).write_text(json.dumps(state["results"], indent=1) + "\n", encoding="utf-8")
    return 0


# ---------------------------------------------------------------- verify

def verify(args) -> int:
    frozen = load_module("pm_ea_frozen_check_for_verify", FROZEN)
    readiness = load_module("pm_impl_readiness_for_verify", "scripts/pm-implementation-readiness.py")
    registry = load(REGISTRY)
    live = {f["event_type"]: f for f in registry["families"]}
    known37 = load(AUDIT + "/known37_event_types.json")
    known = known37.get("event_types") if isinstance(known37, dict) else known37
    admitted, issues, _ = frozen.validate_post_august_admissions(registry, known)
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    rows = []
    for fam in manifest["families"]:
        et = fam["event_type"]
        own = [i.split(": ", 1)[1] for i in issues if i.startswith(et + ": ")]
        rows.append({"event_type": et, "lane": fam["lane"], "kind": fam.get("kind"), "prepared": fam["status"],
                     "gaps": fam["gaps"], "registered": et in live, "frozen_check_admitted": et in admitted,
                     "frozen_check_problems": own})
    failures = readiness.event_family_registry_data_failures(registry, load(REGISTRY_SCHEMA), path_label=REGISTRY,
                                                             include_residuals=False)
    out = {"head": git("rev-parse", "HEAD").strip(), "registry": {"revision": registry["registry_revision"],
           "family_count": len(registry["families"]), "sha256": sha256_file(REPO / REGISTRY)},
           "readiness_registry_failures": failures,
           "frozen_check_post_august_issues_outside_manifest": [i for i in issues if i.split(": ", 1)[0] not in
                                                               {f["event_type"] for f in manifest["families"]}],
           "families": rows,
           "counts": {"registered": sum(r["registered"] for r in rows),
                      "admitted_by_frozen_check": sum(r["frozen_check_admitted"] for r in rows),
                      "blocked_at_prepare": sum(r["prepared"] == "blocked" for r in rows)}}
    text = json.dumps(out, indent=1, ensure_ascii=False) + "\n"
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
    print(json.dumps(out["counts"]))
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("prepare")
    p.add_argument("--merge", default="admission-merge-1")
    p.add_argument("--out", required=True)
    p.set_defaults(func=prepare)
    a = sub.add_parser("apply")
    a.add_argument("--manifest", required=True)
    a.add_argument("--dl-ids", required=True, help="e.g. DL-600..DL-772 or a comma list")
    a.add_argument("--revision-date", required=True)
    a.add_argument("--recorded-at", required=True)
    a.add_argument("--recorded-by", default="claude-opus-5.5:ea-pnc-s5w-20261114")
    a.add_argument("--branch", required=True)
    a.add_argument("--merge", default="admission-merge-1")
    a.add_argument("--report-dir", default="reports/event-authority-20261114/admission-merge-1")
    a.add_argument("--landing-record", default="reports/event-authority-20261114/admission-merge-1/LANDING.md")
    a.add_argument("--only", default="")
    a.add_argument("--limit", type=int, default=0)
    a.add_argument("--require-three-digit", action="store_true")
    a.add_argument("--allow-new-base", action="store_true")
    a.add_argument("--commit", action="store_true")
    a.add_argument("--results", default="")
    a.set_defaults(func=apply)
    v = sub.add_parser("verify")
    v.add_argument("--manifest", required=True)
    v.add_argument("--out", default="")
    v.set_defaults(func=verify)
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
