#!/usr/bin/env python3
"""Derived registry-row rules for Event Authority admission merges (PNC-019 S5, stream E).

Only the six DCO families carry a prepared registry row (Plans/coordination_event_admission.json
registry_row); every other family's row is derived here from its reviewed grade in reports/ and
its lane contract in canon. Each field comes from a named source and is recorded in the row's
provenance; a field no source states, or two sources state differently, raises Gap, which blocks
that family instead of being guessed. scripts/pm-ea-admission-writer.py imports these rules and
owns the mechanics (commits, records, depth files, ledgers, pins).

The rules, in order of precedence (each is a function below):
- family_id and family_revision: the reviewed grade; where the grade minted no id, the live
  registry convention event-family-<event type with . and _ as ->.
- scope_policy: the lane contract, else a scope token stated once by the graded scope_identity
  evidence, else the payload schema's scope_kind enum; any disagreement blocks.
- payload editions: the lane contract's refs, each resolved exactly as readiness resolves it.
- semantic and payload owners: the lane contract, else the graded owner_doc and
  closed_payload_schema evidence; each must resolve to the document that declares the unit.
- retention: the graded retention cell's policy ids cross-checked with the lane contract;
  an application edition takes a named -APPLICATION- policy, else the Project policy only when
  that policy is shared by registered application editions. usage.event alone takes SP-594's
  setting selector and immutable first-save anchor, rechecked against its live owner text.
- payload_versions: the DL-300 approval-pair form; legacy: no aliases, reject_unhandled_secrets,
  identity pointers from the payload's own identity fields.
"""

from __future__ import annotations


from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path
from typing import Any


REPO = Path(__file__).resolve().parents[1]
PLANS = REPO / "Plans"

REGISTRY_SCHEMA = "Plans/event_family_registry.schema.json"
COORDINATION_LEDGER = "Plans/coordination_event_admission.json"
STORAGE_REGISTRY = "Plans/storage_value_registry.json"

EVIDENCE_FIELDS = (
    "membership_version", "owner_doc", "producer", "closed_payload_schema", "scope_identity",
    "replay_idempotency", "retention", "redaction_custody", "transitions", "consumers_checkpoints",
    "compatibility_withdrawal", "positive_negative_oracles",
)
# Storage policies of derived or index stores, never an event history's own policy.
DERIVED_STORE_POLICIES = {"RP-PROJECTION-3GEN", "RP-EVENT-INDEX-SOURCE"}
# Policies an application edition shares with its Project edition, each with the canon that says so.
# Any other policy (a per-Project allowance such as RP-TELEMETRY-90D or RP-OPERATIONAL-2555D) needs the
# application edition's own policy stated by the reviewed grade or the lane.
SCOPE_SHARED_POLICIES = {
    # Shared by registered application editions (the Goal, Goal-run and approval rows of the live registry).
    "RP-AUTHORITY-INDEFINITE", "RP-RUNTIME-365D",
    # The count is per thread in an application chat exactly as in a Project chat; cardinality_scope=thread
    # is the policy's own scope for both, not an application counterpart bucket (Plans/storage-plan.md:17567,
    # DL-292, SP-349). DL-456 states it for the four session-prompt histories ("in Project and application
    # chats alike", storage-plan.md:17682; CV-1461..1464 item 7).
    "RP-CHAT-THREAD-LIFETIME",
    # SP-351 gives the same object, with no application counterpart, to the Goal records' application
    # editions (Plans/storage-plan.md:30723-30730); the policy has no counting scope.
    "RP-GOAL-THREAD-LIFETIME",
    # SP-349's explicit application-wide operational buckets retain these registered policy objects;
    # DL-083/DL-089 and SP-720/OSI-681 preserve the operational and coordination assignments.
    "RP-OPERATIONAL-2555D", "RP-COORDINATION-180D",
}
IDENTITY_KEYS = ("project_id", "thread_id", "run_id", "node_id", "attempt_id")

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


_GRADE_DOCS: dict[tuple, dict] = {}
_POLICY_KEYS: dict[tuple, set] = {}

def policy_keys() -> set:
    path = REPO / STORAGE_REGISTRY
    stat = path.stat()
    key = (stat.st_mtime_ns, stat.st_size)
    if key not in _POLICY_KEYS:
        _POLICY_KEYS[key] = {(p["policy_id"], p["policy_version"]) for p in load(STORAGE_REGISTRY)["retention_policies"]}
    return _POLICY_KEYS[key]

def grade_rows(lane: str) -> dict[str, dict]:
    path = REPO / SELF_GRADES[lane]
    stat = path.stat()
    key = (str(path), stat.st_mtime_ns, stat.st_size)
    if key not in _GRADE_DOCS:
        _GRADE_DOCS[key] = load(SELF_GRADES[lane])
    doc = _GRADE_DOCS[key]
    rows = doc.get("ready") if isinstance(doc, dict) and "ready" in doc else doc.get("rows") if isinstance(doc, dict) and "rows" in doc else doc.get("families")
    return {row["event_type"]: row for row in rows}


# ---------------------------------------------------------------- lane contracts

def find_by_event(rows: list, event_type: str, key: str = "event_type") -> tuple[int, dict]:
    hits = [(i, r) for i, r in enumerate(rows) if isinstance(r, dict) and r.get(key) == event_type]
    if len(hits) != 1:
        raise Gap(f"lane contract rows naming the family: {len(hits)}")
    return hits[0]


def owner_contract(doc: str, event_type: str) -> tuple[str, int, str]:
    """(unit, canonical_text line, text) of the one PlanUnit in doc that is the owner contract 'for exactly <type>@'."""
    lines = (REPO / doc).read_text(encoding="utf-8").split("\n")
    hits = []
    for i, line in enumerate(lines):
        match = re.fullmatch(r"plan_unit_id: ([A-Z][A-Z0-9]*-[0-9]+)", line)
        if not match:
            continue
        end = next((k for k in range(i + 1, len(lines)) if lines[k] == "```"), len(lines))
        body = "\n".join(lines[i:end])
        if re.search(r"for exactly " + re.escape(event_type) + r"@[0-9]", body):
            start = next((k for k in range(i, end) if lines[k].startswith("canonical_text:")), i)
            hits.append((match.group(1), start + 1, body))
    if len(hits) != 1:
        raise Gap(f"owner contracts for exactly {event_type} in {doc}: {len(hits)}")
    return hits[0]


def lane_contract(lane: str, event_type: str) -> dict:
    """Normalized lane facts: scope, payload editions, owner refs and retention as each lane states them.

    Keys: scope_policy, editions {scope: 'path#pointer'}, retention {scope: 'RP@v'} (may be
    partial), owners {semantic, payload, storage} (may be partial), contract_ref, prepared_row.
    """
    out: dict[str, Any] = {"owners": {}, "retention": {}, "editions": {}, "edition_ids": {}, "scope_policy": None,
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
                   edition_ids={"project": row["payload_schema_id"],
                                **({"application": row["application_payload_schema_id"]} if "application" in scopes else {})},
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
        # The family's own owner contract states its edition (CV-574, CV-578): "the preserved Project
        # edition", with the application edition kept apart by CV-365/366 and SP-349 and not admitted here.
        unit, line, text = owner_contract("Plans/Contracts_V0.md", event_type)
        flat = " ".join(text.split())
        if "preserved Project edition" in flat and re.search(
                r"application edition(?: without admission here)?\.|separately unadmitted application edition", flat):
            out["scope_policy"] = "project_only"
            out["scope_source"] = f"Plans/Contracts_V0.md:{line} ({unit}: the preserved Project edition; the application edition is not admitted here)"
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
                   edition_ids={"project": row["payload_schema_id"]},
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
                   edition_ids={s: v["schema_id"] for s, v in variants.items()},
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
                   edition_ids={"project": row["payload_schema_id"]},
                   retention={"project": row["retention_policy"]},
                   owners={"semantic": unit_ref(row["owner_unit"]), "payload": unit_ref(row["cv_unit"]),
                           "storage": unit_ref(row["sp_unit"])})
        return out
    from pm_ea_merge2_rows import contract
    return contract(lane, event_type)


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
    delta = grade.get("retention_delta")
    if delta:
        return {scope: delta[key].split("@")[0] for scope, key in
                (("project", "history_policy_ref"), ("application", "application_policy_ref")) if delta.get(key)}
    cell = grade["cells"]["retention"]
    history = re.match(r"Event history bound to (RP-[A-Z0-9-]+)@", str(cell.get("finding") or ""))
    if history:
        return {"project": history.group(1)}
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
    if "scope_kind" in props or (isinstance(props.get("scope"), dict) and ("enum" in props["scope"] or "const" in props["scope"])):
        return "", props
    for name in ("context", "scope"):
        inner = (props.get(name) or {}).get("properties") or {}
        if "scope_kind" in inner or "kind" in inner:
            return "/" + name, inner
    return "", props


def scope_from_schema(schema: dict) -> str | None:
    carrier = scope_object(schema)[1]
    prop = carrier.get("scope_kind") or carrier.get("kind") or carrier.get("scope") or {}
    values = prop.get("enum") or ([prop["const"]] if "const" in prop else [])
    values = {"application" if value == "app" else value for value in values}
    if values == {"project", "application"}:
        return "application_or_project"
    if values == {"project"}:
        return "project_only"
    if values == {"application"}:
        return "application_only"
    # A closed Project payload with a required non-null Project ID cannot describe an app EventRecord.
    # This is schema evidence, not a default for payloads with no scope field.
    props = schema.get("properties") or {}
    if "project_id" in (schema.get("required") or []) and (props.get("project_id") or {}).get("type") == "string":
        return "project_only"
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
    if grade.get("retention_delta"):
        contract = copy.deepcopy(contract)
        delta = grade["retention_delta"]
        contract["retention"] = {scope: delta[key] for scope, key in
            (("project", "history_policy_ref"), ("application", "application_policy_ref")) if delta.get(key)}
    family_id, revision = grade.get("family_id"), grade.get("family_revision")
    provenance: dict[str, Any] = {"family_id": SELF_GRADES[family["lane"]], "family_revision": SELF_GRADES[family["lane"]]}
    proposed_id = "event-family-" + re.sub(r"[._]", "-", event_type)
    if (family_id is None or (isinstance(family_id, str) and
            (family_id.startswith("candidate-only:") or family_id == event_type.replace(".", "_")
             or family_id.replace("_", "-") == proposed_id))):
        # Every live registry row is named event-family-<event type, dots and underscores as hyphens>.
        family_id = proposed_id
        provenance["family_id"] = "registry naming convention (every live row); the reviewed grade minted none"
    if not isinstance(family_id, str) or not re.fullmatch(r"event-family-[a-z0-9]+(?:-[a-z0-9]+)*", family_id):
        raise Gap("reviewed grade names no registry family_id")
    revision_match = re.match(r"([1-9][0-9]*\.[0-9]+\.[0-9]+)(?:\s|$)", str(revision or ""))
    if revision_match:
        revision = revision_match.group(1)
    elif isinstance(grade.get("prepared_payload_version"), str):
        revision = grade["prepared_payload_version"]
        provenance["family_revision"] = SELF_GRADES[family["lane"]] + " prepared_payload_version"
    elif contract.get("family_revision"):
        revision = contract["family_revision"]
        provenance["family_revision"] = contract["contract_ref"] + " exact prepared version"
    if not isinstance(revision, str):
        raise Gap("reviewed grade names no family_revision")
    if contract["prepared_row"] is not None:
        row = contract["prepared_row"]
        if (row.get("event_type"), row.get("family_id"), row.get("family_revision")) != (event_type, family_id, revision):
            raise Gap("prepared registry row disagrees with the reviewed grade's family identity")
        return row, {"row": contract["contract_ref"] + "/registry_row (prepared, appended unchanged)"}

    # Payload editions resolve exactly as readiness resolves them, each for its own scope edition
    # (a closed payload listing one id per edition resolves that edition's id).
    def resolve(scope: str, ref: str) -> dict:
        from pm_ea_payload_selectors import selector_id, selector_source
        path, pointer = split_ref(ref)
        probe = {"payload_schema_ref": {"path": path, "json_pointer": pointer, "schema_id": "?"}}
        schema, schema_id = readiness.event_family_payload_schema(probe, scope)
        if schema is None or not isinstance(schema_id, str) or not schema_id:
            raise Gap(f"{scope} payload {ref} has no single resolvable schema id (readiness resolver)")
        return {"path": path, "json_pointer": pointer, "schema_id": schema_id, "schema": schema,
                "selector_id": selector_id(event_type, scope, schema, schema_id, root=REPO),
                "selector_source": selector_source(event_type, scope, schema, schema_id, path, pointer, root=REPO)}

    editions = {scope: resolve(scope, ref) for scope, ref in sorted(contract["editions"].items())}
    if not editions:
        raise Gap("no payload edition stated")
    provenance["payload_editions"] = contract["contract_ref"]

    scope_policy = contract["scope_policy"]
    if scope_policy is None:
        from pm_ea_merge2_rows import _owner_scope
        scope_policy, source = _owner_scope(grade, event_type)
        if source:
            contract["scope_source"] = source
    graded_scope = scope_from_grade(grade)
    schema_scope = scope_from_schema(next(iter(editions.values()))["schema"])
    if scope_policy is not None:
        provenance["scope_policy"] = contract.get("scope_source") or contract["contract_ref"]
    elif graded_scope is not None:
        scope_policy = graded_scope
        provenance["scope_policy"] = SELF_GRADES[family["lane"]] + " scope_identity evidence"
    else:
        scope_policy = schema_scope
        provenance["scope_policy"] = "payload schema scope_kind"
    if event_type in ("panel.redocked", "panel.undocked") and scope_policy == "application_or_project" and graded_scope == "project_only":
        # MERGE3 finding 3: named Application specimens + per-family Storage
        # contract supersede the incomplete preparation scope; keep grade history.
        if "named panel payload positives" not in contract.get("scope_source", ""):
            raise Gap("panel correction lacks reviewed owner-positive scope proof")
        provenance["superseded_preparation_scope"] = graded_scope
        graded_scope = None
    for other in (graded_scope, schema_scope):
        if other is not None and other != scope_policy:
            raise Gap(f"scope policy sources disagree: {scope_policy} vs {other}")
    if scope_policy not in ("project_only", "application_or_project", "application_only"):
        raise Gap("scope policy not stated")
    needed = {"project_only": {"project"}, "application_only": {"application"},
              "application_or_project": {"project", "application"}}[scope_policy]
    if scope_policy == "application_or_project" and set(editions) == {"project"}:
        # One closed payload serving both scopes (the DM precedent of a nullable project_id).
        project = editions["project"]
        editions["application"] = resolve("application", project["path"] + project["json_pointer"])
    if scope_policy == "application_only" and set(editions) == {"project"} and contract["scope_policy"] is None:
        project = editions.pop("project")
        editions["application"] = resolve("application", project["path"] + project["json_pointer"])
    if set(editions) != needed:
        raise Gap(f"payload editions {sorted(editions)} do not match scope policy {scope_policy}")
    for scope, stated in sorted(contract["edition_ids"].items()):
        if scope in editions and editions[scope]["selector_id"] != stated:
            raise Gap(f"{scope} envelope selects {editions[scope]['selector_id']}, the lane contract states {stated}")

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
        elif len(cv_units) == 1:
            owners["payload"] = unit_ref(cv_units[0])
        elif cv_units:
            from pm_ea_merge2_rows import _owner_body
            payload_refs = [v["path"] + v["json_pointer"].removesuffix("#") for v in editions.values()]
            candidates = [u for u in cv_units if event_type in _owner_body(u)
                          and any(ref in _owner_body(u) for ref in payload_refs)]
            if len(candidates) != 1:
                raise Gap("multiple CV units do not declare one exact-family payload owner role")
            owners["payload"] = unit_ref(candidates[0])
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

    # SP-594 supplies usage.event's setting selector independently of source-row policies.
    if event_type == "usage.event":
        ref = readiness.event_family_usage_retention_ref()
        failures = readiness.event_family_setting_retention_failures(
            event_type, ref, path_label="derived:usage.event/retention_policy_ref")
        if failures:
            raise Gap(failures[0]["error"])
        # A merge-2 lane can carry the selector explicitly; never silently repair it.
        for stated_ref in contract["retention"].values():
            if isinstance(stated_ref, dict):
                failures = readiness.event_family_setting_retention_failures(
                    event_type, stated_ref, path_label="lane:usage.event/retention_policy_ref")
                if failures:
                    raise Gap(failures[0]["error"])
            elif stated_ref not in ("PENDING_RETENTION_BINDING", "ai.usage.usage-retention"):
                raise Gap("event_family_registry_setting_retention_policy_id_forbidden")
        delta = grade.get("retention_delta") or {}
        if delta.get("history_policy_ref") or delta.get("application_policy_ref"):
            raise Gap("event_family_registry_setting_retention_policy_id_forbidden")
        for field, value in (("history_policy_setting_ref", ref["setting_key"]),
                             ("history_anchor", ref["anchor"])):
            if field in delta and delta[field] != value:
                raise Gap("usage.event retention_delta " + field + " disagrees with SP-594")
        retention = {scope: copy.deepcopy(ref) for scope in sorted(needed)}
        provenance["retention"] = ref["owner_ref"] + " signed E8-1 A; immutable first durable save; no policy ID"
    else:
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
                    provenance["retention_application"] = "shared registered policy object under the exact owner/SP-349 counterpart binding (" + project + ")"
            if len(candidates) != 1:
                raise Gap(f"{scope} retention not stated exactly once (graded {graded.get(scope)}, lane {stated.get(scope)})")
            token = candidates.pop()
            version = None
            for s, v in contract["retention"].items():
                if v.split("@")[0] == token and "@" in v:
                    version = v.split("@")[1]
            ref = policy_ref(token + ("@" + version if version else ""))
            policies = policy_keys()
            if ref is None or (ref["policy_id"], ref["policy_version"]) not in policies:
                raise Gap(f"{scope} retention {token} is not a registered policy object")
            retention[scope] = ref
        provenance["retention"] = SELF_GRADES[family["lane"]] + " retention cell; " + str(contract["contract_ref"])

    top_scope = "project" if "project" in editions else "application"
    top = editions[top_scope]
    source_refs = []
    for ref in (owners["semantic"], owners["payload"], owners.get("storage"), *contract.get("extra_source_refs", [])):
        if ref and ref not in source_refs:
            source_refs.append(ref)
    for scope in sorted(editions):
        ref = editions[scope]["path"] + editions[scope]["json_pointer"]
        if ref not in source_refs:
            source_refs.append(ref)
        if editions[scope]["selector_id"] != editions[scope]["schema_id"]:
            selector_ref = editions[scope]["selector_source"]
            if selector_ref not in source_refs:
                source_refs.append(selector_ref)
    provenance['payload_schema_id'] = {scope: edition['selector_source'] for scope, edition in editions.items()}
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
        "payload_schema_id": top["selector_id"],
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
    if family["lane"] == "S4B":
        # GB17 binds all five slots, including nullable linkage slots, exactly as the Browser admission row.
        row["legacy"]["identity_json_pointers"] = {key: ["/payload/context/" + key] for key in IDENTITY_KEYS}
    if len(editions) > 1:
        row["payload_versions"] = [
            {
                "scope_kind": scope,
                "payload_schema_id": editions[scope]["selector_id"],
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
