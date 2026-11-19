#!/usr/bin/env python3
"""Admission-aware mode for the Event Authority lane checkers (PNC-019, stream E; tool issues T222 and T225).

The lane checkers were written for the preparation phase: each one required its families to be absent from
``Plans/event_family_registry.json``. After an admission merge a family is registered, and a checker must then
accept it only through its exact, complete DL-077 admission record. Every lane checker asks this module for one
verdict per family and keeps every preparation guard it had:

``verdict(event_type, root=..., registry=..., prepared_row=...)`` returns a dict whose ``mode`` is

``prepared``
    The family is not on the registry, and no admission record names it. The checker runs exactly as it did
    during preparation.
``admitted``
    The family is registered once, and its DL-077 record is exact and complete (below). The checker accepts the
    registration in place of its "must remain unadmitted" guard.
``refused``
    Anything else. ``code`` names the first problem, in the order below; ``detail`` says what differed. The
    checker refuses the family through its own preparation guard and adds ``code`` to the message.

Admitted means all of these, checked in this order; the first that fails is the code:

 1. exactly one registry row has the event type, and no other row has its family_id    registered_more_than_once
 2. ``reports/event-authority-20260911/admission-records/<event_type>.json`` exists       registered_without_admission_record
 3. it is one JSON object naming this event type, and no other record names it          admission_record_not_for_family
 4. it records one registry step of one family (no ``registry_step_event_types``)       admission_record_step_unsupported
 5. the live row's canonical SHA-256 equals the record's ``registry_row_sha256``        registry_row_differs_from_pinned_row
    and, when the lane passes its own prepared row, that row's too                       registry_row_differs_from_prepared_row
 6. the frozen seal check's own ``admission_record_problems(record, row)`` is empty      admission_record_incomplete
    (schema id, implementation receipt bytes, family id, decision entry bytes, both registry pins' shape and
    one-family step, row hash, and the pinned 12/12 depth assessment with Plans evidence)
 7. ``registry_before`` is this registry's own history at the pinned revision            registry_before_mismatch
 8. ``registry_after`` is too, with this family's pinned row as its last row             registry_after_mismatch
    Both are first rebuilt from the registry: its first N rows at the pinned revision, rendered as the registry is
    written, must hash to the pinned SHA-256 (the registry document judged, or this tree's own registry file when a
    caller judges a synthetic document). When that differs (an earlier row was revised after the admission), the
    exact blob is looked up in the checkout's own git history instead, read-only: it must
    have the pinned revision and family count, the before blob must be the after blob less its last row, and
    the last row must be this family's pinned row.
 9. the decision entry the record pins names the row hash and both registry pins         decision_entry_does_not_pin_admission
10. the landing record the record names exists and names the event type                   admission_landing_record_missing

A family that is not registered while an admission record names it is ``refused`` with
``admission_record_without_registration``.

The module reads files only. Its single subprocess is the read-only git lookup of steps 7 and 8, run with
``git -C <root>`` and without inherited ``GIT_DIR``/``GIT_WORK_TREE``, and only when ``root`` is itself the top
of a git work tree. It never edits the frozen validator, the registry or a record. ``native_execution`` stays
NOT_RUN: this is static planning evidence.

A family already registered whose row a lane revises in place to its pinned prepared successor (S5b) has no
DL-077 record; ``revision_verdict`` judges it through its applied revision record instead (R1-R12 below).

``python3 scripts/pm_ea_admission_mode.py [--json OUT] [event_type ...]`` prints the verdict of each named
family (default: every family with an admission record and every registered family beyond the record set).
"""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = "Plans/event_family_registry.json"
DECISION_LOG = "Plans/Decision_Log.md"
RECORD_DIR = "reports/event-authority-20260911/admission-records"
FROZEN = "Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py"
STEP_FIELD = "registry_step_event_types"
POST_AUGUST_RECEIPT = "reports/event-authority-20260911/step-10-post-august-admission-receipt.json"

CODES = (
    "registered_more_than_once",
    "registered_without_admission_record",
    "admission_record_not_for_family",
    "admission_record_step_unsupported",
    "registry_row_differs_from_pinned_row",
    "registry_row_differs_from_prepared_row",
    "admission_record_incomplete",
    "registry_before_mismatch",
    "registry_after_mismatch",
    "decision_entry_does_not_pin_admission",
    "admission_landing_record_missing",
    "admission_record_without_registration",
)

_FROZEN: dict = {}
_HISTORY: dict = {}
_STATES: dict = {}


def canonical_sha256(value) -> str:
    """The DL-077 row recipe: sorted keys, compact separators, UTF-8."""
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
                          .encode("utf-8")).hexdigest()


def rendered(doc: dict) -> bytes:
    """The registry exactly as the admission writer writes it."""
    return (json.dumps(doc, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def load_registry(root: Path = ROOT) -> dict:
    return json.loads((Path(root) / REGISTRY).read_text(encoding="utf-8"))


def frozen_module(root: Path = ROOT):
    """The frozen seal check, loaded from ``root`` itself so its paths are that tree's (never edited)."""
    path = (Path(root) / FROZEN).resolve()
    if path not in _FROZEN:
        spec = importlib.util.spec_from_file_location("pm_ea_admission_mode_frozen_%d" % len(_FROZEN), path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _FROZEN[path] = module
    return _FROZEN[path]


def reset_caches() -> None:
    """Forget loaded frozen modules and git histories (a test that edits a tree between verdicts)."""
    _FROZEN.clear()
    _HISTORY.clear()
    _STATES.clear()


def _refused(event_type: str, code: str, detail) -> dict:
    assert code in CODES, code
    return {"event_type": event_type, "mode": "refused", "code": code, "detail": detail}


def _git_history(root: Path) -> dict | None:
    """sha256 -> registry bytes for every registry blob reachable from HEAD; None when root is no git top level."""
    root = Path(root).resolve()
    if root in _HISTORY:
        return _HISTORY[root]
    env = {k: v for k, v in os.environ.items() if k not in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE",
                                                           "GIT_OBJECT_DIRECTORY", "GIT_COMMON_DIR")}
    history = None
    try:
        top = subprocess.run(["git", "-C", str(root), "rev-parse", "--show-toplevel"], env=env,
                             capture_output=True, text=True, timeout=60)
        if top.returncode == 0 and Path(top.stdout.strip()).resolve() == root:
            log = subprocess.run(["git", "-C", str(root), "log", "--format=", "--raw", "--no-abbrev", "--no-renames",
                                  "-m", "HEAD", "--", REGISTRY], env=env, capture_output=True, text=True, timeout=300)
            if log.returncode == 0:
                blobs = sorted({field for line in log.stdout.splitlines() if line.startswith(":")
                                for field in line.split()[2:4] if not set(field) <= {"0"}})
                batch = subprocess.run(["git", "-C", str(root), "cat-file", "--batch"], env=env,
                                       input=("\n".join(blobs) + "\n").encode(), capture_output=True, timeout=300)
                if batch.returncode == 0:
                    history, out, at = {}, batch.stdout, 0
                    while at < len(out):
                        newline = out.index(b"\n", at)
                        header = out[at:newline].split()
                        if len(header) != 3 or header[1] != b"blob":
                            history = None
                            break
                        size = int(header[2])
                        body = out[newline + 1:newline + 1 + size]
                        history[hashlib.sha256(body).hexdigest()] = body
                        at = newline + 1 + size + 1
    except (OSError, ValueError, subprocess.SubprocessError):
        history = None
    _HISTORY[root] = history
    return history


def _prefix(doc: dict, revision: str, count: int) -> bytes:
    rebuilt = dict(doc)
    rebuilt["families"] = doc["families"][:count]
    rebuilt["registry_revision"] = revision
    return rendered(rebuilt)


def _pins_match(side: dict, doc) -> bool:
    return (isinstance(doc, dict) and doc.get("registry_revision") == side.get("revision")
            and isinstance(doc.get("families"), list) and len(doc["families"]) == side.get("family_count"))


def registry_history_problem(record: dict, registry: dict, index: int, root: Path) -> tuple[str, dict] | None:
    """Steps 7 and 8: (code, detail) when the record's registry pins are not this registry's own history.

    First the rebuild, from the registry being judged and then from this tree's own registry file; when neither
    proves both pins (or the row is not at the pinned position in either), the checkout's git history, when there is
    one. Each route judges the before pin first, then the after pin; the rebuild route reports the first witness
    whose row sits at the pinned position.
    """
    before, after = record["registry_before"], record["registry_after"]
    historical_row_sha = record.get("registry_row_sha256")
    history_record = record
    if record.get("postfix_correction"):
        from pm_ea_postfix_corrections import witness
        try:
            _, history_record = witness(record, root)
        except (OSError, ValueError, KeyError, TypeError, subprocess.SubprocessError) as exc:
            return "registry_after_mismatch", {"route":"postfix_correction", "reason":str(exc)}
        historical_row_sha = history_record["registry_row_sha256"]
    correction = history_record.get("registry_row_correction")
    if correction is not None:
        # FIX1/T259 repairs four wrongly dispatched owner roles after admission.
        # Original append checkpoints remain historical; only these exact
        # reviewed before/after row pairs may use the old row for that proof.
        try:
            pins = json.loads((Path(__file__).with_name("pm_ea_reviewed_owner_corrections.json")).read_text())["families"]
            pin = pins[record["event_type"]]
            valid = (isinstance(correction, dict)
                     and correction.get("authority") == "MERGE2-FIX1 finding 5 / T259"
                     and correction.get("predecessor_row_sha256") == pin["predecessor_sha256"]
                     and history_record.get("registry_row_sha256") == pin["successor_sha256"]
                     and correction.get("contract_ref") == pin["contract_ref"])
        except (OSError, ValueError, KeyError, TypeError):
            valid = False
        if not valid:
            return "registry_after_mismatch", {"route": "owner_correction", "reason": "unreviewed row correction"}
        historical_row_sha = pin["predecessor_sha256"]
    # Rebuild witnesses: the registry being judged, then (when a caller judges another registry document, as the
    # lanes' synthetic witnesses do) this tree's own registry file, with the family's row at its own position.
    witnesses = [(registry, index)]
    try:
        own = load_registry(root)
    except (OSError, ValueError):
        own = None
    if isinstance(own, dict) and own != registry and isinstance(own.get("families"), list):
        own_index = [i for i, f in enumerate(own["families"])
                     if isinstance(f, dict) and f.get("event_type") == record.get("event_type")]
        if len(own_index) == 1:
            witnesses.append((own, own_index[0]))
    # Registry states before later in-place row revisions (S5b), each proved by its revision record's own pins.
    for doc, _ in list(witnesses):
        for state in revision_states(doc, root):
            at = [i for i, f in enumerate(state["families"])
                  if isinstance(f, dict) and f.get("event_type") == record.get("event_type")]
            if len(at) == 1:
                witnesses.append((state, at[0]))
    rebuilt_before = rebuilt_after = None
    for doc, at in witnesses:
        if at == after["family_count"] - 1 and after["family_count"] <= len(doc["families"]):
            this_before = hashlib.sha256(_prefix(doc, before["revision"], before["family_count"])).hexdigest()
            this_after = hashlib.sha256(_prefix(doc, after["revision"], after["family_count"])).hexdigest()
            if this_before == before["sha256"] and this_after == after["sha256"]:
                return None
            # Report the first witness, or the first that proves the before pin (it names the after pin's mismatch).
            if rebuilt_before is None or (this_before == before["sha256"] != rebuilt_before):
                rebuilt_before, rebuilt_after = this_before, this_after
    history = _git_history(root)
    if history is None:
        # No git history here: a record whose pins predate a later registry-format change (such as one taken
        # before admission merge 1) cannot be proved in this tree and stays refused (fail-closed).
        detail = {"route": "rebuild", "git_history": "unavailable", "row_index": index,
                  "rebuilt_before_sha256": rebuilt_before, "rebuilt_after_sha256": rebuilt_after}
        if rebuilt_before is not None and rebuilt_before != before["sha256"]:
            return "registry_before_mismatch", dict(detail, pinned=before)
        return "registry_after_mismatch", dict(detail, pinned=after)
    found_after, found_before = history.get(after["sha256"]), history.get(before["sha256"])
    after_doc = json.loads(found_after.decode("utf-8")) if found_after is not None else None
    before_doc = json.loads(found_before.decode("utf-8")) if found_before is not None else None
    detail = {"route": "git_history", "registry_blobs": len(history)}
    if not _pins_match(before, before_doc):
        return "registry_before_mismatch", dict(detail, pinned=before, blob_found=before_doc is not None)
    if not (_pins_match(after, after_doc) and after_doc["families"]
            and isinstance(after_doc["families"][-1], dict)
            and after_doc["families"][-1].get("event_type") == record.get("event_type")
            and canonical_sha256(after_doc["families"][-1]) == historical_row_sha):
        return "registry_after_mismatch", dict(detail, pinned=after, blob_found=after_doc is not None)
    if canonical_sha256(before_doc["families"]) != canonical_sha256(after_doc["families"][:-1]):
        return "registry_before_mismatch", dict(detail, pinned=before, before_is_after_less_its_last_row=False)
    return None


def verdict(event_type: str, *, root: Path = ROOT, registry: dict | None = None, prepared_row: dict | None = None) -> dict:
    """The admission verdict of one family (see the module docstring for the ten steps and their codes)."""
    root = Path(root)
    registry = load_registry(root) if registry is None else registry
    families = [f for f in registry.get("families", []) if isinstance(f, dict)]
    rows = [(i, f) for i, f in enumerate(families) if f.get("event_type") == event_type]
    record_path = root / RECORD_DIR / (event_type + ".json")
    if not rows:
        if record_path.exists():
            return _refused(event_type, "admission_record_without_registration", RECORD_DIR + "/" + event_type + ".json")
        return {"event_type": event_type, "mode": "prepared"}
    # 1. One registration.
    index, row = rows[0]
    same_id = [f for f in families if f.get("family_id") == row.get("family_id")]
    if len(rows) != 1 or len(same_id) != 1:
        return _refused(event_type, "registered_more_than_once", {"rows": len(rows), "family_id_rows": len(same_id)})
    # 2. Its record.
    if not record_path.is_file():
        return _refused(event_type, "registered_without_admission_record", RECORD_DIR + "/" + event_type + ".json")
    # 3. The record is for this family, and the only one.
    try:
        record = json.loads(record_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        return _refused(event_type, "admission_record_not_for_family", "unreadable: " + str(exc))
    if not isinstance(record, dict) or record.get("event_type") != event_type:
        return _refused(event_type, "admission_record_not_for_family",
                        {"record_event_type": record.get("event_type") if isinstance(record, dict) else None})
    claims = []
    for other in sorted((root / RECORD_DIR).glob("*.json")):
        if other.name == record_path.name:
            continue
        try:
            value = json.loads(other.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(value, dict) and value.get("event_type") == event_type:
            claims.append(other.name)
    if claims:
        return _refused(event_type, "admission_record_not_for_family", {"other_records": claims})
    # 4. One family per step.
    if STEP_FIELD in record:
        return _refused(event_type, "admission_record_step_unsupported", record.get(STEP_FIELD))
    # 5. The live row is the pinned (prepared, reviewed) row.
    row_sha = canonical_sha256(row)
    if row_sha != record.get("registry_row_sha256"):
        return _refused(event_type, "registry_row_differs_from_pinned_row",
                        {"live": row_sha, "pinned": record.get("registry_row_sha256")})
    if prepared_row is not None and canonical_sha256(prepared_row) != row_sha:
        return _refused(event_type, "registry_row_differs_from_prepared_row",
                        {"prepared": canonical_sha256(prepared_row), "pinned": row_sha})
    if record.get("postfix_correction"):
        from pm_ea_postfix_corrections import problem as correction_problem
        correction_failure = correction_problem(record, root)
        if correction_failure:
            return _refused(event_type, *correction_failure)
    # 6. Complete under the frozen seal check's own record predicate.
    frozen = frozen_module(root)
    try:
        problems = frozen.admission_record_problems(record, row)
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as exc:
        problems = ["malformed: " + str(exc)]
    if problems:
        return _refused(event_type, "admission_record_incomplete", problems)
    # 7 and 8. Both registry pins are this registry's own history.
    problem = registry_history_problem(record, registry, index, root)
    if problem is not None:
        return _refused(event_type, *problem)
    # 9. The decision entry pins this admission.
    number = record["decision_ref"].split("#", 1)[1]
    section = frozen.decision_section_bytes(root / DECISION_LOG, number)
    before, after = record["registry_before"], record["registry_after"]
    tokens = [record["registry_row_sha256"], before["revision"], before["sha256"], after["revision"], after["sha256"]]
    missing = [token for token in tokens if token.encode("utf-8") not in section]
    if missing:
        return _refused(event_type, "decision_entry_does_not_pin_admission", {"decision": number, "missing": missing})
    # 10. The landing record.
    landing = record.get("admission_landing")
    landing_rel = landing.get("record") if isinstance(landing, dict) else None
    landing_path = root / landing_rel if isinstance(landing_rel, str) and ".." not in Path(landing_rel).parts else None
    if (landing_path is None or not landing_path.is_file()
            or event_type.encode("utf-8") not in landing_path.read_bytes()):
        return _refused(event_type, "admission_landing_record_missing", landing_rel)
    return {"event_type": event_type, "mode": "admitted", "family_id": row["family_id"],
            "family_revision": row.get("family_revision"), "row_index": index, "row_sha256": row_sha,
            "record": RECORD_DIR + "/" + event_type + ".json",
            "record_sha256": hashlib.sha256(record_path.read_bytes()).hexdigest(),
            "decision_ref": record["decision_ref"], "registry_before": copy.deepcopy(before),
            "registry_after": copy.deepcopy(after), "landing_record": landing_rel}


def verdicts(event_types, *, root: Path = ROOT, registry: dict | None = None, prepared_rows: dict | None = None) -> dict:
    """{event_type: verdict} over one registry read."""
    root = Path(root)
    registry = load_registry(root) if registry is None else registry
    prepared_rows = prepared_rows or {}
    return {et: verdict(et, root=root, registry=registry, prepared_row=prepared_rows.get(et))
            for et in sorted(set(event_types))}


def problem(event_type: str, **kwargs) -> str | None:
    """None when the family is prepared or admitted; otherwise the refusal code."""
    result = verdict(event_type, **kwargs)
    return result["code"] if result["mode"] == "refused" else None


def summary(results: dict) -> dict:
    """Counts by mode and the refusals, for a checker's JSON output."""
    out = {"prepared": sorted(et for et, v in results.items() if v["mode"] == "prepared"),
           "admitted": sorted(et for et, v in results.items() if v["mode"] == "admitted"),
           "refused": [{"event_type": et, "code": v["code"], "detail": v["detail"]}
                       for et, v in sorted(results.items()) if v["mode"] == "refused"]}
    out["counts"] = {mode: len(out[mode]) for mode in ("prepared", "admitted", "refused")}
    return out


def gate_failures(results: dict) -> list[str]:
    """One failure line per refused family: '<event_type>: admission mode refused: <code>'."""
    return [et + ": admission mode refused: " + v["code"] for et, v in sorted(results.items()) if v["mode"] == "refused"]


def lane_gate(event_types, root: Path = ROOT) -> tuple[dict, list[str]]:
    """(summary, failure lines) of the admission gate a lane checker adds to its own result.

    A checker whose oracles model registry membership synthetically (membership ABSENT) calls this once over its
    families: prepared and admitted families pass, and every refused family fails the run with its code.
    """
    results = verdicts(event_types, root=root)
    return summary(results), gate_failures(results)


def inputs(event_types, root: Path = ROOT) -> list[str]:
    """Repository-relative paths a disposable copy of the tree needs for these verdicts."""
    root = Path(root)
    paths = {REGISTRY, DECISION_LOG, FROZEN, POST_AUGUST_RECEIPT, "scripts/pm_ea_admission_mode.py",
             "scripts/pm_ea_reviewed_owner_corrections.json"}
    paths.update(str(p.relative_to(root)) for p in sorted((root / RECORD_DIR).glob("*.json")))
    # Revision records rebuild the registry states before later in-place row revisions (revision_states).
    revisions = [p for d in sorted(root.glob(REVISION_DIR_GLOB)) for p in sorted(d.glob("*.json"))]
    paths.update(str(p.relative_to(root)) for p in revisions)
    for path in revisions:
        try:
            manifest = json.loads(path.read_text(encoding="utf-8")).get("manifest")
        except (OSError, ValueError, AttributeError):
            continue
        if isinstance(manifest, dict) and isinstance(manifest.get("path"), str):
            paths.add(manifest["path"])
    for et in event_types:
        path = root / RECORD_DIR / (et + ".json")
        if not path.is_file():
            continue
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except ValueError:
            continue
        depth = record.get("depth_assessment") if isinstance(record, dict) else None
        if isinstance(depth, dict) and isinstance(depth.get("path"), str):
            paths.add(depth["path"])
        landing = record.get("admission_landing") if isinstance(record, dict) else None
        if isinstance(landing, dict) and isinstance(landing.get("record"), str):
            paths.add(landing["record"])
    return sorted(p for p in paths if (root / p).exists())


# --- registered-row revisions (S5b; DL-2435..DL-2442 and later) ------------------------------------------------
#
# A family already on the registry can have its row revised in place to a lane's pinned prepared successor
# (scripts/pm-ea-registered-revision-writer.py). Such a revision has no DL-077 record; it has its own applied
# revision record, reports/event-authority-*/<merge>/revisions/<event_type>.json. ``revision_verdict`` judges one
# family against the lane's own pinned successor row and the predecessor pins the lane says it replaces:
#
# ``unrevised``  no revision record names the family and the live row is not the successor: the lane keeps
#                judging the live row as the predecessor, exactly as before the revision.
# ``revised``    the live row is byte-equal (canonical JSON) to the pinned successor and to its revision record's
#                row, and the record is complete and matches (steps below). ``before_row`` is the predecessor the
#                record proves the revision replaced; the lane judges it with its own predecessor checks.
# ``refused``    anything else; ``code`` names the first problem:
#
#  R1 exactly one registry row has the event type; no other row has its family_id    revision_family_not_registered_once
#  R2 the live row is the successor but no revision record names the family           revised_without_revision_record
#  R3 exactly one revision record names the family, it is one JSON object of the
#     revision schema, its row and its one assessment row are this family's          revision_record_not_for_family
#  R4 a record names the family while the live row is still the record's predecessor  revision_record_without_revision
#  R5 the live row equals the lane's pinned prepared successor                        registry_row_differs_from_prepared_successor
#  R6 the live row equals the record's registry_row                                   registry_row_differs_from_revision_row
#  R7 the record's before_row is this family (same family_id) with the lane's
#     predecessor family_revision and payload_schema_id, and differs from the row     revision_predecessor_mismatch
#  R8 complete: NOT_RUN, the 12 frozen criteria all PASS with Plans evidence, the
#     assessment row names the live family_id and revision, both pins well formed
#     with the count unchanged and the hash changed                                   revision_record_incomplete
#  R9 the revision manifest it pins exists with that SHA-256 and names this exact
#     predecessor hash and successor row                                              revision_manifest_mismatch
# R10 registry_before is this registry's own history: the after blob with this one
#     row replaced by before_row, at the pinned revision                             revision_registry_before_mismatch
# R11 registry_after is too, with the successor row in place                         revision_registry_after_mismatch
# R12 the decision entry names the record, its SHA-256, the row hash and both pins   revision_decision_does_not_pin
#
# R10 and R11 rebuild first (the registry judged, then this tree's own registry file); when a later revision or
# admission changed the registry, the exact blobs are read from the checkout's own git history (read-only, as for
# steps 7 and 8 above). Without git history a record that cannot be rebuilt stays refused (fail-closed).

REVISION_DIR_GLOB = "reports/event-authority-*/*/revisions"
REVISION_SCHEMA = "pm.assurance.event_authority.registered_revision_depth.v1"
REVISION_KIND = "registered_family_twelve_criteria"

REVISION_CODES = (
    "revision_family_not_registered_once",
    "revised_without_revision_record",
    "revision_record_not_for_family",
    "revision_record_without_revision",
    "registry_row_differs_from_prepared_successor",
    "registry_row_differs_from_revision_row",
    "revision_predecessor_mismatch",
    "revision_record_incomplete",
    "revision_manifest_mismatch",
    "revision_registry_before_mismatch",
    "revision_registry_after_mismatch",
    "revision_decision_does_not_pin",
)


def _revision_refused(event_type: str, code: str, detail) -> dict:
    assert code in REVISION_CODES, code
    return {"event_type": event_type, "mode": "refused", "code": code, "detail": detail}


def revision_records(event_type: str, root: Path = ROOT) -> list[str]:
    """Repository-relative revision records that name ``event_type`` (by file name or by content)."""
    root = Path(root)
    found = []
    for directory in sorted(root.glob(REVISION_DIR_GLOB)):
        for path in sorted(directory.glob("*.json")):
            named = path.name == event_type + ".json"
            if not named:
                try:
                    value = json.loads(path.read_text(encoding="utf-8"))
                except (OSError, ValueError):
                    continue
                named = isinstance(value, dict) and (
                    value.get("event_type") == event_type
                    or (isinstance(value.get("registry_row"), dict) and value["registry_row"].get("event_type") == event_type))
            if named:
                found.append(str(path.relative_to(root)))
    return found


def _replaced(doc: dict, event_type: str, row: dict, revision: str) -> bytes | None:
    """``doc`` at ``revision`` with the family's one row replaced by ``row``; None when the family is not there once."""
    at = [i for i, f in enumerate(doc["families"]) if isinstance(f, dict) and f.get("event_type") == event_type]
    if len(at) != 1:
        return None
    rebuilt = dict(doc)
    rebuilt["families"] = list(doc["families"])
    rebuilt["families"][at[0]] = row
    rebuilt["registry_revision"] = revision
    return rendered(rebuilt)


def revision_states(doc: dict, root: Path = ROOT) -> list[dict]:
    """Registry states before each in-place row revision, newest first, rebuilt from ``doc`` without git.

    A revision record applies to a state only when that state's first N rows at the record's after revision render
    to its after SHA-256; the earlier state is that prefix with the record's row replaced by its before_row, and it
    must render to the record's before SHA-256 with the count unchanged. Every state is therefore exactly the bytes
    its pins name; a record that does not apply ends the chain there. Callers still compare every rebuilt registry
    with the pins of the record they judge, so a state is only ever a candidate witness.
    """
    root = Path(root).resolve()
    if not isinstance(doc, dict) or not isinstance(doc.get("families"), list):
        return []
    key = (root, hashlib.sha256(rendered(doc)).hexdigest())
    if key in _STATES:
        return _STATES[key]
    pending = []
    for directory in sorted(root.glob(REVISION_DIR_GLOB)):
        for path in sorted(directory.glob("*.json")):
            try:
                rec = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
            if (isinstance(rec, dict) and isinstance(rec.get("registry_row"), dict) and isinstance(rec.get("before_row"), dict)
                    and all(isinstance(rec.get(s), dict) and type(rec[s].get("family_count")) is int
                            and isinstance(rec[s].get("revision"), str) and isinstance(rec[s].get("sha256"), str)
                            for s in ("registry_before", "registry_after"))):
                pending.append(rec)
    from pm_ea_postfix_corrections import prior_states
    states = prior_states(doc, root)
    current = states[-1] if states else doc
    # The four FIX1 owner-role corrections follow S5b. Reconstruct that exact
    # prior registry first so earlier append proofs still work without Git.
    # Both complete registry hashes and every corrected row pair are pinned;
    # an unknown edit cannot disappear from a historical comparison.
    try:
        corrections = json.loads((root / "scripts/pm_ea_reviewed_owner_corrections.json").read_text())
        after, before = corrections["registry_after"], corrections["registry_before"]
        if (len(current["families"]) >= after["family_count"]
                and hashlib.sha256(_prefix(current, after["revision"], after["family_count"])).hexdigest() == after["sha256"]):
            earlier = copy.deepcopy(dict(current, families=current["families"][:after["family_count"]]))
            for event, pin in corrections["families"].items():
                at = [i for i, row in enumerate(earlier["families"]) if row.get("event_type") == event]
                if len(at) != 1 or canonical_sha256(earlier["families"][at[0]]) != pin["successor_sha256"]:
                    raise ValueError("owner correction successor not exact")
                if canonical_sha256(pin["predecessor_row"]) != pin["predecessor_sha256"]:
                    raise ValueError("owner correction predecessor not exact")
                earlier["families"][at[0]] = copy.deepcopy(pin["predecessor_row"])
            earlier["registry_revision"] = before["revision"]
            if (len(earlier["families"]) != before["family_count"]
                    or hashlib.sha256(rendered(earlier)).hexdigest() != before["sha256"]):
                raise ValueError("owner correction registry predecessor not exact")
            states.append(earlier)
            current = earlier
    except (OSError, ValueError, KeyError, TypeError):
        pass  # No witness from this path; all callers still require exact pins.
    while pending:
        for rec in pending:
            after, before = rec["registry_after"], rec["registry_before"]
            if before["family_count"] != after["family_count"] or len(current["families"]) < after["family_count"]:
                continue
            if hashlib.sha256(_prefix(current, after["revision"], after["family_count"])).hexdigest() != after["sha256"]:
                continue
            prefix = dict(current, families=current["families"][:after["family_count"]])
            earlier = _replaced(prefix, rec["registry_row"].get("event_type"), rec["before_row"], before["revision"])
            if earlier is None or hashlib.sha256(earlier).hexdigest() != before["sha256"]:
                continue
            current = json.loads(earlier.decode("utf-8"))
            states.append(current)
            pending.remove(rec)
            break
        else:
            break
    _STATES[key] = states
    return states


def revision_history_problem(record: dict, registry: dict, event_type: str, root: Path) -> tuple[str, dict] | None:
    """R10 and R11: (code, detail) when the record's pins are not this registry's own history of this revision."""
    before, after = record["registry_before"], record["registry_after"]
    witnesses = [registry]
    try:
        own = load_registry(root)
    except (OSError, ValueError):
        own = None
    if isinstance(own, dict) and own != registry and isinstance(own.get("families"), list):
        witnesses.append(own)
    witnesses += [state for doc in list(witnesses) for state in revision_states(doc, root)]
    after_proved = False
    for doc in witnesses:
        if len(doc.get("families", [])) < after["family_count"]:
            continue
        doc = dict(doc, families=doc["families"][:after["family_count"]])
        rebuilt_after = _replaced(doc, event_type, record["registry_row"], after["revision"])
        rebuilt_before = _replaced(doc, event_type, record["before_row"], before["revision"])
        if rebuilt_after is None or rebuilt_before is None or hashlib.sha256(rebuilt_after).hexdigest() != after["sha256"]:
            continue
        if hashlib.sha256(rebuilt_before).hexdigest() == before["sha256"]:
            return None
        after_proved = True
    history = _git_history(root)
    if history is None:
        detail = {"route": "rebuild", "git_history": "unavailable", "after_pin_rebuilt": after_proved}
        if after_proved:
            return "revision_registry_before_mismatch", dict(detail, pinned=before)
        return "revision_registry_after_mismatch", dict(detail, pinned=after)
    found_after, found_before = history.get(after["sha256"]), history.get(before["sha256"])
    after_doc = json.loads(found_after.decode("utf-8")) if found_after is not None else None
    before_doc = json.loads(found_before.decode("utf-8")) if found_before is not None else None
    detail = {"route": "git_history", "registry_blobs": len(history)}

    def only(doc):
        rows = [f for f in doc["families"] if isinstance(f, dict) and f.get("event_type") == event_type]
        return rows[0] if len(rows) == 1 else None

    if not (_pins_match(after, after_doc) and only(after_doc) is not None
            and canonical_sha256(only(after_doc)) == canonical_sha256(record["registry_row"])):
        return "revision_registry_after_mismatch", dict(detail, pinned=after, blob_found=after_doc is not None)
    if not (_pins_match(before, before_doc) and only(before_doc) is not None
            and canonical_sha256(only(before_doc)) == canonical_sha256(record["before_row"])):
        return "revision_registry_before_mismatch", dict(detail, pinned=before, blob_found=before_doc is not None)
    expected = [record["before_row"] if isinstance(f, dict) and f.get("event_type") == event_type else f
                for f in after_doc["families"]]
    if canonical_sha256(before_doc["families"]) != canonical_sha256(expected):
        return "revision_registry_before_mismatch", dict(detail, pinned=before, before_is_after_with_predecessor=False)
    return None


def revision_verdict(event_type: str, *, successor_row: dict, predecessor: dict, root: Path = ROOT,
                     registry: dict | None = None) -> dict:
    """The revision verdict of one registered family against a lane's pinned successor (R1-R12 above).

    ``predecessor`` is the lane's own pin of the row it replaces: ``family_revision`` and ``payload_schema_id``.
    """
    root = Path(root)
    registry = load_registry(root) if registry is None else registry
    families = [f for f in registry.get("families", []) if isinstance(f, dict)]
    rows = [f for f in families if f.get("event_type") == event_type]
    same_id = [f for f in families if rows and f.get("family_id") == rows[0].get("family_id")]
    # R1. One registration.
    if len(rows) != 1 or len(same_id) != 1:
        return _revision_refused(event_type, "revision_family_not_registered_once",
                                 {"rows": len(rows), "family_id_rows": len(same_id)})
    row = rows[0]
    row_sha = canonical_sha256(row)
    is_successor = row_sha == canonical_sha256(successor_row)
    # R2. The record.
    paths = revision_records(event_type, root)
    if not paths:
        if is_successor:
            return _revision_refused(event_type, "revised_without_revision_record", REVISION_DIR_GLOB + "/" + event_type + ".json")
        return {"event_type": event_type, "mode": "unrevised"}
    # R3. One record, for this family.
    if len(paths) != 1:
        return _revision_refused(event_type, "revision_record_not_for_family", {"records": paths})
    record_path = root / paths[0]
    try:
        record = json.loads(record_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        return _revision_refused(event_type, "revision_record_not_for_family", "unreadable: " + str(exc))
    assessed = record.get("rows") if isinstance(record, dict) else None
    if (not isinstance(record, dict) or record.get("schema_id") != REVISION_SCHEMA
            or record_path.name != event_type + ".json"
            or not isinstance(record.get("registry_row"), dict) or record["registry_row"].get("event_type") != event_type
            or not isinstance(record.get("before_row"), dict)
            or not isinstance(assessed, list) or len(assessed) != 1 or not isinstance(assessed[0], dict)
            or assessed[0].get("event_type") != event_type):
        return _revision_refused(event_type, "revision_record_not_for_family", {"record": paths[0]})
    # R4. A record without its revision.
    if not is_successor and row_sha == canonical_sha256(record["before_row"]):
        return _revision_refused(event_type, "revision_record_without_revision", {"record": paths[0], "live": row_sha})
    # R5 and R6. The live row is the pinned successor and the record's row.
    if not is_successor:
        return _revision_refused(event_type, "registry_row_differs_from_prepared_successor",
                                 {"live": row_sha, "prepared": canonical_sha256(successor_row)})
    if row_sha != canonical_sha256(record["registry_row"]):
        return _revision_refused(event_type, "registry_row_differs_from_revision_row",
                                 {"live": row_sha, "record": canonical_sha256(record["registry_row"])})
    # R7. The predecessor the lane pins.
    before_row = record["before_row"]
    if (before_row.get("event_type") != event_type or before_row.get("family_id") != row.get("family_id")
            or before_row.get("family_revision") != predecessor.get("family_revision")
            or before_row.get("payload_schema_id") != predecessor.get("payload_schema_id")
            or canonical_sha256(before_row) == row_sha):
        return _revision_refused(event_type, "revision_predecessor_mismatch",
                                 {"before_family_revision": before_row.get("family_revision"),
                                  "before_payload_schema_id": before_row.get("payload_schema_id"),
                                  "pinned": {k: predecessor.get(k) for k in ("family_revision", "payload_schema_id")}})
    # R8. Complete.
    frozen = frozen_module(root)
    problems = []
    if record.get("native_execution") != "NOT_RUN" or record.get("assessment_kind") != REVISION_KIND:
        problems.append("assessment_kind")
    if assessed[0].get("family_id") != row.get("family_id") or assessed[0].get("family_revision") != row.get("family_revision"):
        problems.append("assessment_row")
    cells = assessed[0].get("cells")
    if not isinstance(cells, dict) or set(cells) != set(frozen.EVIDENCE_FIELDS):
        problems.append("criteria")
    else:
        for field in frozen.EVIDENCE_FIELDS:
            cell = cells[field]
            evidence = cell.get("evidence") if isinstance(cell, dict) else None
            if not isinstance(cell, dict) or cell.get("status") != "PASS":
                problems.append("not_pass:" + field)
            elif not any(isinstance(e, dict) and str(e.get("path", "")).startswith("Plans/")
                         for e in (evidence if isinstance(evidence, list) else [])):
                problems.append("pass_without_plans_evidence:" + field)
    sides = [record.get("registry_before"), record.get("registry_after")]
    if not all(isinstance(s, dict) and isinstance(s.get("revision"), str) and s["revision"]
               and isinstance(s.get("sha256"), str) and re.fullmatch(r"[0-9a-f]{64}", s["sha256"])
               and type(s.get("family_count")) is int for s in sides):
        problems.append("registry_pins")
    elif sides[0]["family_count"] != sides[1]["family_count"] or sides[0]["sha256"] == sides[1]["sha256"]:
        problems.append("registry_pins_not_one_row_revision")
    if problems:
        return _revision_refused(event_type, "revision_record_incomplete", problems)
    # R9. The revision manifest.
    manifest = record.get("manifest")
    manifest_rel = manifest.get("path") if isinstance(manifest, dict) else None
    manifest_path = (root / manifest_rel if isinstance(manifest_rel, str) and manifest_rel.startswith("reports/")
                     and ".." not in Path(manifest_rel).parts else None)
    entries = []
    if manifest_path is not None and manifest_path.is_file() and hashlib.sha256(manifest_path.read_bytes()).hexdigest() == manifest.get("sha256"):
        try:
            entries = [e for e in json.loads(manifest_path.read_text(encoding="utf-8")).get("revisions", [])
                       if isinstance(e, dict) and e.get("event_type") == event_type]
        except (OSError, ValueError, AttributeError):
            entries = []
    if not (len(entries) == 1 and entries[0].get("before_row_sha256") == canonical_sha256(before_row)
            and isinstance(entries[0].get("registry_row"), dict) and canonical_sha256(entries[0]["registry_row"]) == row_sha):
        return _revision_refused(event_type, "revision_manifest_mismatch", manifest_rel)
    # R10 and R11. Both registry pins are this registry's own history of this revision.
    problem = revision_history_problem(record, registry, event_type, root)
    if problem is not None:
        return _revision_refused(event_type, *problem)
    # R12. The decision entry pins this revision.
    match = re.fullmatch(r"Plans/Decision_Log\.md#(DL-[0-9]+)", str(record.get("decision_ref", "")))
    try:
        section = frozen.decision_section_bytes(root / DECISION_LOG, match.group(1)) if match else b""
    except ValueError:
        section = b""
    record_sha = hashlib.sha256(record_path.read_bytes()).hexdigest()
    before, after = record["registry_before"], record["registry_after"]
    tokens = [event_type, paths[0], record_sha, row_sha, before["revision"], before["sha256"], after["revision"], after["sha256"]]
    missing = [token for token in tokens if token.encode("utf-8") not in section]
    if not section or missing:
        return _revision_refused(event_type, "revision_decision_does_not_pin",
                                 {"decision": record.get("decision_ref"), "missing": missing})
    return {"event_type": event_type, "mode": "revised", "family_id": row["family_id"],
            "family_revision": row.get("family_revision"), "row_sha256": row_sha, "record": paths[0],
            "record_sha256": record_sha, "decision_ref": record["decision_ref"], "before_row": copy.deepcopy(before_row),
            "registry_before": copy.deepcopy(before), "registry_after": copy.deepcopy(after)}


def revised_predecessor_rows(root: Path = ROOT, registry: dict | None = None) -> list[dict]:
    """The predecessor row of every in-place revision whose applied revision record is exact and complete.

    Each record is judged by revision_verdict against its own successor row and predecessor pins (R1-R12). A reader
    that keeps the historically registered selections (births written under the replaced row, such as the S3 v2
    reader) adds exactly these rows to the live ones. A revision without its exact record adds nothing.
    """
    root = Path(root)
    registry = load_registry(root) if registry is None else registry
    rows = []
    for directory in sorted(root.glob(REVISION_DIR_GLOB)):
        for path in sorted(directory.glob("*.json")):
            try:
                record = json.loads(path.read_text(encoding="utf-8"))
                event_type, successor, before = record["registry_row"]["event_type"], record["registry_row"], record["before_row"]
            except (OSError, ValueError, KeyError, TypeError):
                continue
            if not (isinstance(event_type, str) and isinstance(successor, dict) and isinstance(before, dict)):
                continue
            mode = revision_verdict(event_type, root=root, registry=registry, successor_row=successor, predecessor=before)
            if mode["mode"] == "revised":
                rows.append(mode["before_row"])
    return rows


def main(argv=None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    out = None
    if "--json" in args:
        at = args.index("--json")
        out = Path(args[at + 1])
        del args[at:at + 2]
    registry = load_registry(ROOT)
    names = args or sorted({p.stem for p in (ROOT / RECORD_DIR).glob("*.json")})
    results = verdicts(names, registry=registry)
    report = {"status": "pass" if not gate_failures(results) else "fail", "registry_revision": registry["registry_revision"],
              "families": len(registry["families"]), **summary(results), "native_execution": "NOT_RUN"}
    text = json.dumps(report, indent=1, ensure_ascii=False)
    if out is not None:
        out.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
